import {
  blockedGridEditorCommandResult,
  createGridEditorCommandResult,
  defaultGridEditorHistoryMode,
  normalizeGridEditorCommand,
  normalizeGridEditorHistoryPolicy,
  runGridEditorBeforeCommand,
  type GridEditorCommandCheck,
  type NormalizedGridEditorCommand
} from "./commands";
import { requireGridEditorCommandDescriptor } from "./commandRegistry";
import type {
  GridEditorBeforeCommand,
  GridEditorBeforeCommandContext,
  GridEditorCommand,
  GridEditorCommandResult,
  GridEditorHistorySnapshot,
  GridEditorTransactionPreview
} from "./types";

export type GridEditorCommandKernelCommitInput = {
  command: NormalizedGridEditorCommand;
  check: GridEditorCommandCheck;
  before: GridEditorHistorySnapshot;
  preview?: GridEditorTransactionPreview;
  startedAt: number;
  guardMs: number;
};

export type GridEditorCommandKernelPorts = {
  beforeCommand?: GridEditorBeforeCommand;
  guardTimeoutMs?: number;
  getSnapshot: () => GridEditorHistorySnapshot;
  getStateRevision: () => number;
  check: (command: NormalizedGridEditorCommand) => GridEditorCommandCheck;
  getGuardContext: (
    command: NormalizedGridEditorCommand,
    check: GridEditorCommandCheck,
    preview: GridEditorTransactionPreview,
    signal: AbortSignal
  ) => Omit<GridEditorBeforeCommandContext, "command">;
  buildPreview?: (
    command: NormalizedGridEditorCommand,
    check: GridEditorCommandCheck,
    before: GridEditorHistorySnapshot
  ) => GridEditorTransactionPreview;
  commit: (input: GridEditorCommandKernelCommitInput) => Promise<GridEditorCommandResult>;
  finalize: (
    command: NormalizedGridEditorCommand,
    result: GridEditorCommandResult,
    startedAt: number,
    guardMs?: number
  ) => GridEditorCommandResult;
  onStart?: (command: NormalizedGridEditorCommand) => void;
  cleanupInteraction?: (reason: string) => void;
  now?: () => number;
  isStopped?: () => boolean;
};

export const createGridEditorCommandKernel = (
  ports: GridEditorCommandKernelPorts
) => {
  const pendingByScope = new Map<string, AbortController>();
  const now = ports.now || (() => {
    const perf = typeof performance !== "undefined" ? performance : null;
    return perf && typeof perf.now === "function" ? perf.now() : Date.now();
  });

  const execute = async (
    inputCommand: GridEditorCommand
  ): Promise<GridEditorCommandResult> => {
    const descriptor = requireGridEditorCommandDescriptor(inputCommand.type);
    const normalizedInput = {
      source: descriptor.defaultSource,
      ...inputCommand,
      history: inputCommand.history || descriptor.defaultHistory
    };
    const command = normalizeGridEditorCommand(normalizedInput);
    const historyPolicy = normalizeGridEditorHistoryPolicy(
      command.history,
      descriptor.defaultHistory.mode || defaultGridEditorHistoryMode(command.type)
    );
    command.history = historyPolicy;
    const source = command.source || descriptor.defaultSource || "api";
    command.source = source;
    const scope = descriptor.mutualExclusionScope || "global";
    const startedAt = now();

    const pending = pendingByScope.get(scope);
    if (pending && !pending.signal.aborted) {
      const result = blockedGridEditorCommandResult(command, "command-pending", {
        targetIds: command.targetIds,
        blocked: {
          reason: "command-pending",
          itemIds: command.targetIds,
          message: `Command scope ${scope} is waiting for beforeCommand.`
        },
        diagnostics: {
          durationMs: 0,
          pendingScope: scope,
          historyMode: historyPolicy.mode,
          source,
          origin: command.origin
        }
      });
      return ports.finalize(command, result, startedAt);
    }

    ports.onStart?.(command);
    const before = ports.getSnapshot();
    const beforeRevision = ports.getStateRevision();
    const check = ports.check(command);
    if (!check.ok && check.result) {
      check.result.diagnostics = {
        durationMs: check.result.diagnostics?.durationMs || 0,
        ...check.result.diagnostics,
        stateRevision: beforeRevision,
        historyMode: historyPolicy.mode,
        source,
        origin: command.origin
      };
      return ports.finalize(command, check.result, startedAt);
    }

    const validation = descriptor.validatePayload?.(command);
    if (validation && !validation.ok) {
      const result = blockedGridEditorCommandResult(command, "invalid-input", {
        targetIds: check.targetIds,
        blocked: {
          reason: "invalid-input",
          itemIds: check.targetIds,
          message: validation.message
        },
        diagnostics: {
          durationMs: 0,
          stateRevision: beforeRevision,
          historyMode: historyPolicy.mode,
          source,
          origin: command.origin
        }
      });
      return ports.finalize(command, result, startedAt);
    }

    const preview = ports.buildPreview?.(command, check, before) || {
      layoutPatches: [],
      metadataPatches: [],
      affectedIds: [],
      beforeSummary: {},
      afterSummary: {}
    };
    const abortController = new AbortController();
    pendingByScope.set(scope, abortController);
    const guard = await runGridEditorBeforeCommand(
      ports.beforeCommand,
      command,
      ports.getGuardContext(command, check, preview, abortController.signal),
      ports.guardTimeoutMs
    );
    pendingByScope.delete(scope);

    if (ports.isStopped?.() || abortController.signal.aborted) {
      ports.cleanupInteraction?.("guard-aborted");
      const result = createGridEditorCommandResult(command, "cancelled", {
        targetIds: check.targetIds,
        blocked: {
          reason: "guard-aborted",
          itemIds: check.targetIds,
          message: "Command guard was aborted."
        },
        diagnostics: {
          durationMs: 0,
          guardMs: guard.guardMs,
          pendingScope: scope,
          stateRevision: ports.getStateRevision(),
          historyMode: historyPolicy.mode,
          source,
          origin: command.origin
        }
      });
      return ports.finalize(command, result, startedAt, guard.guardMs);
    }

    if (guard.result) {
      ports.cleanupInteraction?.(guard.result.status);
      guard.result.diagnostics = {
        durationMs: guard.result.diagnostics?.durationMs || 0,
        ...guard.result.diagnostics,
        pendingScope: scope,
        stateRevision: ports.getStateRevision(),
        historyMode: historyPolicy.mode,
        source,
        origin: command.origin
      };
      return ports.finalize(command, guard.result, startedAt, guard.guardMs);
    }

    const currentRevision = ports.getStateRevision();
    if (currentRevision !== beforeRevision) {
      ports.cleanupInteraction?.("stale-command");
      const result = blockedGridEditorCommandResult(command, "stale-command", {
        targetIds: check.targetIds,
        blocked: {
          reason: "stale-command",
          itemIds: check.targetIds,
          message: "Command state changed while beforeCommand was pending."
        },
        diagnostics: {
          durationMs: 0,
          guardMs: guard.guardMs,
          pendingScope: scope,
          stateRevision: currentRevision,
          stale: true,
          historyMode: historyPolicy.mode,
          source,
          origin: command.origin
        }
      });
      return ports.finalize(command, result, startedAt, guard.guardMs);
    }

    return ports.commit({
      command,
      check,
      before,
      preview,
      startedAt,
      guardMs: guard.guardMs
    });
  };

  const abortPending = (reason = "command-kernel-abort") => {
    pendingByScope.forEach(controller => controller.abort(reason));
    pendingByScope.clear();
  };

  return {
    execute,
    abortPending
  };
};
