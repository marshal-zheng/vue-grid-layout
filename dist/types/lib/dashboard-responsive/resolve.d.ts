import { type DashboardDiagnostic, type DashboardLayoutDocument, type ResolvedDashboardGridSettings } from "../dashboard";
import type { Layout } from "../utils";
import type { CreateDashboardDocumentFromResponsiveLayoutsOptions, DashboardResponsiveDiagnosticInput, DashboardHeightOptionOverrides, DashboardResponsiveMigrationResult, DashboardResponsiveProfileResult, DashboardResponsiveRuntime, DashboardResponsiveWriteResult, DashboardTargetView, ResolveDashboardResponsiveProfileOptions, WriteDashboardResponsiveRuntimeOptions } from "./types";
import { type GridHeightDiagnostic } from "../grid-height";
export declare const DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE = "grid-height-runtime";
export declare function createDashboardResponsiveDiagnostic(code: string, level: DashboardDiagnostic["level"], message: string, extra?: DashboardResponsiveDiagnosticInput): DashboardDiagnostic;
export declare function isDashboardHeightDiagnostic(diagnostic: DashboardDiagnostic): boolean;
export declare function createDashboardHeightDiagnostic(diagnostic: GridHeightDiagnostic, runtime: Pick<DashboardResponsiveRuntime, "layoutId" | "resolvedProfileId" | "targetView">): DashboardDiagnostic;
export declare function resolveDashboardHeightOptions(settings: ResolvedDashboardGridSettings, context: {
    targetView: DashboardTargetView;
    explicit?: DashboardHeightOptionOverrides;
    diagnostics: DashboardDiagnostic[];
    layoutId: string;
    profileId: string | null;
}): DashboardHeightOptionOverrides;
export declare function resolveDashboardResponsiveProfile(document: DashboardLayoutDocument, options: ResolveDashboardResponsiveProfileOptions): DashboardResponsiveProfileResult;
export declare function writeDashboardResponsiveRuntimeToDocument(document: DashboardLayoutDocument, runtime: DashboardResponsiveRuntime, committedLayout: Layout, options?: WriteDashboardResponsiveRuntimeOptions): DashboardResponsiveWriteResult;
export declare function createDashboardDocumentFromResponsiveLayouts(options: CreateDashboardDocumentFromResponsiveLayoutsOptions): DashboardResponsiveMigrationResult;
