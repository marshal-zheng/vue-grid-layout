import { computed as it, defineComponent as Mt, reactive as _t, ref as Ae, watch as je, onMounted as Gt, createVNode as He, h as qe, mergeProps as Nt, isVNode as Ht, Fragment as ut, markRaw as M, shallowRef as wt, nextTick as jt, onBeforeUnmount as qt, getCurrentInstance as Yt, toRef as $t } from "vue";
import dt from "clsx";
import { w as Xt, y as Ut, x as Jt, v as St, p as ft, C as xt, i as ze, a as Me, c as Kt, g as Qt, o as Re, d as rt, F as gt, m as Je, s as Xe, f as Fe, l as en, k as tn, u as Ve } from "./utils-BCVYGne6.mjs";
import { DraggableCore as nn } from "@marsio/vue-draggable";
import { Resizable as rn } from "@marsio/vue-resizable";
import { b as Ze, f as pt, d as bt, h as Qe, c as on, e as an, r as cn } from "./resolve-C3SqJijI.mjs";
import { deepEqual as ot } from "fast-equals";
import { b as Et, c as zt, a as Ct } from "./executor-jROu14Ek.mjs";
import { e as sn, c as ln } from "./core-DAApYNVP.mjs";
import un from "resize-observer-polyfill";
const dn = {
  type: Array,
  default: () => []
}, Bt = {
  type: [Object, Function]
}, fi = {
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
  resizeHandle: Bt,
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
function fn(e) {
  return e === "mouse" || e === "pen" || e === "touch" ? e : e === "coarse" ? "coarse" : "unknown";
}
function Wt(e, t) {
  var l;
  if (typeof e == "number") return Pt(e);
  const n = e || Lt, i = (l = n.default) != null ? l : Lt.default, s = t === "mouse" ? n.mouse : t === "pen" ? n.pen : t === "touch" ? n.touch : t === "coarse" ? n.coarse : void 0;
  return Pt(s != null ? s : i);
}
function gn(e, t, n) {
  if (n <= 0) return !0;
  const i = t.x - e.x, s = t.y - e.y;
  return Math.sqrt(i * i + s * s) >= n;
}
function Pt(e) {
  return !Number.isFinite(e) || e < 0 ? 0 : e;
}
const et = () => ({
  status: "idle",
  revision: 0
});
function Ke(e, t, n = {}) {
  switch (t.type) {
    case "ARM_DRAG":
      return yn(e, t, n);
    case "START_DRAG":
      return pn(e, t);
    case "MOVE_DRAG":
      return mn(e, t, n);
    case "STOP_DRAG":
      return In(e, t);
    case "START_RESIZE":
      return hn(e, t);
    case "MOVE_RESIZE":
      return vn(e, t);
    case "STOP_RESIZE":
      return Rn(e, t);
    case "ENTER_DROP":
      return Dn(e, t);
    case "MOVE_DROP":
      return wn(e, t);
    case "LEAVE_DROP":
      return Tt(e, t, t.reason || "drop-left");
    case "REJECT_DROP":
      return Tt(e, t, t.reason || "drop-rejected");
    case "COMMIT_DROP":
      return Sn(e, t);
    case "APPLY_RESULT":
      return xn(e, t);
    case "CANCEL":
      return bn(e, t);
    default:
      return Le(e, t, "unsupported");
  }
}
function pn(e, t) {
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
  return de(e, n, t, [
    {
      type: "EMIT_DRAG_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      grid: t.grid,
      context: t.context
    }
  ]);
}
function yn(e, t, n) {
  if (e.status !== "idle") return Le(e, t, "already-active");
  if (Wt(
    n.dragActivationDistance,
    t.pointerKind
  ) <= 0) {
    const s = { kind: "single", id: t.itemId };
    return de(e, {
      status: "active-drag",
      revision: e.revision + 1,
      interactionId: t.interactionId,
      itemId: t.itemId,
      context: s,
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
        context: s
      }
    ]);
  }
  return de(e, {
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
function mn(e, t, n) {
  if (e.status === "pending-drag") {
    if (e.interactionId !== t.interactionId) return ke(e, t);
    const l = Wt(
      n.dragActivationDistance,
      e.pointerKind
    );
    if (!gn(e.originPx, t.currentPx, l))
      return de(e, {
        ...e,
        revision: e.revision + 1,
        currentPx: t.currentPx,
        lastGrid: t.grid
      }, t, []);
    const o = t.context || { kind: "single", id: e.itemId }, m = o.kind !== "blocked" && !nt(e.originGrid, t.grid), P = {
      status: "active-drag",
      revision: e.revision + 1,
      interactionId: e.interactionId,
      itemId: e.itemId,
      context: o,
      startGrid: e.originGrid,
      lastGrid: t.grid,
      moved: m,
      previewSeq: m ? 1 : 0
    }, te = [
      {
        type: "EMIT_DRAG_START",
        interactionId: e.interactionId,
        itemId: e.itemId,
        grid: e.originGrid,
        context: o
      }
    ];
    return m && te.push({
      type: "EMIT_DRAG",
      interactionId: e.interactionId,
      itemId: e.itemId,
      grid: t.grid,
      context: o
    }, {
      type: "PREVIEW_DRAG",
      interactionId: e.interactionId,
      requestId: Ge(e.interactionId, "drag-preview", 1),
      itemId: e.itemId,
      grid: t.grid,
      context: o
    }), de(e, P, t, te);
  }
  if (e.status !== "active-drag") return Le(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return ke(e, t);
  if (e.context.kind === "blocked")
    return de(e, {
      ...e,
      revision: e.revision + 1,
      lastGrid: t.grid
    }, t, []);
  if (nt(e.lastGrid, t.grid))
    return de(e, { ...e, revision: e.revision + 1 }, t, []);
  const i = e.previewSeq + 1, s = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    moved: !0,
    previewSeq: i
  };
  return de(e, s, t, [
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
      requestId: Ge(e.interactionId, "drag-preview", i),
      itemId: e.itemId,
      grid: t.grid,
      context: e.context
    }
  ]);
}
function In(e, t) {
  if (e.status === "pending-drag")
    return e.interactionId !== t.interactionId ? ke(e, t) : de(e, We(e), t, [
      {
        type: "CLEAR_TRANSIENT",
        interactionId: t.interactionId,
        kind: "drag",
        reason: "click-like"
      }
    ]);
  if (e.status !== "active-drag") return Le(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return ke(e, t);
  if (!e.moved)
    return de(e, We(e), t, [
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
  const n = Ge(e.interactionId, "drag-commit", e.previewSeq + 1);
  return de(e, {
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
function hn(e, t) {
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
  return de(e, n, t, [
    {
      type: "EMIT_RESIZE_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      handle: t.handle,
      geometry: t.geometry
    }
  ]);
}
function vn(e, t) {
  if (e.status !== "active-resize") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return ke(e, t);
  if (Ft(e.last, t.geometry))
    return de(e, { ...e, revision: e.revision + 1 }, t, []);
  const n = e.previewSeq + 1, i = {
    ...e,
    revision: e.revision + 1,
    last: t.geometry,
    resized: !0,
    previewSeq: n
  };
  return de(e, i, t, [
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
      requestId: Ge(e.interactionId, "resize-preview", n),
      itemId: e.itemId,
      handle: e.handle,
      geometry: t.geometry
    }
  ]);
}
function Rn(e, t) {
  if (e.status !== "active-resize") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return ke(e, t);
  if (!e.resized && Ft(e.start, t.geometry))
    return de(e, We(e), t, [
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
  const n = Ge(e.interactionId, "resize-commit", e.previewSeq + 1);
  return de(e, {
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
function Dn(e, t) {
  if (e.status !== "idle") return Le(e, t, "already-active");
  const n = t.strategy || "cursor", i = {
    status: "active-drop",
    revision: e.revision + 1,
    interactionId: t.interactionId,
    itemId: t.itemId,
    lastGrid: t.grid,
    lastSize: t.size,
    strategy: n,
    previewSeq: t.grid && t.size ? 1 : 0
  }, s = t.grid && t.size ? [{
    type: "PREVIEW_DROP",
    interactionId: t.interactionId,
    requestId: Ge(t.interactionId, "drop-preview", 1),
    itemId: t.itemId,
    grid: t.grid,
    size: t.size,
    strategy: n
  }] : [];
  return de(e, i, t, s);
}
function wn(e, t) {
  if (e.status !== "active-drop") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return ke(e, t);
  const n = t.strategy || e.strategy || "cursor";
  if (e.lastGrid && e.lastSize && nt(e.lastGrid, t.grid) && Vt(e.lastSize, t.size) && e.strategy === n)
    return de(e, { ...e, revision: e.revision + 1 }, t, []);
  const i = e.previewSeq + 1, s = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    lastSize: t.size,
    strategy: n,
    previewSeq: i
  };
  return de(e, s, t, [
    {
      type: "PREVIEW_DROP",
      interactionId: e.interactionId,
      requestId: Ge(e.interactionId, "drop-preview", i),
      itemId: e.itemId,
      grid: t.grid,
      size: t.size,
      strategy: n
    }
  ]);
}
function Tt(e, t, n) {
  return e.status !== "active-drop" ? Le(e, t, "wrong-kind") : e.interactionId !== t.interactionId ? ke(e, t) : de(e, We(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId,
      kind: "drop",
      reason: n
    }
  ]);
}
function Sn(e, t) {
  if (e.status !== "active-drop") return Le(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return ke(e, t);
  const n = Ge(e.interactionId, "drop-commit", e.previewSeq + 1);
  return de(e, {
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
function xn(e, t) {
  if (e.status !== "committing") return Le(e, t, "not-committing");
  if (e.interactionId !== t.interactionId || e.requestId !== t.requestId)
    return ke(e, t);
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
  ), de(e, We(e), t, n);
}
function bn(e, t) {
  return e.status === "idle" ? de(e, e, t, []) : t.interactionId && tt(e) !== t.interactionId ? ke(e, t) : de(e, We(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId || tt(e),
      kind: yt(e),
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
      mt(e, e, t, n)
    ]
  };
}
function ke(e, t) {
  const n = "interactionId" in t ? t.interactionId : tt(e), i = "requestId" in t ? t.requestId : void 0;
  return {
    state: e,
    effects: [
      {
        type: "IGNORE_STALE",
        interactionId: n || "unknown",
        requestId: i,
        reason: "stale-event"
      }
    ],
    diagnostics: [
      mt(e, e, t, "stale-event")
    ]
  };
}
function de(e, t, n, i, s) {
  return {
    state: t,
    effects: i,
    diagnostics: [
      mt(e, t, n, s)
    ]
  };
}
function We(e) {
  return {
    status: "idle",
    revision: e.revision + 1
  };
}
function mt(e, t, n, i) {
  return {
    interactionId: "interactionId" in n ? n.interactionId : tt(e),
    requestId: "requestId" in n ? n.requestId : void 0,
    from: e.status,
    to: t.status,
    event: n.type,
    kind: yt(t) || yt(e),
    itemId: At(t) || At(e),
    reason: i
  };
}
function tt(e) {
  return e.status === "idle" ? void 0 : e.interactionId;
}
function At(e) {
  if (!(e.status === "idle" || e.status === "committing"))
    return e.itemId;
}
function yt(e) {
  if (e.status === "pending-drag" || e.status === "active-drag") return "drag";
  if (e.status === "active-resize") return "resize";
  if (e.status === "active-drop") return "drop";
  if (e.status === "committing") return e.kind;
}
function Ge(e, t, n) {
  return `${e}:${t}:${n}`;
}
function nt(e, t) {
  return e.x === t.x && e.y === t.y;
}
function Vt(e, t) {
  return e.w === t.w && e.h === t.h;
}
function Ft(e, t) {
  return nt(e, t) && Vt(e, t);
}
const at = (e, t, n, i) => pt(e, t.top, t.left, n, i), En = (e) => {
  const t = e.pointerType;
  return t ? fn(t) : "touches" in e || "changedTouches" in e ? "touch" : "mouse";
};
function zn({
  attrs: e,
  elementRef: t,
  positionParams: n,
  props: i,
  state: s
}) {
  let l = 0, o = et(), m = null;
  const P = () => !!(e.onDragStart || e.onDrag || e.onDragStop), te = () => {
    o = et(), m = null;
  }, f = (_, { node: I }, h = !1) => {
    var q;
    if (!P()) return;
    const c = Ze(
      n.value,
      i.x,
      i.y,
      i.w,
      i.h,
      s
    ), u = { top: c.top, left: c.left }, { x: v, y: a } = at(
      n.value,
      u,
      i.w,
      i.h
    ), w = `item-drag:${i.i}:${++l}`, S = h ? 0 : i.dragActivationDistance, C = Ke(o, {
      type: "ARM_DRAG",
      interactionId: w,
      itemId: i.i,
      pointerKind: En(_),
      originPx: { x: u.left, y: u.top },
      originGrid: { x: v, y: a }
    }, { dragActivationDistance: S });
    o = C.state, m = {
      interactionId: w,
      originGrid: { x: v, y: a },
      originPosition: u,
      currentPosition: u,
      node: I,
      e: _
    }, C.effects.some((N) => N.type === "EMIT_DRAG_START") && (s.dragging = u, (q = e.onDragStart) == null || q.call(e, i.i, v, a, {
      e: _,
      node: I,
      newPosition: u
    }));
  }, g = (_, I) => {
    let { top: h, left: c } = I;
    const { isBounded: u, w: v, h: a, containerWidth: w } = i;
    if (!u) return I;
    const { offsetParent: S } = _;
    if (!S) return I;
    const { margin: C, rowHeight: W } = i, q = S.clientHeight - bt(
      a,
      W,
      C[1],
      n.value.renderPrecision
    );
    h = Qe(h, 0, q);
    const N = on(n.value), L = w - bt(v, N, C[0], n.value.renderPrecision);
    return c = Qe(c, 0, L), { top: h, left: c };
  }, d = (_, { node: I, deltaX: h, deltaY: c }) => {
    var C, W;
    if (!P()) return;
    if (!m && !s.dragging)
      throw new Error("onDrag called before onDragStart.");
    const u = s.dragging || (m == null ? void 0 : m.currentPosition);
    if (!u) return;
    const v = g(I, {
      top: u.top + c,
      left: u.left + h
    });
    m && (m.currentPosition = v, m.node = I, m.e = _);
    const { x: a, y: w } = at(
      n.value,
      v,
      i.w,
      i.h
    );
    if (!m) return;
    const S = Ke(o, {
      type: "MOVE_DRAG",
      interactionId: m.interactionId,
      currentPx: { x: v.left, y: v.top },
      grid: { x: a, y: w }
    }, { dragActivationDistance: i.dragActivationDistance });
    o = S.state;
    for (const q of S.effects)
      q.type === "EMIT_DRAG_START" && (s.dragging = m.originPosition, (C = e.onDragStart) == null || C.call(e, i.i, m.originGrid.x, m.originGrid.y, {
        e: m.e,
        node: m.node,
        newPosition: m.originPosition
      })), q.type === "EMIT_DRAG" && (s.dragging = v, (W = e.onDrag) == null || W.call(e, i.i, a, w, {
        e: _,
        node: I,
        newPosition: v
      }));
    S.state.status === "active-drag" && (s.dragging = v);
  };
  return {
    moveDroppingItem: (_) => {
      const { droppingPosition: I } = i;
      if (!I) return;
      const h = t.value;
      if (!h) return;
      const c = _ || { left: 0, top: 0 }, { dragging: u } = s, v = u && I.left !== c.left || I.top !== c.top;
      if (!u)
        f(I.e, {
          node: h,
          deltaX: I.left,
          deltaY: I.top
        }, !0);
      else if (v) {
        const a = I.left - u.left, w = I.top - u.top;
        d(I.e, {
          node: h,
          deltaX: a,
          deltaY: w
        });
      }
    },
    onDrag: d,
    onDragStart: f,
    onDragStop: (_, { node: I }) => {
      var S;
      if (!P()) return;
      if (!m && !s.dragging)
        throw new Error("onDragEnd called before onDragStart.");
      const h = s.dragging || (m == null ? void 0 : m.currentPosition);
      if (!h) return;
      const c = {
        top: h.top,
        left: h.left
      }, { x: u, y: v } = at(
        n.value,
        c,
        i.w,
        i.h
      ), a = o.status === "active-drag", w = m == null ? void 0 : m.interactionId;
      w && (o = Ke(o, {
        type: "STOP_DRAG",
        interactionId: w,
        grid: { x: u, y: v }
      }, { dragActivationDistance: i.dragActivationDistance }).state), s.dragging = null, a && ((S = e.onDragStop) == null || S.call(e, i.i, u, v, {
        e: _,
        node: I,
        newPosition: c
      })), te();
    }
  };
}
function Cn({
  attrs: e,
  positionParams: t,
  props: n,
  state: i
}) {
  const s = it(() => {
    const { cols: f, minW: g, minH: d, maxW: p, maxH: T } = n, _ = t.value, I = Ze(_, 0, 0, f, 0).width, h = Ze(_, 0, 0, g, d), c = Ze(_, 0, 0, p, T);
    return {
      minConstraints: [h.width, h.height],
      maxConstraints: [
        Math.min(c.width, I),
        Math.min(c.height, 1 / 0)
      ]
    };
  }), l = (f, { node: g, size: d, handle: p }, T, _) => {
    const I = e[_];
    if (!I) return;
    const { x: h, y: c, i: u, maxH: v, minH: a, maxW: w, minW: S, containerWidth: C } = n;
    let W = d;
    g && (W = Xt(
      p,
      T,
      d,
      C
    ), i.resizing = _ === "onResizeStop" ? null : W);
    let { w: q, h: N } = an(
      t.value,
      W.width,
      W.height,
      h,
      c,
      p
    );
    q = Qe(q, Math.max(S, 1), w), N = Qe(N, a, v), I.call(void 0, u, q, N, { e: f, node: g, size: W, handle: p });
  };
  return {
    curryResizeHandler: (f, g) => (d, p) => g(d, p, f),
    onResize: (f, g, d) => l(f, g, d, "onResize"),
    onResizeStart: (f, g, d) => l(f, g, d, "onResizeStart"),
    onResizeStop: (f, g, d) => l(f, g, d, "onResizeStop"),
    resizeConstraints: s
  };
}
function Ln(e, {
  containerWidth: t,
  useCSSTransforms: n,
  usePercentages: i
}) {
  if (n)
    return Ut(e);
  const s = Jt(e);
  return i && (s.left = St(e.left / t), s.width = St(e.width / t)), s;
}
function Pn({
  childClass: e,
  className: t,
  dropping: n,
  hasDragHandle: i,
  isDragBlocked: s,
  isDraggable: l,
  isDragging: o,
  isResizeBlocked: m,
  isResizing: P,
  isStatic: te,
  useCSSTransforms: f
}) {
  return dt(
    "vue-grid-item",
    e,
    t,
    {
      static: te,
      resizing: P,
      "vue-draggable": l,
      "has-drag-handle": i,
      "drag-blocked": s,
      "resize-blocked": m,
      "vue-draggable-dragging": o,
      dropping: n,
      cssTransforms: f
    }
  );
}
function Tn(e, t, n) {
  return {
    ...e || {},
    ...t && typeof t == "object" ? t : {},
    ...n
  };
}
function An(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Ht(e);
}
const kn = "GridItem", kt = /* @__PURE__ */ Mt({
  name: kn,
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
    resizeHandles: dn,
    // Define more specific type if necessary
    resizeHandle: Bt,
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
    const i = n, s = _t({
      resizing: null,
      dragging: null,
      className: ""
    }), l = Ae(null), o = it(() => ({
      cols: e.cols,
      containerPadding: e.containerPadding,
      containerWidth: e.containerWidth,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      renderPrecision: e.renderPrecision
    })), m = zn({
      attrs: i,
      elementRef: l,
      positionParams: o,
      props: e,
      state: s
    }), P = Cn({
      attrs: i,
      positionParams: o,
      props: e,
      state: s
    }), te = (g, d, p) => He(nn, {
      disabled: !d,
      startFn: m.onDragStart,
      dragFn: m.onDrag,
      stopFn: m.onDragStop,
      handle: e.handle,
      cancel: `.vue-resizable-handle${e.cancel ? `,${e.cancel}` : ""}`,
      scale: e.transformScale,
      nodeRef: l,
      enableClickSuppression: !0
    }, {
      default: () => [He("div", Nt({
        ref: l
      }, p), [g])]
    });
    je(() => e.droppingPosition, (g, d) => {
      m.moveDroppingItem(d);
    });
    const f = (g, d, p) => {
      let T;
      const {
        transformScale: _,
        resizeHandles: I,
        resizeHandle: h
      } = e, {
        minConstraints: c,
        maxConstraints: u
      } = P.resizeConstraints.value;
      return He(rn, {
        draggableOpts: {
          disabled: !p
        },
        className: p ? void 0 : "vue-resizable-hide",
        width: d.width,
        height: d.height,
        minConstraints: c,
        maxConstraints: u,
        fnResizeStop: P.curryResizeHandler(d, P.onResizeStop),
        fnResizeStart: P.curryResizeHandler(d, P.onResizeStart),
        fnResize: P.curryResizeHandler(d, P.onResize),
        transformScale: _,
        resizeHandles: I,
        handle: h
      }, An(T = qe(g, {
        style: {
          height: "100%"
        }
      })) ? T : {
        default: () => [T]
      });
    };
    return Gt(() => {
      m.moveDroppingItem();
    }), () => {
      var w, S;
      const {
        x: g,
        y: d,
        w: p,
        isDraggable: T,
        isResizable: _,
        droppingPosition: I,
        useCSSTransforms: h
      } = e, c = Ze(o.value, g, d, p, e.h, s), u = t.default ? t.default()[0] : null;
      if (!u) return null;
      const v = {
        class: Pn({
          childClass: (w = u.props) == null ? void 0 : w.class,
          className: e.class,
          dropping: !!I,
          hasDragHandle: !!e.handle,
          isDragBlocked: e.isDragBlocked,
          isDraggable: T,
          isDragging: !!s.dragging,
          isResizeBlocked: e.isResizeBlocked,
          isResizing: !!s.resizing,
          isStatic: e.static,
          useCSSTransforms: h
        }),
        onClick: e.onItemClick,
        style: Tn(e.style, (S = u.props) == null ? void 0 : S.style, Ln(c, {
          containerWidth: e.containerWidth,
          useCSSTransforms: h,
          usePercentages: e.usePercentages
        }))
      };
      let a = f(u, c, _);
      return a = te(a, T, v), a;
    };
  }
}), On = [
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
], Mn = {
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
function _n(e) {
  const t = {};
  let n, i;
  return Object.keys(e).forEach((s) => {
    const l = e[s];
    if (s === "class") {
      n = l;
      return;
    }
    if (s === "style") {
      i = l;
      return;
    }
    /^on[A-Z]/.test(s) || (t[s] = l);
  }), {
    attrs: t,
    class: n,
    style: i
  };
}
function Zt(e, t) {
  return e ? Array.isArray(e) ? e.flatMap((n) => Zt(n, t)) : typeof e == "function" ? [e(...t)] : [] : [];
}
function Gn(e, t, n) {
  const i = (e == null ? void 0 : e.vnode.props) || {}, s = Mn[t] || [];
  let l;
  return s.forEach((o) => {
    Zt(i[o], n).forEach((P) => {
      if (P === !1) {
        l = !1;
        return;
      }
      l !== !1 && P != null && (l = P);
    });
  }), l;
}
function Nn(e, t) {
  const n = (i) => (s, l, o, m, P, te) => {
    e(i, s, l, o, m, P, te);
  };
  return {
    emitModelValue(i) {
      e("update:modelValue", i);
    },
    emitLayoutChange(i) {
      e("layoutChange", i);
    },
    emitDragStart: n("dragStart"),
    emitDrag: n("drag"),
    emitDragStop: n("dragStop"),
    emitResizeStart: n("resizeStart"),
    emitResize: n("resize"),
    emitResizeStop: n("resizeStop"),
    emitDrop(i, s, l) {
      e("drop", i, s, l);
    },
    emitHeightRuntimeChange(i) {
      e("heightRuntimeChange", i);
    },
    callDropDragOver(i) {
      const s = Gn(t, "dropDragOver", [i]);
      if (s === !1) return !1;
      if (s && typeof s == "object")
        return s;
    }
  };
}
function Hn({
  props: e,
  slots: t,
  emitModelValue: n,
  emitLayoutChange: i
}) {
  const s = t.default ? ft(qe(ut, null, t.default())) : [], l = _t({
    activeDrag: null,
    layout: M(
      xt(
        e.modelValue,
        s,
        e.cols,
        ze(e),
        e.allowOverlap,
        (f) => {
          n(f), i(f);
        }
      )
    ),
    mounted: !1,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    resizing: !1,
    droppingDOMNode: null,
    droppingPosition: void 0,
    suppressLayoutChange: !1,
    compactType: e.compactType,
    children: []
  });
  let o = Me(e.modelValue || []);
  const m = (f, g) => {
    g || (g = l.layout), ot(g, f) || (i(f), n(f));
  };
  je(
    () => l.layout,
    (f, g) => {
      if (l.suppressLayoutChange) {
        l.suppressLayoutChange = !1;
        return;
      }
      if (l.activeDrag || l.droppingDOMNode || l.droppingPosition) return;
      const d = l.oldLayout;
      if (d) {
        l.oldLayout = null, m(f, d);
        return;
      }
      m(f, g);
    }
  );
  const P = it(() => {
    const f = t.default ? t.default() : [], g = ft({ type: ut, children: f }), d = g.map((p) => {
      var _;
      const T = (_ = p.props) == null ? void 0 : _["data-grid"];
      return {
        key: p.key,
        grid: T ? {
          w: T.w,
          h: T.h,
          x: T.x,
          y: T.y
        } : null
      };
    });
    return {
      children: M(g),
      props: {
        compactType: e.compactType,
        modelValue: e.modelValue,
        verticalCompact: e.verticalCompact,
        cols: e.cols,
        allowOverlap: e.allowOverlap
      },
      signature: d
    };
  });
  return {
    state: l,
    onLayoutMaybeChanged: m,
    watchLayoutDependencies: (f = {}) => je(
      P,
      ({ children: g, props: d }, { children: p, props: T }) => {
        var a, w;
        const _ = Kt(g, p), I = !ot(d.modelValue, o), h = ot(d.modelValue, l.layout), c = d.compactType === T.compactType && d.cols === T.cols && d.allowOverlap === T.allowOverlap && d.verticalCompact === T.verticalCompact;
        if (_ && !I && c || (o = Me(d.modelValue || []), _ && h && c))
          return;
        const u = xt(
          d.modelValue,
          g,
          d.cols,
          ze(d),
          d.allowOverlap
        ), v = (a = f.reconcileSynchronizedLayout) == null ? void 0 : a.call(f, u);
        v != null && v.clearActive ? (l.activeDrag = null, (w = f.clearActiveInteraction) == null || w.call(f)) : v && "placeholder" in v && (l.activeDrag = v.placeholder ? M(v.placeholder) : null), m(u, l.layout), l.layout = M(u), l.compactType = d.compactType;
      },
      { deep: !0 }
    ),
    stop: () => {
    }
  };
}
function qn({
  props: e,
  getLayout: t
}) {
  const n = () => e.layoutEngine && typeof e.layoutEngine == "object" ? e.layoutEngine : null, i = () => {
    const a = n();
    return e.layoutEngine === !1 || (a == null ? void 0 : a.mode) === "legacy";
  };
  let s, l = Et();
  const o = () => {
    var S;
    const a = n(), w = a == null ? void 0 : a.executor;
    return w !== s && ((S = l.dispose) == null || S.call(l), l = Et(w), s = w), l;
  };
  let m, P = Ct();
  const te = () => {
    const a = n(), w = a == null ? void 0 : a.scheduler;
    return w !== m && (P.cancel("scheduler reconfigured"), P = Ct(w), m = w), P;
  }, f = () => {
    const a = n();
    return {
      cols: e.cols,
      maxRows: e.maxRows,
      compactType: ze(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      scheduler: a == null ? void 0 : a.scheduler,
      executor: o(),
      compareLegacy: a == null ? void 0 : a.compareLegacy,
      legacyFallback: (a == null ? void 0 : a.legacyFallback) !== !1,
      diagnostics: a == null ? void 0 : a.diagnostics,
      onEvent: a == null ? void 0 : a.onEvent
    };
  };
  let g = zt(
    t(),
    f()
  );
  const d = (a = t()) => {
    g.dispose(), g = zt(a, f());
  }, p = (a, w) => {
    var C, W, q;
    if (!f().compareLegacy || a.phase === "preview" && ((C = w.diagnostics) == null ? void 0 : C.schedulerMode) === "commitOnly") return;
    const S = ln(a, w);
    S.matches || (q = (W = f()).onEvent) == null || q.call(W, {
      type: "legacy-mismatch",
      id: a.id,
      message: "VueGridLayout layout engine result differs from legacy path",
      diagnostics: w.diagnostics,
      details: S.differences
    });
  }, T = (a, w, S) => {
    var C, W, q;
    !S || ((C = w.diagnostics) == null ? void 0 : C.executorKind) !== "worker" || (q = (W = f()).onEvent) == null || q.call(W, {
      type: "operation",
      id: w.id,
      operationType: a.operation.type,
      phase: a.phase,
      diagnostics: w.diagnostics
    });
  }, _ = (a) => o().kind === "main-thread" || a.phase === "preview" && (a.operation.type === "move" || a.operation.type === "resize" || a.operation.type === "groupMove") ? !1 : a.phase === "commit" || !!a.heavy || a.operation.type === "dropFit" || a.operation.type === "generateResponsiveLayout" || a.operation.type === "groupMove", I = (a) => _(a) ? o().execute(a) : sn(a), h = (a, w) => {
    let S = null;
    const C = _(a);
    return te().schedule(
      a,
      I,
      (W) => {
        var N;
        const q = g.applyAsyncResult(W);
        te().recordDuration(((N = q.diagnostics) == null ? void 0 : N.durationMs) || 0), T(a, q, C), p(a, q), w(q), S = q;
      }
    ), S;
  };
  return {
    getLayoutEngineProp: n,
    getLayoutEngineOptions: f,
    isLegacyLayoutEngine: i,
    reset: d,
    start: (a) => g.start(a),
    rebase: (a) => g.rebase(a),
    getCommitted: () => g.getCommitted(),
    preview: (a, w, S, C = !1) => {
      var q;
      const W = {
        id: a,
        operation: w,
        baseRevision: (q = g.getState().interaction) == null ? void 0 : q.startRevision,
        heavy: C
      };
      return h(g.preparePreview(W), S);
    },
    commit: (a, w, S, C = !1) => {
      var q;
      const W = {
        id: a,
        operation: w,
        baseRevision: (q = g.getState().interaction) == null ? void 0 : q.startRevision,
        heavy: C
      };
      return h(g.prepareCommit(W), S);
    },
    dispose: (a = "component disposed") => {
      var w;
      P.cancel(a), (w = l.dispose) == null || w.call(l), g.dispose();
    }
  };
}
function Bn({
  getLayout: e,
  setLayout: t,
  setActiveDrag: n
}) {
  const i = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let s = null, l = null;
  const o = () => {
    l != null && i && cancelAnimationFrame(l), l = null, s = null;
  }, m = (f) => {
    for (let g = 0; g < f.length; g++) {
      const d = f[g];
      d.moved && (d.moved = !1);
    }
  }, P = () => {
    l = null;
    const f = s;
    if (s = null, !f) return;
    f.layout && f.layout !== e() && t(f.layout), f.shouldCompact && Qt(e(), f.compactType, f.cols);
    const g = e(), d = Re(g, f.placeholder.i);
    n(M(
      d ? {
        ...f.placeholder,
        w: d.w,
        h: d.h,
        x: d.x,
        y: d.y
      } : f.placeholder
    ));
  };
  return {
    cancel: o,
    flush: P,
    schedule: (f) => {
      if (s = f, !i) {
        P();
        return;
      }
      l == null && (l = requestAnimationFrame(P));
    },
    resetMovedFlags: m
  };
}
const ct = {
  margin: 48,
  speed: 20
};
function Wn({
  getConfig: e,
  rootClassName: t
}) {
  const n = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let i = null, s = null, l = null, o = null;
  const m = () => {
    const I = e();
    if (!I) return null;
    if (I === !0) return ct;
    if (typeof I != "object") return null;
    const h = typeof I.margin == "number" && Number.isFinite(I.margin) ? I.margin : ct.margin, c = typeof I.speed == "number" && Number.isFinite(I.speed) ? I.speed : ct.speed;
    return h <= 0 || c <= 0 ? null : { margin: h, speed: c };
  }, P = () => {
    l != null && n && cancelAnimationFrame(l), l = null, o = null;
  }, te = () => {
    P(), s = null, i = null;
  }, f = (I) => {
    var u, v;
    const h = I;
    if (typeof h.clientX == "number" && typeof h.clientY == "number")
      return { x: h.clientX, y: h.clientY };
    const c = ((u = h.touches) == null ? void 0 : u[0]) || ((v = h.changedTouches) == null ? void 0 : v[0]);
    return c ? { x: c.clientX, y: c.clientY } : null;
  }, g = (I) => {
    const h = I.ownerDocument, c = h == null ? void 0 : h.defaultView;
    if (!c) return I;
    let u = I;
    for (; u; ) {
      const v = c.getComputedStyle(u), a = v.overflowY, w = v.overflowX, S = (a === "auto" || a === "scroll") && u.scrollHeight > u.clientHeight + 1, C = (w === "auto" || w === "scroll") && u.scrollWidth > u.clientWidth + 1;
      if (S || C) return u;
      u = u.parentElement;
    }
    return c;
  }, d = (I) => {
    var u;
    if (i = m(), s = null, P(), !i) return;
    const h = (u = I.closest) == null ? void 0 : u.call(I, `.${t}`), c = h instanceof HTMLElement ? h : I;
    s = g(c);
  }, p = () => {
    l = null;
    const I = o;
    if (o = null, !I) return;
    const { container: h, dx: c, dy: u } = I;
    c === 0 && u === 0 || (h instanceof HTMLElement ? typeof h.scrollBy == "function" ? h.scrollBy({ left: c, top: u }) : (h.scrollLeft += c, h.scrollTop += u) : h.scrollBy({ left: c, top: u }));
  }, T = (I, h, c) => {
    if (o = { container: I, dx: h, dy: c }, !n) {
      p();
      return;
    }
    l == null && (l = requestAnimationFrame(p));
  };
  return {
    init: d,
    maybeScroll: (I, h) => {
      i || (i = m());
      const c = i;
      if (!c) return;
      const u = f(I);
      if (!u) return;
      s || d(h);
      const v = s;
      if (!v) return;
      const a = (C) => {
        const W = Math.min(1, Math.max(0, C / c.margin));
        return W <= 0 ? 0 : Math.ceil(W * c.speed);
      };
      let w = 0, S = 0;
      if (v instanceof HTMLElement) {
        const C = v.getBoundingClientRect(), W = C.top + c.margin, q = C.bottom - c.margin, N = C.left + c.margin, L = C.right - c.margin;
        u.y < W ? S = -a(W - u.y) : u.y > q && (S = a(u.y - q)), u.x < N ? w = -a(N - u.x) : u.x > L && (w = a(u.x - L)), S < 0 && v.scrollTop <= 0 && (S = 0), S > 0 && v.scrollTop + v.clientHeight >= v.scrollHeight && (S = 0), w < 0 && v.scrollLeft <= 0 && (w = 0), w > 0 && v.scrollLeft + v.clientWidth >= v.scrollWidth && (w = 0);
      } else {
        const C = v, W = c.margin, q = C.innerHeight - c.margin, N = c.margin, L = C.innerWidth - c.margin;
        u.y < W ? S = -a(W - u.y) : u.y > q && (S = a(u.y - q)), u.x < N ? w = -a(N - u.x) : u.x > L && (w = a(u.x - L));
      }
      if (w === 0 && S === 0) {
        P();
        return;
      }
      T(v, w, S);
    },
    reset: te
  };
}
function It({
  getDragActivationDistance: e,
  onEffects: t,
  onDiagnostics: n
} = {}) {
  const i = wt(et()), s = wt([]), l = (g) => ({
    dragActivationDistance: g && "dragActivationDistance" in g ? g.dragActivationDistance : e == null ? void 0 : e()
  }), o = (g, d) => {
    const p = Ke(i.value, g, l(d));
    return i.value = p.state, p.diagnostics.length > 0 && (s.value = s.value.concat(p.diagnostics), n == null || n(p.diagnostics)), p.effects.length > 0 && (t == null || t(p.effects, p)), p;
  };
  return {
    snapshot: i,
    diagnostics: s,
    dispatch: o,
    reset: (g = "reset") => {
      i.value.status !== "idle" && o({
        type: "CANCEL",
        interactionId: i.value.interactionId,
        reason: g
      }), i.value = et();
    },
    isCurrentRequest: (g, d) => i.value.status === "committing" && i.value.interactionId === g && i.value.requestId === d,
    isCurrentPreviewRequest: (g, d) => Vn(i.value) === d && i.value.status !== "idle" && i.value.status !== "committing" && i.value.interactionId === g,
    isCurrentInteraction: (g, d) => {
      const p = i.value;
      return p.status === "idle" || p.interactionId !== g ? !1 : d ? p.status === "pending-drag" || p.status === "active-drag" ? d === "drag" : p.status === "active-resize" ? d === "resize" : p.status === "active-drop" ? d === "drop" : p.kind === d : !0;
    }
  };
}
function Vn(e) {
  return e.status === "active-drag" ? `${e.interactionId}:drag-preview:${e.previewSeq}` : e.status === "active-resize" ? `${e.interactionId}:resize-preview:${e.previewSeq}` : e.status === "active-drop" ? `${e.interactionId}:drop-preview:${e.previewSeq}` : null;
}
const Ot = 200;
function Fn({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: i,
  frameUpdate: s,
  autoScroll: l,
  editor: o,
  interactionMachine: m,
  nextInteractionRequestId: P,
  syncHistory: te,
  onLayoutMaybeChanged: f
}) {
  const g = Ae(!1), d = Ae(!1), p = Ae(null), T = Ae(null), _ = Ae(null), I = Ae([]), h = Ae(null);
  let c = null, u = !1, v = null, a = null;
  const w = () => i.getLayoutEngineProp(), S = () => i.isLegacyLayoutEngine(), C = (r) => i.reset(r), W = (...r) => i.preview(...r), q = (...r) => i.commit(...r), N = m || It({
    getDragActivationDistance: () => e.dragActivationDistance
  }), L = (r, b, D, G) => {
    let A = r.x, E = r.y, y = b, R = D;
    const Z = G === "sw" || G === "w" || G === "nw", Y = G === "ne" || G === "n" || G === "nw";
    return Z && (A = r.x + (r.w - y), A < 0 && (A = 0, y = r.w)), Y && (E = r.y + (r.h - R), E < 0 && (E = 0, R = r.h)), { ...r, x: A, y: E, w: y, h: R };
  }, K = () => {
    var r, b, D;
    return t.layout.length >= (((D = (b = (r = w()) == null ? void 0 : r.scheduler) == null ? void 0 : b.auto) == null ? void 0 : D.workerMinItems) || 1e3);
  }, x = () => {
    _.value = null, I.value = [], h.value = null;
  }, Q = (r, b, D) => {
    g.value = !0, _.value = r, I.value = b.slice(), h.value = D || null;
  }, fe = (r, b, D, G = !1) => {
    if (r.status === "blocked" && r.blocked) {
      const A = r.blocked.reason, E = r.blocked.itemIds.length > 0 ? r.blocked.itemIds : b, y = `Pointer move blocked by ${A}.`;
      Q(A, E, y), G && o.notifyMoveBlocked({
        reason: A,
        ids: E,
        activeId: D,
        message: y,
        operationResult: r
      });
      return;
    }
    g.value = !1, x();
  }, ee = () => {
    p.value = null, T.value = null, g.value = !1, d.value = !1, x(), c = null, u = !1, v = null, a = null, N.reset("clear-active-interaction");
  }, pe = () => {
    t.activeDrag = null, t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), o.clearGuides(), N.reset("finish-drag-interaction");
  }, re = (r, b) => r.x === b.x && r.y === b.y && r.w === b.w && r.h === b.h, F = (r, b) => r.find((D) => D.type === b), Pe = (r) => r.kind === "group" ? {
    kind: "group",
    activeId: r.activeId,
    ids: r.ids
  } : r.kind === "blocked" ? {
    kind: "blocked",
    reason: r.reason,
    ids: r.ids,
    activeId: r.activeId
  } : {
    kind: "single",
    id: r.id
  }, xe = () => {
    t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, T.value = null, d.value = !1, a = null, l.reset(), o.clearGuides(), t.oldLayout = null, N.reset("resize-cleanup");
  };
  return {
    activeDragId: p,
    activeResizeId: T,
    dragBlocked: g,
    dragBlockedReason: _,
    dragBlockedItemIds: I,
    dragBlockedMessage: h,
    resizeBlocked: d,
    clearActiveInteraction: ee,
    onResizeStart: (r, b, D, { e: G, node: A, handle: E }) => {
      s.cancel();
      const { layout: y } = t, R = Re(y, r);
      if (!R) return;
      const Z = E || "se", Y = P("resize-interaction", r), B = N.dispatch({
        type: "START_RESIZE",
        interactionId: Y,
        itemId: r,
        handle: Z,
        geometry: { x: R.x, y: R.y, w: R.w, h: R.h }
      });
      F(B.effects, "EMIT_RESIZE_START") && (a = Y, te(y, "replace"), T.value = r, d.value = !1, o.resetSnap(), l.init(A), t.oldResizeItem = rt(R), t.oldLayout = Me(y), t.resizing = !0, S() || (C(y), i.start({
        id: P("resize-start", r),
        type: "resize",
        itemId: r
      })), n.emitResizeStart(y, R, R, void 0, G, A));
    },
    onResize: (r, b, D, { e: G, node: A, handle: E }) => {
      const { oldResizeItem: y } = t, { cols: R, preventCollision: Z, allowOverlap: Y } = e, B = E, le = Re(t.layout, r);
      if (!le) return;
      const ye = L(le, b, D, B);
      if (re(le, ye))
        return;
      if (!S()) {
        const me = t.layout, we = Re(me, r);
        if (!we) return;
        l.maybeScroll(G, A);
        const ve = o.snapCandidate(
          r,
          we,
          L(we, b, D, B),
          me,
          B
        );
        let ie;
        if (a) {
          const ce = N.dispatch({
            type: "MOVE_RESIZE",
            interactionId: a,
            geometry: { x: ve.x, y: ve.y, w: ve.w, h: ve.h }
          });
          if (ie = F(ce.effects, "PREVIEW_RESIZE"), !ie) return;
        }
        if (!ie) return;
        W(
          ie.requestId,
          {
            type: "resize",
            id: r,
            w: ve.w,
            h: ve.h,
            x: ve.x,
            y: ve.y,
            handle: B
          },
          (ce) => {
            if (ce.status === "stale" || !N.isCurrentPreviewRequest(ie.interactionId, ie.requestId) || T.value !== r) return;
            const Ne = ce.status === "changed" || ce.status === "fallback" ? ce.layout : i.getCommitted(), _e = Re(Ne, r) || we, Ce = ce.placeholder || {
              w: _e.w,
              h: _e.h,
              x: _e.x,
              y: _e.y,
              static: !0,
              i: r
            };
            T.value === r && (d.value = ce.status === "blocked"), n.emitResize(Ne, y, _e, Ce, G, A), (ce.status === "changed" || ce.status === "fallback") && (t.layout = M(Ne)), t.activeDrag = M(Ce), o.updateIntelligence(r, we, Ce, B);
          },
          K()
        );
        return;
      }
      const ae = t.layout.length >= Ot;
      if (l.maybeScroll(G, A), !ae) {
        const { layout: me } = t;
        let we = !1, ve, ie, ce, Ne = !1;
        const [_e, Ce] = gt(me, r, (se) => {
          ie = se.x, ce = se.y;
          const Rt = E === "sw" || E === "w" || E === "nw", Dt = E === "ne" || E === "n" || E === "nw";
          (Rt || Dt) && (Rt && (ie = se.x + (se.w - b), b = se.x !== ie && ie < 0 ? se.w : b, ie = ie < 0 ? 0 : ie), Dt && (ce = se.y + (se.h - D), D = se.y !== ce && ce < 0 ? se.h : D, ce = ce < 0 ? 0 : ce), we = !0);
          const $e = o.snapCandidate(
            r,
            se,
            { ...se, x: ie, y: ce, w: b, h: D },
            me,
            E
          );
          return ie = $e.x, ce = $e.y, b = $e.w, D = $e.h, we = we || ie !== se.x || ce !== se.y, Z && !Y && (Ne = Je(me, { ...se, w: b, h: D, x: ie, y: ce }).length > 0, Ne && (ce = se.y, D = se.h, ie = se.x, b = se.w, we = !1)), se.w = b, se.h = D, se;
        });
        if (!Ce) return;
        T.value === r && (d.value = Ne), ve = _e, we && (ve = Xe(
          _e,
          Ce,
          ze(e),
          R,
          Y,
          ie,
          ce,
          !0,
          e.preventCollision
        ));
        const Be = {
          w: Ce.w,
          h: Ce.h,
          x: Ce.x,
          y: Ce.y,
          static: !0,
          i: r
        };
        if (a) {
          const se = N.dispatch({
            type: "MOVE_RESIZE",
            interactionId: a,
            geometry: { x: Be.x, y: Be.y, w: Be.w, h: Be.h }
          });
          if (!F(se.effects, "PREVIEW_RESIZE")) return;
        }
        n.emitResize(ve, y, Ce, Be, G, A);
        const ht = Y ? ve : Fe(ve, ze(e), R), Ye = Re(ht, r) || Ce, vt = {
          ...Be,
          w: Ye.w,
          h: Ye.h,
          x: Ye.x,
          y: Ye.y
        };
        t.layout = M(ht), t.activeDrag = M(vt), o.updateIntelligence(r, Ce, vt, E);
        return;
      }
      const ue = t.layout, k = Re(ue, r);
      if (!k) return;
      const Te = k.x, H = k.y, be = k.w, z = k.h;
      let j = !1, O = k.x, V = k.y, $ = !1;
      const X = E === "sw" || E === "w" || E === "nw", De = E === "ne" || E === "n" || E === "nw";
      (X || De) && (X && (O = k.x + (k.w - b), b = k.x !== O && O < 0 ? k.w : b, O = O < 0 ? 0 : O), De && (V = k.y + (k.h - D), D = k.y !== V && V < 0 ? k.h : D, V = V < 0 ? 0 : V), j = !0);
      const J = o.snapCandidate(
        r,
        k,
        { ...k, x: O, y: V, w: b, h: D },
        ue,
        E
      );
      O = J.x, V = J.y, b = J.w, D = J.h, j = j || O !== k.x || V !== k.y, Z && !Y && ($ = Je(ue, { ...k, w: b, h: D, x: O, y: V }).length > 0, $ && (O = k.x, V = k.y, b = k.w, D = k.h, j = !1)), T.value === r && (d.value = $), k.w = b, k.h = D;
      let Ie = ue;
      j && (Ie = Xe(
        ue,
        k,
        ze(e),
        R,
        Y,
        O,
        V,
        !0,
        e.preventCollision
      ));
      const ge = {
        w: k.w,
        h: k.h,
        x: k.x,
        y: k.y,
        static: !0,
        i: r
      };
      if (a) {
        const me = N.dispatch({
          type: "MOVE_RESIZE",
          interactionId: a,
          geometry: { x: ge.x, y: ge.y, w: ge.w, h: ge.h }
        });
        if (!F(me.effects, "PREVIEW_RESIZE")) return;
      }
      n.emitResize(Ie, y, k, ge, G, A), (k.x !== Te || k.y !== H || k.w !== be || k.h !== z || Y && Ie !== t.layout) && (Y || s.resetMovedFlags(ue), s.schedule({
        cols: R,
        compactType: ze(e),
        layout: Y && Ie !== t.layout ? Ie : void 0,
        placeholder: ge,
        shouldCompact: !Y
      }), o.updateIntelligence(r, k, ge, E));
    },
    onResizeStop: (r, b, D, { e: G, node: A, handle: E }) => {
      s.cancel();
      const { layout: y, oldResizeItem: R, oldLayout: Z } = t, { cols: Y, allowOverlap: B } = e, le = Re(y, r);
      if (!le) return;
      const ye = E, ae = t.activeDrag || L(le, b, D, ye);
      let ue;
      if (a) {
        const H = N.dispatch({
          type: "STOP_RESIZE",
          interactionId: a,
          geometry: {
            x: ae.x,
            y: ae.y,
            w: ae.w,
            h: ae.h
          }
        });
        if (ue = F(H.effects, "COMMIT_RESIZE"), !ue) {
          (F(H.effects, "EMIT_RESIZE_STOP") || !a) && n.emitResizeStop(y, R, le, void 0, G, A), xe();
          return;
        }
      }
      if (!ue) {
        n.emitResizeStop(y, R, le, void 0, G, A), xe();
        return;
      }
      if (!S()) {
        const H = ae, be = i.getCommitted();
        q(
          ue.requestId,
          {
            type: "resize",
            id: r,
            w: H.w,
            h: H.h,
            x: H.x,
            y: H.y,
            handle: E
          },
          (z) => {
            (async () => {
              var X, De;
              if (z.status === "stale" || !N.isCurrentRequest(ue.interactionId, ue.requestId)) return;
              let j = [];
              if (a) {
                const J = z.status === "cancelled" ? "error" : z.status;
                j = N.dispatch({
                  type: "APPLY_RESULT",
                  interactionId: a,
                  requestId: ue.requestId,
                  status: J
                }).effects;
              }
              const O = z.status === "changed" || z.status === "fallback" ? z.layout : i.getCommitted(), V = Re(O, r) || le, $ = z.status === "changed" || z.status === "fallback" ? (t.suppressLayoutChange = !0, await ((X = o.commitResize) == null ? void 0 : X.call(o, {
                id: r,
                beforeLayout: Z || be || y,
                afterLayout: O,
                handle: ye
              }))) : null;
              if ($ && $.status !== "changed" && $.status !== "noop") {
                const J = Z || be || y;
                t.suppressLayoutChange = !0, t.layout = M(J), (De = o.rollbackInteraction) == null || De.call(o, J, $.status), t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, T.value = null, d.value = !1, a = null, l.reset(), t.oldLayout = null;
                return;
              }
              F(j, "EMIT_RESIZE_STOP") && n.emitResizeStop(O, R, V, void 0, G, A), t.activeDrag = null, t.layout = M(O), t.oldResizeItem = null, t.resizing = !1, T.value = null, d.value = !1, a = null, l.reset(), o.clearGuides(), t.oldLayout = null, f(O, Z || be || y, "push");
            })();
          },
          K()
        );
        return;
      }
      const k = B ? y : Fe(y, ze(e), Y);
      let Te = [];
      a && ue && (Te = N.dispatch({
        type: "APPLY_RESULT",
        interactionId: a,
        requestId: ue.requestId,
        status: "changed"
      }).effects), (async () => {
        var be, z;
        const H = (t.suppressLayoutChange = !0, await ((be = o.commitResize) == null ? void 0 : be.call(o, {
          id: r,
          beforeLayout: Z || y,
          afterLayout: k,
          handle: ye
        })));
        if (H && H.status !== "changed" && H.status !== "noop") {
          const j = Z || y;
          t.suppressLayoutChange = !0, t.layout = M(j), (z = o.rollbackInteraction) == null || z.call(o, j, H.status), xe();
          return;
        }
        F(Te, "EMIT_RESIZE_STOP") && n.emitResizeStop(k, R, le, void 0, G, A), t.activeDrag = null, t.layout = M(k), t.oldResizeItem = null, t.resizing = !1, T.value = null, d.value = !1, a = null, l.reset(), o.clearGuides(), t.oldLayout = null, f(k, Z || y, "push");
      })();
    },
    onDragStart: (r, b, D, { e: G, node: A }) => {
      s.cancel();
      const { layout: E } = t, y = Re(E, r);
      if (!y) return;
      const R = o.resolveMoveDrag({
        id: r,
        item: y,
        layout: E,
        legacyLayoutEngine: S(),
        event: G
      });
      if (R.kind === "blocked") {
        c = {
          kind: "blocked",
          reason: R.reason,
          ids: R.ids,
          activeId: R.activeId
        };
        const le = P("drag-interaction", r), ye = N.dispatch({
          type: "START_DRAG",
          interactionId: le,
          itemId: r,
          grid: { x: b, y: D },
          context: Pe(c)
        });
        if (!F(ye.effects, "EMIT_DRAG_START")) {
          c = null;
          return;
        }
        return v = le, p.value = R.activeId || r, Q(
          R.reason,
          R.ids,
          `Pointer move blocked by ${R.reason}.`
        ), t.oldDragItem = rt(y), t.oldLayout = Me(E), t.activeDrag = M({ w: y.w, h: y.h, x: y.x, y: y.y, placeholder: !0, i: r }), u = !1, o.notifyMoveBlocked({
          ...R,
          message: `Pointer move blocked by ${R.reason}.`
        }), n.emitDragStart(E, y, y, void 0, G, A);
      }
      const Z = { w: y.w, h: y.h, x: y.x, y: y.y, placeholder: !0, i: r };
      c = R.kind === "group" ? {
        kind: "group",
        activeId: R.activeId,
        ids: R.ids,
        startX: y.x,
        startY: y.y
      } : {
        kind: "single",
        id: R.id,
        startX: y.x,
        startY: y.y
      };
      const Y = P("drag-interaction", r), B = N.dispatch({
        type: "START_DRAG",
        interactionId: Y,
        itemId: r,
        grid: { x: b, y: D },
        context: Pe(c)
      });
      if (!F(B.effects, "EMIT_DRAG_START")) {
        c = null;
        return;
      }
      return v = Y, te(E, "replace"), p.value = c.kind === "group" ? c.activeId : r, g.value = !1, x(), o.resetSnap(), o.clearGuides(), u = !1, l.init(A), t.oldDragItem = rt(y), t.oldLayout = Me(E), t.activeDrag = M(Z), S() || (C(E), i.start({
        id: v,
        type: "drag",
        itemId: p.value || r
      })), n.emitDragStart(E, y, y, void 0, G, A);
    },
    onDrag: (r, b, D, { e: G, node: A }) => {
      const { oldDragItem: E } = t;
      let { layout: y } = t;
      const { cols: R, allowOverlap: Z, preventCollision: Y } = e, B = Re(y, r);
      if (!B) return;
      if (l.maybeScroll(G, A), (c == null ? void 0 : c.kind) === "blocked") {
        g.value = !0;
        return;
      }
      if (!v) return;
      if ((c == null ? void 0 : c.kind) === "group" && !S()) {
        const z = c, j = Re(y, z.activeId) || B, O = o.snapCandidate(
          z.activeId,
          j,
          { ...j, x: b, y: D },
          y
        ), V = N.dispatch({
          type: "MOVE_DRAG",
          interactionId: v,
          currentPx: { x: O.x, y: O.y },
          grid: { x: O.x, y: O.y }
        }), $ = F(V.effects, "PREVIEW_DRAG");
        if (!$) {
          u || o.clearGuides();
          return;
        }
        u = !0;
        const X = O.x - z.startX, De = O.y - z.startY;
        W(
          $.requestId,
          {
            type: "groupMove",
            ids: z.ids,
            activeId: z.activeId,
            dx: X,
            dy: De,
            userAction: !0
          },
          (J) => {
            if (J.status === "stale" || !N.isCurrentPreviewRequest($.interactionId, $.requestId) || c !== z || p.value !== z.activeId) return;
            const Ie = J.status === "changed" || J.status === "fallback" ? J.layout : i.getCommitted(), ge = Re(Ie, z.activeId) || j, he = J.placeholder || {
              w: ge.w,
              h: ge.h,
              x: ge.x,
              y: ge.y,
              placeholder: !0,
              i: z.activeId
            };
            p.value === z.activeId && fe(J, z.ids, z.activeId), n.emitDrag(Ie, E, ge, he, G, A), (J.status === "changed" || J.status === "fallback") && (t.layout = M(Ie)), t.activeDrag = M(he), o.updateIntelligence(z.activeId, j, he);
          },
          K()
        );
        return;
      }
      if (!S()) {
        const z = o.snapCandidate(r, B, { ...B, x: b, y: D }, y), j = N.dispatch({
          type: "MOVE_DRAG",
          interactionId: v,
          currentPx: { x: z.x, y: z.y },
          grid: { x: z.x, y: z.y }
        }), O = F(j.effects, "PREVIEW_DRAG");
        if (!O) {
          u || o.clearGuides();
          return;
        }
        u = !0, W(
          O.requestId,
          { type: "move", id: r, x: z.x, y: z.y, userAction: !0 },
          (V) => {
            if (V.status === "stale" || !N.isCurrentPreviewRequest(O.interactionId, O.requestId) || (c == null ? void 0 : c.kind) !== "single" || c.id !== r || p.value !== r) return;
            const $ = V.status === "changed" || V.status === "fallback" ? V.layout : i.getCommitted(), X = Re($, r) || B, De = V.placeholder || {
              w: X.w,
              h: X.h,
              x: X.x,
              y: X.y,
              placeholder: !0,
              i: r
            };
            p.value === r && fe(V, [r], r), n.emitDrag($, E, X, De, G, A), (V.status === "changed" || V.status === "fallback") && (t.layout = M($)), t.activeDrag = M(De), o.updateIntelligence(r, B, De);
          },
          K()
        );
        return;
      }
      const le = t.layout.length >= Ot, ye = B.x, ae = B.y;
      if (p.value === r) {
        const z = Y && !Z ? Je(y, { ...B, x: b, y: D }) : [];
        z.length > 0 ? Q(
          "collision",
          z.map((j) => j.i),
          "Pointer move blocked by collision."
        ) : (g.value = !1, x());
      }
      const ue = !0, k = o.snapCandidate(r, B, { ...B, x: b, y: D }, y), Te = N.dispatch({
        type: "MOVE_DRAG",
        interactionId: v,
        currentPx: { x: k.x, y: k.y },
        grid: { x: k.x, y: k.y }
      });
      if (!F(Te.effects, "PREVIEW_DRAG")) {
        u || o.clearGuides();
        return;
      }
      u = !0, y = Xe(
        y,
        B,
        ze(e),
        R,
        Z,
        k.x,
        k.y,
        ue,
        Y
      );
      const H = { w: B.w, h: B.h, x: B.x, y: B.y, placeholder: !0, i: r };
      if (n.emitDrag(y, E, B, H, G, A), !!(B.x !== ye || B.y !== ae || Z && y !== t.layout)) {
        if (!le) {
          const z = Z ? y : Fe(y, ze(e), R), j = Re(z, r) || B, O = {
            w: j.w,
            h: j.h,
            x: j.x,
            y: j.y,
            placeholder: !0,
            i: r
          };
          t.layout = M(z), t.activeDrag = M(O), o.updateIntelligence(r, B, O);
          return;
        }
        Z || s.resetMovedFlags(t.layout), s.schedule({
          cols: R,
          compactType: ze(e),
          layout: Z && y !== t.layout ? y : void 0,
          placeholder: H,
          shouldCompact: !Z
        }), o.updateIntelligence(r, B, H);
      }
    },
    onDragStop: (r, b, D, { e: G, node: A }) => {
      if (s.cancel(), !t.activeDrag) return;
      const { oldDragItem: E, oldLayout: y } = t, R = t.layout;
      let Z = R;
      const { cols: Y, preventCollision: B, allowOverlap: le } = e, ye = Re(Z, r);
      if (!ye) return;
      let ae, ue = [];
      if (v) {
        const z = N.dispatch({
          type: "STOP_DRAG",
          interactionId: v,
          grid: { x: b, y: D }
        });
        ue = z.effects, ae = F(z.effects, "COMMIT_DRAG");
      }
      if (!ae) {
        (F(ue, "EMIT_DRAG_STOP") || !v) && n.emitDragStop(R, E, ye, void 0, G, A), pe(), t.oldLayout = null;
        return;
      }
      if ((c == null ? void 0 : c.kind) === "group" && !S()) {
        const z = c, j = t.activeDrag || { x: b, y: D }, O = j.x - z.startX, V = j.y - z.startY, $ = i.getCommitted();
        q(
          ae.requestId,
          {
            type: "groupMove",
            ids: z.ids,
            activeId: z.activeId,
            dx: O,
            dy: V,
            userAction: !0
          },
          (X) => {
            (async () => {
              var he, me;
              if (X.status === "stale" || !N.isCurrentRequest(ae.interactionId, ae.requestId)) return;
              X.status === "blocked" && fe(X, z.ids, z.activeId, !0);
              const De = N.dispatch({
                type: "APPLY_RESULT",
                interactionId: ae.interactionId,
                requestId: ae.requestId,
                status: X.status === "cancelled" ? "error" : X.status
              }).effects, J = X.status === "changed" || X.status === "fallback" ? X.layout : i.getCommitted(), Ie = Re(J, z.activeId) || ye, ge = X.status === "changed" || X.status === "fallback" ? (t.suppressLayoutChange = !0, await ((he = o.commitMove) == null ? void 0 : he.call(o, {
                ids: z.ids,
                activeId: z.activeId,
                beforeLayout: y || $ || R,
                afterLayout: J,
                source: "pointer"
              }))) : null;
              if (ge && ge.status !== "changed" && ge.status !== "noop") {
                const we = y || $ || R;
                t.suppressLayoutChange = !0, t.layout = M(we), (me = o.rollbackInteraction) == null || me.call(o, we, ge.status), t.activeDrag = null, t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), t.oldLayout = null;
                return;
              }
              F(De, "EMIT_DRAG_STOP") && n.emitDragStop(J, E, Ie, void 0, G, A), t.activeDrag = null, t.layout = M(J), t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), o.clearGuides(), t.oldLayout = null, f(J, y || $ || R, "push");
            })();
          },
          K()
        );
        return;
      }
      if (!S()) {
        const z = t.activeDrag || { x: b, y: D }, j = i.getCommitted();
        q(
          ae.requestId,
          { type: "move", id: r, x: z.x, y: z.y, userAction: !0 },
          (O) => {
            (async () => {
              var J, Ie;
              if (O.status === "stale" || !N.isCurrentRequest(ae.interactionId, ae.requestId)) return;
              O.status === "blocked" && fe(O, [r], r, !0);
              const V = N.dispatch({
                type: "APPLY_RESULT",
                interactionId: ae.interactionId,
                requestId: ae.requestId,
                status: O.status === "cancelled" ? "error" : O.status
              }).effects, $ = O.status === "changed" || O.status === "fallback" ? O.layout : i.getCommitted(), X = Re($, r) || ye, De = O.status === "changed" || O.status === "fallback" ? (t.suppressLayoutChange = !0, await ((J = o.commitMove) == null ? void 0 : J.call(o, {
                ids: [r],
                activeId: r,
                beforeLayout: y || j || R,
                afterLayout: $,
                source: "pointer"
              }))) : null;
              if (De && De.status !== "changed" && De.status !== "noop") {
                const ge = y || j || R;
                t.suppressLayoutChange = !0, t.layout = M(ge), (Ie = o.rollbackInteraction) == null || Ie.call(o, ge, De.status), t.activeDrag = null, t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), t.oldLayout = null;
                return;
              }
              F(V, "EMIT_DRAG_STOP") && n.emitDragStop($, E, X, void 0, G, A), t.activeDrag = null, t.layout = M($), t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), o.clearGuides(), t.oldLayout = null, f($, y || j || R, "push");
            })();
          },
          K()
        );
        return;
      }
      const k = !0, Te = t.activeDrag || { x: b, y: D };
      Z = Xe(
        Z,
        ye,
        ze(e),
        Y,
        le,
        Te.x,
        Te.y,
        k,
        B
      );
      const H = le ? Z : Fe(Z, ze(e), Y), be = N.dispatch({
        type: "APPLY_RESULT",
        interactionId: ae.interactionId,
        requestId: ae.requestId,
        status: "changed"
      }).effects;
      (async () => {
        var j, O;
        const z = (t.suppressLayoutChange = !0, await ((j = o.commitMove) == null ? void 0 : j.call(o, {
          ids: [r],
          activeId: r,
          beforeLayout: y || R,
          afterLayout: H,
          source: "pointer"
        })));
        if (z && z.status !== "changed" && z.status !== "noop") {
          const V = y || R;
          t.suppressLayoutChange = !0, t.layout = M(V), (O = o.rollbackInteraction) == null || O.call(o, V, z.status), t.activeDrag = null, t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), t.oldLayout = null;
          return;
        }
        F(be, "EMIT_DRAG_STOP") && n.emitDragStop(H, E, ye, void 0, G, A), t.activeDrag = null, t.layout = M(H), t.oldDragItem = null, p.value = null, g.value = !1, x(), c = null, u = !1, v = null, l.reset(), o.clearGuides(), t.oldLayout = null, f(H, y || R, "push");
      })();
    }
  };
}
function Zn({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: i,
  frameUpdate: s,
  autoScroll: l,
  editor: o,
  isFirefox: m,
  layoutClassName: P,
  interactionMachine: te,
  nextInteractionRequestId: f
}) {
  const g = Ae(0);
  let d = null;
  const p = te || It({
    getDragActivationDistance: () => e.dragActivationDistance
  }), T = () => i.getLayoutEngineProp(), _ = () => i.isLegacyLayoutEngine(), I = (L = t.layout) => i.reset(L), h = (...L) => i.preview(...L), c = (...L) => i.commit(...L), u = (L, K) => L.find((x) => x.type === K), v = (L) => {
    if (!d) {
      const K = f("drop-interaction", L), x = p.dispatch({
        type: "ENTER_DROP",
        interactionId: K,
        itemId: L
      });
      if (u(x.effects, "REJECT_TRANSITION")) return null;
      d = K;
    }
    return d;
  }, a = (L, K, x, Q) => {
    const fe = v(L);
    if (!fe) return null;
    const ee = p.dispatch({
      type: "MOVE_DROP",
      interactionId: fe,
      grid: K,
      size: x,
      strategy: Q
    });
    return u(ee.effects, "PREVIEW_DROP") || null;
  }, w = (L) => {
    p.reset(L), d = null;
  }, S = (L = "drop-cleanup", K = !1) => {
    s.cancel();
    const { droppingItem: x, cols: Q } = e, { layout: fe } = t, ee = Fe(
      fe.filter((pe) => pe.i !== x.i),
      ze(e),
      Q,
      e.allowOverlap
    );
    t.suppressLayoutChange = !0, K || (t.layout = M(ee)), t.droppingDOMNode = null, t.activeDrag = null, t.droppingPosition = void 0, l.reset(), o.clearGuides(), w(L);
  };
  return {
    clearDropInteraction: () => w("clear-active-interaction"),
    removeDroppingPlaceholder: S,
    onDrop: (L) => {
      var ne, Ee, Oe;
      L.preventDefault(), L.stopPropagation();
      const { droppingItem: K, cols: x, maxRows: Q, dropStrategy: fe } = e, { layout: ee } = t;
      let pe = ee.find((U) => U.i === K.i);
      if (!_()) {
        const U = String(K.i), oe = v(U);
        if (!oe) return;
        const Se = p.dispatch({
          type: "COMMIT_DROP",
          interactionId: oe
        }), r = u(Se.effects, "COMMIT_DROP");
        if (!r) {
          S("drop-commit-rejected");
          return;
        }
        const b = Me(ee.filter((A) => A.i !== U)), D = pe || t.activeDrag || null, G = D ? { x: D.x, y: D.y } : void 0;
        I(b), i.start({
          id: f("drop-commit-start", U),
          type: "drop",
          itemId: U
        }), c(
          r.requestId,
          {
            type: "dropFit",
            item: {
              i: U,
              w: K.w,
              h: K.h
            },
            strategy: fe === "auto" ? "auto" : "cursor",
            target: G
          },
          (A) => {
            (async () => {
              var B, le;
              if (A.status === "stale" || !p.isCurrentRequest(r.interactionId, r.requestId)) return;
              const E = A.status === "cancelled" ? "error" : A.status;
              p.dispatch({
                type: "APPLY_RESULT",
                interactionId: oe,
                requestId: r.requestId,
                status: E
              });
              const y = A.placeholder || D || void 0;
              let R;
              y && (R = { ...y }, delete R.isDraggable, delete R.isResizable);
              const Z = A.status === "changed" || A.status === "fallback" ? A.layout : b, Y = A.status === "changed" || A.status === "fallback" ? (t.suppressLayoutChange = !0, await ((B = o.commitDrop) == null ? void 0 : B.call(o, {
                id: U,
                beforeLayout: b,
                afterLayout: Z,
                item: R,
                event: L
              }))) : null;
              if (Y && Y.status !== "changed" && Y.status !== "noop") {
                t.suppressLayoutChange = !0, t.layout = M(b), (le = o.rollbackInteraction) == null || le.call(o, b, Y.status), g.value = 0, S(Y.status);
                return;
              }
              g.value = 0, n.emitDrop(
                Z.filter((ye) => ye.i !== U),
                L,
                R
              ), S("drop-cleanup", !!Y);
            })();
          },
          b.length >= (((Oe = (Ee = (ne = T()) == null ? void 0 : ne.scheduler) == null ? void 0 : Ee.auto) == null ? void 0 : Oe.workerMinItems) || 1e3)
        );
        return;
      }
      if (!pe && fe === "auto") {
        const U = tn(
          ee.filter((oe) => oe.i !== K.i),
          { w: K.w, h: K.h },
          x,
          Q
        );
        U && (pe = {
          ...K,
          x: U.x,
          y: U.y,
          static: !1
        });
      }
      let re;
      if (pe && (re = { ...pe }, delete re.isDraggable, delete re.isResizable, fe === "cursor")) {
        const U = Je(
          ee.filter((oe) => oe.i !== K.i),
          re
        );
        U.length > 0 && (re.x = Math.min(...U.map((oe) => oe.x)), re.y = Math.max(...U.map((oe) => oe.y + oe.h)));
      }
      const F = v(String(K.i));
      if (!F) return;
      const Pe = p.dispatch({
        type: "COMMIT_DROP",
        interactionId: F
      }), xe = u(Pe.effects, "COMMIT_DROP");
      xe && p.dispatch({
        type: "APPLY_RESULT",
        interactionId: F,
        requestId: xe.requestId,
        status: re ? "changed" : "noop"
      }), (async () => {
        var b, D;
        const U = String(K.i), oe = Me(ee.filter((G) => G.i !== U)), Se = re ? [...oe, re] : oe, r = re ? (t.suppressLayoutChange = !0, await ((b = o.commitDrop) == null ? void 0 : b.call(o, {
          id: U,
          beforeLayout: oe,
          afterLayout: Se,
          item: re,
          event: L
        }))) : null;
        if (r && r.status !== "changed" && r.status !== "noop") {
          t.suppressLayoutChange = !0, t.layout = M(oe), (D = o.rollbackInteraction) == null || D.call(o, oe, r.status), g.value = 0, S(r.status);
          return;
        }
        g.value = 0, n.emitDrop(oe, L, re), S("drop-cleanup", !!r);
      })();
    },
    onDragEnter: (L) => {
      L.preventDefault(), L.stopPropagation(), g.value === 0 && v(String(e.droppingItem.i)), g.value++;
    },
    onDragLeave: (L) => {
      L.preventDefault(), L.stopPropagation(), g.value = Math.max(0, g.value - 1), g.value === 0 && (d && p.dispatch({
        type: "LEAVE_DROP",
        interactionId: d,
        reason: "drag-leave"
      }), S("drag-leave"));
    },
    onDragOver: (L) => {
      var Y, B, le, ye, ae, ue, k, Te;
      if (L.preventDefault(), L.stopPropagation(), m && !((B = (Y = L.currentTarget) == null ? void 0 : Y.classList) != null && B.contains(P)))
        return !1;
      const { droppingItem: K, margin: x, cols: Q, rowHeight: fe, maxRows: ee, width: pe, containerPadding: re, transformScale: F, dropStrategy: Pe } = e, xe = n.callDropDragOver(L);
      if (xe === !1)
        return d && p.dispatch({
          type: "REJECT_DROP",
          interactionId: d,
          reason: "drop-drag-over-rejected"
        }), t.droppingDOMNode ? S("drop-drag-over-rejected") : w("drop-drag-over-rejected"), !1;
      const ne = { ...K, ...xe || {} }, { layout: Ee } = t;
      if (Pe === "auto") {
        const H = L.currentTarget instanceof Element ? L.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, be = (L.clientX - H.left) / F, z = (L.clientY - H.top) / F, O = pt({
          cols: Q,
          margin: x,
          maxRows: ee,
          rowHeight: fe,
          containerWidth: pe || 0,
          containerPadding: re || x
        }, z, be, ne.w, ne.h), V = Me(Ee.filter((he) => he.i !== ne.i));
        if (!_()) {
          const he = String(ne.i), me = {
            ...ne,
            i: he,
            x: O.x,
            y: O.y,
            static: !1
          }, we = o.snapCandidate(
            he,
            me,
            me,
            V
          ), ve = a(
            he,
            { x: we.x, y: we.y },
            { w: ne.w, h: ne.h },
            "auto"
          );
          if (!ve) return;
          I(V), i.start({
            id: d || ve.interactionId,
            type: "drop",
            itemId: he
          }), h(
            ve.requestId,
            {
              type: "dropFit",
              item: {
                i: he,
                w: ne.w,
                h: ne.h
              },
              strategy: "cursor",
              target: { x: we.x, y: we.y }
            },
            (ie) => {
              var ce;
              if (ie.status !== "stale" && p.isCurrentPreviewRequest(ve.interactionId, ve.requestId)) {
                if (!((ce = ie.drop) != null && ce.position)) {
                  t.droppingDOMNode && S();
                  return;
                }
                t.droppingDOMNode || (t.droppingDOMNode = M(qe("div", { key: ne.i }))), t.droppingPosition = void 0, t.suppressLayoutChange = !0, t.layout = M(ie.layout), t.activeDrag = ie.placeholder ? M(ie.placeholder) : null, ie.placeholder && o.updateIntelligence(String(ne.i), ie.placeholder, ie.placeholder);
              }
            },
            V.length >= (((ae = (ye = (le = T()) == null ? void 0 : le.scheduler) == null ? void 0 : ye.auto) == null ? void 0 : ae.workerMinItems) || 1e3)
          );
          return;
        }
        const $ = en(V, { w: ne.w, h: ne.h }, Q, O.x, O.y, ee);
        if (!$) {
          t.droppingDOMNode && S();
          return;
        }
        t.droppingDOMNode || (t.droppingDOMNode = M(qe("div", { key: ne.i }))), t.droppingPosition = void 0;
        const X = String(ne.i);
        if (!a(
          X,
          { x: $.x, y: $.y },
          { w: ne.w, h: ne.h },
          "auto"
        )) return;
        const J = Re(Ee, X);
        if (!J) {
          const he = {
            ...ne,
            x: $.x,
            y: $.y,
            static: !1,
            isDraggable: !1,
            isResizable: !1,
            i: X
          }, me = o.snapCandidate(
            X,
            he,
            he,
            V
          );
          t.suppressLayoutChange = !0, t.layout = M([
            ...V,
            me
          ]), t.activeDrag = M({ ...me, placeholder: !0 }), o.updateIntelligence(X, me, me);
          return;
        }
        const Ie = o.snapCandidate(
          X,
          J,
          {
            ...J,
            ...ne,
            x: $.x,
            y: $.y,
            static: !1,
            isDraggable: !1,
            isResizable: !1
          },
          V
        ), [ge] = gt(Ee, X, (he) => ({
          ...he,
          ...ne,
          x: Ie.x,
          y: Ie.y,
          static: !1,
          isDraggable: !1,
          isResizable: !1
        }));
        t.suppressLayoutChange = !0, t.layout = M(ge), t.activeDrag = M({ ...Ie, placeholder: !0 }), o.updateIntelligence(X, J, {
          ...J,
          ...ne,
          x: Ie.x,
          y: Ie.y
        });
        return;
      }
      const Oe = L.currentTarget instanceof Element ? L.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, U = (L.clientX - Oe.left) / F, oe = (L.clientY - Oe.top) / F, Se = ne, b = pt({
        cols: Q,
        margin: x,
        maxRows: ee,
        rowHeight: fe,
        containerWidth: pe || 0,
        containerPadding: re || x
      }, oe, U, Se.w, Se.h), D = String(Se.i), G = Me(Ee.filter((H) => H.i !== D)), A = {
        ...Se,
        i: D,
        x: b.x,
        y: b.y,
        static: !1,
        isDraggable: !1,
        isResizable: !1
      }, E = o.snapCandidate(
        D,
        A,
        A,
        G
      ), y = a(
        D,
        { x: E.x, y: E.y },
        { w: Se.w, h: Se.h },
        "cursor"
      );
      if (!y) return;
      if (!_()) {
        I(G), i.start({
          id: d || y.interactionId,
          type: "drop",
          itemId: D
        }), h(
          y.requestId,
          {
            type: "dropFit",
            item: {
              i: D,
              w: Se.w,
              h: Se.h
            },
            strategy: "cursor",
            target: { x: E.x, y: E.y }
          },
          (H) => {
            var be;
            if (H.status !== "stale" && p.isCurrentPreviewRequest(y.interactionId, y.requestId)) {
              if (!((be = H.drop) != null && be.position)) {
                t.droppingDOMNode && S();
                return;
              }
              t.droppingDOMNode || (t.droppingDOMNode = M(qe("div", { key: D }))), t.droppingPosition = void 0, t.suppressLayoutChange = !0, t.layout = M(H.layout), t.activeDrag = H.placeholder ? M(H.placeholder) : null, H.placeholder && o.updateIntelligence(D, H.placeholder, H.placeholder);
            }
          },
          G.length >= (((Te = (k = (ue = T()) == null ? void 0 : ue.scheduler) == null ? void 0 : k.auto) == null ? void 0 : Te.workerMinItems) || 1e3)
        );
        return;
      }
      t.droppingDOMNode || (t.droppingDOMNode = M(qe("div", { key: D }))), t.droppingPosition = void 0;
      const R = Re(Ee, D);
      if (!R) {
        const H = {
          ...E,
          i: D,
          static: !1,
          isDraggable: !1,
          isResizable: !1
        };
        t.suppressLayoutChange = !0, t.layout = M([
          ...G,
          H
        ]), t.activeDrag = M({ ...H, placeholder: !0 }), o.updateIntelligence(D, H, H);
        return;
      }
      const [Z] = gt(Ee, D, (H) => ({
        ...H,
        ...Se,
        x: E.x,
        y: E.y,
        static: !1,
        isDraggable: !1,
        isResizable: !1
      }));
      t.suppressLayoutChange = !0, t.layout = M(Z), t.activeDrag = M({
        ...R,
        ...Se,
        x: E.x,
        y: E.y,
        placeholder: !0
      }), o.updateIntelligence(D, R, {
        ...R,
        ...Se,
        x: E.x,
        y: E.y
      });
    }
  };
}
function jn(e) {
  const t = It({
    getDragActivationDistance: () => e.props.dragActivationDistance
  }), n = {
    ...e,
    interactionMachine: t
  }, i = Fn(n), s = Zn(n);
  return {
    ...i,
    ...s,
    clearActiveInteraction: () => {
      i.clearActiveInteraction(), s.clearDropInteraction();
    }
  };
}
const Yn = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, st = (e, t = {}) => ({
  code: "measurement-unavailable",
  level: "warning",
  message: "Parent container height measurement was unavailable.",
  prop: "autoMeasureContainerHeight",
  details: {
    reason: e,
    ...t
  }
}), Ue = (e) => {
  const t = Number.parseFloat(e || "0");
  return Number.isFinite(t) ? t : 0;
}, $n = (e) => {
  var s, l;
  const t = e.getBoundingClientRect(), n = ((s = e.ownerDocument) == null ? void 0 : s.defaultView) || (typeof window != "undefined" ? window : null), i = (l = n == null ? void 0 : n.getComputedStyle) == null ? void 0 : l.call(n, e);
  return i ? t.height - Ue(i.paddingTop) - Ue(i.paddingBottom) - Ue(i.borderTopWidth) - Ue(i.borderBottomWidth) : t.height;
};
function Xn({
  enabled: e,
  rootRef: t,
  onDiagnostics: n
}) {
  const i = Ae(null), s = Ae([]);
  let l = null, o = null, m = !1;
  const P = (p) => {
    s.value = p, n == null || n(p);
  }, te = () => {
    l == null || l.disconnect(), l = null, o = null;
  }, f = (p, T = "resize-observer") => {
    if (Yn(p)) {
      i.value = p, P([]);
      return;
    }
    i.value = null, P([st("invalid-height", { height: p, source: T })]);
  }, g = () => {
    var _;
    if (m) return;
    if (te(), !e()) {
      i.value = null, P([]);
      return;
    }
    const p = ((_ = t.value) == null ? void 0 : _.parentElement) || null;
    if (!p) {
      i.value = null, P([st("missing-parent")]);
      return;
    }
    const T = typeof ResizeObserver != "undefined" ? ResizeObserver : un;
    if (!T) {
      i.value = null, P([st("resize-observer-unavailable")]);
      return;
    }
    o = p, l = new T((I) => {
      var c;
      const h = I.find((u) => u.target === o) || I[0];
      f((c = h == null ? void 0 : h.contentRect) == null ? void 0 : c.height, "content-rect");
    }), l.observe(p), f($n(p), "initial-content-box");
  }, d = () => {
    m = !0, te(), i.value = null;
  };
  return je(
    () => {
      var p;
      return [e(), ((p = t.value) == null ? void 0 : p.parentElement) || null];
    },
    () => {
      jt(g);
    },
    { immediate: !0 }
  ), qt(d), {
    measuredContainerHeight: i,
    diagnostics: s,
    stop: d
  };
}
const Un = (e, t) => {
  const n = typeof e.isDraggable == "boolean" ? e.isDraggable : !e.static && t.isDraggable, i = typeof e.isResizable == "boolean" ? e.isResizable : !e.static && t.isResizable;
  return {
    visible: !0,
    draggable: n,
    resizable: i,
    bounded: n && t.isBounded && e.isBounded !== !1,
    className: void 0,
    previewItem: null,
    onClick: void 0
  };
}, Jn = () => ({
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
  commitMove: async () => null,
  commitResize: async () => null,
  commitDrop: async () => null,
  rollbackInteraction: () => {
  }
}), Kn = (e) => ({
  interactions: Jn(),
  getItemRenderState: Un,
  getRootClassNames: () => {
  },
  isExternalDropEnabled: (t) => t,
  renderOverlay: () => null
});
function Qn(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Ht(e);
}
const lt = "vue-grid-layout", ei = typeof navigator != "undefined" && /firefox/i.test(navigator.userAgent), gi = ({
  name: e,
  props: t,
  createRuntimeExtension: n = Kn
}) => /* @__PURE__ */ Mt({
  name: e,
  inheritAttrs: !1,
  props: t,
  emits: On,
  setup(i, {
    slots: s,
    attrs: l,
    emit: o
  }) {
    const m = i, P = Nn(o, Yt()), te = Hn({
      props: m,
      slots: s,
      emitModelValue: (x) => P.emitModelValue(x),
      emitLayoutChange: (x) => P.emitLayoutChange(x)
    }), {
      state: f,
      onLayoutMaybeChanged: g
    } = te, d = Ae(null), p = Xn({
      enabled: () => m.autoMeasureContainerHeight === !0,
      rootRef: d
    }), T = it(() => cn({
      layout: f.layout,
      autoSize: m.autoSize,
      heightMode: m.heightMode,
      rowHeight: m.rowHeight,
      minRowHeight: m.minRowHeight,
      margin: m.margin,
      containerPadding: m.containerPadding || m.margin,
      containerHeight: m.containerHeight,
      measuredContainerHeight: p.measuredContainerHeight.value,
      measurementDiagnostics: p.diagnostics.value,
      autoMeasureContainerHeight: m.autoMeasureContainerHeight,
      renderPrecision: m.renderPrecision,
      context: {
        source: "grid"
      }
    })), _ = new Proxy(m, {
      get(x, Q) {
        return Q === "rowHeight" ? T.value.rowHeight : x[Q];
      }
    }), I = qn({
      props: m,
      getLayout: () => f.layout
    }), h = {
      current: null
    }, c = n({
      props: _,
      layoutRef: $t(f, "layout"),
      engineBridge: I,
      getLayout: () => f.layout,
      getOldDragItem: () => f.oldDragItem,
      getOldResizeItem: () => f.oldResizeItem,
      isDropping: () => !!f.droppingDOMNode,
      getInteractionState: () => h.current ? {
        activeDragId: h.current.activeDragId.value,
        activeResizeId: h.current.activeResizeId.value,
        dragBlocked: h.current.dragBlocked.value,
        dragBlockedReason: h.current.dragBlockedReason.value,
        dragBlockedItemIds: h.current.dragBlockedItemIds.value,
        dragBlockedMessage: h.current.dragBlockedMessage.value,
        resizeBlocked: h.current.resizeBlocked.value
      } : null
    }), u = c.interactions;
    let v = 0;
    const a = (x, Q) => `${x}:${Q}:${++v}`, w = Bn({
      getLayout: () => f.layout,
      setLayout: (x) => {
        f.layout = M(x);
      },
      setActiveDrag: (x) => {
        f.activeDrag = M(x);
      }
    }), S = Wn({
      getConfig: () => m.autoScroll,
      rootClassName: lt
    }), C = jn({
      props: _,
      state: f,
      eventBridge: P,
      engineBridge: I,
      frameUpdate: w,
      autoScroll: S,
      editor: u,
      isFirefox: ei,
      layoutClassName: lt,
      nextInteractionRequestId: a,
      syncHistory: c.syncHistory || Ve,
      onLayoutMaybeChanged: g
    });
    h.current = C, te.watchLayoutDependencies({
      reconcileSynchronizedLayout: (x) => {
        if (!I.isLegacyLayoutEngine() && (C.activeDragId.value || C.activeResizeId.value)) {
          const Q = I.rebase(x);
          if (!Q)
            return {
              clearActive: !0
            };
          if (Q.placeholder)
            return {
              placeholder: Q.placeholder
            };
        } else I.isLegacyLayoutEngine() || I.reset(x);
      },
      clearActiveInteraction: () => C.clearActiveInteraction()
    }), qt(() => {
      var x;
      w.cancel(), S.reset(), I.dispose("component unmounted"), (x = c.stop) == null || x.call(c), p.stop();
    });
    let W = "";
    const q = () => {
      const x = T.value, Q = JSON.stringify(x);
      Q !== W && (W = Q, P.emitHeightRuntimeChange(x));
    };
    je(T, () => {
      f.mounted && q();
    }, {
      deep: !0
    }), Gt(() => {
      var x;
      f.mounted = !0, (x = c.mount) == null || x.call(c), q();
    });
    const N = () => {
      const {
        activeDrag: x
      } = f;
      if (!x) return null;
      const {
        width: Q = 0,
        cols: fe,
        margin: ee,
        containerPadding: pe,
        maxRows: re,
        useCSSTransforms: F,
        transformScale: Pe
      } = m, xe = T.value;
      return He(kt, {
        w: x.w,
        h: x.h,
        x: x.x,
        y: x.y,
        i: x.i,
        class: dt("vue-grid-placeholder", {
          "placeholder-resizing": f.resizing,
          "placeholder-blocked": C.dragBlocked.value || C.resizeBlocked.value
        }),
        containerWidth: Q,
        cols: fe,
        margin: ee,
        containerPadding: pe || ee,
        maxRows: re,
        rowHeight: xe.rowHeight,
        dragActivationDistance: m.dragActivationDistance,
        renderPrecision: xe.renderPrecision,
        isDraggable: !1,
        isResizable: !1,
        isBounded: !1,
        useCSSTransforms: F,
        transformScale: Pe
      }, {
        default: () => [He("div", null, null)]
      });
    }, L = /* @__PURE__ */ new Map(), K = (x, Q, fe) => {
      if (!x || !x.key) return null;
      const ee = Q.get(String(x.key));
      if (!ee) return null;
      const {
        width: pe = 0,
        cols: re,
        margin: F,
        containerPadding: Pe,
        maxRows: xe,
        isDraggable: ne,
        isResizable: Ee,
        isBounded: Oe,
        useCSSTransforms: U,
        transformScale: oe,
        draggableCancel: Se,
        draggableHandle: r,
        resizeHandles: b,
        resizeHandle: D
      } = m, G = T.value, {
        mounted: A,
        droppingPosition: E
      } = f, y = c.getItemRenderState(ee, {
        isDraggable: ne,
        isResizable: Ee,
        isBounded: Oe
      }, fe);
      if (!y.visible) return null;
      const R = y.previewItem || ee, Z = ee.resizeHandles || b;
      return He(kt, {
        key: ee.i,
        containerWidth: pe,
        cols: re,
        margin: F,
        containerPadding: Pe || F,
        maxRows: xe,
        rowHeight: G.rowHeight,
        dragActivationDistance: m.dragActivationDistance,
        renderPrecision: G.renderPrecision,
        cancel: Se,
        handle: r,
        onDragStop: C.onDragStop,
        onDragStart: C.onDragStart,
        onDrag: C.onDrag,
        onResizeStart: C.onResizeStart,
        onResize: C.onResize,
        onResizeStop: C.onResizeStop,
        isDraggable: y.draggable,
        isResizable: y.resizable,
        isBounded: y.bounded,
        isDragBlocked: C.dragBlocked.value && C.activeDragId.value === ee.i,
        isResizeBlocked: C.resizeBlocked.value && C.activeResizeId.value === ee.i,
        useCSSTransforms: U && A,
        usePercentages: !A,
        transformScale: oe,
        w: R.w,
        h: R.h,
        x: R.x,
        y: R.y,
        i: R.i,
        minH: R.minH,
        minW: R.minW,
        maxH: R.maxH,
        maxW: R.maxW,
        static: R.static,
        class: y.className,
        onItemClick: y.onClick,
        droppingPosition: fe && m.dropStrategy !== "auto" ? E : void 0,
        resizeHandles: Z,
        resizeHandle: D
      }, Qn(x) ? x : {
        default: () => [x]
      });
    };
    return () => {
      const {
        class: x,
        style: Q,
        isDroppable: fe,
        innerRef: ee
      } = m, pe = T.value, re = _n(l), F = c.isExternalDropEnabled(fe), Pe = dt(lt, re.class, x, c.getRootClassNames()), xe = {
        ...re.style && typeof re.style == "object" && !Array.isArray(re.style) ? re.style : {},
        height: pe.containerStyle.height,
        ...pe.containerStyle.overflow ? {
          overflow: pe.containerStyle.overflow
        } : {},
        ...Q
      }, ne = s.default ? ft(qe(ut, null, s.default())) : [];
      L.clear();
      for (let U = 0; U < f.layout.length; U++) {
        const oe = f.layout[U];
        L.set(oe.i, oe);
      }
      const Ee = {
        width: m.width || 0,
        margin: m.margin,
        containerPadding: m.containerPadding || m.margin,
        rowHeight: pe.rowHeight,
        renderPrecision: pe.renderPrecision,
        cols: m.cols,
        maxRows: m.maxRows
      }, Oe = (U) => {
        d.value = U, ee && typeof ee == "object" && "value" in ee && (ee.value = U);
      };
      return He("div", Nt(re.attrs, {
        ref: Oe,
        class: Pe,
        style: xe,
        onMousemove: c.onRootPointerMove,
        onClick: c.onRootClick,
        onDrop: F ? C.onDrop : Ve,
        onDragleave: F ? C.onDragLeave : Ve,
        onDragenter: F ? C.onDragEnter : Ve,
        onDragover: F ? C.onDragOver : Ve
      }), [ne.map((U) => K(U, L)), F && f.droppingDOMNode && K(f.droppingDOMNode, L, !0), N(), c.renderOverlay({
        geometry: Ee,
        itemMap: L,
        layout: f.layout
      })]);
    };
  }
});
export {
  fi as b,
  gi as c,
  Xn as u
};
