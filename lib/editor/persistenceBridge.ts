/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type {
  GridLayoutPersistenceController,
  LayoutPersistenceDocument,
  LayoutPersistenceError,
  LayoutPersistenceEvent,
  LayoutPersistenceMeta,
  LayoutsMap
} from "../persistence";
import type { Layout } from "../utils";
import {
  sanitizeEditorMetaById,
  validateEditorMetaById
} from "./metadata";
import {
  emptyGridEditorSectionRows,
  normalizeGridEditorSectionRows
} from "./sectionRows";
import type {
  GridEditorCommandResult,
  GridEditorConflict,
  GridEditorMetaById,
  GridEditorPersistenceBridge,
  GridEditorPersistenceEnvelope,
  GridEditorResolvedSectionRowState,
  GridEditorSectionRowState
} from "./types";

export type CreateGridEditorPersistenceBridgeOptions = {
  getEditorMetaById: () => GridEditorMetaById;
  getSectionRows?: () => GridEditorSectionRowState | undefined;
  setEditorMetaById?: (metaById: GridEditorMetaById, reason: string) => void;
  setSectionRows?: (sectionRows: GridEditorResolvedSectionRowState, reason: string) => void;
  persistence?: GridLayoutPersistenceController<Layout | LayoutsMap> | null;
  baseMeta?: LayoutPersistenceMeta | (() => LayoutPersistenceMeta | undefined);
  onSaveStateChange?: (input: {
    status: string;
    dirty: boolean;
    error?: LayoutPersistenceError | null;
  }) => void;
  onConflict?: (conflict: GridEditorConflict) => void;
  onError?: (code: string, message: string, details?: unknown) => void;
};

const result = (
  id: string,
  type: "save" | "discard" | "reset",
  status: GridEditorCommandResult["status"],
  error?: LayoutPersistenceError | null
): GridEditorCommandResult => ({
  id,
  type,
  status,
  targetIds: [],
  layoutPatches: [],
  metadataPatches: [],
  affectedIds: [],
  blocked: status === "error" || status === "blocked"
    ? {
        reason: "persistence-error",
        message: error?.message || "Persistence command failed."
      }
    : undefined,
  error: error ? { message: error.message, cause: error } : undefined,
  diagnostics: { durationMs: 0 }
});

export const createGridEditorPersistenceEnvelope = (
  editorMetaById: GridEditorMetaById,
  sectionRowsOrUpdatedAt?: GridEditorSectionRowState | string,
  updatedAt: string = new Date().toISOString()
): GridEditorPersistenceEnvelope => {
  const sectionRows = typeof sectionRowsOrUpdatedAt === "string"
    ? undefined
    : sectionRowsOrUpdatedAt;
  const resolvedUpdatedAt = typeof sectionRowsOrUpdatedAt === "string"
    ? sectionRowsOrUpdatedAt
    : updatedAt;
  const normalizedRows = sectionRows ? normalizeGridEditorSectionRows(sectionRows) : null;
  return {
    version: sectionRows ? 2 : 1,
    editorMetaById: sanitizeEditorMetaById(editorMetaById),
    sectionRows: normalizedRows
      ? {
          version: 1,
          items: normalizedRows.items,
          itemMembership: normalizedRows.itemMembership
        }
      : undefined,
    updatedAt: resolvedUpdatedAt
  };
};

export const readGridEditorPersistenceEnvelope = (
  document?: LayoutPersistenceDocument | null
): {
  ok: boolean;
  envelope?: GridEditorPersistenceEnvelope;
  error?: string;
} => {
  const raw = document?.meta?.editor;
  if (raw == null) {
    return {
      ok: true,
      envelope: createGridEditorPersistenceEnvelope({})
    };
  }
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "meta.editor must be an object." };
  }
  const envelope = raw as Partial<GridEditorPersistenceEnvelope>;
  if (envelope.version !== 1 && envelope.version !== 2) {
    return {
      ok: true,
      envelope: createGridEditorPersistenceEnvelope({})
    };
  }
  const validation = validateEditorMetaById(envelope.editorMetaById);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.errors[0]?.message || "Invalid editor metadata."
    };
  }
  const normalizedSectionRows = envelope.version === 2 && envelope.sectionRows
    ? normalizeGridEditorSectionRows(
        envelope.sectionRows,
        document?.kind === "layout" ? document.data.layout : []
      )
    : null;
  return {
    ok: true,
    envelope: {
      version: envelope.version === 2 ? 2 : 1,
      editorMetaById: validation.value,
      sectionRows: normalizedSectionRows
        ? {
            version: 1,
            items: normalizedSectionRows.items,
            itemMembership: normalizedSectionRows.itemMembership
          }
        : emptyGridEditorSectionRows(),
      updatedAt: typeof envelope.updatedAt === "string"
        ? envelope.updatedAt
        : new Date().toISOString()
    }
  };
};

export const createGridEditorPersistenceBridge = (
  options: CreateGridEditorPersistenceBridgeOptions
): GridEditorPersistenceBridge => {
  const resolveBaseMeta = (): LayoutPersistenceMeta => {
    const base = typeof options.baseMeta === "function"
      ? options.baseMeta()
      : options.baseMeta;
    return { ...(base || {}) };
  };

  const applyDocumentMeta = (
    document: LayoutPersistenceDocument,
    reason: string
  ) => {
    const envelope = readGridEditorPersistenceEnvelope(document);
    if (!envelope.ok || !envelope.envelope) {
      options.onError?.(
        "editor-metadata-invalid",
        envelope.error || "Invalid editor persistence metadata.",
        document
      );
      return;
    }
    options.setEditorMetaById?.(envelope.envelope.editorMetaById, reason);
    if (envelope.envelope.sectionRows) {
      options.setSectionRows?.(
        normalizeGridEditorSectionRows(
          envelope.envelope.sectionRows,
          document.kind === "layout" ? document.data.layout : []
        ),
        reason
      );
    }
  };

  return {
    meta() {
      return {
        ...resolveBaseMeta(),
        editor: createGridEditorPersistenceEnvelope(
          options.getEditorMetaById(),
          options.getSectionRows?.()
        )
      };
    },
    onPersistenceEvent(event: LayoutPersistenceEvent<Layout | LayoutsMap>) {
      if (event.type === "load-success" || event.type === "external-apply") {
        applyDocumentMeta(event.document, event.type);
      }
      if (event.type === "save-success") {
        applyDocumentMeta(event.document, "save-success");
      }
      if (event.type === "conflict") {
        const local = readGridEditorPersistenceEnvelope(event.conflict.localDocument);
        const external = readGridEditorPersistenceEnvelope(event.conflict.externalDocument);
        options.onConflict?.({
          key: event.key,
          reason: event.conflict.reason,
          localValue: event.conflict.localValue,
          externalValue: event.conflict.externalValue,
          localEditorMetaById: local.envelope?.editorMetaById,
          externalEditorMetaById: external.envelope?.editorMetaById,
          localDocument: event.conflict.localDocument,
          externalDocument: event.conflict.externalDocument,
          resolveActions: ["useLocal", "useRemote"]
        });
      }
      if (event.type === "save-start") {
        options.onSaveStateChange?.({ status: "saving", dirty: true });
      }
      if (event.type === "save-success") {
        options.onSaveStateChange?.({ status: "ready", dirty: false });
      }
      if (event.type === "save-error" || event.type === "error") {
        options.onSaveStateChange?.({
          status: "error",
          dirty: true,
          error: event.error
        });
      }
      if (event.type === "discard" || event.type === "reset") {
        options.onSaveStateChange?.({ status: "ready", dirty: false });
      }
    },
    async save() {
      if (!options.persistence) {
        return result("editor-save", "save", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: true
        });
      }
      const saveResult = await options.persistence.save();
      return result("editor-save", "save", saveResult.ok ? "changed" : "error", saveResult.error);
    },
    discard() {
      if (!options.persistence) {
        return result("editor-discard", "discard", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: true
        });
      }
      options.persistence.discard();
      return result("editor-discard", "discard", "changed");
    },
    reset() {
      if (!options.persistence) {
        return result("editor-reset", "reset", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: true
        });
      }
      options.persistence.reset();
      return result("editor-reset", "reset", "changed");
    }
  };
};
