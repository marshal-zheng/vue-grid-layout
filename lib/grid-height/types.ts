import type { Layout } from "../utils";

export type GridHeightMode = "auto" | "scroll" | "fit" | "fixed";
export type GridRenderPrecision = "integer" | "subpixel";

export type GridHeightSource =
  | "height-mode"
  | "auto-size"
  | "container-height"
  | "measured-parent"
  | "fallback";

export type GridRowHeightSource =
  | "row-height"
  | "fit"
  | "mobile-row-height"
  | "default"
  | "empty-fit-fallback"
  | "fallback";

export type GridHeightDiagnosticLevel = "info" | "warning" | "error";

export type GridHeightDiagnosticCode =
  | "missing-container-height"
  | "measurement-unavailable"
  | "fit-min-row-height-fallback"
  | "fixed-container-height-fallback"
  | "scroll-container-height-fallback"
  | "empty-fit-layout"
  | "invalid-height-mode"
  | "invalid-container-height"
  | "invalid-row-height"
  | "invalid-min-row-height"
  | "invalid-render-precision"
  | "mode-alias-conflict"
  | "unsupported-dashboard-field";

export const GRID_HEIGHT_DIAGNOSTIC_CODES = {
  missingContainerHeight: "missing-container-height",
  measurementUnavailable: "measurement-unavailable",
  fitMinRowHeightFallback: "fit-min-row-height-fallback",
  fixedContainerHeightFallback: "fixed-container-height-fallback",
  scrollContainerHeightFallback: "scroll-container-height-fallback",
  emptyFitLayout: "empty-fit-layout",
  invalidHeightMode: "invalid-height-mode",
  invalidContainerHeight: "invalid-container-height",
  invalidRowHeight: "invalid-row-height",
  invalidMinRowHeight: "invalid-min-row-height",
  invalidRenderPrecision: "invalid-render-precision",
  modeAliasConflict: "mode-alias-conflict",
  unsupportedDashboardField: "unsupported-dashboard-field"
} as const;

export type GridHeightDiagnostic = {
  code: GridHeightDiagnosticCode;
  level: GridHeightDiagnosticLevel;
  message: string;
  prop?: string;
  path?: string;
  layoutId?: string;
  profileId?: string;
  targetView?: "desktop" | "mobile";
  itemId?: string;
  details?: unknown;
};

export type ResolveGridHeightRuntimeOptions = {
  layout: Layout;
  autoSize?: boolean;
  heightMode?: GridHeightMode | null;
  rowHeight?: number;
  defaultRowHeight?: number;
  minRowHeight?: number;
  margin: [number, number] | number[];
  containerPadding: [number, number] | number[];
  containerHeight?: number | null;
  measuredContainerHeight?: number | null;
  measurementDiagnostics?: GridHeightDiagnostic[];
  autoMeasureContainerHeight?: boolean;
  renderPrecision?: GridRenderPrecision | null;
  context?: {
    layoutId?: string;
    profileId?: string | null;
    targetView?: "desktop" | "mobile";
    source?: "grid" | "dashboard-responsive";
  };
};

export type GridHeightRuntime = {
  requestedHeightMode: GridHeightMode;
  effectiveHeightMode: GridHeightMode;
  renderPrecision: GridRenderPrecision;
  rowHeight: number;
  rowHeightSource: GridRowHeightSource;
  containerHeight: number | null;
  containerHeightSource: GridHeightSource;
  contentHeight: number;
  bottomRows: number;
  overflow: "visible" | "hidden" | "auto";
  containerStyle: {
    height: string | null;
    overflow?: "hidden" | "auto";
  };
  fallbackApplied: boolean;
  diagnostics: GridHeightDiagnostic[];
};
