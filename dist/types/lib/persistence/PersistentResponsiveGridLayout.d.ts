import { type PropType } from "vue";
import { type LayoutsMap } from "../responsive/useResponsiveGridLayoutModel";
import { type ResponsiveGridLayoutPersistenceProp } from "../persistence";
declare const PersistentResponsiveGridLayout: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    persistence: {
        type: PropType<Exclude<ResponsiveGridLayoutPersistenceProp, false>>;
        required: true;
    };
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
    breakpoints: {
        type: () => import("../responsive/useResponsiveGridLayoutModel").BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    cols: {
        type: () => import("../responsive/useResponsiveGridLayoutModel").BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    margin: {
        type: PropType<import("../responsive/useResponsiveGridLayoutModel").MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
    containerPadding: {
        type: PropType<import("../responsive/useResponsiveGridLayoutModel").MarginPaddingMap | [number, number]>;
        default: () => {
            lg: null;
            md: null;
            sm: null;
            xs: null;
            xxs: null;
        };
    };
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    width: {
        type: NumberConstructor;
        required: boolean;
    };
    compactType: {
        type: PropType<import("../utils").CompactType>;
        default: string;
        validator: (value: import("../utils").CompactType) => boolean;
    };
    layoutEngine: {
        type: PropType<false | import("../layout-engine").GridLayoutEngineProp>;
        default: undefined;
    };
    dragActivationDistance: {
        type: PropType<import("../interaction-state-machine").GridDragActivationDistance>;
        default: undefined;
    };
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("layoutChange" | "update:layouts" | "breakpointChange" | "widthChange")[], "layoutChange" | "update:layouts" | "breakpointChange" | "widthChange", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    persistence: {
        type: PropType<Exclude<ResponsiveGridLayoutPersistenceProp, false>>;
        required: true;
    };
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
    breakpoints: {
        type: () => import("../responsive/useResponsiveGridLayoutModel").BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    cols: {
        type: () => import("../responsive/useResponsiveGridLayoutModel").BreakpointMap;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    margin: {
        type: PropType<import("../responsive/useResponsiveGridLayoutModel").MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
    containerPadding: {
        type: PropType<import("../responsive/useResponsiveGridLayoutModel").MarginPaddingMap | [number, number]>;
        default: () => {
            lg: null;
            md: null;
            sm: null;
            xs: null;
            xxs: null;
        };
    };
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    width: {
        type: NumberConstructor;
        required: boolean;
    };
    compactType: {
        type: PropType<import("../utils").CompactType>;
        default: string;
        validator: (value: import("../utils").CompactType) => boolean;
    };
    layoutEngine: {
        type: PropType<false | import("../layout-engine").GridLayoutEngineProp>;
        default: undefined;
    };
    dragActivationDistance: {
        type: PropType<import("../interaction-state-machine").GridDragActivationDistance>;
        default: undefined;
    };
}>> & Readonly<{
    onLayoutChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:layouts"?: ((...args: any[]) => any) | undefined;
    onBreakpointChange?: ((...args: any[]) => any) | undefined;
    onWidthChange?: ((...args: any[]) => any) | undefined;
}>, {
    verticalCompact: boolean;
    compactType: import("../utils").CompactType;
    cols: import("../responsive/useResponsiveGridLayoutModel").BreakpointMap;
    allowOverlap: boolean;
    breakpoints: import("../responsive/useResponsiveGridLayoutModel").BreakpointMap;
    layouts: LayoutsMap;
    dragActivationDistance: import("../interaction-state-machine").GridDragActivationDistance;
    margin: [number, number] | import("../responsive/useResponsiveGridLayoutModel").MarginPaddingMap;
    containerPadding: [number, number] | import("../responsive/useResponsiveGridLayoutModel").MarginPaddingMap;
    layoutEngine: false | import("../layout-engine").GridLayoutEngineProp;
    breakpoint: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default PersistentResponsiveGridLayout;
