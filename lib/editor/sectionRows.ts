/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { Layout } from "../utils";
import type {
  GridEditorMessage,
  GridEditorResolvedSectionRowState,
  GridEditorSectionRow,
  GridEditorSectionRowState
} from "./types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const sanitizeSectionRow = (input: GridEditorSectionRow): GridEditorSectionRow | null => {
  if (!input || typeof input.id !== "string" || !input.id) return null;
  if (input.kind !== "section" && input.kind !== "row") return null;
  const order = Number.isFinite(input.order) ? input.order : 0;
  const bounds = input.bounds &&
    Number.isFinite(input.bounds.x) &&
    Number.isFinite(input.bounds.y) &&
    Number.isFinite(input.bounds.w) &&
    Number.isFinite(input.bounds.h) &&
    input.bounds.w > 0 &&
    input.bounds.h > 0
    ? input.bounds
    : undefined;
  const boundsPolicy = input.boundsPolicy === "fixed" ||
    input.boundsPolicy === "content" ||
    input.boundsPolicy === "viewport"
    ? input.boundsPolicy
    : undefined;
  const dropPolicy = input.dropPolicy === "inside" ||
    input.dropPolicy === "between" ||
    input.dropPolicy === "none"
    ? input.dropPolicy
    : undefined;
  const crossScopePolicy = input.crossScopePolicy === "allow" ||
    input.crossScopePolicy === "block" ||
    input.crossScopePolicy === "ask"
    ? input.crossScopePolicy
    : undefined;
  return {
    id: input.id,
    kind: input.kind,
    label: typeof input.label === "string" ? input.label : undefined,
    parentId: typeof input.parentId === "string" ? input.parentId : undefined,
    order,
    bounds,
    boundsPolicy,
    collapsed: input.collapsed === true,
    locked: input.locked === true,
    itemIds: Array.isArray(input.itemIds)
      ? Array.from(new Set(input.itemIds.filter(id => typeof id === "string" && id)))
      : undefined,
    dropPolicy,
    crossScopePolicy,
    allowedDropZones: Array.isArray(input.allowedDropZones)
      ? Array.from(new Set(input.allowedDropZones.filter(zone =>
          zone === "start" || zone === "inside" || zone === "end" || zone === "between"
        )))
      : undefined
  };
};

export const emptyGridEditorSectionRows = (): GridEditorSectionRowState => ({
  version: 1,
  items: {},
  itemMembership: {}
});

export const normalizeGridEditorSectionRows = (
  input: GridEditorSectionRowState | null | undefined,
  layout: Layout = []
): GridEditorResolvedSectionRowState => {
  const layoutIds = new Set(layout.map(item => item.i));
  const shouldValidateLayoutIds = layout.length > 0;
  const warnings: GridEditorMessage[] = [];
  if (!input) {
    return { version: 1, items: {}, itemMembership: {}, warnings };
  }
  if (!isObject(input) || input.version !== 1 || !isObject(input.items)) {
    warnings.push({
      code: "grid-editor.sectionRows.unknown-version",
      level: "warning",
      message: "Unsupported section/row metadata version was ignored.",
      recoverable: true
    });
    return { version: 1, items: {}, itemMembership: {}, warnings };
  }

  const items: Record<string, GridEditorSectionRow> = {};
  Object.keys(input.items).sort().forEach(id => {
    const row = sanitizeSectionRow(input.items[id]);
    if (row) items[row.id] = row;
  });

  const itemMembership: Record<string, { sectionId?: string; rowId?: string }> = {};
  const addMembership = (itemId: string, patch: { sectionId?: string; rowId?: string }) => {
    if (shouldValidateLayoutIds && !layoutIds.has(itemId)) {
      warnings.push({
        code: "grid-editor.sectionRows.orphan-membership",
        level: "warning",
        message: "Section/row membership referenced an item that is not in the layout.",
        itemIds: [itemId],
        recoverable: true
      });
      return;
    }
    itemMembership[itemId] = { ...(itemMembership[itemId] || {}), ...patch };
  };

  Object.keys(input.itemMembership || {}).sort().forEach(itemId => {
    const membership = input.itemMembership?.[itemId] || {};
    addMembership(itemId, {
      sectionId: membership.sectionId && items[membership.sectionId]?.kind === "section"
        ? membership.sectionId
        : undefined,
      rowId: membership.rowId && items[membership.rowId]?.kind === "row"
        ? membership.rowId
        : undefined
    });
  });

  Object.keys(items).sort((a, b) => items[a].order - items[b].order || a.localeCompare(b)).forEach(id => {
    const row = items[id];
    (row.itemIds || []).forEach(itemId => {
      addMembership(itemId, row.kind === "section" ? { sectionId: row.id } : { rowId: row.id });
    });
  });

  return { version: 1, items, itemMembership, warnings };
};
