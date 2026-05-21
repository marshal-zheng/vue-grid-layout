import { deepEqual } from "fast-equals";
import type {
  GridEditorHistorySnapshot,
  GridEditorMetaById,
  GridEditorMetadataPatch,
  GridEditorSectionRow,
  GridEditorSectionRowPatch,
  GridEditorSectionRowState,
  GridEditorTransactionPreview,
  GridEditorTransactionSummary
} from "./types";
import {
  collectAffectedIds,
  collectEditorLayoutPatches
} from "./commands";

const currentLayoutFromSnapshot = (snapshot: GridEditorHistorySnapshot) =>
  snapshot.kind === "layout"
    ? snapshot.layout
    : snapshot.layouts[snapshot.breakpoint] || [];

const summarizeSnapshot = (
  snapshot: GridEditorHistorySnapshot
): GridEditorTransactionSummary => {
  const layout = currentLayoutFromSnapshot(snapshot);
  return {
    layoutSize: layout.length,
    layoutCount: snapshot.kind === "responsive"
      ? Object.keys(snapshot.layouts).length
      : 1,
    metadataCount: Object.keys(snapshot.editorMetaById || {}).length,
    sectionRowCount: Object.keys(snapshot.sectionRows.items || {}).length,
    selectionCount: snapshot.selection.selectedIds.length,
    focusId: snapshot.focusId
  };
};

const diffMetadata = (
  before: GridEditorMetaById,
  after: GridEditorMetaById
): GridEditorMetadataPatch[] => {
  const patches: GridEditorMetadataPatch[] = [];
  const ids = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  ids.forEach(id => {
    const previous = before[id];
    const next = after[id];
    if (!next && previous) {
      patches.push({ type: "remove", id, previous });
      return;
    }
    if (next && !deepEqual(previous, next)) {
      patches.push({ type: "set", id, previous, next });
    }
  });
  return patches;
};

const diffSectionRows = (
  before: GridEditorSectionRowState,
  after: GridEditorSectionRowState
): GridEditorSectionRowPatch[] => {
  const patches: GridEditorSectionRowPatch[] = [];
  const beforeItems = before.items || {};
  const afterItems = after.items || {};
  const ids = new Set([...Object.keys(beforeItems), ...Object.keys(afterItems)]);
  ids.forEach(id => {
    const previous = beforeItems[id] as GridEditorSectionRow | undefined;
    const next = afterItems[id] as GridEditorSectionRow | undefined;
    if (!next && previous) {
      patches.push({ type: "remove", id, previous });
      return;
    }
    if (next && !deepEqual(previous, next)) {
      patches.push({ type: "set", id, previous, next });
    }
  });
  return patches;
};

export const createGridEditorTransactionPreview = (
  before: GridEditorHistorySnapshot,
  after: GridEditorHistorySnapshot,
  input: {
    metadataPatches?: GridEditorMetadataPatch[];
    sectionRowPatches?: GridEditorSectionRowPatch[];
    risk?: GridEditorTransactionPreview["risk"];
  } = {}
): GridEditorTransactionPreview => {
  const layoutPatches = collectEditorLayoutPatches(
    currentLayoutFromSnapshot(before),
    currentLayoutFromSnapshot(after)
  );
  const metadataPatches = input.metadataPatches ||
    diffMetadata(before.editorMetaById, after.editorMetaById);
  const sectionRowPatches = input.sectionRowPatches ||
    diffSectionRows(before.sectionRows, after.sectionRows);
  const affectedIds = collectAffectedIds(layoutPatches, metadataPatches);
  sectionRowPatches.forEach(patch => affectedIds.push(patch.id));
  return {
    layoutPatches,
    metadataPatches,
    sectionRowPatches,
    affectedIds: Array.from(new Set(affectedIds)),
    beforeSummary: summarizeSnapshot(before),
    afterSummary: summarizeSnapshot(after),
    risk: input.risk
  };
};

export type {
  GridEditorHistoryMode,
  GridEditorHistoryPolicy,
  GridEditorSectionRowPatch,
  GridEditorTransaction,
  GridEditorTransactionPreview,
  GridEditorTransactionSummary
} from "./types";
