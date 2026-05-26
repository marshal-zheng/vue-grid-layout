import { computed as yt, defineComponent as Mt, reactive as Ot, ref as Te, watch as Xe, onMounted as Ht, createVNode as We, h as qt, mergeProps as Nt, isVNode as Bt, markRaw as Z, shallowRef as Dt, nextTick as Jt, onBeforeUnmount as Wt, getCurrentInstance as Kt, toRef as Qt, Fragment as en } from "vue";
import gt from "clsx";
import { w as tn, y as nn, x as rn, v as wt, a as Fe, C as St, i as xe, c as on, d as He, g as an, o as he, F as cn, m as nt, s as Qe, f as Ue, l as ln, u as $e, p as sn } from "./utils-BCVYGne6.mjs";
import { DraggableCore as un } from "@marsio/vue-draggable";
import { Resizable as dn } from "@marsio/vue-resizable";
import { b as je, f as Vt, d as xt, h as it, c as Ft, e as fn, r as gn } from "./resolve-C3SqJijI.mjs";
import { deepEqual as et } from "fast-equals";
import { b as bt, c as Et, a as zt } from "./executor-D7yF3Jsp.mjs";
import { e as mn, c as yn } from "./core-C45AnvB2.mjs";
import pn from "resize-observer-polyfill";
const In = {
  type: Array,
  default: () => []
}, jt = {
  type: [Object, Function]
}, Sr = {
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
  resizeHandle: jt,
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
}, Lt = {
  mouse: 4,
  pen: 4,
  touch: 8,
  coarse: 8,
  default: 4
};
function hn(e) {
  return e === "mouse" || e === "pen" || e === "touch" ? e : e === "coarse" ? "coarse" : "unknown";
}
function Zt(e, t) {
  var s;
  if (typeof e == "number") return Ct(e);
  const n = e || Lt, r = (s = n.default) != null ? s : Lt.default, l = t === "mouse" ? n.mouse : t === "pen" ? n.pen : t === "touch" ? n.touch : t === "coarse" ? n.coarse : void 0;
  return Ct(l != null ? l : r);
}
function vn(e, t, n) {
  if (n <= 0) return !0;
  const r = t.x - e.x, l = t.y - e.y;
  return Math.sqrt(r * r + l * l) >= n;
}
function Ct(e) {
  return !Number.isFinite(e) || e < 0 ? 0 : e;
}
const ot = () => ({
  status: "idle",
  revision: 0
});
function rt(e, t, n = {}) {
  switch (t.type) {
    case "ARM_DRAG":
      return Dn(e, t, n);
    case "START_DRAG":
      return Rn(e, t);
    case "MOVE_DRAG":
      return wn(e, t, n);
    case "STOP_DRAG":
      return Sn(e, t);
    case "START_RESIZE":
      return xn(e, t);
    case "MOVE_RESIZE":
      return bn(e, t);
    case "STOP_RESIZE":
      return En(e, t);
    case "ENTER_DROP":
      return zn(e, t);
    case "MOVE_DROP":
      return Ln(e, t);
    case "LEAVE_DROP":
      return Pt(e, t, t.reason || "drop-left");
    case "REJECT_DROP":
      return Pt(e, t, t.reason || "drop-rejected");
    case "COMMIT_DROP":
      return Cn(e, t);
    case "APPLY_RESULT":
      return Pn(e, t);
    case "CANCEL":
      return Tn(e, t);
    default:
      return Le(e, t, "unsupported");
  }
}
function Rn(e, t) {
  if (e.status !== "idle") return Le(e, t, "already-active");
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
  return ue(e, n, t, [
    {
      type: "EMIT_DRAG_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      grid: t.grid,
      context: t.context
    }
  ]);
}
function Dn(e, t, n) {
  if (e.status !== "idle") return Le(e, t, "already-active");
  if (Zt(
    n.dragActivationDistance,
    t.pointerKind
  ) <= 0) {
    const l = { kind: "single", id: t.itemId };
    return ue(e, {
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
  return ue(e, {
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
function wn(e, t, n) {
  if (e.status === "pending-drag") {
    if (e.interactionId !== t.interactionId) return Ae(e, t);
    const s = Zt(
      n.dragActivationDistance,
      e.pointerKind
    );
    if (!vn(e.originPx, t.currentPx, s))
      return ue(e, {
        ...e,
        revision: e.revision + 1,
        currentPx: t.currentPx,
        lastGrid: t.grid
      }, t, []);
    const i = t.context || { kind: "single", id: e.itemId }, u = i.kind !== "blocked" && !ct(e.originGrid, t.grid), v = {
      status: "active-drag",
      revision: e.revision + 1,
      interactionId: e.interactionId,
      itemId: e.itemId,
      context: i,
      startGrid: e.originGrid,
      lastGrid: t.grid,
      moved: u,
      previewSeq: u ? 1 : 0
    }, L = [
      {
        type: "EMIT_DRAG_START",
        interactionId: e.interactionId,
        itemId: e.itemId,
        grid: e.originGrid,
        context: i
      }
    ];
    return u && L.push({
      type: "EMIT_DRAG",
      interactionId: e.interactionId,
      itemId: e.itemId,
      grid: t.grid,
      context: i
    }, {
      type: "PREVIEW_DRAG",
      interactionId: e.interactionId,
      requestId: Ne(e.interactionId, "drag-preview", 1),
      itemId: e.itemId,
      grid: t.grid,
      context: i
    }), ue(e, v, t, L);
  }
  if (e.status !== "active-drag") return Le(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return Ae(e, t);
  if (e.context.kind === "blocked")
    return ue(e, {
      ...e,
      revision: e.revision + 1,
      lastGrid: t.grid
    }, t, []);
  if (ct(e.lastGrid, t.grid))
    return ue(e, { ...e, revision: e.revision + 1 }, t, []);
  const r = e.previewSeq + 1, l = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    moved: !0,
    previewSeq: r
  };
  return ue(e, l, t, [
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
      requestId: Ne(e.interactionId, "drag-preview", r),
      itemId: e.itemId,
      grid: t.grid,
      context: e.context
    }
  ]);
}
function Sn(e, t) {
  if (e.status === "pending-drag")
    return e.interactionId !== t.interactionId ? Ae(e, t) : ue(e, Ze(e), t, [
      {
        type: "CLEAR_TRANSIENT",
        interactionId: t.interactionId,
        kind: "drag",
        reason: "click-like"
      }
    ]);
  if (e.status !== "active-drag") return Le(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return Ae(e, t);
  if (!e.moved)
    return ue(e, Ze(e), t, [
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
  const n = Ne(e.interactionId, "drag-commit", e.previewSeq + 1);
  return ue(e, {
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
  if (e.status !== "idle") return Le(e, t, "already-active");
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
  return ue(e, n, t, [
    {
      type: "EMIT_RESIZE_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      handle: t.handle,
      geometry: t.geometry
    }
  ]);
}
function bn(e, t) {
  if (e.status !== "active-resize") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ae(e, t);
  if ($t(e.last, t.geometry))
    return ue(e, { ...e, revision: e.revision + 1 }, t, []);
  const n = e.previewSeq + 1, r = {
    ...e,
    revision: e.revision + 1,
    last: t.geometry,
    resized: !0,
    previewSeq: n
  };
  return ue(e, r, t, [
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
      requestId: Ne(e.interactionId, "resize-preview", n),
      itemId: e.itemId,
      handle: e.handle,
      geometry: t.geometry
    }
  ]);
}
function En(e, t) {
  if (e.status !== "active-resize") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ae(e, t);
  if (!e.resized && $t(e.start, t.geometry))
    return ue(e, Ze(e), t, [
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
  const n = Ne(e.interactionId, "resize-commit", e.previewSeq + 1);
  return ue(e, {
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
function zn(e, t) {
  if (e.status !== "idle") return Le(e, t, "already-active");
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
    requestId: Ne(t.interactionId, "drop-preview", 1),
    itemId: t.itemId,
    grid: t.grid,
    size: t.size,
    strategy: n
  }] : [];
  return ue(e, r, t, l);
}
function Ln(e, t) {
  if (e.status !== "active-drop") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ae(e, t);
  const n = t.strategy || e.strategy || "cursor";
  if (e.lastGrid && e.lastSize && ct(e.lastGrid, t.grid) && Yt(e.lastSize, t.size) && e.strategy === n)
    return ue(e, { ...e, revision: e.revision + 1 }, t, []);
  const r = e.previewSeq + 1, l = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    lastSize: t.size,
    strategy: n,
    previewSeq: r
  };
  return ue(e, l, t, [
    {
      type: "PREVIEW_DROP",
      interactionId: e.interactionId,
      requestId: Ne(e.interactionId, "drop-preview", r),
      itemId: e.itemId,
      grid: t.grid,
      size: t.size,
      strategy: n
    }
  ]);
}
function Pt(e, t, n) {
  return e.status !== "active-drop" ? Le(e, t, "wrong-kind") : e.interactionId !== t.interactionId ? Ae(e, t) : ue(e, Ze(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId,
      kind: "drop",
      reason: n
    }
  ]);
}
function Cn(e, t) {
  if (e.status !== "active-drop") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ae(e, t);
  const n = Ne(e.interactionId, "drop-commit", e.previewSeq + 1);
  return ue(e, {
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
function Pn(e, t) {
  if (e.status !== "committing") return Le(e, t, "not-committing");
  if (e.interactionId !== t.interactionId || e.requestId !== t.requestId)
    return Ae(e, t);
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
  ), ue(e, Ze(e), t, n);
}
function Tn(e, t) {
  return e.status === "idle" ? ue(e, e, t, []) : t.interactionId && at(e) !== t.interactionId ? Ae(e, t) : ue(e, Ze(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId || at(e),
      kind: mt(e),
      reason: t.reason || "cancelled"
    }
  ], "cancelled");
}
function Le(e, t, n) {
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
      pt(e, e, t, n)
    ]
  };
}
function Ae(e, t) {
  const n = "interactionId" in t ? t.interactionId : at(e), r = "requestId" in t ? t.requestId : void 0;
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
      pt(e, e, t, "stale-event")
    ]
  };
}
function ue(e, t, n, r, l) {
  return {
    state: t,
    effects: r,
    diagnostics: [
      pt(e, t, n, l)
    ]
  };
}
function Ze(e) {
  return {
    status: "idle",
    revision: e.revision + 1
  };
}
function pt(e, t, n, r) {
  return {
    interactionId: "interactionId" in n ? n.interactionId : at(e),
    requestId: "requestId" in n ? n.requestId : void 0,
    from: e.status,
    to: t.status,
    event: n.type,
    kind: mt(t) || mt(e),
    itemId: Tt(t) || Tt(e),
    reason: r
  };
}
function at(e) {
  return e.status === "idle" ? void 0 : e.interactionId;
}
function Tt(e) {
  if (!(e.status === "idle" || e.status === "committing"))
    return e.itemId;
}
function mt(e) {
  if (e.status === "pending-drag" || e.status === "active-drag") return "drag";
  if (e.status === "active-resize") return "resize";
  if (e.status === "active-drop") return "drop";
  if (e.status === "committing") return e.kind;
}
function Ne(e, t, n) {
  return `${e}:${t}:${n}`;
}
function ct(e, t) {
  return e.x === t.x && e.y === t.y;
}
function Yt(e, t) {
  return e.w === t.w && e.h === t.h;
}
function $t(e, t) {
  return ct(e, t) && Yt(e, t);
}
const st = (e, t, n, r) => Vt(e, t.top, t.left, n, r), kn = (e) => {
  const t = e.pointerType;
  return t ? hn(t) : "touches" in e || "changedTouches" in e ? "touch" : "mouse";
};
function An({
  attrs: e,
  elementRef: t,
  positionParams: n,
  props: r,
  state: l
}) {
  let s = 0, i = ot(), u = null;
  const v = () => !!(e.onDragStart || e.onDrag || e.onDragStop), L = () => {
    i = ot(), u = null;
  }, p = (T, { node: I }, h = !1) => {
    var M;
    if (!v()) return;
    const a = je(
      n.value,
      r.x,
      r.y,
      r.w,
      r.h,
      l
    ), d = { top: a.top, left: a.left }, { x: S, y: c } = st(
      n.value,
      d,
      r.w,
      r.h
    ), D = `item-drag:${r.i}:${++s}`, P = h ? 0 : r.dragActivationDistance, w = rt(i, {
      type: "ARM_DRAG",
      interactionId: D,
      itemId: r.i,
      pointerKind: kn(T),
      originPx: { x: d.left, y: d.top },
      originGrid: { x: S, y: c }
    }, { dragActivationDistance: P });
    i = w.state, u = {
      interactionId: D,
      originGrid: { x: S, y: c },
      originPosition: d,
      currentPosition: d,
      node: I,
      e: T
    }, w.effects.some((te) => te.type === "EMIT_DRAG_START") && (l.dragging = d, (M = e.onDragStart) == null || M.call(e, r.i, S, c, {
      e: T,
      node: I,
      newPosition: d
    }));
  }, m = (T, I) => {
    let { top: h, left: a } = I;
    const { isBounded: d, w: S, h: c, containerWidth: D } = r;
    if (!d) return I;
    const { offsetParent: P } = T;
    if (!P) return I;
    const { margin: w, rowHeight: W } = r, M = P.clientHeight - xt(
      c,
      W,
      w[1],
      n.value.renderPrecision
    );
    h = it(h, 0, M);
    const te = Ft(n.value), F = D - xt(S, te, w[0], n.value.renderPrecision);
    return a = it(a, 0, F), { top: h, left: a };
  }, R = (T, { node: I, deltaX: h, deltaY: a }) => {
    var w, W;
    if (!v()) return;
    if (!u && !l.dragging)
      throw new Error("onDrag called before onDragStart.");
    const d = l.dragging || (u == null ? void 0 : u.currentPosition);
    if (!d) return;
    const S = m(I, {
      top: d.top + a,
      left: d.left + h
    });
    u && (u.currentPosition = S, u.node = I, u.e = T);
    const { x: c, y: D } = st(
      n.value,
      S,
      r.w,
      r.h
    );
    if (!u) return;
    const P = rt(i, {
      type: "MOVE_DRAG",
      interactionId: u.interactionId,
      currentPx: { x: S.left, y: S.top },
      grid: { x: c, y: D }
    }, { dragActivationDistance: r.dragActivationDistance });
    i = P.state;
    for (const M of P.effects)
      M.type === "EMIT_DRAG_START" && (l.dragging = u.originPosition, (w = e.onDragStart) == null || w.call(e, r.i, u.originGrid.x, u.originGrid.y, {
        e: u.e,
        node: u.node,
        newPosition: u.originPosition
      })), M.type === "EMIT_DRAG" && (l.dragging = S, (W = e.onDrag) == null || W.call(e, r.i, c, D, {
        e: T,
        node: I,
        newPosition: S
      }));
    P.state.status === "active-drag" && (l.dragging = S);
  };
  return {
    moveDroppingItem: (T) => {
      const { droppingPosition: I } = r;
      if (!I) return;
      const h = t.value;
      if (!h) return;
      const a = T || { left: 0, top: 0 }, { dragging: d } = l, S = d && I.left !== a.left || I.top !== a.top;
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
    onDragStop: (T, { node: I }) => {
      var P;
      if (!v()) return;
      if (!u && !l.dragging)
        throw new Error("onDragEnd called before onDragStart.");
      const h = l.dragging || (u == null ? void 0 : u.currentPosition);
      if (!h) return;
      const a = {
        top: h.top,
        left: h.left
      }, { x: d, y: S } = st(
        n.value,
        a,
        r.w,
        r.h
      ), c = i.status === "active-drag", D = u == null ? void 0 : u.interactionId;
      D && (i = rt(i, {
        type: "STOP_DRAG",
        interactionId: D,
        grid: { x: d, y: S }
      }, { dragActivationDistance: r.dragActivationDistance }).state), l.dragging = null, c && ((P = e.onDragStop) == null || P.call(e, r.i, d, S, {
        e: T,
        node: I,
        newPosition: a
      })), L();
    }
  };
}
function _n({
  attrs: e,
  positionParams: t,
  props: n,
  state: r
}) {
  const l = yt(() => {
    const { cols: p, minW: m, minH: R, maxW: y, maxH: O } = n, T = t.value, I = je(T, 0, 0, p, 0).width, h = je(T, 0, 0, m, R), a = je(T, 0, 0, y, O);
    return {
      minConstraints: [h.width, h.height],
      maxConstraints: [
        Math.min(a.width, I),
        Math.min(a.height, 1 / 0)
      ]
    };
  }), s = (p, { node: m, size: R, handle: y }, O, T) => {
    const I = e[T];
    if (!I) return;
    const { x: h, y: a, i: d, maxH: S, minH: c, maxW: D, minW: P, containerWidth: w } = n;
    let W = R;
    m && (W = tn(
      y,
      O,
      R,
      w
    ), r.resizing = T === "onResizeStop" ? null : W);
    let { w: M, h: te } = fn(
      t.value,
      W.width,
      W.height,
      h,
      a,
      y
    );
    M = it(M, Math.max(P, 1), D), te = it(te, c, S), I.call(void 0, d, M, te, { e: p, node: m, size: W, handle: y });
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
    return nn(e);
  const l = rn(e);
  return r && (l.left = wt(e.left / t), l.width = wt(e.width / t)), l;
}
function Mn({
  childClass: e,
  className: t,
  dropping: n,
  hasDragHandle: r,
  isDragBlocked: l,
  isDraggable: s,
  isDragging: i,
  isResizeBlocked: u,
  isResizing: v,
  isStatic: L,
  useCSSTransforms: p
}) {
  return gt(
    "vue-grid-item",
    e,
    t,
    {
      static: L,
      resizing: v,
      "vue-draggable": s,
      "has-drag-handle": r,
      "drag-blocked": l,
      "resize-blocked": u,
      "vue-draggable-dragging": i,
      dropping: n,
      cssTransforms: p
    }
  );
}
function On(e, t, n) {
  return {
    ...e || {},
    ...t && typeof t == "object" ? t : {},
    ...n
  };
}
function Hn(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Bt(e);
}
const qn = "GridItem", kt = /* @__PURE__ */ Mt({
  name: qn,
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
    resizeHandles: In,
    // Define more specific type if necessary
    resizeHandle: jt,
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
    const r = n, l = Ot({
      resizing: null,
      dragging: null,
      className: ""
    }), s = Te(null), i = yt(() => ({
      cols: e.cols,
      containerPadding: e.containerPadding,
      containerWidth: e.containerWidth,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      renderPrecision: e.renderPrecision
    })), u = An({
      attrs: r,
      elementRef: s,
      positionParams: i,
      props: e,
      state: l
    }), v = _n({
      attrs: r,
      positionParams: i,
      props: e,
      state: l
    }), L = (m, R, y) => We(un, {
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
      default: () => [We("div", Nt({
        ref: s
      }, y), [m])]
    });
    Xe(() => e.droppingPosition, (m, R) => {
      u.moveDroppingItem(R);
    });
    const p = (m, R, y) => {
      let O;
      const {
        transformScale: T,
        resizeHandles: I,
        resizeHandle: h
      } = e, {
        minConstraints: a,
        maxConstraints: d
      } = v.resizeConstraints.value;
      return We(dn, {
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
        transformScale: T,
        resizeHandles: I,
        handle: h
      }, Hn(O = qt(m, {
        style: {
          height: "100%"
        }
      })) ? O : {
        default: () => [O]
      });
    };
    return Ht(() => {
      u.moveDroppingItem();
    }), () => {
      var D, P;
      const {
        x: m,
        y: R,
        w: y,
        isDraggable: O,
        isResizable: T,
        droppingPosition: I,
        useCSSTransforms: h
      } = e, a = je(i.value, m, R, y, e.h, l), d = t.default ? t.default()[0] : null;
      if (!d) return null;
      const S = {
        class: Mn({
          childClass: (D = d.props) == null ? void 0 : D.class,
          className: e.class,
          dropping: !!I,
          hasDragHandle: !!e.handle,
          isDragBlocked: e.isDragBlocked,
          isDraggable: O,
          isDragging: !!l.dragging,
          isResizeBlocked: e.isResizeBlocked,
          isResizing: !!l.resizing,
          isStatic: e.static,
          useCSSTransforms: h
        }),
        onClick: e.onItemClick,
        style: On(e.style, (P = d.props) == null ? void 0 : P.style, Gn(a, {
          containerWidth: e.containerWidth,
          useCSSTransforms: h,
          usePercentages: e.usePercentages
        }))
      };
      let c = p(d, a, T);
      return c = L(c, O, S), c;
    };
  }
}), Nn = [
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
], Bn = {
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
function Wn(e) {
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
function Ut(e, t) {
  return e ? Array.isArray(e) ? e.flatMap((n) => Ut(n, t)) : typeof e == "function" ? [e(...t)] : [] : [];
}
function Vn(e, t, n) {
  const r = (e == null ? void 0 : e.vnode.props) || {}, l = Bn[t] || [];
  let s;
  return l.forEach((i) => {
    Ut(r[i], n).forEach((v) => {
      if (v === !1) {
        s = !1;
        return;
      }
      s !== !1 && v != null && (s = v);
    });
  }), s;
}
function Fn(e, t) {
  const n = (r) => (l, s, i, u, v, L) => {
    e(r, l, s, i, u, v, L);
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
      const l = Vn(t, "dropDragOver", [r]);
      if (l === !1) return !1;
      if (l && typeof l == "object")
        return l;
    }
  };
}
function jn({
  props: e,
  emitModelValue: t,
  emitLayoutChange: n
}) {
  const r = Ot({
    activeDrag: null,
    layout: Z(Fe(e.modelValue || [])),
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
    children: Z([])
  });
  let l = Fe(e.modelValue || []);
  const s = (v, L) => {
    L || (L = r.layout), et(L, v) || (n(v), t(v));
  };
  return Xe(
    () => r.layout,
    (v, L) => {
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
      s(v, L);
    }
  ), {
    state: r,
    onLayoutMaybeChanged: s,
    syncRenderedChildren: (v, L = {}) => {
      var I, h;
      if (on(v, r.children))
        return r.layout;
      r.children = Z(v);
      const p = new Set(r.layout.map((a) => a.i)), m = new Set((e.modelValue || []).map((a) => a.i)), y = v.some(
        (a) => (a == null ? void 0 : a.key) != null && !p.has(String(a.key)) && m.has(String(a.key))
      ) ? e.modelValue : r.layout, O = St(
        y,
        v,
        e.cols,
        xe(e),
        e.allowOverlap
      ), T = (I = L.reconcileSynchronizedLayout) == null ? void 0 : I.call(L, O);
      return T != null && T.clearActive ? (r.activeDrag = null, (h = L.clearActiveInteraction) == null || h.call(L)) : T && "placeholder" in T && (r.activeDrag = T.placeholder ? Z(T.placeholder) : null), et(O, r.layout) || (r.layout = Z(O)), r.compactType = e.compactType, O;
    },
    watchLayoutDependencies: (v = {}) => Xe(
      () => ({
        compactType: e.compactType,
        modelValue: e.modelValue,
        verticalCompact: e.verticalCompact,
        cols: e.cols,
        allowOverlap: e.allowOverlap
      }),
      (L, p) => {
        var I, h;
        const m = !et(L.modelValue, l), R = et(L.modelValue, r.layout), y = L.compactType === p.compactType && L.cols === p.cols && L.allowOverlap === p.allowOverlap && L.verticalCompact === p.verticalCompact;
        if (!m && y || (l = Fe(L.modelValue || []), R && y))
          return;
        const O = St(
          L.modelValue,
          r.children,
          L.cols,
          xe(L),
          L.allowOverlap
        ), T = (I = v.reconcileSynchronizedLayout) == null ? void 0 : I.call(v, O);
        T != null && T.clearActive ? (r.activeDrag = null, (h = v.clearActiveInteraction) == null || h.call(v)) : T && "placeholder" in T && (r.activeDrag = T.placeholder ? Z(T.placeholder) : null), s(O, r.layout), r.layout = Z(O), r.compactType = L.compactType;
      },
      { deep: !0 }
    ),
    stop: () => {
    }
  };
}
const At = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, lt = (e) => e ? { x: e.x, y: e.y } : void 0;
function Zn({
  id: e,
  interactionId: t,
  sourceItem: n,
  baseLayout: r,
  strategy: l,
  target: s
}) {
  const i = e || String(n.i), u = r.filter((L) => L.i !== i), v = {
    ...n,
    i,
    x: typeof n.x == "number" ? n.x : 0,
    y: typeof n.y == "number" ? n.y : 0,
    w: n.w,
    h: n.h,
    static: !1
  };
  return s && (v.x = s.x, v.y = s.y), {
    id: i,
    interactionId: t,
    sourceItem: n,
    resolvedItem: v,
    ghostItem: null,
    baseLayout: u,
    previewLayout: u,
    target: lt(s),
    strategy: l,
    status: "entered"
  };
}
function Yn(e, {
  overrides: t,
  target: n,
  strategy: r,
  baseLayout: l,
  snapCandidate: s
}) {
  const i = {
    ...e.resolvedItem,
    i: e.id,
    static: !1
  };
  At(t == null ? void 0 : t.w) && (i.w = t.w), At(t == null ? void 0 : t.h) && (i.h = t.h), n && (i.x = n.x, i.y = n.y);
  const u = l ? l.filter((L) => L.i !== e.id) : e.baseLayout, v = s ? s(e.id, i, i, u) : i;
  return {
    ...e,
    status: "previewing",
    blocked: void 0,
    resolvedItem: He(v),
    baseLayout: u,
    previewLayout: u,
    target: lt(n || { x: v.x, y: v.y }),
    strategy: r || e.strategy
  };
}
function _t(e, t) {
  const n = t === "commit" && e.ghostItem || e.resolvedItem, r = lt(t === "commit" && e.ghostItem || e.target), l = {
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
function $n(e, t) {
  var l, s, i, u;
  if (t.status === "blocked" || t.status === "cancelled" || t.status === "error" || !t.placeholder)
    return Xt(e, ((l = t.drop) == null ? void 0 : l.reason) || ((s = t.blocked) == null ? void 0 : s.reason) || "no-fit", {
      geometry: t.placeholder || e.ghostItem || e.resolvedItem,
      message: (i = t.error) == null ? void 0 : i.message,
      itemIds: (u = t.blocked) == null ? void 0 : u.itemIds
    });
  const n = He(t.placeholder);
  return {
    ...e,
    status: "ready",
    blocked: void 0,
    ghostItem: n,
    previewLayout: t.layout || e.baseLayout,
    target: { x: n.x, y: n.y }
  };
}
function Xt(e, t, n = {}) {
  const r = n.geometry ? He({
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
function Un(e, t) {
  const n = t.placeholder || e.ghostItem || e.resolvedItem, r = n ? He(n) : void 0;
  r && (delete r.isDraggable, delete r.isResizable);
  const l = t.layout && t.layout.length > 0 ? t.layout : [...e.baseLayout, r];
  return {
    committedLayout: l,
    committedItem: r,
    eventLayout: l.filter((s) => s.i !== e.id)
  };
}
function Xn(e, t) {
  const n = e.externalDropSession;
  return !n || n.previewLayout.length === 0 ? t : t.map(
    (r) => n.previewLayout.find((l) => l.i === r.i) || r
  );
}
function Jn({
  props: e,
  getLayout: t
}) {
  const n = () => e.layoutEngine && typeof e.layoutEngine == "object" ? e.layoutEngine : null, r = () => {
    const c = n();
    return e.layoutEngine === !1 || (c == null ? void 0 : c.mode) === "legacy";
  };
  let l, s = bt();
  const i = () => {
    var P;
    const c = n(), D = c == null ? void 0 : c.executor;
    return D !== l && ((P = s.dispose) == null || P.call(s), s = bt(D), l = D), s;
  };
  let u, v = zt();
  const L = () => {
    const c = n(), D = c == null ? void 0 : c.scheduler;
    return D !== u && (v.cancel("scheduler reconfigured"), v = zt(D), u = D), v;
  }, p = () => {
    const c = n();
    return {
      cols: e.cols,
      maxRows: e.maxRows,
      compactType: xe(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      scheduler: c == null ? void 0 : c.scheduler,
      executor: i(),
      compareLegacy: c == null ? void 0 : c.compareLegacy,
      legacyFallback: (c == null ? void 0 : c.legacyFallback) !== !1,
      diagnostics: c == null ? void 0 : c.diagnostics,
      onEvent: c == null ? void 0 : c.onEvent
    };
  };
  let m = Et(
    t(),
    p()
  );
  const R = (c = t()) => {
    m.dispose(), m = Et(c, p());
  }, y = (c, D) => {
    var w, W, M;
    if (!p().compareLegacy || c.phase === "preview" && ((w = D.diagnostics) == null ? void 0 : w.schedulerMode) === "commitOnly") return;
    const P = yn(c, D);
    P.matches || (M = (W = p()).onEvent) == null || M.call(W, {
      type: "legacy-mismatch",
      id: c.id,
      message: "VueGridLayout layout engine result differs from legacy path",
      diagnostics: D.diagnostics,
      details: P.differences
    });
  }, O = (c, D, P) => {
    var w, W, M;
    !P || ((w = D.diagnostics) == null ? void 0 : w.executorKind) !== "worker" || (M = (W = p()).onEvent) == null || M.call(W, {
      type: "operation",
      id: D.id,
      operationType: c.operation.type,
      phase: c.phase,
      diagnostics: D.diagnostics
    });
  }, T = (c) => i().kind === "main-thread" || c.phase === "preview" && (c.operation.type === "move" || c.operation.type === "resize" || c.operation.type === "groupMove") ? !1 : c.phase === "commit" || !!c.heavy || c.operation.type === "dropFit" || c.operation.type === "generateResponsiveLayout" || c.operation.type === "groupMove", I = (c) => T(c) ? i().execute(c) : mn(c), h = (c, D) => {
    let P = null;
    const w = T(c);
    return L().schedule(
      c,
      I,
      (W) => {
        var te;
        const M = m.applyAsyncResult(W);
        L().recordDuration(((te = M.diagnostics) == null ? void 0 : te.durationMs) || 0), O(c, M, w), y(c, M), D(M), P = M;
      }
    ), P;
  };
  return {
    getLayoutEngineProp: n,
    getLayoutEngineOptions: p,
    isLegacyLayoutEngine: r,
    reset: R,
    start: (c) => m.start(c),
    rebase: (c) => m.rebase(c),
    getCommitted: () => m.getCommitted(),
    preview: (c, D, P, w = !1) => {
      var M;
      const W = {
        id: c,
        operation: D,
        baseRevision: (M = m.getState().interaction) == null ? void 0 : M.startRevision,
        heavy: w
      };
      return h(m.preparePreview(W), P);
    },
    commit: (c, D, P, w = !1) => {
      var M;
      const W = {
        id: c,
        operation: D,
        baseRevision: (M = m.getState().interaction) == null ? void 0 : M.startRevision,
        heavy: w
      };
      return h(m.prepareCommit(W), P);
    },
    dispose: (c = "component disposed") => {
      var D;
      v.cancel(c), (D = s.dispose) == null || D.call(s), m.dispose();
    }
  };
}
function Kn({
  getLayout: e,
  setLayout: t,
  setActiveDrag: n
}) {
  const r = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let l = null, s = null;
  const i = () => {
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
    p.layout && p.layout !== e() && t(p.layout), p.shouldCompact && an(e(), p.compactType, p.cols);
    const m = e(), R = he(m, p.placeholder.i);
    n(Z(
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
    cancel: i,
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
const ut = {
  margin: 48,
  speed: 20
};
function Qn({
  getConfig: e,
  rootClassName: t
}) {
  const n = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let r = null, l = null, s = null, i = null;
  const u = () => {
    const I = e();
    if (!I) return null;
    if (I === !0) return ut;
    if (typeof I != "object") return null;
    const h = typeof I.margin == "number" && Number.isFinite(I.margin) ? I.margin : ut.margin, a = typeof I.speed == "number" && Number.isFinite(I.speed) ? I.speed : ut.speed;
    return h <= 0 || a <= 0 ? null : { margin: h, speed: a };
  }, v = () => {
    s != null && n && cancelAnimationFrame(s), s = null, i = null;
  }, L = () => {
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
      const S = a.getComputedStyle(d), c = S.overflowY, D = S.overflowX, P = (c === "auto" || c === "scroll") && d.scrollHeight > d.clientHeight + 1, w = (D === "auto" || D === "scroll") && d.scrollWidth > d.clientWidth + 1;
      if (P || w) return d;
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
    const I = i;
    if (i = null, !I) return;
    const { container: h, dx: a, dy: d } = I;
    a === 0 && d === 0 || (h instanceof HTMLElement ? typeof h.scrollBy == "function" ? h.scrollBy({ left: a, top: d }) : (h.scrollLeft += a, h.scrollTop += d) : h.scrollBy({ left: a, top: d }));
  }, O = (I, h, a) => {
    if (i = { container: I, dx: h, dy: a }, !n) {
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
        const W = Math.min(1, Math.max(0, w / a.margin));
        return W <= 0 ? 0 : Math.ceil(W * a.speed);
      };
      let D = 0, P = 0;
      if (S instanceof HTMLElement) {
        const w = S.getBoundingClientRect(), W = w.top + a.margin, M = w.bottom - a.margin, te = w.left + a.margin, F = w.right - a.margin;
        d.y < W ? P = -c(W - d.y) : d.y > M && (P = c(d.y - M)), d.x < te ? D = -c(te - d.x) : d.x > F && (D = c(d.x - F)), P < 0 && S.scrollTop <= 0 && (P = 0), P > 0 && S.scrollTop + S.clientHeight >= S.scrollHeight && (P = 0), D < 0 && S.scrollLeft <= 0 && (D = 0), D > 0 && S.scrollLeft + S.clientWidth >= S.scrollWidth && (D = 0);
      } else {
        const w = S, W = a.margin, M = w.innerHeight - a.margin, te = a.margin, F = w.innerWidth - a.margin;
        d.y < W ? P = -c(W - d.y) : d.y > M && (P = c(d.y - M)), d.x < te ? D = -c(te - d.x) : d.x > F && (D = c(d.x - F));
      }
      if (D === 0 && P === 0) {
        v();
        return;
      }
      O(S, D, P);
    },
    reset: L
  };
}
function It({
  getDragActivationDistance: e,
  onEffects: t,
  onDiagnostics: n
} = {}) {
  const r = Dt(ot()), l = Dt([]), s = (m) => ({
    dragActivationDistance: m && "dragActivationDistance" in m ? m.dragActivationDistance : e == null ? void 0 : e()
  }), i = (m, R) => {
    const y = rt(r.value, m, s(R));
    return r.value = y.state, y.diagnostics.length > 0 && (l.value = l.value.concat(y.diagnostics), n == null || n(y.diagnostics)), y.effects.length > 0 && (t == null || t(y.effects, y)), y;
  };
  return {
    snapshot: r,
    diagnostics: l,
    dispatch: i,
    reset: (m = "reset") => {
      r.value.status !== "idle" && i({
        type: "CANCEL",
        interactionId: r.value.interactionId,
        reason: m
      }), r.value = ot();
    },
    isCurrentRequest: (m, R) => r.value.status === "committing" && r.value.interactionId === m && r.value.requestId === R,
    isCurrentPreviewRequest: (m, R) => er(r.value) === R && r.value.status !== "idle" && r.value.status !== "committing" && r.value.interactionId === m,
    isCurrentInteraction: (m, R) => {
      const y = r.value;
      return y.status === "idle" || y.interactionId !== m ? !1 : R ? y.status === "pending-drag" || y.status === "active-drag" ? R === "drag" : y.status === "active-resize" ? R === "resize" : y.status === "active-drop" ? R === "drop" : y.kind === R : !0;
    }
  };
}
function er(e) {
  return e.status === "active-drag" ? `${e.interactionId}:drag-preview:${e.previewSeq}` : e.status === "active-resize" ? `${e.interactionId}:resize-preview:${e.previewSeq}` : e.status === "active-drop" ? `${e.interactionId}:drop-preview:${e.previewSeq}` : null;
}
const Gt = 200;
function tr({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: r,
  frameUpdate: l,
  autoScroll: s,
  editor: i,
  interactionMachine: u,
  nextInteractionRequestId: v,
  syncHistory: L,
  onLayoutMaybeChanged: p
}) {
  const m = Te(!1), R = Te(!1), y = Te(null), O = Te(null), T = Te(null), I = Te([]), h = Te(null);
  let a = null, d = !1, S = null, c = null, D;
  const P = () => r.getLayoutEngineProp(), w = () => r.isLegacyLayoutEngine(), W = (o) => r.reset(o), M = (...o) => r.preview(...o), te = (...o) => r.commit(...o), F = u || It({
    getDragActivationDistance: () => e.dragActivationDistance
  }), _e = (o, z, k, q) => {
    let H = o.x, A = o.y, g = z, x = k;
    const Y = q === "sw" || q === "w" || q === "nw", K = q === "ne" || q === "n" || q === "nw";
    return Y && (H = o.x + (o.w - g), H < 0 && (H = 0, g = o.w)), K && (A = o.y + (o.h - x), A < 0 && (A = 0, x = o.h)), { ...o, x: H, y: A, w: g, h: x };
  }, Ge = () => {
    var o, z, k;
    return t.layout.length >= (((k = (z = (o = P()) == null ? void 0 : o.scheduler) == null ? void 0 : z.auto) == null ? void 0 : k.workerMinItems) || 1e3);
  }, V = () => {
    const o = e.width, z = e.containerPadding || e.margin;
    if (typeof o != "number" || !Number.isFinite(o) || o <= 0 || e.cols <= 0 || e.rowHeight <= 0)
      return;
    const k = Ft({
      containerWidth: o,
      cols: e.cols,
      margin: e.margin,
      containerPadding: z,
      rowHeight: e.rowHeight,
      maxRows: e.maxRows,
      renderPrecision: e.renderPrecision || void 0
    });
    if (!(!Number.isFinite(k) || k <= 0))
      return {
        colWidth: k,
        rowHeight: e.rowHeight,
        margin: [e.margin[0], e.margin[1]],
        containerPadding: [z[0], z[1]],
        renderPrecision: e.renderPrecision || "integer"
      };
  }, j = () => {
    T.value = null, I.value = [], h.value = null;
  }, Me = (o, z, k) => {
    m.value = !0, T.value = o, I.value = z.slice(), h.value = k || null;
  }, ye = (o, z, k, q = !1) => {
    if (o.status === "blocked" && o.blocked) {
      const H = o.blocked.reason, A = o.blocked.itemIds.length > 0 ? o.blocked.itemIds : z, g = `Pointer move blocked by ${H}.`;
      Me(H, A, g), q && i.notifyMoveBlocked({
        reason: H,
        ids: A,
        activeId: k,
        message: g,
        operationResult: o
      });
      return;
    }
    m.value = !1, j();
  }, be = () => {
    y.value = null, O.value = null, m.value = !1, R.value = !1, j(), a = null, d = !1, S = null, c = null, D = void 0, F.reset("clear-active-interaction");
  }, f = () => {
    t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), i.clearGuides(), F.reset("finish-drag-interaction");
  }, b = (o, z) => o.x === z.x && o.y === z.y && o.w === z.w && o.h === z.h, E = (o, z) => o.find((k) => k.type === z), ne = (o) => o.kind === "group" ? {
    kind: "group",
    activeId: o.activeId,
    ids: o.ids
  } : o.kind === "blocked" ? {
    kind: "blocked",
    reason: o.reason,
    ids: o.ids,
    activeId: o.activeId
  } : {
    kind: "single",
    id: o.id
  }, ie = () => {
    t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, O.value = null, R.value = !1, c = null, s.reset(), i.clearGuides(), t.oldLayout = null, F.reset("resize-cleanup"), D = void 0;
  };
  return {
    activeDragId: y,
    activeResizeId: O,
    dragBlocked: m,
    dragBlockedReason: T,
    dragBlockedItemIds: I,
    dragBlockedMessage: h,
    resizeBlocked: R,
    clearActiveInteraction: be,
    onResizeStart: (o, z, k, { e: q, node: H, handle: A }) => {
      l.cancel();
      const { layout: g } = t, x = he(g, o);
      if (!x) return;
      const Y = A || "se", K = v("resize-interaction", o), B = F.dispatch({
        type: "START_RESIZE",
        interactionId: K,
        itemId: o,
        handle: Y,
        geometry: { x: x.x, y: x.y, w: x.w, h: x.h }
      });
      E(B.effects, "EMIT_RESIZE_START") && (c = K, D = void 0, L(g, "replace"), O.value = o, R.value = !1, i.resetSnap(), s.init(H), t.oldResizeItem = He(x), t.oldLayout = Fe(g), t.resizing = !0, w() || (W(g), r.start({
        id: v("resize-start", o),
        type: "resize",
        itemId: o
      })), n.emitResizeStart(g, x, x, void 0, q, H));
    },
    onResize: (o, z, k, { e: q, node: H, handle: A }) => {
      var Ye;
      const { oldResizeItem: g } = t, { cols: x, preventCollision: Y, allowOverlap: K } = e, B = A, Q = he(t.layout, o);
      if (!Q) return;
      const se = _e(Q, z, k, B);
      if (b(Q, se))
        return;
      if (!w()) {
        const Se = t.layout, ve = he(Se, o);
        if (!ve) return;
        s.maybeScroll(q, H);
        const qe = i.snapCandidate(
          o,
          ve,
          _e(ve, z, k, B),
          Se,
          B
        ), ce = (Ye = i.resolveResizeIntent) == null ? void 0 : Ye.call(i, {
          id: o,
          item: ve,
          layout: Se,
          handle: B,
          rawCandidate: qe,
          metrics: V(),
          phase: "preview"
        });
        if ((ce == null ? void 0 : ce.kind) === "blocked") {
          R.value = !0, t.activeDrag = Z({
            w: ve.w,
            h: ve.h,
            x: ve.x,
            y: ve.y,
            static: !0,
            i: o
          }), i.updateIntelligence(o, ve, ve, B);
          return;
        }
        const me = (ce == null ? void 0 : ce.kind) === "allowed" ? ce.candidate : qe;
        D = (ce == null ? void 0 : ce.kind) === "allowed" ? ce.constraint : D;
        let Oe;
        if (c) {
          const Ee = F.dispatch({
            type: "MOVE_RESIZE",
            interactionId: c,
            geometry: {
              x: me.x,
              y: me.y,
              w: me.w,
              h: me.h
            }
          });
          if (Oe = E(Ee.effects, "PREVIEW_RESIZE"), !Oe) return;
        }
        if (!Oe) return;
        M(
          Oe.requestId,
          {
            type: "resize",
            id: o,
            w: me.w,
            h: me.h,
            x: me.x,
            y: me.y,
            handle: B,
            constraint: D
          },
          (Ee) => {
            if (Ee.status === "stale" || !F.isCurrentPreviewRequest(Oe.interactionId, Oe.requestId) || O.value !== o) return;
            const ze = Ee.status === "changed" || Ee.status === "fallback" ? Ee.layout : r.getCommitted(), Pe = he(ze, o) || ve, Ve = Ee.placeholder || {
              w: Pe.w,
              h: Pe.h,
              x: Pe.x,
              y: Pe.y,
              static: !0,
              i: o
            };
            O.value === o && (R.value = Ee.status === "blocked"), n.emitResize(ze, g, Pe, Ve, q, H), (Ee.status === "changed" || Ee.status === "fallback") && (t.layout = Z(ze)), t.activeDrag = Z(Ve), i.updateIntelligence(o, ve, Ve, B);
          },
          Ge()
        );
        return;
      }
      const $ = t.layout.length >= Gt;
      if (s.maybeScroll(q, H), !$) {
        const { layout: Se } = t;
        let ve = !1, qe, ce, me, Oe = !1;
        const [Ee, ze] = cn(Se, o, (le) => {
          ce = le.x, me = le.y;
          const vt = A === "sw" || A === "w" || A === "nw", Rt = A === "ne" || A === "n" || A === "nw";
          (vt || Rt) && (vt && (ce = le.x + (le.w - z), z = le.x !== ce && ce < 0 ? le.w : z, ce = ce < 0 ? 0 : ce), Rt && (me = le.y + (le.h - k), k = le.y !== me && me < 0 ? le.h : k, me = me < 0 ? 0 : me), ve = !0);
          const Ke = i.snapCandidate(
            o,
            le,
            { ...le, x: ce, y: me, w: z, h: k },
            Se,
            A
          );
          return ce = Ke.x, me = Ke.y, z = Ke.w, k = Ke.h, ve = ve || ce !== le.x || me !== le.y, Y && !K && (Oe = nt(Se, { ...le, w: z, h: k, x: ce, y: me }).length > 0, Oe && (me = le.y, k = le.h, ce = le.x, z = le.w, ve = !1)), le.w = z, le.h = k, le;
        });
        if (!ze) return;
        O.value === o && (R.value = Oe), qe = Ee, ve && (qe = Qe(
          Ee,
          ze,
          xe(e),
          x,
          K,
          ce,
          me,
          !0,
          e.preventCollision
        ));
        const Pe = {
          w: ze.w,
          h: ze.h,
          x: ze.x,
          y: ze.y,
          static: !0,
          i: o
        };
        if (c) {
          const le = F.dispatch({
            type: "MOVE_RESIZE",
            interactionId: c,
            geometry: { x: Pe.x, y: Pe.y, w: Pe.w, h: Pe.h }
          });
          if (!E(le.effects, "PREVIEW_RESIZE")) return;
        }
        n.emitResize(qe, g, ze, Pe, q, H);
        const Ve = K ? qe : Ue(qe, xe(e), x), Je = he(Ve, o) || ze, ht = {
          ...Pe,
          w: Je.w,
          h: Je.h,
          x: Je.x,
          y: Je.y
        };
        t.layout = Z(Ve), t.activeDrag = Z(ht), i.updateIntelligence(o, ze, ht, A);
        return;
      }
      const fe = t.layout, G = he(fe, o);
      if (!G) return;
      const Ce = G.x, De = G.y, ge = G.w, C = G.h;
      let N = !1, _ = G.x, U = G.y, ee = !1;
      const oe = A === "sw" || A === "w" || A === "nw", Ie = A === "ne" || A === "n" || A === "nw";
      (oe || Ie) && (oe && (_ = G.x + (G.w - z), z = G.x !== _ && _ < 0 ? G.w : z, _ = _ < 0 ? 0 : _), Ie && (U = G.y + (G.h - k), k = G.y !== U && U < 0 ? G.h : k, U = U < 0 ? 0 : U), N = !0);
      const ae = i.snapCandidate(
        o,
        G,
        { ...G, x: _, y: U, w: z, h: k },
        fe,
        A
      );
      _ = ae.x, U = ae.y, z = ae.w, k = ae.h, N = N || _ !== G.x || U !== G.y, Y && !K && (ee = nt(fe, { ...G, w: z, h: k, x: _, y: U }).length > 0, ee && (_ = G.x, U = G.y, z = G.w, k = G.h, N = !1)), O.value === o && (R.value = ee), G.w = z, G.h = k;
      let Re = fe;
      N && (Re = Qe(
        fe,
        G,
        xe(e),
        x,
        K,
        _,
        U,
        !0,
        e.preventCollision
      ));
      const re = {
        w: G.w,
        h: G.h,
        x: G.x,
        y: G.y,
        static: !0,
        i: o
      };
      if (c) {
        const Se = F.dispatch({
          type: "MOVE_RESIZE",
          interactionId: c,
          geometry: { x: re.x, y: re.y, w: re.w, h: re.h }
        });
        if (!E(Se.effects, "PREVIEW_RESIZE")) return;
      }
      n.emitResize(Re, g, G, re, q, H), (G.x !== Ce || G.y !== De || G.w !== ge || G.h !== C || K && Re !== t.layout) && (K || l.resetMovedFlags(fe), l.schedule({
        cols: x,
        compactType: xe(e),
        layout: K && Re !== t.layout ? Re : void 0,
        placeholder: re,
        shouldCompact: !K
      }), i.updateIntelligence(o, G, re, A));
    },
    onResizeStop: (o, z, k, { e: q, node: H, handle: A }) => {
      var De;
      l.cancel();
      const { layout: g, oldResizeItem: x, oldLayout: Y } = t, { cols: K, allowOverlap: B } = e, Q = he(g, o);
      if (!Q) return;
      const se = A, $ = t.activeDrag || _e(Q, z, k, se);
      let fe;
      if (c) {
        const ge = F.dispatch({
          type: "STOP_RESIZE",
          interactionId: c,
          geometry: {
            x: $.x,
            y: $.y,
            w: $.w,
            h: $.h
          }
        });
        if (fe = E(ge.effects, "COMMIT_RESIZE"), !fe) {
          (E(ge.effects, "EMIT_RESIZE_STOP") || !c) && n.emitResizeStop(g, x, Q, void 0, q, H), ie();
          return;
        }
      }
      if (!fe) {
        n.emitResizeStop(g, x, Q, void 0, q, H), ie();
        return;
      }
      if (!w()) {
        let ge = $;
        const C = r.getCommitted(), N = (De = i.resolveResizeIntent) == null ? void 0 : De.call(i, {
          id: o,
          item: Q,
          layout: g,
          handle: se,
          rawCandidate: ge,
          metrics: V(),
          phase: "commit"
        });
        if ((N == null ? void 0 : N.kind) === "blocked") {
          R.value = !0, n.emitResizeStop(g, x, Q, void 0, q, H), ie();
          return;
        }
        (N == null ? void 0 : N.kind) === "allowed" && (ge = N.candidate, D = N.constraint || D), te(
          fe.requestId,
          {
            type: "resize",
            id: o,
            w: ge.w,
            h: ge.h,
            x: ge.x,
            y: ge.y,
            handle: A,
            constraint: D
          },
          (_) => {
            (async () => {
              var ae, Re;
              if (_.status === "stale" || !F.isCurrentRequest(fe.interactionId, fe.requestId)) return;
              let U = [];
              if (c) {
                const re = _.status === "cancelled" ? "error" : _.status;
                U = F.dispatch({
                  type: "APPLY_RESULT",
                  interactionId: c,
                  requestId: fe.requestId,
                  status: re
                }).effects;
              }
              const ee = _.status === "changed" || _.status === "fallback" ? _.layout : r.getCommitted(), oe = he(ee, o) || Q, Ie = _.status === "changed" || _.status === "fallback" ? (t.suppressLayoutChange = !0, await ((ae = i.commitResize) == null ? void 0 : ae.call(i, {
                id: o,
                beforeLayout: Y || C || g,
                afterLayout: ee,
                handle: se
              }))) : null;
              if (Ie && Ie.status !== "changed" && Ie.status !== "noop") {
                const re = Y || C || g;
                t.suppressLayoutChange = !0, t.layout = Z(re), (Re = i.rollbackInteraction) == null || Re.call(i, re, Ie.status), t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, O.value = null, R.value = !1, c = null, D = void 0, s.reset(), t.oldLayout = null;
                return;
              }
              E(U, "EMIT_RESIZE_STOP") && n.emitResizeStop(ee, x, oe, void 0, q, H), t.activeDrag = null, t.layout = Z(ee), t.oldResizeItem = null, t.resizing = !1, O.value = null, R.value = !1, c = null, D = void 0, s.reset(), i.clearGuides(), t.oldLayout = null, p(ee, Y || C || g, "push");
            })();
          },
          Ge()
        );
        return;
      }
      const G = B ? g : Ue(g, xe(e), K);
      let Ce = [];
      c && fe && (Ce = F.dispatch({
        type: "APPLY_RESULT",
        interactionId: c,
        requestId: fe.requestId,
        status: "changed"
      }).effects), (async () => {
        var C, N;
        const ge = (t.suppressLayoutChange = !0, await ((C = i.commitResize) == null ? void 0 : C.call(i, {
          id: o,
          beforeLayout: Y || g,
          afterLayout: G,
          handle: se
        })));
        if (ge && ge.status !== "changed" && ge.status !== "noop") {
          const _ = Y || g;
          t.suppressLayoutChange = !0, t.layout = Z(_), (N = i.rollbackInteraction) == null || N.call(i, _, ge.status), ie();
          return;
        }
        E(Ce, "EMIT_RESIZE_STOP") && n.emitResizeStop(G, x, Q, void 0, q, H), t.activeDrag = null, t.layout = Z(G), t.oldResizeItem = null, t.resizing = !1, O.value = null, R.value = !1, c = null, D = void 0, s.reset(), i.clearGuides(), t.oldLayout = null, p(G, Y || g, "push");
      })();
    },
    onDragStart: (o, z, k, { e: q, node: H }) => {
      l.cancel();
      const { layout: A } = t, g = he(A, o);
      if (!g) return;
      const x = i.resolveMoveDrag({
        id: o,
        item: g,
        layout: A,
        legacyLayoutEngine: w(),
        event: q
      });
      if (x.kind === "blocked") {
        a = {
          kind: "blocked",
          reason: x.reason,
          ids: x.ids,
          activeId: x.activeId
        };
        const Q = v("drag-interaction", o), se = F.dispatch({
          type: "START_DRAG",
          interactionId: Q,
          itemId: o,
          grid: { x: z, y: k },
          context: ne(a)
        });
        if (!E(se.effects, "EMIT_DRAG_START")) {
          a = null;
          return;
        }
        return S = Q, y.value = x.activeId || o, Me(
          x.reason,
          x.ids,
          `Pointer move blocked by ${x.reason}.`
        ), t.oldDragItem = He(g), t.oldLayout = Fe(A), t.activeDrag = Z({ w: g.w, h: g.h, x: g.x, y: g.y, placeholder: !0, i: o }), d = !1, i.notifyMoveBlocked({
          ...x,
          message: `Pointer move blocked by ${x.reason}.`
        }), n.emitDragStart(A, g, g, void 0, q, H);
      }
      const Y = { w: g.w, h: g.h, x: g.x, y: g.y, placeholder: !0, i: o };
      a = x.kind === "group" ? {
        kind: "group",
        activeId: x.activeId,
        ids: x.ids,
        startX: g.x,
        startY: g.y
      } : {
        kind: "single",
        id: x.id,
        startX: g.x,
        startY: g.y
      };
      const K = v("drag-interaction", o), B = F.dispatch({
        type: "START_DRAG",
        interactionId: K,
        itemId: o,
        grid: { x: z, y: k },
        context: ne(a)
      });
      if (!E(B.effects, "EMIT_DRAG_START")) {
        a = null;
        return;
      }
      return S = K, L(A, "replace"), y.value = a.kind === "group" ? a.activeId : o, m.value = !1, j(), i.resetSnap(), i.clearGuides(), d = !1, s.init(H), t.oldDragItem = He(g), t.oldLayout = Fe(A), t.activeDrag = Z(Y), w() || (W(A), r.start({
        id: S,
        type: "drag",
        itemId: y.value || o
      })), n.emitDragStart(A, g, g, void 0, q, H);
    },
    onDrag: (o, z, k, { e: q, node: H }) => {
      const { oldDragItem: A } = t;
      let { layout: g } = t;
      const { cols: x, allowOverlap: Y, preventCollision: K } = e, B = he(g, o);
      if (!B) return;
      if (s.maybeScroll(q, H), (a == null ? void 0 : a.kind) === "blocked") {
        m.value = !0;
        return;
      }
      if (!S) return;
      if ((a == null ? void 0 : a.kind) === "group" && !w()) {
        const C = a, N = he(g, C.activeId) || B, _ = i.snapCandidate(
          C.activeId,
          N,
          { ...N, x: z, y: k },
          g
        ), U = F.dispatch({
          type: "MOVE_DRAG",
          interactionId: S,
          currentPx: { x: _.x, y: _.y },
          grid: { x: _.x, y: _.y }
        }), ee = E(U.effects, "PREVIEW_DRAG");
        if (!ee) {
          d || i.clearGuides();
          return;
        }
        d = !0;
        const oe = _.x - C.startX, Ie = _.y - C.startY;
        M(
          ee.requestId,
          {
            type: "groupMove",
            ids: C.ids,
            activeId: C.activeId,
            dx: oe,
            dy: Ie,
            userAction: !0
          },
          (ae) => {
            if (ae.status === "stale" || !F.isCurrentPreviewRequest(ee.interactionId, ee.requestId) || a !== C || y.value !== C.activeId) return;
            const Re = ae.status === "changed" || ae.status === "fallback" ? ae.layout : r.getCommitted(), re = he(Re, C.activeId) || N, Be = ae.placeholder || {
              w: re.w,
              h: re.h,
              x: re.x,
              y: re.y,
              placeholder: !0,
              i: C.activeId
            };
            y.value === C.activeId && ye(ae, C.ids, C.activeId), n.emitDrag(Re, A, re, Be, q, H), (ae.status === "changed" || ae.status === "fallback") && (t.layout = Z(Re)), t.activeDrag = Z(Be), i.updateIntelligence(C.activeId, N, Be);
          },
          Ge()
        );
        return;
      }
      if (!w()) {
        const C = i.snapCandidate(o, B, { ...B, x: z, y: k }, g), N = F.dispatch({
          type: "MOVE_DRAG",
          interactionId: S,
          currentPx: { x: C.x, y: C.y },
          grid: { x: C.x, y: C.y }
        }), _ = E(N.effects, "PREVIEW_DRAG");
        if (!_) {
          d || i.clearGuides();
          return;
        }
        d = !0, M(
          _.requestId,
          { type: "move", id: o, x: C.x, y: C.y, userAction: !0 },
          (U) => {
            if (U.status === "stale" || !F.isCurrentPreviewRequest(_.interactionId, _.requestId) || (a == null ? void 0 : a.kind) !== "single" || a.id !== o || y.value !== o) return;
            const ee = U.status === "changed" || U.status === "fallback" ? U.layout : r.getCommitted(), oe = he(ee, o) || B, Ie = U.placeholder || {
              w: oe.w,
              h: oe.h,
              x: oe.x,
              y: oe.y,
              placeholder: !0,
              i: o
            };
            y.value === o && ye(U, [o], o), n.emitDrag(ee, A, oe, Ie, q, H), (U.status === "changed" || U.status === "fallback") && (t.layout = Z(ee)), t.activeDrag = Z(Ie), i.updateIntelligence(o, B, Ie);
          },
          Ge()
        );
        return;
      }
      const Q = t.layout.length >= Gt, se = B.x, $ = B.y;
      if (y.value === o) {
        const C = K && !Y ? nt(g, { ...B, x: z, y: k }) : [];
        C.length > 0 ? Me(
          "collision",
          C.map((N) => N.i),
          "Pointer move blocked by collision."
        ) : (m.value = !1, j());
      }
      const fe = !0, G = i.snapCandidate(o, B, { ...B, x: z, y: k }, g), Ce = F.dispatch({
        type: "MOVE_DRAG",
        interactionId: S,
        currentPx: { x: G.x, y: G.y },
        grid: { x: G.x, y: G.y }
      });
      if (!E(Ce.effects, "PREVIEW_DRAG")) {
        d || i.clearGuides();
        return;
      }
      d = !0, g = Qe(
        g,
        B,
        xe(e),
        x,
        Y,
        G.x,
        G.y,
        fe,
        K
      );
      const De = { w: B.w, h: B.h, x: B.x, y: B.y, placeholder: !0, i: o };
      if (n.emitDrag(g, A, B, De, q, H), !!(B.x !== se || B.y !== $ || Y && g !== t.layout)) {
        if (!Q) {
          const C = Y ? g : Ue(g, xe(e), x), N = he(C, o) || B, _ = {
            w: N.w,
            h: N.h,
            x: N.x,
            y: N.y,
            placeholder: !0,
            i: o
          };
          t.layout = Z(C), t.activeDrag = Z(_), i.updateIntelligence(o, B, _);
          return;
        }
        Y || l.resetMovedFlags(t.layout), l.schedule({
          cols: x,
          compactType: xe(e),
          layout: Y && g !== t.layout ? g : void 0,
          placeholder: De,
          shouldCompact: !Y
        }), i.updateIntelligence(o, B, De);
      }
    },
    onDragStop: (o, z, k, { e: q, node: H }) => {
      if (l.cancel(), !t.activeDrag) return;
      const { oldDragItem: A, oldLayout: g } = t, x = t.layout;
      let Y = x;
      const { cols: K, preventCollision: B, allowOverlap: Q } = e, se = he(Y, o);
      if (!se) return;
      let $, fe = [];
      if (S) {
        const C = F.dispatch({
          type: "STOP_DRAG",
          interactionId: S,
          grid: { x: z, y: k }
        });
        fe = C.effects, $ = E(C.effects, "COMMIT_DRAG");
      }
      if (!$) {
        (E(fe, "EMIT_DRAG_STOP") || !S) && n.emitDragStop(x, A, se, void 0, q, H), f(), t.oldLayout = null;
        return;
      }
      if ((a == null ? void 0 : a.kind) === "group" && !w()) {
        const C = a, N = t.activeDrag || { x: z, y: k }, _ = N.x - C.startX, U = N.y - C.startY, ee = r.getCommitted();
        te(
          $.requestId,
          {
            type: "groupMove",
            ids: C.ids,
            activeId: C.activeId,
            dx: _,
            dy: U,
            userAction: !0
          },
          (oe) => {
            (async () => {
              var Be, Ye;
              if (oe.status === "stale" || !F.isCurrentRequest($.interactionId, $.requestId)) return;
              oe.status === "blocked" && ye(oe, C.ids, C.activeId, !0);
              const Ie = F.dispatch({
                type: "APPLY_RESULT",
                interactionId: $.interactionId,
                requestId: $.requestId,
                status: oe.status === "cancelled" ? "error" : oe.status
              }).effects, ae = oe.status === "changed" || oe.status === "fallback" ? oe.layout : r.getCommitted(), Re = he(ae, C.activeId) || se, re = oe.status === "changed" || oe.status === "fallback" ? (t.suppressLayoutChange = !0, await ((Be = i.commitMove) == null ? void 0 : Be.call(i, {
                ids: C.ids,
                activeId: C.activeId,
                beforeLayout: g || ee || x,
                afterLayout: ae,
                source: "pointer"
              }))) : null;
              if (re && re.status !== "changed" && re.status !== "noop") {
                const Se = g || ee || x;
                t.suppressLayoutChange = !0, t.layout = Z(Se), (Ye = i.rollbackInteraction) == null || Ye.call(i, Se, re.status), t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), t.oldLayout = null;
                return;
              }
              E(Ie, "EMIT_DRAG_STOP") && n.emitDragStop(ae, A, Re, void 0, q, H), t.activeDrag = null, t.layout = Z(ae), t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), i.clearGuides(), t.oldLayout = null, p(ae, g || ee || x, "push");
            })();
          },
          Ge()
        );
        return;
      }
      if (!w()) {
        const C = t.activeDrag || { x: z, y: k }, N = r.getCommitted();
        te(
          $.requestId,
          { type: "move", id: o, x: C.x, y: C.y, userAction: !0 },
          (_) => {
            (async () => {
              var ae, Re;
              if (_.status === "stale" || !F.isCurrentRequest($.interactionId, $.requestId)) return;
              _.status === "blocked" && ye(_, [o], o, !0);
              const U = F.dispatch({
                type: "APPLY_RESULT",
                interactionId: $.interactionId,
                requestId: $.requestId,
                status: _.status === "cancelled" ? "error" : _.status
              }).effects, ee = _.status === "changed" || _.status === "fallback" ? _.layout : r.getCommitted(), oe = he(ee, o) || se, Ie = _.status === "changed" || _.status === "fallback" ? (t.suppressLayoutChange = !0, await ((ae = i.commitMove) == null ? void 0 : ae.call(i, {
                ids: [o],
                activeId: o,
                beforeLayout: g || N || x,
                afterLayout: ee,
                source: "pointer"
              }))) : null;
              if (Ie && Ie.status !== "changed" && Ie.status !== "noop") {
                const re = g || N || x;
                t.suppressLayoutChange = !0, t.layout = Z(re), (Re = i.rollbackInteraction) == null || Re.call(i, re, Ie.status), t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), t.oldLayout = null;
                return;
              }
              E(U, "EMIT_DRAG_STOP") && n.emitDragStop(ee, A, oe, void 0, q, H), t.activeDrag = null, t.layout = Z(ee), t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), i.clearGuides(), t.oldLayout = null, p(ee, g || N || x, "push");
            })();
          },
          Ge()
        );
        return;
      }
      const G = !0, Ce = t.activeDrag || { x: z, y: k };
      Y = Qe(
        Y,
        se,
        xe(e),
        K,
        Q,
        Ce.x,
        Ce.y,
        G,
        B
      );
      const De = Q ? Y : Ue(Y, xe(e), K), ge = F.dispatch({
        type: "APPLY_RESULT",
        interactionId: $.interactionId,
        requestId: $.requestId,
        status: "changed"
      }).effects;
      (async () => {
        var N, _;
        const C = (t.suppressLayoutChange = !0, await ((N = i.commitMove) == null ? void 0 : N.call(i, {
          ids: [o],
          activeId: o,
          beforeLayout: g || x,
          afterLayout: De,
          source: "pointer"
        })));
        if (C && C.status !== "changed" && C.status !== "noop") {
          const U = g || x;
          t.suppressLayoutChange = !0, t.layout = Z(U), (_ = i.rollbackInteraction) == null || _.call(i, U, C.status), t.activeDrag = null, t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), t.oldLayout = null;
          return;
        }
        E(ge, "EMIT_DRAG_STOP") && n.emitDragStop(De, A, se, void 0, q, H), t.activeDrag = null, t.layout = Z(De), t.oldDragItem = null, y.value = null, m.value = !1, j(), a = null, d = !1, S = null, s.reset(), i.clearGuides(), t.oldLayout = null, p(De, g || x, "push");
      })();
    }
  };
}
function nr({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: r,
  frameUpdate: l,
  autoScroll: s,
  editor: i,
  isFirefox: u,
  layoutClassName: v,
  interactionMachine: L,
  nextInteractionRequestId: p
}) {
  const m = Te(0);
  let R = null;
  const y = L || It({
    getDragActivationDistance: () => e.dragActivationDistance
  }), O = () => r.getLayoutEngineProp(), T = () => r.isLegacyLayoutEngine(), I = (f = t.layout) => r.reset(f), h = (...f) => r.preview(...f), a = (...f) => r.commit(...f), d = (f, b) => f.find((E) => E.type === b), S = (f) => {
    if (!R) {
      const b = p("drop", f), E = y.dispatch({
        type: "ENTER_DROP",
        interactionId: b,
        itemId: f
      });
      if (d(E.effects, "REJECT_TRANSITION")) return null;
      R = b;
    }
    return R;
  }, c = (f, b, E, ne) => {
    const ie = S(f);
    if (!ie) return null;
    const X = y.dispatch({
      type: "MOVE_DROP",
      interactionId: ie,
      grid: b,
      size: E,
      strategy: ne
    });
    return d(X.effects, "PREVIEW_DROP") || null;
  }, D = (f) => {
    y.reset(f), R = null;
  }, P = (f) => {
    t.externalDropSession = f ? Z(f) : null;
  }, w = (f) => t.layout.filter((b) => b.i !== f), W = () => {
    const f = String(e.droppingItem.i), b = S(f);
    if (!b) return null;
    const E = t.externalDropSession;
    if (E && E.id === f && E.status !== "committing")
      return E;
    const ne = Zn({
      id: f,
      interactionId: b,
      sourceItem: e.droppingItem,
      baseLayout: w(f),
      strategy: e.dropStrategy
    });
    return P(ne), ne;
  }, M = (f = "drop-cleanup") => {
    P(null), s.reset(), i.clearGuides(), D(f);
  }, te = (f, b) => {
    const E = $n(f, b);
    P(E), E.status === "ready" && E.ghostItem && i.updateIntelligence(E.id, E.ghostItem, E.ghostItem);
  }, F = (f, b) => {
    const E = Ue(
      [...f.baseLayout.map(He), He(b)],
      xe(e),
      e.cols,
      e.allowOverlap
    ), ne = he(E, f.id) || b;
    return {
      status: "changed",
      layout: E,
      placeholder: ne
    };
  }, _e = (f) => {
    const { cols: b, maxRows: E, allowOverlap: ne } = e, ie = f.target || { x: f.resolvedItem.x, y: f.resolvedItem.y };
    let X = null;
    if (f.strategy === "auto") {
      const J = ln(
        f.baseLayout,
        { w: f.resolvedItem.w, h: f.resolvedItem.h },
        b,
        ie.x,
        ie.y,
        E
      );
      if (J) {
        const pe = {
          ...f.resolvedItem,
          x: J.x,
          y: J.y,
          static: !1
        };
        X = i.snapCandidate(f.id, pe, pe, f.baseLayout);
      }
    } else if (X = He(f.resolvedItem), !ne) {
      const J = nt(f.baseLayout, X);
      J.length > 0 && (X.x = Math.min(...J.map((pe) => pe.x)), X.y = Math.max(...J.map((pe) => pe.y + pe.h)));
    }
    return !X || X.y + X.h > E ? {
      status: "blocked",
      layout: f.baseLayout,
      blocked: { reason: "maxRows", itemIds: [f.id] },
      placeholder: X || f.resolvedItem
    } : F(f, X);
  }, Ge = (f) => {
    const b = f.ghostItem || f.resolvedItem;
    return F(f, b);
  }, V = async (f, b, E, ne, ie) => {
    var we, o, z, k, q, H, A;
    if (b.status === "stale" || !y.isCurrentRequest(ne, ie)) return;
    const X = b.status === "cancelled" ? "error" : b.status;
    if (y.dispatch({
      type: "APPLY_RESULT",
      interactionId: ne,
      requestId: ie,
      status: X
    }), b.status === "blocked" || b.status === "cancelled" || b.status === "error") {
      const g = Xt(f, ((we = b.drop) == null ? void 0 : we.reason) || ((o = b.blocked) == null ? void 0 : o.reason) || "commit-rejected", {
        geometry: b.placeholder || f.ghostItem || f.resolvedItem,
        message: (z = b.error) == null ? void 0 : z.message,
        itemIds: (k = b.blocked) == null ? void 0 : k.itemIds
      });
      P(g), M(((q = g.blocked) == null ? void 0 : q.reason) || "drop-commit-rejected");
      return;
    }
    const { committedLayout: J, committedItem: pe, eventLayout: ke } = Un(f, b), de = pe ? (t.suppressLayoutChange = !0, await ((H = i.commitDrop) == null ? void 0 : H.call(i, {
      id: f.id,
      beforeLayout: f.baseLayout,
      afterLayout: J,
      item: pe,
      event: E
    }))) : null;
    if (de && de.status !== "changed" && de.status !== "noop") {
      t.suppressLayoutChange = !0, t.layout = Z(f.baseLayout), (A = i.rollbackInteraction) == null || A.call(i, f.baseLayout, de.status), m.value = 0, M(de.status);
      return;
    }
    m.value = 0, n.emitDrop(ke, E, pe), M("drop-cleanup");
  };
  return {
    clearDropInteraction: () => M("clear-active-interaction"),
    removeDroppingPlaceholder: M,
    onDrop: (f) => {
      var ke, de, we, o;
      f.preventDefault(), f.stopPropagation();
      const b = t.externalDropSession, E = !!(b && !b.blocked && (b.status === "ready" || b.status === "previewing" && b.ghostItem));
      if (!b || !E) {
        m.value = 0, M(((ke = b == null ? void 0 : b.blocked) == null ? void 0 : ke.reason) || "drop-commit-rejected");
        return;
      }
      const ne = S(b.id);
      if (!ne) {
        M("drop-commit-rejected");
        return;
      }
      const ie = y.dispatch({
        type: "COMMIT_DROP",
        interactionId: ne
      }), X = d(ie.effects, "COMMIT_DROP");
      if (!X) {
        M("drop-commit-rejected");
        return;
      }
      const J = {
        ...b,
        status: "committing",
        requestId: X.requestId
      }, pe = _t(J, "commit");
      if (P(J), T()) {
        V(
          J,
          Ge(J),
          f,
          X.interactionId,
          X.requestId
        );
        return;
      }
      I(J.baseLayout), r.start({
        id: p("drop-commit", J.id),
        type: "drop",
        itemId: J.id
      }), a(
        X.requestId,
        pe,
        (z) => {
          V(
            J,
            z,
            f,
            X.interactionId,
            X.requestId
          );
        },
        J.baseLayout.length >= (((o = (we = (de = O()) == null ? void 0 : de.scheduler) == null ? void 0 : we.auto) == null ? void 0 : o.workerMinItems) || 1e3)
      );
    },
    onDragEnter: (f) => {
      f.preventDefault(), f.stopPropagation(), m.value === 0 && W(), m.value++;
    },
    onDragLeave: (f) => {
      f.preventDefault(), f.stopPropagation(), m.value = Math.max(0, m.value - 1), m.value === 0 && M("drag-leave");
    },
    onDragOver: (f) => {
      var G, Ce, De, ge, C;
      if (f.preventDefault(), f.stopPropagation(), u && !((Ce = (G = f.currentTarget) == null ? void 0 : G.classList) != null && Ce.contains(v)))
        return !1;
      const b = W();
      if (!b) return !1;
      const E = n.callDropDragOver(f);
      if (E === !1)
        return M("drop-drag-over-rejected"), !1;
      const {
        margin: ne,
        cols: ie,
        rowHeight: X,
        maxRows: J,
        width: pe,
        containerPadding: ke,
        transformScale: de,
        dropStrategy: we
      } = e, o = f.currentTarget instanceof Element ? f.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, z = (f.clientX - o.left) / de, k = (f.clientY - o.top) / de, q = typeof (E == null ? void 0 : E.w) == "number" ? E.w : e.droppingItem.w, H = typeof (E == null ? void 0 : E.h) == "number" ? E.h : e.droppingItem.h, A = {
        cols: ie,
        margin: ne,
        maxRows: J,
        rowHeight: X,
        containerWidth: pe || 0,
        containerPadding: ke || ne,
        renderPrecision: e.renderPrecision || void 0
      }, g = je(A, 0, 0, q, H), x = Vt(
        A,
        k - g.height / 2,
        z - g.width / 2,
        q,
        H
      ), Y = w(b.id), K = {
        ...b.resolvedItem,
        ...e.droppingItem,
        i: b.id,
        w: q,
        h: H,
        x: x.x,
        y: x.y,
        static: !1
      }, B = i.snapCandidate(b.id, K, K, Y), Q = Yn(b, {
        overrides: E || null,
        target: { x: B.x, y: B.y },
        strategy: we,
        baseLayout: Y,
        snapCandidate: () => B
      }), se = c(
        Q.id,
        { x: Q.resolvedItem.x, y: Q.resolvedItem.y },
        { w: Q.resolvedItem.w, h: Q.resolvedItem.h },
        we
      );
      if (!se) {
        P(Q);
        return;
      }
      const $ = {
        ...Q,
        requestId: se.requestId,
        status: "previewing"
      }, fe = _t($, "preview");
      if (P($), T()) {
        te($, _e($));
        return;
      }
      I($.baseLayout), r.start({
        id: R || se.interactionId,
        type: "drop",
        itemId: $.id
      }), h(
        se.requestId,
        fe,
        (N) => {
          N.status !== "stale" && y.isCurrentPreviewRequest(se.interactionId, se.requestId) && te($, N);
        },
        $.baseLayout.length >= (((C = (ge = (De = O()) == null ? void 0 : De.scheduler) == null ? void 0 : ge.auto) == null ? void 0 : C.workerMinItems) || 1e3)
      );
    }
  };
}
function rr(e) {
  const t = It({
    getDragActivationDistance: () => e.props.dragActivationDistance
  }), n = {
    ...e,
    interactionMachine: t
  }, r = tr(n), l = nr(n);
  return {
    ...r,
    ...l,
    clearActiveInteraction: () => {
      r.clearActiveInteraction(), l.clearDropInteraction();
    }
  };
}
const ir = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, dt = (e, t = {}) => ({
  code: "measurement-unavailable",
  level: "warning",
  message: "Parent container height measurement was unavailable.",
  prop: "autoMeasureContainerHeight",
  details: {
    reason: e,
    ...t
  }
}), tt = (e) => {
  const t = Number.parseFloat(e || "0");
  return Number.isFinite(t) ? t : 0;
}, or = (e) => {
  var l, s;
  const t = e.getBoundingClientRect(), n = ((l = e.ownerDocument) == null ? void 0 : l.defaultView) || (typeof window != "undefined" ? window : null), r = (s = n == null ? void 0 : n.getComputedStyle) == null ? void 0 : s.call(n, e);
  return r ? t.height - tt(r.paddingTop) - tt(r.paddingBottom) - tt(r.borderTopWidth) - tt(r.borderBottomWidth) : t.height;
};
function ar({
  enabled: e,
  rootRef: t,
  onDiagnostics: n
}) {
  const r = Te(null), l = Te([]);
  let s = null, i = null, u = !1;
  const v = (y) => {
    l.value = y, n == null || n(y);
  }, L = () => {
    s == null || s.disconnect(), s = null, i = null;
  }, p = (y, O = "resize-observer") => {
    if (ir(y)) {
      r.value = y, v([]);
      return;
    }
    r.value = null, v([dt("invalid-height", { height: y, source: O })]);
  }, m = () => {
    var T;
    if (u) return;
    if (L(), !e()) {
      r.value = null, v([]);
      return;
    }
    const y = ((T = t.value) == null ? void 0 : T.parentElement) || null;
    if (!y) {
      r.value = null, v([dt("missing-parent")]);
      return;
    }
    const O = typeof ResizeObserver != "undefined" ? ResizeObserver : pn;
    if (!O) {
      r.value = null, v([dt("resize-observer-unavailable")]);
      return;
    }
    i = y, s = new O((I) => {
      var a;
      const h = I.find((d) => d.target === i) || I[0];
      p((a = h == null ? void 0 : h.contentRect) == null ? void 0 : a.height, "content-rect");
    }), s.observe(y), p(or(y), "initial-content-box");
  }, R = () => {
    u = !0, L(), r.value = null;
  };
  return Xe(
    () => {
      var y;
      return [e(), ((y = t.value) == null ? void 0 : y.parentElement) || null];
    },
    () => {
      Jt(m);
    },
    { immediate: !0 }
  ), Wt(R), {
    measuredContainerHeight: r,
    diagnostics: l,
    stop: R
  };
}
const cr = (e, t) => {
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
}, lr = () => ({
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
}), sr = (e) => ({
  interactions: lr(),
  getItemRenderState: cr,
  getRootClassNames: () => {
  },
  isExternalDropEnabled: (t) => t,
  renderOverlay: () => null
});
function ur(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Bt(e);
}
const ft = "vue-grid-layout", dr = typeof navigator != "undefined" && /firefox/i.test(navigator.userAgent), xr = ({
  name: e,
  props: t,
  createRuntimeExtension: n = sr
}) => /* @__PURE__ */ Mt({
  name: e,
  inheritAttrs: !1,
  props: t,
  emits: Nn,
  setup(r, {
    slots: l,
    attrs: s,
    emit: i
  }) {
    const u = r, v = Fn(i, Kt()), L = jn({
      props: u,
      emitModelValue: (V) => v.emitModelValue(V),
      emitLayoutChange: (V) => v.emitLayoutChange(V)
    }), {
      state: p,
      onLayoutMaybeChanged: m
    } = L, R = Te(null), y = ar({
      enabled: () => u.autoMeasureContainerHeight === !0,
      rootRef: R
    }), O = yt(() => gn({
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
    })), T = new Proxy(u, {
      get(V, j) {
        return j === "rowHeight" ? O.value.rowHeight : V[j];
      }
    }), I = Jn({
      props: u,
      getLayout: () => p.layout
    }), h = {
      current: null
    }, a = n({
      props: T,
      layoutRef: Qt(p, "layout"),
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
    const c = (V, j) => `${V}:${j}:${++S}`, D = Kn({
      getLayout: () => p.layout,
      setLayout: (V) => {
        p.layout = Z(V);
      },
      setActiveDrag: (V) => {
        p.activeDrag = Z(V);
      }
    }), P = Qn({
      getConfig: () => u.autoScroll,
      rootClassName: ft
    }), w = rr({
      props: T,
      state: p,
      eventBridge: v,
      engineBridge: I,
      frameUpdate: D,
      autoScroll: P,
      editor: d,
      isFirefox: dr,
      layoutClassName: ft,
      nextInteractionRequestId: c,
      syncHistory: a.syncHistory || $e,
      onLayoutMaybeChanged: m
    });
    h.current = w;
    const W = {
      reconcileSynchronizedLayout: (V) => {
        if (!I.isLegacyLayoutEngine() && (w.activeDragId.value || w.activeResizeId.value)) {
          const j = I.rebase(V);
          if (!j)
            return {
              clearActive: !0
            };
          if (j.placeholder)
            return {
              placeholder: j.placeholder
            };
        } else I.isLegacyLayoutEngine() || I.reset(V);
      },
      clearActiveInteraction: () => w.clearActiveInteraction()
    };
    L.watchLayoutDependencies(W), Wt(() => {
      var V;
      D.cancel(), w.removeDroppingPlaceholder("component-unmounted"), P.reset(), I.dispose("component unmounted"), (V = a.stop) == null || V.call(a), y.stop();
    });
    let M = "";
    const te = () => {
      const V = O.value, j = JSON.stringify(V);
      j !== M && (M = j, v.emitHeightRuntimeChange(V));
    };
    Xe(O, () => {
      p.mounted && te();
    }, {
      deep: !0
    }), Ht(() => {
      var V;
      p.mounted = !0, (V = a.mount) == null || V.call(a), te();
    });
    const F = () => {
      var X, J;
      const V = ((X = p.externalDropSession) == null ? void 0 : X.ghostItem) || null, j = V || p.activeDrag;
      if (!j) return null;
      const {
        width: Me = 0,
        cols: ye,
        margin: be,
        containerPadding: f,
        maxRows: b,
        useCSSTransforms: E,
        transformScale: ne
      } = u, ie = O.value;
      return We(kt, {
        w: j.w,
        h: j.h,
        x: j.x,
        y: j.y,
        i: j.i,
        class: gt("vue-grid-placeholder", {
          "placeholder-resizing": p.resizing,
          "placeholder-blocked": V ? ((J = p.externalDropSession) == null ? void 0 : J.status) === "blocked" : w.dragBlocked.value || w.resizeBlocked.value
        }),
        containerWidth: Me,
        cols: ye,
        margin: be,
        containerPadding: f || be,
        maxRows: b,
        rowHeight: ie.rowHeight,
        dragActivationDistance: u.dragActivationDistance,
        renderPrecision: ie.renderPrecision,
        isDraggable: !1,
        isResizable: !1,
        isBounded: !1,
        useCSSTransforms: E,
        transformScale: ne
      }, {
        default: () => [We("div", null, null)]
      });
    }, _e = /* @__PURE__ */ new Map(), Ge = (V, j, Me) => {
      if (!V || !V.key) return null;
      const ye = j.get(String(V.key));
      if (!ye) return null;
      const {
        width: be = 0,
        cols: f,
        margin: b,
        containerPadding: E,
        maxRows: ne,
        isDraggable: ie,
        isResizable: X,
        isBounded: J,
        useCSSTransforms: pe,
        transformScale: ke,
        draggableCancel: de,
        draggableCancelInteractiveElements: we,
        draggableHandle: o,
        resizeHandles: z,
        resizeHandle: k
      } = u, q = O.value, {
        mounted: H,
        droppingPosition: A
      } = p, g = a.getItemRenderState(ye, {
        isDraggable: ie,
        isResizable: X,
        isBounded: J
      }, Me);
      if (!g.visible) return null;
      const x = g.previewItem || ye, Y = typeof g.resizeHandles != "undefined" ? g.resizeHandles : ye.resizeHandles || z;
      return We(kt, {
        key: ye.i,
        containerWidth: be,
        cols: f,
        margin: b,
        containerPadding: E || b,
        maxRows: ne,
        rowHeight: q.rowHeight,
        dragActivationDistance: u.dragActivationDistance,
        renderPrecision: q.renderPrecision,
        cancel: de,
        cancelInteractiveElements: we,
        handle: o,
        onDragStop: w.onDragStop,
        onDragStart: w.onDragStart,
        onDrag: w.onDrag,
        onResizeStart: w.onResizeStart,
        onResize: w.onResize,
        onResizeStop: w.onResizeStop,
        isDraggable: g.draggable,
        isResizable: g.resizable,
        isBounded: g.bounded,
        isDragBlocked: w.dragBlocked.value && w.activeDragId.value === ye.i,
        isResizeBlocked: w.resizeBlocked.value && w.activeResizeId.value === ye.i,
        useCSSTransforms: pe && H,
        usePercentages: !H,
        transformScale: ke,
        w: x.w,
        h: x.h,
        x: x.x,
        y: x.y,
        i: x.i,
        minH: x.minH,
        minW: x.minW,
        maxH: x.maxH,
        maxW: x.maxW,
        static: x.static,
        class: g.className,
        onItemClick: g.onClick,
        droppingPosition: void 0,
        resizeHandles: Y,
        resizeHandle: k
      }, ur(V) ? V : {
        default: () => [V]
      });
    };
    return () => {
      const {
        class: V,
        style: j,
        isDroppable: Me,
        innerRef: ye
      } = u, be = O.value, f = Wn(s), b = a.isExternalDropEnabled(Me), E = gt(ft, f.class, V, a.getRootClassNames()), ne = {
        ...f.style && typeof f.style == "object" && !Array.isArray(f.style) ? f.style : {},
        height: be.containerStyle.height,
        ...be.containerStyle.overflow ? {
          overflow: be.containerStyle.overflow
        } : {},
        ...j
      }, ie = l.default ? sn(qt(en, null, l.default())) : [], X = L.syncRenderedChildren(ie, W), J = Xn(p, X);
      _e.clear();
      for (let de = 0; de < J.length; de++) {
        const we = J[de];
        _e.set(we.i, we);
      }
      const pe = {
        width: u.width || 0,
        margin: u.margin,
        containerPadding: u.containerPadding || u.margin,
        rowHeight: be.rowHeight,
        renderPrecision: be.renderPrecision,
        cols: u.cols,
        maxRows: u.maxRows
      }, ke = (de) => {
        R.value = de, ye && typeof ye == "object" && "value" in ye && (ye.value = de);
      };
      return We("div", Nt(f.attrs, {
        ref: ke,
        class: E,
        style: ne,
        onMousemove: a.onRootPointerMove,
        onClick: a.onRootClick,
        onDrop: b ? w.onDrop : $e,
        onDragleave: b ? w.onDragLeave : $e,
        onDragenter: b ? w.onDragEnter : $e,
        onDragover: b ? w.onDragOver : $e
      }), [ie.map((de) => Ge(de, _e)), F(), a.renderOverlay({
        geometry: pe,
        itemMap: _e,
        layout: J
      })]);
    };
  }
});
export {
  Sr as b,
  xr as c,
  ar as u
};
