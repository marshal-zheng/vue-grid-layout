import { defineComponent as v, ref as h, watch as g, onMounted as L, onBeforeUnmount as C, createVNode as P, mergeProps as V } from "vue";
import { V as k } from "./VueGridLayout-B2Z99WVN.mjs";
import { b as A } from "./createGridLayoutComponent-BUqtSi2L.mjs";
import { a as d } from "./utils-BCVYGne6.mjs";
import { u as b } from "./persistence-Db97X8w7.mjs";
import { L as z, c as H, a as N, d as U, i as x, l as I, m as W, b as Y, r as F, s as J, e as K, v as Q } from "./persistence-Db97X8w7.mjs";
import { r as G, R as E } from "./ResponsiveVueGridLayout-9Hjccu1E.mjs";
import { c as y } from "./useResponsiveGridLayoutModel-b7z48CNj.mjs";
const S = /* @__PURE__ */ v({
  name: "PersistentGridLayout",
  inheritAttrs: !1,
  props: {
    ...A,
    persistence: {
      type: Object,
      required: !0
    }
  },
  emits: ["update:modelValue", "layoutChange"],
  setup(r, {
    attrs: m,
    slots: i,
    emit: n
  }) {
    const t = h(d(r.modelValue || []));
    let s = !1;
    const c = (e) => {
      s = !0;
      const a = d(e);
      t.value = a, n("update:modelValue", a), n("layoutChange", a), queueMicrotask(() => {
        s = !1;
      });
    }, u = r.persistence, p = b({
      ...u,
      kind: "layout",
      target: t,
      watchTarget: !1,
      onEvent: (e) => {
        var a;
        e.type === "external-apply" && c(e.value), (a = u.onEvent) == null || a.call(u, e);
      }
    });
    g(() => r.modelValue, (e) => {
      !s && e && !Object.is(e, t.value) && (t.value = d(e));
    }, {
      deep: !0
    }), L(() => {
      p.load().then((e) => {
        e.value && (e.ok || e.fallbackApplied) && c(e.value);
      });
    }), C(() => {
      p.stop();
    });
    const f = (e) => {
      if (s) return;
      const a = d(e);
      t.value = a, n("update:modelValue", a), n("layoutChange", a), p.commit(a, {
        source: "component"
      });
    };
    return () => {
      const {
        persistence: e,
        modelValue: a,
        ...o
      } = r;
      return P(k, V(m, o, {
        modelValue: t.value,
        onLayoutChange: f
      }), {
        default: () => {
          var l;
          return [(l = i.default) == null ? void 0 : l.call(i)];
        }
      });
    };
  }
}), B = /* @__PURE__ */ v({
  name: "PersistentResponsiveGridLayout",
  inheritAttrs: !1,
  props: {
    ...G,
    persistence: {
      type: Object,
      required: !0
    }
  },
  emits: ["update:layouts", "layoutChange", "breakpointChange", "widthChange"],
  setup(r, {
    attrs: m,
    slots: i,
    emit: n
  }) {
    const t = h(y(r.layouts || {}));
    let s = !1;
    const c = (e, a) => {
      s = !0;
      const o = y(e);
      t.value = o, n("update:layouts", o), queueMicrotask(() => {
        s = !1;
      });
    }, u = r.persistence, p = b({
      ...u,
      kind: "responsive",
      target: t,
      watchTarget: !1,
      onEvent: (e) => {
        var a;
        e.type === "external-apply" && c(e.value), (a = u.onEvent) == null || a.call(u, e);
      }
    });
    g(() => r.layouts, (e) => {
      !s && e && !Object.is(e, t.value) && (t.value = y(e));
    }, {
      deep: !0
    }), L(() => {
      p.load().then((e) => {
        e.value && (e.ok || e.fallbackApplied) && c(e.value);
      });
    }), C(() => {
      p.stop();
    });
    const f = (e, a) => {
      if (s) return;
      const o = y(a);
      t.value = o, n("update:layouts", o), n("layoutChange", e, o), p.commit(o, {
        source: "component"
      });
    };
    return () => {
      const {
        persistence: e,
        layouts: a,
        ...o
      } = r;
      return P(E, V(m, o, {
        layouts: t.value,
        onLayoutChange: f,
        onBreakpointChange: (...l) => n("breakpointChange", ...l),
        onWidthChange: (...l) => n("widthChange", ...l)
      }), {
        default: () => {
          var l;
          return [(l = i.default) == null ? void 0 : l.call(i)];
        }
      });
    };
  }
});
export {
  z as LAYOUT_SCHEMA_VERSION,
  S as PersistentGridLayout,
  B as PersistentResponsiveGridLayout,
  H as cloneLayoutsMap,
  N as createPersistenceError,
  U as deserializeLayoutDocument,
  x as indexedDBAdapter,
  I as localStorageAdapter,
  W as memoryPersistenceAdapter,
  Y as migrateLayoutDocument,
  F as remoteHttpAdapter,
  J as serializeLayoutDocument,
  K as sessionStorageAdapter,
  b as useGridLayoutPersistence,
  Q as validateLayoutDocument
};
