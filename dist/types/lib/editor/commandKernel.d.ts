import { type GridEditorCommandCheck, type NormalizedGridEditorCommand } from "./commands";
import type { GridEditorBeforeCommand, GridEditorBeforeCommandContext, GridEditorCommand, GridEditorCommandResult, GridEditorHistorySnapshot, GridEditorTransactionPreview } from "./types";
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
    getGuardContext: (command: NormalizedGridEditorCommand, check: GridEditorCommandCheck, preview: GridEditorTransactionPreview, signal: AbortSignal) => Omit<GridEditorBeforeCommandContext, "command">;
    buildPreview?: (command: NormalizedGridEditorCommand, check: GridEditorCommandCheck, before: GridEditorHistorySnapshot) => GridEditorTransactionPreview;
    commit: (input: GridEditorCommandKernelCommitInput) => Promise<GridEditorCommandResult>;
    finalize: (command: NormalizedGridEditorCommand, result: GridEditorCommandResult, startedAt: number, guardMs?: number) => GridEditorCommandResult;
    onStart?: (command: NormalizedGridEditorCommand) => void;
    cleanupInteraction?: (reason: string) => void;
    now?: () => number;
    isStopped?: () => boolean;
};
export declare const createGridEditorCommandKernel: (ports: GridEditorCommandKernelPorts) => {
    execute: (inputCommand: GridEditorCommand) => Promise<GridEditorCommandResult>;
    abortPending: (reason?: string) => void;
};
