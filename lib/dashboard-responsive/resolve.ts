import {
  projectDashboardLayoutDocument,
  serializeDashboardLayoutDocument,
  validateDashboardLayoutDocument,
  writeDashboardRuntimeToDocument,
  type DashboardDiagnostic,
  type DashboardDocumentError,
  type DashboardGridSettings,
  type DashboardItemLayout,
  type DashboardItemLayoutOverride,
  type DashboardLayoutDefinition,
  type DashboardLayoutDocument,
  type ResolvedDashboardGridSettings
} from "../dashboard";
import type { GridEditorMetaById } from "../editor";
import type { Layout, LayoutItem } from "../utils";
import type {
  CreateDashboardDocumentFromResponsiveLayoutsOptions,
  DashboardResponsiveDiagnosticInput,
  DashboardHeightOptionOverrides,
  DashboardResponsiveMigrationResult,
  DashboardResponsiveMode,
  DashboardResponsiveProfileResult,
  DashboardResponsiveRuntime,
  DashboardResponsiveWriteResult,
  DashboardTargetView,
  DashboardTargetViewRule,
  DashboardTargetViewSource,
  ResolveDashboardResponsiveProfileOptions,
  WriteDashboardResponsiveRuntimeOptions
} from "./types";
import {
  resolveGridHeightRuntime,
  type GridHeightDiagnostic,
  type GridHeightMode,
  type GridHeightRuntime,
  type GridRenderPrecision
} from "../grid-height";

const DEFAULT_BREAKPOINT = "default";
const DEFAULT_COLUMNS = 12;
const DEFAULT_MARGIN = 10;
const DEFAULT_CONTAINER_PADDING: [number, number] = [0, 0];
const DEFAULT_ROW_HEIGHT = 150;
export const DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE = "grid-height-runtime";

const DASHBOARD_PROFILE_DEFERRED_ITEM_FIELDS = [
  "preserveAspectRatio",
  "aspectRatio"
];

const DASHBOARD_PROFILE_DEFERRED_SETTINGS_FIELDS = [
  "mobileDisplayLayoutFirst",
  "layoutDimension",
  "backgroundColor",
  "backgroundSizeMode",
  "backgroundImageUrl"
];

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const positiveInteger = (value: unknown, fallback: number): number =>
  isFiniteNumber(value) && value > 0 ? Math.floor(value) : fallback;

const isTuple = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  isFiniteNumber(value[0]) &&
  isFiniteNumber(value[1]);

const cloneJson = <T>(value: T): T => {
  const json = JSON.stringify(value);
  return typeof json === "undefined" ? value : JSON.parse(json) as T;
};

const cloneLayout = (layout: Layout): Layout => layout.map(item => ({ ...item }));

const createWriteItemFilter = (
  ids: string[] | undefined
): ((id: string) => boolean) | null => {
  if (!ids) return null;
  const set = new Set(ids.filter(Boolean));
  return id => set.has(id);
};

const isGridHeightMode = (value: unknown): value is GridHeightMode =>
  value === "auto" || value === "scroll" || value === "fit" || value === "fixed";

const isGridRenderPrecision = (value: unknown): value is GridRenderPrecision =>
  value === "integer" || value === "subpixel";

const toPair = (
  value: number | [number, number] | undefined,
  fallback: [number, number] = [DEFAULT_MARGIN, DEFAULT_MARGIN]
): [number, number] => {
  if (isTuple(value)) return [value[0], value[1]];
  if (isFiniteNumber(value)) return [value, value];
  return [fallback[0], fallback[1]];
};

const createError = (
  code: DashboardDocumentError["code"],
  message: string,
  extra: Partial<DashboardDocumentError> = {}
): DashboardDocumentError => ({
  code,
  message,
  ...extra
});

export function createDashboardResponsiveDiagnostic(
  code: string,
  level: DashboardDiagnostic["level"],
  message: string,
  extra: DashboardResponsiveDiagnosticInput = {}
): DashboardDiagnostic {
  return {
    code,
    level,
    message,
    ...extra
  };
}

export function isDashboardHeightDiagnostic(diagnostic: DashboardDiagnostic): boolean {
  return isPlainRecord(diagnostic.details) &&
    diagnostic.details.source === DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE;
}

export function createDashboardHeightDiagnostic(
  diagnostic: GridHeightDiagnostic,
  runtime: Pick<DashboardResponsiveRuntime, "layoutId" | "resolvedProfileId" | "targetView">
): DashboardDiagnostic {
  return {
    code: diagnostic.code,
    level: diagnostic.level,
    message: diagnostic.message,
    path: diagnostic.path,
    itemId: diagnostic.itemId,
    profileId: diagnostic.profileId || runtime.resolvedProfileId || undefined,
    layoutId: diagnostic.layoutId || runtime.layoutId,
    targetView: diagnostic.targetView || runtime.targetView,
    details: {
      ...(isPlainRecord(diagnostic.details) ? diagnostic.details : { value: diagnostic.details }),
      source: DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE,
      prop: diagnostic.prop
    }
  };
}

const hasExplicitHeightOption = (
  options: DashboardHeightOptionOverrides,
  key: keyof DashboardHeightOptionOverrides
) => Object.prototype.hasOwnProperty.call(options, key);

const resolveDashboardRuntimeHeight = (
  layout: Layout,
  gridSettings: ResolvedDashboardGridSettings,
  heightOptions: DashboardHeightOptionOverrides,
  context: Pick<DashboardResponsiveRuntime, "layoutId" | "resolvedProfileId" | "targetView">
): GridHeightRuntime => {
  const rowHeight = hasExplicitHeightOption(heightOptions, "rowHeight")
    ? heightOptions.rowHeight
    : gridSettings.rowHeight;
  return resolveGridHeightRuntime({
    layout,
    heightMode: heightOptions.heightMode,
    rowHeight,
    minRowHeight: heightOptions.minRowHeight,
    margin: toPair(gridSettings.margin),
    containerPadding: gridSettings.containerPadding || DEFAULT_CONTAINER_PADDING,
    containerHeight: heightOptions.containerHeight,
    autoMeasureContainerHeight: heightOptions.autoMeasureContainerHeight,
    renderPrecision: heightOptions.renderPrecision,
    context: {
      source: "dashboard-responsive",
      layoutId: context.layoutId,
      profileId: context.resolvedProfileId,
      targetView: context.targetView
    }
  });
};

const sortBreakpoints = (breakpoints: Record<string, number>): string[] =>
  Object.keys(breakpoints || {})
    .filter(key => isFiniteNumber(breakpoints[key]))
    .sort((a, b) => {
      const diff = breakpoints[a] - breakpoints[b];
      return diff !== 0 ? diff : a.localeCompare(b);
    });

const resolveRequestedBreakpoint = (
  options: ResolveDashboardResponsiveProfileOptions,
  diagnostics: DashboardDiagnostic[]
): string => {
  const breakpoints = options.breakpoints || {};
  const keys = sortBreakpoints(breakpoints);
  if (options.breakpoint) {
    if (!hasOwn(breakpoints, options.breakpoint)) {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "invalid-breakpoint",
        "warning",
        `Breakpoint "${options.breakpoint}" is not present in the breakpoint map.`,
        { details: { breakpoint: options.breakpoint } }
      ));
    }
    return options.breakpoint;
  }
  if (keys.length === 0) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "invalid-breakpoint",
      "warning",
      "No breakpoints were provided; default dashboard layout will be used.",
      { details: { width: options.width } }
    ));
    return DEFAULT_BREAKPOINT;
  }
  if (!isFiniteNumber(options.width)) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "invalid-breakpoint",
      "warning",
      "Width is not a finite number; the smallest breakpoint was selected.",
      { details: { width: options.width, breakpoint: keys[0] } }
    ));
    return keys[0];
  }
  let matching = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const key = keys[i];
    if (options.width > breakpoints[key]) matching = key;
  }
  return matching;
};

const isTargetView = (value: unknown): value is DashboardTargetView =>
  value === "desktop" || value === "mobile";

const resolveTargetView = (
  requestedBreakpoint: string,
  options: ResolveDashboardResponsiveProfileOptions,
  diagnostics: DashboardDiagnostic[]
): { targetView: DashboardTargetView; source: DashboardTargetViewSource } => {
  if (options.targetView) {
    return { targetView: options.targetView, source: "explicit" };
  }

  const rule: DashboardTargetViewRule | undefined = options.targetViewRule;
  if (rule?.resolve) {
    try {
      const resolved = rule.resolve({
        width: options.width,
        requestedBreakpoint,
        breakpoints: options.breakpoints || {}
      });
      if (isTargetView(resolved)) {
        return { targetView: resolved, source: "resolver" };
      }
    } catch (cause) {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "projection-validation-failed",
        "warning",
        "Target view resolver failed; fallback target view rules were used.",
        { details: { cause } }
      ));
    }
  }

  if (Array.isArray(rule?.mobileBreakpointIds) && rule.mobileBreakpointIds.indexOf(requestedBreakpoint) !== -1) {
    return { targetView: "mobile", source: "breakpoint-id" };
  }

  if (isFiniteNumber(rule?.mobileMaxWidth) && isFiniteNumber(options.width) && options.width <= rule.mobileMaxWidth) {
    return { targetView: "mobile", source: "width" };
  }

  const targetView = requestedBreakpoint === "xs" || requestedBreakpoint === "xxs"
    ? "mobile"
    : "desktop";
  diagnostics.push(createDashboardResponsiveDiagnostic(
    "target-view-default",
    "info",
    "Target view was inferred by the built-in default rule.",
    { details: { requestedBreakpoint, targetView } }
  ));
  return { targetView, source: "default" };
};

const normalizeMargin = (
  value: DashboardGridSettings["margin"] | undefined,
  diagnostics: DashboardDiagnostic[],
  layoutId: string,
  profileId: string | null
): number | [number, number] => {
  if (isFiniteNumber(value) || isTuple(value)) return value;
  diagnostics.push(createDashboardResponsiveDiagnostic(
    "settings-default",
    "info",
    "Dashboard grid setting margin was missing; default value was used.",
    { layoutId, profileId: profileId || undefined, path: "gridSettings.margin", details: { value: DEFAULT_MARGIN } }
  ));
  return DEFAULT_MARGIN;
};

const normalizePadding = (
  value: DashboardGridSettings["containerPadding"] | undefined,
  diagnostics: DashboardDiagnostic[],
  layoutId: string,
  profileId: string | null
): [number, number] => {
  if (isTuple(value)) return [value[0], value[1]];
  diagnostics.push(createDashboardResponsiveDiagnostic(
    "settings-default",
    "info",
    "Dashboard grid setting containerPadding was missing; default value was used.",
    { layoutId, profileId: profileId || undefined, path: "gridSettings.containerPadding", details: { value: DEFAULT_CONTAINER_PADDING } }
  ));
  return DEFAULT_CONTAINER_PADDING.slice() as [number, number];
};

const resolveSettings = (
  defaultSettings: DashboardGridSettings | undefined,
  profileSettings: DashboardGridSettings | undefined,
  diagnostics: DashboardDiagnostic[],
  layoutId: string,
  profileId: string | null
): ResolvedDashboardGridSettings => {
  const merged: DashboardGridSettings = {
    ...(defaultSettings || {}),
    ...(profileSettings || {})
  };
  if (typeof merged.columns === "undefined") {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "settings-default",
      "info",
      "Dashboard grid setting columns was missing; default value was used.",
      { layoutId, profileId: profileId || undefined, path: "gridSettings.columns", details: { value: DEFAULT_COLUMNS } }
    ));
  }
  if (typeof merged.rowHeight === "undefined") {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "settings-default",
      "info",
      "Dashboard grid setting rowHeight was missing; default value was used.",
      { layoutId, profileId: profileId || undefined, path: "gridSettings.rowHeight", details: { value: DEFAULT_ROW_HEIGHT } }
    ));
  }
  return {
    ...merged,
    columns: positiveInteger(merged.columns, DEFAULT_COLUMNS),
    minColumns: positiveInteger(merged.minColumns, 1),
    margin: normalizeMargin(merged.margin, diagnostics, layoutId, profileId),
    outerMargin: merged.outerMargin ?? true,
    containerPadding: normalizePadding(merged.containerPadding, diagnostics, layoutId, profileId),
    viewFormat: merged.viewFormat === "list" ? "list" : "grid",
    rowHeight: positiveInteger(merged.rowHeight, DEFAULT_ROW_HEIGHT),
    autoFillHeight: merged.autoFillHeight ?? false,
    heightMode: isGridHeightMode(merged.heightMode) ? merged.heightMode : undefined,
    mobileHeightMode: isGridHeightMode(merged.mobileHeightMode) ? merged.mobileHeightMode : undefined,
    minRowHeight: isFiniteNumber(merged.minRowHeight) && merged.minRowHeight > 0 ? merged.minRowHeight : undefined,
    mobileRowHeight: isFiniteNumber(merged.mobileRowHeight) && merged.mobileRowHeight > 0 ? Math.floor(merged.mobileRowHeight) : undefined,
    mobileAutoFillHeight: merged.mobileAutoFillHeight ?? false,
    renderPrecision: isGridRenderPrecision(merged.renderPrecision) ? merged.renderPrecision : "integer"
  };
};

const isExplicitHeightOption = (
  explicit: DashboardHeightOptionOverrides = {},
  key: "heightMode" | "containerHeight" | "autoMeasureContainerHeight" | "minRowHeight" | "rowHeight" | "renderPrecision"
): boolean => Object.prototype.hasOwnProperty.call(explicit, key);

export function resolveDashboardHeightOptions(
  settings: ResolvedDashboardGridSettings,
  context: {
    targetView: DashboardTargetView;
    explicit?: DashboardHeightOptionOverrides;
    diagnostics: DashboardDiagnostic[];
    layoutId: string;
    profileId: string | null;
  }
): DashboardHeightOptionOverrides {
  const diagnostics = context.diagnostics;
  const profilePath = context.profileId
    ? `layouts.${context.layoutId}.profiles.${context.profileId}.gridSettings`
    : `layouts.${context.layoutId}.gridSettings`;
  const targetIsMobile = context.targetView === "mobile";
  const mobileAutoFill = settings.mobileAutoFillHeight === true;
  const desktopAutoFill = settings.autoFillHeight === true;
  const hasMobileMode = targetIsMobile && isGridHeightMode(settings.mobileHeightMode);
  const hasBaseMode = isGridHeightMode(settings.heightMode);

  if (hasBaseMode && desktopAutoFill && settings.heightMode !== "fit") {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "mode-alias-conflict",
      "warning",
      "Explicit dashboard heightMode overrides autoFillHeight.",
      {
        layoutId: context.layoutId,
        profileId: context.profileId || undefined,
        targetView: context.targetView,
        path: `${profilePath}.heightMode`,
        details: { heightMode: settings.heightMode, autoFillHeight: settings.autoFillHeight }
      }
    ));
  }
  if (hasMobileMode && mobileAutoFill && settings.mobileHeightMode !== "fit") {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "mode-alias-conflict",
      "warning",
      "Explicit dashboard mobileHeightMode overrides mobileAutoFillHeight.",
      {
        layoutId: context.layoutId,
        profileId: context.profileId || undefined,
        targetView: context.targetView,
        path: `${profilePath}.mobileHeightMode`,
        details: { mobileHeightMode: settings.mobileHeightMode, mobileAutoFillHeight: settings.mobileAutoFillHeight }
      }
    ));
  }

  const aliasedMode: GridHeightMode | undefined =
    targetIsMobile && !hasMobileMode && mobileAutoFill
      ? "fit"
      : !hasBaseMode && desktopAutoFill
        ? "fit"
        : undefined;
  const profileMode: GridHeightMode = hasMobileMode
    ? settings.mobileHeightMode as GridHeightMode
    : hasBaseMode
      ? settings.heightMode as GridHeightMode
      : aliasedMode || "auto";
  const rowHeight = targetIsMobile && isFiniteNumber(settings.mobileRowHeight) && settings.mobileRowHeight > 0
    ? settings.mobileRowHeight
    : settings.rowHeight;

  const out: DashboardHeightOptionOverrides = {
    heightMode: profileMode,
    rowHeight,
    minRowHeight: settings.minRowHeight,
    renderPrecision: settings.renderPrecision || "integer"
  };

  const explicit = context.explicit;
  if (isExplicitHeightOption(explicit, "heightMode")) out.heightMode = explicit?.heightMode ?? null;
  if (isExplicitHeightOption(explicit, "rowHeight")) out.rowHeight = explicit?.rowHeight;
  if (isExplicitHeightOption(explicit, "minRowHeight")) out.minRowHeight = explicit?.minRowHeight;
  if (isExplicitHeightOption(explicit, "containerHeight")) out.containerHeight = explicit?.containerHeight ?? null;
  if (isExplicitHeightOption(explicit, "autoMeasureContainerHeight")) out.autoMeasureContainerHeight = explicit?.autoMeasureContainerHeight;
  if (isExplicitHeightOption(explicit, "renderPrecision")) out.renderPrecision = explicit?.renderPrecision ?? null;
  return out;
}

const toRuntimeLayoutItem = (id: string, item: DashboardItemLayout): LayoutItem => {
  const runtime: LayoutItem = {
    i: id,
    x: item.col,
    y: item.row,
    w: item.sizeX,
    h: item.sizeY
  };
  if (typeof item.minSizeX !== "undefined") runtime.minW = item.minSizeX;
  if (typeof item.minSizeY !== "undefined") runtime.minH = item.minSizeY;
  if (typeof item.maxSizeX !== "undefined") runtime.maxW = item.maxSizeX;
  if (typeof item.maxSizeY !== "undefined") runtime.maxH = item.maxSizeY;
  if (typeof item.static !== "undefined") runtime.static = item.static;
  if (typeof item.draggable !== "undefined") runtime.isDraggable = item.draggable;
  if (typeof item.resizable !== "undefined") runtime.isResizable = item.resizable;
  if (typeof item.bounded !== "undefined") runtime.isBounded = item.bounded;
  if (item.resizeHandles) runtime.resizeHandles = item.resizeHandles.slice();
  return runtime;
};

const layoutSorter = (a: LayoutItem, b: LayoutItem): number => {
  if (a.y !== b.y) return a.y - b.y;
  if (a.x !== b.x) return a.x - b.x;
  return a.i < b.i ? -1 : a.i > b.i ? 1 : 0;
};

const dashboardItemSorter = (
  a: { id: string; item: DashboardItemLayout },
  b: { id: string; item: DashboardItemLayout }
): number => {
  if (a.item.row !== b.item.row) return a.item.row - b.item.row;
  if (a.item.col !== b.item.col) return a.item.col - b.item.col;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

const isValidMobileOrder = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0;

const listSorter = (
  targetView: DashboardTargetView,
  a: { id: string; item: DashboardItemLayout },
  b: { id: string; item: DashboardItemLayout }
): number => {
  if (targetView === "mobile") {
    const aOrder = a.item.mobileOrder;
    const bOrder = b.item.mobileOrder;
    const aHasOrder = isValidMobileOrder(aOrder);
    const bHasOrder = isValidMobileOrder(bOrder);
    if (aHasOrder && bHasOrder && aOrder !== bOrder) return aOrder - bOrder;
    if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;
  }
  return dashboardItemSorter(a, b);
};

const mergeDashboardItem = (
  base: DashboardItemLayout,
  override: DashboardItemLayoutOverride | undefined
): DashboardItemLayout => ({
  ...base,
  ...(override || {})
});

const itemFromOverride = (override: DashboardItemLayoutOverride): DashboardItemLayout => ({
  col: positiveInteger(override.col, 0),
  row: positiveInteger(override.row, 0),
  sizeX: positiveInteger(override.sizeX, 1),
  sizeY: positiveInteger(override.sizeY, 1),
  ...override
} as DashboardItemLayout);

const isHiddenInView = (
  item: DashboardItemLayout,
  targetView: DashboardTargetView
): boolean => targetView === "mobile"
  ? item.mobileHide === true
  : item.desktopHide === true;

const collectUnsupportedProfileFieldDiagnostics = (
  profileId: string | null,
  layoutId: string,
  profileSettings: DashboardGridSettings | undefined,
  effectiveItems: Array<{ id: string; item: DashboardItemLayout }>,
  diagnostics: DashboardDiagnostic[]
) => {
  if (!profileId) return;
  DASHBOARD_PROFILE_DEFERRED_SETTINGS_FIELDS.forEach(field => {
    if (profileSettings && typeof profileSettings[field] !== "undefined") {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "unsupported-profile-field",
        "info",
        `Profile grid setting ${field} is preserved but not directly mapped to the base grid runtime in this version.`,
        { layoutId, profileId, path: `layouts.${layoutId}.profiles.${profileId}.gridSettings.${field}` }
      ));
    }
  });
  effectiveItems.forEach(entry => {
    DASHBOARD_PROFILE_DEFERRED_ITEM_FIELDS.forEach(field => {
      if (typeof entry.item[field] !== "undefined") {
        diagnostics.push(createDashboardResponsiveDiagnostic(
          "item-capability.sidecar-projected",
          "info",
          `Profile item field ${field} was projected through capability sidecar and not written to LayoutItem.`,
          {
            layoutId,
            profileId,
            itemId: entry.id,
            path: `layouts.${layoutId}.profiles.${profileId}.widgets.${entry.id}.${field}`
          }
        ));
      }
    });
  });
};

const buildEffectiveItems = (
  layoutDefinition: DashboardLayoutDefinition,
  profileId: string | null,
  options: ResolveDashboardResponsiveProfileOptions,
  diagnostics: DashboardDiagnostic[],
  layoutId: string
): Array<{ id: string; item: DashboardItemLayout }> => {
  const profile = profileId ? layoutDefinition.profiles?.[profileId] : undefined;
  const effective: Record<string, DashboardItemLayout> = {};
  Object.keys(layoutDefinition.widgets)
    .sort()
    .forEach(id => {
      effective[id] = mergeDashboardItem(layoutDefinition.widgets[id], profile?.widgets?.[id]);
    });
  if (profile?.widgets) {
    Object.keys(profile.widgets)
      .sort()
      .forEach(id => {
        if (hasOwn(layoutDefinition.widgets, id)) return;
        diagnostics.push(createDashboardResponsiveDiagnostic(
          "unknown-profile-item",
          "warning",
          `Dashboard profile "${profileId}" contains unknown widget "${id}".`,
          {
            layoutId,
            profileId: profileId || undefined,
            itemId: id,
            path: `layouts.${layoutId}.profiles.${profileId}.widgets.${id}`
          }
        ));
        if (options.allowUnknownProfileItems) {
          effective[id] = itemFromOverride((profile.widgets as Record<string, DashboardItemLayoutOverride>)[id]);
        }
      });
  }
  return Object.keys(effective)
    .map(id => ({ id, item: effective[id] }))
    .sort(dashboardItemSorter);
};

const mergeEditorMeta = (
  base: GridEditorMetaById,
  profile: GridEditorMetaById | undefined
): GridEditorMetaById => {
  const merged: GridEditorMetaById = {};
  Object.keys(base || {}).forEach(id => {
    merged[id] = { ...base[id] };
  });
  Object.keys(profile || {}).forEach(id => {
    merged[id] = {
      ...(merged[id] || {}),
      ...(profile as GridEditorMetaById)[id]
    };
  });
  return merged;
};

const buildGridRuntimeLayout = (
  items: Array<{ id: string; item: DashboardItemLayout }>,
  targetView: DashboardTargetView,
  mode: DashboardResponsiveMode,
  editorMetaById: GridEditorMetaById
): Pick<DashboardResponsiveRuntime, "layout" | "allItemIds" | "activeItemIds" | "renderItemIds" | "hiddenItemIds" | "editorMetaById"> => {
  const hiddenItemIds: string[] = [];
  const allItemIds: string[] = items.map(entry => entry.id);
  const layout: Layout = [];
  const nextMeta: GridEditorMetaById = mergeEditorMeta(editorMetaById, undefined);

  items.forEach(entry => {
    const hidden = isHiddenInView(entry.item, targetView);
    if (hidden) hiddenItemIds.push(entry.id);
    const meta = { ...(nextMeta[entry.id] || {}) };
    if (hidden) meta.visible = false;
    else if (typeof meta.visible === "undefined") meta.visible = true;
    nextMeta[entry.id] = meta;
    if (mode === "view" && hidden) return;
    layout.push(toRuntimeLayoutItem(entry.id, entry.item));
  });

  layout.sort(layoutSorter);
  const activeItemIds = mode === "view"
    ? allItemIds.filter(id => hiddenItemIds.indexOf(id) === -1)
    : allItemIds.slice();
  return {
    layout,
    allItemIds,
    activeItemIds,
    renderItemIds: activeItemIds.slice(),
    hiddenItemIds,
    editorMetaById: nextMeta
  };
};

const deriveListHeight = (
  entry: { id: string; item: DashboardItemLayout },
  targetView: DashboardTargetView,
  diagnostics: DashboardDiagnostic[],
  layoutId: string,
  profileId: string | null
): number => {
  if (targetView === "mobile" && isFiniteNumber(entry.item.mobileHeight) && entry.item.mobileHeight > 0) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "list-height-source",
      "info",
      "Mobile list item height was derived from mobileHeight.",
      { layoutId, profileId: profileId || undefined, itemId: entry.id, details: { source: "mobileHeight" } }
    ));
    return Math.floor(entry.item.mobileHeight);
  }
  if (isFiniteNumber(entry.item.sizeY) && entry.item.sizeY > 0) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "list-height-source",
      "info",
      "List item height was derived from sizeY.",
      { layoutId, profileId: profileId || undefined, itemId: entry.id, details: { source: "sizeY" } }
    ));
    return Math.floor(entry.item.sizeY);
  }
  diagnostics.push(createDashboardResponsiveDiagnostic(
    "list-height-default",
    "warning",
    "List item height was invalid; default height 1 was used.",
    { layoutId, profileId: profileId || undefined, itemId: entry.id, details: { source: "default" } }
  ));
  return 1;
};

const buildListRuntimeLayout = (
  items: Array<{ id: string; item: DashboardItemLayout }>,
  targetView: DashboardTargetView,
  mode: DashboardResponsiveMode,
  columns: number,
  editorMetaById: GridEditorMetaById,
  diagnostics: DashboardDiagnostic[],
  layoutId: string,
  profileId: string | null
): Pick<DashboardResponsiveRuntime, "layout" | "allItemIds" | "activeItemIds" | "renderItemIds" | "hiddenItemIds" | "editorMetaById"> => {
  const sorted = items.slice().sort((a, b) => listSorter(targetView, a, b));
  const hiddenItemIds: string[] = [];
  const allItemIds = sorted.map(entry => entry.id);
  const layout: Layout = [];
  const nextMeta: GridEditorMetaById = mergeEditorMeta(editorMetaById, undefined);
  let y = 0;

  sorted.forEach(entry => {
    const hidden = isHiddenInView(entry.item, targetView);
    if (hidden) hiddenItemIds.push(entry.id);
    const meta = { ...(nextMeta[entry.id] || {}) };
    if (hidden) meta.visible = false;
    else if (typeof meta.visible === "undefined") meta.visible = true;
    nextMeta[entry.id] = meta;
    const h = deriveListHeight(entry, targetView, diagnostics, layoutId, profileId);
    if (mode === "view" && hidden) return;
    layout.push({
      ...toRuntimeLayoutItem(entry.id, entry.item),
      x: 0,
      y,
      w: columns,
      h
    });
    y += h;
  });

  const activeItemIds = mode === "view"
    ? allItemIds.filter(id => hiddenItemIds.indexOf(id) === -1)
    : allItemIds.slice();
  return {
    layout,
    allItemIds,
    activeItemIds,
    renderItemIds: activeItemIds.slice(),
    hiddenItemIds,
    editorMetaById: nextMeta
  };
};

const getRawPrimaryLayoutId = (document: unknown): string | null =>
  isPlainRecord(document) && typeof document.primaryLayoutId === "string"
    ? document.primaryLayoutId
    : null;

const profilePathFor = (layoutId: string, profileId: string): string =>
  `layouts.${layoutId}.profiles.${profileId}`;

const diagnosticTargetsProfile = (
  diagnostic: DashboardDiagnostic,
  layoutId: string,
  profileId: string
): boolean => {
  const profilePath = profilePathFor(layoutId, profileId);
  return diagnostic.profileId === profileId ||
    diagnostic.path === profilePath ||
    Boolean(diagnostic.path?.startsWith(`${profilePath}.`));
};

const removeProfileFromDocument = (
  document: DashboardLayoutDocument,
  layoutId: string,
  profileId: string
): DashboardLayoutDocument | null => {
  try {
    const next = cloneJson(document) as unknown;
    if (!isPlainRecord(next) || !isPlainRecord(next.layouts)) return null;
    const layout = next.layouts[layoutId];
    if (!isPlainRecord(layout) || !isPlainRecord(layout.profiles) || !hasOwn(layout.profiles, profileId)) {
      return null;
    }
    delete layout.profiles[profileId];
    if (Object.keys(layout.profiles).length === 0) delete layout.profiles;
    return next as DashboardLayoutDocument;
  } catch {
    return null;
  }
};

const validateDashboardDocumentForResponsiveProjection = (
  document: DashboardLayoutDocument,
  requestedBreakpoint: string,
  options: ResolveDashboardResponsiveProfileOptions,
  diagnostics: DashboardDiagnostic[]
): {
  ok: true;
  document: DashboardLayoutDocument;
  invalidProfileFallback: boolean;
  profileFallbackReported: boolean;
} | {
  ok: false;
  error: DashboardDocumentError;
} => {
  const validation = validateDashboardLayoutDocument(document, { validation: options.validation ?? "strict" });
  if (validation.ok) {
    diagnostics.push(...validation.diagnostics);
    return {
      ok: true,
      document: validation.document,
      invalidProfileFallback: false,
      profileFallbackReported: false
    };
  }

  const rawPrimaryLayoutId = getRawPrimaryLayoutId(document);
  const rawLayoutId = options.layoutId && options.layoutId === rawPrimaryLayoutId
    ? options.layoutId
    : rawPrimaryLayoutId;
  const canTryProfileFallback = Boolean(rawLayoutId && requestedBreakpoint !== DEFAULT_BREAKPOINT);
  const failedInsideRequestedProfile = canTryProfileFallback &&
    validation.diagnostics.some(item => diagnosticTargetsProfile(item, rawLayoutId as string, requestedBreakpoint));
  const fallbackDocument = failedInsideRequestedProfile
    ? removeProfileFromDocument(document, rawLayoutId as string, requestedBreakpoint)
    : null;

  if (fallbackDocument) {
    const fallbackValidation = validateDashboardLayoutDocument(fallbackDocument, { validation: options.validation ?? "strict" });
    if (fallbackValidation.ok) {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "profile-fallback",
        "warning",
        `Dashboard profile "${requestedBreakpoint}" is invalid; resolved primary layout.`,
        {
          layoutId: rawLayoutId as string,
          profileId: requestedBreakpoint,
          path: profilePathFor(rawLayoutId as string, requestedBreakpoint),
          details: {
            reason: validation.error.message,
            diagnostics: validation.diagnostics
          }
        }
      ));
      diagnostics.push(...fallbackValidation.diagnostics);
      return {
        ok: true,
        document: fallbackValidation.document,
        invalidProfileFallback: true,
        profileFallbackReported: true
      };
    }
  }

  diagnostics.push(...validation.diagnostics);
  diagnostics.push(createDashboardResponsiveDiagnostic(
    "projection-validation-failed",
    "error",
    validation.error.message,
    { path: validation.error.path, details: validation.error.details }
  ));
  return { ok: false, error: validation.error };
};

export function resolveDashboardResponsiveProfile(
  document: DashboardLayoutDocument,
  options: ResolveDashboardResponsiveProfileOptions
): DashboardResponsiveProfileResult {
  const diagnostics: DashboardDiagnostic[] = [];
  const requestedBreakpoint = resolveRequestedBreakpoint(options, diagnostics);
  const mode: DashboardResponsiveMode = options.mode || "view";
  const targetViewResult = resolveTargetView(requestedBreakpoint, options, diagnostics);
  const validation = validateDashboardDocumentForResponsiveProjection(
    document,
    requestedBreakpoint,
    options,
    diagnostics
  );
  if (!validation.ok) {
    return { ok: false, error: validation.error, diagnostics };
  }

  const source = validation.document;
  let fallbackApplied = validation.invalidProfileFallback;
  let layoutId = options.layoutId || source.primaryLayoutId;
  if (layoutId !== source.primaryLayoutId) {
    fallbackApplied = true;
    layoutId = source.primaryLayoutId;
  }
  const layoutDefinition = source.layouts[layoutId];
  const profile = layoutDefinition.profiles?.[requestedBreakpoint];
  const resolvedProfileId = profile ? requestedBreakpoint : null;
  if (!profile) {
    fallbackApplied = true;
    if (!validation.profileFallbackReported) {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "profile-fallback",
        "warning",
        `Dashboard profile "${requestedBreakpoint}" was not found; resolved primary layout.`,
        { layoutId, profileId: requestedBreakpoint, path: `layouts.${layoutId}.profiles.${requestedBreakpoint}` }
      ));
    }
  }

  const projection = projectDashboardLayoutDocument(source, {
    layoutId,
    profileId: resolvedProfileId || undefined,
    targetView: targetViewResult.targetView,
    validation: options.validation ?? "strict"
  });
  if (!projection.ok) {
    diagnostics.push(...projection.diagnostics);
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "projection-validation-failed",
      "error",
      projection.error.message,
      { path: projection.error.path, details: projection.error.details }
    ));
    return { ok: false, error: projection.error, diagnostics };
  }
  diagnostics.push(...projection.diagnostics);

  const effectiveItems = buildEffectiveItems(layoutDefinition, resolvedProfileId, options, diagnostics, layoutId);
  const gridSettings = resolveSettings(
    layoutDefinition.gridSettings,
    resolvedProfileId ? layoutDefinition.profiles?.[resolvedProfileId]?.gridSettings : undefined,
    diagnostics,
    layoutId,
    resolvedProfileId
  );
  collectUnsupportedProfileFieldDiagnostics(
    resolvedProfileId,
    layoutId,
    resolvedProfileId ? layoutDefinition.profiles?.[resolvedProfileId]?.gridSettings : undefined,
    effectiveItems,
    diagnostics
  );

  const editorMetaById = mergeEditorMeta(
    projection.projection.editorMetaById,
    resolvedProfileId ? layoutDefinition.profiles?.[resolvedProfileId]?.editor?.editorMetaById : undefined
  );
  const viewFormat = gridSettings.viewFormat;
  const projectionFields = viewFormat === "list"
    ? buildListRuntimeLayout(
        effectiveItems,
        targetViewResult.targetView,
        mode,
        gridSettings.columns,
        editorMetaById,
        diagnostics,
        layoutId,
        resolvedProfileId
      )
    : buildGridRuntimeLayout(effectiveItems, targetViewResult.targetView, mode, editorMetaById);
  const heightOptions = resolveDashboardHeightOptions(gridSettings, {
    targetView: targetViewResult.targetView,
    diagnostics,
    layoutId,
    profileId: resolvedProfileId
  });
  const heightRuntime = resolveDashboardRuntimeHeight(
    projectionFields.layout,
    gridSettings,
    heightOptions,
    {
      layoutId,
      resolvedProfileId,
      targetView: targetViewResult.targetView
    }
  );
  const heightDiagnostics = heightRuntime.diagnostics.map(diagnostic =>
    createDashboardHeightDiagnostic(diagnostic, {
      layoutId,
      resolvedProfileId,
      targetView: targetViewResult.targetView
    })
  );
  diagnostics.push(...heightDiagnostics);

  const runtime: DashboardResponsiveRuntime = {
    layout: projectionFields.layout,
    gridSettings,
    editorMetaById: projectionFields.editorMetaById,
    capabilitiesById: projection.projection.capabilitiesById,
    resizeConstraintsById: projection.projection.resizeConstraintsById,
    layoutId,
    requestedBreakpoint,
    resolvedProfileId,
    targetView: targetViewResult.targetView,
    targetViewSource: targetViewResult.source,
    mode,
    viewFormat,
    heightOptions,
    heightRuntime,
    fallbackApplied: fallbackApplied || projection.projection.fallbackApplied,
    allItemIds: projectionFields.allItemIds,
    activeItemIds: projectionFields.activeItemIds,
    renderItemIds: projectionFields.renderItemIds,
    hiddenItemIds: projectionFields.hiddenItemIds,
    diagnostics
  };
  return {
    ok: true,
    runtime,
    diagnostics
  };
}

const sortCommittedLayout = (layout: Layout): Layout =>
  cloneLayout(layout).sort(layoutSorter);

const assertWritableRuntimeItems = (
  committedLayout: Layout,
  layoutDefinition: DashboardLayoutDefinition,
  options: WriteDashboardResponsiveRuntimeOptions,
  diagnostics: DashboardDiagnostic[],
  layoutId: string,
  profileId: string | null
): DashboardDocumentError | null => {
  for (let i = 0; i < committedLayout.length; i++) {
    const item = committedLayout[i];
    if (!isFiniteNumber(item.x) || !isFiniteNumber(item.y) || !isFiniteNumber(item.w) || !isFiniteNumber(item.h) || item.w <= 0 || item.h <= 0) {
      return createError("validation", `Runtime layout item "${item.i}" has invalid geometry.`, {
        path: `layout.${i}`,
        details: { item }
      });
    }
    if (!hasOwn(layoutDefinition.widgets, item.i) && !options.createMissingItems) {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "unknown-profile-item",
        "error",
        `Runtime layout contains unknown dashboard widget "${item.i}".`,
        { layoutId, profileId: profileId || undefined, itemId: item.i }
      ));
      return createError("unknown-item", `Runtime layout contains unknown dashboard widget "${item.i}".`, {
        details: { itemId: item.i }
      });
    }
  }
  return null;
};

const patchItemFromLayout = (item: LayoutItem): DashboardItemLayoutOverride => {
  const patch: DashboardItemLayoutOverride = {
    col: item.x,
    row: item.y,
    sizeX: item.w,
    sizeY: item.h
  };
  if (typeof item.minW !== "undefined") patch.minSizeX = item.minW;
  if (typeof item.minH !== "undefined") patch.minSizeY = item.minH;
  if (typeof item.maxW !== "undefined") patch.maxSizeX = item.maxW;
  if (typeof item.maxH !== "undefined") patch.maxSizeY = item.maxH;
  return patch;
};

export function writeDashboardResponsiveRuntimeToDocument(
  document: DashboardLayoutDocument,
  runtime: DashboardResponsiveRuntime,
  committedLayout: Layout,
  options: WriteDashboardResponsiveRuntimeOptions = {}
): DashboardResponsiveWriteResult {
  const diagnostics: DashboardDiagnostic[] = [];
  const mode = options.mode || runtime.mode;
  const targetView = options.targetView || runtime.targetView;
  const viewFormat = options.viewFormat || runtime.viewFormat;
  const requestedBreakpoint = options.requestedBreakpoint || runtime.requestedBreakpoint;
  let resolvedProfileId = typeof options.resolvedProfileId !== "undefined"
    ? options.resolvedProfileId
    : runtime.resolvedProfileId;

  const validation = validateDashboardLayoutDocument(document, { validation: options.validation ?? "strict" });
  diagnostics.push(...validation.diagnostics);
  const baseDocument = validation.ok ? validation.document : cloneJson(document);
  if (!validation.ok) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "projection-validation-failed",
      "error",
      validation.error.message,
      { path: validation.error.path, details: validation.error.details }
    ));
    return {
      ok: false,
      error: validation.error,
      document: baseDocument,
      originalPayload: validation.originalPayload,
      diagnostics
    };
  }

  if (runtime.fallbackApplied && !resolvedProfileId && requestedBreakpoint !== DEFAULT_BREAKPOINT) {
    if (mode === "view") {
      diagnostics.push(createDashboardResponsiveDiagnostic(
        "write-back-noop",
        "info",
        "Fallback view runtime is read-only; no dashboard profile was created.",
        { layoutId: runtime.layoutId, profileId: requestedBreakpoint }
      ));
      return {
        ok: true,
        document: validation.document,
        diagnostics
      };
    }
    if (!options.createMissingProfileOnEdit) {
      const issue = createDashboardResponsiveDiagnostic(
        "missing-profile-write-blocked",
        "error",
        `Dashboard profile "${requestedBreakpoint}" is missing; profile-scoped write-back was blocked.`,
        { layoutId: runtime.layoutId, profileId: requestedBreakpoint }
      );
      diagnostics.push(issue);
      return {
        ok: false,
        error: createError("validation", issue.message, { path: `layouts.${runtime.layoutId}.profiles.${requestedBreakpoint}` }),
        document: validation.document,
        diagnostics
      };
    }
    resolvedProfileId = requestedBreakpoint;
  }

  if (viewFormat === "grid") {
    const written = writeDashboardRuntimeToDocument(document, {
      layout: committedLayout,
      editorMetaById: options.editorMetaById || runtime.editorMetaById
    }, {
      layoutId: options.layoutId || runtime.layoutId,
      profileId: resolvedProfileId || undefined,
      targetView,
      createMissingItems: options.createMissingItems,
      removeMissingItems: options.removeMissingItems,
      createMissingProfile: Boolean(options.createMissingProfileOnEdit),
      writeItemIds: options.writeItemIds,
      validation: options.validation ?? "strict"
    });
    return {
      ...written,
      diagnostics: diagnostics.concat(written.diagnostics)
    };
  }

  const next = cloneJson(validation.document);
  const layoutId = options.layoutId || runtime.layoutId || next.primaryLayoutId;
  const layoutDefinition = next.layouts[layoutId];
  if (!layoutDefinition) {
    const issue = createDashboardResponsiveDiagnostic(
      "projection-validation-failed",
      "error",
      `Dashboard layout "${layoutId}" was not found.`,
      { layoutId }
    );
    diagnostics.push(issue);
    return {
      ok: false,
      error: createError("invalid-document", issue.message, { path: `layouts.${layoutId}` }),
      document: next,
      diagnostics
    };
  }

  const shouldWriteItem = createWriteItemFilter(options.writeItemIds);
  const committedIds = new Set(committedLayout.map(item => item.i));
  const sorted = sortCommittedLayout(committedLayout);
  const writableItems = shouldWriteItem
    ? sorted.filter(item => shouldWriteItem(item.i))
    : sorted;
  const writableError = assertWritableRuntimeItems(writableItems, layoutDefinition, options, diagnostics, layoutId, resolvedProfileId);
  if (writableError) {
    return {
      ok: false,
      error: writableError,
      document: next,
      diagnostics
    };
  }

  let targetWidgets: Record<string, DashboardItemLayoutOverride>;
  if (resolvedProfileId) {
    layoutDefinition.profiles = layoutDefinition.profiles || {};
    if (!layoutDefinition.profiles[resolvedProfileId]) {
      if (!options.createMissingProfileOnEdit) {
        const issue = createDashboardResponsiveDiagnostic(
          "missing-profile-write-blocked",
          "error",
          `Dashboard profile "${resolvedProfileId}" is missing; profile-scoped write-back was blocked.`,
          { layoutId, profileId: resolvedProfileId }
        );
        diagnostics.push(issue);
        return {
          ok: false,
          error: createError("validation", issue.message, { path: `layouts.${layoutId}.profiles.${resolvedProfileId}` }),
          document: next,
          diagnostics
        };
      }
      layoutDefinition.profiles[resolvedProfileId] = { widgets: {} };
    }
    layoutDefinition.profiles[resolvedProfileId].widgets = layoutDefinition.profiles[resolvedProfileId].widgets || {};
    targetWidgets = layoutDefinition.profiles[resolvedProfileId].widgets as Record<string, DashboardItemLayoutOverride>;
  } else {
    targetWidgets = layoutDefinition.widgets;
  }

  if (options.removeMissingItems && options.writeItemIds?.length) {
    options.writeItemIds.filter(Boolean).forEach(id => {
      if (committedIds.has(id)) return;
      delete layoutDefinition.widgets[id];
      delete targetWidgets[id];
      Object.values(layoutDefinition.profiles || {}).forEach(profile => {
        if (profile.widgets) delete profile.widgets[id];
        if (profile.editor?.editorMetaById) delete profile.editor.editorMetaById[id];
      });
      if (layoutDefinition.editor?.editorMetaById) {
        delete layoutDefinition.editor.editorMetaById[id];
      }
    });
  }

  sorted.forEach((item, index) => {
    if (shouldWriteItem && !shouldWriteItem(item.i)) return;
    if (!hasOwn(layoutDefinition.widgets, item.i)) {
      layoutDefinition.widgets[item.i] = patchItemFromLayout(item) as DashboardItemLayout;
    }
    const previous = targetWidgets[item.i] || {};
    if (targetView === "mobile") {
      targetWidgets[item.i] = {
        ...previous,
        mobileOrder: index,
        mobileHeight: item.h
      };
    } else {
      targetWidgets[item.i] = {
        ...previous,
        row: index,
        sizeY: item.h
      };
    }
  });

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

const getMapValue = <T>(
  value: Record<string, T | null> | T | null | undefined,
  breakpoint: string
): T | null | undefined => {
  if (value == null) return value;
  if (Array.isArray(value)) return value as T;
  if (typeof value === "object" && hasOwn(value, breakpoint)) {
    return (value as Record<string, T | null>)[breakpoint] || undefined;
  }
  return value as T;
};

const layoutItemToDashboardItem = (item: LayoutItem): DashboardItemLayout => {
  const dashboardItem: DashboardItemLayout = {
    col: item.x,
    row: item.y,
    sizeX: item.w,
    sizeY: item.h
  };
  if (typeof item.minW !== "undefined") dashboardItem.minSizeX = item.minW;
  if (typeof item.minH !== "undefined") dashboardItem.minSizeY = item.minH;
  if (typeof item.maxW !== "undefined") dashboardItem.maxSizeX = item.maxW;
  if (typeof item.maxH !== "undefined") dashboardItem.maxSizeY = item.maxH;
  if (typeof item.static !== "undefined") dashboardItem.static = item.static;
  if (typeof item.isDraggable !== "undefined") dashboardItem.draggable = item.isDraggable;
  if (typeof item.isResizable !== "undefined") dashboardItem.resizable = item.isResizable;
  if (typeof item.isBounded !== "undefined") dashboardItem.bounded = item.isBounded;
  if (item.resizeHandles) dashboardItem.resizeHandles = item.resizeHandles.slice();
  return dashboardItem;
};

const layoutItemToDashboardOverride = (item: LayoutItem): DashboardItemLayoutOverride =>
  patchItemFromLayout(item);

const gridSettingsFromResponsive = (
  breakpoint: string,
  options: CreateDashboardDocumentFromResponsiveLayoutsOptions,
  diagnostics: DashboardDiagnostic[]
): DashboardGridSettings => {
  const settings: DashboardGridSettings = {};
  const columns = options.cols?.[breakpoint];
  if (isFiniteNumber(columns) && columns > 0) {
    settings.columns = columns;
  } else if (options.cols) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "legacy-responsive-deferred",
      "warning",
      `Responsive cols for breakpoint "${breakpoint}" are missing; dashboard default columns will apply.`,
      { profileId: breakpoint, path: `cols.${breakpoint}` }
    ));
  }
  const margin = getMapValue(options.margin, breakpoint);
  if (isFiniteNumber(margin) || isTuple(margin)) settings.margin = margin;
  const padding = getMapValue(options.containerPadding, breakpoint);
  if (isTuple(padding)) settings.containerPadding = [padding[0], padding[1]];
  return settings;
};

export function createDashboardDocumentFromResponsiveLayouts(
  options: CreateDashboardDocumentFromResponsiveLayoutsOptions
): DashboardResponsiveMigrationResult {
  const diagnostics: DashboardDiagnostic[] = [];
  const breakpointKeys = sortBreakpoints(options.breakpoints);
  const layoutKeys = Object.keys(options.layouts || {}).sort();
  const defaultBreakpoint = options.defaultBreakpoint ||
    (breakpointKeys.length > 0 ? breakpointKeys[breakpointKeys.length - 1] : layoutKeys[0] || DEFAULT_BREAKPOINT);
  const defaultLayout = options.layouts[defaultBreakpoint] || [];

  if (!options.layouts[defaultBreakpoint]) {
    diagnostics.push(createDashboardResponsiveDiagnostic(
      "legacy-responsive-deferred",
      "warning",
      `Default responsive layout "${defaultBreakpoint}" was not present; an empty dashboard layout was created.`,
      { profileId: defaultBreakpoint, path: `layouts.${defaultBreakpoint}` }
    ));
  }

  const widgets: Record<string, DashboardItemLayout> = {};
  cloneLayout(defaultLayout)
    .sort(layoutSorter)
    .forEach(item => {
      widgets[item.i] = layoutItemToDashboardItem(item);
    });

  const definition: DashboardLayoutDefinition = {
    widgets,
    gridSettings: gridSettingsFromResponsive(defaultBreakpoint, options, diagnostics),
    profiles: {}
  };

  const profileIds: string[] = [];
  Object.keys(options.layouts || {})
    .sort((a, b) => {
      const aWidth = isFiniteNumber(options.breakpoints[a]) ? options.breakpoints[a] : Number.MAX_SAFE_INTEGER;
      const bWidth = isFiniteNumber(options.breakpoints[b]) ? options.breakpoints[b] : Number.MAX_SAFE_INTEGER;
      const diff = aWidth - bWidth;
      return diff !== 0 ? diff : a.localeCompare(b);
    })
    .forEach(breakpoint => {
      if (breakpoint === defaultBreakpoint) return;
      const profileWidgets: Record<string, DashboardItemLayoutOverride> = {};
      cloneLayout(options.layouts[breakpoint] || [])
        .sort(layoutSorter)
        .forEach(item => {
          if (!hasOwn(widgets, item.i)) {
            diagnostics.push(createDashboardResponsiveDiagnostic(
              "legacy-responsive-deferred",
              "warning",
              `Responsive layout "${breakpoint}" contains widget "${item.i}" that is absent from the default dashboard layout.`,
              {
                profileId: breakpoint,
                itemId: item.i,
                path: `layouts.${breakpoint}.${item.i}`,
                details: {
                  reason: "profile-only-widget",
                  defaultBreakpoint
                }
              }
            ));
          }
          profileWidgets[item.i] = layoutItemToDashboardOverride(item);
        });
      (definition.profiles as NonNullable<DashboardLayoutDefinition["profiles"]>)[breakpoint] = {
        widgets: profileWidgets,
        gridSettings: gridSettingsFromResponsive(breakpoint, options, diagnostics)
      };
      profileIds.push(breakpoint);
    });

  if (definition.profiles && Object.keys(definition.profiles).length === 0) {
    delete definition.profiles;
  }

  try {
    const document = serializeDashboardLayoutDocument(definition, {
      key: options.key,
      sourceId: options.sourceId
    });
    return {
      ok: true,
      document,
      defaultBreakpoint,
      profileIds,
      diagnostics
    };
  } catch (cause) {
    return {
      ok: false,
      diagnostics,
      error: createError("validation", "Responsive layouts could not be converted to a dashboard document.", { cause })
    };
  }
}
