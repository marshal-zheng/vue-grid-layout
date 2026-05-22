import type { GridDragActivationDistance, GridInteractionKind, GridInteractionDiagnostics, GridInteractionEffect, GridInteractionEvent, GridInteractionMachineOptions, GridInteractionReduction, GridInteractionState } from "../interaction-state-machine";
type UseGridInteractionMachineOptions = {
    getDragActivationDistance?: () => GridDragActivationDistance | undefined;
    onEffects?: (effects: GridInteractionEffect[], reduction: GridInteractionReduction) => void;
    onDiagnostics?: (diagnostics: GridInteractionDiagnostics[]) => void;
};
export declare function useGridInteractionMachine({ getDragActivationDistance, onEffects, onDiagnostics }?: UseGridInteractionMachineOptions): {
    snapshot: import("vue").ShallowRef<GridInteractionState, GridInteractionState>;
    diagnostics: import("vue").ShallowRef<GridInteractionDiagnostics[], GridInteractionDiagnostics[]>;
    dispatch: (event: GridInteractionEvent, override?: GridInteractionMachineOptions) => GridInteractionReduction;
    reset: (reason?: string) => void;
    isCurrentRequest: (interactionId: string, requestId: string) => boolean;
    isCurrentPreviewRequest: (interactionId: string, requestId: string) => boolean;
    isCurrentInteraction: (interactionId: string, kind?: GridInteractionKind) => boolean;
};
export type GridInteractionMachineController = ReturnType<typeof useGridInteractionMachine>;
export {};
