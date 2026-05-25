import type { GridInteractionCommonOptions, GridInteractionModelCommitters } from "./gridInteractionTypes";
type UseGridInteractionsOptions = GridInteractionCommonOptions & GridInteractionModelCommitters & {
    isFirefox: boolean;
    layoutClassName: string;
};
export declare function useGridInteractions(options: UseGridInteractionsOptions): {
    clearActiveInteraction: () => void;
    clearDropInteraction: () => void;
    removeDroppingPlaceholder: (reason?: string) => void;
    onDrop: (e: Event) => void;
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void | false;
    activeDragId: import("vue").Ref<string | null, string | null>;
    activeResizeId: import("vue").Ref<string | null, string | null>;
    dragBlocked: import("vue").Ref<boolean, boolean>;
    dragBlockedReason: import("vue").Ref<import("./gridInteractionTypes").GridInteractionBlockedReason | null, import("./gridInteractionTypes").GridInteractionBlockedReason | null>;
    dragBlockedItemIds: import("vue").Ref<string[], string[]>;
    dragBlockedMessage: import("vue").Ref<string | null, string | null>;
    resizeBlocked: import("vue").Ref<boolean, boolean>;
    onResizeStart: (i: string, w: number, h: number, { e, node, handle }: import("../utils").GridResizeEvent) => void;
    onResize: (i: string, w: number, h: number, { e, node, handle }: import("../utils").GridResizeEvent) => void;
    onResizeStop: (i: string, w: number, h: number, { e, node, handle }: import("../utils").GridResizeEvent) => void;
    onDragStart: (i: string, x: number, y: number, { e, node }: import("../utils").GridDragEvent) => void;
    onDrag: (i: string, x: number, y: number, { e, node }: import("../utils").GridDragEvent) => void;
    onDragStop: (i: string, x: number, y: number, { e, node }: import("../utils").GridDragEvent) => void;
};
export {};
