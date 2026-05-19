import { cloneLayout } from "../utils";
import type {
  GridEditorClipboardAdapter,
  GridEditorClipboardPayload,
  GridEditorMetaById
} from "./types";
import { sanitizeEditorMetaById } from "./metadata";

export type GridEditorClipboardErrorCode =
  | "clipboard-unavailable"
  | "clipboard-permission"
  | "clipboard-invalid";

export class GridEditorClipboardError extends Error {
  code: GridEditorClipboardErrorCode;
  cause?: unknown;

  constructor(
    code: GridEditorClipboardErrorCode,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = "GridEditorClipboardError";
    this.code = code;
    this.cause = cause;
  }
}

const clonePayload = (
  payload: GridEditorClipboardPayload
): GridEditorClipboardPayload => ({
  version: 1,
  sourceId: payload.sourceId,
  copiedAt: payload.copiedAt,
  items: cloneLayout(payload.items),
  editorMetaById: sanitizeEditorMetaById(payload.editorMetaById)
});

let internalPayload: GridEditorClipboardPayload | null = null;

export const internalGridEditorClipboard: GridEditorClipboardAdapter & {
  clear: () => void;
} = {
  read() {
    return internalPayload ? clonePayload(internalPayload) : null;
  },
  write(payload) {
    internalPayload = clonePayload(payload);
  },
  clear() {
    internalPayload = null;
  }
};

const isClipboardPermissionError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return name === "NotAllowedError" || name === "SecurityError";
};

export const parseGridEditorClipboardPayload = (
  raw: unknown
): GridEditorClipboardPayload | null => {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Partial<GridEditorClipboardPayload>;
  if (input.version !== 1) return null;
  if (typeof input.sourceId !== "string") return null;
  if (typeof input.copiedAt !== "string") return null;
  if (!Array.isArray(input.items)) return null;
  const editorMetaById: GridEditorMetaById = sanitizeEditorMetaById(input.editorMetaById);
  return {
    version: 1,
    sourceId: input.sourceId,
    copiedAt: input.copiedAt,
    items: cloneLayout(input.items),
    editorMetaById
  };
};

export const systemClipboardAdapter = (): GridEditorClipboardAdapter => ({
  async read() {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof navigator.clipboard.readText !== "function"
    ) {
      throw new GridEditorClipboardError(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text) return null;
      const parsed = JSON.parse(text);
      const payload = parseGridEditorClipboardPayload(parsed);
      if (!payload) {
        throw new GridEditorClipboardError(
          "clipboard-invalid",
          "Clipboard does not contain a grid editor payload."
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof GridEditorClipboardError) throw error;
      throw new GridEditorClipboardError(
        isClipboardPermissionError(error) ? "clipboard-permission" : "clipboard-invalid",
        "Failed to read grid editor payload from system clipboard.",
        error
      );
    }
  },
  async write(payload) {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
      throw new GridEditorClipboardError(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(clonePayload(payload)));
    } catch (error) {
      throw new GridEditorClipboardError(
        isClipboardPermissionError(error) ? "clipboard-permission" : "clipboard-unavailable",
        "Failed to write grid editor payload to system clipboard.",
        error
      );
    }
  }
});

export const createGridEditorClipboardPayload = (
  input: Omit<GridEditorClipboardPayload, "version" | "copiedAt"> & {
    copiedAt?: string;
  }
): GridEditorClipboardPayload => ({
  version: 1,
  sourceId: input.sourceId,
  copiedAt: input.copiedAt || new Date().toISOString(),
  items: cloneLayout(input.items),
  editorMetaById: sanitizeEditorMetaById(input.editorMetaById, {
    layout: input.items
  })
});
