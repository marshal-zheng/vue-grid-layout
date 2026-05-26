import { r as w } from "./resolve-C3SqJijI.mjs";
import { u as C } from "./createGridLayoutComponent-BUqtSi2L.mjs";
import { defineComponent as M, ref as v, reactive as R, onMounted as O, onBeforeUnmount as T, watch as _, createVNode as g, mergeProps as N, isVNode as S } from "vue";
import j from "resize-observer-polyfill";
import k from "clsx";
const x = {
  missingContainerHeight: "missing-container-height",
  measurementUnavailable: "measurement-unavailable",
  fitMinRowHeightFallback: "fit-min-row-height-fallback",
  fixedContainerHeightFallback: "fixed-container-height-fallback",
  scrollContainerHeightFallback: "scroll-container-height-fallback",
  emptyFitLayout: "empty-fit-layout",
  invalidHeightMode: "invalid-height-mode",
  invalidContainerHeight: "invalid-container-height",
  invalidRowHeight: "invalid-row-height",
  invalidMinRowHeight: "invalid-min-row-height",
  invalidRenderPrecision: "invalid-render-precision",
  modeAliasConflict: "mode-alias-conflict",
  unsupportedDashboardField: "unsupported-dashboard-field"
}, D = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GRID_HEIGHT_DIAGNOSTIC_CODES: x,
  resolveGridHeightRuntime: w,
  useContainerHeightMeasurement: C
}, Symbol.toStringTag, { value: "Module" }));
function F(o) {
  return typeof o == "function" || Object.prototype.toString.call(o) === "[object Object]" && !S(o);
}
const G = "vue-grid-layout";
function z(o) {
  return /* @__PURE__ */ M({
    name: "WidthProvider",
    props: {
      /** Measure width before first render to avoid layout shift (recommended for SSR) */
      measureBeforeMount: {
        type: Boolean,
        default: !1
      },
      /** Additional CSS class for the container */
      class: {
        type: String,
        default: ""
      },
      /** Container style object */
      style: {
        type: Object,
        default: () => ({})
      }
    },
    setup(u, {
      attrs: b,
      slots: c
    }) {
      const l = v(null), s = R({
        width: 1280
      }), a = v(!1);
      let n = null, i = null;
      const p = () => {
        const e = l.value;
        if (!e) return null;
        if (e instanceof HTMLElement) return e;
        const t = e.$el;
        return t instanceof HTMLElement ? t : null;
      }, f = (e) => {
        if (typeof e != "number" || !Number.isFinite(e)) return;
        const t = Math.round(e);
        t > 0 && t !== s.width && (s.width = t);
      };
      let r;
      const m = () => {
        r && (clearTimeout(r), r = void 0);
      }, y = (e) => {
        m(), r = setTimeout(() => {
          r = void 0, a.value && f(e);
        }, 20);
      }, h = () => {
        if (!n) return;
        const e = p();
        i && i !== e && n.unobserve(i), i = e, e && (n.observe(e), f(e.getBoundingClientRect().width));
      };
      return O(() => {
        n = new j((e) => {
          const t = e[0];
          t && y(t.contentRect.width);
        }), h(), a.value = !0;
      }), T(() => {
        a.value = !1, m(), n && (i && n.unobserve(i), n.disconnect()), i = null, n = null;
      }), _(l, () => {
        h();
      }), () => {
        const {
          measureBeforeMount: e,
          ...t
        } = u;
        if (e && !a.value)
          return g("div", {
            class: k(u.class, G),
            style: u.style,
            ref: (H) => l.value = H
          }, null);
        const d = c.default ? c.default() : null;
        return g(o, N({
          ref: l
        }, b, t, s), F(d) ? d : {
          default: () => [d]
        });
      };
    }
  });
}
export {
  x as G,
  z as W,
  D as i
};
