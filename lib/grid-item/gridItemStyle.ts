import clsx from "clsx";
import { perc, setTopLeft, setTransform } from "../utils";
import type { Position } from "../utils";
import type { Kv } from "../type";

type GridItemStyleOptions = {
  containerWidth: number;
  useCSSTransforms?: boolean;
  usePercentages?: boolean;
};

export function createGridItemPositionStyle(
  pos: Position,
  {
    containerWidth,
    useCSSTransforms,
    usePercentages
  }: GridItemStyleOptions
): { [key: string]: string } {
  if (useCSSTransforms) {
    return setTransform(pos);
  }

  const style = setTopLeft(pos);

  if (usePercentages) {
    style.left = perc(pos.left / containerWidth);
    style.width = perc(pos.width / containerWidth);
  }

  return style;
}

type GridItemClassOptions = {
  childClass?: Parameters<typeof clsx>[number];
  className?: string;
  dropping: boolean;
  hasDragHandle: boolean;
  isDragBlocked: boolean;
  isDraggable: boolean;
  isDragging: boolean;
  isResizeBlocked: boolean;
  isResizing: boolean;
  isStatic?: boolean;
  useCSSTransforms?: boolean;
};

export function createGridItemClassName({
  childClass,
  className,
  dropping,
  hasDragHandle,
  isDragBlocked,
  isDraggable,
  isDragging,
  isResizeBlocked,
  isResizing,
  isStatic,
  useCSSTransforms
}: GridItemClassOptions) {
  return clsx(
    "vue-grid-item",
    childClass,
    className,
    {
      static: isStatic,
      resizing: isResizing,
      "vue-draggable": isDraggable,
      "has-drag-handle": hasDragHandle,
      "drag-blocked": isDragBlocked,
      "resize-blocked": isResizeBlocked,
      "vue-draggable-dragging": isDragging,
      dropping,
      cssTransforms: useCSSTransforms
    }
  );
}

export function createGridItemMergedStyle(
  propStyle: Kv | undefined,
  childStyle: unknown,
  positionStyle: { [key: string]: string }
) {
  return {
    ...(propStyle || {}),
    ...(childStyle && typeof childStyle === "object" ? childStyle as Kv : {}),
    ...positionStyle
  };
}
