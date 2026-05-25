import { defineComponent, VNode, reactive, ref, Ref, CSSProperties, PropType, onMounted, h, watch, computed } from 'vue'
import { DraggableCore } from "@marsio/vue-draggable";
import { Resizable } from "@marsio/vue-resizable";
import {
  calcGridItemPosition,
} from "./calculateUtils";
import {
  resizeHandleAxesType,
  resizeHandleType
} from "./VueGridLayoutPropTypes";

import type {
  DroppingPosition,
  Position
} from "./utils";

import type { PositionParams } from "./calculateUtils";
import type { GridRenderPrecision } from "./grid-height";
import type { GridDragActivationDistance } from "./interaction-state-machine";
import {
  useGridItemDrag,
  type GridItemDragAttrs
} from "./grid-item/useGridItemDrag";
import {
  useGridItemResize,
  type GridItemResizeAttrs
} from "./grid-item/useGridItemResize";
import {
  createGridItemClassName,
  createGridItemMergedStyle,
  createGridItemPositionStyle
} from "./grid-item/gridItemStyle";

export type AttrsEvents = GridItemDragAttrs & GridItemResizeAttrs;

type State = {
  resizing?: { top: number, left: number, width: number, height: number } | null,
  dragging?: { top: number, left: number } | null,
  className: string
};

const componentName = 'GridItem'
/**
 * An individual item within a VueGridLayout.
 */
const GridItem = defineComponent({
  name: componentName,
  inheritAttrs: false,
  props: {
    cols: { type: Number, required: true },
    containerWidth: { type: Number, required: true },
    rowHeight: { type: Number, required: true },
    dragActivationDistance: {
      type: [Number, Object] as PropType<GridDragActivationDistance>,
      default: undefined
    },
    renderPrecision: {
      type: String as PropType<GridRenderPrecision>,
      default: "integer"
    },
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
    onItemClick: {
      type: Function as PropType<(event: MouseEvent) => void>,
      default: undefined
    },
    isDraggable: { type: Boolean, required: true },
    isResizable: { type: Boolean, required: true },
    isBounded: { type: Boolean, required: true },
    isDragBlocked: { type: Boolean, default: false },
    isResizeBlocked: { type: Boolean, default: false },
    static: Boolean,
    useCSSTransforms: { type: Boolean, required: true },
    transformScale: { type: Number, default: 1 },
    class: { type: String, default: '' },
    handle: { type: String, default: '' },
    cancel: { type: String, default: '' },
    cancelInteractiveElements: { type: Boolean, default: true },
    droppingPosition: { type: Object as PropType<DroppingPosition | null>, default: null },
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

    const positionParams = computed<PositionParams>(() => ({
      cols: props.cols,
      containerPadding: props.containerPadding,
      containerWidth: props.containerWidth,
      margin: props.margin,
      maxRows: props.maxRows,
      rowHeight: props.rowHeight,
      renderPrecision: props.renderPrecision
    }));

    const drag = useGridItemDrag({
      attrs: vAttrs,
      elementRef,
      positionParams,
      props,
      state
    });
    const resize = useGridItemResize({
      attrs: vAttrs,
      positionParams,
      props,
      state
    });

    const mixinDraggable = (
      child: VNode,
      isDraggable: boolean,
      wrapperProps
    ): VNode => {
      return (
        <DraggableCore
          disabled={!isDraggable}
          startFn={drag.onDragStart}
          dragFn={drag.onDrag}
          stopFn={drag.onDragStop}
          handle={props.handle}
          cancel={`.vue-resizable-handle${props.cancel ? `,${props.cancel}` : ''}`}
          cancelInteractiveElements={props.cancelInteractiveElements}
          scale={props.transformScale}
          nodeRef={elementRef}
          enableClickSuppression={true}
        >
          <div ref={elementRef} {...wrapperProps}>{child}</div>
        </DraggableCore>
      );
    }

    watch(
      () => props.droppingPosition,
      (_nextDroppingPosition, prevDroppingPosition) => {
        drag.moveDroppingItem(prevDroppingPosition);
      }
    );

    const mixinResizable = (
      child: VNode,
      position: Position,
      isResizable: boolean
    ): VNode => {
      const {
        transformScale,
        resizeHandles,
        resizeHandle
      } = props;
      const { minConstraints, maxConstraints } = resize.resizeConstraints.value;
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
          fnResizeStop={resize.curryResizeHandler(position, resize.onResizeStop)}
          fnResizeStart={resize.curryResizeHandler(position, resize.onResizeStart)}
          fnResize={resize.curryResizeHandler(position, resize.onResize)}
          transformScale={transformScale}
          resizeHandles={resizeHandles}
          handle={resizeHandle}
        >
          {h(child, { style: { height: '100%' } })}
        </Resizable>
      );
    }


    onMounted(() => {
      drag.moveDroppingItem();
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
        positionParams.value,
        x,
        y,
        w,
        props.h,
        state
      );
      const child = slots.default ? slots.default()[0] : null;
      if (!child) return null;

      const wrapperProps = {
        class: createGridItemClassName({
          childClass: child.props?.class,
          className: props.class,
          dropping: Boolean(droppingPosition),
          hasDragHandle: Boolean(props.handle),
          isDragBlocked: props.isDragBlocked,
          isDraggable,
          isDragging: Boolean(state.dragging),
          isResizeBlocked: props.isResizeBlocked,
          isResizing: Boolean(state.resizing),
          isStatic: props.static,
          useCSSTransforms
        }),
        onClick: props.onItemClick,
        style: createGridItemMergedStyle(
          props.style,
          child.props?.style,
          createGridItemPositionStyle(pos, {
            containerWidth: props.containerWidth,
            useCSSTransforms,
            usePercentages: props.usePercentages
          })
        )
      }

      // Resizable support. This is usually on but the user can toggle it off.
      let newChild = mixinResizable(child, pos, isResizable);

      newChild = mixinDraggable(newChild, isDraggable, wrapperProps);

      return newChild;
    }

  }
})

export default GridItem
