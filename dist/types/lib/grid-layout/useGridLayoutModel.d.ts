import { type VNode } from "vue";
import type { CompactType, DroppingPosition, Layout, LayoutItem } from "../utils";
export type GridLayoutState = {
    activeDrag: LayoutItem | null;
    layout: Layout;
    mounted: boolean;
    oldDragItem?: LayoutItem | null;
    oldLayout?: Layout | null;
    oldResizeItem?: LayoutItem | null;
    resizing: boolean;
    droppingDOMNode?: VNode | null;
    droppingPosition?: DroppingPosition;
    suppressLayoutChange?: boolean;
    compactType?: CompactType;
    children: VNode[];
};
type SynchronizedLayoutReconcileResult = {
    placeholder?: LayoutItem | null;
    clearActive?: boolean;
};
type WatchLayoutDependenciesOptions = {
    reconcileSynchronizedLayout?: (layout: Layout) => SynchronizedLayoutReconcileResult | void;
    clearActiveInteraction?: () => void;
};
type GridLayoutModelProps = {
    modelValue: Layout;
    cols: number;
    compactType: CompactType;
    verticalCompact: boolean;
    allowOverlap: boolean;
};
type UseGridLayoutModelOptions = {
    props: GridLayoutModelProps;
    slots: {
        default?: () => VNode[];
    };
    emitModelValue: (layout: Layout | undefined) => void;
    emitLayoutChange: (layout: Layout | undefined) => void;
};
export declare function useGridLayoutModel({ props, slots, emitModelValue, emitLayoutChange }: UseGridLayoutModelOptions): {
    state: GridLayoutState;
    onLayoutMaybeChanged: (newLayout: Layout, oldLayout?: Layout | null) => void;
    watchLayoutDependencies: (options?: WatchLayoutDependenciesOptions) => import("vue").WatchHandle;
    stop: () => undefined;
};
export {};
