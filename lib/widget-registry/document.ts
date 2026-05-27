import type {
  DashboardItemLayout,
  DashboardItemLayoutOverride,
  DashboardLayoutDocument
} from "../dashboard";
import type {
  WidgetInstanceMetadata,
  WidgetRegistry,
  WidgetRegistryDiagnostic,
  WidgetRegistryPolicy
} from "./types";
import {
  cloneJsonObject,
  cloneJsonValue,
  diagnostic,
  diagnosticsHaveErrors,
  isPlainRecord
} from "./json";
import { validateWidgetSettings } from "./settings";

const widgetPath = (base: string): string => `${base}.extensions.widget`;

const readRawWidgetMetadata = (
  item: DashboardItemLayout | DashboardItemLayoutOverride | undefined
): unknown => item?.extensions?.widget;

export function readWidgetInstanceMetadata(
  item: DashboardItemLayout | DashboardItemLayoutOverride | undefined
): WidgetInstanceMetadata | null {
  const raw = readRawWidgetMetadata(item);
  if (!isPlainRecord(raw) || typeof raw.widgetType !== "string") return null;
  const cloned = cloneJsonObject(raw, { policy: "tolerant", path: "extensions.widget" });
  return cloned.ok ? cloned.value as unknown as WidgetInstanceMetadata : null;
}

const sanitizeWidgetInstanceMetadata = (
  metadata: WidgetInstanceMetadata,
  options: { policy: WidgetRegistryPolicy; path: string }
): { ok: boolean; metadata: WidgetInstanceMetadata | null; diagnostics: WidgetRegistryDiagnostic[] } => {
  if (!metadata || typeof metadata.widgetType !== "string" || metadata.widgetType.trim().length === 0) {
    return {
      ok: false,
      metadata: null,
      diagnostics: [diagnostic("widget-registry.invalid-template", "error", "Widget instance metadata requires widgetType.", {
        path: options.path
      })]
    };
  }
  const cloned = cloneJsonObject(metadata, { policy: options.policy, path: options.path });
  return {
    ok: cloned.ok,
    metadata: cloned.ok ? cloned.value as unknown as WidgetInstanceMetadata : null,
    diagnostics: cloned.diagnostics
  };
};

export function writeWidgetInstanceMetadata<T extends DashboardItemLayout | DashboardItemLayoutOverride>(
  item: T,
  metadata: WidgetInstanceMetadata | null,
  options: { policy?: WidgetRegistryPolicy } = {}
): { item: T; diagnostics: WidgetRegistryDiagnostic[] } {
  const policy = options.policy || "strict";
  const next = {
    ...item,
    extensions: {
      ...((item.extensions || {}) as Record<string, unknown>)
    }
  } as T;

  if (metadata === null) {
    delete (next.extensions as Record<string, unknown>).widget;
    if (Object.keys(next.extensions || {}).length === 0) delete (next as { extensions?: unknown }).extensions;
    return { item: next, diagnostics: [] };
  }

  const sanitized = sanitizeWidgetInstanceMetadata(metadata, { policy, path: "extensions.widget" });
  if (!sanitized.ok && policy === "strict") return { item, diagnostics: sanitized.diagnostics };
  if (sanitized.metadata) {
    (next.extensions as Record<string, unknown>).widget = sanitized.metadata;
  }
  return { item: next, diagnostics: sanitized.diagnostics };
}

const validateInstance = (
  itemId: string,
  item: DashboardItemLayout | DashboardItemLayoutOverride,
  registry: WidgetRegistry | null,
  input: { policy: WidgetRegistryPolicy; path: string; profileId?: string | null; requireTypedItems?: boolean }
): WidgetRegistryDiagnostic[] => {
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  const raw = readRawWidgetMetadata(item);
  if (raw === undefined) {
    if (input.requireTypedItems) {
      diagnostics.push(diagnostic("widget-registry.untyped-layout-item", "warning", "Dashboard item has no widget sidecar.", {
        itemId,
        profileId: input.profileId || undefined,
        path: widgetPath(input.path)
      }));
    }
    return diagnostics;
  }

  const cloned = cloneJsonObject(raw, { policy: input.policy, path: widgetPath(input.path) });
  diagnostics.push(...cloned.diagnostics);
  if (!cloned.ok && input.policy === "strict") return diagnostics;

  const metadata = cloned.value as unknown as WidgetInstanceMetadata;
  if (!metadata.widgetType) {
    diagnostics.push(diagnostic("widget-registry.invalid-template", "error", "Widget sidecar requires widgetType.", {
      itemId,
      profileId: input.profileId || undefined,
      path: widgetPath(input.path)
    }));
    return diagnostics;
  }

  if (!registry) {
    diagnostics.push(diagnostic("widget-registry.unknown-type", "warning", "Widget registry unavailable; sidecar is preserved.", {
      type: metadata.widgetType,
      itemId,
      profileId: input.profileId || undefined,
      path: widgetPath(input.path)
    }));
    return diagnostics;
  }

  const resolved = registry.resolve(metadata.widgetType);
  diagnostics.push(...resolved.diagnostics.map(item => ({ ...item, itemId, profileId: input.profileId || undefined, path: item.path || widgetPath(input.path) })));
  if (!resolved.ok) return diagnostics;

  if (metadata.widgetVersion && metadata.widgetVersion !== resolved.definition.version) {
    diagnostics.push(diagnostic("widget-registry.deprecated-type", "warning", "Widget instance version differs from registered type version.", {
      type: metadata.widgetType,
      itemId,
      profileId: input.profileId || undefined,
      path: `${widgetPath(input.path)}.widgetVersion`,
      details: { registeredVersion: resolved.definition.version }
    }));
  }

  if (metadata.settings !== undefined) {
    const validation = validateWidgetSettings(resolved.definition.settings, metadata.settings, {
      policy: input.policy,
      type: metadata.widgetType,
      path: `${widgetPath(input.path)}.settings`
    });
    diagnostics.push(...validation.diagnostics.map(item => ({ ...item, itemId, profileId: input.profileId || undefined })));
  }

  for (const key of ["bindings", "payload", "rendererHint", "extensions"] as const) {
    if (metadata[key] === undefined) continue;
    const clonedValue = cloneJsonValue(metadata[key], { policy: input.policy, path: `${widgetPath(input.path)}.${key}` });
    diagnostics.push(...clonedValue.diagnostics.map(item => ({ ...item, itemId, profileId: input.profileId || undefined })));
  }

  return diagnostics;
};

export function validateDashboardWidgetInstances(
  document: DashboardLayoutDocument,
  registry: WidgetRegistry | null,
  options: {
    policy?: WidgetRegistryPolicy;
    layoutId?: string;
    profileId?: string | null;
    requireTypedItems?: boolean;
  } = {}
): { ok: boolean; diagnostics: WidgetRegistryDiagnostic[] } {
  const policy = options.policy || "strict";
  const diagnostics: WidgetRegistryDiagnostic[] = [];
  const layoutIds = options.layoutId ? [options.layoutId] : Object.keys(document.layouts || {});
  layoutIds.forEach(layoutId => {
    const layout = document.layouts[layoutId];
    if (!layout) return;
    Object.keys(layout.widgets || {}).forEach(itemId => {
      diagnostics.push(...validateInstance(itemId, layout.widgets[itemId], registry, {
        policy,
        path: `layouts.${layoutId}.widgets.${itemId}`,
        requireTypedItems: options.requireTypedItems
      }));
    });
    Object.keys(layout.profiles || {}).forEach(profileId => {
      if (options.profileId && options.profileId !== profileId) return;
      const profile = layout.profiles?.[profileId];
      Object.keys(profile?.widgets || {}).forEach(itemId => {
        diagnostics.push(...validateInstance(itemId, (profile?.widgets || {})[itemId], registry, {
          policy,
          path: `layouts.${layoutId}.profiles.${profileId}.widgets.${itemId}`,
          profileId,
          requireTypedItems: false
        }));
      });
    });
  });
  return {
    ok: policy === "tolerant" || !diagnosticsHaveErrors(diagnostics),
    diagnostics
  };
}
