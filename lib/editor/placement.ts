import {
  cloneLayout,
  compact,
  findFirstFit,
  findNearestFit,
  getAllCollisions,
  moveElement,
  type CompactType,
  type Layout,
  type LayoutItem
} from "../utils";
import type { GridEditorBlockedReason } from "./types";

export type GridEditorPlacementStrategy =
  | "offset"
  | "cursor"
  | "nearest-fit"
  | "first-fit"
  | "insert-top-shift";

export type GridEditorPlacementSource = GridEditorPlacementStrategy | "none";

export type GridEditorPlacementAnchor = "nearest" | "top-left";

export type GridEditorPlacementCollisionPolicy = "block" | "layout";

export type GridEditorPlacementDiagnostic = {
  code: string;
  level: "info" | "warning" | "error";
  message: string;
  reason?: GridEditorBlockedReason;
  itemIds?: string[];
  details?: unknown;
};

export type GridEditorPlacementGeometry = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type GridEditorPlacementSummary = {
  strategy: GridEditorPlacementStrategy;
  placementSource: GridEditorPlacementSource;
  collisionPolicy?: GridEditorPlacementCollisionPolicy;
  sessionId?: string;
  source?: string;
  insertedIds: string[];
  shiftedIds: string[];
  delta?: { dx: number; dy: number };
  before: GridEditorPlacementGeometry[];
  after: GridEditorPlacementGeometry[];
  diagnostics: GridEditorPlacementDiagnostic[];
};

export type GridEditorPlacementResult = {
  layout: Layout;
  failed: boolean;
  blocked?: {
    reason: GridEditorBlockedReason;
    itemIds?: string[];
    message?: string;
  };
  summary: GridEditorPlacementSummary;
};

const isFiniteGridNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const resolveCols = (value: unknown): number =>
  isFiniteGridNumber(value) && value > 0 ? Math.floor(value) : 12;

const resolveMaxRows = (value: unknown): number =>
  isFiniteGridNumber(value) && value > 0 ? Math.floor(value) : Infinity;

const resolveCompactType = (value: unknown): CompactType =>
  value === "vertical" || value === "horizontal" || value === null
    ? value
    : "vertical";

const resolveCollisionPolicy = (value: unknown): GridEditorPlacementCollisionPolicy =>
  value === "layout" ? "layout" : "block";

const resolveBoolean = (value: unknown): boolean =>
  value === true;

const geometry = (item: LayoutItem): GridEditorPlacementGeometry => ({
  id: item.i,
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h
});

const normalizeItem = (item: LayoutItem): LayoutItem => ({
  ...item,
  x: isFiniteGridNumber(item.x) ? Math.max(0, Math.floor(item.x)) : 0,
  y: isFiniteGridNumber(item.y) ? Math.max(0, Math.floor(item.y)) : 0,
  w: isFiniteGridNumber(item.w) ? Math.floor(item.w) : 1,
  h: isFiniteGridNumber(item.h) ? Math.floor(item.h) : 1
});

const placementDiagnostic = (
  code: string,
  level: GridEditorPlacementDiagnostic["level"],
  message: string,
  extra: Partial<GridEditorPlacementDiagnostic> = {}
): GridEditorPlacementDiagnostic => ({
  code,
  level,
  message,
  ...extra
});

const validateLayout = (
  layout: Layout,
  ids: string[],
  cols: number,
  maxRows: number,
  options: { allowOverlap?: boolean } = {}
): { ok: true } | { ok: false; reason: GridEditorBlockedReason; itemIds: string[] } => {
  for (const id of ids) {
    const item = layout.find(candidate => candidate.i === id);
    if (!item) continue;
    if (item.w <= 0 || item.h <= 0 || item.x < 0 || item.y < 0 || item.x + item.w > cols) {
      return { ok: false, reason: "bounds", itemIds: [item.i] };
    }
    if (Number.isFinite(maxRows) && item.y + item.h > maxRows) {
      return { ok: false, reason: "maxRows", itemIds: [item.i] };
    }
    if (!options.allowOverlap) {
      const collisions = getAllCollisions(layout, item)
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

const invalidSize = (
  item: LayoutItem,
  cols: number,
  maxRows: number
): GridEditorBlockedReason | null => {
  if (item.w <= 0 || item.h <= 0 || item.w > cols) return "bounds";
  if (Number.isFinite(maxRows) && item.h > maxRows) return "maxRows";
  return null;
};

const clampGridValue = (
  value: number,
  min: number,
  max: number
): number => Math.max(min, Math.min(value, max));

const layoutBottom = (layout: Layout): number =>
  layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);

const findTopLeftAnchorFit = (
  sourceLayout: Layout,
  item: LayoutItem,
  targetX: number,
  targetY: number,
  cols: number,
  maxRows: number
): { x: number; y: number; target: { x: number; y: number }; clamped: boolean; shiftedDown: boolean } | null => {
  if (!isFiniteGridNumber(targetX) || !isFiniteGridNumber(targetY)) return null;
  const target = {
    x: Math.floor(targetX),
    y: Math.floor(targetY)
  };
  const x = clampGridValue(target.x, 0, Math.max(0, cols - item.w));
  const startY = Math.max(0, target.y);
  const maxY = Number.isFinite(maxRows)
    ? Math.floor(maxRows) - item.h
    : Math.max(layoutBottom(sourceLayout), startY);
  if (maxY < startY) return null;

  for (let y = startY; y <= maxY; y++) {
    const candidate = { ...item, x, y };
    const validation = validateLayout([...sourceLayout, candidate], [candidate.i], cols, maxRows);
    if (validation.ok) {
      return {
        x,
        y,
        target,
        clamped: x !== target.x,
        shiftedDown: y !== startY
      };
    }
  }
  return null;
};

const clearMovedFlags = (layout: Layout): Layout => {
  for (const item of layout) {
    if (item.moved) item.moved = false;
  }
  return layout;
};

const shiftedIdsFromLayouts = (before: Layout, after: Layout, insertedIds: string[]): string[] => {
  const inserted = new Set(insertedIds);
  const afterById = new Map(after.map(item => [item.i, item]));
  return before
    .filter(item => {
      if (inserted.has(item.i)) return false;
      const next = afterById.get(item.i);
      return Boolean(next && (
        item.x !== next.x ||
        item.y !== next.y ||
        item.w !== next.w ||
        item.h !== next.h
      ));
    })
    .map(item => item.i);
};

const placeByLayoutPolicy = (
  sourceLayout: Layout,
  items: Layout,
  strategy: GridEditorPlacementStrategy,
  payload: Record<string, unknown>,
  cols: number,
  maxRows: number,
  target: { x?: unknown; y?: unknown } | null
): GridEditorPlacementResult | null => {
  const anchor = payload.placementAnchor === "top-left" || payload.placementIntent === "here"
    ? "top-left"
    : "nearest";
  if (strategy !== "cursor" || anchor !== "top-left") return null;

  const compactType = resolveCompactType(payload.compactType);
  const allowOverlap = resolveBoolean(payload.allowOverlap);
  const preventCollision = resolveBoolean(payload.preventCollision);
  const normalizedItems = items.map(normalizeItem);
  const groupOrigin = normalizedItems.reduce((origin, item) => ({
    x: Math.min(origin.x, item.x),
    y: Math.min(origin.y, item.y)
  }), { x: normalizedItems[0]?.x || 0, y: normalizedItems[0]?.y || 0 });
  let working = cloneLayout(sourceLayout);
  const insertedIds: string[] = [];
  const diagnostics: GridEditorPlacementDiagnostic[] = [];

  const blockedResult = (
    reason: GridEditorBlockedReason,
    itemIds: string[],
    message: string,
    previewLayout: Layout
  ): GridEditorPlacementResult => {
    const previewInsertedIds = insertedIds.concat(itemIds.filter(id => normalizedItems.some(item => item.i === id)));
    diagnostics.push(placementDiagnostic(
      reason === "collision" || reason === "static-item"
        ? "grid-editor.placement.layout-collision-blocked"
        : reason === "maxRows"
          ? "grid-editor.placement.layout-max-rows-blocked"
          : "grid-editor.placement.layout-bounds-blocked",
      "warning",
      message,
      { reason, itemIds, details: { collisionPolicy: "layout", compactType, allowOverlap, preventCollision } }
    ));
    return {
      layout: previewLayout,
      failed: true,
      blocked: { reason, itemIds, message },
      summary: {
        strategy,
        placementSource: strategy,
        collisionPolicy: "layout",
        insertedIds: previewInsertedIds,
        shiftedIds: shiftedIdsFromLayouts(sourceLayout, previewLayout, previewInsertedIds),
        before: sourceLayout.map(geometry),
        after: previewLayout.map(geometry),
        diagnostics
      }
    };
  };

  const targetX = isFiniteGridNumber(target?.x) ? target.x : groupOrigin.x;
  const targetY = isFiniteGridNumber(target?.y) ? target.y : groupOrigin.y;
  const targetItems = normalizedItems.map(item => {
    const rawX = Math.floor(targetX + item.x - groupOrigin.x);
    const rawY = Math.floor(targetY + item.y - groupOrigin.y);
    return {
      ...item,
      x: clampGridValue(rawX, 0, Math.max(0, cols - item.w)),
      y: Number.isFinite(maxRows)
        ? clampGridValue(rawY, 0, Math.max(0, Math.floor(maxRows) - item.h))
        : Math.max(0, rawY)
    };
  });
  if (!allowOverlap) {
    const groupCollision = targetItems.find(item => getAllCollisions(targetItems, item).length > 0);
    if (groupCollision) {
      return blockedResult(
        "collision",
        [groupCollision.i, ...getAllCollisions(targetItems, groupCollision).map(item => item.i)],
        "Placement group contains overlapping items.",
        sourceLayout
      );
    }
  }

  for (let index = 0; index < targetItems.length; index++) {
    const targetItem = targetItems[index];
    const item = normalizedItems[index];
    const sizeIssue = invalidSize(item, cols, maxRows);
    if (sizeIssue) {
      diagnostics.push(placementDiagnostic(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: sizeIssue, itemIds: [item.i] }
      ));
      return {
        layout: sourceLayout,
        failed: true,
        blocked: {
          reason: sizeIssue,
          itemIds: [item.i],
          message: "One or more items could not fit in the current layout."
        },
        summary: {
          strategy,
          placementSource: strategy,
          collisionPolicy: "layout",
          insertedIds,
          shiftedIds: [],
          before: sourceLayout.map(geometry),
          after: [],
          diagnostics
        }
      };
    }

    const targetLayout = working.concat(targetItem);
    const targetValidation = validateLayout(
      targetLayout,
      [targetItem.i],
      cols,
      maxRows,
      { allowOverlap }
    );
    const targetCollisions = allowOverlap
      ? []
      : getAllCollisions(working, targetItem).filter(candidate => candidate.i !== targetItem.i);

    if (!targetValidation.ok && targetValidation.reason !== "collision") {
      return blockedResult(
        targetValidation.reason,
        targetValidation.itemIds,
        "Placement target is outside the current grid constraints.",
        targetLayout
      );
    }
    if (!allowOverlap && targetCollisions.some(candidate => candidate.static)) {
      const staticIds = targetCollisions.filter(candidate => candidate.static).map(candidate => candidate.i);
      return blockedResult(
        "static-item",
        [targetItem.i, ...staticIds],
        "Placement target is blocked by a static item.",
        targetLayout
      );
    }
    if (preventCollision && !allowOverlap && targetCollisions.length > 0) {
      return blockedResult(
        "collision",
        [targetItem.i, ...targetCollisions.map(candidate => candidate.i)],
        "Placement target is blocked at the current cursor position.",
        targetLayout
      );
    }

    if (allowOverlap) {
      working = targetLayout;
      insertedIds.push(targetItem.i);
      continue;
    }

    const temporaryY = Math.max(layoutBottom(working), targetItem.y) + targetItem.h + index + 1;
    const movingItem: LayoutItem = {
      ...targetItem,
      y: temporaryY,
      static: false
    };
    const movingLayout = working.concat(movingItem);
    const movingRef = movingLayout[movingLayout.length - 1];
    const moved = moveElement(
      movingLayout,
      movingRef,
      compactType,
      cols,
      allowOverlap,
      targetItem.x,
      targetItem.y,
      true,
      preventCollision
    );
    const restored = moved.map(candidate =>
      candidate.i === targetItem.i
        ? { ...candidate, static: targetItem.static === true }
        : candidate
    );
    const compacted = compactType == null
      ? restored
      : compact(restored, compactType, cols, allowOverlap);
    working = clearMovedFlags(compacted);
    insertedIds.push(targetItem.i);

    const validation = validateLayout(
      working,
      working.map(candidate => candidate.i),
      cols,
      maxRows,
      { allowOverlap }
    );
    if (!validation.ok) {
      return blockedResult(
        validation.reason,
        validation.itemIds,
        "Placement reflow could not produce a valid layout.",
        working
      );
    }
  }

  diagnostics.push(placementDiagnostic(
    "grid-editor.placement.layout-collision-policy",
    "info",
    `Placed ${insertedIds.length} item${insertedIds.length === 1 ? "" : "s"} using existing layout collision rules.`,
    {
      itemIds: insertedIds,
      details: { collisionPolicy: "layout", compactType, allowOverlap, preventCollision }
    }
  ));

  return {
    layout: working,
    failed: false,
    summary: {
      strategy,
      placementSource: strategy,
      collisionPolicy: "layout",
      insertedIds,
      shiftedIds: shiftedIdsFromLayouts(sourceLayout, working, insertedIds),
      before: sourceLayout.map(geometry),
      after: working.map(geometry),
      diagnostics
    }
  };
};

const placeByFit = (
  sourceLayout: Layout,
  items: Layout,
  strategy: GridEditorPlacementStrategy,
  payload: Record<string, unknown>,
  cols: number,
  maxRows: number
): GridEditorPlacementResult => {
  const offset = isFiniteGridNumber(payload.offset) ? payload.offset : 1;
  const target = payload.cursor && typeof payload.cursor === "object"
    ? payload.cursor as { x?: unknown; y?: unknown }
    : null;
  const anchor = payload.placementAnchor === "top-left" || payload.placementIntent === "here"
    ? "top-left"
    : "nearest";
  if (resolveCollisionPolicy(payload.collisionPolicy) === "layout") {
    const layoutPolicyResult = placeByLayoutPolicy(sourceLayout, items, strategy, payload, cols, maxRows, target);
    if (layoutPolicyResult) return layoutPolicyResult;
  }
  const nextLayout = cloneLayout(sourceLayout);
  const insertedIds: string[] = [];
  const diagnostics: GridEditorPlacementDiagnostic[] = [];
  const normalizedItems = items.map(normalizeItem);
  const groupOrigin = normalizedItems.reduce((origin, item) => ({
    x: Math.min(origin.x, item.x),
    y: Math.min(origin.y, item.y)
  }), { x: normalizedItems[0]?.x || 0, y: normalizedItems[0]?.y || 0 });

  for (let index = 0; index < normalizedItems.length; index++) {
    const item = normalizedItems[index];
    const sizeIssue = invalidSize(item, cols, maxRows);
    if (sizeIssue) {
      diagnostics.push(placementDiagnostic(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: sizeIssue, itemIds: [item.i] }
      ));
      return {
        layout: sourceLayout,
        failed: true,
        blocked: {
          reason: sizeIssue,
          itemIds: [item.i],
          message: "One or more items could not fit in the current layout."
        },
        summary: {
          strategy,
          placementSource: strategy,
          insertedIds,
          shiftedIds: [],
          before: [],
          after: [],
          diagnostics
        }
      };
    }

    let x = item.x;
    let y = item.y;

    const exactCursorAnchor = strategy === "cursor" &&
      anchor === "top-left" &&
      typeof payload.placementSessionId === "string";
    if (strategy === "offset") {
      x += offset * (index + 1);
      y += offset * (index + 1);
    } else if (exactCursorAnchor) {
      const targetX = isFiniteGridNumber(target?.x) ? target.x : x;
      const targetY = isFiniteGridNumber(target?.y) ? target.y : y;
      const groupDx = item.x - groupOrigin.x;
      const groupDy = item.y - groupOrigin.y;
      const rawX = Math.floor(targetX + groupDx);
      const rawY = Math.floor(targetY + groupDy);
      x = clampGridValue(rawX, 0, Math.max(0, cols - item.w));
      y = Number.isFinite(maxRows)
        ? clampGridValue(rawY, 0, Math.max(0, Math.floor(maxRows) - item.h))
        : Math.max(0, rawY);
      diagnostics.push(placementDiagnostic(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [item.i],
          details: {
            target: { x: rawX, y: rawY },
            placed: { x, y },
            clamped: x !== rawX || y !== rawY,
            shiftedDown: false
          }
        }
      ));
    } else if (strategy === "nearest-fit" || strategy === "cursor") {
      const anchored = strategy === "cursor" && anchor === "top-left"
        ? findTopLeftAnchorFit(
            nextLayout,
            item,
            isFiniteGridNumber(target?.x) ? target.x : x,
            isFiniteGridNumber(target?.y) ? target.y : y,
            cols,
            maxRows
          )
        : null;
      const fit = anchored || findNearestFit(
        nextLayout,
        item,
        cols,
        isFiniteGridNumber(target?.x) ? target.x : x,
        isFiniteGridNumber(target?.y) ? target.y : y,
        maxRows
      );
      if (fit) {
        x = fit.x;
        y = fit.y;
        if (anchored) {
          diagnostics.push(placementDiagnostic(
            "grid-editor.placement.cursor-anchor",
            "info",
            "Placed item from an explicit top-left cursor anchor.",
            {
              itemIds: [item.i],
              details: {
                target: anchored.target,
                placed: { x: anchored.x, y: anchored.y },
                clamped: anchored.clamped,
                shiftedDown: anchored.shiftedDown
              }
            }
          ));
        }
      }
    } else {
      const fit = findFirstFit(nextLayout, item, cols, maxRows);
      if (fit) {
        x = fit.x;
        y = fit.y;
      }
    }

    const candidate = {
      ...item,
      x: Math.max(0, Math.floor(x)),
      y: Math.max(0, Math.floor(y))
    };
    const validation = validateLayout([...nextLayout, candidate], [candidate.i], cols, maxRows);
    if (!validation.ok) {
      if (exactCursorAnchor) {
        const blockedReason = validation.reason === "maxRows" || Number.isFinite(maxRows)
          ? validation.reason
          : validation.reason;
        const previewLayout = [...nextLayout, candidate];
        const previewInsertedIds = insertedIds.concat(candidate.i);
        diagnostics.push(placementDiagnostic(
          blockedReason === "collision"
            ? "grid-editor.placement.collision-blocked"
            : blockedReason === "maxRows"
              ? "grid-editor.placement.max-rows-blocked"
              : "grid-editor.placement.bounds-blocked",
          "warning",
          "Placement target is blocked at the current cursor position.",
          { reason: blockedReason, itemIds: validation.itemIds }
        ));
        return {
          layout: previewLayout,
          failed: true,
          blocked: {
            reason: blockedReason,
            itemIds: validation.itemIds,
            message: "Placement target is blocked at the current cursor position."
          },
          summary: {
            strategy,
            placementSource: strategy,
            insertedIds: previewInsertedIds,
            shiftedIds: [],
            before: [],
            after: previewLayout.filter(item => previewInsertedIds.includes(item.i)).map(geometry),
            diagnostics
          }
        };
      }
      const fit = findFirstFit(nextLayout, item, cols, maxRows);
      if (!fit) {
        const blockedReason = validation.reason === "maxRows" || Number.isFinite(maxRows)
          ? "maxRows"
          : validation.reason;
        diagnostics.push(placementDiagnostic(
          blockedReason === "maxRows"
            ? "grid-editor.placement.max-rows-blocked"
            : "grid-editor.placement.collision-unresolved",
          "warning",
          "No legal placement was available for the item.",
          { reason: blockedReason, itemIds: validation.itemIds }
        ));
        return {
          layout: sourceLayout,
          failed: true,
          blocked: {
            reason: blockedReason,
            itemIds: validation.itemIds,
            message: "One or more items could not fit in the current layout."
          },
          summary: {
            strategy,
            placementSource: strategy,
            insertedIds,
            shiftedIds: [],
            before: [],
            after: [],
            diagnostics
          }
        };
      }
      candidate.x = fit.x;
      candidate.y = fit.y;
    }
    nextLayout.push(candidate);
    insertedIds.push(candidate.i);
  }

  diagnostics.push(placementDiagnostic(
    strategy === "first-fit"
      ? "grid-editor.placement.first-fit"
      : `grid-editor.placement.${strategy}`,
    "info",
    `Placed ${insertedIds.length} item${insertedIds.length === 1 ? "" : "s"} using ${strategy}.`,
    { itemIds: insertedIds }
  ));

  return {
    layout: nextLayout,
    failed: false,
    summary: {
      strategy,
      placementSource: strategy,
      insertedIds,
      shiftedIds: [],
      before: [],
      after: nextLayout.filter(item => insertedIds.includes(item.i)).map(geometry),
      diagnostics
    }
  };
};

const placeByTopShift = (
  sourceLayout: Layout,
  items: Layout,
  cols: number,
  maxRows: number
): GridEditorPlacementResult => {
  const source = cloneLayout(sourceLayout);
  const normalizedItems = items.map(normalizeItem);
  const insertedIds = normalizedItems.map(item => item.i);
  const shiftedIds = source.map(item => item.i);
  const before = source.map(geometry);
  const diagnostics: GridEditorPlacementDiagnostic[] = [];

  if (normalizedItems.length === 0) {
    diagnostics.push(placementDiagnostic(
      "grid-editor.placement.invalid-item",
      "error",
      "No items were provided for placement.",
      { reason: "invalid-input" }
    ));
    return {
      layout: sourceLayout,
      failed: true,
      blocked: { reason: "invalid-input", message: "No items were provided for placement." },
      summary: {
        strategy: "insert-top-shift",
        placementSource: "insert-top-shift",
        insertedIds: [],
        shiftedIds: [],
        before: [],
        after: [],
        diagnostics
      }
    };
  }

  const minX = Math.min(...normalizedItems.map(item => item.x));
  const minY = Math.min(...normalizedItems.map(item => item.y));
  const inserted = normalizedItems.map(item => ({
    ...item,
    x: item.x - minX,
    y: item.y - minY
  }));
  const shiftHeight = Math.max(...inserted.map(item => item.y + item.h));

  for (const item of inserted) {
    const issue = invalidSize(item, cols, maxRows);
    if (issue) {
      diagnostics.push(placementDiagnostic(
        "grid-editor.placement.invalid-item",
        "error",
        "Inserted item cannot fit within the current grid bounds.",
        { reason: issue, itemIds: [item.i] }
      ));
      return {
        layout: sourceLayout,
        failed: true,
        blocked: {
          reason: issue,
          itemIds: [item.i],
          message: "Inserted item cannot fit within the current grid bounds."
        },
        summary: {
          strategy: "insert-top-shift",
          placementSource: "insert-top-shift",
          insertedIds,
          shiftedIds: [],
          before,
          after: [],
          diagnostics
        }
      };
    }
  }

  const shifted = source.map(item => ({
    ...item,
    y: item.y + shiftHeight
  }));
  const candidate = [...inserted, ...shifted];
  const validation = validateLayout(candidate, candidate.map(item => item.i), cols, maxRows);
  if (!validation.ok) {
    diagnostics.push(placementDiagnostic(
      validation.reason === "maxRows"
        ? "grid-editor.placement.max-rows-blocked"
        : "grid-editor.placement.collision-unresolved",
      "warning",
      "Top insert shift could not produce a valid layout.",
      { reason: validation.reason, itemIds: validation.itemIds, details: { shiftHeight } }
    ));
    return {
      layout: sourceLayout,
      failed: true,
      blocked: {
        reason: validation.reason,
        itemIds: validation.itemIds,
        message: "Top insert shift could not produce a valid layout."
      },
      summary: {
        strategy: "insert-top-shift",
        placementSource: "insert-top-shift",
        insertedIds,
        shiftedIds,
        before,
        after: [],
        diagnostics
      }
    };
  }

  diagnostics.push(placementDiagnostic(
    "grid-editor.placement.insert-top-shift",
    "info",
    shiftedIds.length > 0
      ? `Inserted at the top-left and shifted ${shiftedIds.length} existing item${shiftedIds.length === 1 ? "" : "s"}.`
      : "Inserted at the top-left without shifting existing items.",
    { itemIds: insertedIds.concat(shiftedIds), details: { shiftHeight, shiftedCount: shiftedIds.length } }
  ));

  return {
    layout: candidate,
    failed: false,
    summary: {
      strategy: "insert-top-shift",
      placementSource: "insert-top-shift",
      insertedIds,
      shiftedIds,
      delta: { dx: 0, dy: shiftHeight },
      before,
      after: candidate.map(geometry),
      diagnostics
    }
  };
};

export const placeGridEditorNewItems = (
  sourceLayout: Layout,
  items: Layout,
  strategy: string,
  payload: Record<string, unknown> = {}
): GridEditorPlacementResult => {
  const resolvedStrategy = (
    strategy === "offset" ||
    strategy === "cursor" ||
    strategy === "nearest-fit" ||
    strategy === "first-fit" ||
    strategy === "insert-top-shift"
  )
    ? strategy
    : "first-fit";
  const cols = resolveCols(payload.cols);
  const maxRows = resolveMaxRows(payload.maxRows);

  if (resolvedStrategy === "insert-top-shift") {
    return placeByTopShift(sourceLayout, items, cols, maxRows);
  }
  return placeByFit(sourceLayout, items, resolvedStrategy, payload, cols, maxRows);
};
