import clsx from "clsx";
import type { Ref } from "vue";
import {
  bindGridEditorKeyboard
} from "../editor/keyboard";
import {
  computeGridEditorIntelligence,
  resolveGridEditorSnap
} from "../editor/intelligence";
import {
  createGridEditorCommandResult
} from "../editor/commands";
import {
  createGridEditorController
} from "../editor/controller";
import {
  createGridEditorPersistenceEnvelope,
  readGridEditorPersistenceEnvelope
} from "../editor/persistenceBridge";
import {
  resolveEditorItemCapability
} from "../editor/metadata";
import {
  resolveAspectRatioResizeCandidate,
  type GridItemAspectRatioConstraint,
  type GridItemResizeMetrics,
  type ResolvedGridItemCapability
} from "../item-capabilities";
import {
  useGridLayoutPersistence,
  type GridLayoutPersistenceController,
  type GridLayoutPersistenceProp,
  type LayoutPersistenceEvent,
  type LayoutPersistenceMeta
} from "../persistence";
import { executeLayoutOperation } from "../layout-engine";
import { cloneLayout, compactType, getLayoutItem } from "../utils";
import type { CompactType, Layout, LayoutItem, ResizeHandleAxis } from "../utils";
import type {
  GridEditorController,
  GridEditorBlockedReason,
  GridEditorGuideInteraction,
  GridEditorGuidesOptions,
  GridEditorItemMeta,
  GridEditorProp,
  GridEditorCommandResult
} from "../editor/types";
import type { GridLayoutEngineBridge } from "./gridInteractionTypes";
import { useGridPlacementInteractions } from "./useGridPlacementInteractions";
import type {
  LayoutOperation,
  LayoutOperationResult,
  LayoutResizeConstraint
} from "../layout-engine";

const pickGeometry = (item: LayoutItem): Pick<LayoutItem, "x" | "y" | "w" | "h"> => ({
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h
});

type GridEditorRuntimeProps = {
  allowOverlap: boolean;
  cols: number;
  compactType: CompactType;
  editor?: false | GridEditorProp;
  persistence?: false | GridLayoutPersistenceProp | GridLayoutPersistenceController<Layout>;
  width?: number;
  margin: number[];
  containerPadding?: number[] | null;
  maxRows: number;
  preventCollision: boolean;
  rowHeight: number;
  renderPrecision?: "integer" | "subpixel" | null;
  transformScale: number;
  verticalCompact: boolean;
  itemCapabilities?: Record<string, ResolvedGridItemCapability>;
  resizeConstraints?: Record<string, GridItemAspectRatioConstraint>;
};

type GridEditorInteractionSnapshot = {
  activeDragId: string | null;
  activeResizeId: string | null;
  dragBlocked: boolean;
  dragBlockedReason?: GridEditorBlockedReason | null;
  dragBlockedItemIds?: string[];
  dragBlockedMessage?: string | null;
  resizeBlocked: boolean;
};

type GridEditorItemDefaults = {
  isBounded: boolean;
  isDraggable: boolean;
  isResizable: boolean;
};

type UseGridEditorRuntimeOptions = {
  props: GridEditorRuntimeProps;
  layoutRef: Ref<Layout>;
  persistenceController: unknown;
  engineBridge: GridLayoutEngineBridge;
  getLayout: () => Layout;
  getOldDragItem: () => LayoutItem | null | undefined;
  getOldResizeItem: () => LayoutItem | null | undefined;
  isDropping: () => boolean;
  getInteractionState: () => GridEditorInteractionSnapshot | null;
};

const emptyGuideState = () => ({
  activeId: null,
  guides: [],
  displayGuides: [],
  debugGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
});

const isGridLayoutPersistenceController = (
  value: unknown
): value is GridLayoutPersistenceController<Layout> =>
  Boolean(value && typeof value === "object" && "save" in value && "commit" in value && "load" in value);

const isGridLayoutPersistenceConfig = (
  value: unknown
): value is Exclude<GridLayoutPersistenceProp, false> =>
  Boolean(value && typeof value === "object" && !isGridLayoutPersistenceController(value));

const resolvePersistenceMeta = (
  meta?: LayoutPersistenceMeta | (() => LayoutPersistenceMeta | undefined)
): LayoutPersistenceMeta =>
  typeof meta === "function" ? { ...(meta() || {}) } : { ...(meta || {}) };

const unsupportedLayoutResult = (
  id: string,
  layout: Layout,
  operation: LayoutOperation
): LayoutOperationResult => ({
  id,
  status: "blocked",
  layout,
  patches: [],
  affectedIds: [],
  collisions: [],
  blocked: {
    reason: "unsupported",
    itemIds: operation.type === "groupMove"
      ? operation.ids
      : "id" in operation
        ? [operation.id]
        : []
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
});

export function useGridEditorRuntime({
  props,
  layoutRef,
  persistenceController,
  engineBridge,
  getLayout,
  getOldDragItem,
  getOldResizeItem,
  isDropping,
  getInteractionState
}: UseGridEditorRuntimeOptions) {
  const config = props.editor && typeof props.editor === "object"
    ? props.editor
    : null;
  const layoutOperationRunner = config?.layoutOperationRunner || ((input: {
    commandId: string;
    layout: Layout;
    operation: LayoutOperation;
    phase: "preview" | "commit";
  }) => {
    const id = `${input.commandId}:layout`;
    if (engineBridge.isLegacyLayoutEngine()) {
      return unsupportedLayoutResult(id, input.layout, input.operation);
    }
    return executeLayoutOperation({
      id,
      phase: input.phase,
      layout: input.layout,
      operation: input.operation,
      options: engineBridge.getLayoutEngineOptions()
    });
  });
  const persistenceInput = persistenceController || props.persistence || config?.persistence;
  let controller: GridEditorController | null = null;
  const resolvedPersistenceController: GridLayoutPersistenceController<Layout> | null =
    config && isGridLayoutPersistenceController(persistenceInput)
      ? persistenceInput
      : config && isGridLayoutPersistenceConfig(persistenceInput)
        ? useGridLayoutPersistence<Layout>({
            ...persistenceInput,
            kind: "layout",
            target: layoutRef,
            watchTarget: false,
            meta: () => ({
              ...resolvePersistenceMeta(persistenceInput.meta),
              editor: createGridEditorPersistenceEnvelope(
                controller?.editorMetaById.value || {},
                controller?.sectionRows.value
              )
            }),
            onEvent: (event: LayoutPersistenceEvent<Layout>) => {
              if (event.type === "load-success" || event.type === "external-apply") {
                const envelope = readGridEditorPersistenceEnvelope(event.document);
                if (envelope.ok && envelope.envelope && controller) {
                  controller.editorMetaById.value = envelope.envelope.editorMetaById;
                  if (envelope.envelope.sectionRows) {
                    controller.sectionRows.value = envelope.envelope.sectionRows;
                  }
                }
                controller?.setExternalLayout(event.value, event.type);
              }
              persistenceInput.onEvent?.(event);
            }
          })
        : null;
  const ownsPersistenceController = Boolean(
    config && resolvedPersistenceController && isGridLayoutPersistenceConfig(persistenceInput)
  );
  controller = config
    ? config.controller || createGridEditorController({
        ...config,
        kind: "layout",
        layout: layoutRef,
        layoutOperationRunner,
        itemCapabilities: props.itemCapabilities,
        resizeConstraints: props.resizeConstraints,
        persistence: (resolvedPersistenceController || config.persistence) as never
      })
    : null;
  let unbindKeyboard: (() => void) | null = null;
  let lastSnapResolution: { nextGuideId?: string } | null = null;
  const placementInteractions = useGridPlacementInteractions({
    controller,
    getGeometry: () => ({
      width: props.width || 0,
      cols: props.cols,
      margin: props.margin,
      maxRows: props.maxRows,
      rowHeight: props.rowHeight,
      containerPadding: props.containerPadding || props.margin,
      transformScale: props.transformScale || 1,
      compactType: compactType(props),
      allowOverlap: props.allowOverlap,
      preventCollision: props.preventCollision
    }),
    stopEvent: event => {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const isEnabled = () => Boolean(controller);
  const isViewMode = () => Boolean(controller && controller.mode.value === "view");
  const isEditMode = () => Boolean(controller && controller.mode.value === "edit");
  const getMetaById = () => controller?.editorMetaById.value || {};
  const guidesEnabled = () => Boolean(controller && config?.guides !== false);
  const getCapabilitySidecar = (id: string): ResolvedGridItemCapability | undefined =>
    props.itemCapabilities?.[id];
  const getResizeConstraintSidecar = (id: string): GridItemAspectRatioConstraint | undefined =>
    props.resizeConstraints?.[id];
  const hasRuntimeSidecar = (id: string): boolean =>
    Boolean(getCapabilitySidecar(id) || getResizeConstraintSidecar(id));

  const resetSnap = () => {
    lastSnapResolution = null;
  };

  const clearGuides = () => {
    if (!controller) return;
    resetSnap();
    controller.guides.value = emptyGuideState();
  };

  const inferGuideInteraction = (activeId: string): GridEditorGuideInteraction => {
    const interaction = getInteractionState();
    if (interaction?.activeResizeId === activeId) return "resize";
    if (isDropping()) return "drop";
    if (interaction?.activeDragId === activeId) return "drag";
    return "api";
  };

  const getInteractionStartGeometry = (
    activeId: string
  ): GridEditorGuidesOptions["startGeometry"] => {
    const interaction = getInteractionState();
    const startItem = interaction?.activeResizeId === activeId
      ? getOldResizeItem()
      : interaction?.activeDragId === activeId
        ? getOldDragItem()
        : null;
    return startItem
      ? { [activeId]: pickGeometry(startItem) }
      : undefined;
  };

  const getGuideOptions = (
    interaction: GridEditorGuideInteraction,
    activeId?: string,
    resizeHandle?: ResizeHandleAxis
  ): GridEditorGuidesOptions => {
    const interactionState = getInteractionState();
    const blocked = interaction === "drag" && interactionState?.dragBlocked
      ? {
          reason: interactionState.dragBlockedReason || "collision" as const,
          itemIds: interactionState.dragBlockedItemIds?.length
            ? interactionState.dragBlockedItemIds
            : activeId ? [activeId] : undefined,
          message: interactionState.dragBlockedMessage || undefined
        }
      : interaction === "resize" && interactionState?.resizeBlocked
        ? { reason: "collision" as const, itemIds: activeId ? [activeId] : undefined }
        : undefined;
    return {
      ...(config?.guides && typeof config.guides === "object" ? config.guides : {}),
      interaction,
      cols: props.cols,
      maxRows: props.maxRows,
      margin: props.margin,
      rowHeight: props.rowHeight,
      startGeometry: activeId ? getInteractionStartGeometry(activeId) : undefined,
      resizeHandle,
      selectionCount: controller?.selection.value.selectedIds.length || 0,
      blocked
    };
  };

  const updateIntelligence = (
    activeId: string,
    activeItem: LayoutItem,
    candidateItem: LayoutItem,
    resizeHandle?: ResizeHandleAxis
  ) => {
    if (!controller || !config || config.guides === false) return null;
    const interaction = inferGuideInteraction(activeId);
    const options = getGuideOptions(interaction, activeId, resizeHandle);
    const intelligence = computeGridEditorIntelligence({
      layout: getLayout(),
      activeItem,
      candidateItem,
      selectionIds: controller.selection.value.selectedIds,
      metaById: getMetaById(),
      sectionRows: controller.sectionRows.value,
      cols: props.cols,
      maxRows: props.maxRows,
      margin: props.margin,
      rowHeight: props.rowHeight,
      compactType: compactType(props),
      allowOverlap: props.allowOverlap,
      preventCollision: props.preventCollision,
      interaction,
      startGeometry: options.startGeometry,
      options
    });
    controller.guides.value = intelligence.guideState;
    config.onEvent?.({
      type: "guide-change",
      guides: controller.guides.value.guides,
      activeId
    });
    config.onEvent?.({
      type: "intelligence-change",
      activeId,
      diagnostics: intelligence.diagnostics
    });
    return { intelligence, options };
  };

  const snapCandidate = (
    activeId: string,
    activeItem: LayoutItem,
    candidateItem: LayoutItem,
    validationLayout?: Layout,
    resizeHandle?: ResizeHandleAxis
  ): LayoutItem => {
    const context = updateIntelligence(activeId, activeItem, candidateItem, resizeHandle);
    if (!context) return candidateItem;
    const previousGuideId = lastSnapResolution?.nextGuideId;
    const resolution = resolveGridEditorSnap(context.intelligence, candidateItem, {
      snap: context.options.snap,
      layout: validationLayout || getLayout(),
      cols: props.cols,
      maxRows: props.maxRows,
      allowOverlap: props.allowOverlap,
      metaById: getMetaById(),
      previousGuideId
    });
    if (resolution.status === "snapped" || previousGuideId !== resolution.nextGuideId) {
      config?.onEvent?.({
        type: "snap-change",
        activeId,
        previousGuideId,
        nextGuideId: resolution.nextGuideId,
        snapKind: resolution.snapKind,
        geometry: resolution.geometry
      });
    }
    lastSnapResolution = resolution;
    if (resolution.status !== "snapped") return candidateItem;
    return {
      ...candidateItem,
      ...resolution.geometry
    };
  };

  const reasonForCapability = (
    item: LayoutItem,
    meta: GridEditorItemMeta | undefined,
    capability?: ResolvedGridItemCapability | null
  ): GridEditorBlockedReason => {
    if (capability?.locked || meta?.locked) return "locked";
    if (capability?.visible === false || meta?.visible === false) return "hidden";
    if (capability?.static || item.static) return "static-item";
    return "capability";
  };

  const hydrateResizeConstraint = (
    constraint: LayoutResizeConstraint | undefined,
    metrics: GridItemResizeMetrics | undefined,
    startGeometry: Pick<LayoutItem, "x" | "y" | "w" | "h"> | undefined
  ): LayoutResizeConstraint | undefined => {
    if (!constraint) return undefined;
    return {
      ...constraint,
      aspectRatio: constraint.aspectRatio
        ? {
            ...constraint.aspectRatio,
            metrics: constraint.aspectRatio.metrics || metrics,
            startGeometry: constraint.aspectRatio.startGeometry || startGeometry
          }
        : undefined
    };
  };

  const resolveRuntimeCapability = (
    item: LayoutItem,
    defaults: GridEditorItemDefaults,
    metrics?: GridItemResizeMetrics
  ): ResolvedGridItemCapability | null => {
    const sidecar = getCapabilitySidecar(item.i);
    const explicitConstraint = getResizeConstraintSidecar(item.i);
    if (sidecar) {
      const startGeometry = pickGeometry(getOldResizeItem() || item);
      return {
        ...sidecar,
        resizeConstraint: hydrateResizeConstraint(
          explicitConstraint
            ? {
                ...sidecar.resizeConstraint,
                aspectRatio: explicitConstraint,
                handlePolicy: sidecar.resizeConstraint?.handlePolicy || {
                  allowedHandles: sidecar.resizeHandles,
                  blockedReason: "handle-disabled"
                }
              }
            : sidecar.resizeConstraint,
          metrics,
          startGeometry
        )
      };
    }

    const compatibility = resolveEditorItemCapability(item, getMetaById()[item.i], defaults);
    return {
      id: compatibility.id,
      visible: compatibility.visible,
      editable: compatibility.editable,
      draggable: compatibility.draggable,
      resizable: compatibility.resizable,
      bounded: compatibility.bounded,
      static: compatibility.source.layoutStatic === true,
      locked: compatibility.locked,
      resizeHandles: compatibility.resizeHandles || [],
      deletable: compatibility.deletable,
      duplicatable: compatibility.duplicatable,
      copyable: compatibility.copyable,
      resizeConstraint: explicitConstraint || compatibility.resizeHandles
        ? {
            handlePolicy: compatibility.resizeHandles
              ? {
                  allowedHandles: compatibility.resizeHandles,
                  blockedReason: "handle-disabled"
                }
              : undefined,
            aspectRatio: explicitConstraint
          }
        : undefined,
      sources: compatibility.source.capabilitySources || {},
      sourceLists: {},
      diagnostics: compatibility.diagnostics || []
    };
  };

  const resolveResizeIntent = (input: {
    id: string;
    item: LayoutItem;
    layout: Layout;
    handle: ResizeHandleAxis;
    rawCandidate: LayoutItem;
    metrics?: GridItemResizeMetrics;
    phase: "preview" | "commit";
  }) => {
    const hasSidecar = hasRuntimeSidecar(input.id);
    if (!controller && !hasSidecar) {
      return { kind: "allowed" as const, candidate: input.rawCandidate };
    }
    if (controller && !isEditMode()) {
      return {
        kind: "blocked" as const,
        reason: "mode-readonly" as const,
        ids: [input.id],
        message: "Resize is disabled outside edit mode."
      };
    }
    const capability = resolveRuntimeCapability(
      input.item,
      { isDraggable: true, isResizable: true, isBounded: true },
      input.metrics
    );
    if (!capability || !capability.resizable) {
      return {
        kind: "blocked" as const,
        reason: reasonForCapability(input.item, getMetaById()[input.id], capability),
        ids: [input.id],
        diagnostics: capability?.diagnostics
      };
    }
    const constraint = hydrateResizeConstraint(
      capability.resizeConstraint,
      input.metrics,
      pickGeometry(getOldResizeItem() || input.item)
    );
    const allowedHandles = constraint?.handlePolicy?.allowedHandles;
    if (allowedHandles && allowedHandles.indexOf(input.handle) === -1) {
      return {
        kind: "blocked" as const,
        reason: "handle-disabled" as const,
        ids: [input.id],
        message: "Resize handle is disabled by item capability policy.",
        diagnostics: capability.diagnostics
      };
    }
    if (constraint?.aspectRatio?.enabled) {
      const ratioResult = resolveAspectRatioResizeCandidate({
        startItem: {
          ...input.item,
          ...pickGeometry(getOldResizeItem() || input.item)
        },
        rawCandidate: input.rawCandidate,
        handle: input.handle,
        constraint: constraint.aspectRatio,
        bounds: {
          cols: props.cols,
          maxRows: props.maxRows,
          minW: input.item.minW,
          minH: input.item.minH,
          maxW: input.item.maxW,
          maxH: input.item.maxH
        }
      });
      if (ratioResult.kind === "blocked") {
        return {
          kind: "blocked" as const,
          reason: ratioResult.reason,
          ids: [input.id],
          diagnostics: ratioResult.diagnostics
        };
      }
      return {
        kind: "allowed" as const,
        candidate: ratioResult.candidate,
        constraint,
        diagnostics: ratioResult.diagnostics
      };
    }
    return {
      kind: "allowed" as const,
      candidate: input.rawCandidate,
      constraint,
      diagnostics: capability.diagnostics
    };
  };

  const resolveMoveDrag = (input: {
    id: string;
    item: LayoutItem;
    layout: Layout;
    legacyLayoutEngine: boolean;
    event?: Event;
  }) => {
    if (!controller) return { kind: "single" as const, id: input.id };
    if (!isEditMode()) {
      return {
        kind: "blocked" as const,
        reason: "mode-readonly" as const,
        ids: [input.id],
        activeId: input.id
      };
    }

    const metaById = getMetaById();
    const draggedCapability = resolveEditorItemCapability(
      input.item,
      metaById[input.id],
      { isDraggable: true, isResizable: true, isBounded: true }
    );
    if (!draggedCapability.draggable) {
      return {
        kind: "blocked" as const,
        reason: reasonForCapability(input.item, metaById[input.id]),
        ids: [input.id],
        activeId: input.id
      };
    }

    const selection = controller.selection.value;
    const selectedIds = selection.selectedIds.filter(Boolean);
    const selectionModifier =
      typeof MouseEvent !== "undefined" &&
      input.event instanceof MouseEvent &&
      (input.event.metaKey || input.event.ctrlKey || input.event.shiftKey);
    const isSelectedGroupDrag = selectedIds.length > 1 && selectedIds.includes(input.id);
    if (!isSelectedGroupDrag) {
      if (!selectedIds.includes(input.id) && !selectionModifier) {
        void controller.execute({
          type: "select",
          targetIds: [input.id],
          payload: { id: input.id },
          source: "pointer",
          history: { skip: true }
        });
      }
      return { kind: "single" as const, id: input.id };
    }

    const allowedIds: string[] = [];
    const blockedIds: string[] = [];
    let blockedReason: GridEditorBlockedReason = "capability";
    selectedIds.forEach(id => {
      const item = getLayoutItem(input.layout, id);
      if (!item) {
        blockedIds.push(id);
        blockedReason = "missing-item";
        return;
      }
      const capability = resolveEditorItemCapability(
        item,
        metaById[id],
        { isDraggable: true, isResizable: true, isBounded: true }
      );
      if (capability.draggable) {
        allowedIds.push(id);
      } else {
        blockedIds.push(id);
        blockedReason = reasonForCapability(item, metaById[id]);
      }
    });

    if (blockedIds.length > 0 && config?.commandPolicy !== "skip-blocked") {
      return {
        kind: "blocked" as const,
        reason: blockedReason,
        ids: blockedIds,
        activeId: input.id
      };
    }
    if (input.legacyLayoutEngine) {
      return {
        kind: "blocked" as const,
        reason: "unsupported" as const,
        ids: allowedIds,
        activeId: input.id
      };
    }
    if (allowedIds.length === 0) {
      return {
        kind: "blocked" as const,
        reason: blockedReason,
        ids: blockedIds.length > 0 ? blockedIds : [input.id],
        activeId: input.id
      };
    }
    return {
      kind: "group" as const,
      activeId: input.id,
      ids: allowedIds
    };
  };

  const notifyMoveBlocked = (input: {
    reason: GridEditorBlockedReason;
    ids: string[];
    activeId?: string;
    message?: string;
    operationResult?: LayoutOperationResult;
  }) => {
    if (!controller) return;
    const command = {
      id: `pointer-move-blocked:${input.activeId || input.ids[0] || "layout"}:${Date.now()}`,
      type: "move" as const,
      targetIds: input.ids,
      source: "pointer" as const
    };
    const result = createGridEditorCommandResult(command, "blocked", {
      targetIds: input.ids,
        blocked: {
          reason: input.reason,
          itemIds: input.ids,
          message: input.message || `Pointer move blocked by ${input.reason}.`
        },
        diagnostics: input.operationResult
          ? {
              durationMs: 0,
              layoutDiagnostics: input.operationResult.diagnostics,
              operationResult: input.operationResult
            }
          : undefined
      });
    controller.lastResult.value = result;
    config?.onEvent?.({ type: "command-blocked", command, result });
  };

  const applyCommittedLayout = (layout: Layout) => {
    layoutRef.value = cloneLayout(layout);
  };

  const commitPersistence = (result: GridEditorCommandResult | null) => {
    if (result?.status === "changed") {
      resolvedPersistenceController?.commit(layoutRef.value, { source: "component" });
    }
  };

  const commitMove = async (input: {
    ids: string[];
    activeId?: string;
    beforeLayout: Layout;
    afterLayout: Layout;
    source?: "pointer" | "drop";
  }) => {
    if (!controller) return null;
    applyCommittedLayout(input.beforeLayout);
    const result = await controller.execute({
      type: "move",
      targetIds: input.ids,
      source: input.source || "pointer",
      payload: {
        activeId: input.activeId,
        candidateLayout: input.afterLayout,
        cols: props.cols,
        maxRows: props.maxRows,
        compactType: props.compactType,
        allowOverlap: props.allowOverlap,
        preventCollision: props.preventCollision
      }
    });
    commitPersistence(result);
    return result;
  };

  const commitResize = async (input: {
    id: string;
    beforeLayout: Layout;
    afterLayout: Layout;
    handle?: ResizeHandleAxis;
  }) => {
    if (!controller) return null;
    applyCommittedLayout(input.beforeLayout);
    const result = await controller.execute({
      type: "resize",
      targetIds: [input.id],
      source: "pointer",
      payload: {
        handle: input.handle,
        candidateLayout: input.afterLayout,
        cols: props.cols,
        maxRows: props.maxRows,
        compactType: props.compactType,
        allowOverlap: props.allowOverlap,
        preventCollision: props.preventCollision
      }
    });
    commitPersistence(result);
    return result;
  };

  const commitDrop = async (input: {
    id: string;
    beforeLayout: Layout;
    afterLayout: Layout;
    item?: LayoutItem;
    event?: Event;
  }) => {
    if (!controller) return null;
    applyCommittedLayout(input.beforeLayout);
    const result = await controller.execute({
      type: "add",
      targetIds: [input.id],
      source: "drop",
      payload: {
        item: input.item,
        candidateLayout: input.afterLayout,
        cols: props.cols,
        maxRows: props.maxRows,
        compactType: props.compactType,
        allowOverlap: props.allowOverlap,
        preventCollision: props.preventCollision
      }
    });
    commitPersistence(result);
    return result;
  };

  const rollbackInteraction = (layout: Layout) => {
    applyCommittedLayout(layout);
    clearGuides();
  };

  const syncHistory = (layout: Layout, mode: "push" | "replace" = "push") => {
    const historyStore = config?.legacyHistoryStore;
    if (!historyStore) return;
    if (mode === "replace") historyStore.replacePresent(layout);
    else historyStore.push(layout);
  };

  const executeSelect = (id: string, event: MouseEvent) => {
    if (!controller || !isEditMode()) return;
    void controller.execute({
      type: "select",
      targetIds: [id],
      payload: {
        id,
        toggle: event.metaKey || event.ctrlKey,
        range: event.shiftKey
      },
      source: "pointer"
    });
  };

  const getPlacementPreviewItem = (item: LayoutItem): LayoutItem | null => {
    const session = controller?.placementSession.value;
    if (
      !session ||
      session.collisionPolicy !== "layout" ||
      session.blocked ||
      !session.candidateLayout ||
      session.phase === "starting"
    ) {
      return null;
    }
    if (session.ghostItems.some(ghost => ghost.id === item.i)) return null;
    const previewItem = getLayoutItem(session.candidateLayout, item.i);
    if (!previewItem) return null;
    if (
      previewItem.x === item.x &&
      previewItem.y === item.y &&
      previewItem.w === item.w &&
      previewItem.h === item.h
    ) {
      return null;
    }
    return previewItem;
  };

  const getItemRenderState = (
    item: LayoutItem,
    defaults: GridEditorItemDefaults,
    isDroppingItem?: boolean
  ) => {
    const meta: GridEditorItemMeta | undefined = getMetaById()[item.i];
    const capability = controller || hasRuntimeSidecar(item.i)
      ? resolveRuntimeCapability(item, defaults)
      : null;
    const defaultDraggable = typeof item.isDraggable === "boolean" ? item.isDraggable : !item.static && defaults.isDraggable;
    const defaultResizable = typeof item.isResizable === "boolean" ? item.isResizable : !item.static && defaults.isResizable;
    const visible = !(capability?.visible === false && !isDroppingItem);
    const readonly = isViewMode() || Boolean(controller && !capability?.editable);
    const draggable = capability
      ? (controller ? isEditMode() : defaultDraggable) && capability.draggable
      : defaultDraggable;
    const resizable = capability
      ? (controller ? isEditMode() : defaultResizable) && capability.resizable
      : defaultResizable;
    const bounded = draggable && (capability ? capability.bounded : defaults.isBounded && item.isBounded !== false);
    const selected = controller?.selection.value.selectedIds.includes(item.i) || false;
    const active = controller?.selection.value.activeId === item.i;
    const previewItem = getPlacementPreviewItem(item);
    const className = controller
      ? clsx({
          "editor-selected": selected,
          "editor-active": active,
          "editor-locked": capability?.locked,
          "editor-hidden": meta?.visible === false,
          "editor-readonly": readonly,
          "editor-keyboard-editing": controller.state.value === "keyboardEditing",
          "editor-drop-target": isDroppingItem,
          "editor-placement-reflowed": Boolean(previewItem)
        })
      : undefined;

    return {
      visible,
      draggable,
      resizable,
      bounded,
      resizeHandles: capability?.resizeHandles,
      capabilityDiagnostics: capability?.diagnostics,
      className,
      previewItem,
      onClick: controller ? (event: MouseEvent) => executeSelect(item.i, event) : undefined
    };
  };

  const onRootClick = (event: MouseEvent) => {
    if (placementInteractions.onClick(event)) return;
    if (event.target === event.currentTarget && controller && isEditMode()) {
      void controller.execute({ type: "clearSelection", source: "pointer" });
    }
  };

  const onRootPointerMove = (event: MouseEvent | PointerEvent) => {
    placementInteractions.onPointerMove(event);
  };

  const mount = () => {
    if (controller && config?.keyboard !== false) {
      unbindKeyboard = bindGridEditorKeyboard(
        controller,
        typeof config?.keyboard === "object" ? config.keyboard : {}
      );
    }
    if (ownsPersistenceController) {
      void resolvedPersistenceController?.load().then(result => {
        if (result.value && result.fallbackApplied) {
          controller?.setExternalLayout(result.value, "persistence-fallback");
        }
      });
    }
  };

  const stop = () => {
    unbindKeyboard?.();
    unbindKeyboard = null;
    placementInteractions.cancel("runtime-stop");
    if (!config?.controller) controller?.stop();
    else if (ownsPersistenceController) resolvedPersistenceController?.stop();
  };

  return {
    config,
    controller,
    isEnabled,
    isViewMode,
    isEditMode,
    guidesEnabled,
    getMetaById,
    clearGuides,
    resetSnap,
    snapCandidate,
    updateIntelligence,
    resolveMoveDrag,
    resolveResizeIntent,
    notifyMoveBlocked,
    commitMove,
    commitResize,
    commitDrop,
    rollbackInteraction,
    syncHistory,
    getItemRenderState,
    isPlacementActive: placementInteractions.isActive,
    onRootPointerMove,
    onRootClick,
    mount,
    stop
  };
}
