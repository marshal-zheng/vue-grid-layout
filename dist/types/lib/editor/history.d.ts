import type { GridEditorHistoryController, GridEditorHistoryEntry } from "./types";
export type GridEditorHistoryOptions = {
    maxSize?: number;
    mergeWindowMs?: number;
    now?: () => Date;
};
export declare const createGridEditorHistory: (options?: GridEditorHistoryOptions) => GridEditorHistoryController;
export declare const createGridEditorHistoryEntry: (input: Omit<GridEditorHistoryEntry, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
}) => GridEditorHistoryEntry;
