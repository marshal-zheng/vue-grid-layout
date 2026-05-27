import type { DashboardItemLayout, DashboardItemLayoutOverride, DashboardLayoutDocument } from "../dashboard";
import type { WidgetInstanceMetadata, WidgetRegistry, WidgetRegistryDiagnostic, WidgetRegistryPolicy } from "./types";
export declare function readWidgetInstanceMetadata(item: DashboardItemLayout | DashboardItemLayoutOverride | undefined): WidgetInstanceMetadata | null;
export declare function writeWidgetInstanceMetadata<T extends DashboardItemLayout | DashboardItemLayoutOverride>(item: T, metadata: WidgetInstanceMetadata | null, options?: {
    policy?: WidgetRegistryPolicy;
}): {
    item: T;
    diagnostics: WidgetRegistryDiagnostic[];
};
export declare function validateDashboardWidgetInstances(document: DashboardLayoutDocument, registry: WidgetRegistry | null, options?: {
    policy?: WidgetRegistryPolicy;
    layoutId?: string;
    profileId?: string | null;
    requireTypedItems?: boolean;
}): {
    ok: boolean;
    diagnostics: WidgetRegistryDiagnostic[];
};
