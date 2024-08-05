import { defineComponent, VNode, reactive, ref, onMounted, h, Fragment, watch } from 'vue'
import { deepEqual } from "fast-equals";
import { pick } from 'lodash'
import clsx from "clsx";
import {
  bottom,
  cloneLayoutItem,
  compact,
  compactType,
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
import type {
  CompactType,
  GridResizeEvent,
  GridDragEvent,
  Layout,
  DroppingPosition,
  LayoutItem,
  EventCallback
} from "./utils";
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
let isFirefox = false;

// Check if the user agent is Firefox
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch (e) {
  /* Ignore */
}

const componentName = 'VueGridLayout';

const VueGridLayout = defineComponent({
  name: componentName,
  inheritAttrs: false,
  props: {
    ...gridLayoutProps
  },
  emits: ['update:modelValue', 'layoutChange'],
  setup(props, { slots, attrs, emit }) {
    const vAttrs = attrs as AttrsEvents
    const children: VNode[] = slots.default ? getNonFragmentChildren({ type: Fragment, children: slots.default() } as VNode) : [];
    const dragEnterCounter = ref(0);
  

    // Reactive state object
    const state: State = reactive({
      activeDrag: null,
      layout: synchronizeLayoutWithChildren(
        props.modelValue,
        children,
        props.cols,
        compactType(pick(props, ['verticalCompact', 'compactType'])),
        props.allowOverlap,
        layout => {
          emit('update:modelValue', layout)
          emit('layoutChange', layout)
        }
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

    // Check if the layout has changed
    const onLayoutMaybeChanged = (newLayout: Layout, oldLayout?: Layout | null) => {
      if (!oldLayout) oldLayout = state.layout;
      if (!deepEqual(oldLayout, newLayout)) {
        emit('layoutChange', newLayout);
        emit('update:modelValue', newLayout)
      }
    };

    /**
     * After the component updates, if there is no active drag operation,
     * check if the layout has changed and handle the changes accordingly.
     */
    watch(() => pick(state, ['layout', 'activeDrag']), (nextState, prevState) => {
      if (!nextState.activeDrag) {
        const newLayout = nextState.layout;
        const oldLayout = prevState.layout;
  
        onLayoutMaybeChanged(newLayout, oldLayout);
      }
    }, { deep: true })

    watch(
      () => {
        const defaultSlot = slots.default ? slots.default() : [];
        return {
          children: [defaultSlot],
          props: pick(props, ['compactType', 'modelValue', 'verticalCompact', 'cols', 'allowOverlap'])
        };
      },
      ({ children: [newChildren], props: nextProps }, { children: [oldChildren], props: prevProps }) => {
        const oldNonFragmentChildren = getNonFragmentChildren({ type: Fragment, children: oldChildren } as VNode);
        const newNonFragmentChildren = getNonFragmentChildren({ type: Fragment, children: newChildren } as VNode);
    
        if (childrenEqual(newNonFragmentChildren, oldNonFragmentChildren) &&
            deepEqual(nextProps.modelValue, state.layout) &&
            nextProps.compactType === prevProps.compactType) {
          return false;
        }
    
        const layout = synchronizeLayoutWithChildren(
          nextProps.modelValue,
          newNonFragmentChildren,
          nextProps.cols,
          compactType(pick(nextProps, ['verticalCompact', 'compactType'])),
          nextProps.allowOverlap
        );
    
        onLayoutMaybeChanged(layout, state.layout);
        state.layout = layout;
        state.compactType = nextProps.compactType;
      },
      { deep: true }
    );

    // Handle the start of resizing an item
    const onResizeStart = (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
      const { layout } = state;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      state.oldResizeItem = cloneLayoutItem(l);
      state.oldLayout = layout;
      state.resizing = true;
      // emit('resizeStart', { layout, item: l, event: e });
      // vAttrs.onResizeStart?.(layout, l, e, node);
      vAttrs.onResizeStart?.(layout, l, l, undefined, e, node);
    };

    // Handle the resizing of an item
    const onResize = (i: string, w: number, h: number, { e, node, handle }: GridResizeEvent) => {
      const { oldResizeItem, layout } = state;
      const { cols, preventCollision, allowOverlap } = props;
      let shouldMoveItem = false;
      let finalLayout;
      let x, y;

      // Update the layout with the new dimensions
      const [newLayout, l] = withLayoutItem(layout, i, l => {
        let hasCollisions;
        x = l.x;
        y = l.y;

        if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
          if (["sw", "nw", "w"].includes(handle)) {
            x = l.x + (l.w - w);
            w = l.x !== x && x < 0 ? l.w : w;
            x = x < 0 ? 0 : x;
          }
          if (["ne", "n", "nw"].includes(handle)) {
            y = l.y + (l.h - h);
            h = l.y !== y && y < 0 ? l.h : h;
            y = y < 0 ? 0 : y;
          }
          shouldMoveItem = true;
        }

        // Check for collisions if collision prevention is enabled
        if (preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(layout, { ...l, w, h, x, y }).filter(item => item.i !== l.i);
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
      state.layout = allowOverlap ? finalLayout : compact(finalLayout, compactType(props), cols);
      state.activeDrag = placeholder;
    };

    // Handle the end of resizing an item
    const onResizeStop = (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
      const { layout, oldResizeItem, oldLayout } = state;
      const { cols, allowOverlap } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      const newLayout = allowOverlap ? layout : compact(layout, compactType(props), cols);
      vAttrs.onResizeStop?.(newLayout, oldResizeItem, l, undefined, e, node);

      state.activeDrag = null;
      state.layout = newLayout;
      state.oldResizeItem = null;
      state.oldLayout = null;
      state.resizing = false;

      onLayoutMaybeChanged(newLayout, oldLayout);
    };

    // Set the component to mounted state
    onMounted(() => {
      state.mounted = true;
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

      // Create placeholder (display only)
      const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };

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

      // props.dragFn(layout, oldDragItem, l, placeholder, e, node);
      // emit('drag', { layout, oldItem: oldDragItem, item: l, placeholder, event: e });
      vAttrs.onDrag?.(layout, oldDragItem, l, placeholder, e, node);
      state.layout = allowOverlap ? layout : compact(layout, compactType(props), cols);
      state.activeDrag = placeholder;
    };

    // Handle drop event
    const onDrop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const { droppingItem } = props;
      const { layout } = state;
      const item = layout.find(l => l.i === droppingItem.i);

      // Reset dragEnter counter on drop
      dragEnterCounter.value = 0;
      vAttrs.onDrop?.(layout.filter(l => l.i !== droppingItem.i), e, item);
      removeDroppingPlaceholder();
      
    };

    // Remove the dropping placeholder
    const removeDroppingPlaceholder = () => {
      const { droppingItem, cols } = props;
      const { layout } = state;
      const newLayout = compact(layout.filter(l => l.i !== droppingItem.i), compactType(props), cols, props.allowOverlap);

      state.layout = newLayout;
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
      return `${nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2}px`;
    };

    // Handle the start of dragging an item
    const onDragStart = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      const { layout } = state;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      // Create placeholder (display only)
      const placeholder = { w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i };
      state.oldDragItem = cloneLayoutItem(l);
      state.oldLayout = layout;
      state.activeDrag = placeholder;

      return vAttrs.onDragStart?.(layout, l, l, undefined, e, node);
    };

    // Handle the end of dragging an item
    const onDragStop = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      if (!state.activeDrag) return;

      const { oldDragItem, oldLayout } = state;
      let layout = state.layout;
      const { cols, preventCollision, allowOverlap } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;

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
      state.layout = newLayout;
      state.oldDragItem = null;
      state.oldLayout = null;

      onLayoutMaybeChanged(newLayout, oldLayout);
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
      dragEnterCounter.value--;

      // Remove the placeholder when the drag leave events are balanced
      if (dragEnterCounter.value === 0) {
        removeDroppingPlaceholder();
      }
    };

    // Handle drag over event
    const onDragOver = (e: DragEvent): void | false => {
      e.preventDefault();
      e.stopPropagation();

      if (isFirefox && !(e.target as Element)?.classList.contains(layoutClassName)) {
        return false;
      }

      const { droppingItem, margin, cols, rowHeight, maxRows, width, containerPadding, transformScale } = props;
      const onDragOverResult = vAttrs.onDropDragOver?.(e);
      if (onDragOverResult === false) {
        if (state.droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const finalDroppingItem = { ...droppingItem, ...onDragOverResult };
      const { layout } = state;
      const gridRect = e.currentTarget instanceof Element ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 };
      const layerX = e.clientX - gridRect.left;
      const layerY = e.clientY - gridRect.top;
      const droppingPosition = { left: layerX / transformScale, top: layerY / transformScale, e };

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
        state.droppingDOMNode = h('div', { key: finalDroppingItem.i });
        state.droppingPosition = droppingPosition;
        state.layout = [...layout, { ...finalDroppingItem, x: calculatedPosition.x, y: calculatedPosition.y, static: false, isDraggable: true }];
      } else if (state.droppingPosition) {
        const { left, top } = state.droppingPosition;
        const shouldUpdatePosition = left != layerX || top != layerY;
        if (shouldUpdatePosition) {
          state.droppingPosition = droppingPosition;
        }
      }
    };

    // Process each grid item child
    const processGridItem = (child: VNode, isDroppingItem?: boolean): VNode | null => {
      if (!child || !child.key) return null;
      const l = getLayoutItem(state.layout, String(child.key));
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
          droppingPosition={isDroppingItem ? droppingPosition : undefined}
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
      
      const children: VNode[] = slots.default ? getNonFragmentChildren({ type: Fragment, children: slots.default() } as VNode) : [];

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
          {children.map(child => processGridItem(child))}
          {isDroppable && state.droppingDOMNode && processGridItem(state.droppingDOMNode, true)}
          {placeholder()}
        </div>
      );
    };
  }
});

export default VueGridLayout;
