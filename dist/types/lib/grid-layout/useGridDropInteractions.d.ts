import type { GridInteractionCommonOptions } from "./gridInteractionTypes";
type UseGridDropInteractionsOptions = GridInteractionCommonOptions & {
    isFirefox: boolean;
    layoutClassName: string;
};
export declare function useGridDropInteractions({ props, state, eventBridge, engineBridge, frameUpdate, autoScroll, editor, isFirefox, layoutClassName, interactionMachine: providedInteractionMachine, nextInteractionRequestId }: UseGridDropInteractionsOptions): {
    clearDropInteraction: () => void;
    removeDroppingPlaceholder: (reason?: string, preserveLayout?: boolean) => void;
    onDrop: (e: Event) => void;
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void | false;
};
export {};
