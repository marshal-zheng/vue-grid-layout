import { p as S, E as k, P as B, t as x } from "./EditorGridLayout-BhiwfJ83.mjs";
import { G as Y, a as Z, b as _, c as $, d as ee, e as te, f as ae, g as oe, h as ie, i as re, j as se, k as de, l as ne, m as le, n as ce, o as me, q as ue, r as pe, s as Ee, u as ye, v as Ge, w as fe, x as be, y as ge, z as ve, A as he, B as Pe, C as Ce, D as Ie, F as Re, H as Se, I as ke, J as Be, K as xe, L as Me, M as je, N as we, O as Oe, Q as Le, R as ze, S as De, T as Ae, U as Te, V as He, W as Fe, X as Ne, Y as Ve, Z as Ke } from "./EditorGridLayout-BhiwfJ83.mjs";
import { defineComponent as M, toRef as p, onMounted as j, onBeforeUnmount as w, createVNode as O, mergeProps as L, isVNode as z } from "vue";
import { u as D } from "./persistence-Db97X8w7.mjs";
import { u as A, g as G } from "./useResponsiveGridLayoutModel-B4Gck4v8.mjs";
import { a as Ue, b as Je, c as Qe, d as We, e as Xe, f as Ye, g as Ze, h as _e, i as $e, j as et, k as tt, l as at, m as ot, n as it, o as rt, p as st, q as dt, r as nt, s as lt, t as ct, u as mt, v as ut, w as pt, x as Et, y as yt, z as Gt, A as ft, B as bt, C as gt, D as vt, E as ht, F as Pt, G as Ct, H as It } from "./commands-BQlR3l-u.mjs";
function T(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !z(e);
}
const b = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), f = (e) => !!(e && typeof e == "object" && !b(e)), H = (e) => typeof e == "function" ? {
  ...e() || {}
} : {
  ...e || {}
}, Q = /* @__PURE__ */ M({
  name: "EditorResponsiveGridLayout",
  props: {
    breakpoint: {
      type: String,
      default: ""
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
    allowOverlap: {
      type: Boolean,
      default: !1
    },
    verticalCompact: {
      type: Boolean,
      default: !0
    },
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
    margin: {
      type: [Array, Object],
      default: () => [10, 10]
    },
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
    layouts: {
      type: Object,
      default: () => ({})
    },
    width: {
      type: Number,
      required: !0
    },
    compactType: {
      type: String,
      default: "vertical",
      validator: (e) => e == null || ["vertical", "horizontal"].includes(e)
    },
    persistence: {
      type: [Boolean, Object],
      default: !1
    },
    layoutEngine: {
      type: [Boolean, Object],
      default: void 0
    },
    dragActivationDistance: {
      type: [Number, Object],
      default: void 0
    },
    editor: {
      type: [Boolean, Object],
      default: !1
    }
  },
  emits: ["update:layouts", "layoutChange", "breakpointChange", "widthChange"],
  setup(e, {
    slots: l,
    emit: g
  }) {
    const E = A({
      props: e,
      slots: l,
      emit: g
    }), {
      state: s
    } = E, a = e.editor && typeof e.editor == "object" ? e.editor : null, c = p(s, "layouts"), m = p(s, "breakpoint"), r = e.persistence || (a == null ? void 0 : a.persistence);
    let t = null;
    const i = a && b(r) ? r : a && f(r) ? D({
      ...r,
      kind: "responsive",
      target: c,
      watchTarget: !1,
      meta: () => ({
        ...H(r.meta),
        editor: x((t == null ? void 0 : t.editorMetaById.value) || {}, t == null ? void 0 : t.sectionRows.value)
      }),
      onEvent: (o) => {
        var d;
        if (o.type === "load-success" || o.type === "external-apply") {
          const n = B(o.document);
          n.ok && n.envelope && t && (t.editorMetaById.value = n.envelope.editorMetaById, n.envelope.sectionRows && (t.sectionRows.value = n.envelope.sectionRows)), t == null || t.setExternalLayouts(o.value, m.value, o.type);
        }
        (d = r.onEvent) == null || d.call(r, o);
      }
    }) : null, y = !!(a && i && f(r)), v = (o) => {
      var d;
      (d = a == null ? void 0 : a.onEvent) == null || d.call(a, o), o.type === "command-commit" && o.result.status === "changed" && (i == null || i.commit(c.value, {
        source: "component"
      }));
    };
    t = a ? a.controller || S({
      ...a,
      kind: "responsive",
      layout: p(s, "layout"),
      layouts: c,
      breakpoint: m,
      persistence: i || a.persistence,
      onEvent: v
    }) : null, j(() => {
      y && (i == null || i.load().then((o) => {
        o.value && o.fallbackApplied && (t == null || t.setExternalLayouts(o.value, m.value, "persistence-fallback"));
      }));
    }), w(() => {
      a != null && a.controller ? y && (i == null || i.stop()) : t == null || t.stop();
    });
    const h = () => t ? {
      ...a || {},
      controller: t
    } : !1;
    return () => {
      const {
        breakpoint: o,
        breakpoints: d,
        cols: n,
        layouts: F,
        margin: P,
        containerPadding: C,
        persistence: N,
        layoutEngine: I,
        editor: V,
        ...R
      } = e, u = l.default ? l.default() : null;
      return O(k, L(R, {
        margin: G(P, s.breakpoint) || [10, 10],
        containerPadding: G(C, s.breakpoint) || [0, 0],
        onLayoutChange: E.onLayoutChange,
        modelValue: s.layout,
        cols: s.cols,
        layoutEngine: I,
        editor: h()
      }), T(u) ? u : {
        default: () => [u]
      });
    };
  }
});
export {
  k as EditorGridLayout,
  Q as EditorResponsiveGridLayout,
  Y as GridEditorClipboardError,
  Ue as applyEditorMetadataPatches,
  Z as applyGridEditorAlign,
  _ as applyGridEditorDistribute,
  $ as applyGridEditorTidy,
  ee as bindGridEditorKeyboard,
  Je as blockedGridEditorCommandResult,
  te as buildGridEditorPlacementAffectedOutlines,
  ae as buildGridEditorPlacementCommitCommand,
  oe as builtInGridEditorCommandDescriptors,
  ie as cancelGridEditorPlacementSession,
  Qe as checkGridEditorCommand,
  re as clearEditorSelection,
  We as collectAffectedIds,
  Xe as collectEditorLayoutPatches,
  se as computeGridEditorDistribution,
  de as computeGridEditorGuideStateFromGeometry,
  ne as computeGridEditorGuides,
  le as computeGridEditorIntelligence,
  Ye as createEditorMetadataPatch,
  ce as createGridEditorClipboardPayload,
  me as createGridEditorCommandKernel,
  Ze as createGridEditorCommandResult,
  S as createGridEditorController,
  ue as createGridEditorHistory,
  pe as createGridEditorHistoryEntry,
  Ee as createGridEditorPersistenceBridge,
  x as createGridEditorPersistenceEnvelope,
  ye as createGridEditorPlacementRollbackSnapshot,
  Ge as createGridEditorPlacementSession,
  fe as createGridEditorSelection,
  be as createGridEditorTransactionPreview,
  _e as defaultGridEditorHistoryMode,
  ge as deriveGridEditorToolbarState,
  ve as describeEditorA11yItems,
  $e as emptyGridEditorSectionRows,
  et as errorGridEditorCommandResult,
  he as filterGridEditorDisplayGuides,
  Pe as getGridEditorCommandDescriptor,
  Ce as getGridEditorCommandDescriptors,
  Ie as getGridEditorKeyboardCommand,
  Re as getLayoutIds,
  Se as getNextFocusableId,
  tt as getVisibleLayout,
  at as hasEditorMeta,
  ot as hasUnsafeEditorMetaKeys,
  ke as internalGridEditorClipboard,
  it as isEditorItemVisible,
  rt as isHistoryCommand,
  st as isLayoutCommand,
  dt as isMetadataCommand,
  nt as isPersistenceCommand,
  lt as isSectionRowCommand,
  ct as isSelectionOnlyCommand,
  mt as mergeGridEditorDiagnostics,
  Be as messageFromCommandResult,
  ut as normalizeEditorMetaById,
  xe as normalizeGridEditorClipboardItemsForTarget,
  pt as normalizeGridEditorCommand,
  Et as normalizeGridEditorHistoryPolicy,
  Me as normalizeGridEditorPlacementDiagnostics,
  yt as normalizeGridEditorSectionRows,
  je as normalizeSelection,
  we as parseGridEditorClipboardPayload,
  Gt as patchEditorMeta,
  Oe as placeGridEditorNewItems,
  B as readGridEditorPersistenceEnvelope,
  ft as removeOrphanEditorMeta,
  Le as requireGridEditorCommandDescriptor,
  bt as resolveEditorCapabilities,
  gt as resolveEditorItemCapability,
  vt as resolveGridEditorCommandTargets,
  ze as resolveGridEditorSnap,
  ht as runGridEditorBeforeCommand,
  Pt as sanitizeEditorMetaById,
  De as sanitizeSelectionForLayout,
  Ae as selectEditorIds,
  Te as shouldIgnoreEditorKeyboardEvent,
  Ct as shouldRecordGridEditorHistory,
  He as snapItemToGuides,
  Fe as systemClipboardAdapter,
  Ne as updateGridEditorPlacementSession,
  Ve as updateSelectionByIntent,
  Ke as useGridEditor,
  It as validateEditorMetaById
};
