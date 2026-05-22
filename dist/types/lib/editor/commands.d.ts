import type { Layout } from "../utils";
import type { ResolvedGridItemCapability } from "../item-capabilities";
import type { LayoutPatch, LayoutDiagnostics } from "../layout-engine";
import type { GridEditorBeforeCommand, GridEditorBlockedReason, GridEditorCommand, GridEditorCommandPolicy, GridEditorCommandResult, GridEditorCommandSource, GridEditorCommandStatus, GridEditorCommandType, GridEditorHistoryMode, GridEditorHistoryPolicy, GridEditorMetaById, GridEditorMetadataPatch, GridEditorMode, GridEditorSelectionState } from "./types";
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
export declare const normalizeGridEditorCommand: (command: GridEditorCommand) => NormalizedGridEditorCommand;
export declare const normalizeGridEditorHistoryPolicy: (history: GridEditorCommand["history"] | undefined, fallbackMode: GridEditorHistoryMode) => GridEditorHistoryPolicy;
export declare const isSelectionOnlyCommand: (type: GridEditorCommandType) => boolean;
export declare const isMetadataCommand: (type: GridEditorCommandType) => boolean;
export declare const isSectionRowCommand: (type: GridEditorCommandType) => boolean;
export declare const isLayoutCommand: (type: GridEditorCommandType) => boolean;
export declare const isPersistenceCommand: (type: GridEditorCommandType) => boolean;
export declare const isHistoryCommand: (type: GridEditorCommandType) => boolean;
export declare const shouldRecordGridEditorHistory: (type: GridEditorCommandType) => boolean;
export declare const defaultGridEditorHistoryMode: (type: GridEditorCommandType) => GridEditorHistoryMode;
export declare const createGridEditorCommandResult: (command: Pick<NormalizedGridEditorCommand, "id" | "type">, status: GridEditorCommandStatus, input?: Partial<GridEditorCommandResult>) => GridEditorCommandResult;
export declare const blockedGridEditorCommandResult: (command: Pick<NormalizedGridEditorCommand, "id" | "type">, reason: GridEditorBlockedReason, input?: Partial<GridEditorCommandResult>) => GridEditorCommandResult;
export declare const errorGridEditorCommandResult: (command: Pick<NormalizedGridEditorCommand, "id" | "type">, message: string, cause?: unknown) => GridEditorCommandResult;
export declare const resolveGridEditorCommandTargets: (command: GridEditorCommand, selection: GridEditorSelectionState, layout: Layout) => string[];
export declare const checkGridEditorCommand: (command: NormalizedGridEditorCommand, context: GridEditorCommandCheckContext) => GridEditorCommandCheck;
export declare const runGridEditorBeforeCommand: (beforeCommand: GridEditorBeforeCommand | undefined, command: NormalizedGridEditorCommand, context: Omit<Parameters<GridEditorBeforeCommand>[0], "command">, timeoutMs?: number) => Promise<{
    result?: GridEditorCommandResult;
    guardMs: number;
}>;
export declare const collectEditorLayoutPatches: (before: Layout, after: Layout) => LayoutPatch[];
export declare const mergeGridEditorDiagnostics: (durationMs: number, guardMs: number, layoutDiagnostics?: LayoutDiagnostics) => {
    durationMs: number;
    guardMs: number;
    layoutDiagnostics: LayoutDiagnostics | undefined;
};
export declare const collectAffectedIds: (layoutPatches: LayoutPatch[], metadataPatches: GridEditorMetadataPatch[]) => string[];
