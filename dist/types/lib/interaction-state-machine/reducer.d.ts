import type { GridInteractionEvent, GridInteractionMachineOptions, GridInteractionReduction, GridInteractionState } from "./types";
export declare const createGridInteractionInitialState: () => GridInteractionState;
export declare function reduceGridInteraction(state: GridInteractionState, event: GridInteractionEvent, options?: GridInteractionMachineOptions): GridInteractionReduction;
