import { shallowRef } from "vue";
import {
  createGridInteractionInitialState,
  reduceGridInteraction
} from "../interaction-state-machine";
import type {
  GridDragActivationDistance,
  GridInteractionKind,
  GridInteractionDiagnostics,
  GridInteractionEffect,
  GridInteractionEvent,
  GridInteractionMachineOptions,
  GridInteractionReduction,
  GridInteractionState
} from "../interaction-state-machine";

type UseGridInteractionMachineOptions = {
  getDragActivationDistance?: () => GridDragActivationDistance | undefined;
  onEffects?: (
    effects: GridInteractionEffect[],
    reduction: GridInteractionReduction
  ) => void;
  onDiagnostics?: (diagnostics: GridInteractionDiagnostics[]) => void;
};

export function useGridInteractionMachine({
  getDragActivationDistance,
  onEffects,
  onDiagnostics
}: UseGridInteractionMachineOptions = {}) {
  const snapshot = shallowRef<GridInteractionState>(createGridInteractionInitialState());
  const diagnostics = shallowRef<GridInteractionDiagnostics[]>([]);

  const reduceOptions = (override?: GridInteractionMachineOptions): GridInteractionMachineOptions => ({
    dragActivationDistance:
      override && "dragActivationDistance" in override
        ? override.dragActivationDistance
        : getDragActivationDistance?.()
  });

  const dispatch = (
    event: GridInteractionEvent,
    override?: GridInteractionMachineOptions
  ): GridInteractionReduction => {
    const reduction = reduceGridInteraction(snapshot.value, event, reduceOptions(override));
    snapshot.value = reduction.state;
    if (reduction.diagnostics.length > 0) {
      diagnostics.value = diagnostics.value.concat(reduction.diagnostics);
      onDiagnostics?.(reduction.diagnostics);
    }
    if (reduction.effects.length > 0) {
      onEffects?.(reduction.effects, reduction);
    }
    return reduction;
  };

  const reset = (reason = "reset") => {
    if (snapshot.value.status !== "idle") {
      dispatch({
        type: "CANCEL",
        interactionId: snapshot.value.interactionId,
        reason
      });
    }
    snapshot.value = createGridInteractionInitialState();
  };

  const isCurrentRequest = (interactionId: string, requestId: string) =>
    snapshot.value.status === "committing" &&
    snapshot.value.interactionId === interactionId &&
    snapshot.value.requestId === requestId;

  const isCurrentPreviewRequest = (interactionId: string, requestId: string) =>
    previewRequestId(snapshot.value) === requestId &&
    snapshot.value.status !== "idle" &&
    snapshot.value.status !== "committing" &&
    snapshot.value.interactionId === interactionId;

  const isCurrentInteraction = (interactionId: string, kind?: GridInteractionKind) => {
    const state = snapshot.value;
    if (state.status === "idle") return false;
    if (state.interactionId !== interactionId) return false;
    if (!kind) return true;
    if (state.status === "pending-drag" || state.status === "active-drag") return kind === "drag";
    if (state.status === "active-resize") return kind === "resize";
    if (state.status === "active-drop") return kind === "drop";
    return state.kind === kind;
  };

  return {
    snapshot,
    diagnostics,
    dispatch,
    reset,
    isCurrentRequest,
    isCurrentPreviewRequest,
    isCurrentInteraction
  };
}

function previewRequestId(state: GridInteractionState): string | null {
  if (state.status === "active-drag") {
    return `${state.interactionId}:drag-preview:${state.previewSeq}`;
  }
  if (state.status === "active-resize") {
    return `${state.interactionId}:resize-preview:${state.previewSeq}`;
  }
  if (state.status === "active-drop") {
    return `${state.interactionId}:drop-preview:${state.previewSeq}`;
  }
  return null;
}

export type GridInteractionMachineController = ReturnType<typeof useGridInteractionMachine>;
