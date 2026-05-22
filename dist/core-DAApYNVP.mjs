import { a as w, f as O, j as H, k as U, l as V, d as x, o as h, s as R, E as K } from "./utils-BCVYGne6.mjs";
import { d as _, a as X, c as J, b as Q, e as Y } from "./migration-qxxmsuZ8.mjs";
function Z(o, e) {
  const n = S(o);
  let t = n[0];
  for (let i = 1, a = n.length; i < a; i++) {
    const c = n[i];
    e > o[c] && (t = c);
  }
  return t;
}
function q(o, e) {
  if (!e[o])
    throw new Error(
      "ResponsiveVueGridLayout: `cols` entry for breakpoint " + o + " is missing!"
    );
  return e[o];
}
function D(o, e, n, t, i, a) {
  if (o[n]) return w(o[n]);
  let c = o[t];
  const s = S(e), r = s.slice(
    s.indexOf(n)
  );
  for (let l = 0, y = r.length; l < y; l++) {
    const p = r[l];
    if (o[p]) {
      c = o[p];
      break;
    }
  }
  return c = w(c || []), O(H(c, { cols: i }), a, i);
}
function S(o) {
  return Object.keys(o).sort(function(n, t) {
    return o[n] - o[t];
  });
}
const Eo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  findOrGenerateResponsiveLayout: D,
  getBreakpointFromWidth: Z,
  getColsFromBreakpoint: q,
  sortBreakpoints: S
}, Symbol.toStringTag, { value: "Module" })), N = 1 / 0, G = "__dropping-elem__", W = () => {
  const o = typeof performance != "undefined" ? performance : null;
  return o && typeof o.now == "function" ? o.now() : Date.now();
}, oo = (o) => `layout-rev-${o}`, to = (o) => typeof o.diagnostics == "object" ? o.diagnostics : {}, no = (o) => {
  if (o.debug) return !0;
  const e = o.options.diagnostics;
  return typeof e == "object" && e.debug === !0;
}, P = (o) => ({
  ...o,
  maxRows: typeof o.maxRows == "number" ? o.maxRows : N,
  allowOverlap: !!o.allowOverlap,
  preventCollision: !!o.preventCollision,
  indexStrategy: o.indexStrategy || _()
}), T = (o) => typeof o == "number" && Number.isFinite(o) && o > 0, eo = (o) => o === "sw" || o === "w" || o === "nw", io = (o) => o === "ne" || o === "n" || o === "nw", B = (o, e, n) => Math.max(e, Math.min(o, n)), E = (o) => w(o), z = (o) => `${o.x}:${o.y}:${o.w}:${o.h}:${!!o.moved}`, L = (o, e) => {
  if (o === e) return !0;
  if (o.length !== e.length) return !1;
  for (let n = 0; n < o.length; n++) {
    const t = o[n], i = e[n];
    if (!t || !i || t.i !== i.i || z(t) !== z(i)) return !1;
  }
  return !0;
}, k = (o, e, n) => {
  const t = [], i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  return o.forEach((c) => i.set(c.i, c)), e.forEach((c) => a.set(c.i, c)), e.forEach((c) => {
    const s = i.get(c.i);
    if (!s) {
      t.push({ type: "add", item: x(c) });
      return;
    }
    (s.w !== c.w || s.h !== c.h || s.x !== c.x || s.y !== c.y) && (s.w !== c.w || s.h !== c.h ? t.push({
      type: "resize",
      id: c.i,
      from: { w: s.w, h: s.h, x: s.x, y: s.y },
      to: { w: c.w, h: c.h, x: c.x, y: c.y }
    }) : t.push({
      type: "move",
      id: c.i,
      from: { x: s.x, y: s.y },
      to: { x: c.x, y: c.y }
    }));
  }), o.forEach((c) => {
    a.has(c.i) || t.push({ type: "remove", id: c.i });
  }), n && t.length > 1 && t.push({
    type: "compact",
    affectedIds: t.map((c) => c.type === "add" ? c.item.i : c.type === "compact" ? "" : c.id).filter(Boolean)
  }), t;
}, $ = (o, e) => {
  const n = /* @__PURE__ */ new Set();
  return o.forEach((t) => {
    t.type === "compact" ? t.affectedIds.forEach((i) => n.add(i)) : t.type === "add" ? n.add(t.item.i) : n.add(t.id);
  }), e.forEach((t) => n.add(t.i)), Array.from(n);
}, M = (o, e) => (e.indexStrategy || _()).build(o, {
  cols: e.cols,
  maxRows: e.maxRows,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), ao = (o) => o.type === "add" ? o.item.i : o.type === "compact" ? null : o.id, co = (o, e, n, t) => {
  const i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  e.forEach((c) => i.set(c.i, c)), n.forEach((c) => a.set(c.i, c));
  try {
    for (let c = 0; c < t.length; c++) {
      const s = t[c];
      if (s.type === "compact") continue;
      if (s.type === "add") {
        const p = a.get(s.item.i) || s.item;
        o.insert(p);
        continue;
      }
      if (s.type === "remove") {
        o.remove(s.id);
        continue;
      }
      const r = ao(s);
      if (!r) continue;
      const l = i.get(r), y = a.get(r);
      if (!l || !y) return !1;
      o.update(l, y);
    }
    return !0;
  } catch (c) {
    return !1;
  }
}, so = (o, e, n, t, i, a, c, s) => {
  var y, p;
  const r = W() - a, l = {
    operationId: o.id,
    operationType: o.operation.type,
    phase: o.phase,
    layoutSize: o.layout.length,
    affectedCount: $(t, i).length,
    collisionCount: i.length,
    indexHit: c,
    schedulerMode: (y = o.options.scheduler) == null ? void 0 : y.mode,
    executorKind: ((p = o.options.executor) == null ? void 0 : p.kind) || "main-thread",
    durationMs: r,
    computeMs: r
  };
  return no(o) && (l.debug = ro(o, e, n, t, i, s)), l;
}, ro = (o, e, n, t, i, a) => ({
  cols: o.options.cols,
  maxRows: o.options.maxRows,
  compactType: o.options.compactType,
  allowOverlap: o.options.allowOverlap,
  preventCollision: o.options.preventCollision,
  operation: o.operation,
  result: {
    status: e,
    affectedIds: $(t, i),
    collisionIds: i.map((c) => c.i),
    blockedReason: a
  }
}), lo = (o, e) => {
  const n = o.options.onEvent;
  if (!n || !e.diagnostics) return;
  n({
    type: "operation",
    id: e.id,
    operationType: o.operation.type,
    phase: o.phase,
    diagnostics: e.diagnostics
  }), e.status === "blocked" && e.blocked && n({
    type: "blocked",
    id: e.id,
    reason: e.blocked.reason,
    itemIds: e.blocked.itemIds,
    diagnostics: e.diagnostics
  });
  const t = to(o.options).budgetMs;
  typeof t == "number" && e.diagnostics.durationMs > t && n({
    type: "budget-warning",
    id: e.id,
    message: `layout operation exceeded ${t}ms`,
    diagnostics: e.diagnostics
  });
}, v = (o, e, n, t, i, a, c, s = {}) => {
  var y;
  const r = $(t, i), l = {
    id: o.id,
    status: e,
    layout: n,
    patches: t,
    affectedIds: r,
    collisions: i,
    diagnostics: so(
      o,
      e,
      n,
      t,
      i,
      a,
      c,
      (y = s.blocked) == null ? void 0 : y.reason
    ),
    ...s
  };
  return lo(o, l), l;
}, f = (o, e, n, t, i, a = n.map((c) => c.i)) => v(o, "blocked", o.layout, [], n, t, i, {
  blocked: { reason: e, itemIds: a }
}), C = (o, e, n, t) => v(o, "noop", o.layout, [], [], e, n, { placeholder: t }), b = (o, e) => e.allowOverlap || e.compactType == null ? o : O(o, e.compactType, e.cols, e.allowOverlap), F = (o) => {
  for (let e = 0; e < o.length; e++)
    o[e].moved && (o[e].moved = !1);
  return o;
}, po = (o) => {
  const e = /* @__PURE__ */ new Set(), n = [];
  return o.forEach((t) => {
    e.has(t.i) || (e.add(t.i), n.push(t));
  }), n;
}, yo = (o, e) => {
  const n = o.operation;
  if (n.type !== "groupMove")
    return { ok: !1, result: I(o, "invalid groupMove operation", e) };
  if (!Number.isFinite(n.dx) || !Number.isFinite(n.dy))
    return {
      ok: !1,
      result: f(o, "invalid-input", [], e, !0)
    };
  const t = [], i = /* @__PURE__ */ new Set();
  if (n.ids.forEach((d) => {
    if (typeof d != "string") return;
    const u = d.trim();
    !u || i.has(u) || (i.add(u), t.push(u));
  }), t.length === 0)
    return {
      ok: !1,
      result: f(o, "invalid-input", [], e, !0)
    };
  const a = t.filter((d) => !h(o.layout, d));
  if (a.length > 0)
    return {
      ok: !1,
      result: f(o, "missing-item", [], e, !0, a)
    };
  const c = t.map((d) => h(o.layout, d)).filter(Boolean), s = c.filter((d) => d.static);
  if (s.length > 0)
    return {
      ok: !1,
      result: f(
        o,
        "static-item",
        s,
        e,
        !0,
        s.map((d) => d.i)
      )
    };
  const r = new Set(t), l = n.activeId && r.has(n.activeId) ? n.activeId : t[0], y = Math.trunc(n.dx), p = Math.trunc(n.dy), m = c.map((d) => ({
    ...x(d),
    x: d.x + y,
    y: d.y + p
  }));
  return {
    ok: !0,
    value: {
      ids: t,
      movingIds: r,
      activeId: l,
      dx: y,
      dy: p,
      movingItems: c,
      targetItems: m
    }
  };
}, fo = (o, e) => {
  const n = [], t = [];
  return o.targetItems.forEach((i) => {
    if (i.x < 0 || i.y < 0 || i.x + i.w > e.cols) {
      n.push(i.i);
      return;
    }
    Number.isFinite(e.maxRows) && i.y + i.h > e.maxRows && t.push(i.i);
  }), n.length > 0 ? { reason: "bounds", itemIds: n } : t.length > 0 ? { reason: "maxRows", itemIds: t } : null;
}, uo = (o, e, n) => po(
  o.targetItems.flatMap(
    (t) => e.queryAllCollisions(t).filter(
      (i) => !o.movingIds.has(i.i) && !0
    )
  )
), mo = (o, e, n) => {
  const t = E(o);
  return e.targetItems.forEach((i) => {
    const a = h(t, i.i);
    a && (a.x = i.x, a.y = i.y, a.moved = !0, n && (a.static = !0));
  }), t;
}, go = (o, e) => (e.movingItems.forEach((n) => {
  const t = h(o, n.i);
  t && (typeof n.static == "undefined" ? delete t.static : t.static = n.static);
}), o), ho = (o, e, n, t, i) => {
  const a = n.movingItems[0], c = n.targetItems[0];
  if (!a || !c)
    return f(o, "invalid-input", [], t, !0);
  if (a.x === c.x && a.y === c.y)
    return C(o, t, !0, x(a));
  if (i.some((u) => u.static)) {
    const u = i.filter((g) => g.static);
    return f(
      o,
      "static-item",
      u,
      t,
      !0,
      u.map((g) => g.i)
    );
  }
  if (i.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return f(o, "collision", i, t, !0);
  const s = E(o.layout), r = h(s, a.i);
  if (!r) return f(o, "missing-item", [], t, !0, [a.i]);
  const l = R(
    s,
    r,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    c.x,
    c.y,
    o.operation.type === "groupMove" ? o.operation.userAction !== !1 : !0,
    o.options.preventCollision
  ), y = F(b(l, o.options)), p = k(o.layout, y, o.options.compactType), m = h(y, a.i) || r, d = p.length === 0 || L(o.layout, y) ? "noop" : "changed";
  return v(
    o,
    d,
    d === "noop" ? o.layout : y,
    p,
    i,
    t,
    !0,
    { placeholder: x(m) }
  );
}, xo = (o, e, n) => {
  const t = yo(o, n);
  if (!t.ok) return t.result;
  const i = t.value, a = i.movingItems.find((g) => g.i === i.activeId) || i.movingItems[0], c = fo(i, o.options);
  if (c)
    return f(o, c.reason, [], n, !0, c.itemIds);
  if (i.dx === 0 && i.dy === 0 && a)
    return C(o, n, !0, x(a));
  const s = uo(i, e), r = s.filter((g) => g.static);
  if (r.length > 0)
    return f(
      o,
      "static-item",
      r,
      n,
      !0,
      r.map((g) => g.i)
    );
  if (i.ids.length === 1)
    return ho(o, e, i, n, s);
  if (s.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return f(o, "collision", s, n, !0);
  const l = !o.options.allowOverlap, y = mo(o.layout, i, l);
  let p = y;
  o.options.allowOverlap || (p = O(
    y,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap
  )), p = F(go(p, i));
  const m = k(o.layout, p, o.options.compactType), d = h(p, i.activeId) || a, u = m.length === 0 || L(o.layout, p) ? "noop" : "changed";
  return v(
    o,
    u,
    u === "noop" ? o.layout : p,
    m,
    s,
    n,
    !0,
    d ? { placeholder: x(d) } : {}
  );
}, vo = (o, e, n) => {
  const t = o.operation;
  if (t.type !== "move") return I(o, "invalid move operation", n);
  const i = h(o.layout, t.id);
  if (!i) return f(o, "missing-item", [], n, !0, [t.id]);
  if (i.static && i.isDraggable !== !0)
    return f(o, "static-item", [], n, !0, [t.id]);
  if (i.x === t.x && i.y === t.y)
    return C(o, n, !0, x(i));
  const a = { ...i, x: t.x, y: t.y }, c = e.queryAllCollisions(a);
  if (c.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return f(o, "collision", c, n, !0);
  const s = E(o.layout), r = h(s, t.id);
  if (!r) return f(o, "missing-item", [], n, !0, [t.id]);
  const l = R(
    s,
    r,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    t.x,
    t.y,
    t.userAction !== !1,
    o.options.preventCollision
  ), y = F(b(l, o.options)), p = k(o.layout, y, o.options.compactType), m = h(y, t.id) || r, d = p.length === 0 || L(o.layout, y) ? "noop" : "changed";
  return v(o, d, d === "noop" ? o.layout : y, p, c, n, !0, {
    placeholder: x(m)
  });
}, wo = (o, e, n) => {
  let t = B(
    e.w,
    typeof o.minW == "number" ? o.minW : 1,
    typeof o.maxW == "number" ? o.maxW : n.cols
  ), i = B(
    e.h,
    typeof o.minH == "number" ? o.minH : 1,
    typeof o.maxH == "number" ? o.maxH : n.maxRows || N
  ), a = typeof e.x == "number" ? e.x : o.x, c = typeof e.y == "number" ? e.y : o.y, s = !1;
  return typeof e.x != "number" && eo(e.handle) && (a = o.x + (o.w - t), a < 0 && (a = 0, t = o.w), s = !0), typeof e.y != "number" && io(e.handle) && (c = o.y + (o.h - i), c < 0 && (c = 0, i = o.h), s = !0), a < 0 || c < 0 ? { x: a, y: c, w: t, h: i, moved: s, reason: "bounds" } : a + t > n.cols ? { x: a, y: c, w: t, h: i, moved: s, reason: "bounds" } : Number.isFinite(n.maxRows) && c + i > n.maxRows ? { x: a, y: c, w: t, h: i, moved: s, reason: "maxRows" } : { x: a, y: c, w: t, h: i, moved: s || a !== o.x || c !== o.y };
}, bo = (o, e, n) => {
  const t = o.operation;
  if (t.type !== "resize") return I(o, "invalid resize operation", n);
  const i = h(o.layout, t.id);
  if (!i) return f(o, "missing-item", [], n, !0, [t.id]);
  if (!T(t.w) || !T(t.h))
    return f(o, "invalid-input", [], n, !0, [t.id]);
  const a = wo(i, t, o.options);
  if (a.reason)
    return f(o, a.reason, [], n, !0, [t.id]);
  if (i.w === a.w && i.h === a.h && i.x === a.x && i.y === a.y)
    return C(o, n, !0, x(i));
  const c = {
    ...i,
    x: a.x,
    y: a.y,
    w: a.w,
    h: a.h
  }, s = e.queryAllCollisions(c);
  if (s.length > 0 && o.options.preventCollision && !o.options.allowOverlap)
    return f(o, "collision", s, n, !0);
  const r = E(o.layout), l = h(r, t.id);
  if (!l) return f(o, "missing-item", [], n, !0, [t.id]);
  l.w = a.w, l.h = a.h;
  let y = r;
  a.moved ? y = R(
    r,
    l,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap,
    a.x,
    a.y,
    !0,
    o.options.preventCollision
  ) : (l.x = a.x, l.y = a.y);
  const p = F(b(y, o.options)), m = k(o.layout, p, o.options.compactType), d = h(p, t.id) || l, u = m.length === 0 || L(o.layout, p) ? "noop" : "changed";
  return v(o, u, u === "noop" ? o.layout : p, m, s, n, !0, {
    placeholder: x(d)
  });
}, Io = (o, e, n) => {
  const t = o.operation;
  if (t.type !== "dropFit") return I(o, "invalid dropFit operation", n);
  const i = Math.floor(t.item.w), a = Math.floor(t.item.h);
  if (!T(i) || !T(a))
    return f(o, "invalid-input", [], n, !0);
  const c = t.item.i || G, s = o.layout.filter((g) => g.i !== c), r = M(s, o.options);
  let l = null, y = "none";
  if (t.strategy === "cursor" && t.target) {
    const g = {
      i: c,
      x: Math.max(0, Math.floor(t.target.x)),
      y: Math.max(0, Math.floor(t.target.y)),
      w: i,
      h: a
    };
    r.canPlace(g) ? l = { x: g.x, y: g.y } : (l = r.findNearestFit({ w: i, h: a }, t.target), y = l ? "nearest-fit" : "none");
  } else
    l = r.findFirstFit({ w: i, h: a }), y = l ? "first-fit" : "none";
  if (!l)
    return v(o, "blocked", o.layout, [], [], n, !0, {
      blocked: { reason: "collision", itemIds: [] },
      drop: {
        position: null,
        strategy: t.strategy,
        fallback: y,
        reason: "no-fit"
      }
    });
  const p = {
    ...t.item,
    i: c,
    x: l.x,
    y: l.y,
    w: i,
    h: a,
    static: !1
  }, m = [...s.map(x), p], d = b(m, o.options), u = k(o.layout, d, o.options.compactType);
  return v(o, "changed", d, u, [], n, !0, {
    placeholder: x(p),
    drop: {
      position: l,
      strategy: t.strategy,
      fallback: y
    }
  });
}, Lo = (o, e) => {
  if (o.options.allowOverlap || o.options.compactType == null)
    return C(o, e, !1);
  const n = O(
    o.layout,
    o.options.compactType,
    o.options.cols,
    o.options.allowOverlap
  ), t = k(o.layout, n, o.options.compactType), i = t.length === 0 || L(o.layout, n) ? "noop" : "changed";
  return v(o, i, i === "noop" ? o.layout : n, t, [], e, !1);
}, ko = (o, e) => {
  try {
    return K(o.layout, "LayoutEngine.layout"), C(o, e, !1);
  } catch (n) {
    return v(o, "error", o.layout, [], [], e, !1, {
      error: {
        message: n instanceof Error ? n.message : String(n),
        cause: n
      }
    });
  }
}, Mo = (o, e) => {
  const n = o.operation;
  if (n.type !== "generateResponsiveLayout")
    return I(o, "invalid responsive operation", e);
  const t = n.breakpoints || { [n.breakpoint]: 0 }, i = n.layouts || { [n.sourceBreakpoint || n.breakpoint]: o.layout }, a = D(
    i,
    t,
    n.breakpoint,
    n.sourceBreakpoint || n.breakpoint,
    n.cols,
    o.options.compactType
  ), c = k(o.layout, a, o.options.compactType), s = c.length === 0 || L(o.layout, a) ? "noop" : "changed";
  return v(o, s, s === "noop" ? o.layout : a, c, [], e, !1);
}, I = (o, e, n, t) => v(o, "error", o.layout, [], [], n, !1, {
  error: { message: e, cause: t }
}), Co = (o) => {
  const e = o.options;
  switch (o.operation.type) {
    case "move": {
      const n = w(o.layout), t = h(n, o.operation.id);
      if (!t) return o.layout;
      const i = R(
        n,
        t,
        e.compactType,
        e.cols,
        e.allowOverlap,
        o.operation.x,
        o.operation.y,
        o.operation.userAction !== !1,
        e.preventCollision
      );
      return b(i, e);
    }
    case "groupMove": {
      const n = Array.from(new Set(o.operation.ids.filter(Boolean)));
      if (n.length !== 1) return o.layout;
      const t = w(o.layout), i = h(t, n[0]);
      if (!i) return o.layout;
      const a = R(
        t,
        i,
        e.compactType,
        e.cols,
        e.allowOverlap,
        i.x + Math.trunc(o.operation.dx),
        i.y + Math.trunc(o.operation.dy),
        o.operation.userAction !== !1,
        e.preventCollision
      );
      return b(a, e);
    }
    case "compact":
      return e.allowOverlap || e.compactType == null ? o.layout : O(o.layout, e.compactType, e.cols, e.allowOverlap);
    case "dropFit": {
      const n = o.operation.item.i || G, t = o.layout.filter((a) => a.i !== n), i = o.operation.strategy === "auto" || !o.operation.target ? U(t, o.operation.item, e.cols, e.maxRows) : V(
        t,
        o.operation.item,
        e.cols,
        o.operation.target.x,
        o.operation.target.y,
        e.maxRows
      );
      return i ? b([
        ...t.map(x),
        {
          ...o.operation.item,
          i: n,
          x: i.x,
          y: i.y,
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
function A(o, e) {
  if (o.operation.type === "migrateSettings" || o.operation.type === "repairCollisions" || o.operation.type === "translateLayout" || o.operation.type === "placeItems")
    return { matches: !0, differences: [] };
  if (o.operation.type === "groupMove" && o.operation.ids.length > 1)
    return { matches: !0, differences: [] };
  const n = Co(o), t = [], i = /* @__PURE__ */ new Map();
  return e.layout.forEach((a) => i.set(a.i, a)), n.length !== e.layout.length && t.push(`length:${n.length}->${e.layout.length}`), n.forEach((a, c) => {
    const s = i.get(a.i);
    if (!s) {
      t.push(`${a.i}:missing`);
      return;
    }
    (a.x !== s.x || a.y !== s.y || a.w !== s.w || a.h !== s.h) && t.push(
      `${a.i}@${c}:${a.x},${a.y},${a.w},${a.h}->${s.x},${s.y},${s.w},${s.h}`
    );
  }), { matches: t.length === 0, differences: t };
}
function j(o, e) {
  const n = W(), t = P(o.options), i = { ...o, options: t };
  try {
    const a = e || M(i.layout, t);
    switch (i.operation.type) {
      case "move":
        return vo(i, a, n);
      case "groupMove":
        return xo(i, a, n);
      case "resize":
        return bo(i, a, n);
      case "dropFit":
        return Io(i, a, n);
      case "compact":
        return Lo(i, n);
      case "validate":
        return ko(i, n);
      case "generateResponsiveLayout":
        return Mo(i, n);
      case "migrateSettings":
        return Y(i, n);
      case "repairCollisions":
        return Q(i, n);
      case "translateLayout":
        return J(i, n);
      case "placeItems":
        return X(i, n);
      default:
        return I(i, "unknown layout operation", n);
    }
  } catch (a) {
    return I(
      i,
      a instanceof Error ? a.message : String(a),
      n,
      a
    );
  }
}
function Ro(o) {
  return j(o);
}
function Fo(o, e = []) {
  const n = P(o);
  let t = w(e), i = M(t, n), a = 0;
  const c = (r) => {
    t = w(r), i = M(t, n), a++;
  }, s = (r) => {
    var m;
    const l = r.layout === t || L(r.layout, t), y = l ? i : M(r.layout, n), p = j(r, y);
    if (n.compareLegacy) {
      const d = A(r, p);
      d.matches || (m = n.onEvent) == null || m.call(n, {
        type: "legacy-mismatch",
        id: r.id,
        message: "layout engine result differs from legacy path",
        diagnostics: p.diagnostics,
        details: d.differences
      });
    }
    if (p.status === "changed" || p.status === "fallback") {
      const d = t;
      t = w(p.layout), l && p.patches.length > 0 && co(i, d, t, p.patches) || (i = M(t, n)), a++;
    }
    return p;
  };
  return {
    getLayout: () => w(t),
    getRevision: () => oo(a),
    setLayout: c,
    execute: (r) => s({
      ...r,
      layout: t,
      options: n
    }),
    executeRequest: s,
    compareLegacy: (r) => {
      const l = Ro(r);
      return A(r, l), l;
    }
  };
}
export {
  Fo as a,
  q as b,
  A as c,
  Ro as e,
  D as f,
  Z as g,
  Eo as r,
  S as s
};
