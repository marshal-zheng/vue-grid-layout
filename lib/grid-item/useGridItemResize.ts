import { computed, type ComputedRef } from "vue";
import {
  calcGridItemPosition,
  calcWH,
  clamp,
  type PositionParams
} from "../calculateUtils";
import { resizeItemInDirection } from "../utils";
import type {
  GridResizeEvent,
  Position,
  ResizeHandleAxis
} from "../utils";

type GridItemResizeCallback = (
  i: string,
  w: number,
  h: number,
  data: GridResizeEvent
) => void;

export type GridItemResizeAttrs = {
  onResize?: GridItemResizeCallback;
  onResizeStart?: GridItemResizeCallback;
  onResizeStop?: GridItemResizeCallback;
};

export type ResizeCallbackData = {
  node: HTMLElement,
  size: Position,
  handle: ResizeHandleAxis
};

export type GridItemResizeVendorCallback = (
  e: Event,
  data: ResizeCallbackData,
  position: Position
) => void;

type GridItemResizeState = {
  resizing?: { top: number, left: number, width: number, height: number } | null;
};

type GridItemResizeProps = {
  cols: number;
  containerWidth: number;
  h: number;
  i: string;
  maxH: number;
  maxW: number;
  minH: number;
  minW: number;
  x: number;
  y: number;
};

type UseGridItemResizeOptions = {
  attrs: GridItemResizeAttrs;
  positionParams: ComputedRef<PositionParams>;
  props: GridItemResizeProps;
  state: GridItemResizeState;
};

export function useGridItemResize({
  attrs,
  positionParams,
  props,
  state
}: UseGridItemResizeOptions) {
  const resizeConstraints = computed(() => {
    const { cols, minW, minH, maxW, maxH } = props;
    const positionParamsValue = positionParams.value;

    const maxWidth = calcGridItemPosition(positionParamsValue, 0, 0, cols, 0).width;
    const mins = calcGridItemPosition(positionParamsValue, 0, 0, minW, minH);
    const maxes = calcGridItemPosition(positionParamsValue, 0, 0, maxW, maxH);

    return {
      minConstraints: [mins.width, mins.height] as [number, number],
      maxConstraints: [
        Math.min(maxes.width, maxWidth),
        Math.min(maxes.height, Infinity)
      ] as [number, number]
    };
  });

  const onResizeHandler = (
    e: Event,
    { node, size, handle }: ResizeCallbackData,
    position: Position,
    handlerName: keyof GridItemResizeAttrs
  ): void => {
    const handler = attrs[handlerName];
    if (!handler) return;
    const { x, y, i, maxH, minH, maxW, minW, containerWidth } = props;

    let updatedSize = size;
    if (node) {
      updatedSize = resizeItemInDirection(
        handle,
        position,
        size,
        containerWidth
      );
      state.resizing = handlerName === "onResizeStop" ? null : updatedSize;
    }

    let { w, h } = calcWH(
      positionParams.value,
      updatedSize.width,
      updatedSize.height,
      x,
      y,
      handle
    );

    w = clamp(w, Math.max(minW, 1), maxW);
    h = clamp(h, minH, maxH);

    handler.call(undefined, i, w, h, { e, node, size: updatedSize, handle });
  };

  const onResizeStop: GridItemResizeVendorCallback = (e, callbackData, position) =>
    onResizeHandler(e, callbackData, position, "onResizeStop");

  const onResizeStart: GridItemResizeVendorCallback = (e, callbackData, position) =>
    onResizeHandler(e, callbackData, position, "onResizeStart");

  const onResize: GridItemResizeVendorCallback = (e, callbackData, position) =>
    onResizeHandler(e, callbackData, position, "onResize");

  const curryResizeHandler = (
    position: Position,
    handler: GridItemResizeVendorCallback
  ) => (e: Event, data: ResizeCallbackData) => handler(e, data, position);

  return {
    curryResizeHandler,
    onResize,
    onResizeStart,
    onResizeStop,
    resizeConstraints
  };
}
