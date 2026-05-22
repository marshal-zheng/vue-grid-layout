import type { GridEditorController } from "../editor/types";
import type { GridEditorPlacementCursor } from "../editor/placementSession";
import type { CompactType } from "../utils";
export type GridPlacementGeometryOptions = {
    width?: number;
    cols: number;
    margin: number[];
    maxRows: number;
    rowHeight: number;
    containerPadding?: number[] | null;
    transformScale: number;
    compactType?: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
};
export type GridPlacementPointerOptions = GridPlacementGeometryOptions & {
    itemSize?: {
        w: number;
        h: number;
    };
};
export declare const pointerEventToGridEditorPlacementCursor: (event: MouseEvent | PointerEvent, options: GridPlacementPointerOptions) => GridEditorPlacementCursor;
export type UseGridPlacementInteractionsOptions = {
    controller: GridEditorController | null;
    getGeometry: () => GridPlacementGeometryOptions;
    stopEvent?: (event: Event) => void;
};
export declare function useGridPlacementInteractions({ controller, getGeometry, stopEvent }: UseGridPlacementInteractionsOptions): {
    isActive: () => boolean;
    onPointerMove: (event: MouseEvent | PointerEvent) => void;
    onClick: (event: MouseEvent) => boolean;
    cancel: (reason: string) => void;
};
