import { p as S, E as k, R as B, t as x } from "./EditorGridLayout-DpntIoJ0.mjs";
import { G as X, a as Y, b as Z, c as $, d as ee, e as te, f as ae, g as oe, h as ie, i as re, j as se, k as de, l as ne, m as le, n as ce, o as me, q as ue, r as pe, s as Ee, u as ye, v as Ge, w as fe, x as be, y as ge, z as ve, A as he, B as Pe, C as Ce, D as Ie, F as Re, H as Se, I as ke, J as Be, K as xe, L as Me, M as je, N as we, O as Oe, P as Le, Q as ze, S as De, T as Ae, U as Te, V as Fe, W as He, X as Ne, Y as Ve, Z as Ke, _ as qe, $ as Ue } from "./EditorGridLayout-DpntIoJ0.mjs";
import { defineComponent as M, toRef as p, onMounted as j, onBeforeUnmount as w, createVNode as O, mergeProps as L, isVNode as z } from "vue";
import { u as D } from "./persistence-Db97X8w7.mjs";
import { u as A, g as G } from "./useResponsiveGridLayoutModel-DRSQU3cC.mjs";
import { a as Je, b as Qe, c as We, d as Xe, e as Ye, f as Ze, g as $e, h as et, i as tt, j as at, k as ot, l as it, m as rt, n as st, o as dt, p as nt, q as lt, r as ct, s as mt, t as ut, u as pt, v as Et, w as yt, x as Gt, y as ft, z as bt, A as gt, B as vt, C as ht, D as Pt, E as Ct, F as It } from "./commands-Q0wgqPfi.mjs";
function T(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !z(e);
}
const b = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), f = (e) => !!(e && typeof e == "object" && !b(e)), F = (e) => typeof e == "function" ? {
  ...e() || {}
} : {
  ...e || {}
}, J = /* @__PURE__ */ M({
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
        ...F(r.meta),
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
        layouts: H,
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
  J as EditorResponsiveGridLayout,
  X as GridEditorClipboardError,
  Je as applyEditorMetadataPatches,
  Y as applyGridEditorAlign,
  Z as applyGridEditorDistribute,
  $ as applyGridEditorTidy,
  ee as bindGridEditorKeyboard,
  Qe as blockedGridEditorCommandResult,
  te as buildGridEditorPlacementAffectedOutlines,
  ae as buildGridEditorPlacementCommitCommand,
  oe as builtInGridEditorCommandDescriptors,
  ie as cancelGridEditorPlacementSession,
  We as checkGridEditorCommand,
  re as clearEditorSelection,
  Xe as collectAffectedIds,
  Ye as collectEditorLayoutPatches,
  se as computeGridEditorDistribution,
  de as computeGridEditorGuideStateFromGeometry,
  ne as computeGridEditorGuides,
  le as computeGridEditorIntelligence,
  Ze as createEditorMetadataPatch,
  ce as createGridEditorClipboardPayload,
  me as createGridEditorCommandKernel,
  $e as createGridEditorCommandResult,
  S as createGridEditorController,
  ue as createGridEditorHistory,
  pe as createGridEditorHistoryEntry,
  Ee as createGridEditorPersistenceBridge,
  x as createGridEditorPersistenceEnvelope,
  ye as createGridEditorPlacementRollbackSnapshot,
  Ge as createGridEditorPlacementSession,
  fe as createGridEditorSelection,
  be as createGridEditorTransactionPreview,
  et as defaultGridEditorHistoryMode,
  ge as deriveGridEditorToolbarState,
  ve as describeEditorA11yItems,
  he as emptyGridEditorSectionRows,
  tt as errorGridEditorCommandResult,
  Pe as filterGridEditorDisplayGuides,
  Ce as getGridEditorCommandDescriptor,
  Ie as getGridEditorCommandDescriptors,
  Re as getGridEditorKeyboardCommand,
  Se as getLayoutIds,
  ke as getNextFocusableId,
  at as getVisibleLayout,
  ot as hasEditorMeta,
  it as hasUnsafeEditorMetaKeys,
  Be as internalGridEditorClipboard,
  rt as isEditorItemVisible,
  st as isHistoryCommand,
  dt as isLayoutCommand,
  nt as isMetadataCommand,
  lt as isPersistenceCommand,
  ct as isSectionRowCommand,
  mt as isSelectionOnlyCommand,
  ut as mergeGridEditorDiagnostics,
  xe as messageFromCommandResult,
  pt as normalizeEditorMetaById,
  Me as normalizeGridEditorClipboardItemsForTarget,
  Et as normalizeGridEditorCommand,
  yt as normalizeGridEditorHistoryPolicy,
  je as normalizeGridEditorPlacementDiagnostics,
  we as normalizeGridEditorSectionRows,
  Oe as normalizeSelection,
  Le as parseGridEditorClipboardPayload,
  Gt as patchEditorMeta,
  ze as placeGridEditorNewItems,
  B as readGridEditorPersistenceEnvelope,
  ft as removeOrphanEditorMeta,
  De as requireGridEditorCommandDescriptor,
  bt as resolveEditorCapabilities,
  gt as resolveEditorItemCapability,
  vt as resolveGridEditorCommandTargets,
  Ae as resolveGridEditorSnap,
  ht as runGridEditorBeforeCommand,
  Pt as sanitizeEditorMetaById,
  Te as sanitizeSelectionForLayout,
  Fe as selectEditorIds,
  He as shouldIgnoreEditorKeyboardEvent,
  Ct as shouldRecordGridEditorHistory,
  Ne as snapItemToGuides,
  Ve as systemClipboardAdapter,
  Ke as updateGridEditorPlacementSession,
  qe as updateSelectionByIntent,
  Ue as useGridEditor,
  It as validateEditorMetaById
};
