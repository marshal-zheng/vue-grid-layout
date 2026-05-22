import { type ComputedRef } from "vue";
import { type PositionParams } from "../calculateUtils";
import type { GridResizeEvent, Position, ResizeHandleAxis } from "../utils";
type GridItemResizeCallback = (i: string, w: number, h: number, data: GridResizeEvent) => void;
export type GridItemResizeAttrs = {
    onResize?: GridItemResizeCallback;
    onResizeStart?: GridItemResizeCallback;
    onResizeStop?: GridItemResizeCallback;
};
export type ResizeCallbackData = {
    node: HTMLElement;
    size: Position;
    handle: ResizeHandleAxis;
};
export type GridItemResizeVendorCallback = (e: Event, data: ResizeCallbackData, position: Position) => void;
type GridItemResizeState = {
    resizing?: {
        top: number;
        left: number;
        width: number;
        height: number;
    } | null;
};
type GridItemResizeProps = {
    cols: number;
    containerWidth: number;
    h: number;
    i: string;
    maxH: number;
    maxW: number;
    minH: number;
    minW: number;
    x: number;
    y: number;
};
type UseGridItemResizeOptions = {
    attrs: GridItemResizeAttrs;
    positionParams: ComputedRef<PositionParams>;
    props: GridItemResizeProps;
    state: GridItemResizeState;
};
export declare function useGridItemResize({ attrs, positionParams, props, state }: UseGridItemResizeOptions): {
    curryResizeHandler: (position: Position, handler: GridItemResizeVendorCallback) => (e: Event, data: ResizeCallbackData) => void;
    onResize: GridItemResizeVendorCallback;
    onResizeStart: GridItemResizeVendorCallback;
    onResizeStop: GridItemResizeVendorCallback;
    resizeConstraints: ComputedRef<{
        minConstraints: [number, number];
        maxConstraints: [number, number];
    }>;
};
export {};
