import type { GridEditorController, GridEditorPlacementCursor } from "../editor";
import { calcXY, type PositionParams } from "../calculateUtils";
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
  itemSize?: { w: number; h: number };
};

const isElement = (value: unknown): value is Element =>
  Boolean(value && typeof value === "object" && "getBoundingClientRect" in value);

export const pointerEventToGridEditorPlacementCursor = (
  event: MouseEvent | PointerEvent,
  options: GridPlacementPointerOptions
): GridEditorPlacementCursor => {
  const rect = isElement(event.currentTarget)
    ? event.currentTarget.getBoundingClientRect()
    : { left: 0, top: 0 };
  const scale = options.transformScale || 1;
  const layerX = (event.clientX - rect.left) / scale;
  const layerY = (event.clientY - rect.top) / scale;
  const size = options.itemSize || { w: 1, h: 1 };
  const positionParams: PositionParams = {
    cols: options.cols,
    margin: options.margin,
    maxRows: options.maxRows,
    rowHeight: options.rowHeight,
    containerWidth: options.width || 0,
    containerPadding: options.containerPadding || options.margin
  };
  const grid = calcXY(positionParams, layerY, layerX, size.w, size.h);
  return {
    x: grid.x,
    y: grid.y,
    source: "pointer",
    clientX: event.clientX,
    clientY: event.clientY
  };
};

export type UseGridPlacementInteractionsOptions = {
  controller: GridEditorController | null;
  getGeometry: () => GridPlacementGeometryOptions;
  stopEvent?: (event: Event) => void;
};

export function useGridPlacementInteractions({
  controller,
  getGeometry,
  stopEvent
}: UseGridPlacementInteractionsOptions) {
  const isActive = () => Boolean(controller?.placementSession.value);
  const itemSize = () => {
    const session = controller?.placementSession.value;
    const first = session?.ghostItems[0]?.item || session?.items[0];
    return first ? { w: first.w, h: first.h } : { w: 1, h: 1 };
  };

  const onPointerMove = (event: MouseEvent | PointerEvent) => {
    if (!controller?.placementSession.value) return;
    const geometry = getGeometry();
    const cursor = pointerEventToGridEditorPlacementCursor(event, {
      ...geometry,
      itemSize: itemSize()
    });
    controller.updatePlacement({
      cursor,
      compactType: geometry.compactType,
      allowOverlap: geometry.allowOverlap,
      preventCollision: geometry.preventCollision
    });
  };

  const onClick = (event: MouseEvent) => {
    if (!controller?.placementSession.value) return false;
    stopEvent?.(event);
    void controller.commitPlacement({ source: "pointer" });
    return true;
  };

  const cancel = (reason: string) => {
    if (!controller?.placementSession.value) return;
    controller.cancelPlacement(reason);
  };

  return {
    isActive,
    onPointerMove,
    onClick,
    cancel
  };
}
