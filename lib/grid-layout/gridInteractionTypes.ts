import type {
  CompactType,
  EventCallback,
  Layout,
  LayoutItem,
  ResizeHandleAxis
} from "../utils";
import type { DropDragOverResult } from "./contract";
import type { GridDragActivationDistance } from "../interaction-state-machine";
import type { LayoutOperationResult, LayoutResizeConstraint } from "../layout-engine";
import type { GridItemCapabilityDiagnostic, GridItemResizeMetrics } from "../item-capabilities";
import type { GridLayoutState } from "./useGridLayoutModel";
import type { useGridAutoScroll } from "./useGridAutoScroll";
import type { useGridFrameUpdate } from "./useGridFrameUpdate";
import type { useGridLayoutEngineBridge } from "./useGridLayoutEngineBridge";
import type { GridInteractionMachineController } from "./useGridInteractionMachine";

export type GridDroppingItem = Partial<LayoutItem> & Pick<LayoutItem, "i" | "w" | "h">;

export type GridInteractionsProps = {
  autoScroll?: boolean | { margin?: number; speed?: number };
  dragActivationDistance?: GridDragActivationDistance;
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
  renderPrecision?: "integer" | "subpixel" | null;
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

export type GridInteractionBlockedReason =
  | "mode-readonly"
  | "editor-mode-missing"
  | "capability"
  | "locked"
  | "hidden"
  | "static-item"
  | "collision"
  | "bounds"
  | "maxRows"
  | "missing-item"
  | "handle-disabled"
  | "aspect-ratio"
  | "metrics-missing"
  | "selection-count"
  | "unsupported-scope"
  | "unsupported"
  | "section-row-locked"
  | "section-row-collapsed"
  | "section-row-policy"
  | "before-command-blocked"
  | "before-command-cancelled"
  | "before-command-timeout"
  | "command-pending"
  | "guard-aborted"
  | "stale-command"
  | "multi-resize-unsupported"
  | "clipboard-unavailable"
  | "clipboard-permission"
  | "clipboard-invalid"
  | "persistence-error"
  | "conflict"
  | "invalid-input";

export type GridInteractionCommandResult = {
  status: "changed" | "noop" | "blocked" | "cancelled" | "timeout" | "error";
};

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
  resolveMoveDrag: (input: {
    id: string;
    item: LayoutItem;
    layout: Layout;
    legacyLayoutEngine: boolean;
    event?: Event;
  }) =>
    | { kind: "single"; id: string }
    | { kind: "group"; activeId: string; ids: string[] }
    | {
        kind: "blocked";
        reason: GridInteractionBlockedReason;
        ids: string[];
        activeId?: string;
      };
  notifyMoveBlocked: (input: {
    reason: GridInteractionBlockedReason;
    ids: string[];
    activeId?: string;
    message?: string;
    operationResult?: LayoutOperationResult;
  }) => void;
  commitMove?: (input: {
    ids: string[];
    activeId?: string;
    beforeLayout: Layout;
    afterLayout: Layout;
    source?: "pointer" | "drop";
  }) => Promise<GridInteractionCommandResult | null>;
  commitResize?: (input: {
    id: string;
    beforeLayout: Layout;
    afterLayout: Layout;
    handle?: ResizeHandleAxis;
  }) => Promise<GridInteractionCommandResult | null>;
  commitDrop?: (input: {
    id: string;
    beforeLayout: Layout;
    afterLayout: Layout;
    item?: LayoutItem;
    event?: Event;
  }) => Promise<GridInteractionCommandResult | null>;
  rollbackInteraction?: (layout: Layout, reason: string) => void;
  resolveResizeIntent?: (input: {
    id: string;
    item: LayoutItem;
    layout: Layout;
    handle: ResizeHandleAxis;
    rawCandidate: LayoutItem;
    metrics?: GridItemResizeMetrics;
    phase: "preview" | "commit";
  }) =>
    | {
        kind: "allowed";
        candidate: LayoutItem;
        constraint?: LayoutResizeConstraint;
        diagnostics?: GridItemCapabilityDiagnostic[];
      }
    | {
        kind: "blocked";
        reason: GridInteractionBlockedReason;
        ids: string[];
        message?: string;
        diagnostics?: GridItemCapabilityDiagnostic[];
      };
};

export type GridInteractionCommonOptions = {
  props: GridInteractionsProps;
  state: GridLayoutState;
  eventBridge: GridLayoutEventBridge;
  engineBridge: GridLayoutEngineBridge;
  frameUpdate: GridFrameUpdate;
  autoScroll: GridAutoScroll;
  editor: GridInteractionsEditor;
  interactionMachine?: GridInteractionMachineController;
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
