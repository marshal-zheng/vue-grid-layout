import { ref } from "vue";
import { deepEqual } from "fast-equals";
import { cloneLayout } from "../utils";
import { cloneLayoutsMap } from "../persistence";
import type {
  GridEditorHistoryController,
  GridEditorHistoryCheckpoint,
  GridEditorHistoryEntry,
  GridEditorHistoryMark,
  GridEditorHistoryPushOptions,
  GridEditorHistoryReplaceOptions,
  GridEditorHistorySnapshot,
  GridEditorMetaById,
  GridEditorSectionRowState
} from "./types";

export type GridEditorHistoryOptions = {
  maxSize?: number;
  mergeWindowMs?: number;
  now?: () => Date;
};

const DEFAULT_MAX_SIZE = 100;
const DEFAULT_MERGE_WINDOW_MS = 650;

const cloneSnapshot = (
  snapshot: GridEditorHistorySnapshot
): GridEditorHistorySnapshot => {
  if (snapshot.kind === "layout") {
    return {
      ...snapshot,
      layout: cloneLayout(snapshot.layout),
      editorMetaById: cloneMeta(snapshot.editorMetaById),
      sectionRows: cloneSectionRows(snapshot.sectionRows),
      selection: {
        ...snapshot.selection,
        selectedIds: snapshot.selection.selectedIds.slice()
      }
    };
  }
  return {
    ...snapshot,
    layouts: cloneLayoutsMap(snapshot.layouts),
    editorMetaById: cloneMeta(snapshot.editorMetaById),
    sectionRows: cloneSectionRows(snapshot.sectionRows),
    selection: {
      ...snapshot.selection,
      selectedIds: snapshot.selection.selectedIds.slice()
    }
  };
};

const cloneMeta = (metaById: GridEditorMetaById): GridEditorMetaById =>
  Object.keys(metaById || {}).reduce((acc, id) => {
    const meta = metaById[id];
    acc[id] = {
      ...meta,
      resizeHandles: meta.resizeHandles ? meta.resizeHandles.slice() : undefined,
      data: meta.data ? { ...meta.data } : undefined
    };
    return acc;
  }, {} as GridEditorMetaById);

const cloneSectionRows = (
  rows: GridEditorSectionRowState
): GridEditorSectionRowState => ({
  version: 1,
  items: Object.keys(rows.items || {}).reduce((acc, id) => {
    const row = rows.items[id];
    acc[id] = {
      ...row,
      bounds: row.bounds ? { ...row.bounds } : undefined,
      itemIds: row.itemIds ? row.itemIds.slice() : undefined,
      allowedDropZones: row.allowedDropZones ? row.allowedDropZones.slice() : undefined
    };
    return acc;
  }, {} as GridEditorSectionRowState["items"]),
  itemMembership: Object.keys(rows.itemMembership || {}).reduce((acc, id) => {
    acc[id] = { ...(rows.itemMembership?.[id] || {}) };
    return acc;
  }, {} as NonNullable<GridEditorSectionRowState["itemMembership"]>)
});

const cloneEntry = (entry: GridEditorHistoryEntry): GridEditorHistoryEntry => ({
  ...entry,
  before: cloneSnapshot(entry.before),
  after: cloneSnapshot(entry.after),
  targetIds: entry.targetIds ? entry.targetIds.slice() : undefined,
  affectedIds: entry.affectedIds ? entry.affectedIds.slice() : undefined
});

export const createGridEditorHistory = (
  options: GridEditorHistoryOptions = {}
): GridEditorHistoryController => {
  const maxSize = Math.max(1, Math.floor(options.maxSize || DEFAULT_MAX_SIZE));
  const mergeWindowMs = options.mergeWindowMs || DEFAULT_MERGE_WINDOW_MS;
  const canUndo = ref(false);
  const canRedo = ref(false);
  let past: GridEditorHistoryEntry[] = [];
  let future: GridEditorHistoryEntry[] = [];

  const updateFlags = () => {
    canUndo.value = past.length > 0;
    canRedo.value = future.length > 0;
  };

  const trim = () => {
    const overflow = past.length - maxSize;
    if (overflow > 0) past = past.slice(overflow);
  };

  const shouldMerge = (
    previous: GridEditorHistoryEntry | undefined,
    next: GridEditorHistoryEntry
  ): boolean => {
    if (!previous || !previous.mergeKey || previous.mergeKey !== next.mergeKey) return false;
    const previousTime = Date.parse(previous.createdAt);
    const nextTime = Date.parse(next.createdAt);
    return Number.isFinite(previousTime) &&
      Number.isFinite(nextTime) &&
      nextTime - previousTime <= mergeWindowMs;
  };

  const pushEntry = (
    entry: GridEditorHistoryEntry,
    pushOptions: GridEditorHistoryPushOptions = {}
  ) => {
    if (deepEqual(entry.before, entry.after)) return;
    const nextEntry = {
      ...cloneEntry(entry)
    };
    const previous = past[past.length - 1];
    if (shouldMerge(previous, nextEntry)) {
      past[past.length - 1] = {
        ...previous,
        after: cloneSnapshot(nextEntry.after),
        createdAt: nextEntry.createdAt
      };
    } else {
      past.push(nextEntry);
    }
    if (!pushOptions.preserveRedoStack) {
      future = [];
    }
    trim();
    updateFlags();
  };

  return {
    canUndo,
    canRedo,
    push(entry, pushOptions: GridEditorHistoryPushOptions = {}) {
      pushEntry(entry, pushOptions);
    },
    undo() {
      const entry = past.pop();
      if (!entry) return null;
      future.unshift(entry);
      updateFlags();
      return entry;
    },
    redo() {
      const entry = future.shift();
      if (!entry) return null;
      past.push(entry);
      trim();
      updateFlags();
      return entry;
    },
    replacePresent(_snapshot, replaceOptions: GridEditorHistoryReplaceOptions = {}) {
      if (!replaceOptions.preserveRedoStack) {
        future = [];
      }
      updateFlags();
    },
    clear() {
      past = [];
      future = [];
      updateFlags();
    },
    mark(snapshot, revision) {
      return {
        id: `editor-history-mark:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        snapshot: cloneSnapshot(snapshot),
        revision
      };
    },
    bailToMark(mark: GridEditorHistoryMark) {
      updateFlags();
      return cloneSnapshot(mark.snapshot);
    },
    squashToMark(mark: GridEditorHistoryMark, entry, pushOptions: GridEditorHistoryPushOptions = {}) {
      const squashed = {
        ...entry,
        before: cloneSnapshot(mark.snapshot),
        after: cloneSnapshot(entry.after)
      };
      pushEntry(squashed, pushOptions);
    },
    checkpoint(): GridEditorHistoryCheckpoint {
      return {
        id: `editor-history-checkpoint:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        kind: "grid-editor-history-checkpoint",
        past: past.map(cloneEntry),
        future: future.map(cloneEntry),
        canUndo: canUndo.value,
        canRedo: canRedo.value
      };
    },
    restore(checkpoint: GridEditorHistoryCheckpoint) {
      past = checkpoint.past.map(cloneEntry);
      future = checkpoint.future.map(cloneEntry);
      updateFlags();
    }
  };
};

export const createGridEditorHistoryEntry = (
  input: Omit<GridEditorHistoryEntry, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
): GridEditorHistoryEntry => ({
  id: input.id || `editor-history:${Date.now()}:${Math.random().toString(36).slice(2)}`,
  commandId: input.commandId,
  commandType: input.commandType,
  before: input.before,
  after: input.after,
  createdAt: input.createdAt || new Date().toISOString(),
  mergeKey: input.mergeKey,
  source: input.source,
  origin: input.origin,
  targetIds: input.targetIds,
  affectedIds: input.affectedIds,
  historyMode: input.historyMode
});
