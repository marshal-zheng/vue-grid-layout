import { type VNode } from "vue";
import type { CompactType, Layout } from "../utils";
import type { Breakpoints, ResponsiveLayout } from "../responsiveUtils";
import type { GridLayoutEngineProp } from "../layout-engine";
export interface BreakpointMap {
    [key: string]: number;
}
export interface MarginPaddingMap {
    [key: string]: [number, number] | null;
}
export interface LayoutsMap {
    [key: string]: Layout;
}
export interface ResponsiveGridLayoutModelProps<Breakpoint extends string = string> {
    allowOverlap: boolean;
    breakpoint?: Breakpoint | string | null;
    breakpoints: Breakpoints<Breakpoint> | BreakpointMap;
    cols: Record<Breakpoint, number> | BreakpointMap;
    compactType: CompactType;
    containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
    layoutEngine?: false | GridLayoutEngineProp;
    layouts: ResponsiveLayout<Breakpoint> | LayoutsMap;
    margin: Record<Breakpoint, [number, number] | null> | [number, number];
    verticalCompact: boolean;
    width: number;
}
type ResponsiveEmit = (event: "update:layouts" | "layoutChange" | "breakpointChange" | "widthChange", ...args: unknown[]) => void;
type UseResponsiveGridLayoutModelOptions = {
    props: ResponsiveGridLayoutModelProps;
    slots: {
        default?: () => VNode[];
    };
    emit: ResponsiveEmit;
};
export declare function getIndentationValue<T extends Array<number> | null>(param: {
    [key: string]: T;
} | T, breakpoint: string): T | null;
export declare const cloneResponsiveLayoutsMap: (layouts: LayoutsMap) => LayoutsMap;
export declare function useResponsiveGridLayoutModel({ props, slots, emit }: UseResponsiveGridLayoutModelOptions): {
    onLayoutChange: (layout: Layout) => void;
    state: {
        layout: {
            w: number;
            h: number;
            x: number;
            y: number;
            i: string;
            minW?: number | undefined;
            minH?: number | undefined;
            maxW?: number | undefined;
            maxH?: number | undefined;
            moved?: boolean | undefined;
            static?: boolean | undefined;
            isDraggable?: boolean | undefined;
            isResizable?: boolean | undefined;
            resizeHandles?: Array<import("../utils").ResizeHandleAxis> | undefined;
            isBounded?: boolean | undefined;
        }[];
        breakpoint: string;
        cols: number;
        layouts: LayoutsMap;
    };
};
export {};
