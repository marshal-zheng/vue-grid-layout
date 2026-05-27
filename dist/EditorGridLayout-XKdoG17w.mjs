import { c as Ri, b as Ei } from "./createGridLayoutComponent-BUqtSi2L.mjs";
import dt from "clsx";
import { e as Pi, a as le, o as Pe, m as $t, l as Bi, k as cs, s as $i, f as Gi, d as zo, i as ds } from "./utils-BCVYGne6.mjs";
import { y as Le, B as zi, C as eo, F as Me, w as Ys, x as Lt, h as to, b as oo, E as Ai, g as xe, H as Oi, i as _s, e as Ft, d as wo, A as ht, r as ls, o as Di, j as us, p as ho, c as fs, a as Ot, s as ys, q as ps, z as ms, G as Ti } from "./commands-BQlR3l-u.mjs";
import { k as Li, f as Hi } from "./migration-CPonYzEY.mjs";
import { ref as Ee, computed as gs, watch as vt, h as Te } from "vue";
import { deepEqual as Ne } from "fast-equals";
import { c as so, u as Fi } from "./persistence-Db97X8w7.mjs";
import { e as ko } from "./core-C45AnvB2.mjs";
import { f as ji, c as Ni, a as Ki } from "./resolve-C3SqJijI.mjs";
const Xi = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", Yi = (e) => !!(e && typeof e == "object"), Us = (e, t = {}) => {
  var a;
  const o = e.target;
  if (!Yi(o)) return !1;
  const s = (a = o.tagName) == null ? void 0 : a.toUpperCase();
  return s === "INPUT" || s === "TEXTAREA" || s === "SELECT" || o.isContentEditable ? !0 : (t.ignoredTargets || []).some((i) => typeof i == "string" ? typeof o.matches == "function" && o.matches(i) : i(o));
}, _i = [
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
], Ui = (e, t) => e.toLowerCase() === t.toLowerCase(), Wi = (e, t, o) => {
  const s = o === "mac" ? e.metaKey : e.ctrlKey, r = o === "mac" ? e.ctrlKey : e.metaKey, a = t.primary === !0;
  return !(a !== s || a && r || !a && (e.ctrlKey || e.metaKey) || (t.shift || !1) !== e.shiftKey || (t.alt || !1) !== e.altKey);
}, qi = (e, t) => {
  const o = Xi(t.platform), s = _i.find(
    (r) => (!r.platform || r.platform === o) && Ui(e.key, r.key) && Wi(e, r, o)
  );
  return s ? typeof s.command == "function" ? s.command(e, t) : { ...s.command } : null;
}, Vi = (e, t = {}) => {
  if (Us(e, t)) return null;
  const o = e.key, s = e.shiftKey ? t.fastMoveStep || 4 : t.moveStep || 1, r = e.shiftKey ? t.fastResizeStep || 2 : t.resizeStep || 1, a = qi(e, t);
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
}, hs = (e) => {
  var o, s, r, a, i;
  return e.status !== "blocked" && e.status !== "error" && e.status !== "timeout" ? null : {
    code: ((o = e.blocked) == null ? void 0 : o.reason) || ((s = e.error) == null ? void 0 : s.message) || "editor-command",
    level: e.status === "error" ? "error" : "warning",
    message: ((r = e.blocked) == null ? void 0 : r.message) || ((a = e.error) == null ? void 0 : a.message) || `Command ${e.type} was not applied.`,
    itemIds: (i = e.blocked) == null ? void 0 : i.itemIds,
    recoverable: e.status !== "error"
  };
}, Zi = (e, t = {}) => {
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
    if (!Us(i, t) && e.placementSession.value) {
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
          const m = hs(p);
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
    const f = Vi(i, t);
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
        const u = hs(y);
        u && ((p = t.ariaMessage) == null || p.call(t, u));
      });
    }
  };
  return s.addEventListener("keydown", r), () => {
    s.removeEventListener("keydown", r);
  };
}, Ji = 2, Qi = 1, er = 0.5, tr = 1, or = 500, sr = 0.01, ir = {
  drag: 3,
  drop: 3,
  placement: 3,
  resize: 2,
  keyboard: 3,
  api: 3
}, vs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, bs = (e) => [
  { kind: "left", axis: "x", position: e.x, priority: 10, edge: "left" },
  { kind: "right", axis: "x", position: e.x + e.w, priority: 11, edge: "right" },
  { kind: "center-x", axis: "x", position: e.x + e.w / 2, priority: 20, edge: "center-x" },
  { kind: "top", axis: "y", position: e.y, priority: 10, edge: "top" },
  { kind: "bottom", axis: "y", position: e.y + e.h, priority: 11, edge: "bottom" },
  { kind: "center-y", axis: "y", position: e.y + e.h / 2, priority: 20, edge: "center-y" }
], rr = (e, t) => {
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
}, Ws = (e, t, o) => {
  var s, r;
  return !(e.static && o.includeStatic === !1 || (s = t[e.i]) != null && s.locked && o.includeLocked === !1 || ((r = t[e.i]) == null ? void 0 : r.visible) === !1 && o.includeHidden !== !0);
}, nr = (e, t) => e.y === t.y || e.y + e.h === t.y + t.h || e.x === t.x || e.x + e.w === t.x + t.w, ar = (e, t, o, s, r, a, i, f) => {
  const d = s.axis === "x" ? Math.min(t.y, o.y) : Math.min(t.x, o.x), c = s.axis === "x" ? Math.max(t.y + t.h, o.y + o.h) : Math.max(t.x + t.w, o.x + o.w), y = Math.abs(s.position - r.position), u = a > 0 ? Math.max(0, Math.min(1, 1 - y / a)) : y === 0 ? 1 : 0, p = y <= i, m = f && nr(t, o) ? 20 : 0;
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
}, ft = (e) => e.kind === "spacing-x" || e.kind === "spacing-y", cr = (e) => e.debug === !0 || e.debug === "layer" || e.debug === "panel", dr = (e) => e.debug === "panel" ? "panel" : e.debug === !0 || e.debug === "layer" ? "layer" : !1, lr = (e, t) => {
  const o = e.maxVisibleGuides;
  return typeof o == "number" ? Math.max(0, o) : o && typeof o[t] == "number" ? Math.max(0, o[t] || 0) : ir[t];
}, ur = (e) => !!(e.display && Number.isFinite(e.display.start) && Number.isFinite(e.display.end) && e.display.end > e.display.start), Is = (e, t) => (t.includes(e.id) ? -1e3 : 0) + (e.isSnapped ? -500 : 0) + (ft(e) ? 20 : 0) - Math.round((e.proximity || 0) * 50), fr = (e, t) => {
  const o = Array.from(/* @__PURE__ */ new Set([...e.sourceIds, ...t.sourceIds])), s = e.anchorIds || t.anchorIds ? Array.from(/* @__PURE__ */ new Set([...e.anchorIds || [], ...t.anchorIds || []])) : void 0;
  return {
    ...e,
    sourceIds: o,
    anchorIds: s,
    display: e.display ? { ...e.display, sourceIds: o } : e.display
  };
}, yr = (e, t = {}, o = []) => {
  var y, u, p, m;
  const s = t.interaction || "drag", r = lr(t, s);
  if (r <= 0) return [];
  const a = e.filter(ur).slice().sort(
    (v, C) => Is(v, o) - Is(C, o) || v.distance - C.distance || v.priority - C.priority || v.id.localeCompare(C.id)
  ), i = /* @__PURE__ */ new Map(), f = [];
  for (let v = 0; v < a.length; v += 1) {
    const C = a[v], S = ft(C) ? `s:${C.kind}:${C.position}:${(u = (y = C.display) == null ? void 0 : y.start) != null ? u : ""}:${(m = (p = C.display) == null ? void 0 : p.end) != null ? m : ""}` : `a:${C.kind}:${C.axis}:${C.position}`, k = i.get(S);
    k ? ft(C) || i.set(S, fr(k, C)) : (i.set(S, C), f.push(S));
  }
  const d = f.slice(0, r).map((v) => i.get(v)).filter(Boolean);
  let c = !1;
  return d.map((v) => {
    if (!v.display) return v;
    const C = t.showSpacingLabels !== !1 && ft(v) && !c;
    return C && (c = !0), {
      ...v,
      display: {
        ...v.display,
        showLabel: C
      }
    };
  });
}, Wt = (e, t, o, s, r) => {
  const a = t.x + t.w, i = t.y + t.h;
  let f = null;
  for (let d = 0; d < o.length; d += 1) {
    const c = o[d];
    if (c.i === t.i || !Ws(c, s, r)) continue;
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
}, pr = (e) => e === "left" || e === "right" ? "x" : "y", mr = (e) => e === "left" || e === "right" ? "col" : "row", gr = (e, t, o, s) => {
  var p;
  if (s.showSpacingChips === !1) return [];
  const r = (p = s.spacingChipMinDistance) != null ? p : tr, a = ["top", "right", "bottom", "left"], i = {
    top: Wt("top", e, t, o, s),
    right: Wt("right", e, t, o, s),
    bottom: Wt("bottom", e, t, o, s),
    left: Wt("left", e, t, o, s)
  }, f = (m, v) => !!(m && v && Math.abs(m.distance - v.distance) <= sr), d = s.detectEqualSpacing !== !1, c = d && f(i.left, i.right), y = d && f(i.top, i.bottom), u = [];
  for (let m = 0; m < a.length; m += 1) {
    const v = a[m], C = i[v];
    if (!C || C.distance < r) continue;
    const S = v === "left" || v === "right" ? c : y;
    u.push({
      id: `chip:${e.i}:${v}:${C.id}`,
      side: v,
      axis: pr(v),
      position: C.position,
      span: C.span,
      distance: C.distance,
      unit: mr(v),
      isEqual: S,
      neighborId: C.id
    });
  }
  return u;
};
function hr(e, t, o) {
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
const vr = (e, t, o) => {
  if (o.highlightAlignmentTargets === !1) return [];
  if (!t) return [];
  const s = e.filter(
    (c) => !ft(c) && c.targetEdge && c.sourceEdge
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
}, br = (e, t, o, s = {}, r = {}) => {
  var E, ge, De, ze;
  const a = vs(), i = r.interaction || "drag";
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
  const f = (E = r.maxItems) != null ? E : or, d = typeof r.thresholdPx == "number" ? r.thresholdPx : null, c = (ge = r.predictRadiusX) != null ? ge : d !== null ? d : Ji, y = (De = r.predictRadiusY) != null ? De : d !== null ? d : Qi, u = (ze = r.snapThresholdCells) != null ? ze : d !== null ? d : er, p = r.sectionSnap !== !1, m = e.filter(
    (W) => W.i !== t.i && Ws(W, s, r)
  ), v = m.length > f, C = v ? m.slice(0, f) : m, S = bs(o), k = [];
  C.forEach((W) => {
    const ve = bs(W);
    S.forEach((ie) => {
      ve.forEach((J) => {
        if (ie.axis !== J.axis) return;
        const _e = Math.abs(ie.position - J.position), Ue = ie.axis === "x" ? c : y;
        _e <= Ue && k.push(ar(
          t.i,
          W,
          o,
          ie,
          J,
          Ue,
          u,
          p
        ));
      });
    }), rr(W, o).forEach((ie) => {
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
  const F = k.filter((W) => !ft(W) && W.isSnapped), X = r.snap === !1 || F.length === 0 ? [] : [F[0].id], A = yr(k, r, X), ce = dr(r), L = cr(r), w = A.filter((W) => {
    var ve;
    return (ve = W.display) == null ? void 0 : ve.showLabel;
  }).map((W) => W.id), R = gr(o, e, s, r), D = hr(o, r, i), M = vr(A, t.i, r), T = k.filter((W) => W.isPredictive && !ft(W)).length, G = F.length, z = vs() - a, q = typeof r.maxDurationMs == "number" && z > r.maxDurationMs;
  return {
    activeId: t.i,
    interaction: i,
    guides: k,
    displayGuides: A,
    debugGuides: L ? k : void 0,
    snappedGuideIds: X,
    spacingLabelGuideIds: w,
    spacingChips: R,
    measurementHud: D,
    anchorEdges: M,
    showGrid: r.showGrid !== !1,
    debug: L,
    debugMode: ce,
    diagnostics: {
      durationMs: z,
      itemCount: m.length,
      degraded: v || q,
      reason: v ? "max-items" : q ? "max-duration" : void 0,
      fullGuideCount: k.length,
      displayGuideCount: A.length,
      spacingLabelCount: w.length,
      predictCount: T,
      snappedCount: G,
      anchorEdgeCount: M.length,
      spacingChipCount: R.length
    }
  };
}, ta = (e, t, o, s = {}, r = {}) => Ao({
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
}).guideState, oa = (e, t) => {
  const o = t.snappedGuideIds[0];
  if (!o) return e;
  const s = t.guides.find((r) => r.id === o);
  return !s || ft(s) ? e : s.axis === "x" ? s.kind === "right" ? { ...e, x: s.position - e.w } : s.kind === "center-x" ? { ...e, x: s.position - e.w / 2 } : { ...e, x: s.position } : s.kind === "bottom" ? { ...e, y: s.position - e.h } : s.kind === "center-y" ? { ...e, y: s.position - e.h / 2 } : { ...e, y: s.position };
}, Ir = 500, xr = 160, wr = 16, xs = 240, ws = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, kr = (e, t, o) => ({
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
}), Mr = (e) => {
  const t = Object.keys(e).sort(), o = {}, s = {};
  return t.forEach((r) => {
    const a = e[r], i = Math.floor(a.top), f = Math.max(i, Math.floor(a.bottom - 1)), d = Math.floor(a.left), c = Math.max(d, Math.floor(a.right - 1));
    for (let y = i; y <= f; y++)
      o[y] || (o[y] = []), o[y].push(r);
    for (let y = d; y <= c; y++)
      s[y] || (s[y] = []), s[y].push(r);
  }), Object.keys(o).forEach((r) => o[Number(r)].sort()), Object.keys(s).forEach((r) => s[Number(r)].sort()), { byId: e, ids: t, rows: o, columns: s };
}, no = (e, t, o, s) => Math.max(0, Math.min(t, s) - Math.max(e, o)), ks = (e, t, o) => {
  if (o === "x") {
    const i = no(e.top, e.bottom, t.top, t.bottom);
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
  const s = no(e.left, e.right, t.left, t.right);
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
}, Sr = (e) => {
  const t = Object.keys(e).sort(), o = [];
  for (let s = 0; s < t.length; s++)
    for (let r = s + 1; r < t.length; r++) {
      const a = e[t[s]], i = e[t[r]], f = ks(a, i, "x"), d = ks(a, i, "y");
      f && o.push(f), d && o.push(d);
    }
  return o.sort(
    (s, r) => s.priority - r.priority || s.axis.localeCompare(r.axis) || s.sourceId.localeCompare(r.sourceId) || s.targetId.localeCompare(r.targetId)
  );
}, Cr = (e) => e.axis === "x" ? e.direction === "before" ? "left" : "right" : e.direction === "before" ? "top" : "bottom", Rr = (e, t, o) => {
  const s = t.filter((a) => a.gap > 0).map((a) => {
    const i = e[a.sourceId], f = e[a.targetId], d = a.axis, c = d === "x" ? i.right <= f.left : i.bottom <= f.top, y = d === "x" ? c ? i.right : f.right : c ? i.bottom : f.bottom, u = d === "x" ? c ? f.left : i.left : c ? f.top : i.top, p = d === "x" ? Math.max(i.top, f.top) + a.overlap / 2 : Math.max(i.left, f.left) + a.overlap / 2;
    return {
      id: `${a.id}:spacing`,
      axis: d,
      sourceId: a.sourceId,
      targetId: a.targetId,
      side: Cr(a),
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
}, Ms = (e) => e === "x" ? "horizontal" : "vertical", Ss = (e) => e === "x" ? "spacing-x" : "spacing-y", qt = (e, t, o, s) => {
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
}, Er = (e) => {
  var i, f;
  const t = Le(e.sectionRows, e.layout), o = new Set(e.selectionIds || []), s = e.layout.filter((d) => o.size === 0 || o.has(d.i)).map((d) => Mo(d, t.itemMembership[d.i]));
  if (s.length < 3) return [];
  const r = [
    qt(s, "x", "edge-to-edge", Ms("x")),
    qt(s, "y", "edge-to-edge", Ms("y")),
    qt(s, "x", "center-to-center", Ss("x")),
    qt(s, "y", "center-to-center", Ss("y"))
  ].filter(Boolean), a = (f = (i = e.options) == null ? void 0 : i.maxDistributionCandidates) != null ? f : wr;
  return r.sort((d, c) => d.deviation - c.deviation || d.id.localeCompare(c.id)).slice(0, a);
}, Pr = (e, t, o, s) => {
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
}, qs = (e) => {
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
}, Br = (e, t, o, s, r) => {
  if (!t) return [];
  const a = qs(e), i = e.layout.filter((u) => u.i !== t.i).sort((u, p) => u.i.localeCompare(p.i)), f = o.filter((u) => u.sourceId !== t.i && u.targetId !== t.i && u.distance > 0).sort((u, p) => u.distance - p.distance || u.id.localeCompare(p.id)), d = [], c = t.x + t.w, y = t.y + t.h;
  return i.forEach((u) => {
    const p = u.x + u.w, m = u.y + u.h, v = no(t.y, y, u.y, m) > 0, C = no(t.x, c, u.x, p) > 0, S = p <= t.x, k = c <= u.x, F = m <= t.y, X = y <= u.y;
    f.forEach((A) => {
      var ce, L, w, R, D, M;
      if (A.axis === "x" && v && (S || k)) {
        const T = S ? t.x - p : u.x - c, G = Math.abs(T - A.distance);
        if (G <= a) {
          const z = S ? p + A.distance : u.x - A.distance - t.w, q = So(
            s,
            u.i,
            t.i,
            (ce = e.options) == null ? void 0 : ce.allowCrossSectionRow
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
      if (A.axis === "y" && C && (F || X)) {
        const T = F ? t.y - m : u.y - y, G = Math.abs(T - A.distance);
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
            sectionId: (D = s.itemMembership[t.i]) == null ? void 0 : D.sectionId,
            rowId: (M = s.itemMembership[t.i]) == null ? void 0 : M.rowId,
            blocked: q
          });
        }
      }
    });
  }), d.sort(
    (u, p) => u.priority - p.priority || p.proximity - u.proximity || u.distance - p.distance || u.id.localeCompare(p.id)
  ).slice(0, r);
}, $r = (e, t, o, s) => {
  if (!t) return [];
  const r = qs(e), a = [], i = [
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
}, Gr = (e, t, o, s, r, a, i, f) => t ? e.guides.map((d) => {
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
    geometry: Pr(d, t, a, i),
    guideIds: [d.id],
    sectionId: y == null ? void 0 : y.sectionId,
    rowId: y == null ? void 0 : y.rowId,
    blocked: u ? "section-row-policy" : void 0
  };
}).sort(
  (d, c) => (d.snapped === c.snapped ? 0 : d.snapped ? -1 : 1) || d.distance - c.distance || d.priority - c.priority || d.id.localeCompare(c.id)
).slice(0, s) : [], zr = (e, t) => {
  const o = [];
  return e.forEach((s) => {
    const r = t[s.i];
    (r == null ? void 0 : r.visible) === !1 && o.push({ code: "grid-editor.intelligence.filtered.hidden", itemIds: [s.i], reason: "hidden" }), r != null && r.locked && o.push({ code: "grid-editor.intelligence.filtered.locked", itemIds: [s.i], reason: "locked" }), s.static && o.push({ code: "grid-editor.intelligence.filtered.static", itemIds: [s.i], reason: "static-item" });
  }), o;
}, Ao = (e) => {
  var E, ge, De, ze, W, ve, ie, J, _e, Ue, yt, Ve, et, ot, st, Xe;
  const t = ws(), o = (ge = (E = e.options) == null ? void 0 : E.maxItems) != null ? ge : Ir, s = (ze = (De = e.options) == null ? void 0 : De.maxSnapCandidates) != null ? ze : xr, r = ((W = e.options) != null && W.maxVisibleGuides, xs), a = e.metaById || {}, i = Le(e.sectionRows, e.layout), f = e.layout.length > o ? e.layout.slice(0, o) : e.layout.slice(), c = Li().build(f, {
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
  const u = Mr(y), p = Sr(y), m = Rr(y, p, r), v = Er(e), C = e.interaction === "toolbar" ? "api" : e.interaction, S = e.activeItem && e.candidateItem ? br(e.layout, e.activeItem, e.candidateItem, a, {
    ...e.options,
    interaction: C
  }) : kr(((ve = e.activeItem) == null ? void 0 : ve.i) || null, C), k = ((ie = e.options) == null ? void 0 : ie.snap) !== !1, F = Gr(
    S,
    e.candidateItem,
    k,
    s,
    i,
    e.interaction,
    (J = e.options) == null ? void 0 : J.resizeHandle,
    (_e = e.options) == null ? void 0 : _e.allowCrossSectionRow
  ), X = Br(
    e,
    e.candidateItem,
    m,
    i,
    s
  ), ce = [
    ...$r(
      e,
      e.candidateItem,
      i,
      s
    ),
    ...X,
    ...F
  ].map((we) => k ? we : { ...we, snapped: !1 }).sort(
    (we, it) => we.priority - it.priority || it.proximity - we.proximity || we.distance - it.distance || we.id.localeCompare(it.id)
  ).slice(0, s), L = ws() - t, w = typeof ((Ue = e.options) == null ? void 0 : Ue.maxDurationMs) == "number" && L > e.options.maxDurationMs, R = e.layout.length > o || w || !!((yt = S.diagnostics) != null && yt.degraded), D = e.layout.length > o ? "max-items" : w ? "max-duration" : ((Ve = S.diagnostics) == null ? void 0 : Ve.reason) === "max-items" || ((et = S.diagnostics) == null ? void 0 : et.reason) === "max-duration" ? S.diagnostics.reason : void 0, M = zr(e.layout, a), T = ["grid-editor.intelligence.computed"];
  e.layout.length > o && T.push("grid-editor.intelligence.degraded.max-items"), w && T.push("grid-editor.intelligence.degraded.max-duration"), v.some((we) => we.isEqual) ? T.push("grid-editor.distribution.equal") : v.length > 0 && T.push("grid-editor.distribution.unequal"), i.warnings.forEach((we) => T.push(we.code)), M.forEach((we) => T.push(we.code));
  const G = {
    durationMs: L,
    itemCount: e.layout.length,
    selectedCount: ((ot = e.selectionIds) == null ? void 0 : ot.length) || 0,
    candidateCount: ce.length + v.length,
    snapCandidateCount: ce.length,
    distributionCandidateCount: v.length,
    spacingRelationCount: m.length,
    sectionRowCount: Object.keys(i.items).length,
    snapSource: ((st = ce.find((we) => we.snapped)) == null ? void 0 : st.kind) || "none",
    distributionMode: ((Xe = v[0]) == null ? void 0 : Xe.mode) || "none",
    sectionRowSource: Object.keys(i.items).length > 0 ? "metadata" : "none",
    degraded: R,
    reason: D,
    filtered: M,
    codes: T
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
    snapCandidates: ce,
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
}), Ar = (e) => e === "collision" ? "grid-editor.snap.blocked.collision" : e === "bounds" ? "grid-editor.snap.blocked.bounds" : e === "maxRows" ? "grid-editor.snap.blocked.maxRows" : e === "section-row-policy" ? "grid-editor.snap.blocked.section-row-policy" : `grid-editor.snap.blocked.${e}`, Or = (e, t, o, s) => {
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
    if (s.layout.find((y) => y.i !== t.i && Pi(y, d))) return "collision";
  }
  return null;
}, Dr = (e, t, o = {}) => {
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
    const c = r[d], y = Or(c.geometry, t, c, o);
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
      Ar(f),
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
}, Tr = (e) => {
  const t = Array.from(new Set(e.selectedIds.filter(Boolean))), o = e.activeId && t.includes(e.activeId) ? e.activeId : t[t.length - 1] || null, s = e.anchorId && t.includes(e.anchorId) ? e.anchorId : t[0] || null;
  return {
    ...e,
    selectedIds: t,
    activeId: o,
    anchorId: s,
    mode: t.length > 1 ? "multiple" : "single"
  };
}, Lr = (e) => e.map((t) => t.i), Hr = (e, t) => eo(e, t[e.i]).editable, Fr = (e, t, o, s) => {
  if (e.length <= 1) return e;
  const r = e.filter((i) => {
    const f = o.get(i);
    return f ? Hr(f, s) : !1;
  });
  if (r.length > 0) return r;
  const a = t && e.includes(t) ? t : e[e.length - 1];
  return a ? [a] : [];
}, We = (e, t, o = {}, s = e.source) => {
  const r = t.filter((f) => {
    var d;
    return ((d = o[f.i]) == null ? void 0 : d.visible) !== !1;
  }), a = new Map(r.map((f) => [f.i, f])), i = Fr(
    e.selectedIds.filter((f) => a.has(f)),
    e.activeId,
    a,
    o
  );
  return Tr({
    ...e,
    selectedIds: i,
    source: s
  });
}, jr = (e, t, o = "api") => Ge(t, o), Co = (e = "api") => Ge([], e), Cs = (e, t, o) => {
  const s = o.source || "api";
  if (o.ids) return jr(t, o.ids, s);
  if (!o.id) return Co(s);
  const r = Lr(e);
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
}, Rs = (e, t, o = {}) => {
  const s = new Set(t), r = e.filter((a) => {
    var i;
    return !s.has(a.i) && ((i = o[a.i]) == null ? void 0 : i.visible) !== !1;
  });
  return r.length > 0 ? r[0].i : null;
}, sa = (e, t, o, s) => {
  const r = s || zi(e, t), a = new Set(o.selectedIds);
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
}, Nr = 100, Kr = 650, wt = (e) => e.kind === "layout" ? {
  ...e,
  layout: le(e.layout),
  editorMetaById: Es(e.editorMetaById),
  sectionRows: Ps(e.sectionRows),
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
} : {
  ...e,
  layouts: so(e.layouts),
  editorMetaById: Es(e.editorMetaById),
  sectionRows: Ps(e.sectionRows),
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
}, Es = (e) => Object.keys(e || {}).reduce((t, o) => {
  const s = e[o];
  return t[o] = {
    ...s,
    resizeHandles: s.resizeHandles ? s.resizeHandles.slice() : void 0,
    data: s.data ? { ...s.data } : void 0
  }, t;
}, {}), Ps = (e) => ({
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
}), Dt = (e) => ({
  ...e,
  before: wt(e.before),
  after: wt(e.after),
  targetIds: e.targetIds ? e.targetIds.slice() : void 0,
  affectedIds: e.affectedIds ? e.affectedIds.slice() : void 0
}), Xr = (e = {}) => {
  const t = Math.max(1, Math.floor(e.maxSize || Nr)), o = e.mergeWindowMs || Kr, s = Ee(!1), r = Ee(!1);
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
    if (Ne(u.before, u.after)) return;
    const m = {
      ...Dt(u)
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
        past: a.map(Dt),
        future: i.map(Dt),
        canUndo: s.value,
        canRedo: r.value
      };
    },
    restore(u) {
      a = u.past.map(Dt), i = u.future.map(Dt), f();
    }
  };
}, Yr = (e) => ({
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
class lt extends Error {
  constructor(t, o, s) {
    super(o), this.name = "GridEditorClipboardError", this.code = t, this.cause = s;
  }
}
const Ht = (e) => typeof e == "number" && Number.isFinite(e), Ro = (e) => Ht(e) && e > 0 ? Math.floor(e) : void 0, bo = (e) => typeof e == "string" && e.length > 0 ? e : void 0, Eo = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Vs = (e) => e.reduce((t, o) => (t[o.i] = Eo(o), t), {}), Oo = (e) => {
  if (!e || typeof e != "object") return;
  const t = e, o = {}, s = Ro(t.cols);
  s && (o.cols = s);
  const r = bo(t.breakpoint);
  r && (o.breakpoint = r);
  const a = bo(t.layoutId);
  a && (o.layoutId = a);
  const i = bo(t.viewFormat);
  return i && (o.viewFormat = i), Object.keys(o).length > 0 ? o : void 0;
}, Do = (e, t) => {
  const o = Vs(t);
  if (!e || typeof e != "object") return o;
  const s = {};
  return Object.keys(e).forEach((r) => {
    const a = e[r];
    if (!a || typeof a != "object") return;
    const i = a;
    !Ht(i.x) || !Ht(i.y) || !Ht(i.w) || !Ht(i.h) || (s[r] = {
      x: i.x,
      y: i.y,
      w: i.w,
      h: i.h
    });
  }), {
    ...o,
    ...s
  };
}, Zs = (e, t) => Do(e, t), Po = (e) => {
  const t = le(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt,
    items: t,
    editorMetaById: Me(e.editorMetaById)
  };
  return e.version === 2 ? {
    version: 2,
    ...o,
    source: Oo(e.source),
    originalGeometryById: Zs(e.originalGeometryById, t)
  } : {
    version: 1,
    ...o
  };
};
let Vt = null;
const bt = {
  read() {
    return Vt ? Po(Vt) : null;
  },
  write(e) {
    Vt = Po(e);
  },
  clear() {
    Vt = null;
  }
}, Bs = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = e.name;
  return t === "NotAllowedError" || t === "SecurityError";
}, _r = (e) => {
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
    source: Oo(t.source),
    originalGeometryById: Do(t.originalGeometryById, o)
  } : {
    version: 1,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s
  };
}, Ur = () => ({
  async read() {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.readText != "function")
      throw new lt(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      const e = await navigator.clipboard.readText();
      if (!e) return null;
      const t = JSON.parse(e), o = _r(t);
      if (!o)
        throw new lt(
          "clipboard-invalid",
          "Clipboard does not contain a grid editor payload."
        );
      return o;
    } catch (e) {
      throw e instanceof lt ? e : new lt(
        Bs(e) ? "clipboard-permission" : "clipboard-invalid",
        "Failed to read grid editor payload from system clipboard.",
        e
      );
    }
  },
  async write(e) {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText != "function")
      throw new lt(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      await navigator.clipboard.writeText(JSON.stringify(Po(e)));
    } catch (t) {
      throw new lt(
        Bs(t) ? "clipboard-permission" : "clipboard-unavailable",
        "Failed to write grid editor payload to system clipboard.",
        t
      );
    }
  }
}), Wr = (e) => {
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
    source: Oo(e.source),
    originalGeometryById: Zs(e.originalGeometryById, t)
  };
}, Io = (e, t = {}) => {
  var f, d, c, y, u, p;
  const o = Ro(t.cols), s = "version" in e && e.version === 2 ? Ro((f = e.source) == null ? void 0 : f.cols) : void 0;
  if (!o || !s || t.scale === !1 || o === s)
    return {
      items: le(e.items),
      scaled: !1,
      sourceCols: s,
      targetCols: o
    };
  const r = o / s, a = "version" in e && e.version === 2 ? Do(e.originalGeometryById, e.items) : Vs(e.items), i = e.items.reduce((m, v) => {
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
}, Zt = (e) => !e.payload || typeof e.payload != "object" ? { ok: !1, message: `${e.type} requires an object payload.` } : { ok: !0 }, Js = [
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
    validatePayload: Zt
  }),
  he("resize", {
    defaultSource: "api",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Zt
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
    validatePayload: Zt
  }),
  he("distribute", {
    defaultSource: "toolbar",
    defaultHistory: $e,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Zt
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
], qr = new Map(
  Js.map((e) => [e.type, e])
), Qs = (e) => qr.get(e), ia = () => Js.slice(), io = (e) => {
  const t = Qs(e);
  return t || he(e, {
    defaultSource: "api",
    defaultHistory: It,
    affects: {},
    mutualExclusionScope: "global"
  });
}, Vr = (e) => {
  const t = /* @__PURE__ */ new Map(), o = e.now || (() => {
    const a = typeof performance != "undefined" ? performance : null;
    return a && typeof a.now == "function" ? a.now() : Date.now();
  });
  return {
    execute: async (a) => {
      var L, w, R, D, M, T, G, z, q;
      const i = io(a.type), f = {
        source: i.defaultSource,
        ...a,
        history: a.history || i.defaultHistory
      }, d = Ys(f), c = Lt(
        d.history,
        i.defaultHistory.mode || to(d.type)
      );
      d.history = c;
      const y = d.source || i.defaultSource || "api";
      d.source = y;
      const u = i.mutualExclusionScope || "global", p = o(), m = t.get(u);
      if (m && !m.signal.aborted) {
        const E = oo(d, "command-pending", {
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
        const E = oo(d, "invalid-input", {
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
      const F = ((D = e.buildPreview) == null ? void 0 : D.call(e, d, S, v)) || {
        layoutPatches: [],
        metadataPatches: [],
        affectedIds: [],
        beforeSummary: {},
        afterSummary: {}
      }, X = new AbortController();
      t.set(u, X);
      const A = await Ai(
        e.beforeCommand,
        d,
        e.getGuardContext(d, S, F, X.signal),
        e.guardTimeoutMs
      );
      if (t.delete(u), (M = e.isStopped) != null && M.call(e) || X.signal.aborted) {
        (T = e.cleanupInteraction) == null || T.call(e, "guard-aborted");
        const E = xe(d, "cancelled", {
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
      const ce = e.getStateRevision();
      if (ce !== C) {
        (q = e.cleanupInteraction) == null || q.call(e, "stale-command");
        const E = oo(d, "stale-command", {
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
            stateRevision: ce,
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
}), ao = (e, t, o = (/* @__PURE__ */ new Date()).toISOString()) => {
  const s = typeof t == "string" ? void 0 : t, r = typeof t == "string" ? t : o, a = s ? Le(s) : null;
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
}, ro = (e) => {
  var a, i;
  const t = (a = e == null ? void 0 : e.meta) == null ? void 0 : a.editor;
  if (t == null)
    return {
      ok: !0,
      envelope: ao({})
    };
  if (!t || typeof t != "object")
    return { ok: !1, error: "meta.editor must be an object." };
  const o = t;
  if (o.version !== 1 && o.version !== 2)
    return {
      ok: !0,
      envelope: ao({})
    };
  const s = Oi(o.editorMetaById);
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
      } : _s(),
      updatedAt: typeof o.updatedAt == "string" ? o.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, Zr = (e) => {
  const t = () => ({ ...(typeof e.baseMeta == "function" ? e.baseMeta() : e.baseMeta) || {} }), o = (s, r) => {
    var i, f, d;
    const a = ro(s);
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
      Le(
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
        editor: ao(
          e.getEditorMetaById(),
          (s = e.getSectionRows) == null ? void 0 : s.call(e)
        )
      };
    },
    onPersistenceEvent(s) {
      var r, a, i, f, d, c, y;
      if ((s.type === "load-success" || s.type === "external-apply") && o(s.document, s.type), s.type === "save-success" && o(s.document, "save-success"), s.type === "conflict") {
        const u = ro(s.conflict.localDocument), p = ro(s.conflict.externalDocument);
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
}, uo = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, jt = (e) => typeof e == "number" && Number.isFinite(e), ei = (e) => e === "left" || e === "center-x" || e === "right" ? "x" : "y", Jr = (e) => e === "horizontal" || e === "spacing-x" ? "x" : "y", co = (e) => le(e), Qr = (e) => Array.from(new Set(e.flatMap((t) => t.type === "add" ? [t.item.i] : t.type === "compact" ? t.affectedIds : [t.id]))), ti = (e, t) => {
  var s, r;
  const o = (s = t.targetIds) != null && s.length ? t.targetIds : (r = t.selectedIds) != null && r.length ? t.selectedIds : e.map((a) => a.i);
  return Array.from(new Set(o.filter(Boolean)));
}, kt = (e, t, o, s, r, a, i) => ({
  status: "blocked",
  layout: co(t),
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
    durationMs: uo() - e,
    computed: a,
    messages: [{
      code: `grid-editor.geometry.${o}`,
      level: o === "invalid-input" ? "error" : "warning",
      message: r,
      itemIds: s,
      recoverable: !0
    }]
  }
}), oi = (e, t) => {
  const o = [], s = [];
  return t.forEach((r) => {
    const a = Pe(e, r);
    a ? o.push(a) : s.push(r);
  }), { items: o, missingIds: s };
}, Bo = (e, t, o) => {
  const s = jt(o.cols) ? o.cols : 12, r = jt(o.maxRows) ? o.maxRows : 1 / 0;
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
}, en = (e, t) => t === "right" ? e.x + e.w : t === "center-x" ? e.x + e.w / 2 : t === "bottom" ? e.y + e.h : t === "center-y" ? e.y + e.h / 2 : t === "top" ? e.y : e.x, $s = (e) => {
  const t = Math.min(...e.map((a) => a.x)), o = Math.max(...e.map((a) => a.x + a.w)), s = Math.min(...e.map((a) => a.y)), r = Math.max(...e.map((a) => a.y + a.h));
  return {
    left: t,
    right: o,
    top: s,
    bottom: r,
    centerX: t + (o - t) / 2,
    centerY: s + (r - s) / 2
  };
}, tn = (e, t, o, s) => {
  var f;
  const r = t.mode, a = t.target || { type: "selection-bounds" };
  if (a.type === "explicit-line" && a.axis === ei(r))
    return { position: a.position, source: "explicit" };
  if (a.type === "active-item" || a.type === "last-selected") {
    const d = s.selectedIds || s.targetIds || o.map((u) => u.i), c = a.type === "active-item" ? a.id || s.activeId || d[0] : d[d.length - 1], y = o.find((u) => u.i === c) || o[0];
    return { position: en(y, r), source: a.type };
  }
  if (a.type === "section-row") {
    const c = (f = Le(s.sectionRows, e).items[a.id]) == null ? void 0 : f.bounds, y = a.bounds || c;
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
    const u = $s(o);
    return r === "right" ? { position: u.right, source: "section-row" } : r === "center-x" ? { position: u.centerX, source: "section-row" } : r === "bottom" ? { position: u.bottom, source: "section-row" } : r === "center-y" ? { position: u.centerY, source: "section-row" } : r === "top" ? { position: u.top, source: "section-row" } : { position: u.left, source: "section-row" };
  }
  const i = $s(o);
  return r === "right" ? { position: i.right, source: "selection" } : r === "center-x" ? { position: i.centerX, source: "selection" } : r === "bottom" ? { position: i.bottom, source: "selection" } : r === "center-y" ? { position: i.centerY, source: "selection" } : r === "top" ? { position: i.top, source: "selection" } : { position: i.left, source: "selection" };
}, on = (e, t, o) => t === "right" ? { ...e, x: Math.round(o - e.w) } : t === "center-x" ? { ...e, x: Math.round(o - e.w / 2) } : t === "top" ? { ...e, y: Math.round(o) } : t === "bottom" ? { ...e, y: Math.round(o - e.h) } : t === "center-y" ? { ...e, y: Math.round(o - e.h / 2) } : { ...e, x: Math.round(o) }, si = (e, t) => e.slice().sort(
  (o, s) => t === "x" ? o.x - s.x || o.i.localeCompare(s.i) : o.y - s.y || o.i.localeCompare(s.i)
), sn = (e, t, o) => {
  const s = [];
  for (let r = 1; r < e.length; r++) {
    const a = e[r - 1], i = e[r];
    s.push(o === "center-to-center" ? t === "x" ? i.x + i.w / 2 - (a.x + a.w / 2) : i.y + i.h / 2 - (a.y + a.h / 2) : t === "x" ? i.x - (a.x + a.w) : i.y - (a.y + a.h));
  }
  return s;
}, rn = (e) => e.length === 0 ? 0 : e.reduce((t, o) => t + o, 0) / e.length, nn = (e, t, o, s) => {
  const r = Math.max(0, e.findIndex((y) => y.i === s)), a = e[r], i = Math.max(0, rn(sn(e, t, o))), f = /* @__PURE__ */ new Map([[a.i, a]]);
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
}, an = (e, t, o, s) => {
  const r = Jr(o.mode), a = o.strategy || "edge-to-edge", i = si(t, r);
  if (i.length < 3) return null;
  const f = Le(s.sectionRows, e), d = i.reduce((F, X) => {
    const A = f.itemMembership[X.i] || {};
    return F === null ? { ...A } : {
      sectionId: F.sectionId && F.sectionId === A.sectionId ? F.sectionId : void 0,
      rowId: F.rowId && F.rowId === A.rowId ? F.rowId : void 0
    };
  }, null), c = o.sectionRowId || (o.bounds === "section-row" ? (d == null ? void 0 : d.rowId) || (d == null ? void 0 : d.sectionId) : void 0), y = c ? f.items[c] : void 0;
  if (o.bounds === "active-item") {
    const F = nn(i, r, a, s.activeId);
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
    const F = !!(p || u), X = F ? m + (r === "x" ? i[0].w : i[0].h) / 2 : r === "x" ? i[0].x + i[0].w / 2 : i[0].y + i[0].h / 2, ce = ((F ? v - (r === "x" ? i[i.length - 1].w : i[i.length - 1].h) / 2 : r === "x" ? i[i.length - 1].x + i[i.length - 1].w / 2 : i[i.length - 1].y + i[i.length - 1].h / 2) - X) / (i.length - 1);
    return {
      axis: r,
      spacing: ce,
      sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
      rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
      items: i.map((L, w) => {
        if (w === 0 || w === i.length - 1) return L;
        const R = X + ce * w;
        return r === "x" ? { ...L, x: Math.round(R - L.w / 2) } : { ...L, y: Math.round(R - L.h / 2) };
      })
    };
  }
  const C = i.reduce(
    (F, X) => F + (r === "x" ? X.w : X.h),
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
      const X = r === "x" ? { ...F, x: Math.round(k) } : { ...F, y: Math.round(k) };
      return k += (r === "x" ? F.w : F.h) + S, X;
    })
  };
}, cn = (e, t, o, s) => {
  const r = o === "x" ? "y" : "x", a = Le(s.sectionRows, e), i = (c) => {
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
}, Gs = (e, t, o, s) => {
  const r = jt(o.minSpacing) ? Math.max(0, o.minSpacing) : 1, a = o.axis === "both" ? ["x", "y"] : [o.axis === "y" ? "y" : "x"];
  let i = t.slice();
  return a.forEach((f) => {
    const d = cn(e, i, f, s), c = /* @__PURE__ */ new Map();
    d.forEach((y) => {
      const u = si(y, f);
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
}, ii = (e, t, o) => Ao({
  layout: e,
  activeItem: t.find((s) => s.i === o.activeId) || t[0],
  candidateItem: t.find((s) => s.i === o.activeId) || t[0],
  selectionIds: t.map((s) => s.i),
  metaById: o.metaById,
  sectionRows: o.sectionRows,
  cols: jt(o.cols) ? o.cols : 12,
  maxRows: o.maxRows,
  compactType: o.compactType,
  allowOverlap: o.allowOverlap,
  preventCollision: o.preventCollision,
  interaction: "toolbar",
  options: {
    cols: jt(o.cols) ? o.cols : 12,
    maxRows: o.maxRows,
    allowCrossSectionRow: !1
  }
}), ri = (e, t, o, s, r) => {
  const a = Ft(t, o), i = Qr(a);
  return {
    status: i.length > 0 ? "changed" : "noop",
    layout: o,
    layoutPatches: a,
    affectedIds: i,
    skippedIds: r,
    diagnostics: {
      ...s,
      durationMs: uo() - e
    }
  };
}, zs = (e, t, o = {}) => {
  const s = uo(), r = ti(e, o), { items: a, missingIds: i } = oi(e, r);
  if (i.length > 0)
    return kt(s, e, "missing-item", i, "Align command referenced missing layout items.", void 0, o.skippedIds);
  if (a.length < 2)
    return kt(s, e, "selection-count", r, "Align requires at least 2 items.", void 0, o.skippedIds);
  const f = tn(e, t, a, o), d = co(e).map(
    (p) => r.includes(p.i) ? on(p, t.mode, f.position) : p
  ), c = Bo(d, r, o), y = ii(e, a, o), u = {
    targetLine: {
      axis: ei(t.mode),
      position: f.position,
      mode: t.mode
    },
    affectedIds: r,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      source: f.source === "section-row" ? "metadata" : "none"
    }
  };
  return c.ok ? ri(s, e, d, {
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
}, ni = (e, t, o, s) => {
  const r = uo(), a = ti(e, o), { items: i, missingIds: f } = oi(e, a);
  if (f.length > 0)
    return kt(r, e, "missing-item", f, `${s} command referenced missing layout items.`, void 0, o.skippedIds);
  if (i.length < 3)
    return kt(r, e, "selection-count", a, `${s} requires at least 3 items.`, void 0, o.skippedIds);
  let d = s === "distribute" ? an(e, i, t, o) : Gs(e, i, t, o);
  const c = ii(e, i, o);
  if (!d)
    return kt(r, e, "invalid-input", a, "Spacing command could not compute a valid spacing result.", {
      affectedIds: a,
      skippedIds: o.skippedIds
    }, o.skippedIds);
  let y = !1, u = new Map(d.items.map((k) => [k.i, k])), p = co(e).map((k) => u.get(k.i) || k), m = Bo(p, a, o);
  if (!m.ok) {
    const k = Gs(e, i, {
      axis: d.axis,
      minSpacing: 0,
      strategy: t.strategy
    }, o);
    k && (y = !0, d = k, u = new Map(d.items.map((F) => [F.i, F])), p = co(e).map((F) => u.get(F.i) || F), m = Bo(p, a, o));
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
  return m.ok ? ri(r, e, p, {
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
}, As = (e, t, o = {}) => ni(e, t, o, "distribute"), Os = (e, t, o = {}) => ni(e, t, o, "tidy"), Ae = (e) => typeof e == "number" && Number.isFinite(e), dn = (e) => Ae(e) && e > 0 ? Math.floor(e) : 12, ln = (e) => Ae(e) && e > 0 ? Math.floor(e) : 1 / 0, un = (e) => e === "vertical" || e === "horizontal" || e === null ? e : "vertical", fn = (e) => e === "layout" ? "layout" : "block", Ds = (e) => e === !0, tt = (e) => ({
  id: e.i,
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), To = (e) => ({
  ...e,
  x: Ae(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: Ae(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: Ae(e.w) ? Math.floor(e.w) : 1,
  h: Ae(e.h) ? Math.floor(e.h) : 1
}), Ke = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), Nt = (e, t, o, s, r = {}) => {
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
}, Lo = (e, t, o) => e.w <= 0 || e.h <= 0 || e.w > t ? "bounds" : Number.isFinite(o) && e.h > o ? "maxRows" : null, Kt = (e, t, o) => Math.max(t, Math.min(e, o)), ai = (e) => e.reduce((t, o) => Math.max(t, o.y + o.h), 0), yn = (e, t, o, s, r, a) => {
  if (!Ae(o) || !Ae(s)) return null;
  const i = {
    x: Math.floor(o),
    y: Math.floor(s)
  }, f = Kt(i.x, 0, Math.max(0, r - t.w)), d = Math.max(0, i.y), c = Number.isFinite(a) ? Math.floor(a) - t.h : Math.max(ai(e), d);
  if (c < d) return null;
  for (let y = d; y <= c; y++) {
    const u = { ...t, x: f, y };
    if (Nt([...e, u], [u.i], r, a).ok)
      return {
        x: f,
        y,
        target: i,
        clamped: f !== i.x,
        shiftedDown: y !== d
      };
  }
  return null;
}, pn = (e) => {
  for (const t of e)
    t.moved && (t.moved = !1);
  return e;
}, Ts = (e, t, o) => {
  const s = new Set(o), r = new Map(t.map((a) => [a.i, a]));
  return e.filter((a) => {
    if (s.has(a.i)) return !1;
    const i = r.get(a.i);
    return !!(i && (a.x !== i.x || a.y !== i.y || a.w !== i.w || a.h !== i.h));
  }).map((a) => a.i);
}, mn = (e, t, o, s, r, a, i) => {
  var A, ce;
  const f = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (o !== "cursor" || f !== "top-left") return null;
  const d = un(s.compactType), c = Ds(s.allowOverlap), y = Ds(s.preventCollision), u = t.map(To), p = u.reduce((L, w) => ({
    x: Math.min(L.x, w.x),
    y: Math.min(L.y, w.y)
  }), { x: ((A = u[0]) == null ? void 0 : A.x) || 0, y: ((ce = u[0]) == null ? void 0 : ce.y) || 0 });
  let m = le(e);
  const v = [], C = [], S = (L, w, R, D) => {
    const M = v.concat(w.filter((T) => u.some((G) => G.i === T)));
    return C.push(Ke(
      L === "collision" || L === "static-item" ? "grid-editor.placement.layout-collision-blocked" : L === "maxRows" ? "grid-editor.placement.layout-max-rows-blocked" : "grid-editor.placement.layout-bounds-blocked",
      "warning",
      R,
      { reason: L, itemIds: w, details: { collisionPolicy: "layout", compactType: d, allowOverlap: c, preventCollision: y } }
    )), {
      layout: D,
      failed: !0,
      blocked: { reason: L, itemIds: w, message: R },
      summary: {
        strategy: o,
        placementSource: o,
        collisionPolicy: "layout",
        insertedIds: M,
        shiftedIds: Ts(e, D, M),
        before: e.map(tt),
        after: D.map(tt),
        diagnostics: C
      }
    };
  }, k = Ae(i == null ? void 0 : i.x) ? i.x : p.x, F = Ae(i == null ? void 0 : i.y) ? i.y : p.y, X = u.map((L) => {
    const w = Math.floor(k + L.x - p.x), R = Math.floor(F + L.y - p.y);
    return {
      ...L,
      x: Kt(w, 0, Math.max(0, r - L.w)),
      y: Number.isFinite(a) ? Kt(R, 0, Math.max(0, Math.floor(a) - L.h)) : Math.max(0, R)
    };
  });
  if (!c) {
    const L = X.find((w) => $t(X, w).length > 0);
    if (L)
      return S(
        "collision",
        [L.i, ...$t(X, L).map((w) => w.i)],
        "Placement group contains overlapping items.",
        e
      );
  }
  for (let L = 0; L < X.length; L++) {
    const w = X[L], R = u[L], D = Lo(R, r, a);
    if (D)
      return C.push(Ke(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: D, itemIds: [R.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: D,
          itemIds: [R.i],
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
    const M = m.concat(w), T = Nt(
      M,
      [w.i],
      r,
      a,
      { allowOverlap: c }
    ), G = c ? [] : $t(m, w).filter((ie) => ie.i !== w.i);
    if (!T.ok && T.reason !== "collision")
      return S(
        T.reason,
        T.itemIds,
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
    const z = Math.max(ai(m), w.y) + w.h + L + 1, q = {
      ...w,
      y: z,
      static: !1
    }, E = m.concat(q), ge = E[E.length - 1], ze = $i(
      E,
      ge,
      d,
      r,
      c,
      w.x,
      w.y,
      !0,
      y
    ).map(
      (ie) => ie.i === w.i ? { ...ie, static: w.static === !0 } : ie
    ), W = d == null ? ze : Gi(ze, d, r, c);
    m = pn(W), v.push(w.i);
    const ve = Nt(
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
  return C.push(Ke(
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
      shiftedIds: Ts(e, m, v),
      before: e.map(tt),
      after: m.map(tt),
      diagnostics: C
    }
  };
}, gn = (e, t, o, s, r, a) => {
  var v, C;
  const i = Ae(s.offset) ? s.offset : 1, f = s.cursor && typeof s.cursor == "object" ? s.cursor : null, d = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (fn(s.collisionPolicy) === "layout") {
    const S = mn(e, t, o, s, r, a, f);
    if (S) return S;
  }
  const c = le(e), y = [], u = [], p = t.map(To), m = p.reduce((S, k) => ({
    x: Math.min(S.x, k.x),
    y: Math.min(S.y, k.y)
  }), { x: ((v = p[0]) == null ? void 0 : v.x) || 0, y: ((C = p[0]) == null ? void 0 : C.y) || 0 });
  for (let S = 0; S < p.length; S++) {
    const k = p[S], F = Lo(k, r, a);
    if (F)
      return u.push(Ke(
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
    let X = k.x, A = k.y;
    const ce = o === "cursor" && d === "top-left" && typeof s.placementSessionId == "string";
    if (o === "offset")
      X += i * (S + 1), A += i * (S + 1);
    else if (ce) {
      const R = Ae(f == null ? void 0 : f.x) ? f.x : X, D = Ae(f == null ? void 0 : f.y) ? f.y : A, M = k.x - m.x, T = k.y - m.y, G = Math.floor(R + M), z = Math.floor(D + T);
      X = Kt(G, 0, Math.max(0, r - k.w)), A = Number.isFinite(a) ? Kt(z, 0, Math.max(0, Math.floor(a) - k.h)) : Math.max(0, z), u.push(Ke(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: { x: G, y: z },
            placed: { x: X, y: A },
            clamped: X !== G || A !== z,
            shiftedDown: !1
          }
        }
      ));
    } else if (o === "nearest-fit" || o === "cursor") {
      const R = o === "cursor" && d === "top-left" ? yn(
        c,
        k,
        Ae(f == null ? void 0 : f.x) ? f.x : X,
        Ae(f == null ? void 0 : f.y) ? f.y : A,
        r,
        a
      ) : null, D = R || Bi(
        c,
        k,
        r,
        Ae(f == null ? void 0 : f.x) ? f.x : X,
        Ae(f == null ? void 0 : f.y) ? f.y : A,
        a
      );
      D && (X = D.x, A = D.y, R && u.push(Ke(
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
      const R = cs(c, k, r, a);
      R && (X = R.x, A = R.y);
    }
    const L = {
      ...k,
      x: Math.max(0, Math.floor(X)),
      y: Math.max(0, Math.floor(A))
    }, w = Nt([...c, L], [L.i], r, a);
    if (!w.ok) {
      if (ce) {
        const D = (w.reason === "maxRows" || Number.isFinite(a), w.reason), M = [...c, L], T = y.concat(L.i);
        return u.push(Ke(
          D === "collision" ? "grid-editor.placement.collision-blocked" : D === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.bounds-blocked",
          "warning",
          "Placement target is blocked at the current cursor position.",
          { reason: D, itemIds: w.itemIds }
        )), {
          layout: M,
          failed: !0,
          blocked: {
            reason: D,
            itemIds: w.itemIds,
            message: "Placement target is blocked at the current cursor position."
          },
          summary: {
            strategy: o,
            placementSource: o,
            insertedIds: T,
            shiftedIds: [],
            before: [],
            after: M.filter((G) => T.includes(G.i)).map(tt),
            diagnostics: u
          }
        };
      }
      const R = cs(c, k, r, a);
      if (!R) {
        const D = w.reason === "maxRows" || Number.isFinite(a) ? "maxRows" : w.reason;
        return u.push(Ke(
          D === "maxRows" ? "grid-editor.placement.max-rows-blocked" : "grid-editor.placement.collision-unresolved",
          "warning",
          "No legal placement was available for the item.",
          { reason: D, itemIds: w.itemIds }
        )), {
          layout: e,
          failed: !0,
          blocked: {
            reason: D,
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
  return u.push(Ke(
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
      after: c.filter((S) => y.includes(S.i)).map(tt),
      diagnostics: u
    }
  };
}, hn = (e, t, o, s) => {
  const r = le(e), a = t.map(To), i = a.map((k) => k.i), f = r.map((k) => k.i), d = r.map(tt), c = [];
  if (a.length === 0)
    return c.push(Ke(
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
      return c.push(Ke(
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
  })), C = [...p, ...v], S = Nt(C, C.map((k) => k.i), o, s);
  return S.ok ? (c.push(Ke(
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
  }) : (c.push(Ke(
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
  const r = o === "offset" || o === "cursor" || o === "nearest-fit" || o === "first-fit" || o === "insert-top-shift" ? o : "first-fit", a = dn(s.cols), i = ln(s.maxRows);
  return r === "insert-top-shift" ? hn(e, t, a, i) : gn(e, t, r, s, a, i);
};
let vn = 0;
const Ho = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, ut = (e) => typeof e == "number" && Number.isFinite(e), ci = (e) => ut(e) && e > 0 ? Math.floor(e) : 12, di = (e) => ut(e) && e > 0 ? Math.floor(e) : 1 / 0, li = (e, t = "first-fit") => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift" ? e : t, ui = (e, t = "block") => e === "layout" ? "layout" : t, fi = (e, t) => e === "vertical" || e === "horizontal" || e === null ? e : t, lo = (e, t) => typeof e == "boolean" ? e : t, yi = (e) => {
  if (!(!e || !ut(e.x) || !ut(e.y)))
    return {
      ...e,
      x: Math.max(0, Math.floor(e.x)),
      y: Math.max(0, Math.floor(e.y))
    };
}, bn = (e, t) => ({
  ...e,
  i: typeof e.i == "string" && e.i.length > 0 ? e.i : `placement-item-${t + 1}`,
  x: ut(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: ut(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: ut(e.w) ? Math.max(1, Math.floor(e.w)) : 1,
  h: ut(e.h) ? Math.max(1, Math.floor(e.h)) : 1
}), In = (e) => (Array.isArray(e.items) ? e.items : e.item ? [e.item] : []).filter((o) => o && typeof o == "object").map((o, s) => bn(o, s)), Pt = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Fo = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), pi = (e, t, o, s) => {
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
}, ra = (e, t, o, s) => pi(e, t, o, s), na = (e = [], t) => {
  const o = e.slice();
  return t && !o.some((s) => s.reason === t.reason) && o.push(Fo(
    `grid-editor.placement.blocked.${t.reason}`,
    "warning",
    t.message || `Placement blocked by ${t.reason}.`,
    { reason: t.reason, itemIds: t.itemIds }
  )), o;
}, aa = (e) => le(e), xn = (e, t, o, s) => {
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
  var S, k, F, X, A;
  const s = yi(t.cursor) || e.cursor, r = li(t.strategy || e.strategy, e.strategy), a = ui(t.collisionPolicy, e.collisionPolicy), i = fi(t.compactType, e.compactType), f = lo(t.allowOverlap, e.allowOverlap), d = lo(t.preventCollision, e.preventCollision), c = ci((S = t.cols) != null ? S : e.cols), y = di((k = t.maxRows) != null ? k : e.maxRows), u = {
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
    itemIds: (X = p.blocked) == null ? void 0 : X.itemIds,
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
    ghostItems: xn(
      e,
      m,
      p.summary.insertedIds.length ? p.summary.insertedIds : e.items.map((ce) => ce.i),
      v ? "blocked" : "preview"
    ),
    affectedOutlines: pi(e.baseLayout, m, p.summary, v),
    diagnostics: C,
    blocked: v,
    updatedAt: (o.now || Ho)(),
    previewSeq: e.previewSeq + 1
  };
}, wn = (e, t) => {
  var i, f, d;
  const o = (t.now || Ho)(), s = e.commandType || (e.source === "paste" ? "paste" : "add"), r = e.resolvedClipboardPayload ? le(e.resolvedClipboardPayload.items) : In(e), a = {
    id: t.id || `grid-editor-placement:${++vn}`,
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
    strategy: li(e.strategy, t.defaultStrategy || "first-fit"),
    collisionPolicy: ui(e.collisionPolicy),
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor,
    compactType: fi(e.compactType),
    allowOverlap: lo(e.allowOverlap),
    preventCollision: lo(e.preventCollision),
    cursor: yi(e.cursor),
    size: r[0] ? { w: r[0].w, h: r[0].h } : void 0,
    origin: e.origin,
    cols: ci((f = e.cols) != null ? f : t.cols),
    maxRows: di((d = e.maxRows) != null ? d : t.maxRows),
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
}, kn = (e, t = {}) => {
  var s, r, a, i;
  const o = {
    items: e.commandType === "add" ? le(e.items) : void 0,
    item: e.commandType === "add" && e.items.length === 1 ? zo(e.items[0]) : void 0,
    editorMetaById: e.commandType === "add" ? Me(e.editorMetaById) : void 0,
    resolvedClipboardPayload: e.commandType === "paste" ? {
      items: le(e.items),
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
    placementCandidateLayout: e.candidateLayout ? le(e.candidateLayout) : void 0
  };
  return {
    type: e.commandType,
    payload: o,
    source: t.source || "api",
    origin: e.origin
  };
}, Mn = (e, t = "cancelled", o = {}) => ({
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
}), Sn = [
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
], Cn = (e) => {
  if (e === "align") return 2;
  if (e === "distribute" || e === "tidy") return 3;
}, Rn = (e, t) => {
  var r, a, i, f, d;
  const o = Qs(t.type), s = e.canExecute({
    source: (o == null ? void 0 : o.defaultSource) || "toolbar",
    ...t
  });
  return {
    command: t.type,
    enabled: s.status !== "blocked" && s.status !== "cancelled" && s.status !== "timeout" && s.status !== "error",
    reason: (r = s.blocked) == null ? void 0 : r.reason,
    requiredSelectionCount: ((a = s.blocked) == null ? void 0 : a.reason) === "selection-count" ? Cn(t.type) : void 0,
    blockedIds: ((i = s.blocked) == null ? void 0 : i.itemIds) || ((f = s.blocked) == null ? void 0 : f.skippedIds),
    labelKey: o == null ? void 0 : o.labelKey,
    shortcuts: o == null ? void 0 : o.shortcuts,
    messageKey: (d = s.blocked) != null && d.reason ? `grid-editor.toolbar.${t.type}.${s.blocked.reason}` : void 0
  };
}, En = (e) => {
  var v, C;
  const t = e.selection.value, o = e.editorMetaById.value, s = Le(e.sectionRows.value), r = t.selectedIds, a = Array.from(new Set(r.flatMap((S) => {
    const k = s.itemMembership[S];
    return [
      (k == null ? void 0 : k.sectionId) || null,
      (k == null ? void 0 : k.rowId) || null
    ].filter(Boolean);
  }))), i = (v = Object.values(s.items).slice().sort((S, k) => S.order - k.order || S.id.localeCompare(k.id))[0]) == null ? void 0 : v.id, f = a[0] || i, d = {}, c = f ? { id: f } : {};
  [
    ...Sn,
    { type: "section-row-collapse", payload: c },
    { type: "section-row-expand", payload: c },
    { type: "section-row-move", payload: f ? { id: f, dy: 1 } : {} },
    { type: "section-row-delete", payload: c },
    { type: "section-row-reorder", payload: c }
  ].forEach((S) => {
    d[S.type] = Rn(e, S);
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
}, Go = (e) => e.kind === "layout" ? e.layout : e.layouts[e.breakpoint] || [], Ls = (e) => ({
  layoutSize: Go(e).length,
  layoutCount: e.kind === "responsive" ? Object.keys(e.layouts).length : 1,
  metadataCount: Object.keys(e.editorMetaById || {}).length,
  sectionRowCount: Object.keys(e.sectionRows.items || {}).length,
  selectionCount: e.selection.selectedIds.length,
  focusId: e.focusId
}), Pn = (e, t) => {
  const o = [];
  return (/* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])).forEach((r) => {
    const a = e[r], i = t[r];
    if (!i && a) {
      o.push({ type: "remove", id: r, previous: a });
      return;
    }
    i && !Ne(a, i) && o.push({ type: "set", id: r, previous: a, next: i });
  }), o;
}, Bn = (e, t) => {
  const o = [], s = e.items || {}, r = t.items || {};
  return (/* @__PURE__ */ new Set([...Object.keys(s), ...Object.keys(r)])).forEach((i) => {
    const f = s[i], d = r[i];
    if (!d && f) {
      o.push({ type: "remove", id: i, previous: f });
      return;
    }
    d && !Ne(f, d) && o.push({ type: "set", id: i, previous: f, next: d });
  }), o;
}, Hs = (e, t, o = {}) => {
  const s = Ft(
    Go(e),
    Go(t)
  ), r = o.metadataPatches || Pn(e.editorMetaById, t.editorMetaById), a = o.sectionRowPatches || Bn(e.sectionRows, t.sectionRows), i = wo(s, r);
  return a.forEach((f) => i.push(f.id)), {
    layoutPatches: s,
    metadataPatches: r,
    sectionRowPatches: a,
    affectedIds: Array.from(new Set(i)),
    beforeSummary: Ls(e),
    afterSummary: Ls(t),
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
}, Fs = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Bt = (e) => Me(e), qe = (e) => ({
  ...e,
  selectedIds: e.selectedIds.slice()
}), at = (e) => ({
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
}), ct = (e, t) => {
  let o = 1, s = `${e}-copy`;
  for (; t.has(s); )
    o += 1, s = `${e}-copy-${o}`;
  return t.add(s), s;
}, $n = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e), U = (e) => typeof e == "number" && Number.isFinite(e), Fe = (e, t) => Math.max(1, Math.floor(U(e) ? e : t)), Jt = (e) => e.payload && typeof e.payload == "object" ? e.payload : {}, Gn = (e) => e === "vertical" || e === "horizontal" || e === null, js = (e) => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift", Ns = (e) => e === "s" || e === "w" || e === "e" || e === "n" || e === "sw" || e === "nw" || e === "se" || e === "ne", Ks = (e) => e || "invalid-input", zn = (e, t, o) => {
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
}, Tt = (e, t, o, s) => {
  const r = {};
  return { items: e.map((i) => {
    const f = s(i.i, o);
    return t[i.i] && (r[f] = { ...t[i.i] }), { ...zo(i), i: f };
  }), metaById: r };
}, mi = (e) => {
  var Uo;
  const t = e.kind || (e.layouts ? "responsive" : "layout"), o = Ee([]), s = Ee({}), r = e.layout || o, a = e.layouts || s, i = e.breakpoint || Ee("default"), f = !e.mode && !e.defaultMode, d = Ee(e.defaultMode || "view"), c = e.mode || d, y = Ee(
    Me(e.defaultEditorMetaById)
  ), u = e.editorMetaById || y, p = Ee(
    e.defaultSectionRows || _s()
  ), m = e.sectionRows || p, v = Ee(
    Ge(
      ((Uo = e.selectedIds) == null ? void 0 : Uo.value) || e.defaultSelectedIds || [],
      e.selectedIds ? "external" : "api"
    )
  ), C = Ee(null), S = Ee({ ...xo }), k = Ee(null), F = Ee(null), X = Ee(null), A = Ee(!1), ce = Ee(!1), L = Ee(v.value.activeId), w = Ee(!1), R = [], D = /* @__PURE__ */ new Set();
  let M = 0, T = 0;
  e.onEvent && D.add(e.onEvent);
  const G = (n) => {
    T += 1;
    try {
      return n();
    } finally {
      T -= 1;
    }
  }, z = (n) => {
    const l = [];
    for (const h of Array.from(D))
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
    for (const h of Array.from(D))
      try {
        h(I);
      } catch (x) {
      }
  }, q = (n) => {
    let l = !0;
    return w.value || D.add(n), () => {
      l && (l = !1, D.delete(n));
    };
  }, E = () => t === "responsive" ? le(a.value[i.value] || []) : le(r.value), ge = (n) => {
    M += 1, G(() => {
      t === "responsive" ? (a.value = {
        ...a.value,
        [i.value]: le(n)
      }, e.layout && (r.value = le(n))) : r.value = le(n);
    });
  }, De = () => t === "responsive" ? so(a.value) : { default: le(r.value) }, ze = (n, l = i.value) => {
    M += 1, G(() => {
      a.value = so(n), i.value = l, e.layout && (r.value = le(n[l] || []));
    });
  }, W = () => t === "responsive" ? {
    kind: "responsive",
    layouts: De(),
    breakpoint: i.value,
    editorMetaById: Bt(u.value),
    sectionRows: at(m.value),
    selection: qe(v.value),
    focusId: L.value
  } : {
    kind: "layout",
    layout: E(),
    editorMetaById: Bt(u.value),
    sectionRows: at(m.value),
    selection: qe(v.value),
    focusId: L.value
  }, ve = (n) => {
    M += 1, n.kind === "responsive" ? ze(n.layouts, n.breakpoint) : ge(n.layout), u.value = Bt(n.editorMetaById), m.value = at(n.sectionRows), v.value = qe(n.selection), L.value = n.focusId;
  }, ie = Ee(W()), J = e.history === !1 ? null : e.history || Xr();
  J == null || J.replacePresent(W());
  const _e = (n) => ({
    id: `editor-rollback-checkpoint:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    kind: "grid-editor-rollback-checkpoint",
    snapshot: W(),
    history: J == null ? void 0 : J.checkpoint(),
    revision: M,
    reason: n
  }), Ue = (n, l = n.reason || "rollback-checkpoint-restore") => {
    mt.abortPending(l), X.value = null, He(l), ve(n.snapshot), J && n.history && J.restore(n.history), z({
      type: "editor-state-change",
      state: Ve.value,
      reason: l
    });
  }, yt = gs(() => !Ne(W(), ie.value)), Ve = gs(() => C.value ? "conflict" : ce.value ? "savePending" : A.value ? "saveFailed" : X.value ? X.value : k.value ? "placing" : c.value === "view" ? "viewing" : yt.value ? "editingDirty" : "editingClean"), et = $n(e.persistence) ? e.persistence : null, ot = Zr({
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
      ce.value = n.status === "saving", A.value = n.status === "error", z({
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
  }), st = (n, l = !1) => {
    const I = v.value, h = We(
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
    }), I) : Ne(I, h) ? I : (M += 1, v.value = h, L.value = h.activeId, z({
      type: "selection-change",
      selection: h,
      previous: I,
      requested: l
    }), h);
  }, Xe = (n, l, I, h = ((x) => (x = l.diagnostics) == null ? void 0 : x.guardMs)() || 0) => {
    var B, H, be;
    const g = Lt(
      n.history,
      to(n.type)
    ), P = {
      ...l,
      diagnostics: {
        ...l.diagnostics,
        durationMs: Fs() - I,
        guardMs: h,
        historyMode: ((B = l.diagnostics) == null ? void 0 : B.historyMode) || g.mode,
        source: ((H = l.diagnostics) == null ? void 0 : H.source) || n.source,
        origin: ((be = l.diagnostics) == null ? void 0 : be.origin) || n.origin
      }
    };
    return F.value = P, P.status === "blocked" || P.status === "cancelled" || P.status === "timeout" ? z({ type: "command-blocked", command: n, result: P }) : P.status === "error" ? z({ type: "command-error", command: n, result: P }) : z({ type: "command-commit", command: n, result: P }), X.value === "keyboardEditing" && n.source === "keyboard" && (X.value = null), P;
  }, we = (n, l, I, h) => {
    var B, H;
    const x = Lt(
      n.history,
      to(n.type)
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
    if (x.mode === "ignore" || !Ti(n.type))
      return I;
    const g = h || W(), P = Yr({
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
  }, it = (n) => io(n.type).mutualExclusionScope || "global", fo = (n, l, I) => {
    const h = io(n.type);
    return {
      id: `${n.id}:transaction`,
      commandId: n.id,
      command: n,
      source: n.source || h.defaultSource || "api",
      origin: n.origin,
      scope: it(n),
      before: l,
      after: I,
      preview: Hs(l, I, {
        risk: h.risk
      }),
      history: Lt(
        n.history,
        h.defaultHistory.mode || to(n.type)
      )
    };
  }, Xt = (n, l, I) => {
    if (e.selectedIds) {
      Ne(n.selection, l.selection) || z({
        type: "selection-change",
        selection: qe(l.selection),
        previous: qe(n.selection),
        requested: !0
      });
      return;
    }
    Ne(n.selection, I.selection) || z({
      type: "selection-change",
      selection: qe(I.selection),
      previous: qe(n.selection)
    }), n.focusId !== I.focusId && z({
      type: "focus-change",
      from: n.focusId,
      to: I.focusId,
      reason: "transaction"
    });
  }, rt = (n, l, I, h = {}) => {
    const x = !!e.selectedIds, g = x ? nt(I, {
      selection: l.selection,
      focusId: l.focusId
    }) : I, P = fo(n, l, g), B = !Ne(l, g), H = h.status || (B ? "changed" : "noop"), be = xe(n, H, {
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
        ve(P.after), Xt(l, I, P.after);
      } catch (j) {
        try {
          ve(P.before);
        } catch (V) {
        }
        return us(n, "Editor transaction apply failed.", j);
      }
    else x && Xt(l, I, P.after);
    return we(n, l, be, P.after);
  }, pt = (n) => typeof e.layoutEngineOptions == "function" ? e.layoutEngineOptions() : e.layoutEngineOptions ? e.layoutEngineOptions : U(n.cols) ? {
    cols: Math.max(1, Math.floor(n.cols)),
    maxRows: U(n.maxRows) ? n.maxRows : 1 / 0,
    compactType: Gn(n.compactType) ? n.compactType : "vertical",
    allowOverlap: n.allowOverlap === !0,
    preventCollision: n.preventCollision === !0
  } : null, b = (n) => {
    const l = pt(n);
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
    const g = pt(h);
    return g ? await Promise.resolve(ko({
      id: x,
      phase: "commit",
      layout: l,
      operation: I,
      options: g
    })) : zn(x, l, I);
  }, ee = (n) => {
    var x, g, P, B;
    const l = (x = e.itemCapabilities) == null ? void 0 : x[n], I = ((g = e.resizeConstraints) == null ? void 0 : g[n]) || ((P = l == null ? void 0 : l.resizeConstraint) == null ? void 0 : P.aspectRatio), h = ((B = l == null ? void 0 : l.resizeConstraint) == null ? void 0 : B.handlePolicy) || (l != null && l.resizeHandles ? {
      allowedHandles: l.resizeHandles,
      blockedReason: "handle-disabled"
    } : void 0);
    if (!(!I && !h))
      return { aspectRatio: I, handlePolicy: h };
  }, se = async (n) => {
    try {
      return await n.read();
    } catch (l) {
      if (n !== bt)
        return bt.read();
      throw l;
    }
  }, ae = async (n, l) => {
    try {
      await n.write(l);
    } catch (I) {
      if (n !== bt) {
        await bt.write(l);
        return;
      }
      throw I;
    }
  }, Se = () => !e.clipboard || e.clipboard === "internal" ? bt : e.clipboard === "system" ? Ur() : e.clipboard, pe = (n, l) => ({
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
  }), Oe = (n, l, I, h = [], x) => ({
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
  }), Ze = (n) => {
    if (n.commandType && n.commandType !== "add" || n.source === "paste") return n;
    const l = Array.isArray(n.items) ? n.items : n.item ? [n.item] : [];
    if (l.length === 0) return n;
    const I = new Set(E().map((B) => B.i)), h = e.idGenerator || ct, x = n.editorMetaById || {}, g = {}, P = l.filter((B) => B && typeof B == "object").map((B, H) => {
      const be = typeof B.i == "string" && B.i.length > 0 ? B.i : `item-${H + 1}`, j = I.has(be) ? h(be, I) : be;
      return I.add(j), x[be] && (g[j] = { ...x[be] }), {
        ...B,
        i: j,
        x: U(B.x) ? B.x : 0,
        y: U(B.y) ? B.y : 0,
        w: Fe(B.w, 1),
        h: Fe(B.h, 1)
      };
    });
    return {
      ...n,
      commandType: "add",
      item: void 0,
      items: P,
      editorMetaById: Me(g, { layout: P })
    };
  }, He = (n) => {
    const l = k.value;
    return l ? (k.value = null, S.value = { ...xo }, z({ type: "placement-cancel", sessionId: l.id, reason: n }), l) : null;
  }, Yt = (n, l, I, h) => {
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
  }, yo = (n, l) => {
    const I = Le(m.value, l), h = [], x = [];
    return n.forEach((g) => {
      const P = I.itemMembership[g], B = P != null && P.sectionId ? I.items[P.sectionId] : void 0, H = P != null && P.rowId ? I.items[P.rowId] : void 0;
      B != null && B.locked || H != null && H.locked ? h.push(g) : (B != null && B.collapsed || H != null && H.collapsed) && x.push(g);
    }), h.length > 0 ? { reason: "section-row-locked", itemIds: h } : x.length > 0 ? { reason: "section-row-collapsed", itemIds: x } : null;
  }, Mt = (n, l) => {
    const I = new Set(l), h = /* @__PURE__ */ new Set();
    return Object.keys(n.itemMembership).forEach((x) => {
      const g = n.itemMembership[x];
      (g.sectionId && I.has(g.sectionId) || g.rowId && I.has(g.rowId)) && h.add(x);
    }), l.forEach((x) => {
      var g, P;
      (P = (g = n.items[x]) == null ? void 0 : g.itemIds) == null || P.forEach((B) => h.add(B));
    }), Array.from(h).sort();
  }, _t = (n, l) => {
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
  }, po = async (n, l, I, h) => {
    var Re, Gt, zt, Wo, qo, Vo, Zo, Jo, Qo, es, ts, os, ss, is, rs;
    const x = E(), g = Jt(n), P = [];
    let B, H = le(x), be = qe(h.selection), j = h.focusId;
    const V = ho(n.type) ? yo(l, x) : null;
    if (V)
      return xe(n, "blocked", {
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
      const K = P.slice();
      if (n.type === "add") {
        const Z = Me(g.editorMetaById, {
          layout: te
        });
        Object.keys(Z).forEach((Ye) => {
          K.push({ type: "set", id: Ye, next: Z[Ye] });
        });
      } else if (n.type === "paste") {
        const Z = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, Ye = Me(Z == null ? void 0 : Z.editorMetaById, {
          layout: te
        });
        Object.keys(Ye).forEach((St) => {
          K.push({ type: "set", id: St, next: Ye[St] });
        });
      }
      const Y = Ft(x, te), _ = Y.flatMap(
        (Z) => Z.type === "add" ? [Z.item.i] : []
      ), oe = Y.flatMap(
        (Z) => Z.type === "move" || Z.type === "resize" ? [Z.id] : []
      ), ue = wo(Y, K), ne = typeof g.placementSessionId == "string" ? {
        durationMs: 0,
        computed: {
          placement: {
            strategy: js(g.strategy) ? g.strategy : "first-fit",
            placementSource: js(g.strategy) ? g.strategy : "first-fit",
            collisionPolicy: g.collisionPolicy === "layout" || g.collisionPolicy === "block" ? g.collisionPolicy : void 0,
            sessionId: g.placementSessionId,
            source: typeof g.placementSource == "string" ? g.placementSource : void 0,
            insertedIds: _,
            shiftedIds: oe,
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
      } : B, fe = ht(
        Ot(h.editorMetaById, K),
        te
      ), Be = _.length > 0 && (n.type === "add" || n.type === "paste") ? Ge(_, "api") : We(
        h.selection,
        te,
        fe,
        "api"
      );
      return rt(n, h, nt(h, {
        layout: te,
        editorMetaById: fe,
        selection: Be,
        focusId: Be.activeId
      }), {
        status: ue.length > 0 ? "changed" : "noop",
        targetIds: l.length > 0 ? l : n.targetIds,
        layoutPatches: Y,
        metadataPatches: K,
        affectedIds: ue,
        selection: Be,
        blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
        diagnostics: ne
      });
    }
    if (ys(n.type)) {
      const K = g, Y = Le(m.value, x), _ = l.length > 0 ? l : K.id ? [K.id] : [], oe = _.filter((re) => !Y.items[re]);
      if (oe.length > 0)
        return xe(n, "blocked", {
          targetIds: _,
          blocked: {
            reason: "missing-item",
            itemIds: oe,
            message: "Section/row command referenced missing metadata."
          },
          diagnostics: {
            durationMs: 0,
            messages: [{
              code: "grid-editor.sectionRows.missing",
              level: "warning",
              message: "Section/row command referenced missing metadata.",
              itemIds: oe,
              recoverable: !0
            }]
          }
        });
      const ue = _.filter((re) => {
        var Ie;
        return (Ie = Y.items[re]) == null ? void 0 : Ie.locked;
      });
      if (ue.length > 0 && n.type !== "section-row-expand")
        return xe(n, "blocked", {
          targetIds: _,
          blocked: {
            reason: "section-row-locked",
            itemIds: Mt(Y, ue),
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
      const ne = at({
        items: Y.items,
        itemMembership: Y.itemMembership
      }), fe = Mt(Y, _);
      let Be = v.value.selectedIds.slice(), Z = L.value;
      const Ye = U(g.cols) ? g.cols : 12, St = U(g.maxRows) ? g.maxRows : 1 / 0;
      if (n.type === "section-row-collapse" || n.type === "section-row-expand") {
        const re = n.type === "section-row-collapse";
        _.forEach((Ie) => {
          ne.items[Ie] = { ...ne.items[Ie], collapsed: re };
        }), re && (Be = Be.filter((Ie) => !fe.includes(Ie)), Z && fe.includes(Z) && (Z = Be[0] || null));
      } else if (n.type === "section-row-reorder")
        _.forEach((re) => {
          ne.items[re] = {
            ...ne.items[re],
            order: _t(Y, K)
          };
        });
      else if (n.type === "section-row-move") {
        const re = U(K.dy) ? Math.floor(K.dy) : 0;
        H = H.map(
          (je) => fe.includes(je.i) ? { ...je, y: Math.max(0, je.y + re) } : je
        ), _.forEach((je) => {
          const Qe = ne.items[je];
          ne.items[je] = {
            ...Qe,
            bounds: Qe.bounds ? { ...Qe.bounds, y: Math.max(0, Qe.bounds.y + re) } : Qe.bounds
          };
        });
        const Ie = Yt(H, fe, Ye, St);
        if (!Ie.ok)
          return xe(n, "blocked", {
            targetIds: _,
            blocked: {
              reason: Ie.reason,
              itemIds: Ie.itemIds,
              message: `Section/row move blocked by ${Ie.reason}.`
            },
            diagnostics: {
              durationMs: 0,
              messages: [{
                code: `grid-editor.sectionRows.move.${Ie.reason}`,
                level: "warning",
                message: `Section/row move blocked by ${Ie.reason}.`,
                itemIds: Ie.itemIds,
                recoverable: !0
              }]
            }
          });
      } else n.type === "section-row-delete" && (_.forEach((re) => {
        delete ne.items[re];
      }), Object.keys(ne.itemMembership || {}).forEach((re) => {
        var Qe, At;
        const Ie = ((Qe = ne.itemMembership) == null ? void 0 : Qe[re]) || {}, je = {
          sectionId: Ie.sectionId && _.includes(Ie.sectionId) ? void 0 : Ie.sectionId,
          rowId: Ie.rowId && _.includes(Ie.rowId) ? void 0 : Ie.rowId
        };
        !je.sectionId && !je.rowId ? (At = ne.itemMembership) == null || delete At[re] : ne.itemMembership && (ne.itemMembership[re] = je);
      }), K.deleteItems === !0 && (H = H.filter((re) => !fe.includes(re.i)), fe.forEach((re) => {
        u.value[re] && P.push({ type: "remove", id: re, previous: u.value[re] });
      }), Be = Be.filter((re) => !fe.includes(re)), Z && fe.includes(Z) && (Z = Be[0] || null)));
      const Ut = Le(ne, H), mo = Ft(x, H), ns = {
        version: 1,
        items: Ut.items,
        itemMembership: Ut.itemMembership
      }, Je = ht(
        Ot(h.editorMetaById, P),
        H
      ), Ct = We(
        Ge(Be, "api"),
        H,
        Je,
        "api"
      ), Rt = Array.from(/* @__PURE__ */ new Set([..._, ...fe]));
      return rt(n, h, nt(h, {
        layout: H,
        editorMetaById: Je,
        sectionRows: ns,
        selection: Ct,
        focusId: Z
      }), {
        status: "changed",
        targetIds: _,
        layoutPatches: mo,
        metadataPatches: P,
        affectedIds: Rt,
        selection: Ct,
        diagnostics: {
          durationMs: 0,
          computed: {
            affectedIds: Rt,
            sectionRowContext: {
              source: "metadata"
            }
          },
          messages: [{
            code: `grid-editor.sectionRows.${n.type.replace("section-row-", "")}`,
            level: "info",
            message: `Section/row command ${n.type} applied.`,
            itemIds: fe,
            recoverable: !0
          }]
        }
      });
    }
    if (n.type === "select") {
      const K = v.value, Y = Cs(x, v.value, {
        id: typeof g.id == "string" ? g.id : void 0,
        ids: Array.isArray(g.ids) ? g.ids.filter((ue) => typeof ue == "string") : typeof g.id == "string" ? void 0 : l,
        toggle: g.toggle === !0,
        range: g.range === !0,
        source: n.source === "keyboard" ? "keyboard" : n.source === "pointer" ? "pointer" : "api"
      }), _ = We(
        Y,
        x,
        h.editorMetaById,
        Y.source
      ), oe = e.selectedIds ? K : _;
      return rt(n, h, nt(h, {
        selection: _,
        focusId: _.activeId
      }), {
        status: Ne(K, oe) ? "noop" : "changed",
        targetIds: oe.selectedIds,
        selection: oe
      });
    }
    if (n.type === "clearSelection") {
      const K = v.value, Y = We(
        Co("api"),
        x,
        h.editorMetaById,
        "api"
      ), _ = e.selectedIds ? K : Y;
      return rt(n, h, nt(h, {
        selection: Y,
        focusId: Y.activeId
      }), {
        status: Ne(K, _) ? "noop" : "changed",
        selection: _
      });
    }
    if (n.type === "move") {
      const K = U(g.dx) ? g.dx : null, Y = U(g.dy) ? g.dy : null, _ = U(g.x), oe = U(g.y), ue = Array.from(/* @__PURE__ */ new Set([...l, ...I])), ne = v.value.activeId && l.includes(v.value.activeId) ? v.value.activeId : l[0], fe = ne ? Pe(x, ne) : void 0, Be = (((Gt = n.targetIds) == null ? void 0 : Gt.filter(Boolean).length) || 0) > 1, Z = !n.targetIds && v.value.selectedIds.length > 1 && (K !== null || Y !== null), Ye = Be || Z, St = l.length === 1 && !Be && (_ || oe), Ut = l.length > 0 && !St && (l.length > 1 || Ye), mo = !!(e.layoutOperationRunner || pt(g));
      if (Ut || l.length === 1 && mo && (K !== null || Y !== null || _ || oe)) {
        const Je = K !== null ? K : _ && fe ? g.x - fe.x : 0, Ct = Y !== null ? Y : oe && fe ? g.y - fe.y : 0, Rt = {
          type: "groupMove",
          ids: l,
          activeId: ne,
          dx: Je,
          dy: Ct,
          userAction: n.source !== "api"
        }, re = await N(n, x, Rt, g);
        if (B = {
          durationMs: 0,
          layoutDiagnostics: re.diagnostics,
          operationResult: re
        }, re.status === "blocked") {
          const as = Ks((zt = re.blocked) == null ? void 0 : zt.reason);
          return xe(n, "blocked", {
            targetIds: ue,
            blocked: {
              reason: as,
              itemIds: ((Wo = re.blocked) == null ? void 0 : Wo.itemIds) || ue,
              skippedIds: I.length > 0 ? I : void 0,
              message: `Move command blocked by ${as}.`
            },
            diagnostics: B
          });
        }
        if (re.status === "error")
          return xe(n, "error", {
            targetIds: ue,
            diagnostics: B,
            error: re.error || { message: "Layout operation failed." }
          });
        const Ie = re.patches, je = re.affectedIds, Qe = Ie.length > 0 || re.status === "changed" || re.status === "fallback" ? "changed" : "noop", At = ht(
          Ot(h.editorMetaById, P),
          re.layout
        ), go = We(
          h.selection,
          re.layout,
          At,
          "api"
        );
        return rt(n, h, nt(h, {
          layout: re.layout,
          editorMetaById: At,
          selection: go,
          focusId: go.activeId
        }), {
          status: Qe,
          targetIds: ue,
          layoutPatches: Ie,
          metadataPatches: P,
          affectedIds: je,
          selection: go,
          blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
          diagnostics: B
        });
      }
      H = H.map((Je) => {
        if (!l.includes(Je.i)) return Je;
        const Ct = l.length === 1 && _ ? g.x : Je.x + (K || 0), Rt = l.length === 1 && oe ? g.y : Je.y + (Y || 0);
        return { ...Je, x: Math.max(0, Math.floor(Ct)), y: Math.max(0, Math.floor(Rt)) };
      });
    } else if (n.type === "resize") {
      const K = l[0], Y = K ? Pe(H, K) : void 0, _ = K ? ee(K) : void 0;
      if (Y && _) {
        const oe = U(g.w) ? g.w : Y.w + (U(g.dw) ? g.dw : 0), ue = U(g.h) ? g.h : Y.h + (U(g.dh) ? g.dh : 0), ne = await N(n, x, {
          type: "resize",
          id: K,
          x: U(g.x) ? Math.max(0, Math.floor(g.x)) : void 0,
          y: U(g.y) ? Math.max(0, Math.floor(g.y)) : void 0,
          w: Fe(oe, Y.w),
          h: Fe(ue, Y.h),
          handle: Ns(g.handle) ? g.handle : "se",
          constraint: _
        }, g);
        if (B = {
          durationMs: 0,
          layoutDiagnostics: ne.diagnostics,
          operationResult: ne
        }, ne.status === "blocked") {
          const fe = Ks((qo = ne.blocked) == null ? void 0 : qo.reason);
          return xe(n, "blocked", {
            targetIds: l,
            blocked: {
              reason: fe,
              itemIds: ((Vo = ne.blocked) == null ? void 0 : Vo.itemIds) || l,
              message: `Resize command blocked by ${fe}.`
            },
            diagnostics: B
          });
        }
        if (ne.status === "error")
          return xe(n, "error", {
            targetIds: l,
            diagnostics: B,
            error: ne.error || { message: "Layout operation failed." }
          });
        H = ne.layout;
      } else
        H = H.map((oe) => {
          if (oe.i !== K) return oe;
          const ue = U(g.w) ? g.w : oe.w + (U(g.dw) ? g.dw : 0), ne = U(g.h) ? g.h : oe.h + (U(g.dh) ? g.dh : 0);
          return {
            ...oe,
            x: U(g.x) ? Math.max(0, Math.floor(g.x)) : oe.x,
            y: U(g.y) ? Math.max(0, Math.floor(g.y)) : oe.y,
            w: Fe(ue, oe.w),
            h: Fe(ne, oe.h)
          };
        });
    } else if (n.type === "align") {
      const K = U(g.cols) ? g.cols : 12, Y = U(g.maxRows) ? g.maxRows : 1 / 0, _ = zs(x, g, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: K,
        maxRows: Y,
        skippedIds: I
      });
      if (B = _.diagnostics, _.status === "blocked")
        return xe(n, "blocked", {
          targetIds: l,
          blocked: _.blocked,
          diagnostics: B
        });
      H = _.layout;
    } else if (n.type === "distribute" || n.type === "tidy") {
      const K = U(g.cols) ? g.cols : 12, Y = U(g.maxRows) ? g.maxRows : 1 / 0, _ = n.type === "distribute" ? As(x, g, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: K,
        maxRows: Y,
        skippedIds: I
      }) : Os(x, g, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: K,
        maxRows: Y,
        skippedIds: I
      });
      if (B = _.diagnostics, _.status === "blocked")
        return xe(n, "blocked", {
          targetIds: l,
          blocked: _.blocked,
          diagnostics: B
        });
      H = _.layout;
    } else if (n.type === "add") {
      const K = Array.isArray(g.items) ? g.items : g.item ? [g.item] : [], Y = new Set(H.map((fe) => fe.i)), _ = e.idGenerator || ct, oe = K.filter((fe) => fe && typeof fe == "object").map((fe, Be) => {
        const Z = fe, Ye = typeof Z.i == "string" && !Y.has(Z.i) ? Z.i : _(typeof Z.i == "string" ? Z.i : `item-${Be + 1}`, Y);
        return Y.add(Ye), {
          ...Z,
          i: Ye,
          x: U(Z.x) ? Z.x : 0,
          y: U(Z.y) ? Z.y : 0,
          w: Fe(Z.w, 1),
          h: Fe(Z.h, 1)
        };
      }), ue = xt(H, oe, String(g.strategy || "first-fit"), g);
      if (B = pe(ue, g), ue.failed)
        return xe(n, "blocked", {
          targetIds: ue.summary.insertedIds,
          blocked: {
            reason: ((Zo = ue.blocked) == null ? void 0 : Zo.reason) || "bounds",
            itemIds: (Jo = ue.blocked) == null ? void 0 : Jo.itemIds,
            message: ((Qo = ue.blocked) == null ? void 0 : Qo.message) || "One or more items could not fit in the current layout."
          },
          diagnostics: B
        });
      const ne = Me(g.editorMetaById, { layout: oe });
      Object.keys(ne).forEach((fe) => {
        oe.some((Be) => Be.i === fe) && P.push({ type: "set", id: fe, next: ne[fe] });
      }), H = ue.layout;
    } else if (n.type === "delete") {
      const K = new Set(l);
      H = H.filter((Y) => !K.has(Y.i)), l.forEach((Y) => {
        u.value[Y] && P.push({ type: "remove", id: Y, previous: u.value[Y] });
      }), j = Rs(H, l, u.value);
    } else if (n.type === "duplicate") {
      const K = l.map((oe) => Pe(x, oe)).filter(Boolean), Y = Tt(
        K,
        u.value,
        new Set(x.map((oe) => oe.i)),
        e.idGenerator || ct
      );
      Object.keys(Y.metaById).forEach((oe) => {
        P.push({ type: "set", id: oe, next: Y.metaById[oe] });
      });
      const _ = xt(
        H,
        Y.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (B = pe(_, g), _.failed)
        return xe(n, "blocked", {
          targetIds: l,
          blocked: {
            reason: ((es = _.blocked) == null ? void 0 : es.reason) || "bounds",
            itemIds: ((ts = _.blocked) == null ? void 0 : ts.itemIds) || l,
            message: ((os = _.blocked) == null ? void 0 : os.message) || "Duplicated items could not fit in the current layout."
          },
          diagnostics: B
        });
      H = _.layout, be = Ge(Y.items.map((oe) => oe.i), "api"), j = be.activeId;
    } else if (n.type === "copy") {
      const K = l.map((Y) => Pe(x, Y)).filter(Boolean);
      return await ae(Se(), Wr({
        sourceId: n.id,
        items: K,
        editorMetaById: Me(u.value, { layout: K }),
        source: $(g)
      })), xe(n, "changed", {
        targetIds: l,
        affectedIds: l
      });
    } else if (n.type === "paste") {
      const K = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, Y = K ? {
        items: le(Array.isArray(K.items) ? K.items : []),
        editorMetaById: Me(K.editorMetaById),
        sourceId: typeof K.sourceId == "string" ? K.sourceId : n.id,
        copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 2,
        source: K.source,
        originalGeometryById: K.originalGeometryById
      } : await se(Se());
      if (!Y)
        return xe(n, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      const _ = (K == null ? void 0 : K.mapped) === !0 ? {
        items: le(Y.items)
      } : Io(Y, {
        cols: b(g)
      }), oe = (K == null ? void 0 : K.mapped) === !0 ? {
        items: le(_.items),
        metaById: Me(Y.editorMetaById, {
          layout: _.items
        })
      } : Tt(
        _.items,
        Y.editorMetaById,
        new Set(x.map((ne) => ne.i)),
        e.idGenerator || ct
      );
      Object.keys(oe.metaById).forEach((ne) => {
        P.push({ type: "set", id: ne, next: oe.metaById[ne] });
      });
      const ue = xt(
        H,
        oe.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (B = pe(ue, g), ue.failed)
        return xe(n, "blocked", {
          blocked: {
            reason: ((ss = ue.blocked) == null ? void 0 : ss.reason) || "bounds",
            itemIds: (is = ue.blocked) == null ? void 0 : is.itemIds,
            message: ((rs = ue.blocked) == null ? void 0 : rs.message) || "Clipboard items could not fit in the current layout."
          },
          diagnostics: B
        });
      H = ue.layout, be = Ge(oe.items.map((ne) => ne.i), "api"), j = be.activeId;
    } else ps(n.type) && l.forEach((K) => {
      const Y = n.type === "lock" ? { locked: !0 } : n.type === "unlock" ? { locked: !1 } : n.type === "show" ? { visible: !0 } : { visible: !1 }, _ = ms(u.value, K, Y);
      _.patch && P.push(_.patch);
    });
    const ye = Ft(x, H), O = ht(
      Ot(h.editorMetaById, P),
      H
    ), Q = We(
      be,
      H,
      O,
      be.source
    ), me = j !== h.focusId ? j : Q.activeId, de = wo(ye, P), ke = de.length > 0 ? "changed" : "noop";
    return rt(n, h, nt(h, {
      layout: H,
      editorMetaById: O,
      selection: Q,
      focusId: me
    }), {
      status: ke,
      targetIds: l.length > 0 ? l : n.targetIds,
      layoutPatches: ye,
      metadataPatches: P,
      affectedIds: de,
      selection: e.selectedIds ? h.selection : Q,
      blocked: I.length > 0 ? { reason: "capability", skippedIds: I, itemIds: I } : void 0,
      diagnostics: B
    });
  }, hi = (n, l) => n.kind === "responsive" ? {
    ...n,
    layouts: {
      ...so(n.layouts),
      [n.breakpoint]: le(l)
    }
  } : {
    ...n,
    layout: le(l)
  }, nt = (n, l) => ({
    ...l.layout ? hi(n, l.layout) : n,
    editorMetaById: l.editorMetaById ? Bt(l.editorMetaById) : Bt(n.editorMetaById),
    sectionRows: l.sectionRows ? at(l.sectionRows) : at(n.sectionRows),
    selection: l.selection ? qe(l.selection) : qe(n.selection),
    focusId: l.focusId !== void 0 ? l.focusId : n.focusId
  }), jo = (n) => {
    const l = Jt(n), I = l.candidateLayout || l.placementCandidateLayout || l.afterLayout || l.layout;
    return Array.isArray(I) ? le(I.filter(
      (h) => !!h && typeof h == "object" && typeof h.i == "string"
    )) : null;
  }, vi = (n, l, I) => {
    const h = Jt(n);
    let x = jo(n), g = Bt(I.editorMetaById), P = at(I.sectionRows), B = qe(I.selection), H = I.focusId;
    const be = n.type === "delete" || n.type === "section-row-delete" ? "destructive" : ls(n.type) ? "persistence" : n.source === "external" || n.source === "remote" ? "external" : "normal";
    if (!x && n.type === "delete") {
      const j = new Set(l);
      x = E().filter((V) => !j.has(V.i)), l.forEach((V) => {
        delete g[V];
      }), B = Ge(
        B.selectedIds.filter((V) => !j.has(V)),
        n.source === "keyboard" ? "keyboard" : n.source === "pointer" ? "pointer" : "api"
      ), H = Rs(x, l, g);
    }
    if (!x && n.type === "move") {
      const j = U(h.dx) ? h.dx : null, V = U(h.dy) ? h.dy : null, te = U(h.x), ye = U(h.y);
      (j !== null || V !== null || te || ye) && (x = E().map((O) => l.includes(O.i) ? {
        ...O,
        x: te && l.length === 1 ? Math.max(0, Math.floor(h.x)) : Math.max(0, Math.floor(O.x + (j || 0))),
        y: ye && l.length === 1 ? Math.max(0, Math.floor(h.y)) : Math.max(0, Math.floor(O.y + (V || 0)))
      } : O));
    }
    if (!x && n.type === "resize") {
      const j = E(), V = l[0], te = V ? Pe(j, V) : void 0, ye = V ? ee(V) : void 0, O = ye ? pt(h) : null;
      if (te && ye && O) {
        const Q = U(h.w) ? h.w : te.w + (U(h.dw) ? h.dw : 0), me = U(h.h) ? h.h : te.h + (U(h.dh) ? h.dh : 0), de = ko({
          id: `${n.id}:preview-layout`,
          phase: "preview",
          layout: j,
          operation: {
            type: "resize",
            id: V,
            x: U(h.x) ? Math.max(0, Math.floor(h.x)) : void 0,
            y: U(h.y) ? Math.max(0, Math.floor(h.y)) : void 0,
            w: Fe(Q, te.w),
            h: Fe(me, te.h),
            handle: Ns(h.handle) ? h.handle : "se",
            constraint: ye
          },
          options: O
        });
        x = de.status === "blocked" || de.status === "error" ? j : de.layout;
      } else
        x = j.map((Q) => {
          if (Q.i !== V) return Q;
          const me = U(h.w) ? h.w : Q.w + (U(h.dw) ? h.dw : 0), de = U(h.h) ? h.h : Q.h + (U(h.dh) ? h.dh : 0);
          return {
            ...Q,
            x: U(h.x) ? Math.max(0, Math.floor(h.x)) : Q.x,
            y: U(h.y) ? Math.max(0, Math.floor(h.y)) : Q.y,
            w: Fe(me, Q.w),
            h: Fe(de, Q.h)
          };
        });
    }
    if (!x && n.type === "add") {
      const j = Array.isArray(h.items) ? h.items : h.item ? [h.item] : [], V = new Set(E().map((O) => O.i)), te = e.idGenerator || ct, ye = j.filter((O) => O && typeof O == "object").map((O, Q) => {
        const me = O, de = typeof me.i == "string" && !V.has(me.i) ? me.i : te(typeof me.i == "string" ? me.i : `item-${Q + 1}`, V);
        return V.add(de), {
          ...me,
          i: de,
          x: U(me.x) ? me.x : 0,
          y: U(me.y) ? me.y : 0,
          w: Fe(me.w, 1),
          h: Fe(me.h, 1)
        };
      });
      if (ye.length > 0) {
        const O = xt(
          E(),
          ye,
          String(h.strategy || "first-fit"),
          h
        );
        O.failed || (x = O.layout, g = {
          ...g,
          ...Me(h.editorMetaById, { layout: ye })
        }, B = Ge(ye.map((Q) => Q.i), "api"), H = B.activeId);
      }
    }
    if (!x && n.type === "paste") {
      const j = h.resolvedClipboardPayload && typeof h.resolvedClipboardPayload == "object" ? h.resolvedClipboardPayload : null;
      if (j != null && j.items && Array.isArray(j.items)) {
        const V = {
          version: 2,
          sourceId: typeof j.sourceId == "string" ? j.sourceId : n.id,
          copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
          items: le(j.items),
          editorMetaById: Me(j.editorMetaById),
          source: j.source,
          originalGeometryById: j.originalGeometryById
        }, te = j.mapped === !0 ? le(V.items) : Io(V, {
          cols: b(h)
        }).items, ye = j.mapped === !0 ? {
          items: te,
          metaById: Me(j.editorMetaById, {
            layout: te
          })
        } : Tt(
          te,
          Me(j.editorMetaById),
          new Set(E().map((Q) => Q.i)),
          e.idGenerator || ct
        ), O = xt(
          E(),
          ye.items,
          String(h.strategy || e.pasteStrategy || "offset"),
          h
        );
        O.failed || (x = O.layout, g = { ...g, ...ye.metaById }, B = Ge(ye.items.map((Q) => Q.i), "api"), H = B.activeId);
      }
    }
    if (!x && n.type === "duplicate") {
      const j = l.map((ye) => Pe(E(), ye)).filter(Boolean), V = Tt(
        j,
        g,
        new Set(E().map((ye) => ye.i)),
        e.idGenerator || ct
      ), te = xt(
        E(),
        V.items,
        String(h.strategy || e.pasteStrategy || "offset"),
        h
      );
      te.failed || (x = te.layout, g = { ...g, ...V.metaById }, B = Ge(V.items.map((ye) => ye.i), "api"), H = B.activeId);
    }
    if (!x && n.type === "align") {
      const j = zs(E(), h, {
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
      const j = n.type === "distribute" ? As(E(), h, {
        targetIds: l,
        selectedIds: v.value.selectedIds,
        activeId: v.value.activeId,
        metaById: u.value,
        sectionRows: m.value,
        cols: U(h.cols) ? h.cols : 12,
        maxRows: U(h.maxRows) ? h.maxRows : 1 / 0
      }) : Os(E(), h, {
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
    if (ps(n.type) && l.forEach((j) => {
      const V = n.type === "lock" ? { locked: !0 } : n.type === "unlock" ? { locked: !1 } : n.type === "show" ? { visible: !0 } : { visible: !1 }, te = ms(g, j, V);
      te.patch && (g = Ot(g, [te.patch]));
    }), n.type === "select" ? (B = Cs(E(), v.value, {
      id: typeof h.id == "string" ? h.id : void 0,
      ids: Array.isArray(h.ids) ? h.ids.filter((j) => typeof j == "string") : typeof h.id == "string" ? void 0 : l,
      toggle: h.toggle === !0,
      range: h.range === !0,
      source: n.source === "keyboard" ? "keyboard" : n.source === "pointer" ? "pointer" : "api"
    }), H = B.activeId) : n.type === "clearSelection" && (B = Co("api"), H = null), ys(n.type)) {
      const j = h, V = Le(P, E()), te = l.length > 0 ? l : j.id ? [j.id] : [];
      if (te.filter((O) => !V.items[O]).length === 0) {
        const O = at({
          items: V.items,
          itemMembership: V.itemMembership
        }), Q = Mt(V, te);
        if (n.type === "section-row-collapse" || n.type === "section-row-expand") {
          const de = n.type === "section-row-collapse";
          te.forEach((ke) => {
            O.items[ke] = { ...O.items[ke], collapsed: de };
          }), de && (B = Ge(
            B.selectedIds.filter((ke) => !Q.includes(ke)),
            "api"
          ), H = B.activeId);
        } else if (n.type === "section-row-reorder")
          te.forEach((de) => {
            O.items[de] = {
              ...O.items[de],
              order: _t(V, j)
            };
          });
        else if (n.type === "section-row-move") {
          const de = U(j.dy) ? Math.floor(j.dy) : 0;
          x = (x || E()).map(
            (ke) => Q.includes(ke.i) ? { ...ke, y: Math.max(0, ke.y + de) } : ke
          ), te.forEach((ke) => {
            const Re = O.items[ke];
            O.items[ke] = {
              ...Re,
              bounds: Re.bounds ? { ...Re.bounds, y: Math.max(0, Re.bounds.y + de) } : Re.bounds
            };
          });
        } else n.type === "section-row-delete" && (te.forEach((de) => {
          delete O.items[de];
        }), Object.keys(O.itemMembership || {}).forEach((de) => {
          var Gt, zt;
          const ke = ((Gt = O.itemMembership) == null ? void 0 : Gt[de]) || {}, Re = {
            sectionId: ke.sectionId && te.includes(ke.sectionId) ? void 0 : ke.sectionId,
            rowId: ke.rowId && te.includes(ke.rowId) ? void 0 : ke.rowId
          };
          !Re.sectionId && !Re.rowId ? (zt = O.itemMembership) == null || delete zt[de] : O.itemMembership && (O.itemMembership[de] = Re);
        }), j.deleteItems === !0 && (x = (x || E()).filter((de) => !Q.includes(de.i)), Q.forEach((de) => {
          delete g[de];
        }), B = Ge(
          B.selectedIds.filter((de) => !Q.includes(de)),
          "api"
        ), H = B.activeId));
        const me = Le(O, x || E());
        P = {
          version: 1,
          items: me.items,
          itemMembership: me.itemMembership
        };
      }
    }
    return Hs(I, nt(I, {
      layout: x || void 0,
      editorMetaById: g,
      sectionRows: P,
      selection: B,
      focusId: H
    }), {
      risk: be
    });
  }, mt = Vr({
    beforeCommand: e.beforeCommand,
    guardTimeoutMs: e.guardTimeoutMs,
    getSnapshot: W,
    getStateRevision: () => M,
    check: (n) => fs(n, {
      mode: c.value,
      modeMissing: f,
      layout: E(),
      editorMetaById: u.value,
      selection: v.value,
      commandPolicy: e.commandPolicy,
      itemCapabilities: e.itemCapabilities
    }),
    getGuardContext: (n, l, I, h) => {
      const x = Jt(n), g = x.placementSummary && typeof x.placementSummary == "object" ? x.placementSummary : void 0;
      return {
        source: n.source || "api",
        origin: n.origin,
        targetIds: l.allowedIds,
        layout: E(),
        layouts: De(),
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
    buildPreview: (n, l, I) => vi(n, l.allowedIds, I),
    cleanupInteraction: () => {
      X.value = null, He("command-cleanup");
    },
    finalize: Xe,
    now: Fs,
    isStopped: () => w.value,
    onStart: (n) => {
      n.source === "keyboard" && ho(n.type) && (X.value = "keyboardEditing"), z({ type: "command-start", command: n });
    },
    commit: async ({ command: n, check: l, before: I, startedAt: h, guardMs: x }) => {
      try {
        if (ls(n.type)) {
          const P = n.type === "save" ? await ot.save() : n.type === "discard" ? ot.discard() : ot.reset();
          return P.status === "changed" && (ie.value = W(), A.value = !1), Xe(n, { ...P, id: n.id }, h, x);
        }
        if (Di(n.type)) {
          const P = n.type === "undo" ? J == null ? void 0 : J.undo() : J == null ? void 0 : J.redo();
          return P ? (ve(n.type === "undo" ? P.before : P.after), Xe(n, xe(n, "changed", {
            affectedIds: P.affectedIds || P.after.selection.selectedIds,
            selection: v.value,
            undo: P,
            diagnostics: {
              durationMs: 0,
              historyMode: "ignore",
              source: n.source,
              origin: n.origin
            }
          }), h, x)) : Xe(n, xe(n, "blocked", {
            blocked: { reason: "missing-item", message: "No editor history entry is available." }
          }), h, x);
        }
        const g = await po(n, l.allowedIds, l.blockedIds, I);
        return Xe(n, g, h, x);
      } catch (g) {
        return g instanceof lt ? Xe(n, xe(n, "blocked", {
          targetIds: l.targetIds,
          blocked: {
            reason: g.code,
            itemIds: l.targetIds,
            message: g.message
          },
          error: { message: g.message, cause: g }
        }), h, x) : Xe(
          n,
          us(n, "Editor command failed.", g),
          h,
          x
        );
      }
    }
  }), No = (n) => {
    if (w.value || T > 0) return;
    mt.abortPending(n), X.value = null, He(n), M += 1;
    const l = E(), I = ht(u.value, l);
    Ne(I, u.value) || (u.value = I);
    const h = We(
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
  const gt = async (n) => mt.execute(n), bi = (n) => {
    var g;
    const l = io(n.type), I = Ys({
      source: l.defaultSource,
      ...n,
      history: n.history || l.defaultHistory
    }), h = fs(I, {
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
    return x && !x.ok ? oo(I, "invalid-input", {
      targetIds: h.targetIds,
      blocked: {
        reason: "invalid-input",
        itemIds: h.targetIds,
        message: x.message
      }
    }) : xe(I, "noop", {
      targetIds: h.allowedIds
    });
  }, Ii = async (n) => {
    var P, B, H, be, j, V, te;
    const l = n.commandType || (n.source === "paste" ? "paste" : "add");
    if (f)
      return Oe(l, "editor-mode-missing", "Editor mode is not configured.");
    if (c.value === "view")
      return Oe(l, "mode-readonly", "Placement requires edit mode.");
    if (w.value)
      return Oe(l, "unsupported-scope", "Editor controller is stopped.");
    if (X.value)
      return Oe(l, "unsupported-scope", `Cannot start placement while ${X.value}.`);
    if (k.value)
      return Oe(l, "command-pending", "A placement session is already active.");
    let I = {
      ...n,
      commandType: l
    };
    const h = pt({
      cols: n.cols,
      maxRows: n.maxRows,
      compactType: n.compactType,
      allowOverlap: n.allowOverlap,
      preventCollision: n.preventCollision
    });
    if (n.source === "paste" || l === "paste") {
      const ye = Se();
      let O = null, Q = null;
      try {
        O = await ye.read();
      } catch (Re) {
        Q = Re;
      }
      if ((!O || Q) && ye !== bt)
        try {
          O = await bt.read();
        } catch (Re) {
          Q || (Q = Re);
        }
      if (!O && Q) {
        const Re = Q instanceof lt ? Q.code : "clipboard-invalid";
        return Oe(
          "paste",
          Re,
          Q instanceof Error ? Q.message : "Clipboard could not be read."
        );
      }
      if (!O || O.items.length === 0)
        return Oe(
          "paste",
          "clipboard-unavailable",
          "Clipboard is empty or unavailable."
        );
      const me = Io(O, {
        cols: (P = n.cols) != null ? P : h == null ? void 0 : h.cols
      }), de = Tt(
        me.items,
        O.editorMetaById,
        new Set(E().map((Re) => Re.i)),
        e.idGenerator || ct
      ), ke = {
        items: de.items,
        editorMetaById: de.metaById,
        sourceId: O.sourceId,
        source: O.version === 2 ? O.source : void 0,
        originalGeometryById: O.version === 2 ? O.originalGeometryById : void 0,
        responsive: {
          scaled: me.scaled,
          sourceCols: me.sourceCols,
          targetCols: me.targetCols
        },
        mapped: !0
      };
      I = {
        ...I,
        commandType: "paste",
        items: de.items,
        editorMetaById: de.metaById,
        resolvedClipboardPayload: ke
      };
    } else
      I = Ze(I);
    const x = {
      ...I,
      compactType: (B = I.compactType) != null ? B : h == null ? void 0 : h.compactType,
      allowOverlap: (H = I.allowOverlap) != null ? H : h == null ? void 0 : h.allowOverlap,
      preventCollision: (be = I.preventCollision) != null ? be : h == null ? void 0 : h.preventCollision
    }, g = wn(x, {
      baseLayout: E(),
      baseRevision: M,
      defaultStrategy: x.strategy || (l === "paste" ? e.pasteStrategy || "offset" : "first-fit"),
      cols: x.cols,
      maxRows: x.maxRows
    });
    return g.items.length === 0 || g.blocked && g.ghostItems.length === 0 ? Oe(
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
  }, xi = (n) => {
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
  }, wi = (n = "cancelled") => {
    const l = k.value;
    if (!l) return { status: "noop" };
    const I = Mn(l, n);
    return He(n), I;
  }, ki = (n) => {
    var I;
    const l = (I = n.blocked) == null ? void 0 : I.reason;
    return n.status === "blocked" && (l === "bounds" || l === "collision" || l === "maxRows" || l === "section-row-policy" || l === "invalid-input");
  }, Mi = async (n = {}) => {
    var g, P, B, H, be, j, V, te, ye;
    const l = k.value;
    if (!l)
      return xe({
        id: `placement-commit:noop:${Date.now()}`,
        type: "add"
      }, "noop");
    if (!l.candidateLayout || l.blocked) {
      const O = xe({
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
      return F.value = O, O;
    }
    if (M !== l.baseRevision) {
      const O = Ce(l) || { durationMs: 0 }, Q = xe({
        id: `placement-commit:stale:${l.id}`,
        type: l.commandType
      }, "blocked", {
        targetIds: l.items.map((me) => me.i),
        blocked: {
          reason: "stale-command",
          itemIds: l.items.map((me) => me.i),
          message: "Placement base layout changed before commit."
        },
        diagnostics: {
          ...O,
          durationMs: O.durationMs || 0,
          stale: !0,
          stateRevision: M
        }
      });
      return F.value = Q, He("stale-command"), Q;
    }
    const I = {
      ...l,
      phase: "committing",
      ghostItems: l.ghostItems.map((O) => ({ ...O, state: "committing" }))
    };
    k.value = I;
    const h = kn(I, n), x = await gt(h);
    if (z({ type: "placement-commit", sessionId: I.id, result: x }), x.status === "changed" || x.status === "noop" || (n == null ? void 0 : n.autoCancelOnBlocked) === !0 || !ki(x))
      He(x.status);
    else {
      const O = $o(l, {});
      k.value = {
        ...O,
        blocked: {
          reason: ((H = x.blocked) == null ? void 0 : H.reason) || ((be = O.blocked) == null ? void 0 : be.reason) || "invalid-input",
          itemIds: ((j = x.blocked) == null ? void 0 : j.itemIds) || ((V = O.blocked) == null ? void 0 : V.itemIds),
          message: ((te = x.blocked) == null ? void 0 : te.message) || ((ye = O.blocked) == null ? void 0 : ye.message),
          recoverable: !0
        },
        phase: "blocked"
      };
    }
    return x;
  }, Ko = (n) => Lt(n, "ignore"), Xo = (n) => {
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
  }, Si = (n, l = "external", I = {}) => {
    const h = Ko(I.history);
    mt.abortPending(I.origin || l), X.value = null, ge(n), M += 1, u.value = ht(u.value, n), st(We(v.value, n, u.value, "external")), Xo(h), z({
      type: "editor-state-change",
      state: Ve.value,
      reason: I.origin || l
    });
  }, Ci = (n, l, I = "external", h = {}) => {
    const x = Ko(h.history);
    mt.abortPending(h.origin || I), X.value = null, ze(n, l);
    const g = n[l] || [];
    M += 1, u.value = ht(u.value, g), st(We(v.value, g, u.value, "external")), Xo(x), z({
      type: "editor-state-change",
      state: Ve.value,
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
    n !== l && (n === "view" && X.value ? (X.value = null, ge(Yo)) : Yo = E(), n === "view" && (S.value = { ...xo }, He("mode-readonly")), z({ type: "mode-change", from: l, to: n, source: "external" }));
  })), R.push(vt(() => Ve.value, (n, l) => {
    n !== l && z({
      type: "editor-state-change",
      state: n,
      previous: l,
      reason: "derived-state"
    });
  })), e.selectedIds && R.push(vt(e.selectedIds, (n) => {
    mt.abortPending("external-selection"), M += 1, v.value = We(
      Ge(n, "external"),
      E(),
      u.value,
      "external"
    ), L.value = v.value.activeId, J == null || J.replacePresent(W(), { preserveRedoStack: !0 });
  }, { flush: "sync" })), R.push(vt(u, (n) => {
    const l = Me(n, { layout: E() });
    Ne(l, n) || (u.value = l);
  }, { deep: !0 })), R.push(vt(m, (n) => {
    const l = Le(n, E()), I = {
      version: 1,
      items: l.items,
      itemMembership: l.itemMembership
    };
    Ne(I, n) || (m.value = I);
    const h = v.value.selectedIds.filter((x) => {
      const g = l.itemMembership[x], P = g != null && g.sectionId ? l.items[g.sectionId] : void 0, B = g != null && g.rowId ? l.items[g.rowId] : void 0;
      return (P == null ? void 0 : P.collapsed) || (B == null ? void 0 : B.collapsed);
    });
    h.length > 0 && st(Ge(
      v.value.selectedIds.filter((x) => !h.includes(x)),
      "api"
    ));
  }, { deep: !0 }));
  const _o = {
    mode: c,
    state: Ve,
    selection: v,
    editorMetaById: u,
    sectionRows: m,
    placementSession: k,
    dirty: yt,
    conflict: C,
    guides: S,
    lastResult: F,
    subscribe: q,
    createRollbackCheckpoint: _e,
    restoreRollbackCheckpoint: Ue,
    execute: gt,
    canExecute: bi,
    beginPlacement: Ii,
    updatePlacement: xi,
    commitPlacement: Mi,
    cancelPlacement: wi,
    getToolbarState: () => En(_o),
    undo: () => gt({ type: "undo", source: "api" }),
    redo: () => gt({ type: "redo", source: "api" }),
    save: () => gt({ type: "save", source: "api" }),
    discard: () => gt({ type: "discard", source: "api" }),
    reset: () => gt({ type: "reset", source: "api" }),
    setExternalLayout: Si,
    setExternalLayouts: Ci,
    stop() {
      w.value || (w.value = !0, mt.abortPending("editor-stop"), He("editor-stop"), R.forEach((n) => n()), et == null || et.stop(), D.clear());
    }
  };
  return _o;
}, ca = mi, An = (e) => !!(e && typeof e == "object" && "getBoundingClientRect" in e), On = (e, t) => {
  const o = An(e.currentTarget) ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, s = t.transformScale || 1, r = (e.clientX - o.left) / s, a = (e.clientY - o.top) / s, i = t.itemSize || { w: 1, h: 1 }, f = {
    cols: t.cols,
    margin: t.margin,
    maxRows: t.maxRows,
    rowHeight: t.rowHeight,
    containerWidth: t.width || 0,
    containerPadding: t.containerPadding || t.margin
  }, d = ji(f, a, r, i.w, i.h);
  return {
    x: d.x,
    y: d.y,
    source: "pointer",
    clientX: e.clientX,
    clientY: e.clientY
  };
};
function Dn({
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
      const c = t(), y = On(d, {
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
const Qt = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Tn = () => ({
  activeId: null,
  guides: [],
  displayGuides: [],
  debugGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}), gi = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), Xs = (e) => !!(e && typeof e == "object" && !gi(e)), Ln = (e) => typeof e == "function" ? { ...e() || {} } : { ...e || {} }, Hn = (e, t, o) => ({
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
function Fn({
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
    return s.isLegacyLayoutEngine() ? Hn($, b.layout, b.operation) : ko({
      id: $,
      phase: b.phase,
      layout: b.layout,
      operation: b.operation,
      options: s.getLayoutEngineOptions()
    });
  }), u = o || e.persistence || (c == null ? void 0 : c.persistence);
  let p = null;
  const m = c && gi(u) ? u : c && Xs(u) ? Fi({
    ...u,
    kind: "layout",
    target: t,
    watchTarget: !1,
    meta: () => ({
      ...Ln(u.meta),
      editor: ao(
        (p == null ? void 0 : p.editorMetaById.value) || {},
        p == null ? void 0 : p.sectionRows.value
      )
    }),
    onEvent: (b) => {
      var $;
      if (b.type === "load-success" || b.type === "external-apply") {
        const N = ro(b.document);
        N.ok && N.envelope && p && (p.editorMetaById.value = N.envelope.editorMetaById, N.envelope.sectionRows && (p.sectionRows.value = N.envelope.sectionRows)), p == null || p.setExternalLayout(b.value, b.type);
      }
      ($ = u.onEvent) == null || $.call(u, b);
    }
  }) : null, v = !!(c && m && Xs(u));
  p = c ? c.controller || mi({
    ...c,
    kind: "layout",
    layout: t,
    layoutOperationRunner: y,
    itemCapabilities: e.itemCapabilities,
    resizeConstraints: e.resizeConstraints,
    persistence: m || c.persistence
  }) : null;
  let C = null, S = null;
  const k = Dn({
    controller: p,
    getGeometry: () => ({
      width: e.width || 0,
      cols: e.cols,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      containerPadding: e.containerPadding || e.margin,
      transformScale: e.transformScale || 1,
      compactType: ds(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision
    }),
    stopEvent: (b) => {
      b.preventDefault(), b.stopPropagation();
    }
  }), F = () => !!p, X = () => !!(p && p.mode.value === "view"), A = () => !!(p && p.mode.value === "edit"), ce = () => (p == null ? void 0 : p.editorMetaById.value) || {}, L = () => !!(p && (c == null ? void 0 : c.guides) !== !1), w = (b) => {
    var $;
    return ($ = e.itemCapabilities) == null ? void 0 : $[b];
  }, R = (b) => {
    var $;
    return ($ = e.resizeConstraints) == null ? void 0 : $[b];
  }, D = (b) => !!(w(b) || R(b)), M = () => {
    S = null;
  }, T = () => {
    p && (M(), p.guides.value = Tn());
  }, G = (b) => {
    const $ = d();
    return ($ == null ? void 0 : $.activeResizeId) === b ? "resize" : f() ? "drop" : ($ == null ? void 0 : $.activeDragId) === b ? "drag" : "api";
  }, z = (b) => {
    const $ = d(), N = ($ == null ? void 0 : $.activeResizeId) === b ? i() : ($ == null ? void 0 : $.activeDragId) === b ? a() : null;
    return N ? { [b]: Qt(N) } : void 0;
  }, q = (b, $, N) => {
    var ae;
    const ee = d(), se = b === "drag" && (ee != null && ee.dragBlocked) ? {
      reason: ee.dragBlockedReason || "collision",
      itemIds: (ae = ee.dragBlockedItemIds) != null && ae.length ? ee.dragBlockedItemIds : $ ? [$] : void 0,
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
      blocked: se
    };
  }, E = (b, $, N, ee) => {
    var pe, Ce;
    if (!p || !c || c.guides === !1) return null;
    const se = G(b), ae = q(se, b, ee), Se = Ao({
      layout: r(),
      activeItem: $,
      candidateItem: N,
      selectionIds: p.selection.value.selectedIds,
      metaById: ce(),
      sectionRows: p.sectionRows.value,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      compactType: ds(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      interaction: se,
      startGeometry: ae.startGeometry,
      options: ae
    });
    return p.guides.value = Se.guideState, (pe = c.onEvent) == null || pe.call(c, {
      type: "guide-change",
      guides: p.guides.value.guides,
      activeId: b
    }), (Ce = c.onEvent) == null || Ce.call(c, {
      type: "intelligence-change",
      activeId: b,
      diagnostics: Se.diagnostics
    }), { intelligence: Se, options: ae };
  }, ge = (b, $, N, ee, se) => {
    var Ce;
    const ae = E(b, $, N, se);
    if (!ae) return N;
    const Se = S == null ? void 0 : S.nextGuideId, pe = Dr(ae.intelligence, N, {
      snap: ae.options.snap,
      layout: ee || r(),
      cols: e.cols,
      maxRows: e.maxRows,
      allowOverlap: e.allowOverlap,
      metaById: ce(),
      previousGuideId: Se
    });
    return (pe.status === "snapped" || Se !== pe.nextGuideId) && ((Ce = c == null ? void 0 : c.onEvent) == null || Ce.call(c, {
      type: "snap-change",
      activeId: b,
      previousGuideId: Se,
      nextGuideId: pe.nextGuideId,
      snapKind: pe.snapKind,
      geometry: pe.geometry
    })), S = pe, pe.status !== "snapped" ? N : {
      ...N,
      ...pe.geometry
    };
  }, De = (b, $, N) => N != null && N.locked || $ != null && $.locked ? "locked" : (N == null ? void 0 : N.visible) === !1 || ($ == null ? void 0 : $.visible) === !1 ? "hidden" : N != null && N.static || b.static ? "static-item" : "capability", ze = (b, $, N) => {
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
    const ee = w(b.i), se = R(b.i);
    if (ee) {
      const pe = Qt(i() || b);
      return {
        ...ee,
        resizeConstraint: ze(
          se ? {
            ...ee.resizeConstraint,
            aspectRatio: se,
            handlePolicy: ((Se = ee.resizeConstraint) == null ? void 0 : Se.handlePolicy) || {
              allowedHandles: ee.resizeHandles,
              blockedReason: "handle-disabled"
            }
          } : ee.resizeConstraint,
          N,
          pe
        )
      };
    }
    const ae = eo(b, ce()[b.i], $);
    return {
      id: ae.id,
      visible: ae.visible,
      editable: ae.editable,
      draggable: ae.draggable,
      resizable: ae.resizable,
      bounded: ae.bounded,
      static: ae.source.layoutStatic === !0,
      locked: ae.locked,
      resizeHandles: ae.resizeHandles || [],
      deletable: ae.deletable,
      duplicatable: ae.duplicatable,
      copyable: ae.copyable,
      resizeConstraint: se || ae.resizeHandles ? {
        handlePolicy: ae.resizeHandles ? {
          allowedHandles: ae.resizeHandles,
          blockedReason: "handle-disabled"
        } : void 0,
        aspectRatio: se
      } : void 0,
      sources: ae.source.capabilitySources || {},
      sourceLists: {},
      diagnostics: ae.diagnostics || []
    };
  }, ve = (b) => {
    var ae, Se;
    const $ = D(b.id);
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
        reason: De(b.item, ce()[b.id], N),
        ids: [b.id],
        diagnostics: N == null ? void 0 : N.diagnostics
      };
    const ee = ze(
      N.resizeConstraint,
      b.metrics,
      Qt(i() || b.item)
    ), se = (ae = ee == null ? void 0 : ee.handlePolicy) == null ? void 0 : ae.allowedHandles;
    if (se && se.indexOf(b.handle) === -1)
      return {
        kind: "blocked",
        reason: "handle-disabled",
        ids: [b.id],
        message: "Resize handle is disabled by item capability policy.",
        diagnostics: N.diagnostics
      };
    if ((Se = ee == null ? void 0 : ee.aspectRatio) != null && Se.enabled) {
      const pe = Hi({
        startItem: {
          ...b.item,
          ...Qt(i() || b.item)
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
      return pe.kind === "blocked" ? {
        kind: "blocked",
        reason: pe.reason,
        ids: [b.id],
        diagnostics: pe.diagnostics
      } : {
        kind: "allowed",
        candidate: pe.candidate,
        constraint: ee,
        diagnostics: pe.diagnostics
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
    const $ = ce();
    if (!eo(
      b.item,
      $[b.id],
      { isDraggable: !0, isResizable: !0, isBounded: !0 }
    ).draggable)
      return {
        kind: "blocked",
        reason: De(b.item, $[b.id]),
        ids: [b.id],
        activeId: b.id
      };
    const se = p.selection.value.selectedIds.filter(Boolean), ae = typeof MouseEvent != "undefined" && b.event instanceof MouseEvent && (b.event.metaKey || b.event.ctrlKey || b.event.shiftKey);
    if (!(se.length > 1 && se.includes(b.id)))
      return !se.includes(b.id) && !ae && p.execute({
        type: "select",
        targetIds: [b.id],
        payload: { id: b.id },
        source: "pointer",
        history: { skip: !0 }
      }), { kind: "single", id: b.id };
    const pe = [], Ce = [];
    let Oe = "capability";
    return se.forEach((Ze) => {
      const He = Pe(b.layout, Ze);
      if (!He) {
        Ce.push(Ze), Oe = "missing-item";
        return;
      }
      eo(
        He,
        $[Ze],
        { isDraggable: !0, isResizable: !0, isBounded: !0 }
      ).draggable ? pe.push(Ze) : (Ce.push(Ze), Oe = De(He, $[Ze]));
    }), Ce.length > 0 && (c == null ? void 0 : c.commandPolicy) !== "skip-blocked" ? {
      kind: "blocked",
      reason: Oe,
      ids: Ce,
      activeId: b.id
    } : b.legacyLayoutEngine ? {
      kind: "blocked",
      reason: "unsupported",
      ids: pe,
      activeId: b.id
    } : pe.length === 0 ? {
      kind: "blocked",
      reason: Oe,
      ids: Ce.length > 0 ? Ce : [b.id],
      activeId: b.id
    } : {
      kind: "group",
      activeId: b.id,
      ids: pe
    };
  }, J = (b) => {
    var ee;
    if (!p) return;
    const $ = {
      id: `pointer-move-blocked:${b.activeId || b.ids[0] || "layout"}:${Date.now()}`,
      type: "move",
      targetIds: b.ids,
      source: "pointer"
    }, N = xe($, "blocked", {
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
  }, _e = (b) => {
    t.value = le(b);
  }, Ue = (b) => {
    (b == null ? void 0 : b.status) === "changed" && (m == null || m.commit(t.value, { source: "component" }));
  }, yt = async (b) => {
    if (!p) return null;
    _e(b.beforeLayout);
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
    return Ue($), $;
  }, Ve = async (b) => {
    if (!p) return null;
    _e(b.beforeLayout);
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
    return Ue($), $;
  }, et = async (b) => {
    if (!p) return null;
    _e(b.beforeLayout);
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
    return Ue($), $;
  }, ot = (b) => {
    _e(b), T();
  }, st = (b, $ = "push") => {
    const N = c == null ? void 0 : c.legacyHistoryStore;
    N && ($ === "replace" ? N.replacePresent(b) : N.push(b));
  }, Xe = (b, $) => {
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
  }, it = (b, $, N) => {
    const ee = ce()[b.i], se = p || D(b.i) ? W(b, $) : null, ae = typeof b.isDraggable == "boolean" ? b.isDraggable : !b.static && $.isDraggable, Se = typeof b.isResizable == "boolean" ? b.isResizable : !b.static && $.isResizable, pe = !((se == null ? void 0 : se.visible) === !1 && !N), Ce = X() || !!(p && !(se != null && se.editable)), Oe = se ? (p ? A() : ae) && se.draggable : ae, Ze = se ? (p ? A() : Se) && se.resizable : Se, He = Oe && (se ? se.bounded : $.isBounded && b.isBounded !== !1), Yt = (p == null ? void 0 : p.selection.value.selectedIds.includes(b.i)) || !1, yo = (p == null ? void 0 : p.selection.value.activeId) === b.i, Mt = we(b), _t = p ? dt({
      "editor-selected": Yt,
      "editor-active": yo,
      "editor-locked": se == null ? void 0 : se.locked,
      "editor-hidden": (ee == null ? void 0 : ee.visible) === !1,
      "editor-readonly": Ce,
      "editor-keyboard-editing": p.state.value === "keyboardEditing",
      "editor-drop-target": N,
      "editor-placement-reflowed": !!Mt
    }) : void 0;
    return {
      visible: pe,
      draggable: Oe,
      resizable: Ze,
      bounded: He,
      resizeHandles: se == null ? void 0 : se.resizeHandles,
      capabilityDiagnostics: se == null ? void 0 : se.diagnostics,
      className: _t,
      previewItem: Mt,
      onClick: p ? (po) => Xe(b.i, po) : void 0
    };
  }, fo = (b) => {
    k.onClick(b) || b.target === b.currentTarget && p && A() && p.execute({ type: "clearSelection", source: "pointer" });
  }, Xt = (b) => {
    k.onPointerMove(b);
  }, rt = () => {
    p && (c == null ? void 0 : c.keyboard) !== !1 && (C = Zi(
      p,
      typeof (c == null ? void 0 : c.keyboard) == "object" ? c.keyboard : {}
    )), v && (m == null || m.load().then((b) => {
      b.value && b.fallbackApplied && (p == null || p.setExternalLayout(b.value, "persistence-fallback"));
    }));
  }, pt = () => {
    C == null || C(), C = null, k.cancel("runtime-stop"), c != null && c.controller ? v && (m == null || m.stop()) : p == null || p.stop();
  };
  return {
    config: c,
    controller: p,
    isEnabled: F,
    isViewMode: X,
    isEditMode: A,
    guidesEnabled: L,
    getMetaById: ce,
    clearGuides: T,
    resetSnap: M,
    snapCandidate: ge,
    updateIntelligence: E,
    resolveMoveDrag: ie,
    resolveResizeIntent: ve,
    notifyMoveBlocked: J,
    commitMove: yt,
    commitResize: Ve,
    commitDrop: et,
    rollbackInteraction: ot,
    syncHistory: st,
    getItemRenderState: it,
    isPlacementActive: k.isActive,
    onRootPointerMove: Xt,
    onRootClick: fo,
    mount: rt,
    stop: pt
  };
}
function jn({
  width: e,
  margin: t,
  containerPadding: o,
  rowHeight: s,
  renderPrecision: r = "integer",
  cols: a,
  maxRows: i
}) {
  const f = o, d = Ni({
    cols: a,
    containerPadding: f,
    containerWidth: e,
    margin: t
  }), c = (M) => Ki(M, r), y = (M) => c(f[0] + M * (d + t[0])), u = (M) => c(f[1] + M * (s + t[1])), p = (M) => c(f[0] + M * (d + t[0]) - t[0] / 2), m = (M) => c(f[1] + M * (s + t[1]) - t[1] / 2), v = (M) => c(y(M) - t[0]), C = (M) => c(u(M) - t[1]);
  return {
    padding: f,
    colWidth: d,
    gridLineXPx: y,
    gridLineYPx: u,
    guideXPx: (M) => M.kind === "right" ? v(M.position) : M.kind === "center-x" ? p(M.position) : y(M.position),
    guideYPx: (M) => M.kind === "bottom" ? C(M.position) : M.kind === "center-y" ? m(M.position) : u(M.position),
    spanXPx: (M, T) => ({
      start: y(M),
      end: v(T)
    }),
    spanYPx: (M, T) => ({
      start: u(M),
      end: C(T)
    }),
    spacingXPx: (M, T) => ({
      start: v(M),
      end: y(T)
    }),
    spacingYPx: (M, T) => ({
      start: C(M),
      end: u(T)
    }),
    itemLeftPx: (M) => c(f[0] + M * (d + t[0])),
    itemTopPx: (M) => c(f[1] + M * (s + t[1])),
    itemWidthPx: (M) => c(Math.max(0, M * d + Math.max(0, M - 1) * t[0])),
    itemHeightPx: (M) => c(Math.max(0, M * s + Math.max(0, M - 1) * t[1]))
  };
}
function Nn({
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
    var T;
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
    }, D = (G, z = !1) => {
      var W, ve;
      const q = o.snappedGuideIds.includes(G.id) || G.isSnapped === !0, E = G.kind === "spacing-x" || G.kind === "spacing-y", ge = typeof G.proximity == "number" ? G.proximity : q ? 1 : 0.4, De = q ? 1 : Math.max(0.18, 0.18 + ge * 0.62), ze = {
        ...R(G)
      };
      return !z && !q && (ze.opacity = String(Math.round(De * 100) / 100)), Te("div", {
        key: `${z ? "debug-" : ""}${G.id}`,
        class: dt(z ? "vue-grid-editor-debug-guide" : "vue-grid-editor-guide", `vue-grid-editor-guide-${G.axis}`, {
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
        "data-guide-proximity": String(Math.round(ge * 100) / 100),
        "data-guide-debug": z ? "true" : void 0,
        "data-guide-source-ids": G.sourceIds.join(",")
      }, (ve = G.display) != null && ve.showLabel && G.display.label ? [Te("span", {
        class: "vue-grid-editor-guide-label"
      }, G.display.label)] : void 0);
    }, M = w.map((G) => D(G));
    return o.debug && o.debugMode === "layer" && ((T = o.debugGuides) != null && T.length) ? M.push(Te("div", {
      key: "debug-guides-layer",
      class: "vue-grid-editor-debug-layer",
      "data-guide-debug-layer": "true"
    }, o.debugGuides.map((G) => D(G, !0)))) : o.debug && o.debugMode === "panel" && M.push(Te("div", {
      key: "debug-guides-panel",
      class: "vue-grid-editor-debug-panel",
      "data-guide-debug-panel": "true"
    }, `Debug guides: ${o.guides.length} candidates, ${w.length} shown`)), M;
  }, k = () => {
    if (!o) return [];
    const w = o.spacingChips || [];
    return w.length === 0 ? [] : w.map((R) => {
      const D = R.axis === "x", M = D ? y(R.span.start, R.span.end) : u(R.span.start, R.span.end), T = M.start, G = M.end, z = Math.max(1, G - T), q = D ? f({
        kind: "center-y",
        axis: "y",
        position: R.position
      }) : i({
        kind: "center-x",
        axis: "x",
        position: R.position
      }), E = D ? {
        left: `${T}px`,
        top: `${q}px`,
        width: `${z}px`
      } : {
        top: `${T}px`,
        left: `${q}px`,
        height: `${z}px`
      }, ge = `${R.distance} ${R.unit}${R.distance === 1 ? "" : "s"}`;
      return Te("div", {
        key: R.id,
        class: dt("vue-grid-editor-spacing-chip", `vue-grid-editor-spacing-chip-${R.side}`, `vue-grid-editor-spacing-chip-${R.axis}`, {
          "vue-grid-editor-spacing-chip-equal": R.isEqual
        }),
        style: E,
        "data-chip-id": R.id,
        "data-chip-side": R.side,
        "data-chip-equal": R.isEqual ? "true" : "false",
        "data-chip-neighbor": R.neighborId || "edge"
      }, [Te("span", {
        class: "vue-grid-editor-spacing-chip-label"
      }, ge)]);
    });
  }, F = () => {
    var z, q, E, ge;
    if (!o) return null;
    const w = o.measurementHud;
    if (!w) return null;
    const R = p(w.position.x) + v(w.size.w), D = m(w.position.y), M = `${w.size.w}×${w.size.h} · col ${w.position.x}, row ${w.position.y}`, T = [];
    (z = w.delta) != null && z.dw && T.push(`${w.delta.dw > 0 ? "+" : ""}${w.delta.dw} col${Math.abs(w.delta.dw) === 1 ? "" : "s"}`), (q = w.delta) != null && q.dh && T.push(`${w.delta.dh > 0 ? "+" : ""}${w.delta.dh} row${Math.abs(w.delta.dh) === 1 ? "" : "s"}`), (E = w.delta) != null && E.dx && T.push(`x ${w.delta.dx > 0 ? "+" : ""}${w.delta.dx}`), (ge = w.delta) != null && ge.dy && T.push(`y ${w.delta.dy > 0 ? "+" : ""}${w.delta.dy}`);
    const G = [Te("span", {
      class: "vue-grid-editor-measurement-hud-label"
    }, w.label || w.itemId), Te("span", {
      class: "vue-grid-editor-measurement-hud-dims"
    }, M)];
    return T.length > 0 && G.push(Te("span", {
      class: "vue-grid-editor-measurement-hud-delta"
    }, `Δ ${T.join(" · ")}`)), w.blocked && G.push(Te("span", {
      class: "vue-grid-editor-measurement-hud-blocked"
    }, w.blockedMessage || w.blocked)), Te("div", {
      key: `hud:${w.itemId}`,
      class: dt("vue-grid-editor-measurement-hud", `vue-grid-editor-measurement-hud-${w.interaction}`, {
        "vue-grid-editor-measurement-hud-blocked-state": !!w.blocked
      }),
      style: {
        left: `${R}px`,
        top: `${D}px`
      },
      "data-hud-item-id": w.itemId,
      "data-hud-interaction": w.interaction,
      "data-hud-blocked": w.blocked || void 0,
      role: "status",
      "aria-live": "polite"
    }, G);
  }, X = () => {
    if (!o) return [];
    const w = o.anchorEdges || [];
    if (w.length === 0) return [];
    const R = [];
    return w.forEach((D) => {
      const M = r.get(D.itemId) || a.find((E) => E.i === D.itemId);
      if (!M) return;
      const T = p(M.x), G = m(M.y), z = v(M.w), q = C(M.h);
      D.sides.forEach((E) => {
        const ge = {
          position: "absolute"
        };
        E === "left" ? Object.assign(ge, {
          left: `${T}px`,
          top: `${G}px`,
          height: `${q}px`,
          width: "2px"
        }) : E === "right" ? Object.assign(ge, {
          left: `${T + z - 2}px`,
          top: `${G}px`,
          height: `${q}px`,
          width: "2px"
        }) : E === "top" ? Object.assign(ge, {
          left: `${T}px`,
          top: `${G}px`,
          width: `${z}px`,
          height: "2px"
        }) : E === "bottom" ? Object.assign(ge, {
          left: `${T}px`,
          top: `${G + q - 2}px`,
          width: `${z}px`,
          height: "2px"
        }) : E === "center-x" ? Object.assign(ge, {
          left: `${T + z / 2 - 1}px`,
          top: `${G}px`,
          height: `${q}px`,
          width: "2px"
        }) : E === "center-y" && Object.assign(ge, {
          left: `${T}px`,
          top: `${G + q / 2 - 1}px`,
          width: `${z}px`,
          height: "2px"
        }), R.push(Te("div", {
          key: `anchor:${D.role}:${D.itemId}:${E}`,
          class: dt("vue-grid-editor-anchor-edge", `vue-grid-editor-anchor-edge-${E}`, `vue-grid-editor-anchor-edge-${D.role}`),
          style: ge,
          "data-anchor-item-id": D.itemId,
          "data-anchor-side": E,
          "data-anchor-role": D.role
        }));
      });
    }), R;
  }, A = () => s ? s.ghostItems.map((w) => {
    const R = w.item, D = w.state === "blocked" || s.phase === "blocked";
    return Te("div", {
      key: `placement-ghost:${s.id}:${w.id}`,
      class: dt("vue-grid-editor-placement-ghost", `vue-grid-editor-placement-ghost-${w.state}`, {
        "vue-grid-editor-placement-ghost-blocked": D,
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
      "data-placement-state": D ? "blocked" : w.state,
      "data-placement-x": String(R.x),
      "data-placement-y": String(R.y),
      "data-placement-w": String(R.w),
      "data-placement-h": String(R.h),
      "aria-hidden": "true"
    });
  }) : [], ce = () => s ? s.affectedOutlines.map((w) => {
    const R = w.after;
    return Te("div", {
      key: `placement-affected:${s.id}:${w.id}:${w.kind}`,
      class: dt("vue-grid-editor-placement-affected", `vue-grid-editor-placement-affected-${w.kind}`),
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
    const R = w ? p(w.x) + v(w.w) : 0, D = w ? m(w.y) : 0, M = s.blocked, T = M ? M.message || `Placement blocked by ${M.reason}.` : `${s.ghostItems.length} item${s.ghostItems.length === 1 ? "" : "s"}`;
    return Te("div", {
      key: `placement-hud:${s.id}`,
      class: dt("vue-grid-editor-placement-hud", {
        "vue-grid-editor-placement-hud-blocked": !!M
      }),
      style: {
        left: `${R}px`,
        top: `${D}px`
      },
      "data-placement-session-id": s.id,
      "data-placement-source": s.source,
      "data-placement-state": M ? "blocked" : s.phase,
      role: "status",
      "aria-live": "polite"
    }, T);
  };
  return [...ce(), ...A(), L(), ...X(), ...S(), ...k(), F()].filter(Boolean);
}
const Kn = (e) => {
  const t = e.props, o = Fn({
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
      return Nn({
        enabled: o.guidesEnabled() || o.isPlacementActive(),
        geometry: jn(s.geometry),
        guideState: (r = o.controller) == null ? void 0 : r.guides.value,
        placementSession: (a = o.controller) == null ? void 0 : a.placementSession.value,
        itemMap: s.itemMap,
        layout: s.layout
      });
    }
  };
}, Xn = {
  ...Ei,
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
}, da = Ri({
  name: "EditorGridLayout",
  props: Xn,
  createRuntimeExtension: Kn
});
export {
  yr as A,
  Qs as B,
  ia as C,
  Vi as D,
  da as E,
  Lr as F,
  lt as G,
  Rs as H,
  bt as I,
  hs as J,
  Io as K,
  na as L,
  Tr as M,
  _r as N,
  xt as O,
  ro as P,
  io as Q,
  Dr as R,
  We as S,
  jr as T,
  Us as U,
  oa as V,
  Ur as W,
  $o as X,
  Cs as Y,
  ca as Z,
  zs as a,
  As as b,
  Os as c,
  Zi as d,
  ra as e,
  kn as f,
  Js as g,
  Mn as h,
  Co as i,
  Er as j,
  br as k,
  ta as l,
  Ao as m,
  Wr as n,
  Vr as o,
  mi as p,
  Xr as q,
  Yr as r,
  Zr as s,
  ao as t,
  aa as u,
  wn as v,
  Ge as w,
  Hs as x,
  En as y,
  sa as z
};
