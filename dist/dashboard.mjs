import { unref as g, shallowRef as x, ref as O, watch as L, getCurrentInstance as z, onBeforeUnmount as N, defineComponent as U, toRef as p, onMounted as q, createVNode as F, mergeProps as G, isVNode as _, h as T, Fragment as J } from "vue";
import { p as $, E as K } from "./EditorGridLayout-DpntIoJ0.mjs";
import { b as Z } from "./createGridLayoutComponent-C3Rj84Rb.mjs";
import { p as Q } from "./utils-BCVYGne6.mjs";
import { deepEqual as k } from "fast-equals";
import { l as M, e as E, d as W, w as X, h as Y } from "./dashboard-migration-DSgh_CFb.mjs";
import { D as Le, a as ze, c as Ae, b as xe, f as Ne, g as Ue, i as qe, m as Fe, j as Ge, p as _e, r as Te, k as Je, s as $e, t as Ke, v as Ze, n as Qe } from "./dashboard-migration-DSgh_CFb.mjs";
import { r as ee } from "./resolve-C3SqJijI.mjs";
const V = (e) => e.map((a) => ({ ...a })), te = (e) => ({
  layout: [],
  gridSettings: {
    columns: 12,
    minColumns: 1,
    margin: 10,
    outerMargin: !0,
    containerPadding: [0, 0],
    viewFormat: "grid",
    rowHeight: 150,
    autoFillHeight: !1,
    renderPrecision: "integer"
  },
  editorMetaById: {},
  layoutId: "default",
  requestedBreakpoint: g(e.breakpoint) || "default",
  resolvedProfileId: null,
  targetView: g(e.targetView) || "desktop",
  targetViewSource: g(e.targetView) ? "explicit" : "default",
  mode: g(e.mode) || "view",
  viewFormat: "grid",
  heightOptions: {
    heightMode: "auto",
    rowHeight: 150,
    renderPrecision: "integer"
  },
  fallbackApplied: !0,
  allItemIds: [],
  activeItemIds: [],
  renderItemIds: [],
  hiddenItemIds: [],
  diagnostics: [
    E(
      "projection-validation-failed",
      "error",
      "Dashboard responsive runtime has not resolved successfully yet."
    )
  ]
}), C = (e) => ({
  layout: e.layout,
  gridSettings: e.gridSettings,
  editorMetaById: e.editorMetaById,
  allItemIds: e.allItemIds,
  activeItemIds: e.activeItemIds,
  renderItemIds: e.renderItemIds,
  hiddenItemIds: e.hiddenItemIds,
  viewFormat: e.viewFormat,
  targetView: e.targetView,
  mode: e.mode,
  heightOptions: e.heightOptions,
  heightRuntime: e.heightRuntime
}), ie = (e) => e.diagnostics.filter((a) => !Y(a)), oe = (e) => (a) => {
  var n;
  (n = e.onEvent) == null || n.call(e, a);
}, y = (e) => typeof e == "undefined" ? void 0 : g(e);
function ae(e) {
  const a = M(g(e.document), {
    width: g(e.width),
    breakpoints: g(e.breakpoints),
    breakpoint: y(e.breakpoint) || null,
    targetView: y(e.targetView) || null,
    targetViewRule: e.targetViewRule,
    mode: y(e.mode) || "view",
    validation: e.validation,
    allowUnknownProfileItems: e.allowUnknownProfileItems
  }), n = x(
    a.ok ? a.runtime : te(e)
  ), f = O(V(n.value.layout)), b = O({ ...n.value.editorMetaById }), v = O(n.value.mode), l = oe(e), s = [];
  let c = !1;
  a.ok || l({ type: "projectionError", error: a.error, diagnostics: a.diagnostics });
  const m = e.editor && typeof e.editor == "object" ? e.editor : null, u = m ? m.controller || $({
    ...m,
    kind: "layout",
    layout: f,
    mode: v,
    editorMetaById: b
  }) : null, w = (t, o, r) => {
    n.value = t, f.value = V(t.layout), b.value = { ...t.editorMetaById }, v.value = t.mode, u == null || u.setExternalLayout(t.layout, r), o && o.requestedBreakpoint !== t.requestedBreakpoint && l({
      type: "breakpointChange",
      requestedBreakpoint: t.requestedBreakpoint,
      previous: o.requestedBreakpoint
    }), o && o.resolvedProfileId !== t.resolvedProfileId && l({
      type: "profileChange",
      resolvedProfileId: t.resolvedProfileId,
      previous: o.resolvedProfileId,
      fallbackApplied: t.fallbackApplied
    }), (!o || !k(C(o), C(t))) && l({ type: "projectionChange", runtime: t }), (!o || !k(o.diagnostics, t.diagnostics)) && l({ type: "diagnosticsChange", diagnostics: t.diagnostics });
  }, H = (t = "refresh") => {
    if (c) return;
    const o = n.value, r = M(g(e.document), {
      width: g(e.width),
      breakpoints: g(e.breakpoints),
      breakpoint: y(e.breakpoint) || null,
      targetView: y(e.targetView) || null,
      targetViewRule: e.targetViewRule,
      mode: y(e.mode) || "view",
      validation: e.validation,
      allowUnknownProfileItems: e.allowUnknownProfileItems
    });
    if (r.ok) {
      w(r.runtime, o, t);
      return;
    }
    l({ type: "projectionError", error: r.error, diagnostics: r.diagnostics }), l({ type: "diagnosticsChange", diagnostics: r.diagnostics });
  };
  s.push(L(
    () => [
      g(e.document),
      g(e.width),
      g(e.breakpoints),
      y(e.breakpoint),
      y(e.targetView),
      y(e.mode)
    ],
    () => H("input-change"),
    { deep: !0 }
  ));
  const P = (t) => {
    const o = X(
      g(e.document),
      n.value,
      t,
      {
        createMissingProfileOnEdit: e.createMissingProfileOnEdit,
        validation: e.validation,
        editorMetaById: b.value
      }
    );
    o.ok ? l({ type: "documentChange", document: o.document, runtime: n.value }) : (l({ type: "projectionError", error: o.error, diagnostics: o.diagnostics }), l({ type: "diagnosticsChange", diagnostics: o.diagnostics }));
  }, R = (t) => {
    const o = n.value, r = ie(o), h = {
      ...o,
      heightRuntime: t,
      diagnostics: r.concat(
        t.diagnostics.map((S) => W(S, o))
      )
    };
    n.value = h, k(C(o), C(h)) || l({ type: "projectionChange", runtime: h }), k(o.diagnostics, h.diagnostics) || l({ type: "diagnosticsChange", diagnostics: h.diagnostics });
  }, D = () => {
    c || (c = !0, s.forEach((t) => t()), m != null && m.controller || u == null || u.stop());
  };
  return z() && N(D), {
    state: n,
    editorController: u,
    getInnerEditorProp: () => u ? { ...m || {}, controller: u } : !1,
    onLayoutChange: P,
    onHeightRuntimeChange: R,
    refresh: H,
    stop: D
  };
}
function re(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !_(e);
}
const j = (e) => {
  if (Array.isArray(e)) return [e[0], e[1]];
  const a = typeof e == "number" ? e : 10;
  return [a, a];
}, ne = (e, a) => Object.prototype.hasOwnProperty.call(e, a), B = (e, a) => ne(e, "rowHeight") ? e.rowHeight : a, se = ["update:document", "documentChange", "breakpointChange", "profileChange", "projectionChange", "diagnosticsChange", "projectionError", "layoutChange", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "drop", "dropDragOver"], Ve = /* @__PURE__ */ U({
  name: "DashboardResponsiveVueGridLayout",
  inheritAttrs: !1,
  props: {
    ...Z,
    document: {
      type: Object,
      required: !0
    },
    width: {
      type: Number,
      required: !0
    },
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
    breakpoint: {
      type: String,
      default: null
    },
    targetView: {
      type: String,
      default: null
    },
    targetViewRule: {
      type: Object,
      default: void 0
    },
    mode: {
      type: String,
      default: "view"
    },
    validation: {
      type: String,
      default: "strict"
    },
    allowUnknownProfileItems: {
      type: Boolean,
      default: !1
    },
    createMissingProfileOnEdit: {
      type: Boolean,
      default: !1
    },
    layoutEngine: {
      type: [Boolean, Object],
      default: void 0
    },
    editor: {
      type: [Boolean, Object],
      default: !1
    },
    historyStore: {
      type: Object,
      default: void 0
    }
  },
  emits: se,
  setup(e, {
    attrs: a,
    slots: n,
    emit: f
  }) {
    const b = z();
    let v = "";
    const l = () => {
      const i = e.editor && typeof e.editor == "object" ? e.editor : null;
      return e.historyStore ? i ? {
        ...i,
        legacyHistoryStore: i.legacyHistoryStore || e.historyStore
      } : {
        legacyHistoryStore: e.historyStore,
        keyboard: !1
      } : i || !1;
    }, s = ae({
      document: p(e, "document"),
      width: p(e, "width"),
      breakpoints: p(e, "breakpoints"),
      breakpoint: p(e, "breakpoint"),
      targetView: p(e, "targetView"),
      targetViewRule: e.targetViewRule,
      mode: p(e, "mode"),
      validation: e.validation,
      layoutEngine: e.layoutEngine,
      editor: l(),
      createMissingProfileOnEdit: e.createMissingProfileOnEdit,
      allowUnknownProfileItems: e.allowUnknownProfileItems,
      onEvent: (i) => {
        if (i.type === "documentChange") {
          f("update:document", i.document), f("documentChange", i.document, i.runtime);
          return;
        }
        f(i.type, i);
      }
    }), c = (i) => (...t) => f(i, ...t, s.state.value), m = (i) => {
      s.onLayoutChange(i), f("layoutChange", i, s.state.value);
    }, u = (i) => i.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`), w = (i) => {
      const t = (b == null ? void 0 : b.vnode.props) || {};
      return Object.prototype.hasOwnProperty.call(t, i) || Object.prototype.hasOwnProperty.call(t, u(i));
    }, H = (i) => {
      const t = {
        ...i
      };
      return w("heightMode") && (t.heightMode = e.heightMode), w("containerHeight") && (t.containerHeight = e.containerHeight), w("autoMeasureContainerHeight") && (t.autoMeasureContainerHeight = e.autoMeasureContainerHeight), w("minRowHeight") && (t.minRowHeight = e.minRowHeight), w("rowHeight") && (t.rowHeight = e.rowHeight), w("renderPrecision") && (t.renderPrecision = e.renderPrecision), t;
    };
    let P = "";
    const R = () => {
      const i = s.state.value, t = H(i.heightOptions), o = ee({
        layout: i.layout,
        autoSize: e.autoSize,
        heightMode: t.heightMode,
        rowHeight: B(t, i.gridSettings.rowHeight),
        minRowHeight: t.minRowHeight,
        margin: j(i.gridSettings.margin),
        containerPadding: i.gridSettings.containerPadding || [0, 0],
        containerHeight: t.containerHeight,
        autoMeasureContainerHeight: t.autoMeasureContainerHeight,
        renderPrecision: t.renderPrecision,
        context: {
          source: "dashboard-responsive",
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId,
          targetView: i.targetView
        }
      }), r = JSON.stringify(o), h = i.heightRuntime ? JSON.stringify(i.heightRuntime) : "";
      r === P && r === h || (P = r, s.onHeightRuntimeChange(o));
    };
    L(() => [s.state.value.layout, s.state.value.gridSettings, s.state.value.heightOptions, e.autoSize, e.heightMode, e.containerHeight, e.autoMeasureContainerHeight, e.minRowHeight, e.rowHeight, e.renderPrecision], R, {
      deep: !0
    }), q(R);
    const D = () => {
      const i = s.state.value, t = n.default ? Q(T(J, null, n.default())) : [], o = {}, r = i.diagnostics.slice();
      t.forEach((d) => {
        d && d.key != null && (o[String(d.key)] = d);
      });
      const h = i.renderItemIds.slice();
      h.forEach((d) => {
        o[d] || r.push(E("slot-widget-mismatch", "warning", `No slot child was provided for dashboard widget "${d}".`, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId || void 0,
          itemId: d
        }));
      }), Object.keys(o).sort().forEach((d) => {
        i.allItemIds.indexOf(d) === -1 && r.push(E("slot-widget-mismatch", "warning", `Slot child "${d}" does not match a dashboard widget.`, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId || void 0,
          itemId: d
        }));
      });
      const S = JSON.stringify(r);
      return S !== v && (v = S, f("diagnosticsChange", {
        type: "diagnosticsChange",
        diagnostics: r
      })), h.map((d) => o[d]).filter(Boolean);
    };
    return () => {
      let i;
      const t = s.state.value, {
        document: o,
        breakpoints: r,
        breakpoint: h,
        targetView: S,
        targetViewRule: d,
        mode: de,
        validation: ge,
        allowUnknownProfileItems: le,
        createMissingProfileOnEdit: ce,
        modelValue: ue,
        cols: he,
        margin: fe,
        containerPadding: me,
        rowHeight: ye,
        heightMode: we,
        containerHeight: be,
        autoMeasureContainerHeight: Ie,
        minRowHeight: pe,
        renderPrecision: ve,
        editor: He,
        historyStore: Se,
        layoutEngine: Pe,
        ...A
      } = e, I = H(t.heightOptions);
      return F(K, G(a, A, {
        onHeightRuntimeChange: s.onHeightRuntimeChange,
        "onHeight-runtime-change": s.onHeightRuntimeChange
      }, {
        width: e.width,
        modelValue: t.layout,
        cols: t.gridSettings.columns,
        margin: j(t.gridSettings.margin),
        containerPadding: t.gridSettings.containerPadding || [0, 0],
        rowHeight: B(I, t.gridSettings.rowHeight),
        heightMode: I.heightMode,
        containerHeight: I.containerHeight,
        autoMeasureContainerHeight: I.autoMeasureContainerHeight,
        minRowHeight: I.minRowHeight,
        renderPrecision: I.renderPrecision,
        layoutEngine: e.layoutEngine,
        editor: s.getInnerEditorProp(),
        itemCapabilities: t.capabilitiesById,
        resizeConstraints: t.resizeConstraintsById,
        onLayoutChange: m,
        onDragStart: c("dragStart"),
        onDrag: c("drag"),
        onDragStop: c("dragStop"),
        onResizeStart: c("resizeStart"),
        onResize: c("resize"),
        onResizeStop: c("resizeStop"),
        onDrop: c("drop"),
        onDropDragOver: c("dropDragOver")
      }), re(i = D()) ? i : {
        default: () => [i]
      });
    };
  }
});
export {
  Le as DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE,
  ze as DASHBOARD_SCHEMA_VERSION,
  Ve as DashboardResponsiveVueGridLayout,
  Ae as cloneDashboardJsonValue,
  xe as createDashboardDocumentFromResponsiveLayouts,
  W as createDashboardHeightDiagnostic,
  E as createDashboardResponsiveDiagnostic,
  Ne as deserializeDashboardLayoutDocument,
  Ue as exportThingsBoardDashboardLayout,
  qe as importThingsBoardDashboardLayout,
  Y as isDashboardHeightDiagnostic,
  Fe as migrateDashboardLayoutDocument,
  Ge as migrateDashboardLayoutSettings,
  _e as projectDashboardLayoutDocument,
  Te as repairDashboardLayoutCollisions,
  Je as resolveDashboardHeightOptions,
  M as resolveDashboardResponsiveProfile,
  $e as serializeDashboardLayoutDocument,
  Ke as translateDashboardLayout,
  ae as useDashboardResponsiveProfileModel,
  Ze as validateDashboardLayoutDocument,
  X as writeDashboardResponsiveRuntimeToDocument,
  Qe as writeDashboardRuntimeToDocument
};
