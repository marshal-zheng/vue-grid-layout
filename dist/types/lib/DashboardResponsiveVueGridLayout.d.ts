import { type PropType } from "vue";
import { type Layout } from "./utils";
import type { GridEditorProp } from "./editor";
import type { GridHistoryStore } from "./history";
import type { GridLayoutEngineProp } from "./layout-engine";
import type { DashboardDocumentWriteBackOwner, DashboardLayoutDocument, DashboardResponsiveMode, DashboardTargetView, DashboardTargetViewRule } from "./dashboard-responsive";
import type { LayoutValidationMode } from "./persistence";
declare const DashboardResponsiveVueGridLayout: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    document: {
        type: PropType<DashboardLayoutDocument>;
        required: true;
    };
    width: {
        type: NumberConstructor;
        required: true;
    };
    breakpoints: {
        type: PropType<Record<string, number>>;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    breakpoint: {
        type: StringConstructor;
        default: null;
    };
    targetView: {
        type: PropType<DashboardTargetView | null>;
        default: null;
    };
    targetViewRule: {
        type: PropType<DashboardTargetViewRule>;
        default: undefined;
    };
    mode: {
        type: PropType<DashboardResponsiveMode>;
        default: string;
    };
    validation: {
        type: PropType<LayoutValidationMode>;
        default: string;
    };
    allowUnknownProfileItems: {
        type: BooleanConstructor;
        default: boolean;
    };
    createMissingProfileOnEdit: {
        type: BooleanConstructor;
        default: boolean;
    };
    documentWriteBack: {
        type: PropType<DashboardDocumentWriteBackOwner>;
        default: string;
    };
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    editor: {
        type: PropType<false | GridEditorProp>;
        default: boolean;
    };
    historyStore: {
        type: PropType<GridHistoryStore | undefined>;
        default: undefined;
    };
    class: {
        type: PropType<string>;
        default: string;
    };
    style: {
        type: PropType<import("vue").CSSProperties>;
        default: () => {};
    };
    autoSize: {
        type: PropType<boolean>;
        default: boolean;
    };
    heightMode: {
        type: PropType<import("./grid-height").GridHeightMode | null>;
        default: null;
        validator: (value: string | null) => boolean;
    };
    containerHeight: {
        type: PropType<number | null>;
        default: null;
    };
    autoMeasureContainerHeight: {
        type: PropType<boolean>;
        default: boolean;
    };
    minRowHeight: {
        type: PropType<number>;
        default: undefined;
    };
    renderPrecision: {
        type: PropType<import("./grid-height").GridRenderPrecision | null>;
        default: null;
        validator: (value: string | null) => boolean;
    };
    cols: {
        type: PropType<number>;
        default: number;
    };
    draggableCancel: {
        type: PropType<string>;
        default: string;
    };
    draggableCancelInteractiveElements: {
        type: PropType<boolean>;
        default: boolean;
    };
    draggableHandle: {
        type: PropType<string>;
        default: string;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    compactType: {
        type: PropType<import("./utils").CompactType>;
        default: string;
        validator: (value: import("./utils").CompactType) => boolean;
    };
    modelValue: {
        type: PropType<Layout>;
        default: () => never[];
        validator: (layout: unknown) => boolean;
    };
    margin: {
        type: PropType<Array<number>>;
        default: () => number[];
        validator: (value: number[]) => boolean;
    };
    containerPadding: {
        type: PropType<number[]>;
        validator: (value: number[]) => boolean;
    };
    rowHeight: {
        type: PropType<number>;
        default: number;
    };
    maxRows: {
        type: PropType<number>;
        default: number;
    };
    isBounded: {
        type: PropType<boolean>;
        default: boolean;
    };
    isDraggable: {
        type: PropType<boolean>;
        default: boolean;
    };
    isResizable: {
        type: PropType<boolean>;
        default: boolean;
    };
    allowOverlap: {
        type: PropType<boolean>;
        default: boolean;
    };
    preventCollision: {
        type: PropType<boolean>;
        default: boolean;
    };
    useCSSTransforms: {
        type: PropType<boolean>;
        default: boolean;
    };
    transformScale: {
        type: PropType<number>;
        default: number;
    };
    autoScroll: {
        type: PropType<boolean | {
            margin?: number;
            speed?: number;
        }>;
        default: boolean;
    };
    dragActivationDistance: {
        type: PropType<import("./interaction-state-machine").GridDragActivationDistance>;
        default: undefined;
    };
    isDroppable: {
        type: PropType<boolean>;
        default: boolean;
    };
    dropStrategy: {
        type: PropType<"cursor" | "auto">;
        default: string;
        validator: (value: string) => boolean;
    };
    resizeHandles: {
        type: PropType<Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">>;
        default: () => string[];
    };
    resizeHandle: {
        type: PropType<import("./VueGridLayoutPropTypes").ResizeHandle>;
    };
    droppingItem: {
        type: PropType<import("./VueGridLayoutPropTypes").DroppingItem>;
        default: () => {
            i: string;
            h: number;
            w: number;
        };
        validator: (value: import("./VueGridLayoutPropTypes").DroppingItem) => boolean;
    };
    innerRef: {
        type: PropType<import("vue").Ref<HTMLElement>>;
        default: () => null;
    };
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, string[], string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    document: {
        type: PropType<DashboardLayoutDocument>;
        required: true;
    };
    width: {
        type: NumberConstructor;
        required: true;
    };
    breakpoints: {
        type: PropType<Record<string, number>>;
        default: () => {
            lg: number;
            md: number;
            sm: number;
            xs: number;
            xxs: number;
        };
    };
    breakpoint: {
        type: StringConstructor;
        default: null;
    };
    targetView: {
        type: PropType<DashboardTargetView | null>;
        default: null;
    };
    targetViewRule: {
        type: PropType<DashboardTargetViewRule>;
        default: undefined;
    };
    mode: {
        type: PropType<DashboardResponsiveMode>;
        default: string;
    };
    validation: {
        type: PropType<LayoutValidationMode>;
        default: string;
    };
    allowUnknownProfileItems: {
        type: BooleanConstructor;
        default: boolean;
    };
    createMissingProfileOnEdit: {
        type: BooleanConstructor;
        default: boolean;
    };
    documentWriteBack: {
        type: PropType<DashboardDocumentWriteBackOwner>;
        default: string;
    };
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    editor: {
        type: PropType<false | GridEditorProp>;
        default: boolean;
    };
    historyStore: {
        type: PropType<GridHistoryStore | undefined>;
        default: undefined;
    };
    class: {
        type: PropType<string>;
        default: string;
    };
    style: {
        type: PropType<import("vue").CSSProperties>;
        default: () => {};
    };
    autoSize: {
        type: PropType<boolean>;
        default: boolean;
    };
    heightMode: {
        type: PropType<import("./grid-height").GridHeightMode | null>;
        default: null;
        validator: (value: string | null) => boolean;
    };
    containerHeight: {
        type: PropType<number | null>;
        default: null;
    };
    autoMeasureContainerHeight: {
        type: PropType<boolean>;
        default: boolean;
    };
    minRowHeight: {
        type: PropType<number>;
        default: undefined;
    };
    renderPrecision: {
        type: PropType<import("./grid-height").GridRenderPrecision | null>;
        default: null;
        validator: (value: string | null) => boolean;
    };
    cols: {
        type: PropType<number>;
        default: number;
    };
    draggableCancel: {
        type: PropType<string>;
        default: string;
    };
    draggableCancelInteractiveElements: {
        type: PropType<boolean>;
        default: boolean;
    };
    draggableHandle: {
        type: PropType<string>;
        default: string;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    compactType: {
        type: PropType<import("./utils").CompactType>;
        default: string;
        validator: (value: import("./utils").CompactType) => boolean;
    };
    modelValue: {
        type: PropType<Layout>;
        default: () => never[];
        validator: (layout: unknown) => boolean;
    };
    margin: {
        type: PropType<Array<number>>;
        default: () => number[];
        validator: (value: number[]) => boolean;
    };
    containerPadding: {
        type: PropType<number[]>;
        validator: (value: number[]) => boolean;
    };
    rowHeight: {
        type: PropType<number>;
        default: number;
    };
    maxRows: {
        type: PropType<number>;
        default: number;
    };
    isBounded: {
        type: PropType<boolean>;
        default: boolean;
    };
    isDraggable: {
        type: PropType<boolean>;
        default: boolean;
    };
    isResizable: {
        type: PropType<boolean>;
        default: boolean;
    };
    allowOverlap: {
        type: PropType<boolean>;
        default: boolean;
    };
    preventCollision: {
        type: PropType<boolean>;
        default: boolean;
    };
    useCSSTransforms: {
        type: PropType<boolean>;
        default: boolean;
    };
    transformScale: {
        type: PropType<number>;
        default: number;
    };
    autoScroll: {
        type: PropType<boolean | {
            margin?: number;
            speed?: number;
        }>;
        default: boolean;
    };
    dragActivationDistance: {
        type: PropType<import("./interaction-state-machine").GridDragActivationDistance>;
        default: undefined;
    };
    isDroppable: {
        type: PropType<boolean>;
        default: boolean;
    };
    dropStrategy: {
        type: PropType<"cursor" | "auto">;
        default: string;
        validator: (value: string) => boolean;
    };
    resizeHandles: {
        type: PropType<Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">>;
        default: () => string[];
    };
    resizeHandle: {
        type: PropType<import("./VueGridLayoutPropTypes").ResizeHandle>;
    };
    droppingItem: {
        type: PropType<import("./VueGridLayoutPropTypes").DroppingItem>;
        default: () => {
            i: string;
            h: number;
            w: number;
        };
        validator: (value: import("./VueGridLayoutPropTypes").DroppingItem) => boolean;
    };
    innerRef: {
        type: PropType<import("vue").Ref<HTMLElement>>;
        default: () => null;
    };
}>> & Readonly<{
    [x: `on${Capitalize<string>}`]: ((...args: any[]) => any) | undefined;
}>, {
    isDraggable: boolean;
    isResizable: boolean;
    resizeHandles: ("s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne")[];
    isBounded: boolean;
    verticalCompact: boolean;
    compactType: import("./utils").CompactType;
    editor: false | GridEditorProp;
    maxRows: number;
    cols: number;
    preventCollision: boolean;
    allowOverlap: boolean;
    breakpoints: Record<string, number>;
    targetView: DashboardTargetView | null;
    rowHeight: number;
    containerHeight: number | null;
    minRowHeight: number;
    heightMode: import("./grid-height").GridHeightMode | null;
    renderPrecision: import("./grid-height").GridRenderPrecision | null;
    autoMeasureContainerHeight: boolean;
    class: string;
    style: import("vue").CSSProperties;
    autoSize: boolean;
    autoScroll: boolean | {
        margin?: number;
        speed?: number;
    };
    dragActivationDistance: import("./interaction-state-machine").GridDragActivationDistance;
    draggableCancel: string;
    draggableCancelInteractiveElements: boolean;
    draggableHandle: string;
    modelValue: Layout;
    margin: number[];
    isDroppable: boolean;
    dropStrategy: "cursor" | "auto";
    useCSSTransforms: boolean;
    transformScale: number;
    droppingItem: import("./VueGridLayoutPropTypes").DroppingItem;
    layoutEngine: false | GridLayoutEngineProp;
    innerRef: import("vue").Ref<HTMLElement, HTMLElement>;
    validation: LayoutValidationMode;
    breakpoint: string;
    mode: DashboardResponsiveMode;
    createMissingProfileOnEdit: boolean;
    targetViewRule: DashboardTargetViewRule;
    allowUnknownProfileItems: boolean;
    documentWriteBack: DashboardDocumentWriteBackOwner;
    historyStore: GridHistoryStore | undefined;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default DashboardResponsiveVueGridLayout;
