import type { ComputedRef, Ref } from "vue";
import { type PositionParams } from "../calculateUtils";
import type { DroppingPosition, GridDragEvent, Position, VueDraggableCallbackData } from "../utils";
import { type GridDragActivationDistance } from "../interaction-state-machine";
type PartialPosition = {
    top: number;
    left: number;
};
type GridItemDragCallback = (i: string, x: number, y: number, data: GridDragEvent) => void;
export type GridItemDragAttrs = {
    onDrag?: GridItemDragCallback;
    onDragStart?: GridItemDragCallback;
    onDragStop?: GridItemDragCallback;
};
type GridItemDragState = {
    dragging?: PartialPosition | null;
    resizing?: {
        top: number;
        left: number;
        width: number;
        height: number;
    } | null;
};
type GridItemDragProps = {
    containerWidth: number;
    dragActivationDistance?: GridDragActivationDistance;
    droppingPosition?: DroppingPosition | null;
    h: number;
    i: string;
    isBounded: boolean;
    margin: number[];
    rowHeight: number;
    w: number;
    x: number;
    y: number;
};
type UseGridItemDragOptions = {
    attrs: GridItemDragAttrs;
    elementRef: Ref<HTMLElement | null>;
    positionParams: ComputedRef<PositionParams>;
    props: GridItemDragProps;
    state: GridItemDragState;
};
export declare function useGridItemDrag({ attrs, elementRef, positionParams, props, state }: UseGridItemDragOptions): {
    moveDroppingItem: (prevDroppingPosition?: DroppingPosition | Partial<Position> | null) => void;
    onDrag: (e: Event, { node, deltaX, deltaY }: VueDraggableCallbackData) => void;
    onDragStart: (e: Event, { node }: VueDraggableCallbackData, forceActivate?: boolean) => void;
    onDragStop: (e: Event, { node }: VueDraggableCallbackData) => void;
};
export {};
