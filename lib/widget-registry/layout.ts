import type { LayoutItem, ResizeHandleAxis } from "../utils";
import type {
  WidgetLayoutDefaults,
  WidgetRegistryDiagnostic,
  WidgetRegistryPolicy
} from "./types";
import {
  cloneJsonObject,
  diagnostic,
  diagnosticsHaveErrors,
  isPlainRecord
} from "./json";

const RESIZE_HANDLES: ResizeHandleAxis[] = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
const RESIZE_HANDLE_SET = new Set<string>(RESIZE_HANDLES);
const DEFAULT_SIZE = { w: 2, h: 2 };

const finitePositive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const finiteNonNegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const optionalBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const optionalSize = (
  value: unknown,
  field: string,
  diagnostics: WidgetRegistryDiagnostic[],
  input: { type?: string; path: string; policy: WidgetRegistryPolicy }
): number | undefined => {
  if (value === undefined) return undefined;
  if (finitePositive(value)) return Math.floor(value);
  diagnostics.push(diagnostic("widget-registry.invalid-layout", "error", `${field} must be a positive finite number.`, {
    type: input.type,
    path: `${input.path}.${field}`
  }));
  return undefined;
};

const optionalAspectRatio = (
  value: unknown,
  diagnostics: WidgetRegistryDiagnostic[],
  input: { type?: string; path: string }
): number | undefined => {
  if (value === undefined) return undefined;
  if (finitePositive(value) && value >= 0.01 && value <= 100) return value;
  diagnostics.push(diagnostic("widget-registry.invalid-layout", "error", "aspectRatio must be between 0.01 and 100.", {
    type: input.type,
    path: `${input.path}.aspectRatio`
  }));
  return undefined;
};

const normalizeResizeHandles = (
  value: unknown,
  diagnostics: WidgetRegistryDiagnostic[],
  input: { type?: string; path: string }
): ResizeHandleAxis[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    diagnostics.push(diagnostic("widget-registry.invalid-layout", "error", "resizeHandles must be an array.", {
      type: input.type,
      path: `${input.path}.resizeHandles`
    }));
    return undefined;
  }
  const out: ResizeHandleAxis[] = [];
  value.forEach((handle, index) => {
    if (typeof handle === "string" && RESIZE_HANDLE_SET.has(handle)) {
      const typed = handle as ResizeHandleAxis;
      if (!out.includes(typed)) out.push(typed);
      return;
    }
    diagnostics.push(diagnostic("widget-registry.invalid-layout", "error", "Invalid resize handle.", {
      type: input.type,
      path: `${input.path}.resizeHandles[${index}]`
    }));
  });
  return out;
};

export type NormalizeWidgetLayoutDefaultsOptions = {
  type?: string;
  path?: string;
  policy?: WidgetRegistryPolicy;
  includeFallback?: boolean;
};

export type NormalizeWidgetLayoutDefaultsResult = {
  ok: boolean;
  layout: WidgetLayoutDefaults;
  diagnostics: WidgetRegistryDiagnostic[];
};

export const widgetFallbackLayoutDefaults = (): Required<Pick<WidgetLayoutDefaults, "w" | "h">> => ({
  ...DEFAULT_SIZE
});

export const normalizeWidgetLayoutDefaults = (
  input: unknown,
  options: NormalizeWidgetLayoutDefaultsOptions = {}
): NormalizeWidgetLayoutDefaultsResult => {
  const policy = options.policy || "strict";
  const path = options.path || "layoutDefaults";
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  const layout: WidgetLayoutDefaults = options.includeFallback ? widgetFallbackLayoutDefaults() : {};

  if (input === undefined || input === null) {
    if (options.includeFallback) {
      diagnostics.push(diagnostic("widget-registry.invalid-layout", "info", "Widget layout defaults omitted; fallback size is used.", {
        type: options.type,
        path
      }));
    }
    return { ok: true, layout, diagnostics };
  }

  if (!isPlainRecord(input)) {
    diagnostics.push(diagnostic("widget-registry.invalid-layout", "error", "Widget layout defaults must be a plain object.", {
      type: options.type,
      path
    }));
    return { ok: false, layout, diagnostics };
  }

  const sizeFields = ["w", "h", "minW", "minH", "maxW", "maxH"] as const;
  sizeFields.forEach(field => {
    const value = optionalSize(input[field], field, diagnostics, { type: options.type, path, policy });
    if (value !== undefined) layout[field] = value;
  });

  const booleanFields = ["static", "draggable", "resizable", "bounded", "preserveAspectRatio"] as const;
  booleanFields.forEach(field => {
    const value = optionalBoolean(input[field]);
    if (value !== undefined) layout[field] = value;
  });

  const handles = normalizeResizeHandles(input.resizeHandles, diagnostics, { type: options.type, path });
  if (handles) layout.resizeHandles = handles;

  const aspectRatio = optionalAspectRatio(input.aspectRatio, diagnostics, { type: options.type, path });
  if (aspectRatio !== undefined) layout.aspectRatio = aspectRatio;

  if (input.extensions !== undefined) {
    const cloned = cloneJsonObject(input.extensions, { policy, path: `${path}.extensions` });
    diagnostics.push(...cloned.diagnostics);
    if (cloned.ok) layout.extensions = cloned.value;
  }

  if (finiteNonNegative(layout.maxW) && finiteNonNegative(layout.minW) && layout.maxW < layout.minW) {
    diagnostics.push(diagnostic("widget-registry.capability-conflict", "error", "maxW must be greater than or equal to minW.", {
      type: options.type,
      path
    }));
  }
  if (finiteNonNegative(layout.maxH) && finiteNonNegative(layout.minH) && layout.maxH < layout.minH) {
    diagnostics.push(diagnostic("widget-registry.capability-conflict", "error", "maxH must be greater than or equal to minH.", {
      type: options.type,
      path
    }));
  }
  if (layout.preserveAspectRatio && layout.aspectRatio === undefined) {
    diagnostics.push(diagnostic("widget-registry.capability-conflict", "warning", "preserveAspectRatio is set without an explicit aspectRatio; runtime may derive one from geometry.", {
      type: options.type,
      path
    }));
  }

  const ok = policy === "tolerant" || !diagnosticsHaveErrors(diagnostics);
  return { ok, layout, diagnostics };
};

export const mergeWidgetLayoutDefaults = (
  ...layouts: Array<WidgetLayoutDefaults | undefined>
): WidgetLayoutDefaults => {
  const out: WidgetLayoutDefaults = {};
  layouts.forEach(layout => {
    if (!layout) return;
    Object.assign(out, layout);
    if (layout.extensions) {
      out.extensions = {
        ...(out.extensions || {}),
        ...layout.extensions
      };
    }
  });
  return out;
};

export const widgetLayoutDefaultsToTemplateItem = (
  layout: WidgetLayoutDefaults,
  input: { id?: string; x?: number; y?: number } = {}
): Partial<LayoutItem> => ({
  i: input.id,
  x: typeof input.x === "number" && Number.isFinite(input.x) ? Math.floor(input.x) : 0,
  y: typeof input.y === "number" && Number.isFinite(input.y) ? Math.floor(input.y) : 0,
  w: layout.w || DEFAULT_SIZE.w,
  h: layout.h || DEFAULT_SIZE.h,
  minW: layout.minW,
  minH: layout.minH,
  maxW: layout.maxW,
  maxH: layout.maxH,
  static: layout.static,
  isDraggable: layout.draggable,
  isResizable: layout.resizable,
  isBounded: layout.bounded,
  resizeHandles: layout.resizeHandles
});

export const widgetLayoutDefaultsToPhysicalCapability = (
  layout: WidgetLayoutDefaults
): WidgetLayoutDefaults => ({
  static: layout.static,
  draggable: layout.draggable,
  resizable: layout.resizable,
  bounded: layout.bounded,
  resizeHandles: layout.resizeHandles,
  preserveAspectRatio: layout.preserveAspectRatio,
  aspectRatio: layout.aspectRatio
});
