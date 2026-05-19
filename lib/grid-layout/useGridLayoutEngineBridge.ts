import { compactType } from "../utils";
import type { CompactType, Layout } from "../utils";
import {
  compareWithLegacyLayout,
  createInteractionController,
  createInteractionScheduler,
  createLayoutExecutor,
  executeLayoutOperation
} from "../layout-engine";
import type {
  GridLayoutEngineOptions,
  GridLayoutEngineProp,
  InteractionController,
  LayoutOperation,
  LayoutOperationRequest,
  LayoutOperationResult
} from "../layout-engine";

type GridLayoutEngineBridgeProps = {
  layoutEngine?: false | GridLayoutEngineProp;
  cols: number;
  maxRows: number;
  compactType: CompactType;
  verticalCompact: boolean;
  allowOverlap: boolean;
  preventCollision: boolean;
};

type UseGridLayoutEngineBridgeOptions = {
  props: GridLayoutEngineBridgeProps;
  getLayout: () => Layout;
};

export function useGridLayoutEngineBridge({
  props,
  getLayout
}: UseGridLayoutEngineBridgeOptions) {
  const getLayoutEngineProp = () =>
    props.layoutEngine && typeof props.layoutEngine === "object"
      ? props.layoutEngine
      : null;

  const isLegacyLayoutEngine = () => {
    const config = getLayoutEngineProp();
    return props.layoutEngine === false || config?.mode === "legacy";
  };

  let executorConfigRef: unknown = undefined;
  let layoutExecutor = createLayoutExecutor();

  const getLayoutExecutor = () => {
    const config = getLayoutEngineProp();
    const nextExecutorConfig = config?.executor;
    if (nextExecutorConfig !== executorConfigRef) {
      layoutExecutor.dispose?.();
      layoutExecutor = createLayoutExecutor(nextExecutorConfig);
      executorConfigRef = nextExecutorConfig;
    }
    return layoutExecutor;
  };

  let schedulerConfigRef: unknown = undefined;
  let interactionScheduler = createInteractionScheduler();

  const getInteractionScheduler = () => {
    const config = getLayoutEngineProp();
    const nextSchedulerConfig = config?.scheduler;
    if (nextSchedulerConfig !== schedulerConfigRef) {
      interactionScheduler.cancel("scheduler reconfigured");
      interactionScheduler = createInteractionScheduler(nextSchedulerConfig);
      schedulerConfigRef = nextSchedulerConfig;
    }
    return interactionScheduler;
  };

  const getLayoutEngineOptions = (): GridLayoutEngineOptions => {
    const config = getLayoutEngineProp();
    return {
      cols: props.cols,
      maxRows: props.maxRows,
      compactType: compactType(props),
      allowOverlap: props.allowOverlap,
      preventCollision: props.preventCollision,
      scheduler: config?.scheduler,
      executor: getLayoutExecutor(),
      compareLegacy: config?.compareLegacy,
      legacyFallback: config?.legacyFallback !== false,
      diagnostics: config?.diagnostics,
      onEvent: config?.onEvent
    };
  };

  let interactionController: InteractionController = createInteractionController(
    getLayout(),
    getLayoutEngineOptions()
  );

  const reset = (layout: Layout = getLayout()) => {
    interactionController.dispose();
    interactionController = createInteractionController(layout, getLayoutEngineOptions());
  };

  const maybeReportLegacyMismatch = (
    request: LayoutOperationRequest,
    result: LayoutOperationResult
  ) => {
    if (!getLayoutEngineOptions().compareLegacy) return;
    if (request.phase === "preview" && result.diagnostics?.schedulerMode === "commitOnly") return;
    const comparison = compareWithLegacyLayout(request, result);
    if (!comparison.matches) {
      getLayoutEngineOptions().onEvent?.({
        type: "legacy-mismatch",
        id: request.id,
        message: "VueGridLayout layout engine result differs from legacy path",
        diagnostics: result.diagnostics,
        details: comparison.differences
      });
    }
  };

  const maybeEmitExecutorOperation = (
    request: LayoutOperationRequest,
    result: LayoutOperationResult,
    usedExecutor: boolean
  ) => {
    if (!usedExecutor || result.diagnostics?.executorKind !== "worker") return;
    getLayoutEngineOptions().onEvent?.({
      type: "operation",
      id: result.id,
      operationType: request.operation.type,
      phase: request.phase,
      diagnostics: result.diagnostics
    });
  };

  const shouldUseExecutor = (request: LayoutOperationRequest): boolean => {
    const executor = getLayoutExecutor();
    if (executor.kind === "main-thread") return false;
    if (
      request.phase === "preview" &&
      (request.operation.type === "move" || request.operation.type === "resize")
    ) {
      return false;
    }
    return (
      request.phase === "commit" ||
      Boolean(request.heavy) ||
      request.operation.type === "dropFit" ||
      request.operation.type === "generateResponsiveLayout"
    );
  };

  const executeScheduledRequest = (
    request: LayoutOperationRequest
  ): LayoutOperationResult | Promise<LayoutOperationResult> => {
    if (shouldUseExecutor(request)) {
      return getLayoutExecutor().execute(request);
    }
    return executeLayoutOperation(request);
  };

  const scheduleEngineRequest = (
    request: LayoutOperationRequest,
    apply: (result: LayoutOperationResult) => void
  ): LayoutOperationResult | null => {
    let immediateResult: LayoutOperationResult | null = null;
    const usedExecutor = shouldUseExecutor(request);
    getInteractionScheduler().schedule(
      request,
      executeScheduledRequest,
      result => {
        const applied = interactionController.applyAsyncResult(result);
        getInteractionScheduler().recordDuration(applied.diagnostics?.durationMs || 0);
        maybeEmitExecutorOperation(request, applied, usedExecutor);
        maybeReportLegacyMismatch(request, applied);
        apply(applied);
        immediateResult = applied;
      }
    );
    return immediateResult;
  };

  const preview = (
    id: string,
    operation: LayoutOperation,
    apply: (result: LayoutOperationResult) => void,
    heavy = false
  ): LayoutOperationResult | null => {
    const request = {
      id,
      operation,
      baseRevision: interactionController.getState().interaction?.startRevision,
      heavy
    };
    return scheduleEngineRequest(interactionController.preparePreview(request), apply);
  };

  const commit = (
    id: string,
    operation: LayoutOperation,
    apply: (result: LayoutOperationResult) => void,
    heavy = false
  ): LayoutOperationResult | null => {
    const request = {
      id,
      operation,
      baseRevision: interactionController.getState().interaction?.startRevision,
      heavy
    };
    return scheduleEngineRequest(interactionController.prepareCommit(request), apply);
  };

  const dispose = (reason = "component disposed") => {
    interactionScheduler.cancel(reason);
    layoutExecutor.dispose?.();
    interactionController.dispose();
  };

  return {
    getLayoutEngineProp,
    getLayoutEngineOptions,
    isLegacyLayoutEngine,
    reset,
    start: (interaction: Parameters<InteractionController["start"]>[0]) =>
      interactionController.start(interaction),
    rebase: (layout: Layout) => interactionController.rebase(layout),
    getCommitted: () => interactionController.getCommitted(),
    preview,
    commit,
    dispose
  };
}
