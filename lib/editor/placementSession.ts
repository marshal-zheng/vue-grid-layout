import {
  cloneLayout,
  cloneLayoutItem,
  getLayoutItem,
  type CompactType,
  type Layout,
  type LayoutItem
} from "../utils";
import {
  placeGridEditorNewItems,
  type GridEditorPlacementCollisionPolicy,
  type GridEditorPlacementDiagnostic,
  type GridEditorPlacementSummary
} from "./placement";
import type {
  GridEditorBlockedReason,
  GridEditorClipboardOriginalGeometryById,
  GridEditorClipboardSourceContext,
  GridEditorCommand,
  GridEditorCommandResult,
  GridEditorCommandSource,
  GridEditorMetaById,
  GridEditorPasteStrategy
} from "./types";
import { sanitizeEditorMetaById } from "./metadata";

export type GridEditorPlacementSessionSource =
  | "paste"
  | "add"
  | "drop"
  | "palette"
  | "template"
  | "api";

export type GridEditorPlacementSessionPhase =
  | "starting"
  | "preview"
  | "blocked"
  | "committing";

export type GridEditorPlacementCursor = {
  x: number;
  y: number;
  source?: "pointer" | "menu" | "keyboard" | "api" | "strategy";
  clientX?: number;
  clientY?: number;
};

export type GridEditorPlacementGhost = {
  id: string;
  item: LayoutItem;
  state: "preview" | "blocked" | "committing";
  sourceId?: string;
};

export type GridEditorPlacementAffectedOutline = {
  id: string;
  before: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  after: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  kind: "shift" | "collision" | "predicted";
};

export type GridEditorPlacementBlocked = {
  reason: GridEditorBlockedReason;
  itemIds?: string[];
  message?: string;
  recoverable: boolean;
};

export type GridEditorResolvedPastePayload = {
  items: Layout;
  editorMetaById?: GridEditorMetaById;
  sourceId?: string;
  source?: GridEditorClipboardSourceContext;
  originalGeometryById?: GridEditorClipboardOriginalGeometryById;
  responsive?: {
    scaled: boolean;
    sourceCols?: number;
    targetCols?: number;
  };
  mapped?: true;
};

export type GridEditorPlacementSession = {
  id: string;
  phase: GridEditorPlacementSessionPhase;
  source: GridEditorPlacementSessionSource;
  commandType: "add" | "paste";
  baseRevision: number;
  baseLayout: Layout;
  items: Layout;
  editorMetaById: GridEditorMetaById;
  resolvedClipboardPayload?: GridEditorResolvedPastePayload;
  strategy: GridEditorPasteStrategy;
  collisionPolicy: GridEditorPlacementCollisionPolicy;
  placementIntent?: "auto" | "here" | "selection" | "viewport";
  placementAnchor?: "nearest" | "top-left";
  compactType?: CompactType;
  allowOverlap?: boolean;
  preventCollision?: boolean;
  cursor?: GridEditorPlacementCursor;
  size?: { w: number; h: number };
  origin?: string;
  cols: number;
  maxRows: number;
  candidateLayout?: Layout;
  ghostItems: GridEditorPlacementGhost[];
  affectedOutlines: GridEditorPlacementAffectedOutline[];
  diagnostics: GridEditorPlacementDiagnostic[];
  blocked?: GridEditorPlacementBlocked;
  createdAt: number;
  updatedAt: number;
  previewSeq: number;
};

export type GridEditorBeginPlacementInput = {
  source: GridEditorPlacementSessionSource;
  commandType?: "add" | "paste";
  item?: Partial<LayoutItem>;
  items?: Partial<LayoutItem>[];
  editorMetaById?: GridEditorMetaById;
  resolvedClipboardPayload?: GridEditorResolvedPastePayload;
  strategy?: GridEditorPasteStrategy;
  collisionPolicy?: GridEditorPlacementCollisionPolicy;
  placementIntent?: "auto" | "here" | "selection" | "viewport";
  placementAnchor?: "nearest" | "top-left";
  compactType?: CompactType;
  allowOverlap?: boolean;
  preventCollision?: boolean;
  cursor?: GridEditorPlacementCursor;
  cols?: number;
  maxRows?: number;
  origin?: string;
};

export type GridEditorUpdatePlacementInput = {
  cursor?: GridEditorPlacementCursor;
  strategy?: GridEditorPasteStrategy;
  collisionPolicy?: GridEditorPlacementCollisionPolicy;
  compactType?: CompactType;
  allowOverlap?: boolean;
  preventCollision?: boolean;
  cols?: number;
  maxRows?: number;
};

export type GridEditorCommitPlacementInput = {
  source?: GridEditorCommandSource;
  autoCancelOnBlocked?: boolean;
};

export type GridEditorPlacementSessionResult = {
  status: "started" | "updated" | "blocked" | "cancelled" | "noop";
  session?: GridEditorPlacementSession;
  blocked?: GridEditorCommandResult["blocked"];
  diagnostics?: GridEditorCommandResult["diagnostics"];
};

export type CreateGridEditorPlacementSessionContext = {
  baseLayout: Layout;
  baseRevision: number;
  defaultStrategy?: GridEditorPasteStrategy;
  cols?: number;
  maxRows?: number;
  id?: string;
  now?: () => number;
};

let placementSessionSeq = 0;

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const isFiniteGridNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeCols = (value: unknown): number =>
  isFiniteGridNumber(value) && value > 0 ? Math.floor(value) : 12;

const normalizeMaxRows = (value: unknown): number =>
  isFiniteGridNumber(value) && value > 0 ? Math.floor(value) : Infinity;

const normalizeStrategy = (
  strategy: unknown,
  fallback: GridEditorPasteStrategy = "first-fit"
): GridEditorPasteStrategy =>
  strategy === "offset" ||
  strategy === "cursor" ||
  strategy === "nearest-fit" ||
  strategy === "first-fit" ||
  strategy === "insert-top-shift"
    ? strategy
    : fallback;

const normalizeCollisionPolicy = (
  policy: unknown,
  fallback: GridEditorPlacementCollisionPolicy = "block"
): GridEditorPlacementCollisionPolicy =>
  policy === "layout" ? "layout" : fallback;

const normalizeCompactType = (
  compactType: unknown,
  fallback?: CompactType
): CompactType | undefined =>
  compactType === "vertical" || compactType === "horizontal" || compactType === null
    ? compactType
    : fallback;

const normalizeOptionalBoolean = (
  value: unknown,
  fallback?: boolean
): boolean | undefined =>
  typeof value === "boolean" ? value : fallback;

const normalizeCursor = (
  cursor: GridEditorPlacementCursor | undefined
): GridEditorPlacementCursor | undefined => {
  if (!cursor || !isFiniteGridNumber(cursor.x) || !isFiniteGridNumber(cursor.y)) return undefined;
  return {
    ...cursor,
    x: Math.max(0, Math.floor(cursor.x)),
    y: Math.max(0, Math.floor(cursor.y))
  };
};

const normalizeItem = (
  item: Partial<LayoutItem>,
  index: number
): LayoutItem => ({
  ...item,
  i: typeof item.i === "string" && item.i.length > 0 ? item.i : `placement-item-${index + 1}`,
  x: isFiniteGridNumber(item.x) ? Math.max(0, Math.floor(item.x)) : 0,
  y: isFiniteGridNumber(item.y) ? Math.max(0, Math.floor(item.y)) : 0,
  w: isFiniteGridNumber(item.w) ? Math.max(1, Math.floor(item.w)) : 1,
  h: isFiniteGridNumber(item.h) ? Math.max(1, Math.floor(item.h)) : 1
});

const normalizeItems = (
  input: GridEditorBeginPlacementInput
): Layout => {
  const rawItems = Array.isArray(input.items)
    ? input.items
    : input.item
      ? [input.item]
      : [];
  return rawItems
    .filter(item => item && typeof item === "object")
    .map((item, index) => normalizeItem(item, index));
};

const geometry = (
  item: Pick<LayoutItem, "x" | "y" | "w" | "h">
): Pick<LayoutItem, "x" | "y" | "w" | "h"> => ({
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h
});

const diagnostic = (
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

const outlineFromSummary = (
  baseLayout: Layout,
  candidateLayout: Layout | undefined,
  summary: GridEditorPlacementSummary,
  blocked?: GridEditorPlacementBlocked
): GridEditorPlacementAffectedOutline[] => {
  const candidate = candidateLayout || baseLayout;
  const beforeById = new Map(summary.before.map(item => [item.id, item]));
  const afterById = new Map(summary.after.map(item => [item.id, item]));
  const outlines: GridEditorPlacementAffectedOutline[] = [];
  const visited = new Set<string>();

  summary.shiftedIds.slice().sort().forEach(id => {
    const before = beforeById.get(id) || getLayoutItem(baseLayout, id);
    const after = afterById.get(id) || getLayoutItem(candidate, id);
    if (!before || !after) return;
    visited.add(id);
    outlines.push({
      id,
      before: geometry(before),
      after: geometry(after),
      kind: "shift"
    });
  });

  Array.from(afterById.keys()).sort().forEach(id => {
    if (visited.has(id) || summary.insertedIds.includes(id)) return;
    const before = beforeById.get(id) || getLayoutItem(baseLayout, id);
    const after = afterById.get(id) || getLayoutItem(candidate, id);
    if (!before || !after) return;
    if (before.x === after.x && before.y === after.y && before.w === after.w && before.h === after.h) return;
    visited.add(id);
    outlines.push({
      id,
      before: geometry(before),
      after: geometry(after),
      kind: "predicted"
    });
  });

  if (blocked?.reason === "collision" || blocked?.reason === "bounds" || blocked?.reason === "maxRows") {
    (blocked.itemIds || []).slice().sort().forEach(id => {
      if (visited.has(id) || summary.insertedIds.includes(id)) return;
      const item = getLayoutItem(baseLayout, id) || getLayoutItem(candidate, id);
      if (!item) return;
      visited.add(id);
      outlines.push({
        id,
        before: geometry(item),
        after: geometry(item),
        kind: "collision"
      });
    });
  }

  return outlines;
};

export const buildGridEditorPlacementAffectedOutlines = (
  baseLayout: Layout,
  candidateLayout: Layout | undefined,
  summary: GridEditorPlacementSummary,
  blocked?: GridEditorPlacementBlocked
): GridEditorPlacementAffectedOutline[] =>
  outlineFromSummary(baseLayout, candidateLayout, summary, blocked);

export const normalizeGridEditorPlacementDiagnostics = (
  diagnostics: GridEditorPlacementDiagnostic[] = [],
  blocked?: GridEditorPlacementBlocked
): GridEditorPlacementDiagnostic[] => {
  const normalized = diagnostics.slice();
  if (blocked && !normalized.some(item => item.reason === blocked.reason)) {
    normalized.push(diagnostic(
      `grid-editor.placement.blocked.${blocked.reason}`,
      "warning",
      blocked.message || `Placement blocked by ${blocked.reason}.`,
      { reason: blocked.reason, itemIds: blocked.itemIds }
    ));
  }
  return normalized;
};

export const createGridEditorPlacementRollbackSnapshot = (
  layout: Layout
): Layout => cloneLayout(layout);

const ghostItemsFromLayout = (
  session: Pick<GridEditorPlacementSession, "items">,
  candidateLayout: Layout | undefined,
  insertedIds: string[],
  state: GridEditorPlacementGhost["state"]
): GridEditorPlacementGhost[] => {
  const sourceIdByIndex = new Map(session.items.map((item, index) => [insertedIds[index], item.i]));
  return insertedIds.map(id => {
    const item = getLayoutItem(candidateLayout || session.items, id) ||
      getLayoutItem(session.items, sourceIdByIndex.get(id) || id);
    return item
      ? {
          id,
          item: cloneLayoutItem(item),
          state,
          sourceId: sourceIdByIndex.get(id)
        }
      : null;
  }).filter(Boolean) as GridEditorPlacementGhost[];
};

export const updateGridEditorPlacementSession = (
  session: GridEditorPlacementSession,
  input: GridEditorUpdatePlacementInput = {},
  context: { now?: () => number } = {}
): GridEditorPlacementSession => {
  const cursor = normalizeCursor(input.cursor) || session.cursor;
  const strategy = normalizeStrategy(input.strategy || session.strategy, session.strategy);
  const collisionPolicy = normalizeCollisionPolicy(input.collisionPolicy, session.collisionPolicy);
  const compactType = normalizeCompactType(input.compactType, session.compactType);
  const allowOverlap = normalizeOptionalBoolean(input.allowOverlap, session.allowOverlap);
  const preventCollision = normalizeOptionalBoolean(input.preventCollision, session.preventCollision);
  const cols = normalizeCols(input.cols ?? session.cols);
  const maxRows = normalizeMaxRows(input.maxRows ?? session.maxRows);
  const placementPayload = {
    strategy,
    collisionPolicy,
    cursor,
    cols,
    maxRows,
    compactType,
    allowOverlap,
    preventCollision,
    placementSessionId: session.id,
    placementSource: session.source,
    placementIntent: session.placementIntent,
    placementAnchor: session.placementAnchor
  };
  const placed = placeGridEditorNewItems(
    session.baseLayout,
    session.items,
    strategy,
    placementPayload
  );
  const candidateLayout = placed.failed && placed.summary.insertedIds.length === 0
    ? undefined
    : placed.layout;
  const blocked = placed.failed
    ? {
        reason: placed.blocked?.reason || "bounds" as GridEditorBlockedReason,
        itemIds: placed.blocked?.itemIds,
        message: placed.blocked?.message || "Placement could not produce a valid candidate.",
        recoverable: true
      }
    : undefined;
  const diagnostics = placed.summary.diagnostics.slice();
  if (blocked) {
    diagnostics.push(diagnostic(
      `grid-editor.placement.blocked.${blocked.reason}`,
      "warning",
      blocked.message || `Placement blocked by ${blocked.reason}.`,
      { reason: blocked.reason, itemIds: blocked.itemIds }
    ));
  }
  return {
    ...session,
    phase: blocked ? "blocked" : "preview",
    cursor,
    strategy,
    collisionPolicy,
    compactType,
    allowOverlap,
    preventCollision,
    cols,
    maxRows,
    candidateLayout,
    ghostItems: ghostItemsFromLayout(
      session,
      candidateLayout,
      placed.summary.insertedIds.length ? placed.summary.insertedIds : session.items.map(item => item.i),
      blocked ? "blocked" : "preview"
    ),
    affectedOutlines: outlineFromSummary(session.baseLayout, candidateLayout, placed.summary, blocked),
    diagnostics,
    blocked,
    updatedAt: (context.now || now)(),
    previewSeq: session.previewSeq + 1
  };
};

export const createGridEditorPlacementSession = (
  input: GridEditorBeginPlacementInput,
  context: CreateGridEditorPlacementSessionContext
): GridEditorPlacementSession => {
  const createdAt = (context.now || now)();
  const commandType = input.commandType || (input.source === "paste" ? "paste" : "add");
  const items = input.resolvedClipboardPayload
    ? cloneLayout(input.resolvedClipboardPayload.items)
    : normalizeItems(input);
  const session: GridEditorPlacementSession = {
    id: context.id || `grid-editor-placement:${++placementSessionSeq}`,
    phase: "starting",
    source: input.source,
    commandType,
    baseRevision: context.baseRevision,
    baseLayout: cloneLayout(context.baseLayout),
    items,
    editorMetaById: sanitizeEditorMetaById(
      input.resolvedClipboardPayload?.editorMetaById || input.editorMetaById,
      { layout: items }
    ),
    resolvedClipboardPayload: input.resolvedClipboardPayload
      ? {
          ...input.resolvedClipboardPayload,
          items: cloneLayout(input.resolvedClipboardPayload.items),
          editorMetaById: sanitizeEditorMetaById(input.resolvedClipboardPayload.editorMetaById, {
            layout: input.resolvedClipboardPayload.items
          })
        }
      : undefined,
    strategy: normalizeStrategy(input.strategy, context.defaultStrategy || "first-fit"),
    collisionPolicy: normalizeCollisionPolicy(input.collisionPolicy),
    placementIntent: input.placementIntent,
    placementAnchor: input.placementAnchor,
    compactType: normalizeCompactType(input.compactType),
    allowOverlap: normalizeOptionalBoolean(input.allowOverlap),
    preventCollision: normalizeOptionalBoolean(input.preventCollision),
    cursor: normalizeCursor(input.cursor),
    size: items[0] ? { w: items[0].w, h: items[0].h } : undefined,
    origin: input.origin,
    cols: normalizeCols(input.cols ?? context.cols),
    maxRows: normalizeMaxRows(input.maxRows ?? context.maxRows),
    ghostItems: [],
    affectedOutlines: [],
    diagnostics: [],
    createdAt,
    updatedAt: createdAt,
    previewSeq: 0
  };

  if (items.length === 0) {
    const blocked: GridEditorPlacementBlocked = {
      reason: "invalid-input",
      message: "No items were provided for placement.",
      recoverable: false
    };
    return {
      ...session,
      phase: "blocked",
      blocked,
      diagnostics: [diagnostic(
        "grid-editor.placement.invalid-item",
        "error",
        blocked.message || "No items were provided for placement.",
        { reason: blocked.reason }
      )],
      updatedAt: createdAt
    };
  }

  return updateGridEditorPlacementSession(session, {}, { now: () => createdAt });
};

export const buildGridEditorPlacementCommitCommand = (
  session: GridEditorPlacementSession,
  input: GridEditorCommitPlacementInput = {}
): GridEditorCommand => {
  const payload = {
    items: session.commandType === "add" ? cloneLayout(session.items) : undefined,
    item: session.commandType === "add" && session.items.length === 1
      ? cloneLayoutItem(session.items[0])
      : undefined,
    editorMetaById: session.commandType === "add" ? sanitizeEditorMetaById(session.editorMetaById) : undefined,
    resolvedClipboardPayload: session.commandType === "paste"
      ? {
          items: cloneLayout(session.items),
          editorMetaById: sanitizeEditorMetaById(session.editorMetaById, { layout: session.items }),
          sourceId: session.resolvedClipboardPayload?.sourceId,
          source: session.resolvedClipboardPayload?.source,
          originalGeometryById: session.resolvedClipboardPayload?.originalGeometryById,
          responsive: session.resolvedClipboardPayload?.responsive,
          mapped: true as const
        }
      : undefined,
    strategy: session.strategy,
    collisionPolicy: session.collisionPolicy,
    cursor: session.cursor,
    cols: session.cols,
    maxRows: session.maxRows,
    compactType: session.compactType,
    allowOverlap: session.allowOverlap,
    preventCollision: session.preventCollision,
    placementIntent: session.placementIntent,
    placementAnchor: session.placementAnchor,
    placementSessionId: session.id,
    placementSource: session.source,
    placementSummary: {
      ghostItemIds: session.ghostItems.map(item => item.id),
      affectedIds: session.affectedOutlines.map(item => item.id),
      diagnostics: session.diagnostics
    },
    placementCandidateLayout: session.candidateLayout ? cloneLayout(session.candidateLayout) : undefined
  };

  return {
    type: session.commandType,
    payload,
    source: input.source || "api",
    origin: session.origin
  };
};

export const cancelGridEditorPlacementSession = (
  session: GridEditorPlacementSession,
  reason = "cancelled",
  context: { now?: () => number } = {}
): GridEditorPlacementSessionResult => ({
  status: "cancelled",
  session: {
    ...session,
    phase: "blocked",
    candidateLayout: undefined,
    ghostItems: [],
    affectedOutlines: [],
    blocked: {
      reason: "invalid-input",
      message: reason,
      recoverable: false
    },
    updatedAt: (context.now || now)()
  }
});
