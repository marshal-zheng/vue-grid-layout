import type { Layout } from "../utils";
import { useGridEditorRuntime } from "../grid-layout/useGridEditorRuntime";
import {
  createGridEditorOverlayGeometry,
  renderGridEditorOverlay
} from "../grid-layout/GridEditorOverlay";
import type {
  GridLayoutRuntimeExtension,
  GridLayoutRuntimeExtensionContext
} from "../grid-layout/runtimeExtension";
import type { GridLayoutPersistenceController } from "../persistence";
import type { GridEditorProp } from "./types";

type EditorRuntimeProps = GridLayoutRuntimeExtensionContext["props"] & {
  editor?: false | GridEditorProp;
  persistence?: unknown;
};

export const createEditorGridRuntimeExtension = (
  context: GridLayoutRuntimeExtensionContext
): GridLayoutRuntimeExtension => {
  const props = context.props as EditorRuntimeProps;
  const editorRuntime = useGridEditorRuntime({
    props: props as never,
    layoutRef: context.layoutRef,
    persistenceController: props.persistence as GridLayoutPersistenceController<Layout> | null,
    engineBridge: context.engineBridge,
    getLayout: context.getLayout,
    getOldDragItem: context.getOldDragItem,
    getOldResizeItem: context.getOldResizeItem,
    isDropping: context.isDropping,
    getInteractionState: context.getInteractionState
  });

  return {
    interactions: {
      clearGuides: editorRuntime.clearGuides,
      resetSnap: editorRuntime.resetSnap,
      snapCandidate: editorRuntime.snapCandidate,
      updateIntelligence: editorRuntime.updateIntelligence,
      resolveMoveDrag: editorRuntime.resolveMoveDrag,
      notifyMoveBlocked: editorRuntime.notifyMoveBlocked,
      commitMove: editorRuntime.commitMove,
      commitResize: editorRuntime.commitResize,
      commitDrop: editorRuntime.commitDrop,
      rollbackInteraction: editorRuntime.rollbackInteraction
    },
    mount: editorRuntime.mount,
    stop: editorRuntime.stop,
    getItemRenderState: editorRuntime.getItemRenderState,
    getRootClassNames: () => ({
      "editor-enabled": editorRuntime.isEnabled(),
      "editor-mode-view": editorRuntime.isEnabled() && editorRuntime.isViewMode(),
      "editor-mode-edit": editorRuntime.isEnabled() && editorRuntime.isEditMode(),
      "editor-placement-active": editorRuntime.isPlacementActive(),
      "editor-dirty": editorRuntime.controller?.dirty.value,
      "editor-conflict": editorRuntime.controller?.state.value === "conflict",
      "editor-guide-grid": editorRuntime.controller?.guides.value.showGrid
    }),
    isExternalDropEnabled: isDroppable => isDroppable && !editorRuntime.isViewMode(),
    onRootPointerMove: editorRuntime.onRootPointerMove,
    onRootClick: editorRuntime.onRootClick,
    renderOverlay: input => renderGridEditorOverlay({
      enabled: editorRuntime.guidesEnabled() || editorRuntime.isPlacementActive(),
      geometry: createGridEditorOverlayGeometry(input.geometry),
      guideState: editorRuntime.controller?.guides.value,
      placementSession: editorRuntime.controller?.placementSession.value,
      itemMap: input.itemMap,
      layout: input.layout
    })
  };
};
