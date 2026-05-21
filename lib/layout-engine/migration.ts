import {
  bottom,
  cloneLayout,
  cloneLayoutItem,
  collides
} from "../utils";
import { rowColumnOccupancyStrategy } from "./indexing";

import type {
  CompactType,
  Layout,
  LayoutItem
} from "../utils";
import type {
  GridLayoutEngineOptions,
  LayoutBlockedReason,
  LayoutDiagnostics,
  LayoutIndex,
  LayoutMigrationAxis,
  LayoutMigrationPolicy,
  LayoutMigrationRounding,
  LayoutMigrationSettings,
  LayoutMigrationSummary,
  LayoutOperation,
  LayoutOperationPhase,
  LayoutOperationRequest,
  LayoutOperationResult,
  LayoutOperationStatus,
  LayoutPatch,
  LayoutPlacementRequest,
  LayoutRepairDiagnostic,
  LayoutRepairObjective,
  LayoutRepairPolicy,
  LayoutRepairSolverInput,
  LayoutRepairStrategy,
  LayoutRepairSummary
} from "./types";

const DEFAULT_MAX_ROWS = Infinity;
const DEFAULT_OBJECTIVE: Required<LayoutRepairObjective> = {
  minimizeMovement: 1,
  minimizeResize: 1,
  preserveOrder: 1,
  preserveStatic: 1,
  preserveGroups: 0
};

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const normalizeOptions = (options: GridLayoutEngineOptions): GridLayoutEngineOptions => ({
  ...options,
  maxRows: typeof options.maxRows === "number" ? options.maxRows : DEFAULT_MAX_ROWS,
  allowOverlap: Boolean(options.allowOverlap),
  preventCollision: Boolean(options.preventCollision),
  indexStrategy: options.indexStrategy || rowColumnOccupancyStrategy()
});

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveFiniteNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const toPositiveInteger = (value: unknown): number | null => {
  if (!isPositiveFiniteNumber(value)) return null;
  const next = Math.floor(value);
  return next > 0 ? next : null;
};

const toFiniteInteger = (value: unknown): number | null => {
  if (!isFiniteNumber(value)) return null;
  return Math.round(value);
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

const rectOf = (item: LayoutItem): Pick<LayoutItem, "x" | "y" | "w" | "h"> => ({
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h
});

const sameRect = (left: LayoutItem, right: LayoutItem): boolean =>
  left.x === right.x && left.y === right.y && left.w === right.w && left.h === right.h;

const isStaticOrLockedItem = (item: Pick<LayoutItem, "static" | "isDraggable">): boolean =>
  item.static === true || item.isDraggable === false;

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
    if (!sameRect(previous, item)) {
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

const collectCollisions = (layout: Layout): LayoutItem[] => {
  const ids = new Set<string>();
  const out: LayoutItem[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      if (!collides(layout[i], layout[j])) continue;
      if (!ids.has(layout[i].i)) {
        ids.add(layout[i].i);
        out.push(layout[i]);
      }
      if (!ids.has(layout[j].i)) {
        ids.add(layout[j].i);
        out.push(layout[j]);
      }
    }
  }
  return out;
};

const buildIndex = (layout: Layout, options: GridLayoutEngineOptions): LayoutIndex =>
  (options.indexStrategy || rowColumnOccupancyStrategy()).build(layout, {
    cols: options.cols,
    maxRows: options.maxRows,
    compactType: options.compactType,
    allowOverlap: options.allowOverlap,
    preventCollision: options.preventCollision
  });

const shouldDebug = (request: LayoutOperationRequest): boolean => {
  if (request.debug) return true;
  const diagnostics = request.options.diagnostics;
  return typeof diagnostics === "object" && diagnostics.debug === true;
};

const createDiagnostics = (
  request: LayoutOperationRequest,
  status: LayoutOperationStatus,
  patches: LayoutPatch[],
  collisions: LayoutItem[],
  start: number,
  blockedReason: LayoutBlockedReason | undefined,
  details: LayoutRepairDiagnostic[],
  migration?: LayoutMigrationSummary,
  repair?: LayoutRepairSummary
): LayoutDiagnostics => {
  const durationMs = now() - start;
  const diagnostics: LayoutDiagnostics = {
    operationId: request.id,
    operationType: request.operation.type,
    phase: request.phase,
    layoutSize: request.layout.length,
    affectedCount: collectAffectedIds(patches, collisions).length,
    collisionCount: collisions.length,
    indexHit: true,
    schedulerMode: request.options.scheduler?.mode,
    executorKind: request.options.executor?.kind || "main-thread",
    durationMs,
    computeMs: durationMs,
    details: details.length > 0 ? details.slice() : undefined
  };

  if (shouldDebug(request)) {
    diagnostics.debug = {
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
        blockedReason,
        migration,
        repair,
        details: details.slice()
      }
    };
  }

  return diagnostics;
};

const makeResult = (
  request: LayoutOperationRequest,
  status: LayoutOperationStatus,
  layout: Layout,
  patches: LayoutPatch[],
  collisions: LayoutItem[],
  start: number,
  details: LayoutRepairDiagnostic[],
  extra: Partial<LayoutOperationResult> = {}
): LayoutOperationResult => ({
  id: request.id,
  status,
  layout,
  patches,
  affectedIds: collectAffectedIds(patches, collisions),
  collisions,
  diagnostics: createDiagnostics(
    request,
    status,
    patches,
    collisions,
    start,
    extra.blocked?.reason,
    details,
    extra.migration,
    extra.repair
  ),
  ...extra
});

const makeErrorResult = (
  request: LayoutOperationRequest,
  message: string,
  start: number,
  details: LayoutRepairDiagnostic[],
  cause?: unknown
): LayoutOperationResult =>
  makeResult(request, "error", request.layout, [], [], start, details, {
    blocked: { reason: "invalid-input", itemIds: [] },
    error: { message, cause }
  });

const makeBlockedResult = (
  request: LayoutOperationRequest,
  reason: LayoutBlockedReason,
  itemIds: string[],
  start: number,
  details: LayoutRepairDiagnostic[],
  collisions: LayoutItem[] = [],
  extra: Partial<LayoutOperationResult> = {}
): LayoutOperationResult =>
  makeResult(request, "blocked", request.layout, [], collisions, start, details, {
    ...extra,
    blocked: { reason, itemIds }
  });

type GeometrySettings = {
  cols: number;
  minColumns?: number;
  maxRows?: number;
};

const readCols = (
  settings: LayoutMigrationSettings,
  fallback?: number
): { ok: true; value: number; source: "input" | "fallback" } | { ok: false } => {
  const raw = settings.cols ?? settings.columns;
  const input = toPositiveInteger(raw);
  if (input) return { ok: true, value: input, source: "input" };
  const nextFallback = toPositiveInteger(fallback);
  if (nextFallback && raw == null) return { ok: true, value: nextFallback, source: "fallback" };
  return { ok: false };
};

const readOptionalPositiveInteger = (value: unknown): number | undefined => {
  const next = toPositiveInteger(value);
  return next == null ? undefined : next;
};

const readGeometrySettings = (
  settings: LayoutMigrationSettings,
  fallbackCols?: number
): { ok: true; value: GeometrySettings } | { ok: false } => {
  const cols = readCols(settings, fallbackCols);
  if (!cols.ok) return { ok: false };
  return {
    ok: true,
    value: {
      cols: cols.value,
      minColumns: readOptionalPositiveInteger(settings.minColumns),
      maxRows: readOptionalPositiveInteger(settings.maxRows)
    }
  };
};

const geometrySettingsEqual = (left: GeometrySettings, right: GeometrySettings): boolean =>
  left.cols === right.cols &&
  left.minColumns === right.minColumns &&
  left.maxRows === right.maxRows;

const geometrySettingKeys = new Set(["cols", "columns", "minColumns", "maxRows"]);

const stableStringify = (value: unknown): string => {
  if (value == null) return String(value);
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${key}:${stableStringify(record[key])}`).join(",")}}`;
};

const hasVisualOnlyChange = (
  previousSettings: LayoutMigrationSettings,
  nextSettings: LayoutMigrationSettings
): boolean => {
  const keys = new Set<string>();
  Object.keys(previousSettings).forEach(key => {
    if (!geometrySettingKeys.has(key)) keys.add(key);
  });
  Object.keys(nextSettings).forEach(key => {
    if (!geometrySettingKeys.has(key)) keys.add(key);
  });
  const keyList = Array.from(keys);
  for (let i = 0; i < keyList.length; i++) {
    const key = keyList[i];
    if (stableStringify(previousSettings[key]) !== stableStringify(nextSettings[key])) return true;
  }
  return false;
};

const defaultRepairPolicy = (policy?: LayoutRepairPolicy): LayoutRepairPolicy => ({
  strategy: "heuristic",
  fallback: "heuristic",
  ...policy,
  objective: {
    ...DEFAULT_OBJECTIVE,
    ...(policy?.objective || {})
  }
});

const supportedRepairStrategies: LayoutRepairStrategy[] = [
  "none",
  "first-fit",
  "nearest-fit",
  "nearest-then-first",
  "heuristic",
  "custom"
];

const isSupportedRepairStrategy = (strategy: unknown): strategy is LayoutRepairStrategy =>
  typeof strategy === "string" && supportedRepairStrategies.indexOf(strategy as LayoutRepairStrategy) !== -1;

const countDiagnosticItems = (
  details: LayoutRepairDiagnostic[],
  code: LayoutRepairDiagnostic["code"]
): number => {
  const ids = new Set<string>();
  details.forEach((detail, index) => {
    if (detail.code !== code) return;
    ids.add(detail.itemId || `${code}:${index}`);
  });
  return ids.size;
};

const reconcileRepairSummary = (
  summary: LayoutRepairSummary,
  details: LayoutRepairDiagnostic[]
): LayoutRepairSummary => ({
  ...summary,
  clampedCount: Math.max(summary.clampedCount, countDiagnosticItems(details, "item-clamped")),
  resizedCount: Math.max(
    summary.resizedCount,
    countDiagnosticItems(details, "item-shrunk") + countDiagnosticItems(details, "item-expanded")
  ),
  forcedStaticRepairCount: Math.max(
    summary.forcedStaticRepairCount,
    countDiagnosticItems(details, "forced-static-repair")
  )
});

const resolveStrategy = (
  policy?: LayoutRepairPolicy,
  details?: LayoutRepairDiagnostic[]
): LayoutRepairStrategy => {
  const strategy = policy?.strategy || "heuristic";
  if (isSupportedRepairStrategy(strategy)) return strategy;
  details?.push({
    code: "policy-unsupported",
    level: "warning",
    message: `Unsupported repair strategy "${String(strategy)}"; falling back to heuristic.`,
    reason: "unsupported-strategy"
  });
  return "heuristic";
};

type NormalizeItemResult =
  | { ok: true; item: LayoutItem }
  | { ok: false; itemId?: string; message: string };

const getWidthLimits = (item: LayoutItem, cols: number): { min: number; max: number } => {
  const minRaw = toPositiveInteger(item.minW) || 1;
  const min = Math.max(1, Math.min(minRaw, cols));
  const maxRaw = toPositiveInteger(item.maxW) || cols;
  const max = Math.max(min, Math.min(maxRaw, cols));
  return { min, max };
};

const getHeightLimits = (item: LayoutItem, maxRows?: number): { min: number; max: number } => {
  const minRaw = toPositiveInteger(item.minH) || 1;
  const rowLimit = Number.isFinite(maxRows) ? Math.floor(maxRows as number) : Infinity;
  const min = Number.isFinite(rowLimit) ? Math.max(1, Math.min(minRaw, rowLimit)) : minRaw;
  const maxRaw = toPositiveInteger(item.maxH) || rowLimit;
  const max = Number.isFinite(rowLimit)
    ? Math.max(min, Math.min(maxRaw, rowLimit))
    : Math.max(min, maxRaw);
  return { min, max };
};

const normalizeItemGeometry = (
  item: LayoutItem,
  options: GridLayoutEngineOptions,
  details: LayoutRepairDiagnostic[],
  optionsOverride: {
    sanitizeInvalidItems?: boolean;
    reason?: string;
  } = {}
): NormalizeItemResult => {
  const id = typeof item.i === "string" ? item.i.trim() : "";
  const invalid =
    !id ||
    !isFiniteNumber(item.x) ||
    !isFiniteNumber(item.y) ||
    !isFiniteNumber(item.w) ||
    !isFiniteNumber(item.h) ||
    item.w <= 0 ||
    item.h <= 0;

  if (invalid && !optionsOverride.sanitizeInvalidItems) {
    details.push({
      code: "item-invalid",
      level: "error",
      message: `Layout item "${id || "(missing)"}" has invalid geometry.`,
      itemId: id || undefined,
      reason: optionsOverride.reason || "strict-invalid-geometry"
    });
    return { ok: false, itemId: id || undefined, message: "invalid layout item geometry" };
  }

  if (!id) {
    details.push({
      code: "item-skipped",
      level: "warning",
      message: "Skipped layout item with missing id.",
      reason: "missing-id"
    });
    return { ok: false, message: "missing layout item id" };
  }

  const before = rectOf(item);
  const next = cloneLayoutItem({
    ...item,
    i: id,
    x: toFiniteInteger(item.x) ?? 0,
    y: toFiniteInteger(item.y) ?? 0,
    w: toFiniteInteger(item.w) ?? 1,
    h: toFiniteInteger(item.h) ?? 1
  });

  const cols = Math.max(1, Math.floor(options.cols));
  const maxRows = Number.isFinite(options.maxRows) ? Math.floor(options.maxRows as number) : Infinity;
  const widthLimits = getWidthLimits(next, cols);
  const heightLimits = getHeightLimits(next, maxRows);

  next.w = clamp(next.w, widthLimits.min, widthLimits.max);
  next.h = clamp(next.h, heightLimits.min, heightLimits.max);

  if (next.x < 0) next.x = 0;
  if (next.y < 0) next.y = 0;
  if (next.x + next.w > cols) next.x = Math.max(0, cols - next.w);
  if (Number.isFinite(maxRows) && next.y + next.h > maxRows) {
    next.y = Math.max(0, maxRows - next.h);
  }

  if (invalid) {
    details.push({
      code: "item-sanitized",
      level: "warning",
      message: `Sanitized invalid layout item "${id}".`,
      itemId: id,
      before,
      after: rectOf(next),
      reason: optionsOverride.reason || "sanitize-invalid-geometry"
    });
  }

  if (next.w < before.w || next.h < before.h) {
    details.push({
      code: "item-shrunk",
      level: "info",
      message: `Shrunk layout item "${id}" to fit constraints.`,
      itemId: id,
      before,
      after: rectOf(next),
      reason: optionsOverride.reason || "constraints"
    });
  } else if (next.w > before.w || next.h > before.h) {
    details.push({
      code: "item-expanded",
      level: "info",
      message: `Expanded layout item "${id}" to meet constraints.`,
      itemId: id,
      before,
      after: rectOf(next),
      reason: optionsOverride.reason || "constraints"
    });
  }

  if (next.x !== before.x || next.y !== before.y) {
    details.push({
      code: "item-clamped",
      level: "info",
      message: `Clamped layout item "${id}" into bounds.`,
      itemId: id,
      before,
      after: rectOf(next),
      reason: optionsOverride.reason || "bounds"
    });
  }

  if (isStaticOrLockedItem(item) && !sameRect(item, next)) {
    details.push({
      code: "forced-static-repair",
      level: "warning",
      message: `Repaired static/locked layout item "${id}" because it violated bounds or constraints.`,
      itemId: id,
      before,
      after: rectOf(next),
      reason: optionsOverride.reason || "static-bounds-or-constraints"
    });
  }

  next.moved = false;
  return { ok: true, item: next };
};

const normalizeLayoutGeometry = (
  layout: Layout,
  options: GridLayoutEngineOptions,
  details: LayoutRepairDiagnostic[],
  sanitizeInvalidItems?: boolean,
  reason?: string
): { ok: true; layout: Layout } | { ok: false; itemIds: string[]; message: string } => {
  const normalized: Layout = [];
  const invalidIds: string[] = [];
  for (const item of layout) {
    const result = normalizeItemGeometry(item, options, details, {
      sanitizeInvalidItems,
      reason
    });
    if (!result.ok) {
      if (result.itemId) invalidIds.push(result.itemId);
      if (!sanitizeInvalidItems) return { ok: false, itemIds: invalidIds, message: result.message };
      continue;
    }
    normalized.push(result.item);
  }
  return { ok: true, layout: normalized };
};

const scaleValue = (value: number, ratio: number, rounding: LayoutMigrationRounding): number => {
  if (rounding === "round") return Math.round(value * ratio);
  return Math.round(value * ratio);
};

const migrateGeometryByRatio = (
  layout: Layout,
  ratio: number,
  axis: LayoutMigrationAxis,
  rounding: LayoutMigrationRounding
): Layout =>
  layout.map(item => {
    const next = cloneLayoutItem(item);
    next.x = scaleValue(item.x, ratio, rounding);
    next.w = scaleValue(item.w, ratio, rounding);
    if (axis === "xy") {
      next.y = scaleValue(item.y, ratio, rounding);
      next.h = scaleValue(item.h, ratio, rounding);
    }
    return next;
  });

const orderByOriginal = (layout: Layout, originalLayout: Layout): Layout => {
  const order = new Map<string, number>();
  originalLayout.forEach((item, index) => order.set(item.i, index));
  return layout.slice().sort((a, b) => {
    const aOrder = order.get(a.i) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(b.i) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.i < b.i ? -1 : a.i > b.i ? 1 : 0;
  });
};

const isLockedItem = (item: LayoutItem): boolean =>
  isStaticOrLockedItem(item);

const getStableRepairOrder = (layout: Layout, originalLayout: Layout): Layout => {
  const original = new Map<string, { index: number; x: number; y: number }>();
  originalLayout.forEach((item, index) => original.set(item.i, { index, x: item.x, y: item.y }));
  return layout.slice().sort((a, b) => {
    const aLocked = isLockedItem(a) ? 0 : 1;
    const bLocked = isLockedItem(b) ? 0 : 1;
    if (aLocked !== bLocked) return aLocked - bLocked;
    const aOriginal = original.get(a.i);
    const bOriginal = original.get(b.i);
    const ay = aOriginal?.y ?? a.y;
    const by = bOriginal?.y ?? b.y;
    if (ay !== by) return ay - by;
    const ax = aOriginal?.x ?? a.x;
    const bx = bOriginal?.x ?? b.x;
    if (ax !== bx) return ax - bx;
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    const aIndex = aOriginal?.index ?? Number.MAX_SAFE_INTEGER;
    const bIndex = bOriginal?.index ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.i < b.i ? -1 : a.i > b.i ? 1 : 0;
  });
};

type PlacementAttempt = {
  item: LayoutItem;
  position: { x: number; y: number } | null;
  fallback?: string;
  candidateCount: number;
};

const targetCenter = (item: LayoutItem): { x: number; y: number } => ({
  x: item.x + item.w / 2,
  y: item.y + item.h / 2
});

const findRepairPosition = (
  item: LayoutItem,
  placed: Layout,
  options: GridLayoutEngineOptions,
  policy: LayoutRepairPolicy,
  details: LayoutRepairDiagnostic[]
): PlacementAttempt => {
  const index = buildIndex(placed, options);
  const strategy = resolveStrategy(policy, details);
  let candidateCount = 0;

  if (index.canPlace(item)) {
    return { item, position: { x: item.x, y: item.y }, candidateCount: 1 };
  }

  const collisions = index.queryAllCollisions(item);
  if (collisions.length > 0) {
    details.push({
      code: "collision-detected",
      level: "warning",
      message: `Layout item "${item.i}" collides with placed items.`,
      itemId: item.i,
      before: rectOf(item),
      reason: "repair"
    });
  }

  const allowNearest = strategy === "nearest-fit" || strategy === "nearest-then-first" || strategy === "heuristic" || strategy === "custom";
  const allowFirst = strategy === "first-fit" || strategy === "nearest-then-first" || strategy === "heuristic" || strategy === "custom";

  if (allowNearest) {
    candidateCount++;
    const nearest = index.findNearestFit({ w: item.w, h: item.h }, targetCenter(item));
    if (nearest) return { item, position: nearest, fallback: "nearest-fit", candidateCount };
  }

  if (allowFirst) {
    candidateCount++;
    const first = index.findFirstFit({ w: item.w, h: item.h });
    if (first) {
      if (allowNearest) {
        details.push({
          code: "repair-fallback",
          level: "info",
          message: `Fell back to first-fit for layout item "${item.i}".`,
          itemId: item.i,
          before: rectOf(item),
          reason: "nearest-fit-empty"
        });
      }
      return { item, position: first, fallback: allowNearest ? "first-fit" : undefined, candidateCount };
    }
  }

  return { item, position: null, candidateCount };
};

const shrinkToMinimum = (
  item: LayoutItem,
  options: GridLayoutEngineOptions
): LayoutItem => {
  const next = cloneLayoutItem(item);
  const widthLimits = getWidthLimits(next, Math.max(1, Math.floor(options.cols)));
  const heightLimits = getHeightLimits(next, options.maxRows);
  next.w = widthLimits.min;
  next.h = heightLimits.min;
  if (next.x + next.w > options.cols) next.x = Math.max(0, options.cols - next.w);
  const maxRows = Number.isFinite(options.maxRows) ? Math.floor(options.maxRows as number) : Infinity;
  if (Number.isFinite(maxRows) && next.y + next.h > maxRows) next.y = Math.max(0, maxRows - next.h);
  return next;
};

const validateRepairedLayout = (
  layout: Layout,
  originalLayout: Layout,
  options: GridLayoutEngineOptions,
  requireNoCollisions: boolean
): { ok: true } | { ok: false; reason: string; itemIds: string[]; collisions: LayoutItem[] } => {
  const originalIds = originalLayout.map(item => item.i).sort();
  const nextIds = layout.map(item => item.i).sort();
  if (originalIds.length !== nextIds.length || originalIds.some((id, index) => id !== nextIds[index])) {
    return { ok: false, reason: "id-set", itemIds: [], collisions: [] };
  }

  const seen = new Set<string>();
  const invalidIds: string[] = [];
  const cols = Math.floor(options.cols);
  const maxRows = Number.isFinite(options.maxRows) ? Math.floor(options.maxRows as number) : Infinity;
  for (const item of layout) {
    if (seen.has(item.i)) invalidIds.push(item.i);
    seen.add(item.i);
    if (
      !Number.isInteger(item.x) ||
      !Number.isInteger(item.y) ||
      !Number.isInteger(item.w) ||
      !Number.isInteger(item.h) ||
      item.x < 0 ||
      item.y < 0 ||
      item.w <= 0 ||
      item.h <= 0 ||
      item.x + item.w > cols ||
      (Number.isFinite(maxRows) && item.y + item.h > maxRows)
    ) {
      invalidIds.push(item.i);
      continue;
    }
    const widthLimits = getWidthLimits(item, cols);
    const heightLimits = getHeightLimits(item, maxRows);
    if (item.w < widthLimits.min || item.w > widthLimits.max) invalidIds.push(item.i);
    if (item.h < heightLimits.min || item.h > heightLimits.max) invalidIds.push(item.i);
  }
  const collisions = collectCollisions(layout);
  if (invalidIds.length > 0) {
    return { ok: false, reason: "geometry", itemIds: Array.from(new Set(invalidIds)), collisions };
  }
  if (requireNoCollisions && collisions.length > 0) {
    return { ok: false, reason: "collision", itemIds: collisions.map(item => item.i), collisions };
  }
  return { ok: true };
};

type RepairRunResult = {
  status: "ok" | "blocked";
  layout: Layout;
  collisions: LayoutItem[];
  details: LayoutRepairDiagnostic[];
  summary: LayoutRepairSummary;
  usedFallback: boolean;
};

const runHeuristicRepair = (
  layout: Layout,
  originalLayout: Layout,
  options: GridLayoutEngineOptions,
  policyInput: LayoutRepairPolicy = {},
  forceRepair: boolean,
  details: LayoutRepairDiagnostic[]
): RepairRunResult => {
  const start = now();
  const policy = defaultRepairPolicy(policyInput);
  const strategy = resolveStrategy(policy, details);
  const objective = {
    ...DEFAULT_OBJECTIVE,
    ...(policy.objective || {})
  };
  const initialCollisions = collectCollisions(layout);
  const requireNoCollisions = !options.allowOverlap || options.preventCollision || forceRepair;

  if (options.allowOverlap && !forceRepair && !options.preventCollision && strategy !== "custom") {
    if (initialCollisions.length > 0) {
      details.push({
        code: "collision-detected",
        level: "info",
        message: "allowOverlap is enabled; collisions were preserved.",
        reason: "allow-overlap"
      });
    }
    return {
      status: "ok",
      layout,
      collisions: initialCollisions,
      details,
      usedFallback: false,
      summary: {
        strategy,
        objective,
        candidateCount: 0,
        movedCount: 0,
        resizedCount: 0,
        clampedCount: 0,
        forcedStaticRepairCount: 0,
        unresolvedIds: [],
        durationMs: now() - start
      }
    };
  }

  if (strategy === "none") {
    return {
      status: requireNoCollisions && initialCollisions.length > 0 ? "blocked" : "ok",
      layout,
      collisions: initialCollisions,
      details,
      usedFallback: false,
      summary: {
        strategy,
        objective,
        candidateCount: 0,
        movedCount: 0,
        resizedCount: 0,
        clampedCount: 0,
        forcedStaticRepairCount: 0,
        unresolvedIds: initialCollisions.map(item => item.i),
        durationMs: now() - start
      }
    };
  }

  const ordered = getStableRepairOrder(layout, originalLayout);
  const placed: Layout = [];
  const unresolvedIds: string[] = [];
  let candidateCount = 0;
  let movedCount = 0;
  let resizedCount = 0;
  let clampedCount = 0;
  let forcedStaticRepairCount = 0;
  let fallback: string | undefined;

  for (const item of ordered) {
    const before = rectOf(item);
    const locked = isLockedItem(item);
    let working = cloneLayoutItem(item);
    let attempt = findRepairPosition(working, placed, options, policy, details);
    candidateCount += attempt.candidateCount;

    if (!attempt.position) {
      const shrunk = shrinkToMinimum(working, options);
      if (!sameRect(working, shrunk)) {
        details.push({
          code: "item-shrunk",
          level: locked ? "warning" : "info",
          message: `Shrunk layout item "${item.i}" while searching for a repair position.`,
          itemId: item.i,
          before: rectOf(working),
          after: rectOf(shrunk),
          reason: "repair-fit"
        });
        working = shrunk;
        attempt = findRepairPosition(working, placed, options, policy, details);
        candidateCount += attempt.candidateCount;
      }
    }

    if (!attempt.position) {
      unresolvedIds.push(item.i);
      details.push({
        code: "unresolved-item",
        level: "error",
        message: `Could not repair layout item "${item.i}" within current constraints.`,
        itemId: item.i,
        before,
        reason: "no-fit"
      });
      continue;
    }

    const repaired = cloneLayoutItem(working);
    repaired.x = attempt.position.x;
    repaired.y = attempt.position.y;
    repaired.moved = false;
    if (attempt.fallback) fallback = attempt.fallback;

    if (locked && sameRect(item, repaired)) {
      details.push({
        code: "static-preserved",
        level: "info",
        message: `Preserved static/locked layout item "${item.i}".`,
        itemId: item.i,
        before,
        after: rectOf(repaired),
        reason: "repair-anchor"
      });
    }

    if (!sameRect(item, repaired)) {
      if (item.x !== repaired.x || item.y !== repaired.y) movedCount++;
      if (item.w !== repaired.w || item.h !== repaired.h) resizedCount++;
      if (locked) {
        forcedStaticRepairCount++;
        details.push({
          code: "forced-static-repair",
          level: "warning",
          message: `Repaired static/locked layout item "${item.i}" because it could not stay in place.`,
          itemId: item.i,
          before,
          after: rectOf(repaired),
          reason: "static-invalid-or-colliding"
        });
      } else {
        details.push({
          code: "item-moved",
          level: "info",
          message: `Moved layout item "${item.i}" during collision repair.`,
          itemId: item.i,
          before,
          after: rectOf(repaired),
          reason: attempt.fallback || "repair"
        });
      }
    }

    if (item.x !== repaired.x || item.y !== repaired.y) clampedCount++;
    placed.push(repaired);
  }

  const repairedLayout = orderByOriginal(placed.concat(
    ordered
      .filter(item => unresolvedIds.includes(item.i))
      .map(cloneLayoutItem)
  ), originalLayout);
  const collisions = collectCollisions(repairedLayout);
  const blocked = unresolvedIds.length > 0 || (requireNoCollisions && collisions.length > 0);

  const summary: LayoutRepairSummary = {
    strategy: strategy === "custom" ? "heuristic" : strategy,
    fallback,
    objective,
    candidateCount,
    movedCount,
    resizedCount,
    clampedCount,
    forcedStaticRepairCount,
    unresolvedIds,
    durationMs: now() - start
  };

  return {
    status: blocked ? "blocked" : "ok",
    layout: repairedLayout,
    collisions,
    details,
    summary,
    usedFallback: false
  };
};

const runCustomSolver = (
  layout: Layout,
  originalLayout: Layout,
  options: GridLayoutEngineOptions,
  policyInput: LayoutRepairPolicy,
  forceRepair: boolean,
  details: LayoutRepairDiagnostic[]
): RepairRunResult | null => {
  const solver = policyInput.customRepairSolver;
  if (!solver) return null;

  const policy = defaultRepairPolicy(policyInput);
  const objective = {
    ...DEFAULT_OBJECTIVE,
    ...(policy.objective || {})
  };
  const input: LayoutRepairSolverInput = {
    layout: cloneLayout(layout),
    originalLayout: cloneLayout(originalLayout),
    cols: options.cols,
    maxRows: options.maxRows,
    allowOverlap: Boolean(options.allowOverlap),
    preventCollision: Boolean(options.preventCollision),
    policy: {
      ...policy,
      customRepairSolver: undefined
    },
    objective
  };

  const start = now();
  try {
    const result = solver(input);
    const durationMs = now() - start;
    if (typeof policyInput.customSolverBudgetMs === "number" && durationMs > policyInput.customSolverBudgetMs) {
      details.push({
        code: "custom-solver-fallback",
        level: "warning",
        message: "Custom repair solver exceeded its budget; falling back.",
        reason: "over-budget",
        details: { durationMs, budgetMs: policyInput.customSolverBudgetMs }
      });
      return null;
    }

    const nextLayout = cloneLayout(result.layout);
    const validation = validateRepairedLayout(
      nextLayout,
      originalLayout,
      options,
      !options.allowOverlap || options.preventCollision || forceRepair
    );
    if (!validation.ok) {
      details.push({
        code: "custom-solver-fallback",
        level: "warning",
        message: "Custom repair solver returned an invalid layout; falling back.",
        reason: validation.reason,
        details: { itemIds: validation.itemIds }
      });
      return null;
    }

    const collisions = collectCollisions(nextLayout);
    const summary: LayoutRepairSummary = {
      strategy: "custom",
      objective,
      candidateCount: result.summary?.candidateCount ?? 0,
      movedCount: result.summary?.movedCount ?? collectPatches(originalLayout, nextLayout, null).filter(patch => patch.type === "move").length,
      resizedCount: result.summary?.resizedCount ?? collectPatches(originalLayout, nextLayout, null).filter(patch => patch.type === "resize").length,
      clampedCount: result.summary?.clampedCount ?? 0,
      forcedStaticRepairCount: result.summary?.forcedStaticRepairCount ?? 0,
      unresolvedIds: result.summary?.unresolvedIds ?? [],
      score: result.summary?.score,
      fallback: result.summary?.fallback,
      durationMs
    };
    if (result.diagnostics) details.push(...result.diagnostics);

    return {
      status: "ok",
      layout: nextLayout,
      collisions,
      details,
      summary,
      usedFallback: false
    };
  } catch (cause) {
    details.push({
      code: "custom-solver-fallback",
      level: "warning",
      message: "Custom repair solver failed; falling back.",
      reason: "throw",
      details: cause instanceof Error ? cause.message : String(cause)
    });
    return null;
  }
};

const repairLayout = (
  layout: Layout,
  originalLayout: Layout,
  options: GridLayoutEngineOptions,
  policyInput: LayoutRepairPolicy = {},
  forceRepair: boolean,
  details: LayoutRepairDiagnostic[]
): RepairRunResult => {
  const withReconciledSummary = (result: RepairRunResult): RepairRunResult => ({
    ...result,
    details,
    summary: reconcileRepairSummary(result.summary, details)
  });

  const policy = defaultRepairPolicy(policyInput);
  const wantsCustom = policy.strategy === "custom" || typeof policy.customRepairSolver === "function";
  if (wantsCustom) {
    const custom = runCustomSolver(layout, originalLayout, options, policy, forceRepair, details);
    if (custom) return withReconciledSummary(custom);
    if (policy.fallback === "none") {
      const collisions = collectCollisions(layout);
      return withReconciledSummary({
        status: "blocked",
        layout,
        collisions,
        details,
        usedFallback: false,
        summary: {
          strategy: "custom",
          fallback: "none",
          objective: {
            ...DEFAULT_OBJECTIVE,
            ...(policy.objective || {})
          },
          candidateCount: 0,
          movedCount: 0,
          resizedCount: 0,
          clampedCount: 0,
          forcedStaticRepairCount: 0,
          unresolvedIds: collisions.map(item => item.i)
        }
      });
    }
    const heuristic = runHeuristicRepair(layout, originalLayout, options, {
      ...policy,
      strategy: policy.fallback === "first-fit" || policy.fallback === "nearest-fit" || policy.fallback === "nearest-then-first"
        ? policy.fallback
        : "heuristic"
    }, forceRepair, details);
    heuristic.usedFallback = true;
    heuristic.summary.fallback = heuristic.summary.fallback || "heuristic";
    return withReconciledSummary(heuristic);
  }
  return withReconciledSummary(runHeuristicRepair(layout, originalLayout, options, policy, forceRepair, details));
};

const statusFromPatches = (
  before: Layout,
  after: Layout,
  patches: LayoutPatch[],
  fallback: boolean
): LayoutOperationStatus => {
  if (fallback) return "fallback";
  return patches.length === 0 || shallowLayoutEqual(before, after) ? "noop" : "changed";
};

export function executeMigrateSettings(
  request: LayoutOperationRequest,
  start: number = now()
): LayoutOperationResult {
  const operation = request.operation;
  if (operation.type !== "migrateSettings") {
    return makeErrorResult(request, "invalid migrateSettings operation", start, []);
  }

  const options = normalizeOptions(request.options);
  const normalizedRequest = { ...request, options };
  const details: LayoutRepairDiagnostic[] = [];
  const previous = readGeometrySettings(operation.previousSettings, options.cols);
  const next = readGeometrySettings(operation.nextSettings);
  if (!previous.ok || !next.ok) {
    details.push({
      code: "settings-invalid",
      level: "error",
      message: "Layout migration settings must include valid positive columns.",
      reason: !previous.ok ? "previous-cols" : "next-cols"
    });
    return makeErrorResult(normalizedRequest, "invalid layout migration settings", start, details);
  }

  const policy = operation.policy || {};
  const axis = policy.axis || "horizontal";
  const rounding = policy.rounding || "round";
  const geometryChanged = !geometrySettingsEqual(previous.value, next.value);
  const visualOnlyChange = !geometryChanged && hasVisualOnlyChange(operation.previousSettings, operation.nextSettings);
  const ratio = next.value.cols / previous.value.cols;
  const migration: LayoutMigrationSummary = {
    previousCols: previous.value.cols,
    nextCols: next.value.cols,
    ratio,
    axis,
    rounding,
    geometryChanged,
    visualOnlyChange
  };

  if (!geometryChanged) {
    if (visualOnlyChange) {
      details.push({
        code: "settings-visual-only",
        level: "info",
        message: "Settings change is visual-only; committed item geometry is unchanged.",
        reason: "visual-only"
      });
    }
    const collisions = collectCollisions(request.layout);
    if (collisions.length === 0 || !policy.forceRepair) {
      return makeResult(normalizedRequest, "noop", request.layout, [], collisions, start, details, {
        migration
      });
    }
  }

  details.push({
    code: "settings-ratio",
    level: "info",
    message: `Migrating layout columns from ${previous.value.cols} to ${next.value.cols}.`,
    reason: axis === "xy" ? "xy-ratio" : "horizontal-ratio",
    details: { ratio, rounding }
  });

  const migrationOptions = {
    ...options,
    cols: next.value.cols,
    maxRows: typeof next.value.maxRows === "number" ? next.value.maxRows : options.maxRows
  };
  const migrated = geometryChanged
    ? migrateGeometryByRatio(request.layout, ratio, axis, rounding)
    : cloneLayout(request.layout);
  const normalized = normalizeLayoutGeometry(
    migrated,
    migrationOptions,
    details,
    policy.sanitizeInvalidItems,
    "settings-migration"
  );
  if (!normalized.ok) {
    return makeErrorResult(normalizedRequest, normalized.message, start, details);
  }

  const initialCollisions = collectCollisions(normalized.layout);
  let finalLayout = normalized.layout;
  let collisions = initialCollisions;
  let repair = undefined as LayoutOperationResult["repair"];
  let usedFallback = false;

  if (initialCollisions.length > 0 || policy.forceRepair || geometryChanged) {
    const repaired = repairLayout(
      normalized.layout,
      request.layout,
      migrationOptions,
      policy.repair,
      policy.forceRepair === true || geometryChanged,
      details
    );
    repair = repaired.summary;
    usedFallback = repaired.usedFallback;
    if (repaired.status === "blocked") {
      return makeBlockedResult(
        normalizedRequest,
        repaired.collisions.length > 0 ? "collision" : "bounds",
        repaired.summary.unresolvedIds.length > 0 ? repaired.summary.unresolvedIds : repaired.collisions.map(item => item.i),
        start,
        details,
        repaired.collisions,
        { migration, repair }
      );
    }
    finalLayout = repaired.layout;
    collisions = repaired.collisions;
  }

  const patches = collectPatches(request.layout, finalLayout, options.compactType);
  const status = statusFromPatches(request.layout, finalLayout, patches, usedFallback);
  return makeResult(normalizedRequest, status, status === "noop" ? request.layout : finalLayout, patches, collisions, start, details, {
    migration,
    repair
  });
}

export function executeRepairCollisions(
  request: LayoutOperationRequest,
  start: number = now()
): LayoutOperationResult {
  const operation = request.operation;
  if (operation.type !== "repairCollisions") {
    return makeErrorResult(request, "invalid repairCollisions operation", start, []);
  }

  const options = normalizeOptions(request.options);
  const normalizedRequest = { ...request, options };
  const details: LayoutRepairDiagnostic[] = [];
  const normalized = normalizeLayoutGeometry(
    request.layout,
    options,
    details,
    operation.policy?.strategy === "custom" ? false : true,
    "repair"
  );
  if (!normalized.ok) {
    return makeErrorResult(normalizedRequest, normalized.message, start, details);
  }

  const normalizedChanged = !shallowLayoutEqual(request.layout, normalized.layout);
  const collisionsBefore = collectCollisions(normalized.layout);
  if (
    collisionsBefore.length === 0 &&
    !normalizedChanged &&
    operation.policy?.strategy !== "custom" &&
    !operation.policy?.customRepairSolver
  ) {
    return makeResult(normalizedRequest, "noop", request.layout, [], [], start, details);
  }

  const repaired = repairLayout(normalized.layout, request.layout, options, operation.policy, true, details);
  if (repaired.status === "blocked") {
    return makeBlockedResult(
      normalizedRequest,
      repaired.collisions.length > 0 ? "collision" : "bounds",
      repaired.summary.unresolvedIds.length > 0 ? repaired.summary.unresolvedIds : repaired.collisions.map(item => item.i),
      start,
      details,
      repaired.collisions,
      { repair: repaired.summary }
    );
  }

  const patches = collectPatches(request.layout, repaired.layout, options.compactType);
  const status = statusFromPatches(request.layout, repaired.layout, patches, repaired.usedFallback);
  return makeResult(normalizedRequest, status, status === "noop" ? request.layout : repaired.layout, patches, repaired.collisions, start, details, {
    repair: repaired.summary
  });
}

export function executeTranslateLayout(
  request: LayoutOperationRequest,
  start: number = now()
): LayoutOperationResult {
  const operation = request.operation;
  if (operation.type !== "translateLayout") {
    return makeErrorResult(request, "invalid translateLayout operation", start, []);
  }

  const options = normalizeOptions(request.options);
  const normalizedRequest = { ...request, options };
  const details: LayoutRepairDiagnostic[] = [];
  if (!isFiniteNumber(operation.dx) || !isFiniteNumber(operation.dy)) {
    details.push({
      code: "item-invalid",
      level: "error",
      message: "translateLayout dx/dy must be finite numbers.",
      reason: "invalid-delta"
    });
    return makeBlockedResult(normalizedRequest, "invalid-input", [], start, details);
  }

  let dx = Math.round(operation.dx);
  let dy = Math.round(operation.dy);
  if (operation.clampNegative !== false && request.layout.length > 0) {
    const minX = Math.min(...request.layout.map(item => item.x));
    const minY = Math.min(...request.layout.map(item => item.y));
    if (dx + minX < 0) dx = -minX;
    if (dy + minY < 0) dy = -minY;
  }

  if (dx === 0 && dy === 0) {
    return makeResult(normalizedRequest, "noop", request.layout, [], [], start, details);
  }

  const translated = request.layout.map(item => ({
    ...cloneLayoutItem(item),
    x: item.x + dx,
    y: item.y + dy
  }));
  const normalized = normalizeLayoutGeometry(translated, options, details, true, "translate");
  if (!normalized.ok) {
    return makeBlockedResult(normalizedRequest, "invalid-input", normalized.itemIds, start, details);
  }

  const repaired = repairLayout(normalized.layout, request.layout, options, operation.policy, true, details);
  if (repaired.status === "blocked") {
    return makeBlockedResult(
      normalizedRequest,
      repaired.collisions.length > 0 ? "collision" : "bounds",
      repaired.summary.unresolvedIds.length > 0 ? repaired.summary.unresolvedIds : repaired.collisions.map(item => item.i),
      start,
      details,
      repaired.collisions,
      { repair: repaired.summary }
    );
  }

  const patches = collectPatches(request.layout, repaired.layout, options.compactType);
  const status = statusFromPatches(request.layout, repaired.layout, patches, repaired.usedFallback);
  return makeResult(normalizedRequest, status, status === "noop" ? request.layout : repaired.layout, patches, repaired.collisions, start, details, {
    repair: repaired.summary
  });
}

const normalizePlacementItem = (
  request: LayoutPlacementRequest,
  options: GridLayoutEngineOptions,
  details: LayoutRepairDiagnostic[]
): NormalizeItemResult => {
  const target = request.target || { x: request.item.x ?? 0, y: request.item.y ?? 0 };
  const item: LayoutItem = {
    ...(request.item as LayoutItem),
    i: request.item.i,
    x: target.x,
    y: target.y,
    w: request.item.w,
    h: request.item.h
  };
  return normalizeItemGeometry(item, options, details, {
    sanitizeInvalidItems: true,
    reason: "placement"
  });
};

const findPlacement = (
  item: LayoutItem,
  baseLayout: Layout,
  options: GridLayoutEngineOptions,
  request: LayoutPlacementRequest,
  details: LayoutRepairDiagnostic[]
): { position: { x: number; y: number } | null; source: string } => {
  const index = buildIndex(baseLayout, options);
  const strategy = request.strategy || (request.target ? "target-first" : "first-fit");
  if (strategy === "append-after-bottom") {
    const append = { ...item, x: Math.max(0, Math.min(item.x, options.cols - item.w)), y: Math.ceil(bottom(baseLayout)) };
    if (index.canPlace(append)) return { position: { x: append.x, y: append.y }, source: "append-after-bottom" };
  }
  if (strategy === "target-first" && request.target) {
    const target = {
      ...item,
      x: Math.max(0, Math.round(request.target.x)),
      y: Math.max(0, Math.round(request.target.y))
    };
    if (index.canPlace(target)) return { position: { x: target.x, y: target.y }, source: "target" };
    const nearest = index.findNearestFit({ w: item.w, h: item.h }, targetCenter(target));
    if (nearest) {
      details.push({
        code: "repair-fallback",
        level: "info",
        message: `Used nearest-fit placement fallback for item "${item.i}".`,
        itemId: item.i,
        reason: "target-blocked"
      });
      return { position: nearest, source: "nearest-fit" };
    }
  }
  const first = index.findFirstFit({ w: item.w, h: item.h });
  if (first) return { position: first, source: "first-fit" };
  return { position: null, source: "none" };
};

export function executePlaceItems(
  request: LayoutOperationRequest,
  start: number = now()
): LayoutOperationResult {
  const operation = request.operation;
  if (operation.type !== "placeItems") {
    return makeErrorResult(request, "invalid placeItems operation", start, []);
  }

  const options = normalizeOptions(request.options);
  const normalizedRequest = { ...request, options };
  const details: LayoutRepairDiagnostic[] = [];
  let working = cloneLayout(request.layout);
  const addedIds: string[] = [];

  for (const placement of operation.items) {
    const normalized = normalizePlacementItem(placement, options, details);
    if (!normalized.ok) {
      return makeBlockedResult(normalizedRequest, "invalid-input", normalized.itemId ? [normalized.itemId] : [], start, details);
    }
    const baseLayout = working.filter(item => item.i !== normalized.item.i);
    const fit = findPlacement(normalized.item, baseLayout, options, placement, details);
    if (!fit.position) {
      details.push({
        code: "unresolved-item",
        level: "error",
        message: `Could not place item "${normalized.item.i}" within current constraints.`,
        itemId: normalized.item.i,
        before: rectOf(normalized.item),
        reason: "no-fit"
      });
      return makeBlockedResult(normalizedRequest, "collision", [normalized.item.i], start, details);
    }
    const nextItem = {
      ...normalized.item,
      x: fit.position.x,
      y: fit.position.y,
      static: normalized.item.static === true
    };
    details.push({
      code: "placement-source",
      level: "info",
      message: `Placed item "${nextItem.i}" using ${fit.source}.`,
      itemId: nextItem.i,
      after: rectOf(nextItem),
      reason: fit.source
    });
    working = baseLayout.concat(nextItem);
    addedIds.push(nextItem.i);
  }

  if (operation.policy?.strategy || operation.policy?.customRepairSolver) {
    const repaired = repairLayout(working, request.layout, options, operation.policy, true, details);
    if (repaired.status === "blocked") {
      return makeBlockedResult(
        normalizedRequest,
        "collision",
        repaired.summary.unresolvedIds.length > 0 ? repaired.summary.unresolvedIds : addedIds,
        start,
        details,
        repaired.collisions,
        { repair: repaired.summary }
      );
    }
    working = repaired.layout;
  }

  const collisions = collectCollisions(working);
  const patches = collectPatches(request.layout, working, options.compactType);
  return makeResult(normalizedRequest, patches.length === 0 ? "noop" : "changed", working, patches, collisions, start, details);
}

export type LayoutSettingsMigrationOptions = {
  previousSettings: LayoutMigrationSettings;
  nextSettings: LayoutMigrationSettings;
  policy?: LayoutMigrationPolicy;
  engineOptions: GridLayoutEngineOptions;
  id?: string;
  phase?: LayoutOperationPhase;
  debug?: boolean;
};

export type LayoutRepairCollisionsOptions = {
  policy?: LayoutRepairPolicy;
  engineOptions: GridLayoutEngineOptions;
  id?: string;
  phase?: LayoutOperationPhase;
  debug?: boolean;
};

export type LayoutTranslateOptions = {
  dx: number;
  dy: number;
  clampNegative?: boolean;
  policy?: LayoutRepairPolicy;
  engineOptions: GridLayoutEngineOptions;
  id?: string;
  phase?: LayoutOperationPhase;
  debug?: boolean;
};

export type LayoutPlaceItemsOptions = {
  items: LayoutPlacementRequest[];
  policy?: LayoutRepairPolicy;
  engineOptions: GridLayoutEngineOptions;
  id?: string;
  phase?: LayoutOperationPhase;
  debug?: boolean;
};

const makeRequest = (
  layout: Layout,
  operation: LayoutOperation,
  options: GridLayoutEngineOptions,
  meta: { id?: string; phase?: LayoutOperationPhase; debug?: boolean }
): LayoutOperationRequest => ({
  id: meta.id || `${operation.type}-${Date.now().toString(36)}`,
  phase: meta.phase || "commit",
  layout,
  operation,
  options,
  debug: meta.debug
});

export function migrateLayoutSettings(
  layout: Layout,
  options: LayoutSettingsMigrationOptions
): LayoutOperationResult {
  return executeMigrateSettings(makeRequest(layout, {
    type: "migrateSettings",
    previousSettings: options.previousSettings,
    nextSettings: options.nextSettings,
    policy: options.policy
  }, options.engineOptions, options));
}

export function repairLayoutCollisions(
  layout: Layout,
  options: LayoutRepairCollisionsOptions
): LayoutOperationResult {
  return executeRepairCollisions(makeRequest(layout, {
    type: "repairCollisions",
    policy: options.policy
  }, options.engineOptions, options));
}

export function translateLayout(
  layout: Layout,
  options: LayoutTranslateOptions
): LayoutOperationResult {
  return executeTranslateLayout(makeRequest(layout, {
    type: "translateLayout",
    dx: options.dx,
    dy: options.dy,
    clampNegative: options.clampNegative,
    policy: options.policy
  }, options.engineOptions, options));
}

export function placeLayoutItems(
  layout: Layout,
  options: LayoutPlaceItemsOptions
): LayoutOperationResult {
  return executePlaceItems(makeRequest(layout, {
    type: "placeItems",
    items: options.items,
    policy: options.policy
  }, options.engineOptions, options));
}
