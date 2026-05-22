import type { LayoutItem, ResizeHandleAxis } from "./utils";

export type GridItemCapabilitySource =
  | "defaults"
  | "layout"
  | "dashboard"
  | "profile"
  | "editor"
  | "derived";

export type GridItemCapabilityDiagnosticCode =
  | "item-capability.conflict"
  | "item-capability.handle-disabled"
  | "item-capability.aspect-ratio-invalid"
  | "item-capability.metrics-missing"
  | "item-capability.fallback-used"
  | "item-capability.sidecar-projected"
  | "item-capability.unsafe-key"
  | "item-capability.unknown-field";

export type GridItemCapabilityDiagnostic = {
  code: GridItemCapabilityDiagnosticCode;
  level: "info" | "warning" | "error";
  message: string;
  itemId?: string;
  field?: string;
  source?: GridItemCapabilitySource;
  targetSource?: GridItemCapabilitySource;
  details?: unknown;
};

export type GridItemAspectRatioFallbackPolicy =
  | "block"
  | "grid-cell"
  | "start-geometry";

export type GridItemResizeMetrics = {
  colWidth: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding?: [number, number];
  renderPrecision?: "integer" | "subpixel";
};

export type GridItemAspectRatioConstraint = {
  enabled: boolean;
  ratio?: number;
  ratioKind: "visual-px";
  source: "explicit" | "start-geometry";
  fallbackPolicy: GridItemAspectRatioFallbackPolicy;
  edgeHandles: ResizeHandleAxis[];
  metrics?: GridItemResizeMetrics;
  startGeometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  ratioTolerance?: number;
};

export type LayoutResizeConstraint = {
  handlePolicy?: {
    allowedHandles?: ResizeHandleAxis[];
    blockedReason?: "handle-disabled" | "capability";
  };
  aspectRatio?: GridItemAspectRatioConstraint;
};

export type GridItemPhysicalCapabilityInput = {
  static?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  bounded?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  preserveAspectRatio?: boolean;
  aspectRatio?: number;
  aspectRatioEdgeHandles?: ResizeHandleAxis[];
  [key: string]: unknown;
};

export type GridItemEditorCapabilityInput = {
  locked?: boolean;
  visible?: boolean;
  editable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  deletable?: boolean;
  duplicatable?: boolean;
  copyable?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  [key: string]: unknown;
};

export type GridItemCapabilityDefaults = {
  visible?: boolean;
  editable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  bounded?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  deletable?: boolean;
  duplicatable?: boolean;
  copyable?: boolean;
};

export type ResolveGridItemCapabilityInput = {
  item: LayoutItem;
  dashboard?: GridItemPhysicalCapabilityInput;
  profile?: GridItemPhysicalCapabilityInput;
  editor?: GridItemEditorCapabilityInput;
  defaults?: GridItemCapabilityDefaults;
  metrics?: GridItemResizeMetrics;
  startGeometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  aspectRatioFallbackPolicy?: GridItemAspectRatioFallbackPolicy;
  preserveUnknownFields?: boolean;
};

export type ResolvedGridItemCapability = {
  id: string;
  visible: boolean;
  editable: boolean;
  draggable: boolean;
  resizable: boolean;
  bounded: boolean;
  static: boolean;
  locked: boolean;
  resizeHandles: ResizeHandleAxis[];
  deletable: boolean;
  duplicatable: boolean;
  copyable: boolean;
  aspectRatio?: GridItemAspectRatioConstraint;
  resizeConstraint?: LayoutResizeConstraint;
  sources: Record<string, GridItemCapabilitySource>;
  sourceLists: Record<string, GridItemCapabilitySource[]>;
  diagnostics: GridItemCapabilityDiagnostic[];
  metadata?: Record<string, unknown>;
};

export type GridItemVisualSize = {
  widthPx: number;
  heightPx: number;
};

export type AspectRatioResizeBounds = {
  cols?: number;
  maxRows?: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
};

export type GridItemAspectRatioResizeResult =
  | {
      kind: "allowed" | "degraded";
      candidate: LayoutItem;
      diagnostics: GridItemCapabilityDiagnostic[];
      ratio: number;
    }
  | {
      kind: "blocked";
      reason: "handle-disabled" | "aspect-ratio" | "metrics-missing" | "invalid-input";
      candidate?: LayoutItem;
      diagnostics: GridItemCapabilityDiagnostic[];
    };

const ALL_RESIZE_HANDLES: ResizeHandleAxis[] = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
const CORNER_RESIZE_HANDLES = new Set<ResizeHandleAxis>(["nw", "ne", "sw", "se"]);
const EDGE_RESIZE_HANDLES = new Set<ResizeHandleAxis>(["n", "s", "e", "w"]);
const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const KNOWN_PHYSICAL_FIELDS = new Set([
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "preserveAspectRatio",
  "aspectRatio",
  "aspectRatioEdgeHandles"
]);
const KNOWN_EDITOR_FIELDS = new Set([
  "locked",
  "visible",
  "editable",
  "draggable",
  "resizable",
  "deletable",
  "duplicatable",
  "copyable",
  "resizeHandles"
]);
const MIN_ASPECT_RATIO = 0.01;
const MAX_ASPECT_RATIO = 100;
const DEFAULT_RATIO_TOLERANCE = 0.15;

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isFinitePositive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const uniqHandles = (handles: ResizeHandleAxis[]): ResizeHandleAxis[] => {
  const seen = new Set<ResizeHandleAxis>();
  const out: ResizeHandleAxis[] = [];
  handles.forEach(handle => {
    if (seen.has(handle)) return;
    seen.add(handle);
    out.push(handle);
  });
  return out;
};

export const isResizeHandleAxis = (value: unknown): value is ResizeHandleAxis =>
  typeof value === "string" && ALL_RESIZE_HANDLES.indexOf(value as ResizeHandleAxis) !== -1;

export const normalizeResizeHandles = (
  handles: unknown
): ResizeHandleAxis[] | undefined => {
  if (!Array.isArray(handles)) return undefined;
  return uniqHandles(handles.filter(isResizeHandleAxis));
};

const intersectHandles = (
  a: ResizeHandleAxis[],
  b: ResizeHandleAxis[]
): ResizeHandleAxis[] => {
  const allowed = new Set(b);
  return a.filter(handle => allowed.has(handle));
};

const isSubset = (
  subset: ResizeHandleAxis[],
  superset: ResizeHandleAxis[]
): boolean => {
  const allowed = new Set(superset);
  return subset.every(handle => allowed.has(handle));
};

const isWestHandle = (handle: ResizeHandleAxis): boolean =>
  handle === "w" || handle === "sw" || handle === "nw";

const isNorthHandle = (handle: ResizeHandleAxis): boolean =>
  handle === "n" || handle === "ne" || handle === "nw";

const isHorizontalEdgeHandle = (handle: ResizeHandleAxis): boolean =>
  handle === "e" || handle === "w";

const isVerticalEdgeHandle = (handle: ResizeHandleAxis): boolean =>
  handle === "n" || handle === "s";

const diagnostic = (
  code: GridItemCapabilityDiagnosticCode,
  level: GridItemCapabilityDiagnostic["level"],
  message: string,
  input: Partial<GridItemCapabilityDiagnostic> = {}
): GridItemCapabilityDiagnostic => ({
  code,
  level,
  message,
  ...input
});

const pushSource = (
  sources: Record<string, GridItemCapabilitySource>,
  sourceLists: Record<string, GridItemCapabilitySource[]>,
  field: string,
  source: GridItemCapabilitySource
) => {
  sources[field] = source;
  sourceLists[field] = sourceLists[field] || [];
  if (sourceLists[field].indexOf(source) === -1) sourceLists[field].push(source);
};

const readBoolean = (
  source: GridItemPhysicalCapabilityInput | GridItemEditorCapabilityInput | undefined,
  key: string
): boolean | undefined => {
  if (!source || !hasOwn(source, key)) return undefined;
  return typeof source[key] === "boolean" ? source[key] as boolean : undefined;
};

const sanitizeUnknownFields = (
  input: Record<string, unknown> | undefined,
  knownFields: Set<string>,
  source: GridItemCapabilitySource,
  itemId: string,
  diagnostics: GridItemCapabilityDiagnostic[],
  preserveUnknownFields: boolean
): Record<string, unknown> | undefined => {
  if (!input) return undefined;
  const metadata: Record<string, unknown> = {};

  Object.keys(input).forEach(key => {
    if (RESERVED_KEYS.has(key)) {
      diagnostics.push(diagnostic(
        "item-capability.unsafe-key",
        "warning",
        "Ignored unsafe item capability key.",
        { itemId, field: key, source }
      ));
      return;
    }
    if (knownFields.has(key)) return;
    diagnostics.push(diagnostic(
      "item-capability.unknown-field",
      "info",
      "Ignored unknown item capability field.",
      { itemId, field: key, source }
    ));
    if (!preserveUnknownFields) return;
    const value = sanitizeJsonValue(input[key], diagnostics, itemId, key, source);
    if (typeof value !== "undefined") metadata[key] = value;
  });

  return Object.keys(metadata).length > 0 ? metadata : undefined;
};

const sanitizeJsonValue = (
  value: unknown,
  diagnostics: GridItemCapabilityDiagnostic[],
  itemId: string,
  field: string,
  source: GridItemCapabilitySource
): unknown => {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (Array.isArray(value)) {
    const out = value
      .map((entry, index) => sanitizeJsonValue(entry, diagnostics, itemId, `${field}[${index}]`, source))
      .filter(entry => typeof entry !== "undefined");
    return out;
  }
  if (isPlainRecord(value)) {
    const out: Record<string, unknown> = {};
    Object.keys(value).forEach(key => {
      if (RESERVED_KEYS.has(key)) {
        diagnostics.push(diagnostic(
          "item-capability.unsafe-key",
          "warning",
          "Ignored unsafe item capability metadata key.",
          { itemId, field: `${field}.${key}`, source }
        ));
        return;
      }
      const next = sanitizeJsonValue(value[key], diagnostics, itemId, `${field}.${key}`, source);
      if (typeof next !== "undefined") out[key] = next;
    });
    return out;
  }
  return undefined;
};

export const getGridItemVisualSize = (
  item: Pick<LayoutItem, "w" | "h">,
  metrics: GridItemResizeMetrics
): GridItemVisualSize => ({
  widthPx: item.w * metrics.colWidth + Math.max(0, item.w - 1) * metrics.margin[0],
  heightPx: item.h * metrics.rowHeight + Math.max(0, item.h - 1) * metrics.margin[1]
});

const gridSpanForVisualPixels = (
  px: number,
  cell: number,
  margin: number
): number => {
  const span = (px + margin) / (cell + margin);
  return Math.max(1, Math.round(span));
};

const getFallbackRatio = (
  item: Pick<LayoutItem, "w" | "h">,
  policy: GridItemAspectRatioFallbackPolicy
): number | undefined => {
  if (policy === "block") return undefined;
  if (!isFinitePositive(item.w) || !isFinitePositive(item.h)) return undefined;
  return item.w / item.h;
};

export const isValidAspectRatio = (ratio: unknown): ratio is number =>
  isFinitePositive(ratio) &&
  ratio >= MIN_ASPECT_RATIO &&
  ratio <= MAX_ASPECT_RATIO;

export const resolveGridItemAspectRatioConstraint = (input: {
  id: string;
  item: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  preserveAspectRatio?: boolean;
  aspectRatio?: number;
  edgeHandles?: ResizeHandleAxis[];
  metrics?: GridItemResizeMetrics;
  startGeometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  fallbackPolicy?: GridItemAspectRatioFallbackPolicy;
  ratioTolerance?: number;
}): { constraint?: GridItemAspectRatioConstraint; diagnostics: GridItemCapabilityDiagnostic[] } => {
  const diagnostics: GridItemCapabilityDiagnostic[] = [];
  if (input.preserveAspectRatio !== true) return { diagnostics };

  const fallbackPolicy = input.fallbackPolicy || "block";
  const startGeometry = input.startGeometry || input.item;
  let ratio = input.aspectRatio;
  let source: GridItemAspectRatioConstraint["source"] = "explicit";

  if (typeof ratio === "undefined") {
    source = "start-geometry";
    if (input.metrics) {
      const visualSize = getGridItemVisualSize(startGeometry, input.metrics);
      ratio = visualSize.widthPx / visualSize.heightPx;
    } else {
      ratio = getFallbackRatio(startGeometry, fallbackPolicy);
      if (typeof ratio !== "undefined" && fallbackPolicy !== "block") {
        diagnostics.push(diagnostic(
          "item-capability.fallback-used",
          "warning",
          "Aspect ratio was derived from fallback grid geometry.",
          { itemId: input.id, field: "aspectRatio", details: { fallbackPolicy } }
        ));
      }
    }
  }

  if (typeof ratio !== "undefined" && !isValidAspectRatio(ratio)) {
    diagnostics.push(diagnostic(
      "item-capability.aspect-ratio-invalid",
      "error",
      "Aspect ratio must be finite, positive, and within the supported range.",
      { itemId: input.id, field: "aspectRatio", details: { ratio } }
    ));
  }

  if (typeof ratio === "undefined" && !input.metrics && fallbackPolicy === "block") {
    diagnostics.push(diagnostic(
      "item-capability.metrics-missing",
      "warning",
      "Aspect ratio requires visual resize metrics before resize can commit.",
      { itemId: input.id, field: "metrics" }
    ));
  }

  return {
    constraint: {
      enabled: true,
      ratio,
      ratioKind: "visual-px",
      source,
      fallbackPolicy,
      edgeHandles: uniqHandles(input.edgeHandles || []),
      metrics: input.metrics,
      startGeometry,
      ratioTolerance: input.ratioTolerance
    },
    diagnostics
  };
};

const resolveAspectRatioFromConstraint = (
  item: Pick<LayoutItem, "w" | "h">,
  constraint: GridItemAspectRatioConstraint,
  itemId: string,
  diagnostics: GridItemCapabilityDiagnostic[]
): number | undefined => {
  if (typeof constraint.ratio !== "undefined") {
    if (isValidAspectRatio(constraint.ratio)) return constraint.ratio;
    diagnostics.push(diagnostic(
      "item-capability.aspect-ratio-invalid",
      "error",
      "Aspect ratio must be finite, positive, and within the supported range.",
      { itemId, field: "aspectRatio", details: { ratio: constraint.ratio } }
    ));
    return undefined;
  }

  const sourceGeometry = constraint.startGeometry || item;
  if (constraint.metrics) {
    const visualSize = getGridItemVisualSize(sourceGeometry, constraint.metrics);
    const ratio = visualSize.widthPx / visualSize.heightPx;
    return isValidAspectRatio(ratio) ? ratio : undefined;
  }

  const fallback = getFallbackRatio(sourceGeometry, constraint.fallbackPolicy);
  if (typeof fallback === "undefined") {
    diagnostics.push(diagnostic(
      "item-capability.metrics-missing",
      "error",
      "Aspect ratio resize was blocked because visual metrics are missing.",
      { itemId, field: "metrics" }
    ));
    return undefined;
  }

  diagnostics.push(diagnostic(
    "item-capability.fallback-used",
    "warning",
    "Aspect ratio resize used fallback grid geometry.",
    { itemId, field: "metrics", details: { fallbackPolicy: constraint.fallbackPolicy } }
  ));
  return fallback;
};

const withRatioAnchor = (
  start: LayoutItem,
  candidate: LayoutItem,
  handle: ResizeHandleAxis
): LayoutItem => {
  let x = candidate.x;
  let y = candidate.y;
  if (isWestHandle(handle)) x = start.x + start.w - candidate.w;
  if (isNorthHandle(handle)) y = start.y + start.h - candidate.h;
  return { ...candidate, x, y };
};

const getDominantAxis = (
  start: LayoutItem,
  rawCandidate: LayoutItem,
  handle: ResizeHandleAxis
): "width" | "height" => {
  if (isHorizontalEdgeHandle(handle)) return "width";
  if (isVerticalEdgeHandle(handle)) return "height";
  const widthDelta = Math.abs(rawCandidate.w - start.w) / Math.max(1, start.w);
  const heightDelta = Math.abs(rawCandidate.h - start.h) / Math.max(1, start.h);
  return widthDelta >= heightDelta ? "width" : "height";
};

const getGridCellMetrics = (): GridItemResizeMetrics => ({
  colWidth: 1,
  rowHeight: 1,
  margin: [0, 0],
  renderPrecision: "integer"
});

const visualRatioError = (
  item: Pick<LayoutItem, "w" | "h">,
  ratio: number,
  metrics: GridItemResizeMetrics
): number => {
  const visualSize = getGridItemVisualSize(item, metrics);
  const actual = visualSize.widthPx / visualSize.heightPx;
  return Math.abs(actual - ratio) / ratio;
};

export const resolveAspectRatioResizeCandidate = (input: {
  startItem: LayoutItem;
  rawCandidate: LayoutItem;
  handle: ResizeHandleAxis;
  constraint: GridItemAspectRatioConstraint;
  bounds?: AspectRatioResizeBounds;
}): GridItemAspectRatioResizeResult => {
  const { startItem, rawCandidate, handle, constraint } = input;
  const itemId = startItem.i;
  const diagnostics: GridItemCapabilityDiagnostic[] = [];
  if (!constraint.enabled) {
    return { kind: "allowed", candidate: rawCandidate, diagnostics, ratio: 0 };
  }

  if (EDGE_RESIZE_HANDLES.has(handle) && constraint.edgeHandles.indexOf(handle) === -1) {
    diagnostics.push(diagnostic(
      "item-capability.handle-disabled",
      "warning",
      "Edge handle is disabled for aspect-ratio resize.",
      { itemId, field: "resizeHandles", details: { handle } }
    ));
    return { kind: "blocked", reason: "handle-disabled", candidate: startItem, diagnostics };
  }

  const ratio = resolveAspectRatioFromConstraint(startItem, constraint, itemId, diagnostics);
  if (typeof ratio === "undefined") {
    const reason = diagnostics.some(item => item.code === "item-capability.metrics-missing")
      ? "metrics-missing"
      : "aspect-ratio";
    return { kind: "blocked", reason, candidate: startItem, diagnostics };
  }

  const metrics = constraint.metrics || (
    constraint.fallbackPolicy === "block" ? undefined : getGridCellMetrics()
  );
  if (!metrics) {
    diagnostics.push(diagnostic(
      "item-capability.metrics-missing",
      "error",
      "Aspect ratio resize was blocked because visual metrics are missing.",
      { itemId, field: "metrics" }
    ));
    return { kind: "blocked", reason: "metrics-missing", candidate: startItem, diagnostics };
  }

  let nextW = Math.max(1, Math.round(rawCandidate.w));
  let nextH = Math.max(1, Math.round(rawCandidate.h));
  const dominantAxis = getDominantAxis(startItem, rawCandidate, handle);

  if (dominantAxis === "width") {
    const widthPx = getGridItemVisualSize({ w: nextW, h: nextH }, metrics).widthPx;
    const targetHeightPx = widthPx / ratio;
    nextH = gridSpanForVisualPixels(targetHeightPx, metrics.rowHeight, metrics.margin[1]);
  } else {
    const heightPx = getGridItemVisualSize({ w: nextW, h: nextH }, metrics).heightPx;
    const targetWidthPx = heightPx * ratio;
    nextW = gridSpanForVisualPixels(targetWidthPx, metrics.colWidth, metrics.margin[0]);
  }

  const bounds = input.bounds || {};
  const minW = bounds.minW ?? startItem.minW ?? 1;
  const minH = bounds.minH ?? startItem.minH ?? 1;
  const maxW = bounds.maxW ?? startItem.maxW ?? bounds.cols ?? Number.MAX_SAFE_INTEGER;
  const maxH = bounds.maxH ?? startItem.maxH ?? bounds.maxRows ?? Number.MAX_SAFE_INTEGER;
  const clampedW = clamp(nextW, minW, maxW);
  const clampedH = clamp(nextH, minH, maxH);
  const clamped = clampedW !== nextW || clampedH !== nextH;
  nextW = clampedW;
  nextH = clampedH;

  const candidate = withRatioAnchor(startItem, {
    ...rawCandidate,
    w: nextW,
    h: nextH
  }, handle);
  const tolerance = constraint.ratioTolerance ?? DEFAULT_RATIO_TOLERANCE;
  const error = visualRatioError(candidate, ratio, metrics);

  if (clamped && error > tolerance) {
    diagnostics.push(diagnostic(
      "item-capability.aspect-ratio-invalid",
      "error",
      "Aspect ratio cannot be satisfied with the current min/max constraints.",
      {
        itemId,
        field: "aspectRatio",
        details: { ratio, actualError: error, tolerance, candidate }
      }
    ));
    return { kind: "blocked", reason: "aspect-ratio", candidate, diagnostics };
  }

  return {
    kind: clamped || diagnostics.some(item => item.code === "item-capability.fallback-used") ? "degraded" : "allowed",
    candidate,
    diagnostics,
    ratio
  };
};

const physicalInputFromLayout = (item: LayoutItem): GridItemPhysicalCapabilityInput => ({
  static: item.static,
  draggable: item.isDraggable,
  resizable: item.isResizable,
  bounded: item.isBounded,
  resizeHandles: item.resizeHandles
});

export const resolveGridItemCapability = (
  input: ResolveGridItemCapabilityInput
): ResolvedGridItemCapability => {
  const item = input.item;
  const itemId = item.i;
  const diagnostics: GridItemCapabilityDiagnostic[] = [];
  const sources: Record<string, GridItemCapabilitySource> = {};
  const sourceLists: Record<string, GridItemCapabilitySource[]> = {};
  const defaults = input.defaults || {};
  const preserveUnknownFields = input.preserveUnknownFields === true;
  const metadata: Record<string, unknown> = {};
  let visible = defaults.visible !== false;
  let editable = defaults.editable !== false;
  let draggable = defaults.draggable !== false;
  let resizable = defaults.resizable !== false;
  let bounded = defaults.bounded !== false;
  let isStatic = false;
  let locked = false;
  let deletable = defaults.deletable !== false;
  let duplicatable = defaults.duplicatable !== false;
  let copyable = defaults.copyable !== false;
  let handles = uniqHandles(defaults.resizeHandles || ALL_RESIZE_HANDLES);
  let preserveAspectRatio = false;
  let aspectRatio: number | undefined;
  let aspectRatioEdgeHandles: ResizeHandleAxis[] = [];

  Object.keys({
    visible,
    editable,
    draggable,
    resizable,
    bounded,
    resizeHandles: handles,
    deletable,
    duplicatable,
    copyable
  }).forEach(field => pushSource(sources, sourceLists, field, "defaults"));

  const applyPhysical = (
    sourceInput: GridItemPhysicalCapabilityInput | undefined,
    source: GridItemCapabilitySource
  ) => {
    if (!sourceInput) return;
    const inputMetadata = sanitizeUnknownFields(
      sourceInput,
      KNOWN_PHYSICAL_FIELDS,
      source,
      itemId,
      diagnostics,
      preserveUnknownFields
    );
    if (inputMetadata) metadata[source] = inputMetadata;

    const nextStatic = readBoolean(sourceInput, "static");
    if (typeof nextStatic !== "undefined") {
      isStatic = nextStatic;
      pushSource(sources, sourceLists, "static", source);
    }
    const nextDraggable = readBoolean(sourceInput, "draggable");
    if (typeof nextDraggable !== "undefined") {
      draggable = nextDraggable;
      pushSource(sources, sourceLists, "draggable", source);
    }
    const nextResizable = readBoolean(sourceInput, "resizable");
    if (typeof nextResizable !== "undefined") {
      resizable = nextResizable;
      pushSource(sources, sourceLists, "resizable", source);
    }
    const nextBounded = readBoolean(sourceInput, "bounded");
    if (typeof nextBounded !== "undefined") {
      bounded = nextBounded;
      pushSource(sources, sourceLists, "bounded", source);
    }
    const nextHandles = normalizeResizeHandles(sourceInput.resizeHandles);
    if (nextHandles) {
      handles = nextHandles;
      pushSource(sources, sourceLists, "resizeHandles", source);
    }
    const nextPreserveAspectRatio = readBoolean(sourceInput, "preserveAspectRatio");
    if (typeof nextPreserveAspectRatio !== "undefined") {
      preserveAspectRatio = nextPreserveAspectRatio;
      pushSource(sources, sourceLists, "preserveAspectRatio", source);
    }
    if (typeof sourceInput.aspectRatio !== "undefined") {
      aspectRatio = typeof sourceInput.aspectRatio === "number" ? sourceInput.aspectRatio : undefined;
      pushSource(sources, sourceLists, "aspectRatio", source);
    }
    const nextAspectRatioEdgeHandles = normalizeResizeHandles(sourceInput.aspectRatioEdgeHandles);
    if (nextAspectRatioEdgeHandles) {
      aspectRatioEdgeHandles = nextAspectRatioEdgeHandles.filter(handle => EDGE_RESIZE_HANDLES.has(handle));
      pushSource(sources, sourceLists, "aspectRatioEdgeHandles", source);
    }
  };

  applyPhysical(physicalInputFromLayout(item), "layout");
  applyPhysical(input.dashboard, "dashboard");
  applyPhysical(input.profile, "profile");

  if (isStatic) {
    if (draggable || resizable) {
      diagnostics.push(diagnostic(
        "item-capability.conflict",
        "warning",
        "static=true forces direct drag and resize off.",
        { itemId, field: "static", source: sources.static, targetSource: sources.draggable }
      ));
    }
    draggable = false;
    resizable = false;
    pushSource(sources, sourceLists, "draggable", sources.static || "layout");
    pushSource(sources, sourceLists, "resizable", sources.static || "layout");
  }

  const physicalDraggable = draggable;
  const physicalResizable = resizable;
  const physicalHandles = handles.slice();
  const editor = input.editor;
  if (editor) {
    const inputMetadata = sanitizeUnknownFields(
      editor,
      KNOWN_EDITOR_FIELDS,
      "editor",
      itemId,
      diagnostics,
      preserveUnknownFields
    );
    if (inputMetadata) metadata.editor = inputMetadata;

    if (typeof editor.locked === "boolean") {
      locked = editor.locked;
      pushSource(sources, sourceLists, "locked", "editor");
    }
    if (typeof editor.visible === "boolean") {
      visible = editor.visible;
      pushSource(sources, sourceLists, "visible", "editor");
    }
    if (typeof editor.editable === "boolean") {
      editable = editable && editor.editable;
      pushSource(sources, sourceLists, "editable", "editor");
    }
    if (typeof editor.draggable === "boolean") {
      if (editor.draggable === false) {
        draggable = false;
      } else if (!physicalDraggable) {
        diagnostics.push(diagnostic(
          "item-capability.conflict",
          "warning",
          "Editor metadata cannot loosen physical draggable=false.",
          { itemId, field: "draggable", source: "editor", targetSource: sources.draggable }
        ));
      }
      pushSource(sources, sourceLists, "draggable", "editor");
    }
    if (typeof editor.resizable === "boolean") {
      if (editor.resizable === false) {
        resizable = false;
      } else if (!physicalResizable) {
        diagnostics.push(diagnostic(
          "item-capability.conflict",
          "warning",
          "Editor metadata cannot loosen physical resizable=false.",
          { itemId, field: "resizable", source: "editor", targetSource: sources.resizable }
        ));
      }
      pushSource(sources, sourceLists, "resizable", "editor");
    }
    if (typeof editor.deletable === "boolean") {
      deletable = deletable && editor.deletable;
      pushSource(sources, sourceLists, "deletable", "editor");
    }
    if (typeof editor.duplicatable === "boolean") {
      duplicatable = duplicatable && editor.duplicatable;
      pushSource(sources, sourceLists, "duplicatable", "editor");
    }
    if (typeof editor.copyable === "boolean") {
      copyable = copyable && editor.copyable;
      pushSource(sources, sourceLists, "copyable", "editor");
    }
    const editorHandles = normalizeResizeHandles(editor.resizeHandles);
    if (editorHandles) {
      if (!isSubset(editorHandles, physicalHandles)) {
        diagnostics.push(diagnostic(
          "item-capability.conflict",
          "warning",
          "Editor resize handles cannot loosen physical handle policy.",
          {
            itemId,
            field: "resizeHandles",
            source: "editor",
            targetSource: sources.resizeHandles,
            details: { requested: editorHandles, physical: physicalHandles }
          }
        ));
      }
      handles = intersectHandles(physicalHandles, editorHandles);
      pushSource(sources, sourceLists, "resizeHandles", "editor");
    }
  }

  if (locked) {
    editable = false;
    draggable = false;
    resizable = false;
    deletable = false;
    duplicatable = false;
    pushSource(sources, sourceLists, "editable", "editor");
  }

  if (!visible) {
    draggable = false;
    resizable = false;
  }

  if (!resizable) {
    handles = [];
  }

  let aspectRatioConstraint: GridItemAspectRatioConstraint | undefined;
  if (preserveAspectRatio) {
    const aspect = resolveGridItemAspectRatioConstraint({
      id: itemId,
      item,
      preserveAspectRatio,
      aspectRatio,
      edgeHandles: aspectRatioEdgeHandles,
      metrics: input.metrics,
      startGeometry: input.startGeometry,
      fallbackPolicy: input.aspectRatioFallbackPolicy
    });
    diagnostics.push(...aspect.diagnostics);
    aspectRatioConstraint = aspect.constraint;
    if (aspectRatioConstraint) {
      const allowedRatioHandles = aspectRatioEdgeHandles.length > 0
        ? uniqHandles([...Array.from(CORNER_RESIZE_HANDLES), ...aspectRatioEdgeHandles])
        : Array.from(CORNER_RESIZE_HANDLES);
      handles = intersectHandles(handles, allowedRatioHandles);
      pushSource(sources, sourceLists, "resizeHandles", sources.aspectRatioEdgeHandles || "derived");
      pushSource(sources, sourceLists, "aspectRatio", sources.aspectRatio || "derived");
    }
  }

  const resizeConstraint: LayoutResizeConstraint | undefined =
    aspectRatioConstraint || handles.length > 0
      ? {
          handlePolicy: { allowedHandles: handles.slice(), blockedReason: "handle-disabled" },
          aspectRatio: aspectRatioConstraint
        }
      : resizable
        ? { handlePolicy: { allowedHandles: [], blockedReason: "handle-disabled" } }
        : undefined;

  return {
    id: itemId,
    visible,
    editable: editable && !isStatic && !locked,
    draggable,
    resizable,
    bounded: draggable && bounded,
    static: isStatic,
    locked,
    resizeHandles: handles,
    deletable: editable && !locked && deletable,
    duplicatable: editable && !locked && duplicatable,
    copyable: visible && copyable,
    aspectRatio: aspectRatioConstraint,
    resizeConstraint,
    sources,
    sourceLists,
    diagnostics,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
  };
};

