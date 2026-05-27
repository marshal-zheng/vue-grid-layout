import type {
  WidgetLifecycleStatus,
  WidgetRegistry,
  WidgetRegistryDiagnostic,
  WidgetRegistryListOptions,
  WidgetRegistryOptions,
  WidgetRegistryResolveResult,
  WidgetTypeDefinition
} from "./types";
import {
  cloneJsonObject,
  cloneJsonValue,
  diagnostic,
  diagnosticsHaveErrors,
  isPlainRecord,
  stableDiagnostics
} from "./json";
import { normalizeWidgetLayoutDefaults } from "./layout";

const TYPE_PATTERN = /^[a-zA-Z][a-zA-Z0-9._:-]*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;

const lifecycleStatuses = new Set<WidgetLifecycleStatus>([
  "stable",
  "experimental",
  "deprecated",
  "hidden"
]);

const cloneDefinition = (
  definition: WidgetTypeDefinition,
  options: { policy: "strict" | "tolerant" }
): { ok: boolean; definition: WidgetTypeDefinition; diagnostics: WidgetRegistryDiagnostic[] } => {
  const cloned = cloneJsonValue(definition, { policy: options.policy, path: `widgets.${definition.type || "unknown"}` });
  if (!cloned.ok || !cloned.value || Array.isArray(cloned.value) || typeof cloned.value !== "object") {
    return {
      ok: false,
      definition: { type: "", version: "", title: "" },
      diagnostics: cloned.diagnostics
    };
  }
  return {
    ok: true,
    definition: cloned.value as unknown as WidgetTypeDefinition,
    diagnostics: cloned.diagnostics
  };
};

export const validateWidgetTypeDefinition = (
  input: unknown,
  options: { policy?: "strict" | "tolerant"; existingTypes?: Set<string>; allowOverride?: boolean } = {}
): { ok: boolean; definition?: WidgetTypeDefinition; diagnostics: WidgetRegistryDiagnostic[] } => {
  const policy = options.policy || "strict";
  const diagnostics: WidgetRegistryDiagnostic[] = [];

  if (!isPlainRecord(input)) {
    return {
      ok: false,
      diagnostics: [diagnostic("widget-registry.invalid-type", "error", "Widget type definition must be a plain object.")]
    };
  }

  const rawType = typeof input.type === "string" ? input.type.trim() : "";
  const hasBlockingDuplicate = Boolean(rawType && options.existingTypes?.has(rawType) && !options.allowOverride);
  if (!rawType || !TYPE_PATTERN.test(rawType)) {
    diagnostics.push(diagnostic("widget-registry.invalid-type", "error", "Widget type must be non-empty and use a stable identifier format.", {
      type: rawType || undefined,
      path: "type"
    }));
  }

  if (rawType && options.existingTypes?.has(rawType) && !options.allowOverride) {
    diagnostics.push(diagnostic("widget-registry.duplicate-type", "error", `Widget type "${rawType}" is already registered.`, {
      type: rawType,
      path: "type"
    }));
  } else if (rawType && options.existingTypes?.has(rawType) && options.allowOverride) {
    diagnostics.push(diagnostic("widget-registry.duplicate-type", "warning", `Widget type "${rawType}" overrides an existing definition.`, {
      type: rawType,
      path: "type"
    }));
  }

  const version = typeof input.version === "string" ? input.version.trim() : "";
  if (!SEMVER_PATTERN.test(version)) {
    diagnostics.push(diagnostic("widget-registry.invalid-version", "error", "Widget type version must be a SemVer string.", {
      type: rawType || undefined,
      path: "version"
    }));
  }

  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    diagnostics.push(diagnostic("widget-registry.invalid-type", "error", "Widget type title is required.", {
      type: rawType || undefined,
      path: "title"
    }));
  }

  const status = typeof input.status === "string" ? input.status as WidgetLifecycleStatus : "stable";
  if (!lifecycleStatuses.has(status)) {
    diagnostics.push(diagnostic("widget-registry.invalid-type", "error", "Widget status is invalid.", {
      type: rawType || undefined,
      path: "status"
    }));
  }

  if (input.rendererHint !== undefined) {
    const hint = isPlainRecord(input.rendererHint) ? input.rendererHint : null;
    const invalidHint = !hint ||
      (hint.rendererKey !== undefined && typeof hint.rendererKey !== "string") ||
      (hint.componentKey !== undefined && typeof hint.componentKey !== "string") ||
      (hint.slot !== undefined && typeof hint.slot !== "string");
    if (invalidHint) {
      diagnostics.push(diagnostic("widget-registry.renderer-hint-invalid", "error", "Renderer hint may only contain JSON-safe string metadata.", {
        type: rawType || undefined,
        path: "rendererHint"
      }));
    }
  }

  const layout = normalizeWidgetLayoutDefaults(input.layoutDefaults, {
    type: rawType || undefined,
    path: "layoutDefaults",
    policy
  });
  diagnostics.push(...layout.diagnostics);

  if (input.settings !== undefined) {
    if (!isPlainRecord(input.settings) || !Array.isArray(input.settings.fields)) {
      diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", "Widget settings descriptor must contain a fields array.", {
        type: rawType || undefined,
        path: "settings"
      }));
    }
    const settingsVersion = isPlainRecord(input.settings) ? input.settings.version : undefined;
    if (settingsVersion !== undefined && (typeof settingsVersion !== "string" || !SEMVER_PATTERN.test(settingsVersion))) {
      diagnostics.push(diagnostic("widget-registry.invalid-version", "error", "Widget settings descriptor version must be a SemVer string.", {
        type: rawType || undefined,
        path: "settings.version"
      }));
    }
  }

  if (input.dataRequirements !== undefined) {
    diagnostics.push(...cloneJsonObject(input.dataRequirements, { policy, path: "dataRequirements" }).diagnostics);
  }
  if (input.extensions !== undefined) {
    diagnostics.push(...cloneJsonObject(input.extensions, { policy, path: "extensions" }).diagnostics);
  }

  const cloned = cloneDefinition(input as WidgetTypeDefinition, { policy });
  diagnostics.push(...cloned.diagnostics);
  const ok = !hasBlockingDuplicate && (policy === "tolerant" || !diagnosticsHaveErrors(diagnostics));
  if (!ok) return { ok: false, diagnostics: stableDiagnostics(diagnostics) };

  const definition = {
    ...cloned.definition,
    type: rawType,
    version,
    title: String(input.title || rawType),
    status
  };
  return { ok: true, definition, diagnostics: stableDiagnostics(diagnostics) };
};

const lifecycleDiagnostics = (definition: WidgetTypeDefinition): WidgetRegistryDiagnostic[] => {
  if (definition.status === "deprecated") {
    return [diagnostic("widget-registry.deprecated-type", "warning", `Widget type "${definition.type}" is deprecated.`, {
      type: definition.type,
      details: definition.replacement ? { replacement: definition.replacement } : undefined
    })];
  }
  if (definition.status === "experimental") {
    return [diagnostic("widget-registry.deprecated-type", "info", `Widget type "${definition.type}" is experimental.`, {
      type: definition.type
    })];
  }
  if (definition.status === "hidden") {
    return [diagnostic("widget-registry.hidden-type", "info", `Widget type "${definition.type}" is hidden from default listings.`, {
      type: definition.type
    })];
  }
  return [];
};

const matchesListOptions = (
  definition: WidgetTypeDefinition,
  options: WidgetRegistryListOptions,
  defaults: Required<Pick<WidgetRegistryOptions, "includeHiddenByDefault" | "includeDeprecatedByDefault">>
): boolean => {
  const status = definition.status || "stable";
  if (status === "hidden" && !(options.includeHidden ?? defaults.includeHiddenByDefault)) return false;
  if (status === "deprecated" && !(options.includeDeprecated ?? defaults.includeDeprecatedByDefault)) return false;
  if (options.category && definition.category !== options.category) return false;
  if (options.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    if (!statuses.includes(status)) return false;
  }
  if (options.tags?.length) {
    const tagSet = new Set(definition.tags || []);
    if (!options.tags.every(tag => tagSet.has(tag))) return false;
  }
  const searchText = options.searchText?.trim().toLowerCase();
  if (searchText) {
    const haystack = [
      definition.type,
      definition.title,
      definition.description,
      definition.category,
      ...(definition.tags || [])
    ].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(searchText)) return false;
  }
  return true;
};

export const createWidgetRegistry = (
  definitions: WidgetTypeDefinition[] = [],
  options: WidgetRegistryOptions = {}
): WidgetRegistry => {
  const policy = options.policy || "strict";
  const registry = new Map<string, WidgetTypeDefinition>();
  const allDiagnostics: WidgetRegistryDiagnostic[] = [];
  const defaults = {
    includeHiddenByDefault: options.includeHiddenByDefault === true,
    includeDeprecatedByDefault: options.includeDeprecatedByDefault !== false
  };

  const api: WidgetRegistry = {
    register(definition: WidgetTypeDefinition): WidgetRegistryResolveResult {
      const validated = validateWidgetTypeDefinition(definition, {
        policy,
        existingTypes: new Set(registry.keys()),
        allowOverride: options.allowOverride
      });
      allDiagnostics.push(...validated.diagnostics);
      if (!validated.ok || !validated.definition) return { ok: false, diagnostics: validated.diagnostics };
      registry.set(validated.definition.type, validated.definition);
      return {
        ok: true,
        definition: validated.definition,
        diagnostics: stableDiagnostics([...validated.diagnostics, ...lifecycleDiagnostics(validated.definition)])
      };
    },
    registerMany(nextDefinitions: WidgetTypeDefinition[]): WidgetRegistryDiagnostic[] {
      const diagnostics: WidgetRegistryDiagnostic[] = [];
      nextDefinitions.forEach(definition => {
        const result = api.register(definition);
        diagnostics.push(...result.diagnostics);
      });
      return stableDiagnostics(diagnostics);
    },
    resolve(type: string): WidgetRegistryResolveResult {
      const key = typeof type === "string" ? type.trim() : "";
      const definition = registry.get(key);
      if (!definition) {
        const result = [diagnostic("widget-registry.unknown-type", "error", `Widget type "${key || "unknown"}" is not registered.`, {
          type: key || undefined
        })];
        return { ok: false, diagnostics: result };
      }
      return {
        ok: true,
        definition,
        diagnostics: stableDiagnostics(lifecycleDiagnostics(definition))
      };
    },
    list(listOptions: WidgetRegistryListOptions = {}): WidgetTypeDefinition[] {
      return Array.from(registry.values())
        .filter(definition => matchesListOptions(definition, listOptions, defaults))
        .sort((a, b) =>
          `${a.category || ""}:${a.title || ""}:${a.type}`
            .localeCompare(`${b.category || ""}:${b.title || ""}:${b.type}`)
        );
    },
    diagnostics(): WidgetRegistryDiagnostic[] {
      return stableDiagnostics(allDiagnostics);
    }
  };

  api.registerMany(definitions);
  return api;
};
