import { markRaw, ref } from "vue";
import {
  cloneLayout,
  cloneLayoutItem,
  compact,
  compactType,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  withLayoutItem
} from "../utils";
import { calcGridColWidth } from "../calculateUtils";
import type {
  GridDragEvent,
  GridResizeEvent,
  Layout,
  LayoutItem,
  ResizeHandleAxis
} from "../utils";
import type {
  GridDragContext,
  GridInteractionEffect
} from "../interaction-state-machine";
import type {
  GridInteractionCommonOptions,
  GridInteractionModelCommitters,
  GridInteractionBlockedReason
} from "./gridInteractionTypes";
import type { LayoutOperationResult, LayoutResizeConstraint } from "../layout-engine";
import type { GridItemResizeMetrics } from "../item-capabilities";
import { useGridInteractionMachine } from "./useGridInteractionMachine";

const LARGE_LAYOUT_THRESHOLD = 200;

type UseGridDragResizeInteractionsOptions =
  GridInteractionCommonOptions &
  GridInteractionModelCommitters;

type ActiveMoveContext =
  | {
      kind: "single";
      id: string;
      startX: number;
      startY: number;
    }
  | {
      kind: "group";
      activeId: string;
      ids: string[];
      startX: number;
      startY: number;
    }
  | {
      kind: "blocked";
      reason: string;
      ids: string[];
      activeId?: string;
    };

export function useGridDragResizeInteractions({
  props,
  state,
  eventBridge,
  engineBridge,
  frameUpdate,
  autoScroll,
  editor,
  interactionMachine: providedInteractionMachine,
  nextInteractionRequestId,
  syncHistory,
  onLayoutMaybeChanged
}: UseGridDragResizeInteractionsOptions) {
  const dragBlocked = ref(false);
  const resizeBlocked = ref(false);
  const activeDragId = ref<string | null>(null);
  const activeResizeId = ref<string | null>(null);
  const dragBlockedReason = ref<GridInteractionBlockedReason | null>(null);
  const dragBlockedItemIds = ref<string[]>([]);
  const dragBlockedMessage = ref<string | null>(null);
  let activeMoveContext: ActiveMoveContext | null = null;
  let activeDragHasMoved = false;
  let activeDragInteractionId: string | null = null;
  let activeResizeInteractionId: string | null = null;
  let activeResizeConstraint: LayoutResizeConstraint | undefined;

  const getLayoutEngineProp = () => engineBridge.getLayoutEngineProp();
  const isLegacyLayoutEngine = () => engineBridge.isLegacyLayoutEngine();
  const resetInteractionController = (layout?: Layout) => engineBridge.reset(layout);
  const runEnginePreview: typeof engineBridge.preview = (...args) => engineBridge.preview(...args);
  const runEngineCommit: typeof engineBridge.commit = (...args) => engineBridge.commit(...args);
  const interactionMachine = providedInteractionMachine || useGridInteractionMachine({
    getDragActivationDistance: () => props.dragActivationDistance
  });

  const buildResizeCandidate = (
    item: LayoutItem,
    w: number,
    h: number,
    handle: ResizeHandleAxis
  ): LayoutItem => {
    let x = item.x;
    let y = item.y;
    let nextW = w;
    let nextH = h;
    const isWestHandle = handle === "sw" || handle === "w" || handle === "nw";
    const isNorthHandle = handle === "ne" || handle === "n" || handle === "nw";
    if (isWestHandle) {
      x = item.x + (item.w - nextW);
      if (x < 0) {
        x = 0;
        nextW = item.w;
      }
    }
    if (isNorthHandle) {
      y = item.y + (item.h - nextH);
      if (y < 0) {
        y = 0;
        nextH = item.h;
      }
    }
    return { ...item, x, y, w: nextW, h: nextH };
  };

  const shouldUseWorkerForCurrentLayout = () =>
    state.layout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000);

  const getResizeMetrics = (): GridItemResizeMetrics | undefined => {
    const width = props.width;
    const padding = props.containerPadding || props.margin;
    if (
      typeof width !== "number" ||
      !Number.isFinite(width) ||
      width <= 0 ||
      props.cols <= 0 ||
      props.rowHeight <= 0
    ) {
      return undefined;
    }
    const colWidth = calcGridColWidth({
      containerWidth: width,
      cols: props.cols,
      margin: props.margin,
      containerPadding: padding,
      rowHeight: props.rowHeight,
      maxRows: props.maxRows,
      renderPrecision: props.renderPrecision || undefined
    });
    if (!Number.isFinite(colWidth) || colWidth <= 0) return undefined;
    return {
      colWidth,
      rowHeight: props.rowHeight,
      margin: [props.margin[0], props.margin[1]],
      containerPadding: [padding[0], padding[1]],
      renderPrecision: props.renderPrecision || "integer"
    };
  };

  const buildMovePlaceholder = (
    item: LayoutItem,
    x: number,
    y: number,
    id = item.i
  ): LayoutItem & { placeholder: true } => ({
    w: item.w,
    h: item.h,
    x,
    y,
    i: id,
    placeholder: true
  });

  const clearDragBlockedFeedback = () => {
    dragBlockedReason.value = null;
    dragBlockedItemIds.value = [];
    dragBlockedMessage.value = null;
  };

  const setDragBlockedFeedback = (
    reason: GridInteractionBlockedReason,
    itemIds: string[],
    message?: string
  ) => {
    dragBlocked.value = true;
    dragBlockedReason.value = reason;
    dragBlockedItemIds.value = itemIds.slice();
    dragBlockedMessage.value = message || null;
  };

  const syncDragBlockedFromResult = (
    result: LayoutOperationResult,
    fallbackIds: string[],
    activeId?: string,
    notify = false
  ) => {
    if (result.status === "blocked" && result.blocked) {
      const reason = result.blocked.reason as GridInteractionBlockedReason;
      const ids = result.blocked.itemIds.length > 0
        ? result.blocked.itemIds
        : fallbackIds;
      const message = `Pointer move blocked by ${reason}.`;
      setDragBlockedFeedback(reason, ids, message);
      if (notify) {
        editor.notifyMoveBlocked({
          reason,
          ids,
          activeId,
          message,
          operationResult: result
        });
      }
      return;
    }
    dragBlocked.value = false;
    clearDragBlockedFeedback();
  };

  const clearActiveInteraction = () => {
    activeDragId.value = null;
    activeResizeId.value = null;
    dragBlocked.value = false;
    resizeBlocked.value = false;
    clearDragBlockedFeedback();
    activeMoveContext = null;
    activeDragHasMoved = false;
    activeDragInteractionId = null;
    activeResizeInteractionId = null;
    activeResizeConstraint = undefined;
    interactionMachine.reset("clear-active-interaction");
  };

  const finishDragInteraction = () => {
    state.activeDrag = null;
    state.oldDragItem = null;
    activeDragId.value = null;
    dragBlocked.value = false;
    clearDragBlockedFeedback();
    activeMoveContext = null;
    activeDragHasMoved = false;
    activeDragInteractionId = null;
    autoScroll.reset();
    editor.clearGuides();
    interactionMachine.reset("finish-drag-interaction");
  };

  const sameGeometry = (
    a: Pick<LayoutItem, "x" | "y" | "w" | "h">,
    b: Pick<LayoutItem, "x" | "y" | "w" | "h">
  ) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

  const hasEffect = <Type extends GridInteractionEffect["type"]>(
    effects: GridInteractionEffect[],
    type: Type
  ): Extract<GridInteractionEffect, { type: Type }> | undefined =>
    effects.find((effect): effect is Extract<GridInteractionEffect, { type: Type }> => effect.type === type);

  const toCoreDragContext = (context: ActiveMoveContext): GridDragContext => {
    if (context.kind === "group") {
      return {
        kind: "group",
        activeId: context.activeId,
        ids: context.ids
      };
    }
    if (context.kind === "blocked") {
      return {
        kind: "blocked",
        reason: context.reason,
        ids: context.ids,
        activeId: context.activeId
      };
    }
    return {
      kind: "single",
      id: context.id
    };
  };

  const cleanupResizeInteraction = () => {
    state.activeDrag = null;
    state.oldResizeItem = null;
    state.resizing = false;
    activeResizeId.value = null;
    resizeBlocked.value = false;
    activeResizeInteractionId = null;
    autoScroll.reset();
    editor.clearGuides();
    state.oldLayout = null;
    interactionMachine.reset("resize-cleanup");
    activeResizeConstraint = undefined;
  };

  const onResizeStart = (i: string, w: number, h: number, { e, node, handle }: GridResizeEvent) => {
    frameUpdate.cancel();
    const { layout } = state;
    const l = getLayoutItem(layout, i);
    if (!l) return;
    const resizeHandle = (handle || "se") as ResizeHandleAxis;
    const resizeInteractionId = nextInteractionRequestId("resize-interaction", i);
    const startTransition = interactionMachine.dispatch({
      type: "START_RESIZE",
      interactionId: resizeInteractionId,
      itemId: i,
      handle: resizeHandle,
      geometry: { x: l.x, y: l.y, w: l.w, h: l.h }
    });
    if (!hasEffect(startTransition.effects, "EMIT_RESIZE_START")) return;
    activeResizeInteractionId = resizeInteractionId;
    activeResizeConstraint = undefined;
    syncHistory(layout, "replace");
    activeResizeId.value = i;
    resizeBlocked.value = false;
    editor.resetSnap();
    autoScroll.init(node);
    state.oldResizeItem = cloneLayoutItem(l);
    state.oldLayout = cloneLayout(layout);
    state.resizing = true;
    if (!isLegacyLayoutEngine()) {
      resetInteractionController(layout);
      engineBridge.start({
        id: nextInteractionRequestId("resize-start", i),
        type: "resize",
        itemId: i
      });
    }
    eventBridge.emitResizeStart(layout, l, l, undefined, e, node);
  };

  const onResize = (i: string, w: number, h: number, { e, node, handle }: GridResizeEvent) => {
    const { oldResizeItem } = state;
    const { cols, preventCollision, allowOverlap } = props;
    const resizeHandle = handle as ResizeHandleAxis;
    const currentResizeItem = getLayoutItem(state.layout, i);
    if (!currentResizeItem) return;
    const requestedGeometry = buildResizeCandidate(currentResizeItem, w, h, resizeHandle);
    if (sameGeometry(currentResizeItem, requestedGeometry)) {
      return;
    }
    if (!isLegacyLayoutEngine()) {
      const layout = state.layout;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      autoScroll.maybeScroll(e, node);
      const snapped = editor.snapCandidate(
        i,
        l,
        buildResizeCandidate(l, w, h, resizeHandle),
        layout,
        resizeHandle
      );
      const resizeIntent = editor.resolveResizeIntent?.({
        id: i,
        item: l,
        layout,
        handle: resizeHandle,
        rawCandidate: snapped,
        metrics: getResizeMetrics(),
        phase: "preview"
      });
      if (resizeIntent?.kind === "blocked") {
        resizeBlocked.value = true;
        state.activeDrag = markRaw({
          w: l.w,
          h: l.h,
          x: l.x,
          y: l.y,
          static: true,
          i
        });
        editor.updateIntelligence(i, l, l, resizeHandle);
        return;
      }
      const resolvedCandidate = resizeIntent?.kind === "allowed" ? resizeIntent.candidate : snapped;
      activeResizeConstraint = resizeIntent?.kind === "allowed"
        ? resizeIntent.constraint
        : activeResizeConstraint;
      let previewEffect: Extract<GridInteractionEffect, { type: "PREVIEW_RESIZE" }> | undefined;
      if (activeResizeInteractionId) {
        const transition = interactionMachine.dispatch({
          type: "MOVE_RESIZE",
          interactionId: activeResizeInteractionId,
          geometry: {
            x: resolvedCandidate.x,
            y: resolvedCandidate.y,
            w: resolvedCandidate.w,
            h: resolvedCandidate.h
          }
        });
        previewEffect = hasEffect(transition.effects, "PREVIEW_RESIZE");
        if (!previewEffect) return;
      }
      if (!previewEffect) return;
      runEnginePreview(
        previewEffect.requestId,
        {
          type: "resize",
          id: i,
          w: resolvedCandidate.w,
          h: resolvedCandidate.h,
          x: resolvedCandidate.x,
          y: resolvedCandidate.y,
          handle: resizeHandle,
          constraint: activeResizeConstraint
        },
        result => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentPreviewRequest(previewEffect.interactionId, previewEffect.requestId)) return;
          if (activeResizeId.value !== i) return;
          const nextLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(nextLayout, i) || l;
          const placeholder = result.placeholder || {
            w: nextItem.w,
            h: nextItem.h,
            x: nextItem.x,
            y: nextItem.y,
            static: true,
            i
          };
          if (activeResizeId.value === i) resizeBlocked.value = result.status === "blocked";
          eventBridge.emitResize(nextLayout, oldResizeItem, nextItem, placeholder, e, node);
          if (result.status === "changed" || result.status === "fallback") {
            state.layout = markRaw(nextLayout);
          }
          state.activeDrag = markRaw(placeholder);
          editor.updateIntelligence(i, l, placeholder, resizeHandle);
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }
    const isLargeLayout = state.layout.length >= LARGE_LAYOUT_THRESHOLD;
    autoScroll.maybeScroll(e, node);

    if (!isLargeLayout) {
      const { layout } = state;
      let shouldMoveItem = false;
      let finalLayout;
      let x, y;
      let hasCollisions = false;

      const [newLayout, l] = withLayoutItem(layout, i, l => {
        x = l.x;
        y = l.y;

        const isWestHandle = handle === "sw" || handle === "w" || handle === "nw";
        const isNorthHandle = handle === "ne" || handle === "n" || handle === "nw";

        if (isWestHandle || isNorthHandle) {
          if (isWestHandle) {
            x = l.x + (l.w - w);
            w = l.x !== x && x < 0 ? l.w : w;
            x = x < 0 ? 0 : x;
          }
          if (isNorthHandle) {
            y = l.y + (l.h - h);
            h = l.y !== y && y < 0 ? l.h : h;
            y = y < 0 ? 0 : y;
          }
          shouldMoveItem = true;
        }

        const snapped = editor.snapCandidate(
          i,
          l,
          { ...l, x, y, w, h },
          layout,
          handle as ResizeHandleAxis
        );
        x = snapped.x;
        y = snapped.y;
        w = snapped.w;
        h = snapped.h;
        shouldMoveItem = shouldMoveItem || x !== l.x || y !== l.y;

        if (preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(layout, { ...l, w, h, x, y });
          hasCollisions = collisions.length > 0;

          if (hasCollisions) {
            y = l.y;
            h = l.h;
            x = l.x;
            w = l.w;
            shouldMoveItem = false;
          }
        }

        l.w = w;
        l.h = h;
        return l;
      });

      if (!l) return;
      if (activeResizeId.value === i) resizeBlocked.value = hasCollisions;

      finalLayout = newLayout;
      if (shouldMoveItem) {
        const isUserAction = true;
        finalLayout = moveElement(
          newLayout,
          l,
          compactType(props),
          cols,
          allowOverlap,
          x,
          y,
          isUserAction,
          props.preventCollision
        );
      }

      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        static: true,
        i: i
      };
      if (activeResizeInteractionId) {
        const transition = interactionMachine.dispatch({
          type: "MOVE_RESIZE",
          interactionId: activeResizeInteractionId,
          geometry: { x: placeholder.x, y: placeholder.y, w: placeholder.w, h: placeholder.h }
        });
        if (!hasEffect(transition.effects, "PREVIEW_RESIZE")) return;
      }
      eventBridge.emitResize(finalLayout, oldResizeItem, l, placeholder, e, node);
      const nextLayout = allowOverlap ? finalLayout : compact(finalLayout, compactType(props), cols);
      const nextItem = getLayoutItem(nextLayout, i) || l;
      const nextPlaceholder = {
        ...placeholder,
        w: nextItem.w,
        h: nextItem.h,
        x: nextItem.x,
        y: nextItem.y
      };

      state.layout = markRaw(nextLayout);
      state.activeDrag = markRaw(nextPlaceholder);
      editor.updateIntelligence(i, l, nextPlaceholder, handle as ResizeHandleAxis);
      return;
    }

    const layout = state.layout;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    const prevX = l.x;
    const prevY = l.y;
    const prevW = l.w;
    const prevH = l.h;

    let shouldMoveItem = false;
    let x = l.x;
    let y = l.y;
    let hasCollisions = false;

    const isWestHandle = handle === "sw" || handle === "w" || handle === "nw";
    const isNorthHandle = handle === "ne" || handle === "n" || handle === "nw";

    if (isWestHandle || isNorthHandle) {
      if (isWestHandle) {
        x = l.x + (l.w - w);
        w = l.x !== x && x < 0 ? l.w : w;
        x = x < 0 ? 0 : x;
      }
      if (isNorthHandle) {
        y = l.y + (l.h - h);
        h = l.y !== y && y < 0 ? l.h : h;
        y = y < 0 ? 0 : y;
      }
      shouldMoveItem = true;
    }

    const snapped = editor.snapCandidate(
      i,
      l,
      { ...l, x, y, w, h },
      layout,
      handle as ResizeHandleAxis
    );
    x = snapped.x;
    y = snapped.y;
    w = snapped.w;
    h = snapped.h;
    shouldMoveItem = shouldMoveItem || x !== l.x || y !== l.y;

    if (preventCollision && !allowOverlap) {
      const collisions = getAllCollisions(layout, { ...l, w, h, x, y });
      hasCollisions = collisions.length > 0;
      if (hasCollisions) {
        x = l.x;
        y = l.y;
        w = l.w;
        h = l.h;
        shouldMoveItem = false;
      }
    }
    if (activeResizeId.value === i) resizeBlocked.value = hasCollisions;

    l.w = w;
    l.h = h;

    let finalLayout: Layout = layout;
    if (shouldMoveItem) {
      const isUserAction = true;
      finalLayout = moveElement(
        layout,
        l,
        compactType(props),
        cols,
        allowOverlap,
        x,
        y,
        isUserAction,
        props.preventCollision
      );
    }

    const placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      static: true,
      i: i
    };

    if (activeResizeInteractionId) {
      const transition = interactionMachine.dispatch({
        type: "MOVE_RESIZE",
        interactionId: activeResizeInteractionId,
        geometry: { x: placeholder.x, y: placeholder.y, w: placeholder.w, h: placeholder.h }
      });
      if (!hasEffect(transition.effects, "PREVIEW_RESIZE")) return;
    }

    eventBridge.emitResize(finalLayout, oldResizeItem, l, placeholder, e, node);

    const didResize =
      l.x !== prevX ||
      l.y !== prevY ||
      l.w !== prevW ||
      l.h !== prevH ||
      (allowOverlap && finalLayout !== state.layout);

    if (!didResize) return;

    if (!allowOverlap) {
      frameUpdate.resetMovedFlags(layout);
    }

    frameUpdate.schedule({
      cols,
      compactType: compactType(props),
      layout: allowOverlap && finalLayout !== state.layout ? finalLayout : undefined,
      placeholder,
      shouldCompact: !allowOverlap
    });
    editor.updateIntelligence(i, l, placeholder, handle as ResizeHandleAxis);
  };

  const onResizeStop = (i: string, w: number, h: number, { e, node, handle }: GridResizeEvent) => {
    frameUpdate.cancel();
    const { layout, oldResizeItem, oldLayout } = state;
    const { cols, allowOverlap } = props;
    const l = getLayoutItem(layout, i);
    if (!l) return;
    const resizeHandle = handle as ResizeHandleAxis;
    const stopGeometry = state.activeDrag || buildResizeCandidate(l, w, h, resizeHandle);
    let coreResizeCommitEffect: Extract<GridInteractionEffect, { type: "COMMIT_RESIZE" }> | undefined;
    if (activeResizeInteractionId) {
      const transition = interactionMachine.dispatch({
        type: "STOP_RESIZE",
        interactionId: activeResizeInteractionId,
        geometry: {
          x: stopGeometry.x,
          y: stopGeometry.y,
          w: stopGeometry.w,
          h: stopGeometry.h
        }
      });
      coreResizeCommitEffect = hasEffect(transition.effects, "COMMIT_RESIZE");
      if (!coreResizeCommitEffect) {
        if (hasEffect(transition.effects, "EMIT_RESIZE_STOP") || !activeResizeInteractionId) {
          eventBridge.emitResizeStop(layout, oldResizeItem, l, undefined, e, node);
        }
        cleanupResizeInteraction();
        return;
      }
    }
    if (!coreResizeCommitEffect) {
      eventBridge.emitResizeStop(layout, oldResizeItem, l, undefined, e, node);
      cleanupResizeInteraction();
      return;
    }

    if (!isLegacyLayoutEngine()) {
      let commitGeometry = stopGeometry;
      const committedBefore = engineBridge.getCommitted();
      const resizeIntent = editor.resolveResizeIntent?.({
        id: i,
        item: l,
        layout,
        handle: resizeHandle,
        rawCandidate: commitGeometry,
        metrics: getResizeMetrics(),
        phase: "commit"
      });
      if (resizeIntent?.kind === "blocked") {
        resizeBlocked.value = true;
        eventBridge.emitResizeStop(layout, oldResizeItem, l, undefined, e, node);
        cleanupResizeInteraction();
        return;
      }
      if (resizeIntent?.kind === "allowed") {
        commitGeometry = resizeIntent.candidate;
        activeResizeConstraint = resizeIntent.constraint || activeResizeConstraint;
      }
      runEngineCommit(
        coreResizeCommitEffect.requestId,
        {
          type: "resize",
          id: i,
          w: commitGeometry.w,
          h: commitGeometry.h,
          x: commitGeometry.x,
          y: commitGeometry.y,
          handle: handle as ResizeHandleAxis,
          constraint: activeResizeConstraint
        },
        result => {
          void (async () => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentRequest(coreResizeCommitEffect.interactionId, coreResizeCommitEffect.requestId)) return;
          let applyEffects: GridInteractionEffect[] = [];
          if (activeResizeInteractionId) {
            const coreStatus = result.status === "cancelled" ? "error" : result.status;
            applyEffects = interactionMachine.dispatch({
              type: "APPLY_RESULT",
              interactionId: activeResizeInteractionId,
              requestId: coreResizeCommitEffect.requestId,
              status: coreStatus
            }).effects;
          }
          const newLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(newLayout, i) || l;
          const commandResult = result.status === "changed" || result.status === "fallback"
            ? (state.suppressLayoutChange = true, await editor.commitResize?.({
              id: i,
              beforeLayout: oldLayout || committedBefore || layout,
              afterLayout: newLayout,
              handle: resizeHandle
            }))
            : null;
          if (
            commandResult &&
            commandResult.status !== "changed" &&
            commandResult.status !== "noop"
          ) {
            const rollbackLayout = oldLayout || committedBefore || layout;
            state.suppressLayoutChange = true;
            state.layout = markRaw(rollbackLayout);
            editor.rollbackInteraction?.(rollbackLayout, commandResult.status);
            state.activeDrag = null;
            state.oldResizeItem = null;
            state.resizing = false;
            activeResizeId.value = null;
            resizeBlocked.value = false;
            activeResizeInteractionId = null;
            activeResizeConstraint = undefined;
            autoScroll.reset();
            state.oldLayout = null;
            return;
          }
          if (hasEffect(applyEffects, "EMIT_RESIZE_STOP")) {
            eventBridge.emitResizeStop(newLayout, oldResizeItem, nextItem, undefined, e, node);
          }

          state.activeDrag = null;
          state.layout = markRaw(newLayout);
          state.oldResizeItem = null;
          state.resizing = false;
          activeResizeId.value = null;
          resizeBlocked.value = false;
          activeResizeInteractionId = null;
          activeResizeConstraint = undefined;
          autoScroll.reset();
          editor.clearGuides();
          state.oldLayout = null;
          onLayoutMaybeChanged(newLayout, oldLayout || committedBefore || layout, "push");
          })();
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }

    const newLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
    let applyEffects: GridInteractionEffect[] = [];
    if (activeResizeInteractionId && coreResizeCommitEffect) {
      applyEffects = interactionMachine.dispatch({
        type: "APPLY_RESULT",
        interactionId: activeResizeInteractionId,
        requestId: coreResizeCommitEffect.requestId,
        status: "changed"
      }).effects;
    }
    void (async () => {
      const commandResult = (state.suppressLayoutChange = true, await editor.commitResize?.({
        id: i,
        beforeLayout: oldLayout || layout,
        afterLayout: newLayout,
        handle: resizeHandle
      }));
      if (
        commandResult &&
        commandResult.status !== "changed" &&
        commandResult.status !== "noop"
      ) {
        const rollbackLayout = oldLayout || layout;
        state.suppressLayoutChange = true;
        state.layout = markRaw(rollbackLayout);
        editor.rollbackInteraction?.(rollbackLayout, commandResult.status);
        cleanupResizeInteraction();
        return;
      }
    if (hasEffect(applyEffects, "EMIT_RESIZE_STOP")) {
      eventBridge.emitResizeStop(newLayout, oldResizeItem, l, undefined, e, node);
    }

    state.activeDrag = null;
    state.layout = markRaw(newLayout);
    state.oldResizeItem = null;
    state.resizing = false;
    activeResizeId.value = null;
    resizeBlocked.value = false;
    activeResizeInteractionId = null;
    activeResizeConstraint = undefined;
    autoScroll.reset();
    editor.clearGuides();

    state.oldLayout = null;
    onLayoutMaybeChanged(newLayout, oldLayout || layout, "push");
    })();
  };

  const onDragStart = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    frameUpdate.cancel();
    const { layout } = state;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    const moveIntent = editor.resolveMoveDrag({
      id: i,
      item: l,
      layout,
      legacyLayoutEngine: isLegacyLayoutEngine(),
      event: e
    });
    if (moveIntent.kind === "blocked") {
      activeMoveContext = {
        kind: "blocked",
        reason: moveIntent.reason,
        ids: moveIntent.ids,
        activeId: moveIntent.activeId
      };
      const dragInteractionId = nextInteractionRequestId("drag-interaction", i);
      const startTransition = interactionMachine.dispatch({
        type: "START_DRAG",
        interactionId: dragInteractionId,
        itemId: i,
        grid: { x, y },
        context: toCoreDragContext(activeMoveContext)
      });
      if (!hasEffect(startTransition.effects, "EMIT_DRAG_START")) {
        activeMoveContext = null;
        return;
      }
      activeDragInteractionId = dragInteractionId;
      activeDragId.value = moveIntent.activeId || i;
      setDragBlockedFeedback(
        moveIntent.reason as GridInteractionBlockedReason,
        moveIntent.ids,
        `Pointer move blocked by ${moveIntent.reason}.`
      );
      state.oldDragItem = cloneLayoutItem(l);
      state.oldLayout = cloneLayout(layout);
      state.activeDrag = markRaw({ w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i });
      activeDragHasMoved = false;
      editor.notifyMoveBlocked({
        ...moveIntent,
        message: `Pointer move blocked by ${moveIntent.reason}.`
      });
      return eventBridge.emitDragStart(layout, l, l, undefined, e, node);
    }

    const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };
    activeMoveContext = moveIntent.kind === "group"
      ? {
          kind: "group",
          activeId: moveIntent.activeId,
          ids: moveIntent.ids,
          startX: l.x,
          startY: l.y
        }
      : {
          kind: "single",
          id: moveIntent.id,
          startX: l.x,
          startY: l.y
        };
    const dragInteractionId = nextInteractionRequestId("drag-interaction", i);
    const startTransition = interactionMachine.dispatch({
      type: "START_DRAG",
      interactionId: dragInteractionId,
      itemId: i,
      grid: { x, y },
      context: toCoreDragContext(activeMoveContext)
    });
    if (!hasEffect(startTransition.effects, "EMIT_DRAG_START")) {
      activeMoveContext = null;
      return;
    }
    activeDragInteractionId = dragInteractionId;
    syncHistory(layout, "replace");
    activeDragId.value = activeMoveContext.kind === "group" ? activeMoveContext.activeId : i;
    dragBlocked.value = false;
    clearDragBlockedFeedback();
    editor.resetSnap();
    editor.clearGuides();
    activeDragHasMoved = false;
    autoScroll.init(node);
    state.oldDragItem = cloneLayoutItem(l);
    state.oldLayout = cloneLayout(layout);
    state.activeDrag = markRaw(placeholder);
    if (!isLegacyLayoutEngine()) {
      resetInteractionController(layout);
      engineBridge.start({
        id: activeDragInteractionId,
        type: "drag",
        itemId: activeDragId.value || i
      });
    }

    return eventBridge.emitDragStart(layout, l, l, undefined, e, node);
  };

  const onDrag = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    const { oldDragItem } = state;
    let { layout } = state;
    const { cols, allowOverlap, preventCollision } = props;
    const l = getLayoutItem(layout, i);
    if (!l) return;
    autoScroll.maybeScroll(e, node);

    if (activeMoveContext?.kind === "blocked") {
      dragBlocked.value = true;
      return;
    }

    if (!activeDragInteractionId) return;

    if (activeMoveContext?.kind === "group" && !isLegacyLayoutEngine()) {
      const context = activeMoveContext;
      const activeItem = getLayoutItem(layout, context.activeId) || l;
      const snapped = editor.snapCandidate(
        context.activeId,
        activeItem,
        { ...activeItem, x, y },
        layout
      );
      const dragTransition = interactionMachine.dispatch({
        type: "MOVE_DRAG",
        interactionId: activeDragInteractionId,
        currentPx: { x: snapped.x, y: snapped.y },
        grid: { x: snapped.x, y: snapped.y }
      });
      const dragPreviewEffect = hasEffect(dragTransition.effects, "PREVIEW_DRAG");
      if (!dragPreviewEffect) {
        if (!activeDragHasMoved) editor.clearGuides();
        return;
      }
      activeDragHasMoved = true;
      const dx = snapped.x - context.startX;
      const dy = snapped.y - context.startY;
      runEnginePreview(
        dragPreviewEffect.requestId,
        {
          type: "groupMove",
          ids: context.ids,
          activeId: context.activeId,
          dx,
          dy,
          userAction: true
        },
        result => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentPreviewRequest(dragPreviewEffect.interactionId, dragPreviewEffect.requestId)) return;
          if (activeMoveContext !== context || activeDragId.value !== context.activeId) return;
          const nextLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(nextLayout, context.activeId) || activeItem;
          const placeholder = buildMovePlaceholder(activeItem, snapped.x, snapped.y, context.activeId);
          if (activeDragId.value === context.activeId) {
            syncDragBlockedFromResult(result, context.ids, context.activeId);
          }
          eventBridge.emitDrag(nextLayout, oldDragItem, nextItem, placeholder, e, node);
          if (result.status === "changed" || result.status === "fallback") {
            state.layout = markRaw(nextLayout);
          }
          state.activeDrag = markRaw(placeholder);
          editor.updateIntelligence(context.activeId, activeItem, placeholder);
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }

    if (!isLegacyLayoutEngine()) {
      const snapped = editor.snapCandidate(i, l, { ...l, x, y }, layout);
      const dragTransition = interactionMachine.dispatch({
        type: "MOVE_DRAG",
        interactionId: activeDragInteractionId,
        currentPx: { x: snapped.x, y: snapped.y },
        grid: { x: snapped.x, y: snapped.y }
      });
      const dragPreviewEffect = hasEffect(dragTransition.effects, "PREVIEW_DRAG");
      if (!dragPreviewEffect) {
        if (!activeDragHasMoved) editor.clearGuides();
        return;
      }
      activeDragHasMoved = true;
      runEnginePreview(
        dragPreviewEffect.requestId,
        { type: "move", id: i, x: snapped.x, y: snapped.y, userAction: true },
        result => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentPreviewRequest(dragPreviewEffect.interactionId, dragPreviewEffect.requestId)) return;
          if (activeMoveContext?.kind !== "single" || activeMoveContext.id !== i || activeDragId.value !== i) return;
          const nextLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(nextLayout, i) || l;
          const placeholder = buildMovePlaceholder(l, snapped.x, snapped.y, i);
          if (activeDragId.value === i) {
            syncDragBlockedFromResult(result, [i], i);
          }
          eventBridge.emitDrag(nextLayout, oldDragItem, nextItem, placeholder, e, node);
          if (result.status === "changed" || result.status === "fallback") {
            state.layout = markRaw(nextLayout);
          }
          state.activeDrag = markRaw(placeholder);
          editor.updateIntelligence(i, l, placeholder);
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }

    const isLargeLayout = state.layout.length >= LARGE_LAYOUT_THRESHOLD;
    const prevX = l.x;
    const prevY = l.y;

    if (activeDragId.value === i) {
      const collisions = Boolean(preventCollision) && !allowOverlap
        ? getAllCollisions(layout, { ...l, x, y })
        : [];
      if (collisions.length > 0) {
        setDragBlockedFeedback(
          "collision",
          collisions.map(item => item.i),
          "Pointer move blocked by collision."
        );
      } else {
        dragBlocked.value = false;
        clearDragBlockedFeedback();
      }
    }

    const isUserAction = true;
    const snapped = editor.snapCandidate(i, l, { ...l, x, y }, layout);
    const dragTransition = interactionMachine.dispatch({
      type: "MOVE_DRAG",
      interactionId: activeDragInteractionId,
      currentPx: { x: snapped.x, y: snapped.y },
      grid: { x: snapped.x, y: snapped.y }
    });
    if (!hasEffect(dragTransition.effects, "PREVIEW_DRAG")) {
      if (!activeDragHasMoved) editor.clearGuides();
      return;
    }
    activeDragHasMoved = true;
    layout = moveElement(
      layout,
      l,
      compactType(props),
      cols,
      allowOverlap,
      snapped.x,
      snapped.y,
      isUserAction,
      preventCollision
    );

    const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };

    eventBridge.emitDrag(layout, oldDragItem, l, placeholder, e, node);

    const didMove = l.x !== prevX || l.y !== prevY || (allowOverlap && layout !== state.layout);
    if (!didMove) return;

    if (!isLargeLayout) {
      const nextLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
      const nextItem = getLayoutItem(nextLayout, i) || l;
      const nextPlaceholder = {
        w: nextItem.w,
        h: nextItem.h,
        x: nextItem.x,
        y: nextItem.y,
        placeholder: true,
        i: i
      };

      state.layout = markRaw(nextLayout);
      state.activeDrag = markRaw(nextPlaceholder);
      editor.updateIntelligence(i, l, nextPlaceholder);
      return;
    }

    if (!allowOverlap) {
      frameUpdate.resetMovedFlags(state.layout);
    }

    frameUpdate.schedule({
      cols,
      compactType: compactType(props),
      layout: allowOverlap && layout !== state.layout ? layout : undefined,
      placeholder,
      shouldCompact: !allowOverlap
    });
    editor.updateIntelligence(i, l, placeholder);
  };

  const onDragStop = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    frameUpdate.cancel();
    if (!state.activeDrag) return;

    const { oldDragItem, oldLayout } = state;
    const prevLayout = state.layout;
    let layout = prevLayout;
    const { cols, preventCollision, allowOverlap } = props;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    let dragCommitEffect: Extract<GridInteractionEffect, { type: "COMMIT_DRAG" }> | undefined;
    let stopEffects: GridInteractionEffect[] = [];
    if (activeDragInteractionId) {
      const stopTransition = interactionMachine.dispatch({
        type: "STOP_DRAG",
        interactionId: activeDragInteractionId,
        grid: { x, y }
      });
      stopEffects = stopTransition.effects;
      dragCommitEffect = hasEffect(stopTransition.effects, "COMMIT_DRAG");
    }

    if (!dragCommitEffect) {
      if (hasEffect(stopEffects, "EMIT_DRAG_STOP") || !activeDragInteractionId) {
        eventBridge.emitDragStop(prevLayout, oldDragItem, l, undefined, e, node);
      }
      finishDragInteraction();
      state.oldLayout = null;
      return;
    }

    if (activeMoveContext?.kind === "group" && !isLegacyLayoutEngine()) {
      const context = activeMoveContext;
      const commitGeometry = state.activeDrag || { x, y };
      const dx = commitGeometry.x - context.startX;
      const dy = commitGeometry.y - context.startY;
      const committedBefore = engineBridge.getCommitted();
      runEngineCommit(
        dragCommitEffect.requestId,
        {
          type: "groupMove",
          ids: context.ids,
          activeId: context.activeId,
          dx,
          dy,
          userAction: true
        },
        result => {
          void (async () => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentRequest(dragCommitEffect.interactionId, dragCommitEffect.requestId)) return;
          if (result.status === "blocked") {
            syncDragBlockedFromResult(result, context.ids, context.activeId, true);
          }
          const applyEffects = interactionMachine.dispatch({
            type: "APPLY_RESULT",
            interactionId: dragCommitEffect.interactionId,
            requestId: dragCommitEffect.requestId,
            status: result.status === "cancelled" ? "error" : result.status
          }).effects;
          const newLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(newLayout, context.activeId) || l;
          const commandResult = result.status === "changed" || result.status === "fallback"
            ? (state.suppressLayoutChange = true, await editor.commitMove?.({
              ids: context.ids,
              activeId: context.activeId,
              beforeLayout: oldLayout || committedBefore || prevLayout,
              afterLayout: newLayout,
              source: "pointer"
            }))
            : null;
          if (
            commandResult &&
            commandResult.status !== "changed" &&
            commandResult.status !== "noop"
          ) {
            const rollbackLayout = oldLayout || committedBefore || prevLayout;
            state.suppressLayoutChange = true;
            state.layout = markRaw(rollbackLayout);
            editor.rollbackInteraction?.(rollbackLayout, commandResult.status);
            state.activeDrag = null;
            state.oldDragItem = null;
            activeDragId.value = null;
            dragBlocked.value = false;
            clearDragBlockedFeedback();
            activeMoveContext = null;
            activeDragHasMoved = false;
            activeDragInteractionId = null;
            autoScroll.reset();
            state.oldLayout = null;
            return;
          }
          if (hasEffect(applyEffects, "EMIT_DRAG_STOP")) {
            eventBridge.emitDragStop(newLayout, oldDragItem, nextItem, undefined, e, node);
          }

          state.activeDrag = null;
          state.layout = markRaw(newLayout);
          state.oldDragItem = null;
          activeDragId.value = null;
          dragBlocked.value = false;
          clearDragBlockedFeedback();
          activeMoveContext = null;
          activeDragHasMoved = false;
          activeDragInteractionId = null;
          autoScroll.reset();
          editor.clearGuides();
          state.oldLayout = null;
          onLayoutMaybeChanged(newLayout, oldLayout || committedBefore || prevLayout, "push");
          })();
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }

    if (!isLegacyLayoutEngine()) {
      const commitGeometry = state.activeDrag || { x, y };
      const committedBefore = engineBridge.getCommitted();
      runEngineCommit(
        dragCommitEffect.requestId,
        { type: "move", id: i, x: commitGeometry.x, y: commitGeometry.y, userAction: true },
        result => {
          void (async () => {
          if (result.status === "stale") return;
          if (!interactionMachine.isCurrentRequest(dragCommitEffect.interactionId, dragCommitEffect.requestId)) return;
          if (result.status === "blocked") {
            syncDragBlockedFromResult(result, [i], i, true);
          }
          const applyEffects = interactionMachine.dispatch({
            type: "APPLY_RESULT",
            interactionId: dragCommitEffect.interactionId,
            requestId: dragCommitEffect.requestId,
            status: result.status === "cancelled" ? "error" : result.status
          }).effects;
          const newLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(newLayout, i) || l;
          const commandResult = result.status === "changed" || result.status === "fallback"
            ? (state.suppressLayoutChange = true, await editor.commitMove?.({
              ids: [i],
              activeId: i,
              beforeLayout: oldLayout || committedBefore || prevLayout,
              afterLayout: newLayout,
              source: "pointer"
            }))
            : null;
          if (
            commandResult &&
            commandResult.status !== "changed" &&
            commandResult.status !== "noop"
          ) {
            const rollbackLayout = oldLayout || committedBefore || prevLayout;
            state.suppressLayoutChange = true;
            state.layout = markRaw(rollbackLayout);
            editor.rollbackInteraction?.(rollbackLayout, commandResult.status);
            state.activeDrag = null;
            state.oldDragItem = null;
            activeDragId.value = null;
            dragBlocked.value = false;
            clearDragBlockedFeedback();
            activeMoveContext = null;
            activeDragHasMoved = false;
            activeDragInteractionId = null;
            autoScroll.reset();
            state.oldLayout = null;
            return;
          }
          if (hasEffect(applyEffects, "EMIT_DRAG_STOP")) {
            eventBridge.emitDragStop(newLayout, oldDragItem, nextItem, undefined, e, node);
          }

          state.activeDrag = null;
          state.layout = markRaw(newLayout);
          state.oldDragItem = null;
          activeDragId.value = null;
          dragBlocked.value = false;
          clearDragBlockedFeedback();
          activeMoveContext = null;
          activeDragHasMoved = false;
          activeDragInteractionId = null;
          autoScroll.reset();
          editor.clearGuides();
          state.oldLayout = null;
          onLayoutMaybeChanged(newLayout, oldLayout || committedBefore || prevLayout, "push");
          })();
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }

    const isUserAction = true;
    const commitGeometry = state.activeDrag || { x, y };
    layout = moveElement(
      layout,
      l,
      compactType(props),
      cols,
      allowOverlap,
      commitGeometry.x,
      commitGeometry.y,
      isUserAction,
      preventCollision
    );

    const newLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
    const applyEffects = interactionMachine.dispatch({
      type: "APPLY_RESULT",
      interactionId: dragCommitEffect.interactionId,
      requestId: dragCommitEffect.requestId,
      status: "changed"
    }).effects;
    void (async () => {
      const commandResult = (state.suppressLayoutChange = true, await editor.commitMove?.({
        ids: [i],
        activeId: i,
        beforeLayout: oldLayout || prevLayout,
        afterLayout: newLayout,
        source: "pointer"
      }));
      if (
        commandResult &&
        commandResult.status !== "changed" &&
        commandResult.status !== "noop"
      ) {
        const rollbackLayout = oldLayout || prevLayout;
        state.suppressLayoutChange = true;
        state.layout = markRaw(rollbackLayout);
        editor.rollbackInteraction?.(rollbackLayout, commandResult.status);
        state.activeDrag = null;
        state.oldDragItem = null;
        activeDragId.value = null;
        dragBlocked.value = false;
        clearDragBlockedFeedback();
        activeMoveContext = null;
        activeDragHasMoved = false;
        activeDragInteractionId = null;
        autoScroll.reset();
        state.oldLayout = null;
        return;
      }
    if (hasEffect(applyEffects, "EMIT_DRAG_STOP")) {
      eventBridge.emitDragStop(newLayout, oldDragItem, l, undefined, e, node);
    }

    state.activeDrag = null;
    state.layout = markRaw(newLayout);
    state.oldDragItem = null;
    activeDragId.value = null;
    dragBlocked.value = false;
    clearDragBlockedFeedback();
    activeMoveContext = null;
    activeDragHasMoved = false;
    activeDragInteractionId = null;
    autoScroll.reset();
    editor.clearGuides();

    state.oldLayout = null;
    onLayoutMaybeChanged(newLayout, oldLayout || prevLayout, "push");
    })();
  };

  return {
    activeDragId,
    activeResizeId,
    dragBlocked,
    dragBlockedReason,
    dragBlockedItemIds,
    dragBlockedMessage,
    resizeBlocked,
    clearActiveInteraction,
    onResizeStart,
    onResize,
    onResizeStop,
    onDragStart,
    onDrag,
    onDragStop
  };
}
