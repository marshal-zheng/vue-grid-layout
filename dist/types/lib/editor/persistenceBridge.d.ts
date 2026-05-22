import type { GridLayoutPersistenceController, LayoutPersistenceDocument, LayoutPersistenceError, LayoutPersistenceMeta, LayoutsMap } from "../persistence";
import type { Layout } from "../utils";
import type { GridEditorConflict, GridEditorMetaById, GridEditorPersistenceBridge, GridEditorPersistenceEnvelope, GridEditorResolvedSectionRowState, GridEditorSectionRowState } from "./types";
export type CreateGridEditorPersistenceBridgeOptions = {
    getEditorMetaById: () => GridEditorMetaById;
    getSectionRows?: () => GridEditorSectionRowState | undefined;
    setEditorMetaById?: (metaById: GridEditorMetaById, reason: string) => void;
    setSectionRows?: (sectionRows: GridEditorResolvedSectionRowState, reason: string) => void;
    persistence?: GridLayoutPersistenceController<Layout | LayoutsMap> | null;
    baseMeta?: LayoutPersistenceMeta | (() => LayoutPersistenceMeta | undefined);
    onSaveStateChange?: (input: {
        status: string;
        dirty: boolean;
        error?: LayoutPersistenceError | null;
    }) => void;
    onConflict?: (conflict: GridEditorConflict) => void;
    onError?: (code: string, message: string, details?: unknown) => void;
};
export declare const createGridEditorPersistenceEnvelope: (editorMetaById: GridEditorMetaById, sectionRowsOrUpdatedAt?: GridEditorSectionRowState | string, updatedAt?: string) => GridEditorPersistenceEnvelope;
export declare const readGridEditorPersistenceEnvelope: (document?: LayoutPersistenceDocument | null) => {
    ok: boolean;
    envelope?: GridEditorPersistenceEnvelope;
    error?: string;
};
export declare const createGridEditorPersistenceBridge: (options: CreateGridEditorPersistenceBridgeOptions) => GridEditorPersistenceBridge;
