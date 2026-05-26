import { validateEditorMetaById } from "./editor/metadata";
import { normalizeGridEditorSectionRows } from "./editor/sectionRows";
import type {
  GridEditorMetaById,
  GridEditorResolvedSectionRowState,
  GridEditorSectionRowState
} from "./editor/types";
import {
  resolveGridItemCapability,
  type GridItemPhysicalCapabilityInput,
  type ResolvedGridItemCapability,
  type GridItemAspectRatioConstraint,
  type GridItemCapabilityDiagnostic
} from "./item-capabilities";
import type { Layout, LayoutItem, ResizeHandleAxis } from "./utils";
import type { LayoutValidationMode, MaybePromise } from "./persistence";
import type { GridHeightMode, GridRenderPrecision } from "./grid-height";

export const DASHBOARD_SCHEMA_VERSION = 1;

export type DashboardJsonPrimitive = string | number | boolean | null;
export type DashboardJsonValue =
  | DashboardJsonPrimitive
  | DashboardJsonObject
  | DashboardJsonValue[];
export type DashboardJsonObject = { [key: string]: DashboardJsonValue };
export type DashboardDocumentMeta = DashboardJsonObject;

export type DashboardDiagnosticLevel = "info" | "warning" | "error";
export type DashboardDocumentWriteBackOwner = "component" | "shell";

export type DashboardDiagnostic = {
  code: string;
  level: DashboardDiagnosticLevel;
  message: string;
  path?: string;
  itemId?: string;
  profileId?: string;
  layoutId?: string;
  targetView?: "desktop" | "mobile";
  details?: unknown;
};

export type DashboardLayoutDocument = {
  dashboardSchemaVersion: number;
  kind: "dashboard-layout";
  key: string;
  revision: string;
  sourceId: string;
  savedAt: string;
  primaryLayoutId: string;
  layouts: Record<string, DashboardLayoutDefinition>;
  meta?: DashboardDocumentMeta;
  [key: string]: unknown;
};

export type DashboardLayoutDefinition = {
  widgets: Record<string, DashboardItemLayout>;
  gridSettings?: DashboardGridSettings;
  profiles?: Record<string, DashboardBreakpointProfile>;
  editor?: DashboardEditorEnvelope;
  extensions?: DashboardJsonObject;
  [key: string]: unknown;
};

export type DashboardBreakpointProfile = {
  widgets?: Record<string, DashboardItemLayoutOverride>;
  gridSettings?: DashboardGridSettings;
  editor?: DashboardEditorEnvelope;
  extensions?: DashboardJsonObject;
  [key: string]: unknown;
};

export type DashboardItemLayout = {
  col: number;
  row: number;
  sizeX: number;
  sizeY: number;
  minSizeX?: number;
  minSizeY?: number;
  maxSizeX?: number;
  maxSizeY?: number;
  static?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  bounded?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  desktopHide?: boolean;
  mobileHide?: boolean;
  mobileHeight?: number;
  mobileOrder?: number;
  preserveAspectRatio?: boolean;
  aspectRatio?: number;
  extensions?: DashboardJsonObject;
  [key: string]: unknown;
};

export type DashboardItemLayoutOverride = Partial<DashboardItemLayout> & {
  extensions?: DashboardJsonObject;
  [key: string]: unknown;
};

export type DashboardGridSettings = {
  columns?: number;
  minColumns?: number;
  margin?: number | [number, number];
  outerMargin?: boolean;
  containerPadding?: [number, number];
  viewFormat?: "grid" | "list";
  rowHeight?: number;
  autoFillHeight?: boolean;
  heightMode?: GridHeightMode;
  mobileHeightMode?: GridHeightMode;
  minRowHeight?: number;
  renderPrecision?: GridRenderPrecision;
  mobileRowHeight?: number;
  mobileAutoFillHeight?: boolean;
  mobileDisplayLayoutFirst?: boolean;
  layoutDimension?: {
    type?: "percentage" | "fixed";
    fixedWidth?: number;
    fixedLayout?: string;
    leftWidthPercentage?: number;
    [key: string]: unknown;
  };
  backgroundColor?: string;
  backgroundSizeMode?: string;
  backgroundImageUrl?: string;
  extensions?: DashboardJsonObject;
  [key: string]: unknown;
};

export type ResolvedDashboardGridSettings = DashboardGridSettings & {
  columns: number;
  minColumns: number;
  margin: number | [number, number];
  outerMargin: boolean;
  viewFormat: "grid" | "list";
  rowHeight: number;
  autoFillHeight: boolean;
  heightMode?: GridHeightMode;
  mobileHeightMode?: GridHeightMode;
  minRowHeight?: number;
  renderPrecision: GridRenderPrecision;
};

export type DashboardEditorEnvelope = {
  version: number;
  editorMetaById?: GridEditorMetaById;
  sectionRows?: GridEditorSectionRowState;
  updatedAt?: string;
  extensions?: DashboardJsonObject;
  [key: string]: unknown;
};

export type DashboardMigration = (
  document: unknown,
  context: { fromVersion: number; toVersion: number }
) => unknown;

export type DashboardMigrationMap = Record<number, DashboardMigration>;
export type DashboardMigrationEvent = { fromVersion: number; toVersion: number };

export type DashboardErrorCode =
  | "invalid-json"
  | "invalid-document"
  | "validation"
  | "migration-missing"
  | "migration-failed"
  | "unknown-item";

export type DashboardDocumentError = {
  code: DashboardErrorCode;
  message: string;
  path?: string;
  recoverable?: boolean;
  details?: unknown;
  cause?: unknown;
  originalPayload?: unknown;
};

export type DashboardValidationResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      warnings: DashboardDiagnostic[];
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      originalPayload: unknown;
      warnings: DashboardDiagnostic[];
      diagnostics: DashboardDiagnostic[];
      document?: never;
    };

export type SerializeDashboardLayoutOptions = {
  key: string;
  sourceId?: string;
  meta?: DashboardDocumentMeta;
  now?: () => Date;
  revision?: () => string;
};

export type DeserializeDashboardLayoutOptions = {
  currentVersion?: number;
  migrations?: DashboardMigrationMap;
  validation?: LayoutValidationMode;
  fallback?: DashboardLayoutDocument;
};

export type DashboardDeserializeResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      migrations: DashboardMigrationEvent[];
      warnings: DashboardDiagnostic[];
      diagnostics: DashboardDiagnostic[];
      fallback?: never;
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      fallback?: DashboardLayoutDocument;
      originalPayload: unknown;
      migrations: DashboardMigrationEvent[];
      warnings: DashboardDiagnostic[];
      diagnostics: DashboardDiagnostic[];
      document?: never;
    };

export type DashboardMigrationResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      migrations: DashboardMigrationEvent[];
      originalPayload: unknown;
      warnings: DashboardDiagnostic[];
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      originalPayload: unknown;
      migrations: DashboardMigrationEvent[];
      warnings: DashboardDiagnostic[];
      diagnostics: DashboardDiagnostic[];
      document?: never;
    };

export type ProjectDashboardLayoutOptions = {
  layoutId?: string;
  profileId?: string;
  targetView?: "desktop" | "mobile";
  validation?: LayoutValidationMode;
  allowNonPrimary?: boolean;
};

export type DashboardGridRuntimeProjection = {
  layout: Layout;
  gridSettings: ResolvedDashboardGridSettings;
  editorMetaById: GridEditorMetaById;
  capabilitiesById?: Record<string, ResolvedGridItemCapability>;
  resizeConstraintsById?: Record<string, GridItemAspectRatioConstraint>;
  layoutId: string;
  profileId: string | null;
  fallbackApplied: boolean;
  diagnostics: DashboardDiagnostic[];
};

export type DashboardProjectionResult =
  | {
      ok: true;
      projection: DashboardGridRuntimeProjection;
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      originalPayload: unknown;
      diagnostics: DashboardDiagnostic[];
      projection?: never;
    };

export type WriteDashboardRuntimeOptions = {
  layoutId?: string;
  profileId?: string;
  targetView?: "desktop" | "mobile";
  editorMetaById?: GridEditorMetaById;
  sectionRows?: GridEditorSectionRowState;
  writeItemIds?: string[];
  createMissingItems?: boolean;
  removeMissingItems?: boolean;
  createMissingProfile?: boolean;
  validation?: LayoutValidationMode;
};

export type DashboardWriteResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      document: DashboardLayoutDocument;
      originalPayload?: unknown;
      diagnostics: DashboardDiagnostic[];
    };

export type DashboardPersistenceExternalChange = {
  key: string;
  source: "storage" | "adapter";
  raw?: unknown;
  oldRaw?: unknown;
  document?: unknown;
  localDocument?: DashboardLayoutDocument;
  externalDocument?: DashboardLayoutDocument;
  diagnostics?: DashboardDiagnostic[];
  sourceId?: string;
};

export type DashboardPersistenceAdapter = {
  load: (key: string) => MaybePromise<unknown>;
  save: (key: string, document: DashboardLayoutDocument) => MaybePromise<void>;
  remove: (key: string) => MaybePromise<void>;
  subscribe?: (
    key: string,
    callback: (event: DashboardPersistenceExternalChange) => void
  ) => () => void;
};

export type DashboardPersistenceLoadResult = {
  ok: boolean;
  found: boolean;
  document?: DashboardLayoutDocument;
  error?: DashboardDocumentError;
  fallbackApplied?: boolean;
  migrations: DashboardMigrationEvent[];
  warnings: DashboardDiagnostic[];
  diagnostics: DashboardDiagnostic[];
};

export type DashboardPersistenceSaveResult = {
  ok: boolean;
  document?: DashboardLayoutDocument;
  error?: DashboardDocumentError;
  diagnostics: DashboardDiagnostic[];
};

export type DashboardPersistenceRemoveResult = {
  ok: boolean;
  error?: DashboardDocumentError;
  diagnostics: DashboardDiagnostic[];
};

export type DashboardPersistenceConflictDiagnostic = DashboardDiagnostic & {
  code: "dashboard-conflict";
  localDocument?: DashboardLayoutDocument;
  externalDocument?: DashboardLayoutDocument;
};

export type ThingsBoardDashboardLayoutLike = {
  widgets?: Record<string, unknown>;
  gridSettings?: Record<string, unknown>;
  breakpoints?: Record<string, unknown>;
  [key: string]: unknown;
};

export type DashboardImportResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      originalPayload: unknown;
      diagnostics: DashboardDiagnostic[];
      document?: never;
    };

export type DashboardExportResult =
  | {
      ok: true;
      value: ThingsBoardDashboardLayoutLike;
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      diagnostics: DashboardDiagnostic[];
      value?: never;
    };

type CloneResult =
  | { ok: true; value: unknown; diagnostics: DashboardDiagnostic[] }
  | { ok: false; diagnostics: DashboardDiagnostic[] };

const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const VALID_RESIZE_HANDLES: ResizeHandleAxis[] = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
const DASHBOARD_ITEM_RUNTIME_UNSUPPORTED_FIELDS = [
  "desktopHide",
  "mobileHide",
  "mobileHeight",
  "mobileOrder"
];
const DASHBOARD_ITEM_RUNTIME_SIDECAR_FIELDS = [
  "preserveAspectRatio",
  "aspectRatio"
];
const DASHBOARD_CAPABILITY_SOURCE_FIELDS = [
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "preserveAspectRatio",
  "aspectRatio"
];
const THINGSBOARD_WIDGET_LAYOUT_FIELDS = [
  "col",
  "row",
  "sizeX",
  "sizeY",
  "minSizeX",
  "minSizeY",
  "maxSizeX",
  "maxSizeY",
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "desktopHide",
  "mobileHide",
  "mobileHeight",
  "mobileOrder",
  "preserveAspectRatio",
  "aspectRatio"
];
const THINGSBOARD_GRID_SETTINGS_FIELDS = [
  "columns",
  "minColumns",
  "margin",
  "outerMargin",
  "containerPadding",
  "viewFormat",
  "rowHeight",
  "autoFillHeight",
  "heightMode",
  "mobileHeightMode",
  "minRowHeight",
  "renderPrecision",
  "mobileRowHeight",
  "mobileAutoFillHeight",
  "mobileDisplayLayoutFirst",
  "layoutDimension",
  "backgroundColor",
  "backgroundSizeMode",
  "backgroundImageUrl"
];
const THINGSBOARD_DASHBOARD_LAYOUT_FIELDS = [
  "widgets",
  "gridSettings",
  "breakpoints"
];
const THINGSBOARD_BREAKPOINT_FIELDS = [
  "widgetLayouts",
  "widgets",
  "gridSettings"
];

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isJsonObject = (value: unknown): value is DashboardJsonObject =>
  isPlainRecord(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveInteger = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) > 0;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const isValidDateString = (value: string): boolean => {
  const time = Date.parse(value);
  return Number.isFinite(time);
};

const isResizeHandleAxis = (value: unknown): value is ResizeHandleAxis =>
  typeof value === "string" && VALID_RESIZE_HANDLES.indexOf(value as ResizeHandleAxis) !== -1;

const isGridHeightMode = (value: unknown): value is GridHeightMode =>
  value === "auto" || value === "scroll" || value === "fit" || value === "fixed";

const isGridRenderPrecision = (value: unknown): value is GridRenderPrecision =>
  value === "integer" || value === "subpixel";

const diagnostic = (
  code: string,
  level: DashboardDiagnosticLevel,
  message: string,
  extra: Omit<DashboardDiagnostic, "code" | "level" | "message"> = {}
): DashboardDiagnostic => ({
  code,
  level,
  message,
  ...extra
});

const createDashboardError = (
  code: DashboardErrorCode,
  message: string,
  extra: Partial<DashboardDocumentError> = {}
): DashboardDocumentError => ({
  code,
  message,
  ...extra
});

const cloneDashboardError = (
  message: string,
  diagnostics: DashboardDiagnostic[]
): DashboardDocumentError => {
  const first = diagnostics.find(item => item.level === "error");
  return createDashboardError("validation", message, {
    path: first?.path,
    details: diagnostics
  });
};

const cloneJsonSafeValue = (
  value: unknown,
  mode: LayoutValidationMode,
  path: string,
  seen: unknown[] = []
): CloneResult => {
  const diagnostics: DashboardDiagnostic[] = [];
  const fail = (message: string): CloneResult => {
    diagnostics.push(diagnostic("non-json-extension", "error", message, { path }));
    if (mode === "sanitize") {
      diagnostics[diagnostics.length - 1].level = "warning";
      return { ok: true, value: undefined, diagnostics };
    }
    return { ok: false, diagnostics };
  };

  if (value == null || typeof value === "string" || typeof value === "boolean") {
    return { ok: true, value, diagnostics };
  }
  if (typeof value === "number") {
    if (Number.isFinite(value)) return { ok: true, value, diagnostics };
    return fail("Dashboard JSON fields must not contain non-finite numbers.");
  }
  if (typeof value === "bigint" || typeof value === "function" || typeof value === "symbol") {
    return fail("Dashboard JSON fields must not contain runtime values.");
  }
  if (Array.isArray(value)) {
    if (seen.indexOf(value) !== -1) return fail("Dashboard JSON fields must not contain circular references.");
    const out: unknown[] = [];
    const nextSeen = seen.concat(value);
    for (let index = 0; index < value.length; index++) {
      const cloned = cloneJsonSafeValue(value[index], mode, `${path}[${index}]`, nextSeen);
      diagnostics.push(...cloned.diagnostics);
      if (!cloned.ok) return { ok: false, diagnostics };
      out.push(typeof cloned.value === "undefined" ? null : cloned.value);
    }
    return { ok: true, value: out, diagnostics };
  }
  if (!isPlainRecord(value)) {
    return fail("Dashboard JSON fields must contain plain JSON objects only.");
  }
  if (seen.indexOf(value) !== -1) return fail("Dashboard JSON fields must not contain circular references.");

  const out: Record<string, unknown> = {};
  const nextSeen = seen.concat(value);
  for (const key of Object.keys(value)) {
    if (RESERVED_KEYS.has(key)) {
      const issue = diagnostic("unsafe-key", mode === "sanitize" ? "warning" : "error", "Dashboard JSON fields contain a reserved key.", {
        path: `${path}.${key}`
      });
      diagnostics.push(issue);
      if (mode !== "sanitize") return { ok: false, diagnostics };
      continue;
    }
    const cloned = cloneJsonSafeValue(value[key], mode, path ? `${path}.${key}` : key, nextSeen);
    diagnostics.push(...cloned.diagnostics);
    if (!cloned.ok) return { ok: false, diagnostics };
    if (typeof cloned.value !== "undefined") out[key] = cloned.value;
  }

  return { ok: true, value: out, diagnostics };
};

const cloneJsonObject = (
  value: unknown,
  mode: LayoutValidationMode,
  path: string
): { ok: true; value: DashboardJsonObject; diagnostics: DashboardDiagnostic[] } | { ok: false; diagnostics: DashboardDiagnostic[] } => {
  const cloned = cloneJsonSafeValue(value, mode, path);
  if (!cloned.ok) return cloned;
  if (!isJsonObject(cloned.value)) {
    const issue = diagnostic("non-json-extension", mode === "sanitize" ? "warning" : "error", "Dashboard field must be a JSON-safe object.", { path });
    if (mode === "sanitize") return { ok: true, value: {}, diagnostics: cloned.diagnostics.concat(issue) };
    return { ok: false, diagnostics: cloned.diagnostics.concat(issue) };
  }
  return { ok: true, value: cloned.value, diagnostics: cloned.diagnostics };
};

export const cloneDashboardJsonValue = <T extends DashboardJsonValue>(
  value: T,
  options: { validation?: LayoutValidationMode } = {}
): T => {
  const cloned = cloneJsonSafeValue(value, options.validation ?? "strict", "value");
  if (!cloned.ok) throw cloneDashboardError("Dashboard JSON value could not be cloned.", cloned.diagnostics);
  return cloned.value as T;
};

const cloneDashboardDocument = (
  document: DashboardLayoutDocument,
  mode: LayoutValidationMode = "strict"
): DashboardLayoutDocument => {
  const cloned = cloneJsonSafeValue(document, mode, "document");
  if (!cloned.ok) throw cloneDashboardError("Dashboard document could not be cloned.", cloned.diagnostics);
  return cloned.value as DashboardLayoutDocument;
};

const createSourceId = (): string => {
  const cryptoLike = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoLike && typeof cryptoLike.randomUUID === "function") {
    return cryptoLike.randomUUID();
  }
  return `dashboard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const createRevision = (): string =>
  `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const parsePayload = (
  payload: unknown
): { ok: true; value: unknown } | { ok: false; error: DashboardDocumentError } => {
  if (typeof payload !== "string") return { ok: true, value: payload };
  try {
    return { ok: true, value: JSON.parse(payload) };
  } catch (cause) {
    return {
      ok: false,
      error: createDashboardError("invalid-json", "Dashboard persistence payload is not valid JSON.", { cause })
    };
  }
};

const copyDefined = (
  target: Record<string, unknown>,
  key: string,
  value: unknown
) => {
  if (typeof value !== "undefined") target[key] = value;
};

const normalizeNumberField = (
  raw: Record<string, unknown>,
  out: Record<string, unknown>,
  key: string,
  path: string,
  mode: LayoutValidationMode,
  options: { required?: boolean; min?: number; clampMin?: number } = {}
): DashboardDiagnostic | null => {
  const value = raw[key];
  if (typeof value === "undefined") {
    if (!options.required) return null;
    return diagnostic("invalid-item-geometry", "error", `${path}.${key} is required.`, { path: `${path}.${key}` });
  }
  if (!isFiniteNumber(value)) {
    return diagnostic("invalid-item-geometry", "error", `${path}.${key} must be a finite number.`, { path: `${path}.${key}` });
  }
  if (typeof options.min === "number" && value < options.min) {
    if (mode === "sanitize" && typeof options.clampMin === "number") {
      out[key] = Math.max(options.clampMin, value);
      return diagnostic("invalid-item-geometry", "warning", `Clamped ${path}.${key}.`, { path: `${path}.${key}` });
    }
    return diagnostic("invalid-item-geometry", "error", `${path}.${key} is outside the supported range.`, { path: `${path}.${key}` });
  }
  out[key] = value;
  return null;
};

const normalizePositiveNumber = (
  raw: Record<string, unknown>,
  out: Record<string, unknown>,
  key: string,
  path: string,
  mode: LayoutValidationMode
): DashboardDiagnostic | null => {
  const value = raw[key];
  if (typeof value === "undefined") return null;
  if (!isFiniteNumber(value) || value <= 0) {
    if (mode === "sanitize") {
      delete out[key];
      return diagnostic("item-field-dropped", "warning", `Dropped invalid ${key}.`, { path: `${path}.${key}` });
    }
    return diagnostic("validation", "error", `${path}.${key} must be a finite positive number.`, { path: `${path}.${key}` });
  }
  out[key] = value;
  return null;
};

const normalizeBoolean = (
  raw: Record<string, unknown>,
  out: Record<string, unknown>,
  key: string,
  path: string,
  mode: LayoutValidationMode
): DashboardDiagnostic | null => {
  if (typeof raw[key] === "undefined") return null;
  if (typeof raw[key] !== "boolean") {
    if (mode === "sanitize") {
      delete out[key];
      return diagnostic("item-field-dropped", "warning", `Dropped invalid ${key}.`, { path: `${path}.${key}` });
    }
    return diagnostic("validation", "error", `${path}.${key} must be a boolean.`, { path: `${path}.${key}` });
  }
  out[key] = raw[key];
  return null;
};

const normalizeString = (
  raw: Record<string, unknown>,
  out: Record<string, unknown>,
  key: string,
  path: string,
  mode: LayoutValidationMode
): DashboardDiagnostic | null => {
  if (typeof raw[key] === "undefined") return null;
  if (typeof raw[key] !== "string") {
    if (mode === "sanitize") {
      delete out[key];
      return diagnostic("item-field-dropped", "warning", `Dropped invalid ${key}.`, { path: `${path}.${key}` });
    }
    return diagnostic("validation", "error", `${path}.${key} must be a string.`, { path: `${path}.${key}` });
  }
  out[key] = raw[key];
  return null;
};

const normalizeJsonObjectField = (
  raw: Record<string, unknown>,
  out: Record<string, unknown>,
  key: string,
  path: string,
  mode: LayoutValidationMode
): DashboardDiagnostic[] => {
  if (typeof raw[key] === "undefined") return [];
  const cloned = cloneJsonObject(raw[key], mode, `${path}.${key}`);
  if (!cloned.ok) return cloned.diagnostics;
  out[key] = cloned.value;
  return cloned.diagnostics;
};

const collectIssue = (
  issues: DashboardDiagnostic[],
  issue: DashboardDiagnostic | null
) => {
  if (issue) issues.push(issue);
};

const firstError = (diagnostics: DashboardDiagnostic[]): DashboardDiagnostic | undefined =>
  diagnostics.find(item => item.level === "error");

const normalizeResizeHandles = (
  raw: Record<string, unknown>,
  out: Record<string, unknown>,
  path: string,
  mode: LayoutValidationMode
): DashboardDiagnostic | null => {
  if (typeof raw.resizeHandles === "undefined") return null;
  if (!Array.isArray(raw.resizeHandles)) {
    if (mode === "sanitize") {
      delete out.resizeHandles;
      return diagnostic("item-field-dropped", "warning", "Dropped invalid resizeHandles.", { path: `${path}.resizeHandles` });
    }
    return diagnostic("validation", "error", `${path}.resizeHandles must be an array.`, { path: `${path}.resizeHandles` });
  }
  const handles = raw.resizeHandles.filter(isResizeHandleAxis);
  if (handles.length !== raw.resizeHandles.length && mode !== "sanitize") {
    return diagnostic("validation", "error", `${path}.resizeHandles contains an invalid handle.`, { path: `${path}.resizeHandles` });
  }
  if (handles.length > 0) out.resizeHandles = handles;
  if (handles.length !== raw.resizeHandles.length) {
    return diagnostic("item-field-cleaned", "warning", "Removed invalid resize handle values.", { path: `${path}.resizeHandles` });
  }
  return null;
};

const normalizeDashboardItem = (
  input: unknown,
  path: string,
  mode: LayoutValidationMode,
  requireGeometry: boolean
): { ok: true; item: DashboardItemLayoutOverride; diagnostics: DashboardDiagnostic[] } | { ok: false; diagnostics: DashboardDiagnostic[] } => {
  const cloned = cloneJsonSafeValue(input, mode, path);
  if (!cloned.ok) return { ok: false, diagnostics: cloned.diagnostics };
  if (!isPlainRecord(cloned.value)) {
    return {
      ok: false,
      diagnostics: cloned.diagnostics.concat(diagnostic("validation", "error", `${path} must be an object.`, { path }))
    };
  }

  const raw = cloned.value;
  const item: Record<string, unknown> = { ...raw };
  const diagnostics = cloned.diagnostics.slice();

  collectIssue(diagnostics, normalizeNumberField(raw, item, "col", path, mode, { required: requireGeometry, min: 0, clampMin: 0 }));
  collectIssue(diagnostics, normalizeNumberField(raw, item, "row", path, mode, { required: requireGeometry, min: 0, clampMin: 0 }));
  collectIssue(diagnostics, normalizeNumberField(raw, item, "sizeX", path, mode, { required: requireGeometry, min: 1, clampMin: 1 }));
  collectIssue(diagnostics, normalizeNumberField(raw, item, "sizeY", path, mode, { required: requireGeometry, min: 1, clampMin: 1 }));

  for (const key of ["minSizeX", "minSizeY", "maxSizeX", "maxSizeY", "mobileHeight", "aspectRatio"]) {
    collectIssue(diagnostics, normalizePositiveNumber(raw, item, key, path, mode));
  }
  if (typeof raw.mobileOrder !== "undefined") {
    collectIssue(diagnostics, normalizeNumberField(raw, item, "mobileOrder", path, mode));
  }
  for (const key of ["static", "draggable", "resizable", "bounded", "desktopHide", "mobileHide", "preserveAspectRatio"]) {
    collectIssue(diagnostics, normalizeBoolean(raw, item, key, path, mode));
  }
  collectIssue(diagnostics, normalizeResizeHandles(raw, item, path, mode));
  diagnostics.push(...normalizeJsonObjectField(raw, item, "extensions", path, mode));

  const error = firstError(diagnostics);
  if (error) return { ok: false, diagnostics };
  return { ok: true, item: item as DashboardItemLayoutOverride, diagnostics };
};

const normalizeTuple = (
  value: unknown,
  path: string,
  mode: LayoutValidationMode
): { ok: true; value?: [number, number]; diagnostics: DashboardDiagnostic[] } | { ok: false; diagnostics: DashboardDiagnostic[] } => {
  if (!Array.isArray(value) || value.length !== 2 || !isFiniteNumber(value[0]) || !isFiniteNumber(value[1])) {
    const issue = diagnostic("validation", mode === "sanitize" ? "warning" : "error", `${path} must be a two-number tuple.`, { path });
    return mode === "sanitize" ? { ok: true, diagnostics: [issue] } : { ok: false, diagnostics: [issue] };
  }
  return { ok: true, value: [value[0], value[1]], diagnostics: [] };
};

const normalizeGridSettings = (
  input: unknown,
  path: string,
  mode: LayoutValidationMode
): { ok: true; settings?: DashboardGridSettings; diagnostics: DashboardDiagnostic[] } | { ok: false; diagnostics: DashboardDiagnostic[] } => {
  if (typeof input === "undefined") return { ok: true, settings: undefined, diagnostics: [] };
  const cloned = cloneJsonSafeValue(input, mode, path);
  if (!cloned.ok) return { ok: false, diagnostics: cloned.diagnostics };
  if (!isPlainRecord(cloned.value)) {
    const issue = diagnostic("validation", mode === "sanitize" ? "warning" : "error", `${path} must be an object.`, { path });
    return mode === "sanitize" ? { ok: true, diagnostics: cloned.diagnostics.concat(issue) } : { ok: false, diagnostics: cloned.diagnostics.concat(issue) };
  }
  const raw = cloned.value;
  const out: Record<string, unknown> = { ...raw };
  const diagnostics = cloned.diagnostics.slice();

  for (const key of ["columns", "minColumns", "rowHeight", "mobileRowHeight", "minRowHeight"]) {
    collectIssue(diagnostics, normalizePositiveNumber(raw, out, key, path, mode));
  }
  for (const key of ["outerMargin", "autoFillHeight", "mobileAutoFillHeight", "mobileDisplayLayoutFirst"]) {
    collectIssue(diagnostics, normalizeBoolean(raw, out, key, path, mode));
  }
  for (const key of ["backgroundColor", "backgroundSizeMode", "backgroundImageUrl"]) {
    collectIssue(diagnostics, normalizeString(raw, out, key, path, mode));
  }

  if (typeof raw.margin !== "undefined") {
    if (isFiniteNumber(raw.margin)) {
      out.margin = raw.margin;
    } else {
      const tuple = normalizeTuple(raw.margin, `${path}.margin`, mode);
      diagnostics.push(...tuple.diagnostics);
      if (!tuple.ok) return { ok: false, diagnostics };
      if (tuple.value) out.margin = tuple.value;
      else delete out.margin;
    }
  }
  if (typeof raw.containerPadding !== "undefined") {
    const tuple = normalizeTuple(raw.containerPadding, `${path}.containerPadding`, mode);
    diagnostics.push(...tuple.diagnostics);
    if (!tuple.ok) return { ok: false, diagnostics };
    if (tuple.value) out.containerPadding = tuple.value;
    else delete out.containerPadding;
  }
  if (typeof raw.viewFormat !== "undefined") {
    if (raw.viewFormat !== "grid" && raw.viewFormat !== "list") {
      if (mode === "sanitize") {
        diagnostics.push(diagnostic("item-field-dropped", "warning", "Dropped invalid viewFormat.", { path: `${path}.viewFormat` }));
        delete out.viewFormat;
      } else {
        diagnostics.push(diagnostic("validation", "error", `${path}.viewFormat must be "grid" or "list".`, { path: `${path}.viewFormat` }));
      }
    }
  }
  for (const key of ["heightMode", "mobileHeightMode"]) {
    if (typeof raw[key] !== "undefined" && !isGridHeightMode(raw[key])) {
      if (mode === "sanitize") {
        diagnostics.push(diagnostic("item-field-dropped", "warning", `Dropped invalid ${key}.`, { path: `${path}.${key}` }));
        delete out[key];
      } else {
        diagnostics.push(diagnostic("validation", "error", `${path}.${key} must be "auto", "scroll", "fit", or "fixed".`, { path: `${path}.${key}` }));
      }
    }
  }
  if (typeof raw.renderPrecision !== "undefined" && !isGridRenderPrecision(raw.renderPrecision)) {
    if (mode === "sanitize") {
      diagnostics.push(diagnostic("item-field-dropped", "warning", "Dropped invalid renderPrecision.", { path: `${path}.renderPrecision` }));
      delete out.renderPrecision;
    } else {
      diagnostics.push(diagnostic("validation", "error", `${path}.renderPrecision must be "integer" or "subpixel".`, { path: `${path}.renderPrecision` }));
    }
  }
  if (typeof raw.layoutDimension !== "undefined") {
    if (!isPlainRecord(raw.layoutDimension)) {
      if (mode === "sanitize") {
        diagnostics.push(diagnostic("item-field-dropped", "warning", "Dropped invalid layoutDimension.", { path: `${path}.layoutDimension` }));
        delete out.layoutDimension;
      } else {
        diagnostics.push(diagnostic("validation", "error", `${path}.layoutDimension must be an object.`, { path: `${path}.layoutDimension` }));
      }
    } else {
      const layoutDimension = { ...raw.layoutDimension };
      if (
        typeof layoutDimension.type !== "undefined" &&
        layoutDimension.type !== "percentage" &&
        layoutDimension.type !== "fixed"
      ) {
        if (mode === "sanitize") {
          diagnostics.push(diagnostic("item-field-dropped", "warning", "Dropped invalid layoutDimension.type.", { path: `${path}.layoutDimension.type` }));
          delete layoutDimension.type;
        } else {
          diagnostics.push(diagnostic("validation", "error", `${path}.layoutDimension.type is invalid.`, { path: `${path}.layoutDimension.type` }));
        }
      }
      for (const key of ["fixedWidth", "leftWidthPercentage"]) {
        collectIssue(diagnostics, normalizePositiveNumber(layoutDimension, layoutDimension, key, `${path}.layoutDimension`, mode));
      }
      collectIssue(diagnostics, normalizeString(layoutDimension, layoutDimension, "fixedLayout", `${path}.layoutDimension`, mode));
      out.layoutDimension = layoutDimension;
    }
  }

  diagnostics.push(...normalizeJsonObjectField(raw, out, "extensions", path, mode));
  if (firstError(diagnostics)) return { ok: false, diagnostics };
  return { ok: true, settings: out as DashboardGridSettings, diagnostics };
};

const layoutFromWidgetIds = (widgetIds: string[]): Layout =>
  widgetIds.map(id => ({ i: id, x: 0, y: 0, w: 1, h: 1 }));

const sectionRowsFromResolved = (
  rows: GridEditorResolvedSectionRowState
): GridEditorSectionRowState => {
  const membershipIds = new Set(Object.keys(rows.itemMembership));
  return JSON.parse(JSON.stringify({
    version: 1,
    items: Object.keys(rows.items).reduce((acc, id) => {
      const row = rows.items[id];
      acc[id] = {
        ...row,
        itemIds: row.itemIds ? row.itemIds.filter(itemId => membershipIds.has(itemId)) : undefined,
        allowedDropZones: row.allowedDropZones ? row.allowedDropZones.slice() : undefined,
        bounds: row.bounds ? { ...row.bounds } : undefined
      };
      return acc;
    }, {} as GridEditorSectionRowState["items"]),
    itemMembership: rows.itemMembership
  })) as GridEditorSectionRowState;
};

const normalizeEditorEnvelope = (
  input: unknown,
  path: string,
  mode: LayoutValidationMode,
  widgetIds: string[]
): { ok: true; editor?: DashboardEditorEnvelope; diagnostics: DashboardDiagnostic[] } | { ok: false; diagnostics: DashboardDiagnostic[] } => {
  if (typeof input === "undefined") return { ok: true, editor: undefined, diagnostics: [] };
  const cloned = cloneJsonSafeValue(input, mode, path);
  if (!cloned.ok) return { ok: false, diagnostics: cloned.diagnostics };
  if (!isPlainRecord(cloned.value)) {
    const issue = diagnostic("validation", mode === "sanitize" ? "warning" : "error", `${path} must be an object.`, { path });
    return mode === "sanitize" ? { ok: true, diagnostics: cloned.diagnostics.concat(issue) } : { ok: false, diagnostics: cloned.diagnostics.concat(issue) };
  }
  const raw = cloned.value;
  const out: Record<string, unknown> = { ...raw };
  const diagnostics = cloned.diagnostics.slice();
  if (!isPositiveInteger(raw.version)) {
    if (mode === "sanitize") {
      diagnostics.push(diagnostic("item-field-cleaned", "warning", "Defaulted invalid editor version.", { path: `${path}.version` }));
      out.version = 1;
    } else {
      diagnostics.push(diagnostic("validation", "error", `${path}.version must be a positive integer.`, { path: `${path}.version` }));
    }
  }
  if (typeof raw.updatedAt !== "undefined") {
    collectIssue(diagnostics, normalizeString(raw, out, "updatedAt", path, mode));
  }
  if (typeof raw.editorMetaById !== "undefined") {
    const metaValidation = validateEditorMetaById(raw.editorMetaById, {
      layout: layoutFromWidgetIds(widgetIds),
      removeOrphans: true
    });
    metaValidation.warnings.forEach(issue => {
      diagnostics.push(diagnostic(
        issue.code === "orphan-meta" ? "orphan-editor-meta" : issue.code,
        "warning",
        issue.message,
        { path: `${path}.${issue.path}` }
      ));
    });
    metaValidation.errors.forEach(issue => {
      diagnostics.push(diagnostic(
        issue.code,
        mode === "sanitize" ? "warning" : "error",
        issue.message,
        { path: `${path}.${issue.path}` }
      ));
    });
    if (!metaValidation.ok && mode !== "sanitize") return { ok: false, diagnostics };
    out.editorMetaById = metaValidation.value;
  }
  if (typeof raw.sectionRows !== "undefined") {
    const normalizedRows = normalizeGridEditorSectionRows(
      raw.sectionRows as GridEditorSectionRowState,
      layoutFromWidgetIds(widgetIds)
    );
    normalizedRows.warnings.forEach(issue => {
      diagnostics.push(diagnostic(
        issue.code,
        "warning",
        issue.message,
        {
          path: `${path}.sectionRows`,
          details: issue
        }
      ));
    });
    out.sectionRows = sectionRowsFromResolved(normalizedRows);
    out.version = Math.max(Number(out.version) || 1, 2);
  }
  diagnostics.push(...normalizeJsonObjectField(raw, out, "extensions", path, mode));
  if (firstError(diagnostics)) return { ok: false, diagnostics };
  return { ok: true, editor: out as DashboardEditorEnvelope, diagnostics };
};

const normalizeDashboardLayoutDefinition = (
  input: unknown,
  path: string,
  mode: LayoutValidationMode
): { ok: true; layout: DashboardLayoutDefinition; diagnostics: DashboardDiagnostic[] } | { ok: false; diagnostics: DashboardDiagnostic[] } => {
  const cloned = cloneJsonSafeValue(input, mode, path);
  if (!cloned.ok) return { ok: false, diagnostics: cloned.diagnostics };
  if (!isPlainRecord(cloned.value)) {
    return {
      ok: false,
      diagnostics: cloned.diagnostics.concat(diagnostic("validation", "error", `${path} must be an object.`, { path }))
    };
  }
  const raw = cloned.value;
  const out: Record<string, unknown> = { ...raw };
  const diagnostics = cloned.diagnostics.slice();

  if (!isPlainRecord(raw.widgets)) {
    return {
      ok: false,
      diagnostics: diagnostics.concat(diagnostic("validation", "error", `${path}.widgets must be an object map.`, { path: `${path}.widgets` }))
    };
  }

  const widgets: Record<string, DashboardItemLayout> = {};
  for (const id of Object.keys(raw.widgets)) {
    if (!isNonEmptyString(id) || RESERVED_KEYS.has(id)) {
      diagnostics.push(diagnostic("validation", "error", "Widget ids must be safe non-empty strings.", { path: `${path}.widgets.${id}`, itemId: id }));
      continue;
    }
    const normalized = normalizeDashboardItem(raw.widgets[id], `${path}.widgets.${id}`, mode, true);
    diagnostics.push(...normalized.diagnostics.map(item => ({ ...item, itemId: item.itemId ?? id })));
    if (!normalized.ok) continue;
    widgets[id] = normalized.item as DashboardItemLayout;
  }
  out.widgets = widgets;

  const gridSettings = normalizeGridSettings(raw.gridSettings, `${path}.gridSettings`, mode);
  diagnostics.push(...gridSettings.diagnostics);
  if (!gridSettings.ok) return { ok: false, diagnostics };
  if (gridSettings.settings) out.gridSettings = gridSettings.settings;
  else delete out.gridSettings;

  if (typeof raw.profiles !== "undefined") {
    if (!isPlainRecord(raw.profiles)) {
      if (mode === "sanitize") {
        diagnostics.push(diagnostic("item-field-dropped", "warning", "Dropped invalid profiles.", { path: `${path}.profiles` }));
        delete out.profiles;
      } else {
        diagnostics.push(diagnostic("validation", "error", `${path}.profiles must be an object map.`, { path: `${path}.profiles` }));
      }
    } else {
      const profiles: Record<string, DashboardBreakpointProfile> = {};
      for (const profileId of Object.keys(raw.profiles)) {
        const profilePath = `${path}.profiles.${profileId}`;
        if (!isNonEmptyString(profileId) || RESERVED_KEYS.has(profileId)) {
          diagnostics.push(diagnostic("validation", "error", "Profile ids must be safe non-empty strings.", { path: profilePath, profileId }));
          continue;
        }
        if (!isPlainRecord(raw.profiles[profileId])) {
          diagnostics.push(diagnostic("validation", mode === "sanitize" ? "warning" : "error", `${profilePath} must be an object.`, { path: profilePath, profileId }));
          continue;
        }
        const rawProfile = raw.profiles[profileId];
        const profile: Record<string, unknown> = { ...rawProfile };
        if (typeof rawProfile.widgets !== "undefined") {
          if (!isPlainRecord(rawProfile.widgets)) {
            diagnostics.push(diagnostic("validation", mode === "sanitize" ? "warning" : "error", `${profilePath}.widgets must be an object map.`, { path: `${profilePath}.widgets`, profileId }));
            if (mode === "sanitize") delete profile.widgets;
          } else {
            const profileWidgets: Record<string, DashboardItemLayoutOverride> = {};
            for (const id of Object.keys(rawProfile.widgets)) {
              const normalized = normalizeDashboardItem(rawProfile.widgets[id], `${profilePath}.widgets.${id}`, mode, false);
              diagnostics.push(...normalized.diagnostics.map(item => ({ ...item, itemId: item.itemId ?? id, profileId })));
              if (normalized.ok) {
                profileWidgets[id] = normalized.item;
                if (!hasOwn(widgets, id)) {
                  diagnostics.push(diagnostic("unknown-item", "warning", `Profile "${profileId}" references an unknown widget "${id}".`, {
                    path: `${profilePath}.widgets.${id}`,
                    itemId: id,
                    profileId
                  }));
                }
              }
            }
            profile.widgets = profileWidgets;
          }
        }
        const profileSettings = normalizeGridSettings(rawProfile.gridSettings, `${profilePath}.gridSettings`, mode);
        diagnostics.push(...profileSettings.diagnostics.map(item => ({ ...item, profileId })));
        if (!profileSettings.ok) return { ok: false, diagnostics };
        if (profileSettings.settings) profile.gridSettings = profileSettings.settings;
        else delete profile.gridSettings;
        const profileEditor = normalizeEditorEnvelope(rawProfile.editor, `${profilePath}.editor`, mode, Object.keys(widgets));
        diagnostics.push(...profileEditor.diagnostics.map(item => ({ ...item, profileId })));
        if (!profileEditor.ok) return { ok: false, diagnostics };
        if (profileEditor.editor) profile.editor = profileEditor.editor;
        else delete profile.editor;
        diagnostics.push(...normalizeJsonObjectField(rawProfile, profile, "extensions", profilePath, mode));
        profiles[profileId] = profile as DashboardBreakpointProfile;
      }
      out.profiles = profiles;
    }
  }

  const editor = normalizeEditorEnvelope(raw.editor, `${path}.editor`, mode, Object.keys(widgets));
  diagnostics.push(...editor.diagnostics);
  if (!editor.ok) return { ok: false, diagnostics };
  if (editor.editor) out.editor = editor.editor;
  else delete out.editor;

  diagnostics.push(...normalizeJsonObjectField(raw, out, "extensions", path, mode));
  if (firstError(diagnostics)) return { ok: false, diagnostics };
  return { ok: true, layout: out as DashboardLayoutDefinition, diagnostics };
};

export function validateDashboardLayoutDocument(
  payload: unknown,
  options: {
    currentVersion?: number;
    validation?: LayoutValidationMode;
  } = {}
): DashboardValidationResult {
  const currentVersion = options.currentVersion ?? DASHBOARD_SCHEMA_VERSION;
  const mode = options.validation ?? "strict";
  const cloned = cloneJsonSafeValue(payload, mode, "document");
  const diagnostics = cloned.diagnostics.slice();
  if (!cloned.ok) {
    return {
      ok: false,
      originalPayload: payload,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics,
      error: {
        ...cloneDashboardError("Dashboard document must contain JSON-safe values only.", diagnostics),
        originalPayload: payload
      }
    };
  }
  if (!isPlainRecord(cloned.value)) {
    const issue = diagnostic("invalid-document", "error", "Dashboard document must be an object.", { path: "document" });
    return {
      ok: false,
      originalPayload: payload,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics: diagnostics.concat(issue),
      error: createDashboardError("invalid-document", issue.message, { path: issue.path, originalPayload: payload })
    };
  }
  const raw = cloned.value;
  const document: Record<string, unknown> = { ...raw };

  if (raw.dashboardSchemaVersion !== currentVersion) {
    const issue = diagnostic("invalid-document", "error", `Expected dashboard schema version ${currentVersion}.`, { path: "dashboardSchemaVersion" });
    diagnostics.push(issue);
    return {
      ok: false,
      originalPayload: payload,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics,
      error: createDashboardError("invalid-document", issue.message, { path: issue.path, originalPayload: payload })
    };
  }
  if (raw.kind !== "dashboard-layout") {
    const issue = diagnostic("invalid-document", "error", 'Dashboard document kind must be "dashboard-layout".', { path: "kind" });
    diagnostics.push(issue);
  }
  for (const key of ["key", "revision", "sourceId", "savedAt", "primaryLayoutId"]) {
    if (!isNonEmptyString(raw[key])) {
      diagnostics.push(diagnostic("invalid-document", "error", `Dashboard document ${key} must be a non-empty string.`, { path: key }));
    }
  }
  if (isNonEmptyString(raw.savedAt) && !isValidDateString(raw.savedAt)) {
    diagnostics.push(diagnostic("invalid-document", "error", "Dashboard document savedAt must be a valid date string.", { path: "savedAt" }));
  }
  if (!isPlainRecord(raw.layouts)) {
    diagnostics.push(diagnostic("invalid-document", "error", "Dashboard document layouts must be an object map.", { path: "layouts" }));
  }
  if (firstError(diagnostics)) {
    const error = firstError(diagnostics) as DashboardDiagnostic;
    return {
      ok: false,
      originalPayload: payload,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics,
      error: createDashboardError(error.code === "invalid-document" ? "invalid-document" : "validation", error.message, {
        path: error.path,
        originalPayload: payload
      })
    };
  }

  const rawLayouts = raw.layouts as Record<string, unknown>;
  const primaryLayoutId = raw.primaryLayoutId as string;
  if (!hasOwn(rawLayouts, primaryLayoutId)) {
    const issue = diagnostic("invalid-document", "error", "Dashboard primaryLayoutId must point to an existing layout.", { path: "primaryLayoutId", layoutId: primaryLayoutId });
    diagnostics.push(issue);
    return {
      ok: false,
      originalPayload: payload,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics,
      error: createDashboardError("invalid-document", issue.message, { path: issue.path, originalPayload: payload })
    };
  }

  const layouts: Record<string, DashboardLayoutDefinition> = {};
  for (const layoutId of Object.keys(rawLayouts)) {
    if (!isNonEmptyString(layoutId) || RESERVED_KEYS.has(layoutId)) {
      diagnostics.push(diagnostic("invalid-document", "error", "Layout ids must be safe non-empty strings.", { path: `layouts.${layoutId}`, layoutId }));
      continue;
    }
    const normalized = normalizeDashboardLayoutDefinition(rawLayouts[layoutId], `layouts.${layoutId}`, mode);
    diagnostics.push(...normalized.diagnostics.map(item => ({ ...item, layoutId: item.layoutId ?? layoutId })));
    if (normalized.ok) layouts[layoutId] = normalized.layout;
  }
  if (typeof raw.meta !== "undefined") {
    diagnostics.push(...normalizeJsonObjectField(raw, document, "meta", "document", mode));
  } else {
    delete document.meta;
  }
  if (firstError(diagnostics)) {
    const error = firstError(diagnostics) as DashboardDiagnostic;
    return {
      ok: false,
      originalPayload: payload,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics,
      error: createDashboardError(error.code === "invalid-document" ? "invalid-document" : "validation", error.message, {
        path: error.path,
        details: error.details,
        originalPayload: payload
      })
    };
  }

  const normalizedDocument: DashboardLayoutDocument = {
    ...document,
    dashboardSchemaVersion: currentVersion,
    kind: "dashboard-layout",
    key: raw.key as string,
    revision: raw.revision as string,
    sourceId: raw.sourceId as string,
    savedAt: raw.savedAt as string,
    primaryLayoutId,
    layouts,
    ...(document.meta ? { meta: document.meta as DashboardDocumentMeta } : {})
  };

  return {
    ok: true,
    document: normalizedDocument,
    warnings: diagnostics.filter(item => item.level === "warning"),
    diagnostics
  };
}

export function serializeDashboardLayoutDocument(
  input: DashboardLayoutDefinition | DashboardLayoutDocument,
  options: SerializeDashboardLayoutOptions
): DashboardLayoutDocument {
  const now = options.now ?? (() => new Date());
  const revision = options.revision ?? createRevision;
  const savedAt = now().toISOString();
  const sourceId = options.sourceId ?? (isPlainRecord(input) && typeof input.sourceId === "string" ? input.sourceId : createSourceId());
  const isDocument = isPlainRecord(input) && input.kind === "dashboard-layout" && isPlainRecord(input.layouts);
  const primaryLayoutId = isDocument && typeof input.primaryLayoutId === "string"
    ? input.primaryLayoutId
    : "default";
  const layouts = isDocument
    ? (input as DashboardLayoutDocument).layouts
    : { [primaryLayoutId]: input as DashboardLayoutDefinition };
  const meta = options.meta ?? (isDocument ? (input as DashboardLayoutDocument).meta : undefined);
  const document: DashboardLayoutDocument = {
    ...(isDocument ? input as DashboardLayoutDocument : {}),
    dashboardSchemaVersion: DASHBOARD_SCHEMA_VERSION,
    kind: "dashboard-layout",
    key: options.key,
    revision: revision(),
    sourceId,
    savedAt,
    primaryLayoutId,
    layouts,
    ...(meta ? { meta } : {})
  };
  const validation = validateDashboardLayoutDocument(document, {
    currentVersion: DASHBOARD_SCHEMA_VERSION,
    validation: "strict"
  });
  if (!validation.ok) throw validation.error;
  return validation.document;
}

export function migrateDashboardLayoutDocument(
  payload: unknown,
  options: {
    currentVersion?: number;
    migrations?: DashboardMigrationMap;
    validation?: LayoutValidationMode;
  } = {}
): DashboardMigrationResult {
  const currentVersion = options.currentVersion ?? DASHBOARD_SCHEMA_VERSION;
  const migrations = options.migrations ?? {};
  const originalPayload = payload;
  const events: DashboardMigrationEvent[] = [];
  const diagnostics: DashboardDiagnostic[] = [];

  if (!isPlainRecord(payload) || !Number.isInteger(payload.dashboardSchemaVersion)) {
    const error = createDashboardError("invalid-document", "Document has no numeric dashboardSchemaVersion.", {
      path: "dashboardSchemaVersion",
      originalPayload
    });
    return { ok: false, error, originalPayload, migrations: events, warnings: [], diagnostics };
  }

  let version = payload.dashboardSchemaVersion as number;
  if (version > currentVersion) {
    const error = createDashboardError("invalid-document", `Dashboard schema version ${version} is newer than supported ${currentVersion}.`, {
      path: "dashboardSchemaVersion",
      originalPayload
    });
    return { ok: false, error, originalPayload, migrations: events, warnings: [], diagnostics };
  }

  let document: unknown = payload;
  while (version < currentVersion) {
    const migration = migrations[version];
    if (!migration) {
      const issue = diagnostic("migration-missing", "error", `Missing dashboard migration from version ${version} to ${version + 1}.`);
      diagnostics.push(issue);
      return {
        ok: false,
        originalPayload,
        migrations: events,
        warnings: diagnostics.filter(item => item.level === "warning"),
        diagnostics,
        error: createDashboardError("migration-missing", issue.message, { originalPayload })
      };
    }
    try {
      document = migration(document, { fromVersion: version, toVersion: version + 1 });
    } catch (cause) {
      const issue = diagnostic("migration-failed", "error", `Dashboard migration from version ${version} to ${version + 1} failed.`, { details: cause });
      diagnostics.push(issue);
      return {
        ok: false,
        originalPayload,
        migrations: events,
        warnings: diagnostics.filter(item => item.level === "warning"),
        diagnostics,
        error: createDashboardError("migration-failed", issue.message, { cause, originalPayload })
      };
    }
    if (!isPlainRecord(document) || document.dashboardSchemaVersion !== version + 1) {
      const issue = diagnostic("migration-failed", "error", `Dashboard migration from version ${version} to ${version + 1} returned an invalid document.`);
      diagnostics.push(issue);
      return {
        ok: false,
        originalPayload,
        migrations: events,
        warnings: diagnostics.filter(item => item.level === "warning"),
        diagnostics,
        error: createDashboardError("migration-failed", issue.message, { originalPayload })
      };
    }
    events.push({ fromVersion: version, toVersion: version + 1 });
    version += 1;
  }

  const validation = validateDashboardLayoutDocument(document, {
    currentVersion,
    validation: options.validation ?? "strict"
  });
  diagnostics.push(...validation.diagnostics);
  if (!validation.ok) {
    return {
      ok: false,
      originalPayload,
      migrations: events,
      warnings: diagnostics.filter(item => item.level === "warning"),
      diagnostics,
      error: events.length > 0
        ? createDashboardError("migration-failed", "Dashboard migration result failed validation.", {
            cause: validation.error,
            originalPayload
          })
        : validation.error
    };
  }
  return {
    ok: true,
    document: validation.document,
    migrations: events,
    originalPayload,
    warnings: diagnostics.filter(item => item.level === "warning"),
    diagnostics
  };
}

export function deserializeDashboardLayoutDocument(
  payload: unknown,
  options: DeserializeDashboardLayoutOptions = {}
): DashboardDeserializeResult {
  const parsed = parsePayload(payload);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      fallback: options.fallback ? cloneDashboardDocument(options.fallback, "strict") : undefined,
      originalPayload: payload,
      migrations: [],
      warnings: [],
      diagnostics: []
    };
  }
  const migrated = migrateDashboardLayoutDocument(parsed.value, {
    currentVersion: options.currentVersion,
    migrations: options.migrations,
    validation: options.validation ?? "strict"
  });
  if (!migrated.ok) {
    return {
      ok: false,
      error: migrated.error,
      fallback: options.fallback ? cloneDashboardDocument(options.fallback, "strict") : undefined,
      originalPayload: migrated.originalPayload,
      migrations: migrated.migrations,
      warnings: migrated.warnings,
      diagnostics: migrated.diagnostics
    };
  }
  return {
    ok: true,
    document: migrated.document,
    migrations: migrated.migrations,
    warnings: migrated.warnings,
    diagnostics: migrated.diagnostics
  };
}

const resolveDashboardGridSettings = (
  settings: DashboardGridSettings | undefined
): ResolvedDashboardGridSettings => ({
  ...(settings || {}),
  columns: settings?.columns ?? 12,
  minColumns: settings?.minColumns ?? 1,
  margin: settings?.margin ?? 10,
  outerMargin: settings?.outerMargin ?? true,
  viewFormat: settings?.viewFormat ?? "grid",
  rowHeight: settings?.rowHeight ?? 150,
  autoFillHeight: settings?.autoFillHeight ?? false,
  heightMode: settings?.heightMode,
  mobileHeightMode: settings?.mobileHeightMode,
  minRowHeight: settings?.minRowHeight,
  renderPrecision: settings?.renderPrecision ?? "integer"
});

const toRuntimeLayoutItem = (id: string, item: DashboardItemLayout): LayoutItem => {
  const runtime: LayoutItem = {
    i: id,
    x: item.col,
    y: item.row,
    w: item.sizeX,
    h: item.sizeY
  };
  copyDefined(runtime as unknown as Record<string, unknown>, "minW", item.minSizeX);
  copyDefined(runtime as unknown as Record<string, unknown>, "minH", item.minSizeY);
  copyDefined(runtime as unknown as Record<string, unknown>, "maxW", item.maxSizeX);
  copyDefined(runtime as unknown as Record<string, unknown>, "maxH", item.maxSizeY);
  copyDefined(runtime as unknown as Record<string, unknown>, "static", item.static);
  copyDefined(runtime as unknown as Record<string, unknown>, "isDraggable", item.draggable);
  copyDefined(runtime as unknown as Record<string, unknown>, "isResizable", item.resizable);
  copyDefined(runtime as unknown as Record<string, unknown>, "isBounded", item.bounded);
  if (item.resizeHandles) runtime.resizeHandles = item.resizeHandles.slice();
  return runtime;
};

const mergeProfileItem = (
  base: DashboardItemLayout,
  override: DashboardItemLayoutOverride | undefined
): DashboardItemLayout => ({
  ...base,
  ...(override || {})
});

const toPhysicalCapabilityInput = (
  item: DashboardItemLayout | DashboardItemLayoutOverride | undefined
): GridItemPhysicalCapabilityInput | undefined => {
  if (!item) return undefined;
  const input: GridItemPhysicalCapabilityInput = {};
  copyDefined(input, "static", item.static);
  copyDefined(input, "draggable", item.draggable);
  copyDefined(input, "resizable", item.resizable);
  copyDefined(input, "bounded", item.bounded);
  if (item.resizeHandles) input.resizeHandles = item.resizeHandles.slice();
  copyDefined(input, "preserveAspectRatio", item.preserveAspectRatio);
  copyDefined(input, "aspectRatio", item.aspectRatio);
  return Object.keys(input).length > 0 ? input : undefined;
};

const capabilityDiagnosticToDashboard = (
  diagnosticInput: GridItemCapabilityDiagnostic,
  context: {
    layoutId: string;
    profileId: string | null;
    itemId: string;
  }
): DashboardDiagnostic => diagnostic(
  diagnosticInput.code,
  diagnosticInput.level,
  diagnosticInput.message,
  {
    layoutId: context.layoutId,
    profileId: context.profileId || undefined,
    itemId: context.itemId,
    path: diagnosticInput.field
      ? `layouts.${context.layoutId}.widgets.${context.itemId}.${diagnosticInput.field}`
      : undefined,
    details: diagnosticInput.details
  }
);

const pushProfileCapabilitySourceDiagnostics = (
  diagnostics: DashboardDiagnostic[],
  capability: ResolvedGridItemCapability,
  context: {
    layoutId: string;
    profileId: string | null;
    itemId: string;
    baseItem: DashboardItemLayout;
    profileItem?: DashboardItemLayoutOverride;
  }
): void => {
  if (!context.profileId) return;
  DASHBOARD_CAPABILITY_SOURCE_FIELDS.forEach(field => {
    const profileHasField = Boolean(
      context.profileItem &&
      hasOwn(context.profileItem, field) &&
      typeof context.profileItem[field] !== "undefined"
    );
    const baseHasField =
      hasOwn(context.baseItem, field) &&
      typeof context.baseItem[field] !== "undefined";
    if (!profileHasField && !baseHasField) return;

    const code = profileHasField
      ? "item-capability.profile-overridden"
      : "item-capability.profile-inherited";
    const sourceLists = capability.sourceLists[field] || [];
    diagnostics.push(diagnostic(
      code,
      "info",
      profileHasField
        ? `Profile capability field ${field} overrides the default item.`
        : `Profile capability field ${field} is inherited from the default item.`,
      {
        layoutId: context.layoutId,
        profileId: context.profileId || undefined,
        itemId: context.itemId,
        path: profileHasField
          ? `layouts.${context.layoutId}.profiles.${context.profileId}.widgets.${context.itemId}.${field}`
          : `layouts.${context.layoutId}.widgets.${context.itemId}.${field}`,
        details: {
          field,
          mode: profileHasField ? "overridden" : "inherited",
          effectiveSource: capability.sources[field],
          sourceLists
        }
      }
    ));
  });
};

const layoutSorter = (a: LayoutItem, b: LayoutItem): number => {
  if (a.y !== b.y) return a.y - b.y;
  if (a.x !== b.x) return a.x - b.x;
  return a.i < b.i ? -1 : a.i > b.i ? 1 : 0;
};

const sanitizeProjectedEditorMeta = (
  metaById: GridEditorMetaById,
  layout: Layout,
  diagnostics: DashboardDiagnostic[]
): GridEditorMetaById => {
  const validation = validateEditorMetaById(metaById, { layout, removeOrphans: true });
  validation.warnings.forEach(issue => {
    diagnostics.push(diagnostic(
      issue.code === "orphan-meta" ? "orphan-editor-meta" : issue.code,
      "warning",
      issue.message,
      { path: issue.path }
    ));
  });
  validation.errors.forEach(issue => {
    diagnostics.push(diagnostic(issue.code, "warning", issue.message, { path: issue.path }));
  });
  return validation.value;
};

export function projectDashboardLayoutDocument(
  document: DashboardLayoutDocument,
  options: ProjectDashboardLayoutOptions = {}
): DashboardProjectionResult {
  const validation = validateDashboardLayoutDocument(document, { validation: options.validation ?? "strict" });
  const diagnostics = validation.diagnostics.slice();
  if (!validation.ok) {
    return { ok: false, error: validation.error, originalPayload: validation.originalPayload, diagnostics };
  }

  const source = validation.document;
  let fallbackApplied = false;
  let layoutId = options.layoutId ?? source.primaryLayoutId;
  if (layoutId !== source.primaryLayoutId && !options.allowNonPrimary) {
    diagnostics.push(diagnostic("deferred-layout-slot", "info", "Only the primary dashboard layout is projected in this version.", {
      layoutId
    }));
    layoutId = source.primaryLayoutId;
    fallbackApplied = true;
  }
  if (!source.layouts[layoutId]) {
    const error = createDashboardError("invalid-document", `Dashboard layout "${layoutId}" was not found.`, {
      path: `layouts.${layoutId}`
    });
    diagnostics.push(diagnostic("invalid-document", "error", error.message, { layoutId, path: error.path }));
    return { ok: false, error, originalPayload: document, diagnostics };
  }
  Object.keys(source.layouts).forEach(id => {
    if (id !== layoutId && id !== source.primaryLayoutId) {
      diagnostics.push(diagnostic("deferred-layout-slot", "info", "Non-primary dashboard layout slot is preserved but not projected.", { layoutId: id }));
    }
  });

  const layoutDefinition = source.layouts[layoutId];
  const profileId = options.profileId && layoutDefinition.profiles?.[options.profileId]
    ? options.profileId
    : null;
  if (options.profileId && !profileId) {
    diagnostics.push(diagnostic("profile-fallback", "warning", `Dashboard profile "${options.profileId}" was not found; projected primary layout.`, {
      layoutId,
      profileId: options.profileId
    }));
    fallbackApplied = true;
  }
  const profile = profileId ? layoutDefinition.profiles?.[profileId] : undefined;
  if (profile?.widgets) {
    Object.keys(profile.widgets).forEach(id => {
      if (!hasOwn(layoutDefinition.widgets, id)) {
        diagnostics.push(diagnostic("unknown-item", "warning", `Profile "${profileId}" contains unknown widget "${id}".`, {
          layoutId,
          profileId: profileId || undefined,
          itemId: id,
          path: `layouts.${layoutId}.profiles.${profileId}.widgets.${id}`
        }));
      }
    });
  }

  const targetView = options.targetView ?? "desktop";
  const runtimeLayout: Layout = [];
  const capabilitiesById: Record<string, ResolvedGridItemCapability> = {};
  const resizeConstraintsById: Record<string, GridItemAspectRatioConstraint> = {};
  const editorMetaById: GridEditorMetaById = {
    ...(layoutDefinition.editor?.editorMetaById || {})
  };
  if (profile?.editor?.editorMetaById) {
    Object.keys(profile.editor.editorMetaById).forEach(id => {
      editorMetaById[id] = {
        ...(editorMetaById[id] || {}),
        ...profile.editor?.editorMetaById?.[id]
      };
    });
  }

  Object.keys(layoutDefinition.widgets).forEach(id => {
    const baseItem = layoutDefinition.widgets[id];
    const profileItem = profile?.widgets?.[id];
    const item = mergeProfileItem(layoutDefinition.widgets[id], profile?.widgets?.[id]);
    const runtimeItem = toRuntimeLayoutItem(id, item);
    runtimeLayout.push(runtimeItem);

    const meta = { ...(editorMetaById[id] || {}) };
    const hidden = targetView === "mobile" ? item.mobileHide === true : item.desktopHide === true;
    if (hidden) {
      if (meta.visible === true) {
        diagnostics.push(diagnostic("editor-capability-conflict", "warning", "Dashboard visibility overrides editor metadata.", {
          layoutId,
          profileId: profileId || undefined,
          itemId: id
        }));
      }
      meta.visible = false;
    } else if (typeof meta.visible === "undefined") {
      meta.visible = true;
    }
    if (item.resizable === false) {
      if (meta.resizable === true) {
        diagnostics.push(diagnostic("editor-capability-conflict", "warning", "Dashboard resizable=false overrides editor metadata.", {
          layoutId,
          profileId: profileId || undefined,
          itemId: id
        }));
      }
      meta.resizable = false;
    }
    editorMetaById[id] = meta;

    const capability = resolveGridItemCapability({
      item: runtimeItem,
      dashboard: toPhysicalCapabilityInput(baseItem),
      profile: toPhysicalCapabilityInput(profileItem),
      editor: meta,
      preserveUnknownFields: true
    });
    capabilitiesById[id] = capability;
    if (capability.aspectRatio) {
      resizeConstraintsById[id] = capability.aspectRatio;
    }
    capability.diagnostics.forEach(capabilityDiagnostic => {
      diagnostics.push(capabilityDiagnosticToDashboard(capabilityDiagnostic, {
        layoutId,
        profileId,
        itemId: id
      }));
    });
    pushProfileCapabilitySourceDiagnostics(diagnostics, capability, {
      layoutId,
      profileId,
      itemId: id,
      baseItem,
      profileItem
    });

    DASHBOARD_ITEM_RUNTIME_UNSUPPORTED_FIELDS.forEach(field => {
      if (typeof item[field] !== "undefined") {
        diagnostics.push(diagnostic("unsupported-field", "info", `${field} is preserved in the dashboard document but not written to LayoutItem.`, {
          layoutId,
          profileId: profileId || undefined,
          itemId: id,
          path: `layouts.${layoutId}.widgets.${id}.${field}`
        }));
      }
    });
    DASHBOARD_ITEM_RUNTIME_SIDECAR_FIELDS.forEach(field => {
      if (typeof item[field] !== "undefined") {
        diagnostics.push(diagnostic("item-capability.sidecar-projected", "info", `${field} was projected through capability sidecar and not written to LayoutItem.`, {
          layoutId,
          profileId: profileId || undefined,
          itemId: id,
          path: `layouts.${layoutId}.widgets.${id}.${field}`
        }));
      }
    });
  });

  runtimeLayout.sort(layoutSorter);
  const projectedMeta = sanitizeProjectedEditorMeta(editorMetaById, runtimeLayout, diagnostics);
  const gridSettings = resolveDashboardGridSettings({
    ...(layoutDefinition.gridSettings || {}),
    ...(profile?.gridSettings || {})
  });
  if (layoutDefinition.gridSettings || profile?.gridSettings) {
    diagnostics.push(diagnostic("unsupported-field", "info", "Dashboard grid settings are returned as sidecar runtime settings and are not written to LayoutItem.", {
      layoutId,
      profileId: profileId || undefined,
      path: profile?.gridSettings
        ? `layouts.${layoutId}.profiles.${profileId}.gridSettings`
        : `layouts.${layoutId}.gridSettings`
    }));
  }

  const projection: DashboardGridRuntimeProjection = {
    layout: runtimeLayout,
    gridSettings,
    editorMetaById: projectedMeta,
    capabilitiesById,
    resizeConstraintsById: Object.keys(resizeConstraintsById).length > 0 ? resizeConstraintsById : undefined,
    layoutId,
    profileId,
    fallbackApplied,
    diagnostics
  };
  return { ok: true, projection, diagnostics };
}

const runtimeItemToDashboardPatch = (item: LayoutItem): DashboardItemLayoutOverride => {
  const patch: DashboardItemLayoutOverride = {
    col: item.x,
    row: item.y,
    sizeX: item.w,
    sizeY: item.h
  };
  copyDefined(patch, "minSizeX", item.minW);
  copyDefined(patch, "minSizeY", item.minH);
  copyDefined(patch, "maxSizeX", item.maxW);
  copyDefined(patch, "maxSizeY", item.maxH);
  return patch;
};

const mergeEditorMeta = (
  previous: GridEditorMetaById | undefined,
  next: GridEditorMetaById | undefined
): GridEditorMetaById | undefined => {
  if (!previous && !next) return undefined;
  const merged: GridEditorMetaById = {};
  Object.keys(previous || {}).forEach(id => {
    merged[id] = { ...(previous as GridEditorMetaById)[id] };
  });
  Object.keys(next || {}).forEach(id => {
    merged[id] = {
      ...(merged[id] || {}),
      ...(next as GridEditorMetaById)[id]
    };
  });
  return merged;
};

const createWriteItemFilter = (
  ids: string[] | undefined
): ((id: string) => boolean) | null => {
  if (!ids) return null;
  const set = new Set(ids.filter(Boolean));
  return id => set.has(id);
};

const filterEditorMetaByIds = (
  meta: GridEditorMetaById | undefined,
  ids: string[] | undefined
): GridEditorMetaById | undefined => {
  if (!meta || !ids) return meta;
  const set = new Set(ids.filter(Boolean));
  const filtered: GridEditorMetaById = {};
  Object.keys(meta).forEach(id => {
    if (set.has(id)) filtered[id] = meta[id];
  });
  return Object.keys(filtered).length > 0 ? filtered : undefined;
};

const normalizeDashboardSectionRows = (
  rows: GridEditorSectionRowState | undefined,
  layout: Layout,
  diagnostics: DashboardDiagnostic[],
  context: {
    path: string;
    layoutId: string;
    profileId?: string;
  }
): GridEditorSectionRowState | undefined => {
  if (!rows) return undefined;
  const normalized = normalizeGridEditorSectionRows(rows, layout);
  normalized.warnings.forEach(issue => {
    diagnostics.push(diagnostic(
      issue.code,
      "warning",
      issue.message,
      {
        path: context.path,
        layoutId: context.layoutId,
        profileId: context.profileId,
        itemId: issue.itemIds?.[0],
        details: issue
      }
    ));
  });
  return sectionRowsFromResolved(normalized);
};

const removeItemFromSectionRows = (
  rows: GridEditorSectionRowState | undefined,
  id: string
): GridEditorSectionRowState | undefined => {
  if (!rows) return rows;
  const next: GridEditorSectionRowState = {
    version: 1,
    items: Object.keys(rows.items || {}).reduce((acc, rowId) => {
      const row = rows.items[rowId];
      acc[rowId] = {
        ...row,
        bounds: row.bounds ? { ...row.bounds } : undefined,
        itemIds: row.itemIds ? row.itemIds.filter(itemId => itemId !== id) : undefined,
        allowedDropZones: row.allowedDropZones ? row.allowedDropZones.slice() : undefined
      };
      return acc;
    }, {} as GridEditorSectionRowState["items"]),
    itemMembership: { ...(rows.itemMembership || {}) }
  };
  const itemMembership = next.itemMembership || {};
  delete itemMembership[id];
  next.itemMembership = itemMembership;
  return JSON.parse(JSON.stringify(next)) as GridEditorSectionRowState;
};

const cleanRemovedEditorSidecarItem = (
  owner: { editor?: DashboardEditorEnvelope } | undefined,
  id: string
) => {
  if (!owner?.editor) return;
  if (owner.editor.editorMetaById) delete owner.editor.editorMetaById[id];
  owner.editor.sectionRows = removeItemFromSectionRows(owner.editor.sectionRows, id);
};

const ensureEditorEnvelope = (
  owner: { editor?: DashboardEditorEnvelope }
): DashboardEditorEnvelope => {
  owner.editor = owner.editor || { version: 1 };
  return owner.editor;
};

export function writeDashboardRuntimeToDocument(
  document: DashboardLayoutDocument,
  runtime: {
    layout: Layout;
    editorMetaById?: GridEditorMetaById;
    sectionRows?: GridEditorSectionRowState;
    gridSettings?: Partial<DashboardGridSettings>;
  },
  options: WriteDashboardRuntimeOptions = {}
): DashboardWriteResult {
  const validation = validateDashboardLayoutDocument(document, { validation: options.validation ?? "strict" });
  const diagnostics = validation.diagnostics.slice();
  const baseDocument = validation.ok ? validation.document : cloneDashboardDocument(document, "sanitize");
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
      document: baseDocument,
      originalPayload: validation.originalPayload,
      diagnostics
    };
  }

  const next = cloneDashboardDocument(baseDocument, "strict");
  const layoutId = options.layoutId ?? next.primaryLayoutId;
  const layoutDefinition = next.layouts[layoutId];
  if (!layoutDefinition) {
    const issue = diagnostic("invalid-document", "error", `Dashboard layout "${layoutId}" was not found.`, { layoutId });
    diagnostics.push(issue);
    return {
      ok: false,
      error: createDashboardError("invalid-document", issue.message, { path: `layouts.${layoutId}` }),
      document: next,
      diagnostics
    };
  }

  let targetWidgets: Record<string, DashboardItemLayoutOverride>;
  if (options.profileId) {
    layoutDefinition.profiles = layoutDefinition.profiles || {};
    if (!layoutDefinition.profiles[options.profileId]) {
      if (!options.createMissingProfile) {
        const issue = diagnostic("profile-fallback", "error", `Dashboard profile "${options.profileId}" was not found.`, {
          layoutId,
          profileId: options.profileId
        });
        diagnostics.push(issue);
        return {
          ok: false,
          error: createDashboardError("validation", issue.message, { path: `layouts.${layoutId}.profiles.${options.profileId}` }),
          document: next,
          diagnostics
        };
      }
      layoutDefinition.profiles[options.profileId] = { widgets: {} };
    }
    layoutDefinition.profiles[options.profileId].widgets = layoutDefinition.profiles[options.profileId].widgets || {};
    targetWidgets = layoutDefinition.profiles[options.profileId].widgets as Record<string, DashboardItemLayoutOverride>;
  } else {
    targetWidgets = layoutDefinition.widgets;
  }

  const shouldWriteItem = createWriteItemFilter(options.writeItemIds);
  const runtimeItemIds = new Set(runtime.layout.map(item => item.i));
  if (options.removeMissingItems && options.writeItemIds?.length) {
    options.writeItemIds.filter(Boolean).forEach(id => {
      if (runtimeItemIds.has(id)) return;
      delete layoutDefinition.widgets[id];
      delete targetWidgets[id];
      Object.values(layoutDefinition.profiles || {}).forEach(profile => {
        if (profile.widgets) delete profile.widgets[id];
        cleanRemovedEditorSidecarItem(profile, id);
      });
      cleanRemovedEditorSidecarItem(layoutDefinition, id);
    });
  }
  for (const runtimeItem of runtime.layout) {
    const id = runtimeItem.i;
    if (shouldWriteItem && !shouldWriteItem(id)) continue;
    const existsInPrimary = hasOwn(layoutDefinition.widgets, id);
    if (!existsInPrimary && !options.createMissingItems) {
      const issue = diagnostic("unknown-item", "error", `Runtime layout contains unknown dashboard widget "${id}".`, {
        layoutId,
        profileId: options.profileId,
        itemId: id
      });
      diagnostics.push(issue);
      return {
        ok: false,
        error: createDashboardError("unknown-item", issue.message, { details: { itemId: id } }),
        document: next,
        diagnostics
      };
    }
    if (!existsInPrimary) {
      layoutDefinition.widgets[id] = runtimeItemToDashboardPatch(runtimeItem) as DashboardItemLayout;
    }
    const previous = targetWidgets[id] || {};
    targetWidgets[id] = {
      ...previous,
      ...runtimeItemToDashboardPatch(runtimeItem)
    };
  }

  if (runtime.gridSettings) {
    if (options.profileId) {
      const profile = layoutDefinition.profiles?.[options.profileId];
      if (profile) {
        profile.gridSettings = {
          ...(profile.gridSettings || {}),
          ...runtime.gridSettings
        };
      }
    } else {
      layoutDefinition.gridSettings = {
        ...(layoutDefinition.gridSettings || {}),
        ...runtime.gridSettings
      };
    }
  }

  const runtimeMeta = mergeEditorMeta(
    filterEditorMetaByIds(options.editorMetaById, options.writeItemIds),
    filterEditorMetaByIds(runtime.editorMetaById, options.writeItemIds)
  );
  if (runtimeMeta) {
    const editorOwner = options.profileId
      ? layoutDefinition.profiles?.[options.profileId]
      : layoutDefinition;
    const editorEnvelope = ensureEditorEnvelope(editorOwner as { editor?: DashboardEditorEnvelope });
    editorEnvelope.editorMetaById = mergeEditorMeta(editorEnvelope.editorMetaById, runtimeMeta);
    Object.keys(runtimeMeta).forEach(id => {
      if (!hasOwn(layoutDefinition.widgets, id)) {
        diagnostics.push(diagnostic("orphan-editor-meta", "warning", `Editor metadata references unknown widget "${id}".`, {
          layoutId,
          itemId: id
        }));
        return;
      }
      const meta = runtimeMeta[id];
      const targetItem = options.profileId ? targetWidgets[id] || {} : layoutDefinition.widgets[id];
      if (typeof meta.resizable === "boolean") {
        targetItem.resizable = meta.resizable;
        targetWidgets[id] = targetItem;
      }
      if (options.targetView && typeof meta.visible === "boolean") {
        if (options.targetView === "mobile") targetItem.mobileHide = meta.visible === false;
        else targetItem.desktopHide = meta.visible === false;
        targetWidgets[id] = targetItem;
      }
    });
    editorEnvelope.editorMetaById = sanitizeProjectedEditorMeta(
      editorEnvelope.editorMetaById || {},
      layoutFromWidgetIds(Object.keys(layoutDefinition.widgets)),
      diagnostics
    );
  }
  const runtimeSectionRows = options.sectionRows || runtime.sectionRows;
  if (runtimeSectionRows) {
    const editorOwner = options.profileId
      ? layoutDefinition.profiles?.[options.profileId]
      : layoutDefinition;
    const editorEnvelope = ensureEditorEnvelope(editorOwner as { editor?: DashboardEditorEnvelope });
    const path = options.profileId
      ? `layouts.${layoutId}.profiles.${options.profileId}.editor.sectionRows`
      : `layouts.${layoutId}.editor.sectionRows`;
    const normalizedRows = normalizeDashboardSectionRows(
      runtimeSectionRows,
      runtime.layout,
      diagnostics,
      { path, layoutId, profileId: options.profileId }
    );
    if (normalizedRows) {
      editorEnvelope.sectionRows = normalizedRows;
      editorEnvelope.version = Math.max(Number(editorEnvelope.version) || 1, 2);
    }
  }

  const finalValidation = validateDashboardLayoutDocument(next, { validation: options.validation ?? "strict" });
  diagnostics.push(...finalValidation.diagnostics);
  if (!finalValidation.ok) {
    return {
      ok: false,
      error: finalValidation.error,
      document: next,
      originalPayload: document,
      diagnostics
    };
  }
  return {
    ok: true,
    document: finalValidation.document,
    diagnostics
  };
}

const pickKnownFields = (
  source: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  fields.forEach(field => {
    if (typeof source[field] !== "undefined") out[field] = source[field];
  });
  return out;
};

const omitKnownFields = (
  source: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  Object.keys(source).forEach(key => {
    if (fields.indexOf(key) === -1) out[key] = source[key];
  });
  return out;
};

const preserveThingsBoardExtras = (
  extras: Record<string, unknown>,
  diagnostics: DashboardDiagnostic[],
  path: string,
  message: string
): DashboardJsonObject | undefined => {
  if (Object.keys(extras).length === 0) return undefined;
  const cloned = cloneJsonSafeValue(extras, "sanitize", `${path}.extensions.thingsBoard`);
  diagnostics.push(...cloned.diagnostics);
  diagnostics.push(diagnostic("unsupported-field", "warning", message, { path }));
  if (!cloned.ok || !isPlainRecord(cloned.value) || Object.keys(cloned.value).length === 0) return undefined;
  return cloned.value as DashboardJsonObject;
};

const importThingsBoardGridSettings = (
  input: unknown,
  diagnostics: DashboardDiagnostic[],
  path: string
): DashboardGridSettings | undefined => {
  if (!isPlainRecord(input)) return undefined;
  const known = pickKnownFields(input, THINGSBOARD_GRID_SETTINGS_FIELDS);
  const extras = omitKnownFields(input, THINGSBOARD_GRID_SETTINGS_FIELDS);
  const preservedExtras = preserveThingsBoardExtras(
    extras,
    diagnostics,
    path,
    "ThingsBoard grid settings contain deferred business fields."
  );
  if (preservedExtras) {
    known.extensions = {
      ...((known.extensions as DashboardJsonObject) || {}),
      thingsBoard: preservedExtras
    };
  }
  const normalized = normalizeGridSettings(known, path, "sanitize");
  diagnostics.push(...normalized.diagnostics);
  return normalized.ok ? normalized.settings : undefined;
};

const importThingsBoardWidget = (
  input: unknown,
  diagnostics: DashboardDiagnostic[],
  path: string,
  requireGeometry: boolean
): DashboardItemLayoutOverride | null => {
  if (!isPlainRecord(input)) {
    diagnostics.push(diagnostic("invalid-item-geometry", "error", "ThingsBoard widget must be an object.", { path }));
    return null;
  }
  const layoutSource = isPlainRecord(input.layout) ? input.layout : input;
  const known = pickKnownFields(layoutSource, THINGSBOARD_WIDGET_LAYOUT_FIELDS);
  const layoutExtras = isPlainRecord(input.layout)
    ? omitKnownFields(layoutSource, THINGSBOARD_WIDGET_LAYOUT_FIELDS)
    : {};
  const business = isPlainRecord(input.layout)
    ? {
        ...omitKnownFields(input, ["layout"]),
        ...(Object.keys(layoutExtras).length > 0 ? { layout: layoutExtras } : {})
      }
    : omitKnownFields(input, THINGSBOARD_WIDGET_LAYOUT_FIELDS);
  const preservedBusiness = preserveThingsBoardExtras(
    business,
    diagnostics,
    path,
    "ThingsBoard widget business fields were preserved in extensions."
  );
  if (preservedBusiness) {
    known.extensions = {
      ...((known.extensions as DashboardJsonObject) || {}),
      thingsBoard: preservedBusiness
    };
  }
  const normalized = normalizeDashboardItem(known, path, "sanitize", requireGeometry);
  diagnostics.push(...normalized.diagnostics);
  return normalized.ok ? normalized.item : null;
};

export function importThingsBoardDashboardLayout(
  input: ThingsBoardDashboardLayoutLike,
  options: Partial<SerializeDashboardLayoutOptions> = {}
): DashboardImportResult {
  const diagnostics: DashboardDiagnostic[] = [];
  if (!isPlainRecord(input)) {
    return {
      ok: false,
      originalPayload: input,
      diagnostics,
      error: createDashboardError("invalid-document", "ThingsBoard dashboard layout must be an object.")
    };
  }

  const widgets: Record<string, DashboardItemLayout> = {};
  const rawWidgets = isPlainRecord(input.widgets) ? input.widgets : {};
  Object.keys(rawWidgets).forEach(id => {
    const item = importThingsBoardWidget(rawWidgets[id], diagnostics, `widgets.${id}`, true);
    if (item) widgets[id] = item as DashboardItemLayout;
  });

  const layout: DashboardLayoutDefinition = {
    widgets,
    ...(input.gridSettings ? { gridSettings: importThingsBoardGridSettings(input.gridSettings, diagnostics, "gridSettings") } : {})
  };
  const rootExtras = omitKnownFields(input, THINGSBOARD_DASHBOARD_LAYOUT_FIELDS);
  const preservedRootExtras = preserveThingsBoardExtras(
    rootExtras,
    diagnostics,
    "document",
    "ThingsBoard dashboard business fields were preserved in extensions."
  );
  if (preservedRootExtras) {
    layout.extensions = {
      ...((layout.extensions as DashboardJsonObject) || {}),
      thingsBoard: preservedRootExtras
    };
  }
  const rawBreakpoints = isPlainRecord(input.breakpoints) ? input.breakpoints : {};
  Object.keys(rawBreakpoints).forEach(profileId => {
    if (!isPlainRecord(rawBreakpoints[profileId])) return;
    const rawProfile = rawBreakpoints[profileId];
    const rawProfileWidgets = isPlainRecord(rawProfile.widgetLayouts)
      ? rawProfile.widgetLayouts
      : isPlainRecord(rawProfile.widgets)
        ? rawProfile.widgets
        : {};
    const profileWidgets: Record<string, DashboardItemLayoutOverride> = {};
    Object.keys(rawProfileWidgets).forEach(id => {
      const item = importThingsBoardWidget(rawProfileWidgets[id], diagnostics, `breakpoints.${profileId}.widgetLayouts.${id}`, false);
      if (item) profileWidgets[id] = item;
    });
    const profileExtras = preserveThingsBoardExtras(
      omitKnownFields(rawProfile, THINGSBOARD_BREAKPOINT_FIELDS),
      diagnostics,
      `breakpoints.${profileId}`,
      "ThingsBoard breakpoint business fields were preserved in extensions."
    );
    layout.profiles = layout.profiles || {};
    layout.profiles[profileId] = {
      widgets: profileWidgets,
      ...(rawProfile.gridSettings
        ? { gridSettings: importThingsBoardGridSettings(rawProfile.gridSettings, diagnostics, `breakpoints.${profileId}.gridSettings`) }
        : {}),
      ...(profileExtras ? { extensions: { thingsBoard: profileExtras } } : {})
    };
  });

  try {
    const document = serializeDashboardLayoutDocument(layout, {
      key: options.key ?? "thingsboard-dashboard",
      sourceId: options.sourceId,
      meta: options.meta,
      now: options.now,
      revision: options.revision
    });
    return { ok: true, document, diagnostics };
  } catch (cause) {
    return {
      ok: false,
      originalPayload: input,
      diagnostics,
      error: createDashboardError("validation", "Imported ThingsBoard dashboard layout failed validation.", { cause })
    };
  }
}

const exportThingsBoardGridSettings = (
  settings: DashboardGridSettings | undefined
): Record<string, unknown> | undefined => {
  if (!settings) return undefined;
  const out: Record<string, unknown> = {};
  if (isPlainRecord(settings.extensions?.thingsBoard)) {
    Object.keys(settings.extensions.thingsBoard).forEach(key => {
      out[key] = (settings.extensions?.thingsBoard as DashboardJsonObject)[key];
    });
  }
  THINGSBOARD_GRID_SETTINGS_FIELDS.forEach(field => {
    if (typeof settings[field] !== "undefined") out[field] = settings[field];
  });
  return out;
};

const exportThingsBoardWidget = (
  item: DashboardItemLayoutOverride
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (isPlainRecord(item.extensions?.thingsBoard)) {
    Object.keys(item.extensions.thingsBoard).forEach(key => {
      out[key] = (item.extensions?.thingsBoard as DashboardJsonObject)[key];
    });
  }
  THINGSBOARD_WIDGET_LAYOUT_FIELDS.forEach(field => {
    if (typeof item[field] !== "undefined") out[field] = item[field];
  });
  return out;
};

export function exportThingsBoardDashboardLayout(
  document: DashboardLayoutDocument,
  options: { layoutId?: string } = {}
): DashboardExportResult {
  const validation = validateDashboardLayoutDocument(document);
  const diagnostics = validation.diagnostics.slice();
  if (!validation.ok) return { ok: false, error: validation.error, diagnostics };
  const source = validation.document;
  const layoutId = options.layoutId ?? source.primaryLayoutId;
  const layout = source.layouts[layoutId];
  if (!layout) {
    const issue = diagnostic("invalid-document", "error", `Dashboard layout "${layoutId}" was not found.`, { layoutId });
    diagnostics.push(issue);
    return {
      ok: false,
      diagnostics,
      error: createDashboardError("invalid-document", issue.message, { path: `layouts.${layoutId}` })
    };
  }
  const widgets: Record<string, unknown> = {};
  Object.keys(layout.widgets).forEach(id => {
    widgets[id] = exportThingsBoardWidget(layout.widgets[id]);
  });
  const breakpoints: Record<string, unknown> = {};
  Object.keys(layout.profiles || {}).forEach(profileId => {
    const profile = (layout.profiles as Record<string, DashboardBreakpointProfile>)[profileId];
    const widgetLayouts: Record<string, unknown> = {};
    Object.keys(profile.widgets || {}).forEach(id => {
      widgetLayouts[id] = exportThingsBoardWidget((profile.widgets as Record<string, DashboardItemLayoutOverride>)[id]);
    });
    breakpoints[profileId] = {
      ...(isPlainRecord(profile.extensions?.thingsBoard) ? profile.extensions.thingsBoard : {}),
      widgetLayouts,
      ...(profile.gridSettings ? { gridSettings: exportThingsBoardGridSettings(profile.gridSettings) } : {})
    };
  });
  return {
    ok: true,
    value: {
      ...(isPlainRecord(layout.extensions?.thingsBoard) ? layout.extensions.thingsBoard : {}),
      widgets,
      ...(layout.gridSettings ? { gridSettings: exportThingsBoardGridSettings(layout.gridSettings) } : {}),
      ...(Object.keys(breakpoints).length > 0 ? { breakpoints } : {})
    },
    diagnostics
  };
}
