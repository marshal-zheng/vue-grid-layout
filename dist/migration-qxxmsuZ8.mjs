import { n as ct, m as ut, k as St, b as xt, l as Ft, e as wt, a as H, d as T } from "./utils-BCVYGne6.mjs";
const tt = "__layout_engine_fit__", E = (t) => typeof t == "number" && Number.isFinite(t), et = (t) => E(t.x) && E(t.y) && E(t.w) && E(t.h) && t.w > 0 && t.h > 0, j = (t) => {
  const e = Math.floor(t);
  return Number.isFinite(e) && e > 0 ? e : null;
};
class Bt {
  constructor(e, o) {
    this.options = o, this.name = "row-column-occupancy", this.layout = [], this.rows = /* @__PURE__ */ new Map(), this.columns = /* @__PURE__ */ new Map(), this.orderById = /* @__PURE__ */ new Map(), this.itemById = /* @__PURE__ */ new Map(), this.rebuild(e);
  }
  rebuild(e) {
    this.layout = e.slice(0), this.rows.clear(), this.columns.clear(), this.orderById = /* @__PURE__ */ new Map(), this.itemById = /* @__PURE__ */ new Map();
    for (let o = 0; o < this.layout.length; o++) {
      const n = this.layout[o];
      this.orderById.set(n.i, o), this.itemById.set(n.i, n), this.addToBuckets(n);
    }
  }
  getLayout() {
    return this.layout.slice(0);
  }
  queryFirstCollision(e) {
    if (!et(e)) return ct(this.layout, e);
    const o = this.queryCollisionCandidates(e);
    return o === null ? ct(this.layout, e) : o.length > 0 ? o[0] : void 0;
  }
  queryAllCollisions(e) {
    if (!et(e)) return ut(this.layout, e);
    const o = this.queryCollisionCandidates(e);
    return o === null ? ut(this.layout, e) : o;
  }
  canPlace(e) {
    if (!et(e)) return !1;
    const o = j(this.options.cols);
    return !o || e.x < 0 || e.y < 0 || e.x + e.w > o || Number.isFinite(this.options.maxRows) && e.y + e.h > Math.floor(this.options.maxRows) ? !1 : this.queryFirstCollision(e) == null;
  }
  findFirstFit(e) {
    const o = j(e.w), n = j(e.h), s = j(this.options.cols), i = Number.isFinite(this.options.maxRows) ? Math.floor(this.options.maxRows) : 1 / 0;
    if (!o || !n || !s || o > s)
      return St(this.layout, e, this.options.cols, this.options.maxRows);
    if (Number.isFinite(i) && n > i) return null;
    let a = Math.max(0, Math.ceil(xt(this.layout)));
    if (Number.isFinite(i) && (a = Math.min(a, i - n)), a < 0) return null;
    for (let r = 0; r <= a; r++)
      for (let d = 0; d <= s - o; d++) {
        const u = { i: tt, x: d, y: r, w: o, h: n };
        if (this.canPlace(u)) return { x: d, y: r };
      }
    return null;
  }
  findNearestFit(e, o) {
    const n = j(e.w), s = j(e.h), i = j(this.options.cols);
    if (!n || !s || !i || !Number.isFinite(o.x) || !Number.isFinite(o.y) || n > i)
      return Ft(
        this.layout,
        e,
        this.options.cols,
        o.x,
        o.y,
        this.options.maxRows
      );
    if (this.layout.length === 0) {
      const u = Math.max(0, Math.min(Math.round(o.x), i - n)), l = Math.max(0, Math.round(o.y)), c = { i: tt, x: u, y: l, w: n, h: s };
      return this.canPlace(c) ? { x: u, y: l } : this.findFirstFit(e);
    }
    const a = (u, l) => {
      const c = u + n / 2, y = l + s / 2, m = c - o.x, h = y - o.y;
      return m * m + h * h;
    }, r = [], d = /* @__PURE__ */ new Set();
    for (let u = 0; u < this.layout.length; u++) {
      const l = this.layout[u], c = [
        { x: l.x - n, y: l.y },
        { x: l.x + l.w, y: l.y },
        { x: l.x, y: l.y - s },
        { x: l.x, y: l.y + l.h },
        { x: l.x - n, y: l.y - s },
        { x: l.x + l.w, y: l.y - s },
        { x: l.x - n, y: l.y + l.h },
        { x: l.x + l.w, y: l.y + l.h }
      ];
      for (let y = 0; y < c.length; y++) {
        const m = c[y], h = `${m.x}:${m.y}`;
        if (d.has(h)) continue;
        d.add(h);
        const p = { i: tt, x: m.x, y: m.y, w: n, h: s };
        this.canPlace(p) && r.push({
          x: m.x,
          y: m.y,
          dist: a(m.x, m.y),
          order: u * c.length + y
        });
      }
    }
    return r.length === 0 ? this.findFirstFit(e) : (r.sort((u, l) => u.dist !== l.dist ? u.dist - l.dist : u.y !== l.y ? u.y - l.y : u.x !== l.x ? u.x - l.x : u.order - l.order), { x: r[0].x, y: r[0].y });
  }
  insert(e) {
    const o = this.itemById.get(e.i);
    if (o) {
      this.update(o, e);
      return;
    }
    this.layout.push(e), this.orderById.set(e.i, this.layout.length - 1), this.itemById.set(e.i, e), this.addToBuckets(e);
  }
  remove(e) {
    const o = this.itemById.get(e);
    o && (this.removeFromBuckets(o), this.layout = this.layout.filter((n) => n.i !== e), this.rebuildOrder());
  }
  update(e, o) {
    const n = this.orderById.get(e.i);
    if (typeof n != "number") {
      this.insert(o);
      return;
    }
    this.removeFromBuckets(e), this.layout[n] = o, e.i !== o.i && (this.itemById.delete(e.i), this.orderById.delete(e.i)), this.orderById.set(o.i, n), this.itemById.set(o.i, o), this.addToBuckets(o);
  }
  queryCollisionCandidates(e) {
    const o = this.getRowRange(e);
    if (!o) return null;
    const n = /* @__PURE__ */ new Set();
    for (let i = o.start; i <= o.end; i++) {
      const a = this.rows.get(i);
      if (a)
        for (let r = 0; r < a.length; r++) n.add(a[r]);
    }
    const s = [];
    return n.forEach((i) => {
      const a = this.itemById.get(i);
      a && wt(a, e) && s.push(a);
    }), s.sort((i, a) => {
      const r = this.orderById.get(i.i), d = this.orderById.get(a.i);
      return (typeof r == "number" ? r : 1 / 0) - (typeof d == "number" ? d : 1 / 0);
    }), s;
  }
  addToBuckets(e) {
    this.addToAxisBuckets(this.rows, e.i, this.getRowRange(e)), this.addToAxisBuckets(this.columns, e.i, this.getColumnRange(e));
  }
  removeFromBuckets(e) {
    this.removeFromAxisBuckets(this.rows, e.i, this.getRowRange(e)), this.removeFromAxisBuckets(this.columns, e.i, this.getColumnRange(e));
  }
  addToAxisBuckets(e, o, n) {
    if (n)
      for (let s = n.start; s <= n.end; s++) {
        let i = e.get(s);
        i || (i = [], e.set(s, i)), i.push(o);
      }
  }
  removeFromAxisBuckets(e, o, n) {
    if (n)
      for (let s = n.start; s <= n.end; s++) {
        const i = e.get(s);
        if (!i) continue;
        const a = i.filter((r) => r !== o);
        a.length === 0 ? e.delete(s) : e.set(s, a);
      }
  }
  getRowRange(e) {
    if (!E(e.y) || !E(e.h) || e.h <= 0) return null;
    const o = Math.floor(e.y), n = Math.max(o, Math.floor(e.y + e.h - 1));
    return { start: o, end: n };
  }
  getColumnRange(e) {
    if (!E(e.x) || !E(e.w) || e.w <= 0) return null;
    const o = Math.floor(e.x), n = Math.max(o, Math.floor(e.x + e.w - 1));
    return { start: o, end: n };
  }
  rebuildOrder() {
    this.orderById = /* @__PURE__ */ new Map(), this.itemById = /* @__PURE__ */ new Map();
    for (let e = 0; e < this.layout.length; e++) {
      const o = this.layout[e];
      this.orderById.set(o.i, e), this.itemById.set(o.i, o);
    }
  }
}
function vt() {
  return {
    name: "row-column-occupancy",
    build(t, e) {
      return new Bt(t, e);
    }
  };
}
const Nt = 1 / 0, J = {
  minimizeMovement: 1,
  minimizeResize: 1,
  preserveOrder: 1,
  preserveStatic: 1,
  preserveGroups: 0
}, R = () => {
  const t = typeof performance != "undefined" ? performance : null;
  return t && typeof t.now == "function" ? t.now() : Date.now();
}, Q = (t) => ({
  ...t,
  maxRows: typeof t.maxRows == "number" ? t.maxRows : Nt,
  allowOverlap: !!t.allowOverlap,
  preventCollision: !!t.preventCollision,
  indexStrategy: t.indexStrategy || vt()
}), L = (t) => typeof t == "number" && Number.isFinite(t), zt = (t) => L(t) && t > 0, D = (t) => {
  if (!zt(t)) return null;
  const e = Math.floor(t);
  return e > 0 ? e : null;
}, V = (t) => L(t) ? Math.round(t) : null, dt = (t, e, o) => Math.max(e, Math.min(t, o)), v = (t) => ({
  x: t.x,
  y: t.y,
  w: t.w,
  h: t.h
}), U = (t, e) => t.x === e.x && t.y === e.y && t.w === e.w && t.h === e.h, kt = (t) => t.static === !0 || t.isDraggable === !1, mt = (t) => `${t.x}:${t.y}:${t.w}:${t.h}:${!!t.moved}`, bt = (t, e) => {
  if (t === e) return !0;
  if (t.length !== e.length) return !1;
  for (let o = 0; o < t.length; o++) {
    const n = t[o], s = e[o];
    if (!n || !s || n.i !== s.i || mt(n) !== mt(s)) return !1;
  }
  return !0;
}, X = (t, e, o) => {
  const n = [], s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  return t.forEach((a) => s.set(a.i, a)), e.forEach((a) => i.set(a.i, a)), e.forEach((a) => {
    const r = s.get(a.i);
    if (!r) {
      n.push({ type: "add", item: T(a) });
      return;
    }
    U(r, a) || (r.w !== a.w || r.h !== a.h ? n.push({
      type: "resize",
      id: a.i,
      from: { w: r.w, h: r.h, x: r.x, y: r.y },
      to: { w: a.w, h: a.h, x: a.x, y: a.y }
    }) : n.push({
      type: "move",
      id: a.i,
      from: { x: r.x, y: r.y },
      to: { x: a.x, y: a.y }
    }));
  }), t.forEach((a) => {
    i.has(a.i) || n.push({ type: "remove", id: a.i });
  }), o && n.length > 1 && n.push({
    type: "compact",
    affectedIds: n.map((a) => a.type === "add" ? a.item.i : a.type === "compact" ? "" : a.id).filter(Boolean)
  }), n;
}, ot = (t, e) => {
  const o = /* @__PURE__ */ new Set();
  return t.forEach((n) => {
    n.type === "compact" ? n.affectedIds.forEach((s) => o.add(s)) : n.type === "add" ? o.add(n.item.i) : o.add(n.id);
  }), e.forEach((n) => o.add(n.i)), Array.from(o);
}, N = (t) => {
  const e = /* @__PURE__ */ new Set(), o = [];
  for (let n = 0; n < t.length; n++)
    for (let s = n + 1; s < t.length; s++)
      wt(t[n], t[s]) && (e.has(t[n].i) || (e.add(t[n].i), o.push(t[n])), e.has(t[s].i) || (e.add(t[s].i), o.push(t[s])));
  return o;
}, It = (t, e) => (e.indexStrategy || vt()).build(t, {
  cols: e.cols,
  maxRows: e.maxRows,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), $t = (t) => {
  if (t.debug) return !0;
  const e = t.options.diagnostics;
  return typeof e == "object" && e.debug === !0;
}, Et = (t, e, o, n, s, i, a, r, d) => {
  var c, y;
  const u = R() - s, l = {
    operationId: t.id,
    operationType: t.operation.type,
    phase: t.phase,
    layoutSize: t.layout.length,
    affectedCount: ot(o, n).length,
    collisionCount: n.length,
    indexHit: !0,
    schedulerMode: (c = t.options.scheduler) == null ? void 0 : c.mode,
    executorKind: ((y = t.options.executor) == null ? void 0 : y.kind) || "main-thread",
    durationMs: u,
    computeMs: u,
    details: a.length > 0 ? a.slice() : void 0
  };
  return $t(t) && (l.debug = {
    cols: t.options.cols,
    maxRows: t.options.maxRows,
    compactType: t.options.compactType,
    allowOverlap: t.options.allowOverlap,
    preventCollision: t.options.preventCollision,
    operation: t.operation,
    result: {
      status: e,
      affectedIds: ot(o, n),
      collisionIds: n.map((m) => m.i),
      blockedReason: i,
      migration: r,
      repair: d,
      details: a.slice()
    }
  }), l;
}, z = (t, e, o, n, s, i, a, r = {}) => {
  var d;
  return {
    id: t.id,
    status: e,
    layout: o,
    patches: n,
    affectedIds: ot(n, s),
    collisions: s,
    diagnostics: Et(
      t,
      e,
      n,
      s,
      i,
      (d = r.blocked) == null ? void 0 : d.reason,
      a,
      r.migration,
      r.repair
    ),
    ...r
  };
}, G = (t, e, o, n, s) => z(t, "error", t.layout, [], [], o, n, {
  blocked: { reason: "invalid-input", itemIds: [] },
  error: { message: e, cause: s }
}), A = (t, e, o, n, s, i = [], a = {}) => z(t, "blocked", t.layout, [], i, n, s, {
  ...a,
  blocked: { reason: e, itemIds: o }
}), Lt = (t, e) => {
  var i;
  const o = (i = t.cols) != null ? i : t.columns, n = D(o);
  if (n) return { ok: !0, value: n, source: "input" };
  const s = D(e);
  return s && o == null ? { ok: !0, value: s, source: "fallback" } : { ok: !1 };
}, ft = (t) => {
  const e = D(t);
  return e == null ? void 0 : e;
}, yt = (t, e) => {
  const o = Lt(t, e);
  return o.ok ? {
    ok: !0,
    value: {
      cols: o.value,
      minColumns: ft(t.minColumns),
      maxRows: ft(t.maxRows)
    }
  } : { ok: !1 };
}, Tt = (t, e) => t.cols === e.cols && t.minColumns === e.minColumns && t.maxRows === e.maxRows, ht = /* @__PURE__ */ new Set(["cols", "columns", "minColumns", "maxRows"]), K = (t) => {
  if (t == null || typeof t != "object") return String(t);
  if (Array.isArray(t)) return `[${t.map(K).join(",")}]`;
  const e = t;
  return `{${Object.keys(e).sort().map((o) => `${o}:${K(e[o])}`).join(",")}}`;
}, At = (t, e) => {
  const o = /* @__PURE__ */ new Set();
  Object.keys(t).forEach((s) => {
    ht.has(s) || o.add(s);
  }), Object.keys(e).forEach((s) => {
    ht.has(s) || o.add(s);
  });
  const n = Array.from(o);
  for (let s = 0; s < n.length; s++) {
    const i = n[s];
    if (K(t[i]) !== K(e[i])) return !0;
  }
  return !1;
}, st = (t) => ({
  strategy: "heuristic",
  fallback: "heuristic",
  ...t,
  objective: {
    ...J,
    ...(t == null ? void 0 : t.objective) || {}
  }
}), Ot = [
  "none",
  "first-fit",
  "nearest-fit",
  "nearest-then-first",
  "heuristic",
  "custom"
], Pt = (t) => typeof t == "string" && Ot.indexOf(t) !== -1, W = (t, e) => {
  const o = /* @__PURE__ */ new Set();
  return t.forEach((n, s) => {
    n.code === e && o.add(n.itemId || `${e}:${s}`);
  }), o.size;
}, _t = (t, e) => ({
  ...t,
  clampedCount: Math.max(t.clampedCount, W(e, "item-clamped")),
  resizedCount: Math.max(
    t.resizedCount,
    W(e, "item-shrunk") + W(e, "item-expanded")
  ),
  forcedStaticRepairCount: Math.max(
    t.forcedStaticRepairCount,
    W(e, "forced-static-repair")
  )
}), Ct = (t, e) => {
  const o = (t == null ? void 0 : t.strategy) || "heuristic";
  return Pt(o) ? o : (e == null || e.push({
    code: "policy-unsupported",
    level: "warning",
    message: `Unsupported repair strategy "${String(o)}"; falling back to heuristic.`,
    reason: "unsupported-strategy"
  }), "heuristic");
}, it = (t, e) => {
  const o = D(t.minW) || 1, n = Math.max(1, Math.min(o, e)), s = D(t.maxW) || e, i = Math.max(n, Math.min(s, e));
  return { min: n, max: i };
}, rt = (t, e) => {
  const o = D(t.minH) || 1, n = Number.isFinite(e) ? Math.floor(e) : 1 / 0, s = Number.isFinite(n) ? Math.max(1, Math.min(o, n)) : o, i = D(t.maxH) || n, a = Number.isFinite(n) ? Math.max(s, Math.min(i, n)) : Math.max(s, i);
  return { min: s, max: a };
}, Mt = (t, e, o, n = {}) => {
  var y, m, h, p;
  const s = typeof t.i == "string" ? t.i.trim() : "", i = !s || !L(t.x) || !L(t.y) || !L(t.w) || !L(t.h) || t.w <= 0 || t.h <= 0;
  if (i && !n.sanitizeInvalidItems)
    return o.push({
      code: "item-invalid",
      level: "error",
      message: `Layout item "${s || "(missing)"}" has invalid geometry.`,
      itemId: s || void 0,
      reason: n.reason || "strict-invalid-geometry"
    }), { ok: !1, itemId: s || void 0, message: "invalid layout item geometry" };
  if (!s)
    return o.push({
      code: "item-skipped",
      level: "warning",
      message: "Skipped layout item with missing id.",
      reason: "missing-id"
    }), { ok: !1, message: "missing layout item id" };
  const a = v(t), r = T({
    ...t,
    i: s,
    x: (y = V(t.x)) != null ? y : 0,
    y: (m = V(t.y)) != null ? m : 0,
    w: (h = V(t.w)) != null ? h : 1,
    h: (p = V(t.h)) != null ? p : 1
  }), d = Math.max(1, Math.floor(e.cols)), u = Number.isFinite(e.maxRows) ? Math.floor(e.maxRows) : 1 / 0, l = it(r, d), c = rt(r, u);
  return r.w = dt(r.w, l.min, l.max), r.h = dt(r.h, c.min, c.max), r.x < 0 && (r.x = 0), r.y < 0 && (r.y = 0), r.x + r.w > d && (r.x = Math.max(0, d - r.w)), Number.isFinite(u) && r.y + r.h > u && (r.y = Math.max(0, u - r.h)), i && o.push({
    code: "item-sanitized",
    level: "warning",
    message: `Sanitized invalid layout item "${s}".`,
    itemId: s,
    before: a,
    after: v(r),
    reason: n.reason || "sanitize-invalid-geometry"
  }), r.w < a.w || r.h < a.h ? o.push({
    code: "item-shrunk",
    level: "info",
    message: `Shrunk layout item "${s}" to fit constraints.`,
    itemId: s,
    before: a,
    after: v(r),
    reason: n.reason || "constraints"
  }) : (r.w > a.w || r.h > a.h) && o.push({
    code: "item-expanded",
    level: "info",
    message: `Expanded layout item "${s}" to meet constraints.`,
    itemId: s,
    before: a,
    after: v(r),
    reason: n.reason || "constraints"
  }), (r.x !== a.x || r.y !== a.y) && o.push({
    code: "item-clamped",
    level: "info",
    message: `Clamped layout item "${s}" into bounds.`,
    itemId: s,
    before: a,
    after: v(r),
    reason: n.reason || "bounds"
  }), kt(t) && !U(t, r) && o.push({
    code: "forced-static-repair",
    level: "warning",
    message: `Repaired static/locked layout item "${s}" because it violated bounds or constraints.`,
    itemId: s,
    before: a,
    after: v(r),
    reason: n.reason || "static-bounds-or-constraints"
  }), r.moved = !1, { ok: !0, item: r };
}, at = (t, e, o, n, s) => {
  const i = [], a = [];
  for (const r of t) {
    const d = Mt(r, e, o, {
      sanitizeInvalidItems: n,
      reason: s
    });
    if (!d.ok) {
      if (d.itemId && a.push(d.itemId), !n) return { ok: !1, itemIds: a, message: d.message };
      continue;
    }
    i.push(d.item);
  }
  return { ok: !0, layout: i };
}, Y = (t, e, o) => Math.round(t * e), jt = (t, e, o, n) => t.map((s) => {
  const i = T(s);
  return i.x = Y(s.x, e, n), i.w = Y(s.w, e, n), o === "xy" && (i.y = Y(s.y, e, n), i.h = Y(s.h, e, n)), i;
}), Gt = (t, e) => {
  const o = /* @__PURE__ */ new Map();
  return e.forEach((n, s) => o.set(n.i, s)), t.slice().sort((n, s) => {
    var r, d;
    const i = (r = o.get(n.i)) != null ? r : Number.MAX_SAFE_INTEGER, a = (d = o.get(s.i)) != null ? d : Number.MAX_SAFE_INTEGER;
    return i !== a ? i - a : n.i < s.i ? -1 : n.i > s.i ? 1 : 0;
  });
}, nt = (t) => kt(t), Dt = (t, e) => {
  const o = /* @__PURE__ */ new Map();
  return e.forEach((n, s) => o.set(n.i, { index: s, x: n.x, y: n.y })), t.slice().sort((n, s) => {
    var p, x, w, I, k, C;
    const i = nt(n) ? 0 : 1, a = nt(s) ? 0 : 1;
    if (i !== a) return i - a;
    const r = o.get(n.i), d = o.get(s.i), u = (p = r == null ? void 0 : r.y) != null ? p : n.y, l = (x = d == null ? void 0 : d.y) != null ? x : s.y;
    if (u !== l) return u - l;
    const c = (w = r == null ? void 0 : r.x) != null ? w : n.x, y = (I = d == null ? void 0 : d.x) != null ? I : s.x;
    if (c !== y) return c - y;
    if (n.y !== s.y) return n.y - s.y;
    if (n.x !== s.x) return n.x - s.x;
    const m = (k = r == null ? void 0 : r.index) != null ? k : Number.MAX_SAFE_INTEGER, h = (C = d == null ? void 0 : d.index) != null ? C : Number.MAX_SAFE_INTEGER;
    return m !== h ? m - h : n.i < s.i ? -1 : n.i > s.i ? 1 : 0;
  });
}, Rt = (t) => ({
  x: t.x + t.w / 2,
  y: t.y + t.h / 2
}), pt = (t, e, o, n, s) => {
  const i = It(e, o), a = Ct(n, s);
  let r = 0;
  if (i.canPlace(t))
    return { item: t, position: { x: t.x, y: t.y }, candidateCount: 1 };
  i.queryAllCollisions(t).length > 0 && s.push({
    code: "collision-detected",
    level: "warning",
    message: `Layout item "${t.i}" collides with placed items.`,
    itemId: t.i,
    before: v(t),
    reason: "repair"
  });
  const u = a === "nearest-fit" || a === "nearest-then-first" || a === "heuristic" || a === "custom", l = a === "first-fit" || a === "nearest-then-first" || a === "heuristic" || a === "custom";
  if (u) {
    r++;
    const c = i.findNearestFit({ w: t.w, h: t.h }, Rt(t));
    if (c) return { item: t, position: c, fallback: "nearest-fit", candidateCount: r };
  }
  if (l) {
    r++;
    const c = i.findFirstFit({ w: t.w, h: t.h });
    if (c)
      return u && s.push({
        code: "repair-fallback",
        level: "info",
        message: `Fell back to first-fit for layout item "${t.i}".`,
        itemId: t.i,
        before: v(t),
        reason: "nearest-fit-empty"
      }), { item: t, position: c, fallback: u ? "first-fit" : void 0, candidateCount: r };
  }
  return { item: t, position: null, candidateCount: r };
}, Xt = (t, e) => {
  const o = T(t), n = it(o, Math.max(1, Math.floor(e.cols))), s = rt(o, e.maxRows);
  o.w = n.min, o.h = s.min, o.x + o.w > e.cols && (o.x = Math.max(0, e.cols - o.w));
  const i = Number.isFinite(e.maxRows) ? Math.floor(e.maxRows) : 1 / 0;
  return Number.isFinite(i) && o.y + o.h > i && (o.y = Math.max(0, i - o.h)), o;
}, Ht = (t, e, o, n) => {
  const s = e.map((c) => c.i).sort(), i = t.map((c) => c.i).sort();
  if (s.length !== i.length || s.some((c, y) => c !== i[y]))
    return { ok: !1, reason: "id-set", itemIds: [], collisions: [] };
  const a = /* @__PURE__ */ new Set(), r = [], d = Math.floor(o.cols), u = Number.isFinite(o.maxRows) ? Math.floor(o.maxRows) : 1 / 0;
  for (const c of t) {
    if (a.has(c.i) && r.push(c.i), a.add(c.i), !Number.isInteger(c.x) || !Number.isInteger(c.y) || !Number.isInteger(c.w) || !Number.isInteger(c.h) || c.x < 0 || c.y < 0 || c.w <= 0 || c.h <= 0 || c.x + c.w > d || Number.isFinite(u) && c.y + c.h > u) {
      r.push(c.i);
      continue;
    }
    const y = it(c, d), m = rt(c, u);
    (c.w < y.min || c.w > y.max) && r.push(c.i), (c.h < m.min || c.h > m.max) && r.push(c.i);
  }
  const l = N(t);
  return r.length > 0 ? { ok: !1, reason: "geometry", itemIds: Array.from(new Set(r)), collisions: l } : n && l.length > 0 ? { ok: !1, reason: "collision", itemIds: l.map((c) => c.i), collisions: l } : { ok: !0 };
}, gt = (t, e, o, n = {}, s, i) => {
  const a = R(), r = st(n), d = Ct(r, i), u = {
    ...J,
    ...r.objective || {}
  }, l = N(t), c = !o.allowOverlap || o.preventCollision || s;
  if (o.allowOverlap && !s && !o.preventCollision && d !== "custom")
    return l.length > 0 && i.push({
      code: "collision-detected",
      level: "info",
      message: "allowOverlap is enabled; collisions were preserved.",
      reason: "allow-overlap"
    }), {
      status: "ok",
      layout: t,
      collisions: l,
      details: i,
      usedFallback: !1,
      summary: {
        strategy: d,
        objective: u,
        candidateCount: 0,
        movedCount: 0,
        resizedCount: 0,
        clampedCount: 0,
        forcedStaticRepairCount: 0,
        unresolvedIds: [],
        durationMs: R() - a
      }
    };
  if (d === "none")
    return {
      status: c && l.length > 0 ? "blocked" : "ok",
      layout: t,
      collisions: l,
      details: i,
      usedFallback: !1,
      summary: {
        strategy: d,
        objective: u,
        candidateCount: 0,
        movedCount: 0,
        resizedCount: 0,
        clampedCount: 0,
        forcedStaticRepairCount: 0,
        unresolvedIds: l.map((f) => f.i),
        durationMs: R() - a
      }
    };
  const y = Dt(t, e), m = [], h = [];
  let p = 0, x = 0, w = 0, I = 0, k = 0, C;
  for (const f of y) {
    const S = v(f), B = nt(f);
    let M = T(f), b = pt(M, m, o, r, i);
    if (p += b.candidateCount, !b.position) {
      const _ = Xt(M, o);
      U(M, _) || (i.push({
        code: "item-shrunk",
        level: B ? "warning" : "info",
        message: `Shrunk layout item "${f.i}" while searching for a repair position.`,
        itemId: f.i,
        before: v(M),
        after: v(_),
        reason: "repair-fit"
      }), M = _, b = pt(M, m, o, r, i), p += b.candidateCount);
    }
    if (!b.position) {
      h.push(f.i), i.push({
        code: "unresolved-item",
        level: "error",
        message: `Could not repair layout item "${f.i}" within current constraints.`,
        itemId: f.i,
        before: S,
        reason: "no-fit"
      });
      continue;
    }
    const g = T(M);
    g.x = b.position.x, g.y = b.position.y, g.moved = !1, b.fallback && (C = b.fallback), B && U(f, g) && i.push({
      code: "static-preserved",
      level: "info",
      message: `Preserved static/locked layout item "${f.i}".`,
      itemId: f.i,
      before: S,
      after: v(g),
      reason: "repair-anchor"
    }), U(f, g) || ((f.x !== g.x || f.y !== g.y) && x++, (f.w !== g.w || f.h !== g.h) && w++, B ? (k++, i.push({
      code: "forced-static-repair",
      level: "warning",
      message: `Repaired static/locked layout item "${f.i}" because it could not stay in place.`,
      itemId: f.i,
      before: S,
      after: v(g),
      reason: "static-invalid-or-colliding"
    })) : i.push({
      code: "item-moved",
      level: "info",
      message: `Moved layout item "${f.i}" during collision repair.`,
      itemId: f.i,
      before: S,
      after: v(g),
      reason: b.fallback || "repair"
    })), (f.x !== g.x || f.y !== g.y) && I++, m.push(g);
  }
  const F = Gt(m.concat(
    y.filter((f) => h.includes(f.i)).map(T)
  ), e), $ = N(F), O = h.length > 0 || c && $.length > 0, P = {
    strategy: d === "custom" ? "heuristic" : d,
    fallback: C,
    objective: u,
    candidateCount: p,
    movedCount: x,
    resizedCount: w,
    clampedCount: I,
    forcedStaticRepairCount: k,
    unresolvedIds: h,
    durationMs: R() - a
  };
  return {
    status: O ? "blocked" : "ok",
    layout: F,
    collisions: $,
    details: i,
    summary: P,
    usedFallback: !1
  };
}, Ut = (t, e, o, n, s, i) => {
  var c, y, m, h, p, x, w, I, k, C, F, $, O, P;
  const a = n.customRepairSolver;
  if (!a) return null;
  const r = st(n), d = {
    ...J,
    ...r.objective || {}
  }, u = {
    layout: H(t),
    originalLayout: H(e),
    cols: o.cols,
    maxRows: o.maxRows,
    allowOverlap: !!o.allowOverlap,
    preventCollision: !!o.preventCollision,
    policy: {
      ...r,
      customRepairSolver: void 0
    },
    objective: d
  }, l = R();
  try {
    const f = a(u), S = R() - l;
    if (typeof n.customSolverBudgetMs == "number" && S > n.customSolverBudgetMs)
      return i.push({
        code: "custom-solver-fallback",
        level: "warning",
        message: "Custom repair solver exceeded its budget; falling back.",
        reason: "over-budget",
        details: { durationMs: S, budgetMs: n.customSolverBudgetMs }
      }), null;
    const B = H(f.layout), M = Ht(
      B,
      e,
      o,
      !o.allowOverlap || o.preventCollision || s
    );
    if (!M.ok)
      return i.push({
        code: "custom-solver-fallback",
        level: "warning",
        message: "Custom repair solver returned an invalid layout; falling back.",
        reason: M.reason,
        details: { itemIds: M.itemIds }
      }), null;
    const b = N(B), g = {
      strategy: "custom",
      objective: d,
      candidateCount: (y = (c = f.summary) == null ? void 0 : c.candidateCount) != null ? y : 0,
      movedCount: (h = (m = f.summary) == null ? void 0 : m.movedCount) != null ? h : X(e, B, null).filter((_) => _.type === "move").length,
      resizedCount: (x = (p = f.summary) == null ? void 0 : p.resizedCount) != null ? x : X(e, B, null).filter((_) => _.type === "resize").length,
      clampedCount: (I = (w = f.summary) == null ? void 0 : w.clampedCount) != null ? I : 0,
      forcedStaticRepairCount: (C = (k = f.summary) == null ? void 0 : k.forcedStaticRepairCount) != null ? C : 0,
      unresolvedIds: ($ = (F = f.summary) == null ? void 0 : F.unresolvedIds) != null ? $ : [],
      score: (O = f.summary) == null ? void 0 : O.score,
      fallback: (P = f.summary) == null ? void 0 : P.fallback,
      durationMs: S
    };
    return f.diagnostics && i.push(...f.diagnostics), {
      status: "ok",
      layout: B,
      collisions: b,
      details: i,
      summary: g,
      usedFallback: !1
    };
  } catch (f) {
    return i.push({
      code: "custom-solver-fallback",
      level: "warning",
      message: "Custom repair solver failed; falling back.",
      reason: "throw",
      details: f instanceof Error ? f.message : String(f)
    }), null;
  }
}, Z = (t, e, o, n = {}, s, i) => {
  const a = (u) => ({
    ...u,
    details: i,
    summary: _t(u.summary, i)
  }), r = st(n);
  if (r.strategy === "custom" || typeof r.customRepairSolver == "function") {
    const u = Ut(t, e, o, r, s, i);
    if (u) return a(u);
    if (r.fallback === "none") {
      const c = N(t);
      return a({
        status: "blocked",
        layout: t,
        collisions: c,
        details: i,
        usedFallback: !1,
        summary: {
          strategy: "custom",
          fallback: "none",
          objective: {
            ...J,
            ...r.objective || {}
          },
          candidateCount: 0,
          movedCount: 0,
          resizedCount: 0,
          clampedCount: 0,
          forcedStaticRepairCount: 0,
          unresolvedIds: c.map((y) => y.i)
        }
      });
    }
    const l = gt(t, e, o, {
      ...r,
      strategy: r.fallback === "first-fit" || r.fallback === "nearest-fit" || r.fallback === "nearest-then-first" ? r.fallback : "heuristic"
    }, s, i);
    return l.usedFallback = !0, l.summary.fallback = l.summary.fallback || "heuristic", a(l);
  }
  return a(gt(t, e, o, r, s, i));
}, lt = (t, e, o, n) => n ? "fallback" : o.length === 0 || bt(t, e) ? "noop" : "changed";
function Vt(t, e = R()) {
  const o = t.operation;
  if (o.type !== "migrateSettings")
    return G(t, "invalid migrateSettings operation", e, []);
  const n = Q(t.options), s = { ...t, options: n }, i = [], a = yt(o.previousSettings, n.cols), r = yt(o.nextSettings);
  if (!a.ok || !r.ok)
    return i.push({
      code: "settings-invalid",
      level: "error",
      message: "Layout migration settings must include valid positive columns.",
      reason: a.ok ? "next-cols" : "previous-cols"
    }), G(s, "invalid layout migration settings", e, i);
  const d = o.policy || {}, u = d.axis || "horizontal", l = d.rounding || "round", c = !Tt(a.value, r.value), y = !c && At(o.previousSettings, o.nextSettings), m = r.value.cols / a.value.cols, h = {
    previousCols: a.value.cols,
    nextCols: r.value.cols,
    ratio: m,
    axis: u,
    rounding: l,
    geometryChanged: c,
    visualOnlyChange: y
  };
  if (!c) {
    y && i.push({
      code: "settings-visual-only",
      level: "info",
      message: "Settings change is visual-only; committed item geometry is unchanged.",
      reason: "visual-only"
    });
    const f = N(t.layout);
    if (f.length === 0 || !d.forceRepair)
      return z(s, "noop", t.layout, [], f, e, i, {
        migration: h
      });
  }
  i.push({
    code: "settings-ratio",
    level: "info",
    message: `Migrating layout columns from ${a.value.cols} to ${r.value.cols}.`,
    reason: u === "xy" ? "xy-ratio" : "horizontal-ratio",
    details: { ratio: m, rounding: l }
  });
  const p = {
    ...n,
    cols: r.value.cols,
    maxRows: typeof r.value.maxRows == "number" ? r.value.maxRows : n.maxRows
  }, x = c ? jt(t.layout, m, u, l) : H(t.layout), w = at(
    x,
    p,
    i,
    d.sanitizeInvalidItems,
    "settings-migration"
  );
  if (!w.ok)
    return G(s, w.message, e, i);
  const I = N(w.layout);
  let k = w.layout, C = I, F, $ = !1;
  if (I.length > 0 || d.forceRepair || c) {
    const f = Z(
      w.layout,
      t.layout,
      p,
      d.repair,
      d.forceRepair === !0 || c,
      i
    );
    if (F = f.summary, $ = f.usedFallback, f.status === "blocked")
      return A(
        s,
        f.collisions.length > 0 ? "collision" : "bounds",
        f.summary.unresolvedIds.length > 0 ? f.summary.unresolvedIds : f.collisions.map((S) => S.i),
        e,
        i,
        f.collisions,
        { migration: h, repair: F }
      );
    k = f.layout, C = f.collisions;
  }
  const O = X(t.layout, k, n.compactType), P = lt(t.layout, k, O, $);
  return z(s, P, P === "noop" ? t.layout : k, O, C, e, i, {
    migration: h,
    repair: F
  });
}
function Wt(t, e = R()) {
  var y, m, h;
  const o = t.operation;
  if (o.type !== "repairCollisions")
    return G(t, "invalid repairCollisions operation", e, []);
  const n = Q(t.options), s = { ...t, options: n }, i = [], a = at(
    t.layout,
    n,
    i,
    ((y = o.policy) == null ? void 0 : y.strategy) !== "custom",
    "repair"
  );
  if (!a.ok)
    return G(s, a.message, e, i);
  const r = !bt(t.layout, a.layout);
  if (N(a.layout).length === 0 && !r && ((m = o.policy) == null ? void 0 : m.strategy) !== "custom" && !((h = o.policy) != null && h.customRepairSolver))
    return z(s, "noop", t.layout, [], [], e, i);
  const u = Z(a.layout, t.layout, n, o.policy, !0, i);
  if (u.status === "blocked")
    return A(
      s,
      u.collisions.length > 0 ? "collision" : "bounds",
      u.summary.unresolvedIds.length > 0 ? u.summary.unresolvedIds : u.collisions.map((p) => p.i),
      e,
      i,
      u.collisions,
      { repair: u.summary }
    );
  const l = X(t.layout, u.layout, n.compactType), c = lt(t.layout, u.layout, l, u.usedFallback);
  return z(s, c, c === "noop" ? t.layout : u.layout, l, u.collisions, e, i, {
    repair: u.summary
  });
}
function Yt(t, e = R()) {
  const o = t.operation;
  if (o.type !== "translateLayout")
    return G(t, "invalid translateLayout operation", e, []);
  const n = Q(t.options), s = { ...t, options: n }, i = [];
  if (!L(o.dx) || !L(o.dy))
    return i.push({
      code: "item-invalid",
      level: "error",
      message: "translateLayout dx/dy must be finite numbers.",
      reason: "invalid-delta"
    }), A(s, "invalid-input", [], e, i);
  let a = Math.round(o.dx), r = Math.round(o.dy);
  if (o.clampNegative !== !1 && t.layout.length > 0) {
    const m = Math.min(...t.layout.map((p) => p.x)), h = Math.min(...t.layout.map((p) => p.y));
    a + m < 0 && (a = -m), r + h < 0 && (r = -h);
  }
  if (a === 0 && r === 0)
    return z(s, "noop", t.layout, [], [], e, i);
  const d = t.layout.map((m) => ({
    ...T(m),
    x: m.x + a,
    y: m.y + r
  })), u = at(d, n, i, !0, "translate");
  if (!u.ok)
    return A(s, "invalid-input", u.itemIds, e, i);
  const l = Z(u.layout, t.layout, n, o.policy, !0, i);
  if (l.status === "blocked")
    return A(
      s,
      l.collisions.length > 0 ? "collision" : "bounds",
      l.summary.unresolvedIds.length > 0 ? l.summary.unresolvedIds : l.collisions.map((m) => m.i),
      e,
      i,
      l.collisions,
      { repair: l.summary }
    );
  const c = X(t.layout, l.layout, n.compactType), y = lt(t.layout, l.layout, c, l.usedFallback);
  return z(s, y, y === "noop" ? t.layout : l.layout, c, l.collisions, e, i, {
    repair: l.summary
  });
}
const Kt = (t, e, o) => {
  var i, a;
  const n = t.target || { x: (i = t.item.x) != null ? i : 0, y: (a = t.item.y) != null ? a : 0 }, s = {
    ...t.item,
    i: t.item.i,
    x: n.x,
    y: n.y,
    w: t.item.w,
    h: t.item.h
  };
  return Mt(s, e, o, {
    sanitizeInvalidItems: !0,
    reason: "placement"
  });
}, Jt = (t, e, o, n, s) => {
  const i = It(e, o), a = n.strategy || (n.target ? "target-first" : "first-fit");
  if (a === "append-after-bottom") {
    const d = { ...t, x: Math.max(0, Math.min(t.x, o.cols - t.w)), y: Math.ceil(xt(e)) };
    if (i.canPlace(d)) return { position: { x: d.x, y: d.y }, source: "append-after-bottom" };
  }
  if (a === "target-first" && n.target) {
    const d = {
      ...t,
      x: Math.max(0, Math.round(n.target.x)),
      y: Math.max(0, Math.round(n.target.y))
    };
    if (i.canPlace(d)) return { position: { x: d.x, y: d.y }, source: "target" };
    const u = i.findNearestFit({ w: t.w, h: t.h }, Rt(d));
    if (u)
      return s.push({
        code: "repair-fallback",
        level: "info",
        message: `Used nearest-fit placement fallback for item "${t.i}".`,
        itemId: t.i,
        reason: "target-blocked"
      }), { position: u, source: "nearest-fit" };
  }
  const r = i.findFirstFit({ w: t.w, h: t.h });
  return r ? { position: r, source: "first-fit" } : { position: null, source: "none" };
};
function Qt(t, e = R()) {
  var l, c;
  const o = t.operation;
  if (o.type !== "placeItems")
    return G(t, "invalid placeItems operation", e, []);
  const n = Q(t.options), s = { ...t, options: n }, i = [];
  let a = H(t.layout);
  const r = [];
  for (const y of o.items) {
    const m = Kt(y, n, i);
    if (!m.ok)
      return A(s, "invalid-input", m.itemId ? [m.itemId] : [], e, i);
    const h = a.filter((w) => w.i !== m.item.i), p = Jt(m.item, h, n, y, i);
    if (!p.position)
      return i.push({
        code: "unresolved-item",
        level: "error",
        message: `Could not place item "${m.item.i}" within current constraints.`,
        itemId: m.item.i,
        before: v(m.item),
        reason: "no-fit"
      }), A(s, "collision", [m.item.i], e, i);
    const x = {
      ...m.item,
      x: p.position.x,
      y: p.position.y,
      static: m.item.static === !0
    };
    i.push({
      code: "placement-source",
      level: "info",
      message: `Placed item "${x.i}" using ${p.source}.`,
      itemId: x.i,
      after: v(x),
      reason: p.source
    }), a = h.concat(x), r.push(x.i);
  }
  if ((l = o.policy) != null && l.strategy || (c = o.policy) != null && c.customRepairSolver) {
    const y = Z(a, t.layout, n, o.policy, !0, i);
    if (y.status === "blocked")
      return A(
        s,
        "collision",
        y.summary.unresolvedIds.length > 0 ? y.summary.unresolvedIds : r,
        e,
        i,
        y.collisions,
        { repair: y.summary }
      );
    a = y.layout;
  }
  const d = N(a), u = X(t.layout, a, n.compactType);
  return z(s, u.length === 0 ? "noop" : "changed", a, u, d, e, i);
}
const q = (t, e, o, n) => ({
  id: n.id || `${e.type}-${Date.now().toString(36)}`,
  phase: n.phase || "commit",
  layout: t,
  operation: e,
  options: o,
  debug: n.debug
});
function qt(t, e) {
  return Vt(q(t, {
    type: "migrateSettings",
    previousSettings: e.previousSettings,
    nextSettings: e.nextSettings,
    policy: e.policy
  }, e.engineOptions, e));
}
function te(t, e) {
  return Wt(q(t, {
    type: "repairCollisions",
    policy: e.policy
  }, e.engineOptions, e));
}
function ee(t, e) {
  return Yt(q(t, {
    type: "translateLayout",
    dx: e.dx,
    dy: e.dy,
    clampNegative: e.clampNegative,
    policy: e.policy
  }, e.engineOptions, e));
}
function oe(t, e) {
  return Qt(q(t, {
    type: "placeItems",
    items: e.items,
    policy: e.policy
  }, e.engineOptions, e));
}
export {
  Qt as a,
  Wt as b,
  Yt as c,
  vt as d,
  Vt as e,
  qt as m,
  oe as p,
  te as r,
  ee as t
};
