/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  cloneLayout,
  getAllCollisions,
  getLayoutItem,
  type Layout,
  type LayoutItem
} from "../utils";
import { collectEditorLayoutPatches } from "./commands";
import { computeGridEditorIntelligence } from "./intelligence";
import { normalizeGridEditorSectionRows } from "./sectionRows";
import type {
  GridEditorAlignMode,
  GridEditorAlignPayload,
  GridEditorBlockedReason,
  GridEditorCommandComputedDiagnostics,
  GridEditorDistributeMode,
  GridEditorDistributePayload,
  GridEditorDistributeStrategy,
  GridEditorGeometryCommandContext,
  GridEditorGeometryPatchResult,
  GridEditorTidyPayload
} from "./types";

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const isFiniteGridNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const axisForAlignMode = (mode: GridEditorAlignMode): "x" | "y" =>
  mode === "left" || mode === "center-x" || mode === "right" ? "x" : "y";

const axisForDistributeMode = (mode: GridEditorDistributeMode): "x" | "y" =>
  mode === "horizontal" || mode === "spacing-x" ? "x" : "y";

const cloneGeometryLayout = (layout: Layout): Layout => cloneLayout(layout);

const patchAffectedIds = (layoutPatches: GridEditorGeometryPatchResult["layoutPatches"]): string[] =>
  Array.from(new Set(layoutPatches.flatMap(patch => {
    if (patch.type === "add") return [patch.item.i];
    if (patch.type === "compact") return patch.affectedIds;
    return [patch.id];
  })));

const resolveTargetIds = (
  layout: Layout,
  context: GridEditorGeometryCommandContext
): string[] => {
  const ids = context.targetIds?.length
    ? context.targetIds
    : context.selectedIds?.length
      ? context.selectedIds
      : layout.map(item => item.i);
  return Array.from(new Set(ids.filter(Boolean)));
};

const blockedResult = (
  startedAt: number,
  layout: Layout,
  reason: GridEditorBlockedReason,
  itemIds: string[],
  message: string,
  diagnostics?: GridEditorCommandComputedDiagnostics,
  skippedIds?: string[]
): GridEditorGeometryPatchResult => ({
  status: "blocked",
  layout: cloneGeometryLayout(layout),
  layoutPatches: [],
  affectedIds: [],
  skippedIds,
  blocked: {
    reason,
    itemIds,
    message,
    skippedIds
  },
  diagnostics: {
    durationMs: now() - startedAt,
    computed: diagnostics,
    messages: [{
      code: `grid-editor.geometry.${reason}`,
      level: reason === "invalid-input" ? "error" : "warning",
      message,
      itemIds,
      recoverable: true
    }]
  }
});

const getTargetItems = (
  layout: Layout,
  targetIds: string[]
): { items: LayoutItem[]; missingIds: string[] } => {
  const items: LayoutItem[] = [];
  const missingIds: string[] = [];
  targetIds.forEach(id => {
    const item = getLayoutItem(layout, id);
    if (item) items.push(item);
    else missingIds.push(id);
  });
  return { items, missingIds };
};

const validateGeometryLayout = (
  candidateLayout: Layout,
  ids: string[],
  context: GridEditorGeometryCommandContext
): { ok: true } | { ok: false; reason: "bounds" | "maxRows" | "collision"; itemIds: string[] } => {
  const cols = isFiniteGridNumber(context.cols) ? context.cols : 12;
  const maxRows = isFiniteGridNumber(context.maxRows) ? context.maxRows : Infinity;
  for (let i = 0; i < ids.length; i++) {
    const item = getLayoutItem(candidateLayout, ids[i]);
    if (!item) continue;
    if (item.x < 0 || item.y < 0 || item.x + item.w > cols) {
      return { ok: false, reason: "bounds", itemIds: [item.i] };
    }
    if (Number.isFinite(maxRows) && item.y + item.h > maxRows) {
      return { ok: false, reason: "maxRows", itemIds: [item.i] };
    }
    if (context.allowOverlap !== true) {
      const collisions = getAllCollisions(candidateLayout, item)
        .filter(candidate => candidate.i !== item.i);
      if (collisions.length > 0) {
        return {
          ok: false,
          reason: "collision",
          itemIds: [item.i, ...collisions.map(candidate => candidate.i)]
        };
      }
    }
  }
  return { ok: true };
};

const lineForItem = (item: LayoutItem, mode: GridEditorAlignMode): number => {
  if (mode === "right") return item.x + item.w;
  if (mode === "center-x") return item.x + item.w / 2;
  if (mode === "bottom") return item.y + item.h;
  if (mode === "center-y") return item.y + item.h / 2;
  if (mode === "top") return item.y;
  return item.x;
};

const selectionBounds = (items: LayoutItem[]) => {
  const left = Math.min(...items.map(item => item.x));
  const right = Math.max(...items.map(item => item.x + item.w));
  const top = Math.min(...items.map(item => item.y));
  const bottom = Math.max(...items.map(item => item.y + item.h));
  return {
    left,
    right,
    top,
    bottom,
    centerX: left + (right - left) / 2,
    centerY: top + (bottom - top) / 2
  };
};

const targetLineForAlign = (
  layout: Layout,
  payload: GridEditorAlignPayload,
  items: LayoutItem[],
  context: GridEditorGeometryCommandContext
): { position: number; source: "selection" | "active-item" | "last-selected" | "section-row" | "explicit" } => {
  const mode = payload.mode;
  const target = payload.target || { type: "selection-bounds" as const };
  if (target.type === "explicit-line" && target.axis === axisForAlignMode(mode)) {
    return { position: target.position, source: "explicit" };
  }
  if (target.type === "active-item" || target.type === "last-selected") {
    const selectedIds = context.selectedIds || context.targetIds || items.map(item => item.i);
    const id = target.type === "active-item"
      ? target.id || context.activeId || selectedIds[0]
      : selectedIds[selectedIds.length - 1];
    const item = items.find(candidate => candidate.i === id) || items[0];
    return { position: lineForItem(item, mode), source: target.type };
  }
  if (target.type === "section-row") {
    const resolvedRows = normalizeGridEditorSectionRows(context.sectionRows, layout);
    const metadataBounds = resolvedRows.items[target.id]?.bounds;
    const rawBounds = target.bounds || metadataBounds;
    if (rawBounds) {
      const bounds = {
        left: rawBounds.x,
        right: rawBounds.x + rawBounds.w,
        top: rawBounds.y,
        bottom: rawBounds.y + rawBounds.h,
        centerX: rawBounds.x + rawBounds.w / 2,
        centerY: rawBounds.y + rawBounds.h / 2
      };
      if (mode === "right") return { position: bounds.right, source: "section-row" };
      if (mode === "center-x") return { position: bounds.centerX, source: "section-row" };
      if (mode === "bottom") return { position: bounds.bottom, source: "section-row" };
      if (mode === "center-y") return { position: bounds.centerY, source: "section-row" };
      if (mode === "top") return { position: bounds.top, source: "section-row" };
      return { position: bounds.left, source: "section-row" };
    }
    const bounds = selectionBounds(items);
    if (mode === "right") return { position: bounds.right, source: "section-row" };
    if (mode === "center-x") return { position: bounds.centerX, source: "section-row" };
    if (mode === "bottom") return { position: bounds.bottom, source: "section-row" };
    if (mode === "center-y") return { position: bounds.centerY, source: "section-row" };
    if (mode === "top") return { position: bounds.top, source: "section-row" };
    return { position: bounds.left, source: "section-row" };
  }
  const bounds = selectionBounds(items);
  if (mode === "right") return { position: bounds.right, source: "selection" };
  if (mode === "center-x") return { position: bounds.centerX, source: "selection" };
  if (mode === "bottom") return { position: bounds.bottom, source: "selection" };
  if (mode === "center-y") return { position: bounds.centerY, source: "selection" };
  if (mode === "top") return { position: bounds.top, source: "selection" };
  return { position: bounds.left, source: "selection" };
};

const applyAlignToItem = (
  item: LayoutItem,
  mode: GridEditorAlignMode,
  targetLine: number
): LayoutItem => {
  if (mode === "right") return { ...item, x: Math.round(targetLine - item.w) };
  if (mode === "center-x") return { ...item, x: Math.round(targetLine - item.w / 2) };
  if (mode === "top") return { ...item, y: Math.round(targetLine) };
  if (mode === "bottom") return { ...item, y: Math.round(targetLine - item.h) };
  if (mode === "center-y") return { ...item, y: Math.round(targetLine - item.h / 2) };
  return { ...item, x: Math.round(targetLine) };
};

const sortedForAxis = (items: LayoutItem[], axis: "x" | "y"): LayoutItem[] =>
  items.slice().sort((a, b) =>
    axis === "x"
      ? a.x - b.x || a.i.localeCompare(b.i)
      : a.y - b.y || a.i.localeCompare(b.i)
  );

const currentSpacing = (
  sorted: LayoutItem[],
  axis: "x" | "y",
  strategy: GridEditorDistributeStrategy
): number[] => {
  const values: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const next = sorted[i];
    values.push(strategy === "center-to-center"
      ? axis === "x"
        ? next.x + next.w / 2 - (previous.x + previous.w / 2)
        : next.y + next.h / 2 - (previous.y + previous.h / 2)
      : axis === "x"
        ? next.x - (previous.x + previous.w)
        : next.y - (previous.y + previous.h));
  }
  return values;
};

const averageSpacing = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

const distributeAroundActiveItem = (
  sorted: LayoutItem[],
  axis: "x" | "y",
  strategy: GridEditorDistributeStrategy,
  activeId?: string | null
): { items: LayoutItem[]; spacing: number } => {
  const activeIndex = Math.max(0, sorted.findIndex(item => item.i === activeId));
  const activeItem = sorted[activeIndex];
  const spacing = Math.max(0, averageSpacing(currentSpacing(sorted, axis, strategy)));
  const patched = new Map<string, LayoutItem>([[activeItem.i, activeItem]]);

  if (strategy === "center-to-center") {
    const activeCenter = axis === "x"
      ? activeItem.x + activeItem.w / 2
      : activeItem.y + activeItem.h / 2;
    for (let i = activeIndex - 1; i >= 0; i--) {
      const item = sorted[i];
      const center = activeCenter - spacing * (activeIndex - i);
      patched.set(item.i, axis === "x"
        ? { ...item, x: Math.round(center - item.w / 2) }
        : { ...item, y: Math.round(center - item.h / 2) });
    }
    for (let i = activeIndex + 1; i < sorted.length; i++) {
      const item = sorted[i];
      const center = activeCenter + spacing * (i - activeIndex);
      patched.set(item.i, axis === "x"
        ? { ...item, x: Math.round(center - item.w / 2) }
        : { ...item, y: Math.round(center - item.h / 2) });
    }
    return { items: sorted.map(item => patched.get(item.i) || item), spacing };
  }

  let beforeCursor = axis === "x" ? activeItem.x : activeItem.y;
  for (let i = activeIndex - 1; i >= 0; i--) {
    const item = sorted[i];
    const size = axis === "x" ? item.w : item.h;
    const start = beforeCursor - spacing - size;
    patched.set(item.i, axis === "x" ? { ...item, x: Math.round(start) } : { ...item, y: Math.round(start) });
    beforeCursor = start;
  }

  let afterCursor = axis === "x" ? activeItem.x + activeItem.w : activeItem.y + activeItem.h;
  for (let i = activeIndex + 1; i < sorted.length; i++) {
    const item = sorted[i];
    patched.set(item.i, axis === "x" ? { ...item, x: Math.round(afterCursor + spacing) } : { ...item, y: Math.round(afterCursor + spacing) });
    afterCursor = afterCursor + spacing + (axis === "x" ? item.w : item.h);
  }
  return { items: sorted.map(item => patched.get(item.i) || item), spacing };
};

const distributeItems = (
  layout: Layout,
  items: LayoutItem[],
  payload: GridEditorDistributePayload,
  context: GridEditorGeometryCommandContext
): { items: LayoutItem[]; spacing: number; axis: "x" | "y"; sectionId?: string; rowId?: string } | null => {
  const axis = axisForDistributeMode(payload.mode);
  const strategy = payload.strategy || "edge-to-edge";
  const sorted = sortedForAxis(items, axis);
  if (sorted.length < 3) return null;
  const resolvedRows = normalizeGridEditorSectionRows(context.sectionRows, layout);
  const commonMembership = sorted.reduce<{ sectionId?: string; rowId?: string } | null>((acc, item) => {
    const membership = resolvedRows.itemMembership[item.i] || {};
    if (acc === null) return { ...membership };
    return {
      sectionId: acc.sectionId && acc.sectionId === membership.sectionId ? acc.sectionId : undefined,
      rowId: acc.rowId && acc.rowId === membership.rowId ? acc.rowId : undefined
    };
  }, null);
  const requestedSectionRowId = payload.sectionRowId ||
    (payload.bounds === "section-row" ? commonMembership?.rowId || commonMembership?.sectionId : undefined);
  const requestedSectionRow = requestedSectionRowId ? resolvedRows.items[requestedSectionRowId] : undefined;

  if (payload.bounds === "active-item") {
    const active = distributeAroundActiveItem(sorted, axis, strategy, context.activeId);
    return {
      axis,
      spacing: active.spacing,
      sectionId: commonMembership?.sectionId,
      rowId: commonMembership?.rowId,
      items: active.items
    };
  }

  const sectionBounds = requestedSectionRow?.bounds
    ? axis === "x"
      ? { start: requestedSectionRow.bounds.x, end: requestedSectionRow.bounds.x + requestedSectionRow.bounds.w }
      : { start: requestedSectionRow.bounds.y, end: requestedSectionRow.bounds.y + requestedSectionRow.bounds.h }
    : null;
  const explicit = payload.bounds === "explicit" && payload.explicitBounds
    ? payload.explicitBounds
    : null;
  const start = explicit
    ? explicit.start
    : sectionBounds
      ? sectionBounds.start
      : axis === "x"
        ? sorted[0].x
        : sorted[0].y;
  const end = explicit
    ? explicit.end
    : sectionBounds
      ? sectionBounds.end
      : axis === "x"
        ? sorted[sorted.length - 1].x + sorted[sorted.length - 1].w
        : sorted[sorted.length - 1].y + sorted[sorted.length - 1].h;

  if (strategy === "center-to-center") {
    const bounded = Boolean(explicit || sectionBounds);
    const firstCenter = bounded
      ? start + (axis === "x" ? sorted[0].w : sorted[0].h) / 2
      : axis === "x"
        ? sorted[0].x + sorted[0].w / 2
        : sorted[0].y + sorted[0].h / 2;
    const lastCenter = bounded
      ? end - (axis === "x" ? sorted[sorted.length - 1].w : sorted[sorted.length - 1].h) / 2
      : axis === "x"
        ? sorted[sorted.length - 1].x + sorted[sorted.length - 1].w / 2
        : sorted[sorted.length - 1].y + sorted[sorted.length - 1].h / 2;
    const spacing = (lastCenter - firstCenter) / (sorted.length - 1);
    return {
      axis,
      spacing,
      sectionId: requestedSectionRow?.kind === "section" ? requestedSectionRow.id : requestedSectionRow?.parentId,
      rowId: requestedSectionRow?.kind === "row" ? requestedSectionRow.id : undefined,
      items: sorted.map((item, index) => {
        if (index === 0 || index === sorted.length - 1) return item;
        const center = firstCenter + spacing * index;
        return axis === "x"
          ? { ...item, x: Math.round(center - item.w / 2) }
          : { ...item, y: Math.round(center - item.h / 2) };
      })
    };
  }

  const totalSize = sorted.reduce(
    (sum, item) => sum + (axis === "x" ? item.w : item.h),
    0
  );
  const spacing = (end - start - totalSize) / (sorted.length - 1);
  if (!Number.isFinite(spacing) || spacing < 0) return null;
  let cursor = start;
  return {
    axis,
    spacing,
    sectionId: requestedSectionRow?.kind === "section" ? requestedSectionRow.id : requestedSectionRow?.parentId,
    rowId: requestedSectionRow?.kind === "row" ? requestedSectionRow.id : undefined,
    items: sorted.map(item => {
      const next = axis === "x"
        ? { ...item, x: Math.round(cursor) }
        : { ...item, y: Math.round(cursor) };
      cursor += (axis === "x" ? item.w : item.h) + spacing;
      return next;
    })
  };
};

const groupItemsForTidy = (
  layout: Layout,
  items: LayoutItem[],
  axis: "x" | "y",
  context: GridEditorGeometryCommandContext
): LayoutItem[][] => {
  const crossAxis = axis === "x" ? "y" : "x";
  const resolvedRows = normalizeGridEditorSectionRows(context.sectionRows, layout);
  const membershipKey = (item: LayoutItem): string => {
    const membership = resolvedRows.itemMembership[item.i] || {};
    return `${membership.sectionId || ""}:${membership.rowId || ""}`;
  };
  const sorted = items.slice().sort((a, b) =>
    crossAxis === "y"
      ? a.y - b.y || a.x - b.x || a.i.localeCompare(b.i)
      : a.x - b.x || a.y - b.y || a.i.localeCompare(b.i)
  );
  const groups: LayoutItem[][] = [];
  sorted.forEach(item => {
    const itemStart = crossAxis === "y" ? item.y : item.x;
    const itemEnd = itemStart + (crossAxis === "y" ? item.h : item.w);
    const group = groups.find(candidate => candidate.some(existing => {
      if (membershipKey(existing) !== membershipKey(item)) return false;
      const existingStart = crossAxis === "y" ? existing.y : existing.x;
      const existingEnd = existingStart + (crossAxis === "y" ? existing.h : existing.w);
      return Math.min(itemEnd, existingEnd) > Math.max(itemStart, existingStart);
    }));
    if (group) group.push(item);
    else groups.push([item]);
  });
  return groups;
};

const tidyItems = (
  layout: Layout,
  items: LayoutItem[],
  payload: GridEditorTidyPayload,
  context: GridEditorGeometryCommandContext
): { items: LayoutItem[]; spacing: number; axis: "x" | "y"; sectionId?: string; rowId?: string } | null => {
  const minSpacing = isFiniteGridNumber(payload.minSpacing) ? Math.max(0, payload.minSpacing) : 1;
  const axes: Array<"x" | "y"> = payload.axis === "both"
    ? ["x", "y"]
    : [payload.axis === "y" ? "y" : "x"];
  let current = items.slice();
  axes.forEach(axis => {
    const groups = groupItemsForTidy(layout, current, axis, context);
    const patched = new Map<string, LayoutItem>();
    groups.forEach(group => {
      const sorted = sortedForAxis(group, axis);
      if (sorted.length < 2) {
        sorted.forEach(item => patched.set(item.i, item));
        return;
      }
      let cursor = axis === "x" ? sorted[0].x : sorted[0].y;
      sorted.forEach((item, index) => {
        if (index === 0) {
          patched.set(item.i, item);
          cursor += (axis === "x" ? item.w : item.h) + minSpacing;
          return;
        }
        const next = axis === "x"
          ? { ...item, x: Math.round(cursor) }
          : { ...item, y: Math.round(cursor) };
        patched.set(item.i, next);
        cursor += (axis === "x" ? item.w : item.h) + minSpacing;
      });
    });
    current = current.map(item => patched.get(item.i) || item);
  });
  return {
    axis: axes[axes.length - 1],
    spacing: minSpacing,
    items: current
  };
};

const intelligenceFor = (
  layout: Layout,
  targetItems: LayoutItem[],
  context: GridEditorGeometryCommandContext
) => computeGridEditorIntelligence({
  layout,
  activeItem: targetItems.find(item => item.i === context.activeId) || targetItems[0],
  candidateItem: targetItems.find(item => item.i === context.activeId) || targetItems[0],
  selectionIds: targetItems.map(item => item.i),
  metaById: context.metaById,
  sectionRows: context.sectionRows,
  cols: isFiniteGridNumber(context.cols) ? context.cols : 12,
  maxRows: context.maxRows,
  compactType: context.compactType,
  allowOverlap: context.allowOverlap,
  preventCollision: context.preventCollision,
  interaction: "toolbar",
  options: {
    cols: isFiniteGridNumber(context.cols) ? context.cols : 12,
    maxRows: context.maxRows,
    allowCrossSectionRow: false
  }
});

const buildChangedResult = (
  startedAt: number,
  before: Layout,
  after: Layout,
  diagnostics: GridEditorGeometryPatchResult["diagnostics"],
  skippedIds?: string[]
): GridEditorGeometryPatchResult => {
  const layoutPatches = collectEditorLayoutPatches(before, after);
  const affectedIds = patchAffectedIds(layoutPatches);
  return {
    status: affectedIds.length > 0 ? "changed" : "noop",
    layout: after,
    layoutPatches,
    affectedIds,
    skippedIds,
    diagnostics: {
      ...diagnostics,
      durationMs: now() - startedAt
    }
  };
};

export const applyGridEditorAlign = (
  layout: Layout,
  payload: GridEditorAlignPayload,
  context: GridEditorGeometryCommandContext = {}
): GridEditorGeometryPatchResult => {
  const startedAt = now();
  const targetIds = resolveTargetIds(layout, context);
  const { items, missingIds } = getTargetItems(layout, targetIds);
  if (missingIds.length > 0) {
    return blockedResult(startedAt, layout, "missing-item", missingIds, "Align command referenced missing layout items.", undefined, context.skippedIds);
  }
  if (items.length < 2) {
    return blockedResult(startedAt, layout, "selection-count", targetIds, "Align requires at least 2 items.", undefined, context.skippedIds);
  }
  const target = targetLineForAlign(layout, payload, items, context);
  const nextLayout = cloneGeometryLayout(layout).map(item =>
    targetIds.includes(item.i)
      ? applyAlignToItem(item, payload.mode, target.position)
      : item
  );
  const validation = validateGeometryLayout(nextLayout, targetIds, context);
  const intelligence = intelligenceFor(layout, items, context);
  const computed: GridEditorCommandComputedDiagnostics = {
    targetLine: {
      axis: axisForAlignMode(payload.mode),
      position: target.position,
      mode: payload.mode
    },
    affectedIds: targetIds,
    skippedIds: context.skippedIds,
    sectionRowContext: {
      source: target.source === "section-row" ? "metadata" : "none"
    }
  };
  if (!validation.ok) {
    return blockedResult(
      startedAt,
      layout,
      validation.reason,
      validation.itemIds,
      `Align command blocked by ${validation.reason}.`,
      computed,
      context.skippedIds
    );
  }
  return buildChangedResult(startedAt, layout, nextLayout, {
    durationMs: 0,
    intelligence: intelligence.diagnostics,
    computed
  }, context.skippedIds);
};

const applySpacingOperation = (
  layout: Layout,
  payload: GridEditorDistributePayload | GridEditorTidyPayload,
  context: GridEditorGeometryCommandContext,
  commandType: "distribute" | "tidy"
): GridEditorGeometryPatchResult => {
  const startedAt = now();
  const targetIds = resolveTargetIds(layout, context);
  const { items, missingIds } = getTargetItems(layout, targetIds);
  if (missingIds.length > 0) {
    return blockedResult(startedAt, layout, "missing-item", missingIds, `${commandType} command referenced missing layout items.`, undefined, context.skippedIds);
  }
  if (items.length < 3) {
    return blockedResult(startedAt, layout, "selection-count", targetIds, `${commandType} requires at least 3 items.`, undefined, context.skippedIds);
  }
  let operation = commandType === "distribute"
    ? distributeItems(layout, items, payload as GridEditorDistributePayload, context)
    : tidyItems(layout, items, payload as GridEditorTidyPayload, context);
  const intelligence = intelligenceFor(layout, items, context);
  if (!operation) {
    return blockedResult(startedAt, layout, "invalid-input", targetIds, "Spacing command could not compute a valid spacing result.", {
      affectedIds: targetIds,
      skippedIds: context.skippedIds
    }, context.skippedIds);
  }

  let fallbackUsed = false;
  let patchedById = new Map(operation.items.map(item => [item.i, item]));
  let nextLayout = cloneGeometryLayout(layout).map(item => patchedById.get(item.i) || item);
  let validation = validateGeometryLayout(nextLayout, targetIds, context);
  if (!validation.ok) {
    const fallback = tidyItems(layout, items, {
      axis: operation.axis,
      minSpacing: 0,
      strategy: payload.strategy
    }, context);
    if (fallback) {
      fallbackUsed = true;
      operation = fallback;
      patchedById = new Map(operation.items.map(item => [item.i, item]));
      nextLayout = cloneGeometryLayout(layout).map(item => patchedById.get(item.i) || item);
      validation = validateGeometryLayout(nextLayout, targetIds, context);
    }
  }

  const distributePayload = payload as GridEditorDistributePayload;
  const tidyPayload = payload as GridEditorTidyPayload;
  const computed: GridEditorCommandComputedDiagnostics = {
    targetSpacing: {
      axis: operation.axis,
      value: operation.spacing,
      mode: commandType === "distribute"
        ? distributePayload.mode
        : operation.axis === "x" ? "spacing-x" : "spacing-y",
      strategy: commandType === "distribute"
        ? distributePayload.strategy || "edge-to-edge"
        : tidyPayload.strategy || "edge-to-edge"
    },
    affectedIds: targetIds,
    skippedIds: context.skippedIds,
    sectionRowContext: {
      sectionId: operation.sectionId,
      rowId: operation.rowId,
      source: operation.sectionId || operation.rowId ? "metadata" : "none"
    },
    fallback: fallbackUsed ? "tidy-min-spacing" : undefined
  };
  if (!validation.ok) {
    return blockedResult(
      startedAt,
      layout,
      validation.reason,
      validation.itemIds,
      `Spacing command blocked by ${validation.reason}.`,
      computed,
      context.skippedIds
    );
  }
  return buildChangedResult(startedAt, layout, nextLayout, {
    durationMs: 0,
    intelligence: intelligence.diagnostics,
    computed
  }, context.skippedIds);
};

export const applyGridEditorDistribute = (
  layout: Layout,
  payload: GridEditorDistributePayload,
  context: GridEditorGeometryCommandContext = {}
): GridEditorGeometryPatchResult =>
  applySpacingOperation(layout, payload, context, "distribute");

export const applyGridEditorTidy = (
  layout: Layout,
  payload: GridEditorTidyPayload,
  context: GridEditorGeometryCommandContext = {}
): GridEditorGeometryPatchResult =>
  applySpacingOperation(layout, payload, context, "tidy");
