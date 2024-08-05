import { VNode, Ref, PropType, CSSProperties } from 'vue'
import type {
  CompactType,
  Layout,
  LayoutItem,
  ResizeHandleAxis
} from "./utils";
import { validateLayout } from './utils'

interface DroppingItem {
  i: string;
  w: number;
  h: number;
}
// util
export type VueRef<T extends HTMLElement> = Ref<T | null>;

export type ResizeHandle =
  | VNode
  | ((
      resizeHandleAxis: ResizeHandleAxis,
      ref: VueRef<HTMLElement>
    ) => VNode)

// Defines which resize handles should be rendered (default: 'se')
// Allows for any combination of:
// 's' - South handle (bottom-center)
// 'w' - West handle (left-center)
// 'e' - East handle (right-center)
// 'n' - North handle (top-center)
// 'sw' - Southwest handle (bottom-left)
// 'nw' - Northwest handle (top-left)
// 'se' - Southeast handle (bottom-right)
// 'ne' - Northeast handle (top-right)
export const resizeHandleAxesType = {
  type: Array as PropType<Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>>,
  default: () => []
}
// Custom component for resize handles
export const resizeHandleType = {
  type: [Object, Function] as PropType<ResizeHandle>
}

export type Props = {
  class: string
  style: CSSProperties
  width: number
  autoSize: boolean
  cols: number
  draggableCancel: string
  draggableHandle: string
  verticalCompact: boolean
  compactType: CompactType
  layout: Layout
  margin: number[]
  containerPadding?: number[] | null
  rowHeight: number
  maxRows: number
  isBounded: boolean
  isDraggable: boolean
  isResizable: boolean
  isDroppable: boolean
  preventCollision: boolean
  useCSSTransforms: boolean
  transformScale: number
  droppingItem: Partial<LayoutItem>
  resizeHandles: ResizeHandleAxis[]
  resizeHandle?: ResizeHandle
  allowOverlap: boolean
  innerRef?: Ref<"div">
};

export type DefaultProps = Omit<Props, 'width'>;

export const basicProps = {
  //
  // Basic props
  //
  class: {
    type: String as PropType<string>,
    default: ''
  },
  style: {
    type: Object as PropType<CSSProperties>,
    default: () => ({})
  },

  // This can be set explicitly. If it is not set, it will automatically
  // be set to the container width. Note that resizes will *not* cause this to adjust.
  // If you need that behavior, use WidthProvider.
  width: {
    type: Number
  },

  // If true, the container height swells and contracts to fit contents
  autoSize: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  // # of cols.
  cols: {
    type: Number as PropType<number>,
    default: 12
  },

  // A selector that will not be draggable.
  draggableCancel: {
    type: String as PropType<string>,
    default: ''
  },
  // A selector for the draggable handler
  draggableHandle: {
    type: String as PropType<string>,
    default: ''
  },
  verticalCompact: {
    type: Boolean,
    default: true
  },
  // Choose vertical or hotizontal compaction
  compactType: {
    type: String as PropType<"vertical" | "horizontal">,
    default: 'vertical',
    validator: (value: string) => ['vertical', 'horizontal'].includes(value),
  },

  // layout is an array of object with the format:
  // {x: Number, y: Number, w: Number, h: Number, i: String}
  modelValue: {
    type: Array as PropType<Layout>, // Specify the correct type instead of any if possible
    default: () => [],
    validator: (layout) => {
      // Assuming validateLayout throws an error if validation fails
      try {
        validateLayout(layout, "layout");
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  },

  //
  // Grid Dimensions
  //

  // Margin between items [x, y] in px
  margin: {
    type: Array as PropType<Array<number>>,
    default: () => [10, 10],
    validator: (value: number[]) => {
      // Check that every item in the array is a number
      return value.every(item => typeof item === 'number');
    }
  },
  // Padding inside the container [x, y] in px
  containerPadding: {
    type: Array as PropType<number[]>,
    // default: () => [],
    validator: (value: number[]) => {
      // Check that every item in the array is a number
      return value.every(item => typeof item === 'number');
    }
  },
  // Rows have a static height, but you can change this based on breakpoints if you like
  rowHeight: {
    type: Number as PropType<number>,
    default: 150
  },
  // Default Infinity, but you can specify a max here if you like.
  // Note that this isn't fully fleshed out and won't error if you specify a layout that
  // extends beyond the row capacity. It will, however, not allow users to drag/resize
  // an item past the barrier. They can push items beyond the barrier, though.
  // Intentionally not documented for this reason.
  maxRows: {
    type: Number as PropType<number>,
    default: Infinity
  },

  //
  // Flags
  //
  isBounded: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  isDraggable: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  isResizable: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  // If true, grid can be placed one over the other.
  allowOverlap: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // If true, grid items won't change position when being dragged over.
  preventCollision: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // Use CSS transforms instead of top/left
  useCSSTransforms: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  // parent layout transform scale
  transformScale: {
    type: Number as PropType<number>,
    default: 1
  },
  // If true, an external element can trigger onDrop callback with a specific grid position as a parameter
  isDroppable: {
    type: Boolean as PropType<boolean>,
    default: false
  },

  // Resize handle options
  resizeHandles: {
    type: Array as PropType<Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>>,
    default: () => ['se']
  },
  resizeHandle: resizeHandleType,

  //
  // Callbacks
  //

  // Callback so you can save the layout. Calls after each drag & resize stops.
  // layoutChange: {
  //   type: Function as PropType<(layout: Layout) => void>,
  //   default: noop
  // },

  // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
  // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
  // dragStartFn: {
  //   type: Function as PropType<EventCallback>,
  //   default: noop
  // },
  // // Calls on each drag movement.
  // dragFn: {
  //   type: Function as PropType<EventCallback>,
  //   default: noop
  // },
  // // Calls when drag is complete.
  // dragStopFn: {
  //   type: Function as PropType<EventCallback>,
  //   default: () => noop
  // },
  //Calls when resize starts.
  // resizeStartFn: {
  //   type: Function as PropType<EventCallback>,
  //   default: () => noop
  // },
  // // Calls when resize movement happens.
  // resizeFn: {
  //   type: Function as PropType<EventCallback>,
  //   default: () => noop
  // },
  // // Calls when resize is complete.
  // resizeStopFn: {
  //   type: Function as PropType<EventCallback>,
  //   default: () => noop
  // },
  // Calls when some element is dropped.
  // dropFn: {
  //   type: Function as PropType<(layout: Layout, item: LayoutItem, e: Event) => void>,
  //   default: () => noop
  // },
  // dropDragOverFn: {
  //   type: Function as PropType<(e: DragEvent) => ({ w?: number; h?: number } | false) | null | undefined>,
  //   default: () => noop
  // },

  //
  // Other validations
  //

  droppingItem: {
    type: Object as PropType<DroppingItem>,
    default: () => ({
      i: "__dropping-elem__",
      h: 1,
      w: 1
    }),
    validator: (value: DroppingItem) => {
      // Perform additional validation if necessary
      return (
        typeof value.i === 'string' &&
        typeof value.w === 'number' &&
        typeof value.h === 'number'
      );
    }
  },

  // Optional ref for getting a reference for the wrapping div.
  innerRef: {
    type: Object as PropType<Ref<HTMLElement>>,
    default: () => null
  },
};
