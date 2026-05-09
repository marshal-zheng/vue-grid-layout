import { cloneLayout, cloneLayoutItem, getLayoutItem } from "../utils";
import { executeLayoutOperation } from "./core";

import type {
  GridLayoutEngineOptions,
  InteractionController,
  InteractionControllerState,
  LayoutEngineEvent,
  LayoutOperationRequest,
  LayoutOperationResult
} from "./types";
import type { Layout } from "../utils";

const staleResult = (
  requestId: string,
  layout: Layout
): LayoutOperationResult => ({
  id: requestId,
  status: "stale",
  layout,
  patches: [],
  affectedIds: [],
  collisions: [],
  diagnostics: {
    operationId: requestId,
    operationType: "validate",
    phase: "preview",
    layoutSize: layout.length,
    affectedCount: 0,
    collisionCount: 0,
    indexHit: false,
    durationMs: 0,
    stale: true
  }
});

const emit = (
  options: GridLayoutEngineOptions,
  event: LayoutEngineEvent
): void => {
  options.onEvent?.(event);
};

export function createInteractionController(
  initialLayout: Layout,
  options: GridLayoutEngineOptions
): InteractionController {
  let committed = cloneLayout(initialLayout);
  let preview: LayoutOperationResult | null = null;
  let externalRevision = 0;
  let lastOperation: Omit<LayoutOperationRequest, "layout" | "options" | "phase"> | null = null;
  let latestRequestId: string | null = null;

  const state: InteractionControllerState = {
    committed,
    preview,
    interaction: null,
    externalRevision
  };

  const syncState = (): InteractionControllerState => {
    state.committed = committed;
    state.preview = preview;
    state.externalRevision = externalRevision;
    return state;
  };

  const cancel = (reason: string = "cancelled"): Layout => {
    if (state.interaction) {
      emit(options, {
        type: "interaction-cancelled",
        id: state.interaction.id,
        message: reason,
        details: {
          itemId: state.interaction.itemId,
          interactionType: state.interaction.type
        }
      });
    }
    preview = null;
    lastOperation = null;
    latestRequestId = null;
    state.interaction = null;
    syncState();
    return cloneLayout(committed);
  };

  const ensureInteractionForRequest = (
    request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">
  ): void => {
    if (state.interaction) return;
    const itemId =
      request.operation.type === "dropFit"
        ? request.operation.item.i || "__dropping-elem__"
        : "id" in request.operation
          ? request.operation.id
          : "__layout__";
    state.interaction = {
      id: request.id,
      type: request.operation.type === "resize" ? "resize" : request.operation.type === "dropFit" ? "drop" : "drag",
      itemId,
      startRevision: `external-${externalRevision}`,
      tickRevision: 0
    };
  };

  const buildRequest = (
    request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">,
    phase: "preview" | "commit",
    layout: Layout
  ): LayoutOperationRequest => ({
    ...request,
    phase,
    layout,
    options
  });

  const preparePreview = (
    request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">
  ): LayoutOperationRequest => {
    ensureInteractionForRequest(request);
    if (state.interaction) state.interaction.tickRevision++;
    latestRequestId = request.id;
    lastOperation = request;
    return buildRequest(request, "preview", committed);
  };

  const prepareCommit = (
    request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">
  ): LayoutOperationRequest => {
    ensureInteractionForRequest(request);
    latestRequestId = request.id;
    lastOperation = request;
    return buildRequest(request, "commit", committed);
  };

  const applyAsyncResult = (result: LayoutOperationResult): LayoutOperationResult => {
    if (latestRequestId && result.id !== latestRequestId) {
      emit(options, {
        type: "stale-result",
        id: result.id,
        message: "ignored stale async result",
        diagnostics: result.diagnostics
      });
      return staleResult(result.id, committed);
    }

    if (result.diagnostics?.phase === "commit") {
      if (result.status === "changed" || result.status === "fallback") {
        committed = cloneLayout(result.layout);
      }
      preview = null;
      state.interaction = null;
      latestRequestId = null;
      lastOperation = null;
    } else {
      preview = result;
    }
    syncState();
    return result;
  };

  return {
    getState: () => syncState(),
    getCommitted: () => cloneLayout(committed),
    setCommitted: (layout: Layout, reason: string = "external") => {
      committed = cloneLayout(layout);
      externalRevision++;
      if (state.interaction) {
        const rebased = getLayoutItem(committed, state.interaction.itemId);
        if (!rebased) {
          cancel(`${reason}:active-item-missing`);
          return;
        }
        if (preview?.placeholder) {
          preview.placeholder = {
            ...cloneLayoutItem(rebased),
            x: preview.placeholder.x,
            y: preview.placeholder.y,
            w: preview.placeholder.w,
            h: preview.placeholder.h
          };
        }
      }
      syncState();
    },
    start: interaction => {
      state.interaction = {
        ...interaction,
        startRevision: `external-${externalRevision}`,
        tickRevision: 0
      };
      preview = null;
      latestRequestId = null;
      lastOperation = null;
      return syncState();
    },
    preparePreview,
    prepareCommit,
    preview: request => {
      const result = executeLayoutOperation(preparePreview(request));
      if (latestRequestId !== result.id) {
        emit(options, { type: "stale-result", id: result.id, message: "ignored stale preview" });
        return staleResult(result.id, committed);
      }
      preview = result;
      return syncState().preview as LayoutOperationResult;
    },
    commit: request => {
      return applyAsyncResult(executeLayoutOperation(prepareCommit(request)));
    },
    applyAsyncResult,
    rebase: layout => {
      committed = cloneLayout(layout);
      externalRevision++;
      if (!state.interaction || !lastOperation) {
        preview = null;
        syncState();
        return null;
      }
      if (!getLayoutItem(committed, state.interaction.itemId)) {
        cancel("rebase:active-item-missing");
        return null;
      }
      const result = executeLayoutOperation(buildRequest(lastOperation, "preview", committed));
      if (result.status === "blocked" || result.status === "error") {
        cancel(`rebase:${result.status}`);
        return result;
      }
      preview = result;
      syncState();
      return result;
    },
    cancel,
    dispose: () => {
      cancel("dispose");
    }
  };
}
