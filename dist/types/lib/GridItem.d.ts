import { VNode, CSSProperties, PropType } from 'vue';
import type { DroppingPosition } from "./utils";
import type { GridRenderPrecision } from "./grid-height";
import type { GridDragActivationDistance } from "./interaction-state-machine";
import { type GridItemDragAttrs } from "./grid-item/useGridItemDrag";
import { type GridItemResizeAttrs } from "./grid-item/useGridItemResize";
export type AttrsEvents = GridItemDragAttrs & GridItemResizeAttrs;
/**
 * An individual item within a VueGridLayout.
 */
declare const GridItem: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    cols: {
        type: NumberConstructor;
        required: true;
    };
    containerWidth: {
        type: NumberConstructor;
        required: true;
    };
    rowHeight: {
        type: NumberConstructor;
        required: true;
    };
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
    renderPrecision: {
        type: PropType<GridRenderPrecision>;
        default: string;
    };
    margin: {
        type: PropType<number[]>;
        required: true;
    };
    maxRows: {
        type: NumberConstructor;
        required: true;
    };
    containerPadding: {
        type: PropType<number[]>;
        required: true;
    };
    x: {
        type: NumberConstructor;
        required: true;
    };
    y: {
        type: NumberConstructor;
        required: true;
    };
    w: {
        type: NumberConstructor;
        required: true;
    };
    h: {
        type: NumberConstructor;
        required: true;
    };
    minW: {
        type: NumberConstructor;
        default: number;
    };
    maxW: {
        type: NumberConstructor;
        default: number;
    };
    minH: {
        type: NumberConstructor;
        default: number;
    };
    maxH: {
        type: NumberConstructor;
        default: number;
    };
    i: {
        type: StringConstructor;
        required: true;
    };
    resizeHandles: {
        type: PropType<Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">>;
        default: () => never[];
    };
    resizeHandle: {
        type: PropType<import("./VueGridLayoutPropTypes").ResizeHandle>;
    };
    onItemClick: {
        type: PropType<(event: MouseEvent) => void>;
        default: undefined;
    };
    isDraggable: {
        type: BooleanConstructor;
        required: true;
    };
    isResizable: {
        type: BooleanConstructor;
        required: true;
    };
    isBounded: {
        type: BooleanConstructor;
        required: true;
    };
    isDragBlocked: {
        type: BooleanConstructor;
        default: boolean;
    };
    isResizeBlocked: {
        type: BooleanConstructor;
        default: boolean;
    };
    static: BooleanConstructor;
    useCSSTransforms: {
        type: BooleanConstructor;
        required: true;
    };
    transformScale: {
        type: NumberConstructor;
        default: number;
    };
    class: {
        type: StringConstructor;
        default: string;
    };
    handle: {
        type: StringConstructor;
        default: string;
    };
    cancel: {
        type: StringConstructor;
        default: string;
    };
    droppingPosition: {
        type: PropType<DroppingPosition | null>;
        default: null;
    };
    usePercentages: {
        type: BooleanConstructor;
    };
    style: {
        type: PropType<CSSProperties>;
        default: () => {};
    };
}>, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    cols: {
        type: NumberConstructor;
        required: true;
    };
    containerWidth: {
        type: NumberConstructor;
        required: true;
    };
    rowHeight: {
        type: NumberConstructor;
        required: true;
    };
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
    renderPrecision: {
        type: PropType<GridRenderPrecision>;
        default: string;
    };
    margin: {
        type: PropType<number[]>;
        required: true;
    };
    maxRows: {
        type: NumberConstructor;
        required: true;
    };
    containerPadding: {
        type: PropType<number[]>;
        required: true;
    };
    x: {
        type: NumberConstructor;
        required: true;
    };
    y: {
        type: NumberConstructor;
        required: true;
    };
    w: {
        type: NumberConstructor;
        required: true;
    };
    h: {
        type: NumberConstructor;
        required: true;
    };
    minW: {
        type: NumberConstructor;
        default: number;
    };
    maxW: {
        type: NumberConstructor;
        default: number;
    };
    minH: {
        type: NumberConstructor;
        default: number;
    };
    maxH: {
        type: NumberConstructor;
        default: number;
    };
    i: {
        type: StringConstructor;
        required: true;
    };
    resizeHandles: {
        type: PropType<Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">>;
        default: () => never[];
    };
    resizeHandle: {
        type: PropType<import("./VueGridLayoutPropTypes").ResizeHandle>;
    };
    onItemClick: {
        type: PropType<(event: MouseEvent) => void>;
        default: undefined;
    };
    isDraggable: {
        type: BooleanConstructor;
        required: true;
    };
    isResizable: {
        type: BooleanConstructor;
        required: true;
    };
    isBounded: {
        type: BooleanConstructor;
        required: true;
    };
    isDragBlocked: {
        type: BooleanConstructor;
        default: boolean;
    };
    isResizeBlocked: {
        type: BooleanConstructor;
        default: boolean;
    };
    static: BooleanConstructor;
    useCSSTransforms: {
        type: BooleanConstructor;
        required: true;
    };
    transformScale: {
        type: NumberConstructor;
        default: number;
    };
    class: {
        type: StringConstructor;
        default: string;
    };
    handle: {
        type: StringConstructor;
        default: string;
    };
    cancel: {
        type: StringConstructor;
        default: string;
    };
    droppingPosition: {
        type: PropType<DroppingPosition | null>;
        default: null;
    };
    usePercentages: {
        type: BooleanConstructor;
    };
    style: {
        type: PropType<CSSProperties>;
        default: () => {};
    };
}>> & Readonly<{}>, {
    minW: number;
    minH: number;
    maxW: number;
    maxH: number;
    static: boolean;
    resizeHandles: ("s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne")[];
    handle: string;
    renderPrecision: GridRenderPrecision;
    class: string;
    style: CSSProperties;
    dragActivationDistance: GridDragActivationDistance;
    transformScale: number;
    cancel: string;
    droppingPosition: DroppingPosition | null;
    usePercentages: boolean;
    isDragBlocked: boolean;
    isResizeBlocked: boolean;
    onItemClick: (event: MouseEvent) => void;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default GridItem;
