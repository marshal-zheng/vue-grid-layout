import {
  bottom,
  collides,
  findFirstFit as legacyFindFirstFit,
  findNearestFit as legacyFindNearestFit,
  getAllCollisions as legacyGetAllCollisions,
  getFirstCollision as legacyGetFirstCollision
} from "../utils";

import type {
  Layout,
  LayoutItem
} from "../utils";
import type {
  LayoutIndex,
  LayoutIndexOptions,
  LayoutIndexStrategy
} from "./types";

const FIT_ID = "__layout_engine_fit__";

const isFiniteGridNumber = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isValidItemRect = (item: Pick<LayoutItem, "x" | "y" | "w" | "h">): boolean =>
  isFiniteGridNumber(item.x) &&
  isFiniteGridNumber(item.y) &&
  isFiniteGridNumber(item.w) &&
  isFiniteGridNumber(item.h) &&
  item.w > 0 &&
  item.h > 0;

const normalizePositiveInteger = (value: number): number | null => {
  const next = Math.floor(value);
  return Number.isFinite(next) && next > 0 ? next : null;
};

class RowColumnOccupancyIndex implements LayoutIndex {
  readonly name = "row-column-occupancy";

  private layout: Layout = [];
  private readonly rows = new Map<number, string[]>();
  private readonly columns = new Map<number, string[]>();
  private orderById = new Map<string, number>();
  private itemById = new Map<string, LayoutItem>();

  constructor(layout: Layout, private readonly options: LayoutIndexOptions) {
    this.rebuild(layout);
  }

  rebuild(layout: Layout): void {
    this.layout = layout.slice(0);
    this.rows.clear();
    this.columns.clear();
    this.orderById = new Map();
    this.itemById = new Map();

    for (let i = 0; i < this.layout.length; i++) {
      const item = this.layout[i];
      this.orderById.set(item.i, i);
      this.itemById.set(item.i, item);
      this.addToBuckets(item);
    }
  }

  getLayout(): Layout {
    return this.layout.slice(0);
  }

  queryFirstCollision(item: LayoutItem): LayoutItem | undefined {
    if (!isValidItemRect(item)) return legacyGetFirstCollision(this.layout, item);

    const candidates = this.queryCollisionCandidates(item);
    if (candidates === null) return legacyGetFirstCollision(this.layout, item);
    return candidates.length > 0 ? candidates[0] : undefined;
  }

  queryAllCollisions(item: LayoutItem): LayoutItem[] {
    if (!isValidItemRect(item)) return legacyGetAllCollisions(this.layout, item);

    const candidates = this.queryCollisionCandidates(item);
    if (candidates === null) return legacyGetAllCollisions(this.layout, item);
    return candidates;
  }

  canPlace(item: LayoutItem): boolean {
    if (!isValidItemRect(item)) return false;
    const cols = normalizePositiveInteger(this.options.cols);
    if (!cols) return false;
    if (item.x < 0 || item.y < 0 || item.x + item.w > cols) return false;
    if (
      Number.isFinite(this.options.maxRows) &&
      item.y + item.h > Math.floor(this.options.maxRows as number)
    ) {
      return false;
    }
    return this.queryFirstCollision(item) == null;
  }

  findFirstFit(item: Pick<LayoutItem, "w" | "h">): { x: number; y: number } | null {
    const width = normalizePositiveInteger(item.w);
    const height = normalizePositiveInteger(item.h);
    const cols = normalizePositiveInteger(this.options.cols);
    const maxRows = Number.isFinite(this.options.maxRows)
      ? Math.floor(this.options.maxRows as number)
      : Infinity;

    if (!width || !height || !cols || width > cols) {
      return legacyFindFirstFit(this.layout, item, this.options.cols, this.options.maxRows);
    }
    if (Number.isFinite(maxRows) && height > maxRows) return null;

    let maxY = Math.max(0, Math.ceil(bottom(this.layout)));
    if (Number.isFinite(maxRows)) maxY = Math.min(maxY, maxRows - height);
    if (maxY < 0) return null;

    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= cols - width; x++) {
        const candidate = { i: FIT_ID, x, y, w: width, h: height };
        if (this.canPlace(candidate)) return { x, y };
      }
    }

    return null;
  }

  findNearestFit(
    item: Pick<LayoutItem, "w" | "h">,
    target: { x: number; y: number }
  ): { x: number; y: number } | null {
    const width = normalizePositiveInteger(item.w);
    const height = normalizePositiveInteger(item.h);
    const cols = normalizePositiveInteger(this.options.cols);
    if (
      !width ||
      !height ||
      !cols ||
      !Number.isFinite(target.x) ||
      !Number.isFinite(target.y) ||
      width > cols
    ) {
      return legacyFindNearestFit(
        this.layout,
        item,
        this.options.cols,
        target.x,
        target.y,
        this.options.maxRows
      );
    }

    if (this.layout.length === 0) {
      const x = Math.max(0, Math.min(Math.round(target.x), cols - width));
      const y = Math.max(0, Math.round(target.y));
      const candidate = { i: FIT_ID, x, y, w: width, h: height };
      return this.canPlace(candidate) ? { x, y } : this.findFirstFit(item);
    }

    const distToTarget = (x: number, y: number): number => {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const dx = centerX - target.x;
      const dy = centerY - target.y;
      return dx * dx + dy * dy;
    };

    type Candidate = { x: number; y: number; dist: number; order: number };
    const candidates: Candidate[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < this.layout.length; i++) {
      const block = this.layout[i];
      const positions = [
        { x: block.x - width, y: block.y },
        { x: block.x + block.w, y: block.y },
        { x: block.x, y: block.y - height },
        { x: block.x, y: block.y + block.h },
        { x: block.x - width, y: block.y - height },
        { x: block.x + block.w, y: block.y - height },
        { x: block.x - width, y: block.y + block.h },
        { x: block.x + block.w, y: block.y + block.h }
      ];

      for (let j = 0; j < positions.length; j++) {
        const pos = positions[j];
        const key = `${pos.x}:${pos.y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const candidate = { i: FIT_ID, x: pos.x, y: pos.y, w: width, h: height };
        if (this.canPlace(candidate)) {
          candidates.push({
            x: pos.x,
            y: pos.y,
            dist: distToTarget(pos.x, pos.y),
            order: i * positions.length + j
          });
        }
      }
    }

    if (candidates.length === 0) return this.findFirstFit(item);

    candidates.sort((a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      if (a.y !== b.y) return a.y - b.y;
      if (a.x !== b.x) return a.x - b.x;
      return a.order - b.order;
    });

    return { x: candidates[0].x, y: candidates[0].y };
  }

  insert(item: LayoutItem): void {
    const existing = this.itemById.get(item.i);
    if (existing) {
      this.update(existing, item);
      return;
    }
    this.layout.push(item);
    this.orderById.set(item.i, this.layout.length - 1);
    this.itemById.set(item.i, item);
    this.addToBuckets(item);
  }

  remove(id: string): void {
    const existing = this.itemById.get(id);
    if (!existing) return;
    this.removeFromBuckets(existing);
    this.layout = this.layout.filter(item => item.i !== id);
    this.rebuildOrder();
  }

  update(before: LayoutItem, after: LayoutItem): void {
    const index = this.orderById.get(before.i);
    if (typeof index !== "number") {
      this.insert(after);
      return;
    }

    this.removeFromBuckets(before);
    this.layout[index] = after;
    if (before.i !== after.i) {
      this.itemById.delete(before.i);
      this.orderById.delete(before.i);
    }
    this.orderById.set(after.i, index);
    this.itemById.set(after.i, after);
    this.addToBuckets(after);
  }

  private queryCollisionCandidates(item: LayoutItem): LayoutItem[] | null {
    const range = this.getRowRange(item);
    if (!range) return null;

    const ids = new Set<string>();
    for (let row = range.start; row <= range.end; row++) {
      const bucket = this.rows.get(row);
      if (!bucket) continue;
      for (let i = 0; i < bucket.length; i++) ids.add(bucket[i]);
    }

    const candidates: LayoutItem[] = [];
    ids.forEach(id => {
      const candidate = this.itemById.get(id);
      if (candidate && collides(candidate, item)) candidates.push(candidate);
    });

    candidates.sort((a, b) => {
      const orderA = this.orderById.get(a.i);
      const orderB = this.orderById.get(b.i);
      return (typeof orderA === "number" ? orderA : Infinity) -
        (typeof orderB === "number" ? orderB : Infinity);
    });
    return candidates;
  }

  private addToBuckets(item: LayoutItem): void {
    this.addToAxisBuckets(this.rows, item.i, this.getRowRange(item));
    this.addToAxisBuckets(this.columns, item.i, this.getColumnRange(item));
  }

  private removeFromBuckets(item: LayoutItem): void {
    this.removeFromAxisBuckets(this.rows, item.i, this.getRowRange(item));
    this.removeFromAxisBuckets(this.columns, item.i, this.getColumnRange(item));
  }

  private addToAxisBuckets(
    buckets: Map<number, string[]>,
    id: string,
    range: { start: number; end: number } | null
  ): void {
    if (!range) return;
    for (let key = range.start; key <= range.end; key++) {
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = [];
        buckets.set(key, bucket);
      }
      bucket.push(id);
    }
  }

  private removeFromAxisBuckets(
    buckets: Map<number, string[]>,
    id: string,
    range: { start: number; end: number } | null
  ): void {
    if (!range) return;
    for (let key = range.start; key <= range.end; key++) {
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const next = bucket.filter(existingId => existingId !== id);
      if (next.length === 0) buckets.delete(key);
      else buckets.set(key, next);
    }
  }

  private getRowRange(item: Pick<LayoutItem, "y" | "h">): { start: number; end: number } | null {
    if (!isFiniteGridNumber(item.y) || !isFiniteGridNumber(item.h) || item.h <= 0) return null;
    const start = Math.floor(item.y);
    const end = Math.max(start, Math.floor(item.y + item.h - 1));
    return { start, end };
  }

  private getColumnRange(item: Pick<LayoutItem, "x" | "w">): { start: number; end: number } | null {
    if (!isFiniteGridNumber(item.x) || !isFiniteGridNumber(item.w) || item.w <= 0) return null;
    const start = Math.floor(item.x);
    const end = Math.max(start, Math.floor(item.x + item.w - 1));
    return { start, end };
  }

  private rebuildOrder(): void {
    this.orderById = new Map();
    this.itemById = new Map();
    for (let i = 0; i < this.layout.length; i++) {
      const item = this.layout[i];
      this.orderById.set(item.i, i);
      this.itemById.set(item.i, item);
    }
  }
}

export function rowColumnOccupancyStrategy(): LayoutIndexStrategy {
  return {
    name: "row-column-occupancy",
    build(layout: Layout, options: LayoutIndexOptions): LayoutIndex {
      return new RowColumnOccupancyIndex(layout, options);
    }
  };
}

export type {
  LayoutIndex,
  LayoutIndexOptions,
  LayoutIndexStrategy
} from "./types";
