import { h, markRaw, ref } from "vue";
import {
  compact,
  compactType,
  findFirstFit,
  findNearestFit,
  getLayoutItem,
  withLayoutItem
} from "../utils";
import type { LayoutItem } from "../utils";
import { calcXY, type PositionParams } from "../calculateUtils";
import type { GridInteractionCommonOptions } from "./gridInteractionTypes";

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
  editor,
  isFirefox,
  layoutClassName,
  nextInteractionRequestId
}: UseGridDropInteractionsOptions) {
  const dragEnterCounter = ref(0);

  const getLayoutEngineProp = () => engineBridge.getLayoutEngineProp();
  const isLegacyLayoutEngine = () => engineBridge.isLegacyLayoutEngine();
  const resetInteractionController = (layout = state.layout) => engineBridge.reset(layout);
  const runEnginePreview: typeof engineBridge.preview = (...args) => engineBridge.preview(...args);
  const runEngineCommit: typeof engineBridge.commit = (...args) => engineBridge.commit(...args);

  const removeDroppingPlaceholder = () => {
    frameUpdate.cancel();
    const { droppingItem, cols } = props;
    const { layout } = state;
    const newLayout = compact(
      layout.filter(l => l.i !== droppingItem.i),
      compactType(props),
      cols,
      props.allowOverlap
    );

    state.layout = markRaw(newLayout);
    state.droppingDOMNode = null;
    state.activeDrag = null;
    state.droppingPosition = undefined;
    editor.clearGuides();
  };

  const onDrop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const { droppingItem, cols, maxRows, dropStrategy } = props;
    const { layout } = state;
    let item = layout.find(l => l.i === droppingItem.i);

    if (!isLegacyLayoutEngine()) {
      const droppingId = String(droppingItem.i);
      const baseLayout = layout.filter(l => l.i !== droppingId);
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
        nextInteractionRequestId("drop-commit", droppingId),
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
          const committedItem = result.placeholder || targetItem || undefined;
          let cleanItem: LayoutItem | undefined;
          if (committedItem) {
            cleanItem = { ...committedItem };
            delete cleanItem.isDraggable;
            delete cleanItem.isResizable;
          }
          dragEnterCounter.value = 0;
          eventBridge.emitDrop(
            (result.status === "changed" || result.status === "fallback"
              ? result.layout
              : baseLayout
            ).filter(l => l.i !== droppingId),
            e,
            cleanItem
          );
          removeDroppingPlaceholder();
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
    }

    dragEnterCounter.value = 0;
    eventBridge.emitDrop(layout.filter(l => l.i !== droppingItem.i), e, cleanItem);
    removeDroppingPlaceholder();
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.value++;
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.value = Math.max(0, dragEnterCounter.value - 1);

    if (dragEnterCounter.value === 0) {
      removeDroppingPlaceholder();
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
      if (state.droppingDOMNode) {
        removeDroppingPlaceholder();
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

      const baseLayout = layout.filter(l => l.i !== finalDroppingItem.i);
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
        resetInteractionController(baseLayout);
        engineBridge.start({
          id: nextInteractionRequestId("drop-start", droppingId),
          type: "drop",
          itemId: droppingId
        });
        runEnginePreview(
          nextInteractionRequestId("drop-fit", droppingId),
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
        state.layout = markRaw([
          ...baseLayout,
          nextDroppingItem
        ]);
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
      state.layout = markRaw(nextLayout);
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
    const droppingPosition = { left: layerX, top: layerY, e };

    if (!state.droppingDOMNode) {
      const positionParams: PositionParams = {
        cols,
        margin,
        maxRows,
        rowHeight,
        containerWidth: width || 0,
        containerPadding: containerPadding || margin
      };
      const calculatedPosition = calcXY(positionParams, layerY, layerX, finalDroppingItem.w, finalDroppingItem.h);
      state.droppingDOMNode = markRaw(h("div", { key: finalDroppingItem.i }));
      state.droppingPosition = droppingPosition;
      state.layout = markRaw([
        ...layout,
        {
          ...finalDroppingItem,
          x: calculatedPosition.x,
          y: calculatedPosition.y,
          static: false,
          isDraggable: true
        }
      ]);
    } else if (state.droppingPosition) {
      const { left, top } = state.droppingPosition;
      const shouldUpdatePosition = left !== layerX || top !== layerY;
      if (shouldUpdatePosition) {
        state.droppingPosition = droppingPosition;
      }
    }
  };

  return {
    removeDroppingPlaceholder,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver
  };
}
