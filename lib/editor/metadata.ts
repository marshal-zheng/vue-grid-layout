import type { Layout, LayoutItem } from "../utils";
import type {
  GridEditorItemMeta,
  GridEditorMetaById,
  GridEditorMetadataPatch,
  GridEditorResolvedCapability
} from "./types";

export type GridEditorMetaValidationIssue = {
  code:
    | "invalid-root"
    | "invalid-id"
    | "unsafe-key"
    | "invalid-field"
    | "non-json-value"
    | "orphan-meta";
  path: string;
  message: string;
};

export type GridEditorMetaValidationResult = {
  ok: boolean;
  value: GridEditorMetaById;
  errors: GridEditorMetaValidationIssue[];
  warnings: GridEditorMetaValidationIssue[];
};

export type NormalizeEditorMetaOptions = {
  layout?: Layout;
  removeOrphans?: boolean;
};

export type ResolveEditorCapabilityOptions = {
  isDraggable?: boolean;
  isResizable?: boolean;
  isBounded?: boolean;
  defaultDeletable?: boolean;
  defaultDuplicatable?: boolean;
  defaultCopyable?: boolean;
};

const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const META_BOOLEAN_FIELDS: Array<keyof GridEditorItemMeta> = [
  "locked",
  "visible",
  "editable",
  "draggable",
  "resizable",
  "deletable",
  "duplicatable",
  "copyable"
];

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isSafeKey = (key: string): boolean => !RESERVED_KEYS.has(key);

const isJsonSafeValue = (
  value: unknown,
  path: string,
  issues: GridEditorMetaValidationIssue[]
): boolean => {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      issues.push({
        code: "non-json-value",
        path,
        message: "Metadata numbers must be finite."
      });
      return false;
    }
    return true;
  }

  if (Array.isArray(value)) {
    let ok = true;
    for (let i = 0; i < value.length; i++) {
      ok = isJsonSafeValue(value[i], `${path}[${i}]`, issues) && ok;
    }
    return ok;
  }

  if (isPlainRecord(value)) {
    let ok = true;
    Object.keys(value).forEach(key => {
      if (!isSafeKey(key)) {
        issues.push({
          code: "unsafe-key",
          path: `${path}.${key}`,
          message: "Metadata contains a reserved key."
        });
        ok = false;
        return;
      }
      ok = isJsonSafeValue(value[key], `${path}.${key}`, issues) && ok;
    });
    return ok;
  }

  issues.push({
    code: "non-json-value",
    path,
    message: "Metadata must contain JSON-safe values only."
  });
  return false;
};

const sanitizeItemMeta = (
  input: unknown,
  id: string,
  issues: GridEditorMetaValidationIssue[]
): GridEditorItemMeta | null => {
  const path = `editorMetaById.${id}`;
  if (!isPlainRecord(input)) {
    issues.push({
      code: "invalid-field",
      path,
      message: "Item metadata must be a plain object."
    });
    return null;
  }

  const meta: GridEditorItemMeta = {};
  META_BOOLEAN_FIELDS.forEach(field => {
    const raw = input[field];
    if (typeof raw === "undefined") return;
    if (typeof raw !== "boolean") {
      issues.push({
        code: "invalid-field",
        path: `${path}.${String(field)}`,
        message: "Editor capability metadata fields must be boolean."
      });
      return;
    }
    (meta as Record<string, unknown>)[field] = raw;
  });

  if (typeof input.label !== "undefined") {
    if (typeof input.label === "string") {
      meta.label = input.label;
    } else {
      issues.push({
        code: "invalid-field",
        path: `${path}.label`,
        message: "Editor metadata label must be a string."
      });
    }
  }

  if (typeof input.data !== "undefined") {
    if (isPlainRecord(input.data) && isJsonSafeValue(input.data, `${path}.data`, issues)) {
      meta.data = { ...input.data };
    } else if (!isPlainRecord(input.data)) {
      issues.push({
        code: "invalid-field",
        path: `${path}.data`,
        message: "Editor metadata data must be a JSON-safe object."
      });
    }
  }

  return meta;
};

export const validateEditorMetaById = (
  input: unknown,
  options: NormalizeEditorMetaOptions = {}
): GridEditorMetaValidationResult => {
  const errors: GridEditorMetaValidationIssue[] = [];
  const warnings: GridEditorMetaValidationIssue[] = [];
  const value: GridEditorMetaById = {};

  if (input == null) {
    return { ok: true, value, errors, warnings };
  }

  if (!isPlainRecord(input)) {
    errors.push({
      code: "invalid-root",
      path: "editorMetaById",
      message: "Editor metadata must be a plain object keyed by item id."
    });
    return { ok: false, value, errors, warnings };
  }

  const validIds = options.layout
    ? new Set(options.layout.map(item => item.i))
    : null;

  Object.keys(input).forEach(id => {
    if (!isSafeKey(id) || typeof id !== "string" || id.length === 0) {
      errors.push({
        code: isSafeKey(id) ? "invalid-id" : "unsafe-key",
        path: `editorMetaById.${id}`,
        message: "Editor metadata id must be a safe non-empty string."
      });
      return;
    }

    if (validIds && !validIds.has(id)) {
      const issue = {
        code: "orphan-meta" as const,
        path: `editorMetaById.${id}`,
        message: "Editor metadata references an item that is not in layout."
      };
      if (options.removeOrphans !== false) {
        warnings.push(issue);
        return;
      }
      errors.push(issue);
      return;
    }

    const meta = sanitizeItemMeta(input[id], id, errors);
    if (meta) value[id] = meta;
  });

  return {
    ok: errors.length === 0,
    value,
    errors,
    warnings
  };
};

export const sanitizeEditorMetaById = (
  input: unknown,
  options: NormalizeEditorMetaOptions = {}
): GridEditorMetaById => validateEditorMetaById(input, options).value;

export const normalizeEditorMetaById = sanitizeEditorMetaById;

export const removeOrphanEditorMeta = (
  metaById: GridEditorMetaById,
  layout: Layout
): GridEditorMetaById => sanitizeEditorMetaById(metaById, { layout });

export const createEditorMetadataPatch = (
  id: string,
  previous: GridEditorItemMeta | undefined,
  next: GridEditorItemMeta | undefined
): GridEditorMetadataPatch | null => {
  if (next) return { type: "set", id, previous, next };
  if (previous) return { type: "remove", id, previous };
  return null;
};

export const applyEditorMetadataPatches = (
  metaById: GridEditorMetaById,
  patches: GridEditorMetadataPatch[]
): GridEditorMetaById => {
  if (patches.length === 0) return metaById;
  const next: GridEditorMetaById = { ...metaById };
  patches.forEach(patch => {
    if (patch.type === "remove") {
      delete next[patch.id];
      return;
    }
    next[patch.id] = { ...patch.next };
  });
  return next;
};

export const patchEditorMeta = (
  metaById: GridEditorMetaById,
  id: string,
  patch: Partial<GridEditorItemMeta> | null
): { metaById: GridEditorMetaById; patch: GridEditorMetadataPatch | null } => {
  const previous = metaById[id];
  const nextMeta = patch == null
    ? undefined
    : sanitizeItemMeta({ ...(previous || {}), ...patch }, id, []) || {};
  const metadataPatch = createEditorMetadataPatch(id, previous, nextMeta);
  return {
    metaById: metadataPatch
      ? applyEditorMetadataPatches(metaById, [metadataPatch])
      : metaById,
    patch: metadataPatch
  };
};

export const isEditorItemVisible = (
  metaById: GridEditorMetaById,
  id: string
): boolean => metaById[id]?.visible !== false;

export const getVisibleLayout = (
  layout: Layout,
  metaById: GridEditorMetaById
): Layout => layout.filter(item => isEditorItemVisible(metaById, item.i));

export const resolveEditorItemCapability = (
  item: LayoutItem,
  meta: GridEditorItemMeta | undefined,
  options: ResolveEditorCapabilityOptions = {}
): GridEditorResolvedCapability => {
  const locked = meta?.locked === true;
  const visible = meta?.visible !== false;
  const layoutStatic = item.static === true;
  const layoutDraggable = typeof item.isDraggable === "boolean"
    ? item.isDraggable
    : !layoutStatic && options.isDraggable !== false;
  const layoutResizable = typeof item.isResizable === "boolean"
    ? item.isResizable
    : !layoutStatic && options.isResizable !== false;
  const editable = !locked && meta?.editable !== false && !layoutStatic;
  const draggable = editable && meta?.draggable !== false && layoutDraggable;
  const resizable = editable && meta?.resizable !== false && layoutResizable;
  const bounded = item.isBounded !== false && options.isBounded !== false;
  const deletable = editable && meta?.deletable !== false && options.defaultDeletable !== false;
  const duplicatable = editable && meta?.duplicatable !== false && options.defaultDuplicatable !== false;
  const copyable = visible && meta?.copyable !== false && options.defaultCopyable !== false;

  return {
    id: item.i,
    locked,
    visible,
    editable,
    draggable,
    resizable,
    bounded,
    deletable,
    duplicatable,
    copyable,
    resizeHandles: item.resizeHandles,
    source: {
      layoutStatic,
      layoutDraggable,
      layoutResizable,
      layoutBounded: item.isBounded,
      metaLocked: meta?.locked,
      metaVisible: meta?.visible,
      metaEditable: meta?.editable
    }
  };
};

export const resolveEditorCapabilities = (
  layout: Layout,
  metaById: GridEditorMetaById,
  options: ResolveEditorCapabilityOptions = {}
): Record<string, GridEditorResolvedCapability> => {
  const capabilities: Record<string, GridEditorResolvedCapability> = {};
  layout.forEach(item => {
    capabilities[item.i] = resolveEditorItemCapability(item, metaById[item.i], options);
  });
  return capabilities;
};

export const hasUnsafeEditorMetaKeys = (input: unknown): boolean => {
  if (!input || typeof input !== "object") return false;
  if (Array.isArray(input)) return input.some(hasUnsafeEditorMetaKeys);
  if (!isPlainRecord(input)) return false;
  return Object.keys(input).some(key => {
    if (RESERVED_KEYS.has(key)) return true;
    return hasUnsafeEditorMetaKeys(input[key]);
  });
};

export const hasEditorMeta = (
  metaById: GridEditorMetaById,
  id: string,
  key: keyof GridEditorItemMeta
): boolean => Boolean(metaById[id] && hasOwn(metaById[id], String(key)));
