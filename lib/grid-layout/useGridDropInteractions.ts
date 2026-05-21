import { h, markRaw, ref } from "vue";
import {
  compact,
  compactType,
  findFirstFit,
  findNearestFit,
  getAllCollisions,
  getLayoutItem,
  withLayoutItem
} from "../utils";
import {
  createGridEditorPlacementRollbackSnapshot
} from "../editor/placementSession";
import type { LayoutItem } from "../utils";
import { calcXY, type PositionParams } from "../calculateUtils";
import type { GridInteractionCommonOptions } from "./gridInteractionTypes";
import { useGridInteractionMachine } from "./useGridInteractionMachine";
import type { GridInteractionEffect } from "../interaction-state-machine";

type UseGridDropInteractionsOptions = GridInteractionCommonOptions & {
  isFirefox: boolean;
  layoutClassName: string;
};

export function useGridDropInteractions({
  props,
  state,
  eventBridge,
  engineBridge,
  frameUpdate,
  autoScroll,
  editor,
  isFirefox,
  layoutClassName,
  interactionMachine: providedInteractionMachine,
  nextInteractionRequestId
}: UseGridDropInteractionsOptions) {
  const dragEnterCounter = ref(0);
  let activeDropInteractionId: string | null = null;
  const interactionMachine = providedInteractionMachine || useGridInteractionMachine({
    getDragActivationDistance: () => props.dragActivationDistance
  });

  const getLayoutEngineProp = () => engineBridge.getLayoutEngineProp();
  const isLegacyLayoutEngine = () => engineBridge.isLegacyLayoutEngine();
  const resetInteractionController = (layout = state.layout) => engineBridge.reset(layout);
  const runEnginePreview: typeof engineBridge.preview = (...args) => engineBridge.preview(...args);
  const runEngineCommit: typeof engineBridge.commit = (...args) => engineBridge.commit(...args);

  const hasEffect = <Type extends GridInteractionEffect["type"]>(
    effects: GridInteractionEffect[],
    type: Type
  ): Extract<GridInteractionEffect, { type: Type }> | undefined =>
    effects.find((effect): effect is Extract<GridInteractionEffect, { type: Type }> => effect.type === type);

  const ensureDropInteraction = (itemId: string) => {
    if (!activeDropInteractionId) {
      const nextInteractionId = nextInteractionRequestId("drop-interaction", itemId);
      const transition = interactionMachine.dispatch({
        type: "ENTER_DROP",
        interactionId: nextInteractionId,
        itemId
      });
      if (hasEffect(transition.effects, "REJECT_TRANSITION")) return null;
      activeDropInteractionId = nextInteractionId;
    }
    return activeDropInteractionId;
  };

  const shouldPreviewDrop = (
    itemId: string,
    grid: { x: number; y: number },
    size: { w: number; h: number },
    strategy: "cursor" | "auto"
  ) => {
    const interactionId = ensureDropInteraction(itemId);
    if (!interactionId) return null;
    const transition = interactionMachine.dispatch({
      type: "MOVE_DROP",
      interactionId,
      grid,
      size,
      strategy
    });
    return hasEffect(transition.effects, "PREVIEW_DROP") || null;
  };

  const resetDropInteraction = (reason: string) => {
    interactionMachine.reset(reason);
    activeDropInteractionId = null;
  };

  const removeDroppingPlaceholder = (reason = "drop-cleanup", preserveLayout = false) => {
    frameUpdate.cancel();
    const { droppingItem, cols } = props;
    const { layout } = state;
    const newLayout = compact(
      layout.filter(l => l.i !== droppingItem.i),
      compactType(props),
      cols,
      props.allowOverlap
    );

    state.suppressLayoutChange = true;
    if (!preserveLayout) {
      state.layout = markRaw(newLayout);
    }
    state.droppingDOMNode = null;
    state.activeDrag = null;
    state.droppingPosition = undefined;
    autoScroll.reset();
    editor.clearGuides();
    resetDropInteraction(reason);
  };

  const onDrop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const { droppingItem, cols, maxRows, dropStrategy } = props;
    const { layout } = state;
    let item = layout.find(l => l.i === droppingItem.i);

    if (!isLegacyLayoutEngine()) {
      const droppingId = String(droppingItem.i);
      const dropInteractionId = ensureDropInteraction(droppingId);
      if (!dropInteractionId) return;
      const dropTransition = interactionMachine.dispatch({
        type: "COMMIT_DROP",
        interactionId: dropInteractionId
      });
      const coreDropCommitEffect = hasEffect(dropTransition.effects, "COMMIT_DROP");
      if (!coreDropCommitEffect) {
        removeDroppingPlaceholder("drop-commit-rejected");
        return;
      }
      const baseLayout = createGridEditorPlacementRollbackSnapshot(layout.filter(l => l.i !== droppingId));
      const targetItem = item || state.activeDrag || null;
      const target = targetItem
        ? { x: targetItem.x, y: targetItem.y }
        : undefined;

      resetInteractionController(baseLayout);
      engineBridge.start({
        id: nextInteractionRequestId("drop-commit-start", droppingId),
        type: "drop",
        itemId: droppingId
      });

      runEngineCommit(
        coreDropCommitEffect.requestId,
        {
          type: "dropFit",
          item: {
            i: droppingId,
            w: droppingItem.w,
            h: droppingItem.h
          },
          strategy: dropStrategy === "auto" ? "auto" : "cursor",
          target
        },
        result => {
          void (async () => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentRequest(coreDropCommitEffect.interactionId, coreDropCommitEffect.requestId)) return;
          const coreStatus = result.status === "cancelled" ? "error" : result.status;
          interactionMachine.dispatch({
            type: "APPLY_RESULT",
            interactionId: dropInteractionId,
            requestId: coreDropCommitEffect.requestId,
            status: coreStatus
          });
          const committedItem = result.placeholder || targetItem || undefined;
          let cleanItem: LayoutItem | undefined;
          if (committedItem) {
            cleanItem = { ...committedItem };
            delete cleanItem.isDraggable;
            delete cleanItem.isResizable;
          }
          const committedLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : baseLayout;
          const commandResult = result.status === "changed" || result.status === "fallback"
            ? (state.suppressLayoutChange = true, await editor.commitDrop?.({
              id: droppingId,
              beforeLayout: baseLayout,
              afterLayout: committedLayout,
              item: cleanItem,
              event: e
            }))
            : null;
          if (
            commandResult &&
            commandResult.status !== "changed" &&
            commandResult.status !== "noop"
          ) {
            state.suppressLayoutChange = true;
            state.layout = markRaw(baseLayout);
            editor.rollbackInteraction?.(baseLayout, commandResult.status);
            dragEnterCounter.value = 0;
            removeDroppingPlaceholder(commandResult.status);
            return;
          }
          dragEnterCounter.value = 0;
          eventBridge.emitDrop(
            committedLayout.filter(l => l.i !== droppingId),
            e,
            cleanItem
          );
          removeDroppingPlaceholder("drop-cleanup", Boolean(commandResult));
          })();
        },
        baseLayout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
      );
      return;
    }

    if (!item && dropStrategy === "auto") {
      const fit = findFirstFit(
        layout.filter(l => l.i !== droppingItem.i),
        { w: droppingItem.w, h: droppingItem.h },
        cols,
        maxRows
      );
      if (fit) {
        item = {
          ...droppingItem,
          x: fit.x,
          y: fit.y,
          static: false,
        } as LayoutItem;
      }
    }

    let cleanItem: LayoutItem | undefined;
    if (item) {
      cleanItem = { ...item };
      delete cleanItem.isDraggable;
      delete cleanItem.isResizable;
      if (dropStrategy === "cursor") {
        const collisions = getAllCollisions(
          layout.filter(l => l.i !== droppingItem.i),
          cleanItem
        );
        if (collisions.length > 0) {
          cleanItem.x = Math.min(...collisions.map(collision => collision.x));
          cleanItem.y = Math.max(...collisions.map(collision => collision.y + collision.h));
        }
      }
    }

    const legacyDropInteractionId = ensureDropInteraction(String(droppingItem.i));
    if (!legacyDropInteractionId) return;
    const legacyDropCommit = interactionMachine.dispatch({
      type: "COMMIT_DROP",
      interactionId: legacyDropInteractionId
    });
    const legacyDropCommitEffect = hasEffect(legacyDropCommit.effects, "COMMIT_DROP");
    if (legacyDropCommitEffect) {
      interactionMachine.dispatch({
        type: "APPLY_RESULT",
        interactionId: legacyDropInteractionId,
        requestId: legacyDropCommitEffect.requestId,
        status: cleanItem ? "changed" : "noop"
      });
    }

    void (async () => {
      const droppingId = String(droppingItem.i);
      const baseLayout = createGridEditorPlacementRollbackSnapshot(layout.filter(l => l.i !== droppingId));
      const committedLayout = cleanItem ? [...baseLayout, cleanItem] : baseLayout;
      const commandResult = cleanItem
        ? (state.suppressLayoutChange = true, await editor.commitDrop?.({
          id: droppingId,
          beforeLayout: baseLayout,
          afterLayout: committedLayout,
          item: cleanItem,
          event: e
        }))
        : null;
      if (
        commandResult &&
        commandResult.status !== "changed" &&
        commandResult.status !== "noop"
      ) {
        state.suppressLayoutChange = true;
        state.layout = markRaw(baseLayout);
        editor.rollbackInteraction?.(baseLayout, commandResult.status);
        dragEnterCounter.value = 0;
        removeDroppingPlaceholder(commandResult.status);
        return;
      }
      dragEnterCounter.value = 0;
      eventBridge.emitDrop(baseLayout, e, cleanItem);
      removeDroppingPlaceholder("drop-cleanup", Boolean(commandResult));
    })();
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragEnterCounter.value === 0) {
      ensureDropInteraction(String(props.droppingItem.i));
    }
    dragEnterCounter.value++;
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.value = Math.max(0, dragEnterCounter.value - 1);

    if (dragEnterCounter.value === 0) {
      if (activeDropInteractionId) {
        interactionMachine.dispatch({
          type: "LEAVE_DROP",
          interactionId: activeDropInteractionId,
          reason: "drag-leave"
        });
      }
      removeDroppingPlaceholder("drag-leave");
    }
  };

  const onDragOver = (e: DragEvent): void | false => {
    e.preventDefault();
    e.stopPropagation();

    if (isFirefox && !(e.currentTarget as Element | null)?.classList?.contains(layoutClassName)) {
      return false;
    }

    const { droppingItem, margin, cols, rowHeight, maxRows, width, containerPadding, transformScale, dropStrategy } = props;
    const onDragOverResult = eventBridge.callDropDragOver(e);
    if (onDragOverResult === false) {
      if (activeDropInteractionId) {
        interactionMachine.dispatch({
          type: "REJECT_DROP",
          interactionId: activeDropInteractionId,
          reason: "drop-drag-over-rejected"
        });
      }
      if (state.droppingDOMNode) {
        removeDroppingPlaceholder("drop-drag-over-rejected");
      } else {
        resetDropInteraction("drop-drag-over-rejected");
      }
      return false;
    }
    const finalDroppingItem = { ...droppingItem, ...(onDragOverResult || {}) };
    const { layout } = state;

    if (dropStrategy === "auto") {
      const gridRect = e.currentTarget instanceof Element ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 };
      const layerX = (e.clientX - gridRect.left) / transformScale;
      const layerY = (e.clientY - gridRect.top) / transformScale;

      const positionParams: PositionParams = {
        cols,
        margin,
        maxRows,
        rowHeight,
        containerWidth: width || 0,
        containerPadding: containerPadding || margin
      };
      const cursorGridPos = calcXY(positionParams, layerY, layerX, finalDroppingItem.w, finalDroppingItem.h);

      const baseLayout = createGridEditorPlacementRollbackSnapshot(layout.filter(l => l.i !== finalDroppingItem.i));
      if (!isLegacyLayoutEngine()) {
        const droppingId = String(finalDroppingItem.i);
        const dropCandidate = {
          ...finalDroppingItem,
          i: droppingId,
          x: cursorGridPos.x,
          y: cursorGridPos.y,
          static: false
        } as LayoutItem;
        const snappedDrop = editor.snapCandidate(
          droppingId,
          dropCandidate,
          dropCandidate,
          baseLayout
        );
        const previewEffect = shouldPreviewDrop(
          droppingId,
          { x: snappedDrop.x, y: snappedDrop.y },
          { w: finalDroppingItem.w, h: finalDroppingItem.h },
          "auto"
        );
        if (!previewEffect) return;
        resetInteractionController(baseLayout);
        engineBridge.start({
          id: activeDropInteractionId || previewEffect.interactionId,
          type: "drop",
          itemId: droppingId
        });
        runEnginePreview(
          previewEffect.requestId,
          {
            type: "dropFit",
            item: {
              i: droppingId,
              w: finalDroppingItem.w,
              h: finalDroppingItem.h
            },
            strategy: "cursor",
            target: { x: snappedDrop.x, y: snappedDrop.y }
          },
          result => {
            if (result.status === "stale") return;
            if (!interactionMachine.isCurrentPreviewRequest(previewEffect.interactionId, previewEffect.requestId)) return;
            if (!result.drop?.position) {
              if (state.droppingDOMNode) {
                removeDroppingPlaceholder();
              }
              return;
            }
            if (!state.droppingDOMNode) {
              state.droppingDOMNode = markRaw(h("div", { key: finalDroppingItem.i }));
            }
            state.droppingPosition = undefined;
            state.suppressLayoutChange = true;
            state.layout = markRaw(result.layout);
            state.activeDrag = result.placeholder ? markRaw(result.placeholder) : null;
            if (result.placeholder) {
              editor.updateIntelligence(String(finalDroppingItem.i), result.placeholder, result.placeholder);
            }
          },
          baseLayout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
        );
        return;
      }

      const fit = findNearestFit(baseLayout, { w: finalDroppingItem.w, h: finalDroppingItem.h }, cols, cursorGridPos.x, cursorGridPos.y, maxRows);
      if (!fit) {
        if (state.droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return;
      }

      if (!state.droppingDOMNode) {
        state.droppingDOMNode = markRaw(h("div", { key: finalDroppingItem.i }));
      }

      state.droppingPosition = undefined;
      const droppingItemId = String(finalDroppingItem.i);
      const previewEffect = shouldPreviewDrop(
        droppingItemId,
        { x: fit.x, y: fit.y },
        { w: finalDroppingItem.w, h: finalDroppingItem.h },
        "auto"
      );
      if (!previewEffect) return;
      const existingDroppingItem = getLayoutItem(layout, droppingItemId);

      if (!existingDroppingItem) {
        const rawDroppingItem = {
          ...finalDroppingItem,
          x: fit.x,
          y: fit.y,
          static: false,
          isDraggable: false,
          isResizable: false,
          i: droppingItemId
        } as LayoutItem;
        const nextDroppingItem = editor.snapCandidate(
          droppingItemId,
          rawDroppingItem,
          rawDroppingItem,
          baseLayout
        );
        state.suppressLayoutChange = true;
        state.layout = markRaw([
          ...baseLayout,
          nextDroppingItem
        ]);
        state.activeDrag = markRaw({ ...nextDroppingItem, placeholder: true });
        editor.updateIntelligence(droppingItemId, nextDroppingItem, nextDroppingItem);
        return;
      }

      const snappedExisting = editor.snapCandidate(
        droppingItemId,
        existingDroppingItem,
        {
          ...existingDroppingItem,
          ...finalDroppingItem,
          x: fit.x,
          y: fit.y,
          static: false,
          isDraggable: false,
          isResizable: false
        } as LayoutItem,
        baseLayout
      );
      const [nextLayout] = withLayoutItem(layout, droppingItemId, current => ({
        ...current,
        ...finalDroppingItem,
        x: snappedExisting.x,
        y: snappedExisting.y,
        static: false,
        isDraggable: false,
        isResizable: false
      }));
      state.suppressLayoutChange = true;
      state.layout = markRaw(nextLayout);
      state.activeDrag = markRaw({ ...snappedExisting, placeholder: true });
      editor.updateIntelligence(droppingItemId, existingDroppingItem, {
        ...existingDroppingItem,
        ...finalDroppingItem,
        x: snappedExisting.x,
        y: snappedExisting.y
      } as LayoutItem);
      return;
    }

    const gridRect = e.currentTarget instanceof Element ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 };
    const layerX = (e.clientX - gridRect.left) / transformScale;
    const layerY = (e.clientY - gridRect.top) / transformScale;
    const cursorDroppingItem = finalDroppingItem;
    const positionParams: PositionParams = {
      cols,
      margin,
      maxRows,
      rowHeight,
      containerWidth: width || 0,
      containerPadding: containerPadding || margin
    };
    const calculatedPosition = calcXY(positionParams, layerY, layerX, cursorDroppingItem.w, cursorDroppingItem.h);
    const droppingItemId = String(cursorDroppingItem.i);
    const baseLayout = createGridEditorPlacementRollbackSnapshot(layout.filter(l => l.i !== droppingItemId));
    const rawDroppingItem = {
      ...cursorDroppingItem,
      i: droppingItemId,
      x: calculatedPosition.x,
      y: calculatedPosition.y,
      static: false,
      isDraggable: false,
      isResizable: false
    } as LayoutItem;
    const snappedDrop = editor.snapCandidate(
      droppingItemId,
      rawDroppingItem,
      rawDroppingItem,
      baseLayout
    );
    const previewEffect = shouldPreviewDrop(
      droppingItemId,
      { x: snappedDrop.x, y: snappedDrop.y },
      { w: cursorDroppingItem.w, h: cursorDroppingItem.h },
      "cursor"
    );
    if (!previewEffect) return;

    if (!isLegacyLayoutEngine()) {
      resetInteractionController(baseLayout);
      engineBridge.start({
        id: activeDropInteractionId || previewEffect.interactionId,
        type: "drop",
        itemId: droppingItemId
      });
      runEnginePreview(
        previewEffect.requestId,
        {
          type: "dropFit",
          item: {
            i: droppingItemId,
            w: cursorDroppingItem.w,
            h: cursorDroppingItem.h
          },
          strategy: "cursor",
          target: { x: snappedDrop.x, y: snappedDrop.y }
        },
        result => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentPreviewRequest(previewEffect.interactionId, previewEffect.requestId)) return;
          if (!result.drop?.position) {
            if (state.droppingDOMNode) {
              removeDroppingPlaceholder();
            }
            return;
          }
          if (!state.droppingDOMNode) {
            state.droppingDOMNode = markRaw(h("div", { key: droppingItemId }));
          }
          state.droppingPosition = undefined;
          state.suppressLayoutChange = true;
          state.layout = markRaw(result.layout);
          state.activeDrag = result.placeholder ? markRaw(result.placeholder) : null;
          if (result.placeholder) {
            editor.updateIntelligence(droppingItemId, result.placeholder, result.placeholder);
          }
        },
        baseLayout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
      );
      return;
    }

    if (!state.droppingDOMNode) {
      state.droppingDOMNode = markRaw(h("div", { key: droppingItemId }));
    }
    state.droppingPosition = undefined;
    const existingDroppingItem = getLayoutItem(layout, droppingItemId);
    if (!existingDroppingItem) {
      const nextDroppingItem = {
        ...snappedDrop,
        i: droppingItemId,
        static: false,
        isDraggable: false,
        isResizable: false
      } as LayoutItem;
      state.suppressLayoutChange = true;
      state.layout = markRaw([
        ...baseLayout,
        nextDroppingItem
      ]);
      state.activeDrag = markRaw({ ...nextDroppingItem, placeholder: true });
      editor.updateIntelligence(droppingItemId, nextDroppingItem, nextDroppingItem);
      return;
    }

    const [nextLayout] = withLayoutItem(layout, droppingItemId, current => ({
      ...current,
      ...cursorDroppingItem,
      x: snappedDrop.x,
      y: snappedDrop.y,
      static: false,
      isDraggable: false,
      isResizable: false
    }));
    state.suppressLayoutChange = true;
    state.layout = markRaw(nextLayout);
    state.activeDrag = markRaw({
      ...existingDroppingItem,
      ...cursorDroppingItem,
      x: snappedDrop.x,
      y: snappedDrop.y,
      placeholder: true
    } as LayoutItem);
    editor.updateIntelligence(droppingItemId, existingDroppingItem, {
      ...existingDroppingItem,
      ...cursorDroppingItem,
      x: snappedDrop.x,
      y: snappedDrop.y
    } as LayoutItem);
  };

  return {
    clearDropInteraction: () => resetDropInteraction("clear-active-interaction"),
    removeDroppingPlaceholder,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver
  };
}
