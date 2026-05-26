import { defineComponent as p, createVNode as c, mergeProps as y, isVNode as f } from "vue";
import { V as g } from "./VueGridLayout-B2Z99WVN.mjs";
import { u as m, g as l } from "./useResponsiveGridLayoutModel-b7z48CNj.mjs";
function b(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !f(e);
}
const h = {
  /** Force current breakpoint key (optional, usually auto-calculated) */
  breakpoint: {
    type: String,
    default: ""
  },
  /** Breakpoint to pixel width mapping, e.g. { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } */
  breakpoints: {
    type: Object,
    default: () => ({
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0
    })
  },
  /** Allow grid items to overlap */
  allowOverlap: {
    type: Boolean,
    default: !1
  },
  /** Vertical compact layout (deprecated) */
  verticalCompact: {
    type: Boolean,
    default: !0
  },
  /** Breakpoint to column count mapping, e.g. { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } */
  cols: {
    type: Object,
    default: () => ({
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2
    })
  },
  /** Breakpoint to spacing mapping or universal [x, y], e.g. { lg: [10, 10] } or [10, 10] */
  margin: {
    type: [Array, Object],
    default: () => [10, 10]
  },
  /** Breakpoint to container padding mapping or universal value */
  containerPadding: {
    type: [Array, Object],
    default: () => ({
      lg: null,
      md: null,
      sm: null,
      xs: null,
      xxs: null
    })
  },
  /** Layout collection for each breakpoint, e.g. { lg: Layout[], md: Layout[] } */
  layouts: {
    type: Object,
    default: () => ({})
  },
  /** Component width (required, usually auto-provided by WidthProvider) */
  width: {
    type: Number,
    required: !0
  },
  /** Compaction direction: vertical / horizontal / null */
  compactType: {
    type: String,
    default: "vertical",
    validator: (e) => e == null || ["vertical", "horizontal"].includes(e)
  },
  /** Layout engine configuration for responsive heavy operations and the inner grid */
  layoutEngine: {
    type: [Boolean, Object],
    default: void 0
  },
  /** Drag activation distance passed through to the inner grid. */
  dragActivationDistance: {
    type: [Number, Object],
    default: void 0
  }
}, L = /* @__PURE__ */ p({
  props: h,
  emits: ["update:layouts", "layoutChange", "breakpointChange", "widthChange"],
  setup(e, {
    slots: a,
    emit: r
  }) {
    const n = m({
      props: e,
      slots: a,
      emit: r
    }), {
      state: t
    } = n;
    return () => {
      const {
        breakpoint: j,
        breakpoints: x,
        cols: O,
        layouts: v,
        margin: u,
        containerPadding: i,
        layoutEngine: d,
        ...s
      } = e, o = a.default ? a.default() : null;
      return c(g, y(s, {
        margin: l(u, t.breakpoint) || [10, 10],
        containerPadding: l(i, t.breakpoint) || [0, 0],
        onLayoutChange: n.onLayoutChange,
        modelValue: t.layout,
        cols: t.cols,
        layoutEngine: d
      }), b(o) ? o : {
        default: () => [o]
      });
    };
  }
});
export {
  L as R,
  h as r
};
