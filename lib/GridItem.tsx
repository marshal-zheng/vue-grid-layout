import { defineComponent, VNode, reactive, ref, Ref, CSSProperties, PropType, onMounted, h, watch } from 'vue'
import { DraggableCore } from "@marsio/vue-draggable";
import { Resizable } from "@marsio/vue-resizable";
import { pick } from 'lodash'
import clsx from "clsx";
import {
  perc,
  resizeItemInDirection,
  setTopLeft,
  setTransform,
} from "./utils";
import {
  calcGridItemPosition,
  calcGridItemWHPx,
  calcGridColWidth,
  calcXY,
  calcWH,
  clamp
} from "./calculateUtils";
import {
  resizeHandleAxesType,
  resizeHandleType,
  ResizeHandle
} from "./VueGridLayoutPropTypes";
import { Kv } from './type'

import type {
  VueDraggableCallbackData,
  GridDragEvent,
  GridResizeEvent,
  DroppingPosition,
  Position,
  ResizeHandleAxis
} from "./utils";

import { PositionParams } from "./calculateUtils";

export interface AttrsEvents {
  onDrag?: GridItemCallback<GridDragEvent>,
  onDragStart?: GridItemCallback<GridDragEvent>,
  onDragStop?: GridItemCallback<GridDragEvent>,
  onResize?: GridItemCallback<GridResizeEvent>,
  onResizeStart?: GridItemCallback<GridResizeEvent>,
  onResizeStop?: GridItemCallback<GridResizeEvent>
}

type PartialPosition = { top: number, left: number };
type GridItemCallback<Data extends GridDragEvent | GridResizeEvent> = (
  i: string,
  w: number,
  h: number,
  data: Data
) => void;

type ResizeCallbackData = {
  node: HTMLElement,
  size: Position,
  handle: ResizeHandleAxis
};

type GridItemResizeCallback = (
  e: Event,
  data: ResizeCallbackData,
  position: Position
) => void;

type State = {
  resizing?: { top: number, left: number, width: number, height: number } | null,
  dragging?: { top: number, left: number } | null,
  className: string
};

type Props = {
  cols: number,
  containerWidth: number,
  margin: [number, number],
  containerPadding: [number, number],
  rowHeight: number,
  maxRows: number,
  isDraggable: boolean,
  isResizable: boolean,
  isBounded: boolean,
  static?: boolean,
  useCSSTransforms?: boolean,
  usePercentages?: boolean,
  transformScale: number,
  droppingPosition?: DroppingPosition,

  className: string,
  style?: Kv,
  cancel: string,
  handle: string,

  x: number,
  y: number,
  w: number,
  h: number,

  minW: number,
  maxW: number,
  minH: number,
  maxH: number,
  i: string,

  resizeHandles?: ResizeHandleAxis[],
  resizeHandle?: ResizeHandle,
};

const componentName = 'GridItem'
/**
 * An individual item within a VueGridLayout.
 */
const GridItem = defineComponent({
  name: componentName,
  inheritAttrs: false,
  props: {
    cols: {type: Number, required: true },
    containerWidth: { type: Number, required: true },
    rowHeight: { type: Number, required: true },
    margin: { type: Array as PropType<number[]>, required: true },
    maxRows: { type: Number, required: true },
    containerPadding: { type: Array as PropType<number[]>, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    minW: { type: Number, default: 1 }, // Custom validation can be added in `mounted` or a method
    maxW: { type: Number, default: Infinity }, // Custom validation can be added in `mounted` or a method
    minH: { type: Number, default: 1 }, // Custom validation can be added in `mounted` or a method
    maxH: { type: Number, default: Infinity }, // Custom validation can be added in `mounted` or a method
    i: { type: String, required: true },
    resizeHandles: resizeHandleAxesType, // Define more specific type if necessary
    resizeHandle: resizeHandleType, // Define more specific type if necessary
    isDraggable: { type: Boolean, required: true },
    isResizable: { type: Boolean, required: true },
    isBounded: { type: Boolean, required: true },
    static: Boolean,
    useCSSTransforms: { type: Boolean, required: true },
    transformScale: { type: Number, default: 1 },
    class: { type: String, default: '' },
    handle: { type: String, default: '' },
    cancel: { type: String, default: '' },
    droppingPosition: { type: Object as PropType<DroppingPosition> },
    usePercentages: { type: Boolean },
    style: { type: Object as PropType<CSSProperties>, default: () => ({}) },
  },

  setup(props, { slots, attrs }) {
    const vAttrs = attrs as AttrsEvents
    const state: State = reactive({
      resizing: null,
      dragging: null,
      className: ''
    });
    const elementRef: Ref<HTMLDivElement | null> = ref(null);

    const getPositionParams = (params = props): PositionParams => {
      return {
        cols: params.cols,
        containerPadding: params.containerPadding,
        containerWidth: params.containerWidth,
        margin: params.margin,
        maxRows: params.maxRows,
        rowHeight: params.rowHeight
      };
    }

    /**
     * onDragStart event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node, delta and position information
     */
    const onDragStart = (e: Event, { node }: VueDraggableCallbackData) => {
      const { transformScale } = props;
      const { onDragStart: dragStart} = vAttrs
      if (!dragStart) return;

      const newPosition: PartialPosition = { top: 0, left: 0 };

      // TODO: this wont work on nested parents
      const { offsetParent } = node;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();
      const cLeft = clientRect.left / transformScale;
      const pLeft = parentRect.left / transformScale;
      const cTop = clientRect.top / transformScale;
      const pTop = parentRect.top / transformScale;
      newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
      newPosition.top = cTop - pTop + offsetParent.scrollTop;
      state.dragging = newPosition

      // Call callback with this data
      const { x, y } = calcXY(
        getPositionParams(),
        newPosition.top,
        newPosition.left,
        props.w,
        props.h
      );


      dragStart(props.i, x, y, {
        e,
        node,
        newPosition
      });
    };

    /**
     * onDrag event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node, delta and position information
     */
    const onDrag = (
      e: Event,
      { node, deltaX, deltaY }: VueDraggableCallbackData
    ) => {
      const { onDrag } = vAttrs;
      if (!onDrag) return;

      if (!state.dragging) {
        throw new Error("onDrag called before onDragStart.");
      }
      let top = state.dragging.top + deltaY;
      let left = state.dragging.left + deltaX;

      const { isBounded, w, h, containerWidth } = props;
      const positionParams = getPositionParams();

      // Boundary calculations; keeps items within the grid
      if (isBounded) {
        const { offsetParent } = node;

        if (offsetParent) {
          // const { margin, rowHeight, containerPadding } = props;
          const { margin, rowHeight } = props
          const bottomBoundary = offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1]);
          top = clamp(top, 0, bottomBoundary)

          const colWidth = calcGridColWidth(positionParams);
          const rightBoundary =
            containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
          left = clamp(left, 0, rightBoundary);
        }
      }

      const newPosition: PartialPosition = { top, left };
      state.dragging = newPosition;

      // Call callback with this data
      const { x, y } = calcXY(positionParams, top, left, w, h);
      onDrag(props.i, x, y, {
        e,
        node,
        newPosition
      });
    };

    /**
     * onDragStop event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node, delta and position information
     */
    const onDragStop = (e: Event, { node }: VueDraggableCallbackData) => {
      const { onDragStop: dragStop } = vAttrs
      if (!dragStop) return;

      if (!state.dragging) {
        throw new Error("onDragEnd called before onDragStart.");
      }
      const { w, h } = props;
      const { left, top } = state.dragging;
      const newPosition: PartialPosition = { top, left };
      state.dragging = null

      const { x, y } = calcXY(getPositionParams(), top, left, w, h);

      dragStop(props.i, x, y, {
        e,
        node,
        newPosition
      });
    };

    /**
     * Wrapper around resize events to provide more useful data.
     */
    const onResizeHandler = (
      e: Event,
      { node, size, handle }: ResizeCallbackData, // 'size' is updated position
      position: Position, // existing position
      handlerName: string
    ): void => {
      const handler = vAttrs[handlerName];
      if (!handler) return;
      const { x, y, i, maxH, minH, maxW, minW, containerWidth } = props;

      // Clamping of dimensions based on resize direction
      let updatedSize = size;
      if (node) {
        updatedSize = resizeItemInDirection(
          handle,
          position,
          size,
          containerWidth
        );
        state.resizing = handlerName === "onResizeStop" ? null : updatedSize
      }

      // Get new XY based on pixel size
      let { w, h } = calcWH(
        getPositionParams(),
        updatedSize.width,
        updatedSize.height,
        x,
        y,
        handle
      );

      // Min/max capping.
      // minW should be at least 1 (TODO propTypes validation?)
      w = clamp(w, Math.max(minW, 1), maxW);
      h = clamp(h, minH, maxH);

      handler.call(this, i, w, h, { e, node, size: updatedSize, handle });
    }

    const onResizeStop: GridItemResizeCallback = (e, callbackData, position) =>
      onResizeHandler(e, callbackData, position, "onResizeStop");

    const   onResizeStart: GridItemResizeCallback = (e, callbackData, position) =>
      onResizeHandler(e, callbackData, position, "onResizeStart");

    const onResize: GridItemResizeCallback = (e, callbackData, position) =>
      onResizeHandler(e, callbackData, position, "onResize");

    const createStyle = (pos: Position): { [key: string]: string } => {
      const { usePercentages, containerWidth, useCSSTransforms } = props;

      let style;
      // CSS Transforms support (default)
      if (useCSSTransforms) {
        style = setTransform(pos);
      } else {
        // top,left (slow)
        style = setTopLeft(pos);
  
        // This is used for server rendering.
        if (usePercentages) {
          style.left = perc(pos.left / containerWidth);
          style.width = perc(pos.width / containerWidth);
        }
      }
  
      return style;
    }

    const mixinDraggable = (
      child: VNode,
      isDraggable: boolean,
      wrapperProps
    ): VNode => {
      return (
        <DraggableCore
          disabled={!isDraggable}
          startFn={onDragStart}
          dragFn={onDrag}
          stopFn={onDragStop}
          handle={props.handle}
          cancel={`.vue-resizable-handle${props.cancel ? `,${props.cancel}` : ''}`}
          scale={props.transformScale}
          nodeRef={elementRef}
        >
          <div ref={elementRef} {...wrapperProps}>{child}</div>
        </DraggableCore>
      );
    }

    const curryResizeHandler = (position: Position, handler) => {
      return (e: Event, data: ResizeCallbackData) =>
        handler(e, data, position);
    }

    watch(
      () => (pick(props, ['droppingPosition'])),
      (nextProps, prevProps) => {
        moveDroppingItem(prevProps || {});
      },
      { deep: true }
    );

    const moveDroppingItem = (prevProps: Partial<Props>) => {
      const { droppingPosition } = props;
      if (!droppingPosition) return;
      const node = elementRef.value;
      // Can't find DOM node (are we unmounted?)

      if (!node) return;
  
      const prevDroppingPosition = prevProps.droppingPosition || {
        left: 0,
        top: 0
      };
      const { dragging } = state;
  
      const shouldDrag =
        (dragging && droppingPosition.left !== prevDroppingPosition.left) ||
        droppingPosition.top !== prevDroppingPosition.top;
  
      if (!dragging) {
        onDragStart(droppingPosition.e, {
          node,
          deltaX: droppingPosition.left,
          deltaY: droppingPosition.top
        });
      } else if (shouldDrag) {
        const deltaX = droppingPosition.left - dragging.left;
        const deltaY = droppingPosition.top - dragging.top;
  
        onDrag(droppingPosition.e, {
          node,
          deltaX,
          deltaY
        });
      }
    }

    const mixinResizable = (
      child: VNode,
      position: Position,
      isResizable: boolean
    ): VNode =>{
      const {
        cols,
        minW,
        minH,
        maxW,
        maxH,
        transformScale,
        resizeHandles,
        resizeHandle
      } = props;
      const positionParams = getPositionParams();
  
      // This is the max possible width - doesn't go to infinity because of the width of the window
      const maxWidth = calcGridItemPosition(positionParams, 0, 0, cols, 0).width;
  
      // Calculate min/max constraints using our min & maxes
      const mins = calcGridItemPosition(positionParams, 0, 0, minW, minH);
      const maxes = calcGridItemPosition(positionParams, 0, 0, maxW, maxH);
      const minConstraints = [mins.width, mins.height];
      const maxConstraints = [
        Math.min(maxes.width, maxWidth),
        Math.min(maxes.height, Infinity)
      ];
      return (
        <Resizable
          // These are opts for the resize handle itself
          draggableOpts={{
            disabled: !isResizable
          }}
          className={isResizable ? undefined : "vue-resizable-hide"}
          width={position.width}
          height={position.height}
          minConstraints={minConstraints}
          maxConstraints={maxConstraints}
          fnResizeStop={curryResizeHandler(position, onResizeStop)}
          fnResizeStart={curryResizeHandler(position, onResizeStart)}
          fnResize={curryResizeHandler(position, onResize)}
          transformScale={transformScale}
          resizeHandles={resizeHandles}
          handle={resizeHandle}
        >
          {h(child, { style: { height: '100%' }})}
        </Resizable>
      );
    }
  

    onMounted(() => {
      moveDroppingItem({});
    });

    return () => {
      const {
        x,
        y,
        w,
        isDraggable,
        isResizable,
        droppingPosition,
        useCSSTransforms
      } = props;

      const pos = calcGridItemPosition(
        getPositionParams(),
        x,
        y,
        w,
        props.h,
        state
      );
      const child = slots.default ? slots.default()[0] : null;
      if (!child) return null;

      const wrapperProps = {
        class: clsx(
          "vue-grid-item",
          child.props?.class,
          props.class,
          {
            static: props.static,
            resizing: Boolean(state.resizing),
            "vue-draggable": isDraggable,
            "vue-draggable-dragging": Boolean(state.dragging),
            dropping: Boolean(droppingPosition),
            cssTransforms: useCSSTransforms
          }
        ),
        style: {
          ...props.style,
          ...child.props?.style,
          ...createStyle(pos)
        }
      }
  
      // Resizable support. This is usually on but the user can toggle it off.
      let newChild = mixinResizable(child, pos, isResizable);
  
      newChild = mixinDraggable(newChild, isDraggable, wrapperProps);
  
      return newChild;
    }

  }
})

export default GridItem
