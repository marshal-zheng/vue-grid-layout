import { bottom, cloneLayoutItem, getLayoutItem } from "../utils";

import type {
  InteractionScheduler,
  InteractionSchedulerMode,
  InteractionSchedulerOptions,
  LayoutOperationRequest,
  LayoutOperationResult,
  ScheduledLayoutTask
} from "./types";

const defaultAuto = {
  eagerMaxItems: 100,
  rafMaxItems: 1000,
  workerMinItems: 1000,
  densityThreshold: 0.6
};

const supportsRAF = (): boolean =>
  typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function";

const isPromiseLike = <T>(value: T | Promise<T>): value is Promise<T> =>
  Boolean(value && typeof (value as Promise<T>).then === "function");

const createCancelledResult = (
  request: LayoutOperationRequest,
  message: string
): LayoutOperationResult => ({
  id: request.id,
  status: "cancelled",
  layout: request.layout,
  patches: [],
  affectedIds: [],
  collisions: [],
  diagnostics: {
    operationId: request.id,
    operationType: request.operation.type,
    phase: request.phase,
    layoutSize: request.layout.length,
    affectedCount: 0,
    collisionCount: 0,
    indexHit: false,
    schedulerMode: request.options.scheduler?.mode || "auto",
    executorKind: request.options.executor?.kind || "main-thread",
    durationMs: 0,
    debug: undefined
  },
  error: { message }
});

const createCommitOnlyPreview = (request: LayoutOperationRequest): LayoutOperationResult => {
  const placeholder =
    request.operation.type === "move" || request.operation.type === "resize"
      ? getLayoutItem(request.layout, request.operation.id)
      : request.operation.type === "groupMove"
        ? getLayoutItem(
            request.layout,
            request.operation.activeId || request.operation.ids[0] || ""
          )
      : null;
  const nextPlaceholder = placeholder ? cloneLayoutItem(placeholder) : undefined;

  if (nextPlaceholder && request.operation.type === "move") {
    nextPlaceholder.x = request.operation.x;
    nextPlaceholder.y = request.operation.y;
  }
  if (nextPlaceholder && request.operation.type === "groupMove") {
    nextPlaceholder.x += Math.trunc(request.operation.dx);
    nextPlaceholder.y += Math.trunc(request.operation.dy);
  }
  if (nextPlaceholder && request.operation.type === "resize") {
    nextPlaceholder.w = request.operation.w;
    nextPlaceholder.h = request.operation.h;
    if (typeof request.operation.x === "number") nextPlaceholder.x = request.operation.x;
    if (typeof request.operation.y === "number") nextPlaceholder.y = request.operation.y;
  }

  return {
    id: request.id,
    status: "noop",
    layout: request.layout,
    patches: [],
    affectedIds: [],
    collisions: [],
    placeholder: nextPlaceholder,
    diagnostics: {
      operationId: request.id,
      operationType: request.operation.type,
      phase: request.phase,
      layoutSize: request.layout.length,
      affectedCount: 0,
      collisionCount: 0,
      indexHit: false,
      schedulerMode: "commitOnly",
      executorKind: request.options.executor?.kind || "main-thread",
      durationMs: 0
    }
  };
};

const calculateDensity = (request: LayoutOperationRequest): number => {
  const rowCount = Math.max(1, bottom(request.layout));
  const cols = Math.max(1, request.options.cols);
  let occupied = 0;
  for (let i = 0; i < request.layout.length; i++) {
    occupied += request.layout[i].w * request.layout[i].h;
  }
  return occupied / (rowCount * cols);
};

export function createInteractionScheduler(
  options: InteractionSchedulerOptions = {}
): InteractionScheduler {
  let rafId: number | null = null;
  let latestTask: ScheduledLayoutTask | null = null;
  let latestRequest: LayoutOperationRequest | null = null;
  let lastDurationMs = 0;

  const emitScheduler = (
    request: LayoutOperationRequest,
    type: "scheduler" | "stale-result",
    message: string,
    details?: unknown
  ) => {
    request.options.onEvent?.({
      type,
      id: request.id,
      message,
      details
    });
  };

  const cancel = (reason: string = "cancelled") => {
    if (rafId != null && supportsRAF()) {
      cancelAnimationFrame(rafId);
    }
    rafId = null;
    if (latestTask && latestRequest) {
      emitScheduler(latestRequest, "scheduler", reason);
    }
    latestTask = null;
    latestRequest = null;
  };

  const getMode = (request: LayoutOperationRequest): InteractionSchedulerMode => {
    const configured = options.mode || request.options.scheduler?.mode || "auto";
    if (configured !== "auto") return configured;
    if (request.phase === "commit") return "eager";

    const auto = {
      ...defaultAuto,
      ...options.auto,
      ...request.options.scheduler?.auto
    };
    const itemCount = request.layout.length;
    const density = calculateDensity(request);
    if (itemCount <= auto.eagerMaxItems && lastDurationMs <= (options.maxTaskMs || 8)) {
      return "eager";
    }
    if (request.operation.type === "dropFit") {
      return "raf";
    }
    if (request.heavy || itemCount >= auto.workerMinItems || density >= auto.densityThreshold) {
      return "commitOnly";
    }
    if (itemCount <= auto.rafMaxItems) return "raf";
    return "commitOnly";
  };

  const runTask = (
    task: ScheduledLayoutTask,
    runner: (request: LayoutOperationRequest) => Promise<LayoutOperationResult> | LayoutOperationResult,
    onResult: (result: LayoutOperationResult) => void
  ) => {
    const request = task.request;
    const handleResult = (result: LayoutOperationResult) => {
      if (latestTask && latestTask.id !== task.id) {
        emitScheduler(request, "stale-result", "dropped stale scheduled result");
        return;
      }
      lastDurationMs = result.diagnostics?.durationMs || lastDurationMs;
      onResult(result);
    };
    const handleError = (error: unknown) => {
      onResult({
        ...createCancelledResult(request, "scheduler runner failed"),
        status: "error",
        error: {
          message: error instanceof Error ? error.message : String(error),
          cause: error
        }
      });
    };

    try {
      const result = runner(request);
      if (isPromiseLike(result)) {
        result.then(handleResult).catch(handleError);
      } else {
        handleResult(result);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const schedule: InteractionScheduler["schedule"] = (request, runner, onResult) => {
    const mode = getMode(request);
    const task: ScheduledLayoutTask = {
      id: request.id,
      request,
      cancel: () => {
        if (latestTask?.id === request.id) cancel("task cancelled");
      }
    };

    if (latestTask && latestTask.id !== task.id) {
      emitScheduler(latestTask.request, "scheduler", "coalesced by newer task", {
        nextId: task.id
      });
    }

    latestTask = task;
    latestRequest = request;

    if (mode === "commitOnly" && request.phase === "preview") {
      onResult(createCommitOnlyPreview(request));
      return task;
    }

    if (mode === "eager" || request.phase === "commit") {
      runTask(task, runner, onResult);
      return task;
    }

    if (rafId != null && supportsRAF()) {
      cancelAnimationFrame(rafId);
      emitScheduler(request, "scheduler", "coalesced raf task");
    }

    if (!supportsRAF()) {
      runTask(task, runner, onResult);
      return task;
    }

    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (!latestTask) return;
      runTask(latestTask, runner, onResult);
    });

    return task;
  };

  return {
    getMode,
    schedule,
    cancel,
    recordDuration: durationMs => {
      lastDurationMs = durationMs;
    }
  };
}
