import type {
  DashboardJsonObject,
  DashboardJsonValue
} from "../dashboard";
import type {
  DashboardEditorShellAdapterResult,
  DashboardEditorShellPaletteAdapter,
  DashboardEditorShellPreparedMutation,
  DashboardEditorShellWidgetAdapter,
  DashboardEditorShellWidgetTemplate
} from "../dashboard-editor-shell";
import type { GridItemPhysicalCapabilityInput } from "../item-capabilities";
import type { ResizeHandleAxis } from "../utils";

export type WidgetRegistryPolicy = "strict" | "tolerant";

export type WidgetLifecycleStatus =
  | "stable"
  | "experimental"
  | "deprecated"
  | "hidden";

export type WidgetRegistryDiagnosticLevel = "info" | "warning" | "error";

export type WidgetRegistryDiagnosticCode =
  | "widget-registry.duplicate-type"
  | "widget-registry.unknown-type"
  | "widget-registry.invalid-type"
  | "widget-registry.invalid-version"
  | "widget-registry.deprecated-type"
  | "widget-registry.hidden-type"
  | "widget-registry.invalid-template"
  | "widget-registry.invalid-settings"
  | "widget-registry.invalid-layout"
  | "widget-registry.unsafe-extension-key"
  | "widget-registry.capability-conflict"
  | "widget-registry.missing-data-requirement"
  | "widget-registry.untyped-layout-item"
  | "widget-registry.renderer-hint-invalid";

export type WidgetRegistryDiagnostic = {
  code: WidgetRegistryDiagnosticCode;
  level: WidgetRegistryDiagnosticLevel;
  message: string;
  type?: string;
  itemId?: string;
  fieldId?: string;
  path?: string;
  profileId?: string;
  details?: DashboardJsonObject;
};

export type WidgetRendererHint = {
  rendererKey?: string;
  componentKey?: string;
  slot?: string;
  extensions?: DashboardJsonObject;
};

export type WidgetLayoutDefaults = GridItemPhysicalCapabilityInput & {
  w?: number;
  h?: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  bounded?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  preserveAspectRatio?: boolean;
  aspectRatio?: number;
  extensions?: DashboardJsonObject;
};

export type WidgetSettingsFieldType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "color"
  | "text"
  | "json"
  | "object"
  | "array"
  | "ref";

export type WidgetSettingsPredicate =
  | { op: "exists"; path: string }
  | { op: "equals"; path: string; value: DashboardJsonValue }
  | { op: "not"; predicate: WidgetSettingsPredicate }
  | { op: "all"; predicates: WidgetSettingsPredicate[] }
  | { op: "any"; predicates: WidgetSettingsPredicate[] };

export type WidgetSettingsField = {
  id: string;
  label?: string;
  labelKey?: string;
  description?: string;
  type: WidgetSettingsFieldType;
  defaultValue?: DashboardJsonValue;
  required?: boolean;
  group?: string;
  order?: number;
  options?: Array<{ value: string | number | boolean; label?: string; labelKey?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
  visibleWhen?: WidgetSettingsPredicate;
  enabledWhen?: WidgetSettingsPredicate;
  status?: WidgetLifecycleStatus;
  replacement?: string;
  extensions?: DashboardJsonObject;
};

export type WidgetSettingsDescriptor = {
  version?: string;
  fields: WidgetSettingsField[];
  groups?: Array<{ id: string; label?: string; order?: number; extensions?: DashboardJsonObject }>;
  extensions?: DashboardJsonObject;
};

export type WidgetTemplateDefinition = {
  id?: string;
  title?: string;
  description?: string;
  layout?: WidgetLayoutDefaults;
  settings?: DashboardJsonObject;
  bindings?: DashboardJsonObject;
  payload?: DashboardJsonValue;
  extensions?: DashboardJsonObject;
};

export type WidgetTypeDefinition = {
  type: string;
  version: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  icon?: string;
  status?: WidgetLifecycleStatus;
  replacement?: string;
  layoutDefaults?: WidgetLayoutDefaults;
  settings?: WidgetSettingsDescriptor;
  dataRequirements?: DashboardJsonObject;
  rendererHint?: WidgetRendererHint;
  templates?: WidgetTemplateDefinition[];
  extensions?: DashboardJsonObject;
};

export type WidgetInstanceMetadata = {
  widgetType: string;
  widgetVersion?: string;
  templateId?: string;
  settings?: DashboardJsonObject;
  bindings?: DashboardJsonObject;
  payload?: DashboardJsonValue;
  migration?: {
    fromVersion?: string;
    toVersion?: string;
    status?: "current" | "deprecated" | "migration-available" | "manual-review";
    replacement?: string;
  };
  rendererHint?: WidgetRendererHint;
  extensions?: DashboardJsonObject;
};

export type WidgetRegistryOptions = {
  policy?: WidgetRegistryPolicy;
  allowOverride?: boolean;
  includeHiddenByDefault?: boolean;
  includeDeprecatedByDefault?: boolean;
};

export type WidgetRegistryListOptions = {
  category?: string;
  tags?: string[];
  status?: WidgetLifecycleStatus | WidgetLifecycleStatus[];
  searchText?: string;
  includeHidden?: boolean;
  includeDeprecated?: boolean;
};

export type WidgetRegistryResolveResult =
  | { ok: true; definition: WidgetTypeDefinition; diagnostics: WidgetRegistryDiagnostic[] }
  | { ok: false; diagnostics: WidgetRegistryDiagnostic[] };

export type WidgetRegistry = {
  register(definition: WidgetTypeDefinition): WidgetRegistryResolveResult;
  registerMany(definitions: WidgetTypeDefinition[]): WidgetRegistryDiagnostic[];
  resolve(type: string): WidgetRegistryResolveResult;
  list(options?: WidgetRegistryListOptions): WidgetTypeDefinition[];
  diagnostics(): WidgetRegistryDiagnostic[];
};

export type WidgetSettingsDefaultsResult = {
  settings: DashboardJsonObject;
  diagnostics: WidgetRegistryDiagnostic[];
};

export type WidgetSettingsValidationResult = {
  ok: boolean;
  value: DashboardJsonObject;
  diagnostics: WidgetRegistryDiagnostic[];
};

export type WidgetTemplateMaterializationInput = {
  type: string;
  templateId?: string;
  id?: string;
  existingIds?: Iterable<string>;
  settings?: DashboardJsonObject;
  bindings?: DashboardJsonObject;
  payload?: DashboardJsonValue;
  layout?: WidgetLayoutDefaults;
  label?: string;
  metadata?: DashboardJsonObject;
};

export type WidgetTemplateMaterializationResult =
  | {
      ok: true;
      template: DashboardEditorShellWidgetTemplate;
      instance: WidgetInstanceMetadata;
      diagnostics: WidgetRegistryDiagnostic[];
    }
  | {
      ok: false;
      diagnostics: WidgetRegistryDiagnostic[];
    };

export type WidgetRegistryPaletteItem = {
  type: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  icon?: string;
  status?: WidgetLifecycleStatus;
  defaultSize: { w: number; h: number };
  diagnostics: WidgetRegistryDiagnostic[];
};

export type WidgetRegistryPaletteAdapterOptions = {
  policy?: WidgetRegistryPolicy;
  filter?: WidgetRegistryListOptions;
  autoMaterializeFirst?: boolean;
};

export type WidgetRegistryWidgetAdapterOptions = {
  policy?: WidgetRegistryPolicy;
  clonePolicy?: "settings-only" | "settings-bindings-payload" | "metadata-only";
};

export type WidgetRegistryShellExports = {
  DashboardEditorShellAdapterResult: DashboardEditorShellAdapterResult;
  DashboardEditorShellPaletteAdapter: DashboardEditorShellPaletteAdapter;
  DashboardEditorShellPreparedMutation: DashboardEditorShellPreparedMutation;
  DashboardEditorShellWidgetAdapter: DashboardEditorShellWidgetAdapter;
  DashboardEditorShellWidgetTemplate: DashboardEditorShellWidgetTemplate;
};
