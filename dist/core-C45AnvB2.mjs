import { a as b, f as T, j as Y, k as Z, l as q, d as x, o as h, s as E, E as oo } from "./utils-BCVYGne6.mjs";
import { k as j, a as to, c as no, b as eo, e as ao, f as io } from "./migration-CPonYzEY.mjs";
function so(o, e) {
  const t = z(o);
  let n = t[0];
  for (let a = 1, i = t.length; a < i; a++) {
    const s = t[a];
    e > o[s] && (n = s);
  }
  return n;
}
function co(o, e) {
  if (!e[o])
    throw new Error(
      "ResponsiveVueGridLayout: `cols` entry for breakpoint " + o + " is missing!"
    );
  return e[o];
}
function U(o, e, t, n, a, i) {
  if (o[t]) return b(o[t]);
  let s = o[n];
  const c = z(e), l = c.slice(
    c.indexOf(t)
  );
  for (let p = 0, y = l.length; p < y; p++) {
    const r = l[p];
    if (o[r]) {
      s = o[r];
      break;
    }
  }
  return s = b(s || []), T(Y(s, { cols: a }), i, a);
}
function z(o) {
  return Object.keys(o).sort(function(t, n) {
    return o[t] - o[n];
  });
}
const _o = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  findOrGenerateResponsiveLayout: U,
  getBreakpointFromWidth: so,
  getColsFromBreakpoint: co,
  sortBreakpoints: z
}, Symbol.toStringTag, { value: "Module" })), V = 1 / 0, K = "__dropping-elem__", X = () => {
  const o = typeof performance != "undefined" ? performance : null;
  return o && typeof o.now == "function" ? o.now() : Date.now();
}, lo = (o) => `layout-rev-${o}`, ro = (o) => typeof o.diagnostics == "object" ? o.diagnostics : {}, po = (o) => {
  if (o.debug) return !0;
  const e = o.options.diagnostics;
  return typeof e == "object" && e.debug === !0;
}, J = (o) => ({
  ...o,
  maxRows: typeof o.maxRows == "number" ? o.maxRows : V,
  allowOverlap: !!o.allowOverlap,
  preventCollision: !!o.preventCollision,
  indexStrategy: o.indexStrategy || j()
}), F = (o) => typeof o == "number" && Number.isFinite(o) && o > 0, yo = (o) => o === "sw" || o === "w" || o === "nw", fo = (o) => o === "ne" || o === "n" || o === "nw", N = (o, e, t) => Math.max(e, Math.min(o, t)), S = (o) => b(o), G = (o) => `${o.x}:${o.y}:${o.w}:${o.h}:${!!o.moved}`, k = (o, e) => {
  if (o === e) return !0;
  if (o.length !== e.length) return !1;
  for (let t = 0; t < o.length; t++) {
    const n = o[t], a = e[t];
    if (!n || !a || n.i !== a.i || G(n) !== G(a)) return !1;
  }
  return !0;
}, M = (o, e, t) => {
  const n = [], a = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  return o.forEach((s) => a.set(s.i, s)), e.forEach((s) => i.set(s.i, s)), e.forEach((s) => {
    const c = a.get(s.i);
    if (!c) {
      n.push({ type: "add", item: x(s) });
      return;
    }
    (c.w !== s.w || c.h !== s.h || c.x !== s.x || c.y !== s.y) && (c.w !== s.w || c.h !== s.h ? n.push({
      type: "resize",
      id: s.i,
      from: { w: c.w, h: c.h, x: c.x, y: c.y },
      to: { w: s.w, h: s.h, x: s.x, y: s.y }
    }) : n.push({
      type: "move",
      id: s.i,
      from: { x: c.x, y: c.y },
      to: { x: s.x, y: s.y }
    }));
  }), o.forEach((s) => {
    i.has(s.i) || n.push({ type: "remove", id: s.i });
  }), t && n.length > 1 && n.push({
    type: "compact",
    affectedIds: n.map((s) => s.type === "add" ? s.item.i : s.type === "compact" ? "" : s.id).filter(Boolean)
  }), n;
}, A = (o, e) => {
  const t = /* @__PURE__ */ new Set();
  return o.forEach((n) => {
    n.type === "compact" ? n.affectedIds.forEach((a) => t.add(a)) : n.type === "add" ? t.add(n.item.i) : t.add(n.id);
  }), e.forEach((n) => t.add(n.i)), Array.from(t);
}, C = (o, e) => (e.indexStrategy || j()).build(o, {
  cols: e.cols,
  maxRows: e.maxRows,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), uo = (o) => o.type === "add" ? o.item.i : o.type === "compact" ? null : o.id, mo = (o, e, t, n) => {
  const a = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  e.forEach((s) => a.set(s.i, s)), t.forEach((s) => i.set(s.i, s));
  try {
    for (let s = 0; s < n.length; s++) {
      const c = n[s];
      if (c.type === "compact") continue;
      if (c.type === "add") {
        const r = i.get(c.item.i) || c.item;
        o.insert(r);
        continue;
      }
      if (c.type === "remove") {
        o.remove(c.id);
        continue;
      }
      const l = uo(c);
      if (!l) continue;
      const p = a.get(l), y = i.get(l);
      if (!p || !y) return !1;
      o.update(p, y);
    }
    return !0;
  } catch (s) {
    return !1;
  }
}, ho = (o, e, t, n, a, i, s, c) => {
  var y, r;
  const l = X() - i, p = {
    operationId: o.id,
    operationType: o.operation.type,
    phase: o.phase,
    layoutSize: o.layout.length,
    affectedCount: A(n, a).length,
    collisionCount: a.length,
    indexHit: s,
    schedulerMode: (y = o.options.scheduler) == null ? void 0 : y.mode,
    executorKind: ((r = o.options.executor) == null ? void 0 : r.kind) || "main-thread",
    durationMs: l,
    computeMs: l
  };
  return po(o) && (p.debug = go(o, e, t, n, a, c)), p;
}, go = (o, e, t, n, a, i) => ({
  cols: o.options.cols,
  maxRows: o.options.maxRows,
  compactType: o.options.compactType,
  allowOverlap: o.options.allowOverlap,
  preventCollision: o.options.preventCollision,
  operation: o.operation,
  result: {
    status: e,
    affectedIds: A(n, a),
    collisionIds: a.map((s) => s.i),
    blockedReason: i
  }
}), xo = (o, e) => {
  const t = o.options.onEvent;
  if (!t || !e.diagnostics) return;
  t({
    type: "operation",
    id: e.id,
    operationType: o.operation.type,
    phase: o.phase,
    diagnostics: e.diagnostics
  }), e.status === "blocked" && e.blocked && t({
    type: "blocked",
    id: e.id,
    reason: e.blocked.reason,
    itemIds: e.blocked.itemIds,
    diagnostics: e.diagnostics
  });
  const n = ro(o.options).budgetMs;
  typeof n == "number" && e.diagnostics.durationMs > n && t({
    type: "budget-warning",
    id: e.id,
    message: `layout operation exceeded ${n}ms`,
    diagnostics: e.diagnostics
  });
}, v = (o, e, t, n, a, i, s, c = {}) => {
  var d;
  const { diagnostics: l, ...p } = c, y = A(n, a), r = ho(
    o,
    e,
    t,
    n,
    a,
    i,
    s,
    (d = c.blocked) == null ? void 0 : d.reason
  );
  l != null && l.details && (r.details = [
    ...r.details || [],
    ...l.details
  ]);
  const f = {
    id: o.id,
    status: e,
    layout: t,
    patches: n,
    affectedIds: y,
    collisions: a,
    diagnostics: r,
    ...p
  };
  return xo(o, f), f;
}, vo = (o) => o.map((e) => ({
  code: e.code,
  level: e.level,
  message: e.message,
  itemId: e.itemId,
  reason: e.field,
  details: e.details
})), m = (o, e, t, n, a, i = t.map((c) => c.i), s = []) => v(o, "blocked", o.layout, [], t, n, a, {
  blocked: { reason: e, itemIds: i },
  diagnostics: s.length > 0 ? { details: s } : void 0
}), O = (o, e, t, n) => v(o, "noop", o.layout, [], [], e, t, { placeholder: n }), L = (o, e) => e.allowOverlap ? o : T(o, e.compactType, e.cols, e.allowOverlap), $ = (o) => {
  for (let e = 0; e < o.length; e++)
    o[e].moved && (o[e].moved = !1);
  return o;
}, wo = (o) => {
  const e = /* @__PURE__ */ new Set(), t = [];
  return o.forEach((n) => {
    e.has(n.i) || (e.add(n.i), t.push(n));
  }), t;
}, bo = (o, e) => {
  const t = o.operation;
  if (t.type !== "groupMove")
    return { ok: !1, result: R(o, "invalid groupMove operation", e) };
  if (!Number.isFinite(t.dx) || !Number.isFinite(t.dy))
    return {
      ok: !1,
      result: m(o, "invalid-input", [], e, !0)
    };
  const n = [], a = /* @__PURE__ */ new Set();
  if (t.ids.forEach((d) => {
    if (typeof d != "string") return;
    const u = d.trim();
    !u || a.has(u) || (a.add(u), n.push(u));
  }), n.length === 0)
    return {
      ok: !1,
      result: m(o, "invalid-input", [], e, !0)
    };
  const i = n.filter((d) => !h(o.layout, d));
  if (i.length > 0)
    return {
      ok: !1,
      result: m(o, "missing-item", [], e, !0, i)
    };
  const s = n.map((d) => h(o.layout, d)).filter(Boolean), c = s.filter((d) => d.static);
  if (c.length > 0)
    return {
      ok: !1,
      result: m(
        o,
        "static-item",
        c,
        e,
        !0,
        c.map((d) => d.i)
      )
    };
  const l = new Set(n), p = t.activeId && l.has(t.activeId) ? t.activeId : n[0], y = Math.trunc(t.dx), r = Math.trunc(t.dy), f = s.map((d) => ({
    ...x(d),
    x: d.x + y,
    y: d.y + r
  }));
  return {
    ok: !0,
    value: {
      ids: n,
      movingIds: l,
      activeId: p,
      dx: y,
      dy: r,
      movingItems: s,
      targetItems: f
    }
  };
}, Io = (o, e) => {
  const t = [], n = [];
  return o.targetItems.forEach((a) => {
    if (a.x < 0 || a.y < 0 || a.x + a.w > e.cols) {
      t.push(a.i);
      return;
    }
    Number.isFinite(e.maxRows) && a.y + a.h > e.maxRows && n.push(a.i);
  }), t.length > 0 ? { reason: "bounds", itemIds: t } : n.length > 0 ? { reason: "maxRows", itemIds: n } : null;
}, Lo = (o, e, t) => wo(
  o.targetItems.flatMap(
    (n) => e.queryAllCollisions(n).filter(
      (a) => !o.movingIds.has(a.i) && !0
    )
  )
), Ro = (o, e, t) => {
  const n = S(o);
  return e.targetItems.forEach((a) => {
    const i = h(n, a.i);
    i && (i.x = a.x, i.y = a.y, i.moved = !0, t && (i.static = !0));
  }), n;
}, ko = (o, e) => (e.movingItems.forEach((t) => {
  const n = h(o, t.i);
  n && (typeof t.static == "undefined" ? delete n.static : n.static = t.static);
}), o), Mo = (o, e, t, n, a) => {
  const i = t.movingItems[0], s = t.targetItems[0];
  if (!i || !s)
    return m(o, "invalid-input", [], n, !0);
  if (i.x === s.x && i.y === s.y)
    return O(o, n, !0, x(i));
  if (a.some((u) => u.static)) {
    const u = a.filter((g) => g.static);
    return m(
      o,
      "static-item",
      u,
      n,
      !0,
      u.map((g) => g.i)
    );
  }
  if (a.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return m(o, "collision", a, n, !0);
  const c = S(o.layout), l = h(c, i.i);
  if (!l) return m(o, "missing-item", [], n, !0, [i.i]);
  const p = E(
    c,
    l,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    s.x,
    s.y,
    o.operation.type === "groupMove" ? o.operation.userAction !== !1 : !0,
    o.options.preventCollision
  ), y = $(L(p, o.options)), r = M(o.layout, y, o.options.compactType), f = h(y, i.i) || l, d = r.length === 0 || k(o.layout, y) ? "noop" : "changed";
  return v(
    o,
    d,
    d === "noop" ? o.layout : y,
    r,
    a,
    n,
    !0,
    { placeholder: x(f) }
  );
}, Co = (o, e, t) => {
  const n = bo(o, t);
  if (!n.ok) return n.result;
  const a = n.value, i = a.movingItems.find((g) => g.i === a.activeId) || a.movingItems[0], s = Io(a, o.options);
  if (s)
    return m(o, s.reason, [], t, !0, s.itemIds);
  if (a.dx === 0 && a.dy === 0 && i)
    return O(o, t, !0, x(i));
  const c = Lo(a, e), l = c.filter((g) => g.static);
  if (l.length > 0)
    return m(
      o,
      "static-item",
      l,
      t,
      !0,
      l.map((g) => g.i)
    );
  if (a.ids.length === 1)
    return Mo(o, e, a, t, c);
  if (c.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return m(o, "collision", c, t, !0);
  const p = !o.options.allowOverlap, y = Ro(o.layout, a, p);
  let r = y;
  o.options.allowOverlap || (r = T(
    y,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap
  )), r = $(ko(r, a));
  const f = M(o.layout, r, o.options.compactType), d = h(r, a.activeId) || i, u = f.length === 0 || k(o.layout, r) ? "noop" : "changed";
  return v(
    o,
    u,
    u === "noop" ? o.layout : r,
    f,
    c,
    t,
    !0,
    d ? { placeholder: x(d) } : {}
  );
}, Oo = (o, e, t) => {
  const n = o.operation;
  if (n.type !== "move") return R(o, "invalid move operation", t);
  const a = h(o.layout, n.id);
  if (!a) return m(o, "missing-item", [], t, !0, [n.id]);
  if (a.static)
    return m(o, "static-item", [], t, !0, [n.id]);
  if (a.x === n.x && a.y === n.y)
    return O(o, t, !0, x(a));
  const i = { ...a, x: n.x, y: n.y }, s = e.queryAllCollisions(i);
  if (s.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return m(o, "collision", s, t, !0);
  const c = S(o.layout), l = h(c, n.id);
  if (!l) return m(o, "missing-item", [], t, !0, [n.id]);
  const p = E(
    c,
    l,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    n.x,
    n.y,
    n.userAction !== !1,
    o.options.preventCollision
  ), y = $(L(p, o.options)), r = M(o.layout, y, o.options.compactType), f = h(y, n.id) || l, d = r.length === 0 || k(o.layout, y) ? "noop" : "changed";
  return v(o, d, d === "noop" ? o.layout : y, r, s, t, !0, {
    placeholder: x(f)
  });
}, Eo = (o, e, t) => {
  var p, y, r, f, d, u, g, I, H, W, _, D;
  const n = (y = (p = e.constraint) == null ? void 0 : p.handlePolicy) == null ? void 0 : y.allowedHandles;
  if (n && n.indexOf(e.handle) === -1)
    return {
      x: o.x,
      y: o.y,
      w: o.w,
      h: o.h,
      moved: !1,
      reason: "handle-disabled",
      details: [{
        code: "item-capability.handle-disabled",
        level: "warning",
        message: "Resize handle is disabled by item capability policy.",
        itemId: o.i,
        reason: "resizeHandles",
        details: { handle: e.handle, allowedHandles: n }
      }]
    };
  let a = N(
    e.w,
    typeof o.minW == "number" ? o.minW : 1,
    typeof o.maxW == "number" ? o.maxW : t.cols
  ), i = N(
    e.h,
    typeof o.minH == "number" ? o.minH : 1,
    typeof o.maxH == "number" ? o.maxH : t.maxRows || V
  ), s = typeof e.x == "number" ? e.x : o.x, c = typeof e.y == "number" ? e.y : o.y, l = !1;
  if (typeof e.x != "number" && yo(e.handle) && (s = o.x + (o.w - a), s < 0 && (s = 0, a = o.w), l = !0), typeof e.y != "number" && fo(e.handle) && (c = o.y + (o.h - i), c < 0 && (c = 0, i = o.h), l = !0), (f = (r = e.constraint) == null ? void 0 : r.aspectRatio) != null && f.enabled) {
    const w = io({
      startItem: o,
      rawCandidate: { ...o, x: s, y: c, w: a, h: i },
      handle: e.handle,
      constraint: e.constraint.aspectRatio,
      bounds: {
        cols: t.cols,
        maxRows: t.maxRows,
        minW: o.minW,
        minH: o.minH,
        maxW: o.maxW,
        maxH: o.maxH
      }
    }), B = vo(w.diagnostics);
    if (w.kind === "blocked")
      return {
        x: (u = (d = w.candidate) == null ? void 0 : d.x) != null ? u : s,
        y: (I = (g = w.candidate) == null ? void 0 : g.y) != null ? I : c,
        w: (W = (H = w.candidate) == null ? void 0 : H.w) != null ? W : a,
        h: (D = (_ = w.candidate) == null ? void 0 : _.h) != null ? D : i,
        moved: l,
        reason: w.reason,
        details: B
      };
    if (s = w.candidate.x, c = w.candidate.y, a = w.candidate.w, i = w.candidate.h, l = l || s !== o.x || c !== o.y, B.length > 0)
      return { x: s, y: c, w: a, h: i, moved: l, details: B };
  }
  return s < 0 || c < 0 ? { x: s, y: c, w: a, h: i, moved: l, reason: "bounds" } : s + a > t.cols ? { x: s, y: c, w: a, h: i, moved: l, reason: "bounds" } : Number.isFinite(t.maxRows) && c + i > t.maxRows ? { x: s, y: c, w: a, h: i, moved: l, reason: "maxRows" } : { x: s, y: c, w: a, h: i, moved: l || s !== o.x || c !== o.y };
}, To = (o, e, t) => {
  const n = o.operation;
  if (n.type !== "resize") return R(o, "invalid resize operation", t);
  const a = h(o.layout, n.id);
  if (!a) return m(o, "missing-item", [], t, !0, [n.id]);
  if (a.static)
    return m(o, "static-item", [], t, !0, [n.id]);
  if (!F(n.w) || !F(n.h))
    return m(o, "invalid-input", [], t, !0, [n.id]);
  const i = Eo(a, n, o.options);
  if (i.reason)
    return m(o, i.reason, [], t, !0, [n.id], i.details);
  if (a.w === i.w && a.h === i.h && a.x === i.x && a.y === i.y)
    return O(o, t, !0, x(a));
  const s = {
    ...a,
    x: i.x,
    y: i.y,
    w: i.w,
    h: i.h
  }, c = e.queryAllCollisions(s);
  if (c.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return m(o, "collision", c, t, !0);
  const l = S(o.layout), p = h(l, n.id);
  if (!p) return m(o, "missing-item", [], t, !0, [n.id]);
  p.w = i.w, p.h = i.h;
  let y = l;
  i.moved ? y = E(
    l,
    p,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    i.x,
    i.y,
    !0,
    o.options.preventCollision
  ) : (p.x = i.x, p.y = i.y);
  const r = $(L(y, o.options)), f = M(o.layout, r, o.options.compactType), d = h(r, n.id) || p, u = f.length === 0 || k(o.layout, r) ? "noop" : "changed";
  return v(o, u, u === "noop" ? o.layout : r, f, c, t, !0, {
    placeholder: x(d),
    diagnostics: i.details && i.details.length > 0 ? { details: i.details } : void 0
  });
}, Fo = (o, e, t) => {
  const n = o.operation;
  if (n.type !== "dropFit") return R(o, "invalid dropFit operation", t);
  const a = Math.floor(n.item.w), i = Math.floor(n.item.h);
  if (!F(a) || !F(i))
    return m(o, "invalid-input", [], t, !0);
  const s = n.item.i || K, c = o.layout.filter((I) => I.i !== s), l = C(c, o.options);
  let p = null, y = "none";
  if (n.strategy === "cursor" && n.target) {
    const I = {
      i: s,
      x: Math.max(0, Math.floor(n.target.x)),
      y: Math.max(0, Math.floor(n.target.y)),
      w: a,
      h: i
    };
    l.canPlace(I) ? p = { x: I.x, y: I.y } : (p = l.findNearestFit({ w: a, h: i }, n.target), y = p ? "nearest-fit" : "none");
  } else
    p = l.findFirstFit({ w: a, h: i }), y = p ? "first-fit" : "none";
  if (!p)
    return v(o, "blocked", o.layout, [], [], t, !0, {
      blocked: { reason: "collision", itemIds: [] },
      drop: {
        position: null,
        strategy: n.strategy,
        fallback: y,
        reason: "no-fit"
      }
    });
  const r = {
    ...n.item,
    i: s,
    x: p.x,
    y: p.y,
    w: a,
    h: i,
    static: !1
  }, f = [...c.map(x), r], d = L(f, o.options), u = h(d, s) || r, g = M(o.layout, d, o.options.compactType);
  return v(o, "changed", d, g, [], t, !0, {
    placeholder: x(u),
    drop: {
      position: { x: u.x, y: u.y },
      strategy: n.strategy,
      fallback: y
    }
  });
}, So = (o, e) => {
  if (o.options.allowOverlap || o.options.compactType == null)
    return O(o, e, !1);
  const t = T(
    o.layout,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap
  ), n = M(o.layout, t, o.options.compactType), a = n.length === 0 || k(o.layout, t) ? "noop" : "changed";
  return v(o, a, a === "noop" ? o.layout : t, n, [], e, !1);
}, $o = (o, e) => {
  try {
    return oo(o.layout, "LayoutEngine.layout"), O(o, e, !1);
  } catch (t) {
    return v(o, "error", o.layout, [], [], e, !1, {
      error: {
        message: t instanceof Error ? t.message : String(t),
        cause: t
      }
    });
  }
}, Bo = (o, e) => {
  const t = o.operation;
  if (t.type !== "generateResponsiveLayout")
    return R(o, "invalid responsive operation", e);
  const n = t.breakpoints || { [t.breakpoint]: 0 }, a = t.layouts || { [t.sourceBreakpoint || t.breakpoint]: o.layout }, i = U(
    a,
    n,
    t.breakpoint,
    t.sourceBreakpoint || t.breakpoint,
    t.cols,
    o.options.compactType
  ), s = M(o.layout, i, o.options.compactType), c = s.length === 0 || k(o.layout, i) ? "noop" : "changed";
  return v(o, c, c === "noop" ? o.layout : i, s, [], e, !1);
}, R = (o, e, t, n) => v(o, "error", o.layout, [], [], t, !1, {
  error: { message: e, cause: n }
}), zo = (o) => {
  const e = o.options;
  switch (o.operation.type) {
    case "move": {
      const t = b(o.layout), n = h(t, o.operation.id);
      if (!n) return o.layout;
      const a = E(
        t,
        n,
        e.compactType,
        e.cols,
        e.allowOverlap,
        o.operation.x,
        o.operation.y,
        o.operation.userAction !== !1,
        e.preventCollision
      );
      return L(a, e);
    }
    case "groupMove": {
      const t = Array.from(new Set(o.operation.ids.filter(Boolean)));
      if (t.length !== 1) return o.layout;
      const n = b(o.layout), a = h(n, t[0]);
      if (!a) return o.layout;
      const i = E(
        n,
        a,
        e.compactType,
        e.cols,
        e.allowOverlap,
        a.x + Math.trunc(o.operation.dx),
        a.y + Math.trunc(o.operation.dy),
        o.operation.userAction !== !1,
        e.preventCollision
      );
      return L(i, e);
    }
    case "compact":
      return e.allowOverlap || e.compactType == null ? o.layout : T(o.layout, e.compactType, e.cols, e.allowOverlap);
    case "dropFit": {
      const t = o.operation.item.i || K, n = o.layout.filter((i) => i.i !== t), a = o.operation.strategy === "auto" || !o.operation.target ? Z(n, o.operation.item, e.cols, e.maxRows) : q(
        n,
        o.operation.item,
        e.cols,
        o.operation.target.x,
        o.operation.target.y,
        e.maxRows
      );
      return a ? L([
        ...n.map(x),
        {
          ...o.operation.item,
          i: t,
          x: a.x,
          y: a.y,
          w: o.operation.item.w,
          h: o.operation.item.h,
          static: !1
        }
      ], e) : o.layout;
    }
    case "migrateSettings":
    case "repairCollisions":
    case "translateLayout":
    case "placeItems":
      return o.layout;
    default:
      return o.layout;
  }
};
function P(o, e) {
  if (o.operation.type === "migrateSettings" || o.operation.type === "repairCollisions" || o.operation.type === "translateLayout" || o.operation.type === "placeItems")
    return { matches: !0, differences: [] };
  if (o.operation.type === "groupMove" && o.operation.ids.length > 1)
    return { matches: !0, differences: [] };
  const t = zo(o), n = [], a = /* @__PURE__ */ new Map();
  return e.layout.forEach((i) => a.set(i.i, i)), t.length !== e.layout.length && n.push(`length:${t.length}->${e.layout.length}`), t.forEach((i, s) => {
    const c = a.get(i.i);
    if (!c) {
      n.push(`${i.i}:missing`);
      return;
    }
    (i.x !== c.x || i.y !== c.y || i.w !== c.w || i.h !== c.h) && n.push(
      `${i.i}@${s}:${i.x},${i.y},${i.w},${i.h}->${c.x},${c.y},${c.w},${c.h}`
    );
  }), { matches: n.length === 0, differences: n };
}
function Q(o, e) {
  const t = X(), n = J(o.options), a = { ...o, options: n };
  try {
    const i = e || C(a.layout, n);
    switch (a.operation.type) {
      case "move":
        return Oo(a, i, t);
      case "groupMove":
        return Co(a, i, t);
      case "resize":
        return To(a, i, t);
      case "dropFit":
        return Fo(a, i, t);
      case "compact":
        return So(a, t);
      case "validate":
        return $o(a, t);
      case "generateResponsiveLayout":
        return Bo(a, t);
      case "migrateSettings":
        return ao(a, t);
      case "repairCollisions":
        return eo(a, t);
      case "translateLayout":
        return no(a, t);
      case "placeItems":
        return to(a, t);
      default:
        return R(a, "unknown layout operation", t);
    }
  } catch (i) {
    return R(
      a,
      i instanceof Error ? i.message : String(i),
      t,
      i
    );
  }
}
function Ao(o) {
  return Q(o);
}
function Do(o, e = []) {
  const t = J(o);
  let n = b(e), a = C(n, t), i = 0;
  const s = (l) => {
    n = b(l), a = C(n, t), i++;
  }, c = (l) => {
    var f;
    const p = l.layout === n || k(l.layout, n), y = p ? a : C(l.layout, t), r = Q(l, y);
    if (t.compareLegacy) {
      const d = P(l, r);
      d.matches || (f = t.onEvent) == null || f.call(t, {
        type: "legacy-mismatch",
        id: l.id,
        message: "layout engine result differs from legacy path",
        diagnostics: r.diagnostics,
        details: d.differences
      });
    }
    if (r.status === "changed" || r.status === "fallback") {
      const d = n;
      n = b(r.layout), p && r.patches.length > 0 && mo(a, d, n, r.patches) || (a = C(n, t)), i++;
    }
    return r;
  };
  return {
    getLayout: () => b(n),
    getRevision: () => lo(i),
    setLayout: s,
    execute: (l) => c({
      ...l,
      layout: n,
      options: t
    }),
    executeRequest: c,
    compareLegacy: (l) => {
      const p = Ao(l);
      return P(l, p), p;
    }
  };
}
export {
  Do as a,
  co as b,
  P as c,
  Ao as e,
  U as f,
  so as g,
  _o as r,
  z as s
};
