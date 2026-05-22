import { type PropType } from "vue";
import type { CompactType } from "../utils";
import { Breakpoints, ResponsiveLayout } from "../responsiveUtils";
import type { GridLayoutEngineProp } from "../layout-engine";
import type { GridDragActivationDistance } from "../interaction-state-machine";
import type { GridLayoutPersistenceController, LayoutsMap as PersistentLayoutsMap, ResponsiveGridLayoutPersistenceProp } from "../persistence";
import { type BreakpointMap, type LayoutsMap, type MarginPaddingMap } from "../responsive/useResponsiveGridLayoutModel";
import type { GridEditorProp } from "./types";
export interface EditorResponsiveGridLayoutProps<Breakpoint extends string = string> {
    breakpoint?: Breakpoint | null;
    breakpoints: Breakpoints<Breakpoint>;
    cols: Record<Breakpoint, number>;
    layouts: ResponsiveLayout<Breakpoint>;
    width: number;
    margin: Record<Breakpoint, [number, number]> | [number, number];
    containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
    persistence?: false | ResponsiveGridLayoutPersistenceProp | GridLayoutPersistenceController<PersistentLayoutsMap>;
    layoutEngine?: false | GridLayoutEngineProp;
    editor?: false | GridEditorProp;
    dragActivationDistance?: GridDragActivationDistance;
}
declare const EditorResponsiveGridLayout: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
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
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
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
    margin: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
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
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    width: {
        type: NumberConstructor;
        required: true;
    };
    compactType: {
        type: PropType<CompactType>;
        default: string;
        validator: (value: CompactType) => boolean;
    };
    persistence: {
        type: PropType<false | ResponsiveGridLayoutPersistenceProp | GridLayoutPersistenceController<PersistentLayoutsMap>>;
        default: boolean;
    };
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
    editor: {
        type: PropType<false | GridEditorProp>;
        default: boolean;
    };
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("layoutChange" | "update:layouts" | "breakpointChange" | "widthChange")[], "layoutChange" | "update:layouts" | "breakpointChange" | "widthChange", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    breakpoint: {
        type: StringConstructor;
        default: string;
    };
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
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
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
    margin: {
        type: PropType<MarginPaddingMap | [number, number]>;
        default: () => number[];
    };
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
    layouts: {
        type: PropType<LayoutsMap>;
        default: () => {};
    };
    width: {
        type: NumberConstructor;
        required: true;
    };
    compactType: {
        type: PropType<CompactType>;
        default: string;
        validator: (value: CompactType) => boolean;
    };
    persistence: {
        type: PropType<false | ResponsiveGridLayoutPersistenceProp | GridLayoutPersistenceController<PersistentLayoutsMap>>;
        default: boolean;
    };
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
    editor: {
        type: PropType<false | GridEditorProp>;
        default: boolean;
    };
}>> & Readonly<{
    onLayoutChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:layouts"?: ((...args: any[]) => any) | undefined;
    onBreakpointChange?: ((...args: any[]) => any) | undefined;
    onWidthChange?: ((...args: any[]) => any) | undefined;
}>, {
    verticalCompact: boolean;
    compactType: CompactType;
    editor: false | GridEditorProp;
    cols: BreakpointMap;
    allowOverlap: boolean;
    breakpoints: BreakpointMap;
    layouts: LayoutsMap;
    dragActivationDistance: GridDragActivationDistance;
    margin: [number, number] | MarginPaddingMap;
    containerPadding: [number, number] | MarginPaddingMap;
    layoutEngine: false | GridLayoutEngineProp;
    persistence: ResponsiveGridLayoutPersistenceProp | GridLayoutPersistenceController<PersistentLayoutsMap>;
    breakpoint: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default EditorResponsiveGridLayout;
