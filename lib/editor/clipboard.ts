import { cloneLayout } from "../utils";
import type {
  GridEditorClipboardAdapter,
  GridEditorClipboardGeometry,
  GridEditorClipboardOriginalGeometryById,
  GridEditorClipboardPayload,
  GridEditorClipboardSourceContext,
  GridEditorMetaById
} from "./types";
import type { Layout, LayoutItem } from "../utils";
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

export type GridEditorClipboardTargetContext = {
  cols?: number;
  scale?: boolean;
};

export type GridEditorClipboardNormalizationResult = {
  items: Layout;
  scaled: boolean;
  sourceCols?: number;
  targetCols?: number;
};

export type CreateGridEditorClipboardPayloadInput = {
  version?: 1 | 2;
  sourceId: string;
  copiedAt?: string;
  items: Layout;
  editorMetaById: GridEditorMetaById;
  source?: GridEditorClipboardSourceContext;
  originalGeometryById?: GridEditorClipboardOriginalGeometryById;
};

const isFiniteGridNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizePositiveInteger = (value: unknown): number | undefined =>
  isFiniteGridNumber(value) && value > 0 ? Math.floor(value) : undefined;

const normalizeString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const itemGeometry = (item: LayoutItem): GridEditorClipboardGeometry => ({
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h
});

const geometryById = (items: Layout): GridEditorClipboardOriginalGeometryById =>
  items.reduce((acc, item) => {
    acc[item.i] = itemGeometry(item);
    return acc;
  }, {} as GridEditorClipboardOriginalGeometryById);

const normalizeSourceContext = (source: unknown) => {
  if (!source || typeof source !== "object") return undefined;
  const input = source as Record<string, unknown>;
  const normalized: GridEditorClipboardSourceContext = {};
  const cols = normalizePositiveInteger(input.cols);
  if (cols) normalized.cols = cols;
  const breakpoint = normalizeString(input.breakpoint);
  if (breakpoint) normalized.breakpoint = breakpoint;
  const layoutId = normalizeString(input.layoutId);
  if (layoutId) normalized.layoutId = layoutId;
  const viewFormat = normalizeString(input.viewFormat);
  if (viewFormat) normalized.viewFormat = viewFormat;
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const normalizeGeometryById = (
  input: unknown,
  fallbackItems: Layout
): GridEditorClipboardOriginalGeometryById => {
  const fallback = geometryById(fallbackItems);
  if (!input || typeof input !== "object") return fallback;
  const output: GridEditorClipboardOriginalGeometryById = {};
  Object.keys(input as Record<string, unknown>).forEach(id => {
    const geometry = (input as Record<string, unknown>)[id];
    if (!geometry || typeof geometry !== "object") return;
    const candidate = geometry as Partial<GridEditorClipboardGeometry>;
    if (
      !isFiniteGridNumber(candidate.x) ||
      !isFiniteGridNumber(candidate.y) ||
      !isFiniteGridNumber(candidate.w) ||
      !isFiniteGridNumber(candidate.h)
    ) {
      return;
    }
    output[id] = {
      x: candidate.x,
      y: candidate.y,
      w: candidate.w,
      h: candidate.h
    };
  });
  return {
    ...fallback,
    ...output
  };
};

const cloneGeometryById = (
  input: unknown,
  fallbackItems: Layout
): GridEditorClipboardOriginalGeometryById =>
  normalizeGeometryById(input, fallbackItems);

const clonePayload = (
  payload: GridEditorClipboardPayload
): GridEditorClipboardPayload => {
  const items = cloneLayout(payload.items);
  const base = {
    sourceId: payload.sourceId,
    copiedAt: payload.copiedAt,
    items,
    editorMetaById: sanitizeEditorMetaById(payload.editorMetaById)
  };
  if (payload.version === 2) {
    return {
      version: 2,
      ...base,
      source: normalizeSourceContext(payload.source),
      originalGeometryById: cloneGeometryById(payload.originalGeometryById, items)
    };
  }
  return {
    version: 1,
    ...base
  };
};

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
  const input = raw as Record<string, unknown>;
  if (input.version !== 1 && input.version !== 2) return null;
  if (typeof input.sourceId !== "string") return null;
  if (typeof input.copiedAt !== "string") return null;
  if (!Array.isArray(input.items)) return null;
  const items = cloneLayout(input.items);
  const editorMetaById: GridEditorMetaById = sanitizeEditorMetaById(input.editorMetaById);
  if (input.version === 2) {
    return {
      version: 2,
      sourceId: input.sourceId,
      copiedAt: input.copiedAt,
      items,
      editorMetaById,
      source: normalizeSourceContext(input.source),
      originalGeometryById: normalizeGeometryById(input.originalGeometryById, items)
    };
  }
  return {
    version: 1,
    sourceId: input.sourceId,
    copiedAt: input.copiedAt,
    items,
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
  input: CreateGridEditorClipboardPayloadInput
): GridEditorClipboardPayload => {
  const items = cloneLayout(input.items);
  const base = {
    sourceId: input.sourceId,
    copiedAt: input.copiedAt || new Date().toISOString(),
    items,
    editorMetaById: sanitizeEditorMetaById(input.editorMetaById, {
      layout: input.items
    })
  };
  if (input.version === 1) {
    return {
      version: 1,
      ...base
    };
  }
  return {
    version: 2,
    ...base,
    source: normalizeSourceContext(input.source),
    originalGeometryById: cloneGeometryById(input.originalGeometryById, items)
  };
};

export const normalizeGridEditorClipboardItemsForTarget = (
  payload: GridEditorClipboardPayload | Pick<GridEditorClipboardPayload, "items">,
  target: GridEditorClipboardTargetContext = {}
): GridEditorClipboardNormalizationResult => {
  const targetCols = normalizePositiveInteger(target.cols);
  const sourceCols = "version" in payload && payload.version === 2
    ? normalizePositiveInteger(payload.source?.cols)
    : undefined;
  if (!targetCols || !sourceCols || target.scale === false || targetCols === sourceCols) {
    return {
      items: cloneLayout(payload.items),
      scaled: false,
      sourceCols,
      targetCols
    };
  }

  const ratio = targetCols / sourceCols;
  const originalGeometryById = "version" in payload && payload.version === 2
    ? normalizeGeometryById(payload.originalGeometryById, payload.items)
    : geometryById(payload.items);
  const sourceOriginX = payload.items.reduce((origin, item) => {
    const geometry = originalGeometryById[item.i] || itemGeometry(item);
    return Math.min(origin, geometry.x);
  }, originalGeometryById[payload.items[0]?.i]?.x ?? payload.items[0]?.x ?? 0);

  return {
    items: payload.items.map(item => {
      const geometry = originalGeometryById[item.i] || itemGeometry(item);
      const w = Math.max(1, Math.min(targetCols, Math.round(geometry.w * ratio)));
      const x = Math.max(
        0,
        Math.min(
          Math.max(0, targetCols - w),
          Math.floor((geometry.x - sourceOriginX) * ratio)
        )
      );
      return {
        ...item,
        x,
        y: Math.max(0, Math.floor(geometry.y)),
        w,
        h: Math.max(1, Math.floor(geometry.h))
      };
    }),
    scaled: true,
    sourceCols,
    targetCols
  };
};
