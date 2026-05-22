import type { Layout } from "../utils";
import type { GridEditorA11yItemDescription, GridEditorMetaById, GridEditorResolvedCapability, GridEditorSelectionSource, GridEditorSelectionState } from "./types";
export type GridEditorSelectionIntent = {
    id?: string | null;
    ids?: string[];
    toggle?: boolean;
    range?: boolean;
    source?: GridEditorSelectionSource;
};
export declare const createGridEditorSelection: (selectedIds?: string[], source?: GridEditorSelectionSource) => GridEditorSelectionState;
export declare const normalizeSelection: (selection: GridEditorSelectionState) => GridEditorSelectionState;
export declare const getLayoutIds: (layout: Layout) => string[];
export declare const sanitizeSelectionForLayout: (selection: GridEditorSelectionState, layout: Layout, metaById?: GridEditorMetaById, source?: GridEditorSelectionSource) => GridEditorSelectionState;
export declare const selectEditorIds: (current: GridEditorSelectionState, ids: string[], source?: GridEditorSelectionSource) => GridEditorSelectionState;
export declare const clearEditorSelection: (source?: GridEditorSelectionSource) => GridEditorSelectionState;
export declare const updateSelectionByIntent: (layout: Layout, current: GridEditorSelectionState, intent: GridEditorSelectionIntent) => GridEditorSelectionState;
export declare const getNextFocusableId: (layout: Layout, removedOrHiddenIds: string[], metaById?: GridEditorMetaById) => string | null;
export declare const describeEditorA11yItems: (layout: Layout, metaById: GridEditorMetaById, selection: GridEditorSelectionState, capabilities?: Record<string, GridEditorResolvedCapability>) => GridEditorA11yItemDescription[];
