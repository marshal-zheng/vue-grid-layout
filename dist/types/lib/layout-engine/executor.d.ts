import type { LayoutExecutor, LayoutExecutorOptions, LayoutWorkerLike } from "./types";
export declare function mainThreadLayoutExecutor(): LayoutExecutor;
export declare function createLayoutExecutor(options?: LayoutExecutor | LayoutExecutorOptions): LayoutExecutor;
export declare function workerLayoutExecutor(options?: {
    workerUrl?: string;
    workerFactory?: () => LayoutWorkerLike;
    timeoutMs?: number;
}): LayoutExecutor;
