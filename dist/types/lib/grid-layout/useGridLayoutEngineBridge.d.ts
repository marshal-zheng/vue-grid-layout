import type { CompactType, Layout } from "../utils";
import type { GridLayoutEngineOptions, GridLayoutEngineProp, InteractionController, LayoutOperation, LayoutOperationResult } from "../layout-engine";
type GridLayoutEngineBridgeProps = {
    layoutEngine?: false | GridLayoutEngineProp;
    cols: number;
    maxRows: number;
    compactType: CompactType;
    verticalCompact: boolean;
    allowOverlap: boolean;
    preventCollision: boolean;
};
type UseGridLayoutEngineBridgeOptions = {
    props: GridLayoutEngineBridgeProps;
    getLayout: () => Layout;
};
export declare function useGridLayoutEngineBridge({ props, getLayout }: UseGridLayoutEngineBridgeOptions): {
    getLayoutEngineProp: () => GridLayoutEngineProp | null;
    getLayoutEngineOptions: () => GridLayoutEngineOptions;
    isLegacyLayoutEngine: () => boolean;
    reset: (layout?: Layout) => void;
    start: (interaction: Parameters<InteractionController["start"]>[0]) => import("../layout-engine").InteractionControllerState;
    rebase: (layout: Layout) => LayoutOperationResult | null;
    getCommitted: () => Layout;
    preview: (id: string, operation: LayoutOperation, apply: (result: LayoutOperationResult) => void, heavy?: boolean) => LayoutOperationResult | null;
    commit: (id: string, operation: LayoutOperation, apply: (result: LayoutOperationResult) => void, heavy?: boolean) => LayoutOperationResult | null;
    dispose: (reason?: string) => void;
};
export {};
