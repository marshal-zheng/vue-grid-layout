import type { LayoutOperationRequest, LayoutOperationResult } from "./types";
type WorkerRequestMessage = {
    type: "layout-engine-request";
    id: string;
    request: LayoutOperationRequest;
};
type WorkerResponseMessage = {
    id: string;
    result?: LayoutOperationResult;
    error?: {
        message: string;
        cause?: unknown;
    };
};
export declare function runLayoutWorkerRequest(message: WorkerRequestMessage): WorkerResponseMessage;
export {};
