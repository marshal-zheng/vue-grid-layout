import { computed as pt, defineComponent as Ot, reactive as Ht, ref as ke, watch as Je, onMounted as qt, createVNode as Ve, h as Nt, mergeProps as Bt, isVNode as Wt, markRaw as Y, shallowRef as wt, nextTick as Kt, onBeforeUnmount as Vt, getCurrentInstance as Qt, toRef as en, Fragment as tn } from "vue";
import mt from "clsx";
import { w as nn, y as rn, x as on, v as St, a as je, C as bt, i as Ee, c as an, d as qe, g as cn, o as he, F as ln, m as rt, s as et, f as Xe, l as sn, u as Ue, p as un } from "./utils-BCVYGne6.mjs";
import { DraggableCore as dn } from "@marsio/vue-draggable";
import { Resizable as fn } from "@marsio/vue-resizable";
import { b as Ze, f as Ft, d as xt, h as ot, c as jt, e as gn, r as mn } from "./resolve-C3SqJijI.mjs";
import { deepEqual as tt } from "fast-equals";
import { b as Et, c as zt, a as Lt } from "./executor-zXtJgoEd.mjs";
import { e as yn, c as pn } from "./core-uHtYEsHm.mjs";
import In from "resize-observer-polyfill";
const hn = {
  type: Array,
  default: () => []
}, Zt = {
  type: [Object, Function]
}, br = {
  /** Additional CSS class for the container */
  class: {
    type: String,
    default: ""
  },
  /** Inline style object for the container */
  style: {
    type: Object,
    default: () => ({})
  },
  /** Container width (px); auto-measured via WidthProvider if not provided */
  width: {
    type: Number
  },
  /** Automatically adjust container height based on content */
  autoSize: {
    type: Boolean,
    default: !0
  },
  /** Runtime height mode. Explicit values take precedence over legacy autoSize. */
  heightMode: {
    type: String,
    default: null,
    validator: (e) => e == null || ["auto", "scroll", "fit", "fixed"].includes(e)
  },
  /** Controlled grid container height in px for fixed, scroll, and fit modes. */
  containerHeight: {
    type: Number,
    default: null
  },
  /** Measure the grid root parent content box when no controlled containerHeight is provided. */
  autoMeasureContainerHeight: {
    type: Boolean,
    default: !1
  },
  /** Minimum usable row height for fit mode before falling back to scroll. */
  minRowHeight: {
    type: Number,
    default: void 0
  },
  /** Final CSS pixel precision for item geometry. */
  renderPrecision: {
    type: String,
    default: null,
    validator: (e) => e == null || ["integer", "subpixel"].includes(e)
  },
  /** Number of columns, default 12 */
  cols: {
    type: Number,
    default: 12
  },
  /** CSS selector for elements that should not trigger drag (requires . prefix) */
  draggableCancel: {
    type: String,
    default: ""
  },
  /** Prevent native interactive descendants from starting a drag. */
  draggableCancelInteractiveElements: {
    type: Boolean,
    default: !0
  },
  /** CSS selector for drag handle elements (requires . prefix) */
  draggableHandle: {
    type: String,
    default: ""
  },
  /** Vertical compact layout (deprecated, use compactType) */
  verticalCompact: {
    type: Boolean,
    default: !0
  },
  /** Compaction direction: vertical / horizontal / null (no compaction) */
  compactType: {
    type: String,
    default: "vertical",
    validator: (e) => e == null || ["vertical", "horizontal"].includes(e)
  },
  /** Layout array, supports v-model two-way binding */
  modelValue: {
    type: Array,
    default: () => [],
    validator: (e) => {
      if (!Array.isArray(e)) return !1;
      for (let t = 0; t < e.length; t++) {
        const n = e[t];
        if (!n || typeof n.x != "number" || Number.isNaN(n.x) || typeof n.y != "number" || Number.isNaN(n.y) || typeof n.w != "number" || Number.isNaN(n.w) || typeof n.h != "number" || Number.isNaN(n.h) || typeof n.i != "undefined" && typeof n.i != "string")
          return !1;
      }
      return !0;
    }
  },
  /** Grid spacing [x, y] in px, default [10, 10] */
  margin: {
    type: Array,
    default: () => [10, 10],
    validator: (e) => e.every((t) => typeof t == "number")
  },
  /** Container padding [x, y] in px, defaults to margin value */
  containerPadding: {
    type: Array,
    validator: (e) => e.every((t) => typeof t == "number")
  },
  /** Row height (px), default 150 */
  rowHeight: {
    type: Number,
    default: 150
  },
  /** Maximum number of rows, default Infinity (no limit) */
  maxRows: {
    type: Number,
    default: 1 / 0
  },
  /** Restrict dragging within container boundaries */
  isBounded: {
    type: Boolean,
    default: !1
  },
  /** Globally enable dragging, default true */
  isDraggable: {
    type: Boolean,
    default: !0
  },
  /** Globally enable resizing, default true */
  isResizable: {
    type: Boolean,
    default: !0
  },
  /** Allow grid items to overlap, automatically enables preventCollision */
  allowOverlap: {
    type: Boolean,
    default: !1
  },
  /** Prevent collision mode, items won't push others when dragging */
  preventCollision: {
    type: Boolean,
    default: !1
  },
  /** Use CSS transform for positioning (better performance), default true */
  useCSSTransforms: {
    type: Boolean,
    default: !0
  },
  /** Set scale ratio when parent has CSS scale transform */
  transformScale: {
    type: Number,
    default: 1
  },
  /** Auto-scroll when dragging near edges; accepts boolean or { margin, speed } object */
  autoScroll: {
    type: [Boolean, Object],
    default: !1
  },
  /** Drag activation distance in px; default mouse/pen 4px, touch/coarse 8px. */
  dragActivationDistance: {
    type: [Number, Object],
    default: void 0
  },
  /** Allow dropping elements from outside, requires @drop and @dropDragOver handlers */
  isDroppable: {
    type: Boolean,
    default: !1
  },
  /** Drop positioning strategy: cursor (mouse position) / auto (auto-snap) */
  dropStrategy: {
    type: String,
    default: "cursor",
    validator: (e) => ["cursor", "auto"].includes(e)
  },
  /** Array of enabled resize handle directions, e.g. ["se", "n", "e"] */
  resizeHandles: {
    type: Array,
    default: () => ["se"]
  },
  /** Custom resize handle render function or VNode */
  resizeHandle: Zt,
  /** Layout engine configuration; false or { mode: "legacy" } uses the legacy path */
  layoutEngine: {
    type: [Boolean, Object],
    default: void 0
  },
  /** Placeholder config for external drop { i, w, h } */
  droppingItem: {
    type: Object,
    default: () => ({
      i: "__dropping-elem__",
      h: 1,
      w: 1
    }),
    validator: (e) => typeof e.i == "string" && typeof e.w == "number" && typeof e.h == "number"
  },
  /** Ref reference to container DOM element */
  innerRef: {
    type: Object,
    default: () => null
  }
}, Ct = {
  mouse: 4,
  pen: 4,
  touch: 8,
  coarse: 8,
  default: 4
};
function vn(e) {
  return e === "mouse" || e === "pen" || e === "touch" ? e : e === "coarse" ? "coarse" : "unknown";
}
function Yt(e, t) {
  var s;
  if (typeof e == "number") return Pt(e);
  const n = e || Ct, r = (s = n.default) != null ? s : Ct.default, l = t === "mouse" ? n.mouse : t === "pen" ? n.pen : t === "touch" ? n.touch : t === "coarse" ? n.coarse : void 0;
  return Pt(l != null ? l : r);
}
function Rn(e, t, n) {
  if (n <= 0) return !0;
  const r = t.x - e.x, l = t.y - e.y;
  return Math.sqrt(r * r + l * l) >= n;
}
function Pt(e) {
  return !Number.isFinite(e) || e < 0 ? 0 : e;
}
const at = () => ({
  status: "idle",
  revision: 0
});
function it(e, t, n = {}) {
  switch (t.type) {
    case "ARM_DRAG":
      return wn(e, t, n);
    case "START_DRAG":
      return Dn(e, t);
    case "MOVE_DRAG":
      return Sn(e, t, n);
    case "STOP_DRAG":
      return bn(e, t);
    case "START_RESIZE":
      return xn(e, t);
    case "MOVE_RESIZE":
      return En(e, t);
    case "STOP_RESIZE":
      return zn(e, t);
    case "ENTER_DROP":
      return Ln(e, t);
    case "MOVE_DROP":
      return Cn(e, t);
    case "LEAVE_DROP":
      return Tt(e, t, t.reason || "drop-left");
    case "REJECT_DROP":
      return Tt(e, t, t.reason || "drop-rejected");
    case "COMMIT_DROP":
      return Pn(e, t);
    case "APPLY_RESULT":
      return Tn(e, t);
    case "CANCEL":
      return kn(e, t);
    default:
      return Ce(e, t, "unsupported");
  }
}
function Dn(e, t) {
  if (e.status !== "idle") return Ce(e, t, "already-active");
  const n = {
    status: "active-drag",
    revision: e.revision + 1,
    interactionId: t.interactionId,
    itemId: t.itemId,
    context: t.context,
    startGrid: t.grid,
    lastGrid: t.grid,
    moved: !1,
    previewSeq: 0
  };
  return le(e, n, t, [
    {
      type: "EMIT_DRAG_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      grid: t.grid,
      context: t.context
    }
  ]);
}
function wn(e, t, n) {
  if (e.status !== "idle") return Ce(e, t, "already-active");
  if (Yt(
    n.dragActivationDistance,
    t.pointerKind
  ) <= 0) {
    const l = { kind: "single", id: t.itemId };
    return le(e, {
      status: "active-drag",
      revision: e.revision + 1,
      interactionId: t.interactionId,
      itemId: t.itemId,
      context: l,
      startGrid: t.originGrid,
      lastGrid: t.originGrid,
      moved: !1,
      previewSeq: 0
    }, t, [
      {
        type: "EMIT_DRAG_START",
        interactionId: t.interactionId,
        itemId: t.itemId,
        grid: t.originGrid,
        context: l
      }
    ]);
  }
  return le(e, {
    status: "pending-drag",
    revision: e.revision + 1,
    interactionId: t.interactionId,
    itemId: t.itemId,
    pointerKind: t.pointerKind,
    originPx: t.originPx,
    currentPx: t.originPx,
    originGrid: t.originGrid,
    lastGrid: t.originGrid
  }, t, []);
}
function Sn(e, t, n) {
  if (e.status === "pending-drag") {
    if (e.interactionId !== t.interactionId) return Me(e, t);
    const s = Yt(
      n.dragActivationDistance,
      e.pointerKind
    );
    if (!Rn(e.originPx, t.currentPx, s))
      return le(e, {
        ...e,
        revision: e.revision + 1,
        currentPx: t.currentPx,
        lastGrid: t.grid
      }, t, []);
    const o = t.context || { kind: "single", id: e.itemId }, u = o.kind !== "blocked" && !lt(e.originGrid, t.grid), v = {
      status: "active-drag",
      revision: e.revision + 1,
      interactionId: e.interactionId,
      itemId: e.itemId,
      context: o,
      startGrid: e.originGrid,
      lastGrid: t.grid,
      moved: u,
      previewSeq: u ? 1 : 0
    }, C = [
      {
        type: "EMIT_DRAG_START",
        interactionId: e.interactionId,
        itemId: e.itemId,
        grid: e.originGrid,
        context: o
      }
    ];
    return u && C.push({
      type: "EMIT_DRAG",
      interactionId: e.interactionId,
      itemId: e.itemId,
      grid: t.grid,
      context: o
    }, {
      type: "PREVIEW_DRAG",
      interactionId: e.interactionId,
      requestId: Be(e.interactionId, "drag-preview", 1),
      itemId: e.itemId,
      grid: t.grid,
      context: o
    }), le(e, v, t, C);
  }
  if (e.status !== "active-drag") return Ce(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return Me(e, t);
  if (e.context.kind === "blocked")
    return le(e, {
      ...e,
      revision: e.revision + 1,
      lastGrid: t.grid
    }, t, []);
  if (lt(e.lastGrid, t.grid))
    return le(e, { ...e, revision: e.revision + 1 }, t, []);
  const r = e.previewSeq + 1, l = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    moved: !0,
    previewSeq: r
  };
  return le(e, l, t, [
    {
      type: "EMIT_DRAG",
      interactionId: e.interactionId,
      itemId: e.itemId,
      grid: t.grid,
      context: e.context
    },
    {
      type: "PREVIEW_DRAG",
      interactionId: e.interactionId,
      requestId: Be(e.interactionId, "drag-preview", r),
      itemId: e.itemId,
      grid: t.grid,
      context: e.context
    }
  ]);
}
function bn(e, t) {
  if (e.status === "pending-drag")
    return e.interactionId !== t.interactionId ? Me(e, t) : le(e, Ye(e), t, [
      {
        type: "CLEAR_TRANSIENT",
        interactionId: t.interactionId,
        kind: "drag",
        reason: "click-like"
      }
    ]);
  if (e.status !== "active-drag") return Ce(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return Me(e, t);
  if (!e.moved)
    return le(e, Ye(e), t, [
      {
        type: "EMIT_DRAG_STOP",
        interactionId: e.interactionId,
        itemId: e.itemId,
        grid: t.grid,
        context: e.context
      },
      {
        type: "CLEAR_TRANSIENT",
        interactionId: t.interactionId,
        kind: "drag",
        reason: "drag-noop"
      }
    ]);
  const n = Be(e.interactionId, "drag-commit", e.previewSeq + 1);
  return le(e, {
    status: "committing",
    revision: e.revision + 1,
    interactionId: e.interactionId,
    kind: "drag",
    requestId: n,
    previous: e
  }, t, [
    {
      type: "COMMIT_DRAG",
      interactionId: e.interactionId,
      requestId: n,
      itemId: e.itemId,
      grid: t.grid,
      context: e.context
    }
  ]);
}
function xn(e, t) {
  if (e.status !== "idle") return Ce(e, t, "already-active");
  const n = {
    status: "active-resize",
    revision: e.revision + 1,
    interactionId: t.interactionId,
    itemId: t.itemId,
    handle: t.handle,
    start: t.geometry,
    last: t.geometry,
    resized: !1,
    previewSeq: 0
  };
  return le(e, n, t, [
    {
      type: "EMIT_RESIZE_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      handle: t.handle,
      geometry: t.geometry
    }
  ]);
}
function En(e, t) {
  if (e.status !== "active-resize") return Ce(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Me(e, t);
  if (Ut(e.last, t.geometry))
    return le(e, { ...e, revision: e.revision + 1 }, t, []);
  const n = e.previewSeq + 1, r = {
    ...e,
    revision: e.revision + 1,
    last: t.geometry,
    resized: !0,
    previewSeq: n
  };
  return le(e, r, t, [
    {
      type: "EMIT_RESIZE",
      interactionId: e.interactionId,
      itemId: e.itemId,
      handle: e.handle,
      geometry: t.geometry
    },
    {
      type: "PREVIEW_RESIZE",
      interactionId: e.interactionId,
      requestId: Be(e.interactionId, "resize-preview", n),
      itemId: e.itemId,
      handle: e.handle,
      geometry: t.geometry
    }
  ]);
}
function zn(e, t) {
  if (e.status !== "active-resize") return Ce(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Me(e, t);
  if (!e.resized && Ut(e.start, t.geometry))
    return le(e, Ye(e), t, [
      {
        type: "EMIT_RESIZE_STOP",
        interactionId: e.interactionId,
        itemId: e.itemId,
        handle: e.handle,
        geometry: t.geometry
      },
      {
        type: "CLEAR_TRANSIENT",
        interactionId: t.interactionId,
        kind: "resize",
        reason: "resize-noop"
      }
    ]);
  const n = Be(e.interactionId, "resize-commit", e.previewSeq + 1);
  return le(e, {
    status: "committing",
    revision: e.revision + 1,
    interactionId: e.interactionId,
    kind: "resize",
    requestId: n,
    previous: e
  }, t, [
    {
      type: "COMMIT_RESIZE",
      interactionId: e.interactionId,
      requestId: n,
      itemId: e.itemId,
      handle: e.handle,
      geometry: t.geometry
    }
  ]);
}
function Ln(e, t) {
  if (e.status !== "idle") return Ce(e, t, "already-active");
  const n = t.strategy || "cursor", r = {
    status: "active-drop",
    revision: e.revision + 1,
    interactionId: t.interactionId,
    itemId: t.itemId,
    lastGrid: t.grid,
    lastSize: t.size,
    strategy: n,
    previewSeq: t.grid && t.size ? 1 : 0
  }, l = t.grid && t.size ? [{
    type: "PREVIEW_DROP",
    interactionId: t.interactionId,
    requestId: Be(t.interactionId, "drop-preview", 1),
    itemId: t.itemId,
    grid: t.grid,
    size: t.size,
    strategy: n
  }] : [];
  return le(e, r, t, l);
}
function Cn(e, t) {
  if (e.status !== "active-drop") return Ce(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Me(e, t);
  const n = t.strategy || e.strategy || "cursor";
  if (e.lastGrid && e.lastSize && lt(e.lastGrid, t.grid) && $t(e.lastSize, t.size) && e.strategy === n)
    return le(e, { ...e, revision: e.revision + 1 }, t, []);
  const r = e.previewSeq + 1, l = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    lastSize: t.size,
    strategy: n,
    previewSeq: r
  };
  return le(e, l, t, [
    {
      type: "PREVIEW_DROP",
      interactionId: e.interactionId,
      requestId: Be(e.interactionId, "drop-preview", r),
      itemId: e.itemId,
      grid: t.grid,
      size: t.size,
      strategy: n
    }
  ]);
}
function Tt(e, t, n) {
  return e.status !== "active-drop" ? Ce(e, t, "wrong-kind") : e.interactionId !== t.interactionId ? Me(e, t) : le(e, Ye(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId,
      kind: "drop",
      reason: n
    }
  ]);
}
function Pn(e, t) {
  if (e.status !== "active-drop") return Ce(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Me(e, t);
  const n = Be(e.interactionId, "drop-commit", e.previewSeq + 1);
  return le(e, {
    status: "committing",
    revision: e.revision + 1,
    interactionId: e.interactionId,
    kind: "drop",
    requestId: n,
    previous: e
  }, t, [
    {
      type: "COMMIT_DROP",
      interactionId: e.interactionId,
      requestId: n,
      itemId: e.itemId
    }
  ]);
}
function Tn(e, t) {
  if (e.status !== "committing") return Ce(e, t, "not-committing");
  if (e.interactionId !== t.interactionId || e.requestId !== t.requestId)
    return Me(e, t);
  const n = [];
  return e.previous.status === "active-drag" ? n.push({
    type: "EMIT_DRAG_STOP",
    interactionId: e.interactionId,
    itemId: e.previous.itemId,
    grid: e.previous.lastGrid,
    context: e.previous.context
  }) : e.previous.status === "active-resize" && n.push({
    type: "EMIT_RESIZE_STOP",
    interactionId: e.interactionId,
    itemId: e.previous.itemId,
    handle: e.previous.handle,
    geometry: e.previous.last
  }), n.push(
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId,
      kind: e.kind,
      reason: `commit-${t.status}`
    }
  ), le(e, Ye(e), t, n);
}
function kn(e, t) {
  return e.status === "idle" ? le(e, e, t, []) : t.interactionId && ct(e) !== t.interactionId ? Me(e, t) : le(e, Ye(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId || ct(e),
      kind: yt(e),
      reason: t.reason || "cancelled"
    }
  ], "cancelled");
}
function Ce(e, t, n) {
  return {
    state: e,
    effects: [
      {
        type: "REJECT_TRANSITION",
        from: e.status,
        event: t.type,
        reason: n
      }
    ],
    diagnostics: [
      It(e, e, t, n)
    ]
  };
}
function Me(e, t) {
  const n = "interactionId" in t ? t.interactionId : ct(e), r = "requestId" in t ? t.requestId : void 0;
  return {
    state: e,
    effects: [
      {
        type: "IGNORE_STALE",
        interactionId: n || "unknown",
        requestId: r,
        reason: "stale-event"
      }
    ],
    diagnostics: [
      It(e, e, t, "stale-event")
    ]
  };
}
function le(e, t, n, r, l) {
  return {
    state: t,
    effects: r,
    diagnostics: [
      It(e, t, n, l)
    ]
  };
}
function Ye(e) {
  return {
    status: "idle",
    revision: e.revision + 1
  };
}
function It(e, t, n, r) {
  return {
    interactionId: "interactionId" in n ? n.interactionId : ct(e),
    requestId: "requestId" in n ? n.requestId : void 0,
    from: e.status,
    to: t.status,
    event: n.type,
    kind: yt(t) || yt(e),
    itemId: kt(t) || kt(e),
    reason: r
  };
}
function ct(e) {
  return e.status === "idle" ? void 0 : e.interactionId;
}
function kt(e) {
  if (!(e.status === "idle" || e.status === "committing"))
    return e.itemId;
}
function yt(e) {
  if (e.status === "pending-drag" || e.status === "active-drag") return "drag";
  if (e.status === "active-resize") return "resize";
  if (e.status === "active-drop") return "drop";
  if (e.status === "committing") return e.kind;
}
function Be(e, t, n) {
  return `${e}:${t}:${n}`;
}
function lt(e, t) {
  return e.x === t.x && e.y === t.y;
}
function $t(e, t) {
  return e.w === t.w && e.h === t.h;
}
function Ut(e, t) {
  return lt(e, t) && $t(e, t);
}
const ut = (e, t, n, r) => Ft(e, t.top, t.left, n, r), An = (e) => {
  const t = e.pointerType;
  return t ? vn(t) : "touches" in e || "changedTouches" in e ? "touch" : "mouse";
};
function _n({
  attrs: e,
  elementRef: t,
  positionParams: n,
  props: r,
  state: l
}) {
  let s = 0, o = at(), u = null;
  const v = () => !!(e.onDragStart || e.onDrag || e.onDragStop), C = () => {
    o = at(), u = null;
  }, p = (A, { node: I }, h = !1) => {
    var M;
    if (!v()) return;
    const a = Ze(
      n.value,
      r.x,
      r.y,
      r.w,
      r.h,
      l
    ), d = { top: a.top, left: a.left }, { x: S, y: c } = ut(
      n.value,
      d,
      r.w,
      r.h
    ), D = `item-drag:${r.i}:${++s}`, T = h ? 0 : r.dragActivationDistance, w = it(o, {
      type: "ARM_DRAG",
      interactionId: D,
      itemId: r.i,
      pointerKind: An(A),
      originPx: { x: d.left, y: d.top },
      originGrid: { x: S, y: c }
    }, { dragActivationDistance: T });
    o = w.state, u = {
      interactionId: D,
      originGrid: { x: S, y: c },
      originPosition: d,
      currentPosition: d,
      node: I,
      e: A
    }, w.effects.some((ee) => ee.type === "EMIT_DRAG_START") && (l.dragging = d, (M = e.onDragStart) == null || M.call(e, r.i, S, c, {
      e: A,
      node: I,
      newPosition: d
    }));
  }, m = (A, I) => {
    let { top: h, left: a } = I;
    const { isBounded: d, w: S, h: c, containerWidth: D } = r;
    if (!d) return I;
    const { offsetParent: T } = A;
    if (!T) return I;
    const { margin: w, rowHeight: V } = r, M = T.clientHeight - xt(
      c,
      V,
      w[1],
      n.value.renderPrecision
    );
    h = ot(h, 0, M);
    const ee = jt(n.value), j = D - xt(S, ee, w[0], n.value.renderPrecision);
    return a = ot(a, 0, j), { top: h, left: a };
  }, R = (A, { node: I, deltaX: h, deltaY: a }) => {
    var w, V;
    if (!v()) return;
    if (!u && !l.dragging)
      throw new Error("onDrag called before onDragStart.");
    const d = l.dragging || (u == null ? void 0 : u.currentPosition);
    if (!d) return;
    const S = m(I, {
      top: d.top + a,
      left: d.left + h
    });
    u && (u.currentPosition = S, u.node = I, u.e = A);
    const { x: c, y: D } = ut(
      n.value,
      S,
      r.w,
      r.h
    );
    if (!u) return;
    const T = it(o, {
      type: "MOVE_DRAG",
      interactionId: u.interactionId,
      currentPx: { x: S.left, y: S.top },
      grid: { x: c, y: D }
    }, { dragActivationDistance: r.dragActivationDistance });
    o = T.state;
    for (const M of T.effects)
      M.type === "EMIT_DRAG_START" && (l.dragging = u.originPosition, (w = e.onDragStart) == null || w.call(e, r.i, u.originGrid.x, u.originGrid.y, {
        e: u.e,
        node: u.node,
        newPosition: u.originPosition
      })), M.type === "EMIT_DRAG" && (l.dragging = S, (V = e.onDrag) == null || V.call(e, r.i, c, D, {
        e: A,
        node: I,
        newPosition: S
      }));
    T.state.status === "active-drag" && (l.dragging = S);
  };
  return {
    moveDroppingItem: (A) => {
      const { droppingPosition: I } = r;
      if (!I) return;
      const h = t.value;
      if (!h) return;
      const a = A || { left: 0, top: 0 }, { dragging: d } = l, S = d && I.left !== a.left || I.top !== a.top;
      if (!d)
        p(I.e, {
          node: h,
          deltaX: I.left,
          deltaY: I.top
        }, !0);
      else if (S) {
        const c = I.left - d.left, D = I.top - d.top;
        R(I.e, {
          node: h,
          deltaX: c,
          deltaY: D
        });
      }
    },
    onDrag: R,
    onDragStart: p,
    onDragStop: (A, { node: I }) => {
      var T;
      if (!v()) return;
      if (!u && !l.dragging)
        throw new Error("onDragEnd called before onDragStart.");
      const h = l.dragging || (u == null ? void 0 : u.currentPosition);
      if (!h) return;
      const a = {
        top: h.top,
        left: h.left
      }, { x: d, y: S } = ut(
        n.value,
        a,
        r.w,
        r.h
      ), c = o.status === "active-drag", D = u == null ? void 0 : u.interactionId;
      D && (o = it(o, {
        type: "STOP_DRAG",
        interactionId: D,
        grid: { x: d, y: S }
      }, { dragActivationDistance: r.dragActivationDistance }).state), l.dragging = null, c && ((T = e.onDragStop) == null || T.call(e, r.i, d, S, {
        e: A,
        node: I,
        newPosition: a
      })), C();
    }
  };
}
function Mn({
  attrs: e,
  positionParams: t,
  props: n,
  state: r
}) {
  const l = pt(() => {
    const { cols: p, minW: m, minH: R, maxW: y, maxH: G } = n, A = t.value, I = Ze(A, 0, 0, p, 0).width, h = Ze(A, 0, 0, m, R), a = Ze(A, 0, 0, y, G);
    return {
      minConstraints: [h.width, h.height],
      maxConstraints: [
        Math.min(a.width, I),
        Math.min(a.height, 1 / 0)
      ]
    };
  }), s = (p, { node: m, size: R, handle: y }, G, A) => {
    const I = e[A];
    if (!I) return;
    const { x: h, y: a, i: d, maxH: S, minH: c, maxW: D, minW: T, containerWidth: w } = n;
    let V = R;
    m && (V = nn(
      y,
      G,
      R,
      w
    ), r.resizing = A === "onResizeStop" ? null : V);
    let { w: M, h: ee } = gn(
      t.value,
      V.width,
      V.height,
      h,
      a,
      y
    );
    M = ot(M, Math.max(T, 1), D), ee = ot(ee, c, S), I.call(void 0, d, M, ee, { e: p, node: m, size: V, handle: y });
  };
  return {
    curryResizeHandler: (p, m) => (R, y) => m(R, y, p),
    onResize: (p, m, R) => s(p, m, R, "onResize"),
    onResizeStart: (p, m, R) => s(p, m, R, "onResizeStart"),
    onResizeStop: (p, m, R) => s(p, m, R, "onResizeStop"),
    resizeConstraints: l
  };
}
function Gn(e, {
  containerWidth: t,
  useCSSTransforms: n,
  usePercentages: r
}) {
  if (n)
    return rn(e);
  const l = on(e);
  return r && (l.left = St(e.left / t), l.width = St(e.width / t)), l;
}
function On({
  childClass: e,
  className: t,
  dropping: n,
  hasDragHandle: r,
  isDragBlocked: l,
  isDraggable: s,
  isDragging: o,
  isResizeBlocked: u,
  isResizing: v,
  isStatic: C,
  useCSSTransforms: p
}) {
  return mt(
    "vue-grid-item",
    e,
    t,
    {
      static: C,
      resizing: v,
      "vue-draggable": s,
      "has-drag-handle": r,
      "drag-blocked": l,
      "resize-blocked": u,
      "vue-draggable-dragging": o,
      dropping: n,
      cssTransforms: p
    }
  );
}
function Hn(e, t, n) {
  return {
    ...e || {},
    ...t && typeof t == "object" ? t : {},
    ...n
  };
}
function qn(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Wt(e);
}
const Nn = "GridItem", At = /* @__PURE__ */ Ot({
  name: Nn,
  inheritAttrs: !1,
  props: {
    cols: {
      type: Number,
      required: !0
    },
    containerWidth: {
      type: Number,
      required: !0
    },
    rowHeight: {
      type: Number,
      required: !0
    },
    dragActivationDistance: {
      type: [Number, Object],
      default: void 0
    },
    renderPrecision: {
      type: String,
      default: "integer"
    },
    margin: {
      type: Array,
      required: !0
    },
    maxRows: {
      type: Number,
      required: !0
    },
    containerPadding: {
      type: Array,
      required: !0
    },
    x: {
      type: Number,
      required: !0
    },
    y: {
      type: Number,
      required: !0
    },
    w: {
      type: Number,
      required: !0
    },
    h: {
      type: Number,
      required: !0
    },
    minW: {
      type: Number,
      default: 1
    },
    // Custom validation can be added in `mounted` or a method
    maxW: {
      type: Number,
      default: 1 / 0
    },
    // Custom validation can be added in `mounted` or a method
    minH: {
      type: Number,
      default: 1
    },
    // Custom validation can be added in `mounted` or a method
    maxH: {
      type: Number,
      default: 1 / 0
    },
    // Custom validation can be added in `mounted` or a method
    i: {
      type: String,
      required: !0
    },
    resizeHandles: hn,
    // Define more specific type if necessary
    resizeHandle: Zt,
    // Define more specific type if necessary
    onItemClick: {
      type: Function,
      default: void 0
    },
    isDraggable: {
      type: Boolean,
      required: !0
    },
    isResizable: {
      type: Boolean,
      required: !0
    },
    isBounded: {
      type: Boolean,
      required: !0
    },
    isDragBlocked: {
      type: Boolean,
      default: !1
    },
    isResizeBlocked: {
      type: Boolean,
      default: !1
    },
    static: Boolean,
    useCSSTransforms: {
      type: Boolean,
      required: !0
    },
    transformScale: {
      type: Number,
      default: 1
    },
    class: {
      type: String,
      default: ""
    },
    handle: {
      type: String,
      default: ""
    },
    cancel: {
      type: String,
      default: ""
    },
    cancelInteractiveElements: {
      type: Boolean,
      default: !0
    },
    droppingPosition: {
      type: Object,
      default: null
    },
    usePercentages: {
      type: Boolean
    },
    style: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, {
    slots: t,
    attrs: n
  }) {
    const r = n, l = Ht({
      resizing: null,
      dragging: null,
      className: ""
    }), s = ke(null), o = pt(() => ({
      cols: e.cols,
      containerPadding: e.containerPadding,
      containerWidth: e.containerWidth,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      renderPrecision: e.renderPrecision
    })), u = _n({
      attrs: r,
      elementRef: s,
      positionParams: o,
      props: e,
      state: l
    }), v = Mn({
      attrs: r,
      positionParams: o,
      props: e,
      state: l
    }), C = (m, R, y) => Ve(dn, {
      disabled: !R,
      startFn: u.onDragStart,
      dragFn: u.onDrag,
      stopFn: u.onDragStop,
      handle: e.handle,
      cancel: `.vue-resizable-handle${e.cancel ? `,${e.cancel}` : ""}`,
      cancelInteractiveElements: e.cancelInteractiveElements,
      scale: e.transformScale,
      nodeRef: s,
      enableClickSuppression: !0
    }, {
      default: () => [Ve("div", Bt({
        ref: s
      }, y), [m])]
    });
    Je(() => e.droppingPosition, (m, R) => {
      u.moveDroppingItem(R);
    });
    const p = (m, R, y) => {
      let G;
      const {
        transformScale: A,
        resizeHandles: I,
        resizeHandle: h
      } = e, {
        minConstraints: a,
        maxConstraints: d
      } = v.resizeConstraints.value;
      return Ve(fn, {
        draggableOpts: {
          disabled: !y
        },
        className: y ? void 0 : "vue-resizable-hide",
        width: R.width,
        height: R.height,
        minConstraints: a,
        maxConstraints: d,
        fnResizeStop: v.curryResizeHandler(R, v.onResizeStop),
        fnResizeStart: v.curryResizeHandler(R, v.onResizeStart),
        fnResize: v.curryResizeHandler(R, v.onResize),
        transformScale: A,
        resizeHandles: I,
        handle: h
      }, qn(G = Nt(m, {
        style: {
          height: "100%"
        }
      })) ? G : {
        default: () => [G]
      });
    };
    return qt(() => {
      u.moveDroppingItem();
    }), () => {
      var D, T;
      const {
        x: m,
        y: R,
        w: y,
        isDraggable: G,
        isResizable: A,
        droppingPosition: I,
        useCSSTransforms: h
      } = e, a = Ze(o.value, m, R, y, e.h, l), d = t.default ? t.default()[0] : null;
      if (!d) return null;
      const S = {
        class: On({
          childClass: (D = d.props) == null ? void 0 : D.class,
          className: e.class,
          dropping: !!I,
          hasDragHandle: !!e.handle,
          isDragBlocked: e.isDragBlocked,
          isDraggable: G,
          isDragging: !!l.dragging,
          isResizeBlocked: e.isResizeBlocked,
          isResizing: !!l.resizing,
          isStatic: e.static,
          useCSSTransforms: h
        }),
        onClick: e.onItemClick,
        style: Hn(e.style, (T = d.props) == null ? void 0 : T.style, Gn(a, {
          containerWidth: e.containerWidth,
          useCSSTransforms: h,
          usePercentages: e.usePercentages
        }))
      };
      let c = p(d, a, A);
      return c = C(c, G, S), c;
    };
  }
}), Bn = [
  "update:modelValue",
  "layoutChange",
  "dragStart",
  "drag",
  "dragStop",
  "resizeStart",
  "resize",
  "resizeStop",
  "drop",
  "dropDragOver",
  "heightRuntimeChange"
], Wn = {
  "update:modelValue": ["onUpdate:modelValue"],
  layoutChange: ["onLayoutChange", "onLayout-change"],
  dragStart: ["onDragStart", "onDrag-start"],
  drag: ["onDrag"],
  dragStop: ["onDragStop", "onDrag-stop"],
  resizeStart: ["onResizeStart", "onResize-start"],
  resize: ["onResize"],
  resizeStop: ["onResizeStop", "onResize-stop"],
  drop: ["onDrop"],
  dropDragOver: ["onDropDragOver", "onDrop-drag-over"],
  heightRuntimeChange: ["onHeightRuntimeChange", "onHeight-runtime-change"]
};
function Vn(e) {
  const t = {};
  let n, r;
  return Object.keys(e).forEach((l) => {
    const s = e[l];
    if (l === "class") {
      n = s;
      return;
    }
    if (l === "style") {
      r = s;
      return;
    }
    /^on[A-Z]/.test(l) || (t[l] = s);
  }), {
    attrs: t,
    class: n,
    style: r
  };
}
function Xt(e, t) {
  return e ? Array.isArray(e) ? e.flatMap((n) => Xt(n, t)) : typeof e == "function" ? [e(...t)] : [] : [];
}
function Fn(e, t, n) {
  const r = (e == null ? void 0 : e.vnode.props) || {}, l = Wn[t] || [];
  let s;
  return l.forEach((o) => {
    Xt(r[o], n).forEach((v) => {
      if (v === !1) {
        s = !1;
        return;
      }
      s !== !1 && v != null && (s = v);
    });
  }), s;
}
function jn(e, t) {
  const n = (r) => (l, s, o, u, v, C) => {
    e(r, l, s, o, u, v, C);
  };
  return {
    emitModelValue(r) {
      e("update:modelValue", r);
    },
    emitLayoutChange(r) {
      e("layoutChange", r);
    },
    emitDragStart: n("dragStart"),
    emitDrag: n("drag"),
    emitDragStop: n("dragStop"),
    emitResizeStart: n("resizeStart"),
    emitResize: n("resize"),
    emitResizeStop: n("resizeStop"),
    emitDrop(r, l, s) {
      e("drop", r, l, s);
    },
    emitHeightRuntimeChange(r) {
      e("heightRuntimeChange", r);
    },
    callDropDragOver(r) {
      const l = Fn(t, "dropDragOver", [r]);
      if (l === !1) return !1;
      if (l && typeof l == "object")
        return l;
    }
  };
}
function Zn({
  props: e,
  emitModelValue: t,
  emitLayoutChange: n
}) {
  const r = Ht({
    activeDrag: null,
    layout: Y(je(e.modelValue || [])),
    mounted: !1,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    resizing: !1,
    droppingDOMNode: null,
    droppingPosition: void 0,
    externalDropSession: null,
    suppressLayoutChange: !1,
    compactType: e.compactType,
    children: Y([])
  });
  let l = je(e.modelValue || []);
  const s = (v, C) => {
    C || (C = r.layout), tt(C, v) || (n(v), t(v));
  };
  return Je(
    () => r.layout,
    (v, C) => {
      if (r.suppressLayoutChange) {
        r.suppressLayoutChange = !1;
        return;
      }
      if (r.activeDrag || r.externalDropSession || r.droppingDOMNode || r.droppingPosition) return;
      const p = r.oldLayout;
      if (p) {
        r.oldLayout = null, s(v, p);
        return;
      }
      s(v, C);
    }
  ), {
    state: r,
    onLayoutMaybeChanged: s,
    syncRenderedChildren: (v, C = {}) => {
      var I, h;
      if (an(v, r.children))
        return r.layout;
      r.children = Y(v);
      const p = new Set(r.layout.map((a) => a.i)), m = new Set((e.modelValue || []).map((a) => a.i)), y = v.some(
        (a) => (a == null ? void 0 : a.key) != null && !p.has(String(a.key)) && m.has(String(a.key))
      ) ? e.modelValue : r.layout, G = bt(
        y,
        v,
        e.cols,
        Ee(e),
        e.allowOverlap
      ), A = (I = C.reconcileSynchronizedLayout) == null ? void 0 : I.call(C, G);
      return A != null && A.clearActive ? (r.activeDrag = null, (h = C.clearActiveInteraction) == null || h.call(C)) : A && "placeholder" in A && (r.activeDrag = A.placeholder ? Y(A.placeholder) : null), tt(G, r.layout) || (r.layout = Y(G)), r.compactType = e.compactType, G;
    },
    watchLayoutDependencies: (v = {}) => Je(
      () => ({
        compactType: e.compactType,
        modelValue: e.modelValue,
        verticalCompact: e.verticalCompact,
        cols: e.cols,
        allowOverlap: e.allowOverlap
      }),
      (C, p) => {
        var I, h;
        const m = !tt(C.modelValue, l), R = tt(C.modelValue, r.layout), y = C.compactType === p.compactType && C.cols === p.cols && C.allowOverlap === p.allowOverlap && C.verticalCompact === p.verticalCompact;
        if (!m && y || (l = je(C.modelValue || []), R && y))
          return;
        const G = bt(
          C.modelValue,
          r.children,
          C.cols,
          Ee(C),
          C.allowOverlap
        ), A = (I = v.reconcileSynchronizedLayout) == null ? void 0 : I.call(v, G);
        A != null && A.clearActive ? (r.activeDrag = null, (h = v.clearActiveInteraction) == null || h.call(v)) : A && "placeholder" in A && (r.activeDrag = A.placeholder ? Y(A.placeholder) : null), s(G, r.layout), r.layout = Y(G), r.compactType = C.compactType;
      },
      { deep: !0 }
    ),
    stop: () => {
    }
  };
}
const _t = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, st = (e) => e ? { x: e.x, y: e.y } : void 0;
function Yn({
  id: e,
  interactionId: t,
  sourceItem: n,
  baseLayout: r,
  strategy: l,
  target: s
}) {
  const o = e || String(n.i), u = r.filter((C) => C.i !== o), v = {
    ...n,
    i: o,
    x: typeof n.x == "number" ? n.x : 0,
    y: typeof n.y == "number" ? n.y : 0,
    w: n.w,
    h: n.h,
    static: !1
  };
  return s && (v.x = s.x, v.y = s.y), {
    id: o,
    interactionId: t,
    sourceItem: n,
    resolvedItem: v,
    ghostItem: null,
    baseLayout: u,
    previewLayout: u,
    target: st(s),
    strategy: l,
    status: "entered"
  };
}
function $n(e, {
  overrides: t,
  target: n,
  strategy: r,
  baseLayout: l,
  snapCandidate: s
}) {
  const o = {
    ...e.resolvedItem,
    i: e.id,
    static: !1
  };
  _t(t == null ? void 0 : t.w) && (o.w = t.w), _t(t == null ? void 0 : t.h) && (o.h = t.h), n && (o.x = n.x, o.y = n.y);
  const u = l ? l.filter((C) => C.i !== e.id) : e.baseLayout, v = s ? s(e.id, o, o, u) : o;
  return {
    ...e,
    status: "previewing",
    blocked: void 0,
    resolvedItem: qe(v),
    baseLayout: u,
    previewLayout: u,
    target: st(n || { x: v.x, y: v.y }),
    strategy: r || e.strategy
  };
}
function Mt(e, t) {
  const n = t === "commit" && e.ghostItem || e.resolvedItem, r = st(t === "commit" && e.ghostItem || e.target), l = {
    type: "dropFit",
    item: {
      i: e.id,
      w: n.w,
      h: n.h
    },
    strategy: r ? "cursor" : e.strategy
  };
  return r && (l.target = r), l;
}
function Un(e, t) {
  var l, s, o, u;
  if (t.status === "blocked" || t.status === "cancelled" || t.status === "error" || !t.placeholder)
    return Jt(e, ((l = t.drop) == null ? void 0 : l.reason) || ((s = t.blocked) == null ? void 0 : s.reason) || "no-fit", {
      geometry: t.placeholder || e.ghostItem || e.resolvedItem,
      message: (o = t.error) == null ? void 0 : o.message,
      itemIds: (u = t.blocked) == null ? void 0 : u.itemIds
    });
  const n = qe(t.placeholder);
  return {
    ...e,
    status: "ready",
    blocked: void 0,
    ghostItem: n,
    previewLayout: t.layout || e.baseLayout,
    target: { x: n.x, y: n.y }
  };
}
function Jt(e, t, n = {}) {
  const r = n.geometry ? qe({
    ...n.geometry,
    i: e.id
  }) : e.ghostItem;
  return {
    ...e,
    status: "blocked",
    blocked: {
      reason: t,
      message: n.message,
      itemIds: n.itemIds
    },
    ghostItem: r,
    previewLayout: e.baseLayout,
    target: r ? { x: r.x, y: r.y } : e.target
  };
}
function Xn(e, t) {
  const n = t.placeholder || e.ghostItem || e.resolvedItem, r = n ? qe(n) : void 0;
  r && (delete r.isDraggable, delete r.isResizable);
  const l = t.layout && t.layout.length > 0 ? t.layout : [...e.baseLayout, r];
  return {
    committedLayout: l,
    committedItem: r,
    eventLayout: l.filter((s) => s.i !== e.id)
  };
}
function Jn(e, t) {
  const n = e.externalDropSession;
  return !n || n.previewLayout.length === 0 ? t : t.map(
    (r) => n.previewLayout.find((l) => l.i === r.i) || r
  );
}
function Kn({
  props: e,
  getLayout: t
}) {
  const n = () => e.layoutEngine && typeof e.layoutEngine == "object" ? e.layoutEngine : null, r = () => {
    const c = n();
    return e.layoutEngine === !1 || (c == null ? void 0 : c.mode) === "legacy";
  };
  let l, s = Et();
  const o = () => {
    var T;
    const c = n(), D = c == null ? void 0 : c.executor;
    return D !== l && ((T = s.dispose) == null || T.call(s), s = Et(D), l = D), s;
  };
  let u, v = Lt();
  const C = () => {
    const c = n(), D = c == null ? void 0 : c.scheduler;
    return D !== u && (v.cancel("scheduler reconfigured"), v = Lt(D), u = D), v;
  }, p = () => {
    const c = n();
    return {
      cols: e.cols,
      maxRows: e.maxRows,
      compactType: Ee(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      scheduler: c == null ? void 0 : c.scheduler,
      executor: o(),
      compareLegacy: c == null ? void 0 : c.compareLegacy,
      legacyFallback: (c == null ? void 0 : c.legacyFallback) !== !1,
      diagnostics: c == null ? void 0 : c.diagnostics,
      onEvent: c == null ? void 0 : c.onEvent
    };
  };
  let m = zt(
    t(),
    p()
  );
  const R = (c = t()) => {
    m.dispose(), m = zt(c, p());
  }, y = (c, D) => {
    var w, V, M;
    if (!p().compareLegacy || c.phase === "preview" && ((w = D.diagnostics) == null ? void 0 : w.schedulerMode) === "commitOnly") return;
    const T = pn(c, D);
    T.matches || (M = (V = p()).onEvent) == null || M.call(V, {
      type: "legacy-mismatch",
      id: c.id,
      message: "VueGridLayout layout engine result differs from legacy path",
      diagnostics: D.diagnostics,
      details: T.differences
    });
  }, G = (c, D, T) => {
    var w, V, M;
    !T || ((w = D.diagnostics) == null ? void 0 : w.executorKind) !== "worker" || (M = (V = p()).onEvent) == null || M.call(V, {
      type: "operation",
      id: D.id,
      operationType: c.operation.type,
      phase: c.phase,
      diagnostics: D.diagnostics
    });
  }, A = (c) => o().kind === "main-thread" || c.phase === "preview" && (c.operation.type === "move" || c.operation.type === "resize" || c.operation.type === "groupMove") ? !1 : c.phase === "commit" || !!c.heavy || c.operation.type === "dropFit" || c.operation.type === "generateResponsiveLayout" || c.operation.type === "groupMove", I = (c) => A(c) ? o().execute(c) : yn(c), h = (c, D) => {
    let T = null;
    const w = A(c);
    return C().schedule(
      c,
      I,
      (V) => {
        var ee;
        const M = m.applyAsyncResult(V);
        C().recordDuration(((ee = M.diagnostics) == null ? void 0 : ee.durationMs) || 0), G(c, M, w), y(c, M), D(M), T = M;
      }
    ), T;
  };
  return {
    getLayoutEngineProp: n,
    getLayoutEngineOptions: p,
    isLegacyLayoutEngine: r,
    reset: R,
    start: (c) => m.start(c),
    rebase: (c) => m.rebase(c),
    getCommitted: () => m.getCommitted(),
    preview: (c, D, T, w = !1) => {
      var M;
      const V = {
        id: c,
        operation: D,
        baseRevision: (M = m.getState().interaction) == null ? void 0 : M.startRevision,
        heavy: w
      };
      return h(m.preparePreview(V), T);
    },
    commit: (c, D, T, w = !1) => {
      var M;
      const V = {
        id: c,
        operation: D,
        baseRevision: (M = m.getState().interaction) == null ? void 0 : M.startRevision,
        heavy: w
      };
      return h(m.prepareCommit(V), T);
    },
    dispose: (c = "component disposed") => {
      var D;
      v.cancel(c), (D = s.dispose) == null || D.call(s), m.dispose();
    }
  };
}
function Qn({
  getLayout: e,
  setLayout: t,
  setActiveDrag: n
}) {
  const r = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let l = null, s = null;
  const o = () => {
    s != null && r && cancelAnimationFrame(s), s = null, l = null;
  }, u = (p) => {
    for (let m = 0; m < p.length; m++) {
      const R = p[m];
      R.moved && (R.moved = !1);
    }
  }, v = () => {
    s = null;
    const p = l;
    if (l = null, !p) return;
    p.layout && p.layout !== e() && t(p.layout), p.shouldCompact && cn(e(), p.compactType, p.cols);
    const m = e(), R = he(m, p.placeholder.i);
    n(Y(
      R ? {
        ...p.placeholder,
        w: R.w,
        h: R.h,
        x: R.x,
        y: R.y
      } : p.placeholder
    ));
  };
  return {
    cancel: o,
    flush: v,
    schedule: (p) => {
      if (l = p, !r) {
        v();
        return;
      }
      s == null && (s = requestAnimationFrame(v));
    },
    resetMovedFlags: u
  };
}
const dt = {
  margin: 48,
  speed: 20
};
function er({
  getConfig: e,
  rootClassName: t
}) {
  const n = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let r = null, l = null, s = null, o = null;
  const u = () => {
    const I = e();
    if (!I) return null;
    if (I === !0) return dt;
    if (typeof I != "object") return null;
    const h = typeof I.margin == "number" && Number.isFinite(I.margin) ? I.margin : dt.margin, a = typeof I.speed == "number" && Number.isFinite(I.speed) ? I.speed : dt.speed;
    return h <= 0 || a <= 0 ? null : { margin: h, speed: a };
  }, v = () => {
    s != null && n && cancelAnimationFrame(s), s = null, o = null;
  }, C = () => {
    v(), l = null, r = null;
  }, p = (I) => {
    var d, S;
    const h = I;
    if (typeof h.clientX == "number" && typeof h.clientY == "number")
      return { x: h.clientX, y: h.clientY };
    const a = ((d = h.touches) == null ? void 0 : d[0]) || ((S = h.changedTouches) == null ? void 0 : S[0]);
    return a ? { x: a.clientX, y: a.clientY } : null;
  }, m = (I) => {
    const h = I.ownerDocument, a = h == null ? void 0 : h.defaultView;
    if (!a) return I;
    let d = I;
    for (; d; ) {
      const S = a.getComputedStyle(d), c = S.overflowY, D = S.overflowX, T = (c === "auto" || c === "scroll") && d.scrollHeight > d.clientHeight + 1, w = (D === "auto" || D === "scroll") && d.scrollWidth > d.clientWidth + 1;
      if (T || w) return d;
      d = d.parentElement;
    }
    return a;
  }, R = (I) => {
    var d;
    if (r = u(), l = null, v(), !r) return;
    const h = (d = I.closest) == null ? void 0 : d.call(I, `.${t}`), a = h instanceof HTMLElement ? h : I;
    l = m(a);
  }, y = () => {
    s = null;
    const I = o;
    if (o = null, !I) return;
    const { container: h, dx: a, dy: d } = I;
    a === 0 && d === 0 || (h instanceof HTMLElement ? typeof h.scrollBy == "function" ? h.scrollBy({ left: a, top: d }) : (h.scrollLeft += a, h.scrollTop += d) : h.scrollBy({ left: a, top: d }));
  }, G = (I, h, a) => {
    if (o = { container: I, dx: h, dy: a }, !n) {
      y();
      return;
    }
    s == null && (s = requestAnimationFrame(y));
  };
  return {
    init: R,
    maybeScroll: (I, h) => {
      r || (r = u());
      const a = r;
      if (!a) return;
      const d = p(I);
      if (!d) return;
      l || R(h);
      const S = l;
      if (!S) return;
      const c = (w) => {
        const V = Math.min(1, Math.max(0, w / a.margin));
        return V <= 0 ? 0 : Math.ceil(V * a.speed);
      };
      let D = 0, T = 0;
      if (S instanceof HTMLElement) {
        const w = S.getBoundingClientRect(), V = w.top + a.margin, M = w.bottom - a.margin, ee = w.left + a.margin, j = w.right - a.margin;
        d.y < V ? T = -c(V - d.y) : d.y > M && (T = c(d.y - M)), d.x < ee ? D = -c(ee - d.x) : d.x > j && (D = c(d.x - j)), T < 0 && S.scrollTop <= 0 && (T = 0), T > 0 && S.scrollTop + S.clientHeight >= S.scrollHeight && (T = 0), D < 0 && S.scrollLeft <= 0 && (D = 0), D > 0 && S.scrollLeft + S.clientWidth >= S.scrollWidth && (D = 0);
      } else {
        const w = S, V = a.margin, M = w.innerHeight - a.margin, ee = a.margin, j = w.innerWidth - a.margin;
        d.y < V ? T = -c(V - d.y) : d.y > M && (T = c(d.y - M)), d.x < ee ? D = -c(ee - d.x) : d.x > j && (D = c(d.x - j));
      }
      if (D === 0 && T === 0) {
        v();
        return;
      }
      G(S, D, T);
    },
    reset: C
  };
}
function ht({
  getDragActivationDistance: e,
  onEffects: t,
  onDiagnostics: n
} = {}) {
  const r = wt(at()), l = wt([]), s = (m) => ({
    dragActivationDistance: m && "dragActivationDistance" in m ? m.dragActivationDistance : e == null ? void 0 : e()
  }), o = (m, R) => {
    const y = it(r.value, m, s(R));
    return r.value = y.state, y.diagnostics.length > 0 && (l.value = l.value.concat(y.diagnostics), n == null || n(y.diagnostics)), y.effects.length > 0 && (t == null || t(y.effects, y)), y;
  };
  return {
    snapshot: r,
    diagnostics: l,
    dispatch: o,
    reset: (m = "reset") => {
      r.value.status !== "idle" && o({
        type: "CANCEL",
        interactionId: r.value.interactionId,
        reason: m
      }), r.value = at();
    },
    isCurrentRequest: (m, R) => r.value.status === "committing" && r.value.interactionId === m && r.value.requestId === R,
    isCurrentPreviewRequest: (m, R) => tr(r.value) === R && r.value.status !== "idle" && r.value.status !== "committing" && r.value.interactionId === m,
    isCurrentInteraction: (m, R) => {
      const y = r.value;
      return y.status === "idle" || y.interactionId !== m ? !1 : R ? y.status === "pending-drag" || y.status === "active-drag" ? R === "drag" : y.status === "active-resize" ? R === "resize" : y.status === "active-drop" ? R === "drop" : y.kind === R : !0;
    }
  };
}
function tr(e) {
  return e.status === "active-drag" ? `${e.interactionId}:drag-preview:${e.previewSeq}` : e.status === "active-resize" ? `${e.interactionId}:resize-preview:${e.previewSeq}` : e.status === "active-drop" ? `${e.interactionId}:drop-preview:${e.previewSeq}` : null;
}
const Gt = 200;
function nr({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: r,
  frameUpdate: l,
  autoScroll: s,
  editor: o,
  interactionMachine: u,
  nextInteractionRequestId: v,
  syncHistory: C,
  onLayoutMaybeChanged: p
}) {
  const m = ke(!1), R = ke(!1), y = ke(null), G = ke(null), A = ke(null), I = ke([]), h = ke(null);
  let a = null, d = !1, S = null, c = null, D;
  const T = () => r.getLayoutEngineProp(), w = () => r.isLegacyLayoutEngine(), V = (i) => r.reset(i), M = (...i) => r.preview(...i), ee = (...i) => r.commit(...i), j = u || ht({
    getDragActivationDistance: () => e.dragActivationDistance
  }), Ge = (i, E, L, O) => {
    let N = i.x, x = i.y, g = E, P = L;
    const $ = O === "sw" || O === "w" || O === "nw", J = O === "ne" || O === "n" || O === "nw";
    return $ && (N = i.x + (i.w - g), N < 0 && (N = 0, g = i.w)), J && (x = i.y + (i.h - P), x < 0 && (x = 0, P = i.h)), { ...i, x: N, y: x, w: g, h: P };
  }, Oe = () => {
    var i, E, L;
    return t.layout.length >= (((L = (E = (i = T()) == null ? void 0 : i.scheduler) == null ? void 0 : E.auto) == null ? void 0 : L.workerMinItems) || 1e3);
  }, F = () => {
    const i = e.width, E = e.containerPadding || e.margin;
    if (typeof i != "number" || !Number.isFinite(i) || i <= 0 || e.cols <= 0 || e.rowHeight <= 0)
      return;
    const L = jt({
      containerWidth: i,
      cols: e.cols,
      margin: e.margin,
      containerPadding: E,
      rowHeight: e.rowHeight,
      maxRows: e.maxRows,
      renderPrecision: e.renderPrecision || void 0
    });
    if (!(!Number.isFinite(L) || L <= 0))
      return {
        colWidth: L,
        rowHeight: e.rowHeight,
        margin: [e.margin[0], e.margin[1]],
        containerPadding: [E[0], E[1]],
        renderPrecision: e.renderPrecision || "integer"
      };
  }, te = (i, E, L, O = i.i) => ({
    w: i.w,
    h: i.h,
    x: E,
    y: L,
    i: O,
    placeholder: !0
  }), ve = () => {
    A.value = null, I.value = [], h.value = null;
  }, Ie = (i, E, L) => {
    m.value = !0, A.value = i, I.value = E.slice(), h.value = L || null;
  }, we = (i, E, L, O = !1) => {
    if (i.status === "blocked" && i.blocked) {
      const N = i.blocked.reason, x = i.blocked.itemIds.length > 0 ? i.blocked.itemIds : E, g = `Pointer move blocked by ${N}.`;
      Ie(N, x, g), O && o.notifyMoveBlocked({
        reason: N,
        ids: x,
        activeId: L,
        message: g,
        operationResult: i
      });
      return;
    }
    m.value = !1, ve();
  }, f = () => {
    y.value = null, G.value = null, m.value = !1, R.value = !1, ve(), a = null, d = !1, S = null, c = null, D = void 0, j.reset("clear-active-interaction");
  }, b = () => {
    t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), o.clearGuides(), j.reset("finish-drag-interaction");
  }, H = (i, E) => i.x === E.x && i.y === E.y && i.w === E.w && i.h === E.h, B = (i, E) => i.find((L) => L.type === E), se = (i) => i.kind === "group" ? {
    kind: "group",
    activeId: i.activeId,
    ids: i.ids
  } : i.kind === "blocked" ? {
    kind: "blocked",
    reason: i.reason,
    ids: i.ids,
    activeId: i.activeId
  } : {
    kind: "single",
    id: i.id
  }, Z = () => {
    t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, G.value = null, R.value = !1, c = null, s.reset(), o.clearGuides(), t.oldLayout = null, j.reset("resize-cleanup"), D = void 0;
  };
  return {
    activeDragId: y,
    activeResizeId: G,
    dragBlocked: m,
    dragBlockedReason: A,
    dragBlockedItemIds: I,
    dragBlockedMessage: h,
    resizeBlocked: R,
    clearActiveInteraction: f,
    onResizeStart: (i, E, L, { e: O, node: N, handle: x }) => {
      l.cancel();
      const { layout: g } = t, P = he(g, i);
      if (!P) return;
      const $ = x || "se", J = v("resize-interaction", i), q = j.dispatch({
        type: "START_RESIZE",
        interactionId: J,
        itemId: i,
        handle: $,
        geometry: { x: P.x, y: P.y, w: P.w, h: P.h }
      });
      B(q.effects, "EMIT_RESIZE_START") && (c = J, D = void 0, C(g, "replace"), G.value = i, R.value = !1, o.resetSnap(), s.init(N), t.oldResizeItem = qe(P), t.oldLayout = je(g), t.resizing = !0, w() || (V(g), r.start({
        id: v("resize-start", i),
        type: "resize",
        itemId: i
      })), n.emitResizeStart(g, P, P, void 0, O, N));
    },
    onResize: (i, E, L, { e: O, node: N, handle: x }) => {
      var $e;
      const { oldResizeItem: g } = t, { cols: P, preventCollision: $, allowOverlap: J } = e, q = x, Q = he(t.layout, i);
      if (!Q) return;
      const ne = Ge(Q, E, L, q);
      if (H(Q, ne))
        return;
      if (!w()) {
        const xe = t.layout, Re = he(xe, i);
        if (!Re) return;
        s.maybeScroll(O, N);
        const Ne = o.snapCandidate(
          i,
          Re,
          Ge(Re, E, L, q),
          xe,
          q
        ), ie = ($e = o.resolveResizeIntent) == null ? void 0 : $e.call(o, {
          id: i,
          item: Re,
          layout: xe,
          handle: q,
          rawCandidate: Ne,
          metrics: F(),
          phase: "preview"
        });
        if ((ie == null ? void 0 : ie.kind) === "blocked") {
          R.value = !0, t.activeDrag = Y({
            w: Re.w,
            h: Re.h,
            x: Re.x,
            y: Re.y,
            static: !0,
            i
          }), o.updateIntelligence(i, Re, Re, q);
          return;
        }
        const ge = (ie == null ? void 0 : ie.kind) === "allowed" ? ie.candidate : Ne;
        D = (ie == null ? void 0 : ie.kind) === "allowed" ? ie.constraint : D;
        let He;
        if (c) {
          const ze = j.dispatch({
            type: "MOVE_RESIZE",
            interactionId: c,
            geometry: {
              x: ge.x,
              y: ge.y,
              w: ge.w,
              h: ge.h
            }
          });
          if (He = B(ze.effects, "PREVIEW_RESIZE"), !He) return;
        }
        if (!He) return;
        M(
          He.requestId,
          {
            type: "resize",
            id: i,
            w: ge.w,
            h: ge.h,
            x: ge.x,
            y: ge.y,
            handle: q,
            constraint: D
          },
          (ze) => {
            if (ze.status === "stale" || !j.isCurrentPreviewRequest(He.interactionId, He.requestId) || G.value !== i) return;
            const Le = ze.status === "changed" || ze.status === "fallback" ? ze.layout : r.getCommitted(), Te = he(Le, i) || Re, Fe = ze.placeholder || {
              w: Te.w,
              h: Te.h,
              x: Te.x,
              y: Te.y,
              static: !0,
              i
            };
            G.value === i && (R.value = ze.status === "blocked"), n.emitResize(Le, g, Te, Fe, O, N), (ze.status === "changed" || ze.status === "fallback") && (t.layout = Y(Le)), t.activeDrag = Y(Fe), o.updateIntelligence(i, Re, Fe, q);
          },
          Oe()
        );
        return;
      }
      const re = t.layout.length >= Gt;
      if (s.maybeScroll(O, N), !re) {
        const { layout: xe } = t;
        let Re = !1, Ne, ie, ge, He = !1;
        const [ze, Le] = ln(xe, i, (oe) => {
          ie = oe.x, ge = oe.y;
          const Rt = x === "sw" || x === "w" || x === "nw", Dt = x === "ne" || x === "n" || x === "nw";
          (Rt || Dt) && (Rt && (ie = oe.x + (oe.w - E), E = oe.x !== ie && ie < 0 ? oe.w : E, ie = ie < 0 ? 0 : ie), Dt && (ge = oe.y + (oe.h - L), L = oe.y !== ge && ge < 0 ? oe.h : L, ge = ge < 0 ? 0 : ge), Re = !0);
          const Qe = o.snapCandidate(
            i,
            oe,
            { ...oe, x: ie, y: ge, w: E, h: L },
            xe,
            x
          );
          return ie = Qe.x, ge = Qe.y, E = Qe.w, L = Qe.h, Re = Re || ie !== oe.x || ge !== oe.y, $ && !J && (He = rt(xe, { ...oe, w: E, h: L, x: ie, y: ge }).length > 0, He && (ge = oe.y, L = oe.h, ie = oe.x, E = oe.w, Re = !1)), oe.w = E, oe.h = L, oe;
        });
        if (!Le) return;
        G.value === i && (R.value = He), Ne = ze, Re && (Ne = et(
          ze,
          Le,
          Ee(e),
          P,
          J,
          ie,
          ge,
          !0,
          e.preventCollision
        ));
        const Te = {
          w: Le.w,
          h: Le.h,
          x: Le.x,
          y: Le.y,
          static: !0,
          i
        };
        if (c) {
          const oe = j.dispatch({
            type: "MOVE_RESIZE",
            interactionId: c,
            geometry: { x: Te.x, y: Te.y, w: Te.w, h: Te.h }
          });
          if (!B(oe.effects, "PREVIEW_RESIZE")) return;
        }
        n.emitResize(Ne, g, Le, Te, O, N);
        const Fe = J ? Ne : Xe(Ne, Ee(e), P), Ke = he(Fe, i) || Le, vt = {
          ...Te,
          w: Ke.w,
          h: Ke.h,
          x: Ke.x,
          y: Ke.y
        };
        t.layout = Y(Fe), t.activeDrag = Y(vt), o.updateIntelligence(i, Le, vt, x);
        return;
      }
      const ae = t.layout, _ = he(ae, i);
      if (!_) return;
      const Pe = _.x, Se = _.y, de = _.w, z = _.h;
      let W = !1, k = _.x, U = _.y, K = !1;
      const me = x === "sw" || x === "w" || x === "nw", pe = x === "ne" || x === "n" || x === "nw";
      (me || pe) && (me && (k = _.x + (_.w - E), E = _.x !== k && k < 0 ? _.w : E, k = k < 0 ? 0 : k), pe && (U = _.y + (_.h - L), L = _.y !== U && U < 0 ? _.h : L, U = U < 0 ? 0 : U), W = !0);
      const ce = o.snapCandidate(
        i,
        _,
        { ..._, x: k, y: U, w: E, h: L },
        ae,
        x
      );
      k = ce.x, U = ce.y, E = ce.w, L = ce.h, W = W || k !== _.x || U !== _.y, $ && !J && (K = rt(ae, { ..._, w: E, h: L, x: k, y: U }).length > 0, K && (k = _.x, U = _.y, E = _.w, L = _.h, W = !1)), G.value === i && (R.value = K), _.w = E, _.h = L;
      let De = ae;
      W && (De = et(
        ae,
        _,
        Ee(e),
        P,
        J,
        k,
        U,
        !0,
        e.preventCollision
      ));
      const fe = {
        w: _.w,
        h: _.h,
        x: _.x,
        y: _.y,
        static: !0,
        i
      };
      if (c) {
        const xe = j.dispatch({
          type: "MOVE_RESIZE",
          interactionId: c,
          geometry: { x: fe.x, y: fe.y, w: fe.w, h: fe.h }
        });
        if (!B(xe.effects, "PREVIEW_RESIZE")) return;
      }
      n.emitResize(De, g, _, fe, O, N), (_.x !== Pe || _.y !== Se || _.w !== de || _.h !== z || J && De !== t.layout) && (J || l.resetMovedFlags(ae), l.schedule({
        cols: P,
        compactType: Ee(e),
        layout: J && De !== t.layout ? De : void 0,
        placeholder: fe,
        shouldCompact: !J
      }), o.updateIntelligence(i, _, fe, x));
    },
    onResizeStop: (i, E, L, { e: O, node: N, handle: x }) => {
      var Se;
      l.cancel();
      const { layout: g, oldResizeItem: P, oldLayout: $ } = t, { cols: J, allowOverlap: q } = e, Q = he(g, i);
      if (!Q) return;
      const ne = x, re = t.activeDrag || Ge(Q, E, L, ne);
      let ae;
      if (c) {
        const de = j.dispatch({
          type: "STOP_RESIZE",
          interactionId: c,
          geometry: {
            x: re.x,
            y: re.y,
            w: re.w,
            h: re.h
          }
        });
        if (ae = B(de.effects, "COMMIT_RESIZE"), !ae) {
          (B(de.effects, "EMIT_RESIZE_STOP") || !c) && n.emitResizeStop(g, P, Q, void 0, O, N), Z();
          return;
        }
      }
      if (!ae) {
        n.emitResizeStop(g, P, Q, void 0, O, N), Z();
        return;
      }
      if (!w()) {
        let de = re;
        const z = r.getCommitted(), W = (Se = o.resolveResizeIntent) == null ? void 0 : Se.call(o, {
          id: i,
          item: Q,
          layout: g,
          handle: ne,
          rawCandidate: de,
          metrics: F(),
          phase: "commit"
        });
        if ((W == null ? void 0 : W.kind) === "blocked") {
          R.value = !0, n.emitResizeStop(g, P, Q, void 0, O, N), Z();
          return;
        }
        (W == null ? void 0 : W.kind) === "allowed" && (de = W.candidate, D = W.constraint || D), ee(
          ae.requestId,
          {
            type: "resize",
            id: i,
            w: de.w,
            h: de.h,
            x: de.x,
            y: de.y,
            handle: x,
            constraint: D
          },
          (k) => {
            (async () => {
              var ce, De;
              if (k.status === "stale" || !j.isCurrentRequest(ae.interactionId, ae.requestId)) return;
              let U = [];
              if (c) {
                const fe = k.status === "cancelled" ? "error" : k.status;
                U = j.dispatch({
                  type: "APPLY_RESULT",
                  interactionId: c,
                  requestId: ae.requestId,
                  status: fe
                }).effects;
              }
              const K = k.status === "changed" || k.status === "fallback" ? k.layout : r.getCommitted(), me = he(K, i) || Q, pe = k.status === "changed" || k.status === "fallback" ? (t.suppressLayoutChange = !0, await ((ce = o.commitResize) == null ? void 0 : ce.call(o, {
                id: i,
                beforeLayout: $ || z || g,
                afterLayout: K,
                handle: ne
              }))) : null;
              if (pe && pe.status !== "changed" && pe.status !== "noop") {
                const fe = $ || z || g;
                t.suppressLayoutChange = !0, t.layout = Y(fe), (De = o.rollbackInteraction) == null || De.call(o, fe, pe.status), t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, G.value = null, R.value = !1, c = null, D = void 0, s.reset(), t.oldLayout = null;
                return;
              }
              B(U, "EMIT_RESIZE_STOP") && n.emitResizeStop(K, P, me, void 0, O, N), t.activeDrag = null, t.layout = Y(K), t.oldResizeItem = null, t.resizing = !1, G.value = null, R.value = !1, c = null, D = void 0, s.reset(), o.clearGuides(), t.oldLayout = null, p(K, $ || z || g, "push");
            })();
          },
          Oe()
        );
        return;
      }
      const _ = q ? g : Xe(g, Ee(e), J);
      let Pe = [];
      c && ae && (Pe = j.dispatch({
        type: "APPLY_RESULT",
        interactionId: c,
        requestId: ae.requestId,
        status: "changed"
      }).effects), (async () => {
        var z, W;
        const de = (t.suppressLayoutChange = !0, await ((z = o.commitResize) == null ? void 0 : z.call(o, {
          id: i,
          beforeLayout: $ || g,
          afterLayout: _,
          handle: ne
        })));
        if (de && de.status !== "changed" && de.status !== "noop") {
          const k = $ || g;
          t.suppressLayoutChange = !0, t.layout = Y(k), (W = o.rollbackInteraction) == null || W.call(o, k, de.status), Z();
          return;
        }
        B(Pe, "EMIT_RESIZE_STOP") && n.emitResizeStop(_, P, Q, void 0, O, N), t.activeDrag = null, t.layout = Y(_), t.oldResizeItem = null, t.resizing = !1, G.value = null, R.value = !1, c = null, D = void 0, s.reset(), o.clearGuides(), t.oldLayout = null, p(_, $ || g, "push");
      })();
    },
    onDragStart: (i, E, L, { e: O, node: N }) => {
      l.cancel();
      const { layout: x } = t, g = he(x, i);
      if (!g) return;
      const P = o.resolveMoveDrag({
        id: i,
        item: g,
        layout: x,
        legacyLayoutEngine: w(),
        event: O
      });
      if (P.kind === "blocked") {
        a = {
          kind: "blocked",
          reason: P.reason,
          ids: P.ids,
          activeId: P.activeId
        };
        const Q = v("drag-interaction", i), ne = j.dispatch({
          type: "START_DRAG",
          interactionId: Q,
          itemId: i,
          grid: { x: E, y: L },
          context: se(a)
        });
        if (!B(ne.effects, "EMIT_DRAG_START")) {
          a = null;
          return;
        }
        return S = Q, y.value = P.activeId || i, Ie(
          P.reason,
          P.ids,
          `Pointer move blocked by ${P.reason}.`
        ), t.oldDragItem = qe(g), t.oldLayout = je(x), t.activeDrag = Y({ w: g.w, h: g.h, x: g.x, y: g.y, placeholder: !0, i }), d = !1, o.notifyMoveBlocked({
          ...P,
          message: `Pointer move blocked by ${P.reason}.`
        }), n.emitDragStart(x, g, g, void 0, O, N);
      }
      const $ = { w: g.w, h: g.h, x: g.x, y: g.y, placeholder: !0, i };
      a = P.kind === "group" ? {
        kind: "group",
        activeId: P.activeId,
        ids: P.ids,
        startX: g.x,
        startY: g.y
      } : {
        kind: "single",
        id: P.id,
        startX: g.x,
        startY: g.y
      };
      const J = v("drag-interaction", i), q = j.dispatch({
        type: "START_DRAG",
        interactionId: J,
        itemId: i,
        grid: { x: E, y: L },
        context: se(a)
      });
      if (!B(q.effects, "EMIT_DRAG_START")) {
        a = null;
        return;
      }
      return S = J, C(x, "replace"), y.value = a.kind === "group" ? a.activeId : i, m.value = !1, ve(), o.resetSnap(), o.clearGuides(), d = !1, s.init(N), t.oldDragItem = qe(g), t.oldLayout = je(x), t.activeDrag = Y($), w() || (V(x), r.start({
        id: S,
        type: "drag",
        itemId: y.value || i
      })), n.emitDragStart(x, g, g, void 0, O, N);
    },
    onDrag: (i, E, L, { e: O, node: N }) => {
      const { oldDragItem: x } = t;
      let { layout: g } = t;
      const { cols: P, allowOverlap: $, preventCollision: J } = e, q = he(g, i);
      if (!q) return;
      if (s.maybeScroll(O, N), (a == null ? void 0 : a.kind) === "blocked") {
        m.value = !0;
        return;
      }
      if (!S) return;
      if ((a == null ? void 0 : a.kind) === "group" && !w()) {
        const z = a, W = he(g, z.activeId) || q, k = o.snapCandidate(
          z.activeId,
          W,
          { ...W, x: E, y: L },
          g
        ), U = j.dispatch({
          type: "MOVE_DRAG",
          interactionId: S,
          currentPx: { x: k.x, y: k.y },
          grid: { x: k.x, y: k.y }
        }), K = B(U.effects, "PREVIEW_DRAG");
        if (!K) {
          d || o.clearGuides();
          return;
        }
        d = !0;
        const me = k.x - z.startX, pe = k.y - z.startY;
        M(
          K.requestId,
          {
            type: "groupMove",
            ids: z.ids,
            activeId: z.activeId,
            dx: me,
            dy: pe,
            userAction: !0
          },
          (ce) => {
            if (ce.status === "stale" || !j.isCurrentPreviewRequest(K.interactionId, K.requestId) || a !== z || y.value !== z.activeId) return;
            const De = ce.status === "changed" || ce.status === "fallback" ? ce.layout : r.getCommitted(), fe = he(De, z.activeId) || W, We = te(W, k.x, k.y, z.activeId);
            y.value === z.activeId && we(ce, z.ids, z.activeId), n.emitDrag(De, x, fe, We, O, N), (ce.status === "changed" || ce.status === "fallback") && (t.layout = Y(De)), t.activeDrag = Y(We), o.updateIntelligence(z.activeId, W, We);
          },
          Oe()
        );
        return;
      }
      if (!w()) {
        const z = o.snapCandidate(i, q, { ...q, x: E, y: L }, g), W = j.dispatch({
          type: "MOVE_DRAG",
          interactionId: S,
          currentPx: { x: z.x, y: z.y },
          grid: { x: z.x, y: z.y }
        }), k = B(W.effects, "PREVIEW_DRAG");
        if (!k) {
          d || o.clearGuides();
          return;
        }
        d = !0, M(
          k.requestId,
          { type: "move", id: i, x: z.x, y: z.y, userAction: !0 },
          (U) => {
            if (U.status === "stale" || !j.isCurrentPreviewRequest(k.interactionId, k.requestId) || (a == null ? void 0 : a.kind) !== "single" || a.id !== i || y.value !== i) return;
            const K = U.status === "changed" || U.status === "fallback" ? U.layout : r.getCommitted(), me = he(K, i) || q, pe = te(q, z.x, z.y, i);
            y.value === i && we(U, [i], i), n.emitDrag(K, x, me, pe, O, N), (U.status === "changed" || U.status === "fallback") && (t.layout = Y(K)), t.activeDrag = Y(pe), o.updateIntelligence(i, q, pe);
          },
          Oe()
        );
        return;
      }
      const Q = t.layout.length >= Gt, ne = q.x, re = q.y;
      if (y.value === i) {
        const z = J && !$ ? rt(g, { ...q, x: E, y: L }) : [];
        z.length > 0 ? Ie(
          "collision",
          z.map((W) => W.i),
          "Pointer move blocked by collision."
        ) : (m.value = !1, ve());
      }
      const ae = !0, _ = o.snapCandidate(i, q, { ...q, x: E, y: L }, g), Pe = j.dispatch({
        type: "MOVE_DRAG",
        interactionId: S,
        currentPx: { x: _.x, y: _.y },
        grid: { x: _.x, y: _.y }
      });
      if (!B(Pe.effects, "PREVIEW_DRAG")) {
        d || o.clearGuides();
        return;
      }
      d = !0, g = et(
        g,
        q,
        Ee(e),
        P,
        $,
        _.x,
        _.y,
        ae,
        J
      );
      const Se = { w: q.w, h: q.h, x: q.x, y: q.y, placeholder: !0, i };
      if (n.emitDrag(g, x, q, Se, O, N), !!(q.x !== ne || q.y !== re || $ && g !== t.layout)) {
        if (!Q) {
          const z = $ ? g : Xe(g, Ee(e), P), W = he(z, i) || q, k = {
            w: W.w,
            h: W.h,
            x: W.x,
            y: W.y,
            placeholder: !0,
            i
          };
          t.layout = Y(z), t.activeDrag = Y(k), o.updateIntelligence(i, q, k);
          return;
        }
        $ || l.resetMovedFlags(t.layout), l.schedule({
          cols: P,
          compactType: Ee(e),
          layout: $ && g !== t.layout ? g : void 0,
          placeholder: Se,
          shouldCompact: !$
        }), o.updateIntelligence(i, q, Se);
      }
    },
    onDragStop: (i, E, L, { e: O, node: N }) => {
      if (l.cancel(), !t.activeDrag) return;
      const { oldDragItem: x, oldLayout: g } = t, P = t.layout;
      let $ = P;
      const { cols: J, preventCollision: q, allowOverlap: Q } = e, ne = he($, i);
      if (!ne) return;
      let re, ae = [];
      if (S) {
        const z = j.dispatch({
          type: "STOP_DRAG",
          interactionId: S,
          grid: { x: E, y: L }
        });
        ae = z.effects, re = B(z.effects, "COMMIT_DRAG");
      }
      if (!re) {
        (B(ae, "EMIT_DRAG_STOP") || !S) && n.emitDragStop(P, x, ne, void 0, O, N), b(), t.oldLayout = null;
        return;
      }
      if ((a == null ? void 0 : a.kind) === "group" && !w()) {
        const z = a, W = t.activeDrag || { x: E, y: L }, k = W.x - z.startX, U = W.y - z.startY, K = r.getCommitted();
        ee(
          re.requestId,
          {
            type: "groupMove",
            ids: z.ids,
            activeId: z.activeId,
            dx: k,
            dy: U,
            userAction: !0
          },
          (me) => {
            (async () => {
              var We, $e;
              if (me.status === "stale" || !j.isCurrentRequest(re.interactionId, re.requestId)) return;
              me.status === "blocked" && we(me, z.ids, z.activeId, !0);
              const pe = j.dispatch({
                type: "APPLY_RESULT",
                interactionId: re.interactionId,
                requestId: re.requestId,
                status: me.status === "cancelled" ? "error" : me.status
              }).effects, ce = me.status === "changed" || me.status === "fallback" ? me.layout : r.getCommitted(), De = he(ce, z.activeId) || ne, fe = me.status === "changed" || me.status === "fallback" ? (t.suppressLayoutChange = !0, await ((We = o.commitMove) == null ? void 0 : We.call(o, {
                ids: z.ids,
                activeId: z.activeId,
                beforeLayout: g || K || P,
                afterLayout: ce,
                source: "pointer"
              }))) : null;
              if (fe && fe.status !== "changed" && fe.status !== "noop") {
                const xe = g || K || P;
                t.suppressLayoutChange = !0, t.layout = Y(xe), ($e = o.rollbackInteraction) == null || $e.call(o, xe, fe.status), t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), t.oldLayout = null;
                return;
              }
              B(pe, "EMIT_DRAG_STOP") && n.emitDragStop(ce, x, De, void 0, O, N), t.activeDrag = null, t.layout = Y(ce), t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), o.clearGuides(), t.oldLayout = null, p(ce, g || K || P, "push");
            })();
          },
          Oe()
        );
        return;
      }
      if (!w()) {
        const z = t.activeDrag || { x: E, y: L }, W = r.getCommitted();
        ee(
          re.requestId,
          { type: "move", id: i, x: z.x, y: z.y, userAction: !0 },
          (k) => {
            (async () => {
              var ce, De;
              if (k.status === "stale" || !j.isCurrentRequest(re.interactionId, re.requestId)) return;
              k.status === "blocked" && we(k, [i], i, !0);
              const U = j.dispatch({
                type: "APPLY_RESULT",
                interactionId: re.interactionId,
                requestId: re.requestId,
                status: k.status === "cancelled" ? "error" : k.status
              }).effects, K = k.status === "changed" || k.status === "fallback" ? k.layout : r.getCommitted(), me = he(K, i) || ne, pe = k.status === "changed" || k.status === "fallback" ? (t.suppressLayoutChange = !0, await ((ce = o.commitMove) == null ? void 0 : ce.call(o, {
                ids: [i],
                activeId: i,
                beforeLayout: g || W || P,
                afterLayout: K,
                source: "pointer"
              }))) : null;
              if (pe && pe.status !== "changed" && pe.status !== "noop") {
                const fe = g || W || P;
                t.suppressLayoutChange = !0, t.layout = Y(fe), (De = o.rollbackInteraction) == null || De.call(o, fe, pe.status), t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), t.oldLayout = null;
                return;
              }
              B(U, "EMIT_DRAG_STOP") && n.emitDragStop(K, x, me, void 0, O, N), t.activeDrag = null, t.layout = Y(K), t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), o.clearGuides(), t.oldLayout = null, p(K, g || W || P, "push");
            })();
          },
          Oe()
        );
        return;
      }
      const _ = !0, Pe = t.activeDrag || { x: E, y: L };
      $ = et(
        $,
        ne,
        Ee(e),
        J,
        Q,
        Pe.x,
        Pe.y,
        _,
        q
      );
      const Se = Q ? $ : Xe($, Ee(e), J), de = j.dispatch({
        type: "APPLY_RESULT",
        interactionId: re.interactionId,
        requestId: re.requestId,
        status: "changed"
      }).effects;
      (async () => {
        var W, k;
        const z = (t.suppressLayoutChange = !0, await ((W = o.commitMove) == null ? void 0 : W.call(o, {
          ids: [i],
          activeId: i,
          beforeLayout: g || P,
          afterLayout: Se,
          source: "pointer"
        })));
        if (z && z.status !== "changed" && z.status !== "noop") {
          const U = g || P;
          t.suppressLayoutChange = !0, t.layout = Y(U), (k = o.rollbackInteraction) == null || k.call(o, U, z.status), t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), t.oldLayout = null;
          return;
        }
        B(de, "EMIT_DRAG_STOP") && n.emitDragStop(Se, x, ne, void 0, O, N), t.activeDrag = null, t.layout = Y(Se), t.oldDragItem = null, y.value = null, m.value = !1, ve(), a = null, d = !1, S = null, s.reset(), o.clearGuides(), t.oldLayout = null, p(Se, g || P, "push");
      })();
    }
  };
}
function rr({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: r,
  frameUpdate: l,
  autoScroll: s,
  editor: o,
  isFirefox: u,
  layoutClassName: v,
  interactionMachine: C,
  nextInteractionRequestId: p
}) {
  const m = ke(0);
  let R = null;
  const y = C || ht({
    getDragActivationDistance: () => e.dragActivationDistance
  }), G = () => r.getLayoutEngineProp(), A = () => r.isLegacyLayoutEngine(), I = (f = t.layout) => r.reset(f), h = (...f) => r.preview(...f), a = (...f) => r.commit(...f), d = (f, b) => f.find((H) => H.type === b), S = (f) => {
    if (!R) {
      const b = p("drop", f), H = y.dispatch({
        type: "ENTER_DROP",
        interactionId: b,
        itemId: f
      });
      if (d(H.effects, "REJECT_TRANSITION")) return null;
      R = b;
    }
    return R;
  }, c = (f, b, H, B) => {
    const se = S(f);
    if (!se) return null;
    const Z = y.dispatch({
      type: "MOVE_DROP",
      interactionId: se,
      grid: b,
      size: H,
      strategy: B
    });
    return d(Z.effects, "PREVIEW_DROP") || null;
  }, D = (f) => {
    y.reset(f), R = null;
  }, T = (f) => {
    t.externalDropSession = f ? Y(f) : null;
  }, w = (f) => t.layout.filter((b) => b.i !== f), V = () => {
    const f = String(e.droppingItem.i), b = S(f);
    if (!b) return null;
    const H = t.externalDropSession;
    if (H && H.id === f && H.status !== "committing")
      return H;
    const B = Yn({
      id: f,
      interactionId: b,
      sourceItem: e.droppingItem,
      baseLayout: w(f),
      strategy: e.dropStrategy
    });
    return T(B), B;
  }, M = (f = "drop-cleanup") => {
    T(null), s.reset(), o.clearGuides(), D(f);
  }, ee = (f, b) => {
    const H = Un(f, b);
    T(H), H.status === "ready" && H.ghostItem && o.updateIntelligence(H.id, H.ghostItem, H.ghostItem);
  }, j = (f, b) => {
    const H = Xe(
      [...f.baseLayout.map(qe), qe(b)],
      Ee(e),
      e.cols,
      e.allowOverlap
    ), B = he(H, f.id) || b;
    return {
      status: "changed",
      layout: H,
      placeholder: B
    };
  }, Ge = (f) => {
    const { cols: b, maxRows: H, allowOverlap: B } = e, se = f.target || { x: f.resolvedItem.x, y: f.resolvedItem.y };
    let Z = null;
    if (f.strategy === "auto") {
      const X = sn(
        f.baseLayout,
        { w: f.resolvedItem.w, h: f.resolvedItem.h },
        b,
        se.x,
        se.y,
        H
      );
      if (X) {
        const ye = {
          ...f.resolvedItem,
          x: X.x,
          y: X.y,
          static: !1
        };
        Z = o.snapCandidate(f.id, ye, ye, f.baseLayout);
      }
    } else if (Z = qe(f.resolvedItem), !B) {
      const X = rt(f.baseLayout, Z);
      X.length > 0 && (Z.x = Math.min(...X.map((ye) => ye.x)), Z.y = Math.max(...X.map((ye) => ye.y + ye.h)));
    }
    return !Z || Z.y + Z.h > H ? {
      status: "blocked",
      layout: f.baseLayout,
      blocked: { reason: "maxRows", itemIds: [f.id] },
      placeholder: Z || f.resolvedItem
    } : j(f, Z);
  }, Oe = (f) => {
    const b = f.ghostItem || f.resolvedItem;
    return j(f, b);
  }, F = async (f, b, H, B, se) => {
    var be, _e, i, E, L, O, N;
    if (b.status === "stale" || !y.isCurrentRequest(B, se)) return;
    const Z = b.status === "cancelled" ? "error" : b.status;
    if (y.dispatch({
      type: "APPLY_RESULT",
      interactionId: B,
      requestId: se,
      status: Z
    }), b.status === "blocked" || b.status === "cancelled" || b.status === "error") {
      const x = Jt(f, ((be = b.drop) == null ? void 0 : be.reason) || ((_e = b.blocked) == null ? void 0 : _e.reason) || "commit-rejected", {
        geometry: b.placeholder || f.ghostItem || f.resolvedItem,
        message: (i = b.error) == null ? void 0 : i.message,
        itemIds: (E = b.blocked) == null ? void 0 : E.itemIds
      });
      T(x), M(((L = x.blocked) == null ? void 0 : L.reason) || "drop-commit-rejected");
      return;
    }
    const { committedLayout: X, committedItem: ye, eventLayout: Ae } = Xn(f, b), ue = ye ? (t.suppressLayoutChange = !0, await ((O = o.commitDrop) == null ? void 0 : O.call(o, {
      id: f.id,
      beforeLayout: f.baseLayout,
      afterLayout: X,
      item: ye,
      event: H
    }))) : null;
    if (ue && ue.status !== "changed" && ue.status !== "noop") {
      t.suppressLayoutChange = !0, t.layout = Y(f.baseLayout), (N = o.rollbackInteraction) == null || N.call(o, f.baseLayout, ue.status), m.value = 0, M(ue.status);
      return;
    }
    m.value = 0, n.emitDrop(Ae, H, ye), M("drop-cleanup");
  };
  return {
    clearDropInteraction: () => M("clear-active-interaction"),
    removeDroppingPlaceholder: M,
    onDrop: (f) => {
      var Ae, ue, be, _e;
      f.preventDefault(), f.stopPropagation();
      const b = t.externalDropSession, H = !!(b && !b.blocked && (b.status === "ready" || b.status === "previewing" && b.ghostItem));
      if (!b || !H) {
        m.value = 0, M(((Ae = b == null ? void 0 : b.blocked) == null ? void 0 : Ae.reason) || "drop-commit-rejected");
        return;
      }
      const B = S(b.id);
      if (!B) {
        M("drop-commit-rejected");
        return;
      }
      const se = y.dispatch({
        type: "COMMIT_DROP",
        interactionId: B
      }), Z = d(se.effects, "COMMIT_DROP");
      if (!Z) {
        M("drop-commit-rejected");
        return;
      }
      const X = {
        ...b,
        status: "committing",
        requestId: Z.requestId
      }, ye = Mt(X, "commit");
      if (T(X), A()) {
        F(
          X,
          Oe(X),
          f,
          Z.interactionId,
          Z.requestId
        );
        return;
      }
      I(X.baseLayout), r.start({
        id: p("drop-commit", X.id),
        type: "drop",
        itemId: X.id
      }), a(
        Z.requestId,
        ye,
        (i) => {
          F(
            X,
            i,
            f,
            Z.interactionId,
            Z.requestId
          );
        },
        X.baseLayout.length >= (((_e = (be = (ue = G()) == null ? void 0 : ue.scheduler) == null ? void 0 : be.auto) == null ? void 0 : _e.workerMinItems) || 1e3)
      );
    },
    onDragEnter: (f) => {
      f.preventDefault(), f.stopPropagation(), m.value === 0 && V(), m.value++;
    },
    onDragLeave: (f) => {
      f.preventDefault(), f.stopPropagation(), m.value = Math.max(0, m.value - 1), m.value === 0 && M("drag-leave");
    },
    onDragOver: (f) => {
      var ae, _, Pe, Se, de;
      if (f.preventDefault(), f.stopPropagation(), u && !((_ = (ae = f.currentTarget) == null ? void 0 : ae.classList) != null && _.contains(v)))
        return !1;
      const b = V();
      if (!b) return !1;
      const H = n.callDropDragOver(f);
      if (H === !1)
        return M("drop-drag-over-rejected"), !1;
      const {
        margin: B,
        cols: se,
        rowHeight: Z,
        maxRows: X,
        width: ye,
        containerPadding: Ae,
        transformScale: ue,
        dropStrategy: be
      } = e, _e = f.currentTarget instanceof Element ? f.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, i = (f.clientX - _e.left) / ue, E = (f.clientY - _e.top) / ue, L = typeof (H == null ? void 0 : H.w) == "number" ? H.w : e.droppingItem.w, O = typeof (H == null ? void 0 : H.h) == "number" ? H.h : e.droppingItem.h, N = {
        cols: se,
        margin: B,
        maxRows: X,
        rowHeight: Z,
        containerWidth: ye || 0,
        containerPadding: Ae || B,
        renderPrecision: e.renderPrecision || void 0
      }, x = Ze(N, 0, 0, L, O), g = Ft(
        N,
        E - x.height / 2,
        i - x.width / 2,
        L,
        O
      ), P = w(b.id), $ = {
        ...b.resolvedItem,
        ...e.droppingItem,
        i: b.id,
        w: L,
        h: O,
        x: g.x,
        y: g.y,
        static: !1
      }, J = o.snapCandidate(b.id, $, $, P), q = $n(b, {
        overrides: H || null,
        target: { x: J.x, y: J.y },
        strategy: be,
        baseLayout: P,
        snapCandidate: () => J
      }), Q = c(
        q.id,
        { x: q.resolvedItem.x, y: q.resolvedItem.y },
        { w: q.resolvedItem.w, h: q.resolvedItem.h },
        be
      );
      if (!Q) {
        T(q);
        return;
      }
      const ne = {
        ...q,
        requestId: Q.requestId,
        status: "previewing"
      }, re = Mt(ne, "preview");
      if (T(ne), A()) {
        ee(ne, Ge(ne));
        return;
      }
      I(ne.baseLayout), r.start({
        id: R || Q.interactionId,
        type: "drop",
        itemId: ne.id
      }), h(
        Q.requestId,
        re,
        (z) => {
          z.status !== "stale" && y.isCurrentPreviewRequest(Q.interactionId, Q.requestId) && ee(ne, z);
        },
        ne.baseLayout.length >= (((de = (Se = (Pe = G()) == null ? void 0 : Pe.scheduler) == null ? void 0 : Se.auto) == null ? void 0 : de.workerMinItems) || 1e3)
      );
    }
  };
}
function ir(e) {
  const t = ht({
    getDragActivationDistance: () => e.props.dragActivationDistance
  }), n = {
    ...e,
    interactionMachine: t
  }, r = nr(n), l = rr(n);
  return {
    ...r,
    ...l,
    clearActiveInteraction: () => {
      r.clearActiveInteraction(), l.clearDropInteraction();
    }
  };
}
const or = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, ft = (e, t = {}) => ({
  code: "measurement-unavailable",
  level: "warning",
  message: "Parent container height measurement was unavailable.",
  prop: "autoMeasureContainerHeight",
  details: {
    reason: e,
    ...t
  }
}), nt = (e) => {
  const t = Number.parseFloat(e || "0");
  return Number.isFinite(t) ? t : 0;
}, ar = (e) => {
  var l, s;
  const t = e.getBoundingClientRect(), n = ((l = e.ownerDocument) == null ? void 0 : l.defaultView) || (typeof window != "undefined" ? window : null), r = (s = n == null ? void 0 : n.getComputedStyle) == null ? void 0 : s.call(n, e);
  return r ? t.height - nt(r.paddingTop) - nt(r.paddingBottom) - nt(r.borderTopWidth) - nt(r.borderBottomWidth) : t.height;
};
function cr({
  enabled: e,
  rootRef: t,
  onDiagnostics: n
}) {
  const r = ke(null), l = ke([]);
  let s = null, o = null, u = !1;
  const v = (y) => {
    l.value = y, n == null || n(y);
  }, C = () => {
    s == null || s.disconnect(), s = null, o = null;
  }, p = (y, G = "resize-observer") => {
    if (or(y)) {
      r.value = y, v([]);
      return;
    }
    r.value = null, v([ft("invalid-height", { height: y, source: G })]);
  }, m = () => {
    var A;
    if (u) return;
    if (C(), !e()) {
      r.value = null, v([]);
      return;
    }
    const y = ((A = t.value) == null ? void 0 : A.parentElement) || null;
    if (!y) {
      r.value = null, v([ft("missing-parent")]);
      return;
    }
    const G = typeof ResizeObserver != "undefined" ? ResizeObserver : In;
    if (!G) {
      r.value = null, v([ft("resize-observer-unavailable")]);
      return;
    }
    o = y, s = new G((I) => {
      var a;
      const h = I.find((d) => d.target === o) || I[0];
      p((a = h == null ? void 0 : h.contentRect) == null ? void 0 : a.height, "content-rect");
    }), s.observe(y), p(ar(y), "initial-content-box");
  }, R = () => {
    u = !0, C(), r.value = null;
  };
  return Je(
    () => {
      var y;
      return [e(), ((y = t.value) == null ? void 0 : y.parentElement) || null];
    },
    () => {
      Kt(m);
    },
    { immediate: !0 }
  ), Vt(R), {
    measuredContainerHeight: r,
    diagnostics: l,
    stop: R
  };
}
const lr = (e, t) => {
  const n = typeof e.isDraggable == "boolean" ? e.isDraggable : !e.static && t.isDraggable, r = typeof e.isResizable == "boolean" ? e.isResizable : !e.static && t.isResizable;
  return {
    visible: !0,
    draggable: n,
    resizable: r,
    bounded: n && t.isBounded && e.isBounded !== !1,
    className: void 0,
    previewItem: null,
    onClick: void 0
  };
}, sr = () => ({
  clearGuides: () => {
  },
  resetSnap: () => {
  },
  snapCandidate: (e, t, n) => n,
  updateIntelligence: () => {
  },
  resolveMoveDrag: (e) => ({ kind: "single", id: e.id }),
  notifyMoveBlocked: () => {
  },
  commitMove: () => Promise.resolve(null),
  commitResize: () => Promise.resolve(null),
  commitDrop: () => Promise.resolve(null),
  rollbackInteraction: () => {
  }
}), ur = (e) => ({
  interactions: sr(),
  getItemRenderState: lr,
  getRootClassNames: () => {
  },
  isExternalDropEnabled: (t) => t,
  renderOverlay: () => null
});
function dr(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Wt(e);
}
const gt = "vue-grid-layout", fr = typeof navigator != "undefined" && /firefox/i.test(navigator.userAgent), xr = ({
  name: e,
  props: t,
  createRuntimeExtension: n = ur
}) => /* @__PURE__ */ Ot({
  name: e,
  inheritAttrs: !1,
  props: t,
  emits: Bn,
  setup(r, {
    slots: l,
    attrs: s,
    emit: o
  }) {
    const u = r, v = jn(o, Qt()), C = Zn({
      props: u,
      emitModelValue: (F) => v.emitModelValue(F),
      emitLayoutChange: (F) => v.emitLayoutChange(F)
    }), {
      state: p,
      onLayoutMaybeChanged: m
    } = C, R = ke(null), y = cr({
      enabled: () => u.autoMeasureContainerHeight === !0,
      rootRef: R
    }), G = pt(() => mn({
      layout: p.layout,
      autoSize: u.autoSize,
      heightMode: u.heightMode,
      rowHeight: u.rowHeight,
      minRowHeight: u.minRowHeight,
      margin: u.margin,
      containerPadding: u.containerPadding || u.margin,
      containerHeight: u.containerHeight,
      measuredContainerHeight: y.measuredContainerHeight.value,
      measurementDiagnostics: y.diagnostics.value,
      autoMeasureContainerHeight: u.autoMeasureContainerHeight,
      renderPrecision: u.renderPrecision,
      context: {
        source: "grid"
      }
    })), A = new Proxy(u, {
      get(F, te) {
        return te === "rowHeight" ? G.value.rowHeight : F[te];
      }
    }), I = Kn({
      props: u,
      getLayout: () => p.layout
    }), h = {
      current: null
    }, a = n({
      props: A,
      layoutRef: en(p, "layout"),
      engineBridge: I,
      getLayout: () => p.layout,
      getOldDragItem: () => p.oldDragItem,
      getOldResizeItem: () => p.oldResizeItem,
      isDropping: () => !!p.externalDropSession,
      getInteractionState: () => h.current ? {
        activeDragId: h.current.activeDragId.value,
        activeResizeId: h.current.activeResizeId.value,
        dragBlocked: h.current.dragBlocked.value,
        dragBlockedReason: h.current.dragBlockedReason.value,
        dragBlockedItemIds: h.current.dragBlockedItemIds.value,
        dragBlockedMessage: h.current.dragBlockedMessage.value,
        resizeBlocked: h.current.resizeBlocked.value
      } : null
    }), d = a.interactions;
    let S = 0;
    const c = (F, te) => `${F}:${te}:${++S}`, D = Qn({
      getLayout: () => p.layout,
      setLayout: (F) => {
        p.layout = Y(F);
      },
      setActiveDrag: (F) => {
        p.activeDrag = Y(F);
      }
    }), T = er({
      getConfig: () => u.autoScroll,
      rootClassName: gt
    }), w = ir({
      props: A,
      state: p,
      eventBridge: v,
      engineBridge: I,
      frameUpdate: D,
      autoScroll: T,
      editor: d,
      isFirefox: fr,
      layoutClassName: gt,
      nextInteractionRequestId: c,
      syncHistory: a.syncHistory || Ue,
      onLayoutMaybeChanged: m
    });
    h.current = w;
    const V = {
      reconcileSynchronizedLayout: (F) => {
        if (!I.isLegacyLayoutEngine() && (w.activeDragId.value || w.activeResizeId.value)) {
          const te = I.rebase(F);
          if (!te)
            return {
              clearActive: !0
            };
          if (te.placeholder)
            return {
              placeholder: te.placeholder
            };
        } else I.isLegacyLayoutEngine() || I.reset(F);
      },
      clearActiveInteraction: () => w.clearActiveInteraction()
    };
    C.watchLayoutDependencies(V), Vt(() => {
      var F;
      D.cancel(), w.removeDroppingPlaceholder("component-unmounted"), T.reset(), I.dispose("component unmounted"), (F = a.stop) == null || F.call(a), y.stop();
    });
    let M = "";
    const ee = () => {
      const F = G.value, te = JSON.stringify(F);
      te !== M && (M = te, v.emitHeightRuntimeChange(F));
    };
    Je(G, () => {
      p.mounted && ee();
    }, {
      deep: !0
    }), qt(() => {
      var F;
      p.mounted = !0, (F = a.mount) == null || F.call(a), ee();
    });
    const j = () => {
      var Z, X;
      const F = ((Z = p.externalDropSession) == null ? void 0 : Z.ghostItem) || null, te = F || p.activeDrag;
      if (!te) return null;
      const {
        width: ve = 0,
        cols: Ie,
        margin: we,
        containerPadding: f,
        maxRows: b,
        useCSSTransforms: H,
        transformScale: B
      } = u, se = G.value;
      return Ve(At, {
        w: te.w,
        h: te.h,
        x: te.x,
        y: te.y,
        i: te.i,
        class: mt("vue-grid-placeholder", {
          "placeholder-resizing": p.resizing,
          "placeholder-blocked": F ? ((X = p.externalDropSession) == null ? void 0 : X.status) === "blocked" : w.dragBlocked.value || w.resizeBlocked.value
        }),
        containerWidth: ve,
        cols: Ie,
        margin: we,
        containerPadding: f || we,
        maxRows: b,
        rowHeight: se.rowHeight,
        dragActivationDistance: u.dragActivationDistance,
        renderPrecision: se.renderPrecision,
        isDraggable: !1,
        isResizable: !1,
        isBounded: !1,
        useCSSTransforms: H,
        transformScale: B
      }, {
        default: () => [Ve("div", null, null)]
      });
    }, Ge = /* @__PURE__ */ new Map(), Oe = (F, te, ve) => {
      if (!F || !F.key) return null;
      const Ie = te.get(String(F.key));
      if (!Ie) return null;
      const {
        width: we = 0,
        cols: f,
        margin: b,
        containerPadding: H,
        maxRows: B,
        isDraggable: se,
        isResizable: Z,
        isBounded: X,
        useCSSTransforms: ye,
        transformScale: Ae,
        draggableCancel: ue,
        draggableCancelInteractiveElements: be,
        draggableHandle: _e,
        resizeHandles: i,
        resizeHandle: E
      } = u, L = G.value, {
        mounted: O,
        droppingPosition: N
      } = p, x = a.getItemRenderState(Ie, {
        isDraggable: se,
        isResizable: Z,
        isBounded: X
      }, ve);
      if (!x.visible) return null;
      const g = x.previewItem || Ie, P = typeof x.resizeHandles != "undefined" ? x.resizeHandles : Ie.resizeHandles || i;
      return Ve(At, {
        key: Ie.i,
        containerWidth: we,
        cols: f,
        margin: b,
        containerPadding: H || b,
        maxRows: B,
        rowHeight: L.rowHeight,
        dragActivationDistance: u.dragActivationDistance,
        renderPrecision: L.renderPrecision,
        cancel: ue,
        cancelInteractiveElements: be,
        handle: _e,
        onDragStop: w.onDragStop,
        onDragStart: w.onDragStart,
        onDrag: w.onDrag,
        onResizeStart: w.onResizeStart,
        onResize: w.onResize,
        onResizeStop: w.onResizeStop,
        isDraggable: x.draggable,
        isResizable: x.resizable,
        isBounded: x.bounded,
        isDragBlocked: w.dragBlocked.value && w.activeDragId.value === Ie.i,
        isResizeBlocked: w.resizeBlocked.value && w.activeResizeId.value === Ie.i,
        useCSSTransforms: ye && O,
        usePercentages: !O,
        transformScale: Ae,
        w: g.w,
        h: g.h,
        x: g.x,
        y: g.y,
        i: g.i,
        minH: g.minH,
        minW: g.minW,
        maxH: g.maxH,
        maxW: g.maxW,
        static: g.static,
        class: x.className,
        onItemClick: x.onClick,
        droppingPosition: void 0,
        resizeHandles: P,
        resizeHandle: E
      }, dr(F) ? F : {
        default: () => [F]
      });
    };
    return () => {
      const {
        class: F,
        style: te,
        isDroppable: ve,
        innerRef: Ie
      } = u, we = G.value, f = Vn(s), b = a.isExternalDropEnabled(ve), H = mt(gt, f.class, F, a.getRootClassNames()), B = {
        ...f.style && typeof f.style == "object" && !Array.isArray(f.style) ? f.style : {},
        height: we.containerStyle.height,
        ...we.containerStyle.overflow ? {
          overflow: we.containerStyle.overflow
        } : {},
        ...te
      }, se = l.default ? un(Nt(tn, null, l.default())) : [], Z = C.syncRenderedChildren(se, V), X = Jn(p, Z);
      Ge.clear();
      for (let ue = 0; ue < X.length; ue++) {
        const be = X[ue];
        Ge.set(be.i, be);
      }
      const ye = {
        width: u.width || 0,
        margin: u.margin,
        containerPadding: u.containerPadding || u.margin,
        rowHeight: we.rowHeight,
        renderPrecision: we.renderPrecision,
        cols: u.cols,
        maxRows: u.maxRows
      }, Ae = (ue) => {
        R.value = ue, Ie && typeof Ie == "object" && "value" in Ie && (Ie.value = ue);
      };
      return Ve("div", Bt(f.attrs, {
        ref: Ae,
        class: H,
        style: B,
        onMousemove: a.onRootPointerMove,
        onClick: a.onRootClick,
        onDrop: b ? w.onDrop : Ue,
        onDragleave: b ? w.onDragLeave : Ue,
        onDragenter: b ? w.onDragEnter : Ue,
        onDragover: b ? w.onDragOver : Ue
      }), [se.map((ue) => Oe(ue, Ge)), j(), a.renderOverlay({
        geometry: ye,
        itemMap: Ge,
        layout: X
      })]);
    };
  }
});
export {
  br as b,
  xr as c,
  cr as u
};
