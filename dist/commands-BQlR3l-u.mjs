import { j, n as A } from "./migration-CPonYzEY.mjs";
const M = (e) => !!e && typeof e == "object" && !Array.isArray(e), D = (e) => {
  if (!e || typeof e.id != "string" || !e.id || e.kind !== "section" && e.kind !== "row") return null;
  const r = Number.isFinite(e.order) ? e.order : 0, s = e.bounds && Number.isFinite(e.bounds.x) && Number.isFinite(e.bounds.y) && Number.isFinite(e.bounds.w) && Number.isFinite(e.bounds.h) && e.bounds.w > 0 && e.bounds.h > 0 ? e.bounds : void 0, t = e.boundsPolicy === "fixed" || e.boundsPolicy === "content" || e.boundsPolicy === "viewport" ? e.boundsPolicy : void 0, o = e.dropPolicy === "inside" || e.dropPolicy === "between" || e.dropPolicy === "none" ? e.dropPolicy : void 0, a = e.crossScopePolicy === "allow" || e.crossScopePolicy === "block" || e.crossScopePolicy === "ask" ? e.crossScopePolicy : void 0;
  return {
    id: e.id,
    kind: e.kind,
    label: typeof e.label == "string" ? e.label : void 0,
    parentId: typeof e.parentId == "string" ? e.parentId : void 0,
    order: r,
    bounds: s,
    boundsPolicy: t,
    collapsed: e.collapsed === !0,
    locked: e.locked === !0,
    itemIds: Array.isArray(e.itemIds) ? Array.from(new Set(e.itemIds.filter((i) => typeof i == "string" && i))) : void 0,
    dropPolicy: o,
    crossScopePolicy: a,
    allowedDropZones: Array.isArray(e.allowedDropZones) ? Array.from(new Set(e.allowedDropZones.filter(
      (i) => i === "start" || i === "inside" || i === "end" || i === "between"
    ))) : void 0
  };
}, x = () => ({
  version: 1,
  items: {},
  itemMembership: {}
}), ee = (e, r = []) => {
  const s = new Set(r.map((d) => d.i)), t = r.length > 0, o = [];
  if (!e)
    return { version: 1, items: {}, itemMembership: {}, warnings: o };
  if (!M(e) || e.version !== 1 || !M(e.items))
    return o.push({
      code: "grid-editor.sectionRows.unknown-version",
      level: "warning",
      message: "Unsupported section/row metadata version was ignored.",
      recoverable: !0
    }), { version: 1, items: {}, itemMembership: {}, warnings: o };
  const a = {};
  Object.keys(e.items).sort().forEach((d) => {
    const n = D(e.items[d]);
    n && (a[n.id] = n);
  });
  const i = {}, u = (d, n) => {
    if (t && !s.has(d)) {
      o.push({
        code: "grid-editor.sectionRows.orphan-membership",
        level: "warning",
        message: "Section/row membership referenced an item that is not in the layout.",
        itemIds: [d],
        recoverable: !0
      });
      return;
    }
    i[d] = { ...i[d] || {}, ...n };
  };
  return Object.keys(e.itemMembership || {}).sort().forEach((d) => {
    var f, l, c;
    const n = ((f = e.itemMembership) == null ? void 0 : f[d]) || {};
    u(d, {
      sectionId: n.sectionId && ((l = a[n.sectionId]) == null ? void 0 : l.kind) === "section" ? n.sectionId : void 0,
      rowId: n.rowId && ((c = a[n.rowId]) == null ? void 0 : c.kind) === "row" ? n.rowId : void 0
    });
  }), Object.keys(a).sort((d, n) => a[d].order - a[n].order || d.localeCompare(n)).forEach((d) => {
    const n = a[d];
    (n.itemIds || []).forEach((f) => {
      u(f, n.kind === "section" ? { sectionId: n.id } : { rowId: n.id });
    });
  }), { version: 1, items: a, itemMembership: i, warnings: o };
}, R = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), G = [
  "locked",
  "visible",
  "editable",
  "draggable",
  "resizable",
  "deletable",
  "duplicatable",
  "copyable"
], H = (e, r) => Object.prototype.hasOwnProperty.call(e, r), I = (e) => {
  if (!e || typeof e != "object") return !1;
  const r = Object.getPrototypeOf(e);
  return r === Object.prototype || r === null;
}, k = (e) => !R.has(e), v = (e, r, s) => {
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return typeof e == "number" && !Number.isFinite(e) ? (s.push({
      code: "non-json-value",
      path: r,
      message: "Metadata numbers must be finite."
    }), !1) : !0;
  if (Array.isArray(e)) {
    let t = !0;
    for (let o = 0; o < e.length; o++)
      t = v(e[o], `${r}[${o}]`, s) && t;
    return t;
  }
  if (I(e)) {
    let t = !0;
    return Object.keys(e).forEach((o) => {
      if (!k(o)) {
        s.push({
          code: "unsafe-key",
          path: `${r}.${o}`,
          message: "Metadata contains a reserved key."
        }), t = !1;
        return;
      }
      t = v(e[o], `${r}.${o}`, s) && t;
    }), t;
  }
  return s.push({
    code: "non-json-value",
    path: r,
    message: "Metadata must contain JSON-safe values only."
  }), !1;
}, C = (e, r, s) => {
  const t = `editorMetaById.${r}`;
  if (!I(e))
    return s.push({
      code: "invalid-field",
      path: t,
      message: "Item metadata must be a plain object."
    }), null;
  const o = {};
  if (G.forEach((a) => {
    const i = e[a];
    if (typeof i != "undefined") {
      if (typeof i != "boolean") {
        s.push({
          code: "invalid-field",
          path: `${t}.${String(a)}`,
          message: "Editor capability metadata fields must be boolean."
        });
        return;
      }
      o[a] = i;
    }
  }), typeof e.label != "undefined" && (typeof e.label == "string" ? o.label = e.label : s.push({
    code: "invalid-field",
    path: `${t}.label`,
    message: "Editor metadata label must be a string."
  })), typeof e.resizeHandles != "undefined") {
    const a = A(e.resizeHandles);
    a && a.length === e.resizeHandles.length ? o.resizeHandles = a : s.push({
      code: "invalid-field",
      path: `${t}.resizeHandles`,
      message: "Editor metadata resizeHandles must be valid resize handle values."
    });
  }
  return typeof e.data != "undefined" && (I(e.data) && v(e.data, `${t}.data`, s) ? o.data = { ...e.data } : I(e.data) || s.push({
    code: "invalid-field",
    path: `${t}.data`,
    message: "Editor metadata data must be a JSON-safe object."
  })), o;
}, L = (e, r = {}) => {
  const s = [], t = [], o = {};
  if (e == null)
    return { ok: !0, value: o, errors: s, warnings: t };
  if (!I(e))
    return s.push({
      code: "invalid-root",
      path: "editorMetaById",
      message: "Editor metadata must be a plain object keyed by item id."
    }), { ok: !1, value: o, errors: s, warnings: t };
  const a = r.layout ? new Set(r.layout.map((i) => i.i)) : null;
  return Object.keys(e).forEach((i) => {
    if (!k(i) || typeof i != "string" || i.length === 0) {
      s.push({
        code: k(i) ? "invalid-id" : "unsafe-key",
        path: `editorMetaById.${i}`,
        message: "Editor metadata id must be a safe non-empty string."
      });
      return;
    }
    if (a && !a.has(i)) {
      const d = {
        code: "orphan-meta",
        path: `editorMetaById.${i}`,
        message: "Editor metadata references an item that is not in layout."
      };
      if (r.removeOrphans !== !1) {
        t.push(d);
        return;
      }
      s.push(d);
      return;
    }
    const u = C(e[i], i, s);
    u && (o[i] = u);
  }), {
    ok: s.length === 0,
    value: o,
    errors: s,
    warnings: t
  };
}, B = (e, r = {}) => L(e, r).value, se = B, re = (e, r) => B(e, { layout: r }), F = (e, r, s) => s ? { type: "set", id: e, previous: r, next: s } : r ? { type: "remove", id: e, previous: r } : null, N = (e, r) => {
  if (r.length === 0) return e;
  const s = { ...e };
  return r.forEach((t) => {
    if (t.type === "remove") {
      delete s[t.id];
      return;
    }
    s[t.id] = { ...t.next };
  }), s;
}, te = (e, r, s) => {
  const t = e[r], o = s == null ? void 0 : C({ ...t || {}, ...s }, r, []) || {}, a = F(r, t, o);
  return {
    metaById: a ? N(e, [a]) : e,
    patch: a
  };
}, V = (e, r) => {
  var s;
  return ((s = e[r]) == null ? void 0 : s.visible) !== !1;
}, oe = (e, r) => e.filter((s) => V(r, s.i)), $ = (e, r, s = {}) => {
  const t = j({
    item: e,
    editor: r,
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
    locked: t.locked,
    visible: t.visible,
    editable: t.editable,
    draggable: t.draggable,
    resizable: t.resizable,
    bounded: t.bounded,
    deletable: t.deletable,
    duplicatable: t.duplicatable,
    copyable: t.copyable,
    resizeHandles: t.resizeHandles,
    diagnostics: t.diagnostics,
    source: {
      layoutStatic: e.static === !0,
      layoutDraggable: typeof e.isDraggable == "boolean" ? e.isDraggable : !e.static && s.isDraggable !== !1,
      layoutResizable: typeof e.isResizable == "boolean" ? e.isResizable : !e.static && s.isResizable !== !1,
      layoutBounded: e.isBounded,
      metaLocked: r == null ? void 0 : r.locked,
      metaVisible: r == null ? void 0 : r.visible,
      metaEditable: r == null ? void 0 : r.editable,
      capabilitySources: t.sources
    }
  };
}, ae = (e, r, s = {}) => {
  const t = {};
  return e.forEach((o) => {
    t[o.i] = $(o, r[o.i], s);
  }), t;
}, S = (e) => !e || typeof e != "object" ? !1 : Array.isArray(e) ? e.some(S) : I(e) ? Object.keys(e).some((r) => R.has(r) ? !0 : S(e[r])) : !1, ie = (e, r, s) => !!(e[r] && H(e[r], String(s)));
let q = 0;
const w = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, de = (e) => ({
  ...e,
  id: e.id || `editor-command:${e.type}:${++q}`
}), ne = (e, r) => {
  var t, o;
  if (typeof e == "string") return { mode: e };
  if (e != null && e.skip)
    return {
      ...e,
      mode: "ignore",
      preserveRedoStack: (t = e.preserveRedoStack) != null ? t : !0
    };
  const s = (e == null ? void 0 : e.mode) || r;
  return {
    ...e,
    mode: s,
    preserveRedoStack: (o = e == null ? void 0 : e.preserveRedoStack) != null ? o : s === "ignore" || s === "record-preserveRedoStack"
  };
}, K = (e) => e === "select" || e === "clearSelection", O = (e) => e === "lock" || e === "unlock" || e === "show" || e === "hide", h = (e) => e === "section-row-collapse" || e === "section-row-expand" || e === "section-row-move" || e === "section-row-delete" || e === "section-row-reorder", _ = (e) => e === "move" || e === "resize" || e === "add" || e === "delete" || e === "duplicate" || e === "paste" || e === "align" || e === "distribute" || e === "tidy", le = (e) => e === "save" || e === "discard" || e === "reset", T = (e) => e === "undo" || e === "redo", ce = (e) => _(e) || O(e) || h(e), fe = (e) => K(e) || T(e) ? "ignore" : _(e) || O(e) || h(e) ? "record" : "ignore", y = (e, r, s = {}) => {
  var t, o, a, i, u, d, n, f, l, c, g, m, p, E;
  return {
    id: e.id,
    type: e.type,
    status: r,
    targetIds: s.targetIds || [],
    layoutPatches: s.layoutPatches || [],
    metadataPatches: s.metadataPatches || [],
    affectedIds: s.affectedIds || s.targetIds || [],
    selection: s.selection,
    blocked: s.blocked,
    diagnostics: {
      durationMs: ((t = s.diagnostics) == null ? void 0 : t.durationMs) || 0,
      guardMs: (o = s.diagnostics) == null ? void 0 : o.guardMs,
      guideCount: (a = s.diagnostics) == null ? void 0 : a.guideCount,
      layoutDiagnostics: (i = s.diagnostics) == null ? void 0 : i.layoutDiagnostics,
      operationResult: (u = s.diagnostics) == null ? void 0 : u.operationResult,
      intelligence: (d = s.diagnostics) == null ? void 0 : d.intelligence,
      computed: (n = s.diagnostics) == null ? void 0 : n.computed,
      messages: (f = s.diagnostics) == null ? void 0 : f.messages,
      pendingScope: (l = s.diagnostics) == null ? void 0 : l.pendingScope,
      stateRevision: (c = s.diagnostics) == null ? void 0 : c.stateRevision,
      stale: (g = s.diagnostics) == null ? void 0 : g.stale,
      historyMode: (m = s.diagnostics) == null ? void 0 : m.historyMode,
      source: (p = s.diagnostics) == null ? void 0 : p.source,
      origin: (E = s.diagnostics) == null ? void 0 : E.origin
    },
    undo: s.undo,
    error: s.error
  };
}, b = (e, r, s = {}) => {
  var t, o, a;
  return y(e, "blocked", {
    ...s,
    blocked: {
      reason: r,
      itemIds: ((t = s.blocked) == null ? void 0 : t.itemIds) || s.targetIds,
      message: (o = s.blocked) == null ? void 0 : o.message,
      skippedIds: (a = s.blocked) == null ? void 0 : a.skippedIds
    }
  });
}, P = (e, r, s) => y(e, "error", {
  error: { message: r, cause: s }
}), J = (e, r, s) => {
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
  const t = r.selectedIds.filter(Boolean);
  return t.length > 0 ? t : s.length > 0 && r.activeId ? [r.activeId] : [];
}, Z = (e, r) => {
  const s = new Set(e.map((t) => t.i));
  return r.filter((t) => !s.has(t));
}, U = (e) => e === "move" || e === "align" || e === "distribute" || e === "tidy" ? "draggable" : e === "resize" ? "resizable" : e === "delete" ? "deletable" : e === "duplicate" ? "duplicatable" : e === "copy" ? "copyable" : e === "hide" || e === "lock" ? "editable" : null, Y = (e) => e === "align" ? 2 : e === "distribute" || e === "tidy" ? 3 : 0, z = (e, r) => !!e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, r), Q = (e) => {
  const r = e.payload;
  if (e.type === "align") {
    const s = r == null ? void 0 : r.mode;
    return s === "left" || s === "center-x" || s === "right" || s === "top" || s === "center-y" || s === "bottom";
  }
  if (e.type === "distribute") {
    const s = r == null ? void 0 : r.mode, t = r == null ? void 0 : r.strategy;
    return (s === "horizontal" || s === "vertical" || s === "spacing-x" || s === "spacing-y") && (!z(r, "strategy") || t === "edge-to-edge" || t === "center-to-center");
  }
  if (e.type === "tidy") {
    const s = r == null ? void 0 : r.axis;
    return !z(r, "axis") || s === "x" || s === "y" || s === "both";
  }
  return h(e.type) ? typeof (r == null ? void 0 : r.id) == "string" && r.id.length > 0 : !0;
}, W = (e, r, s) => {
  const t = r[e.i];
  return t != null && t.locked ? "locked" : (t == null ? void 0 : t.visible) === !1 ? "hidden" : e.static ? "static-item" : s;
}, ue = (e, r) => {
  const s = J(
    e,
    r.selection,
    r.layout
  );
  if (r.modeMissing)
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: b(e, "editor-mode-missing", {
        targetIds: s,
        blocked: { reason: "editor-mode-missing", itemIds: s }
      })
    };
  if (r.mode === "view")
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: b(e, "mode-readonly", {
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
      result: b(e, "multi-resize-unsupported", {
        targetIds: s
      })
    };
  const t = Y(e.type);
  if (t > 0 && s.length < t)
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: b(e, "selection-count", {
        targetIds: s,
        blocked: {
          reason: "selection-count",
          itemIds: s,
          message: `${e.type} requires at least ${t} selected items.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: "grid-editor.command.selection-count",
            level: "warning",
            message: `${e.type} requires at least ${t} selected items.`,
            itemIds: s,
            recoverable: !0
          }]
        }
      })
    };
  if (!Q(e))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: s,
      result: b(e, "invalid-input", {
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
      result: b(e, "missing-item", {
        targetIds: s
      })
    };
  const o = Z(r.layout, s), a = e.type === "add" || e.type === "paste";
  if (o.length > 0 && !a && e.type !== "select" && !h(e.type))
    return {
      ok: !1,
      targetIds: s,
      allowedIds: [],
      blockedIds: o,
      result: b(e, "missing-item", {
        targetIds: s,
        blocked: { reason: "missing-item", itemIds: o }
      })
    };
  const i = U(e.type);
  if (!i)
    return {
      ok: !0,
      targetIds: s,
      allowedIds: s,
      blockedIds: []
    };
  const u = [], d = [];
  let n = "capability";
  return s.forEach((f) => {
    var g;
    const l = r.layout.find((m) => m.i === f);
    if (!l) {
      d.push(f), n = "missing-item";
      return;
    }
    (((g = r.itemCapabilities) == null ? void 0 : g[f]) || $(
      l,
      r.editorMetaById[f],
      {
        isDraggable: r.isDraggable,
        isResizable: r.isResizable,
        isBounded: r.isBounded
      }
    ))[i] ? u.push(f) : (d.push(f), n = W(l, r.editorMetaById, "capability"));
  }), d.length > 0 && r.commandPolicy !== "skip-blocked" ? {
    ok: !1,
    targetIds: s,
    allowedIds: [],
    blockedIds: d,
    result: b(e, n, {
      targetIds: s,
      blocked: { reason: n, itemIds: d }
    })
  } : u.length === 0 && s.length > 0 ? {
    ok: !1,
    targetIds: s,
    allowedIds: u,
    blockedIds: d,
    result: b(e, n, {
      targetIds: s,
      blocked: { reason: n, itemIds: d }
    })
  } : {
    ok: !0,
    targetIds: s,
    allowedIds: u,
    blockedIds: d
  };
}, be = async (e, r, s, t = 5e3) => {
  var u, d;
  if (!e) return { guardMs: 0 };
  const o = w();
  let a = null, i = null;
  try {
    if ((u = s.signal) != null && u.aborted)
      return {
        guardMs: 0,
        result: y(r, "cancelled", {
          targetIds: s.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: s.targetIds,
            message: "beforeCommand guard was aborted."
          },
          diagnostics: { durationMs: 0, guardMs: 0 }
        })
      };
    const n = Promise.resolve(e({ ...s, command: r })), f = s.signal ? new Promise((g) => {
      var m;
      i = () => g("__aborted__"), (m = s.signal) == null || m.addEventListener("abort", i, { once: !0 });
    }) : null, l = await Promise.race([
      n,
      ...f ? [f] : [],
      new Promise((g) => {
        a = setTimeout(() => g("__timeout__"), t);
      })
    ]), c = w() - o;
    return l === "__aborted__" ? {
      guardMs: c,
      result: y(r, "cancelled", {
        targetIds: s.targetIds,
        blocked: {
          reason: "guard-aborted",
          itemIds: s.targetIds,
          message: "beforeCommand guard was aborted."
        },
        diagnostics: { durationMs: 0, guardMs: c }
      })
    } : l === "__timeout__" ? {
      guardMs: c,
      result: y(r, "timeout", {
        targetIds: s.targetIds,
        blocked: {
          reason: "before-command-timeout",
          itemIds: s.targetIds,
          message: "beforeCommand guard timed out."
        },
        diagnostics: { durationMs: 0, guardMs: c }
      })
    } : l === !1 ? {
      guardMs: c,
      result: b(r, "before-command-blocked", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: c }
      })
    } : !l || l === !0 || l.status === "allow" ? { guardMs: c } : l.status === "cancel" ? {
      guardMs: c,
      result: y(r, "cancelled", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: c },
        blocked: {
          reason: "before-command-cancelled",
          itemIds: s.targetIds,
          message: l.message
        }
      })
    } : l.status === "timeout" ? {
      guardMs: c,
      result: y(r, "timeout", {
        targetIds: s.targetIds,
        diagnostics: { durationMs: 0, guardMs: c },
        blocked: {
          reason: "before-command-timeout",
          itemIds: s.targetIds,
          message: l.message
        }
      })
    } : l.status === "error" ? {
      guardMs: c,
      result: P(
        r,
        l.message || "beforeCommand guard failed.",
        l.error
      )
    } : {
      guardMs: c,
      result: b(
        r,
        l.reason || "before-command-blocked",
        {
          targetIds: s.targetIds,
          blocked: {
            reason: l.reason || "before-command-blocked",
            itemIds: s.targetIds,
            message: l.message
          },
          diagnostics: { durationMs: 0, guardMs: c }
        }
      )
    };
  } catch (n) {
    return {
      guardMs: w() - o,
      result: P(
        r,
        "beforeCommand guard failed.",
        n
      )
    };
  } finally {
    a && clearTimeout(a), i && ((d = s.signal) == null || d.removeEventListener("abort", i));
  }
}, ge = (e, r) => {
  const s = [], t = new Map(e.map((a) => [a.i, a])), o = new Map(r.map((a) => [a.i, a]));
  return r.forEach((a) => {
    const i = t.get(a.i);
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
}, me = (e, r, s) => ({
  durationMs: e,
  guardMs: r,
  layoutDiagnostics: s
}), ye = (e, r) => {
  const s = /* @__PURE__ */ new Set();
  return e.forEach((t) => {
    t.type === "add" ? s.add(t.item.i) : t.type === "compact" ? t.affectedIds.forEach((o) => s.add(o)) : s.add(t.id);
  }), r.forEach((t) => s.add(t.id)), Array.from(s);
};
export {
  re as A,
  ae as B,
  $ as C,
  J as D,
  be as E,
  B as F,
  ce as G,
  L as H,
  N as a,
  b,
  ue as c,
  ye as d,
  ge as e,
  F as f,
  y as g,
  fe as h,
  x as i,
  P as j,
  oe as k,
  ie as l,
  S as m,
  V as n,
  T as o,
  _ as p,
  O as q,
  le as r,
  h as s,
  K as t,
  me as u,
  se as v,
  de as w,
  ne as x,
  ee as y,
  te as z
};
