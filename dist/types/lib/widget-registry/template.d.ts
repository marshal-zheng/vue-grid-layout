import type { WidgetRegistry, WidgetRegistryPolicy, WidgetTemplateMaterializationInput, WidgetTemplateMaterializationResult } from "./types";
export declare function materializeWidgetTemplate(registry: WidgetRegistry, input: WidgetTemplateMaterializationInput, options?: {
    policy?: WidgetRegistryPolicy;
}): WidgetTemplateMaterializationResult;
