import type { GridEditorHistorySnapshot, GridEditorMetadataPatch, GridEditorSectionRowPatch, GridEditorTransactionPreview } from "./types";
export declare const createGridEditorTransactionPreview: (before: GridEditorHistorySnapshot, after: GridEditorHistorySnapshot, input?: {
    metadataPatches?: GridEditorMetadataPatch[];
    sectionRowPatches?: GridEditorSectionRowPatch[];
    risk?: GridEditorTransactionPreview["risk"];
}) => GridEditorTransactionPreview;
export type { GridEditorHistoryMode, GridEditorHistoryPolicy, GridEditorSectionRowPatch, GridEditorTransaction, GridEditorTransactionPreview, GridEditorTransactionSummary } from "./types";
