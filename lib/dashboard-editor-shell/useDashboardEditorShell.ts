import {
  getCurrentInstance,
  onBeforeUnmount,
  readonly,
  ref,
  unref,
  watch,
  type Ref,
  type WatchStopHandle
} from "vue";
import { writeDashboardResponsiveRuntimeToDocument } from "../dashboard-responsive";
import type { DashboardResponsiveRuntime } from "../dashboard-responsive";
import { translateDashboardLayout } from "../dashboard-migration";
import { createGridEditorCommandResult } from "../editor";
import type {
  GridEditorBlockedReason,
  GridEditorCommand,
  GridEditorCommandResult,
  GridEditorCommandSource,
  GridEditorController,
  GridEditorEvent,
  GridEditorHistorySnapshot,
  GridEditorPlacementSession,
  GridEditorRollbackCheckpoint
} from "../editor";
import type { GridEditorPlacementSummary } from "../editor/placement";
import type { Layout } from "../utils";
import type { DashboardLayoutDocument, DashboardWriteResult } from "../dashboard";
import { buildDashboardContextMenu, buildWidgetContextMenu } from "./menus";
import { getEventGridPosition as getEventGridPositionHelper, resolveShellPosition } from "./position";
import {
  createDashboardEditorShellActionId,
  createDashboardEditorShellDiagnostic,
  createDashboardEditorShellResult,
  emitShellResult,
  profileContextFromRuntime,
  runDashboardEditorShellTransaction,
  stableDiagnostics
} from "./transactions";
import type {
  DashboardEditorShell,
  DashboardEditorShellActionOptions,
  DashboardEditorShellActionResult,
  DashboardEditorShellActionSource,
  DashboardEditorShellActionStatus,
  DashboardEditorShellActionType,
  DashboardEditorShellActions,
  DashboardEditorShellAddWidgetOptions,
  DashboardEditorShellAdapterContext,
  DashboardEditorShellAdapterResult,
  DashboardEditorShellCommitContext,
  DashboardEditorShellCommitPlacementOptions,
  DashboardEditorShellAvailability,
  DashboardEditorShellBlockedReason,
  DashboardEditorShellDiagnostic,
  DashboardEditorShellDocumentChangeEvent,
  DashboardEditorShellDropPayload,
  DashboardEditorShellEmptyAddState,
  DashboardEditorShellEvent,
  DashboardEditorShellHighlightOptions,
  DashboardEditorShellKeyboardOptions,
  DashboardEditorShellKeyboardShortcut,
  DashboardEditorShellMenuDescriptor,
  DashboardEditorShellMenuRequest,
  DashboardEditorShellMoveAllOptions,
  DashboardEditorShellOptions,
  DashboardEditorShellPaletteOptions,
  DashboardEditorShellPasteOptions,
  DashboardEditorShellPlacementIntent,
  DashboardEditorShellPlacementOptions,
  DashboardEditorShellPlacementStrategy,
  DashboardEditorShellPositionInput,
  DashboardEditorShellPositionRequest,
  DashboardEditorShellPositionResult,
  DashboardEditorShellPreparedMutation,
  DashboardEditorShellRemoveOptions,
  DashboardEditorShellResolvedPosition,
  DashboardEditorShellRollbackContext,
  DashboardEditorShellScrollOptions,
  DashboardEditorShellState,
  DashboardEditorShellWidgetTemplate
} from "./types";

const cloneLayout = (layout: Layout): Layout => layout.map(item => ({ ...item }));

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isRefLike = <T>(value: unknown): value is Ref<T> =>
  Boolean(value && typeof value === "object" && "value" in value);

const toArray = (value?: string | string[] | null): string[] =>
  Array.isArray(value)
    ? value.filter(Boolean)
    : value
      ? [value]
      : [];

type PendingPlacementShellCommit = {
  actionId: string;
  actionType: DashboardEditorShellActionType;
  source: DashboardEditorShellActionSource;
  itemIds: string[];
  position?: DashboardEditorShellResolvedPosition;
  baseLayout: Layout;
  rollbackCheckpoint?: GridEditorRollbackCheckpoint;
  contextExtra?: Partial<DashboardEditorShellAdapterContext>;
  data?: unknown;
  prepare?: (ctx: DashboardEditorShellAdapterContext) => Promise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined> | DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined;
  commit?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => Promise<DashboardEditorShellAdapterResult | void> | DashboardEditorShellAdapterResult | void;
  rollback?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => Promise<DashboardEditorShellAdapterResult | void> | DashboardEditorShellAdapterResult | void;
};

type PendingClipboardPasteIntent = {
  mode: "interactive";
  reason: "cut-widget";
  sourceActionId: string;
  itemIds: string[];
};

const toEditorSource = (
  source: DashboardEditorShellActionSource | undefined
): GridEditorCommandSource => {
  if (source === "context-menu") return "context-menu";
  if (source === "keyboard") return "keyboard";
  if (source === "toolbar") return "toolbar";
  if (source === "pointer") return "pointer";
  return "api";
};

const fromEditorSource = (
  source: GridEditorCommandSource | undefined
): DashboardEditorShellActionSource => {
  if (source === "context-menu") return "context-menu";
  if (source === "keyboard") return "keyboard";
  if (source === "toolbar") return "toolbar";
  if (source === "pointer") return "pointer";
  if (source === "drop") return "drop";
  return "api";
};

const syntheticActionTypeForCommand = (
  command: GridEditorCommand
): DashboardEditorShellActionType | null => {
  if (command.type === "move") return "pointer-move";
  if (command.type === "resize") return "pointer-resize";
  if (command.type === "add" || command.type === "paste") return "external-drop";
  return null;
};

const normalizePlacementStrategy = (
  options: DashboardEditorShellPlacementOptions,
  fallback: DashboardEditorShellPlacementStrategy
): DashboardEditorShellPlacementStrategy => options.strategy || fallback;

const isSyntheticPlacementStrategy = (
  strategy?: DashboardEditorShellPlacementStrategy
): boolean => strategy === "first-fit" || strategy === "insert-top-shift";

const hasExplicitPlacementTarget = (
  target: Event | DashboardEditorShellPositionInput | null | undefined
): boolean => {
  if (!target) return false;
  if (typeof Event !== "undefined" && target instanceof Event) return true;
  return typeof target === "object" && ("x" in target || "y" in target);
};

const normalizePlacementIntent = (
  target: Event | DashboardEditorShellPositionInput | null | undefined,
  options: DashboardEditorShellPlacementOptions
): DashboardEditorShellPlacementIntent =>
  options.placementIntent || (hasExplicitPlacementTarget(target) ? "here" : "auto");

const placementCollisionOptions = (
  options: DashboardEditorShellPlacementOptions
) => ({
  collisionPolicy: options.collisionPolicy,
  compactType: options.compactType,
  allowOverlap: options.allowOverlap,
  preventCollision: options.preventCollision
});

const hasEventCoordinates = (
  event?: Event | null
): boolean => {
  if (!event) return false;
  const pointer = event as MouseEvent | PointerEvent | DragEvent;
  if (isFiniteNumber(pointer.clientX) && isFiniteNumber(pointer.clientY)) return true;
  const touchEvent = event as TouchEvent;
  const touch = touchEvent.touches?.[0] || touchEvent.changedTouches?.[0];
  return Boolean(touch && isFiniteNumber(touch.clientX) && isFiniteNumber(touch.clientY));
};

const validatePreparedNewIds = (
  prepared: DashboardEditorShellPreparedMutation | null,
  layout: Layout,
  actionId: string,
  actionType: DashboardEditorShellActionType,
  source: DashboardEditorShellActionSource
): DashboardEditorShellDiagnostic[] => {
  const ids = prepared?.newIds || [];
  if (!ids.length) return [];
  const existingIds = new Set(layout.map(item => item.i));
  const seen = new Set<string>();
  const invalidIds: string[] = [];
  const duplicateIds: string[] = [];
  ids.forEach(id => {
    if (typeof id !== "string" || id.trim().length === 0) {
      invalidIds.push(String(id));
      return;
    }
    if (seen.has(id) || existingIds.has(id)) duplicateIds.push(id);
    seen.add(id);
  });
  if (!invalidIds.length && !duplicateIds.length) return [];
  return [createDashboardEditorShellDiagnostic(
    "shell-adapter-invalid-new-ids",
    "error",
    "Adapter prepare returned invalid or duplicate new widget ids.",
    {
      actionId,
      actionType,
      source,
      reason: "adapter-rejected",
      itemIds: duplicateIds.concat(invalidIds),
      details: {
        duplicateIds,
        invalidIds
      },
      recoverable: true
    }
  )];
};

const defaultState = (): DashboardEditorShellState => ({
  ready: false,
  degraded: true,
  runtime: null,
  layoutId: null,
  requestedBreakpoint: null,
  resolvedProfileId: null,
  targetView: null,
  viewFormat: null,
  gridSettings: null,
  heightRuntime: null,
  activeItemIds: [],
  renderItemIds: [],
  hiddenItemIds: [],
  mode: null,
  selection: null,
  dirty: false,
  conflict: null,
  lastResult: null,
  toolbar: null,
  lastPointerPosition: null,
  lastMenuPosition: null,
  menu: null,
  highlightedId: null,
  emptyAdd: {
    enabled: false,
    reason: "missing-runtime",
    target: {
      layoutId: null,
      requestedBreakpoint: null,
      resolvedProfileId: null,
      targetView: null,
      viewFormat: null
    },
    descriptors: []
  },
  diagnostics: []
});

const noCommandResult = (
  actionId: string,
  commandType: GridEditorCommand["type"],
  reason: string,
  itemIds: string[] = []
): GridEditorCommandResult =>
  createGridEditorCommandResult({ id: actionId, type: commandType }, "blocked", {
    targetIds: itemIds,
    blocked: {
      reason: reason as GridEditorBlockedReason,
      itemIds,
      message: `Command was blocked by dashboard editor shell: ${reason}.`
    }
  });

const applyCommandResultToLayout = (
  runtime: DashboardResponsiveRuntime,
  result: GridEditorCommandResult
): Layout => {
  const operationLayout = result.diagnostics?.operationResult?.layout;
  if (operationLayout) return cloneLayout(operationLayout);
  let next = cloneLayout(runtime.layout);
  result.layoutPatches.forEach(patch => {
    if (patch.type === "add") {
      next.push({ ...patch.item });
      return;
    }
    if (patch.type === "remove") {
      next = next.filter(item => item.i !== patch.id);
      return;
    }
    if (patch.type === "move") {
      next = next.map(item => item.i === patch.id
        ? { ...item, x: patch.to.x, y: patch.to.y }
        : item);
      return;
    }
    if (patch.type === "resize") {
      next = next.map(item => item.i === patch.id
        ? { ...item, x: patch.to.x, y: patch.to.y, w: patch.to.w, h: patch.to.h }
        : item);
    }
  });
  return next;
};

const cssEscape = (value: string): string =>
  typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replace(/["\\]/g, "\\$&");

const isElementLike = (target: unknown): target is {
  tagName?: string;
  isContentEditable?: boolean;
  matches?: (selector: string) => boolean;
} => Boolean(target && typeof target === "object");

const shouldIgnoreKeyboardEvent = (
  event: KeyboardEvent,
  options: DashboardEditorShellKeyboardOptions = {}
): boolean => {
  if (event.defaultPrevented) return true;
  const target = event.target;
  if (!isElementLike(target)) return false;
  const tagName = target.tagName?.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return true;
  if (target.isContentEditable) return true;
  return (options.ignoredTargets || []).some(ignored => {
    if (typeof ignored === "string") {
      return typeof target.matches === "function" && target.matches(ignored);
    }
    return ignored(target);
  });
};

const resolveKeyboardPlatform = (
  platform: DashboardEditorShellKeyboardOptions["platform"] = "auto"
): "mac" | "standard" => {
  if (platform === "mac" || platform === "standard") return platform;
  return typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    ? "mac"
    : "standard";
};

const defaultKeyboardShortcuts: DashboardEditorShellKeyboardShortcut[] = [
  { key: "c", primary: true, action: "copy-widget", source: "keyboard" },
  { key: "r", primary: true, action: "copy-reference", source: "keyboard" },
  { key: "v", primary: true, action: "paste-widget", source: "keyboard" },
  { key: "i", primary: true, action: "paste-reference", source: "keyboard" },
  { key: "v", primary: true, shift: true, action: "paste-reference", source: "keyboard" },
  { key: "Enter", primary: true, action: "place-clipboard", source: "keyboard" },
  { key: "Enter", ctrl: true, action: "place-clipboard", source: "keyboard" },
  { key: "x", primary: true, action: "cut-widget", source: "keyboard" },
  { key: "Delete", action: "remove-widget", source: "keyboard" },
  { key: "Backspace", action: "remove-widget", source: "keyboard" },
  { key: "z", primary: true, action: "undo", source: "keyboard" },
  { key: "z", primary: true, shift: true, action: "redo", source: "keyboard" },
  { key: "y", primary: true, action: "redo", source: "keyboard" },
  { key: "p", primary: true, action: "open-palette", source: "keyboard" },
  { key: "F10", shift: true, action: "prepare-dashboard-menu", source: "keyboard" },
  { key: "m", primary: true, shift: true, action: "move-all", source: "keyboard" }
];

const shortcutMatches = (
  event: KeyboardEvent,
  shortcut: DashboardEditorShellKeyboardShortcut,
  platform: "mac" | "standard"
): boolean => {
  const primaryKey = platform === "mac" ? event.metaKey : event.ctrlKey;
  const secondaryKey = platform === "mac" ? event.ctrlKey : event.metaKey;
  const wantsPrimary = shortcut.primary === true;
  const usesExplicitSystemModifiers = typeof shortcut.ctrl === "boolean" || typeof shortcut.meta === "boolean";
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;
  if (usesExplicitSystemModifiers) {
    if ((shortcut.ctrl || false) !== event.ctrlKey) return false;
    if ((shortcut.meta || false) !== event.metaKey) return false;
  } else {
    if (wantsPrimary !== primaryKey) return false;
    if (wantsPrimary && secondaryKey) return false;
    if (!wantsPrimary && (event.ctrlKey || event.metaKey)) return false;
  }
  if ((shortcut.shift || false) !== event.shiftKey) return false;
  if ((shortcut.alt || false) !== event.altKey) return false;
  return true;
};

const resolveKeyboardPlacementOptions = (
  keyboardOptions: DashboardEditorShellKeyboardOptions,
  shortcut: DashboardEditorShellKeyboardShortcut,
  defaults: DashboardEditorShellPlacementOptions,
  source: DashboardEditorShellActionSource
): DashboardEditorShellPlacementOptions => {
  const rawOptions = shortcut.placementOptions || keyboardOptions.placementOptions;
  const resolvedOptions = typeof rawOptions === "function" ? rawOptions() : rawOptions;
  return {
    ...defaults,
    ...(resolvedOptions || {}),
    source
  };
};

export function useDashboardEditorShell(
  options: DashboardEditorShellOptions = {}
): DashboardEditorShell {
  const internalDocument = ref<DashboardLayoutDocument | null>(unref(options.document) || null);
  const state = ref<DashboardEditorShellState>(defaultState());
  const stopHandles: WatchStopHandle[] = [];
  const cleanupHandles: Array<() => void> = [];
  let stopped = false;
  let highlightTimer: ReturnType<typeof setTimeout> | null = null;
  let mutationQueue: Promise<void> = Promise.resolve();
  let pendingClipboardPasteIntent: PendingClipboardPasteIntent | null = null;
  const pendingPlacementCommits = new Map<string, PendingPlacementShellCommit>();
  const placementCommitFinalizations = new Map<string, Promise<DashboardEditorShellActionResult | null>>();
  const processedCommandIds = new Set<string>();
  const processedCommandRevisions = new Set<string>();
  const pendingShellCommandIds = new Set<string>();
  const commandRollbackCheckpoints = new Map<string, GridEditorRollbackCheckpoint>();

  const controlled = options.controlled !== false;
  const shellManagedWriteBack = () => options.documentWriteBack === "shell";

  const commandRevisionKey = (
    commandId: string,
    checkpoint?: GridEditorRollbackCheckpoint | null
  ): string => `${commandId}:${checkpoint?.revision ?? "unknown"}`;

  const enqueueMutation = <T>(
    run: () => Promise<T>
  ): Promise<T> => {
    const queued = mutationQueue.catch(() => undefined).then(run);
    mutationQueue = queued.then(() => undefined, () => undefined);
    return queued;
  };

  const clearPendingClipboardPasteIntent = () => {
    pendingClipboardPasteIntent = null;
  };

  const markCutClipboardPasteIntent = (
    actionId: string,
    itemIds: string[]
  ) => {
    pendingClipboardPasteIntent = {
      mode: "interactive",
      reason: "cut-widget",
      sourceActionId: actionId,
      itemIds: itemIds.slice()
    };
  };

  const consumePendingClipboardPasteIntent = () => {
    const intent = pendingClipboardPasteIntent;
    pendingClipboardPasteIntent = null;
    return intent;
  };

  const emit = (event: DashboardEditorShellEvent) => {
    options.onEvent?.(event);
  };

  const getRuntime = (): DashboardResponsiveRuntime | null =>
    options.model?.state.value || unref(options.runtime) || null;

  const getEditor = (): GridEditorController | null =>
    options.editor || options.model?.editorController || null;

  const getGridElement = (): HTMLElement | null =>
    unref(options.gridElement) || null;

  const getDocument = (): DashboardLayoutDocument | null =>
    unref(options.document) || internalDocument.value || null;

  const profileContext = () => profileContextFromRuntime(getRuntime());

  const runtimeDiagnostics = (
    actionId?: string,
    actionType?: DashboardEditorShellActionType
  ): DashboardEditorShellDiagnostic[] => {
    const runtime = getRuntime();
    const diagnostics: DashboardEditorShellDiagnostic[] = [];
    if (!runtime) {
      diagnostics.push(createDashboardEditorShellDiagnostic(
        "shell-missing-runtime",
        "warning",
        "Dashboard responsive runtime is not available.",
        { actionId, actionType, reason: "missing-runtime", recoverable: true }
      ));
    }
    if (!getEditor()) {
      diagnostics.push(createDashboardEditorShellDiagnostic(
        "shell-missing-editor",
        "warning",
        "Grid editor controller is not available.",
        { actionId, actionType, reason: "missing-editor", recoverable: true }
      ));
    }
    (runtime?.diagnostics || []).forEach(diagnostic => {
      diagnostics.push(createDashboardEditorShellDiagnostic(
        diagnostic.code,
        diagnostic.level,
        diagnostic.message,
        {
          actionId,
          actionType,
          itemId: diagnostic.itemId,
          layoutId: diagnostic.layoutId,
          path: diagnostic.path,
          resolvedProfileId: diagnostic.profileId || runtime?.resolvedProfileId || null,
          targetView: diagnostic.targetView || runtime?.targetView || null,
          details: diagnostic.details
        }
      ));
    });
    return diagnostics;
  };

  const makeEmptyAddState = (
    runtime: DashboardResponsiveRuntime | null,
    editor: GridEditorController | null
  ): DashboardEditorShellEmptyAddState => {
    const editable = (unref(options.mode) || runtime?.mode || editor?.mode.value) === "edit";
    const empty = (runtime?.renderItemIds || runtime?.activeItemIds || []).length === 0;
    const enabled = Boolean(runtime && editable && empty);
    const target = {
      layoutId: runtime?.layoutId || null,
      requestedBreakpoint: runtime?.requestedBreakpoint || null,
      resolvedProfileId: runtime?.resolvedProfileId || null,
      targetView: runtime?.targetView || null,
      viewFormat: runtime?.viewFormat || null
    };
    const descriptors: DashboardEditorShellMenuDescriptor[] = enabled && actions
      ? [
          {
            id: "open-palette",
            labelKey: "dashboardEditorShell.open-palette",
            icon: "layout-grid",
            enabled: true,
            target: { type: "dashboard" },
            metadata: { strategy: options.menu?.defaultAddStrategy },
            action: () => actions.openWidgetPalette(null, { source: "api", strategy: options.menu?.defaultAddStrategy })
          },
          {
            id: "add-widget",
            labelKey: "dashboardEditorShell.add-widget",
            icon: "plus",
            enabled: true,
            target: { type: "dashboard" },
            metadata: { strategy: options.menu?.defaultAddStrategy },
            action: () => actions.addWidgetFromTemplate({ w: 2, h: 2 }, null, { source: "api", strategy: options.menu?.defaultAddStrategy })
          }
        ]
      : [];
    return {
      enabled,
      reason: enabled ? undefined : runtime ? (editable ? "not-empty" : "mode-readonly") : "missing-runtime",
      target,
      descriptors
    };
  };

  const refreshState = () => {
    const runtime = getRuntime();
    const editor = getEditor();
    const diagnostics = runtimeDiagnostics();
    const degraded = !runtime || !editor || !getGridElement();
    state.value = {
      ...state.value,
      ready: Boolean(runtime && editor),
      degraded,
      runtime,
      layoutId: runtime?.layoutId || null,
      requestedBreakpoint: runtime?.requestedBreakpoint || null,
      resolvedProfileId: runtime?.resolvedProfileId || null,
      targetView: runtime?.targetView || null,
      viewFormat: runtime?.viewFormat || null,
      gridSettings: runtime?.gridSettings || null,
      heightRuntime: runtime?.heightRuntime || null,
      activeItemIds: runtime?.activeItemIds.slice() || [],
      renderItemIds: runtime?.renderItemIds.slice() || [],
      hiddenItemIds: runtime?.hiddenItemIds.slice() || [],
      mode: unref(options.mode) || runtime?.mode || editor?.mode.value || null,
      selection: editor?.selection.value || null,
      dirty: editor?.dirty.value || false,
      conflict: editor?.conflict.value || null,
      lastResult: editor?.lastResult.value || null,
      toolbar: editor?.getToolbarState() || null,
      emptyAdd: makeEmptyAddState(runtime, editor),
      diagnostics: stableDiagnostics(diagnostics)
    };
  };

  const emitDocumentChange = (
    actionId: string,
    document: DashboardLayoutDocument,
    runtime: DashboardResponsiveRuntime | null
  ) => {
    const event: DashboardEditorShellDocumentChangeEvent = {
      type: "documentChange",
      actionId,
      document,
      runtime,
      controlled,
      persist: false
    };
    options.onDocumentChange?.(event);
    emit({ type: "documentChange", event });
  };

  const maybeUpdateInternalDocument = (
    document: DashboardLayoutDocument
  ) => {
    if (!controlled) {
      internalDocument.value = document;
      if (isRefLike<DashboardLayoutDocument | null | undefined>(options.document)) {
        options.document.value = document;
      }
    }
  };

  const writeBackLayout = (
    actionId: string,
    layout: Layout,
    writeItemIds?: string[],
    writeOptions: { removeMissingItems?: boolean } = {}
  ): {
    writeResult?: DashboardWriteResult;
    proposedDocument?: DashboardLayoutDocument;
    diagnostics: DashboardEditorShellDiagnostic[];
  } => {
    const runtime = getRuntime();
    const document = getDocument();
    const editor = getEditor();
    const diagnostics: DashboardEditorShellDiagnostic[] = [];
    if (!runtime || !document) {
      diagnostics.push(createDashboardEditorShellDiagnostic(
        "shell-write-back-skipped",
        "info",
        "Dashboard document or runtime is unavailable; action result is returned without proposed document.",
        { actionId, reason: runtime ? "profile-write-back" : "missing-runtime", recoverable: true }
      ));
      return { diagnostics };
    }
    const written = writeDashboardResponsiveRuntimeToDocument(
      document,
      runtime,
      layout,
      {
        createMissingProfileOnEdit: options.createMissingProfileOnEdit,
        createMissingItems: true,
        removeMissingItems: writeOptions.removeMissingItems,
        editorMetaById: editor?.editorMetaById.value,
        sectionRows: editor?.sectionRows.value,
        writeItemIds
      }
    );
    diagnostics.push(...written.diagnostics.map(diagnostic =>
      createDashboardEditorShellDiagnostic(
        diagnostic.code,
        diagnostic.level,
        diagnostic.message,
        {
          actionId,
          itemId: diagnostic.itemId,
          layoutId: diagnostic.layoutId || runtime.layoutId,
          path: diagnostic.path,
          resolvedProfileId: diagnostic.profileId || runtime.resolvedProfileId,
          targetView: diagnostic.targetView || runtime.targetView,
          details: diagnostic.details
        }
      )
    ));
    if (written.ok) return { writeResult: written, proposedDocument: written.document, diagnostics };
    diagnostics.push(createDashboardEditorShellDiagnostic(
      "shell-profile-write-back-blocked",
      "error",
      written.error.message,
      { actionId, reason: "profile-write-back", recoverable: true, path: written.error.path }
    ));
    return { writeResult: written, proposedDocument: written.document, diagnostics };
  };

  const actionContext = (
    actionId: string,
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource,
    itemIds: string[],
    position?: DashboardEditorShellResolvedPosition,
    extra: Partial<DashboardEditorShellAdapterContext> = {}
  ): DashboardEditorShellAdapterContext => ({
    actionId,
    actionType,
    source,
    itemIds,
    runtime: getRuntime(),
    document: getDocument(),
    position,
    diagnostics: runtimeDiagnostics(actionId, actionType),
    ...extra
  });

  const runGuards = async (
    ctx: DashboardEditorShellAdapterContext
  ): Promise<DashboardEditorShellAdapterResult | null> => {
    for (const guard of options.guards || []) {
      const result = await guard(ctx);
      if (result === false) {
        return {
          ok: false,
          status: "blocked",
          reason: "guard-blocked",
          diagnostics: [createDashboardEditorShellDiagnostic(
            "shell-guard-blocked",
            "warning",
            "Shell action was blocked by a caller guard.",
            { actionId: ctx.actionId, actionType: ctx.actionType, source: ctx.source, reason: "guard-blocked", recoverable: true }
          )]
        };
      }
      if (result && typeof result === "object" && "available" in result && !result.available) {
        return {
          ok: false,
          status: "blocked",
          reason: result.reason || "guard-blocked",
          diagnostics: result.diagnostics
        };
      }
      if (result && typeof result === "object" && "ok" in result && !result.ok) return result;
    }
    return null;
  };

  const blockedActionResult = (
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource,
    reason: DashboardEditorShellBlockedReason,
    itemIds: string[] = [],
    diagnostics: DashboardEditorShellDiagnostic[] = [],
    actionId = createDashboardEditorShellActionId(actionType)
  ): DashboardEditorShellActionResult => {
    const result = createDashboardEditorShellResult({
      ok: false,
      status: reason === "adapter-unavailable" ? "unsupported" : "blocked",
      actionId,
      actionType,
      source,
      itemIds,
      affectedIds: [],
      diagnostics: diagnostics.concat(createDashboardEditorShellDiagnostic(
        `shell-${reason}`,
        reason === "missing-runtime" || reason === "missing-editor" ? "warning" : "error",
        `Dashboard editor shell action was blocked: ${reason}.`,
        { actionId, actionType, source, reason, itemIds, ...profileContext() }
      ))
    });
    emitShellResult(emit, result, profileContext());
    return result;
  };

  const placementDiagnosticsForShell = (
    placement: GridEditorPlacementSummary | undefined,
    actionId: string,
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource
  ): DashboardEditorShellDiagnostic[] => (placement?.diagnostics || []).map(diagnostic => {
    const code = diagnostic.code.startsWith("grid-editor.placement.")
      ? `shell-placement-${diagnostic.code.slice("grid-editor.placement.".length).replace(/\./g, "-")}`
      : diagnostic.code;
    return createDashboardEditorShellDiagnostic(
      code,
      diagnostic.level,
      diagnostic.message,
      {
        actionId,
        actionType,
        source,
        reason: diagnostic.reason,
        itemIds: diagnostic.itemIds,
        details: diagnostic.details,
        recoverable: diagnostic.level !== "error",
        ...profileContext()
      }
    );
  });

  const placementSummaryFromCommand = (
    result: GridEditorCommandResult | undefined,
    actionId: string,
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource
  ) => {
    const placement = result?.diagnostics?.computed?.placement;
    if (!placement) return undefined;
    return {
      ...placement,
      strategy: placement.strategy as DashboardEditorShellPlacementStrategy,
      diagnostics: stableDiagnostics(placementDiagnosticsForShell(placement, actionId, actionType, source))
    };
  };

  const placementSummaryFromSession = (
    session: GridEditorPlacementSession | undefined,
    actionId: string,
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource
  ) => {
    if (!session) return undefined;
    const placement = {
      strategy: session.strategy,
      placementSource: session.strategy,
      collisionPolicy: session.collisionPolicy,
      insertedIds: session.ghostItems.map(item => item.id),
      shiftedIds: session.affectedOutlines
        .filter(item => item.kind === "shift")
        .map(item => item.id),
      before: session.affectedOutlines.map(item => ({ id: item.id, ...item.before })),
      after: session.affectedOutlines.map(item => ({ id: item.id, ...item.after })),
      diagnostics: session.diagnostics
    };
    return {
      ...placement,
      strategy: placement.strategy as DashboardEditorShellPlacementStrategy,
      diagnostics: stableDiagnostics(placementDiagnosticsForShell(placement, actionId, actionType, source))
    };
  };

  const placementSessionActionResult = (
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource,
    session: GridEditorPlacementSession,
    position?: DashboardEditorShellResolvedPosition,
    actionId = createDashboardEditorShellActionId(actionType)
  ): DashboardEditorShellActionResult => {
    const placement = placementSummaryFromSession(session, actionId, actionType, source);
    const result = createDashboardEditorShellResult({
      ok: true,
      status: "success",
      actionId,
      actionType,
      source,
      itemIds: session.items.map(item => item.i),
      affectedIds: [],
      position,
      placement,
      diagnostics: placement?.diagnostics || [],
      data: dataWithPlacement({
        placementSessionId: session.id,
        phase: session.phase,
        source: session.source
      }, placement)
    });
    emitShellResult(emit, result, profileContext());
    return result;
  };

  const dataWithPlacement = <T>(
    data: T | undefined,
    placement: ReturnType<typeof placementSummaryFromCommand>
  ): T | undefined => {
    if (!placement) return data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return {
        ...(data as Record<string, unknown>),
        placement
      } as T;
    }
    return { value: data, placement } as T;
  };

  const actionStatusFromCommandResult = (
    result: GridEditorCommandResult
  ): DashboardEditorShellActionStatus =>
    result.status === "changed" ? "success" :
      result.status === "cancelled" ? "cancelled" :
        result.status === "timeout" ? "timeout" :
          result.status === "error" ? "error" :
            result.status === "blocked" ? "blocked" : "noop";

  const blockedCommandDiagnostics = (
    result: GridEditorCommandResult,
    actionId: string,
    actionType: DashboardEditorShellActionType,
    source: DashboardEditorShellActionSource
  ): DashboardEditorShellDiagnostic[] => result.blocked
    ? [createDashboardEditorShellDiagnostic(
        `shell-command-${result.blocked.reason}`,
        "warning",
        result.blocked.message || `Editor command was blocked: ${result.blocked.reason}.`,
        { actionId, actionType, source, reason: result.blocked.reason, itemIds: result.blocked.itemIds, recoverable: true }
      )]
    : [];

  const maybeWriteLegacyLayoutMirror = (
    layout: Layout | null | undefined,
    status: DashboardEditorShellActionStatus,
    writeResult?: DashboardWriteResult
  ) => {
    if (!shellManagedWriteBack()) return;
    if (!layout || !options.legacyHistoryStore) return;
    if (status !== "success") return;
    if (writeResult?.ok !== true) return;
    options.legacyHistoryStore.push(layout);
  };

  const coordinateShellCommandCommit = <T = unknown>(input: {
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    result: GridEditorCommandResult;
    nextLayout?: Layout | null;
    writeItemIds?: string[];
    removeMissingItems?: boolean;
    hasDocumentMutation?: boolean;
    rollbackCheckpoint?: GridEditorRollbackCheckpoint | null;
    rollbackReason?: string;
    writeLegacyMirror?: boolean;
    data?: T;
  }): {
    status: DashboardEditorShellActionStatus;
    ok: boolean;
    writeResult?: DashboardWriteResult;
    proposedDocument?: DashboardLayoutDocument;
    affectedIds: string[];
    patches: GridEditorCommandResult["layoutPatches"];
    placement: ReturnType<typeof placementSummaryFromCommand>;
    data?: T;
    diagnostics: DashboardEditorShellDiagnostic[];
  } => {
    const placement = placementSummaryFromCommand(input.result, input.actionId, input.actionType, input.source);
    const placementDiagnostics = placementDiagnosticsForShell(
      input.result.diagnostics?.computed?.placement,
      input.actionId,
      input.actionType,
      input.source
    );
    const status = actionStatusFromCommandResult(input.result);
    const hasDocumentMutation = input.hasDocumentMutation ??
      (input.result.layoutPatches.length > 0 || input.result.metadataPatches.length > 0);
    const shouldWrite = Boolean(
      input.nextLayout &&
      hasDocumentMutation &&
      (input.result.status === "changed" || input.result.status === "noop")
    );
    const write = shouldWrite
      ? writeBackLayout(input.actionId, input.nextLayout || [], input.writeItemIds || input.result.affectedIds, {
          removeMissingItems: input.removeMissingItems
        })
      : { diagnostics: [] };
    if (write.writeResult?.ok === false && input.rollbackCheckpoint) {
      getEditor()?.restoreRollbackCheckpoint(
        input.rollbackCheckpoint,
        input.rollbackReason || "shell-write-back-rollback"
      );
    }
    const resolvedStatus = write.writeResult?.ok === false ? "blocked" : status;
    const ok = (status === "success" || status === "noop") && write.writeResult?.ok !== false;
    if (ok && input.writeLegacyMirror) {
      maybeWriteLegacyLayoutMirror(input.nextLayout, status, write.writeResult);
    }
    return {
      status: resolvedStatus,
      ok,
      writeResult: write.writeResult,
      proposedDocument: write.proposedDocument,
      affectedIds: input.result.affectedIds,
      patches: input.result.layoutPatches,
      placement,
      data: dataWithPlacement(input.data, placement),
      diagnostics: write.diagnostics
        .concat(blockedCommandDiagnostics(input.result, input.actionId, input.actionType, input.source))
        .concat(placementDiagnostics)
    };
  };

  const layoutFromHistorySnapshot = (
    snapshot: GridEditorHistorySnapshot | undefined
  ): Layout | null => {
    if (!snapshot) return null;
    if (snapshot.kind === "layout") return cloneLayout(snapshot.layout);
    return cloneLayout(snapshot.layouts[snapshot.breakpoint] || []);
  };

  const executeHistoryMutation = async (
    actionType: "undo" | "redo",
    actionOptions: DashboardEditorShellActionOptions = {}
  ): Promise<DashboardEditorShellActionResult> => enqueueMutation(async () => {
    const actionId = createDashboardEditorShellActionId(actionType);
    const source = actionOptions.source || "api";
    const editor = getEditor();
    if (!editor) return blockedActionResult(actionType, source, "missing-editor", [], [], actionId);
    const rollbackCheckpoint = editor.createRollbackCheckpoint(`shell-${actionType}-write-back`);
    pendingShellCommandIds.add(actionId);
    const result = await editor.execute({
      id: actionId,
      type: actionType,
      source: toEditorSource(source)
    }).finally(() => {
      pendingShellCommandIds.delete(actionId);
    });
    const nextLayout = layoutFromHistorySnapshot(actionType === "undo" ? result.undo?.before : result.undo?.after);
    const coordinated = coordinateShellCommandCommit({
      actionId,
      actionType,
      source,
      result,
      nextLayout,
      removeMissingItems: true,
      hasDocumentMutation: Boolean(nextLayout),
      rollbackCheckpoint,
      rollbackReason: "shell-history-write-back-rollback",
      data: { historyEntry: result.undo?.id }
    });
    const shellResult = createDashboardEditorShellResult({
      ok: coordinated.ok,
      status: coordinated.status,
      actionId,
      actionType,
      source,
      itemIds: result.targetIds,
      affectedIds: coordinated.affectedIds,
      commandResult: result,
      writeResult: coordinated.writeResult,
      proposedDocument: coordinated.proposedDocument,
      patches: coordinated.patches,
      diagnostics: coordinated.diagnostics,
      data: coordinated.data
    });
    if (shellResult.ok && shellResult.proposedDocument && shellResult.writeResult?.ok !== false) {
      maybeUpdateInternalDocument(shellResult.proposedDocument);
      emitDocumentChange(actionId, shellResult.proposedDocument, getRuntime());
    }
    emitShellResult(emit, shellResult, profileContext());
    return shellResult;
  });

  const executeEditorMutation = async <T = unknown>(
    actionType: DashboardEditorShellActionType,
    command: GridEditorCommand,
    input: {
      source?: DashboardEditorShellActionSource;
      itemIds?: string[];
      position?: DashboardEditorShellResolvedPosition;
      prepare?: (ctx: DashboardEditorShellAdapterContext) => Promise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined> | DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined;
      commit?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => Promise<DashboardEditorShellAdapterResult | void> | DashboardEditorShellAdapterResult | void;
      rollback?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => Promise<DashboardEditorShellAdapterResult | void> | DashboardEditorShellAdapterResult | void;
      contextExtra?: Partial<DashboardEditorShellAdapterContext>;
      data?: T;
    } = {}
  ): Promise<DashboardEditorShellActionResult<T>> => enqueueMutation(async () => {
    const actionId = command.id || createDashboardEditorShellActionId(actionType);
    const source = input.source || "api";
    const itemIds = input.itemIds || command.targetIds || [];
    const ctx = actionContext(actionId, actionType, source, itemIds, input.position, input.contextExtra);
    let rollbackLayout: Layout | null = null;
    let rollbackCheckpoint: GridEditorRollbackCheckpoint | null = null;
    let editorChanged = false;
    const transactionResult = await runDashboardEditorShellTransaction<T>({
      actionId,
      actionType,
      source,
      itemIds,
      position: input.position,
      context: ctx,
      profile: profileContext(),
      emit,
      prepare: async transactionCtx => {
        const guard = await runGuards(transactionCtx);
        if (guard) return guard;
        return input.prepare?.(transactionCtx) || null;
      },
      mutate: async prepared => {
        const editor = getEditor();
        const runtime = getRuntime();
        if (!editor) {
          return {
            status: "blocked" as DashboardEditorShellActionStatus,
            commandResult: noCommandResult(actionId, command.type, "missing-editor", itemIds),
            diagnostics: [createDashboardEditorShellDiagnostic(
              "shell-missing-editor",
              "error",
              "Grid editor controller is required for this action.",
              { actionId, actionType, source, reason: "missing-editor", recoverable: true }
            )]
          };
        }
        rollbackLayout = runtime ? cloneLayout(runtime.layout) : null;
        const preparedIdDiagnostics = validatePreparedNewIds(
          prepared,
          runtime?.layout || [],
          actionId,
          actionType,
          source
        );
        if (preparedIdDiagnostics.length > 0) {
          return {
            status: "blocked" as const,
            commandResult: noCommandResult(actionId, command.type, "invalid-input", itemIds),
            affectedIds: [],
            diagnostics: preparedIdDiagnostics
          };
        }
        const commandForPrepared = prepared?.newIds?.[0] && command.type === "add"
          ? {
              ...command,
              payload: {
                ...((command.payload || {}) as Record<string, unknown>),
                item: {
                  ...(((command.payload as Record<string, unknown> | undefined)?.item || {}) as Record<string, unknown>),
                  i: prepared.newIds[0]
                }
              }
            }
          : command;
        rollbackCheckpoint = editor.createRollbackCheckpoint(`shell-${actionType}-write-back`);
        pendingShellCommandIds.add(actionId);
        const result = await editor.execute({
          ...commandForPrepared,
          id: actionId,
          source: toEditorSource(source)
        }).finally(() => {
          pendingShellCommandIds.delete(actionId);
        });
        editorChanged = result.status === "changed";
        const placement = placementSummaryFromCommand(result, actionId, actionType, source);
        const placementDiagnostics = placementDiagnosticsForShell(result.diagnostics?.computed?.placement, actionId, actionType, source);
        if (result.status === "blocked" || result.status === "cancelled" || result.status === "timeout" || result.status === "error") {
          return {
            status: result.status === "cancelled" ? "cancelled" as const :
              result.status === "timeout" ? "timeout" as const :
                result.status === "error" ? "error" as const : "blocked" as const,
            commandResult: result,
            affectedIds: result.affectedIds,
            diagnostics: result.blocked
              ? [createDashboardEditorShellDiagnostic(
                  `shell-command-${result.blocked.reason}`,
                  "warning",
                  result.blocked.message || `Editor command was blocked: ${result.blocked.reason}.`,
                  { actionId, actionType, source, reason: result.blocked.reason, itemIds: result.blocked.itemIds, recoverable: true }
                )].concat(placementDiagnostics)
              : placementDiagnostics,
            placement,
            data: dataWithPlacement(input.data, placement)
          };
        }
        const nextLayout = runtime
          ? applyCommandResultToLayout(runtime, result)
          : [];
        const coordinated = coordinateShellCommandCommit({
          actionId,
          actionType,
          source,
          result,
          nextLayout: runtime ? nextLayout : null,
          removeMissingItems: command.type === "delete",
          rollbackCheckpoint,
          rollbackReason: "shell-write-back-rollback",
          data: input.data
        });
        return {
          status: coordinated.status,
          commandResult: result,
          writeResult: coordinated.writeResult,
          proposedDocument: coordinated.proposedDocument,
          affectedIds: coordinated.affectedIds,
          patches: coordinated.patches,
          placement: coordinated.placement,
          data: coordinated.data,
          diagnostics: coordinated.diagnostics
        };
      },
      commit: input.commit,
      rollback: input.rollback
    });
    if (!transactionResult.ok && editorChanged) {
      if (rollbackCheckpoint) getEditor()?.restoreRollbackCheckpoint(rollbackCheckpoint, "shell-transaction-rollback");
      else if (rollbackLayout) getEditor()?.setExternalLayout(rollbackLayout, "shell-transaction-rollback");
    }
    if (transactionResult.ok && transactionResult.proposedDocument && transactionResult.writeResult?.ok !== false) {
      const runtime = getRuntime();
      if (runtime && transactionResult.commandResult) {
        maybeWriteLegacyLayoutMirror(
          applyCommandResultToLayout(runtime, transactionResult.commandResult),
          transactionResult.status,
          transactionResult.writeResult
        );
      }
      maybeUpdateInternalDocument(transactionResult.proposedDocument);
      emitDocumentChange(actionId, transactionResult.proposedDocument, getRuntime());
    }
    return transactionResult;
  });

  const finalizeShellManagedCommandCommit = async (
    command: GridEditorCommand,
    result: GridEditorCommandResult
  ): Promise<DashboardEditorShellActionResult | null> => enqueueMutation(async () => {
    if (!shellManagedWriteBack()) return null;
    if (processedCommandIds.has(result.id)) return null;
    if (pendingShellCommandIds.has(result.id)) return null;
    const actionType = syntheticActionTypeForCommand(command);
    if (!actionType) return null;
    if ((result.diagnostics?.computed?.placement as { sessionId?: string } | undefined)?.sessionId) return null;

    const actionId = result.id || createDashboardEditorShellActionId(actionType);
    const source = fromEditorSource(command.source || result.diagnostics?.source);
    const runtime = getRuntime();
    const checkpoint = commandRollbackCheckpoints.get(result.id);
    const revisionKey = commandRevisionKey(result.id, checkpoint);
    if (processedCommandRevisions.has(revisionKey)) return null;
    processedCommandIds.add(result.id);
    processedCommandRevisions.add(revisionKey);
    commandRollbackCheckpoints.delete(result.id);
    const nextLayout = runtime
      ? applyCommandResultToLayout(runtime, result)
      : [];
    const coordinated = coordinateShellCommandCommit({
      actionId,
      actionType,
      source,
      result,
      nextLayout: runtime ? nextLayout : null,
      removeMissingItems: command.type === "delete",
      rollbackCheckpoint: checkpoint,
      rollbackReason: "shell-managed-write-back-failed",
      writeLegacyMirror: true,
      data: {
        commandId: result.id,
        commandType: command.type,
        historyEntryId: result.undo?.id,
        synthesized: true
      }
    });
    const shellResult = createDashboardEditorShellResult({
      ok: coordinated.ok,
      status: coordinated.status,
      actionId,
      actionType,
      source,
      itemIds: result.targetIds,
      affectedIds: coordinated.affectedIds,
      commandResult: result,
      writeResult: coordinated.writeResult,
      proposedDocument: coordinated.proposedDocument,
      patches: coordinated.patches,
      placement: coordinated.placement,
      diagnostics: coordinated.diagnostics,
      data: coordinated.data
    });
    if (shellResult.ok && shellResult.proposedDocument && shellResult.writeResult?.ok !== false) {
      maybeUpdateInternalDocument(shellResult.proposedDocument);
      emitDocumentChange(actionId, shellResult.proposedDocument, getRuntime());
    }
    emitShellResult(emit, shellResult, profileContext());
    return shellResult;
  });

  const resolveTargetPosition = (
    target: Event | DashboardEditorShellPositionInput | null | undefined,
    options: DashboardEditorShellPositionRequest = {}
  ): DashboardEditorShellPositionResult => {
    if (target && typeof Event !== "undefined" && target instanceof Event) {
      return getEventPosition(target, options);
    }
    if (target && typeof target === "object" && ("x" in target || "y" in target)) {
      return resolveShellPosition({
        ...options,
        runtime: getRuntime(),
        layout: getRuntime()?.layout,
        selection: null,
        gridElement: null,
        lastMenuPosition: null,
        lastPointerPosition: null,
        fallback: target
      });
    }
    return resolveShellPosition({
      ...options,
      runtime: getRuntime(),
      layout: getRuntime()?.layout,
      selection: getEditor()?.selection.value || null,
      gridElement: getGridElement(),
      lastMenuPosition: state.value.lastMenuPosition,
      lastPointerPosition: state.value.lastPointerPosition,
      fallback: options.fallback || state.value.lastMenuPosition || state.value.lastPointerPosition || undefined
    });
  };

  const resolvePlacementPosition = (
    target: Event | DashboardEditorShellPositionInput | null | undefined,
    placementOptions: DashboardEditorShellPlacementOptions,
    fallbackStrategy: DashboardEditorShellPlacementStrategy
  ): DashboardEditorShellPositionResult => {
    const strategy = normalizePlacementStrategy(placementOptions, fallbackStrategy);
    if (!isSyntheticPlacementStrategy(strategy)) return resolveTargetPosition(target, placementOptions);
    const request = placementOptions as DashboardEditorShellPositionRequest;
    if (target) {
      return resolveTargetPosition(target, {
        ...placementOptions,
        fallback: request.fallback || { x: 0, y: 0, source: "strategy" }
      });
    }
    return resolveTargetPosition({ x: 0, y: 0, source: "strategy" }, placementOptions);
  };

  const defaultTargetlessPasteStrategy = (): DashboardEditorShellPlacementStrategy =>
    options.menu?.defaultPasteStrategy ||
    options.menu?.defaultAddStrategy ||
    "cursor";

  const getEventPosition = (
    event?: Event | null,
    request: DashboardEditorShellPositionRequest = {}
  ): DashboardEditorShellPositionResult =>
    getEventGridPositionHelper({
      ...request,
      event,
      runtime: getRuntime(),
      layout: getRuntime()?.layout,
      selection: getEditor()?.selection.value || null,
      gridElement: getGridElement(),
      lastMenuPosition: state.value.lastMenuPosition,
      lastPointerPosition: state.value.lastPointerPosition,
      fallback: request.fallback || options.position?.fallback
    });

  const pasteAtPosition = async (
    position: DashboardEditorShellResolvedPosition,
    pasteOptions: DashboardEditorShellPasteOptions = {},
    actionType: DashboardEditorShellActionType = "paste"
  ): Promise<DashboardEditorShellActionResult> => {
    const runtime = getRuntime();
    const placementIntent = pasteOptions.placementIntent || "here";
    const payload = {
      strategy: pasteOptions.strategy || "cursor",
      ...placementCollisionOptions(pasteOptions),
      cursor: { x: position.x, y: position.y },
      cols: runtime?.gridSettings?.columns || position.cols || 12,
      maxRows: (runtime?.gridSettings as Record<string, unknown> | undefined)?.maxRows || Infinity,
      list: position.list,
      source: position.source,
      placementIntent,
      placementAnchor: placementIntent === "here" ? "top-left" : undefined
    };
    return executeEditorMutation(actionType, {
      type: "paste",
      payload
    }, {
      source: pasteOptions.source || "api",
      position,
      contextExtra: { placementIntent }
    });
  };

  const prepareWidgetMutation = (
    method: "preparePasteWidget" | "prepareDuplicateWidget" | "prepareRemoveWidget" | "prepareAddWidget"
  ) => options.widgetAdapter?.[method]
    ? (ctx: DashboardEditorShellAdapterContext) => options.widgetAdapter?.[method]?.(ctx)
    : undefined;

  const commitWidgetMutation = options.widgetAdapter?.commit
    ? (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => options.widgetAdapter?.commit?.(prepared, ctx)
    : undefined;

  const rollbackWidgetMutation = options.widgetAdapter?.rollback
    ? (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => options.widgetAdapter?.rollback?.(prepared, ctx)
    : undefined;

  const prepareReferenceMutation = (
    method: "preparePasteReference" | "prepareReplaceReferenceWithWidgetCopy"
  ) => options.referenceAdapter?.[method]
    ? (ctx: DashboardEditorShellAdapterContext) => options.referenceAdapter?.[method]?.(ctx)
    : undefined;

  const commitReferenceMutation = options.referenceAdapter?.commit
    ? (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => options.referenceAdapter?.commit?.(prepared, ctx)
    : undefined;

  const rollbackReferenceMutation = options.referenceAdapter?.rollback
    ? (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => options.referenceAdapter?.rollback?.(prepared, ctx)
    : undefined;

  const normalizeConfirmResult = (
    value: boolean | DashboardEditorShellAvailability | DashboardEditorShellAdapterResult
  ): DashboardEditorShellAdapterResult | null => {
    if (value === true) return null;
    if (value === false) return { ok: false, status: "cancelled", reason: "confirm-cancelled" };
    if ("available" in value) {
      return value.available
        ? null
        : { ok: false, status: "cancelled", reason: value.reason || "confirm-cancelled", diagnostics: value.diagnostics };
    }
    return value.ok ? null : value;
  };

  const rememberPendingPlacementCommit = (
    session: GridEditorPlacementSession,
    input: Omit<PendingPlacementShellCommit, "baseLayout" | "itemIds">
  ) => {
    pendingPlacementCommits.set(session.id, {
      ...input,
      itemIds: session.items.map(item => item.i),
      baseLayout: cloneLayout(session.baseLayout)
    });
  };

  const pendingPlacementCommitFromCommand = (
    result: GridEditorCommandResult
  ): {
    pending: PendingPlacementShellCommit;
    placement: GridEditorPlacementSummary & { sessionId?: string };
  } | null => {
    const placement = result.diagnostics?.computed?.placement as (GridEditorPlacementSummary & { sessionId?: string }) | undefined;
    const sessionId = placement?.sessionId;
    if (!sessionId) return null;
    const pending = pendingPlacementCommits.get(sessionId);
    return pending && placement ? { pending, placement } : null;
  };

  const placementCommitActionResult = (
    result: GridEditorCommandResult,
    pending: PendingPlacementShellCommit | null,
    source: DashboardEditorShellActionSource
  ): DashboardEditorShellActionResult => {
    const actionType = pending?.actionType || "place-clipboard";
    const actionId = pending?.actionId || createDashboardEditorShellActionId(actionType);
    const placementSummary = placementSummaryFromCommand(result, actionId, actionType, source);
    const placementDiagnostics = placementDiagnosticsForShell(
      result.diagnostics?.computed?.placement,
      actionId,
      actionType,
      source
    );
    const status: DashboardEditorShellActionStatus =
      result.status === "changed" ? "success" :
        result.status === "cancelled" ? "cancelled" :
          result.status === "timeout" ? "timeout" :
            result.status === "error" ? "error" :
              result.status === "blocked" ? "blocked" : "noop";
    const diagnostics = result.blocked
      ? [createDashboardEditorShellDiagnostic(
          `shell-command-${result.blocked.reason}`,
          "warning",
          result.blocked.message || `Editor command was blocked: ${result.blocked.reason}.`,
          { actionId, actionType, source, reason: result.blocked.reason, itemIds: result.blocked.itemIds, recoverable: true }
        )].concat(placementDiagnostics)
      : placementDiagnostics;
    const shellResult = createDashboardEditorShellResult({
      ok: status === "success" || status === "noop",
      status,
      actionId,
      actionType,
      source,
      itemIds: result.targetIds,
      affectedIds: result.affectedIds,
      position: pending?.position,
      commandResult: result,
      patches: result.layoutPatches,
      placement: placementSummary,
      data: dataWithPlacement(pending?.data, placementSummary),
      diagnostics
    });
    emitShellResult(emit, shellResult, profileContext());
    return shellResult;
  };

  const finalizePendingPlacementCommit = async (
    result: GridEditorCommandResult
  ): Promise<DashboardEditorShellActionResult | null> => {
    const pendingCommit = pendingPlacementCommitFromCommand(result);
    const sessionId = pendingCommit?.placement.sessionId;
    if (!pendingCommit || !sessionId) return null;
    const existing = placementCommitFinalizations.get(result.id);
    if (existing) return existing;
    if (result.status === "blocked" && result.blocked?.reason !== "stale-command") return null;
    const { pending } = pendingCommit;
    pendingPlacementCommits.delete(sessionId);

    const finalized = enqueueMutation(async () => {
      const editor = getEditor();
      const runtime = getRuntime();
      const rollbackCheckpoint = commandRollbackCheckpoints.get(result.id) || pending.rollbackCheckpoint;
      commandRollbackCheckpoints.delete(result.id);
      const placementSummary = placementSummaryFromCommand(result, pending.actionId, pending.actionType, pending.source);
      const placementDiagnostics = placementDiagnosticsForShell(
        result.diagnostics?.computed?.placement,
        pending.actionId,
        pending.actionType,
        pending.source
      );
      const ctx = actionContext(
        pending.actionId,
        pending.actionType,
        pending.source,
        pending.itemIds,
        pending.position,
        pending.contextExtra
      );
      const transactionResult = await runDashboardEditorShellTransaction({
        actionId: pending.actionId,
        actionType: pending.actionType,
        source: pending.source,
        itemIds: pending.itemIds,
        position: pending.position,
        context: ctx,
        profile: profileContext(),
        emit,
        prepare: pending.prepare,
        mutate: () => {
          if (result.status === "blocked" || result.status === "cancelled" || result.status === "timeout" || result.status === "error") {
            return {
              status: result.status === "cancelled" ? "cancelled" as const :
                result.status === "timeout" ? "timeout" as const :
                  result.status === "error" ? "error" as const : "blocked" as const,
              commandResult: result,
              affectedIds: result.affectedIds,
              diagnostics: placementDiagnostics,
              placement: placementSummary,
              data: dataWithPlacement(pending.data, placementSummary)
            };
          }
          const nextLayout = runtime
            ? applyCommandResultToLayout(runtime, result)
            : [];
          const coordinated = coordinateShellCommandCommit({
            actionId: pending.actionId,
            actionType: pending.actionType,
            source: pending.source,
            result,
            nextLayout: runtime ? nextLayout : null,
            removeMissingItems: result.type === "delete",
            rollbackCheckpoint,
            rollbackReason: "shell-placement-write-back-rollback",
            data: pending.data
          });
          return {
            status: coordinated.status,
            commandResult: result,
            writeResult: coordinated.writeResult,
            proposedDocument: coordinated.proposedDocument,
            affectedIds: coordinated.affectedIds,
            patches: coordinated.patches,
            placement: coordinated.placement || placementSummary,
            data: coordinated.data,
            diagnostics: coordinated.diagnostics.length
              ? coordinated.diagnostics
              : placementDiagnostics
          };
        },
        commit: pending.commit,
        rollback: pending.rollback
      });
      if (!transactionResult.ok && result.status === "changed" && editor) {
        if (rollbackCheckpoint) {
          editor.restoreRollbackCheckpoint(rollbackCheckpoint, "shell-placement-transaction-rollback");
        } else {
          editor.setExternalLayout(pending.baseLayout, "shell-placement-transaction-rollback");
        }
      }
      if (transactionResult.ok && transactionResult.proposedDocument && transactionResult.writeResult?.ok !== false) {
        const runtime = getRuntime();
        if (runtime && transactionResult.commandResult) {
          maybeWriteLegacyLayoutMirror(
            applyCommandResultToLayout(runtime, transactionResult.commandResult),
            transactionResult.status,
            transactionResult.writeResult
          );
        }
        maybeUpdateInternalDocument(transactionResult.proposedDocument);
        emitDocumentChange(pending.actionId, transactionResult.proposedDocument, getRuntime());
      }
      return transactionResult;
    });
    placementCommitFinalizations.set(result.id, finalized);
    void finalized.finally(() => {
      if (placementCommitFinalizations.get(result.id) === finalized) {
        placementCommitFinalizations.delete(result.id);
      }
    });
    return finalized;
  };

  const actions: DashboardEditorShellActions = {
    getEventGridPosition: (event?: Event | null, request: DashboardEditorShellPositionRequest = {}) =>
      getEventPosition(event, request),

    pasteAtEvent: async (event?: Event | null, pasteOptions: DashboardEditorShellPasteOptions = {}) => {
      const position = getEventPosition(event, pasteOptions);
      if (!position.ok) {
        return blockedActionResult("paste", pasteOptions.source || "api", position.reason, [], position.diagnostics);
      }
      state.value = { ...state.value, lastPointerPosition: position.position };
      return pasteAtPosition(position.position, pasteOptions, "paste");
    },

    pasteAtGridPosition: async (positionInput: DashboardEditorShellPositionInput, pasteOptions: DashboardEditorShellPasteOptions = {}) => {
      const position = resolveTargetPosition(positionInput, pasteOptions);
      if (!position.ok) {
        return blockedActionResult("paste", pasteOptions.source || "api", position.reason, [], position.diagnostics);
      }
      return pasteAtPosition(position.position, pasteOptions, "paste");
    },

    selectItem: async (id: string, actionOptions: DashboardEditorShellActionOptions = {}) =>
      executeEditorMutation("select", {
        type: "select",
        targetIds: [id],
        payload: { ids: [id] }
      }, {
        source: actionOptions.source || "api",
        itemIds: [id]
      }),

    highlightItem: (id: string, highlightOptions: DashboardEditorShellHighlightOptions = {}) => {
      const actionId = createDashboardEditorShellActionId("highlight");
      const runtime = getRuntime();
      const previous = state.value.highlightedId;
      if (!runtime?.allItemIds.includes(id)) {
        return blockedActionResult("highlight", highlightOptions.source || "api", "missing-item", [id], [], actionId);
      }
      if (highlightTimer) clearTimeout(highlightTimer);
      state.value = { ...state.value, highlightedId: id };
      emit({
        type: "highlight-change",
        actionId,
        itemId: id,
        previous,
        profile: profileContext()
      });
      if (highlightOptions.durationMs && highlightOptions.durationMs > 0) {
        highlightTimer = setTimeout(() => {
          actions.resetHighlight();
        }, highlightOptions.durationMs);
      }
      const result = createDashboardEditorShellResult({
        ok: true,
        status: "success",
        actionId,
        actionType: "highlight",
        source: highlightOptions.source || "api",
        itemIds: [id],
        affectedIds: [id],
        diagnostics: []
      });
      emitShellResult(emit, result, profileContext());
      if (highlightOptions.scroll) void actions.scrollToItem(id, highlightOptions);
      return result;
    },

    resetHighlight: () => {
      const actionId = createDashboardEditorShellActionId("reset-highlight");
      const previous = state.value.highlightedId;
      if (highlightTimer) {
        clearTimeout(highlightTimer);
        highlightTimer = null;
      }
      state.value = { ...state.value, highlightedId: null };
      emit({
        type: "highlight-change",
        actionId,
        itemId: null,
        previous,
        profile: profileContext()
      });
      const result = createDashboardEditorShellResult({
        ok: true,
        status: previous ? "success" : "noop",
        actionId,
        actionType: "reset-highlight",
        source: "api",
        itemIds: previous ? [previous] : [],
        affectedIds: previous ? [previous] : [],
        diagnostics: []
      });
      emitShellResult(emit, result, profileContext());
      return result;
    },

    scrollToItem: async (id: string, scrollOptions: DashboardEditorShellScrollOptions = {}) => {
      const actionId = createDashboardEditorShellActionId("scroll-to-item");
      const runtime = getRuntime();
      const source = scrollOptions.source || "api";
      if (!runtime?.allItemIds.includes(id)) {
        return blockedActionResult("scroll-to-item", source, "missing-item", [id], [], actionId);
      }
      if (runtime.hiddenItemIds.includes(id) || !runtime.renderItemIds.includes(id)) {
        const result = blockedActionResult("scroll-to-item", source, "hidden", [id], [], actionId);
        emit({
          type: "action-result",
          actionId,
          actionType: "scroll-to-item",
          source,
          status: "blocked",
          ok: false,
          itemIds: [id],
          affectedIds: [],
          profile: profileContext(),
          diagnostics: result.diagnostics
        });
        return result;
      }
      const gridElement = getGridElement();
      if (!gridElement || typeof gridElement.querySelector !== "function") {
        return blockedActionResult("scroll-to-item", source, "missing-grid-element", [id], [], actionId);
      }
      const selector = typeof scrollOptions.selector === "function"
        ? scrollOptions.selector(id)
        : scrollOptions.selector || `[data-grid-id="${cssEscape(id)}"],[data-grid-item-id="${cssEscape(id)}"],[data-i="${cssEscape(id)}"],[data-id="${cssEscape(id)}"]`;
      const itemElement = gridElement.querySelector<HTMLElement>(selector);
      if (!itemElement) {
        return blockedActionResult("scroll-to-item", source, "dom-unavailable", [id], [], actionId);
      }
      const adapterResult = await options.scrollAdapter?.({
        itemId: id,
        itemElement,
        gridElement,
        options: scrollOptions,
        runtime
      });
      if (adapterResult && !adapterResult.available) {
        return blockedActionResult("scroll-to-item", source, adapterResult.reason || "dom-unavailable", [id], adapterResult.diagnostics || [], actionId);
      }
      if (typeof itemElement.scrollIntoView === "function") {
        itemElement.scrollIntoView({
          behavior: scrollOptions.behavior || "smooth",
          block: scrollOptions.block || "nearest",
          inline: scrollOptions.inline || "nearest"
        });
      }
      const result = createDashboardEditorShellResult({
        ok: true,
        status: "success",
        actionId,
        actionType: "scroll-to-item",
        source,
        itemIds: [id],
        affectedIds: [id],
        diagnostics: []
      });
      emitShellResult(emit, result, profileContext());
      return result;
    },

    prepareDashboardContextMenu: (event?: Event | null, request: DashboardEditorShellMenuRequest = {}) => {
      const position = getEventPosition(event || null, { source: request.source || "context-menu" });
      const resolved = position.ok ? position.position : undefined;
      const explicitPlacementTarget = hasEventCoordinates(event || null) && resolved?.source === "event";
      if (resolved) {
        state.value = { ...state.value, lastMenuPosition: resolved };
      }
      const actionId = createDashboardEditorShellActionId("prepare-dashboard-menu");
      const runtime = getRuntime();
      const editor = getEditor();
      const menu = buildDashboardContextMenu({
        id: actionId,
        target: { type: "dashboard", position: resolved },
        position: resolved,
        context: {
          target: { type: "dashboard", position: resolved },
          runtime,
          mode: state.value.mode,
          readonly: state.value.mode !== "edit",
          editor
        },
        actions,
        options: options.menu,
        customItems: request.customItems,
        includeHidden: request.includeHidden,
        explicitPlacementTarget,
        referenceAvailable: Boolean(options.referenceAdapter?.preparePasteReference),
        paletteAvailable: Boolean(options.palette?.open),
        diagnostics: position.ok ? position.diagnostics : position.diagnostics
      });
      state.value = { ...state.value, menu };
      emit({ type: "menu-change", actionId, menu, profile: profileContext() });
      return menu;
    },

    prepareWidgetContextMenu: (event: Event | null, itemId: string, request: DashboardEditorShellMenuRequest = {}) => {
      const position = getEventPosition(event || null, { source: request.source || "context-menu", activeItemId: itemId });
      const resolved = position.ok ? position.position : undefined;
      if (resolved) {
        state.value = { ...state.value, lastMenuPosition: resolved };
      }
      const actionId = createDashboardEditorShellActionId("prepare-widget-menu");
      const runtime = getRuntime();
      const editor = getEditor();
      const meta = editor?.editorMetaById.value[itemId];
      const target = { type: "widget" as const, itemId, position: resolved };
      const menu = buildWidgetContextMenu({
        id: actionId,
        target,
        itemId,
        hiddenItem: runtime?.hiddenItemIds.includes(itemId) || meta?.visible === false,
        lockedItem: meta?.locked === true || runtime?.layout.find(item => item.i === itemId)?.static === true,
        position: resolved,
        context: {
          target,
          runtime,
          mode: state.value.mode,
          readonly: state.value.mode !== "edit",
          editor
        },
        actions,
        options: options.menu,
        customItems: request.customItems,
        includeHidden: request.includeHidden,
        referenceAvailable: Boolean(options.referenceAdapter),
        diagnostics: position.ok ? position.diagnostics : position.diagnostics
      });
      state.value = { ...state.value, menu };
      emit({ type: "menu-change", actionId, menu, profile: profileContext() });
      return menu;
    },

    closeMenu: (reason = "close") => {
      const actionId = createDashboardEditorShellActionId("close-menu");
      state.value = { ...state.value, menu: null, lastMenuPosition: null };
      emit({ type: "menu-change", actionId, menu: null, reason, profile: profileContext() });
    },

    copyWidget: async (ids?: string | string[], actionOptions: DashboardEditorShellActionOptions = {}) => {
      const itemIds = toArray(ids);
      const selectedIds = itemIds.length ? itemIds : getEditor()?.selection.value.selectedIds || [];
      const actionId = createDashboardEditorShellActionId("copy-widget");
      const source = actionOptions.source || "api";
      clearPendingClipboardPasteIntent();
      const adapter = options.widgetAdapter;
      const runtime = getRuntime();
      const adapterCtx = actionContext(actionId, "copy-widget", source, selectedIds);
      const adapterResult = adapter?.copyWidget
        ? await adapter.copyWidget(adapterCtx)
        : adapter
          ? undefined
          : {
              ok: true,
              diagnostics: [createDashboardEditorShellDiagnostic(
                "shell-widget-payload-unhandled",
                "info",
                "Widget adapter was not provided; copied layout/editor metadata only.",
                { actionId, actionType: "copy-widget", source, reason: "adapter-unavailable", recoverable: true }
              )]
            } as DashboardEditorShellAdapterResult;
      return executeEditorMutation("copy-widget", {
        type: "copy",
        targetIds: selectedIds,
        payload: {
          cols: runtime?.gridSettings?.columns,
          maxRows: (runtime?.gridSettings as Record<string, unknown> | undefined)?.maxRows,
          breakpoint: runtime?.requestedBreakpoint,
          layoutId: runtime?.layoutId,
          viewFormat: runtime?.viewFormat
        }
      }, {
        source,
        itemIds: selectedIds,
        data: adapterResult,
        contextExtra: { payload: adapterResult },
        prepare: async ctx => {
          const guard = await runGuards(ctx);
          if (guard) return guard;
          return adapterResult?.ok === false ? adapterResult : null;
        }
      });
    },

    cutWidget: async (ids?: string | string[], removeOptions: DashboardEditorShellRemoveOptions = {}) => {
      const itemIds = toArray(ids);
      const selectedIds = itemIds.length ? itemIds : getEditor()?.selection.value.selectedIds || [];
      const actionId = createDashboardEditorShellActionId("cut-widget");
      const source = removeOptions.source || "api";
      clearPendingClipboardPasteIntent();
      if (selectedIds.length === 0) {
        return blockedActionResult("cut-widget", source, "selection-count", [], [], actionId);
      }
      const copyResult = await actions.copyWidget(selectedIds, { source });
      if (!copyResult.ok) return copyResult;
      const prepare = prepareWidgetMutation("prepareRemoveWidget");
      const cutResult = await executeEditorMutation("cut-widget", {
        id: actionId,
        type: "delete",
        targetIds: selectedIds
      }, {
        source,
        itemIds: selectedIds,
        data: { clipboardActionId: copyResult.actionId },
        prepare: async ctx => {
          if (!removeOptions.skipConfirm && options.confirm) {
            const confirmed = await options.confirm(ctx);
            const normalized = normalizeConfirmResult(confirmed);
            if (normalized) return normalized;
          }
          return prepare?.(ctx) || null;
        },
        commit: commitWidgetMutation,
        rollback: rollbackWidgetMutation
      });
      if (cutResult.ok) markCutClipboardPasteIntent(actionId, selectedIds);
      return cutResult;
    },

    placeClipboard: async (target?: Event | DashboardEditorShellPositionInput | null, pasteOptions: DashboardEditorShellPasteOptions = {}) => {
      const editor = getEditor();
      const source = pasteOptions.source || "api";
      const actionId = createDashboardEditorShellActionId("place-clipboard");
      clearPendingClipboardPasteIntent();
      if (!editor) return blockedActionResult("place-clipboard", source, "missing-editor");
      const placementIntent = normalizePlacementIntent(target, pasteOptions);
      const fallbackStrategy = placementIntent === "auto" ? defaultTargetlessPasteStrategy() : "cursor";
      const strategy = normalizePlacementStrategy(pasteOptions, fallbackStrategy);
      const position = target
        ? resolvePlacementPosition(target, pasteOptions, fallbackStrategy)
        : resolvePlacementPosition(null, pasteOptions, fallbackStrategy);
      if (!position.ok) return blockedActionResult("place-clipboard", source, position.reason, [], position.diagnostics);
      const result = await editor.beginPlacement({
        source: "paste",
        commandType: "paste",
        strategy,
        ...placementCollisionOptions(pasteOptions),
        placementIntent,
        placementAnchor: placementIntent === "here" ? "top-left" : undefined,
        cursor: position.position.source !== "none"
          ? {
              x: position.position.x,
              y: position.position.y,
              source: position.position.source === "event" ? "menu" : "api",
              clientX: position.position.clientX,
              clientY: position.position.clientY
            }
          : undefined,
        cols: getRuntime()?.gridSettings?.columns || position.position.cols || 12,
        maxRows: isFiniteNumber((getRuntime()?.gridSettings as Record<string, unknown> | undefined)?.maxRows)
          ? (getRuntime()?.gridSettings as Record<string, number>).maxRows
          : Infinity,
        origin: "dashboard-editor-shell"
      });
      if (!result.session) {
        return blockedActionResult(
          "place-clipboard",
          source,
          result.blocked?.reason || "clipboard-unavailable",
          result.blocked?.itemIds || [],
          [],
          actionId
        );
      }
      rememberPendingPlacementCommit(result.session, {
        actionId,
        actionType: "place-clipboard",
        source,
        position: position.position,
        prepare: prepareWidgetMutation("preparePasteWidget"),
        commit: commitWidgetMutation,
        rollback: rollbackWidgetMutation,
        contextExtra: { placementIntent }
      });
      return placementSessionActionResult("place-clipboard", source, result.session, position.position, actionId);
    },

    commitPlacement: async (actionOptions: DashboardEditorShellCommitPlacementOptions = {}) => {
      const editor = getEditor();
      const source = actionOptions.source || "api";
      if (!editor) return blockedActionResult("place-clipboard", source, "missing-editor");
      const activeSessionId = editor.placementSession.value?.id;
      const activePending = activeSessionId
        ? pendingPlacementCommits.get(activeSessionId) || null
        : null;
      if (activePending) {
        activePending.rollbackCheckpoint = editor.createRollbackCheckpoint("shell-placement-write-back");
      }
      const result = await editor.commitPlacement({
        source: toEditorSource(source),
        autoCancelOnBlocked: actionOptions.autoCancelOnBlocked
      });
      const finalized = await finalizePendingPlacementCommit(result);
      if (finalized) return finalized;
      const pending = pendingPlacementCommitFromCommand(result)?.pending || activePending;
      return placementCommitActionResult(result, pending || null, source);
    },

    pasteWidget: async (target?: Event | DashboardEditorShellPositionInput | null, pasteOptions: DashboardEditorShellPasteOptions = {}) => {
      const pendingPasteIntent = consumePendingClipboardPasteIntent();
      if (pasteOptions.placementMode === "interactive") {
        return actions.placeClipboard(target, pasteOptions);
      }
      if (pendingPasteIntent?.mode === "interactive" && !target) {
        return actions.placeClipboard(target, {
          ...pasteOptions,
          strategy: pasteOptions.strategy || "cursor",
          placementIntent: pasteOptions.placementIntent || "here",
          placementMode: "interactive"
        });
      }
      const placementIntent = normalizePlacementIntent(target, pasteOptions);
      const fallbackStrategy = placementIntent === "auto" ? defaultTargetlessPasteStrategy() : "cursor";
      const strategy = normalizePlacementStrategy(pasteOptions, fallbackStrategy);
      const position = resolvePlacementPosition(target, pasteOptions, fallbackStrategy);
      if (!position.ok) return blockedActionResult("paste-widget", pasteOptions.source || "api", position.reason, [], position.diagnostics);
      const prepare = prepareWidgetMutation("preparePasteWidget");
      return executeEditorMutation("paste-widget", {
        type: "paste",
        payload: {
          strategy,
          ...placementCollisionOptions(pasteOptions),
          cursor: { x: position.position.x, y: position.position.y },
          cols: getRuntime()?.gridSettings?.columns || position.position.cols || 12,
          maxRows: isFiniteNumber((getRuntime()?.gridSettings as Record<string, unknown> | undefined)?.maxRows)
            ? (getRuntime()?.gridSettings as Record<string, number>).maxRows
            : Infinity,
          list: position.position.list,
          source: position.position.source,
          placementIntent,
          placementAnchor: placementIntent === "here" ? "top-left" : undefined
        }
      }, {
        source: pasteOptions.source || "api",
        position: position.position,
        contextExtra: { placementIntent },
        prepare,
        commit: commitWidgetMutation,
        rollback: rollbackWidgetMutation
      });
    },

    duplicateWidget: async (ids?: string | string[], actionOptions: DashboardEditorShellActionOptions = {}) => {
      const itemIds = toArray(ids);
      const selectedIds = itemIds.length ? itemIds : getEditor()?.selection.value.selectedIds || [];
      const prepare = prepareWidgetMutation("prepareDuplicateWidget");
      return executeEditorMutation("duplicate-widget", {
        type: "duplicate",
        targetIds: selectedIds,
        payload: { strategy: "nearest-fit", cols: getRuntime()?.gridSettings?.columns || 12 }
      }, {
        source: actionOptions.source || "api",
        itemIds: selectedIds,
        prepare,
        commit: commitWidgetMutation,
        rollback: rollbackWidgetMutation
      });
    },

    removeWidget: async (ids?: string | string[], removeOptions: DashboardEditorShellRemoveOptions = {}) => {
      const itemIds = toArray(ids);
      const selectedIds = itemIds.length ? itemIds : getEditor()?.selection.value.selectedIds || [];
      const source = removeOptions.source || "api";
      const prepare = prepareWidgetMutation("prepareRemoveWidget");
      return executeEditorMutation("remove-widget", {
        type: "delete",
        targetIds: selectedIds
      }, {
        source,
        itemIds: selectedIds,
        prepare: async ctx => {
          if (!removeOptions.skipConfirm && options.confirm) {
            const confirmed = await options.confirm(ctx);
            const normalized = normalizeConfirmResult(confirmed);
            if (normalized) return normalized;
          }
          return prepare?.(ctx) || null;
        },
        commit: commitWidgetMutation,
        rollback: rollbackWidgetMutation
      });
    },

    copyWidgetReference: async (itemId: string, actionOptions: DashboardEditorShellActionOptions = {}) => {
      const actionId = createDashboardEditorShellActionId("copy-reference");
      const source = actionOptions.source || "api";
      const adapter = options.referenceAdapter;
      if (!adapter?.copyReference) {
        return blockedActionResult("copy-reference", source, "adapter-unavailable", [itemId], [], actionId);
      }
      const ctx = actionContext(actionId, "copy-reference", source, [itemId]);
      const availability = adapter.canCopyReference
        ? await adapter.canCopyReference(ctx)
        : { available: true };
      if (!availability.available) {
        return blockedActionResult("copy-reference", source, availability.reason || "adapter-unavailable", [itemId], availability.diagnostics || [], actionId);
      }
      const adapterResult = await adapter.copyReference(ctx);
      const result = createDashboardEditorShellResult({
        ok: adapterResult.ok,
        status: adapterResult.ok ? "success" : adapterResult.status || "blocked",
        actionId,
        actionType: "copy-reference",
        source,
        itemIds: [itemId],
        affectedIds: [itemId],
        adapter: {
          stage: "commit",
          ok: adapterResult.ok,
          status: adapterResult.status,
          reason: adapterResult.reason,
          sourceIds: adapterResult.sourceIds,
          newIds: adapterResult.newIds,
          idMap: adapterResult.idMap,
          metadata: adapterResult.metadata,
          diagnostics: adapterResult.diagnostics,
          error: adapterResult.error ? { code: adapterResult.error.code, message: adapterResult.error.message } : undefined
        },
        diagnostics: adapterResult.diagnostics || []
      });
      emitShellResult(emit, result, profileContext());
      return result;
    },

    pasteWidgetReference: async (target?: Event | DashboardEditorShellPositionInput | null, pasteOptions: DashboardEditorShellPasteOptions = {}) => {
      if (!options.referenceAdapter?.preparePasteReference) {
        return blockedActionResult("paste-reference", pasteOptions.source || "api", "adapter-unavailable");
      }
      const placementIntent = normalizePlacementIntent(target, pasteOptions);
      const strategy = normalizePlacementStrategy(pasteOptions, "cursor");
      const position = resolvePlacementPosition(target, pasteOptions, "cursor");
      if (!position.ok) return blockedActionResult("paste-reference", pasteOptions.source || "api", position.reason, [], position.diagnostics);
      return executeEditorMutation("paste-reference", {
        type: "add",
        payload: {
          item: { i: `reference-${Date.now().toString(36)}`, x: position.position.x, y: position.position.y, w: pasteOptions.itemSize?.w || 2, h: pasteOptions.itemSize?.h || 2 },
          strategy,
          cursor: { x: position.position.x, y: position.position.y },
          cols: getRuntime()?.gridSettings?.columns || 12,
          maxRows: (getRuntime()?.gridSettings as Record<string, unknown> | undefined)?.maxRows || Infinity,
          list: position.position.list,
          placementIntent,
          placementAnchor: placementIntent === "here" ? "top-left" : undefined
        }
      }, {
        source: pasteOptions.source || "api",
        position: position.position,
        contextExtra: { placementIntent },
        prepare: async ctx => {
          const prepared = await prepareReferenceMutation("preparePasteReference")?.(ctx);
          if (prepared && "kind" in prepared && prepared.newIds?.[0]) {
            ctx.payload = { itemId: prepared.newIds[0] };
          }
          return prepared;
        },
        commit: commitReferenceMutation,
        rollback: rollbackReferenceMutation
      });
    },

    replaceReferenceWithWidgetCopy: async (itemId: string, actionOptions: DashboardEditorShellActionOptions = {}) => {
      if (!options.referenceAdapter?.prepareReplaceReferenceWithWidgetCopy) {
        return blockedActionResult("replace-reference", actionOptions.source || "api", "adapter-unavailable", [itemId]);
      }
      const source = actionOptions.source || "api";
      const actionId = createDashboardEditorShellActionId("replace-reference");
      const ctx = actionContext(actionId, "replace-reference", source, [itemId]);
      return runDashboardEditorShellTransaction({
        actionId,
        actionType: "replace-reference",
        source,
        itemIds: [itemId],
        context: ctx,
        profile: profileContext(),
        emit,
        prepare: prepareReferenceMutation("prepareReplaceReferenceWithWidgetCopy"),
        mutate: prepared => ({
          status: "success",
          affectedIds: prepared?.newIds?.length ? prepared.newIds : [itemId],
          data: { sourceItemId: itemId, newItemId: prepared?.newIds?.[0] }
        }),
        commit: commitReferenceMutation,
        rollback: rollbackReferenceMutation
      });
    },

    openWidgetPalette: async (target?: Event | DashboardEditorShellPositionInput | null, paletteOptions: DashboardEditorShellPaletteOptions = {}) => {
      const actionId = createDashboardEditorShellActionId("open-palette");
      const source = paletteOptions.source || "api";
      if (!options.palette?.open) {
        return blockedActionResult("open-palette", source, "adapter-unavailable", [], [], actionId);
      }
      const placementIntent = normalizePlacementIntent(target, paletteOptions);
      const position = resolvePlacementPosition(target, paletteOptions, "cursor");
      const ctx = actionContext(actionId, "open-palette", source, [], position.ok ? position.position : undefined, { placementIntent });
      const guard = await runGuards(ctx);
      if (guard) {
        return blockedActionResult("open-palette", source, guard.reason || "guard-blocked", [], guard.diagnostics || [], actionId);
      }
      const opened = await options.palette.open(ctx);
      if (opened && typeof opened === "object" && "ok" in opened && !opened.ok) {
        return blockedActionResult("open-palette", source, opened.reason || "adapter-rejected", [], opened.diagnostics || [], actionId);
      }
      const templates = Array.isArray(opened)
        ? opened
        : opened && typeof opened === "object" && !("ok" in opened)
          ? [opened]
          : [];
      if (templates.length && paletteOptions.autoAddReturnedTemplate !== false) {
        return actions.addWidgetFromTemplate(templates[0], position.ok ? position.position : null, {
          source: "palette",
          strategy: paletteOptions.strategy,
          placementIntent,
          placementMode: paletteOptions.placementMode
        });
      }
      const result = createDashboardEditorShellResult({
        ok: true,
        status: "success",
        actionId,
        actionType: "open-palette",
        source,
        itemIds: [],
        affectedIds: [],
        position: position.ok ? position.position : undefined,
        data: opened,
        diagnostics: position.ok ? position.diagnostics : position.diagnostics
      });
      emitShellResult(emit, result, profileContext());
      return result;
    },

    addWidgetFromTemplate: async (template: DashboardEditorShellWidgetTemplate, target?: Event | DashboardEditorShellPositionInput | null, actionOptions: DashboardEditorShellAddWidgetOptions = {}) => {
      const placementIntent = normalizePlacementIntent(target, actionOptions);
      const strategy = normalizePlacementStrategy(actionOptions, "cursor");
      const position = resolvePlacementPosition(target, { ...actionOptions, itemSize: { w: template.w || 2, h: template.h || 2 } }, "cursor");
      if (!position.ok) return blockedActionResult("add-widget", actionOptions.source || "api", position.reason, [], position.diagnostics);
      if (actionOptions.placementMode === "interactive") {
        const editor = getEditor();
        const source = actionOptions.source || "api";
        const actionId = createDashboardEditorShellActionId("add-widget");
        if (!editor) return blockedActionResult("add-widget", source, "missing-editor");
        const result = await editor.beginPlacement({
          source: "template",
          commandType: "add",
          items: [{
            ...template,
            i: template.i || template.id,
            x: isFiniteNumber(template.x) ? template.x : position.position.x,
            y: isFiniteNumber(template.y) ? template.y : position.position.y,
            w: template.w || 2,
            h: template.h || 2
          }],
          editorMetaById: template.id || template.i
            ? {
                [String(template.i || template.id)]: {
                  label: template.label,
                  data: template.metadata
                }
              }
            : undefined,
          strategy,
          ...placementCollisionOptions(actionOptions),
          placementIntent,
          placementAnchor: placementIntent === "here" ? "top-left" : undefined,
          cursor: {
            x: position.position.x,
            y: position.position.y,
            source: position.position.source === "event" ? "menu" : "api",
            clientX: position.position.clientX,
            clientY: position.position.clientY
          },
          cols: getRuntime()?.gridSettings?.columns || position.position.cols || 12,
          maxRows: isFiniteNumber((getRuntime()?.gridSettings as Record<string, unknown> | undefined)?.maxRows)
            ? (getRuntime()?.gridSettings as Record<string, number>).maxRows
            : Infinity,
          origin: "dashboard-editor-shell"
        });
        if (!result.session) {
          return blockedActionResult("add-widget", source, result.blocked?.reason || "invalid-input", result.blocked?.itemIds || []);
        }
        rememberPendingPlacementCommit(result.session, {
          actionId,
          actionType: "add-widget",
          source,
          position: position.position,
          contextExtra: { placementIntent, template }
        });
        return placementSessionActionResult("add-widget", source, result.session, position.position, actionId);
      }
      const prepare = prepareWidgetMutation("prepareAddWidget");
      return executeEditorMutation("add-widget", {
        type: "add",
        payload: {
          item: {
            ...template,
            i: template.i || template.id,
            x: isFiniteNumber(template.x) ? template.x : position.position.x,
            y: isFiniteNumber(template.y) ? template.y : position.position.y,
            w: template.w || 2,
            h: template.h || 2
          },
          strategy,
          ...placementCollisionOptions(actionOptions),
          cursor: { x: position.position.x, y: position.position.y },
          cols: getRuntime()?.gridSettings?.columns || 12,
          maxRows: (getRuntime()?.gridSettings as Record<string, unknown> | undefined)?.maxRows || Infinity,
          list: position.position.list,
          placementIntent,
          placementAnchor: placementIntent === "here" ? "top-left" : undefined
        }
      }, {
        source: actionOptions.source || "api",
        position: position.position,
        contextExtra: { template, payload: template.payload, placementIntent },
        prepare,
        commit: commitWidgetMutation,
        rollback: rollbackWidgetMutation
      }).then(result => {
        const firstId = result.affectedIds[0];
        if (result.ok && firstId) {
          void actions.selectItem(firstId, { source: actionOptions.source || "api" });
          void actions.highlightItem(firstId, { source: actionOptions.source || "api", durationMs: 1200 });
        }
        return result;
      });
    },

    handleExternalDrop: async (payload: DashboardEditorShellDropPayload, event: DragEvent | PointerEvent, dropOptions: DashboardEditorShellPlacementOptions = {}) => {
      const position = getEventPosition(event, { source: "drop" });
      if (!position.ok) return blockedActionResult("external-drop", "drop", position.reason, [], position.diagnostics);
      if (payload.preview) {
        const result = createDashboardEditorShellResult({
          ok: true,
          status: "success",
          actionId: createDashboardEditorShellActionId("external-drop"),
          actionType: "external-drop",
          source: "drop",
          itemIds: [],
          affectedIds: [],
          position: position.position,
          data: { preview: true, payload: payload.metadata },
          diagnostics: position.diagnostics
        });
        emitShellResult(emit, result, profileContext());
        return result;
      }
      return actions.addWidgetFromTemplate(payload.template || { w: 2, h: 2, payload: payload.payload }, position.position, {
        source: dropOptions.source || "drop",
        strategy: dropOptions.strategy
      });
    },

    moveAllWidgets: async (dx: number, dy: number, moveOptions: DashboardEditorShellMoveAllOptions = {}) => {
      const actionId = createDashboardEditorShellActionId("move-all");
      const source = moveOptions.source || "api";
      const runtime = getRuntime();
      const document = getDocument();
      if (!runtime) return blockedActionResult("move-all", source, "missing-runtime", [], [], actionId);
      if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) {
        return blockedActionResult("move-all", source, "invalid-input", [], [], actionId);
      }
      const ctx = actionContext(actionId, "move-all", source, runtime.activeItemIds);
      const guard = await runGuards(ctx);
      if (guard) return blockedActionResult("move-all", source, guard.reason || "guard-blocked", runtime.activeItemIds, guard.diagnostics || [], actionId);
      if (document) {
        const translated = translateDashboardLayout(document, {
          layoutId: runtime.layoutId,
          profileId: runtime.resolvedProfileId,
          dx,
          dy,
          clampNegative: moveOptions.clampNegative !== false,
          policy: moveOptions.repair,
          createMissingProfile: options.createMissingProfileOnEdit
        });
        const diagnostics = translated.diagnostics.map(diagnostic =>
          createDashboardEditorShellDiagnostic(
            diagnostic.code,
            diagnostic.level,
            diagnostic.message,
            {
              actionId,
              actionType: "move-all",
              source,
              itemId: diagnostic.itemId,
              layoutId: diagnostic.layoutId || runtime.layoutId,
              resolvedProfileId: diagnostic.profileId || runtime.resolvedProfileId,
              targetView: diagnostic.targetView || runtime.targetView,
              path: diagnostic.path,
              details: diagnostic.details
            }
          )
        );
        if (translated.ok) {
          maybeUpdateInternalDocument(translated.document);
          emitDocumentChange(actionId, translated.document, runtime);
        }
        const result = createDashboardEditorShellResult({
          ok: translated.ok,
          status: translated.ok ? (translated.operation.status === "noop" ? "noop" : "success") : "blocked",
          actionId,
          actionType: "move-all",
          source,
          itemIds: runtime.activeItemIds,
          affectedIds: translated.operation?.affectedIds || runtime.activeItemIds,
          writeResult: translated.ok
            ? { ok: true, document: translated.document, diagnostics: translated.diagnostics }
            : { ok: false, document: translated.document, error: translated.error, diagnostics: translated.diagnostics },
          proposedDocument: translated.document,
          patches: translated.operation?.patches,
          data: {
            requestedDelta: { dx, dy },
            operation: translated.operation
          },
          diagnostics
        });
        emitShellResult(emit, result, profileContext());
        return result;
      }
      return executeEditorMutation("move-all", {
        type: "move",
        targetIds: runtime.activeItemIds,
        payload: { dx, dy, cols: runtime.gridSettings.columns }
      }, {
        source,
        itemIds: runtime.activeItemIds
      });
    },

    undo: async (actionOptions: DashboardEditorShellActionOptions = {}) =>
      executeHistoryMutation("undo", actionOptions),

    redo: async (actionOptions: DashboardEditorShellActionOptions = {}) =>
      executeHistoryMutation("redo", actionOptions),

    bindKeyboard: (target?: HTMLElement | Window | Document) => {
      const keyboardOptions = options.keyboard && typeof options.keyboard === "object"
        ? options.keyboard
        : {};
      const resolvedTarget = target ||
        keyboardOptions.target ||
        (typeof window !== "undefined" ? window : null);
      const actualTarget = typeof resolvedTarget === "string" && typeof document !== "undefined"
        ? document.querySelector(resolvedTarget) || window
        : resolvedTarget;
      if (!actualTarget || typeof (actualTarget as Window).addEventListener !== "function") {
        return () => {};
      }
      const handleKeydown = (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (shouldIgnoreKeyboardEvent(keyboardEvent, keyboardOptions)) return;
        const platform = resolveKeyboardPlatform(keyboardOptions.platform);
        const shortcuts = keyboardOptions.shortcuts || defaultKeyboardShortcuts;
        const shortcut = shortcuts.find(candidate => shortcutMatches(keyboardEvent, candidate, platform));
        if (!shortcut) return;
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        keyboardEvent.stopImmediatePropagation();
        const source = shortcut.source || "keyboard";
        const selected = getEditor()?.selection.value.selectedIds || [];
        const placementOptions = (defaults: DashboardEditorShellPlacementOptions = {}) =>
          resolveKeyboardPlacementOptions(keyboardOptions, shortcut, defaults, source);
        const run = async () => {
          if (shortcut.action === "copy-widget") {
            return actions.copyWidget(selected, { source });
          }
          if (shortcut.action === "cut-widget") {
            return actions.cutWidget(selected, { source });
          }
          if (shortcut.action === "copy-reference") {
            return selected[0]
              ? actions.copyWidgetReference(selected[0], { source })
              : blockedActionResult("copy-reference", source, "selection-count");
          }
          if (shortcut.action === "paste-widget" || shortcut.action === "paste") {
            return actions.pasteWidget(null, placementOptions());
          }
          if (shortcut.action === "place-clipboard") {
            return actions.placeClipboard(null, placementOptions({
              strategy: "cursor",
              placementIntent: "here",
              placementMode: "interactive"
            }));
          }
          if (shortcut.action === "paste-reference") {
            return actions.pasteWidgetReference(null, placementOptions({
              strategy: options.menu?.defaultReferencePasteStrategy
            }));
          }
          if (shortcut.action === "remove-widget") return actions.removeWidget(selected, { source });
          if (shortcut.action === "undo") return actions.undo({ source });
          if (shortcut.action === "redo") return actions.redo({ source });
          if (shortcut.action === "open-palette") {
            return actions.openWidgetPalette(null, placementOptions({
              strategy: options.menu?.defaultAddStrategy
            }));
          }
          if (shortcut.action === "prepare-dashboard-menu") {
            actions.prepareDashboardContextMenu(null, { source });
            return null;
          }
          if (shortcut.action === "move-all") {
            const step = keyboardOptions.moveAllStep || { dx: 0, dy: 1 };
            return actions.moveAllWidgets(step.dx, step.dy, { source });
          }
          return null;
        };
        void run().then(result => {
          if (result && !result.ok) {
            options.onMessage?.({
              code: result.diagnostics[0]?.code || result.status,
              level: result.status === "error" ? "error" : "warning",
              message: result.diagnostics[0]?.message || `Action ${result.actionType} was not applied.`,
              itemIds: result.itemIds,
              recoverable: result.status !== "error"
            });
          }
        });
      };
      (actualTarget as Window).addEventListener("keydown", handleKeydown, true);
      const cleanup = () => (actualTarget as Window).removeEventListener("keydown", handleKeydown, true);
      cleanupHandles.push(cleanup);
      return cleanup;
    },

    stop: () => stop()
  };

  const bindPointerTracking = (element: HTMLElement | null) => {
    if (!element || typeof element.addEventListener !== "function") return () => {};
    const update = (event: Event) => {
      const position = getEventPosition(event, { source: "pointer" });
      if (position.ok) {
        state.value = { ...state.value, lastPointerPosition: position.position };
      }
    };
    element.addEventListener("pointermove", update);
    element.addEventListener("mousemove", update);
    element.addEventListener("contextmenu", update);
    return () => {
      element.removeEventListener("pointermove", update);
      element.removeEventListener("mousemove", update);
      element.removeEventListener("contextmenu", update);
    };
  };

  stopHandles.push(watch(
    () => [
      getRuntime(),
      getEditor()?.selection.value,
      getEditor()?.dirty.value,
      getEditor()?.conflict.value,
      getEditor()?.lastResult.value,
      unref(options.mode),
      getGridElement()
    ],
    refreshState,
    { deep: true, immediate: true }
  ));

  stopHandles.push(watch(
    () => getEditor()?.lastResult.value,
    result => {
      if (result) void finalizePendingPlacementCommit(result);
    }
  ));

  let editorSubscriptionCleanup: (() => void) | null = null;
  const handleEditorEvent = (event: GridEditorEvent) => {
    if (!shellManagedWriteBack()) return;
    if (event.type === "command-start") {
      if (pendingShellCommandIds.has(event.command.id || "")) return;
      if (!syntheticActionTypeForCommand(event.command)) return;
      const editor = getEditor();
      if (editor && event.command.id) {
        commandRollbackCheckpoints.set(
          event.command.id,
          editor.createRollbackCheckpoint("shell-managed-command-start")
        );
      }
      return;
    }
    if (event.type === "command-blocked" || event.type === "command-error") {
      commandRollbackCheckpoints.delete(event.result.id);
      return;
    }
    if (event.type === "command-commit") {
      if (pendingShellCommandIds.has(event.result.id)) return;
      void finalizeShellManagedCommandCommit(event.command, event.result);
    }
  };
  stopHandles.push(watch(
    () => getEditor(),
    editor => {
      editorSubscriptionCleanup?.();
      editorSubscriptionCleanup = null;
      if (editor) editorSubscriptionCleanup = editor.subscribe(handleEditorEvent);
    },
    { immediate: true }
  ));

  let pointerCleanup: (() => void) | null = null;
  stopHandles.push(watch(
    () => getGridElement(),
    element => {
      pointerCleanup?.();
      pointerCleanup = bindPointerTracking(element);
    },
    { immediate: true }
  ));

  if (options.keyboard && options.keyboard.enabled !== false) {
    cleanupHandles.push(actions.bindKeyboard());
  }

  const stop = () => {
    if (stopped) return;
    stopped = true;
    stopHandles.forEach(handle => handle());
    cleanupHandles.splice(0).forEach(handle => handle());
    editorSubscriptionCleanup?.();
    editorSubscriptionCleanup = null;
    pointerCleanup?.();
    pointerCleanup = null;
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
    const actionId = createDashboardEditorShellActionId("cleanup");
    state.value = {
      ...state.value,
      menu: null,
      highlightedId: null,
      lastMenuPosition: null
    };
    const diagnostics = [createDashboardEditorShellDiagnostic(
      "shell-cleanup",
      "info",
      "Dashboard editor shell cleanup completed.",
      { actionId, actionType: "cleanup", source: "lifecycle" }
    )];
    emit({ type: "cleanup", actionId, diagnostics });
  };

  if (getCurrentInstance()) {
    onBeforeUnmount(stop);
  }

  refreshState();

  return {
    state: readonly(state) as Readonly<Ref<DashboardEditorShellState>>,
    actions,
    stop
  };
}
