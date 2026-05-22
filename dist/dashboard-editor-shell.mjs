import { f as Rt } from "./resolve-C3SqJijI.mjs";
import { ref as lt, unref as ue, watch as Fe, getCurrentInstance as Pt, onBeforeUnmount as Mt, readonly as St } from "vue";
import { t as Et, w as At } from "./dashboard-migration-C2O_N30f.mjs";
import { g as Ct } from "./commands-Q0wgqPfi.mjs";
const U = (e) => typeof e == "number" && Number.isFinite(e), ut = (e, s) => {
  if (typeof e == "number" && Number.isFinite(e)) return [e, e];
  if (Array.isArray(e)) {
    const r = typeof e[0] == "number" && Number.isFinite(e[0]) ? e[0] : s[0], d = typeof e[1] == "number" && Number.isFinite(e[1]) ? e[1] : s[1];
    return [r, d];
  }
  return s;
}, ht = (e, s, r, d = {}) => ({
  code: e,
  level: s,
  message: r,
  ...d
}), mt = (e, s = []) => ({
  ok: !0,
  position: e,
  diagnostics: s
}), Le = (e, s, r = []) => ({
  ok: !1,
  status: "blocked",
  reason: e,
  diagnostics: r.concat(ht(
    `position-${e}`,
    "warning",
    s,
    { reason: e, recoverable: !0 }
  ))
}), Be = (e, s, r, d) => {
  if (!e || !U(e.x) || !U(e.y)) return null;
  const f = Math.max(0, Math.min(Math.floor(e.x), Math.max(0, r - 1))), y = Math.max(0, Number.isFinite(d) ? Math.min(Math.floor(e.y), Math.max(0, d - 1)) : Math.floor(e.y));
  return {
    x: f,
    y,
    source: e.source || s,
    list: e.list,
    clientX: e.clientX,
    clientY: e.clientY,
    cols: r
  };
}, Dt = (e, s, r, d) => ({
  x: Math.max(0, Math.min(Math.floor(e.x + e.w), Math.max(0, r - 1))),
  y: Math.max(0, Number.isFinite(d) ? Math.min(Math.floor(e.y + e.h), Math.max(0, d - 1)) : Math.floor(e.y + e.h)),
  source: s,
  cols: r
}), Tt = (e, s, r, d) => {
  const f = e.filter((M) => s.indexOf(M.i) !== -1);
  if (f.length === 0) return null;
  const y = Math.min(...f.map((M) => M.x)), I = Math.min(...f.map((M) => M.y)), v = Math.max(...f.map((M) => M.x + M.w)), L = Math.max(...f.map((M) => M.y + M.h));
  return {
    x: Math.max(0, Math.min(Math.floor((y + v) / 2), Math.max(0, r - 1))),
    y: Math.max(0, Number.isFinite(d) ? Math.min(Math.floor((I + L) / 2), Math.max(0, d - 1)) : Math.floor((I + L) / 2)),
    source: "selection",
    cols: r
  };
}, Wt = (e) => {
  var f, y;
  if (!e) return null;
  const s = e;
  if (U(s.clientX) && U(s.clientY))
    return { clientX: s.clientX, clientY: s.clientY };
  const r = e, d = ((f = r.touches) == null ? void 0 : f[0]) || ((y = r.changedTouches) == null ? void 0 : y[0]);
  return d && U(d.clientX) && U(d.clientY) ? { clientX: d.clientX, clientY: d.clientY } : null;
}, Ft = (e) => ({
  left: U(e.scrollLeft) ? e.scrollLeft : 0,
  top: U(e.scrollTop) ? e.scrollTop : 0
}), ft = (e, s) => U(s.width) && s.width > 0 ? s.width : U(e.clientWidth) && e.clientWidth > 0 ? e.clientWidth : U(e.offsetWidth) && e.offsetWidth > 0 ? e.offsetWidth : 0, Lt = (e) => {
  const s = e != null && e.gridSettings ? e.gridSettings.maxRows : void 0;
  return U(s) && s > 0 ? Math.floor(s) : 1 / 0;
}, Bt = (e) => {
  var r;
  const s = (r = e == null ? void 0 : e.gridSettings) == null ? void 0 : r.columns;
  return U(s) && s > 0 ? Math.floor(s) : 12;
}, $e = (e) => {
  var d;
  const s = e == null ? void 0 : e.heightRuntime;
  if (s && U(s.rowHeight) && s.rowHeight > 0)
    return s.rowHeight;
  const r = (d = e == null ? void 0 : e.gridSettings) == null ? void 0 : d.rowHeight;
  return U(r) && r > 0 ? r : 150;
}, $t = (e, s) => {
  var f, y;
  const r = e.slice().sort((I, v) => I.y - v.y || I.x - v.x || I.i.localeCompare(v.i)), d = Math.max(0, Math.min(Math.floor(s), r.length));
  return {
    listIndex: d,
    beforeId: (f = r[d]) == null ? void 0 : f.i,
    afterId: d > 0 ? (y = r[d - 1]) == null ? void 0 : y.i : void 0
  };
}, Ht = (e, s) => {
  var r, d;
  return {
    ...e,
    x: 0,
    y: Math.max(0, (d = (r = e.list) == null ? void 0 : r.listIndex) != null ? d : e.y),
    source: e.source === "event" ? "list" : e.source,
    list: e.list || $t(s, e.y)
  };
}, Ke = (e) => {
  var se, A, w, D, oe, h;
  const s = e.runtime || null, r = e.layout || (s == null ? void 0 : s.layout) || [], d = Bt(s), f = Lt(s), y = [], I = e.itemSize || { w: 1, h: 1 }, v = (R) => ((s == null ? void 0 : s.viewFormat) || "grid") === "list" ? mt(Ht(R, r), y) : mt(R, y), L = Wt(e.event);
  if (L) {
    const R = e.gridElement || null;
    if (!R || typeof R.getBoundingClientRect != "function")
      return Le(
        "missing-grid-element",
        "Grid element is required to resolve event coordinates.",
        y
      );
    const X = R.getBoundingClientRect(), O = ft(R, X);
    if (!Number.isFinite(O) || O <= 0)
      return Le("missing-grid-element", "Grid element has no measurable width.", y);
    const ne = Ft(R), T = L.clientX - X.left + ne.left, j = L.clientY - X.top + ne.top, J = {
      margin: ut((se = s == null ? void 0 : s.gridSettings) == null ? void 0 : se.margin, [10, 10]),
      containerPadding: ut((A = s == null ? void 0 : s.gridSettings) == null ? void 0 : A.containerPadding, [0, 0]),
      containerWidth: O,
      cols: d,
      rowHeight: $e(s),
      maxRows: f,
      renderPrecision: (w = s == null ? void 0 : s.gridSettings) == null ? void 0 : w.renderPrecision
    }, N = Rt(J, j, T, I.w, I.h);
    return !U(N.x) || !U(N.y) || N.x < 0 || N.y < 0 ? Le("invalid-input", "Event coordinates produced an invalid grid position.", y) : v({
      x: N.x,
      y: N.y,
      source: "event",
      clientX: L.clientX,
      clientY: L.clientY,
      left: T,
      top: j,
      cols: d,
      rowHeight: J.rowHeight
    });
  }
  const M = e.activeItemId || ((D = e.selection) == null ? void 0 : D.activeId), E = M ? r.find((R) => R.i === M) : null;
  if (E) return v(Dt(E, "active-item", d, f));
  if ((h = (oe = e.selection) == null ? void 0 : oe.selectedIds) != null && h.length) {
    const R = Tt(r, e.selection.selectedIds, d, f);
    if (R) return v(R);
  }
  const B = Be(e.lastMenuPosition, "last-menu", d, f);
  if (B) return v(B);
  const _ = Be(e.lastPointerPosition, "last-pointer", d, f);
  if (_) return v(_);
  const z = e.gridElement || null;
  if (z && typeof z.getBoundingClientRect == "function") {
    const R = z.getBoundingClientRect();
    if (ft(z, R) > 0) {
      const O = $e(s), ne = Number.isFinite(f) ? f : Math.max(1, Math.ceil((z.clientHeight || O) / O));
      return v({
        x: Math.max(0, Math.floor(d / 2)),
        y: Math.max(0, Math.floor(ne / 2)),
        source: "viewport-center",
        cols: d,
        rowHeight: O
      });
    }
  }
  const ae = Be(e.fallback || null, "fallback", d, f);
  return ae ? v(ae) : (y.push(ht(
    "position-fallback-origin",
    "info",
    "No pointer, selection, menu, pointer, viewport or caller fallback was available; using origin.",
    { details: { positionSource: "none" }, recoverable: !0 }
  )), v({ x: 0, y: 0, source: "none", cols: d, rowHeight: $e(s) }));
}, jt = (e) => Ke(e);
let gt = 0;
const H = (e) => (gt += 1, `dashboard-shell-${e}-${Date.now().toString(36)}-${gt.toString(36)}`), Kt = (e) => ({
  layoutId: (e == null ? void 0 : e.layoutId) || null,
  requestedBreakpoint: (e == null ? void 0 : e.requestedBreakpoint) || null,
  resolvedProfileId: (e == null ? void 0 : e.resolvedProfileId) || null,
  targetView: (e == null ? void 0 : e.targetView) || null,
  viewFormat: (e == null ? void 0 : e.viewFormat) || null
}), Y = (e, s, r, d = {}) => {
  const f = {
    code: e,
    level: s,
    message: r
  };
  return Object.keys(d).sort().forEach((I) => {
    const v = d[I];
    typeof v != "undefined" && (f[I] = v);
  }), f;
}, Xe = (e, s = {}) => {
  const r = e instanceof Error ? e.message : String(e || "Unknown error");
  return Y(
    "shell-error",
    "error",
    r,
    {
      reason: "validation",
      recoverable: !0,
      ...s
    }
  );
}, q = (e) => {
  var s, r, d;
  return {
    ok: e.ok,
    status: e.status,
    actionId: e.actionId,
    actionType: e.actionType,
    source: e.source,
    itemIds: e.itemIds || [],
    affectedIds: e.affectedIds || ((s = e.commandResult) == null ? void 0 : s.affectedIds) || e.itemIds || [],
    position: e.position,
    commandResult: e.commandResult,
    writeResult: e.writeResult,
    adapter: e.adapter,
    placement: e.placement,
    proposedDocument: e.proposedDocument,
    idMap: e.idMap || ((r = e.adapter) == null ? void 0 : r.idMap),
    patches: e.patches || ((d = e.commandResult) == null ? void 0 : d.layoutPatches),
    diagnostics: Ie(e.diagnostics || []),
    data: e.data
  };
}, G = (e, s, r) => {
  e == null || e({
    type: "action-result",
    actionId: s.actionId,
    actionType: s.actionType,
    source: s.source,
    status: s.status,
    ok: s.ok,
    itemIds: s.itemIds,
    affectedIds: s.affectedIds,
    profile: r,
    position: s.position,
    commandResult: s.commandResult,
    adapter: s.adapter,
    placement: s.placement,
    diagnostics: s.diagnostics
  });
}, Ie = (e) => e.filter(Boolean).map((s) => {
  const r = {
    code: s.code,
    level: s.level,
    message: s.message
  };
  return Object.keys(s).filter((d) => d !== "code" && d !== "level" && d !== "message").sort().forEach((d) => {
    const f = s[d];
    typeof f != "undefined" && (r[d] = Ve(f));
  }), r;
}).sort(
  (s, r) => `${s.actionId || ""}:${s.code}:${s.path || ""}:${s.itemId || ""}`.localeCompare(`${r.actionId || ""}:${r.code}:${r.path || ""}:${r.itemId || ""}`)
), Ve = (e) => {
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
  if (Array.isArray(e)) return e.map(Ve);
  if (e instanceof Error) return { name: e.name, message: e.message };
  if (typeof e == "object") {
    const s = {};
    return Object.keys(e).sort().forEach((r) => {
      r === "opaque" || r === "payload" || r === "businessPayload" || (s[r] = Ve(e[r]));
    }), s;
  }
  return String(e);
}, Ce = (e, s, r) => ({
  stage: e,
  ok: (s == null ? void 0 : s.ok) !== !1,
  status: s == null ? void 0 : s.status,
  reason: s == null ? void 0 : s.reason,
  preparedId: r == null ? void 0 : r.id,
  sourceIds: (s == null ? void 0 : s.sourceIds) || (r == null ? void 0 : r.sourceIds),
  newIds: (s == null ? void 0 : s.newIds) || (r == null ? void 0 : r.newIds),
  idMap: (s == null ? void 0 : s.idMap) || (r == null ? void 0 : r.idMap),
  metadata: (s == null ? void 0 : s.metadata) || (r == null ? void 0 : r.metadata),
  diagnostics: Ie((s == null ? void 0 : s.diagnostics) || (r == null ? void 0 : r.diagnostics) || []),
  error: s != null && s.error ? { code: s.error.code, message: s.error.message } : void 0
}), Xt = (e) => !!(e && typeof e == "object" && "ok" in e && !("kind" in e)), Vt = (e) => !!(e && typeof e == "object" && "kind" in e), Se = async (e, s, r, d, f) => {
  if (e.rollback)
    try {
      const y = await e.rollback(s, {
        ...e.context,
        stage: r,
        error: d
      });
      return f.push(...(y == null ? void 0 : y.diagnostics) || []), Ce("rollback", y, s);
    } catch (y) {
      return f.push(Xe(y, {
        actionId: e.actionId,
        actionType: e.actionType,
        source: e.source,
        reason: "adapter-rejected"
      })), {
        stage: "rollback",
        ok: !1,
        status: "error",
        reason: "adapter-rejected",
        preparedId: s.id,
        error: {
          message: y instanceof Error ? y.message : String(y)
        }
      };
    }
}, He = async (e) => {
  var y, I, v, L, M, E, B, _, z, ae, se, A, w, D, oe;
  const s = e.itemIds || e.context.itemIds || [], r = e.context.diagnostics.slice();
  (y = e.emit) == null || y.call(e, {
    type: "action-start",
    actionId: e.actionId,
    actionType: e.actionType,
    source: e.source,
    itemIds: s,
    profile: e.profile,
    position: e.position,
    diagnostics: r
  });
  let d = null, f;
  try {
    if (e.prepare) {
      const T = await e.prepare(e.context);
      if (Xt(T)) {
        if (r.push(...T.diagnostics || []), f = Ce("prepare", T), !T.ok) {
          const j = q({
            ok: !1,
            status: T.status || "blocked",
            actionId: e.actionId,
            actionType: e.actionType,
            source: e.source,
            itemIds: s,
            affectedIds: [],
            position: e.position,
            adapter: f,
            idMap: T.idMap,
            diagnostics: r
          });
          return G(e.emit, j, e.profile), j;
        }
      } else Vt(T) && (d = T, r.push(...d.diagnostics || []), f = Ce("prepare", { ok: !0, diagnostics: d.diagnostics }, d));
    }
    const h = await e.mutate(d, e.context);
    if (r.push(...h.diagnostics || []), ((I = h.commandResult) == null ? void 0 : I.status) === "blocked" || ((v = h.commandResult) == null ? void 0 : v.status) === "cancelled" || ((L = h.commandResult) == null ? void 0 : L.status) === "timeout" || ((M = h.commandResult) == null ? void 0 : M.status) === "error" || ((E = h.writeResult) == null ? void 0 : E.ok) === !1 || h.status === "blocked" || h.status === "cancelled" || h.status === "timeout" || h.status === "unsupported" || h.status === "error") {
      const T = d ? await Se(e, d, "mutate", h, r) : void 0, j = ((B = h.writeResult) == null ? void 0 : B.ok) === !1 ? "blocked" : h.status || (((_ = h.commandResult) == null ? void 0 : _.status) === "cancelled" ? "cancelled" : ((z = h.commandResult) == null ? void 0 : z.status) === "timeout" ? "timeout" : ((ae = h.commandResult) == null ? void 0 : ae.status) === "error" ? "error" : "blocked"), J = q({
        ok: !1,
        status: j,
        actionId: e.actionId,
        actionType: e.actionType,
        source: e.source,
        itemIds: s,
        affectedIds: h.affectedIds || ((se = h.commandResult) == null ? void 0 : se.affectedIds) || [],
        position: e.position,
        commandResult: h.commandResult,
        writeResult: h.writeResult,
        proposedDocument: h.proposedDocument,
        adapter: T || f,
        placement: h.placement,
        idMap: d == null ? void 0 : d.idMap,
        patches: h.patches,
        diagnostics: r,
        data: h.data
      });
      return G(e.emit, J, e.profile), J;
    }
    if (d && e.commit) {
      let T;
      try {
        T = await e.commit(d, {
          ...e.context,
          commandResult: h.commandResult,
          writeResult: h.writeResult,
          proposedDocument: h.proposedDocument
        });
      } catch (j) {
        r.push(Xe(j, {
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          reason: "adapter-rejected"
        })), f = {
          stage: "commit",
          ok: !1,
          status: "error",
          reason: "adapter-rejected",
          preparedId: d.id,
          sourceIds: d.sourceIds,
          newIds: d.newIds,
          idMap: d.idMap,
          diagnostics: Ie(d.diagnostics || []),
          error: {
            message: j instanceof Error ? j.message : String(j)
          }
        };
        const J = await Se(e, d, "commit", j, r), N = q({
          ok: !1,
          status: "error",
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          itemIds: s,
          affectedIds: h.affectedIds || ((A = h.commandResult) == null ? void 0 : A.affectedIds) || [],
          position: e.position,
          commandResult: h.commandResult,
          writeResult: h.writeResult,
          proposedDocument: h.proposedDocument,
          adapter: J || f,
          placement: h.placement,
          idMap: d.idMap,
          patches: h.patches,
          diagnostics: r,
          data: h.data
        });
        return G(e.emit, N, e.profile), N;
      }
      if (r.push(...(T == null ? void 0 : T.diagnostics) || []), f = Ce("commit", T, d), (T == null ? void 0 : T.ok) === !1) {
        const j = await Se(e, d, "commit", T, r), J = q({
          ok: !1,
          status: T.status || "error",
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          itemIds: s,
          affectedIds: h.affectedIds || ((w = h.commandResult) == null ? void 0 : w.affectedIds) || [],
          position: e.position,
          commandResult: h.commandResult,
          writeResult: h.writeResult,
          proposedDocument: h.proposedDocument,
          adapter: j || f,
          placement: h.placement,
          idMap: d.idMap,
          patches: h.patches,
          diagnostics: r,
          data: h.data
        });
        return G(e.emit, J, e.profile), J;
      }
    }
    const X = (D = h.commandResult) == null ? void 0 : D.status, O = h.status || (X === "changed" ? "success" : X === "noop" ? "noop" : X === "cancelled" ? "cancelled" : X === "timeout" ? "timeout" : X === "error" ? "error" : X === "blocked" ? "blocked" : "success"), ne = q({
      ok: O === "success" || O === "noop",
      status: O,
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source,
      itemIds: s,
      affectedIds: h.affectedIds || ((oe = h.commandResult) == null ? void 0 : oe.affectedIds) || (d == null ? void 0 : d.newIds) || s,
      position: e.position,
      commandResult: h.commandResult,
      writeResult: h.writeResult,
      proposedDocument: h.proposedDocument,
      adapter: f,
      placement: h.placement,
      idMap: d == null ? void 0 : d.idMap,
      patches: h.patches,
      diagnostics: r,
      data: h.data
    });
    return G(e.emit, ne, e.profile), ne;
  } catch (h) {
    r.push(Xe(h, {
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source
    }));
    const R = d ? await Se(e, d, "mutate", h, r) : void 0, X = q({
      ok: !1,
      status: "error",
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source,
      itemIds: s,
      affectedIds: [],
      position: e.position,
      adapter: R || f,
      idMap: d == null ? void 0 : d.idMap,
      diagnostics: r
    });
    return G(e.emit, X, e.profile), X;
  }
}, Ye = (e) => {
  var s;
  return !e.readonly && (e.mode === "edit" || ((s = e.editor) == null ? void 0 : s.mode.value) === "edit");
}, Z = (e, s) => e ? void 0 : s, Q = (e, s, r) => {
  var d, f;
  return {
    label: ((f = (d = r.options) == null ? void 0 : d.labelFactory) == null ? void 0 : f.call(d, e, r.context)) || s,
    labelKey: `dashboardEditorShell.${e}`
  };
}, ie = (e, s) => {
  var r, d;
  return (d = (r = s.options) == null ? void 0 : r.shortcuts) == null ? void 0 : d[e];
}, De = (e, s, r) => {
  if (!Ye(e.context)) return !1;
  const d = e.context.editor;
  if (!d) return !1;
  const f = d.canExecute({
    type: s,
    targetIds: r,
    source: "context-menu"
  });
  return f.status !== "blocked" && f.status !== "error";
}, It = (e, s, r) => {
  var y, I;
  const d = r === "dashboard" ? (y = e.options) == null ? void 0 : y.customDashboardItems : (I = e.options) == null ? void 0 : I.customWidgetItems, f = typeof d == "function" ? d(e.context) : d || [];
  return s.concat(f, e.customItems || []);
}, bt = (e, s) => s ? e : e.filter((r) => !r.hidden), te = (e) => e, Yt = (e) => {
  var z, ae, se, A;
  const s = Ye(e.context), r = De(e, "paste"), d = e.referenceAvailable === !0, f = e.paletteAvailable === !0, y = e.explicitPlacementTarget === !0, I = y ? "here" : "auto", v = y ? "cursor" : ((z = e.options) == null ? void 0 : z.defaultPasteStrategy) || ((ae = e.options) == null ? void 0 : ae.defaultAddStrategy), L = y ? "cursor" : (se = e.options) == null ? void 0 : se.defaultReferencePasteStrategy, M = y ? "cursor" : (A = e.options) == null ? void 0 : A.defaultAddStrategy, E = e.readonlyReason || "mode-readonly", B = e.target, _ = [
    {
      id: "paste",
      type: "item",
      ...Q("paste", y ? "Paste here" : "Paste", e),
      icon: "clipboard-paste",
      shortcut: ie("paste", e),
      enabled: r,
      reason: Z(r, s ? "clipboard-unavailable" : E),
      target: B,
      metadata: { strategy: v, placementIntent: I },
      action: te(() => e.actions.pasteWidget(e.position || null, { source: "context-menu", strategy: v, placementIntent: I }))
    },
    {
      id: "place-clipboard",
      type: "item",
      ...Q("place-clipboard", "Place from clipboard", e),
      icon: "crosshair",
      enabled: r,
      reason: Z(r, s ? "clipboard-unavailable" : E),
      target: B,
      metadata: { strategy: v, placementIntent: I, placementMode: "interactive" },
      action: te(() => e.actions.placeClipboard(e.position || null, {
        source: "context-menu",
        strategy: v,
        placementIntent: I,
        placementMode: "interactive"
      }))
    },
    {
      id: "paste-reference",
      type: "item",
      ...Q("paste-reference", y ? "Paste reference here" : "Paste reference", e),
      icon: "link",
      shortcut: ie("paste-reference", e),
      enabled: s && d,
      reason: Z(s && d, s ? "adapter-unavailable" : E),
      target: B,
      metadata: { strategy: L, placementIntent: I },
      action: te(() => e.actions.pasteWidgetReference(e.position || null, { source: "context-menu", strategy: L, placementIntent: I }))
    },
    {
      id: "add-widget",
      type: "item",
      ...Q("add-widget", y ? "Add widget here" : "Add widget", e),
      icon: "plus",
      enabled: s,
      reason: Z(s, E),
      target: B,
      metadata: { strategy: M, placementIntent: I },
      action: te(() => e.actions.addWidgetFromTemplate({ w: 2, h: 2 }, e.position || null, { source: "context-menu", strategy: M, placementIntent: I }))
    },
    {
      id: "open-palette",
      type: "item",
      ...Q("open-palette", y ? "Open palette here" : "Open palette", e),
      icon: "layout-grid",
      shortcut: ie("open-palette", e),
      enabled: s && f,
      reason: Z(s && f, s ? "adapter-unavailable" : E),
      target: B,
      metadata: { strategy: M, placementIntent: I },
      action: te(() => e.actions.openWidgetPalette(e.position || null, { source: "context-menu", strategy: M, placementIntent: I }))
    },
    {
      id: "move-all-widgets",
      type: "item",
      ...Q("move-all-widgets", "Move all widgets", e),
      icon: "move",
      shortcut: ie("move-all", e),
      enabled: s,
      reason: Z(s, E),
      target: B,
      metadata: { dx: 0, dy: 1 },
      action: te(() => e.actions.moveAllWidgets(0, 1, { source: "context-menu" }))
    },
    {
      id: "dashboard-settings",
      type: "item",
      ...Q("dashboard-settings", "Dashboard settings", e),
      icon: "settings",
      enabled: !0,
      target: B,
      metadata: { hook: !0 }
    }
  ];
  return {
    id: e.id,
    target: B,
    position: e.position,
    items: bt(It(e, _, "dashboard"), e.includeHidden),
    diagnostics: e.diagnostics || []
  };
}, zt = (e) => {
  const s = Ye(e.context), r = e.readonlyReason || "mode-readonly", d = [e.itemId], f = e.hiddenItem === !0, y = e.lockedItem === !0, I = !f && !!e.context.editor, v = !f && De(e, "copy", d), L = !f && De(e, "duplicate", d), M = !f && !y && De(e, "delete", d), E = e.referenceAvailable === !0, B = e.target, _ = [
    {
      id: "select",
      type: "item",
      ...Q("select", "Select", e),
      icon: "mouse-pointer-2",
      enabled: I,
      reason: Z(I, f ? "hidden" : "missing-editor"),
      target: B,
      action: te(() => e.actions.selectItem(e.itemId, { source: "context-menu" }))
    },
    {
      id: "edit-widget",
      type: "item",
      ...Q("edit-widget", "Edit", e),
      icon: "pencil",
      enabled: s && !y && !f,
      reason: Z(s && !y && !f, f ? "hidden" : y ? "locked" : r),
      target: B,
      metadata: { hook: !0 }
    },
    {
      id: "copy-widget",
      type: "item",
      ...Q("copy-widget", "Copy widget", e),
      icon: "copy",
      shortcut: ie("copy-widget", e),
      enabled: v,
      reason: Z(v, f ? "hidden" : r),
      target: B,
      action: te(() => e.actions.copyWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "copy-reference",
      type: "item",
      ...Q("copy-reference", "Copy reference", e),
      icon: "link",
      shortcut: ie("copy-reference", e),
      enabled: !f && E,
      reason: Z(!f && E, f ? "hidden" : "adapter-unavailable"),
      target: B,
      action: te(() => e.actions.copyWidgetReference(e.itemId, { source: "context-menu" }))
    },
    {
      id: "duplicate",
      type: "item",
      ...Q("duplicate", "Duplicate", e),
      icon: "copy-plus",
      shortcut: ie("duplicate-widget", e),
      enabled: L,
      reason: Z(L, f ? "hidden" : r),
      target: B,
      action: te(() => e.actions.duplicateWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "remove",
      type: "item",
      ...Q("remove", "Remove", e),
      icon: "trash-2",
      shortcut: ie("remove-widget", e),
      danger: !0,
      enabled: M,
      reason: Z(M, f ? "hidden" : y ? "locked" : r),
      target: B,
      action: te(() => e.actions.removeWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "replace-reference",
      type: "item",
      ...Q("replace-reference", "Replace reference with copy", e),
      icon: "replace",
      enabled: s && !f && E,
      reason: Z(s && !f && E, f ? "hidden" : s ? "adapter-unavailable" : r),
      target: B,
      action: te(() => e.actions.replaceReferenceWithWidgetCopy(e.itemId, { source: "context-menu" }))
    },
    {
      id: "scroll-highlight",
      type: "item",
      ...Q("scroll-highlight", "Scroll and highlight", e),
      icon: "scan-search",
      enabled: !f,
      reason: Z(!f, "hidden"),
      target: B,
      action: te(async () => {
        const z = e.actions.highlightItem(e.itemId, { source: "context-menu" });
        return await e.actions.scrollToItem(e.itemId, { source: "context-menu" }), z;
      })
    }
  ];
  return {
    id: e.id,
    target: B,
    position: e.position,
    items: bt(It(e, _, "widget"), e.includeHidden),
    diagnostics: e.diagnostics || []
  };
}, he = (e) => e.map((s) => ({ ...s })), ee = (e) => typeof e == "number" && Number.isFinite(e), Nt = (e) => !!(e && typeof e == "object" && "value" in e), Ee = (e) => Array.isArray(e) ? e.filter(Boolean) : e ? [e] : [], je = (e) => e === "context-menu" ? "context-menu" : e === "keyboard" ? "keyboard" : e === "toolbar" ? "toolbar" : e === "pointer" ? "pointer" : "api", ke = (e, s) => e.strategy || s, qt = (e) => e === "first-fit" || e === "insert-top-shift", Gt = (e) => e ? typeof Event != "undefined" && e instanceof Event ? !0 : typeof e == "object" && ("x" in e || "y" in e) : !1, we = (e, s) => s.placementIntent || (Gt(e) ? "here" : "auto"), ve = (e) => ({
  collisionPolicy: e.collisionPolicy,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), Ut = (e) => {
  var f, y;
  if (!e) return !1;
  const s = e;
  if (ee(s.clientX) && ee(s.clientY)) return !0;
  const r = e, d = ((f = r.touches) == null ? void 0 : f[0]) || ((y = r.changedTouches) == null ? void 0 : y[0]);
  return !!(d && ee(d.clientX) && ee(d.clientY));
}, Qt = (e, s, r, d, f) => {
  const y = (e == null ? void 0 : e.newIds) || [];
  if (!y.length) return [];
  const I = new Set(s.map((E) => E.i)), v = /* @__PURE__ */ new Set(), L = [], M = [];
  return y.forEach((E) => {
    if (typeof E != "string" || E.trim().length === 0) {
      L.push(String(E));
      return;
    }
    (v.has(E) || I.has(E)) && M.push(E), v.add(E);
  }), !L.length && !M.length ? [] : [Y(
    "shell-adapter-invalid-new-ids",
    "error",
    "Adapter prepare returned invalid or duplicate new widget ids.",
    {
      actionId: r,
      actionType: d,
      source: f,
      reason: "adapter-rejected",
      itemIds: M.concat(L),
      details: {
        duplicateIds: M,
        invalidIds: L
      },
      recoverable: !0
    }
  )];
}, Jt = () => ({
  ready: !1,
  degraded: !0,
  runtime: null,
  layoutId: null,
  requestedBreakpoint: null,
  resolvedProfileId: null,
  targetView: null,
  viewFormat: null,
  gridSettings: null,
  heightRuntime: null,
  activeItemIds: [],
  renderItemIds: [],
  hiddenItemIds: [],
  mode: null,
  selection: null,
  dirty: !1,
  conflict: null,
  lastResult: null,
  toolbar: null,
  lastPointerPosition: null,
  lastMenuPosition: null,
  menu: null,
  highlightedId: null,
  emptyAdd: {
    enabled: !1,
    reason: "missing-runtime",
    target: {
      layoutId: null,
      requestedBreakpoint: null,
      resolvedProfileId: null,
      targetView: null,
      viewFormat: null
    },
    descriptors: []
  },
  diagnostics: []
}), yt = (e, s, r, d = []) => Ct({ id: e, type: s }, "blocked", {
  targetIds: d,
  blocked: {
    reason: r,
    itemIds: d,
    message: `Command was blocked by dashboard editor shell: ${r}.`
  }
}), pt = (e, s) => {
  var f, y;
  const r = (y = (f = s.diagnostics) == null ? void 0 : f.operationResult) == null ? void 0 : y.layout;
  if (r) return he(r);
  let d = he(e.layout);
  return s.layoutPatches.forEach((I) => {
    if (I.type === "add") {
      d.push({ ...I.item });
      return;
    }
    if (I.type === "remove") {
      d = d.filter((v) => v.i !== I.id);
      return;
    }
    if (I.type === "move") {
      d = d.map((v) => v.i === I.id ? { ...v, x: I.to.x, y: I.to.y } : v);
      return;
    }
    I.type === "resize" && (d = d.map((v) => v.i === I.id ? { ...v, x: I.to.x, y: I.to.y, w: I.to.w, h: I.to.h } : v));
  }), d;
}, Ae = (e) => typeof CSS != "undefined" && typeof CSS.escape == "function" ? CSS.escape(e) : e.replace(/["\\]/g, "\\$&"), Zt = (e) => !!(e && typeof e == "object"), _t = (e, s = {}) => {
  var f;
  if (e.defaultPrevented) return !0;
  const r = e.target;
  if (!Zt(r)) return !1;
  const d = (f = r.tagName) == null ? void 0 : f.toUpperCase();
  return d === "INPUT" || d === "TEXTAREA" || d === "SELECT" || r.isContentEditable ? !0 : (s.ignoredTargets || []).some((y) => typeof y == "string" ? typeof r.matches == "function" && r.matches(y) : y(r));
}, Ot = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", eo = [
  { key: "c", primary: !0, action: "copy-widget", source: "keyboard" },
  { key: "r", primary: !0, action: "copy-reference", source: "keyboard" },
  { key: "v", primary: !0, action: "paste-widget", source: "keyboard" },
  { key: "i", primary: !0, action: "paste-reference", source: "keyboard" },
  { key: "v", primary: !0, shift: !0, action: "paste-reference", source: "keyboard" },
  { key: "Enter", primary: !0, action: "place-clipboard", source: "keyboard" },
  { key: "Enter", ctrl: !0, action: "place-clipboard", source: "keyboard" },
  { key: "x", primary: !0, action: "cut-widget", source: "keyboard" },
  { key: "Delete", action: "remove-widget", source: "keyboard" },
  { key: "Backspace", action: "remove-widget", source: "keyboard" },
  { key: "z", primary: !0, action: "undo", source: "keyboard" },
  { key: "z", primary: !0, shift: !0, action: "redo", source: "keyboard" },
  { key: "y", primary: !0, action: "redo", source: "keyboard" },
  { key: "p", primary: !0, action: "open-palette", source: "keyboard" },
  { key: "F10", shift: !0, action: "prepare-dashboard-menu", source: "keyboard" },
  { key: "m", primary: !0, shift: !0, action: "move-all", source: "keyboard" }
], to = (e, s, r) => {
  const d = r === "mac" ? e.metaKey : e.ctrlKey, f = r === "mac" ? e.ctrlKey : e.metaKey, y = s.primary === !0, I = typeof s.ctrl == "boolean" || typeof s.meta == "boolean";
  if (e.key.toLowerCase() !== s.key.toLowerCase()) return !1;
  if (I) {
    if ((s.ctrl || !1) !== e.ctrlKey || (s.meta || !1) !== e.metaKey) return !1;
  } else if (y !== d || y && f || !y && (e.ctrlKey || e.metaKey)) return !1;
  return !((s.shift || !1) !== e.shiftKey || (s.alt || !1) !== e.altKey);
}, oo = (e, s, r, d) => {
  const f = s.placementOptions || e.placementOptions, y = typeof f == "function" ? f() : f;
  return {
    ...r,
    ...y || {},
    source: d
  };
};
function ro(e = {}) {
  var tt, ot, at, st;
  const s = lt(ue(e.document) || null), r = lt(Jt()), d = [], f = [];
  let y = !1, I = null, v = Promise.resolve(), L = null;
  const M = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), B = e.controlled !== !1, _ = (t) => {
    const o = v.catch(() => {
    }).then(t);
    return v = o.then(() => {
    }, () => {
    }), o;
  }, z = () => {
    L = null;
  }, ae = (t, o) => {
    L = {
      mode: "interactive",
      reason: "cut-widget",
      sourceActionId: t,
      itemIds: o.slice()
    };
  }, se = () => {
    const t = L;
    return L = null, t;
  }, A = (t) => {
    var o;
    (o = e.onEvent) == null || o.call(e, t);
  }, w = () => {
    var t;
    return ((t = e.model) == null ? void 0 : t.state.value) || ue(e.runtime) || null;
  }, D = () => {
    var t;
    return e.editor || ((t = e.model) == null ? void 0 : t.editorController) || null;
  }, oe = () => ue(e.gridElement) || null, h = () => ue(e.document) || s.value || null, R = () => Kt(w()), X = (t, o) => {
    const a = w(), n = [];
    return a || n.push(Y(
      "shell-missing-runtime",
      "warning",
      "Dashboard responsive runtime is not available.",
      { actionId: t, actionType: o, reason: "missing-runtime", recoverable: !0 }
    )), D() || n.push(Y(
      "shell-missing-editor",
      "warning",
      "Grid editor controller is not available.",
      { actionId: t, actionType: o, reason: "missing-editor", recoverable: !0 }
    )), ((a == null ? void 0 : a.diagnostics) || []).forEach((c) => {
      n.push(Y(
        c.code,
        c.level,
        c.message,
        {
          actionId: t,
          actionType: o,
          itemId: c.itemId,
          layoutId: c.layoutId,
          path: c.path,
          resolvedProfileId: c.profileId || (a == null ? void 0 : a.resolvedProfileId) || null,
          targetView: c.targetView || (a == null ? void 0 : a.targetView) || null,
          details: c.details
        }
      ));
    }), n;
  }, O = (t, o) => {
    var l, m;
    const a = (ue(e.mode) || (t == null ? void 0 : t.mode) || (o == null ? void 0 : o.mode.value)) === "edit", n = ((t == null ? void 0 : t.renderItemIds) || (t == null ? void 0 : t.activeItemIds) || []).length === 0, c = !!(t && a && n), i = {
      layoutId: (t == null ? void 0 : t.layoutId) || null,
      requestedBreakpoint: (t == null ? void 0 : t.requestedBreakpoint) || null,
      resolvedProfileId: (t == null ? void 0 : t.resolvedProfileId) || null,
      targetView: (t == null ? void 0 : t.targetView) || null,
      viewFormat: (t == null ? void 0 : t.viewFormat) || null
    }, u = c && F ? [
      {
        id: "open-palette",
        labelKey: "dashboardEditorShell.open-palette",
        icon: "layout-grid",
        enabled: !0,
        target: { type: "dashboard" },
        metadata: { strategy: (l = e.menu) == null ? void 0 : l.defaultAddStrategy },
        action: () => {
          var g;
          return F.openWidgetPalette(null, { source: "api", strategy: (g = e.menu) == null ? void 0 : g.defaultAddStrategy });
        }
      },
      {
        id: "add-widget",
        labelKey: "dashboardEditorShell.add-widget",
        icon: "plus",
        enabled: !0,
        target: { type: "dashboard" },
        metadata: { strategy: (m = e.menu) == null ? void 0 : m.defaultAddStrategy },
        action: () => {
          var g;
          return F.addWidgetFromTemplate({ w: 2, h: 2 }, null, { source: "api", strategy: (g = e.menu) == null ? void 0 : g.defaultAddStrategy });
        }
      }
    ] : [];
    return {
      enabled: c,
      reason: c ? void 0 : t ? a ? "not-empty" : "mode-readonly" : "missing-runtime",
      target: i,
      descriptors: u
    };
  }, ne = () => {
    const t = w(), o = D(), a = X(), n = !t || !o || !oe();
    r.value = {
      ...r.value,
      ready: !!(t && o),
      degraded: n,
      runtime: t,
      layoutId: (t == null ? void 0 : t.layoutId) || null,
      requestedBreakpoint: (t == null ? void 0 : t.requestedBreakpoint) || null,
      resolvedProfileId: (t == null ? void 0 : t.resolvedProfileId) || null,
      targetView: (t == null ? void 0 : t.targetView) || null,
      viewFormat: (t == null ? void 0 : t.viewFormat) || null,
      gridSettings: (t == null ? void 0 : t.gridSettings) || null,
      heightRuntime: (t == null ? void 0 : t.heightRuntime) || null,
      activeItemIds: (t == null ? void 0 : t.activeItemIds.slice()) || [],
      renderItemIds: (t == null ? void 0 : t.renderItemIds.slice()) || [],
      hiddenItemIds: (t == null ? void 0 : t.hiddenItemIds.slice()) || [],
      mode: ue(e.mode) || (t == null ? void 0 : t.mode) || (o == null ? void 0 : o.mode.value) || null,
      selection: (o == null ? void 0 : o.selection.value) || null,
      dirty: (o == null ? void 0 : o.dirty.value) || !1,
      conflict: (o == null ? void 0 : o.conflict.value) || null,
      lastResult: (o == null ? void 0 : o.lastResult.value) || null,
      toolbar: (o == null ? void 0 : o.getToolbarState()) || null,
      emptyAdd: O(t, o),
      diagnostics: Ie(a)
    };
  }, T = (t, o, a) => {
    var c;
    const n = {
      type: "documentChange",
      actionId: t,
      document: o,
      runtime: a,
      controlled: B,
      persist: !1
    };
    (c = e.onDocumentChange) == null || c.call(e, n), A({ type: "documentChange", event: n });
  }, j = (t) => {
    B || (s.value = t, Nt(e.document) && (e.document.value = t));
  }, J = (t, o, a, n = {}) => {
    const c = w(), i = h(), u = D(), l = [];
    if (!c || !i)
      return l.push(Y(
        "shell-write-back-skipped",
        "info",
        "Dashboard document or runtime is unavailable; action result is returned without proposed document.",
        { actionId: t, reason: c ? "profile-write-back" : "missing-runtime", recoverable: !0 }
      )), { diagnostics: l };
    const m = At(
      i,
      c,
      o,
      {
        createMissingProfileOnEdit: e.createMissingProfileOnEdit,
        createMissingItems: !0,
        removeMissingItems: n.removeMissingItems,
        editorMetaById: u == null ? void 0 : u.editorMetaById.value,
        writeItemIds: a
      }
    );
    return l.push(...m.diagnostics.map(
      (g) => Y(
        g.code,
        g.level,
        g.message,
        {
          actionId: t,
          itemId: g.itemId,
          layoutId: g.layoutId || c.layoutId,
          path: g.path,
          resolvedProfileId: g.profileId || c.resolvedProfileId,
          targetView: g.targetView || c.targetView,
          details: g.details
        }
      )
    )), m.ok ? { writeResult: m, proposedDocument: m.document, diagnostics: l } : (l.push(Y(
      "shell-profile-write-back-blocked",
      "error",
      m.error.message,
      { actionId: t, reason: "profile-write-back", recoverable: !0, path: m.error.path }
    )), { writeResult: m, proposedDocument: m.document, diagnostics: l });
  }, N = (t, o, a, n, c, i = {}) => ({
    actionId: t,
    actionType: o,
    source: a,
    itemIds: n,
    runtime: w(),
    document: h(),
    position: c,
    diagnostics: X(t, o),
    ...i
  }), xe = async (t) => {
    for (const o of e.guards || []) {
      const a = await o(t);
      if (a === !1)
        return {
          ok: !1,
          status: "blocked",
          reason: "guard-blocked",
          diagnostics: [Y(
            "shell-guard-blocked",
            "warning",
            "Shell action was blocked by a caller guard.",
            { actionId: t.actionId, actionType: t.actionType, source: t.source, reason: "guard-blocked", recoverable: !0 }
          )]
        };
      if (a && typeof a == "object" && "available" in a && !a.available)
        return {
          ok: !1,
          status: "blocked",
          reason: a.reason || "guard-blocked",
          diagnostics: a.diagnostics
        };
      if (a && typeof a == "object" && "ok" in a && !a.ok) return a;
    }
    return null;
  }, C = (t, o, a, n = [], c = [], i = H(t)) => {
    const u = q({
      ok: !1,
      status: a === "adapter-unavailable" ? "unsupported" : "blocked",
      actionId: i,
      actionType: t,
      source: o,
      itemIds: n,
      affectedIds: [],
      diagnostics: c.concat(Y(
        `shell-${a}`,
        a === "missing-runtime" || a === "missing-editor" ? "warning" : "error",
        `Dashboard editor shell action was blocked: ${a}.`,
        { actionId: i, actionType: t, source: o, reason: a, itemIds: n, ...R() }
      ))
    });
    return G(A, u, R()), u;
  }, be = (t, o, a, n) => ((t == null ? void 0 : t.diagnostics) || []).map((c) => {
    const i = c.code.startsWith("grid-editor.placement.") ? `shell-placement-${c.code.slice(22).replace(/\./g, "-")}` : c.code;
    return Y(
      i,
      c.level,
      c.message,
      {
        actionId: o,
        actionType: a,
        source: n,
        reason: c.reason,
        itemIds: c.itemIds,
        details: c.details,
        recoverable: c.level !== "error",
        ...R()
      }
    );
  }), Te = (t, o, a, n) => {
    var i, u;
    const c = (u = (i = t == null ? void 0 : t.diagnostics) == null ? void 0 : i.computed) == null ? void 0 : u.placement;
    if (c)
      return {
        ...c,
        strategy: c.strategy,
        diagnostics: Ie(be(c, o, a, n))
      };
  }, kt = (t, o, a, n) => {
    if (!t) return;
    const c = {
      strategy: t.strategy,
      placementSource: t.strategy,
      collisionPolicy: t.collisionPolicy,
      insertedIds: t.ghostItems.map((i) => i.id),
      shiftedIds: t.affectedOutlines.filter((i) => i.kind === "shift").map((i) => i.id),
      before: t.affectedOutlines.map((i) => ({ id: i.id, ...i.before })),
      after: t.affectedOutlines.map((i) => ({ id: i.id, ...i.after })),
      diagnostics: t.diagnostics
    };
    return {
      ...c,
      strategy: c.strategy,
      diagnostics: Ie(be(c, o, a, n))
    };
  }, ze = (t, o, a, n, c = H(t)) => {
    const i = kt(a, c, t, o), u = q({
      ok: !0,
      status: "success",
      actionId: c,
      actionType: t,
      source: o,
      itemIds: a.items.map((l) => l.i),
      affectedIds: [],
      position: n,
      placement: i,
      diagnostics: (i == null ? void 0 : i.diagnostics) || [],
      data: me({
        placementSessionId: a.id,
        phase: a.phase,
        source: a.source
      }, i)
    });
    return G(A, u, R()), u;
  }, me = (t, o) => o ? t && typeof t == "object" && !Array.isArray(t) ? {
    ...t,
    placement: o
  } : { value: t, placement: o } : t, wt = (t) => t ? t.kind === "layout" ? he(t.layout) : he(t.layouts[t.breakpoint] || []) : null, Ne = async (t, o = {}) => _(async () => {
    var k, S, P, K, W, x, $;
    const a = H(t), n = o.source || "api", c = D();
    if (!c) return C(t, n, "missing-editor", [], [], a);
    const i = await c.execute({
      id: a,
      type: t,
      source: je(n)
    }), u = wt(t === "undo" ? (k = i.undo) == null ? void 0 : k.before : (S = i.undo) == null ? void 0 : S.after), l = i.status === "changed" && u ? J(a, u, i.affectedIds, { removeMissingItems: !0 }) : { diagnostics: [] }, m = i.status === "changed" ? "success" : i.status === "cancelled" ? "cancelled" : i.status === "timeout" ? "timeout" : i.status === "error" ? "error" : i.status === "blocked" ? "blocked" : "noop", g = m === "success" || m === "noop", b = l.diagnostics.concat(i.blocked ? [Y(
      `shell-command-${i.blocked.reason}`,
      "warning",
      i.blocked.message || `Editor command was blocked: ${i.blocked.reason}.`,
      { actionId: a, actionType: t, source: n, reason: i.blocked.reason, itemIds: i.blocked.itemIds, recoverable: !0 }
    )] : []);
    ((P = l.writeResult) == null ? void 0 : P.ok) === !1 && u && w() && c.setExternalLayout(w().layout, "shell-history-write-back-rollback");
    const p = q({
      ok: g && ((K = l.writeResult) == null ? void 0 : K.ok) !== !1,
      status: ((W = l.writeResult) == null ? void 0 : W.ok) === !1 ? "blocked" : m,
      actionId: a,
      actionType: t,
      source: n,
      itemIds: i.targetIds,
      affectedIds: i.affectedIds,
      commandResult: i,
      writeResult: l.writeResult,
      proposedDocument: l.proposedDocument,
      patches: i.layoutPatches,
      diagnostics: b,
      data: { historyEntry: (x = i.undo) == null ? void 0 : x.id }
    });
    return p.ok && p.proposedDocument && (($ = p.writeResult) == null ? void 0 : $.ok) !== !1 && (j(p.proposedDocument), T(a, p.proposedDocument, w())), G(A, p, R()), p;
  }), ce = async (t, o, a = {}) => _(async () => {
    var b, p;
    const n = o.id || H(t), c = a.source || "api", i = a.itemIds || o.targetIds || [], u = N(n, t, c, i, a.position, a.contextExtra);
    let l = null, m = !1;
    const g = await He({
      actionId: n,
      actionType: t,
      source: c,
      itemIds: i,
      position: a.position,
      context: u,
      profile: R(),
      emit: A,
      prepare: async (k) => {
        var P;
        const S = await xe(k);
        return S || ((P = a.prepare) == null ? void 0 : P.call(a, k)) || null;
      },
      mutate: async (k) => {
        var nt, ct, rt, it, dt;
        const S = D(), P = w();
        if (!S)
          return {
            status: "blocked",
            commandResult: yt(n, o.type, "missing-editor", i),
            diagnostics: [Y(
              "shell-missing-editor",
              "error",
              "Grid editor controller is required for this action.",
              { actionId: n, actionType: t, source: c, reason: "missing-editor", recoverable: !0 }
            )]
          };
        l = P ? he(P.layout) : null;
        const K = Qt(
          k,
          (P == null ? void 0 : P.layout) || [],
          n,
          t,
          c
        );
        if (K.length > 0)
          return {
            status: "blocked",
            commandResult: yt(n, o.type, "invalid-input", i),
            affectedIds: [],
            diagnostics: K
          };
        const W = (nt = k == null ? void 0 : k.newIds) != null && nt[0] && o.type === "add" ? {
          ...o,
          payload: {
            ...o.payload || {},
            item: {
              ...((ct = o.payload) == null ? void 0 : ct.item) || {},
              i: k.newIds[0]
            }
          }
        } : o, x = await S.execute({
          ...W,
          id: n,
          source: je(c)
        });
        m = x.status === "changed";
        const $ = Te(x, n, t, c), V = be((it = (rt = x.diagnostics) == null ? void 0 : rt.computed) == null ? void 0 : it.placement, n, t, c);
        if (x.status === "blocked" || x.status === "cancelled" || x.status === "timeout" || x.status === "error")
          return {
            status: x.status === "cancelled" ? "cancelled" : x.status === "timeout" ? "timeout" : x.status === "error" ? "error" : "blocked",
            commandResult: x,
            affectedIds: x.affectedIds,
            diagnostics: x.blocked ? [Y(
              `shell-command-${x.blocked.reason}`,
              "warning",
              x.blocked.message || `Editor command was blocked: ${x.blocked.reason}.`,
              { actionId: n, actionType: t, source: c, reason: x.blocked.reason, itemIds: x.blocked.itemIds, recoverable: !0 }
            )].concat(V) : V,
            placement: $,
            data: me(a.data, $)
          };
        const Pe = x.layoutPatches.length > 0 || x.metadataPatches.length > 0, le = P ? pt(P, x) : [], Me = P && Pe && (x.status === "changed" || x.status === "noop") ? J(n, le, x.affectedIds, { removeMissingItems: o.type === "delete" }) : { diagnostics: [] };
        return ((dt = Me.writeResult) == null ? void 0 : dt.ok) === !1 && l && S.setExternalLayout(l, "shell-write-back-rollback"), {
          status: x.status === "changed" ? "success" : "noop",
          commandResult: x,
          writeResult: Me.writeResult,
          proposedDocument: Me.proposedDocument,
          affectedIds: x.affectedIds,
          patches: x.layoutPatches,
          placement: $,
          data: me(a.data, $),
          diagnostics: Me.diagnostics.concat(V)
        };
      },
      commit: a.commit,
      rollback: a.rollback
    });
    return !g.ok && m && l && ((b = D()) == null || b.setExternalLayout(l, "shell-transaction-rollback")), g.ok && g.proposedDocument && ((p = g.writeResult) == null ? void 0 : p.ok) !== !1 && (j(g.proposedDocument), T(n, g.proposedDocument, w())), g;
  }), Re = (t, o = {}) => {
    var a, n, c;
    return t && typeof Event != "undefined" && t instanceof Event ? de(t, o) : t && typeof t == "object" && ("x" in t || "y" in t) ? Ke({
      ...o,
      runtime: w(),
      layout: (a = w()) == null ? void 0 : a.layout,
      selection: null,
      gridElement: null,
      lastMenuPosition: null,
      lastPointerPosition: null,
      fallback: t
    }) : Ke({
      ...o,
      runtime: w(),
      layout: (n = w()) == null ? void 0 : n.layout,
      selection: ((c = D()) == null ? void 0 : c.selection.value) || null,
      gridElement: oe(),
      lastMenuPosition: r.value.lastMenuPosition,
      lastPointerPosition: r.value.lastPointerPosition,
      fallback: o.fallback || r.value.lastMenuPosition || r.value.lastPointerPosition || void 0
    });
  }, fe = (t, o, a) => {
    const n = ke(o, a);
    if (!qt(n)) return Re(t, o);
    const c = o;
    return t ? Re(t, {
      ...o,
      fallback: c.fallback || { x: 0, y: 0, source: "strategy" }
    }) : Re({ x: 0, y: 0, source: "strategy" }, o);
  }, qe = () => {
    var t, o;
    return ((t = e.menu) == null ? void 0 : t.defaultPasteStrategy) || ((o = e.menu) == null ? void 0 : o.defaultAddStrategy) || "cursor";
  }, de = (t, o = {}) => {
    var a, n, c;
    return jt({
      ...o,
      event: t,
      runtime: w(),
      layout: (a = w()) == null ? void 0 : a.layout,
      selection: ((n = D()) == null ? void 0 : n.selection.value) || null,
      gridElement: oe(),
      lastMenuPosition: r.value.lastMenuPosition,
      lastPointerPosition: r.value.lastPointerPosition,
      fallback: o.fallback || ((c = e.position) == null ? void 0 : c.fallback)
    });
  }, Ge = async (t, o = {}, a = "paste") => {
    var u, l;
    const n = w(), c = o.placementIntent || "here", i = {
      strategy: o.strategy || "cursor",
      ...ve(o),
      cursor: { x: t.x, y: t.y },
      cols: ((u = n == null ? void 0 : n.gridSettings) == null ? void 0 : u.columns) || t.cols || 12,
      maxRows: ((l = n == null ? void 0 : n.gridSettings) == null ? void 0 : l.maxRows) || 1 / 0,
      list: t.list,
      source: t.source,
      placementIntent: c,
      placementAnchor: c === "here" ? "top-left" : void 0
    };
    return ce(a, {
      type: "paste",
      payload: i
    }, {
      source: o.source || "api",
      position: t,
      contextExtra: { placementIntent: c }
    });
  }, ge = (t) => {
    var o;
    return (o = e.widgetAdapter) != null && o[t] ? (a) => {
      var n, c;
      return (c = (n = e.widgetAdapter) == null ? void 0 : n[t]) == null ? void 0 : c.call(n, a);
    } : void 0;
  }, ye = (tt = e.widgetAdapter) != null && tt.commit ? (t, o) => {
    var a, n;
    return (n = (a = e.widgetAdapter) == null ? void 0 : a.commit) == null ? void 0 : n.call(a, t, o);
  } : void 0, pe = (ot = e.widgetAdapter) != null && ot.rollback ? (t, o) => {
    var a, n;
    return (n = (a = e.widgetAdapter) == null ? void 0 : a.rollback) == null ? void 0 : n.call(a, t, o);
  } : void 0, Ue = (t) => {
    var o;
    return (o = e.referenceAdapter) != null && o[t] ? (a) => {
      var n, c;
      return (c = (n = e.referenceAdapter) == null ? void 0 : n[t]) == null ? void 0 : c.call(n, a);
    } : void 0;
  }, Qe = (at = e.referenceAdapter) != null && at.commit ? (t, o) => {
    var a, n;
    return (n = (a = e.referenceAdapter) == null ? void 0 : a.commit) == null ? void 0 : n.call(a, t, o);
  } : void 0, Je = (st = e.referenceAdapter) != null && st.rollback ? (t, o) => {
    var a, n;
    return (n = (a = e.referenceAdapter) == null ? void 0 : a.rollback) == null ? void 0 : n.call(a, t, o);
  } : void 0, Ze = (t) => t === !0 ? null : t === !1 ? { ok: !1, status: "cancelled", reason: "confirm-cancelled" } : "available" in t ? t.available ? null : { ok: !1, status: "cancelled", reason: t.reason || "confirm-cancelled", diagnostics: t.diagnostics } : t.ok ? null : t, _e = (t, o) => {
    M.set(t.id, {
      ...o,
      itemIds: t.items.map((a) => a.i),
      baseLayout: he(t.baseLayout)
    });
  }, Oe = (t) => {
    var c, i;
    const o = (i = (c = t.diagnostics) == null ? void 0 : c.computed) == null ? void 0 : i.placement, a = o == null ? void 0 : o.sessionId;
    if (!a) return null;
    const n = M.get(a);
    return n && o ? { pending: n, placement: o } : null;
  }, vt = (t, o, a) => {
    var b, p;
    const n = (o == null ? void 0 : o.actionType) || "place-clipboard", c = (o == null ? void 0 : o.actionId) || H(n), i = Te(t, c, n, a), u = be(
      (p = (b = t.diagnostics) == null ? void 0 : b.computed) == null ? void 0 : p.placement,
      c,
      n,
      a
    ), l = t.status === "changed" ? "success" : t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : t.status === "blocked" ? "blocked" : "noop", m = t.blocked ? [Y(
      `shell-command-${t.blocked.reason}`,
      "warning",
      t.blocked.message || `Editor command was blocked: ${t.blocked.reason}.`,
      { actionId: c, actionType: n, source: a, reason: t.blocked.reason, itemIds: t.blocked.itemIds, recoverable: !0 }
    )].concat(u) : u, g = q({
      ok: l === "success" || l === "noop",
      status: l,
      actionId: c,
      actionType: n,
      source: a,
      itemIds: t.targetIds,
      affectedIds: t.affectedIds,
      position: o == null ? void 0 : o.position,
      commandResult: t,
      patches: t.layoutPatches,
      placement: i,
      data: me(o == null ? void 0 : o.data, i),
      diagnostics: m
    });
    return G(A, g, R()), g;
  }, et = async (t) => {
    var u;
    const o = Oe(t), a = o == null ? void 0 : o.placement.sessionId;
    if (!o || !a) return null;
    const n = E.get(t.id);
    if (n) return n;
    if (t.status === "blocked" && ((u = t.blocked) == null ? void 0 : u.reason) !== "stale-command") return null;
    const { pending: c } = o;
    M.delete(a);
    const i = _(async () => {
      var S, P, K;
      const l = D(), m = w(), g = Te(t, c.actionId, c.actionType, c.source), b = be(
        (P = (S = t.diagnostics) == null ? void 0 : S.computed) == null ? void 0 : P.placement,
        c.actionId,
        c.actionType,
        c.source
      ), p = N(
        c.actionId,
        c.actionType,
        c.source,
        c.itemIds,
        c.position,
        c.contextExtra
      ), k = await He({
        actionId: c.actionId,
        actionType: c.actionType,
        source: c.source,
        itemIds: c.itemIds,
        position: c.position,
        context: p,
        profile: R(),
        emit: A,
        prepare: c.prepare,
        mutate: () => {
          var V;
          if (t.status === "blocked" || t.status === "cancelled" || t.status === "timeout" || t.status === "error")
            return {
              status: t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : "blocked",
              commandResult: t,
              affectedIds: t.affectedIds,
              diagnostics: b,
              placement: g,
              data: me(c.data, g)
            };
          const W = t.layoutPatches.length > 0 || t.metadataPatches.length > 0, x = m ? pt(m, t) : [], $ = m && W && (t.status === "changed" || t.status === "noop") ? J(c.actionId, x, t.affectedIds, { removeMissingItems: t.type === "delete" }) : { diagnostics: [] };
          return ((V = $.writeResult) == null ? void 0 : V.ok) === !1 && l && l.setExternalLayout(c.baseLayout, "shell-placement-write-back-rollback"), {
            status: t.status === "changed" ? "success" : "noop",
            commandResult: t,
            writeResult: $.writeResult,
            proposedDocument: $.proposedDocument,
            affectedIds: t.affectedIds,
            patches: t.layoutPatches,
            placement: g,
            data: me(c.data, g),
            diagnostics: $.diagnostics.concat(b)
          };
        },
        commit: c.commit,
        rollback: c.rollback
      });
      return !k.ok && t.status === "changed" && l && l.setExternalLayout(c.baseLayout, "shell-placement-transaction-rollback"), k.ok && k.proposedDocument && ((K = k.writeResult) == null ? void 0 : K.ok) !== !1 && (j(k.proposedDocument), T(c.actionId, k.proposedDocument, w())), k;
    });
    return E.set(t.id, i), i.finally(() => {
      E.get(t.id) === i && E.delete(t.id);
    }), i;
  }, F = {
    getEventGridPosition: (t, o = {}) => de(t, o),
    pasteAtEvent: async (t, o = {}) => {
      const a = de(t, o);
      return a.ok ? (r.value = { ...r.value, lastPointerPosition: a.position }, Ge(a.position, o, "paste")) : C("paste", o.source || "api", a.reason, [], a.diagnostics);
    },
    pasteAtGridPosition: async (t, o = {}) => {
      const a = Re(t, o);
      return a.ok ? Ge(a.position, o, "paste") : C("paste", o.source || "api", a.reason, [], a.diagnostics);
    },
    selectItem: async (t, o = {}) => ce("select", {
      type: "select",
      targetIds: [t],
      payload: { ids: [t] }
    }, {
      source: o.source || "api",
      itemIds: [t]
    }),
    highlightItem: (t, o = {}) => {
      const a = H("highlight"), n = w(), c = r.value.highlightedId;
      if (!(n != null && n.allItemIds.includes(t)))
        return C("highlight", o.source || "api", "missing-item", [t], [], a);
      I && clearTimeout(I), r.value = { ...r.value, highlightedId: t }, A({
        type: "highlight-change",
        actionId: a,
        itemId: t,
        previous: c,
        profile: R()
      }), o.durationMs && o.durationMs > 0 && (I = setTimeout(() => {
        F.resetHighlight();
      }, o.durationMs));
      const i = q({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "highlight",
        source: o.source || "api",
        itemIds: [t],
        affectedIds: [t],
        diagnostics: []
      });
      return G(A, i, R()), o.scroll && F.scrollToItem(t, o), i;
    },
    resetHighlight: () => {
      const t = H("reset-highlight"), o = r.value.highlightedId;
      I && (clearTimeout(I), I = null), r.value = { ...r.value, highlightedId: null }, A({
        type: "highlight-change",
        actionId: t,
        itemId: null,
        previous: o,
        profile: R()
      });
      const a = q({
        ok: !0,
        status: o ? "success" : "noop",
        actionId: t,
        actionType: "reset-highlight",
        source: "api",
        itemIds: o ? [o] : [],
        affectedIds: o ? [o] : [],
        diagnostics: []
      });
      return G(A, a, R()), a;
    },
    scrollToItem: async (t, o = {}) => {
      var b;
      const a = H("scroll-to-item"), n = w(), c = o.source || "api";
      if (!(n != null && n.allItemIds.includes(t)))
        return C("scroll-to-item", c, "missing-item", [t], [], a);
      if (n.hiddenItemIds.includes(t) || !n.renderItemIds.includes(t)) {
        const p = C("scroll-to-item", c, "hidden", [t], [], a);
        return A({
          type: "action-result",
          actionId: a,
          actionType: "scroll-to-item",
          source: c,
          status: "blocked",
          ok: !1,
          itemIds: [t],
          affectedIds: [],
          profile: R(),
          diagnostics: p.diagnostics
        }), p;
      }
      const i = oe();
      if (!i || typeof i.querySelector != "function")
        return C("scroll-to-item", c, "missing-grid-element", [t], [], a);
      const u = typeof o.selector == "function" ? o.selector(t) : o.selector || `[data-grid-id="${Ae(t)}"],[data-grid-item-id="${Ae(t)}"],[data-i="${Ae(t)}"],[data-id="${Ae(t)}"]`, l = i.querySelector(u);
      if (!l)
        return C("scroll-to-item", c, "dom-unavailable", [t], [], a);
      const m = await ((b = e.scrollAdapter) == null ? void 0 : b.call(e, {
        itemId: t,
        itemElement: l,
        gridElement: i,
        options: o,
        runtime: n
      }));
      if (m && !m.available)
        return C("scroll-to-item", c, m.reason || "dom-unavailable", [t], m.diagnostics || [], a);
      typeof l.scrollIntoView == "function" && l.scrollIntoView({
        behavior: o.behavior || "smooth",
        block: o.block || "nearest",
        inline: o.inline || "nearest"
      });
      const g = q({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "scroll-to-item",
        source: c,
        itemIds: [t],
        affectedIds: [t],
        diagnostics: []
      });
      return G(A, g, R()), g;
    },
    prepareDashboardContextMenu: (t, o = {}) => {
      var g, b;
      const a = de(t || null, { source: o.source || "context-menu" }), n = a.ok ? a.position : void 0, c = Ut(t || null) && (n == null ? void 0 : n.source) === "event";
      n && (r.value = { ...r.value, lastMenuPosition: n });
      const i = H("prepare-dashboard-menu"), u = w(), l = D(), m = Yt({
        id: i,
        target: { type: "dashboard", position: n },
        position: n,
        context: {
          target: { type: "dashboard", position: n },
          runtime: u,
          mode: r.value.mode,
          readonly: r.value.mode !== "edit",
          editor: l
        },
        actions: F,
        options: e.menu,
        customItems: o.customItems,
        includeHidden: o.includeHidden,
        explicitPlacementTarget: c,
        referenceAvailable: !!((g = e.referenceAdapter) != null && g.preparePasteReference),
        paletteAvailable: !!((b = e.palette) != null && b.open),
        diagnostics: (a.ok, a.diagnostics)
      });
      return r.value = { ...r.value, menu: m }, A({ type: "menu-change", actionId: i, menu: m, profile: R() }), m;
    },
    prepareWidgetContextMenu: (t, o, a = {}) => {
      var p;
      const n = de(t || null, { source: a.source || "context-menu", activeItemId: o }), c = n.ok ? n.position : void 0;
      c && (r.value = { ...r.value, lastMenuPosition: c });
      const i = H("prepare-widget-menu"), u = w(), l = D(), m = l == null ? void 0 : l.editorMetaById.value[o], g = { type: "widget", itemId: o, position: c }, b = zt({
        id: i,
        target: g,
        itemId: o,
        hiddenItem: (u == null ? void 0 : u.hiddenItemIds.includes(o)) || (m == null ? void 0 : m.visible) === !1,
        lockedItem: (m == null ? void 0 : m.locked) === !0 || ((p = u == null ? void 0 : u.layout.find((k) => k.i === o)) == null ? void 0 : p.static) === !0,
        position: c,
        context: {
          target: g,
          runtime: u,
          mode: r.value.mode,
          readonly: r.value.mode !== "edit",
          editor: l
        },
        actions: F,
        options: e.menu,
        customItems: a.customItems,
        includeHidden: a.includeHidden,
        referenceAvailable: !!e.referenceAdapter,
        diagnostics: (n.ok, n.diagnostics)
      });
      return r.value = { ...r.value, menu: b }, A({ type: "menu-change", actionId: i, menu: b, profile: R() }), b;
    },
    closeMenu: (t = "close") => {
      const o = H("close-menu");
      r.value = { ...r.value, menu: null, lastMenuPosition: null }, A({ type: "menu-change", actionId: o, menu: null, reason: t, profile: R() });
    },
    copyWidget: async (t, o = {}) => {
      var b, p, k;
      const a = Ee(t), n = a.length ? a : ((b = D()) == null ? void 0 : b.selection.value.selectedIds) || [], c = H("copy-widget"), i = o.source || "api";
      z();
      const u = e.widgetAdapter, l = w(), m = N(c, "copy-widget", i, n), g = u != null && u.copyWidget ? await u.copyWidget(m) : u ? void 0 : {
        ok: !0,
        diagnostics: [Y(
          "shell-widget-payload-unhandled",
          "info",
          "Widget adapter was not provided; copied layout/editor metadata only.",
          { actionId: c, actionType: "copy-widget", source: i, reason: "adapter-unavailable", recoverable: !0 }
        )]
      };
      return ce("copy-widget", {
        type: "copy",
        targetIds: n,
        payload: {
          cols: (p = l == null ? void 0 : l.gridSettings) == null ? void 0 : p.columns,
          maxRows: (k = l == null ? void 0 : l.gridSettings) == null ? void 0 : k.maxRows,
          breakpoint: l == null ? void 0 : l.requestedBreakpoint,
          layoutId: l == null ? void 0 : l.layoutId,
          viewFormat: l == null ? void 0 : l.viewFormat
        }
      }, {
        source: i,
        itemIds: n,
        data: g,
        contextExtra: { payload: g },
        prepare: async (S) => {
          const P = await xe(S);
          return P || ((g == null ? void 0 : g.ok) === !1 ? g : null);
        }
      });
    },
    cutWidget: async (t, o = {}) => {
      var g;
      const a = Ee(t), n = a.length ? a : ((g = D()) == null ? void 0 : g.selection.value.selectedIds) || [], c = H("cut-widget"), i = o.source || "api";
      if (z(), n.length === 0)
        return C("cut-widget", i, "selection-count", [], [], c);
      const u = await F.copyWidget(n, { source: i });
      if (!u.ok) return u;
      const l = ge("prepareRemoveWidget"), m = await ce("cut-widget", {
        id: c,
        type: "delete",
        targetIds: n
      }, {
        source: i,
        itemIds: n,
        data: { clipboardActionId: u.actionId },
        prepare: async (b) => {
          if (!o.skipConfirm && e.confirm) {
            const p = await e.confirm(b), k = Ze(p);
            if (k) return k;
          }
          return (l == null ? void 0 : l(b)) || null;
        },
        commit: ye,
        rollback: pe
      });
      return m.ok && ae(c, n), m;
    },
    placeClipboard: async (t, o = {}) => {
      var b, p, k, S, P, K, W;
      const a = D(), n = o.source || "api", c = H("place-clipboard");
      if (z(), !a) return C("place-clipboard", n, "missing-editor");
      const i = we(t, o), u = i === "auto" ? qe() : "cursor", l = ke(o, u), m = fe(t || null, o, u);
      if (!m.ok) return C("place-clipboard", n, m.reason, [], m.diagnostics);
      const g = await a.beginPlacement({
        source: "paste",
        commandType: "paste",
        strategy: l,
        ...ve(o),
        placementIntent: i,
        placementAnchor: i === "here" ? "top-left" : void 0,
        cursor: m.position.source !== "none" ? {
          x: m.position.x,
          y: m.position.y,
          source: m.position.source === "event" ? "menu" : "api",
          clientX: m.position.clientX,
          clientY: m.position.clientY
        } : void 0,
        cols: ((p = (b = w()) == null ? void 0 : b.gridSettings) == null ? void 0 : p.columns) || m.position.cols || 12,
        maxRows: ee((S = (k = w()) == null ? void 0 : k.gridSettings) == null ? void 0 : S.maxRows) ? ((P = w()) == null ? void 0 : P.gridSettings).maxRows : 1 / 0,
        origin: "dashboard-editor-shell"
      });
      return g.session ? (_e(g.session, {
        actionId: c,
        actionType: "place-clipboard",
        source: n,
        position: m.position,
        prepare: ge("preparePasteWidget"),
        commit: ye,
        rollback: pe,
        contextExtra: { placementIntent: i }
      }), ze("place-clipboard", n, g.session, m.position, c)) : C(
        "place-clipboard",
        n,
        ((K = g.blocked) == null ? void 0 : K.reason) || "clipboard-unavailable",
        ((W = g.blocked) == null ? void 0 : W.itemIds) || [],
        [],
        c
      );
    },
    commitPlacement: async (t = {}) => {
      var m, g;
      const o = D(), a = t.source || "api";
      if (!o) return C("place-clipboard", a, "missing-editor");
      const n = (m = o.placementSession.value) == null ? void 0 : m.id, c = n && M.get(n) || null, i = await o.commitPlacement({
        source: je(a),
        autoCancelOnBlocked: t.autoCancelOnBlocked
      }), u = await et(i);
      if (u) return u;
      const l = ((g = Oe(i)) == null ? void 0 : g.pending) || c;
      return vt(i, l || null, a);
    },
    pasteWidget: async (t, o = {}) => {
      var m, g, b, p, k;
      const a = se();
      if (o.placementMode === "interactive")
        return F.placeClipboard(t, o);
      if ((a == null ? void 0 : a.mode) === "interactive" && !t)
        return F.placeClipboard(t, {
          ...o,
          strategy: o.strategy || "cursor",
          placementIntent: o.placementIntent || "here",
          placementMode: "interactive"
        });
      const n = we(t, o), c = n === "auto" ? qe() : "cursor", i = ke(o, c), u = fe(t, o, c);
      if (!u.ok) return C("paste-widget", o.source || "api", u.reason, [], u.diagnostics);
      const l = ge("preparePasteWidget");
      return ce("paste-widget", {
        type: "paste",
        payload: {
          strategy: i,
          ...ve(o),
          cursor: { x: u.position.x, y: u.position.y },
          cols: ((g = (m = w()) == null ? void 0 : m.gridSettings) == null ? void 0 : g.columns) || u.position.cols || 12,
          maxRows: ee((p = (b = w()) == null ? void 0 : b.gridSettings) == null ? void 0 : p.maxRows) ? ((k = w()) == null ? void 0 : k.gridSettings).maxRows : 1 / 0,
          list: u.position.list,
          source: u.position.source,
          placementIntent: n,
          placementAnchor: n === "here" ? "top-left" : void 0
        }
      }, {
        source: o.source || "api",
        position: u.position,
        contextExtra: { placementIntent: n },
        prepare: l,
        commit: ye,
        rollback: pe
      });
    },
    duplicateWidget: async (t, o = {}) => {
      var i, u, l;
      const a = Ee(t), n = a.length ? a : ((i = D()) == null ? void 0 : i.selection.value.selectedIds) || [], c = ge("prepareDuplicateWidget");
      return ce("duplicate-widget", {
        type: "duplicate",
        targetIds: n,
        payload: { strategy: "nearest-fit", cols: ((l = (u = w()) == null ? void 0 : u.gridSettings) == null ? void 0 : l.columns) || 12 }
      }, {
        source: o.source || "api",
        itemIds: n,
        prepare: c,
        commit: ye,
        rollback: pe
      });
    },
    removeWidget: async (t, o = {}) => {
      var u;
      const a = Ee(t), n = a.length ? a : ((u = D()) == null ? void 0 : u.selection.value.selectedIds) || [], c = o.source || "api", i = ge("prepareRemoveWidget");
      return ce("remove-widget", {
        type: "delete",
        targetIds: n
      }, {
        source: c,
        itemIds: n,
        prepare: async (l) => {
          if (!o.skipConfirm && e.confirm) {
            const m = await e.confirm(l), g = Ze(m);
            if (g) return g;
          }
          return (i == null ? void 0 : i(l)) || null;
        },
        commit: ye,
        rollback: pe
      });
    },
    copyWidgetReference: async (t, o = {}) => {
      const a = H("copy-reference"), n = o.source || "api", c = e.referenceAdapter;
      if (!(c != null && c.copyReference))
        return C("copy-reference", n, "adapter-unavailable", [t], [], a);
      const i = N(a, "copy-reference", n, [t]), u = c.canCopyReference ? await c.canCopyReference(i) : { available: !0 };
      if (!u.available)
        return C("copy-reference", n, u.reason || "adapter-unavailable", [t], u.diagnostics || [], a);
      const l = await c.copyReference(i), m = q({
        ok: l.ok,
        status: l.ok ? "success" : l.status || "blocked",
        actionId: a,
        actionType: "copy-reference",
        source: n,
        itemIds: [t],
        affectedIds: [t],
        adapter: {
          stage: "commit",
          ok: l.ok,
          status: l.status,
          reason: l.reason,
          sourceIds: l.sourceIds,
          newIds: l.newIds,
          idMap: l.idMap,
          metadata: l.metadata,
          diagnostics: l.diagnostics,
          error: l.error ? { code: l.error.code, message: l.error.message } : void 0
        },
        diagnostics: l.diagnostics || []
      });
      return G(A, m, R()), m;
    },
    pasteWidgetReference: async (t, o = {}) => {
      var i, u, l, m, g, b, p;
      if (!((i = e.referenceAdapter) != null && i.preparePasteReference))
        return C("paste-reference", o.source || "api", "adapter-unavailable");
      const a = we(t, o), n = ke(o, "cursor"), c = fe(t, o, "cursor");
      return c.ok ? ce("paste-reference", {
        type: "add",
        payload: {
          item: { i: `reference-${Date.now().toString(36)}`, x: c.position.x, y: c.position.y, w: ((u = o.itemSize) == null ? void 0 : u.w) || 2, h: ((l = o.itemSize) == null ? void 0 : l.h) || 2 },
          strategy: n,
          cursor: { x: c.position.x, y: c.position.y },
          cols: ((g = (m = w()) == null ? void 0 : m.gridSettings) == null ? void 0 : g.columns) || 12,
          maxRows: ((p = (b = w()) == null ? void 0 : b.gridSettings) == null ? void 0 : p.maxRows) || 1 / 0,
          list: c.position.list,
          placementIntent: a,
          placementAnchor: a === "here" ? "top-left" : void 0
        }
      }, {
        source: o.source || "api",
        position: c.position,
        contextExtra: { placementIntent: a },
        prepare: async (k) => {
          var P, K;
          const S = await ((P = Ue("preparePasteReference")) == null ? void 0 : P(k));
          return S && "kind" in S && ((K = S.newIds) != null && K[0]) && (k.payload = { itemId: S.newIds[0] }), S;
        },
        commit: Qe,
        rollback: Je
      }) : C("paste-reference", o.source || "api", c.reason, [], c.diagnostics);
    },
    replaceReferenceWithWidgetCopy: async (t, o = {}) => {
      var i;
      if (!((i = e.referenceAdapter) != null && i.prepareReplaceReferenceWithWidgetCopy))
        return C("replace-reference", o.source || "api", "adapter-unavailable", [t]);
      const a = o.source || "api", n = H("replace-reference"), c = N(n, "replace-reference", a, [t]);
      return He({
        actionId: n,
        actionType: "replace-reference",
        source: a,
        itemIds: [t],
        context: c,
        profile: R(),
        emit: A,
        prepare: Ue("prepareReplaceReferenceWithWidgetCopy"),
        mutate: (u) => {
          var l, m;
          return {
            status: "success",
            affectedIds: (l = u == null ? void 0 : u.newIds) != null && l.length ? u.newIds : [t],
            data: { sourceItemId: t, newItemId: (m = u == null ? void 0 : u.newIds) == null ? void 0 : m[0] }
          };
        },
        commit: Qe,
        rollback: Je
      });
    },
    openWidgetPalette: async (t, o = {}) => {
      var p;
      const a = H("open-palette"), n = o.source || "api";
      if (!((p = e.palette) != null && p.open))
        return C("open-palette", n, "adapter-unavailable", [], [], a);
      const c = we(t, o), i = fe(t, o, "cursor"), u = N(a, "open-palette", n, [], i.ok ? i.position : void 0, { placementIntent: c }), l = await xe(u);
      if (l)
        return C("open-palette", n, l.reason || "guard-blocked", [], l.diagnostics || [], a);
      const m = await e.palette.open(u);
      if (m && typeof m == "object" && "ok" in m && !m.ok)
        return C("open-palette", n, m.reason || "adapter-rejected", [], m.diagnostics || [], a);
      const g = Array.isArray(m) ? m : m && typeof m == "object" && !("ok" in m) ? [m] : [];
      if (g.length && o.autoAddReturnedTemplate !== !1)
        return F.addWidgetFromTemplate(g[0], i.ok ? i.position : null, {
          source: "palette",
          strategy: o.strategy,
          placementIntent: c,
          placementMode: o.placementMode
        });
      const b = q({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "open-palette",
        source: n,
        itemIds: [],
        affectedIds: [],
        position: i.ok ? i.position : void 0,
        data: m,
        diagnostics: (i.ok, i.diagnostics)
      });
      return G(A, b, R()), b;
    },
    addWidgetFromTemplate: async (t, o, a = {}) => {
      var l, m, g, b, p, k, S, P, K, W, x;
      const n = we(o, a), c = ke(a, "cursor"), i = fe(o, { ...a, itemSize: { w: t.w || 2, h: t.h || 2 } }, "cursor");
      if (!i.ok) return C("add-widget", a.source || "api", i.reason, [], i.diagnostics);
      if (a.placementMode === "interactive") {
        const $ = D(), V = a.source || "api", Pe = H("add-widget");
        if (!$) return C("add-widget", V, "missing-editor");
        const le = await $.beginPlacement({
          source: "template",
          commandType: "add",
          items: [{
            ...t,
            i: t.i || t.id,
            x: ee(t.x) ? t.x : i.position.x,
            y: ee(t.y) ? t.y : i.position.y,
            w: t.w || 2,
            h: t.h || 2
          }],
          editorMetaById: t.id || t.i ? {
            [String(t.i || t.id)]: {
              label: t.label,
              data: t.metadata
            }
          } : void 0,
          strategy: c,
          ...ve(a),
          placementIntent: n,
          placementAnchor: n === "here" ? "top-left" : void 0,
          cursor: {
            x: i.position.x,
            y: i.position.y,
            source: i.position.source === "event" ? "menu" : "api",
            clientX: i.position.clientX,
            clientY: i.position.clientY
          },
          cols: ((m = (l = w()) == null ? void 0 : l.gridSettings) == null ? void 0 : m.columns) || i.position.cols || 12,
          maxRows: ee((b = (g = w()) == null ? void 0 : g.gridSettings) == null ? void 0 : b.maxRows) ? ((p = w()) == null ? void 0 : p.gridSettings).maxRows : 1 / 0,
          origin: "dashboard-editor-shell"
        });
        return le.session ? (_e(le.session, {
          actionId: Pe,
          actionType: "add-widget",
          source: V,
          position: i.position,
          contextExtra: { placementIntent: n, template: t }
        }), ze("add-widget", V, le.session, i.position, Pe)) : C("add-widget", V, ((k = le.blocked) == null ? void 0 : k.reason) || "invalid-input", ((S = le.blocked) == null ? void 0 : S.itemIds) || []);
      }
      const u = ge("prepareAddWidget");
      return ce("add-widget", {
        type: "add",
        payload: {
          item: {
            ...t,
            i: t.i || t.id,
            x: ee(t.x) ? t.x : i.position.x,
            y: ee(t.y) ? t.y : i.position.y,
            w: t.w || 2,
            h: t.h || 2
          },
          strategy: c,
          ...ve(a),
          cursor: { x: i.position.x, y: i.position.y },
          cols: ((K = (P = w()) == null ? void 0 : P.gridSettings) == null ? void 0 : K.columns) || 12,
          maxRows: ((x = (W = w()) == null ? void 0 : W.gridSettings) == null ? void 0 : x.maxRows) || 1 / 0,
          list: i.position.list,
          placementIntent: n,
          placementAnchor: n === "here" ? "top-left" : void 0
        }
      }, {
        source: a.source || "api",
        position: i.position,
        contextExtra: { template: t, payload: t.payload, placementIntent: n },
        prepare: u,
        commit: ye,
        rollback: pe
      }).then(($) => {
        const V = $.affectedIds[0];
        return $.ok && V && (F.selectItem(V, { source: a.source || "api" }), F.highlightItem(V, { source: a.source || "api", durationMs: 1200 })), $;
      });
    },
    handleExternalDrop: async (t, o, a = {}) => {
      const n = de(o, { source: "drop" });
      if (!n.ok) return C("external-drop", "drop", n.reason, [], n.diagnostics);
      if (t.preview) {
        const c = q({
          ok: !0,
          status: "success",
          actionId: H("external-drop"),
          actionType: "external-drop",
          source: "drop",
          itemIds: [],
          affectedIds: [],
          position: n.position,
          data: { preview: !0, payload: t.metadata },
          diagnostics: n.diagnostics
        });
        return G(A, c, R()), c;
      }
      return F.addWidgetFromTemplate(t.template || { w: 2, h: 2, payload: t.payload }, n.position, {
        source: a.source || "drop",
        strategy: a.strategy
      });
    },
    moveAllWidgets: async (t, o, a = {}) => {
      var g, b;
      const n = H("move-all"), c = a.source || "api", i = w(), u = h();
      if (!i) return C("move-all", c, "missing-runtime", [], [], n);
      if (!ee(t) || !ee(o))
        return C("move-all", c, "invalid-input", [], [], n);
      const l = N(n, "move-all", c, i.activeItemIds), m = await xe(l);
      if (m) return C("move-all", c, m.reason || "guard-blocked", i.activeItemIds, m.diagnostics || [], n);
      if (u) {
        const p = Et(u, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId,
          dx: t,
          dy: o,
          clampNegative: a.clampNegative !== !1,
          policy: a.repair,
          createMissingProfile: e.createMissingProfileOnEdit
        }), k = p.diagnostics.map(
          (P) => Y(
            P.code,
            P.level,
            P.message,
            {
              actionId: n,
              actionType: "move-all",
              source: c,
              itemId: P.itemId,
              layoutId: P.layoutId || i.layoutId,
              resolvedProfileId: P.profileId || i.resolvedProfileId,
              targetView: P.targetView || i.targetView,
              path: P.path,
              details: P.details
            }
          )
        );
        p.ok && (j(p.document), T(n, p.document, i));
        const S = q({
          ok: p.ok,
          status: p.ok ? p.operation.status === "noop" ? "noop" : "success" : "blocked",
          actionId: n,
          actionType: "move-all",
          source: c,
          itemIds: i.activeItemIds,
          affectedIds: ((g = p.operation) == null ? void 0 : g.affectedIds) || i.activeItemIds,
          writeResult: p.ok ? { ok: !0, document: p.document, diagnostics: p.diagnostics } : { ok: !1, document: p.document, error: p.error, diagnostics: p.diagnostics },
          proposedDocument: p.document,
          patches: (b = p.operation) == null ? void 0 : b.patches,
          data: {
            requestedDelta: { dx: t, dy: o },
            operation: p.operation
          },
          diagnostics: k
        });
        return G(A, S, R()), S;
      }
      return ce("move-all", {
        type: "move",
        targetIds: i.activeItemIds,
        payload: { dx: t, dy: o, cols: i.gridSettings.columns }
      }, {
        source: c,
        itemIds: i.activeItemIds
      });
    },
    undo: async (t = {}) => Ne("undo", t),
    redo: async (t = {}) => Ne("redo", t),
    bindKeyboard: (t) => {
      const o = e.keyboard && typeof e.keyboard == "object" ? e.keyboard : {}, a = t || o.target || (typeof window != "undefined" ? window : null), n = typeof a == "string" && typeof document != "undefined" ? document.querySelector(a) || window : a;
      if (!n || typeof n.addEventListener != "function")
        return () => {
        };
      const c = (u) => {
        var K;
        const l = u;
        if (_t(l, o)) return;
        const m = Ot(o.platform), b = (o.shortcuts || eo).find((W) => to(l, W, m));
        if (!b) return;
        l.preventDefault(), l.stopPropagation(), l.stopImmediatePropagation();
        const p = b.source || "keyboard", k = ((K = D()) == null ? void 0 : K.selection.value.selectedIds) || [], S = (W = {}) => oo(o, b, W, p);
        (async () => {
          var W, x;
          if (b.action === "copy-widget")
            return F.copyWidget(k, { source: p });
          if (b.action === "cut-widget")
            return F.cutWidget(k, { source: p });
          if (b.action === "copy-reference")
            return k[0] ? F.copyWidgetReference(k[0], { source: p }) : C("copy-reference", p, "selection-count");
          if (b.action === "paste-widget" || b.action === "paste")
            return F.pasteWidget(null, S());
          if (b.action === "place-clipboard")
            return F.placeClipboard(null, S({
              strategy: "cursor",
              placementIntent: "here",
              placementMode: "interactive"
            }));
          if (b.action === "paste-reference")
            return F.pasteWidgetReference(null, S({
              strategy: (W = e.menu) == null ? void 0 : W.defaultReferencePasteStrategy
            }));
          if (b.action === "remove-widget") return F.removeWidget(k, { source: p });
          if (b.action === "undo") return F.undo({ source: p });
          if (b.action === "redo") return F.redo({ source: p });
          if (b.action === "open-palette")
            return F.openWidgetPalette(null, S({
              strategy: (x = e.menu) == null ? void 0 : x.defaultAddStrategy
            }));
          if (b.action === "prepare-dashboard-menu")
            return F.prepareDashboardContextMenu(null, { source: p }), null;
          if (b.action === "move-all") {
            const $ = o.moveAllStep || { dx: 0, dy: 1 };
            return F.moveAllWidgets($.dx, $.dy, { source: p });
          }
          return null;
        })().then((W) => {
          var x, $, V;
          W && !W.ok && ((V = e.onMessage) == null || V.call(e, {
            code: ((x = W.diagnostics[0]) == null ? void 0 : x.code) || W.status,
            level: W.status === "error" ? "error" : "warning",
            message: (($ = W.diagnostics[0]) == null ? void 0 : $.message) || `Action ${W.actionType} was not applied.`,
            itemIds: W.itemIds,
            recoverable: W.status !== "error"
          }));
        });
      };
      n.addEventListener("keydown", c, !0);
      const i = () => n.removeEventListener("keydown", c, !0);
      return f.push(i), i;
    },
    stop: () => We()
  }, xt = (t) => {
    if (!t || typeof t.addEventListener != "function") return () => {
    };
    const o = (a) => {
      const n = de(a, { source: "pointer" });
      n.ok && (r.value = { ...r.value, lastPointerPosition: n.position });
    };
    return t.addEventListener("pointermove", o), t.addEventListener("mousemove", o), t.addEventListener("contextmenu", o), () => {
      t.removeEventListener("pointermove", o), t.removeEventListener("mousemove", o), t.removeEventListener("contextmenu", o);
    };
  };
  d.push(Fe(
    () => {
      var t, o, a, n;
      return [
        w(),
        (t = D()) == null ? void 0 : t.selection.value,
        (o = D()) == null ? void 0 : o.dirty.value,
        (a = D()) == null ? void 0 : a.conflict.value,
        (n = D()) == null ? void 0 : n.lastResult.value,
        ue(e.mode),
        oe()
      ];
    },
    ne,
    { deep: !0, immediate: !0 }
  )), d.push(Fe(
    () => {
      var t;
      return (t = D()) == null ? void 0 : t.lastResult.value;
    },
    (t) => {
      t && et(t);
    }
  ));
  let re = null;
  d.push(Fe(
    () => oe(),
    (t) => {
      re == null || re(), re = xt(t);
    },
    { immediate: !0 }
  )), e.keyboard && e.keyboard.enabled !== !1 && f.push(F.bindKeyboard());
  const We = () => {
    if (y) return;
    y = !0, d.forEach((a) => a()), f.splice(0).forEach((a) => a()), re == null || re(), re = null, I && (clearTimeout(I), I = null);
    const t = H("cleanup");
    r.value = {
      ...r.value,
      menu: null,
      highlightedId: null,
      lastMenuPosition: null
    };
    const o = [Y(
      "shell-cleanup",
      "info",
      "Dashboard editor shell cleanup completed.",
      { actionId: t, actionType: "cleanup", source: "lifecycle" }
    )];
    A({ type: "cleanup", actionId: t, diagnostics: o });
  };
  return Pt() && Mt(We), ne(), {
    state: St(r),
    actions: F,
    stop: We
  };
}
export {
  Yt as buildDashboardContextMenu,
  zt as buildWidgetContextMenu,
  H as createDashboardEditorShellActionId,
  Y as createDashboardEditorShellDiagnostic,
  q as createDashboardEditorShellResult,
  Xe as diagnosticFromUnknownError,
  G as emitShellResult,
  jt as getEventGridPosition,
  Kt as profileContextFromRuntime,
  Ke as resolveShellPosition,
  He as runDashboardEditorShellTransaction,
  Ie as stableDiagnostics,
  ro as useDashboardEditorShell
};
