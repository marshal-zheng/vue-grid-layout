import type { GridEditorMetaById } from "./editor/types";
import type { Layout, ResizeHandleAxis } from "./utils";
import type { LayoutValidationMode, MaybePromise } from "./persistence";
import type { GridHeightMode, GridRenderPrecision } from "./grid-height";
export declare const DASHBOARD_SCHEMA_VERSION = 1;
export type DashboardJsonPrimitive = string | number | boolean | null;
export type DashboardJsonValue = DashboardJsonPrimitive | DashboardJsonObject | DashboardJsonValue[];
export type DashboardJsonObject = {
    [key: string]: DashboardJsonValue;
};
export type DashboardDocumentMeta = DashboardJsonObject;
export type DashboardDiagnosticLevel = "info" | "warning" | "error";
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
    sectionRows?: unknown;
    updatedAt?: string;
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
};
export type DashboardMigration = (document: unknown, context: {
    fromVersion: number;
    toVersion: number;
}) => unknown;
export type DashboardMigrationMap = Record<number, DashboardMigration>;
export type DashboardMigrationEvent = {
    fromVersion: number;
    toVersion: number;
};
export type DashboardErrorCode = "invalid-json" | "invalid-document" | "validation" | "migration-missing" | "migration-failed" | "unknown-item";
export type DashboardDocumentError = {
    code: DashboardErrorCode;
    message: string;
    path?: string;
    recoverable?: boolean;
    details?: unknown;
    cause?: unknown;
    originalPayload?: unknown;
};
export type DashboardValidationResult = {
    ok: true;
    document: DashboardLayoutDocument;
    warnings: DashboardDiagnostic[];
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
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
export type DashboardDeserializeResult = {
    ok: true;
    document: DashboardLayoutDocument;
    migrations: DashboardMigrationEvent[];
    warnings: DashboardDiagnostic[];
    diagnostics: DashboardDiagnostic[];
    fallback?: never;
    error?: never;
} | {
    ok: false;
    error: DashboardDocumentError;
    fallback?: DashboardLayoutDocument;
    originalPayload: unknown;
    migrations: DashboardMigrationEvent[];
    warnings: DashboardDiagnostic[];
    diagnostics: DashboardDiagnostic[];
    document?: never;
};
export type DashboardMigrationResult = {
    ok: true;
    document: DashboardLayoutDocument;
    migrations: DashboardMigrationEvent[];
    originalPayload: unknown;
    warnings: DashboardDiagnostic[];
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
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
    layoutId: string;
    profileId: string | null;
    fallbackApplied: boolean;
    diagnostics: DashboardDiagnostic[];
};
export type DashboardProjectionResult = {
    ok: true;
    projection: DashboardGridRuntimeProjection;
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
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
    writeItemIds?: string[];
    createMissingItems?: boolean;
    removeMissingItems?: boolean;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
};
export type DashboardWriteResult = {
    ok: true;
    document: DashboardLayoutDocument;
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
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
    subscribe?: (key: string, callback: (event: DashboardPersistenceExternalChange) => void) => () => void;
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
export type DashboardImportResult = {
    ok: true;
    document: DashboardLayoutDocument;
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
    ok: false;
    error: DashboardDocumentError;
    originalPayload: unknown;
    diagnostics: DashboardDiagnostic[];
    document?: never;
};
export type DashboardExportResult = {
    ok: true;
    value: ThingsBoardDashboardLayoutLike;
    diagnostics: DashboardDiagnostic[];
    error?: never;
} | {
    ok: false;
    error: DashboardDocumentError;
    diagnostics: DashboardDiagnostic[];
    value?: never;
};
export declare const cloneDashboardJsonValue: <T extends DashboardJsonValue>(value: T, options?: {
    validation?: LayoutValidationMode;
}) => T;
export declare function validateDashboardLayoutDocument(payload: unknown, options?: {
    currentVersion?: number;
    validation?: LayoutValidationMode;
}): DashboardValidationResult;
export declare function serializeDashboardLayoutDocument(input: DashboardLayoutDefinition | DashboardLayoutDocument, options: SerializeDashboardLayoutOptions): DashboardLayoutDocument;
export declare function migrateDashboardLayoutDocument(payload: unknown, options?: {
    currentVersion?: number;
    migrations?: DashboardMigrationMap;
    validation?: LayoutValidationMode;
}): DashboardMigrationResult;
export declare function deserializeDashboardLayoutDocument(payload: unknown, options?: DeserializeDashboardLayoutOptions): DashboardDeserializeResult;
export declare function projectDashboardLayoutDocument(document: DashboardLayoutDocument, options?: ProjectDashboardLayoutOptions): DashboardProjectionResult;
export declare function writeDashboardRuntimeToDocument(document: DashboardLayoutDocument, runtime: {
    layout: Layout;
    editorMetaById?: GridEditorMetaById;
    gridSettings?: Partial<DashboardGridSettings>;
}, options?: WriteDashboardRuntimeOptions): DashboardWriteResult;
export declare function importThingsBoardDashboardLayout(input: ThingsBoardDashboardLayoutLike, options?: Partial<SerializeDashboardLayoutOptions>): DashboardImportResult;
export declare function exportThingsBoardDashboardLayout(document: DashboardLayoutDocument, options?: {
    layoutId?: string;
}): DashboardExportResult;
