import type { Ref, VNode } from "vue";
import type { Layout, LayoutItem } from "../utils";
import type { GridInteractionBlockedReason, GridLayoutEngineBridge, GridInteractionsEditor } from "./gridInteractionTypes";
export type GridItemRenderDefaults = {
    isBounded: boolean;
    isDraggable: boolean;
    isResizable: boolean;
};
export type GridItemRenderState = {
    visible: boolean;
    draggable: boolean;
    resizable: boolean;
    bounded: boolean;
    className?: string;
    previewItem?: LayoutItem | null;
    onClick?: (event: MouseEvent) => void;
};
export type GridLayoutInteractionSnapshot = {
    activeDragId: string | null;
    activeResizeId: string | null;
    dragBlocked: boolean;
    dragBlockedReason?: GridInteractionBlockedReason | null;
    dragBlockedItemIds?: string[];
    dragBlockedMessage?: string | null;
    resizeBlocked: boolean;
};
export type GridLayoutRuntimeExtensionContext = {
    props: {
        allowOverlap: boolean;
        cols: number;
        compactType: unknown;
        margin: number[];
        containerPadding?: number[] | null;
        maxRows: number;
        preventCollision: boolean;
        rowHeight: number;
        transformScale: number;
        verticalCompact: boolean;
        width?: number;
    };
    layoutRef: Ref<Layout>;
    engineBridge: GridLayoutEngineBridge;
    getLayout: () => Layout;
    getOldDragItem: () => LayoutItem | null | undefined;
    getOldResizeItem: () => LayoutItem | null | undefined;
    isDropping: () => boolean;
    getInteractionState: () => GridLayoutInteractionSnapshot | null;
};
export type GridOverlayRenderInput = {
    geometry: {
        width: number;
        margin: number[];
        containerPadding: number[];
        rowHeight: number;
        renderPrecision: "integer" | "subpixel";
        cols: number;
        maxRows: number;
    };
    itemMap: Map<string, LayoutItem>;
    layout: Layout;
};
export type GridLayoutRuntimeExtension = {
    interactions: GridInteractionsEditor;
    syncHistory?: (layout: Layout, mode?: "push" | "replace") => void;
    mount?: () => void;
    stop?: () => void;
    getItemRenderState: (item: LayoutItem, defaults: GridItemRenderDefaults, isDroppingItem?: boolean) => GridItemRenderState;
    getRootClassNames: () => unknown;
    isExternalDropEnabled: (isDroppable: boolean) => boolean;
    onRootPointerMove?: (event: MouseEvent | PointerEvent) => void;
    onRootClick?: (event: MouseEvent) => void;
    renderOverlay: (input: GridOverlayRenderInput) => VNode | VNode[] | null;
};
export declare const getDefaultGridItemRenderState: (item: LayoutItem, defaults: GridItemRenderDefaults) => GridItemRenderState;
export declare const createNoopGridInteractionsEditor: () => GridInteractionsEditor;
