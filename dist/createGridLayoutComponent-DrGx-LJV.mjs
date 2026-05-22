import { computed as ct, defineComponent as Ht, reactive as Nt, ref as Me, watch as Ue, onMounted as qt, createVNode as Fe, h as Ve, mergeProps as Wt, isVNode as Bt, Fragment as pt, markRaw as G, shallowRef as bt, nextTick as Ut, onBeforeUnmount as Ft, getCurrentInstance as Jt, toRef as Kt } from "vue";
import mt from "clsx";
import { w as Qt, y as en, x as tn, v as Et, p as yt, C as zt, i as Ce, a as qe, c as nn, g as rn, o as De, d as st, F as It, m as tt, s as Qe, f as $e, l as on, k as an, u as Ye } from "./utils-BCVYGne6.mjs";
import { DraggableCore as cn } from "@marsio/vue-draggable";
import { Resizable as sn } from "@marsio/vue-resizable";
import { b as Xe, f as ht, d as Ct, h as it, c as Vt, e as ln, r as un } from "./resolve-C3SqJijI.mjs";
import { deepEqual as lt } from "fast-equals";
import { b as Pt, c as Lt, a as Tt } from "./executor-Bg9C-zCN.mjs";
import { e as dn, c as gn } from "./core-CE462SRA.mjs";
import fn from "resize-observer-polyfill";
const pn = {
  type: Array,
  default: () => []
}, Zt = {
  type: [Object, Function]
}, mi = {
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
}, At = {
  mouse: 4,
  pen: 4,
  touch: 8,
  coarse: 8,
  default: 4
};
function mn(e) {
  return e === "mouse" || e === "pen" || e === "touch" ? e : e === "coarse" ? "coarse" : "unknown";
}
function jt(e, t) {
  var l;
  if (typeof e == "number") return kt(e);
  const n = e || At, r = (l = n.default) != null ? l : At.default, s = t === "mouse" ? n.mouse : t === "pen" ? n.pen : t === "touch" ? n.touch : t === "coarse" ? n.coarse : void 0;
  return kt(s != null ? s : r);
}
function yn(e, t, n) {
  if (n <= 0) return !0;
  const r = t.x - e.x, s = t.y - e.y;
  return Math.sqrt(r * r + s * s) >= n;
}
function kt(e) {
  return !Number.isFinite(e) || e < 0 ? 0 : e;
}
const rt = () => ({
  status: "idle",
  revision: 0
});
function nt(e, t, n = {}) {
  switch (t.type) {
    case "ARM_DRAG":
      return hn(e, t, n);
    case "START_DRAG":
      return In(e, t);
    case "MOVE_DRAG":
      return vn(e, t, n);
    case "STOP_DRAG":
      return Rn(e, t);
    case "START_RESIZE":
      return Dn(e, t);
    case "MOVE_RESIZE":
      return wn(e, t);
    case "STOP_RESIZE":
      return Sn(e, t);
    case "ENTER_DROP":
      return xn(e, t);
    case "MOVE_DROP":
      return bn(e, t);
    case "LEAVE_DROP":
      return Mt(e, t, t.reason || "drop-left");
    case "REJECT_DROP":
      return Mt(e, t, t.reason || "drop-rejected");
    case "COMMIT_DROP":
      return En(e, t);
    case "APPLY_RESULT":
      return zn(e, t);
    case "CANCEL":
      return Cn(e, t);
    default:
      return Te(e, t, "unsupported");
  }
}
function In(e, t) {
  if (e.status !== "idle") return Te(e, t, "already-active");
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
  return ge(e, n, t, [
    {
      type: "EMIT_DRAG_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      grid: t.grid,
      context: t.context
    }
  ]);
}
function hn(e, t, n) {
  if (e.status !== "idle") return Te(e, t, "already-active");
  if (jt(
    n.dragActivationDistance,
    t.pointerKind
  ) <= 0) {
    const s = { kind: "single", id: t.itemId };
    return ge(e, {
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
  return ge(e, {
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
function vn(e, t, n) {
  if (e.status === "pending-drag") {
    if (e.interactionId !== t.interactionId) return Ge(e, t);
    const l = jt(
      n.dragActivationDistance,
      e.pointerKind
    );
    if (!yn(e.originPx, t.currentPx, l))
      return ge(e, {
        ...e,
        revision: e.revision + 1,
        currentPx: t.currentPx,
        lastGrid: t.grid
      }, t, []);
    const o = t.context || { kind: "single", id: e.itemId }, m = o.kind !== "blocked" && !at(e.originGrid, t.grid), A = {
      status: "active-drag",
      revision: e.revision + 1,
      interactionId: e.interactionId,
      itemId: e.itemId,
      context: o,
      startGrid: e.originGrid,
      lastGrid: t.grid,
      moved: m,
      previewSeq: m ? 1 : 0
    }, J = [
      {
        type: "EMIT_DRAG_START",
        interactionId: e.interactionId,
        itemId: e.itemId,
        grid: e.originGrid,
        context: o
      }
    ];
    return m && J.push({
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
    }), ge(e, A, t, J);
  }
  if (e.status !== "active-drag") return Te(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return Ge(e, t);
  if (e.context.kind === "blocked")
    return ge(e, {
      ...e,
      revision: e.revision + 1,
      lastGrid: t.grid
    }, t, []);
  if (at(e.lastGrid, t.grid))
    return ge(e, { ...e, revision: e.revision + 1 }, t, []);
  const r = e.previewSeq + 1, s = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    moved: !0,
    previewSeq: r
  };
  return ge(e, s, t, [
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
function Rn(e, t) {
  if (e.status === "pending-drag")
    return e.interactionId !== t.interactionId ? Ge(e, t) : ge(e, je(e), t, [
      {
        type: "CLEAR_TRANSIENT",
        interactionId: t.interactionId,
        kind: "drag",
        reason: "click-like"
      }
    ]);
  if (e.status !== "active-drag") return Te(e, t, "not-armed");
  if (e.interactionId !== t.interactionId) return Ge(e, t);
  if (!e.moved)
    return ge(e, je(e), t, [
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
  return ge(e, {
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
function Dn(e, t) {
  if (e.status !== "idle") return Te(e, t, "already-active");
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
  return ge(e, n, t, [
    {
      type: "EMIT_RESIZE_START",
      interactionId: t.interactionId,
      itemId: t.itemId,
      handle: t.handle,
      geometry: t.geometry
    }
  ]);
}
function wn(e, t) {
  if (e.status !== "active-resize") return Te(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ge(e, t);
  if ($t(e.last, t.geometry))
    return ge(e, { ...e, revision: e.revision + 1 }, t, []);
  const n = e.previewSeq + 1, r = {
    ...e,
    revision: e.revision + 1,
    last: t.geometry,
    resized: !0,
    previewSeq: n
  };
  return ge(e, r, t, [
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
function Sn(e, t) {
  if (e.status !== "active-resize") return Te(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ge(e, t);
  if (!e.resized && $t(e.start, t.geometry))
    return ge(e, je(e), t, [
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
  return ge(e, {
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
function xn(e, t) {
  if (e.status !== "idle") return Te(e, t, "already-active");
  const n = t.strategy || "cursor", r = {
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
    requestId: Be(t.interactionId, "drop-preview", 1),
    itemId: t.itemId,
    grid: t.grid,
    size: t.size,
    strategy: n
  }] : [];
  return ge(e, r, t, s);
}
function bn(e, t) {
  if (e.status !== "active-drop") return Te(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ge(e, t);
  const n = t.strategy || e.strategy || "cursor";
  if (e.lastGrid && e.lastSize && at(e.lastGrid, t.grid) && Yt(e.lastSize, t.size) && e.strategy === n)
    return ge(e, { ...e, revision: e.revision + 1 }, t, []);
  const r = e.previewSeq + 1, s = {
    ...e,
    revision: e.revision + 1,
    lastGrid: t.grid,
    lastSize: t.size,
    strategy: n,
    previewSeq: r
  };
  return ge(e, s, t, [
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
function Mt(e, t, n) {
  return e.status !== "active-drop" ? Te(e, t, "wrong-kind") : e.interactionId !== t.interactionId ? Ge(e, t) : ge(e, je(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId,
      kind: "drop",
      reason: n
    }
  ]);
}
function En(e, t) {
  if (e.status !== "active-drop") return Te(e, t, "wrong-kind");
  if (e.interactionId !== t.interactionId) return Ge(e, t);
  const n = Be(e.interactionId, "drop-commit", e.previewSeq + 1);
  return ge(e, {
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
function zn(e, t) {
  if (e.status !== "committing") return Te(e, t, "not-committing");
  if (e.interactionId !== t.interactionId || e.requestId !== t.requestId)
    return Ge(e, t);
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
  ), ge(e, je(e), t, n);
}
function Cn(e, t) {
  return e.status === "idle" ? ge(e, e, t, []) : t.interactionId && ot(e) !== t.interactionId ? Ge(e, t) : ge(e, je(e), t, [
    {
      type: "CLEAR_TRANSIENT",
      interactionId: t.interactionId || ot(e),
      kind: vt(e),
      reason: t.reason || "cancelled"
    }
  ], "cancelled");
}
function Te(e, t, n) {
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
      Rt(e, e, t, n)
    ]
  };
}
function Ge(e, t) {
  const n = "interactionId" in t ? t.interactionId : ot(e), r = "requestId" in t ? t.requestId : void 0;
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
      Rt(e, e, t, "stale-event")
    ]
  };
}
function ge(e, t, n, r, s) {
  return {
    state: t,
    effects: r,
    diagnostics: [
      Rt(e, t, n, s)
    ]
  };
}
function je(e) {
  return {
    status: "idle",
    revision: e.revision + 1
  };
}
function Rt(e, t, n, r) {
  return {
    interactionId: "interactionId" in n ? n.interactionId : ot(e),
    requestId: "requestId" in n ? n.requestId : void 0,
    from: e.status,
    to: t.status,
    event: n.type,
    kind: vt(t) || vt(e),
    itemId: Ot(t) || Ot(e),
    reason: r
  };
}
function ot(e) {
  return e.status === "idle" ? void 0 : e.interactionId;
}
function Ot(e) {
  if (!(e.status === "idle" || e.status === "committing"))
    return e.itemId;
}
function vt(e) {
  if (e.status === "pending-drag" || e.status === "active-drag") return "drag";
  if (e.status === "active-resize") return "resize";
  if (e.status === "active-drop") return "drop";
  if (e.status === "committing") return e.kind;
}
function Be(e, t, n) {
  return `${e}:${t}:${n}`;
}
function at(e, t) {
  return e.x === t.x && e.y === t.y;
}
function Yt(e, t) {
  return e.w === t.w && e.h === t.h;
}
function $t(e, t) {
  return at(e, t) && Yt(e, t);
}
const ut = (e, t, n, r) => ht(e, t.top, t.left, n, r), Pn = (e) => {
  const t = e.pointerType;
  return t ? mn(t) : "touches" in e || "changedTouches" in e ? "touch" : "mouse";
};
function Ln({
  attrs: e,
  elementRef: t,
  positionParams: n,
  props: r,
  state: s
}) {
  let l = 0, o = rt(), m = null;
  const A = () => !!(e.onDragStart || e.onDrag || e.onDragStop), J = () => {
    o = rt(), m = null;
  }, g = (H, { node: I }, R = !1) => {
    var N;
    if (!A()) return;
    const c = Xe(
      n.value,
      r.x,
      r.y,
      r.w,
      r.h,
      s
    ), d = { top: c.top, left: c.left }, { x: D, y: a } = ut(
      n.value,
      d,
      r.w,
      r.h
    ), v = `item-drag:${r.i}:${++l}`, L = R ? 0 : r.dragActivationDistance, x = nt(o, {
      type: "ARM_DRAG",
      interactionId: v,
      itemId: r.i,
      pointerKind: Pn(H),
      originPx: { x: d.left, y: d.top },
      originGrid: { x: D, y: a }
    }, { dragActivationDistance: L });
    o = x.state, m = {
      interactionId: v,
      originGrid: { x: D, y: a },
      originPosition: d,
      currentPosition: d,
      node: I,
      e: H
    }, x.effects.some((fe) => fe.type === "EMIT_DRAG_START") && (s.dragging = d, (N = e.onDragStart) == null || N.call(e, r.i, D, a, {
      e: H,
      node: I,
      newPosition: d
    }));
  }, f = (H, I) => {
    let { top: R, left: c } = I;
    const { isBounded: d, w: D, h: a, containerWidth: v } = r;
    if (!d) return I;
    const { offsetParent: L } = H;
    if (!L) return I;
    const { margin: x, rowHeight: B } = r, N = L.clientHeight - Ct(
      a,
      B,
      x[1],
      n.value.renderPrecision
    );
    R = it(R, 0, N);
    const fe = Vt(n.value), h = v - Ct(D, fe, x[0], n.value.renderPrecision);
    return c = it(c, 0, h), { top: R, left: c };
  }, u = (H, { node: I, deltaX: R, deltaY: c }) => {
    var x, B;
    if (!A()) return;
    if (!m && !s.dragging)
      throw new Error("onDrag called before onDragStart.");
    const d = s.dragging || (m == null ? void 0 : m.currentPosition);
    if (!d) return;
    const D = f(I, {
      top: d.top + c,
      left: d.left + R
    });
    m && (m.currentPosition = D, m.node = I, m.e = H);
    const { x: a, y: v } = ut(
      n.value,
      D,
      r.w,
      r.h
    );
    if (!m) return;
    const L = nt(o, {
      type: "MOVE_DRAG",
      interactionId: m.interactionId,
      currentPx: { x: D.left, y: D.top },
      grid: { x: a, y: v }
    }, { dragActivationDistance: r.dragActivationDistance });
    o = L.state;
    for (const N of L.effects)
      N.type === "EMIT_DRAG_START" && (s.dragging = m.originPosition, (x = e.onDragStart) == null || x.call(e, r.i, m.originGrid.x, m.originGrid.y, {
        e: m.e,
        node: m.node,
        newPosition: m.originPosition
      })), N.type === "EMIT_DRAG" && (s.dragging = D, (B = e.onDrag) == null || B.call(e, r.i, a, v, {
        e: H,
        node: I,
        newPosition: D
      }));
    L.state.status === "active-drag" && (s.dragging = D);
  };
  return {
    moveDroppingItem: (H) => {
      const { droppingPosition: I } = r;
      if (!I) return;
      const R = t.value;
      if (!R) return;
      const c = H || { left: 0, top: 0 }, { dragging: d } = s, D = d && I.left !== c.left || I.top !== c.top;
      if (!d)
        g(I.e, {
          node: R,
          deltaX: I.left,
          deltaY: I.top
        }, !0);
      else if (D) {
        const a = I.left - d.left, v = I.top - d.top;
        u(I.e, {
          node: R,
          deltaX: a,
          deltaY: v
        });
      }
    },
    onDrag: u,
    onDragStart: g,
    onDragStop: (H, { node: I }) => {
      var L;
      if (!A()) return;
      if (!m && !s.dragging)
        throw new Error("onDragEnd called before onDragStart.");
      const R = s.dragging || (m == null ? void 0 : m.currentPosition);
      if (!R) return;
      const c = {
        top: R.top,
        left: R.left
      }, { x: d, y: D } = ut(
        n.value,
        c,
        r.w,
        r.h
      ), a = o.status === "active-drag", v = m == null ? void 0 : m.interactionId;
      v && (o = nt(o, {
        type: "STOP_DRAG",
        interactionId: v,
        grid: { x: d, y: D }
      }, { dragActivationDistance: r.dragActivationDistance }).state), s.dragging = null, a && ((L = e.onDragStop) == null || L.call(e, r.i, d, D, {
        e: H,
        node: I,
        newPosition: c
      })), J();
    }
  };
}
function Tn({
  attrs: e,
  positionParams: t,
  props: n,
  state: r
}) {
  const s = ct(() => {
    const { cols: g, minW: f, minH: u, maxW: p, maxH: M } = n, H = t.value, I = Xe(H, 0, 0, g, 0).width, R = Xe(H, 0, 0, f, u), c = Xe(H, 0, 0, p, M);
    return {
      minConstraints: [R.width, R.height],
      maxConstraints: [
        Math.min(c.width, I),
        Math.min(c.height, 1 / 0)
      ]
    };
  }), l = (g, { node: f, size: u, handle: p }, M, H) => {
    const I = e[H];
    if (!I) return;
    const { x: R, y: c, i: d, maxH: D, minH: a, maxW: v, minW: L, containerWidth: x } = n;
    let B = u;
    f && (B = Qt(
      p,
      M,
      u,
      x
    ), r.resizing = H === "onResizeStop" ? null : B);
    let { w: N, h: fe } = ln(
      t.value,
      B.width,
      B.height,
      R,
      c,
      p
    );
    N = it(N, Math.max(L, 1), v), fe = it(fe, a, D), I.call(void 0, d, N, fe, { e: g, node: f, size: B, handle: p });
  };
  return {
    curryResizeHandler: (g, f) => (u, p) => f(u, p, g),
    onResize: (g, f, u) => l(g, f, u, "onResize"),
    onResizeStart: (g, f, u) => l(g, f, u, "onResizeStart"),
    onResizeStop: (g, f, u) => l(g, f, u, "onResizeStop"),
    resizeConstraints: s
  };
}
function An(e, {
  containerWidth: t,
  useCSSTransforms: n,
  usePercentages: r
}) {
  if (n)
    return en(e);
  const s = tn(e);
  return r && (s.left = Et(e.left / t), s.width = Et(e.width / t)), s;
}
function kn({
  childClass: e,
  className: t,
  dropping: n,
  hasDragHandle: r,
  isDragBlocked: s,
  isDraggable: l,
  isDragging: o,
  isResizeBlocked: m,
  isResizing: A,
  isStatic: J,
  useCSSTransforms: g
}) {
  return mt(
    "vue-grid-item",
    e,
    t,
    {
      static: J,
      resizing: A,
      "vue-draggable": l,
      "has-drag-handle": r,
      "drag-blocked": s,
      "resize-blocked": m,
      "vue-draggable-dragging": o,
      dropping: n,
      cssTransforms: g
    }
  );
}
function Mn(e, t, n) {
  return {
    ...e || {},
    ...t && typeof t == "object" ? t : {},
    ...n
  };
}
function On(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Bt(e);
}
const _n = "GridItem", _t = /* @__PURE__ */ Ht({
  name: _n,
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
    resizeHandles: pn,
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
    const r = n, s = Nt({
      resizing: null,
      dragging: null,
      className: ""
    }), l = Me(null), o = ct(() => ({
      cols: e.cols,
      containerPadding: e.containerPadding,
      containerWidth: e.containerWidth,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      renderPrecision: e.renderPrecision
    })), m = Ln({
      attrs: r,
      elementRef: l,
      positionParams: o,
      props: e,
      state: s
    }), A = Tn({
      attrs: r,
      positionParams: o,
      props: e,
      state: s
    }), J = (f, u, p) => Fe(cn, {
      disabled: !u,
      startFn: m.onDragStart,
      dragFn: m.onDrag,
      stopFn: m.onDragStop,
      handle: e.handle,
      cancel: `.vue-resizable-handle${e.cancel ? `,${e.cancel}` : ""}`,
      scale: e.transformScale,
      nodeRef: l,
      enableClickSuppression: !0
    }, {
      default: () => [Fe("div", Wt({
        ref: l
      }, p), [f])]
    });
    Ue(() => e.droppingPosition, (f, u) => {
      m.moveDroppingItem(u);
    });
    const g = (f, u, p) => {
      let M;
      const {
        transformScale: H,
        resizeHandles: I,
        resizeHandle: R
      } = e, {
        minConstraints: c,
        maxConstraints: d
      } = A.resizeConstraints.value;
      return Fe(sn, {
        draggableOpts: {
          disabled: !p
        },
        className: p ? void 0 : "vue-resizable-hide",
        width: u.width,
        height: u.height,
        minConstraints: c,
        maxConstraints: d,
        fnResizeStop: A.curryResizeHandler(u, A.onResizeStop),
        fnResizeStart: A.curryResizeHandler(u, A.onResizeStart),
        fnResize: A.curryResizeHandler(u, A.onResize),
        transformScale: H,
        resizeHandles: I,
        handle: R
      }, On(M = Ve(f, {
        style: {
          height: "100%"
        }
      })) ? M : {
        default: () => [M]
      });
    };
    return qt(() => {
      m.moveDroppingItem();
    }), () => {
      var v, L;
      const {
        x: f,
        y: u,
        w: p,
        isDraggable: M,
        isResizable: H,
        droppingPosition: I,
        useCSSTransforms: R
      } = e, c = Xe(o.value, f, u, p, e.h, s), d = t.default ? t.default()[0] : null;
      if (!d) return null;
      const D = {
        class: kn({
          childClass: (v = d.props) == null ? void 0 : v.class,
          className: e.class,
          dropping: !!I,
          hasDragHandle: !!e.handle,
          isDragBlocked: e.isDragBlocked,
          isDraggable: M,
          isDragging: !!s.dragging,
          isResizeBlocked: e.isResizeBlocked,
          isResizing: !!s.resizing,
          isStatic: e.static,
          useCSSTransforms: R
        }),
        onClick: e.onItemClick,
        style: Mn(e.style, (L = d.props) == null ? void 0 : L.style, An(c, {
          containerWidth: e.containerWidth,
          useCSSTransforms: R,
          usePercentages: e.usePercentages
        }))
      };
      let a = g(d, c, H);
      return a = J(a, M, D), a;
    };
  }
}), Gn = [
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
], Hn = {
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
function Nn(e) {
  const t = {};
  let n, r;
  return Object.keys(e).forEach((s) => {
    const l = e[s];
    if (s === "class") {
      n = l;
      return;
    }
    if (s === "style") {
      r = l;
      return;
    }
    /^on[A-Z]/.test(s) || (t[s] = l);
  }), {
    attrs: t,
    class: n,
    style: r
  };
}
function Xt(e, t) {
  return e ? Array.isArray(e) ? e.flatMap((n) => Xt(n, t)) : typeof e == "function" ? [e(...t)] : [] : [];
}
function qn(e, t, n) {
  const r = (e == null ? void 0 : e.vnode.props) || {}, s = Hn[t] || [];
  let l;
  return s.forEach((o) => {
    Xt(r[o], n).forEach((A) => {
      if (A === !1) {
        l = !1;
        return;
      }
      l !== !1 && A != null && (l = A);
    });
  }), l;
}
function Wn(e, t) {
  const n = (r) => (s, l, o, m, A, J) => {
    e(r, s, l, o, m, A, J);
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
    emitDrop(r, s, l) {
      e("drop", r, s, l);
    },
    emitHeightRuntimeChange(r) {
      e("heightRuntimeChange", r);
    },
    callDropDragOver(r) {
      const s = qn(t, "dropDragOver", [r]);
      if (s === !1) return !1;
      if (s && typeof s == "object")
        return s;
    }
  };
}
function Bn({
  props: e,
  slots: t,
  emitModelValue: n,
  emitLayoutChange: r
}) {
  const s = t.default ? yt(Ve(pt, null, t.default())) : [], l = Nt({
    activeDrag: null,
    layout: G(
      zt(
        e.modelValue,
        s,
        e.cols,
        Ce(e),
        e.allowOverlap,
        (g) => {
          n(g), r(g);
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
  let o = qe(e.modelValue || []);
  const m = (g, f) => {
    f || (f = l.layout), lt(f, g) || (r(g), n(g));
  };
  Ue(
    () => l.layout,
    (g, f) => {
      if (l.suppressLayoutChange) {
        l.suppressLayoutChange = !1;
        return;
      }
      if (l.activeDrag || l.droppingDOMNode || l.droppingPosition) return;
      const u = l.oldLayout;
      if (u) {
        l.oldLayout = null, m(g, u);
        return;
      }
      m(g, f);
    }
  );
  const A = ct(() => {
    const g = t.default ? t.default() : [], f = yt({ type: pt, children: g }), u = f.map((p) => {
      var H;
      const M = (H = p.props) == null ? void 0 : H["data-grid"];
      return {
        key: p.key,
        grid: M ? {
          w: M.w,
          h: M.h,
          x: M.x,
          y: M.y
        } : null
      };
    });
    return {
      children: G(f),
      props: {
        compactType: e.compactType,
        modelValue: e.modelValue,
        verticalCompact: e.verticalCompact,
        cols: e.cols,
        allowOverlap: e.allowOverlap
      },
      signature: u
    };
  });
  return {
    state: l,
    onLayoutMaybeChanged: m,
    watchLayoutDependencies: (g = {}) => Ue(
      A,
      ({ children: f, props: u }, { children: p, props: M }) => {
        var a, v;
        const H = nn(f, p), I = !lt(u.modelValue, o), R = lt(u.modelValue, l.layout), c = u.compactType === M.compactType && u.cols === M.cols && u.allowOverlap === M.allowOverlap && u.verticalCompact === M.verticalCompact;
        if (H && !I && c || (o = qe(u.modelValue || []), H && R && c))
          return;
        const d = zt(
          u.modelValue,
          f,
          u.cols,
          Ce(u),
          u.allowOverlap
        ), D = (a = g.reconcileSynchronizedLayout) == null ? void 0 : a.call(g, d);
        D != null && D.clearActive ? (l.activeDrag = null, (v = g.clearActiveInteraction) == null || v.call(g)) : D && "placeholder" in D && (l.activeDrag = D.placeholder ? G(D.placeholder) : null), m(d, l.layout), l.layout = G(d), l.compactType = u.compactType;
      },
      { deep: !0 }
    ),
    stop: () => {
    }
  };
}
function Fn({
  props: e,
  getLayout: t
}) {
  const n = () => e.layoutEngine && typeof e.layoutEngine == "object" ? e.layoutEngine : null, r = () => {
    const a = n();
    return e.layoutEngine === !1 || (a == null ? void 0 : a.mode) === "legacy";
  };
  let s, l = Pt();
  const o = () => {
    var L;
    const a = n(), v = a == null ? void 0 : a.executor;
    return v !== s && ((L = l.dispose) == null || L.call(l), l = Pt(v), s = v), l;
  };
  let m, A = Tt();
  const J = () => {
    const a = n(), v = a == null ? void 0 : a.scheduler;
    return v !== m && (A.cancel("scheduler reconfigured"), A = Tt(v), m = v), A;
  }, g = () => {
    const a = n();
    return {
      cols: e.cols,
      maxRows: e.maxRows,
      compactType: Ce(e),
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
  let f = Lt(
    t(),
    g()
  );
  const u = (a = t()) => {
    f.dispose(), f = Lt(a, g());
  }, p = (a, v) => {
    var x, B, N;
    if (!g().compareLegacy || a.phase === "preview" && ((x = v.diagnostics) == null ? void 0 : x.schedulerMode) === "commitOnly") return;
    const L = gn(a, v);
    L.matches || (N = (B = g()).onEvent) == null || N.call(B, {
      type: "legacy-mismatch",
      id: a.id,
      message: "VueGridLayout layout engine result differs from legacy path",
      diagnostics: v.diagnostics,
      details: L.differences
    });
  }, M = (a, v, L) => {
    var x, B, N;
    !L || ((x = v.diagnostics) == null ? void 0 : x.executorKind) !== "worker" || (N = (B = g()).onEvent) == null || N.call(B, {
      type: "operation",
      id: v.id,
      operationType: a.operation.type,
      phase: a.phase,
      diagnostics: v.diagnostics
    });
  }, H = (a) => o().kind === "main-thread" || a.phase === "preview" && (a.operation.type === "move" || a.operation.type === "resize" || a.operation.type === "groupMove") ? !1 : a.phase === "commit" || !!a.heavy || a.operation.type === "dropFit" || a.operation.type === "generateResponsiveLayout" || a.operation.type === "groupMove", I = (a) => H(a) ? o().execute(a) : dn(a), R = (a, v) => {
    let L = null;
    const x = H(a);
    return J().schedule(
      a,
      I,
      (B) => {
        var fe;
        const N = f.applyAsyncResult(B);
        J().recordDuration(((fe = N.diagnostics) == null ? void 0 : fe.durationMs) || 0), M(a, N, x), p(a, N), v(N), L = N;
      }
    ), L;
  };
  return {
    getLayoutEngineProp: n,
    getLayoutEngineOptions: g,
    isLegacyLayoutEngine: r,
    reset: u,
    start: (a) => f.start(a),
    rebase: (a) => f.rebase(a),
    getCommitted: () => f.getCommitted(),
    preview: (a, v, L, x = !1) => {
      var N;
      const B = {
        id: a,
        operation: v,
        baseRevision: (N = f.getState().interaction) == null ? void 0 : N.startRevision,
        heavy: x
      };
      return R(f.preparePreview(B), L);
    },
    commit: (a, v, L, x = !1) => {
      var N;
      const B = {
        id: a,
        operation: v,
        baseRevision: (N = f.getState().interaction) == null ? void 0 : N.startRevision,
        heavy: x
      };
      return R(f.prepareCommit(B), L);
    },
    dispose: (a = "component disposed") => {
      var v;
      A.cancel(a), (v = l.dispose) == null || v.call(l), f.dispose();
    }
  };
}
function Vn({
  getLayout: e,
  setLayout: t,
  setActiveDrag: n
}) {
  const r = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let s = null, l = null;
  const o = () => {
    l != null && r && cancelAnimationFrame(l), l = null, s = null;
  }, m = (g) => {
    for (let f = 0; f < g.length; f++) {
      const u = g[f];
      u.moved && (u.moved = !1);
    }
  }, A = () => {
    l = null;
    const g = s;
    if (s = null, !g) return;
    g.layout && g.layout !== e() && t(g.layout), g.shouldCompact && rn(e(), g.compactType, g.cols);
    const f = e(), u = De(f, g.placeholder.i);
    n(G(
      u ? {
        ...g.placeholder,
        w: u.w,
        h: u.h,
        x: u.x,
        y: u.y
      } : g.placeholder
    ));
  };
  return {
    cancel: o,
    flush: A,
    schedule: (g) => {
      if (s = g, !r) {
        A();
        return;
      }
      l == null && (l = requestAnimationFrame(A));
    },
    resetMovedFlags: m
  };
}
const dt = {
  margin: 48,
  speed: 20
};
function Zn({
  getConfig: e,
  rootClassName: t
}) {
  const n = typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function";
  let r = null, s = null, l = null, o = null;
  const m = () => {
    const I = e();
    if (!I) return null;
    if (I === !0) return dt;
    if (typeof I != "object") return null;
    const R = typeof I.margin == "number" && Number.isFinite(I.margin) ? I.margin : dt.margin, c = typeof I.speed == "number" && Number.isFinite(I.speed) ? I.speed : dt.speed;
    return R <= 0 || c <= 0 ? null : { margin: R, speed: c };
  }, A = () => {
    l != null && n && cancelAnimationFrame(l), l = null, o = null;
  }, J = () => {
    A(), s = null, r = null;
  }, g = (I) => {
    var d, D;
    const R = I;
    if (typeof R.clientX == "number" && typeof R.clientY == "number")
      return { x: R.clientX, y: R.clientY };
    const c = ((d = R.touches) == null ? void 0 : d[0]) || ((D = R.changedTouches) == null ? void 0 : D[0]);
    return c ? { x: c.clientX, y: c.clientY } : null;
  }, f = (I) => {
    const R = I.ownerDocument, c = R == null ? void 0 : R.defaultView;
    if (!c) return I;
    let d = I;
    for (; d; ) {
      const D = c.getComputedStyle(d), a = D.overflowY, v = D.overflowX, L = (a === "auto" || a === "scroll") && d.scrollHeight > d.clientHeight + 1, x = (v === "auto" || v === "scroll") && d.scrollWidth > d.clientWidth + 1;
      if (L || x) return d;
      d = d.parentElement;
    }
    return c;
  }, u = (I) => {
    var d;
    if (r = m(), s = null, A(), !r) return;
    const R = (d = I.closest) == null ? void 0 : d.call(I, `.${t}`), c = R instanceof HTMLElement ? R : I;
    s = f(c);
  }, p = () => {
    l = null;
    const I = o;
    if (o = null, !I) return;
    const { container: R, dx: c, dy: d } = I;
    c === 0 && d === 0 || (R instanceof HTMLElement ? typeof R.scrollBy == "function" ? R.scrollBy({ left: c, top: d }) : (R.scrollLeft += c, R.scrollTop += d) : R.scrollBy({ left: c, top: d }));
  }, M = (I, R, c) => {
    if (o = { container: I, dx: R, dy: c }, !n) {
      p();
      return;
    }
    l == null && (l = requestAnimationFrame(p));
  };
  return {
    init: u,
    maybeScroll: (I, R) => {
      r || (r = m());
      const c = r;
      if (!c) return;
      const d = g(I);
      if (!d) return;
      s || u(R);
      const D = s;
      if (!D) return;
      const a = (x) => {
        const B = Math.min(1, Math.max(0, x / c.margin));
        return B <= 0 ? 0 : Math.ceil(B * c.speed);
      };
      let v = 0, L = 0;
      if (D instanceof HTMLElement) {
        const x = D.getBoundingClientRect(), B = x.top + c.margin, N = x.bottom - c.margin, fe = x.left + c.margin, h = x.right - c.margin;
        d.y < B ? L = -a(B - d.y) : d.y > N && (L = a(d.y - N)), d.x < fe ? v = -a(fe - d.x) : d.x > h && (v = a(d.x - h)), L < 0 && D.scrollTop <= 0 && (L = 0), L > 0 && D.scrollTop + D.clientHeight >= D.scrollHeight && (L = 0), v < 0 && D.scrollLeft <= 0 && (v = 0), v > 0 && D.scrollLeft + D.clientWidth >= D.scrollWidth && (v = 0);
      } else {
        const x = D, B = c.margin, N = x.innerHeight - c.margin, fe = c.margin, h = x.innerWidth - c.margin;
        d.y < B ? L = -a(B - d.y) : d.y > N && (L = a(d.y - N)), d.x < fe ? v = -a(fe - d.x) : d.x > h && (v = a(d.x - h));
      }
      if (v === 0 && L === 0) {
        A();
        return;
      }
      M(D, v, L);
    },
    reset: J
  };
}
function Dt({
  getDragActivationDistance: e,
  onEffects: t,
  onDiagnostics: n
} = {}) {
  const r = bt(rt()), s = bt([]), l = (f) => ({
    dragActivationDistance: f && "dragActivationDistance" in f ? f.dragActivationDistance : e == null ? void 0 : e()
  }), o = (f, u) => {
    const p = nt(r.value, f, l(u));
    return r.value = p.state, p.diagnostics.length > 0 && (s.value = s.value.concat(p.diagnostics), n == null || n(p.diagnostics)), p.effects.length > 0 && (t == null || t(p.effects, p)), p;
  };
  return {
    snapshot: r,
    diagnostics: s,
    dispatch: o,
    reset: (f = "reset") => {
      r.value.status !== "idle" && o({
        type: "CANCEL",
        interactionId: r.value.interactionId,
        reason: f
      }), r.value = rt();
    },
    isCurrentRequest: (f, u) => r.value.status === "committing" && r.value.interactionId === f && r.value.requestId === u,
    isCurrentPreviewRequest: (f, u) => jn(r.value) === u && r.value.status !== "idle" && r.value.status !== "committing" && r.value.interactionId === f,
    isCurrentInteraction: (f, u) => {
      const p = r.value;
      return p.status === "idle" || p.interactionId !== f ? !1 : u ? p.status === "pending-drag" || p.status === "active-drag" ? u === "drag" : p.status === "active-resize" ? u === "resize" : p.status === "active-drop" ? u === "drop" : p.kind === u : !0;
    }
  };
}
function jn(e) {
  return e.status === "active-drag" ? `${e.interactionId}:drag-preview:${e.previewSeq}` : e.status === "active-resize" ? `${e.interactionId}:resize-preview:${e.previewSeq}` : e.status === "active-drop" ? `${e.interactionId}:drop-preview:${e.previewSeq}` : null;
}
const Gt = 200;
function Yn({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: r,
  frameUpdate: s,
  autoScroll: l,
  editor: o,
  interactionMachine: m,
  nextInteractionRequestId: A,
  syncHistory: J,
  onLayoutMaybeChanged: g
}) {
  const f = Me(!1), u = Me(!1), p = Me(null), M = Me(null), H = Me(null), I = Me([]), R = Me(null);
  let c = null, d = !1, D = null, a = null, v;
  const L = () => r.getLayoutEngineProp(), x = () => r.isLegacyLayoutEngine(), B = (i) => r.reset(i), N = (...i) => r.preview(...i), fe = (...i) => r.commit(...i), h = m || Dt({
    getDragActivationDistance: () => e.dragActivationDistance
  }), te = (i, E, b, O) => {
    let k = i.x, S = i.y, y = E, z = b;
    const F = O === "sw" || O === "w" || O === "nw", X = O === "ne" || O === "n" || O === "nw";
    return F && (k = i.x + (i.w - y), k < 0 && (k = 0, y = i.w)), X && (S = i.y + (i.h - z), S < 0 && (S = 0, z = i.h)), { ...i, x: k, y: S, w: y, h: z };
  }, T = () => {
    var i, E, b;
    return t.layout.length >= (((b = (E = (i = L()) == null ? void 0 : i.scheduler) == null ? void 0 : E.auto) == null ? void 0 : b.workerMinItems) || 1e3);
  }, K = () => {
    const i = e.width, E = e.containerPadding || e.margin;
    if (typeof i != "number" || !Number.isFinite(i) || i <= 0 || e.cols <= 0 || e.rowHeight <= 0)
      return;
    const b = Vt({
      containerWidth: i,
      cols: e.cols,
      margin: e.margin,
      containerPadding: E,
      rowHeight: e.rowHeight,
      maxRows: e.maxRows,
      renderPrecision: e.renderPrecision || void 0
    });
    if (!(!Number.isFinite(b) || b <= 0))
      return {
        colWidth: b,
        rowHeight: e.rowHeight,
        margin: [e.margin[0], e.margin[1]],
        containerPadding: [E[0], E[1]],
        renderPrecision: e.renderPrecision || "integer"
      };
  }, Q = () => {
    H.value = null, I.value = [], R.value = null;
  }, j = (i, E, b) => {
    f.value = !0, H.value = i, I.value = E.slice(), R.value = b || null;
  }, se = (i, E, b, O = !1) => {
    if (i.status === "blocked" && i.blocked) {
      const k = i.blocked.reason, S = i.blocked.itemIds.length > 0 ? i.blocked.itemIds : E, y = `Pointer move blocked by ${k}.`;
      j(k, S, y), O && o.notifyMoveBlocked({
        reason: k,
        ids: S,
        activeId: b,
        message: y,
        operationResult: i
      });
      return;
    }
    f.value = !1, Q();
  }, ie = () => {
    p.value = null, M.value = null, f.value = !1, u.value = !1, Q(), c = null, d = !1, D = null, a = null, v = void 0, h.reset("clear-active-interaction");
  }, Ie = () => {
    t.activeDrag = null, t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), o.clearGuides(), h.reset("finish-drag-interaction");
  }, Oe = (i, E) => i.x === E.x && i.y === E.y && i.w === E.w && i.h === E.h, $ = (i, E) => i.find((b) => b.type === E), Y = (i) => i.kind === "group" ? {
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
  }, we = () => {
    t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, M.value = null, u.value = !1, a = null, l.reset(), o.clearGuides(), t.oldLayout = null, h.reset("resize-cleanup"), v = void 0;
  };
  return {
    activeDragId: p,
    activeResizeId: M,
    dragBlocked: f,
    dragBlockedReason: H,
    dragBlockedItemIds: I,
    dragBlockedMessage: R,
    resizeBlocked: u,
    clearActiveInteraction: ie,
    onResizeStart: (i, E, b, { e: O, node: k, handle: S }) => {
      s.cancel();
      const { layout: y } = t, z = De(y, i);
      if (!z) return;
      const F = S || "se", X = A("resize-interaction", i), q = h.dispatch({
        type: "START_RESIZE",
        interactionId: X,
        itemId: i,
        handle: F,
        geometry: { x: z.x, y: z.y, w: z.w, h: z.h }
      });
      $(q.effects, "EMIT_RESIZE_START") && (a = X, v = void 0, J(y, "replace"), M.value = i, u.value = !1, o.resetSnap(), l.init(k), t.oldResizeItem = st(z), t.oldLayout = qe(y), t.resizing = !0, x() || (B(y), r.start({
        id: A("resize-start", i),
        type: "resize",
        itemId: i
      })), n.emitResizeStart(y, z, z, void 0, O, k));
    },
    onResize: (i, E, b, { e: O, node: k, handle: S }) => {
      var _e;
      const { oldResizeItem: y } = t, { cols: z, preventCollision: F, allowOverlap: X } = e, q = S, pe = De(t.layout, i);
      if (!pe) return;
      const ve = te(pe, E, b, q);
      if (Oe(pe, ve))
        return;
      if (!x()) {
        const me = t.layout, he = De(me, i);
        if (!he) return;
        l.maybeScroll(O, k);
        const We = o.snapCandidate(
          i,
          he,
          te(he, E, b, q),
          me,
          q
        ), le = (_e = o.resolveResizeIntent) == null ? void 0 : _e.call(o, {
          id: i,
          item: he,
          layout: me,
          handle: q,
          rawCandidate: We,
          metrics: K(),
          phase: "preview"
        });
        if ((le == null ? void 0 : le.kind) === "blocked") {
          u.value = !0, t.activeDrag = G({
            w: he.w,
            h: he.h,
            x: he.x,
            y: he.y,
            static: !0,
            i
          }), o.updateIntelligence(i, he, he, q);
          return;
        }
        const ye = (le == null ? void 0 : le.kind) === "allowed" ? le.candidate : We;
        v = (le == null ? void 0 : le.kind) === "allowed" ? le.constraint : v;
        let Ne;
        if (a) {
          const Pe = h.dispatch({
            type: "MOVE_RESIZE",
            interactionId: a,
            geometry: {
              x: ye.x,
              y: ye.y,
              w: ye.w,
              h: ye.h
            }
          });
          if (Ne = $(Pe.effects, "PREVIEW_RESIZE"), !Ne) return;
        }
        if (!Ne) return;
        N(
          Ne.requestId,
          {
            type: "resize",
            id: i,
            w: ye.w,
            h: ye.h,
            x: ye.x,
            y: ye.y,
            handle: q,
            constraint: v
          },
          (Pe) => {
            if (Pe.status === "stale" || !h.isCurrentPreviewRequest(Ne.interactionId, Ne.requestId) || M.value !== i) return;
            const Le = Pe.status === "changed" || Pe.status === "fallback" ? Pe.layout : r.getCommitted(), ke = De(Le, i) || he, Ze = Pe.placeholder || {
              w: ke.w,
              h: ke.h,
              x: ke.x,
              y: ke.y,
              static: !0,
              i
            };
            M.value === i && (u.value = Pe.status === "blocked"), n.emitResize(Le, y, ke, Ze, O, k), (Pe.status === "changed" || Pe.status === "fallback") && (t.layout = G(Le)), t.activeDrag = G(Ze), o.updateIntelligence(i, he, Ze, q);
          },
          T()
        );
        return;
      }
      const oe = t.layout.length >= Gt;
      if (l.maybeScroll(O, k), !oe) {
        const { layout: me } = t;
        let he = !1, We, le, ye, Ne = !1;
        const [Pe, Le] = It(me, i, (ue) => {
          le = ue.x, ye = ue.y;
          const St = S === "sw" || S === "w" || S === "nw", xt = S === "ne" || S === "n" || S === "nw";
          (St || xt) && (St && (le = ue.x + (ue.w - E), E = ue.x !== le && le < 0 ? ue.w : E, le = le < 0 ? 0 : le), xt && (ye = ue.y + (ue.h - b), b = ue.y !== ye && ye < 0 ? ue.h : b, ye = ye < 0 ? 0 : ye), he = !0);
          const Ke = o.snapCandidate(
            i,
            ue,
            { ...ue, x: le, y: ye, w: E, h: b },
            me,
            S
          );
          return le = Ke.x, ye = Ke.y, E = Ke.w, b = Ke.h, he = he || le !== ue.x || ye !== ue.y, F && !X && (Ne = tt(me, { ...ue, w: E, h: b, x: le, y: ye }).length > 0, Ne && (ye = ue.y, b = ue.h, le = ue.x, E = ue.w, he = !1)), ue.w = E, ue.h = b, ue;
        });
        if (!Le) return;
        M.value === i && (u.value = Ne), We = Pe, he && (We = Qe(
          Pe,
          Le,
          Ce(e),
          z,
          X,
          le,
          ye,
          !0,
          e.preventCollision
        ));
        const ke = {
          w: Le.w,
          h: Le.h,
          x: Le.x,
          y: Le.y,
          static: !0,
          i
        };
        if (a) {
          const ue = h.dispatch({
            type: "MOVE_RESIZE",
            interactionId: a,
            geometry: { x: ke.x, y: ke.y, w: ke.w, h: ke.h }
          });
          if (!$(ue.effects, "PREVIEW_RESIZE")) return;
        }
        n.emitResize(We, y, Le, ke, O, k);
        const Ze = X ? We : $e(We, Ce(e), z), Je = De(Ze, i) || Le, wt = {
          ...ke,
          w: Je.w,
          h: Je.h,
          x: Je.x,
          y: Je.y
        };
        t.layout = G(Ze), t.activeDrag = G(wt), o.updateIntelligence(i, Le, wt, S);
        return;
      }
      const de = t.layout, w = De(de, i);
      if (!w) return;
      const ze = w.x, Ee = w.y, Re = w.w, P = w.h;
      let _ = !1, C = w.x, W = w.y, ne = !1;
      const U = S === "sw" || S === "w" || S === "nw", ce = S === "ne" || S === "n" || S === "nw";
      (U || ce) && (U && (C = w.x + (w.w - E), E = w.x !== C && C < 0 ? w.w : E, C = C < 0 ? 0 : C), ce && (W = w.y + (w.h - b), b = w.y !== W && W < 0 ? w.h : b, W = W < 0 ? 0 : W), _ = !0);
      const ae = o.snapCandidate(
        i,
        w,
        { ...w, x: C, y: W, w: E, h: b },
        de,
        S
      );
      C = ae.x, W = ae.y, E = ae.w, b = ae.h, _ = _ || C !== w.x || W !== w.y, F && !X && (ne = tt(de, { ...w, w: E, h: b, x: C, y: W }).length > 0, ne && (C = w.x, W = w.y, E = w.w, b = w.h, _ = !1)), M.value === i && (u.value = ne), w.w = E, w.h = b;
      let ee = de;
      _ && (ee = Qe(
        de,
        w,
        Ce(e),
        z,
        X,
        C,
        W,
        !0,
        e.preventCollision
      ));
      const Z = {
        w: w.w,
        h: w.h,
        x: w.x,
        y: w.y,
        static: !0,
        i
      };
      if (a) {
        const me = h.dispatch({
          type: "MOVE_RESIZE",
          interactionId: a,
          geometry: { x: Z.x, y: Z.y, w: Z.w, h: Z.h }
        });
        if (!$(me.effects, "PREVIEW_RESIZE")) return;
      }
      n.emitResize(ee, y, w, Z, O, k), (w.x !== ze || w.y !== Ee || w.w !== Re || w.h !== P || X && ee !== t.layout) && (X || s.resetMovedFlags(de), s.schedule({
        cols: z,
        compactType: Ce(e),
        layout: X && ee !== t.layout ? ee : void 0,
        placeholder: Z,
        shouldCompact: !X
      }), o.updateIntelligence(i, w, Z, S));
    },
    onResizeStop: (i, E, b, { e: O, node: k, handle: S }) => {
      var Ee;
      s.cancel();
      const { layout: y, oldResizeItem: z, oldLayout: F } = t, { cols: X, allowOverlap: q } = e, pe = De(y, i);
      if (!pe) return;
      const ve = S, oe = t.activeDrag || te(pe, E, b, ve);
      let de;
      if (a) {
        const Re = h.dispatch({
          type: "STOP_RESIZE",
          interactionId: a,
          geometry: {
            x: oe.x,
            y: oe.y,
            w: oe.w,
            h: oe.h
          }
        });
        if (de = $(Re.effects, "COMMIT_RESIZE"), !de) {
          ($(Re.effects, "EMIT_RESIZE_STOP") || !a) && n.emitResizeStop(y, z, pe, void 0, O, k), we();
          return;
        }
      }
      if (!de) {
        n.emitResizeStop(y, z, pe, void 0, O, k), we();
        return;
      }
      if (!x()) {
        let Re = oe;
        const P = r.getCommitted(), _ = (Ee = o.resolveResizeIntent) == null ? void 0 : Ee.call(o, {
          id: i,
          item: pe,
          layout: y,
          handle: ve,
          rawCandidate: Re,
          metrics: K(),
          phase: "commit"
        });
        if ((_ == null ? void 0 : _.kind) === "blocked") {
          u.value = !0, n.emitResizeStop(y, z, pe, void 0, O, k), we();
          return;
        }
        (_ == null ? void 0 : _.kind) === "allowed" && (Re = _.candidate, v = _.constraint || v), fe(
          de.requestId,
          {
            type: "resize",
            id: i,
            w: Re.w,
            h: Re.h,
            x: Re.x,
            y: Re.y,
            handle: S,
            constraint: v
          },
          (C) => {
            (async () => {
              var ae, ee;
              if (C.status === "stale" || !h.isCurrentRequest(de.interactionId, de.requestId)) return;
              let W = [];
              if (a) {
                const Z = C.status === "cancelled" ? "error" : C.status;
                W = h.dispatch({
                  type: "APPLY_RESULT",
                  interactionId: a,
                  requestId: de.requestId,
                  status: Z
                }).effects;
              }
              const ne = C.status === "changed" || C.status === "fallback" ? C.layout : r.getCommitted(), U = De(ne, i) || pe, ce = C.status === "changed" || C.status === "fallback" ? (t.suppressLayoutChange = !0, await ((ae = o.commitResize) == null ? void 0 : ae.call(o, {
                id: i,
                beforeLayout: F || P || y,
                afterLayout: ne,
                handle: ve
              }))) : null;
              if (ce && ce.status !== "changed" && ce.status !== "noop") {
                const Z = F || P || y;
                t.suppressLayoutChange = !0, t.layout = G(Z), (ee = o.rollbackInteraction) == null || ee.call(o, Z, ce.status), t.activeDrag = null, t.oldResizeItem = null, t.resizing = !1, M.value = null, u.value = !1, a = null, v = void 0, l.reset(), t.oldLayout = null;
                return;
              }
              $(W, "EMIT_RESIZE_STOP") && n.emitResizeStop(ne, z, U, void 0, O, k), t.activeDrag = null, t.layout = G(ne), t.oldResizeItem = null, t.resizing = !1, M.value = null, u.value = !1, a = null, v = void 0, l.reset(), o.clearGuides(), t.oldLayout = null, g(ne, F || P || y, "push");
            })();
          },
          T()
        );
        return;
      }
      const w = q ? y : $e(y, Ce(e), X);
      let ze = [];
      a && de && (ze = h.dispatch({
        type: "APPLY_RESULT",
        interactionId: a,
        requestId: de.requestId,
        status: "changed"
      }).effects), (async () => {
        var P, _;
        const Re = (t.suppressLayoutChange = !0, await ((P = o.commitResize) == null ? void 0 : P.call(o, {
          id: i,
          beforeLayout: F || y,
          afterLayout: w,
          handle: ve
        })));
        if (Re && Re.status !== "changed" && Re.status !== "noop") {
          const C = F || y;
          t.suppressLayoutChange = !0, t.layout = G(C), (_ = o.rollbackInteraction) == null || _.call(o, C, Re.status), we();
          return;
        }
        $(ze, "EMIT_RESIZE_STOP") && n.emitResizeStop(w, z, pe, void 0, O, k), t.activeDrag = null, t.layout = G(w), t.oldResizeItem = null, t.resizing = !1, M.value = null, u.value = !1, a = null, v = void 0, l.reset(), o.clearGuides(), t.oldLayout = null, g(w, F || y, "push");
      })();
    },
    onDragStart: (i, E, b, { e: O, node: k }) => {
      s.cancel();
      const { layout: S } = t, y = De(S, i);
      if (!y) return;
      const z = o.resolveMoveDrag({
        id: i,
        item: y,
        layout: S,
        legacyLayoutEngine: x(),
        event: O
      });
      if (z.kind === "blocked") {
        c = {
          kind: "blocked",
          reason: z.reason,
          ids: z.ids,
          activeId: z.activeId
        };
        const pe = A("drag-interaction", i), ve = h.dispatch({
          type: "START_DRAG",
          interactionId: pe,
          itemId: i,
          grid: { x: E, y: b },
          context: Y(c)
        });
        if (!$(ve.effects, "EMIT_DRAG_START")) {
          c = null;
          return;
        }
        return D = pe, p.value = z.activeId || i, j(
          z.reason,
          z.ids,
          `Pointer move blocked by ${z.reason}.`
        ), t.oldDragItem = st(y), t.oldLayout = qe(S), t.activeDrag = G({ w: y.w, h: y.h, x: y.x, y: y.y, placeholder: !0, i }), d = !1, o.notifyMoveBlocked({
          ...z,
          message: `Pointer move blocked by ${z.reason}.`
        }), n.emitDragStart(S, y, y, void 0, O, k);
      }
      const F = { w: y.w, h: y.h, x: y.x, y: y.y, placeholder: !0, i };
      c = z.kind === "group" ? {
        kind: "group",
        activeId: z.activeId,
        ids: z.ids,
        startX: y.x,
        startY: y.y
      } : {
        kind: "single",
        id: z.id,
        startX: y.x,
        startY: y.y
      };
      const X = A("drag-interaction", i), q = h.dispatch({
        type: "START_DRAG",
        interactionId: X,
        itemId: i,
        grid: { x: E, y: b },
        context: Y(c)
      });
      if (!$(q.effects, "EMIT_DRAG_START")) {
        c = null;
        return;
      }
      return D = X, J(S, "replace"), p.value = c.kind === "group" ? c.activeId : i, f.value = !1, Q(), o.resetSnap(), o.clearGuides(), d = !1, l.init(k), t.oldDragItem = st(y), t.oldLayout = qe(S), t.activeDrag = G(F), x() || (B(S), r.start({
        id: D,
        type: "drag",
        itemId: p.value || i
      })), n.emitDragStart(S, y, y, void 0, O, k);
    },
    onDrag: (i, E, b, { e: O, node: k }) => {
      const { oldDragItem: S } = t;
      let { layout: y } = t;
      const { cols: z, allowOverlap: F, preventCollision: X } = e, q = De(y, i);
      if (!q) return;
      if (l.maybeScroll(O, k), (c == null ? void 0 : c.kind) === "blocked") {
        f.value = !0;
        return;
      }
      if (!D) return;
      if ((c == null ? void 0 : c.kind) === "group" && !x()) {
        const P = c, _ = De(y, P.activeId) || q, C = o.snapCandidate(
          P.activeId,
          _,
          { ..._, x: E, y: b },
          y
        ), W = h.dispatch({
          type: "MOVE_DRAG",
          interactionId: D,
          currentPx: { x: C.x, y: C.y },
          grid: { x: C.x, y: C.y }
        }), ne = $(W.effects, "PREVIEW_DRAG");
        if (!ne) {
          d || o.clearGuides();
          return;
        }
        d = !0;
        const U = C.x - P.startX, ce = C.y - P.startY;
        N(
          ne.requestId,
          {
            type: "groupMove",
            ids: P.ids,
            activeId: P.activeId,
            dx: U,
            dy: ce,
            userAction: !0
          },
          (ae) => {
            if (ae.status === "stale" || !h.isCurrentPreviewRequest(ne.interactionId, ne.requestId) || c !== P || p.value !== P.activeId) return;
            const ee = ae.status === "changed" || ae.status === "fallback" ? ae.layout : r.getCommitted(), Z = De(ee, P.activeId) || _, Ae = ae.placeholder || {
              w: Z.w,
              h: Z.h,
              x: Z.x,
              y: Z.y,
              placeholder: !0,
              i: P.activeId
            };
            p.value === P.activeId && se(ae, P.ids, P.activeId), n.emitDrag(ee, S, Z, Ae, O, k), (ae.status === "changed" || ae.status === "fallback") && (t.layout = G(ee)), t.activeDrag = G(Ae), o.updateIntelligence(P.activeId, _, Ae);
          },
          T()
        );
        return;
      }
      if (!x()) {
        const P = o.snapCandidate(i, q, { ...q, x: E, y: b }, y), _ = h.dispatch({
          type: "MOVE_DRAG",
          interactionId: D,
          currentPx: { x: P.x, y: P.y },
          grid: { x: P.x, y: P.y }
        }), C = $(_.effects, "PREVIEW_DRAG");
        if (!C) {
          d || o.clearGuides();
          return;
        }
        d = !0, N(
          C.requestId,
          { type: "move", id: i, x: P.x, y: P.y, userAction: !0 },
          (W) => {
            if (W.status === "stale" || !h.isCurrentPreviewRequest(C.interactionId, C.requestId) || (c == null ? void 0 : c.kind) !== "single" || c.id !== i || p.value !== i) return;
            const ne = W.status === "changed" || W.status === "fallback" ? W.layout : r.getCommitted(), U = De(ne, i) || q, ce = W.placeholder || {
              w: U.w,
              h: U.h,
              x: U.x,
              y: U.y,
              placeholder: !0,
              i
            };
            p.value === i && se(W, [i], i), n.emitDrag(ne, S, U, ce, O, k), (W.status === "changed" || W.status === "fallback") && (t.layout = G(ne)), t.activeDrag = G(ce), o.updateIntelligence(i, q, ce);
          },
          T()
        );
        return;
      }
      const pe = t.layout.length >= Gt, ve = q.x, oe = q.y;
      if (p.value === i) {
        const P = X && !F ? tt(y, { ...q, x: E, y: b }) : [];
        P.length > 0 ? j(
          "collision",
          P.map((_) => _.i),
          "Pointer move blocked by collision."
        ) : (f.value = !1, Q());
      }
      const de = !0, w = o.snapCandidate(i, q, { ...q, x: E, y: b }, y), ze = h.dispatch({
        type: "MOVE_DRAG",
        interactionId: D,
        currentPx: { x: w.x, y: w.y },
        grid: { x: w.x, y: w.y }
      });
      if (!$(ze.effects, "PREVIEW_DRAG")) {
        d || o.clearGuides();
        return;
      }
      d = !0, y = Qe(
        y,
        q,
        Ce(e),
        z,
        F,
        w.x,
        w.y,
        de,
        X
      );
      const Ee = { w: q.w, h: q.h, x: q.x, y: q.y, placeholder: !0, i };
      if (n.emitDrag(y, S, q, Ee, O, k), !!(q.x !== ve || q.y !== oe || F && y !== t.layout)) {
        if (!pe) {
          const P = F ? y : $e(y, Ce(e), z), _ = De(P, i) || q, C = {
            w: _.w,
            h: _.h,
            x: _.x,
            y: _.y,
            placeholder: !0,
            i
          };
          t.layout = G(P), t.activeDrag = G(C), o.updateIntelligence(i, q, C);
          return;
        }
        F || s.resetMovedFlags(t.layout), s.schedule({
          cols: z,
          compactType: Ce(e),
          layout: F && y !== t.layout ? y : void 0,
          placeholder: Ee,
          shouldCompact: !F
        }), o.updateIntelligence(i, q, Ee);
      }
    },
    onDragStop: (i, E, b, { e: O, node: k }) => {
      if (s.cancel(), !t.activeDrag) return;
      const { oldDragItem: S, oldLayout: y } = t, z = t.layout;
      let F = z;
      const { cols: X, preventCollision: q, allowOverlap: pe } = e, ve = De(F, i);
      if (!ve) return;
      let oe, de = [];
      if (D) {
        const P = h.dispatch({
          type: "STOP_DRAG",
          interactionId: D,
          grid: { x: E, y: b }
        });
        de = P.effects, oe = $(P.effects, "COMMIT_DRAG");
      }
      if (!oe) {
        ($(de, "EMIT_DRAG_STOP") || !D) && n.emitDragStop(z, S, ve, void 0, O, k), Ie(), t.oldLayout = null;
        return;
      }
      if ((c == null ? void 0 : c.kind) === "group" && !x()) {
        const P = c, _ = t.activeDrag || { x: E, y: b }, C = _.x - P.startX, W = _.y - P.startY, ne = r.getCommitted();
        fe(
          oe.requestId,
          {
            type: "groupMove",
            ids: P.ids,
            activeId: P.activeId,
            dx: C,
            dy: W,
            userAction: !0
          },
          (U) => {
            (async () => {
              var Ae, _e;
              if (U.status === "stale" || !h.isCurrentRequest(oe.interactionId, oe.requestId)) return;
              U.status === "blocked" && se(U, P.ids, P.activeId, !0);
              const ce = h.dispatch({
                type: "APPLY_RESULT",
                interactionId: oe.interactionId,
                requestId: oe.requestId,
                status: U.status === "cancelled" ? "error" : U.status
              }).effects, ae = U.status === "changed" || U.status === "fallback" ? U.layout : r.getCommitted(), ee = De(ae, P.activeId) || ve, Z = U.status === "changed" || U.status === "fallback" ? (t.suppressLayoutChange = !0, await ((Ae = o.commitMove) == null ? void 0 : Ae.call(o, {
                ids: P.ids,
                activeId: P.activeId,
                beforeLayout: y || ne || z,
                afterLayout: ae,
                source: "pointer"
              }))) : null;
              if (Z && Z.status !== "changed" && Z.status !== "noop") {
                const me = y || ne || z;
                t.suppressLayoutChange = !0, t.layout = G(me), (_e = o.rollbackInteraction) == null || _e.call(o, me, Z.status), t.activeDrag = null, t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), t.oldLayout = null;
                return;
              }
              $(ce, "EMIT_DRAG_STOP") && n.emitDragStop(ae, S, ee, void 0, O, k), t.activeDrag = null, t.layout = G(ae), t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), o.clearGuides(), t.oldLayout = null, g(ae, y || ne || z, "push");
            })();
          },
          T()
        );
        return;
      }
      if (!x()) {
        const P = t.activeDrag || { x: E, y: b }, _ = r.getCommitted();
        fe(
          oe.requestId,
          { type: "move", id: i, x: P.x, y: P.y, userAction: !0 },
          (C) => {
            (async () => {
              var ae, ee;
              if (C.status === "stale" || !h.isCurrentRequest(oe.interactionId, oe.requestId)) return;
              C.status === "blocked" && se(C, [i], i, !0);
              const W = h.dispatch({
                type: "APPLY_RESULT",
                interactionId: oe.interactionId,
                requestId: oe.requestId,
                status: C.status === "cancelled" ? "error" : C.status
              }).effects, ne = C.status === "changed" || C.status === "fallback" ? C.layout : r.getCommitted(), U = De(ne, i) || ve, ce = C.status === "changed" || C.status === "fallback" ? (t.suppressLayoutChange = !0, await ((ae = o.commitMove) == null ? void 0 : ae.call(o, {
                ids: [i],
                activeId: i,
                beforeLayout: y || _ || z,
                afterLayout: ne,
                source: "pointer"
              }))) : null;
              if (ce && ce.status !== "changed" && ce.status !== "noop") {
                const Z = y || _ || z;
                t.suppressLayoutChange = !0, t.layout = G(Z), (ee = o.rollbackInteraction) == null || ee.call(o, Z, ce.status), t.activeDrag = null, t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), t.oldLayout = null;
                return;
              }
              $(W, "EMIT_DRAG_STOP") && n.emitDragStop(ne, S, U, void 0, O, k), t.activeDrag = null, t.layout = G(ne), t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), o.clearGuides(), t.oldLayout = null, g(ne, y || _ || z, "push");
            })();
          },
          T()
        );
        return;
      }
      const w = !0, ze = t.activeDrag || { x: E, y: b };
      F = Qe(
        F,
        ve,
        Ce(e),
        X,
        pe,
        ze.x,
        ze.y,
        w,
        q
      );
      const Ee = pe ? F : $e(F, Ce(e), X), Re = h.dispatch({
        type: "APPLY_RESULT",
        interactionId: oe.interactionId,
        requestId: oe.requestId,
        status: "changed"
      }).effects;
      (async () => {
        var _, C;
        const P = (t.suppressLayoutChange = !0, await ((_ = o.commitMove) == null ? void 0 : _.call(o, {
          ids: [i],
          activeId: i,
          beforeLayout: y || z,
          afterLayout: Ee,
          source: "pointer"
        })));
        if (P && P.status !== "changed" && P.status !== "noop") {
          const W = y || z;
          t.suppressLayoutChange = !0, t.layout = G(W), (C = o.rollbackInteraction) == null || C.call(o, W, P.status), t.activeDrag = null, t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), t.oldLayout = null;
          return;
        }
        $(Re, "EMIT_DRAG_STOP") && n.emitDragStop(Ee, S, ve, void 0, O, k), t.activeDrag = null, t.layout = G(Ee), t.oldDragItem = null, p.value = null, f.value = !1, Q(), c = null, d = !1, D = null, l.reset(), o.clearGuides(), t.oldLayout = null, g(Ee, y || z, "push");
      })();
    }
  };
}
function $n({
  props: e,
  state: t,
  eventBridge: n,
  engineBridge: r,
  frameUpdate: s,
  autoScroll: l,
  editor: o,
  isFirefox: m,
  layoutClassName: A,
  interactionMachine: J,
  nextInteractionRequestId: g
}) {
  const f = Me(0);
  let u = null;
  const p = J || Dt({
    getDragActivationDistance: () => e.dragActivationDistance
  }), M = () => r.getLayoutEngineProp(), H = () => r.isLegacyLayoutEngine(), I = (h = t.layout) => r.reset(h), R = (...h) => r.preview(...h), c = (...h) => r.commit(...h), d = (h, te) => h.find((T) => T.type === te), D = (h) => {
    if (!u) {
      const te = g("drop-interaction", h), T = p.dispatch({
        type: "ENTER_DROP",
        interactionId: te,
        itemId: h
      });
      if (d(T.effects, "REJECT_TRANSITION")) return null;
      u = te;
    }
    return u;
  }, a = (h, te, T, K) => {
    const Q = D(h);
    if (!Q) return null;
    const j = p.dispatch({
      type: "MOVE_DROP",
      interactionId: Q,
      grid: te,
      size: T,
      strategy: K
    });
    return d(j.effects, "PREVIEW_DROP") || null;
  }, v = (h) => {
    p.reset(h), u = null;
  }, L = (h = "drop-cleanup", te = !1) => {
    s.cancel();
    const { droppingItem: T, cols: K } = e, { layout: Q } = t, j = $e(
      Q.filter((se) => se.i !== T.i),
      Ce(e),
      K,
      e.allowOverlap
    );
    t.suppressLayoutChange = !0, te || (t.layout = G(j)), t.droppingDOMNode = null, t.activeDrag = null, t.droppingPosition = void 0, l.reset(), o.clearGuides(), v(h);
  };
  return {
    clearDropInteraction: () => v("clear-active-interaction"),
    removeDroppingPlaceholder: L,
    onDrop: (h) => {
      var Y, we, He;
      h.preventDefault(), h.stopPropagation();
      const { droppingItem: te, cols: T, maxRows: K, dropStrategy: Q } = e, { layout: j } = t;
      let se = j.find((V) => V.i === te.i);
      if (!H()) {
        const V = String(te.i), re = D(V);
        if (!re) return;
        const Se = p.dispatch({
          type: "COMMIT_DROP",
          interactionId: re
        }), xe = d(Se.effects, "COMMIT_DROP");
        if (!xe) {
          L("drop-commit-rejected");
          return;
        }
        const be = qe(j.filter((b) => b.i !== V)), i = se || t.activeDrag || null, E = i ? { x: i.x, y: i.y } : void 0;
        I(be), r.start({
          id: g("drop-commit-start", V),
          type: "drop",
          itemId: V
        }), c(
          xe.requestId,
          {
            type: "dropFit",
            item: {
              i: V,
              w: te.w,
              h: te.h
            },
            strategy: Q === "auto" ? "auto" : "cursor",
            target: E
          },
          (b) => {
            (async () => {
              var F, X;
              if (b.status === "stale" || !p.isCurrentRequest(xe.interactionId, xe.requestId)) return;
              const O = b.status === "cancelled" ? "error" : b.status;
              p.dispatch({
                type: "APPLY_RESULT",
                interactionId: re,
                requestId: xe.requestId,
                status: O
              });
              const k = b.placeholder || i || void 0;
              let S;
              k && (S = { ...k }, delete S.isDraggable, delete S.isResizable);
              const y = b.status === "changed" || b.status === "fallback" ? b.layout : be, z = b.status === "changed" || b.status === "fallback" ? (t.suppressLayoutChange = !0, await ((F = o.commitDrop) == null ? void 0 : F.call(o, {
                id: V,
                beforeLayout: be,
                afterLayout: y,
                item: S,
                event: h
              }))) : null;
              if (z && z.status !== "changed" && z.status !== "noop") {
                t.suppressLayoutChange = !0, t.layout = G(be), (X = o.rollbackInteraction) == null || X.call(o, be, z.status), f.value = 0, L(z.status);
                return;
              }
              f.value = 0, n.emitDrop(
                y.filter((q) => q.i !== V),
                h,
                S
              ), L("drop-cleanup", !!z);
            })();
          },
          be.length >= (((He = (we = (Y = M()) == null ? void 0 : Y.scheduler) == null ? void 0 : we.auto) == null ? void 0 : He.workerMinItems) || 1e3)
        );
        return;
      }
      if (!se && Q === "auto") {
        const V = an(
          j.filter((re) => re.i !== te.i),
          { w: te.w, h: te.h },
          T,
          K
        );
        V && (se = {
          ...te,
          x: V.x,
          y: V.y,
          static: !1
        });
      }
      let ie;
      if (se && (ie = { ...se }, delete ie.isDraggable, delete ie.isResizable, Q === "cursor")) {
        const V = tt(
          j.filter((re) => re.i !== te.i),
          ie
        );
        V.length > 0 && (ie.x = Math.min(...V.map((re) => re.x)), ie.y = Math.max(...V.map((re) => re.y + re.h)));
      }
      const Ie = D(String(te.i));
      if (!Ie) return;
      const Oe = p.dispatch({
        type: "COMMIT_DROP",
        interactionId: Ie
      }), $ = d(Oe.effects, "COMMIT_DROP");
      $ && p.dispatch({
        type: "APPLY_RESULT",
        interactionId: Ie,
        requestId: $.requestId,
        status: ie ? "changed" : "noop"
      }), (async () => {
        var be, i;
        const V = String(te.i), re = qe(j.filter((E) => E.i !== V)), Se = ie ? [...re, ie] : re, xe = ie ? (t.suppressLayoutChange = !0, await ((be = o.commitDrop) == null ? void 0 : be.call(o, {
          id: V,
          beforeLayout: re,
          afterLayout: Se,
          item: ie,
          event: h
        }))) : null;
        if (xe && xe.status !== "changed" && xe.status !== "noop") {
          t.suppressLayoutChange = !0, t.layout = G(re), (i = o.rollbackInteraction) == null || i.call(o, re, xe.status), f.value = 0, L(xe.status);
          return;
        }
        f.value = 0, n.emitDrop(re, h, ie), L("drop-cleanup", !!xe);
      })();
    },
    onDragEnter: (h) => {
      h.preventDefault(), h.stopPropagation(), f.value === 0 && D(String(e.droppingItem.i)), f.value++;
    },
    onDragLeave: (h) => {
      h.preventDefault(), h.stopPropagation(), f.value = Math.max(0, f.value - 1), f.value === 0 && (u && p.dispatch({
        type: "LEAVE_DROP",
        interactionId: u,
        reason: "drag-leave"
      }), L("drag-leave"));
    },
    onDragOver: (h) => {
      var z, F, X, q, pe, ve, oe, de;
      if (h.preventDefault(), h.stopPropagation(), m && !((F = (z = h.currentTarget) == null ? void 0 : z.classList) != null && F.contains(A)))
        return !1;
      const { droppingItem: te, margin: T, cols: K, rowHeight: Q, maxRows: j, width: se, containerPadding: ie, transformScale: Ie, dropStrategy: Oe } = e, $ = n.callDropDragOver(h);
      if ($ === !1)
        return u && p.dispatch({
          type: "REJECT_DROP",
          interactionId: u,
          reason: "drop-drag-over-rejected"
        }), t.droppingDOMNode ? L("drop-drag-over-rejected") : v("drop-drag-over-rejected"), !1;
      const Y = { ...te, ...$ || {} }, { layout: we } = t;
      if (Oe === "auto") {
        const w = h.currentTarget instanceof Element ? h.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, ze = (h.clientX - w.left) / Ie, Ee = (h.clientY - w.top) / Ie, P = ht({
          cols: K,
          margin: T,
          maxRows: j,
          rowHeight: Q,
          containerWidth: se || 0,
          containerPadding: ie || T
        }, Ee, ze, Y.w, Y.h), _ = qe(we.filter((ee) => ee.i !== Y.i));
        if (!H()) {
          const ee = String(Y.i), Z = {
            ...Y,
            i: ee,
            x: P.x,
            y: P.y,
            static: !1
          }, Ae = o.snapCandidate(
            ee,
            Z,
            Z,
            _
          ), _e = a(
            ee,
            { x: Ae.x, y: Ae.y },
            { w: Y.w, h: Y.h },
            "auto"
          );
          if (!_e) return;
          I(_), r.start({
            id: u || _e.interactionId,
            type: "drop",
            itemId: ee
          }), R(
            _e.requestId,
            {
              type: "dropFit",
              item: {
                i: ee,
                w: Y.w,
                h: Y.h
              },
              strategy: "cursor",
              target: { x: Ae.x, y: Ae.y }
            },
            (me) => {
              var he;
              if (me.status !== "stale" && p.isCurrentPreviewRequest(_e.interactionId, _e.requestId)) {
                if (!((he = me.drop) != null && he.position)) {
                  t.droppingDOMNode && L();
                  return;
                }
                t.droppingDOMNode || (t.droppingDOMNode = G(Ve("div", { key: Y.i }))), t.droppingPosition = void 0, t.suppressLayoutChange = !0, t.layout = G(me.layout), t.activeDrag = me.placeholder ? G(me.placeholder) : null, me.placeholder && o.updateIntelligence(String(Y.i), me.placeholder, me.placeholder);
              }
            },
            _.length >= (((pe = (q = (X = M()) == null ? void 0 : X.scheduler) == null ? void 0 : q.auto) == null ? void 0 : pe.workerMinItems) || 1e3)
          );
          return;
        }
        const C = on(_, { w: Y.w, h: Y.h }, K, P.x, P.y, j);
        if (!C) {
          t.droppingDOMNode && L();
          return;
        }
        t.droppingDOMNode || (t.droppingDOMNode = G(Ve("div", { key: Y.i }))), t.droppingPosition = void 0;
        const W = String(Y.i);
        if (!a(
          W,
          { x: C.x, y: C.y },
          { w: Y.w, h: Y.h },
          "auto"
        )) return;
        const U = De(we, W);
        if (!U) {
          const ee = {
            ...Y,
            x: C.x,
            y: C.y,
            static: !1,
            isDraggable: !1,
            isResizable: !1,
            i: W
          }, Z = o.snapCandidate(
            W,
            ee,
            ee,
            _
          );
          t.suppressLayoutChange = !0, t.layout = G([
            ..._,
            Z
          ]), t.activeDrag = G({ ...Z, placeholder: !0 }), o.updateIntelligence(W, Z, Z);
          return;
        }
        const ce = o.snapCandidate(
          W,
          U,
          {
            ...U,
            ...Y,
            x: C.x,
            y: C.y,
            static: !1,
            isDraggable: !1,
            isResizable: !1
          },
          _
        ), [ae] = It(we, W, (ee) => ({
          ...ee,
          ...Y,
          x: ce.x,
          y: ce.y,
          static: !1,
          isDraggable: !1,
          isResizable: !1
        }));
        t.suppressLayoutChange = !0, t.layout = G(ae), t.activeDrag = G({ ...ce, placeholder: !0 }), o.updateIntelligence(W, U, {
          ...U,
          ...Y,
          x: ce.x,
          y: ce.y
        });
        return;
      }
      const He = h.currentTarget instanceof Element ? h.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, V = (h.clientX - He.left) / Ie, re = (h.clientY - He.top) / Ie, Se = Y, be = ht({
        cols: K,
        margin: T,
        maxRows: j,
        rowHeight: Q,
        containerWidth: se || 0,
        containerPadding: ie || T
      }, re, V, Se.w, Se.h), i = String(Se.i), E = qe(we.filter((w) => w.i !== i)), b = {
        ...Se,
        i,
        x: be.x,
        y: be.y,
        static: !1,
        isDraggable: !1,
        isResizable: !1
      }, O = o.snapCandidate(
        i,
        b,
        b,
        E
      ), k = a(
        i,
        { x: O.x, y: O.y },
        { w: Se.w, h: Se.h },
        "cursor"
      );
      if (!k) return;
      if (!H()) {
        I(E), r.start({
          id: u || k.interactionId,
          type: "drop",
          itemId: i
        }), R(
          k.requestId,
          {
            type: "dropFit",
            item: {
              i,
              w: Se.w,
              h: Se.h
            },
            strategy: "cursor",
            target: { x: O.x, y: O.y }
          },
          (w) => {
            var ze;
            if (w.status !== "stale" && p.isCurrentPreviewRequest(k.interactionId, k.requestId)) {
              if (!((ze = w.drop) != null && ze.position)) {
                t.droppingDOMNode && L();
                return;
              }
              t.droppingDOMNode || (t.droppingDOMNode = G(Ve("div", { key: i }))), t.droppingPosition = void 0, t.suppressLayoutChange = !0, t.layout = G(w.layout), t.activeDrag = w.placeholder ? G(w.placeholder) : null, w.placeholder && o.updateIntelligence(i, w.placeholder, w.placeholder);
            }
          },
          E.length >= (((de = (oe = (ve = M()) == null ? void 0 : ve.scheduler) == null ? void 0 : oe.auto) == null ? void 0 : de.workerMinItems) || 1e3)
        );
        return;
      }
      t.droppingDOMNode || (t.droppingDOMNode = G(Ve("div", { key: i }))), t.droppingPosition = void 0;
      const S = De(we, i);
      if (!S) {
        const w = {
          ...O,
          i,
          static: !1,
          isDraggable: !1,
          isResizable: !1
        };
        t.suppressLayoutChange = !0, t.layout = G([
          ...E,
          w
        ]), t.activeDrag = G({ ...w, placeholder: !0 }), o.updateIntelligence(i, w, w);
        return;
      }
      const [y] = It(we, i, (w) => ({
        ...w,
        ...Se,
        x: O.x,
        y: O.y,
        static: !1,
        isDraggable: !1,
        isResizable: !1
      }));
      t.suppressLayoutChange = !0, t.layout = G(y), t.activeDrag = G({
        ...S,
        ...Se,
        x: O.x,
        y: O.y,
        placeholder: !0
      }), o.updateIntelligence(i, S, {
        ...S,
        ...Se,
        x: O.x,
        y: O.y
      });
    }
  };
}
function Xn(e) {
  const t = Dt({
    getDragActivationDistance: () => e.props.dragActivationDistance
  }), n = {
    ...e,
    interactionMachine: t
  }, r = Yn(n), s = $n(n);
  return {
    ...r,
    ...s,
    clearActiveInteraction: () => {
      r.clearActiveInteraction(), s.clearDropInteraction();
    }
  };
}
const Un = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, gt = (e, t = {}) => ({
  code: "measurement-unavailable",
  level: "warning",
  message: "Parent container height measurement was unavailable.",
  prop: "autoMeasureContainerHeight",
  details: {
    reason: e,
    ...t
  }
}), et = (e) => {
  const t = Number.parseFloat(e || "0");
  return Number.isFinite(t) ? t : 0;
}, Jn = (e) => {
  var s, l;
  const t = e.getBoundingClientRect(), n = ((s = e.ownerDocument) == null ? void 0 : s.defaultView) || (typeof window != "undefined" ? window : null), r = (l = n == null ? void 0 : n.getComputedStyle) == null ? void 0 : l.call(n, e);
  return r ? t.height - et(r.paddingTop) - et(r.paddingBottom) - et(r.borderTopWidth) - et(r.borderBottomWidth) : t.height;
};
function Kn({
  enabled: e,
  rootRef: t,
  onDiagnostics: n
}) {
  const r = Me(null), s = Me([]);
  let l = null, o = null, m = !1;
  const A = (p) => {
    s.value = p, n == null || n(p);
  }, J = () => {
    l == null || l.disconnect(), l = null, o = null;
  }, g = (p, M = "resize-observer") => {
    if (Un(p)) {
      r.value = p, A([]);
      return;
    }
    r.value = null, A([gt("invalid-height", { height: p, source: M })]);
  }, f = () => {
    var H;
    if (m) return;
    if (J(), !e()) {
      r.value = null, A([]);
      return;
    }
    const p = ((H = t.value) == null ? void 0 : H.parentElement) || null;
    if (!p) {
      r.value = null, A([gt("missing-parent")]);
      return;
    }
    const M = typeof ResizeObserver != "undefined" ? ResizeObserver : fn;
    if (!M) {
      r.value = null, A([gt("resize-observer-unavailable")]);
      return;
    }
    o = p, l = new M((I) => {
      var c;
      const R = I.find((d) => d.target === o) || I[0];
      g((c = R == null ? void 0 : R.contentRect) == null ? void 0 : c.height, "content-rect");
    }), l.observe(p), g(Jn(p), "initial-content-box");
  }, u = () => {
    m = !0, J(), r.value = null;
  };
  return Ue(
    () => {
      var p;
      return [e(), ((p = t.value) == null ? void 0 : p.parentElement) || null];
    },
    () => {
      Ut(f);
    },
    { immediate: !0 }
  ), Ft(u), {
    measuredContainerHeight: r,
    diagnostics: s,
    stop: u
  };
}
const Qn = (e, t) => {
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
}, ei = () => ({
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
}), ti = (e) => ({
  interactions: ei(),
  getItemRenderState: Qn,
  getRootClassNames: () => {
  },
  isExternalDropEnabled: (t) => t,
  renderOverlay: () => null
});
function ni(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Bt(e);
}
const ft = "vue-grid-layout", ii = typeof navigator != "undefined" && /firefox/i.test(navigator.userAgent), yi = ({
  name: e,
  props: t,
  createRuntimeExtension: n = ti
}) => /* @__PURE__ */ Ht({
  name: e,
  inheritAttrs: !1,
  props: t,
  emits: Gn,
  setup(r, {
    slots: s,
    attrs: l,
    emit: o
  }) {
    const m = r, A = Wn(o, Jt()), J = Bn({
      props: m,
      slots: s,
      emitModelValue: (T) => A.emitModelValue(T),
      emitLayoutChange: (T) => A.emitLayoutChange(T)
    }), {
      state: g,
      onLayoutMaybeChanged: f
    } = J, u = Me(null), p = Kn({
      enabled: () => m.autoMeasureContainerHeight === !0,
      rootRef: u
    }), M = ct(() => un({
      layout: g.layout,
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
    })), H = new Proxy(m, {
      get(T, K) {
        return K === "rowHeight" ? M.value.rowHeight : T[K];
      }
    }), I = Fn({
      props: m,
      getLayout: () => g.layout
    }), R = {
      current: null
    }, c = n({
      props: H,
      layoutRef: Kt(g, "layout"),
      engineBridge: I,
      getLayout: () => g.layout,
      getOldDragItem: () => g.oldDragItem,
      getOldResizeItem: () => g.oldResizeItem,
      isDropping: () => !!g.droppingDOMNode,
      getInteractionState: () => R.current ? {
        activeDragId: R.current.activeDragId.value,
        activeResizeId: R.current.activeResizeId.value,
        dragBlocked: R.current.dragBlocked.value,
        dragBlockedReason: R.current.dragBlockedReason.value,
        dragBlockedItemIds: R.current.dragBlockedItemIds.value,
        dragBlockedMessage: R.current.dragBlockedMessage.value,
        resizeBlocked: R.current.resizeBlocked.value
      } : null
    }), d = c.interactions;
    let D = 0;
    const a = (T, K) => `${T}:${K}:${++D}`, v = Vn({
      getLayout: () => g.layout,
      setLayout: (T) => {
        g.layout = G(T);
      },
      setActiveDrag: (T) => {
        g.activeDrag = G(T);
      }
    }), L = Zn({
      getConfig: () => m.autoScroll,
      rootClassName: ft
    }), x = Xn({
      props: H,
      state: g,
      eventBridge: A,
      engineBridge: I,
      frameUpdate: v,
      autoScroll: L,
      editor: d,
      isFirefox: ii,
      layoutClassName: ft,
      nextInteractionRequestId: a,
      syncHistory: c.syncHistory || Ye,
      onLayoutMaybeChanged: f
    });
    R.current = x, J.watchLayoutDependencies({
      reconcileSynchronizedLayout: (T) => {
        if (!I.isLegacyLayoutEngine() && (x.activeDragId.value || x.activeResizeId.value)) {
          const K = I.rebase(T);
          if (!K)
            return {
              clearActive: !0
            };
          if (K.placeholder)
            return {
              placeholder: K.placeholder
            };
        } else I.isLegacyLayoutEngine() || I.reset(T);
      },
      clearActiveInteraction: () => x.clearActiveInteraction()
    }), Ft(() => {
      var T;
      v.cancel(), L.reset(), I.dispose("component unmounted"), (T = c.stop) == null || T.call(c), p.stop();
    });
    let B = "";
    const N = () => {
      const T = M.value, K = JSON.stringify(T);
      K !== B && (B = K, A.emitHeightRuntimeChange(T));
    };
    Ue(M, () => {
      g.mounted && N();
    }, {
      deep: !0
    }), qt(() => {
      var T;
      g.mounted = !0, (T = c.mount) == null || T.call(c), N();
    });
    const fe = () => {
      const {
        activeDrag: T
      } = g;
      if (!T) return null;
      const {
        width: K = 0,
        cols: Q,
        margin: j,
        containerPadding: se,
        maxRows: ie,
        useCSSTransforms: Ie,
        transformScale: Oe
      } = m, $ = M.value;
      return Fe(_t, {
        w: T.w,
        h: T.h,
        x: T.x,
        y: T.y,
        i: T.i,
        class: mt("vue-grid-placeholder", {
          "placeholder-resizing": g.resizing,
          "placeholder-blocked": x.dragBlocked.value || x.resizeBlocked.value
        }),
        containerWidth: K,
        cols: Q,
        margin: j,
        containerPadding: se || j,
        maxRows: ie,
        rowHeight: $.rowHeight,
        dragActivationDistance: m.dragActivationDistance,
        renderPrecision: $.renderPrecision,
        isDraggable: !1,
        isResizable: !1,
        isBounded: !1,
        useCSSTransforms: Ie,
        transformScale: Oe
      }, {
        default: () => [Fe("div", null, null)]
      });
    }, h = /* @__PURE__ */ new Map(), te = (T, K, Q) => {
      if (!T || !T.key) return null;
      const j = K.get(String(T.key));
      if (!j) return null;
      const {
        width: se = 0,
        cols: ie,
        margin: Ie,
        containerPadding: Oe,
        maxRows: $,
        isDraggable: Y,
        isResizable: we,
        isBounded: He,
        useCSSTransforms: V,
        transformScale: re,
        draggableCancel: Se,
        draggableHandle: xe,
        resizeHandles: be,
        resizeHandle: i
      } = m, E = M.value, {
        mounted: b,
        droppingPosition: O
      } = g, k = c.getItemRenderState(j, {
        isDraggable: Y,
        isResizable: we,
        isBounded: He
      }, Q);
      if (!k.visible) return null;
      const S = k.previewItem || j, y = typeof k.resizeHandles != "undefined" ? k.resizeHandles : j.resizeHandles || be;
      return Fe(_t, {
        key: j.i,
        containerWidth: se,
        cols: ie,
        margin: Ie,
        containerPadding: Oe || Ie,
        maxRows: $,
        rowHeight: E.rowHeight,
        dragActivationDistance: m.dragActivationDistance,
        renderPrecision: E.renderPrecision,
        cancel: Se,
        handle: xe,
        onDragStop: x.onDragStop,
        onDragStart: x.onDragStart,
        onDrag: x.onDrag,
        onResizeStart: x.onResizeStart,
        onResize: x.onResize,
        onResizeStop: x.onResizeStop,
        isDraggable: k.draggable,
        isResizable: k.resizable,
        isBounded: k.bounded,
        isDragBlocked: x.dragBlocked.value && x.activeDragId.value === j.i,
        isResizeBlocked: x.resizeBlocked.value && x.activeResizeId.value === j.i,
        useCSSTransforms: V && b,
        usePercentages: !b,
        transformScale: re,
        w: S.w,
        h: S.h,
        x: S.x,
        y: S.y,
        i: S.i,
        minH: S.minH,
        minW: S.minW,
        maxH: S.maxH,
        maxW: S.maxW,
        static: S.static,
        class: k.className,
        onItemClick: k.onClick,
        droppingPosition: Q && m.dropStrategy !== "auto" ? O : void 0,
        resizeHandles: y,
        resizeHandle: i
      }, ni(T) ? T : {
        default: () => [T]
      });
    };
    return () => {
      const {
        class: T,
        style: K,
        isDroppable: Q,
        innerRef: j
      } = m, se = M.value, ie = Nn(l), Ie = c.isExternalDropEnabled(Q), Oe = mt(ft, ie.class, T, c.getRootClassNames()), $ = {
        ...ie.style && typeof ie.style == "object" && !Array.isArray(ie.style) ? ie.style : {},
        height: se.containerStyle.height,
        ...se.containerStyle.overflow ? {
          overflow: se.containerStyle.overflow
        } : {},
        ...K
      }, Y = s.default ? yt(Ve(pt, null, s.default())) : [];
      h.clear();
      for (let V = 0; V < g.layout.length; V++) {
        const re = g.layout[V];
        h.set(re.i, re);
      }
      const we = {
        width: m.width || 0,
        margin: m.margin,
        containerPadding: m.containerPadding || m.margin,
        rowHeight: se.rowHeight,
        renderPrecision: se.renderPrecision,
        cols: m.cols,
        maxRows: m.maxRows
      }, He = (V) => {
        u.value = V, j && typeof j == "object" && "value" in j && (j.value = V);
      };
      return Fe("div", Wt(ie.attrs, {
        ref: He,
        class: Oe,
        style: $,
        onMousemove: c.onRootPointerMove,
        onClick: c.onRootClick,
        onDrop: Ie ? x.onDrop : Ye,
        onDragleave: Ie ? x.onDragLeave : Ye,
        onDragenter: Ie ? x.onDragEnter : Ye,
        onDragover: Ie ? x.onDragOver : Ye
      }), [Y.map((V) => te(V, h)), Ie && g.droppingDOMNode && te(g.droppingDOMNode, h, !0), fe(), c.renderOverlay({
        geometry: we,
        itemMap: h,
        layout: g.layout
      })]);
    };
  }
});
export {
  mi as b,
  yi as c,
  Kn as u
};
