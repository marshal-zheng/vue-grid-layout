import { j as O, n as j } from "./migration-CPonYzEY.mjs";
const C = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), D = [
  "locked",
  "visible",
  "editable",
  "draggable",
  "resizable",
  "deletable",
  "duplicatable",
  "copyable"
], A = (e, t) => Object.prototype.hasOwnProperty.call(e, t), I = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || t === null;
}, p = (e) => !C.has(e), w = (e, t, s) => {
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return typeof e == "number" && !Number.isFinite(e) ? (s.push({
      code: "non-json-value",
      path: t,
      message: "Metadata numbers must be finite."
    }), !1) : !0;
  if (Array.isArray(e)) {
    let r = !0;
    for (let a = 0; a < e.length; a++)
      r = w(e[a], `${t}[${a}]`, s) && r;
    return r;
  }
  if (I(e)) {
    let r = !0;
    return Object.keys(e).forEach((a) => {
      if (!p(a)) {
        s.push({
          code: "unsafe-key",
          path: `${t}.${a}`,
          message: "Metadata contains a reserved key."
        }), r = !1;
        return;
      }
      r = w(e[a], `${t}.${a}`, s) && r;
    }), r;
  }
  return s.push({
    code: "non-json-value",
    path: t,
    message: "Metadata must contain JSON-safe values only."
  }), !1;
}, R = (e, t, s) => {
  const r = `editorMetaById.${t}`;
  if (!I(e))
    return s.push({
      code: "invalid-field",
      path: r,
      message: "Item metadata must be a plain object."
    }), null;
  const a = {};
  if (D.forEach((o) => {
    const i = e[o];
    if (typeof i != "undefined") {
      if (typeof i != "boolean") {
        s.push({
          code: "invalid-field",
          path: `${r}.${String(o)}`,
          message: "Editor capability metadata fields must be boolean."
        });
        return;
      }
      a[o] = i;
    }
  }), typeof e.label != "undefined" && (typeof e.label == "string" ? a.label = e.label : s.push({
    code: "invalid-field",
    path: `${r}.label`,
    message: "Editor metadata label must be a string."
  })), typeof e.resizeHandles != "undefined") {
    const o = j(e.resizeHandles);
    o && o.length === e.resizeHandles.length ? a.resizeHandles = o : s.push({
      code: "invalid-field",
      path: `${r}.resizeHandles`,
      message: "Editor metadata resizeHandles must be valid resize handle values."
    });
  }
  return typeof e.data != "undefined" && (I(e.data) && w(e.data, `${r}.data`, s) ? a.data = { ...e.data } : I(e.data) || s.push({
    code: "invalid-field",
    path: `${r}.data`,
    message: "Editor metadata data must be a JSON-safe object."
  })), a;
}, H = (e, t = {}) => {
  const s = [], r = [], a = {};
  if (e == null)
    return { ok: !0, value: a, errors: s, warnings: r };
  if (!I(e))
    return s.push({
      code: "invalid-root",
      path: "editorMetaById",
      message: "Editor metadata must be a plain object keyed by item id."
    }), { ok: !1, value: a, errors: s, warnings: r };
  const o = t.layout ? new Set(t.layout.map((i) => i.i)) : null;
  return Object.keys(e).forEach((i) => {
    if (!p(i) || typeof i != "string" || i.length === 0) {
      s.push({
        code: p(i) ? "invalid-id" : "unsafe-key",
        path: `editorMetaById.${i}`,
        message: "Editor metadata id must be a safe non-empty string."
      });
      return;
    }
    if (o && !o.has(i)) {
      const c = {
        code: "orphan-meta",
        path: `editorMetaById.${i}`,
        message: "Editor metadata references an item that is not in layout."
      };
      if (t.removeOrphans !== !1) {
        r.push(c);
        return;
      }
      s.push(c);
      return;
    }
    const n = R(e[i], i, s);
    n && (a[i] = n);
  }), {
    ok: s.length === 0,
    value: a,
    errors: s,
    warnings: r
  };
}, $ = (e, t = {}) => H(e, t).value, X = $, Z = (e, t) => $(e, { layout: t }), G = (e, t, s) => s ? { type: "set", id: e, previous: t, next: s } : t ? { type: "remove", id: e, previous: t } : null, L = (e, t) => {
  if (t.length === 0) return e;
  const s = { ...e };
  return t.forEach((r) => {
    if (r.type === "remove") {
      delete s[r.id];
      return;
    }
    s[r.id] = { ...r.next };
  }), s;
}, x = (e, t, s) => {
  const r = e[t], a = s == null ? void 0 : R({ ...r || {}, ...s }, t, []) || {}, o = G(t, r, a);
  return {
    metaById: o ? L(e, [o]) : e,
    patch: o
  };
}, V = (e, t) => {
  var s;
  return ((s = e[t]) == null ? void 0 : s.visible) !== !1;
}, ee = (e, t) => e.filter((s) => V(t, s.i)), _ = (e, t, s = {}) => {
  const r = O({
    item: e,
    editor: t,
    defaults: {
      draggable: s.isDraggable !== !1,
      resizable: s.isResizable !== !1,
      bounded: s.isBounded !== !1,
      deletable: s.defaultDeletable !== !1,
      duplicatable: s.defaultDuplicatable !== !1,
      copyable: s.defaultCopyable !== !1
    }
  });
  return {
    id: e.i,
    locked: r.locked,
    visible: r.visible,
    editable: r.editable,
    draggable: r.draggable,
    resizable: r.resizable,
    bounded: r.bounded,
    deletable: r.deletable,
    duplicatable: r.duplicatable,
    copyable: r.copyable,
    resizeHandles: r.resizeHandles,
    diagnostics: r.diagnostics,
    source: {
      layoutStatic: e.static === !0,
      layoutDraggable: typeof e.isDraggable == "boolean" ? e.isDraggable : !e.static && s.isDraggable !== !1,
      layoutResizable: typeof e.isResizable == "boolean" ? e.isResizable : !e.static && s.isResizable !== !1,
      layoutBounded: e.isBounded,
      metaLocked: t == null ? void 0 : t.locked,
      metaVisible: t == null ? void 0 : t.visible,
      metaEditable: t == null ? void 0 : t.editable,
      capabilitySources: r.sources
    }
  };
}, se = (e, t, s = {}) => {
  const r = {};
  return e.forEach((a) => {
    r[a.i] = _(a, t[a.i], s);
  }), r;
}, M = (e) => !e || typeof e != "object" ? !1 : Array.isArray(e) ? e.some(M) : I(e) ? Object.keys(e).some((t) => C.has(t) ? !0 : M(e[t])) : !1, te = (e, t, s) => !!(e[t] && A(e[t], String(s)));
let q = 0;
const h = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, re = (e) => ({
  ...e,
  id: e.id || `editor-command:${e.type}:${++q}`
}), ae = (e, t) => {
  var r, a;
  if (typeof e == "string") return { mode: e };
  if (e != null && e.skip)
    return {
      ...e,
      mode: "ignore",
      preserveRedoStack: (r = e.preserveRedoStack) != null ? r : !0
    };
  const s = (e == null ? void 0 : e.mode) || t;
  return {
    ...e,
    mode: s,
    preserveRedoStack: (a = e == null ? void 0 : e.preserveRedoStack) != null ? a : s === "ignore" || s === "record-preserveRedoStack"
  };
}, K = (e) => e === "select" || e === "clearSelection", B = (e) => e === "lock" || e === "unlock" || e === "show" || e === "hide", k = (e) => e === "section-row-collapse" || e === "section-row-expand" || e === "section-row-move" || e === "section-row-delete" || e === "section-row-reorder", P = (e) => e === "move" || e === "resize" || e === "add" || e === "delete" || e === "duplicate" || e === "paste" || e === "align" || e === "distribute" || e === "tidy", oe = (e) => e === "save" || e === "discard" || e === "reset", F = (e) => e === "undo" || e === "redo", ie = (e) => P(e) || B(e) || k(e), de = (e) => K(e) || F(e) ? "ignore" : P(e) || B(e) || k(e) ? "record" : "ignore", m = (e, t, s = {}) => {
  var r, a, o, i, n, c, u, g, d, l, b, y, E, v;
  return {
    id: e.id,
    type: e.type,
    status: t,
    targetIds: s.targetIds || [],
    layoutPatches: s.layoutPatches || [],
    metadataPatches: s.metadataPatches || [],
    affectedIds: s.affectedIds || s.targetIds || [],
    selection: s.selection,
    blocked: s.blocked,
    diagnostics: {
      durationMs: ((r = s.diagnostics) == null ? void 0 : r.durationMs) || 0,
      guardMs: (a = s.diagnostics) == null ? void 0 : a.guardMs,
      guideCount: (o = s.diagnostics) == null ? void 0 : o.guideCount,
      layoutDiagnostics: (i = s.diagnostics) == null ? void 0 : i.layoutDiagnostics,
      operationResult: (n = s.diagnostics) == null ? void 0 : n.operationResult,
      intelligence: (c = s.diagnostics) == null ? void 0 : c.intelligence,
      computed: (u = s.diagnostics) == null ? void 0 : u.computed,
      messages: (g = s.diagnostics) == null ? void 0 : g.messages,
      pendingScope: (d = s.diagnostics) == null ? void 0 : d.pendingScope,
      stateRevision: (l = s.diagnostics) == null ? void 0 : l.stateRevision,
      stale: (b = s.diagnostics) == null ? void 0 : b.stale,
      historyMode: (y = s.diagnostics) == null ? void 0 : y.historyMode,
      source: (E = s.diagnostics) == null ? void 0 : E.source,
      origin: (v = s.diagnostics) == null ? void 0 : v.origin
    },
    undo: s.undo,
    error: s.error
  };
}, f = (e, t, s = {}) => {
  var r, a, o;
  return m(e, "blocked", {
    ...s,
    blocked: {
      reason: t,
      itemIds: ((r = s.blocked) == null ? void 0 : r.itemIds) || s.targetIds,
      message: (a = s.blocked) == null ? void 0 : a.message,
      skippedIds: (o = s.blocked) == null ? void 0 : o.skippedIds
    }
  });
}, z = (e, t, s) => m(e, "error", {
  error: { message: t, cause: s }
}), N = (e, t, s) => {
  if (e.targetIds) return Array.from(new Set(e.targetIds.filter(Boolean)));
  if (e.type === "select") {
    const a = e.payload;
    if (a != null && a.ids) return Array.from(new Set(a.ids.filter(Boolean)));
    if (a != null && a.id) return [a.id];
  }
  if (e.type === "add" || e.type === "paste") return [];
  if (k(e.type)) {
    const a = e.payload;
    return Array.isArray(a == null ? void 0 : a.ids) ? Array.from(new Set(a.ids.filter(Boolean))) : a != null && a.id ? [a.id] : [];
  }
  const r = t.selectedIds.filter(Boolean);
  return r.length > 0 ? r : s.length > 0 && t.activeId ? [t.activeId] : [];
}, T = (e, t) => {
  const s = new Set(e.map((r) => r.i));
  return t.filter((r) => !s.has(r));
}, J = (e) => e === "move" || e === "align" || e === "distribute" || e === "tidy" ? "draggable" : e === "resize" ? "resizable" : e === "delete" ? "deletable" : e === "duplicate" ? "duplicatable" : e === "copy" ? "copyable" : e === "hide" || e === "lock" ? "editable" : null, U = (e) => e === "align" ? 2 : e === "distribute" || e === "tidy" ? 3 : 0, S = (e, t) => !!e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, t), Y = (e) => {
  const t = e.payload;
  if (e.type === "align") {
    const s = t == null ? void 0 : t.mode;
    return s === "left" || s === "center-x" || s === "right" || s === "top" || s === "center-y" || s === "bottom";
  }
  if (e.type === "distribute") {
    const s = t == null ? void 0 : t.mode, r = t == null ? void 0 : t.strategy;
    return (s === "horizontal" || s === "vertical" || s === "spacing-x" || s === "spacing-y") && (!S(t, "strategy") || r === "edge-to-edge" || r === "center-to-center");
  }
  if (e.type === "tidy") {
    const s = t == null ? void 0 : t.axis;
    return !S(t, "axis") || s === "x" || s === "y" || s === "both";
  }
  return k(e.type) ? typeof (t == null ? void 0 : t.id) == "string" && t.id.length > 0 : !0;
}, Q = (e, t, s) => {
  const r = t[e.i];
  return r != null && r.locked ? "locked" : (r == null ? void 0 : r.visible) === !1 ? "hidden" : e.static ? "static-item" : s;
}, le = (e, t) => {
  const s = N(
    e,
    t.selection,
    t.layout
  );
  if (t.modeMissing)
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: f(e, "editor-mode-missing", {
        targetIds: s,
        blocked: { reason: "editor-mode-missing", itemIds: s }
      })
    };
  if (t.mode === "view")
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: f(e, "mode-readonly", {
        targetIds: s,
        blocked: { reason: "mode-readonly", itemIds: s }
      })
    };
  if (e.type === "resize" && s.length > 1)
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: f(e, "multi-resize-unsupported", {
        targetIds: s
      })
    };
  const r = U(e.type);
  if (r > 0 && s.length < r)
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: f(e, "selection-count", {
        targetIds: s,
        blocked: {
          reason: "selection-count",
          itemIds: s,
          message: `${e.type} requires at least ${r} selected items.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: "grid-editor.command.selection-count",
            level: "warning",
            message: `${e.type} requires at least ${r} selected items.`,
            itemIds: s,
            recoverable: !0
          }]
        }
      })
    };
  if (!Y(e))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: f(e, "invalid-input", {
        targetIds: s,
        blocked: {
          reason: "invalid-input",
          itemIds: s,
          message: `Invalid ${e.type} command payload.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: "grid-editor.command.invalid-input",
            level: "error",
            message: `Invalid ${e.type} command payload.`,
            itemIds: s,
            recoverable: !0
          }]
        }
      })
    };
  if (s.length === 0 && ![
    "add",
    "paste",
    "clearSelection",
    "save",
    "discard",
    "reset",
    "undo",
    "redo",
    "section-row-collapse",
    "section-row-expand",
    "section-row-move",
    "section-row-delete",
    "section-row-reorder"
  ].includes(e.type))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: [],
      result: f(e, "missing-item", {
        targetIds: s
      })
    };
  const a = T(t.layout, s);
  if (a.length > 0 && e.type !== "select" && !k(e.type))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: a,
      result: f(e, "missing-item", {
        targetIds: s,
        blocked: { reason: "missing-item", itemIds: a }
      })
    };
  const o = J(e.type);
  if (!o)
    return {
      ok: !0,
      targetIds: s,
      allowedIds: s,
      blockedIds: []
    };
  const i = [], n = [];
  let c = "capability";
  return s.forEach((u) => {
    var l;
    const g = t.layout.find((b) => b.i === u);
    if (!g) {
      n.push(u), c = "missing-item";
      return;
    }
    (((l = t.itemCapabilities) == null ? void 0 : l[u]) || _(
      g,
      t.editorMetaById[u],
      {
        isDraggable: t.isDraggable,
        isResizable: t.isResizable,
        isBounded: t.isBounded
      }
    ))[o] ? i.push(u) : (n.push(u), c = Q(g, t.editorMetaById, "capability"));
  }), n.length > 0 && t.commandPolicy !== "skip-blocked" ? {
    ok: !1,
    targetIds: s,
    allowedIds: [],
    blockedIds: n,
    result: f(e, c, {
      targetIds: s,
      blocked: { reason: c, itemIds: n }
    })
  } : i.length === 0 && s.length > 0 ? {
    ok: !1,
    targetIds: s,
    allowedIds: i,
    blockedIds: n,
    result: f(e, c, {
      targetIds: s,
      blocked: { reason: c, itemIds: n }
    })
  } : {
    ok: !0,
    targetIds: s,
    allowedIds: i,
    blockedIds: n
  };
}, ne = async (e, t, s, r = 5e3) => {
  var n, c;
  if (!e) return { guardMs: 0 };
  const a = h();
  let o = null, i = null;
  try {
    if ((n = s.signal) != null && n.aborted)
      return {
        guardMs: 0,
        result: m(t, "cancelled", {
          targetIds: s.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: s.targetIds,
            message: "beforeCommand guard was aborted."
          },
          diagnostics: { durationMs: 0, guardMs: 0 }
        })
      };
    const u = Promise.resolve(e({ ...s, command: t })), g = s.signal ? new Promise((b) => {
      var y;
      i = () => b("__aborted__"), (y = s.signal) == null || y.addEventListener("abort", i, { once: !0 });
    }) : null, d = await Promise.race([
      u,
      ...g ? [g] : [],
      new Promise((b) => {
        o = setTimeout(() => b("__timeout__"), r);
      })
    ]), l = h() - a;
    return d === "__aborted__" ? {
      guardMs: l,
      result: m(t, "cancelled", {
        targetIds: s.targetIds,
        blocked: {
          reason: "guard-aborted",
          itemIds: s.targetIds,
          message: "beforeCommand guard was aborted."
        },
        diagnostics: { durationMs: 0, guardMs: l }
      })
    } : d === "__timeout__" ? {
      guardMs: l,
      result: m(t, "timeout", {
        targetIds: s.targetIds,
        blocked: {
          reason: "before-command-timeout",
          itemIds: s.targetIds,
          message: "beforeCommand guard timed out."
        },
        diagnostics: { durationMs: 0, guardMs: l }
      })
    } : d === !1 ? {
      guardMs: l,
      result: f(t, "before-command-blocked", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: l }
      })
    } : !d || d === !0 || d.status === "allow" ? { guardMs: l } : d.status === "cancel" ? {
      guardMs: l,
      result: m(t, "cancelled", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: l },
        blocked: {
          reason: "before-command-cancelled",
          itemIds: s.targetIds,
          message: d.message
        }
      })
    } : d.status === "timeout" ? {
      guardMs: l,
      result: m(t, "timeout", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: l },
        blocked: {
          reason: "before-command-timeout",
          itemIds: s.targetIds,
          message: d.message
        }
      })
    } : d.status === "error" ? {
      guardMs: l,
      result: z(
        t,
        d.message || "beforeCommand guard failed.",
        d.error
      )
    } : {
      guardMs: l,
      result: f(
        t,
        d.reason || "before-command-blocked",
        {
          targetIds: s.targetIds,
          blocked: {
            reason: d.reason || "before-command-blocked",
            itemIds: s.targetIds,
            message: d.message
          },
          diagnostics: { durationMs: 0, guardMs: l }
        }
      )
    };
  } catch (u) {
    return {
      guardMs: h() - a,
      result: z(
        t,
        "beforeCommand guard failed.",
        u
      )
    };
  } finally {
    o && clearTimeout(o), i && ((c = s.signal) == null || c.removeEventListener("abort", i));
  }
}, ce = (e, t) => {
  const s = [], r = new Map(e.map((o) => [o.i, o])), a = new Map(t.map((o) => [o.i, o]));
  return t.forEach((o) => {
    const i = r.get(o.i);
    if (!i) {
      s.push({ type: "add", item: o });
      return;
    }
    (i.w !== o.w || i.h !== o.h || i.x !== o.x || i.y !== o.y) && (i.w !== o.w || i.h !== o.h ? s.push({
      type: "resize",
      id: o.i,
      from: {
        x: i.x,
        y: i.y,
        w: i.w,
        h: i.h
      },
      to: { x: o.x, y: o.y, w: o.w, h: o.h }
    }) : s.push({
      type: "move",
      id: o.i,
      from: { x: i.x, y: i.y },
      to: { x: o.x, y: o.y }
    }));
  }), e.forEach((o) => {
    a.has(o.i) || s.push({ type: "remove", id: o.i });
  }), s;
}, ue = (e, t, s) => ({
  durationMs: e,
  guardMs: t,
  layoutDiagnostics: s
}), fe = (e, t) => {
  const s = /* @__PURE__ */ new Set();
  return e.forEach((r) => {
    r.type === "add" ? s.add(r.item.i) : r.type === "compact" ? r.affectedIds.forEach((a) => s.add(a)) : s.add(r.id);
  }), t.forEach((r) => s.add(r.id)), Array.from(s);
};
export {
  _ as A,
  N as B,
  ne as C,
  $ as D,
  ie as E,
  H as F,
  L as a,
  f as b,
  le as c,
  fe as d,
  ce as e,
  G as f,
  m as g,
  de as h,
  z as i,
  ee as j,
  te as k,
  M as l,
  V as m,
  F as n,
  P as o,
  B as p,
  oe as q,
  k as r,
  K as s,
  ue as t,
  X as u,
  re as v,
  ae as w,
  x,
  Z as y,
  se as z
};
