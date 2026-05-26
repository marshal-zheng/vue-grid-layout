import { c as Si, b as Ci } from "./createGridLayoutComponent-BUqtSi2L.mjs";
import lt from "clsx";
import { e as Ri, a as de, o as Pe, m as $t, l as Ei, k as ns, s as Pi, f as Bi, d as zo, i as as } from "./utils-BCVYGne6.mjs";
import { y as He, B as $i, C as to, F as Me, w as Ks, x as Ft, h as oo, b as so, E as Gi, g as Ie, H as zi, i as Xs, e as Nt, d as wo, A as ht, r as cs, o as Ai, j as ds, p as ho, c as ls, a as Ot, s as us, q as fs, z as ys, G as Di } from "./commands-C5DwsbEU.mjs";
import { k as Ti, f as Oi } from "./migration-CPonYzEY.mjs";
import { ref as Ee, computed as ps, watch as vt, h as Le } from "vue";
import { deepEqual as Ke } from "fast-equals";
import { c as io, u as Li } from "./persistence-Db97X8w7.mjs";
import { e as ko } from "./core-C45AnvB2.mjs";
import { f as Hi, c as Fi, a as ji } from "./resolve-C3SqJijI.mjs";
const Ni = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", Ki = (e) => !!(e && typeof e == "object"), Ys = (e, t = {}) => {
  var a;
  const o = e.target;
  if (!Ki(o)) return !1;
  const s = (a = o.tagName) == null ? void 0 : a.toUpperCase();
  return s === "INPUT" || s === "TEXTAREA" || s === "SELECT" || o.isContentEditable ? !0 : (t.ignoredTargets || []).some((i) => typeof i == "string" ? typeof o.matches == "function" && o.matches(i) : i(o));
}, Xi = [
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
], Yi = (e, t) => e.toLowerCase() === t.toLowerCase(), _i = (e, t, o) => {
  const s = o === "mac" ? e.metaKey : e.ctrlKey, r = o === "mac" ? e.ctrlKey : e.metaKey, a = t.primary === !0;
  return !(a !== s || a && r || !a && (e.ctrlKey || e.metaKey) || (t.shift || !1) !== e.shiftKey || (t.alt || !1) !== e.altKey);
}, Ui = (e, t) => {
  const o = Ni(t.platform), s = Xi.find(
    (r) => (!r.platform || r.platform === o) && Yi(e.key, r.key) && _i(e, r, o)
  );
  return s ? typeof s.command == "function" ? s.command(e, t) : { ...s.command } : null;
}, Wi = (e, t = {}) => {
  if (Ys(e, t)) return null;
  const o = e.key, s = e.shiftKey ? t.fastMoveStep || 4 : t.moveStep || 1, r = e.shiftKey ? t.fastResizeStep || 2 : t.resizeStep || 1, a = Ui(e, t);
  if (a) return a;
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
}, ms = (e) => {
  var o, s, r, a, i;
  return e.status !== "blocked" && e.status !== "error" && e.status !== "timeout" ? null : {
    code: ((o = e.blocked) == null ? void 0 : o.reason) || ((s = e.error) == null ? void 0 : s.message) || "editor-command",
    level: e.status === "error" ? "error" : "warning",
    message: ((r = e.blocked) == null ? void 0 : r.message) || ((a = e.error) == null ? void 0 : a.message) || `Command ${e.type} was not applied.`,
    itemIds: (i = e.blocked) == null ? void 0 : i.itemIds,
    recoverable: e.status !== "error"
  };
}, qi = (e, t = {}) => {
  if (t.enabled === !1) return () => {
  };
  const o = t.target || (typeof window != "undefined" ? window : null);
  if (!o) return () => {
  };
  const s = typeof o == "string" && typeof document != "undefined" ? document.querySelector(o) || window : o;
  if (!s || typeof s.addEventListener != "function")
    return () => {
    };
  const r = (a) => {
    var d, c;
    const i = a;
    if (!Ys(i, t) && e.placementSession.value) {
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
          const m = ms(p);
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
      const y = i.shiftKey ? t.placementFastNudgeStep || 4 : t.placementNudgeStep || 1, u = i.key === "ArrowLeft" ? { dx: -y, dy: 0 } : i.key === "ArrowRight" ? { dx: y, dy: 0 } : i.key === "ArrowUp" ? { dx: 0, dy: -y } : i.key === "ArrowDown" ? { dx: 0, dy: y } : null;
      if (u && !i.ctrlKey && !i.metaKey && !i.altKey) {
        i.preventDefault();
        const p = e.placementSession.value, m = p.cursor || ((c = p.ghostItems[0]) == null ? void 0 : c.item) || p.items[0];
        e.updatePlacement({
          cursor: {
            x: Math.max(0, ((m == null ? void 0 : m.x) || 0) + u.dx),
            y: Math.max(0, ((m == null ? void 0 : m.y) || 0) + u.dy),
            source: "keyboard"
          }
        });
        return;
      }
    }
    const f = Wi(i, t);
    if (f) {
      if (i.preventDefault(), f.type === "paste" && t.pasteMode === "interactive") {
        e.beginPlacement({
          source: "paste",
          commandType: "paste",
          strategy: "cursor",
          placementIntent: "here",
          placementAnchor: "top-left"
        }).then((y) => {
          var u, p, m, v, C, S;
          y.status === "blocked" ? (v = t.ariaMessage) == null || v.call(t, {
            code: ((u = y.blocked) == null ? void 0 : u.reason) || "grid-editor.placement.blocked",
            level: "warning",
            message: ((p = y.blocked) == null ? void 0 : p.message) || "Placement could not start.",
            itemIds: (m = y.blocked) == null ? void 0 : m.itemIds,
            recoverable: !0
          }) : (S = t.ariaMessage) == null || S.call(t, {
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
        const u = ms(y);
        u && ((p = t.ariaMessage) == null || p.call(t, u));
      });
    }
  };
  return s.addEventListener("keydown", r), () => {
    s.removeEventListener("keydown", r);
  };
}, Vi = 2, Zi = 1, Ji = 0.5, Qi = 1, er = 500, tr = 0.01, or = {
  drag: 3,
  drop: 3,
  placement: 3,
  resize: 2,
  keyboard: 3,
  api: 3
}, gs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, hs = (e) => [
  { kind: "left", axis: "x", position: e.x, priority: 10, edge: "left" },
  { kind: "right", axis: "x", position: e.x + e.w, priority: 11, edge: "right" },
  { kind: "center-x", axis: "x", position: e.x + e.w / 2, priority: 20, edge: "center-x" },
  { kind: "top", axis: "y", position: e.y, priority: 10, edge: "top" },
  { kind: "bottom", axis: "y", position: e.y + e.h, priority: 11, edge: "bottom" },
  { kind: "center-y", axis: "y", position: e.y + e.h / 2, priority: 20, edge: "center-y" }
], sr = (e, t) => {
  const o = [], s = e.x + e.w, r = t.x + t.w, a = e.y + e.h, i = t.y + t.h, f = Math.max(e.y, t.y), d = Math.min(a, i), c = Math.max(e.x, t.x), y = Math.min(s, r), u = f + Math.max(0, d - f) / 2, p = c + Math.max(0, y - c) / 2;
  if (d > f && s < t.x) {
    const m = t.x - s;
    o.push({
      kind: "spacing-x",
      axis: "x",
      position: u,
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
      position: u,
      start: r,
      end: e.x,
      distance: m,
      priority: 40 + m,
      label: `${m} ${m === 1 ? "col" : "cols"}`
    });
  }
  if (y > c && a < t.y) {
    const m = t.y - a;
    o.push({
      kind: "spacing-y",
      axis: "y",
      position: p,
      start: a,
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
}, _s = (e, t, o) => {
  var s, r;
  return !(e.static && o.includeStatic === !1 || (s = t[e.i]) != null && s.locked && o.includeLocked === !1 || ((r = t[e.i]) == null ? void 0 : r.visible) === !1 && o.includeHidden !== !0);
}, ir = (e, t) => e.y === t.y || e.y + e.h === t.y + t.h || e.x === t.x || e.x + e.w === t.x + t.w, rr = (e, t, o, s, r, a, i, f) => {
  const d = s.axis === "x" ? Math.min(t.y, o.y) : Math.min(t.x, o.x), c = s.axis === "x" ? Math.max(t.y + t.h, o.y + o.h) : Math.max(t.x + t.w, o.x + o.w), y = Math.abs(s.position - r.position), u = a > 0 ? Math.max(0, Math.min(1, 1 - y / a)) : y === 0 ? 1 : 0, p = y <= i, m = f && ir(t, o) ? 20 : 0;
  return {
    id: `${e}:${s.kind}:${t.i}:${r.kind}`,
    kind: s.kind,
    axis: s.axis,
    position: r.position,
    sourceIds: [t.i],
    targetId: e,
    distance: y,
    priority: s.priority + r.priority - m,
    proximity: u,
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
}, yt = (e) => e.kind === "spacing-x" || e.kind === "spacing-y", nr = (e) => e.debug === !0 || e.debug === "layer" || e.debug === "panel", ar = (e) => e.debug === "panel" ? "panel" : e.debug === !0 || e.debug === "layer" ? "layer" : !1, cr = (e, t) => {
  const o = e.maxVisibleGuides;
  return typeof o == "number" ? Math.max(0, o) : o && typeof o[t] == "number" ? Math.max(0, o[t] || 0) : or[t];
}, dr = (e) => !!(e.display && Number.isFinite(e.display.start) && Number.isFinite(e.display.end) && e.display.end > e.display.start), vs = (e, t) => (t.includes(e.id) ? -1e3 : 0) + (e.isSnapped ? -500 : 0) + (yt(e) ? 20 : 0) - Math.round((e.proximity || 0) * 50), lr = (e, t) => {
  const o = Array.from(/* @__PURE__ */ new Set([...e.sourceIds, ...t.sourceIds])), s = e.anchorIds || t.anchorIds ? Array.from(/* @__PURE__ */ new Set([...e.anchorIds || [], ...t.anchorIds || []])) : void 0;
  return {
    ...e,
    sourceIds: o,
    anchorIds: s,
    display: e.display ? { ...e.display, sourceIds: o } : e.display
  };
}, ur = (e, t = {}, o = []) => {
  var y, u, p, m;
  const s = t.interaction || "drag", r = cr(t, s);
  if (r <= 0) return [];
  const a = e.filter(dr).slice().sort(
    (v, C) => vs(v, o) - vs(C, o) || v.distance - C.distance || v.priority - C.priority || v.id.localeCompare(C.id)
  ), i = /* @__PURE__ */ new Map(), f = [];
  for (let v = 0; v < a.length; v += 1) {
    const C = a[v], S = yt(C) ? `s:${C.kind}:${C.position}:${(u = (y = C.display) == null ? void 0 : y.start) != null ? u : ""}:${(m = (p = C.display) == null ? void 0 : p.end) != null ? m : ""}` : `a:${C.kind}:${C.axis}:${C.position}`, k = i.get(S);
    k ? yt(C) || i.set(S, lr(k, C)) : (i.set(S, C), f.push(S));
  }
  const d = f.slice(0, r).map((v) => i.get(v)).filter(Boolean);
  let c = !1;
  return d.map((v) => {
    if (!v.display) return v;
    const C = t.showSpacingLabels !== !1 && yt(v) && !c;
    return C && (c = !0), {
      ...v,
      display: {
        ...v.display,
        showLabel: C
      }
    };
  });
}, qt = (e, t, o, s, r) => {
  const a = t.x + t.w, i = t.y + t.h;
  let f = null;
  for (let d = 0; d < o.length; d += 1) {
    const c = o[d];
    if (c.i === t.i || !_s(c, s, r)) continue;
    const y = c.x + c.w, u = c.y + c.h;
    if (e === "left" || e === "right") {
      const p = Math.max(t.y, c.y), m = Math.min(i, u);
      if (m <= p) continue;
      if (e === "left" && y <= t.x) {
        const v = t.x - y;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: y, end: t.x },
          position: p + (m - p) / 2
        });
      } else if (e === "right" && c.x >= a) {
        const v = c.x - a;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: a, end: c.x },
          position: p + (m - p) / 2
        });
      }
    } else {
      const p = Math.max(t.x, c.x), m = Math.min(a, y);
      if (m <= p) continue;
      if (e === "top" && u <= t.y) {
        const v = t.y - u;
        (!f || v < f.distance) && (f = {
          id: c.i,
          distance: v,
          span: { start: u, end: t.y },
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
}, fr = (e) => e === "left" || e === "right" ? "x" : "y", yr = (e) => e === "left" || e === "right" ? "col" : "row", pr = (e, t, o, s) => {
  var p;
  if (s.showSpacingChips === !1) return [];
  const r = (p = s.spacingChipMinDistance) != null ? p : Qi, a = ["top", "right", "bottom", "left"], i = {
    top: qt("top", e, t, o, s),
    right: qt("right", e, t, o, s),
    bottom: qt("bottom", e, t, o, s),
    left: qt("left", e, t, o, s)
  }, f = (m, v) => !!(m && v && Math.abs(m.distance - v.distance) <= tr), d = s.detectEqualSpacing !== !1, c = d && f(i.left, i.right), y = d && f(i.top, i.bottom), u = [];
  for (let m = 0; m < a.length; m += 1) {
    const v = a[m], C = i[v];
    if (!C || C.distance < r) continue;
    const S = v === "left" || v === "right" ? c : y;
    u.push({
      id: `chip:${e.i}:${v}:${C.id}`,
      side: v,
      axis: fr(v),
      position: C.position,
      span: C.span,
      distance: C.distance,
      unit: yr(v),
      isEqual: S,
      neighborId: C.id
    });
  }
  return u;
};
function mr(e, t, o) {
  var i, f, d, c;
  if (t.showMeasurementHud === !1) return null;
  const s = t.itemLabels || {}, r = {
    itemId: e.i,
    label: s[e.i] || e.i,
    position: { x: e.x, y: e.y },
    size: { w: e.w, h: e.h },
    interaction: o
  }, a = (i = t.startGeometry) == null ? void 0 : i[e.i];
  return t.delta ? r.delta = t.delta : a && (r.delta = {
    dx: e.x - a.x,
    dy: e.y - a.y,
    dw: e.w - a.w,
    dh: e.h - a.h
  }), (f = t.blocked) != null && f.reason && (r.blocked = t.blocked.reason), (d = t.blocked) != null && d.message && (r.blockedMessage = t.blocked.message), (c = t.blocked) != null && c.itemIds && (r.blockedItemIds = t.blocked.itemIds), typeof t.selectionCount == "number" && (r.selectionCount = t.selectionCount), r;
}
const gr = (e, t, o) => {
  if (o.highlightAlignmentTargets === !1) return [];
  if (!t) return [];
  const s = e.filter(
    (c) => !yt(c) && c.targetEdge && c.sourceEdge
  ), r = s.filter((c) => c.isSnapped), a = r.length > 0 ? r : s.slice().sort((c, y) => (y.proximity || 0) - (c.proximity || 0)).slice(0, 1), i = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
  for (let c = 0; c < a.length; c += 1) {
    const y = a[c];
    if (!(!y.targetEdge || !y.sourceEdge)) {
      i.has(y.axis) || i.set(y.axis, y.targetEdge);
      for (let u = 0; u < y.sourceIds.length; u += 1) {
        const p = y.sourceIds[u];
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
}, hr = (e, t, o, s = {}, r = {}) => {
  var E, me, Oe, ze;
  const a = gs(), i = r.interaction || "drag";
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
  const f = (E = r.maxItems) != null ? E : er, d = typeof r.thresholdPx == "number" ? r.thresholdPx : null, c = (me = r.predictRadiusX) != null ? me : d !== null ? d : Vi, y = (Oe = r.predictRadiusY) != null ? Oe : d !== null ? d : Zi, u = (ze = r.snapThresholdCells) != null ? ze : d !== null ? d : Ji, p = r.sectionSnap !== !1, m = e.filter(
    (W) => W.i !== t.i && _s(W, s, r)
  ), v = m.length > f, C = v ? m.slice(0, f) : m, S = hs(o), k = [];
  C.forEach((W) => {
    const ve = hs(W);
    S.forEach((ie) => {
      ve.forEach((J) => {
        if (ie.axis !== J.axis) return;
        const We = Math.abs(ie.position - J.position), qe = ie.axis === "x" ? c : y;
        We <= qe && k.push(rr(
          t.i,
          W,
          o,
          ie,
          J,
          qe,
          u,
          p
        ));
      });
    }), sr(W, o).forEach((ie) => {
      k.push({
        id: `${t.i}:${ie.kind}:${W.i}`,
        kind: ie.kind,
        axis: ie.axis,
        position: ie.position,
        sourceIds: [W.i],
        targetId: t.i,
        distance: ie.distance,
        priority: ie.priority,
        proximity: ie.distance === 0 ? 1 : 0.5,
        isPredictive: ie.distance > u,
        isSnapped: ie.distance <= u,
        anchorIds: [W.i, t.i],
        display: {
          kind: "spacing",
          start: ie.start,
          end: ie.end,
          label: ie.label,
          sourceIds: [W.i]
        }
      });
    });
  }), k.sort(
    (W, ve) => W.distance - ve.distance || W.priority - ve.priority || W.id.localeCompare(ve.id)
  );
  const F = k.filter((W) => !yt(W) && W.isSnapped), K = r.snap === !1 || F.length === 0 ? [] : [F[0].id], A = ur(k, r, K), ae = ar(r), L = nr(r), w = A.filter((W) => {
    var ve;
    return (ve = W.display) == null ? void 0 : ve.showLabel;
  }).map((W) => W.id), R = pr(o, e, s, r), T = mr(o, r, i), M = gr(A, t.i, r), O = k.filter((W) => W.isPredictive && !yt(W)).length, G = F.length, z = gs() - a, q = typeof r.maxDurationMs == "number" && z > r.maxDurationMs;
  return {
    activeId: t.i,
    interaction: i,
    guides: k,
    displayGuides: A,
    debugGuides: L ? k : void 0,
    snappedGuideIds: K,
    spacingLabelGuideIds: w,
    spacingChips: R,
    measurementHud: T,
    anchorEdges: M,
    showGrid: r.showGrid !== !1,
    debug: L,
    debugMode: ae,
    diagnostics: {
      durationMs: z,
      itemCount: m.length,
      degraded: v || q,
      reason: v ? "max-items" : q ? "max-duration" : void 0,
      fullGuideCount: k.length,
      displayGuideCount: A.length,
      spacingLabelCount: w.length,
      predictCount: O,
      snappedCount: G,
      anchorEdgeCount: M.length,
      spacingChipCount: R.length
    }
  };
}, Qn = (e, t, o, s = {}, r = {}) => Ao({
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
}).guideState, ea = (e, t) => {
  const o = t.snappedGuideIds[0];
  if (!o) return e;
  const s = t.guides.find((r) => r.id === o);
  return !s || yt(s) ? e : s.axis === "x" ? s.kind === "right" ? { ...e, x: s.position - e.w } : s.kind === "center-x" ? { ...e, x: s.position - e.w / 2 } : { ...e, x: s.position } : s.kind === "bottom" ? { ...e, y: s.position - e.h } : s.kind === "center-y" ? { ...e, y: s.position - e.h / 2 } : { ...e, y: s.position };
}, vr = 500, br = 160, Ir = 16, bs = 240, Is = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, xr = (e, t, o) => ({
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
}), Mo = (e, t) => ({
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
}), wr = (e) => {
  const t = Object.keys(e).sort(), o = {}, s = {};
  return t.forEach((r) => {
    const a = e[r], i = Math.floor(a.top), f = Math.max(i, Math.floor(a.bottom - 1)), d = Math.floor(a.left), c = Math.max(d, Math.floor(a.right - 1));
    for (let y = i; y <= f; y++)
      o[y] || (o[y] = []), o[y].push(r);
    for (let y = d; y <= c; y++)
      s[y] || (s[y] = []), s[y].push(r);
  }), Object.keys(o).forEach((r) => o[Number(r)].sort()), Object.keys(s).forEach((r) => s[Number(r)].sort()), { byId: e, ids: t, rows: o, columns: s };
}, ao = (e, t, o, s) => Math.max(0, Math.min(t, s) - Math.max(e, o)), xs = (e, t, o) => {
  if (o === "x") {
    const i = ao(e.top, e.bottom, t.top, t.bottom);
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
  const s = ao(e.left, e.right, t.left, t.right);
  if (s <= 0) return null;
  const r = t.top >= e.bottom ? t.top - e.bottom : e.top >= t.bottom ? e.top - t.bottom : 0, a = t.top >= e.bottom ? "after" : e.top >= t.bottom ? "before" : "overlap";
  return {
    id: `${e.i}:y:${t.i}`,
    sourceId: e.i,
    targetId: t.i,
    axis: o,
    direction: a,
    gap: r,
    overlap: s,
    priority: r,
    sectionId: e.sectionId === t.sectionId ? e.sectionId : void 0,
    rowId: e.rowId === t.rowId ? e.rowId : void 0
  };
}, kr = (e) => {
  const t = Object.keys(e).sort(), o = [];
  for (let s = 0; s < t.length; s++)
    for (let r = s + 1; r < t.length; r++) {
      const a = e[t[s]], i = e[t[r]], f = xs(a, i, "x"), d = xs(a, i, "y");
      f && o.push(f), d && o.push(d);
    }
  return o.sort(
    (s, r) => s.priority - r.priority || s.axis.localeCompare(r.axis) || s.sourceId.localeCompare(r.sourceId) || s.targetId.localeCompare(r.targetId)
  );
}, Mr = (e) => e.axis === "x" ? e.direction === "before" ? "left" : "right" : e.direction === "before" ? "top" : "bottom", Sr = (e, t, o) => {
  const s = t.filter((a) => a.gap > 0).map((a) => {
    const i = e[a.sourceId], f = e[a.targetId], d = a.axis, c = d === "x" ? i.right <= f.left : i.bottom <= f.top, y = d === "x" ? c ? i.right : f.right : c ? i.bottom : f.bottom, u = d === "x" ? c ? f.left : i.left : c ? f.top : i.top, p = d === "x" ? Math.max(i.top, f.top) + a.overlap / 2 : Math.max(i.left, f.left) + a.overlap / 2;
    return {
      id: `${a.id}:spacing`,
      axis: d,
      sourceId: a.sourceId,
      targetId: a.targetId,
      side: Mr(a),
      start: y,
      end: u,
      position: p,
      distance: a.gap,
      unit: d === "x" ? "col" : "row",
      sectionId: a.sectionId,
      rowId: a.rowId
    };
  }), r = /* @__PURE__ */ new Map();
  return s.forEach((a) => {
    const i = `${a.axis}:${a.sectionId || ""}:${a.rowId || ""}:${a.distance}`;
    r.set(i, (r.get(i) || 0) + 1);
  }), s.map((a) => {
    const i = `${a.axis}:${a.sectionId || ""}:${a.rowId || ""}:${a.distance}`;
    return {
      ...a,
      isEqual: (r.get(i) || 0) > 1,
      deviation: 0,
      mode: a.axis === "x" ? "spacing-x" : "spacing-y"
    };
  }).sort(
    (a, i) => a.distance - i.distance || a.axis.localeCompare(i.axis) || a.sourceId.localeCompare(i.sourceId) || a.targetId.localeCompare(i.targetId)
  ).slice(0, o);
}, ws = (e) => e === "x" ? "horizontal" : "vertical", ks = (e) => e === "x" ? "spacing-x" : "spacing-y", Vt = (e, t, o, s) => {
  if (e.length < 3) return null;
  const r = e.slice().sort(
    (m, v) => t === "x" ? m.left - v.left || m.i.localeCompare(v.i) : m.top - v.top || m.i.localeCompare(v.i)
  ), a = r[0], i = r[r.length - 1], f = t === "x" ? { start: a.left, end: i.right } : { start: a.top, end: i.bottom }, d = [];
  for (let m = 1; m < r.length; m++) {
    const v = r[m - 1], C = r[m];
    d.push(o === "center-to-center" ? t === "x" ? C.centerX - v.centerX : C.centerY - v.centerY : t === "x" ? C.left - v.right : C.top - v.bottom);
  }
  const c = d.length > 0 ? d.reduce((m, v) => m + v, 0) / d.length : 0, y = d.reduce(
    (m, v) => Math.max(m, Math.abs(v - c)),
    0
  ), u = Array.from(new Set(r.map((m) => m.sectionId).filter(Boolean))), p = Array.from(new Set(r.map((m) => m.rowId).filter(Boolean)));
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
    sectionId: u.length === 1 ? u[0] : void 0,
    rowId: p.length === 1 ? p[0] : void 0
  };
}, Cr = (e) => {
  var i, f;
  const t = He(e.sectionRows, e.layout), o = new Set(e.selectionIds || []), s = e.layout.filter((d) => o.size === 0 || o.has(d.i)).map((d) => Mo(d, t.itemMembership[d.i]));
  if (s.length < 3) return [];
  const r = [
    Vt(s, "x", "edge-to-edge", ws("x")),
    Vt(s, "y", "edge-to-edge", ws("y")),
    Vt(s, "x", "center-to-center", ks("x")),
    Vt(s, "y", "center-to-center", ks("y"))
  ].filter(Boolean), a = (f = (i = e.options) == null ? void 0 : i.maxDistributionCandidates) != null ? f : Ir;
  return r.sort((d, c) => d.deviation - c.deviation || d.id.localeCompare(c.id)).slice(0, a);
}, Rr = (e, t, o, s) => {
  const r = { x: t.x, y: t.y, w: t.w, h: t.h };
  if (e.kind === "spacing-x" || e.kind === "spacing-y") return r;
  const a = s === "w" || s === "sw" || s === "nw", i = s === "n" || s === "ne" || s === "nw";
  if (o === "resize") {
    if (e.kind === "right") return { ...r, w: Math.max(1, e.position - t.x) };
    if (e.kind === "bottom") return { ...r, h: Math.max(1, e.position - t.y) };
    if (e.kind === "left" && a) {
      const f = t.x + t.w;
      return { ...r, x: e.position, w: Math.max(1, f - e.position) };
    }
    if (e.kind === "top" && i) {
      const f = t.y + t.h;
      return { ...r, y: e.position, h: Math.max(1, f - e.position) };
    }
  }
  return e.axis === "x" ? e.kind === "right" ? { ...r, x: e.position - t.w } : e.kind === "center-x" ? { ...r, x: e.position - t.w / 2 } : { ...r, x: e.position } : e.kind === "bottom" ? { ...r, y: e.position - t.h } : e.kind === "center-y" ? { ...r, y: e.position - t.h / 2 } : { ...r, y: e.position };
}, Us = (e) => {
  var o, s, r;
  const t = (r = (o = e.options) == null ? void 0 : o.snapThresholdCells) != null ? r : (s = e.options) == null ? void 0 : s.thresholdPx;
  return typeof t == "number" && Number.isFinite(t) ? t : 0.5;
}, So = (e, t, o, s) => {
  if (s === !0) return !1;
  const r = e.itemMembership[t], a = e.itemMembership[o];
  if (!r || !a) return !1;
  if (r.sectionId && a.sectionId && r.sectionId !== a.sectionId) {
    const i = e.items[r.sectionId], f = e.items[a.sectionId];
    return (i == null ? void 0 : i.crossScopePolicy) !== "allow" && (f == null ? void 0 : f.crossScopePolicy) !== "allow";
  }
  if (r.rowId && a.rowId && r.rowId !== a.rowId) {
    const i = e.items[r.rowId], f = e.items[a.rowId];
    return (i == null ? void 0 : i.crossScopePolicy) !== "allow" && (f == null ? void 0 : f.crossScopePolicy) !== "allow";
  }
  return !1;
}, Er = (e, t, o, s, r) => {
  if (!t) return [];
  const a = Us(e), i = e.layout.filter((u) => u.i !== t.i).sort((u, p) => u.i.localeCompare(p.i)), f = o.filter((u) => u.sourceId !== t.i && u.targetId !== t.i && u.distance > 0).sort((u, p) => u.distance - p.distance || u.id.localeCompare(p.id)), d = [], c = t.x + t.w, y = t.y + t.h;
  return i.forEach((u) => {
    const p = u.x + u.w, m = u.y + u.h, v = ao(t.y, y, u.y, m) > 0, C = ao(t.x, c, u.x, p) > 0, S = p <= t.x, k = c <= u.x, F = m <= t.y, K = y <= u.y;
    f.forEach((A) => {
      var ae, L, w, R, T, M;
      if (A.axis === "x" && v && (S || k)) {
        const O = S ? t.x - p : u.x - c, G = Math.abs(O - A.distance);
        if (G <= a) {
          const z = S ? p + A.distance : u.x - A.distance - t.w, q = So(
            s,
            u.i,
            t.i,
            (ae = e.options) == null ? void 0 : ae.allowCrossSectionRow
          ) ? "section-row-policy" : void 0;
          d.push({
            id: `snap:spacing:x:${t.i}:${u.i}:${A.id}`,
            kind: "spacing",
            axis: "x",
            sourceIds: [u.i, A.sourceId, A.targetId],
            targetId: t.i,
            targetEdge: S ? "left" : "right",
            sourceEdge: S ? "right" : "left",
            distance: G,
            proximity: a === 0 ? 1 : 1 - Math.min(1, G / a),
            priority: 30 + G,
            snapped: !q,
            geometry: { x: z, y: t.y, w: t.w, h: t.h },
            guideIds: [],
            sectionId: (L = s.itemMembership[t.i]) == null ? void 0 : L.sectionId,
            rowId: (w = s.itemMembership[t.i]) == null ? void 0 : w.rowId,
            blocked: q
          });
        }
      }
      if (A.axis === "y" && C && (F || K)) {
        const O = F ? t.y - m : u.y - y, G = Math.abs(O - A.distance);
        if (G <= a) {
          const z = F ? m + A.distance : u.y - A.distance - t.h, q = So(
            s,
            u.i,
            t.i,
            (R = e.options) == null ? void 0 : R.allowCrossSectionRow
          ) ? "section-row-policy" : void 0;
          d.push({
            id: `snap:spacing:y:${t.i}:${u.i}:${A.id}`,
            kind: "spacing",
            axis: "y",
            sourceIds: [u.i, A.sourceId, A.targetId],
            targetId: t.i,
            targetEdge: F ? "top" : "bottom",
            sourceEdge: F ? "bottom" : "top",
            distance: G,
            proximity: a === 0 ? 1 : 1 - Math.min(1, G / a),
            priority: 30 + G,
            snapped: !q,
            geometry: { x: t.x, y: z, w: t.w, h: t.h },
            guideIds: [],
            sectionId: (T = s.itemMembership[t.i]) == null ? void 0 : T.sectionId,
            rowId: (M = s.itemMembership[t.i]) == null ? void 0 : M.rowId,
            blocked: q
          });
        }
      }
    });
  }), d.sort(
    (u, p) => u.priority - p.priority || p.proximity - u.proximity || u.distance - p.distance || u.id.localeCompare(p.id)
  ).slice(0, r);
}, Pr = (e, t, o, s) => {
  if (!t) return [];
  const r = Us(e), a = [], i = [
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
      c.forEach((u) => {
        if (y.axis !== u.axis) return;
        const p = Math.abs(y.position - u.position);
        if (p > r) return;
        const m = { x: t.x, y: t.y, w: t.w, h: t.h };
        y.axis === "x" ? y.edge === "right" ? m.x = u.position - t.w : y.edge === "center-x" ? m.x = u.position - t.w / 2 : m.x = u.position : y.edge === "bottom" ? m.y = u.position - t.h : y.edge === "center-y" ? m.y = u.position - t.h / 2 : m.y = u.position, a.push({
          id: `snap:section-row:${d.id}:${y.edge}:${u.edge}`,
          kind: "section-row",
          axis: y.axis,
          sourceIds: [d.id],
          targetId: t.i,
          targetEdge: y.edge,
          sourceEdge: u.edge,
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
  }), a.sort(
    (d, c) => d.priority - c.priority || c.proximity - d.proximity || d.distance - c.distance || d.id.localeCompare(c.id)
  ).slice(0, s);
}, Br = (e, t, o, s, r, a, i, f) => t ? e.guides.map((d) => {
  const c = d.kind === "spacing-x" || d.kind === "spacing-y" ? "spacing" : d.kind === "center-x" || d.kind === "center-y" ? "center" : "edge", y = r.itemMembership[t.i], u = d.sourceIds.some(
    (p) => So(r, p, t.i, f)
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
    snapped: o && d.isSnapped === !0 && c !== "spacing" && !u,
    geometry: Rr(d, t, a, i),
    guideIds: [d.id],
    sectionId: y == null ? void 0 : y.sectionId,
    rowId: y == null ? void 0 : y.rowId,
    blocked: u ? "section-row-policy" : void 0
  };
}).sort(
  (d, c) => (d.snapped === c.snapped ? 0 : d.snapped ? -1 : 1) || d.distance - c.distance || d.priority - c.priority || d.id.localeCompare(c.id)
).slice(0, s) : [], $r = (e, t) => {
  const o = [];
  return e.forEach((s) => {
    const r = t[s.i];
    (r == null ? void 0 : r.visible) === !1 && o.push({ code: "grid-editor.intelligence.filtered.hidden", itemIds: [s.i], reason: "hidden" }), r != null && r.locked && o.push({ code: "grid-editor.intelligence.filtered.locked", itemIds: [s.i], reason: "locked" }), s.static && o.push({ code: "grid-editor.intelligence.filtered.static", itemIds: [s.i], reason: "static-item" });
  }), o;
}, Ao = (e) => {
  var E, me, Oe, ze, W, ve, ie, J, We, qe, pt, Je, et, st, it, Ye;
  const t = Is(), o = (me = (E = e.options) == null ? void 0 : E.maxItems) != null ? me : vr, s = (ze = (Oe = e.options) == null ? void 0 : Oe.maxSnapCandidates) != null ? ze : br, r = ((W = e.options) != null && W.maxVisibleGuides, bs), a = e.metaById || {}, i = He(e.sectionRows, e.layout), f = e.layout.length > o ? e.layout.slice(0, o) : e.layout.slice(), c = Ti().build(f, {
    cols: e.cols,
    maxRows: e.maxRows,
    compactType: e.compactType,
    allowOverlap: e.allowOverlap,
    preventCollision: e.preventCollision
  }).getLayout(), y = {};
  c.forEach((we) => {
    y[we.i] = Mo(we, i.itemMembership[we.i]);
  }), e.candidateItem && !y[e.candidateItem.i] && (y[e.candidateItem.i] = Mo(
    e.candidateItem,
    i.itemMembership[e.candidateItem.i]
  ));
  const u = wr(y), p = kr(y), m = Sr(y, p, r), v = Cr(e), C = e.interaction === "toolbar" ? "api" : e.interaction, S = e.activeItem && e.candidateItem ? hr(e.layout, e.activeItem, e.candidateItem, a, {
    ...e.options,
    interaction: C
  }) : xr(((ve = e.activeItem) == null ? void 0 : ve.i) || null, C), k = ((ie = e.options) == null ? void 0 : ie.snap) !== !1, F = Br(
    S,
    e.candidateItem,
    k,
    s,
    i,
    e.interaction,
    (J = e.options) == null ? void 0 : J.resizeHandle,
    (We = e.options) == null ? void 0 : We.allowCrossSectionRow
  ), K = Er(
    e,
    e.candidateItem,
    m,
    i,
    s
  ), ae = [
    ...Pr(
      e,
      e.candidateItem,
      i,
      s
    ),
    ...K,
    ...F
  ].map((we) => k ? we : { ...we, snapped: !1 }).sort(
    (we, rt) => we.priority - rt.priority || rt.proximity - we.proximity || we.distance - rt.distance || we.id.localeCompare(rt.id)
  ).slice(0, s), L = Is() - t, w = typeof ((qe = e.options) == null ? void 0 : qe.maxDurationMs) == "number" && L > e.options.maxDurationMs, R = e.layout.length > o || w || !!((pt = S.diagnostics) != null && pt.degraded), T = e.layout.length > o ? "max-items" : w ? "max-duration" : ((Je = S.diagnostics) == null ? void 0 : Je.reason) === "max-items" || ((et = S.diagnostics) == null ? void 0 : et.reason) === "max-duration" ? S.diagnostics.reason : void 0, M = $r(e.layout, a), O = ["grid-editor.intelligence.computed"];
  e.layout.length > o && O.push("grid-editor.intelligence.degraded.max-items"), w && O.push("grid-editor.intelligence.degraded.max-duration"), v.some((we) => we.isEqual) ? O.push("grid-editor.distribution.equal") : v.length > 0 && O.push("grid-editor.distribution.unequal"), i.warnings.forEach((we) => O.push(we.code)), M.forEach((we) => O.push(we.code));
  const G = {
    durationMs: L,
    itemCount: e.layout.length,
    selectedCount: ((st = e.selectionIds) == null ? void 0 : st.length) || 0,
    candidateCount: ae.length + v.length,
    snapCandidateCount: ae.length,
    distributionCandidateCount: v.length,
    spacingRelationCount: m.length,
    sectionRowCount: Object.keys(i.items).length,
    snapSource: ((it = ae.find((we) => we.snapped)) == null ? void 0 : it.kind) || "none",
    distributionMode: ((Ye = v[0]) == null ? void 0 : Ye.mode) || "none",
    sectionRowSource: Object.keys(i.items).length > 0 ? "metadata" : "none",
    degraded: R,
    reason: T,
    filtered: M,
    codes: O
  }, z = S.measurementHud, q = {
    ...S,
    diagnostics: {
      ...S.diagnostics || {
        durationMs: L,
        itemCount: e.layout.length
      },
      intelligence: G
    }
  };
  return {
    itemRects: y,
    geometryIndex: u,
    neighbors: p,
    snapCandidates: ae,
    spacingRelations: m,
    distributionCandidates: v,
    sectionRows: i,
    guideState: q,
    measurementHud: z,
    diagnostics: G
  };
}, vo = (e, t, o) => ({
  ...e,
  degraded: e.degraded || !!o,
  reason: o || e.reason,
  codes: e.codes.includes(t) ? e.codes : [...e.codes, t]
}), Gr = (e) => e === "collision" ? "grid-editor.snap.blocked.collision" : e === "bounds" ? "grid-editor.snap.blocked.bounds" : e === "maxRows" ? "grid-editor.snap.blocked.maxRows" : e === "section-row-policy" ? "grid-editor.snap.blocked.section-row-policy" : `grid-editor.snap.blocked.${e}`, zr = (e, t, o, s) => {
  var i, f;
  const r = (i = s.validate) == null ? void 0 : i.call(s, e, o);
  if (r) return r;
  if (o.blocked) return o.blocked;
  const a = (f = s.metaById) == null ? void 0 : f[t.i];
  if (a != null && a.locked) return "locked";
  if ((a == null ? void 0 : a.visible) === !1) return "hidden";
  if (t.static) return "static-item";
  if (e.x < 0 || e.y < 0 || typeof s.cols == "number" && e.x + e.w > s.cols) return "bounds";
  if (typeof s.maxRows == "number" && Number.isFinite(s.maxRows) && e.y + e.h > s.maxRows)
    return "maxRows";
  if (s.allowOverlap !== !0 && s.layout) {
    const d = { ...t, ...e };
    if (s.layout.find((y) => y.i !== t.i && Ri(y, d))) return "collision";
  }
  return null;
}, Ar = (e, t, o = {}) => {
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
      diagnostics: vo(e.diagnostics, "grid-editor.snap.disabled")
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
  const a = [];
  for (let d = 0; d < r.length; d++) {
    const c = r[d], y = zr(c.geometry, t, c, o);
    if (y) {
      a.push({ candidate: c, reason: y });
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
      diagnostics: vo(e.diagnostics, "grid-editor.snap.selected")
    };
  }
  const i = a[0], f = (i == null ? void 0 : i.reason) || "invalid-input";
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
    diagnostics: vo(
      e.diagnostics,
      Gr(f),
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
}, Dr = (e) => {
  const t = Array.from(new Set(e.selectedIds.filter(Boolean))), o = e.activeId && t.includes(e.activeId) ? e.activeId : t[t.length - 1] || null, s = e.anchorId && t.includes(e.anchorId) ? e.anchorId : t[0] || null;
  return {
    ...e,
    selectedIds: t,
    activeId: o,
    anchorId: s,
    mode: t.length > 1 ? "multiple" : "single"
  };
}, Tr = (e) => e.map((t) => t.i), Or = (e, t) => to(e, t[e.i]).editable, Lr = (e, t, o, s) => {
  if (e.length <= 1) return e;
  const r = e.filter((i) => {
    const f = o.get(i);
    return f ? Or(f, s) : !1;
  });
  if (r.length > 0) return r;
  const a = t && e.includes(t) ? t : e[e.length - 1];
  return a ? [a] : [];
}, Ve = (e, t, o = {}, s = e.source) => {
  const r = t.filter((f) => {
    var d;
    return ((d = o[f.i]) == null ? void 0 : d.visible) !== !1;
  }), a = new Map(r.map((f) => [f.i, f])), i = Lr(
    e.selectedIds.filter((f) => a.has(f)),
    e.activeId,
    a,
    o
  );
  return Dr({
    ...e,
    selectedIds: i,
    source: s
  });
}, Hr = (e, t, o = "api") => Ge(t, o), Co = (e = "api") => Ge([], e), Ms = (e, t, o) => {
  const s = o.source || "api";
  if (o.ids) return Hr(t, o.ids, s);
  if (!o.id) return Co(s);
  const r = Tr(e);
  if (!r.includes(o.id)) return t;
  if (o.range && t.anchorId) {
    const a = r.indexOf(t.anchorId), i = r.indexOf(o.id);
    if (a >= 0 && i >= 0) {
      const f = Math.min(a, i), d = Math.max(a, i);
      return Ge(r.slice(f, d + 1), s);
    }
  }
  if (o.toggle) {
    const a = new Set(t.selectedIds);
    return a.has(o.id) ? a.delete(o.id) : a.add(o.id), Ge(Array.from(a), s);
  }
  return Ge([o.id], s);
}, Ss = (e, t, o = {}) => {
  const s = new Set(t), r = e.filter((a) => {
    var i;
    return !s.has(a.i) && ((i = o[a.i]) == null ? void 0 : i.visible) !== !1;
  });
  return r.length > 0 ? r[0].i : null;
}, ta = (e, t, o, s) => {
  const r = s || $i(e, t), a = new Set(o.selectedIds);
  return e.map((i) => {
    var c;
    const f = r[i.i], d = ["select", "copy"];
    return f != null && f.draggable && d.push("move"), f != null && f.resizable && d.push("resize"), f != null && f.deletable && d.push("delete"), f != null && f.duplicatable && d.push("duplicate"), f != null && f.locked ? d.push("unlock") : d.push("lock"), (f == null ? void 0 : f.visible) === !1 ? d.push("show") : d.push("hide"), {
      id: i.i,
      label: ((c = t[i.i]) == null ? void 0 : c.label) || i.i,
      position: { x: i.x, y: i.y, w: i.w, h: i.h },
      locked: !!(f != null && f.locked),
      selected: a.has(i.i),
      commands: d
    };
  });
}, Fr = 100, jr = 650, wt = (e) => e.kind === "layout" ? {
  ...e,
  layout: de(e.layout),
  editorMetaById: Cs(e.editorMetaById),
  sectionRows: Rs(e.sectionRows),
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
} : {
  ...e,
  layouts: io(e.layouts),
  editorMetaById: Cs(e.editorMetaById),
  sectionRows: Rs(e.sectionRows),
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
}, Cs = (e) => Object.keys(e || {}).reduce((t, o) => {
  const s = e[o];
  return t[o] = {
    ...s,
    resizeHandles: s.resizeHandles ? s.resizeHandles.slice() : void 0,
    data: s.data ? { ...s.data } : void 0
  }, t;
}, {}), Rs = (e) => ({
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
}), Lt = (e) => ({
  ...e,
  before: wt(e.before),
  after: wt(e.after),
  targetIds: e.targetIds ? e.targetIds.slice() : void 0,
  affectedIds: e.affectedIds ? e.affectedIds.slice() : void 0
}), Nr = (e = {}) => {
  const t = Math.max(1, Math.floor(e.maxSize || Fr)), o = e.mergeWindowMs || jr, s = Ee(!1), r = Ee(!1);
  let a = [], i = [];
  const f = () => {
    s.value = a.length > 0, r.value = i.length > 0;
  }, d = () => {
    const u = a.length - t;
    u > 0 && (a = a.slice(u));
  }, c = (u, p) => {
    if (!u || !u.mergeKey || u.mergeKey !== p.mergeKey) return !1;
    const m = Date.parse(u.createdAt), v = Date.parse(p.createdAt);
    return Number.isFinite(m) && Number.isFinite(v) && v - m <= o;
  }, y = (u, p = {}) => {
    if (Ke(u.before, u.after)) return;
    const m = {
      ...Lt(u)
    }, v = a[a.length - 1];
    c(v, m) ? a[a.length - 1] = {
      ...v,
      after: wt(m.after),
      createdAt: m.createdAt
    } : a.push(m), p.preserveRedoStack || (i = []), d(), f();
  };
  return {
    canUndo: s,
    canRedo: r,
    push(u, p = {}) {
      y(u, p);
    },
    undo() {
      const u = a.pop();
      return u ? (i.unshift(u), f(), u) : null;
    },
    redo() {
      const u = i.shift();
      return u ? (a.push(u), d(), f(), u) : null;
    },
    replacePresent(u, p = {}) {
      p.preserveRedoStack || (i = []), f();
    },
    clear() {
      a = [], i = [], f();
    },
    mark(u, p) {
      return {
        id: `editor-history-mark:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        snapshot: wt(u),
        revision: p
      };
    },
    bailToMark(u) {
      return f(), wt(u.snapshot);
    },
    squashToMark(u, p, m = {}) {
      const v = {
        ...p,
        before: wt(u.snapshot),
        after: wt(p.after)
      };
      y(v, m);
    },
    checkpoint() {
      return {
        id: `editor-history-checkpoint:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        kind: "grid-editor-history-checkpoint",
        past: a.map(Lt),
        future: i.map(Lt),
        canUndo: s.value,
        canRedo: r.value
      };
    },
    restore(u) {
      a = u.past.map(Lt), i = u.future.map(Lt), f();
    }
  };
}, Kr = (e) => ({
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
class ut extends Error {
  constructor(t, o, s) {
    super(o), this.name = "GridEditorClipboardError", this.code = t, this.cause = s;
  }
}
const jt = (e) => typeof e == "number" && Number.isFinite(e), Ro = (e) => jt(e) && e > 0 ? Math.floor(e) : void 0, bo = (e) => typeof e == "string" && e.length > 0 ? e : void 0, Eo = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Ws = (e) => e.reduce((t, o) => (t[o.i] = Eo(o), t), {}), Do = (e) => {
  if (!e || typeof e != "object") return;
  const t = e, o = {}, s = Ro(t.cols);
  s && (o.cols = s);
  const r = bo(t.breakpoint);
  r && (o.breakpoint = r);
  const a = bo(t.layoutId);
  a && (o.layoutId = a);
  const i = bo(t.viewFormat);
  return i && (o.viewFormat = i), Object.keys(o).length > 0 ? o : void 0;
}, To = (e, t) => {
  const o = Ws(t);
  if (!e || typeof e != "object") return o;
  const s = {};
  return Object.keys(e).forEach((r) => {
    const a = e[r];
    if (!a || typeof a != "object") return;
    const i = a;
    !jt(i.x) || !jt(i.y) || !jt(i.w) || !jt(i.h) || (s[r] = {
      x: i.x,
      y: i.y,
      w: i.w,
      h: i.h
    });
  }), {
    ...o,
    ...s
  };
}, qs = (e, t) => To(e, t), Po = (e) => {
  const t = de(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt,
    items: t,
    editorMetaById: Me(e.editorMetaById)
  };
  return e.version === 2 ? {
    version: 2,
    ...o,
    source: Do(e.source),
    originalGeometryById: qs(e.originalGeometryById, t)
  } : {
    version: 1,
    ...o
  };
};
let Zt = null;
const bt = {
  read() {
    return Zt ? Po(Zt) : null;
  },
  write(e) {
    Zt = Po(e);
  },
  clear() {
    Zt = null;
  }
}, Es = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = e.name;
  return t === "NotAllowedError" || t === "SecurityError";
}, Xr = (e) => {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.version !== 1 && t.version !== 2 || typeof t.sourceId != "string" || typeof t.copiedAt != "string" || !Array.isArray(t.items)) return null;
  const o = de(t.items), s = Me(t.editorMetaById);
  return t.version === 2 ? {
    version: 2,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s,
    source: Do(t.source),
    originalGeometryById: To(t.originalGeometryById, o)
  } : {
    version: 1,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s
  };
}, Yr = () => ({
  async read() {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.readText != "function")
      throw new ut(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      const e = await navigator.clipboard.readText();
      if (!e) return null;
      const t = JSON.parse(e), o = Xr(t);
      if (!o)
        throw new ut(
          "clipboard-invalid",
          "Clipboard does not contain a grid editor payload."
        );
      return o;
    } catch (e) {
      throw e instanceof ut ? e : new ut(
        Es(e) ? "clipboard-permission" : "clipboard-invalid",
        "Failed to read grid editor payload from system clipboard.",
        e
      );
    }
  },
  async write(e) {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText != "function")
      throw new ut(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      await navigator.clipboard.writeText(JSON.stringify(Po(e)));
    } catch (t) {
      throw new ut(
        Es(t) ? "clipboard-permission" : "clipboard-unavailable",
        "Failed to write grid editor payload to system clipboard.",
        t
      );
    }
  }
}), _r = (e) => {
  const t = de(e.items), o = {
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
    source: Do(e.source),
    originalGeometryById: qs(e.originalGeometryById, t)
  };
}, Io = (e, t = {}) => {
  var f, d, c, y, u, p;
  const o = Ro(t.cols), s = "version" in e && e.version === 2 ? Ro((f = e.source) == null ? void 0 : f.cols) : void 0;
  if (!o || !s || t.scale === !1 || o === s)
    return {
      items: de(e.items),
      scaled: !1,
      sourceCols: s,
      targetCols: o
    };
  const r = o / s, a = "version" in e && e.version === 2 ? To(e.originalGeometryById, e.items) : Ws(e.items), i = e.items.reduce((m, v) => {
    const C = a[v.i] || Eo(v);
    return Math.min(m, C.x);
  }, (p = (u = (c = a[(d = e.items[0]) == null ? void 0 : d.i]) == null ? void 0 : c.x) != null ? u : (y = e.items[0]) == null ? void 0 : y.x) != null ? p : 0);
  return {
    items: e.items.map((m) => {
      const v = a[m.i] || Eo(m), C = Math.max(1, Math.min(o, Math.round(v.w * r))), S = Math.max(
        0,
        Math.min(
          Math.max(0, o - C),
          Math.floor((v.x - i) * r)
        )
      );
      return {
        ...m,
        x: S,
        y: Math.max(0, Math.floor(v.y)),
        w: C,
        h: Math.max(1, Math.floor(v.h))
      };
    }),
    scaled: !0,
    sourceCols: s,
    targetCols: o
  };
}, he = (e, t) => ({
  type: e,
  labelKey: t.labelKey || `grid-editor.command.${e}`,
  ...t
}), $e = { mode: "record" }, It = {
  mode: "ignore",
  preserveRedoStack: !0
}, Jt = (e) => !e.payload || typeof e.payload != "object" ? { ok: !1, message: `${e.type} requires an object payload.` } : { ok: !0 }, Vs = [
  he("select", {
    defaultSource: "api",
    defaultHistory: It,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  he("clearSelection", {
    defaultSource: "api",
    defaultHistory: It,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  he("move", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Jt
  }),
  he("resize", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Jt
  }),
  he("add", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  he("delete", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  he("duplicate", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  he("copy", {
    defaultSource: "api",
    defaultHistory: It,
    affects: {},
    mutualExclusionScope: "selection"
  }),
  he("paste", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  he("align", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Jt
  }),
  he("distribute", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Jt
  }),
  he("tidy", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout"
  }),
  he("lock", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  he("unlock", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  he("show", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  he("hide", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  he("save", {
    defaultSource: "toolbar",
    defaultHistory: It,
    affects: { persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence",
    shortcuts: ["Mod+S"]
  }),
  he("discard", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "replace" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  he("reset", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "clear" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  he("undo", {
    defaultSource: "keyboard",
    defaultHistory: It,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Z"]
  }),
  he("redo", {
    defaultSource: "keyboard",
    defaultHistory: It,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Shift+Z"]
  }),
  he("section-row-collapse", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  he("section-row-expand", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  he("section-row-move", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  he("section-row-delete", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  he("section-row-reorder", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  })
], Ur = new Map(
  Vs.map((e) => [e.type, e])
), Zs = (e) => Ur.get(e), oa = () => Vs.slice(), ro = (e) => {
  const t = Zs(e);
  return t || he(e, {
    defaultSource: "api",
    defaultHistory: It,
    affects: {},
    mutualExclusionScope: "global"
  });
}, Wr = (e) => {
  const t = /* @__PURE__ */ new Map(), o = e.now || (() => {
    const a = typeof performance != "undefined" ? performance : null;
    return a && typeof a.now == "function" ? a.now() : Date.now();
  });
  return {
    execute: async (a) => {
      var L, w, R, T, M, O, G, z, q;
      const i = ro(a.type), f = {
        source: i.defaultSource,
        ...a,
        history: a.history || i.defaultHistory
      }, d = Ks(f), c = Ft(
        d.history,
        i.defaultHistory.mode || oo(d.type)
      );
      d.history = c;
      const y = d.source || i.defaultSource || "api";
      d.source = y;
      const u = i.mutualExclusionScope || "global", p = o(), m = t.get(u);
      if (m && !m.signal.aborted) {
        const E = so(d, "command-pending", {
          targetIds: d.targetIds,
          blocked: {
            reason: "command-pending",
            itemIds: d.targetIds,
            message: `Command scope ${u} is waiting for beforeCommand.`
          },
          diagnostics: {
            durationMs: 0,
            pendingScope: u,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, E, p);
      }
      (L = e.onStart) == null || L.call(e, d);
      const v = e.getSnapshot(), C = e.getStateRevision(), S = e.check(d);
      if (!S.ok && S.result)
        return S.result.diagnostics = {
          durationMs: ((w = S.result.diagnostics) == null ? void 0 : w.durationMs) || 0,
          ...S.result.diagnostics,
          stateRevision: C,
          historyMode: c.mode,
          source: y,
          origin: d.origin
        }, e.finalize(d, S.result, p);
      const k = (R = i.validatePayload) == null ? void 0 : R.call(i, d);
      if (k && !k.ok) {
        const E = so(d, "invalid-input", {
          targetIds: S.targetIds,
          blocked: {
            reason: "invalid-input",
            itemIds: S.targetIds,
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
        return e.finalize(d, E, p);
      }
      const F = ((T = e.buildPreview) == null ? void 0 : T.call(e, d, S, v)) || {
        layoutPatches: [],
        metadataPatches: [],
        affectedIds: [],
        beforeSummary: {},
        afterSummary: {}
      }, K = new AbortController();
      t.set(u, K);
      const A = await Gi(
        e.beforeCommand,
        d,
        e.getGuardContext(d, S, F, K.signal),
        e.guardTimeoutMs
      );
      if (t.delete(u), (M = e.isStopped) != null && M.call(e) || K.signal.aborted) {
        (O = e.cleanupInteraction) == null || O.call(e, "guard-aborted");
        const E = Ie(d, "cancelled", {
          targetIds: S.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: S.targetIds,
            message: "Command guard was aborted."
          },
          diagnostics: {
            durationMs: 0,
            guardMs: A.guardMs,
            pendingScope: u,
            stateRevision: e.getStateRevision(),
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, E, p, A.guardMs);
      }
      if (A.result)
        return (G = e.cleanupInteraction) == null || G.call(e, A.result.status), A.result.diagnostics = {
          durationMs: ((z = A.result.diagnostics) == null ? void 0 : z.durationMs) || 0,
          ...A.result.diagnostics,
          pendingScope: u,
          stateRevision: e.getStateRevision(),
          historyMode: c.mode,
          source: y,
          origin: d.origin
        }, e.finalize(d, A.result, p, A.guardMs);
      const ae = e.getStateRevision();
      if (ae !== C) {
        (q = e.cleanupInteraction) == null || q.call(e, "stale-command");
        const E = so(d, "stale-command", {
          targetIds: S.targetIds,
          blocked: {
            reason: "stale-command",
            itemIds: S.targetIds,
            message: "Command state changed while beforeCommand was pending."
          },
          diagnostics: {
            durationMs: 0,
            guardMs: A.guardMs,
            pendingScope: u,
            stateRevision: ae,
            stale: !0,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, E, p, A.guardMs);
      }
      return e.commit({
        command: d,
        check: S,
        before: v,
        preview: F,
        startedAt: p,
        guardMs: A.guardMs
      });
    },
    abortPending: (a = "command-kernel-abort") => {
      t.forEach((i) => i.abort(a)), t.clear();
    }
  };
}, Et = (e, t, o, s) => ({
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
}), co = (e, t, o = (/* @__PURE__ */ new Date()).toISOString()) => {
  const s = typeof t == "string" ? void 0 : t, r = typeof t == "string" ? t : o, a = s ? He(s) : null;
  return {
    version: s ? 2 : 1,
    editorMetaById: Me(e),
    sectionRows: a ? {
      version: 1,
      items: a.items,
      itemMembership: a.itemMembership
    } : void 0,
    updatedAt: r
  };
}, no = (e) => {
  var a, i;
  const t = (a = e == null ? void 0 : e.meta) == null ? void 0 : a.editor;
  if (t == null)
    return {
      ok: !0,
      envelope: co({})
    };
  if (!t || typeof t != "object")
    return { ok: !1, error: "meta.editor must be an object." };
  const o = t;
  if (o.version !== 1 && o.version !== 2)
    return {
      ok: !0,
      envelope: co({})
    };
  const s = zi(o.editorMetaById);
  if (!s.ok)
    return {
      ok: !1,
      error: ((i = s.errors[0]) == null ? void 0 : i.message) || "Invalid editor metadata."
    };
  const r = o.version === 2 && o.sectionRows ? He(
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
      } : Xs(),
      updatedAt: typeof o.updatedAt == "string" ? o.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, qr = (e) => {
  const t = () => ({ ...(typeof e.baseMeta == "function" ? e.baseMeta() : e.baseMeta) || {} }), o = (s, r) => {
    var i, f, d;
    const a = no(s);
    if (!a.ok || !a.envelope) {
      (i = e.onError) == null || i.call(
        e,
        "editor-metadata-invalid",
        a.error || "Invalid editor persistence metadata.",
        s
      );
      return;
    }
    (f = e.setEditorMetaById) == null || f.call(e, a.envelope.editorMetaById, r), a.envelope.sectionRows && ((d = e.setSectionRows) == null || d.call(
      e,
      He(
        a.envelope.sectionRows,
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
        editor: co(
          e.getEditorMetaById(),
          (s = e.getSectionRows) == null ? void 0 : s.call(e)
        )
      };
    },
    onPersistenceEvent(s) {
      var r, a, i, f, d, c, y;
      if ((s.type === "load-success" || s.type === "external-apply") && o(s.document, s.type), s.type === "save-success" && o(s.document, "save-success"), s.type === "conflict") {
        const u = no(s.conflict.localDocument), p = no(s.conflict.externalDocument);
        (i = e.onConflict) == null || i.call(e, {
          key: s.key,
          reason: s.conflict.reason,
          localValue: s.conflict.localValue,
          externalValue: s.conflict.externalValue,
          localEditorMetaById: (r = u.envelope) == null ? void 0 : r.editorMetaById,
          externalEditorMetaById: (a = p.envelope) == null ? void 0 : a.editorMetaById,
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
        return Et("editor-save", "save", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: !0
        });
      const s = await e.persistence.save();
      return Et("editor-save", "save", s.ok ? "changed" : "error", s.error);
    },
    discard() {
      return e.persistence ? (e.persistence.discard(), Et("editor-discard", "discard", "changed")) : Et("editor-discard", "discard", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    },
    reset() {
      return e.persistence ? (e.persistence.reset(), Et("editor-reset", "reset", "changed")) : Et("editor-reset", "reset", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    }
  };
}, fo = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Kt = (e) => typeof e == "number" && Number.isFinite(e), Js = (e) => e === "left" || e === "center-x" || e === "right" ? "x" : "y", Vr = (e) => e === "horizontal" || e === "spacing-x" ? "x" : "y", lo = (e) => de(e), Zr = (e) => Array.from(new Set(e.flatMap((t) => t.type === "add" ? [t.item.i] : t.type === "compact" ? t.affectedIds : [t.id]))), Qs = (e, t) => {
  var s, r;
  const o = (s = t.targetIds) != null && s.length ? t.targetIds : (r = t.selectedIds) != null && r.length ? t.selectedIds : e.map((a) => a.i);
  return Array.from(new Set(o.filter(Boolean)));
}, kt = (e, t, o, s, r, a, i) => ({
  status: "blocked",
  layout: lo(t),
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
    durationMs: fo() - e,
    computed: a,
    messages: [{
      code: `grid-editor.geometry.${o}`,
      level: o === "invalid-input" ? "error" : "warning",
      message: r,
      itemIds: s,
      recoverable: !0
    }]
  }
}), ei = (e, t) => {
  const o = [], s = [];
  return t.forEach((r) => {
    const a = Pe(e, r);
    a ? o.push(a) : s.push(r);
  }), { items: o, missingIds: s };
}, Bo = (e, t, o) => {
  const s = Kt(o.cols) ? o.cols : 12, r = Kt(o.maxRows) ? o.maxRows : 1 / 0;
  for (let a = 0; a < t.length; a++) {
    const i = Pe(e, t[a]);
    if (i) {
      if (i.x < 0 || i.y < 0 || i.x + i.w > s)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(r) && i.y + i.h > r)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (o.allowOverlap !== !0) {
        const f = $t(e, i).filter((d) => d.i !== i.i);
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
}, Jr = (e, t) => t === "right" ? e.x + e.w : t === "center-x" ? e.x + e.w / 2 : t === "bottom" ? e.y + e.h : t === "center-y" ? e.y + e.h / 2 : t === "top" ? e.y : e.x, Ps = (e) => {
  const t = Math.min(...e.map((a) => a.x)), o = Math.max(...e.map((a) => a.x + a.w)), s = Math.min(...e.map((a) => a.y)), r = Math.max(...e.map((a) => a.y + a.h));
  return {
    left: t,
    right: o,
    top: s,
    bottom: r,
    centerX: t + (o - t) / 2,
    centerY: s + (r - s) / 2
  };
}, Qr = (e, t, o, s) => {
  var f;
  const r = t.mode, a = t.target || { type: "selection-bounds" };
  if (a.type === "explicit-line" && a.axis === Js(r))
    return { position: a.position, source: "explicit" };
  if (a.type === "active-item" || a.type === "last-selected") {
    const d = s.selectedIds || s.targetIds || o.map((u) => u.i), c = a.type === "active-item" ? a.id || s.activeId || d[0] : d[d.length - 1], y = o.find((u) => u.i === c) || o[0];
    return { position: Jr(y, r), source: a.type };
  }
  if (a.type === "section-row") {
    const c = (f = He(s.sectionRows, e).items[a.id]) == null ? void 0 : f.bounds, y = a.bounds || c;
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
    const u = Ps(o);
    return r === "right" ? { position: u.right, source: "section-row" } : r === "center-x" ? { position: u.centerX, source: "section-row" } : r === "bottom" ? { position: u.bottom, source: "section-row" } : r === "center-y" ? { position: u.centerY, source: "section-row" } : r === "top" ? { position: u.top, source: "section-row" } : { position: u.left, source: "section-row" };
  }
  const i = Ps(o);
  return r === "right" ? { position: i.right, source: "selection" } : r === "center-x" ? { position: i.centerX, source: "selection" } : r === "bottom" ? { position: i.bottom, source: "selection" } : r === "center-y" ? { position: i.centerY, source: "selection" } : r === "top" ? { position: i.top, source: "selection" } : { position: i.left, source: "selection" };
}, en = (e, t, o) => t === "right" ? { ...e, x: Math.round(o - e.w) } : t === "center-x" ? { ...e, x: Math.round(o - e.w / 2) } : t === "top" ? { ...e, y: Math.round(o) } : t === "bottom" ? { ...e, y: Math.round(o - e.h) } : t === "center-y" ? { ...e, y: Math.round(o - e.h / 2) } : { ...e, x: Math.round(o) }, ti = (e, t) => e.slice().sort(
  (o, s) => t === "x" ? o.x - s.x || o.i.localeCompare(s.i) : o.y - s.y || o.i.localeCompare(s.i)
), tn = (e, t, o) => {
  const s = [];
  for (let r = 1; r < e.length; r++) {
    const a = e[r - 1], i = e[r];
    s.push(o === "center-to-center" ? t === "x" ? i.x + i.w / 2 - (a.x + a.w / 2) : i.y + i.h / 2 - (a.y + a.h / 2) : t === "x" ? i.x - (a.x + a.w) : i.y - (a.y + a.h));
  }
  return s;
}, on = (e) => e.length === 0 ? 0 : e.reduce((t, o) => t + o, 0) / e.length, sn = (e, t, o, s) => {
  const r = Math.max(0, e.findIndex((y) => y.i === s)), a = e[r], i = Math.max(0, on(tn(e, t, o))), f = /* @__PURE__ */ new Map([[a.i, a]]);
  if (o === "center-to-center") {
    const y = t === "x" ? a.x + a.w / 2 : a.y + a.h / 2;
    for (let u = r - 1; u >= 0; u--) {
      const p = e[u], m = y - i * (r - u);
      f.set(p.i, t === "x" ? { ...p, x: Math.round(m - p.w / 2) } : { ...p, y: Math.round(m - p.h / 2) });
    }
    for (let u = r + 1; u < e.length; u++) {
      const p = e[u], m = y + i * (u - r);
      f.set(p.i, t === "x" ? { ...p, x: Math.round(m - p.w / 2) } : { ...p, y: Math.round(m - p.h / 2) });
    }
    return { items: e.map((u) => f.get(u.i) || u), spacing: i };
  }
  let d = t === "x" ? a.x : a.y;
  for (let y = r - 1; y >= 0; y--) {
    const u = e[y], p = t === "x" ? u.w : u.h, m = d - i - p;
    f.set(u.i, t === "x" ? { ...u, x: Math.round(m) } : { ...u, y: Math.round(m) }), d = m;
  }
  let c = t === "x" ? a.x + a.w : a.y + a.h;
  for (let y = r + 1; y < e.length; y++) {
    const u = e[y];
    f.set(u.i, t === "x" ? { ...u, x: Math.round(c + i) } : { ...u, y: Math.round(c + i) }), c = c + i + (t === "x" ? u.w : u.h);
  }
  return { items: e.map((y) => f.get(y.i) || y), spacing: i };
}, rn = (e, t, o, s) => {
  const r = Vr(o.mode), a = o.strategy || "edge-to-edge", i = ti(t, r);
  if (i.length < 3) return null;
  const f = He(s.sectionRows, e), d = i.reduce((F, K) => {
    const A = f.itemMembership[K.i] || {};
    return F === null ? { ...A } : {
      sectionId: F.sectionId && F.sectionId === A.sectionId ? F.sectionId : void 0,
      rowId: F.rowId && F.rowId === A.rowId ? F.rowId : void 0
    };
  }, null), c = o.sectionRowId || (o.bounds === "section-row" ? (d == null ? void 0 : d.rowId) || (d == null ? void 0 : d.sectionId) : void 0), y = c ? f.items[c] : void 0;
  if (o.bounds === "active-item") {
    const F = sn(i, r, a, s.activeId);
    return {
      axis: r,
      spacing: F.spacing,
      sectionId: d == null ? void 0 : d.sectionId,
      rowId: d == null ? void 0 : d.rowId,
      items: F.items
    };
  }
  const u = y != null && y.bounds ? r === "x" ? { start: y.bounds.x, end: y.bounds.x + y.bounds.w } : { start: y.bounds.y, end: y.bounds.y + y.bounds.h } : null, p = o.bounds === "explicit" && o.explicitBounds ? o.explicitBounds : null, m = p ? p.start : u ? u.start : r === "x" ? i[0].x : i[0].y, v = p ? p.end : u ? u.end : r === "x" ? i[i.length - 1].x + i[i.length - 1].w : i[i.length - 1].y + i[i.length - 1].h;
  if (a === "center-to-center") {
    const F = !!(p || u), K = F ? m + (r === "x" ? i[0].w : i[0].h) / 2 : r === "x" ? i[0].x + i[0].w / 2 : i[0].y + i[0].h / 2, ae = ((F ? v - (r === "x" ? i[i.length - 1].w : i[i.length - 1].h) / 2 : r === "x" ? i[i.length - 1].x + i[i.length - 1].w / 2 : i[i.length - 1].y + i[i.length - 1].h / 2) - K) / (i.length - 1);
    return {
      axis: r,
      spacing: ae,
      sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
      rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
      items: i.map((L, w) => {
        if (w === 0 || w === i.length - 1) return L;
        const R = K + ae * w;
        return r === "x" ? { ...L, x: Math.round(R - L.w / 2) } : { ...L, y: Math.round(R - L.h / 2) };
      })
    };
  }
  const C = i.reduce(
    (F, K) => F + (r === "x" ? K.w : K.h),
    0
  ), S = (v - m - C) / (i.length - 1);
  if (!Number.isFinite(S) || S < 0) return null;
  let k = m;
  return {
    axis: r,
    spacing: S,
    sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
    rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
    items: i.map((F) => {
      const K = r === "x" ? { ...F, x: Math.round(k) } : { ...F, y: Math.round(k) };
      return k += (r === "x" ? F.w : F.h) + S, K;
    })
  };
}, nn = (e, t, o, s) => {
  const r = o === "x" ? "y" : "x", a = He(s.sectionRows, e), i = (c) => {
    const y = a.itemMembership[c.i] || {};
    return `${y.sectionId || ""}:${y.rowId || ""}`;
  }, f = t.slice().sort(
    (c, y) => r === "y" ? c.y - y.y || c.x - y.x || c.i.localeCompare(y.i) : c.x - y.x || c.y - y.y || c.i.localeCompare(y.i)
  ), d = [];
  return f.forEach((c) => {
    const y = r === "y" ? c.y : c.x, u = y + (r === "y" ? c.h : c.w), p = d.find((m) => m.some((v) => {
      if (i(v) !== i(c)) return !1;
      const C = r === "y" ? v.y : v.x, S = C + (r === "y" ? v.h : v.w);
      return Math.min(u, S) > Math.max(y, C);
    }));
    p ? p.push(c) : d.push([c]);
  }), d;
}, Bs = (e, t, o, s) => {
  const r = Kt(o.minSpacing) ? Math.max(0, o.minSpacing) : 1, a = o.axis === "both" ? ["x", "y"] : [o.axis === "y" ? "y" : "x"];
  let i = t.slice();
  return a.forEach((f) => {
    const d = nn(e, i, f, s), c = /* @__PURE__ */ new Map();
    d.forEach((y) => {
      const u = ti(y, f);
      if (u.length < 2) {
        u.forEach((m) => c.set(m.i, m));
        return;
      }
      let p = f === "x" ? u[0].x : u[0].y;
      u.forEach((m, v) => {
        if (v === 0) {
          c.set(m.i, m), p += (f === "x" ? m.w : m.h) + r;
          return;
        }
        const C = f === "x" ? { ...m, x: Math.round(p) } : { ...m, y: Math.round(p) };
        c.set(m.i, C), p += (f === "x" ? m.w : m.h) + r;
      });
    }), i = i.map((y) => c.get(y.i) || y);
  }), {
    axis: a[a.length - 1],
    spacing: r,
    items: i
  };
}, oi = (e, t, o) => Ao({
  layout: e,
  activeItem: t.find((s) => s.i === o.activeId) || t[0],
  candidateItem: t.find((s) => s.i === o.activeId) || t[0],
  selectionIds: t.map((s) => s.i),
  metaById: o.metaById,
  sectionRows: o.sectionRows,
  cols: Kt(o.cols) ? o.cols : 12,
  maxRows: o.maxRows,
  compactType: o.compactType,
  allowOverlap: o.allowOverlap,
  preventCollision: o.preventCollision,
  interaction: "toolbar",
  options: {
    cols: Kt(o.cols) ? o.cols : 12,
    maxRows: o.maxRows,
    allowCrossSectionRow: !1
  }
}), si = (e, t, o, s, r) => {
  const a = Nt(t, o), i = Zr(a);
  return {
    status: i.length > 0 ? "changed" : "noop",
    layout: o,
    layoutPatches: a,
    affectedIds: i,
    skippedIds: r,
    diagnostics: {
      ...s,
      durationMs: fo() - e
    }
  };
}, $s = (e, t, o = {}) => {
  const s = fo(), r = Qs(e, o), { items: a, missingIds: i } = ei(e, r);
  if (i.length > 0)
    return kt(s, e, "missing-item", i, "Align command referenced missing layout items.", void 0, o.skippedIds);
  if (a.length < 2)
    return kt(s, e, "selection-count", r, "Align requires at least 2 items.", void 0, o.skippedIds);
  const f = Qr(e, t, a, o), d = lo(e).map(
    (p) => r.includes(p.i) ? en(p, t.mode, f.position) : p
  ), c = Bo(d, r, o), y = oi(e, a, o), u = {
    targetLine: {
      axis: Js(t.mode),
      position: f.position,
      mode: t.mode
    },
    affectedIds: r,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      source: f.source === "section-row" ? "metadata" : "none"
    }
  };
  return c.ok ? si(s, e, d, {
    durationMs: 0,
    intelligence: y.diagnostics,
    computed: u
  }, o.skippedIds) : kt(
    s,
    e,
    c.reason,
    c.itemIds,
    `Align command blocked by ${c.reason}.`,
    u,
    o.skippedIds
  );
}, ii = (e, t, o, s) => {
  const r = fo(), a = Qs(e, o), { items: i, missingIds: f } = ei(e, a);
  if (f.length > 0)
    return kt(r, e, "missing-item", f, `${s} command referenced missing layout items.`, void 0, o.skippedIds);
  if (i.length < 3)
    return kt(r, e, "selection-count", a, `${s} requires at least 3 items.`, void 0, o.skippedIds);
  let d = s === "distribute" ? rn(e, i, t, o) : Bs(e, i, t, o);
  const c = oi(e, i, o);
  if (!d)
    return kt(r, e, "invalid-input", a, "Spacing command could not compute a valid spacing result.", {
      affectedIds: a,
      skippedIds: o.skippedIds
    }, o.skippedIds);
  let y = !1, u = new Map(d.items.map((k) => [k.i, k])), p = lo(e).map((k) => u.get(k.i) || k), m = Bo(p, a, o);
  if (!m.ok) {
    const k = Bs(e, i, {
      axis: d.axis,
      minSpacing: 0,
      strategy: t.strategy
    }, o);
    k && (y = !0, d = k, u = new Map(d.items.map((F) => [F.i, F])), p = lo(e).map((F) => u.get(F.i) || F), m = Bo(p, a, o));
  }
  const v = t, C = t, S = {
    targetSpacing: {
      axis: d.axis,
      value: d.spacing,
      mode: s === "distribute" ? v.mode : d.axis === "x" ? "spacing-x" : "spacing-y",
      strategy: s === "distribute" ? v.strategy || "edge-to-edge" : C.strategy || "edge-to-edge"
    },
    affectedIds: a,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      sectionId: d.sectionId,
      rowId: d.rowId,
      source: d.sectionId || d.rowId ? "metadata" : "none"
    },
    fallback: y ? "tidy-min-spacing" : void 0
  };
  return m.ok ? si(r, e, p, {
    durationMs: 0,
    intelligence: c.diagnostics,
    computed: S
  }, o.skippedIds) : kt(
    r,
    e,
    m.reason,
    m.itemIds,
    `Spacing command blocked by ${m.reason}.`,
    S,
    o.skippedIds
  );
}, Gs = (e, t, o = {}) => ii(e, t, o, "distribute"), zs = (e, t, o = {}) => ii(e, t, o, "tidy"), De = (e) => typeof e == "number" && Number.isFinite(e), an = (e) => De(e) && e > 0 ? Math.floor(e) : 12, cn = (e) => De(e) && e > 0 ? Math.floor(e) : 1 / 0, dn = (e) => e === "vertical" || e === "horizontal" || e === null ? e : "vertical", ln = (e) => e === "layout" ? "layout" : "block", As = (e) => e === !0, ot = (e) => ({
  id: e.i,
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Oo = (e) => ({
  ...e,
  x: De(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: De(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: De(e.w) ? Math.floor(e.w) : 1,
  h: De(e.h) ? Math.floor(e.h) : 1
}), Xe = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), Xt = (e, t, o, s, r = {}) => {
  for (const a of t) {
    const i = e.find((f) => f.i === a);
    if (i) {
      if (i.w <= 0 || i.h <= 0 || i.x < 0 || i.y < 0 || i.x + i.w > o)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(s) && i.y + i.h > s)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (!r.allowOverlap) {
        const f = $t(e, i).filter((d) => d.i !== i.i);
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
}, Lo = (e, t, o) => e.w <= 0 || e.h <= 0 || e.w > t ? "bounds" : Number.isFinite(o) && e.h > o ? "maxRows" : null, Yt = (e, t, o) => Math.max(t, Math.min(e, o)), ri = (e) => e.reduce((t, o) => Math.max(t, o.y + o.h), 0), un = (e, t, o, s, r, a) => {
  if (!De(o) || !De(s)) return null;
  const i = {
    x: Math.floor(o),
    y: Math.floor(s)
  }, f = Yt(i.x, 0, Math.max(0, r - t.w)), d = Math.max(0, i.y), c = Number.isFinite(a) ? Math.floor(a) - t.h : Math.max(ri(e), d);
  if (c < d) return null;
  for (let y = d; y <= c; y++) {
    const u = { ...t, x: f, y };
    if (Xt([...e, u], [u.i], r, a).ok)
      return {
        x: f,
        y,
        target: i,
        clamped: f !== i.x,
        shiftedDown: y !== d
      };
  }
  return null;
}, fn = (e) => {
  for (const t of e)
    t.moved && (t.moved = !1);
  return e;
}, Ds = (e, t, o) => {
  const s = new Set(o), r = new Map(t.map((a) => [a.i, a]));
  return e.filter((a) => {
    if (s.has(a.i)) return !1;
    const i = r.get(a.i);
    return !!(i && (a.x !== i.x || a.y !== i.y || a.w !== i.w || a.h !== i.h));
  }).map((a) => a.i);
}, yn = (e, t, o, s, r, a, i) => {
  var A, ae;
  const f = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (o !== "cursor" || f !== "top-left") return null;
  const d = dn(s.compactType), c = As(s.allowOverlap), y = As(s.preventCollision), u = t.map(Oo), p = u.reduce((L, w) => ({
    x: Math.min(L.x, w.x),
    y: Math.min(L.y, w.y)
  }), { x: ((A = u[0]) == null ? void 0 : A.x) || 0, y: ((ae = u[0]) == null ? void 0 : ae.y) || 0 });
  let m = de(e);
  const v = [], C = [], S = (L, w, R, T) => {
    const M = v.concat(w.filter((O) => u.some((G) => G.i === O)));
    return C.push(Xe(
      L === "collision" || L === "static-item" ? "grid-editor.placement.layout-collision-blocked" : L === "maxRows" ? "grid-editor.placement.layout-max-rows-blocked" : "grid-editor.placement.layout-bounds-blocked",
      "warning",
      R,
      { reason: L, itemIds: w, details: { collisionPolicy: "layout", compactType: d, allowOverlap: c, preventCollision: y } }
    )), {
      layout: T,
      failed: !0,
      blocked: { reason: L, itemIds: w, message: R },
      summary: {
        strategy: o,
        placementSource: o,
        collisionPolicy: "layout",
        insertedIds: M,
        shiftedIds: Ds(e, T, M),
        before: e.map(ot),
        after: T.map(ot),
        diagnostics: C
      }
    };
  }, k = De(i == null ? void 0 : i.x) ? i.x : p.x, F = De(i == null ? void 0 : i.y) ? i.y : p.y, K = u.map((L) => {
    const w = Math.floor(k + L.x - p.x), R = Math.floor(F + L.y - p.y);
    return {
      ...L,
      x: Yt(w, 0, Math.max(0, r - L.w)),
      y: Number.isFinite(a) ? Yt(R, 0, Math.max(0, Math.floor(a) - L.h)) : Math.max(0, R)
    };
  });
  if (!c) {
    const L = K.find((w) => $t(K, w).length > 0);
    if (L)
      return S(
        "collision",
        [L.i, ...$t(K, L).map((w) => w.i)],
        "Placement group contains overlapping items.",
        e
      );
  }
  for (let L = 0; L < K.length; L++) {
    const w = K[L], R = u[L], T = Lo(R, r, a);
    if (T)
      return C.push(Xe(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: T, itemIds: [R.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: T,
          itemIds: [R.i],
          message: "One or more items could not fit in the current layout."
        },
        summary: {
          strategy: o,
          placementSource: o,
          collisionPolicy: "layout",
          insertedIds: v,
          shiftedIds: [],
          before: e.map(ot),
          after: [],
          diagnostics: C
        }
      };
    const M = m.concat(w), O = Xt(
      M,
      [w.i],
      r,
      a,
      { allowOverlap: c }
    ), G = c ? [] : $t(m, w).filter((ie) => ie.i !== w.i);
    if (!O.ok && O.reason !== "collision")
      return S(
        O.reason,
        O.itemIds,
        "Placement target is outside the current grid constraints.",
        M
      );
    if (!c && G.some((ie) => ie.static)) {
      const ie = G.filter((J) => J.static).map((J) => J.i);
      return S(
        "static-item",
        [w.i, ...ie],
        "Placement target is blocked by a static item.",
        M
      );
    }
    if (y && !c && G.length > 0)
      return S(
        "collision",
        [w.i, ...G.map((ie) => ie.i)],
        "Placement target is blocked at the current cursor position.",
        M
      );
    if (c) {
      m = M, v.push(w.i);
      continue;
    }
    const z = Math.max(ri(m), w.y) + w.h + L + 1, q = {
      ...w,
      y: z,
      static: !1
    }, E = m.concat(q), me = E[E.length - 1], ze = Pi(
      E,
      me,
      d,
      r,
      c,
      w.x,
      w.y,
      !0,
      y
    ).map(
      (ie) => ie.i === w.i ? { ...ie, static: w.static === !0 } : ie
    ), W = d == null ? ze : Bi(ze, d, r, c);
    m = fn(W), v.push(w.i);
    const ve = Xt(
      m,
      m.map((ie) => ie.i),
      r,
      a,
      { allowOverlap: c }
    );
    if (!ve.ok)
      return S(
        ve.reason,
        ve.itemIds,
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
      shiftedIds: Ds(e, m, v),
      before: e.map(ot),
      after: m.map(ot),
      diagnostics: C
    }
  };
}, pn = (e, t, o, s, r, a) => {
  var v, C;
  const i = De(s.offset) ? s.offset : 1, f = s.cursor && typeof s.cursor == "object" ? s.cursor : null, d = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (ln(s.collisionPolicy) === "layout") {
    const S = yn(e, t, o, s, r, a, f);
    if (S) return S;
  }
  const c = de(e), y = [], u = [], p = t.map(Oo), m = p.reduce((S, k) => ({
    x: Math.min(S.x, k.x),
    y: Math.min(S.y, k.y)
  }), { x: ((v = p[0]) == null ? void 0 : v.x) || 0, y: ((C = p[0]) == null ? void 0 : C.y) || 0 });
  for (let S = 0; S < p.length; S++) {
    const k = p[S], F = Lo(k, r, a);
    if (F)
      return u.push(Xe(
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
          diagnostics: u
        }
      };
    let K = k.x, A = k.y;
    const ae = o === "cursor" && d === "top-left" && typeof s.placementSessionId == "string";
    if (o === "offset")
      K += i * (S + 1), A += i * (S + 1);
    else if (ae) {
      const R = De(f == null ? void 0 : f.x) ? f.x : K, T = De(f == null ? void 0 : f.y) ? f.y : A, M = k.x - m.x, O = k.y - m.y, G = Math.floor(R + M), z = Math.floor(T + O);
      K = Yt(G, 0, Math.max(0, r - k.w)), A = Number.isFinite(a) ? Yt(z, 0, Math.max(0, Math.floor(a) - k.h)) : Math.max(0, z), u.push(Xe(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: { x: G, y: z },
            placed: { x: K, y: A },
            clamped: K !== G || A !== z,
            shiftedDown: !1
          }
        }
      ));
    } else if (o === "nearest-fit" || o === "cursor") {
      const R = o === "cursor" && d === "top-left" ? un(
        c,
        k,
        De(f == null ? void 0 : f.x) ? f.x : K,
        De(f == null ? void 0 : f.y) ? f.y : A,
        r,
        a
      ) : null, T = R || Ei(
        c,
        k,
        r,
        De(f == null ? void 0 : f.x) ? f.x : K,
        De(f == null ? void 0 : f.y) ? f.y : A,
        a
      );
      T && (K = T.x, A = T.y, R && u.push(Xe(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: R.target,
            placed: { x: R.x, y: R.y },
            clamped: R.clamped,
            shiftedDown: R.shiftedDown
          }
        }
      )));
    } else {
      const R = ns(c, k, r, a);
      R && (K = R.x, A = R.y);
    }
    const L = {
      ...k,
      x: Math.max(0, Math.floor(K)),
      y: Math.max(0, Math.floor(A))
    }, w = Xt([...c, L], [L.i], r, a);
    if (!w.ok) {
      if (ae) {
        const T = (w.reason === "maxRows" || Number.isFinite(a), w.reason), M = [...c, L], O = y.concat(L.i);
        return u.push(Xe(
          T === "collision" ? "grid-editor.placement.collision-blocked" : T === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.bounds-blocked",
          "warning",
          "Placement target is blocked at the current cursor position.",
          { reason: T, itemIds: w.itemIds }
        )), {
          layout: M,
          failed: !0,
          blocked: {
            reason: T,
            itemIds: w.itemIds,
            message: "Placement target is blocked at the current cursor position."
          },
          summary: {
            strategy: o,
            placementSource: o,
            insertedIds: O,
            shiftedIds: [],
            before: [],
            after: M.filter((G) => O.includes(G.i)).map(ot),
            diagnostics: u
          }
        };
      }
      const R = ns(c, k, r, a);
      if (!R) {
        const T = w.reason === "maxRows" || Number.isFinite(a) ? "maxRows" : w.reason;
        return u.push(Xe(
          T === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.collision-unresolved",
          "warning",
          "No legal placement was available for the item.",
          { reason: T, itemIds: w.itemIds }
        )), {
          layout: e,
          failed: !0,
          blocked: {
            reason: T,
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
            diagnostics: u
          }
        };
      }
      L.x = R.x, L.y = R.y;
    }
    c.push(L), y.push(L.i);
  }
  return u.push(Xe(
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
      after: c.filter((S) => y.includes(S.i)).map(ot),
      diagnostics: u
    }
  };
}, mn = (e, t, o, s) => {
  const r = de(e), a = t.map(Oo), i = a.map((k) => k.i), f = r.map((k) => k.i), d = r.map(ot), c = [];
  if (a.length === 0)
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
  const y = Math.min(...a.map((k) => k.x)), u = Math.min(...a.map((k) => k.y)), p = a.map((k) => ({
    ...k,
    x: k.x - y,
    y: k.y - u
  })), m = Math.max(...p.map((k) => k.y + k.h));
  for (const k of p) {
    const F = Lo(k, o, s);
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
  })), C = [...p, ...v], S = Xt(C, C.map((k) => k.i), o, s);
  return S.ok ? (c.push(Xe(
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
      after: C.map(ot),
      diagnostics: c
    }
  }) : (c.push(Xe(
    S.reason === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.collision-unresolved",
    "warning",
    "Top insert shift could not produce a valid layout.",
    { reason: S.reason, itemIds: S.itemIds, details: { shiftHeight: m } }
  )), {
    layout: e,
    failed: !0,
    blocked: {
      reason: S.reason,
      itemIds: S.itemIds,
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
}, xt = (e, t, o, s = {}) => {
  const r = o === "offset" || o === "cursor" || o === "nearest-fit" || o === "first-fit" || o === "insert-top-shift" ? o : "first-fit", a = an(s.cols), i = cn(s.maxRows);
  return r === "insert-top-shift" ? mn(e, t, a, i) : pn(e, t, r, s, a, i);
};
let gn = 0;
const Ho = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, ft = (e) => typeof e == "number" && Number.isFinite(e), ni = (e) => ft(e) && e > 0 ? Math.floor(e) : 12, ai = (e) => ft(e) && e > 0 ? Math.floor(e) : 1 / 0, ci = (e, t = "first-fit") => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift" ? e : t, di = (e, t = "block") => e === "layout" ? "layout" : t, li = (e, t) => e === "vertical" || e === "horizontal" || e === null ? e : t, uo = (e, t) => typeof e == "boolean" ? e : t, ui = (e) => {
  if (!(!e || !ft(e.x) || !ft(e.y)))
    return {
      ...e,
      x: Math.max(0, Math.floor(e.x)),
      y: Math.max(0, Math.floor(e.y))
    };
}, hn = (e, t) => ({
  ...e,
  i: typeof e.i == "string" && e.i.length > 0 ? e.i : `placement-item-${t + 1}`,
  x: ft(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: ft(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: ft(e.w) ? Math.max(1, Math.floor(e.w)) : 1,
  h: ft(e.h) ? Math.max(1, Math.floor(e.h)) : 1
}), vn = (e) => (Array.isArray(e.items) ? e.items : e.item ? [e.item] : []).filter((o) => o && typeof o == "object").map((o, s) => hn(o, s)), Pt = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Fo = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), fi = (e, t, o, s) => {
  const r = t || e, a = new Map(o.before.map((c) => [c.id, c])), i = new Map(o.after.map((c) => [c.id, c])), f = [], d = /* @__PURE__ */ new Set();
  return o.shiftedIds.slice().sort().forEach((c) => {
    const y = a.get(c) || Pe(e, c), u = i.get(c) || Pe(r, c);
    !y || !u || (d.add(c), f.push({
      id: c,
      before: Pt(y),
      after: Pt(u),
      kind: "shift"
    }));
  }), Array.from(i.keys()).sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = a.get(c) || Pe(e, c), u = i.get(c) || Pe(r, c);
    !y || !u || y.x === u.x && y.y === u.y && y.w === u.w && y.h === u.h || (d.add(c), f.push({
      id: c,
      before: Pt(y),
      after: Pt(u),
      kind: "predicted"
    }));
  }), ((s == null ? void 0 : s.reason) === "collision" || (s == null ? void 0 : s.reason) === "bounds" || (s == null ? void 0 : s.reason) === "maxRows") && (s.itemIds || []).slice().sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = Pe(e, c) || Pe(r, c);
    y && (d.add(c), f.push({
      id: c,
      before: Pt(y),
      after: Pt(y),
      kind: "collision"
    }));
  }), f;
}, sa = (e, t, o, s) => fi(e, t, o, s), ia = (e = [], t) => {
  const o = e.slice();
  return t && !o.some((s) => s.reason === t.reason) && o.push(Fo(
    `grid-editor.placement.blocked.${t.reason}`,
    "warning",
    t.message || `Placement blocked by ${t.reason}.`,
    { reason: t.reason, itemIds: t.itemIds }
  )), o;
}, ra = (e) => de(e), bn = (e, t, o, s) => {
  const r = new Map(e.items.map((a, i) => [o[i], a.i]));
  return o.map((a) => {
    const i = Pe(t || e.items, a) || Pe(e.items, r.get(a) || a);
    return i ? {
      id: a,
      item: zo(i),
      state: s,
      sourceId: r.get(a)
    } : null;
  }).filter(Boolean);
}, $o = (e, t = {}, o = {}) => {
  var S, k, F, K, A;
  const s = ui(t.cursor) || e.cursor, r = ci(t.strategy || e.strategy, e.strategy), a = di(t.collisionPolicy, e.collisionPolicy), i = li(t.compactType, e.compactType), f = uo(t.allowOverlap, e.allowOverlap), d = uo(t.preventCollision, e.preventCollision), c = ni((S = t.cols) != null ? S : e.cols), y = ai((k = t.maxRows) != null ? k : e.maxRows), u = {
    collisionPolicy: a,
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
  }, p = xt(
    e.baseLayout,
    e.items,
    r,
    u
  ), m = p.failed && p.summary.insertedIds.length === 0 ? void 0 : p.layout, v = p.failed ? {
    reason: ((F = p.blocked) == null ? void 0 : F.reason) || "bounds",
    itemIds: (K = p.blocked) == null ? void 0 : K.itemIds,
    message: ((A = p.blocked) == null ? void 0 : A.message) || "Placement could not produce a valid candidate.",
    recoverable: !0
  } : void 0, C = p.summary.diagnostics.slice();
  return v && C.push(Fo(
    `grid-editor.placement.blocked.${v.reason}`,
    "warning",
    v.message || `Placement blocked by ${v.reason}.`,
    { reason: v.reason, itemIds: v.itemIds }
  )), {
    ...e,
    phase: v ? "blocked" : "preview",
    cursor: s,
    strategy: r,
    collisionPolicy: a,
    compactType: i,
    allowOverlap: f,
    preventCollision: d,
    cols: c,
    maxRows: y,
    candidateLayout: m,
    ghostItems: bn(
      e,
      m,
      p.summary.insertedIds.length ? p.summary.insertedIds : e.items.map((ae) => ae.i),
      v ? "blocked" : "preview"
    ),
    affectedOutlines: fi(e.baseLayout, m, p.summary, v),
    diagnostics: C,
    blocked: v,
    updatedAt: (o.now || Ho)(),
    previewSeq: e.previewSeq + 1
  };
}, In = (e, t) => {
  var i, f, d;
  const o = (t.now || Ho)(), s = e.commandType || (e.source === "paste" ? "paste" : "add"), r = e.resolvedClipboardPayload ? de(e.resolvedClipboardPayload.items) : vn(e), a = {
    id: t.id || `grid-editor-placement:${++gn}`,
    phase: "starting",
    source: e.source,
    commandType: s,
    baseRevision: t.baseRevision,
    baseLayout: de(t.baseLayout),
    items: r,
    editorMetaById: Me(
      ((i = e.resolvedClipboardPayload) == null ? void 0 : i.editorMetaById) || e.editorMetaById,
      { layout: r }
    ),
    resolvedClipboardPayload: e.resolvedClipboardPayload ? {
      ...e.resolvedClipboardPayload,
      items: de(e.resolvedClipboardPayload.items),
      editorMetaById: Me(e.resolvedClipboardPayload.editorMetaById, {
        layout: e.resolvedClipboardPayload.items
      })
    } : void 0,
    strategy: ci(e.strategy, t.defaultStrategy || "first-fit"),
    collisionPolicy: di(e.collisionPolicy),
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor,
    compactType: li(e.compactType),
    allowOverlap: uo(e.allowOverlap),
    preventCollision: uo(e.preventCollision),
    cursor: ui(e.cursor),
    size: r[0] ? { w: r[0].w, h: r[0].h } : void 0,
    origin: e.origin,
    cols: ni((f = e.cols) != null ? f : t.cols),
    maxRows: ai((d = e.maxRows) != null ? d : t.maxRows),
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
      ...a,
      phase: "blocked",
      blocked: c,
      diagnostics: [Fo(
        "grid-editor.placement.invalid-item",
        "error",
        c.message || "No items were provided for placement.",
        { reason: c.reason }
      )],
      updatedAt: o
    };
  }
  return $o(a, {}, { now: () => o });
}, xn = (e, t = {}) => {
  var s, r, a, i;
  const o = {
    items: e.commandType === "add" ? de(e.items) : void 0,
    item: e.commandType === "add" && e.items.length === 1 ? zo(e.items[0]) : void 0,
    editorMetaById: e.commandType === "add" ? Me(e.editorMetaById) : void 0,
    resolvedClipboardPayload: e.commandType === "paste" ? {
      items: de(e.items),
      editorMetaById: Me(e.editorMetaById, { layout: e.items }),
      sourceId: (s = e.resolvedClipboardPayload) == null ? void 0 : s.sourceId,
      source: (r = e.resolvedClipboardPayload) == null ? void 0 : r.source,
      originalGeometryById: (a = e.resolvedClipboardPayload) == null ? void 0 : a.originalGeometryById,
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
    placementCandidateLayout: e.candidateLayout ? de(e.candidateLayout) : void 0
  };
  return {
    type: e.commandType,
    payload: o,
    source: t.source || "api",
    origin: e.origin
  };
}, wn = (e, t = "cancelled", o = {}) => ({
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
    updatedAt: (o.now || Ho)()
  }
}), kn = [
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
], Mn = (e) => {
  if (e === "align") return 2;
  if (e === "distribute" || e === "tidy") return 3;
}, Sn = (e, t) => {
  var r, a, i, f, d;
  const o = Zs(t.type), s = e.canExecute({
    source: (o == null ? void 0 : o.defaultSource) || "toolbar",
    ...t
  });
  return {
    command: t.type,
    enabled: s.status !== "blocked" && s.status !== "cancelled" && s.status !== "timeout" && s.status !== "error",
    reason: (r = s.blocked) == null ? void 0 : r.reason,
    requiredSelectionCount: ((a = s.blocked) == null ? void 0 : a.reason) === "selection-count" ? Mn(t.type) : void 0,
    blockedIds: ((i = s.blocked) == null ? void 0 : i.itemIds) || ((f = s.blocked) == null ? void 0 : f.skippedIds),
    labelKey: o == null ? void 0 : o.labelKey,
    shortcuts: o == null ? void 0 : o.shortcuts,
    messageKey: (d = s.blocked) != null && d.reason ? `grid-editor.toolbar.${t.type}.${s.blocked.reason}` : void 0
  };
}, Cn = (e) => {
  var v, C;
  const t = e.selection.value, o = e.editorMetaById.value, s = He(e.sectionRows.value), r = t.selectedIds, a = Array.from(new Set(r.flatMap((S) => {
    const k = s.itemMembership[S];
    return [
      (k == null ? void 0 : k.sectionId) || null,
      (k == null ? void 0 : k.rowId) || null
    ].filter(Boolean);
  }))), i = (v = Object.values(s.items).slice().sort((S, k) => S.order - k.order || S.id.localeCompare(k.id))[0]) == null ? void 0 : v.id, f = a[0] || i, d = {}, c = f ? { id: f } : {};
  [
    ...kn,
    { type: "section-row-collapse", payload: c },
    { type: "section-row-expand", payload: c },
    { type: "section-row-move", payload: f ? { id: f, dy: 1 } : {} },
    { type: "section-row-delete", payload: c },
    { type: "section-row-reorder", payload: c }
  ].forEach((S) => {
    d[S.type] = Sn(e, S);
  });
  const u = r.filter((S) => {
    var k;
    return (k = o[S]) == null ? void 0 : k.locked;
  }).length, p = r.filter((S) => {
    var k;
    return ((k = o[S]) == null ? void 0 : k.visible) === !1;
  }).length, m = (C = e.guides.value.diagnostics) == null ? void 0 : C.intelligence;
  return {
    commands: d,
    selectionSummary: {
      count: r.length,
      movableCount: Math.max(0, r.length - u - p),
      lockedCount: u,
      hiddenCount: p,
      sectionRowIds: a
    },
    intelligenceSummary: m ? {
      equalSpacing: m.codes.includes("grid-editor.distribution.equal"),
      distributionMode: m.distributionMode === "none" ? void 0 : m.distributionMode,
      snapCandidateCount: m.snapCandidateCount,
      degraded: m.degraded,
      reason: m.reason
    } : void 0
  };
}, Go = (e) => e.kind === "layout" ? e.layout : e.layouts[e.breakpoint] || [], Ts = (e) => ({
  layoutSize: Go(e).length,
  layoutCount: e.kind === "responsive" ? Object.keys(e.layouts).length : 1,
  metadataCount: Object.keys(e.editorMetaById || {}).length,
  sectionRowCount: Object.keys(e.sectionRows.items || {}).length,
  selectionCount: e.selection.selectedIds.length,
  focusId: e.focusId
}), Rn = (e, t) => {
  const o = [];
  return (/* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])).forEach((r) => {
    const a = e[r], i = t[r];
    if (!i && a) {
      o.push({ type: "remove", id: r, previous: a });
      return;
    }
    i && !Ke(a, i) && o.push({ type: "set", id: r, previous: a, next: i });
  }), o;
}, En = (e, t) => {
  const o = [], s = e.items || {}, r = t.items || {};
  return (/* @__PURE__ */ new Set([...Object.keys(s), ...Object.keys(r)])).forEach((i) => {
    const f = s[i], d = r[i];
    if (!d && f) {
      o.push({ type: "remove", id: i, previous: f });
      return;
    }
    d && !Ke(f, d) && o.push({ type: "set", id: i, previous: f, next: d });
  }), o;
}, Os = (e, t, o = {}) => {
  const s = Nt(
    Go(e),
    Go(t)
  ), r = o.metadataPatches || Rn(e.editorMetaById, t.editorMetaById), a = o.sectionRowPatches || En(e.sectionRows, t.sectionRows), i = wo(s, r);
  return a.forEach((f) => i.push(f.id)), {
    layoutPatches: s,
    metadataPatches: r,
    sectionRowPatches: a,
    affectedIds: Array.from(new Set(i)),
    beforeSummary: Ts(e),
    afterSummary: Ts(t),
    risk: o.risk
  };
}, xo = {
  activeId: null,
  guides: [],
  displayGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}, Ls = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Bt = (e) => Me(e), Ze = (e) => ({
  ...e,
  selectedIds: e.selectedIds.slice()
}), ct = (e) => ({
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
}), dt = (e, t) => {
  let o = 1, s = `${e}-copy`;
  for (; t.has(s); )
    o += 1, s = `${e}-copy-${o}`;
  return t.add(s), s;
}, Pn = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e), U = (e) => typeof e == "number" && Number.isFinite(e), Ne = (e, t) => Math.max(1, Math.floor(U(e) ? e : t)), Qt = (e) => e.payload && typeof e.payload == "object" ? e.payload : {}, Bn = (e) => e === "vertical" || e === "horizontal" || e === null, Hs = (e) => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift", Fs = (e) => e === "s" || e === "w" || e === "e" || e === "n" || e === "sw" || e === "nw" || e === "se" || e === "ne", js = (e) => e || "invalid-input", $n = (e, t, o) => {
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
}, Ht = (e, t, o, s) => {
  const r = {};
  return { items: e.map((i) => {
    const f = s(i.i, o);
    return t[i.i] && (r[f] = { ...t[i.i] }), { ...zo(i), i: f };
  }), metaById: r };
}, yi = (e) => {
  var Uo;
  const t = e.kind || (e.layouts ? "responsive" : "layout"), o = Ee([]), s = Ee({}), r = e.layout || o, a = e.layouts || s, i = e.breakpoint || Ee("default"), f = !e.mode && !e.defaultMode, d = Ee(e.defaultMode || "view"), c = e.mode || d, y = Ee(
    Me(e.defaultEditorMetaById)
  ), u = e.editorMetaById || y, p = Ee(
    e.defaultSectionRows || Xs()
  ), m = e.sectionRows || p, v = Ee(
    Ge(
      ((Uo = e.selectedIds) == null ? void 0 : Uo.value) || e.defaultSelectedIds || [],
      e.selectedIds ? "external" : "api"
    )
  ), C = Ee(null), S = Ee({ ...xo }), k = Ee(null), F = Ee(null), K = Ee(null), A = Ee(!1), ae = Ee(!1), L = Ee(v.value.activeId), w = Ee(!1), R = [], T = /* @__PURE__ */ new Set();
  let M = 0, O = 0;
  e.onEvent && T.add(e.onEvent);
  const G = (n) => {
    O += 1;
    try {
      return n();
    } finally {
      O -= 1;
    }
  }, z = (n) => {
    const l = [];
    for (const h of Array.from(T))
      try {
        h(n);
      } catch (x) {
        l.push(x);
      }
    if (l.length === 0 || n.type === "editor-error") return;
    const I = {
      type: "editor-error",
      code: "editor-event-listener-error",
      message: "Grid editor event listener failed.",
      details: l.length === 1 ? l[0] : l
    };
    for (const h of Array.from(T))
      try {
        h(I);
      } catch (x) {
      }
  }, q = (n) => {
    let l = !0;
    return w.value || T.add(n), () => {
      l && (l = !1, T.delete(n));
    };
  }, E = () => t === "responsive" ? de(a.value[i.value] || []) : de(r.value), me = (n) => {
    M += 1, G(() => {
      t === "responsive" ? (a.value = {
        ...a.value,
        [i.value]: de(n)
      }, e.layout && (r.value = de(n))) : r.value = de(n);
    });
  }, Oe = () => t === "responsive" ? io(a.value) : { default: de(r.value) }, ze = (n, l = i.value) => {
    M += 1, G(() => {
      a.value = io(n), i.value = l, e.layout && (r.value = de(n[l] || []));
    });
  }, W = () => t === "responsive" ? {
    kind: "responsive",
    layouts: Oe(),
    breakpoint: i.value,
    editorMetaById: Bt(u.value),
    sectionRows: ct(m.value),
    selection: Ze(v.value),
    focusId: L.value
  } : {
    kind: "layout",
    layout: E(),
    editorMetaById: Bt(u.value),
    sectionRows: ct(m.value),
    selection: Ze(v.value),
    focusId: L.value
  }, ve = (n) => {
    M += 1, n.kind === "responsive" ? ze(n.layouts, n.breakpoint) : me(n.layout), u.value = Bt(n.editorMetaById), m.value = ct(n.sectionRows), v.value = Ze(n.selection), L.value = n.focusId;
  }, ie = Ee(W()), J = e.history === !1 ? null : e.history || Nr();
  J == null || J.replacePresent(W());
  const We = (n) => ({
    id: `editor-rollback-checkpoint:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    kind: "grid-editor-rollback-checkpoint",
    snapshot: W(),
    history: J == null ? void 0 : J.checkpoint(),
    revision: M,
    reason: n
  }), qe = (n, l = n.reason || "rollback-checkpoint-restore") => {
    mt.abortPending(l), K.value = null, Fe(l), ve(n.snapshot), J && n.history && J.restore(n.history), z({
      type: "editor-state-change",
      state: Je.value,
      reason: l
    });
  }, pt = ps(() => !Ke(W(), ie.value)), Je = ps(() => C.value ? "conflict" : ae.value ? "savePending" : A.value ? "saveFailed" : K.value ? K.value : k.value ? "placing" : c.value === "view" ? "viewing" : pt.value ? "editingDirty" : "editingClean"), et = Pn(e.persistence) ? e.persistence : null, st = qr({
    getEditorMetaById: () => u.value,
    getSectionRows: () => m.value,
    setEditorMetaById: (n, l) => {
      M += 1, u.value = Me(n, { layout: E() }), (l === "save-success" || l === "load-success") && (ie.value = W());
    },
    setSectionRows: (n, l) => {
      M += 1, m.value = {
        version: 1,
        items: n.items,
        itemMembership: n.itemMembership
      }, (l === "save-success" || l === "load-success") && (ie.value = W());
    },
    persistence: et,
    onSaveStateChange: (n) => {
      ae.value = n.status === "saving", A.value = n.status === "error", z({
        type: "save-state-change",
        status: n.status,
        dirty: n.dirty,
        error: n.error
      });
    },
    onConflict: (n) => {
      M += 1, C.value = n, z({ type: "conflict", conflict: n });
    },
    onError: (n, l, I) => {
      z({ type: "editor-error", code: n, message: l, details: I });
    }
  }), it = (n, l = !1) => {
    const I = v.value, h = Ve(
      n,
      E(),
      u.value,
      n.source
    );
    return e.selectedIds ? (z({
      type: "selection-change",
      selection: h,
      previous: I,
      requested: !0
    }), I) : Ke(I, h) ? I : (M += 1, v.value = h, L.value = h.activeId, z({
      type: "selection-change",
      selection: h,
      previous: I,
      requested: l
    }), h);
  }, Ye = (n, l, I, h = ((x) => (x = l.diagnostics) == null ? void 0 : x.guardMs)() || 0) => {
    var B, H, be;
    const g = Ft(
      n.history,
      oo(n.type)
    ), P = {
      ...l,
      diagnostics: {
        ...l.diagnostics,
        durationMs: Ls() - I,
        guardMs: h,
        historyMode: ((B = l.diagnostics) == null ? void 0 : B.historyMode) || g.mode,
        source: ((H = l.diagnostics) == null ? void 0 : H.source) || n.source,
        origin: ((be = l.diagnostics) == null ? void 0 : be.origin) || n.origin
      }
    };
    return F.value = P, P.status === "blocked" || P.status === "cancelled" || P.status === "timeout" ? z({ type: "command-blocked", command: n, result: P }) : P.status === "error" ? z({ type: "command-error", command: n, result: P }) : z({ type: "command-commit", command: n, result: P }), K.value === "keyboardEditing" && n.source === "keyboard" && (K.value = null), P;
  }, we = (n, l, I, h) => {
    var B, H;
    const x = Ft(
      n.history,
      oo(n.type)
    );
    if (I.diagnostics = {
      durationMs: ((B = I.diagnostics) == null ? void 0 : B.durationMs) || 0,
      ...I.diagnostics,
      historyMode: x.mode,
      source: n.source,
      origin: n.origin
    }, !J)
      return I;
    if (x.mode === "clear")
      return J.clear(W()), I;
    if (x.mode === "replace")
      return J.replacePresent(W(), {
        preserveRedoStack: x.preserveRedoStack
      }), I;
    if (x.mode === "ignore" || !Di(n.type))
      return I;
    const g = h || W(), P = Kr({
      commandId: n.id,
      commandType: n.type,
      before: l,
      after: g,
      mergeKey: x.mergeKey,
      source: n.source,
      origin: n.origin,
      targetIds: I.targetIds,
      affectedIds: I.affectedIds,
      historyMode: x.mode
    });
    return J.push(P, {
      preserveRedoStack: x.preserveRedoStack || x.mode === "record-preserveRedoStack"
    }), I.undo = P, t === "layout" && ((H = e.legacyHistoryStore) == null || H.push(E())), I;
  }, rt = (n) => ro(n.type).mutualExclusionScope || "global", yo = (n, l, I) => {
    const h = ro(n.type);
    return {
      id: `${n.id}:transaction`,
      commandId: n.id,
      command: n,
      source: n.source || h.defaultSource || "api",
      origin: n.origin,
      scope: rt(n),
      before: l,
      after: I,
      preview: Os(l, I, {
        risk: h.risk
      }),
      history: Ft(
        n.history,
        h.defaultHistory.mode || oo(n.type)
      )
    };
  }, _t = (n, l, I) => {
    if (e.selectedIds) {
      Ke(n.selection, l.selection) || z({
        type: "selection-change",
        selection: Ze(l.selection),
        previous: Ze(n.selection),
        requested: !0
      });
      return;
    }
    Ke(n.selection, I.selection) || z({
      type: "selection-change",
      selection: Ze(I.selection),
      previous: Ze(n.selection)
    }), n.focusId !== I.focusId && z({
      type: "focus-change",
      from: n.focusId,
      to: I.focusId,
      reason: "transaction"
    });
  }, nt = (n, l, I, h = {}) => {
    const x = !!e.selectedIds, g = x ? at(I, {
      selection: l.selection,
      focusId: l.focusId
    }) : I, P = yo(n, l, g), B = !Ke(l, g), H = h.status || (B ? "changed" : "noop"), be = Ie(n, H, {
      ...h,
      targetIds: h.targetIds || P.preview.affectedIds,
      layoutPatches: h.layoutPatches || P.preview.layoutPatches,
      metadataPatches: h.metadataPatches || P.preview.metadataPatches,
      affectedIds: h.affectedIds || P.preview.affectedIds,
      selection: h.selection || g.selection,
      diagnostics: {
        durationMs: 0,
        ...h.diagnostics
      }
    });
    if (B)
      try {
        ve(P.after), _t(l, I, P.after);
      } catch (j) {
        try {
          ve(P.before);
        } catch (V) {
        }
        return ds(n, "Editor transaction apply failed.", j);
      }
    else x && _t(l, I, P.after);
    return we(n, l, be, P.after);
  }, Mt = (n) => typeof e.layoutEngineOptions == "function" ? e.layoutEngineOptions() : e.layoutEngineOptions ? e.layoutEngineOptions : U(n.cols) ? {
    cols: Math.max(1, Math.floor(n.cols)),
    maxRows: U(n.maxRows) ? n.maxRows : 1 / 0,
    compactType: Bn(n.compactType) ? n.compactType : "vertical",
    allowOverlap: n.allowOverlap === !0,
    preventCollision: n.preventCollision === !0
  } : null, b = (n) => {
    const l = Mt(n);
    return l ? l.cols : U(n.cols) && n.cols > 0 ? Math.floor(n.cols) : void 0;
  }, $ = (n) => {
    const l = {}, I = b(n);
    return I && (l.cols = I), typeof n.breakpoint == "string" && (l.breakpoint = n.breakpoint), typeof n.layoutId == "string" && (l.layoutId = n.layoutId), typeof n.viewFormat == "string" && (l.viewFormat = n.viewFormat), Object.keys(l).length > 0 ? l : void 0;
  }, N = async (n, l, I, h) => {
    const x = `${n.id}:layout`;
    if (e.layoutOperationRunner)
      return await e.layoutOperationRunner({
        commandId: n.id,
        layout: l,
        operation: I,
        phase: "commit",
        source: n.source || "api"
      });
    const g = Mt(h);
    return g ? await Promise.resolve(ko({
      id: x,
      phase: "commit",
      layout: l,
      operation: I,
      options: g
    })) : $n(x, l, I);
  }, ee = (n) => {
    var x, g, P, B;
    const l = (x = e.itemCapabilities) == null ? void 0 : x[n], I = ((g = e.resizeConstraints) == null ? void 0 : g[n]) || ((P = l == null ? void 0 : l.resizeConstraint) == null ? void 0 : P.aspectRatio), h = ((B = l == null ? void 0 : l.resizeConstraint) == null ? void 0 : B.handlePolicy) || (l != null && l.resizeHandles ? {
      allowedHandles: l.resizeHandles,
      blockedReason: "handle-disabled"
    } : void 0);
    if (!(!I && !h))
      return { aspectRatio: I, handlePolicy: h };
  }, oe = async (n) => {
    try {
      return await n.read();
    } catch (l) {
      if (n !== bt)
        return bt.read();
      throw l;
    }
  }, ne = async (n, l) => {
    try {
      await n.write(l);
    } catch (I) {
      if (n !== bt) {
        await bt.write(l);
        return;
      }
      throw I;
    }
  }, Se = () => !e.clipboard || e.clipboard === "internal" ? bt : e.clipboard === "system" ? Yr() : e.clipboard, ye = (n, l) => ({
    durationMs: 0,
    computed: {
      placement: {
        ...n.summary,
        collisionPolicy: (l == null ? void 0 : l.collisionPolicy) === "layout" || (l == null ? void 0 : l.collisionPolicy) === "block" ? l.collisionPolicy : n.summary.collisionPolicy,
        sessionId: typeof (l == null ? void 0 : l.placementSessionId) == "string" ? l.placementSessionId : n.summary.sessionId,
        source: typeof (l == null ? void 0 : l.placementSource) == "string" ? l.placementSource : n.summary.source
      }
    },
    messages: n.summary.diagnostics.map((h) => ({
      code: h.code,
      level: h.level,
      message: h.message,
      itemIds: h.itemIds,
      recoverable: h.level !== "error"
    }))
  }), Ce = (n) => ({
    durationMs: 0,
    computed: {
      placement: {
        strategy: n.strategy,
        placementSource: n.strategy,
        collisionPolicy: n.collisionPolicy,
        sessionId: n.id,
        source: n.source,
        insertedIds: n.ghostItems.map((l) => l.id),
        shiftedIds: n.affectedOutlines.filter((l) => l.kind === "shift").map((l) => l.id),
        before: n.affectedOutlines.map((l) => ({
          id: l.id,
          ...l.before
        })),
        after: n.affectedOutlines.map((l) => ({
          id: l.id,
          ...l.after
        })),
        diagnostics: n.diagnostics
      }
    },
    messages: n.diagnostics.map((l) => ({
      code: l.code,
      level: l.level,
      message: l.message,
      itemIds: l.itemIds,
      recoverable: l.level !== "error"
    }))
  }), Te = (n, l, I, h = [], x) => ({
    status: "blocked",
    blocked: {
      reason: l,
      itemIds: h,
      message: I
    },
    diagnostics: x || {
      durationMs: 0,
      messages: [{
        code: `grid-editor.placement.${l}`,
        level: l === "invalid-input" ? "error" : "warning",
        message: I,
        itemIds: h,
        recoverable: l !== "invalid-input"
      }]
    }
  }), Qe = (n) => {
    if (n.commandType && n.commandType !== "add" || n.source === "paste") return n;
    const l = Array.isArray(n.items) ? n.items : n.item ? [n.item] : [];
    if (l.length === 0) return n;
    const I = new Set(E().map((B) => B.i)), h = e.idGenerator || dt, x = n.editorMetaById || {}, g = {}, P = l.filter((B) => B && typeof B == "object").map((B, H) => {
      const be = typeof B.i == "string" && B.i.length > 0 ? B.i : `item-${H + 1}`, j = I.has(be) ? h(be, I) : be;
      return I.add(j), x[be] && (g[j] = { ...x[be] }), {
        ...B,
        i: j,
        x: U(B.x) ? B.x : 0,
        y: U(B.y) ? B.y : 0,
        w: Ne(B.w, 1),
        h: Ne(B.h, 1)
      };
    });
    return {
      ...n,
      commandType: "add",
      item: void 0,
      items: P,
      editorMetaById: Me(g, { layout: P })
    };
  }, Fe = (n) => {
    const l = k.value;
    return l ? (k.value = null, S.value = { ...xo }, z({ type: "placement-cancel", sessionId: l.id, reason: n }), l) : null;
  }, Ut = (n, l, I, h) => {
    for (let x = 0; x < l.length; x++) {
      const g = Pe(n, l[x]);
      if (!g) continue;
      if (g.x < 0 || g.y < 0 || g.x + g.w > I)
        return { ok: !1, reason: "bounds", itemIds: [g.i] };
      if (Number.isFinite(h) && g.y + g.h > h)
        return { ok: !1, reason: "maxRows", itemIds: [g.i] };
      const P = $t(n, g).filter((B) => B.i !== g.i);
      if (P.length > 0)
        return {
          ok: !1,
          reason: "collision",
          itemIds: [g.i, ...P.map((B) => B.i)]
        };
    }
    return { ok: !0 };
  }, po = (n, l) => {
    const I = He(m.value, l), h = [], x = [];
    return n.forEach((g) => {
      const P = I.itemMembership[g], B = P != null && P.sectionId ? I.items[P.sectionId] : void 0, H = P != null && P.rowId ? I.items[P.rowId] : void 0;
      B != null && B.locked || H != null && H.locked ? h.push(g) : (B != null && B.collapsed || H != null && H.collapsed) && x.push(g);
    }), h.length > 0 ? { reason: "section-row-locked", itemIds: h } : x.length > 0 ? { reason: "section-row-collapsed", itemIds: x } : null;
  }, St = (n, l) => {
    const I = new Set(l), h = /* @__PURE__ */ new Set();
    return Object.keys(n.itemMembership).forEach((x) => {
      const g = n.itemMembership[x];
      (g.sectionId && I.has(g.sectionId) || g.rowId && I.has(g.rowId)) && h.add(x);
    }), l.forEach((x) => {
      var g, P;
      (P = (g = n.items[x]) == null ? void 0 : g.itemIds) == null || P.forEach((B) => h.add(B));
    }), Array.from(h).sort();
  }, Wt = (n, l) => {
    if (U(l.order)) return l.order;
    const I = Object.values(n.items).slice().sort((g, P) => g.order - P.order || g.id.localeCompare(P.id)), h = l.beforeId ? n.items[l.beforeId] : void 0, x = l.afterId ? n.items[l.afterId] : void 0;
    if (h) {
      const g = I[I.findIndex((P) => P.id === h.id) - 1];
      return g ? (g.order + h.order) / 2 : h.order - 1;
    }
    if (x) {
      const g = I[I.findIndex((P) => P.id === x.id) + 1];
      return g ? (x.order + g.order) / 2 : x.order + 1;
    }
    return I.length > 0 ? I[I.length - 1].order + 1 : 0;
  }, mo = async (n, l, I, h) => {
    var Re, Gt, zt, Wo, qo, Vo, Zo, Jo, Qo, es, ts, os, ss, is, rs;
    const x = E(), g = Qt(n), P = [];
    let B, H = de(x), be = Ze(h.selection), j = h.focusId;
    const V = ho(n.type) ? po(l, x) : null;
    if (V)
      return Ie(n, "blocked", {
        targetIds: l,
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
    const te = jo(n);
    if (te && ho(n.type)) {
      const X = P.slice();
      if (n.type === "add") {
        const Z = Me(g.editorMetaById, {
          layout: te
        });
        Object.keys(Z).forEach((_e) => {
          X.push({ type: "set", id: _e, next: Z[_e] });
        });
      } else if (n.type === "paste") {
        const Z = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, _e = Me(Z == null ? void 0 : Z.editorMetaById, {
          layout: te
        });
        Object.keys(_e).forEach((Ct) => {
          X.push({ type: "set", id: Ct, next: _e[Ct] });
        });
      }
      const Y = Nt(x, te), _ = Y.flatMap(
        (Z) => Z.type === "add" ? [Z.item.i] : []
      ), se = Y.flatMap(
        (Z) => Z.type === "move" || Z.type === "resize" ? [Z.id] : []
      ), le = wo(Y, X), re = typeof g.placementSessionId == "string" ? {
        durationMs: 0,
        computed: {
          placement: {
            strategy: Hs(g.strategy) ? g.strategy : "first-fit",
            placementSource: Hs(g.strategy) ? g.strategy : "first-fit",
            collisionPolicy: g.collisionPolicy === "layout" || g.collisionPolicy === "block" ? g.collisionPolicy : void 0,
            sessionId: g.placementSessionId,
            source: typeof g.placementSource == "string" ? g.placementSource : void 0,
            insertedIds: _,
            shiftedIds: se,
            before: x.map((Z) => ({
              id: Z.i,
              x: Z.x,
              y: Z.y,
              w: Z.w,
              h: Z.h
            })),
            after: te.map((Z) => ({
              id: Z.i,
              x: Z.x,
              y: Z.y,
              w: Z.w,
              h: Z.h
            })),
            diagnostics: Array.isArray((Re = g.placementSummary) == null ? void 0 : Re.diagnostics) ? g.placementSummary.diagnostics : []
          }
        }
      } : B, ue = ht(
        Ot(h.editorMetaById, X),
        te
      ), Be = _.length > 0 && (n.type === "add" || n.type === "paste") ? Ge(_, "api") : Ve(
        h.selection,
        te,
        ue,
        "api"
      );
      return nt(n, h, at(h, {
        layout: te,
        editorMetaById: ue,
        selection: Be,
        focusId: Be.activeId
      }), {
        status: le.length > 0 ? "changed" : "noop",
        targetIds: l.length > 0 ? l : n.targetIds,
        layoutPatches: Y,
        metadataPatches: X,
        affectedIds: le,
        selection: Be,
        blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
        diagnostics: re
      });
    }
    if (us(n.type)) {
      const X = g, Y = He(m.value, x), _ = l.length > 0 ? l : X.id ? [X.id] : [], se = _.filter((ge) => !Y.items[ge]);
      if (se.length > 0)
        return Ie(n, "blocked", {
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
      const le = _.filter((ge) => {
        var xe;
        return (xe = Y.items[ge]) == null ? void 0 : xe.locked;
      });
      if (le.length > 0 && n.type !== "section-row-expand")
        return Ie(n, "blocked", {
          targetIds: _,
          blocked: {
            reason: "section-row-locked",
            itemIds: St(Y, le),
            message: "Section/row command blocked by locked metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.locked",
              level: "warning",
              message: "Section/row command blocked by locked metadata.",
              itemIds: le,
              recoverable: !0
            }]
          }
        });
      const re = ct({
        items: Y.items,
        itemMembership: Y.itemMembership
      }), ue = St(Y, _);
      let Be = v.value.selectedIds.slice(), Z = L.value;
      const _e = U(g.cols) ? g.cols : 12, Ct = U(g.maxRows) ? g.maxRows : 1 / 0;
      if (n.type === "section-row-collapse" || n.type === "section-row-expand") {
        const ge = n.type === "section-row-collapse";
        _.forEach((xe) => {
          re.items[xe] = { ...re.items[xe], collapsed: ge };
        }), ge && (Be = Be.filter((xe) => !ue.includes(xe)), Z && ue.includes(Z) && (Z = Be[0] || null));
      } else if (n.type === "section-row-reorder")
        _.forEach((ge) => {
          re.items[ge] = {
            ...re.items[ge],
            order: Wt(Y, X)
          };
        });
      else if (n.type === "section-row-move") {
        const ge = U(X.dy) ? Math.floor(X.dy) : 0;
        H = H.map(
          (je) => ue.includes(je.i) ? { ...je, y: Math.max(0, je.y + ge) } : je
        ), _.forEach((je) => {
          const Ue = re.items[je];
          re.items[je] = {
            ...Ue,
            bounds: Ue.bounds ? { ...Ue.bounds, y: Math.max(0, Ue.bounds.y + ge) } : Ue.bounds
          };
        });
        const xe = Ut(H, ue, _e, Ct);
        if (!xe.ok)
          return Ie(n, "blocked", {
            targetIds: _,
            blocked: {
              reason: xe.reason,
              itemIds: xe.itemIds,
              message: `Section/row move blocked by ${xe.reason}.`
            },
            diagnostics: {
              durationMs: 0,
              messages: [{
                code: `grid-editor.sectionRows.move.${xe.reason}`,
                level: "warning",
                message: `Section/row move blocked by ${xe.reason}.`,
                itemIds: xe.itemIds,
                recoverable: !0
              }]
            }
          });
      } else n.type === "section-row-delete" && (_.forEach((ge) => {
        delete re.items[ge];
      }), Object.keys(re.itemMembership || {}).forEach((ge) => {
        var Ue, Tt;
        const xe = ((Ue = re.itemMembership) == null ? void 0 : Ue[ge]) || {}, je = {
          sectionId: xe.sectionId && _.includes(xe.sectionId) ? void 0 : xe.sectionId,
          rowId: xe.rowId && _.includes(xe.rowId) ? void 0 : xe.rowId
        };
        !je.sectionId && !je.rowId ? (Tt = re.itemMembership) == null || delete Tt[ge] : re.itemMembership && (re.itemMembership[ge] = je);
      }), X.deleteItems === !0 && (H = H.filter((ge) => !ue.includes(ge.i)), ue.forEach((ge) => {
        u.value[ge] && P.push({ type: "remove", id: ge, previous: u.value[ge] });
      }), Be = Be.filter((ge) => !ue.includes(ge)), Z && ue.includes(Z) && (Z = Be[0] || null)));
      const go = He(re, H), tt = Nt(x, H), At = {
        version: 1,
        items: go.items,
        itemMembership: go.itemMembership
      }, Rt = ht(
        Ot(h.editorMetaById, P),
        H
      ), Ae = Ve(
        Ge(Be, "api"),
        H,
        Rt,
        "api"
      ), Dt = Array.from(/* @__PURE__ */ new Set([..._, ...ue]));
      return nt(n, h, at(h, {
        layout: H,
        editorMetaById: Rt,
        sectionRows: At,
        selection: Ae,
        focusId: Z
      }), {
        status: "changed",
        targetIds: _,
        layoutPatches: tt,
        metadataPatches: P,
        affectedIds: Dt,
        selection: Ae,
        diagnostics: {
          durationMs: 0,
          computed: {
            affectedIds: Dt,
            sectionRowContext: {
              source: "metadata"
            }
          },
          messages: [{
            code: `grid-editor.sectionRows.${n.type.replace("section-row-", "")}`,
            level: "info",
            message: `Section/row command ${n.type} applied.`,
            itemIds: ue,
            recoverable: !0
          }]
        }
      });
    }
    if (n.type === "select") {
      const X = v.value, Y = Ms(x, v.value, {
        id: typeof g.id == "string" ? g.id : void 0,
        ids: Array.isArray(g.ids) ? g.ids.filter((le) => typeof le == "string") : typeof g.id == "string" ? void 0 : l,
        toggle: g.toggle === !0,
        range: g.range === !0,
        source: n.source === "keyboard" ? "keyboard" : n.source === "pointer" ? "pointer" : "api"
      }), _ = Ve(
        Y,
        x,
        h.editorMetaById,
        Y.source
      ), se = e.selectedIds ? X : _;
      return nt(n, h, at(h, {
        selection: _,
        focusId: _.activeId
      }), {
        status: Ke(X, se) ? "noop" : "changed",
        targetIds: se.selectedIds,
        selection: se
      });
    }
    if (n.type === "clearSelection") {
      const X = v.value, Y = Ve(
        Co("api"),
        x,
        h.editorMetaById,
        "api"
      ), _ = e.selectedIds ? X : Y;
      return nt(n, h, at(h, {
        selection: Y,
        focusId: Y.activeId
      }), {
        status: Ke(X, _) ? "noop" : "changed",
        selection: _
      });
    }
    if (n.type === "move") {
      const X = U(g.dx) ? g.dx : null, Y = U(g.dy) ? g.dy : null, _ = U(g.x), se = U(g.y), le = Array.from(/* @__PURE__ */ new Set([...l, ...I])), re = v.value.activeId && l.includes(v.value.activeId) ? v.value.activeId : l[0], ue = re ? Pe(x, re) : void 0, Be = (((Gt = n.targetIds) == null ? void 0 : Gt.filter(Boolean).length) || 0) > 1, Z = !n.targetIds && v.value.selectedIds.length > 1 && (X !== null || Y !== null), _e = Be || Z, Ct = l.length === 1 && !Be && (_ || se);
      if (l.length > 0 && !Ct && (l.length > 1 || _e)) {
        const tt = X !== null ? X : _ && ue ? g.x - ue.x : 0, At = Y !== null ? Y : se && ue ? g.y - ue.y : 0, Rt = {
          type: "groupMove",
          ids: l,
          activeId: re,
          dx: tt,
          dy: At,
          userAction: n.source !== "api"
        }, Ae = await N(n, x, Rt, g);
        if (B = {
          durationMs: 0,
          layoutDiagnostics: Ae.diagnostics,
          operationResult: Ae
        }, Ae.status === "blocked") {
          const Tt = js((zt = Ae.blocked) == null ? void 0 : zt.reason);
          return Ie(n, "blocked", {
            targetIds: le,
            blocked: {
              reason: Tt,
              itemIds: ((Wo = Ae.blocked) == null ? void 0 : Wo.itemIds) || le,
              skippedIds: I.length > 0 ? I : void 0,
              message: `Move command blocked by ${Tt}.`
            },
            diagnostics: B
          });
        }
        if (Ae.status === "error")
          return Ie(n, "error", {
            targetIds: le,
            diagnostics: B,
            error: Ae.error || { message: "Layout operation failed." }
          });
        const Dt = Ae.patches, ge = Ae.affectedIds, xe = Dt.length > 0 || Ae.status === "changed" || Ae.status === "fallback" ? "changed" : "noop", je = ht(
          Ot(h.editorMetaById, P),
          Ae.layout
        ), Ue = Ve(
          h.selection,
          Ae.layout,
          je,
          "api"
        );
        return nt(n, h, at(h, {
          layout: Ae.layout,
          editorMetaById: je,
          selection: Ue,
          focusId: Ue.activeId
        }), {
          status: xe,
          targetIds: le,
          layoutPatches: Dt,
          metadataPatches: P,
          affectedIds: ge,
          selection: Ue,
          blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
          diagnostics: B
        });
      }
      H = H.map((tt) => {
        if (!l.includes(tt.i)) return tt;
        const At = l.length === 1 && _ ? g.x : tt.x + (X || 0), Rt = l.length === 1 && se ? g.y : tt.y + (Y || 0);
        return { ...tt, x: Math.max(0, Math.floor(At)), y: Math.max(0, Math.floor(Rt)) };
      });
    } else if (n.type === "resize") {
      const X = l[0], Y = X ? Pe(H, X) : void 0, _ = X ? ee(X) : void 0;
      if (Y && _) {
        const se = U(g.w) ? g.w : Y.w + (U(g.dw) ? g.dw : 0), le = U(g.h) ? g.h : Y.h + (U(g.dh) ? g.dh : 0), re = await N(n, x, {
          type: "resize",
          id: X,
          x: U(g.x) ? Math.max(0, Math.floor(g.x)) : void 0,
          y: U(g.y) ? Math.max(0, Math.floor(g.y)) : void 0,
          w: Ne(se, Y.w),
          h: Ne(le, Y.h),
          handle: Fs(g.handle) ? g.handle : "se",
          constraint: _
        }, g);
        if (B = {
          durationMs: 0,
          layoutDiagnostics: re.diagnostics,
          operationResult: re
        }, re.status === "blocked") {
          const ue = js((qo = re.blocked) == null ? void 0 : qo.reason);
          return Ie(n, "blocked", {
            targetIds: l,
            blocked: {
              reason: ue,
              itemIds: ((Vo = re.blocked) == null ? void 0 : Vo.itemIds) || l,
              message: `Resize command blocked by ${ue}.`
            },
            diagnostics: B
          });
        }
        if (re.status === "error")
          return Ie(n, "error", {
            targetIds: l,
            diagnostics: B,
            error: re.error || { message: "Layout operation failed." }
          });
        H = re.layout;
      } else
        H = H.map((se) => {
          if (se.i !== X) return se;
          const le = U(g.w) ? g.w : se.w + (U(g.dw) ? g.dw : 0), re = U(g.h) ? g.h : se.h + (U(g.dh) ? g.dh : 0);
          return {
            ...se,
            x: U(g.x) ? Math.max(0, Math.floor(g.x)) : se.x,
            y: U(g.y) ? Math.max(0, Math.floor(g.y)) : se.y,
            w: Ne(le, se.w),
            h: Ne(re, se.h)
          };
        });
    } else if (n.type === "align") {
      const X = U(g.cols) ? g.cols : 12, Y = U(g.maxRows) ? g.maxRows : 1 / 0, _ = $s(x, g, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: X,
        maxRows: Y,
        skippedIds: I
      });
      if (B = _.diagnostics, _.status === "blocked")
        return Ie(n, "blocked", {
          targetIds: l,
          blocked: _.blocked,
          diagnostics: B
        });
      H = _.layout;
    } else if (n.type === "distribute" || n.type === "tidy") {
      const X = U(g.cols) ? g.cols : 12, Y = U(g.maxRows) ? g.maxRows : 1 / 0, _ = n.type === "distribute" ? Gs(x, g, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: X,
        maxRows: Y,
        skippedIds: I
      }) : zs(x, g, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: X,
        maxRows: Y,
        skippedIds: I
      });
      if (B = _.diagnostics, _.status === "blocked")
        return Ie(n, "blocked", {
          targetIds: l,
          blocked: _.blocked,
          diagnostics: B
        });
      H = _.layout;
    } else if (n.type === "add") {
      const X = Array.isArray(g.items) ? g.items : g.item ? [g.item] : [], Y = new Set(H.map((ue) => ue.i)), _ = e.idGenerator || dt, se = X.filter((ue) => ue && typeof ue == "object").map((ue, Be) => {
        const Z = ue, _e = typeof Z.i == "string" && !Y.has(Z.i) ? Z.i : _(typeof Z.i == "string" ? Z.i : `item-${Be + 1}`, Y);
        return Y.add(_e), {
          ...Z,
          i: _e,
          x: U(Z.x) ? Z.x : 0,
          y: U(Z.y) ? Z.y : 0,
          w: Ne(Z.w, 1),
          h: Ne(Z.h, 1)
        };
      }), le = xt(H, se, String(g.strategy || "first-fit"), g);
      if (B = ye(le, g), le.failed)
        return Ie(n, "blocked", {
          targetIds: le.summary.insertedIds,
          blocked: {
            reason: ((Zo = le.blocked) == null ? void 0 : Zo.reason) || "bounds",
            itemIds: (Jo = le.blocked) == null ? void 0 : Jo.itemIds,
            message: ((Qo = le.blocked) == null ? void 0 : Qo.message) || "One or more items could not fit in the current layout."
          },
          diagnostics: B
        });
      const re = Me(g.editorMetaById, { layout: se });
      Object.keys(re).forEach((ue) => {
        se.some((Be) => Be.i === ue) && P.push({ type: "set", id: ue, next: re[ue] });
      }), H = le.layout;
    } else if (n.type === "delete") {
      const X = new Set(l);
      H = H.filter((Y) => !X.has(Y.i)), l.forEach((Y) => {
        u.value[Y] && P.push({ type: "remove", id: Y, previous: u.value[Y] });
      }), j = Ss(H, l, u.value);
    } else if (n.type === "duplicate") {
      const X = l.map((se) => Pe(x, se)).filter(Boolean), Y = Ht(
        X,
        u.value,
        new Set(x.map((se) => se.i)),
        e.idGenerator || dt
      );
      Object.keys(Y.metaById).forEach((se) => {
        P.push({ type: "set", id: se, next: Y.metaById[se] });
      });
      const _ = xt(
        H,
        Y.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (B = ye(_, g), _.failed)
        return Ie(n, "blocked", {
          targetIds: l,
          blocked: {
            reason: ((es = _.blocked) == null ? void 0 : es.reason) || "bounds",
            itemIds: ((ts = _.blocked) == null ? void 0 : ts.itemIds) || l,
            message: ((os = _.blocked) == null ? void 0 : os.message) || "Duplicated items could not fit in the current layout."
          },
          diagnostics: B
        });
      H = _.layout, be = Ge(Y.items.map((se) => se.i), "api"), j = be.activeId;
    } else if (n.type === "copy") {
      const X = l.map((Y) => Pe(x, Y)).filter(Boolean);
      return await ne(Se(), _r({
        sourceId: n.id,
        items: X,
        editorMetaById: Me(u.value, { layout: X }),
        source: $(g)
      })), Ie(n, "changed", {
        targetIds: l,
        affectedIds: l
      });
    } else if (n.type === "paste") {
      const X = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, Y = X ? {
        items: de(Array.isArray(X.items) ? X.items : []),
        editorMetaById: Me(X.editorMetaById),
        sourceId: typeof X.sourceId == "string" ? X.sourceId : n.id,
        copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 2,
        source: X.source,
        originalGeometryById: X.originalGeometryById
      } : await oe(Se());
      if (!Y)
        return Ie(n, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      const _ = (X == null ? void 0 : X.mapped) === !0 ? {
        items: de(Y.items)
      } : Io(Y, {
        cols: b(g)
      }), se = (X == null ? void 0 : X.mapped) === !0 ? {
        items: de(_.items),
        metaById: Me(Y.editorMetaById, {
          layout: _.items
        })
      } : Ht(
        _.items,
        Y.editorMetaById,
        new Set(x.map((re) => re.i)),
        e.idGenerator || dt
      );
      Object.keys(se.metaById).forEach((re) => {
        P.push({ type: "set", id: re, next: se.metaById[re] });
      });
      const le = xt(
        H,
        se.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (B = ye(le, g), le.failed)
        return Ie(n, "blocked", {
          blocked: {
            reason: ((ss = le.blocked) == null ? void 0 : ss.reason) || "bounds",
            itemIds: (is = le.blocked) == null ? void 0 : is.itemIds,
            message: ((rs = le.blocked) == null ? void 0 : rs.message) || "Clipboard items could not fit in the current layout."
          },
          diagnostics: B
        });
      H = le.layout, be = Ge(se.items.map((re) => re.i), "api"), j = be.activeId;
    } else fs(n.type) && l.forEach((X) => {
      const Y = n.type === "lock" ? { locked: !0 } : n.type === "unlock" ? { locked: !1 } : n.type === "show" ? { visible: !0 } : { visible: !1 }, _ = ys(u.value, X, Y);
      _.patch && P.push(_.patch);
    });
    const fe = Nt(x, H), D = ht(
      Ot(h.editorMetaById, P),
      H
    ), Q = Ve(
      be,
      H,
      D,
      be.source
    ), pe = j !== h.focusId ? j : Q.activeId, ce = wo(fe, P), ke = ce.length > 0 ? "changed" : "noop";
    return nt(n, h, at(h, {
      layout: H,
      editorMetaById: D,
      selection: Q,
      focusId: pe
    }), {
      status: ke,
      targetIds: l.length > 0 ? l : n.targetIds,
      layoutPatches: fe,
      metadataPatches: P,
      affectedIds: ce,
      selection: e.selectedIds ? h.selection : Q,
      blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
      diagnostics: B
    });
  }, mi = (n, l) => n.kind === "responsive" ? {
    ...n,
    layouts: {
      ...io(n.layouts),
      [n.breakpoint]: de(l)
    }
  } : {
    ...n,
    layout: de(l)
  }, at = (n, l) => ({
    ...l.layout ? mi(n, l.layout) : n,
    editorMetaById: l.editorMetaById ? Bt(l.editorMetaById) : Bt(n.editorMetaById),
    sectionRows: l.sectionRows ? ct(l.sectionRows) : ct(n.sectionRows),
    selection: l.selection ? Ze(l.selection) : Ze(n.selection),
    focusId: l.focusId !== void 0 ? l.focusId : n.focusId
  }), jo = (n) => {
    const l = Qt(n), I = l.candidateLayout || l.placementCandidateLayout || l.afterLayout || l.layout;
    return Array.isArray(I) ? de(I.filter(
      (h) => !!h && typeof h == "object" && typeof h.i == "string"
    )) : null;
  }, gi = (n, l, I) => {
    const h = Qt(n);
    let x = jo(n), g = Bt(I.editorMetaById), P = ct(I.sectionRows), B = Ze(I.selection), H = I.focusId;
    const be = n.type === "delete" || n.type === "section-row-delete" ? "destructive" : cs(n.type) ? "persistence" : n.source === "external" || n.source === "remote" ? "external" : "normal";
    if (!x && n.type === "delete") {
      const j = new Set(l);
      x = E().filter((V) => !j.has(V.i)), l.forEach((V) => {
        delete g[V];
      }), B = Ge(
        B.selectedIds.filter((V) => !j.has(V)),
        n.source === "keyboard" ? "keyboard" : n.source === "pointer" ? "pointer" : "api"
      ), H = Ss(x, l, g);
    }
    if (!x && n.type === "move") {
      const j = U(h.dx) ? h.dx : null, V = U(h.dy) ? h.dy : null, te = U(h.x), fe = U(h.y);
      (j !== null || V !== null || te || fe) && (x = E().map((D) => l.includes(D.i) ? {
        ...D,
        x: te && l.length === 1 ? Math.max(0, Math.floor(h.x)) : Math.max(0, Math.floor(D.x + (j || 0))),
        y: fe && l.length === 1 ? Math.max(0, Math.floor(h.y)) : Math.max(0, Math.floor(D.y + (V || 0)))
      } : D));
    }
    if (!x && n.type === "resize") {
      const j = E(), V = l[0], te = V ? Pe(j, V) : void 0, fe = V ? ee(V) : void 0, D = fe ? Mt(h) : null;
      if (te && fe && D) {
        const Q = U(h.w) ? h.w : te.w + (U(h.dw) ? h.dw : 0), pe = U(h.h) ? h.h : te.h + (U(h.dh) ? h.dh : 0), ce = ko({
          id: `${n.id}:preview-layout`,
          phase: "preview",
          layout: j,
          operation: {
            type: "resize",
            id: V,
            x: U(h.x) ? Math.max(0, Math.floor(h.x)) : void 0,
            y: U(h.y) ? Math.max(0, Math.floor(h.y)) : void 0,
            w: Ne(Q, te.w),
            h: Ne(pe, te.h),
            handle: Fs(h.handle) ? h.handle : "se",
            constraint: fe
          },
          options: D
        });
        x = ce.status === "blocked" || ce.status === "error" ? j : ce.layout;
      } else
        x = j.map((Q) => {
          if (Q.i !== V) return Q;
          const pe = U(h.w) ? h.w : Q.w + (U(h.dw) ? h.dw : 0), ce = U(h.h) ? h.h : Q.h + (U(h.dh) ? h.dh : 0);
          return {
            ...Q,
            x: U(h.x) ? Math.max(0, Math.floor(h.x)) : Q.x,
            y: U(h.y) ? Math.max(0, Math.floor(h.y)) : Q.y,
            w: Ne(pe, Q.w),
            h: Ne(ce, Q.h)
          };
        });
    }
    if (!x && n.type === "add") {
      const j = Array.isArray(h.items) ? h.items : h.item ? [h.item] : [], V = new Set(E().map((D) => D.i)), te = e.idGenerator || dt, fe = j.filter((D) => D && typeof D == "object").map((D, Q) => {
        const pe = D, ce = typeof pe.i == "string" && !V.has(pe.i) ? pe.i : te(typeof pe.i == "string" ? pe.i : `item-${Q + 1}`, V);
        return V.add(ce), {
          ...pe,
          i: ce,
          x: U(pe.x) ? pe.x : 0,
          y: U(pe.y) ? pe.y : 0,
          w: Ne(pe.w, 1),
          h: Ne(pe.h, 1)
        };
      });
      if (fe.length > 0) {
        const D = xt(
          E(),
          fe,
          String(h.strategy || "first-fit"),
          h
        );
        D.failed || (x = D.layout, g = {
          ...g,
          ...Me(h.editorMetaById, { layout: fe })
        }, B = Ge(fe.map((Q) => Q.i), "api"), H = B.activeId);
      }
    }
    if (!x && n.type === "paste") {
      const j = h.resolvedClipboardPayload && typeof h.resolvedClipboardPayload == "object" ? h.resolvedClipboardPayload : null;
      if (j != null && j.items && Array.isArray(j.items)) {
        const V = {
          version: 2,
          sourceId: typeof j.sourceId == "string" ? j.sourceId : n.id,
          copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
          items: de(j.items),
          editorMetaById: Me(j.editorMetaById),
          source: j.source,
          originalGeometryById: j.originalGeometryById
        }, te = j.mapped === !0 ? de(V.items) : Io(V, {
          cols: b(h)
        }).items, fe = j.mapped === !0 ? {
          items: te,
          metaById: Me(j.editorMetaById, {
            layout: te
          })
        } : Ht(
          te,
          Me(j.editorMetaById),
          new Set(E().map((Q) => Q.i)),
          e.idGenerator || dt
        ), D = xt(
          E(),
          fe.items,
          String(h.strategy || e.pasteStrategy || "offset"),
          h
        );
        D.failed || (x = D.layout, g = { ...g, ...fe.metaById }, B = Ge(fe.items.map((Q) => Q.i), "api"), H = B.activeId);
      }
    }
    if (!x && n.type === "duplicate") {
      const j = l.map((fe) => Pe(E(), fe)).filter(Boolean), V = Ht(
        j,
        g,
        new Set(E().map((fe) => fe.i)),
        e.idGenerator || dt
      ), te = xt(
        E(),
        V.items,
        String(h.strategy || e.pasteStrategy || "offset"),
        h
      );
      te.failed || (x = te.layout, g = { ...g, ...V.metaById }, B = Ge(V.items.map((fe) => fe.i), "api"), H = B.activeId);
    }
    if (!x && n.type === "align") {
      const j = $s(E(), h, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: U(h.cols) ? h.cols : 12,
        maxRows: U(h.maxRows) ? h.maxRows : 1 / 0
      });
      j.status !== "blocked" && (x = j.layout);
    }
    if (!x && (n.type === "distribute" || n.type === "tidy")) {
      const j = n.type === "distribute" ? Gs(E(), h, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: U(h.cols) ? h.cols : 12,
        maxRows: U(h.maxRows) ? h.maxRows : 1 / 0
      }) : zs(E(), h, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: U(h.cols) ? h.cols : 12,
        maxRows: U(h.maxRows) ? h.maxRows : 1 / 0
      });
      j.status !== "blocked" && (x = j.layout);
    }
    if (fs(n.type) && l.forEach((j) => {
      const V = n.type === "lock" ? { locked: !0 } : n.type === "unlock" ? { locked: !1 } : n.type === "show" ? { visible: !0 } : { visible: !1 }, te = ys(g, j, V);
      te.patch && (g = Ot(g, [te.patch]));
    }), n.type === "select" ? (B = Ms(E(), v.value, {
      id: typeof h.id == "string" ? h.id : void 0,
      ids: Array.isArray(h.ids) ? h.ids.filter((j) => typeof j == "string") : typeof h.id == "string" ? void 0 : l,
      toggle: h.toggle === !0,
      range: h.range === !0,
      source: n.source === "keyboard" ? "keyboard" : n.source === "pointer" ? "pointer" : "api"
    }), H = B.activeId) : n.type === "clearSelection" && (B = Co("api"), H = null), us(n.type)) {
      const j = h, V = He(P, E()), te = l.length > 0 ? l : j.id ? [j.id] : [];
      if (te.filter((D) => !V.items[D]).length === 0) {
        const D = ct({
          items: V.items,
          itemMembership: V.itemMembership
        }), Q = St(V, te);
        if (n.type === "section-row-collapse" || n.type === "section-row-expand") {
          const ce = n.type === "section-row-collapse";
          te.forEach((ke) => {
            D.items[ke] = { ...D.items[ke], collapsed: ce };
          }), ce && (B = Ge(
            B.selectedIds.filter((ke) => !Q.includes(ke)),
            "api"
          ), H = B.activeId);
        } else if (n.type === "section-row-reorder")
          te.forEach((ce) => {
            D.items[ce] = {
              ...D.items[ce],
              order: Wt(V, j)
            };
          });
        else if (n.type === "section-row-move") {
          const ce = U(j.dy) ? Math.floor(j.dy) : 0;
          x = (x || E()).map(
            (ke) => Q.includes(ke.i) ? { ...ke, y: Math.max(0, ke.y + ce) } : ke
          ), te.forEach((ke) => {
            const Re = D.items[ke];
            D.items[ke] = {
              ...Re,
              bounds: Re.bounds ? { ...Re.bounds, y: Math.max(0, Re.bounds.y + ce) } : Re.bounds
            };
          });
        } else n.type === "section-row-delete" && (te.forEach((ce) => {
          delete D.items[ce];
        }), Object.keys(D.itemMembership || {}).forEach((ce) => {
          var Gt, zt;
          const ke = ((Gt = D.itemMembership) == null ? void 0 : Gt[ce]) || {}, Re = {
            sectionId: ke.sectionId && te.includes(ke.sectionId) ? void 0 : ke.sectionId,
            rowId: ke.rowId && te.includes(ke.rowId) ? void 0 : ke.rowId
          };
          !Re.sectionId && !Re.rowId ? (zt = D.itemMembership) == null || delete zt[ce] : D.itemMembership && (D.itemMembership[ce] = Re);
        }), j.deleteItems === !0 && (x = (x || E()).filter((ce) => !Q.includes(ce.i)), Q.forEach((ce) => {
          delete g[ce];
        }), B = Ge(
          B.selectedIds.filter((ce) => !Q.includes(ce)),
          "api"
        ), H = B.activeId));
        const pe = He(D, x || E());
        P = {
          version: 1,
          items: pe.items,
          itemMembership: pe.itemMembership
        };
      }
    }
    return Os(I, at(I, {
      layout: x || void 0,
      editorMetaById: g,
      sectionRows: P,
      selection: B,
      focusId: H
    }), {
      risk: be
    });
  }, mt = Wr({
    beforeCommand: e.beforeCommand,
    guardTimeoutMs: e.guardTimeoutMs,
    getSnapshot: W,
    getStateRevision: () => M,
    check: (n) => ls(n, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: u.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    }),
    getGuardContext: (n, l, I, h) => {
      const x = Qt(n), g = x.placementSummary && typeof x.placementSummary == "object" ? x.placementSummary : void 0;
      return {
        source: n.source || "api",
        origin: n.origin,
        targetIds: l.allowedIds,
        layout: E(),
        layouts: Oe(),
        editorMetaById: u.value,
        sectionRows: m.value,
        selection: v.value,
        mode: c.value,
        history: {
          canUndo: !!(J != null && J.canUndo.value),
          canRedo: !!(J != null && J.canRedo.value)
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
    buildPreview: (n, l, I) => gi(n, l.allowedIds, I),
    cleanupInteraction: () => {
      K.value = null, Fe("command-cleanup");
    },
    finalize: Ye,
    now: Ls,
    isStopped: () => w.value,
    onStart: (n) => {
      n.source === "keyboard" && ho(n.type) && (K.value = "keyboardEditing"), z({ type: "command-start", command: n });
    },
    commit: async ({ command: n, check: l, before: I, startedAt: h, guardMs: x }) => {
      try {
        if (cs(n.type)) {
          const P = n.type === "save" ? await st.save() : n.type === "discard" ? st.discard() : st.reset();
          return P.status === "changed" && (ie.value = W(), A.value = !1), Ye(n, { ...P, id: n.id }, h, x);
        }
        if (Ai(n.type)) {
          const P = n.type === "undo" ? J == null ? void 0 : J.undo() : J == null ? void 0 : J.redo();
          return P ? (ve(n.type === "undo" ? P.before : P.after), Ye(n, Ie(n, "changed", {
            affectedIds: P.affectedIds || P.after.selection.selectedIds,
            selection: v.value,
            undo: P,
            diagnostics: {
              durationMs: 0,
              historyMode: "ignore",
              source: n.source,
              origin: n.origin
            }
          }), h, x)) : Ye(n, Ie(n, "blocked", {
            blocked: { reason: "missing-item", message: "No editor history entry is available." }
          }), h, x);
        }
        const g = await mo(n, l.allowedIds, l.blockedIds, I);
        return Ye(n, g, h, x);
      } catch (g) {
        return g instanceof ut ? Ye(n, Ie(n, "blocked", {
          targetIds: l.targetIds,
          blocked: {
            reason: g.code,
            itemIds: l.targetIds,
            message: g.message
          },
          error: { message: g.message, cause: g }
        }), h, x) : Ye(
          n,
          ds(n, "Editor command failed.", g),
          h,
          x
        );
      }
    }
  }), No = (n) => {
    if (w.value || O > 0) return;
    mt.abortPending(n), K.value = null, Fe(n), M += 1;
    const l = E(), I = ht(u.value, l);
    Ke(I, u.value) || (u.value = I);
    const h = Ve(
      v.value,
      l,
      u.value,
      "external"
    );
    v.value = h, L.value = h.activeId, J == null || J.replacePresent(W(), { preserveRedoStack: !0 });
  };
  e.layout && R.push(vt(r, () => {
    No("external-layout");
  }, { deep: !0, flush: "sync" })), e.layouts && R.push(vt(a, () => {
    No("external-layouts");
  }, { deep: !0, flush: "sync" }));
  const gt = async (n) => mt.execute(n), hi = (n) => {
    var g;
    const l = ro(n.type), I = Ks({
      source: l.defaultSource,
      ...n,
      history: n.history || l.defaultHistory
    }), h = ls(I, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: u.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    });
    if (h.result) return h.result;
    const x = (g = l.validatePayload) == null ? void 0 : g.call(l, I);
    return x && !x.ok ? so(I, "invalid-input", {
      targetIds: h.targetIds,
      blocked: {
        reason: "invalid-input",
        itemIds: h.targetIds,
        message: x.message
      }
    }) : Ie(I, "noop", {
      targetIds: h.allowedIds
    });
  }, vi = async (n) => {
    var P, B, H, be, j, V, te;
    const l = n.commandType || (n.source === "paste" ? "paste" : "add");
    if (f)
      return Te(l, "editor-mode-missing", "Editor mode is not configured.");
    if (c.value === "view")
      return Te(l, "mode-readonly", "Placement requires edit mode.");
    if (w.value)
      return Te(l, "unsupported-scope", "Editor controller is stopped.");
    if (K.value)
      return Te(l, "unsupported-scope", `Cannot start placement while ${K.value}.`);
    if (k.value)
      return Te(l, "command-pending", "A placement session is already active.");
    let I = {
      ...n,
      commandType: l
    };
    const h = Mt({
      cols: n.cols,
      maxRows: n.maxRows,
      compactType: n.compactType,
      allowOverlap: n.allowOverlap,
      preventCollision: n.preventCollision
    });
    if (n.source === "paste" || l === "paste") {
      const fe = Se();
      let D = null, Q = null;
      try {
        D = await fe.read();
      } catch (Re) {
        Q = Re;
      }
      if ((!D || Q) && fe !== bt)
        try {
          D = await bt.read();
        } catch (Re) {
          Q || (Q = Re);
        }
      if (!D && Q) {
        const Re = Q instanceof ut ? Q.code : "clipboard-invalid";
        return Te(
          "paste",
          Re,
          Q instanceof Error ? Q.message : "Clipboard could not be read."
        );
      }
      if (!D || D.items.length === 0)
        return Te(
          "paste",
          "clipboard-unavailable",
          "Clipboard is empty or unavailable."
        );
      const pe = Io(D, {
        cols: (P = n.cols) != null ? P : h == null ? void 0 : h.cols
      }), ce = Ht(
        pe.items,
        D.editorMetaById,
        new Set(E().map((Re) => Re.i)),
        e.idGenerator || dt
      ), ke = {
        items: ce.items,
        editorMetaById: ce.metaById,
        sourceId: D.sourceId,
        source: D.version === 2 ? D.source : void 0,
        originalGeometryById: D.version === 2 ? D.originalGeometryById : void 0,
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
      I = Qe(I);
    const x = {
      ...I,
      compactType: (B = I.compactType) != null ? B : h == null ? void 0 : h.compactType,
      allowOverlap: (H = I.allowOverlap) != null ? H : h == null ? void 0 : h.allowOverlap,
      preventCollision: (be = I.preventCollision) != null ? be : h == null ? void 0 : h.preventCollision
    }, g = In(x, {
      baseLayout: E(),
      baseRevision: M,
      defaultStrategy: x.strategy || (l === "paste" ? e.pasteStrategy || "offset" : "first-fit"),
      cols: x.cols,
      maxRows: x.maxRows
    });
    return g.items.length === 0 || g.blocked && g.ghostItems.length === 0 ? Te(
      l,
      ((j = g.blocked) == null ? void 0 : j.reason) || "invalid-input",
      ((V = g.blocked) == null ? void 0 : V.message) || "No items were provided for placement.",
      (te = g.blocked) == null ? void 0 : te.itemIds,
      Ce(g)
    ) : (k.value = g, z({ type: "placement-start", session: g }), {
      status: g.blocked ? "blocked" : "started",
      session: g,
      blocked: g.blocked ? {
        reason: g.blocked.reason,
        itemIds: g.blocked.itemIds,
        message: g.blocked.message
      } : void 0,
      diagnostics: Ce(g)
    });
  }, bi = (n) => {
    const l = k.value;
    if (!l)
      return { status: "noop" };
    const I = $o(l, n);
    return k.value = I, z({ type: "placement-update", session: I }), {
      status: I.blocked ? "blocked" : "updated",
      session: I,
      blocked: I.blocked ? {
        reason: I.blocked.reason,
        itemIds: I.blocked.itemIds,
        message: I.blocked.message
      } : void 0,
      diagnostics: Ce(I)
    };
  }, Ii = (n = "cancelled") => {
    const l = k.value;
    if (!l) return { status: "noop" };
    const I = wn(l, n);
    return Fe(n), I;
  }, xi = (n) => {
    var I;
    const l = (I = n.blocked) == null ? void 0 : I.reason;
    return n.status === "blocked" && (l === "bounds" || l === "collision" || l === "maxRows" || l === "section-row-policy" || l === "invalid-input");
  }, wi = async (n = {}) => {
    var g, P, B, H, be, j, V, te, fe;
    const l = k.value;
    if (!l)
      return Ie({
        id: `placement-commit:noop:${Date.now()}`,
        type: "add"
      }, "noop");
    if (!l.candidateLayout || l.blocked) {
      const D = Ie({
        id: `placement-commit:blocked:${l.id}`,
        type: l.commandType
      }, "blocked", {
        targetIds: l.items.map((Q) => Q.i),
        blocked: {
          reason: ((g = l.blocked) == null ? void 0 : g.reason) || "invalid-input",
          itemIds: ((P = l.blocked) == null ? void 0 : P.itemIds) || l.items.map((Q) => Q.i),
          message: ((B = l.blocked) == null ? void 0 : B.message) || "Placement does not have a valid candidate."
        },
        diagnostics: Ce(l)
      });
      return F.value = D, D;
    }
    if (M !== l.baseRevision) {
      const D = Ce(l) || { durationMs: 0 }, Q = Ie({
        id: `placement-commit:stale:${l.id}`,
        type: l.commandType
      }, "blocked", {
        targetIds: l.items.map((pe) => pe.i),
        blocked: {
          reason: "stale-command",
          itemIds: l.items.map((pe) => pe.i),
          message: "Placement base layout changed before commit."
        },
        diagnostics: {
          ...D,
          durationMs: D.durationMs || 0,
          stale: !0,
          stateRevision: M
        }
      });
      return F.value = Q, Fe("stale-command"), Q;
    }
    const I = {
      ...l,
      phase: "committing",
      ghostItems: l.ghostItems.map((D) => ({ ...D, state: "committing" }))
    };
    k.value = I;
    const h = xn(I, n), x = await gt(h);
    if (z({ type: "placement-commit", sessionId: I.id, result: x }), x.status === "changed" || x.status === "noop" || (n == null ? void 0 : n.autoCancelOnBlocked) === !0 || !xi(x))
      Fe(x.status);
    else {
      const D = $o(l, {});
      k.value = {
        ...D,
        blocked: {
          reason: ((H = x.blocked) == null ? void 0 : H.reason) || ((be = D.blocked) == null ? void 0 : be.reason) || "invalid-input",
          itemIds: ((j = x.blocked) == null ? void 0 : j.itemIds) || ((V = D.blocked) == null ? void 0 : V.itemIds),
          message: ((te = x.blocked) == null ? void 0 : te.message) || ((fe = D.blocked) == null ? void 0 : fe.message),
          recoverable: !0
        },
        phase: "blocked"
      };
    }
    return x;
  }, Ko = (n) => Ft(n, "ignore"), Xo = (n) => {
    var l;
    if (J) {
      if (n.mode === "clear") {
        J.clear(W());
        return;
      }
      if (n.mode === "replace") {
        J.replacePresent(W(), {
          preserveRedoStack: n.preserveRedoStack
        });
        return;
      }
      J.replacePresent(W(), {
        preserveRedoStack: (l = n.preserveRedoStack) != null ? l : !0
      });
    }
  }, ki = (n, l = "external", I = {}) => {
    const h = Ko(I.history);
    mt.abortPending(I.origin || l), K.value = null, me(n), M += 1, u.value = ht(u.value, n), it(Ve(v.value, n, u.value, "external")), Xo(h), z({
      type: "editor-state-change",
      state: Je.value,
      reason: I.origin || l
    });
  }, Mi = (n, l, I = "external", h = {}) => {
    const x = Ko(h.history);
    mt.abortPending(h.origin || I), K.value = null, ze(n, l);
    const g = n[l] || [];
    M += 1, u.value = ht(u.value, g), it(Ve(v.value, g, u.value, "external")), Xo(x), z({
      type: "editor-state-change",
      state: Je.value,
      reason: h.origin || I
    });
  };
  f && z({
    type: "editor-error",
    code: "editor-mode-missing",
    message: "Grid editor was enabled without mode or defaultMode; falling back to view."
  });
  let Yo = E();
  R.push(vt(c, (n, l) => {
    n !== l && (n === "view" && K.value ? (K.value = null, me(Yo)) : Yo = E(), n === "view" && (S.value = { ...xo }, Fe("mode-readonly")), z({ type: "mode-change", from: l, to: n, source: "external" }));
  })), R.push(vt(() => Je.value, (n, l) => {
    n !== l && z({
      type: "editor-state-change",
      state: n,
      previous: l,
      reason: "derived-state"
    });
  })), e.selectedIds && R.push(vt(e.selectedIds, (n) => {
    mt.abortPending("external-selection"), M += 1, v.value = Ve(
      Ge(n, "external"),
      E(),
      u.value,
      "external"
    ), L.value = v.value.activeId, J == null || J.replacePresent(W(), { preserveRedoStack: !0 });
  }, { flush: "sync" })), R.push(vt(u, (n) => {
    const l = Me(n, { layout: E() });
    Ke(l, n) || (u.value = l);
  }, { deep: !0 })), R.push(vt(m, (n) => {
    const l = He(n, E()), I = {
      version: 1,
      items: l.items,
      itemMembership: l.itemMembership
    };
    Ke(I, n) || (m.value = I);
    const h = v.value.selectedIds.filter((x) => {
      const g = l.itemMembership[x], P = g != null && g.sectionId ? l.items[g.sectionId] : void 0, B = g != null && g.rowId ? l.items[g.rowId] : void 0;
      return (P == null ? void 0 : P.collapsed) || (B == null ? void 0 : B.collapsed);
    });
    h.length > 0 && it(Ge(
      v.value.selectedIds.filter((x) => !h.includes(x)),
      "api"
    ));
  }, { deep: !0 }));
  const _o = {
    mode: c,
    state: Je,
    selection: v,
    editorMetaById: u,
    sectionRows: m,
    placementSession: k,
    dirty: pt,
    conflict: C,
    guides: S,
    lastResult: F,
    subscribe: q,
    createRollbackCheckpoint: We,
    restoreRollbackCheckpoint: qe,
    execute: gt,
    canExecute: hi,
    beginPlacement: vi,
    updatePlacement: bi,
    commitPlacement: wi,
    cancelPlacement: Ii,
    getToolbarState: () => Cn(_o),
    undo: () => gt({ type: "undo", source: "api" }),
    redo: () => gt({ type: "redo", source: "api" }),
    save: () => gt({ type: "save", source: "api" }),
    discard: () => gt({ type: "discard", source: "api" }),
    reset: () => gt({ type: "reset", source: "api" }),
    setExternalLayout: ki,
    setExternalLayouts: Mi,
    stop() {
      w.value || (w.value = !0, mt.abortPending("editor-stop"), Fe("editor-stop"), R.forEach((n) => n()), et == null || et.stop(), T.clear());
    }
  };
  return _o;
}, na = yi, Gn = (e) => !!(e && typeof e == "object" && "getBoundingClientRect" in e), zn = (e, t) => {
  const o = Gn(e.currentTarget) ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, s = t.transformScale || 1, r = (e.clientX - o.left) / s, a = (e.clientY - o.top) / s, i = t.itemSize || { w: 1, h: 1 }, f = {
    cols: t.cols,
    margin: t.margin,
    maxRows: t.maxRows,
    rowHeight: t.rowHeight,
    containerWidth: t.width || 0,
    containerPadding: t.containerPadding || t.margin
  }, d = Hi(f, a, r, i.w, i.h);
  return {
    x: d.x,
    y: d.y,
    source: "pointer",
    clientX: e.clientX,
    clientY: e.clientY
  };
};
function An({
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
      const c = t(), y = zn(d, {
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
const eo = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Dn = () => ({
  activeId: null,
  guides: [],
  displayGuides: [],
  debugGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}), pi = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), Ns = (e) => !!(e && typeof e == "object" && !pi(e)), Tn = (e) => typeof e == "function" ? { ...e() || {} } : { ...e || {} }, On = (e, t, o) => ({
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
function Ln({
  props: e,
  layoutRef: t,
  persistenceController: o,
  engineBridge: s,
  getLayout: r,
  getOldDragItem: a,
  getOldResizeItem: i,
  isDropping: f,
  getInteractionState: d
}) {
  const c = e.editor && typeof e.editor == "object" ? e.editor : null, y = (c == null ? void 0 : c.layoutOperationRunner) || ((b) => {
    const $ = `${b.commandId}:layout`;
    return s.isLegacyLayoutEngine() ? On($, b.layout, b.operation) : ko({
      id: $,
      phase: b.phase,
      layout: b.layout,
      operation: b.operation,
      options: s.getLayoutEngineOptions()
    });
  }), u = o || e.persistence || (c == null ? void 0 : c.persistence);
  let p = null;
  const m = c && pi(u) ? u : c && Ns(u) ? Li({
    ...u,
    kind: "layout",
    target: t,
    watchTarget: !1,
    meta: () => ({
      ...Tn(u.meta),
      editor: co(
        (p == null ? void 0 : p.editorMetaById.value) || {},
        p == null ? void 0 : p.sectionRows.value
      )
    }),
    onEvent: (b) => {
      var $;
      if (b.type === "load-success" || b.type === "external-apply") {
        const N = no(b.document);
        N.ok && N.envelope && p && (p.editorMetaById.value = N.envelope.editorMetaById, N.envelope.sectionRows && (p.sectionRows.value = N.envelope.sectionRows)), p == null || p.setExternalLayout(b.value, b.type);
      }
      ($ = u.onEvent) == null || $.call(u, b);
    }
  }) : null, v = !!(c && m && Ns(u));
  p = c ? c.controller || yi({
    ...c,
    kind: "layout",
    layout: t,
    layoutOperationRunner: y,
    itemCapabilities: e.itemCapabilities,
    resizeConstraints: e.resizeConstraints,
    persistence: m || c.persistence
  }) : null;
  let C = null, S = null;
  const k = An({
    controller: p,
    getGeometry: () => ({
      width: e.width || 0,
      cols: e.cols,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      containerPadding: e.containerPadding || e.margin,
      transformScale: e.transformScale || 1,
      compactType: as(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision
    }),
    stopEvent: (b) => {
      b.preventDefault(), b.stopPropagation();
    }
  }), F = () => !!p, K = () => !!(p && p.mode.value === "view"), A = () => !!(p && p.mode.value === "edit"), ae = () => (p == null ? void 0 : p.editorMetaById.value) || {}, L = () => !!(p && (c == null ? void 0 : c.guides) !== !1), w = (b) => {
    var $;
    return ($ = e.itemCapabilities) == null ? void 0 : $[b];
  }, R = (b) => {
    var $;
    return ($ = e.resizeConstraints) == null ? void 0 : $[b];
  }, T = (b) => !!(w(b) || R(b)), M = () => {
    S = null;
  }, O = () => {
    p && (M(), p.guides.value = Dn());
  }, G = (b) => {
    const $ = d();
    return ($ == null ? void 0 : $.activeResizeId) === b ? "resize" : f() ? "drop" : ($ == null ? void 0 : $.activeDragId) === b ? "drag" : "api";
  }, z = (b) => {
    const $ = d(), N = ($ == null ? void 0 : $.activeResizeId) === b ? i() : ($ == null ? void 0 : $.activeDragId) === b ? a() : null;
    return N ? { [b]: eo(N) } : void 0;
  }, q = (b, $, N) => {
    var ne;
    const ee = d(), oe = b === "drag" && (ee != null && ee.dragBlocked) ? {
      reason: ee.dragBlockedReason || "collision",
      itemIds: (ne = ee.dragBlockedItemIds) != null && ne.length ? ee.dragBlockedItemIds : $ ? [$] : void 0,
      message: ee.dragBlockedMessage || void 0
    } : b === "resize" && (ee != null && ee.resizeBlocked) ? { reason: "collision", itemIds: $ ? [$] : void 0 } : void 0;
    return {
      ...c != null && c.guides && typeof c.guides == "object" ? c.guides : {},
      interaction: b,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      startGeometry: $ ? z($) : void 0,
      resizeHandle: N,
      selectionCount: (p == null ? void 0 : p.selection.value.selectedIds.length) || 0,
      blocked: oe
    };
  }, E = (b, $, N, ee) => {
    var ye, Ce;
    if (!p || !c || c.guides === !1) return null;
    const oe = G(b), ne = q(oe, b, ee), Se = Ao({
      layout: r(),
      activeItem: $,
      candidateItem: N,
      selectionIds: p.selection.value.selectedIds,
      metaById: ae(),
      sectionRows: p.sectionRows.value,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      compactType: as(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      interaction: oe,
      startGeometry: ne.startGeometry,
      options: ne
    });
    return p.guides.value = Se.guideState, (ye = c.onEvent) == null || ye.call(c, {
      type: "guide-change",
      guides: p.guides.value.guides,
      activeId: b
    }), (Ce = c.onEvent) == null || Ce.call(c, {
      type: "intelligence-change",
      activeId: b,
      diagnostics: Se.diagnostics
    }), { intelligence: Se, options: ne };
  }, me = (b, $, N, ee, oe) => {
    var Ce;
    const ne = E(b, $, N, oe);
    if (!ne) return N;
    const Se = S == null ? void 0 : S.nextGuideId, ye = Ar(ne.intelligence, N, {
      snap: ne.options.snap,
      layout: ee || r(),
      cols: e.cols,
      maxRows: e.maxRows,
      allowOverlap: e.allowOverlap,
      metaById: ae(),
      previousGuideId: Se
    });
    return (ye.status === "snapped" || Se !== ye.nextGuideId) && ((Ce = c == null ? void 0 : c.onEvent) == null || Ce.call(c, {
      type: "snap-change",
      activeId: b,
      previousGuideId: Se,
      nextGuideId: ye.nextGuideId,
      snapKind: ye.snapKind,
      geometry: ye.geometry
    })), S = ye, ye.status !== "snapped" ? N : {
      ...N,
      ...ye.geometry
    };
  }, Oe = (b, $, N) => N != null && N.locked || $ != null && $.locked ? "locked" : (N == null ? void 0 : N.visible) === !1 || ($ == null ? void 0 : $.visible) === !1 ? "hidden" : N != null && N.static || b.static ? "static-item" : "capability", ze = (b, $, N) => {
    if (b)
      return {
        ...b,
        aspectRatio: b.aspectRatio ? {
          ...b.aspectRatio,
          metrics: b.aspectRatio.metrics || $,
          startGeometry: b.aspectRatio.startGeometry || N
        } : void 0
      };
  }, W = (b, $, N) => {
    var Se;
    const ee = w(b.i), oe = R(b.i);
    if (ee) {
      const ye = eo(i() || b);
      return {
        ...ee,
        resizeConstraint: ze(
          oe ? {
            ...ee.resizeConstraint,
            aspectRatio: oe,
            handlePolicy: ((Se = ee.resizeConstraint) == null ? void 0 : Se.handlePolicy) || {
              allowedHandles: ee.resizeHandles,
              blockedReason: "handle-disabled"
            }
          } : ee.resizeConstraint,
          N,
          ye
        )
      };
    }
    const ne = to(b, ae()[b.i], $);
    return {
      id: ne.id,
      visible: ne.visible,
      editable: ne.editable,
      draggable: ne.draggable,
      resizable: ne.resizable,
      bounded: ne.bounded,
      static: ne.source.layoutStatic === !0,
      locked: ne.locked,
      resizeHandles: ne.resizeHandles || [],
      deletable: ne.deletable,
      duplicatable: ne.duplicatable,
      copyable: ne.copyable,
      resizeConstraint: oe || ne.resizeHandles ? {
        handlePolicy: ne.resizeHandles ? {
          allowedHandles: ne.resizeHandles,
          blockedReason: "handle-disabled"
        } : void 0,
        aspectRatio: oe
      } : void 0,
      sources: ne.source.capabilitySources || {},
      sourceLists: {},
      diagnostics: ne.diagnostics || []
    };
  }, ve = (b) => {
    var ne, Se;
    const $ = T(b.id);
    if (!p && !$)
      return { kind: "allowed", candidate: b.rawCandidate };
    if (p && !A())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [b.id],
        message: "Resize is disabled outside edit mode."
      };
    const N = W(
      b.item,
      { isDraggable: !0, isResizable: !0, isBounded: !0 },
      b.metrics
    );
    if (!N || !N.resizable)
      return {
        kind: "blocked",
        reason: Oe(b.item, ae()[b.id], N),
        ids: [b.id],
        diagnostics: N == null ? void 0 : N.diagnostics
      };
    const ee = ze(
      N.resizeConstraint,
      b.metrics,
      eo(i() || b.item)
    ), oe = (ne = ee == null ? void 0 : ee.handlePolicy) == null ? void 0 : ne.allowedHandles;
    if (oe && oe.indexOf(b.handle) === -1)
      return {
        kind: "blocked",
        reason: "handle-disabled",
        ids: [b.id],
        message: "Resize handle is disabled by item capability policy.",
        diagnostics: N.diagnostics
      };
    if ((Se = ee == null ? void 0 : ee.aspectRatio) != null && Se.enabled) {
      const ye = Oi({
        startItem: {
          ...b.item,
          ...eo(i() || b.item)
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
      return ye.kind === "blocked" ? {
        kind: "blocked",
        reason: ye.reason,
        ids: [b.id],
        diagnostics: ye.diagnostics
      } : {
        kind: "allowed",
        candidate: ye.candidate,
        constraint: ee,
        diagnostics: ye.diagnostics
      };
    }
    return {
      kind: "allowed",
      candidate: b.rawCandidate,
      constraint: ee,
      diagnostics: N.diagnostics
    };
  }, ie = (b) => {
    if (!p) return { kind: "single", id: b.id };
    if (!A())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [b.id],
        activeId: b.id
      };
    const $ = ae();
    if (!to(
      b.item,
      $[b.id],
      { isDraggable: !0, isResizable: !0, isBounded: !0 }
    ).draggable)
      return {
        kind: "blocked",
        reason: Oe(b.item, $[b.id]),
        ids: [b.id],
        activeId: b.id
      };
    const oe = p.selection.value.selectedIds.filter(Boolean), ne = typeof MouseEvent != "undefined" && b.event instanceof MouseEvent && (b.event.metaKey || b.event.ctrlKey || b.event.shiftKey);
    if (!(oe.length > 1 && oe.includes(b.id)))
      return !oe.includes(b.id) && !ne && p.execute({
        type: "select",
        targetIds: [b.id],
        payload: { id: b.id },
        source: "pointer",
        history: { skip: !0 }
      }), { kind: "single", id: b.id };
    const ye = [], Ce = [];
    let Te = "capability";
    return oe.forEach((Qe) => {
      const Fe = Pe(b.layout, Qe);
      if (!Fe) {
        Ce.push(Qe), Te = "missing-item";
        return;
      }
      to(
        Fe,
        $[Qe],
        { isDraggable: !0, isResizable: !0, isBounded: !0 }
      ).draggable ? ye.push(Qe) : (Ce.push(Qe), Te = Oe(Fe, $[Qe]));
    }), Ce.length > 0 && (c == null ? void 0 : c.commandPolicy) !== "skip-blocked" ? {
      kind: "blocked",
      reason: Te,
      ids: Ce,
      activeId: b.id
    } : b.legacyLayoutEngine ? {
      kind: "blocked",
      reason: "unsupported",
      ids: ye,
      activeId: b.id
    } : ye.length === 0 ? {
      kind: "blocked",
      reason: Te,
      ids: Ce.length > 0 ? Ce : [b.id],
      activeId: b.id
    } : {
      kind: "group",
      activeId: b.id,
      ids: ye
    };
  }, J = (b) => {
    var ee;
    if (!p) return;
    const $ = {
      id: `pointer-move-blocked:${b.activeId || b.ids[0] || "layout"}:${Date.now()}`,
      type: "move",
      targetIds: b.ids,
      source: "pointer"
    }, N = Ie($, "blocked", {
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
    p.lastResult.value = N, (ee = c == null ? void 0 : c.onEvent) == null || ee.call(c, { type: "command-blocked", command: $, result: N });
  }, We = (b) => {
    t.value = de(b);
  }, qe = (b) => {
    (b == null ? void 0 : b.status) === "changed" && (m == null || m.commit(t.value, { source: "component" }));
  }, pt = async (b) => {
    if (!p) return null;
    We(b.beforeLayout);
    const $ = await p.execute({
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
    return qe($), $;
  }, Je = async (b) => {
    if (!p) return null;
    We(b.beforeLayout);
    const $ = await p.execute({
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
    return qe($), $;
  }, et = async (b) => {
    if (!p) return null;
    We(b.beforeLayout);
    const $ = await p.execute({
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
    return qe($), $;
  }, st = (b) => {
    We(b), O();
  }, it = (b, $ = "push") => {
    const N = c == null ? void 0 : c.legacyHistoryStore;
    N && ($ === "replace" ? N.replacePresent(b) : N.push(b));
  }, Ye = (b, $) => {
    !p || !A() || p.execute({
      type: "select",
      targetIds: [b],
      payload: {
        id: b,
        toggle: $.metaKey || $.ctrlKey,
        range: $.shiftKey
      },
      source: "pointer"
    });
  }, we = (b) => {
    const $ = p == null ? void 0 : p.placementSession.value;
    if (!$ || $.collisionPolicy !== "layout" || $.blocked || !$.candidateLayout || $.phase === "starting" || $.ghostItems.some((ee) => ee.id === b.i)) return null;
    const N = Pe($.candidateLayout, b.i);
    return !N || N.x === b.x && N.y === b.y && N.w === b.w && N.h === b.h ? null : N;
  }, rt = (b, $, N) => {
    const ee = ae()[b.i], oe = p || T(b.i) ? W(b, $) : null, ne = typeof b.isDraggable == "boolean" ? b.isDraggable : !b.static && $.isDraggable, Se = typeof b.isResizable == "boolean" ? b.isResizable : !b.static && $.isResizable, ye = !((oe == null ? void 0 : oe.visible) === !1 && !N), Ce = K() || !!(p && !(oe != null && oe.editable)), Te = oe ? (p ? A() : ne) && oe.draggable : ne, Qe = oe ? (p ? A() : Se) && oe.resizable : Se, Fe = Te && (oe ? oe.bounded : $.isBounded && b.isBounded !== !1), Ut = (p == null ? void 0 : p.selection.value.selectedIds.includes(b.i)) || !1, po = (p == null ? void 0 : p.selection.value.activeId) === b.i, St = we(b), Wt = p ? lt({
      "editor-selected": Ut,
      "editor-active": po,
      "editor-locked": oe == null ? void 0 : oe.locked,
      "editor-hidden": (ee == null ? void 0 : ee.visible) === !1,
      "editor-readonly": Ce,
      "editor-keyboard-editing": p.state.value === "keyboardEditing",
      "editor-drop-target": N,
      "editor-placement-reflowed": !!St
    }) : void 0;
    return {
      visible: ye,
      draggable: Te,
      resizable: Qe,
      bounded: Fe,
      resizeHandles: oe == null ? void 0 : oe.resizeHandles,
      capabilityDiagnostics: oe == null ? void 0 : oe.diagnostics,
      className: Wt,
      previewItem: St,
      onClick: p ? (mo) => Ye(b.i, mo) : void 0
    };
  }, yo = (b) => {
    k.onClick(b) || b.target === b.currentTarget && p && A() && p.execute({ type: "clearSelection", source: "pointer" });
  }, _t = (b) => {
    k.onPointerMove(b);
  }, nt = () => {
    p && (c == null ? void 0 : c.keyboard) !== !1 && (C = qi(
      p,
      typeof (c == null ? void 0 : c.keyboard) == "object" ? c.keyboard : {}
    )), v && (m == null || m.load().then((b) => {
      b.value && b.fallbackApplied && (p == null || p.setExternalLayout(b.value, "persistence-fallback"));
    }));
  }, Mt = () => {
    C == null || C(), C = null, k.cancel("runtime-stop"), c != null && c.controller ? v && (m == null || m.stop()) : p == null || p.stop();
  };
  return {
    config: c,
    controller: p,
    isEnabled: F,
    isViewMode: K,
    isEditMode: A,
    guidesEnabled: L,
    getMetaById: ae,
    clearGuides: O,
    resetSnap: M,
    snapCandidate: me,
    updateIntelligence: E,
    resolveMoveDrag: ie,
    resolveResizeIntent: ve,
    notifyMoveBlocked: J,
    commitMove: pt,
    commitResize: Je,
    commitDrop: et,
    rollbackInteraction: st,
    syncHistory: it,
    getItemRenderState: rt,
    isPlacementActive: k.isActive,
    onRootPointerMove: _t,
    onRootClick: yo,
    mount: nt,
    stop: Mt
  };
}
function Hn({
  width: e,
  margin: t,
  containerPadding: o,
  rowHeight: s,
  renderPrecision: r = "integer",
  cols: a,
  maxRows: i
}) {
  const f = o, d = Fi({
    cols: a,
    containerPadding: f,
    containerWidth: e,
    margin: t
  }), c = (M) => ji(M, r), y = (M) => c(f[0] + M * (d + t[0])), u = (M) => c(f[1] + M * (s + t[1])), p = (M) => c(f[0] + M * (d + t[0]) - t[0] / 2), m = (M) => c(f[1] + M * (s + t[1]) - t[1] / 2), v = (M) => c(y(M) - t[0]), C = (M) => c(u(M) - t[1]);
  return {
    padding: f,
    colWidth: d,
    gridLineXPx: y,
    gridLineYPx: u,
    guideXPx: (M) => M.kind === "right" ? v(M.position) : M.kind === "center-x" ? p(M.position) : y(M.position),
    guideYPx: (M) => M.kind === "bottom" ? C(M.position) : M.kind === "center-y" ? m(M.position) : u(M.position),
    spanXPx: (M, O) => ({
      start: y(M),
      end: v(O)
    }),
    spanYPx: (M, O) => ({
      start: u(M),
      end: C(O)
    }),
    spacingXPx: (M, O) => ({
      start: v(M),
      end: y(O)
    }),
    spacingYPx: (M, O) => ({
      start: C(M),
      end: u(O)
    }),
    itemLeftPx: (M) => c(f[0] + M * (d + t[0])),
    itemTopPx: (M) => c(f[1] + M * (s + t[1])),
    itemWidthPx: (M) => c(Math.max(0, M * d + Math.max(0, M - 1) * t[0])),
    itemHeightPx: (M) => c(Math.max(0, M * s + Math.max(0, M - 1) * t[1]))
  };
}
function Fn({
  enabled: e,
  geometry: t,
  guideState: o,
  placementSession: s,
  itemMap: r,
  layout: a
}) {
  if (!e) return [];
  const {
    guideXPx: i,
    guideYPx: f,
    spanXPx: d,
    spanYPx: c,
    spacingXPx: y,
    spacingYPx: u,
    itemLeftPx: p,
    itemTopPx: m,
    itemWidthPx: v,
    itemHeightPx: C
  } = t, S = () => {
    var O;
    if (!o) return [];
    const w = o.displayGuides || o.guides, R = (G) => {
      const z = G.display;
      if ((z == null ? void 0 : z.kind) === "spacing" && G.kind === "spacing-x") {
        const E = y(z.start, z.end);
        return {
          left: `${E.start}px`,
          top: `${f(G)}px`,
          width: `${Math.max(1, E.end - E.start)}px`
        };
      }
      if ((z == null ? void 0 : z.kind) === "spacing" && G.kind === "spacing-y") {
        const E = u(z.start, z.end);
        return {
          left: `${i(G)}px`,
          top: `${E.start}px`,
          height: `${Math.max(1, E.end - E.start)}px`
        };
      }
      if (G.axis === "x") {
        const E = z ? c(z.start, z.end) : null;
        return z ? {
          left: `${i(G)}px`,
          top: `${(E == null ? void 0 : E.start) || 0}px`,
          height: `${Math.max(1, ((E == null ? void 0 : E.end) || 0) - ((E == null ? void 0 : E.start) || 0))}px`
        } : {
          left: `${i(G)}px`,
          top: 0,
          bottom: 0
        };
      }
      const q = z ? d(z.start, z.end) : null;
      return z ? {
        top: `${f(G)}px`,
        left: `${(q == null ? void 0 : q.start) || 0}px`,
        width: `${Math.max(1, ((q == null ? void 0 : q.end) || 0) - ((q == null ? void 0 : q.start) || 0))}px`
      } : {
        top: `${f(G)}px`,
        left: 0,
        right: 0
      };
    }, T = (G, z = !1) => {
      var W, ve;
      const q = o.snappedGuideIds.includes(G.id) || G.isSnapped === !0, E = G.kind === "spacing-x" || G.kind === "spacing-y", me = typeof G.proximity == "number" ? G.proximity : q ? 1 : 0.4, Oe = q ? 1 : Math.max(0.18, 0.18 + me * 0.62), ze = {
        ...R(G)
      };
      return !z && !q && (ze.opacity = String(Math.round(Oe * 100) / 100)), Le("div", {
        key: `${z ? "debug-" : ""}${G.id}`,
        class: lt(z ? "vue-grid-editor-debug-guide" : "vue-grid-editor-guide", `vue-grid-editor-guide-${G.axis}`, {
          "vue-grid-editor-guide-active": q,
          "vue-grid-editor-guide-snapped": q,
          "vue-grid-editor-guide-predict": !q && !z,
          "vue-grid-editor-spacing-guide": E,
          "vue-grid-editor-alignment-guide": !E,
          "vue-grid-editor-guide-with-label": (W = G.display) == null ? void 0 : W.showLabel
        }),
        style: ze,
        "data-guide-id": G.id,
        "data-guide-kind": G.kind,
        "data-guide-role": E ? "spacing" : "alignment",
        "data-guide-state": q ? "snapped" : "predict",
        "data-guide-proximity": String(Math.round(me * 100) / 100),
        "data-guide-debug": z ? "true" : void 0,
        "data-guide-source-ids": G.sourceIds.join(",")
      }, (ve = G.display) != null && ve.showLabel && G.display.label ? [Le("span", {
        class: "vue-grid-editor-guide-label"
      }, G.display.label)] : void 0);
    }, M = w.map((G) => T(G));
    return o.debug && o.debugMode === "layer" && ((O = o.debugGuides) != null && O.length) ? M.push(Le("div", {
      key: "debug-guides-layer",
      class: "vue-grid-editor-debug-layer",
      "data-guide-debug-layer": "true"
    }, o.debugGuides.map((G) => T(G, !0)))) : o.debug && o.debugMode === "panel" && M.push(Le("div", {
      key: "debug-guides-panel",
      class: "vue-grid-editor-debug-panel",
      "data-guide-debug-panel": "true"
    }, `Debug guides: ${o.guides.length} candidates, ${w.length} shown`)), M;
  }, k = () => {
    if (!o) return [];
    const w = o.spacingChips || [];
    return w.length === 0 ? [] : w.map((R) => {
      const T = R.axis === "x", M = T ? y(R.span.start, R.span.end) : u(R.span.start, R.span.end), O = M.start, G = M.end, z = Math.max(1, G - O), q = T ? f({
        kind: "center-y",
        axis: "y",
        position: R.position
      }) : i({
        kind: "center-x",
        axis: "x",
        position: R.position
      }), E = T ? {
        left: `${O}px`,
        top: `${q}px`,
        width: `${z}px`
      } : {
        top: `${O}px`,
        left: `${q}px`,
        height: `${z}px`
      }, me = `${R.distance} ${R.unit}${R.distance === 1 ? "" : "s"}`;
      return Le("div", {
        key: R.id,
        class: lt("vue-grid-editor-spacing-chip", `vue-grid-editor-spacing-chip-${R.side}`, `vue-grid-editor-spacing-chip-${R.axis}`, {
          "vue-grid-editor-spacing-chip-equal": R.isEqual
        }),
        style: E,
        "data-chip-id": R.id,
        "data-chip-side": R.side,
        "data-chip-equal": R.isEqual ? "true" : "false",
        "data-chip-neighbor": R.neighborId || "edge"
      }, [Le("span", {
        class: "vue-grid-editor-spacing-chip-label"
      }, me)]);
    });
  }, F = () => {
    var z, q, E, me;
    if (!o) return null;
    const w = o.measurementHud;
    if (!w) return null;
    const R = p(w.position.x) + v(w.size.w), T = m(w.position.y), M = `${w.size.w}×${w.size.h} · col ${w.position.x}, row ${w.position.y}`, O = [];
    (z = w.delta) != null && z.dw && O.push(`${w.delta.dw > 0 ? "+" : ""}${w.delta.dw} col${Math.abs(w.delta.dw) === 1 ? "" : "s"}`), (q = w.delta) != null && q.dh && O.push(`${w.delta.dh > 0 ? "+" : ""}${w.delta.dh} row${Math.abs(w.delta.dh) === 1 ? "" : "s"}`), (E = w.delta) != null && E.dx && O.push(`x ${w.delta.dx > 0 ? "+" : ""}${w.delta.dx}`), (me = w.delta) != null && me.dy && O.push(`y ${w.delta.dy > 0 ? "+" : ""}${w.delta.dy}`);
    const G = [Le("span", {
      class: "vue-grid-editor-measurement-hud-label"
    }, w.label || w.itemId), Le("span", {
      class: "vue-grid-editor-measurement-hud-dims"
    }, M)];
    return O.length > 0 && G.push(Le("span", {
      class: "vue-grid-editor-measurement-hud-delta"
    }, `Δ ${O.join(" · ")}`)), w.blocked && G.push(Le("span", {
      class: "vue-grid-editor-measurement-hud-blocked"
    }, w.blockedMessage || w.blocked)), Le("div", {
      key: `hud:${w.itemId}`,
      class: lt("vue-grid-editor-measurement-hud", `vue-grid-editor-measurement-hud-${w.interaction}`, {
        "vue-grid-editor-measurement-hud-blocked-state": !!w.blocked
      }),
      style: {
        left: `${R}px`,
        top: `${T}px`
      },
      "data-hud-item-id": w.itemId,
      "data-hud-interaction": w.interaction,
      "data-hud-blocked": w.blocked || void 0,
      role: "status",
      "aria-live": "polite"
    }, G);
  }, K = () => {
    if (!o) return [];
    const w = o.anchorEdges || [];
    if (w.length === 0) return [];
    const R = [];
    return w.forEach((T) => {
      const M = r.get(T.itemId) || a.find((E) => E.i === T.itemId);
      if (!M) return;
      const O = p(M.x), G = m(M.y), z = v(M.w), q = C(M.h);
      T.sides.forEach((E) => {
        const me = {
          position: "absolute"
        };
        E === "left" ? Object.assign(me, {
          left: `${O}px`,
          top: `${G}px`,
          height: `${q}px`,
          width: "2px"
        }) : E === "right" ? Object.assign(me, {
          left: `${O + z - 2}px`,
          top: `${G}px`,
          height: `${q}px`,
          width: "2px"
        }) : E === "top" ? Object.assign(me, {
          left: `${O}px`,
          top: `${G}px`,
          width: `${z}px`,
          height: "2px"
        }) : E === "bottom" ? Object.assign(me, {
          left: `${O}px`,
          top: `${G + q - 2}px`,
          width: `${z}px`,
          height: "2px"
        }) : E === "center-x" ? Object.assign(me, {
          left: `${O + z / 2 - 1}px`,
          top: `${G}px`,
          height: `${q}px`,
          width: "2px"
        }) : E === "center-y" && Object.assign(me, {
          left: `${O}px`,
          top: `${G + q / 2 - 1}px`,
          width: `${z}px`,
          height: "2px"
        }), R.push(Le("div", {
          key: `anchor:${T.role}:${T.itemId}:${E}`,
          class: lt("vue-grid-editor-anchor-edge", `vue-grid-editor-anchor-edge-${E}`, `vue-grid-editor-anchor-edge-${T.role}`),
          style: me,
          "data-anchor-item-id": T.itemId,
          "data-anchor-side": E,
          "data-anchor-role": T.role
        }));
      });
    }), R;
  }, A = () => s ? s.ghostItems.map((w) => {
    const R = w.item, T = w.state === "blocked" || s.phase === "blocked";
    return Le("div", {
      key: `placement-ghost:${s.id}:${w.id}`,
      class: lt("vue-grid-editor-placement-ghost", `vue-grid-editor-placement-ghost-${w.state}`, {
        "vue-grid-editor-placement-ghost-blocked": T,
        "vue-grid-editor-placement-ghost-committing": w.state === "committing"
      }),
      style: {
        left: `${p(R.x)}px`,
        top: `${m(R.y)}px`,
        width: `${v(R.w)}px`,
        height: `${C(R.h)}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-item-id": w.id,
      "data-placement-state": T ? "blocked" : w.state,
      "data-placement-x": String(R.x),
      "data-placement-y": String(R.y),
      "data-placement-w": String(R.w),
      "data-placement-h": String(R.h),
      "aria-hidden": "true"
    });
  }) : [], ae = () => s ? s.affectedOutlines.map((w) => {
    const R = w.after;
    return Le("div", {
      key: `placement-affected:${s.id}:${w.id}:${w.kind}`,
      class: lt("vue-grid-editor-placement-affected", `vue-grid-editor-placement-affected-${w.kind}`),
      style: {
        left: `${p(R.x)}px`,
        top: `${m(R.y)}px`,
        width: `${v(R.w)}px`,
        height: `${C(R.h)}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-affected-id": w.id,
      "data-placement-outline-kind": w.kind,
      "aria-hidden": "true"
    });
  }) : [], L = () => {
    var G;
    if (!s) return null;
    const w = (G = s.ghostItems[0]) == null ? void 0 : G.item;
    if (!w && !s.blocked) return null;
    const R = w ? p(w.x) + v(w.w) : 0, T = w ? m(w.y) : 0, M = s.blocked, O = M ? M.message || `Placement blocked by ${M.reason}.` : `${s.ghostItems.length} item${s.ghostItems.length === 1 ? "" : "s"}`;
    return Le("div", {
      key: `placement-hud:${s.id}`,
      class: lt("vue-grid-editor-placement-hud", {
        "vue-grid-editor-placement-hud-blocked": !!M
      }),
      style: {
        left: `${R}px`,
        top: `${T}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-state": M ? "blocked" : s.phase,
      role: "status",
      "aria-live": "polite"
    }, O);
  };
  return [...ae(), ...A(), L(), ...K(), ...S(), ...k(), F()].filter(Boolean);
}
const jn = (e) => {
  const t = e.props, o = Ln({
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
      var s, r, a;
      return {
        "editor-enabled": o.isEnabled(),
        "editor-mode-view": o.isEnabled() && o.isViewMode(),
        "editor-mode-edit": o.isEnabled() && o.isEditMode(),
        "editor-placement-active": o.isPlacementActive(),
        "editor-dirty": (s = o.controller) == null ? void 0 : s.dirty.value,
        "editor-conflict": ((r = o.controller) == null ? void 0 : r.state.value) === "conflict",
        "editor-guide-grid": (a = o.controller) == null ? void 0 : a.guides.value.showGrid
      };
    },
    isExternalDropEnabled: (s) => s && !o.isViewMode(),
    onRootPointerMove: o.onRootPointerMove,
    onRootClick: o.onRootClick,
    renderOverlay: (s) => {
      var r, a;
      return Fn({
        enabled: o.guidesEnabled() || o.isPlacementActive(),
        geometry: Hn(s.geometry),
        guideState: (r = o.controller) == null ? void 0 : r.guides.value,
        placementSession: (a = o.controller) == null ? void 0 : a.placementSession.value,
        itemMap: s.itemMap,
        layout: s.layout
      });
    }
  };
}, Nn = {
  ...Ci,
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
}, aa = Si({
  name: "EditorGridLayout",
  props: Nn,
  createRuntimeExtension: jn
});
export {
  ur as A,
  Zs as B,
  oa as C,
  Wi as D,
  aa as E,
  Tr as F,
  ut as G,
  Ss as H,
  bt as I,
  ms as J,
  Io as K,
  ia as L,
  Dr as M,
  Xr as N,
  xt as O,
  no as P,
  ro as Q,
  Ar as R,
  Ve as S,
  Hr as T,
  Ys as U,
  ea as V,
  Yr as W,
  $o as X,
  Ms as Y,
  na as Z,
  $s as a,
  Gs as b,
  zs as c,
  qi as d,
  sa as e,
  xn as f,
  Vs as g,
  wn as h,
  Co as i,
  Cr as j,
  hr as k,
  Qn as l,
  Ao as m,
  _r as n,
  Wr as o,
  yi as p,
  Nr as q,
  Kr as r,
  qr as s,
  co as t,
  ra as u,
  In as v,
  Ge as w,
  Os as x,
  Cn as y,
  ta as z
};
