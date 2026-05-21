import {
  projectDashboardLayoutDocument,
  validateDashboardLayoutDocument,
  writeDashboardRuntimeToDocument
} from "./dashboard";
import {
  migrateLayoutSettings,
  repairLayoutCollisions,
  translateLayout
} from "./layout-engine";

import type {
  DashboardDiagnostic,
  DashboardDocumentError,
  DashboardGridSettings,
  DashboardLayoutDocument,
  DashboardWriteResult
} from "./dashboard";
import type { LayoutValidationMode } from "./persistence";
import type {
  GridLayoutEngineOptions,
  LayoutMigrationPolicy,
  LayoutMigrationSettings,
  LayoutOperationResult,
  LayoutRepairDiagnostic,
  LayoutRepairPolicy
} from "./layout-engine";
import type { Layout } from "./utils";

export type DashboardLayoutSettingsMigrationOptions = {
  layoutId?: string;
  profileId?: string | null;
  previousSettings?: DashboardGridSettings;
  nextSettings: DashboardGridSettings;
  policy?: LayoutMigrationPolicy;
  createMissingProfile?: boolean;
  validation?: LayoutValidationMode;
};

export type DashboardLayoutRepairOptions = {
  layoutId?: string;
  profileId?: string | null;
  policy?: LayoutRepairPolicy;
  createMissingProfile?: boolean;
  validation?: LayoutValidationMode;
};

export type DashboardLayoutTranslateOptions = DashboardLayoutRepairOptions & {
  dx: number;
  dy: number;
  clampNegative?: boolean;
};

export type DashboardLayoutSettingsMigrationResult =
  | {
      ok: true;
      document: DashboardLayoutDocument;
      operation: LayoutOperationResult;
      diagnostics: DashboardDiagnostic[];
      error?: never;
    }
  | {
      ok: false;
      document: DashboardLayoutDocument;
      operation?: LayoutOperationResult;
      error: DashboardDocumentError;
      diagnostics: DashboardDiagnostic[];
    };

const cloneDocument = (document: DashboardLayoutDocument): DashboardLayoutDocument =>
  JSON.parse(JSON.stringify(document)) as DashboardLayoutDocument;

const createError = (
  code: DashboardDocumentError["code"],
  message: string,
  extra: Partial<DashboardDocumentError> = {}
): DashboardDocumentError => ({
  code,
  message,
  ...extra
});

const createDiagnostic = (
  code: string,
  level: DashboardDiagnostic["level"],
  message: string,
  extra: Partial<DashboardDiagnostic> = {}
): DashboardDiagnostic => ({
  code,
  level,
  message,
  ...extra
});

const toMigrationSettings = (settings: DashboardGridSettings): LayoutMigrationSettings => ({
  ...settings,
  cols: settings.columns,
  columns: settings.columns,
  minColumns: settings.minColumns,
  maxRows: typeof (settings as Record<string, unknown>).maxRows === "number"
    ? (settings as Record<string, number>).maxRows
    : undefined
});

const resolvedColumns = (settings: DashboardGridSettings | undefined, fallback = 12): number => {
  const value = settings?.columns;
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
};

const engineOptionsFor = (
  settings: DashboardGridSettings,
  overrides: Partial<GridLayoutEngineOptions> = {}
): GridLayoutEngineOptions => ({
  cols: resolvedColumns(settings),
  maxRows: typeof (settings as Record<string, unknown>).maxRows === "number"
    ? (settings as Record<string, number>).maxRows
    : Infinity,
  compactType: null,
  allowOverlap: false,
  preventCollision: true,
  diagnostics: { debug: true },
  ...overrides
});

const mergeResolvedSettings = (
  base: DashboardGridSettings,
  overrides?: DashboardGridSettings
): DashboardGridSettings => ({
  ...base,
  ...(overrides || {})
});

const operationTargetIds = (operation: LayoutOperationResult): Set<string> => {
  const ids = new Set<string>();
  operation.affectedIds.forEach(id => ids.add(id));
  operation.patches.forEach(patch => {
    if (patch.type === "add") ids.add(patch.item.i);
    else if (patch.type === "compact") patch.affectedIds.forEach(id => ids.add(id));
    else ids.add(patch.id);
  });
  return ids;
};

const mapDetail = (
  detail: LayoutRepairDiagnostic,
  layoutId: string,
  profileId?: string | null
): DashboardDiagnostic => createDiagnostic(
  detail.code,
  detail.level,
  detail.message,
  {
    layoutId,
    profileId: profileId || undefined,
    itemId: detail.itemId,
    path: detail.itemId
      ? `layouts.${layoutId}.${profileId ? `profiles.${profileId}.` : ""}widgets.${detail.itemId}`
      : profileId
        ? `layouts.${layoutId}.profiles.${profileId}.gridSettings`
        : `layouts.${layoutId}.gridSettings`,
    details: {
      reason: detail.reason,
      before: detail.before,
      after: detail.after,
      details: detail.details
    }
  }
);

const mapEngineDiagnostics = (
  operation: LayoutOperationResult,
  layoutId: string,
  profileId?: string | null
): DashboardDiagnostic[] => {
  const diagnostics: DashboardDiagnostic[] = [];
  (operation.diagnostics?.details || []).forEach(detail => {
    diagnostics.push(mapDetail(detail, layoutId, profileId));
  });
  if (operation.status === "blocked" && operation.blocked) {
    diagnostics.push(createDiagnostic("layout-operation-blocked", "error", `Layout operation was blocked: ${operation.blocked.reason}.`, {
      layoutId,
      profileId: profileId || undefined,
      details: operation.blocked
    }));
  }
  if (operation.status === "error" && operation.error) {
    diagnostics.push(createDiagnostic("layout-operation-error", "error", operation.error.message, {
      layoutId,
      profileId: profileId || undefined,
      details: operation.error.cause
    }));
  }
  return diagnostics;
};

const getProfileExists = (
  document: DashboardLayoutDocument,
  layoutId: string,
  profileId?: string | null
): boolean => {
  if (!profileId) return true;
  return Boolean(document.layouts[layoutId]?.profiles?.[profileId]);
};

const writeOperationResult = (
  document: DashboardLayoutDocument,
  operation: LayoutOperationResult,
  options: {
    layoutId: string;
    profileId?: string | null;
    nextSettings?: DashboardGridSettings;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
  }
): DashboardWriteResult => {
  const affectedIds = operationTargetIds(operation);
  const layout = options.profileId
    ? operation.layout.filter(item => affectedIds.has(item.i))
    : operation.layout;
  return writeDashboardRuntimeToDocument(document, {
    layout,
    gridSettings: options.nextSettings
  }, {
    layoutId: options.layoutId,
    profileId: options.profileId || undefined,
    createMissingProfile: options.createMissingProfile,
    validation: options.validation
  });
};

const projectTarget = (
  document: DashboardLayoutDocument,
  options: {
    layoutId: string;
    profileId?: string | null;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
  }
) => projectDashboardLayoutDocument(document, {
  layoutId: options.layoutId,
  profileId: getProfileExists(document, options.layoutId, options.profileId)
    ? options.profileId || undefined
    : undefined,
  allowNonPrimary: true,
  validation: options.validation
});

export function migrateDashboardLayoutSettings(
  document: DashboardLayoutDocument,
  options: DashboardLayoutSettingsMigrationOptions
): DashboardLayoutSettingsMigrationResult {
  const validation = validateDashboardLayoutDocument(document, { validation: options.validation ?? "strict" });
  const unchanged = validation.ok ? cloneDocument(validation.document) : cloneDocument(document);
  const diagnostics = validation.diagnostics.slice();
  if (!validation.ok) {
    return {
      ok: false,
      document: unchanged,
      error: validation.error,
      diagnostics
    };
  }

  const source = validation.document;
  const layoutId = options.layoutId || source.primaryLayoutId;
  const layout = source.layouts[layoutId];
  if (!layout) {
    const issue = createDiagnostic("invalid-document", "error", `Dashboard layout "${layoutId}" was not found.`, { layoutId });
    return {
      ok: false,
      document: unchanged,
      error: createError("invalid-document", issue.message, { path: `layouts.${layoutId}` }),
      diagnostics: diagnostics.concat(issue)
    };
  }

  const profileId = options.profileId || null;
  if (profileId && !getProfileExists(source, layoutId, profileId) && !options.createMissingProfile) {
    const issue = createDiagnostic("profile-fallback", "error", `Dashboard profile "${profileId}" was not found; profile migration was blocked.`, {
      layoutId,
      profileId
    });
    return {
      ok: false,
      document: unchanged,
      error: createError("validation", issue.message, { path: `layouts.${layoutId}.profiles.${profileId}` }),
      diagnostics: diagnostics.concat(issue)
    };
  }

  const projection = projectTarget(source, {
    layoutId,
    profileId,
    createMissingProfile: options.createMissingProfile,
    validation: options.validation
  });
  diagnostics.push(...projection.diagnostics);
  if (!projection.ok) {
    return {
      ok: false,
      document: unchanged,
      error: projection.error,
      diagnostics
    };
  }

  const previousSettings = mergeResolvedSettings(
    projection.projection.gridSettings,
    options.previousSettings
  );
  const nextSettings = mergeResolvedSettings(
    projection.projection.gridSettings,
    options.nextSettings
  );
  const writeBackSettings = {
    ...options.nextSettings
  };
  const operation = migrateLayoutSettings(projection.projection.layout, {
    previousSettings: toMigrationSettings(previousSettings),
    nextSettings: toMigrationSettings(nextSettings),
    policy: options.policy,
    engineOptions: engineOptionsFor(projection.projection.gridSettings),
    id: `dashboard-migrate-${layoutId}${profileId ? `-${profileId}` : ""}`,
    phase: "commit",
    debug: true
  });
  diagnostics.push(...mapEngineDiagnostics(operation, layoutId, profileId));

  if (operation.status === "blocked" || operation.status === "error") {
    return {
      ok: false,
      document: unchanged,
      operation,
      error: createError(operation.status === "error" ? "validation" : "validation", operation.error?.message || "Dashboard layout settings migration failed."),
      diagnostics
    };
  }

  const written = writeOperationResult(source, operation, {
    layoutId,
    profileId,
    nextSettings: writeBackSettings,
    createMissingProfile: options.createMissingProfile,
    validation: options.validation
  });
  diagnostics.push(...written.diagnostics);
  if (!written.ok) {
    return {
      ok: false,
      document: unchanged,
      operation,
      error: written.error,
      diagnostics
    };
  }

  return {
    ok: true,
    document: written.document,
    operation,
    diagnostics
  };
}

const runGeometryWrapper = (
  document: DashboardLayoutDocument,
  options: DashboardLayoutRepairOptions,
  operationFactory: (layout: Layout, engineOptions: GridLayoutEngineOptions) => LayoutOperationResult
): DashboardLayoutSettingsMigrationResult => {
  const validation = validateDashboardLayoutDocument(document, { validation: options.validation ?? "strict" });
  const unchanged = validation.ok ? cloneDocument(validation.document) : cloneDocument(document);
  const diagnostics = validation.diagnostics.slice();
  if (!validation.ok) {
    return { ok: false, document: unchanged, error: validation.error, diagnostics };
  }

  const source = validation.document;
  const layoutId = options.layoutId || source.primaryLayoutId;
  const profileId = options.profileId || null;
  if (profileId && !getProfileExists(source, layoutId, profileId) && !options.createMissingProfile) {
    const issue = createDiagnostic("profile-fallback", "error", `Dashboard profile "${profileId}" was not found; geometry operation was blocked.`, {
      layoutId,
      profileId
    });
    return {
      ok: false,
      document: unchanged,
      error: createError("validation", issue.message, { path: `layouts.${layoutId}.profiles.${profileId}` }),
      diagnostics: diagnostics.concat(issue)
    };
  }

  const projection = projectTarget(source, {
    layoutId,
    profileId,
    createMissingProfile: options.createMissingProfile,
    validation: options.validation
  });
  diagnostics.push(...projection.diagnostics);
  if (!projection.ok) {
    return { ok: false, document: unchanged, error: projection.error, diagnostics };
  }

  const operation = operationFactory(
    projection.projection.layout,
    engineOptionsFor(projection.projection.gridSettings)
  );
  diagnostics.push(...mapEngineDiagnostics(operation, layoutId, profileId));
  if (operation.status === "blocked" || operation.status === "error") {
    return {
      ok: false,
      document: unchanged,
      operation,
      error: createError("validation", operation.error?.message || "Dashboard geometry operation failed."),
      diagnostics
    };
  }

  const written = writeOperationResult(source, operation, {
    layoutId,
    profileId,
    createMissingProfile: options.createMissingProfile,
    validation: options.validation
  });
  diagnostics.push(...written.diagnostics);
  if (!written.ok) {
    return { ok: false, document: unchanged, operation, error: written.error, diagnostics };
  }
  return { ok: true, document: written.document, operation, diagnostics };
};

export function repairDashboardLayoutCollisions(
  document: DashboardLayoutDocument,
  options: DashboardLayoutRepairOptions = {}
): DashboardLayoutSettingsMigrationResult {
  return runGeometryWrapper(document, options, (layout, engineOptions) =>
    repairLayoutCollisions(layout, {
      policy: options.policy,
      engineOptions,
      id: "dashboard-repair",
      phase: "commit",
      debug: true
    })
  );
}

export function translateDashboardLayout(
  document: DashboardLayoutDocument,
  options: DashboardLayoutTranslateOptions
): DashboardLayoutSettingsMigrationResult {
  return runGeometryWrapper(document, options, (layout, engineOptions) =>
    translateLayout(layout, {
      dx: options.dx,
      dy: options.dy,
      clampNegative: options.clampNegative,
      policy: options.policy,
      engineOptions,
      id: "dashboard-translate",
      phase: "commit",
      debug: true
    })
  );
}
