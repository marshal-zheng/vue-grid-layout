import type { ResizeHandleAxis } from "../utils";
export type GridPointerKind = "mouse" | "pen" | "touch" | "coarse" | "unknown";
export type GridDragActivationDistance = number | {
    mouse?: number;
    pen?: number;
    touch?: number;
    coarse?: number;
    default?: number;
};
export type GridPoint = {
    x: number;
    y: number;
};
export type GridCell = {
    x: number;
    y: number;
};
export type GridSize = {
    w: number;
    h: number;
};
export type GridGeometry = GridCell & GridSize;
export type GridDropStrategy = "cursor" | "auto";
export type GridDragContext = {
    kind: "single";
    id: string;
} | {
    kind: "group";
    activeId: string;
    ids: string[];
} | {
    kind: "blocked";
    reason: string;
    ids: string[];
    activeId?: string;
};
export type GridInteractionKind = "drag" | "resize" | "drop";
export type GridInteractionState = {
    status: "idle";
    revision: number;
} | {
    status: "pending-drag";
    revision: number;
    interactionId: string;
    itemId: string;
    pointerKind: GridPointerKind;
    originPx: GridPoint;
    currentPx: GridPoint;
    originGrid: GridCell;
    lastGrid: GridCell;
} | {
    status: "active-drag";
    revision: number;
    interactionId: string;
    itemId: string;
    context: GridDragContext;
    startGrid: GridCell;
    lastGrid: GridCell;
    moved: boolean;
    previewSeq: number;
} | {
    status: "active-resize";
    revision: number;
    interactionId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    start: GridGeometry;
    last: GridGeometry;
    resized: boolean;
    previewSeq: number;
} | {
    status: "active-drop";
    revision: number;
    interactionId: string;
    itemId: string;
    lastGrid?: GridCell;
    lastSize?: GridSize;
    strategy?: GridDropStrategy;
    previewSeq: number;
} | {
    status: "committing";
    revision: number;
    interactionId: string;
    kind: GridInteractionKind;
    requestId: string;
    previous: Exclude<GridInteractionState, {
        status: "idle" | "pending-drag" | "committing";
    }>;
};
export type GridInteractionEvent = {
    type: "ARM_DRAG";
    interactionId: string;
    itemId: string;
    pointerKind: GridPointerKind;
    originPx: GridPoint;
    originGrid: GridCell;
} | {
    type: "START_DRAG";
    interactionId: string;
    itemId: string;
    grid: GridCell;
    context: GridDragContext;
} | {
    type: "MOVE_DRAG";
    interactionId: string;
    currentPx: GridPoint;
    grid: GridCell;
    context?: GridDragContext;
} | {
    type: "STOP_DRAG";
    interactionId: string;
    grid: GridCell;
} | {
    type: "START_RESIZE";
    interactionId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    geometry: GridGeometry;
} | {
    type: "MOVE_RESIZE";
    interactionId: string;
    geometry: GridGeometry;
} | {
    type: "STOP_RESIZE";
    interactionId: string;
    geometry: GridGeometry;
} | {
    type: "ENTER_DROP";
    interactionId: string;
    itemId: string;
    grid?: GridCell;
    size?: GridSize;
    strategy?: GridDropStrategy;
} | {
    type: "MOVE_DROP";
    interactionId: string;
    grid: GridCell;
    size: GridSize;
    strategy?: GridDropStrategy;
} | {
    type: "LEAVE_DROP";
    interactionId: string;
    reason?: string;
} | {
    type: "REJECT_DROP";
    interactionId: string;
    reason?: string;
} | {
    type: "COMMIT_DROP";
    interactionId: string;
} | {
    type: "APPLY_RESULT";
    interactionId: string;
    requestId: string;
    status: "changed" | "fallback" | "noop" | "blocked" | "error" | "stale";
} | {
    type: "CANCEL";
    interactionId?: string;
    reason: string;
};
export type GridInteractionRejectReason = "not-armed" | "already-active" | "stale-event" | "missing-item" | "unsupported" | "cancelled" | "wrong-kind" | "not-committing";
export type GridInteractionEffect = {
    type: "EMIT_DRAG_START";
    interactionId: string;
    itemId: string;
    grid: GridCell;
    context: GridDragContext;
} | {
    type: "EMIT_DRAG";
    interactionId: string;
    itemId: string;
    grid: GridCell;
    context: GridDragContext;
} | {
    type: "EMIT_DRAG_STOP";
    interactionId: string;
    itemId: string;
    grid: GridCell;
    context: GridDragContext;
} | {
    type: "PREVIEW_DRAG";
    interactionId: string;
    requestId: string;
    itemId: string;
    grid: GridCell;
    context: GridDragContext;
} | {
    type: "COMMIT_DRAG";
    interactionId: string;
    requestId: string;
    itemId: string;
    grid: GridCell;
    context: GridDragContext;
} | {
    type: "EMIT_RESIZE_START";
    interactionId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    geometry: GridGeometry;
} | {
    type: "EMIT_RESIZE";
    interactionId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    geometry: GridGeometry;
} | {
    type: "EMIT_RESIZE_STOP";
    interactionId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    geometry: GridGeometry;
} | {
    type: "PREVIEW_RESIZE";
    interactionId: string;
    requestId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    geometry: GridGeometry;
} | {
    type: "COMMIT_RESIZE";
    interactionId: string;
    requestId: string;
    itemId: string;
    handle: ResizeHandleAxis;
    geometry: GridGeometry;
} | {
    type: "PREVIEW_DROP";
    interactionId: string;
    requestId: string;
    itemId: string;
    grid: GridCell;
    size: GridSize;
    strategy: GridDropStrategy;
} | {
    type: "COMMIT_DROP";
    interactionId: string;
    requestId: string;
    itemId: string;
} | {
    type: "CLEAR_TRANSIENT";
    interactionId?: string;
    kind?: GridInteractionKind;
    reason: string;
} | {
    type: "IGNORE_STALE";
    interactionId: string;
    requestId?: string;
    reason: string;
} | {
    type: "REJECT_TRANSITION";
    from: GridInteractionState["status"];
    event: GridInteractionEvent["type"];
    reason: GridInteractionRejectReason;
};
export type GridInteractionDiagnostics = {
    interactionId?: string;
    requestId?: string;
    from: GridInteractionState["status"];
    to: GridInteractionState["status"];
    event: GridInteractionEvent["type"];
    kind?: GridInteractionKind;
    itemId?: string;
    reason?: string;
};
export type GridInteractionMachineOptions = {
    dragActivationDistance?: GridDragActivationDistance;
};
export type GridInteractionReduction = {
    state: GridInteractionState;
    effects: GridInteractionEffect[];
    diagnostics: GridInteractionDiagnostics[];
};
