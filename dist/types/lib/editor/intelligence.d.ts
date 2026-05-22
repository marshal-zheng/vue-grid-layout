import type { LayoutItem } from "../utils";
import type { GridEditorDistributionCandidate, GridEditorIntelligenceInput, GridEditorIntelligenceState, GridEditorSnapResolveOptions, GridEditorSnapResolution } from "./types";
export declare const computeGridEditorDistribution: (input: GridEditorIntelligenceInput) => GridEditorDistributionCandidate[];
export declare const computeGridEditorIntelligence: (input: GridEditorIntelligenceInput) => GridEditorIntelligenceState;
export declare const resolveGridEditorSnap: (state: GridEditorIntelligenceState, candidateItem: LayoutItem, options?: GridEditorSnapResolveOptions) => GridEditorSnapResolution;
