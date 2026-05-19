import {
  cloneLayout,
  cloneLayoutItem,
  compact,
  findFirstFit,
  findNearestFit,
  getLayoutItem,
  moveElement,
  validateLayout
} from "../utils";
import { findOrGenerateResponsiveLayout } from "../responsiveUtils";
import { rowColumnOccupancyStrategy } from "./indexing";

import type {
  CompactType,
  Layout,
  LayoutItem,
  ResizeHandleAxis
} from "../utils";
import type {
  GridLayoutEngine,
  GridLayoutEngineOptions,
  LayoutBlockedReason,
  LayoutDebugSummary,
  LayoutDiagnostics,
  LayoutIndex,
  LayoutOperation,
  LayoutOperationRequest,
  LayoutOperationResult,
  LayoutOperationStatus,
  LayoutPatch
} from "./types";

const DEFAULT_MAX_ROWS = Infinity;
const DROP_ID = "__dropping-elem__";

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const makeRevision = (revision: number): string => `layout-rev-${revision}`;

const getDiagnosticsConfig = (options: GridLayoutEngineOptions) =>
  typeof options.diagnostics === "object" ? options.diagnostics : {};

const shouldDebug = (request: LayoutOperationRequest): boolean => {
  if (request.debug) return true;
  const diagnostics = request.options.diagnostics;
  return typeof diagnostics === "object" && diagnostics.debug === true;
};

const normalizeOptions = (options: GridLayoutEngineOptions): GridLayoutEngineOptions => ({
  ...options,
  maxRows: typeof options.maxRows === "number" ? options.maxRows : DEFAULT_MAX_ROWS,
  allowOverlap: Boolean(options.allowOverlap),
  preventCollision: Boolean(options.preventCollision),
  indexStrategy: options.indexStrategy || rowColumnOccupancyStrategy()
});

const isFinitePositive = (value: number): boolean =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isWestHandle = (handle: ResizeHandleAxis): boolean =>
  handle === "sw" || handle === "w" || handle === "nw";

const isNorthHandle = (handle: ResizeHandleAxis): boolean =>
  handle === "ne" || handle === "n" || handle === "nw";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

const cloneForMutation = (layout: Layout): Layout => cloneLayout(layout);

const itemSignature = (item: LayoutItem): string =>
  `${item.x}:${item.y}:${item.w}:${item.h}:${Boolean(item.moved)}`;

const shallowLayoutEqual = (left: Layout, right: Layout): boolean => {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    const a = left[i];
    const b = right[i];
    if (!a || !b || a.i !== b.i || itemSignature(a) !== itemSignature(b)) return false;
  }
  return true;
};

const collectPatches = (before: Layout, after: Layout, compactType: CompactType): LayoutPatch[] => {
  const patches: LayoutPatch[] = [];
  const beforeById = new Map<string, LayoutItem>();
  const afterById = new Map<string, LayoutItem>();
  before.forEach(item => beforeById.set(item.i, item));
  after.forEach(item => afterById.set(item.i, item));

  after.forEach(item => {
    const previous = beforeById.get(item.i);
    if (!previous) {
      patches.push({ type: "add", item: cloneLayoutItem(item) });
      return;
    }
    if (
      previous.w !== item.w ||
      previous.h !== item.h ||
      previous.x !== item.x ||
      previous.y !== item.y
    ) {
      if (previous.w !== item.w || previous.h !== item.h) {
        patches.push({
          type: "resize",
          id: item.i,
          from: { w: previous.w, h: previous.h, x: previous.x, y: previous.y },
          to: { w: item.w, h: item.h, x: item.x, y: item.y }
        });
      } else {
        patches.push({
          type: "move",
          id: item.i,
          from: { x: previous.x, y: previous.y },
          to: { x: item.x, y: item.y }
        });
      }
    }
  });

  before.forEach(item => {
    if (!afterById.has(item.i)) patches.push({ type: "remove", id: item.i });
  });

  if (compactType && patches.length > 1) {
    patches.push({
      type: "compact",
      affectedIds: patches.map(patch => {
        if (patch.type === "add") return patch.item.i;
        if (patch.type === "compact") return "";
        return patch.id;
      }).filter(Boolean)
    });
  }

  return patches;
};

const collectAffectedIds = (patches: LayoutPatch[], collisions: LayoutItem[]): string[] => {
  const ids = new Set<string>();
  patches.forEach(patch => {
    if (patch.type === "compact") patch.affectedIds.forEach(id => ids.add(id));
    else if (patch.type === "add") ids.add(patch.item.i);
    else ids.add(patch.id);
  });
  collisions.forEach(item => ids.add(item.i));
  return Array.from(ids);
};

const buildIndex = (layout: Layout, options: GridLayoutEngineOptions): LayoutIndex =>
  (options.indexStrategy || rowColumnOccupancyStrategy()).build(layout, {
    cols: options.cols,
    maxRows: options.maxRows,
    compactType: options.compactType,
    allowOverlap: options.allowOverlap,
    preventCollision: options.preventCollision
  });

const patchTargetId = (patch: LayoutPatch): string | null => {
  if (patch.type === "add") return patch.item.i;
  if (patch.type === "compact") return null;
  return patch.id;
};

const applyIndexPatches = (
  index: LayoutIndex,
  before: Layout,
  after: Layout,
  patches: LayoutPatch[]
): boolean => {
  const beforeById = new Map<string, LayoutItem>();
  const afterById = new Map<string, LayoutItem>();
  before.forEach(item => beforeById.set(item.i, item));
  after.forEach(item => afterById.set(item.i, item));

  try {
    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i];
      if (patch.type === "compact") continue;
      if (patch.type === "add") {
        const added = afterById.get(patch.item.i) || patch.item;
        index.insert(added);
        continue;
      }
      if (patch.type === "remove") {
        index.remove(patch.id);
        continue;
      }
      const id = patchTargetId(patch);
      if (!id) continue;
      const previous = beforeById.get(id);
      const next = afterById.get(id);
      if (!previous || !next) return false;
      index.update(previous, next);
    }
    return true;
  } catch (_error) {
    return false;
  }
};

const createDiagnostics = (
  request: LayoutOperationRequest,
  status: LayoutOperationStatus,
  layout: Layout,
  patches: LayoutPatch[],
  collisions: LayoutItem[],
  start: number,
  indexHit: boolean,
  blockedReason?: LayoutBlockedReason
): LayoutDiagnostics => {
  const durationMs = now() - start;
  const diagnostics: LayoutDiagnostics = {
    operationId: request.id,
    operationType: request.operation.type,
    phase: request.phase,
    layoutSize: request.layout.length,
    affectedCount: collectAffectedIds(patches, collisions).length,
    collisionCount: collisions.length,
    indexHit,
    schedulerMode: request.options.scheduler?.mode,
    executorKind: request.options.executor?.kind || "main-thread",
    durationMs,
    computeMs: durationMs
  };

  if (shouldDebug(request)) {
    diagnostics.debug = createDebugSummary(request, status, layout, patches, collisions, blockedReason);
  }

  return diagnostics;
};

const createDebugSummary = (
  request: LayoutOperationRequest,
  status: LayoutOperationStatus,
  _layout: Layout,
  patches: LayoutPatch[],
  collisions: LayoutItem[],
  blockedReason?: LayoutBlockedReason
): LayoutDebugSummary => ({
  cols: request.options.cols,
  maxRows: request.options.maxRows,
  compactType: request.options.compactType,
  allowOverlap: request.options.allowOverlap,
  preventCollision: request.options.preventCollision,
  operation: request.operation,
  result: {
    status,
    affectedIds: collectAffectedIds(patches, collisions),
    collisionIds: collisions.map(item => item.i),
    blockedReason
  }
});

const emitResultEvents = (
  request: LayoutOperationRequest,
  result: LayoutOperationResult
): void => {
  const onEvent = request.options.onEvent;
  if (!onEvent || !result.diagnostics) return;

  onEvent({
    type: "operation",
    id: result.id,
    operationType: request.operation.type,
    phase: request.phase,
    diagnostics: result.diagnostics
  });

  if (result.status === "blocked" && result.blocked) {
    onEvent({
      type: "blocked",
      id: result.id,
      reason: result.blocked.reason,
      itemIds: result.blocked.itemIds,
      diagnostics: result.diagnostics
    });
  }

  const budgetMs = getDiagnosticsConfig(request.options).budgetMs;
  if (typeof budgetMs === "number" && result.diagnostics.durationMs > budgetMs) {
    onEvent({
      type: "budget-warning",
      id: result.id,
      message: `layout operation exceeded ${budgetMs}ms`,
      diagnostics: result.diagnostics
    });
  }
};

const makeResult = (
  request: LayoutOperationRequest,
  status: LayoutOperationStatus,
  layout: Layout,
  patches: LayoutPatch[],
  collisions: LayoutItem[],
  start: number,
  indexHit: boolean,
  extra: Partial<LayoutOperationResult> = {}
): LayoutOperationResult => {
  const affectedIds = collectAffectedIds(patches, collisions);
  const result: LayoutOperationResult = {
    id: request.id,
    status,
    layout,
    patches,
    affectedIds,
    collisions,
    diagnostics: createDiagnostics(
      request,
      status,
      layout,
      patches,
      collisions,
      start,
      indexHit,
      extra.blocked?.reason
    ),
    ...extra
  };
  emitResultEvents(request, result);
  return result;
};

const makeBlockedResult = (
  request: LayoutOperationRequest,
  reason: LayoutBlockedReason,
  collisions: LayoutItem[],
  start: number,
  indexHit: boolean,
  itemIds: string[] = collisions.map(item => item.i)
): LayoutOperationResult =>
  makeResult(request, "blocked", request.layout, [], collisions, start, indexHit, {
    blocked: { reason, itemIds }
  });

const makeNoopResult = (
  request: LayoutOperationRequest,
  start: number,
  indexHit: boolean,
  placeholder?: LayoutItem
): LayoutOperationResult =>
  makeResult(request, "noop", request.layout, [], [], start, indexHit, { placeholder });

const applyFinalCompaction = (
  layout: Layout,
  options: GridLayoutEngineOptions
): Layout => {
  if (options.allowOverlap || options.compactType == null) return layout;
  return compact(layout, options.compactType, options.cols, options.allowOverlap);
};

const withMovedFlagsCleared = (layout: Layout): Layout => {
  for (let i = 0; i < layout.length; i++) {
    if (layout[i].moved) layout[i].moved = false;
  }
  return layout;
};

type NormalizedGroupMove = {
  ids: string[];
  movingIds: Set<string>;
  activeId: string;
  dx: number;
  dy: number;
  movingItems: LayoutItem[];
  targetItems: LayoutItem[];
};

const uniqueLayoutItems = (items: LayoutItem[]): LayoutItem[] => {
  const seen = new Set<string>();
  const unique: LayoutItem[] = [];
  items.forEach(item => {
    if (seen.has(item.i)) return;
    seen.add(item.i);
    unique.push(item);
  });
  return unique;
};

const normalizeGroupMove = (
  request: LayoutOperationRequest,
  start: number
): { ok: true; value: NormalizedGroupMove } | { ok: false; result: LayoutOperationResult } => {
  const operation = request.operation;
  if (operation.type !== "groupMove") {
    return { ok: false, result: executeError(request, "invalid groupMove operation", start) };
  }
  if (!Number.isFinite(operation.dx) || !Number.isFinite(operation.dy)) {
    return {
      ok: false,
      result: makeBlockedResult(request, "invalid-input", [], start, true)
    };
  }

  const ids: string[] = [];
  const seen = new Set<string>();
  operation.ids.forEach(id => {
    if (typeof id !== "string") return;
    const normalized = id.trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    ids.push(normalized);
  });
  if (ids.length === 0) {
    return {
      ok: false,
      result: makeBlockedResult(request, "invalid-input", [], start, true)
    };
  }

  const missingIds = ids.filter(id => !getLayoutItem(request.layout, id));
  if (missingIds.length > 0) {
    return {
      ok: false,
      result: makeBlockedResult(request, "missing-item", [], start, true, missingIds)
    };
  }

  const movingItems = ids
    .map(id => getLayoutItem(request.layout, id))
    .filter(Boolean) as LayoutItem[];
  const staticItems = movingItems.filter(item => item.static);
  if (staticItems.length > 0) {
    return {
      ok: false,
      result: makeBlockedResult(
        request,
        "static-item",
        staticItems,
        start,
        true,
        staticItems.map(item => item.i)
      )
    };
  }

  const movingIds = new Set(ids);
  const activeId = operation.activeId && movingIds.has(operation.activeId)
    ? operation.activeId
    : ids[0];
  const dx = Math.trunc(operation.dx);
  const dy = Math.trunc(operation.dy);
  const targetItems = movingItems.map(item => ({
    ...cloneLayoutItem(item),
    x: item.x + dx,
    y: item.y + dy
  }));

  return {
    ok: true,
    value: {
      ids,
      movingIds,
      activeId,
      dx,
      dy,
      movingItems,
      targetItems
    }
  };
};

const validateGroupTargets = (
  normalized: NormalizedGroupMove,
  options: GridLayoutEngineOptions
): { reason: "bounds" | "maxRows"; itemIds: string[] } | null => {
  const boundsIds: string[] = [];
  const maxRowsIds: string[] = [];
  normalized.targetItems.forEach(item => {
    if (item.x < 0 || item.y < 0 || item.x + item.w > options.cols) {
      boundsIds.push(item.i);
      return;
    }
    if (Number.isFinite(options.maxRows) && item.y + item.h > (options.maxRows as number)) {
      maxRowsIds.push(item.i);
    }
  });
  if (boundsIds.length > 0) return { reason: "bounds", itemIds: boundsIds };
  if (maxRowsIds.length > 0) return { reason: "maxRows", itemIds: maxRowsIds };
  return null;
};

const getGroupExternalCollisions = (
  normalized: NormalizedGroupMove,
  index: LayoutIndex,
  predicate?: (item: LayoutItem) => boolean
): LayoutItem[] => uniqueLayoutItems(
  normalized.targetItems.flatMap(item =>
    index.queryAllCollisions(item).filter(candidate =>
      !normalized.movingIds.has(candidate.i) && (!predicate || predicate(candidate))
    )
  )
);

const applyGroupTargets = (
  layout: Layout,
  normalized: NormalizedGroupMove,
  temporaryStatic: boolean
): Layout => {
  const nextLayout = cloneForMutation(layout);
  normalized.targetItems.forEach(target => {
    const item = getLayoutItem(nextLayout, target.i);
    if (!item) return;
    item.x = target.x;
    item.y = target.y;
    item.moved = true;
    if (temporaryStatic) item.static = true;
  });
  return nextLayout;
};

const restoreGroupStaticFlags = (
  layout: Layout,
  normalized: NormalizedGroupMove
): Layout => {
  normalized.movingItems.forEach(source => {
    const item = getLayoutItem(layout, source.i);
    if (!item) return;
    if (typeof source.static === "undefined") delete item.static;
    else item.static = source.static;
  });
  return layout;
};

const executeSingleGroupMove = (
  request: LayoutOperationRequest,
  index: LayoutIndex,
  normalized: NormalizedGroupMove,
  start: number,
  collisions: LayoutItem[]
): LayoutOperationResult => {
  const sourceItem = normalized.movingItems[0];
  const targetItem = normalized.targetItems[0];
  if (!sourceItem || !targetItem) {
    return makeBlockedResult(request, "invalid-input", [], start, true);
  }
  if (sourceItem.x === targetItem.x && sourceItem.y === targetItem.y) {
    return makeNoopResult(request, start, true, cloneLayoutItem(sourceItem));
  }
  if (collisions.some(item => item.static)) {
    const staticCollisions = collisions.filter(item => item.static);
    return makeBlockedResult(
      request,
      "static-item",
      staticCollisions,
      start,
      true,
      staticCollisions.map(item => item.i)
    );
  }
  if (collisions.length > 0 && request.options.preventCollision && !request.options.allowOverlap) {
    return makeBlockedResult(request, "collision", collisions, start, true);
  }

  const nextLayout = cloneForMutation(request.layout);
  const nextItem = getLayoutItem(nextLayout, sourceItem.i);
  if (!nextItem) return makeBlockedResult(request, "missing-item", [], start, true, [sourceItem.i]);

  const moved = moveElement(
    nextLayout,
    nextItem,
    request.options.compactType,
    request.options.cols,
    request.options.allowOverlap,
    targetItem.x,
    targetItem.y,
    request.operation.type === "groupMove" ? request.operation.userAction !== false : true,
    request.options.preventCollision
  );
  const finalLayout = withMovedFlagsCleared(applyFinalCompaction(moved, request.options));
  const patches = collectPatches(request.layout, finalLayout, request.options.compactType);
  const finalItem = getLayoutItem(finalLayout, sourceItem.i) || nextItem;
  const status = patches.length === 0 || shallowLayoutEqual(request.layout, finalLayout) ? "noop" : "changed";

  return makeResult(
    request,
    status,
    status === "noop" ? request.layout : finalLayout,
    patches,
    collisions,
    start,
    true,
    { placeholder: cloneLayoutItem(finalItem) }
  );
};

const executeGroupMove = (
  request: LayoutOperationRequest,
  index: LayoutIndex,
  start: number
): LayoutOperationResult => {
  const normalizedResult = normalizeGroupMove(request, start);
  if (!normalizedResult.ok) return normalizedResult.result;
  const normalized = normalizedResult.value;
  const activeItem = normalized.movingItems.find(item => item.i === normalized.activeId) ||
    normalized.movingItems[0];

  const validation = validateGroupTargets(normalized, request.options);
  if (validation) {
    return makeBlockedResult(request, validation.reason, [], start, true, validation.itemIds);
  }
  if (normalized.dx === 0 && normalized.dy === 0 && activeItem) {
    return makeNoopResult(request, start, true, cloneLayoutItem(activeItem));
  }

  const externalCollisions = getGroupExternalCollisions(normalized, index);
  const staticCollisions = externalCollisions.filter(item => item.static);
  if (staticCollisions.length > 0) {
    return makeBlockedResult(
      request,
      "static-item",
      staticCollisions,
      start,
      true,
      staticCollisions.map(item => item.i)
    );
  }

  if (normalized.ids.length === 1) {
    return executeSingleGroupMove(request, index, normalized, start, externalCollisions);
  }

  if (
    externalCollisions.length > 0 &&
    request.options.preventCollision &&
    !request.options.allowOverlap
  ) {
    return makeBlockedResult(request, "collision", externalCollisions, start, true);
  }

  const rigidCompaction = !request.options.allowOverlap;
  const nextLayout = applyGroupTargets(request.layout, normalized, rigidCompaction);
  let finalLayout = nextLayout;
  if (!request.options.allowOverlap) {
    finalLayout = compact(
      nextLayout,
      request.options.compactType,
      request.options.cols,
      request.options.allowOverlap
    );
  }
  finalLayout = withMovedFlagsCleared(restoreGroupStaticFlags(finalLayout, normalized));
  const patches = collectPatches(request.layout, finalLayout, request.options.compactType);
  const finalItem = getLayoutItem(finalLayout, normalized.activeId) || activeItem;
  const status = patches.length === 0 || shallowLayoutEqual(request.layout, finalLayout) ? "noop" : "changed";

  return makeResult(
    request,
    status,
    status === "noop" ? request.layout : finalLayout,
    patches,
    externalCollisions,
    start,
    true,
    finalItem ? { placeholder: cloneLayoutItem(finalItem) } : {}
  );
};

const executeMove = (
  request: LayoutOperationRequest,
  index: LayoutIndex,
  start: number
): LayoutOperationResult => {
  const operation = request.operation;
  if (operation.type !== "move") return executeError(request, "invalid move operation", start);

  const sourceItem = getLayoutItem(request.layout, operation.id);
  if (!sourceItem) return makeBlockedResult(request, "missing-item", [], start, true, [operation.id]);
  if (sourceItem.static && sourceItem.isDraggable !== true) {
    return makeBlockedResult(request, "static-item", [], start, true, [operation.id]);
  }
  if (sourceItem.x === operation.x && sourceItem.y === operation.y) {
    return makeNoopResult(request, start, true, cloneLayoutItem(sourceItem));
  }

  const candidate = { ...sourceItem, x: operation.x, y: operation.y };
  const collisions = index.queryAllCollisions(candidate);
  if (collisions.length > 0 && request.options.preventCollision && !request.options.allowOverlap) {
    return makeBlockedResult(request, "collision", collisions, start, true);
  }

  const nextLayout = cloneForMutation(request.layout);
  const nextItem = getLayoutItem(nextLayout, operation.id);
  if (!nextItem) return makeBlockedResult(request, "missing-item", [], start, true, [operation.id]);

  const moved = moveElement(
    nextLayout,
    nextItem,
    request.options.compactType,
    request.options.cols,
    request.options.allowOverlap,
    operation.x,
    operation.y,
    operation.userAction !== false,
    request.options.preventCollision
  );
  const finalLayout = withMovedFlagsCleared(applyFinalCompaction(moved, request.options));
  const patches = collectPatches(request.layout, finalLayout, request.options.compactType);
  const finalItem = getLayoutItem(finalLayout, operation.id) || nextItem;
  const status = patches.length === 0 || shallowLayoutEqual(request.layout, finalLayout) ? "noop" : "changed";

  return makeResult(request, status, status === "noop" ? request.layout : finalLayout, patches, collisions, start, true, {
    placeholder: cloneLayoutItem(finalItem)
  });
};

const normalizeResize = (
  item: LayoutItem,
  operation: Extract<LayoutOperation, { type: "resize" }>,
  options: GridLayoutEngineOptions
): { x: number; y: number; w: number; h: number; moved: boolean; reason?: LayoutBlockedReason } => {
  let w = clamp(
    operation.w,
    typeof item.minW === "number" ? item.minW : 1,
    typeof item.maxW === "number" ? item.maxW : options.cols
  );
  let h = clamp(
    operation.h,
    typeof item.minH === "number" ? item.minH : 1,
    typeof item.maxH === "number" ? item.maxH : options.maxRows || DEFAULT_MAX_ROWS
  );
  let x = typeof operation.x === "number" ? operation.x : item.x;
  let y = typeof operation.y === "number" ? operation.y : item.y;
  let moved = false;

  if (typeof operation.x !== "number" && isWestHandle(operation.handle)) {
    x = item.x + (item.w - w);
    if (x < 0) {
      x = 0;
      w = item.w;
    }
    moved = true;
  }

  if (typeof operation.y !== "number" && isNorthHandle(operation.handle)) {
    y = item.y + (item.h - h);
    if (y < 0) {
      y = 0;
      h = item.h;
    }
    moved = true;
  }

  if (x < 0 || y < 0) return { x, y, w, h, moved, reason: "bounds" };
  if (x + w > options.cols) return { x, y, w, h, moved, reason: "bounds" };
  if (Number.isFinite(options.maxRows) && y + h > (options.maxRows as number)) {
    return { x, y, w, h, moved, reason: "maxRows" };
  }

  return { x, y, w, h, moved: moved || x !== item.x || y !== item.y };
};

const executeResize = (
  request: LayoutOperationRequest,
  index: LayoutIndex,
  start: number
): LayoutOperationResult => {
  const operation = request.operation;
  if (operation.type !== "resize") return executeError(request, "invalid resize operation", start);

  const sourceItem = getLayoutItem(request.layout, operation.id);
  if (!sourceItem) return makeBlockedResult(request, "missing-item", [], start, true, [operation.id]);
  if (!isFinitePositive(operation.w) || !isFinitePositive(operation.h)) {
    return makeBlockedResult(request, "invalid-input", [], start, true, [operation.id]);
  }

  const normalized = normalizeResize(sourceItem, operation, request.options);
  if (normalized.reason) {
    return makeBlockedResult(request, normalized.reason, [], start, true, [operation.id]);
  }
  if (
    sourceItem.w === normalized.w &&
    sourceItem.h === normalized.h &&
    sourceItem.x === normalized.x &&
    sourceItem.y === normalized.y
  ) {
    return makeNoopResult(request, start, true, cloneLayoutItem(sourceItem));
  }

  const candidate = {
    ...sourceItem,
    x: normalized.x,
    y: normalized.y,
    w: normalized.w,
    h: normalized.h
  };
  const collisions = index.queryAllCollisions(candidate);
  if (collisions.length > 0 && request.options.preventCollision && !request.options.allowOverlap) {
    return makeBlockedResult(request, "collision", collisions, start, true);
  }

  const nextLayout = cloneForMutation(request.layout);
  const nextItem = getLayoutItem(nextLayout, operation.id);
  if (!nextItem) return makeBlockedResult(request, "missing-item", [], start, true, [operation.id]);

  nextItem.w = normalized.w;
  nextItem.h = normalized.h;
  let workingLayout = nextLayout;
  if (normalized.moved) {
    workingLayout = moveElement(
      nextLayout,
      nextItem,
      request.options.compactType,
      request.options.cols,
      request.options.allowOverlap,
      normalized.x,
      normalized.y,
      true,
      request.options.preventCollision
    );
  } else {
    nextItem.x = normalized.x;
    nextItem.y = normalized.y;
  }

  const finalLayout = withMovedFlagsCleared(applyFinalCompaction(workingLayout, request.options));
  const patches = collectPatches(request.layout, finalLayout, request.options.compactType);
  const finalItem = getLayoutItem(finalLayout, operation.id) || nextItem;
  const status = patches.length === 0 || shallowLayoutEqual(request.layout, finalLayout) ? "noop" : "changed";
  return makeResult(request, status, status === "noop" ? request.layout : finalLayout, patches, collisions, start, true, {
    placeholder: cloneLayoutItem(finalItem)
  });
};

const executeDropFit = (
  request: LayoutOperationRequest,
  index: LayoutIndex,
  start: number
): LayoutOperationResult => {
  const operation = request.operation;
  if (operation.type !== "dropFit") return executeError(request, "invalid dropFit operation", start);

  const width = Math.floor(operation.item.w);
  const height = Math.floor(operation.item.h);
  if (!isFinitePositive(width) || !isFinitePositive(height)) {
    return makeBlockedResult(request, "invalid-input", [], start, true);
  }

  const id = operation.item.i || DROP_ID;
  const baseLayout = request.layout.filter(item => item.i !== id);
  const baseIndex = buildIndex(baseLayout, request.options);
  let position: { x: number; y: number } | null = null;
  let fallback: "first-fit" | "nearest-fit" | "none" = "none";

  if (operation.strategy === "cursor" && operation.target) {
    const candidate = {
      i: id,
      x: Math.max(0, Math.floor(operation.target.x)),
      y: Math.max(0, Math.floor(operation.target.y)),
      w: width,
      h: height
    };
    if (baseIndex.canPlace(candidate)) position = { x: candidate.x, y: candidate.y };
    else {
      position = baseIndex.findNearestFit({ w: width, h: height }, operation.target);
      fallback = position ? "nearest-fit" : "none";
    }
  } else {
    position = baseIndex.findFirstFit({ w: width, h: height });
    fallback = position ? "first-fit" : "none";
  }

  if (!position) {
    return makeResult(request, "blocked", request.layout, [], [], start, true, {
      blocked: { reason: "collision", itemIds: [] },
      drop: {
        position: null,
        strategy: operation.strategy,
        fallback,
        reason: "no-fit"
      }
    });
  }

  const nextItem: LayoutItem = {
    ...(operation.item as LayoutItem),
    i: id,
    x: position.x,
    y: position.y,
    w: width,
    h: height,
    static: false
  };
  const nextLayout = [...baseLayout.map(cloneLayoutItem), nextItem];
  const finalLayout = applyFinalCompaction(nextLayout, request.options);
  const patches = collectPatches(request.layout, finalLayout, request.options.compactType);

  return makeResult(request, "changed", finalLayout, patches, [], start, true, {
    placeholder: cloneLayoutItem(nextItem),
    drop: {
      position,
      strategy: operation.strategy,
      fallback
    }
  });
};

const executeCompact = (
  request: LayoutOperationRequest,
  start: number
): LayoutOperationResult => {
  if (request.options.allowOverlap || request.options.compactType == null) {
    return makeNoopResult(request, start, false);
  }

  const nextLayout = compact(
    request.layout,
    request.options.compactType,
    request.options.cols,
    request.options.allowOverlap
  );
  const patches = collectPatches(request.layout, nextLayout, request.options.compactType);
  const status = patches.length === 0 || shallowLayoutEqual(request.layout, nextLayout) ? "noop" : "changed";
  return makeResult(request, status, status === "noop" ? request.layout : nextLayout, patches, [], start, false);
};

const executeValidate = (
  request: LayoutOperationRequest,
  start: number
): LayoutOperationResult => {
  try {
    validateLayout(request.layout, "LayoutEngine.layout");
    return makeNoopResult(request, start, false);
  } catch (error) {
    return makeResult(request, "error", request.layout, [], [], start, false, {
      error: {
        message: error instanceof Error ? error.message : String(error),
        cause: error
      }
    });
  }
};

const executeResponsiveLayout = (
  request: LayoutOperationRequest,
  start: number
): LayoutOperationResult => {
  const operation = request.operation;
  if (operation.type !== "generateResponsiveLayout") {
    return executeError(request, "invalid responsive operation", start);
  }

  const breakpoints = operation.breakpoints || { [operation.breakpoint]: 0 };
  const layouts = operation.layouts || { [operation.sourceBreakpoint || operation.breakpoint]: request.layout };
  const nextLayout = findOrGenerateResponsiveLayout(
    layouts,
    breakpoints,
    operation.breakpoint,
    operation.sourceBreakpoint || operation.breakpoint,
    operation.cols,
    request.options.compactType
  );
  const patches = collectPatches(request.layout, nextLayout, request.options.compactType);
  const status = patches.length === 0 || shallowLayoutEqual(request.layout, nextLayout) ? "noop" : "changed";
  return makeResult(request, status, status === "noop" ? request.layout : nextLayout, patches, [], start, false);
};

const executeError = (
  request: LayoutOperationRequest,
  message: string,
  start: number,
  cause?: unknown
): LayoutOperationResult =>
  makeResult(request, "error", request.layout, [], [], start, false, {
    error: { message, cause }
  });

const computeLegacyLayout = (request: LayoutOperationRequest): Layout => {
  const options = request.options;
  switch (request.operation.type) {
    case "move": {
      const nextLayout = cloneLayout(request.layout);
      const item = getLayoutItem(nextLayout, request.operation.id);
      if (!item) return request.layout;
      const moved = moveElement(
        nextLayout,
        item,
        options.compactType,
        options.cols,
        options.allowOverlap,
        request.operation.x,
        request.operation.y,
        request.operation.userAction !== false,
        options.preventCollision
      );
      return applyFinalCompaction(moved, options);
    }
    case "groupMove": {
      const ids = Array.from(new Set(request.operation.ids.filter(Boolean)));
      if (ids.length !== 1) return request.layout;
      const nextLayout = cloneLayout(request.layout);
      const item = getLayoutItem(nextLayout, ids[0]);
      if (!item) return request.layout;
      const moved = moveElement(
        nextLayout,
        item,
        options.compactType,
        options.cols,
        options.allowOverlap,
        item.x + Math.trunc(request.operation.dx),
        item.y + Math.trunc(request.operation.dy),
        request.operation.userAction !== false,
        options.preventCollision
      );
      return applyFinalCompaction(moved, options);
    }
    case "compact":
      return options.allowOverlap || options.compactType == null
        ? request.layout
        : compact(request.layout, options.compactType, options.cols, options.allowOverlap);
    case "dropFit": {
      const id = request.operation.item.i || DROP_ID;
      const baseLayout = request.layout.filter(item => item.i !== id);
      const fit = request.operation.strategy === "auto" || !request.operation.target
        ? findFirstFit(baseLayout, request.operation.item, options.cols, options.maxRows)
        : findNearestFit(
            baseLayout,
            request.operation.item,
            options.cols,
            request.operation.target.x,
            request.operation.target.y,
            options.maxRows
          );
      if (!fit) return request.layout;
      return applyFinalCompaction([
        ...baseLayout.map(cloneLayoutItem),
        {
          ...(request.operation.item as LayoutItem),
          i: id,
          x: fit.x,
          y: fit.y,
          w: request.operation.item.w,
          h: request.operation.item.h,
          static: false
        }
      ], options);
    }
    default:
      return request.layout;
  }
};

export function compareWithLegacyLayout(
  request: LayoutOperationRequest,
  result: LayoutOperationResult
): { matches: boolean; differences: string[] } {
  if (request.operation.type === "groupMove" && request.operation.ids.length > 1) {
    return { matches: true, differences: [] };
  }
  const legacyLayout = computeLegacyLayout(request);
  const differences: string[] = [];
  const resultById = new Map<string, LayoutItem>();
  result.layout.forEach(item => resultById.set(item.i, item));

  if (legacyLayout.length !== result.layout.length) {
    differences.push(`length:${legacyLayout.length}->${result.layout.length}`);
  }

  legacyLayout.forEach((legacyItem, index) => {
    const item = resultById.get(legacyItem.i);
    if (!item) {
      differences.push(`${legacyItem.i}:missing`);
      return;
    }
    if (
      legacyItem.x !== item.x ||
      legacyItem.y !== item.y ||
      legacyItem.w !== item.w ||
      legacyItem.h !== item.h
    ) {
      differences.push(
        `${legacyItem.i}@${index}:${legacyItem.x},${legacyItem.y},${legacyItem.w},${legacyItem.h}->${item.x},${item.y},${item.w},${item.h}`
      );
    }
  });

  return { matches: differences.length === 0, differences };
}

function executeLayoutOperationWithIndex(
  request: LayoutOperationRequest,
  existingIndex?: LayoutIndex
): LayoutOperationResult {
  const start = now();
  const options = normalizeOptions(request.options);
  const normalizedRequest = { ...request, options };

  try {
    const index = existingIndex || buildIndex(normalizedRequest.layout, options);
    switch (normalizedRequest.operation.type) {
      case "move":
        return executeMove(normalizedRequest, index, start);
      case "groupMove":
        return executeGroupMove(normalizedRequest, index, start);
      case "resize":
        return executeResize(normalizedRequest, index, start);
      case "dropFit":
        return executeDropFit(normalizedRequest, index, start);
      case "compact":
        return executeCompact(normalizedRequest, start);
      case "validate":
        return executeValidate(normalizedRequest, start);
      case "generateResponsiveLayout":
        return executeResponsiveLayout(normalizedRequest, start);
      default:
        return executeError(normalizedRequest, "unknown layout operation", start);
    }
  } catch (error) {
    return executeError(
      normalizedRequest,
      error instanceof Error ? error.message : String(error),
      start,
      error
    );
  }
}

export function executeLayoutOperation(request: LayoutOperationRequest): LayoutOperationResult {
  return executeLayoutOperationWithIndex(request);
}

export function createLayoutEngine(
  options: GridLayoutEngineOptions,
  initialLayout: Layout = []
): GridLayoutEngine {
  const engineOptions = normalizeOptions(options);
  let layout = cloneLayout(initialLayout);
  let index = buildIndex(layout, engineOptions);
  let revision = 0;

  const setLayout = (nextLayout: Layout): void => {
    layout = cloneLayout(nextLayout);
    index = buildIndex(layout, engineOptions);
    revision++;
  };

  const executeRequest = (request: LayoutOperationRequest): LayoutOperationResult => {
    const requestLayoutIsCurrent = request.layout === layout || shallowLayoutEqual(request.layout, layout);
    const activeIndex = requestLayoutIsCurrent ? index : buildIndex(request.layout, engineOptions);
    const result = executeLayoutOperationWithIndex(request, activeIndex);
    if (engineOptions.compareLegacy) {
      const comparison = compareWithLegacyLayout(request, result);
      if (!comparison.matches) {
        engineOptions.onEvent?.({
          type: "legacy-mismatch",
          id: request.id,
          message: "layout engine result differs from legacy path",
          diagnostics: result.diagnostics,
          details: comparison.differences
        });
      }
    }
    if (result.status === "changed" || result.status === "fallback") {
      const beforeLayout = layout;
      layout = cloneLayout(result.layout);
      if (
        requestLayoutIsCurrent &&
        result.patches.length > 0 &&
        applyIndexPatches(index, beforeLayout, layout, result.patches)
      ) {
        // The existing index now represents the new committed layout.
      } else {
        index = buildIndex(layout, engineOptions);
      }
      revision++;
    }
    return result;
  };

  return {
    getLayout: () => cloneLayout(layout),
    getRevision: () => makeRevision(revision),
    setLayout,
    execute: request =>
      executeRequest({
        ...request,
        layout,
        options: engineOptions
      }),
    executeRequest,
    compareLegacy: request => {
      const result = executeLayoutOperation(request);
      compareWithLegacyLayout(request, result);
      return result;
    }
  };
}
