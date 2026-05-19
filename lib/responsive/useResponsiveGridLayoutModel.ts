import { Fragment, markRaw, nextTick, onBeforeUnmount, onMounted, reactive, toRef, watch, type Ref, type VNode } from "vue";
import { deepEqual } from "fast-equals";
import { pick } from "lodash";
import {
  cloneLayout,
  compactType as resolveCompactType,
  getNonFragmentChildren,
  synchronizeLayoutWithChildren
} from "../utils";
import type { CompactType, Layout } from "../utils";
import {
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
  getColsFromBreakpoint
} from "../responsiveUtils";
import type { Breakpoints, ResponsiveLayout } from "../responsiveUtils";
import {
  cloneLayoutsMap,
  useGridLayoutPersistence,
  type LayoutPersistenceEvent,
  type ResponsiveGridLayoutPersistenceProp
} from "../persistence";
import {
  createLayoutExecutor,
  executeLayoutOperation
} from "../layout-engine";
import type {
  GridLayoutEngineOptions,
  GridLayoutEngineProp,
  LayoutOperation,
  LayoutOperationResult
} from "../layout-engine";
import { createGridEditorController } from "../editor";
import type { GridEditorController, GridEditorProp } from "../editor";

export interface BreakpointMap {
  [key: string]: number;
}

export interface MarginPaddingMap {
  [key: string]: [number, number] | null;
}

export interface LayoutsMap {
  [key: string]: Layout;
}

type ResponsiveGridLayoutState = {
  layout: Layout,
  breakpoint: string,
  cols: number,
  layouts: LayoutsMap
};

export interface ResponsiveGridLayoutModelProps<Breakpoint extends string = string> {
  allowOverlap: boolean;
  breakpoint?: Breakpoint | string | null;
  breakpoints: Breakpoints<Breakpoint> | BreakpointMap;
  cols: Record<Breakpoint, number> | BreakpointMap;
  compactType: CompactType;
  containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
  editor?: false | GridEditorProp;
  layoutEngine?: false | GridLayoutEngineProp;
  layouts: ResponsiveLayout<Breakpoint> | LayoutsMap;
  margin: Record<Breakpoint, [number, number] | null> | [number, number];
  persistence?: ResponsiveGridLayoutPersistenceProp;
  verticalCompact: boolean;
  width: number;
}

type ResponsiveEmit = (
  event: "update:layouts" | "layoutChange" | "breakpointChange" | "widthChange",
  ...args: unknown[]
) => void;

type UseResponsiveGridLayoutModelOptions = {
  props: ResponsiveGridLayoutModelProps;
  slots: {
    default?: () => VNode[];
  };
  emit: ResponsiveEmit;
};

const unsupportedLayoutResult = (
  id: string,
  layout: Layout,
  operation: LayoutOperation
): LayoutOperationResult => ({
  id,
  status: "blocked",
  layout,
  patches: [],
  affectedIds: [],
  collisions: [],
  blocked: {
    reason: "unsupported",
    itemIds: operation.type === "groupMove"
      ? operation.ids
      : "id" in operation
        ? [operation.id]
        : []
  },
  diagnostics: {
    operationId: id,
    operationType: operation.type,
    phase: "commit",
    layoutSize: layout.length,
    affectedCount: 0,
    collisionCount: 0,
    indexHit: false,
    executorKind: "main-thread",
    durationMs: 0
  }
});

export function getIndentationValue<T extends Array<number> | null>(
  param: { [key: string]: T } | T,
  breakpoint: string
): T | null {
  if (param == null) return null;
  return Array.isArray(param) ? param : param[breakpoint];
}

export function useResponsiveGridLayoutModel({
  props,
  slots,
  emit
}: UseResponsiveGridLayoutModelOptions) {
  const generateInitialState = (): ResponsiveGridLayoutState => {
    const { width, breakpoints, layouts, cols } = props;
    const breakpoint = props.breakpoint || getBreakpointFromWidth(breakpoints, width);
    const colNo = getColsFromBreakpoint(breakpoint, cols);
    const compactType = resolveCompactType(props);
    const initialLayout = findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      breakpoint,
      breakpoint,
      colNo,
      compactType
    );

    return {
      layout: initialLayout,
      breakpoint,
      cols: colNo,
      layouts: {
        ...layouts,
        [breakpoint]: initialLayout
      }
    };
  };

  const state = reactive(generateInitialState());
  let restoringPersistence = false;

  const applyRestoredLayouts = (layouts: LayoutsMap) => {
    restoringPersistence = true;
    const restoredLayouts = cloneLayoutsMap(layouts);
    const layout = findOrGenerateResponsiveLayout(
      restoredLayouts,
      props.breakpoints,
      state.breakpoint,
      state.breakpoint,
      state.cols,
      resolveCompactType(props)
    );
    const nextLayouts = {
      ...restoredLayouts,
      [state.breakpoint]: layout
    };
    state.layout = markRaw(layout);
    state.layouts = nextLayouts;
    emit("update:layouts", nextLayouts);
    emit("layoutChange", layout, nextLayouts);
    void nextTick().then(() => {
      restoringPersistence = false;
    });
  };

  const persistenceConfig = props.persistence && typeof props.persistence === "object"
    ? props.persistence
    : null;

  const onPersistenceEvent = (event: LayoutPersistenceEvent<LayoutsMap>) => {
    if (event.type === "external-apply") {
      applyRestoredLayouts(event.value);
    }
    persistenceConfig?.onEvent?.(event);
  };

  const persistenceController = persistenceConfig
    ? useGridLayoutPersistence<LayoutsMap>({
        ...persistenceConfig,
        onEvent: onPersistenceEvent,
        kind: "responsive",
        target: toRef(state, "layouts") as Ref<LayoutsMap>,
        watchTarget: false
      })
    : null;

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

  const getLayoutEngineOptions = (
    colNo: number,
    compact: CompactType
  ): GridLayoutEngineOptions => {
    const config = getLayoutEngineProp();
    return {
      cols: colNo,
      compactType: compact,
      allowOverlap: props.allowOverlap,
      scheduler: config?.scheduler,
      executor: getLayoutExecutor(),
      compareLegacy: config?.compareLegacy,
      legacyFallback: config?.legacyFallback !== false,
      diagnostics: config?.diagnostics,
      onEvent: config?.onEvent
    };
  };

  const editorConfig = props.editor && typeof props.editor === "object"
    ? props.editor
    : null;
  const editorController: GridEditorController | null = editorConfig
    ? editorConfig.controller || createGridEditorController({
        ...editorConfig,
        kind: "responsive",
        layout: toRef(state, "layout") as Ref<Layout>,
        layouts: toRef(state, "layouts") as Ref<LayoutsMap>,
        breakpoint: toRef(state, "breakpoint") as Ref<string>,
        layoutOperationRunner: editorConfig.layoutOperationRunner || (input => {
          const id = `${input.commandId}:layout`;
          if (isLegacyLayoutEngine()) {
            return unsupportedLayoutResult(id, input.layout, input.operation);
          }
          return executeLayoutOperation({
            id,
            phase: input.phase,
            layout: input.layout,
            operation: input.operation,
            options: getLayoutEngineOptions(state.cols, resolveCompactType(props))
          });
        }),
        persistence: (persistenceController as never) || editorConfig.persistence
      })
    : null;

  const onLayoutChange = (layout: Layout) => {
    if (restoringPersistence) return;
    const nextLayout = cloneLayout(layout);
    const newLayouts = {
      ...state.layouts,
      [state.breakpoint]: nextLayout
    };
    state.layout = nextLayout;
    state.layouts = newLayouts;
    emit("update:layouts", newLayouts);
    emit("layoutChange", nextLayout, newLayouts);
    persistenceController?.commit(cloneLayoutsMap(newLayouts), { source: "component" });
  };

  const onWidthChange = (prevProps) => {
    const { breakpoints, cols } = props;
    const compactType = resolveCompactType(props);
    const newBreakpoint =
      props.breakpoint ||
      getBreakpointFromWidth(props.breakpoints, props.width);

    const lastBreakpoint = state.breakpoint;
    const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);
    const newLayouts = { ...state.layouts };

    if (
      lastBreakpoint !== newBreakpoint ||
      prevProps.breakpoints !== breakpoints ||
      prevProps.cols !== cols
    ) {
      newLayouts[lastBreakpoint] = cloneLayout(state.layout);

      const commitGeneratedLayout = (candidateLayout: Layout) => {
        const children: VNode[] = slots.default ? getNonFragmentChildren({ type: Fragment, children: slots.default() } as VNode) : [];
        const layout = synchronizeLayoutWithChildren(
          candidateLayout,
          children,
          newCols,
          compactType,
          props.allowOverlap
        );

        newLayouts[newBreakpoint] = layout;

        emit("breakpointChange", newBreakpoint, newCols);
        emit("update:layouts", newLayouts);
        emit("layoutChange", layout, newLayouts);
        persistenceController?.commit(cloneLayoutsMap(newLayouts), { source: "component" });

        state.breakpoint = newBreakpoint;
        state.layout = layout;
        state.cols = newCols;
        state.layouts = newLayouts;
        editorController?.setExternalLayouts(newLayouts, newBreakpoint, "breakpoint-change");
      };

      let layout = findOrGenerateResponsiveLayout(
        newLayouts,
        breakpoints,
        newBreakpoint,
        lastBreakpoint,
        newCols,
        compactType
      );

      if (!isLegacyLayoutEngine()) {
        const request = {
          id: `responsive:${lastBreakpoint}->${newBreakpoint}`,
          phase: "commit",
          layout: newLayouts[lastBreakpoint] || state.layout,
          operation: {
            type: "generateResponsiveLayout",
            breakpoint: newBreakpoint,
            sourceBreakpoint: lastBreakpoint,
            cols: newCols,
            layouts: newLayouts,
            breakpoints
          },
          options: getLayoutEngineOptions(newCols, compactType),
          heavy: layout.length >= 500
        } as const;
        const executor = getLayoutExecutor();
        if (request.heavy && executor.kind !== "main-thread") {
          void executor.execute(request).then(result => {
            if (result.status === "changed" || result.status === "noop" || result.status === "fallback") {
              commitGeneratedLayout(result.layout);
            } else {
              commitGeneratedLayout(layout);
            }
          }).catch(() => {
            commitGeneratedLayout(layout);
          });
        } else {
          const result = executeLayoutOperation(request);
          if (result.status === "changed" || result.status === "noop" || result.status === "fallback") {
            layout = result.layout;
          }
          commitGeneratedLayout(layout);
        }
      } else {
        commitGeneratedLayout(layout);
      }
    }

    const margin = getIndentationValue(props.margin, newBreakpoint);
    const containerPadding = getIndentationValue(
      props.containerPadding,
      newBreakpoint
    );

    emit("widthChange", props.width, margin, newCols, containerPadding);
  };

  watch(
    () => pick(props, ["width", "breakpoint", "breakpoints", "cols"]),
    (nextProps, prevProps) => {
      if (
        nextProps.width != prevProps.width ||
        nextProps.breakpoint !== prevProps.breakpoint ||
        !deepEqual(nextProps.breakpoints, prevProps.breakpoints) ||
        !deepEqual(nextProps.cols, prevProps.cols)
      ) {
        onWidthChange(prevProps);
      }
    },
    { deep: true }
  );

  watch(
    () => props.layouts,
    (newLayouts) => {
      if (!deepEqual(newLayouts, state.layouts)) {
        const { breakpoint, cols } = state;

        const newLayout = findOrGenerateResponsiveLayout(
          newLayouts,
          props.breakpoints,
          breakpoint,
          breakpoint,
          cols,
          resolveCompactType(props)
        );

        state.layout = newLayout;
        state.layouts = {
          ...newLayouts,
          [breakpoint]: newLayout
        };
        editorController?.setExternalLayouts(state.layouts, breakpoint, "external-layouts");
        if (!restoringPersistence) {
          persistenceController?.commit(cloneLayoutsMap(state.layouts), { source: "programmatic" });
        }
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    if (!persistenceController) return;
    restoringPersistence = true;
    void persistenceController.load().then(async result => {
      if (result.value && (result.ok || result.fallbackApplied)) {
        applyRestoredLayouts(result.value);
      }
      await nextTick();
      restoringPersistence = false;
    }).catch(async () => {
      await nextTick();
      restoringPersistence = false;
    });
  });

  onBeforeUnmount(() => {
    layoutExecutor.dispose?.();
    persistenceController?.stop();
    if (!editorConfig?.controller) editorController?.stop();
  });

  const getInnerEditorProp = () =>
    editorController ? { ...(editorConfig || {}), controller: editorController } : false;

  return {
    editorController,
    getInnerEditorProp,
    onLayoutChange,
    state
  };
}
