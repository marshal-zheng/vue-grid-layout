import { unref as c, shallowRef as A, ref as O, watch as B, getCurrentInstance as L, onBeforeUnmount as x, defineComponent as N, toRef as b, onMounted as U, createVNode as q, mergeProps as F, isVNode as G, h as _, Fragment as T } from "vue";
import { p as J, E as $ } from "./EditorGridLayout-BPbdwt5r.mjs";
import { b as K } from "./createGridLayoutComponent-Dco68dmI.mjs";
import { p as Z } from "./utils-BCVYGne6.mjs";
import { deepEqual as D } from "fast-equals";
import { l as E, e as C, d as Q, w as W, h as X } from "./dashboard-migration--LgxRQpX.mjs";
import { D as je, a as Be, c as Le, b as ze, f as Ae, g as xe, i as Ne, m as Ue, j as qe, p as Fe, r as Ge, k as _e, s as Te, t as Je, v as $e, n as Ke } from "./dashboard-migration--LgxRQpX.mjs";
import { r as Y } from "./resolve-C3SqJijI.mjs";
const M = (e) => e.map((r) => ({ ...r })), ee = (e) => ({
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
    C(
      "projection-validation-failed",
      "error",
      "Dashboard responsive runtime has not resolved successfully yet."
    )
  ]
}), S = (e) => ({
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
}), te = (e) => e.diagnostics.filter((r) => !X(r)), ie = (e) => (r) => {
  var s;
  (s = e.onEvent) == null || s.call(e, r);
}, y = (e) => typeof e == "undefined" ? void 0 : c(e);
function ae(e) {
  const r = E(c(e.document), {
    width: c(e.width),
    breakpoints: c(e.breakpoints),
    breakpoint: y(e.breakpoint) || null,
    targetView: y(e.targetView) || null,
    targetViewRule: e.targetViewRule,
    mode: y(e.mode) || "view",
    validation: e.validation,
    allowUnknownProfileItems: e.allowUnknownProfileItems
  }), s = A(
    r.ok ? r.runtime : ee(e)
  ), h = O(M(s.value.layout)), w = O({ ...s.value.editorMetaById }), I = O(s.value.mode), n = ie(e), u = [];
  let v = !1;
  r.ok || n({ type: "projectionError", error: r.error, diagnostics: r.diagnostics });
  const m = e.editor && typeof e.editor == "object" ? e.editor : null, g = m ? m.controller || J({
    ...m,
    kind: "layout",
    layout: h,
    mode: I,
    editorMetaById: w
  }) : null, P = (a, i, l) => {
    s.value = a, h.value = M(a.layout), w.value = { ...a.editorMetaById }, I.value = a.mode, g == null || g.setExternalLayout(a.layout, l), i && i.requestedBreakpoint !== a.requestedBreakpoint && n({
      type: "breakpointChange",
      requestedBreakpoint: a.requestedBreakpoint,
      previous: i.requestedBreakpoint
    }), i && i.resolvedProfileId !== a.resolvedProfileId && n({
      type: "profileChange",
      resolvedProfileId: a.resolvedProfileId,
      previous: i.resolvedProfileId,
      fallbackApplied: a.fallbackApplied
    }), (!i || !D(S(i), S(a))) && n({ type: "projectionChange", runtime: a }), (!i || !D(i.diagnostics, a.diagnostics)) && n({ type: "diagnosticsChange", diagnostics: a.diagnostics });
  }, H = (a = "refresh") => {
    if (v) return;
    const i = s.value, l = E(c(e.document), {
      width: c(e.width),
      breakpoints: c(e.breakpoints),
      breakpoint: y(e.breakpoint) || null,
      targetView: y(e.targetView) || null,
      targetViewRule: e.targetViewRule,
      mode: y(e.mode) || "view",
      validation: e.validation,
      allowUnknownProfileItems: e.allowUnknownProfileItems
    });
    if (l.ok) {
      P(l.runtime, i, a);
      return;
    }
    n({ type: "projectionError", error: l.error, diagnostics: l.diagnostics }), n({ type: "diagnosticsChange", diagnostics: l.diagnostics });
  };
  u.push(B(
    () => [
      c(e.document),
      c(e.width),
      c(e.breakpoints),
      y(e.breakpoint),
      y(e.targetView),
      y(e.mode)
    ],
    () => H("input-change"),
    { deep: !0 }
  ));
  const R = (a) => {
    const i = W(
      c(e.document),
      s.value,
      a,
      {
        createMissingProfileOnEdit: e.createMissingProfileOnEdit,
        validation: e.validation,
        editorMetaById: w.value
      }
    );
    i.ok ? n({ type: "documentChange", document: i.document, runtime: s.value }) : (n({ type: "projectionError", error: i.error, diagnostics: i.diagnostics }), n({ type: "diagnosticsChange", diagnostics: i.diagnostics }));
  }, k = (a) => {
    const i = s.value, l = te(i), f = {
      ...i,
      heightRuntime: a,
      diagnostics: l.concat(
        a.diagnostics.map((d) => Q(d, i))
      )
    };
    s.value = f, D(S(i), S(f)) || n({ type: "projectionChange", runtime: f }), D(i.diagnostics, f.diagnostics) || n({ type: "diagnosticsChange", diagnostics: f.diagnostics });
  }, t = () => {
    v || (v = !0, u.forEach((a) => a()), m != null && m.controller || g == null || g.stop());
  };
  return L() && x(t), {
    state: s,
    editorController: g,
    getInnerEditorProp: () => g ? { ...m || {}, controller: g } : !1,
    onLayoutChange: R,
    onHeightRuntimeChange: k,
    refresh: H,
    stop: t
  };
}
function oe(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !G(e);
}
const V = (e) => {
  if (Array.isArray(e)) return [e[0], e[1]];
  const r = typeof e == "number" ? e : 10;
  return [r, r];
}, ne = (e, r) => Object.prototype.hasOwnProperty.call(e, r), j = (e, r) => ne(e, "rowHeight") ? e.rowHeight : r, re = ["update:document", "documentChange", "breakpointChange", "profileChange", "projectionChange", "diagnosticsChange", "projectionError", "layoutChange", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "drop", "dropDragOver"], Ee = /* @__PURE__ */ N({
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
    layoutEngine: {
      type: [Boolean, Object],
      default: void 0
    },
    editor: {
      type: [Boolean, Object],
      default: !1
    }
  },
  emits: re,
  setup(e, {
    attrs: r,
    slots: s,
    emit: h
  }) {
    const w = L();
    let I = "";
    const n = ae({
      document: b(e, "document"),
      width: b(e, "width"),
      breakpoints: b(e, "breakpoints"),
      breakpoint: b(e, "breakpoint"),
      targetView: b(e, "targetView"),
      targetViewRule: e.targetViewRule,
      mode: b(e, "mode"),
      validation: e.validation,
      layoutEngine: e.layoutEngine,
      editor: e.editor,
      createMissingProfileOnEdit: e.createMissingProfileOnEdit,
      allowUnknownProfileItems: e.allowUnknownProfileItems,
      onEvent: (t) => {
        if (t.type === "documentChange") {
          h("update:document", t.document), h("documentChange", t.document, t.runtime);
          return;
        }
        h(t.type, t);
      }
    }), u = (t) => (...o) => h(t, ...o, n.state.value), v = (t) => {
      n.onLayoutChange(t), h("layoutChange", t, n.state.value);
    }, m = (t) => t.replace(/[A-Z]/g, (o) => `-${o.toLowerCase()}`), g = (t) => {
      const o = (w == null ? void 0 : w.vnode.props) || {};
      return Object.prototype.hasOwnProperty.call(o, t) || Object.prototype.hasOwnProperty.call(o, m(t));
    }, P = (t) => {
      const o = {
        ...t
      };
      return g("heightMode") && (o.heightMode = e.heightMode), g("containerHeight") && (o.containerHeight = e.containerHeight), g("autoMeasureContainerHeight") && (o.autoMeasureContainerHeight = e.autoMeasureContainerHeight), g("minRowHeight") && (o.minRowHeight = e.minRowHeight), g("rowHeight") && (o.rowHeight = e.rowHeight), g("renderPrecision") && (o.renderPrecision = e.renderPrecision), o;
    };
    let H = "";
    const R = () => {
      const t = n.state.value, o = P(t.heightOptions), a = Y({
        layout: t.layout,
        autoSize: e.autoSize,
        heightMode: o.heightMode,
        rowHeight: j(o, t.gridSettings.rowHeight),
        minRowHeight: o.minRowHeight,
        margin: V(t.gridSettings.margin),
        containerPadding: t.gridSettings.containerPadding || [0, 0],
        containerHeight: o.containerHeight,
        autoMeasureContainerHeight: o.autoMeasureContainerHeight,
        renderPrecision: o.renderPrecision,
        context: {
          source: "dashboard-responsive",
          layoutId: t.layoutId,
          profileId: t.resolvedProfileId,
          targetView: t.targetView
        }
      }), i = JSON.stringify(a), l = t.heightRuntime ? JSON.stringify(t.heightRuntime) : "";
      i === H && i === l || (H = i, n.onHeightRuntimeChange(a));
    };
    B(() => [n.state.value.layout, n.state.value.gridSettings, n.state.value.heightOptions, e.autoSize, e.heightMode, e.containerHeight, e.autoMeasureContainerHeight, e.minRowHeight, e.rowHeight, e.renderPrecision], R, {
      deep: !0
    }), U(R);
    const k = () => {
      const t = n.state.value, o = s.default ? Z(_(T, null, s.default())) : [], a = {}, i = t.diagnostics.slice();
      o.forEach((d) => {
        d && d.key != null && (a[String(d.key)] = d);
      });
      const l = t.renderItemIds.slice();
      l.forEach((d) => {
        a[d] || i.push(C("slot-widget-mismatch", "warning", `No slot child was provided for dashboard widget "${d}".`, {
          layoutId: t.layoutId,
          profileId: t.resolvedProfileId || void 0,
          itemId: d
        }));
      }), Object.keys(a).sort().forEach((d) => {
        t.allItemIds.indexOf(d) === -1 && i.push(C("slot-widget-mismatch", "warning", `Slot child "${d}" does not match a dashboard widget.`, {
          layoutId: t.layoutId,
          profileId: t.resolvedProfileId || void 0,
          itemId: d
        }));
      });
      const f = JSON.stringify(i);
      return f !== I && (I = f, h("diagnosticsChange", {
        type: "diagnosticsChange",
        diagnostics: i
      })), l.map((d) => a[d]).filter(Boolean);
    };
    return () => {
      let t;
      const o = n.state.value, {
        document: a,
        breakpoints: i,
        breakpoint: l,
        targetView: f,
        targetViewRule: d,
        mode: de,
        validation: se,
        allowUnknownProfileItems: ge,
        createMissingProfileOnEdit: le,
        modelValue: ce,
        cols: ue,
        margin: he,
        containerPadding: me,
        rowHeight: fe,
        heightMode: ye,
        containerHeight: we,
        autoMeasureContainerHeight: pe,
        minRowHeight: be,
        renderPrecision: Ie,
        editor: ve,
        layoutEngine: He,
        ...z
      } = e, p = P(o.heightOptions);
      return q($, F(r, z, {
        onHeightRuntimeChange: n.onHeightRuntimeChange,
        "onHeight-runtime-change": n.onHeightRuntimeChange
      }, {
        width: e.width,
        modelValue: o.layout,
        cols: o.gridSettings.columns,
        margin: V(o.gridSettings.margin),
        containerPadding: o.gridSettings.containerPadding || [0, 0],
        rowHeight: j(p, o.gridSettings.rowHeight),
        heightMode: p.heightMode,
        containerHeight: p.containerHeight,
        autoMeasureContainerHeight: p.autoMeasureContainerHeight,
        minRowHeight: p.minRowHeight,
        renderPrecision: p.renderPrecision,
        layoutEngine: e.layoutEngine,
        editor: n.getInnerEditorProp(),
        onLayoutChange: v,
        onDragStart: u("dragStart"),
        onDrag: u("drag"),
        onDragStop: u("dragStop"),
        onResizeStart: u("resizeStart"),
        onResize: u("resize"),
        onResizeStop: u("resizeStop"),
        onDrop: u("drop"),
        onDropDragOver: u("dropDragOver")
      }), oe(t = k()) ? t : {
        default: () => [t]
      });
    };
  }
});
export {
  je as DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE,
  Be as DASHBOARD_SCHEMA_VERSION,
  Ee as DashboardResponsiveVueGridLayout,
  Le as cloneDashboardJsonValue,
  ze as createDashboardDocumentFromResponsiveLayouts,
  Q as createDashboardHeightDiagnostic,
  C as createDashboardResponsiveDiagnostic,
  Ae as deserializeDashboardLayoutDocument,
  xe as exportThingsBoardDashboardLayout,
  Ne as importThingsBoardDashboardLayout,
  X as isDashboardHeightDiagnostic,
  Ue as migrateDashboardLayoutDocument,
  qe as migrateDashboardLayoutSettings,
  Fe as projectDashboardLayoutDocument,
  Ge as repairDashboardLayoutCollisions,
  _e as resolveDashboardHeightOptions,
  E as resolveDashboardResponsiveProfile,
  Te as serializeDashboardLayoutDocument,
  Je as translateDashboardLayout,
  ae as useDashboardResponsiveProfileModel,
  $e as validateDashboardLayoutDocument,
  W as writeDashboardResponsiveRuntimeToDocument,
  Ke as writeDashboardRuntimeToDocument
};
