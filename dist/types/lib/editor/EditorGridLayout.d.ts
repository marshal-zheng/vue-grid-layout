import { type PropType } from "vue";
import type { GridLayoutPersistenceController, GridLayoutPersistenceProp } from "../persistence";
import type { Layout } from "../utils";
import type { GridEditorProp } from "./types";
import type { GridItemAspectRatioConstraint, ResolvedGridItemCapability } from "../item-capabilities";
export declare const editorGridLayoutProps: {
    editor: {
        type: PropType<false | GridEditorProp>;
        default: boolean;
    };
    persistence: {
        type: PropType<false | GridLayoutPersistenceProp | GridLayoutPersistenceController<Layout>>;
        default: boolean;
    };
    itemCapabilities: {
        type: PropType<Record<string, ResolvedGridItemCapability> | undefined>;
        default: undefined;
    };
    resizeConstraints: {
        type: PropType<Record<string, GridItemAspectRatioConstraint> | undefined>;
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
    width: {
        type: NumberConstructor;
    };
    autoSize: {
        type: PropType<boolean>;
        default: boolean;
    };
    heightMode: {
        type: PropType<import("../grid-height").GridHeightMode | null>;
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
        type: PropType<import("../grid-height").GridRenderPrecision | null>;
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
    draggableHandle: {
        type: PropType<string>;
        default: string;
    };
    verticalCompact: {
        type: BooleanConstructor;
        default: boolean;
    };
    compactType: {
        type: PropType<import("../utils").CompactType>;
        default: string;
        validator: (value: import("../utils").CompactType) => boolean;
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
        type: PropType<import("../interaction-state-machine").GridDragActivationDistance>;
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
        type: PropType<import("../VueGridLayoutPropTypes").ResizeHandle>;
    };
    layoutEngine: {
        type: PropType<false | import("../layout-engine").GridLayoutEngineProp>;
        default: undefined;
    };
    droppingItem: {
        type: PropType<import("../VueGridLayoutPropTypes").DroppingItem>;
        default: () => {
            i: string;
            h: number;
            w: number;
        };
        validator: (value: import("../VueGridLayoutPropTypes").DroppingItem) => boolean;
    };
    innerRef: {
        type: PropType<import("vue").Ref<HTMLElement>>;
        default: () => null;
    };
};
declare const EditorGridLayout: import("vue").DefineComponent<{}, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, string[], string, import("vue").PublicProps, Readonly<{}> & Readonly<{
    [x: `on${Capitalize<string>}`]: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default EditorGridLayout;
