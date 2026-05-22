import type { ComponentInternalInstance } from "vue";
import type { EventCallback, Layout, LayoutItem } from "../utils";
import type { GridHeightRuntime } from "../grid-height";
export declare const gridLayoutEmits: string[];
export type GridLayoutEmitName = "update:modelValue" | "layoutChange" | "dragStart" | "drag" | "dragStop" | "resizeStart" | "resize" | "resizeStop" | "drop" | "dropDragOver" | "heightRuntimeChange";
export type DropDragOverResult = {
    w?: number;
    h?: number;
} | false | void;
type EmitFn = (event: GridLayoutEmitName, ...args: unknown[]) => void;
export type GridRootAttrs = {
    attrs: Record<string, unknown>;
    class?: unknown;
    style?: unknown;
};
export declare function splitGridRootAttrs(rawAttrs: Record<string, unknown>): GridRootAttrs;
export declare function createGridLayoutEventBridge(emit: EmitFn, instance: ComponentInternalInstance | null): {
    emitModelValue(layout: Layout | undefined): void;
    emitLayoutChange(layout: Layout | undefined): void;
    emitDragStart: EventCallback;
    emitDrag: EventCallback;
    emitDragStop: EventCallback;
    emitResizeStart: EventCallback;
    emitResize: EventCallback;
    emitResizeStop: EventCallback;
    emitDrop(layout: Layout, event: Event, item?: LayoutItem): void;
    emitHeightRuntimeChange(runtime: GridHeightRuntime): void;
    callDropDragOver(event: DragEvent): Exclude<DropDragOverResult, void> | undefined;
};
export {};
