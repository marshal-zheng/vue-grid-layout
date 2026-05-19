import type { ComputedRef, Ref } from "vue";
import {
  calcGridColWidth,
  calcGridItemPosition,
  calcGridItemWHPx,
  calcXY,
  clamp,
  type PositionParams
} from "../calculateUtils";
import type {
  DroppingPosition,
  GridDragEvent,
  Position,
  VueDraggableCallbackData
} from "../utils";

type PartialPosition = { top: number, left: number };

type GridItemDragCallback = (
  i: string,
  x: number,
  y: number,
  data: GridDragEvent
) => void;

export type GridItemDragAttrs = {
  onDrag?: GridItemDragCallback;
  onDragStart?: GridItemDragCallback;
  onDragStop?: GridItemDragCallback;
};

type GridItemDragState = {
  dragging?: PartialPosition | null;
  resizing?: { top: number, left: number, width: number, height: number } | null;
};

type GridItemDragProps = {
  containerWidth: number;
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

const gridXYFromPosition = (
  positionParams: PositionParams,
  position: PartialPosition,
  w: number,
  h: number
) => calcXY(positionParams, position.top, position.left, w, h);

export function useGridItemDrag({
  attrs,
  elementRef,
  positionParams,
  props,
  state
}: UseGridItemDragOptions) {
  const onDragStart = (e: Event, { node }: VueDraggableCallbackData) => {
    const dragStart = attrs.onDragStart;
    if (!dragStart) return;

    const pos = calcGridItemPosition(
      positionParams.value,
      props.x,
      props.y,
      props.w,
      props.h,
      state
    );
    const newPosition: PartialPosition = { top: pos.top, left: pos.left };
    state.dragging = newPosition;

    const { x, y } = gridXYFromPosition(
      positionParams.value,
      newPosition,
      props.w,
      props.h
    );

    dragStart(props.i, x, y, {
      e,
      node,
      newPosition
    });
  };

  const resolveBoundedPosition = (
    node: HTMLElement,
    position: PartialPosition
  ): PartialPosition => {
    let { top, left } = position;
    const { isBounded, w, h, containerWidth } = props;
    if (!isBounded) return position;

    const { offsetParent } = node;
    if (!offsetParent) return position;

    const { margin, rowHeight } = props;
    const bottomBoundary = offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1]);
    top = clamp(top, 0, bottomBoundary);

    const colWidth = calcGridColWidth(positionParams.value);
    const rightBoundary =
      containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
    left = clamp(left, 0, rightBoundary);

    return { top, left };
  };

  const onDrag = (
    e: Event,
    { node, deltaX, deltaY }: VueDraggableCallbackData
  ) => {
    const drag = attrs.onDrag;
    if (!drag) return;

    if (!state.dragging) {
      throw new Error("onDrag called before onDragStart.");
    }
    const nextPosition = resolveBoundedPosition(node, {
      top: state.dragging.top + deltaY,
      left: state.dragging.left + deltaX
    });

    state.dragging = nextPosition;

    const { x, y } = gridXYFromPosition(
      positionParams.value,
      nextPosition,
      props.w,
      props.h
    );
    drag(props.i, x, y, {
      e,
      node,
      newPosition: nextPosition
    });
  };

  const onDragStop = (e: Event, { node }: VueDraggableCallbackData) => {
    const dragStop = attrs.onDragStop;
    if (!dragStop) return;

    if (!state.dragging) {
      throw new Error("onDragEnd called before onDragStart.");
    }
    const newPosition: PartialPosition = {
      top: state.dragging.top,
      left: state.dragging.left
    };
    state.dragging = null;

    const { x, y } = gridXYFromPosition(
      positionParams.value,
      newPosition,
      props.w,
      props.h
    );

    dragStop(props.i, x, y, {
      e,
      node,
      newPosition
    });
  };

  const moveDroppingItem = (
    prevDroppingPosition?: DroppingPosition | Partial<Position> | null
  ) => {
    const { droppingPosition } = props;
    if (!droppingPosition) return;
    const node = elementRef.value;
    if (!node) return;

    const prevPosition = prevDroppingPosition || { left: 0, top: 0 };
    const { dragging } = state;

    const shouldDrag =
      (dragging && droppingPosition.left !== prevPosition.left) ||
      droppingPosition.top !== prevPosition.top;

    if (!dragging) {
      onDragStart(droppingPosition.e, {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top
      });
    } else if (shouldDrag) {
      const deltaX = droppingPosition.left - dragging.left;
      const deltaY = droppingPosition.top - dragging.top;

      onDrag(droppingPosition.e, {
        node,
        deltaX,
        deltaY
      });
    }
  };

  return {
    moveDroppingItem,
    onDrag,
    onDragStart,
    onDragStop
  };
}
