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
import {
  createGridInteractionInitialState,
  normalizeGridPointerKind,
  reduceGridInteraction,
  type GridDragActivationDistance,
  type GridInteractionState,
  type GridPointerKind
} from "../interaction-state-machine";

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

type PendingDrag = {
  interactionId: string;
  originGrid: { x: number, y: number };
  originPosition: PartialPosition;
  currentPosition: PartialPosition;
  node: HTMLElement;
  e: Event;
};

const gridXYFromPosition = (
  positionParams: PositionParams,
  position: PartialPosition,
  w: number,
  h: number
) => calcXY(positionParams, position.top, position.left, w, h);

const pointerKindFromEvent = (e: Event): GridPointerKind => {
  const pointerType = (e as PointerEvent).pointerType;
  if (pointerType) return normalizeGridPointerKind(pointerType);
  if ("touches" in e || "changedTouches" in e) return "touch";
  return "mouse";
};

export function useGridItemDrag({
  attrs,
  elementRef,
  positionParams,
  props,
  state
}: UseGridItemDragOptions) {
  let interactionSeq = 0;
  let machineState: GridInteractionState = createGridInteractionInitialState();
  let pendingDrag: PendingDrag | null = null;

  const hasDragLifecycle = () =>
    Boolean(attrs.onDragStart || attrs.onDrag || attrs.onDragStop);

  const resetDragMachine = () => {
    machineState = createGridInteractionInitialState();
    pendingDrag = null;
  };

  const onDragStart = (
    e: Event,
    { node }: VueDraggableCallbackData,
    forceActivate = false
  ) => {
    if (!hasDragLifecycle()) return;

    const pos = calcGridItemPosition(
      positionParams.value,
      props.x,
      props.y,
      props.w,
      props.h,
      state
    );
    const newPosition: PartialPosition = { top: pos.top, left: pos.left };
    const { x, y } = gridXYFromPosition(
      positionParams.value,
      newPosition,
      props.w,
      props.h
    );

    const interactionId = `item-drag:${props.i}:${++interactionSeq}`;
    const activationDistance = forceActivate ? 0 : props.dragActivationDistance;
    const armed = reduceGridInteraction(machineState, {
      type: "ARM_DRAG",
      interactionId,
      itemId: props.i,
      pointerKind: pointerKindFromEvent(e),
      originPx: { x: newPosition.left, y: newPosition.top },
      originGrid: { x, y }
    }, { dragActivationDistance: activationDistance });

    machineState = armed.state;
    pendingDrag = {
      interactionId,
      originGrid: { x, y },
      originPosition: newPosition,
      currentPosition: newPosition,
      node,
      e
    };

    const shouldStart = armed.effects.some(effect => effect.type === "EMIT_DRAG_START");
    if (shouldStart) {
      state.dragging = newPosition;
      attrs.onDragStart?.(props.i, x, y, {
        e,
        node,
        newPosition
      });
    }
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
    const bottomBoundary = offsetParent.clientHeight - calcGridItemWHPx(
      h,
      rowHeight,
      margin[1],
      positionParams.value.renderPrecision
    );
    top = clamp(top, 0, bottomBoundary);

    const colWidth = calcGridColWidth(positionParams.value);
    const rightBoundary =
      containerWidth - calcGridItemWHPx(w, colWidth, margin[0], positionParams.value.renderPrecision);
    left = clamp(left, 0, rightBoundary);

    return { top, left };
  };

  const onDrag = (
    e: Event,
    { node, deltaX, deltaY }: VueDraggableCallbackData
  ) => {
    if (!hasDragLifecycle()) return;
    if (!pendingDrag && !state.dragging) {
      throw new Error("onDrag called before onDragStart.");
    }
    const currentPosition = state.dragging || pendingDrag?.currentPosition;
    if (!currentPosition) return;
    const nextPosition = resolveBoundedPosition(node, {
      top: currentPosition.top + deltaY,
      left: currentPosition.left + deltaX
    });

    if (pendingDrag) {
      pendingDrag.currentPosition = nextPosition;
      pendingDrag.node = node;
      pendingDrag.e = e;
    }

    const { x, y } = gridXYFromPosition(
      positionParams.value,
      nextPosition,
      props.w,
      props.h
    );
    if (!pendingDrag) return;
    const moved = reduceGridInteraction(machineState, {
      type: "MOVE_DRAG",
      interactionId: pendingDrag.interactionId,
      currentPx: { x: nextPosition.left, y: nextPosition.top },
      grid: { x, y }
    }, { dragActivationDistance: props.dragActivationDistance });
    machineState = moved.state;

    for (const effect of moved.effects) {
      if (effect.type === "EMIT_DRAG_START") {
        state.dragging = pendingDrag.originPosition;
        attrs.onDragStart?.(props.i, pendingDrag.originGrid.x, pendingDrag.originGrid.y, {
          e: pendingDrag.e,
          node: pendingDrag.node,
          newPosition: pendingDrag.originPosition
        });
      }
      if (effect.type === "EMIT_DRAG") {
        state.dragging = nextPosition;
        attrs.onDrag?.(props.i, x, y, {
          e,
          node,
          newPosition: nextPosition
        });
      }
    }

    if (moved.state.status === "active-drag") {
      state.dragging = nextPosition;
    }
  };

  const onDragStop = (e: Event, { node }: VueDraggableCallbackData) => {
    if (!hasDragLifecycle()) return;
    if (!pendingDrag && !state.dragging) {
      throw new Error("onDragEnd called before onDragStart.");
    }
    const activePosition = state.dragging || pendingDrag?.currentPosition;
    if (!activePosition) return;
    const newPosition: PartialPosition = {
      top: activePosition.top,
      left: activePosition.left
    };
    const { x, y } = gridXYFromPosition(
      positionParams.value,
      newPosition,
      props.w,
      props.h
    );

    const wasActive = machineState.status === "active-drag";
    const interactionId = pendingDrag?.interactionId;
    if (interactionId) {
      const stopped = reduceGridInteraction(machineState, {
        type: "STOP_DRAG",
        interactionId,
        grid: { x, y }
      }, { dragActivationDistance: props.dragActivationDistance });
      machineState = stopped.state;
    }

    state.dragging = null;
    if (wasActive) {
      attrs.onDragStop?.(props.i, x, y, {
        e,
        node,
        newPosition
      });
    }
    resetDragMachine();
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
      }, true);
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
