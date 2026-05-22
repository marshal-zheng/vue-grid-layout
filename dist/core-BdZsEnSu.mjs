import { a as b, f as T, j as Y, k as Z, l as q, d as x, o as g, s as O, E as oo } from "./utils-BCVYGne6.mjs";
import { k as j, a as to, c as no, b as eo, e as ao, f as io } from "./migration-CPonYzEY.mjs";
function co(o, e) {
  const t = B(o);
  let n = t[0];
  for (let a = 1, i = t.length; a < i; a++) {
    const c = t[a];
    e > o[c] && (n = c);
  }
  return n;
}
function so(o, e) {
  if (!e[o])
    throw new Error(
      "ResponsiveVueGridLayout: `cols` entry for breakpoint " + o + " is missing!"
    );
  return e[o];
}
function U(o, e, t, n, a, i) {
  if (o[t]) return b(o[t]);
  let c = o[n];
  const s = B(e), l = s.slice(
    s.indexOf(t)
  );
  for (let p = 0, y = l.length; p < y; p++) {
    const r = l[p];
    if (o[r]) {
      c = o[r];
      break;
    }
  }
  return c = b(c || []), T(Y(c, { cols: a }), i, a);
}
function B(o) {
  return Object.keys(o).sort(function(t, n) {
    return o[t] - o[n];
  });
}
const _o = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  findOrGenerateResponsiveLayout: U,
  getBreakpointFromWidth: co,
  getColsFromBreakpoint: so,
  sortBreakpoints: B
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
}), E = (o) => typeof o == "number" && Number.isFinite(o) && o > 0, yo = (o) => o === "sw" || o === "w" || o === "nw", fo = (o) => o === "ne" || o === "n" || o === "nw", N = (o, e, t) => Math.max(e, Math.min(o, t)), F = (o) => b(o), G = (o) => `${o.x}:${o.y}:${o.w}:${o.h}:${!!o.moved}`, R = (o, e) => {
  if (o === e) return !0;
  if (o.length !== e.length) return !1;
  for (let t = 0; t < o.length; t++) {
    const n = o[t], a = e[t];
    if (!n || !a || n.i !== a.i || G(n) !== G(a)) return !1;
  }
  return !0;
}, k = (o, e, t) => {
  const n = [], a = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  return o.forEach((c) => a.set(c.i, c)), e.forEach((c) => i.set(c.i, c)), e.forEach((c) => {
    const s = a.get(c.i);
    if (!s) {
      n.push({ type: "add", item: x(c) });
      return;
    }
    (s.w !== c.w || s.h !== c.h || s.x !== c.x || s.y !== c.y) && (s.w !== c.w || s.h !== c.h ? n.push({
      type: "resize",
      id: c.i,
      from: { w: s.w, h: s.h, x: s.x, y: s.y },
      to: { w: c.w, h: c.h, x: c.x, y: c.y }
    }) : n.push({
      type: "move",
      id: c.i,
      from: { x: s.x, y: s.y },
      to: { x: c.x, y: c.y }
    }));
  }), o.forEach((c) => {
    i.has(c.i) || n.push({ type: "remove", id: c.i });
  }), t && n.length > 1 && n.push({
    type: "compact",
    affectedIds: n.map((c) => c.type === "add" ? c.item.i : c.type === "compact" ? "" : c.id).filter(Boolean)
  }), n;
}, z = (o, e) => {
  const t = /* @__PURE__ */ new Set();
  return o.forEach((n) => {
    n.type === "compact" ? n.affectedIds.forEach((a) => t.add(a)) : n.type === "add" ? t.add(n.item.i) : t.add(n.id);
  }), e.forEach((n) => t.add(n.i)), Array.from(t);
}, M = (o, e) => (e.indexStrategy || j()).build(o, {
  cols: e.cols,
  maxRows: e.maxRows,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), uo = (o) => o.type === "add" ? o.item.i : o.type === "compact" ? null : o.id, mo = (o, e, t, n) => {
  const a = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  e.forEach((c) => a.set(c.i, c)), t.forEach((c) => i.set(c.i, c));
  try {
    for (let c = 0; c < n.length; c++) {
      const s = n[c];
      if (s.type === "compact") continue;
      if (s.type === "add") {
        const r = i.get(s.item.i) || s.item;
        o.insert(r);
        continue;
      }
      if (s.type === "remove") {
        o.remove(s.id);
        continue;
      }
      const l = uo(s);
      if (!l) continue;
      const p = a.get(l), y = i.get(l);
      if (!p || !y) return !1;
      o.update(p, y);
    }
    return !0;
  } catch (c) {
    return !1;
  }
}, ho = (o, e, t, n, a, i, c, s) => {
  var y, r;
  const l = X() - i, p = {
    operationId: o.id,
    operationType: o.operation.type,
    phase: o.phase,
    layoutSize: o.layout.length,
    affectedCount: z(n, a).length,
    collisionCount: a.length,
    indexHit: c,
    schedulerMode: (y = o.options.scheduler) == null ? void 0 : y.mode,
    executorKind: ((r = o.options.executor) == null ? void 0 : r.kind) || "main-thread",
    durationMs: l,
    computeMs: l
  };
  return po(o) && (p.debug = go(o, e, t, n, a, s)), p;
}, go = (o, e, t, n, a, i) => ({
  cols: o.options.cols,
  maxRows: o.options.maxRows,
  compactType: o.options.compactType,
  allowOverlap: o.options.allowOverlap,
  preventCollision: o.options.preventCollision,
  operation: o.operation,
  result: {
    status: e,
    affectedIds: z(n, a),
    collisionIds: a.map((c) => c.i),
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
}, v = (o, e, t, n, a, i, c, s = {}) => {
  var d;
  const { diagnostics: l, ...p } = s, y = z(n, a), r = ho(
    o,
    e,
    t,
    n,
    a,
    i,
    c,
    (d = s.blocked) == null ? void 0 : d.reason
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
})), u = (o, e, t, n, a, i = t.map((s) => s.i), c = []) => v(o, "blocked", o.layout, [], t, n, a, {
  blocked: { reason: e, itemIds: i },
  diagnostics: c.length > 0 ? { details: c } : void 0
}), C = (o, e, t, n) => v(o, "noop", o.layout, [], [], e, t, { placeholder: n }), I = (o, e) => e.allowOverlap || e.compactType == null ? o : T(o, e.compactType, e.cols, e.allowOverlap), S = (o) => {
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
    return { ok: !1, result: L(o, "invalid groupMove operation", e) };
  if (!Number.isFinite(t.dx) || !Number.isFinite(t.dy))
    return {
      ok: !1,
      result: u(o, "invalid-input", [], e, !0)
    };
  const n = [], a = /* @__PURE__ */ new Set();
  if (t.ids.forEach((d) => {
    if (typeof d != "string") return;
    const m = d.trim();
    !m || a.has(m) || (a.add(m), n.push(m));
  }), n.length === 0)
    return {
      ok: !1,
      result: u(o, "invalid-input", [], e, !0)
    };
  const i = n.filter((d) => !g(o.layout, d));
  if (i.length > 0)
    return {
      ok: !1,
      result: u(o, "missing-item", [], e, !0, i)
    };
  const c = n.map((d) => g(o.layout, d)).filter(Boolean), s = c.filter((d) => d.static);
  if (s.length > 0)
    return {
      ok: !1,
      result: u(
        o,
        "static-item",
        s,
        e,
        !0,
        s.map((d) => d.i)
      )
    };
  const l = new Set(n), p = t.activeId && l.has(t.activeId) ? t.activeId : n[0], y = Math.trunc(t.dx), r = Math.trunc(t.dy), f = c.map((d) => ({
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
      movingItems: c,
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
  const n = F(o);
  return e.targetItems.forEach((a) => {
    const i = g(n, a.i);
    i && (i.x = a.x, i.y = a.y, i.moved = !0, t && (i.static = !0));
  }), n;
}, ko = (o, e) => (e.movingItems.forEach((t) => {
  const n = g(o, t.i);
  n && (typeof t.static == "undefined" ? delete n.static : n.static = t.static);
}), o), Mo = (o, e, t, n, a) => {
  const i = t.movingItems[0], c = t.targetItems[0];
  if (!i || !c)
    return u(o, "invalid-input", [], n, !0);
  if (i.x === c.x && i.y === c.y)
    return C(o, n, !0, x(i));
  if (a.some((m) => m.static)) {
    const m = a.filter((h) => h.static);
    return u(
      o,
      "static-item",
      m,
      n,
      !0,
      m.map((h) => h.i)
    );
  }
  if (a.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return u(o, "collision", a, n, !0);
  const s = F(o.layout), l = g(s, i.i);
  if (!l) return u(o, "missing-item", [], n, !0, [i.i]);
  const p = O(
    s,
    l,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    c.x,
    c.y,
    o.operation.type === "groupMove" ? o.operation.userAction !== !1 : !0,
    o.options.preventCollision
  ), y = S(I(p, o.options)), r = k(o.layout, y, o.options.compactType), f = g(y, i.i) || l, d = r.length === 0 || R(o.layout, y) ? "noop" : "changed";
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
  const a = n.value, i = a.movingItems.find((h) => h.i === a.activeId) || a.movingItems[0], c = Io(a, o.options);
  if (c)
    return u(o, c.reason, [], t, !0, c.itemIds);
  if (a.dx === 0 && a.dy === 0 && i)
    return C(o, t, !0, x(i));
  const s = Lo(a, e), l = s.filter((h) => h.static);
  if (l.length > 0)
    return u(
      o,
      "static-item",
      l,
      t,
      !0,
      l.map((h) => h.i)
    );
  if (a.ids.length === 1)
    return Mo(o, e, a, t, s);
  if (s.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return u(o, "collision", s, t, !0);
  const p = !o.options.allowOverlap, y = Ro(o.layout, a, p);
  let r = y;
  o.options.allowOverlap || (r = T(
    y,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap
  )), r = S(ko(r, a));
  const f = k(o.layout, r, o.options.compactType), d = g(r, a.activeId) || i, m = f.length === 0 || R(o.layout, r) ? "noop" : "changed";
  return v(
    o,
    m,
    m === "noop" ? o.layout : r,
    f,
    s,
    t,
    !0,
    d ? { placeholder: x(d) } : {}
  );
}, Oo = (o, e, t) => {
  const n = o.operation;
  if (n.type !== "move") return L(o, "invalid move operation", t);
  const a = g(o.layout, n.id);
  if (!a) return u(o, "missing-item", [], t, !0, [n.id]);
  if (a.static)
    return u(o, "static-item", [], t, !0, [n.id]);
  if (a.x === n.x && a.y === n.y)
    return C(o, t, !0, x(a));
  const i = { ...a, x: n.x, y: n.y }, c = e.queryAllCollisions(i);
  if (c.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return u(o, "collision", c, t, !0);
  const s = F(o.layout), l = g(s, n.id);
  if (!l) return u(o, "missing-item", [], t, !0, [n.id]);
  const p = O(
    s,
    l,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    n.x,
    n.y,
    n.userAction !== !1,
    o.options.preventCollision
  ), y = S(I(p, o.options)), r = k(o.layout, y, o.options.compactType), f = g(y, n.id) || l, d = r.length === 0 || R(o.layout, y) ? "noop" : "changed";
  return v(o, d, d === "noop" ? o.layout : y, r, c, t, !0, {
    placeholder: x(f)
  });
}, To = (o, e, t) => {
  var p, y, r, f, d, m, h, A, H, W, _, D;
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
  ), c = typeof e.x == "number" ? e.x : o.x, s = typeof e.y == "number" ? e.y : o.y, l = !1;
  if (typeof e.x != "number" && yo(e.handle) && (c = o.x + (o.w - a), c < 0 && (c = 0, a = o.w), l = !0), typeof e.y != "number" && fo(e.handle) && (s = o.y + (o.h - i), s < 0 && (s = 0, i = o.h), l = !0), (f = (r = e.constraint) == null ? void 0 : r.aspectRatio) != null && f.enabled) {
    const w = io({
      startItem: o,
      rawCandidate: { ...o, x: c, y: s, w: a, h: i },
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
    }), $ = vo(w.diagnostics);
    if (w.kind === "blocked")
      return {
        x: (m = (d = w.candidate) == null ? void 0 : d.x) != null ? m : c,
        y: (A = (h = w.candidate) == null ? void 0 : h.y) != null ? A : s,
        w: (W = (H = w.candidate) == null ? void 0 : H.w) != null ? W : a,
        h: (D = (_ = w.candidate) == null ? void 0 : _.h) != null ? D : i,
        moved: l,
        reason: w.reason,
        details: $
      };
    if (c = w.candidate.x, s = w.candidate.y, a = w.candidate.w, i = w.candidate.h, l = l || c !== o.x || s !== o.y, $.length > 0)
      return { x: c, y: s, w: a, h: i, moved: l, details: $ };
  }
  return c < 0 || s < 0 ? { x: c, y: s, w: a, h: i, moved: l, reason: "bounds" } : c + a > t.cols ? { x: c, y: s, w: a, h: i, moved: l, reason: "bounds" } : Number.isFinite(t.maxRows) && s + i > t.maxRows ? { x: c, y: s, w: a, h: i, moved: l, reason: "maxRows" } : { x: c, y: s, w: a, h: i, moved: l || c !== o.x || s !== o.y };
}, Eo = (o, e, t) => {
  const n = o.operation;
  if (n.type !== "resize") return L(o, "invalid resize operation", t);
  const a = g(o.layout, n.id);
  if (!a) return u(o, "missing-item", [], t, !0, [n.id]);
  if (a.static)
    return u(o, "static-item", [], t, !0, [n.id]);
  if (!E(n.w) || !E(n.h))
    return u(o, "invalid-input", [], t, !0, [n.id]);
  const i = To(a, n, o.options);
  if (i.reason)
    return u(o, i.reason, [], t, !0, [n.id], i.details);
  if (a.w === i.w && a.h === i.h && a.x === i.x && a.y === i.y)
    return C(o, t, !0, x(a));
  const c = {
    ...a,
    x: i.x,
    y: i.y,
    w: i.w,
    h: i.h
  }, s = e.queryAllCollisions(c);
  if (s.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return u(o, "collision", s, t, !0);
  const l = F(o.layout), p = g(l, n.id);
  if (!p) return u(o, "missing-item", [], t, !0, [n.id]);
  p.w = i.w, p.h = i.h;
  let y = l;
  i.moved ? y = O(
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
  const r = S(I(y, o.options)), f = k(o.layout, r, o.options.compactType), d = g(r, n.id) || p, m = f.length === 0 || R(o.layout, r) ? "noop" : "changed";
  return v(o, m, m === "noop" ? o.layout : r, f, s, t, !0, {
    placeholder: x(d),
    diagnostics: i.details && i.details.length > 0 ? { details: i.details } : void 0
  });
}, Fo = (o, e, t) => {
  const n = o.operation;
  if (n.type !== "dropFit") return L(o, "invalid dropFit operation", t);
  const a = Math.floor(n.item.w), i = Math.floor(n.item.h);
  if (!E(a) || !E(i))
    return u(o, "invalid-input", [], t, !0);
  const c = n.item.i || K, s = o.layout.filter((h) => h.i !== c), l = M(s, o.options);
  let p = null, y = "none";
  if (n.strategy === "cursor" && n.target) {
    const h = {
      i: c,
      x: Math.max(0, Math.floor(n.target.x)),
      y: Math.max(0, Math.floor(n.target.y)),
      w: a,
      h: i
    };
    l.canPlace(h) ? p = { x: h.x, y: h.y } : (p = l.findNearestFit({ w: a, h: i }, n.target), y = p ? "nearest-fit" : "none");
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
    i: c,
    x: p.x,
    y: p.y,
    w: a,
    h: i,
    static: !1
  }, f = [...s.map(x), r], d = I(f, o.options), m = k(o.layout, d, o.options.compactType);
  return v(o, "changed", d, m, [], t, !0, {
    placeholder: x(r),
    drop: {
      position: p,
      strategy: n.strategy,
      fallback: y
    }
  });
}, So = (o, e) => {
  if (o.options.allowOverlap || o.options.compactType == null)
    return C(o, e, !1);
  const t = T(
    o.layout,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap
  ), n = k(o.layout, t, o.options.compactType), a = n.length === 0 || R(o.layout, t) ? "noop" : "changed";
  return v(o, a, a === "noop" ? o.layout : t, n, [], e, !1);
}, $o = (o, e) => {
  try {
    return oo(o.layout, "LayoutEngine.layout"), C(o, e, !1);
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
    return L(o, "invalid responsive operation", e);
  const n = t.breakpoints || { [t.breakpoint]: 0 }, a = t.layouts || { [t.sourceBreakpoint || t.breakpoint]: o.layout }, i = U(
    a,
    n,
    t.breakpoint,
    t.sourceBreakpoint || t.breakpoint,
    t.cols,
    o.options.compactType
  ), c = k(o.layout, i, o.options.compactType), s = c.length === 0 || R(o.layout, i) ? "noop" : "changed";
  return v(o, s, s === "noop" ? o.layout : i, c, [], e, !1);
}, L = (o, e, t, n) => v(o, "error", o.layout, [], [], t, !1, {
  error: { message: e, cause: n }
}), zo = (o) => {
  const e = o.options;
  switch (o.operation.type) {
    case "move": {
      const t = b(o.layout), n = g(t, o.operation.id);
      if (!n) return o.layout;
      const a = O(
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
      return I(a, e);
    }
    case "groupMove": {
      const t = Array.from(new Set(o.operation.ids.filter(Boolean)));
      if (t.length !== 1) return o.layout;
      const n = b(o.layout), a = g(n, t[0]);
      if (!a) return o.layout;
      const i = O(
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
      return I(i, e);
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
      return a ? I([
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
  return e.layout.forEach((i) => a.set(i.i, i)), t.length !== e.layout.length && n.push(`length:${t.length}->${e.layout.length}`), t.forEach((i, c) => {
    const s = a.get(i.i);
    if (!s) {
      n.push(`${i.i}:missing`);
      return;
    }
    (i.x !== s.x || i.y !== s.y || i.w !== s.w || i.h !== s.h) && n.push(
      `${i.i}@${c}:${i.x},${i.y},${i.w},${i.h}->${s.x},${s.y},${s.w},${s.h}`
    );
  }), { matches: n.length === 0, differences: n };
}
function Q(o, e) {
  const t = X(), n = J(o.options), a = { ...o, options: n };
  try {
    const i = e || M(a.layout, n);
    switch (a.operation.type) {
      case "move":
        return Oo(a, i, t);
      case "groupMove":
        return Co(a, i, t);
      case "resize":
        return Eo(a, i, t);
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
        return L(a, "unknown layout operation", t);
    }
  } catch (i) {
    return L(
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
  let n = b(e), a = M(n, t), i = 0;
  const c = (l) => {
    n = b(l), a = M(n, t), i++;
  }, s = (l) => {
    var f;
    const p = l.layout === n || R(l.layout, n), y = p ? a : M(l.layout, t), r = Q(l, y);
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
      n = b(r.layout), p && r.patches.length > 0 && mo(a, d, n, r.patches) || (a = M(n, t)), i++;
    }
    return r;
  };
  return {
    getLayout: () => b(n),
    getRevision: () => lo(i),
    setLayout: c,
    execute: (l) => s({
      ...l,
      layout: n,
      options: t
    }),
    executeRequest: s,
    compareLegacy: (l) => {
      const p = Ao(l);
      return P(l, p), p;
    }
  };
}
export {
  Do as a,
  so as b,
  P as c,
  Ao as e,
  U as f,
  co as g,
  _o as r,
  B as s
};
