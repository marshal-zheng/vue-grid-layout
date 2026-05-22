import type { GridEditorClipboardAdapter, GridEditorClipboardOriginalGeometryById, GridEditorClipboardPayload, GridEditorClipboardSourceContext, GridEditorMetaById } from "./types";
import type { Layout } from "../utils";
export type GridEditorClipboardErrorCode = "clipboard-unavailable" | "clipboard-permission" | "clipboard-invalid";
export declare class GridEditorClipboardError extends Error {
    code: GridEditorClipboardErrorCode;
    cause?: unknown;
    constructor(code: GridEditorClipboardErrorCode, message: string, cause?: unknown);
}
export type GridEditorClipboardTargetContext = {
    cols?: number;
    scale?: boolean;
};
export type GridEditorClipboardNormalizationResult = {
    items: Layout;
    scaled: boolean;
    sourceCols?: number;
    targetCols?: number;
};
export type CreateGridEditorClipboardPayloadInput = {
    version?: 1 | 2;
    sourceId: string;
    copiedAt?: string;
    items: Layout;
    editorMetaById: GridEditorMetaById;
    source?: GridEditorClipboardSourceContext;
    originalGeometryById?: GridEditorClipboardOriginalGeometryById;
};
export declare const internalGridEditorClipboard: GridEditorClipboardAdapter & {
    clear: () => void;
};
export declare const parseGridEditorClipboardPayload: (raw: unknown) => GridEditorClipboardPayload | null;
export declare const systemClipboardAdapter: () => GridEditorClipboardAdapter;
export declare const createGridEditorClipboardPayload: (input: CreateGridEditorClipboardPayloadInput) => GridEditorClipboardPayload;
export declare const normalizeGridEditorClipboardItemsForTarget: (payload: GridEditorClipboardPayload | Pick<GridEditorClipboardPayload, "items">, target?: GridEditorClipboardTargetContext) => GridEditorClipboardNormalizationResult;
