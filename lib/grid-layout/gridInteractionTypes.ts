import type {
  CompactType,
  EventCallback,
  Layout,
  LayoutItem,
  ResizeHandleAxis
} from "../utils";
import type { DropDragOverResult } from "./contract";
import type { GridLayoutState } from "./useGridLayoutModel";
import type { useGridAutoScroll } from "./useGridAutoScroll";
import type { useGridFrameUpdate } from "./useGridFrameUpdate";
import type { useGridLayoutEngineBridge } from "./useGridLayoutEngineBridge";

export type GridDroppingItem = Partial<LayoutItem> & Pick<LayoutItem, "i" | "w" | "h">;

export type GridInteractionsProps = {
  autoScroll?: boolean | { margin?: number; speed?: number };
  allowOverlap: boolean;
  cols: number;
  compactType: CompactType;
  containerPadding?: number[] | null;
  dropStrategy: "cursor" | "auto";
  droppingItem: GridDroppingItem;
  margin: number[];
  maxRows: number;
  preventCollision: boolean;
  rowHeight: number;
  transformScale: number;
  verticalCompact: boolean;
  width?: number;
};

export type GridLayoutEventBridge = {
  emitDragStart: EventCallback;
  emitDrag: EventCallback;
  emitDragStop: EventCallback;
  emitResizeStart: EventCallback;
  emitResize: EventCallback;
  emitResizeStop: EventCallback;
  emitDrop: (layout: Layout, event: Event, item?: LayoutItem) => void;
  callDropDragOver: (event: DragEvent) => Exclude<DropDragOverResult, void> | undefined;
};

export type GridLayoutEngineBridge = ReturnType<typeof useGridLayoutEngineBridge>;
export type GridFrameUpdate = ReturnType<typeof useGridFrameUpdate>;
export type GridAutoScroll = ReturnType<typeof useGridAutoScroll>;

export type GridInteractionsEditor = {
  clearGuides: () => void;
  resetSnap: () => void;
  snapCandidate: (
    activeId: string,
    activeItem: LayoutItem,
    candidateItem: LayoutItem,
    validationLayout?: Layout,
    resizeHandle?: ResizeHandleAxis
  ) => LayoutItem;
  updateIntelligence: (
    activeId: string,
    activeItem: LayoutItem,
    candidateItem: LayoutItem,
    resizeHandle?: ResizeHandleAxis
  ) => unknown;
};

export type GridInteractionCommonOptions = {
  props: GridInteractionsProps;
  state: GridLayoutState;
  eventBridge: GridLayoutEventBridge;
  engineBridge: GridLayoutEngineBridge;
  frameUpdate: GridFrameUpdate;
  autoScroll: GridAutoScroll;
  editor: GridInteractionsEditor;
  nextInteractionRequestId: (kind: string, itemId: string) => string;
};

export type GridInteractionModelCommitters = {
  syncHistory: (layout: Layout, mode?: "push" | "replace") => void;
  onLayoutMaybeChanged: (
    newLayout: Layout,
    oldLayout?: Layout | null,
    historyMode?: "push" | "replace"
  ) => void;
};
