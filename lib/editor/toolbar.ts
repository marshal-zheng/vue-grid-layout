import type {
  GridEditorCommand,
  GridEditorCommandAvailability,
  GridEditorCommandType,
  GridEditorController,
  GridEditorToolbarState
} from "./types";
import { normalizeGridEditorSectionRows } from "./sectionRows";

const toolbarCommands: GridEditorCommand[] = [
  { type: "select" },
  { type: "clearSelection" },
  { type: "move" },
  { type: "resize" },
  { type: "delete" },
  { type: "duplicate" },
  { type: "copy" },
  { type: "paste", payload: { strategy: "nearest-fit", cols: 12 } },
  { type: "lock" },
  { type: "unlock" },
  { type: "save" },
  { type: "discard" },
  { type: "reset" },
  { type: "undo" },
  { type: "redo" },
  { type: "align", payload: { mode: "left" } },
  { type: "distribute", payload: { mode: "horizontal" } },
  { type: "tidy", payload: { axis: "both" } }
];

const requiredSelectionCount = (type: GridEditorCommandType): number | undefined => {
  if (type === "align") return 2;
  if (type === "distribute" || type === "tidy") return 3;
  return undefined;
};

const availabilityFor = (
  controller: GridEditorController,
  command: GridEditorCommand
): GridEditorCommandAvailability => {
  const result = controller.canExecute({
    source: "toolbar",
    ...command
  });
  return {
    command: command.type,
    enabled: result.status !== "blocked" &&
      result.status !== "cancelled" &&
      result.status !== "timeout" &&
      result.status !== "error",
    reason: result.blocked?.reason,
    requiredSelectionCount: result.blocked?.reason === "selection-count"
      ? requiredSelectionCount(command.type)
      : undefined,
    blockedIds: result.blocked?.itemIds || result.blocked?.skippedIds,
    messageKey: result.blocked?.reason
      ? `grid-editor.toolbar.${command.type}.${result.blocked.reason}`
      : undefined
  };
};

export const deriveGridEditorToolbarState = (
  controller: GridEditorController
): GridEditorToolbarState => {
  const selection = controller.selection.value;
  const metaById = controller.editorMetaById.value;
  const sectionRows = normalizeGridEditorSectionRows(controller.sectionRows.value);
  const selectedIds = selection.selectedIds;
  const sectionRowIds = Array.from(new Set(selectedIds.flatMap(id => {
    const membership = sectionRows.itemMembership[id];
    return [
      membership?.sectionId || null,
      membership?.rowId || null
    ].filter(Boolean) as string[];
  })));
  const fallbackSectionRowId = Object.values(sectionRows.items)
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))[0]?.id;
  const primarySectionRowId = sectionRowIds[0] || fallbackSectionRowId;
  const commands: GridEditorToolbarState["commands"] = {};
  const sectionRowPayload = primarySectionRowId ? { id: primarySectionRowId } : {};
  const commandsToCheck = [
    ...toolbarCommands,
    { type: "section-row-collapse", payload: sectionRowPayload } as GridEditorCommand,
    { type: "section-row-expand", payload: sectionRowPayload } as GridEditorCommand,
    { type: "section-row-move", payload: primarySectionRowId ? { id: primarySectionRowId, dy: 1 } : {} } as GridEditorCommand,
    { type: "section-row-delete", payload: sectionRowPayload } as GridEditorCommand,
    { type: "section-row-reorder", payload: sectionRowPayload } as GridEditorCommand
  ];
  commandsToCheck.forEach(command => {
    commands[command.type] = availabilityFor(controller, command);
  });

  const lockedCount = selectedIds.filter(id => metaById[id]?.locked).length;
  const hiddenCount = selectedIds.filter(id => metaById[id]?.visible === false).length;
  const intelligence = controller.guides.value.diagnostics?.intelligence;

  return {
    commands,
    selectionSummary: {
      count: selectedIds.length,
      movableCount: Math.max(0, selectedIds.length - lockedCount - hiddenCount),
      lockedCount,
      hiddenCount,
      sectionRowIds
    },
    intelligenceSummary: intelligence
      ? {
          equalSpacing: intelligence.codes.includes("grid-editor.distribution.equal"),
          distributionMode: intelligence.distributionMode === "none"
            ? undefined
            : intelligence.distributionMode,
          snapCandidateCount: intelligence.snapCandidateCount,
          degraded: intelligence.degraded,
          reason: intelligence.reason
        }
      : undefined
  };
};
