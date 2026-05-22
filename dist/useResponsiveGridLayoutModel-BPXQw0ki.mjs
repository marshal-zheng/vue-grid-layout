import { reactive as q, watch as O, onBeforeUnmount as A, Fragment as M } from "vue";
import { deepEqual as f } from "fast-equals";
import { i as w, a as p, p as N, C as S } from "./utils-BCVYGne6.mjs";
import { f as C, g as x, b as B, e as z } from "./core-BdZsEnSu.mjs";
import { b as F } from "./executor-D3JIs-_s.mjs";
const U = (t) => ({
  width: t.width,
  breakpoint: t.breakpoint,
  breakpoints: t.breakpoints,
  cols: t.cols
});
function R(t, h) {
  return t == null ? null : Array.isArray(t) ? t : t[h];
}
const X = (t) => {
  const h = {};
  return Object.keys(t).forEach((l) => {
    h[l] = p(t[l]);
  }), h;
};
function Y({
  props: t,
  slots: h,
  emit: l
}) {
  const n = q((() => {
    const { width: a, breakpoints: o, layouts: e, cols: d } = t, s = t.breakpoint || x(o, a), u = B(s, d), r = w(t), c = C(
      e,
      o,
      s,
      s,
      u,
      r
    );
    return {
      layout: c,
      breakpoint: s,
      cols: u,
      layouts: {
        ...e,
        [s]: c
      }
    };
  })()), L = () => t.layoutEngine && typeof t.layoutEngine == "object" ? t.layoutEngine : null, I = () => {
    const a = L();
    return t.layoutEngine === !1 || (a == null ? void 0 : a.mode) === "legacy";
  };
  let v, y = F();
  const E = () => {
    var e;
    const a = L(), o = a == null ? void 0 : a.executor;
    return o !== v && ((e = y.dispose) == null || e.call(y), y = F(o), v = o), y;
  }, T = (a, o) => {
    const e = L();
    return {
      cols: a,
      compactType: o,
      allowOverlap: t.allowOverlap,
      scheduler: e == null ? void 0 : e.scheduler,
      executor: E(),
      compareLegacy: e == null ? void 0 : e.compareLegacy,
      legacyFallback: (e == null ? void 0 : e.legacyFallback) !== !1,
      diagnostics: e == null ? void 0 : e.diagnostics,
      onEvent: e == null ? void 0 : e.onEvent
    };
  }, $ = (a) => {
    const o = p(a), e = {
      ...n.layouts,
      [n.breakpoint]: o
    };
    n.layout = o, n.layouts = e, l("update:layouts", e), l("layoutChange", o, e);
  }, G = (a) => {
    const { breakpoints: o, cols: e } = t, d = w(t), s = t.breakpoint || x(t.breakpoints, t.width), u = n.breakpoint, r = B(s, e), c = { ...n.layouts };
    if (u !== s || a.breakpoints !== o || a.cols !== e) {
      c[u] = p(n.layout);
      const k = (b) => {
        const m = h.default ? N({ type: M, children: h.default() }) : [], i = S(
          b,
          m,
          r,
          d,
          t.allowOverlap
        );
        c[s] = i, l("breakpointChange", s, r), l("update:layouts", c), l("layoutChange", i, c), n.breakpoint = s, n.layout = i, n.cols = r, n.layouts = c;
      };
      let g = C(
        c,
        o,
        s,
        u,
        r,
        d
      );
      if (I())
        k(g);
      else {
        const b = {
          id: `responsive:${u}->${s}`,
          phase: "commit",
          layout: c[u] || n.layout,
          operation: {
            type: "generateResponsiveLayout",
            breakpoint: s,
            sourceBreakpoint: u,
            cols: r,
            layouts: c,
            breakpoints: o
          },
          options: T(r, d),
          heavy: g.length >= 500
        }, m = E();
        if (b.heavy && m.kind !== "main-thread")
          m.execute(b).then((i) => {
            i.status === "changed" || i.status === "noop" || i.status === "fallback" ? k(i.layout) : k(g);
          }).catch(() => {
            k(g);
          });
        else {
          const i = z(b);
          (i.status === "changed" || i.status === "noop" || i.status === "fallback") && (g = i.layout), k(g);
        }
      }
    }
    const W = R(t.margin, s), j = R(
      t.containerPadding,
      s
    );
    l("widthChange", t.width, W, r, j);
  };
  return O(
    () => U(t),
    (a, o) => {
      (a.width != o.width || a.breakpoint !== o.breakpoint || !f(a.breakpoints, o.breakpoints) || !f(a.cols, o.cols)) && G(o);
    },
    { deep: !0 }
  ), O(
    () => t.layouts,
    (a) => {
      if (!f(a, n.layouts)) {
        const { breakpoint: o, cols: e } = n, d = C(
          a,
          t.breakpoints,
          o,
          o,
          e,
          w(t)
        );
        n.layout = d, n.layouts = {
          ...a,
          [o]: d
        };
      }
    },
    { immediate: !0 }
  ), A(() => {
    var a;
    (a = y.dispose) == null || a.call(y);
  }), {
    onLayoutChange: $,
    state: n
  };
}
export {
  X as c,
  R as g,
  Y as u
};
