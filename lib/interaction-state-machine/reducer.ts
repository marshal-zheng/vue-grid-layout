import {
  hasReachedDragActivationDistance,
  resolveDragActivationDistance
} from "./thresholds";
import type {
  GridCell,
  GridDragContext,
  GridGeometry,
  GridInteractionDiagnostics,
  GridInteractionEffect,
  GridInteractionEvent,
  GridInteractionKind,
  GridInteractionMachineOptions,
  GridInteractionReduction,
  GridInteractionRejectReason,
  GridInteractionState,
  GridSize
} from "./types";

export const createGridInteractionInitialState = (): GridInteractionState => ({
  status: "idle",
  revision: 0
});

export function reduceGridInteraction(
  state: GridInteractionState,
  event: GridInteractionEvent,
  options: GridInteractionMachineOptions = {}
): GridInteractionReduction {
  switch (event.type) {
    case "ARM_DRAG":
      return armDrag(state, event, options);
    case "START_DRAG":
      return startDrag(state, event);
    case "MOVE_DRAG":
      return moveDrag(state, event, options);
    case "STOP_DRAG":
      return stopDrag(state, event);
    case "START_RESIZE":
      return startResize(state, event);
    case "MOVE_RESIZE":
      return moveResize(state, event);
    case "STOP_RESIZE":
      return stopResize(state, event);
    case "ENTER_DROP":
      return enterDrop(state, event);
    case "MOVE_DROP":
      return moveDrop(state, event);
    case "LEAVE_DROP":
      return leaveDrop(state, event, event.reason || "drop-left");
    case "REJECT_DROP":
      return leaveDrop(state, event, event.reason || "drop-rejected");
    case "COMMIT_DROP":
      return commitDrop(state, event);
    case "APPLY_RESULT":
      return applyResult(state, event);
    case "CANCEL":
      return cancelInteraction(state, event);
    default:
      return reject(state, event as GridInteractionEvent, "unsupported");
  }
}

function startDrag(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "START_DRAG" }>
): GridInteractionReduction {
  if (state.status !== "idle") return reject(state, event, "already-active");
  const next: GridInteractionState = {
    status: "active-drag",
    revision: state.revision + 1,
    interactionId: event.interactionId,
    itemId: event.itemId,
    context: event.context,
    startGrid: event.grid,
    lastGrid: event.grid,
    moved: false,
    previewSeq: 0
  };
  return complete(state, next, event, [
    {
      type: "EMIT_DRAG_START",
      interactionId: event.interactionId,
      itemId: event.itemId,
      grid: event.grid,
      context: event.context
    }
  ]);
}

function armDrag(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "ARM_DRAG" }>,
  options: GridInteractionMachineOptions
): GridInteractionReduction {
  if (state.status !== "idle") return reject(state, event, "already-active");
  const threshold = resolveDragActivationDistance(
    options.dragActivationDistance,
    event.pointerKind
  );
  if (threshold <= 0) {
    const context: GridDragContext = { kind: "single", id: event.itemId };
    return complete(state, {
      status: "active-drag",
      revision: state.revision + 1,
      interactionId: event.interactionId,
      itemId: event.itemId,
      context,
      startGrid: event.originGrid,
      lastGrid: event.originGrid,
      moved: false,
      previewSeq: 0
    }, event, [
      {
        type: "EMIT_DRAG_START",
        interactionId: event.interactionId,
        itemId: event.itemId,
        grid: event.originGrid,
        context
      }
    ]);
  }
  return complete(state, {
    status: "pending-drag",
    revision: state.revision + 1,
    interactionId: event.interactionId,
    itemId: event.itemId,
    pointerKind: event.pointerKind,
    originPx: event.originPx,
    currentPx: event.originPx,
    originGrid: event.originGrid,
    lastGrid: event.originGrid
  }, event, []);
}

function moveDrag(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "MOVE_DRAG" }>,
  options: GridInteractionMachineOptions
): GridInteractionReduction {
  if (state.status === "pending-drag") {
    if (state.interactionId !== event.interactionId) return stale(state, event);
    const threshold = resolveDragActivationDistance(
      options.dragActivationDistance,
      state.pointerKind
    );
    if (!hasReachedDragActivationDistance(state.originPx, event.currentPx, threshold)) {
      return complete(state, {
        ...state,
        revision: state.revision + 1,
        currentPx: event.currentPx,
        lastGrid: event.grid
      }, event, []);
    }
    const context = event.context || { kind: "single", id: state.itemId };
    const moved = context.kind !== "blocked" && !sameCell(state.originGrid, event.grid);
    const next: GridInteractionState = {
      status: "active-drag",
      revision: state.revision + 1,
      interactionId: state.interactionId,
      itemId: state.itemId,
      context,
      startGrid: state.originGrid,
      lastGrid: event.grid,
      moved,
      previewSeq: moved ? 1 : 0
    };
    const effects: GridInteractionEffect[] = [
      {
        type: "EMIT_DRAG_START",
        interactionId: state.interactionId,
        itemId: state.itemId,
        grid: state.originGrid,
        context
      }
    ];
    if (moved) {
      effects.push({
        type: "EMIT_DRAG",
        interactionId: state.interactionId,
        itemId: state.itemId,
        grid: event.grid,
        context
      }, {
        type: "PREVIEW_DRAG",
        interactionId: state.interactionId,
        requestId: requestId(state.interactionId, "drag-preview", 1),
        itemId: state.itemId,
        grid: event.grid,
        context
      });
    }
    return complete(state, next, event, effects);
  }

  if (state.status !== "active-drag") return reject(state, event, "not-armed");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  if (state.context.kind === "blocked") {
    return complete(state, {
      ...state,
      revision: state.revision + 1,
      lastGrid: event.grid
    }, event, []);
  }
  if (sameCell(state.lastGrid, event.grid)) {
    return complete(state, { ...state, revision: state.revision + 1 }, event, []);
  }
  const previewSeq = state.previewSeq + 1;
  const next = {
    ...state,
    revision: state.revision + 1,
    lastGrid: event.grid,
    moved: true,
    previewSeq
  };
  return complete(state, next, event, [
    {
      type: "EMIT_DRAG",
      interactionId: state.interactionId,
      itemId: state.itemId,
      grid: event.grid,
      context: state.context
    },
    {
      type: "PREVIEW_DRAG",
      interactionId: state.interactionId,
      requestId: requestId(state.interactionId, "drag-preview", previewSeq),
      itemId: state.itemId,
      grid: event.grid,
      context: state.context
    }
  ]);
}

function stopDrag(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "STOP_DRAG" }>
): GridInteractionReduction {
  if (state.status === "pending-drag") {
    if (state.interactionId !== event.interactionId) return stale(state, event);
    return complete(state, idle(state), event, [
      {
        type: "CLEAR_TRANSIENT",
        interactionId: event.interactionId,
        kind: "drag",
        reason: "click-like"
      }
    ]);
  }
  if (state.status !== "active-drag") return reject(state, event, "not-armed");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  if (!state.moved) {
    return complete(state, idle(state), event, [
      {
        type: "EMIT_DRAG_STOP",
        interactionId: state.interactionId,
        itemId: state.itemId,
        grid: event.grid,
        context: state.context
      },
      {
        type: "CLEAR_TRANSIENT",
        interactionId: event.interactionId,
        kind: "drag",
        reason: "drag-noop"
      }
    ]);
  }
  const request = requestId(state.interactionId, "drag-commit", state.previewSeq + 1);
  return complete(state, {
    status: "committing",
    revision: state.revision + 1,
    interactionId: state.interactionId,
    kind: "drag",
    requestId: request,
    previous: state
  }, event, [
    {
      type: "COMMIT_DRAG",
      interactionId: state.interactionId,
      requestId: request,
      itemId: state.itemId,
      grid: event.grid,
      context: state.context
    }
  ]);
}

function startResize(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "START_RESIZE" }>
): GridInteractionReduction {
  if (state.status !== "idle") return reject(state, event, "already-active");
  const next: GridInteractionState = {
    status: "active-resize",
    revision: state.revision + 1,
    interactionId: event.interactionId,
    itemId: event.itemId,
    handle: event.handle,
    start: event.geometry,
    last: event.geometry,
    resized: false,
    previewSeq: 0
  };
  return complete(state, next, event, [
    {
      type: "EMIT_RESIZE_START",
      interactionId: event.interactionId,
      itemId: event.itemId,
      handle: event.handle,
      geometry: event.geometry
    }
  ]);
}

function moveResize(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "MOVE_RESIZE" }>
): GridInteractionReduction {
  if (state.status !== "active-resize") return reject(state, event, "wrong-kind");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  if (sameGeometry(state.last, event.geometry)) {
    return complete(state, { ...state, revision: state.revision + 1 }, event, []);
  }
  const previewSeq = state.previewSeq + 1;
  const next = {
    ...state,
    revision: state.revision + 1,
    last: event.geometry,
    resized: true,
    previewSeq
  };
  return complete(state, next, event, [
    {
      type: "EMIT_RESIZE",
      interactionId: state.interactionId,
      itemId: state.itemId,
      handle: state.handle,
      geometry: event.geometry
    },
    {
      type: "PREVIEW_RESIZE",
      interactionId: state.interactionId,
      requestId: requestId(state.interactionId, "resize-preview", previewSeq),
      itemId: state.itemId,
      handle: state.handle,
      geometry: event.geometry
    }
  ]);
}

function stopResize(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "STOP_RESIZE" }>
): GridInteractionReduction {
  if (state.status !== "active-resize") return reject(state, event, "wrong-kind");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  if (!state.resized && sameGeometry(state.start, event.geometry)) {
    return complete(state, idle(state), event, [
      {
        type: "EMIT_RESIZE_STOP",
        interactionId: state.interactionId,
        itemId: state.itemId,
        handle: state.handle,
        geometry: event.geometry
      },
      {
        type: "CLEAR_TRANSIENT",
        interactionId: event.interactionId,
        kind: "resize",
        reason: "resize-noop"
      }
    ]);
  }
  const request = requestId(state.interactionId, "resize-commit", state.previewSeq + 1);
  return complete(state, {
    status: "committing",
    revision: state.revision + 1,
    interactionId: state.interactionId,
    kind: "resize",
    requestId: request,
    previous: state
  }, event, [
    {
      type: "COMMIT_RESIZE",
      interactionId: state.interactionId,
      requestId: request,
      itemId: state.itemId,
      handle: state.handle,
      geometry: event.geometry
    }
  ]);
}

function enterDrop(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "ENTER_DROP" }>
): GridInteractionReduction {
  if (state.status !== "idle") return reject(state, event, "already-active");
  const strategy = event.strategy || "cursor";
  const next: GridInteractionState = {
    status: "active-drop",
    revision: state.revision + 1,
    interactionId: event.interactionId,
    itemId: event.itemId,
    lastGrid: event.grid,
    lastSize: event.size,
    strategy,
    previewSeq: event.grid && event.size ? 1 : 0
  };
  const effects: GridInteractionEffect[] = event.grid && event.size
    ? [{
        type: "PREVIEW_DROP",
        interactionId: event.interactionId,
        requestId: requestId(event.interactionId, "drop-preview", 1),
        itemId: event.itemId,
        grid: event.grid,
        size: event.size,
        strategy
      }]
    : [];
  return complete(state, next, event, effects);
}

function moveDrop(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "MOVE_DROP" }>
): GridInteractionReduction {
  if (state.status !== "active-drop") return reject(state, event, "wrong-kind");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  const strategy = event.strategy || state.strategy || "cursor";
  if (
    state.lastGrid &&
    state.lastSize &&
    sameCell(state.lastGrid, event.grid) &&
    sameSize(state.lastSize, event.size) &&
    state.strategy === strategy
  ) {
    return complete(state, { ...state, revision: state.revision + 1 }, event, []);
  }
  const previewSeq = state.previewSeq + 1;
  const next = {
    ...state,
    revision: state.revision + 1,
    lastGrid: event.grid,
    lastSize: event.size,
    strategy,
    previewSeq
  };
  return complete(state, next, event, [
    {
      type: "PREVIEW_DROP",
      interactionId: state.interactionId,
      requestId: requestId(state.interactionId, "drop-preview", previewSeq),
      itemId: state.itemId,
      grid: event.grid,
      size: event.size,
      strategy
    }
  ]);
}

function leaveDrop(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "LEAVE_DROP" | "REJECT_DROP" }>,
  reason: string
): GridInteractionReduction {
  if (state.status !== "active-drop") return reject(state, event, "wrong-kind");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  return complete(state, idle(state), event, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: event.interactionId,
      kind: "drop",
      reason
    }
  ]);
}

function commitDrop(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "COMMIT_DROP" }>
): GridInteractionReduction {
  if (state.status !== "active-drop") return reject(state, event, "wrong-kind");
  if (state.interactionId !== event.interactionId) return stale(state, event);
  const request = requestId(state.interactionId, "drop-commit", state.previewSeq + 1);
  return complete(state, {
    status: "committing",
    revision: state.revision + 1,
    interactionId: state.interactionId,
    kind: "drop",
    requestId: request,
    previous: state
  }, event, [
    {
      type: "COMMIT_DROP",
      interactionId: state.interactionId,
      requestId: request,
      itemId: state.itemId
    }
  ]);
}

function applyResult(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "APPLY_RESULT" }>
): GridInteractionReduction {
  if (state.status !== "committing") return reject(state, event, "not-committing");
  if (state.interactionId !== event.interactionId || state.requestId !== event.requestId) {
    return stale(state, event);
  }
  const effects: GridInteractionEffect[] = [];
  if (state.previous.status === "active-drag") {
    effects.push({
      type: "EMIT_DRAG_STOP",
      interactionId: state.interactionId,
      itemId: state.previous.itemId,
      grid: state.previous.lastGrid,
      context: state.previous.context
    });
  } else if (state.previous.status === "active-resize") {
    effects.push({
      type: "EMIT_RESIZE_STOP",
      interactionId: state.interactionId,
      itemId: state.previous.itemId,
      handle: state.previous.handle,
      geometry: state.previous.last
    });
  }
  effects.push(
    {
      type: "CLEAR_TRANSIENT",
      interactionId: event.interactionId,
      kind: state.kind,
      reason: `commit-${event.status}`
    }
  );
  return complete(state, idle(state), event, effects);
}

function cancelInteraction(
  state: GridInteractionState,
  event: Extract<GridInteractionEvent, { type: "CANCEL" }>
): GridInteractionReduction {
  if (state.status === "idle") return complete(state, state, event, []);
  if (event.interactionId && getInteractionId(state) !== event.interactionId) {
    return stale(state, event);
  }
  return complete(state, idle(state), event, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: event.interactionId || getInteractionId(state),
      kind: getKind(state),
      reason: event.reason || "cancelled"
    }
  ], "cancelled");
}

function reject(
  state: GridInteractionState,
  event: GridInteractionEvent,
  reason: GridInteractionRejectReason
): GridInteractionReduction {
  return {
    state,
    effects: [
      {
        type: "REJECT_TRANSITION",
        from: state.status,
        event: event.type,
        reason
      }
    ],
    diagnostics: [
      diagnostic(state, state, event, reason)
    ]
  };
}

function stale(
  state: GridInteractionState,
  event: GridInteractionEvent
): GridInteractionReduction {
  const interactionId = "interactionId" in event ? event.interactionId : getInteractionId(state);
  const request = "requestId" in event ? event.requestId : undefined;
  return {
    state,
    effects: [
      {
        type: "IGNORE_STALE",
        interactionId: interactionId || "unknown",
        requestId: request,
        reason: "stale-event"
      }
    ],
    diagnostics: [
      diagnostic(state, state, event, "stale-event")
    ]
  };
}

function complete(
  from: GridInteractionState,
  to: GridInteractionState,
  event: GridInteractionEvent,
  effects: GridInteractionEffect[],
  reason?: string
): GridInteractionReduction {
  return {
    state: to,
    effects,
    diagnostics: [
      diagnostic(from, to, event, reason)
    ]
  };
}

function idle(previous: GridInteractionState): GridInteractionState {
  return {
    status: "idle",
    revision: previous.revision + 1
  };
}

function diagnostic(
  from: GridInteractionState,
  to: GridInteractionState,
  event: GridInteractionEvent,
  reason?: string
): GridInteractionDiagnostics {
  return {
    interactionId: "interactionId" in event ? event.interactionId : getInteractionId(from),
    requestId: "requestId" in event ? event.requestId : undefined,
    from: from.status,
    to: to.status,
    event: event.type,
    kind: getKind(to) || getKind(from),
    itemId: getItemId(to) || getItemId(from),
    reason
  };
}

function getInteractionId(state: GridInteractionState): string | undefined {
  return state.status === "idle" ? undefined : state.interactionId;
}

function getItemId(state: GridInteractionState): string | undefined {
  if (state.status === "idle" || state.status === "committing") return undefined;
  return state.itemId;
}

function getKind(state: GridInteractionState): GridInteractionKind | undefined {
  if (state.status === "pending-drag" || state.status === "active-drag") return "drag";
  if (state.status === "active-resize") return "resize";
  if (state.status === "active-drop") return "drop";
  if (state.status === "committing") return state.kind;
  return undefined;
}

function requestId(interactionId: string, phase: string, seq: number): string {
  return `${interactionId}:${phase}:${seq}`;
}

function sameCell(a: GridCell, b: GridCell): boolean {
  return a.x === b.x && a.y === b.y;
}

function sameSize(a: GridSize, b: GridSize): boolean {
  return a.w === b.w && a.h === b.h;
}

function sameGeometry(a: GridGeometry, b: GridGeometry): boolean {
  return sameCell(a, b) && sameSize(a, b);
}
