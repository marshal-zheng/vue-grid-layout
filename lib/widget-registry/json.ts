import type {
  DashboardJsonObject,
  DashboardJsonValue
} from "../dashboard";
import type {
  WidgetRegistryDiagnostic,
  WidgetRegistryDiagnosticCode,
  WidgetRegistryDiagnosticLevel,
  WidgetRegistryPolicy
} from "./types";

const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

export const isReservedKey = (key: string): boolean => RESERVED_KEYS.has(key);

export const isJsonObject = (value: unknown): value is DashboardJsonObject =>
  isPlainRecord(value);

export const diagnostic = (
  code: WidgetRegistryDiagnosticCode,
  level: WidgetRegistryDiagnosticLevel,
  message: string,
  input: Partial<Omit<WidgetRegistryDiagnostic, "code" | "level" | "message">> = {}
): WidgetRegistryDiagnostic => ({
  code,
  level,
  message,
  ...input
});

export type JsonCloneResult<T extends DashboardJsonValue = DashboardJsonValue> = {
  ok: boolean;
  value?: T;
  diagnostics: WidgetRegistryDiagnostic[];
};

const unsafeDiagnostic = (
  path: string,
  message: string,
  level: WidgetRegistryDiagnosticLevel = "error"
): WidgetRegistryDiagnostic =>
  diagnostic("widget-registry.unsafe-extension-key", level, message, { path });

const isJsonPrimitive = (value: unknown): value is string | number | boolean | null =>
  value === null ||
  typeof value === "string" ||
  typeof value === "boolean" ||
  (typeof value === "number" && Number.isFinite(value));

const cloneJsonValueInternal = (
  value: unknown,
  options: { policy: WidgetRegistryPolicy; path: string; seen: WeakSet<object> }
): JsonCloneResult => {
  if (isJsonPrimitive(value)) return { ok: true, value, diagnostics: [] };

  if (typeof value === "number") {
    return {
      ok: false,
      diagnostics: [unsafeDiagnostic(options.path, "Non-finite numbers are not JSON-safe.")]
    };
  }

  if (Array.isArray(value)) {
    if (options.seen.has(value)) {
      return {
        ok: false,
        diagnostics: [unsafeDiagnostic(options.path, "Circular arrays are not JSON-safe.")]
      };
    }
    options.seen.add(value);
    const out: DashboardJsonValue[] = [];
    const diagnostics: WidgetRegistryDiagnostic[] = [];
    let ok = true;
    value.forEach((item, index) => {
      const cloned = cloneJsonValueInternal(item, {
        ...options,
        path: `${options.path}[${index}]`
      });
      diagnostics.push(...cloned.diagnostics);
      if (cloned.ok && cloned.value !== undefined) out.push(cloned.value);
      else ok = false;
    });
    options.seen.delete(value);
    if (!ok && options.policy === "strict") return { ok: false, diagnostics };
    return { ok: ok || options.policy === "tolerant", value: out, diagnostics };
  }

  if (!isPlainRecord(value)) {
    return {
      ok: false,
      diagnostics: [unsafeDiagnostic(options.path, "Only plain JSON objects are allowed.")]
    };
  }

  if (options.seen.has(value)) {
    return {
      ok: false,
      diagnostics: [unsafeDiagnostic(options.path, "Circular objects are not JSON-safe.")]
    };
  }
  options.seen.add(value);

  const out: DashboardJsonObject = {};
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  let ok = true;
  Object.keys(value).forEach(key => {
    const childPath = options.path ? `${options.path}.${key}` : key;
    if (isReservedKey(key)) {
      diagnostics.push(unsafeDiagnostic(
        childPath,
        `Reserved key "${key}" is not allowed.`,
        options.policy === "strict" ? "error" : "warning"
      ));
      ok = false;
      return;
    }
    const cloned = cloneJsonValueInternal(value[key], {
      ...options,
      path: childPath
    });
    diagnostics.push(...cloned.diagnostics);
    if (cloned.ok && cloned.value !== undefined) out[key] = cloned.value;
    else ok = false;
  });

  options.seen.delete(value);
  if (!ok && options.policy === "strict") return { ok: false, diagnostics };
  return { ok: ok || options.policy === "tolerant", value: out, diagnostics };
};

export const cloneJsonValue = <T extends DashboardJsonValue = DashboardJsonValue>(
  value: unknown,
  options: { policy?: WidgetRegistryPolicy; path?: string } = {}
): JsonCloneResult<T> => {
  const result = cloneJsonValueInternal(value, {
    policy: options.policy || "strict",
    path: options.path || "$",
    seen: new WeakSet()
  });
  return result as JsonCloneResult<T>;
};

export const cloneJsonObject = (
  value: unknown,
  options: { policy?: WidgetRegistryPolicy; path?: string } = {}
): { ok: boolean; value: DashboardJsonObject; diagnostics: WidgetRegistryDiagnostic[] } => {
  const cloned = cloneJsonValue<DashboardJsonObject>(value, options);
  if (!cloned.ok || !cloned.value || Array.isArray(cloned.value) || typeof cloned.value !== "object") {
    return {
      ok: false,
      value: {},
      diagnostics: cloned.diagnostics.length > 0
        ? cloned.diagnostics
        : [unsafeDiagnostic(options.path || "$", "Expected a JSON-safe object.")]
    };
  }
  return { ok: true, value: cloned.value, diagnostics: cloned.diagnostics };
};

export const mergeJsonObjects = (
  ...objects: Array<DashboardJsonObject | undefined>
): DashboardJsonObject => {
  const out: DashboardJsonObject = {};
  objects.forEach(object => {
    if (!object) return;
    Object.keys(object).forEach(key => {
      out[key] = object[key];
    });
  });
  return out;
};

export const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

export const stableDiagnostics = (
  diagnostics: WidgetRegistryDiagnostic[]
): WidgetRegistryDiagnostic[] =>
  diagnostics.slice().sort((a, b) =>
    `${a.code}:${a.path || ""}:${a.type || ""}:${a.itemId || ""}:${a.fieldId || ""}`
      .localeCompare(`${b.code}:${b.path || ""}:${b.type || ""}:${b.itemId || ""}:${b.fieldId || ""}`)
  );

export const diagnosticsHaveErrors = (diagnostics: WidgetRegistryDiagnostic[]): boolean =>
  diagnostics.some(item => item.level === "error");
