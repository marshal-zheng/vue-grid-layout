import type { DashboardDiagnostic, DashboardDocumentError, DashboardGridSettings, DashboardLayoutDocument } from "./dashboard";
import type { LayoutValidationMode } from "./persistence";
import type { LayoutMigrationPolicy, LayoutOperationResult, LayoutRepairPolicy } from "./layout-engine";
export type DashboardLayoutSettingsMigrationOptions = {
    layoutId?: string;
    profileId?: string | null;
    previousSettings?: DashboardGridSettings;
    nextSettings: DashboardGridSettings;
    policy?: LayoutMigrationPolicy;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
};
export type DashboardLayoutRepairOptions = {
    layoutId?: string;
    profileId?: string | null;
    policy?: LayoutRepairPolicy;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
};
export type DashboardLayoutTranslateOptions = DashboardLayoutRepairOptions & {
    dx: number;
    dy: number;
    clampNegative?: boolean;
};
export type DashboardLayoutSettingsMigrationResult = {
    ok: true;
    document: DashboardLayoutDocument;
    operation: LayoutOperationResult;
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
    ok: false;
    document: DashboardLayoutDocument;
    operation?: LayoutOperationResult;
    error: DashboardDocumentError;
    diagnostics: DashboardDiagnostic[];
};
export declare function migrateDashboardLayoutSettings(document: DashboardLayoutDocument, options: DashboardLayoutSettingsMigrationOptions): DashboardLayoutSettingsMigrationResult;
export declare function repairDashboardLayoutCollisions(document: DashboardLayoutDocument, options?: DashboardLayoutRepairOptions): DashboardLayoutSettingsMigrationResult;
export declare function translateDashboardLayout(document: DashboardLayoutDocument, options: DashboardLayoutTranslateOptions): DashboardLayoutSettingsMigrationResult;
