import { VNode, Ref, PropType, CSSProperties } from 'vue'
import type {
  CompactType,
  Layout,
  ResizeHandleAxis
} from "./utils";
import type { GridLayoutEngineProp } from './layout-engine'
import type { GridHeightMode, GridRenderPrecision } from './grid-height'
import type { GridDragActivationDistance } from './interaction-state-machine'

export interface DroppingItem {
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
  heightMode?: GridHeightMode | null
  containerHeight?: number | null
  autoMeasureContainerHeight?: boolean
  minRowHeight?: number
  renderPrecision?: GridRenderPrecision | null
  autoScroll?: boolean | { margin?: number; speed?: number }
  dragActivationDistance?: GridDragActivationDistance
  cols: number
  draggableCancel: string
  draggableHandle: string
  verticalCompact: boolean
  compactType: CompactType
  modelValue: Layout
  margin: number[]
  containerPadding?: number[] | null
  rowHeight: number
  maxRows: number
  isBounded: boolean
  isDraggable: boolean
  isResizable: boolean
  isDroppable: boolean
  dropStrategy: 'cursor' | 'auto'
  preventCollision: boolean
  useCSSTransforms: boolean
  transformScale: number
  droppingItem: DroppingItem
  resizeHandles: ResizeHandleAxis[]
  resizeHandle?: ResizeHandle
  allowOverlap: boolean
  layoutEngine?: false | GridLayoutEngineProp
  innerRef?: Ref<HTMLElement | null>
};

export type DefaultProps = Omit<Props, 'width'>;

export const basicProps = {
  /** Additional CSS class for the container */
  class: {
    type: String as PropType<string>,
    default: ''
  },
  /** Inline style object for the container */
  style: {
    type: Object as PropType<CSSProperties>,
    default: () => ({})
  },
  /** Container width (px); auto-measured via WidthProvider if not provided */
  width: {
    type: Number
  },
  /** Automatically adjust container height based on content */
  autoSize: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  /** Runtime height mode. Explicit values take precedence over legacy autoSize. */
  heightMode: {
    type: String as PropType<GridHeightMode | null>,
    default: null,
    validator: (value: string | null) => value == null || ['auto', 'scroll', 'fit', 'fixed'].includes(value)
  },
  /** Controlled grid container height in px for fixed, scroll, and fit modes. */
  containerHeight: {
    type: Number as PropType<number | null>,
    default: null
  },
  /** Measure the grid root parent content box when no controlled containerHeight is provided. */
  autoMeasureContainerHeight: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  /** Minimum usable row height for fit mode before falling back to scroll. */
  minRowHeight: {
    type: Number as PropType<number>,
    default: undefined
  },
  /** Final CSS pixel precision for item geometry. */
  renderPrecision: {
    type: String as PropType<GridRenderPrecision | null>,
    default: null,
    validator: (value: string | null) => value == null || ['integer', 'subpixel'].includes(value)
  },
  /** Number of columns, default 12 */
  cols: {
    type: Number as PropType<number>,
    default: 12
  },
  /** CSS selector for elements that should not trigger drag (requires . prefix) */
  draggableCancel: {
    type: String as PropType<string>,
    default: ''
  },
  /** CSS selector for drag handle elements (requires . prefix) */
  draggableHandle: {
    type: String as PropType<string>,
    default: ''
  },
  /** Vertical compact layout (deprecated, use compactType) */
  verticalCompact: {
    type: Boolean,
    default: true
  },
  /** Compaction direction: vertical / horizontal / null (no compaction) */
  compactType: {
    type: String as PropType<CompactType>,
    default: 'vertical',
    validator: (value: CompactType) => value == null || ['vertical', 'horizontal'].includes(value),
  },
  /** Layout array, supports v-model two-way binding */
  modelValue: {
    type: Array as PropType<Layout>,
    default: () => [],
    validator: (layout: unknown) => {
      if (!Array.isArray(layout)) return false;

      for (let i = 0; i < layout.length; i++) {
        const item = layout[i] as {
          x?: unknown;
          y?: unknown;
          w?: unknown;
          h?: unknown;
          i?: unknown;
        } | null;

        if (!item) return false;
        if (typeof item.x !== "number" || Number.isNaN(item.x)) return false;
        if (typeof item.y !== "number" || Number.isNaN(item.y)) return false;
        if (typeof item.w !== "number" || Number.isNaN(item.w)) return false;
        if (typeof item.h !== "number" || Number.isNaN(item.h)) return false;
        if (typeof item.i !== "undefined" && typeof item.i !== "string") {
          return false;
        }
      }

      return true;
    }
  },
  /** Grid spacing [x, y] in px, default [10, 10] */
  margin: {
    type: Array as PropType<Array<number>>,
    default: () => [10, 10],
    validator: (value: number[]) => {
      return value.every(item => typeof item === 'number');
    }
  },
  /** Container padding [x, y] in px, defaults to margin value */
  containerPadding: {
    type: Array as PropType<number[]>,
    validator: (value: number[]) => {
      return value.every(item => typeof item === 'number');
    }
  },
  /** Row height (px), default 150 */
  rowHeight: {
    type: Number as PropType<number>,
    default: 150
  },
  /** Maximum number of rows, default Infinity (no limit) */
  maxRows: {
    type: Number as PropType<number>,
    default: Infinity
  },
  /** Restrict dragging within container boundaries */
  isBounded: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  /** Globally enable dragging, default true */
  isDraggable: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  /** Globally enable resizing, default true */
  isResizable: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  /** Allow grid items to overlap, automatically enables preventCollision */
  allowOverlap: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  /** Prevent collision mode, items won't push others when dragging */
  preventCollision: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  /** Use CSS transform for positioning (better performance), default true */
  useCSSTransforms: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  /** Set scale ratio when parent has CSS scale transform */
  transformScale: {
    type: Number as PropType<number>,
    default: 1
  },
  /** Auto-scroll when dragging near edges; accepts boolean or { margin, speed } object */
  autoScroll: {
    type: [Boolean, Object] as PropType<boolean | { margin?: number; speed?: number }>,
    default: false
  },
  /** Drag activation distance in px; default mouse/pen 4px, touch/coarse 8px. */
  dragActivationDistance: {
    type: [Number, Object] as PropType<GridDragActivationDistance>,
    default: undefined
  },
  /** Allow dropping elements from outside, requires @drop and @dropDragOver handlers */
  isDroppable: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  /** Drop positioning strategy: cursor (mouse position) / auto (auto-snap) */
  dropStrategy: {
    type: String as PropType<'cursor' | 'auto'>,
    default: 'cursor',
    validator: (value: string) => ['cursor', 'auto'].includes(value),
  },
  /** Array of enabled resize handle directions, e.g. ["se", "n", "e"] */
  resizeHandles: {
    type: Array as PropType<Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>>,
    default: () => ['se']
  },
  /** Custom resize handle render function or VNode */
  resizeHandle: resizeHandleType,
  /** Layout engine configuration; false or { mode: "legacy" } uses the legacy path */
  layoutEngine: {
    type: [Boolean, Object] as PropType<false | GridLayoutEngineProp>,
    default: undefined
  },
  /** Placeholder config for external drop { i, w, h } */
  droppingItem: {
    type: Object as PropType<DroppingItem>,
    default: () => ({
      i: "__dropping-elem__",
      h: 1,
      w: 1
    }),
    validator: (value: DroppingItem) => {
      return (
        typeof value.i === 'string' &&
        typeof value.w === 'number' &&
        typeof value.h === 'number'
      );
    }
  },
  /** Ref reference to container DOM element */
  innerRef: {
    type: Object as PropType<Ref<HTMLElement>>,
    default: () => null
  },
};
