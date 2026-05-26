import { unref as c, shallowRef as A, ref as E, watch as L, getCurrentInstance as z, onBeforeUnmount as N, defineComponent as U, toRef as p, onMounted as q, createVNode as F, mergeProps as G, isVNode as _, h as T, Fragment as W } from "vue";
import { p as J, E as $ } from "./EditorGridLayout-cRS11Gqh.mjs";
import { b as K } from "./createGridLayoutComponent-BUqtSi2L.mjs";
import { p as Z } from "./utils-BCVYGne6.mjs";
import { deepEqual as P } from "fast-equals";
import { l as V, e as M, d as Q, w as X, h as Y } from "./dashboard-migration-CPRNR9yH.mjs";
import { D as ze, a as xe, c as Ae, b as Ne, f as Ue, g as qe, i as Fe, m as Ge, j as _e, p as Te, r as We, k as Je, s as $e, t as Ke, v as Ze, n as Qe } from "./dashboard-migration-CPRNR9yH.mjs";
import { r as ee } from "./resolve-C3SqJijI.mjs";
const O = (e) => e.map((n) => ({ ...n })), te = (e) => ({
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
  requestedBreakpoint: c(e.breakpoint) || "default",
  resolvedProfileId: null,
  targetView: c(e.targetView) || "desktop",
  targetViewSource: c(e.targetView) ? "explicit" : "default",
  mode: c(e.mode) || "view",
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
    M(
      "projection-validation-failed",
      "error",
      "Dashboard responsive runtime has not resolved successfully yet."
    )
  ]
}), v = (e) => ({
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
}), ie = (e) => e.diagnostics.filter((n) => !Y(n)), oe = (e) => (n) => {
  var r;
  (r = e.onEvent) == null || r.call(e, n);
}, y = (e) => typeof e == "undefined" ? void 0 : c(e);
function ae(e) {
  const n = V(c(e.document), {
    width: c(e.width),
    breakpoints: c(e.breakpoints),
    breakpoint: y(e.breakpoint) || null,
    targetView: y(e.targetView) || null,
    targetViewRule: e.targetViewRule,
    mode: y(e.mode) || "view",
    validation: e.validation,
    allowUnknownProfileItems: e.allowUnknownProfileItems
  }), r = A(
    n.ok ? n.runtime : te(e)
  ), m = E(O(r.value.layout)), b = E({ ...r.value.editorMetaById }), H = E(r.value.mode), d = oe(e), s = [];
  let h = !1;
  n.ok || d({ type: "projectionError", error: n.error, diagnostics: n.diagnostics });
  const f = e.editor && typeof e.editor == "object" ? e.editor : null, u = f ? f.controller || J({
    ...f,
    kind: "layout",
    layout: m,
    mode: H,
    editorMetaById: b
  }) : null, w = (t, o, a) => {
    r.value = t, m.value = O(t.layout), b.value = { ...t.editorMetaById }, H.value = t.mode, u == null || u.setExternalLayout(t.layout, a), o && o.requestedBreakpoint !== t.requestedBreakpoint && d({
      type: "breakpointChange",
      requestedBreakpoint: t.requestedBreakpoint,
      previous: o.requestedBreakpoint
    }), o && o.resolvedProfileId !== t.resolvedProfileId && d({
      type: "profileChange",
      resolvedProfileId: t.resolvedProfileId,
      previous: o.resolvedProfileId,
      fallbackApplied: t.fallbackApplied
    }), (!o || !P(v(o), v(t))) && d({ type: "projectionChange", runtime: t }), (!o || !P(o.diagnostics, t.diagnostics)) && d({ type: "diagnosticsChange", diagnostics: t.diagnostics });
  }, S = (t = "refresh") => {
    if (h) return;
    const o = r.value, a = V(c(e.document), {
      width: c(e.width),
      breakpoints: c(e.breakpoints),
      breakpoint: y(e.breakpoint) || null,
      targetView: y(e.targetView) || null,
      targetViewRule: e.targetViewRule,
      mode: y(e.mode) || "view",
      validation: e.validation,
      allowUnknownProfileItems: e.allowUnknownProfileItems
    });
    if (a.ok) {
      w(a.runtime, o, t);
      return;
    }
    d({ type: "projectionError", error: a.error, diagnostics: a.diagnostics }), d({ type: "diagnosticsChange", diagnostics: a.diagnostics });
  };
  s.push(L(
    () => [
      c(e.document),
      c(e.width),
      c(e.breakpoints),
      y(e.breakpoint),
      y(e.targetView),
      y(e.mode)
    ],
    () => S("input-change"),
    { deep: !0 }
  ));
  const R = (t) => {
    if (e.documentWriteBack === "shell") {
      const a = r.value, g = {
        ...a,
        layout: O(t)
      };
      r.value = g, m.value = O(t), P(v(a), v(g)) || d({ type: "projectionChange", runtime: g });
      return;
    }
    const o = X(
      c(e.document),
      r.value,
      t,
      {
        createMissingProfileOnEdit: e.createMissingProfileOnEdit,
        validation: e.validation,
        editorMetaById: b.value,
        sectionRows: u == null ? void 0 : u.sectionRows.value
      }
    );
    o.ok ? d({ type: "documentChange", document: o.document, runtime: r.value }) : (d({ type: "projectionError", error: o.error, diagnostics: o.diagnostics }), d({ type: "diagnosticsChange", diagnostics: o.diagnostics }));
  }, D = (t) => {
    const o = r.value, a = ie(o), g = {
      ...o,
      heightRuntime: t,
      diagnostics: a.concat(
        t.diagnostics.map((k) => Q(k, o))
      )
    };
    r.value = g, P(v(o), v(g)) || d({ type: "projectionChange", runtime: g }), P(o.diagnostics, g.diagnostics) || d({ type: "diagnosticsChange", diagnostics: g.diagnostics });
  }, C = () => {
    h || (h = !0, s.forEach((t) => t()), f != null && f.controller || u == null || u.stop());
  };
  return z() && N(C), {
    state: r,
    editorController: u,
    getInnerEditorProp: () => u ? { ...f || {}, controller: u } : !1,
    onLayoutChange: R,
    onHeightRuntimeChange: D,
    refresh: S,
    stop: C
  };
}
function ne(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !_(e);
}
const B = (e) => {
  if (Array.isArray(e)) return [e[0], e[1]];
  const n = typeof e == "number" ? e : 10;
  return [n, n];
}, re = (e, n) => Object.prototype.hasOwnProperty.call(e, n), j = (e, n) => re(e, "rowHeight") ? e.rowHeight : n, se = ["update:document", "documentChange", "breakpointChange", "profileChange", "projectionChange", "diagnosticsChange", "projectionError", "layoutChange", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "drop", "dropDragOver"], Be = /* @__PURE__ */ U({
  name: "DashboardResponsiveVueGridLayout",
  inheritAttrs: !1,
  props: {
    ...K,
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
    documentWriteBack: {
      type: String,
      default: "component"
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
    attrs: n,
    slots: r,
    emit: m
  }) {
    const b = z();
    let H = "";
    const d = () => {
      const i = e.editor && typeof e.editor == "object" ? e.editor : null;
      return !e.historyStore || e.documentWriteBack === "shell" ? i || !1 : i ? {
        ...i,
        legacyHistoryStore: i.legacyHistoryStore || e.historyStore
      } : {
        legacyHistoryStore: e.historyStore,
        keyboard: !1
      };
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
      editor: d(),
      documentWriteBack: e.documentWriteBack,
      createMissingProfileOnEdit: e.createMissingProfileOnEdit,
      allowUnknownProfileItems: e.allowUnknownProfileItems,
      onEvent: (i) => {
        if (i.type === "documentChange") {
          m("update:document", i.document), m("documentChange", i.document, i.runtime);
          return;
        }
        m(i.type, i);
      }
    }), h = (i) => (...t) => m(i, ...t, s.state.value), f = (i) => {
      s.onLayoutChange(i), m("layoutChange", i, s.state.value);
    }, u = (i) => i.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`), w = (i) => {
      const t = (b == null ? void 0 : b.vnode.props) || {};
      return Object.prototype.hasOwnProperty.call(t, i) || Object.prototype.hasOwnProperty.call(t, u(i));
    }, S = (i) => {
      const t = {
        ...i
      };
      return w("heightMode") && (t.heightMode = e.heightMode), w("containerHeight") && (t.containerHeight = e.containerHeight), w("autoMeasureContainerHeight") && (t.autoMeasureContainerHeight = e.autoMeasureContainerHeight), w("minRowHeight") && (t.minRowHeight = e.minRowHeight), w("rowHeight") && (t.rowHeight = e.rowHeight), w("renderPrecision") && (t.renderPrecision = e.renderPrecision), t;
    };
    let R = "";
    const D = () => {
      const i = s.state.value, t = S(i.heightOptions), o = ee({
        layout: i.layout,
        autoSize: e.autoSize,
        heightMode: t.heightMode,
        rowHeight: j(t, i.gridSettings.rowHeight),
        minRowHeight: t.minRowHeight,
        margin: B(i.gridSettings.margin),
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
      }), a = JSON.stringify(o), g = i.heightRuntime ? JSON.stringify(i.heightRuntime) : "";
      a === R && a === g || (R = a, s.onHeightRuntimeChange(o));
    };
    L(() => [s.state.value.layout, s.state.value.gridSettings, s.state.value.heightOptions, e.autoSize, e.heightMode, e.containerHeight, e.autoMeasureContainerHeight, e.minRowHeight, e.rowHeight, e.renderPrecision], D, {
      deep: !0
    }), q(D);
    const C = () => {
      const i = s.state.value, t = r.default ? Z(T(W, null, r.default())) : [], o = {}, a = i.diagnostics.slice();
      t.forEach((l) => {
        l && l.key != null && (o[String(l.key)] = l);
      });
      const g = i.renderItemIds.slice();
      g.forEach((l) => {
        o[l] || a.push(M("slot-widget-mismatch", "warning", `No slot child was provided for dashboard widget "${l}".`, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId || void 0,
          itemId: l
        }));
      }), Object.keys(o).sort().forEach((l) => {
        i.allItemIds.indexOf(l) === -1 && a.push(M("slot-widget-mismatch", "warning", `Slot child "${l}" does not match a dashboard widget.`, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId || void 0,
          itemId: l
        }));
      });
      const k = JSON.stringify(a);
      return k !== H && (H = k, m("diagnosticsChange", {
        type: "diagnosticsChange",
        diagnostics: a
      })), g.map((l) => o[l]).filter(Boolean);
    };
    return () => {
      let i;
      const t = s.state.value, {
        document: o,
        breakpoints: a,
        breakpoint: g,
        targetView: k,
        targetViewRule: l,
        mode: de,
        validation: ge,
        allowUnknownProfileItems: le,
        createMissingProfileOnEdit: ce,
        documentWriteBack: ue,
        modelValue: he,
        cols: me,
        margin: fe,
        containerPadding: ye,
        rowHeight: we,
        heightMode: be,
        containerHeight: Ie,
        autoMeasureContainerHeight: pe,
        minRowHeight: ve,
        renderPrecision: He,
        editor: Se,
        historyStore: ke,
        layoutEngine: Pe,
        ...x
      } = e, I = S(t.heightOptions);
      return F($, G(n, x, {
        onHeightRuntimeChange: s.onHeightRuntimeChange,
        "onHeight-runtime-change": s.onHeightRuntimeChange
      }, {
        width: e.width,
        modelValue: t.layout,
        cols: t.gridSettings.columns,
        margin: B(t.gridSettings.margin),
        containerPadding: t.gridSettings.containerPadding || [0, 0],
        rowHeight: j(I, t.gridSettings.rowHeight),
        heightMode: I.heightMode,
        containerHeight: I.containerHeight,
        autoMeasureContainerHeight: I.autoMeasureContainerHeight,
        minRowHeight: I.minRowHeight,
        renderPrecision: I.renderPrecision,
        layoutEngine: e.layoutEngine,
        editor: s.getInnerEditorProp(),
        itemCapabilities: t.capabilitiesById,
        resizeConstraints: t.resizeConstraintsById,
        onLayoutChange: f,
        onDragStart: h("dragStart"),
        onDrag: h("drag"),
        onDragStop: h("dragStop"),
        onResizeStart: h("resizeStart"),
        onResize: h("resize"),
        onResizeStop: h("resizeStop"),
        onDrop: h("drop"),
        onDropDragOver: h("dropDragOver")
      }), ne(i = C()) ? i : {
        default: () => [i]
      });
    };
  }
});
export {
  ze as DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE,
  xe as DASHBOARD_SCHEMA_VERSION,
  Be as DashboardResponsiveVueGridLayout,
  Ae as cloneDashboardJsonValue,
  Ne as createDashboardDocumentFromResponsiveLayouts,
  Q as createDashboardHeightDiagnostic,
  M as createDashboardResponsiveDiagnostic,
  Ue as deserializeDashboardLayoutDocument,
  qe as exportThingsBoardDashboardLayout,
  Fe as importThingsBoardDashboardLayout,
  Y as isDashboardHeightDiagnostic,
  Ge as migrateDashboardLayoutDocument,
  _e as migrateDashboardLayoutSettings,
  Te as projectDashboardLayoutDocument,
  We as repairDashboardLayoutCollisions,
  Je as resolveDashboardHeightOptions,
  V as resolveDashboardResponsiveProfile,
  $e as serializeDashboardLayoutDocument,
  Ke as translateDashboardLayout,
  ae as useDashboardResponsiveProfileModel,
  Ze as validateDashboardLayoutDocument,
  X as writeDashboardResponsiveRuntimeToDocument,
  Qe as writeDashboardRuntimeToDocument
};
