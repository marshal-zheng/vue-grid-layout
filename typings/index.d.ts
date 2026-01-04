declare module "@marsio/vue-grid-layout" {
  import type { CSSProperties, DefineComponent, Ref, VNode } from "vue";
  import type { Pinia, Store } from "pinia";

  export type ResizeHandleAxis =
    | "s"
    | "w"
    | "e"
    | "n"
    | "sw"
    | "nw"
    | "se"
    | "ne";

  export type CompactType = "horizontal" | "vertical" | null;

  export type LayoutItem = {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    resizeHandles?: Array<ResizeHandleAxis>;
    isBounded?: boolean;
  };

  export type Layout = LayoutItem[];

  export type GridHistorySnapshot = Layout;
  export type GridHistoryState = {
    past: Layout[];
    present: Layout | null;
    future: Layout[];
    maxSize: number;
  };
  export type GridHistoryGetters = {
    canUndo(state: GridHistoryState): boolean;
    canRedo(state: GridHistoryState): boolean;
  };
  export type GridHistoryActions = {
    push: (layout: Layout) => void;
    replacePresent: (layout: Layout | null) => void;
    undo: () => Layout | null;
    redo: () => Layout | null;
    clear: (snapshot?: Layout | null) => void;
  };
  export type GridHistoryStore = Store<string, GridHistoryState, GridHistoryGetters, GridHistoryActions>;
  export type GridHistoryOptions = {
    id?: string;
    pinia?: Pinia;
    maxSize?: number;
    clone?: (layout: Layout) => Layout;
    equals?: (a: Layout | null, b: Layout | null) => boolean;
  };

  export type KeyboardShortcutOptions = {
    /** Target element or selector to listen on. Defaults to window. */
    target?: HTMLElement | Window | string;
    /** Custom undo key combination. Defaults to Ctrl+Z (Win) / Cmd+Z (Mac) */
    undoKeys?: {
      key: string;
      ctrl?: boolean;
      meta?: boolean;
      shift?: boolean;
      alt?: boolean;
    };
    /** Custom redo key combination. Defaults to Ctrl+Y or Ctrl+Shift+Z (Win) / Cmd+Shift+Z (Mac) */
    redoKeys?: {
      key: string;
      ctrl?: boolean;
      meta?: boolean;
      shift?: boolean;
      alt?: boolean;
    }[];
    /** Callback when undo is triggered */
    onUndo?: (layout: Layout | null) => void;
    /** Callback when redo is triggered */
    onRedo?: (layout: Layout | null) => void;
    /** Filter function to determine if shortcuts should be active. Return false to skip. */
    filter?: (event: KeyboardEvent) => boolean;
  };

  export type VueRef<T extends HTMLElement> = Ref<T | null>;

  export type ResizeHandle =
    | VNode
    | ((resizeHandleAxis: ResizeHandleAxis, ref: VueRef<HTMLElement>) => VNode);

  export type AutoScrollOptions = { margin?: number; speed?: number };

  export type ItemCallback = (
    layout: Layout,
    oldItem?: LayoutItem | null,
    newItem?: LayoutItem | null,
    placeholder?: LayoutItem,
    event?: Event,
    element?: HTMLElement
  ) => void;

  export type VueGridLayoutProps = {
    class?: string;
    style?: CSSProperties;
    width?: number;
    autoSize?: boolean;
    autoScroll?: boolean | AutoScrollOptions;
    cols?: number;
    draggableCancel?: string;
    draggableHandle?: string;
    verticalCompact?: boolean;
    compactType?: CompactType;
    modelValue?: Layout;
    margin?: [number, number];
    containerPadding?: [number, number] | null;
    rowHeight?: number;
    maxRows?: number;
    isBounded?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    isDroppable?: boolean;
    dropStrategy?: "cursor" | "auto";
    preventCollision?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    droppingItem?: { i: string; w: number; h: number };
    resizeHandles?: ResizeHandleAxis[];
    resizeHandle?: ResizeHandle;
    allowOverlap?: boolean;
    historyStore?: GridHistoryStore;
    innerRef?: Ref<HTMLElement | null>;
    onLayoutChange?: (layout: Layout) => void;
    onDragStart?: ItemCallback;
    onDrag?: ItemCallback;
    onDragStop?: ItemCallback;
    onResizeStart?: ItemCallback;
    onResize?: ItemCallback;
    onResizeStop?: ItemCallback;
    onDrop?: (layout: Layout, e: Event, item?: LayoutItem) => void;
    onDropDragOver?: (e: DragEvent) => { w?: number; h?: number } | false;
  };

  export type WidthProviderProps = {
    measureBeforeMount?: boolean;
    class?: string;
    style?: CSSProperties;
  };

  export type ResponsiveProps = {
    breakpoint?: string | null;
    breakpoints?: Record<string, number>;
    cols?: Record<string, number>;
    layouts?: Record<string, Layout>;
    width?: number;
    margin?: Record<string, [number, number]> | [number, number];
    containerPadding?:
      | Record<string, [number, number] | null>
      | [number, number]
      | null;
    allowOverlap?: boolean;
    verticalCompact?: boolean;
    compactType?: CompactType;
  };

  export const VueGridLayout: DefineComponent<VueGridLayoutProps>;
  export default VueGridLayout;

  export function createGridHistoryStore(options?: GridHistoryOptions): GridHistoryStore;
  export function useGridHistoryStore(options?: GridHistoryOptions): GridHistoryStore;
  export function bindKeyboardShortcuts(
    store: GridHistoryStore,
    options?: KeyboardShortcutOptions
  ): () => void;

  export const history: {
    createGridHistoryStore: typeof createGridHistoryStore;
    useGridHistoryStore: typeof useGridHistoryStore;
    bindKeyboardShortcuts: typeof bindKeyboardShortcuts;
  };

  export const Responsive: DefineComponent<ResponsiveProps>;

  export function findFirstFit(
    layout: Layout,
    item: Pick<LayoutItem, "w" | "h">,
    cols: number,
    maxRows?: number
  ): { x: number; y: number } | null;

  export function findNearestFit(
    layout: Layout,
    item: Pick<LayoutItem, "w" | "h">,
    cols: number,
    targetX: number,
    targetY: number,
    maxRows?: number
  ): { x: number; y: number } | null;

  export const utils: {
    findFirstFit: typeof findFirstFit;
    findNearestFit: typeof findNearestFit;
    [key: string]: unknown;
  };
  export const calculateUtils: unknown;

  export function WidthProvider<P = Record<string, unknown>>(
    ComposedComponent: DefineComponent<P>
  ): DefineComponent<P & WidthProviderProps>;
}
