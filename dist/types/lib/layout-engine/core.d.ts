import type { Layout } from "../utils";
import type { GridLayoutEngine, GridLayoutEngineOptions, LayoutOperationRequest, LayoutOperationResult } from "./types";
export declare function compareWithLegacyLayout(request: LayoutOperationRequest, result: LayoutOperationResult): {
    matches: boolean;
    differences: string[];
};
export declare function executeLayoutOperation(request: LayoutOperationRequest): LayoutOperationResult;
export declare function createLayoutEngine(options: GridLayoutEngineOptions, initialLayout?: Layout): GridLayoutEngine;
