import type { Layout } from "../utils";
import type { GridLayoutEngineOptions, LayoutMigrationPolicy, LayoutMigrationSettings, LayoutOperationPhase, LayoutOperationRequest, LayoutOperationResult, LayoutPlacementRequest, LayoutRepairPolicy } from "./types";
export declare function executeMigrateSettings(request: LayoutOperationRequest, start?: number): LayoutOperationResult;
export declare function executeRepairCollisions(request: LayoutOperationRequest, start?: number): LayoutOperationResult;
export declare function executeTranslateLayout(request: LayoutOperationRequest, start?: number): LayoutOperationResult;
export declare function executePlaceItems(request: LayoutOperationRequest, start?: number): LayoutOperationResult;
export type LayoutSettingsMigrationOptions = {
    previousSettings: LayoutMigrationSettings;
    nextSettings: LayoutMigrationSettings;
    policy?: LayoutMigrationPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
};
export type LayoutRepairCollisionsOptions = {
    policy?: LayoutRepairPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
};
export type LayoutTranslateOptions = {
    dx: number;
    dy: number;
    clampNegative?: boolean;
    policy?: LayoutRepairPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
};
export type LayoutPlaceItemsOptions = {
    items: LayoutPlacementRequest[];
    policy?: LayoutRepairPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
};
export declare function migrateLayoutSettings(layout: Layout, options: LayoutSettingsMigrationOptions): LayoutOperationResult;
export declare function repairLayoutCollisions(layout: Layout, options: LayoutRepairCollisionsOptions): LayoutOperationResult;
export declare function translateLayout(layout: Layout, options: LayoutTranslateOptions): LayoutOperationResult;
export declare function placeLayoutItems(layout: Layout, options: LayoutPlaceItemsOptions): LayoutOperationResult;
