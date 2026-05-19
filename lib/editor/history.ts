import { ref } from "vue";
import { deepEqual } from "fast-equals";
import { cloneLayout } from "../utils";
import { cloneLayoutsMap } from "../persistence";
import type {
  GridEditorHistoryController,
  GridEditorHistoryEntry,
  GridEditorHistorySnapshot
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
      editorMetaById: { ...snapshot.editorMetaById },
      selection: {
        ...snapshot.selection,
        selectedIds: snapshot.selection.selectedIds.slice()
      }
    };
  }
  return {
    ...snapshot,
    layouts: cloneLayoutsMap(snapshot.layouts),
    editorMetaById: { ...snapshot.editorMetaById },
    selection: {
      ...snapshot.selection,
      selectedIds: snapshot.selection.selectedIds.slice()
    }
  };
};

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

  return {
    canUndo,
    canRedo,
    push(entry) {
      if (deepEqual(entry.before, entry.after)) return;
      const nextEntry = {
        ...entry,
        before: cloneSnapshot(entry.before),
        after: cloneSnapshot(entry.after)
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
      future = [];
      trim();
      updateFlags();
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
    replacePresent() {
      future = [];
      updateFlags();
    },
    clear() {
      past = [];
      future = [];
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
  mergeKey: input.mergeKey
});
