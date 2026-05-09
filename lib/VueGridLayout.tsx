import { defineComponent, VNode, reactive, ref, onMounted, onBeforeUnmount, h, Fragment, watch, markRaw, computed, toRef, nextTick, type Ref } from 'vue'
import { deepEqual } from "fast-equals";
import { pick } from 'lodash'
import clsx from "clsx";
import {
  bottom,
  cloneLayout,
  cloneLayoutItem,
  compact,
  compactInPlace,
  compactType,
  findFirstFit,
  findNearestFit,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  noop,
  synchronizeLayoutWithChildren,
  withLayoutItem,
  childrenEqual,
  getNonFragmentChildren
} from "./utils";
import { calcXY } from "./calculateUtils";
import GridItem from "./GridItem";
import { basicProps as gridLayoutProps } from "./VueGridLayoutPropTypes";
import {
  useGridLayoutPersistence,
  type LayoutPersistenceEvent
} from "./persistence";
import {
  compareWithLegacyLayout,
  createInteractionController,
  createInteractionScheduler,
  createLayoutExecutor,
  executeLayoutOperation
} from "./layout-engine";
import type {
  CompactType,
  GridResizeEvent,
  GridDragEvent,
  Layout,
  DroppingPosition,
  LayoutItem,
  EventCallback,
  ResizeHandleAxis
} from "./utils";
import type {
  GridLayoutEngineOptions,
  LayoutOperation,
  LayoutOperationRequest,
  LayoutOperationResult
} from "./layout-engine";
import { PositionParams } from "./calculateUtils";
import { Kv } from './type'

export interface AttrsEvents {
  onDrag?: EventCallback
  onDragStart?: EventCallback
  onDragStop?: EventCallback
  onResize?: EventCallback
  onResizeStart?: EventCallback
  onResizeStop?: EventCallback
  onDrop?: (layout: Layout, e: Event, item?: LayoutItem) => void,
  onDropDragOver?: (e: DragEvent) => { w?: number; h?: number } | false;
}

type State = {
  activeDrag: LayoutItem | null,
  layout: Layout,
  mounted: boolean,
  oldDragItem?: LayoutItem | null,
  oldLayout?: Layout | null,
  oldResizeItem?: LayoutItem | null,
  resizing: boolean,
  droppingDOMNode?: VNode | null,
  droppingPosition?: DroppingPosition,
  compactType?: CompactType,
  children: VNode[]
};

// Utility class names
const layoutClassName = "vue-grid-layout";
const isFirefox =
  typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

const componentName = 'VueGridLayout';

const LARGE_LAYOUT_THRESHOLD = 200;

const VueGridLayout = defineComponent({
  name: componentName,
  inheritAttrs: false,
  props: {
    ...gridLayoutProps
  },
  emits: ['update:modelValue', 'layoutChange'],
  setup(props, { slots, attrs, emit }) {
    const vAttrs = attrs as AttrsEvents
    const children: VNode[] = slots.default ? getNonFragmentChildren(h(Fragment, null, slots.default())) : [];
    const dragEnterCounter = ref(0);
    const dragBlocked = ref(false);
    const resizeBlocked = ref(false);
    const activeDragId = ref<string | null>(null);
    const activeResizeId = ref<string | null>(null);
    let restoringPersistence = false;


    // Reactive state object
    const state: State = reactive({
      activeDrag: null,
      layout: markRaw(
        synchronizeLayoutWithChildren(
          props.modelValue,
          children,
          props.cols,
          compactType(props),
          props.allowOverlap,
          layout => {
            emit('update:modelValue', layout)
            emit('layoutChange', layout)
          }
        )
      ),
      mounted: false,
      oldDragItem: null,
      oldLayout: null,
      oldResizeItem: null,
      resizing: false,
      droppingDOMNode: null,
      droppingPosition: undefined,
      compactType: props.compactType,
      children: []
    });

    const syncHistory = (layout: Layout, mode: 'push' | 'replace' = 'push') => {
      const store = props.historyStore;
      if (!store) return;
      if (mode === 'replace') {
        store.replacePresent(layout);
      } else {
        store.push(layout);
      }
    };

    syncHistory(state.layout, 'replace');

    const persistenceConfig = props.persistence && typeof props.persistence === 'object'
      ? props.persistence
      : null;

    const applyPersistedLayout = (layout: Layout) => {
      restoringPersistence = true;
      const restoredLayout = cloneLayout(layout);
      state.layout = markRaw(restoredLayout);
      syncHistory(restoredLayout, 'replace');
      emit('update:modelValue', restoredLayout);
      emit('layoutChange', restoredLayout);
      void nextTick().then(() => {
        restoringPersistence = false;
      });
    };

    const onPersistenceEvent = (event: LayoutPersistenceEvent<Layout>) => {
      if (event.type === 'external-apply') {
        applyPersistedLayout(event.value);
      }
      persistenceConfig?.onEvent?.(event);
    };

    const persistenceController = persistenceConfig
      ? useGridLayoutPersistence<Layout>({
          ...persistenceConfig,
          onEvent: onPersistenceEvent,
          kind: 'layout',
          target: toRef(state, 'layout') as Ref<Layout>,
          watchTarget: false
        })
      : null;

    const getLayoutEngineProp = () =>
      props.layoutEngine && typeof props.layoutEngine === "object"
        ? props.layoutEngine
        : null;

    const isLegacyLayoutEngine = () => {
      const config = getLayoutEngineProp();
      return props.layoutEngine === false || config?.mode === "legacy";
    };

    let executorConfigRef: unknown = undefined;
    let layoutExecutor = createLayoutExecutor();

    const getLayoutExecutor = () => {
      const config = getLayoutEngineProp();
      const nextExecutorConfig = config?.executor;
      if (nextExecutorConfig !== executorConfigRef) {
        layoutExecutor.dispose?.();
        layoutExecutor = createLayoutExecutor(nextExecutorConfig);
        executorConfigRef = nextExecutorConfig;
      }
      return layoutExecutor;
    };

    let schedulerConfigRef: unknown = undefined;
    let interactionScheduler = createInteractionScheduler();

    const getInteractionScheduler = () => {
      const config = getLayoutEngineProp();
      const nextSchedulerConfig = config?.scheduler;
      if (nextSchedulerConfig !== schedulerConfigRef) {
        interactionScheduler.cancel("scheduler reconfigured");
        interactionScheduler = createInteractionScheduler(nextSchedulerConfig);
        schedulerConfigRef = nextSchedulerConfig;
      }
      return interactionScheduler;
    };

    const getLayoutEngineOptions = (): GridLayoutEngineOptions => {
      const config = getLayoutEngineProp();
      return {
        cols: props.cols,
        maxRows: props.maxRows,
        compactType: compactType(props),
        allowOverlap: props.allowOverlap,
        preventCollision: props.preventCollision,
        scheduler: config?.scheduler,
        executor: getLayoutExecutor(),
        compareLegacy: config?.compareLegacy,
        legacyFallback: config?.legacyFallback !== false,
        diagnostics: config?.diagnostics,
        onEvent: config?.onEvent
      };
    };

    let interactionRequestSeq = 0;
    let interactionController = createInteractionController(state.layout, getLayoutEngineOptions());

    const resetInteractionController = (layout: Layout = state.layout) => {
      interactionController.dispose();
      interactionController = createInteractionController(layout, getLayoutEngineOptions());
    };

    const nextInteractionRequestId = (kind: string, itemId: string) =>
      `${kind}:${itemId}:${++interactionRequestSeq}`;

    const maybeReportLegacyMismatch = (
      request: LayoutOperationRequest,
      result: LayoutOperationResult
    ) => {
      if (!getLayoutEngineOptions().compareLegacy) return;
      const comparison = compareWithLegacyLayout(request, result);
      if (!comparison.matches) {
        getLayoutEngineOptions().onEvent?.({
          type: "legacy-mismatch",
          id: request.id,
          message: "VueGridLayout layout engine result differs from legacy path",
          diagnostics: result.diagnostics,
          details: comparison.differences
        });
      }
    };

    const shouldUseExecutor = (request: LayoutOperationRequest): boolean => {
      const executor = getLayoutExecutor();
      if (executor.kind === "main-thread") return false;
      if (
        request.phase === "preview" &&
        (request.operation.type === "move" || request.operation.type === "resize")
      ) {
        return false;
      }
      return (
        request.phase === "commit" ||
        Boolean(request.heavy) ||
        request.operation.type === "dropFit" ||
        request.operation.type === "generateResponsiveLayout"
      );
    };

    const executeScheduledRequest = (
      request: LayoutOperationRequest
    ): LayoutOperationResult | Promise<LayoutOperationResult> => {
      if (shouldUseExecutor(request)) {
        return getLayoutExecutor().execute(request);
      }
      return executeLayoutOperation(request);
    };

    const scheduleEngineRequest = (
      request: LayoutOperationRequest,
      apply: (result: LayoutOperationResult) => void
    ): LayoutOperationResult | null => {
      let immediateResult: LayoutOperationResult | null = null;
      getInteractionScheduler().schedule(
        request,
        executeScheduledRequest,
        result => {
          const applied = interactionController.applyAsyncResult(result);
          getInteractionScheduler().recordDuration(applied.diagnostics?.durationMs || 0);
          maybeReportLegacyMismatch(request, applied);
          apply(applied);
          immediateResult = applied;
        }
      );
      return immediateResult;
    };

    const runEnginePreview = (
      id: string,
      operation: LayoutOperation,
      apply: (result: LayoutOperationResult) => void,
      heavy = false
    ): LayoutOperationResult | null => {
      const request = {
        id,
        operation,
        baseRevision: interactionController.getState().interaction?.startRevision,
        heavy
      };
      return scheduleEngineRequest(interactionController.preparePreview(request), apply);
    };

    const runEngineCommit = (
      id: string,
      operation: LayoutOperation,
      apply: (result: LayoutOperationResult) => void,
      heavy = false
    ): LayoutOperationResult | null => {
      const request = {
        id,
        operation,
        baseRevision: interactionController.getState().interaction?.startRevision,
        heavy
      };
      return scheduleEngineRequest(interactionController.prepareCommit(request), apply);
    };

    watch(
      () => props.historyStore,
      next => {
        if (next) {
          next.replacePresent(state.layout);
        }
      }
    );

    // Check if the layout has changed
    const onLayoutMaybeChanged = (
      newLayout: Layout,
      oldLayout?: Layout | null,
      historyMode: 'push' | 'replace' = 'push'
    ) => {
      if (restoringPersistence) return;
      if (!oldLayout) oldLayout = state.layout;
      if (!deepEqual(oldLayout, newLayout)) {
        syncHistory(newLayout, historyMode);
        emit('layoutChange', newLayout);
        emit('update:modelValue', newLayout)
        persistenceController?.commit(cloneLayout(newLayout), {
          source: historyMode === 'push' ? 'component' : 'programmatic'
        });
      }
    };

    /**
     * After the component updates, if there is no active drag operation,
     * check if the layout has changed and handle the changes accordingly.
     */
    watch(
      () => state.layout,
      (newLayout, oldLayout) => {
        if (state.activeDrag) return;

        // If we have an interaction snapshot, treat this as an interaction commit.
        const interactionOldLayout = state.oldLayout;
        if (interactionOldLayout) {
          state.oldLayout = null;
          onLayoutMaybeChanged(newLayout, interactionOldLayout, 'push');
          return;
        }

        // Otherwise this is a programmatic/layout sync change; keep history present in sync
        // without adding to past/future.
        onLayoutMaybeChanged(newLayout, oldLayout, 'replace');
      }
    );

    // Optimized watcher: Only re-run when relevant props or children structure changes
    const layoutDependencies = computed(() => {
      const defaultSlot = slots.default ? slots.default() : [];
      const nonFragmentChildren = getNonFragmentChildren({ type: Fragment, children: defaultSlot } as VNode);

      // Create a stable signature for children (keys and data-grid props)
      // This avoids deep watching VNodes which change every render
      const childrenSignature = nonFragmentChildren.map(c => {
        const gridProps = c.props?.["data-grid"];
        return {
          key: c.key,
          // We only care about specific grid props that affect layout
          grid: gridProps ? {
            w: gridProps.w, h: gridProps.h, x: gridProps.x, y: gridProps.y
          } : null
        };
      });

      return {
        children: markRaw(nonFragmentChildren),
        props: pick(props, ['compactType', 'modelValue', 'verticalCompact', 'cols', 'allowOverlap']),
        signature: childrenSignature
      };
    });

    watch(
      layoutDependencies,
      ({ children: newChildren, props: nextProps }, { children: oldChildren, props: prevProps }) => {
        // Deep equal check on the signature is much cheaper than on VNodes
        const modelValueMatches = deepEqual(nextProps.modelValue, state.layout);
        const compactTypeMatches = nextProps.compactType === prevProps.compactType;

        // If modelValue matches layout AND compactType is same, check children
        // But wait, the signature check is implicit because if signature didn't change,
        // computed wouldn't update? No, computed returns new object structure.
        // But we can check signature equality here.

        // Actually, if we use the signature in the watcher source, we can skip manual check if signature allows?
        // But we need the actual VNodes (newChildren) for synchronization.

        if (childrenEqual(newChildren, oldChildren) && modelValueMatches && compactTypeMatches) {
          return;
        }

        const layout = synchronizeLayoutWithChildren(
          nextProps.modelValue,
          newChildren,
          nextProps.cols,
          compactType(nextProps),
          nextProps.allowOverlap
        );

        if (!isLegacyLayoutEngine() && (activeDragId.value || activeResizeId.value)) {
          const rebased = interactionController.rebase(layout);
          if (!rebased) {
            state.activeDrag = null;
            activeDragId.value = null;
            activeResizeId.value = null;
            dragBlocked.value = false;
            resizeBlocked.value = false;
          } else if (rebased.placeholder) {
            state.activeDrag = markRaw(rebased.placeholder);
          }
        } else if (!isLegacyLayoutEngine()) {
          resetInteractionController(layout);
        }

        onLayoutMaybeChanged(layout, state.layout, 'replace');
        state.layout = markRaw(layout);
        state.compactType = nextProps.compactType;
      },
      { deep: true } // We still need deep: true to catch changes inside the return object, but the object is lighter
    );

    const supportsRAF =
      typeof requestAnimationFrame === "function" &&
      typeof cancelAnimationFrame === "function";

    type PendingFrameUpdate = {
      cols: number;
      compactType: CompactType;
      layout?: Layout;
      placeholder: LayoutItem;
      shouldCompact: boolean;
    };

    let frameUpdate: PendingFrameUpdate | null = null;
    let frameUpdateRaf: number | null = null;

    const cancelFrameUpdate = () => {
      if (frameUpdateRaf != null && supportsRAF) {
        cancelAnimationFrame(frameUpdateRaf);
      }
      frameUpdateRaf = null;
      frameUpdate = null;
    };

    const resetMovedFlags = (layout: Layout) => {
      for (let i = 0; i < layout.length; i++) {
        const item = layout[i];
        if (item.moved) item.moved = false;
      }
    };

    const flushFrameUpdate = () => {
      frameUpdateRaf = null;
      const pending = frameUpdate;
      frameUpdate = null;
      if (!pending) return;

      if (pending.layout && pending.layout !== state.layout) {
        state.layout = markRaw(pending.layout);
      }

      if (pending.shouldCompact) {
        compactInPlace(state.layout, pending.compactType, pending.cols);
      }

      const activeItem = getLayoutItem(state.layout, pending.placeholder.i);
      state.activeDrag = markRaw(
        activeItem
          ? {
            ...pending.placeholder,
            w: activeItem.w,
            h: activeItem.h,
            x: activeItem.x,
            y: activeItem.y
          }
          : pending.placeholder
      );
    };

    const scheduleFrameUpdate = (pending: PendingFrameUpdate) => {
      frameUpdate = pending;
      if (!supportsRAF) {
        flushFrameUpdate();
        return;
      }
      if (frameUpdateRaf != null) return;
      frameUpdateRaf = requestAnimationFrame(flushFrameUpdate);
    };

    type AutoScrollOptions = {
      margin: number;
      speed: number;
    };

    const DEFAULT_AUTO_SCROLL_OPTIONS: AutoScrollOptions = {
      margin: 48,
      speed: 20
    };

    type ScrollContainer = HTMLElement | Window;

    let autoScrollOptions: AutoScrollOptions | null = null;
    let autoScrollContainer: ScrollContainer | null = null;
    let autoScrollRaf: number | null = null;
    let pendingAutoScroll:
      | { container: ScrollContainer; dx: number; dy: number }
      | null = null;

    const resolveAutoScrollOptions = (): AutoScrollOptions | null => {
      const config = props.autoScroll as unknown;
      if (!config) return null;
      if (config === true) return DEFAULT_AUTO_SCROLL_OPTIONS;
      if (typeof config !== "object") return null;

      const partial = config as Partial<AutoScrollOptions>;
      const margin =
        typeof partial.margin === "number" && Number.isFinite(partial.margin)
          ? partial.margin
          : DEFAULT_AUTO_SCROLL_OPTIONS.margin;
      const speed =
        typeof partial.speed === "number" && Number.isFinite(partial.speed)
          ? partial.speed
          : DEFAULT_AUTO_SCROLL_OPTIONS.speed;

      if (margin <= 0 || speed <= 0) return null;
      return { margin, speed };
    };

    const cancelAutoScroll = () => {
      if (autoScrollRaf != null && supportsRAF) {
        cancelAnimationFrame(autoScrollRaf);
      }
      autoScrollRaf = null;
      pendingAutoScroll = null;
    };

    const resetAutoScroll = () => {
      cancelAutoScroll();
      autoScrollContainer = null;
      autoScrollOptions = null;
    };

    const getClientPoint = (event: Event): { x: number; y: number } | null => {
      const anyEvent = event as unknown as {
        clientX?: number;
        clientY?: number;
        touches?: ArrayLike<{ clientX: number; clientY: number }>;
        changedTouches?: ArrayLike<{ clientX: number; clientY: number }>;
      };
      if (typeof anyEvent.clientX === "number" && typeof anyEvent.clientY === "number") {
        return { x: anyEvent.clientX, y: anyEvent.clientY };
      }
      const touch = anyEvent.touches?.[0] || anyEvent.changedTouches?.[0];
      return touch ? { x: touch.clientX, y: touch.clientY } : null;
    };

    const findScrollContainer = (startNode: HTMLElement): ScrollContainer => {
      const doc = startNode.ownerDocument;
      const win = doc?.defaultView;
      if (!win) return startNode;

      let current: HTMLElement | null = startNode;
      while (current) {
        const style = win.getComputedStyle(current);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const canScrollY =
          (overflowY === "auto" || overflowY === "scroll") &&
          current.scrollHeight > current.clientHeight + 1;
        const canScrollX =
          (overflowX === "auto" || overflowX === "scroll") &&
          current.scrollWidth > current.clientWidth + 1;
        if (canScrollY || canScrollX) return current;
        current = current.parentElement;
      }

      return win;
    };

    const initAutoScroll = (node: HTMLElement) => {
      autoScrollOptions = resolveAutoScrollOptions();
      autoScrollContainer = null;
      cancelAutoScroll();
      if (!autoScrollOptions) return;

      const grid = node.closest?.(`.${layoutClassName}`);
      const startNode = grid instanceof HTMLElement ? grid : node;
      autoScrollContainer = findScrollContainer(startNode);
    };

    const flushAutoScroll = () => {
      autoScrollRaf = null;
      const pending = pendingAutoScroll;
      pendingAutoScroll = null;
      if (!pending) return;

      const { container, dx, dy } = pending;
      if (dx === 0 && dy === 0) return;

      if (container instanceof HTMLElement) {
        if (typeof container.scrollBy === "function") {
          container.scrollBy({ left: dx, top: dy });
        } else {
          container.scrollLeft += dx;
          container.scrollTop += dy;
        }
      } else {
        container.scrollBy({ left: dx, top: dy });
      }
    };

    const scheduleAutoScroll = (container: ScrollContainer, dx: number, dy: number) => {
      pendingAutoScroll = { container, dx, dy };
      if (!supportsRAF) {
        flushAutoScroll();
        return;
      }
      if (autoScrollRaf != null) return;
      autoScrollRaf = requestAnimationFrame(flushAutoScroll);
    };

    const maybeAutoScroll = (event: Event, node: HTMLElement) => {
      if (!autoScrollOptions) autoScrollOptions = resolveAutoScrollOptions();
      const options = autoScrollOptions;
      if (!options) return;

      const point = getClientPoint(event);
      if (!point) return;

      if (!autoScrollContainer) {
        initAutoScroll(node);
      }
      const container = autoScrollContainer;
      if (!container) return;

      const computeDelta = (distanceIntoZone: number): number => {
        const ratio = Math.min(1, Math.max(0, distanceIntoZone / options.margin));
        return ratio <= 0 ? 0 : Math.ceil(ratio * options.speed);
      };

      let dx = 0;
      let dy = 0;

      if (container instanceof HTMLElement) {
        const rect = container.getBoundingClientRect();
        const topZone = rect.top + options.margin;
        const bottomZone = rect.bottom - options.margin;
        const leftZone = rect.left + options.margin;
        const rightZone = rect.right - options.margin;

        if (point.y < topZone) dy = -computeDelta(topZone - point.y);
        else if (point.y > bottomZone) dy = computeDelta(point.y - bottomZone);

        if (point.x < leftZone) dx = -computeDelta(leftZone - point.x);
        else if (point.x > rightZone) dx = computeDelta(point.x - rightZone);

        if (dy < 0 && container.scrollTop <= 0) dy = 0;
        if (
          dy > 0 &&
          container.scrollTop + container.clientHeight >= container.scrollHeight
        ) {
          dy = 0;
        }
        if (dx < 0 && container.scrollLeft <= 0) dx = 0;
        if (
          dx > 0 &&
          container.scrollLeft + container.clientWidth >= container.scrollWidth
        ) {
          dx = 0;
        }
      } else {
        const win = container;
        const topZone = options.margin;
        const bottomZone = win.innerHeight - options.margin;
        const leftZone = options.margin;
        const rightZone = win.innerWidth - options.margin;

        if (point.y < topZone) dy = -computeDelta(topZone - point.y);
        else if (point.y > bottomZone) dy = computeDelta(point.y - bottomZone);

        if (point.x < leftZone) dx = -computeDelta(leftZone - point.x);
        else if (point.x > rightZone) dx = computeDelta(point.x - rightZone);
      }

      if (dx === 0 && dy === 0) {
        cancelAutoScroll();
        return;
      }
      scheduleAutoScroll(container, dx, dy);
    };

    onBeforeUnmount(() => {
      cancelFrameUpdate();
      resetAutoScroll();
      interactionScheduler.cancel("component unmounted");
      layoutExecutor.dispose?.();
      interactionController.dispose();
      persistenceController?.stop();
    });

    // Handle the start of resizing an item
    const onResizeStart = (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
      cancelFrameUpdate();
      const { layout } = state;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      syncHistory(layout, 'replace');
      activeResizeId.value = i;
      resizeBlocked.value = false;
      initAutoScroll(node);
      state.oldResizeItem = cloneLayoutItem(l);
      state.oldLayout = cloneLayout(layout);
      state.resizing = true;
      if (!isLegacyLayoutEngine()) {
        resetInteractionController(layout);
        interactionController.start({
          id: nextInteractionRequestId("resize-start", i),
          type: "resize",
          itemId: i
        });
      }
      // emit('resizeStart', { layout, item: l, event: e });
      // vAttrs.onResizeStart?.(layout, l, e, node);
      vAttrs.onResizeStart?.(layout, l, l, undefined, e, node);
    };

    // Handle the resizing of an item
    const onResize = (i: string, w: number, h: number, { e, node, handle }: GridResizeEvent) => {
      const { oldResizeItem } = state;
      const { cols, preventCollision, allowOverlap } = props;
      if (!isLegacyLayoutEngine()) {
        const layout = state.layout;
        const l = getLayoutItem(layout, i);
        if (!l) return;
        maybeAutoScroll(e, node);
        runEnginePreview(
          nextInteractionRequestId("resize", i),
          { type: "resize", id: i, w, h, handle: handle as ResizeHandleAxis },
          result => {
            if (result.status === "stale") return;
            const nextLayout = result.status === "changed" || result.status === "fallback"
              ? result.layout
              : interactionController.getCommitted();
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
            vAttrs.onResize?.(nextLayout, oldResizeItem, nextItem, placeholder, e, node);
            if (result.status === "changed" || result.status === "fallback") {
              state.layout = markRaw(nextLayout);
            }
            state.activeDrag = markRaw(placeholder);
          },
          state.layout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
        );
        return;
      }
      const isLargeLayout = state.layout.length >= LARGE_LAYOUT_THRESHOLD;
      maybeAutoScroll(e, node);

      if (!isLargeLayout) {
        const { layout } = state;
        let shouldMoveItem = false;
        let finalLayout;
        let x, y;
        let hasCollisions = false;

        // Update the layout with the new dimensions
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

          // Check for collisions if collision prevention is enabled
          if (preventCollision && !allowOverlap) {
            const collisions = getAllCollisions(layout, { ...l, w, h, x, y });
            hasCollisions = collisions.length > 0;

            // Reset dimensions if there are collisions
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
          // Move the element to the new position
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

        // Create placeholder element
        const placeholder = {
          w: l.w,
          h: l.h,
          x: l.x,
          y: l.y,
          static: true,
          i: i
        };
        vAttrs.onResize?.(finalLayout, oldResizeItem, l, placeholder, e, node);
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
        // Move the element to the new position
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

      // Create placeholder element
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        static: true,
        i: i
      };

      vAttrs.onResize?.(finalLayout, oldResizeItem, l, placeholder, e, node);

      const didResize =
        l.x !== prevX ||
        l.y !== prevY ||
        l.w !== prevW ||
        l.h !== prevH ||
        (allowOverlap && finalLayout !== state.layout);

      if (!didResize) return;

      if (!allowOverlap) {
        resetMovedFlags(layout);
      }

      scheduleFrameUpdate({
        cols,
        compactType: compactType(props),
        layout: allowOverlap && finalLayout !== state.layout ? finalLayout : undefined,
        placeholder,
        shouldCompact: !allowOverlap
      });
    };

    // Handle the end of resizing an item
    const onResizeStop = (i: string, w: number, h: number, { e, node, handle }: GridResizeEvent) => {
      cancelFrameUpdate();
      const { layout, oldResizeItem, oldLayout } = state;
      const { cols, allowOverlap } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      if (!isLegacyLayoutEngine()) {
        runEngineCommit(
          nextInteractionRequestId("resize-stop", i),
          { type: "resize", id: i, w, h, handle: handle as ResizeHandleAxis },
          result => {
            if (result.status === "stale") return;
            const newLayout = result.status === "changed" || result.status === "fallback"
              ? result.layout
              : interactionController.getCommitted();
            const nextItem = getLayoutItem(newLayout, i) || l;
            vAttrs.onResizeStop?.(newLayout, oldResizeItem, nextItem, undefined, e, node);

            state.activeDrag = null;
            state.layout = markRaw(newLayout);
            state.oldResizeItem = null;
            state.resizing = false;
            activeResizeId.value = null;
            resizeBlocked.value = false;
            resetAutoScroll();
            if (newLayout === layout) {
              state.oldLayout = null;
              onLayoutMaybeChanged(newLayout, oldLayout || layout, 'push');
            }
          },
          state.layout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
        );
        return;
      }

      const newLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
      vAttrs.onResizeStop?.(newLayout, oldResizeItem, l, undefined, e, node);

      state.activeDrag = null;
      state.layout = markRaw(newLayout);
      state.oldResizeItem = null;
      state.resizing = false;
      activeResizeId.value = null;
      resizeBlocked.value = false;
      resetAutoScroll();

      // If allowOverlap is enabled, the layout reference may not change, so the layout watcher won't fire.
      if (newLayout === layout) {
        state.oldLayout = null;
        onLayoutMaybeChanged(newLayout, oldLayout || layout, 'push');
      }
    };

    // Set the component to mounted state
    onMounted(() => {
      state.mounted = true;
      if (!persistenceController) return;
      restoringPersistence = true;
      void persistenceController.load().then(async result => {
        const restoredLayout = result.value && (result.ok || result.fallbackApplied)
          ? cloneLayout(result.value)
          : null;
        if (restoredLayout) {
          applyPersistedLayout(restoredLayout);
        }
        await nextTick();
        restoringPersistence = false;
      }).catch(async () => {
        await nextTick();
        restoringPersistence = false;
      });
    });

    // Create a placeholder element
    const placeholder = (): VNode | null => {
      const { activeDrag } = state;
      if (!activeDrag) return null;
      const { width = 0, cols, margin, containerPadding, rowHeight, maxRows, useCSSTransforms, transformScale } = props;

      return (
        <GridItem
          w={activeDrag.w}
          h={activeDrag.h}
          x={activeDrag.x}
          y={activeDrag.y}
          i={activeDrag.i}
          class={`vue-grid-placeholder ${state.resizing ? "placeholder-resizing" : ""}`}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding || margin}
          maxRows={maxRows}
          rowHeight={rowHeight}
          isDraggable={false}
          isResizable={false}
          isBounded={false}
          useCSSTransforms={useCSSTransforms}
          transformScale={transformScale}
        >
          <div />
        </GridItem>
      );
    };

    // Handle dragging of an item
    const onDrag = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      const { oldDragItem } = state;
      let { layout } = state;
      const { cols, allowOverlap, preventCollision } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      maybeAutoScroll(e, node);

      if (!isLegacyLayoutEngine()) {
        runEnginePreview(
          nextInteractionRequestId("drag", i),
          { type: "move", id: i, x, y, userAction: true },
          result => {
            if (result.status === "stale") return;
            const nextLayout = result.status === "changed" || result.status === "fallback"
              ? result.layout
              : interactionController.getCommitted();
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
            vAttrs.onDrag?.(nextLayout, oldDragItem, nextItem, placeholder, e, node);
            if (result.status === "changed" || result.status === "fallback") {
              state.layout = markRaw(nextLayout);
            }
            state.activeDrag = markRaw(placeholder);
          },
          state.layout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
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

      // Move the element to the dragged location
      const isUserAction = true;
      layout = moveElement(
        layout,
        l,
        compactType(props),
        cols,
        allowOverlap,
        x,
        y,
        isUserAction,
        preventCollision
      );

      // Create placeholder (display only) - use the updated position so it never lags behind
      const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };

      // props.dragFn(layout, oldDragItem, l, placeholder, e, node);
      // emit('drag', { layout, oldItem: oldDragItem, item: l, placeholder, event: e });
      vAttrs.onDrag?.(layout, oldDragItem, l, placeholder, e, node);

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
        return;
      }

      if (!allowOverlap) {
        resetMovedFlags(state.layout);
      }

      scheduleFrameUpdate({
        cols,
        compactType: compactType(props),
        layout: allowOverlap && layout !== state.layout ? layout : undefined,
        placeholder,
        shouldCompact: !allowOverlap
      });
    };

    // Handle drop event
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
        interactionController.start({
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
            vAttrs.onDrop?.(
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

      if (!item && dropStrategy === 'auto') {
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

      // Clean up placeholder-only properties before passing to user callback
      let cleanItem: LayoutItem | undefined;
      if (item) {
        cleanItem = { ...item };
        delete cleanItem.isDraggable;
        delete cleanItem.isResizable;
      }

      // Reset dragEnter counter on drop
      dragEnterCounter.value = 0;
      vAttrs.onDrop?.(layout.filter(l => l.i !== droppingItem.i), e, cleanItem);
      removeDroppingPlaceholder();

    };

    // Remove the dropping placeholder
    const removeDroppingPlaceholder = () => {
      cancelFrameUpdate();
      const { droppingItem, cols } = props;
      const { layout } = state;
      const newLayout = compact(layout.filter(l => l.i !== droppingItem.i), compactType(props), cols, props.allowOverlap);

      state.layout = markRaw(newLayout);
      state.droppingDOMNode = null;
      state.activeDrag = null;
      state.droppingPosition = undefined;
    };

    // Calculate container height based on the layout
    const containerHeight = (): string | null => {
      const { containerPadding, rowHeight, margin, autoSize } = props;
      if (!autoSize) return null;
      const nbRow = bottom(state.layout);
      const containerPaddingY = containerPadding ? containerPadding[1] : margin[1];
      const heightPx =
        nbRow === 0
          ? containerPaddingY * 2
          : nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2;
      return `${Math.max(0, heightPx)}px`;
    };

    // Handle the start of dragging an item
    const onDragStart = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      cancelFrameUpdate();
      const { layout } = state;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      // Create placeholder (display only)
      const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };
      syncHistory(layout, 'replace');
      activeDragId.value = i;
      dragBlocked.value = false;
      initAutoScroll(node);
      state.oldDragItem = cloneLayoutItem(l);
      state.oldLayout = cloneLayout(layout);
      state.activeDrag = markRaw(placeholder);
      if (!isLegacyLayoutEngine()) {
        resetInteractionController(layout);
        interactionController.start({
          id: nextInteractionRequestId("drag-start", i),
          type: "drag",
          itemId: i
        });
      }

      return vAttrs.onDragStart?.(layout, l, l, undefined, e, node);
    };

    // Handle the end of dragging an item
    const onDragStop = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      cancelFrameUpdate();
      if (!state.activeDrag) return;

      const { oldDragItem, oldLayout } = state;
      const prevLayout = state.layout;
      let layout = prevLayout;
      const { cols, preventCollision, allowOverlap } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      if (!isLegacyLayoutEngine()) {
        runEngineCommit(
          nextInteractionRequestId("drag-stop", i),
          { type: "move", id: i, x, y, userAction: true },
          result => {
            if (result.status === "stale") return;
            const newLayout = result.status === "changed" || result.status === "fallback"
              ? result.layout
              : interactionController.getCommitted();
            const nextItem = getLayoutItem(newLayout, i) || l;
            vAttrs.onDragStop?.(newLayout, oldDragItem, nextItem, undefined, e, node);

            state.activeDrag = null;
            state.layout = markRaw(newLayout);
            state.oldDragItem = null;
            activeDragId.value = null;
            dragBlocked.value = false;
            resetAutoScroll();
            if (newLayout === prevLayout) {
              state.oldLayout = null;
              onLayoutMaybeChanged(newLayout, oldLayout || prevLayout, 'push');
            }
          },
          state.layout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
        );
        return;
      }

      // Move the element to the new position
      const isUserAction = true;
      layout = moveElement(
        layout,
        l,
        compactType(props),
        cols,
        allowOverlap,
        x,
        y,
        isUserAction,
        preventCollision
      );

      const newLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
      // props.dragStopFn(newLayout, oldDragItem, l, undefined, e, node);
      vAttrs.onDragStop?.(newLayout, oldDragItem, l, undefined, e, node);
      // emit('dragStop', { layout: newLayout, oldItem: oldDragItem, item: l, event: e });

      state.activeDrag = null;
      state.layout = markRaw(newLayout);
      state.oldDragItem = null;
      activeDragId.value = null;
      dragBlocked.value = false;
      resetAutoScroll();

      // If allowOverlap is enabled and there were no collisions, the layout reference may not change.
      if (newLayout === prevLayout) {
        state.oldLayout = null;
        onLayoutMaybeChanged(newLayout, oldLayout || prevLayout, 'push');
      }
    };

    // Handle drag enter event
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounter.value++;
    };

    // Handle drag leave event
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounter.value = Math.max(0, dragEnterCounter.value - 1);

      // Remove the placeholder when the drag leave events are balanced
      if (dragEnterCounter.value === 0) {
        removeDroppingPlaceholder();
      }
    };

    // Handle drag over event
    const onDragOver = (e: DragEvent): void | false => {
      e.preventDefault();
      e.stopPropagation();

      if (isFirefox && !(e.currentTarget as Element | null)?.classList?.contains(layoutClassName)) {
        return false;
      }

      const { droppingItem, margin, cols, rowHeight, maxRows, width, containerPadding, transformScale, dropStrategy } = props;
      const onDragOverResult = vAttrs.onDropDragOver?.(e);
      if (onDragOverResult === false) {
        if (state.droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const finalDroppingItem = { ...droppingItem, ...(onDragOverResult || {}) };
      const { layout } = state;

      if (dropStrategy === 'auto') {
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
          resetInteractionController(baseLayout);
          interactionController.start({
            id: nextInteractionRequestId("drop-start", String(finalDroppingItem.i)),
            type: "drop",
            itemId: String(finalDroppingItem.i)
          });
          runEnginePreview(
            nextInteractionRequestId("drop-fit", String(finalDroppingItem.i)),
            {
              type: "dropFit",
              item: {
                i: String(finalDroppingItem.i),
                w: finalDroppingItem.w,
                h: finalDroppingItem.h
              },
              strategy: "cursor",
              target: cursorGridPos
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
                state.droppingDOMNode = markRaw(h('div', { key: finalDroppingItem.i }));
              }
              state.droppingPosition = undefined;
              state.layout = markRaw(result.layout);
              state.activeDrag = result.placeholder ? markRaw(result.placeholder) : null;
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
          state.droppingDOMNode = markRaw(h('div', { key: finalDroppingItem.i }));
        }

        state.droppingPosition = undefined;
        const droppingItemId = String(finalDroppingItem.i);
        const existingDroppingItem = getLayoutItem(layout, droppingItemId);

        if (!existingDroppingItem) {
          state.layout = markRaw([
            ...baseLayout,
            {
              ...finalDroppingItem,
              x: fit.x,
              y: fit.y,
              static: false,
              isDraggable: false,
              isResizable: false
            }
          ]);
          return;
        }

        const [nextLayout] = withLayoutItem(layout, droppingItemId, current => ({
          ...current,
          ...finalDroppingItem,
          x: fit.x,
          y: fit.y,
          static: false,
          isDraggable: false,
          isResizable: false
        }));
        state.layout = markRaw(nextLayout);
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
        state.droppingDOMNode = markRaw(h('div', { key: finalDroppingItem.i }));
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

    const layoutItemById = new Map<string, LayoutItem>();

    // Process each grid item child
    const processGridItem = (
      child: VNode,
      layoutItemById: Map<string, LayoutItem>,
      isDroppingItem?: boolean
    ): VNode | null => {
      if (!child || !child.key) return null;
      const l = layoutItemById.get(String(child.key));
      if (!l) return null;

      const {
        width = 0,
        cols,
        margin,
        containerPadding,
        rowHeight,
        maxRows,
        isDraggable,
        isResizable,
        isBounded,
        useCSSTransforms,
        transformScale,
        draggableCancel,
        draggableHandle,
        resizeHandles,
        resizeHandle
      } = props;

      const { mounted, droppingPosition } = state;

      const draggable = typeof l.isDraggable === "boolean" ? l.isDraggable : !l.static && isDraggable;
      const resizable = typeof l.isResizable === "boolean" ? l.isResizable : !l.static && isResizable;
      const resizeHandlesOptions = l.resizeHandles || resizeHandles;
      const bounded = draggable && isBounded && l.isBounded !== false;
      return (
        <GridItem
          key={l.i}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding || margin}
          maxRows={maxRows}
          rowHeight={rowHeight}
          cancel={draggableCancel}
          handle={draggableHandle}
          onDragStop={onDragStop}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeStop={onResizeStop}
          isDraggable={draggable}
          isResizable={resizable}
          isBounded={bounded}
          isDragBlocked={dragBlocked.value && activeDragId.value === l.i}
          isResizeBlocked={resizeBlocked.value && activeResizeId.value === l.i}
          useCSSTransforms={useCSSTransforms && mounted}
          usePercentages={!mounted}
          transformScale={transformScale}
          w={l.w}
          h={l.h}
          x={l.x}
          y={l.y}
          i={l.i}
          minH={l.minH}
          minW={l.minW}
          maxH={l.maxH}
          maxW={l.maxW}
          static={l.static}
          droppingPosition={isDroppingItem && props.dropStrategy !== 'auto' ? droppingPosition : undefined}
          resizeHandles={resizeHandlesOptions}
          resizeHandle={resizeHandle}
        >
          {child}
        </GridItem>
      );
    };

    return () => {
      const { class: className, style, isDroppable, innerRef } = props;
      const mergedClassName = clsx(layoutClassName, className);
      const mergedStyle: Kv = {
        height: containerHeight(),
        ...style
      };

      const children: VNode[] = slots.default ? getNonFragmentChildren(h(Fragment, null, slots.default())) : [];
      layoutItemById.clear();
      for (let i = 0; i < state.layout.length; i++) {
        const item = state.layout[i];
        layoutItemById.set(item.i, item);
      }

      return (
        <div
          ref={innerRef}
          class={mergedClassName}
          style={mergedStyle}
          onDrop={isDroppable ? onDrop : noop}
          onDragleave={isDroppable ? onDragLeave : noop}
          onDragenter={isDroppable ? onDragEnter : noop}
          onDragover={isDroppable ? onDragOver : noop}
        >
          {children.map(child => processGridItem(child, layoutItemById))}
          {isDroppable &&
            state.droppingDOMNode &&
            processGridItem(state.droppingDOMNode, layoutItemById, true)}
          {placeholder()}
        </div>
      );
    };
  }
});

export default VueGridLayout;
