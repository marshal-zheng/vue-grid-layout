import { deepEqual } from "fast-equals";
import { VNode, Fragment } from 'vue'
import { isArray } from "lodash";

import type { Kv } from './type'

export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";

export type LayoutItem = {
  w: number,
  h: number,
  x: number,
  y: number,
  i: string,
  minW?: number,
  minH?: number,
  maxW?: number,
  maxH?: number,
  moved?: boolean,
  static?: boolean,
  isDraggable?: boolean,
  isResizable?: boolean,
  resizeHandles?: Array<ResizeHandleAxis>,
  isBounded?: boolean
};
export type Layout = LayoutItem[];
export type Position = {
  left: number,
  top: number,
  width: number,
  height: number
};
export type VueDraggableCallbackData = {
  node: HTMLElement,
  x?: number,
  y?: number,
  deltaX: number,
  deltaY: number,
  lastX?: number,
  lastY?: number
};

export type PartialPosition = { left: number, top: number };
export type DroppingPosition = { left: number, top: number, e: Event };
export type Size = { width: number, height: number };
export type GridDragEvent = {
  e: Event,
  node: HTMLElement,
  newPosition: PartialPosition
};
export type GridResizeEvent = {
  e: Event,
  node: HTMLElement,
  size: Size,
  handle: string
};

export type DragOverEvent = MouseEvent & {
  nativeEvent: {
    layerX: number;
    layerY: number;
  } & Event;
};

// Helpful port from TS
// export type Pick<FromType, Properties: { [string]: 0 }> = $Exact<
//   $ObjMapi<Properties, <K, V>(k: K, v: V) => $ElementType<FromType, K>>
// >;
export type Pick<FromType, Properties extends keyof FromType> = {
  [K in Properties]: FromType[K];
};
// export type Pick<FromType, Properties extends { [key: string]: 0 }> = {
//   [K in keyof Properties]: $ElementType<FromType, K>
// };

export type VueChildren = VNode[];

// All callbacks are of the signature (layout, oldItem, newItem, placeholder, e).
export type EventCallback = (
  layout: Layout,
  oldItem?: LayoutItem | null,
  newItem?: LayoutItem | null,
  placeholder?: LayoutItem,
  event?: Event,
  element?: HTMLElement
) => void;
export type CompactType = "horizontal" | "vertical" | null;

const isProduction = process.env.NODE_ENV === "production";
const DEBUG = false;

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
export function bottom(layout: Layout): number {
  let max = 0,
    bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

export function cloneLayout(layout: Layout): Layout {
  const newLayout = Array(layout.length);
  for (let i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i]);
  }
  return newLayout;
}

// Modify a layoutItem inside a layout. Returns a new Layout,
// does not mutate. Carries over all other LayoutItems unmodified.
export function modifyLayout(layout: Layout, layoutItem: LayoutItem): Layout {
  const newLayout = Array(layout.length);
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layoutItem.i === layout[i].i) {
      newLayout[i] = layoutItem;
    } else {
      newLayout[i] = layout[i];
    }
  }
  return newLayout;
}

// Function to be called to modify a layout item.
// Does defensive clones to ensure the layout is not modified.
export function withLayoutItem(
  layout: Layout,
  itemKey: string,
  cb: (item: LayoutItem) => LayoutItem
): [Layout, LayoutItem | null] {
  let index = -1;
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === itemKey) {
      index = i;
      break;
    }
  }
  if (index === -1) return [layout, null];

  const item = cb(cloneLayoutItem(layout[index])); // defensive clone then modify
  const nextLayout = layout.slice(0);
  nextLayout[index] = item;
  return [nextLayout, item];
}

// Fast path to cloning, since this is monomorphic
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  return {
    w: layoutItem.w,
    h: layoutItem.h,
    x: layoutItem.x,
    y: layoutItem.y,
    i: layoutItem.i,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    // These can be null/undefined
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable,
    resizeHandles: layoutItem.resizeHandles,
    isBounded: layoutItem.isBounded
  };
}

export function childrenEqual(a: VNode[], b: VNode[]): boolean {
  if (!isArray(a) || !isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i]?.key !== b[i]?.key) return false;
    if (!deepEqual(a[i]?.props?.["data-grid"], b[i]?.props?.["data-grid"])) {
      return false;
    }
  }
  return true;
}

export function getNonFragmentChildren(vnode: VNode): VNode[] {
  const result: VNode[] = [];
  
  function traverse(vnode: VNode) {
    if (vnode.type === Fragment) {
      const fragmentChildren = vnode.children as VNode[];
      for (const child of fragmentChildren) {
        traverse(child);
      }
    } else {
      result.push(vnode);
    }
  }

  traverse(vnode);
  return result;
}

/**
 * Given two layoutitems, check if they collide.
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1.i === l2.i) return false; // same element
  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
  return true; // boxes overlap
}

/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * Does not modify layout items (clones). Creates a new layout array.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @param  {Boolean} allowOverlap When `true`, allows overlapping grid items.
 * @return {Array}       Compacted Layout.
 */
export function compact(
  layout: Layout,
  compactType: CompactType,
  cols: number,
  allowOverlap?: boolean
): Layout {
  const compareWith = getStatics(layout);
  const collisionIndex = createCompactionCollisionIndex(compareWith, layout.length);
  // We go through the items by row and column.
  const sorted = sortLayoutItems(layout, compactType);
  const originalIndexById = new Map<string, number>();
  for (let i = 0; i < layout.length; i++) originalIndexById.set(layout[i].i, i);
  const sortedIndexById = new Map<string, number>();
  for (let i = 0; i < sorted.length; i++) sortedIndexById.set(sorted[i].i, i);
  // Holding for new items.
  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = cloneLayoutItem(sorted[i]);

    // Don't move static elements
    if (!l.static) {
      l = compactItem(
        compareWith,
        l,
        compactType,
        cols,
        sorted,
        allowOverlap,
        sortedIndexById,
        collisionIndex
      );

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
      addToCompactionCollisionIndex(collisionIndex, l, compareWith.length - 1);
    }

    // Add to output array to make sure they still come out in the right order.
    const originalIndex = originalIndexById.get(sorted[i].i);
    // Note: should always exist unless IDs are duplicated/corrupt.
    out[typeof originalIndex === "number" ? originalIndex : i] = l;

    // Clear moved flag, if it exists.
    l.moved = false;
  }

  return out;
}

// In-place variant of `compact()` used for hot paths.
// Mutates layout items; returns the original `layout` reference.
export function compactInPlace(
  layout: Layout,
  compactType: CompactType,
  cols: number,
  allowOverlap?: boolean
): Layout {
  const compareWith = getStatics(layout);
  const collisionIndex = createCompactionCollisionIndex(compareWith, layout.length);
  const sorted = sortLayoutItems(layout, compactType);
  const sortedIndexById = new Map<string, number>();
  for (let i = 0; i < sorted.length; i++) sortedIndexById.set(sorted[i].i, i);

  for (let i = 0, len = sorted.length; i < len; i++) {
    const l = sorted[i];
    if (!l) continue;

    if (!l.static) {
      compactItem(
        compareWith,
        l,
        compactType,
        cols,
        sorted,
        allowOverlap,
        sortedIndexById,
        collisionIndex
      );
      compareWith.push(l);
      addToCompactionCollisionIndex(collisionIndex, l, compareWith.length - 1);
    }

    l.moved = false;
  }

  return layout;
}

const heightWidth = { x: "w", y: "h" };
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */
function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: "x" | "y",
  itemIndex?: number,
  indexById?: Map<string, number>
) {
  const sizeProp = heightWidth[axis];
  item[axis] += 1;
  let startIndex = itemIndex;
  if (typeof startIndex !== "number") {
    const fromIndexMap = indexById?.get(item.i);
    if (typeof fromIndexMap === "number") {
      startIndex = fromIndexMap;
    } else {
      for (let i = 0; i < layout.length; i++) {
        if (layout[i].i === item.i) {
          startIndex = i;
          break;
        }
      }
    }
  }

  // Go through each item we collide with.
  for (let i = (startIndex ?? -1) + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    // Ignore static items
    if (otherItem.static) continue;

    // Optimization: we can break early if we know we're past this el
    // We can do this b/c it's a sorted layout
    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis,
        i,
        indexById
      );
    }
  }

  item[axis] = moveToCoord;
}

/**
 * Compact an item in the layout.
 *
 * Modifies item.
 *
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  compactType: CompactType,
  cols: number,
  fullLayout: Layout,
  allowOverlap?: boolean,
  fullLayoutIndex?: Map<string, number>,
  collisionIndex?: CompactionCollisionIndex
): LayoutItem {
  const compactV = compactType === "vertical";
  const compactH = compactType === "horizontal";
  const getCollision = (item: LayoutItem): LayoutItem | undefined =>
    collisionIndex
      ? getFirstCollisionWithIndex(compareWith, item, collisionIndex)
      : getFirstCollision(compareWith, item);

  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y);
    // Move the element up as far as it can go without colliding.
    // Fast path: if we have no collision at the current position, we can compute the
    // maximum y we can move to in one scan (equivalent to decrementing one row at a time).
    if (!getCollision(l)) {
      let targetY = 0;
      for (let i = 0, len = compareWith.length; i < len; i++) {
        const other = compareWith[i];
        // Only items entirely above the current top can constrain upward movement.
        if (other.y + other.h > l.y) continue;
        // Must overlap in x to matter.
        if (l.x + l.w <= other.x) continue;
        if (l.x >= other.x + other.w) continue;
        const bottomY = other.y + other.h;
        if (bottomY > targetY) targetY = bottomY;
      }
      l.y = targetY;
    }
  } else if (compactH) {
    // Move the element left as far as it can go without colliding.
    if (!getCollision(l)) {
      let targetX = 0;
      for (let i = 0, len = compareWith.length; i < len; i++) {
        const other = compareWith[i];
        if (other.x + other.w > l.x) continue;
        // Must overlap in y to matter.
        if (l.y + l.h <= other.y) continue;
        if (l.y >= other.y + other.h) continue;
        const rightX = other.x + other.w;
        if (rightX > targetX) targetX = rightX;
      }
      l.x = targetX;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  let collides;
  // Checking the compactType null value to avoid breaking the layout when overlapping is allowed.
  while (
    (collides = getCollision(l)) &&
    !(compactType === null && allowOverlap)
  ) {
    if (compactH) {
      resolveCompactionCollision(
        fullLayout,
        l,
        collides.x + collides.w,
        "x",
        undefined,
        fullLayoutIndex
      );
    } else {
      resolveCompactionCollision(
        fullLayout,
        l,
        collides.y + collides.h,
        "y",
        undefined,
        fullLayoutIndex
      );
    }
    // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.
    if (compactH && l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
      // ALso move element as left as we can
      while (l.x > 0 && !getCollision(l)) {
        l.x--;
      }
    }
  }

  // Ensure that there are no negative positions
  l.y = Math.max(l.y, 0);
  l.x = Math.max(l.x, 0);

  return l;
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * Modifies layout items.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
export function correctBounds(
  layout: Layout,
  bounds: { cols: number }
): Layout {
  const collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    // Overflows right
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) collidesWith.push(l);
    else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}

/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */
export function getLayoutItem(layout: Layout, id: string): LayoutItem | undefined {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
export function getFirstCollision(
  layout: Layout,
  layoutItem: LayoutItem
): LayoutItem | undefined {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

export function findFirstFit(
  layout: Layout,
  item: Pick<LayoutItem, "w" | "h">,
  cols: number,
  maxRows: number = Infinity
): { x: number; y: number } | null {
  const width = Math.floor(item.w);
  const height = Math.floor(item.h);
  const columnCount = Math.floor(cols);
  const maxRowCount = Number.isFinite(maxRows) ? Math.floor(maxRows) : Infinity;

  if (!Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(height) || height <= 0) return null;
  if (!Number.isFinite(columnCount) || columnCount <= 0) return null;
  if (width > columnCount) return null;
  if (Number.isFinite(maxRowCount) && height > maxRowCount) return null;

  let maxY = Math.max(0, Math.ceil(bottom(layout)));
  if (Number.isFinite(maxRowCount)) {
    maxY = Math.min(maxY, maxRowCount - height);
  }
  if (maxY < 0) return null;

  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= columnCount - width; x++) {
      const candidate: LayoutItem = {
        i: "__fit__",
        x,
        y,
        w: width,
        h: height,
      };
      if (!getFirstCollision(layout, candidate)) {
        return { x, y };
      }
    }
  }

  return null;
}

/**
 * Find the nearest available position to place an item, snapping to the closest existing block.
 * The new item will be placed adjacent to the nearest existing layout item.
 */
export function findNearestFit(
  layout: Layout,
  item: Pick<LayoutItem, "w" | "h">,
  cols: number,
  targetX: number,
  targetY: number,
  maxRows: number = Infinity
): { x: number; y: number } | null {
  const width = Math.floor(item.w);
  const height = Math.floor(item.h);
  const columnCount = Math.floor(cols);
  const maxRowCount = Number.isFinite(maxRows) ? Math.floor(maxRows) : Infinity;

  if (!Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(height) || height <= 0) return null;
  if (!Number.isFinite(columnCount) || columnCount <= 0) return null;
  if (width > columnCount) return null;
  if (Number.isFinite(maxRowCount) && height > maxRowCount) return null;

  const canPlace = (x: number, y: number): boolean => {
    if (x < 0 || x + width > columnCount) return false;
    if (y < 0) return false;
    if (Number.isFinite(maxRowCount) && y + height > maxRowCount) return false;
    const candidate: LayoutItem = { i: "__fit__", x, y, w: width, h: height };
    return !getFirstCollision(layout, candidate);
  };

  const distToTarget = (x: number, y: number): number => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const dx = centerX - targetX;
    const dy = centerY - targetY;
    return dx * dx + dy * dy;
  };

  if (layout.length === 0) {
    const x = Math.max(0, Math.min(Math.round(targetX), columnCount - width));
    const y = Math.max(0, Math.round(targetY));
    if (canPlace(x, y)) return { x, y };
    return findFirstFit([], item, cols, maxRows);
  }

  type Candidate = { x: number; y: number; dist: number };
  const candidates: Candidate[] = [];

  for (const block of layout) {
    const positions = [
      { x: block.x - width, y: block.y },
      { x: block.x + block.w, y: block.y },
      { x: block.x, y: block.y - height },
      { x: block.x, y: block.y + block.h },
      { x: block.x - width, y: block.y - height },
      { x: block.x + block.w, y: block.y - height },
      { x: block.x - width, y: block.y + block.h },
      { x: block.x + block.w, y: block.y + block.h },
    ];

    for (const pos of positions) {
      if (canPlace(pos.x, pos.y)) {
        candidates.push({ x: pos.x, y: pos.y, dist: distToTarget(pos.x, pos.y) });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist);
    return { x: candidates[0].x, y: candidates[0].y };
  }

  return findFirstFit(layout, item, cols, maxRows);
}

type CompactionCollisionIndex = {
  rows: Map<number, number[]>;
  seen: Uint32Array;
  stamp: number;
};

function createCompactionCollisionIndex(
  compareWith: Layout,
  capacity: number
): CompactionCollisionIndex {
  const index: CompactionCollisionIndex = {
    rows: new Map(),
    seen: new Uint32Array(capacity),
    stamp: 1
  };
  for (let i = 0; i < compareWith.length; i++) {
    addToCompactionCollisionIndex(index, compareWith[i], i);
  }
  return index;
}

function addToCompactionCollisionIndex(
  index: CompactionCollisionIndex,
  item: LayoutItem,
  itemIndex: number
): void {
  if (!Number.isFinite(item.y) || !Number.isFinite(item.h)) return;
  const startRow = Math.floor(item.y);
  let endRow = Math.floor(item.y + item.h - 1);
  if (endRow < startRow) endRow = startRow;
  for (let r = startRow; r <= endRow; r++) {
    let bucket = index.rows.get(r);
    if (!bucket) {
      bucket = [];
      index.rows.set(r, bucket);
    }
    bucket.push(itemIndex);
  }
}

function getFirstCollisionWithIndex(
  layout: Layout,
  layoutItem: LayoutItem,
  index: CompactionCollisionIndex
): LayoutItem | undefined {
  if (
    !Number.isFinite(layoutItem.y) ||
    !Number.isFinite(layoutItem.h) ||
    !Number.isFinite(layoutItem.x) ||
    !Number.isFinite(layoutItem.w)
  ) {
    return getFirstCollision(layout, layoutItem);
  }

  index.stamp = (index.stamp + 1) >>> 0;
  if (index.stamp === 0) {
    index.seen.fill(0);
    index.stamp = 1;
  }

  const seen = index.seen;
  const stamp = index.stamp;
  const startRow = Math.floor(layoutItem.y);
  let endRow = Math.floor(layoutItem.y + layoutItem.h - 1);
  if (endRow < startRow) endRow = startRow;

  let minIndex = Infinity;
  for (let r = startRow; r <= endRow; r++) {
    const bucket = index.rows.get(r);
    if (!bucket) continue;
    for (let i = 0; i < bucket.length; i++) {
      const itemIndex = bucket[i];
      if (seen[itemIndex] === stamp) continue;
      seen[itemIndex] = stamp;

      const candidate = layout[itemIndex];
      if (candidate && collides(candidate, layoutItem) && itemIndex < minIndex) {
        minIndex = itemIndex;
      }
    }
  }

  return Number.isFinite(minIndex) ? layout[minIndex] : undefined;
}

export function getAllCollisions(
  layout: Layout,
  layoutItem: LayoutItem
): Array<LayoutItem> {
  const out: LayoutItem[] = [];
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    if (collides(l, layoutItem)) out.push(l);
  }
  return out;
}

// Note: we intentionally avoid sorting the whole layout in moveElement().
// Sorting only the (usually small) colliding subset is faster under load.

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export function getStatics(layout: Layout): Array<LayoutItem> {
  return layout.filter(l => l.static);
}

/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * Modifies layout items.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {LayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  compactType: CompactType,
  cols: number,
  allowOverlap?: boolean,
  x?: number,
  y?: number,
  isUserAction?: boolean,
  preventCollision?: boolean,
): Layout {
  // If this is static and not explicitly enabled as draggable,
  // no move is possible, so we can short-circuit this immediately.
  if (l.static && l.isDraggable !== true) return layout;

  // Short-circuit if nothing to do.
  if (l.y === y && l.x === x) return layout;

  log(
    `Moving element ${l.i} to [${String(x)},${String(y)}] from [${l.x},${l.y}]`
  );
  const oldX = l.x;
  const oldY = l.y;

  // This is quite a bit faster than extending the object
  if (typeof x === "number") l.x = x;
  if (typeof y === "number") l.y = y;
  l.moved = true;

  const movingUp =
    compactType === "vertical" && typeof y === "number"
      ? oldY >= y
      : compactType === "horizontal" && typeof x === "number"
        ? oldX >= x
        : false;
  let collisions = getAllCollisions(layout, l);
  const hasCollisions = collisions.length > 0;

  // We may have collisions. We can short-circuit if we've turned off collisions or
  // allowed overlap.
  if (hasCollisions && allowOverlap) {
    // Easy, we don't need to resolve collisions. But we *did* change the layout,
    // so clone it on the way out.
    return cloneLayout(layout);
  } else if (hasCollisions && preventCollision) {
    // If we are preventing collision but not allowing overlap, we need to
    // revert the position of this element so it goes to where it came from, rather
    // than the user's desired location.
    log(`Collision prevented on ${l.i}, reverting.`);
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout; // did not change so don't clone
  }

  if (hasCollisions && compactType === "vertical") {
    collisions = collisions.sort((a, b) => {
      if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
        return 1;
      } else if (a.y === b.y && a.x === b.x) {
        return 0;
      }
      return -1;
    });
  } else if (hasCollisions && compactType === "horizontal") {
    collisions = collisions.sort((a, b) => {
      if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
        return 1;
      } else if (a.x === b.x && a.y === b.y) {
        return 0;
      }
      return -1;
    });
  }
  if (hasCollisions && movingUp) collisions = collisions.reverse();

  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    log(
      `Resolving collision between ${l.i} at [${l.x},${l.y}] and ${collision.i} at [${collision.x},${collision.y}]`
    );

    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(
        layout,
        collision,
        l,
        compactType,
        cols,
        isUserAction,
      );
    } else {
      layout = moveElementAwayFromCollision(
        layout,
        l,
        collision,
        compactType,
        cols,
        isUserAction,
      );
    }
  }

  return layout;
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  compactType: CompactType,
  cols: number,
  isUserAction?: boolean,
): Layout {
  const compactH = compactType === "horizontal";
  // Compact vertically if not set to horizontal
  const compactV = compactType === "vertical";
  const preventCollision = collidesWith.static; // we're already colliding (not for static items)

  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Reset isUserAction flag because we're not in the main collision anymore.
    isUserAction = false;

    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: LayoutItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    };

    const firstCollision = getFirstCollision(layout, fakeItem);
    const collisionNorth =
      firstCollision && firstCollision.y + firstCollision.h > collidesWith.y;
    const collisionWest =
      firstCollision && collidesWith.x + collidesWith.w > firstCollision.x;

    // No collision? If so, we can go up there; otherwise, we'll end up moving down as normal
    if (!firstCollision) {
      log(
        `Doing reverse collision on ${itemToMove.i} up to [${fakeItem.x},${fakeItem.y}].`
      );
      return moveElement(
        layout,
        itemToMove,
        compactType,
        cols,
        false,
        compactH ? fakeItem.x : undefined,
        compactV ? fakeItem.y : undefined,
        isUserAction,
        preventCollision,
      );
    } else if (collisionNorth && compactV) {
      return moveElement(
        layout,
        itemToMove,
        compactType,
        cols,
        false,
        undefined,
        collidesWith.y + 1,
        isUserAction,
        preventCollision,
      );
    } else if (collisionNorth && compactType == null) {
      collidesWith.y = itemToMove.y;
      itemToMove.y = itemToMove.y + itemToMove.h;

      return layout;
    } else if (collisionWest && compactH) {
      return moveElement(
        layout,
        collidesWith,
        compactType,
        cols,
        false,
        itemToMove.x,
        undefined,
        isUserAction,
        preventCollision,
      );
    }
  }

  const newX = compactH ? itemToMove.x + 1 : undefined;
  const newY = compactV ? itemToMove.y + 1 : undefined;

  if (newX == null && newY == null) {
    return layout;
  }
  return moveElement(
    layout,
    itemToMove,
    compactType,
    cols,
    false,
    compactH ? itemToMove.x + 1 : undefined,
    compactV ? itemToMove.y + 1 : undefined,
    isUserAction,
    preventCollision
  );
}

/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
export function perc(num: number): string {
  return num * 100 + "%";
}

/**
 * Helper functions to constrain dimensions of a GridItem
 */
const constrainWidth = (
  left: number,
  currentWidth: number,
  newWidth: number,
  containerWidth: number
) => {
  return left + newWidth > containerWidth ? currentWidth : newWidth;
};

const constrainHeight = (
  top: number,
  currentHeight: number,
  newHeight: number
) => {
  return top < 0 ? currentHeight : newHeight;
};

const constrainLeft = (left: number) => Math.max(0, left);

const constrainTop = (top: number) => Math.max(0, top);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resizeNorth = (currentSize, { left, height, width }, _containerWidth) => {
  const top = currentSize.top - (height - currentSize.height);

  return {
    left,
    width,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};

const resizeEast = (
  currentSize,
  { top, left, height, width },
  containerWidth
) => ({
  top,
  height,
  width: constrainWidth(
    currentSize.left,
    currentSize.width,
    width,
    containerWidth
  ),
  left: constrainLeft(left)
});

const resizeWest = (currentSize, { top, height, width }, containerWidth) => {
  const left = currentSize.left - (width - currentSize.width);

  return {
    height,
    width:
      left < 0
        ? currentSize.width
        : constrainWidth(
            currentSize.left,
            currentSize.width,
            width,
            containerWidth
          ),
    top: constrainTop(top),
    left: constrainLeft(left)
  };
};

const resizeSouth = (
  currentSize,
  { top, left, height, width },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  containerWidth
) => ({
  width,
  left,
  height: constrainHeight(top, currentSize.height, height),
  top: constrainTop(top)
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const resizeNorthEast = (...args: [any, any, any]): Position =>
  resizeNorth(args[0], resizeEast(...args), args[2]);
const resizeNorthWest = (...args: [any, any, any]): Position =>
  resizeNorth(args[0], resizeWest(...args), args[2]);
const resizeSouthEast = (...args: [any, any, any]): Position =>
  resizeSouth(args[0], resizeEast(...args), args[2]);
const resizeSouthWest = (...args: [any, any, any]): Position =>
  resizeSouth(args[0], resizeWest(...args), args[2]);
/* eslint-disable @typescript-eslint/no-explicit-any */

const ordinalResizeHandlerMap = {
  n: resizeNorth,
  ne: resizeNorthEast,
  e: resizeEast,
  se: resizeSouthEast,
  s: resizeSouth,
  sw: resizeSouthWest,
  w: resizeWest,
  nw: resizeNorthWest
};

/**
 * Helper for clamping width and position when resizing an item.
 */
export function resizeItemInDirection(
  direction: ResizeHandleAxis,
  currentSize: Position,
  newSize: Position,
  containerWidth: number
): Position {
  const ordinalHandler = ordinalResizeHandlerMap[direction];
  // Shouldn't be possible given types; that said, don't fail hard
  if (!ordinalHandler) return newSize;
  return ordinalHandler(
    currentSize,
    { ...currentSize, ...newSize },
    containerWidth
  );
}

export function setTransform({ top, left, width, height }: Position): Kv {
  // Replace unitless items with px
  const translate = `translate3d(${left}px,${top}px,0)`;
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}

export function setTopLeft({ top, left, width, height }: Position): Kv {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
export function sortLayoutItems(
  layout: Layout,
  compactType: CompactType
): Layout {
  if (compactType === "horizontal") return sortLayoutItemsByColRow(layout);
  if (compactType === "vertical") return sortLayoutItemsByRowCol(layout);
  else return layout;
}

/**
 * Sort layout items by row ascending and column ascending.
 *
 * Does not modify Layout.
 */
export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  // Slice to clone array as sort modifies
  return layout.slice(0).sort(function (a, b) {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }
    return -1;
  });
}

/**
 * Sort layout items by column ascending then row ascending.
 *
 * Does not modify Layout.
 */
export function sortLayoutItemsByColRow(layout: Layout): Layout {
  return layout.slice(0).sort(function (a, b) {
    if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
      return 1;
    }
    return -1;
  });
}

/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * Does not modify initialLayout.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {?String} compact      Compaction option.
 * @return {Array}                Working layout.
 */
export function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: VueChildren,
  cols: number,
  compactType: CompactType,
  allowOverlap?: boolean,
  cb?: (layout?: Layout) => void
): Layout {
  initialLayout = initialLayout || [];
  const initialLayoutById = new Map<string, LayoutItem>();
  for (let i = 0; i < initialLayout.length; i++) {
    initialLayoutById.set(initialLayout[i].i, initialLayout[i]);
  }

  // Generate one layout item per child.
  const layout: LayoutItem[] = [];
  let currentBottom = 0;
  children.forEach((child: VNode) => {
    // Child may not exist
    if (child?.key == null) return;

    const childId = String(child.key);
    const exists = initialLayoutById.get(childId);
    const g = child.props?.["data-grid"];
    // Don't overwrite the layout item if it's already in the initial layout.
    // If it has a `data-grid` property, prefer that over what's in the layout.
    if (exists && g == null) {
      layout.push(cloneLayoutItem(exists));
    } else {
      // Hey, this item has a data-grid property, use it.
      if (g) {
        if (!isProduction) {
          validateLayout([g], "VueGridLayout.children");
        }
        // FIXME clone not really necessary here
        layout.push(cloneLayoutItem({ ...g, i: childId }));
      } else {
        // Nothing provided: ensure this is added to the bottom
        // FIXME clone not really necessary here
        layout.push(
          cloneLayoutItem({
            w: 1,
            h: 1,
            x: 0,
            y: currentBottom,
            i: childId
          })
        );
      }
    }
    const last = layout[layout.length - 1];
    const lastBottom = last.y + last.h;
    if (lastBottom > currentBottom) currentBottom = lastBottom;
    cb && cb(layout)
  });

  // Correct the layout.
  const correctedLayout = correctBounds(layout, { cols: cols });
  return allowOverlap
    ? correctedLayout
    : compact(correctedLayout, compactType, cols);
}

/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
export function validateLayout(
  layout: Layout,
  contextName: string = "Layout"
): void {
  const subProps = ["x", "y", "w", "h"];
  if (!Array.isArray(layout))
    throw new Error(contextName + " must be an array!");
  for (let i = 0, len = layout.length; i < len; i++) {
    const item = layout[i];
    for (let j = 0; j < subProps.length; j++) {
      const key = subProps[j];
      const value = item[key];
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(
          `VueGridLayout: ${contextName}[${i}].${key} must be a number! Received: ${value} (${typeof value})`
        );
      }
    }
    if (typeof item.i !== "undefined" && typeof item.i !== "string") {
      const itemIAsString = String(item.i); // Convert item.i to a string explicitly
      throw new Error(
        `VueGridLayout: ${contextName}[${i}].i must be a string! Received: ${
          itemIAsString
        } (${typeof item.i})`
      );
    }
  }
}

// Legacy support for verticalCompact: false
export function compactType(
  props: Partial<{ verticalCompact: boolean, compactType: CompactType }>
): CompactType {
  const { verticalCompact, compactType } = props || {};
  return verticalCompact === false ? null : compactType || null;
}

function log(...args) {
  if (!DEBUG) return;
  void args;
}

export const noop = () => {};
