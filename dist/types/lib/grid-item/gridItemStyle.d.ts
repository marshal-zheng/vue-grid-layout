import clsx from "clsx";
import type { Position } from "../utils";
import type { Kv } from "../type";
type GridItemStyleOptions = {
    containerWidth: number;
    useCSSTransforms?: boolean;
    usePercentages?: boolean;
};
export declare function createGridItemPositionStyle(pos: Position, { containerWidth, useCSSTransforms, usePercentages }: GridItemStyleOptions): {
    [key: string]: string;
};
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
export declare function createGridItemClassName({ childClass, className, dropping, hasDragHandle, isDragBlocked, isDraggable, isDragging, isResizeBlocked, isResizing, isStatic, useCSSTransforms }: GridItemClassOptions): string;
export declare function createGridItemMergedStyle(propStyle: Kv | undefined, childStyle: unknown, positionStyle: {
    [key: string]: string;
}): {
    [x: string]: any;
};
export {};
