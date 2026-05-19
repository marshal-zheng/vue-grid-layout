import { computed, ref, watch, type Ref, type WatchStopHandle } from "vue";
import { deepEqual } from "fast-equals";
import {
  cloneLayout,
  cloneLayoutItem,
  findFirstFit,
  findNearestFit,
  getAllCollisions,
  getLayoutItem,
  type Layout,
  type LayoutItem,
  type CompactType
} from "../utils";
import {
  executeLayoutOperation
} from "../layout-engine";
import type {
  GridLayoutEngineOptions,
  LayoutBlockedReason,
  LayoutOperation,
  LayoutOperationResult
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
  systemClipboardAdapter
} from "./clipboard";
import {
  checkGridEditorCommand,
  collectAffectedIds,
  collectEditorLayoutPatches,
  createGridEditorCommandResult,
  errorGridEditorCommandResult,
  isHistoryCommand,
  isLayoutCommand,
  isMetadataCommand,
  isPersistenceCommand,
  isSectionRowCommand,
  normalizeGridEditorCommand,
  runGridEditorBeforeCommand,
  shouldRecordGridEditorHistory
} from "./commands";
import {
  createGridEditorPersistenceBridge
} from "./persistenceBridge";
import {
  applyGridEditorAlign,
  applyGridEditorDistribute,
  applyGridEditorTidy
} from "./geometryCommands";
import {
  deriveGridEditorToolbarState
} from "./toolbar";
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
  GridEditorMetaById,
  GridEditorMetadataPatch,
  GridEditorMode,
  GridEditorTidyPayload,
  GridEditorSelectionState,
  GridEditorSectionRowCommandPayload,
  GridEditorSectionRowState,
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
  const lastResult = ref<GridEditorCommandResult | null>(null);
  const interaction = ref<"dragging" | "resizing" | "keyboardEditing" | null>(null);
  const saveFailed = ref(false);
  const savePending = ref(false);
  const focusId = ref<string | null>(selection.value.activeId);
  const stopped = ref(false);
  const stopHandles: WatchStopHandle[] = [];

  const emit = (event: GridEditorEvent) => {
    options.onEvent?.(event);
  };

  const getLayout = (): Layout => kind === "responsive"
    ? cloneLayout(layoutsRef.value[breakpointRef.value] || [])
    : cloneLayout(layoutRef.value);

  const setLayout = (layout: Layout) => {
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
  };

  const getLayouts = (): LayoutsMap => kind === "responsive"
    ? cloneLayoutsMap(layoutsRef.value)
    : { default: cloneLayout(layoutRef.value) };

  const setLayouts = (layouts: LayoutsMap, breakpoint: string = breakpointRef.value) => {
    layoutsRef.value = cloneLayoutsMap(layouts);
    breakpointRef.value = breakpoint;
    if (options.layout) {
      layoutRef.value = cloneLayout(layouts[breakpoint] || []);
    }
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
      editorMetaById.value = sanitizeEditorMetaById(meta, { layout: getLayout() });
      if (reason === "save-success" || reason === "load-success") {
        lastSavedSnapshot.value = createSnapshot();
      }
    },
    setSectionRows: (rows, reason) => {
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

  const setFocus = (nextFocusId: string | null, reason: string) => {
    const previous = focusId.value;
    if (previous === nextFocusId) return;
    focusId.value = nextFocusId;
    emit({ type: "focus-change", from: previous, to: nextFocusId, reason });
  };

  const finalize = (
    command: ReturnType<typeof normalizeGridEditorCommand>,
    result: GridEditorCommandResult,
    startedAt: number,
    guardMs = result.diagnostics?.guardMs || 0
  ): GridEditorCommandResult => {
    const finalResult = {
      ...result,
      diagnostics: {
        ...result.diagnostics,
        durationMs: now() - startedAt,
        guardMs
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
    result: GridEditorCommandResult
  ): GridEditorCommandResult => {
    if (!history || !shouldRecordGridEditorHistory(command.type) || command.history?.skip) {
      return result;
    }
    const after = createSnapshot();
    const entry = createGridEditorHistoryEntry({
      commandId: command.id,
      commandType: command.type,
      before,
      after,
      mergeKey: command.history?.mergeKey
    });
    history.push(entry);
    result.undo = entry;

    if (kind === "layout") {
      options.legacyHistoryStore?.push(getLayout());
    }
    return result;
  };

  const applyLayoutAndMetadata = (
    layout: Layout,
    metadataPatches: GridEditorMetadataPatch[]
  ) => {
    setLayout(layout);
    if (metadataPatches.length > 0) {
      editorMetaById.value = applyEditorMetadataPatches(
        editorMetaById.value,
        metadataPatches
      );
    }
    const cleanedMeta = removeOrphanEditorMeta(editorMetaById.value, layout);
    if (!deepEqual(cleanedMeta, editorMetaById.value)) {
      editorMetaById.value = cleanedMeta;
    }
    const nextSelection = sanitizeSelectionForLayout(
      selection.value,
      layout,
      editorMetaById.value,
      "api"
    );
    setSelection(nextSelection);
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

  const placeNewItems = (
  sourceLayout: Layout,
  items: Layout,
  strategy: string,
  payload: Record<string, unknown>
  ): { layout: Layout; failed: boolean } => {
    const cols = isFiniteGridNumber(payload.cols) ? payload.cols : 12;
    const maxRows = isFiniteGridNumber(payload.maxRows) ? payload.maxRows : Infinity;
    const offset = isFiniteGridNumber(payload.offset) ? payload.offset : 1;
    const target = payload.cursor && typeof payload.cursor === "object"
      ? payload.cursor as { x?: unknown; y?: unknown }
      : null;
    const nextLayout = cloneLayout(sourceLayout);
    let failed = false;

    items.forEach((item, index) => {
      let x = isFiniteGridNumber(item.x) ? item.x : 0;
      let y = isFiniteGridNumber(item.y) ? item.y : 0;

      if (strategy === "offset") {
        x += offset * (index + 1);
        y += offset * (index + 1);
      } else if (strategy === "nearest-fit" || strategy === "cursor") {
        const fit = findNearestFit(
          nextLayout,
          item,
          cols,
          isFiniteGridNumber(target?.x) ? target.x : x,
          isFiniteGridNumber(target?.y) ? target.y : y,
          maxRows
        );
        if (fit) {
          x = fit.x;
          y = fit.y;
        }
      } else {
        const fit = findFirstFit(nextLayout, item, cols, maxRows);
        if (fit) {
          x = fit.x;
          y = fit.y;
        }
      }

      const candidate = {
        ...item,
        x: Math.max(0, Math.floor(x)),
        y: Math.max(0, Math.floor(y))
      };
      const outOfBounds = candidate.x + candidate.w > cols ||
        (Number.isFinite(maxRows) && candidate.y + candidate.h > maxRows);
      const hasCollision = getAllCollisions(nextLayout, candidate).length > 0;
      if (outOfBounds || hasCollision) {
        const fit = findFirstFit(nextLayout, item, cols, maxRows);
        if (!fit) {
          failed = true;
          return;
        }
        nextLayout.push({ ...candidate, x: fit.x, y: fit.y });
        return;
      }
      nextLayout.push(candidate);
    });

    return { layout: nextLayout, failed };
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
      applyLayoutAndMetadata(nextLayout, metadataPatches);
      sectionRows.value = {
        version: 1,
        items: normalizedNextRows.items,
        itemMembership: normalizedNextRows.itemMembership
      };
      if (!deepEqual(selection.value.selectedIds, nextSelectionIds) || focusId.value !== nextFocusId) {
        setSelection(createGridEditorSelection(nextSelectionIds, "api"));
        setFocus(nextFocusId, command.type);
      }
      const affectedIds = Array.from(new Set([...rowIds, ...affectedItemIds]));
      return commitHistory(command, before, createGridEditorCommandResult(command, "changed", {
        targetIds: rowIds,
        layoutPatches,
        metadataPatches,
        affectedIds,
        selection: selection.value,
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
      }));
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
      const applied = setSelection(nextSelection);
      return createGridEditorCommandResult(command, deepEqual(previousSelection, applied) ? "noop" : "changed", {
        targetIds: applied.selectedIds,
        selection: applied
      });
    }

    if (command.type === "clearSelection") {
      const previousSelection = selection.value;
      const applied = setSelection(clearEditorSelection("api"));
      return createGridEditorCommandResult(command, deepEqual(previousSelection, applied) ? "noop" : "changed", {
        selection: applied
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
        if (operationResult.status === "changed" || operationResult.status === "fallback") {
          applyLayoutAndMetadata(operationResult.layout, metadataPatches);
        }
        const affectedIds = operationResult.affectedIds;
        const status = layoutPatches.length > 0 || operationResult.status === "changed" || operationResult.status === "fallback"
          ? "changed"
          : "noop";
        const result = createGridEditorCommandResult(command, status, {
          targetIds,
          layoutPatches,
          metadataPatches,
          affectedIds,
          selection: selection.value,
          blocked: blockedIds.length > 0
            ? { reason: "capability", skippedIds: blockedIds, itemIds: blockedIds }
            : undefined,
          diagnostics: resultDiagnostics
        });
        return commitHistory(command, before, result);
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
      const placed = placeNewItems(nextLayout, items, String(payload.strategy || "first-fit"), payload);
      if (placed.failed) {
        return createGridEditorCommandResult(command, "blocked", {
          blocked: {
            reason: "bounds",
            message: "One or more items could not fit in the current layout."
          }
        });
      }
      nextLayout = placed.layout;
    } else if (command.type === "delete") {
      const deleted = new Set(allowedIds);
      nextLayout = nextLayout.filter(item => !deleted.has(item.i));
      allowedIds.forEach(id => {
        if (editorMetaById.value[id]) {
          metadataPatches.push({ type: "remove", id, previous: editorMetaById.value[id] });
        }
      });
      setFocus(getNextFocusableId(nextLayout, allowedIds, editorMetaById.value), "delete");
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
      const placed = placeNewItems(
        nextLayout,
        mapped.items,
        String(payload.strategy || options.pasteStrategy || "offset"),
        payload
      );
      if (placed.failed) {
        return createGridEditorCommandResult(command, "blocked", {
          targetIds: allowedIds,
          blocked: {
            reason: "bounds",
            itemIds: allowedIds,
            message: "Duplicated items could not fit in the current layout."
          }
        });
      }
      nextLayout = placed.layout;
      setSelection(createGridEditorSelection(mapped.items.map(item => item.i), "api"));
    } else if (command.type === "copy") {
      const items = allowedIds
        .map(id => getLayoutItem(layout, id))
        .filter(Boolean) as LayoutItem[];
      await writeClipboard(resolveClipboard(), createGridEditorClipboardPayload({
        sourceId: command.id,
        items,
        editorMetaById: sanitizeEditorMetaById(editorMetaById.value, { layout: items })
      }));
      return createGridEditorCommandResult(command, "changed", {
        targetIds: allowedIds,
        affectedIds: allowedIds
      });
    } else if (command.type === "paste") {
      const clipboardPayload = await readClipboard(resolveClipboard());
      if (!clipboardPayload) {
        return createGridEditorCommandResult(command, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      }
      const mapped = mapIds(
        clipboardPayload.items,
        clipboardPayload.editorMetaById,
        new Set(layout.map(item => item.i)),
        options.idGenerator || defaultIdGenerator
      );
      Object.keys(mapped.metaById).forEach(id => {
        metadataPatches.push({ type: "set", id, next: mapped.metaById[id] });
      });
      const placed = placeNewItems(
        nextLayout,
        mapped.items,
        String(payload.strategy || options.pasteStrategy || "offset"),
        payload
      );
      if (placed.failed) {
        return createGridEditorCommandResult(command, "blocked", {
          blocked: {
            reason: "bounds",
            message: "Clipboard items could not fit in the current layout."
          }
        });
      }
      nextLayout = placed.layout;
      setSelection(createGridEditorSelection(mapped.items.map(item => item.i), "api"));
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
    if (layoutPatches.length > 0 || metadataPatches.length > 0) {
      applyLayoutAndMetadata(nextLayout, metadataPatches);
    }
    const affectedIds = collectAffectedIds(layoutPatches, metadataPatches);
    const status = affectedIds.length > 0 ? "changed" : "noop";
    const result = createGridEditorCommandResult(command, status, {
      targetIds: allowedIds.length > 0 ? allowedIds : command.targetIds,
      layoutPatches,
      metadataPatches,
      affectedIds,
      selection: selection.value,
      blocked: blockedIds.length > 0
        ? { reason: "capability", skippedIds: blockedIds, itemIds: blockedIds }
        : undefined,
      diagnostics: resultDiagnostics
    });
    return commitHistory(command, before, result);
  };

  const execute = async (
    inputCommand: GridEditorCommand
  ): Promise<GridEditorCommandResult> => {
    const command = normalizeGridEditorCommand(inputCommand);
    const startedAt = now();
    if (command.source === "keyboard" && isLayoutCommand(command.type)) {
      interaction.value = "keyboardEditing";
    }
    emit({ type: "command-start", command });

    const before = createSnapshot();
    const check = checkGridEditorCommand(command, {
      mode: mode.value,
      modeMissing,
      layout: getLayout(),
      editorMetaById: editorMetaById.value,
      selection: selection.value,
      commandPolicy: options.commandPolicy
    });

    if (!check.ok && check.result) {
      return finalize(command, check.result, startedAt);
    }

    const guard = await runGridEditorBeforeCommand(
      options.beforeCommand,
      command,
      {
        targetIds: check.allowedIds,
        layout: getLayout(),
        layouts: getLayouts(),
        editorMetaById: editorMetaById.value,
        selection: selection.value,
        mode: mode.value
      },
      options.guardTimeoutMs
    );
    if (guard.result) return finalize(command, guard.result, startedAt, guard.guardMs);

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
        return finalize(command, { ...persistenceResult, id: command.id }, startedAt, guard.guardMs);
      }

      if (isHistoryCommand(command.type)) {
        const entry = command.type === "undo" ? history?.undo() : history?.redo();
        if (!entry) {
          return finalize(command, createGridEditorCommandResult(command, "blocked", {
            blocked: { reason: "missing-item", message: "No editor history entry is available." }
          }), startedAt, guard.guardMs);
        }
        applySnapshot(command.type === "undo" ? entry.before : entry.after);
        return finalize(command, createGridEditorCommandResult(command, "changed", {
          affectedIds: entry.after.selection.selectedIds,
          selection: selection.value,
          undo: entry
        }), startedAt, guard.guardMs);
      }

      const result = await executeMutation(command, check.allowedIds, check.blockedIds, before);
      return finalize(command, result, startedAt, guard.guardMs);
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
        }), startedAt, guard.guardMs);
      }
      return finalize(
        command,
        errorGridEditorCommandResult(command, "Editor command failed.", error),
        startedAt,
        guard.guardMs
      );
    }
  };

  const canExecute = (inputCommand: GridEditorCommand): GridEditorCommandResult => {
    const command = normalizeGridEditorCommand(inputCommand);
    const check = checkGridEditorCommand(command, {
      mode: mode.value,
      modeMissing,
      layout: getLayout(),
      editorMetaById: editorMetaById.value,
      selection: selection.value,
      commandPolicy: options.commandPolicy
    });
    if (check.result) return check.result;
    return createGridEditorCommandResult(command, "noop", {
      targetIds: check.allowedIds
    });
  };

  const setExternalLayout = (layout: Layout, reason = "external") => {
    interaction.value = null;
    setLayout(layout);
    editorMetaById.value = removeOrphanEditorMeta(editorMetaById.value, layout);
    setSelection(sanitizeSelectionForLayout(selection.value, layout, editorMetaById.value, "external"));
    history?.replacePresent(createSnapshot());
    emit({ type: "editor-state-change", state: state.value, reason });
  };

  const setExternalLayouts = (
    layouts: LayoutsMap,
    breakpoint: string,
    reason = "external"
  ) => {
    interaction.value = null;
    setLayouts(layouts, breakpoint);
    const layout = layouts[breakpoint] || [];
    editorMetaById.value = removeOrphanEditorMeta(editorMetaById.value, layout);
    setSelection(sanitizeSelectionForLayout(selection.value, layout, editorMetaById.value, "external"));
    history?.replacePresent(createSnapshot());
    emit({ type: "editor-state-change", state: state.value, reason });
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
      selection.value = createGridEditorSelection(ids, "external");
    }));
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
    dirty,
    conflict,
    guides,
    lastResult,
    execute,
    canExecute,
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
      stopHandles.forEach(stop => stop());
      persistenceController?.stop();
    }
  };

  return controller;
};

export const useGridEditor = createGridEditorController;
