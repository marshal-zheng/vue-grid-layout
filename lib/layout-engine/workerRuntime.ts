import { executeLayoutOperation } from "./core";

import type { LayoutOperationRequest, LayoutOperationResult } from "./types";

type WorkerRequestMessage = {
  type: "layout-engine-request";
  id: string;
  request: LayoutOperationRequest;
};

type WorkerResponseMessage = {
  id: string;
  result?: LayoutOperationResult;
  error?: { message: string; cause?: unknown };
};

export function runLayoutWorkerRequest(message: WorkerRequestMessage): WorkerResponseMessage {
  try {
    return {
      id: message.id,
      result: executeLayoutOperation(message.request)
    };
  } catch (error) {
    return {
      id: message.id,
      error: {
        message: error instanceof Error ? error.message : String(error),
        cause: error
      }
    };
  }
}

declare const self: {
  addEventListener?: (
    type: "message",
    listener: (event: { data: WorkerRequestMessage }) => void
  ) => void;
  postMessage?: (message: WorkerResponseMessage) => void;
} | undefined;

if (typeof self !== "undefined" && self.addEventListener && self.postMessage) {
  self.addEventListener("message", event => {
    if (!event.data || event.data.type !== "layout-engine-request") return;
    self.postMessage?.(runLayoutWorkerRequest(event.data));
  });
}
