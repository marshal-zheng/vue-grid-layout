import { bottom } from "../utils";
import type {
  GridHeightDiagnostic,
  GridHeightDiagnosticCode,
  GridHeightMode,
  GridHeightRuntime,
  GridRenderPrecision,
  ResolveGridHeightRuntimeOptions
} from "./types";

const VALID_HEIGHT_MODES: GridHeightMode[] = ["auto", "scroll", "fit", "fixed"];
const VALID_RENDER_PRECISIONS: GridRenderPrecision[] = ["integer", "subpixel"];
const DEFAULT_ROW_HEIGHT = 150;
const DEFAULT_MIN_ROW_HEIGHT = 1;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveFinite = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const pairAt = (value: number[] | undefined, index: number, fallback: number): number =>
  Array.isArray(value) && isFiniteNumber(value[index]) ? value[index] : fallback;

const jsonSafe = (value: unknown): unknown => {
  if (value == null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (typeof value !== "object") return String(value);
  const out: Record<string, unknown> = {};
  Object.keys(value as Record<string, unknown>).sort().forEach(key => {
    const entry = (value as Record<string, unknown>)[key];
    if (typeof entry === "function" || typeof entry === "symbol") return;
    out[key] = jsonSafe(entry);
  });
  return out;
};

const createDiagnostic = (
  options: ResolveGridHeightRuntimeOptions,
  code: GridHeightDiagnosticCode,
  level: GridHeightDiagnostic["level"],
  message: string,
  extra: Omit<GridHeightDiagnostic, "code" | "level" | "message"> = {}
): GridHeightDiagnostic => {
  const context = options.context || {};
  const details = typeof extra.details === "undefined" ? undefined : jsonSafe(extra.details);
  return {
    code,
    level,
    message,
    layoutId: context.layoutId,
    profileId: context.profileId || undefined,
    targetView: context.targetView,
    ...extra,
    details
  };
};

const sortDiagnostics = (diagnostics: GridHeightDiagnostic[]): GridHeightDiagnostic[] =>
  diagnostics.slice().sort((a, b) => {
    const aKey = [
      a.code,
      a.level,
      a.path || "",
      a.prop || "",
      a.layoutId || "",
      a.profileId || "",
      a.targetView || "",
      a.itemId || "",
      a.message
    ].join("|");
    const bKey = [
      b.code,
      b.level,
      b.path || "",
      b.prop || "",
      b.layoutId || "",
      b.profileId || "",
      b.targetView || "",
      b.itemId || "",
      b.message
    ].join("|");
    return aKey.localeCompare(bKey);
  });

const resolveRequestedMode = (
  options: ResolveGridHeightRuntimeOptions,
  diagnostics: GridHeightDiagnostic[]
): GridHeightMode => {
  if (options.heightMode != null) {
    if (VALID_HEIGHT_MODES.indexOf(options.heightMode as GridHeightMode) !== -1) {
      return options.heightMode as GridHeightMode;
    }
    diagnostics.push(createDiagnostic(
      options,
      "invalid-height-mode",
      "warning",
      "Invalid heightMode was ignored and auto height mode was used.",
      {
        prop: "heightMode",
        details: {
          received: options.heightMode,
          fallback: "auto",
          reason: "heightMode must be auto, scroll, fit, or fixed."
        }
      }
    ));
    return "auto";
  }
  return options.autoSize === false ? "scroll" : "auto";
};

const resolveRenderPrecision = (
  options: ResolveGridHeightRuntimeOptions,
  diagnostics: GridHeightDiagnostic[]
): GridRenderPrecision => {
  if (options.renderPrecision == null) return "integer";
  if (VALID_RENDER_PRECISIONS.indexOf(options.renderPrecision as GridRenderPrecision) !== -1) {
    return options.renderPrecision as GridRenderPrecision;
  }
  diagnostics.push(createDiagnostic(
    options,
    "invalid-render-precision",
    "warning",
    "Invalid renderPrecision was ignored and integer precision was used.",
    {
      prop: "renderPrecision",
      details: {
        received: options.renderPrecision,
        fallback: "integer",
        reason: "renderPrecision must be integer or subpixel."
      }
    }
  ));
  return "integer";
};

const resolveRowHeight = (
  options: ResolveGridHeightRuntimeOptions,
  diagnostics: GridHeightDiagnostic[]
): { rowHeight: number; defaultRowHeight: number } => {
  const defaultRowHeight = isPositiveFinite(options.defaultRowHeight)
    ? options.defaultRowHeight
    : DEFAULT_ROW_HEIGHT;
  if (isPositiveFinite(options.rowHeight)) {
    return { rowHeight: options.rowHeight, defaultRowHeight };
  }
  diagnostics.push(createDiagnostic(
    options,
    "invalid-row-height",
    "warning",
    "Invalid rowHeight was ignored and the default rowHeight was used.",
    {
      prop: "rowHeight",
      details: {
        received: options.rowHeight,
        fallback: defaultRowHeight,
        reason: "rowHeight must be a finite number greater than 0."
      }
    }
  ));
  return { rowHeight: defaultRowHeight, defaultRowHeight };
};

const resolveMinRowHeight = (
  options: ResolveGridHeightRuntimeOptions,
  diagnostics: GridHeightDiagnostic[]
): number => {
  if (typeof options.minRowHeight === "undefined" || options.minRowHeight == null) {
    return DEFAULT_MIN_ROW_HEIGHT;
  }
  if (isPositiveFinite(options.minRowHeight)) return options.minRowHeight;
  diagnostics.push(createDiagnostic(
    options,
    "invalid-min-row-height",
    "warning",
    "Invalid minRowHeight was ignored and the default minimum was used.",
    {
      prop: "minRowHeight",
      details: {
        received: options.minRowHeight,
        fallback: DEFAULT_MIN_ROW_HEIGHT,
        reason: "minRowHeight must be a finite number greater than 0."
      }
    }
  ));
  return DEFAULT_MIN_ROW_HEIGHT;
};

const resolveContainerHeight = (
  options: ResolveGridHeightRuntimeOptions,
  diagnostics: GridHeightDiagnostic[]
): { height: number | null; source: GridHeightRuntime["containerHeightSource"] } => {
  if (typeof options.containerHeight !== "undefined" && options.containerHeight !== null) {
    if (isPositiveFinite(options.containerHeight)) {
      return { height: options.containerHeight, source: "container-height" };
    }
    diagnostics.push(createDiagnostic(
      options,
      "invalid-container-height",
      "warning",
      "Invalid containerHeight was ignored.",
      {
        prop: "containerHeight",
        details: {
          received: options.containerHeight,
          fallback: null,
          reason: "containerHeight must be a finite number greater than 0."
        }
      }
    ));
  }

  if (options.autoMeasureContainerHeight === true) {
    if (isPositiveFinite(options.measuredContainerHeight)) {
      return { height: options.measuredContainerHeight, source: "measured-parent" };
    }
    diagnostics.push(createDiagnostic(
      options,
      "measurement-unavailable",
      "warning",
      "Measured parent container height was unavailable.",
      {
        prop: "autoMeasureContainerHeight",
        details: {
          received: options.measuredContainerHeight,
          fallback: null,
          reason: "The measured parent height must be a finite number greater than 0."
        }
      }
    ));
  }

  return { height: null, source: "fallback" };
};

const contentHeightFor = (
  rows: number,
  rowHeight: number,
  paddingY: number,
  marginY: number
): number =>
  rows === 0
    ? Math.max(0, paddingY * 2)
    : Math.max(0, rows * rowHeight + Math.max(0, rows - 1) * marginY + paddingY * 2);

const heightStyle = (value: number | null): string | null =>
  value == null ? null : `${Math.max(0, value)}px`;

export function resolveGridHeightRuntime(
  options: ResolveGridHeightRuntimeOptions
): GridHeightRuntime {
  const diagnostics: GridHeightDiagnostic[] = [];
  const measurementDiagnostics = Array.isArray(options.measurementDiagnostics)
    ? options.measurementDiagnostics
    : [];
  diagnostics.push(...measurementDiagnostics.map(item => ({
    ...item,
    details: typeof item.details === "undefined" ? undefined : jsonSafe(item.details)
  })));

  const requestedHeightMode = resolveRequestedMode(options, diagnostics);
  const renderPrecision = resolveRenderPrecision(options, diagnostics);
  const { rowHeight: baseRowHeight, defaultRowHeight } = resolveRowHeight(options, diagnostics);
  const minRowHeight = resolveMinRowHeight(options, diagnostics);
  const container = resolveContainerHeight(options, diagnostics);
  const marginY = pairAt(options.margin, 1, 0);
  const paddingY = pairAt(options.containerPadding, 1, marginY);
  const layout = Array.isArray(options.layout) ? options.layout : [];
  const bottomRows = bottom(layout);
  const baseContentHeight = contentHeightFor(bottomRows, baseRowHeight, paddingY, marginY);
  const autoSizeDisabledCompatibility = options.heightMode == null && options.autoSize === false;

  let effectiveHeightMode = requestedHeightMode;
  let rowHeight = baseRowHeight;
  let rowHeightSource: GridHeightRuntime["rowHeightSource"] = isPositiveFinite(options.rowHeight)
    ? "row-height"
    : "default";
  let containerHeight = container.height;
  let containerHeightSource = container.source;
  let contentHeight = baseContentHeight;
  let overflow: GridHeightRuntime["overflow"] = "visible";
  let fallbackApplied = false;
  let containerStyle: GridHeightRuntime["containerStyle"] = {
    height: requestedHeightMode === "auto" && !autoSizeDisabledCompatibility ? heightStyle(baseContentHeight) : null
  };

  if (requestedHeightMode === "auto") {
    effectiveHeightMode = "auto";
    containerHeight = null;
    containerHeightSource = "height-mode";
    overflow = "visible";
    containerStyle = {
      height: autoSizeDisabledCompatibility ? null : heightStyle(contentHeight)
    };
  } else if (requestedHeightMode === "fixed" || requestedHeightMode === "scroll") {
    if (container.height == null) {
      fallbackApplied = true;
      effectiveHeightMode = "auto";
      overflow = "visible";
      containerHeight = null;
      containerHeightSource = autoSizeDisabledCompatibility ? "auto-size" : "fallback";
      const code = requestedHeightMode === "fixed"
        ? "fixed-container-height-fallback"
        : "scroll-container-height-fallback";
      diagnostics.push(createDiagnostic(
        options,
        code,
        "warning",
        `${requestedHeightMode} height mode requires a usable container height and fell back to auto.`,
        {
          prop: "containerHeight",
          details: {
            requestedHeightMode,
            fallback: "auto",
            reason: "No finite container height greater than 0 was available."
          }
        }
      ));
      containerStyle = {
        height: autoSizeDisabledCompatibility ? null : heightStyle(contentHeight)
      };
    } else {
      overflow = requestedHeightMode === "fixed" ? "hidden" : "auto";
      containerStyle = {
        height: heightStyle(container.height),
        overflow
      };
    }
  } else if (requestedHeightMode === "fit") {
    if (container.height == null) {
      fallbackApplied = true;
      effectiveHeightMode = "auto";
      containerHeight = null;
      containerHeightSource = "fallback";
      overflow = "visible";
      diagnostics.push(createDiagnostic(
        options,
        "missing-container-height",
        "warning",
        "fit height mode requires a usable container height and fell back to auto.",
        {
          prop: "containerHeight",
          details: {
            requestedHeightMode,
            fallback: "auto",
            reason: "No finite container height greater than 0 was available."
          }
        }
      ));
      containerStyle = { height: heightStyle(contentHeight) };
    } else if (bottomRows === 0) {
      rowHeight = defaultRowHeight;
      rowHeightSource = "empty-fit-fallback";
      contentHeight = contentHeightFor(0, rowHeight, paddingY, marginY);
      overflow = "visible";
      diagnostics.push(createDiagnostic(
        options,
        "empty-fit-layout",
        "info",
        "fit height mode received an empty layout; container height was preserved and fallback rowHeight was used.",
        {
          details: {
            containerHeight: container.height,
            fallbackRowHeight: rowHeight
          }
        }
      ));
      containerStyle = { height: heightStyle(container.height) };
    } else {
      const fitRowHeight = (
        container.height - paddingY * 2 - Math.max(0, bottomRows - 1) * marginY
      ) / bottomRows;
      if (!isPositiveFinite(fitRowHeight) || fitRowHeight < minRowHeight) {
        fallbackApplied = true;
        effectiveHeightMode = "scroll";
        rowHeight = Math.max(minRowHeight, baseRowHeight);
        rowHeightSource = isPositiveFinite(options.minRowHeight) ? "fallback" : rowHeightSource;
        contentHeight = contentHeightFor(bottomRows, rowHeight, paddingY, marginY);
        overflow = "auto";
        diagnostics.push(createDiagnostic(
          options,
          "fit-min-row-height-fallback",
          "warning",
          "fit height mode resolved below minRowHeight and fell back to scroll.",
          {
            prop: "minRowHeight",
            details: {
              requestedHeightMode,
              fallback: "scroll",
              resolvedRowHeight: fitRowHeight,
              minRowHeight
            }
          }
        ));
        containerStyle = {
          height: heightStyle(container.height),
          overflow
        };
      } else {
        rowHeight = fitRowHeight;
        rowHeightSource = "fit";
        contentHeight = contentHeightFor(bottomRows, rowHeight, paddingY, marginY);
        overflow = "visible";
        containerStyle = { height: heightStyle(container.height) };
      }
    }
  }

  return {
    requestedHeightMode,
    effectiveHeightMode,
    renderPrecision,
    rowHeight,
    rowHeightSource,
    containerHeight,
    containerHeightSource,
    contentHeight,
    bottomRows,
    overflow,
    containerStyle,
    fallbackApplied,
    diagnostics: sortDiagnostics(diagnostics)
  };
}
