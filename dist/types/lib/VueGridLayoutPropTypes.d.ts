import { VNode, Ref, PropType, CSSProperties } from 'vue';
import type { CompactType, Layout, ResizeHandleAxis } from "./utils";
import type { GridLayoutEngineProp } from './layout-engine';
import type { GridHeightMode, GridRenderPrecision } from './grid-height';
import type { GridDragActivationDistance } from './interaction-state-machine';
export interface DroppingItem {
    i: string;
    w: number;
    h: number;
}
export type VueRef<T extends HTMLElement> = Ref<T | null>;
export type ResizeHandle = VNode | ((resizeHandleAxis: ResizeHandleAxis, ref: VueRef<HTMLElement>) => VNode);
export declare const resizeHandleAxesType: {
    type: PropType<Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">>;
    default: () => never[];
};
export declare const resizeHandleType: {
    type: PropType<ResizeHandle>;
};
export type Props = {
    class: string;
    style: CSSProperties;
    width: number;
    autoSize: boolean;
    heightMode?: GridHeightMode | null;
    containerHeight?: number | null;
    autoMeasureContainerHeight?: boolean;
    minRowHeight?: number;
    renderPrecision?: GridRenderPrecision | null;
    autoScroll?: boolean | {
        margin?: number;
        speed?: number;
    };
    dragActivationDistance?: GridDragActivationDistance;
    cols: number;
    draggableCancel: string;
    draggableHandle: string;
    verticalCompact: boolean;
    compactType: CompactType;
    modelValue: Layout;
    margin: number[];
    containerPadding?: number[] | null;
    rowHeight: number;
    maxRows: number;
    isBounded: boolean;
    isDraggable: boolean;
    isResizable: boolean;
    isDroppable: boolean;
    dropStrategy: 'cursor' | 'auto';
    preventCollision: boolean;
    useCSSTransforms: boolean;
    transformScale: number;
    droppingItem: DroppingItem;
    resizeHandles: ResizeHandleAxis[];
    resizeHandle?: ResizeHandle;
    allowOverlap: boolean;
    layoutEngine?: false | GridLayoutEngineProp;
    innerRef?: Ref<HTMLElement | null>;
};
export type DefaultProps = Omit<Props, 'width'>;
export declare const basicProps: {
    /** Additional CSS class for the container */
    class: {
        type: PropType<string>;
        default: string;
    };
    /** Inline style object for the container */
    style: {
        type: PropType<CSSProperties>;
        default: () => {};
    };
    /** Container width (px); auto-measured via WidthProvider if not provided */
    width: {
        type: NumberConstructor;
    };
    /** Automatically adjust container height based on content */
    autoSize: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Runtime height mode. Explicit values take precedence over legacy autoSize. */
    heightMode: {
        type: PropType<GridHeightMode | null>;
        default: null;
        validator: (value: string | null) => boolean;
    };
    /** Controlled grid container height in px for fixed, scroll, and fit modes. */
    containerHeight: {
        type: PropType<number | null>;
        default: null;
    };
    /** Measure the grid root parent content box when no controlled containerHeight is provided. */
    autoMeasureContainerHeight: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Minimum usable row height for fit mode before falling back to scroll. */
    minRowHeight: {
        type: PropType<number>;
        default: undefined;
    };
    /** Final CSS pixel precision for item geometry. */
    renderPrecision: {
        type: PropType<GridRenderPrecision | null>;
        default: null;
        validator: (value: string | null) => boolean;
    };
    /** Number of columns, default 12 */
    cols: {
        type: PropType<number>;
        default: number;
    };
    /** CSS selector for elements that should not trigger drag (requires . prefix) */
    draggableCancel: {
        type: PropType<string>;
        default: string;
    };
    /** CSS selector for drag handle elements (requires . prefix) */
    draggableHandle: {
        type: PropType<string>;
        default: string;
    };
    /** Vertical compact layout (deprecated, use compactType) */
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Compaction direction: vertical / horizontal / null (no compaction) */
    compactType: {
        type: PropType<CompactType>;
        default: string;
        validator: (value: CompactType) => boolean;
    };
    /** Layout array, supports v-model two-way binding */
    modelValue: {
        type: PropType<Layout>;
        default: () => never[];
        validator: (layout: unknown) => boolean;
    };
    /** Grid spacing [x, y] in px, default [10, 10] */
    margin: {
        type: PropType<Array<number>>;
        default: () => number[];
        validator: (value: number[]) => boolean;
    };
    /** Container padding [x, y] in px, defaults to margin value */
    containerPadding: {
        type: PropType<number[]>;
        validator: (value: number[]) => boolean;
    };
    /** Row height (px), default 150 */
    rowHeight: {
        type: PropType<number>;
        default: number;
    };
    /** Maximum number of rows, default Infinity (no limit) */
    maxRows: {
        type: PropType<number>;
        default: number;
    };
    /** Restrict dragging within container boundaries */
    isBounded: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Globally enable dragging, default true */
    isDraggable: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Globally enable resizing, default true */
    isResizable: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Allow grid items to overlap, automatically enables preventCollision */
    allowOverlap: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Prevent collision mode, items won't push others when dragging */
    preventCollision: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Use CSS transform for positioning (better performance), default true */
    useCSSTransforms: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Set scale ratio when parent has CSS scale transform */
    transformScale: {
        type: PropType<number>;
        default: number;
    };
    /** Auto-scroll when dragging near edges; accepts boolean or { margin, speed } object */
    autoScroll: {
        type: PropType<boolean | {
            margin?: number;
            speed?: number;
        }>;
        default: boolean;
    };
    /** Drag activation distance in px; default mouse/pen 4px, touch/coarse 8px. */
    dragActivationDistance: {
        type: PropType<GridDragActivationDistance>;
        default: undefined;
    };
    /** Allow dropping elements from outside, requires @drop and @dropDragOver handlers */
    isDroppable: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Drop positioning strategy: cursor (mouse position) / auto (auto-snap) */
    dropStrategy: {
        type: PropType<"cursor" | "auto">;
        default: string;
        validator: (value: string) => boolean;
    };
    /** Array of enabled resize handle directions, e.g. ["se", "n", "e"] */
    resizeHandles: {
        type: PropType<Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">>;
        default: () => string[];
    };
    /** Custom resize handle render function or VNode */
    resizeHandle: {
        type: PropType<ResizeHandle>;
    };
    /** Layout engine configuration; false or { mode: "legacy" } uses the legacy path */
    layoutEngine: {
        type: PropType<false | GridLayoutEngineProp>;
        default: undefined;
    };
    /** Placeholder config for external drop { i, w, h } */
    droppingItem: {
        type: PropType<DroppingItem>;
        default: () => {
            i: string;
            h: number;
            w: number;
        };
        validator: (value: DroppingItem) => boolean;
    };
    /** Ref reference to container DOM element */
    innerRef: {
        type: PropType<Ref<HTMLElement>>;
        default: () => null;
    };
};
