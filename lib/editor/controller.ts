import { computed, ref, watch, type Ref, type WatchStopHandle } from "vue";
import { deepEqual } from "fast-equals";
import {
  cloneLayout,
  cloneLayoutItem,
  getAllCollisions,
  getLayoutItem,
  type Layout,
  type LayoutItem,
  type CompactType,
  type ResizeHandleAxis
} from "../utils";
import {
  executeLayoutOperation
} from "../layout-engine";
import type {
  GridLayoutEngineOptions,
  LayoutBlockedReason,
  LayoutOperation,
  LayoutOperationResult,
  LayoutResizeConstraint
} from "../layout-engine";
import {
  cloneLayoutsMap,
  type GridLayoutPersistenceController,
  type LayoutsMap
} from "../persistence";
import {
  applyEditorMetadataPatches,
  patchEditorMeta,
  removeOrphanEditorMeta,
  sanitizeEditorMetaById
} from "./metadata";
import {
  clearEditorSelection,
  createGridEditorSelection,
  getNextFocusableId,
  sanitizeSelectionForLayout,
  updateSelectionByIntent
} from "./selection";
import {
  createGridEditorHistory,
  createGridEditorHistoryEntry
} from "./history";
import {
  createGridEditorClipboardPayload,
  GridEditorClipboardError,
  internalGridEditorClipboard,
  normalizeGridEditorClipboardItemsForTarget,
  systemClipboardAdapter
} from "./clipboard";
import {
  checkGridEditorCommand,
  blockedGridEditorCommandResult,
  collectAffectedIds,
  collectEditorLayoutPatches,
  createGridEditorCommandResult,
  defaultGridEditorHistoryMode,
  errorGridEditorCommandResult,
  isHistoryCommand,
  isLayoutCommand,
  isMetadataCommand,
  isPersistenceCommand,
  isSectionRowCommand,
  normalizeGridEditorCommand,
  normalizeGridEditorHistoryPolicy,
  shouldRecordGridEditorHistory,
  type NormalizedGridEditorCommand
} from "./commands";
import {
  createGridEditorCommandKernel
} from "./commandKernel";
import {
  requireGridEditorCommandDescriptor
} from "./commandRegistry";
import {
  createGridEditorPersistenceBridge
} from "./persistenceBridge";
import {
  applyGridEditorAlign,
  applyGridEditorDistribute,
  applyGridEditorTidy
} from "./geometryCommands";
import {
  placeGridEditorNewItems,
  type GridEditorPlacementResult
} from "./placement";
import {
  buildGridEditorPlacementCommitCommand,
  cancelGridEditorPlacementSession,
  createGridEditorPlacementSession,
  updateGridEditorPlacementSession,
  type GridEditorBeginPlacementInput,
  type GridEditorPlacementSessionResult,
  type GridEditorResolvedPastePayload
} from "./placementSession";
import {
  deriveGridEditorToolbarState
} from "./toolbar";
import {
  createGridEditorTransactionPreview
} from "./transactions";
import {
  emptyGridEditorSectionRows,
  normalizeGridEditorSectionRows
} from "./sectionRows";
import type {
  GridEditorClipboardAdapter,
  GridEditorCommand,
  GridEditorBlockedReason,
  GridEditorCommandResult,
  GridEditorController,
  GridEditorDerivedState,
  GridEditorAlignPayload,
  GridEditorDistributePayload,
  GridEditorEvent,
  GridEditorGuideState,
  GridEditorHistoryController,
  GridEditorHistorySnapshot,
  GridEditorHistoryPolicy,
  GridEditorMetaById,
  GridEditorMetadataPatch,
  GridEditorMode,
  GridEditorPasteStrategy,
  GridEditorTransaction,
  GridEditorTransactionPreview,
  GridEditorTidyPayload,
  GridEditorSelectionState,
  GridEditorSectionRowCommandPayload,
  GridEditorSectionRowState,
  GridEditorClipboardSourceContext,
  UseGridEditorOptions
} from "./types";

const EMPTY_GUIDES: GridEditorGuideState = {
  activeId: null,
  guides: [],
  displayGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
};

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const cloneMeta = (metaById: GridEditorMetaById): GridEditorMetaById =>
  sanitizeEditorMetaById(metaById);

const cloneSelection = (
  selection: GridEditorSelectionState
): GridEditorSelectionState => ({
  ...selection,
  selectedIds: selection.selectedIds.slice()
});

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

const defaultIdGenerator = (
  baseId: string,
  existingIds: Set<string>
): string => {
  let index = 1;
  let id = `${baseId}-copy`;
  while (existingIds.has(id)) {
    index += 1;
    id = `${baseId}-copy-${index}`;
  }
  existingIds.add(id);
  return id;
};

const isPersistenceController = (
  value: UseGridEditorOptions["persistence"]
): value is GridLayoutPersistenceController<Layout | LayoutsMap> =>
  Boolean(value && typeof value === "object" && "save" in value && "commit" in value);

const isFiniteGridNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clampGridSize = (value: unknown, fallback: number): number =>
  Math.max(1, Math.floor(isFiniteGridNumber(value) ? value : fallback));

const getPayloadRecord = (command: GridEditorCommand): Record<string, unknown> =>
  command.payload && typeof command.payload === "object"
    ? command.payload as Record<string, unknown>
    : {};

const isCompactType = (value: unknown): value is CompactType =>
  value === "vertical" || value === "horizontal" || value === null;

const isPasteStrategy = (value: unknown): value is GridEditorPasteStrategy =>
  value === "offset" ||
  value === "cursor" ||
  value === "nearest-fit" ||
  value === "first-fit" ||
  value === "insert-top-shift";

const isResizeHandleAxis = (value: unknown): value is ResizeHandleAxis =>
  value === "s" ||
  value === "w" ||
  value === "e" ||
  value === "n" ||
  value === "sw" ||
  value === "nw" ||
  value === "se" ||
  value === "ne";

const mapLayoutBlockedReason = (
  reason: LayoutBlockedReason | undefined
): GridEditorBlockedReason => {
  if (!reason) return "invalid-input";
  return reason;
};

const makeUnsupportedLayoutResult = (
  id: string,
  layout: Layout,
  operation: LayoutOperation
): LayoutOperationResult => {
  const itemIds = operation.type === "groupMove"
    ? operation.ids.slice()
    : "id" in operation
      ? [operation.id]
      : [];
  return {
    id,
    status: "blocked",
    layout,
    patches: [],
    affectedIds: [],
    collisions: [],
    blocked: {
      reason: "unsupported",
      itemIds
    },
    diagnostics: {
      operationId: id,
      operationType: operation.type,
      phase: "commit",
      layoutSize: layout.length,
      affectedCount: 0,
      collisionCount: 0,
      indexHit: false,
      executorKind: "main-thread",
      durationMs: 0
    }
  };
};

const mapIds = (
  items: Layout,
  metaById: GridEditorMetaById,
  existingIds: Set<string>,
  idGenerator: (baseId: string, existingIds: Set<string>) => string
): {
  items: Layout;
  metaById: GridEditorMetaById;
} => {
  const mappedMeta: GridEditorMetaById = {};
  const mappedItems = items.map(item => {
    const id = idGenerator(item.i, existingIds);
    if (metaById[item.i]) mappedMeta[id] = { ...metaById[item.i] };
    return { ...cloneLayoutItem(item), i: id };
  });
  return { items: mappedItems, metaById: mappedMeta };
};

export const createGridEditorController = (
  options: UseGridEditorOptions
): GridEditorController => {
  const kind = options.kind || (options.layouts ? "responsive" : "layout");
  const internalLayout = ref<Layout>([]);
  const internalLayouts = ref<LayoutsMap>({});
  const layoutRef = options.layout || internalLayout;
  const layoutsRef = options.layouts || internalLayouts;
  const breakpointRef = options.breakpoint || ref("default");
  const modeMissing = !options.mode && !options.defaultMode;
  const internalMode = ref<GridEditorMode>(options.defaultMode || "view");
  const mode: Ref<GridEditorMode> = options.mode || internalMode;
  const internalMeta = ref<GridEditorMetaById>(
    sanitizeEditorMetaById(options.defaultEditorMetaById)
  );
  const editorMetaById: Ref<GridEditorMetaById> = options.editorMetaById || internalMeta;
  const internalSectionRows = ref<GridEditorSectionRowState>(
    options.defaultSectionRows || emptyGridEditorSectionRows()
  );
  const sectionRows: Ref<GridEditorSectionRowState> = options.sectionRows || internalSectionRows;
  const selection = ref<GridEditorSelectionState>(
    createGridEditorSelection(
      options.selectedIds?.value || options.defaultSelectedIds || [],
      options.selectedIds ? "external" : "api"
    )
  );
  const conflict = ref(null) as Ref<GridEditorController["conflict"]["value"]>;
  const guides = ref<GridEditorGuideState>({ ...EMPTY_GUIDES });
  const placementSession = ref(null) as Ref<GridEditorController["placementSession"]["value"]>;
  const lastResult = ref<GridEditorCommandResult | null>(null);
  const interaction = ref<"dragging" | "resizing" | "keyboardEditing" | null>(null);
  const saveFailed = ref(false);
  const savePending = ref(false);
  const focusId = ref<string | null>(selection.value.activeId);
  const stopped = ref(false);
  const stopHandles: WatchStopHandle[] = [];
  let stateRevision = 0;
  let internalStateWriteDepth = 0;

  const withInternalStateWrite = <T>(fn: () => T): T => {
    internalStateWriteDepth += 1;
    try {
      return fn();
    } finally {
      internalStateWriteDepth -= 1;
    }
  };

  const emit = (event: GridEditorEvent) => {
    try {
      options.onEvent?.(event);
    } catch (error) {
      if (event.type !== "editor-error") {
        try {
          options.onEvent?.({
            type: "editor-error",
            code: "editor-event-listener-error",
            message: "Grid editor event listener failed.",
            details: error
          });
        } catch {
          // Event listeners are observational; listener failures must not change command results.
        }
      }
    }
  };

  const getLayout = (): Layout => kind === "responsive"
    ? cloneLayout(layoutsRef.value[breakpointRef.value] || [])
    : cloneLayout(layoutRef.value);

  const setLayout = (layout: Layout) => {
    stateRevision += 1;
    withInternalStateWrite(() => {
      if (kind === "responsive") {
        layoutsRef.value = {
          ...layoutsRef.value,
          [breakpointRef.value]: cloneLayout(layout)
        };
        if (options.layout) {
          layoutRef.value = cloneLayout(layout);
        }
      } else {
        layoutRef.value = cloneLayout(layout);
      }
    });
  };

  const getLayouts = (): LayoutsMap => kind === "responsive"
    ? cloneLayoutsMap(layoutsRef.value)
    : { default: cloneLayout(layoutRef.value) };

  const setLayouts = (layouts: LayoutsMap, breakpoint: string = breakpointRef.value) => {
    stateRevision += 1;
    withInternalStateWrite(() => {
      layoutsRef.value = cloneLayoutsMap(layouts);
      breakpointRef.value = breakpoint;
      if (options.layout) {
        layoutRef.value = cloneLayout(layouts[breakpoint] || []);
      }
    });
  };

    const createSnapshot = (): GridEditorHistorySnapshot => {
      if (kind === "responsive") {
        return {
          kind: "responsive",
          layouts: getLayouts(),
          breakpoint: breakpointRef.value,
          editorMetaById: cloneMeta(editorMetaById.value),
          sectionRows: cloneSectionRows(sectionRows.value),
          selection: cloneSelection(selection.value),
          focusId: focusId.value
        };
      }
      return {
        kind: "layout",
        layout: getLayout(),
        editorMetaById: cloneMeta(editorMetaById.value),
        sectionRows: cloneSectionRows(sectionRows.value),
        selection: cloneSelection(selection.value),
        focusId: focusId.value
      };
    };

  const applySnapshot = (snapshot: GridEditorHistorySnapshot) => {
      stateRevision += 1;
      if (snapshot.kind === "responsive") {
        setLayouts(snapshot.layouts, snapshot.breakpoint);
      } else {
        setLayout(snapshot.layout);
      }
      editorMetaById.value = cloneMeta(snapshot.editorMetaById);
      sectionRows.value = cloneSectionRows(snapshot.sectionRows);
      selection.value = cloneSelection(snapshot.selection);
      focusId.value = snapshot.focusId;
    };

  const lastSavedSnapshot = ref<GridEditorHistorySnapshot>(createSnapshot());
  const history: GridEditorHistoryController | null =
    options.history === false
      ? null
      : options.history || createGridEditorHistory();
  history?.replacePresent(createSnapshot());

  const dirty = computed(() => !deepEqual(createSnapshot(), lastSavedSnapshot.value));

  const state = computed<GridEditorDerivedState>(() => {
    if (conflict.value) return "conflict";
    if (savePending.value) return "savePending";
    if (saveFailed.value) return "saveFailed";
    if (interaction.value) return interaction.value;
    if (placementSession.value) return "placing";
    if (mode.value === "view") return "viewing";
    return dirty.value ? "editingDirty" : "editingClean";
  });

  const persistenceController = isPersistenceController(options.persistence)
    ? options.persistence
    : null;
  const persistenceBridge = createGridEditorPersistenceBridge({
    getEditorMetaById: () => editorMetaById.value,
    getSectionRows: () => sectionRows.value,
    setEditorMetaById: (meta, reason) => {
      stateRevision += 1;
      editorMetaById.value = sanitizeEditorMetaById(meta, { layout: getLayout() });
      if (reason === "save-success" || reason === "load-success") {
        lastSavedSnapshot.value = createSnapshot();
      }
    },
    setSectionRows: (rows, reason) => {
      stateRevision += 1;
      sectionRows.value = {
        version: 1,
        items: rows.items,
        itemMembership: rows.itemMembership
      };
      if (reason === "save-success" || reason === "load-success") {
        lastSavedSnapshot.value = createSnapshot();
      }
    },
    persistence: persistenceController,
    onSaveStateChange: input => {
      savePending.value = input.status === "saving";
      saveFailed.value = input.status === "error";
      emit({
        type: "save-state-change",
        status: input.status as never,
        dirty: input.dirty,
        error: input.error
      });
    },
    onConflict: nextConflict => {
      stateRevision += 1;
      conflict.value = nextConflict;
      emit({ type: "conflict", conflict: nextConflict });
    },
    onError: (code, message, details) => {
      emit({ type: "editor-error", code, message, details });
    }
  });

  const setSelection = (
    nextSelection: GridEditorSelectionState,
    requested = false
  ): GridEditorSelectionState => {
    const previous = selection.value;
    const normalized = sanitizeSelectionForLayout(
      nextSelection,
      getLayout(),
      editorMetaById.value,
      nextSelection.source
    );

    if (options.selectedIds) {
      emit({
        type: "selection-change",
        selection: normalized,
        previous,
        requested: true
      });
      return previous;
    }

    if (deepEqual(previous, normalized)) return previous;
    stateRevision += 1;
    selection.value = normalized;
    focusId.value = normalized.activeId;
    emit({
      type: "selection-change",
      selection: normalized,
      previous,
      requested
    });
    return normalized;
  };

  const finalize = (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    result: GridEditorCommandResult,
    startedAt: number,
    guardMs = result.diagnostics?.guardMs || 0
  ): GridEditorCommandResult => {
    const historyPolicy = normalizeGridEditorHistoryPolicy(
      command.history,
      defaultGridEditorHistoryMode(command.type)
    );
    const finalResult = {
      ...result,
      diagnostics: {
        ...result.diagnostics,
        durationMs: now() - startedAt,
        guardMs,
        historyMode: result.diagnostics?.historyMode || historyPolicy.mode,
        source: result.diagnostics?.source || command.source,
        origin: result.diagnostics?.origin || command.origin
      }
    };
    lastResult.value = finalResult;
    if (finalResult.status === "blocked" || finalResult.status === "cancelled" || finalResult.status === "timeout") {
      emit({ type: "command-blocked", command, result: finalResult });
    } else if (finalResult.status === "error") {
      emit({ type: "command-error", command, result: finalResult });
    } else {
      emit({ type: "command-commit", command, result: finalResult });
    }
    if (interaction.value === "keyboardEditing" && command.source === "keyboard") {
      interaction.value = null;
    }
    return finalResult;
  };

  const commitHistory = (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    before: GridEditorHistorySnapshot,
    result: GridEditorCommandResult,
    afterSnapshot?: GridEditorHistorySnapshot
  ): GridEditorCommandResult => {
    const historyPolicy = normalizeGridEditorHistoryPolicy(
      command.history,
      defaultGridEditorHistoryMode(command.type)
    );
    result.diagnostics = {
      durationMs: result.diagnostics?.durationMs || 0,
      ...result.diagnostics,
      historyMode: historyPolicy.mode,
      source: command.source,
      origin: command.origin
    };
    if (!history) {
      return result;
    }
    if (historyPolicy.mode === "clear") {
      history.clear(createSnapshot());
      return result;
    }
    if (historyPolicy.mode === "replace") {
      history.replacePresent(createSnapshot(), {
        preserveRedoStack: historyPolicy.preserveRedoStack
      });
      return result;
    }
    if (
      historyPolicy.mode === "ignore" ||
      !shouldRecordGridEditorHistory(command.type)
    ) {
      return result;
    }
    const after = afterSnapshot || createSnapshot();
    const entry = createGridEditorHistoryEntry({
      commandId: command.id,
      commandType: command.type,
      before,
      after,
      mergeKey: historyPolicy.mergeKey,
      source: command.source,
      origin: command.origin,
      targetIds: result.targetIds,
      affectedIds: result.affectedIds,
      historyMode: historyPolicy.mode
    });
    history.push(entry, {
      preserveRedoStack:
        historyPolicy.preserveRedoStack ||
        historyPolicy.mode === "record-preserveRedoStack"
    });
    result.undo = entry;

    if (kind === "layout") {
      options.legacyHistoryStore?.push(getLayout());
    }
    return result;
  };

  const transactionScopeForCommand = (
    command: ReturnType<typeof normalizeGridEditorCommand>
  ): string => requireGridEditorCommandDescriptor(command.type).mutualExclusionScope || "global";

  const createCommandTransaction = (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    before: GridEditorHistorySnapshot,
    after: GridEditorHistorySnapshot
  ): GridEditorTransaction => {
    const descriptor = requireGridEditorCommandDescriptor(command.type);
    return {
      id: `${command.id}:transaction`,
      commandId: command.id,
      command,
      source: command.source || descriptor.defaultSource || "api",
      origin: command.origin,
      scope: transactionScopeForCommand(command),
      before,
      after,
      preview: createGridEditorTransactionPreview(before, after, {
        risk: descriptor.risk
      }),
      history: normalizeGridEditorHistoryPolicy(
        command.history,
        descriptor.defaultHistory.mode || defaultGridEditorHistoryMode(command.type)
      )
    };
  };

  const maybeEmitTransactionSelectionChange = (
    before: GridEditorHistorySnapshot,
    requestedAfter: GridEditorHistorySnapshot,
    appliedAfter: GridEditorHistorySnapshot
  ) => {
    if (options.selectedIds) {
      if (!deepEqual(before.selection, requestedAfter.selection)) {
        emit({
          type: "selection-change",
          selection: cloneSelection(requestedAfter.selection),
          previous: cloneSelection(before.selection),
          requested: true
        });
      }
      return;
    }

    if (!deepEqual(before.selection, appliedAfter.selection)) {
      emit({
        type: "selection-change",
        selection: cloneSelection(appliedAfter.selection),
        previous: cloneSelection(before.selection)
      });
    }
    if (before.focusId !== appliedAfter.focusId) {
      emit({
        type: "focus-change",
        from: before.focusId,
        to: appliedAfter.focusId,
        reason: "transaction"
      });
    }
  };

  const applyCommandTransaction = (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    before: GridEditorHistorySnapshot,
    requestedAfter: GridEditorHistorySnapshot,
    input: Partial<GridEditorCommandResult> & {
      status?: GridEditorCommandResult["status"];
    } = {}
  ): GridEditorCommandResult => {
    const selectionControlled = Boolean(options.selectedIds);
    const appliedAfter = selectionControlled
      ? snapshotWithDraft(requestedAfter, {
          selection: before.selection,
          focusId: before.focusId
        })
      : requestedAfter;
    const transaction = createCommandTransaction(command, before, appliedAfter);
    const changed = !deepEqual(before, appliedAfter);
    const status = input.status || (changed ? "changed" : "noop");
    const result = createGridEditorCommandResult(command, status, {
      ...input,
      targetIds: input.targetIds || transaction.preview.affectedIds,
      layoutPatches: input.layoutPatches || transaction.preview.layoutPatches,
      metadataPatches: input.metadataPatches || transaction.preview.metadataPatches,
      affectedIds: input.affectedIds || transaction.preview.affectedIds,
      selection: input.selection || appliedAfter.selection,
      diagnostics: {
        durationMs: 0,
        ...input.diagnostics
      }
    });

    if (changed) {
      try {
        applySnapshot(transaction.after);
        maybeEmitTransactionSelectionChange(before, requestedAfter, transaction.after);
      } catch (error) {
        try {
          applySnapshot(transaction.before);
        } catch {
          // If rollback itself fails, preserve the original apply error for diagnostics.
        }
        return errorGridEditorCommandResult(command, "Editor transaction apply failed.", error);
      }
    } else if (selectionControlled) {
      maybeEmitTransactionSelectionChange(before, requestedAfter, transaction.after);
    }

    return commitHistory(command, before, result, transaction.after);
  };

  const resolveLayoutEngineOptions = (
    payload: Record<string, unknown>
  ): GridLayoutEngineOptions | null => {
    if (typeof options.layoutEngineOptions === "function") {
      return options.layoutEngineOptions();
    }
    if (options.layoutEngineOptions) return options.layoutEngineOptions;
    if (!isFiniteGridNumber(payload.cols)) return null;
    return {
      cols: Math.max(1, Math.floor(payload.cols)),
      maxRows: isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity,
      compactType: isCompactType(payload.compactType) ? payload.compactType : "vertical",
      allowOverlap: payload.allowOverlap === true,
      preventCollision: payload.preventCollision === true
    };
  };

  const resolveClipboardTargetCols = (
    payload: Record<string, unknown>
  ): number | undefined => {
    const engineOptions = resolveLayoutEngineOptions(payload);
    if (engineOptions) return engineOptions.cols;
    return isFiniteGridNumber(payload.cols) && payload.cols > 0
      ? Math.floor(payload.cols)
      : undefined;
  };

  const clipboardSourceContext = (
    payload: Record<string, unknown>
  ) => {
    const source: Record<string, unknown> = {};
    const cols = resolveClipboardTargetCols(payload);
    if (cols) source.cols = cols;
    if (typeof payload.breakpoint === "string") source.breakpoint = payload.breakpoint;
    if (typeof payload.layoutId === "string") source.layoutId = payload.layoutId;
    if (typeof payload.viewFormat === "string") source.viewFormat = payload.viewFormat;
    return Object.keys(source).length > 0 ? source as GridEditorClipboardSourceContext : undefined;
  };

  const runLayoutOperation = async (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    layout: Layout,
    operation: LayoutOperation,
    payload: Record<string, unknown>
  ): Promise<LayoutOperationResult> => {
    const operationId = `${command.id}:layout`;
    if (options.layoutOperationRunner) {
      return await options.layoutOperationRunner({
        commandId: command.id,
        layout,
        operation,
        phase: "commit",
        source: command.source || "api"
      });
    }
    const engineOptions = resolveLayoutEngineOptions(payload);
    if (!engineOptions) {
      return makeUnsupportedLayoutResult(operationId, layout, operation);
    }
    return await Promise.resolve(executeLayoutOperation({
      id: operationId,
      phase: "commit",
      layout,
      operation,
      options: engineOptions
    }));
  };

  const resolveResizeConstraint = (
    id: string
  ): LayoutResizeConstraint | undefined => {
    const capability = options.itemCapabilities?.[id];
    const aspectRatio = options.resizeConstraints?.[id] || capability?.resizeConstraint?.aspectRatio;
    const handlePolicy = capability?.resizeConstraint?.handlePolicy || (
      capability?.resizeHandles
        ? {
            allowedHandles: capability.resizeHandles,
            blockedReason: "handle-disabled" as const
          }
        : undefined
    );
    if (!aspectRatio && !handlePolicy) return undefined;
    return { aspectRatio, handlePolicy };
  };

  const readClipboard = async (
    adapter: GridEditorClipboardAdapter
  ) => {
    try {
      return await adapter.read();
    } catch (error) {
      if (adapter !== internalGridEditorClipboard) {
        return internalGridEditorClipboard.read();
      }
      throw error;
    }
  };

  const writeClipboard = async (
    adapter: GridEditorClipboardAdapter,
    payload: ReturnType<typeof createGridEditorClipboardPayload>
  ) => {
    try {
      await adapter.write(payload);
    } catch (error) {
      if (adapter !== internalGridEditorClipboard) {
        await internalGridEditorClipboard.write(payload);
        return;
      }
      throw error;
    }
  };

  const resolveClipboard = (): GridEditorClipboardAdapter => {
    if (!options.clipboard || options.clipboard === "internal") {
      return internalGridEditorClipboard;
    }
    if (options.clipboard === "system") return systemClipboardAdapter();
    return options.clipboard;
  };

  const placementDiagnostics = (
    placement: GridEditorPlacementResult,
    payload?: Record<string, unknown>
  ): GridEditorCommandResult["diagnostics"] => {
    const summary = {
      ...placement.summary,
      collisionPolicy: payload?.collisionPolicy === "layout" || payload?.collisionPolicy === "block"
        ? payload.collisionPolicy
        : placement.summary.collisionPolicy,
      sessionId: typeof payload?.placementSessionId === "string"
        ? payload.placementSessionId
        : placement.summary.sessionId,
      source: typeof payload?.placementSource === "string"
        ? payload.placementSource
        : placement.summary.source
    };
    return {
      durationMs: 0,
      computed: {
        placement: summary
      },
      messages: placement.summary.diagnostics.map(diagnostic => ({
        code: diagnostic.code,
        level: diagnostic.level,
        message: diagnostic.message,
        itemIds: diagnostic.itemIds,
        recoverable: diagnostic.level !== "error"
        }))
    };
  };

  const placementSessionDiagnostics = (
    session: NonNullable<GridEditorController["placementSession"]["value"]>
  ): GridEditorCommandResult["diagnostics"] => ({
    durationMs: 0,
    computed: {
        placement: {
          strategy: session.strategy,
          placementSource: session.strategy,
          collisionPolicy: session.collisionPolicy,
          sessionId: session.id,
          source: session.source,
          insertedIds: session.ghostItems.map(item => item.id),
        shiftedIds: session.affectedOutlines
          .filter(item => item.kind === "shift")
          .map(item => item.id),
        before: session.affectedOutlines.map(item => ({
          id: item.id,
          ...item.before
        })),
        after: session.affectedOutlines.map(item => ({
          id: item.id,
          ...item.after
        })),
        diagnostics: session.diagnostics
      }
    },
    messages: session.diagnostics.map(diagnostic => ({
      code: diagnostic.code,
      level: diagnostic.level,
      message: diagnostic.message,
      itemIds: diagnostic.itemIds,
      recoverable: diagnostic.level !== "error"
    }))
  });

  const blockedPlacementResult = (
    commandType: "add" | "paste",
    reason: GridEditorBlockedReason,
    message: string,
    itemIds: string[] = [],
    diagnostics?: GridEditorCommandResult["diagnostics"]
  ): GridEditorPlacementSessionResult => ({
    status: "blocked",
    blocked: {
      reason,
      itemIds,
      message
    },
    diagnostics: diagnostics || {
      durationMs: 0,
      messages: [{
        code: `grid-editor.placement.${reason}`,
        level: reason === "invalid-input" ? "error" : "warning",
        message,
        itemIds,
        recoverable: reason !== "invalid-input"
      }]
    }
  });

  const prepareAddPlacementInput = (
    input: GridEditorBeginPlacementInput
  ): GridEditorBeginPlacementInput => {
    if (input.commandType && input.commandType !== "add") return input;
    if (input.source === "paste") return input;
    const rawItems = Array.isArray(input.items)
      ? input.items
      : input.item
        ? [input.item]
        : [];
    if (rawItems.length === 0) return input;
    const existingIds = new Set(getLayout().map(item => item.i));
    const idGenerator = options.idGenerator || defaultIdGenerator;
    const metaById = input.editorMetaById || {};
    const nextMetaById: GridEditorMetaById = {};
    const items = rawItems
      .filter(item => item && typeof item === "object")
      .map((item, index) => {
        const sourceId = typeof item.i === "string" && item.i.length > 0
          ? item.i
          : `item-${index + 1}`;
        const id = !existingIds.has(sourceId)
          ? sourceId
          : idGenerator(sourceId, existingIds);
        existingIds.add(id);
        if (metaById[sourceId]) nextMetaById[id] = { ...metaById[sourceId] };
        return {
          ...item,
          i: id,
          x: isFiniteGridNumber(item.x) ? item.x : 0,
          y: isFiniteGridNumber(item.y) ? item.y : 0,
          w: clampGridSize(item.w, 1),
          h: clampGridSize(item.h, 1)
        };
      });
    return {
      ...input,
      commandType: "add",
      item: undefined,
      items,
      editorMetaById: sanitizeEditorMetaById(nextMetaById, { layout: items as Layout })
    };
  };

  const clearPlacementSession = (reason: string) => {
    const active = placementSession.value;
    if (!active) return null;
    placementSession.value = null;
    guides.value = { ...EMPTY_GUIDES };
    emit({ type: "placement-cancel", sessionId: active.id, reason });
    return active;
  };

  const validateGeometryLayout = (
    candidateLayout: Layout,
    ids: string[],
    cols: number,
    maxRows: number
  ): { ok: true } | { ok: false; reason: "bounds" | "maxRows" | "collision"; itemIds: string[] } => {
    for (let i = 0; i < ids.length; i++) {
      const item = getLayoutItem(candidateLayout, ids[i]);
      if (!item) continue;
      if (item.x < 0 || item.y < 0 || item.x + item.w > cols) {
        return { ok: false, reason: "bounds", itemIds: [item.i] };
      }
      if (Number.isFinite(maxRows) && item.y + item.h > maxRows) {
        return { ok: false, reason: "maxRows", itemIds: [item.i] };
      }
      const collisions = getAllCollisions(candidateLayout, item)
        .filter(candidate => candidate.i !== item.i);
      if (collisions.length > 0) {
        return {
          ok: false,
          reason: "collision",
          itemIds: [item.i, ...collisions.map(candidate => candidate.i)]
        };
      }
    }
    return { ok: true };
  };

  const sectionRowBlockForIds = (
    ids: string[],
    sourceLayout: Layout
  ): { reason: "section-row-locked" | "section-row-collapsed"; itemIds: string[] } | null => {
    const resolved = normalizeGridEditorSectionRows(sectionRows.value, sourceLayout);
    const lockedIds: string[] = [];
    const collapsedIds: string[] = [];
    ids.forEach(id => {
      const membership = resolved.itemMembership[id];
      const section = membership?.sectionId ? resolved.items[membership.sectionId] : undefined;
      const row = membership?.rowId ? resolved.items[membership.rowId] : undefined;
      if (section?.locked || row?.locked) lockedIds.push(id);
      else if (section?.collapsed || row?.collapsed) collapsedIds.push(id);
    });
    if (lockedIds.length > 0) return { reason: "section-row-locked", itemIds: lockedIds };
    if (collapsedIds.length > 0) return { reason: "section-row-collapsed", itemIds: collapsedIds };
    return null;
  };

  const itemIdsForSectionRows = (
    rows: ReturnType<typeof normalizeGridEditorSectionRows>,
    ids: string[]
  ): string[] => {
    const idSet = new Set(ids);
    const affected = new Set<string>();
    Object.keys(rows.itemMembership).forEach(itemId => {
      const membership = rows.itemMembership[itemId];
      if (
        (membership.sectionId && idSet.has(membership.sectionId)) ||
        (membership.rowId && idSet.has(membership.rowId))
      ) {
        affected.add(itemId);
      }
    });
    ids.forEach(id => {
      rows.items[id]?.itemIds?.forEach(itemId => affected.add(itemId));
    });
    return Array.from(affected).sort();
  };

  const orderForSectionRow = (
    rows: ReturnType<typeof normalizeGridEditorSectionRows>,
    payload: GridEditorSectionRowCommandPayload
  ): number => {
    if (isFiniteGridNumber(payload.order)) return payload.order;
    const sorted = Object.values(rows.items)
      .slice()
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    const before = payload.beforeId ? rows.items[payload.beforeId] : undefined;
    const after = payload.afterId ? rows.items[payload.afterId] : undefined;
    if (before) {
      const previous = sorted[sorted.findIndex(row => row.id === before.id) - 1];
      return previous ? (previous.order + before.order) / 2 : before.order - 1;
    }
    if (after) {
      const next = sorted[sorted.findIndex(row => row.id === after.id) + 1];
      return next ? (after.order + next.order) / 2 : after.order + 1;
    }
    return sorted.length > 0 ? sorted[sorted.length - 1].order + 1 : 0;
  };

  const executeMutation = async (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    allowedIds: string[],
    blockedIds: string[],
    before: GridEditorHistorySnapshot
  ): Promise<GridEditorCommandResult> => {
    const layout = getLayout();
    const payload = getPayloadRecord(command);
    const metadataPatches: GridEditorMetadataPatch[] = [];
    let resultDiagnostics: GridEditorCommandResult["diagnostics"] | undefined;
    let nextLayout = cloneLayout(layout);
    let nextSelection = cloneSelection(before.selection);
    let nextFocusId = before.focusId;
    const sectionRowBlocked = isLayoutCommand(command.type)
      ? sectionRowBlockForIds(allowedIds, layout)
      : null;
    if (sectionRowBlocked) {
      return createGridEditorCommandResult(command, "blocked", {
        targetIds: allowedIds,
        blocked: {
          reason: sectionRowBlocked.reason,
          itemIds: sectionRowBlocked.itemIds,
          message: `Command blocked by ${sectionRowBlocked.reason}.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: sectionRowBlocked.reason === "section-row-locked"
              ? "grid-editor.sectionRows.locked"
              : "grid-editor.sectionRows.collapsed",
            level: "warning",
            message: `Command blocked by ${sectionRowBlocked.reason}.`,
            itemIds: sectionRowBlocked.itemIds,
            recoverable: true
          }]
        }
      });
    }

    const candidateLayout = readCandidateLayout(command);
    if (candidateLayout && isLayoutCommand(command.type)) {
      const candidateMetadataPatches = metadataPatches.slice();
      if (command.type === "add") {
        const candidateMeta = sanitizeEditorMetaById(payload.editorMetaById, {
          layout: candidateLayout
        });
        Object.keys(candidateMeta).forEach(id => {
          candidateMetadataPatches.push({ type: "set", id, next: candidateMeta[id] });
        });
      } else if (command.type === "paste") {
        const resolvedPayload =
          payload.resolvedClipboardPayload &&
          typeof payload.resolvedClipboardPayload === "object"
            ? payload.resolvedClipboardPayload as Partial<GridEditorResolvedPastePayload>
            : null;
        const candidateMeta = sanitizeEditorMetaById(resolvedPayload?.editorMetaById, {
          layout: candidateLayout
        });
        Object.keys(candidateMeta).forEach(id => {
          candidateMetadataPatches.push({ type: "set", id, next: candidateMeta[id] });
        });
      }
      const layoutPatches = collectEditorLayoutPatches(layout, candidateLayout);
      const insertedIds = layoutPatches.flatMap(patch =>
        patch.type === "add" ? [patch.item.i] : []
      );
      const shiftedIds = layoutPatches.flatMap(patch =>
        patch.type === "move" || patch.type === "resize" ? [patch.id] : []
      );
      const affectedIds = collectAffectedIds(layoutPatches, candidateMetadataPatches);
      const candidateDiagnostics = typeof payload.placementSessionId === "string"
        ? {
            durationMs: 0,
            computed: {
              placement: {
                strategy: isPasteStrategy(payload.strategy) ? payload.strategy : "first-fit",
                placementSource: isPasteStrategy(payload.strategy) ? payload.strategy : "first-fit",
                collisionPolicy: payload.collisionPolicy === "layout" || payload.collisionPolicy === "block"
                  ? payload.collisionPolicy
                  : undefined,
                sessionId: payload.placementSessionId,
                source: typeof payload.placementSource === "string"
                  ? payload.placementSource
                  : undefined,
                insertedIds,
                shiftedIds,
                before: layout.map(item => ({
                  id: item.i,
                  x: item.x,
                  y: item.y,
                  w: item.w,
                  h: item.h
                })),
                after: candidateLayout.map(item => ({
                  id: item.i,
                  x: item.x,
                  y: item.y,
                  w: item.w,
                  h: item.h
                })),
                diagnostics: Array.isArray((payload.placementSummary as { diagnostics?: unknown } | undefined)?.diagnostics)
                  ? (payload.placementSummary as { diagnostics: [] }).diagnostics
                  : []
              }
            }
          } satisfies GridEditorCommandResult["diagnostics"]
        : resultDiagnostics;
      const nextMeta = removeOrphanEditorMeta(
        applyEditorMetadataPatches(before.editorMetaById, candidateMetadataPatches),
        candidateLayout
      );
      const nextSelection = insertedIds.length > 0 && (command.type === "add" || command.type === "paste")
        ? createGridEditorSelection(insertedIds, "api")
        : sanitizeSelectionForLayout(
            before.selection,
            candidateLayout,
            nextMeta,
            "api"
          );
      return applyCommandTransaction(command, before, snapshotWithDraft(before, {
        layout: candidateLayout,
        editorMetaById: nextMeta,
        selection: nextSelection,
        focusId: nextSelection.activeId
      }), {
        status: affectedIds.length > 0 ? "changed" : "noop",
        targetIds: allowedIds.length > 0 ? allowedIds : command.targetIds,
        layoutPatches,
        metadataPatches: candidateMetadataPatches,
        affectedIds,
        selection: nextSelection,
        blocked: blockedIds.length > 0
          ? { reason: "capability", skippedIds: blockedIds, itemIds: blockedIds }
          : undefined,
        diagnostics: candidateDiagnostics
      });
    }

    if (isSectionRowCommand(command.type)) {
      const sectionPayload = payload as GridEditorSectionRowCommandPayload;
      const resolvedRows = normalizeGridEditorSectionRows(sectionRows.value, layout);
      const rowIds = allowedIds.length > 0
        ? allowedIds
        : sectionPayload.id
          ? [sectionPayload.id]
          : [];
      const missingRows = rowIds.filter(id => !resolvedRows.items[id]);
      if (missingRows.length > 0) {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: rowIds,
          blocked: {
            reason: "missing-item",
            itemIds: missingRows,
            message: "Section/row command referenced missing metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.missing",
              level: "warning",
              message: "Section/row command referenced missing metadata.",
              itemIds: missingRows,
              recoverable: true
            }]
          }
        });
      }

      const lockedRows = rowIds.filter(id => resolvedRows.items[id]?.locked);
      if (lockedRows.length > 0 && command.type !== "section-row-expand") {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: rowIds,
          blocked: {
            reason: "section-row-locked",
            itemIds: itemIdsForSectionRows(resolvedRows, lockedRows),
            message: "Section/row command blocked by locked metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.locked",
              level: "warning",
              message: "Section/row command blocked by locked metadata.",
              itemIds: lockedRows,
              recoverable: true
            }]
          }
        });
      }

      const nextRows = cloneSectionRows({
        version: 1,
        items: resolvedRows.items,
        itemMembership: resolvedRows.itemMembership
      });
      const affectedItemIds = itemIdsForSectionRows(resolvedRows, rowIds);
      let nextSelectionIds = selection.value.selectedIds.slice();
      let nextFocusId = focusId.value;
      const cols = isFiniteGridNumber(payload.cols) ? payload.cols : 12;
      const maxRows = isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity;

      if (command.type === "section-row-collapse" || command.type === "section-row-expand") {
        const collapsed = command.type === "section-row-collapse";
        rowIds.forEach(id => {
          nextRows.items[id] = { ...nextRows.items[id], collapsed };
        });
        if (collapsed) {
          nextSelectionIds = nextSelectionIds.filter(id => !affectedItemIds.includes(id));
          if (nextFocusId && affectedItemIds.includes(nextFocusId)) nextFocusId = nextSelectionIds[0] || null;
        }
      } else if (command.type === "section-row-reorder") {
        rowIds.forEach(id => {
          nextRows.items[id] = {
            ...nextRows.items[id],
            order: orderForSectionRow(resolvedRows, sectionPayload)
          };
        });
      } else if (command.type === "section-row-move") {
        const dy = isFiniteGridNumber(sectionPayload.dy) ? Math.floor(sectionPayload.dy) : 0;
        nextLayout = nextLayout.map(item =>
          affectedItemIds.includes(item.i)
            ? { ...item, y: Math.max(0, item.y + dy) }
            : item
        );
        rowIds.forEach(id => {
          const row = nextRows.items[id];
          nextRows.items[id] = {
            ...row,
            bounds: row.bounds ? { ...row.bounds, y: Math.max(0, row.bounds.y + dy) } : row.bounds
          };
        });
        const validation = validateGeometryLayout(nextLayout, affectedItemIds, cols, maxRows);
        if (!validation.ok) {
          return createGridEditorCommandResult(command, "blocked", {
            targetIds: rowIds,
            blocked: {
              reason: validation.reason,
              itemIds: validation.itemIds,
              message: `Section/row move blocked by ${validation.reason}.`
            },
            diagnostics: {
              durationMs: 0,
              messages: [{
                code: `grid-editor.sectionRows.move.${validation.reason}`,
                level: "warning",
                message: `Section/row move blocked by ${validation.reason}.`,
                itemIds: validation.itemIds,
                recoverable: true
              }]
            }
          });
        }
      } else if (command.type === "section-row-delete") {
        rowIds.forEach(id => {
          delete nextRows.items[id];
        });
        Object.keys(nextRows.itemMembership || {}).forEach(itemId => {
          const membership = nextRows.itemMembership?.[itemId] || {};
          const nextMembership = {
            sectionId: membership.sectionId && rowIds.includes(membership.sectionId)
              ? undefined
              : membership.sectionId,
            rowId: membership.rowId && rowIds.includes(membership.rowId)
              ? undefined
              : membership.rowId
          };
          if (!nextMembership.sectionId && !nextMembership.rowId) {
            delete nextRows.itemMembership?.[itemId];
          } else if (nextRows.itemMembership) {
            nextRows.itemMembership[itemId] = nextMembership;
          }
        });
        if (sectionPayload.deleteItems === true) {
          nextLayout = nextLayout.filter(item => !affectedItemIds.includes(item.i));
          affectedItemIds.forEach(id => {
            if (editorMetaById.value[id]) {
              metadataPatches.push({ type: "remove", id, previous: editorMetaById.value[id] });
            }
          });
          nextSelectionIds = nextSelectionIds.filter(id => !affectedItemIds.includes(id));
          if (nextFocusId && affectedItemIds.includes(nextFocusId)) nextFocusId = nextSelectionIds[0] || null;
        }
      }

      const normalizedNextRows = normalizeGridEditorSectionRows(nextRows, nextLayout);
      const layoutPatches = collectEditorLayoutPatches(layout, nextLayout);
      const nextSectionRows: GridEditorSectionRowState = {
        version: 1,
        items: normalizedNextRows.items,
        itemMembership: normalizedNextRows.itemMembership
      };
      const nextMeta = removeOrphanEditorMeta(
        applyEditorMetadataPatches(before.editorMetaById, metadataPatches),
        nextLayout
      );
      const nextSelection = sanitizeSelectionForLayout(
        createGridEditorSelection(nextSelectionIds, "api"),
        nextLayout,
        nextMeta,
        "api"
      );
      const affectedIds = Array.from(new Set([...rowIds, ...affectedItemIds]));
      return applyCommandTransaction(command, before, snapshotWithDraft(before, {
        layout: nextLayout,
        editorMetaById: nextMeta,
        sectionRows: nextSectionRows,
        selection: nextSelection,
        focusId: nextFocusId
      }), {
        status: "changed",
        targetIds: rowIds,
        layoutPatches,
        metadataPatches,
        affectedIds,
        selection: nextSelection,
        diagnostics: {
          durationMs: 0,
          computed: {
            affectedIds,
            sectionRowContext: {
              source: "metadata"
            }
          },
          messages: [{
            code: `grid-editor.sectionRows.${command.type.replace("section-row-", "")}`,
            level: "info",
            message: `Section/row command ${command.type} applied.`,
            itemIds: affectedItemIds,
            recoverable: true
          }]
        }
      });
    }

    if (command.type === "select") {
      const previousSelection = selection.value;
      const nextSelection = updateSelectionByIntent(layout, selection.value, {
        id: typeof payload.id === "string" ? payload.id : undefined,
        ids: Array.isArray(payload.ids)
          ? payload.ids.filter((id): id is string => typeof id === "string")
          : typeof payload.id === "string"
            ? undefined
            : allowedIds,
        toggle: payload.toggle === true,
        range: payload.range === true,
        source: command.source === "keyboard" ? "keyboard" : command.source === "pointer" ? "pointer" : "api"
      });
      const normalizedSelection = sanitizeSelectionForLayout(
        nextSelection,
        layout,
        before.editorMetaById,
        nextSelection.source
      );
      const appliedSelection = options.selectedIds ? previousSelection : normalizedSelection;
      return applyCommandTransaction(command, before, snapshotWithDraft(before, {
        selection: normalizedSelection,
        focusId: normalizedSelection.activeId
      }), {
        status: deepEqual(previousSelection, appliedSelection) ? "noop" : "changed",
        targetIds: appliedSelection.selectedIds,
        selection: appliedSelection
      });
    }

    if (command.type === "clearSelection") {
      const previousSelection = selection.value;
      const nextSelection = sanitizeSelectionForLayout(
        clearEditorSelection("api"),
        layout,
        before.editorMetaById,
        "api"
      );
      const appliedSelection = options.selectedIds ? previousSelection : nextSelection;
      return applyCommandTransaction(command, before, snapshotWithDraft(before, {
        selection: nextSelection,
        focusId: nextSelection.activeId
      }), {
        status: deepEqual(previousSelection, appliedSelection) ? "noop" : "changed",
        selection: appliedSelection
      });
    }

    if (command.type === "move") {
      const dx = isFiniteGridNumber(payload.dx) ? payload.dx : null;
      const dy = isFiniteGridNumber(payload.dy) ? payload.dy : null;
      const absoluteX = isFiniteGridNumber(payload.x);
      const absoluteY = isFiniteGridNumber(payload.y);
      const targetIds = Array.from(new Set([...allowedIds, ...blockedIds]));
      const activeId = selection.value.activeId && allowedIds.includes(selection.value.activeId)
        ? selection.value.activeId
        : allowedIds[0];
      const activeItem = activeId ? getLayoutItem(layout, activeId) : undefined;
      const explicitMultiTarget = (command.targetIds?.filter(Boolean).length || 0) > 1;
      const selectionRelativeGroup =
        !command.targetIds &&
        selection.value.selectedIds.length > 1 &&
        (dx !== null || dy !== null);
      const multiMoveRequest = explicitMultiTarget || selectionRelativeGroup;
      const singleAbsoluteMove =
        allowedIds.length === 1 &&
        !explicitMultiTarget &&
        (absoluteX || absoluteY);
      const shouldUseGroupMove =
        allowedIds.length > 0 &&
        !singleAbsoluteMove &&
        (allowedIds.length > 1 || multiMoveRequest);

      if (shouldUseGroupMove) {
        const groupDx = dx !== null
          ? dx
          : absoluteX && activeItem
            ? (payload.x as number) - activeItem.x
            : 0;
        const groupDy = dy !== null
          ? dy
          : absoluteY && activeItem
            ? (payload.y as number) - activeItem.y
            : 0;
        const operation: LayoutOperation = {
          type: "groupMove",
          ids: allowedIds,
          activeId,
          dx: groupDx,
          dy: groupDy,
          userAction: command.source !== "api"
        };
        const operationResult = await runLayoutOperation(command, layout, operation, payload);
        resultDiagnostics = {
          durationMs: 0,
          layoutDiagnostics: operationResult.diagnostics,
          operationResult
        };

        if (operationResult.status === "blocked") {
          const reason = mapLayoutBlockedReason(operationResult.blocked?.reason);
          return createGridEditorCommandResult(command, "blocked", {
            targetIds,
            blocked: {
              reason,
              itemIds: operationResult.blocked?.itemIds || targetIds,
              skippedIds: blockedIds.length > 0 ? blockedIds : undefined,
              message: `Move command blocked by ${reason}.`
            },
            diagnostics: resultDiagnostics
          });
        }
        if (operationResult.status === "error") {
          return createGridEditorCommandResult(command, "error", {
            targetIds,
            diagnostics: resultDiagnostics,
            error: operationResult.error || { message: "Layout operation failed." }
          });
        }

        const layoutPatches = operationResult.patches;
        const affectedIds = operationResult.affectedIds;
        const status = layoutPatches.length > 0 || operationResult.status === "changed" || operationResult.status === "fallback"
          ? "changed"
          : "noop";
        const nextMeta = removeOrphanEditorMeta(
          applyEditorMetadataPatches(before.editorMetaById, metadataPatches),
          operationResult.layout
        );
        const nextSelection = sanitizeSelectionForLayout(
          before.selection,
          operationResult.layout,
          nextMeta,
          "api"
        );
        return applyCommandTransaction(command, before, snapshotWithDraft(before, {
          layout: operationResult.layout,
          editorMetaById: nextMeta,
          selection: nextSelection,
          focusId: nextSelection.activeId
        }), {
          status,
          targetIds,
          layoutPatches,
          metadataPatches,
          affectedIds,
          selection: nextSelection,
          blocked: blockedIds.length > 0
            ? { reason: "capability", skippedIds: blockedIds, itemIds: blockedIds }
            : undefined,
          diagnostics: resultDiagnostics
        });
      }

      nextLayout = nextLayout.map(item => {
        if (!allowedIds.includes(item.i)) return item;
        const x = allowedIds.length === 1 && absoluteX
          ? payload.x as number
          : item.x + (dx || 0);
        const y = allowedIds.length === 1 && absoluteY
          ? payload.y as number
          : item.y + (dy || 0);
        return { ...item, x: Math.max(0, Math.floor(x)), y: Math.max(0, Math.floor(y)) };
      });
    } else if (command.type === "resize") {
      const targetId = allowedIds[0];
      const targetItem = targetId ? getLayoutItem(nextLayout, targetId) : undefined;
      const constraint = targetId ? resolveResizeConstraint(targetId) : undefined;
      if (targetItem && constraint) {
        const nextW = isFiniteGridNumber(payload.w)
          ? payload.w
          : targetItem.w + (isFiniteGridNumber(payload.dw) ? payload.dw : 0);
        const nextH = isFiniteGridNumber(payload.h)
          ? payload.h
          : targetItem.h + (isFiniteGridNumber(payload.dh) ? payload.dh : 0);
        const operationResult = await runLayoutOperation(command, layout, {
          type: "resize",
          id: targetId,
          x: isFiniteGridNumber(payload.x) ? Math.max(0, Math.floor(payload.x)) : undefined,
          y: isFiniteGridNumber(payload.y) ? Math.max(0, Math.floor(payload.y)) : undefined,
          w: clampGridSize(nextW, targetItem.w),
          h: clampGridSize(nextH, targetItem.h),
          handle: isResizeHandleAxis(payload.handle) ? payload.handle : "se",
          constraint
        }, payload);
        resultDiagnostics = {
          durationMs: 0,
          layoutDiagnostics: operationResult.diagnostics,
          operationResult
        };
        if (operationResult.status === "blocked") {
          const reason = mapLayoutBlockedReason(operationResult.blocked?.reason);
          return createGridEditorCommandResult(command, "blocked", {
            targetIds: allowedIds,
            blocked: {
              reason,
              itemIds: operationResult.blocked?.itemIds || allowedIds,
              message: `Resize command blocked by ${reason}.`
            },
            diagnostics: resultDiagnostics
          });
        }
        if (operationResult.status === "error") {
          return createGridEditorCommandResult(command, "error", {
            targetIds: allowedIds,
            diagnostics: resultDiagnostics,
            error: operationResult.error || { message: "Layout operation failed." }
          });
        }
        nextLayout = operationResult.layout;
      } else {
        nextLayout = nextLayout.map(item => {
          if (item.i !== targetId) return item;
          const nextW = isFiniteGridNumber(payload.w)
            ? payload.w
            : item.w + (isFiniteGridNumber(payload.dw) ? payload.dw : 0);
          const nextH = isFiniteGridNumber(payload.h)
            ? payload.h
            : item.h + (isFiniteGridNumber(payload.dh) ? payload.dh : 0);
          return {
            ...item,
            x: isFiniteGridNumber(payload.x) ? Math.max(0, Math.floor(payload.x)) : item.x,
            y: isFiniteGridNumber(payload.y) ? Math.max(0, Math.floor(payload.y)) : item.y,
            w: clampGridSize(nextW, item.w),
            h: clampGridSize(nextH, item.h)
          };
        });
      }
    } else if (command.type === "align") {
      const cols = isFiniteGridNumber(payload.cols) ? payload.cols : 12;
      const maxRows = isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity;
      const geometryResult = applyGridEditorAlign(layout, payload as GridEditorAlignPayload, {
        targetIds: allowedIds,
        selectedIds: selection.value.selectedIds,
        activeId: selection.value.activeId,
        metaById: editorMetaById.value,
        sectionRows: sectionRows.value,
        cols,
        maxRows,
        skippedIds: blockedIds
      });
      resultDiagnostics = geometryResult.diagnostics;
      if (geometryResult.status === "blocked") {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: allowedIds,
          blocked: geometryResult.blocked,
          diagnostics: resultDiagnostics
        });
      }
      nextLayout = geometryResult.layout;
    } else if (command.type === "distribute" || command.type === "tidy") {
      const cols = isFiniteGridNumber(payload.cols) ? payload.cols : 12;
      const maxRows = isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity;
      const geometryResult = command.type === "distribute"
        ? applyGridEditorDistribute(layout, payload as GridEditorDistributePayload, {
            targetIds: allowedIds,
            selectedIds: selection.value.selectedIds,
            activeId: selection.value.activeId,
            metaById: editorMetaById.value,
            sectionRows: sectionRows.value,
            cols,
            maxRows,
            skippedIds: blockedIds
          })
        : applyGridEditorTidy(layout, payload as GridEditorTidyPayload, {
            targetIds: allowedIds,
            selectedIds: selection.value.selectedIds,
            activeId: selection.value.activeId,
            metaById: editorMetaById.value,
            sectionRows: sectionRows.value,
            cols,
            maxRows,
            skippedIds: blockedIds
          });
      resultDiagnostics = geometryResult.diagnostics;
      if (geometryResult.status === "blocked") {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: allowedIds,
          blocked: geometryResult.blocked,
          diagnostics: resultDiagnostics
        });
      }
      nextLayout = geometryResult.layout;
    } else if (command.type === "add") {
      const rawItems = Array.isArray(payload.items)
        ? payload.items
        : payload.item
          ? [payload.item]
          : [];
      const existingIds = new Set(nextLayout.map(item => item.i));
      const idGenerator = options.idGenerator || defaultIdGenerator;
      const items = rawItems
        .filter(item => item && typeof item === "object")
        .map((item: unknown, index: number) => {
          const input = item as Partial<LayoutItem>;
          const id = typeof input.i === "string" && !existingIds.has(input.i)
            ? input.i
            : idGenerator(typeof input.i === "string" ? input.i : `item-${index + 1}`, existingIds);
          existingIds.add(id);
          return {
            ...input,
            i: id,
            x: isFiniteGridNumber(input.x) ? input.x : 0,
            y: isFiniteGridNumber(input.y) ? input.y : 0,
            w: clampGridSize(input.w, 1),
            h: clampGridSize(input.h, 1)
          } as LayoutItem;
        });
      const placed = placeGridEditorNewItems(nextLayout, items, String(payload.strategy || "first-fit"), payload);
      resultDiagnostics = placementDiagnostics(placed, payload);
      if (placed.failed) {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: placed.summary.insertedIds,
          blocked: {
            reason: placed.blocked?.reason || "bounds",
            itemIds: placed.blocked?.itemIds,
            message: placed.blocked?.message || "One or more items could not fit in the current layout."
          },
          diagnostics: resultDiagnostics
        });
      }
      const payloadMeta = sanitizeEditorMetaById(payload.editorMetaById, { layout: items });
      Object.keys(payloadMeta).forEach(id => {
        if (items.some(item => item.i === id)) {
          metadataPatches.push({ type: "set", id, next: payloadMeta[id] });
        }
      });
      nextLayout = placed.layout;
    } else if (command.type === "delete") {
      const deleted = new Set(allowedIds);
      nextLayout = nextLayout.filter(item => !deleted.has(item.i));
      allowedIds.forEach(id => {
        if (editorMetaById.value[id]) {
          metadataPatches.push({ type: "remove", id, previous: editorMetaById.value[id] });
        }
      });
      nextFocusId = getNextFocusableId(nextLayout, allowedIds, editorMetaById.value);
    } else if (command.type === "duplicate") {
      const sourceItems = allowedIds
        .map(id => getLayoutItem(layout, id))
        .filter(Boolean) as LayoutItem[];
      const mapped = mapIds(
        sourceItems,
        editorMetaById.value,
        new Set(layout.map(item => item.i)),
        options.idGenerator || defaultIdGenerator
      );
      Object.keys(mapped.metaById).forEach(id => {
        metadataPatches.push({ type: "set", id, next: mapped.metaById[id] });
      });
      const placed = placeGridEditorNewItems(
        nextLayout,
        mapped.items,
        String(payload.strategy || options.pasteStrategy || "offset"),
        payload
      );
      resultDiagnostics = placementDiagnostics(placed, payload);
      if (placed.failed) {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: allowedIds,
          blocked: {
            reason: placed.blocked?.reason || "bounds",
            itemIds: placed.blocked?.itemIds || allowedIds,
            message: placed.blocked?.message || "Duplicated items could not fit in the current layout."
          },
          diagnostics: resultDiagnostics
        });
      }
      nextLayout = placed.layout;
      nextSelection = createGridEditorSelection(mapped.items.map(item => item.i), "api");
      nextFocusId = nextSelection.activeId;
    } else if (command.type === "copy") {
      const items = allowedIds
        .map(id => getLayoutItem(layout, id))
        .filter(Boolean) as LayoutItem[];
      await writeClipboard(resolveClipboard(), createGridEditorClipboardPayload({
        sourceId: command.id,
        items,
        editorMetaById: sanitizeEditorMetaById(editorMetaById.value, { layout: items }),
        source: clipboardSourceContext(payload)
      }));
      return createGridEditorCommandResult(command, "changed", {
        targetIds: allowedIds,
        affectedIds: allowedIds
      });
    } else if (command.type === "paste") {
      const resolvedPayload =
        payload.resolvedClipboardPayload &&
        typeof payload.resolvedClipboardPayload === "object"
          ? payload.resolvedClipboardPayload as Partial<GridEditorResolvedPastePayload>
          : null;
      const clipboardPayload = resolvedPayload
        ? {
            items: cloneLayout(Array.isArray(resolvedPayload.items) ? resolvedPayload.items : []),
            editorMetaById: sanitizeEditorMetaById(resolvedPayload.editorMetaById),
            sourceId: typeof resolvedPayload.sourceId === "string"
              ? resolvedPayload.sourceId
              : command.id,
            copiedAt: new Date().toISOString(),
            version: 2 as const,
            source: resolvedPayload.source,
            originalGeometryById: resolvedPayload.originalGeometryById
          }
        : await readClipboard(resolveClipboard());
      if (!clipboardPayload) {
        return createGridEditorCommandResult(command, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      }
      const normalizedClipboard = resolvedPayload?.mapped === true
        ? {
            items: cloneLayout(clipboardPayload.items),
            scaled: false
          }
        : normalizeGridEditorClipboardItemsForTarget(clipboardPayload, {
            cols: resolveClipboardTargetCols(payload)
          });
      const mapped = resolvedPayload?.mapped === true
        ? {
            items: cloneLayout(normalizedClipboard.items),
            metaById: sanitizeEditorMetaById(clipboardPayload.editorMetaById, {
              layout: normalizedClipboard.items
            })
          }
        : mapIds(
            normalizedClipboard.items,
            clipboardPayload.editorMetaById,
            new Set(layout.map(item => item.i)),
            options.idGenerator || defaultIdGenerator
          );
      Object.keys(mapped.metaById).forEach(id => {
        metadataPatches.push({ type: "set", id, next: mapped.metaById[id] });
      });
      const placed = placeGridEditorNewItems(
        nextLayout,
        mapped.items,
        String(payload.strategy || options.pasteStrategy || "offset"),
        payload
      );
      resultDiagnostics = placementDiagnostics(placed, payload);
      if (placed.failed) {
        return createGridEditorCommandResult(command, "blocked", {
          blocked: {
            reason: placed.blocked?.reason || "bounds",
            itemIds: placed.blocked?.itemIds,
            message: placed.blocked?.message || "Clipboard items could not fit in the current layout."
          },
          diagnostics: resultDiagnostics
        });
      }
      nextLayout = placed.layout;
      nextSelection = createGridEditorSelection(mapped.items.map(item => item.i), "api");
      nextFocusId = nextSelection.activeId;
    } else if (isMetadataCommand(command.type)) {
      allowedIds.forEach(id => {
        const patch =
          command.type === "lock" ? { locked: true } :
          command.type === "unlock" ? { locked: false } :
          command.type === "show" ? { visible: true } :
          { visible: false };
        const patched = patchEditorMeta(editorMetaById.value, id, patch);
        if (patched.patch) metadataPatches.push(patched.patch);
      });
    }

    const layoutPatches = collectEditorLayoutPatches(layout, nextLayout);
    const nextMeta = removeOrphanEditorMeta(
      applyEditorMetadataPatches(before.editorMetaById, metadataPatches),
      nextLayout
    );
    const sanitizedSelection = sanitizeSelectionForLayout(
      nextSelection,
      nextLayout,
      nextMeta,
      nextSelection.source
    );
    const resolvedFocusId = nextFocusId !== before.focusId
      ? nextFocusId
      : sanitizedSelection.activeId;
    const affectedIds = collectAffectedIds(layoutPatches, metadataPatches);
    const status = affectedIds.length > 0 ? "changed" : "noop";
    return applyCommandTransaction(command, before, snapshotWithDraft(before, {
      layout: nextLayout,
      editorMetaById: nextMeta,
      selection: sanitizedSelection,
      focusId: resolvedFocusId
    }), {
      status,
      targetIds: allowedIds.length > 0 ? allowedIds : command.targetIds,
      layoutPatches,
      metadataPatches,
      affectedIds,
      selection: options.selectedIds ? before.selection : sanitizedSelection,
      blocked: blockedIds.length > 0
        ? { reason: "capability", skippedIds: blockedIds, itemIds: blockedIds }
        : undefined,
      diagnostics: resultDiagnostics
    });
  };

  const snapshotWithLayout = (
    snapshot: GridEditorHistorySnapshot,
    layout: Layout
  ): GridEditorHistorySnapshot => {
    if (snapshot.kind === "responsive") {
      return {
        ...snapshot,
        layouts: {
          ...cloneLayoutsMap(snapshot.layouts),
          [snapshot.breakpoint]: cloneLayout(layout)
        }
      };
    }
    return {
      ...snapshot,
      layout: cloneLayout(layout)
    };
  };

  const snapshotWithDraft = (
    snapshot: GridEditorHistorySnapshot,
    input: {
      layout?: Layout;
      editorMetaById?: GridEditorMetaById;
      sectionRows?: GridEditorSectionRowState;
      selection?: GridEditorSelectionState;
      focusId?: string | null;
    }
  ): GridEditorHistorySnapshot => {
    const base = input.layout ? snapshotWithLayout(snapshot, input.layout) : snapshot;
    return {
      ...base,
      editorMetaById: input.editorMetaById
        ? cloneMeta(input.editorMetaById)
        : cloneMeta(snapshot.editorMetaById),
      sectionRows: input.sectionRows
        ? cloneSectionRows(input.sectionRows)
        : cloneSectionRows(snapshot.sectionRows),
      selection: input.selection
        ? cloneSelection(input.selection)
        : cloneSelection(snapshot.selection),
      focusId: input.focusId !== undefined ? input.focusId : snapshot.focusId
    };
  };

  const readCandidateLayout = (command: GridEditorCommand): Layout | null => {
    const payload = getPayloadRecord(command);
    const candidate = payload.candidateLayout ||
      payload.placementCandidateLayout ||
      payload.afterLayout ||
      payload.layout;
    return Array.isArray(candidate)
      ? cloneLayout(candidate.filter((item): item is LayoutItem =>
          Boolean(item) && typeof item === "object" && typeof item.i === "string"
        ))
      : null;
  };

  const buildCommandPreview = (
    command: NormalizedGridEditorCommand,
    allowedIds: string[],
    before: GridEditorHistorySnapshot
  ): GridEditorTransactionPreview => {
    const payload = getPayloadRecord(command);
    let previewLayout = readCandidateLayout(command);
    let previewMeta = cloneMeta(before.editorMetaById);
    let previewRows = cloneSectionRows(before.sectionRows);
    let previewSelection = cloneSelection(before.selection);
    let previewFocusId = before.focusId;
    const risk = command.type === "delete" || command.type === "section-row-delete"
      ? "destructive"
      : isPersistenceCommand(command.type)
        ? "persistence"
        : command.source === "external" || command.source === "remote"
          ? "external"
          : "normal";

    if (!previewLayout && command.type === "delete") {
      const deleted = new Set(allowedIds);
      previewLayout = getLayout().filter(item => !deleted.has(item.i));
      allowedIds.forEach(id => {
        delete previewMeta[id];
      });
      previewSelection = createGridEditorSelection(
        previewSelection.selectedIds.filter(id => !deleted.has(id)),
        command.source === "keyboard" ? "keyboard" : command.source === "pointer" ? "pointer" : "api"
      );
      previewFocusId = getNextFocusableId(previewLayout, allowedIds, previewMeta);
    }
    if (!previewLayout && command.type === "move") {
      const dx = isFiniteGridNumber(payload.dx) ? payload.dx : null;
      const dy = isFiniteGridNumber(payload.dy) ? payload.dy : null;
      const absoluteX = isFiniteGridNumber(payload.x);
      const absoluteY = isFiniteGridNumber(payload.y);
      if (dx !== null || dy !== null || absoluteX || absoluteY) {
        previewLayout = getLayout().map(item => {
          if (!allowedIds.includes(item.i)) return item;
          return {
            ...item,
            x: absoluteX && allowedIds.length === 1
              ? Math.max(0, Math.floor(payload.x as number))
              : Math.max(0, Math.floor(item.x + (dx || 0))),
            y: absoluteY && allowedIds.length === 1
              ? Math.max(0, Math.floor(payload.y as number))
              : Math.max(0, Math.floor(item.y + (dy || 0)))
          };
        });
      }
    }
    if (!previewLayout && command.type === "resize") {
      const currentLayout = getLayout();
      const targetId = allowedIds[0];
      const targetItem = targetId ? getLayoutItem(currentLayout, targetId) : undefined;
      const constraint = targetId ? resolveResizeConstraint(targetId) : undefined;
      const engineOptions = constraint ? resolveLayoutEngineOptions(payload) : null;
      if (targetItem && constraint && engineOptions) {
        const nextW = isFiniteGridNumber(payload.w)
          ? payload.w
          : targetItem.w + (isFiniteGridNumber(payload.dw) ? payload.dw : 0);
        const nextH = isFiniteGridNumber(payload.h)
          ? payload.h
          : targetItem.h + (isFiniteGridNumber(payload.dh) ? payload.dh : 0);
        const operationResult = executeLayoutOperation({
          id: `${command.id}:preview-layout`,
          phase: "preview",
          layout: currentLayout,
          operation: {
            type: "resize",
            id: targetId,
            x: isFiniteGridNumber(payload.x) ? Math.max(0, Math.floor(payload.x)) : undefined,
            y: isFiniteGridNumber(payload.y) ? Math.max(0, Math.floor(payload.y)) : undefined,
            w: clampGridSize(nextW, targetItem.w),
            h: clampGridSize(nextH, targetItem.h),
            handle: isResizeHandleAxis(payload.handle) ? payload.handle : "se",
            constraint
          },
          options: engineOptions
        });
        previewLayout = operationResult.status === "blocked" || operationResult.status === "error"
          ? currentLayout
          : operationResult.layout;
      } else {
        previewLayout = currentLayout.map(item => {
          if (item.i !== targetId) return item;
          const nextW = isFiniteGridNumber(payload.w)
            ? payload.w
            : item.w + (isFiniteGridNumber(payload.dw) ? payload.dw : 0);
          const nextH = isFiniteGridNumber(payload.h)
            ? payload.h
            : item.h + (isFiniteGridNumber(payload.dh) ? payload.dh : 0);
          return {
            ...item,
            x: isFiniteGridNumber(payload.x) ? Math.max(0, Math.floor(payload.x)) : item.x,
            y: isFiniteGridNumber(payload.y) ? Math.max(0, Math.floor(payload.y)) : item.y,
            w: clampGridSize(nextW, item.w),
            h: clampGridSize(nextH, item.h)
          };
        });
      }
    }

    if (!previewLayout && command.type === "add") {
      const rawItems = Array.isArray(payload.items)
        ? payload.items
        : payload.item
          ? [payload.item]
          : [];
      const existingIds = new Set(getLayout().map(item => item.i));
      const idGenerator = options.idGenerator || defaultIdGenerator;
      const items = rawItems
        .filter(item => item && typeof item === "object")
        .map((item: unknown, index: number) => {
          const input = item as Partial<LayoutItem>;
          const id = typeof input.i === "string" && !existingIds.has(input.i)
            ? input.i
            : idGenerator(typeof input.i === "string" ? input.i : `item-${index + 1}`, existingIds);
          existingIds.add(id);
          return {
            ...input,
            i: id,
            x: isFiniteGridNumber(input.x) ? input.x : 0,
            y: isFiniteGridNumber(input.y) ? input.y : 0,
            w: clampGridSize(input.w, 1),
            h: clampGridSize(input.h, 1)
          } as LayoutItem;
        });
      if (items.length > 0) {
        const placed = placeGridEditorNewItems(
          getLayout(),
          items,
          String(payload.strategy || "first-fit"),
          payload
        );
        if (!placed.failed) {
          previewLayout = placed.layout;
          previewMeta = {
            ...previewMeta,
            ...sanitizeEditorMetaById(payload.editorMetaById, { layout: items })
          };
          previewSelection = createGridEditorSelection(items.map(item => item.i), "api");
          previewFocusId = previewSelection.activeId;
        }
      }
    }

    if (!previewLayout && command.type === "paste") {
      const resolvedPayload =
        payload.resolvedClipboardPayload &&
        typeof payload.resolvedClipboardPayload === "object"
          ? payload.resolvedClipboardPayload as Partial<GridEditorResolvedPastePayload>
          : null;
      if (resolvedPayload?.items && Array.isArray(resolvedPayload.items)) {
        const previewClipboardPayload = {
          version: 2 as const,
          sourceId: typeof resolvedPayload.sourceId === "string" ? resolvedPayload.sourceId : command.id,
          copiedAt: new Date().toISOString(),
          items: cloneLayout(resolvedPayload.items),
          editorMetaById: sanitizeEditorMetaById(resolvedPayload.editorMetaById),
          source: resolvedPayload.source,
          originalGeometryById: resolvedPayload.originalGeometryById
        };
        const previewItems = resolvedPayload.mapped === true
          ? cloneLayout(previewClipboardPayload.items)
          : normalizeGridEditorClipboardItemsForTarget(previewClipboardPayload, {
              cols: resolveClipboardTargetCols(payload)
            }).items;
        const mappedPaste = resolvedPayload.mapped === true
          ? {
              items: previewItems,
              metaById: sanitizeEditorMetaById(resolvedPayload.editorMetaById, {
                layout: previewItems
              })
            }
          : mapIds(
              previewItems,
              sanitizeEditorMetaById(resolvedPayload.editorMetaById),
              new Set(getLayout().map(item => item.i)),
              options.idGenerator || defaultIdGenerator
            );
        const placed = placeGridEditorNewItems(
          getLayout(),
          mappedPaste.items,
          String(payload.strategy || options.pasteStrategy || "offset"),
          payload
        );
        if (!placed.failed) {
          previewLayout = placed.layout;
          previewMeta = { ...previewMeta, ...mappedPaste.metaById };
          previewSelection = createGridEditorSelection(mappedPaste.items.map(item => item.i), "api");
          previewFocusId = previewSelection.activeId;
        }
      }
    }

    if (!previewLayout && command.type === "duplicate") {
      const sourceItems = allowedIds
        .map(id => getLayoutItem(getLayout(), id))
        .filter(Boolean) as LayoutItem[];
      const mapped = mapIds(
        sourceItems,
        previewMeta,
        new Set(getLayout().map(item => item.i)),
        options.idGenerator || defaultIdGenerator
      );
      const placed = placeGridEditorNewItems(
        getLayout(),
        mapped.items,
        String(payload.strategy || options.pasteStrategy || "offset"),
        payload
      );
      if (!placed.failed) {
        previewLayout = placed.layout;
        previewMeta = { ...previewMeta, ...mapped.metaById };
        previewSelection = createGridEditorSelection(mapped.items.map(item => item.i), "api");
        previewFocusId = previewSelection.activeId;
      }
    }

    if (!previewLayout && command.type === "align") {
      const geometryResult = applyGridEditorAlign(getLayout(), payload as GridEditorAlignPayload, {
        targetIds: allowedIds,
        selectedIds: selection.value.selectedIds,
        activeId: selection.value.activeId,
        metaById: editorMetaById.value,
        sectionRows: sectionRows.value,
        cols: isFiniteGridNumber(payload.cols) ? payload.cols : 12,
        maxRows: isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity
      });
      if (geometryResult.status !== "blocked") previewLayout = geometryResult.layout;
    }

    if (!previewLayout && (command.type === "distribute" || command.type === "tidy")) {
      const geometryResult = command.type === "distribute"
        ? applyGridEditorDistribute(getLayout(), payload as GridEditorDistributePayload, {
            targetIds: allowedIds,
            selectedIds: selection.value.selectedIds,
            activeId: selection.value.activeId,
            metaById: editorMetaById.value,
            sectionRows: sectionRows.value,
            cols: isFiniteGridNumber(payload.cols) ? payload.cols : 12,
            maxRows: isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity
          })
        : applyGridEditorTidy(getLayout(), payload as GridEditorTidyPayload, {
            targetIds: allowedIds,
            selectedIds: selection.value.selectedIds,
            activeId: selection.value.activeId,
            metaById: editorMetaById.value,
            sectionRows: sectionRows.value,
            cols: isFiniteGridNumber(payload.cols) ? payload.cols : 12,
            maxRows: isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity
          });
      if (geometryResult.status !== "blocked") previewLayout = geometryResult.layout;
    }

    if (isMetadataCommand(command.type)) {
      allowedIds.forEach(id => {
        const patch =
          command.type === "lock" ? { locked: true } :
          command.type === "unlock" ? { locked: false } :
          command.type === "show" ? { visible: true } :
          { visible: false };
        const patched = patchEditorMeta(previewMeta, id, patch);
        if (patched.patch) {
          previewMeta = applyEditorMetadataPatches(previewMeta, [patched.patch]);
        }
      });
    }

    if (command.type === "select") {
      previewSelection = updateSelectionByIntent(getLayout(), selection.value, {
        id: typeof payload.id === "string" ? payload.id : undefined,
        ids: Array.isArray(payload.ids)
          ? payload.ids.filter((id): id is string => typeof id === "string")
          : typeof payload.id === "string"
            ? undefined
            : allowedIds,
        toggle: payload.toggle === true,
        range: payload.range === true,
        source: command.source === "keyboard" ? "keyboard" : command.source === "pointer" ? "pointer" : "api"
      });
      previewFocusId = previewSelection.activeId;
    } else if (command.type === "clearSelection") {
      previewSelection = clearEditorSelection("api");
      previewFocusId = null;
    }

    if (isSectionRowCommand(command.type)) {
      const sectionPayload = payload as GridEditorSectionRowCommandPayload;
      const resolvedRows = normalizeGridEditorSectionRows(previewRows, getLayout());
      const rowIds = allowedIds.length > 0
        ? allowedIds
        : sectionPayload.id
          ? [sectionPayload.id]
          : [];
      const missingRows = rowIds.filter(id => !resolvedRows.items[id]);
      if (missingRows.length === 0) {
        const nextRows = cloneSectionRows({
          version: 1,
          items: resolvedRows.items,
          itemMembership: resolvedRows.itemMembership
        });
        const affectedItemIds = itemIdsForSectionRows(resolvedRows, rowIds);
        if (command.type === "section-row-collapse" || command.type === "section-row-expand") {
          const collapsed = command.type === "section-row-collapse";
          rowIds.forEach(id => {
            nextRows.items[id] = { ...nextRows.items[id], collapsed };
          });
          if (collapsed) {
            previewSelection = createGridEditorSelection(
              previewSelection.selectedIds.filter(id => !affectedItemIds.includes(id)),
              "api"
            );
            previewFocusId = previewSelection.activeId;
          }
        } else if (command.type === "section-row-reorder") {
          rowIds.forEach(id => {
            nextRows.items[id] = {
              ...nextRows.items[id],
              order: orderForSectionRow(resolvedRows, sectionPayload)
            };
          });
        } else if (command.type === "section-row-move") {
          const dy = isFiniteGridNumber(sectionPayload.dy) ? Math.floor(sectionPayload.dy) : 0;
          previewLayout = (previewLayout || getLayout()).map(item =>
            affectedItemIds.includes(item.i)
              ? { ...item, y: Math.max(0, item.y + dy) }
              : item
          );
          rowIds.forEach(id => {
            const row = nextRows.items[id];
            nextRows.items[id] = {
              ...row,
              bounds: row.bounds ? { ...row.bounds, y: Math.max(0, row.bounds.y + dy) } : row.bounds
            };
          });
        } else if (command.type === "section-row-delete") {
          rowIds.forEach(id => {
            delete nextRows.items[id];
          });
          Object.keys(nextRows.itemMembership || {}).forEach(itemId => {
            const membership = nextRows.itemMembership?.[itemId] || {};
            const nextMembership = {
              sectionId: membership.sectionId && rowIds.includes(membership.sectionId)
                ? undefined
                : membership.sectionId,
              rowId: membership.rowId && rowIds.includes(membership.rowId)
                ? undefined
                : membership.rowId
            };
            if (!nextMembership.sectionId && !nextMembership.rowId) {
              delete nextRows.itemMembership?.[itemId];
            } else if (nextRows.itemMembership) {
              nextRows.itemMembership[itemId] = nextMembership;
            }
          });
          if (sectionPayload.deleteItems === true) {
            previewLayout = (previewLayout || getLayout()).filter(item => !affectedItemIds.includes(item.i));
            affectedItemIds.forEach(id => {
              delete previewMeta[id];
            });
            previewSelection = createGridEditorSelection(
              previewSelection.selectedIds.filter(id => !affectedItemIds.includes(id)),
              "api"
            );
            previewFocusId = previewSelection.activeId;
          }
        }
        const normalizedNextRows = normalizeGridEditorSectionRows(nextRows, previewLayout || getLayout());
        previewRows = {
          version: 1,
          items: normalizedNextRows.items,
          itemMembership: normalizedNextRows.itemMembership
        };
      }
    }

    return createGridEditorTransactionPreview(before, snapshotWithDraft(before, {
      layout: previewLayout || undefined,
      editorMetaById: previewMeta,
      sectionRows: previewRows,
      selection: previewSelection,
      focusId: previewFocusId
    }), {
      risk
    });
  };

  const commandKernel = createGridEditorCommandKernel({
    beforeCommand: options.beforeCommand,
    guardTimeoutMs: options.guardTimeoutMs,
    getSnapshot: createSnapshot,
    getStateRevision: () => stateRevision,
    check: command => checkGridEditorCommand(command, {
      mode: mode.value,
      modeMissing,
      layout: getLayout(),
      editorMetaById: editorMetaById.value,
      selection: selection.value,
      commandPolicy: options.commandPolicy,
      itemCapabilities: options.itemCapabilities
    }),
    getGuardContext: (command, check, preview, signal) => {
      const payload = getPayloadRecord(command);
      const placementSummary = payload.placementSummary && typeof payload.placementSummary === "object"
        ? payload.placementSummary as {
            ghostItemIds?: string[];
            affectedIds?: string[];
            diagnostics?: unknown[];
          }
        : undefined;
      return {
        source: command.source || "api",
        origin: command.origin,
        targetIds: check.allowedIds,
        layout: getLayout(),
        layouts: getLayouts(),
        editorMetaById: editorMetaById.value,
        sectionRows: sectionRows.value,
        selection: selection.value,
        mode: mode.value,
        history: {
          canUndo: Boolean(history?.canUndo.value),
          canRedo: Boolean(history?.canRedo.value)
        },
        preview,
        placement: placementSummary || payload.placementSessionId
          ? {
              sessionId: typeof payload.placementSessionId === "string"
                ? payload.placementSessionId
                : undefined,
              source: typeof payload.placementSource === "string"
                ? payload.placementSource
                : undefined,
              summary: placementSummary,
              affectedIds: placementSummary?.affectedIds,
              diagnostics: placementSummary?.diagnostics
            }
          : undefined,
        signal
      };
    },
    buildPreview: (command, check, before) =>
      buildCommandPreview(command, check.allowedIds, before),
    cleanupInteraction: () => {
      interaction.value = null;
      clearPlacementSession("command-cleanup");
    },
    finalize,
    now,
    isStopped: () => stopped.value,
    onStart: command => {
      if (command.source === "keyboard" && isLayoutCommand(command.type)) {
        interaction.value = "keyboardEditing";
      }
      emit({ type: "command-start", command });
    },
    commit: async ({ command, check, before, startedAt, guardMs }) => {
      try {
        if (isPersistenceCommand(command.type)) {
          const persistenceResult =
            command.type === "save" ? await persistenceBridge.save() :
            command.type === "discard" ? persistenceBridge.discard() :
            persistenceBridge.reset();
          if (persistenceResult.status === "changed") {
            lastSavedSnapshot.value = createSnapshot();
            saveFailed.value = false;
          }
          return finalize(command, { ...persistenceResult, id: command.id }, startedAt, guardMs);
        }

        if (isHistoryCommand(command.type)) {
          const entry = command.type === "undo" ? history?.undo() : history?.redo();
          if (!entry) {
            return finalize(command, createGridEditorCommandResult(command, "blocked", {
              blocked: { reason: "missing-item", message: "No editor history entry is available." }
            }), startedAt, guardMs);
          }
          applySnapshot(command.type === "undo" ? entry.before : entry.after);
          return finalize(command, createGridEditorCommandResult(command, "changed", {
            affectedIds: entry.affectedIds || entry.after.selection.selectedIds,
            selection: selection.value,
            undo: entry,
            diagnostics: {
              durationMs: 0,
              historyMode: "ignore",
              source: command.source,
              origin: command.origin
            }
          }), startedAt, guardMs);
        }

        const result = await executeMutation(command, check.allowedIds, check.blockedIds, before);
        return finalize(command, result, startedAt, guardMs);
      } catch (error) {
        if (error instanceof GridEditorClipboardError) {
          return finalize(command, createGridEditorCommandResult(command, "blocked", {
            targetIds: check.targetIds,
            blocked: {
              reason: error.code,
              itemIds: check.targetIds,
              message: error.message
            },
            error: { message: error.message, cause: error }
          }), startedAt, guardMs);
        }
        return finalize(
          command,
          errorGridEditorCommandResult(command, "Editor command failed.", error),
          startedAt,
          guardMs
        );
      }
    }
  });

  const noteExternalStateRevision = (reason: string) => {
    if (stopped.value || internalStateWriteDepth > 0) return;
    commandKernel.abortPending(reason);
    interaction.value = null;
    clearPlacementSession(reason);
    stateRevision += 1;
    const layout = getLayout();
    const cleanedMeta = removeOrphanEditorMeta(editorMetaById.value, layout);
    if (!deepEqual(cleanedMeta, editorMetaById.value)) {
      editorMetaById.value = cleanedMeta;
    }
    const nextSelection = sanitizeSelectionForLayout(
      selection.value,
      layout,
      editorMetaById.value,
      "external"
    );
    selection.value = nextSelection;
    focusId.value = nextSelection.activeId;
    history?.replacePresent(createSnapshot(), { preserveRedoStack: true });
  };

  if (options.layout) {
    stopHandles.push(watch(layoutRef, () => {
      noteExternalStateRevision("external-layout");
    }, { deep: true, flush: "sync" }));
  }

  if (options.layouts) {
    stopHandles.push(watch(layoutsRef, () => {
      noteExternalStateRevision("external-layouts");
    }, { deep: true, flush: "sync" }));
  }

  const execute = async (
    inputCommand: GridEditorCommand
  ): Promise<GridEditorCommandResult> => {
    return commandKernel.execute(inputCommand);
  };

  const canExecute = (inputCommand: GridEditorCommand): GridEditorCommandResult => {
    const descriptor = requireGridEditorCommandDescriptor(inputCommand.type);
    const command = normalizeGridEditorCommand({
      source: descriptor.defaultSource,
      ...inputCommand,
      history: inputCommand.history || descriptor.defaultHistory
    });
    const check = checkGridEditorCommand(command, {
      mode: mode.value,
      modeMissing,
      layout: getLayout(),
      editorMetaById: editorMetaById.value,
      selection: selection.value,
      commandPolicy: options.commandPolicy,
      itemCapabilities: options.itemCapabilities
    });
    if (check.result) return check.result;
    const validation = descriptor.validatePayload?.(command);
    if (validation && !validation.ok) {
      return blockedGridEditorCommandResult(command, "invalid-input", {
        targetIds: check.targetIds,
        blocked: {
          reason: "invalid-input",
          itemIds: check.targetIds,
          message: validation.message
        }
      });
    }
    return createGridEditorCommandResult(command, "noop", {
      targetIds: check.allowedIds
    });
  };

  const beginPlacement = async (
    input: GridEditorBeginPlacementInput
  ): Promise<GridEditorPlacementSessionResult> => {
    const commandType = input.commandType || (input.source === "paste" ? "paste" : "add");
    if (modeMissing) {
      return blockedPlacementResult(commandType, "editor-mode-missing", "Editor mode is not configured.");
    }
    if (mode.value === "view") {
      return blockedPlacementResult(commandType, "mode-readonly", "Placement requires edit mode.");
    }
    if (stopped.value) {
      return blockedPlacementResult(commandType, "unsupported-scope", "Editor controller is stopped.");
    }
    if (interaction.value) {
      return blockedPlacementResult(commandType, "unsupported-scope", `Cannot start placement while ${interaction.value}.`);
    }
    if (placementSession.value) {
      return blockedPlacementResult(commandType, "command-pending", "A placement session is already active.");
    }

    let resolvedInput: GridEditorBeginPlacementInput = {
      ...input,
      commandType
    };
    const placementEngineOptions = resolveLayoutEngineOptions({
      cols: input.cols,
      maxRows: input.maxRows,
      compactType: input.compactType,
      allowOverlap: input.allowOverlap,
      preventCollision: input.preventCollision
    });
    if (input.source === "paste" || commandType === "paste") {
      const adapter = resolveClipboard();
      let clipboardPayload: Awaited<ReturnType<GridEditorClipboardAdapter["read"]>> | null = null;
      let clipboardError: unknown = null;
      try {
        clipboardPayload = await adapter.read();
      } catch (error) {
        clipboardError = error;
      }
      if ((!clipboardPayload || clipboardError) && adapter !== internalGridEditorClipboard) {
        try {
          clipboardPayload = await internalGridEditorClipboard.read();
        } catch (error) {
          if (!clipboardError) clipboardError = error;
        }
      }
      if (!clipboardPayload && clipboardError) {
        const reason = clipboardError instanceof GridEditorClipboardError
          ? clipboardError.code
          : "clipboard-invalid";
        return blockedPlacementResult(
          "paste",
          reason,
          clipboardError instanceof Error ? clipboardError.message : "Clipboard could not be read."
        );
      }
      if (!clipboardPayload || clipboardPayload.items.length === 0) {
        return blockedPlacementResult(
          "paste",
          "clipboard-unavailable",
          "Clipboard is empty or unavailable."
        );
      }
      const normalizedClipboard = normalizeGridEditorClipboardItemsForTarget(clipboardPayload, {
        cols: input.cols ?? placementEngineOptions?.cols
      });
      const mapped = mapIds(
        normalizedClipboard.items,
        clipboardPayload.editorMetaById,
        new Set(getLayout().map(item => item.i)),
        options.idGenerator || defaultIdGenerator
      );
      const resolvedClipboardPayload: GridEditorResolvedPastePayload = {
        items: mapped.items,
        editorMetaById: mapped.metaById,
        sourceId: clipboardPayload.sourceId,
        source: clipboardPayload.version === 2 ? clipboardPayload.source : undefined,
        originalGeometryById: clipboardPayload.version === 2
          ? clipboardPayload.originalGeometryById
          : undefined,
        responsive: {
          scaled: normalizedClipboard.scaled,
          sourceCols: normalizedClipboard.sourceCols,
          targetCols: normalizedClipboard.targetCols
        },
        mapped: true
      };
      resolvedInput = {
        ...resolvedInput,
        commandType: "paste",
        items: mapped.items,
        editorMetaById: mapped.metaById,
        resolvedClipboardPayload
      };
    } else {
      resolvedInput = prepareAddPlacementInput(resolvedInput);
    }

    const placementInput: GridEditorBeginPlacementInput = {
      ...resolvedInput,
      compactType: resolvedInput.compactType ?? placementEngineOptions?.compactType,
      allowOverlap: resolvedInput.allowOverlap ?? placementEngineOptions?.allowOverlap,
      preventCollision: resolvedInput.preventCollision ?? placementEngineOptions?.preventCollision
    };

    const session = createGridEditorPlacementSession(placementInput, {
      baseLayout: getLayout(),
      baseRevision: stateRevision,
      defaultStrategy: placementInput.strategy || (commandType === "paste" ? options.pasteStrategy || "offset" : "first-fit"),
      cols: placementInput.cols,
      maxRows: placementInput.maxRows
    });

    if (session.items.length === 0 || (session.blocked && session.ghostItems.length === 0)) {
      return blockedPlacementResult(
        commandType,
        session.blocked?.reason || "invalid-input",
        session.blocked?.message || "No items were provided for placement.",
        session.blocked?.itemIds,
        placementSessionDiagnostics(session)
      );
    }

    placementSession.value = session;
    emit({ type: "placement-start", session });
    return {
      status: session.blocked ? "blocked" : "started",
      session,
      blocked: session.blocked
        ? {
            reason: session.blocked.reason,
            itemIds: session.blocked.itemIds,
            message: session.blocked.message
          }
        : undefined,
      diagnostics: placementSessionDiagnostics(session)
    };
  };

  const updatePlacement = (
    input: Parameters<GridEditorController["updatePlacement"]>[0]
  ): ReturnType<GridEditorController["updatePlacement"]> => {
    const active = placementSession.value;
    if (!active) {
      return { status: "noop" };
    }
    const next = updateGridEditorPlacementSession(active, input);
    placementSession.value = next;
    emit({ type: "placement-update", session: next });
    return {
      status: next.blocked ? "blocked" : "updated",
      session: next,
      blocked: next.blocked
        ? {
            reason: next.blocked.reason,
            itemIds: next.blocked.itemIds,
            message: next.blocked.message
          }
        : undefined,
      diagnostics: placementSessionDiagnostics(next)
    };
  };

  const cancelPlacement = (
    reason = "cancelled"
  ): ReturnType<GridEditorController["cancelPlacement"]> => {
    const active = placementSession.value;
    if (!active) return { status: "noop" };
    const result = cancelGridEditorPlacementSession(active, reason);
    clearPlacementSession(reason);
    return result;
  };

  const shouldKeepPlacementAfterBlockedCommit = (
    result: GridEditorCommandResult
  ): boolean => {
    const reason = result.blocked?.reason;
    return result.status === "blocked" && (
      reason === "bounds" ||
      reason === "collision" ||
      reason === "maxRows" ||
      reason === "section-row-policy" ||
      reason === "invalid-input"
    );
  };

  const commitPlacement = async (
    input: Parameters<GridEditorController["commitPlacement"]>[0] = {}
  ): Promise<GridEditorCommandResult> => {
    const active = placementSession.value;
    if (!active) {
      return createGridEditorCommandResult({
        id: `placement-commit:noop:${Date.now()}`,
        type: "add"
      }, "noop");
    }
    if (!active.candidateLayout || active.blocked) {
      const result = createGridEditorCommandResult({
        id: `placement-commit:blocked:${active.id}`,
        type: active.commandType
      }, "blocked", {
        targetIds: active.items.map(item => item.i),
        blocked: {
          reason: active.blocked?.reason || "invalid-input",
          itemIds: active.blocked?.itemIds || active.items.map(item => item.i),
          message: active.blocked?.message || "Placement does not have a valid candidate."
        },
        diagnostics: placementSessionDiagnostics(active)
      });
      lastResult.value = result;
      return result;
    }
    if (stateRevision !== active.baseRevision) {
      const diagnostics = placementSessionDiagnostics(active) || { durationMs: 0 };
      const result = createGridEditorCommandResult({
        id: `placement-commit:stale:${active.id}`,
        type: active.commandType
      }, "blocked", {
        targetIds: active.items.map(item => item.i),
        blocked: {
          reason: "stale-command",
          itemIds: active.items.map(item => item.i),
          message: "Placement base layout changed before commit."
        },
        diagnostics: {
          ...diagnostics,
          durationMs: diagnostics.durationMs || 0,
          stale: true,
          stateRevision
        }
      });
      lastResult.value = result;
      clearPlacementSession("stale-command");
      return result;
    }

    const committing = {
      ...active,
      phase: "committing" as const,
      ghostItems: active.ghostItems.map(item => ({ ...item, state: "committing" as const }))
    };
    placementSession.value = committing;
    const command = buildGridEditorPlacementCommitCommand(committing, input);
    const result = await execute(command);
    emit({ type: "placement-commit", sessionId: committing.id, result });
    if (
      result.status === "changed" ||
      result.status === "noop" ||
      input?.autoCancelOnBlocked === true ||
      !shouldKeepPlacementAfterBlockedCommit(result)
    ) {
      clearPlacementSession(result.status);
    } else {
      const next = updateGridEditorPlacementSession(active, {});
      placementSession.value = {
        ...next,
        blocked: {
          reason: result.blocked?.reason || next.blocked?.reason || "invalid-input",
          itemIds: result.blocked?.itemIds || next.blocked?.itemIds,
          message: result.blocked?.message || next.blocked?.message,
          recoverable: true
        },
        phase: "blocked"
      };
    }
    return result;
  };

  const resolveExternalHistoryPolicy = (
    input: GridEditorCommand["history"] | undefined
  ): GridEditorHistoryPolicy => normalizeGridEditorHistoryPolicy(input, "ignore");

  const applyExternalHistoryPolicy = (policy: GridEditorHistoryPolicy) => {
    if (!history) return;
    if (policy.mode === "clear") {
      history.clear(createSnapshot());
      return;
    }
    if (policy.mode === "replace") {
      history.replacePresent(createSnapshot(), {
        preserveRedoStack: policy.preserveRedoStack
      });
      return;
    }
    history.replacePresent(createSnapshot(), {
      preserveRedoStack: policy.preserveRedoStack ?? true
    });
  };

  const setExternalLayout = (
    layout: Layout,
    reason = "external",
    externalOptions: Parameters<GridEditorController["setExternalLayout"]>[2] = {}
  ) => {
    const historyPolicy = resolveExternalHistoryPolicy(externalOptions.history);
    commandKernel.abortPending(externalOptions.origin || reason);
    interaction.value = null;
    setLayout(layout);
    stateRevision += 1;
    editorMetaById.value = removeOrphanEditorMeta(editorMetaById.value, layout);
    setSelection(sanitizeSelectionForLayout(selection.value, layout, editorMetaById.value, "external"));
    applyExternalHistoryPolicy(historyPolicy);
    emit({
      type: "editor-state-change",
      state: state.value,
      reason: externalOptions.origin || reason
    });
  };

  const setExternalLayouts = (
    layouts: LayoutsMap,
    breakpoint: string,
    reason = "external",
    externalOptions: Parameters<GridEditorController["setExternalLayouts"]>[3] = {}
  ) => {
    const historyPolicy = resolveExternalHistoryPolicy(externalOptions.history);
    commandKernel.abortPending(externalOptions.origin || reason);
    interaction.value = null;
    setLayouts(layouts, breakpoint);
    const layout = layouts[breakpoint] || [];
    stateRevision += 1;
    editorMetaById.value = removeOrphanEditorMeta(editorMetaById.value, layout);
    setSelection(sanitizeSelectionForLayout(selection.value, layout, editorMetaById.value, "external"));
    applyExternalHistoryPolicy(historyPolicy);
    emit({
      type: "editor-state-change",
      state: state.value,
      reason: externalOptions.origin || reason
    });
  };

  if (modeMissing) {
    emit({
      type: "editor-error",
      code: "editor-mode-missing",
      message: "Grid editor was enabled without mode or defaultMode; falling back to view."
    });
  }

  let beforeModeChangeLayout = getLayout();
  stopHandles.push(watch(mode, (next, previous) => {
    if (next === previous) return;
    if (next === "view" && interaction.value) {
      interaction.value = null;
      setLayout(beforeModeChangeLayout);
    } else {
      beforeModeChangeLayout = getLayout();
    }
    if (next === "view") {
      guides.value = { ...EMPTY_GUIDES };
      clearPlacementSession("mode-readonly");
    }
    emit({ type: "mode-change", from: previous, to: next, source: "external" });
  }));

  stopHandles.push(watch(() => state.value, (next, previous) => {
    if (next === previous) return;
    emit({
      type: "editor-state-change",
      state: next,
      previous,
      reason: "derived-state"
    });
  }));

  if (options.selectedIds) {
    stopHandles.push(watch(options.selectedIds, ids => {
      commandKernel.abortPending("external-selection");
      stateRevision += 1;
      selection.value = sanitizeSelectionForLayout(
        createGridEditorSelection(ids, "external"),
        getLayout(),
        editorMetaById.value,
        "external"
      );
      focusId.value = selection.value.activeId;
      history?.replacePresent(createSnapshot(), { preserveRedoStack: true });
    }, { flush: "sync" }));
  }

  stopHandles.push(watch(editorMetaById, meta => {
    const sanitized = sanitizeEditorMetaById(meta, { layout: getLayout() });
    if (!deepEqual(sanitized, meta)) editorMetaById.value = sanitized;
  }, { deep: true }));

  stopHandles.push(watch(sectionRows, rows => {
    const normalized = normalizeGridEditorSectionRows(rows, getLayout());
    const sanitized: GridEditorSectionRowState = {
      version: 1,
      items: normalized.items,
      itemMembership: normalized.itemMembership
    };
    if (!deepEqual(sanitized, rows)) sectionRows.value = sanitized;
    const collapsedSelectedIds = selection.value.selectedIds.filter(id => {
      const membership = normalized.itemMembership[id];
      const section = membership?.sectionId ? normalized.items[membership.sectionId] : undefined;
      const row = membership?.rowId ? normalized.items[membership.rowId] : undefined;
      return section?.collapsed || row?.collapsed;
    });
    if (collapsedSelectedIds.length > 0) {
      setSelection(createGridEditorSelection(
        selection.value.selectedIds.filter(id => !collapsedSelectedIds.includes(id)),
        "api"
      ));
    }
  }, { deep: true }));

  const controller: GridEditorController = {
    mode,
    state,
    selection,
    editorMetaById,
    sectionRows,
    placementSession,
    dirty,
    conflict,
    guides,
    lastResult,
    execute,
    canExecute,
    beginPlacement,
    updatePlacement,
    commitPlacement,
    cancelPlacement,
    getToolbarState: () => deriveGridEditorToolbarState(controller),
    undo: () => execute({ type: "undo", source: "api" }),
    redo: () => execute({ type: "redo", source: "api" }),
    save: () => execute({ type: "save", source: "api" }),
    discard: () => execute({ type: "discard", source: "api" }),
    reset: () => execute({ type: "reset", source: "api" }),
    setExternalLayout,
    setExternalLayouts,
    stop() {
      if (stopped.value) return;
      stopped.value = true;
      commandKernel.abortPending("editor-stop");
      clearPlacementSession("editor-stop");
      stopHandles.forEach(stop => stop());
      persistenceController?.stop();
    }
  };

  return controller;
};

export const useGridEditor = createGridEditorController;
