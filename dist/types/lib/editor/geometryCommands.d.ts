import { type Layout } from "../utils";
import type { GridEditorAlignPayload, GridEditorDistributePayload, GridEditorGeometryCommandContext, GridEditorGeometryPatchResult, GridEditorTidyPayload } from "./types";
export declare const applyGridEditorAlign: (layout: Layout, payload: GridEditorAlignPayload, context?: GridEditorGeometryCommandContext) => GridEditorGeometryPatchResult;
export declare const applyGridEditorDistribute: (layout: Layout, payload: GridEditorDistributePayload, context?: GridEditorGeometryCommandContext) => GridEditorGeometryPatchResult;
export declare const applyGridEditorTidy: (layout: Layout, payload: GridEditorTidyPayload, context?: GridEditorGeometryCommandContext) => GridEditorGeometryPatchResult;
