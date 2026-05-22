import { b as F } from "./utils-BCVYGne6.mjs";
function D(e) {
  const { margin: t, containerPadding: i, containerWidth: n, cols: l } = e;
  return (n - t[0] * (l - 1) - i[0] * 2) / l;
}
function O(e, t, i, n = "integer") {
  return Number.isFinite(e) ? m(
    t * e + Math.max(0, e - 1) * i,
    n
  ) : e;
}
function m(e, t = "integer") {
  return Number.isFinite(e) ? t === "subpixel" ? e : Math.round(e) : e;
}
function W(e, t, i, n, l, r) {
  const { margin: g, containerPadding: d, rowHeight: h, renderPrecision: a = "integer" } = e, s = D(e), o = {
    width: 0,
    height: 0,
    top: 0,
    left: 0
  };
  return r && r.resizing ? (o.width = m(r.resizing.width, a), o.height = m(r.resizing.height, a)) : (o.width = O(n, s, g[0], a), o.height = O(l, h, g[1], a)), r && r.dragging ? (o.top = m(r.dragging.top, a), o.left = m(r.dragging.left, a)) : r && r.resizing && typeof r.resizing.top == "number" && typeof r.resizing.left == "number" ? (o.top = m(r.resizing.top, a), o.left = m(r.resizing.left, a)) : (o.top = m((h + g[1]) * i + d[1], a), o.left = m((s + g[0]) * t + d[0], a)), o;
}
function j(e, t, i, n, l) {
  const { margin: r, containerPadding: g, cols: d, rowHeight: h, maxRows: a } = e, s = D(e);
  let o = Math.round((i - g[0]) / (s + r[0])), c = Math.round((t - g[1]) / (h + r[1]));
  return o = x(o, 0, d - n), c = x(c, 0, a - l), { x: o, y: c };
}
function G(e, t, i, n, l, r) {
  const { margin: g, maxRows: d, cols: h, rowHeight: a } = e, s = D(e), o = Math.round((t + g[0]) / (s + g[0])), c = Math.round((i + g[1]) / (a + g[1]));
  let I = x(o, 0, h - n), R = x(c, 0, d - l);
  return ["sw", "w", "nw"].indexOf(r) !== -1 && (I = x(o, 0, h)), ["nw", "n", "ne"].indexOf(r) !== -1 && (R = x(c, 0, d)), { w: I, h: R };
}
function x(e, t, i) {
  return Math.max(Math.min(e, i), t);
}
const Q = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  applyRenderPrecision: m,
  calcGridColWidth: D,
  calcGridItemPosition: W,
  calcGridItemWHPx: O,
  calcWH: G,
  calcXY: j,
  clamp: x
}, Symbol.toStringTag, { value: "Module" })), T = ["auto", "scroll", "fit", "fixed"], V = ["integer", "subpixel"], q = 150, C = 1, N = (e) => typeof e == "number" && Number.isFinite(e), p = (e) => N(e) && e > 0, E = (e, t, i) => Array.isArray(e) && N(e[t]) ? e[t] : i, z = (e) => {
  if (e == null || typeof e == "string" || typeof e == "boolean") return e;
  if (typeof e == "number") return Number.isFinite(e) ? e : String(e);
  if (Array.isArray(e)) return e.map(z);
  if (typeof e != "object") return String(e);
  const t = {};
  return Object.keys(e).sort().forEach((i) => {
    const n = e[i];
    typeof n == "function" || typeof n == "symbol" || (t[i] = z(n));
  }), t;
}, w = (e, t, i, n, l = {}) => {
  const r = e.context || {}, g = typeof l.details == "undefined" ? void 0 : z(l.details);
  return {
    code: t,
    level: i,
    message: n,
    layoutId: r.layoutId,
    profileId: r.profileId || void 0,
    targetView: r.targetView,
    ...l,
    details: g
  };
}, L = (e) => e.slice().sort((t, i) => {
  const n = [
    t.code,
    t.level,
    t.path || "",
    t.prop || "",
    t.layoutId || "",
    t.profileId || "",
    t.targetView || "",
    t.itemId || "",
    t.message
  ].join("|"), l = [
    i.code,
    i.level,
    i.path || "",
    i.prop || "",
    i.layoutId || "",
    i.profileId || "",
    i.targetView || "",
    i.itemId || "",
    i.message
  ].join("|");
  return n.localeCompare(l);
}), K = (e, t) => e.heightMode != null ? T.indexOf(e.heightMode) !== -1 ? e.heightMode : (t.push(w(
  e,
  "invalid-height-mode",
  "warning",
  "Invalid heightMode was ignored and auto height mode was used.",
  {
    prop: "heightMode",
    details: {
      received: e.heightMode,
      fallback: "auto",
      reason: "heightMode must be auto, scroll, fit, or fixed."
    }
  }
)), "auto") : e.autoSize === !1 ? "scroll" : "auto", Y = (e, t) => e.renderPrecision == null ? "integer" : V.indexOf(e.renderPrecision) !== -1 ? e.renderPrecision : (t.push(w(
  e,
  "invalid-render-precision",
  "warning",
  "Invalid renderPrecision was ignored and integer precision was used.",
  {
    prop: "renderPrecision",
    details: {
      received: e.renderPrecision,
      fallback: "integer",
      reason: "renderPrecision must be integer or subpixel."
    }
  }
)), "integer"), $ = (e, t) => {
  const i = p(e.defaultRowHeight) ? e.defaultRowHeight : q;
  return p(e.rowHeight) ? { rowHeight: e.rowHeight, defaultRowHeight: i } : (t.push(w(
    e,
    "invalid-row-height",
    "warning",
    "Invalid rowHeight was ignored and the default rowHeight was used.",
    {
      prop: "rowHeight",
      details: {
        received: e.rowHeight,
        fallback: i,
        reason: "rowHeight must be a finite number greater than 0."
      }
    }
  )), { rowHeight: i, defaultRowHeight: i });
}, X = (e, t) => typeof e.minRowHeight == "undefined" || e.minRowHeight == null ? C : p(e.minRowHeight) ? e.minRowHeight : (t.push(w(
  e,
  "invalid-min-row-height",
  "warning",
  "Invalid minRowHeight was ignored and the default minimum was used.",
  {
    prop: "minRowHeight",
    details: {
      received: e.minRowHeight,
      fallback: C,
      reason: "minRowHeight must be a finite number greater than 0."
    }
  }
)), C), B = (e, t) => {
  if (typeof e.containerHeight != "undefined" && e.containerHeight !== null) {
    if (p(e.containerHeight))
      return { height: e.containerHeight, source: "container-height" };
    t.push(w(
      e,
      "invalid-container-height",
      "warning",
      "Invalid containerHeight was ignored.",
      {
        prop: "containerHeight",
        details: {
          received: e.containerHeight,
          fallback: null,
          reason: "containerHeight must be a finite number greater than 0."
        }
      }
    ));
  }
  if (e.autoMeasureContainerHeight === !0) {
    if (p(e.measuredContainerHeight))
      return { height: e.measuredContainerHeight, source: "measured-parent" };
    t.push(w(
      e,
      "measurement-unavailable",
      "warning",
      "Measured parent container height was unavailable.",
      {
        prop: "autoMeasureContainerHeight",
        details: {
          received: e.measuredContainerHeight,
          fallback: null,
          reason: "The measured parent height must be a finite number greater than 0."
        }
      }
    ));
  }
  return { height: null, source: "fallback" };
}, A = (e, t, i, n) => e === 0 ? Math.max(0, i * 2) : Math.max(0, e * t + Math.max(0, e - 1) * n + i * 2), y = (e) => e == null ? null : `${Math.max(0, e)}px`;
function U(e) {
  const t = [], i = Array.isArray(e.measurementDiagnostics) ? e.measurementDiagnostics : [];
  t.push(...i.map((f) => ({
    ...f,
    details: typeof f.details == "undefined" ? void 0 : z(f.details)
  })));
  const n = K(e, t), l = Y(e, t), { rowHeight: r, defaultRowHeight: g } = $(e, t), d = X(e, t), h = B(e, t), a = E(e.margin, 1, 0), s = E(e.containerPadding, 1, a), o = Array.isArray(e.layout) ? e.layout : [], c = F(o), I = A(c, r, s, a), R = e.heightMode == null && e.autoSize === !1;
  let v = n, H = r, k = p(e.rowHeight) ? "row-height" : "default", P = h.height, S = h.source, M = I, u = "visible", _ = !1, b = {
    height: n === "auto" && !R ? y(I) : null
  };
  if (n === "auto")
    v = "auto", P = null, S = "height-mode", u = "visible", b = {
      height: R ? null : y(M)
    };
  else if (n === "fixed" || n === "scroll")
    if (h.height == null) {
      _ = !0, v = "auto", u = "visible", P = null, S = R ? "auto-size" : "fallback";
      const f = n === "fixed" ? "fixed-container-height-fallback" : "scroll-container-height-fallback";
      t.push(w(
        e,
        f,
        "warning",
        `${n} height mode requires a usable container height and fell back to auto.`,
        {
          prop: "containerHeight",
          details: {
            requestedHeightMode: n,
            fallback: "auto",
            reason: "No finite container height greater than 0 was available."
          }
        }
      )), b = {
        height: R ? null : y(M)
      };
    } else
      u = n === "fixed" ? "hidden" : "auto", b = {
        height: y(h.height),
        overflow: u
      };
  else if (n === "fit")
    if (h.height == null)
      _ = !0, v = "auto", P = null, S = "fallback", u = "visible", t.push(w(
        e,
        "missing-container-height",
        "warning",
        "fit height mode requires a usable container height and fell back to auto.",
        {
          prop: "containerHeight",
          details: {
            requestedHeightMode: n,
            fallback: "auto",
            reason: "No finite container height greater than 0 was available."
          }
        }
      )), b = { height: y(M) };
    else if (c === 0)
      H = g, k = "empty-fit-fallback", M = A(0, H, s, a), u = "visible", t.push(w(
        e,
        "empty-fit-layout",
        "info",
        "fit height mode received an empty layout; container height was preserved and fallback rowHeight was used.",
        {
          details: {
            containerHeight: h.height,
            fallbackRowHeight: H
          }
        }
      )), b = { height: y(h.height) };
    else {
      const f = (h.height - s * 2 - Math.max(0, c - 1) * a) / c;
      !p(f) || f < d ? (_ = !0, v = "scroll", H = Math.max(d, r), k = p(e.minRowHeight) ? "fallback" : k, M = A(c, H, s, a), u = "auto", t.push(w(
        e,
        "fit-min-row-height-fallback",
        "warning",
        "fit height mode resolved below minRowHeight and fell back to scroll.",
        {
          prop: "minRowHeight",
          details: {
            requestedHeightMode: n,
            fallback: "scroll",
            resolvedRowHeight: f,
            minRowHeight: d
          }
        }
      )), b = {
        height: y(h.height),
        overflow: u
      }) : (H = f, k = "fit", M = A(c, H, s, a), u = "visible", b = { height: y(h.height) });
    }
  return {
    requestedHeightMode: n,
    effectiveHeightMode: v,
    renderPrecision: l,
    rowHeight: H,
    rowHeightSource: k,
    containerHeight: P,
    containerHeightSource: S,
    contentHeight: M,
    bottomRows: c,
    overflow: u,
    containerStyle: b,
    fallbackApplied: _,
    diagnostics: L(t)
  };
}
export {
  m as a,
  W as b,
  D as c,
  O as d,
  G as e,
  j as f,
  Q as g,
  x as h,
  U as r
};
