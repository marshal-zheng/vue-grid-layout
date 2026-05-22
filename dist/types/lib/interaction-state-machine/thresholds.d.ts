import type { GridDragActivationDistance, GridPointerKind, GridPoint } from "./types";
export declare const DEFAULT_DRAG_ACTIVATION_DISTANCE: {
    readonly mouse: 4;
    readonly pen: 4;
    readonly touch: 8;
    readonly coarse: 8;
    readonly default: 4;
};
export declare function normalizeGridPointerKind(pointerKind?: string | null): GridPointerKind;
export declare function resolveDragActivationDistance(distance: GridDragActivationDistance | undefined, pointerKind: GridPointerKind): number;
export declare function hasReachedDragActivationDistance(origin: GridPoint, current: GridPoint, threshold: number): boolean;
