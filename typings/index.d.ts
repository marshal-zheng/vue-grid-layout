import { DraggableCoreProps } from '@marsio/vue-draggable'
import { VNode, Ref, Ref } from 'vue'
import type { Props as ResizableProps, ResizableBoxProps, ResizeCallbackData } from './propTypes';
declare module '@marsio/vue-grid-layout' {
  import { DefineComponent, CSSProperties } from 'vue';

  type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";

  type CompactType = "horizontal" | "vertical" | null;

  type ResizeHandle =
  | VNode
  | ((
      resizeHandleAxis: ResizeHandleAxis,
      ref: VueRef<HTMLElement>
    ) => VNode)

  type LayoutItem = {
    w: number,
    h: number,
    x: number,
    y: number,
    i: string,
    minW?: number,
    minH?: number,
    maxW?: number,
    maxH?: number,
    moved?: boolean,
    static?: boolean,
    isDraggable?: boolean,
    isResizable?: boolean,
    resizeHandles?: Array<ResizeHandleAxis>,
    isBounded?: boolean
  };

  type VueGridLayoutProps = {
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

  const VueGridLayout: DefineComponent<VueGridLayoutProps>;
  export { VueGridLayout as default }
  export type { VueGridLayoutProps, LayoutItem, ResizeHandle, CompactType, ResizeHandleAxis }
}
