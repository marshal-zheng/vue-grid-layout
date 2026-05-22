import { type Layout } from "../utils";
import type { GridEditorBlockedReason } from "./types";
export type GridEditorPlacementStrategy = "offset" | "cursor" | "nearest-fit" | "first-fit" | "insert-top-shift";
export type GridEditorPlacementSource = GridEditorPlacementStrategy | "none";
export type GridEditorPlacementAnchor = "nearest" | "top-left";
export type GridEditorPlacementCollisionPolicy = "block" | "layout";
export type GridEditorPlacementDiagnostic = {
    code: string;
    level: "info" | "warning" | "error";
    message: string;
    reason?: GridEditorBlockedReason;
    itemIds?: string[];
    details?: unknown;
};
export type GridEditorPlacementGeometry = {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
};
export type GridEditorPlacementSummary = {
    strategy: GridEditorPlacementStrategy;
    placementSource: GridEditorPlacementSource;
    collisionPolicy?: GridEditorPlacementCollisionPolicy;
    sessionId?: string;
    source?: string;
    insertedIds: string[];
    shiftedIds: string[];
    delta?: {
        dx: number;
        dy: number;
    };
    before: GridEditorPlacementGeometry[];
    after: GridEditorPlacementGeometry[];
    diagnostics: GridEditorPlacementDiagnostic[];
};
export type GridEditorPlacementResult = {
    layout: Layout;
    failed: boolean;
    blocked?: {
        reason: GridEditorBlockedReason;
        itemIds?: string[];
        message?: string;
    };
    summary: GridEditorPlacementSummary;
};
export declare const placeGridEditorNewItems: (sourceLayout: Layout, items: Layout, strategy: string, payload?: Record<string, unknown>) => GridEditorPlacementResult;
