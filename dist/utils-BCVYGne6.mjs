import { deepEqual as Q } from "fast-equals";
import { Fragment as Z } from "vue";
const P = Array.isArray;
function z(n) {
  let t = 0, e;
  for (let r = 0, s = n.length; r < s; r++)
    e = n[r].y + n[r].h, e > t && (t = e);
  return t;
}
function j(n) {
  const t = Array(n.length);
  for (let e = 0, r = n.length; e < r; e++)
    t[e] = p(n[e]);
  return t;
}
function U(n, t) {
  const e = Array(n.length);
  for (let r = 0, s = n.length; r < s; r++)
    t.i === n[r].i ? e[r] = t : e[r] = n[r];
  return e;
}
function T(n, t, e) {
  let r = -1;
  for (let o = 0, f = n.length; o < f; o++)
    if (n[o].i === t) {
      r = o;
      break;
    }
  if (r === -1) return [n, null];
  const s = e(p(n[r])), i = n.slice(0);
  return i[r] = s, [i, s];
}
function p(n) {
  return {
    w: n.w,
    h: n.h,
    x: n.x,
    y: n.y,
    i: n.i,
    minW: n.minW,
    maxW: n.maxW,
    minH: n.minH,
    maxH: n.maxH,
    moved: !!n.moved,
    static: !!n.static,
    // These can be null/undefined
    isDraggable: n.isDraggable,
    isResizable: n.isResizable,
    resizeHandles: n.resizeHandles,
    isBounded: n.isBounded
  };
}
function nn(n, t) {
  var e, r, s, i, o, f;
  if (!P(n) || !P(t) || n.length !== t.length) return !1;
  for (let c = 0; c < n.length; c++)
    if (((e = n[c]) == null ? void 0 : e.key) !== ((r = t[c]) == null ? void 0 : r.key) || !Q((i = (s = n[c]) == null ? void 0 : s.props) == null ? void 0 : i["data-grid"], (f = (o = t[c]) == null ? void 0 : o.props) == null ? void 0 : f["data-grid"]))
      return !1;
  return !0;
}
function tn(n) {
  const t = [];
  function e(r) {
    if (r.type === Z) {
      const s = r.children;
      for (const i of s)
        e(i);
    } else
      t.push(r);
  }
  return e(n), t;
}
function y(n, t) {
  return !(n.i === t.i || n.x + n.w <= t.x || n.x >= t.x + t.w || n.y + n.h <= t.y || n.y >= t.y + t.h);
}
function V(n, t, e, r) {
  const s = N(n), i = F(s, n.length), o = D(n, t), f = /* @__PURE__ */ new Map();
  for (let h = 0; h < n.length; h++) f.set(n[h].i, h);
  const c = /* @__PURE__ */ new Map();
  for (let h = 0; h < o.length; h++) c.set(o[h].i, h);
  const x = Array(n.length);
  for (let h = 0, g = o.length; h < g; h++) {
    let a = p(o[h]);
    a.static || (a = k(
      s,
      a,
      t,
      e,
      o,
      r,
      c,
      i
    ), s.push(a), L(i, a, s.length - 1));
    const d = f.get(o[h].i);
    x[typeof d == "number" ? d : h] = a, a.moved = !1;
  }
  return x;
}
function en(n, t, e, r) {
  const s = N(n), i = F(s, n.length), o = D(n, t), f = /* @__PURE__ */ new Map();
  for (let c = 0; c < o.length; c++) f.set(o[c].i, c);
  for (let c = 0, x = o.length; c < x; c++) {
    const h = o[c];
    h && (h.static || (k(
      s,
      h,
      t,
      e,
      o,
      r,
      f,
      i
    ), s.push(h), L(i, h, s.length - 1)), h.moved = !1);
  }
  return n;
}
const rn = { x: "w", y: "h" };
function C(n, t, e, r, s, i) {
  const o = rn[r];
  t[r] += 1;
  let f = s;
  if (typeof f != "number") {
    const c = i == null ? void 0 : i.get(t.i);
    if (typeof c == "number")
      f = c;
    else
      for (let x = 0; x < n.length; x++)
        if (n[x].i === t.i) {
          f = x;
          break;
        }
  }
  for (let c = (f != null ? f : -1) + 1; c < n.length; c++) {
    const x = n[c];
    if (!x.static) {
      if (x.y > t.y + t.h) break;
      y(t, x) && C(
        n,
        x,
        e + t[o],
        r,
        c,
        i
      );
    }
  }
  t[r] = e;
}
function k(n, t, e, r, s, i, o, f) {
  const c = e === "vertical", x = e === "horizontal", h = (a) => f ? _(n, a, f) : b(n, a);
  if (c) {
    if (t.y = Math.min(z(n), t.y), !h(t)) {
      let a = 0;
      for (let d = 0, u = n.length; d < u; d++) {
        const l = n[d];
        if (l.y + l.h > t.y || t.x + t.w <= l.x || t.x >= l.x + l.w) continue;
        const w = l.y + l.h;
        w > a && (a = w);
      }
      t.y = a;
    }
  } else if (x && !h(t)) {
    let a = 0;
    for (let d = 0, u = n.length; d < u; d++) {
      const l = n[d];
      if (l.x + l.w > t.x || t.y + t.h <= l.y || t.y >= l.y + l.h) continue;
      const w = l.x + l.w;
      w > a && (a = w);
    }
    t.x = a;
  }
  let g;
  for (; (g = h(t)) && !(e === null && i); )
    if (x ? C(
      s,
      t,
      g.x + g.w,
      "x",
      void 0,
      o
    ) : C(
      s,
      t,
      g.y + g.h,
      "y",
      void 0,
      o
    ), x && t.x + t.w > r)
      for (t.x = r - t.w, t.y++; t.x > 0 && !h(t); )
        t.x--;
  return t.y = Math.max(t.y, 0), t.x = Math.max(t.x, 0), t;
}
function X(n, t) {
  const e = N(n);
  for (let r = 0, s = n.length; r < s; r++) {
    const i = n[r];
    if (i.x + i.w > t.cols && (i.x = t.cols - i.w), i.x < 0 && (i.x = 0, i.w = t.cols), !i.static) e.push(i);
    else
      for (; b(e, i); )
        i.y++;
  }
  return n;
}
function sn(n, t) {
  for (let e = 0, r = n.length; e < r; e++)
    if (n[e].i === t) return n[e];
}
function b(n, t) {
  for (let e = 0, r = n.length; e < r; e++)
    if (y(n[e], t)) return n[e];
}
function v(n, t, e, r = 1 / 0) {
  const s = Math.floor(t.w), i = Math.floor(t.h), o = Math.floor(e), f = Number.isFinite(r) ? Math.floor(r) : 1 / 0;
  if (!Number.isFinite(s) || s <= 0 || !Number.isFinite(i) || i <= 0 || !Number.isFinite(o) || o <= 0 || s > o || Number.isFinite(f) && i > f) return null;
  let c = Math.max(0, Math.ceil(z(n)));
  if (Number.isFinite(f) && (c = Math.min(c, f - i)), c < 0) return null;
  const x = F(n, n.length);
  for (let h = 0; h <= c; h++)
    for (let g = 0; g <= o - s; g++)
      if (!_(n, {
        i: "__fit__",
        x: g,
        y: h,
        w: s,
        h: i
      }, x))
        return { x: g, y: h };
  return null;
}
function on(n, t, e, r, s, i = 1 / 0) {
  const o = Math.floor(t.w), f = Math.floor(t.h), c = Math.floor(e), x = Number.isFinite(i) ? Math.floor(i) : 1 / 0;
  if (!Number.isFinite(o) || o <= 0 || !Number.isFinite(f) || f <= 0 || !Number.isFinite(c) || c <= 0 || o > c || Number.isFinite(x) && f > x) return null;
  const h = F(n, n.length), g = (u, l) => u < 0 || u + o > c || l < 0 || Number.isFinite(x) && l + f > x ? !1 : !_(n, { i: "__fit__", x: u, y: l, w: o, h: f }, h), a = (u, l) => {
    const w = u + o / 2, K = l + f / 2, I = w - r, Y = K - s;
    return I * I + Y * Y;
  };
  if (n.length === 0) {
    const u = Math.max(0, Math.min(Math.round(r), c - o)), l = Math.max(0, Math.round(s));
    return g(u, l) ? { x: u, y: l } : v([], t, e, i);
  }
  const d = [];
  for (const u of n) {
    const l = [
      { x: u.x - o, y: u.y },
      { x: u.x + u.w, y: u.y },
      { x: u.x, y: u.y - f },
      { x: u.x, y: u.y + u.h },
      { x: u.x - o, y: u.y - f },
      { x: u.x + u.w, y: u.y - f },
      { x: u.x - o, y: u.y + u.h },
      { x: u.x + u.w, y: u.y + u.h }
    ];
    for (const w of l)
      g(w.x, w.y) && d.push({ x: w.x, y: w.y, dist: a(w.x, w.y) });
  }
  return d.length > 0 ? (d.sort((u, l) => u.dist - l.dist), { x: d[0].x, y: d[0].y }) : v(n, t, e, i);
}
function F(n, t) {
  const e = {
    rows: /* @__PURE__ */ new Map(),
    seen: new Uint32Array(t),
    stamp: 1
  };
  for (let r = 0; r < n.length; r++)
    L(e, n[r], r);
  return e;
}
function L(n, t, e) {
  if (!Number.isFinite(t.y) || !Number.isFinite(t.h)) return;
  const r = Math.floor(t.y);
  let s = Math.floor(t.y + t.h - 1);
  s < r && (s = r);
  for (let i = r; i <= s; i++) {
    let o = n.rows.get(i);
    o || (o = [], n.rows.set(i, o)), o.push(e);
  }
}
function _(n, t, e) {
  if (!Number.isFinite(t.y) || !Number.isFinite(t.h) || !Number.isFinite(t.x) || !Number.isFinite(t.w))
    return b(n, t);
  e.stamp = e.stamp + 1 >>> 0, e.stamp === 0 && (e.seen.fill(0), e.stamp = 1);
  const r = e.seen, s = e.stamp, i = Math.floor(t.y);
  let o = Math.floor(t.y + t.h - 1);
  o < i && (o = i);
  let f = 1 / 0;
  for (let c = i; c <= o; c++) {
    const x = e.rows.get(c);
    if (x)
      for (let h = 0; h < x.length; h++) {
        const g = x[h];
        if (r[g] === s) continue;
        r[g] = s;
        const a = n[g];
        a && y(a, t) && g < f && (f = g);
      }
  }
  return Number.isFinite(f) ? n[f] : void 0;
}
function q(n, t) {
  const e = [];
  for (let r = 0, s = n.length; r < s; r++) {
    const i = n[r];
    y(i, t) && e.push(i);
  }
  return e;
}
function N(n) {
  return n.filter((t) => t.static);
}
function m(n, t, e, r, s, i, o, f, c) {
  if (t.static && t.isDraggable !== !0 || t.y === o && t.x === i) return n;
  $(
    `Moving element ${t.i} to [${String(i)},${String(o)}] from [${t.x},${t.y}]`
  );
  const x = t.x, h = t.y;
  typeof i == "number" && (t.x = i), typeof o == "number" && (t.y = o), t.moved = !0;
  const g = e === "vertical" && typeof o == "number" ? h >= o : e === "horizontal" && typeof i == "number" ? x >= i : !1;
  let a = q(n, t);
  const d = a.length > 0;
  if (d && s)
    return j(n);
  if (d && c)
    return $(`Collision prevented on ${t.i}, reverting.`), t.x = x, t.y = h, t.moved = !1, n;
  d && e === "vertical" ? a = a.sort((u, l) => u.y > l.y || u.y === l.y && u.x > l.x ? 1 : u.y === l.y && u.x === l.x ? 0 : -1) : d && e === "horizontal" && (a = a.sort((u, l) => u.x > l.x || u.x === l.x && u.y > l.y ? 1 : u.x === l.x && u.y === l.y ? 0 : -1)), d && g && (a = a.reverse());
  for (let u = 0, l = a.length; u < l; u++) {
    const w = a[u];
    $(
      `Resolving collision between ${t.i} at [${t.x},${t.y}] and ${w.i} at [${w.x},${w.y}]`
    ), !w.moved && (w.static ? n = M(
      n,
      w,
      t,
      e,
      r,
      f
    ) : n = M(
      n,
      t,
      w,
      e,
      r,
      f
    ));
  }
  return n;
}
function M(n, t, e, r, s, i) {
  const o = r === "horizontal", f = r === "vertical", c = t.static;
  if (r == null)
    return m(
      n,
      e,
      r,
      s,
      !1,
      e.x,
      t.y + t.h,
      !1,
      c
    );
  if (i) {
    i = !1;
    const g = {
      x: o ? Math.max(t.x - e.w, 0) : e.x,
      y: f ? Math.max(t.y - e.h, 0) : e.y,
      w: e.w,
      h: e.h,
      i: "-1"
    }, a = b(n, g), d = a && a.y + a.h > t.y, u = a && t.x + t.w > a.x;
    if (a) {
      if (d && f)
        return m(
          n,
          e,
          r,
          s,
          !1,
          void 0,
          t.y + 1,
          i,
          c
        );
      if (u && o)
        return m(
          n,
          t,
          r,
          s,
          !1,
          e.x,
          void 0,
          i,
          c
        );
    } else return $(
      `Doing reverse collision on ${e.i} up to [${g.x},${g.y}].`
    ), m(
      n,
      e,
      r,
      s,
      !1,
      o ? g.x : void 0,
      f ? g.y : void 0,
      i,
      c
    );
  }
  const x = o ? e.x + 1 : void 0, h = f ? e.y + 1 : void 0;
  return x == null && h == null ? n : m(
    n,
    e,
    r,
    s,
    !1,
    o ? e.x + 1 : void 0,
    f ? e.y + 1 : void 0,
    i,
    c
  );
}
function fn(n) {
  return n * 100 + "%";
}
const O = (n, t, e, r) => n + e > r ? t : e, G = (n, t, e) => n < 0 ? t : e, S = (n) => Math.max(0, n), E = (n) => Math.max(0, n), H = (n, { left: t, height: e, width: r }, s) => {
  const i = n.top - (e - n.height);
  return {
    left: t,
    width: r,
    height: G(i, n.height, e),
    top: E(i)
  };
}, R = (n, { top: t, left: e, height: r, width: s }, i) => ({
  top: t,
  height: r,
  width: O(
    n.left,
    n.width,
    s,
    i
  ),
  left: S(e)
}), B = (n, { top: t, height: e, width: r }, s) => {
  const i = n.left - (r - n.width);
  return {
    height: e,
    width: i < 0 ? n.width : O(
      n.left,
      n.width,
      r,
      s
    ),
    top: E(t),
    left: S(i)
  };
}, A = (n, { top: t, left: e, height: r, width: s }, i) => ({
  width: s,
  left: e,
  height: G(t, n.height, r),
  top: E(t)
}), cn = (...n) => H(n[0], R(...n), n[2]), un = (...n) => H(n[0], B(...n), n[2]), hn = (...n) => A(n[0], R(...n), n[2]), ln = (...n) => A(n[0], B(...n), n[2]), an = {
  n: H,
  ne: cn,
  e: R,
  se: hn,
  s: A,
  sw: ln,
  w: B,
  nw: un
};
function xn(n, t, e, r) {
  const s = an[n];
  return s ? s(
    t,
    { ...t, ...e },
    r
  ) : e;
}
function gn({ top: n, left: t, width: e, height: r }) {
  const s = `translate3d(${t}px,${n}px,0)`;
  return {
    transform: s,
    WebkitTransform: s,
    MozTransform: s,
    msTransform: s,
    OTransform: s,
    width: `${e}px`,
    height: `${r}px`,
    position: "absolute"
  };
}
function dn({ top: n, left: t, width: e, height: r }) {
  return {
    top: `${n}px`,
    left: `${t}px`,
    width: `${e}px`,
    height: `${r}px`,
    position: "absolute"
  };
}
function D(n, t) {
  return t === "horizontal" ? J(n) : t === "vertical" ? W(n) : n;
}
function W(n) {
  return n.slice(0).sort(function(t, e) {
    return t.y > e.y || t.y === e.y && t.x > e.x ? 1 : t.y === e.y && t.x === e.x ? 0 : -1;
  });
}
function J(n) {
  return n.slice(0).sort(function(t, e) {
    return t.x > e.x || t.x === e.x && t.y > e.y ? 1 : -1;
  });
}
function wn(n, t, e, r, s, i) {
  n = n || [];
  const o = /* @__PURE__ */ new Map();
  for (let h = 0; h < n.length; h++)
    o.set(n[h].i, n[h]);
  const f = [];
  let c = 0;
  t.forEach((h) => {
    var w;
    if ((h == null ? void 0 : h.key) == null) return;
    const g = String(h.key), a = o.get(g), d = (w = h.props) == null ? void 0 : w["data-grid"];
    a && d == null ? f.push(p(a)) : d ? f.push(p({ ...d, i: g })) : f.push(
      p({
        w: 1,
        h: 1,
        x: 0,
        y: c,
        i: g
      })
    );
    const u = f[f.length - 1], l = u.y + u.h;
    l > c && (c = l), i && i(f);
  });
  const x = X(f, { cols: e });
  return s ? x : V(x, r, e);
}
function pn(n, t = "Layout") {
  const e = ["x", "y", "w", "h"];
  if (!Array.isArray(n))
    throw new Error(t + " must be an array!");
  for (let r = 0, s = n.length; r < s; r++) {
    const i = n[r];
    for (let o = 0; o < e.length; o++) {
      const f = e[o], c = i[f];
      if (typeof c != "number" || Number.isNaN(c))
        throw new Error(
          `VueGridLayout: ${t}[${r}].${f} must be a number! Received: ${c} (${typeof c})`
        );
    }
    if (typeof i.i != "undefined" && typeof i.i != "string") {
      const o = String(i.i);
      throw new Error(
        `VueGridLayout: ${t}[${r}].i must be a string! Received: ${o} (${typeof i.i})`
      );
    }
  }
}
function mn(n) {
  const { verticalCompact: t, compactType: e } = n || {};
  return t === !1 ? null : e || null;
}
function $(...n) {
}
const yn = () => {
}, Fn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  bottom: z,
  childrenEqual: nn,
  cloneLayout: j,
  cloneLayoutItem: p,
  collides: y,
  compact: V,
  compactInPlace: en,
  compactItem: k,
  compactType: mn,
  correctBounds: X,
  findFirstFit: v,
  findNearestFit: on,
  getAllCollisions: q,
  getFirstCollision: b,
  getLayoutItem: sn,
  getNonFragmentChildren: tn,
  getStatics: N,
  modifyLayout: U,
  moveElement: m,
  moveElementAwayFromCollision: M,
  noop: yn,
  perc: fn,
  resizeItemInDirection: xn,
  setTopLeft: dn,
  setTransform: gn,
  sortLayoutItems: D,
  sortLayoutItemsByColRow: J,
  sortLayoutItemsByRowCol: W,
  synchronizeLayoutWithChildren: wn,
  validateLayout: pn,
  withLayoutItem: T
}, Symbol.toStringTag, { value: "Module" }));
export {
  J as A,
  W as B,
  wn as C,
  Fn as D,
  pn as E,
  T as F,
  j as a,
  z as b,
  nn as c,
  p as d,
  y as e,
  V as f,
  en as g,
  k as h,
  mn as i,
  X as j,
  v as k,
  on as l,
  q as m,
  b as n,
  sn as o,
  tn as p,
  N as q,
  U as r,
  m as s,
  M as t,
  yn as u,
  fn as v,
  xn as w,
  dn as x,
  gn as y,
  D as z
};
