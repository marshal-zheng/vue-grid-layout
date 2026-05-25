import { cloneLayoutItem } from "../utils";
import type {
  Layout,
  LayoutItem
} from "../utils";
import type {
  LayoutOperation,
  LayoutOperationResult
} from "../layout-engine";
import type {
  GridDroppingItem,
  GridInteractionBlockedReason
} from "./gridInteractionTypes";

export type ExternalDropSessionStatus =
  | "entered"
  | "previewing"
  | "ready"
  | "blocked"
  | "committing";

export type ExternalDropBlockedReason =
  | GridInteractionBlockedReason
  | "no-fit"
  | "drop-drag-over-rejected"
  | "preview-stale"
  | "commit-rejected";

export type ExternalDropStrategy = "cursor" | "auto";

export type ExternalDropSession = {
  id: string;
  interactionId: string;
  requestId?: string;
  sourceItem: GridDroppingItem;
  resolvedItem: LayoutItem;
  ghostItem: LayoutItem | null;
  blocked?: {
    reason: ExternalDropBlockedReason;
    message?: string;
    itemIds?: string[];
  };
  baseLayout: Layout;
  previewLayout: Layout;
  target?: { x: number; y: number };
  strategy: ExternalDropStrategy;
  status: ExternalDropSessionStatus;
};

type ExternalDropResultBase = {
  id?: string;
  status: LayoutOperationResult["status"];
  layout: Layout;
  blocked?: LayoutOperationResult["blocked"];
  placeholder?: LayoutItem;
  drop?: LayoutOperationResult["drop"];
  error?: LayoutOperationResult["error"];
};

export type ExternalDropPreviewResult = ExternalDropResultBase;

export type ExternalDropCommitResult = ExternalDropResultBase;

export type CreateExternalDropSessionInput = {
  id?: string;
  interactionId: string;
  sourceItem: GridDroppingItem;
  baseLayout: Layout;
  strategy: ExternalDropStrategy;
  target?: { x: number; y: number };
};

export type ResolveExternalDropCandidateInput = {
  overrides?: Pick<Partial<LayoutItem>, "w" | "h"> | null;
  target?: { x: number; y: number };
  strategy?: ExternalDropStrategy;
  baseLayout?: Layout;
  snapCandidate?: (
    activeId: string,
    activeItem: LayoutItem,
    candidateItem: LayoutItem,
    validationLayout?: Layout
  ) => LayoutItem;
};

export type ExternalDropCommitResolution = {
  committedLayout: Layout;
  committedItem?: LayoutItem;
  eventLayout: Layout;
};

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const cloneTarget = (target?: { x: number; y: number }) =>
  target ? { x: target.x, y: target.y } : undefined;

export function createExternalDropSession({
  id,
  interactionId,
  sourceItem,
  baseLayout,
  strategy,
  target
}: CreateExternalDropSessionInput): ExternalDropSession {
  const dropId = id || String(sourceItem.i);
  const cleanBaseLayout = baseLayout.filter(item => item.i !== dropId);
  const resolvedItem: LayoutItem = {
    ...sourceItem,
    i: dropId,
    x: typeof sourceItem.x === "number" ? sourceItem.x : 0,
    y: typeof sourceItem.y === "number" ? sourceItem.y : 0,
    w: sourceItem.w,
    h: sourceItem.h,
    static: false
  };
  if (target) {
    resolvedItem.x = target.x;
    resolvedItem.y = target.y;
  }

  return {
    id: dropId,
    interactionId,
    sourceItem,
    resolvedItem,
    ghostItem: null,
    baseLayout: cleanBaseLayout,
    previewLayout: cleanBaseLayout,
    target: cloneTarget(target),
    strategy,
    status: "entered"
  };
}

export function resolveExternalDropCandidate(
  session: ExternalDropSession,
  {
    overrides,
    target,
    strategy,
    baseLayout,
    snapCandidate
  }: ResolveExternalDropCandidateInput
): ExternalDropSession {
  const nextItem: LayoutItem = {
    ...session.resolvedItem,
    i: session.id,
    static: false
  };

  if (isPositiveNumber(overrides?.w)) nextItem.w = overrides.w;
  if (isPositiveNumber(overrides?.h)) nextItem.h = overrides.h;
  if (target) {
    nextItem.x = target.x;
    nextItem.y = target.y;
  }

  const nextBaseLayout = baseLayout
    ? baseLayout.filter(item => item.i !== session.id)
    : session.baseLayout;
  const snappedItem = snapCandidate
    ? snapCandidate(session.id, nextItem, nextItem, nextBaseLayout)
    : nextItem;

  return {
    ...session,
    status: "previewing",
    blocked: undefined,
    resolvedItem: cloneLayoutItem(snappedItem),
    baseLayout: nextBaseLayout,
    previewLayout: nextBaseLayout,
    target: cloneTarget(target || { x: snappedItem.x, y: snappedItem.y }),
    strategy: strategy || session.strategy
  };
}

export function buildDropFitOperationFromSession(
  session: ExternalDropSession,
  phase: "preview" | "commit"
): Extract<LayoutOperation, { type: "dropFit" }> {
  const geometrySource = phase === "commit"
    ? session.ghostItem || session.resolvedItem
    : session.resolvedItem;
  const target = phase === "commit"
    ? cloneTarget(session.ghostItem || session.target)
    : cloneTarget(session.target);
  const operation: Extract<LayoutOperation, { type: "dropFit" }> = {
    type: "dropFit",
    item: {
      i: session.id,
      w: geometrySource.w,
      h: geometrySource.h
    },
    strategy: target ? "cursor" : session.strategy
  };
  if (target) operation.target = target;
  return operation;
}

export function applyExternalDropPreviewResult(
  session: ExternalDropSession,
  result: ExternalDropPreviewResult
): ExternalDropSession {
  if (result.status === "blocked" || result.status === "cancelled" || result.status === "error" || !result.placeholder) {
    return blockExternalDropSession(session, result.drop?.reason || result.blocked?.reason || "no-fit", {
      geometry: result.placeholder || session.ghostItem || session.resolvedItem,
      message: result.error?.message,
      itemIds: result.blocked?.itemIds
    });
  }

  const ghostItem = cloneLayoutItem(result.placeholder);
  const nextSession: ExternalDropSession = {
    ...session,
    status: "ready",
    blocked: undefined,
    ghostItem,
    previewLayout: result.layout || session.baseLayout,
    target: { x: ghostItem.x, y: ghostItem.y }
  };
  return nextSession;
}

export function blockExternalDropSession(
  session: ExternalDropSession,
  reason: ExternalDropBlockedReason,
  options: {
    geometry?: LayoutItem | null;
    message?: string;
    itemIds?: string[];
  } = {}
): ExternalDropSession {
  const ghostItem = options.geometry
    ? cloneLayoutItem({
        ...options.geometry,
        i: session.id
      })
    : session.ghostItem;

  return {
    ...session,
    status: "blocked",
    blocked: {
      reason,
      message: options.message,
      itemIds: options.itemIds
    },
    ghostItem,
    previewLayout: session.baseLayout,
    target: ghostItem ? { x: ghostItem.x, y: ghostItem.y } : session.target
  };
}

export function commitExternalDropSession(
  session: ExternalDropSession,
  result: ExternalDropCommitResult
): ExternalDropCommitResolution {
  const committedItem = result.placeholder || session.ghostItem || session.resolvedItem;
  const cleanItem = committedItem ? cloneLayoutItem(committedItem) : undefined;
  if (cleanItem) {
    delete cleanItem.isDraggable;
    delete cleanItem.isResizable;
  }
  const committedLayout = result.layout && result.layout.length > 0
    ? result.layout
    : [...session.baseLayout, cleanItem as LayoutItem];

  return {
    committedLayout,
    committedItem: cleanItem,
    eventLayout: committedLayout.filter(item => item.i !== session.id)
  };
}

export function clearExternalDropSession(): null {
  return null;
}

export function isExternalDropping(state: { externalDropSession?: ExternalDropSession | null }): boolean {
  return Boolean(state.externalDropSession);
}

export function getExternalDropGhost(
  state: { externalDropSession?: ExternalDropSession | null }
): LayoutItem | null {
  return state.externalDropSession?.ghostItem || null;
}

export function isExternalDropBlocked(
  state: { externalDropSession?: ExternalDropSession | null }
): boolean {
  return state.externalDropSession?.status === "blocked";
}

export function getExternalDropRenderLayout(
  state: { externalDropSession?: ExternalDropSession | null },
  committedRenderLayout: Layout
): Layout {
  const session = state.externalDropSession;
  if (!session || session.previewLayout.length === 0) return committedRenderLayout;

  return committedRenderLayout.map(item =>
    session.previewLayout.find(previewItem => previewItem.i === item.i) || item
  );
}
