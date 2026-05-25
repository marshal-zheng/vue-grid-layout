import { type VNode } from "vue";
import type { CompactType, DroppingPosition, Layout, LayoutItem } from "../utils";
import type { ExternalDropSession } from "./externalDropSession";
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
    externalDropSession: ExternalDropSession | null;
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
    emitModelValue: (layout: Layout | undefined) => void;
    emitLayoutChange: (layout: Layout | undefined) => void;
};
export declare function useGridLayoutModel({ props, emitModelValue, emitLayoutChange }: UseGridLayoutModelOptions): {
    state: GridLayoutState;
    onLayoutMaybeChanged: (newLayout: Layout, oldLayout?: Layout | null) => void;
    syncRenderedChildren: (newChildren: VNode[], options?: WatchLayoutDependenciesOptions) => Layout;
    watchLayoutDependencies: (options?: WatchLayoutDependenciesOptions) => import("vue").WatchHandle;
    stop: () => undefined;
};
export {};
