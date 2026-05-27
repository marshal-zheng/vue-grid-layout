import type { WidgetRegistry, WidgetRegistryDiagnostic, WidgetRegistryOptions, WidgetTypeDefinition } from "./types";
export declare const validateWidgetTypeDefinition: (input: unknown, options?: {
    policy?: "strict" | "tolerant";
    existingTypes?: Set<string>;
    allowOverride?: boolean;
}) => {
    ok: boolean;
    definition?: WidgetTypeDefinition;
    diagnostics: WidgetRegistryDiagnostic[];
};
export declare const createWidgetRegistry: (definitions?: WidgetTypeDefinition[], options?: WidgetRegistryOptions) => WidgetRegistry;
