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
import type {
  GridDragEvent,
  GridResizeEvent,
  Layout,
  LayoutItem,
  ResizeHandleAxis
} from "../utils";
import type {
  GridInteractionCommonOptions,
  GridInteractionModelCommitters
} from "./gridInteractionTypes";

const LARGE_LAYOUT_THRESHOLD = 200;

type UseGridDragResizeInteractionsOptions =
  GridInteractionCommonOptions &
  GridInteractionModelCommitters;

export function useGridDragResizeInteractions({
  props,
  state,
  eventBridge,
  engineBridge,
  frameUpdate,
  autoScroll,
  editor,
  nextInteractionRequestId,
  syncHistory,
  onLayoutMaybeChanged
}: UseGridDragResizeInteractionsOptions) {
  const dragBlocked = ref(false);
  const resizeBlocked = ref(false);
  const activeDragId = ref<string | null>(null);
  const activeResizeId = ref<string | null>(null);

  const getLayoutEngineProp = () => engineBridge.getLayoutEngineProp();
  const isLegacyLayoutEngine = () => engineBridge.isLegacyLayoutEngine();
  const resetInteractionController = (layout?: Layout) => engineBridge.reset(layout);
  const runEnginePreview: typeof engineBridge.preview = (...args) => engineBridge.preview(...args);
  const runEngineCommit: typeof engineBridge.commit = (...args) => engineBridge.commit(...args);

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

  const clearActiveInteraction = () => {
    activeDragId.value = null;
    activeResizeId.value = null;
    dragBlocked.value = false;
    resizeBlocked.value = false;
  };

  const shouldUseWorkerForCurrentLayout = () =>
    state.layout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000);

  const onResizeStart = (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
    frameUpdate.cancel();
    const { layout } = state;
    const l = getLayoutItem(layout, i);
    if (!l) return;
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
    if (!isLegacyLayoutEngine()) {
      const layout = state.layout;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      autoScroll.maybeScroll(e, node);
      const resizeHandle = handle as ResizeHandleAxis;
      const snapped = editor.snapCandidate(
        i,
        l,
        buildResizeCandidate(l, w, h, resizeHandle),
        layout,
        resizeHandle
      );
      runEnginePreview(
        nextInteractionRequestId("resize", i),
        {
          type: "resize",
          id: i,
          w: snapped.w,
          h: snapped.h,
          x: snapped.x,
          y: snapped.y,
          handle: resizeHandle
        },
        result => {
          if (result.status === "stale") return;
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

    if (!isLegacyLayoutEngine()) {
      const commitGeometry = state.activeDrag || buildResizeCandidate(l, w, h, handle as ResizeHandleAxis);
      runEngineCommit(
        nextInteractionRequestId("resize-stop", i),
        {
          type: "resize",
          id: i,
          w: commitGeometry.w,
          h: commitGeometry.h,
          x: commitGeometry.x,
          y: commitGeometry.y,
          handle: handle as ResizeHandleAxis
        },
        result => {
          if (result.status === "stale") return;
          const newLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(newLayout, i) || l;
          eventBridge.emitResizeStop(newLayout, oldResizeItem, nextItem, undefined, e, node);

          state.activeDrag = null;
          state.layout = markRaw(newLayout);
          state.oldResizeItem = null;
          state.resizing = false;
          activeResizeId.value = null;
          resizeBlocked.value = false;
          autoScroll.reset();
          editor.clearGuides();
          if (newLayout === layout) {
            state.oldLayout = null;
            onLayoutMaybeChanged(newLayout, oldLayout || layout, "push");
          }
        },
        shouldUseWorkerForCurrentLayout()
      );
      return;
    }

    const newLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
    eventBridge.emitResizeStop(newLayout, oldResizeItem, l, undefined, e, node);

    state.activeDrag = null;
    state.layout = markRaw(newLayout);
    state.oldResizeItem = null;
    state.resizing = false;
    activeResizeId.value = null;
    resizeBlocked.value = false;
    autoScroll.reset();
    editor.clearGuides();

    if (newLayout === layout) {
      state.oldLayout = null;
      onLayoutMaybeChanged(newLayout, oldLayout || layout, "push");
    }
  };

  const onDragStart = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    frameUpdate.cancel();
    const { layout } = state;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };
    syncHistory(layout, "replace");
    activeDragId.value = i;
    dragBlocked.value = false;
    editor.resetSnap();
    autoScroll.init(node);
    state.oldDragItem = cloneLayoutItem(l);
    state.oldLayout = cloneLayout(layout);
    state.activeDrag = markRaw(placeholder);
    if (!isLegacyLayoutEngine()) {
      resetInteractionController(layout);
      engineBridge.start({
        id: nextInteractionRequestId("drag-start", i),
        type: "drag",
        itemId: i
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

    if (!isLegacyLayoutEngine()) {
      const snapped = editor.snapCandidate(i, l, { ...l, x, y }, layout);
      runEnginePreview(
        nextInteractionRequestId("drag", i),
        { type: "move", id: i, x: snapped.x, y: snapped.y, userAction: true },
        result => {
          if (result.status === "stale") return;
          const nextLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(nextLayout, i) || l;
          const placeholder = result.placeholder || {
            w: nextItem.w,
            h: nextItem.h,
            x: nextItem.x,
            y: nextItem.y,
            placeholder: true,
            i
          };
          if (activeDragId.value === i) dragBlocked.value = result.status === "blocked";
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
      dragBlocked.value =
        Boolean(preventCollision) &&
        !allowOverlap &&
        getAllCollisions(layout, { ...l, x, y }).length > 0;
    }

    const isUserAction = true;
    const snapped = editor.snapCandidate(i, l, { ...l, x, y }, layout);
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

    if (!isLegacyLayoutEngine()) {
      const commitGeometry = state.activeDrag || { x, y };
      runEngineCommit(
        nextInteractionRequestId("drag-stop", i),
        { type: "move", id: i, x: commitGeometry.x, y: commitGeometry.y, userAction: true },
        result => {
          if (result.status === "stale") return;
          const newLayout = result.status === "changed" || result.status === "fallback"
            ? result.layout
            : engineBridge.getCommitted();
          const nextItem = getLayoutItem(newLayout, i) || l;
          eventBridge.emitDragStop(newLayout, oldDragItem, nextItem, undefined, e, node);

          state.activeDrag = null;
          state.layout = markRaw(newLayout);
          state.oldDragItem = null;
          activeDragId.value = null;
          dragBlocked.value = false;
          autoScroll.reset();
          editor.clearGuides();
          if (newLayout === prevLayout) {
            state.oldLayout = null;
            onLayoutMaybeChanged(newLayout, oldLayout || prevLayout, "push");
          }
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
    eventBridge.emitDragStop(newLayout, oldDragItem, l, undefined, e, node);

    state.activeDrag = null;
    state.layout = markRaw(newLayout);
    state.oldDragItem = null;
    activeDragId.value = null;
    dragBlocked.value = false;
    autoScroll.reset();
    editor.clearGuides();

    if (newLayout === prevLayout) {
      state.oldLayout = null;
      onLayoutMaybeChanged(newLayout, oldLayout || prevLayout, "push");
    }
  };

  return {
    activeDragId,
    activeResizeId,
    dragBlocked,
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
