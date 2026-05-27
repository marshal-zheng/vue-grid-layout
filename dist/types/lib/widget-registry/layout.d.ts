import type { LayoutItem } from "../utils";
import type { WidgetLayoutDefaults, WidgetRegistryDiagnostic, WidgetRegistryPolicy } from "./types";
export type NormalizeWidgetLayoutDefaultsOptions = {
    type?: string;
    path?: string;
    policy?: WidgetRegistryPolicy;
    includeFallback?: boolean;
};
export type NormalizeWidgetLayoutDefaultsResult = {
    ok: boolean;
    layout: WidgetLayoutDefaults;
    diagnostics: WidgetRegistryDiagnostic[];
};
export declare const widgetFallbackLayoutDefaults: () => Required<Pick<WidgetLayoutDefaults, "w" | "h">>;
export declare const normalizeWidgetLayoutDefaults: (input: unknown, options?: NormalizeWidgetLayoutDefaultsOptions) => NormalizeWidgetLayoutDefaultsResult;
export declare const mergeWidgetLayoutDefaults: (...layouts: Array<WidgetLayoutDefaults | undefined>) => WidgetLayoutDefaults;
export declare const widgetLayoutDefaultsToTemplateItem: (layout: WidgetLayoutDefaults, input?: {
    id?: string;
    x?: number;
    y?: number;
}) => Partial<LayoutItem>;
export declare const widgetLayoutDefaultsToPhysicalCapability: (layout: WidgetLayoutDefaults) => WidgetLayoutDefaults;
