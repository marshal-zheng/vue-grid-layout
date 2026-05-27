import type { DashboardJsonObject, DashboardJsonValue } from "../dashboard";
import type {
  WidgetRegistryDiagnostic,
  WidgetRegistryPolicy,
  WidgetSettingsDefaultsResult,
  WidgetSettingsDescriptor,
  WidgetSettingsField,
  WidgetSettingsPredicate,
  WidgetSettingsValidationResult
} from "./types";
import {
  cloneJsonObject,
  cloneJsonValue,
  diagnostic,
  diagnosticsHaveErrors,
  isPlainRecord,
  mergeJsonObjects
} from "./json";

const primitiveEquals = (a: DashboardJsonValue, b: DashboardJsonValue): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const valueAtPath = (settings: DashboardJsonObject, path: string): DashboardJsonValue | undefined => {
  const parts = path.split(".").filter(Boolean);
  let current: DashboardJsonValue | undefined = settings;
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current)[part];
  }
  return current;
};

export const evaluateWidgetSettingsPredicate = (
  predicate: WidgetSettingsPredicate,
  settings: DashboardJsonObject
): boolean => {
  if (predicate.op === "exists") return valueAtPath(settings, predicate.path) !== undefined;
  if (predicate.op === "equals") {
    const value = valueAtPath(settings, predicate.path);
    return value !== undefined && primitiveEquals(value, predicate.value);
  }
  if (predicate.op === "not") return !evaluateWidgetSettingsPredicate(predicate.predicate, settings);
  if (predicate.op === "all") return predicate.predicates.every(item => evaluateWidgetSettingsPredicate(item, settings));
  if (predicate.op === "any") return predicate.predicates.some(item => evaluateWidgetSettingsPredicate(item, settings));
  return false;
};

const isSupportedFieldType = (type: unknown): type is WidgetSettingsField["type"] =>
  type === "string" ||
  type === "number" ||
  type === "boolean" ||
  type === "enum" ||
  type === "color" ||
  type === "text" ||
  type === "json" ||
  type === "object" ||
  type === "array" ||
  type === "ref";

const validateFieldValue = (
  field: WidgetSettingsField,
  value: unknown,
  input: { policy: WidgetRegistryPolicy; type?: string; path: string }
): { ok: boolean; value?: DashboardJsonValue; diagnostics: WidgetRegistryDiagnostic[] } => {
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  const fieldPath = `${input.path}.${field.id}`;
  if (value === undefined) {
    if (field.required) {
      diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", "Required widget setting is missing.", {
        type: input.type,
        fieldId: field.id,
        path: fieldPath
      }));
    }
    return { ok: !field.required, diagnostics };
  }

  const cloned = cloneJsonValue(value, { policy: input.policy, path: fieldPath });
  diagnostics.push(...cloned.diagnostics);
  if (!cloned.ok) return { ok: false, diagnostics };
  const clonedValue = cloned.value;

  const invalid = (message: string) => {
    diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", message, {
      type: input.type,
      fieldId: field.id,
      path: fieldPath
    }));
    return { ok: false, diagnostics };
  };

  if ((field.type === "string" || field.type === "text") && typeof clonedValue !== "string") {
    return invalid("Widget setting must be a string.");
  }
  if (field.type === "color" && typeof clonedValue !== "string") {
    return invalid("Widget color setting must be a string.");
  }
  if (field.type === "number") {
    if (typeof clonedValue !== "number" || !Number.isFinite(clonedValue)) return invalid("Widget setting must be a finite number.");
    if (typeof field.validation?.min === "number" && clonedValue < field.validation.min) return invalid("Widget setting is below min.");
    if (typeof field.validation?.max === "number" && clonedValue > field.validation.max) return invalid("Widget setting is above max.");
  }
  if (field.type === "boolean" && typeof clonedValue !== "boolean") {
    return invalid("Widget setting must be a boolean.");
  }
  if (field.type === "enum") {
    const allowed = (field.options || []).map(option => option.value);
    if (!allowed.some(option => primitiveEquals(option, clonedValue as DashboardJsonValue))) {
      return invalid("Widget enum setting must match a declared option.");
    }
  }
  if (field.type === "object" && (!clonedValue || typeof clonedValue !== "object" || Array.isArray(clonedValue))) {
    return invalid("Widget object setting must be a JSON object.");
  }
  if (field.type === "array" && !Array.isArray(clonedValue)) {
    return invalid("Widget array setting must be a JSON array.");
  }
  if (typeof clonedValue === "string") {
    if (typeof field.validation?.maxLength === "number" && clonedValue.length > field.validation.maxLength) {
      return invalid("Widget string setting exceeds maxLength.");
    }
    if (field.validation?.pattern) {
      try {
        if (!new RegExp(field.validation.pattern).test(clonedValue)) return invalid("Widget string setting does not match pattern.");
      } catch {
        return invalid("Widget setting pattern is invalid.");
      }
    }
  }

  return { ok: true, value: clonedValue, diagnostics };
};

const validateDescriptor = (
  descriptor: WidgetSettingsDescriptor | undefined,
  input: { type?: string; path: string }
): WidgetRegistryDiagnostic[] => {
  if (!descriptor) return [];
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  if (!Array.isArray(descriptor.fields)) {
    diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", "Settings descriptor fields must be an array.", {
      type: input.type,
      path: input.path
    }));
    return diagnostics;
  }
  const ids = new Set<string>();
  descriptor.fields.forEach((field, index) => {
    const path = `${input.path}.fields[${index}]`;
    if (!field || typeof field.id !== "string" || field.id.trim().length === 0) {
      diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", "Settings field id is required.", {
        type: input.type,
        path
      }));
    } else if (ids.has(field.id)) {
      diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", `Duplicate settings field "${field.id}".`, {
        type: input.type,
        fieldId: field.id,
        path
      }));
    } else {
      ids.add(field.id);
    }
    if (!isSupportedFieldType(field.type)) {
      diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", "Unsupported settings field type.", {
        type: input.type,
        fieldId: field.id,
        path: `${path}.type`
      }));
    }
  });
  return diagnostics;
};

export function createWidgetSettingsDefaults(
  descriptor: WidgetSettingsDescriptor | undefined,
  overrides?: DashboardJsonObject,
  options: { policy?: WidgetRegistryPolicy; type?: string } = {}
): WidgetSettingsDefaultsResult {
  const policy = options.policy || "strict";
  const diagnostics = validateDescriptor(descriptor, { type: options.type, path: "settings" });
  const defaults: DashboardJsonObject = {};
  descriptor?.fields?.forEach(field => {
    if (field.defaultValue === undefined) return;
    const cloned = cloneJsonValue(field.defaultValue, { policy, path: `settings.defaults.${field.id}` });
    diagnostics.push(...cloned.diagnostics);
    if (cloned.ok && cloned.value !== undefined) defaults[field.id] = cloned.value;
  });
  const overrideClone = overrides ? cloneJsonObject(overrides, { policy, path: "settings.overrides" }) : { ok: true, value: {}, diagnostics: [] };
  diagnostics.push(...overrideClone.diagnostics);
  return {
    settings: mergeJsonObjects(defaults, overrideClone.ok ? overrideClone.value : {}),
    diagnostics
  };
}

export function validateWidgetSettings(
  descriptor: WidgetSettingsDescriptor | undefined,
  settings: unknown,
  options: { policy?: WidgetRegistryPolicy; type?: string; path?: string } = {}
): WidgetSettingsValidationResult {
  const policy = options.policy || "strict";
  const path = options.path || "settings";
  const diagnostics = validateDescriptor(descriptor, { type: options.type, path });
  const input = settings === undefined || settings === null ? {} : settings;
  const cloned = cloneJsonObject(input, { policy, path });
  diagnostics.push(...cloned.diagnostics);
  const value: DashboardJsonObject = cloned.ok ? cloned.value : {};
  const fieldMap = new Map<string, WidgetSettingsField>();
  descriptor?.fields?.forEach(field => {
    if (typeof field.id === "string") fieldMap.set(field.id, field);
  });

  fieldMap.forEach(field => {
    const result = validateFieldValue(field, value[field.id], { policy, type: options.type, path });
    diagnostics.push(...result.diagnostics);
    if (result.ok && result.value !== undefined) value[field.id] = result.value;
    if (field.status === "deprecated") {
      diagnostics.push(diagnostic("widget-registry.deprecated-type", "warning", `Widget setting "${field.id}" is deprecated.`, {
        type: options.type,
        fieldId: field.id,
        path: `${path}.${field.id}`,
        details: field.replacement ? { replacement: field.replacement } : undefined
      }));
    }
  });

  Object.keys(value).forEach(key => {
    if (fieldMap.has(key)) return;
    if (policy === "strict") {
      diagnostics.push(diagnostic("widget-registry.invalid-settings", "error", "Unknown widget setting is not allowed by strict policy.", {
        type: options.type,
        fieldId: key,
        path: `${path}.${key}`
      }));
    }
  });

  if (policy === "tolerant") {
    descriptor?.fields?.forEach(field => {
      for (const predicate of [field.visibleWhen, field.enabledWhen]) {
        if (!predicate) continue;
        try {
          evaluateWidgetSettingsPredicate(predicate, value);
        } catch {
          diagnostics.push(diagnostic("widget-registry.invalid-settings", "warning", "Settings predicate could not be evaluated.", {
            type: options.type,
            fieldId: field.id,
            path: `${path}.${field.id}`
          }));
        }
      }
    });
  }

  const ok = policy === "tolerant" || (cloned.ok && !diagnosticsHaveErrors(diagnostics));
  if (!descriptor && settings !== undefined && !isPlainRecord(settings)) {
    return {
      ok: false,
      value: {},
      diagnostics: [diagnostic("widget-registry.invalid-settings", "error", "Widget settings must be a JSON object.", {
        type: options.type,
        path
      })]
    };
  }
  return { ok, value, diagnostics };
}
