import { PropType } from 'vue';
import type { CompactType } from "./utils";
import { ResponsiveLayout, Breakpoints } from "./responsiveUtils";
import type { GridLayoutEngineProp } from "./layout-engine";
import type { GridDragActivationDistance } from "./interaction-state-machine";
import { type BreakpointMap, type LayoutsMap, type MarginPaddingMap } from "./responsive/useResponsiveGridLayoutModel";
export interface Props<Breakpoint extends string = string> {
    breakpoint?: Breakpoint | null;
    breakpoints: Breakpoints<Breakpoint>;
    cols: Record<Breakpoint, number>;
    layouts: {
        type: ResponsiveLayout<Breakpoint>;
        default: () => (null);
    };
    width: number;
    margin: {
        type: Record<Breakpoint, [number, number]> | [number, number];
        default: [10, 10];
    };
    containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
    layoutEngine?: false | GridLayoutEngineProp;
    dragActivationDistance?: GridDragActivationDistance;
}
export declare const responsiveGridLayoutProps: {
    /** Force current breakpoint key (optional, usually auto-calculated) */
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
    /** Breakpoint to pixel width mapping, e.g. { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } */
    breakpoints: {
        type: () => BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    /** Allow grid items to overlap */
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Vertical compact layout (deprecated) */
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Breakpoint to column count mapping, e.g. { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } */
    cols: {
        type: () => BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    /** Breakpoint to spacing mapping or universal [x, y], e.g. { lg: [10, 10] } or [10, 10] */
    margin: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
    /** Breakpoint to container padding mapping or universal value */
    containerPadding: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => {
            lg: null;
            md: null;
            sm: null;
            xs: null;
            xxs: null;
        };
    };
    /** Layout collection for each breakpoint, e.g. { lg: Layout[], md: Layout[] } */
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    /** Component width (required, usually auto-provided by WidthProvider) */
    width: {
        type: NumberConstructor;
        required: boolean;
    };
    /** Compaction direction: vertical / horizontal / null */
    compactType: {
        type: PropType<CompactType>;
        default: string;
        validator: (value: CompactType) => boolean;
    };
    /** Layout engine configuration for responsive heavy operations and the inner grid */
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    /** Drag activation distance passed through to the inner grid. */
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
};
declare const ResponsiveVueGridLayout: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    /** Force current breakpoint key (optional, usually auto-calculated) */
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
    /** Breakpoint to pixel width mapping, e.g. { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } */
    breakpoints: {
        type: () => BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    /** Allow grid items to overlap */
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Vertical compact layout (deprecated) */
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Breakpoint to column count mapping, e.g. { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } */
    cols: {
        type: () => BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    /** Breakpoint to spacing mapping or universal [x, y], e.g. { lg: [10, 10] } or [10, 10] */
    margin: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
    /** Breakpoint to container padding mapping or universal value */
    containerPadding: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => {
            lg: null;
            md: null;
            sm: null;
            xs: null;
            xxs: null;
        };
    };
    /** Layout collection for each breakpoint, e.g. { lg: Layout[], md: Layout[] } */
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    /** Component width (required, usually auto-provided by WidthProvider) */
    width: {
        type: NumberConstructor;
        required: boolean;
    };
    /** Compaction direction: vertical / horizontal / null */
    compactType: {
        type: PropType<CompactType>;
        default: string;
        validator: (value: CompactType) => boolean;
    };
    /** Layout engine configuration for responsive heavy operations and the inner grid */
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    /** Drag activation distance passed through to the inner grid. */
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("layoutChange" | "update:layouts" | "breakpointChange" | "widthChange")[], "layoutChange" | "update:layouts" | "breakpointChange" | "widthChange", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** Force current breakpoint key (optional, usually auto-calculated) */
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
    /** Breakpoint to pixel width mapping, e.g. { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } */
    breakpoints: {
        type: () => BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    /** Allow grid items to overlap */
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Vertical compact layout (deprecated) */
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Breakpoint to column count mapping, e.g. { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } */
    cols: {
        type: () => BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    /** Breakpoint to spacing mapping or universal [x, y], e.g. { lg: [10, 10] } or [10, 10] */
    margin: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
    /** Breakpoint to container padding mapping or universal value */
    containerPadding: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => {
            lg: null;
            md: null;
            sm: null;
            xs: null;
            xxs: null;
        };
    };
    /** Layout collection for each breakpoint, e.g. { lg: Layout[], md: Layout[] } */
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    /** Component width (required, usually auto-provided by WidthProvider) */
    width: {
        type: NumberConstructor;
        required: boolean;
    };
    /** Compaction direction: vertical / horizontal / null */
    compactType: {
        type: PropType<CompactType>;
        default: string;
        validator: (value: CompactType) => boolean;
    };
    /** Layout engine configuration for responsive heavy operations and the inner grid */
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    /** Drag activation distance passed through to the inner grid. */
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
}>> & Readonly<{
    onLayoutChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:layouts"?: ((...args: any[]) => any) | undefined;
    onBreakpointChange?: ((...args: any[]) => any) | undefined;
    onWidthChange?: ((...args: any[]) => any) | undefined;
}>, {
    verticalCompact: boolean;
    compactType: CompactType;
    cols: BreakpointMap;
    allowOverlap: boolean;
    breakpoints: BreakpointMap;
    layouts: LayoutsMap;
    dragActivationDistance: GridDragActivationDistance;
    margin: [number, number] | MarginPaddingMap;
    containerPadding: [number, number] | MarginPaddingMap;
    layoutEngine: false | GridLayoutEngineProp;
    breakpoint: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default ResponsiveVueGridLayout;
