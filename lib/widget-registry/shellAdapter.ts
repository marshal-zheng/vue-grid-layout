import type {
  DashboardLayoutDocument
} from "../dashboard";
import type {
  DashboardEditorShellAdapterContext,
  DashboardEditorShellAdapterResult,
  DashboardEditorShellCommitContext,
  DashboardEditorShellDiagnostic,
  DashboardEditorShellPaletteAdapter,
  DashboardEditorShellPreparedMutation,
  DashboardEditorShellWidgetAdapter,
  DashboardEditorShellWidgetTemplate
} from "../dashboard-editor-shell";
import type {
  WidgetInstanceMetadata,
  WidgetRegistry,
  WidgetRegistryDiagnostic,
  WidgetRegistryPaletteAdapterOptions,
  WidgetRegistryPaletteItem,
  WidgetRegistryWidgetAdapterOptions
} from "./types";
import { materializeWidgetTemplate } from "./template";
import { readWidgetInstanceMetadata, writeWidgetInstanceMetadata } from "./document";
import { normalizeWidgetLayoutDefaults, widgetFallbackLayoutDefaults } from "./layout";
import { cloneJsonObject, cloneJsonValue, diagnostic, isPlainRecord } from "./json";

const toShellDiagnostics = (
  diagnostics: WidgetRegistryDiagnostic[]
): DashboardEditorShellDiagnostic[] =>
  diagnostics.map(item => ({
    code: item.code,
    level: item.level,
    message: item.message,
    itemId: item.itemId,
    path: item.path,
    details: {
      type: item.type || null,
      fieldId: item.fieldId || null,
      profileId: item.profileId || null,
      details: item.details || null
    }
  }));

const templateWidgetMetadata = (
  template: DashboardEditorShellWidgetTemplate | undefined
): WidgetInstanceMetadata | null => {
  const fromMetadata = template?.metadata?.widget;
  if (isPlainRecord(fromMetadata) && isPlainRecord(fromMetadata.instance)) {
    return fromMetadata.instance as unknown as WidgetInstanceMetadata;
  }
  const fromPayload = template?.payload;
  if (isPlainRecord(fromPayload) && isPlainRecord(fromPayload.widget)) {
    return fromPayload.widget as unknown as WidgetInstanceMetadata;
  }
  return null;
};

const allDocumentItems = (
  document: DashboardLayoutDocument | undefined | null
): Array<{ id: string; item: Record<string, unknown> }> => {
  const out: Array<{ id: string; item: Record<string, unknown> }> = [];
  Object.values(document?.layouts || {}).forEach(layout => {
    Object.keys(layout.widgets || {}).forEach(id => out.push({ id, item: layout.widgets[id] as Record<string, unknown> }));
    Object.values(layout.profiles || {}).forEach(profile => {
      Object.keys(profile.widgets || {}).forEach(id => out.push({ id, item: (profile.widgets || {})[id] as Record<string, unknown> }));
    });
  });
  return out;
};

const writeMetadataToDocument = (
  document: DashboardLayoutDocument | undefined,
  itemIds: string[],
  metadata: WidgetInstanceMetadata,
  policy: "strict" | "tolerant"
): WidgetRegistryDiagnostic[] => {
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  if (!document) return diagnostics;
  const targetIds = new Set(itemIds);
  Object.values(document.layouts || {}).forEach(layout => {
    Object.keys(layout.widgets || {}).forEach(id => {
      if (!targetIds.has(id)) return;
      const written = writeWidgetInstanceMetadata(layout.widgets[id], metadata, { policy });
      diagnostics.push(...written.diagnostics.map(item => ({ ...item, itemId: id })));
      layout.widgets[id] = written.item;
    });
  });
  return diagnostics;
};

const buildPaletteItem = (
  registry: WidgetRegistry,
  type: string
): WidgetRegistryPaletteItem | null => {
  const resolved = registry.resolve(type);
  if (!resolved.ok) return null;
  const layout = normalizeWidgetLayoutDefaults(resolved.definition.layoutDefaults, {
    type,
    policy: "tolerant",
    includeFallback: true
  });
  return {
    type,
    title: resolved.definition.title,
    description: resolved.definition.description,
    category: resolved.definition.category,
    tags: resolved.definition.tags,
    icon: resolved.definition.icon,
    status: resolved.definition.status,
    defaultSize: {
      w: layout.layout.w || widgetFallbackLayoutDefaults().w,
      h: layout.layout.h || widgetFallbackLayoutDefaults().h
    },
    diagnostics: [...resolved.diagnostics, ...layout.diagnostics]
  };
};

export function createWidgetRegistryPaletteAdapter(
  registry: WidgetRegistry,
  options: WidgetRegistryPaletteAdapterOptions = {}
): DashboardEditorShellPaletteAdapter {
  const policy = options.policy || "tolerant";
  return {
    open: (): DashboardEditorShellWidgetTemplate[] | DashboardEditorShellAdapterResult => {
      const definitions = registry.list(options.filter);
      const items = definitions
        .map(definition => buildPaletteItem(registry, definition.type))
        .filter((item): item is WidgetRegistryPaletteItem => Boolean(item));
      const diagnostics = items.flatMap(item => item.diagnostics);
      if (options.autoMaterializeFirst && definitions[0]) {
        const materialized = materializeWidgetTemplate(registry, { type: definitions[0].type }, { policy });
        if (materialized.ok) return [materialized.template];
        return {
          ok: false,
          status: "blocked",
          reason: "validation",
          diagnostics: toShellDiagnostics(materialized.diagnostics)
        };
      }
      return {
        ok: true,
        status: "success",
        metadata: { items },
        diagnostics: toShellDiagnostics(diagnostics)
      };
    }
  };
}

const preparedFromMetadata = (
  ctx: DashboardEditorShellAdapterContext,
  metadata: WidgetInstanceMetadata | null
): DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult => {
  if (!metadata) {
    return {
      ok: false,
      status: "blocked",
      reason: "validation",
      diagnostics: [{
        code: "widget-registry.invalid-template",
        level: "error",
        message: "Widget template does not include registry metadata.",
        actionId: ctx.actionId,
        actionType: ctx.actionType,
        source: ctx.source,
        reason: "validation"
      }]
    };
  }
  const templateId = ctx.template?.id || ctx.template?.i;
  return {
    id: `${ctx.actionId}:widget-registry`,
    kind: "widget",
    sourceIds: ctx.itemIds,
    newIds: templateId ? [String(templateId)] : undefined,
    metadata: { widget: metadata },
    opaque: { widget: metadata },
    diagnostics: []
  };
};

const metadataFromPrepared = (
  prepared: DashboardEditorShellPreparedMutation
): WidgetInstanceMetadata | null => {
  if (isPlainRecord(prepared.metadata?.widget)) {
    return prepared.metadata?.widget as unknown as WidgetInstanceMetadata;
  }
  if (isPlainRecord(prepared.opaque) && isPlainRecord(prepared.opaque.widget)) {
    return prepared.opaque.widget as unknown as WidgetInstanceMetadata;
  }
  return null;
};

const cloneMetadata = (
  metadata: WidgetInstanceMetadata,
  policy: "strict" | "tolerant",
  clonePolicy: WidgetRegistryWidgetAdapterOptions["clonePolicy"]
): WidgetInstanceMetadata | null => {
  const next: WidgetInstanceMetadata = {
    widgetType: metadata.widgetType,
    widgetVersion: metadata.widgetVersion,
    templateId: metadata.templateId,
    rendererHint: metadata.rendererHint,
    migration: metadata.migration,
    extensions: metadata.extensions
  };
  if (clonePolicy !== "metadata-only") next.settings = metadata.settings;
  if (clonePolicy === "settings-bindings-payload") {
    next.bindings = metadata.bindings;
    next.payload = metadata.payload;
  }
  const cloned = cloneJsonObject(next, { policy, path: "prepared.metadata.widget" });
  return cloned.ok ? cloned.value as unknown as WidgetInstanceMetadata : null;
};

const metadataFromPayload = (
  payload: unknown,
  policy: "strict" | "tolerant",
  clonePolicy: WidgetRegistryWidgetAdapterOptions["clonePolicy"]
): WidgetInstanceMetadata | null => {
  if (!isPlainRecord(payload)) return null;
  const metadata = isPlainRecord(payload.metadata) && isPlainRecord(payload.metadata.widget)
    ? payload.metadata.widget as unknown as WidgetInstanceMetadata
    : isPlainRecord(payload.widget)
      ? payload.widget as unknown as WidgetInstanceMetadata
      : null;
  return metadata ? cloneMetadata(metadata, policy, clonePolicy) : null;
};

const metadataForItems = (
  document: DashboardLayoutDocument | null,
  itemIds: string[],
  policy: "strict" | "tolerant",
  clonePolicy: WidgetRegistryWidgetAdapterOptions["clonePolicy"]
): WidgetInstanceMetadata | null => {
  for (const id of itemIds) {
    const found = allDocumentItems(document).find(entry => entry.id === id);
    const metadata = readWidgetInstanceMetadata(found?.item as never);
    if (metadata) return cloneMetadata(metadata, policy, clonePolicy);
  }
  return null;
};

export function createWidgetRegistryWidgetAdapter(
  _registry: WidgetRegistry,
  options: WidgetRegistryWidgetAdapterOptions = {}
): DashboardEditorShellWidgetAdapter {
  const policy = options.policy || "tolerant";
  const clonePolicy = options.clonePolicy || "settings-bindings-payload";

  const prepareExisting = (ctx: DashboardEditorShellAdapterContext) => {
    const metadata = metadataFromPayload(ctx.payload, policy, clonePolicy) ||
      metadataForItems(ctx.document, ctx.itemIds, policy, clonePolicy);
    return preparedFromMetadata(ctx, metadata);
  };

  return {
    canCopyWidget: ctx => ({
      available: Boolean(metadataForItems(ctx.document, ctx.itemIds, policy, clonePolicy))
    }),
    copyWidget: ctx => {
      const metadata = metadataForItems(ctx.document, ctx.itemIds, policy, clonePolicy);
      if (!metadata) {
        return {
          ok: false,
          status: "blocked",
          reason: "missing-item",
          diagnostics: [{
            code: "widget-registry.unknown-type",
            level: "warning",
            message: "No widget registry metadata found for copied item.",
            actionId: ctx.actionId,
            actionType: ctx.actionType,
            source: ctx.source,
            reason: "missing-item"
          }]
        };
      }
      return {
        ok: true,
        status: "success",
        sourceIds: ctx.itemIds,
        metadata: { widget: metadata }
      };
    },
    preparePasteWidget: prepareExisting,
    prepareDuplicateWidget: prepareExisting,
    prepareRemoveWidget: ctx => ({
      id: `${ctx.actionId}:widget-registry-remove`,
      kind: "widget",
      sourceIds: ctx.itemIds,
      metadata: { removedWidgetIds: ctx.itemIds }
    }),
    prepareAddWidget: ctx => preparedFromMetadata(ctx, templateWidgetMetadata(ctx.template)),
    commit: (
      prepared: DashboardEditorShellPreparedMutation,
      ctx: DashboardEditorShellCommitContext
    ): DashboardEditorShellAdapterResult => {
      const metadata = metadataFromPrepared(prepared);
      if (!metadata) return { ok: true, status: "success" };
      const affectedIds = ctx.commandResult?.affectedIds || prepared.newIds || [];
      const diagnostics = writeMetadataToDocument(ctx.proposedDocument, affectedIds, metadata, policy);
      return {
        ok: true,
        status: "success",
        newIds: affectedIds,
        sourceIds: prepared.sourceIds,
        idMap: prepared.idMap,
        metadata: {
          widget: metadata,
          sourceIds: prepared.sourceIds || [],
          newIds: affectedIds
        },
        diagnostics: toShellDiagnostics(diagnostics)
      };
    },
    rollback: (
      prepared: DashboardEditorShellPreparedMutation
    ): DashboardEditorShellAdapterResult => ({
      ok: true,
      status: "success",
      sourceIds: prepared.sourceIds,
      newIds: prepared.newIds,
      idMap: prepared.idMap
    })
  };
}

export const widgetRegistryDiagnostic = diagnostic;
export const cloneWidgetRegistryJsonValue = cloneJsonValue;
