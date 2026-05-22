import type { Layout } from "../utils";
import type { GridEditorResolvedSectionRowState, GridEditorSectionRowState } from "./types";
export declare const emptyGridEditorSectionRows: () => GridEditorSectionRowState;
export declare const normalizeGridEditorSectionRows: (input: GridEditorSectionRowState | null | undefined, layout?: Layout) => GridEditorResolvedSectionRowState;
