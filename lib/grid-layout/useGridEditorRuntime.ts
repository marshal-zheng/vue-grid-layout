import { pick } from "lodash";
import clsx from "clsx";
import type { Ref } from "vue";
import {
  bindGridEditorKeyboard,
  computeGridEditorIntelligence,
  createGridEditorController,
  resolveEditorItemCapability,
  resolveGridEditorSnap
} from "../editor";
import { compactType } from "../utils";
import type { CompactType, Layout, LayoutItem, ResizeHandleAxis } from "../utils";
import type {
  GridEditorController,
  GridEditorGuideInteraction,
  GridEditorGuidesOptions,
  GridEditorItemMeta,
  GridEditorProp
} from "../editor";

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

export function useGridEditorRuntime({
  props,
  layoutRef,
  persistenceController,
  getLayout,
  getOldDragItem,
  getOldResizeItem,
  isDropping,
  getInteractionState
}: UseGridEditorRuntimeOptions) {
  const config = props.editor && typeof props.editor === "object"
    ? props.editor
    : null;
  const controller: GridEditorController | null = config
    ? config.controller || createGridEditorController({
        ...config,
        kind: "layout",
        layout: layoutRef,
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
      ? { reason: "collision" as const, itemIds: activeId ? [activeId] : undefined }
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
    getItemRenderState,
    onRootClick,
    mount,
    stop
  };
}
