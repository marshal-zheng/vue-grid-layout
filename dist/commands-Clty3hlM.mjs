const R = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), O = [
  "locked",
  "visible",
  "editable",
  "draggable",
  "resizable",
  "deletable",
  "duplicatable",
  "copyable"
], j = (e, t) => Object.prototype.hasOwnProperty.call(e, t), k = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || t === null;
}, w = (e) => !R.has(e), m = (e, t, s) => {
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return typeof e == "number" && !Number.isFinite(e) ? (s.push({
      code: "non-json-value",
      path: t,
      message: "Metadata numbers must be finite."
    }), !1) : !0;
  if (Array.isArray(e)) {
    let r = !0;
    for (let o = 0; o < e.length; o++)
      r = m(e[o], `${t}[${o}]`, s) && r;
    return r;
  }
  if (k(e)) {
    let r = !0;
    return Object.keys(e).forEach((o) => {
      if (!w(o)) {
        s.push({
          code: "unsafe-key",
          path: `${t}.${o}`,
          message: "Metadata contains a reserved key."
        }), r = !1;
        return;
      }
      r = m(e[o], `${t}.${o}`, s) && r;
    }), r;
  }
  return s.push({
    code: "non-json-value",
    path: t,
    message: "Metadata must contain JSON-safe values only."
  }), !1;
}, z = (e, t, s) => {
  const r = `editorMetaById.${t}`;
  if (!k(e))
    return s.push({
      code: "invalid-field",
      path: r,
      message: "Item metadata must be a plain object."
    }), null;
  const o = {};
  return O.forEach((a) => {
    const i = e[a];
    if (typeof i != "undefined") {
      if (typeof i != "boolean") {
        s.push({
          code: "invalid-field",
          path: `${r}.${String(a)}`,
          message: "Editor capability metadata fields must be boolean."
        });
        return;
      }
      o[a] = i;
    }
  }), typeof e.label != "undefined" && (typeof e.label == "string" ? o.label = e.label : s.push({
    code: "invalid-field",
    path: `${r}.label`,
    message: "Editor metadata label must be a string."
  })), typeof e.data != "undefined" && (k(e.data) && m(e.data, `${r}.data`, s) ? o.data = { ...e.data } : k(e.data) || s.push({
    code: "invalid-field",
    path: `${r}.data`,
    message: "Editor metadata data must be a JSON-safe object."
  })), o;
}, D = (e, t = {}) => {
  const s = [], r = [], o = {};
  if (e == null)
    return { ok: !0, value: o, errors: s, warnings: r };
  if (!k(e))
    return s.push({
      code: "invalid-root",
      path: "editorMetaById",
      message: "Editor metadata must be a plain object keyed by item id."
    }), { ok: !1, value: o, errors: s, warnings: r };
  const a = t.layout ? new Set(t.layout.map((i) => i.i)) : null;
  return Object.keys(e).forEach((i) => {
    if (!w(i) || typeof i != "string" || i.length === 0) {
      s.push({
        code: w(i) ? "invalid-id" : "unsafe-key",
        path: `editorMetaById.${i}`,
        message: "Editor metadata id must be a safe non-empty string."
      });
      return;
    }
    if (a && !a.has(i)) {
      const n = {
        code: "orphan-meta",
        path: `editorMetaById.${i}`,
        message: "Editor metadata references an item that is not in layout."
      };
      if (t.removeOrphans !== !1) {
        r.push(n);
        return;
      }
      s.push(n);
      return;
    }
    const c = z(e[i], i, s);
    c && (o[i] = c);
  }), {
    ok: s.length === 0,
    value: o,
    errors: s,
    warnings: r
  };
}, B = (e, t = {}) => D(e, t).value, Y = B, Q = (e, t) => B(e, { layout: t }), A = (e, t, s) => s ? { type: "set", id: e, previous: t, next: s } : t ? { type: "remove", id: e, previous: t } : null, G = (e, t) => {
  if (t.length === 0) return e;
  const s = { ...e };
  return t.forEach((r) => {
    if (r.type === "remove") {
      delete s[r.id];
      return;
    }
    s[r.id] = { ...r.next };
  }), s;
}, W = (e, t, s) => {
  const r = e[t], o = s == null ? void 0 : z({ ...r || {}, ...s }, t, []) || {}, a = A(t, r, o);
  return {
    metaById: a ? G(e, [a]) : e,
    patch: a
  };
}, L = (e, t) => {
  var s;
  return ((s = e[t]) == null ? void 0 : s.visible) !== !1;
}, X = (e, t) => e.filter((s) => L(t, s.i)), _ = (e, t, s = {}) => {
  const r = (t == null ? void 0 : t.locked) === !0, o = (t == null ? void 0 : t.visible) !== !1, a = e.static === !0, i = typeof e.isDraggable == "boolean" ? e.isDraggable : !a && s.isDraggable !== !1, c = typeof e.isResizable == "boolean" ? e.isResizable : !a && s.isResizable !== !1, n = !r && (t == null ? void 0 : t.editable) !== !1 && !a, u = n && (t == null ? void 0 : t.draggable) !== !1 && i, f = n && (t == null ? void 0 : t.resizable) !== !1 && c, d = e.isBounded !== !1 && s.isBounded !== !1, l = n && (t == null ? void 0 : t.deletable) !== !1 && s.defaultDeletable !== !1, b = n && (t == null ? void 0 : t.duplicatable) !== !1 && s.defaultDuplicatable !== !1, I = o && (t == null ? void 0 : t.copyable) !== !1 && s.defaultCopyable !== !1;
  return {
    id: e.i,
    locked: r,
    visible: o,
    editable: n,
    draggable: u,
    resizable: f,
    bounded: d,
    deletable: l,
    duplicatable: b,
    copyable: I,
    resizeHandles: e.resizeHandles,
    source: {
      layoutStatic: a,
      layoutDraggable: i,
      layoutResizable: c,
      layoutBounded: e.isBounded,
      metaLocked: t == null ? void 0 : t.locked,
      metaVisible: t == null ? void 0 : t.visible,
      metaEditable: t == null ? void 0 : t.editable
    }
  };
}, Z = (e, t, s = {}) => {
  const r = {};
  return e.forEach((o) => {
    r[o.i] = _(o, t[o.i], s);
  }), r;
}, v = (e) => !e || typeof e != "object" ? !1 : Array.isArray(e) ? e.some(v) : k(e) ? Object.keys(e).some((t) => R.has(t) ? !0 : v(e[t])) : !1, x = (e, t, s) => !!(e[t] && j(e[t], String(s)));
let H = 0;
const p = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, ee = (e) => ({
  ...e,
  id: e.id || `editor-command:${e.type}:${++H}`
}), se = (e, t) => {
  var r, o;
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
    preserveRedoStack: (o = e == null ? void 0 : e.preserveRedoStack) != null ? o : s === "ignore" || s === "record-preserveRedoStack"
  };
}, V = (e) => e === "select" || e === "clearSelection", $ = (e) => e === "lock" || e === "unlock" || e === "show" || e === "hide", h = (e) => e === "section-row-collapse" || e === "section-row-expand" || e === "section-row-move" || e === "section-row-delete" || e === "section-row-reorder", P = (e) => e === "move" || e === "resize" || e === "add" || e === "delete" || e === "duplicate" || e === "paste" || e === "align" || e === "distribute" || e === "tidy", te = (e) => e === "save" || e === "discard" || e === "reset", q = (e) => e === "undo" || e === "redo", re = (e) => P(e) || $(e) || h(e), oe = (e) => V(e) || q(e) ? "ignore" : P(e) || $(e) || h(e) ? "record" : "ignore", y = (e, t, s = {}) => {
  var r, o, a, i, c, n, u, f, d, l, b, I, E, M;
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
      guardMs: (o = s.diagnostics) == null ? void 0 : o.guardMs,
      guideCount: (a = s.diagnostics) == null ? void 0 : a.guideCount,
      layoutDiagnostics: (i = s.diagnostics) == null ? void 0 : i.layoutDiagnostics,
      operationResult: (c = s.diagnostics) == null ? void 0 : c.operationResult,
      intelligence: (n = s.diagnostics) == null ? void 0 : n.intelligence,
      computed: (u = s.diagnostics) == null ? void 0 : u.computed,
      messages: (f = s.diagnostics) == null ? void 0 : f.messages,
      pendingScope: (d = s.diagnostics) == null ? void 0 : d.pendingScope,
      stateRevision: (l = s.diagnostics) == null ? void 0 : l.stateRevision,
      stale: (b = s.diagnostics) == null ? void 0 : b.stale,
      historyMode: (I = s.diagnostics) == null ? void 0 : I.historyMode,
      source: (E = s.diagnostics) == null ? void 0 : E.source,
      origin: (M = s.diagnostics) == null ? void 0 : M.origin
    },
    undo: s.undo,
    error: s.error
  };
}, g = (e, t, s = {}) => {
  var r, o, a;
  return y(e, "blocked", {
    ...s,
    blocked: {
      reason: t,
      itemIds: ((r = s.blocked) == null ? void 0 : r.itemIds) || s.targetIds,
      message: (o = s.blocked) == null ? void 0 : o.message,
      skippedIds: (a = s.blocked) == null ? void 0 : a.skippedIds
    }
  });
}, S = (e, t, s) => y(e, "error", {
  error: { message: t, cause: s }
}), K = (e, t, s) => {
  if (e.targetIds) return Array.from(new Set(e.targetIds.filter(Boolean)));
  if (e.type === "select") {
    const o = e.payload;
    if (o != null && o.ids) return Array.from(new Set(o.ids.filter(Boolean)));
    if (o != null && o.id) return [o.id];
  }
  if (e.type === "add" || e.type === "paste") return [];
  if (h(e.type)) {
    const o = e.payload;
    return Array.isArray(o == null ? void 0 : o.ids) ? Array.from(new Set(o.ids.filter(Boolean))) : o != null && o.id ? [o.id] : [];
  }
  const r = t.selectedIds.filter(Boolean);
  return r.length > 0 ? r : s.length > 0 && t.activeId ? [t.activeId] : [];
}, F = (e, t) => {
  const s = new Set(e.map((r) => r.i));
  return t.filter((r) => !s.has(r));
}, N = (e) => e === "move" || e === "align" || e === "distribute" || e === "tidy" ? "draggable" : e === "resize" ? "resizable" : e === "delete" ? "deletable" : e === "duplicate" ? "duplicatable" : e === "copy" ? "copyable" : e === "hide" || e === "lock" ? "editable" : null, T = (e) => e === "align" ? 2 : e === "distribute" || e === "tidy" ? 3 : 0, C = (e, t) => !!e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, t), J = (e) => {
  const t = e.payload;
  if (e.type === "align") {
    const s = t == null ? void 0 : t.mode;
    return s === "left" || s === "center-x" || s === "right" || s === "top" || s === "center-y" || s === "bottom";
  }
  if (e.type === "distribute") {
    const s = t == null ? void 0 : t.mode, r = t == null ? void 0 : t.strategy;
    return (s === "horizontal" || s === "vertical" || s === "spacing-x" || s === "spacing-y") && (!C(t, "strategy") || r === "edge-to-edge" || r === "center-to-center");
  }
  if (e.type === "tidy") {
    const s = t == null ? void 0 : t.axis;
    return !C(t, "axis") || s === "x" || s === "y" || s === "both";
  }
  return h(e.type) ? typeof (t == null ? void 0 : t.id) == "string" && t.id.length > 0 : !0;
}, U = (e, t, s) => {
  const r = t[e.i];
  return r != null && r.locked ? "locked" : (r == null ? void 0 : r.visible) === !1 ? "hidden" : e.static ? "static-item" : s;
}, ae = (e, t) => {
  const s = K(
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
      result: g(e, "editor-mode-missing", {
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
      result: g(e, "mode-readonly", {
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
      result: g(e, "multi-resize-unsupported", {
        targetIds: s
      })
    };
  const r = T(e.type);
  if (r > 0 && s.length < r)
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: g(e, "selection-count", {
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
  if (!J(e))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: g(e, "invalid-input", {
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
      result: g(e, "missing-item", {
        targetIds: s
      })
    };
  const o = F(t.layout, s);
  if (o.length > 0 && e.type !== "select" && !h(e.type))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: o,
      result: g(e, "missing-item", {
        targetIds: s,
        blocked: { reason: "missing-item", itemIds: o }
      })
    };
  const a = N(e.type);
  if (!a)
    return {
      ok: !0,
      targetIds: s,
      allowedIds: s,
      blockedIds: []
    };
  const i = [], c = [];
  let n = "capability";
  return s.forEach((u) => {
    const f = t.layout.find((l) => l.i === u);
    if (!f) {
      c.push(u), n = "missing-item";
      return;
    }
    _(
      f,
      t.editorMetaById[u],
      {
        isDraggable: t.isDraggable,
        isResizable: t.isResizable,
        isBounded: t.isBounded
      }
    )[a] ? i.push(u) : (c.push(u), n = U(f, t.editorMetaById, "capability"));
  }), c.length > 0 && t.commandPolicy !== "skip-blocked" ? {
    ok: !1,
    targetIds: s,
    allowedIds: [],
    blockedIds: c,
    result: g(e, n, {
      targetIds: s,
      blocked: { reason: n, itemIds: c }
    })
  } : i.length === 0 && s.length > 0 ? {
    ok: !1,
    targetIds: s,
    allowedIds: i,
    blockedIds: c,
    result: g(e, n, {
      targetIds: s,
      blocked: { reason: n, itemIds: c }
    })
  } : {
    ok: !0,
    targetIds: s,
    allowedIds: i,
    blockedIds: c
  };
}, ie = async (e, t, s, r = 5e3) => {
  var c, n;
  if (!e) return { guardMs: 0 };
  const o = p();
  let a = null, i = null;
  try {
    if ((c = s.signal) != null && c.aborted)
      return {
        guardMs: 0,
        result: y(t, "cancelled", {
          targetIds: s.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: s.targetIds,
            message: "beforeCommand guard was aborted."
          },
          diagnostics: { durationMs: 0, guardMs: 0 }
        })
      };
    const u = Promise.resolve(e({ ...s, command: t })), f = s.signal ? new Promise((b) => {
      var I;
      i = () => b("__aborted__"), (I = s.signal) == null || I.addEventListener("abort", i, { once: !0 });
    }) : null, d = await Promise.race([
      u,
      ...f ? [f] : [],
      new Promise((b) => {
        a = setTimeout(() => b("__timeout__"), r);
      })
    ]), l = p() - o;
    return d === "__aborted__" ? {
      guardMs: l,
      result: y(t, "cancelled", {
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
      result: y(t, "timeout", {
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
      result: g(t, "before-command-blocked", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: l }
      })
    } : !d || d === !0 || d.status === "allow" ? { guardMs: l } : d.status === "cancel" ? {
      guardMs: l,
      result: y(t, "cancelled", {
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
      result: y(t, "timeout", {
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
      result: S(
        t,
        d.message || "beforeCommand guard failed.",
        d.error
      )
    } : {
      guardMs: l,
      result: g(
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
      guardMs: p() - o,
      result: S(
        t,
        "beforeCommand guard failed.",
        u
      )
    };
  } finally {
    a && clearTimeout(a), i && ((n = s.signal) == null || n.removeEventListener("abort", i));
  }
}, de = (e, t) => {
  const s = [], r = new Map(e.map((a) => [a.i, a])), o = new Map(t.map((a) => [a.i, a]));
  return t.forEach((a) => {
    const i = r.get(a.i);
    if (!i) {
      s.push({ type: "add", item: a });
      return;
    }
    (i.w !== a.w || i.h !== a.h || i.x !== a.x || i.y !== a.y) && (i.w !== a.w || i.h !== a.h ? s.push({
      type: "resize",
      id: a.i,
      from: {
        x: i.x,
        y: i.y,
        w: i.w,
        h: i.h
      },
      to: { x: a.x, y: a.y, w: a.w, h: a.h }
    }) : s.push({
      type: "move",
      id: a.i,
      from: { x: i.x, y: i.y },
      to: { x: a.x, y: a.y }
    }));
  }), e.forEach((a) => {
    o.has(a.i) || s.push({ type: "remove", id: a.i });
  }), s;
}, ne = (e, t, s) => ({
  durationMs: e,
  guardMs: t,
  layoutDiagnostics: s
}), le = (e, t) => {
  const s = /* @__PURE__ */ new Set();
  return e.forEach((r) => {
    r.type === "add" ? s.add(r.item.i) : r.type === "compact" ? r.affectedIds.forEach((o) => s.add(o)) : s.add(r.id);
  }), t.forEach((r) => s.add(r.id)), Array.from(s);
};
export {
  _ as A,
  K as B,
  ie as C,
  B as D,
  re as E,
  D as F,
  G as a,
  g as b,
  ae as c,
  le as d,
  de as e,
  A as f,
  y as g,
  oe as h,
  S as i,
  X as j,
  x as k,
  v as l,
  L as m,
  q as n,
  P as o,
  $ as p,
  te as q,
  h as r,
  V as s,
  ne as t,
  Y as u,
  ee as v,
  se as w,
  W as x,
  Q as y,
  Z as z
};
