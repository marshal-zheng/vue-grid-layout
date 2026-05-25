import type { Layout, LayoutItem } from "../utils";
import type { LayoutOperation, LayoutOperationResult } from "../layout-engine";
import type { GridDroppingItem, GridInteractionBlockedReason } from "./gridInteractionTypes";
export type ExternalDropSessionStatus = "entered" | "previewing" | "ready" | "blocked" | "committing";
export type ExternalDropBlockedReason = GridInteractionBlockedReason | "no-fit" | "drop-drag-over-rejected" | "preview-stale" | "commit-rejected";
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
    target?: {
        x: number;
        y: number;
    };
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
    target?: {
        x: number;
        y: number;
    };
};
export type ResolveExternalDropCandidateInput = {
    overrides?: Pick<Partial<LayoutItem>, "w" | "h"> | null;
    target?: {
        x: number;
        y: number;
    };
    strategy?: ExternalDropStrategy;
    baseLayout?: Layout;
    snapCandidate?: (activeId: string, activeItem: LayoutItem, candidateItem: LayoutItem, validationLayout?: Layout) => LayoutItem;
};
export type ExternalDropCommitResolution = {
    committedLayout: Layout;
    committedItem?: LayoutItem;
    eventLayout: Layout;
};
export declare function createExternalDropSession({ id, interactionId, sourceItem, baseLayout, strategy, target }: CreateExternalDropSessionInput): ExternalDropSession;
export declare function resolveExternalDropCandidate(session: ExternalDropSession, { overrides, target, strategy, baseLayout, snapCandidate }: ResolveExternalDropCandidateInput): ExternalDropSession;
export declare function buildDropFitOperationFromSession(session: ExternalDropSession, phase: "preview" | "commit"): Extract<LayoutOperation, {
    type: "dropFit";
}>;
export declare function applyExternalDropPreviewResult(session: ExternalDropSession, result: ExternalDropPreviewResult): ExternalDropSession;
export declare function blockExternalDropSession(session: ExternalDropSession, reason: ExternalDropBlockedReason, options?: {
    geometry?: LayoutItem | null;
    message?: string;
    itemIds?: string[];
}): ExternalDropSession;
export declare function commitExternalDropSession(session: ExternalDropSession, result: ExternalDropCommitResult): ExternalDropCommitResolution;
export declare function clearExternalDropSession(): null;
export declare function isExternalDropping(state: {
    externalDropSession?: ExternalDropSession | null;
}): boolean;
export declare function getExternalDropGhost(state: {
    externalDropSession?: ExternalDropSession | null;
}): LayoutItem | null;
export declare function isExternalDropBlocked(state: {
    externalDropSession?: ExternalDropSession | null;
}): boolean;
export declare function getExternalDropRenderLayout(state: {
    externalDropSession?: ExternalDropSession | null;
}, committedRenderLayout: Layout): Layout;
export {};
