import { f as Xt } from "./resolve-C3SqJijI.mjs";
import { ref as kt, unref as ge, watch as Fe, getCurrentInstance as Vt, onBeforeUnmount as Yt, readonly as Nt } from "vue";
import { deepEqual as Ve } from "fast-equals";
import { t as qt, w as Gt } from "./dashboard-migration-CPRNR9yH.mjs";
import { g as Ut } from "./commands-C5DwsbEU.mjs";
const G = (e) => typeof e == "number" && Number.isFinite(e), wt = (e, n) => {
  if (typeof e == "number" && Number.isFinite(e)) return [e, e];
  if (Array.isArray(e)) {
    const r = typeof e[0] == "number" && Number.isFinite(e[0]) ? e[0] : n[0], d = typeof e[1] == "number" && Number.isFinite(e[1]) ? e[1] : n[1];
    return [r, d];
  }
  return n;
}, St = (e, n, r, d = {}) => ({
  code: e,
  level: n,
  message: r,
  ...d
}), vt = (e, n = []) => ({
  ok: !0,
  position: e,
  diagnostics: n
}), Ye = (e, n, r = []) => ({
  ok: !1,
  status: "blocked",
  reason: e,
  diagnostics: r.concat(St(
    `position-${e}`,
    "warning",
    n,
    { reason: e, recoverable: !0 }
  ))
}), Ne = (e, n, r, d) => {
  if (!e || !G(e.x) || !G(e.y)) return null;
  const g = Math.max(0, Math.min(Math.floor(e.x), Math.max(0, r - 1))), h = Math.max(0, Number.isFinite(d) ? Math.min(Math.floor(e.y), Math.max(0, d - 1)) : Math.floor(e.y));
  return {
    x: g,
    y: h,
    source: e.source || n,
    list: e.list,
    clientX: e.clientX,
    clientY: e.clientY,
    cols: r
  };
}, Qt = (e, n, r, d) => ({
  x: Math.max(0, Math.min(Math.floor(e.x + e.w), Math.max(0, r - 1))),
  y: Math.max(0, Number.isFinite(d) ? Math.min(Math.floor(e.y + e.h), Math.max(0, d - 1)) : Math.floor(e.y + e.h)),
  source: n,
  cols: r
}), Jt = (e, n, r, d) => {
  const g = e.filter((E) => n.indexOf(E.i) !== -1);
  if (g.length === 0) return null;
  const h = Math.min(...g.map((E) => E.x)), b = Math.min(...g.map((E) => E.y)), R = Math.max(...g.map((E) => E.x + E.w)), B = Math.max(...g.map((E) => E.y + E.h));
  return {
    x: Math.max(0, Math.min(Math.floor((h + R) / 2), Math.max(0, r - 1))),
    y: Math.max(0, Number.isFinite(d) ? Math.min(Math.floor((b + B) / 2), Math.max(0, d - 1)) : Math.floor((b + B) / 2)),
    source: "selection",
    cols: r
  };
}, Zt = (e) => {
  var g, h;
  if (!e) return null;
  const n = e;
  if (G(n.clientX) && G(n.clientY))
    return { clientX: n.clientX, clientY: n.clientY };
  const r = e, d = ((g = r.touches) == null ? void 0 : g[0]) || ((h = r.changedTouches) == null ? void 0 : h[0]);
  return d && G(d.clientX) && G(d.clientY) ? { clientX: d.clientX, clientY: d.clientY } : null;
}, _t = (e) => ({
  left: G(e.scrollLeft) ? e.scrollLeft : 0,
  top: G(e.scrollTop) ? e.scrollTop : 0
}), Rt = (e, n) => G(n.width) && n.width > 0 ? n.width : G(e.clientWidth) && e.clientWidth > 0 ? e.clientWidth : G(e.offsetWidth) && e.offsetWidth > 0 ? e.offsetWidth : 0, Ot = (e) => {
  const n = e != null && e.gridSettings ? e.gridSettings.maxRows : void 0;
  return G(n) && n > 0 ? Math.floor(n) : 1 / 0;
}, eo = (e) => {
  var r;
  const n = (r = e == null ? void 0 : e.gridSettings) == null ? void 0 : r.columns;
  return G(n) && n > 0 ? Math.floor(n) : 12;
}, qe = (e) => {
  var d;
  const n = e == null ? void 0 : e.heightRuntime;
  if (n && G(n.rowHeight) && n.rowHeight > 0)
    return n.rowHeight;
  const r = (d = e == null ? void 0 : e.gridSettings) == null ? void 0 : d.rowHeight;
  return G(r) && r > 0 ? r : 150;
}, to = (e, n) => {
  var g, h;
  const r = e.slice().sort((b, R) => b.y - R.y || b.x - R.x || b.i.localeCompare(R.i)), d = Math.max(0, Math.min(Math.floor(n), r.length));
  return {
    listIndex: d,
    beforeId: (g = r[d]) == null ? void 0 : g.i,
    afterId: d > 0 ? (h = r[d - 1]) == null ? void 0 : h.i : void 0
  };
}, oo = (e, n) => {
  var r, d;
  return {
    ...e,
    x: 0,
    y: Math.max(0, (d = (r = e.list) == null ? void 0 : r.listIndex) != null ? d : e.y),
    source: e.source === "event" ? "list" : e.source,
    list: e.list || to(n, e.y)
  };
}, Je = (e) => {
  var oe, _, re, ae, ne, I;
  const n = e.runtime || null, r = e.layout || (n == null ? void 0 : n.layout) || [], d = eo(n), g = Ot(n), h = [], b = e.itemSize || { w: 1, h: 1 }, R = (j) => ((n == null ? void 0 : n.viewFormat) || "grid") === "list" ? vt(oo(j, r), h) : vt(j, h), B = Zt(e.event);
  if (B) {
    const j = e.gridElement || null;
    if (!j || typeof j.getBoundingClientRect != "function")
      return Ye(
        "missing-grid-element",
        "Grid element is required to resolve event coordinates.",
        h
      );
    const M = j.getBoundingClientRect(), k = Rt(j, M);
    if (!Number.isFinite(k) || k <= 0)
      return Ye("missing-grid-element", "Grid element has no measurable width.", h);
    const S = _t(j), T = B.clientX - M.left + S.left, X = B.clientY - M.top + S.top, C = {
      margin: wt((oe = n == null ? void 0 : n.gridSettings) == null ? void 0 : oe.margin, [10, 10]),
      containerPadding: wt((_ = n == null ? void 0 : n.gridSettings) == null ? void 0 : _.containerPadding, [0, 0]),
      containerWidth: k,
      cols: d,
      rowHeight: qe(n),
      maxRows: g,
      renderPrecision: (re = n == null ? void 0 : n.gridSettings) == null ? void 0 : re.renderPrecision
    }, te = Xt(C, X, T, b.w, b.h);
    return !G(te.x) || !G(te.y) || te.x < 0 || te.y < 0 ? Ye("invalid-input", "Event coordinates produced an invalid grid position.", h) : R({
      x: te.x,
      y: te.y,
      source: "event",
      clientX: B.clientX,
      clientY: B.clientY,
      left: T,
      top: X,
      cols: d,
      rowHeight: C.rowHeight
    });
  }
  const E = e.activeItemId || ((ae = e.selection) == null ? void 0 : ae.activeId), A = E ? r.find((j) => j.i === E) : null;
  if (A) return R(Qt(A, "active-item", d, g));
  if ((I = (ne = e.selection) == null ? void 0 : ne.selectedIds) != null && I.length) {
    const j = Jt(r, e.selection.selectedIds, d, g);
    if (j) return R(j);
  }
  const F = Ne(e.lastMenuPosition, "last-menu", d, g);
  if (F) return R(F);
  const J = Ne(e.lastPointerPosition, "last-pointer", d, g);
  if (J) return R(J);
  const z = e.gridElement || null;
  if (z && typeof z.getBoundingClientRect == "function") {
    const j = z.getBoundingClientRect();
    if (Rt(z, j) > 0) {
      const k = qe(n), S = Number.isFinite(g) ? g : Math.max(1, Math.ceil((z.clientHeight || k) / k));
      return R({
        x: Math.max(0, Math.floor(d / 2)),
        y: Math.max(0, Math.floor(S / 2)),
        source: "viewport-center",
        cols: d,
        rowHeight: k
      });
    }
  }
  const q = Ne(e.fallback || null, "fallback", d, g);
  return q ? R(q) : (h.push(St(
    "position-fallback-origin",
    "info",
    "No pointer, selection, menu, pointer, viewport or caller fallback was available; using origin.",
    { details: { positionSource: "none" }, recoverable: !0 }
  )), R({ x: 0, y: 0, source: "none", cols: d, rowHeight: qe(n) }));
}, ao = (e) => Je(e);
let xt = 0;
const K = (e) => (xt += 1, `dashboard-shell-${e}-${Date.now().toString(36)}-${xt.toString(36)}`), so = (e) => ({
  layoutId: (e == null ? void 0 : e.layoutId) || null,
  requestedBreakpoint: (e == null ? void 0 : e.requestedBreakpoint) || null,
  resolvedProfileId: (e == null ? void 0 : e.resolvedProfileId) || null,
  targetView: (e == null ? void 0 : e.targetView) || null,
  viewFormat: (e == null ? void 0 : e.viewFormat) || null
}), V = (e, n, r, d = {}) => {
  const g = {
    code: e,
    level: n,
    message: r
  };
  return Object.keys(d).sort().forEach((b) => {
    const R = d[b];
    typeof R != "undefined" && (g[b] = R);
  }), g;
}, Ze = (e, n = {}) => {
  const r = e instanceof Error ? e.message : String(e || "Unknown error");
  return V(
    "shell-error",
    "error",
    r,
    {
      reason: "validation",
      recoverable: !0,
      ...n
    }
  );
}, Y = (e) => {
  var n, r, d;
  return {
    ok: e.ok,
    status: e.status,
    actionId: e.actionId,
    actionType: e.actionType,
    source: e.source,
    itemIds: e.itemIds || [],
    affectedIds: e.affectedIds || ((n = e.commandResult) == null ? void 0 : n.affectedIds) || e.itemIds || [],
    position: e.position,
    commandResult: e.commandResult,
    writeResult: e.writeResult,
    adapter: e.adapter,
    placement: e.placement,
    proposedDocument: e.proposedDocument,
    idMap: e.idMap || ((r = e.adapter) == null ? void 0 : r.idMap),
    patches: e.patches || ((d = e.commandResult) == null ? void 0 : d.layoutPatches),
    diagnostics: we(e.diagnostics || []),
    data: e.data
  };
}, N = (e, n, r) => {
  e == null || e({
    type: "action-result",
    actionId: n.actionId,
    actionType: n.actionType,
    source: n.source,
    status: n.status,
    ok: n.ok,
    itemIds: n.itemIds,
    affectedIds: n.affectedIds,
    profile: r,
    position: n.position,
    commandResult: n.commandResult,
    writeResult: n.writeResult,
    adapter: n.adapter,
    placement: n.placement,
    proposedDocument: n.proposedDocument,
    patches: n.patches,
    data: n.data,
    diagnostics: n.diagnostics
  });
}, we = (e) => e.filter(Boolean).map((n) => {
  const r = {
    code: n.code,
    level: n.level,
    message: n.message
  };
  return Object.keys(n).filter((d) => d !== "code" && d !== "level" && d !== "message").sort().forEach((d) => {
    const g = n[d];
    typeof g != "undefined" && (r[d] = _e(g));
  }), r;
}).sort(
  (n, r) => `${n.actionId || ""}:${n.code}:${n.path || ""}:${n.itemId || ""}`.localeCompare(`${r.actionId || ""}:${r.code}:${r.path || ""}:${r.itemId || ""}`)
), _e = (e) => {
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
  if (Array.isArray(e)) return e.map(_e);
  if (e instanceof Error) return { name: e.name, message: e.message };
  if (typeof e == "object") {
    const n = {};
    return Object.keys(e).sort().forEach((r) => {
      r === "opaque" || r === "payload" || r === "businessPayload" || (n[r] = _e(e[r]));
    }), n;
  }
  return String(e);
}, He = (e, n, r) => ({
  stage: e,
  ok: (n == null ? void 0 : n.ok) !== !1,
  status: n == null ? void 0 : n.status,
  reason: n == null ? void 0 : n.reason,
  preparedId: r == null ? void 0 : r.id,
  sourceIds: (n == null ? void 0 : n.sourceIds) || (r == null ? void 0 : r.sourceIds),
  newIds: (n == null ? void 0 : n.newIds) || (r == null ? void 0 : r.newIds),
  idMap: (n == null ? void 0 : n.idMap) || (r == null ? void 0 : r.idMap),
  metadata: (n == null ? void 0 : n.metadata) || (r == null ? void 0 : r.metadata),
  diagnostics: we((n == null ? void 0 : n.diagnostics) || (r == null ? void 0 : r.diagnostics) || []),
  error: n != null && n.error ? { code: n.error.code, message: n.error.message } : void 0
}), no = (e) => !!(e && typeof e == "object" && "ok" in e && !("kind" in e)), co = (e) => !!(e && typeof e == "object" && "kind" in e), Le = async (e, n, r, d, g) => {
  if (e.rollback)
    try {
      const h = await e.rollback(n, {
        ...e.context,
        stage: r,
        error: d
      });
      return g.push(...(h == null ? void 0 : h.diagnostics) || []), He("rollback", h, n);
    } catch (h) {
      return g.push(Ze(h, {
        actionId: e.actionId,
        actionType: e.actionType,
        source: e.source,
        reason: "adapter-rejected"
      })), {
        stage: "rollback",
        ok: !1,
        status: "error",
        reason: "adapter-rejected",
        preparedId: n.id,
        error: {
          message: h instanceof Error ? h.message : String(h)
        }
      };
    }
}, Ge = async (e) => {
  var h, b, R, B, E, A, F, J, z, q, oe, _, re, ae, ne;
  const n = e.itemIds || e.context.itemIds || [], r = e.context.diagnostics.slice();
  (h = e.emit) == null || h.call(e, {
    type: "action-start",
    actionId: e.actionId,
    actionType: e.actionType,
    source: e.source,
    itemIds: n,
    profile: e.profile,
    position: e.position,
    diagnostics: r
  });
  let d = null, g;
  try {
    if (e.prepare) {
      const T = await e.prepare(e.context);
      if (no(T)) {
        if (r.push(...T.diagnostics || []), g = He("prepare", T), !T.ok) {
          const X = Y({
            ok: !1,
            status: T.status || "blocked",
            actionId: e.actionId,
            actionType: e.actionType,
            source: e.source,
            itemIds: n,
            affectedIds: [],
            position: e.position,
            adapter: g,
            idMap: T.idMap,
            diagnostics: r
          });
          return N(e.emit, X, e.profile), X;
        }
      } else co(T) && (d = T, r.push(...d.diagnostics || []), g = He("prepare", { ok: !0, diagnostics: d.diagnostics }, d));
    }
    const I = await e.mutate(d, e.context);
    if (r.push(...I.diagnostics || []), ((b = I.commandResult) == null ? void 0 : b.status) === "blocked" || ((R = I.commandResult) == null ? void 0 : R.status) === "cancelled" || ((B = I.commandResult) == null ? void 0 : B.status) === "timeout" || ((E = I.commandResult) == null ? void 0 : E.status) === "error" || ((A = I.writeResult) == null ? void 0 : A.ok) === !1 || I.status === "blocked" || I.status === "cancelled" || I.status === "timeout" || I.status === "unsupported" || I.status === "error") {
      const T = d ? await Le(e, d, "mutate", I, r) : void 0, X = ((F = I.writeResult) == null ? void 0 : F.ok) === !1 ? "blocked" : I.status || (((J = I.commandResult) == null ? void 0 : J.status) === "cancelled" ? "cancelled" : ((z = I.commandResult) == null ? void 0 : z.status) === "timeout" ? "timeout" : ((q = I.commandResult) == null ? void 0 : q.status) === "error" ? "error" : "blocked"), C = Y({
        ok: !1,
        status: X,
        actionId: e.actionId,
        actionType: e.actionType,
        source: e.source,
        itemIds: n,
        affectedIds: I.affectedIds || ((oe = I.commandResult) == null ? void 0 : oe.affectedIds) || [],
        position: e.position,
        commandResult: I.commandResult,
        writeResult: I.writeResult,
        proposedDocument: I.proposedDocument,
        adapter: T || g,
        placement: I.placement,
        idMap: d == null ? void 0 : d.idMap,
        patches: I.patches,
        diagnostics: r,
        data: I.data
      });
      return N(e.emit, C, e.profile), C;
    }
    if (d && e.commit) {
      let T;
      try {
        T = await e.commit(d, {
          ...e.context,
          commandResult: I.commandResult,
          writeResult: I.writeResult,
          proposedDocument: I.proposedDocument
        });
      } catch (X) {
        r.push(Ze(X, {
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          reason: "adapter-rejected"
        })), g = {
          stage: "commit",
          ok: !1,
          status: "error",
          reason: "adapter-rejected",
          preparedId: d.id,
          sourceIds: d.sourceIds,
          newIds: d.newIds,
          idMap: d.idMap,
          diagnostics: we(d.diagnostics || []),
          error: {
            message: X instanceof Error ? X.message : String(X)
          }
        };
        const C = await Le(e, d, "commit", X, r), te = Y({
          ok: !1,
          status: "error",
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          itemIds: n,
          affectedIds: I.affectedIds || ((_ = I.commandResult) == null ? void 0 : _.affectedIds) || [],
          position: e.position,
          commandResult: I.commandResult,
          writeResult: I.writeResult,
          proposedDocument: I.proposedDocument,
          adapter: C || g,
          placement: I.placement,
          idMap: d.idMap,
          patches: I.patches,
          diagnostics: r,
          data: I.data
        });
        return N(e.emit, te, e.profile), te;
      }
      if (r.push(...(T == null ? void 0 : T.diagnostics) || []), g = He("commit", T, d), (T == null ? void 0 : T.ok) === !1) {
        const X = await Le(e, d, "commit", T, r), C = Y({
          ok: !1,
          status: T.status || "error",
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          itemIds: n,
          affectedIds: I.affectedIds || ((re = I.commandResult) == null ? void 0 : re.affectedIds) || [],
          position: e.position,
          commandResult: I.commandResult,
          writeResult: I.writeResult,
          proposedDocument: I.proposedDocument,
          adapter: X || g,
          placement: I.placement,
          idMap: d.idMap,
          patches: I.patches,
          diagnostics: r,
          data: I.data
        });
        return N(e.emit, C, e.profile), C;
      }
    }
    const M = (ae = I.commandResult) == null ? void 0 : ae.status, k = I.status || (M === "changed" ? "success" : M === "noop" ? "noop" : M === "cancelled" ? "cancelled" : M === "timeout" ? "timeout" : M === "error" ? "error" : M === "blocked" ? "blocked" : "success"), S = Y({
      ok: k === "success" || k === "noop",
      status: k,
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source,
      itemIds: n,
      affectedIds: I.affectedIds || ((ne = I.commandResult) == null ? void 0 : ne.affectedIds) || (d == null ? void 0 : d.newIds) || n,
      position: e.position,
      commandResult: I.commandResult,
      writeResult: I.writeResult,
      proposedDocument: I.proposedDocument,
      adapter: g,
      placement: I.placement,
      idMap: d == null ? void 0 : d.idMap,
      patches: I.patches,
      diagnostics: r,
      data: I.data
    });
    return N(e.emit, S, e.profile), S;
  } catch (I) {
    r.push(Ze(I, {
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source
    }));
    const j = d ? await Le(e, d, "mutate", I, r) : void 0, M = Y({
      ok: !1,
      status: "error",
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source,
      itemIds: n,
      affectedIds: [],
      position: e.position,
      adapter: j || g,
      idMap: d == null ? void 0 : d.idMap,
      diagnostics: r
    });
    return N(e.emit, M, e.profile), M;
  }
}, Oe = (e) => {
  var n;
  return !e.readonly && (e.mode === "edit" || ((n = e.editor) == null ? void 0 : n.mode.value) === "edit");
}, Z = (e, n) => e ? void 0 : n, Q = (e, n, r) => {
  var d, g;
  return {
    label: ((g = (d = r.options) == null ? void 0 : d.labelFactory) == null ? void 0 : g.call(d, e, r.context)) || n,
    labelKey: `dashboardEditorShell.${e}`
  };
}, ue = (e, n) => {
  var r, d;
  return (d = (r = n.options) == null ? void 0 : r.shortcuts) == null ? void 0 : d[e];
}, ze = (e, n, r) => {
  if (!Oe(e.context)) return !1;
  const d = e.context.editor;
  if (!d) return !1;
  const g = d.canExecute({
    type: n,
    targetIds: r,
    source: "context-menu"
  });
  return g.status !== "blocked" && g.status !== "error";
}, Et = (e, n, r) => {
  var h, b;
  const d = r === "dashboard" ? (h = e.options) == null ? void 0 : h.customDashboardItems : (b = e.options) == null ? void 0 : b.customWidgetItems, g = typeof d == "function" ? d(e.context) : d || [];
  return n.concat(g, e.customItems || []);
}, Ct = (e, n) => n ? e : e.filter((r) => !r.hidden), ee = (e) => e, ro = (e) => {
  var z, q, oe, _;
  const n = Oe(e.context), r = ze(e, "paste"), d = e.referenceAvailable === !0, g = e.paletteAvailable === !0, h = e.explicitPlacementTarget === !0, b = h ? "here" : "auto", R = h ? "cursor" : ((z = e.options) == null ? void 0 : z.defaultPasteStrategy) || ((q = e.options) == null ? void 0 : q.defaultAddStrategy), B = h ? "cursor" : (oe = e.options) == null ? void 0 : oe.defaultReferencePasteStrategy, E = h ? "cursor" : (_ = e.options) == null ? void 0 : _.defaultAddStrategy, A = e.readonlyReason || "mode-readonly", F = e.target, J = [
    {
      id: "paste",
      type: "item",
      ...Q("paste", h ? "Paste here" : "Paste", e),
      icon: "clipboard-paste",
      shortcut: ue("paste", e),
      enabled: r,
      reason: Z(r, n ? "clipboard-unavailable" : A),
      target: F,
      metadata: { strategy: R, placementIntent: b },
      action: ee(() => e.actions.pasteWidget(e.position || null, { source: "context-menu", strategy: R, placementIntent: b }))
    },
    {
      id: "place-clipboard",
      type: "item",
      ...Q("place-clipboard", "Place from clipboard", e),
      icon: "crosshair",
      enabled: r,
      reason: Z(r, n ? "clipboard-unavailable" : A),
      target: F,
      metadata: { strategy: R, placementIntent: b, placementMode: "interactive" },
      action: ee(() => e.actions.placeClipboard(e.position || null, {
        source: "context-menu",
        strategy: R,
        placementIntent: b,
        placementMode: "interactive"
      }))
    },
    {
      id: "paste-reference",
      type: "item",
      ...Q("paste-reference", h ? "Paste reference here" : "Paste reference", e),
      icon: "link",
      shortcut: ue("paste-reference", e),
      enabled: n && d,
      reason: Z(n && d, n ? "adapter-unavailable" : A),
      target: F,
      metadata: { strategy: B, placementIntent: b },
      action: ee(() => e.actions.pasteWidgetReference(e.position || null, { source: "context-menu", strategy: B, placementIntent: b }))
    },
    {
      id: "add-widget",
      type: "item",
      ...Q("add-widget", h ? "Add widget here" : "Add widget", e),
      icon: "plus",
      enabled: n,
      reason: Z(n, A),
      target: F,
      metadata: { strategy: E, placementIntent: b },
      action: ee(() => e.actions.addWidgetFromTemplate({ w: 2, h: 2 }, e.position || null, { source: "context-menu", strategy: E, placementIntent: b }))
    },
    {
      id: "open-palette",
      type: "item",
      ...Q("open-palette", h ? "Open palette here" : "Open palette", e),
      icon: "layout-grid",
      shortcut: ue("open-palette", e),
      enabled: n && g,
      reason: Z(n && g, n ? "adapter-unavailable" : A),
      target: F,
      metadata: { strategy: E, placementIntent: b },
      action: ee(() => e.actions.openWidgetPalette(e.position || null, { source: "context-menu", strategy: E, placementIntent: b }))
    },
    {
      id: "move-all-widgets",
      type: "item",
      ...Q("move-all-widgets", "Move all widgets", e),
      icon: "move",
      shortcut: ue("move-all", e),
      enabled: n,
      reason: Z(n, A),
      target: F,
      metadata: { dx: 0, dy: 1 },
      action: ee(() => e.actions.moveAllWidgets(0, 1, { source: "context-menu" }))
    },
    {
      id: "dashboard-settings",
      type: "item",
      ...Q("dashboard-settings", "Dashboard settings", e),
      icon: "settings",
      enabled: !0,
      target: F,
      metadata: { hook: !0 }
    }
  ];
  return {
    id: e.id,
    target: F,
    position: e.position,
    items: Ct(Et(e, J, "dashboard"), e.includeHidden),
    diagnostics: e.diagnostics || []
  };
}, io = (e) => {
  const n = Oe(e.context), r = e.readonlyReason || "mode-readonly", d = [e.itemId], g = e.hiddenItem === !0, h = e.lockedItem === !0, b = !g && !!e.context.editor, R = !g && ze(e, "copy", d), B = !g && ze(e, "duplicate", d), E = !g && !h && ze(e, "delete", d), A = e.referenceAvailable === !0, F = e.target, J = [
    {
      id: "select",
      type: "item",
      ...Q("select", "Select", e),
      icon: "mouse-pointer-2",
      enabled: b,
      reason: Z(b, g ? "hidden" : "missing-editor"),
      target: F,
      action: ee(() => e.actions.selectItem(e.itemId, { source: "context-menu" }))
    },
    {
      id: "edit-widget",
      type: "item",
      ...Q("edit-widget", "Edit", e),
      icon: "pencil",
      enabled: n && !h && !g,
      reason: Z(n && !h && !g, g ? "hidden" : h ? "locked" : r),
      target: F,
      metadata: { hook: !0 }
    },
    {
      id: "copy-widget",
      type: "item",
      ...Q("copy-widget", "Copy widget", e),
      icon: "copy",
      shortcut: ue("copy-widget", e),
      enabled: R,
      reason: Z(R, g ? "hidden" : r),
      target: F,
      action: ee(() => e.actions.copyWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "copy-reference",
      type: "item",
      ...Q("copy-reference", "Copy reference", e),
      icon: "link",
      shortcut: ue("copy-reference", e),
      enabled: !g && A,
      reason: Z(!g && A, g ? "hidden" : "adapter-unavailable"),
      target: F,
      action: ee(() => e.actions.copyWidgetReference(e.itemId, { source: "context-menu" }))
    },
    {
      id: "duplicate",
      type: "item",
      ...Q("duplicate", "Duplicate", e),
      icon: "copy-plus",
      shortcut: ue("duplicate-widget", e),
      enabled: B,
      reason: Z(B, g ? "hidden" : r),
      target: F,
      action: ee(() => e.actions.duplicateWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "remove",
      type: "item",
      ...Q("remove", "Remove", e),
      icon: "trash-2",
      shortcut: ue("remove-widget", e),
      danger: !0,
      enabled: E,
      reason: Z(E, g ? "hidden" : h ? "locked" : r),
      target: F,
      action: ee(() => e.actions.removeWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "replace-reference",
      type: "item",
      ...Q("replace-reference", "Replace reference with copy", e),
      icon: "replace",
      enabled: n && !g && A,
      reason: Z(n && !g && A, g ? "hidden" : n ? "adapter-unavailable" : r),
      target: F,
      action: ee(() => e.actions.replaceReferenceWithWidgetCopy(e.itemId, { source: "context-menu" }))
    },
    {
      id: "scroll-highlight",
      type: "item",
      ...Q("scroll-highlight", "Scroll and highlight", e),
      icon: "scan-search",
      enabled: !g,
      reason: Z(!g, "hidden"),
      target: F,
      action: ee(async () => {
        const z = e.actions.highlightItem(e.itemId, { source: "context-menu" });
        return await e.actions.scrollToItem(e.itemId, { source: "context-menu" }), z;
      })
    }
  ];
  return {
    id: e.id,
    target: F,
    position: e.position,
    items: Ct(Et(e, J, "widget"), e.includeHidden),
    diagnostics: e.diagnostics || []
  };
}, ke = (e) => e.map((n) => ({ ...n })), O = (e) => typeof e == "number" && Number.isFinite(e), lo = (e) => !!(e && typeof e == "object" && "value" in e), Be = (e) => Array.isArray(e) ? e.filter(Boolean) : e ? [e] : [], Ue = (e) => e === "context-menu" ? "context-menu" : e === "keyboard" ? "keyboard" : e === "toolbar" ? "toolbar" : e === "pointer" ? "pointer" : "api", Mt = (e) => e === "context-menu" ? "context-menu" : e === "keyboard" ? "keyboard" : e === "toolbar" ? "toolbar" : e === "pointer" ? "pointer" : e === "drop" ? "drop" : "api", Qe = (e) => e.type === "move" ? "pointer-move" : e.type === "resize" ? "pointer-resize" : e.type === "add" || e.type === "paste" ? "external-drop" : null, Se = (e, n) => e.strategy || n, uo = (e) => e === "first-fit" || e === "insert-top-shift", mo = (e) => e ? typeof Event != "undefined" && e instanceof Event ? !0 : typeof e == "object" && ("x" in e || "y" in e) : !1, Ee = (e, n) => n.placementIntent || (mo(e) ? "here" : "auto"), Ce = (e) => ({
  collisionPolicy: e.collisionPolicy,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), fo = (e) => {
  var g, h;
  if (!e) return !1;
  const n = e;
  if (O(n.clientX) && O(n.clientY)) return !0;
  const r = e, d = ((g = r.touches) == null ? void 0 : g[0]) || ((h = r.changedTouches) == null ? void 0 : h[0]);
  return !!(d && O(d.clientX) && O(d.clientY));
}, go = (e, n, r, d, g) => {
  const h = (e == null ? void 0 : e.newIds) || [];
  if (!h.length) return [];
  const b = new Set(n.map((A) => A.i)), R = /* @__PURE__ */ new Set(), B = [], E = [];
  return h.forEach((A) => {
    if (typeof A != "string" || A.trim().length === 0) {
      B.push(String(A));
      return;
    }
    (R.has(A) || b.has(A)) && E.push(A), R.add(A);
  }), !B.length && !E.length ? [] : [V(
    "shell-adapter-invalid-new-ids",
    "error",
    "Adapter prepare returned invalid or duplicate new widget ids.",
    {
      actionId: r,
      actionType: d,
      source: g,
      reason: "adapter-rejected",
      itemIds: E.concat(B),
      details: {
        duplicateIds: E,
        invalidIds: B
      },
      recoverable: !0
    }
  )];
}, yo = () => ({
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
}), Pt = (e, n, r, d = []) => Ut({ id: e, type: n }, "blocked", {
  targetIds: d,
  blocked: {
    reason: r,
    itemIds: d,
    message: `Command was blocked by dashboard editor shell: ${r}.`
  }
}), De = (e, n) => {
  var g, h;
  const r = (h = (g = n.diagnostics) == null ? void 0 : g.operationResult) == null ? void 0 : h.layout;
  if (r) return ke(r);
  let d = ke(e.layout);
  return n.layoutPatches.forEach((b) => {
    if (b.type === "add") {
      d.push({ ...b.item });
      return;
    }
    if (b.type === "remove") {
      d = d.filter((R) => R.i !== b.id);
      return;
    }
    if (b.type === "move") {
      d = d.map((R) => R.i === b.id ? { ...R, x: b.to.x, y: b.to.y } : R);
      return;
    }
    b.type === "resize" && (d = d.map((R) => R.i === b.id ? { ...R, x: b.to.x, y: b.to.y, w: b.to.w, h: b.to.h } : R));
  }), d;
}, $e = (e) => typeof CSS != "undefined" && typeof CSS.escape == "function" ? CSS.escape(e) : e.replace(/["\\]/g, "\\$&"), po = (e) => !!(e && typeof e == "object"), ho = (e, n = {}) => {
  var g;
  if (e.defaultPrevented) return !0;
  const r = e.target;
  if (!po(r)) return !1;
  const d = (g = r.tagName) == null ? void 0 : g.toUpperCase();
  return d === "INPUT" || d === "TEXTAREA" || d === "SELECT" || r.isContentEditable ? !0 : (n.ignoredTargets || []).some((h) => typeof h == "string" ? typeof r.matches == "function" && r.matches(h) : h(r));
}, Io = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", bo = [
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
], ko = (e, n, r) => {
  const d = r === "mac" ? e.metaKey : e.ctrlKey, g = r === "mac" ? e.ctrlKey : e.metaKey, h = n.primary === !0, b = typeof n.ctrl == "boolean" || typeof n.meta == "boolean";
  if (e.key.toLowerCase() !== n.key.toLowerCase()) return !1;
  if (b) {
    if ((n.ctrl || !1) !== e.ctrlKey || (n.meta || !1) !== e.metaKey) return !1;
  } else if (h !== d || h && g || !h && (e.ctrlKey || e.metaKey)) return !1;
  return !((n.shift || !1) !== e.shiftKey || (n.alt || !1) !== e.altKey);
}, wo = (e, n, r, d) => {
  const g = n.placementOptions || e.placementOptions, h = typeof g == "function" ? g() : g;
  return {
    ...r,
    ...h || {},
    source: d
  };
};
function So(e = {}) {
  var mt, ft, gt, yt;
  const n = kt(ge(e.document) || null), r = kt(yo()), d = [], g = [];
  let h = !1, b = null, R = Promise.resolve(), B = null;
  const E = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Set(), J = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new Set(), q = /* @__PURE__ */ new Map(), oe = e.controlled !== !1, _ = () => e.documentWriteBack === "shell", re = (t, o) => {
    var a;
    return `${t}:${(a = o == null ? void 0 : o.revision) != null ? a : "unknown"}`;
  }, ae = (t) => {
    const o = R.catch(() => {
    }).then(t);
    return R = o.then(() => {
    }, () => {
    }), o;
  }, ne = () => {
    B = null;
  }, I = (t, o) => {
    B = {
      mode: "interactive",
      reason: "cut-widget",
      sourceActionId: t,
      itemIds: o.slice()
    };
  }, j = () => {
    const t = B;
    return B = null, t;
  }, M = (t) => {
    var o;
    (o = e.onEvent) == null || o.call(e, t);
  }, k = () => {
    var t;
    return ((t = e.model) == null ? void 0 : t.state.value) || ge(e.runtime) || null;
  }, S = () => {
    var t;
    return e.editor || ((t = e.model) == null ? void 0 : t.editorController) || null;
  }, T = () => ge(e.gridElement) || null, X = () => ge(e.document) || n.value || null, C = () => so(k()), te = (t, o) => {
    const a = k(), s = [];
    return a || s.push(V(
      "shell-missing-runtime",
      "warning",
      "Dashboard responsive runtime is not available.",
      { actionId: t, actionType: o, reason: "missing-runtime", recoverable: !0 }
    )), S() || s.push(V(
      "shell-missing-editor",
      "warning",
      "Grid editor controller is not available.",
      { actionId: t, actionType: o, reason: "missing-editor", recoverable: !0 }
    )), ((a == null ? void 0 : a.diagnostics) || []).forEach((c) => {
      s.push(V(
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
    }), s;
  }, Dt = (t, o) => {
    var l, m;
    const a = (ge(e.mode) || (t == null ? void 0 : t.mode) || (o == null ? void 0 : o.mode.value)) === "edit", s = ((t == null ? void 0 : t.renderItemIds) || (t == null ? void 0 : t.activeItemIds) || []).length === 0, c = !!(t && a && s), i = {
      layoutId: (t == null ? void 0 : t.layoutId) || null,
      requestedBreakpoint: (t == null ? void 0 : t.requestedBreakpoint) || null,
      resolvedProfileId: (t == null ? void 0 : t.resolvedProfileId) || null,
      targetView: (t == null ? void 0 : t.targetView) || null,
      viewFormat: (t == null ? void 0 : t.viewFormat) || null
    }, u = c && L ? [
      {
        id: "open-palette",
        labelKey: "dashboardEditorShell.open-palette",
        icon: "layout-grid",
        enabled: !0,
        target: { type: "dashboard" },
        metadata: { strategy: (l = e.menu) == null ? void 0 : l.defaultAddStrategy },
        action: () => {
          var f;
          return L.openWidgetPalette(null, { source: "api", strategy: (f = e.menu) == null ? void 0 : f.defaultAddStrategy });
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
          var f;
          return L.addWidgetFromTemplate({ w: 2, h: 2 }, null, { source: "api", strategy: (f = e.menu) == null ? void 0 : f.defaultAddStrategy });
        }
      }
    ] : [];
    return {
      enabled: c,
      reason: c ? void 0 : t ? a ? "not-empty" : "mode-readonly" : "missing-runtime",
      target: i,
      descriptors: u
    };
  }, et = () => {
    const t = k(), o = S(), a = te(), s = !t || !o || !T();
    r.value = {
      ...r.value,
      ready: !!(t && o),
      degraded: s,
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
      mode: ge(e.mode) || (t == null ? void 0 : t.mode) || (o == null ? void 0 : o.mode.value) || null,
      selection: (o == null ? void 0 : o.selection.value) || null,
      dirty: (o == null ? void 0 : o.dirty.value) || !1,
      conflict: (o == null ? void 0 : o.conflict.value) || null,
      lastResult: (o == null ? void 0 : o.lastResult.value) || null,
      toolbar: (o == null ? void 0 : o.getToolbarState()) || null,
      emptyAdd: Dt(t, o),
      diagnostics: we(a)
    };
  }, ve = (t, o, a) => {
    var c;
    const s = {
      type: "documentChange",
      actionId: t,
      document: o,
      runtime: a,
      controlled: oe,
      persist: !1
    };
    (c = e.onDocumentChange) == null || c.call(e, s), M({ type: "documentChange", event: s });
  }, Re = (t) => {
    oe || (n.value = t, lo(e.document) && (e.document.value = t));
  }, At = (t, o, a, s = {}) => {
    const c = k(), i = X(), u = S(), l = [];
    if (!c || !i)
      return l.push(V(
        "shell-write-back-skipped",
        "info",
        "Dashboard document or runtime is unavailable; action result is returned without proposed document.",
        { actionId: t, reason: c ? "profile-write-back" : "missing-runtime", recoverable: !0 }
      )), { diagnostics: l };
    const m = Gt(
      i,
      c,
      o,
      {
        createMissingProfileOnEdit: e.createMissingProfileOnEdit,
        createMissingItems: !0,
        removeMissingItems: s.removeMissingItems,
        editorMetaById: u == null ? void 0 : u.editorMetaById.value,
        sectionRows: u == null ? void 0 : u.sectionRows.value,
        writeItemIds: a
      }
    );
    return l.push(...m.diagnostics.map(
      (f) => V(
        f.code,
        f.level,
        f.message,
        {
          actionId: t,
          itemId: f.itemId,
          layoutId: f.layoutId || c.layoutId,
          path: f.path,
          resolvedProfileId: f.profileId || c.resolvedProfileId,
          targetView: f.targetView || c.targetView,
          details: f.details
        }
      )
    )), m.ok ? { writeResult: m, proposedDocument: m.document, diagnostics: l } : (l.push(V(
      "shell-profile-write-back-blocked",
      "error",
      m.error.message,
      { actionId: t, reason: "profile-write-back", recoverable: !0, path: m.error.path }
    )), { writeResult: m, proposedDocument: m.document, diagnostics: l });
  }, me = (t, o, a, s, c, i = {}) => ({
    actionId: t,
    actionType: o,
    source: a,
    itemIds: s,
    runtime: k(),
    document: X(),
    position: c,
    diagnostics: te(t, o),
    ...i
  }), Ae = async (t) => {
    for (const o of e.guards || []) {
      const a = await o(t);
      if (a === !1)
        return {
          ok: !1,
          status: "blocked",
          reason: "guard-blocked",
          diagnostics: [V(
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
  }, W = (t, o, a, s = [], c = [], i = K(t)) => {
    const u = Y({
      ok: !1,
      status: a === "adapter-unavailable" ? "unsupported" : "blocked",
      actionId: i,
      actionType: t,
      source: o,
      itemIds: s,
      affectedIds: [],
      diagnostics: c.concat(V(
        `shell-${a}`,
        a === "missing-runtime" || a === "missing-editor" ? "warning" : "error",
        `Dashboard editor shell action was blocked: ${a}.`,
        { actionId: i, actionType: t, source: o, reason: a, itemIds: s, ...C() }
      ))
    });
    return N(M, u, C()), u;
  }, ye = (t, o, a, s) => ((t == null ? void 0 : t.diagnostics) || []).map((c) => {
    const i = c.code.startsWith("grid-editor.placement.") ? `shell-placement-${c.code.slice(22).replace(/\./g, "-")}` : c.code;
    return V(
      i,
      c.level,
      c.message,
      {
        actionId: o,
        actionType: a,
        source: s,
        reason: c.reason,
        itemIds: c.itemIds,
        details: c.details,
        recoverable: c.level !== "error",
        ...C()
      }
    );
  }), Te = (t, o, a, s) => {
    var i, u;
    const c = (u = (i = t == null ? void 0 : t.diagnostics) == null ? void 0 : i.computed) == null ? void 0 : u.placement;
    if (c)
      return {
        ...c,
        strategy: c.strategy,
        diagnostics: we(ye(c, o, a, s))
      };
  }, Tt = (t, o, a, s) => {
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
      diagnostics: we(ye(c, o, a, s))
    };
  }, tt = (t, o, a, s, c = K(t)) => {
    const i = Tt(a, c, t, o), u = Y({
      ok: !0,
      status: "success",
      actionId: c,
      actionType: t,
      source: o,
      itemIds: a.items.map((l) => l.i),
      affectedIds: [],
      position: s,
      placement: i,
      diagnostics: (i == null ? void 0 : i.diagnostics) || [],
      data: xe({
        placementSessionId: a.id,
        phase: a.phase,
        source: a.source
      }, i)
    });
    return N(M, u, C()), u;
  }, xe = (t, o) => o ? t && typeof t == "object" && !Array.isArray(t) ? {
    ...t,
    placement: o
  } : { value: t, placement: o } : t, Wt = (t) => t.status === "changed" ? "success" : t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : t.status === "blocked" ? "blocked" : "noop", Ft = (t, o, a, s) => {
    var c;
    return t.blocked ? [V(
      `shell-command-${t.blocked.reason}`,
      "warning",
      t.blocked.message || `Editor command was blocked: ${t.blocked.reason}.`,
      { actionId: o, actionType: a, source: s, reason: t.blocked.reason, itemIds: t.blocked.itemIds, recoverable: !0 }
    )] : t.status === "error" ? [V(
      "shell-command-error",
      "error",
      ((c = t.error) == null ? void 0 : c.message) || "Editor command failed.",
      { actionId: o, actionType: a, source: s, reason: "validation", recoverable: !0 }
    )] : [];
  }, Ke = (t, o, a) => {
    _() && (!t || !e.legacyHistoryStore || o === "success" && (a == null ? void 0 : a.ok) === !0 && e.legacyHistoryStore.push(t));
  }, Me = (t) => {
    var f, y, p, x, w, v, $;
    const o = Te(t.result, t.actionId, t.actionType, t.source), a = ye(
      (y = (f = t.result.diagnostics) == null ? void 0 : f.computed) == null ? void 0 : y.placement,
      t.actionId,
      t.actionType,
      t.source
    ), s = Wt(t.result), c = (p = t.hasDocumentMutation) != null ? p : t.result.layoutPatches.length > 0 || t.result.metadataPatches.length > 0, u = !!(t.nextLayout && c && (t.result.status === "changed" || t.result.status === "noop")) ? At(t.actionId, t.nextLayout || [], t.writeItemIds || t.result.affectedIds, {
      removeMissingItems: t.removeMissingItems
    }) : { diagnostics: [] };
    ((x = u.writeResult) == null ? void 0 : x.ok) === !1 && t.rollbackCheckpoint && ((w = S()) == null || w.restoreRollbackCheckpoint(
      t.rollbackCheckpoint,
      t.rollbackReason || "shell-write-back-rollback"
    ));
    const l = ((v = u.writeResult) == null ? void 0 : v.ok) === !1 ? "blocked" : s, m = (s === "success" || s === "noop") && (($ = u.writeResult) == null ? void 0 : $.ok) !== !1;
    return m && t.writeLegacyMirror && Ke(t.nextLayout, s, u.writeResult), {
      status: l,
      ok: m,
      writeResult: u.writeResult,
      proposedDocument: u.proposedDocument,
      affectedIds: t.result.affectedIds,
      patches: t.result.layoutPatches,
      placement: o,
      data: xe(t.data, o),
      diagnostics: u.diagnostics.concat(Ft(t.result, t.actionId, t.actionType, t.source)).concat(a)
    };
  }, je = (t) => t ? t.kind === "layout" ? ke(t.layout) : ke(t.layouts[t.breakpoint] || []) : null, Lt = (t) => t ? !Ve(je(t.before), je(t.after)) || !Ve(t.before.editorMetaById, t.after.editorMetaById) || !Ve(t.before.sectionRows, t.after.sectionRows) : !1, ot = async (t, o = {}) => ae(async () => {
    var p, x, w, v;
    const a = K(t), s = o.source || "api", c = S();
    if (!c) return W(t, s, "missing-editor", [], [], a);
    const i = c.createRollbackCheckpoint(`shell-${t}-write-back`);
    z.add(a);
    const u = await c.execute({
      id: a,
      type: t,
      source: Ue(s)
    }).finally(() => {
      z.delete(a);
    }), l = je(t === "undo" ? (p = u.undo) == null ? void 0 : p.before : (x = u.undo) == null ? void 0 : x.after), m = Lt(u.undo), f = Me({
      actionId: a,
      actionType: t,
      source: s,
      result: u,
      nextLayout: l,
      removeMissingItems: !0,
      hasDocumentMutation: m,
      rollbackCheckpoint: i,
      rollbackReason: "shell-history-write-back-rollback",
      data: { historyEntry: (w = u.undo) == null ? void 0 : w.id }
    }), y = Y({
      ok: f.ok,
      status: f.status,
      actionId: a,
      actionType: t,
      source: s,
      itemIds: u.targetIds,
      affectedIds: f.affectedIds,
      commandResult: u,
      writeResult: f.writeResult,
      proposedDocument: f.proposedDocument,
      patches: f.patches,
      diagnostics: f.diagnostics,
      data: f.data
    });
    return y.ok && y.proposedDocument && ((v = y.writeResult) == null ? void 0 : v.ok) !== !1 && (Re(y.proposedDocument), ve(a, y.proposedDocument, k())), N(M, y, C()), y;
  }), se = async (t, o, a = {}) => ae(async () => {
    var p, x, w;
    const s = o.id || K(t), c = a.source || "api", i = a.itemIds || o.targetIds || [], u = me(s, t, c, i, a.position, a.contextExtra);
    let l = null, m = null, f = !1;
    const y = await Ge({
      actionId: s,
      actionType: t,
      source: c,
      itemIds: i,
      position: a.position,
      context: u,
      profile: C(),
      emit: M,
      prepare: async (v) => {
        var P;
        const $ = await Ae(v);
        return $ || ((P = a.prepare) == null ? void 0 : P.call(a, v)) || null;
      },
      mutate: async (v) => {
        var pt, ht, It, bt;
        const $ = S(), P = k();
        if (!$)
          return {
            status: "blocked",
            commandResult: Pt(s, o.type, "missing-editor", i),
            diagnostics: [V(
              "shell-missing-editor",
              "error",
              "Grid editor controller is required for this action.",
              { actionId: s, actionType: t, source: c, reason: "missing-editor", recoverable: !0 }
            )]
          };
        l = P ? ke(P.layout) : null;
        const U = go(
          v,
          (P == null ? void 0 : P.layout) || [],
          s,
          t,
          c
        );
        if (U.length > 0)
          return {
            status: "blocked",
            commandResult: Pt(s, o.type, "invalid-input", i),
            affectedIds: [],
            diagnostics: U
          };
        const H = (pt = v == null ? void 0 : v.newIds) != null && pt[0] && o.type === "add" ? {
          ...o,
          payload: {
            ...o.payload || {},
            item: {
              ...((ht = o.payload) == null ? void 0 : ht.item) || {},
              i: v.newIds[0]
            }
          }
        } : o;
        m = $.createRollbackCheckpoint(`shell-${t}-write-back`), z.add(s);
        const D = await $.execute({
          ...H,
          id: s,
          source: Ue(c)
        }).finally(() => {
          z.delete(s);
        });
        f = D.status === "changed";
        const Pe = Te(D, s, t, c), de = ye((bt = (It = D.diagnostics) == null ? void 0 : It.computed) == null ? void 0 : bt.placement, s, t, c);
        if (D.status === "blocked" || D.status === "cancelled" || D.status === "timeout" || D.status === "error")
          return {
            status: D.status === "cancelled" ? "cancelled" : D.status === "timeout" ? "timeout" : D.status === "error" ? "error" : "blocked",
            commandResult: D,
            affectedIds: D.affectedIds,
            diagnostics: D.blocked ? [V(
              `shell-command-${D.blocked.reason}`,
              "warning",
              D.blocked.message || `Editor command was blocked: ${D.blocked.reason}.`,
              { actionId: s, actionType: t, source: c, reason: D.blocked.reason, itemIds: D.blocked.itemIds, recoverable: !0 }
            )].concat(de) : de,
            placement: Pe,
            data: xe(a.data, Pe)
          };
        const jt = P ? De(P, D) : [], le = Me({
          actionId: s,
          actionType: t,
          source: c,
          result: D,
          nextLayout: P ? jt : null,
          removeMissingItems: o.type === "delete",
          rollbackCheckpoint: m,
          rollbackReason: "shell-write-back-rollback",
          data: a.data
        });
        return {
          status: le.status,
          commandResult: D,
          writeResult: le.writeResult,
          proposedDocument: le.proposedDocument,
          affectedIds: le.affectedIds,
          patches: le.patches,
          placement: le.placement,
          data: le.data,
          diagnostics: le.diagnostics
        };
      },
      commit: a.commit,
      rollback: a.rollback
    });
    if (!y.ok && f && (m ? (p = S()) == null || p.restoreRollbackCheckpoint(m, "shell-transaction-rollback") : l && ((x = S()) == null || x.setExternalLayout(l, "shell-transaction-rollback"))), y.ok && y.proposedDocument && ((w = y.writeResult) == null ? void 0 : w.ok) !== !1) {
      const v = k();
      v && y.commandResult && Ke(
        De(v, y.commandResult),
        y.status,
        y.writeResult
      ), Re(y.proposedDocument), ve(s, y.proposedDocument, k());
    }
    return y;
  }), Bt = async (t, o) => ae(async () => {
    var p, x, w, v, $, P;
    if (!_() || F.has(o.id) || z.has(o.id)) return null;
    const a = Qe(t);
    if (!a || (w = (x = (p = o.diagnostics) == null ? void 0 : p.computed) == null ? void 0 : x.placement) != null && w.sessionId) return null;
    const s = o.id || K(a), c = Mt(t.source || ((v = o.diagnostics) == null ? void 0 : v.source)), i = k(), u = q.get(o.id), l = re(o.id, u);
    if (J.has(l)) return null;
    F.add(o.id), J.add(l), q.delete(o.id);
    const m = i ? De(i, o) : [], f = Me({
      actionId: s,
      actionType: a,
      source: c,
      result: o,
      nextLayout: i ? m : null,
      removeMissingItems: t.type === "delete",
      rollbackCheckpoint: u,
      rollbackReason: "shell-managed-write-back-failed",
      writeLegacyMirror: !0,
      data: {
        commandId: o.id,
        commandType: t.type,
        historyEntryId: ($ = o.undo) == null ? void 0 : $.id,
        synthesized: !0
      }
    }), y = Y({
      ok: f.ok,
      status: f.status,
      actionId: s,
      actionType: a,
      source: c,
      itemIds: o.targetIds,
      affectedIds: f.affectedIds,
      commandResult: o,
      writeResult: f.writeResult,
      proposedDocument: f.proposedDocument,
      patches: f.patches,
      placement: f.placement,
      diagnostics: f.diagnostics,
      data: f.data
    });
    return y.ok && y.proposedDocument && ((P = y.writeResult) == null ? void 0 : P.ok) !== !1 && (Re(y.proposedDocument), ve(s, y.proposedDocument, k())), N(M, y, C()), y;
  }), $t = async (t, o) => ae(async () => {
    var f, y, p, x, w;
    if (!_() || F.has(o.id) || z.has(o.id)) return null;
    const a = Qe(t);
    if (!a || (p = (y = (f = o.diagnostics) == null ? void 0 : f.computed) == null ? void 0 : y.placement) != null && p.sessionId) return null;
    const s = o.id || K(a), c = Mt(t.source || ((x = o.diagnostics) == null ? void 0 : x.source)), i = q.get(o.id), u = re(o.id, i);
    if (J.has(u)) return null;
    F.add(o.id), J.add(u), q.delete(o.id);
    const l = Me({
      actionId: s,
      actionType: a,
      source: c,
      result: o,
      nextLayout: null,
      hasDocumentMutation: !1,
      data: {
        commandId: o.id,
        commandType: t.type,
        historyEntryId: (w = o.undo) == null ? void 0 : w.id,
        synthesized: !0
      }
    }), m = Y({
      ok: l.ok,
      status: l.status,
      actionId: s,
      actionType: a,
      source: c,
      itemIds: o.targetIds,
      affectedIds: l.affectedIds,
      commandResult: o,
      patches: l.patches,
      placement: l.placement,
      diagnostics: l.diagnostics,
      data: l.data
    });
    return N(M, m, C()), m;
  }), We = (t, o = {}) => {
    var a, s, c;
    return t && typeof Event != "undefined" && t instanceof Event ? fe(t, o) : t && typeof t == "object" && ("x" in t || "y" in t) ? Je({
      ...o,
      runtime: k(),
      layout: (a = k()) == null ? void 0 : a.layout,
      selection: null,
      gridElement: null,
      lastMenuPosition: null,
      lastPointerPosition: null,
      fallback: t
    }) : Je({
      ...o,
      runtime: k(),
      layout: (s = k()) == null ? void 0 : s.layout,
      selection: ((c = S()) == null ? void 0 : c.selection.value) || null,
      gridElement: T(),
      lastMenuPosition: r.value.lastMenuPosition,
      lastPointerPosition: r.value.lastPointerPosition,
      fallback: o.fallback || r.value.lastMenuPosition || r.value.lastPointerPosition || void 0
    });
  }, pe = (t, o, a) => {
    const s = Se(o, a);
    if (!uo(s)) return We(t, o);
    const c = o;
    return t ? We(t, {
      ...o,
      fallback: c.fallback || { x: 0, y: 0, source: "strategy" }
    }) : We({ x: 0, y: 0, source: "strategy" }, o);
  }, at = () => {
    var t, o;
    return ((t = e.menu) == null ? void 0 : t.defaultPasteStrategy) || ((o = e.menu) == null ? void 0 : o.defaultAddStrategy) || "cursor";
  }, fe = (t, o = {}) => {
    var a, s, c;
    return ao({
      ...o,
      event: t,
      runtime: k(),
      layout: (a = k()) == null ? void 0 : a.layout,
      selection: ((s = S()) == null ? void 0 : s.selection.value) || null,
      gridElement: T(),
      lastMenuPosition: r.value.lastMenuPosition,
      lastPointerPosition: r.value.lastPointerPosition,
      fallback: o.fallback || ((c = e.position) == null ? void 0 : c.fallback)
    });
  }, st = async (t, o = {}, a = "paste") => {
    var u, l;
    const s = k(), c = o.placementIntent || "here", i = {
      strategy: o.strategy || "cursor",
      ...Ce(o),
      cursor: { x: t.x, y: t.y },
      cols: ((u = s == null ? void 0 : s.gridSettings) == null ? void 0 : u.columns) || t.cols || 12,
      maxRows: ((l = s == null ? void 0 : s.gridSettings) == null ? void 0 : l.maxRows) || 1 / 0,
      list: t.list,
      source: t.source,
      placementIntent: c,
      placementAnchor: c === "here" ? "top-left" : void 0
    };
    return se(a, {
      type: "paste",
      payload: i
    }, {
      source: o.source || "api",
      position: t,
      contextExtra: { placementIntent: c }
    });
  }, he = (t) => {
    var o;
    return (o = e.widgetAdapter) != null && o[t] ? (a) => {
      var s, c;
      return (c = (s = e.widgetAdapter) == null ? void 0 : s[t]) == null ? void 0 : c.call(s, a);
    } : void 0;
  }, Ie = (mt = e.widgetAdapter) != null && mt.commit ? (t, o) => {
    var a, s;
    return (s = (a = e.widgetAdapter) == null ? void 0 : a.commit) == null ? void 0 : s.call(a, t, o);
  } : void 0, be = (ft = e.widgetAdapter) != null && ft.rollback ? (t, o) => {
    var a, s;
    return (s = (a = e.widgetAdapter) == null ? void 0 : a.rollback) == null ? void 0 : s.call(a, t, o);
  } : void 0, nt = (t) => {
    var o;
    return (o = e.referenceAdapter) != null && o[t] ? (a) => {
      var s, c;
      return (c = (s = e.referenceAdapter) == null ? void 0 : s[t]) == null ? void 0 : c.call(s, a);
    } : void 0;
  }, ct = (gt = e.referenceAdapter) != null && gt.commit ? (t, o) => {
    var a, s;
    return (s = (a = e.referenceAdapter) == null ? void 0 : a.commit) == null ? void 0 : s.call(a, t, o);
  } : void 0, rt = (yt = e.referenceAdapter) != null && yt.rollback ? (t, o) => {
    var a, s;
    return (s = (a = e.referenceAdapter) == null ? void 0 : a.rollback) == null ? void 0 : s.call(a, t, o);
  } : void 0, it = (t) => t === !0 ? null : t === !1 ? { ok: !1, status: "cancelled", reason: "confirm-cancelled" } : "available" in t ? t.available ? null : { ok: !1, status: "cancelled", reason: t.reason || "confirm-cancelled", diagnostics: t.diagnostics } : t.ok ? null : t, dt = (t, o) => {
    E.set(t.id, {
      ...o,
      itemIds: t.items.map((a) => a.i),
      baseLayout: ke(t.baseLayout)
    });
  }, lt = (t) => {
    var c, i;
    const o = (i = (c = t.diagnostics) == null ? void 0 : c.computed) == null ? void 0 : i.placement, a = o == null ? void 0 : o.sessionId;
    if (!a) return null;
    const s = E.get(a);
    return s && o ? { pending: s, placement: o } : null;
  }, Ht = (t, o, a) => {
    var y, p;
    const s = (o == null ? void 0 : o.actionType) || "place-clipboard", c = (o == null ? void 0 : o.actionId) || K(s), i = Te(t, c, s, a), u = ye(
      (p = (y = t.diagnostics) == null ? void 0 : y.computed) == null ? void 0 : p.placement,
      c,
      s,
      a
    ), l = t.status === "changed" ? "success" : t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : t.status === "blocked" ? "blocked" : "noop", m = t.blocked ? [V(
      `shell-command-${t.blocked.reason}`,
      "warning",
      t.blocked.message || `Editor command was blocked: ${t.blocked.reason}.`,
      { actionId: c, actionType: s, source: a, reason: t.blocked.reason, itemIds: t.blocked.itemIds, recoverable: !0 }
    )].concat(u) : u, f = Y({
      ok: l === "success" || l === "noop",
      status: l,
      actionId: c,
      actionType: s,
      source: a,
      itemIds: t.targetIds,
      affectedIds: t.affectedIds,
      position: o == null ? void 0 : o.position,
      commandResult: t,
      patches: t.layoutPatches,
      placement: i,
      data: xe(o == null ? void 0 : o.data, i),
      diagnostics: m
    });
    return N(M, f, C()), f;
  }, ut = async (t) => {
    var u;
    const o = lt(t), a = o == null ? void 0 : o.placement.sessionId;
    if (!o || !a) return null;
    const s = A.get(t.id);
    if (s) return s;
    if (t.status === "blocked" && ((u = t.blocked) == null ? void 0 : u.reason) !== "stale-command") return null;
    const { pending: c } = o;
    E.delete(a);
    const i = ae(async () => {
      var v, $, P;
      const l = S(), m = k(), f = q.get(t.id) || c.rollbackCheckpoint;
      q.delete(t.id);
      const y = Te(t, c.actionId, c.actionType, c.source), p = ye(
        ($ = (v = t.diagnostics) == null ? void 0 : v.computed) == null ? void 0 : $.placement,
        c.actionId,
        c.actionType,
        c.source
      ), x = me(
        c.actionId,
        c.actionType,
        c.source,
        c.itemIds,
        c.position,
        c.contextExtra
      ), w = await Ge({
        actionId: c.actionId,
        actionType: c.actionType,
        source: c.source,
        itemIds: c.itemIds,
        position: c.position,
        context: x,
        profile: C(),
        emit: M,
        prepare: c.prepare,
        mutate: () => {
          if (t.status === "blocked" || t.status === "cancelled" || t.status === "timeout" || t.status === "error")
            return {
              status: t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : "blocked",
              commandResult: t,
              affectedIds: t.affectedIds,
              diagnostics: p,
              placement: y,
              data: xe(c.data, y)
            };
          const U = m ? De(m, t) : [], H = Me({
            actionId: c.actionId,
            actionType: c.actionType,
            source: c.source,
            result: t,
            nextLayout: m ? U : null,
            removeMissingItems: t.type === "delete",
            rollbackCheckpoint: f,
            rollbackReason: "shell-placement-write-back-rollback",
            data: c.data
          });
          return {
            status: H.status,
            commandResult: t,
            writeResult: H.writeResult,
            proposedDocument: H.proposedDocument,
            affectedIds: H.affectedIds,
            patches: H.patches,
            placement: H.placement || y,
            data: H.data,
            diagnostics: H.diagnostics.length ? H.diagnostics : p
          };
        },
        commit: c.commit,
        rollback: c.rollback
      });
      if (!w.ok && t.status === "changed" && l && (f ? l.restoreRollbackCheckpoint(f, "shell-placement-transaction-rollback") : l.setExternalLayout(c.baseLayout, "shell-placement-transaction-rollback")), w.ok && w.proposedDocument && ((P = w.writeResult) == null ? void 0 : P.ok) !== !1) {
        const U = k();
        U && w.commandResult && Ke(
          De(U, w.commandResult),
          w.status,
          w.writeResult
        ), Re(w.proposedDocument), ve(c.actionId, w.proposedDocument, k());
      }
      return w;
    });
    return A.set(t.id, i), i.finally(() => {
      A.get(t.id) === i && A.delete(t.id);
    }), i;
  }, L = {
    getEventGridPosition: (t, o = {}) => fe(t, o),
    pasteAtEvent: async (t, o = {}) => {
      const a = fe(t, o);
      return a.ok ? (r.value = { ...r.value, lastPointerPosition: a.position }, st(a.position, o, "paste")) : W("paste", o.source || "api", a.reason, [], a.diagnostics);
    },
    pasteAtGridPosition: async (t, o = {}) => {
      const a = We(t, o);
      return a.ok ? st(a.position, o, "paste") : W("paste", o.source || "api", a.reason, [], a.diagnostics);
    },
    selectItem: async (t, o = {}) => se("select", {
      type: "select",
      targetIds: [t],
      payload: { ids: [t] }
    }, {
      source: o.source || "api",
      itemIds: [t]
    }),
    highlightItem: (t, o = {}) => {
      const a = K("highlight"), s = k(), c = r.value.highlightedId;
      if (!(s != null && s.allItemIds.includes(t)))
        return W("highlight", o.source || "api", "missing-item", [t], [], a);
      b && clearTimeout(b), r.value = { ...r.value, highlightedId: t }, M({
        type: "highlight-change",
        actionId: a,
        itemId: t,
        previous: c,
        profile: C()
      }), o.durationMs && o.durationMs > 0 && (b = setTimeout(() => {
        L.resetHighlight();
      }, o.durationMs));
      const i = Y({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "highlight",
        source: o.source || "api",
        itemIds: [t],
        affectedIds: [t],
        diagnostics: []
      });
      return N(M, i, C()), o.scroll && L.scrollToItem(t, o), i;
    },
    resetHighlight: () => {
      const t = K("reset-highlight"), o = r.value.highlightedId;
      b && (clearTimeout(b), b = null), r.value = { ...r.value, highlightedId: null }, M({
        type: "highlight-change",
        actionId: t,
        itemId: null,
        previous: o,
        profile: C()
      });
      const a = Y({
        ok: !0,
        status: o ? "success" : "noop",
        actionId: t,
        actionType: "reset-highlight",
        source: "api",
        itemIds: o ? [o] : [],
        affectedIds: o ? [o] : [],
        diagnostics: []
      });
      return N(M, a, C()), a;
    },
    scrollToItem: async (t, o = {}) => {
      var y;
      const a = K("scroll-to-item"), s = k(), c = o.source || "api";
      if (!(s != null && s.allItemIds.includes(t)))
        return W("scroll-to-item", c, "missing-item", [t], [], a);
      if (s.hiddenItemIds.includes(t) || !s.renderItemIds.includes(t)) {
        const p = W("scroll-to-item", c, "hidden", [t], [], a);
        return M({
          type: "action-result",
          actionId: a,
          actionType: "scroll-to-item",
          source: c,
          status: "blocked",
          ok: !1,
          itemIds: [t],
          affectedIds: [],
          profile: C(),
          diagnostics: p.diagnostics
        }), p;
      }
      const i = T();
      if (!i || typeof i.querySelector != "function")
        return W("scroll-to-item", c, "missing-grid-element", [t], [], a);
      const u = typeof o.selector == "function" ? o.selector(t) : o.selector || `[data-grid-id="${$e(t)}"],[data-grid-item-id="${$e(t)}"],[data-i="${$e(t)}"],[data-id="${$e(t)}"]`, l = i.querySelector(u);
      if (!l)
        return W("scroll-to-item", c, "dom-unavailable", [t], [], a);
      const m = await ((y = e.scrollAdapter) == null ? void 0 : y.call(e, {
        itemId: t,
        itemElement: l,
        gridElement: i,
        options: o,
        runtime: s
      }));
      if (m && !m.available)
        return W("scroll-to-item", c, m.reason || "dom-unavailable", [t], m.diagnostics || [], a);
      typeof l.scrollIntoView == "function" && l.scrollIntoView({
        behavior: o.behavior || "smooth",
        block: o.block || "nearest",
        inline: o.inline || "nearest"
      });
      const f = Y({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "scroll-to-item",
        source: c,
        itemIds: [t],
        affectedIds: [t],
        diagnostics: []
      });
      return N(M, f, C()), f;
    },
    prepareDashboardContextMenu: (t, o = {}) => {
      var f, y;
      const a = fe(t || null, { source: o.source || "context-menu" }), s = a.ok ? a.position : void 0, c = fo(t || null) && (s == null ? void 0 : s.source) === "event";
      s && (r.value = { ...r.value, lastMenuPosition: s });
      const i = K("prepare-dashboard-menu"), u = k(), l = S(), m = ro({
        id: i,
        target: { type: "dashboard", position: s },
        position: s,
        context: {
          target: { type: "dashboard", position: s },
          runtime: u,
          mode: r.value.mode,
          readonly: r.value.mode !== "edit",
          editor: l
        },
        actions: L,
        options: e.menu,
        customItems: o.customItems,
        includeHidden: o.includeHidden,
        explicitPlacementTarget: c,
        referenceAvailable: !!((f = e.referenceAdapter) != null && f.preparePasteReference),
        paletteAvailable: !!((y = e.palette) != null && y.open),
        diagnostics: (a.ok, a.diagnostics)
      });
      return r.value = { ...r.value, menu: m }, M({ type: "menu-change", actionId: i, menu: m, profile: C() }), m;
    },
    prepareWidgetContextMenu: (t, o, a = {}) => {
      var p;
      const s = fe(t || null, { source: a.source || "context-menu", activeItemId: o }), c = s.ok ? s.position : void 0;
      c && (r.value = { ...r.value, lastMenuPosition: c });
      const i = K("prepare-widget-menu"), u = k(), l = S(), m = l == null ? void 0 : l.editorMetaById.value[o], f = { type: "widget", itemId: o, position: c }, y = io({
        id: i,
        target: f,
        itemId: o,
        hiddenItem: (u == null ? void 0 : u.hiddenItemIds.includes(o)) || (m == null ? void 0 : m.visible) === !1,
        lockedItem: (m == null ? void 0 : m.locked) === !0 || ((p = u == null ? void 0 : u.layout.find((x) => x.i === o)) == null ? void 0 : p.static) === !0,
        position: c,
        context: {
          target: f,
          runtime: u,
          mode: r.value.mode,
          readonly: r.value.mode !== "edit",
          editor: l
        },
        actions: L,
        options: e.menu,
        customItems: a.customItems,
        includeHidden: a.includeHidden,
        referenceAvailable: !!e.referenceAdapter,
        diagnostics: (s.ok, s.diagnostics)
      });
      return r.value = { ...r.value, menu: y }, M({ type: "menu-change", actionId: i, menu: y, profile: C() }), y;
    },
    closeMenu: (t = "close") => {
      const o = K("close-menu");
      r.value = { ...r.value, menu: null, lastMenuPosition: null }, M({ type: "menu-change", actionId: o, menu: null, reason: t, profile: C() });
    },
    copyWidget: async (t, o = {}) => {
      var y, p, x;
      const a = Be(t), s = a.length ? a : ((y = S()) == null ? void 0 : y.selection.value.selectedIds) || [], c = K("copy-widget"), i = o.source || "api";
      ne();
      const u = e.widgetAdapter, l = k(), m = me(c, "copy-widget", i, s), f = u != null && u.copyWidget ? await u.copyWidget(m) : u ? void 0 : {
        ok: !0,
        diagnostics: [V(
          "shell-widget-payload-unhandled",
          "info",
          "Widget adapter was not provided; copied layout/editor metadata only.",
          { actionId: c, actionType: "copy-widget", source: i, reason: "adapter-unavailable", recoverable: !0 }
        )]
      };
      return se("copy-widget", {
        type: "copy",
        targetIds: s,
        payload: {
          cols: (p = l == null ? void 0 : l.gridSettings) == null ? void 0 : p.columns,
          maxRows: (x = l == null ? void 0 : l.gridSettings) == null ? void 0 : x.maxRows,
          breakpoint: l == null ? void 0 : l.requestedBreakpoint,
          layoutId: l == null ? void 0 : l.layoutId,
          viewFormat: l == null ? void 0 : l.viewFormat
        }
      }, {
        source: i,
        itemIds: s,
        data: f,
        contextExtra: { payload: f },
        prepare: async (w) => {
          const v = await Ae(w);
          return v || ((f == null ? void 0 : f.ok) === !1 ? f : null);
        }
      });
    },
    cutWidget: async (t, o = {}) => {
      var f;
      const a = Be(t), s = a.length ? a : ((f = S()) == null ? void 0 : f.selection.value.selectedIds) || [], c = K("cut-widget"), i = o.source || "api";
      if (ne(), s.length === 0)
        return W("cut-widget", i, "selection-count", [], [], c);
      const u = await L.copyWidget(s, { source: i });
      if (!u.ok) return u;
      const l = he("prepareRemoveWidget"), m = await se("cut-widget", {
        id: c,
        type: "delete",
        targetIds: s
      }, {
        source: i,
        itemIds: s,
        data: { clipboardActionId: u.actionId },
        prepare: async (y) => {
          if (!o.skipConfirm && e.confirm) {
            const p = await e.confirm(y), x = it(p);
            if (x) return x;
          }
          return (l == null ? void 0 : l(y)) || null;
        },
        commit: Ie,
        rollback: be
      });
      return m.ok && I(c, s), m;
    },
    placeClipboard: async (t, o = {}) => {
      var y, p, x, w, v, $, P;
      const a = S(), s = o.source || "api", c = K("place-clipboard");
      if (ne(), !a) return W("place-clipboard", s, "missing-editor");
      const i = Ee(t, o), u = i === "auto" ? at() : "cursor", l = Se(o, u), m = pe(t || null, o, u);
      if (!m.ok) return W("place-clipboard", s, m.reason, [], m.diagnostics);
      const f = await a.beginPlacement({
        source: "paste",
        commandType: "paste",
        strategy: l,
        ...Ce(o),
        placementIntent: i,
        placementAnchor: i === "here" ? "top-left" : void 0,
        cursor: m.position.source !== "none" ? {
          x: m.position.x,
          y: m.position.y,
          source: m.position.source === "event" ? "menu" : "api",
          clientX: m.position.clientX,
          clientY: m.position.clientY
        } : void 0,
        cols: ((p = (y = k()) == null ? void 0 : y.gridSettings) == null ? void 0 : p.columns) || m.position.cols || 12,
        maxRows: O((w = (x = k()) == null ? void 0 : x.gridSettings) == null ? void 0 : w.maxRows) ? ((v = k()) == null ? void 0 : v.gridSettings).maxRows : 1 / 0,
        origin: "dashboard-editor-shell"
      });
      return f.session ? (dt(f.session, {
        actionId: c,
        actionType: "place-clipboard",
        source: s,
        position: m.position,
        prepare: he("preparePasteWidget"),
        commit: Ie,
        rollback: be,
        contextExtra: { placementIntent: i }
      }), tt("place-clipboard", s, f.session, m.position, c)) : W(
        "place-clipboard",
        s,
        (($ = f.blocked) == null ? void 0 : $.reason) || "clipboard-unavailable",
        ((P = f.blocked) == null ? void 0 : P.itemIds) || [],
        [],
        c
      );
    },
    commitPlacement: async (t = {}) => {
      var m, f;
      const o = S(), a = t.source || "api";
      if (!o) return W("place-clipboard", a, "missing-editor");
      const s = (m = o.placementSession.value) == null ? void 0 : m.id, c = s && E.get(s) || null;
      c && (c.rollbackCheckpoint = o.createRollbackCheckpoint("shell-placement-write-back"));
      const i = await o.commitPlacement({
        source: Ue(a),
        autoCancelOnBlocked: t.autoCancelOnBlocked
      }), u = await ut(i);
      if (u) return u;
      const l = ((f = lt(i)) == null ? void 0 : f.pending) || c;
      return Ht(i, l || null, a);
    },
    pasteWidget: async (t, o = {}) => {
      var m, f, y, p, x;
      const a = j();
      if (o.placementMode === "interactive")
        return L.placeClipboard(t, o);
      if ((a == null ? void 0 : a.mode) === "interactive" && !t)
        return L.placeClipboard(t, {
          ...o,
          strategy: o.strategy || "cursor",
          placementIntent: o.placementIntent || "here",
          placementMode: "interactive"
        });
      const s = Ee(t, o), c = s === "auto" ? at() : "cursor", i = Se(o, c), u = pe(t, o, c);
      if (!u.ok) return W("paste-widget", o.source || "api", u.reason, [], u.diagnostics);
      const l = he("preparePasteWidget");
      return se("paste-widget", {
        type: "paste",
        payload: {
          strategy: i,
          ...Ce(o),
          cursor: { x: u.position.x, y: u.position.y },
          cols: ((f = (m = k()) == null ? void 0 : m.gridSettings) == null ? void 0 : f.columns) || u.position.cols || 12,
          maxRows: O((p = (y = k()) == null ? void 0 : y.gridSettings) == null ? void 0 : p.maxRows) ? ((x = k()) == null ? void 0 : x.gridSettings).maxRows : 1 / 0,
          list: u.position.list,
          source: u.position.source,
          placementIntent: s,
          placementAnchor: s === "here" ? "top-left" : void 0
        }
      }, {
        source: o.source || "api",
        position: u.position,
        contextExtra: { placementIntent: s },
        prepare: l,
        commit: Ie,
        rollback: be
      });
    },
    duplicateWidget: async (t, o = {}) => {
      var i, u, l;
      const a = Be(t), s = a.length ? a : ((i = S()) == null ? void 0 : i.selection.value.selectedIds) || [], c = he("prepareDuplicateWidget");
      return se("duplicate-widget", {
        type: "duplicate",
        targetIds: s,
        payload: { strategy: "nearest-fit", cols: ((l = (u = k()) == null ? void 0 : u.gridSettings) == null ? void 0 : l.columns) || 12 }
      }, {
        source: o.source || "api",
        itemIds: s,
        prepare: c,
        commit: Ie,
        rollback: be
      });
    },
    removeWidget: async (t, o = {}) => {
      var u;
      const a = Be(t), s = a.length ? a : ((u = S()) == null ? void 0 : u.selection.value.selectedIds) || [], c = o.source || "api", i = he("prepareRemoveWidget");
      return se("remove-widget", {
        type: "delete",
        targetIds: s
      }, {
        source: c,
        itemIds: s,
        prepare: async (l) => {
          if (!o.skipConfirm && e.confirm) {
            const m = await e.confirm(l), f = it(m);
            if (f) return f;
          }
          return (i == null ? void 0 : i(l)) || null;
        },
        commit: Ie,
        rollback: be
      });
    },
    copyWidgetReference: async (t, o = {}) => {
      const a = K("copy-reference"), s = o.source || "api", c = e.referenceAdapter;
      if (!(c != null && c.copyReference))
        return W("copy-reference", s, "adapter-unavailable", [t], [], a);
      const i = me(a, "copy-reference", s, [t]), u = c.canCopyReference ? await c.canCopyReference(i) : { available: !0 };
      if (!u.available)
        return W("copy-reference", s, u.reason || "adapter-unavailable", [t], u.diagnostics || [], a);
      const l = await c.copyReference(i), m = Y({
        ok: l.ok,
        status: l.ok ? "success" : l.status || "blocked",
        actionId: a,
        actionType: "copy-reference",
        source: s,
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
      return N(M, m, C()), m;
    },
    pasteWidgetReference: async (t, o = {}) => {
      var i, u, l, m, f, y, p;
      if (!((i = e.referenceAdapter) != null && i.preparePasteReference))
        return W("paste-reference", o.source || "api", "adapter-unavailable");
      const a = Ee(t, o), s = Se(o, "cursor"), c = pe(t, o, "cursor");
      return c.ok ? se("paste-reference", {
        type: "add",
        payload: {
          item: { i: `reference-${Date.now().toString(36)}`, x: c.position.x, y: c.position.y, w: ((u = o.itemSize) == null ? void 0 : u.w) || 2, h: ((l = o.itemSize) == null ? void 0 : l.h) || 2 },
          strategy: s,
          cursor: { x: c.position.x, y: c.position.y },
          cols: ((f = (m = k()) == null ? void 0 : m.gridSettings) == null ? void 0 : f.columns) || 12,
          maxRows: ((p = (y = k()) == null ? void 0 : y.gridSettings) == null ? void 0 : p.maxRows) || 1 / 0,
          list: c.position.list,
          placementIntent: a,
          placementAnchor: a === "here" ? "top-left" : void 0
        }
      }, {
        source: o.source || "api",
        position: c.position,
        contextExtra: { placementIntent: a },
        prepare: async (x) => {
          var v, $;
          const w = await ((v = nt("preparePasteReference")) == null ? void 0 : v(x));
          return w && "kind" in w && (($ = w.newIds) != null && $[0]) && (x.payload = { itemId: w.newIds[0] }), w;
        },
        commit: ct,
        rollback: rt
      }) : W("paste-reference", o.source || "api", c.reason, [], c.diagnostics);
    },
    replaceReferenceWithWidgetCopy: async (t, o = {}) => {
      var i;
      if (!((i = e.referenceAdapter) != null && i.prepareReplaceReferenceWithWidgetCopy))
        return W("replace-reference", o.source || "api", "adapter-unavailable", [t]);
      const a = o.source || "api", s = K("replace-reference"), c = me(s, "replace-reference", a, [t]);
      return Ge({
        actionId: s,
        actionType: "replace-reference",
        source: a,
        itemIds: [t],
        context: c,
        profile: C(),
        emit: M,
        prepare: nt("prepareReplaceReferenceWithWidgetCopy"),
        mutate: (u) => {
          var l, m;
          return {
            status: "success",
            affectedIds: (l = u == null ? void 0 : u.newIds) != null && l.length ? u.newIds : [t],
            data: { sourceItemId: t, newItemId: (m = u == null ? void 0 : u.newIds) == null ? void 0 : m[0] }
          };
        },
        commit: ct,
        rollback: rt
      });
    },
    openWidgetPalette: async (t, o = {}) => {
      var p;
      const a = K("open-palette"), s = o.source || "api";
      if (!((p = e.palette) != null && p.open))
        return W("open-palette", s, "adapter-unavailable", [], [], a);
      const c = Ee(t, o), i = pe(t, o, "cursor"), u = me(a, "open-palette", s, [], i.ok ? i.position : void 0, { placementIntent: c }), l = await Ae(u);
      if (l)
        return W("open-palette", s, l.reason || "guard-blocked", [], l.diagnostics || [], a);
      const m = await e.palette.open(u);
      if (m && typeof m == "object" && "ok" in m && !m.ok)
        return W("open-palette", s, m.reason || "adapter-rejected", [], m.diagnostics || [], a);
      const f = Array.isArray(m) ? m : m && typeof m == "object" && !("ok" in m) ? [m] : [];
      if (f.length && o.autoAddReturnedTemplate !== !1)
        return L.addWidgetFromTemplate(f[0], i.ok ? i.position : null, {
          source: "palette",
          strategy: o.strategy,
          placementIntent: c,
          placementMode: o.placementMode
        });
      const y = Y({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "open-palette",
        source: s,
        itemIds: [],
        affectedIds: [],
        position: i.ok ? i.position : void 0,
        data: m,
        diagnostics: (i.ok, i.diagnostics)
      });
      return N(M, y, C()), y;
    },
    addWidgetFromTemplate: async (t, o, a = {}) => {
      var l, m, f, y, p, x, w, v, $, P, U;
      const s = Ee(o, a), c = Se(a, "cursor"), i = pe(o, { ...a, itemSize: { w: t.w || 2, h: t.h || 2 } }, "cursor");
      if (!i.ok) return W("add-widget", a.source || "api", i.reason, [], i.diagnostics);
      if (a.placementMode === "interactive") {
        const H = S(), D = a.source || "api", Pe = K("add-widget");
        if (!H) return W("add-widget", D, "missing-editor");
        const de = await H.beginPlacement({
          source: "template",
          commandType: "add",
          items: [{
            ...t,
            i: t.i || t.id,
            x: O(t.x) ? t.x : i.position.x,
            y: O(t.y) ? t.y : i.position.y,
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
          ...Ce(a),
          placementIntent: s,
          placementAnchor: s === "here" ? "top-left" : void 0,
          cursor: {
            x: i.position.x,
            y: i.position.y,
            source: i.position.source === "event" ? "menu" : "api",
            clientX: i.position.clientX,
            clientY: i.position.clientY
          },
          cols: ((m = (l = k()) == null ? void 0 : l.gridSettings) == null ? void 0 : m.columns) || i.position.cols || 12,
          maxRows: O((y = (f = k()) == null ? void 0 : f.gridSettings) == null ? void 0 : y.maxRows) ? ((p = k()) == null ? void 0 : p.gridSettings).maxRows : 1 / 0,
          origin: "dashboard-editor-shell"
        });
        return de.session ? (dt(de.session, {
          actionId: Pe,
          actionType: "add-widget",
          source: D,
          position: i.position,
          contextExtra: { placementIntent: s, template: t }
        }), tt("add-widget", D, de.session, i.position, Pe)) : W("add-widget", D, ((x = de.blocked) == null ? void 0 : x.reason) || "invalid-input", ((w = de.blocked) == null ? void 0 : w.itemIds) || []);
      }
      const u = he("prepareAddWidget");
      return se("add-widget", {
        type: "add",
        payload: {
          item: {
            ...t,
            i: t.i || t.id,
            x: O(t.x) ? t.x : i.position.x,
            y: O(t.y) ? t.y : i.position.y,
            w: t.w || 2,
            h: t.h || 2
          },
          strategy: c,
          ...Ce(a),
          cursor: { x: i.position.x, y: i.position.y },
          cols: (($ = (v = k()) == null ? void 0 : v.gridSettings) == null ? void 0 : $.columns) || 12,
          maxRows: ((U = (P = k()) == null ? void 0 : P.gridSettings) == null ? void 0 : U.maxRows) || 1 / 0,
          list: i.position.list,
          placementIntent: s,
          placementAnchor: s === "here" ? "top-left" : void 0
        }
      }, {
        source: a.source || "api",
        position: i.position,
        contextExtra: { template: t, payload: t.payload, placementIntent: s },
        prepare: u,
        commit: Ie,
        rollback: be
      }).then((H) => {
        const D = H.affectedIds[0];
        return H.ok && D && (L.selectItem(D, { source: a.source || "api" }), L.highlightItem(D, { source: a.source || "api", durationMs: 1200 })), H;
      });
    },
    handleExternalDrop: async (t, o, a = {}) => {
      const s = fe(o, { source: "drop" });
      if (!s.ok) return W("external-drop", "drop", s.reason, [], s.diagnostics);
      if (t.preview) {
        const c = Y({
          ok: !0,
          status: "success",
          actionId: K("external-drop"),
          actionType: "external-drop",
          source: "drop",
          itemIds: [],
          affectedIds: [],
          position: s.position,
          data: { preview: !0, payload: t.metadata },
          diagnostics: s.diagnostics
        });
        return N(M, c, C()), c;
      }
      return L.addWidgetFromTemplate(t.template || { w: 2, h: 2, payload: t.payload }, s.position, {
        source: a.source || "drop",
        strategy: a.strategy
      });
    },
    moveAllWidgets: async (t, o, a = {}) => {
      var f, y;
      const s = K("move-all"), c = a.source || "api", i = k(), u = X();
      if (!i) return W("move-all", c, "missing-runtime", [], [], s);
      if (!O(t) || !O(o))
        return W("move-all", c, "invalid-input", [], [], s);
      const l = me(s, "move-all", c, i.activeItemIds), m = await Ae(l);
      if (m) return W("move-all", c, m.reason || "guard-blocked", i.activeItemIds, m.diagnostics || [], s);
      if (u) {
        const p = qt(u, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId,
          dx: t,
          dy: o,
          clampNegative: a.clampNegative !== !1,
          policy: a.repair,
          createMissingProfile: e.createMissingProfileOnEdit
        }), x = p.diagnostics.map(
          (v) => V(
            v.code,
            v.level,
            v.message,
            {
              actionId: s,
              actionType: "move-all",
              source: c,
              itemId: v.itemId,
              layoutId: v.layoutId || i.layoutId,
              resolvedProfileId: v.profileId || i.resolvedProfileId,
              targetView: v.targetView || i.targetView,
              path: v.path,
              details: v.details
            }
          )
        );
        p.ok && (Re(p.document), ve(s, p.document, i));
        const w = Y({
          ok: p.ok,
          status: p.ok ? p.operation.status === "noop" ? "noop" : "success" : "blocked",
          actionId: s,
          actionType: "move-all",
          source: c,
          itemIds: i.activeItemIds,
          affectedIds: ((f = p.operation) == null ? void 0 : f.affectedIds) || i.activeItemIds,
          writeResult: p.ok ? { ok: !0, document: p.document, diagnostics: p.diagnostics } : { ok: !1, document: p.document, error: p.error, diagnostics: p.diagnostics },
          proposedDocument: p.document,
          patches: (y = p.operation) == null ? void 0 : y.patches,
          data: {
            requestedDelta: { dx: t, dy: o },
            operation: p.operation
          },
          diagnostics: x
        });
        return N(M, w, C()), w;
      }
      return se("move-all", {
        type: "move",
        targetIds: i.activeItemIds,
        payload: { dx: t, dy: o, cols: i.gridSettings.columns }
      }, {
        source: c,
        itemIds: i.activeItemIds
      });
    },
    undo: async (t = {}) => ot("undo", t),
    redo: async (t = {}) => ot("redo", t),
    bindKeyboard: (t) => {
      const o = e.keyboard && typeof e.keyboard == "object" ? e.keyboard : {}, a = t || o.target || (typeof window != "undefined" ? window : null), s = typeof a == "string" && typeof document != "undefined" ? document.querySelector(a) || window : a;
      if (!s || typeof s.addEventListener != "function")
        return () => {
        };
      const c = (u) => {
        var $;
        const l = u;
        if (ho(l, o)) return;
        const m = Io(o.platform), y = (o.shortcuts || bo).find((P) => ko(l, P, m));
        if (!y) return;
        l.preventDefault(), l.stopPropagation(), l.stopImmediatePropagation();
        const p = y.source || "keyboard", x = (($ = S()) == null ? void 0 : $.selection.value.selectedIds) || [], w = (P = {}) => wo(o, y, P, p);
        (async () => {
          var P, U;
          if (y.action === "copy-widget")
            return L.copyWidget(x, { source: p });
          if (y.action === "cut-widget")
            return L.cutWidget(x, { source: p });
          if (y.action === "copy-reference")
            return x[0] ? L.copyWidgetReference(x[0], { source: p }) : W("copy-reference", p, "selection-count");
          if (y.action === "paste-widget" || y.action === "paste")
            return L.pasteWidget(null, w());
          if (y.action === "place-clipboard")
            return L.placeClipboard(null, w({
              strategy: "cursor",
              placementIntent: "here",
              placementMode: "interactive"
            }));
          if (y.action === "paste-reference")
            return L.pasteWidgetReference(null, w({
              strategy: (P = e.menu) == null ? void 0 : P.defaultReferencePasteStrategy
            }));
          if (y.action === "remove-widget") return L.removeWidget(x, { source: p });
          if (y.action === "undo") return L.undo({ source: p });
          if (y.action === "redo") return L.redo({ source: p });
          if (y.action === "open-palette")
            return L.openWidgetPalette(null, w({
              strategy: (U = e.menu) == null ? void 0 : U.defaultAddStrategy
            }));
          if (y.action === "prepare-dashboard-menu")
            return L.prepareDashboardContextMenu(null, { source: p }), null;
          if (y.action === "move-all") {
            const H = o.moveAllStep || { dx: 0, dy: 1 };
            return L.moveAllWidgets(H.dx, H.dy, { source: p });
          }
          return null;
        })().then((P) => {
          var U, H, D;
          P && !P.ok && ((D = e.onMessage) == null || D.call(e, {
            code: ((U = P.diagnostics[0]) == null ? void 0 : U.code) || P.status,
            level: P.status === "error" ? "error" : "warning",
            message: ((H = P.diagnostics[0]) == null ? void 0 : H.message) || `Action ${P.actionType} was not applied.`,
            itemIds: P.itemIds,
            recoverable: P.status !== "error"
          }));
        });
      };
      s.addEventListener("keydown", c, !0);
      const i = () => s.removeEventListener("keydown", c, !0);
      return g.push(i), i;
    },
    stop: () => Xe()
  }, zt = (t) => {
    if (!t || typeof t.addEventListener != "function") return () => {
    };
    const o = (a) => {
      const s = fe(a, { source: "pointer" });
      s.ok && (r.value = { ...r.value, lastPointerPosition: s.position });
    };
    return t.addEventListener("pointermove", o), t.addEventListener("mousemove", o), t.addEventListener("contextmenu", o), () => {
      t.removeEventListener("pointermove", o), t.removeEventListener("mousemove", o), t.removeEventListener("contextmenu", o);
    };
  };
  d.push(Fe(
    () => {
      var t, o, a, s;
      return [
        k(),
        (t = S()) == null ? void 0 : t.selection.value,
        (o = S()) == null ? void 0 : o.dirty.value,
        (a = S()) == null ? void 0 : a.conflict.value,
        (s = S()) == null ? void 0 : s.lastResult.value,
        ge(e.mode),
        T()
      ];
    },
    et,
    { deep: !0, immediate: !0 }
  )), d.push(Fe(
    () => {
      var t;
      return (t = S()) == null ? void 0 : t.lastResult.value;
    },
    (t) => {
      t && ut(t);
    }
  ));
  let ce = null;
  const Kt = (t) => {
    if (_()) {
      if (t.type === "command-start") {
        if (z.has(t.command.id || "") || !Qe(t.command)) return;
        const o = S();
        o && t.command.id && q.set(
          t.command.id,
          o.createRollbackCheckpoint("shell-managed-command-start")
        );
        return;
      }
      if (t.type === "command-blocked" || t.type === "command-error") {
        if (z.has(t.result.id)) {
          q.delete(t.result.id);
          return;
        }
        $t(t.command, t.result);
        return;
      }
      if (t.type === "command-commit") {
        if (z.has(t.result.id)) return;
        Bt(t.command, t.result);
      }
    }
  };
  d.push(Fe(
    () => S(),
    (t) => {
      ce == null || ce(), ce = null, t && (ce = t.subscribe(Kt));
    },
    { immediate: !0 }
  ));
  let ie = null;
  d.push(Fe(
    () => T(),
    (t) => {
      ie == null || ie(), ie = zt(t);
    },
    { immediate: !0 }
  )), e.keyboard && e.keyboard.enabled !== !1 && g.push(L.bindKeyboard());
  const Xe = () => {
    if (h) return;
    h = !0, d.forEach((a) => a()), g.splice(0).forEach((a) => a()), ce == null || ce(), ce = null, ie == null || ie(), ie = null, b && (clearTimeout(b), b = null);
    const t = K("cleanup");
    r.value = {
      ...r.value,
      menu: null,
      highlightedId: null,
      lastMenuPosition: null
    };
    const o = [V(
      "shell-cleanup",
      "info",
      "Dashboard editor shell cleanup completed.",
      { actionId: t, actionType: "cleanup", source: "lifecycle" }
    )];
    M({ type: "cleanup", actionId: t, diagnostics: o });
  };
  return Vt() && Yt(Xe), et(), {
    state: Nt(r),
    actions: L,
    stop: Xe
  };
}
export {
  ro as buildDashboardContextMenu,
  io as buildWidgetContextMenu,
  K as createDashboardEditorShellActionId,
  V as createDashboardEditorShellDiagnostic,
  Y as createDashboardEditorShellResult,
  Ze as diagnosticFromUnknownError,
  N as emitShellResult,
  ao as getEventGridPosition,
  so as profileContextFromRuntime,
  Je as resolveShellPosition,
  Ge as runDashboardEditorShellTransaction,
  we as stableDiagnostics,
  So as useDashboardEditorShell
};
