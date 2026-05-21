import type {
  GridEditorCommand,
  GridEditorCommandSource,
  GridEditorCommandType,
  GridEditorHistoryPolicy,
  GridEditorTransactionPreview
} from "./types";

export type GridEditorCommandAffects = {
  layout?: boolean;
  layouts?: boolean;
  metadata?: boolean;
  sectionRows?: boolean;
  selection?: boolean;
  focus?: boolean;
  persistence?: boolean;
};

export type GridEditorMutualExclusionScope =
  | "layout"
  | "selection"
  | "persistence"
  | "global";

export type GridEditorResolveTargets = (command: GridEditorCommand) => string[];
export type GridEditorValidatePayload = (
  command: GridEditorCommand
) => { ok: true } | { ok: false; message?: string };
export type GridEditorBuildTransaction = (
  command: GridEditorCommand
) => GridEditorTransactionPreview;

export type GridEditorCommandDescriptor = {
  type: GridEditorCommandType;
  labelKey: string;
  shortcuts?: string[];
  defaultSource?: GridEditorCommandSource;
  defaultHistory: GridEditorHistoryPolicy;
  affects: GridEditorCommandAffects;
  risk?: "normal" | "destructive" | "persistence" | "external";
  mutualExclusionScope?: GridEditorMutualExclusionScope;
  resolveTargets?: GridEditorResolveTargets;
  validatePayload?: GridEditorValidatePayload;
  buildTransaction?: GridEditorBuildTransaction;
};

const descriptor = (
  type: GridEditorCommandType,
  input: Omit<GridEditorCommandDescriptor, "type" | "labelKey"> & {
    labelKey?: string;
  }
): GridEditorCommandDescriptor => ({
  type,
  labelKey: input.labelKey || `grid-editor.command.${type}`,
  ...input
});

const layoutHistory: GridEditorHistoryPolicy = { mode: "record" };
const ignoreHistory: GridEditorHistoryPolicy = {
  mode: "ignore",
  preserveRedoStack: true
};

const requireObjectPayload: GridEditorValidatePayload = command => {
  if (!command.payload || typeof command.payload !== "object") {
    return { ok: false, message: `${command.type} requires an object payload.` };
  }
  return { ok: true };
};

export const builtInGridEditorCommandDescriptors: GridEditorCommandDescriptor[] = [
  descriptor("select", {
    defaultSource: "api",
    defaultHistory: ignoreHistory,
    affects: { selection: true, focus: true },
    mutualExclusionScope: "selection"
  }),
  descriptor("clearSelection", {
    defaultSource: "api",
    defaultHistory: ignoreHistory,
    affects: { selection: true, focus: true },
    mutualExclusionScope: "selection"
  }),
  descriptor("move", {
    defaultSource: "api",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true },
    mutualExclusionScope: "layout",
    validatePayload: requireObjectPayload
  }),
  descriptor("resize", {
    defaultSource: "api",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true },
    mutualExclusionScope: "layout",
    validatePayload: requireObjectPayload
  }),
  descriptor("add", {
    defaultSource: "api",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true, metadata: true, selection: true, focus: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("delete", {
    defaultSource: "api",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true, metadata: true, selection: true, focus: true },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  descriptor("duplicate", {
    defaultSource: "api",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true, metadata: true, selection: true, focus: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("copy", {
    defaultSource: "api",
    defaultHistory: ignoreHistory,
    affects: {},
    mutualExclusionScope: "selection"
  }),
  descriptor("paste", {
    defaultSource: "api",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true, metadata: true, selection: true, focus: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("align", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true },
    mutualExclusionScope: "layout",
    validatePayload: requireObjectPayload
  }),
  descriptor("distribute", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true },
    mutualExclusionScope: "layout",
    validatePayload: requireObjectPayload
  }),
  descriptor("tidy", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("lock", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { metadata: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("unlock", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { metadata: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("show", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { metadata: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("hide", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { metadata: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("save", {
    defaultSource: "toolbar",
    defaultHistory: ignoreHistory,
    affects: { persistence: true },
    risk: "persistence",
    mutualExclusionScope: "persistence",
    shortcuts: ["Mod+S"]
  }),
  descriptor("discard", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "replace" },
    affects: { layout: true, layouts: true, metadata: true, sectionRows: true, persistence: true },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  descriptor("reset", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "clear" },
    affects: { layout: true, layouts: true, metadata: true, sectionRows: true, persistence: true },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  descriptor("undo", {
    defaultSource: "keyboard",
    defaultHistory: ignoreHistory,
    affects: { layout: true, layouts: true, metadata: true, sectionRows: true, selection: true, focus: true },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Z"]
  }),
  descriptor("redo", {
    defaultSource: "keyboard",
    defaultHistory: ignoreHistory,
    affects: { layout: true, layouts: true, metadata: true, sectionRows: true, selection: true, focus: true },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Shift+Z"]
  }),
  descriptor("section-row-collapse", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { sectionRows: true, selection: true, focus: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("section-row-expand", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { sectionRows: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("section-row-move", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true, sectionRows: true },
    mutualExclusionScope: "layout"
  }),
  descriptor("section-row-delete", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { layout: true, layouts: true, metadata: true, sectionRows: true, selection: true, focus: true },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  descriptor("section-row-reorder", {
    defaultSource: "toolbar",
    defaultHistory: layoutHistory,
    affects: { sectionRows: true },
    mutualExclusionScope: "layout"
  })
];

const builtInDescriptorMap = new Map<GridEditorCommandType, GridEditorCommandDescriptor>(
  builtInGridEditorCommandDescriptors.map(item => [item.type, item])
);

export const getGridEditorCommandDescriptor = (
  type: GridEditorCommandType
): GridEditorCommandDescriptor | undefined => builtInDescriptorMap.get(type);

export const getGridEditorCommandDescriptors = (): GridEditorCommandDescriptor[] =>
  builtInGridEditorCommandDescriptors.slice();

export const requireGridEditorCommandDescriptor = (
  type: GridEditorCommandType
): GridEditorCommandDescriptor => {
  const found = getGridEditorCommandDescriptor(type);
  if (found) return found;
  return descriptor(type, {
    defaultSource: "api",
    defaultHistory: ignoreHistory,
    affects: {},
    mutualExclusionScope: "global"
  });
};
