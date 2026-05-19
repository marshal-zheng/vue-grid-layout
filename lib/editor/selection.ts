import type { Layout, LayoutItem } from "../utils";
import type {
  GridEditorA11yItemDescription,
  GridEditorCommandType,
  GridEditorMetaById,
  GridEditorResolvedCapability,
  GridEditorSelectionSource,
  GridEditorSelectionState
} from "./types";
import { resolveEditorCapabilities, resolveEditorItemCapability } from "./metadata";

export type GridEditorSelectionIntent = {
  id?: string | null;
  ids?: string[];
  toggle?: boolean;
  range?: boolean;
  source?: GridEditorSelectionSource;
};

export const createGridEditorSelection = (
  selectedIds: string[] = [],
  source: GridEditorSelectionSource = "api"
): GridEditorSelectionState => {
  const unique = Array.from(new Set(selectedIds.filter(Boolean)));
  return {
    selectedIds: unique,
    activeId: unique.length > 0 ? unique[unique.length - 1] : null,
    anchorId: unique.length > 0 ? unique[0] : null,
    mode: unique.length > 1 ? "multiple" : "single",
    source
  };
};

export const normalizeSelection = (
  selection: GridEditorSelectionState
): GridEditorSelectionState => {
  const selectedIds = Array.from(new Set(selection.selectedIds.filter(Boolean)));
  const activeId = selection.activeId && selectedIds.includes(selection.activeId)
    ? selection.activeId
    : selectedIds[selectedIds.length - 1] || null;
  const anchorId = selection.anchorId && selectedIds.includes(selection.anchorId)
    ? selection.anchorId
    : selectedIds[0] || null;
  return {
    ...selection,
    selectedIds,
    activeId,
    anchorId,
    mode: selectedIds.length > 1 ? "multiple" : "single"
  };
};

export const getLayoutIds = (layout: Layout): string[] => layout.map(item => item.i);

const canJoinMultiSelection = (
  item: LayoutItem,
  metaById: GridEditorMetaById
): boolean => resolveEditorItemCapability(item, metaById[item.i]).editable;

const sanitizeMultiSelectionIds = (
  selectedIds: string[],
  activeId: string | null,
  itemsById: Map<string, LayoutItem>,
  metaById: GridEditorMetaById
): string[] => {
  if (selectedIds.length <= 1) return selectedIds;

  const multiSelectableIds = selectedIds.filter(id => {
    const item = itemsById.get(id);
    return item ? canJoinMultiSelection(item, metaById) : false;
  });
  if (multiSelectableIds.length > 0) return multiSelectableIds;

  const fallbackId = activeId && selectedIds.includes(activeId)
    ? activeId
    : selectedIds[selectedIds.length - 1];
  return fallbackId ? [fallbackId] : [];
};

export const sanitizeSelectionForLayout = (
  selection: GridEditorSelectionState,
  layout: Layout,
  metaById: GridEditorMetaById = {},
  source: GridEditorSelectionSource = selection.source
): GridEditorSelectionState => {
  const visibleItems = layout.filter(item => metaById[item.i]?.visible !== false);
  const itemsById = new Map(visibleItems.map(item => [item.i, item]));
  const selectedIds = sanitizeMultiSelectionIds(
    selection.selectedIds.filter(id => itemsById.has(id)),
    selection.activeId,
    itemsById,
    metaById
  );
  return normalizeSelection({
    ...selection,
    selectedIds,
    source
  });
};

export const selectEditorIds = (
  current: GridEditorSelectionState,
  ids: string[],
  source: GridEditorSelectionSource = "api"
): GridEditorSelectionState => createGridEditorSelection(ids, source);

export const clearEditorSelection = (
  source: GridEditorSelectionSource = "api"
): GridEditorSelectionState => createGridEditorSelection([], source);

export const updateSelectionByIntent = (
  layout: Layout,
  current: GridEditorSelectionState,
  intent: GridEditorSelectionIntent
): GridEditorSelectionState => {
  const source = intent.source || "api";
  if (intent.ids) return selectEditorIds(current, intent.ids, source);
  if (!intent.id) return clearEditorSelection(source);

  const ids = getLayoutIds(layout);
  if (!ids.includes(intent.id)) return current;

  if (intent.range && current.anchorId) {
    const anchorIndex = ids.indexOf(current.anchorId);
    const nextIndex = ids.indexOf(intent.id);
    if (anchorIndex >= 0 && nextIndex >= 0) {
      const start = Math.min(anchorIndex, nextIndex);
      const end = Math.max(anchorIndex, nextIndex);
      return createGridEditorSelection(ids.slice(start, end + 1), source);
    }
  }

  if (intent.toggle) {
    const selected = new Set(current.selectedIds);
    if (selected.has(intent.id)) selected.delete(intent.id);
    else selected.add(intent.id);
    return createGridEditorSelection(Array.from(selected), source);
  }

  return createGridEditorSelection([intent.id], source);
};

export const getNextFocusableId = (
  layout: Layout,
  removedOrHiddenIds: string[],
  metaById: GridEditorMetaById = {}
): string | null => {
  const removed = new Set(removedOrHiddenIds);
  const visible = layout.filter(item => !removed.has(item.i) && metaById[item.i]?.visible !== false);
  return visible.length > 0 ? visible[0].i : null;
};

export const describeEditorA11yItems = (
  layout: Layout,
  metaById: GridEditorMetaById,
  selection: GridEditorSelectionState,
  capabilities?: Record<string, GridEditorResolvedCapability>
): GridEditorA11yItemDescription[] => {
  const resolved = capabilities || resolveEditorCapabilities(layout, metaById);
  const selected = new Set(selection.selectedIds);
  return layout.map(item => {
    const capability = resolved[item.i];
    const commands: GridEditorCommandType[] = ["select", "copy"];
    if (capability?.draggable) commands.push("move");
    if (capability?.resizable) commands.push("resize");
    if (capability?.deletable) commands.push("delete");
    if (capability?.duplicatable) commands.push("duplicate");
    if (capability?.locked) commands.push("unlock");
    else commands.push("lock");
    if (capability?.visible === false) commands.push("show");
    else commands.push("hide");

    return {
      id: item.i,
      label: metaById[item.i]?.label || item.i,
      position: { x: item.x, y: item.y, w: item.w, h: item.h },
      locked: Boolean(capability?.locked),
      selected: selected.has(item.i),
      commands
    };
  });
};
