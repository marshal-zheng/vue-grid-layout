import { type CompactType, type Layout, type LayoutItem } from "../utils";
import { type GridEditorPlacementCollisionPolicy, type GridEditorPlacementDiagnostic, type GridEditorPlacementSummary } from "./placement";
import type { GridEditorBlockedReason, GridEditorClipboardOriginalGeometryById, GridEditorClipboardSourceContext, GridEditorCommand, GridEditorCommandResult, GridEditorCommandSource, GridEditorMetaById, GridEditorPasteStrategy } from "./types";
export type GridEditorPlacementSessionSource = "paste" | "add" | "drop" | "palette" | "template" | "api";
export type GridEditorPlacementSessionPhase = "starting" | "preview" | "blocked" | "committing";
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
    size?: {
        w: number;
        h: number;
    };
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
export declare const buildGridEditorPlacementAffectedOutlines: (baseLayout: Layout, candidateLayout: Layout | undefined, summary: GridEditorPlacementSummary, blocked?: GridEditorPlacementBlocked) => GridEditorPlacementAffectedOutline[];
export declare const normalizeGridEditorPlacementDiagnostics: (diagnostics?: GridEditorPlacementDiagnostic[], blocked?: GridEditorPlacementBlocked) => GridEditorPlacementDiagnostic[];
export declare const createGridEditorPlacementRollbackSnapshot: (layout: Layout) => Layout;
export declare const updateGridEditorPlacementSession: (session: GridEditorPlacementSession, input?: GridEditorUpdatePlacementInput, context?: {
    now?: () => number;
}) => GridEditorPlacementSession;
export declare const createGridEditorPlacementSession: (input: GridEditorBeginPlacementInput, context: CreateGridEditorPlacementSessionContext) => GridEditorPlacementSession;
export declare const buildGridEditorPlacementCommitCommand: (session: GridEditorPlacementSession, input?: GridEditorCommitPlacementInput) => GridEditorCommand;
export declare const cancelGridEditorPlacementSession: (session: GridEditorPlacementSession, reason?: string, context?: {
    now?: () => number;
}) => GridEditorPlacementSessionResult;
