import { f as Yt } from "./resolve-C3SqJijI.mjs";
import { ref as vt, unref as he, watch as Le, getCurrentInstance as Nt, onBeforeUnmount as qt, readonly as Gt } from "vue";
import { deepEqual as Ye } from "fast-equals";
import { t as Ut, w as Qt } from "./dashboard-migration-BYf61Hth.mjs";
import { g as Jt } from "./commands-BQlR3l-u.mjs";
const U = (e) => typeof e == "number" && Number.isFinite(e), xt = (e, n) => {
  if (typeof e == "number" && Number.isFinite(e)) return [e, e];
  if (Array.isArray(e)) {
    const r = typeof e[0] == "number" && Number.isFinite(e[0]) ? e[0] : n[0], d = typeof e[1] == "number" && Number.isFinite(e[1]) ? e[1] : n[1];
    return [r, d];
  }
  return n;
}, Ct = (e, n, r, d = {}) => ({
  code: e,
  level: n,
  message: r,
  ...d
}), Rt = (e, n = []) => ({
  ok: !0,
  position: e,
  diagnostics: n
}), Ne = (e, n, r = []) => ({
  ok: !1,
  status: "blocked",
  reason: e,
  diagnostics: r.concat(Ct(
    `position-${e}`,
    "warning",
    n,
    { reason: e, recoverable: !0 }
  ))
}), qe = (e, n, r, d) => {
  if (!e || !U(e.x) || !U(e.y)) return null;
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
}, Zt = (e, n, r, d) => ({
  x: Math.max(0, Math.min(Math.floor(e.x + e.w), Math.max(0, r - 1))),
  y: Math.max(0, Number.isFinite(d) ? Math.min(Math.floor(e.y + e.h), Math.max(0, d - 1)) : Math.floor(e.y + e.h)),
  source: n,
  cols: r
}), _t = (e, n, r, d) => {
  const g = e.filter((S) => n.indexOf(S.i) !== -1);
  if (g.length === 0) return null;
  const h = Math.min(...g.map((S) => S.x)), k = Math.min(...g.map((S) => S.y)), x = Math.max(...g.map((S) => S.x + S.w)), L = Math.max(...g.map((S) => S.y + S.h));
  return {
    x: Math.max(0, Math.min(Math.floor((h + x) / 2), Math.max(0, r - 1))),
    y: Math.max(0, Number.isFinite(d) ? Math.min(Math.floor((k + L) / 2), Math.max(0, d - 1)) : Math.floor((k + L) / 2)),
    source: "selection",
    cols: r
  };
}, Ot = (e) => {
  var g, h;
  if (!e) return null;
  const n = e;
  if (U(n.clientX) && U(n.clientY))
    return { clientX: n.clientX, clientY: n.clientY };
  const r = e, d = ((g = r.touches) == null ? void 0 : g[0]) || ((h = r.changedTouches) == null ? void 0 : h[0]);
  return d && U(d.clientX) && U(d.clientY) ? { clientX: d.clientX, clientY: d.clientY } : null;
}, eo = (e) => ({
  left: U(e.scrollLeft) ? e.scrollLeft : 0,
  top: U(e.scrollTop) ? e.scrollTop : 0
}), Mt = (e, n) => U(n.width) && n.width > 0 ? n.width : U(e.clientWidth) && e.clientWidth > 0 ? e.clientWidth : U(e.offsetWidth) && e.offsetWidth > 0 ? e.offsetWidth : 0, to = (e) => {
  const n = e != null && e.gridSettings ? e.gridSettings.maxRows : void 0;
  return U(n) && n > 0 ? Math.floor(n) : 1 / 0;
}, oo = (e) => {
  var r;
  const n = (r = e == null ? void 0 : e.gridSettings) == null ? void 0 : r.columns;
  return U(n) && n > 0 ? Math.floor(n) : 12;
}, Ge = (e) => {
  var d;
  const n = e == null ? void 0 : e.heightRuntime;
  if (n && U(n.rowHeight) && n.rowHeight > 0)
    return n.rowHeight;
  const r = (d = e == null ? void 0 : e.gridSettings) == null ? void 0 : d.rowHeight;
  return U(r) && r > 0 ? r : 150;
}, ao = (e, n) => {
  var g, h;
  const r = e.slice().sort((k, x) => k.y - x.y || k.x - x.x || k.i.localeCompare(x.i)), d = Math.max(0, Math.min(Math.floor(n), r.length));
  return {
    listIndex: d,
    beforeId: (g = r[d]) == null ? void 0 : g.i,
    afterId: d > 0 ? (h = r[d - 1]) == null ? void 0 : h.i : void 0
  };
}, so = (e, n) => {
  var r, d;
  return {
    ...e,
    x: 0,
    y: Math.max(0, (d = (r = e.list) == null ? void 0 : r.listIndex) != null ? d : e.y),
    source: e.source === "event" ? "list" : e.source,
    list: e.list || ao(n, e.y)
  };
}, Ze = (e) => {
  var N, ae, ne, ie, se, b;
  const n = e.runtime || null, r = e.layout || (n == null ? void 0 : n.layout) || [], d = oo(n), g = to(n), h = [], k = e.itemSize || { w: 1, h: 1 }, x = (z) => ((n == null ? void 0 : n.viewFormat) || "grid") === "list" ? Rt(so(z, r), h) : Rt(z, h), L = Ot(e.event);
  if (L) {
    const z = e.gridElement || null;
    if (!z || typeof z.getBoundingClientRect != "function")
      return Ne(
        "missing-grid-element",
        "Grid element is required to resolve event coordinates.",
        h
      );
    const q = z.getBoundingClientRect(), O = Mt(z, q);
    if (!Number.isFinite(O) || O <= 0)
      return Ne("missing-grid-element", "Grid element has no measurable width.", h);
    const D = eo(z), I = L.clientX - q.left + D.left, R = L.clientY - q.top + D.top, G = {
      margin: xt((N = n == null ? void 0 : n.gridSettings) == null ? void 0 : N.margin, [10, 10]),
      containerPadding: xt((ae = n == null ? void 0 : n.gridSettings) == null ? void 0 : ae.containerPadding, [0, 0]),
      containerWidth: O,
      cols: d,
      rowHeight: Ge(n),
      maxRows: g,
      renderPrecision: (ne = n == null ? void 0 : n.gridSettings) == null ? void 0 : ne.renderPrecision
    }, ee = Yt(G, R, I, k.w, k.h);
    return !U(ee.x) || !U(ee.y) || ee.x < 0 || ee.y < 0 ? Ne("invalid-input", "Event coordinates produced an invalid grid position.", h) : x({
      x: ee.x,
      y: ee.y,
      source: "event",
      clientX: L.clientX,
      clientY: L.clientY,
      left: I,
      top: R,
      cols: d,
      rowHeight: G.rowHeight
    });
  }
  const S = e.activeItemId || ((ie = e.selection) == null ? void 0 : ie.activeId), C = S ? r.find((z) => z.i === S) : null;
  if (C) return x(Zt(C, "active-item", d, g));
  if ((b = (se = e.selection) == null ? void 0 : se.selectedIds) != null && b.length) {
    const z = _t(r, e.selection.selectedIds, d, g);
    if (z) return x(z);
  }
  const W = qe(e.lastMenuPosition, "last-menu", d, g);
  if (W) return x(W);
  const Z = qe(e.lastPointerPosition, "last-pointer", d, g);
  if (Z) return x(Z);
  const V = e.gridElement || null;
  if (V && typeof V.getBoundingClientRect == "function") {
    const z = V.getBoundingClientRect();
    if (Mt(V, z) > 0) {
      const O = Ge(n), D = Number.isFinite(g) ? g : Math.max(1, Math.ceil((V.clientHeight || O) / O));
      return x({
        x: Math.max(0, Math.floor(d / 2)),
        y: Math.max(0, Math.floor(D / 2)),
        source: "viewport-center",
        cols: d,
        rowHeight: O
      });
    }
  }
  const Y = qe(e.fallback || null, "fallback", d, g);
  return Y ? x(Y) : (h.push(Ct(
    "position-fallback-origin",
    "info",
    "No pointer, selection, menu, pointer, viewport or caller fallback was available; using origin.",
    { details: { positionSource: "none" }, recoverable: !0 }
  )), x({ x: 0, y: 0, source: "none", cols: d, rowHeight: Ge(n) }));
}, no = (e) => Ze(e);
let Pt = 0;
const H = (e) => (Pt += 1, `dashboard-shell-${e}-${Date.now().toString(36)}-${Pt.toString(36)}`), co = (e) => ({
  layoutId: (e == null ? void 0 : e.layoutId) || null,
  requestedBreakpoint: (e == null ? void 0 : e.requestedBreakpoint) || null,
  resolvedProfileId: (e == null ? void 0 : e.resolvedProfileId) || null,
  targetView: (e == null ? void 0 : e.targetView) || null,
  viewFormat: (e == null ? void 0 : e.viewFormat) || null
}), K = (e, n, r, d = {}) => {
  const g = {
    code: e,
    level: n,
    message: r
  };
  return Object.keys(d).sort().forEach((k) => {
    const x = d[k];
    typeof x != "undefined" && (g[k] = x);
  }), g;
}, _e = (e, n = {}) => {
  const r = e instanceof Error ? e.message : String(e || "Unknown error");
  return K(
    "shell-error",
    "error",
    r,
    {
      reason: "validation",
      recoverable: !0,
      ...n
    }
  );
}, j = (e) => {
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
    diagnostics: ve(e.diagnostics || []),
    data: e.data
  };
}, X = (e, n, r) => {
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
}, ve = (e) => e.filter(Boolean).map((n) => {
  const r = {
    code: n.code,
    level: n.level,
    message: n.message
  };
  return Object.keys(n).filter((d) => d !== "code" && d !== "level" && d !== "message").sort().forEach((d) => {
    const g = n[d];
    typeof g != "undefined" && (r[d] = Oe(g));
  }), r;
}).sort(
  (n, r) => `${n.actionId || ""}:${n.code}:${n.path || ""}:${n.itemId || ""}`.localeCompare(`${r.actionId || ""}:${r.code}:${r.path || ""}:${r.itemId || ""}`)
), Oe = (e) => {
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
  if (Array.isArray(e)) return e.map(Oe);
  if (e instanceof Error) return { name: e.name, message: e.message };
  if (typeof e == "object") {
    const n = {};
    return Object.keys(e).sort().forEach((r) => {
      r === "opaque" || r === "payload" || r === "businessPayload" || (n[r] = Oe(e[r]));
    }), n;
  }
  return String(e);
}, ze = (e, n, r) => ({
  stage: e,
  ok: (n == null ? void 0 : n.ok) !== !1,
  status: n == null ? void 0 : n.status,
  reason: n == null ? void 0 : n.reason,
  preparedId: r == null ? void 0 : r.id,
  sourceIds: (n == null ? void 0 : n.sourceIds) || (r == null ? void 0 : r.sourceIds),
  newIds: (n == null ? void 0 : n.newIds) || (r == null ? void 0 : r.newIds),
  idMap: (n == null ? void 0 : n.idMap) || (r == null ? void 0 : r.idMap),
  metadata: (n == null ? void 0 : n.metadata) || (r == null ? void 0 : r.metadata),
  diagnostics: ve((n == null ? void 0 : n.diagnostics) || (r == null ? void 0 : r.diagnostics) || []),
  error: n != null && n.error ? { code: n.error.code, message: n.error.message } : void 0
}), ro = (e) => !!(e && typeof e == "object" && "ok" in e && !("kind" in e)), io = (e) => !!(e && typeof e == "object" && "kind" in e), Be = async (e, n, r, d, g) => {
  if (e.rollback)
    try {
      const h = await e.rollback(n, {
        ...e.context,
        stage: r,
        error: d
      });
      return g.push(...(h == null ? void 0 : h.diagnostics) || []), ze("rollback", h, n);
    } catch (h) {
      return g.push(_e(h, {
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
}, Ue = async (e) => {
  var h, k, x, L, S, C, W, Z, V, Y, N, ae, ne, ie, se;
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
      const I = await e.prepare(e.context);
      if (ro(I)) {
        if (r.push(...I.diagnostics || []), g = ze("prepare", I), !I.ok) {
          const R = j({
            ok: !1,
            status: I.status || "blocked",
            actionId: e.actionId,
            actionType: e.actionType,
            source: e.source,
            itemIds: n,
            affectedIds: [],
            position: e.position,
            adapter: g,
            idMap: I.idMap,
            diagnostics: r
          });
          return X(e.emit, R, e.profile), R;
        }
      } else io(I) && (d = I, r.push(...d.diagnostics || []), g = ze("prepare", { ok: !0, diagnostics: d.diagnostics }, d));
    }
    const b = await e.mutate(d, e.context);
    if (r.push(...b.diagnostics || []), ((k = b.commandResult) == null ? void 0 : k.status) === "blocked" || ((x = b.commandResult) == null ? void 0 : x.status) === "cancelled" || ((L = b.commandResult) == null ? void 0 : L.status) === "timeout" || ((S = b.commandResult) == null ? void 0 : S.status) === "error" || ((C = b.writeResult) == null ? void 0 : C.ok) === !1 || b.status === "blocked" || b.status === "cancelled" || b.status === "timeout" || b.status === "unsupported" || b.status === "error") {
      const I = d ? await Be(e, d, "mutate", b, r) : void 0, R = ((W = b.writeResult) == null ? void 0 : W.ok) === !1 ? "blocked" : b.status || (((Z = b.commandResult) == null ? void 0 : Z.status) === "cancelled" ? "cancelled" : ((V = b.commandResult) == null ? void 0 : V.status) === "timeout" ? "timeout" : ((Y = b.commandResult) == null ? void 0 : Y.status) === "error" ? "error" : "blocked"), G = j({
        ok: !1,
        status: R,
        actionId: e.actionId,
        actionType: e.actionType,
        source: e.source,
        itemIds: n,
        affectedIds: b.affectedIds || ((N = b.commandResult) == null ? void 0 : N.affectedIds) || [],
        position: e.position,
        commandResult: b.commandResult,
        writeResult: b.writeResult,
        proposedDocument: b.proposedDocument,
        adapter: I || g,
        placement: b.placement,
        idMap: d == null ? void 0 : d.idMap,
        patches: b.patches,
        diagnostics: r,
        data: b.data
      });
      return X(e.emit, G, e.profile), G;
    }
    if (d && e.commit) {
      let I;
      try {
        I = await e.commit(d, {
          ...e.context,
          commandResult: b.commandResult,
          writeResult: b.writeResult,
          proposedDocument: b.proposedDocument
        });
      } catch (R) {
        r.push(_e(R, {
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
          diagnostics: ve(d.diagnostics || []),
          error: {
            message: R instanceof Error ? R.message : String(R)
          }
        };
        const G = await Be(e, d, "commit", R, r), ee = j({
          ok: !1,
          status: "error",
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          itemIds: n,
          affectedIds: b.affectedIds || ((ae = b.commandResult) == null ? void 0 : ae.affectedIds) || [],
          position: e.position,
          commandResult: b.commandResult,
          writeResult: b.writeResult,
          proposedDocument: b.proposedDocument,
          adapter: G || g,
          placement: b.placement,
          idMap: d.idMap,
          patches: b.patches,
          diagnostics: r,
          data: b.data
        });
        return X(e.emit, ee, e.profile), ee;
      }
      if (r.push(...(I == null ? void 0 : I.diagnostics) || []), g = ze("commit", I, d), (I == null ? void 0 : I.ok) === !1) {
        const R = await Be(e, d, "commit", I, r), G = j({
          ok: !1,
          status: I.status || "error",
          actionId: e.actionId,
          actionType: e.actionType,
          source: e.source,
          itemIds: n,
          affectedIds: b.affectedIds || ((ne = b.commandResult) == null ? void 0 : ne.affectedIds) || [],
          position: e.position,
          commandResult: b.commandResult,
          writeResult: b.writeResult,
          proposedDocument: b.proposedDocument,
          adapter: R || g,
          placement: b.placement,
          idMap: d.idMap,
          patches: b.patches,
          diagnostics: r,
          data: b.data
        });
        return X(e.emit, G, e.profile), G;
      }
    }
    const q = (ie = b.commandResult) == null ? void 0 : ie.status, O = b.status || (q === "changed" ? "success" : q === "noop" ? "noop" : q === "cancelled" ? "cancelled" : q === "timeout" ? "timeout" : q === "error" ? "error" : q === "blocked" ? "blocked" : "success"), D = j({
      ok: O === "success" || O === "noop",
      status: O,
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source,
      itemIds: n,
      affectedIds: b.affectedIds || ((se = b.commandResult) == null ? void 0 : se.affectedIds) || (d == null ? void 0 : d.newIds) || n,
      position: e.position,
      commandResult: b.commandResult,
      writeResult: b.writeResult,
      proposedDocument: b.proposedDocument,
      adapter: g,
      placement: b.placement,
      idMap: d == null ? void 0 : d.idMap,
      patches: b.patches,
      diagnostics: r,
      data: b.data
    });
    return X(e.emit, D, e.profile), D;
  } catch (b) {
    r.push(_e(b, {
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source
    }));
    const z = d ? await Be(e, d, "mutate", b, r) : void 0, q = j({
      ok: !1,
      status: "error",
      actionId: e.actionId,
      actionType: e.actionType,
      source: e.source,
      itemIds: n,
      affectedIds: [],
      position: e.position,
      adapter: z || g,
      idMap: d == null ? void 0 : d.idMap,
      diagnostics: r
    });
    return X(e.emit, q, e.profile), q;
  }
}, et = (e) => {
  var n;
  return !e.readonly && (e.mode === "edit" || ((n = e.editor) == null ? void 0 : n.mode.value) === "edit");
}, _ = (e, n) => e ? void 0 : n, J = (e, n, r) => {
  var d, g;
  return {
    label: ((g = (d = r.options) == null ? void 0 : d.labelFactory) == null ? void 0 : g.call(d, e, r.context)) || n,
    labelKey: `dashboardEditorShell.${e}`
  };
}, me = (e, n) => {
  var r, d;
  return (d = (r = n.options) == null ? void 0 : r.shortcuts) == null ? void 0 : d[e];
}, Ke = (e, n, r) => {
  if (!et(e.context)) return !1;
  const d = e.context.editor;
  if (!d) return !1;
  const g = d.canExecute({
    type: n,
    targetIds: r,
    source: "context-menu"
  });
  return g.status !== "blocked" && g.status !== "error";
}, Dt = (e, n, r) => {
  var h, k;
  const d = r === "dashboard" ? (h = e.options) == null ? void 0 : h.customDashboardItems : (k = e.options) == null ? void 0 : k.customWidgetItems, g = typeof d == "function" ? d(e.context) : d || [];
  return n.concat(g, e.customItems || []);
}, At = (e, n) => n ? e : e.filter((r) => !r.hidden), oe = (e) => e, lo = (e) => {
  var V, Y, N, ae;
  const n = et(e.context), r = Ke(e, "paste"), d = e.referenceAvailable === !0, g = e.paletteAvailable === !0, h = e.explicitPlacementTarget === !0, k = h ? "here" : "auto", x = h ? "cursor" : ((V = e.options) == null ? void 0 : V.defaultPasteStrategy) || ((Y = e.options) == null ? void 0 : Y.defaultAddStrategy), L = h ? "cursor" : (N = e.options) == null ? void 0 : N.defaultReferencePasteStrategy, S = h ? "cursor" : (ae = e.options) == null ? void 0 : ae.defaultAddStrategy, C = e.readonlyReason || "mode-readonly", W = e.target, Z = [
    {
      id: "paste",
      type: "item",
      ...J("paste", h ? "Paste here" : "Paste", e),
      icon: "clipboard-paste",
      shortcut: me("paste", e),
      enabled: r,
      reason: _(r, n ? "clipboard-unavailable" : C),
      target: W,
      metadata: { strategy: x, placementIntent: k },
      action: oe(() => e.actions.pasteWidget(e.position || null, { source: "context-menu", strategy: x, placementIntent: k }))
    },
    {
      id: "place-clipboard",
      type: "item",
      ...J("place-clipboard", "Place from clipboard", e),
      icon: "crosshair",
      enabled: r,
      reason: _(r, n ? "clipboard-unavailable" : C),
      target: W,
      metadata: { strategy: x, placementIntent: k, placementMode: "interactive" },
      action: oe(() => e.actions.placeClipboard(e.position || null, {
        source: "context-menu",
        strategy: x,
        placementIntent: k,
        placementMode: "interactive"
      }))
    },
    {
      id: "paste-reference",
      type: "item",
      ...J("paste-reference", h ? "Paste reference here" : "Paste reference", e),
      icon: "link",
      shortcut: me("paste-reference", e),
      enabled: n && d,
      reason: _(n && d, n ? "adapter-unavailable" : C),
      target: W,
      metadata: { strategy: L, placementIntent: k },
      action: oe(() => e.actions.pasteWidgetReference(e.position || null, { source: "context-menu", strategy: L, placementIntent: k }))
    },
    {
      id: "add-widget",
      type: "item",
      ...J("add-widget", h ? "Add widget here" : "Add widget", e),
      icon: "plus",
      enabled: n,
      reason: _(n, C),
      target: W,
      metadata: { strategy: S, placementIntent: k },
      action: oe(() => e.actions.addWidgetFromTemplate({ w: 2, h: 2 }, e.position || null, { source: "context-menu", strategy: S, placementIntent: k }))
    },
    {
      id: "open-palette",
      type: "item",
      ...J("open-palette", h ? "Open palette here" : "Open palette", e),
      icon: "layout-grid",
      shortcut: me("open-palette", e),
      enabled: n && g,
      reason: _(n && g, n ? "adapter-unavailable" : C),
      target: W,
      metadata: { strategy: S, placementIntent: k },
      action: oe(() => e.actions.openWidgetPalette(e.position || null, { source: "context-menu", strategy: S, placementIntent: k }))
    },
    {
      id: "move-all-widgets",
      type: "item",
      ...J("move-all-widgets", "Move all widgets", e),
      icon: "move",
      shortcut: me("move-all", e),
      enabled: n,
      reason: _(n, C),
      target: W,
      metadata: { dx: 0, dy: 1 },
      action: oe(() => e.actions.moveAllWidgets(0, 1, { source: "context-menu" }))
    },
    {
      id: "dashboard-settings",
      type: "item",
      ...J("dashboard-settings", "Dashboard settings", e),
      icon: "settings",
      enabled: !0,
      target: W,
      metadata: { hook: !0 }
    }
  ];
  return {
    id: e.id,
    target: W,
    position: e.position,
    items: At(Dt(e, Z, "dashboard"), e.includeHidden),
    diagnostics: e.diagnostics || []
  };
}, uo = (e) => {
  const n = et(e.context), r = e.readonlyReason || "mode-readonly", d = [e.itemId], g = e.hiddenItem === !0, h = e.lockedItem === !0, k = !g && !!e.context.editor, x = !g && Ke(e, "copy", d), L = !g && Ke(e, "duplicate", d), S = !g && !h && Ke(e, "delete", d), C = e.referenceAvailable === !0, W = e.target, Z = [
    {
      id: "select",
      type: "item",
      ...J("select", "Select", e),
      icon: "mouse-pointer-2",
      enabled: k,
      reason: _(k, g ? "hidden" : "missing-editor"),
      target: W,
      action: oe(() => e.actions.selectItem(e.itemId, { source: "context-menu" }))
    },
    {
      id: "edit-widget",
      type: "item",
      ...J("edit-widget", "Edit", e),
      icon: "pencil",
      enabled: n && !h && !g,
      reason: _(n && !h && !g, g ? "hidden" : h ? "locked" : r),
      target: W,
      metadata: { hook: !0 }
    },
    {
      id: "copy-widget",
      type: "item",
      ...J("copy-widget", "Copy widget", e),
      icon: "copy",
      shortcut: me("copy-widget", e),
      enabled: x,
      reason: _(x, g ? "hidden" : r),
      target: W,
      action: oe(() => e.actions.copyWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "copy-reference",
      type: "item",
      ...J("copy-reference", "Copy reference", e),
      icon: "link",
      shortcut: me("copy-reference", e),
      enabled: !g && C,
      reason: _(!g && C, g ? "hidden" : "adapter-unavailable"),
      target: W,
      action: oe(() => e.actions.copyWidgetReference(e.itemId, { source: "context-menu" }))
    },
    {
      id: "duplicate",
      type: "item",
      ...J("duplicate", "Duplicate", e),
      icon: "copy-plus",
      shortcut: me("duplicate-widget", e),
      enabled: L,
      reason: _(L, g ? "hidden" : r),
      target: W,
      action: oe(() => e.actions.duplicateWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "remove",
      type: "item",
      ...J("remove", "Remove", e),
      icon: "trash-2",
      shortcut: me("remove-widget", e),
      danger: !0,
      enabled: S,
      reason: _(S, g ? "hidden" : h ? "locked" : r),
      target: W,
      action: oe(() => e.actions.removeWidget(e.itemId, { source: "context-menu" }))
    },
    {
      id: "replace-reference",
      type: "item",
      ...J("replace-reference", "Replace reference with copy", e),
      icon: "replace",
      enabled: n && !g && C,
      reason: _(n && !g && C, g ? "hidden" : n ? "adapter-unavailable" : r),
      target: W,
      action: oe(() => e.actions.replaceReferenceWithWidgetCopy(e.itemId, { source: "context-menu" }))
    },
    {
      id: "scroll-highlight",
      type: "item",
      ...J("scroll-highlight", "Scroll and highlight", e),
      icon: "scan-search",
      enabled: !g,
      reason: _(!g, "hidden"),
      target: W,
      action: oe(async () => {
        const V = e.actions.highlightItem(e.itemId, { source: "context-menu" });
        return await e.actions.scrollToItem(e.itemId, { source: "context-menu" }), V;
      })
    }
  ];
  return {
    id: e.id,
    target: W,
    position: e.position,
    items: At(Dt(e, Z, "widget"), e.includeHidden),
    diagnostics: e.diagnostics || []
  };
}, we = (e) => e.map((n) => ({ ...n })), te = (e) => typeof e == "number" && Number.isFinite(e), mo = (e) => !!(e && typeof e == "object" && "value" in e), $e = (e) => Array.isArray(e) ? e.filter(Boolean) : e ? [e] : [], Qe = (e) => e === "context-menu" ? "context-menu" : e === "keyboard" ? "keyboard" : e === "toolbar" ? "toolbar" : e === "pointer" ? "pointer" : "api", St = (e) => e === "context-menu" ? "context-menu" : e === "keyboard" ? "keyboard" : e === "toolbar" ? "toolbar" : e === "pointer" ? "pointer" : e === "drop" ? "drop" : "api", Je = (e) => e.type === "move" ? "pointer-move" : e.type === "resize" ? "pointer-resize" : e.type === "add" || e.type === "paste" ? "external-drop" : null, Ee = (e, n) => e.strategy || n, fo = (e) => e === "first-fit" || e === "insert-top-shift", go = (e) => e ? typeof Event != "undefined" && e instanceof Event ? !0 : typeof e == "object" && ("x" in e || "y" in e) : !1, Ce = (e, n) => n.placementIntent || (go(e) ? "here" : "auto"), De = (e) => ({
  collisionPolicy: e.collisionPolicy,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision
}), yo = (e) => {
  var g, h;
  if (!e) return !1;
  const n = e;
  if (te(n.clientX) && te(n.clientY)) return !0;
  const r = e, d = ((g = r.touches) == null ? void 0 : g[0]) || ((h = r.changedTouches) == null ? void 0 : h[0]);
  return !!(d && te(d.clientX) && te(d.clientY));
}, po = (e, n, r, d, g) => {
  const h = (e == null ? void 0 : e.newIds) || [];
  if (!h.length) return [];
  const k = new Set(n.map((C) => C.i)), x = /* @__PURE__ */ new Set(), L = [], S = [];
  return h.forEach((C) => {
    if (typeof C != "string" || C.trim().length === 0) {
      L.push(String(C));
      return;
    }
    (x.has(C) || k.has(C)) && S.push(C), x.add(C);
  }), !L.length && !S.length ? [] : [K(
    "shell-adapter-invalid-new-ids",
    "error",
    "Adapter prepare returned invalid or duplicate new widget ids.",
    {
      actionId: r,
      actionType: d,
      source: g,
      reason: "adapter-rejected",
      itemIds: S.concat(L),
      details: {
        duplicateIds: S,
        invalidIds: L
      },
      recoverable: !0
    }
  )];
}, ho = () => ({
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
}), Et = (e, n, r, d = []) => Jt({ id: e, type: n }, "blocked", {
  targetIds: d,
  blocked: {
    reason: r,
    itemIds: d,
    message: `Command was blocked by dashboard editor shell: ${r}.`
  }
}), Ae = (e, n) => {
  var g, h;
  const r = (h = (g = n.diagnostics) == null ? void 0 : g.operationResult) == null ? void 0 : h.layout;
  if (r) return we(r);
  let d = we(e.layout);
  return n.layoutPatches.forEach((k) => {
    if (k.type === "add") {
      d.push({ ...k.item });
      return;
    }
    if (k.type === "remove") {
      d = d.filter((x) => x.i !== k.id);
      return;
    }
    if (k.type === "move") {
      d = d.map((x) => x.i === k.id ? { ...x, x: k.to.x, y: k.to.y } : x);
      return;
    }
    k.type === "resize" && (d = d.map((x) => x.i === k.id ? { ...x, x: k.to.x, y: k.to.y, w: k.to.w, h: k.to.h } : x));
  }), d;
}, He = (e) => typeof CSS != "undefined" && typeof CSS.escape == "function" ? CSS.escape(e) : e.replace(/["\\]/g, "\\$&"), Io = (e) => !!(e && typeof e == "object"), bo = (e, n = {}) => {
  var g;
  if (e.defaultPrevented) return !0;
  const r = e.target;
  if (!Io(r)) return !1;
  const d = (g = r.tagName) == null ? void 0 : g.toUpperCase();
  return d === "INPUT" || d === "TEXTAREA" || d === "SELECT" || r.isContentEditable ? !0 : (n.ignoredTargets || []).some((h) => typeof h == "string" ? typeof r.matches == "function" && r.matches(h) : h(r));
}, ko = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", wo = [
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
], vo = (e, n, r) => {
  const d = r === "mac" ? e.metaKey : e.ctrlKey, g = r === "mac" ? e.ctrlKey : e.metaKey, h = n.primary === !0, k = typeof n.ctrl == "boolean" || typeof n.meta == "boolean";
  if (e.key.toLowerCase() !== n.key.toLowerCase()) return !1;
  if (k) {
    if ((n.ctrl || !1) !== e.ctrlKey || (n.meta || !1) !== e.metaKey) return !1;
  } else if (h !== d || h && g || !h && (e.ctrlKey || e.metaKey)) return !1;
  return !((n.shift || !1) !== e.shiftKey || (n.alt || !1) !== e.altKey);
}, xo = (e, n, r, d) => {
  const g = n.placementOptions || e.placementOptions, h = typeof g == "function" ? g() : g;
  return {
    ...r,
    ...h || {},
    source: d
  };
};
function Co(e = {}) {
  var gt, yt, pt, ht;
  const n = vt(he(e.document) || null), r = vt(ho()), d = [], g = [];
  let h = !1, k = null, x = Promise.resolve(), L = null, S = null;
  const C = /* @__PURE__ */ new Map(), W = /* @__PURE__ */ new Map(), Z = /* @__PURE__ */ new Set(), V = /* @__PURE__ */ new Set(), Y = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Map(), ae = e.controlled !== !1, ne = () => e.documentWriteBack === "shell", ie = (t, o) => {
    var a;
    return `${t}:${(a = o == null ? void 0 : o.revision) != null ? a : "unknown"}`;
  }, se = (t) => {
    const o = x.catch(() => {
    }).then(t);
    return x = o.then(() => {
    }, () => {
    }), o;
  }, b = () => {
    L = null;
  }, z = () => {
    S = null;
  }, q = (t, o) => {
    L = {
      mode: "interactive",
      reason: "cut-widget",
      sourceActionId: t,
      itemIds: o.slice()
    };
  }, O = () => {
    const t = L;
    return L = null, t;
  }, D = (t) => {
    var o;
    (o = e.onEvent) == null || o.call(e, t);
  }, I = () => {
    var t;
    return ((t = e.model) == null ? void 0 : t.state.value) || he(e.runtime) || null;
  }, R = () => {
    var t;
    return e.editor || ((t = e.model) == null ? void 0 : t.editorController) || null;
  }, G = () => he(e.gridElement) || null, ee = () => he(e.document) || n.value || null, B = () => co(I()), tt = (t, o) => {
    const a = I(), s = [];
    return a || s.push(K(
      "shell-missing-runtime",
      "warning",
      "Dashboard responsive runtime is not available.",
      { actionId: t, actionType: o, reason: "missing-runtime", recoverable: !0 }
    )), R() || s.push(K(
      "shell-missing-editor",
      "warning",
      "Grid editor controller is not available.",
      { actionId: t, actionType: o, reason: "missing-editor", recoverable: !0 }
    )), ((a == null ? void 0 : a.diagnostics) || []).forEach((c) => {
      s.push(K(
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
  }, Tt = (t, o) => {
    var l, m;
    const a = (he(e.mode) || (t == null ? void 0 : t.mode) || (o == null ? void 0 : o.mode.value)) === "edit", s = ((t == null ? void 0 : t.renderItemIds) || (t == null ? void 0 : t.activeItemIds) || []).length === 0, c = !!(t && a && s), i = {
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
          var f;
          return F.openWidgetPalette(null, { source: "api", strategy: (f = e.menu) == null ? void 0 : f.defaultAddStrategy });
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
          return F.addWidgetFromTemplate({ w: 2, h: 2 }, null, { source: "api", strategy: (f = e.menu) == null ? void 0 : f.defaultAddStrategy });
        }
      }
    ] : [];
    return {
      enabled: c,
      reason: c ? void 0 : t ? a ? "not-empty" : "mode-readonly" : "missing-runtime",
      target: i,
      descriptors: u
    };
  }, ot = () => {
    const t = I(), o = R(), a = tt(), s = !t || !o || !G();
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
      mode: he(e.mode) || (t == null ? void 0 : t.mode) || (o == null ? void 0 : o.mode.value) || null,
      selection: (o == null ? void 0 : o.selection.value) || null,
      dirty: (o == null ? void 0 : o.dirty.value) || !1,
      conflict: (o == null ? void 0 : o.conflict.value) || null,
      lastResult: (o == null ? void 0 : o.lastResult.value) || null,
      toolbar: (o == null ? void 0 : o.getToolbarState()) || null,
      emptyAdd: Tt(t, o),
      diagnostics: ve(a)
    };
  }, xe = (t, o, a) => {
    var c;
    const s = {
      type: "documentChange",
      actionId: t,
      document: o,
      runtime: a,
      controlled: ae,
      persist: !1
    };
    (c = e.onDocumentChange) == null || c.call(e, s), D({ type: "documentChange", event: s });
  }, Re = (t) => {
    ae || (n.value = t, mo(e.document) && (e.document.value = t));
  }, Wt = (t, o, a, s = {}) => {
    const c = I(), i = ee(), u = R(), l = [];
    if (!c || !i)
      return l.push(K(
        "shell-write-back-skipped",
        "info",
        "Dashboard document or runtime is unavailable; action result is returned without proposed document.",
        { actionId: t, reason: c ? "profile-write-back" : "missing-runtime", recoverable: !0 }
      )), { diagnostics: l };
    const m = Qt(
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
      (f) => K(
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
    )), m.ok ? { writeResult: m, proposedDocument: m.document, diagnostics: l } : (l.push(K(
      "shell-profile-write-back-blocked",
      "error",
      m.error.message,
      { actionId: t, reason: "profile-write-back", recoverable: !0, path: m.error.path }
    )), { writeResult: m, proposedDocument: m.document, diagnostics: l });
  }, fe = (t, o, a, s, c, i = {}) => ({
    actionId: t,
    actionType: o,
    source: a,
    itemIds: s,
    runtime: I(),
    document: ee(),
    position: c,
    diagnostics: tt(t, o),
    ...i
  }), Te = async (t) => {
    for (const o of e.guards || []) {
      const a = await o(t);
      if (a === !1)
        return {
          ok: !1,
          status: "blocked",
          reason: "guard-blocked",
          diagnostics: [K(
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
  }, A = (t, o, a, s = [], c = [], i = H(t)) => {
    const u = j({
      ok: !1,
      status: a === "adapter-unavailable" ? "unsupported" : "blocked",
      actionId: i,
      actionType: t,
      source: o,
      itemIds: s,
      affectedIds: [],
      diagnostics: c.concat(K(
        `shell-${a}`,
        a === "missing-runtime" || a === "missing-editor" ? "warning" : "error",
        `Dashboard editor shell action was blocked: ${a}.`,
        { actionId: i, actionType: t, source: o, reason: a, itemIds: s, ...B() }
      ))
    });
    return X(D, u, B()), u;
  }, Ie = (t, o, a, s) => ((t == null ? void 0 : t.diagnostics) || []).map((c) => {
    const i = c.code.startsWith("grid-editor.placement.") ? `shell-placement-${c.code.slice(22).replace(/\./g, "-")}` : c.code;
    return K(
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
        ...B()
      }
    );
  }), We = (t, o, a, s) => {
    var i, u;
    const c = (u = (i = t == null ? void 0 : t.diagnostics) == null ? void 0 : i.computed) == null ? void 0 : u.placement;
    if (c)
      return {
        ...c,
        strategy: c.strategy,
        diagnostics: ve(Ie(c, o, a, s))
      };
  }, Ft = (t, o, a, s) => {
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
      diagnostics: ve(Ie(c, o, a, s))
    };
  }, at = (t, o, a, s, c = H(t)) => {
    const i = Ft(a, c, t, o), u = j({
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
      data: Me({
        placementSessionId: a.id,
        phase: a.phase,
        source: a.source
      }, i)
    });
    return X(D, u, B()), u;
  }, Me = (t, o) => o ? t && typeof t == "object" && !Array.isArray(t) ? {
    ...t,
    placement: o
  } : { value: t, placement: o } : t, Lt = (t) => t.status === "changed" ? "success" : t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : t.status === "blocked" ? "blocked" : "noop", Bt = (t, o, a, s) => {
    var c;
    return t.blocked ? [K(
      `shell-command-${t.blocked.reason}`,
      "warning",
      t.blocked.message || `Editor command was blocked: ${t.blocked.reason}.`,
      { actionId: o, actionType: a, source: s, reason: t.blocked.reason, itemIds: t.blocked.itemIds, recoverable: !0 }
    )] : t.status === "error" ? [K(
      "shell-command-error",
      "error",
      ((c = t.error) == null ? void 0 : c.message) || "Editor command failed.",
      { actionId: o, actionType: a, source: s, reason: "validation", recoverable: !0 }
    )] : [];
  }, je = (t, o, a) => {
    ne() && (!t || !e.legacyHistoryStore || o === "success" && (a == null ? void 0 : a.ok) === !0 && e.legacyHistoryStore.push(t));
  }, Pe = (t) => {
    var f, y, p, M, w, v, T;
    const o = We(t.result, t.actionId, t.actionType, t.source), a = Ie(
      (y = (f = t.result.diagnostics) == null ? void 0 : f.computed) == null ? void 0 : y.placement,
      t.actionId,
      t.actionType,
      t.source
    ), s = Lt(t.result), c = (p = t.hasDocumentMutation) != null ? p : t.result.layoutPatches.length > 0 || t.result.metadataPatches.length > 0, u = !!(t.nextLayout && c && (t.result.status === "changed" || t.result.status === "noop")) ? Wt(t.actionId, t.nextLayout || [], t.writeItemIds || t.result.affectedIds, {
      removeMissingItems: t.removeMissingItems
    }) : { diagnostics: [] };
    ((M = u.writeResult) == null ? void 0 : M.ok) === !1 && t.rollbackCheckpoint && ((w = R()) == null || w.restoreRollbackCheckpoint(
      t.rollbackCheckpoint,
      t.rollbackReason || "shell-write-back-rollback"
    ));
    const l = ((v = u.writeResult) == null ? void 0 : v.ok) === !1 ? "blocked" : s, m = (s === "success" || s === "noop") && ((T = u.writeResult) == null ? void 0 : T.ok) !== !1;
    return m && t.writeLegacyMirror && je(t.nextLayout, s, u.writeResult), {
      status: l,
      ok: m,
      writeResult: u.writeResult,
      proposedDocument: u.proposedDocument,
      affectedIds: t.result.affectedIds,
      patches: t.result.layoutPatches,
      placement: o,
      data: Me(t.data, o),
      diagnostics: u.diagnostics.concat(Bt(t.result, t.actionId, t.actionType, t.source)).concat(a)
    };
  }, Xe = (t) => t ? t.kind === "layout" ? we(t.layout) : we(t.layouts[t.breakpoint] || []) : null, $t = (t) => t ? !Ye(Xe(t.before), Xe(t.after)) || !Ye(t.before.editorMetaById, t.after.editorMetaById) || !Ye(t.before.sectionRows, t.after.sectionRows) : !1, st = async (t, o = {}) => se(async () => {
    var p, M, w, v;
    const a = H(t), s = o.source || "api", c = R();
    if (!c) return A(t, s, "missing-editor", [], [], a);
    const i = c.createRollbackCheckpoint(`shell-${t}-write-back`);
    Y.add(a);
    const u = await c.execute({
      id: a,
      type: t,
      source: Qe(s)
    }).finally(() => {
      Y.delete(a);
    }), l = Xe(t === "undo" ? (p = u.undo) == null ? void 0 : p.before : (M = u.undo) == null ? void 0 : M.after), m = $t(u.undo), f = Pe({
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
    }), y = j({
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
    return y.ok && y.proposedDocument && ((v = y.writeResult) == null ? void 0 : v.ok) !== !1 && (Re(y.proposedDocument), xe(a, y.proposedDocument, I())), X(D, y, B()), y;
  }), ce = async (t, o, a = {}) => se(async () => {
    var p, M, w;
    const s = o.id || H(t), c = a.source || "api", i = a.itemIds || o.targetIds || [], u = fe(s, t, c, i, a.position, a.contextExtra);
    let l = null, m = null, f = !1;
    const y = await Ue({
      actionId: s,
      actionType: t,
      source: c,
      itemIds: i,
      position: a.position,
      context: u,
      profile: B(),
      emit: D,
      prepare: async (v) => {
        var P;
        const T = await Te(v);
        return T || ((P = a.prepare) == null ? void 0 : P.call(a, v)) || null;
      },
      mutate: async (v) => {
        var It, bt, kt, wt;
        const T = R(), P = I();
        if (!T)
          return {
            status: "blocked",
            commandResult: Et(s, o.type, "missing-editor", i),
            diagnostics: [K(
              "shell-missing-editor",
              "error",
              "Grid editor controller is required for this action.",
              { actionId: s, actionType: t, source: c, reason: "missing-editor", recoverable: !0 }
            )]
          };
        l = P ? we(P.layout) : null;
        const Q = po(
          v,
          (P == null ? void 0 : P.layout) || [],
          s,
          t,
          c
        );
        if (Q.length > 0)
          return {
            status: "blocked",
            commandResult: Et(s, o.type, "invalid-input", i),
            affectedIds: [],
            diagnostics: Q
          };
        const $ = (It = v == null ? void 0 : v.newIds) != null && It[0] && o.type === "add" ? {
          ...o,
          payload: {
            ...o.payload || {},
            item: {
              ...((bt = o.payload) == null ? void 0 : bt.item) || {},
              i: v.newIds[0]
            }
          }
        } : o;
        m = T.createRollbackCheckpoint(`shell-${t}-write-back`), Y.add(s);
        const E = await T.execute({
          ...$,
          id: s,
          source: Qe(c)
        }).finally(() => {
          Y.delete(s);
        });
        f = E.status === "changed";
        const Se = We(E, s, t, c), le = Ie((wt = (kt = E.diagnostics) == null ? void 0 : kt.computed) == null ? void 0 : wt.placement, s, t, c);
        if (E.status === "blocked" || E.status === "cancelled" || E.status === "timeout" || E.status === "error")
          return {
            status: E.status === "cancelled" ? "cancelled" : E.status === "timeout" ? "timeout" : E.status === "error" ? "error" : "blocked",
            commandResult: E,
            affectedIds: E.affectedIds,
            diagnostics: E.blocked ? [K(
              `shell-command-${E.blocked.reason}`,
              "warning",
              E.blocked.message || `Editor command was blocked: ${E.blocked.reason}.`,
              { actionId: s, actionType: t, source: c, reason: E.blocked.reason, itemIds: E.blocked.itemIds, recoverable: !0 }
            )].concat(le) : le,
            placement: Se,
            data: Me(a.data, Se)
          };
        const Vt = P ? Ae(P, E) : [], ue = Pe({
          actionId: s,
          actionType: t,
          source: c,
          result: E,
          nextLayout: P ? Vt : null,
          removeMissingItems: o.type === "delete",
          rollbackCheckpoint: m,
          rollbackReason: "shell-write-back-rollback",
          data: a.data
        });
        return {
          status: ue.status,
          commandResult: E,
          writeResult: ue.writeResult,
          proposedDocument: ue.proposedDocument,
          affectedIds: ue.affectedIds,
          patches: ue.patches,
          placement: ue.placement,
          data: ue.data,
          diagnostics: ue.diagnostics
        };
      },
      commit: a.commit,
      rollback: a.rollback
    });
    if (!y.ok && f && (m ? (p = R()) == null || p.restoreRollbackCheckpoint(m, "shell-transaction-rollback") : l && ((M = R()) == null || M.setExternalLayout(l, "shell-transaction-rollback"))), y.ok && y.proposedDocument && ((w = y.writeResult) == null ? void 0 : w.ok) !== !1) {
      const v = I();
      v && y.commandResult && je(
        Ae(v, y.commandResult),
        y.status,
        y.writeResult
      ), Re(y.proposedDocument), xe(s, y.proposedDocument, I());
    }
    return y;
  }), Ht = async (t, o) => se(() => {
    var p, M, w, v, T, P;
    if (!ne() || Z.has(o.id) || Y.has(o.id)) return null;
    const a = Je(t);
    if (!a || (w = (M = (p = o.diagnostics) == null ? void 0 : p.computed) == null ? void 0 : M.placement) != null && w.sessionId) return null;
    const s = o.id || H(a), c = St(t.source || ((v = o.diagnostics) == null ? void 0 : v.source)), i = I(), u = N.get(o.id), l = ie(o.id, u);
    if (V.has(l)) return null;
    Z.add(o.id), V.add(l), N.delete(o.id);
    const m = i ? Ae(i, o) : [], f = Pe({
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
        historyEntryId: (T = o.undo) == null ? void 0 : T.id,
        synthesized: !0
      }
    }), y = j({
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
    return y.ok && y.proposedDocument && ((P = y.writeResult) == null ? void 0 : P.ok) !== !1 && (Re(y.proposedDocument), xe(s, y.proposedDocument, I())), X(D, y, B()), y;
  }), zt = async (t, o) => se(() => {
    var f, y, p, M, w;
    if (!ne() || Z.has(o.id) || Y.has(o.id)) return null;
    const a = Je(t);
    if (!a || (p = (y = (f = o.diagnostics) == null ? void 0 : f.computed) == null ? void 0 : y.placement) != null && p.sessionId) return null;
    const s = o.id || H(a), c = St(t.source || ((M = o.diagnostics) == null ? void 0 : M.source)), i = N.get(o.id), u = ie(o.id, i);
    if (V.has(u)) return null;
    Z.add(o.id), V.add(u), N.delete(o.id);
    const l = Pe({
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
    }), m = j({
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
    return X(D, m, B()), m;
  }), Fe = (t, o = {}) => {
    var a, s, c;
    return t && typeof Event != "undefined" && t instanceof Event ? ge(t, o) : t && typeof t == "object" && ("x" in t || "y" in t) ? Ze({
      ...o,
      runtime: I(),
      layout: (a = I()) == null ? void 0 : a.layout,
      selection: null,
      gridElement: null,
      lastMenuPosition: null,
      lastPointerPosition: null,
      fallback: t
    }) : Ze({
      ...o,
      runtime: I(),
      layout: (s = I()) == null ? void 0 : s.layout,
      selection: ((c = R()) == null ? void 0 : c.selection.value) || null,
      gridElement: G(),
      lastMenuPosition: r.value.lastMenuPosition,
      lastPointerPosition: r.value.lastPointerPosition,
      fallback: o.fallback || r.value.lastMenuPosition || r.value.lastPointerPosition || void 0
    });
  }, be = (t, o, a) => {
    const s = Ee(o, a);
    if (!fo(s)) return Fe(t, o);
    const c = o;
    return t ? Fe(t, {
      ...o,
      fallback: c.fallback || { x: 0, y: 0, source: "strategy" }
    }) : Fe({ x: 0, y: 0, source: "strategy" }, o);
  }, nt = () => {
    var t, o;
    return ((t = e.menu) == null ? void 0 : t.defaultPasteStrategy) || ((o = e.menu) == null ? void 0 : o.defaultAddStrategy) || "cursor";
  }, ge = (t, o = {}) => {
    var a, s, c;
    return no({
      ...o,
      event: t,
      runtime: I(),
      layout: (a = I()) == null ? void 0 : a.layout,
      selection: ((s = R()) == null ? void 0 : s.selection.value) || null,
      gridElement: G(),
      lastMenuPosition: r.value.lastMenuPosition,
      lastPointerPosition: r.value.lastPointerPosition,
      fallback: o.fallback || ((c = e.position) == null ? void 0 : c.fallback)
    });
  }, ct = async (t, o = {}, a = "paste") => {
    var u, l;
    const s = I(), c = o.placementIntent || "here", i = {
      strategy: o.strategy || "cursor",
      ...De(o),
      cursor: { x: t.x, y: t.y },
      cols: ((u = s == null ? void 0 : s.gridSettings) == null ? void 0 : u.columns) || t.cols || 12,
      maxRows: ((l = s == null ? void 0 : s.gridSettings) == null ? void 0 : l.maxRows) || 1 / 0,
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
  }, ke = (t) => {
    var o;
    return (o = e.widgetAdapter) != null && o[t] ? (a) => {
      var s, c;
      return (c = (s = e.widgetAdapter) == null ? void 0 : s[t]) == null ? void 0 : c.call(s, a);
    } : void 0;
  }, ye = (gt = e.widgetAdapter) != null && gt.commit ? (t, o) => {
    var a, s;
    return (s = (a = e.widgetAdapter) == null ? void 0 : a.commit) == null ? void 0 : s.call(a, t, o);
  } : void 0, pe = (yt = e.widgetAdapter) != null && yt.rollback ? (t, o) => {
    var a, s;
    return (s = (a = e.widgetAdapter) == null ? void 0 : a.rollback) == null ? void 0 : s.call(a, t, o);
  } : void 0, rt = (t) => {
    var o;
    return (o = e.referenceAdapter) != null && o[t] ? (a) => {
      var s, c;
      return (c = (s = e.referenceAdapter) == null ? void 0 : s[t]) == null ? void 0 : c.call(s, a);
    } : void 0;
  }, it = (pt = e.referenceAdapter) != null && pt.commit ? (t, o) => {
    var a, s;
    return (s = (a = e.referenceAdapter) == null ? void 0 : a.commit) == null ? void 0 : s.call(a, t, o);
  } : void 0, dt = (ht = e.referenceAdapter) != null && ht.rollback ? (t, o) => {
    var a, s;
    return (s = (a = e.referenceAdapter) == null ? void 0 : a.rollback) == null ? void 0 : s.call(a, t, o);
  } : void 0, lt = (t) => t === !0 ? null : t === !1 ? { ok: !1, status: "cancelled", reason: "confirm-cancelled" } : "available" in t ? t.available ? null : { ok: !1, status: "cancelled", reason: t.reason || "confirm-cancelled", diagnostics: t.diagnostics } : t.ok ? null : t, ut = (t, o) => {
    C.set(t.id, {
      ...o,
      itemIds: t.items.map((a) => a.i),
      baseLayout: we(t.baseLayout)
    });
  }, mt = (t) => {
    var c, i;
    const o = (i = (c = t.diagnostics) == null ? void 0 : c.computed) == null ? void 0 : i.placement, a = o == null ? void 0 : o.sessionId;
    if (!a) return null;
    const s = C.get(a);
    return s && o ? { pending: s, placement: o } : null;
  }, Kt = (t, o, a) => {
    var y, p;
    const s = (o == null ? void 0 : o.actionType) || "place-clipboard", c = (o == null ? void 0 : o.actionId) || H(s), i = We(t, c, s, a), u = Ie(
      (p = (y = t.diagnostics) == null ? void 0 : y.computed) == null ? void 0 : p.placement,
      c,
      s,
      a
    ), l = t.status === "changed" ? "success" : t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : t.status === "blocked" ? "blocked" : "noop", m = t.blocked ? [K(
      `shell-command-${t.blocked.reason}`,
      "warning",
      t.blocked.message || `Editor command was blocked: ${t.blocked.reason}.`,
      { actionId: c, actionType: s, source: a, reason: t.blocked.reason, itemIds: t.blocked.itemIds, recoverable: !0 }
    )].concat(u) : u, f = j({
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
      data: Me(o == null ? void 0 : o.data, i),
      diagnostics: m
    });
    return X(D, f, B()), f;
  }, ft = async (t) => {
    var u;
    const o = mt(t), a = o == null ? void 0 : o.placement.sessionId;
    if (!o || !a) return null;
    const s = W.get(t.id);
    if (s) return s;
    if (t.status === "blocked" && ((u = t.blocked) == null ? void 0 : u.reason) !== "stale-command") return null;
    const { pending: c } = o;
    C.delete(a);
    const i = se(async () => {
      var v, T, P;
      const l = R(), m = I(), f = N.get(t.id) || c.rollbackCheckpoint;
      N.delete(t.id);
      const y = We(t, c.actionId, c.actionType, c.source), p = Ie(
        (T = (v = t.diagnostics) == null ? void 0 : v.computed) == null ? void 0 : T.placement,
        c.actionId,
        c.actionType,
        c.source
      ), M = fe(
        c.actionId,
        c.actionType,
        c.source,
        c.itemIds,
        c.position,
        c.contextExtra
      ), w = await Ue({
        actionId: c.actionId,
        actionType: c.actionType,
        source: c.source,
        itemIds: c.itemIds,
        position: c.position,
        context: M,
        profile: B(),
        emit: D,
        prepare: c.prepare,
        mutate: () => {
          if (t.status === "blocked" || t.status === "cancelled" || t.status === "timeout" || t.status === "error")
            return {
              status: t.status === "cancelled" ? "cancelled" : t.status === "timeout" ? "timeout" : t.status === "error" ? "error" : "blocked",
              commandResult: t,
              affectedIds: t.affectedIds,
              diagnostics: p,
              placement: y,
              data: Me(c.data, y)
            };
          const Q = m ? Ae(m, t) : [], $ = Pe({
            actionId: c.actionId,
            actionType: c.actionType,
            source: c.source,
            result: t,
            nextLayout: m ? Q : null,
            removeMissingItems: t.type === "delete",
            rollbackCheckpoint: f,
            rollbackReason: "shell-placement-write-back-rollback",
            data: c.data
          });
          return {
            status: $.status,
            commandResult: t,
            writeResult: $.writeResult,
            proposedDocument: $.proposedDocument,
            affectedIds: $.affectedIds,
            patches: $.patches,
            placement: $.placement || y,
            data: $.data,
            diagnostics: $.diagnostics.length ? $.diagnostics : p
          };
        },
        commit: c.commit,
        rollback: c.rollback
      });
      if (!w.ok && t.status === "changed" && l && (f ? l.restoreRollbackCheckpoint(f, "shell-placement-transaction-rollback") : l.setExternalLayout(c.baseLayout, "shell-placement-transaction-rollback")), w.ok && w.proposedDocument && ((P = w.writeResult) == null ? void 0 : P.ok) !== !1) {
        const Q = I();
        Q && w.commandResult && je(
          Ae(Q, w.commandResult),
          w.status,
          w.writeResult
        ), Re(w.proposedDocument), xe(c.actionId, w.proposedDocument, I());
      }
      return w;
    });
    return W.set(t.id, i), i.finally(() => {
      W.get(t.id) === i && W.delete(t.id);
    }), i;
  }, F = {
    getEventGridPosition: (t, o = {}) => ge(t, o),
    pasteAtEvent: async (t, o = {}) => {
      const a = ge(t, o);
      return a.ok ? (r.value = { ...r.value, lastPointerPosition: a.position }, ct(a.position, o, "paste")) : A("paste", o.source || "api", a.reason, [], a.diagnostics);
    },
    pasteAtGridPosition: async (t, o = {}) => {
      const a = Fe(t, o);
      return a.ok ? ct(a.position, o, "paste") : A("paste", o.source || "api", a.reason, [], a.diagnostics);
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
      const a = H("highlight"), s = I(), c = r.value.highlightedId;
      if (!(s != null && s.allItemIds.includes(t)))
        return A("highlight", o.source || "api", "missing-item", [t], [], a);
      k && clearTimeout(k), r.value = { ...r.value, highlightedId: t }, D({
        type: "highlight-change",
        actionId: a,
        itemId: t,
        previous: c,
        profile: B()
      }), o.durationMs && o.durationMs > 0 && (k = setTimeout(() => {
        F.resetHighlight();
      }, o.durationMs));
      const i = j({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "highlight",
        source: o.source || "api",
        itemIds: [t],
        affectedIds: [t],
        diagnostics: []
      });
      return X(D, i, B()), o.scroll && F.scrollToItem(t, o), i;
    },
    resetHighlight: () => {
      const t = H("reset-highlight"), o = r.value.highlightedId;
      k && (clearTimeout(k), k = null), r.value = { ...r.value, highlightedId: null }, D({
        type: "highlight-change",
        actionId: t,
        itemId: null,
        previous: o,
        profile: B()
      });
      const a = j({
        ok: !0,
        status: o ? "success" : "noop",
        actionId: t,
        actionType: "reset-highlight",
        source: "api",
        itemIds: o ? [o] : [],
        affectedIds: o ? [o] : [],
        diagnostics: []
      });
      return X(D, a, B()), a;
    },
    scrollToItem: async (t, o = {}) => {
      var y;
      const a = H("scroll-to-item"), s = I(), c = o.source || "api";
      if (!(s != null && s.allItemIds.includes(t)))
        return A("scroll-to-item", c, "missing-item", [t], [], a);
      if (s.hiddenItemIds.includes(t) || !s.renderItemIds.includes(t)) {
        const p = A("scroll-to-item", c, "hidden", [t], [], a);
        return D({
          type: "action-result",
          actionId: a,
          actionType: "scroll-to-item",
          source: c,
          status: "blocked",
          ok: !1,
          itemIds: [t],
          affectedIds: [],
          profile: B(),
          diagnostics: p.diagnostics
        }), p;
      }
      const i = G();
      if (!i || typeof i.querySelector != "function")
        return A("scroll-to-item", c, "missing-grid-element", [t], [], a);
      const u = typeof o.selector == "function" ? o.selector(t) : o.selector || `[data-grid-id="${He(t)}"],[data-grid-item-id="${He(t)}"],[data-i="${He(t)}"],[data-id="${He(t)}"]`, l = i.querySelector(u);
      if (!l)
        return A("scroll-to-item", c, "dom-unavailable", [t], [], a);
      const m = await ((y = e.scrollAdapter) == null ? void 0 : y.call(e, {
        itemId: t,
        itemElement: l,
        gridElement: i,
        options: o,
        runtime: s
      }));
      if (m && !m.available)
        return A("scroll-to-item", c, m.reason || "dom-unavailable", [t], m.diagnostics || [], a);
      typeof l.scrollIntoView == "function" && l.scrollIntoView({
        behavior: o.behavior || "smooth",
        block: o.block || "nearest",
        inline: o.inline || "nearest"
      });
      const f = j({
        ok: !0,
        status: "success",
        actionId: a,
        actionType: "scroll-to-item",
        source: c,
        itemIds: [t],
        affectedIds: [t],
        diagnostics: []
      });
      return X(D, f, B()), f;
    },
    prepareDashboardContextMenu: (t, o = {}) => {
      var f, y;
      const a = ge(t || null, { source: o.source || "context-menu" }), s = a.ok ? a.position : void 0, c = yo(t || null) && (s == null ? void 0 : s.source) === "event";
      s && (r.value = { ...r.value, lastMenuPosition: s });
      const i = H("prepare-dashboard-menu"), u = I(), l = R(), m = lo({
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
        actions: F,
        options: e.menu,
        customItems: o.customItems,
        includeHidden: o.includeHidden,
        explicitPlacementTarget: c,
        referenceAvailable: !!((f = e.referenceAdapter) != null && f.preparePasteReference),
        paletteAvailable: !!((y = e.palette) != null && y.open),
        diagnostics: (a.ok, a.diagnostics)
      });
      return r.value = { ...r.value, menu: m }, D({ type: "menu-change", actionId: i, menu: m, profile: B() }), m;
    },
    prepareWidgetContextMenu: (t, o, a = {}) => {
      var p;
      const s = ge(t || null, { source: a.source || "context-menu", activeItemId: o }), c = s.ok ? s.position : void 0;
      c && (r.value = { ...r.value, lastMenuPosition: c });
      const i = H("prepare-widget-menu"), u = I(), l = R(), m = l == null ? void 0 : l.editorMetaById.value[o], f = { type: "widget", itemId: o, position: c }, y = uo({
        id: i,
        target: f,
        itemId: o,
        hiddenItem: (u == null ? void 0 : u.hiddenItemIds.includes(o)) || (m == null ? void 0 : m.visible) === !1,
        lockedItem: (m == null ? void 0 : m.locked) === !0 || ((p = u == null ? void 0 : u.layout.find((M) => M.i === o)) == null ? void 0 : p.static) === !0,
        position: c,
        context: {
          target: f,
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
        diagnostics: (s.ok, s.diagnostics)
      });
      return r.value = { ...r.value, menu: y }, D({ type: "menu-change", actionId: i, menu: y, profile: B() }), y;
    },
    closeMenu: (t = "close") => {
      const o = H("close-menu");
      r.value = { ...r.value, menu: null, lastMenuPosition: null }, D({ type: "menu-change", actionId: o, menu: null, reason: t, profile: B() });
    },
    copyWidget: async (t, o = {}) => {
      var p, M, w;
      const a = $e(t), s = a.length ? a : ((p = R()) == null ? void 0 : p.selection.value.selectedIds) || [], c = H("copy-widget"), i = o.source || "api";
      b(), z();
      const u = e.widgetAdapter, l = I(), m = fe(c, "copy-widget", i, s), f = u != null && u.copyWidget ? await u.copyWidget(m) : u ? void 0 : {
        ok: !0,
        diagnostics: [K(
          "shell-widget-payload-unhandled",
          "info",
          "Widget adapter was not provided; copied layout/editor metadata only.",
          { actionId: c, actionType: "copy-widget", source: i, reason: "adapter-unavailable", recoverable: !0 }
        )]
      }, y = await ce("copy-widget", {
        type: "copy",
        targetIds: s,
        payload: {
          cols: (M = l == null ? void 0 : l.gridSettings) == null ? void 0 : M.columns,
          maxRows: (w = l == null ? void 0 : l.gridSettings) == null ? void 0 : w.maxRows,
          breakpoint: l == null ? void 0 : l.requestedBreakpoint,
          layoutId: l == null ? void 0 : l.layoutId,
          viewFormat: l == null ? void 0 : l.viewFormat
        }
      }, {
        source: i,
        itemIds: s,
        data: f,
        contextExtra: { payload: f },
        prepare: async (v) => {
          const T = await Te(v);
          return T || ((f == null ? void 0 : f.ok) === !1 ? f : null);
        }
      });
      return S = y.ok && (f == null ? void 0 : f.ok) !== !1 && (f != null && f.metadata) && f || null, y;
    },
    cutWidget: async (t, o = {}) => {
      var f;
      const a = $e(t), s = a.length ? a : ((f = R()) == null ? void 0 : f.selection.value.selectedIds) || [], c = H("cut-widget"), i = o.source || "api";
      if (b(), s.length === 0)
        return A("cut-widget", i, "selection-count", [], [], c);
      const u = await F.copyWidget(s, { source: i });
      if (!u.ok) return u;
      const l = ke("prepareRemoveWidget"), m = await ce("cut-widget", {
        id: c,
        type: "delete",
        targetIds: s
      }, {
        source: i,
        itemIds: s,
        data: { clipboardActionId: u.actionId },
        prepare: async (y) => {
          if (!o.skipConfirm && e.confirm) {
            const p = await e.confirm(y), M = lt(p);
            if (M) return M;
          }
          return (l == null ? void 0 : l(y)) || null;
        },
        commit: ye,
        rollback: pe
      });
      return m.ok && q(c, s), m;
    },
    placeClipboard: async (t, o = {}) => {
      var y, p, M, w, v, T, P;
      const a = R(), s = o.source || "api", c = H("place-clipboard");
      if (b(), !a) return A("place-clipboard", s, "missing-editor");
      const i = Ce(t, o), u = i === "auto" ? nt() : "cursor", l = Ee(o, u), m = be(t || null, o, u);
      if (!m.ok) return A("place-clipboard", s, m.reason, [], m.diagnostics);
      const f = await a.beginPlacement({
        source: "paste",
        commandType: "paste",
        strategy: l,
        ...De(o),
        placementIntent: i,
        placementAnchor: i === "here" ? "top-left" : void 0,
        cursor: m.position.source !== "none" ? {
          x: m.position.x,
          y: m.position.y,
          source: m.position.source === "event" ? "menu" : "api",
          clientX: m.position.clientX,
          clientY: m.position.clientY
        } : void 0,
        cols: ((p = (y = I()) == null ? void 0 : y.gridSettings) == null ? void 0 : p.columns) || m.position.cols || 12,
        maxRows: te((w = (M = I()) == null ? void 0 : M.gridSettings) == null ? void 0 : w.maxRows) ? ((v = I()) == null ? void 0 : v.gridSettings).maxRows : 1 / 0,
        origin: "dashboard-editor-shell"
      });
      return f.session ? (ut(f.session, {
        actionId: c,
        actionType: "place-clipboard",
        source: s,
        position: m.position,
        prepare: ke("preparePasteWidget"),
        commit: ye,
        rollback: pe,
        contextExtra: { placementIntent: i, payload: S || void 0 }
      }), at("place-clipboard", s, f.session, m.position, c)) : A(
        "place-clipboard",
        s,
        ((T = f.blocked) == null ? void 0 : T.reason) || "clipboard-unavailable",
        ((P = f.blocked) == null ? void 0 : P.itemIds) || [],
        [],
        c
      );
    },
    commitPlacement: async (t = {}) => {
      var m, f;
      const o = R(), a = t.source || "api";
      if (!o) return A("place-clipboard", a, "missing-editor");
      const s = (m = o.placementSession.value) == null ? void 0 : m.id, c = s && C.get(s) || null;
      c && (c.rollbackCheckpoint = o.createRollbackCheckpoint("shell-placement-write-back"));
      const i = await o.commitPlacement({
        source: Qe(a),
        autoCancelOnBlocked: t.autoCancelOnBlocked
      }), u = await ft(i);
      if (u) return u;
      const l = ((f = mt(i)) == null ? void 0 : f.pending) || c;
      return Kt(i, l || null, a);
    },
    pasteWidget: async (t, o = {}) => {
      var m, f, y, p, M;
      const a = O();
      if (o.placementMode === "interactive")
        return F.placeClipboard(t, o);
      if ((a == null ? void 0 : a.mode) === "interactive" && !t)
        return F.placeClipboard(t, {
          ...o,
          strategy: o.strategy || "cursor",
          placementIntent: o.placementIntent || "here",
          placementMode: "interactive"
        });
      const s = Ce(t, o), c = s === "auto" ? nt() : "cursor", i = Ee(o, c), u = be(t, o, c);
      if (!u.ok) return A("paste-widget", o.source || "api", u.reason, [], u.diagnostics);
      const l = ke("preparePasteWidget");
      return ce("paste-widget", {
        type: "paste",
        payload: {
          strategy: i,
          ...De(o),
          cursor: { x: u.position.x, y: u.position.y },
          cols: ((f = (m = I()) == null ? void 0 : m.gridSettings) == null ? void 0 : f.columns) || u.position.cols || 12,
          maxRows: te((p = (y = I()) == null ? void 0 : y.gridSettings) == null ? void 0 : p.maxRows) ? ((M = I()) == null ? void 0 : M.gridSettings).maxRows : 1 / 0,
          list: u.position.list,
          source: u.position.source,
          placementIntent: s,
          placementAnchor: s === "here" ? "top-left" : void 0
        }
      }, {
        source: o.source || "api",
        position: u.position,
        contextExtra: { placementIntent: s, payload: S || void 0 },
        prepare: l,
        commit: ye,
        rollback: pe
      });
    },
    duplicateWidget: async (t, o = {}) => {
      var i, u, l;
      const a = $e(t), s = a.length ? a : ((i = R()) == null ? void 0 : i.selection.value.selectedIds) || [], c = ke("prepareDuplicateWidget");
      return ce("duplicate-widget", {
        type: "duplicate",
        targetIds: s,
        payload: { strategy: "nearest-fit", cols: ((l = (u = I()) == null ? void 0 : u.gridSettings) == null ? void 0 : l.columns) || 12 }
      }, {
        source: o.source || "api",
        itemIds: s,
        prepare: c,
        commit: ye,
        rollback: pe
      });
    },
    removeWidget: async (t, o = {}) => {
      var u;
      const a = $e(t), s = a.length ? a : ((u = R()) == null ? void 0 : u.selection.value.selectedIds) || [], c = o.source || "api", i = ke("prepareRemoveWidget");
      return ce("remove-widget", {
        type: "delete",
        targetIds: s
      }, {
        source: c,
        itemIds: s,
        prepare: async (l) => {
          if (!o.skipConfirm && e.confirm) {
            const m = await e.confirm(l), f = lt(m);
            if (f) return f;
          }
          return (i == null ? void 0 : i(l)) || null;
        },
        commit: ye,
        rollback: pe
      });
    },
    copyWidgetReference: async (t, o = {}) => {
      const a = H("copy-reference"), s = o.source || "api", c = e.referenceAdapter;
      if (!(c != null && c.copyReference))
        return A("copy-reference", s, "adapter-unavailable", [t], [], a);
      const i = fe(a, "copy-reference", s, [t]), u = c.canCopyReference ? await c.canCopyReference(i) : { available: !0 };
      if (!u.available)
        return A("copy-reference", s, u.reason || "adapter-unavailable", [t], u.diagnostics || [], a);
      const l = await c.copyReference(i), m = j({
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
      return X(D, m, B()), m;
    },
    pasteWidgetReference: async (t, o = {}) => {
      var i, u, l, m, f, y, p;
      if (!((i = e.referenceAdapter) != null && i.preparePasteReference))
        return A("paste-reference", o.source || "api", "adapter-unavailable");
      const a = Ce(t, o), s = Ee(o, "cursor"), c = be(t, o, "cursor");
      return c.ok ? ce("paste-reference", {
        type: "add",
        payload: {
          item: { i: `reference-${Date.now().toString(36)}`, x: c.position.x, y: c.position.y, w: ((u = o.itemSize) == null ? void 0 : u.w) || 2, h: ((l = o.itemSize) == null ? void 0 : l.h) || 2 },
          strategy: s,
          cursor: { x: c.position.x, y: c.position.y },
          cols: ((f = (m = I()) == null ? void 0 : m.gridSettings) == null ? void 0 : f.columns) || 12,
          maxRows: ((p = (y = I()) == null ? void 0 : y.gridSettings) == null ? void 0 : p.maxRows) || 1 / 0,
          list: c.position.list,
          placementIntent: a,
          placementAnchor: a === "here" ? "top-left" : void 0
        }
      }, {
        source: o.source || "api",
        position: c.position,
        contextExtra: { placementIntent: a },
        prepare: async (M) => {
          var v, T;
          const w = await ((v = rt("preparePasteReference")) == null ? void 0 : v(M));
          return w && "kind" in w && ((T = w.newIds) != null && T[0]) && (M.payload = { itemId: w.newIds[0] }), w;
        },
        commit: it,
        rollback: dt
      }) : A("paste-reference", o.source || "api", c.reason, [], c.diagnostics);
    },
    replaceReferenceWithWidgetCopy: async (t, o = {}) => {
      var i;
      if (!((i = e.referenceAdapter) != null && i.prepareReplaceReferenceWithWidgetCopy))
        return A("replace-reference", o.source || "api", "adapter-unavailable", [t]);
      const a = o.source || "api", s = H("replace-reference"), c = fe(s, "replace-reference", a, [t]);
      return Ue({
        actionId: s,
        actionType: "replace-reference",
        source: a,
        itemIds: [t],
        context: c,
        profile: B(),
        emit: D,
        prepare: rt("prepareReplaceReferenceWithWidgetCopy"),
        mutate: (u) => {
          var l, m;
          return {
            status: "success",
            affectedIds: (l = u == null ? void 0 : u.newIds) != null && l.length ? u.newIds : [t],
            data: { sourceItemId: t, newItemId: (m = u == null ? void 0 : u.newIds) == null ? void 0 : m[0] }
          };
        },
        commit: it,
        rollback: dt
      });
    },
    openWidgetPalette: async (t, o = {}) => {
      var p;
      const a = H("open-palette"), s = o.source || "api";
      if (!((p = e.palette) != null && p.open))
        return A("open-palette", s, "adapter-unavailable", [], [], a);
      const c = Ce(t, o), i = be(t, o, "cursor"), u = fe(a, "open-palette", s, [], i.ok ? i.position : void 0, { placementIntent: c }), l = await Te(u);
      if (l)
        return A("open-palette", s, l.reason || "guard-blocked", [], l.diagnostics || [], a);
      const m = await e.palette.open(u);
      if (m && typeof m == "object" && "ok" in m && !m.ok)
        return A("open-palette", s, m.reason || "adapter-rejected", [], m.diagnostics || [], a);
      const f = Array.isArray(m) ? m : m && typeof m == "object" && !("ok" in m) ? [m] : [];
      if (f.length && o.autoAddReturnedTemplate !== !1)
        return F.addWidgetFromTemplate(f[0], i.ok ? i.position : null, {
          source: "palette",
          strategy: o.strategy,
          placementIntent: c,
          placementMode: o.placementMode
        });
      const y = j({
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
      return X(D, y, B()), y;
    },
    addWidgetFromTemplate: async (t, o, a = {}) => {
      var l, m, f, y, p, M, w, v, T, P, Q;
      const s = Ce(o, a), c = Ee(a, "cursor"), i = be(o, { ...a, itemSize: { w: t.w || 2, h: t.h || 2 } }, "cursor");
      if (!i.ok) return A("add-widget", a.source || "api", i.reason, [], i.diagnostics);
      const u = ke("prepareAddWidget");
      if (a.placementMode === "interactive") {
        const $ = R(), E = a.source || "api", Se = H("add-widget");
        if (!$) return A("add-widget", E, "missing-editor");
        const le = await $.beginPlacement({
          source: "template",
          commandType: "add",
          items: [{
            ...t,
            i: t.i || t.id,
            x: te(t.x) ? t.x : i.position.x,
            y: te(t.y) ? t.y : i.position.y,
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
          ...De(a),
          placementIntent: s,
          placementAnchor: s === "here" ? "top-left" : void 0,
          cursor: {
            x: i.position.x,
            y: i.position.y,
            source: i.position.source === "event" ? "menu" : "api",
            clientX: i.position.clientX,
            clientY: i.position.clientY
          },
          cols: ((m = (l = I()) == null ? void 0 : l.gridSettings) == null ? void 0 : m.columns) || i.position.cols || 12,
          maxRows: te((y = (f = I()) == null ? void 0 : f.gridSettings) == null ? void 0 : y.maxRows) ? ((p = I()) == null ? void 0 : p.gridSettings).maxRows : 1 / 0,
          origin: "dashboard-editor-shell"
        });
        return le.session ? (ut(le.session, {
          actionId: Se,
          actionType: "add-widget",
          source: E,
          position: i.position,
          contextExtra: { placementIntent: s, template: t, payload: t.payload },
          prepare: u,
          commit: ye,
          rollback: pe
        }), at("add-widget", E, le.session, i.position, Se)) : A("add-widget", E, ((M = le.blocked) == null ? void 0 : M.reason) || "invalid-input", ((w = le.blocked) == null ? void 0 : w.itemIds) || []);
      }
      return ce("add-widget", {
        type: "add",
        payload: {
          item: {
            ...t,
            i: t.i || t.id,
            x: te(t.x) ? t.x : i.position.x,
            y: te(t.y) ? t.y : i.position.y,
            w: t.w || 2,
            h: t.h || 2
          },
          strategy: c,
          ...De(a),
          cursor: { x: i.position.x, y: i.position.y },
          cols: ((T = (v = I()) == null ? void 0 : v.gridSettings) == null ? void 0 : T.columns) || 12,
          maxRows: ((Q = (P = I()) == null ? void 0 : P.gridSettings) == null ? void 0 : Q.maxRows) || 1 / 0,
          list: i.position.list,
          placementIntent: s,
          placementAnchor: s === "here" ? "top-left" : void 0
        }
      }, {
        source: a.source || "api",
        position: i.position,
        contextExtra: { template: t, payload: t.payload, placementIntent: s },
        prepare: u,
        commit: ye,
        rollback: pe
      }).then(($) => {
        const E = $.affectedIds[0];
        return $.ok && E && (F.selectItem(E, { source: a.source || "api" }), F.highlightItem(E, { source: a.source || "api", durationMs: 1200 })), $;
      });
    },
    handleExternalDrop: async (t, o, a = {}) => {
      const s = ge(o, { source: "drop" });
      if (!s.ok) return A("external-drop", "drop", s.reason, [], s.diagnostics);
      if (t.preview) {
        const c = j({
          ok: !0,
          status: "success",
          actionId: H("external-drop"),
          actionType: "external-drop",
          source: "drop",
          itemIds: [],
          affectedIds: [],
          position: s.position,
          data: { preview: !0, payload: t.metadata },
          diagnostics: s.diagnostics
        });
        return X(D, c, B()), c;
      }
      return F.addWidgetFromTemplate(t.template || { w: 2, h: 2, payload: t.payload }, s.position, {
        source: a.source || "drop",
        strategy: a.strategy
      });
    },
    moveAllWidgets: async (t, o, a = {}) => {
      var f, y;
      const s = H("move-all"), c = a.source || "api", i = I(), u = ee();
      if (!i) return A("move-all", c, "missing-runtime", [], [], s);
      if (!te(t) || !te(o))
        return A("move-all", c, "invalid-input", [], [], s);
      const l = fe(s, "move-all", c, i.activeItemIds), m = await Te(l);
      if (m) return A("move-all", c, m.reason || "guard-blocked", i.activeItemIds, m.diagnostics || [], s);
      if (u) {
        const p = Ut(u, {
          layoutId: i.layoutId,
          profileId: i.resolvedProfileId,
          dx: t,
          dy: o,
          clampNegative: a.clampNegative !== !1,
          policy: a.repair,
          createMissingProfile: e.createMissingProfileOnEdit
        }), M = p.diagnostics.map(
          (v) => K(
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
        p.ok && (Re(p.document), xe(s, p.document, i));
        const w = j({
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
          diagnostics: M
        });
        return X(D, w, B()), w;
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
    undo: async (t = {}) => st("undo", t),
    redo: async (t = {}) => st("redo", t),
    bindKeyboard: (t) => {
      const o = e.keyboard && typeof e.keyboard == "object" ? e.keyboard : {}, a = t || o.target || (typeof window != "undefined" ? window : null), s = typeof a == "string" && typeof document != "undefined" ? document.querySelector(a) || window : a;
      if (!s || typeof s.addEventListener != "function")
        return () => {
        };
      const c = (u) => {
        var T;
        const l = u;
        if (bo(l, o)) return;
        const m = ko(o.platform), y = (o.shortcuts || wo).find((P) => vo(l, P, m));
        if (!y) return;
        l.preventDefault(), l.stopPropagation(), l.stopImmediatePropagation();
        const p = y.source || "keyboard", M = ((T = R()) == null ? void 0 : T.selection.value.selectedIds) || [], w = (P = {}) => xo(o, y, P, p);
        (async () => {
          var P, Q;
          if (y.action === "copy-widget")
            return F.copyWidget(M, { source: p });
          if (y.action === "cut-widget")
            return F.cutWidget(M, { source: p });
          if (y.action === "copy-reference")
            return M[0] ? F.copyWidgetReference(M[0], { source: p }) : A("copy-reference", p, "selection-count");
          if (y.action === "paste-widget" || y.action === "paste")
            return F.pasteWidget(null, w());
          if (y.action === "place-clipboard")
            return F.placeClipboard(null, w({
              strategy: "cursor",
              placementIntent: "here",
              placementMode: "interactive"
            }));
          if (y.action === "paste-reference")
            return F.pasteWidgetReference(null, w({
              strategy: (P = e.menu) == null ? void 0 : P.defaultReferencePasteStrategy
            }));
          if (y.action === "remove-widget") return F.removeWidget(M, { source: p });
          if (y.action === "undo") return F.undo({ source: p });
          if (y.action === "redo") return F.redo({ source: p });
          if (y.action === "open-palette")
            return F.openWidgetPalette(null, w({
              strategy: (Q = e.menu) == null ? void 0 : Q.defaultAddStrategy
            }));
          if (y.action === "prepare-dashboard-menu")
            return F.prepareDashboardContextMenu(null, { source: p }), null;
          if (y.action === "move-all") {
            const $ = o.moveAllStep || { dx: 0, dy: 1 };
            return F.moveAllWidgets($.dx, $.dy, { source: p });
          }
          return null;
        })().then((P) => {
          var Q, $, E;
          P && !P.ok && ((E = e.onMessage) == null || E.call(e, {
            code: ((Q = P.diagnostics[0]) == null ? void 0 : Q.code) || P.status,
            level: P.status === "error" ? "error" : "warning",
            message: (($ = P.diagnostics[0]) == null ? void 0 : $.message) || `Action ${P.actionType} was not applied.`,
            itemIds: P.itemIds,
            recoverable: P.status !== "error"
          }));
        });
      };
      s.addEventListener("keydown", c, !0);
      const i = () => s.removeEventListener("keydown", c, !0);
      return g.push(i), i;
    },
    stop: () => Ve()
  }, jt = (t) => {
    if (!t || typeof t.addEventListener != "function") return () => {
    };
    const o = (a) => {
      const s = ge(a, { source: "pointer" });
      s.ok && (r.value = { ...r.value, lastPointerPosition: s.position });
    };
    return t.addEventListener("pointermove", o), t.addEventListener("mousemove", o), t.addEventListener("contextmenu", o), () => {
      t.removeEventListener("pointermove", o), t.removeEventListener("mousemove", o), t.removeEventListener("contextmenu", o);
    };
  };
  d.push(Le(
    () => {
      var t, o, a, s;
      return [
        I(),
        (t = R()) == null ? void 0 : t.selection.value,
        (o = R()) == null ? void 0 : o.dirty.value,
        (a = R()) == null ? void 0 : a.conflict.value,
        (s = R()) == null ? void 0 : s.lastResult.value,
        he(e.mode),
        G()
      ];
    },
    ot,
    { deep: !0, immediate: !0 }
  )), d.push(Le(
    () => {
      var t;
      return (t = R()) == null ? void 0 : t.lastResult.value;
    },
    (t) => {
      t && ft(t);
    }
  ));
  let re = null;
  const Xt = (t) => {
    if (ne()) {
      if (t.type === "command-start") {
        if (Y.has(t.command.id || "") || !Je(t.command)) return;
        const o = R();
        o && t.command.id && N.set(
          t.command.id,
          o.createRollbackCheckpoint("shell-managed-command-start")
        );
        return;
      }
      if (t.type === "command-blocked" || t.type === "command-error") {
        if (Y.has(t.result.id)) {
          N.delete(t.result.id);
          return;
        }
        zt(t.command, t.result);
        return;
      }
      if (t.type === "command-commit") {
        if (Y.has(t.result.id)) return;
        Ht(t.command, t.result);
      }
    }
  };
  d.push(Le(
    () => R(),
    (t) => {
      re == null || re(), re = null, t && (re = t.subscribe(Xt));
    },
    { immediate: !0 }
  ));
  let de = null;
  d.push(Le(
    () => G(),
    (t) => {
      de == null || de(), de = jt(t);
    },
    { immediate: !0 }
  )), e.keyboard && e.keyboard.enabled !== !1 && g.push(F.bindKeyboard());
  const Ve = () => {
    if (h) return;
    h = !0, d.forEach((a) => a()), g.splice(0).forEach((a) => a()), re == null || re(), re = null, de == null || de(), de = null, k && (clearTimeout(k), k = null);
    const t = H("cleanup");
    r.value = {
      ...r.value,
      menu: null,
      highlightedId: null,
      lastMenuPosition: null
    };
    const o = [K(
      "shell-cleanup",
      "info",
      "Dashboard editor shell cleanup completed.",
      { actionId: t, actionType: "cleanup", source: "lifecycle" }
    )];
    D({ type: "cleanup", actionId: t, diagnostics: o });
  };
  return Nt() && qt(Ve), ot(), {
    state: Gt(r),
    actions: F,
    stop: Ve
  };
}
export {
  lo as buildDashboardContextMenu,
  uo as buildWidgetContextMenu,
  H as createDashboardEditorShellActionId,
  K as createDashboardEditorShellDiagnostic,
  j as createDashboardEditorShellResult,
  _e as diagnosticFromUnknownError,
  X as emitShellResult,
  no as getEventGridPosition,
  co as profileContextFromRuntime,
  Ze as resolveShellPosition,
  Ue as runDashboardEditorShellTransaction,
  ve as stableDiagnostics,
  Co as useDashboardEditorShell
};
