import { c as bi, b as Ii } from "./createGridLayoutComponent-DrGx-LJV.mjs";
import rt from "clsx";
import { e as xi, a as ce, o as Ee, m as Et, l as wi, k as ts, s as ki, f as Mi, d as Po, i as os } from "./utils-BCVYGne6.mjs";
import { k as Si, f as Ci } from "./migration-CPonYzEY.mjs";
import { z as Ri, A as Zt, D as Se, v as Os, w as Lt, h as Jt, b as Qt, C as Pi, g as Ie, F as Ei, e as Ht, d as ho, y as yt, q as ss, n as Bi, i as is, o as fo, c as rs, a as Dt, r as ns, p as as, x as cs, E as $i } from "./commands-Q0wgqPfi.mjs";
import { ref as Pe, computed as ds, watch as pt, h as Oe } from "vue";
import { deepEqual as Ke } from "fast-equals";
import { c as eo, u as Gi } from "./persistence-Db97X8w7.mjs";
import { e as vo } from "./core-CE462SRA.mjs";
import { f as Ai, c as zi, a as Ti } from "./resolve-C3SqJijI.mjs";
const Di = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", Oi = (e) => !!(e && typeof e == "object"), Ls = (e, t = {}) => {
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
  if (Ls(e, t)) return null;
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
}, ls = (e) => {
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
    if (!Ls(i, t) && e.placementSession.value) {
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
          const m = ls(p);
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
        const l = ls(y);
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
}, us = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, fs = (e) => [
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
}, Fs = (e, t, o) => {
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
}, ct = (e) => e.kind === "spacing-x" || e.kind === "spacing-y", er = (e) => e.debug === !0 || e.debug === "layer" || e.debug === "panel", tr = (e) => e.debug === "panel" ? "panel" : e.debug === !0 || e.debug === "layer" ? "layer" : !1, or = (e, t) => {
  const o = e.maxVisibleGuides;
  return typeof o == "number" ? Math.max(0, o) : o && typeof o[t] == "number" ? Math.max(0, o[t] || 0) : Vi[t];
}, sr = (e) => !!(e.display && Number.isFinite(e.display.start) && Number.isFinite(e.display.end) && e.display.end > e.display.start), ys = (e, t) => (t.includes(e.id) ? -1e3 : 0) + (e.isSnapped ? -500 : 0) + (ct(e) ? 20 : 0) - Math.round((e.proximity || 0) * 50), ir = (e, t) => {
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
    (v, C) => ys(v, o) - ys(C, o) || v.distance - C.distance || v.priority - C.priority || v.id.localeCompare(C.id)
  ), i = /* @__PURE__ */ new Map(), f = [];
  for (let v = 0; v < n.length; v += 1) {
    const C = n[v], M = ct(C) ? `s:${C.kind}:${C.position}:${(l = (y = C.display) == null ? void 0 : y.start) != null ? l : ""}:${(m = (p = C.display) == null ? void 0 : p.end) != null ? m : ""}` : `a:${C.kind}:${C.axis}:${C.position}`, k = i.get(M);
    k ? ct(C) || i.set(M, ir(k, C)) : (i.set(M, C), f.push(M));
  }
  const d = f.slice(0, r).map((v) => i.get(v)).filter(Boolean);
  let c = !1;
  return d.map((v) => {
    if (!v.display) return v;
    const C = t.showSpacingLabels !== !1 && ct(v) && !c;
    return C && (c = !0), {
      ...v,
      display: {
        ...v.display,
        showLabel: C
      }
    };
  });
}, Yt = (e, t, o, s, r) => {
  const n = t.x + t.w, i = t.y + t.h;
  let f = null;
  for (let d = 0; d < o.length; d += 1) {
    const c = o[d];
    if (c.i === t.i || !Fs(c, s, r)) continue;
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
    top: Yt("top", e, t, o, s),
    right: Yt("right", e, t, o, s),
    bottom: Yt("bottom", e, t, o, s),
    left: Yt("left", e, t, o, s)
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
    (c) => !ct(c) && c.targetEdge && c.sourceEdge
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
  var N, ye, he, Be;
  const n = us(), i = r.interaction || "drag";
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
  const f = (N = r.maxItems) != null ? N : Wi, d = typeof r.thresholdPx == "number" ? r.thresholdPx : null, c = (ye = r.predictRadiusX) != null ? ye : d !== null ? d : Xi, y = (he = r.predictRadiusY) != null ? he : d !== null ? d : Yi, l = (Be = r.snapThresholdCells) != null ? Be : d !== null ? d : _i, p = r.sectionSnap !== !1, m = e.filter(
    (se) => se.i !== t.i && Fs(se, s, r)
  ), v = m.length > f, C = v ? m.slice(0, f) : m, M = fs(o), k = [];
  C.forEach((se) => {
    const q = fs(se);
    M.forEach((ie) => {
      q.forEach((Ce) => {
        if (ie.axis !== Ce.axis) return;
        const je = Math.abs(ie.position - Ce.position), We = ie.axis === "x" ? c : y;
        je <= We && k.push(Qi(
          t.i,
          se,
          o,
          ie,
          Ce,
          We,
          l,
          p
        ));
      });
    }), Zi(se, o).forEach((ie) => {
      k.push({
        id: `${t.i}:${ie.kind}:${se.i}`,
        kind: ie.kind,
        axis: ie.axis,
        position: ie.position,
        sourceIds: [se.i],
        targetId: t.i,
        distance: ie.distance,
        priority: ie.priority,
        proximity: ie.distance === 0 ? 1 : 0.5,
        isPredictive: ie.distance > l,
        isSnapped: ie.distance <= l,
        anchorIds: [se.i, t.i],
        display: {
          kind: "spacing",
          start: ie.start,
          end: ie.end,
          label: ie.label,
          sourceIds: [se.i]
        }
      });
    });
  }), k.sort(
    (se, q) => se.distance - q.distance || se.priority - q.priority || se.id.localeCompare(q.id)
  );
  const L = k.filter((se) => !ct(se) && se.isSnapped), K = r.snap === !1 || L.length === 0 ? [] : [L[0].id], z = rr(k, r, K), ne = tr(r), D = er(r), w = z.filter((se) => {
    var q;
    return (q = se.display) == null ? void 0 : q.showLabel;
  }).map((se) => se.id), P = cr(o, e, s, r), A = dr(o, r, i), R = lr(z, t.i, r), F = k.filter((se) => se.isPredictive && !ct(se)).length, S = L.length, E = us() - n, W = typeof r.maxDurationMs == "number" && E > r.maxDurationMs;
  return {
    activeId: t.i,
    interaction: i,
    guides: k,
    displayGuides: z,
    debugGuides: D ? k : void 0,
    snappedGuideIds: K,
    spacingLabelGuideIds: w,
    spacingChips: P,
    measurementHud: A,
    anchorEdges: R,
    showGrid: r.showGrid !== !1,
    debug: D,
    debugMode: ne,
    diagnostics: {
      durationMs: E,
      itemCount: m.length,
      degraded: v || W,
      reason: v ? "max-items" : W ? "max-duration" : void 0,
      fullGuideCount: k.length,
      displayGuideCount: z.length,
      spacingLabelCount: w.length,
      predictCount: F,
      snappedCount: S,
      anchorEdgeCount: R.length,
      spacingChipCount: P.length
    }
  };
}, Wn = (e, t, o, s = {}, r = {}) => Eo({
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
  return !s || ct(s) ? e : s.axis === "x" ? s.kind === "right" ? { ...e, x: s.position - e.w } : s.kind === "center-x" ? { ...e, x: s.position - e.w / 2 } : { ...e, x: s.position } : s.kind === "bottom" ? { ...e, y: s.position - e.h } : s.kind === "center-y" ? { ...e, y: s.position - e.h / 2 } : { ...e, y: s.position };
}, ps = (e) => !!e && typeof e == "object" && !Array.isArray(e), fr = (e) => {
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
}, Hs = () => ({
  version: 1,
  items: {},
  itemMembership: {}
}), Le = (e, t = []) => {
  const o = new Set(t.map((d) => d.i)), s = t.length > 0, r = [];
  if (!e)
    return { version: 1, items: {}, itemMembership: {}, warnings: r };
  if (!ps(e) || e.version !== 1 || !ps(e.items))
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
}, yr = 500, pr = 160, mr = 16, ms = 240, gs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, gr = (e, t, o) => ({
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
}), bo = (e, t) => ({
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
}), hr = (e) => {
  const t = Object.keys(e).sort(), o = {}, s = {};
  return t.forEach((r) => {
    const n = e[r], i = Math.floor(n.top), f = Math.max(i, Math.floor(n.bottom - 1)), d = Math.floor(n.left), c = Math.max(d, Math.floor(n.right - 1));
    for (let y = i; y <= f; y++)
      o[y] || (o[y] = []), o[y].push(r);
    for (let y = d; y <= c; y++)
      s[y] || (s[y] = []), s[y].push(r);
  }), Object.keys(o).forEach((r) => o[Number(r)].sort()), Object.keys(s).forEach((r) => s[Number(r)].sort()), { byId: e, ids: t, rows: o, columns: s };
}, so = (e, t, o, s) => Math.max(0, Math.min(t, s) - Math.max(e, o)), hs = (e, t, o) => {
  if (o === "x") {
    const i = so(e.top, e.bottom, t.top, t.bottom);
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
  const s = so(e.left, e.right, t.left, t.right);
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
      const n = e[t[s]], i = e[t[r]], f = hs(n, i, "x"), d = hs(n, i, "y");
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
}, vs = (e) => e === "x" ? "horizontal" : "vertical", bs = (e) => e === "x" ? "spacing-x" : "spacing-y", _t = (e, t, o, s) => {
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
  const t = Le(e.sectionRows, e.layout), o = new Set(e.selectionIds || []), s = e.layout.filter((d) => o.size === 0 || o.has(d.i)).map((d) => bo(d, t.itemMembership[d.i]));
  if (s.length < 3) return [];
  const r = [
    _t(s, "x", "edge-to-edge", vs("x")),
    _t(s, "y", "edge-to-edge", vs("y")),
    _t(s, "x", "center-to-center", bs("x")),
    _t(s, "y", "center-to-center", bs("y"))
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
}, Ns = (e) => {
  var o, s, r;
  const t = (r = (o = e.options) == null ? void 0 : o.snapThresholdCells) != null ? r : (s = e.options) == null ? void 0 : s.thresholdPx;
  return typeof t == "number" && Number.isFinite(t) ? t : 0.5;
}, Io = (e, t, o, s) => {
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
  const n = Ns(e), i = e.layout.filter((l) => l.i !== t.i).sort((l, p) => l.i.localeCompare(p.i)), f = o.filter((l) => l.sourceId !== t.i && l.targetId !== t.i && l.distance > 0).sort((l, p) => l.distance - p.distance || l.id.localeCompare(p.id)), d = [], c = t.x + t.w, y = t.y + t.h;
  return i.forEach((l) => {
    const p = l.x + l.w, m = l.y + l.h, v = so(t.y, y, l.y, m) > 0, C = so(t.x, c, l.x, p) > 0, M = p <= t.x, k = c <= l.x, L = m <= t.y, K = y <= l.y;
    f.forEach((z) => {
      var ne, D, w, P, A, R;
      if (z.axis === "x" && v && (M || k)) {
        const F = M ? t.x - p : l.x - c, S = Math.abs(F - z.distance);
        if (S <= n) {
          const E = M ? p + z.distance : l.x - z.distance - t.w, W = Io(
            s,
            l.i,
            t.i,
            (ne = e.options) == null ? void 0 : ne.allowCrossSectionRow
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
            rowId: (w = s.itemMembership[t.i]) == null ? void 0 : w.rowId,
            blocked: W
          });
        }
      }
      if (z.axis === "y" && C && (L || K)) {
        const F = L ? t.y - m : l.y - y, S = Math.abs(F - z.distance);
        if (S <= n) {
          const E = L ? m + z.distance : l.y - z.distance - t.h, W = Io(
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
            targetEdge: L ? "top" : "bottom",
            sourceEdge: L ? "bottom" : "top",
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
  const r = Ns(e), n = [], i = [
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
    (p) => Io(r, p, t.i, f)
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
}, Eo = (e) => {
  var N, ye, he, Be, se, q, ie, Ce, je, We, tt, Ye, It, xt, wt, dt;
  const t = gs(), o = (ye = (N = e.options) == null ? void 0 : N.maxItems) != null ? ye : yr, s = (Be = (he = e.options) == null ? void 0 : he.maxSnapCandidates) != null ? Be : pr, r = ((se = e.options) != null && se.maxVisibleGuides, ms), n = e.metaById || {}, i = Le(e.sectionRows, e.layout), f = e.layout.length > o ? e.layout.slice(0, o) : e.layout.slice(), c = Si().build(f, {
    cols: e.cols,
    maxRows: e.maxRows,
    compactType: e.compactType,
    allowOverlap: e.allowOverlap,
    preventCollision: e.preventCollision
  }).getLayout(), y = {};
  c.forEach((me) => {
    y[me.i] = bo(me, i.itemMembership[me.i]);
  }), e.candidateItem && !y[e.candidateItem.i] && (y[e.candidateItem.i] = bo(
    e.candidateItem,
    i.itemMembership[e.candidateItem.i]
  ));
  const l = hr(y), p = vr(y), m = Ir(y, p, r), v = xr(e), C = e.interaction === "toolbar" ? "api" : e.interaction, M = e.activeItem && e.candidateItem ? ur(e.layout, e.activeItem, e.candidateItem, n, {
    ...e.options,
    interaction: C
  }) : gr(((q = e.activeItem) == null ? void 0 : q.i) || null, C), k = ((ie = e.options) == null ? void 0 : ie.snap) !== !1, L = Sr(
    M,
    e.candidateItem,
    k,
    s,
    i,
    e.interaction,
    (Ce = e.options) == null ? void 0 : Ce.resizeHandle,
    (je = e.options) == null ? void 0 : je.allowCrossSectionRow
  ), K = kr(
    e,
    e.candidateItem,
    m,
    i,
    s
  ), ne = [
    ...Mr(
      e,
      e.candidateItem,
      i,
      s
    ),
    ...K,
    ...L
  ].map((me) => k ? me : { ...me, snapped: !1 }).sort(
    (me, qe) => me.priority - qe.priority || qe.proximity - me.proximity || me.distance - qe.distance || me.id.localeCompare(qe.id)
  ).slice(0, s), D = gs() - t, w = typeof ((We = e.options) == null ? void 0 : We.maxDurationMs) == "number" && D > e.options.maxDurationMs, P = e.layout.length > o || w || !!((tt = M.diagnostics) != null && tt.degraded), A = e.layout.length > o ? "max-items" : w ? "max-duration" : ((Ye = M.diagnostics) == null ? void 0 : Ye.reason) === "max-items" || ((It = M.diagnostics) == null ? void 0 : It.reason) === "max-duration" ? M.diagnostics.reason : void 0, R = Cr(e.layout, n), F = ["grid-editor.intelligence.computed"];
  e.layout.length > o && F.push("grid-editor.intelligence.degraded.max-items"), w && F.push("grid-editor.intelligence.degraded.max-duration"), v.some((me) => me.isEqual) ? F.push("grid-editor.distribution.equal") : v.length > 0 && F.push("grid-editor.distribution.unequal"), i.warnings.forEach((me) => F.push(me.code)), R.forEach((me) => F.push(me.code));
  const S = {
    durationMs: D,
    itemCount: e.layout.length,
    selectedCount: ((xt = e.selectionIds) == null ? void 0 : xt.length) || 0,
    candidateCount: ne.length + v.length,
    snapCandidateCount: ne.length,
    distributionCandidateCount: v.length,
    spacingRelationCount: m.length,
    sectionRowCount: Object.keys(i.items).length,
    snapSource: ((wt = ne.find((me) => me.snapped)) == null ? void 0 : wt.kind) || "none",
    distributionMode: ((dt = v[0]) == null ? void 0 : dt.mode) || "none",
    sectionRowSource: Object.keys(i.items).length > 0 ? "metadata" : "none",
    degraded: P,
    reason: A,
    filtered: R,
    codes: F
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
    snapCandidates: ne,
    spacingRelations: m,
    distributionCandidates: v,
    sectionRows: i,
    guideState: W,
    measurementHud: E,
    diagnostics: S
  };
}, yo = (e, t, o) => ({
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
      diagnostics: yo(e.diagnostics, "grid-editor.snap.disabled")
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
      diagnostics: yo(e.diagnostics, "grid-editor.snap.selected")
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
    diagnostics: yo(
      e.diagnostics,
      Rr(f),
      f === "bounds" || f === "collision" || f === "maxRows" ? f : void 0
    )
  };
}, Ae = (e = [], t = "api") => {
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
}, $r = (e) => e.map((t) => t.i), Gr = (e, t) => Zt(e, t[e.i]).editable, Ar = (e, t, o, s) => {
  if (e.length <= 1) return e;
  const r = e.filter((i) => {
    const f = o.get(i);
    return f ? Gr(f, s) : !1;
  });
  if (r.length > 0) return r;
  const n = t && e.includes(t) ? t : e[e.length - 1];
  return n ? [n] : [];
}, Ve = (e, t, o = {}, s = e.source) => {
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
}, zr = (e, t, o = "api") => Ae(t, o), xo = (e = "api") => Ae([], e), Is = (e, t, o) => {
  const s = o.source || "api";
  if (o.ids) return zr(t, o.ids, s);
  if (!o.id) return xo(s);
  const r = $r(e);
  if (!r.includes(o.id)) return t;
  if (o.range && t.anchorId) {
    const n = r.indexOf(t.anchorId), i = r.indexOf(o.id);
    if (n >= 0 && i >= 0) {
      const f = Math.min(n, i), d = Math.max(n, i);
      return Ae(r.slice(f, d + 1), s);
    }
  }
  if (o.toggle) {
    const n = new Set(t.selectedIds);
    return n.has(o.id) ? n.delete(o.id) : n.add(o.id), Ae(Array.from(n), s);
  }
  return Ae([o.id], s);
}, xs = (e, t, o = {}) => {
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
}, Tr = 100, Dr = 650, mt = (e) => e.kind === "layout" ? {
  ...e,
  layout: ce(e.layout),
  editorMetaById: { ...e.editorMetaById },
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
} : {
  ...e,
  layouts: eo(e.layouts),
  editorMetaById: { ...e.editorMetaById },
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
}, Or = (e = {}) => {
  const t = Math.max(1, Math.floor(e.maxSize || Tr)), o = e.mergeWindowMs || Dr, s = Pe(!1), r = Pe(!1);
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
      before: mt(l.before),
      after: mt(l.after)
    }, v = n[n.length - 1];
    c(v, m) ? n[n.length - 1] = {
      ...v,
      after: mt(m.after),
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
        snapshot: mt(l),
        revision: p
      };
    },
    bailToMark(l) {
      return f(), mt(l.snapshot);
    },
    squashToMark(l, p, m = {}) {
      const v = {
        ...p,
        before: mt(l.snapshot),
        after: mt(p.after)
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
class nt extends Error {
  constructor(t, o, s) {
    super(o), this.name = "GridEditorClipboardError", this.code = t, this.cause = s;
  }
}
const Ft = (e) => typeof e == "number" && Number.isFinite(e), wo = (e) => Ft(e) && e > 0 ? Math.floor(e) : void 0, po = (e) => typeof e == "string" && e.length > 0 ? e : void 0, ko = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), js = (e) => e.reduce((t, o) => (t[o.i] = ko(o), t), {}), Bo = (e) => {
  if (!e || typeof e != "object") return;
  const t = e, o = {}, s = wo(t.cols);
  s && (o.cols = s);
  const r = po(t.breakpoint);
  r && (o.breakpoint = r);
  const n = po(t.layoutId);
  n && (o.layoutId = n);
  const i = po(t.viewFormat);
  return i && (o.viewFormat = i), Object.keys(o).length > 0 ? o : void 0;
}, $o = (e, t) => {
  const o = js(t);
  if (!e || typeof e != "object") return o;
  const s = {};
  return Object.keys(e).forEach((r) => {
    const n = e[r];
    if (!n || typeof n != "object") return;
    const i = n;
    !Ft(i.x) || !Ft(i.y) || !Ft(i.w) || !Ft(i.h) || (s[r] = {
      x: i.x,
      y: i.y,
      w: i.w,
      h: i.h
    });
  }), {
    ...o,
    ...s
  };
}, Ks = (e, t) => $o(e, t), Mo = (e) => {
  const t = ce(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt,
    items: t,
    editorMetaById: Se(e.editorMetaById)
  };
  return e.version === 2 ? {
    version: 2,
    ...o,
    source: Bo(e.source),
    originalGeometryById: Ks(e.originalGeometryById, t)
  } : {
    version: 1,
    ...o
  };
};
let Ut = null;
const gt = {
  read() {
    return Ut ? Mo(Ut) : null;
  },
  write(e) {
    Ut = Mo(e);
  },
  clear() {
    Ut = null;
  }
}, ws = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = e.name;
  return t === "NotAllowedError" || t === "SecurityError";
}, Fr = (e) => {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.version !== 1 && t.version !== 2 || typeof t.sourceId != "string" || typeof t.copiedAt != "string" || !Array.isArray(t.items)) return null;
  const o = ce(t.items), s = Se(t.editorMetaById);
  return t.version === 2 ? {
    version: 2,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s,
    source: Bo(t.source),
    originalGeometryById: $o(t.originalGeometryById, o)
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
      throw new nt(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      const e = await navigator.clipboard.readText();
      if (!e) return null;
      const t = JSON.parse(e), o = Fr(t);
      if (!o)
        throw new nt(
          "clipboard-invalid",
          "Clipboard does not contain a grid editor payload."
        );
      return o;
    } catch (e) {
      throw e instanceof nt ? e : new nt(
        ws(e) ? "clipboard-permission" : "clipboard-invalid",
        "Failed to read grid editor payload from system clipboard.",
        e
      );
    }
  },
  async write(e) {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText != "function")
      throw new nt(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      await navigator.clipboard.writeText(JSON.stringify(Mo(e)));
    } catch (t) {
      throw new nt(
        ws(t) ? "clipboard-permission" : "clipboard-unavailable",
        "Failed to write grid editor payload to system clipboard.",
        t
      );
    }
  }
}), Nr = (e) => {
  const t = ce(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt || (/* @__PURE__ */ new Date()).toISOString(),
    items: t,
    editorMetaById: Se(e.editorMetaById, {
      layout: e.items
    })
  };
  return e.version === 1 ? {
    version: 1,
    ...o
  } : {
    version: 2,
    ...o,
    source: Bo(e.source),
    originalGeometryById: Ks(e.originalGeometryById, t)
  };
}, mo = (e, t = {}) => {
  var f, d, c, y, l, p;
  const o = wo(t.cols), s = "version" in e && e.version === 2 ? wo((f = e.source) == null ? void 0 : f.cols) : void 0;
  if (!o || !s || t.scale === !1 || o === s)
    return {
      items: ce(e.items),
      scaled: !1,
      sourceCols: s,
      targetCols: o
    };
  const r = o / s, n = "version" in e && e.version === 2 ? $o(e.originalGeometryById, e.items) : js(e.items), i = e.items.reduce((m, v) => {
    const C = n[v.i] || ko(v);
    return Math.min(m, C.x);
  }, (p = (l = (c = n[(d = e.items[0]) == null ? void 0 : d.i]) == null ? void 0 : c.x) != null ? l : (y = e.items[0]) == null ? void 0 : y.x) != null ? p : 0);
  return {
    items: e.items.map((m) => {
      const v = n[m.i] || ko(m), C = Math.max(1, Math.min(o, Math.round(v.w * r))), M = Math.max(
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
}, ve = (e, t) => ({
  type: e,
  labelKey: t.labelKey || `grid-editor.command.${e}`,
  ...t
}), Ge = { mode: "record" }, ht = {
  mode: "ignore",
  preserveRedoStack: !0
}, Wt = (e) => !e.payload || typeof e.payload != "object" ? { ok: !1, message: `${e.type} requires an object payload.` } : { ok: !0 }, Xs = [
  ve("select", {
    defaultSource: "api",
    defaultHistory: ht,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  ve("clearSelection", {
    defaultSource: "api",
    defaultHistory: ht,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  ve("move", {
    defaultSource: "api",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Wt
  }),
  ve("resize", {
    defaultSource: "api",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Wt
  }),
  ve("add", {
    defaultSource: "api",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("delete", {
    defaultSource: "api",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  ve("duplicate", {
    defaultSource: "api",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("copy", {
    defaultSource: "api",
    defaultHistory: ht,
    affects: {},
    mutualExclusionScope: "selection"
  }),
  ve("paste", {
    defaultSource: "api",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("align", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Wt
  }),
  ve("distribute", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Wt
  }),
  ve("tidy", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("lock", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("unlock", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("show", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("hide", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("save", {
    defaultSource: "toolbar",
    defaultHistory: ht,
    affects: { persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence",
    shortcuts: ["Mod+S"]
  }),
  ve("discard", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "replace" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  ve("reset", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "clear" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  ve("undo", {
    defaultSource: "keyboard",
    defaultHistory: ht,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Z"]
  }),
  ve("redo", {
    defaultSource: "keyboard",
    defaultHistory: ht,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Shift+Z"]
  }),
  ve("section-row-collapse", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("section-row-expand", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("section-row-move", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0, sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  ve("section-row-delete", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  ve("section-row-reorder", {
    defaultSource: "toolbar",
    defaultHistory: Ge,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  })
], jr = new Map(
  Xs.map((e) => [e.type, e])
), Ys = (e) => jr.get(e), Zn = () => Xs.slice(), to = (e) => {
  const t = Ys(e);
  return t || ve(e, {
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
      var D, w, P, A, R, F, S, E, W;
      const i = to(n.type), f = {
        source: i.defaultSource,
        ...n,
        history: n.history || i.defaultHistory
      }, d = Os(f), c = Lt(
        d.history,
        i.defaultHistory.mode || Jt(d.type)
      );
      d.history = c;
      const y = d.source || i.defaultSource || "api";
      d.source = y;
      const l = i.mutualExclusionScope || "global", p = o(), m = t.get(l);
      if (m && !m.signal.aborted) {
        const N = Qt(d, "command-pending", {
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
        return e.finalize(d, N, p);
      }
      (D = e.onStart) == null || D.call(e, d);
      const v = e.getSnapshot(), C = e.getStateRevision(), M = e.check(d);
      if (!M.ok && M.result)
        return M.result.diagnostics = {
          durationMs: ((w = M.result.diagnostics) == null ? void 0 : w.durationMs) || 0,
          ...M.result.diagnostics,
          stateRevision: C,
          historyMode: c.mode,
          source: y,
          origin: d.origin
        }, e.finalize(d, M.result, p);
      const k = (P = i.validatePayload) == null ? void 0 : P.call(i, d);
      if (k && !k.ok) {
        const N = Qt(d, "invalid-input", {
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
        return e.finalize(d, N, p);
      }
      const L = ((A = e.buildPreview) == null ? void 0 : A.call(e, d, M, v)) || {
        layoutPatches: [],
        metadataPatches: [],
        affectedIds: [],
        beforeSummary: {},
        afterSummary: {}
      }, K = new AbortController();
      t.set(l, K);
      const z = await Pi(
        e.beforeCommand,
        d,
        e.getGuardContext(d, M, L, K.signal),
        e.guardTimeoutMs
      );
      if (t.delete(l), (R = e.isStopped) != null && R.call(e) || K.signal.aborted) {
        (F = e.cleanupInteraction) == null || F.call(e, "guard-aborted");
        const N = Ie(d, "cancelled", {
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
        return e.finalize(d, N, p, z.guardMs);
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
      const ne = e.getStateRevision();
      if (ne !== C) {
        (W = e.cleanupInteraction) == null || W.call(e, "stale-command");
        const N = Qt(d, "stale-command", {
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
            stateRevision: ne,
            stale: !0,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, N, p, z.guardMs);
      }
      return e.commit({
        command: d,
        check: M,
        before: v,
        preview: L,
        startedAt: p,
        guardMs: z.guardMs
      });
    },
    abortPending: (n = "command-kernel-abort") => {
      t.forEach((i) => i.abort(n)), t.clear();
    }
  };
}, Ct = (e, t, o, s) => ({
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
}), io = (e, t, o = (/* @__PURE__ */ new Date()).toISOString()) => {
  const s = typeof t == "string" ? void 0 : t, r = typeof t == "string" ? t : o, n = s ? Le(s) : null;
  return {
    version: s ? 2 : 1,
    editorMetaById: Se(e),
    sectionRows: n ? {
      version: 1,
      items: n.items,
      itemMembership: n.itemMembership
    } : void 0,
    updatedAt: r
  };
}, oo = (e) => {
  var n, i;
  const t = (n = e == null ? void 0 : e.meta) == null ? void 0 : n.editor;
  if (t == null)
    return {
      ok: !0,
      envelope: io({})
    };
  if (!t || typeof t != "object")
    return { ok: !1, error: "meta.editor must be an object." };
  const o = t;
  if (o.version !== 1 && o.version !== 2)
    return {
      ok: !0,
      envelope: io({})
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
      } : Hs(),
      updatedAt: typeof o.updatedAt == "string" ? o.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, Xr = (e) => {
  const t = () => ({ ...(typeof e.baseMeta == "function" ? e.baseMeta() : e.baseMeta) || {} }), o = (s, r) => {
    var i, f, d;
    const n = oo(s);
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
        editor: io(
          e.getEditorMetaById(),
          (s = e.getSectionRows) == null ? void 0 : s.call(e)
        )
      };
    },
    onPersistenceEvent(s) {
      var r, n, i, f, d, c, y;
      if ((s.type === "load-success" || s.type === "external-apply") && o(s.document, s.type), s.type === "save-success" && o(s.document, "save-success"), s.type === "conflict") {
        const l = oo(s.conflict.localDocument), p = oo(s.conflict.externalDocument);
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
        return Ct("editor-save", "save", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: !0
        });
      const s = await e.persistence.save();
      return Ct("editor-save", "save", s.ok ? "changed" : "error", s.error);
    },
    discard() {
      return e.persistence ? (e.persistence.discard(), Ct("editor-discard", "discard", "changed")) : Ct("editor-discard", "discard", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    },
    reset() {
      return e.persistence ? (e.persistence.reset(), Ct("editor-reset", "reset", "changed")) : Ct("editor-reset", "reset", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    }
  };
}, ao = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Nt = (e) => typeof e == "number" && Number.isFinite(e), _s = (e) => e === "left" || e === "center-x" || e === "right" ? "x" : "y", Yr = (e) => e === "horizontal" || e === "spacing-x" ? "x" : "y", ro = (e) => ce(e), _r = (e) => Array.from(new Set(e.flatMap((t) => t.type === "add" ? [t.item.i] : t.type === "compact" ? t.affectedIds : [t.id]))), Us = (e, t) => {
  var s, r;
  const o = (s = t.targetIds) != null && s.length ? t.targetIds : (r = t.selectedIds) != null && r.length ? t.selectedIds : e.map((n) => n.i);
  return Array.from(new Set(o.filter(Boolean)));
}, bt = (e, t, o, s, r, n, i) => ({
  status: "blocked",
  layout: ro(t),
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
    durationMs: ao() - e,
    computed: n,
    messages: [{
      code: `grid-editor.geometry.${o}`,
      level: o === "invalid-input" ? "error" : "warning",
      message: r,
      itemIds: s,
      recoverable: !0
    }]
  }
}), Ws = (e, t) => {
  const o = [], s = [];
  return t.forEach((r) => {
    const n = Ee(e, r);
    n ? o.push(n) : s.push(r);
  }), { items: o, missingIds: s };
}, So = (e, t, o) => {
  const s = Nt(o.cols) ? o.cols : 12, r = Nt(o.maxRows) ? o.maxRows : 1 / 0;
  for (let n = 0; n < t.length; n++) {
    const i = Ee(e, t[n]);
    if (i) {
      if (i.x < 0 || i.y < 0 || i.x + i.w > s)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(r) && i.y + i.h > r)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (o.allowOverlap !== !0) {
        const f = Et(e, i).filter((d) => d.i !== i.i);
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
}, Ur = (e, t) => t === "right" ? e.x + e.w : t === "center-x" ? e.x + e.w / 2 : t === "bottom" ? e.y + e.h : t === "center-y" ? e.y + e.h / 2 : t === "top" ? e.y : e.x, ks = (e) => {
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
  if (n.type === "explicit-line" && n.axis === _s(r))
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
    const l = ks(o);
    return r === "right" ? { position: l.right, source: "section-row" } : r === "center-x" ? { position: l.centerX, source: "section-row" } : r === "bottom" ? { position: l.bottom, source: "section-row" } : r === "center-y" ? { position: l.centerY, source: "section-row" } : r === "top" ? { position: l.top, source: "section-row" } : { position: l.left, source: "section-row" };
  }
  const i = ks(o);
  return r === "right" ? { position: i.right, source: "selection" } : r === "center-x" ? { position: i.centerX, source: "selection" } : r === "bottom" ? { position: i.bottom, source: "selection" } : r === "center-y" ? { position: i.centerY, source: "selection" } : r === "top" ? { position: i.top, source: "selection" } : { position: i.left, source: "selection" };
}, qr = (e, t, o) => t === "right" ? { ...e, x: Math.round(o - e.w) } : t === "center-x" ? { ...e, x: Math.round(o - e.w / 2) } : t === "top" ? { ...e, y: Math.round(o) } : t === "bottom" ? { ...e, y: Math.round(o - e.h) } : t === "center-y" ? { ...e, y: Math.round(o - e.h / 2) } : { ...e, x: Math.round(o) }, qs = (e, t) => e.slice().sort(
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
  const r = Yr(o.mode), n = o.strategy || "edge-to-edge", i = qs(t, r);
  if (i.length < 3) return null;
  const f = Le(s.sectionRows, e), d = i.reduce((L, K) => {
    const z = f.itemMembership[K.i] || {};
    return L === null ? { ...z } : {
      sectionId: L.sectionId && L.sectionId === z.sectionId ? L.sectionId : void 0,
      rowId: L.rowId && L.rowId === z.rowId ? L.rowId : void 0
    };
  }, null), c = o.sectionRowId || (o.bounds === "section-row" ? (d == null ? void 0 : d.rowId) || (d == null ? void 0 : d.sectionId) : void 0), y = c ? f.items[c] : void 0;
  if (o.bounds === "active-item") {
    const L = Jr(i, r, n, s.activeId);
    return {
      axis: r,
      spacing: L.spacing,
      sectionId: d == null ? void 0 : d.sectionId,
      rowId: d == null ? void 0 : d.rowId,
      items: L.items
    };
  }
  const l = y != null && y.bounds ? r === "x" ? { start: y.bounds.x, end: y.bounds.x + y.bounds.w } : { start: y.bounds.y, end: y.bounds.y + y.bounds.h } : null, p = o.bounds === "explicit" && o.explicitBounds ? o.explicitBounds : null, m = p ? p.start : l ? l.start : r === "x" ? i[0].x : i[0].y, v = p ? p.end : l ? l.end : r === "x" ? i[i.length - 1].x + i[i.length - 1].w : i[i.length - 1].y + i[i.length - 1].h;
  if (n === "center-to-center") {
    const L = !!(p || l), K = L ? m + (r === "x" ? i[0].w : i[0].h) / 2 : r === "x" ? i[0].x + i[0].w / 2 : i[0].y + i[0].h / 2, ne = ((L ? v - (r === "x" ? i[i.length - 1].w : i[i.length - 1].h) / 2 : r === "x" ? i[i.length - 1].x + i[i.length - 1].w / 2 : i[i.length - 1].y + i[i.length - 1].h / 2) - K) / (i.length - 1);
    return {
      axis: r,
      spacing: ne,
      sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
      rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
      items: i.map((D, w) => {
        if (w === 0 || w === i.length - 1) return D;
        const P = K + ne * w;
        return r === "x" ? { ...D, x: Math.round(P - D.w / 2) } : { ...D, y: Math.round(P - D.h / 2) };
      })
    };
  }
  const C = i.reduce(
    (L, K) => L + (r === "x" ? K.w : K.h),
    0
  ), M = (v - m - C) / (i.length - 1);
  if (!Number.isFinite(M) || M < 0) return null;
  let k = m;
  return {
    axis: r,
    spacing: M,
    sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
    rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
    items: i.map((L) => {
      const K = r === "x" ? { ...L, x: Math.round(k) } : { ...L, y: Math.round(k) };
      return k += (r === "x" ? L.w : L.h) + M, K;
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
}, Ms = (e, t, o, s) => {
  const r = Nt(o.minSpacing) ? Math.max(0, o.minSpacing) : 1, n = o.axis === "both" ? ["x", "y"] : [o.axis === "y" ? "y" : "x"];
  let i = t.slice();
  return n.forEach((f) => {
    const d = en(e, i, f, s), c = /* @__PURE__ */ new Map();
    d.forEach((y) => {
      const l = qs(y, f);
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
}, Vs = (e, t, o) => Eo({
  layout: e,
  activeItem: t.find((s) => s.i === o.activeId) || t[0],
  candidateItem: t.find((s) => s.i === o.activeId) || t[0],
  selectionIds: t.map((s) => s.i),
  metaById: o.metaById,
  sectionRows: o.sectionRows,
  cols: Nt(o.cols) ? o.cols : 12,
  maxRows: o.maxRows,
  compactType: o.compactType,
  allowOverlap: o.allowOverlap,
  preventCollision: o.preventCollision,
  interaction: "toolbar",
  options: {
    cols: Nt(o.cols) ? o.cols : 12,
    maxRows: o.maxRows,
    allowCrossSectionRow: !1
  }
}), Zs = (e, t, o, s, r) => {
  const n = Ht(t, o), i = _r(n);
  return {
    status: i.length > 0 ? "changed" : "noop",
    layout: o,
    layoutPatches: n,
    affectedIds: i,
    skippedIds: r,
    diagnostics: {
      ...s,
      durationMs: ao() - e
    }
  };
}, Ss = (e, t, o = {}) => {
  const s = ao(), r = Us(e, o), { items: n, missingIds: i } = Ws(e, r);
  if (i.length > 0)
    return bt(s, e, "missing-item", i, "Align command referenced missing layout items.", void 0, o.skippedIds);
  if (n.length < 2)
    return bt(s, e, "selection-count", r, "Align requires at least 2 items.", void 0, o.skippedIds);
  const f = Wr(e, t, n, o), d = ro(e).map(
    (p) => r.includes(p.i) ? qr(p, t.mode, f.position) : p
  ), c = So(d, r, o), y = Vs(e, n, o), l = {
    targetLine: {
      axis: _s(t.mode),
      position: f.position,
      mode: t.mode
    },
    affectedIds: r,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      source: f.source === "section-row" ? "metadata" : "none"
    }
  };
  return c.ok ? Zs(s, e, d, {
    durationMs: 0,
    intelligence: y.diagnostics,
    computed: l
  }, o.skippedIds) : bt(
    s,
    e,
    c.reason,
    c.itemIds,
    `Align command blocked by ${c.reason}.`,
    l,
    o.skippedIds
  );
}, Js = (e, t, o, s) => {
  const r = ao(), n = Us(e, o), { items: i, missingIds: f } = Ws(e, n);
  if (f.length > 0)
    return bt(r, e, "missing-item", f, `${s} command referenced missing layout items.`, void 0, o.skippedIds);
  if (i.length < 3)
    return bt(r, e, "selection-count", n, `${s} requires at least 3 items.`, void 0, o.skippedIds);
  let d = s === "distribute" ? Qr(e, i, t, o) : Ms(e, i, t, o);
  const c = Vs(e, i, o);
  if (!d)
    return bt(r, e, "invalid-input", n, "Spacing command could not compute a valid spacing result.", {
      affectedIds: n,
      skippedIds: o.skippedIds
    }, o.skippedIds);
  let y = !1, l = new Map(d.items.map((k) => [k.i, k])), p = ro(e).map((k) => l.get(k.i) || k), m = So(p, n, o);
  if (!m.ok) {
    const k = Ms(e, i, {
      axis: d.axis,
      minSpacing: 0,
      strategy: t.strategy
    }, o);
    k && (y = !0, d = k, l = new Map(d.items.map((L) => [L.i, L])), p = ro(e).map((L) => l.get(L.i) || L), m = So(p, n, o));
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
  return m.ok ? Zs(r, e, p, {
    durationMs: 0,
    intelligence: c.diagnostics,
    computed: M
  }, o.skippedIds) : bt(
    r,
    e,
    m.reason,
    m.itemIds,
    `Spacing command blocked by ${m.reason}.`,
    M,
    o.skippedIds
  );
}, Cs = (e, t, o = {}) => Js(e, t, o, "distribute"), Rs = (e, t, o = {}) => Js(e, t, o, "tidy"), Te = (e) => typeof e == "number" && Number.isFinite(e), tn = (e) => Te(e) && e > 0 ? Math.floor(e) : 12, on = (e) => Te(e) && e > 0 ? Math.floor(e) : 1 / 0, sn = (e) => e === "vertical" || e === "horizontal" || e === null ? e : "vertical", rn = (e) => e === "layout" ? "layout" : "block", Ps = (e) => e === !0, et = (e) => ({
  id: e.i,
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Go = (e) => ({
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
}), jt = (e, t, o, s, r = {}) => {
  for (const n of t) {
    const i = e.find((f) => f.i === n);
    if (i) {
      if (i.w <= 0 || i.h <= 0 || i.x < 0 || i.y < 0 || i.x + i.w > o)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(s) && i.y + i.h > s)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (!r.allowOverlap) {
        const f = Et(e, i).filter((d) => d.i !== i.i);
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
}, Ao = (e, t, o) => e.w <= 0 || e.h <= 0 || e.w > t ? "bounds" : Number.isFinite(o) && e.h > o ? "maxRows" : null, Kt = (e, t, o) => Math.max(t, Math.min(e, o)), Qs = (e) => e.reduce((t, o) => Math.max(t, o.y + o.h), 0), nn = (e, t, o, s, r, n) => {
  if (!Te(o) || !Te(s)) return null;
  const i = {
    x: Math.floor(o),
    y: Math.floor(s)
  }, f = Kt(i.x, 0, Math.max(0, r - t.w)), d = Math.max(0, i.y), c = Number.isFinite(n) ? Math.floor(n) - t.h : Math.max(Qs(e), d);
  if (c < d) return null;
  for (let y = d; y <= c; y++) {
    const l = { ...t, x: f, y };
    if (jt([...e, l], [l.i], r, n).ok)
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
}, Es = (e, t, o) => {
  const s = new Set(o), r = new Map(t.map((n) => [n.i, n]));
  return e.filter((n) => {
    if (s.has(n.i)) return !1;
    const i = r.get(n.i);
    return !!(i && (n.x !== i.x || n.y !== i.y || n.w !== i.w || n.h !== i.h));
  }).map((n) => n.i);
}, cn = (e, t, o, s, r, n, i) => {
  var z, ne;
  const f = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (o !== "cursor" || f !== "top-left") return null;
  const d = sn(s.compactType), c = Ps(s.allowOverlap), y = Ps(s.preventCollision), l = t.map(Go), p = l.reduce((D, w) => ({
    x: Math.min(D.x, w.x),
    y: Math.min(D.y, w.y)
  }), { x: ((z = l[0]) == null ? void 0 : z.x) || 0, y: ((ne = l[0]) == null ? void 0 : ne.y) || 0 });
  let m = ce(e);
  const v = [], C = [], M = (D, w, P, A) => {
    const R = v.concat(w.filter((F) => l.some((S) => S.i === F)));
    return C.push(Xe(
      D === "collision" || D === "static-item" ? "grid-editor.placement.layout-collision-blocked" : D === "maxRows" ? "grid-editor.placement.layout-max-rows-blocked" : "grid-editor.placement.layout-bounds-blocked",
      "warning",
      P,
      { reason: D, itemIds: w, details: { collisionPolicy: "layout", compactType: d, allowOverlap: c, preventCollision: y } }
    )), {
      layout: A,
      failed: !0,
      blocked: { reason: D, itemIds: w, message: P },
      summary: {
        strategy: o,
        placementSource: o,
        collisionPolicy: "layout",
        insertedIds: R,
        shiftedIds: Es(e, A, R),
        before: e.map(et),
        after: A.map(et),
        diagnostics: C
      }
    };
  }, k = Te(i == null ? void 0 : i.x) ? i.x : p.x, L = Te(i == null ? void 0 : i.y) ? i.y : p.y, K = l.map((D) => {
    const w = Math.floor(k + D.x - p.x), P = Math.floor(L + D.y - p.y);
    return {
      ...D,
      x: Kt(w, 0, Math.max(0, r - D.w)),
      y: Number.isFinite(n) ? Kt(P, 0, Math.max(0, Math.floor(n) - D.h)) : Math.max(0, P)
    };
  });
  if (!c) {
    const D = K.find((w) => Et(K, w).length > 0);
    if (D)
      return M(
        "collision",
        [D.i, ...Et(K, D).map((w) => w.i)],
        "Placement group contains overlapping items.",
        e
      );
  }
  for (let D = 0; D < K.length; D++) {
    const w = K[D], P = l[D], A = Ao(P, r, n);
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
          before: e.map(et),
          after: [],
          diagnostics: C
        }
      };
    const R = m.concat(w), F = jt(
      R,
      [w.i],
      r,
      n,
      { allowOverlap: c }
    ), S = c ? [] : Et(m, w).filter((ie) => ie.i !== w.i);
    if (!F.ok && F.reason !== "collision")
      return M(
        F.reason,
        F.itemIds,
        "Placement target is outside the current grid constraints.",
        R
      );
    if (!c && S.some((ie) => ie.static)) {
      const ie = S.filter((Ce) => Ce.static).map((Ce) => Ce.i);
      return M(
        "static-item",
        [w.i, ...ie],
        "Placement target is blocked by a static item.",
        R
      );
    }
    if (y && !c && S.length > 0)
      return M(
        "collision",
        [w.i, ...S.map((ie) => ie.i)],
        "Placement target is blocked at the current cursor position.",
        R
      );
    if (c) {
      m = R, v.push(w.i);
      continue;
    }
    const E = Math.max(Qs(m), w.y) + w.h + D + 1, W = {
      ...w,
      y: E,
      static: !1
    }, N = m.concat(W), ye = N[N.length - 1], Be = ki(
      N,
      ye,
      d,
      r,
      c,
      w.x,
      w.y,
      !0,
      y
    ).map(
      (ie) => ie.i === w.i ? { ...ie, static: w.static === !0 } : ie
    ), se = d == null ? Be : Mi(Be, d, r, c);
    m = an(se), v.push(w.i);
    const q = jt(
      m,
      m.map((ie) => ie.i),
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
      shiftedIds: Es(e, m, v),
      before: e.map(et),
      after: m.map(et),
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
  const c = ce(e), y = [], l = [], p = t.map(Go), m = p.reduce((M, k) => ({
    x: Math.min(M.x, k.x),
    y: Math.min(M.y, k.y)
  }), { x: ((v = p[0]) == null ? void 0 : v.x) || 0, y: ((C = p[0]) == null ? void 0 : C.y) || 0 });
  for (let M = 0; M < p.length; M++) {
    const k = p[M], L = Ao(k, r, n);
    if (L)
      return l.push(Xe(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: L, itemIds: [k.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: L,
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
    let K = k.x, z = k.y;
    const ne = o === "cursor" && d === "top-left" && typeof s.placementSessionId == "string";
    if (o === "offset")
      K += i * (M + 1), z += i * (M + 1);
    else if (ne) {
      const P = Te(f == null ? void 0 : f.x) ? f.x : K, A = Te(f == null ? void 0 : f.y) ? f.y : z, R = k.x - m.x, F = k.y - m.y, S = Math.floor(P + R), E = Math.floor(A + F);
      K = Kt(S, 0, Math.max(0, r - k.w)), z = Number.isFinite(n) ? Kt(E, 0, Math.max(0, Math.floor(n) - k.h)) : Math.max(0, E), l.push(Xe(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: { x: S, y: E },
            placed: { x: K, y: z },
            clamped: K !== S || z !== E,
            shiftedDown: !1
          }
        }
      ));
    } else if (o === "nearest-fit" || o === "cursor") {
      const P = o === "cursor" && d === "top-left" ? nn(
        c,
        k,
        Te(f == null ? void 0 : f.x) ? f.x : K,
        Te(f == null ? void 0 : f.y) ? f.y : z,
        r,
        n
      ) : null, A = P || wi(
        c,
        k,
        r,
        Te(f == null ? void 0 : f.x) ? f.x : K,
        Te(f == null ? void 0 : f.y) ? f.y : z,
        n
      );
      A && (K = A.x, z = A.y, P && l.push(Xe(
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
      const P = ts(c, k, r, n);
      P && (K = P.x, z = P.y);
    }
    const D = {
      ...k,
      x: Math.max(0, Math.floor(K)),
      y: Math.max(0, Math.floor(z))
    }, w = jt([...c, D], [D.i], r, n);
    if (!w.ok) {
      if (ne) {
        const A = (w.reason === "maxRows" || Number.isFinite(n), w.reason), R = [...c, D], F = y.concat(D.i);
        return l.push(Xe(
          A === "collision" ? "grid-editor.placement.collision-blocked" : A === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.bounds-blocked",
          "warning",
          "Placement target is blocked at the current cursor position.",
          { reason: A, itemIds: w.itemIds }
        )), {
          layout: R,
          failed: !0,
          blocked: {
            reason: A,
            itemIds: w.itemIds,
            message: "Placement target is blocked at the current cursor position."
          },
          summary: {
            strategy: o,
            placementSource: o,
            insertedIds: F,
            shiftedIds: [],
            before: [],
            after: R.filter((S) => F.includes(S.i)).map(et),
            diagnostics: l
          }
        };
      }
      const P = ts(c, k, r, n);
      if (!P) {
        const A = w.reason === "maxRows" || Number.isFinite(n) ? "maxRows" : w.reason;
        return l.push(Xe(
          A === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.collision-unresolved",
          "warning",
          "No legal placement was available for the item.",
          { reason: A, itemIds: w.itemIds }
        )), {
          layout: e,
          failed: !0,
          blocked: {
            reason: A,
            itemIds: w.itemIds,
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
      after: c.filter((M) => y.includes(M.i)).map(et),
      diagnostics: l
    }
  };
}, ln = (e, t, o, s) => {
  const r = ce(e), n = t.map(Go), i = n.map((k) => k.i), f = r.map((k) => k.i), d = r.map(et), c = [];
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
    const L = Ao(k, o, s);
    if (L)
      return c.push(Xe(
        "grid-editor.placement.invalid-item",
        "error",
        "Inserted item cannot fit within the current grid bounds.",
        { reason: L, itemIds: [k.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: L,
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
  })), C = [...p, ...v], M = jt(C, C.map((k) => k.i), o, s);
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
      after: C.map(et),
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
}, vt = (e, t, o, s = {}) => {
  const r = o === "offset" || o === "cursor" || o === "nearest-fit" || o === "first-fit" || o === "insert-top-shift" ? o : "first-fit", n = tn(s.cols), i = on(s.maxRows);
  return r === "insert-top-shift" ? ln(e, t, n, i) : dn(e, t, r, s, n, i);
};
let un = 0;
const zo = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, at = (e) => typeof e == "number" && Number.isFinite(e), ei = (e) => at(e) && e > 0 ? Math.floor(e) : 12, ti = (e) => at(e) && e > 0 ? Math.floor(e) : 1 / 0, oi = (e, t = "first-fit") => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift" ? e : t, si = (e, t = "block") => e === "layout" ? "layout" : t, ii = (e, t) => e === "vertical" || e === "horizontal" || e === null ? e : t, no = (e, t) => typeof e == "boolean" ? e : t, ri = (e) => {
  if (!(!e || !at(e.x) || !at(e.y)))
    return {
      ...e,
      x: Math.max(0, Math.floor(e.x)),
      y: Math.max(0, Math.floor(e.y))
    };
}, fn = (e, t) => ({
  ...e,
  i: typeof e.i == "string" && e.i.length > 0 ? e.i : `placement-item-${t + 1}`,
  x: at(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: at(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: at(e.w) ? Math.max(1, Math.floor(e.w)) : 1,
  h: at(e.h) ? Math.max(1, Math.floor(e.h)) : 1
}), yn = (e) => (Array.isArray(e.items) ? e.items : e.item ? [e.item] : []).filter((o) => o && typeof o == "object").map((o, s) => fn(o, s)), Rt = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), To = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), ni = (e, t, o, s) => {
  const r = t || e, n = new Map(o.before.map((c) => [c.id, c])), i = new Map(o.after.map((c) => [c.id, c])), f = [], d = /* @__PURE__ */ new Set();
  return o.shiftedIds.slice().sort().forEach((c) => {
    const y = n.get(c) || Ee(e, c), l = i.get(c) || Ee(r, c);
    !y || !l || (d.add(c), f.push({
      id: c,
      before: Rt(y),
      after: Rt(l),
      kind: "shift"
    }));
  }), Array.from(i.keys()).sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = n.get(c) || Ee(e, c), l = i.get(c) || Ee(r, c);
    !y || !l || y.x === l.x && y.y === l.y && y.w === l.w && y.h === l.h || (d.add(c), f.push({
      id: c,
      before: Rt(y),
      after: Rt(l),
      kind: "predicted"
    }));
  }), ((s == null ? void 0 : s.reason) === "collision" || (s == null ? void 0 : s.reason) === "bounds" || (s == null ? void 0 : s.reason) === "maxRows") && (s.itemIds || []).slice().sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = Ee(e, c) || Ee(r, c);
    y && (d.add(c), f.push({
      id: c,
      before: Rt(y),
      after: Rt(y),
      kind: "collision"
    }));
  }), f;
}, Jn = (e, t, o, s) => ni(e, t, o, s), Qn = (e = [], t) => {
  const o = e.slice();
  return t && !o.some((s) => s.reason === t.reason) && o.push(To(
    `grid-editor.placement.blocked.${t.reason}`,
    "warning",
    t.message || `Placement blocked by ${t.reason}.`,
    { reason: t.reason, itemIds: t.itemIds }
  )), o;
}, ea = (e) => ce(e), pn = (e, t, o, s) => {
  const r = new Map(e.items.map((n, i) => [o[i], n.i]));
  return o.map((n) => {
    const i = Ee(t || e.items, n) || Ee(e.items, r.get(n) || n);
    return i ? {
      id: n,
      item: Po(i),
      state: s,
      sourceId: r.get(n)
    } : null;
  }).filter(Boolean);
}, Co = (e, t = {}, o = {}) => {
  var M, k, L, K, z;
  const s = ri(t.cursor) || e.cursor, r = oi(t.strategy || e.strategy, e.strategy), n = si(t.collisionPolicy, e.collisionPolicy), i = ii(t.compactType, e.compactType), f = no(t.allowOverlap, e.allowOverlap), d = no(t.preventCollision, e.preventCollision), c = ei((M = t.cols) != null ? M : e.cols), y = ti((k = t.maxRows) != null ? k : e.maxRows), l = {
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
  }, p = vt(
    e.baseLayout,
    e.items,
    r,
    l
  ), m = p.failed && p.summary.insertedIds.length === 0 ? void 0 : p.layout, v = p.failed ? {
    reason: ((L = p.blocked) == null ? void 0 : L.reason) || "bounds",
    itemIds: (K = p.blocked) == null ? void 0 : K.itemIds,
    message: ((z = p.blocked) == null ? void 0 : z.message) || "Placement could not produce a valid candidate.",
    recoverable: !0
  } : void 0, C = p.summary.diagnostics.slice();
  return v && C.push(To(
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
      p.summary.insertedIds.length ? p.summary.insertedIds : e.items.map((ne) => ne.i),
      v ? "blocked" : "preview"
    ),
    affectedOutlines: ni(e.baseLayout, m, p.summary, v),
    diagnostics: C,
    blocked: v,
    updatedAt: (o.now || zo)(),
    previewSeq: e.previewSeq + 1
  };
}, mn = (e, t) => {
  var i, f, d;
  const o = (t.now || zo)(), s = e.commandType || (e.source === "paste" ? "paste" : "add"), r = e.resolvedClipboardPayload ? ce(e.resolvedClipboardPayload.items) : yn(e), n = {
    id: t.id || `grid-editor-placement:${++un}`,
    phase: "starting",
    source: e.source,
    commandType: s,
    baseRevision: t.baseRevision,
    baseLayout: ce(t.baseLayout),
    items: r,
    editorMetaById: Se(
      ((i = e.resolvedClipboardPayload) == null ? void 0 : i.editorMetaById) || e.editorMetaById,
      { layout: r }
    ),
    resolvedClipboardPayload: e.resolvedClipboardPayload ? {
      ...e.resolvedClipboardPayload,
      items: ce(e.resolvedClipboardPayload.items),
      editorMetaById: Se(e.resolvedClipboardPayload.editorMetaById, {
        layout: e.resolvedClipboardPayload.items
      })
    } : void 0,
    strategy: oi(e.strategy, t.defaultStrategy || "first-fit"),
    collisionPolicy: si(e.collisionPolicy),
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor,
    compactType: ii(e.compactType),
    allowOverlap: no(e.allowOverlap),
    preventCollision: no(e.preventCollision),
    cursor: ri(e.cursor),
    size: r[0] ? { w: r[0].w, h: r[0].h } : void 0,
    origin: e.origin,
    cols: ei((f = e.cols) != null ? f : t.cols),
    maxRows: ti((d = e.maxRows) != null ? d : t.maxRows),
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
      diagnostics: [To(
        "grid-editor.placement.invalid-item",
        "error",
        c.message || "No items were provided for placement.",
        { reason: c.reason }
      )],
      updatedAt: o
    };
  }
  return Co(n, {}, { now: () => o });
}, gn = (e, t = {}) => {
  var s, r, n, i;
  const o = {
    items: e.commandType === "add" ? ce(e.items) : void 0,
    item: e.commandType === "add" && e.items.length === 1 ? Po(e.items[0]) : void 0,
    editorMetaById: e.commandType === "add" ? Se(e.editorMetaById) : void 0,
    resolvedClipboardPayload: e.commandType === "paste" ? {
      items: ce(e.items),
      editorMetaById: Se(e.editorMetaById, { layout: e.items }),
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
    placementCandidateLayout: e.candidateLayout ? ce(e.candidateLayout) : void 0
  };
  return {
    type: e.commandType,
    payload: o,
    source: t.source || "api",
    origin: e.origin
  };
}, hn = (e, t = "cancelled", o = {}) => ({
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
    updatedAt: (o.now || zo)()
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
  const o = Ys(t.type), s = e.canExecute({
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
}, Ro = (e) => e.kind === "layout" ? e.layout : e.layouts[e.breakpoint] || [], Bs = (e) => ({
  layoutSize: Ro(e).length,
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
}, $s = (e, t, o = {}) => {
  const s = Ht(
    Ro(e),
    Ro(t)
  ), r = o.metadataPatches || wn(e.editorMetaById, t.editorMetaById), n = o.sectionRowPatches || kn(e.sectionRows, t.sectionRows), i = ho(s, r);
  return n.forEach((f) => i.push(f.id)), {
    layoutPatches: s,
    metadataPatches: r,
    sectionRowPatches: n,
    affectedIds: Array.from(new Set(i)),
    beforeSummary: Bs(e),
    afterSummary: Bs(t),
    risk: o.risk
  };
}, go = {
  activeId: null,
  guides: [],
  displayGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}, Gs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Pt = (e) => Se(e), Ze = (e) => ({
  ...e,
  selectedIds: e.selectedIds.slice()
}), st = (e) => ({
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
}), it = (e, t) => {
  let o = 1, s = `${e}-copy`;
  for (; t.has(s); )
    o += 1, s = `${e}-copy-${o}`;
  return t.add(s), s;
}, Mn = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e), _ = (e) => typeof e == "number" && Number.isFinite(e), Ne = (e, t) => Math.max(1, Math.floor(_(e) ? e : t)), qt = (e) => e.payload && typeof e.payload == "object" ? e.payload : {}, Sn = (e) => e === "vertical" || e === "horizontal" || e === null, As = (e) => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift", zs = (e) => e === "s" || e === "w" || e === "e" || e === "n" || e === "sw" || e === "nw" || e === "se" || e === "ne", Ts = (e) => e || "invalid-input", Cn = (e, t, o) => {
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
}, Ot = (e, t, o, s) => {
  const r = {};
  return { items: e.map((i) => {
    const f = s(i.i, o);
    return t[i.i] && (r[f] = { ...t[i.i] }), { ...Po(i), i: f };
  }), metaById: r };
}, ai = (e) => {
  var jo;
  const t = e.kind || (e.layouts ? "responsive" : "layout"), o = Pe([]), s = Pe({}), r = e.layout || o, n = e.layouts || s, i = e.breakpoint || Pe("default"), f = !e.mode && !e.defaultMode, d = Pe(e.defaultMode || "view"), c = e.mode || d, y = Pe(
    Se(e.defaultEditorMetaById)
  ), l = e.editorMetaById || y, p = Pe(
    e.defaultSectionRows || Hs()
  ), m = e.sectionRows || p, v = Pe(
    Ae(
      ((jo = e.selectedIds) == null ? void 0 : jo.value) || e.defaultSelectedIds || [],
      e.selectedIds ? "external" : "api"
    )
  ), C = Pe(null), M = Pe({ ...go }), k = Pe(null), L = Pe(null), K = Pe(null), z = Pe(!1), ne = Pe(!1), D = Pe(v.value.activeId), w = Pe(!1), P = [];
  let A = 0, R = 0;
  const F = (a) => {
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
    } catch (h) {
      if (a.type !== "editor-error")
        try {
          (I = e.onEvent) == null || I.call(e, {
            type: "editor-error",
            code: "editor-event-listener-error",
            message: "Grid editor event listener failed.",
            details: h
          });
        } catch (x) {
        }
    }
  }, E = () => t === "responsive" ? ce(n.value[i.value] || []) : ce(r.value), W = (a) => {
    A += 1, F(() => {
      t === "responsive" ? (n.value = {
        ...n.value,
        [i.value]: ce(a)
      }, e.layout && (r.value = ce(a))) : r.value = ce(a);
    });
  }, N = () => t === "responsive" ? eo(n.value) : { default: ce(r.value) }, ye = (a, u = i.value) => {
    A += 1, F(() => {
      n.value = eo(a), i.value = u, e.layout && (r.value = ce(a[u] || []));
    });
  }, he = () => t === "responsive" ? {
    kind: "responsive",
    layouts: N(),
    breakpoint: i.value,
    editorMetaById: Pt(l.value),
    sectionRows: st(m.value),
    selection: Ze(v.value),
    focusId: D.value
  } : {
    kind: "layout",
    layout: E(),
    editorMetaById: Pt(l.value),
    sectionRows: st(m.value),
    selection: Ze(v.value),
    focusId: D.value
  }, Be = (a) => {
    A += 1, a.kind === "responsive" ? ye(a.layouts, a.breakpoint) : W(a.layout), l.value = Pt(a.editorMetaById), m.value = st(a.sectionRows), v.value = Ze(a.selection), D.value = a.focusId;
  }, se = Pe(he()), q = e.history === !1 ? null : e.history || Or();
  q == null || q.replacePresent(he());
  const ie = ds(() => !Ke(he(), se.value)), Ce = ds(() => C.value ? "conflict" : ne.value ? "savePending" : z.value ? "saveFailed" : K.value ? K.value : k.value ? "placing" : c.value === "view" ? "viewing" : ie.value ? "editingDirty" : "editingClean"), je = Mn(e.persistence) ? e.persistence : null, We = Xr({
    getEditorMetaById: () => l.value,
    getSectionRows: () => m.value,
    setEditorMetaById: (a, u) => {
      A += 1, l.value = Se(a, { layout: E() }), (u === "save-success" || u === "load-success") && (se.value = he());
    },
    setSectionRows: (a, u) => {
      A += 1, m.value = {
        version: 1,
        items: a.items,
        itemMembership: a.itemMembership
      }, (u === "save-success" || u === "load-success") && (se.value = he());
    },
    persistence: je,
    onSaveStateChange: (a) => {
      ne.value = a.status === "saving", z.value = a.status === "error", S({
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
  }), tt = (a, u = !1) => {
    const I = v.value, h = Ve(
      a,
      E(),
      l.value,
      a.source
    );
    return e.selectedIds ? (S({
      type: "selection-change",
      selection: h,
      previous: I,
      requested: !0
    }), I) : Ke(I, h) ? I : (A += 1, v.value = h, D.value = h.activeId, S({
      type: "selection-change",
      selection: h,
      previous: I,
      requested: u
    }), h);
  }, Ye = (a, u, I, h = ((x) => (x = u.diagnostics) == null ? void 0 : x.guardMs)() || 0) => {
    var G, O, be;
    const g = Lt(
      a.history,
      Jt(a.type)
    ), $ = {
      ...u,
      diagnostics: {
        ...u.diagnostics,
        durationMs: Gs() - I,
        guardMs: h,
        historyMode: ((G = u.diagnostics) == null ? void 0 : G.historyMode) || g.mode,
        source: ((O = u.diagnostics) == null ? void 0 : O.source) || a.source,
        origin: ((be = u.diagnostics) == null ? void 0 : be.origin) || a.origin
      }
    };
    return L.value = $, $.status === "blocked" || $.status === "cancelled" || $.status === "timeout" ? S({ type: "command-blocked", command: a, result: $ }) : $.status === "error" ? S({ type: "command-error", command: a, result: $ }) : S({ type: "command-commit", command: a, result: $ }), K.value === "keyboardEditing" && a.source === "keyboard" && (K.value = null), $;
  }, It = (a, u, I, h) => {
    var G, O;
    const x = Lt(
      a.history,
      Jt(a.type)
    );
    if (I.diagnostics = {
      durationMs: ((G = I.diagnostics) == null ? void 0 : G.durationMs) || 0,
      ...I.diagnostics,
      historyMode: x.mode,
      source: a.source,
      origin: a.origin
    }, !q)
      return I;
    if (x.mode === "clear")
      return q.clear(he()), I;
    if (x.mode === "replace")
      return q.replacePresent(he(), {
        preserveRedoStack: x.preserveRedoStack
      }), I;
    if (x.mode === "ignore" || !$i(a.type))
      return I;
    const g = h || he(), $ = Lr({
      commandId: a.id,
      commandType: a.type,
      before: u,
      after: g,
      mergeKey: x.mergeKey,
      source: a.source,
      origin: a.origin,
      targetIds: I.targetIds,
      affectedIds: I.affectedIds,
      historyMode: x.mode
    });
    return q.push($, {
      preserveRedoStack: x.preserveRedoStack || x.mode === "record-preserveRedoStack"
    }), I.undo = $, t === "layout" && ((O = e.legacyHistoryStore) == null || O.push(E())), I;
  }, xt = (a) => to(a.type).mutualExclusionScope || "global", wt = (a, u, I) => {
    const h = to(a.type);
    return {
      id: `${a.id}:transaction`,
      commandId: a.id,
      command: a,
      source: a.source || h.defaultSource || "api",
      origin: a.origin,
      scope: xt(a),
      before: u,
      after: I,
      preview: $s(u, I, {
        risk: h.risk
      }),
      history: Lt(
        a.history,
        h.defaultHistory.mode || Jt(a.type)
      )
    };
  }, dt = (a, u, I) => {
    if (e.selectedIds) {
      Ke(a.selection, u.selection) || S({
        type: "selection-change",
        selection: Ze(u.selection),
        previous: Ze(a.selection),
        requested: !0
      });
      return;
    }
    Ke(a.selection, I.selection) || S({
      type: "selection-change",
      selection: Ze(I.selection),
      previous: Ze(a.selection)
    }), a.focusId !== I.focusId && S({
      type: "focus-change",
      from: a.focusId,
      to: I.focusId,
      reason: "transaction"
    });
  }, me = (a, u, I, h = {}) => {
    const x = !!e.selectedIds, g = x ? ot(I, {
      selection: u.selection,
      focusId: u.focusId
    }) : I, $ = wt(a, u, g), G = !Ke(u, g), O = h.status || (G ? "changed" : "noop"), be = Ie(a, O, {
      ...h,
      targetIds: h.targetIds || $.preview.affectedIds,
      layoutPatches: h.layoutPatches || $.preview.layoutPatches,
      metadataPatches: h.metadataPatches || $.preview.metadataPatches,
      affectedIds: h.affectedIds || $.preview.affectedIds,
      selection: h.selection || g.selection,
      diagnostics: {
        durationMs: 0,
        ...h.diagnostics
      }
    });
    if (G)
      try {
        Be($.after), dt(u, I, $.after);
      } catch (H) {
        try {
          Be($.before);
        } catch (V) {
        }
        return is(a, "Editor transaction apply failed.", H);
      }
    else x && dt(u, I, $.after);
    return It(a, u, be, $.after);
  }, qe = (a) => typeof e.layoutEngineOptions == "function" ? e.layoutEngineOptions() : e.layoutEngineOptions ? e.layoutEngineOptions : _(a.cols) ? {
    cols: Math.max(1, Math.floor(a.cols)),
    maxRows: _(a.maxRows) ? a.maxRows : 1 / 0,
    compactType: Sn(a.compactType) ? a.compactType : "vertical",
    allowOverlap: a.allowOverlap === !0,
    preventCollision: a.preventCollision === !0
  } : null, Bt = (a) => {
    const u = qe(a);
    return u ? u.cols : _(a.cols) && a.cols > 0 ? Math.floor(a.cols) : void 0;
  }, co = (a) => {
    const u = {}, I = Bt(a);
    return I && (u.cols = I), typeof a.breakpoint == "string" && (u.breakpoint = a.breakpoint), typeof a.layoutId == "string" && (u.layoutId = a.layoutId), typeof a.viewFormat == "string" && (u.viewFormat = a.viewFormat), Object.keys(u).length > 0 ? u : void 0;
  }, b = async (a, u, I, h) => {
    const x = `${a.id}:layout`;
    if (e.layoutOperationRunner)
      return await e.layoutOperationRunner({
        commandId: a.id,
        layout: u,
        operation: I,
        phase: "commit",
        source: a.source || "api"
      });
    const g = qe(h);
    return g ? await Promise.resolve(vo({
      id: x,
      phase: "commit",
      layout: u,
      operation: I,
      options: g
    })) : Cn(x, u, I);
  }, B = (a) => {
    var x, g, $, G;
    const u = (x = e.itemCapabilities) == null ? void 0 : x[a], I = ((g = e.resizeConstraints) == null ? void 0 : g[a]) || (($ = u == null ? void 0 : u.resizeConstraint) == null ? void 0 : $.aspectRatio), h = ((G = u == null ? void 0 : u.resizeConstraint) == null ? void 0 : G.handlePolicy) || (u != null && u.resizeHandles ? {
      allowedHandles: u.resizeHandles,
      blockedReason: "handle-disabled"
    } : void 0);
    if (!(!I && !h))
      return { aspectRatio: I, handlePolicy: h };
  }, Z = async (a) => {
    try {
      return await a.read();
    } catch (u) {
      if (a !== gt)
        return gt.read();
      throw u;
    }
  }, re = async (a, u) => {
    try {
      await a.write(u);
    } catch (I) {
      if (a !== gt) {
        await gt.write(u);
        return;
      }
      throw I;
    }
  }, U = () => !e.clipboard || e.clipboard === "internal" ? gt : e.clipboard === "system" ? Hr() : e.clipboard, xe = (a, u) => ({
    durationMs: 0,
    computed: {
      placement: {
        ...a.summary,
        collisionPolicy: (u == null ? void 0 : u.collisionPolicy) === "layout" || (u == null ? void 0 : u.collisionPolicy) === "block" ? u.collisionPolicy : a.summary.collisionPolicy,
        sessionId: typeof (u == null ? void 0 : u.placementSessionId) == "string" ? u.placementSessionId : a.summary.sessionId,
        source: typeof (u == null ? void 0 : u.placementSource) == "string" ? u.placementSource : a.summary.source
      }
    },
    messages: a.summary.diagnostics.map((h) => ({
      code: h.code,
      level: h.level,
      message: h.message,
      itemIds: h.itemIds,
      recoverable: h.level !== "error"
    }))
  }), we = (a) => ({
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
  }), ue = (a, u, I, h = [], x) => ({
    status: "blocked",
    blocked: {
      reason: u,
      itemIds: h,
      message: I
    },
    diagnostics: x || {
      durationMs: 0,
      messages: [{
        code: `grid-editor.placement.${u}`,
        level: u === "invalid-input" ? "error" : "warning",
        message: I,
        itemIds: h,
        recoverable: u !== "invalid-input"
      }]
    }
  }), De = (a) => {
    if (a.commandType && a.commandType !== "add" || a.source === "paste") return a;
    const u = Array.isArray(a.items) ? a.items : a.item ? [a.item] : [];
    if (u.length === 0) return a;
    const I = new Set(E().map((G) => G.i)), h = e.idGenerator || it, x = a.editorMetaById || {}, g = {}, $ = u.filter((G) => G && typeof G == "object").map((G, O) => {
      const be = typeof G.i == "string" && G.i.length > 0 ? G.i : `item-${O + 1}`, H = I.has(be) ? h(be, I) : be;
      return I.add(H), x[be] && (g[H] = { ...x[be] }), {
        ...G,
        i: H,
        x: _(G.x) ? G.x : 0,
        y: _(G.y) ? G.y : 0,
        w: Ne(G.w, 1),
        h: Ne(G.h, 1)
      };
    });
    return {
      ...a,
      commandType: "add",
      item: void 0,
      items: $,
      editorMetaById: Se(g, { layout: $ })
    };
  }, Fe = (a) => {
    const u = k.value;
    return u ? (k.value = null, M.value = { ...go }, S({ type: "placement-cancel", sessionId: u.id, reason: a }), u) : null;
  }, Je = (a, u, I, h) => {
    for (let x = 0; x < u.length; x++) {
      const g = Ee(a, u[x]);
      if (!g) continue;
      if (g.x < 0 || g.y < 0 || g.x + g.w > I)
        return { ok: !1, reason: "bounds", itemIds: [g.i] };
      if (Number.isFinite(h) && g.y + g.h > h)
        return { ok: !1, reason: "maxRows", itemIds: [g.i] };
      const $ = Et(a, g).filter((G) => G.i !== g.i);
      if ($.length > 0)
        return {
          ok: !1,
          reason: "collision",
          itemIds: [g.i, ...$.map((G) => G.i)]
        };
    }
    return { ok: !0 };
  }, lt = (a, u) => {
    const I = Le(m.value, u), h = [], x = [];
    return a.forEach((g) => {
      const $ = I.itemMembership[g], G = $ != null && $.sectionId ? I.items[$.sectionId] : void 0, O = $ != null && $.rowId ? I.items[$.rowId] : void 0;
      G != null && G.locked || O != null && O.locked ? h.push(g) : (G != null && G.collapsed || O != null && O.collapsed) && x.push(g);
    }), h.length > 0 ? { reason: "section-row-locked", itemIds: h } : x.length > 0 ? { reason: "section-row-collapsed", itemIds: x } : null;
  }, ut = (a, u) => {
    const I = new Set(u), h = /* @__PURE__ */ new Set();
    return Object.keys(a.itemMembership).forEach((x) => {
      const g = a.itemMembership[x];
      (g.sectionId && I.has(g.sectionId) || g.rowId && I.has(g.rowId)) && h.add(x);
    }), u.forEach((x) => {
      var g, $;
      ($ = (g = a.items[x]) == null ? void 0 : g.itemIds) == null || $.forEach((G) => h.add(G));
    }), Array.from(h).sort();
  }, Xt = (a, u) => {
    if (_(u.order)) return u.order;
    const I = Object.values(a.items).slice().sort((g, $) => g.order - $.order || g.id.localeCompare($.id)), h = u.beforeId ? a.items[u.beforeId] : void 0, x = u.afterId ? a.items[u.afterId] : void 0;
    if (h) {
      const g = I[I.findIndex(($) => $.id === h.id) - 1];
      return g ? (g.order + h.order) / 2 : h.order - 1;
    }
    if (x) {
      const g = I[I.findIndex(($) => $.id === x.id) + 1];
      return g ? (x.order + g.order) / 2 : x.order + 1;
    }
    return I.length > 0 ? I[I.length - 1].order + 1 : 0;
  }, lo = async (a, u, I, h) => {
    var Re, $t, Gt, Ko, Xo, Yo, _o, Uo, Wo, qo, Vo, Zo, Jo, Qo, es;
    const x = E(), g = qt(a), $ = [];
    let G, O = ce(x), be = Ze(h.selection), H = h.focusId;
    const V = fo(a.type) ? lt(u, x) : null;
    if (V)
      return Ie(a, "blocked", {
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
    const ee = Do(a);
    if (ee && fo(a.type)) {
      const j = $.slice();
      if (a.type === "add") {
        const J = Se(g.editorMetaById, {
          layout: ee
        });
        Object.keys(J).forEach((_e) => {
          j.push({ type: "set", id: _e, next: J[_e] });
        });
      } else if (a.type === "paste") {
        const J = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, _e = Se(J == null ? void 0 : J.editorMetaById, {
          layout: ee
        });
        Object.keys(_e).forEach((Mt) => {
          j.push({ type: "set", id: Mt, next: _e[Mt] });
        });
      }
      const X = Ht(x, ee), Y = X.flatMap(
        (J) => J.type === "add" ? [J.item.i] : []
      ), te = X.flatMap(
        (J) => J.type === "move" || J.type === "resize" ? [J.id] : []
      ), de = ho(X, j), oe = typeof g.placementSessionId == "string" ? {
        durationMs: 0,
        computed: {
          placement: {
            strategy: As(g.strategy) ? g.strategy : "first-fit",
            placementSource: As(g.strategy) ? g.strategy : "first-fit",
            collisionPolicy: g.collisionPolicy === "layout" || g.collisionPolicy === "block" ? g.collisionPolicy : void 0,
            sessionId: g.placementSessionId,
            source: typeof g.placementSource == "string" ? g.placementSource : void 0,
            insertedIds: Y,
            shiftedIds: te,
            before: x.map((J) => ({
              id: J.i,
              x: J.x,
              y: J.y,
              w: J.w,
              h: J.h
            })),
            after: ee.map((J) => ({
              id: J.i,
              x: J.x,
              y: J.y,
              w: J.w,
              h: J.h
            })),
            diagnostics: Array.isArray((Re = g.placementSummary) == null ? void 0 : Re.diagnostics) ? g.placementSummary.diagnostics : []
          }
        }
      } : G, le = yt(
        Dt(h.editorMetaById, j),
        ee
      ), $e = Y.length > 0 && (a.type === "add" || a.type === "paste") ? Ae(Y, "api") : Ve(
        h.selection,
        ee,
        le,
        "api"
      );
      return me(a, h, ot(h, {
        layout: ee,
        editorMetaById: le,
        selection: $e,
        focusId: $e.activeId
      }), {
        status: de.length > 0 ? "changed" : "noop",
        targetIds: u.length > 0 ? u : a.targetIds,
        layoutPatches: X,
        metadataPatches: j,
        affectedIds: de,
        selection: $e,
        blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
        diagnostics: oe
      });
    }
    if (ns(a.type)) {
      const j = g, X = Le(m.value, x), Y = u.length > 0 ? u : j.id ? [j.id] : [], te = Y.filter((ge) => !X.items[ge]);
      if (te.length > 0)
        return Ie(a, "blocked", {
          targetIds: Y,
          blocked: {
            reason: "missing-item",
            itemIds: te,
            message: "Section/row command referenced missing metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.missing",
              level: "warning",
              message: "Section/row command referenced missing metadata.",
              itemIds: te,
              recoverable: !0
            }]
          }
        });
      const de = Y.filter((ge) => {
        var ke;
        return (ke = X.items[ge]) == null ? void 0 : ke.locked;
      });
      if (de.length > 0 && a.type !== "section-row-expand")
        return Ie(a, "blocked", {
          targetIds: Y,
          blocked: {
            reason: "section-row-locked",
            itemIds: ut(X, de),
            message: "Section/row command blocked by locked metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.locked",
              level: "warning",
              message: "Section/row command blocked by locked metadata.",
              itemIds: de,
              recoverable: !0
            }]
          }
        });
      const oe = st({
        items: X.items,
        itemMembership: X.itemMembership
      }), le = ut(X, Y);
      let $e = v.value.selectedIds.slice(), J = D.value;
      const _e = _(g.cols) ? g.cols : 12, Mt = _(g.maxRows) ? g.maxRows : 1 / 0;
      if (a.type === "section-row-collapse" || a.type === "section-row-expand") {
        const ge = a.type === "section-row-collapse";
        Y.forEach((ke) => {
          oe.items[ke] = { ...oe.items[ke], collapsed: ge };
        }), ge && ($e = $e.filter((ke) => !le.includes(ke)), J && le.includes(J) && (J = $e[0] || null));
      } else if (a.type === "section-row-reorder")
        Y.forEach((ge) => {
          oe.items[ge] = {
            ...oe.items[ge],
            order: Xt(X, j)
          };
        });
      else if (a.type === "section-row-move") {
        const ge = _(j.dy) ? Math.floor(j.dy) : 0;
        O = O.map(
          (He) => le.includes(He.i) ? { ...He, y: Math.max(0, He.y + ge) } : He
        ), Y.forEach((He) => {
          const Ue = oe.items[He];
          oe.items[He] = {
            ...Ue,
            bounds: Ue.bounds ? { ...Ue.bounds, y: Math.max(0, Ue.bounds.y + ge) } : Ue.bounds
          };
        });
        const ke = Je(O, le, _e, Mt);
        if (!ke.ok)
          return Ie(a, "blocked", {
            targetIds: Y,
            blocked: {
              reason: ke.reason,
              itemIds: ke.itemIds,
              message: `Section/row move blocked by ${ke.reason}.`
            },
            diagnostics: {
              durationMs: 0,
              messages: [{
                code: `grid-editor.sectionRows.move.${ke.reason}`,
                level: "warning",
                message: `Section/row move blocked by ${ke.reason}.`,
                itemIds: ke.itemIds,
                recoverable: !0
              }]
            }
          });
      } else a.type === "section-row-delete" && (Y.forEach((ge) => {
        delete oe.items[ge];
      }), Object.keys(oe.itemMembership || {}).forEach((ge) => {
        var Ue, Tt;
        const ke = ((Ue = oe.itemMembership) == null ? void 0 : Ue[ge]) || {}, He = {
          sectionId: ke.sectionId && Y.includes(ke.sectionId) ? void 0 : ke.sectionId,
          rowId: ke.rowId && Y.includes(ke.rowId) ? void 0 : ke.rowId
        };
        !He.sectionId && !He.rowId ? (Tt = oe.itemMembership) == null || delete Tt[ge] : oe.itemMembership && (oe.itemMembership[ge] = He);
      }), j.deleteItems === !0 && (O = O.filter((ge) => !le.includes(ge.i)), le.forEach((ge) => {
        l.value[ge] && $.push({ type: "remove", id: ge, previous: l.value[ge] });
      }), $e = $e.filter((ge) => !le.includes(ge)), J && le.includes(J) && (J = $e[0] || null)));
      const uo = Le(oe, O), Qe = Ht(x, O), At = {
        version: 1,
        items: uo.items,
        itemMembership: uo.itemMembership
      }, St = yt(
        Dt(h.editorMetaById, $),
        O
      ), ze = Ve(
        Ae($e, "api"),
        O,
        St,
        "api"
      ), zt = Array.from(/* @__PURE__ */ new Set([...Y, ...le]));
      return me(a, h, ot(h, {
        layout: O,
        editorMetaById: St,
        sectionRows: At,
        selection: ze,
        focusId: J
      }), {
        status: "changed",
        targetIds: Y,
        layoutPatches: Qe,
        metadataPatches: $,
        affectedIds: zt,
        selection: ze,
        diagnostics: {
          durationMs: 0,
          computed: {
            affectedIds: zt,
            sectionRowContext: {
              source: "metadata"
            }
          },
          messages: [{
            code: `grid-editor.sectionRows.${a.type.replace("section-row-", "")}`,
            level: "info",
            message: `Section/row command ${a.type} applied.`,
            itemIds: le,
            recoverable: !0
          }]
        }
      });
    }
    if (a.type === "select") {
      const j = v.value, X = Is(x, v.value, {
        id: typeof g.id == "string" ? g.id : void 0,
        ids: Array.isArray(g.ids) ? g.ids.filter((de) => typeof de == "string") : typeof g.id == "string" ? void 0 : u,
        toggle: g.toggle === !0,
        range: g.range === !0,
        source: a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
      }), Y = Ve(
        X,
        x,
        h.editorMetaById,
        X.source
      ), te = e.selectedIds ? j : Y;
      return me(a, h, ot(h, {
        selection: Y,
        focusId: Y.activeId
      }), {
        status: Ke(j, te) ? "noop" : "changed",
        targetIds: te.selectedIds,
        selection: te
      });
    }
    if (a.type === "clearSelection") {
      const j = v.value, X = Ve(
        xo("api"),
        x,
        h.editorMetaById,
        "api"
      ), Y = e.selectedIds ? j : X;
      return me(a, h, ot(h, {
        selection: X,
        focusId: X.activeId
      }), {
        status: Ke(j, Y) ? "noop" : "changed",
        selection: Y
      });
    }
    if (a.type === "move") {
      const j = _(g.dx) ? g.dx : null, X = _(g.dy) ? g.dy : null, Y = _(g.x), te = _(g.y), de = Array.from(/* @__PURE__ */ new Set([...u, ...I])), oe = v.value.activeId && u.includes(v.value.activeId) ? v.value.activeId : u[0], le = oe ? Ee(x, oe) : void 0, $e = ((($t = a.targetIds) == null ? void 0 : $t.filter(Boolean).length) || 0) > 1, J = !a.targetIds && v.value.selectedIds.length > 1 && (j !== null || X !== null), _e = $e || J, Mt = u.length === 1 && !$e && (Y || te);
      if (u.length > 0 && !Mt && (u.length > 1 || _e)) {
        const Qe = j !== null ? j : Y && le ? g.x - le.x : 0, At = X !== null ? X : te && le ? g.y - le.y : 0, St = {
          type: "groupMove",
          ids: u,
          activeId: oe,
          dx: Qe,
          dy: At,
          userAction: a.source !== "api"
        }, ze = await b(a, x, St, g);
        if (G = {
          durationMs: 0,
          layoutDiagnostics: ze.diagnostics,
          operationResult: ze
        }, ze.status === "blocked") {
          const Tt = Ts((Gt = ze.blocked) == null ? void 0 : Gt.reason);
          return Ie(a, "blocked", {
            targetIds: de,
            blocked: {
              reason: Tt,
              itemIds: ((Ko = ze.blocked) == null ? void 0 : Ko.itemIds) || de,
              skippedIds: I.length > 0 ? I : void 0,
              message: `Move command blocked by ${Tt}.`
            },
            diagnostics: G
          });
        }
        if (ze.status === "error")
          return Ie(a, "error", {
            targetIds: de,
            diagnostics: G,
            error: ze.error || { message: "Layout operation failed." }
          });
        const zt = ze.patches, ge = ze.affectedIds, ke = zt.length > 0 || ze.status === "changed" || ze.status === "fallback" ? "changed" : "noop", He = yt(
          Dt(h.editorMetaById, $),
          ze.layout
        ), Ue = Ve(
          h.selection,
          ze.layout,
          He,
          "api"
        );
        return me(a, h, ot(h, {
          layout: ze.layout,
          editorMetaById: He,
          selection: Ue,
          focusId: Ue.activeId
        }), {
          status: ke,
          targetIds: de,
          layoutPatches: zt,
          metadataPatches: $,
          affectedIds: ge,
          selection: Ue,
          blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
          diagnostics: G
        });
      }
      O = O.map((Qe) => {
        if (!u.includes(Qe.i)) return Qe;
        const At = u.length === 1 && Y ? g.x : Qe.x + (j || 0), St = u.length === 1 && te ? g.y : Qe.y + (X || 0);
        return { ...Qe, x: Math.max(0, Math.floor(At)), y: Math.max(0, Math.floor(St)) };
      });
    } else if (a.type === "resize") {
      const j = u[0], X = j ? Ee(O, j) : void 0, Y = j ? B(j) : void 0;
      if (X && Y) {
        const te = _(g.w) ? g.w : X.w + (_(g.dw) ? g.dw : 0), de = _(g.h) ? g.h : X.h + (_(g.dh) ? g.dh : 0), oe = await b(a, x, {
          type: "resize",
          id: j,
          x: _(g.x) ? Math.max(0, Math.floor(g.x)) : void 0,
          y: _(g.y) ? Math.max(0, Math.floor(g.y)) : void 0,
          w: Ne(te, X.w),
          h: Ne(de, X.h),
          handle: zs(g.handle) ? g.handle : "se",
          constraint: Y
        }, g);
        if (G = {
          durationMs: 0,
          layoutDiagnostics: oe.diagnostics,
          operationResult: oe
        }, oe.status === "blocked") {
          const le = Ts((Xo = oe.blocked) == null ? void 0 : Xo.reason);
          return Ie(a, "blocked", {
            targetIds: u,
            blocked: {
              reason: le,
              itemIds: ((Yo = oe.blocked) == null ? void 0 : Yo.itemIds) || u,
              message: `Resize command blocked by ${le}.`
            },
            diagnostics: G
          });
        }
        if (oe.status === "error")
          return Ie(a, "error", {
            targetIds: u,
            diagnostics: G,
            error: oe.error || { message: "Layout operation failed." }
          });
        O = oe.layout;
      } else
        O = O.map((te) => {
          if (te.i !== j) return te;
          const de = _(g.w) ? g.w : te.w + (_(g.dw) ? g.dw : 0), oe = _(g.h) ? g.h : te.h + (_(g.dh) ? g.dh : 0);
          return {
            ...te,
            x: _(g.x) ? Math.max(0, Math.floor(g.x)) : te.x,
            y: _(g.y) ? Math.max(0, Math.floor(g.y)) : te.y,
            w: Ne(de, te.w),
            h: Ne(oe, te.h)
          };
        });
    } else if (a.type === "align") {
      const j = _(g.cols) ? g.cols : 12, X = _(g.maxRows) ? g.maxRows : 1 / 0, Y = Ss(x, g, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: j,
        maxRows: X,
        skippedIds: I
      });
      if (G = Y.diagnostics, Y.status === "blocked")
        return Ie(a, "blocked", {
          targetIds: u,
          blocked: Y.blocked,
          diagnostics: G
        });
      O = Y.layout;
    } else if (a.type === "distribute" || a.type === "tidy") {
      const j = _(g.cols) ? g.cols : 12, X = _(g.maxRows) ? g.maxRows : 1 / 0, Y = a.type === "distribute" ? Cs(x, g, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: j,
        maxRows: X,
        skippedIds: I
      }) : Rs(x, g, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: j,
        maxRows: X,
        skippedIds: I
      });
      if (G = Y.diagnostics, Y.status === "blocked")
        return Ie(a, "blocked", {
          targetIds: u,
          blocked: Y.blocked,
          diagnostics: G
        });
      O = Y.layout;
    } else if (a.type === "add") {
      const j = Array.isArray(g.items) ? g.items : g.item ? [g.item] : [], X = new Set(O.map((le) => le.i)), Y = e.idGenerator || it, te = j.filter((le) => le && typeof le == "object").map((le, $e) => {
        const J = le, _e = typeof J.i == "string" && !X.has(J.i) ? J.i : Y(typeof J.i == "string" ? J.i : `item-${$e + 1}`, X);
        return X.add(_e), {
          ...J,
          i: _e,
          x: _(J.x) ? J.x : 0,
          y: _(J.y) ? J.y : 0,
          w: Ne(J.w, 1),
          h: Ne(J.h, 1)
        };
      }), de = vt(O, te, String(g.strategy || "first-fit"), g);
      if (G = xe(de, g), de.failed)
        return Ie(a, "blocked", {
          targetIds: de.summary.insertedIds,
          blocked: {
            reason: ((_o = de.blocked) == null ? void 0 : _o.reason) || "bounds",
            itemIds: (Uo = de.blocked) == null ? void 0 : Uo.itemIds,
            message: ((Wo = de.blocked) == null ? void 0 : Wo.message) || "One or more items could not fit in the current layout."
          },
          diagnostics: G
        });
      const oe = Se(g.editorMetaById, { layout: te });
      Object.keys(oe).forEach((le) => {
        te.some(($e) => $e.i === le) && $.push({ type: "set", id: le, next: oe[le] });
      }), O = de.layout;
    } else if (a.type === "delete") {
      const j = new Set(u);
      O = O.filter((X) => !j.has(X.i)), u.forEach((X) => {
        l.value[X] && $.push({ type: "remove", id: X, previous: l.value[X] });
      }), H = xs(O, u, l.value);
    } else if (a.type === "duplicate") {
      const j = u.map((te) => Ee(x, te)).filter(Boolean), X = Ot(
        j,
        l.value,
        new Set(x.map((te) => te.i)),
        e.idGenerator || it
      );
      Object.keys(X.metaById).forEach((te) => {
        $.push({ type: "set", id: te, next: X.metaById[te] });
      });
      const Y = vt(
        O,
        X.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (G = xe(Y, g), Y.failed)
        return Ie(a, "blocked", {
          targetIds: u,
          blocked: {
            reason: ((qo = Y.blocked) == null ? void 0 : qo.reason) || "bounds",
            itemIds: ((Vo = Y.blocked) == null ? void 0 : Vo.itemIds) || u,
            message: ((Zo = Y.blocked) == null ? void 0 : Zo.message) || "Duplicated items could not fit in the current layout."
          },
          diagnostics: G
        });
      O = Y.layout, be = Ae(X.items.map((te) => te.i), "api"), H = be.activeId;
    } else if (a.type === "copy") {
      const j = u.map((X) => Ee(x, X)).filter(Boolean);
      return await re(U(), Nr({
        sourceId: a.id,
        items: j,
        editorMetaById: Se(l.value, { layout: j }),
        source: co(g)
      })), Ie(a, "changed", {
        targetIds: u,
        affectedIds: u
      });
    } else if (a.type === "paste") {
      const j = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, X = j ? {
        items: ce(Array.isArray(j.items) ? j.items : []),
        editorMetaById: Se(j.editorMetaById),
        sourceId: typeof j.sourceId == "string" ? j.sourceId : a.id,
        copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 2,
        source: j.source,
        originalGeometryById: j.originalGeometryById
      } : await Z(U());
      if (!X)
        return Ie(a, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      const Y = (j == null ? void 0 : j.mapped) === !0 ? {
        items: ce(X.items)
      } : mo(X, {
        cols: Bt(g)
      }), te = (j == null ? void 0 : j.mapped) === !0 ? {
        items: ce(Y.items),
        metaById: Se(X.editorMetaById, {
          layout: Y.items
        })
      } : Ot(
        Y.items,
        X.editorMetaById,
        new Set(x.map((oe) => oe.i)),
        e.idGenerator || it
      );
      Object.keys(te.metaById).forEach((oe) => {
        $.push({ type: "set", id: oe, next: te.metaById[oe] });
      });
      const de = vt(
        O,
        te.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (G = xe(de, g), de.failed)
        return Ie(a, "blocked", {
          blocked: {
            reason: ((Jo = de.blocked) == null ? void 0 : Jo.reason) || "bounds",
            itemIds: (Qo = de.blocked) == null ? void 0 : Qo.itemIds,
            message: ((es = de.blocked) == null ? void 0 : es.message) || "Clipboard items could not fit in the current layout."
          },
          diagnostics: G
        });
      O = de.layout, be = Ae(te.items.map((oe) => oe.i), "api"), H = be.activeId;
    } else as(a.type) && u.forEach((j) => {
      const X = a.type === "lock" ? { locked: !0 } : a.type === "unlock" ? { locked: !1 } : a.type === "show" ? { visible: !0 } : { visible: !1 }, Y = cs(l.value, j, X);
      Y.patch && $.push(Y.patch);
    });
    const fe = Ht(x, O), T = yt(
      Dt(h.editorMetaById, $),
      O
    ), Q = Ve(
      be,
      O,
      T,
      be.source
    ), pe = H !== h.focusId ? H : Q.activeId, ae = ho(fe, $), Me = ae.length > 0 ? "changed" : "noop";
    return me(a, h, ot(h, {
      layout: O,
      editorMetaById: T,
      selection: Q,
      focusId: pe
    }), {
      status: Me,
      targetIds: u.length > 0 ? u : a.targetIds,
      layoutPatches: fe,
      metadataPatches: $,
      affectedIds: ae,
      selection: e.selectedIds ? h.selection : Q,
      blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
      diagnostics: G
    });
  }, di = (a, u) => a.kind === "responsive" ? {
    ...a,
    layouts: {
      ...eo(a.layouts),
      [a.breakpoint]: ce(u)
    }
  } : {
    ...a,
    layout: ce(u)
  }, ot = (a, u) => ({
    ...u.layout ? di(a, u.layout) : a,
    editorMetaById: u.editorMetaById ? Pt(u.editorMetaById) : Pt(a.editorMetaById),
    sectionRows: u.sectionRows ? st(u.sectionRows) : st(a.sectionRows),
    selection: u.selection ? Ze(u.selection) : Ze(a.selection),
    focusId: u.focusId !== void 0 ? u.focusId : a.focusId
  }), Do = (a) => {
    const u = qt(a), I = u.candidateLayout || u.placementCandidateLayout || u.afterLayout || u.layout;
    return Array.isArray(I) ? ce(I.filter(
      (h) => !!h && typeof h == "object" && typeof h.i == "string"
    )) : null;
  }, li = (a, u, I) => {
    const h = qt(a);
    let x = Do(a), g = Pt(I.editorMetaById), $ = st(I.sectionRows), G = Ze(I.selection), O = I.focusId;
    const be = a.type === "delete" || a.type === "section-row-delete" ? "destructive" : ss(a.type) ? "persistence" : a.source === "external" || a.source === "remote" ? "external" : "normal";
    if (!x && a.type === "delete") {
      const H = new Set(u);
      x = E().filter((V) => !H.has(V.i)), u.forEach((V) => {
        delete g[V];
      }), G = Ae(
        G.selectedIds.filter((V) => !H.has(V)),
        a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
      ), O = xs(x, u, g);
    }
    if (!x && a.type === "move") {
      const H = _(h.dx) ? h.dx : null, V = _(h.dy) ? h.dy : null, ee = _(h.x), fe = _(h.y);
      (H !== null || V !== null || ee || fe) && (x = E().map((T) => u.includes(T.i) ? {
        ...T,
        x: ee && u.length === 1 ? Math.max(0, Math.floor(h.x)) : Math.max(0, Math.floor(T.x + (H || 0))),
        y: fe && u.length === 1 ? Math.max(0, Math.floor(h.y)) : Math.max(0, Math.floor(T.y + (V || 0)))
      } : T));
    }
    if (!x && a.type === "resize") {
      const H = E(), V = u[0], ee = V ? Ee(H, V) : void 0, fe = V ? B(V) : void 0, T = fe ? qe(h) : null;
      if (ee && fe && T) {
        const Q = _(h.w) ? h.w : ee.w + (_(h.dw) ? h.dw : 0), pe = _(h.h) ? h.h : ee.h + (_(h.dh) ? h.dh : 0), ae = vo({
          id: `${a.id}:preview-layout`,
          phase: "preview",
          layout: H,
          operation: {
            type: "resize",
            id: V,
            x: _(h.x) ? Math.max(0, Math.floor(h.x)) : void 0,
            y: _(h.y) ? Math.max(0, Math.floor(h.y)) : void 0,
            w: Ne(Q, ee.w),
            h: Ne(pe, ee.h),
            handle: zs(h.handle) ? h.handle : "se",
            constraint: fe
          },
          options: T
        });
        x = ae.status === "blocked" || ae.status === "error" ? H : ae.layout;
      } else
        x = H.map((Q) => {
          if (Q.i !== V) return Q;
          const pe = _(h.w) ? h.w : Q.w + (_(h.dw) ? h.dw : 0), ae = _(h.h) ? h.h : Q.h + (_(h.dh) ? h.dh : 0);
          return {
            ...Q,
            x: _(h.x) ? Math.max(0, Math.floor(h.x)) : Q.x,
            y: _(h.y) ? Math.max(0, Math.floor(h.y)) : Q.y,
            w: Ne(pe, Q.w),
            h: Ne(ae, Q.h)
          };
        });
    }
    if (!x && a.type === "add") {
      const H = Array.isArray(h.items) ? h.items : h.item ? [h.item] : [], V = new Set(E().map((T) => T.i)), ee = e.idGenerator || it, fe = H.filter((T) => T && typeof T == "object").map((T, Q) => {
        const pe = T, ae = typeof pe.i == "string" && !V.has(pe.i) ? pe.i : ee(typeof pe.i == "string" ? pe.i : `item-${Q + 1}`, V);
        return V.add(ae), {
          ...pe,
          i: ae,
          x: _(pe.x) ? pe.x : 0,
          y: _(pe.y) ? pe.y : 0,
          w: Ne(pe.w, 1),
          h: Ne(pe.h, 1)
        };
      });
      if (fe.length > 0) {
        const T = vt(
          E(),
          fe,
          String(h.strategy || "first-fit"),
          h
        );
        T.failed || (x = T.layout, g = {
          ...g,
          ...Se(h.editorMetaById, { layout: fe })
        }, G = Ae(fe.map((Q) => Q.i), "api"), O = G.activeId);
      }
    }
    if (!x && a.type === "paste") {
      const H = h.resolvedClipboardPayload && typeof h.resolvedClipboardPayload == "object" ? h.resolvedClipboardPayload : null;
      if (H != null && H.items && Array.isArray(H.items)) {
        const V = {
          version: 2,
          sourceId: typeof H.sourceId == "string" ? H.sourceId : a.id,
          copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
          items: ce(H.items),
          editorMetaById: Se(H.editorMetaById),
          source: H.source,
          originalGeometryById: H.originalGeometryById
        }, ee = H.mapped === !0 ? ce(V.items) : mo(V, {
          cols: Bt(h)
        }).items, fe = H.mapped === !0 ? {
          items: ee,
          metaById: Se(H.editorMetaById, {
            layout: ee
          })
        } : Ot(
          ee,
          Se(H.editorMetaById),
          new Set(E().map((Q) => Q.i)),
          e.idGenerator || it
        ), T = vt(
          E(),
          fe.items,
          String(h.strategy || e.pasteStrategy || "offset"),
          h
        );
        T.failed || (x = T.layout, g = { ...g, ...fe.metaById }, G = Ae(fe.items.map((Q) => Q.i), "api"), O = G.activeId);
      }
    }
    if (!x && a.type === "duplicate") {
      const H = u.map((fe) => Ee(E(), fe)).filter(Boolean), V = Ot(
        H,
        g,
        new Set(E().map((fe) => fe.i)),
        e.idGenerator || it
      ), ee = vt(
        E(),
        V.items,
        String(h.strategy || e.pasteStrategy || "offset"),
        h
      );
      ee.failed || (x = ee.layout, g = { ...g, ...V.metaById }, G = Ae(V.items.map((fe) => fe.i), "api"), O = G.activeId);
    }
    if (!x && a.type === "align") {
      const H = Ss(E(), h, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: _(h.cols) ? h.cols : 12,
        maxRows: _(h.maxRows) ? h.maxRows : 1 / 0
      });
      H.status !== "blocked" && (x = H.layout);
    }
    if (!x && (a.type === "distribute" || a.type === "tidy")) {
      const H = a.type === "distribute" ? Cs(E(), h, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: _(h.cols) ? h.cols : 12,
        maxRows: _(h.maxRows) ? h.maxRows : 1 / 0
      }) : Rs(E(), h, {
        targetIds: u,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: _(h.cols) ? h.cols : 12,
        maxRows: _(h.maxRows) ? h.maxRows : 1 / 0
      });
      H.status !== "blocked" && (x = H.layout);
    }
    if (as(a.type) && u.forEach((H) => {
      const V = a.type === "lock" ? { locked: !0 } : a.type === "unlock" ? { locked: !1 } : a.type === "show" ? { visible: !0 } : { visible: !1 }, ee = cs(g, H, V);
      ee.patch && (g = Dt(g, [ee.patch]));
    }), a.type === "select" ? (G = Is(E(), v.value, {
      id: typeof h.id == "string" ? h.id : void 0,
      ids: Array.isArray(h.ids) ? h.ids.filter((H) => typeof H == "string") : typeof h.id == "string" ? void 0 : u,
      toggle: h.toggle === !0,
      range: h.range === !0,
      source: a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
    }), O = G.activeId) : a.type === "clearSelection" && (G = xo("api"), O = null), ns(a.type)) {
      const H = h, V = Le($, E()), ee = u.length > 0 ? u : H.id ? [H.id] : [];
      if (ee.filter((T) => !V.items[T]).length === 0) {
        const T = st({
          items: V.items,
          itemMembership: V.itemMembership
        }), Q = ut(V, ee);
        if (a.type === "section-row-collapse" || a.type === "section-row-expand") {
          const ae = a.type === "section-row-collapse";
          ee.forEach((Me) => {
            T.items[Me] = { ...T.items[Me], collapsed: ae };
          }), ae && (G = Ae(
            G.selectedIds.filter((Me) => !Q.includes(Me)),
            "api"
          ), O = G.activeId);
        } else if (a.type === "section-row-reorder")
          ee.forEach((ae) => {
            T.items[ae] = {
              ...T.items[ae],
              order: Xt(V, H)
            };
          });
        else if (a.type === "section-row-move") {
          const ae = _(H.dy) ? Math.floor(H.dy) : 0;
          x = (x || E()).map(
            (Me) => Q.includes(Me.i) ? { ...Me, y: Math.max(0, Me.y + ae) } : Me
          ), ee.forEach((Me) => {
            const Re = T.items[Me];
            T.items[Me] = {
              ...Re,
              bounds: Re.bounds ? { ...Re.bounds, y: Math.max(0, Re.bounds.y + ae) } : Re.bounds
            };
          });
        } else a.type === "section-row-delete" && (ee.forEach((ae) => {
          delete T.items[ae];
        }), Object.keys(T.itemMembership || {}).forEach((ae) => {
          var $t, Gt;
          const Me = (($t = T.itemMembership) == null ? void 0 : $t[ae]) || {}, Re = {
            sectionId: Me.sectionId && ee.includes(Me.sectionId) ? void 0 : Me.sectionId,
            rowId: Me.rowId && ee.includes(Me.rowId) ? void 0 : Me.rowId
          };
          !Re.sectionId && !Re.rowId ? (Gt = T.itemMembership) == null || delete Gt[ae] : T.itemMembership && (T.itemMembership[ae] = Re);
        }), H.deleteItems === !0 && (x = (x || E()).filter((ae) => !Q.includes(ae.i)), Q.forEach((ae) => {
          delete g[ae];
        }), G = Ae(
          G.selectedIds.filter((ae) => !Q.includes(ae)),
          "api"
        ), O = G.activeId));
        const pe = Le(T, x || E());
        $ = {
          version: 1,
          items: pe.items,
          itemMembership: pe.itemMembership
        };
      }
    }
    return $s(I, ot(I, {
      layout: x || void 0,
      editorMetaById: g,
      sectionRows: $,
      selection: G,
      focusId: O
    }), {
      risk: be
    });
  }, kt = Kr({
    beforeCommand: e.beforeCommand,
    guardTimeoutMs: e.guardTimeoutMs,
    getSnapshot: he,
    getStateRevision: () => A,
    check: (a) => rs(a, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: l.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    }),
    getGuardContext: (a, u, I, h) => {
      const x = qt(a), g = x.placementSummary && typeof x.placementSummary == "object" ? x.placementSummary : void 0;
      return {
        source: a.source || "api",
        origin: a.origin,
        targetIds: u.allowedIds,
        layout: E(),
        layouts: N(),
        editorMetaById: l.value,
        sectionRows: m.value,
        selection: v.value,
        mode: c.value,
        history: {
          canUndo: !!(q != null && q.canUndo.value),
          canRedo: !!(q != null && q.canRedo.value)
        },
        preview: I,
        placement: g || x.placementSessionId ? {
          sessionId: typeof x.placementSessionId == "string" ? x.placementSessionId : void 0,
          source: typeof x.placementSource == "string" ? x.placementSource : void 0,
          summary: g,
          affectedIds: g == null ? void 0 : g.affectedIds,
          diagnostics: g == null ? void 0 : g.diagnostics
        } : void 0,
        signal: h
      };
    },
    buildPreview: (a, u, I) => li(a, u.allowedIds, I),
    cleanupInteraction: () => {
      K.value = null, Fe("command-cleanup");
    },
    finalize: Ye,
    now: Gs,
    isStopped: () => w.value,
    onStart: (a) => {
      a.source === "keyboard" && fo(a.type) && (K.value = "keyboardEditing"), S({ type: "command-start", command: a });
    },
    commit: async ({ command: a, check: u, before: I, startedAt: h, guardMs: x }) => {
      try {
        if (ss(a.type)) {
          const $ = a.type === "save" ? await We.save() : a.type === "discard" ? We.discard() : We.reset();
          return $.status === "changed" && (se.value = he(), z.value = !1), Ye(a, { ...$, id: a.id }, h, x);
        }
        if (Bi(a.type)) {
          const $ = a.type === "undo" ? q == null ? void 0 : q.undo() : q == null ? void 0 : q.redo();
          return $ ? (Be(a.type === "undo" ? $.before : $.after), Ye(a, Ie(a, "changed", {
            affectedIds: $.affectedIds || $.after.selection.selectedIds,
            selection: v.value,
            undo: $,
            diagnostics: {
              durationMs: 0,
              historyMode: "ignore",
              source: a.source,
              origin: a.origin
            }
          }), h, x)) : Ye(a, Ie(a, "blocked", {
            blocked: { reason: "missing-item", message: "No editor history entry is available." }
          }), h, x);
        }
        const g = await lo(a, u.allowedIds, u.blockedIds, I);
        return Ye(a, g, h, x);
      } catch (g) {
        return g instanceof nt ? Ye(a, Ie(a, "blocked", {
          targetIds: u.targetIds,
          blocked: {
            reason: g.code,
            itemIds: u.targetIds,
            message: g.message
          },
          error: { message: g.message, cause: g }
        }), h, x) : Ye(
          a,
          is(a, "Editor command failed.", g),
          h,
          x
        );
      }
    }
  }), Oo = (a) => {
    if (w.value || R > 0) return;
    kt.abortPending(a), K.value = null, Fe(a), A += 1;
    const u = E(), I = yt(l.value, u);
    Ke(I, l.value) || (l.value = I);
    const h = Ve(
      v.value,
      u,
      l.value,
      "external"
    );
    v.value = h, D.value = h.activeId, q == null || q.replacePresent(he(), { preserveRedoStack: !0 });
  };
  e.layout && P.push(pt(r, () => {
    Oo("external-layout");
  }, { deep: !0, flush: "sync" })), e.layouts && P.push(pt(n, () => {
    Oo("external-layouts");
  }, { deep: !0, flush: "sync" }));
  const ft = async (a) => kt.execute(a), ui = (a) => {
    var g;
    const u = to(a.type), I = Os({
      source: u.defaultSource,
      ...a,
      history: a.history || u.defaultHistory
    }), h = rs(I, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: l.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    });
    if (h.result) return h.result;
    const x = (g = u.validatePayload) == null ? void 0 : g.call(u, I);
    return x && !x.ok ? Qt(I, "invalid-input", {
      targetIds: h.targetIds,
      blocked: {
        reason: "invalid-input",
        itemIds: h.targetIds,
        message: x.message
      }
    }) : Ie(I, "noop", {
      targetIds: h.allowedIds
    });
  }, fi = async (a) => {
    var $, G, O, be, H, V, ee;
    const u = a.commandType || (a.source === "paste" ? "paste" : "add");
    if (f)
      return ue(u, "editor-mode-missing", "Editor mode is not configured.");
    if (c.value === "view")
      return ue(u, "mode-readonly", "Placement requires edit mode.");
    if (w.value)
      return ue(u, "unsupported-scope", "Editor controller is stopped.");
    if (K.value)
      return ue(u, "unsupported-scope", `Cannot start placement while ${K.value}.`);
    if (k.value)
      return ue(u, "command-pending", "A placement session is already active.");
    let I = {
      ...a,
      commandType: u
    };
    const h = qe({
      cols: a.cols,
      maxRows: a.maxRows,
      compactType: a.compactType,
      allowOverlap: a.allowOverlap,
      preventCollision: a.preventCollision
    });
    if (a.source === "paste" || u === "paste") {
      const fe = U();
      let T = null, Q = null;
      try {
        T = await fe.read();
      } catch (Re) {
        Q = Re;
      }
      if ((!T || Q) && fe !== gt)
        try {
          T = await gt.read();
        } catch (Re) {
          Q || (Q = Re);
        }
      if (!T && Q) {
        const Re = Q instanceof nt ? Q.code : "clipboard-invalid";
        return ue(
          "paste",
          Re,
          Q instanceof Error ? Q.message : "Clipboard could not be read."
        );
      }
      if (!T || T.items.length === 0)
        return ue(
          "paste",
          "clipboard-unavailable",
          "Clipboard is empty or unavailable."
        );
      const pe = mo(T, {
        cols: ($ = a.cols) != null ? $ : h == null ? void 0 : h.cols
      }), ae = Ot(
        pe.items,
        T.editorMetaById,
        new Set(E().map((Re) => Re.i)),
        e.idGenerator || it
      ), Me = {
        items: ae.items,
        editorMetaById: ae.metaById,
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
        items: ae.items,
        editorMetaById: ae.metaById,
        resolvedClipboardPayload: Me
      };
    } else
      I = De(I);
    const x = {
      ...I,
      compactType: (G = I.compactType) != null ? G : h == null ? void 0 : h.compactType,
      allowOverlap: (O = I.allowOverlap) != null ? O : h == null ? void 0 : h.allowOverlap,
      preventCollision: (be = I.preventCollision) != null ? be : h == null ? void 0 : h.preventCollision
    }, g = mn(x, {
      baseLayout: E(),
      baseRevision: A,
      defaultStrategy: x.strategy || (u === "paste" ? e.pasteStrategy || "offset" : "first-fit"),
      cols: x.cols,
      maxRows: x.maxRows
    });
    return g.items.length === 0 || g.blocked && g.ghostItems.length === 0 ? ue(
      u,
      ((H = g.blocked) == null ? void 0 : H.reason) || "invalid-input",
      ((V = g.blocked) == null ? void 0 : V.message) || "No items were provided for placement.",
      (ee = g.blocked) == null ? void 0 : ee.itemIds,
      we(g)
    ) : (k.value = g, S({ type: "placement-start", session: g }), {
      status: g.blocked ? "blocked" : "started",
      session: g,
      blocked: g.blocked ? {
        reason: g.blocked.reason,
        itemIds: g.blocked.itemIds,
        message: g.blocked.message
      } : void 0,
      diagnostics: we(g)
    });
  }, yi = (a) => {
    const u = k.value;
    if (!u)
      return { status: "noop" };
    const I = Co(u, a);
    return k.value = I, S({ type: "placement-update", session: I }), {
      status: I.blocked ? "blocked" : "updated",
      session: I,
      blocked: I.blocked ? {
        reason: I.blocked.reason,
        itemIds: I.blocked.itemIds,
        message: I.blocked.message
      } : void 0,
      diagnostics: we(I)
    };
  }, pi = (a = "cancelled") => {
    const u = k.value;
    if (!u) return { status: "noop" };
    const I = hn(u, a);
    return Fe(a), I;
  }, mi = (a) => {
    var I;
    const u = (I = a.blocked) == null ? void 0 : I.reason;
    return a.status === "blocked" && (u === "bounds" || u === "collision" || u === "maxRows" || u === "section-row-policy" || u === "invalid-input");
  }, gi = async (a = {}) => {
    var g, $, G, O, be, H, V, ee, fe;
    const u = k.value;
    if (!u)
      return Ie({
        id: `placement-commit:noop:${Date.now()}`,
        type: "add"
      }, "noop");
    if (!u.candidateLayout || u.blocked) {
      const T = Ie({
        id: `placement-commit:blocked:${u.id}`,
        type: u.commandType
      }, "blocked", {
        targetIds: u.items.map((Q) => Q.i),
        blocked: {
          reason: ((g = u.blocked) == null ? void 0 : g.reason) || "invalid-input",
          itemIds: (($ = u.blocked) == null ? void 0 : $.itemIds) || u.items.map((Q) => Q.i),
          message: ((G = u.blocked) == null ? void 0 : G.message) || "Placement does not have a valid candidate."
        },
        diagnostics: we(u)
      });
      return L.value = T, T;
    }
    if (A !== u.baseRevision) {
      const T = we(u) || { durationMs: 0 }, Q = Ie({
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
      return L.value = Q, Fe("stale-command"), Q;
    }
    const I = {
      ...u,
      phase: "committing",
      ghostItems: u.ghostItems.map((T) => ({ ...T, state: "committing" }))
    };
    k.value = I;
    const h = gn(I, a), x = await ft(h);
    if (S({ type: "placement-commit", sessionId: I.id, result: x }), x.status === "changed" || x.status === "noop" || (a == null ? void 0 : a.autoCancelOnBlocked) === !0 || !mi(x))
      Fe(x.status);
    else {
      const T = Co(u, {});
      k.value = {
        ...T,
        blocked: {
          reason: ((O = x.blocked) == null ? void 0 : O.reason) || ((be = T.blocked) == null ? void 0 : be.reason) || "invalid-input",
          itemIds: ((H = x.blocked) == null ? void 0 : H.itemIds) || ((V = T.blocked) == null ? void 0 : V.itemIds),
          message: ((ee = x.blocked) == null ? void 0 : ee.message) || ((fe = T.blocked) == null ? void 0 : fe.message),
          recoverable: !0
        },
        phase: "blocked"
      };
    }
    return x;
  }, Lo = (a) => Lt(a, "ignore"), Fo = (a) => {
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
  }, hi = (a, u = "external", I = {}) => {
    const h = Lo(I.history);
    kt.abortPending(I.origin || u), K.value = null, W(a), A += 1, l.value = yt(l.value, a), tt(Ve(v.value, a, l.value, "external")), Fo(h), S({
      type: "editor-state-change",
      state: Ce.value,
      reason: I.origin || u
    });
  }, vi = (a, u, I = "external", h = {}) => {
    const x = Lo(h.history);
    kt.abortPending(h.origin || I), K.value = null, ye(a, u);
    const g = a[u] || [];
    A += 1, l.value = yt(l.value, g), tt(Ve(v.value, g, l.value, "external")), Fo(x), S({
      type: "editor-state-change",
      state: Ce.value,
      reason: h.origin || I
    });
  };
  f && S({
    type: "editor-error",
    code: "editor-mode-missing",
    message: "Grid editor was enabled without mode or defaultMode; falling back to view."
  });
  let Ho = E();
  P.push(pt(c, (a, u) => {
    a !== u && (a === "view" && K.value ? (K.value = null, W(Ho)) : Ho = E(), a === "view" && (M.value = { ...go }, Fe("mode-readonly")), S({ type: "mode-change", from: u, to: a, source: "external" }));
  })), P.push(pt(() => Ce.value, (a, u) => {
    a !== u && S({
      type: "editor-state-change",
      state: a,
      previous: u,
      reason: "derived-state"
    });
  })), e.selectedIds && P.push(pt(e.selectedIds, (a) => {
    kt.abortPending("external-selection"), A += 1, v.value = Ve(
      Ae(a, "external"),
      E(),
      l.value,
      "external"
    ), D.value = v.value.activeId, q == null || q.replacePresent(he(), { preserveRedoStack: !0 });
  }, { flush: "sync" })), P.push(pt(l, (a) => {
    const u = Se(a, { layout: E() });
    Ke(u, a) || (l.value = u);
  }, { deep: !0 })), P.push(pt(m, (a) => {
    const u = Le(a, E()), I = {
      version: 1,
      items: u.items,
      itemMembership: u.itemMembership
    };
    Ke(I, a) || (m.value = I);
    const h = v.value.selectedIds.filter((x) => {
      const g = u.itemMembership[x], $ = g != null && g.sectionId ? u.items[g.sectionId] : void 0, G = g != null && g.rowId ? u.items[g.rowId] : void 0;
      return ($ == null ? void 0 : $.collapsed) || (G == null ? void 0 : G.collapsed);
    });
    h.length > 0 && tt(Ae(
      v.value.selectedIds.filter((x) => !h.includes(x)),
      "api"
    ));
  }, { deep: !0 }));
  const No = {
    mode: c,
    state: Ce,
    selection: v,
    editorMetaById: l,
    sectionRows: m,
    placementSession: k,
    dirty: ie,
    conflict: C,
    guides: M,
    lastResult: L,
    execute: ft,
    canExecute: ui,
    beginPlacement: fi,
    updatePlacement: yi,
    commitPlacement: gi,
    cancelPlacement: pi,
    getToolbarState: () => xn(No),
    undo: () => ft({ type: "undo", source: "api" }),
    redo: () => ft({ type: "redo", source: "api" }),
    save: () => ft({ type: "save", source: "api" }),
    discard: () => ft({ type: "discard", source: "api" }),
    reset: () => ft({ type: "reset", source: "api" }),
    setExternalLayout: hi,
    setExternalLayouts: vi,
    stop() {
      w.value || (w.value = !0, kt.abortPending("editor-stop"), Fe("editor-stop"), P.forEach((a) => a()), je == null || je.stop());
    }
  };
  return No;
}, ta = ai, Rn = (e) => !!(e && typeof e == "object" && "getBoundingClientRect" in e), Pn = (e, t) => {
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
const Vt = (e) => ({
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
}), ci = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), Ds = (e) => !!(e && typeof e == "object" && !ci(e)), $n = (e) => typeof e == "function" ? { ...e() || {} } : { ...e || {} }, Gn = (e, t, o) => ({
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
    const B = `${b.commandId}:layout`;
    return s.isLegacyLayoutEngine() ? Gn(B, b.layout, b.operation) : vo({
      id: B,
      phase: b.phase,
      layout: b.layout,
      operation: b.operation,
      options: s.getLayoutEngineOptions()
    });
  }), l = o || e.persistence || (c == null ? void 0 : c.persistence);
  let p = null;
  const m = c && ci(l) ? l : c && Ds(l) ? Gi({
    ...l,
    kind: "layout",
    target: t,
    watchTarget: !1,
    meta: () => ({
      ...$n(l.meta),
      editor: io(
        (p == null ? void 0 : p.editorMetaById.value) || {},
        p == null ? void 0 : p.sectionRows.value
      )
    }),
    onEvent: (b) => {
      var B;
      if (b.type === "load-success" || b.type === "external-apply") {
        const Z = oo(b.document);
        Z.ok && Z.envelope && p && (p.editorMetaById.value = Z.envelope.editorMetaById, Z.envelope.sectionRows && (p.sectionRows.value = Z.envelope.sectionRows)), p == null || p.setExternalLayout(b.value, b.type);
      }
      (B = l.onEvent) == null || B.call(l, b);
    }
  }) : null, v = !!(c && m && Ds(l));
  p = c ? c.controller || ai({
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
      compactType: os(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision
    }),
    stopEvent: (b) => {
      b.preventDefault(), b.stopPropagation();
    }
  }), L = () => !!p, K = () => !!(p && p.mode.value === "view"), z = () => !!(p && p.mode.value === "edit"), ne = () => (p == null ? void 0 : p.editorMetaById.value) || {}, D = () => !!(p && (c == null ? void 0 : c.guides) !== !1), w = (b) => {
    var B;
    return (B = e.itemCapabilities) == null ? void 0 : B[b];
  }, P = (b) => {
    var B;
    return (B = e.resizeConstraints) == null ? void 0 : B[b];
  }, A = () => {
    M = null;
  }, R = () => {
    p && (A(), p.guides.value = Bn());
  }, F = (b) => {
    const B = d();
    return (B == null ? void 0 : B.activeResizeId) === b ? "resize" : f() ? "drop" : (B == null ? void 0 : B.activeDragId) === b ? "drag" : "api";
  }, S = (b) => {
    const B = d(), Z = (B == null ? void 0 : B.activeResizeId) === b ? i() : (B == null ? void 0 : B.activeDragId) === b ? n() : null;
    return Z ? { [b]: Vt(Z) } : void 0;
  }, E = (b, B, Z) => {
    var xe;
    const re = d(), U = b === "drag" && (re != null && re.dragBlocked) ? {
      reason: re.dragBlockedReason || "collision",
      itemIds: (xe = re.dragBlockedItemIds) != null && xe.length ? re.dragBlockedItemIds : B ? [B] : void 0,
      message: re.dragBlockedMessage || void 0
    } : b === "resize" && (re != null && re.resizeBlocked) ? { reason: "collision", itemIds: B ? [B] : void 0 } : void 0;
    return {
      ...c != null && c.guides && typeof c.guides == "object" ? c.guides : {},
      interaction: b,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      startGeometry: B ? S(B) : void 0,
      resizeHandle: Z,
      selectionCount: (p == null ? void 0 : p.selection.value.selectedIds.length) || 0,
      blocked: U
    };
  }, W = (b, B, Z, re) => {
    var ue, De;
    if (!p || !c || c.guides === !1) return null;
    const U = F(b), xe = E(U, b, re), we = Eo({
      layout: r(),
      activeItem: B,
      candidateItem: Z,
      selectionIds: p.selection.value.selectedIds,
      metaById: ne(),
      sectionRows: p.sectionRows.value,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      compactType: os(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      interaction: U,
      startGeometry: xe.startGeometry,
      options: xe
    });
    return p.guides.value = we.guideState, (ue = c.onEvent) == null || ue.call(c, {
      type: "guide-change",
      guides: p.guides.value.guides,
      activeId: b
    }), (De = c.onEvent) == null || De.call(c, {
      type: "intelligence-change",
      activeId: b,
      diagnostics: we.diagnostics
    }), { intelligence: we, options: xe };
  }, N = (b, B, Z, re, U) => {
    var De;
    const xe = W(b, B, Z, U);
    if (!xe) return Z;
    const we = M == null ? void 0 : M.nextGuideId, ue = Er(xe.intelligence, Z, {
      snap: xe.options.snap,
      layout: re || r(),
      cols: e.cols,
      maxRows: e.maxRows,
      allowOverlap: e.allowOverlap,
      metaById: ne(),
      previousGuideId: we
    });
    return (ue.status === "snapped" || we !== ue.nextGuideId) && ((De = c == null ? void 0 : c.onEvent) == null || De.call(c, {
      type: "snap-change",
      activeId: b,
      previousGuideId: we,
      nextGuideId: ue.nextGuideId,
      snapKind: ue.snapKind,
      geometry: ue.geometry
    })), M = ue, ue.status !== "snapped" ? Z : {
      ...Z,
      ...ue.geometry
    };
  }, ye = (b, B) => B != null && B.locked ? "locked" : (B == null ? void 0 : B.visible) === !1 ? "hidden" : b.static ? "static-item" : "capability", he = (b, B, Z) => {
    if (b)
      return {
        ...b,
        aspectRatio: b.aspectRatio ? {
          ...b.aspectRatio,
          metrics: b.aspectRatio.metrics || B,
          startGeometry: b.aspectRatio.startGeometry || Z
        } : void 0
      };
  }, Be = (b, B, Z) => {
    var xe;
    const re = w(b.i);
    if (re) {
      const we = Vt(i() || b), ue = P(b.i);
      return {
        ...re,
        resizeConstraint: he(
          ue ? {
            ...re.resizeConstraint,
            aspectRatio: ue,
            handlePolicy: ((xe = re.resizeConstraint) == null ? void 0 : xe.handlePolicy) || {
              allowedHandles: re.resizeHandles,
              blockedReason: "handle-disabled"
            }
          } : re.resizeConstraint,
          Z,
          we
        )
      };
    }
    const U = Zt(b, ne()[b.i], B);
    return {
      id: U.id,
      visible: U.visible,
      editable: U.editable,
      draggable: U.draggable,
      resizable: U.resizable,
      bounded: U.bounded,
      static: U.source.layoutStatic === !0,
      locked: U.locked,
      resizeHandles: U.resizeHandles || [],
      deletable: U.deletable,
      duplicatable: U.duplicatable,
      copyable: U.copyable,
      resizeConstraint: U.resizeHandles ? {
        handlePolicy: {
          allowedHandles: U.resizeHandles,
          blockedReason: "handle-disabled"
        }
      } : void 0,
      sources: U.source.capabilitySources || {},
      sourceLists: {},
      diagnostics: U.diagnostics || []
    };
  }, se = (b) => {
    var U, xe;
    if (!p)
      return { kind: "allowed", candidate: b.rawCandidate };
    if (!z())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [b.id],
        message: "Resize is disabled outside edit mode."
      };
    const B = Be(
      b.item,
      { isDraggable: !0, isResizable: !0, isBounded: !0 },
      b.metrics
    );
    if (!B || !B.resizable)
      return {
        kind: "blocked",
        reason: ye(b.item, ne()[b.id]),
        ids: [b.id],
        diagnostics: B == null ? void 0 : B.diagnostics
      };
    const Z = he(
      B.resizeConstraint,
      b.metrics,
      Vt(i() || b.item)
    ), re = (U = Z == null ? void 0 : Z.handlePolicy) == null ? void 0 : U.allowedHandles;
    if (re && re.indexOf(b.handle) === -1)
      return {
        kind: "blocked",
        reason: "handle-disabled",
        ids: [b.id],
        message: "Resize handle is disabled by item capability policy.",
        diagnostics: B.diagnostics
      };
    if ((xe = Z == null ? void 0 : Z.aspectRatio) != null && xe.enabled) {
      const we = Ci({
        startItem: {
          ...b.item,
          ...Vt(i() || b.item)
        },
        rawCandidate: b.rawCandidate,
        handle: b.handle,
        constraint: Z.aspectRatio,
        bounds: {
          cols: e.cols,
          maxRows: e.maxRows,
          minW: b.item.minW,
          minH: b.item.minH,
          maxW: b.item.maxW,
          maxH: b.item.maxH
        }
      });
      return we.kind === "blocked" ? {
        kind: "blocked",
        reason: we.reason,
        ids: [b.id],
        diagnostics: we.diagnostics
      } : {
        kind: "allowed",
        candidate: we.candidate,
        constraint: Z,
        diagnostics: we.diagnostics
      };
    }
    return {
      kind: "allowed",
      candidate: b.rawCandidate,
      constraint: Z,
      diagnostics: B.diagnostics
    };
  }, q = (b) => {
    if (!p) return { kind: "single", id: b.id };
    if (!z())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [b.id],
        activeId: b.id
      };
    const B = ne();
    if (!Zt(
      b.item,
      B[b.id],
      { isDraggable: !0, isResizable: !0, isBounded: !0 }
    ).draggable)
      return {
        kind: "blocked",
        reason: ye(b.item, B[b.id]),
        ids: [b.id],
        activeId: b.id
      };
    const U = p.selection.value.selectedIds.filter(Boolean), xe = typeof MouseEvent != "undefined" && b.event instanceof MouseEvent && (b.event.metaKey || b.event.ctrlKey || b.event.shiftKey);
    if (!(U.length > 1 && U.includes(b.id)))
      return !U.includes(b.id) && !xe && p.execute({
        type: "select",
        targetIds: [b.id],
        payload: { id: b.id },
        source: "pointer",
        history: { skip: !0 }
      }), { kind: "single", id: b.id };
    const ue = [], De = [];
    let Fe = "capability";
    return U.forEach((Je) => {
      const lt = Ee(b.layout, Je);
      if (!lt) {
        De.push(Je), Fe = "missing-item";
        return;
      }
      Zt(
        lt,
        B[Je],
        { isDraggable: !0, isResizable: !0, isBounded: !0 }
      ).draggable ? ue.push(Je) : (De.push(Je), Fe = ye(lt, B[Je]));
    }), De.length > 0 && (c == null ? void 0 : c.commandPolicy) !== "skip-blocked" ? {
      kind: "blocked",
      reason: Fe,
      ids: De,
      activeId: b.id
    } : b.legacyLayoutEngine ? {
      kind: "blocked",
      reason: "unsupported",
      ids: ue,
      activeId: b.id
    } : ue.length === 0 ? {
      kind: "blocked",
      reason: Fe,
      ids: De.length > 0 ? De : [b.id],
      activeId: b.id
    } : {
      kind: "group",
      activeId: b.id,
      ids: ue
    };
  }, ie = (b) => {
    var re;
    if (!p) return;
    const B = {
      id: `pointer-move-blocked:${b.activeId || b.ids[0] || "layout"}:${Date.now()}`,
      type: "move",
      targetIds: b.ids,
      source: "pointer"
    }, Z = Ie(B, "blocked", {
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
    p.lastResult.value = Z, (re = c == null ? void 0 : c.onEvent) == null || re.call(c, { type: "command-blocked", command: B, result: Z });
  }, Ce = (b) => {
    t.value = ce(b);
  }, je = (b) => {
    (b == null ? void 0 : b.status) === "changed" && (m == null || m.commit(t.value, { source: "component" }));
  }, We = async (b) => {
    if (!p) return null;
    Ce(b.beforeLayout);
    const B = await p.execute({
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
    return je(B), B;
  }, tt = async (b) => {
    if (!p) return null;
    Ce(b.beforeLayout);
    const B = await p.execute({
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
    return je(B), B;
  }, Ye = async (b) => {
    if (!p) return null;
    Ce(b.beforeLayout);
    const B = await p.execute({
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
    return je(B), B;
  }, It = (b) => {
    Ce(b), R();
  }, xt = (b, B) => {
    !p || !z() || p.execute({
      type: "select",
      targetIds: [b],
      payload: {
        id: b,
        toggle: B.metaKey || B.ctrlKey,
        range: B.shiftKey
      },
      source: "pointer"
    });
  }, wt = (b) => {
    const B = p == null ? void 0 : p.placementSession.value;
    if (!B || B.collisionPolicy !== "layout" || B.blocked || !B.candidateLayout || B.phase === "starting" || B.ghostItems.some((re) => re.id === b.i)) return null;
    const Z = Ee(B.candidateLayout, b.i);
    return !Z || Z.x === b.x && Z.y === b.y && Z.w === b.w && Z.h === b.h ? null : Z;
  }, dt = (b, B, Z) => {
    const re = ne()[b.i], U = p ? Be(b, B) : null, xe = !(p && (re == null ? void 0 : re.visible) === !1 && !Z), we = K() || !!(p && !(U != null && U.editable)), ue = p ? z() && !!(U != null && U.draggable) : typeof b.isDraggable == "boolean" ? b.isDraggable : !b.static && B.isDraggable, De = p ? z() && !!(U != null && U.resizable) : typeof b.isResizable == "boolean" ? b.isResizable : !b.static && B.isResizable, Fe = ue && B.isBounded && b.isBounded !== !1, Je = (p == null ? void 0 : p.selection.value.selectedIds.includes(b.i)) || !1, lt = (p == null ? void 0 : p.selection.value.activeId) === b.i, ut = wt(b), Xt = p ? rt({
      "editor-selected": Je,
      "editor-active": lt,
      "editor-locked": U == null ? void 0 : U.locked,
      "editor-hidden": (re == null ? void 0 : re.visible) === !1,
      "editor-readonly": we,
      "editor-keyboard-editing": p.state.value === "keyboardEditing",
      "editor-drop-target": Z,
      "editor-placement-reflowed": !!ut
    }) : void 0;
    return {
      visible: xe,
      draggable: ue,
      resizable: De,
      bounded: Fe,
      resizeHandles: U == null ? void 0 : U.resizeHandles,
      capabilityDiagnostics: U == null ? void 0 : U.diagnostics,
      className: Xt,
      previewItem: ut,
      onClick: p ? (lo) => xt(b.i, lo) : void 0
    };
  }, me = (b) => {
    k.onClick(b) || b.target === b.currentTarget && p && z() && p.execute({ type: "clearSelection", source: "pointer" });
  }, qe = (b) => {
    k.onPointerMove(b);
  }, Bt = () => {
    p && (c == null ? void 0 : c.keyboard) !== !1 && (C = Ki(
      p,
      typeof (c == null ? void 0 : c.keyboard) == "object" ? c.keyboard : {}
    )), v && (m == null || m.load().then((b) => {
      b.value && b.fallbackApplied && (p == null || p.setExternalLayout(b.value, "persistence-fallback"));
    }));
  }, co = () => {
    C == null || C(), C = null, k.cancel("runtime-stop"), c != null && c.controller ? v && (m == null || m.stop()) : p == null || p.stop();
  };
  return {
    config: c,
    controller: p,
    isEnabled: L,
    isViewMode: K,
    isEditMode: z,
    guidesEnabled: D,
    getMetaById: ne,
    clearGuides: R,
    resetSnap: A,
    snapCandidate: N,
    updateIntelligence: W,
    resolveMoveDrag: q,
    resolveResizeIntent: se,
    notifyMoveBlocked: ie,
    commitMove: We,
    commitResize: tt,
    commitDrop: Ye,
    rollbackInteraction: It,
    getItemRenderState: dt,
    isPlacementActive: k.isActive,
    onRootPointerMove: qe,
    onRootClick: me,
    mount: Bt,
    stop: co
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
    spanXPx: (R, F) => ({
      start: y(R),
      end: v(F)
    }),
    spanYPx: (R, F) => ({
      start: l(R),
      end: C(F)
    }),
    spacingXPx: (R, F) => ({
      start: v(R),
      end: y(F)
    }),
    spacingYPx: (R, F) => ({
      start: C(R),
      end: l(F)
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
    var F;
    if (!o) return [];
    const w = o.displayGuides || o.guides, P = (S) => {
      const E = S.display;
      if ((E == null ? void 0 : E.kind) === "spacing" && S.kind === "spacing-x") {
        const N = y(E.start, E.end);
        return {
          left: `${N.start}px`,
          top: `${f(S)}px`,
          width: `${Math.max(1, N.end - N.start)}px`
        };
      }
      if ((E == null ? void 0 : E.kind) === "spacing" && S.kind === "spacing-y") {
        const N = l(E.start, E.end);
        return {
          left: `${i(S)}px`,
          top: `${N.start}px`,
          height: `${Math.max(1, N.end - N.start)}px`
        };
      }
      if (S.axis === "x") {
        const N = E ? c(E.start, E.end) : null;
        return E ? {
          left: `${i(S)}px`,
          top: `${(N == null ? void 0 : N.start) || 0}px`,
          height: `${Math.max(1, ((N == null ? void 0 : N.end) || 0) - ((N == null ? void 0 : N.start) || 0))}px`
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
      var se, q;
      const W = o.snappedGuideIds.includes(S.id) || S.isSnapped === !0, N = S.kind === "spacing-x" || S.kind === "spacing-y", ye = typeof S.proximity == "number" ? S.proximity : W ? 1 : 0.4, he = W ? 1 : Math.max(0.18, 0.18 + ye * 0.62), Be = {
        ...P(S)
      };
      return !E && !W && (Be.opacity = String(Math.round(he * 100) / 100)), Oe("div", {
        key: `${E ? "debug-" : ""}${S.id}`,
        class: rt(E ? "vue-grid-editor-debug-guide" : "vue-grid-editor-guide", `vue-grid-editor-guide-${S.axis}`, {
          "vue-grid-editor-guide-active": W,
          "vue-grid-editor-guide-snapped": W,
          "vue-grid-editor-guide-predict": !W && !E,
          "vue-grid-editor-spacing-guide": N,
          "vue-grid-editor-alignment-guide": !N,
          "vue-grid-editor-guide-with-label": (se = S.display) == null ? void 0 : se.showLabel
        }),
        style: Be,
        "data-guide-id": S.id,
        "data-guide-kind": S.kind,
        "data-guide-role": N ? "spacing" : "alignment",
        "data-guide-state": W ? "snapped" : "predict",
        "data-guide-proximity": String(Math.round(ye * 100) / 100),
        "data-guide-debug": E ? "true" : void 0,
        "data-guide-source-ids": S.sourceIds.join(",")
      }, (q = S.display) != null && q.showLabel && S.display.label ? [Oe("span", {
        class: "vue-grid-editor-guide-label"
      }, S.display.label)] : void 0);
    }, R = w.map((S) => A(S));
    return o.debug && o.debugMode === "layer" && ((F = o.debugGuides) != null && F.length) ? R.push(Oe("div", {
      key: "debug-guides-layer",
      class: "vue-grid-editor-debug-layer",
      "data-guide-debug-layer": "true"
    }, o.debugGuides.map((S) => A(S, !0)))) : o.debug && o.debugMode === "panel" && R.push(Oe("div", {
      key: "debug-guides-panel",
      class: "vue-grid-editor-debug-panel",
      "data-guide-debug-panel": "true"
    }, `Debug guides: ${o.guides.length} candidates, ${w.length} shown`)), R;
  }, k = () => {
    if (!o) return [];
    const w = o.spacingChips || [];
    return w.length === 0 ? [] : w.map((P) => {
      const A = P.axis === "x", R = A ? y(P.span.start, P.span.end) : l(P.span.start, P.span.end), F = R.start, S = R.end, E = Math.max(1, S - F), W = A ? f({
        kind: "center-y",
        axis: "y",
        position: P.position
      }) : i({
        kind: "center-x",
        axis: "x",
        position: P.position
      }), N = A ? {
        left: `${F}px`,
        top: `${W}px`,
        width: `${E}px`
      } : {
        top: `${F}px`,
        left: `${W}px`,
        height: `${E}px`
      }, ye = `${P.distance} ${P.unit}${P.distance === 1 ? "" : "s"}`;
      return Oe("div", {
        key: P.id,
        class: rt("vue-grid-editor-spacing-chip", `vue-grid-editor-spacing-chip-${P.side}`, `vue-grid-editor-spacing-chip-${P.axis}`, {
          "vue-grid-editor-spacing-chip-equal": P.isEqual
        }),
        style: N,
        "data-chip-id": P.id,
        "data-chip-side": P.side,
        "data-chip-equal": P.isEqual ? "true" : "false",
        "data-chip-neighbor": P.neighborId || "edge"
      }, [Oe("span", {
        class: "vue-grid-editor-spacing-chip-label"
      }, ye)]);
    });
  }, L = () => {
    var E, W, N, ye;
    if (!o) return null;
    const w = o.measurementHud;
    if (!w) return null;
    const P = p(w.position.x) + v(w.size.w), A = m(w.position.y), R = `${w.size.w}×${w.size.h} · col ${w.position.x}, row ${w.position.y}`, F = [];
    (E = w.delta) != null && E.dw && F.push(`${w.delta.dw > 0 ? "+" : ""}${w.delta.dw} col${Math.abs(w.delta.dw) === 1 ? "" : "s"}`), (W = w.delta) != null && W.dh && F.push(`${w.delta.dh > 0 ? "+" : ""}${w.delta.dh} row${Math.abs(w.delta.dh) === 1 ? "" : "s"}`), (N = w.delta) != null && N.dx && F.push(`x ${w.delta.dx > 0 ? "+" : ""}${w.delta.dx}`), (ye = w.delta) != null && ye.dy && F.push(`y ${w.delta.dy > 0 ? "+" : ""}${w.delta.dy}`);
    const S = [Oe("span", {
      class: "vue-grid-editor-measurement-hud-label"
    }, w.label || w.itemId), Oe("span", {
      class: "vue-grid-editor-measurement-hud-dims"
    }, R)];
    return F.length > 0 && S.push(Oe("span", {
      class: "vue-grid-editor-measurement-hud-delta"
    }, `Δ ${F.join(" · ")}`)), w.blocked && S.push(Oe("span", {
      class: "vue-grid-editor-measurement-hud-blocked"
    }, w.blockedMessage || w.blocked)), Oe("div", {
      key: `hud:${w.itemId}`,
      class: rt("vue-grid-editor-measurement-hud", `vue-grid-editor-measurement-hud-${w.interaction}`, {
        "vue-grid-editor-measurement-hud-blocked-state": !!w.blocked
      }),
      style: {
        left: `${P}px`,
        top: `${A}px`
      },
      "data-hud-item-id": w.itemId,
      "data-hud-interaction": w.interaction,
      "data-hud-blocked": w.blocked || void 0,
      role: "status",
      "aria-live": "polite"
    }, S);
  }, K = () => {
    if (!o) return [];
    const w = o.anchorEdges || [];
    if (w.length === 0) return [];
    const P = [];
    return w.forEach((A) => {
      const R = r.get(A.itemId) || n.find((N) => N.i === A.itemId);
      if (!R) return;
      const F = p(R.x), S = m(R.y), E = v(R.w), W = C(R.h);
      A.sides.forEach((N) => {
        const ye = {
          position: "absolute"
        };
        N === "left" ? Object.assign(ye, {
          left: `${F}px`,
          top: `${S}px`,
          height: `${W}px`,
          width: "2px"
        }) : N === "right" ? Object.assign(ye, {
          left: `${F + E - 2}px`,
          top: `${S}px`,
          height: `${W}px`,
          width: "2px"
        }) : N === "top" ? Object.assign(ye, {
          left: `${F}px`,
          top: `${S}px`,
          width: `${E}px`,
          height: "2px"
        }) : N === "bottom" ? Object.assign(ye, {
          left: `${F}px`,
          top: `${S + W - 2}px`,
          width: `${E}px`,
          height: "2px"
        }) : N === "center-x" ? Object.assign(ye, {
          left: `${F + E / 2 - 1}px`,
          top: `${S}px`,
          height: `${W}px`,
          width: "2px"
        }) : N === "center-y" && Object.assign(ye, {
          left: `${F}px`,
          top: `${S + W / 2 - 1}px`,
          width: `${E}px`,
          height: "2px"
        }), P.push(Oe("div", {
          key: `anchor:${A.role}:${A.itemId}:${N}`,
          class: rt("vue-grid-editor-anchor-edge", `vue-grid-editor-anchor-edge-${N}`, `vue-grid-editor-anchor-edge-${A.role}`),
          style: ye,
          "data-anchor-item-id": A.itemId,
          "data-anchor-side": N,
          "data-anchor-role": A.role
        }));
      });
    }), P;
  }, z = () => s ? s.ghostItems.map((w) => {
    const P = w.item, A = w.state === "blocked" || s.phase === "blocked";
    return Oe("div", {
      key: `placement-ghost:${s.id}:${w.id}`,
      class: rt("vue-grid-editor-placement-ghost", `vue-grid-editor-placement-ghost-${w.state}`, {
        "vue-grid-editor-placement-ghost-blocked": A,
        "vue-grid-editor-placement-ghost-committing": w.state === "committing"
      }),
      style: {
        left: `${p(P.x)}px`,
        top: `${m(P.y)}px`,
        width: `${v(P.w)}px`,
        height: `${C(P.h)}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-item-id": w.id,
      "data-placement-state": A ? "blocked" : w.state,
      "data-placement-x": String(P.x),
      "data-placement-y": String(P.y),
      "data-placement-w": String(P.w),
      "data-placement-h": String(P.h),
      "aria-hidden": "true"
    });
  }) : [], ne = () => s ? s.affectedOutlines.map((w) => {
    const P = w.after;
    return Oe("div", {
      key: `placement-affected:${s.id}:${w.id}:${w.kind}`,
      class: rt("vue-grid-editor-placement-affected", `vue-grid-editor-placement-affected-${w.kind}`),
      style: {
        left: `${p(P.x)}px`,
        top: `${m(P.y)}px`,
        width: `${v(P.w)}px`,
        height: `${C(P.h)}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-affected-id": w.id,
      "data-placement-outline-kind": w.kind,
      "aria-hidden": "true"
    });
  }) : [], D = () => {
    var S;
    if (!s) return null;
    const w = (S = s.ghostItems[0]) == null ? void 0 : S.item;
    if (!w && !s.blocked) return null;
    const P = w ? p(w.x) + v(w.w) : 0, A = w ? m(w.y) : 0, R = s.blocked, F = R ? R.message || `Placement blocked by ${R.reason}.` : `${s.ghostItems.length} item${s.ghostItems.length === 1 ? "" : "s"}`;
    return Oe("div", {
      key: `placement-hud:${s.id}`,
      class: rt("vue-grid-editor-placement-hud", {
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
    }, F);
  };
  return [...ne(), ...z(), D(), ...K(), ...M(), ...k(), L()].filter(Boolean);
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
  Hs as A,
  rr as B,
  Ys as C,
  Zn as D,
  oa as E,
  ji as F,
  nt as G,
  $r as H,
  xs as I,
  gt as J,
  ls as K,
  mo as L,
  Qn as M,
  Le as N,
  Br as O,
  Fr as P,
  vt as Q,
  oo as R,
  to as S,
  Er as T,
  Ve as U,
  zr as V,
  Ls as W,
  qn as X,
  Hr as Y,
  Co as Z,
  Is as _,
  Ss as a,
  Cs as b,
  Rs as c,
  Ki as d,
  Jn as e,
  gn as f,
  Xs as g,
  hn as h,
  xo as i,
  xr as j,
  ur as k,
  Wn as l,
  Eo as m,
  Nr as n,
  Kr as o,
  ai as p,
  Or as q,
  Lr as r,
  Xr as s,
  io as t,
  ea as u,
  mn as v,
  Ae as w,
  $s as x,
  xn as y,
  Vn as z
};
