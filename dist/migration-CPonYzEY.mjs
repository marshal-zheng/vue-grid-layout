import { n as Me, m as Se, k as et, b as Te, l as tt, e as je, a as J, d as j } from "./utils-BCVYGne6.mjs";
const De = ["s", "w", "e", "n", "sw", "nw", "se", "ne"], ze = /* @__PURE__ */ new Set(["nw", "ne", "sw", "se"]), Ge = /* @__PURE__ */ new Set(["n", "s", "e", "w"]), We = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), it = /* @__PURE__ */ new Set([
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "preserveAspectRatio",
  "aspectRatio",
  "aspectRatioEdgeHandles"
]), ot = /* @__PURE__ */ new Set([
  "locked",
  "visible",
  "editable",
  "draggable",
  "resizable",
  "deletable",
  "duplicatable",
  "copyable",
  "resizeHandles"
]), st = 0.01, nt = 100, at = 0.15, rt = (e, t) => Object.prototype.hasOwnProperty.call(e, t), lt = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || t === null;
}, fe = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, Fe = (e, t, i) => Math.max(t, Math.min(i, e)), oe = (e) => {
  const t = /* @__PURE__ */ new Set(), i = [];
  return e.forEach((o) => {
    t.has(o) || (t.add(o), i.push(o));
  }), i;
}, ct = (e) => typeof e == "string" && De.indexOf(e) !== -1, ce = (e) => {
  if (Array.isArray(e))
    return oe(e.filter(ct));
}, Ee = (e, t) => {
  const i = new Set(t);
  return e.filter((o) => i.has(o));
}, dt = (e, t) => {
  const i = new Set(t);
  return e.every((o) => i.has(o));
}, ut = (e) => e === "w" || e === "sw" || e === "nw", ft = (e) => e === "n" || e === "ne" || e === "nw", mt = (e) => e === "e" || e === "w", ht = (e) => e === "n" || e === "s", A = (e, t, i, o = {}) => ({
  code: e,
  level: t,
  message: i,
  ...o
}), R = (e, t, i, o) => {
  e[i] = o, t[i] = t[i] || [], t[i].indexOf(o) === -1 && t[i].push(o);
}, Z = (e, t) => {
  if (!(!e || !rt(e, t)))
    return typeof e[t] == "boolean" ? e[t] : void 0;
}, Ae = (e, t, i, o, s, n) => {
  if (!e) return;
  const a = {};
  return Object.keys(e).forEach((r) => {
    if (We.has(r)) {
      s.push(A(
        "item-capability.unsafe-key",
        "warning",
        "Ignored unsafe item capability key.",
        { itemId: o, field: r, source: i }
      ));
      return;
    }
    if (t.has(r) || (s.push(A(
      "item-capability.unknown-field",
      "info",
      "Ignored unknown item capability field.",
      { itemId: o, field: r, source: i }
    )), !n)) return;
    const c = me(e[r], s, o, r, i);
    typeof c != "undefined" && (a[r] = c);
  }), Object.keys(a).length > 0 ? a : void 0;
}, me = (e, t, i, o, s) => {
  if (e == null || typeof e == "string" || typeof e == "boolean")
    return e;
  if (typeof e == "number")
    return Number.isFinite(e) ? e : void 0;
  if (Array.isArray(e))
    return e.map((a, r) => me(a, t, i, `${o}[${r}]`, s)).filter((a) => typeof a != "undefined");
  if (lt(e)) {
    const n = {};
    return Object.keys(e).forEach((a) => {
      if (We.has(a)) {
        t.push(A(
          "item-capability.unsafe-key",
          "warning",
          "Ignored unsafe item capability metadata key.",
          { itemId: i, field: `${o}.${a}`, source: s }
        ));
        return;
      }
      const r = me(e[a], t, i, `${o}.${a}`, s);
      typeof r != "undefined" && (n[a] = r);
    }), n;
  }
}, q = (e, t) => ({
  widthPx: e.w * t.colWidth + Math.max(0, e.w - 1) * t.margin[0],
  heightPx: e.h * t.rowHeight + Math.max(0, e.h - 1) * t.margin[1]
}), He = (e, t, i) => {
  const o = (e + i) / (t + i);
  return Math.max(1, Math.round(o));
}, Ve = (e, t) => {
  if (t !== "block" && !(!fe(e.w) || !fe(e.h)))
    return e.w / e.h;
}, he = (e) => fe(e) && e >= st && e <= nt, yt = (e) => {
  const t = [];
  if (e.preserveAspectRatio !== !0) return { diagnostics: t };
  const i = e.fallbackPolicy || "block", o = e.startGeometry || e.item;
  let s = e.aspectRatio, n = "explicit";
  if (typeof s == "undefined")
    if (n = "start-geometry", e.metrics) {
      const a = q(o, e.metrics);
      s = a.widthPx / a.heightPx;
    } else
      s = Ve(o, i), typeof s != "undefined" && i !== "block" && t.push(A(
        "item-capability.fallback-used",
        "warning",
        "Aspect ratio was derived from fallback grid geometry.",
        { itemId: e.id, field: "aspectRatio", details: { fallbackPolicy: i } }
      ));
  return typeof s != "undefined" && !he(s) && t.push(A(
    "item-capability.aspect-ratio-invalid",
    "error",
    "Aspect ratio must be finite, positive, and within the supported range.",
    { itemId: e.id, field: "aspectRatio", details: { ratio: s } }
  )), typeof s == "undefined" && !e.metrics && i === "block" && t.push(A(
    "item-capability.metrics-missing",
    "warning",
    "Aspect ratio requires visual resize metrics before resize can commit.",
    { itemId: e.id, field: "metrics" }
  )), {
    constraint: {
      enabled: !0,
      ratio: s,
      ratioKind: "visual-px",
      source: n,
      fallbackPolicy: i,
      edgeHandles: oe(e.edgeHandles || []),
      metrics: e.metrics,
      startGeometry: o,
      ratioTolerance: e.ratioTolerance
    },
    diagnostics: t
  };
}, pt = (e, t, i, o) => {
  if (typeof t.ratio != "undefined") {
    if (he(t.ratio)) return t.ratio;
    o.push(A(
      "item-capability.aspect-ratio-invalid",
      "error",
      "Aspect ratio must be finite, positive, and within the supported range.",
      { itemId: i, field: "aspectRatio", details: { ratio: t.ratio } }
    ));
    return;
  }
  const s = t.startGeometry || e;
  if (t.metrics) {
    const a = q(s, t.metrics), r = a.widthPx / a.heightPx;
    return he(r) ? r : void 0;
  }
  const n = Ve(s, t.fallbackPolicy);
  if (typeof n == "undefined") {
    o.push(A(
      "item-capability.metrics-missing",
      "error",
      "Aspect ratio resize was blocked because visual metrics are missing.",
      { itemId: i, field: "metrics" }
    ));
    return;
  }
  return o.push(A(
    "item-capability.fallback-used",
    "warning",
    "Aspect ratio resize used fallback grid geometry.",
    { itemId: i, field: "metrics", details: { fallbackPolicy: t.fallbackPolicy } }
  )), n;
}, gt = (e, t, i) => {
  let o = t.x, s = t.y;
  return ut(i) && (o = e.x + e.w - t.w), ft(i) && (s = e.y + e.h - t.h), { ...t, x: o, y: s };
}, bt = (e, t, i) => {
  if (mt(i)) return "width";
  if (ht(i)) return "height";
  const o = Math.abs(t.w - e.w) / Math.max(1, e.w), s = Math.abs(t.h - e.h) / Math.max(1, e.h);
  return o >= s ? "width" : "height";
}, xt = () => ({
  colWidth: 1,
  rowHeight: 1,
  margin: [0, 0],
  renderPrecision: "integer"
}), wt = (e, t, i) => {
  const o = q(e, i), s = o.widthPx / o.heightPx;
  return Math.abs(s - t) / t;
}, Xt = (e) => {
  var N, P, h, S, b, C, z, y, x, K, Y;
  const { startItem: t, rawCandidate: i, handle: o, constraint: s } = e, n = t.i, a = [];
  if (!s.enabled)
    return { kind: "allowed", candidate: i, diagnostics: a, ratio: 0 };
  if (Ge.has(o) && s.edgeHandles.indexOf(o) === -1)
    return a.push(A(
      "item-capability.handle-disabled",
      "warning",
      "Edge handle is disabled for aspect-ratio resize.",
      { itemId: n, field: "resizeHandles", details: { handle: o } }
    )), { kind: "blocked", reason: "handle-disabled", candidate: t, diagnostics: a };
  const r = pt(t, s, n, a);
  if (typeof r == "undefined")
    return { kind: "blocked", reason: a.some((L) => L.code === "item-capability.metrics-missing") ? "metrics-missing" : "aspect-ratio", candidate: t, diagnostics: a };
  const c = s.metrics || (s.fallbackPolicy === "block" ? void 0 : xt());
  if (!c)
    return a.push(A(
      "item-capability.metrics-missing",
      "error",
      "Aspect ratio resize was blocked because visual metrics are missing.",
      { itemId: n, field: "metrics" }
    )), { kind: "blocked", reason: "metrics-missing", candidate: t, diagnostics: a };
  let d = Math.max(1, Math.round(i.w)), l = Math.max(1, Math.round(i.h));
  if (bt(t, i, o) === "width") {
    const L = q({ w: d, h: l }, c).widthPx / r;
    l = He(L, c.rowHeight, c.margin[1]);
  } else {
    const L = q({ w: d, h: l }, c).heightPx * r;
    d = He(L, c.colWidth, c.margin[0]);
  }
  const f = e.bounds || {}, m = (P = (N = f.minW) != null ? N : t.minW) != null ? P : 1, p = (S = (h = f.minH) != null ? h : t.minH) != null ? S : 1, g = (z = (C = (b = f.maxW) != null ? b : t.maxW) != null ? C : f.cols) != null ? z : Number.MAX_SAFE_INTEGER, k = (K = (x = (y = f.maxH) != null ? y : t.maxH) != null ? x : f.maxRows) != null ? K : Number.MAX_SAFE_INTEGER, v = Fe(d, m, g), M = Fe(l, p, k), w = v !== d || M !== l;
  d = v, l = M;
  const I = gt(t, {
    ...i,
    w: d,
    h: l
  }, o), H = (Y = s.ratioTolerance) != null ? Y : at, F = wt(I, r, c);
  return w && F > H ? (a.push(A(
    "item-capability.aspect-ratio-invalid",
    "error",
    "Aspect ratio cannot be satisfied with the current min/max constraints.",
    {
      itemId: n,
      field: "aspectRatio",
      details: { ratio: r, actualError: F, tolerance: H, candidate: I }
    }
  )), { kind: "blocked", reason: "aspect-ratio", candidate: I, diagnostics: a }) : {
    kind: w || a.some((G) => G.code === "item-capability.fallback-used") ? "degraded" : "allowed",
    candidate: I,
    diagnostics: a,
    ratio: r
  };
}, vt = (e) => ({
  static: e.static,
  draggable: e.isDraggable,
  resizable: e.isResizable,
  bounded: e.isBounded,
  resizeHandles: e.resizeHandles
}), Ut = (e) => {
  const t = e.item, i = t.i, o = [], s = {}, n = {}, a = e.defaults || {}, r = e.preserveUnknownFields === !0, c = {};
  let d = a.visible !== !1, l = a.editable !== !1, u = a.draggable !== !1, f = a.resizable !== !1, m = a.bounded !== !1, p = !1, g = !1, k = a.deletable !== !1, v = a.duplicatable !== !1, M = a.copyable !== !1, w = oe(a.resizeHandles || De), I = !1, H, F = [];
  Object.keys({
    visible: d,
    editable: l,
    draggable: u,
    resizable: f,
    bounded: m,
    resizeHandles: w,
    deletable: k,
    duplicatable: v,
    copyable: M
  }).forEach((y) => R(s, n, y, "defaults"));
  const N = (y, x) => {
    if (!y) return;
    const K = Ae(
      y,
      it,
      x,
      i,
      o,
      r
    );
    K && (c[x] = K);
    const Y = Z(y, "static");
    typeof Y != "undefined" && (p = Y, R(s, n, "static", x));
    const G = Z(y, "draggable");
    typeof G != "undefined" && (u = G, R(s, n, "draggable", x));
    const L = Z(y, "resizable");
    typeof L != "undefined" && (f = L, R(s, n, "resizable", x));
    const ke = Z(y, "bounded");
    typeof ke != "undefined" && (m = ke, R(s, n, "bounded", x));
    const Re = ce(y.resizeHandles);
    Re && (w = Re, R(s, n, "resizeHandles", x));
    const Ie = Z(y, "preserveAspectRatio");
    typeof Ie != "undefined" && (I = Ie, R(s, n, "preserveAspectRatio", x)), typeof y.aspectRatio != "undefined" && (H = typeof y.aspectRatio == "number" ? y.aspectRatio : void 0, R(s, n, "aspectRatio", x));
    const Ce = ce(y.aspectRatioEdgeHandles);
    Ce && (F = Ce.filter((qe) => Ge.has(qe)), R(s, n, "aspectRatioEdgeHandles", x));
  };
  N(vt(t), "layout"), N(e.dashboard, "dashboard"), N(e.profile, "profile"), p && ((u || f) && o.push(A(
    "item-capability.conflict",
    "warning",
    "static=true forces direct drag and resize off.",
    { itemId: i, field: "static", source: s.static, targetSource: s.draggable }
  )), u = !1, f = !1, R(s, n, "draggable", s.static || "layout"), R(s, n, "resizable", s.static || "layout"));
  const P = u, h = f, S = w.slice(), b = e.editor;
  if (b) {
    const y = Ae(
      b,
      ot,
      "editor",
      i,
      o,
      r
    );
    y && (c.editor = y), typeof b.locked == "boolean" && (g = b.locked, R(s, n, "locked", "editor")), typeof b.visible == "boolean" && (d = b.visible, R(s, n, "visible", "editor")), typeof b.editable == "boolean" && (l = l && b.editable, R(s, n, "editable", "editor")), typeof b.draggable == "boolean" && (b.draggable === !1 ? u = !1 : P || o.push(A(
      "item-capability.conflict",
      "warning",
      "Editor metadata cannot loosen physical draggable=false.",
      { itemId: i, field: "draggable", source: "editor", targetSource: s.draggable }
    )), R(s, n, "draggable", "editor")), typeof b.resizable == "boolean" && (b.resizable === !1 ? f = !1 : h || o.push(A(
      "item-capability.conflict",
      "warning",
      "Editor metadata cannot loosen physical resizable=false.",
      { itemId: i, field: "resizable", source: "editor", targetSource: s.resizable }
    )), R(s, n, "resizable", "editor")), typeof b.deletable == "boolean" && (k = k && b.deletable, R(s, n, "deletable", "editor")), typeof b.duplicatable == "boolean" && (v = v && b.duplicatable, R(s, n, "duplicatable", "editor")), typeof b.copyable == "boolean" && (M = M && b.copyable, R(s, n, "copyable", "editor"));
    const x = ce(b.resizeHandles);
    x && (dt(x, S) || o.push(A(
      "item-capability.conflict",
      "warning",
      "Editor resize handles cannot loosen physical handle policy.",
      {
        itemId: i,
        field: "resizeHandles",
        source: "editor",
        targetSource: s.resizeHandles,
        details: { requested: x, physical: S }
      }
    )), w = Ee(S, x), R(s, n, "resizeHandles", "editor"));
  }
  g && (l = !1, u = !1, f = !1, k = !1, v = !1, R(s, n, "editable", "editor")), d || (u = !1, f = !1), f || (w = []);
  let C;
  if (I) {
    const y = yt({
      id: i,
      item: t,
      preserveAspectRatio: I,
      aspectRatio: H,
      edgeHandles: F,
      metrics: e.metrics,
      startGeometry: e.startGeometry,
      fallbackPolicy: e.aspectRatioFallbackPolicy
    });
    if (o.push(...y.diagnostics), C = y.constraint, C) {
      const x = F.length > 0 ? oe([...Array.from(ze), ...F]) : Array.from(ze);
      w = Ee(w, x), R(s, n, "resizeHandles", s.aspectRatioEdgeHandles || "derived"), R(s, n, "aspectRatio", s.aspectRatio || "derived");
    }
  }
  const z = C || w.length > 0 ? {
    handlePolicy: { allowedHandles: w.slice(), blockedReason: "handle-disabled" },
    aspectRatio: C
  } : f ? { handlePolicy: { allowedHandles: [], blockedReason: "handle-disabled" } } : void 0;
  return {
    id: i,
    visible: d,
    editable: l && !p && !g,
    draggable: u,
    resizable: f,
    bounded: u && m,
    static: p,
    locked: g,
    resizeHandles: w,
    deletable: l && !g && k,
    duplicatable: l && !g && v,
    copyable: d && M,
    aspectRatio: C,
    resizeConstraint: z,
    sources: s,
    sourceLists: n,
    diagnostics: o,
    metadata: Object.keys(c).length > 0 ? c : void 0
  };
}, de = "__layout_engine_fit__", $ = (e) => typeof e == "number" && Number.isFinite(e), ue = (e) => $(e.x) && $(e.y) && $(e.w) && $(e.h) && e.w > 0 && e.h > 0, W = (e) => {
  const t = Math.floor(e);
  return Number.isFinite(t) && t > 0 ? t : null;
};
class kt {
  constructor(t, i) {
    this.options = i, this.name = "row-column-occupancy", this.layout = [], this.rows = /* @__PURE__ */ new Map(), this.columns = /* @__PURE__ */ new Map(), this.orderById = /* @__PURE__ */ new Map(), this.itemById = /* @__PURE__ */ new Map(), this.rebuild(t);
  }
  rebuild(t) {
    this.layout = t.slice(0), this.rows.clear(), this.columns.clear(), this.orderById = /* @__PURE__ */ new Map(), this.itemById = /* @__PURE__ */ new Map();
    for (let i = 0; i < this.layout.length; i++) {
      const o = this.layout[i];
      this.orderById.set(o.i, i), this.itemById.set(o.i, o), this.addToBuckets(o);
    }
  }
  getLayout() {
    return this.layout.slice(0);
  }
  queryFirstCollision(t) {
    if (!ue(t)) return Me(this.layout, t);
    const i = this.queryCollisionCandidates(t);
    return i === null ? Me(this.layout, t) : i.length > 0 ? i[0] : void 0;
  }
  queryAllCollisions(t) {
    if (!ue(t)) return Se(this.layout, t);
    const i = this.queryCollisionCandidates(t);
    return i === null ? Se(this.layout, t) : i;
  }
  canPlace(t) {
    if (!ue(t)) return !1;
    const i = W(this.options.cols);
    return !i || t.x < 0 || t.y < 0 || t.x + t.w > i || Number.isFinite(this.options.maxRows) && t.y + t.h > Math.floor(this.options.maxRows) ? !1 : this.queryFirstCollision(t) == null;
  }
  findFirstFit(t) {
    const i = W(t.w), o = W(t.h), s = W(this.options.cols), n = Number.isFinite(this.options.maxRows) ? Math.floor(this.options.maxRows) : 1 / 0;
    if (!i || !o || !s || i > s)
      return et(this.layout, t, this.options.cols, this.options.maxRows);
    if (Number.isFinite(n) && o > n) return null;
    let a = Math.max(0, Math.ceil(Te(this.layout)));
    if (Number.isFinite(n) && (a = Math.min(a, n - o)), a < 0) return null;
    for (let r = 0; r <= a; r++)
      for (let c = 0; c <= s - i; c++) {
        const d = { i: de, x: c, y: r, w: i, h: o };
        if (this.canPlace(d)) return { x: c, y: r };
      }
    return null;
  }
  findNearestFit(t, i) {
    const o = W(t.w), s = W(t.h), n = W(this.options.cols);
    if (!o || !s || !n || !Number.isFinite(i.x) || !Number.isFinite(i.y) || o > n)
      return tt(
        this.layout,
        t,
        this.options.cols,
        i.x,
        i.y,
        this.options.maxRows
      );
    if (this.layout.length === 0) {
      const d = Math.max(0, Math.min(Math.round(i.x), n - o)), l = Math.max(0, Math.round(i.y)), u = { i: de, x: d, y: l, w: o, h: s };
      return this.canPlace(u) ? { x: d, y: l } : this.findFirstFit(t);
    }
    const a = (d, l) => {
      const u = d + o / 2, f = l + s / 2, m = u - i.x, p = f - i.y;
      return m * m + p * p;
    }, r = [], c = /* @__PURE__ */ new Set();
    for (let d = 0; d < this.layout.length; d++) {
      const l = this.layout[d], u = [
        { x: l.x - o, y: l.y },
        { x: l.x + l.w, y: l.y },
        { x: l.x, y: l.y - s },
        { x: l.x, y: l.y + l.h },
        { x: l.x - o, y: l.y - s },
        { x: l.x + l.w, y: l.y - s },
        { x: l.x - o, y: l.y + l.h },
        { x: l.x + l.w, y: l.y + l.h }
      ];
      for (let f = 0; f < u.length; f++) {
        const m = u[f], p = `${m.x}:${m.y}`;
        if (c.has(p)) continue;
        c.add(p);
        const g = { i: de, x: m.x, y: m.y, w: o, h: s };
        this.canPlace(g) && r.push({
          x: m.x,
          y: m.y,
          dist: a(m.x, m.y),
          order: d * u.length + f
        });
      }
    }
    return r.length === 0 ? this.findFirstFit(t) : (r.sort((d, l) => d.dist !== l.dist ? d.dist - l.dist : d.y !== l.y ? d.y - l.y : d.x !== l.x ? d.x - l.x : d.order - l.order), { x: r[0].x, y: r[0].y });
  }
  insert(t) {
    const i = this.itemById.get(t.i);
    if (i) {
      this.update(i, t);
      return;
    }
    this.layout.push(t), this.orderById.set(t.i, this.layout.length - 1), this.itemById.set(t.i, t), this.addToBuckets(t);
  }
  remove(t) {
    const i = this.itemById.get(t);
    i && (this.removeFromBuckets(i), this.layout = this.layout.filter((o) => o.i !== t), this.rebuildOrder());
  }
  update(t, i) {
    const o = this.orderById.get(t.i);
    if (typeof o != "number") {
      this.insert(i);
      return;
    }
    this.removeFromBuckets(t), this.layout[o] = i, t.i !== i.i && (this.itemById.delete(t.i), this.orderById.delete(t.i)), this.orderById.set(i.i, o), this.itemById.set(i.i, i), this.addToBuckets(i);
  }
  queryCollisionCandidates(t) {
    const i = this.getRowRange(t);
    if (!i) return null;
    const o = /* @__PURE__ */ new Set();
    for (let n = i.start; n <= i.end; n++) {
      const a = this.rows.get(n);
      if (a)
        for (let r = 0; r < a.length; r++) o.add(a[r]);
    }
    const s = [];
    return o.forEach((n) => {
      const a = this.itemById.get(n);
      a && je(a, t) && s.push(a);
    }), s.sort((n, a) => {
      const r = this.orderById.get(n.i), c = this.orderById.get(a.i);
      return (typeof r == "number" ? r : 1 / 0) - (typeof c == "number" ? c : 1 / 0);
    }), s;
  }
  addToBuckets(t) {
    this.addToAxisBuckets(this.rows, t.i, this.getRowRange(t)), this.addToAxisBuckets(this.columns, t.i, this.getColumnRange(t));
  }
  removeFromBuckets(t) {
    this.removeFromAxisBuckets(this.rows, t.i, this.getRowRange(t)), this.removeFromAxisBuckets(this.columns, t.i, this.getColumnRange(t));
  }
  addToAxisBuckets(t, i, o) {
    if (o)
      for (let s = o.start; s <= o.end; s++) {
        let n = t.get(s);
        n || (n = [], t.set(s, n)), n.push(i);
      }
  }
  removeFromAxisBuckets(t, i, o) {
    if (o)
      for (let s = o.start; s <= o.end; s++) {
        const n = t.get(s);
        if (!n) continue;
        const a = n.filter((r) => r !== i);
        a.length === 0 ? t.delete(s) : t.set(s, a);
      }
  }
  getRowRange(t) {
    if (!$(t.y) || !$(t.h) || t.h <= 0) return null;
    const i = Math.floor(t.y), o = Math.max(i, Math.floor(t.y + t.h - 1));
    return { start: i, end: o };
  }
  getColumnRange(t) {
    if (!$(t.x) || !$(t.w) || t.w <= 0) return null;
    const i = Math.floor(t.x), o = Math.max(i, Math.floor(t.x + t.w - 1));
    return { start: i, end: o };
  }
  rebuildOrder() {
    this.orderById = /* @__PURE__ */ new Map(), this.itemById = /* @__PURE__ */ new Map();
    for (let t = 0; t < this.layout.length; t++) {
      const i = this.layout[t];
      this.orderById.set(i.i, t), this.itemById.set(i.i, i);
    }
  }
}
function Xe() {
  return {
    name: "row-column-occupancy",
    build(e, t) {
      return new kt(e, t);
    }
  };
}
const Rt = 1 / 0, ne = {
  minimizeMovement: 1,
  minimizeResize: 1,
  preserveOrder: 1,
  preserveStatic: 1,
  preserveGroups: 0
}, B = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, ae = (e) => ({
  ...e,
  maxRows: typeof e.maxRows == "number" ? e.maxRows : Rt,
  allowOverlap: !!e.allowOverlap,
  preventCollision: !!e.preventCollision,
  indexStrategy: e.indexStrategy || Xe()
}), T = (e) => typeof e == "number" && Number.isFinite(e), It = (e) => T(e) && e > 0, X = (e) => {
  if (!It(e)) return null;
  const t = Math.floor(e);
  return t > 0 ? t : null;
}, ee = (e) => T(e) ? Math.round(e) : null, Ne = (e, t, i) => Math.max(t, Math.min(e, i)), E = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Q = (e, t) => e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h, Ue = (e) => e.static === !0 || e.isDraggable === !1, Pe = (e) => `${e.x}:${e.y}:${e.w}:${e.h}:${!!e.moved}`, Ke = (e, t) => {
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let i = 0; i < e.length; i++) {
    const o = e[i], s = t[i];
    if (!o || !s || o.i !== s.i || Pe(o) !== Pe(s)) return !1;
  }
  return !0;
}, U = (e, t, i) => {
  const o = [], s = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  return e.forEach((a) => s.set(a.i, a)), t.forEach((a) => n.set(a.i, a)), t.forEach((a) => {
    const r = s.get(a.i);
    if (!r) {
      o.push({ type: "add", item: j(a) });
      return;
    }
    Q(r, a) || (r.w !== a.w || r.h !== a.h ? o.push({
      type: "resize",
      id: a.i,
      from: { w: r.w, h: r.h, x: r.x, y: r.y },
      to: { w: a.w, h: a.h, x: a.x, y: a.y }
    }) : o.push({
      type: "move",
      id: a.i,
      from: { x: r.x, y: r.y },
      to: { x: a.x, y: a.y }
    }));
  }), e.forEach((a) => {
    n.has(a.i) || o.push({ type: "remove", id: a.i });
  }), i && o.length > 1 && o.push({
    type: "compact",
    affectedIds: o.map((a) => a.type === "add" ? a.item.i : a.type === "compact" ? "" : a.id).filter(Boolean)
  }), o;
}, ye = (e, t) => {
  const i = /* @__PURE__ */ new Set();
  return e.forEach((o) => {
    o.type === "compact" ? o.affectedIds.forEach((s) => i.add(s)) : o.type === "add" ? i.add(o.item.i) : i.add(o.id);
  }), t.forEach((o) => i.add(o.i)), Array.from(i);
}, O = (e) => {
  const t = /* @__PURE__ */ new Set(), i = [];
  for (let o = 0; o < e.length; o++)
    for (let s = o + 1; s < e.length; s++)
      je(e[o], e[s]) && (t.has(e[o].i) || (t.add(e[o].i), i.push(e[o])), t.has(e[s].i) || (t.add(e[s].i), i.push(e[s])));
  return i;
}, Ye = (e, t) => (t.indexStrategy || Xe()).build(e, {
  cols: t.cols,
  maxRows: t.maxRows,
  compactType: t.compactType,
  allowOverlap: t.allowOverlap,
  preventCollision: t.preventCollision
}), Ct = (e) => {
  if (e.debug) return !0;
  const t = e.options.diagnostics;
  return typeof t == "object" && t.debug === !0;
}, Mt = (e, t, i, o, s, n, a, r, c) => {
  var u, f;
  const d = B() - s, l = {
    operationId: e.id,
    operationType: e.operation.type,
    phase: e.phase,
    layoutSize: e.layout.length,
    affectedCount: ye(i, o).length,
    collisionCount: o.length,
    indexHit: !0,
    schedulerMode: (u = e.options.scheduler) == null ? void 0 : u.mode,
    executorKind: ((f = e.options.executor) == null ? void 0 : f.kind) || "main-thread",
    durationMs: d,
    computeMs: d,
    details: a.length > 0 ? a.slice() : void 0
  };
  return Ct(e) && (l.debug = {
    cols: e.options.cols,
    maxRows: e.options.maxRows,
    compactType: e.options.compactType,
    allowOverlap: e.options.allowOverlap,
    preventCollision: e.options.preventCollision,
    operation: e.operation,
    result: {
      status: t,
      affectedIds: ye(i, o),
      collisionIds: o.map((m) => m.i),
      blockedReason: n,
      migration: r,
      repair: c,
      details: a.slice()
    }
  }), l;
}, _ = (e, t, i, o, s, n, a, r = {}) => {
  var c;
  return {
    id: e.id,
    status: t,
    layout: i,
    patches: o,
    affectedIds: ye(o, s),
    collisions: s,
    diagnostics: Mt(
      e,
      t,
      o,
      s,
      n,
      (c = r.blocked) == null ? void 0 : c.reason,
      a,
      r.migration,
      r.repair
    ),
    ...r
  };
}, V = (e, t, i, o, s) => _(e, "error", e.layout, [], [], i, o, {
  blocked: { reason: "invalid-input", itemIds: [] },
  error: { message: t, cause: s }
}), D = (e, t, i, o, s, n = [], a = {}) => _(e, "blocked", e.layout, [], n, o, s, {
  ...a,
  blocked: { reason: t, itemIds: i }
}), St = (e, t) => {
  var n;
  const i = (n = e.cols) != null ? n : e.columns, o = X(i);
  if (o) return { ok: !0, value: o, source: "input" };
  const s = X(t);
  return s && i == null ? { ok: !0, value: s, source: "fallback" } : { ok: !1 };
}, Be = (e) => {
  const t = X(e);
  return t == null ? void 0 : t;
}, Oe = (e, t) => {
  const i = St(e, t);
  return i.ok ? {
    ok: !0,
    value: {
      cols: i.value,
      minColumns: Be(e.minColumns),
      maxRows: Be(e.maxRows)
    }
  } : { ok: !1 };
}, zt = (e, t) => e.cols === t.cols && e.minColumns === t.minColumns && e.maxRows === t.maxRows, _e = /* @__PURE__ */ new Set(["cols", "columns", "minColumns", "maxRows"]), se = (e) => {
  if (e == null || typeof e != "object") return String(e);
  if (Array.isArray(e)) return `[${e.map(se).join(",")}]`;
  const t = e;
  return `{${Object.keys(t).sort().map((i) => `${i}:${se(t[i])}`).join(",")}}`;
}, Ft = (e, t) => {
  const i = /* @__PURE__ */ new Set();
  Object.keys(e).forEach((s) => {
    _e.has(s) || i.add(s);
  }), Object.keys(t).forEach((s) => {
    _e.has(s) || i.add(s);
  });
  const o = Array.from(i);
  for (let s = 0; s < o.length; s++) {
    const n = o[s];
    if (se(e[n]) !== se(t[n])) return !0;
  }
  return !1;
}, ge = (e) => ({
  strategy: "heuristic",
  fallback: "heuristic",
  ...e,
  objective: {
    ...ne,
    ...(e == null ? void 0 : e.objective) || {}
  }
}), Et = [
  "none",
  "first-fit",
  "nearest-fit",
  "nearest-then-first",
  "heuristic",
  "custom"
], At = (e) => typeof e == "string" && Et.indexOf(e) !== -1, te = (e, t) => {
  const i = /* @__PURE__ */ new Set();
  return e.forEach((o, s) => {
    o.code === t && i.add(o.itemId || `${t}:${s}`);
  }), i.size;
}, Ht = (e, t) => ({
  ...e,
  clampedCount: Math.max(e.clampedCount, te(t, "item-clamped")),
  resizedCount: Math.max(
    e.resizedCount,
    te(t, "item-shrunk") + te(t, "item-expanded")
  ),
  forcedStaticRepairCount: Math.max(
    e.forcedStaticRepairCount,
    te(t, "forced-static-repair")
  )
}), Ze = (e, t) => {
  const i = (e == null ? void 0 : e.strategy) || "heuristic";
  return At(i) ? i : (t == null || t.push({
    code: "policy-unsupported",
    level: "warning",
    message: `Unsupported repair strategy "${String(i)}"; falling back to heuristic.`,
    reason: "unsupported-strategy"
  }), "heuristic");
}, be = (e, t) => {
  const i = X(e.minW) || 1, o = Math.max(1, Math.min(i, t)), s = X(e.maxW) || t, n = Math.max(o, Math.min(s, t));
  return { min: o, max: n };
}, xe = (e, t) => {
  const i = X(e.minH) || 1, o = Number.isFinite(t) ? Math.floor(t) : 1 / 0, s = Number.isFinite(o) ? Math.max(1, Math.min(i, o)) : i, n = X(e.maxH) || o, a = Number.isFinite(o) ? Math.max(s, Math.min(n, o)) : Math.max(s, n);
  return { min: s, max: a };
}, Je = (e, t, i, o = {}) => {
  var f, m, p, g;
  const s = typeof e.i == "string" ? e.i.trim() : "", n = !s || !T(e.x) || !T(e.y) || !T(e.w) || !T(e.h) || e.w <= 0 || e.h <= 0;
  if (n && !o.sanitizeInvalidItems)
    return i.push({
      code: "item-invalid",
      level: "error",
      message: `Layout item "${s || "(missing)"}" has invalid geometry.`,
      itemId: s || void 0,
      reason: o.reason || "strict-invalid-geometry"
    }), { ok: !1, itemId: s || void 0, message: "invalid layout item geometry" };
  if (!s)
    return i.push({
      code: "item-skipped",
      level: "warning",
      message: "Skipped layout item with missing id.",
      reason: "missing-id"
    }), { ok: !1, message: "missing layout item id" };
  const a = E(e), r = j({
    ...e,
    i: s,
    x: (f = ee(e.x)) != null ? f : 0,
    y: (m = ee(e.y)) != null ? m : 0,
    w: (p = ee(e.w)) != null ? p : 1,
    h: (g = ee(e.h)) != null ? g : 1
  }), c = Math.max(1, Math.floor(t.cols)), d = Number.isFinite(t.maxRows) ? Math.floor(t.maxRows) : 1 / 0, l = be(r, c), u = xe(r, d);
  return r.w = Ne(r.w, l.min, l.max), r.h = Ne(r.h, u.min, u.max), r.x < 0 && (r.x = 0), r.y < 0 && (r.y = 0), r.x + r.w > c && (r.x = Math.max(0, c - r.w)), Number.isFinite(d) && r.y + r.h > d && (r.y = Math.max(0, d - r.h)), n && i.push({
    code: "item-sanitized",
    level: "warning",
    message: `Sanitized invalid layout item "${s}".`,
    itemId: s,
    before: a,
    after: E(r),
    reason: o.reason || "sanitize-invalid-geometry"
  }), r.w < a.w || r.h < a.h ? i.push({
    code: "item-shrunk",
    level: "info",
    message: `Shrunk layout item "${s}" to fit constraints.`,
    itemId: s,
    before: a,
    after: E(r),
    reason: o.reason || "constraints"
  }) : (r.w > a.w || r.h > a.h) && i.push({
    code: "item-expanded",
    level: "info",
    message: `Expanded layout item "${s}" to meet constraints.`,
    itemId: s,
    before: a,
    after: E(r),
    reason: o.reason || "constraints"
  }), (r.x !== a.x || r.y !== a.y) && i.push({
    code: "item-clamped",
    level: "info",
    message: `Clamped layout item "${s}" into bounds.`,
    itemId: s,
    before: a,
    after: E(r),
    reason: o.reason || "bounds"
  }), Ue(e) && !Q(e, r) && i.push({
    code: "forced-static-repair",
    level: "warning",
    message: `Repaired static/locked layout item "${s}" because it violated bounds or constraints.`,
    itemId: s,
    before: a,
    after: E(r),
    reason: o.reason || "static-bounds-or-constraints"
  }), r.moved = !1, { ok: !0, item: r };
}, we = (e, t, i, o, s) => {
  const n = [], a = [];
  for (const r of e) {
    const c = Je(r, t, i, {
      sanitizeInvalidItems: o,
      reason: s
    });
    if (!c.ok) {
      if (c.itemId && a.push(c.itemId), !o) return { ok: !1, itemIds: a, message: c.message };
      continue;
    }
    n.push(c.item);
  }
  return { ok: !0, layout: n };
}, ie = (e, t, i) => Math.round(e * t), Nt = (e, t, i, o) => e.map((s) => {
  const n = j(s);
  return n.x = ie(s.x, t, o), n.w = ie(s.w, t, o), i === "xy" && (n.y = ie(s.y, t, o), n.h = ie(s.h, t, o)), n;
}), Pt = (e, t) => {
  const i = /* @__PURE__ */ new Map();
  return t.forEach((o, s) => i.set(o.i, s)), e.slice().sort((o, s) => {
    var r, c;
    const n = (r = i.get(o.i)) != null ? r : Number.MAX_SAFE_INTEGER, a = (c = i.get(s.i)) != null ? c : Number.MAX_SAFE_INTEGER;
    return n !== a ? n - a : o.i < s.i ? -1 : o.i > s.i ? 1 : 0;
  });
}, pe = (e) => Ue(e), Bt = (e, t) => {
  const i = /* @__PURE__ */ new Map();
  return t.forEach((o, s) => i.set(o.i, { index: s, x: o.x, y: o.y })), e.slice().sort((o, s) => {
    var g, k, v, M, w, I;
    const n = pe(o) ? 0 : 1, a = pe(s) ? 0 : 1;
    if (n !== a) return n - a;
    const r = i.get(o.i), c = i.get(s.i), d = (g = r == null ? void 0 : r.y) != null ? g : o.y, l = (k = c == null ? void 0 : c.y) != null ? k : s.y;
    if (d !== l) return d - l;
    const u = (v = r == null ? void 0 : r.x) != null ? v : o.x, f = (M = c == null ? void 0 : c.x) != null ? M : s.x;
    if (u !== f) return u - f;
    if (o.y !== s.y) return o.y - s.y;
    if (o.x !== s.x) return o.x - s.x;
    const m = (w = r == null ? void 0 : r.index) != null ? w : Number.MAX_SAFE_INTEGER, p = (I = c == null ? void 0 : c.index) != null ? I : Number.MAX_SAFE_INTEGER;
    return m !== p ? m - p : o.i < s.i ? -1 : o.i > s.i ? 1 : 0;
  });
}, Qe = (e) => ({
  x: e.x + e.w / 2,
  y: e.y + e.h / 2
}), Le = (e, t, i, o, s) => {
  const n = Ye(t, i), a = Ze(o, s);
  let r = 0;
  if (n.canPlace(e))
    return { item: e, position: { x: e.x, y: e.y }, candidateCount: 1 };
  n.queryAllCollisions(e).length > 0 && s.push({
    code: "collision-detected",
    level: "warning",
    message: `Layout item "${e.i}" collides with placed items.`,
    itemId: e.i,
    before: E(e),
    reason: "repair"
  });
  const d = a === "nearest-fit" || a === "nearest-then-first" || a === "heuristic" || a === "custom", l = a === "first-fit" || a === "nearest-then-first" || a === "heuristic" || a === "custom";
  if (d) {
    r++;
    const u = n.findNearestFit({ w: e.w, h: e.h }, Qe(e));
    if (u) return { item: e, position: u, fallback: "nearest-fit", candidateCount: r };
  }
  if (l) {
    r++;
    const u = n.findFirstFit({ w: e.w, h: e.h });
    if (u)
      return d && s.push({
        code: "repair-fallback",
        level: "info",
        message: `Fell back to first-fit for layout item "${e.i}".`,
        itemId: e.i,
        before: E(e),
        reason: "nearest-fit-empty"
      }), { item: e, position: u, fallback: d ? "first-fit" : void 0, candidateCount: r };
  }
  return { item: e, position: null, candidateCount: r };
}, Ot = (e, t) => {
  const i = j(e), o = be(i, Math.max(1, Math.floor(t.cols))), s = xe(i, t.maxRows);
  i.w = o.min, i.h = s.min, i.x + i.w > t.cols && (i.x = Math.max(0, t.cols - i.w));
  const n = Number.isFinite(t.maxRows) ? Math.floor(t.maxRows) : 1 / 0;
  return Number.isFinite(n) && i.y + i.h > n && (i.y = Math.max(0, n - i.h)), i;
}, _t = (e, t, i, o) => {
  const s = t.map((u) => u.i).sort(), n = e.map((u) => u.i).sort();
  if (s.length !== n.length || s.some((u, f) => u !== n[f]))
    return { ok: !1, reason: "id-set", itemIds: [], collisions: [] };
  const a = /* @__PURE__ */ new Set(), r = [], c = Math.floor(i.cols), d = Number.isFinite(i.maxRows) ? Math.floor(i.maxRows) : 1 / 0;
  for (const u of e) {
    if (a.has(u.i) && r.push(u.i), a.add(u.i), !Number.isInteger(u.x) || !Number.isInteger(u.y) || !Number.isInteger(u.w) || !Number.isInteger(u.h) || u.x < 0 || u.y < 0 || u.w <= 0 || u.h <= 0 || u.x + u.w > c || Number.isFinite(d) && u.y + u.h > d) {
      r.push(u.i);
      continue;
    }
    const f = be(u, c), m = xe(u, d);
    (u.w < f.min || u.w > f.max) && r.push(u.i), (u.h < m.min || u.h > m.max) && r.push(u.i);
  }
  const l = O(e);
  return r.length > 0 ? { ok: !1, reason: "geometry", itemIds: Array.from(new Set(r)), collisions: l } : o && l.length > 0 ? { ok: !1, reason: "collision", itemIds: l.map((u) => u.i), collisions: l } : { ok: !0 };
}, $e = (e, t, i, o = {}, s, n) => {
  const a = B(), r = ge(o), c = Ze(r, n), d = {
    ...ne,
    ...r.objective || {}
  }, l = O(e), u = !i.allowOverlap || i.preventCollision || s;
  if (i.allowOverlap && !s && !i.preventCollision && c !== "custom")
    return l.length > 0 && n.push({
      code: "collision-detected",
      level: "info",
      message: "allowOverlap is enabled; collisions were preserved.",
      reason: "allow-overlap"
    }), {
      status: "ok",
      layout: e,
      collisions: l,
      details: n,
      usedFallback: !1,
      summary: {
        strategy: c,
        objective: d,
        candidateCount: 0,
        movedCount: 0,
        resizedCount: 0,
        clampedCount: 0,
        forcedStaticRepairCount: 0,
        unresolvedIds: [],
        durationMs: B() - a
      }
    };
  if (c === "none")
    return {
      status: u && l.length > 0 ? "blocked" : "ok",
      layout: e,
      collisions: l,
      details: n,
      usedFallback: !1,
      summary: {
        strategy: c,
        objective: d,
        candidateCount: 0,
        movedCount: 0,
        resizedCount: 0,
        clampedCount: 0,
        forcedStaticRepairCount: 0,
        unresolvedIds: l.map((h) => h.i),
        durationMs: B() - a
      }
    };
  const f = Bt(e, t), m = [], p = [];
  let g = 0, k = 0, v = 0, M = 0, w = 0, I;
  for (const h of f) {
    const S = E(h), b = pe(h);
    let C = j(h), z = Le(C, m, i, r, n);
    if (g += z.candidateCount, !z.position) {
      const x = Ot(C, i);
      Q(C, x) || (n.push({
        code: "item-shrunk",
        level: b ? "warning" : "info",
        message: `Shrunk layout item "${h.i}" while searching for a repair position.`,
        itemId: h.i,
        before: E(C),
        after: E(x),
        reason: "repair-fit"
      }), C = x, z = Le(C, m, i, r, n), g += z.candidateCount);
    }
    if (!z.position) {
      p.push(h.i), n.push({
        code: "unresolved-item",
        level: "error",
        message: `Could not repair layout item "${h.i}" within current constraints.`,
        itemId: h.i,
        before: S,
        reason: "no-fit"
      });
      continue;
    }
    const y = j(C);
    y.x = z.position.x, y.y = z.position.y, y.moved = !1, z.fallback && (I = z.fallback), b && Q(h, y) && n.push({
      code: "static-preserved",
      level: "info",
      message: `Preserved static/locked layout item "${h.i}".`,
      itemId: h.i,
      before: S,
      after: E(y),
      reason: "repair-anchor"
    }), Q(h, y) || ((h.x !== y.x || h.y !== y.y) && k++, (h.w !== y.w || h.h !== y.h) && v++, b ? (w++, n.push({
      code: "forced-static-repair",
      level: "warning",
      message: `Repaired static/locked layout item "${h.i}" because it could not stay in place.`,
      itemId: h.i,
      before: S,
      after: E(y),
      reason: "static-invalid-or-colliding"
    })) : n.push({
      code: "item-moved",
      level: "info",
      message: `Moved layout item "${h.i}" during collision repair.`,
      itemId: h.i,
      before: S,
      after: E(y),
      reason: z.fallback || "repair"
    })), (h.x !== y.x || h.y !== y.y) && M++, m.push(y);
  }
  const H = Pt(m.concat(
    f.filter((h) => p.includes(h.i)).map(j)
  ), t), F = O(H), N = p.length > 0 || u && F.length > 0, P = {
    strategy: c === "custom" ? "heuristic" : c,
    fallback: I,
    objective: d,
    candidateCount: g,
    movedCount: k,
    resizedCount: v,
    clampedCount: M,
    forcedStaticRepairCount: w,
    unresolvedIds: p,
    durationMs: B() - a
  };
  return {
    status: N ? "blocked" : "ok",
    layout: H,
    collisions: F,
    details: n,
    summary: P,
    usedFallback: !1
  };
}, Lt = (e, t, i, o, s, n) => {
  var u, f, m, p, g, k, v, M, w, I, H, F, N, P;
  const a = o.customRepairSolver;
  if (!a) return null;
  const r = ge(o), c = {
    ...ne,
    ...r.objective || {}
  }, d = {
    layout: J(e),
    originalLayout: J(t),
    cols: i.cols,
    maxRows: i.maxRows,
    allowOverlap: !!i.allowOverlap,
    preventCollision: !!i.preventCollision,
    policy: {
      ...r,
      customRepairSolver: void 0
    },
    objective: c
  }, l = B();
  try {
    const h = a(d), S = B() - l;
    if (typeof o.customSolverBudgetMs == "number" && S > o.customSolverBudgetMs)
      return n.push({
        code: "custom-solver-fallback",
        level: "warning",
        message: "Custom repair solver exceeded its budget; falling back.",
        reason: "over-budget",
        details: { durationMs: S, budgetMs: o.customSolverBudgetMs }
      }), null;
    const b = J(h.layout), C = _t(
      b,
      t,
      i,
      !i.allowOverlap || i.preventCollision || s
    );
    if (!C.ok)
      return n.push({
        code: "custom-solver-fallback",
        level: "warning",
        message: "Custom repair solver returned an invalid layout; falling back.",
        reason: C.reason,
        details: { itemIds: C.itemIds }
      }), null;
    const z = O(b), y = {
      strategy: "custom",
      objective: c,
      candidateCount: (f = (u = h.summary) == null ? void 0 : u.candidateCount) != null ? f : 0,
      movedCount: (p = (m = h.summary) == null ? void 0 : m.movedCount) != null ? p : U(t, b, null).filter((x) => x.type === "move").length,
      resizedCount: (k = (g = h.summary) == null ? void 0 : g.resizedCount) != null ? k : U(t, b, null).filter((x) => x.type === "resize").length,
      clampedCount: (M = (v = h.summary) == null ? void 0 : v.clampedCount) != null ? M : 0,
      forcedStaticRepairCount: (I = (w = h.summary) == null ? void 0 : w.forcedStaticRepairCount) != null ? I : 0,
      unresolvedIds: (F = (H = h.summary) == null ? void 0 : H.unresolvedIds) != null ? F : [],
      score: (N = h.summary) == null ? void 0 : N.score,
      fallback: (P = h.summary) == null ? void 0 : P.fallback,
      durationMs: S
    };
    return h.diagnostics && n.push(...h.diagnostics), {
      status: "ok",
      layout: b,
      collisions: z,
      details: n,
      summary: y,
      usedFallback: !1
    };
  } catch (h) {
    return n.push({
      code: "custom-solver-fallback",
      level: "warning",
      message: "Custom repair solver failed; falling back.",
      reason: "throw",
      details: h instanceof Error ? h.message : String(h)
    }), null;
  }
}, re = (e, t, i, o = {}, s, n) => {
  const a = (d) => ({
    ...d,
    details: n,
    summary: Ht(d.summary, n)
  }), r = ge(o);
  if (r.strategy === "custom" || typeof r.customRepairSolver == "function") {
    const d = Lt(e, t, i, r, s, n);
    if (d) return a(d);
    if (r.fallback === "none") {
      const u = O(e);
      return a({
        status: "blocked",
        layout: e,
        collisions: u,
        details: n,
        usedFallback: !1,
        summary: {
          strategy: "custom",
          fallback: "none",
          objective: {
            ...ne,
            ...r.objective || {}
          },
          candidateCount: 0,
          movedCount: 0,
          resizedCount: 0,
          clampedCount: 0,
          forcedStaticRepairCount: 0,
          unresolvedIds: u.map((f) => f.i)
        }
      });
    }
    const l = $e(e, t, i, {
      ...r,
      strategy: r.fallback === "first-fit" || r.fallback === "nearest-fit" || r.fallback === "nearest-then-first" ? r.fallback : "heuristic"
    }, s, n);
    return l.usedFallback = !0, l.summary.fallback = l.summary.fallback || "heuristic", a(l);
  }
  return a($e(e, t, i, r, s, n));
}, ve = (e, t, i, o) => o ? "fallback" : i.length === 0 || Ke(e, t) ? "noop" : "changed";
function $t(e, t = B()) {
  const i = e.operation;
  if (i.type !== "migrateSettings")
    return V(e, "invalid migrateSettings operation", t, []);
  const o = ae(e.options), s = { ...e, options: o }, n = [], a = Oe(i.previousSettings, o.cols), r = Oe(i.nextSettings);
  if (!a.ok || !r.ok)
    return n.push({
      code: "settings-invalid",
      level: "error",
      message: "Layout migration settings must include valid positive columns.",
      reason: a.ok ? "next-cols" : "previous-cols"
    }), V(s, "invalid layout migration settings", t, n);
  const c = i.policy || {}, d = c.axis || "horizontal", l = c.rounding || "round", u = !zt(a.value, r.value), f = !u && Ft(i.previousSettings, i.nextSettings), m = r.value.cols / a.value.cols, p = {
    previousCols: a.value.cols,
    nextCols: r.value.cols,
    ratio: m,
    axis: d,
    rounding: l,
    geometryChanged: u,
    visualOnlyChange: f
  };
  if (!u) {
    f && n.push({
      code: "settings-visual-only",
      level: "info",
      message: "Settings change is visual-only; committed item geometry is unchanged.",
      reason: "visual-only"
    });
    const h = O(e.layout);
    if (h.length === 0 || !c.forceRepair)
      return _(s, "noop", e.layout, [], h, t, n, {
        migration: p
      });
  }
  n.push({
    code: "settings-ratio",
    level: "info",
    message: `Migrating layout columns from ${a.value.cols} to ${r.value.cols}.`,
    reason: d === "xy" ? "xy-ratio" : "horizontal-ratio",
    details: { ratio: m, rounding: l }
  });
  const g = {
    ...o,
    cols: r.value.cols,
    maxRows: typeof r.value.maxRows == "number" ? r.value.maxRows : o.maxRows
  }, k = u ? Nt(e.layout, m, d, l) : J(e.layout), v = we(
    k,
    g,
    n,
    c.sanitizeInvalidItems,
    "settings-migration"
  );
  if (!v.ok)
    return V(s, v.message, t, n);
  const M = O(v.layout);
  let w = v.layout, I = M, H, F = !1;
  if (M.length > 0 || c.forceRepair || u) {
    const h = re(
      v.layout,
      e.layout,
      g,
      c.repair,
      c.forceRepair === !0 || u,
      n
    );
    if (H = h.summary, F = h.usedFallback, h.status === "blocked")
      return D(
        s,
        h.collisions.length > 0 ? "collision" : "bounds",
        h.summary.unresolvedIds.length > 0 ? h.summary.unresolvedIds : h.collisions.map((S) => S.i),
        t,
        n,
        h.collisions,
        { migration: p, repair: H }
      );
    w = h.layout, I = h.collisions;
  }
  const N = U(e.layout, w, o.compactType), P = ve(e.layout, w, N, F);
  return _(s, P, P === "noop" ? e.layout : w, N, I, t, n, {
    migration: p,
    repair: H
  });
}
function Tt(e, t = B()) {
  var f, m, p;
  const i = e.operation;
  if (i.type !== "repairCollisions")
    return V(e, "invalid repairCollisions operation", t, []);
  const o = ae(e.options), s = { ...e, options: o }, n = [], a = we(
    e.layout,
    o,
    n,
    ((f = i.policy) == null ? void 0 : f.strategy) !== "custom",
    "repair"
  );
  if (!a.ok)
    return V(s, a.message, t, n);
  const r = !Ke(e.layout, a.layout);
  if (O(a.layout).length === 0 && !r && ((m = i.policy) == null ? void 0 : m.strategy) !== "custom" && !((p = i.policy) != null && p.customRepairSolver))
    return _(s, "noop", e.layout, [], [], t, n);
  const d = re(a.layout, e.layout, o, i.policy, !0, n);
  if (d.status === "blocked")
    return D(
      s,
      d.collisions.length > 0 ? "collision" : "bounds",
      d.summary.unresolvedIds.length > 0 ? d.summary.unresolvedIds : d.collisions.map((g) => g.i),
      t,
      n,
      d.collisions,
      { repair: d.summary }
    );
  const l = U(e.layout, d.layout, o.compactType), u = ve(e.layout, d.layout, l, d.usedFallback);
  return _(s, u, u === "noop" ? e.layout : d.layout, l, d.collisions, t, n, {
    repair: d.summary
  });
}
function jt(e, t = B()) {
  const i = e.operation;
  if (i.type !== "translateLayout")
    return V(e, "invalid translateLayout operation", t, []);
  const o = ae(e.options), s = { ...e, options: o }, n = [];
  if (!T(i.dx) || !T(i.dy))
    return n.push({
      code: "item-invalid",
      level: "error",
      message: "translateLayout dx/dy must be finite numbers.",
      reason: "invalid-delta"
    }), D(s, "invalid-input", [], t, n);
  let a = Math.round(i.dx), r = Math.round(i.dy);
  if (i.clampNegative !== !1 && e.layout.length > 0) {
    const m = Math.min(...e.layout.map((g) => g.x)), p = Math.min(...e.layout.map((g) => g.y));
    a + m < 0 && (a = -m), r + p < 0 && (r = -p);
  }
  if (a === 0 && r === 0)
    return _(s, "noop", e.layout, [], [], t, n);
  const c = e.layout.map((m) => ({
    ...j(m),
    x: m.x + a,
    y: m.y + r
  })), d = we(c, o, n, !0, "translate");
  if (!d.ok)
    return D(s, "invalid-input", d.itemIds, t, n);
  const l = re(d.layout, e.layout, o, i.policy, !0, n);
  if (l.status === "blocked")
    return D(
      s,
      l.collisions.length > 0 ? "collision" : "bounds",
      l.summary.unresolvedIds.length > 0 ? l.summary.unresolvedIds : l.collisions.map((m) => m.i),
      t,
      n,
      l.collisions,
      { repair: l.summary }
    );
  const u = U(e.layout, l.layout, o.compactType), f = ve(e.layout, l.layout, u, l.usedFallback);
  return _(s, f, f === "noop" ? e.layout : l.layout, u, l.collisions, t, n, {
    repair: l.summary
  });
}
const Dt = (e, t, i) => {
  var n, a;
  const o = e.target || { x: (n = e.item.x) != null ? n : 0, y: (a = e.item.y) != null ? a : 0 }, s = {
    ...e.item,
    i: e.item.i,
    x: o.x,
    y: o.y,
    w: e.item.w,
    h: e.item.h
  };
  return Je(s, t, i, {
    sanitizeInvalidItems: !0,
    reason: "placement"
  });
}, Gt = (e, t, i, o, s) => {
  const n = Ye(t, i), a = o.strategy || (o.target ? "target-first" : "first-fit");
  if (a === "append-after-bottom") {
    const c = { ...e, x: Math.max(0, Math.min(e.x, i.cols - e.w)), y: Math.ceil(Te(t)) };
    if (n.canPlace(c)) return { position: { x: c.x, y: c.y }, source: "append-after-bottom" };
  }
  if (a === "target-first" && o.target) {
    const c = {
      ...e,
      x: Math.max(0, Math.round(o.target.x)),
      y: Math.max(0, Math.round(o.target.y))
    };
    if (n.canPlace(c)) return { position: { x: c.x, y: c.y }, source: "target" };
    const d = n.findNearestFit({ w: e.w, h: e.h }, Qe(c));
    if (d)
      return s.push({
        code: "repair-fallback",
        level: "info",
        message: `Used nearest-fit placement fallback for item "${e.i}".`,
        itemId: e.i,
        reason: "target-blocked"
      }), { position: d, source: "nearest-fit" };
  }
  const r = n.findFirstFit({ w: e.w, h: e.h });
  return r ? { position: r, source: "first-fit" } : { position: null, source: "none" };
};
function Wt(e, t = B()) {
  var l, u;
  const i = e.operation;
  if (i.type !== "placeItems")
    return V(e, "invalid placeItems operation", t, []);
  const o = ae(e.options), s = { ...e, options: o }, n = [];
  let a = J(e.layout);
  const r = [];
  for (const f of i.items) {
    const m = Dt(f, o, n);
    if (!m.ok)
      return D(s, "invalid-input", m.itemId ? [m.itemId] : [], t, n);
    const p = a.filter((v) => v.i !== m.item.i), g = Gt(m.item, p, o, f, n);
    if (!g.position)
      return n.push({
        code: "unresolved-item",
        level: "error",
        message: `Could not place item "${m.item.i}" within current constraints.`,
        itemId: m.item.i,
        before: E(m.item),
        reason: "no-fit"
      }), D(s, "collision", [m.item.i], t, n);
    const k = {
      ...m.item,
      x: g.position.x,
      y: g.position.y,
      static: m.item.static === !0
    };
    n.push({
      code: "placement-source",
      level: "info",
      message: `Placed item "${k.i}" using ${g.source}.`,
      itemId: k.i,
      after: E(k),
      reason: g.source
    }), a = p.concat(k), r.push(k.i);
  }
  if ((l = i.policy) != null && l.strategy || (u = i.policy) != null && u.customRepairSolver) {
    const f = re(a, e.layout, o, i.policy, !0, n);
    if (f.status === "blocked")
      return D(
        s,
        "collision",
        f.summary.unresolvedIds.length > 0 ? f.summary.unresolvedIds : r,
        t,
        n,
        f.collisions,
        { repair: f.summary }
      );
    a = f.layout;
  }
  const c = O(a), d = U(e.layout, a, o.compactType);
  return _(s, d.length === 0 ? "noop" : "changed", a, d, c, t, n);
}
const le = (e, t, i, o) => ({
  id: o.id || `${t.type}-${Date.now().toString(36)}`,
  phase: o.phase || "commit",
  layout: e,
  operation: t,
  options: i,
  debug: o.debug
});
function Kt(e, t) {
  return $t(le(e, {
    type: "migrateSettings",
    previousSettings: t.previousSettings,
    nextSettings: t.nextSettings,
    policy: t.policy
  }, t.engineOptions, t));
}
function Yt(e, t) {
  return Tt(le(e, {
    type: "repairCollisions",
    policy: t.policy
  }, t.engineOptions, t));
}
function Zt(e, t) {
  return jt(le(e, {
    type: "translateLayout",
    dx: t.dx,
    dy: t.dy,
    clampNegative: t.clampNegative,
    policy: t.policy
  }, t.engineOptions, t));
}
function Jt(e, t) {
  return Wt(le(e, {
    type: "placeItems",
    items: t.items,
    policy: t.policy
  }, t.engineOptions, t));
}
export {
  Wt as a,
  Tt as b,
  jt as c,
  he as d,
  $t as e,
  Xt as f,
  q as g,
  yt as h,
  ct as i,
  Ut as j,
  Xe as k,
  Kt as m,
  ce as n,
  Jt as p,
  Yt as r,
  Zt as t
};
