import type { Layout, LayoutItem } from "../utils";
import type { ResolvedGridItemCapability } from "../item-capabilities";
import type { LayoutPatch, LayoutDiagnostics } from "../layout-engine";
import type {
  GridEditorBeforeCommand,
  GridEditorBlockedReason,
  GridEditorCommand,
  GridEditorCommandPolicy,
  GridEditorCommandResult,
  GridEditorCommandSource,
  GridEditorCommandStatus,
  GridEditorCommandType,
  GridEditorHistoryMode,
  GridEditorHistoryPolicy,
  GridEditorMetaById,
  GridEditorMetadataPatch,
  GridEditorMode,
  GridEditorSelectionState
} from "./types";
import { resolveEditorItemCapability } from "./metadata";

export type NormalizedGridEditorCommand = GridEditorCommand & {
  id: string;
  source?: GridEditorCommandSource;
  history?: GridEditorCommand["history"];
};

export type GridEditorCommandCheckContext = {
  mode: GridEditorMode;
  modeMissing?: boolean;
  layout: Layout;
  editorMetaById: GridEditorMetaById;
  selection: GridEditorSelectionState;
  commandPolicy?: GridEditorCommandPolicy;
  isDraggable?: boolean;
  isResizable?: boolean;
  isBounded?: boolean;
  itemCapabilities?: Record<string, ResolvedGridItemCapability>;
};

export type GridEditorCommandCheck = {
  ok: boolean;
  targetIds: string[];
  allowedIds: string[];
  blockedIds: string[];
  result?: GridEditorCommandResult;
};

let commandSeq = 0;

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

export const normalizeGridEditorCommand = (
  command: GridEditorCommand
): NormalizedGridEditorCommand => ({
  ...command,
  id: command.id || `editor-command:${command.type}:${++commandSeq}`
});

export const normalizeGridEditorHistoryPolicy = (
  history: GridEditorCommand["history"] | undefined,
  fallbackMode: GridEditorHistoryMode
): GridEditorHistoryPolicy => {
  if (typeof history === "string") return { mode: history };
  if (history?.skip) {
    return {
      ...history,
      mode: "ignore",
      preserveRedoStack: history.preserveRedoStack ?? true
    };
  }
  const mode = history?.mode || fallbackMode;
  return {
    ...history,
    mode,
    preserveRedoStack:
      history?.preserveRedoStack ??
      (mode === "ignore" || mode === "record-preserveRedoStack")
  };
};

export const isSelectionOnlyCommand = (type: GridEditorCommandType): boolean =>
  type === "select" || type === "clearSelection";

export const isMetadataCommand = (type: GridEditorCommandType): boolean =>
  type === "lock" ||
  type === "unlock" ||
  type === "show" ||
  type === "hide";

export const isSectionRowCommand = (type: GridEditorCommandType): boolean =>
  type === "section-row-collapse" ||
  type === "section-row-expand" ||
  type === "section-row-move" ||
  type === "section-row-delete" ||
  type === "section-row-reorder";

export const isLayoutCommand = (type: GridEditorCommandType): boolean =>
  type === "move" ||
  type === "resize" ||
  type === "add" ||
  type === "delete" ||
  type === "duplicate" ||
  type === "paste" ||
  type === "align" ||
  type === "distribute" ||
  type === "tidy";

export const isPersistenceCommand = (type: GridEditorCommandType): boolean =>
  type === "save" || type === "discard" || type === "reset";

export const isHistoryCommand = (type: GridEditorCommandType): boolean =>
  type === "undo" || type === "redo";

export const shouldRecordGridEditorHistory = (type: GridEditorCommandType): boolean =>
  isLayoutCommand(type) || isMetadataCommand(type) || isSectionRowCommand(type);

export const defaultGridEditorHistoryMode = (
  type: GridEditorCommandType
): GridEditorHistoryMode => {
  if (isSelectionOnlyCommand(type) || isHistoryCommand(type)) return "ignore";
  if (isLayoutCommand(type) || isMetadataCommand(type) || isSectionRowCommand(type)) return "record";
  return "ignore";
};

export const createGridEditorCommandResult = (
  command: Pick<NormalizedGridEditorCommand, "id" | "type">,
  status: GridEditorCommandStatus,
  input: Partial<GridEditorCommandResult> = {}
): GridEditorCommandResult => ({
  id: command.id,
  type: command.type,
  status,
  targetIds: input.targetIds || [],
  layoutPatches: input.layoutPatches || [],
  metadataPatches: input.metadataPatches || [],
  affectedIds: input.affectedIds || input.targetIds || [],
  selection: input.selection,
  blocked: input.blocked,
  diagnostics: {
    durationMs: input.diagnostics?.durationMs || 0,
    guardMs: input.diagnostics?.guardMs,
    guideCount: input.diagnostics?.guideCount,
    layoutDiagnostics: input.diagnostics?.layoutDiagnostics,
    operationResult: input.diagnostics?.operationResult,
    intelligence: input.diagnostics?.intelligence,
    computed: input.diagnostics?.computed,
    messages: input.diagnostics?.messages,
    pendingScope: input.diagnostics?.pendingScope,
    stateRevision: input.diagnostics?.stateRevision,
    stale: input.diagnostics?.stale,
    historyMode: input.diagnostics?.historyMode,
    source: input.diagnostics?.source,
    origin: input.diagnostics?.origin
  },
  undo: input.undo,
  error: input.error
});

export const blockedGridEditorCommandResult = (
  command: Pick<NormalizedGridEditorCommand, "id" | "type">,
  reason: GridEditorBlockedReason,
  input: Partial<GridEditorCommandResult> = {}
): GridEditorCommandResult =>
  createGridEditorCommandResult(command, "blocked", {
    ...input,
    blocked: {
      reason,
      itemIds: input.blocked?.itemIds || input.targetIds,
      message: input.blocked?.message,
      skippedIds: input.blocked?.skippedIds
    }
  });

export const errorGridEditorCommandResult = (
  command: Pick<NormalizedGridEditorCommand, "id" | "type">,
  message: string,
  cause?: unknown
): GridEditorCommandResult =>
  createGridEditorCommandResult(command, "error", {
    error: { message, cause }
  });

export const resolveGridEditorCommandTargets = (
  command: GridEditorCommand,
  selection: GridEditorSelectionState,
  layout: Layout
): string[] => {
  if (command.targetIds) return Array.from(new Set(command.targetIds.filter(Boolean)));
  if (command.type === "select") {
    const payload = command.payload as { id?: string; ids?: string[] } | undefined;
    if (payload?.ids) return Array.from(new Set(payload.ids.filter(Boolean)));
    if (payload?.id) return [payload.id];
  }
  if (command.type === "add" || command.type === "paste") return [];
  if (isSectionRowCommand(command.type)) {
    const payload = command.payload as { id?: string; ids?: string[] } | undefined;
    if (Array.isArray(payload?.ids)) return Array.from(new Set(payload.ids.filter(Boolean)));
    return payload?.id ? [payload.id] : [];
  }
  const selectedIds = selection.selectedIds.filter(Boolean);
  if (selectedIds.length > 0) return selectedIds;
  return layout.length > 0 && selection.activeId ? [selection.activeId] : [];
};

const getMissingIds = (layout: Layout, targetIds: string[]): string[] => {
  const ids = new Set(layout.map(item => item.i));
  return targetIds.filter(id => !ids.has(id));
};

const commandCapabilityKey = (
  type: GridEditorCommandType
): keyof ReturnType<typeof resolveEditorItemCapability> | null => {
  if (type === "move" || type === "align" || type === "distribute" || type === "tidy") return "draggable";
  if (type === "resize") return "resizable";
  if (type === "delete") return "deletable";
  if (type === "duplicate") return "duplicatable";
  if (type === "copy") return "copyable";
  if (type === "hide" || type === "lock") return "editable";
  return null;
};

const requiredSelectionCount = (type: GridEditorCommandType): number => {
  if (type === "align") return 2;
  if (type === "distribute" || type === "tidy") return 3;
  return 0;
};

const hasOwn = (value: unknown, key: string): boolean =>
  Boolean(value) && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, key);

const isValidCommandPayload = (command: GridEditorCommand): boolean => {
  const payload = command.payload as Record<string, unknown> | undefined;
  if (command.type === "align") {
    const mode = payload?.mode;
    return mode === "left" ||
      mode === "center-x" ||
      mode === "right" ||
      mode === "top" ||
      mode === "center-y" ||
      mode === "bottom";
  }
  if (command.type === "distribute") {
    const mode = payload?.mode;
    const strategy = payload?.strategy;
    return (
      mode === "horizontal" ||
      mode === "vertical" ||
      mode === "spacing-x" ||
      mode === "spacing-y"
    ) && (
      !hasOwn(payload, "strategy") ||
      strategy === "edge-to-edge" ||
      strategy === "center-to-center"
    );
  }
  if (command.type === "tidy") {
    const axis = payload?.axis;
    return !hasOwn(payload, "axis") || axis === "x" || axis === "y" || axis === "both";
  }
  if (isSectionRowCommand(command.type)) {
    return typeof payload?.id === "string" && payload.id.length > 0;
  }
  return true;
};

const blockedReasonForItem = (
  item: LayoutItem,
  metaById: GridEditorMetaById,
  fallback: GridEditorBlockedReason
): GridEditorBlockedReason => {
  const meta = metaById[item.i];
  if (meta?.locked) return "locked";
  if (meta?.visible === false) return "hidden";
  if (item.static) return "static-item";
  return fallback;
};

export const checkGridEditorCommand = (
  command: NormalizedGridEditorCommand,
  context: GridEditorCommandCheckContext
): GridEditorCommandCheck => {
  const targetIds = resolveGridEditorCommandTargets(
    command,
    context.selection,
    context.layout
  );

  if (context.modeMissing) {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: targetIds,
      result: blockedGridEditorCommandResult(command, "editor-mode-missing", {
        targetIds,
        blocked: { reason: "editor-mode-missing", itemIds: targetIds }
      })
    };
  }

  if (context.mode === "view") {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: targetIds,
      result: blockedGridEditorCommandResult(command, "mode-readonly", {
        targetIds,
        blocked: { reason: "mode-readonly", itemIds: targetIds }
      })
    };
  }

  if (command.type === "resize" && targetIds.length > 1) {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: targetIds,
      result: blockedGridEditorCommandResult(command, "multi-resize-unsupported", {
        targetIds
      })
    };
  }

  const minSelection = requiredSelectionCount(command.type);
  if (minSelection > 0 && targetIds.length < minSelection) {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: targetIds,
      result: blockedGridEditorCommandResult(command, "selection-count", {
        targetIds,
        blocked: {
          reason: "selection-count",
          itemIds: targetIds,
          message: `${command.type} requires at least ${minSelection} selected items.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: "grid-editor.command.selection-count",
            level: "warning",
            message: `${command.type} requires at least ${minSelection} selected items.`,
            itemIds: targetIds,
            recoverable: true
          }]
        }
      })
    };
  }

  if (!isValidCommandPayload(command)) {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: targetIds,
      result: blockedGridEditorCommandResult(command, "invalid-input", {
        targetIds,
        blocked: {
          reason: "invalid-input",
          itemIds: targetIds,
          message: `Invalid ${command.type} command payload.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: "grid-editor.command.invalid-input",
            level: "error",
            message: `Invalid ${command.type} command payload.`,
            itemIds: targetIds,
            recoverable: true
          }]
        }
      })
    };
  }

  if (
    targetIds.length === 0 &&
    ![
      "add",
      "paste",
      "clearSelection",
      "save",
      "discard",
      "reset",
      "undo",
      "redo",
      "section-row-collapse",
      "section-row-expand",
      "section-row-move",
      "section-row-delete",
      "section-row-reorder"
    ].includes(command.type)
  ) {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: [],
      result: blockedGridEditorCommandResult(command, "missing-item", {
        targetIds
      })
    };
  }

  const missingIds = getMissingIds(context.layout, targetIds);
  const targetIdsMayBeInserted = command.type === "add" || command.type === "paste";
  if (
    missingIds.length > 0 &&
    !targetIdsMayBeInserted &&
    command.type !== "select" &&
    !isSectionRowCommand(command.type)
  ) {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds: missingIds,
      result: blockedGridEditorCommandResult(command, "missing-item", {
        targetIds,
        blocked: { reason: "missing-item", itemIds: missingIds }
      })
    };
  }

  const capabilityKey = commandCapabilityKey(command.type);
  if (!capabilityKey) {
    return {
      ok: true,
      targetIds,
      allowedIds: targetIds,
      blockedIds: []
    };
  }

  const allowedIds: string[] = [];
  const blockedIds: string[] = [];
  let reason: GridEditorBlockedReason = "capability";

  targetIds.forEach(id => {
    const item = context.layout.find(candidate => candidate.i === id);
    if (!item) {
      blockedIds.push(id);
      reason = "missing-item";
      return;
    }
    const capability = context.itemCapabilities?.[id] || resolveEditorItemCapability(
      item,
      context.editorMetaById[id],
      {
        isDraggable: context.isDraggable,
        isResizable: context.isResizable,
        isBounded: context.isBounded
      }
    );
    if (capability[capabilityKey]) {
      allowedIds.push(id);
    } else {
      blockedIds.push(id);
      reason = blockedReasonForItem(item, context.editorMetaById, "capability");
    }
  });

  if (blockedIds.length > 0 && context.commandPolicy !== "skip-blocked") {
    return {
      ok: false,
      targetIds,
      allowedIds: [],
      blockedIds,
      result: blockedGridEditorCommandResult(command, reason, {
        targetIds,
        blocked: { reason, itemIds: blockedIds }
      })
    };
  }

  if (allowedIds.length === 0 && targetIds.length > 0) {
    return {
      ok: false,
      targetIds,
      allowedIds,
      blockedIds,
      result: blockedGridEditorCommandResult(command, reason, {
        targetIds,
        blocked: { reason, itemIds: blockedIds }
      })
    };
  }

  return {
    ok: true,
    targetIds,
    allowedIds,
    blockedIds
  };
};

export const runGridEditorBeforeCommand = async (
  beforeCommand: GridEditorBeforeCommand | undefined,
  command: NormalizedGridEditorCommand,
  context: Omit<Parameters<GridEditorBeforeCommand>[0], "command">,
  timeoutMs = 5000
): Promise<{
  result?: GridEditorCommandResult;
  guardMs: number;
}> => {
  if (!beforeCommand) return { guardMs: 0 };
  const start = now();
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let abortListener: (() => void) | null = null;

  try {
    if (context.signal?.aborted) {
      return {
        guardMs: 0,
        result: createGridEditorCommandResult(command, "cancelled", {
          targetIds: context.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: context.targetIds,
            message: "beforeCommand guard was aborted."
          },
          diagnostics: { durationMs: 0, guardMs: 0 }
        })
      };
    }

    const pending = Promise.resolve(beforeCommand({ ...context, command }));
    const abortPromise = context.signal
      ? new Promise<"__aborted__">(resolve => {
          abortListener = () => resolve("__aborted__");
          context.signal?.addEventListener("abort", abortListener, { once: true });
        })
      : null;
    const guardResult = await Promise.race([
      pending,
      ...(abortPromise ? [abortPromise] : []),
      new Promise<"__timeout__">(resolve => {
        timeout = setTimeout(() => resolve("__timeout__"), timeoutMs);
      })
    ]);
    const guardMs = now() - start;

    if (guardResult === "__aborted__") {
      return {
        guardMs,
        result: createGridEditorCommandResult(command, "cancelled", {
          targetIds: context.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: context.targetIds,
            message: "beforeCommand guard was aborted."
          },
          diagnostics: { durationMs: 0, guardMs }
        })
      };
    }

    if (guardResult === "__timeout__") {
      return {
        guardMs,
        result: createGridEditorCommandResult(command, "timeout", {
          targetIds: context.targetIds,
          blocked: {
            reason: "before-command-timeout",
            itemIds: context.targetIds,
            message: "beforeCommand guard timed out."
          },
          diagnostics: { durationMs: 0, guardMs }
        })
      };
    }

    if (guardResult === false) {
      return {
        guardMs,
        result: blockedGridEditorCommandResult(command, "before-command-blocked", {
          targetIds: context.targetIds,
          diagnostics: { durationMs: 0, guardMs }
        })
      };
    }

    if (!guardResult || guardResult === true || guardResult.status === "allow") {
      return { guardMs };
    }

    if (guardResult.status === "cancel") {
      return {
        guardMs,
        result: createGridEditorCommandResult(command, "cancelled", {
          targetIds: context.targetIds,
          diagnostics: { durationMs: 0, guardMs },
          blocked: {
            reason: "before-command-cancelled",
            itemIds: context.targetIds,
            message: guardResult.message
          }
        })
      };
    }

    if (guardResult.status === "timeout") {
      return {
        guardMs,
        result: createGridEditorCommandResult(command, "timeout", {
          targetIds: context.targetIds,
          diagnostics: { durationMs: 0, guardMs },
          blocked: {
            reason: "before-command-timeout",
            itemIds: context.targetIds,
            message: guardResult.message
          }
        })
      };
    }

    if (guardResult.status === "error") {
      return {
        guardMs,
        result: errorGridEditorCommandResult(
          command,
          guardResult.message || "beforeCommand guard failed.",
          guardResult.error
        )
      };
    }

    return {
      guardMs,
      result: blockedGridEditorCommandResult(
        command,
        guardResult.reason || "before-command-blocked",
        {
          targetIds: context.targetIds,
          blocked: {
            reason: guardResult.reason || "before-command-blocked",
            itemIds: context.targetIds,
            message: guardResult.message
          },
          diagnostics: { durationMs: 0, guardMs }
        }
      )
    };
  } catch (error) {
    return {
      guardMs: now() - start,
      result: errorGridEditorCommandResult(
        command,
        "beforeCommand guard failed.",
        error
      )
    };
  } finally {
    if (timeout) clearTimeout(timeout);
    if (abortListener) context.signal?.removeEventListener("abort", abortListener);
  }
};

export const collectEditorLayoutPatches = (
  before: Layout,
  after: Layout
): LayoutPatch[] => {
  const patches: LayoutPatch[] = [];
  const beforeById = new Map(before.map(item => [item.i, item]));
  const afterById = new Map(after.map(item => [item.i, item]));

  after.forEach(item => {
    const previous = beforeById.get(item.i);
    if (!previous) {
      patches.push({ type: "add", item });
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
          from: {
            x: previous.x,
            y: previous.y,
            w: previous.w,
            h: previous.h
          },
          to: { x: item.x, y: item.y, w: item.w, h: item.h }
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

  return patches;
};

export const mergeGridEditorDiagnostics = (
  durationMs: number,
  guardMs: number,
  layoutDiagnostics?: LayoutDiagnostics
) => ({
  durationMs,
  guardMs,
  layoutDiagnostics
});

export const collectAffectedIds = (
  layoutPatches: LayoutPatch[],
  metadataPatches: GridEditorMetadataPatch[]
): string[] => {
  const ids = new Set<string>();
  layoutPatches.forEach(patch => {
    if (patch.type === "add") ids.add(patch.item.i);
    else if (patch.type === "compact") patch.affectedIds.forEach(id => ids.add(id));
    else ids.add(patch.id);
  });
  metadataPatches.forEach(patch => ids.add(patch.id));
  return Array.from(ids);
};
