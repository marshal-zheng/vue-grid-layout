import type { CompactType, Layout, LayoutItem } from "../utils";
export type PendingGridFrameUpdate = {
    cols: number;
    compactType: CompactType;
    layout?: Layout;
    placeholder: LayoutItem;
    shouldCompact: boolean;
};
type UseGridFrameUpdateOptions = {
    getLayout: () => Layout;
    setLayout: (layout: Layout) => void;
    setActiveDrag: (item: LayoutItem) => void;
};
export declare function useGridFrameUpdate({ getLayout, setLayout, setActiveDrag }: UseGridFrameUpdateOptions): {
    cancel: () => void;
    flush: () => void;
    schedule: (pending: PendingGridFrameUpdate) => void;
    resetMovedFlags: (layout: Layout) => void;
};
export {};
