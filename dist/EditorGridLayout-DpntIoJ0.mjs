import { c as bi, b as Ii } from "./createGridLayoutComponent-C3Rj84Rb.mjs";
import nt from "clsx";
import { e as xi, a as le, o as Pe, m as Pt, l as wi, k as ss, s as ki, f as Mi, d as $o, i as is } from "./utils-BCVYGne6.mjs";
import { k as Si, f as Ci } from "./migration-CPonYzEY.mjs";
import { z as Ri, A as Qt, D as Me, v as Fs, w as Ot, h as eo, b as to, C as Pi, g as xe, F as Ei, e as Ft, d as Io, y as ft, q as rs, n as Bi, i as ns, o as mo, c as as, a as Tt, r as cs, p as ds, x as ls, E as $i } from "./commands-Q0wgqPfi.mjs";
import { ref as Re, computed as us, watch as yt, h as Oe } from "vue";
import { deepEqual as Ke } from "fast-equals";
import { c as oo, u as Gi } from "./persistence-Db97X8w7.mjs";
import { e as xo } from "./core-DBDOf-NY.mjs";
import { f as Ai, c as zi, a as Ti } from "./resolve-C3SqJijI.mjs";
const Di = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", Oi = (e) => !!(e && typeof e == "object"), Hs = (e, t = {}) => {
  var n;
  const o = e.target;
  if (!Oi(o)) return !1;
  const s = (n = o.tagName) == null ? void 0 : n.toUpperCase();
  return s === "INPUT" || s === "TEXTAREA" || s === "SELECT" || o.isContentEditable ? !0 : (t.ignoredTargets || []).some((i) => typeof i == "string" ? typeof o.matches == "function" && o.matches(i) : i(o));
}, Li = [
  { key: "Escape", command: { type: "clearSelection", source: "keyboard" } },
  { key: "Delete", command: { type: "delete", source: "keyboard" } },
  { key: "Backspace", command: { type: "delete", source: "keyboard" } },
  { key: "z", primary: !0, command: { type: "undo", source: "keyboard" } },
  { key: "z", primary: !0, shift: !0, command: { type: "redo", source: "keyboard" } },
  { key: "y", primary: !0, platform: "standard", command: { type: "redo", source: "keyboard" } },
  { key: "c", primary: !0, command: { type: "copy", source: "keyboard" } },
  { key: "v", primary: !0, command: { type: "paste", source: "keyboard" } },
  { key: "d", primary: !0, command: { type: "duplicate", source: "keyboard" } },
  { key: "s", primary: !0, command: { type: "save", source: "keyboard" } }
], Fi = (e, t) => e.toLowerCase() === t.toLowerCase(), Hi = (e, t, o) => {
  const s = o === "mac" ? e.metaKey : e.ctrlKey, r = o === "mac" ? e.ctrlKey : e.metaKey, n = t.primary === !0;
  return !(n !== s || n && r || !n && (e.ctrlKey || e.metaKey) || (t.shift || !1) !== e.shiftKey || (t.alt || !1) !== e.altKey);
}, Ni = (e, t) => {
  const o = Di(t.platform), s = Li.find(
    (r) => (!r.platform || r.platform === o) && Fi(e.key, r.key) && Hi(e, r, o)
  );
  return s ? typeof s.command == "function" ? s.command(e, t) : { ...s.command } : null;
}, ji = (e, t = {}) => {
  if (Hs(e, t)) return null;
  const o = e.key, s = e.shiftKey ? t.fastMoveStep || 4 : t.moveStep || 1, r = e.shiftKey ? t.fastResizeStep || 2 : t.resizeStep || 1, n = Ni(e, t);
  if (n) return n;
  const i = o === "ArrowLeft" ? { dx: -s, dy: 0, dw: -r, dh: 0 } : o === "ArrowRight" ? { dx: s, dy: 0, dw: r, dh: 0 } : o === "ArrowUp" ? { dx: 0, dy: -s, dw: 0, dh: -r } : o === "ArrowDown" ? { dx: 0, dy: s, dw: 0, dh: r } : null;
  return !i || e.ctrlKey || e.metaKey ? null : e.altKey ? {
    type: "resize",
    source: "keyboard",
    payload: {
      dw: i.dw,
      dh: i.dh
    },
    history: {
      mergeKey: "keyboard-resize",
      mergeWindowMs: 650
    }
  } : {
    type: "move",
    source: "keyboard",
    payload: {
      dx: i.dx,
      dy: i.dy
    },
    history: {
      mergeKey: "keyboard-move",
      mergeWindowMs: 650
    }
  };
}, fs = (e) => {
  var o, s, r, n, i;
  return e.status !== "blocked" && e.status !== "error" && e.status !== "timeout" ? null : {
    code: ((o = e.blocked) == null ? void 0 : o.reason) || ((s = e.error) == null ? void 0 : s.message) || "editor-command",
    level: e.status === "error" ? "error" : "warning",
    message: ((r = e.blocked) == null ? void 0 : r.message) || ((n = e.error) == null ? void 0 : n.message) || `Command ${e.type} was not applied.`,
    itemIds: (i = e.blocked) == null ? void 0 : i.itemIds,
    recoverable: e.status !== "error"
  };
}, Ki = (e, t = {}) => {
  if (t.enabled === !1) return () => {
  };
  const o = t.target || (typeof window != "undefined" ? window : null);
  if (!o) return () => {
  };
  const s = typeof o == "string" && typeof document != "undefined" ? document.querySelector(o) || window : o;
  if (!s || typeof s.addEventListener != "function")
    return () => {
    };
  const r = (n) => {
    var d, c;
    const i = n;
    if (!Hs(i, t) && e.placementSession.value) {
      if (i.key === "Escape") {
        i.preventDefault(), e.cancelPlacement("keyboard-escape"), (d = t.ariaMessage) == null || d.call(t, {
          code: "grid-editor.placement.cancelled",
          level: "info",
          message: "Placement cancelled.",
          recoverable: !0
        });
        return;
      }
      if (i.key === "Enter") {
        i.preventDefault(), e.commitPlacement({ source: "keyboard" }).then((p) => {
          var v;
          const m = fs(p);
          (v = t.ariaMessage) == null || v.call(t, m || {
            code: "grid-editor.placement.commit",
            level: "info",
            message: "Placement committed.",
            itemIds: p.affectedIds,
            recoverable: !0
          });
        });
        return;
      }
      const y = i.shiftKey ? t.placementFastNudgeStep || 4 : t.placementNudgeStep || 1, l = i.key === "ArrowLeft" ? { dx: -y, dy: 0 } : i.key === "ArrowRight" ? { dx: y, dy: 0 } : i.key === "ArrowUp" ? { dx: 0, dy: -y } : i.key === "ArrowDown" ? { dx: 0, dy: y } : null;
      if (l && !i.ctrlKey && !i.metaKey && !i.altKey) {
        i.preventDefault();
        const p = e.placementSession.value, m = p.cursor || ((c = p.ghostItems[0]) == null ? void 0 : c.item) || p.items[0];
        e.updatePlacement({
          cursor: {
            x: Math.max(0, ((m == null ? void 0 : m.x) || 0) + l.dx),
            y: Math.max(0, ((m == null ? void 0 : m.y) || 0) + l.dy),
            source: "keyboard"
          }
        });
        return;
      }
    }
    const f = ji(i, t);
    if (f) {
      if (i.preventDefault(), f.type === "paste" && t.pasteMode === "interactive") {
        e.beginPlacement({
          source: "paste",
          commandType: "paste",
          strategy: "cursor",
          placementIntent: "here",
          placementAnchor: "top-left"
        }).then((y) => {
          var l, p, m, v, C, M;
          y.status === "blocked" ? (v = t.ariaMessage) == null || v.call(t, {
            code: ((l = y.blocked) == null ? void 0 : l.reason) || "grid-editor.placement.blocked",
            level: "warning",
            message: ((p = y.blocked) == null ? void 0 : p.message) || "Placement could not start.",
            itemIds: (m = y.blocked) == null ? void 0 : m.itemIds,
            recoverable: !0
          }) : (M = t.ariaMessage) == null || M.call(t, {
            code: "grid-editor.placement.start",
            level: "info",
            message: "Placement started.",
            itemIds: (C = y.session) == null ? void 0 : C.items.map((k) => k.i),
            recoverable: !0
          });
        });
        return;
      }
      e.execute(f).then((y) => {
        var p;
        const l = fs(y);
        l && ((p = t.ariaMessage) == null || p.call(t, l));
      });
    }
  };
  return s.addEventListener("keydown", r), () => {
    s.removeEventListener("keydown", r);
  };
}, Xi = 2, Yi = 1, _i = 0.5, Ui = 1, Wi = 500, qi = 0.01, Vi = {
  drag: 3,
  drop: 3,
  placement: 3,
  resize: 2,
  keyboard: 3,
  api: 3
}, ys = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, ps = (e) => [
  { kind: "left", axis: "x", position: e.x, priority: 10, edge: "left" },
  { kind: "right", axis: "x", position: e.x + e.w, priority: 11, edge: "right" },
  { kind: "center-x", axis: "x", position: e.x + e.w / 2, priority: 20, edge: "center-x" },
  { kind: "top", axis: "y", position: e.y, priority: 10, edge: "top" },
  { kind: "bottom", axis: "y", position: e.y + e.h, priority: 11, edge: "bottom" },
  { kind: "center-y", axis: "y", position: e.y + e.h / 2, priority: 20, edge: "center-y" }
], Zi = (e, t) => {
  const o = [], s = e.x + e.w, r = t.x + t.w, n = e.y + e.h, i = t.y + t.h, f = Math.max(e.y, t.y), d = Math.min(n, i), c = Math.max(e.x, t.x), y = Math.min(s, r), l = f + Math.max(0, d - f) / 2, p = c + Math.max(0, y - c) / 2;
  if (d > f && s < t.x) {
    const m = t.x - s;
    o.push({
      kind: "spacing-x",
      axis: "x",
      position: l,
      start: s,
      end: t.x,
      distance: m,
      priority: 40 + m,
      label: `${m} ${m === 1 ? "col" : "cols"}`
    });
  }
  if (d > f && r < e.x) {
    const m = e.x - r;
    o.push({
      kind: "spacing-x",
      axis: "x",
      position: l,
      start: r,
      end: e.x,
      distance: m,
      priority: 40 + m,
      label: `${m} ${m === 1 ? "col" : "cols"}`
    });
  }
  if (y > c && n < t.y) {
    const m = t.y - n;
    o.push({
      kind: "spacing-y",
      axis: "y",
      position: p,
      start: n,
      end: t.y,
      distance: m,
      priority: 40 + m,
      label: `${m} ${m === 1 ? "row" : "rows"}`
    });
  }
  if (y > c && i < e.y) {
    const m = e.y - i;
    o.push({
      kind: "spacing-y",
      axis: "y",
      position: p,
      start: i,
      end: e.y,
      distance: m,
      priority: 40 + m,
      label: `${m} ${m === 1 ? "row" : "rows"}`
    });
  }
  return o;
}, Ns = (e, t, o) => {
  var s, r;
  return !(e.static && o.includeStatic === !1 || (s = t[e.i]) != null && s.locked && o.includeLocked === !1 || ((r = t[e.i]) == null ? void 0 : r.visible) === !1 && o.includeHidden !== !0);
}, Ji = (e, t) => e.y === t.y || e.y + e.h === t.y + t.h || e.x === t.x || e.x + e.w === t.x + t.w, Qi = (e, t, o, s, r, n, i, f) => {
  const d = s.axis === "x" ? Math.min(t.y, o.y) : Math.min(t.x, o.x), c = s.axis === "x" ? Math.max(t.y + t.h, o.y + o.h) : Math.max(t.x + t.w, o.x + o.w), y = Math.abs(s.position - r.position), l = n > 0 ? Math.max(0, Math.min(1, 1 - y / n)) : y === 0 ? 1 : 0, p = y <= i, m = f && Ji(t, o) ? 20 : 0;
  return {
    id: `${e}:${s.kind}:${t.i}:${r.kind}`,
    kind: s.kind,
    axis: s.axis,
    position: r.position,
    sourceIds: [t.i],
    targetId: e,
    distance: y,
    priority: s.priority + r.priority - m,
    proximity: l,
    isPredictive: !p,
    isSnapped: p,
    anchorIds: [t.i, e],
    sourceEdge: r.edge,
    targetEdge: s.edge,
    display: {
      kind: "alignment",
      start: d,
      end: c,
      sourceIds: [t.i]
    }
  };
}, dt = (e) => e.kind === "spacing-x" || e.kind === "spacing-y", er = (e) => e.debug === !0 || e.debug === "layer" || e.debug === "panel", tr = (e) => e.debug === "panel" ? "panel" : e.debug === !0 || e.debug === "layer" ? "layer" : !1, or = (e, t) => {
  const o = e.maxVisibleGuides;
  return typeof o == "number" ? Math.max(0, o) : o && typeof o[t] == "number" ? Math.max(0, o[t] || 0) : Vi[t];
}, sr = (e) => !!(e.display && Number.isFinite(e.display.start) && Number.isFinite(e.display.end) && e.display.end > e.display.start), ms = (e, t) => (t.includes(e.id) ? -1e3 : 0) + (e.isSnapped ? -500 : 0) + (dt(e) ? 20 : 0) - Math.round((e.proximity || 0) * 50), ir = (e, t) => {
  const o = Array.from(/* @__PURE__ */ new Set([...e.sourceIds, ...t.sourceIds])), s = e.anchorIds || t.anchorIds ? Array.from(/* @__PURE__ */ new Set([...e.anchorIds || [], ...t.anchorIds || []])) : void 0;
  return {
    ...e,
    sourceIds: o,
    anchorIds: s,
    display: e.display ? { ...e.display, sourceIds: o } : e.display
  };
}, rr = (e, t = {}, o = []) => {
  var y, l, p, m;
  const s = t.interaction || "drag", r = or(t, s);
  if (r <= 0) return [];
  const n = e.filter(sr).slice().sort(
    (v, C) => ms(v, o) - ms(C, o) || v.distance - C.distance || v.priority - C.priority || v.id.localeCompare(C.id)
  ), i = /* @__PURE__ */ new Map(), f = [];
  for (let v = 0; v < n.length; v += 1) {
    const C = n[v], M = dt(C) ? `s:${C.kind}:${C.position}:${(l = (y = C.display) == null ? void 0 : y.start) != null ? l : ""}:${(m = (p = C.display) == null ? void 0 : p.end) != null ? m : ""}` : `a:${C.kind}:${C.axis}:${C.position}`, k = i.get(M);
    k ? dt(C) || i.set(M, ir(k, C)) : (i.set(M, C), f.push(M));
  }
  const d = f.slice(0, r).map((v) => i.get(v)).filter(Boolean);
  let c = !1;
  return d.map((v) => {
    if (!v.display) return v;
    const C = t.showSpacingLabels !== !1 && dt(v) && !c;
    return C && (c = !0), {
      ...v,
      display: {
        ...v.display,
        showLabel: C
      }
    };
  });
}, Ut = (e, t, o, s, r) => {
  const n = t.x + t.w, i = t.y + t.h;
  let f = null;
  for (let d = 0; d < o.length; d += 1) {
    const c = o[d];
    if (c.i === t.i || !Ns(c, s, r)) continue;
    const y = c.x + c.w, l = c.y + c.h;
    if (e === "left" || e === "right") {
      const p = Math.max(t.y, c.y), m = Math.min(i, l);
      if (m <= p) continue;
      if (e === "left" && y <= t.x) {
        const v = t.x - y;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: y, end: t.x },
          position: p + (m - p) / 2
        });
      } else if (e === "right" && c.x >= n) {
        const v = c.x - n;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: n, end: c.x },
          position: p + (m - p) / 2
        });
      }
    } else {
      const p = Math.max(t.x, c.x), m = Math.min(n, y);
      if (m <= p) continue;
      if (e === "top" && l <= t.y) {
        const v = t.y - l;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: l, end: t.y },
          position: p + (m - p) / 2
        });
      } else if (e === "bottom" && c.y >= i) {
        const v = c.y - i;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: i, end: c.y },
          position: p + (m - p) / 2
        });
      }
    }
  }
  return f;
}, nr = (e) => e === "left" || e === "right" ? "x" : "y", ar = (e) => e === "left" || e === "right" ? "col" : "row", cr = (e, t, o, s) => {
  var p;
  if (s.showSpacingChips === !1) return [];
  const r = (p = s.spacingChipMinDistance) != null ? p : Ui, n = ["top", "right", "bottom", "left"], i = {
    top: Ut("top", e, t, o, s),
    right: Ut("right", e, t, o, s),
    bottom: Ut("bottom", e, t, o, s),
    left: Ut("left", e, t, o, s)
  }, f = (m, v) => !!(m && v && Math.abs(m.distance - v.distance) <= qi), d = s.detectEqualSpacing !== !1, c = d && f(i.left, i.right), y = d && f(i.top, i.bottom), l = [];
  for (let m = 0; m < n.length; m += 1) {
    const v = n[m], C = i[v];
    if (!C || C.distance < r) continue;
    const M = v === "left" || v === "right" ? c : y;
    l.push({
      id: `chip:${e.i}:${v}:${C.id}`,
      side: v,
      axis: nr(v),
      position: C.position,
      span: C.span,
      distance: C.distance,
      unit: ar(v),
      isEqual: M,
      neighborId: C.id
    });
  }
  return l;
};
function dr(e, t, o) {
  var i, f, d, c;
  if (t.showMeasurementHud === !1) return null;
  const s = t.itemLabels || {}, r = {
    itemId: e.i,
    label: s[e.i] || e.i,
    position: { x: e.x, y: e.y },
    size: { w: e.w, h: e.h },
    interaction: o
  }, n = (i = t.startGeometry) == null ? void 0 : i[e.i];
  return t.delta ? r.delta = t.delta : n && (r.delta = {
    dx: e.x - n.x,
    dy: e.y - n.y,
    dw: e.w - n.w,
    dh: e.h - n.h
  }), (f = t.blocked) != null && f.reason && (r.blocked = t.blocked.reason), (d = t.blocked) != null && d.message && (r.blockedMessage = t.blocked.message), (c = t.blocked) != null && c.itemIds && (r.blockedItemIds = t.blocked.itemIds), typeof t.selectionCount == "number" && (r.selectionCount = t.selectionCount), r;
}
const lr = (e, t, o) => {
  if (o.highlightAlignmentTargets === !1) return [];
  if (!t) return [];
  const s = e.filter(
    (c) => !dt(c) && c.targetEdge && c.sourceEdge
  ), r = s.filter((c) => c.isSnapped), n = r.length > 0 ? r : s.slice().sort((c, y) => (y.proximity || 0) - (c.proximity || 0)).slice(0, 1), i = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
  for (let c = 0; c < n.length; c += 1) {
    const y = n[c];
    if (!(!y.targetEdge || !y.sourceEdge)) {
      i.has(y.axis) || i.set(y.axis, y.targetEdge);
      for (let l = 0; l < y.sourceIds.length; l += 1) {
        const p = y.sourceIds[l];
        f.has(p) || f.set(p, /* @__PURE__ */ new Map());
        const m = f.get(p);
        m && (m.has(y.axis) || m.set(y.axis, y.sourceEdge));
      }
    }
  }
  const d = [];
  return i.size > 0 && d.push({
    itemId: t,
    sides: Array.from(i.values()),
    role: "active"
  }), f.forEach((c, y) => {
    c.size !== 0 && d.push({
      itemId: y,
      sides: Array.from(c.values()),
      role: "source"
    });
  }), d;
}, ur = (e, t, o, s = {}, r = {}) => {
  var j, me, he, Ee;
  const n = ys(), i = r.interaction || "drag";
  if (r.enabled === !1)
    return {
      activeId: t.i,
      interaction: i,
      guides: [],
      displayGuides: [],
      snappedGuideIds: [],
      spacingLabelGuideIds: [],
      spacingChips: [],
      measurementHud: null,
      anchorEdges: [],
      showGrid: !1,
      debug: !1,
      debugMode: !1
    };
  const f = (j = r.maxItems) != null ? j : Wi, d = typeof r.thresholdPx == "number" ? r.thresholdPx : null, c = (me = r.predictRadiusX) != null ? me : d !== null ? d : Xi, y = (he = r.predictRadiusY) != null ? he : d !== null ? d : Yi, l = (Ee = r.snapThresholdCells) != null ? Ee : d !== null ? d : _i, p = r.sectionSnap !== !1, m = e.filter(
    (ie) => ie.i !== t.i && Ns(ie, s, r)
  ), v = m.length > f, C = v ? m.slice(0, f) : m, M = ps(o), k = [];
  C.forEach((ie) => {
    const q = ps(ie);
    M.forEach((ne) => {
      q.forEach((Ae) => {
        if (ne.axis !== Ae.axis) return;
        const Fe = Math.abs(ne.position - Ae.position), je = ne.axis === "x" ? c : y;
        Fe <= je && k.push(Qi(
          t.i,
          ie,
          o,
          ne,
          Ae,
          je,
          l,
          p
        ));
      });
    }), Zi(ie, o).forEach((ne) => {
      k.push({
        id: `${t.i}:${ne.kind}:${ie.i}`,
        kind: ne.kind,
        axis: ne.axis,
        position: ne.position,
        sourceIds: [ie.i],
        targetId: t.i,
        distance: ne.distance,
        priority: ne.priority,
        proximity: ne.distance === 0 ? 1 : 0.5,
        isPredictive: ne.distance > l,
        isSnapped: ne.distance <= l,
        anchorIds: [ie.i, t.i],
        display: {
          kind: "spacing",
          start: ne.start,
          end: ne.end,
          label: ne.label,
          sourceIds: [ie.i]
        }
      });
    });
  }), k.sort(
    (ie, q) => ie.distance - q.distance || ie.priority - q.priority || ie.id.localeCompare(q.id)
  );
  const F = k.filter((ie) => !dt(ie) && ie.isSnapped), X = r.snap === !1 || F.length === 0 ? [] : [F[0].id], z = rr(k, r, X), ae = tr(r), D = er(r), x = z.filter((ie) => {
    var q;
    return (q = ie.display) == null ? void 0 : q.showLabel;
  }).map((ie) => ie.id), P = cr(o, e, s, r), A = dr(o, r, i), R = lr(z, t.i, r), O = k.filter((ie) => ie.isPredictive && !dt(ie)).length, S = F.length, E = ys() - n, W = typeof r.maxDurationMs == "number" && E > r.maxDurationMs;
  return {
    activeId: t.i,
    interaction: i,
    guides: k,
    displayGuides: z,
    debugGuides: D ? k : void 0,
    snappedGuideIds: X,
    spacingLabelGuideIds: x,
    spacingChips: P,
    measurementHud: A,
    anchorEdges: R,
    showGrid: r.showGrid !== !1,
    debug: D,
    debugMode: ae,
    diagnostics: {
      durationMs: E,
      itemCount: m.length,
      degraded: v || W,
      reason: v ? "max-items" : W ? "max-duration" : void 0,
      fullGuideCount: k.length,
      displayGuideCount: z.length,
      spacingLabelCount: x.length,
      predictCount: O,
      snappedCount: S,
      anchorEdgeCount: R.length,
      spacingChipCount: P.length
    }
  };
}, Wn = (e, t, o, s = {}, r = {}) => Go({
  layout: e,
  activeItem: t,
  candidateItem: o,
  selectionIds: [t.i],
  metaById: s,
  cols: r.cols || 12,
  maxRows: r.maxRows,
  margin: r.margin,
  rowHeight: r.rowHeight,
  interaction: r.interaction || "drag",
  startGeometry: r.startGeometry,
  options: r
}).guideState, qn = (e, t) => {
  const o = t.snappedGuideIds[0];
  if (!o) return e;
  const s = t.guides.find((r) => r.id === o);
  return !s || dt(s) ? e : s.axis === "x" ? s.kind === "right" ? { ...e, x: s.position - e.w } : s.kind === "center-x" ? { ...e, x: s.position - e.w / 2 } : { ...e, x: s.position } : s.kind === "bottom" ? { ...e, y: s.position - e.h } : s.kind === "center-y" ? { ...e, y: s.position - e.h / 2 } : { ...e, y: s.position };
}, hs = (e) => !!e && typeof e == "object" && !Array.isArray(e), fr = (e) => {
  if (!e || typeof e.id != "string" || !e.id || e.kind !== "section" && e.kind !== "row") return null;
  const t = Number.isFinite(e.order) ? e.order : 0, o = e.bounds && Number.isFinite(e.bounds.x) && Number.isFinite(e.bounds.y) && Number.isFinite(e.bounds.w) && Number.isFinite(e.bounds.h) && e.bounds.w > 0 && e.bounds.h > 0 ? e.bounds : void 0, s = e.boundsPolicy === "fixed" || e.boundsPolicy === "content" || e.boundsPolicy === "viewport" ? e.boundsPolicy : void 0, r = e.dropPolicy === "inside" || e.dropPolicy === "between" || e.dropPolicy === "none" ? e.dropPolicy : void 0, n = e.crossScopePolicy === "allow" || e.crossScopePolicy === "block" || e.crossScopePolicy === "ask" ? e.crossScopePolicy : void 0;
  return {
    id: e.id,
    kind: e.kind,
    label: typeof e.label == "string" ? e.label : void 0,
    parentId: typeof e.parentId == "string" ? e.parentId : void 0,
    order: t,
    bounds: o,
    boundsPolicy: s,
    collapsed: e.collapsed === !0,
    locked: e.locked === !0,
    itemIds: Array.isArray(e.itemIds) ? Array.from(new Set(e.itemIds.filter((i) => typeof i == "string" && i))) : void 0,
    dropPolicy: r,
    crossScopePolicy: n,
    allowedDropZones: Array.isArray(e.allowedDropZones) ? Array.from(new Set(e.allowedDropZones.filter(
      (i) => i === "start" || i === "inside" || i === "end" || i === "between"
    ))) : void 0
  };
}, js = () => ({
  version: 1,
  items: {},
  itemMembership: {}
}), Le = (e, t = []) => {
  const o = new Set(t.map((d) => d.i)), s = t.length > 0, r = [];
  if (!e)
    return { version: 1, items: {}, itemMembership: {}, warnings: r };
  if (!hs(e) || e.version !== 1 || !hs(e.items))
    return r.push({
      code: "grid-editor.sectionRows.unknown-version",
      level: "warning",
      message: "Unsupported section/row metadata version was ignored.",
      recoverable: !0
    }), { version: 1, items: {}, itemMembership: {}, warnings: r };
  const n = {};
  Object.keys(e.items).sort().forEach((d) => {
    const c = fr(e.items[d]);
    c && (n[c.id] = c);
  });
  const i = {}, f = (d, c) => {
    if (s && !o.has(d)) {
      r.push({
        code: "grid-editor.sectionRows.orphan-membership",
        level: "warning",
        message: "Section/row membership referenced an item that is not in the layout.",
        itemIds: [d],
        recoverable: !0
      });
      return;
    }
    i[d] = { ...i[d] || {}, ...c };
  };
  return Object.keys(e.itemMembership || {}).sort().forEach((d) => {
    var y, l, p;
    const c = ((y = e.itemMembership) == null ? void 0 : y[d]) || {};
    f(d, {
      sectionId: c.sectionId && ((l = n[c.sectionId]) == null ? void 0 : l.kind) === "section" ? c.sectionId : void 0,
      rowId: c.rowId && ((p = n[c.rowId]) == null ? void 0 : p.kind) === "row" ? c.rowId : void 0
    });
  }), Object.keys(n).sort((d, c) => n[d].order - n[c].order || d.localeCompare(c)).forEach((d) => {
    const c = n[d];
    (c.itemIds || []).forEach((y) => {
      f(y, c.kind === "section" ? { sectionId: c.id } : { rowId: c.id });
    });
  }), { version: 1, items: n, itemMembership: i, warnings: r };
}, yr = 500, pr = 160, mr = 16, gs = 240, vs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, hr = (e, t, o) => ({
  activeId: e,
  interaction: t,
  guides: [],
  displayGuides: [],
  debugGuides: void 0,
  snappedGuideIds: [],
  spacingLabelGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: [],
  showGrid: !1,
  debug: !1,
  debugMode: !1,
  diagnostics: o ? {
    durationMs: o.durationMs,
    itemCount: o.itemCount,
    degraded: o.degraded,
    reason: o.reason,
    fullGuideCount: 0,
    displayGuideCount: 0,
    spacingLabelCount: 0,
    predictCount: 0,
    snappedCount: 0,
    anchorEdgeCount: 0,
    spacingChipCount: 0,
    intelligence: o
  } : void 0
}), wo = (e, t) => ({
  i: e.i,
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h,
  left: e.x,
  right: e.x + e.w,
  top: e.y,
  bottom: e.y + e.h,
  centerX: e.x + e.w / 2,
  centerY: e.y + e.h / 2,
  area: e.w * e.h,
  sectionId: t == null ? void 0 : t.sectionId,
  rowId: t == null ? void 0 : t.rowId
}), gr = (e) => {
  const t = Object.keys(e).sort(), o = {}, s = {};
  return t.forEach((r) => {
    const n = e[r], i = Math.floor(n.top), f = Math.max(i, Math.floor(n.bottom - 1)), d = Math.floor(n.left), c = Math.max(d, Math.floor(n.right - 1));
    for (let y = i; y <= f; y++)
      o[y] || (o[y] = []), o[y].push(r);
    for (let y = d; y <= c; y++)
      s[y] || (s[y] = []), s[y].push(r);
  }), Object.keys(o).forEach((r) => o[Number(r)].sort()), Object.keys(s).forEach((r) => s[Number(r)].sort()), { byId: e, ids: t, rows: o, columns: s };
}, ro = (e, t, o, s) => Math.max(0, Math.min(t, s) - Math.max(e, o)), bs = (e, t, o) => {
  if (o === "x") {
    const i = ro(e.top, e.bottom, t.top, t.bottom);
    if (i <= 0) return null;
    const f = t.left >= e.right ? t.left - e.right : e.left >= t.right ? e.left - t.right : 0, d = t.left >= e.right ? "after" : e.left >= t.right ? "before" : "overlap";
    return {
      id: `${e.i}:x:${t.i}`,
      sourceId: e.i,
      targetId: t.i,
      axis: o,
      direction: d,
      gap: f,
      overlap: i,
      priority: f,
      sectionId: e.sectionId === t.sectionId ? e.sectionId : void 0,
      rowId: e.rowId === t.rowId ? e.rowId : void 0
    };
  }
  const s = ro(e.left, e.right, t.left, t.right);
  if (s <= 0) return null;
  const r = t.top >= e.bottom ? t.top - e.bottom : e.top >= t.bottom ? e.top - t.bottom : 0, n = t.top >= e.bottom ? "after" : e.top >= t.bottom ? "before" : "overlap";
  return {
    id: `${e.i}:y:${t.i}`,
    sourceId: e.i,
    targetId: t.i,
    axis: o,
    direction: n,
    gap: r,
    overlap: s,
    priority: r,
    sectionId: e.sectionId === t.sectionId ? e.sectionId : void 0,
    rowId: e.rowId === t.rowId ? e.rowId : void 0
  };
}, vr = (e) => {
  const t = Object.keys(e).sort(), o = [];
  for (let s = 0; s < t.length; s++)
    for (let r = s + 1; r < t.length; r++) {
      const n = e[t[s]], i = e[t[r]], f = bs(n, i, "x"), d = bs(n, i, "y");
      f && o.push(f), d && o.push(d);
    }
  return o.sort(
    (s, r) => s.priority - r.priority || s.axis.localeCompare(r.axis) || s.sourceId.localeCompare(r.sourceId) || s.targetId.localeCompare(r.targetId)
  );
}, br = (e) => e.axis === "x" ? e.direction === "before" ? "left" : "right" : e.direction === "before" ? "top" : "bottom", Ir = (e, t, o) => {
  const s = t.filter((n) => n.gap > 0).map((n) => {
    const i = e[n.sourceId], f = e[n.targetId], d = n.axis, c = d === "x" ? i.right <= f.left : i.bottom <= f.top, y = d === "x" ? c ? i.right : f.right : c ? i.bottom : f.bottom, l = d === "x" ? c ? f.left : i.left : c ? f.top : i.top, p = d === "x" ? Math.max(i.top, f.top) + n.overlap / 2 : Math.max(i.left, f.left) + n.overlap / 2;
    return {
      id: `${n.id}:spacing`,
      axis: d,
      sourceId: n.sourceId,
      targetId: n.targetId,
      side: br(n),
      start: y,
      end: l,
      position: p,
      distance: n.gap,
      unit: d === "x" ? "col" : "row",
      sectionId: n.sectionId,
      rowId: n.rowId
    };
  }), r = /* @__PURE__ */ new Map();
  return s.forEach((n) => {
    const i = `${n.axis}:${n.sectionId || ""}:${n.rowId || ""}:${n.distance}`;
    r.set(i, (r.get(i) || 0) + 1);
  }), s.map((n) => {
    const i = `${n.axis}:${n.sectionId || ""}:${n.rowId || ""}:${n.distance}`;
    return {
      ...n,
      isEqual: (r.get(i) || 0) > 1,
      deviation: 0,
      mode: n.axis === "x" ? "spacing-x" : "spacing-y"
    };
  }).sort(
    (n, i) => n.distance - i.distance || n.axis.localeCompare(i.axis) || n.sourceId.localeCompare(i.sourceId) || n.targetId.localeCompare(i.targetId)
  ).slice(0, o);
}, Is = (e) => e === "x" ? "horizontal" : "vertical", xs = (e) => e === "x" ? "spacing-x" : "spacing-y", Wt = (e, t, o, s) => {
  if (e.length < 3) return null;
  const r = e.slice().sort(
    (m, v) => t === "x" ? m.left - v.left || m.i.localeCompare(v.i) : m.top - v.top || m.i.localeCompare(v.i)
  ), n = r[0], i = r[r.length - 1], f = t === "x" ? { start: n.left, end: i.right } : { start: n.top, end: i.bottom }, d = [];
  for (let m = 1; m < r.length; m++) {
    const v = r[m - 1], C = r[m];
    d.push(o === "center-to-center" ? t === "x" ? C.centerX - v.centerX : C.centerY - v.centerY : t === "x" ? C.left - v.right : C.top - v.bottom);
  }
  const c = d.length > 0 ? d.reduce((m, v) => m + v, 0) / d.length : 0, y = d.reduce(
    (m, v) => Math.max(m, Math.abs(v - c)),
    0
  ), l = Array.from(new Set(r.map((m) => m.sectionId).filter(Boolean))), p = Array.from(new Set(r.map((m) => m.rowId).filter(Boolean)));
  return {
    id: `${s}:${o}:${r.map((m) => m.i).join(",")}`,
    mode: s,
    axis: t,
    strategy: o,
    itemIds: r.map((m) => m.i),
    movableIds: r.slice(1, -1).map((m) => m.i),
    currentSpacing: d,
    targetSpacing: c,
    isEqual: y <= 0.01,
    deviation: y,
    bounds: f,
    anchor: { type: "selection" },
    sectionId: l.length === 1 ? l[0] : void 0,
    rowId: p.length === 1 ? p[0] : void 0
  };
}, xr = (e) => {
  var i, f;
  const t = Le(e.sectionRows, e.layout), o = new Set(e.selectionIds || []), s = e.layout.filter((d) => o.size === 0 || o.has(d.i)).map((d) => wo(d, t.itemMembership[d.i]));
  if (s.length < 3) return [];
  const r = [
    Wt(s, "x", "edge-to-edge", Is("x")),
    Wt(s, "y", "edge-to-edge", Is("y")),
    Wt(s, "x", "center-to-center", xs("x")),
    Wt(s, "y", "center-to-center", xs("y"))
  ].filter(Boolean), n = (f = (i = e.options) == null ? void 0 : i.maxDistributionCandidates) != null ? f : mr;
  return r.sort((d, c) => d.deviation - c.deviation || d.id.localeCompare(c.id)).slice(0, n);
}, wr = (e, t, o, s) => {
  const r = { x: t.x, y: t.y, w: t.w, h: t.h };
  if (e.kind === "spacing-x" || e.kind === "spacing-y") return r;
  const n = s === "w" || s === "sw" || s === "nw", i = s === "n" || s === "ne" || s === "nw";
  if (o === "resize") {
    if (e.kind === "right") return { ...r, w: Math.max(1, e.position - t.x) };
    if (e.kind === "bottom") return { ...r, h: Math.max(1, e.position - t.y) };
    if (e.kind === "left" && n) {
      const f = t.x + t.w;
      return { ...r, x: e.position, w: Math.max(1, f - e.position) };
    }
    if (e.kind === "top" && i) {
      const f = t.y + t.h;
      return { ...r, y: e.position, h: Math.max(1, f - e.position) };
    }
  }
  return e.axis === "x" ? e.kind === "right" ? { ...r, x: e.position - t.w } : e.kind === "center-x" ? { ...r, x: e.position - t.w / 2 } : { ...r, x: e.position } : e.kind === "bottom" ? { ...r, y: e.position - t.h } : e.kind === "center-y" ? { ...r, y: e.position - t.h / 2 } : { ...r, y: e.position };
}, Ks = (e) => {
  var o, s, r;
  const t = (r = (o = e.options) == null ? void 0 : o.snapThresholdCells) != null ? r : (s = e.options) == null ? void 0 : s.thresholdPx;
  return typeof t == "number" && Number.isFinite(t) ? t : 0.5;
}, ko = (e, t, o, s) => {
  if (s === !0) return !1;
  const r = e.itemMembership[t], n = e.itemMembership[o];
  if (!r || !n) return !1;
  if (r.sectionId && n.sectionId && r.sectionId !== n.sectionId) {
    const i = e.items[r.sectionId], f = e.items[n.sectionId];
    return (i == null ? void 0 : i.crossScopePolicy) !== "allow" && (f == null ? void 0 : f.crossScopePolicy) !== "allow";
  }
  if (r.rowId && n.rowId && r.rowId !== n.rowId) {
    const i = e.items[r.rowId], f = e.items[n.rowId];
    return (i == null ? void 0 : i.crossScopePolicy) !== "allow" && (f == null ? void 0 : f.crossScopePolicy) !== "allow";
  }
  return !1;
}, kr = (e, t, o, s, r) => {
  if (!t) return [];
  const n = Ks(e), i = e.layout.filter((l) => l.i !== t.i).sort((l, p) => l.i.localeCompare(p.i)), f = o.filter((l) => l.sourceId !== t.i && l.targetId !== t.i && l.distance > 0).sort((l, p) => l.distance - p.distance || l.id.localeCompare(p.id)), d = [], c = t.x + t.w, y = t.y + t.h;
  return i.forEach((l) => {
    const p = l.x + l.w, m = l.y + l.h, v = ro(t.y, y, l.y, m) > 0, C = ro(t.x, c, l.x, p) > 0, M = p <= t.x, k = c <= l.x, F = m <= t.y, X = y <= l.y;
    f.forEach((z) => {
      var ae, D, x, P, A, R;
      if (z.axis === "x" && v && (M || k)) {
        const O = M ? t.x - p : l.x - c, S = Math.abs(O - z.distance);
        if (S <= n) {
          const E = M ? p + z.distance : l.x - z.distance - t.w, W = ko(
            s,
            l.i,
            t.i,
            (ae = e.options) == null ? void 0 : ae.allowCrossSectionRow
          ) ? "section-row-policy" : void 0;
          d.push({
            id: `snap:spacing:x:${t.i}:${l.i}:${z.id}`,
            kind: "spacing",
            axis: "x",
            sourceIds: [l.i, z.sourceId, z.targetId],
            targetId: t.i,
            targetEdge: M ? "left" : "right",
            sourceEdge: M ? "right" : "left",
            distance: S,
            proximity: n === 0 ? 1 : 1 - Math.min(1, S / n),
            priority: 30 + S,
            snapped: !W,
            geometry: { x: E, y: t.y, w: t.w, h: t.h },
            guideIds: [],
            sectionId: (D = s.itemMembership[t.i]) == null ? void 0 : D.sectionId,
            rowId: (x = s.itemMembership[t.i]) == null ? void 0 : x.rowId,
            blocked: W
          });
        }
      }
      if (z.axis === "y" && C && (F || X)) {
        const O = F ? t.y - m : l.y - y, S = Math.abs(O - z.distance);
        if (S <= n) {
          const E = F ? m + z.distance : l.y - z.distance - t.h, W = ko(
            s,
            l.i,
            t.i,
            (P = e.options) == null ? void 0 : P.allowCrossSectionRow
          ) ? "section-row-policy" : void 0;
          d.push({
            id: `snap:spacing:y:${t.i}:${l.i}:${z.id}`,
            kind: "spacing",
            axis: "y",
            sourceIds: [l.i, z.sourceId, z.targetId],
            targetId: t.i,
            targetEdge: F ? "top" : "bottom",
            sourceEdge: F ? "bottom" : "top",
            distance: S,
            proximity: n === 0 ? 1 : 1 - Math.min(1, S / n),
            priority: 30 + S,
            snapped: !W,
            geometry: { x: t.x, y: E, w: t.w, h: t.h },
            guideIds: [],
            sectionId: (A = s.itemMembership[t.i]) == null ? void 0 : A.sectionId,
            rowId: (R = s.itemMembership[t.i]) == null ? void 0 : R.rowId,
            blocked: W
          });
        }
      }
    });
  }), d.sort(
    (l, p) => l.priority - p.priority || p.proximity - l.proximity || l.distance - p.distance || l.id.localeCompare(p.id)
  ).slice(0, r);
}, Mr = (e, t, o, s) => {
  if (!t) return [];
  const r = Ks(e), n = [], i = [
    { axis: "x", edge: "left", position: t.x },
    { axis: "x", edge: "right", position: t.x + t.w },
    { axis: "x", edge: "center-x", position: t.x + t.w / 2 },
    { axis: "y", edge: "top", position: t.y },
    { axis: "y", edge: "bottom", position: t.y + t.h },
    { axis: "y", edge: "center-y", position: t.y + t.h / 2 }
  ];
  return Object.values(o.items).filter((d) => d.bounds && d.dropPolicy !== "none").sort((d, c) => d.order - c.order || d.id.localeCompare(c.id)).forEach((d) => {
    if (!d.bounds) return;
    const c = [
      { axis: "x", edge: "left", position: d.bounds.x },
      { axis: "x", edge: "right", position: d.bounds.x + d.bounds.w },
      { axis: "x", edge: "center-x", position: d.bounds.x + d.bounds.w / 2 },
      { axis: "y", edge: "top", position: d.bounds.y },
      { axis: "y", edge: "bottom", position: d.bounds.y + d.bounds.h },
      { axis: "y", edge: "center-y", position: d.bounds.y + d.bounds.h / 2 }
    ];
    i.forEach((y) => {
      c.forEach((l) => {
        if (y.axis !== l.axis) return;
        const p = Math.abs(y.position - l.position);
        if (p > r) return;
        const m = { x: t.x, y: t.y, w: t.w, h: t.h };
        y.axis === "x" ? y.edge === "right" ? m.x = l.position - t.w : y.edge === "center-x" ? m.x = l.position - t.w / 2 : m.x = l.position : y.edge === "bottom" ? m.y = l.position - t.h : y.edge === "center-y" ? m.y = l.position - t.h / 2 : m.y = l.position, n.push({
          id: `snap:section-row:${d.id}:${y.edge}:${l.edge}`,
          kind: "section-row",
          axis: y.axis,
          sourceIds: [d.id],
          targetId: t.i,
          targetEdge: y.edge,
          sourceEdge: l.edge,
          distance: p,
          proximity: r === 0 ? 1 : 1 - Math.min(1, p / r),
          priority: d.kind === "row" ? -20 + p : -15 + p,
          snapped: !0,
          geometry: m,
          guideIds: [],
          sectionId: d.kind === "section" ? d.id : d.parentId,
          rowId: d.kind === "row" ? d.id : void 0,
          blocked: d.locked || d.collapsed ? d.locked ? "section-row-locked" : "section-row-collapsed" : void 0
        });
      });
    });
  }), n.sort(
    (d, c) => d.priority - c.priority || c.proximity - d.proximity || d.distance - c.distance || d.id.localeCompare(c.id)
  ).slice(0, s);
}, Sr = (e, t, o, s, r, n, i, f) => t ? e.guides.map((d) => {
  const c = d.kind === "spacing-x" || d.kind === "spacing-y" ? "spacing" : d.kind === "center-x" || d.kind === "center-y" ? "center" : "edge", y = r.itemMembership[t.i], l = d.sourceIds.some(
    (p) => ko(r, p, t.i, f)
  );
  return {
    id: `snap:${d.id}`,
    kind: c,
    axis: d.axis,
    sourceIds: d.sourceIds,
    targetId: d.targetId,
    targetEdge: d.targetEdge || (d.axis === "x" ? "left" : "top"),
    sourceEdge: d.sourceEdge,
    distance: d.distance,
    proximity: d.proximity || 0,
    priority: d.priority,
    snapped: o && d.isSnapped === !0 && c !== "spacing" && !l,
    geometry: wr(d, t, n, i),
    guideIds: [d.id],
    sectionId: y == null ? void 0 : y.sectionId,
    rowId: y == null ? void 0 : y.rowId,
    blocked: l ? "section-row-policy" : void 0
  };
}).sort(
  (d, c) => (d.snapped === c.snapped ? 0 : d.snapped ? -1 : 1) || d.distance - c.distance || d.priority - c.priority || d.id.localeCompare(c.id)
).slice(0, s) : [], Cr = (e, t) => {
  const o = [];
  return e.forEach((s) => {
    const r = t[s.i];
    (r == null ? void 0 : r.visible) === !1 && o.push({ code: "grid-editor.intelligence.filtered.hidden", itemIds: [s.i], reason: "hidden" }), r != null && r.locked && o.push({ code: "grid-editor.intelligence.filtered.locked", itemIds: [s.i], reason: "locked" }), s.static && o.push({ code: "grid-editor.intelligence.filtered.static", itemIds: [s.i], reason: "static-item" });
  }), o;
}, Go = (e) => {
  var j, me, he, Ee, ie, q, ne, Ae, Fe, je, ot, Ye, bt, It, xt, lt;
  const t = vs(), o = (me = (j = e.options) == null ? void 0 : j.maxItems) != null ? me : yr, s = (Ee = (he = e.options) == null ? void 0 : he.maxSnapCandidates) != null ? Ee : pr, r = ((ie = e.options) != null && ie.maxVisibleGuides, gs), n = e.metaById || {}, i = Le(e.sectionRows, e.layout), f = e.layout.length > o ? e.layout.slice(0, o) : e.layout.slice(), c = Si().build(f, {
    cols: e.cols,
    maxRows: e.maxRows,
    compactType: e.compactType,
    allowOverlap: e.allowOverlap,
    preventCollision: e.preventCollision
  }).getLayout(), y = {};
  c.forEach((ge) => {
    y[ge.i] = wo(ge, i.itemMembership[ge.i]);
  }), e.candidateItem && !y[e.candidateItem.i] && (y[e.candidateItem.i] = wo(
    e.candidateItem,
    i.itemMembership[e.candidateItem.i]
  ));
  const l = gr(y), p = vr(y), m = Ir(y, p, r), v = xr(e), C = e.interaction === "toolbar" ? "api" : e.interaction, M = e.activeItem && e.candidateItem ? ur(e.layout, e.activeItem, e.candidateItem, n, {
    ...e.options,
    interaction: C
  }) : hr(((q = e.activeItem) == null ? void 0 : q.i) || null, C), k = ((ne = e.options) == null ? void 0 : ne.snap) !== !1, F = Sr(
    M,
    e.candidateItem,
    k,
    s,
    i,
    e.interaction,
    (Ae = e.options) == null ? void 0 : Ae.resizeHandle,
    (Fe = e.options) == null ? void 0 : Fe.allowCrossSectionRow
  ), X = kr(
    e,
    e.candidateItem,
    m,
    i,
    s
  ), ae = [
    ...Mr(
      e,
      e.candidateItem,
      i,
      s
    ),
    ...X,
    ...F
  ].map((ge) => k ? ge : { ...ge, snapped: !1 }).sort(
    (ge, qe) => ge.priority - qe.priority || qe.proximity - ge.proximity || ge.distance - qe.distance || ge.id.localeCompare(qe.id)
  ).slice(0, s), D = vs() - t, x = typeof ((je = e.options) == null ? void 0 : je.maxDurationMs) == "number" && D > e.options.maxDurationMs, P = e.layout.length > o || x || !!((ot = M.diagnostics) != null && ot.degraded), A = e.layout.length > o ? "max-items" : x ? "max-duration" : ((Ye = M.diagnostics) == null ? void 0 : Ye.reason) === "max-items" || ((bt = M.diagnostics) == null ? void 0 : bt.reason) === "max-duration" ? M.diagnostics.reason : void 0, R = Cr(e.layout, n), O = ["grid-editor.intelligence.computed"];
  e.layout.length > o && O.push("grid-editor.intelligence.degraded.max-items"), x && O.push("grid-editor.intelligence.degraded.max-duration"), v.some((ge) => ge.isEqual) ? O.push("grid-editor.distribution.equal") : v.length > 0 && O.push("grid-editor.distribution.unequal"), i.warnings.forEach((ge) => O.push(ge.code)), R.forEach((ge) => O.push(ge.code));
  const S = {
    durationMs: D,
    itemCount: e.layout.length,
    selectedCount: ((It = e.selectionIds) == null ? void 0 : It.length) || 0,
    candidateCount: ae.length + v.length,
    snapCandidateCount: ae.length,
    distributionCandidateCount: v.length,
    spacingRelationCount: m.length,
    sectionRowCount: Object.keys(i.items).length,
    snapSource: ((xt = ae.find((ge) => ge.snapped)) == null ? void 0 : xt.kind) || "none",
    distributionMode: ((lt = v[0]) == null ? void 0 : lt.mode) || "none",
    sectionRowSource: Object.keys(i.items).length > 0 ? "metadata" : "none",
    degraded: P,
    reason: A,
    filtered: R,
    codes: O
  }, E = M.measurementHud, W = {
    ...M,
    diagnostics: {
      ...M.diagnostics || {
        durationMs: D,
        itemCount: e.layout.length
      },
      intelligence: S
    }
  };
  return {
    itemRects: y,
    geometryIndex: l,
    neighbors: p,
    snapCandidates: ae,
    spacingRelations: m,
    distributionCandidates: v,
    sectionRows: i,
    guideState: W,
    measurementHud: E,
    diagnostics: S
  };
}, ho = (e, t, o) => ({
  ...e,
  degraded: e.degraded || !!o,
  reason: o || e.reason,
  codes: e.codes.includes(t) ? e.codes : [...e.codes, t]
}), Rr = (e) => e === "collision" ? "grid-editor.snap.blocked.collision" : e === "bounds" ? "grid-editor.snap.blocked.bounds" : e === "maxRows" ? "grid-editor.snap.blocked.maxRows" : e === "section-row-policy" ? "grid-editor.snap.blocked.section-row-policy" : `grid-editor.snap.blocked.${e}`, Pr = (e, t, o, s) => {
  var i, f;
  const r = (i = s.validate) == null ? void 0 : i.call(s, e, o);
  if (r) return r;
  if (o.blocked) return o.blocked;
  const n = (f = s.metaById) == null ? void 0 : f[t.i];
  if (n != null && n.locked) return "locked";
  if ((n == null ? void 0 : n.visible) === !1) return "hidden";
  if (t.static) return "static-item";
  if (e.x < 0 || e.y < 0 || typeof s.cols == "number" && e.x + e.w > s.cols) return "bounds";
  if (typeof s.maxRows == "number" && Number.isFinite(s.maxRows) && e.y + e.h > s.maxRows)
    return "maxRows";
  if (s.allowOverlap !== !0 && s.layout) {
    const d = { ...t, ...e };
    if (s.layout.find((y) => y.i !== t.i && xi(y, d))) return "collision";
  }
  return null;
}, Er = (e, t, o = {}) => {
  const s = {
    x: t.x,
    y: t.y,
    w: t.w,
    h: t.h
  };
  if (o.snap === !1)
    return {
      status: "disabled",
      geometry: s,
      guideIds: [],
      previousGuideId: o.previousGuideId,
      diagnostics: ho(e.diagnostics, "grid-editor.snap.disabled")
    };
  const r = e.snapCandidates.filter((d) => d.snapped || !!d.blocked).sort(
    (d, c) => d.priority - c.priority || c.proximity - d.proximity || d.distance - c.distance || (d.blocked === c.blocked ? 0 : d.blocked ? 1 : -1) || d.id.localeCompare(c.id)
  );
  if (r.length === 0)
    return {
      status: "none",
      geometry: s,
      guideIds: [],
      previousGuideId: o.previousGuideId,
      diagnostics: e.diagnostics
    };
  const n = [];
  for (let d = 0; d < r.length; d++) {
    const c = r[d], y = Pr(c.geometry, t, c, o);
    if (y) {
      n.push({ candidate: c, reason: y });
      continue;
    }
    return {
      status: "snapped",
      candidate: c,
      geometry: c.geometry,
      guideIds: c.guideIds,
      previousGuideId: o.previousGuideId,
      nextGuideId: c.guideIds[0],
      snapKind: c.kind,
      diagnostics: ho(e.diagnostics, "grid-editor.snap.selected")
    };
  }
  const i = n[0], f = (i == null ? void 0 : i.reason) || "invalid-input";
  return {
    status: "blocked",
    candidate: i == null ? void 0 : i.candidate,
    geometry: s,
    guideIds: [],
    previousGuideId: o.previousGuideId,
    blocked: {
      reason: f,
      itemIds: [t.i],
      message: `Snap candidate blocked by ${f}.`
    },
    diagnostics: ho(
      e.diagnostics,
      Rr(f),
      f === "bounds" || f === "collision" || f === "maxRows" ? f : void 0
    )
  };
}, Ge = (e = [], t = "api") => {
  const o = Array.from(new Set(e.filter(Boolean)));
  return {
    selectedIds: o,
    activeId: o.length > 0 ? o[o.length - 1] : null,
    anchorId: o.length > 0 ? o[0] : null,
    mode: o.length > 1 ? "multiple" : "single",
    source: t
  };
}, Br = (e) => {
  const t = Array.from(new Set(e.selectedIds.filter(Boolean))), o = e.activeId && t.includes(e.activeId) ? e.activeId : t[t.length - 1] || null, s = e.anchorId && t.includes(e.anchorId) ? e.anchorId : t[0] || null;
  return {
    ...e,
    selectedIds: t,
    activeId: o,
    anchorId: s,
    mode: t.length > 1 ? "multiple" : "single"
  };
}, $r = (e) => e.map((t) => t.i), Gr = (e, t) => Qt(e, t[e.i]).editable, Ar = (e, t, o, s) => {
  if (e.length <= 1) return e;
  const r = e.filter((i) => {
    const f = o.get(i);
    return f ? Gr(f, s) : !1;
  });
  if (r.length > 0) return r;
  const n = t && e.includes(t) ? t : e[e.length - 1];
  return n ? [n] : [];
}, Ze = (e, t, o = {}, s = e.source) => {
  const r = t.filter((f) => {
    var d;
    return ((d = o[f.i]) == null ? void 0 : d.visible) !== !1;
  }), n = new Map(r.map((f) => [f.i, f])), i = Ar(
    e.selectedIds.filter((f) => n.has(f)),
    e.activeId,
    n,
    o
  );
  return Br({
    ...e,
    selectedIds: i,
    source: s
  });
}, zr = (e, t, o = "api") => Ge(t, o), Mo = (e = "api") => Ge([], e), ws = (e, t, o) => {
  const s = o.source || "api";
  if (o.ids) return zr(t, o.ids, s);
  if (!o.id) return Mo(s);
  const r = $r(e);
  if (!r.includes(o.id)) return t;
  if (o.range && t.anchorId) {
    const n = r.indexOf(t.anchorId), i = r.indexOf(o.id);
    if (n >= 0 && i >= 0) {
      const f = Math.min(n, i), d = Math.max(n, i);
      return Ge(r.slice(f, d + 1), s);
    }
  }
  if (o.toggle) {
    const n = new Set(t.selectedIds);
    return n.has(o.id) ? n.delete(o.id) : n.add(o.id), Ge(Array.from(n), s);
  }
  return Ge([o.id], s);
}, ks = (e, t, o = {}) => {
  const s = new Set(t), r = e.filter((n) => {
    var i;
    return !s.has(n.i) && ((i = o[n.i]) == null ? void 0 : i.visible) !== !1;
  });
  return r.length > 0 ? r[0].i : null;
}, Vn = (e, t, o, s) => {
  const r = s || Ri(e, t), n = new Set(o.selectedIds);
  return e.map((i) => {
    var c;
    const f = r[i.i], d = ["select", "copy"];
    return f != null && f.draggable && d.push("move"), f != null && f.resizable && d.push("resize"), f != null && f.deletable && d.push("delete"), f != null && f.duplicatable && d.push("duplicate"), f != null && f.locked ? d.push("unlock") : d.push("lock"), (f == null ? void 0 : f.visible) === !1 ? d.push("show") : d.push("hide"), {
      id: i.i,
      label: ((c = t[i.i]) == null ? void 0 : c.label) || i.i,
      position: { x: i.x, y: i.y, w: i.w, h: i.h },
      locked: !!(f != null && f.locked),
      selected: n.has(i.i),
      commands: d
    };
  });
}, Tr = 100, Dr = 650, pt = (e) => e.kind === "layout" ? {
  ...e,
  layout: le(e.layout),
  editorMetaById: { ...e.editorMetaById },
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
} : {
  ...e,
  layouts: oo(e.layouts),
  editorMetaById: { ...e.editorMetaById },
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
}, Or = (e = {}) => {
  const t = Math.max(1, Math.floor(e.maxSize || Tr)), o = e.mergeWindowMs || Dr, s = Re(!1), r = Re(!1);
  let n = [], i = [];
  const f = () => {
    s.value = n.length > 0, r.value = i.length > 0;
  }, d = () => {
    const l = n.length - t;
    l > 0 && (n = n.slice(l));
  }, c = (l, p) => {
    if (!l || !l.mergeKey || l.mergeKey !== p.mergeKey) return !1;
    const m = Date.parse(l.createdAt), v = Date.parse(p.createdAt);
    return Number.isFinite(m) && Number.isFinite(v) && v - m <= o;
  }, y = (l, p = {}) => {
    if (Ke(l.before, l.after)) return;
    const m = {
      ...l,
      before: pt(l.before),
      after: pt(l.after)
    }, v = n[n.length - 1];
    c(v, m) ? n[n.length - 1] = {
      ...v,
      after: pt(m.after),
      createdAt: m.createdAt
    } : n.push(m), p.preserveRedoStack || (i = []), d(), f();
  };
  return {
    canUndo: s,
    canRedo: r,
    push(l, p = {}) {
      y(l, p);
    },
    undo() {
      const l = n.pop();
      return l ? (i.unshift(l), f(), l) : null;
    },
    redo() {
      const l = i.shift();
      return l ? (n.push(l), d(), f(), l) : null;
    },
    replacePresent(l, p = {}) {
      p.preserveRedoStack || (i = []), f();
    },
    clear() {
      n = [], i = [], f();
    },
    mark(l, p) {
      return {
        id: `editor-history-mark:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        snapshot: pt(l),
        revision: p
      };
    },
    bailToMark(l) {
      return f(), pt(l.snapshot);
    },
    squashToMark(l, p, m = {}) {
      const v = {
        ...p,
        before: pt(l.snapshot),
        after: pt(p.after)
      };
      y(v, m);
    }
  };
}, Lr = (e) => ({
  id: e.id || `editor-history:${Date.now()}:${Math.random().toString(36).slice(2)}`,
  commandId: e.commandId,
  commandType: e.commandType,
  before: e.before,
  after: e.after,
  createdAt: e.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
  mergeKey: e.mergeKey,
  source: e.source,
  origin: e.origin,
  targetIds: e.targetIds,
  affectedIds: e.affectedIds,
  historyMode: e.historyMode
});
class at extends Error {
  constructor(t, o, s) {
    super(o), this.name = "GridEditorClipboardError", this.code = t, this.cause = s;
  }
}
const Lt = (e) => typeof e == "number" && Number.isFinite(e), So = (e) => Lt(e) && e > 0 ? Math.floor(e) : void 0, go = (e) => typeof e == "string" && e.length > 0 ? e : void 0, Co = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Xs = (e) => e.reduce((t, o) => (t[o.i] = Co(o), t), {}), Ao = (e) => {
  if (!e || typeof e != "object") return;
  const t = e, o = {}, s = So(t.cols);
  s && (o.cols = s);
  const r = go(t.breakpoint);
  r && (o.breakpoint = r);
  const n = go(t.layoutId);
  n && (o.layoutId = n);
  const i = go(t.viewFormat);
  return i && (o.viewFormat = i), Object.keys(o).length > 0 ? o : void 0;
}, zo = (e, t) => {
  const o = Xs(t);
  if (!e || typeof e != "object") return o;
  const s = {};
  return Object.keys(e).forEach((r) => {
    const n = e[r];
    if (!n || typeof n != "object") return;
    const i = n;
    !Lt(i.x) || !Lt(i.y) || !Lt(i.w) || !Lt(i.h) || (s[r] = {
      x: i.x,
      y: i.y,
      w: i.w,
      h: i.h
    });
  }), {
    ...o,
    ...s
  };
}, Ys = (e, t) => zo(e, t), Ro = (e) => {
  const t = le(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt,
    items: t,
    editorMetaById: Me(e.editorMetaById)
  };
  return e.version === 2 ? {
    version: 2,
    ...o,
    source: Ao(e.source),
    originalGeometryById: Ys(e.originalGeometryById, t)
  } : {
    version: 1,
    ...o
  };
};
let qt = null;
const mt = {
  read() {
    return qt ? Ro(qt) : null;
  },
  write(e) {
    qt = Ro(e);
  },
  clear() {
    qt = null;
  }
}, Ms = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = e.name;
  return t === "NotAllowedError" || t === "SecurityError";
}, Fr = (e) => {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.version !== 1 && t.version !== 2 || typeof t.sourceId != "string" || typeof t.copiedAt != "string" || !Array.isArray(t.items)) return null;
  const o = le(t.items), s = Me(t.editorMetaById);
  return t.version === 2 ? {
    version: 2,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s,
    source: Ao(t.source),
    originalGeometryById: zo(t.originalGeometryById, o)
  } : {
    version: 1,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s
  };
}, Hr = () => ({
  async read() {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.readText != "function")
      throw new at(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      const e = await navigator.clipboard.readText();
      if (!e) return null;
      const t = JSON.parse(e), o = Fr(t);
      if (!o)
        throw new at(
          "clipboard-invalid",
          "Clipboard does not contain a grid editor payload."
        );
      return o;
    } catch (e) {
      throw e instanceof at ? e : new at(
        Ms(e) ? "clipboard-permission" : "clipboard-invalid",
        "Failed to read grid editor payload from system clipboard.",
        e
      );
    }
  },
  async write(e) {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText != "function")
      throw new at(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      await navigator.clipboard.writeText(JSON.stringify(Ro(e)));
    } catch (t) {
      throw new at(
        Ms(t) ? "clipboard-permission" : "clipboard-unavailable",
        "Failed to write grid editor payload to system clipboard.",
        t
      );
    }
  }
}), Nr = (e) => {
  const t = le(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt || (/* @__PURE__ */ new Date()).toISOString(),
    items: t,
    editorMetaById: Me(e.editorMetaById, {
      layout: e.items
    })
  };
  return e.version === 1 ? {
    version: 1,
    ...o
  } : {
    version: 2,
    ...o,
    source: Ao(e.source),
    originalGeometryById: Ys(e.originalGeometryById, t)
  };
}, vo = (e, t = {}) => {
  var f, d, c, y, l, p;
  const o = So(t.cols), s = "version" in e && e.version === 2 ? So((f = e.source) == null ? void 0 : f.cols) : void 0;
  if (!o || !s || t.scale === !1 || o === s)
    return {
      items: le(e.items),
      scaled: !1,
      sourceCols: s,
      targetCols: o
    };
  const r = o / s, n = "version" in e && e.version === 2 ? zo(e.originalGeometryById, e.items) : Xs(e.items), i = e.items.reduce((m, v) => {
    const C = n[v.i] || Co(v);
    return Math.min(m, C.x);
  }, (p = (l = (c = n[(d = e.items[0]) == null ? void 0 : d.i]) == null ? void 0 : c.x) != null ? l : (y = e.items[0]) == null ? void 0 : y.x) != null ? p : 0);
  return {
    items: e.items.map((m) => {
      const v = n[m.i] || Co(m), C = Math.max(1, Math.min(o, Math.round(v.w * r))), M = Math.max(
        0,
        Math.min(
          Math.max(0, o - C),
          Math.floor((v.x - i) * r)
        )
      );
      return {
        ...m,
        x: M,
        y: Math.max(0, Math.floor(v.y)),
        w: C,
        h: Math.max(1, Math.floor(v.h))
      };
    }),
    scaled: !0,
    sourceCols: s,
    targetCols: o
  };
}, be = (e, t) => ({
  type: e,
  labelKey: t.labelKey || `grid-editor.command.${e}`,
  ...t
}), $e = { mode: "record" }, ht = {
  mode: "ignore",
  preserveRedoStack: !0
}, Vt = (e) => !e.payload || typeof e.payload != "object" ? { ok: !1, message: `${e.type} requires an object payload.` } : { ok: !0 }, _s = [
  be("select", {
    defaultSource: "api",
    defaultHistory: ht,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  be("clearSelection", {
    defaultSource: "api",
    defaultHistory: ht,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  be("move", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Vt
  }),
  be("resize", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Vt
  }),
  be("add", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  be("delete", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  be("duplicate", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  be("copy", {
    defaultSource: "api",
    defaultHistory: ht,
    affects: {},
    mutualExclusionScope: "selection"
  }),
  be("paste", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  be("align", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Vt
  }),
  be("distribute", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Vt
  }),
  be("tidy", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout"
  }),
  be("lock", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  be("unlock", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  be("show", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  be("hide", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  be("save", {
    defaultSource: "toolbar",
    defaultHistory: ht,
    affects: { persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence",
    shortcuts: ["Mod+S"]
  }),
  be("discard", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "replace" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  be("reset", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "clear" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  be("undo", {
    defaultSource: "keyboard",
    defaultHistory: ht,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Z"]
  }),
  be("redo", {
    defaultSource: "keyboard",
    defaultHistory: ht,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Shift+Z"]
  }),
  be("section-row-collapse", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  be("section-row-expand", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  be("section-row-move", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  be("section-row-delete", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  be("section-row-reorder", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  })
], jr = new Map(
  _s.map((e) => [e.type, e])
), Us = (e) => jr.get(e), Zn = () => _s.slice(), so = (e) => {
  const t = Us(e);
  return t || be(e, {
    defaultSource: "api",
    defaultHistory: ht,
    affects: {},
    mutualExclusionScope: "global"
  });
}, Kr = (e) => {
  const t = /* @__PURE__ */ new Map(), o = e.now || (() => {
    const n = typeof performance != "undefined" ? performance : null;
    return n && typeof n.now == "function" ? n.now() : Date.now();
  });
  return {
    execute: async (n) => {
      var D, x, P, A, R, O, S, E, W;
      const i = so(n.type), f = {
        source: i.defaultSource,
        ...n,
        history: n.history || i.defaultHistory
      }, d = Fs(f), c = Ot(
        d.history,
        i.defaultHistory.mode || eo(d.type)
      );
      d.history = c;
      const y = d.source || i.defaultSource || "api";
      d.source = y;
      const l = i.mutualExclusionScope || "global", p = o(), m = t.get(l);
      if (m && !m.signal.aborted) {
        const j = to(d, "command-pending", {
          targetIds: d.targetIds,
          blocked: {
            reason: "command-pending",
            itemIds: d.targetIds,
            message: `Command scope ${l} is waiting for beforeCommand.`
          },
          diagnostics: {
            durationMs: 0,
            pendingScope: l,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, j, p);
      }
      (D = e.onStart) == null || D.call(e, d);
      const v = e.getSnapshot(), C = e.getStateRevision(), M = e.check(d);
      if (!M.ok && M.result)
        return M.result.diagnostics = {
          durationMs: ((x = M.result.diagnostics) == null ? void 0 : x.durationMs) || 0,
          ...M.result.diagnostics,
          stateRevision: C,
          historyMode: c.mode,
          source: y,
          origin: d.origin
        }, e.finalize(d, M.result, p);
      const k = (P = i.validatePayload) == null ? void 0 : P.call(i, d);
      if (k && !k.ok) {
        const j = to(d, "invalid-input", {
          targetIds: M.targetIds,
          blocked: {
            reason: "invalid-input",
            itemIds: M.targetIds,
            message: k.message
          },
          diagnostics: {
            durationMs: 0,
            stateRevision: C,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, j, p);
      }
      const F = ((A = e.buildPreview) == null ? void 0 : A.call(e, d, M, v)) || {
        layoutPatches: [],
        metadataPatches: [],
        affectedIds: [],
        beforeSummary: {},
        afterSummary: {}
      }, X = new AbortController();
      t.set(l, X);
      const z = await Pi(
        e.beforeCommand,
        d,
        e.getGuardContext(d, M, F, X.signal),
        e.guardTimeoutMs
      );
      if (t.delete(l), (R = e.isStopped) != null && R.call(e) || X.signal.aborted) {
        (O = e.cleanupInteraction) == null || O.call(e, "guard-aborted");
        const j = xe(d, "cancelled", {
          targetIds: M.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: M.targetIds,
            message: "Command guard was aborted."
          },
          diagnostics: {
            durationMs: 0,
            guardMs: z.guardMs,
            pendingScope: l,
            stateRevision: e.getStateRevision(),
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, j, p, z.guardMs);
      }
      if (z.result)
        return (S = e.cleanupInteraction) == null || S.call(e, z.result.status), z.result.diagnostics = {
          durationMs: ((E = z.result.diagnostics) == null ? void 0 : E.durationMs) || 0,
          ...z.result.diagnostics,
          pendingScope: l,
          stateRevision: e.getStateRevision(),
          historyMode: c.mode,
          source: y,
          origin: d.origin
        }, e.finalize(d, z.result, p, z.guardMs);
      const ae = e.getStateRevision();
      if (ae !== C) {
        (W = e.cleanupInteraction) == null || W.call(e, "stale-command");
        const j = to(d, "stale-command", {
          targetIds: M.targetIds,
          blocked: {
            reason: "stale-command",
            itemIds: M.targetIds,
            message: "Command state changed while beforeCommand was pending."
          },
          diagnostics: {
            durationMs: 0,
            guardMs: z.guardMs,
            pendingScope: l,
            stateRevision: ae,
            stale: !0,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, j, p, z.guardMs);
      }
      return e.commit({
        command: d,
        check: M,
        before: v,
        preview: F,
        startedAt: p,
        guardMs: z.guardMs
      });
    },
    abortPending: (n = "command-kernel-abort") => {
      t.forEach((i) => i.abort(n)), t.clear();
    }
  };
}, St = (e, t, o, s) => ({
  id: e,
  type: t,
  status: o,
  targetIds: [],
  layoutPatches: [],
  metadataPatches: [],
  affectedIds: [],
  blocked: o === "error" || o === "blocked" ? {
    reason: "persistence-error",
    message: (s == null ? void 0 : s.message) || "Persistence command failed."
  } : void 0,
  error: s ? { message: s.message, cause: s } : void 0,
  diagnostics: { durationMs: 0 }
}), no = (e, t, o = (/* @__PURE__ */ new Date()).toISOString()) => {
  const s = typeof t == "string" ? void 0 : t, r = typeof t == "string" ? t : o, n = s ? Le(s) : null;
  return {
    version: s ? 2 : 1,
    editorMetaById: Me(e),
    sectionRows: n ? {
      version: 1,
      items: n.items,
      itemMembership: n.itemMembership
    } : void 0,
    updatedAt: r
  };
}, io = (e) => {
  var n, i;
  const t = (n = e == null ? void 0 : e.meta) == null ? void 0 : n.editor;
  if (t == null)
    return {
      ok: !0,
      envelope: no({})
    };
  if (!t || typeof t != "object")
    return { ok: !1, error: "meta.editor must be an object." };
  const o = t;
  if (o.version !== 1 && o.version !== 2)
    return {
      ok: !0,
      envelope: no({})
    };
  const s = Ei(o.editorMetaById);
  if (!s.ok)
    return {
      ok: !1,
      error: ((i = s.errors[0]) == null ? void 0 : i.message) || "Invalid editor metadata."
    };
  const r = o.version === 2 && o.sectionRows ? Le(
    o.sectionRows,
    (e == null ? void 0 : e.kind) === "layout" ? e.data.layout : []
  ) : null;
  return {
    ok: !0,
    envelope: {
      version: o.version === 2 ? 2 : 1,
      editorMetaById: s.value,
      sectionRows: r ? {
        version: 1,
        items: r.items,
        itemMembership: r.itemMembership
      } : js(),
      updatedAt: typeof o.updatedAt == "string" ? o.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, Xr = (e) => {
  const t = () => ({ ...(typeof e.baseMeta == "function" ? e.baseMeta() : e.baseMeta) || {} }), o = (s, r) => {
    var i, f, d;
    const n = io(s);
    if (!n.ok || !n.envelope) {
      (i = e.onError) == null || i.call(
        e,
        "editor-metadata-invalid",
        n.error || "Invalid editor persistence metadata.",
        s
      );
      return;
    }
    (f = e.setEditorMetaById) == null || f.call(e, n.envelope.editorMetaById, r), n.envelope.sectionRows && ((d = e.setSectionRows) == null || d.call(
      e,
      Le(
        n.envelope.sectionRows,
        s.kind === "layout" ? s.data.layout : []
      ),
      r
    ));
  };
  return {
    meta() {
      var s;
      return {
        ...t(),
        editor: no(
          e.getEditorMetaById(),
          (s = e.getSectionRows) == null ? void 0 : s.call(e)
        )
      };
    },
    onPersistenceEvent(s) {
      var r, n, i, f, d, c, y;
      if ((s.type === "load-success" || s.type === "external-apply") && o(s.document, s.type), s.type === "save-success" && o(s.document, "save-success"), s.type === "conflict") {
        const l = io(s.conflict.localDocument), p = io(s.conflict.externalDocument);
        (i = e.onConflict) == null || i.call(e, {
          key: s.key,
          reason: s.conflict.reason,
          localValue: s.conflict.localValue,
          externalValue: s.conflict.externalValue,
          localEditorMetaById: (r = l.envelope) == null ? void 0 : r.editorMetaById,
          externalEditorMetaById: (n = p.envelope) == null ? void 0 : n.editorMetaById,
          localDocument: s.conflict.localDocument,
          externalDocument: s.conflict.externalDocument,
          resolveActions: ["useLocal", "useRemote"]
        });
      }
      s.type === "save-start" && ((f = e.onSaveStateChange) == null || f.call(e, { status: "saving", dirty: !0 })), s.type === "save-success" && ((d = e.onSaveStateChange) == null || d.call(e, { status: "ready", dirty: !1 })), (s.type === "save-error" || s.type === "error") && ((c = e.onSaveStateChange) == null || c.call(e, {
        status: "error",
        dirty: !0,
        error: s.error
      })), (s.type === "discard" || s.type === "reset") && ((y = e.onSaveStateChange) == null || y.call(e, { status: "ready", dirty: !1 }));
    },
    async save() {
      if (!e.persistence)
        return St("editor-save", "save", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: !0
        });
      const s = await e.persistence.save();
      return St("editor-save", "save", s.ok ? "changed" : "error", s.error);
    },
    discard() {
      return e.persistence ? (e.persistence.discard(), St("editor-discard", "discard", "changed")) : St("editor-discard", "discard", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    },
    reset() {
      return e.persistence ? (e.persistence.reset(), St("editor-reset", "reset", "changed")) : St("editor-reset", "reset", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    }
  };
}, lo = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Ht = (e) => typeof e == "number" && Number.isFinite(e), Ws = (e) => e === "left" || e === "center-x" || e === "right" ? "x" : "y", Yr = (e) => e === "horizontal" || e === "spacing-x" ? "x" : "y", ao = (e) => le(e), _r = (e) => Array.from(new Set(e.flatMap((t) => t.type === "add" ? [t.item.i] : t.type === "compact" ? t.affectedIds : [t.id]))), qs = (e, t) => {
  var s, r;
  const o = (s = t.targetIds) != null && s.length ? t.targetIds : (r = t.selectedIds) != null && r.length ? t.selectedIds : e.map((n) => n.i);
  return Array.from(new Set(o.filter(Boolean)));
}, vt = (e, t, o, s, r, n, i) => ({
  status: "blocked",
  layout: ao(t),
  layoutPatches: [],
  affectedIds: [],
  skippedIds: i,
  blocked: {
    reason: o,
    itemIds: s,
    message: r,
    skippedIds: i
  },
  diagnostics: {
    durationMs: lo() - e,
    computed: n,
    messages: [{
      code: `grid-editor.geometry.${o}`,
      level: o === "invalid-input" ? "error" : "warning",
      message: r,
      itemIds: s,
      recoverable: !0
    }]
  }
}), Vs = (e, t) => {
  const o = [], s = [];
  return t.forEach((r) => {
    const n = Pe(e, r);
    n ? o.push(n) : s.push(r);
  }), { items: o, missingIds: s };
}, Po = (e, t, o) => {
  const s = Ht(o.cols) ? o.cols : 12, r = Ht(o.maxRows) ? o.maxRows : 1 / 0;
  for (let n = 0; n < t.length; n++) {
    const i = Pe(e, t[n]);
    if (i) {
      if (i.x < 0 || i.y < 0 || i.x + i.w > s)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(r) && i.y + i.h > r)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (o.allowOverlap !== !0) {
        const f = Pt(e, i).filter((d) => d.i !== i.i);
        if (f.length > 0)
          return {
            ok: !1,
            reason: "collision",
            itemIds: [i.i, ...f.map((d) => d.i)]
          };
      }
    }
  }
  return { ok: !0 };
}, Ur = (e, t) => t === "right" ? e.x + e.w : t === "center-x" ? e.x + e.w / 2 : t === "bottom" ? e.y + e.h : t === "center-y" ? e.y + e.h / 2 : t === "top" ? e.y : e.x, Ss = (e) => {
  const t = Math.min(...e.map((n) => n.x)), o = Math.max(...e.map((n) => n.x + n.w)), s = Math.min(...e.map((n) => n.y)), r = Math.max(...e.map((n) => n.y + n.h));
  return {
    left: t,
    right: o,
    top: s,
    bottom: r,
    centerX: t + (o - t) / 2,
    centerY: s + (r - s) / 2
  };
}, Wr = (e, t, o, s) => {
  var f;
  const r = t.mode, n = t.target || { type: "selection-bounds" };
  if (n.type === "explicit-line" && n.axis === Ws(r))
    return { position: n.position, source: "explicit" };
  if (n.type === "active-item" || n.type === "last-selected") {
    const d = s.selectedIds || s.targetIds || o.map((l) => l.i), c = n.type === "active-item" ? n.id || s.activeId || d[0] : d[d.length - 1], y = o.find((l) => l.i === c) || o[0];
    return { position: Ur(y, r), source: n.type };
  }
  if (n.type === "section-row") {
    const c = (f = Le(s.sectionRows, e).items[n.id]) == null ? void 0 : f.bounds, y = n.bounds || c;
    if (y) {
      const p = {
        left: y.x,
        right: y.x + y.w,
        top: y.y,
        bottom: y.y + y.h,
        centerX: y.x + y.w / 2,
        centerY: y.y + y.h / 2
      };
      return r === "right" ? { position: p.right, source: "section-row" } : r === "center-x" ? { position: p.centerX, source: "section-row" } : r === "bottom" ? { position: p.bottom, source: "section-row" } : r === "center-y" ? { position: p.centerY, source: "section-row" } : r === "top" ? { position: p.top, source: "section-row" } : { position: p.left, source: "section-row" };
    }
    const l = Ss(o);
    return r === "right" ? { position: l.right, source: "section-row" } : r === "center-x" ? { position: l.centerX, source: "section-row" } : r === "bottom" ? { position: l.bottom, source: "section-row" } : r === "center-y" ? { position: l.centerY, source: "section-row" } : r === "top" ? { position: l.top, source: "section-row" } : { position: l.left, source: "section-row" };
  }
  const i = Ss(o);
  return r === "right" ? { position: i.right, source: "selection" } : r === "center-x" ? { position: i.centerX, source: "selection" } : r === "bottom" ? { position: i.bottom, source: "selection" } : r === "center-y" ? { position: i.centerY, source: "selection" } : r === "top" ? { position: i.top, source: "selection" } : { position: i.left, source: "selection" };
}, qr = (e, t, o) => t === "right" ? { ...e, x: Math.round(o - e.w) } : t === "center-x" ? { ...e, x: Math.round(o - e.w / 2) } : t === "top" ? { ...e, y: Math.round(o) } : t === "bottom" ? { ...e, y: Math.round(o - e.h) } : t === "center-y" ? { ...e, y: Math.round(o - e.h / 2) } : { ...e, x: Math.round(o) }, Zs = (e, t) => e.slice().sort(
  (o, s) => t === "x" ? o.x - s.x || o.i.localeCompare(s.i) : o.y - s.y || o.i.localeCompare(s.i)
), Vr = (e, t, o) => {
  const s = [];
  for (let r = 1; r < e.length; r++) {
    const n = e[r - 1], i = e[r];
    s.push(o === "center-to-center" ? t === "x" ? i.x + i.w / 2 - (n.x + n.w / 2) : i.y + i.h / 2 - (n.y + n.h / 2) : t === "x" ? i.x - (n.x + n.w) : i.y - (n.y + n.h));
  }
  return s;
}, Zr = (e) => e.length === 0 ? 0 : e.reduce((t, o) => t + o, 0) / e.length, Jr = (e, t, o, s) => {
  const r = Math.max(0, e.findIndex((y) => y.i === s)), n = e[r], i = Math.max(0, Zr(Vr(e, t, o))), f = /* @__PURE__ */ new Map([[n.i, n]]);
  if (o === "center-to-center") {
    const y = t === "x" ? n.x + n.w / 2 : n.y + n.h / 2;
    for (let l = r - 1; l >= 0; l--) {
      const p = e[l], m = y - i * (r - l);
      f.set(p.i, t === "x" ? { ...p, x: Math.round(m - p.w / 2) } : { ...p, y: Math.round(m - p.h / 2) });
    }
    for (let l = r + 1; l < e.length; l++) {
      const p = e[l], m = y + i * (l - r);
      f.set(p.i, t === "x" ? { ...p, x: Math.round(m - p.w / 2) } : { ...p, y: Math.round(m - p.h / 2) });
    }
    return { items: e.map((l) => f.get(l.i) || l), spacing: i };
  }
  let d = t === "x" ? n.x : n.y;
  for (let y = r - 1; y >= 0; y--) {
    const l = e[y], p = t === "x" ? l.w : l.h, m = d - i - p;
    f.set(l.i, t === "x" ? { ...l, x: Math.round(m) } : { ...l, y: Math.round(m) }), d = m;
  }
  let c = t === "x" ? n.x + n.w : n.y + n.h;
  for (let y = r + 1; y < e.length; y++) {
    const l = e[y];
    f.set(l.i, t === "x" ? { ...l, x: Math.round(c + i) } : { ...l, y: Math.round(c + i) }), c = c + i + (t === "x" ? l.w : l.h);
  }
  return { items: e.map((y) => f.get(y.i) || y), spacing: i };
}, Qr = (e, t, o, s) => {
  const r = Yr(o.mode), n = o.strategy || "edge-to-edge", i = Zs(t, r);
  if (i.length < 3) return null;
  const f = Le(s.sectionRows, e), d = i.reduce((F, X) => {
    const z = f.itemMembership[X.i] || {};
    return F === null ? { ...z } : {
      sectionId: F.sectionId && F.sectionId === z.sectionId ? F.sectionId : void 0,
      rowId: F.rowId && F.rowId === z.rowId ? F.rowId : void 0
    };
  }, null), c = o.sectionRowId || (o.bounds === "section-row" ? (d == null ? void 0 : d.rowId) || (d == null ? void 0 : d.sectionId) : void 0), y = c ? f.items[c] : void 0;
  if (o.bounds === "active-item") {
    const F = Jr(i, r, n, s.activeId);
    return {
      axis: r,
      spacing: F.spacing,
      sectionId: d == null ? void 0 : d.sectionId,
      rowId: d == null ? void 0 : d.rowId,
      items: F.items
    };
  }
  const l = y != null && y.bounds ? r === "x" ? { start: y.bounds.x, end: y.bounds.x + y.bounds.w } : { start: y.bounds.y, end: y.bounds.y + y.bounds.h } : null, p = o.bounds === "explicit" && o.explicitBounds ? o.explicitBounds : null, m = p ? p.start : l ? l.start : r === "x" ? i[0].x : i[0].y, v = p ? p.end : l ? l.end : r === "x" ? i[i.length - 1].x + i[i.length - 1].w : i[i.length - 1].y + i[i.length - 1].h;
  if (n === "center-to-center") {
    const F = !!(p || l), X = F ? m + (r === "x" ? i[0].w : i[0].h) / 2 : r === "x" ? i[0].x + i[0].w / 2 : i[0].y + i[0].h / 2, ae = ((F ? v - (r === "x" ? i[i.length - 1].w : i[i.length - 1].h) / 2 : r === "x" ? i[i.length - 1].x + i[i.length - 1].w / 2 : i[i.length - 1].y + i[i.length - 1].h / 2) - X) / (i.length - 1);
    return {
      axis: r,
      spacing: ae,
      sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
      rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
      items: i.map((D, x) => {
        if (x === 0 || x === i.length - 1) return D;
        const P = X + ae * x;
        return r === "x" ? { ...D, x: Math.round(P - D.w / 2) } : { ...D, y: Math.round(P - D.h / 2) };
      })
    };
  }
  const C = i.reduce(
    (F, X) => F + (r === "x" ? X.w : X.h),
    0
  ), M = (v - m - C) / (i.length - 1);
  if (!Number.isFinite(M) || M < 0) return null;
  let k = m;
  return {
    axis: r,
    spacing: M,
    sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
    rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
    items: i.map((F) => {
      const X = r === "x" ? { ...F, x: Math.round(k) } : { ...F, y: Math.round(k) };
      return k += (r === "x" ? F.w : F.h) + M, X;
    })
  };
}, en = (e, t, o, s) => {
  const r = o === "x" ? "y" : "x", n = Le(s.sectionRows, e), i = (c) => {
    const y = n.itemMembership[c.i] || {};
    return `${y.sectionId || ""}:${y.rowId || ""}`;
  }, f = t.slice().sort(
    (c, y) => r === "y" ? c.y - y.y || c.x - y.x || c.i.localeCompare(y.i) : c.x - y.x || c.y - y.y || c.i.localeCompare(y.i)
  ), d = [];
  return f.forEach((c) => {
    const y = r === "y" ? c.y : c.x, l = y + (r === "y" ? c.h : c.w), p = d.find((m) => m.some((v) => {
      if (i(v) !== i(c)) return !1;
      const C = r === "y" ? v.y : v.x, M = C + (r === "y" ? v.h : v.w);
      return Math.min(l, M) > Math.max(y, C);
    }));
    p ? p.push(c) : d.push([c]);
  }), d;
}, Cs = (e, t, o, s) => {
  const r = Ht(o.minSpacing) ? Math.max(0, o.minSpacing) : 1, n = o.axis === "both" ? ["x", "y"] : [o.axis === "y" ? "y" : "x"];
  let i = t.slice();
  return n.forEach((f) => {
    const d = en(e, i, f, s), c = /* @__PURE__ */ new Map();
    d.forEach((y) => {
      const l = Zs(y, f);
      if (l.length < 2) {
        l.forEach((m) => c.set(m.i, m));
        return;
      }
      let p = f === "x" ? l[0].x : l[0].y;
      l.forEach((m, v) => {
        if (v === 0) {
          c.set(m.i, m), p += (f === "x" ? m.w : m.h) + r;
          return;
        }
        const C = f === "x" ? { ...m, x: Math.round(p) } : { ...m, y: Math.round(p) };
        c.set(m.i, C), p += (f === "x" ? m.w : m.h) + r;
      });
    }), i = i.map((y) => c.get(y.i) || y);
  }), {
    axis: n[n.length - 1],
    spacing: r,
    items: i
  };
}, Js = (e, t, o) => Go({
  layout: e,
  activeItem: t.find((s) => s.i === o.activeId) || t[0],
  candidateItem: t.find((s) => s.i === o.activeId) || t[0],
  selectionIds: t.map((s) => s.i),
  metaById: o.metaById,
  sectionRows: o.sectionRows,
  cols: Ht(o.cols) ? o.cols : 12,
  maxRows: o.maxRows,
  compactType: o.compactType,
  allowOverlap: o.allowOverlap,
  preventCollision: o.preventCollision,
  interaction: "toolbar",
  options: {
    cols: Ht(o.cols) ? o.cols : 12,
    maxRows: o.maxRows,
    allowCrossSectionRow: !1
  }
}), Qs = (e, t, o, s, r) => {
  const n = Ft(t, o), i = _r(n);
  return {
    status: i.length > 0 ? "changed" : "noop",
    layout: o,
    layoutPatches: n,
    affectedIds: i,
    skippedIds: r,
    diagnostics: {
      ...s,
      durationMs: lo() - e
    }
  };
}, Rs = (e, t, o = {}) => {
  const s = lo(), r = qs(e, o), { items: n, missingIds: i } = Vs(e, r);
  if (i.length > 0)
    return vt(s, e, "missing-item", i, "Align command referenced missing layout items.", void 0, o.skippedIds);
  if (n.length < 2)
    return vt(s, e, "selection-count", r, "Align requires at least 2 items.", void 0, o.skippedIds);
  const f = Wr(e, t, n, o), d = ao(e).map(
    (p) => r.includes(p.i) ? qr(p, t.mode, f.position) : p
  ), c = Po(d, r, o), y = Js(e, n, o), l = {
    targetLine: {
      axis: Ws(t.mode),
      position: f.position,
      mode: t.mode
    },
    affectedIds: r,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      source: f.source === "section-row" ? "metadata" : "none"
    }
  };
  return c.ok ? Qs(s, e, d, {
    durationMs: 0,
    intelligence: y.diagnostics,
    computed: l
  }, o.skippedIds) : vt(
    s,
    e,
    c.reason,
    c.itemIds,
    `Align command blocked by ${c.reason}.`,
    l,
    o.skippedIds
  );
}, ei = (e, t, o, s) => {
  const r = lo(), n = qs(e, o), { items: i, missingIds: f } = Vs(e, n);
  if (f.length > 0)
    return vt(r, e, "missing-item", f, `${s} command referenced missing layout items.`, void 0, o.skippedIds);
  if (i.length < 3)
    return vt(r, e, "selection-count", n, `${s} requires at least 3 items.`, void 0, o.skippedIds);
  let d = s === "distribute" ? Qr(e, i, t, o) : Cs(e, i, t, o);
  const c = Js(e, i, o);
  if (!d)
    return vt(r, e, "invalid-input", n, "Spacing command could not compute a valid spacing result.", {
      affectedIds: n,
      skippedIds: o.skippedIds
    }, o.skippedIds);
  let y = !1, l = new Map(d.items.map((k) => [k.i, k])), p = ao(e).map((k) => l.get(k.i) || k), m = Po(p, n, o);
  if (!m.ok) {
    const k = Cs(e, i, {
      axis: d.axis,
      minSpacing: 0,
      strategy: t.strategy
    }, o);
    k && (y = !0, d = k, l = new Map(d.items.map((F) => [F.i, F])), p = ao(e).map((F) => l.get(F.i) || F), m = Po(p, n, o));
  }
  const v = t, C = t, M = {
    targetSpacing: {
      axis: d.axis,
      value: d.spacing,
      mode: s === "distribute" ? v.mode : d.axis === "x" ? "spacing-x" : "spacing-y",
      strategy: s === "distribute" ? v.strategy || "edge-to-edge" : C.strategy || "edge-to-edge"
    },
    affectedIds: n,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      sectionId: d.sectionId,
      rowId: d.rowId,
      source: d.sectionId || d.rowId ? "metadata" : "none"
    },
    fallback: y ? "tidy-min-spacing" : void 0
  };
  return m.ok ? Qs(r, e, p, {
    durationMs: 0,
    intelligence: c.diagnostics,
    computed: M
  }, o.skippedIds) : vt(
    r,
    e,
    m.reason,
    m.itemIds,
    `Spacing command blocked by ${m.reason}.`,
    M,
    o.skippedIds
  );
}, Ps = (e, t, o = {}) => ei(e, t, o, "distribute"), Es = (e, t, o = {}) => ei(e, t, o, "tidy"), Te = (e) => typeof e == "number" && Number.isFinite(e), tn = (e) => Te(e) && e > 0 ? Math.floor(e) : 12, on = (e) => Te(e) && e > 0 ? Math.floor(e) : 1 / 0, sn = (e) => e === "vertical" || e === "horizontal" || e === null ? e : "vertical", rn = (e) => e === "layout" ? "layout" : "block", Bs = (e) => e === !0, tt = (e) => ({
  id: e.i,
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), To = (e) => ({
  ...e,
  x: Te(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: Te(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: Te(e.w) ? Math.floor(e.w) : 1,
  h: Te(e.h) ? Math.floor(e.h) : 1
}), Xe = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), Nt = (e, t, o, s, r = {}) => {
  for (const n of t) {
    const i = e.find((f) => f.i === n);
    if (i) {
      if (i.w <= 0 || i.h <= 0 || i.x < 0 || i.y < 0 || i.x + i.w > o)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(s) && i.y + i.h > s)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (!r.allowOverlap) {
        const f = Pt(e, i).filter((d) => d.i !== i.i);
        if (f.length > 0)
          return {
            ok: !1,
            reason: "collision",
            itemIds: [i.i, ...f.map((d) => d.i)]
          };
      }
    }
  }
  return { ok: !0 };
}, Do = (e, t, o) => e.w <= 0 || e.h <= 0 || e.w > t ? "bounds" : Number.isFinite(o) && e.h > o ? "maxRows" : null, jt = (e, t, o) => Math.max(t, Math.min(e, o)), ti = (e) => e.reduce((t, o) => Math.max(t, o.y + o.h), 0), nn = (e, t, o, s, r, n) => {
  if (!Te(o) || !Te(s)) return null;
  const i = {
    x: Math.floor(o),
    y: Math.floor(s)
  }, f = jt(i.x, 0, Math.max(0, r - t.w)), d = Math.max(0, i.y), c = Number.isFinite(n) ? Math.floor(n) - t.h : Math.max(ti(e), d);
  if (c < d) return null;
  for (let y = d; y <= c; y++) {
    const l = { ...t, x: f, y };
    if (Nt([...e, l], [l.i], r, n).ok)
      return {
        x: f,
        y,
        target: i,
        clamped: f !== i.x,
        shiftedDown: y !== d
      };
  }
  return null;
}, an = (e) => {
  for (const t of e)
    t.moved && (t.moved = !1);
  return e;
}, $s = (e, t, o) => {
  const s = new Set(o), r = new Map(t.map((n) => [n.i, n]));
  return e.filter((n) => {
    if (s.has(n.i)) return !1;
    const i = r.get(n.i);
    return !!(i && (n.x !== i.x || n.y !== i.y || n.w !== i.w || n.h !== i.h));
  }).map((n) => n.i);
}, cn = (e, t, o, s, r, n, i) => {
  var z, ae;
  const f = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (o !== "cursor" || f !== "top-left") return null;
  const d = sn(s.compactType), c = Bs(s.allowOverlap), y = Bs(s.preventCollision), l = t.map(To), p = l.reduce((D, x) => ({
    x: Math.min(D.x, x.x),
    y: Math.min(D.y, x.y)
  }), { x: ((z = l[0]) == null ? void 0 : z.x) || 0, y: ((ae = l[0]) == null ? void 0 : ae.y) || 0 });
  let m = le(e);
  const v = [], C = [], M = (D, x, P, A) => {
    const R = v.concat(x.filter((O) => l.some((S) => S.i === O)));
    return C.push(Xe(
      D === "collision" || D === "static-item" ? "grid-editor.placement.layout-collision-blocked" : D === "maxRows" ? "grid-editor.placement.layout-max-rows-blocked" : "grid-editor.placement.layout-bounds-blocked",
      "warning",
      P,
      { reason: D, itemIds: x, details: { collisionPolicy: "layout", compactType: d, allowOverlap: c, preventCollision: y } }
    )), {
      layout: A,
      failed: !0,
      blocked: { reason: D, itemIds: x, message: P },
      summary: {
        strategy: o,
        placementSource: o,
        collisionPolicy: "layout",
        insertedIds: R,
        shiftedIds: $s(e, A, R),
        before: e.map(tt),
        after: A.map(tt),
        diagnostics: C
      }
    };
  }, k = Te(i == null ? void 0 : i.x) ? i.x : p.x, F = Te(i == null ? void 0 : i.y) ? i.y : p.y, X = l.map((D) => {
    const x = Math.floor(k + D.x - p.x), P = Math.floor(F + D.y - p.y);
    return {
      ...D,
      x: jt(x, 0, Math.max(0, r - D.w)),
      y: Number.isFinite(n) ? jt(P, 0, Math.max(0, Math.floor(n) - D.h)) : Math.max(0, P)
    };
  });
  if (!c) {
    const D = X.find((x) => Pt(X, x).length > 0);
    if (D)
      return M(
        "collision",
        [D.i, ...Pt(X, D).map((x) => x.i)],
        "Placement group contains overlapping items.",
        e
      );
  }
  for (let D = 0; D < X.length; D++) {
    const x = X[D], P = l[D], A = Do(P, r, n);
    if (A)
      return C.push(Xe(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: A, itemIds: [P.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: A,
          itemIds: [P.i],
          message: "One or more items could not fit in the current layout."
        },
        summary: {
          strategy: o,
          placementSource: o,
          collisionPolicy: "layout",
          insertedIds: v,
          shiftedIds: [],
          before: e.map(tt),
          after: [],
          diagnostics: C
        }
      };
    const R = m.concat(x), O = Nt(
      R,
      [x.i],
      r,
      n,
      { allowOverlap: c }
    ), S = c ? [] : Pt(m, x).filter((ne) => ne.i !== x.i);
    if (!O.ok && O.reason !== "collision")
      return M(
        O.reason,
        O.itemIds,
        "Placement target is outside the current grid constraints.",
        R
      );
    if (!c && S.some((ne) => ne.static)) {
      const ne = S.filter((Ae) => Ae.static).map((Ae) => Ae.i);
      return M(
        "static-item",
        [x.i, ...ne],
        "Placement target is blocked by a static item.",
        R
      );
    }
    if (y && !c && S.length > 0)
      return M(
        "collision",
        [x.i, ...S.map((ne) => ne.i)],
        "Placement target is blocked at the current cursor position.",
        R
      );
    if (c) {
      m = R, v.push(x.i);
      continue;
    }
    const E = Math.max(ti(m), x.y) + x.h + D + 1, W = {
      ...x,
      y: E,
      static: !1
    }, j = m.concat(W), me = j[j.length - 1], Ee = ki(
      j,
      me,
      d,
      r,
      c,
      x.x,
      x.y,
      !0,
      y
    ).map(
      (ne) => ne.i === x.i ? { ...ne, static: x.static === !0 } : ne
    ), ie = d == null ? Ee : Mi(Ee, d, r, c);
    m = an(ie), v.push(x.i);
    const q = Nt(
      m,
      m.map((ne) => ne.i),
      r,
      n,
      { allowOverlap: c }
    );
    if (!q.ok)
      return M(
        q.reason,
        q.itemIds,
        "Placement reflow could not produce a valid layout.",
        m
      );
  }
  return C.push(Xe(
    "grid-editor.placement.layout-collision-policy",
    "info",
    `Placed ${v.length} item${v.length === 1 ? "" : "s"} using existing layout collision rules.`,
    {
      itemIds: v,
      details: { collisionPolicy: "layout", compactType: d, allowOverlap: c, preventCollision: y }
    }
  )), {
    layout: m,
    failed: !1,
    summary: {
      strategy: o,
      placementSource: o,
      collisionPolicy: "layout",
      insertedIds: v,
      shiftedIds: $s(e, m, v),
      before: e.map(tt),
      after: m.map(tt),
      diagnostics: C
    }
  };
}, dn = (e, t, o, s, r, n) => {
  var v, C;
  const i = Te(s.offset) ? s.offset : 1, f = s.cursor && typeof s.cursor == "object" ? s.cursor : null, d = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (rn(s.collisionPolicy) === "layout") {
    const M = cn(e, t, o, s, r, n, f);
    if (M) return M;
  }
  const c = le(e), y = [], l = [], p = t.map(To), m = p.reduce((M, k) => ({
    x: Math.min(M.x, k.x),
    y: Math.min(M.y, k.y)
  }), { x: ((v = p[0]) == null ? void 0 : v.x) || 0, y: ((C = p[0]) == null ? void 0 : C.y) || 0 });
  for (let M = 0; M < p.length; M++) {
    const k = p[M], F = Do(k, r, n);
    if (F)
      return l.push(Xe(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: F, itemIds: [k.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: F,
          itemIds: [k.i],
          message: "One or more items could not fit in the current layout."
        },
        summary: {
          strategy: o,
          placementSource: o,
          insertedIds: y,
          shiftedIds: [],
          before: [],
          after: [],
          diagnostics: l
        }
      };
    let X = k.x, z = k.y;
    const ae = o === "cursor" && d === "top-left" && typeof s.placementSessionId == "string";
    if (o === "offset")
      X += i * (M + 1), z += i * (M + 1);
    else if (ae) {
      const P = Te(f == null ? void 0 : f.x) ? f.x : X, A = Te(f == null ? void 0 : f.y) ? f.y : z, R = k.x - m.x, O = k.y - m.y, S = Math.floor(P + R), E = Math.floor(A + O);
      X = jt(S, 0, Math.max(0, r - k.w)), z = Number.isFinite(n) ? jt(E, 0, Math.max(0, Math.floor(n) - k.h)) : Math.max(0, E), l.push(Xe(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: { x: S, y: E },
            placed: { x: X, y: z },
            clamped: X !== S || z !== E,
            shiftedDown: !1
          }
        }
      ));
    } else if (o === "nearest-fit" || o === "cursor") {
      const P = o === "cursor" && d === "top-left" ? nn(
        c,
        k,
        Te(f == null ? void 0 : f.x) ? f.x : X,
        Te(f == null ? void 0 : f.y) ? f.y : z,
        r,
        n
      ) : null, A = P || wi(
        c,
        k,
        r,
        Te(f == null ? void 0 : f.x) ? f.x : X,
        Te(f == null ? void 0 : f.y) ? f.y : z,
        n
      );
      A && (X = A.x, z = A.y, P && l.push(Xe(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: P.target,
            placed: { x: P.x, y: P.y },
            clamped: P.clamped,
            shiftedDown: P.shiftedDown
          }
        }
      )));
    } else {
      const P = ss(c, k, r, n);
      P && (X = P.x, z = P.y);
    }
    const D = {
      ...k,
      x: Math.max(0, Math.floor(X)),
      y: Math.max(0, Math.floor(z))
    }, x = Nt([...c, D], [D.i], r, n);
    if (!x.ok) {
      if (ae) {
        const A = (x.reason === "maxRows" || Number.isFinite(n), x.reason), R = [...c, D], O = y.concat(D.i);
        return l.push(Xe(
          A === "collision" ? "grid-editor.placement.collision-blocked" : A === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.bounds-blocked",
          "warning",
          "Placement target is blocked at the current cursor position.",
          { reason: A, itemIds: x.itemIds }
        )), {
          layout: R,
          failed: !0,
          blocked: {
            reason: A,
            itemIds: x.itemIds,
            message: "Placement target is blocked at the current cursor position."
          },
          summary: {
            strategy: o,
            placementSource: o,
            insertedIds: O,
            shiftedIds: [],
            before: [],
            after: R.filter((S) => O.includes(S.i)).map(tt),
            diagnostics: l
          }
        };
      }
      const P = ss(c, k, r, n);
      if (!P) {
        const A = x.reason === "maxRows" || Number.isFinite(n) ? "maxRows" : x.reason;
        return l.push(Xe(
          A === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.collision-unresolved",
          "warning",
          "No legal placement was available for the item.",
          { reason: A, itemIds: x.itemIds }
        )), {
          layout: e,
          failed: !0,
          blocked: {
            reason: A,
            itemIds: x.itemIds,
            message: "One or more items could not fit in the current layout."
          },
          summary: {
            strategy: o,
            placementSource: o,
            insertedIds: y,
            shiftedIds: [],
            before: [],
            after: [],
            diagnostics: l
          }
        };
      }
      D.x = P.x, D.y = P.y;
    }
    c.push(D), y.push(D.i);
  }
  return l.push(Xe(
    o === "first-fit" ? "grid-editor.placement.first-fit" : `grid-editor.placement.${o}`,
    "info",
    `Placed ${y.length} item${y.length === 1 ? "" : "s"} using ${o}.`,
    { itemIds: y }
  )), {
    layout: c,
    failed: !1,
    summary: {
      strategy: o,
      placementSource: o,
      insertedIds: y,
      shiftedIds: [],
      before: [],
      after: c.filter((M) => y.includes(M.i)).map(tt),
      diagnostics: l
    }
  };
}, ln = (e, t, o, s) => {
  const r = le(e), n = t.map(To), i = n.map((k) => k.i), f = r.map((k) => k.i), d = r.map(tt), c = [];
  if (n.length === 0)
    return c.push(Xe(
      "grid-editor.placement.invalid-item",
      "error",
      "No items were provided for placement.",
      { reason: "invalid-input" }
    )), {
      layout: e,
      failed: !0,
      blocked: { reason: "invalid-input", message: "No items were provided for placement." },
      summary: {
        strategy: "insert-top-shift",
        placementSource: "insert-top-shift",
        insertedIds: [],
        shiftedIds: [],
        before: [],
        after: [],
        diagnostics: c
      }
    };
  const y = Math.min(...n.map((k) => k.x)), l = Math.min(...n.map((k) => k.y)), p = n.map((k) => ({
    ...k,
    x: k.x - y,
    y: k.y - l
  })), m = Math.max(...p.map((k) => k.y + k.h));
  for (const k of p) {
    const F = Do(k, o, s);
    if (F)
      return c.push(Xe(
        "grid-editor.placement.invalid-item",
        "error",
        "Inserted item cannot fit within the current grid bounds.",
        { reason: F, itemIds: [k.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: F,
          itemIds: [k.i],
          message: "Inserted item cannot fit within the current grid bounds."
        },
        summary: {
          strategy: "insert-top-shift",
          placementSource: "insert-top-shift",
          insertedIds: i,
          shiftedIds: [],
          before: d,
          after: [],
          diagnostics: c
        }
      };
  }
  const v = r.map((k) => ({
    ...k,
    y: k.y + m
  })), C = [...p, ...v], M = Nt(C, C.map((k) => k.i), o, s);
  return M.ok ? (c.push(Xe(
    "grid-editor.placement.insert-top-shift",
    "info",
    f.length > 0 ? `Inserted at the top-left and shifted ${f.length} existing item${f.length === 1 ? "" : "s"}.` : "Inserted at the top-left without shifting existing items.",
    { itemIds: i.concat(f), details: { shiftHeight: m, shiftedCount: f.length } }
  )), {
    layout: C,
    failed: !1,
    summary: {
      strategy: "insert-top-shift",
      placementSource: "insert-top-shift",
      insertedIds: i,
      shiftedIds: f,
      delta: { dx: 0, dy: m },
      before: d,
      after: C.map(tt),
      diagnostics: c
    }
  }) : (c.push(Xe(
    M.reason === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.collision-unresolved",
    "warning",
    "Top insert shift could not produce a valid layout.",
    { reason: M.reason, itemIds: M.itemIds, details: { shiftHeight: m } }
  )), {
    layout: e,
    failed: !0,
    blocked: {
      reason: M.reason,
      itemIds: M.itemIds,
      message: "Top insert shift could not produce a valid layout."
    },
    summary: {
      strategy: "insert-top-shift",
      placementSource: "insert-top-shift",
      insertedIds: i,
      shiftedIds: f,
      before: d,
      after: [],
      diagnostics: c
    }
  });
}, gt = (e, t, o, s = {}) => {
  const r = o === "offset" || o === "cursor" || o === "nearest-fit" || o === "first-fit" || o === "insert-top-shift" ? o : "first-fit", n = tn(s.cols), i = on(s.maxRows);
  return r === "insert-top-shift" ? ln(e, t, n, i) : dn(e, t, r, s, n, i);
};
let un = 0;
const Oo = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, ct = (e) => typeof e == "number" && Number.isFinite(e), oi = (e) => ct(e) && e > 0 ? Math.floor(e) : 12, si = (e) => ct(e) && e > 0 ? Math.floor(e) : 1 / 0, ii = (e, t = "first-fit") => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift" ? e : t, ri = (e, t = "block") => e === "layout" ? "layout" : t, ni = (e, t) => e === "vertical" || e === "horizontal" || e === null ? e : t, co = (e, t) => typeof e == "boolean" ? e : t, ai = (e) => {
  if (!(!e || !ct(e.x) || !ct(e.y)))
    return {
      ...e,
      x: Math.max(0, Math.floor(e.x)),
      y: Math.max(0, Math.floor(e.y))
    };
}, fn = (e, t) => ({
  ...e,
  i: typeof e.i == "string" && e.i.length > 0 ? e.i : `placement-item-${t + 1}`,
  x: ct(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: ct(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: ct(e.w) ? Math.max(1, Math.floor(e.w)) : 1,
  h: ct(e.h) ? Math.max(1, Math.floor(e.h)) : 1
}), yn = (e) => (Array.isArray(e.items) ? e.items : e.item ? [e.item] : []).filter((o) => o && typeof o == "object").map((o, s) => fn(o, s)), Ct = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Lo = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), ci = (e, t, o, s) => {
  const r = t || e, n = new Map(o.before.map((c) => [c.id, c])), i = new Map(o.after.map((c) => [c.id, c])), f = [], d = /* @__PURE__ */ new Set();
  return o.shiftedIds.slice().sort().forEach((c) => {
    const y = n.get(c) || Pe(e, c), l = i.get(c) || Pe(r, c);
    !y || !l || (d.add(c), f.push({
      id: c,
      before: Ct(y),
      after: Ct(l),
      kind: "shift"
    }));
  }), Array.from(i.keys()).sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = n.get(c) || Pe(e, c), l = i.get(c) || Pe(r, c);
    !y || !l || y.x === l.x && y.y === l.y && y.w === l.w && y.h === l.h || (d.add(c), f.push({
      id: c,
      before: Ct(y),
      after: Ct(l),
      kind: "predicted"
    }));
  }), ((s == null ? void 0 : s.reason) === "collision" || (s == null ? void 0 : s.reason) === "bounds" || (s == null ? void 0 : s.reason) === "maxRows") && (s.itemIds || []).slice().sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = Pe(e, c) || Pe(r, c);
    y && (d.add(c), f.push({
      id: c,
      before: Ct(y),
      after: Ct(y),
      kind: "collision"
    }));
  }), f;
}, Jn = (e, t, o, s) => ci(e, t, o, s), Qn = (e = [], t) => {
  const o = e.slice();
  return t && !o.some((s) => s.reason === t.reason) && o.push(Lo(
    `grid-editor.placement.blocked.${t.reason}`,
    "warning",
    t.message || `Placement blocked by ${t.reason}.`,
    { reason: t.reason, itemIds: t.itemIds }
  )), o;
}, ea = (e) => le(e), pn = (e, t, o, s) => {
  const r = new Map(e.items.map((n, i) => [o[i], n.i]));
  return o.map((n) => {
    const i = Pe(t || e.items, n) || Pe(e.items, r.get(n) || n);
    return i ? {
      id: n,
      item: $o(i),
      state: s,
      sourceId: r.get(n)
    } : null;
  }).filter(Boolean);
}, Eo = (e, t = {}, o = {}) => {
  var M, k, F, X, z;
  const s = ai(t.cursor) || e.cursor, r = ii(t.strategy || e.strategy, e.strategy), n = ri(t.collisionPolicy, e.collisionPolicy), i = ni(t.compactType, e.compactType), f = co(t.allowOverlap, e.allowOverlap), d = co(t.preventCollision, e.preventCollision), c = oi((M = t.cols) != null ? M : e.cols), y = si((k = t.maxRows) != null ? k : e.maxRows), l = {
    collisionPolicy: n,
    cursor: s,
    cols: c,
    maxRows: y,
    compactType: i,
    allowOverlap: f,
    preventCollision: d,
    placementSessionId: e.id,
    placementSource: e.source,
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor
  }, p = gt(
    e.baseLayout,
    e.items,
    r,
    l
  ), m = p.failed && p.summary.insertedIds.length === 0 ? void 0 : p.layout, v = p.failed ? {
    reason: ((F = p.blocked) == null ? void 0 : F.reason) || "bounds",
    itemIds: (X = p.blocked) == null ? void 0 : X.itemIds,
    message: ((z = p.blocked) == null ? void 0 : z.message) || "Placement could not produce a valid candidate.",
    recoverable: !0
  } : void 0, C = p.summary.diagnostics.slice();
  return v && C.push(Lo(
    `grid-editor.placement.blocked.${v.reason}`,
    "warning",
    v.message || `Placement blocked by ${v.reason}.`,
    { reason: v.reason, itemIds: v.itemIds }
  )), {
    ...e,
    phase: v ? "blocked" : "preview",
    cursor: s,
    strategy: r,
    collisionPolicy: n,
    compactType: i,
    allowOverlap: f,
    preventCollision: d,
    cols: c,
    maxRows: y,
    candidateLayout: m,
    ghostItems: pn(
      e,
      m,
      p.summary.insertedIds.length ? p.summary.insertedIds : e.items.map((ae) => ae.i),
      v ? "blocked" : "preview"
    ),
    affectedOutlines: ci(e.baseLayout, m, p.summary, v),
    diagnostics: C,
    blocked: v,
    updatedAt: (o.now || Oo)(),
    previewSeq: e.previewSeq + 1
  };
}, mn = (e, t) => {
  var i, f, d;
  const o = (t.now || Oo)(), s = e.commandType || (e.source === "paste" ? "paste" : "add"), r = e.resolvedClipboardPayload ? le(e.resolvedClipboardPayload.items) : yn(e), n = {
    id: t.id || `grid-editor-placement:${++un}`,
    phase: "starting",
    source: e.source,
    commandType: s,
    baseRevision: t.baseRevision,
    baseLayout: le(t.baseLayout),
    items: r,
    editorMetaById: Me(
      ((i = e.resolvedClipboardPayload) == null ? void 0 : i.editorMetaById) || e.editorMetaById,
      { layout: r }
    ),
    resolvedClipboardPayload: e.resolvedClipboardPayload ? {
      ...e.resolvedClipboardPayload,
      items: le(e.resolvedClipboardPayload.items),
      editorMetaById: Me(e.resolvedClipboardPayload.editorMetaById, {
        layout: e.resolvedClipboardPayload.items
      })
    } : void 0,
    strategy: ii(e.strategy, t.defaultStrategy || "first-fit"),
    collisionPolicy: ri(e.collisionPolicy),
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor,
    compactType: ni(e.compactType),
    allowOverlap: co(e.allowOverlap),
    preventCollision: co(e.preventCollision),
    cursor: ai(e.cursor),
    size: r[0] ? { w: r[0].w, h: r[0].h } : void 0,
    origin: e.origin,
    cols: oi((f = e.cols) != null ? f : t.cols),
    maxRows: si((d = e.maxRows) != null ? d : t.maxRows),
    ghostItems: [],
    affectedOutlines: [],
    diagnostics: [],
    createdAt: o,
    updatedAt: o,
    previewSeq: 0
  };
  if (r.length === 0) {
    const c = {
      reason: "invalid-input",
      message: "No items were provided for placement.",
      recoverable: !1
    };
    return {
      ...n,
      phase: "blocked",
      blocked: c,
      diagnostics: [Lo(
        "grid-editor.placement.invalid-item",
        "error",
        c.message || "No items were provided for placement.",
        { reason: c.reason }
      )],
      updatedAt: o
    };
  }
  return Eo(n, {}, { now: () => o });
}, hn = (e, t = {}) => {
  var s, r, n, i;
  const o = {
    items: e.commandType === "add" ? le(e.items) : void 0,
    item: e.commandType === "add" && e.items.length === 1 ? $o(e.items[0]) : void 0,
    editorMetaById: e.commandType === "add" ? Me(e.editorMetaById) : void 0,
    resolvedClipboardPayload: e.commandType === "paste" ? {
      items: le(e.items),
      editorMetaById: Me(e.editorMetaById, { layout: e.items }),
      sourceId: (s = e.resolvedClipboardPayload) == null ? void 0 : s.sourceId,
      source: (r = e.resolvedClipboardPayload) == null ? void 0 : r.source,
      originalGeometryById: (n = e.resolvedClipboardPayload) == null ? void 0 : n.originalGeometryById,
      responsive: (i = e.resolvedClipboardPayload) == null ? void 0 : i.responsive,
      mapped: !0
    } : void 0,
    strategy: e.strategy,
    collisionPolicy: e.collisionPolicy,
    cursor: e.cursor,
    cols: e.cols,
    maxRows: e.maxRows,
    compactType: e.compactType,
    allowOverlap: e.allowOverlap,
    preventCollision: e.preventCollision,
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor,
    placementSessionId: e.id,
    placementSource: e.source,
    placementSummary: {
      ghostItemIds: e.ghostItems.map((f) => f.id),
      affectedIds: e.affectedOutlines.map((f) => f.id),
      diagnostics: e.diagnostics
    },
    placementCandidateLayout: e.candidateLayout ? le(e.candidateLayout) : void 0
  };
  return {
    type: e.commandType,
    payload: o,
    source: t.source || "api",
    origin: e.origin
  };
}, gn = (e, t = "cancelled", o = {}) => ({
  status: "cancelled",
  session: {
    ...e,
    phase: "blocked",
    candidateLayout: void 0,
    ghostItems: [],
    affectedOutlines: [],
    blocked: {
      reason: "invalid-input",
      message: t,
      recoverable: !1
    },
    updatedAt: (o.now || Oo)()
  }
}), vn = [
  { type: "select" },
  { type: "clearSelection" },
  { type: "move" },
  { type: "resize" },
  { type: "delete" },
  { type: "duplicate" },
  { type: "copy" },
  { type: "paste", payload: { strategy: "nearest-fit", cols: 12 } },
  { type: "lock" },
  { type: "unlock" },
  { type: "save" },
  { type: "discard" },
  { type: "reset" },
  { type: "undo" },
  { type: "redo" },
  { type: "align", payload: { mode: "left" } },
  { type: "distribute", payload: { mode: "horizontal" } },
  { type: "tidy", payload: { axis: "both" } }
], bn = (e) => {
  if (e === "align") return 2;
  if (e === "distribute" || e === "tidy") return 3;
}, In = (e, t) => {
  var r, n, i, f, d;
  const o = Us(t.type), s = e.canExecute({
    source: (o == null ? void 0 : o.defaultSource) || "toolbar",
    ...t
  });
  return {
    command: t.type,
    enabled: s.status !== "blocked" && s.status !== "cancelled" && s.status !== "timeout" && s.status !== "error",
    reason: (r = s.blocked) == null ? void 0 : r.reason,
    requiredSelectionCount: ((n = s.blocked) == null ? void 0 : n.reason) === "selection-count" ? bn(t.type) : void 0,
    blockedIds: ((i = s.blocked) == null ? void 0 : i.itemIds) || ((f = s.blocked) == null ? void 0 : f.skippedIds),
    labelKey: o == null ? void 0 : o.labelKey,
    shortcuts: o == null ? void 0 : o.shortcuts,
    messageKey: (d = s.blocked) != null && d.reason ? `grid-editor.toolbar.${t.type}.${s.blocked.reason}` : void 0
  };
}, xn = (e) => {
  var v, C;
  const t = e.selection.value, o = e.editorMetaById.value, s = Le(e.sectionRows.value), r = t.selectedIds, n = Array.from(new Set(r.flatMap((M) => {
    const k = s.itemMembership[M];
    return [
      (k == null ? void 0 : k.sectionId) || null,
      (k == null ? void 0 : k.rowId) || null
    ].filter(Boolean);
  }))), i = (v = Object.values(s.items).slice().sort((M, k) => M.order - k.order || M.id.localeCompare(k.id))[0]) == null ? void 0 : v.id, f = n[0] || i, d = {}, c = f ? { id: f } : {};
  [
    ...vn,
    { type: "section-row-collapse", payload: c },
    { type: "section-row-expand", payload: c },
    { type: "section-row-move", payload: f ? { id: f, dy: 1 } : {} },
    { type: "section-row-delete", payload: c },
    { type: "section-row-reorder", payload: c }
  ].forEach((M) => {
    d[M.type] = In(e, M);
  });
  const l = r.filter((M) => {
    var k;
    return (k = o[M]) == null ? void 0 : k.locked;
  }).length, p = r.filter((M) => {
    var k;
    return ((k = o[M]) == null ? void 0 : k.visible) === !1;
  }).length, m = (C = e.guides.value.diagnostics) == null ? void 0 : C.intelligence;
  return {
    commands: d,
    selectionSummary: {
      count: r.length,
      movableCount: Math.max(0, r.length - l - p),
      lockedCount: l,
      hiddenCount: p,
      sectionRowIds: n
    },
    intelligenceSummary: m ? {
      equalSpacing: m.codes.includes("grid-editor.distribution.equal"),
      distributionMode: m.distributionMode === "none" ? void 0 : m.distributionMode,
      snapCandidateCount: m.snapCandidateCount,
      degraded: m.degraded,
      reason: m.reason
    } : void 0
  };
}, Bo = (e) => e.kind === "layout" ? e.layout : e.layouts[e.breakpoint] || [], Gs = (e) => ({
  layoutSize: Bo(e).length,
  layoutCount: e.kind === "responsive" ? Object.keys(e.layouts).length : 1,
  metadataCount: Object.keys(e.editorMetaById || {}).length,
  sectionRowCount: Object.keys(e.sectionRows.items || {}).length,
  selectionCount: e.selection.selectedIds.length,
  focusId: e.focusId
}), wn = (e, t) => {
  const o = [];
  return (/* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])).forEach((r) => {
    const n = e[r], i = t[r];
    if (!i && n) {
      o.push({ type: "remove", id: r, previous: n });
      return;
    }
    i && !Ke(n, i) && o.push({ type: "set", id: r, previous: n, next: i });
  }), o;
}, kn = (e, t) => {
  const o = [], s = e.items || {}, r = t.items || {};
  return (/* @__PURE__ */ new Set([...Object.keys(s), ...Object.keys(r)])).forEach((i) => {
    const f = s[i], d = r[i];
    if (!d && f) {
      o.push({ type: "remove", id: i, previous: f });
      return;
    }
    d && !Ke(f, d) && o.push({ type: "set", id: i, previous: f, next: d });
  }), o;
}, As = (e, t, o = {}) => {
  const s = Ft(
    Bo(e),
    Bo(t)
  ), r = o.metadataPatches || wn(e.editorMetaById, t.editorMetaById), n = o.sectionRowPatches || kn(e.sectionRows, t.sectionRows), i = Io(s, r);
  return n.forEach((f) => i.push(f.id)), {
    layoutPatches: s,
    metadataPatches: r,
    sectionRowPatches: n,
    affectedIds: Array.from(new Set(i)),
    beforeSummary: Gs(e),
    afterSummary: Gs(t),
    risk: o.risk
  };
}, bo = {
  activeId: null,
  guides: [],
  displayGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}, zs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Rt = (e) => Me(e), Je = (e) => ({
  ...e,
  selectedIds: e.selectedIds.slice()
}), it = (e) => ({
  version: 1,
  items: Object.keys(e.items || {}).reduce((t, o) => {
    const s = e.items[o];
    return t[o] = {
      ...s,
      bounds: s.bounds ? { ...s.bounds } : void 0,
      itemIds: s.itemIds ? s.itemIds.slice() : void 0,
      allowedDropZones: s.allowedDropZones ? s.allowedDropZones.slice() : void 0
    }, t;
  }, {}),
  itemMembership: Object.keys(e.itemMembership || {}).reduce((t, o) => {
    var s;
    return t[o] = { ...((s = e.itemMembership) == null ? void 0 : s[o]) || {} }, t;
  }, {})
}), rt = (e, t) => {
  let o = 1, s = `${e}-copy`;
  for (; t.has(s); )
    o += 1, s = `${e}-copy-${o}`;
  return t.add(s), s;
}, Mn = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e), U = (e) => typeof e == "number" && Number.isFinite(e), Ne = (e, t) => Math.max(1, Math.floor(U(e) ? e : t)), Zt = (e) => e.payload && typeof e.payload == "object" ? e.payload : {}, Sn = (e) => e === "vertical" || e === "horizontal" || e === null, Ts = (e) => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift", Ds = (e) => e === "s" || e === "w" || e === "e" || e === "n" || e === "sw" || e === "nw" || e === "se" || e === "ne", Os = (e) => e || "invalid-input", Cn = (e, t, o) => {
  const s = o.type === "groupMove" ? o.ids.slice() : "id" in o ? [o.id] : [];
  return {
    id: e,
    status: "blocked",
    layout: t,
    patches: [],
    affectedIds: [],
    collisions: [],
    blocked: {
      reason: "unsupported",
      itemIds: s
    },
    diagnostics: {
      operationId: e,
      operationType: o.type,
      phase: "commit",
      layoutSize: t.length,
      affectedCount: 0,
      collisionCount: 0,
      indexHit: !1,
      executorKind: "main-thread",
      durationMs: 0
    }
  };
}, Dt = (e, t, o, s) => {
  const r = {};
  return { items: e.map((i) => {
    const f = s(i.i, o);
    return t[i.i] && (r[f] = { ...t[i.i] }), { ...$o(i), i: f };
  }), metaById: r };
}, di = (e) => {
  var Xo;
  const t = e.kind || (e.layouts ? "responsive" : "layout"), o = Re([]), s = Re({}), r = e.layout || o, n = e.layouts || s, i = e.breakpoint || Re("default"), f = !e.mode && !e.defaultMode, d = Re(e.defaultMode || "view"), c = e.mode || d, y = Re(
    Me(e.defaultEditorMetaById)
  ), l = e.editorMetaById || y, p = Re(
    e.defaultSectionRows || js()
  ), m = e.sectionRows || p, v = Re(
    Ge(
      ((Xo = e.selectedIds) == null ? void 0 : Xo.value) || e.defaultSelectedIds || [],
      e.selectedIds ? "external" : "api"
    )
  ), C = Re(null), M = Re({ ...bo }), k = Re(null), F = Re(null), X = Re(null), z = Re(!1), ae = Re(!1), D = Re(v.value.activeId), x = Re(!1), P = [];
  let A = 0, R = 0;
  const O = (a) => {
    R += 1;
    try {
      return a();
    } finally {
      R -= 1;
    }
  }, S = (a) => {
    var u, I;
    try {
      (u = e.onEvent) == null || u.call(e, a);
    } catch (g) {
      if (a.type !== "editor-error")
        try {
          (I = e.onEvent) == null || I.call(e, {
            type: "editor-error",
            code: "editor-event-listener-error",
            message: "Grid editor event listener failed.",
            details: g
          });
        } catch (w) {
        }
    }
  }, E = () => t === "responsive" ? le(n.value[i.value] || []) : le(r.value), W = (a) => {
    A += 1, O(() => {
      t === "responsive" ? (n.value = {
        ...n.value,
        [i.value]: le(a)
      }, e.layout && (r.value = le(a))) : r.value = le(a);
    });
  }, j = () => t === "responsive" ? oo(n.value) : { default: le(r.value) }, me = (a, u = i.value) => {
    A += 1, O(() => {
      n.value = oo(a), i.value = u, e.layout && (r.value = le(a[u] || []));
    });
  }, he = () => t === "responsive" ? {
    kind: "responsive",
    layouts: j(),
    breakpoint: i.value,
    editorMetaById: Rt(l.value),
    sectionRows: it(m.value),
    selection: Je(v.value),
    focusId: D.value
  } : {
    kind: "layout",
    layout: E(),
    editorMetaById: Rt(l.value),
    sectionRows: it(m.value),
    selection: Je(v.value),
    focusId: D.value
  }, Ee = (a) => {
    A += 1, a.kind === "responsive" ? me(a.layouts, a.breakpoint) : W(a.layout), l.value = Rt(a.editorMetaById), m.value = it(a.sectionRows), v.value = Je(a.selection), D.value = a.focusId;
  }, ie = Re(he()), q = e.history === !1 ? null : e.history || Or();
  q == null || q.replacePresent(he());
  const ne = us(() => !Ke(he(), ie.value)), Ae = us(() => C.value ? "conflict" : ae.value ? "savePending" : z.value ? "saveFailed" : X.value ? X.value : k.value ? "placing" : c.value === "view" ? "viewing" : ne.value ? "editingDirty" : "editingClean"), Fe = Mn(e.persistence) ? e.persistence : null, je = Xr({
    getEditorMetaById: () => l.value,
    getSectionRows: () => m.value,
    setEditorMetaById: (a, u) => {
      A += 1, l.value = Me(a, { layout: E() }), (u === "save-success" || u === "load-success") && (ie.value = he());
    },
    setSectionRows: (a, u) => {
      A += 1, m.value = {
        version: 1,
        items: a.items,
        itemMembership: a.itemMembership
      }, (u === "save-success" || u === "load-success") && (ie.value = he());
    },
    persistence: Fe,
    onSaveStateChange: (a) => {
      ae.value = a.status === "saving", z.value = a.status === "error", S({
        type: "save-state-change",
        status: a.status,
        dirty: a.dirty,
        error: a.error
      });
    },
    onConflict: (a) => {
      A += 1, C.value = a, S({ type: "conflict", conflict: a });
    },
    onError: (a, u, I) => {
      S({ type: "editor-error", code: a, message: u, details: I });
    }
  }), ot = (a, u = !1) => {
    const I = v.value, g = Ze(
      a,
      E(),
      l.value,
      a.source
    );
    return e.selectedIds ? (S({
      type: "selection-change",
      selection: g,
      previous: I,
      requested: !0
    }), I) : Ke(I, g) ? I : (A += 1, v.value = g, D.value = g.activeId, S({
      type: "selection-change",
      selection: g,
      previous: I,
      requested: u
    }), g);
  }, Ye = (a, u, I, g = ((w) => (w = u.diagnostics) == null ? void 0 : w.guardMs)() || 0) => {
    var $, L, Ie;
    const h = Ot(
      a.history,
      eo(a.type)
    ), B = {
      ...u,
      diagnostics: {
        ...u.diagnostics,
        durationMs: zs() - I,
        guardMs: g,
        historyMode: (($ = u.diagnostics) == null ? void 0 : $.historyMode) || h.mode,
        source: ((L = u.diagnostics) == null ? void 0 : L.source) || a.source,
        origin: ((Ie = u.diagnostics) == null ? void 0 : Ie.origin) || a.origin
      }
    };
    return F.value = B, B.status === "blocked" || B.status === "cancelled" || B.status === "timeout" ? S({ type: "command-blocked", command: a, result: B }) : B.status === "error" ? S({ type: "command-error", command: a, result: B }) : S({ type: "command-commit", command: a, result: B }), X.value === "keyboardEditing" && a.source === "keyboard" && (X.value = null), B;
  }, bt = (a, u, I, g) => {
    var $, L;
    const w = Ot(
      a.history,
      eo(a.type)
    );
    if (I.diagnostics = {
      durationMs: (($ = I.diagnostics) == null ? void 0 : $.durationMs) || 0,
      ...I.diagnostics,
      historyMode: w.mode,
      source: a.source,
      origin: a.origin
    }, !q)
      return I;
    if (w.mode === "clear")
      return q.clear(he()), I;
    if (w.mode === "replace")
      return q.replacePresent(he(), {
        preserveRedoStack: w.preserveRedoStack
      }), I;
    if (w.mode === "ignore" || !$i(a.type))
      return I;
    const h = g || he(), B = Lr({
      commandId: a.id,
      commandType: a.type,
      before: u,
      after: h,
      mergeKey: w.mergeKey,
      source: a.source,
      origin: a.origin,
      targetIds: I.targetIds,
      affectedIds: I.affectedIds,
      historyMode: w.mode
    });
    return q.push(B, {
      preserveRedoStack: w.preserveRedoStack || w.mode === "record-preserveRedoStack"
    }), I.undo = B, t === "layout" && ((L = e.legacyHistoryStore) == null || L.push(E())), I;
  }, It = (a) => so(a.type).mutualExclusionScope || "global", xt = (a, u, I) => {
    const g = so(a.type);
    return {
      id: `${a.id}:transaction`,
      commandId: a.id,
      command: a,
      source: a.source || g.defaultSource || "api",
      origin: a.origin,
      scope: It(a),
      before: u,
      after: I,
      preview: As(u, I, {
        risk: g.risk
      }),
      history: Ot(
        a.history,
        g.defaultHistory.mode || eo(a.type)
      )
    };
  }, lt = (a, u, I) => {
    if (e.selectedIds) {
      Ke(a.selection, u.selection) || S({
        type: "selection-change",
        selection: Je(u.selection),
        previous: Je(a.selection),
        requested: !0
      });
      return;
    }
    Ke(a.selection, I.selection) || S({
      type: "selection-change",
      selection: Je(I.selection),
      previous: Je(a.selection)
    }), a.focusId !== I.focusId && S({
      type: "focus-change",
      from: a.focusId,
      to: I.focusId,
      reason: "transaction"
    });
  }, ge = (a, u, I, g = {}) => {
    const w = !!e.selectedIds, h = w ? Ve(I, {
      selection: u.selection,
      focusId: u.focusId
    }) : I, B = xt(a, u, h), $ = !Ke(u, h), L = g.status || ($ ? "changed" : "noop"), Ie = xe(a, L, {
      ...g,
      targetIds: g.targetIds || B.preview.affectedIds,
      layoutPatches: g.layoutPatches || B.preview.layoutPatches,
      metadataPatches: g.metadataPatches || B.preview.metadataPatches,
      affectedIds: g.affectedIds || B.preview.affectedIds,
      selection: g.selection || h.selection,
      diagnostics: {
        durationMs: 0,
        ...g.diagnostics
      }
    });
    if ($)
      try {
        Ee(B.after), lt(u, I, B.after);
      } catch (N) {
        try {
          Ee(B.before);
        } catch (V) {
        }
        return ns(a, "Editor transaction apply failed.", N);
      }
    else w && lt(u, I, B.after);
    return bt(a, u, Ie, B.after);
  }, qe = (a) => typeof e.layoutEngineOptions == "function" ? e.layoutEngineOptions() : e.layoutEngineOptions ? e.layoutEngineOptions : U(a.cols) ? {
    cols: Math.max(1, Math.floor(a.cols)),
    maxRows: U(a.maxRows) ? a.maxRows : 1 / 0,
    compactType: Sn(a.compactType) ? a.compactType : "vertical",
    allowOverlap: a.allowOverlap === !0,
    preventCollision: a.preventCollision === !0
  } : null, Et = (a) => {
    const u = qe(a);
    return u ? u.cols : U(a.cols) && a.cols > 0 ? Math.floor(a.cols) : void 0;
  }, uo = (a) => {
    const u = {}, I = Et(a);
    return I && (u.cols = I), typeof a.breakpoint == "string" && (u.breakpoint = a.breakpoint), typeof a.layoutId == "string" && (u.layoutId = a.layoutId), typeof a.viewFormat == "string" && (u.viewFormat = a.viewFormat), Object.keys(u).length > 0 ? u : void 0;
  }, Kt = async (a, u, I, g) => {
    const w = `${a.id}:layout`;
    if (e.layoutOperationRunner)
      return await e.layoutOperationRunner({
        commandId: a.id,
        layout: u,
        operation: I,
        phase: "commit",
        source: a.source || "api"
      });
    const h = qe(g);
    return h ? await Promise.resolve(xo({
      id: w,
      phase: "commit",
      layout: u,
      operation: I,
      options: h
    })) : Cn(w, u, I);
  }, Xt = (a) => {
    var w, h, B, $;
    const u = (w = e.itemCapabilities) == null ? void 0 : w[a], I = ((h = e.resizeConstraints) == null ? void 0 : h[a]) || ((B = u == null ? void 0 : u.resizeConstraint) == null ? void 0 : B.aspectRatio), g = (($ = u == null ? void 0 : u.resizeConstraint) == null ? void 0 : $.handlePolicy) || (u != null && u.resizeHandles ? {
      allowedHandles: u.resizeHandles,
      blockedReason: "handle-disabled"
    } : void 0);
    if (!(!I && !g))
      return { aspectRatio: I, handlePolicy: g };
  }, b = async (a) => {
    try {
      return await a.read();
    } catch (u) {
      if (a !== mt)
        return mt.read();
      throw u;
    }
  }, G = async (a, u) => {
    try {
      await a.write(u);
    } catch (I) {
      if (a !== mt) {
        await mt.write(u);
        return;
      }
      throw I;
    }
  }, H = () => !e.clipboard || e.clipboard === "internal" ? mt : e.clipboard === "system" ? Hr() : e.clipboard, ee = (a, u) => ({
    durationMs: 0,
    computed: {
      placement: {
        ...a.summary,
        collisionPolicy: (u == null ? void 0 : u.collisionPolicy) === "layout" || (u == null ? void 0 : u.collisionPolicy) === "block" ? u.collisionPolicy : a.summary.collisionPolicy,
        sessionId: typeof (u == null ? void 0 : u.placementSessionId) == "string" ? u.placementSessionId : a.summary.sessionId,
        source: typeof (u == null ? void 0 : u.placementSource) == "string" ? u.placementSource : a.summary.source
      }
    },
    messages: a.summary.diagnostics.map((g) => ({
      code: g.code,
      level: g.level,
      message: g.message,
      itemIds: g.itemIds,
      recoverable: g.level !== "error"
    }))
  }), J = (a) => ({
    durationMs: 0,
    computed: {
      placement: {
        strategy: a.strategy,
        placementSource: a.strategy,
        collisionPolicy: a.collisionPolicy,
        sessionId: a.id,
        source: a.source,
        insertedIds: a.ghostItems.map((u) => u.id),
        shiftedIds: a.affectedOutlines.filter((u) => u.kind === "shift").map((u) => u.id),
        before: a.affectedOutlines.map((u) => ({
          id: u.id,
          ...u.before
        })),
        after: a.affectedOutlines.map((u) => ({
          id: u.id,
          ...u.after
        })),
        diagnostics: a.diagnostics
      }
    },
    messages: a.diagnostics.map((u) => ({
      code: u.code,
      level: u.level,
      message: u.message,
      itemIds: u.itemIds,
      recoverable: u.level !== "error"
    }))
  }), te = (a, u, I, g = [], w) => ({
    status: "blocked",
    blocked: {
      reason: u,
      itemIds: g,
      message: I
    },
    diagnostics: w || {
      durationMs: 0,
      messages: [{
        code: `grid-editor.placement.${u}`,
        level: u === "invalid-input" ? "error" : "warning",
        message: I,
        itemIds: g,
        recoverable: u !== "invalid-input"
      }]
    }
  }), Ce = (a) => {
    if (a.commandType && a.commandType !== "add" || a.source === "paste") return a;
    const u = Array.isArray(a.items) ? a.items : a.item ? [a.item] : [];
    if (u.length === 0) return a;
    const I = new Set(E().map(($) => $.i)), g = e.idGenerator || rt, w = a.editorMetaById || {}, h = {}, B = u.filter(($) => $ && typeof $ == "object").map(($, L) => {
      const Ie = typeof $.i == "string" && $.i.length > 0 ? $.i : `item-${L + 1}`, N = I.has(Ie) ? g(Ie, I) : Ie;
      return I.add(N), w[Ie] && (h[N] = { ...w[Ie] }), {
        ...$,
        i: N,
        x: U($.x) ? $.x : 0,
        y: U($.y) ? $.y : 0,
        w: Ne($.w, 1),
        h: Ne($.h, 1)
      };
    });
    return {
      ...a,
      commandType: "add",
      item: void 0,
      items: B,
      editorMetaById: Me(h, { layout: B })
    };
  }, de = (a) => {
    const u = k.value;
    return u ? (k.value = null, M.value = { ...bo }, S({ type: "placement-cancel", sessionId: u.id, reason: a }), u) : null;
  }, De = (a, u, I, g) => {
    for (let w = 0; w < u.length; w++) {
      const h = Pe(a, u[w]);
      if (!h) continue;
      if (h.x < 0 || h.y < 0 || h.x + h.w > I)
        return { ok: !1, reason: "bounds", itemIds: [h.i] };
      if (Number.isFinite(g) && h.y + h.h > g)
        return { ok: !1, reason: "maxRows", itemIds: [h.i] };
      const B = Pt(a, h).filter(($) => $.i !== h.i);
      if (B.length > 0)
        return {
          ok: !1,
          reason: "collision",
          itemIds: [h.i, ...B.map(($) => $.i)]
        };
    }
    return { ok: !0 };
  }, Qe = (a, u) => {
    const I = Le(m.value, u), g = [], w = [];
    return a.forEach((h) => {
      const B = I.itemMembership[h], $ = B != null && B.sectionId ? I.items[B.sectionId] : void 0, L = B != null && B.rowId ? I.items[B.rowId] : void 0;
      $ != null && $.locked || L != null && L.locked ? g.push(h) : ($ != null && $.collapsed || L != null && L.collapsed) && w.push(h);
    }), g.length > 0 ? { reason: "section-row-locked", itemIds: g } : w.length > 0 ? { reason: "section-row-collapsed", itemIds: w } : null;
  }, _e = (a, u) => {
    const I = new Set(u), g = /* @__PURE__ */ new Set();
    return Object.keys(a.itemMembership).forEach((w) => {
      const h = a.itemMembership[w];
      (h.sectionId && I.has(h.sectionId) || h.rowId && I.has(h.rowId)) && g.add(w);
    }), u.forEach((w) => {
      var h, B;
      (B = (h = a.items[w]) == null ? void 0 : h.itemIds) == null || B.forEach(($) => g.add($));
    }), Array.from(g).sort();
  }, st = (a, u) => {
    if (U(u.order)) return u.order;
    const I = Object.values(a.items).slice().sort((h, B) => h.order - B.order || h.id.localeCompare(B.id)), g = u.beforeId ? a.items[u.beforeId] : void 0, w = u.afterId ? a.items[u.afterId] : void 0;
    if (g) {
      const h = I[I.findIndex((B) => B.id === g.id) - 1];
      return h ? (h.order + g.order) / 2 : g.order - 1;
    }
    if (w) {
      const h = I[I.findIndex((B) => B.id === w.id) + 1];
      return h ? (w.order + h.order) / 2 : w.order + 1;
    }
    return I.length > 0 ? I[I.length - 1].order + 1 : 0;
  }, Yt = async (a, u, I, g) => {
    var Se, Bt, $t, Yo, _o, Uo, Wo, qo, Vo, Zo, Jo, Qo, es, ts, os;
    const w = E(), h = Zt(a), B = [];
    let $, L = le(w), Ie = Je(g.selection), N = g.focusId;
    const V = mo(a.type) ? Qe(u, w) : null;
    if (V)
      return xe(a, "blocked", {
        targetIds: u,
        blocked: {
          reason: V.reason,
          itemIds: V.itemIds,
          message: `Command blocked by ${V.reason}.`
        },
        diagnostics: {
          durationMs: 0,
          messages: [{
            code: V.reason === "section-row-locked" ? "grid-editor.sectionRows.locked" : "grid-editor.sectionRows.collapsed",
            level: "warning",
            message: `Command blocked by ${V.reason}.`,
            itemIds: V.itemIds,
            recoverable: !0
          }]
        }
      });
    const oe = _t(a);
    if (oe && mo(a.type)) {
      const K = B.slice();
      if (a.type === "add") {
        const Z = Me(h.editorMetaById, {
          layout: oe
        });
        Object.keys(Z).forEach((Ue) => {
          K.push({ type: "set", id: Ue, next: Z[Ue] });
        });
      } else if (a.type === "paste") {
        const Z = h.resolvedClipboardPayload && typeof h.resolvedClipboardPayload == "object" ? h.resolvedClipboardPayload : null, Ue = Me(Z == null ? void 0 : Z.editorMetaById, {
          layout: oe
        });
        Object.keys(Ue).forEach((kt) => {
          K.push({ type: "set", id: kt, next: Ue[kt] });
        });
      }
      const Y = Ft(w, oe), _ = Y.flatMap(
        (Z) => Z.type === "add" ? [Z.item.i] : []
      ), se = Y.flatMap(
        (Z) => Z.type === "move" || Z.type === "resize" ? [Z.id] : []
      ), ue = Io(Y, K), re = typeof h.placementSessionId == "string" ? {
        durationMs: 0,
        computed: {
          placement: {
            strategy: Ts(h.strategy) ? h.strategy : "first-fit",
            placementSource: Ts(h.strategy) ? h.strategy : "first-fit",
            collisionPolicy: h.collisionPolicy === "layout" || h.collisionPolicy === "block" ? h.collisionPolicy : void 0,
            sessionId: h.placementSessionId,
            source: typeof h.placementSource == "string" ? h.placementSource : void 0,
            insertedIds: _,
            shiftedIds: se,
            before: w.map((Z) => ({
              id: Z.i,
              x: Z.x,
              y: Z.y,
              w: Z.w,
              h: Z.h
            })),
            after: oe.map((Z) => ({
              id: Z.i,
              x: Z.x,
              y: Z.y,
              w: Z.w,
              h: Z.h
            })),
            diagnostics: Array.isArray((Se = h.placementSummary) == null ? void 0 : Se.diagnostics) ? h.placementSummary.diagnostics : []
          }
        }
      } : $, fe = ft(
        Tt(g.editorMetaById, K),
        oe
      ), Be = _.length > 0 && (a.type === "add" || a.type === "paste") ? Ge(_, "api") : Ze(
        g.selection,
        oe,
        fe,
        "api"
      );
      return ge(a, g, Ve(g, {
        layout: oe,
        editorMetaById: fe,
        selection: Be,
        focusId: Be.activeId
      }), {
        status: ue.length > 0 ? "changed" : "noop",
        targetIds: u.length > 0 ? u : a.targetIds,
        layoutPatches: Y,
        metadataPatches: K,
        affectedIds: ue,
        selection: Be,
        blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
        diagnostics: re
      });
    }
    if (cs(a.type)) {
      const K = h, Y = Le(m.value, w), _ = u.length > 0 ? u : K.id ? [K.id] : [], se = _.filter((ve) => !Y.items[ve]);
      if (se.length > 0)
        return xe(a, "blocked", {
          targetIds: _,
          blocked: {
            reason: "missing-item",
            itemIds: se,
            message: "Section/row command referenced missing metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.missing",
              level: "warning",
              message: "Section/row command referenced missing metadata.",
              itemIds: se,
              recoverable: !0
            }]
          }
        });
      const ue = _.filter((ve) => {
        var we;
        return (we = Y.items[ve]) == null ? void 0 : we.locked;
      });
      if (ue.length > 0 && a.type !== "section-row-expand")
        return xe(a, "blocked", {
          targetIds: _,
          blocked: {
            reason: "section-row-locked",
            itemIds: _e(Y, ue),
            message: "Section/row command blocked by locked metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.locked",
              level: "warning",
              message: "Section/row command blocked by locked metadata.",
              itemIds: ue,
              recoverable: !0
            }]
          }
        });
      const re = it({
        items: Y.items,
        itemMembership: Y.itemMembership
      }), fe = _e(Y, _);
      let Be = v.value.selectedIds.slice(), Z = D.value;
      const Ue = U(h.cols) ? h.cols : 12, kt = U(h.maxRows) ? h.maxRows : 1 / 0;
      if (a.type === "section-row-collapse" || a.type === "section-row-expand") {
        const ve = a.type === "section-row-collapse";
        _.forEach((we) => {
          re.items[we] = { ...re.items[we], collapsed: ve };
        }), ve && (Be = Be.filter((we) => !fe.includes(we)), Z && fe.includes(Z) && (Z = Be[0] || null));
      } else if (a.type === "section-row-reorder")
        _.forEach((ve) => {
          re.items[ve] = {
            ...re.items[ve],
            order: st(Y, K)
          };
        });
      else if (a.type === "section-row-move") {
        const ve = U(K.dy) ? Math.floor(K.dy) : 0;
        L = L.map(
          (He) => fe.includes(He.i) ? { ...He, y: Math.max(0, He.y + ve) } : He
        ), _.forEach((He) => {
          const We = re.items[He];
          re.items[He] = {
            ...We,
            bounds: We.bounds ? { ...We.bounds, y: Math.max(0, We.bounds.y + ve) } : We.bounds
          };
        });
        const we = De(L, fe, Ue, kt);
        if (!we.ok)
          return xe(a, "blocked", {
            targetIds: _,
            blocked: {
              reason: we.reason,
              itemIds: we.itemIds,
              message: `Section/row move blocked by ${we.reason}.`
            },
            diagnostics: {
              durationMs: 0,
              messages: [{
                code: `grid-editor.sectionRows.move.${we.reason}`,
                level: "warning",
                message: `Section/row move blocked by ${we.reason}.`,
                itemIds: we.itemIds,
                recoverable: !0
              }]
            }
          });
      } else a.type === "section-row-delete" && (_.forEach((ve) => {
        delete re.items[ve];
      }), Object.keys(re.itemMembership || {}).forEach((ve) => {
        var We, zt;
        const we = ((We = re.itemMembership) == null ? void 0 : We[ve]) || {}, He = {
          sectionId: we.sectionId && _.includes(we.sectionId) ? void 0 : we.sectionId,
          rowId: we.rowId && _.includes(we.rowId) ? void 0 : we.rowId
        };
        !He.sectionId && !He.rowId ? (zt = re.itemMembership) == null || delete zt[ve] : re.itemMembership && (re.itemMembership[ve] = He);
      }), K.deleteItems === !0 && (L = L.filter((ve) => !fe.includes(ve.i)), fe.forEach((ve) => {
        l.value[ve] && B.push({ type: "remove", id: ve, previous: l.value[ve] });
      }), Be = Be.filter((ve) => !fe.includes(ve)), Z && fe.includes(Z) && (Z = Be[0] || null)));
      const po = Le(re, L), et = Ft(w, L), Gt = {
        version: 1,
        items: po.items,
        itemMembership: po.itemMembership
      }, Mt = ft(
        Tt(g.editorMetaById, B),
        L
      ), ze = Ze(
        Ge(Be, "api"),
        L,
        Mt,
        "api"
      ), At = Array.from(/* @__PURE__ */ new Set([..._, ...fe]));
      return ge(a, g, Ve(g, {
        layout: L,
        editorMetaById: Mt,
        sectionRows: Gt,
        selection: ze,
        focusId: Z
      }), {
        status: "changed",
        targetIds: _,
        layoutPatches: et,
        metadataPatches: B,
        affectedIds: At,
        selection: ze,
        diagnostics: {
          durationMs: 0,
          computed: {
            affectedIds: At,
            sectionRowContext: {
              source: "metadata"
            }
          },
          messages: [{
            code: `grid-editor.sectionRows.${a.type.replace("section-row-", "")}`,
            level: "info",
            message: `Section/row command ${a.type} applied.`,
            itemIds: fe,
            recoverable: !0
          }]
        }
      });
    }
    if (a.type === "select") {
      const K = v.value, Y = ws(w, v.value, {
        id: typeof h.id == "string" ? h.id : void 0,
        ids: Array.isArray(h.ids) ? h.ids.filter((ue) => typeof ue == "string") : typeof h.id == "string" ? void 0 : u,
        toggle: h.toggle === !0,
        range: h.range === !0,
        source: a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
      }), _ = Ze(
        Y,
        w,
        g.editorMetaById,
        Y.source
      ), se = e.selectedIds ? K : _;
      return ge(a, g, Ve(g, {
        selection: _,
        focusId: _.activeId
      }), {
        status: Ke(K, se) ? "noop" : "changed",
        targetIds: se.selectedIds,
        selection: se
      });
    }
    if (a.type === "clearSelection") {
      const K = v.value, Y = Ze(
        Mo("api"),
        w,
        g.editorMetaById,
        "api"
      ), _ = e.selectedIds ? K : Y;
      return ge(a, g, Ve(g, {
        selection: Y,
        focusId: Y.activeId
      }), {
        status: Ke(K, _) ? "noop" : "changed",
        selection: _
      });
    }
    if (a.type === "move") {
      const K = U(h.dx) ? h.dx : null, Y = U(h.dy) ? h.dy : null, _ = U(h.x), se = U(h.y), ue = Array.from(/* @__PURE__ */ new Set([...u, ...I])), re = v.value.activeId && u.includes(v.value.activeId) ? v.value.activeId : u[0], fe = re ? Pe(w, re) : void 0, Be = (((Bt = a.targetIds) == null ? void 0 : Bt.filter(Boolean).length) || 0) > 1, Z = !a.targetIds && v.value.selectedIds.length > 1 && (K !== null || Y !== null), Ue = Be || Z, kt = u.length === 1 && !Be && (_ || se);
      if (u.length > 0 && !kt && (u.length > 1 || Ue)) {
        const et = K !== null ? K : _ && fe ? h.x - fe.x : 0, Gt = Y !== null ? Y : se && fe ? h.y - fe.y : 0, Mt = {
          type: "groupMove",
          ids: u,
          activeId: re,
          dx: et,
          dy: Gt,
          userAction: a.source !== "api"
        }, ze = await Kt(a, w, Mt, h);
        if ($ = {
          durationMs: 0,
          layoutDiagnostics: ze.diagnostics,
          operationResult: ze
        }, ze.status === "blocked") {
          const zt = Os(($t = ze.blocked) == null ? void 0 : $t.reason);
          return xe(a, "blocked", {
            targetIds: ue,
            blocked: {
              reason: zt,
              itemIds: ((Yo = ze.blocked) == null ? void 0 : Yo.itemIds) || ue,
              skippedIds: I.length > 0 ? I : void 0,
              message: `Move command blocked by ${zt}.`
            },
            diagnostics: $
          });
        }
        if (ze.status === "error")
          return xe(a, "error", {
            targetIds: ue,
            diagnostics: $,
            error: ze.error || { message: "Layout operation failed." }
          });
        const At = ze.patches, ve = ze.affectedIds, we = At.length > 0 || ze.status === "changed" || ze.status === "fallback" ? "changed" : "noop", He = ft(
          Tt(g.editorMetaById, B),
          ze.layout
        ), We = Ze(
          g.selection,
          ze.layout,
          He,
          "api"
        );
        return ge(a, g, Ve(g, {
          layout: ze.layout,
          editorMetaById: He,
          selection: We,
          focusId: We.activeId
        }), {
          status: we,
          targetIds: ue,
          layoutPatches: At,
          metadataPatches: B,
          affectedIds: ve,
          selection: We,
          blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
          diagnostics: $
        });
      }
      L = L.map((et) => {
        if (!u.includes(et.i)) return et;
        const Gt = u.length === 1 && _ ? h.x : et.x + (K || 0), Mt = u.length === 1 && se ? h.y : et.y + (Y || 0);
        return { ...et, x: Math.max(0, Math.floor(Gt)), y: Math.max(0, Math.floor(Mt)) };
      });
    } else if (a.type === "resize") {
      const K = u[0], Y = K ? Pe(L, K) : void 0, _ = K ? Xt(K) : void 0;
      if (Y && _) {
        const se = U(h.w) ? h.w : Y.w + (U(h.dw) ? h.dw : 0), ue = U(h.h) ? h.h : Y.h + (U(h.dh) ? h.dh : 0), re = await Kt(a, w, {
          type: "resize",
          id: K,
          x: U(h.x) ? Math.max(0, Math.floor(h.x)) : void 0,
          y: U(h.y) ? Math.max(0, Math.floor(h.y)) : void 0,
          w: Ne(se, Y.w),
          h: Ne(ue, Y.h),
          handle: Ds(h.handle) ? h.handle : "se",
          constraint: _
        }, h);
        if ($ = {
          durationMs: 0,
          layoutDiagnostics: re.diagnostics,
          operationResult: re
        }, re.status === "blocked") {
          const fe = Os((_o = re.blocked) == null ? void 0 : _o.reason);
          return xe(a, "blocked", {
            targetIds: u,
            blocked: {
              reason: fe,
              itemIds: ((Uo = re.blocked) == null ? void 0 : Uo.itemIds) || u,
              message: `Resize command blocked by ${fe}.`
            },
            diagnostics: $
          });
        }
        if (re.status === "error")
          return xe(a, "error", {
            targetIds: u,
            diagnostics: $,
            error: re.error || { message: "Layout operation failed." }
          });
        L = re.layout;
      } else
        L = L.map((se) => {
          if (se.i !== K) return se;
          const ue = U(h.w) ? h.w : se.w + (U(h.dw) ? h.dw : 0), re = U(h.h) ? h.h : se.h + (U(h.dh) ? h.dh : 0);
          return {
            ...se,
            x: U(h.x) ? Math.max(0, Math.floor(h.x)) : se.x,
            y: U(h.y) ? Math.max(0, Math.floor(h.y)) : se.y,
            w: Ne(ue, se.w),
            h: Ne(re, se.h)
          };
        });
    } else if (a.type === "align") {
      const K = U(h.cols) ? h.cols : 12, Y = U(h.maxRows) ? h.maxRows : 1 / 0, _ = Rs(w, h, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: K,
        maxRows: Y,
        skippedIds: I
      });
      if ($ = _.diagnostics, _.status === "blocked")
        return xe(a, "blocked", {
          targetIds: u,
          blocked: _.blocked,
          diagnostics: $
        });
      L = _.layout;
    } else if (a.type === "distribute" || a.type === "tidy") {
      const K = U(h.cols) ? h.cols : 12, Y = U(h.maxRows) ? h.maxRows : 1 / 0, _ = a.type === "distribute" ? Ps(w, h, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: K,
        maxRows: Y,
        skippedIds: I
      }) : Es(w, h, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: K,
        maxRows: Y,
        skippedIds: I
      });
      if ($ = _.diagnostics, _.status === "blocked")
        return xe(a, "blocked", {
          targetIds: u,
          blocked: _.blocked,
          diagnostics: $
        });
      L = _.layout;
    } else if (a.type === "add") {
      const K = Array.isArray(h.items) ? h.items : h.item ? [h.item] : [], Y = new Set(L.map((fe) => fe.i)), _ = e.idGenerator || rt, se = K.filter((fe) => fe && typeof fe == "object").map((fe, Be) => {
        const Z = fe, Ue = typeof Z.i == "string" && !Y.has(Z.i) ? Z.i : _(typeof Z.i == "string" ? Z.i : `item-${Be + 1}`, Y);
        return Y.add(Ue), {
          ...Z,
          i: Ue,
          x: U(Z.x) ? Z.x : 0,
          y: U(Z.y) ? Z.y : 0,
          w: Ne(Z.w, 1),
          h: Ne(Z.h, 1)
        };
      }), ue = gt(L, se, String(h.strategy || "first-fit"), h);
      if ($ = ee(ue, h), ue.failed)
        return xe(a, "blocked", {
          targetIds: ue.summary.insertedIds,
          blocked: {
            reason: ((Wo = ue.blocked) == null ? void 0 : Wo.reason) || "bounds",
            itemIds: (qo = ue.blocked) == null ? void 0 : qo.itemIds,
            message: ((Vo = ue.blocked) == null ? void 0 : Vo.message) || "One or more items could not fit in the current layout."
          },
          diagnostics: $
        });
      const re = Me(h.editorMetaById, { layout: se });
      Object.keys(re).forEach((fe) => {
        se.some((Be) => Be.i === fe) && B.push({ type: "set", id: fe, next: re[fe] });
      }), L = ue.layout;
    } else if (a.type === "delete") {
      const K = new Set(u);
      L = L.filter((Y) => !K.has(Y.i)), u.forEach((Y) => {
        l.value[Y] && B.push({ type: "remove", id: Y, previous: l.value[Y] });
      }), N = ks(L, u, l.value);
    } else if (a.type === "duplicate") {
      const K = u.map((se) => Pe(w, se)).filter(Boolean), Y = Dt(
        K,
        l.value,
        new Set(w.map((se) => se.i)),
        e.idGenerator || rt
      );
      Object.keys(Y.metaById).forEach((se) => {
        B.push({ type: "set", id: se, next: Y.metaById[se] });
      });
      const _ = gt(
        L,
        Y.items,
        String(h.strategy || e.pasteStrategy || "offset"),
        h
      );
      if ($ = ee(_, h), _.failed)
        return xe(a, "blocked", {
          targetIds: u,
          blocked: {
            reason: ((Zo = _.blocked) == null ? void 0 : Zo.reason) || "bounds",
            itemIds: ((Jo = _.blocked) == null ? void 0 : Jo.itemIds) || u,
            message: ((Qo = _.blocked) == null ? void 0 : Qo.message) || "Duplicated items could not fit in the current layout."
          },
          diagnostics: $
        });
      L = _.layout, Ie = Ge(Y.items.map((se) => se.i), "api"), N = Ie.activeId;
    } else if (a.type === "copy") {
      const K = u.map((Y) => Pe(w, Y)).filter(Boolean);
      return await G(H(), Nr({
        sourceId: a.id,
        items: K,
        editorMetaById: Me(l.value, { layout: K }),
        source: uo(h)
      })), xe(a, "changed", {
        targetIds: u,
        affectedIds: u
      });
    } else if (a.type === "paste") {
      const K = h.resolvedClipboardPayload && typeof h.resolvedClipboardPayload == "object" ? h.resolvedClipboardPayload : null, Y = K ? {
        items: le(Array.isArray(K.items) ? K.items : []),
        editorMetaById: Me(K.editorMetaById),
        sourceId: typeof K.sourceId == "string" ? K.sourceId : a.id,
        copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 2,
        source: K.source,
        originalGeometryById: K.originalGeometryById
      } : await b(H());
      if (!Y)
        return xe(a, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      const _ = (K == null ? void 0 : K.mapped) === !0 ? {
        items: le(Y.items)
      } : vo(Y, {
        cols: Et(h)
      }), se = (K == null ? void 0 : K.mapped) === !0 ? {
        items: le(_.items),
        metaById: Me(Y.editorMetaById, {
          layout: _.items
        })
      } : Dt(
        _.items,
        Y.editorMetaById,
        new Set(w.map((re) => re.i)),
        e.idGenerator || rt
      );
      Object.keys(se.metaById).forEach((re) => {
        B.push({ type: "set", id: re, next: se.metaById[re] });
      });
      const ue = gt(
        L,
        se.items,
        String(h.strategy || e.pasteStrategy || "offset"),
        h
      );
      if ($ = ee(ue, h), ue.failed)
        return xe(a, "blocked", {
          blocked: {
            reason: ((es = ue.blocked) == null ? void 0 : es.reason) || "bounds",
            itemIds: (ts = ue.blocked) == null ? void 0 : ts.itemIds,
            message: ((os = ue.blocked) == null ? void 0 : os.message) || "Clipboard items could not fit in the current layout."
          },
          diagnostics: $
        });
      L = ue.layout, Ie = Ge(se.items.map((re) => re.i), "api"), N = Ie.activeId;
    } else ds(a.type) && u.forEach((K) => {
      const Y = a.type === "lock" ? { locked: !0 } : a.type === "unlock" ? { locked: !1 } : a.type === "show" ? { visible: !0 } : { visible: !1 }, _ = ls(l.value, K, Y);
      _.patch && B.push(_.patch);
    });
    const ye = Ft(w, L), T = ft(
      Tt(g.editorMetaById, B),
      L
    ), Q = Ze(
      Ie,
      L,
      T,
      Ie.source
    ), pe = N !== g.focusId ? N : Q.activeId, ce = Io(ye, B), ke = ce.length > 0 ? "changed" : "noop";
    return ge(a, g, Ve(g, {
      layout: L,
      editorMetaById: T,
      selection: Q,
      focusId: pe
    }), {
      status: ke,
      targetIds: u.length > 0 ? u : a.targetIds,
      layoutPatches: ye,
      metadataPatches: B,
      affectedIds: ce,
      selection: e.selectedIds ? g.selection : Q,
      blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
      diagnostics: $
    });
  }, fo = (a, u) => a.kind === "responsive" ? {
    ...a,
    layouts: {
      ...oo(a.layouts),
      [a.breakpoint]: le(u)
    }
  } : {
    ...a,
    layout: le(u)
  }, Ve = (a, u) => ({
    ...u.layout ? fo(a, u.layout) : a,
    editorMetaById: u.editorMetaById ? Rt(u.editorMetaById) : Rt(a.editorMetaById),
    sectionRows: u.sectionRows ? it(u.sectionRows) : it(a.sectionRows),
    selection: u.selection ? Je(u.selection) : Je(a.selection),
    focusId: u.focusId !== void 0 ? u.focusId : a.focusId
  }), _t = (a) => {
    const u = Zt(a), I = u.candidateLayout || u.placementCandidateLayout || u.afterLayout || u.layout;
    return Array.isArray(I) ? le(I.filter(
      (g) => !!g && typeof g == "object" && typeof g.i == "string"
    )) : null;
  }, yo = (a, u, I) => {
    const g = Zt(a);
    let w = _t(a), h = Rt(I.editorMetaById), B = it(I.sectionRows), $ = Je(I.selection), L = I.focusId;
    const Ie = a.type === "delete" || a.type === "section-row-delete" ? "destructive" : rs(a.type) ? "persistence" : a.source === "external" || a.source === "remote" ? "external" : "normal";
    if (!w && a.type === "delete") {
      const N = new Set(u);
      w = E().filter((V) => !N.has(V.i)), u.forEach((V) => {
        delete h[V];
      }), $ = Ge(
        $.selectedIds.filter((V) => !N.has(V)),
        a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
      ), L = ks(w, u, h);
    }
    if (!w && a.type === "move") {
      const N = U(g.dx) ? g.dx : null, V = U(g.dy) ? g.dy : null, oe = U(g.x), ye = U(g.y);
      (N !== null || V !== null || oe || ye) && (w = E().map((T) => u.includes(T.i) ? {
        ...T,
        x: oe && u.length === 1 ? Math.max(0, Math.floor(g.x)) : Math.max(0, Math.floor(T.x + (N || 0))),
        y: ye && u.length === 1 ? Math.max(0, Math.floor(g.y)) : Math.max(0, Math.floor(T.y + (V || 0)))
      } : T));
    }
    if (!w && a.type === "resize") {
      const N = E(), V = u[0], oe = V ? Pe(N, V) : void 0, ye = V ? Xt(V) : void 0, T = ye ? qe(g) : null;
      if (oe && ye && T) {
        const Q = U(g.w) ? g.w : oe.w + (U(g.dw) ? g.dw : 0), pe = U(g.h) ? g.h : oe.h + (U(g.dh) ? g.dh : 0), ce = xo({
          id: `${a.id}:preview-layout`,
          phase: "preview",
          layout: N,
          operation: {
            type: "resize",
            id: V,
            x: U(g.x) ? Math.max(0, Math.floor(g.x)) : void 0,
            y: U(g.y) ? Math.max(0, Math.floor(g.y)) : void 0,
            w: Ne(Q, oe.w),
            h: Ne(pe, oe.h),
            handle: Ds(g.handle) ? g.handle : "se",
            constraint: ye
          },
          options: T
        });
        w = ce.status === "blocked" || ce.status === "error" ? N : ce.layout;
      } else
        w = N.map((Q) => {
          if (Q.i !== V) return Q;
          const pe = U(g.w) ? g.w : Q.w + (U(g.dw) ? g.dw : 0), ce = U(g.h) ? g.h : Q.h + (U(g.dh) ? g.dh : 0);
          return {
            ...Q,
            x: U(g.x) ? Math.max(0, Math.floor(g.x)) : Q.x,
            y: U(g.y) ? Math.max(0, Math.floor(g.y)) : Q.y,
            w: Ne(pe, Q.w),
            h: Ne(ce, Q.h)
          };
        });
    }
    if (!w && a.type === "add") {
      const N = Array.isArray(g.items) ? g.items : g.item ? [g.item] : [], V = new Set(E().map((T) => T.i)), oe = e.idGenerator || rt, ye = N.filter((T) => T && typeof T == "object").map((T, Q) => {
        const pe = T, ce = typeof pe.i == "string" && !V.has(pe.i) ? pe.i : oe(typeof pe.i == "string" ? pe.i : `item-${Q + 1}`, V);
        return V.add(ce), {
          ...pe,
          i: ce,
          x: U(pe.x) ? pe.x : 0,
          y: U(pe.y) ? pe.y : 0,
          w: Ne(pe.w, 1),
          h: Ne(pe.h, 1)
        };
      });
      if (ye.length > 0) {
        const T = gt(
          E(),
          ye,
          String(g.strategy || "first-fit"),
          g
        );
        T.failed || (w = T.layout, h = {
          ...h,
          ...Me(g.editorMetaById, { layout: ye })
        }, $ = Ge(ye.map((Q) => Q.i), "api"), L = $.activeId);
      }
    }
    if (!w && a.type === "paste") {
      const N = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null;
      if (N != null && N.items && Array.isArray(N.items)) {
        const V = {
          version: 2,
          sourceId: typeof N.sourceId == "string" ? N.sourceId : a.id,
          copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
          items: le(N.items),
          editorMetaById: Me(N.editorMetaById),
          source: N.source,
          originalGeometryById: N.originalGeometryById
        }, oe = N.mapped === !0 ? le(V.items) : vo(V, {
          cols: Et(g)
        }).items, ye = N.mapped === !0 ? {
          items: oe,
          metaById: Me(N.editorMetaById, {
            layout: oe
          })
        } : Dt(
          oe,
          Me(N.editorMetaById),
          new Set(E().map((Q) => Q.i)),
          e.idGenerator || rt
        ), T = gt(
          E(),
          ye.items,
          String(g.strategy || e.pasteStrategy || "offset"),
          g
        );
        T.failed || (w = T.layout, h = { ...h, ...ye.metaById }, $ = Ge(ye.items.map((Q) => Q.i), "api"), L = $.activeId);
      }
    }
    if (!w && a.type === "duplicate") {
      const N = u.map((ye) => Pe(E(), ye)).filter(Boolean), V = Dt(
        N,
        h,
        new Set(E().map((ye) => ye.i)),
        e.idGenerator || rt
      ), oe = gt(
        E(),
        V.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      oe.failed || (w = oe.layout, h = { ...h, ...V.metaById }, $ = Ge(V.items.map((ye) => ye.i), "api"), L = $.activeId);
    }
    if (!w && a.type === "align") {
      const N = Rs(E(), g, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: U(g.cols) ? g.cols : 12,
        maxRows: U(g.maxRows) ? g.maxRows : 1 / 0
      });
      N.status !== "blocked" && (w = N.layout);
    }
    if (!w && (a.type === "distribute" || a.type === "tidy")) {
      const N = a.type === "distribute" ? Ps(E(), g, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: U(g.cols) ? g.cols : 12,
        maxRows: U(g.maxRows) ? g.maxRows : 1 / 0
      }) : Es(E(), g, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: U(g.cols) ? g.cols : 12,
        maxRows: U(g.maxRows) ? g.maxRows : 1 / 0
      });
      N.status !== "blocked" && (w = N.layout);
    }
    if (ds(a.type) && u.forEach((N) => {
      const V = a.type === "lock" ? { locked: !0 } : a.type === "unlock" ? { locked: !1 } : a.type === "show" ? { visible: !0 } : { visible: !1 }, oe = ls(h, N, V);
      oe.patch && (h = Tt(h, [oe.patch]));
    }), a.type === "select" ? ($ = ws(E(), v.value, {
      id: typeof g.id == "string" ? g.id : void 0,
      ids: Array.isArray(g.ids) ? g.ids.filter((N) => typeof N == "string") : typeof g.id == "string" ? void 0 : u,
      toggle: g.toggle === !0,
      range: g.range === !0,
      source: a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
    }), L = $.activeId) : a.type === "clearSelection" && ($ = Mo("api"), L = null), cs(a.type)) {
      const N = g, V = Le(B, E()), oe = u.length > 0 ? u : N.id ? [N.id] : [];
      if (oe.filter((T) => !V.items[T]).length === 0) {
        const T = it({
          items: V.items,
          itemMembership: V.itemMembership
        }), Q = _e(V, oe);
        if (a.type === "section-row-collapse" || a.type === "section-row-expand") {
          const ce = a.type === "section-row-collapse";
          oe.forEach((ke) => {
            T.items[ke] = { ...T.items[ke], collapsed: ce };
          }), ce && ($ = Ge(
            $.selectedIds.filter((ke) => !Q.includes(ke)),
            "api"
          ), L = $.activeId);
        } else if (a.type === "section-row-reorder")
          oe.forEach((ce) => {
            T.items[ce] = {
              ...T.items[ce],
              order: st(V, N)
            };
          });
        else if (a.type === "section-row-move") {
          const ce = U(N.dy) ? Math.floor(N.dy) : 0;
          w = (w || E()).map(
            (ke) => Q.includes(ke.i) ? { ...ke, y: Math.max(0, ke.y + ce) } : ke
          ), oe.forEach((ke) => {
            const Se = T.items[ke];
            T.items[ke] = {
              ...Se,
              bounds: Se.bounds ? { ...Se.bounds, y: Math.max(0, Se.bounds.y + ce) } : Se.bounds
            };
          });
        } else a.type === "section-row-delete" && (oe.forEach((ce) => {
          delete T.items[ce];
        }), Object.keys(T.itemMembership || {}).forEach((ce) => {
          var Bt, $t;
          const ke = ((Bt = T.itemMembership) == null ? void 0 : Bt[ce]) || {}, Se = {
            sectionId: ke.sectionId && oe.includes(ke.sectionId) ? void 0 : ke.sectionId,
            rowId: ke.rowId && oe.includes(ke.rowId) ? void 0 : ke.rowId
          };
          !Se.sectionId && !Se.rowId ? ($t = T.itemMembership) == null || delete $t[ce] : T.itemMembership && (T.itemMembership[ce] = Se);
        }), N.deleteItems === !0 && (w = (w || E()).filter((ce) => !Q.includes(ce.i)), Q.forEach((ce) => {
          delete h[ce];
        }), $ = Ge(
          $.selectedIds.filter((ce) => !Q.includes(ce)),
          "api"
        ), L = $.activeId));
        const pe = Le(T, w || E());
        B = {
          version: 1,
          items: pe.items,
          itemMembership: pe.itemMembership
        };
      }
    }
    return As(I, Ve(I, {
      layout: w || void 0,
      editorMetaById: h,
      sectionRows: B,
      selection: $,
      focusId: L
    }), {
      risk: Ie
    });
  }, wt = Kr({
    beforeCommand: e.beforeCommand,
    guardTimeoutMs: e.guardTimeoutMs,
    getSnapshot: he,
    getStateRevision: () => A,
    check: (a) => as(a, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: l.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    }),
    getGuardContext: (a, u, I, g) => {
      const w = Zt(a), h = w.placementSummary && typeof w.placementSummary == "object" ? w.placementSummary : void 0;
      return {
        source: a.source || "api",
        origin: a.origin,
        targetIds: u.allowedIds,
        layout: E(),
        layouts: j(),
        editorMetaById: l.value,
        sectionRows: m.value,
        selection: v.value,
        mode: c.value,
        history: {
          canUndo: !!(q != null && q.canUndo.value),
          canRedo: !!(q != null && q.canRedo.value)
        },
        preview: I,
        placement: h || w.placementSessionId ? {
          sessionId: typeof w.placementSessionId == "string" ? w.placementSessionId : void 0,
          source: typeof w.placementSource == "string" ? w.placementSource : void 0,
          summary: h,
          affectedIds: h == null ? void 0 : h.affectedIds,
          diagnostics: h == null ? void 0 : h.diagnostics
        } : void 0,
        signal: g
      };
    },
    buildPreview: (a, u, I) => yo(a, u.allowedIds, I),
    cleanupInteraction: () => {
      X.value = null, de("command-cleanup");
    },
    finalize: Ye,
    now: zs,
    isStopped: () => x.value,
    onStart: (a) => {
      a.source === "keyboard" && mo(a.type) && (X.value = "keyboardEditing"), S({ type: "command-start", command: a });
    },
    commit: async ({ command: a, check: u, before: I, startedAt: g, guardMs: w }) => {
      try {
        if (rs(a.type)) {
          const B = a.type === "save" ? await je.save() : a.type === "discard" ? je.discard() : je.reset();
          return B.status === "changed" && (ie.value = he(), z.value = !1), Ye(a, { ...B, id: a.id }, g, w);
        }
        if (Bi(a.type)) {
          const B = a.type === "undo" ? q == null ? void 0 : q.undo() : q == null ? void 0 : q.redo();
          return B ? (Ee(a.type === "undo" ? B.before : B.after), Ye(a, xe(a, "changed", {
            affectedIds: B.affectedIds || B.after.selection.selectedIds,
            selection: v.value,
            undo: B,
            diagnostics: {
              durationMs: 0,
              historyMode: "ignore",
              source: a.source,
              origin: a.origin
            }
          }), g, w)) : Ye(a, xe(a, "blocked", {
            blocked: { reason: "missing-item", message: "No editor history entry is available." }
          }), g, w);
        }
        const h = await Yt(a, u.allowedIds, u.blockedIds, I);
        return Ye(a, h, g, w);
      } catch (h) {
        return h instanceof at ? Ye(a, xe(a, "blocked", {
          targetIds: u.targetIds,
          blocked: {
            reason: h.code,
            itemIds: u.targetIds,
            message: h.message
          },
          error: { message: h.message, cause: h }
        }), g, w) : Ye(
          a,
          ns(a, "Editor command failed.", h),
          g,
          w
        );
      }
    }
  }), Fo = (a) => {
    if (x.value || R > 0) return;
    wt.abortPending(a), X.value = null, de(a), A += 1;
    const u = E(), I = ft(l.value, u);
    Ke(I, l.value) || (l.value = I);
    const g = Ze(
      v.value,
      u,
      l.value,
      "external"
    );
    v.value = g, D.value = g.activeId, q == null || q.replacePresent(he(), { preserveRedoStack: !0 });
  };
  e.layout && P.push(yt(r, () => {
    Fo("external-layout");
  }, { deep: !0, flush: "sync" })), e.layouts && P.push(yt(n, () => {
    Fo("external-layouts");
  }, { deep: !0, flush: "sync" }));
  const ut = async (a) => wt.execute(a), ui = (a) => {
    var h;
    const u = so(a.type), I = Fs({
      source: u.defaultSource,
      ...a,
      history: a.history || u.defaultHistory
    }), g = as(I, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: l.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    });
    if (g.result) return g.result;
    const w = (h = u.validatePayload) == null ? void 0 : h.call(u, I);
    return w && !w.ok ? to(I, "invalid-input", {
      targetIds: g.targetIds,
      blocked: {
        reason: "invalid-input",
        itemIds: g.targetIds,
        message: w.message
      }
    }) : xe(I, "noop", {
      targetIds: g.allowedIds
    });
  }, fi = async (a) => {
    var B, $, L, Ie, N, V, oe;
    const u = a.commandType || (a.source === "paste" ? "paste" : "add");
    if (f)
      return te(u, "editor-mode-missing", "Editor mode is not configured.");
    if (c.value === "view")
      return te(u, "mode-readonly", "Placement requires edit mode.");
    if (x.value)
      return te(u, "unsupported-scope", "Editor controller is stopped.");
    if (X.value)
      return te(u, "unsupported-scope", `Cannot start placement while ${X.value}.`);
    if (k.value)
      return te(u, "command-pending", "A placement session is already active.");
    let I = {
      ...a,
      commandType: u
    };
    const g = qe({
      cols: a.cols,
      maxRows: a.maxRows,
      compactType: a.compactType,
      allowOverlap: a.allowOverlap,
      preventCollision: a.preventCollision
    });
    if (a.source === "paste" || u === "paste") {
      const ye = H();
      let T = null, Q = null;
      try {
        T = await ye.read();
      } catch (Se) {
        Q = Se;
      }
      if ((!T || Q) && ye !== mt)
        try {
          T = await mt.read();
        } catch (Se) {
          Q || (Q = Se);
        }
      if (!T && Q) {
        const Se = Q instanceof at ? Q.code : "clipboard-invalid";
        return te(
          "paste",
          Se,
          Q instanceof Error ? Q.message : "Clipboard could not be read."
        );
      }
      if (!T || T.items.length === 0)
        return te(
          "paste",
          "clipboard-unavailable",
          "Clipboard is empty or unavailable."
        );
      const pe = vo(T, {
        cols: (B = a.cols) != null ? B : g == null ? void 0 : g.cols
      }), ce = Dt(
        pe.items,
        T.editorMetaById,
        new Set(E().map((Se) => Se.i)),
        e.idGenerator || rt
      ), ke = {
        items: ce.items,
        editorMetaById: ce.metaById,
        sourceId: T.sourceId,
        source: T.version === 2 ? T.source : void 0,
        originalGeometryById: T.version === 2 ? T.originalGeometryById : void 0,
        responsive: {
          scaled: pe.scaled,
          sourceCols: pe.sourceCols,
          targetCols: pe.targetCols
        },
        mapped: !0
      };
      I = {
        ...I,
        commandType: "paste",
        items: ce.items,
        editorMetaById: ce.metaById,
        resolvedClipboardPayload: ke
      };
    } else
      I = Ce(I);
    const w = {
      ...I,
      compactType: ($ = I.compactType) != null ? $ : g == null ? void 0 : g.compactType,
      allowOverlap: (L = I.allowOverlap) != null ? L : g == null ? void 0 : g.allowOverlap,
      preventCollision: (Ie = I.preventCollision) != null ? Ie : g == null ? void 0 : g.preventCollision
    }, h = mn(w, {
      baseLayout: E(),
      baseRevision: A,
      defaultStrategy: w.strategy || (u === "paste" ? e.pasteStrategy || "offset" : "first-fit"),
      cols: w.cols,
      maxRows: w.maxRows
    });
    return h.items.length === 0 || h.blocked && h.ghostItems.length === 0 ? te(
      u,
      ((N = h.blocked) == null ? void 0 : N.reason) || "invalid-input",
      ((V = h.blocked) == null ? void 0 : V.message) || "No items were provided for placement.",
      (oe = h.blocked) == null ? void 0 : oe.itemIds,
      J(h)
    ) : (k.value = h, S({ type: "placement-start", session: h }), {
      status: h.blocked ? "blocked" : "started",
      session: h,
      blocked: h.blocked ? {
        reason: h.blocked.reason,
        itemIds: h.blocked.itemIds,
        message: h.blocked.message
      } : void 0,
      diagnostics: J(h)
    });
  }, yi = (a) => {
    const u = k.value;
    if (!u)
      return { status: "noop" };
    const I = Eo(u, a);
    return k.value = I, S({ type: "placement-update", session: I }), {
      status: I.blocked ? "blocked" : "updated",
      session: I,
      blocked: I.blocked ? {
        reason: I.blocked.reason,
        itemIds: I.blocked.itemIds,
        message: I.blocked.message
      } : void 0,
      diagnostics: J(I)
    };
  }, pi = (a = "cancelled") => {
    const u = k.value;
    if (!u) return { status: "noop" };
    const I = gn(u, a);
    return de(a), I;
  }, mi = (a) => {
    var I;
    const u = (I = a.blocked) == null ? void 0 : I.reason;
    return a.status === "blocked" && (u === "bounds" || u === "collision" || u === "maxRows" || u === "section-row-policy" || u === "invalid-input");
  }, hi = async (a = {}) => {
    var h, B, $, L, Ie, N, V, oe, ye;
    const u = k.value;
    if (!u)
      return xe({
        id: `placement-commit:noop:${Date.now()}`,
        type: "add"
      }, "noop");
    if (!u.candidateLayout || u.blocked) {
      const T = xe({
        id: `placement-commit:blocked:${u.id}`,
        type: u.commandType
      }, "blocked", {
        targetIds: u.items.map((Q) => Q.i),
        blocked: {
          reason: ((h = u.blocked) == null ? void 0 : h.reason) || "invalid-input",
          itemIds: ((B = u.blocked) == null ? void 0 : B.itemIds) || u.items.map((Q) => Q.i),
          message: (($ = u.blocked) == null ? void 0 : $.message) || "Placement does not have a valid candidate."
        },
        diagnostics: J(u)
      });
      return F.value = T, T;
    }
    if (A !== u.baseRevision) {
      const T = J(u) || { durationMs: 0 }, Q = xe({
        id: `placement-commit:stale:${u.id}`,
        type: u.commandType
      }, "blocked", {
        targetIds: u.items.map((pe) => pe.i),
        blocked: {
          reason: "stale-command",
          itemIds: u.items.map((pe) => pe.i),
          message: "Placement base layout changed before commit."
        },
        diagnostics: {
          ...T,
          durationMs: T.durationMs || 0,
          stale: !0,
          stateRevision: A
        }
      });
      return F.value = Q, de("stale-command"), Q;
    }
    const I = {
      ...u,
      phase: "committing",
      ghostItems: u.ghostItems.map((T) => ({ ...T, state: "committing" }))
    };
    k.value = I;
    const g = hn(I, a), w = await ut(g);
    if (S({ type: "placement-commit", sessionId: I.id, result: w }), w.status === "changed" || w.status === "noop" || (a == null ? void 0 : a.autoCancelOnBlocked) === !0 || !mi(w))
      de(w.status);
    else {
      const T = Eo(u, {});
      k.value = {
        ...T,
        blocked: {
          reason: ((L = w.blocked) == null ? void 0 : L.reason) || ((Ie = T.blocked) == null ? void 0 : Ie.reason) || "invalid-input",
          itemIds: ((N = w.blocked) == null ? void 0 : N.itemIds) || ((V = T.blocked) == null ? void 0 : V.itemIds),
          message: ((oe = w.blocked) == null ? void 0 : oe.message) || ((ye = T.blocked) == null ? void 0 : ye.message),
          recoverable: !0
        },
        phase: "blocked"
      };
    }
    return w;
  }, Ho = (a) => Ot(a, "ignore"), No = (a) => {
    var u;
    if (q) {
      if (a.mode === "clear") {
        q.clear(he());
        return;
      }
      if (a.mode === "replace") {
        q.replacePresent(he(), {
          preserveRedoStack: a.preserveRedoStack
        });
        return;
      }
      q.replacePresent(he(), {
        preserveRedoStack: (u = a.preserveRedoStack) != null ? u : !0
      });
    }
  }, gi = (a, u = "external", I = {}) => {
    const g = Ho(I.history);
    wt.abortPending(I.origin || u), X.value = null, W(a), A += 1, l.value = ft(l.value, a), ot(Ze(v.value, a, l.value, "external")), No(g), S({
      type: "editor-state-change",
      state: Ae.value,
      reason: I.origin || u
    });
  }, vi = (a, u, I = "external", g = {}) => {
    const w = Ho(g.history);
    wt.abortPending(g.origin || I), X.value = null, me(a, u);
    const h = a[u] || [];
    A += 1, l.value = ft(l.value, h), ot(Ze(v.value, h, l.value, "external")), No(w), S({
      type: "editor-state-change",
      state: Ae.value,
      reason: g.origin || I
    });
  };
  f && S({
    type: "editor-error",
    code: "editor-mode-missing",
    message: "Grid editor was enabled without mode or defaultMode; falling back to view."
  });
  let jo = E();
  P.push(yt(c, (a, u) => {
    a !== u && (a === "view" && X.value ? (X.value = null, W(jo)) : jo = E(), a === "view" && (M.value = { ...bo }, de("mode-readonly")), S({ type: "mode-change", from: u, to: a, source: "external" }));
  })), P.push(yt(() => Ae.value, (a, u) => {
    a !== u && S({
      type: "editor-state-change",
      state: a,
      previous: u,
      reason: "derived-state"
    });
  })), e.selectedIds && P.push(yt(e.selectedIds, (a) => {
    wt.abortPending("external-selection"), A += 1, v.value = Ze(
      Ge(a, "external"),
      E(),
      l.value,
      "external"
    ), D.value = v.value.activeId, q == null || q.replacePresent(he(), { preserveRedoStack: !0 });
  }, { flush: "sync" })), P.push(yt(l, (a) => {
    const u = Me(a, { layout: E() });
    Ke(u, a) || (l.value = u);
  }, { deep: !0 })), P.push(yt(m, (a) => {
    const u = Le(a, E()), I = {
      version: 1,
      items: u.items,
      itemMembership: u.itemMembership
    };
    Ke(I, a) || (m.value = I);
    const g = v.value.selectedIds.filter((w) => {
      const h = u.itemMembership[w], B = h != null && h.sectionId ? u.items[h.sectionId] : void 0, $ = h != null && h.rowId ? u.items[h.rowId] : void 0;
      return (B == null ? void 0 : B.collapsed) || ($ == null ? void 0 : $.collapsed);
    });
    g.length > 0 && ot(Ge(
      v.value.selectedIds.filter((w) => !g.includes(w)),
      "api"
    ));
  }, { deep: !0 }));
  const Ko = {
    mode: c,
    state: Ae,
    selection: v,
    editorMetaById: l,
    sectionRows: m,
    placementSession: k,
    dirty: ne,
    conflict: C,
    guides: M,
    lastResult: F,
    execute: ut,
    canExecute: ui,
    beginPlacement: fi,
    updatePlacement: yi,
    commitPlacement: hi,
    cancelPlacement: pi,
    getToolbarState: () => xn(Ko),
    undo: () => ut({ type: "undo", source: "api" }),
    redo: () => ut({ type: "redo", source: "api" }),
    save: () => ut({ type: "save", source: "api" }),
    discard: () => ut({ type: "discard", source: "api" }),
    reset: () => ut({ type: "reset", source: "api" }),
    setExternalLayout: gi,
    setExternalLayouts: vi,
    stop() {
      x.value || (x.value = !0, wt.abortPending("editor-stop"), de("editor-stop"), P.forEach((a) => a()), Fe == null || Fe.stop());
    }
  };
  return Ko;
}, ta = di, Rn = (e) => !!(e && typeof e == "object" && "getBoundingClientRect" in e), Pn = (e, t) => {
  const o = Rn(e.currentTarget) ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, s = t.transformScale || 1, r = (e.clientX - o.left) / s, n = (e.clientY - o.top) / s, i = t.itemSize || { w: 1, h: 1 }, f = {
    cols: t.cols,
    margin: t.margin,
    maxRows: t.maxRows,
    rowHeight: t.rowHeight,
    containerWidth: t.width || 0,
    containerPadding: t.containerPadding || t.margin
  }, d = Ai(f, n, r, i.w, i.h);
  return {
    x: d.x,
    y: d.y,
    source: "pointer",
    clientX: e.clientX,
    clientY: e.clientY
  };
};
function En({
  controller: e,
  getGeometry: t,
  stopEvent: o
}) {
  const s = () => !!(e != null && e.placementSession.value), r = () => {
    var y;
    const d = e == null ? void 0 : e.placementSession.value, c = ((y = d == null ? void 0 : d.ghostItems[0]) == null ? void 0 : y.item) || (d == null ? void 0 : d.items[0]);
    return c ? { w: c.w, h: c.h } : { w: 1, h: 1 };
  };
  return {
    isActive: s,
    onPointerMove: (d) => {
      if (!(e != null && e.placementSession.value)) return;
      const c = t(), y = Pn(d, {
        ...c,
        itemSize: r()
      });
      e.updatePlacement({
        cursor: y,
        compactType: c.compactType,
        allowOverlap: c.allowOverlap,
        preventCollision: c.preventCollision
      });
    },
    onClick: (d) => e != null && e.placementSession.value ? (o == null || o(d), e.commitPlacement({ source: "pointer" }), !0) : !1,
    cancel: (d) => {
      e != null && e.placementSession.value && e.cancelPlacement(d);
    }
  };
}
const Jt = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Bn = () => ({
  activeId: null,
  guides: [],
  displayGuides: [],
  debugGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}), li = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), Ls = (e) => !!(e && typeof e == "object" && !li(e)), $n = (e) => typeof e == "function" ? { ...e() || {} } : { ...e || {} }, Gn = (e, t, o) => ({
  id: e,
  status: "blocked",
  layout: t,
  patches: [],
  affectedIds: [],
  collisions: [],
  blocked: {
    reason: "unsupported",
    itemIds: o.type === "groupMove" ? o.ids : "id" in o ? [o.id] : []
  },
  diagnostics: {
    operationId: e,
    operationType: o.type,
    phase: "commit",
    layoutSize: t.length,
    affectedCount: 0,
    collisionCount: 0,
    indexHit: !1,
    executorKind: "main-thread",
    durationMs: 0
  }
});
function An({
  props: e,
  layoutRef: t,
  persistenceController: o,
  engineBridge: s,
  getLayout: r,
  getOldDragItem: n,
  getOldResizeItem: i,
  isDropping: f,
  getInteractionState: d
}) {
  const c = e.editor && typeof e.editor == "object" ? e.editor : null, y = (c == null ? void 0 : c.layoutOperationRunner) || ((b) => {
    const G = `${b.commandId}:layout`;
    return s.isLegacyLayoutEngine() ? Gn(G, b.layout, b.operation) : xo({
      id: G,
      phase: b.phase,
      layout: b.layout,
      operation: b.operation,
      options: s.getLayoutEngineOptions()
    });
  }), l = o || e.persistence || (c == null ? void 0 : c.persistence);
  let p = null;
  const m = c && li(l) ? l : c && Ls(l) ? Gi({
    ...l,
    kind: "layout",
    target: t,
    watchTarget: !1,
    meta: () => ({
      ...$n(l.meta),
      editor: no(
        (p == null ? void 0 : p.editorMetaById.value) || {},
        p == null ? void 0 : p.sectionRows.value
      )
    }),
    onEvent: (b) => {
      var G;
      if (b.type === "load-success" || b.type === "external-apply") {
        const H = io(b.document);
        H.ok && H.envelope && p && (p.editorMetaById.value = H.envelope.editorMetaById, H.envelope.sectionRows && (p.sectionRows.value = H.envelope.sectionRows)), p == null || p.setExternalLayout(b.value, b.type);
      }
      (G = l.onEvent) == null || G.call(l, b);
    }
  }) : null, v = !!(c && m && Ls(l));
  p = c ? c.controller || di({
    ...c,
    kind: "layout",
    layout: t,
    layoutOperationRunner: y,
    itemCapabilities: e.itemCapabilities,
    resizeConstraints: e.resizeConstraints,
    persistence: m || c.persistence
  }) : null;
  let C = null, M = null;
  const k = En({
    controller: p,
    getGeometry: () => ({
      width: e.width || 0,
      cols: e.cols,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      containerPadding: e.containerPadding || e.margin,
      transformScale: e.transformScale || 1,
      compactType: is(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision
    }),
    stopEvent: (b) => {
      b.preventDefault(), b.stopPropagation();
    }
  }), F = () => !!p, X = () => !!(p && p.mode.value === "view"), z = () => !!(p && p.mode.value === "edit"), ae = () => (p == null ? void 0 : p.editorMetaById.value) || {}, D = () => !!(p && (c == null ? void 0 : c.guides) !== !1), x = (b) => {
    var G;
    return (G = e.itemCapabilities) == null ? void 0 : G[b];
  }, P = (b) => {
    var G;
    return (G = e.resizeConstraints) == null ? void 0 : G[b];
  }, A = (b) => !!(x(b) || P(b)), R = () => {
    M = null;
  }, O = () => {
    p && (R(), p.guides.value = Bn());
  }, S = (b) => {
    const G = d();
    return (G == null ? void 0 : G.activeResizeId) === b ? "resize" : f() ? "drop" : (G == null ? void 0 : G.activeDragId) === b ? "drag" : "api";
  }, E = (b) => {
    const G = d(), H = (G == null ? void 0 : G.activeResizeId) === b ? i() : (G == null ? void 0 : G.activeDragId) === b ? n() : null;
    return H ? { [b]: Jt(H) } : void 0;
  }, W = (b, G, H) => {
    var te;
    const ee = d(), J = b === "drag" && (ee != null && ee.dragBlocked) ? {
      reason: ee.dragBlockedReason || "collision",
      itemIds: (te = ee.dragBlockedItemIds) != null && te.length ? ee.dragBlockedItemIds : G ? [G] : void 0,
      message: ee.dragBlockedMessage || void 0
    } : b === "resize" && (ee != null && ee.resizeBlocked) ? { reason: "collision", itemIds: G ? [G] : void 0 } : void 0;
    return {
      ...c != null && c.guides && typeof c.guides == "object" ? c.guides : {},
      interaction: b,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      startGeometry: G ? E(G) : void 0,
      resizeHandle: H,
      selectionCount: (p == null ? void 0 : p.selection.value.selectedIds.length) || 0,
      blocked: J
    };
  }, j = (b, G, H, ee) => {
    var de, De;
    if (!p || !c || c.guides === !1) return null;
    const J = S(b), te = W(J, b, ee), Ce = Go({
      layout: r(),
      activeItem: G,
      candidateItem: H,
      selectionIds: p.selection.value.selectedIds,
      metaById: ae(),
      sectionRows: p.sectionRows.value,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      compactType: is(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      interaction: J,
      startGeometry: te.startGeometry,
      options: te
    });
    return p.guides.value = Ce.guideState, (de = c.onEvent) == null || de.call(c, {
      type: "guide-change",
      guides: p.guides.value.guides,
      activeId: b
    }), (De = c.onEvent) == null || De.call(c, {
      type: "intelligence-change",
      activeId: b,
      diagnostics: Ce.diagnostics
    }), { intelligence: Ce, options: te };
  }, me = (b, G, H, ee, J) => {
    var De;
    const te = j(b, G, H, J);
    if (!te) return H;
    const Ce = M == null ? void 0 : M.nextGuideId, de = Er(te.intelligence, H, {
      snap: te.options.snap,
      layout: ee || r(),
      cols: e.cols,
      maxRows: e.maxRows,
      allowOverlap: e.allowOverlap,
      metaById: ae(),
      previousGuideId: Ce
    });
    return (de.status === "snapped" || Ce !== de.nextGuideId) && ((De = c == null ? void 0 : c.onEvent) == null || De.call(c, {
      type: "snap-change",
      activeId: b,
      previousGuideId: Ce,
      nextGuideId: de.nextGuideId,
      snapKind: de.snapKind,
      geometry: de.geometry
    })), M = de, de.status !== "snapped" ? H : {
      ...H,
      ...de.geometry
    };
  }, he = (b, G, H) => H != null && H.locked || G != null && G.locked ? "locked" : (H == null ? void 0 : H.visible) === !1 || (G == null ? void 0 : G.visible) === !1 ? "hidden" : H != null && H.static || b.static ? "static-item" : "capability", Ee = (b, G, H) => {
    if (b)
      return {
        ...b,
        aspectRatio: b.aspectRatio ? {
          ...b.aspectRatio,
          metrics: b.aspectRatio.metrics || G,
          startGeometry: b.aspectRatio.startGeometry || H
        } : void 0
      };
  }, ie = (b, G, H) => {
    var Ce;
    const ee = x(b.i), J = P(b.i);
    if (ee) {
      const de = Jt(i() || b);
      return {
        ...ee,
        resizeConstraint: Ee(
          J ? {
            ...ee.resizeConstraint,
            aspectRatio: J,
            handlePolicy: ((Ce = ee.resizeConstraint) == null ? void 0 : Ce.handlePolicy) || {
              allowedHandles: ee.resizeHandles,
              blockedReason: "handle-disabled"
            }
          } : ee.resizeConstraint,
          H,
          de
        )
      };
    }
    const te = Qt(b, ae()[b.i], G);
    return {
      id: te.id,
      visible: te.visible,
      editable: te.editable,
      draggable: te.draggable,
      resizable: te.resizable,
      bounded: te.bounded,
      static: te.source.layoutStatic === !0,
      locked: te.locked,
      resizeHandles: te.resizeHandles || [],
      deletable: te.deletable,
      duplicatable: te.duplicatable,
      copyable: te.copyable,
      resizeConstraint: J || te.resizeHandles ? {
        handlePolicy: te.resizeHandles ? {
          allowedHandles: te.resizeHandles,
          blockedReason: "handle-disabled"
        } : void 0,
        aspectRatio: J
      } : void 0,
      sources: te.source.capabilitySources || {},
      sourceLists: {},
      diagnostics: te.diagnostics || []
    };
  }, q = (b) => {
    var te, Ce;
    const G = A(b.id);
    if (!p && !G)
      return { kind: "allowed", candidate: b.rawCandidate };
    if (p && !z())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [b.id],
        message: "Resize is disabled outside edit mode."
      };
    const H = ie(
      b.item,
      { isDraggable: !0, isResizable: !0, isBounded: !0 },
      b.metrics
    );
    if (!H || !H.resizable)
      return {
        kind: "blocked",
        reason: he(b.item, ae()[b.id], H),
        ids: [b.id],
        diagnostics: H == null ? void 0 : H.diagnostics
      };
    const ee = Ee(
      H.resizeConstraint,
      b.metrics,
      Jt(i() || b.item)
    ), J = (te = ee == null ? void 0 : ee.handlePolicy) == null ? void 0 : te.allowedHandles;
    if (J && J.indexOf(b.handle) === -1)
      return {
        kind: "blocked",
        reason: "handle-disabled",
        ids: [b.id],
        message: "Resize handle is disabled by item capability policy.",
        diagnostics: H.diagnostics
      };
    if ((Ce = ee == null ? void 0 : ee.aspectRatio) != null && Ce.enabled) {
      const de = Ci({
        startItem: {
          ...b.item,
          ...Jt(i() || b.item)
        },
        rawCandidate: b.rawCandidate,
        handle: b.handle,
        constraint: ee.aspectRatio,
        bounds: {
          cols: e.cols,
          maxRows: e.maxRows,
          minW: b.item.minW,
          minH: b.item.minH,
          maxW: b.item.maxW,
          maxH: b.item.maxH
        }
      });
      return de.kind === "blocked" ? {
        kind: "blocked",
        reason: de.reason,
        ids: [b.id],
        diagnostics: de.diagnostics
      } : {
        kind: "allowed",
        candidate: de.candidate,
        constraint: ee,
        diagnostics: de.diagnostics
      };
    }
    return {
      kind: "allowed",
      candidate: b.rawCandidate,
      constraint: ee,
      diagnostics: H.diagnostics
    };
  }, ne = (b) => {
    if (!p) return { kind: "single", id: b.id };
    if (!z())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [b.id],
        activeId: b.id
      };
    const G = ae();
    if (!Qt(
      b.item,
      G[b.id],
      { isDraggable: !0, isResizable: !0, isBounded: !0 }
    ).draggable)
      return {
        kind: "blocked",
        reason: he(b.item, G[b.id]),
        ids: [b.id],
        activeId: b.id
      };
    const J = p.selection.value.selectedIds.filter(Boolean), te = typeof MouseEvent != "undefined" && b.event instanceof MouseEvent && (b.event.metaKey || b.event.ctrlKey || b.event.shiftKey);
    if (!(J.length > 1 && J.includes(b.id)))
      return !J.includes(b.id) && !te && p.execute({
        type: "select",
        targetIds: [b.id],
        payload: { id: b.id },
        source: "pointer",
        history: { skip: !0 }
      }), { kind: "single", id: b.id };
    const de = [], De = [];
    let Qe = "capability";
    return J.forEach((_e) => {
      const st = Pe(b.layout, _e);
      if (!st) {
        De.push(_e), Qe = "missing-item";
        return;
      }
      Qt(
        st,
        G[_e],
        { isDraggable: !0, isResizable: !0, isBounded: !0 }
      ).draggable ? de.push(_e) : (De.push(_e), Qe = he(st, G[_e]));
    }), De.length > 0 && (c == null ? void 0 : c.commandPolicy) !== "skip-blocked" ? {
      kind: "blocked",
      reason: Qe,
      ids: De,
      activeId: b.id
    } : b.legacyLayoutEngine ? {
      kind: "blocked",
      reason: "unsupported",
      ids: de,
      activeId: b.id
    } : de.length === 0 ? {
      kind: "blocked",
      reason: Qe,
      ids: De.length > 0 ? De : [b.id],
      activeId: b.id
    } : {
      kind: "group",
      activeId: b.id,
      ids: de
    };
  }, Ae = (b) => {
    var ee;
    if (!p) return;
    const G = {
      id: `pointer-move-blocked:${b.activeId || b.ids[0] || "layout"}:${Date.now()}`,
      type: "move",
      targetIds: b.ids,
      source: "pointer"
    }, H = xe(G, "blocked", {
      targetIds: b.ids,
      blocked: {
        reason: b.reason,
        itemIds: b.ids,
        message: b.message || `Pointer move blocked by ${b.reason}.`
      },
      diagnostics: b.operationResult ? {
        durationMs: 0,
        layoutDiagnostics: b.operationResult.diagnostics,
        operationResult: b.operationResult
      } : void 0
    });
    p.lastResult.value = H, (ee = c == null ? void 0 : c.onEvent) == null || ee.call(c, { type: "command-blocked", command: G, result: H });
  }, Fe = (b) => {
    t.value = le(b);
  }, je = (b) => {
    (b == null ? void 0 : b.status) === "changed" && (m == null || m.commit(t.value, { source: "component" }));
  }, ot = async (b) => {
    if (!p) return null;
    Fe(b.beforeLayout);
    const G = await p.execute({
      type: "move",
      targetIds: b.ids,
      source: b.source || "pointer",
      payload: {
        activeId: b.activeId,
        candidateLayout: b.afterLayout,
        cols: e.cols,
        maxRows: e.maxRows,
        compactType: e.compactType,
        allowOverlap: e.allowOverlap,
        preventCollision: e.preventCollision
      }
    });
    return je(G), G;
  }, Ye = async (b) => {
    if (!p) return null;
    Fe(b.beforeLayout);
    const G = await p.execute({
      type: "resize",
      targetIds: [b.id],
      source: "pointer",
      payload: {
        handle: b.handle,
        candidateLayout: b.afterLayout,
        cols: e.cols,
        maxRows: e.maxRows,
        compactType: e.compactType,
        allowOverlap: e.allowOverlap,
        preventCollision: e.preventCollision
      }
    });
    return je(G), G;
  }, bt = async (b) => {
    if (!p) return null;
    Fe(b.beforeLayout);
    const G = await p.execute({
      type: "add",
      targetIds: [b.id],
      source: "drop",
      payload: {
        item: b.item,
        candidateLayout: b.afterLayout,
        cols: e.cols,
        maxRows: e.maxRows,
        compactType: e.compactType,
        allowOverlap: e.allowOverlap,
        preventCollision: e.preventCollision
      }
    });
    return je(G), G;
  }, It = (b) => {
    Fe(b), O();
  }, xt = (b, G = "push") => {
    const H = c == null ? void 0 : c.legacyHistoryStore;
    H && (G === "replace" ? H.replacePresent(b) : H.push(b));
  }, lt = (b, G) => {
    !p || !z() || p.execute({
      type: "select",
      targetIds: [b],
      payload: {
        id: b,
        toggle: G.metaKey || G.ctrlKey,
        range: G.shiftKey
      },
      source: "pointer"
    });
  }, ge = (b) => {
    const G = p == null ? void 0 : p.placementSession.value;
    if (!G || G.collisionPolicy !== "layout" || G.blocked || !G.candidateLayout || G.phase === "starting" || G.ghostItems.some((ee) => ee.id === b.i)) return null;
    const H = Pe(G.candidateLayout, b.i);
    return !H || H.x === b.x && H.y === b.y && H.w === b.w && H.h === b.h ? null : H;
  }, qe = (b, G, H) => {
    const ee = ae()[b.i], J = p || A(b.i) ? ie(b, G) : null, te = typeof b.isDraggable == "boolean" ? b.isDraggable : !b.static && G.isDraggable, Ce = typeof b.isResizable == "boolean" ? b.isResizable : !b.static && G.isResizable, de = !((J == null ? void 0 : J.visible) === !1 && !H), De = X() || !!(p && !(J != null && J.editable)), Qe = J ? (p ? z() : te) && J.draggable : te, _e = J ? (p ? z() : Ce) && J.resizable : Ce, st = Qe && (J ? J.bounded : G.isBounded && b.isBounded !== !1), Yt = (p == null ? void 0 : p.selection.value.selectedIds.includes(b.i)) || !1, fo = (p == null ? void 0 : p.selection.value.activeId) === b.i, Ve = ge(b), _t = p ? nt({
      "editor-selected": Yt,
      "editor-active": fo,
      "editor-locked": J == null ? void 0 : J.locked,
      "editor-hidden": (ee == null ? void 0 : ee.visible) === !1,
      "editor-readonly": De,
      "editor-keyboard-editing": p.state.value === "keyboardEditing",
      "editor-drop-target": H,
      "editor-placement-reflowed": !!Ve
    }) : void 0;
    return {
      visible: de,
      draggable: Qe,
      resizable: _e,
      bounded: st,
      resizeHandles: J == null ? void 0 : J.resizeHandles,
      capabilityDiagnostics: J == null ? void 0 : J.diagnostics,
      className: _t,
      previewItem: Ve,
      onClick: p ? (yo) => lt(b.i, yo) : void 0
    };
  }, Et = (b) => {
    k.onClick(b) || b.target === b.currentTarget && p && z() && p.execute({ type: "clearSelection", source: "pointer" });
  }, uo = (b) => {
    k.onPointerMove(b);
  }, Kt = () => {
    p && (c == null ? void 0 : c.keyboard) !== !1 && (C = Ki(
      p,
      typeof (c == null ? void 0 : c.keyboard) == "object" ? c.keyboard : {}
    )), v && (m == null || m.load().then((b) => {
      b.value && b.fallbackApplied && (p == null || p.setExternalLayout(b.value, "persistence-fallback"));
    }));
  }, Xt = () => {
    C == null || C(), C = null, k.cancel("runtime-stop"), c != null && c.controller ? v && (m == null || m.stop()) : p == null || p.stop();
  };
  return {
    config: c,
    controller: p,
    isEnabled: F,
    isViewMode: X,
    isEditMode: z,
    guidesEnabled: D,
    getMetaById: ae,
    clearGuides: O,
    resetSnap: R,
    snapCandidate: me,
    updateIntelligence: j,
    resolveMoveDrag: ne,
    resolveResizeIntent: q,
    notifyMoveBlocked: Ae,
    commitMove: ot,
    commitResize: Ye,
    commitDrop: bt,
    rollbackInteraction: It,
    syncHistory: xt,
    getItemRenderState: qe,
    isPlacementActive: k.isActive,
    onRootPointerMove: uo,
    onRootClick: Et,
    mount: Kt,
    stop: Xt
  };
}
function zn({
  width: e,
  margin: t,
  containerPadding: o,
  rowHeight: s,
  renderPrecision: r = "integer",
  cols: n,
  maxRows: i
}) {
  const f = o, d = zi({
    cols: n,
    containerPadding: f,
    containerWidth: e,
    margin: t
  }), c = (R) => Ti(R, r), y = (R) => c(f[0] + R * (d + t[0])), l = (R) => c(f[1] + R * (s + t[1])), p = (R) => c(f[0] + R * (d + t[0]) - t[0] / 2), m = (R) => c(f[1] + R * (s + t[1]) - t[1] / 2), v = (R) => c(y(R) - t[0]), C = (R) => c(l(R) - t[1]);
  return {
    padding: f,
    colWidth: d,
    gridLineXPx: y,
    gridLineYPx: l,
    guideXPx: (R) => R.kind === "right" ? v(R.position) : R.kind === "center-x" ? p(R.position) : y(R.position),
    guideYPx: (R) => R.kind === "bottom" ? C(R.position) : R.kind === "center-y" ? m(R.position) : l(R.position),
    spanXPx: (R, O) => ({
      start: y(R),
      end: v(O)
    }),
    spanYPx: (R, O) => ({
      start: l(R),
      end: C(O)
    }),
    spacingXPx: (R, O) => ({
      start: v(R),
      end: y(O)
    }),
    spacingYPx: (R, O) => ({
      start: C(R),
      end: l(O)
    }),
    itemLeftPx: (R) => c(f[0] + R * (d + t[0])),
    itemTopPx: (R) => c(f[1] + R * (s + t[1])),
    itemWidthPx: (R) => c(Math.max(0, R * d + Math.max(0, R - 1) * t[0])),
    itemHeightPx: (R) => c(Math.max(0, R * s + Math.max(0, R - 1) * t[1]))
  };
}
function Tn({
  enabled: e,
  geometry: t,
  guideState: o,
  placementSession: s,
  itemMap: r,
  layout: n
}) {
  if (!e) return [];
  const {
    guideXPx: i,
    guideYPx: f,
    spanXPx: d,
    spanYPx: c,
    spacingXPx: y,
    spacingYPx: l,
    itemLeftPx: p,
    itemTopPx: m,
    itemWidthPx: v,
    itemHeightPx: C
  } = t, M = () => {
    var O;
    if (!o) return [];
    const x = o.displayGuides || o.guides, P = (S) => {
      const E = S.display;
      if ((E == null ? void 0 : E.kind) === "spacing" && S.kind === "spacing-x") {
        const j = y(E.start, E.end);
        return {
          left: `${j.start}px`,
          top: `${f(S)}px`,
          width: `${Math.max(1, j.end - j.start)}px`
        };
      }
      if ((E == null ? void 0 : E.kind) === "spacing" && S.kind === "spacing-y") {
        const j = l(E.start, E.end);
        return {
          left: `${i(S)}px`,
          top: `${j.start}px`,
          height: `${Math.max(1, j.end - j.start)}px`
        };
      }
      if (S.axis === "x") {
        const j = E ? c(E.start, E.end) : null;
        return E ? {
          left: `${i(S)}px`,
          top: `${(j == null ? void 0 : j.start) || 0}px`,
          height: `${Math.max(1, ((j == null ? void 0 : j.end) || 0) - ((j == null ? void 0 : j.start) || 0))}px`
        } : {
          left: `${i(S)}px`,
          top: 0,
          bottom: 0
        };
      }
      const W = E ? d(E.start, E.end) : null;
      return E ? {
        top: `${f(S)}px`,
        left: `${(W == null ? void 0 : W.start) || 0}px`,
        width: `${Math.max(1, ((W == null ? void 0 : W.end) || 0) - ((W == null ? void 0 : W.start) || 0))}px`
      } : {
        top: `${f(S)}px`,
        left: 0,
        right: 0
      };
    }, A = (S, E = !1) => {
      var ie, q;
      const W = o.snappedGuideIds.includes(S.id) || S.isSnapped === !0, j = S.kind === "spacing-x" || S.kind === "spacing-y", me = typeof S.proximity == "number" ? S.proximity : W ? 1 : 0.4, he = W ? 1 : Math.max(0.18, 0.18 + me * 0.62), Ee = {
        ...P(S)
      };
      return !E && !W && (Ee.opacity = String(Math.round(he * 100) / 100)), Oe("div", {
        key: `${E ? "debug-" : ""}${S.id}`,
        class: nt(E ? "vue-grid-editor-debug-guide" : "vue-grid-editor-guide", `vue-grid-editor-guide-${S.axis}`, {
          "vue-grid-editor-guide-active": W,
          "vue-grid-editor-guide-snapped": W,
          "vue-grid-editor-guide-predict": !W && !E,
          "vue-grid-editor-spacing-guide": j,
          "vue-grid-editor-alignment-guide": !j,
          "vue-grid-editor-guide-with-label": (ie = S.display) == null ? void 0 : ie.showLabel
        }),
        style: Ee,
        "data-guide-id": S.id,
        "data-guide-kind": S.kind,
        "data-guide-role": j ? "spacing" : "alignment",
        "data-guide-state": W ? "snapped" : "predict",
        "data-guide-proximity": String(Math.round(me * 100) / 100),
        "data-guide-debug": E ? "true" : void 0,
        "data-guide-source-ids": S.sourceIds.join(",")
      }, (q = S.display) != null && q.showLabel && S.display.label ? [Oe("span", {
        class: "vue-grid-editor-guide-label"
      }, S.display.label)] : void 0);
    }, R = x.map((S) => A(S));
    return o.debug && o.debugMode === "layer" && ((O = o.debugGuides) != null && O.length) ? R.push(Oe("div", {
      key: "debug-guides-layer",
      class: "vue-grid-editor-debug-layer",
      "data-guide-debug-layer": "true"
    }, o.debugGuides.map((S) => A(S, !0)))) : o.debug && o.debugMode === "panel" && R.push(Oe("div", {
      key: "debug-guides-panel",
      class: "vue-grid-editor-debug-panel",
      "data-guide-debug-panel": "true"
    }, `Debug guides: ${o.guides.length} candidates, ${x.length} shown`)), R;
  }, k = () => {
    if (!o) return [];
    const x = o.spacingChips || [];
    return x.length === 0 ? [] : x.map((P) => {
      const A = P.axis === "x", R = A ? y(P.span.start, P.span.end) : l(P.span.start, P.span.end), O = R.start, S = R.end, E = Math.max(1, S - O), W = A ? f({
        kind: "center-y",
        axis: "y",
        position: P.position
      }) : i({
        kind: "center-x",
        axis: "x",
        position: P.position
      }), j = A ? {
        left: `${O}px`,
        top: `${W}px`,
        width: `${E}px`
      } : {
        top: `${O}px`,
        left: `${W}px`,
        height: `${E}px`
      }, me = `${P.distance} ${P.unit}${P.distance === 1 ? "" : "s"}`;
      return Oe("div", {
        key: P.id,
        class: nt("vue-grid-editor-spacing-chip", `vue-grid-editor-spacing-chip-${P.side}`, `vue-grid-editor-spacing-chip-${P.axis}`, {
          "vue-grid-editor-spacing-chip-equal": P.isEqual
        }),
        style: j,
        "data-chip-id": P.id,
        "data-chip-side": P.side,
        "data-chip-equal": P.isEqual ? "true" : "false",
        "data-chip-neighbor": P.neighborId || "edge"
      }, [Oe("span", {
        class: "vue-grid-editor-spacing-chip-label"
      }, me)]);
    });
  }, F = () => {
    var E, W, j, me;
    if (!o) return null;
    const x = o.measurementHud;
    if (!x) return null;
    const P = p(x.position.x) + v(x.size.w), A = m(x.position.y), R = `${x.size.w}×${x.size.h} · col ${x.position.x}, row ${x.position.y}`, O = [];
    (E = x.delta) != null && E.dw && O.push(`${x.delta.dw > 0 ? "+" : ""}${x.delta.dw} col${Math.abs(x.delta.dw) === 1 ? "" : "s"}`), (W = x.delta) != null && W.dh && O.push(`${x.delta.dh > 0 ? "+" : ""}${x.delta.dh} row${Math.abs(x.delta.dh) === 1 ? "" : "s"}`), (j = x.delta) != null && j.dx && O.push(`x ${x.delta.dx > 0 ? "+" : ""}${x.delta.dx}`), (me = x.delta) != null && me.dy && O.push(`y ${x.delta.dy > 0 ? "+" : ""}${x.delta.dy}`);
    const S = [Oe("span", {
      class: "vue-grid-editor-measurement-hud-label"
    }, x.label || x.itemId), Oe("span", {
      class: "vue-grid-editor-measurement-hud-dims"
    }, R)];
    return O.length > 0 && S.push(Oe("span", {
      class: "vue-grid-editor-measurement-hud-delta"
    }, `Δ ${O.join(" · ")}`)), x.blocked && S.push(Oe("span", {
      class: "vue-grid-editor-measurement-hud-blocked"
    }, x.blockedMessage || x.blocked)), Oe("div", {
      key: `hud:${x.itemId}`,
      class: nt("vue-grid-editor-measurement-hud", `vue-grid-editor-measurement-hud-${x.interaction}`, {
        "vue-grid-editor-measurement-hud-blocked-state": !!x.blocked
      }),
      style: {
        left: `${P}px`,
        top: `${A}px`
      },
      "data-hud-item-id": x.itemId,
      "data-hud-interaction": x.interaction,
      "data-hud-blocked": x.blocked || void 0,
      role: "status",
      "aria-live": "polite"
    }, S);
  }, X = () => {
    if (!o) return [];
    const x = o.anchorEdges || [];
    if (x.length === 0) return [];
    const P = [];
    return x.forEach((A) => {
      const R = r.get(A.itemId) || n.find((j) => j.i === A.itemId);
      if (!R) return;
      const O = p(R.x), S = m(R.y), E = v(R.w), W = C(R.h);
      A.sides.forEach((j) => {
        const me = {
          position: "absolute"
        };
        j === "left" ? Object.assign(me, {
          left: `${O}px`,
          top: `${S}px`,
          height: `${W}px`,
          width: "2px"
        }) : j === "right" ? Object.assign(me, {
          left: `${O + E - 2}px`,
          top: `${S}px`,
          height: `${W}px`,
          width: "2px"
        }) : j === "top" ? Object.assign(me, {
          left: `${O}px`,
          top: `${S}px`,
          width: `${E}px`,
          height: "2px"
        }) : j === "bottom" ? Object.assign(me, {
          left: `${O}px`,
          top: `${S + W - 2}px`,
          width: `${E}px`,
          height: "2px"
        }) : j === "center-x" ? Object.assign(me, {
          left: `${O + E / 2 - 1}px`,
          top: `${S}px`,
          height: `${W}px`,
          width: "2px"
        }) : j === "center-y" && Object.assign(me, {
          left: `${O}px`,
          top: `${S + W / 2 - 1}px`,
          width: `${E}px`,
          height: "2px"
        }), P.push(Oe("div", {
          key: `anchor:${A.role}:${A.itemId}:${j}`,
          class: nt("vue-grid-editor-anchor-edge", `vue-grid-editor-anchor-edge-${j}`, `vue-grid-editor-anchor-edge-${A.role}`),
          style: me,
          "data-anchor-item-id": A.itemId,
          "data-anchor-side": j,
          "data-anchor-role": A.role
        }));
      });
    }), P;
  }, z = () => s ? s.ghostItems.map((x) => {
    const P = x.item, A = x.state === "blocked" || s.phase === "blocked";
    return Oe("div", {
      key: `placement-ghost:${s.id}:${x.id}`,
      class: nt("vue-grid-editor-placement-ghost", `vue-grid-editor-placement-ghost-${x.state}`, {
        "vue-grid-editor-placement-ghost-blocked": A,
        "vue-grid-editor-placement-ghost-committing": x.state === "committing"
      }),
      style: {
        left: `${p(P.x)}px`,
        top: `${m(P.y)}px`,
        width: `${v(P.w)}px`,
        height: `${C(P.h)}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-item-id": x.id,
      "data-placement-state": A ? "blocked" : x.state,
      "data-placement-x": String(P.x),
      "data-placement-y": String(P.y),
      "data-placement-w": String(P.w),
      "data-placement-h": String(P.h),
      "aria-hidden": "true"
    });
  }) : [], ae = () => s ? s.affectedOutlines.map((x) => {
    const P = x.after;
    return Oe("div", {
      key: `placement-affected:${s.id}:${x.id}:${x.kind}`,
      class: nt("vue-grid-editor-placement-affected", `vue-grid-editor-placement-affected-${x.kind}`),
      style: {
        left: `${p(P.x)}px`,
        top: `${m(P.y)}px`,
        width: `${v(P.w)}px`,
        height: `${C(P.h)}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-affected-id": x.id,
      "data-placement-outline-kind": x.kind,
      "aria-hidden": "true"
    });
  }) : [], D = () => {
    var S;
    if (!s) return null;
    const x = (S = s.ghostItems[0]) == null ? void 0 : S.item;
    if (!x && !s.blocked) return null;
    const P = x ? p(x.x) + v(x.w) : 0, A = x ? m(x.y) : 0, R = s.blocked, O = R ? R.message || `Placement blocked by ${R.reason}.` : `${s.ghostItems.length} item${s.ghostItems.length === 1 ? "" : "s"}`;
    return Oe("div", {
      key: `placement-hud:${s.id}`,
      class: nt("vue-grid-editor-placement-hud", {
        "vue-grid-editor-placement-hud-blocked": !!R
      }),
      style: {
        left: `${P}px`,
        top: `${A}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-state": R ? "blocked" : s.phase,
      role: "status",
      "aria-live": "polite"
    }, O);
  };
  return [...ae(), ...z(), D(), ...X(), ...M(), ...k(), F()].filter(Boolean);
}
const Dn = (e) => {
  const t = e.props, o = An({
    props: t,
    layoutRef: e.layoutRef,
    persistenceController: t.persistence,
    engineBridge: e.engineBridge,
    getLayout: e.getLayout,
    getOldDragItem: e.getOldDragItem,
    getOldResizeItem: e.getOldResizeItem,
    isDropping: e.isDropping,
    getInteractionState: e.getInteractionState
  });
  return {
    interactions: {
      clearGuides: o.clearGuides,
      resetSnap: o.resetSnap,
      snapCandidate: o.snapCandidate,
      updateIntelligence: o.updateIntelligence,
      resolveMoveDrag: o.resolveMoveDrag,
      resolveResizeIntent: o.resolveResizeIntent,
      notifyMoveBlocked: o.notifyMoveBlocked,
      commitMove: o.commitMove,
      commitResize: o.commitResize,
      commitDrop: o.commitDrop,
      rollbackInteraction: o.rollbackInteraction
    },
    syncHistory: o.syncHistory,
    mount: o.mount,
    stop: o.stop,
    getItemRenderState: o.getItemRenderState,
    getRootClassNames: () => {
      var s, r, n;
      return {
        "editor-enabled": o.isEnabled(),
        "editor-mode-view": o.isEnabled() && o.isViewMode(),
        "editor-mode-edit": o.isEnabled() && o.isEditMode(),
        "editor-placement-active": o.isPlacementActive(),
        "editor-dirty": (s = o.controller) == null ? void 0 : s.dirty.value,
        "editor-conflict": ((r = o.controller) == null ? void 0 : r.state.value) === "conflict",
        "editor-guide-grid": (n = o.controller) == null ? void 0 : n.guides.value.showGrid
      };
    },
    isExternalDropEnabled: (s) => s && !o.isViewMode(),
    onRootPointerMove: o.onRootPointerMove,
    onRootClick: o.onRootClick,
    renderOverlay: (s) => {
      var r, n;
      return Tn({
        enabled: o.guidesEnabled() || o.isPlacementActive(),
        geometry: zn(s.geometry),
        guideState: (r = o.controller) == null ? void 0 : r.guides.value,
        placementSession: (n = o.controller) == null ? void 0 : n.placementSession.value,
        itemMap: s.itemMap,
        layout: s.layout
      });
    }
  };
}, On = {
  ...Ii,
  editor: {
    type: [Boolean, Object],
    default: !1
  },
  persistence: {
    type: [Boolean, Object],
    default: !1
  },
  itemCapabilities: {
    type: Object,
    default: void 0
  },
  resizeConstraints: {
    type: Object,
    default: void 0
  }
}, oa = bi({
  name: "EditorGridLayout",
  props: On,
  createRuntimeExtension: Dn
});
export {
  ta as $,
  js as A,
  rr as B,
  Us as C,
  Zn as D,
  oa as E,
  ji as F,
  at as G,
  $r as H,
  ks as I,
  mt as J,
  fs as K,
  vo as L,
  Qn as M,
  Le as N,
  Br as O,
  Fr as P,
  gt as Q,
  io as R,
  so as S,
  Er as T,
  Ze as U,
  zr as V,
  Hs as W,
  qn as X,
  Hr as Y,
  Eo as Z,
  ws as _,
  Rs as a,
  Ps as b,
  Es as c,
  Ki as d,
  Jn as e,
  hn as f,
  _s as g,
  gn as h,
  Mo as i,
  xr as j,
  ur as k,
  Wn as l,
  Go as m,
  Nr as n,
  Kr as o,
  di as p,
  Or as q,
  Lr as r,
  Xr as s,
  no as t,
  ea as u,
  mn as v,
  Ge as w,
  As as x,
  xn as y,
  Vn as z
};
