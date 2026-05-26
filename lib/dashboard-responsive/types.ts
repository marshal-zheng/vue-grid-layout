import type { Ref } from "vue";
import type {
  DashboardBreakpointProfile,
  DashboardDiagnostic,
  DashboardDocumentWriteBackOwner,
  DashboardDocumentError,
  DashboardGridSettings,
  DashboardItemLayout,
  DashboardItemLayoutOverride,
  DashboardLayoutDocument,
  DashboardLayoutDefinition,
  DashboardWriteResult,
  ResolvedDashboardGridSettings
} from "../dashboard";
import type {
  GridEditorController,
  GridEditorMetaById,
  GridEditorProp,
  GridEditorSectionRowState
} from "../editor";
import type { GridHistoryStore } from "../history";
import type { GridLayoutEngineProp } from "../layout-engine";
import type {
  GridItemAspectRatioConstraint,
  ResolvedGridItemCapability
} from "../item-capabilities";
import type { Layout } from "../utils";
import type { LayoutValidationMode } from "../persistence";
import type {
  GridHeightMode,
  GridHeightRuntime,
  GridRenderPrecision
} from "../grid-height";

export type DashboardTargetView = "desktop" | "mobile";
export type DashboardResponsiveMode = "view" | "edit";
export type DashboardTargetViewSource =
  | "explicit"
  | "resolver"
  | "breakpoint-id"
  | "width"
  | "default";

export type DashboardResponsiveDiagnosticCode =
  | "profile-fallback"
  | "unknown-profile-item"
  | "unsupported-profile-field"
  | "missing-profile-write-blocked"
  | "projection-validation-failed"
  | "slot-widget-mismatch"
  | "invalid-breakpoint"
  | "target-view-default"
  | "settings-default"
  | "list-height-source"
  | "list-height-default"
  | "legacy-responsive-deferred"
  | "mode-alias-conflict"
  | "write-back-noop";

export const DASHBOARD_RESPONSIVE_DIAGNOSTIC_CODES = {
  profileFallback: "profile-fallback",
  unknownProfileItem: "unknown-profile-item",
  unsupportedProfileField: "unsupported-profile-field",
  missingProfileWriteBlocked: "missing-profile-write-blocked",
  projectionValidationFailed: "projection-validation-failed",
  slotWidgetMismatch: "slot-widget-mismatch"
} as const;

export type DashboardResponsiveDiagnosticInput = {
  path?: string;
  itemId?: string;
  profileId?: string;
  layoutId?: string;
  targetView?: DashboardTargetView;
  details?: unknown;
};

export type DashboardTargetViewRule = {
  mobileBreakpointIds?: string[];
  mobileMaxWidth?: number;
  resolve?: (context: {
    width: number;
    requestedBreakpoint: string;
    breakpoints: Record<string, number>;
  }) => DashboardTargetView | null | undefined;
};

export type ResolveDashboardResponsiveProfileOptions = {
  layoutId?: string;
  width: number;
  breakpoints: Record<string, number>;
  breakpoint?: string | null;
  targetView?: DashboardTargetView | null;
  targetViewRule?: DashboardTargetViewRule;
  mode?: DashboardResponsiveMode;
  validation?: LayoutValidationMode;
  allowUnknownProfileItems?: boolean;
};

export type DashboardHeightOptionOverrides = {
  heightMode?: GridHeightMode | null;
  containerHeight?: number | null;
  autoMeasureContainerHeight?: boolean;
  minRowHeight?: number;
  rowHeight?: number;
  renderPrecision?: GridRenderPrecision | null;
};

export type DashboardResponsiveRuntime = {
  layout: Layout;
  gridSettings: ResolvedDashboardGridSettings;
  editorMetaById: GridEditorMetaById;
  capabilitiesById?: Record<string, ResolvedGridItemCapability>;
  resizeConstraintsById?: Record<string, GridItemAspectRatioConstraint>;
  layoutId: string;
  requestedBreakpoint: string;
  resolvedProfileId: string | null;
  targetView: DashboardTargetView;
  targetViewSource: DashboardTargetViewSource;
  mode: DashboardResponsiveMode;
  viewFormat: "grid" | "list";
  heightOptions: DashboardHeightOptionOverrides;
  heightRuntime?: GridHeightRuntime;
  fallbackApplied: boolean;
  allItemIds: string[];
  activeItemIds: string[];
  renderItemIds: string[];
  hiddenItemIds: string[];
  diagnostics: DashboardDiagnostic[];
};

export type DashboardResponsiveProfileResult =
  | {
      ok: true;
      runtime: DashboardResponsiveRuntime;
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      previousRuntime?: DashboardResponsiveRuntime;
      diagnostics: DashboardDiagnostic[];
      runtime?: never;
    };

export type WriteDashboardResponsiveRuntimeOptions = {
  layoutId?: string;
  requestedBreakpoint?: string;
  resolvedProfileId?: string | null;
  targetView?: DashboardTargetView;
  mode?: DashboardResponsiveMode;
  viewFormat?: "grid" | "list";
  editorMetaById?: GridEditorMetaById;
  sectionRows?: GridEditorSectionRowState;
  writeItemIds?: string[];
  createMissingProfileOnEdit?: boolean;
  createMissingItems?: boolean;
  removeMissingItems?: boolean;
  validation?: LayoutValidationMode;
};

export type DashboardResponsiveWriteResult = DashboardWriteResult;

export type CreateDashboardDocumentFromResponsiveLayoutsOptions = {
  key: string;
  layouts: Record<string, Layout>;
  breakpoints: Record<string, number>;
  cols?: Record<string, number>;
  margin?: Record<string, [number, number] | null> | [number, number];
  containerPadding?: Record<string, [number, number] | null> | [number, number] | null;
  defaultBreakpoint?: string;
  sourceId?: string;
};

export type DashboardResponsiveMigrationResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      defaultBreakpoint: string;
      profileIds: string[];
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      error: DashboardDocumentError;
      diagnostics: DashboardDiagnostic[];
      document?: never;
      defaultBreakpoint?: never;
      profileIds?: never;
    };

export type DashboardResponsiveProfileEvent =
  | { type: "breakpointChange"; requestedBreakpoint: string; previous: string | null }
  | {
      type: "profileChange";
      resolvedProfileId: string | null;
      previous: string | null;
      fallbackApplied: boolean;
    }
  | { type: "projectionChange"; runtime: DashboardResponsiveRuntime }
  | { type: "diagnosticsChange"; diagnostics: DashboardDiagnostic[] }
  | { type: "documentChange"; document: DashboardLayoutDocument; runtime: DashboardResponsiveRuntime }
  | { type: "projectionError"; error: DashboardDocumentError; diagnostics: DashboardDiagnostic[] };

export type MaybeRef<T> = Ref<T> | T;

export type UseDashboardResponsiveProfileModelOptions = {
  document: MaybeRef<DashboardLayoutDocument>;
  width: MaybeRef<number>;
  breakpoints: MaybeRef<Record<string, number>>;
  breakpoint?: MaybeRef<string | null | undefined>;
  targetView?: MaybeRef<DashboardTargetView | null | undefined>;
  targetViewRule?: DashboardTargetViewRule;
  mode?: MaybeRef<DashboardResponsiveMode | undefined>;
  validation?: LayoutValidationMode;
  layoutEngine?: false | GridLayoutEngineProp;
  editor?: false | GridEditorProp;
  documentWriteBack?: DashboardDocumentWriteBackOwner;
  createMissingProfileOnEdit?: boolean;
  allowUnknownProfileItems?: boolean;
  onEvent?: (event: DashboardResponsiveProfileEvent) => void;
};

export type DashboardResponsiveProfileModel = {
  state: Readonly<Ref<DashboardResponsiveRuntime>>;
  editorController: GridEditorController | null;
  getInnerEditorProp: () => false | GridEditorProp;
  onLayoutChange: (layout: Layout) => void;
  onHeightRuntimeChange: (heightRuntime: GridHeightRuntime) => void;
  refresh: (reason?: string) => void;
  stop: () => void;
};

export type DashboardResponsiveVueGridLayoutDiagnosticContext = {
  layoutId: string;
  requestedBreakpoint: string;
  resolvedProfileId: string | null;
  targetView: DashboardTargetView;
  mode: DashboardResponsiveMode;
};

export type DashboardResponsiveComponentProps = {
  document: DashboardLayoutDocument;
  width: number;
  breakpoints: Record<string, number>;
  breakpoint?: string | null;
  targetView?: DashboardTargetView | null;
  targetViewRule?: DashboardTargetViewRule;
  mode?: DashboardResponsiveMode;
  validation?: LayoutValidationMode;
  allowUnknownProfileItems?: boolean;
  createMissingProfileOnEdit?: boolean;
  documentWriteBack?: DashboardDocumentWriteBackOwner;
  layoutEngine?: false | GridLayoutEngineProp;
  editor?: false | GridEditorProp;
  historyStore?: GridHistoryStore;
  heightMode?: GridHeightMode | null;
  containerHeight?: number | null;
  autoMeasureContainerHeight?: boolean;
  minRowHeight?: number;
  rowHeight?: number;
  renderPrecision?: GridRenderPrecision | null;
};

export type {
  DashboardBreakpointProfile,
  DashboardDiagnostic,
  DashboardDocumentWriteBackOwner,
  DashboardGridSettings,
  DashboardItemLayout,
  DashboardItemLayoutOverride,
  DashboardLayoutDocument,
  DashboardLayoutDefinition
};
