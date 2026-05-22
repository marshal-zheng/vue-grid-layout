import { unref as c, shallowRef as A, ref as C, watch as j, getCurrentInstance as L, onBeforeUnmount as x, defineComponent as N, toRef as b, onMounted as U, createVNode as q, mergeProps as F, isVNode as G, h as _, Fragment as T } from "vue";
import { p as J, E as $ } from "./EditorGridLayout-B1YAnYIP.mjs";
import { b as K } from "./createGridLayoutComponent-DrGx-LJV.mjs";
import { p as Z } from "./utils-BCVYGne6.mjs";
import { deepEqual as D } from "fast-equals";
import { l as E, e as O, d as Q, w as W, h as X } from "./dashboard-migration-C2O_N30f.mjs";
import { D as Be, a as je, c as Le, b as ze, f as Ae, g as xe, i as Ne, m as Ue, j as qe, p as Fe, r as Ge, k as _e, s as Te, t as Je, v as $e, n as Ke } from "./dashboard-migration-C2O_N30f.mjs";
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
    O(
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
  var d;
  (d = e.onEvent) == null || d.call(e, r);
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
  }), d = A(
    r.ok ? r.runtime : ee(e)
  ), h = C(M(d.value.layout)), w = C({ ...d.value.editorMetaById }), I = C(d.value.mode), n = ie(e), u = [];
  let v = !1;
  r.ok || n({ type: "projectionError", error: r.error, diagnostics: r.diagnostics });
  const m = e.editor && typeof e.editor == "object" ? e.editor : null, g = m ? m.controller || J({
    ...m,
    kind: "layout",
    layout: h,
    mode: I,
    editorMetaById: w
  }) : null, P = (o, i, l) => {
    d.value = o, h.value = M(o.layout), w.value = { ...o.editorMetaById }, I.value = o.mode, g == null || g.setExternalLayout(o.layout, l), i && i.requestedBreakpoint !== o.requestedBreakpoint && n({
      type: "breakpointChange",
      requestedBreakpoint: o.requestedBreakpoint,
      previous: i.requestedBreakpoint
    }), i && i.resolvedProfileId !== o.resolvedProfileId && n({
      type: "profileChange",
      resolvedProfileId: o.resolvedProfileId,
      previous: i.resolvedProfileId,
      fallbackApplied: o.fallbackApplied
    }), (!i || !D(S(i), S(o))) && n({ type: "projectionChange", runtime: o }), (!i || !D(i.diagnostics, o.diagnostics)) && n({ type: "diagnosticsChange", diagnostics: o.diagnostics });
  }, H = (o = "refresh") => {
    if (v) return;
    const i = d.value, l = E(c(e.document), {
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
      P(l.runtime, i, o);
      return;
    }
    n({ type: "projectionError", error: l.error, diagnostics: l.diagnostics }), n({ type: "diagnosticsChange", diagnostics: l.diagnostics });
  };
  u.push(j(
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
  const R = (o) => {
    const i = W(
      c(e.document),
      d.value,
      o,
      {
        createMissingProfileOnEdit: e.createMissingProfileOnEdit,
        validation: e.validation,
        editorMetaById: w.value
      }
    );
    i.ok ? n({ type: "documentChange", document: i.document, runtime: d.value }) : (n({ type: "projectionError", error: i.error, diagnostics: i.diagnostics }), n({ type: "diagnosticsChange", diagnostics: i.diagnostics }));
  }, k = (o) => {
    const i = d.value, l = te(i), f = {
      ...i,
      heightRuntime: o,
      diagnostics: l.concat(
        o.diagnostics.map((s) => Q(s, i))
      )
    };
    d.value = f, D(S(i), S(f)) || n({ type: "projectionChange", runtime: f }), D(i.diagnostics, f.diagnostics) || n({ type: "diagnosticsChange", diagnostics: f.diagnostics });
  }, t = () => {
    v || (v = !0, u.forEach((o) => o()), m != null && m.controller || g == null || g.stop());
  };
  return L() && x(t), {
    state: d,
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
}, ne = (e, r) => Object.prototype.hasOwnProperty.call(e, r), B = (e, r) => ne(e, "rowHeight") ? e.rowHeight : r, re = ["update:document", "documentChange", "breakpointChange", "profileChange", "projectionChange", "diagnosticsChange", "projectionError", "layoutChange", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "drop", "dropDragOver"], Ee = /* @__PURE__ */ N({
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
    slots: d,
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
    }), u = (t) => (...a) => h(t, ...a, n.state.value), v = (t) => {
      n.onLayoutChange(t), h("layoutChange", t, n.state.value);
    }, m = (t) => t.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`), g = (t) => {
      const a = (w == null ? void 0 : w.vnode.props) || {};
      return Object.prototype.hasOwnProperty.call(a, t) || Object.prototype.hasOwnProperty.call(a, m(t));
    }, P = (t) => {
      const a = {
        ...t
      };
      return g("heightMode") && (a.heightMode = e.heightMode), g("containerHeight") && (a.containerHeight = e.containerHeight), g("autoMeasureContainerHeight") && (a.autoMeasureContainerHeight = e.autoMeasureContainerHeight), g("minRowHeight") && (a.minRowHeight = e.minRowHeight), g("rowHeight") && (a.rowHeight = e.rowHeight), g("renderPrecision") && (a.renderPrecision = e.renderPrecision), a;
    };
    let H = "";
    const R = () => {
      const t = n.state.value, a = P(t.heightOptions), o = Y({
        layout: t.layout,
        autoSize: e.autoSize,
        heightMode: a.heightMode,
        rowHeight: B(a, t.gridSettings.rowHeight),
        minRowHeight: a.minRowHeight,
        margin: V(t.gridSettings.margin),
        containerPadding: t.gridSettings.containerPadding || [0, 0],
        containerHeight: a.containerHeight,
        autoMeasureContainerHeight: a.autoMeasureContainerHeight,
        renderPrecision: a.renderPrecision,
        context: {
          source: "dashboard-responsive",
          layoutId: t.layoutId,
          profileId: t.resolvedProfileId,
          targetView: t.targetView
        }
      }), i = JSON.stringify(o), l = t.heightRuntime ? JSON.stringify(t.heightRuntime) : "";
      i === H && i === l || (H = i, n.onHeightRuntimeChange(o));
    };
    j(() => [n.state.value.layout, n.state.value.gridSettings, n.state.value.heightOptions, e.autoSize, e.heightMode, e.containerHeight, e.autoMeasureContainerHeight, e.minRowHeight, e.rowHeight, e.renderPrecision], R, {
      deep: !0
    }), U(R);
    const k = () => {
      const t = n.state.value, a = d.default ? Z(_(T, null, d.default())) : [], o = {}, i = t.diagnostics.slice();
      a.forEach((s) => {
        s && s.key != null && (o[String(s.key)] = s);
      });
      const l = t.renderItemIds.slice();
      l.forEach((s) => {
        o[s] || i.push(O("slot-widget-mismatch", "warning", `No slot child was provided for dashboard widget "${s}".`, {
          layoutId: t.layoutId,
          profileId: t.resolvedProfileId || void 0,
          itemId: s
        }));
      }), Object.keys(o).sort().forEach((s) => {
        t.allItemIds.indexOf(s) === -1 && i.push(O("slot-widget-mismatch", "warning", `Slot child "${s}" does not match a dashboard widget.`, {
          layoutId: t.layoutId,
          profileId: t.resolvedProfileId || void 0,
          itemId: s
        }));
      });
      const f = JSON.stringify(i);
      return f !== I && (I = f, h("diagnosticsChange", {
        type: "diagnosticsChange",
        diagnostics: i
      })), l.map((s) => o[s]).filter(Boolean);
    };
    return () => {
      let t;
      const a = n.state.value, {
        document: o,
        breakpoints: i,
        breakpoint: l,
        targetView: f,
        targetViewRule: s,
        mode: se,
        validation: de,
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
      } = e, p = P(a.heightOptions);
      return q($, F(r, z, {
        onHeightRuntimeChange: n.onHeightRuntimeChange,
        "onHeight-runtime-change": n.onHeightRuntimeChange
      }, {
        width: e.width,
        modelValue: a.layout,
        cols: a.gridSettings.columns,
        margin: V(a.gridSettings.margin),
        containerPadding: a.gridSettings.containerPadding || [0, 0],
        rowHeight: B(p, a.gridSettings.rowHeight),
        heightMode: p.heightMode,
        containerHeight: p.containerHeight,
        autoMeasureContainerHeight: p.autoMeasureContainerHeight,
        minRowHeight: p.minRowHeight,
        renderPrecision: p.renderPrecision,
        layoutEngine: e.layoutEngine,
        editor: n.getInnerEditorProp(),
        itemCapabilities: a.capabilitiesById,
        resizeConstraints: a.resizeConstraintsById,
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
  Be as DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE,
  je as DASHBOARD_SCHEMA_VERSION,
  Ee as DashboardResponsiveVueGridLayout,
  Le as cloneDashboardJsonValue,
  ze as createDashboardDocumentFromResponsiveLayouts,
  Q as createDashboardHeightDiagnostic,
  O as createDashboardResponsiveDiagnostic,
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
