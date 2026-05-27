import type { DashboardJsonObject, DashboardJsonValue } from "../dashboard";
import type { WidgetRegistryDiagnostic, WidgetRegistryDiagnosticCode, WidgetRegistryDiagnosticLevel, WidgetRegistryPolicy } from "./types";
export declare const isPlainRecord: (value: unknown) => value is Record<string, unknown>;
export declare const hasOwn: (value: object, key: string) => boolean;
export declare const isReservedKey: (key: string) => boolean;
export declare const isJsonObject: (value: unknown) => value is DashboardJsonObject;
export declare const diagnostic: (code: WidgetRegistryDiagnosticCode, level: WidgetRegistryDiagnosticLevel, message: string, input?: Partial<Omit<WidgetRegistryDiagnostic, "code" | "level" | "message">>) => WidgetRegistryDiagnostic;
export type JsonCloneResult<T extends DashboardJsonValue = DashboardJsonValue> = {
    ok: boolean;
    value?: T;
    diagnostics: WidgetRegistryDiagnostic[];
};
export declare const cloneJsonValue: <T extends DashboardJsonValue = DashboardJsonValue>(value: unknown, options?: {
    policy?: WidgetRegistryPolicy;
    path?: string;
}) => JsonCloneResult<T>;
export declare const cloneJsonObject: (value: unknown, options?: {
    policy?: WidgetRegistryPolicy;
    path?: string;
}) => {
    ok: boolean;
    value: DashboardJsonObject;
    diagnostics: WidgetRegistryDiagnostic[];
};
export declare const mergeJsonObjects: (...objects: Array<DashboardJsonObject | undefined>) => DashboardJsonObject;
export declare const asString: (value: unknown) => string | undefined;
export declare const stableDiagnostics: (diagnostics: WidgetRegistryDiagnostic[]) => WidgetRegistryDiagnostic[];
export declare const diagnosticsHaveErrors: (diagnostics: WidgetRegistryDiagnostic[]) => boolean;
