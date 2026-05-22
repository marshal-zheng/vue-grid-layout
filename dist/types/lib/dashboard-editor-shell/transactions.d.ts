import type { DashboardEditorShellActionResult, DashboardEditorShellActionSource, DashboardEditorShellActionStatus, DashboardEditorShellActionType, DashboardEditorShellDiagnostic, DashboardEditorShellEvent, DashboardEditorShellProfileContext, DashboardEditorShellTransactionInput } from "./types";
import type { DashboardResponsiveRuntime } from "../dashboard-responsive";
export declare const createDashboardEditorShellActionId: (actionType: DashboardEditorShellActionType) => string;
export declare const profileContextFromRuntime: (runtime: DashboardResponsiveRuntime | null | undefined) => DashboardEditorShellProfileContext;
export declare const createDashboardEditorShellDiagnostic: (code: string, level: DashboardEditorShellDiagnostic["level"], message: string, extra?: Partial<DashboardEditorShellDiagnostic>) => DashboardEditorShellDiagnostic;
export declare const diagnosticFromUnknownError: (error: unknown, extra?: Partial<DashboardEditorShellDiagnostic>) => DashboardEditorShellDiagnostic;
export declare const createDashboardEditorShellResult: <T = unknown>(input: {
    ok: boolean;
    status: DashboardEditorShellActionStatus;
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds?: string[];
    affectedIds?: string[];
} & Partial<DashboardEditorShellActionResult<T>>) => DashboardEditorShellActionResult<T>;
export declare const emitShellResult: (emit: ((event: DashboardEditorShellEvent) => void) | undefined, result: DashboardEditorShellActionResult, profile: DashboardEditorShellProfileContext) => void;
export declare const stableDiagnostics: (diagnostics: DashboardEditorShellDiagnostic[]) => DashboardEditorShellDiagnostic[];
export declare const runDashboardEditorShellTransaction: <T = unknown>(input: DashboardEditorShellTransactionInput<T>) => Promise<DashboardEditorShellActionResult<T>>;
