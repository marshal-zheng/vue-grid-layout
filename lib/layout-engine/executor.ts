import { executeLayoutOperation } from "./core";

import type {
  GridLayoutEngineOptions,
  LayoutAbortSignal,
  LayoutExecutor,
  LayoutExecutorOptions,
  LayoutOperationRequest,
  LayoutOperationResult,
  LayoutWorkerLike
} from "./types";

type PendingWorkerTask = {
  resolve: (result: LayoutOperationResult) => void;
  reject: (error: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout> | null;
};

const abortResult = (request: LayoutOperationRequest, message: string): LayoutOperationResult => ({
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
    schedulerMode: request.options.scheduler?.mode,
    executorKind: "main-thread",
    durationMs: 0
  },
  error: { message }
});

const fallbackToMainThread = (
  request: LayoutOperationRequest,
  message: string,
  cause?: unknown
): LayoutOperationResult => {
  request.options.onEvent?.({
    type: "fallback",
    id: request.id,
    message,
    details: cause
  });
  const result = executeLayoutOperation({
    ...request,
    options: {
      ...request.options,
      executor: undefined
    }
  });
  return {
    ...result,
    status: result.status === "error" ? "error" : "fallback",
    error: result.error || { message, cause },
    diagnostics: result.diagnostics
      ? { ...result.diagnostics, executorKind: "main-thread" }
      : result.diagnostics
  };
};

const sanitizeOptions = (options: GridLayoutEngineOptions): GridLayoutEngineOptions => ({
  cols: options.cols,
  maxRows: options.maxRows,
  compactType: options.compactType,
  allowOverlap: options.allowOverlap,
  preventCollision: options.preventCollision,
  scheduler: options.scheduler,
  compareLegacy: false,
  legacyFallback: options.legacyFallback,
  diagnostics: options.diagnostics
});

const sanitizeRequest = (request: LayoutOperationRequest): LayoutOperationRequest => ({
  ...request,
  options: sanitizeOptions(request.options)
});

export function mainThreadLayoutExecutor(): LayoutExecutor {
  return {
    kind: "main-thread",
    available: () => true,
    execute: (request, signal?: LayoutAbortSignal) => {
      if (signal?.aborted) {
        return Promise.resolve(abortResult(request, "layout task aborted before execution"));
      }
      return Promise.resolve(executeLayoutOperation(request));
    }
  };
}

export function createLayoutExecutor(
  options?: LayoutExecutor | LayoutExecutorOptions
): LayoutExecutor {
  if (options && "execute" in options) return options;
  if (!options || options.kind === "main-thread") return mainThreadLayoutExecutor();
  if (options.kind === "custom") return options.executor;
  if (options.kind === "worker") {
    return workerLayoutExecutor({
      workerUrl: options.workerUrl,
      workerFactory: options.workerFactory,
      timeoutMs: options.timeoutMs
    });
  }
  return mainThreadLayoutExecutor();
}

export function workerLayoutExecutor(options: {
  workerUrl?: string;
  workerFactory?: () => LayoutWorkerLike;
  timeoutMs?: number;
} = {}): LayoutExecutor {
  let worker: LayoutWorkerLike | null = null;
  const pending = new Map<string, PendingWorkerTask>();
  const timeoutMs = options.timeoutMs || 5000;

  const createWorker = (): LayoutWorkerLike | null => {
    if (worker) return worker;
    if (options.workerFactory) {
      worker = options.workerFactory();
    } else if (
      options.workerUrl &&
      typeof Worker !== "undefined"
    ) {
      worker = new Worker(options.workerUrl) as unknown as LayoutWorkerLike;
    } else {
      return null;
    }

    worker.onmessage = event => {
      const data = event.data as {
        id?: string;
        result?: LayoutOperationResult;
        error?: { message: string; cause?: unknown };
      };
      if (!data || !data.id) return;
      const task = pending.get(data.id);
      if (!task) return;
      pending.delete(data.id);
      if (task.timeoutId) clearTimeout(task.timeoutId);
      if (data.result) {
        task.resolve({
          ...data.result,
          diagnostics: data.result.diagnostics
            ? { ...data.result.diagnostics, executorKind: "worker" }
            : data.result.diagnostics
        });
      }
      else task.reject(data.error || new Error("worker returned no result"));
    };

    worker.onerror = event => {
      pending.forEach(task => {
        if (task.timeoutId) clearTimeout(task.timeoutId);
        task.reject(event);
      });
      pending.clear();
    };

    return worker;
  };

  const available = () => Boolean(options.workerFactory || (options.workerUrl && typeof Worker !== "undefined"));

  return {
    kind: "worker",
    available,
    execute: (request, signal?: LayoutAbortSignal) => {
      if (signal?.aborted) {
        return Promise.resolve(abortResult(request, "layout task aborted before worker execution"));
      }

      const nextWorker = createWorker();
      if (!nextWorker) {
        return Promise.resolve(
          fallbackToMainThread(request, "worker unavailable; falling back to main thread")
        );
      }

      return new Promise<LayoutOperationResult>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          pending.delete(request.id);
          request.options.onEvent?.({
            type: "timeout",
            id: request.id,
            message: `worker task exceeded ${timeoutMs}ms`
          });
          resolve(fallbackToMainThread(request, "worker task timed out"));
        }, timeoutMs);

        const abort = () => {
          pending.delete(request.id);
          clearTimeout(timeoutId);
          resolve(abortResult(request, "layout task aborted"));
        };

        signal?.addEventListener?.("abort", abort, { once: true });
        pending.set(request.id, { resolve, reject, timeoutId });

        try {
          nextWorker.postMessage({
            type: "layout-engine-request",
            id: request.id,
            request: sanitizeRequest(request)
          });
        } catch (error) {
          pending.delete(request.id);
          clearTimeout(timeoutId);
          request.options.onEvent?.({
            type: "worker-error",
            id: request.id,
            message: "worker postMessage failed",
            details: error
          });
          resolve(fallbackToMainThread(request, "worker postMessage failed", error));
        }
      }).catch(error => {
        request.options.onEvent?.({
          type: "worker-error",
          id: request.id,
          message: error instanceof Error ? error.message : String(error),
          details: error
        });
        return fallbackToMainThread(request, "worker execution failed", error);
      });
    },
    dispose: () => {
      pending.forEach(task => {
        if (task.timeoutId) clearTimeout(task.timeoutId);
      });
      pending.clear();
      worker?.terminate();
      worker = null;
    }
  };
}
