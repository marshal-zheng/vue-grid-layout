import { pick } from "lodash";
import clsx from "clsx";
import type { Ref } from "vue";
import {
  bindGridEditorKeyboard,
  computeGridEditorIntelligence,
  createGridEditorCommandResult,
  createGridEditorController,
  resolveEditorItemCapability,
  resolveGridEditorSnap
} from "../editor";
import { executeLayoutOperation } from "../layout-engine";
import { compactType, getLayoutItem } from "../utils";
import type { CompactType, Layout, LayoutItem, ResizeHandleAxis } from "../utils";
import type {
  GridEditorController,
  GridEditorBlockedReason,
  GridEditorGuideInteraction,
  GridEditorGuidesOptions,
  GridEditorItemMeta,
  GridEditorProp
} from "../editor";
import type { GridLayoutEngineBridge } from "./gridInteractionTypes";
import type {
  LayoutOperation,
  LayoutOperationResult
} from "../layout-engine";

type GridEditorRuntimeProps = {
  allowOverlap: boolean;
  cols: number;
  compactType: CompactType;
  editor?: false | GridEditorProp;
  margin: number[];
  maxRows: number;
  preventCollision: boolean;
  rowHeight: number;
  verticalCompact: boolean;
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
    phase: "commit";
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
  const controller: GridEditorController | null = config
    ? config.controller || createGridEditorController({
        ...config,
        kind: "layout",
        layout: layoutRef,
        layoutOperationRunner,
        persistence: (persistenceController as never) || config.persistence
      })
    : null;
  let unbindKeyboard: (() => void) | null = null;
  let lastSnapResolution: { nextGuideId?: string } | null = null;

  const isEnabled = () => Boolean(controller);
  const isViewMode = () => Boolean(controller && controller.mode.value === "view");
  const isEditMode = () => Boolean(controller && controller.mode.value === "edit");
  const getMetaById = () => controller?.editorMetaById.value || {};
  const guidesEnabled = () => Boolean(controller && config?.guides !== false);

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
      ? { [activeId]: pick(startItem, ["x", "y", "w", "h"]) }
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
    meta: GridEditorItemMeta | undefined
  ): GridEditorBlockedReason => {
    if (meta?.locked) return "locked";
    if (meta?.visible === false) return "hidden";
    if (item.static) return "static-item";
    return "capability";
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

  const getItemRenderState = (
    item: LayoutItem,
    defaults: GridEditorItemDefaults,
    isDroppingItem?: boolean
  ) => {
    const meta: GridEditorItemMeta | undefined = getMetaById()[item.i];
    const capability = controller
      ? resolveEditorItemCapability(item, meta, defaults)
      : null;
    const visible = !(controller && meta?.visible === false && !isDroppingItem);
    const readonly = isViewMode() || Boolean(controller && !capability?.editable);
    const draggable = controller
      ? isEditMode() && Boolean(capability?.draggable)
      : typeof item.isDraggable === "boolean" ? item.isDraggable : !item.static && defaults.isDraggable;
    const resizable = controller
      ? isEditMode() && Boolean(capability?.resizable)
      : typeof item.isResizable === "boolean" ? item.isResizable : !item.static && defaults.isResizable;
    const bounded = draggable && defaults.isBounded && item.isBounded !== false;
    const selected = controller?.selection.value.selectedIds.includes(item.i) || false;
    const active = controller?.selection.value.activeId === item.i;
    const className = controller
      ? clsx({
          "editor-selected": selected,
          "editor-active": active,
          "editor-locked": capability?.locked,
          "editor-hidden": meta?.visible === false,
          "editor-readonly": readonly,
          "editor-keyboard-editing": controller.state.value === "keyboardEditing",
          "editor-drop-target": isDroppingItem
        })
      : undefined;

    return {
      visible,
      draggable,
      resizable,
      bounded,
      className,
      onClick: controller ? (event: MouseEvent) => executeSelect(item.i, event) : undefined
    };
  };

  const onRootClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget && controller && isEditMode()) {
      void controller.execute({ type: "clearSelection", source: "pointer" });
    }
  };

  const mount = () => {
    if (controller && config?.keyboard !== false) {
      unbindKeyboard = bindGridEditorKeyboard(
        controller,
        typeof config?.keyboard === "object" ? config.keyboard : {}
      );
    }
  };

  const stop = () => {
    unbindKeyboard?.();
    unbindKeyboard = null;
    if (!config?.controller) controller?.stop();
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
    notifyMoveBlocked,
    getItemRenderState,
    onRootClick,
    mount,
    stop
  };
}
