import type { GridEditorCommandType } from "../editor";
import type {
  DashboardEditorShellActionResult,
  DashboardEditorShellActions,
  DashboardEditorShellMenuContext,
  DashboardEditorShellMenuDescriptor,
  DashboardEditorShellMenuOptions,
  DashboardEditorShellMenuTarget,
  DashboardEditorShellPreparedMenu,
  DashboardEditorShellResolvedPosition
} from "./types";

type MenuBuildInput = {
  id: string;
  target: DashboardEditorShellMenuTarget;
  position?: DashboardEditorShellResolvedPosition;
  explicitPlacementTarget?: boolean;
  context: DashboardEditorShellMenuContext;
  actions: DashboardEditorShellActions;
  options?: DashboardEditorShellMenuOptions;
  customItems?: DashboardEditorShellMenuDescriptor[];
  includeHidden?: boolean;
  referenceAvailable?: boolean;
  paletteAvailable?: boolean;
  readonlyReason?: string;
  diagnostics?: DashboardEditorShellPreparedMenu["diagnostics"];
};

const isEditable = (context: DashboardEditorShellMenuContext): boolean =>
  !context.readonly && (context.mode === "edit" || context.editor?.mode.value === "edit");

const disabledReason = (
  enabled: boolean,
  reason: string | undefined
): string | undefined => enabled ? undefined : reason;

const label = (
  actionId: string,
  fallback: string,
  input: MenuBuildInput
): { label: string; labelKey: string } => ({
  label: input.options?.labelFactory?.(actionId, input.context) || fallback,
  labelKey: `dashboardEditorShell.${actionId}`
});

const shortcut = (
  actionId: keyof NonNullable<DashboardEditorShellMenuOptions["shortcuts"]>,
  input: MenuBuildInput
): string | undefined => input.options?.shortcuts?.[actionId];

const commandEnabled = (
  input: MenuBuildInput,
  commandType: GridEditorCommandType,
  itemIds?: string[]
): boolean => {
  if (!isEditable(input.context)) return false;
  const editor = input.context.editor;
  if (!editor) return false;
  const result = editor.canExecute({
    type: commandType,
    targetIds: itemIds,
    source: "context-menu"
  });
  return result.status !== "blocked" && result.status !== "error";
};

const mergeCustomItems = (
  input: MenuBuildInput,
  base: DashboardEditorShellMenuDescriptor[],
  kind: "dashboard" | "widget"
): DashboardEditorShellMenuDescriptor[] => {
  const configured = kind === "dashboard"
    ? input.options?.customDashboardItems
    : input.options?.customWidgetItems;
  const fromOptions = typeof configured === "function"
    ? configured(input.context)
    : configured || [];
  return base.concat(fromOptions, input.customItems || []);
};

const filterHidden = (
  items: DashboardEditorShellMenuDescriptor[],
  includeHidden?: boolean
): DashboardEditorShellMenuDescriptor[] =>
  includeHidden ? items : items.filter(item => !item.hidden);

const makeAction = (
  run: () => Promise<DashboardEditorShellActionResult> | DashboardEditorShellActionResult
) => run;

export const buildDashboardContextMenu = (
  input: MenuBuildInput
): DashboardEditorShellPreparedMenu => {
  const editable = isEditable(input.context);
  const canPaste = commandEnabled(input, "paste");
  const referenceAvailable = input.referenceAvailable === true;
  const paletteAvailable = input.paletteAvailable === true;
  const hasPlacementTarget = input.explicitPlacementTarget === true;
  const placementIntent = hasPlacementTarget ? "here" : "auto";
  const pasteStrategy = hasPlacementTarget
    ? "cursor"
    : input.options?.defaultPasteStrategy || input.options?.defaultAddStrategy;
  const referencePasteStrategy = hasPlacementTarget
    ? "cursor"
    : input.options?.defaultReferencePasteStrategy;
  const addStrategy = hasPlacementTarget ? "cursor" : input.options?.defaultAddStrategy;
  const readonlyReason = input.readonlyReason || "mode-readonly";
  const target = input.target;
  const items: DashboardEditorShellMenuDescriptor[] = [
    {
      id: "paste",
      type: "item",
      ...label("paste", hasPlacementTarget ? "Paste here" : "Paste", input),
      icon: "clipboard-paste",
      shortcut: shortcut("paste", input),
      enabled: canPaste,
      reason: disabledReason(canPaste, editable ? "clipboard-unavailable" : readonlyReason),
      target,
      metadata: { strategy: pasteStrategy, placementIntent },
      action: makeAction(() => input.actions.pasteWidget(input.position || null, { source: "context-menu", strategy: pasteStrategy, placementIntent }))
    },
    {
      id: "place-clipboard",
      type: "item",
      ...label("place-clipboard", "Place from clipboard", input),
      icon: "crosshair",
      enabled: canPaste,
      reason: disabledReason(canPaste, editable ? "clipboard-unavailable" : readonlyReason),
      target,
      metadata: { strategy: pasteStrategy, placementIntent, placementMode: "interactive" },
      action: makeAction(() => input.actions.placeClipboard(input.position || null, {
        source: "context-menu",
        strategy: pasteStrategy,
        placementIntent,
        placementMode: "interactive"
      }))
    },
    {
      id: "paste-reference",
      type: "item",
      ...label("paste-reference", hasPlacementTarget ? "Paste reference here" : "Paste reference", input),
      icon: "link",
      shortcut: shortcut("paste-reference", input),
      enabled: editable && referenceAvailable,
      reason: disabledReason(editable && referenceAvailable, editable ? "adapter-unavailable" : readonlyReason),
      target,
      metadata: { strategy: referencePasteStrategy, placementIntent },
      action: makeAction(() => input.actions.pasteWidgetReference(input.position || null, { source: "context-menu", strategy: referencePasteStrategy, placementIntent }))
    },
    {
      id: "add-widget",
      type: "item",
      ...label("add-widget", hasPlacementTarget ? "Add widget here" : "Add widget", input),
      icon: "plus",
      enabled: editable,
      reason: disabledReason(editable, readonlyReason),
      target,
      metadata: { strategy: addStrategy, placementIntent },
      action: makeAction(() => input.actions.addWidgetFromTemplate({ w: 2, h: 2 }, input.position || null, { source: "context-menu", strategy: addStrategy, placementIntent }))
    },
    {
      id: "open-palette",
      type: "item",
      ...label("open-palette", hasPlacementTarget ? "Open palette here" : "Open palette", input),
      icon: "layout-grid",
      shortcut: shortcut("open-palette", input),
      enabled: editable && paletteAvailable,
      reason: disabledReason(editable && paletteAvailable, editable ? "adapter-unavailable" : readonlyReason),
      target,
      metadata: { strategy: addStrategy, placementIntent },
      action: makeAction(() => input.actions.openWidgetPalette(input.position || null, { source: "context-menu", strategy: addStrategy, placementIntent }))
    },
    {
      id: "move-all-widgets",
      type: "item",
      ...label("move-all-widgets", "Move all widgets", input),
      icon: "move",
      shortcut: shortcut("move-all", input),
      enabled: editable,
      reason: disabledReason(editable, readonlyReason),
      target,
      metadata: { dx: 0, dy: 1 },
      action: makeAction(() => input.actions.moveAllWidgets(0, 1, { source: "context-menu" }))
    },
    {
      id: "dashboard-settings",
      type: "item",
      ...label("dashboard-settings", "Dashboard settings", input),
      icon: "settings",
      enabled: true,
      target,
      metadata: { hook: true }
    }
  ];
  return {
    id: input.id,
    target,
    position: input.position,
    items: filterHidden(mergeCustomItems(input, items, "dashboard"), input.includeHidden),
    diagnostics: input.diagnostics || []
  };
};

export const buildWidgetContextMenu = (
  input: MenuBuildInput & { itemId: string; hiddenItem?: boolean; lockedItem?: boolean }
): DashboardEditorShellPreparedMenu => {
  const editable = isEditable(input.context);
  const readonlyReason = input.readonlyReason || "mode-readonly";
  const itemIds = [input.itemId];
  const hidden = input.hiddenItem === true;
  const locked = input.lockedItem === true;
  const canSelect = !hidden && Boolean(input.context.editor);
  const canCopy = !hidden && commandEnabled(input, "copy", itemIds);
  const canDuplicate = !hidden && commandEnabled(input, "duplicate", itemIds);
  const canRemove = !hidden && !locked && commandEnabled(input, "delete", itemIds);
  const referenceAvailable = input.referenceAvailable === true;
  const target = input.target;
  const items: DashboardEditorShellMenuDescriptor[] = [
    {
      id: "select",
      type: "item",
      ...label("select", "Select", input),
      icon: "mouse-pointer-2",
      enabled: canSelect,
      reason: disabledReason(canSelect, hidden ? "hidden" : "missing-editor"),
      target,
      action: makeAction(() => input.actions.selectItem(input.itemId, { source: "context-menu" }))
    },
    {
      id: "edit-widget",
      type: "item",
      ...label("edit-widget", "Edit", input),
      icon: "pencil",
      enabled: editable && !locked && !hidden,
      reason: disabledReason(editable && !locked && !hidden, hidden ? "hidden" : locked ? "locked" : readonlyReason),
      target,
      metadata: { hook: true }
    },
    {
      id: "copy-widget",
      type: "item",
      ...label("copy-widget", "Copy widget", input),
      icon: "copy",
      shortcut: shortcut("copy-widget", input),
      enabled: canCopy,
      reason: disabledReason(canCopy, hidden ? "hidden" : readonlyReason),
      target,
      action: makeAction(() => input.actions.copyWidget(input.itemId, { source: "context-menu" }))
    },
    {
      id: "copy-reference",
      type: "item",
      ...label("copy-reference", "Copy reference", input),
      icon: "link",
      shortcut: shortcut("copy-reference", input),
      enabled: !hidden && referenceAvailable,
      reason: disabledReason(!hidden && referenceAvailable, hidden ? "hidden" : "adapter-unavailable"),
      target,
      action: makeAction(() => input.actions.copyWidgetReference(input.itemId, { source: "context-menu" }))
    },
    {
      id: "duplicate",
      type: "item",
      ...label("duplicate", "Duplicate", input),
      icon: "copy-plus",
      shortcut: shortcut("duplicate-widget", input),
      enabled: canDuplicate,
      reason: disabledReason(canDuplicate, hidden ? "hidden" : readonlyReason),
      target,
      action: makeAction(() => input.actions.duplicateWidget(input.itemId, { source: "context-menu" }))
    },
    {
      id: "remove",
      type: "item",
      ...label("remove", "Remove", input),
      icon: "trash-2",
      shortcut: shortcut("remove-widget", input),
      danger: true,
      enabled: canRemove,
      reason: disabledReason(canRemove, hidden ? "hidden" : locked ? "locked" : readonlyReason),
      target,
      action: makeAction(() => input.actions.removeWidget(input.itemId, { source: "context-menu" }))
    },
    {
      id: "replace-reference",
      type: "item",
      ...label("replace-reference", "Replace reference with copy", input),
      icon: "replace",
      enabled: editable && !hidden && referenceAvailable,
      reason: disabledReason(editable && !hidden && referenceAvailable, hidden ? "hidden" : editable ? "adapter-unavailable" : readonlyReason),
      target,
      action: makeAction(() => input.actions.replaceReferenceWithWidgetCopy(input.itemId, { source: "context-menu" }))
    },
    {
      id: "scroll-highlight",
      type: "item",
      ...label("scroll-highlight", "Scroll and highlight", input),
      icon: "scan-search",
      enabled: !hidden,
      reason: disabledReason(!hidden, "hidden"),
      target,
      action: makeAction(async () => {
        const highlight = input.actions.highlightItem(input.itemId, { source: "context-menu" });
        await input.actions.scrollToItem(input.itemId, { source: "context-menu" });
        return highlight;
      })
    }
  ];
  return {
    id: input.id,
    target,
    position: input.position,
    items: filterHidden(mergeCustomItems(input, items, "widget"), input.includeHidden),
    diagnostics: input.diagnostics || []
  };
};
