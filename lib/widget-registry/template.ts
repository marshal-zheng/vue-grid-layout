import type {
  DashboardJsonObject,
  DashboardJsonValue
} from "../dashboard";
import type {
  WidgetInstanceMetadata,
  WidgetLayoutDefaults,
  WidgetRegistry,
  WidgetRegistryDiagnostic,
  WidgetRegistryPolicy,
  WidgetTemplateDefinition,
  WidgetTemplateMaterializationInput,
  WidgetTemplateMaterializationResult,
  WidgetTypeDefinition
} from "./types";
import {
  cloneJsonObject,
  cloneJsonValue,
  diagnostic,
  diagnosticsHaveErrors,
  mergeJsonObjects
} from "./json";
import {
  mergeWidgetLayoutDefaults,
  normalizeWidgetLayoutDefaults,
  widgetFallbackLayoutDefaults,
  widgetLayoutDefaultsToTemplateItem
} from "./layout";
import {
  createWidgetSettingsDefaults,
  validateWidgetSettings
} from "./settings";

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "widget";

const uniqueId = (base: string, existingIds: Iterable<string> | undefined): string => {
  const existing = new Set(existingIds || []);
  let candidate = base;
  let index = 2;
  while (existing.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
};

const findTemplateDefinition = (
  definition: WidgetTypeDefinition,
  templateId: string | undefined
): WidgetTemplateDefinition | undefined => {
  if (!definition.templates?.length) return undefined;
  if (!templateId) return definition.templates[0];
  return definition.templates.find(template => template.id === templateId);
};

const cloneObjectOrEmpty = (
  value: unknown,
  input: { policy: WidgetRegistryPolicy; path: string; diagnostics: WidgetRegistryDiagnostic[] }
): DashboardJsonObject => {
  if (value === undefined) return {};
  const cloned = cloneJsonObject(value, { policy: input.policy, path: input.path });
  input.diagnostics.push(...cloned.diagnostics);
  return cloned.ok ? cloned.value : {};
};

const cloneValueOrUndefined = (
  value: unknown,
  input: { policy: WidgetRegistryPolicy; path: string; diagnostics: WidgetRegistryDiagnostic[] }
): DashboardJsonValue | undefined => {
  if (value === undefined) return undefined;
  const cloned = cloneJsonValue(value, { policy: input.policy, path: input.path });
  input.diagnostics.push(...cloned.diagnostics);
  return cloned.ok ? cloned.value : undefined;
};

export function materializeWidgetTemplate(
  registry: WidgetRegistry,
  input: WidgetTemplateMaterializationInput,
  options: { policy?: WidgetRegistryPolicy } = {}
): WidgetTemplateMaterializationResult {
  const policy = options.policy || "strict";
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  const resolved = registry.resolve(input.type);
  diagnostics.push(...resolved.diagnostics);
  if (!resolved.ok) return { ok: false, diagnostics };

  const definition = resolved.definition;
  const templateDefinition = findTemplateDefinition(definition, input.templateId);
  if (input.templateId && !templateDefinition) {
    diagnostics.push(diagnostic("widget-registry.invalid-template", "error", `Widget template "${input.templateId}" is not defined.`, {
      type: input.type,
      path: "templateId"
    }));
  }

  const typeLayout = normalizeWidgetLayoutDefaults(definition.layoutDefaults, {
    type: definition.type,
    path: "layoutDefaults",
    policy,
    includeFallback: true
  });
  const templateLayout = normalizeWidgetLayoutDefaults(templateDefinition?.layout, {
    type: definition.type,
    path: "template.layout",
    policy
  });
  const inputLayout = normalizeWidgetLayoutDefaults(input.layout, {
    type: definition.type,
    path: "input.layout",
    policy
  });
  diagnostics.push(...typeLayout.diagnostics, ...templateLayout.diagnostics, ...inputLayout.diagnostics);

  const mergedLayout: WidgetLayoutDefaults = mergeWidgetLayoutDefaults(
    widgetFallbackLayoutDefaults(),
    typeLayout.layout,
    templateLayout.layout,
    inputLayout.layout
  );

  const settingsDefaults = createWidgetSettingsDefaults(definition.settings, templateDefinition?.settings, {
    policy,
    type: definition.type
  });
  diagnostics.push(...settingsDefaults.diagnostics);
  const settings = mergeJsonObjects(settingsDefaults.settings, input.settings);
  const settingsValidation = validateWidgetSettings(definition.settings, settings, {
    policy,
    type: definition.type
  });
  diagnostics.push(...settingsValidation.diagnostics);

  const bindings = mergeJsonObjects(
    cloneObjectOrEmpty(templateDefinition?.bindings, { policy, path: "template.bindings", diagnostics }),
    cloneObjectOrEmpty(input.bindings, { policy, path: "input.bindings", diagnostics })
  );
  const payload = input.payload !== undefined
    ? cloneValueOrUndefined(input.payload, { policy, path: "input.payload", diagnostics })
    : cloneValueOrUndefined(templateDefinition?.payload, { policy, path: "template.payload", diagnostics });
  const extraMetadata = cloneObjectOrEmpty(input.metadata, { policy, path: "input.metadata", diagnostics });

  const id = uniqueId(input.id || slugify(`${definition.type}-${templateDefinition?.id || "widget"}`), input.existingIds);
  const label = input.label || templateDefinition?.title || definition.title || definition.type;
  const templateId = templateDefinition?.id || input.templateId;
  const instance: WidgetInstanceMetadata = {
    widgetType: definition.type,
    widgetVersion: definition.version,
    settings: settingsValidation.value,
    bindings,
    migration: definition.replacement
      ? {
          status: definition.status === "deprecated" ? "deprecated" : "current",
          replacement: definition.replacement
        }
      : {
          status: definition.status === "deprecated" ? "deprecated" : "current"
        }
  };
  if (templateId) instance.templateId = templateId;
  if (payload !== undefined) instance.payload = payload;
  if (definition.rendererHint) instance.rendererHint = definition.rendererHint;
  if (templateDefinition?.extensions) instance.extensions = templateDefinition.extensions;
  const widgetSummary: DashboardJsonObject = {
    widgetType: instance.widgetType,
    widgetVersion: instance.widgetVersion || null,
    templateId: instance.templateId || null,
    title: label,
    category: definition.category || null,
    status: definition.status || "stable",
    instance: instance as unknown as DashboardJsonValue
  };

  const template = {
    ...widgetLayoutDefaultsToTemplateItem(mergedLayout, { id }),
    id,
    label,
    metadata: {
      ...extraMetadata,
      widget: widgetSummary
    },
    payload
  };

  if (diagnosticsHaveErrors(diagnostics) && policy === "strict") return { ok: false, diagnostics };
  return {
    ok: true,
    template,
    instance,
    diagnostics
  };
}
