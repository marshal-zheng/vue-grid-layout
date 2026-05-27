import type { DashboardJsonObject } from "../dashboard";
import type { WidgetRegistryPolicy, WidgetSettingsDefaultsResult, WidgetSettingsDescriptor, WidgetSettingsPredicate, WidgetSettingsValidationResult } from "./types";
export declare const evaluateWidgetSettingsPredicate: (predicate: WidgetSettingsPredicate, settings: DashboardJsonObject) => boolean;
export declare function createWidgetSettingsDefaults(descriptor: WidgetSettingsDescriptor | undefined, overrides?: DashboardJsonObject, options?: {
    policy?: WidgetRegistryPolicy;
    type?: string;
}): WidgetSettingsDefaultsResult;
export declare function validateWidgetSettings(descriptor: WidgetSettingsDescriptor | undefined, settings: unknown, options?: {
    policy?: WidgetRegistryPolicy;
    type?: string;
    path?: string;
}): WidgetSettingsValidationResult;
