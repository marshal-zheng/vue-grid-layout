import type { DashboardEditorShellPaletteAdapter, DashboardEditorShellWidgetAdapter } from "../dashboard-editor-shell";
import type { WidgetRegistry, WidgetRegistryDiagnostic, WidgetRegistryPaletteAdapterOptions, WidgetRegistryWidgetAdapterOptions } from "./types";
export declare function createWidgetRegistryPaletteAdapter(registry: WidgetRegistry, options?: WidgetRegistryPaletteAdapterOptions): DashboardEditorShellPaletteAdapter;
export declare function createWidgetRegistryWidgetAdapter(_registry: WidgetRegistry, options?: WidgetRegistryWidgetAdapterOptions): DashboardEditorShellWidgetAdapter;
export declare const widgetRegistryDiagnostic: (code: import("./types").WidgetRegistryDiagnosticCode, level: import("./types").WidgetRegistryDiagnosticLevel, message: string, input?: Partial<Omit<WidgetRegistryDiagnostic, "code" | "level" | "message">>) => WidgetRegistryDiagnostic;
export declare const cloneWidgetRegistryJsonValue: <T extends import("../dashboard").DashboardJsonValue = import("../dashboard").DashboardJsonValue>(value: unknown, options?: {
    policy?: import("./types").WidgetRegistryPolicy;
    path?: string;
}) => import("./json").JsonCloneResult<T>;
