import { c as yi, b as pi } from "./createGridLayoutComponent-Dco68dmI.mjs";
import rt from "clsx";
import { e as mi, a as ie, o as Ae, m as Ct, l as gi, k as qo, s as hi, f as vi, d as wo, i as Wo } from "./utils-BCVYGne6.mjs";
import { d as bi } from "./migration-qxxmsuZ8.mjs";
import { z as Ii, A as _t, D as xe, v as Ps, w as Ot, h as Ut, b as qt, C as xi, g as Ie, F as wi, e as zt, d as fo, y as lt, q as Vo, n as ki, i as Zo, o as no, c as Jo, a as At, r as Qo, p as es, x as ts, E as Mi } from "./commands-Clty3hlM.mjs";
import { ref as Se, computed as os, watch as ut, h as Oe } from "vue";
import { deepEqual as Ne } from "fast-equals";
import { c as Wt, u as Si } from "./persistence-Db97X8w7.mjs";
import { e as Rs } from "./core-DAApYNVP.mjs";
import { f as Ci, c as Ei, a as Pi } from "./resolve-C3SqJijI.mjs";
const Ri = (e = "auto") => e === "mac" || e === "standard" ? e : typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "standard", Bi = (e) => !!(e && typeof e == "object"), Bs = (e, t = {}) => {
  var n;
  const o = e.target;
  if (!Bi(o)) return !1;
  const s = (n = o.tagName) == null ? void 0 : n.toUpperCase();
  return s === "INPUT" || s === "TEXTAREA" || s === "SELECT" || o.isContentEditable ? !0 : (t.ignoredTargets || []).some((i) => typeof i == "string" ? typeof o.matches == "function" && o.matches(i) : i(o));
}, $i = [
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
], Gi = (e, t) => e.toLowerCase() === t.toLowerCase(), Ai = (e, t, o) => {
  const s = o === "mac" ? e.metaKey : e.ctrlKey, r = o === "mac" ? e.ctrlKey : e.metaKey, n = t.primary === !0;
  return !(n !== s || n && r || !n && (e.ctrlKey || e.metaKey) || (t.shift || !1) !== e.shiftKey || (t.alt || !1) !== e.altKey);
}, Ti = (e, t) => {
  const o = Ri(t.platform), s = $i.find(
    (r) => (!r.platform || r.platform === o) && Gi(e.key, r.key) && Ai(e, r, o)
  );
  return s ? typeof s.command == "function" ? s.command(e, t) : { ...s.command } : null;
}, Oi = (e, t = {}) => {
  if (Bs(e, t)) return null;
  const o = e.key, s = e.shiftKey ? t.fastMoveStep || 4 : t.moveStep || 1, r = e.shiftKey ? t.fastResizeStep || 2 : t.resizeStep || 1, n = Ti(e, t);
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
}, ss = (e) => {
  var o, s, r, n, i;
  return e.status !== "blocked" && e.status !== "error" && e.status !== "timeout" ? null : {
    code: ((o = e.blocked) == null ? void 0 : o.reason) || ((s = e.error) == null ? void 0 : s.message) || "editor-command",
    level: e.status === "error" ? "error" : "warning",
    message: ((r = e.blocked) == null ? void 0 : r.message) || ((n = e.error) == null ? void 0 : n.message) || `Command ${e.type} was not applied.`,
    itemIds: (i = e.blocked) == null ? void 0 : i.itemIds,
    recoverable: e.status !== "error"
  };
}, Di = (e, t = {}) => {
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
    if (!Bs(i, t) && e.placementSession.value) {
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
          var h;
          const m = ss(p);
          (h = t.ariaMessage) == null || h.call(t, m || {
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
    const u = Oi(i, t);
    if (u) {
      if (i.preventDefault(), u.type === "paste" && t.pasteMode === "interactive") {
        e.beginPlacement({
          source: "paste",
          commandType: "paste",
          strategy: "cursor",
          placementIntent: "here",
          placementAnchor: "top-left"
        }).then((y) => {
          var l, p, m, h, C, M;
          y.status === "blocked" ? (h = t.ariaMessage) == null || h.call(t, {
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
      e.execute(u).then((y) => {
        var p;
        const l = ss(y);
        l && ((p = t.ariaMessage) == null || p.call(t, l));
      });
    }
  };
  return s.addEventListener("keydown", r), () => {
    s.removeEventListener("keydown", r);
  };
}, zi = 2, Li = 1, Fi = 0.5, Ni = 1, ji = 500, Hi = 0.01, Ki = {
  drag: 3,
  drop: 3,
  placement: 3,
  resize: 2,
  keyboard: 3,
  api: 3
}, is = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, rs = (e) => [
  { kind: "left", axis: "x", position: e.x, priority: 10, edge: "left" },
  { kind: "right", axis: "x", position: e.x + e.w, priority: 11, edge: "right" },
  { kind: "center-x", axis: "x", position: e.x + e.w / 2, priority: 20, edge: "center-x" },
  { kind: "top", axis: "y", position: e.y, priority: 10, edge: "top" },
  { kind: "bottom", axis: "y", position: e.y + e.h, priority: 11, edge: "bottom" },
  { kind: "center-y", axis: "y", position: e.y + e.h / 2, priority: 20, edge: "center-y" }
], Xi = (e, t) => {
  const o = [], s = e.x + e.w, r = t.x + t.w, n = e.y + e.h, i = t.y + t.h, u = Math.max(e.y, t.y), d = Math.min(n, i), c = Math.max(e.x, t.x), y = Math.min(s, r), l = u + Math.max(0, d - u) / 2, p = c + Math.max(0, y - c) / 2;
  if (d > u && s < t.x) {
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
  if (d > u && r < e.x) {
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
}, $s = (e, t, o) => {
  var s, r;
  return !(e.static && o.includeStatic === !1 || (s = t[e.i]) != null && s.locked && o.includeLocked === !1 || ((r = t[e.i]) == null ? void 0 : r.visible) === !1 && o.includeHidden !== !0);
}, Yi = (e, t) => e.y === t.y || e.y + e.h === t.y + t.h || e.x === t.x || e.x + e.w === t.x + t.w, _i = (e, t, o, s, r, n, i, u) => {
  const d = s.axis === "x" ? Math.min(t.y, o.y) : Math.min(t.x, o.x), c = s.axis === "x" ? Math.max(t.y + t.h, o.y + o.h) : Math.max(t.x + t.w, o.x + o.w), y = Math.abs(s.position - r.position), l = n > 0 ? Math.max(0, Math.min(1, 1 - y / n)) : y === 0 ? 1 : 0, p = y <= i, m = u && Yi(t, o) ? 20 : 0;
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
}, ct = (e) => e.kind === "spacing-x" || e.kind === "spacing-y", Ui = (e) => e.debug === !0 || e.debug === "layer" || e.debug === "panel", qi = (e) => e.debug === "panel" ? "panel" : e.debug === !0 || e.debug === "layer" ? "layer" : !1, Wi = (e, t) => {
  const o = e.maxVisibleGuides;
  return typeof o == "number" ? Math.max(0, o) : o && typeof o[t] == "number" ? Math.max(0, o[t] || 0) : Ki[t];
}, Vi = (e) => !!(e.display && Number.isFinite(e.display.start) && Number.isFinite(e.display.end) && e.display.end > e.display.start), ns = (e, t) => (t.includes(e.id) ? -1e3 : 0) + (e.isSnapped ? -500 : 0) + (ct(e) ? 20 : 0) - Math.round((e.proximity || 0) * 50), Zi = (e, t) => {
  const o = Array.from(/* @__PURE__ */ new Set([...e.sourceIds, ...t.sourceIds])), s = e.anchorIds || t.anchorIds ? Array.from(/* @__PURE__ */ new Set([...e.anchorIds || [], ...t.anchorIds || []])) : void 0;
  return {
    ...e,
    sourceIds: o,
    anchorIds: s,
    display: e.display ? { ...e.display, sourceIds: o } : e.display
  };
}, Ji = (e, t = {}, o = []) => {
  var y, l, p, m;
  const s = t.interaction || "drag", r = Wi(t, s);
  if (r <= 0) return [];
  const n = e.filter(Vi).slice().sort(
    (h, C) => ns(h, o) - ns(C, o) || h.distance - C.distance || h.priority - C.priority || h.id.localeCompare(C.id)
  ), i = /* @__PURE__ */ new Map(), u = [];
  for (let h = 0; h < n.length; h += 1) {
    const C = n[h], M = ct(C) ? `s:${C.kind}:${C.position}:${(l = (y = C.display) == null ? void 0 : y.start) != null ? l : ""}:${(m = (p = C.display) == null ? void 0 : p.end) != null ? m : ""}` : `a:${C.kind}:${C.axis}:${C.position}`, k = i.get(M);
    k ? ct(C) || i.set(M, Zi(k, C)) : (i.set(M, C), u.push(M));
  }
  const d = u.slice(0, r).map((h) => i.get(h)).filter(Boolean);
  let c = !1;
  return d.map((h) => {
    if (!h.display) return h;
    const C = t.showSpacingLabels !== !1 && ct(h) && !c;
    return C && (c = !0), {
      ...h,
      display: {
        ...h.display,
        showLabel: C
      }
    };
  });
}, jt = (e, t, o, s, r) => {
  const n = t.x + t.w, i = t.y + t.h;
  let u = null;
  for (let d = 0; d < o.length; d += 1) {
    const c = o[d];
    if (c.i === t.i || !$s(c, s, r)) continue;
    const y = c.x + c.w, l = c.y + c.h;
    if (e === "left" || e === "right") {
      const p = Math.max(t.y, c.y), m = Math.min(i, l);
      if (m <= p) continue;
      if (e === "left" && y <= t.x) {
        const h = t.x - y;
        (!u || h < u.distance) && (u = {
          id: c.i,
          distance: h,
          span: { start: y, end: t.x },
          position: p + (m - p) / 2
        });
      } else if (e === "right" && c.x >= n) {
        const h = c.x - n;
        (!u || h < u.distance) && (u = {
          id: c.i,
          distance: h,
          span: { start: n, end: c.x },
          position: p + (m - p) / 2
        });
      }
    } else {
      const p = Math.max(t.x, c.x), m = Math.min(n, y);
      if (m <= p) continue;
      if (e === "top" && l <= t.y) {
        const h = t.y - l;
        (!u || h < u.distance) && (u = {
          id: c.i,
          distance: h,
          span: { start: l, end: t.y },
          position: p + (m - p) / 2
        });
      } else if (e === "bottom" && c.y >= i) {
        const h = c.y - i;
        (!u || h < u.distance) && (u = {
          id: c.i,
          distance: h,
          span: { start: i, end: c.y },
          position: p + (m - p) / 2
        });
      }
    }
  }
  return u;
}, Qi = (e) => e === "left" || e === "right" ? "x" : "y", er = (e) => e === "left" || e === "right" ? "col" : "row", tr = (e, t, o, s) => {
  var p;
  if (s.showSpacingChips === !1) return [];
  const r = (p = s.spacingChipMinDistance) != null ? p : Ni, n = ["top", "right", "bottom", "left"], i = {
    top: jt("top", e, t, o, s),
    right: jt("right", e, t, o, s),
    bottom: jt("bottom", e, t, o, s),
    left: jt("left", e, t, o, s)
  }, u = (m, h) => !!(m && h && Math.abs(m.distance - h.distance) <= Hi), d = s.detectEqualSpacing !== !1, c = d && u(i.left, i.right), y = d && u(i.top, i.bottom), l = [];
  for (let m = 0; m < n.length; m += 1) {
    const h = n[m], C = i[h];
    if (!C || C.distance < r) continue;
    const M = h === "left" || h === "right" ? c : y;
    l.push({
      id: `chip:${e.i}:${h}:${C.id}`,
      side: h,
      axis: Qi(h),
      position: C.position,
      span: C.span,
      distance: C.distance,
      unit: er(h),
      isEqual: M,
      neighborId: C.id
    });
  }
  return l;
};
function or(e, t, o) {
  var i, u, d, c;
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
  }), (u = t.blocked) != null && u.reason && (r.blocked = t.blocked.reason), (d = t.blocked) != null && d.message && (r.blockedMessage = t.blocked.message), (c = t.blocked) != null && c.itemIds && (r.blockedItemIds = t.blocked.itemIds), typeof t.selectionCount == "number" && (r.selectionCount = t.selectionCount), r;
}
const sr = (e, t, o) => {
  if (o.highlightAlignmentTargets === !1) return [];
  if (!t) return [];
  const s = e.filter(
    (c) => !ct(c) && c.targetEdge && c.sourceEdge
  ), r = s.filter((c) => c.isSnapped), n = r.length > 0 ? r : s.slice().sort((c, y) => (y.proximity || 0) - (c.proximity || 0)).slice(0, 1), i = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
  for (let c = 0; c < n.length; c += 1) {
    const y = n[c];
    if (!(!y.targetEdge || !y.sourceEdge)) {
      i.has(y.axis) || i.set(y.axis, y.targetEdge);
      for (let l = 0; l < y.sourceIds.length; l += 1) {
        const p = y.sourceIds[l];
        u.has(p) || u.set(p, /* @__PURE__ */ new Map());
        const m = u.get(p);
        m && (m.has(y.axis) || m.set(y.axis, y.sourceEdge));
      }
    }
  }
  const d = [];
  return i.size > 0 && d.push({
    itemId: t,
    sides: Array.from(i.values()),
    role: "active"
  }), u.forEach((c, y) => {
    c.size !== 0 && d.push({
      itemId: y,
      sides: Array.from(c.values()),
      role: "source"
    });
  }), d;
}, ir = (e, t, o, s = {}, r = {}) => {
  var H, le, ae, Me;
  const n = is(), i = r.interaction || "drag";
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
  const u = (H = r.maxItems) != null ? H : ji, d = typeof r.thresholdPx == "number" ? r.thresholdPx : null, c = (le = r.predictRadiusX) != null ? le : d !== null ? d : zi, y = (ae = r.predictRadiusY) != null ? ae : d !== null ? d : Li, l = (Me = r.snapThresholdCells) != null ? Me : d !== null ? d : Fi, p = r.sectionSnap !== !1, m = e.filter(
    (J) => J.i !== t.i && $s(J, s, r)
  ), h = m.length > u, C = h ? m.slice(0, u) : m, M = rs(o), k = [];
  C.forEach((J) => {
    const U = rs(J);
    M.forEach((Q) => {
      U.forEach((Be) => {
        if (Q.axis !== Be.axis) return;
        const _e = Math.abs(Q.position - Be.position), Ue = Q.axis === "x" ? c : y;
        _e <= Ue && k.push(_i(
          t.i,
          J,
          o,
          Q,
          Be,
          Ue,
          l,
          p
        ));
      });
    }), Xi(J, o).forEach((Q) => {
      k.push({
        id: `${t.i}:${Q.kind}:${J.i}`,
        kind: Q.kind,
        axis: Q.axis,
        position: Q.position,
        sourceIds: [J.i],
        targetId: t.i,
        distance: Q.distance,
        priority: Q.priority,
        proximity: Q.distance === 0 ? 1 : 0.5,
        isPredictive: Q.distance > l,
        isSnapped: Q.distance <= l,
        anchorIds: [J.i, t.i],
        display: {
          kind: "spacing",
          start: Q.start,
          end: Q.end,
          label: Q.label,
          sourceIds: [J.i]
        }
      });
    });
  }), k.sort(
    (J, U) => J.distance - U.distance || J.priority - U.priority || J.id.localeCompare(U.id)
  );
  const z = k.filter((J) => !ct(J) && J.isSnapped), K = r.snap === !1 || z.length === 0 ? [] : [z[0].id], T = Ji(k, r, K), te = qi(r), D = Ui(r), x = T.filter((J) => {
    var U;
    return (U = J.display) == null ? void 0 : U.showLabel;
  }).map((J) => J.id), P = tr(o, e, s, r), A = or(o, r, i), R = sr(T, t.i, r), L = k.filter((J) => J.isPredictive && !ct(J)).length, S = z.length, B = is() - n, _ = typeof r.maxDurationMs == "number" && B > r.maxDurationMs;
  return {
    activeId: t.i,
    interaction: i,
    guides: k,
    displayGuides: T,
    debugGuides: D ? k : void 0,
    snappedGuideIds: K,
    spacingLabelGuideIds: x,
    spacingChips: P,
    measurementHud: A,
    anchorEdges: R,
    showGrid: r.showGrid !== !1,
    debug: D,
    debugMode: te,
    diagnostics: {
      durationMs: B,
      itemCount: m.length,
      degraded: h || _,
      reason: h ? "max-items" : _ ? "max-duration" : void 0,
      fullGuideCount: k.length,
      displayGuideCount: T.length,
      spacingLabelCount: x.length,
      predictCount: L,
      snappedCount: S,
      anchorEdgeCount: R.length,
      spacingChipCount: P.length
    }
  };
}, Kn = (e, t, o, s = {}, r = {}) => ko({
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
}).guideState, Xn = (e, t) => {
  const o = t.snappedGuideIds[0];
  if (!o) return e;
  const s = t.guides.find((r) => r.id === o);
  return !s || ct(s) ? e : s.axis === "x" ? s.kind === "right" ? { ...e, x: s.position - e.w } : s.kind === "center-x" ? { ...e, x: s.position - e.w / 2 } : { ...e, x: s.position } : s.kind === "bottom" ? { ...e, y: s.position - e.h } : s.kind === "center-y" ? { ...e, y: s.position - e.h / 2 } : { ...e, y: s.position };
}, as = (e) => !!e && typeof e == "object" && !Array.isArray(e), rr = (e) => {
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
}, Gs = () => ({
  version: 1,
  items: {},
  itemMembership: {}
}), De = (e, t = []) => {
  const o = new Set(t.map((d) => d.i)), s = t.length > 0, r = [];
  if (!e)
    return { version: 1, items: {}, itemMembership: {}, warnings: r };
  if (!as(e) || e.version !== 1 || !as(e.items))
    return r.push({
      code: "grid-editor.sectionRows.unknown-version",
      level: "warning",
      message: "Unsupported section/row metadata version was ignored.",
      recoverable: !0
    }), { version: 1, items: {}, itemMembership: {}, warnings: r };
  const n = {};
  Object.keys(e.items).sort().forEach((d) => {
    const c = rr(e.items[d]);
    c && (n[c.id] = c);
  });
  const i = {}, u = (d, c) => {
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
    u(d, {
      sectionId: c.sectionId && ((l = n[c.sectionId]) == null ? void 0 : l.kind) === "section" ? c.sectionId : void 0,
      rowId: c.rowId && ((p = n[c.rowId]) == null ? void 0 : p.kind) === "row" ? c.rowId : void 0
    });
  }), Object.keys(n).sort((d, c) => n[d].order - n[c].order || d.localeCompare(c)).forEach((d) => {
    const c = n[d];
    (c.itemIds || []).forEach((y) => {
      u(y, c.kind === "section" ? { sectionId: c.id } : { rowId: c.id });
    });
  }), { version: 1, items: n, itemMembership: i, warnings: r };
}, nr = 500, ar = 160, cr = 16, cs = 240, ds = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, dr = (e, t, o) => ({
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
}), yo = (e, t) => ({
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
}), lr = (e) => {
  const t = Object.keys(e).sort(), o = {}, s = {};
  return t.forEach((r) => {
    const n = e[r], i = Math.floor(n.top), u = Math.max(i, Math.floor(n.bottom - 1)), d = Math.floor(n.left), c = Math.max(d, Math.floor(n.right - 1));
    for (let y = i; y <= u; y++)
      o[y] || (o[y] = []), o[y].push(r);
    for (let y = d; y <= c; y++)
      s[y] || (s[y] = []), s[y].push(r);
  }), Object.keys(o).forEach((r) => o[Number(r)].sort()), Object.keys(s).forEach((r) => s[Number(r)].sort()), { byId: e, ids: t, rows: o, columns: s };
}, Jt = (e, t, o, s) => Math.max(0, Math.min(t, s) - Math.max(e, o)), ls = (e, t, o) => {
  if (o === "x") {
    const i = Jt(e.top, e.bottom, t.top, t.bottom);
    if (i <= 0) return null;
    const u = t.left >= e.right ? t.left - e.right : e.left >= t.right ? e.left - t.right : 0, d = t.left >= e.right ? "after" : e.left >= t.right ? "before" : "overlap";
    return {
      id: `${e.i}:x:${t.i}`,
      sourceId: e.i,
      targetId: t.i,
      axis: o,
      direction: d,
      gap: u,
      overlap: i,
      priority: u,
      sectionId: e.sectionId === t.sectionId ? e.sectionId : void 0,
      rowId: e.rowId === t.rowId ? e.rowId : void 0
    };
  }
  const s = Jt(e.left, e.right, t.left, t.right);
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
}, ur = (e) => {
  const t = Object.keys(e).sort(), o = [];
  for (let s = 0; s < t.length; s++)
    for (let r = s + 1; r < t.length; r++) {
      const n = e[t[s]], i = e[t[r]], u = ls(n, i, "x"), d = ls(n, i, "y");
      u && o.push(u), d && o.push(d);
    }
  return o.sort(
    (s, r) => s.priority - r.priority || s.axis.localeCompare(r.axis) || s.sourceId.localeCompare(r.sourceId) || s.targetId.localeCompare(r.targetId)
  );
}, fr = (e) => e.axis === "x" ? e.direction === "before" ? "left" : "right" : e.direction === "before" ? "top" : "bottom", yr = (e, t, o) => {
  const s = t.filter((n) => n.gap > 0).map((n) => {
    const i = e[n.sourceId], u = e[n.targetId], d = n.axis, c = d === "x" ? i.right <= u.left : i.bottom <= u.top, y = d === "x" ? c ? i.right : u.right : c ? i.bottom : u.bottom, l = d === "x" ? c ? u.left : i.left : c ? u.top : i.top, p = d === "x" ? Math.max(i.top, u.top) + n.overlap / 2 : Math.max(i.left, u.left) + n.overlap / 2;
    return {
      id: `${n.id}:spacing`,
      axis: d,
      sourceId: n.sourceId,
      targetId: n.targetId,
      side: fr(n),
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
}, us = (e) => e === "x" ? "horizontal" : "vertical", fs = (e) => e === "x" ? "spacing-x" : "spacing-y", Ht = (e, t, o, s) => {
  if (e.length < 3) return null;
  const r = e.slice().sort(
    (m, h) => t === "x" ? m.left - h.left || m.i.localeCompare(h.i) : m.top - h.top || m.i.localeCompare(h.i)
  ), n = r[0], i = r[r.length - 1], u = t === "x" ? { start: n.left, end: i.right } : { start: n.top, end: i.bottom }, d = [];
  for (let m = 1; m < r.length; m++) {
    const h = r[m - 1], C = r[m];
    d.push(o === "center-to-center" ? t === "x" ? C.centerX - h.centerX : C.centerY - h.centerY : t === "x" ? C.left - h.right : C.top - h.bottom);
  }
  const c = d.length > 0 ? d.reduce((m, h) => m + h, 0) / d.length : 0, y = d.reduce(
    (m, h) => Math.max(m, Math.abs(h - c)),
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
    bounds: u,
    anchor: { type: "selection" },
    sectionId: l.length === 1 ? l[0] : void 0,
    rowId: p.length === 1 ? p[0] : void 0
  };
}, pr = (e) => {
  var i, u;
  const t = De(e.sectionRows, e.layout), o = new Set(e.selectionIds || []), s = e.layout.filter((d) => o.size === 0 || o.has(d.i)).map((d) => yo(d, t.itemMembership[d.i]));
  if (s.length < 3) return [];
  const r = [
    Ht(s, "x", "edge-to-edge", us("x")),
    Ht(s, "y", "edge-to-edge", us("y")),
    Ht(s, "x", "center-to-center", fs("x")),
    Ht(s, "y", "center-to-center", fs("y"))
  ].filter(Boolean), n = (u = (i = e.options) == null ? void 0 : i.maxDistributionCandidates) != null ? u : cr;
  return r.sort((d, c) => d.deviation - c.deviation || d.id.localeCompare(c.id)).slice(0, n);
}, mr = (e, t, o, s) => {
  const r = { x: t.x, y: t.y, w: t.w, h: t.h };
  if (e.kind === "spacing-x" || e.kind === "spacing-y") return r;
  const n = s === "w" || s === "sw" || s === "nw", i = s === "n" || s === "ne" || s === "nw";
  if (o === "resize") {
    if (e.kind === "right") return { ...r, w: Math.max(1, e.position - t.x) };
    if (e.kind === "bottom") return { ...r, h: Math.max(1, e.position - t.y) };
    if (e.kind === "left" && n) {
      const u = t.x + t.w;
      return { ...r, x: e.position, w: Math.max(1, u - e.position) };
    }
    if (e.kind === "top" && i) {
      const u = t.y + t.h;
      return { ...r, y: e.position, h: Math.max(1, u - e.position) };
    }
  }
  return e.axis === "x" ? e.kind === "right" ? { ...r, x: e.position - t.w } : e.kind === "center-x" ? { ...r, x: e.position - t.w / 2 } : { ...r, x: e.position } : e.kind === "bottom" ? { ...r, y: e.position - t.h } : e.kind === "center-y" ? { ...r, y: e.position - t.h / 2 } : { ...r, y: e.position };
}, As = (e) => {
  var o, s, r;
  const t = (r = (o = e.options) == null ? void 0 : o.snapThresholdCells) != null ? r : (s = e.options) == null ? void 0 : s.thresholdPx;
  return typeof t == "number" && Number.isFinite(t) ? t : 0.5;
}, po = (e, t, o, s) => {
  if (s === !0) return !1;
  const r = e.itemMembership[t], n = e.itemMembership[o];
  if (!r || !n) return !1;
  if (r.sectionId && n.sectionId && r.sectionId !== n.sectionId) {
    const i = e.items[r.sectionId], u = e.items[n.sectionId];
    return (i == null ? void 0 : i.crossScopePolicy) !== "allow" && (u == null ? void 0 : u.crossScopePolicy) !== "allow";
  }
  if (r.rowId && n.rowId && r.rowId !== n.rowId) {
    const i = e.items[r.rowId], u = e.items[n.rowId];
    return (i == null ? void 0 : i.crossScopePolicy) !== "allow" && (u == null ? void 0 : u.crossScopePolicy) !== "allow";
  }
  return !1;
}, gr = (e, t, o, s, r) => {
  if (!t) return [];
  const n = As(e), i = e.layout.filter((l) => l.i !== t.i).sort((l, p) => l.i.localeCompare(p.i)), u = o.filter((l) => l.sourceId !== t.i && l.targetId !== t.i && l.distance > 0).sort((l, p) => l.distance - p.distance || l.id.localeCompare(p.id)), d = [], c = t.x + t.w, y = t.y + t.h;
  return i.forEach((l) => {
    const p = l.x + l.w, m = l.y + l.h, h = Jt(t.y, y, l.y, m) > 0, C = Jt(t.x, c, l.x, p) > 0, M = p <= t.x, k = c <= l.x, z = m <= t.y, K = y <= l.y;
    u.forEach((T) => {
      var te, D, x, P, A, R;
      if (T.axis === "x" && h && (M || k)) {
        const L = M ? t.x - p : l.x - c, S = Math.abs(L - T.distance);
        if (S <= n) {
          const B = M ? p + T.distance : l.x - T.distance - t.w, _ = po(
            s,
            l.i,
            t.i,
            (te = e.options) == null ? void 0 : te.allowCrossSectionRow
          ) ? "section-row-policy" : void 0;
          d.push({
            id: `snap:spacing:x:${t.i}:${l.i}:${T.id}`,
            kind: "spacing",
            axis: "x",
            sourceIds: [l.i, T.sourceId, T.targetId],
            targetId: t.i,
            targetEdge: M ? "left" : "right",
            sourceEdge: M ? "right" : "left",
            distance: S,
            proximity: n === 0 ? 1 : 1 - Math.min(1, S / n),
            priority: 30 + S,
            snapped: !_,
            geometry: { x: B, y: t.y, w: t.w, h: t.h },
            guideIds: [],
            sectionId: (D = s.itemMembership[t.i]) == null ? void 0 : D.sectionId,
            rowId: (x = s.itemMembership[t.i]) == null ? void 0 : x.rowId,
            blocked: _
          });
        }
      }
      if (T.axis === "y" && C && (z || K)) {
        const L = z ? t.y - m : l.y - y, S = Math.abs(L - T.distance);
        if (S <= n) {
          const B = z ? m + T.distance : l.y - T.distance - t.h, _ = po(
            s,
            l.i,
            t.i,
            (P = e.options) == null ? void 0 : P.allowCrossSectionRow
          ) ? "section-row-policy" : void 0;
          d.push({
            id: `snap:spacing:y:${t.i}:${l.i}:${T.id}`,
            kind: "spacing",
            axis: "y",
            sourceIds: [l.i, T.sourceId, T.targetId],
            targetId: t.i,
            targetEdge: z ? "top" : "bottom",
            sourceEdge: z ? "bottom" : "top",
            distance: S,
            proximity: n === 0 ? 1 : 1 - Math.min(1, S / n),
            priority: 30 + S,
            snapped: !_,
            geometry: { x: t.x, y: B, w: t.w, h: t.h },
            guideIds: [],
            sectionId: (A = s.itemMembership[t.i]) == null ? void 0 : A.sectionId,
            rowId: (R = s.itemMembership[t.i]) == null ? void 0 : R.rowId,
            blocked: _
          });
        }
      }
    });
  }), d.sort(
    (l, p) => l.priority - p.priority || p.proximity - l.proximity || l.distance - p.distance || l.id.localeCompare(p.id)
  ).slice(0, r);
}, hr = (e, t, o, s) => {
  if (!t) return [];
  const r = As(e), n = [], i = [
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
}, vr = (e, t, o, s, r, n, i, u) => t ? e.guides.map((d) => {
  const c = d.kind === "spacing-x" || d.kind === "spacing-y" ? "spacing" : d.kind === "center-x" || d.kind === "center-y" ? "center" : "edge", y = r.itemMembership[t.i], l = d.sourceIds.some(
    (p) => po(r, p, t.i, u)
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
    geometry: mr(d, t, n, i),
    guideIds: [d.id],
    sectionId: y == null ? void 0 : y.sectionId,
    rowId: y == null ? void 0 : y.rowId,
    blocked: l ? "section-row-policy" : void 0
  };
}).sort(
  (d, c) => (d.snapped === c.snapped ? 0 : d.snapped ? -1 : 1) || d.distance - c.distance || d.priority - c.priority || d.id.localeCompare(c.id)
).slice(0, s) : [], br = (e, t) => {
  const o = [];
  return e.forEach((s) => {
    const r = t[s.i];
    (r == null ? void 0 : r.visible) === !1 && o.push({ code: "grid-editor.intelligence.filtered.hidden", itemIds: [s.i], reason: "hidden" }), r != null && r.locked && o.push({ code: "grid-editor.intelligence.filtered.locked", itemIds: [s.i], reason: "locked" }), s.static && o.push({ code: "grid-editor.intelligence.filtered.static", itemIds: [s.i], reason: "static-item" });
  }), o;
}, ko = (e) => {
  var H, le, ae, Me, J, U, Q, Be, _e, Ue, tt, He, ht, vt, bt, I;
  const t = ds(), o = (le = (H = e.options) == null ? void 0 : H.maxItems) != null ? le : nr, s = (Me = (ae = e.options) == null ? void 0 : ae.maxSnapCandidates) != null ? Me : ar, r = ((J = e.options) != null && J.maxVisibleGuides, cs), n = e.metaById || {}, i = De(e.sectionRows, e.layout), u = e.layout.length > o ? e.layout.slice(0, o) : e.layout.slice(), c = bi().build(u, {
    cols: e.cols,
    maxRows: e.maxRows,
    compactType: e.compactType,
    allowOverlap: e.allowOverlap,
    preventCollision: e.preventCollision
  }).getLayout(), y = {};
  c.forEach((E) => {
    y[E.i] = yo(E, i.itemMembership[E.i]);
  }), e.candidateItem && !y[e.candidateItem.i] && (y[e.candidateItem.i] = yo(
    e.candidateItem,
    i.itemMembership[e.candidateItem.i]
  ));
  const l = lr(y), p = ur(y), m = yr(y, p, r), h = pr(e), C = e.interaction === "toolbar" ? "api" : e.interaction, M = e.activeItem && e.candidateItem ? ir(e.layout, e.activeItem, e.candidateItem, n, {
    ...e.options,
    interaction: C
  }) : dr(((U = e.activeItem) == null ? void 0 : U.i) || null, C), k = ((Q = e.options) == null ? void 0 : Q.snap) !== !1, z = vr(
    M,
    e.candidateItem,
    k,
    s,
    i,
    e.interaction,
    (Be = e.options) == null ? void 0 : Be.resizeHandle,
    (_e = e.options) == null ? void 0 : _e.allowCrossSectionRow
  ), K = gr(
    e,
    e.candidateItem,
    m,
    i,
    s
  ), te = [
    ...hr(
      e,
      e.candidateItem,
      i,
      s
    ),
    ...K,
    ...z
  ].map((E) => k ? E : { ...E, snapped: !1 }).sort(
    (E, Z) => E.priority - Z.priority || Z.proximity - E.proximity || E.distance - Z.distance || E.id.localeCompare(Z.id)
  ).slice(0, s), D = ds() - t, x = typeof ((Ue = e.options) == null ? void 0 : Ue.maxDurationMs) == "number" && D > e.options.maxDurationMs, P = e.layout.length > o || x || !!((tt = M.diagnostics) != null && tt.degraded), A = e.layout.length > o ? "max-items" : x ? "max-duration" : ((He = M.diagnostics) == null ? void 0 : He.reason) === "max-items" || ((ht = M.diagnostics) == null ? void 0 : ht.reason) === "max-duration" ? M.diagnostics.reason : void 0, R = br(e.layout, n), L = ["grid-editor.intelligence.computed"];
  e.layout.length > o && L.push("grid-editor.intelligence.degraded.max-items"), x && L.push("grid-editor.intelligence.degraded.max-duration"), h.some((E) => E.isEqual) ? L.push("grid-editor.distribution.equal") : h.length > 0 && L.push("grid-editor.distribution.unequal"), i.warnings.forEach((E) => L.push(E.code)), R.forEach((E) => L.push(E.code));
  const S = {
    durationMs: D,
    itemCount: e.layout.length,
    selectedCount: ((vt = e.selectionIds) == null ? void 0 : vt.length) || 0,
    candidateCount: te.length + h.length,
    snapCandidateCount: te.length,
    distributionCandidateCount: h.length,
    spacingRelationCount: m.length,
    sectionRowCount: Object.keys(i.items).length,
    snapSource: ((bt = te.find((E) => E.snapped)) == null ? void 0 : bt.kind) || "none",
    distributionMode: ((I = h[0]) == null ? void 0 : I.mode) || "none",
    sectionRowSource: Object.keys(i.items).length > 0 ? "metadata" : "none",
    degraded: P,
    reason: A,
    filtered: R,
    codes: L
  }, B = M.measurementHud, _ = {
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
    snapCandidates: te,
    spacingRelations: m,
    distributionCandidates: h,
    sectionRows: i,
    guideState: _,
    measurementHud: B,
    diagnostics: S
  };
}, ao = (e, t, o) => ({
  ...e,
  degraded: e.degraded || !!o,
  reason: o || e.reason,
  codes: e.codes.includes(t) ? e.codes : [...e.codes, t]
}), Ir = (e) => e === "collision" ? "grid-editor.snap.blocked.collision" : e === "bounds" ? "grid-editor.snap.blocked.bounds" : e === "maxRows" ? "grid-editor.snap.blocked.maxRows" : e === "section-row-policy" ? "grid-editor.snap.blocked.section-row-policy" : `grid-editor.snap.blocked.${e}`, xr = (e, t, o, s) => {
  var i, u;
  const r = (i = s.validate) == null ? void 0 : i.call(s, e, o);
  if (r) return r;
  if (o.blocked) return o.blocked;
  const n = (u = s.metaById) == null ? void 0 : u[t.i];
  if (n != null && n.locked) return "locked";
  if ((n == null ? void 0 : n.visible) === !1) return "hidden";
  if (t.static) return "static-item";
  if (e.x < 0 || e.y < 0 || typeof s.cols == "number" && e.x + e.w > s.cols) return "bounds";
  if (typeof s.maxRows == "number" && Number.isFinite(s.maxRows) && e.y + e.h > s.maxRows)
    return "maxRows";
  if (s.allowOverlap !== !0 && s.layout) {
    const d = { ...t, ...e };
    if (s.layout.find((y) => y.i !== t.i && mi(y, d))) return "collision";
  }
  return null;
}, wr = (e, t, o = {}) => {
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
      diagnostics: ao(e.diagnostics, "grid-editor.snap.disabled")
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
    const c = r[d], y = xr(c.geometry, t, c, o);
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
      diagnostics: ao(e.diagnostics, "grid-editor.snap.selected")
    };
  }
  const i = n[0], u = (i == null ? void 0 : i.reason) || "invalid-input";
  return {
    status: "blocked",
    candidate: i == null ? void 0 : i.candidate,
    geometry: s,
    guideIds: [],
    previousGuideId: o.previousGuideId,
    blocked: {
      reason: u,
      itemIds: [t.i],
      message: `Snap candidate blocked by ${u}.`
    },
    diagnostics: ao(
      e.diagnostics,
      Ir(u),
      u === "bounds" || u === "collision" || u === "maxRows" ? u : void 0
    )
  };
}, Re = (e = [], t = "api") => {
  const o = Array.from(new Set(e.filter(Boolean)));
  return {
    selectedIds: o,
    activeId: o.length > 0 ? o[o.length - 1] : null,
    anchorId: o.length > 0 ? o[0] : null,
    mode: o.length > 1 ? "multiple" : "single",
    source: t
  };
}, kr = (e) => {
  const t = Array.from(new Set(e.selectedIds.filter(Boolean))), o = e.activeId && t.includes(e.activeId) ? e.activeId : t[t.length - 1] || null, s = e.anchorId && t.includes(e.anchorId) ? e.anchorId : t[0] || null;
  return {
    ...e,
    selectedIds: t,
    activeId: o,
    anchorId: s,
    mode: t.length > 1 ? "multiple" : "single"
  };
}, Mr = (e) => e.map((t) => t.i), Sr = (e, t) => _t(e, t[e.i]).editable, Cr = (e, t, o, s) => {
  if (e.length <= 1) return e;
  const r = e.filter((i) => {
    const u = o.get(i);
    return u ? Sr(u, s) : !1;
  });
  if (r.length > 0) return r;
  const n = t && e.includes(t) ? t : e[e.length - 1];
  return n ? [n] : [];
}, qe = (e, t, o = {}, s = e.source) => {
  const r = t.filter((u) => {
    var d;
    return ((d = o[u.i]) == null ? void 0 : d.visible) !== !1;
  }), n = new Map(r.map((u) => [u.i, u])), i = Cr(
    e.selectedIds.filter((u) => n.has(u)),
    e.activeId,
    n,
    o
  );
  return kr({
    ...e,
    selectedIds: i,
    source: s
  });
}, Er = (e, t, o = "api") => Re(t, o), mo = (e = "api") => Re([], e), ys = (e, t, o) => {
  const s = o.source || "api";
  if (o.ids) return Er(t, o.ids, s);
  if (!o.id) return mo(s);
  const r = Mr(e);
  if (!r.includes(o.id)) return t;
  if (o.range && t.anchorId) {
    const n = r.indexOf(t.anchorId), i = r.indexOf(o.id);
    if (n >= 0 && i >= 0) {
      const u = Math.min(n, i), d = Math.max(n, i);
      return Re(r.slice(u, d + 1), s);
    }
  }
  if (o.toggle) {
    const n = new Set(t.selectedIds);
    return n.has(o.id) ? n.delete(o.id) : n.add(o.id), Re(Array.from(n), s);
  }
  return Re([o.id], s);
}, ps = (e, t, o = {}) => {
  const s = new Set(t), r = e.filter((n) => {
    var i;
    return !s.has(n.i) && ((i = o[n.i]) == null ? void 0 : i.visible) !== !1;
  });
  return r.length > 0 ? r[0].i : null;
}, Yn = (e, t, o, s) => {
  const r = s || Ii(e, t), n = new Set(o.selectedIds);
  return e.map((i) => {
    var c;
    const u = r[i.i], d = ["select", "copy"];
    return u != null && u.draggable && d.push("move"), u != null && u.resizable && d.push("resize"), u != null && u.deletable && d.push("delete"), u != null && u.duplicatable && d.push("duplicate"), u != null && u.locked ? d.push("unlock") : d.push("lock"), (u == null ? void 0 : u.visible) === !1 ? d.push("show") : d.push("hide"), {
      id: i.i,
      label: ((c = t[i.i]) == null ? void 0 : c.label) || i.i,
      position: { x: i.x, y: i.y, w: i.w, h: i.h },
      locked: !!(u != null && u.locked),
      selected: n.has(i.i),
      commands: d
    };
  });
}, Pr = 100, Rr = 650, ft = (e) => e.kind === "layout" ? {
  ...e,
  layout: ie(e.layout),
  editorMetaById: { ...e.editorMetaById },
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
} : {
  ...e,
  layouts: Wt(e.layouts),
  editorMetaById: { ...e.editorMetaById },
  selection: {
    ...e.selection,
    selectedIds: e.selection.selectedIds.slice()
  }
}, Br = (e = {}) => {
  const t = Math.max(1, Math.floor(e.maxSize || Pr)), o = e.mergeWindowMs || Rr, s = Se(!1), r = Se(!1);
  let n = [], i = [];
  const u = () => {
    s.value = n.length > 0, r.value = i.length > 0;
  }, d = () => {
    const l = n.length - t;
    l > 0 && (n = n.slice(l));
  }, c = (l, p) => {
    if (!l || !l.mergeKey || l.mergeKey !== p.mergeKey) return !1;
    const m = Date.parse(l.createdAt), h = Date.parse(p.createdAt);
    return Number.isFinite(m) && Number.isFinite(h) && h - m <= o;
  }, y = (l, p = {}) => {
    if (Ne(l.before, l.after)) return;
    const m = {
      ...l,
      before: ft(l.before),
      after: ft(l.after)
    }, h = n[n.length - 1];
    c(h, m) ? n[n.length - 1] = {
      ...h,
      after: ft(m.after),
      createdAt: m.createdAt
    } : n.push(m), p.preserveRedoStack || (i = []), d(), u();
  };
  return {
    canUndo: s,
    canRedo: r,
    push(l, p = {}) {
      y(l, p);
    },
    undo() {
      const l = n.pop();
      return l ? (i.unshift(l), u(), l) : null;
    },
    redo() {
      const l = i.shift();
      return l ? (n.push(l), d(), u(), l) : null;
    },
    replacePresent(l, p = {}) {
      p.preserveRedoStack || (i = []), u();
    },
    clear() {
      n = [], i = [], u();
    },
    mark(l, p) {
      return {
        id: `editor-history-mark:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        snapshot: ft(l),
        revision: p
      };
    },
    bailToMark(l) {
      return u(), ft(l.snapshot);
    },
    squashToMark(l, p, m = {}) {
      const h = {
        ...p,
        before: ft(l.snapshot),
        after: ft(p.after)
      };
      y(h, m);
    }
  };
}, $r = (e) => ({
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
const Dt = (e) => typeof e == "number" && Number.isFinite(e), go = (e) => Dt(e) && e > 0 ? Math.floor(e) : void 0, co = (e) => typeof e == "string" && e.length > 0 ? e : void 0, ho = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Ts = (e) => e.reduce((t, o) => (t[o.i] = ho(o), t), {}), Mo = (e) => {
  if (!e || typeof e != "object") return;
  const t = e, o = {}, s = go(t.cols);
  s && (o.cols = s);
  const r = co(t.breakpoint);
  r && (o.breakpoint = r);
  const n = co(t.layoutId);
  n && (o.layoutId = n);
  const i = co(t.viewFormat);
  return i && (o.viewFormat = i), Object.keys(o).length > 0 ? o : void 0;
}, So = (e, t) => {
  const o = Ts(t);
  if (!e || typeof e != "object") return o;
  const s = {};
  return Object.keys(e).forEach((r) => {
    const n = e[r];
    if (!n || typeof n != "object") return;
    const i = n;
    !Dt(i.x) || !Dt(i.y) || !Dt(i.w) || !Dt(i.h) || (s[r] = {
      x: i.x,
      y: i.y,
      w: i.w,
      h: i.h
    });
  }), {
    ...o,
    ...s
  };
}, Os = (e, t) => So(e, t), vo = (e) => {
  const t = ie(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt,
    items: t,
    editorMetaById: xe(e.editorMetaById)
  };
  return e.version === 2 ? {
    version: 2,
    ...o,
    source: Mo(e.source),
    originalGeometryById: Os(e.originalGeometryById, t)
  } : {
    version: 1,
    ...o
  };
};
let Kt = null;
const yt = {
  read() {
    return Kt ? vo(Kt) : null;
  },
  write(e) {
    Kt = vo(e);
  },
  clear() {
    Kt = null;
  }
}, ms = (e) => {
  if (!e || typeof e != "object") return !1;
  const t = e.name;
  return t === "NotAllowedError" || t === "SecurityError";
}, Gr = (e) => {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.version !== 1 && t.version !== 2 || typeof t.sourceId != "string" || typeof t.copiedAt != "string" || !Array.isArray(t.items)) return null;
  const o = ie(t.items), s = xe(t.editorMetaById);
  return t.version === 2 ? {
    version: 2,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s,
    source: Mo(t.source),
    originalGeometryById: So(t.originalGeometryById, o)
  } : {
    version: 1,
    sourceId: t.sourceId,
    copiedAt: t.copiedAt,
    items: o,
    editorMetaById: s
  };
}, Ar = () => ({
  async read() {
    if (typeof navigator == "undefined" || !navigator.clipboard || typeof navigator.clipboard.readText != "function")
      throw new nt(
        "clipboard-unavailable",
        "System clipboard is not available."
      );
    try {
      const e = await navigator.clipboard.readText();
      if (!e) return null;
      const t = JSON.parse(e), o = Gr(t);
      if (!o)
        throw new nt(
          "clipboard-invalid",
          "Clipboard does not contain a grid editor payload."
        );
      return o;
    } catch (e) {
      throw e instanceof nt ? e : new nt(
        ms(e) ? "clipboard-permission" : "clipboard-invalid",
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
      await navigator.clipboard.writeText(JSON.stringify(vo(e)));
    } catch (t) {
      throw new nt(
        ms(t) ? "clipboard-permission" : "clipboard-unavailable",
        "Failed to write grid editor payload to system clipboard.",
        t
      );
    }
  }
}), Tr = (e) => {
  const t = ie(e.items), o = {
    sourceId: e.sourceId,
    copiedAt: e.copiedAt || (/* @__PURE__ */ new Date()).toISOString(),
    items: t,
    editorMetaById: xe(e.editorMetaById, {
      layout: e.items
    })
  };
  return e.version === 1 ? {
    version: 1,
    ...o
  } : {
    version: 2,
    ...o,
    source: Mo(e.source),
    originalGeometryById: Os(e.originalGeometryById, t)
  };
}, lo = (e, t = {}) => {
  var u, d, c, y, l, p;
  const o = go(t.cols), s = "version" in e && e.version === 2 ? go((u = e.source) == null ? void 0 : u.cols) : void 0;
  if (!o || !s || t.scale === !1 || o === s)
    return {
      items: ie(e.items),
      scaled: !1,
      sourceCols: s,
      targetCols: o
    };
  const r = o / s, n = "version" in e && e.version === 2 ? So(e.originalGeometryById, e.items) : Ts(e.items), i = e.items.reduce((m, h) => {
    const C = n[h.i] || ho(h);
    return Math.min(m, C.x);
  }, (p = (l = (c = n[(d = e.items[0]) == null ? void 0 : d.i]) == null ? void 0 : c.x) != null ? l : (y = e.items[0]) == null ? void 0 : y.x) != null ? p : 0);
  return {
    items: e.items.map((m) => {
      const h = n[m.i] || ho(m), C = Math.max(1, Math.min(o, Math.round(h.w * r))), M = Math.max(
        0,
        Math.min(
          Math.max(0, o - C),
          Math.floor((h.x - i) * r)
        )
      );
      return {
        ...m,
        x: M,
        y: Math.max(0, Math.floor(h.y)),
        w: C,
        h: Math.max(1, Math.floor(h.h))
      };
    }),
    scaled: !0,
    sourceCols: s,
    targetCols: o
  };
}, pe = (e, t) => ({
  type: e,
  labelKey: t.labelKey || `grid-editor.command.${e}`,
  ...t
}), Pe = { mode: "record" }, pt = {
  mode: "ignore",
  preserveRedoStack: !0
}, Xt = (e) => !e.payload || typeof e.payload != "object" ? { ok: !1, message: `${e.type} requires an object payload.` } : { ok: !0 }, Ds = [
  pe("select", {
    defaultSource: "api",
    defaultHistory: pt,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  pe("clearSelection", {
    defaultSource: "api",
    defaultHistory: pt,
    affects: { selection: !0, focus: !0 },
    mutualExclusionScope: "selection"
  }),
  pe("move", {
    defaultSource: "api",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Xt
  }),
  pe("resize", {
    defaultSource: "api",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Xt
  }),
  pe("add", {
    defaultSource: "api",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("delete", {
    defaultSource: "api",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  pe("duplicate", {
    defaultSource: "api",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("copy", {
    defaultSource: "api",
    defaultHistory: pt,
    affects: {},
    mutualExclusionScope: "selection"
  }),
  pe("paste", {
    defaultSource: "api",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0, metadata: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("align", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Xt
  }),
  pe("distribute", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout",
    validatePayload: Xt
  }),
  pe("tidy", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("lock", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("unlock", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("show", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("hide", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { metadata: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("save", {
    defaultSource: "toolbar",
    defaultHistory: pt,
    affects: { persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence",
    shortcuts: ["Mod+S"]
  }),
  pe("discard", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "replace" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  pe("reset", {
    defaultSource: "toolbar",
    defaultHistory: { mode: "clear" },
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, persistence: !0 },
    risk: "persistence",
    mutualExclusionScope: "persistence"
  }),
  pe("undo", {
    defaultSource: "keyboard",
    defaultHistory: pt,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Z"]
  }),
  pe("redo", {
    defaultSource: "keyboard",
    defaultHistory: pt,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "global",
    shortcuts: ["Mod+Shift+Z"]
  }),
  pe("section-row-collapse", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { sectionRows: !0, selection: !0, focus: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("section-row-expand", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("section-row-move", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0, sectionRows: !0 },
    mutualExclusionScope: "layout"
  }),
  pe("section-row-delete", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { layout: !0, layouts: !0, metadata: !0, sectionRows: !0, selection: !0, focus: !0 },
    risk: "destructive",
    mutualExclusionScope: "layout"
  }),
  pe("section-row-reorder", {
    defaultSource: "toolbar",
    defaultHistory: Pe,
    affects: { sectionRows: !0 },
    mutualExclusionScope: "layout"
  })
], Or = new Map(
  Ds.map((e) => [e.type, e])
), zs = (e) => Or.get(e), _n = () => Ds.slice(), Vt = (e) => {
  const t = zs(e);
  return t || pe(e, {
    defaultSource: "api",
    defaultHistory: pt,
    affects: {},
    mutualExclusionScope: "global"
  });
}, Dr = (e) => {
  const t = /* @__PURE__ */ new Map(), o = e.now || (() => {
    const n = typeof performance != "undefined" ? performance : null;
    return n && typeof n.now == "function" ? n.now() : Date.now();
  });
  return {
    execute: async (n) => {
      var D, x, P, A, R, L, S, B, _;
      const i = Vt(n.type), u = {
        source: i.defaultSource,
        ...n,
        history: n.history || i.defaultHistory
      }, d = Ps(u), c = Ot(
        d.history,
        i.defaultHistory.mode || Ut(d.type)
      );
      d.history = c;
      const y = d.source || i.defaultSource || "api";
      d.source = y;
      const l = i.mutualExclusionScope || "global", p = o(), m = t.get(l);
      if (m && !m.signal.aborted) {
        const H = qt(d, "command-pending", {
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
        return e.finalize(d, H, p);
      }
      (D = e.onStart) == null || D.call(e, d);
      const h = e.getSnapshot(), C = e.getStateRevision(), M = e.check(d);
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
        const H = qt(d, "invalid-input", {
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
        return e.finalize(d, H, p);
      }
      const z = ((A = e.buildPreview) == null ? void 0 : A.call(e, d, M, h)) || {
        layoutPatches: [],
        metadataPatches: [],
        affectedIds: [],
        beforeSummary: {},
        afterSummary: {}
      }, K = new AbortController();
      t.set(l, K);
      const T = await xi(
        e.beforeCommand,
        d,
        e.getGuardContext(d, M, z, K.signal),
        e.guardTimeoutMs
      );
      if (t.delete(l), (R = e.isStopped) != null && R.call(e) || K.signal.aborted) {
        (L = e.cleanupInteraction) == null || L.call(e, "guard-aborted");
        const H = Ie(d, "cancelled", {
          targetIds: M.targetIds,
          blocked: {
            reason: "guard-aborted",
            itemIds: M.targetIds,
            message: "Command guard was aborted."
          },
          diagnostics: {
            durationMs: 0,
            guardMs: T.guardMs,
            pendingScope: l,
            stateRevision: e.getStateRevision(),
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, H, p, T.guardMs);
      }
      if (T.result)
        return (S = e.cleanupInteraction) == null || S.call(e, T.result.status), T.result.diagnostics = {
          durationMs: ((B = T.result.diagnostics) == null ? void 0 : B.durationMs) || 0,
          ...T.result.diagnostics,
          pendingScope: l,
          stateRevision: e.getStateRevision(),
          historyMode: c.mode,
          source: y,
          origin: d.origin
        }, e.finalize(d, T.result, p, T.guardMs);
      const te = e.getStateRevision();
      if (te !== C) {
        (_ = e.cleanupInteraction) == null || _.call(e, "stale-command");
        const H = qt(d, "stale-command", {
          targetIds: M.targetIds,
          blocked: {
            reason: "stale-command",
            itemIds: M.targetIds,
            message: "Command state changed while beforeCommand was pending."
          },
          diagnostics: {
            durationMs: 0,
            guardMs: T.guardMs,
            pendingScope: l,
            stateRevision: te,
            stale: !0,
            historyMode: c.mode,
            source: y,
            origin: d.origin
          }
        });
        return e.finalize(d, H, p, T.guardMs);
      }
      return e.commit({
        command: d,
        check: M,
        before: h,
        preview: z,
        startedAt: p,
        guardMs: T.guardMs
      });
    },
    abortPending: (n = "command-kernel-abort") => {
      t.forEach((i) => i.abort(n)), t.clear();
    }
  };
}, kt = (e, t, o, s) => ({
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
}), Qt = (e, t, o = (/* @__PURE__ */ new Date()).toISOString()) => {
  const s = typeof t == "string" ? void 0 : t, r = typeof t == "string" ? t : o, n = s ? De(s) : null;
  return {
    version: s ? 2 : 1,
    editorMetaById: xe(e),
    sectionRows: n ? {
      version: 1,
      items: n.items,
      itemMembership: n.itemMembership
    } : void 0,
    updatedAt: r
  };
}, Zt = (e) => {
  var n, i;
  const t = (n = e == null ? void 0 : e.meta) == null ? void 0 : n.editor;
  if (t == null)
    return {
      ok: !0,
      envelope: Qt({})
    };
  if (!t || typeof t != "object")
    return { ok: !1, error: "meta.editor must be an object." };
  const o = t;
  if (o.version !== 1 && o.version !== 2)
    return {
      ok: !0,
      envelope: Qt({})
    };
  const s = wi(o.editorMetaById);
  if (!s.ok)
    return {
      ok: !1,
      error: ((i = s.errors[0]) == null ? void 0 : i.message) || "Invalid editor metadata."
    };
  const r = o.version === 2 && o.sectionRows ? De(
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
      } : Gs(),
      updatedAt: typeof o.updatedAt == "string" ? o.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, zr = (e) => {
  const t = () => ({ ...(typeof e.baseMeta == "function" ? e.baseMeta() : e.baseMeta) || {} }), o = (s, r) => {
    var i, u, d;
    const n = Zt(s);
    if (!n.ok || !n.envelope) {
      (i = e.onError) == null || i.call(
        e,
        "editor-metadata-invalid",
        n.error || "Invalid editor persistence metadata.",
        s
      );
      return;
    }
    (u = e.setEditorMetaById) == null || u.call(e, n.envelope.editorMetaById, r), n.envelope.sectionRows && ((d = e.setSectionRows) == null || d.call(
      e,
      De(
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
        editor: Qt(
          e.getEditorMetaById(),
          (s = e.getSectionRows) == null ? void 0 : s.call(e)
        )
      };
    },
    onPersistenceEvent(s) {
      var r, n, i, u, d, c, y;
      if ((s.type === "load-success" || s.type === "external-apply") && o(s.document, s.type), s.type === "save-success" && o(s.document, "save-success"), s.type === "conflict") {
        const l = Zt(s.conflict.localDocument), p = Zt(s.conflict.externalDocument);
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
      s.type === "save-start" && ((u = e.onSaveStateChange) == null || u.call(e, { status: "saving", dirty: !0 })), s.type === "save-success" && ((d = e.onSaveStateChange) == null || d.call(e, { status: "ready", dirty: !1 })), (s.type === "save-error" || s.type === "error") && ((c = e.onSaveStateChange) == null || c.call(e, {
        status: "error",
        dirty: !0,
        error: s.error
      })), (s.type === "discard" || s.type === "reset") && ((y = e.onSaveStateChange) == null || y.call(e, { status: "ready", dirty: !1 }));
    },
    async save() {
      if (!e.persistence)
        return kt("editor-save", "save", "blocked", {
          code: "adapter-unavailable",
          message: "No persistence controller is attached.",
          recoverable: !0
        });
      const s = await e.persistence.save();
      return kt("editor-save", "save", s.ok ? "changed" : "error", s.error);
    },
    discard() {
      return e.persistence ? (e.persistence.discard(), kt("editor-discard", "discard", "changed")) : kt("editor-discard", "discard", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    },
    reset() {
      return e.persistence ? (e.persistence.reset(), kt("editor-reset", "reset", "changed")) : kt("editor-reset", "reset", "blocked", {
        code: "adapter-unavailable",
        message: "No persistence controller is attached.",
        recoverable: !0
      });
    }
  };
}, oo = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, Lt = (e) => typeof e == "number" && Number.isFinite(e), Ls = (e) => e === "left" || e === "center-x" || e === "right" ? "x" : "y", Lr = (e) => e === "horizontal" || e === "spacing-x" ? "x" : "y", eo = (e) => ie(e), Fr = (e) => Array.from(new Set(e.flatMap((t) => t.type === "add" ? [t.item.i] : t.type === "compact" ? t.affectedIds : [t.id]))), Fs = (e, t) => {
  var s, r;
  const o = (s = t.targetIds) != null && s.length ? t.targetIds : (r = t.selectedIds) != null && r.length ? t.selectedIds : e.map((n) => n.i);
  return Array.from(new Set(o.filter(Boolean)));
}, gt = (e, t, o, s, r, n, i) => ({
  status: "blocked",
  layout: eo(t),
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
    durationMs: oo() - e,
    computed: n,
    messages: [{
      code: `grid-editor.geometry.${o}`,
      level: o === "invalid-input" ? "error" : "warning",
      message: r,
      itemIds: s,
      recoverable: !0
    }]
  }
}), Ns = (e, t) => {
  const o = [], s = [];
  return t.forEach((r) => {
    const n = Ae(e, r);
    n ? o.push(n) : s.push(r);
  }), { items: o, missingIds: s };
}, bo = (e, t, o) => {
  const s = Lt(o.cols) ? o.cols : 12, r = Lt(o.maxRows) ? o.maxRows : 1 / 0;
  for (let n = 0; n < t.length; n++) {
    const i = Ae(e, t[n]);
    if (i) {
      if (i.x < 0 || i.y < 0 || i.x + i.w > s)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(r) && i.y + i.h > r)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (o.allowOverlap !== !0) {
        const u = Ct(e, i).filter((d) => d.i !== i.i);
        if (u.length > 0)
          return {
            ok: !1,
            reason: "collision",
            itemIds: [i.i, ...u.map((d) => d.i)]
          };
      }
    }
  }
  return { ok: !0 };
}, Nr = (e, t) => t === "right" ? e.x + e.w : t === "center-x" ? e.x + e.w / 2 : t === "bottom" ? e.y + e.h : t === "center-y" ? e.y + e.h / 2 : t === "top" ? e.y : e.x, gs = (e) => {
  const t = Math.min(...e.map((n) => n.x)), o = Math.max(...e.map((n) => n.x + n.w)), s = Math.min(...e.map((n) => n.y)), r = Math.max(...e.map((n) => n.y + n.h));
  return {
    left: t,
    right: o,
    top: s,
    bottom: r,
    centerX: t + (o - t) / 2,
    centerY: s + (r - s) / 2
  };
}, jr = (e, t, o, s) => {
  var u;
  const r = t.mode, n = t.target || { type: "selection-bounds" };
  if (n.type === "explicit-line" && n.axis === Ls(r))
    return { position: n.position, source: "explicit" };
  if (n.type === "active-item" || n.type === "last-selected") {
    const d = s.selectedIds || s.targetIds || o.map((l) => l.i), c = n.type === "active-item" ? n.id || s.activeId || d[0] : d[d.length - 1], y = o.find((l) => l.i === c) || o[0];
    return { position: Nr(y, r), source: n.type };
  }
  if (n.type === "section-row") {
    const c = (u = De(s.sectionRows, e).items[n.id]) == null ? void 0 : u.bounds, y = n.bounds || c;
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
    const l = gs(o);
    return r === "right" ? { position: l.right, source: "section-row" } : r === "center-x" ? { position: l.centerX, source: "section-row" } : r === "bottom" ? { position: l.bottom, source: "section-row" } : r === "center-y" ? { position: l.centerY, source: "section-row" } : r === "top" ? { position: l.top, source: "section-row" } : { position: l.left, source: "section-row" };
  }
  const i = gs(o);
  return r === "right" ? { position: i.right, source: "selection" } : r === "center-x" ? { position: i.centerX, source: "selection" } : r === "bottom" ? { position: i.bottom, source: "selection" } : r === "center-y" ? { position: i.centerY, source: "selection" } : r === "top" ? { position: i.top, source: "selection" } : { position: i.left, source: "selection" };
}, Hr = (e, t, o) => t === "right" ? { ...e, x: Math.round(o - e.w) } : t === "center-x" ? { ...e, x: Math.round(o - e.w / 2) } : t === "top" ? { ...e, y: Math.round(o) } : t === "bottom" ? { ...e, y: Math.round(o - e.h) } : t === "center-y" ? { ...e, y: Math.round(o - e.h / 2) } : { ...e, x: Math.round(o) }, js = (e, t) => e.slice().sort(
  (o, s) => t === "x" ? o.x - s.x || o.i.localeCompare(s.i) : o.y - s.y || o.i.localeCompare(s.i)
), Kr = (e, t, o) => {
  const s = [];
  for (let r = 1; r < e.length; r++) {
    const n = e[r - 1], i = e[r];
    s.push(o === "center-to-center" ? t === "x" ? i.x + i.w / 2 - (n.x + n.w / 2) : i.y + i.h / 2 - (n.y + n.h / 2) : t === "x" ? i.x - (n.x + n.w) : i.y - (n.y + n.h));
  }
  return s;
}, Xr = (e) => e.length === 0 ? 0 : e.reduce((t, o) => t + o, 0) / e.length, Yr = (e, t, o, s) => {
  const r = Math.max(0, e.findIndex((y) => y.i === s)), n = e[r], i = Math.max(0, Xr(Kr(e, t, o))), u = /* @__PURE__ */ new Map([[n.i, n]]);
  if (o === "center-to-center") {
    const y = t === "x" ? n.x + n.w / 2 : n.y + n.h / 2;
    for (let l = r - 1; l >= 0; l--) {
      const p = e[l], m = y - i * (r - l);
      u.set(p.i, t === "x" ? { ...p, x: Math.round(m - p.w / 2) } : { ...p, y: Math.round(m - p.h / 2) });
    }
    for (let l = r + 1; l < e.length; l++) {
      const p = e[l], m = y + i * (l - r);
      u.set(p.i, t === "x" ? { ...p, x: Math.round(m - p.w / 2) } : { ...p, y: Math.round(m - p.h / 2) });
    }
    return { items: e.map((l) => u.get(l.i) || l), spacing: i };
  }
  let d = t === "x" ? n.x : n.y;
  for (let y = r - 1; y >= 0; y--) {
    const l = e[y], p = t === "x" ? l.w : l.h, m = d - i - p;
    u.set(l.i, t === "x" ? { ...l, x: Math.round(m) } : { ...l, y: Math.round(m) }), d = m;
  }
  let c = t === "x" ? n.x + n.w : n.y + n.h;
  for (let y = r + 1; y < e.length; y++) {
    const l = e[y];
    u.set(l.i, t === "x" ? { ...l, x: Math.round(c + i) } : { ...l, y: Math.round(c + i) }), c = c + i + (t === "x" ? l.w : l.h);
  }
  return { items: e.map((y) => u.get(y.i) || y), spacing: i };
}, _r = (e, t, o, s) => {
  const r = Lr(o.mode), n = o.strategy || "edge-to-edge", i = js(t, r);
  if (i.length < 3) return null;
  const u = De(s.sectionRows, e), d = i.reduce((z, K) => {
    const T = u.itemMembership[K.i] || {};
    return z === null ? { ...T } : {
      sectionId: z.sectionId && z.sectionId === T.sectionId ? z.sectionId : void 0,
      rowId: z.rowId && z.rowId === T.rowId ? z.rowId : void 0
    };
  }, null), c = o.sectionRowId || (o.bounds === "section-row" ? (d == null ? void 0 : d.rowId) || (d == null ? void 0 : d.sectionId) : void 0), y = c ? u.items[c] : void 0;
  if (o.bounds === "active-item") {
    const z = Yr(i, r, n, s.activeId);
    return {
      axis: r,
      spacing: z.spacing,
      sectionId: d == null ? void 0 : d.sectionId,
      rowId: d == null ? void 0 : d.rowId,
      items: z.items
    };
  }
  const l = y != null && y.bounds ? r === "x" ? { start: y.bounds.x, end: y.bounds.x + y.bounds.w } : { start: y.bounds.y, end: y.bounds.y + y.bounds.h } : null, p = o.bounds === "explicit" && o.explicitBounds ? o.explicitBounds : null, m = p ? p.start : l ? l.start : r === "x" ? i[0].x : i[0].y, h = p ? p.end : l ? l.end : r === "x" ? i[i.length - 1].x + i[i.length - 1].w : i[i.length - 1].y + i[i.length - 1].h;
  if (n === "center-to-center") {
    const z = !!(p || l), K = z ? m + (r === "x" ? i[0].w : i[0].h) / 2 : r === "x" ? i[0].x + i[0].w / 2 : i[0].y + i[0].h / 2, te = ((z ? h - (r === "x" ? i[i.length - 1].w : i[i.length - 1].h) / 2 : r === "x" ? i[i.length - 1].x + i[i.length - 1].w / 2 : i[i.length - 1].y + i[i.length - 1].h / 2) - K) / (i.length - 1);
    return {
      axis: r,
      spacing: te,
      sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
      rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
      items: i.map((D, x) => {
        if (x === 0 || x === i.length - 1) return D;
        const P = K + te * x;
        return r === "x" ? { ...D, x: Math.round(P - D.w / 2) } : { ...D, y: Math.round(P - D.h / 2) };
      })
    };
  }
  const C = i.reduce(
    (z, K) => z + (r === "x" ? K.w : K.h),
    0
  ), M = (h - m - C) / (i.length - 1);
  if (!Number.isFinite(M) || M < 0) return null;
  let k = m;
  return {
    axis: r,
    spacing: M,
    sectionId: (y == null ? void 0 : y.kind) === "section" ? y.id : y == null ? void 0 : y.parentId,
    rowId: (y == null ? void 0 : y.kind) === "row" ? y.id : void 0,
    items: i.map((z) => {
      const K = r === "x" ? { ...z, x: Math.round(k) } : { ...z, y: Math.round(k) };
      return k += (r === "x" ? z.w : z.h) + M, K;
    })
  };
}, Ur = (e, t, o, s) => {
  const r = o === "x" ? "y" : "x", n = De(s.sectionRows, e), i = (c) => {
    const y = n.itemMembership[c.i] || {};
    return `${y.sectionId || ""}:${y.rowId || ""}`;
  }, u = t.slice().sort(
    (c, y) => r === "y" ? c.y - y.y || c.x - y.x || c.i.localeCompare(y.i) : c.x - y.x || c.y - y.y || c.i.localeCompare(y.i)
  ), d = [];
  return u.forEach((c) => {
    const y = r === "y" ? c.y : c.x, l = y + (r === "y" ? c.h : c.w), p = d.find((m) => m.some((h) => {
      if (i(h) !== i(c)) return !1;
      const C = r === "y" ? h.y : h.x, M = C + (r === "y" ? h.h : h.w);
      return Math.min(l, M) > Math.max(y, C);
    }));
    p ? p.push(c) : d.push([c]);
  }), d;
}, hs = (e, t, o, s) => {
  const r = Lt(o.minSpacing) ? Math.max(0, o.minSpacing) : 1, n = o.axis === "both" ? ["x", "y"] : [o.axis === "y" ? "y" : "x"];
  let i = t.slice();
  return n.forEach((u) => {
    const d = Ur(e, i, u, s), c = /* @__PURE__ */ new Map();
    d.forEach((y) => {
      const l = js(y, u);
      if (l.length < 2) {
        l.forEach((m) => c.set(m.i, m));
        return;
      }
      let p = u === "x" ? l[0].x : l[0].y;
      l.forEach((m, h) => {
        if (h === 0) {
          c.set(m.i, m), p += (u === "x" ? m.w : m.h) + r;
          return;
        }
        const C = u === "x" ? { ...m, x: Math.round(p) } : { ...m, y: Math.round(p) };
        c.set(m.i, C), p += (u === "x" ? m.w : m.h) + r;
      });
    }), i = i.map((y) => c.get(y.i) || y);
  }), {
    axis: n[n.length - 1],
    spacing: r,
    items: i
  };
}, Hs = (e, t, o) => ko({
  layout: e,
  activeItem: t.find((s) => s.i === o.activeId) || t[0],
  candidateItem: t.find((s) => s.i === o.activeId) || t[0],
  selectionIds: t.map((s) => s.i),
  metaById: o.metaById,
  sectionRows: o.sectionRows,
  cols: Lt(o.cols) ? o.cols : 12,
  maxRows: o.maxRows,
  compactType: o.compactType,
  allowOverlap: o.allowOverlap,
  preventCollision: o.preventCollision,
  interaction: "toolbar",
  options: {
    cols: Lt(o.cols) ? o.cols : 12,
    maxRows: o.maxRows,
    allowCrossSectionRow: !1
  }
}), Ks = (e, t, o, s, r) => {
  const n = zt(t, o), i = Fr(n);
  return {
    status: i.length > 0 ? "changed" : "noop",
    layout: o,
    layoutPatches: n,
    affectedIds: i,
    skippedIds: r,
    diagnostics: {
      ...s,
      durationMs: oo() - e
    }
  };
}, vs = (e, t, o = {}) => {
  const s = oo(), r = Fs(e, o), { items: n, missingIds: i } = Ns(e, r);
  if (i.length > 0)
    return gt(s, e, "missing-item", i, "Align command referenced missing layout items.", void 0, o.skippedIds);
  if (n.length < 2)
    return gt(s, e, "selection-count", r, "Align requires at least 2 items.", void 0, o.skippedIds);
  const u = jr(e, t, n, o), d = eo(e).map(
    (p) => r.includes(p.i) ? Hr(p, t.mode, u.position) : p
  ), c = bo(d, r, o), y = Hs(e, n, o), l = {
    targetLine: {
      axis: Ls(t.mode),
      position: u.position,
      mode: t.mode
    },
    affectedIds: r,
    skippedIds: o.skippedIds,
    sectionRowContext: {
      source: u.source === "section-row" ? "metadata" : "none"
    }
  };
  return c.ok ? Ks(s, e, d, {
    durationMs: 0,
    intelligence: y.diagnostics,
    computed: l
  }, o.skippedIds) : gt(
    s,
    e,
    c.reason,
    c.itemIds,
    `Align command blocked by ${c.reason}.`,
    l,
    o.skippedIds
  );
}, Xs = (e, t, o, s) => {
  const r = oo(), n = Fs(e, o), { items: i, missingIds: u } = Ns(e, n);
  if (u.length > 0)
    return gt(r, e, "missing-item", u, `${s} command referenced missing layout items.`, void 0, o.skippedIds);
  if (i.length < 3)
    return gt(r, e, "selection-count", n, `${s} requires at least 3 items.`, void 0, o.skippedIds);
  let d = s === "distribute" ? _r(e, i, t, o) : hs(e, i, t, o);
  const c = Hs(e, i, o);
  if (!d)
    return gt(r, e, "invalid-input", n, "Spacing command could not compute a valid spacing result.", {
      affectedIds: n,
      skippedIds: o.skippedIds
    }, o.skippedIds);
  let y = !1, l = new Map(d.items.map((k) => [k.i, k])), p = eo(e).map((k) => l.get(k.i) || k), m = bo(p, n, o);
  if (!m.ok) {
    const k = hs(e, i, {
      axis: d.axis,
      minSpacing: 0,
      strategy: t.strategy
    }, o);
    k && (y = !0, d = k, l = new Map(d.items.map((z) => [z.i, z])), p = eo(e).map((z) => l.get(z.i) || z), m = bo(p, n, o));
  }
  const h = t, C = t, M = {
    targetSpacing: {
      axis: d.axis,
      value: d.spacing,
      mode: s === "distribute" ? h.mode : d.axis === "x" ? "spacing-x" : "spacing-y",
      strategy: s === "distribute" ? h.strategy || "edge-to-edge" : C.strategy || "edge-to-edge"
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
  return m.ok ? Ks(r, e, p, {
    durationMs: 0,
    intelligence: c.diagnostics,
    computed: M
  }, o.skippedIds) : gt(
    r,
    e,
    m.reason,
    m.itemIds,
    `Spacing command blocked by ${m.reason}.`,
    M,
    o.skippedIds
  );
}, bs = (e, t, o = {}) => Xs(e, t, o, "distribute"), Is = (e, t, o = {}) => Xs(e, t, o, "tidy"), Ge = (e) => typeof e == "number" && Number.isFinite(e), qr = (e) => Ge(e) && e > 0 ? Math.floor(e) : 12, Wr = (e) => Ge(e) && e > 0 ? Math.floor(e) : 1 / 0, Vr = (e) => e === "vertical" || e === "horizontal" || e === null ? e : "vertical", Zr = (e) => e === "layout" ? "layout" : "block", xs = (e) => e === !0, et = (e) => ({
  id: e.i,
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Co = (e) => ({
  ...e,
  x: Ge(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: Ge(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: Ge(e.w) ? Math.floor(e.w) : 1,
  h: Ge(e.h) ? Math.floor(e.h) : 1
}), je = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), Ft = (e, t, o, s, r = {}) => {
  for (const n of t) {
    const i = e.find((u) => u.i === n);
    if (i) {
      if (i.w <= 0 || i.h <= 0 || i.x < 0 || i.y < 0 || i.x + i.w > o)
        return { ok: !1, reason: "bounds", itemIds: [i.i] };
      if (Number.isFinite(s) && i.y + i.h > s)
        return { ok: !1, reason: "maxRows", itemIds: [i.i] };
      if (!r.allowOverlap) {
        const u = Ct(e, i).filter((d) => d.i !== i.i);
        if (u.length > 0)
          return {
            ok: !1,
            reason: "collision",
            itemIds: [i.i, ...u.map((d) => d.i)]
          };
      }
    }
  }
  return { ok: !0 };
}, Eo = (e, t, o) => e.w <= 0 || e.h <= 0 || e.w > t ? "bounds" : Number.isFinite(o) && e.h > o ? "maxRows" : null, Nt = (e, t, o) => Math.max(t, Math.min(e, o)), Ys = (e) => e.reduce((t, o) => Math.max(t, o.y + o.h), 0), Jr = (e, t, o, s, r, n) => {
  if (!Ge(o) || !Ge(s)) return null;
  const i = {
    x: Math.floor(o),
    y: Math.floor(s)
  }, u = Nt(i.x, 0, Math.max(0, r - t.w)), d = Math.max(0, i.y), c = Number.isFinite(n) ? Math.floor(n) - t.h : Math.max(Ys(e), d);
  if (c < d) return null;
  for (let y = d; y <= c; y++) {
    const l = { ...t, x: u, y };
    if (Ft([...e, l], [l.i], r, n).ok)
      return {
        x: u,
        y,
        target: i,
        clamped: u !== i.x,
        shiftedDown: y !== d
      };
  }
  return null;
}, Qr = (e) => {
  for (const t of e)
    t.moved && (t.moved = !1);
  return e;
}, ws = (e, t, o) => {
  const s = new Set(o), r = new Map(t.map((n) => [n.i, n]));
  return e.filter((n) => {
    if (s.has(n.i)) return !1;
    const i = r.get(n.i);
    return !!(i && (n.x !== i.x || n.y !== i.y || n.w !== i.w || n.h !== i.h));
  }).map((n) => n.i);
}, en = (e, t, o, s, r, n, i) => {
  var T, te;
  const u = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (o !== "cursor" || u !== "top-left") return null;
  const d = Vr(s.compactType), c = xs(s.allowOverlap), y = xs(s.preventCollision), l = t.map(Co), p = l.reduce((D, x) => ({
    x: Math.min(D.x, x.x),
    y: Math.min(D.y, x.y)
  }), { x: ((T = l[0]) == null ? void 0 : T.x) || 0, y: ((te = l[0]) == null ? void 0 : te.y) || 0 });
  let m = ie(e);
  const h = [], C = [], M = (D, x, P, A) => {
    const R = h.concat(x.filter((L) => l.some((S) => S.i === L)));
    return C.push(je(
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
        shiftedIds: ws(e, A, R),
        before: e.map(et),
        after: A.map(et),
        diagnostics: C
      }
    };
  }, k = Ge(i == null ? void 0 : i.x) ? i.x : p.x, z = Ge(i == null ? void 0 : i.y) ? i.y : p.y, K = l.map((D) => {
    const x = Math.floor(k + D.x - p.x), P = Math.floor(z + D.y - p.y);
    return {
      ...D,
      x: Nt(x, 0, Math.max(0, r - D.w)),
      y: Number.isFinite(n) ? Nt(P, 0, Math.max(0, Math.floor(n) - D.h)) : Math.max(0, P)
    };
  });
  if (!c) {
    const D = K.find((x) => Ct(K, x).length > 0);
    if (D)
      return M(
        "collision",
        [D.i, ...Ct(K, D).map((x) => x.i)],
        "Placement group contains overlapping items.",
        e
      );
  }
  for (let D = 0; D < K.length; D++) {
    const x = K[D], P = l[D], A = Eo(P, r, n);
    if (A)
      return C.push(je(
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
          insertedIds: h,
          shiftedIds: [],
          before: e.map(et),
          after: [],
          diagnostics: C
        }
      };
    const R = m.concat(x), L = Ft(
      R,
      [x.i],
      r,
      n,
      { allowOverlap: c }
    ), S = c ? [] : Ct(m, x).filter((Q) => Q.i !== x.i);
    if (!L.ok && L.reason !== "collision")
      return M(
        L.reason,
        L.itemIds,
        "Placement target is outside the current grid constraints.",
        R
      );
    if (!c && S.some((Q) => Q.static)) {
      const Q = S.filter((Be) => Be.static).map((Be) => Be.i);
      return M(
        "static-item",
        [x.i, ...Q],
        "Placement target is blocked by a static item.",
        R
      );
    }
    if (y && !c && S.length > 0)
      return M(
        "collision",
        [x.i, ...S.map((Q) => Q.i)],
        "Placement target is blocked at the current cursor position.",
        R
      );
    if (c) {
      m = R, h.push(x.i);
      continue;
    }
    const B = Math.max(Ys(m), x.y) + x.h + D + 1, _ = {
      ...x,
      y: B,
      static: !1
    }, H = m.concat(_), le = H[H.length - 1], Me = hi(
      H,
      le,
      d,
      r,
      c,
      x.x,
      x.y,
      !0,
      y
    ).map(
      (Q) => Q.i === x.i ? { ...Q, static: x.static === !0 } : Q
    ), J = d == null ? Me : vi(Me, d, r, c);
    m = Qr(J), h.push(x.i);
    const U = Ft(
      m,
      m.map((Q) => Q.i),
      r,
      n,
      { allowOverlap: c }
    );
    if (!U.ok)
      return M(
        U.reason,
        U.itemIds,
        "Placement reflow could not produce a valid layout.",
        m
      );
  }
  return C.push(je(
    "grid-editor.placement.layout-collision-policy",
    "info",
    `Placed ${h.length} item${h.length === 1 ? "" : "s"} using existing layout collision rules.`,
    {
      itemIds: h,
      details: { collisionPolicy: "layout", compactType: d, allowOverlap: c, preventCollision: y }
    }
  )), {
    layout: m,
    failed: !1,
    summary: {
      strategy: o,
      placementSource: o,
      collisionPolicy: "layout",
      insertedIds: h,
      shiftedIds: ws(e, m, h),
      before: e.map(et),
      after: m.map(et),
      diagnostics: C
    }
  };
}, tn = (e, t, o, s, r, n) => {
  var h, C;
  const i = Ge(s.offset) ? s.offset : 1, u = s.cursor && typeof s.cursor == "object" ? s.cursor : null, d = s.placementAnchor === "top-left" || s.placementIntent === "here" ? "top-left" : "nearest";
  if (Zr(s.collisionPolicy) === "layout") {
    const M = en(e, t, o, s, r, n, u);
    if (M) return M;
  }
  const c = ie(e), y = [], l = [], p = t.map(Co), m = p.reduce((M, k) => ({
    x: Math.min(M.x, k.x),
    y: Math.min(M.y, k.y)
  }), { x: ((h = p[0]) == null ? void 0 : h.x) || 0, y: ((C = p[0]) == null ? void 0 : C.y) || 0 });
  for (let M = 0; M < p.length; M++) {
    const k = p[M], z = Eo(k, r, n);
    if (z)
      return l.push(je(
        "grid-editor.placement.invalid-item",
        "error",
        "Item size or bounds are not valid for the current grid.",
        { reason: z, itemIds: [k.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: z,
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
    let K = k.x, T = k.y;
    const te = o === "cursor" && d === "top-left" && typeof s.placementSessionId == "string";
    if (o === "offset")
      K += i * (M + 1), T += i * (M + 1);
    else if (te) {
      const P = Ge(u == null ? void 0 : u.x) ? u.x : K, A = Ge(u == null ? void 0 : u.y) ? u.y : T, R = k.x - m.x, L = k.y - m.y, S = Math.floor(P + R), B = Math.floor(A + L);
      K = Nt(S, 0, Math.max(0, r - k.w)), T = Number.isFinite(n) ? Nt(B, 0, Math.max(0, Math.floor(n) - k.h)) : Math.max(0, B), l.push(je(
        "grid-editor.placement.cursor-anchor",
        "info",
        "Placed item from an explicit top-left cursor anchor.",
        {
          itemIds: [k.i],
          details: {
            target: { x: S, y: B },
            placed: { x: K, y: T },
            clamped: K !== S || T !== B,
            shiftedDown: !1
          }
        }
      ));
    } else if (o === "nearest-fit" || o === "cursor") {
      const P = o === "cursor" && d === "top-left" ? Jr(
        c,
        k,
        Ge(u == null ? void 0 : u.x) ? u.x : K,
        Ge(u == null ? void 0 : u.y) ? u.y : T,
        r,
        n
      ) : null, A = P || gi(
        c,
        k,
        r,
        Ge(u == null ? void 0 : u.x) ? u.x : K,
        Ge(u == null ? void 0 : u.y) ? u.y : T,
        n
      );
      A && (K = A.x, T = A.y, P && l.push(je(
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
      const P = qo(c, k, r, n);
      P && (K = P.x, T = P.y);
    }
    const D = {
      ...k,
      x: Math.max(0, Math.floor(K)),
      y: Math.max(0, Math.floor(T))
    }, x = Ft([...c, D], [D.i], r, n);
    if (!x.ok) {
      if (te) {
        const A = (x.reason === "maxRows" || Number.isFinite(n), x.reason), R = [...c, D], L = y.concat(D.i);
        return l.push(je(
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
            insertedIds: L,
            shiftedIds: [],
            before: [],
            after: R.filter((S) => L.includes(S.i)).map(et),
            diagnostics: l
          }
        };
      }
      const P = qo(c, k, r, n);
      if (!P) {
        const A = x.reason === "maxRows" || Number.isFinite(n) ? "maxRows" : x.reason;
        return l.push(je(
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
  return l.push(je(
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
}, on = (e, t, o, s) => {
  const r = ie(e), n = t.map(Co), i = n.map((k) => k.i), u = r.map((k) => k.i), d = r.map(et), c = [];
  if (n.length === 0)
    return c.push(je(
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
    const z = Eo(k, o, s);
    if (z)
      return c.push(je(
        "grid-editor.placement.invalid-item",
        "error",
        "Inserted item cannot fit within the current grid bounds.",
        { reason: z, itemIds: [k.i] }
      )), {
        layout: e,
        failed: !0,
        blocked: {
          reason: z,
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
  const h = r.map((k) => ({
    ...k,
    y: k.y + m
  })), C = [...p, ...h], M = Ft(C, C.map((k) => k.i), o, s);
  return M.ok ? (c.push(je(
    "grid-editor.placement.insert-top-shift",
    "info",
    u.length > 0 ? `Inserted at the top-left and shifted ${u.length} existing item${u.length === 1 ? "" : "s"}.` : "Inserted at the top-left without shifting existing items.",
    { itemIds: i.concat(u), details: { shiftHeight: m, shiftedCount: u.length } }
  )), {
    layout: C,
    failed: !1,
    summary: {
      strategy: "insert-top-shift",
      placementSource: "insert-top-shift",
      insertedIds: i,
      shiftedIds: u,
      delta: { dx: 0, dy: m },
      before: d,
      after: C.map(et),
      diagnostics: c
    }
  }) : (c.push(je(
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
      shiftedIds: u,
      before: d,
      after: [],
      diagnostics: c
    }
  });
}, mt = (e, t, o, s = {}) => {
  const r = o === "offset" || o === "cursor" || o === "nearest-fit" || o === "first-fit" || o === "insert-top-shift" ? o : "first-fit", n = qr(s.cols), i = Wr(s.maxRows);
  return r === "insert-top-shift" ? on(e, t, n, i) : tn(e, t, r, s, n, i);
};
let sn = 0;
const Po = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, at = (e) => typeof e == "number" && Number.isFinite(e), _s = (e) => at(e) && e > 0 ? Math.floor(e) : 12, Us = (e) => at(e) && e > 0 ? Math.floor(e) : 1 / 0, qs = (e, t = "first-fit") => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift" ? e : t, Ws = (e, t = "block") => e === "layout" ? "layout" : t, Vs = (e, t) => e === "vertical" || e === "horizontal" || e === null ? e : t, to = (e, t) => typeof e == "boolean" ? e : t, Zs = (e) => {
  if (!(!e || !at(e.x) || !at(e.y)))
    return {
      ...e,
      x: Math.max(0, Math.floor(e.x)),
      y: Math.max(0, Math.floor(e.y))
    };
}, rn = (e, t) => ({
  ...e,
  i: typeof e.i == "string" && e.i.length > 0 ? e.i : `placement-item-${t + 1}`,
  x: at(e.x) ? Math.max(0, Math.floor(e.x)) : 0,
  y: at(e.y) ? Math.max(0, Math.floor(e.y)) : 0,
  w: at(e.w) ? Math.max(1, Math.floor(e.w)) : 1,
  h: at(e.h) ? Math.max(1, Math.floor(e.h)) : 1
}), nn = (e) => (Array.isArray(e.items) ? e.items : e.item ? [e.item] : []).filter((o) => o && typeof o == "object").map((o, s) => rn(o, s)), Mt = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Ro = (e, t, o, s = {}) => ({
  code: e,
  level: t,
  message: o,
  ...s
}), Js = (e, t, o, s) => {
  const r = t || e, n = new Map(o.before.map((c) => [c.id, c])), i = new Map(o.after.map((c) => [c.id, c])), u = [], d = /* @__PURE__ */ new Set();
  return o.shiftedIds.slice().sort().forEach((c) => {
    const y = n.get(c) || Ae(e, c), l = i.get(c) || Ae(r, c);
    !y || !l || (d.add(c), u.push({
      id: c,
      before: Mt(y),
      after: Mt(l),
      kind: "shift"
    }));
  }), Array.from(i.keys()).sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = n.get(c) || Ae(e, c), l = i.get(c) || Ae(r, c);
    !y || !l || y.x === l.x && y.y === l.y && y.w === l.w && y.h === l.h || (d.add(c), u.push({
      id: c,
      before: Mt(y),
      after: Mt(l),
      kind: "predicted"
    }));
  }), ((s == null ? void 0 : s.reason) === "collision" || (s == null ? void 0 : s.reason) === "bounds" || (s == null ? void 0 : s.reason) === "maxRows") && (s.itemIds || []).slice().sort().forEach((c) => {
    if (d.has(c) || o.insertedIds.includes(c)) return;
    const y = Ae(e, c) || Ae(r, c);
    y && (d.add(c), u.push({
      id: c,
      before: Mt(y),
      after: Mt(y),
      kind: "collision"
    }));
  }), u;
}, Un = (e, t, o, s) => Js(e, t, o, s), qn = (e = [], t) => {
  const o = e.slice();
  return t && !o.some((s) => s.reason === t.reason) && o.push(Ro(
    `grid-editor.placement.blocked.${t.reason}`,
    "warning",
    t.message || `Placement blocked by ${t.reason}.`,
    { reason: t.reason, itemIds: t.itemIds }
  )), o;
}, Wn = (e) => ie(e), an = (e, t, o, s) => {
  const r = new Map(e.items.map((n, i) => [o[i], n.i]));
  return o.map((n) => {
    const i = Ae(t || e.items, n) || Ae(e.items, r.get(n) || n);
    return i ? {
      id: n,
      item: wo(i),
      state: s,
      sourceId: r.get(n)
    } : null;
  }).filter(Boolean);
}, Io = (e, t = {}, o = {}) => {
  var M, k, z, K, T;
  const s = Zs(t.cursor) || e.cursor, r = qs(t.strategy || e.strategy, e.strategy), n = Ws(t.collisionPolicy, e.collisionPolicy), i = Vs(t.compactType, e.compactType), u = to(t.allowOverlap, e.allowOverlap), d = to(t.preventCollision, e.preventCollision), c = _s((M = t.cols) != null ? M : e.cols), y = Us((k = t.maxRows) != null ? k : e.maxRows), l = {
    collisionPolicy: n,
    cursor: s,
    cols: c,
    maxRows: y,
    compactType: i,
    allowOverlap: u,
    preventCollision: d,
    placementSessionId: e.id,
    placementSource: e.source,
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor
  }, p = mt(
    e.baseLayout,
    e.items,
    r,
    l
  ), m = p.failed && p.summary.insertedIds.length === 0 ? void 0 : p.layout, h = p.failed ? {
    reason: ((z = p.blocked) == null ? void 0 : z.reason) || "bounds",
    itemIds: (K = p.blocked) == null ? void 0 : K.itemIds,
    message: ((T = p.blocked) == null ? void 0 : T.message) || "Placement could not produce a valid candidate.",
    recoverable: !0
  } : void 0, C = p.summary.diagnostics.slice();
  return h && C.push(Ro(
    `grid-editor.placement.blocked.${h.reason}`,
    "warning",
    h.message || `Placement blocked by ${h.reason}.`,
    { reason: h.reason, itemIds: h.itemIds }
  )), {
    ...e,
    phase: h ? "blocked" : "preview",
    cursor: s,
    strategy: r,
    collisionPolicy: n,
    compactType: i,
    allowOverlap: u,
    preventCollision: d,
    cols: c,
    maxRows: y,
    candidateLayout: m,
    ghostItems: an(
      e,
      m,
      p.summary.insertedIds.length ? p.summary.insertedIds : e.items.map((te) => te.i),
      h ? "blocked" : "preview"
    ),
    affectedOutlines: Js(e.baseLayout, m, p.summary, h),
    diagnostics: C,
    blocked: h,
    updatedAt: (o.now || Po)(),
    previewSeq: e.previewSeq + 1
  };
}, cn = (e, t) => {
  var i, u, d;
  const o = (t.now || Po)(), s = e.commandType || (e.source === "paste" ? "paste" : "add"), r = e.resolvedClipboardPayload ? ie(e.resolvedClipboardPayload.items) : nn(e), n = {
    id: t.id || `grid-editor-placement:${++sn}`,
    phase: "starting",
    source: e.source,
    commandType: s,
    baseRevision: t.baseRevision,
    baseLayout: ie(t.baseLayout),
    items: r,
    editorMetaById: xe(
      ((i = e.resolvedClipboardPayload) == null ? void 0 : i.editorMetaById) || e.editorMetaById,
      { layout: r }
    ),
    resolvedClipboardPayload: e.resolvedClipboardPayload ? {
      ...e.resolvedClipboardPayload,
      items: ie(e.resolvedClipboardPayload.items),
      editorMetaById: xe(e.resolvedClipboardPayload.editorMetaById, {
        layout: e.resolvedClipboardPayload.items
      })
    } : void 0,
    strategy: qs(e.strategy, t.defaultStrategy || "first-fit"),
    collisionPolicy: Ws(e.collisionPolicy),
    placementIntent: e.placementIntent,
    placementAnchor: e.placementAnchor,
    compactType: Vs(e.compactType),
    allowOverlap: to(e.allowOverlap),
    preventCollision: to(e.preventCollision),
    cursor: Zs(e.cursor),
    size: r[0] ? { w: r[0].w, h: r[0].h } : void 0,
    origin: e.origin,
    cols: _s((u = e.cols) != null ? u : t.cols),
    maxRows: Us((d = e.maxRows) != null ? d : t.maxRows),
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
      diagnostics: [Ro(
        "grid-editor.placement.invalid-item",
        "error",
        c.message || "No items were provided for placement.",
        { reason: c.reason }
      )],
      updatedAt: o
    };
  }
  return Io(n, {}, { now: () => o });
}, dn = (e, t = {}) => {
  var s, r, n, i;
  const o = {
    items: e.commandType === "add" ? ie(e.items) : void 0,
    item: e.commandType === "add" && e.items.length === 1 ? wo(e.items[0]) : void 0,
    editorMetaById: e.commandType === "add" ? xe(e.editorMetaById) : void 0,
    resolvedClipboardPayload: e.commandType === "paste" ? {
      items: ie(e.items),
      editorMetaById: xe(e.editorMetaById, { layout: e.items }),
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
      ghostItemIds: e.ghostItems.map((u) => u.id),
      affectedIds: e.affectedOutlines.map((u) => u.id),
      diagnostics: e.diagnostics
    },
    placementCandidateLayout: e.candidateLayout ? ie(e.candidateLayout) : void 0
  };
  return {
    type: e.commandType,
    payload: o,
    source: t.source || "api",
    origin: e.origin
  };
}, ln = (e, t = "cancelled", o = {}) => ({
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
    updatedAt: (o.now || Po)()
  }
}), un = [
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
], fn = (e) => {
  if (e === "align") return 2;
  if (e === "distribute" || e === "tidy") return 3;
}, yn = (e, t) => {
  var r, n, i, u, d;
  const o = zs(t.type), s = e.canExecute({
    source: (o == null ? void 0 : o.defaultSource) || "toolbar",
    ...t
  });
  return {
    command: t.type,
    enabled: s.status !== "blocked" && s.status !== "cancelled" && s.status !== "timeout" && s.status !== "error",
    reason: (r = s.blocked) == null ? void 0 : r.reason,
    requiredSelectionCount: ((n = s.blocked) == null ? void 0 : n.reason) === "selection-count" ? fn(t.type) : void 0,
    blockedIds: ((i = s.blocked) == null ? void 0 : i.itemIds) || ((u = s.blocked) == null ? void 0 : u.skippedIds),
    labelKey: o == null ? void 0 : o.labelKey,
    shortcuts: o == null ? void 0 : o.shortcuts,
    messageKey: (d = s.blocked) != null && d.reason ? `grid-editor.toolbar.${t.type}.${s.blocked.reason}` : void 0
  };
}, pn = (e) => {
  var h, C;
  const t = e.selection.value, o = e.editorMetaById.value, s = De(e.sectionRows.value), r = t.selectedIds, n = Array.from(new Set(r.flatMap((M) => {
    const k = s.itemMembership[M];
    return [
      (k == null ? void 0 : k.sectionId) || null,
      (k == null ? void 0 : k.rowId) || null
    ].filter(Boolean);
  }))), i = (h = Object.values(s.items).slice().sort((M, k) => M.order - k.order || M.id.localeCompare(k.id))[0]) == null ? void 0 : h.id, u = n[0] || i, d = {}, c = u ? { id: u } : {};
  [
    ...un,
    { type: "section-row-collapse", payload: c },
    { type: "section-row-expand", payload: c },
    { type: "section-row-move", payload: u ? { id: u, dy: 1 } : {} },
    { type: "section-row-delete", payload: c },
    { type: "section-row-reorder", payload: c }
  ].forEach((M) => {
    d[M.type] = yn(e, M);
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
}, xo = (e) => e.kind === "layout" ? e.layout : e.layouts[e.breakpoint] || [], ks = (e) => ({
  layoutSize: xo(e).length,
  layoutCount: e.kind === "responsive" ? Object.keys(e.layouts).length : 1,
  metadataCount: Object.keys(e.editorMetaById || {}).length,
  sectionRowCount: Object.keys(e.sectionRows.items || {}).length,
  selectionCount: e.selection.selectedIds.length,
  focusId: e.focusId
}), mn = (e, t) => {
  const o = [];
  return (/* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])).forEach((r) => {
    const n = e[r], i = t[r];
    if (!i && n) {
      o.push({ type: "remove", id: r, previous: n });
      return;
    }
    i && !Ne(n, i) && o.push({ type: "set", id: r, previous: n, next: i });
  }), o;
}, gn = (e, t) => {
  const o = [], s = e.items || {}, r = t.items || {};
  return (/* @__PURE__ */ new Set([...Object.keys(s), ...Object.keys(r)])).forEach((i) => {
    const u = s[i], d = r[i];
    if (!d && u) {
      o.push({ type: "remove", id: i, previous: u });
      return;
    }
    d && !Ne(u, d) && o.push({ type: "set", id: i, previous: u, next: d });
  }), o;
}, Ms = (e, t, o = {}) => {
  const s = zt(
    xo(e),
    xo(t)
  ), r = o.metadataPatches || mn(e.editorMetaById, t.editorMetaById), n = o.sectionRowPatches || gn(e.sectionRows, t.sectionRows), i = fo(s, r);
  return n.forEach((u) => i.push(u.id)), {
    layoutPatches: s,
    metadataPatches: r,
    sectionRowPatches: n,
    affectedIds: Array.from(new Set(i)),
    beforeSummary: ks(e),
    afterSummary: ks(t),
    risk: o.risk
  };
}, uo = {
  activeId: null,
  guides: [],
  displayGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}, Ss = () => {
  const e = typeof performance != "undefined" ? performance : null;
  return e && typeof e.now == "function" ? e.now() : Date.now();
}, St = (e) => xe(e), We = (e) => ({
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
}, hn = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e), W = (e) => typeof e == "number" && Number.isFinite(e), Ze = (e, t) => Math.max(1, Math.floor(W(e) ? e : t)), Yt = (e) => e.payload && typeof e.payload == "object" ? e.payload : {}, vn = (e) => e === "vertical" || e === "horizontal" || e === null, Cs = (e) => e === "offset" || e === "cursor" || e === "nearest-fit" || e === "first-fit" || e === "insert-top-shift", bn = (e) => e || "invalid-input", In = (e, t, o) => {
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
    const u = s(i.i, o);
    return t[i.i] && (r[u] = { ...t[i.i] }), { ...wo(i), i: u };
  }), metaById: r };
}, Qs = (e) => {
  var zo;
  const t = e.kind || (e.layouts ? "responsive" : "layout"), o = Se([]), s = Se({}), r = e.layout || o, n = e.layouts || s, i = e.breakpoint || Se("default"), u = !e.mode && !e.defaultMode, d = Se(e.defaultMode || "view"), c = e.mode || d, y = Se(
    xe(e.defaultEditorMetaById)
  ), l = e.editorMetaById || y, p = Se(
    e.defaultSectionRows || Gs()
  ), m = e.sectionRows || p, h = Se(
    Re(
      ((zo = e.selectedIds) == null ? void 0 : zo.value) || e.defaultSelectedIds || [],
      e.selectedIds ? "external" : "api"
    )
  ), C = Se(null), M = Se({ ...uo }), k = Se(null), z = Se(null), K = Se(null), T = Se(!1), te = Se(!1), D = Se(h.value.activeId), x = Se(!1), P = [];
  let A = 0, R = 0;
  const L = (a) => {
    R += 1;
    try {
      return a();
    } finally {
      R -= 1;
    }
  }, S = (a) => {
    var f, b;
    try {
      (f = e.onEvent) == null || f.call(e, a);
    } catch (v) {
      if (a.type !== "editor-error")
        try {
          (b = e.onEvent) == null || b.call(e, {
            type: "editor-error",
            code: "editor-event-listener-error",
            message: "Grid editor event listener failed.",
            details: v
          });
        } catch (w) {
        }
    }
  }, B = () => t === "responsive" ? ie(n.value[i.value] || []) : ie(r.value), _ = (a) => {
    A += 1, L(() => {
      t === "responsive" ? (n.value = {
        ...n.value,
        [i.value]: ie(a)
      }, e.layout && (r.value = ie(a))) : r.value = ie(a);
    });
  }, H = () => t === "responsive" ? Wt(n.value) : { default: ie(r.value) }, le = (a, f = i.value) => {
    A += 1, L(() => {
      n.value = Wt(a), i.value = f, e.layout && (r.value = ie(a[f] || []));
    });
  }, ae = () => t === "responsive" ? {
    kind: "responsive",
    layouts: H(),
    breakpoint: i.value,
    editorMetaById: St(l.value),
    sectionRows: st(m.value),
    selection: We(h.value),
    focusId: D.value
  } : {
    kind: "layout",
    layout: B(),
    editorMetaById: St(l.value),
    sectionRows: st(m.value),
    selection: We(h.value),
    focusId: D.value
  }, Me = (a) => {
    A += 1, a.kind === "responsive" ? le(a.layouts, a.breakpoint) : _(a.layout), l.value = St(a.editorMetaById), m.value = st(a.sectionRows), h.value = We(a.selection), D.value = a.focusId;
  }, J = Se(ae()), U = e.history === !1 ? null : e.history || Br();
  U == null || U.replacePresent(ae());
  const Q = os(() => !Ne(ae(), J.value)), Be = os(() => C.value ? "conflict" : te.value ? "savePending" : T.value ? "saveFailed" : K.value ? K.value : k.value ? "placing" : c.value === "view" ? "viewing" : Q.value ? "editingDirty" : "editingClean"), _e = hn(e.persistence) ? e.persistence : null, Ue = zr({
    getEditorMetaById: () => l.value,
    getSectionRows: () => m.value,
    setEditorMetaById: (a, f) => {
      A += 1, l.value = xe(a, { layout: B() }), (f === "save-success" || f === "load-success") && (J.value = ae());
    },
    setSectionRows: (a, f) => {
      A += 1, m.value = {
        version: 1,
        items: a.items,
        itemMembership: a.itemMembership
      }, (f === "save-success" || f === "load-success") && (J.value = ae());
    },
    persistence: _e,
    onSaveStateChange: (a) => {
      te.value = a.status === "saving", T.value = a.status === "error", S({
        type: "save-state-change",
        status: a.status,
        dirty: a.dirty,
        error: a.error
      });
    },
    onConflict: (a) => {
      A += 1, C.value = a, S({ type: "conflict", conflict: a });
    },
    onError: (a, f, b) => {
      S({ type: "editor-error", code: a, message: f, details: b });
    }
  }), tt = (a, f = !1) => {
    const b = h.value, v = qe(
      a,
      B(),
      l.value,
      a.source
    );
    return e.selectedIds ? (S({
      type: "selection-change",
      selection: v,
      previous: b,
      requested: !0
    }), b) : Ne(b, v) ? b : (A += 1, h.value = v, D.value = v.activeId, S({
      type: "selection-change",
      selection: v,
      previous: b,
      requested: f
    }), v);
  }, He = (a, f, b, v = ((w) => (w = f.diagnostics) == null ? void 0 : w.guardMs)() || 0) => {
    var G, j, he;
    const g = Ot(
      a.history,
      Ut(a.type)
    ), $ = {
      ...f,
      diagnostics: {
        ...f.diagnostics,
        durationMs: Ss() - b,
        guardMs: v,
        historyMode: ((G = f.diagnostics) == null ? void 0 : G.historyMode) || g.mode,
        source: ((j = f.diagnostics) == null ? void 0 : j.source) || a.source,
        origin: ((he = f.diagnostics) == null ? void 0 : he.origin) || a.origin
      }
    };
    return z.value = $, $.status === "blocked" || $.status === "cancelled" || $.status === "timeout" ? S({ type: "command-blocked", command: a, result: $ }) : $.status === "error" ? S({ type: "command-error", command: a, result: $ }) : S({ type: "command-commit", command: a, result: $ }), K.value === "keyboardEditing" && a.source === "keyboard" && (K.value = null), $;
  }, ht = (a, f, b, v) => {
    var G, j;
    const w = Ot(
      a.history,
      Ut(a.type)
    );
    if (b.diagnostics = {
      durationMs: ((G = b.diagnostics) == null ? void 0 : G.durationMs) || 0,
      ...b.diagnostics,
      historyMode: w.mode,
      source: a.source,
      origin: a.origin
    }, !U)
      return b;
    if (w.mode === "clear")
      return U.clear(ae()), b;
    if (w.mode === "replace")
      return U.replacePresent(ae(), {
        preserveRedoStack: w.preserveRedoStack
      }), b;
    if (w.mode === "ignore" || !Mi(a.type))
      return b;
    const g = v || ae(), $ = $r({
      commandId: a.id,
      commandType: a.type,
      before: f,
      after: g,
      mergeKey: w.mergeKey,
      source: a.source,
      origin: a.origin,
      targetIds: b.targetIds,
      affectedIds: b.affectedIds,
      historyMode: w.mode
    });
    return U.push($, {
      preserveRedoStack: w.preserveRedoStack || w.mode === "record-preserveRedoStack"
    }), b.undo = $, t === "layout" && ((j = e.legacyHistoryStore) == null || j.push(B())), b;
  }, vt = (a) => Vt(a.type).mutualExclusionScope || "global", bt = (a, f, b) => {
    const v = Vt(a.type);
    return {
      id: `${a.id}:transaction`,
      commandId: a.id,
      command: a,
      source: a.source || v.defaultSource || "api",
      origin: a.origin,
      scope: vt(a),
      before: f,
      after: b,
      preview: Ms(f, b, {
        risk: v.risk
      }),
      history: Ot(
        a.history,
        v.defaultHistory.mode || Ut(a.type)
      )
    };
  }, I = (a, f, b) => {
    if (e.selectedIds) {
      Ne(a.selection, f.selection) || S({
        type: "selection-change",
        selection: We(f.selection),
        previous: We(a.selection),
        requested: !0
      });
      return;
    }
    Ne(a.selection, b.selection) || S({
      type: "selection-change",
      selection: We(b.selection),
      previous: We(a.selection)
    }), a.focusId !== b.focusId && S({
      type: "focus-change",
      from: a.focusId,
      to: b.focusId,
      reason: "transaction"
    });
  }, E = (a, f, b, v = {}) => {
    const w = !!e.selectedIds, g = w ? ot(b, {
      selection: f.selection,
      focusId: f.focusId
    }) : b, $ = bt(a, f, g), G = !Ne(f, g), j = v.status || (G ? "changed" : "noop"), he = Ie(a, j, {
      ...v,
      targetIds: v.targetIds || $.preview.affectedIds,
      layoutPatches: v.layoutPatches || $.preview.layoutPatches,
      metadataPatches: v.metadataPatches || $.preview.metadataPatches,
      affectedIds: v.affectedIds || $.preview.affectedIds,
      selection: v.selection || g.selection,
      diagnostics: {
        durationMs: 0,
        ...v.diagnostics
      }
    });
    if (G)
      try {
        Me($.after), I(f, b, $.after);
      } catch (O) {
        try {
          Me($.before);
        } catch (V) {
        }
        return Zo(a, "Editor transaction apply failed.", O);
      }
    else w && I(f, b, $.after);
    return ht(a, f, he, $.after);
  }, Z = (a) => typeof e.layoutEngineOptions == "function" ? e.layoutEngineOptions() : e.layoutEngineOptions ? e.layoutEngineOptions : W(a.cols) ? {
    cols: Math.max(1, Math.floor(a.cols)),
    maxRows: W(a.maxRows) ? a.maxRows : 1 / 0,
    compactType: vn(a.compactType) ? a.compactType : "vertical",
    allowOverlap: a.allowOverlap === !0,
    preventCollision: a.preventCollision === !0
  } : null, re = (a) => {
    const f = Z(a);
    return f ? f.cols : W(a.cols) && a.cols > 0 ? Math.floor(a.cols) : void 0;
  }, me = (a) => {
    const f = {}, b = re(a);
    return b && (f.cols = b), typeof a.breakpoint == "string" && (f.breakpoint = a.breakpoint), typeof a.layoutId == "string" && (f.layoutId = a.layoutId), typeof a.viewFormat == "string" && (f.viewFormat = a.viewFormat), Object.keys(f).length > 0 ? f : void 0;
  }, Te = async (a, f, b, v) => {
    const w = `${a.id}:layout`;
    if (e.layoutOperationRunner)
      return await e.layoutOperationRunner({
        commandId: a.id,
        layout: f,
        operation: b,
        phase: "commit",
        source: a.source || "api"
      });
    const g = Z(v);
    return g ? await Promise.resolve(Rs({
      id: w,
      phase: "commit",
      layout: f,
      operation: b,
      options: g
    })) : In(w, f, b);
  }, Ke = async (a) => {
    try {
      return await a.read();
    } catch (f) {
      if (a !== yt)
        return yt.read();
      throw f;
    }
  }, we = async (a, f) => {
    try {
      await a.write(f);
    } catch (b) {
      if (a !== yt) {
        await yt.write(f);
        return;
      }
      throw b;
    }
  }, Ce = () => !e.clipboard || e.clipboard === "internal" ? yt : e.clipboard === "system" ? Ar() : e.clipboard, Ve = (a, f) => ({
    durationMs: 0,
    computed: {
      placement: {
        ...a.summary,
        collisionPolicy: (f == null ? void 0 : f.collisionPolicy) === "layout" || (f == null ? void 0 : f.collisionPolicy) === "block" ? f.collisionPolicy : a.summary.collisionPolicy,
        sessionId: typeof (f == null ? void 0 : f.placementSessionId) == "string" ? f.placementSessionId : a.summary.sessionId,
        source: typeof (f == null ? void 0 : f.placementSource) == "string" ? f.placementSource : a.summary.source
      }
    },
    messages: a.summary.diagnostics.map((v) => ({
      code: v.code,
      level: v.level,
      message: v.message,
      itemIds: v.itemIds,
      recoverable: v.level !== "error"
    }))
  }), ze = (a) => ({
    durationMs: 0,
    computed: {
      placement: {
        strategy: a.strategy,
        placementSource: a.strategy,
        collisionPolicy: a.collisionPolicy,
        sessionId: a.id,
        source: a.source,
        insertedIds: a.ghostItems.map((f) => f.id),
        shiftedIds: a.affectedOutlines.filter((f) => f.kind === "shift").map((f) => f.id),
        before: a.affectedOutlines.map((f) => ({
          id: f.id,
          ...f.before
        })),
        after: a.affectedOutlines.map((f) => ({
          id: f.id,
          ...f.after
        })),
        diagnostics: a.diagnostics
      }
    },
    messages: a.diagnostics.map((f) => ({
      code: f.code,
      level: f.level,
      message: f.message,
      itemIds: f.itemIds,
      recoverable: f.level !== "error"
    }))
  }), Le = (a, f, b, v = [], w) => ({
    status: "blocked",
    blocked: {
      reason: f,
      itemIds: v,
      message: b
    },
    diagnostics: w || {
      durationMs: 0,
      messages: [{
        code: `grid-editor.placement.${f}`,
        level: f === "invalid-input" ? "error" : "warning",
        message: b,
        itemIds: v,
        recoverable: f !== "invalid-input"
      }]
    }
  }), Et = (a) => {
    if (a.commandType && a.commandType !== "add" || a.source === "paste") return a;
    const f = Array.isArray(a.items) ? a.items : a.item ? [a.item] : [];
    if (f.length === 0) return a;
    const b = new Set(B().map((G) => G.i)), v = e.idGenerator || it, w = a.editorMetaById || {}, g = {}, $ = f.filter((G) => G && typeof G == "object").map((G, j) => {
      const he = typeof G.i == "string" && G.i.length > 0 ? G.i : `item-${j + 1}`, O = b.has(he) ? v(he, b) : he;
      return b.add(O), w[he] && (g[O] = { ...w[he] }), {
        ...G,
        i: O,
        x: W(G.x) ? G.x : 0,
        y: W(G.y) ? G.y : 0,
        w: Ze(G.w, 1),
        h: Ze(G.h, 1)
      };
    });
    return {
      ...a,
      commandType: "add",
      item: void 0,
      items: $,
      editorMetaById: xe(g, { layout: $ })
    };
  }, Je = (a) => {
    const f = k.value;
    return f ? (k.value = null, M.value = { ...uo }, S({ type: "placement-cancel", sessionId: f.id, reason: a }), f) : null;
  }, so = (a, f, b, v) => {
    for (let w = 0; w < f.length; w++) {
      const g = Ae(a, f[w]);
      if (!g) continue;
      if (g.x < 0 || g.y < 0 || g.x + g.w > b)
        return { ok: !1, reason: "bounds", itemIds: [g.i] };
      if (Number.isFinite(v) && g.y + g.h > v)
        return { ok: !1, reason: "maxRows", itemIds: [g.i] };
      const $ = Ct(a, g).filter((G) => G.i !== g.i);
      if ($.length > 0)
        return {
          ok: !1,
          reason: "collision",
          itemIds: [g.i, ...$.map((G) => G.i)]
        };
    }
    return { ok: !0 };
  }, ti = (a, f) => {
    const b = De(m.value, f), v = [], w = [];
    return a.forEach((g) => {
      const $ = b.itemMembership[g], G = $ != null && $.sectionId ? b.items[$.sectionId] : void 0, j = $ != null && $.rowId ? b.items[$.rowId] : void 0;
      G != null && G.locked || j != null && j.locked ? v.push(g) : (G != null && G.collapsed || j != null && j.collapsed) && w.push(g);
    }), v.length > 0 ? { reason: "section-row-locked", itemIds: v } : w.length > 0 ? { reason: "section-row-collapsed", itemIds: w } : null;
  }, io = (a, f) => {
    const b = new Set(f), v = /* @__PURE__ */ new Set();
    return Object.keys(a.itemMembership).forEach((w) => {
      const g = a.itemMembership[w];
      (g.sectionId && b.has(g.sectionId) || g.rowId && b.has(g.rowId)) && v.add(w);
    }), f.forEach((w) => {
      var g, $;
      ($ = (g = a.items[w]) == null ? void 0 : g.itemIds) == null || $.forEach((G) => v.add(G));
    }), Array.from(v).sort();
  }, Bo = (a, f) => {
    if (W(f.order)) return f.order;
    const b = Object.values(a.items).slice().sort((g, $) => g.order - $.order || g.id.localeCompare($.id)), v = f.beforeId ? a.items[f.beforeId] : void 0, w = f.afterId ? a.items[f.afterId] : void 0;
    if (v) {
      const g = b[b.findIndex(($) => $.id === v.id) - 1];
      return g ? (g.order + v.order) / 2 : v.order - 1;
    }
    if (w) {
      const g = b[b.findIndex(($) => $.id === w.id) + 1];
      return g ? (w.order + g.order) / 2 : w.order + 1;
    }
    return b.length > 0 ? b[b.length - 1].order + 1 : 0;
  }, oi = async (a, f, b, v) => {
    var ke, Pt, Rt, Lo, Fo, No, jo, Ho, Ko, Xo, Yo, _o, Uo;
    const w = B(), g = Yt(a), $ = [];
    let G, j = ie(w), he = We(v.selection), O = v.focusId;
    const V = no(a.type) ? ti(f, w) : null;
    if (V)
      return Ie(a, "blocked", {
        targetIds: f,
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
    const ee = $o(a);
    if (ee && no(a.type)) {
      const Y = $.slice();
      if (a.type === "add") {
        const q = xe(g.editorMetaById, {
          layout: ee
        });
        Object.keys(q).forEach((Xe) => {
          Y.push({ type: "set", id: Xe, next: q[Xe] });
        });
      } else if (a.type === "paste") {
        const q = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, Xe = xe(q == null ? void 0 : q.editorMetaById, {
          layout: ee
        });
        Object.keys(Xe).forEach((xt) => {
          Y.push({ type: "set", id: xt, next: Xe[xt] });
        });
      }
      const N = zt(w, ee), X = N.flatMap(
        (q) => q.type === "add" ? [q.item.i] : []
      ), se = N.flatMap(
        (q) => q.type === "move" || q.type === "resize" ? [q.id] : []
      ), ue = fo(N, Y), ce = typeof g.placementSessionId == "string" ? {
        durationMs: 0,
        computed: {
          placement: {
            strategy: Cs(g.strategy) ? g.strategy : "first-fit",
            placementSource: Cs(g.strategy) ? g.strategy : "first-fit",
            collisionPolicy: g.collisionPolicy === "layout" || g.collisionPolicy === "block" ? g.collisionPolicy : void 0,
            sessionId: g.placementSessionId,
            source: typeof g.placementSource == "string" ? g.placementSource : void 0,
            insertedIds: X,
            shiftedIds: se,
            before: w.map((q) => ({
              id: q.i,
              x: q.x,
              y: q.y,
              w: q.w,
              h: q.h
            })),
            after: ee.map((q) => ({
              id: q.i,
              x: q.x,
              y: q.y,
              w: q.w,
              h: q.h
            })),
            diagnostics: Array.isArray((ke = g.placementSummary) == null ? void 0 : ke.diagnostics) ? g.placementSummary.diagnostics : []
          }
        }
      } : G, de = lt(
        At(v.editorMetaById, Y),
        ee
      ), Ee = X.length > 0 && (a.type === "add" || a.type === "paste") ? Re(X, "api") : qe(
        v.selection,
        ee,
        de,
        "api"
      );
      return E(a, v, ot(v, {
        layout: ee,
        editorMetaById: de,
        selection: Ee,
        focusId: Ee.activeId
      }), {
        status: ue.length > 0 ? "changed" : "noop",
        targetIds: f.length > 0 ? f : a.targetIds,
        layoutPatches: N,
        metadataPatches: Y,
        affectedIds: ue,
        selection: Ee,
        blocked: b.length > 0 ? { reason: "capability", skippedIds: b, itemIds: b } : void 0,
        diagnostics: ce
      });
    }
    if (Qo(a.type)) {
      const Y = g, N = De(m.value, w), X = f.length > 0 ? f : Y.id ? [Y.id] : [], se = X.filter((fe) => !N.items[fe]);
      if (se.length > 0)
        return Ie(a, "blocked", {
          targetIds: X,
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
      const ue = X.filter((fe) => {
        var ve;
        return (ve = N.items[fe]) == null ? void 0 : ve.locked;
      });
      if (ue.length > 0 && a.type !== "section-row-expand")
        return Ie(a, "blocked", {
          targetIds: X,
          blocked: {
            reason: "section-row-locked",
            itemIds: io(N, ue),
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
      const ce = st({
        items: N.items,
        itemMembership: N.itemMembership
      }), de = io(N, X);
      let Ee = h.value.selectedIds.slice(), q = D.value;
      const Xe = W(g.cols) ? g.cols : 12, xt = W(g.maxRows) ? g.maxRows : 1 / 0;
      if (a.type === "section-row-collapse" || a.type === "section-row-expand") {
        const fe = a.type === "section-row-collapse";
        X.forEach((ve) => {
          ce.items[ve] = { ...ce.items[ve], collapsed: fe };
        }), fe && (Ee = Ee.filter((ve) => !de.includes(ve)), q && de.includes(q) && (q = Ee[0] || null));
      } else if (a.type === "section-row-reorder")
        X.forEach((fe) => {
          ce.items[fe] = {
            ...ce.items[fe],
            order: Bo(N, Y)
          };
        });
      else if (a.type === "section-row-move") {
        const fe = W(Y.dy) ? Math.floor(Y.dy) : 0;
        j = j.map(
          (Fe) => de.includes(Fe.i) ? { ...Fe, y: Math.max(0, Fe.y + fe) } : Fe
        ), X.forEach((Fe) => {
          const Ye = ce.items[Fe];
          ce.items[Fe] = {
            ...Ye,
            bounds: Ye.bounds ? { ...Ye.bounds, y: Math.max(0, Ye.bounds.y + fe) } : Ye.bounds
          };
        });
        const ve = so(j, de, Xe, xt);
        if (!ve.ok)
          return Ie(a, "blocked", {
            targetIds: X,
            blocked: {
              reason: ve.reason,
              itemIds: ve.itemIds,
              message: `Section/row move blocked by ${ve.reason}.`
            },
            diagnostics: {
              durationMs: 0,
              messages: [{
                code: `grid-editor.sectionRows.move.${ve.reason}`,
                level: "warning",
                message: `Section/row move blocked by ${ve.reason}.`,
                itemIds: ve.itemIds,
                recoverable: !0
              }]
            }
          });
      } else a.type === "section-row-delete" && (X.forEach((fe) => {
        delete ce.items[fe];
      }), Object.keys(ce.itemMembership || {}).forEach((fe) => {
        var Ye, Gt;
        const ve = ((Ye = ce.itemMembership) == null ? void 0 : Ye[fe]) || {}, Fe = {
          sectionId: ve.sectionId && X.includes(ve.sectionId) ? void 0 : ve.sectionId,
          rowId: ve.rowId && X.includes(ve.rowId) ? void 0 : ve.rowId
        };
        !Fe.sectionId && !Fe.rowId ? (Gt = ce.itemMembership) == null || delete Gt[fe] : ce.itemMembership && (ce.itemMembership[fe] = Fe);
      }), Y.deleteItems === !0 && (j = j.filter((fe) => !de.includes(fe.i)), de.forEach((fe) => {
        l.value[fe] && $.push({ type: "remove", id: fe, previous: l.value[fe] });
      }), Ee = Ee.filter((fe) => !de.includes(fe)), q && de.includes(q) && (q = Ee[0] || null)));
      const ro = De(ce, j), Qe = zt(w, j), Bt = {
        version: 1,
        items: ro.items,
        itemMembership: ro.itemMembership
      }, wt = lt(
        At(v.editorMetaById, $),
        j
      ), $e = qe(
        Re(Ee, "api"),
        j,
        wt,
        "api"
      ), $t = Array.from(/* @__PURE__ */ new Set([...X, ...de]));
      return E(a, v, ot(v, {
        layout: j,
        editorMetaById: wt,
        sectionRows: Bt,
        selection: $e,
        focusId: q
      }), {
        status: "changed",
        targetIds: X,
        layoutPatches: Qe,
        metadataPatches: $,
        affectedIds: $t,
        selection: $e,
        diagnostics: {
          durationMs: 0,
          computed: {
            affectedIds: $t,
            sectionRowContext: {
              source: "metadata"
            }
          },
          messages: [{
            code: `grid-editor.sectionRows.${a.type.replace("section-row-", "")}`,
            level: "info",
            message: `Section/row command ${a.type} applied.`,
            itemIds: de,
            recoverable: !0
          }]
        }
      });
    }
    if (a.type === "select") {
      const Y = h.value, N = ys(w, h.value, {
        id: typeof g.id == "string" ? g.id : void 0,
        ids: Array.isArray(g.ids) ? g.ids.filter((ue) => typeof ue == "string") : typeof g.id == "string" ? void 0 : f,
        toggle: g.toggle === !0,
        range: g.range === !0,
        source: a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
      }), X = qe(
        N,
        w,
        v.editorMetaById,
        N.source
      ), se = e.selectedIds ? Y : X;
      return E(a, v, ot(v, {
        selection: X,
        focusId: X.activeId
      }), {
        status: Ne(Y, se) ? "noop" : "changed",
        targetIds: se.selectedIds,
        selection: se
      });
    }
    if (a.type === "clearSelection") {
      const Y = h.value, N = qe(
        mo("api"),
        w,
        v.editorMetaById,
        "api"
      ), X = e.selectedIds ? Y : N;
      return E(a, v, ot(v, {
        selection: N,
        focusId: N.activeId
      }), {
        status: Ne(Y, X) ? "noop" : "changed",
        selection: X
      });
    }
    if (a.type === "move") {
      const Y = W(g.dx) ? g.dx : null, N = W(g.dy) ? g.dy : null, X = W(g.x), se = W(g.y), ue = Array.from(/* @__PURE__ */ new Set([...f, ...b])), ce = h.value.activeId && f.includes(h.value.activeId) ? h.value.activeId : f[0], de = ce ? Ae(w, ce) : void 0, Ee = (((Pt = a.targetIds) == null ? void 0 : Pt.filter(Boolean).length) || 0) > 1, q = !a.targetIds && h.value.selectedIds.length > 1 && (Y !== null || N !== null), Xe = Ee || q, xt = f.length === 1 && !Ee && (X || se);
      if (f.length > 0 && !xt && (f.length > 1 || Xe)) {
        const Qe = Y !== null ? Y : X && de ? g.x - de.x : 0, Bt = N !== null ? N : se && de ? g.y - de.y : 0, wt = {
          type: "groupMove",
          ids: f,
          activeId: ce,
          dx: Qe,
          dy: Bt,
          userAction: a.source !== "api"
        }, $e = await Te(a, w, wt, g);
        if (G = {
          durationMs: 0,
          layoutDiagnostics: $e.diagnostics,
          operationResult: $e
        }, $e.status === "blocked") {
          const Gt = bn((Rt = $e.blocked) == null ? void 0 : Rt.reason);
          return Ie(a, "blocked", {
            targetIds: ue,
            blocked: {
              reason: Gt,
              itemIds: ((Lo = $e.blocked) == null ? void 0 : Lo.itemIds) || ue,
              skippedIds: b.length > 0 ? b : void 0,
              message: `Move command blocked by ${Gt}.`
            },
            diagnostics: G
          });
        }
        if ($e.status === "error")
          return Ie(a, "error", {
            targetIds: ue,
            diagnostics: G,
            error: $e.error || { message: "Layout operation failed." }
          });
        const $t = $e.patches, fe = $e.affectedIds, ve = $t.length > 0 || $e.status === "changed" || $e.status === "fallback" ? "changed" : "noop", Fe = lt(
          At(v.editorMetaById, $),
          $e.layout
        ), Ye = qe(
          v.selection,
          $e.layout,
          Fe,
          "api"
        );
        return E(a, v, ot(v, {
          layout: $e.layout,
          editorMetaById: Fe,
          selection: Ye,
          focusId: Ye.activeId
        }), {
          status: ve,
          targetIds: ue,
          layoutPatches: $t,
          metadataPatches: $,
          affectedIds: fe,
          selection: Ye,
          blocked: b.length > 0 ? { reason: "capability", skippedIds: b, itemIds: b } : void 0,
          diagnostics: G
        });
      }
      j = j.map((Qe) => {
        if (!f.includes(Qe.i)) return Qe;
        const Bt = f.length === 1 && X ? g.x : Qe.x + (Y || 0), wt = f.length === 1 && se ? g.y : Qe.y + (N || 0);
        return { ...Qe, x: Math.max(0, Math.floor(Bt)), y: Math.max(0, Math.floor(wt)) };
      });
    } else if (a.type === "resize") {
      const Y = f[0];
      j = j.map((N) => {
        if (N.i !== Y) return N;
        const X = W(g.w) ? g.w : N.w + (W(g.dw) ? g.dw : 0), se = W(g.h) ? g.h : N.h + (W(g.dh) ? g.dh : 0);
        return {
          ...N,
          x: W(g.x) ? Math.max(0, Math.floor(g.x)) : N.x,
          y: W(g.y) ? Math.max(0, Math.floor(g.y)) : N.y,
          w: Ze(X, N.w),
          h: Ze(se, N.h)
        };
      });
    } else if (a.type === "align") {
      const Y = W(g.cols) ? g.cols : 12, N = W(g.maxRows) ? g.maxRows : 1 / 0, X = vs(w, g, {
        targetIds: f,
        selectedIds: h.value.selectedIds,
        activeId: h.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: Y,
        maxRows: N,
        skippedIds: b
      });
      if (G = X.diagnostics, X.status === "blocked")
        return Ie(a, "blocked", {
          targetIds: f,
          blocked: X.blocked,
          diagnostics: G
        });
      j = X.layout;
    } else if (a.type === "distribute" || a.type === "tidy") {
      const Y = W(g.cols) ? g.cols : 12, N = W(g.maxRows) ? g.maxRows : 1 / 0, X = a.type === "distribute" ? bs(w, g, {
        targetIds: f,
        selectedIds: h.value.selectedIds,
        activeId: h.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: Y,
        maxRows: N,
        skippedIds: b
      }) : Is(w, g, {
        targetIds: f,
        selectedIds: h.value.selectedIds,
        activeId: h.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: Y,
        maxRows: N,
        skippedIds: b
      });
      if (G = X.diagnostics, X.status === "blocked")
        return Ie(a, "blocked", {
          targetIds: f,
          blocked: X.blocked,
          diagnostics: G
        });
      j = X.layout;
    } else if (a.type === "add") {
      const Y = Array.isArray(g.items) ? g.items : g.item ? [g.item] : [], N = new Set(j.map((de) => de.i)), X = e.idGenerator || it, se = Y.filter((de) => de && typeof de == "object").map((de, Ee) => {
        const q = de, Xe = typeof q.i == "string" && !N.has(q.i) ? q.i : X(typeof q.i == "string" ? q.i : `item-${Ee + 1}`, N);
        return N.add(Xe), {
          ...q,
          i: Xe,
          x: W(q.x) ? q.x : 0,
          y: W(q.y) ? q.y : 0,
          w: Ze(q.w, 1),
          h: Ze(q.h, 1)
        };
      }), ue = mt(j, se, String(g.strategy || "first-fit"), g);
      if (G = Ve(ue, g), ue.failed)
        return Ie(a, "blocked", {
          targetIds: ue.summary.insertedIds,
          blocked: {
            reason: ((Fo = ue.blocked) == null ? void 0 : Fo.reason) || "bounds",
            itemIds: (No = ue.blocked) == null ? void 0 : No.itemIds,
            message: ((jo = ue.blocked) == null ? void 0 : jo.message) || "One or more items could not fit in the current layout."
          },
          diagnostics: G
        });
      const ce = xe(g.editorMetaById, { layout: se });
      Object.keys(ce).forEach((de) => {
        se.some((Ee) => Ee.i === de) && $.push({ type: "set", id: de, next: ce[de] });
      }), j = ue.layout;
    } else if (a.type === "delete") {
      const Y = new Set(f);
      j = j.filter((N) => !Y.has(N.i)), f.forEach((N) => {
        l.value[N] && $.push({ type: "remove", id: N, previous: l.value[N] });
      }), O = ps(j, f, l.value);
    } else if (a.type === "duplicate") {
      const Y = f.map((se) => Ae(w, se)).filter(Boolean), N = Tt(
        Y,
        l.value,
        new Set(w.map((se) => se.i)),
        e.idGenerator || it
      );
      Object.keys(N.metaById).forEach((se) => {
        $.push({ type: "set", id: se, next: N.metaById[se] });
      });
      const X = mt(
        j,
        N.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (G = Ve(X, g), X.failed)
        return Ie(a, "blocked", {
          targetIds: f,
          blocked: {
            reason: ((Ho = X.blocked) == null ? void 0 : Ho.reason) || "bounds",
            itemIds: ((Ko = X.blocked) == null ? void 0 : Ko.itemIds) || f,
            message: ((Xo = X.blocked) == null ? void 0 : Xo.message) || "Duplicated items could not fit in the current layout."
          },
          diagnostics: G
        });
      j = X.layout, he = Re(N.items.map((se) => se.i), "api"), O = he.activeId;
    } else if (a.type === "copy") {
      const Y = f.map((N) => Ae(w, N)).filter(Boolean);
      return await we(Ce(), Tr({
        sourceId: a.id,
        items: Y,
        editorMetaById: xe(l.value, { layout: Y }),
        source: me(g)
      })), Ie(a, "changed", {
        targetIds: f,
        affectedIds: f
      });
    } else if (a.type === "paste") {
      const Y = g.resolvedClipboardPayload && typeof g.resolvedClipboardPayload == "object" ? g.resolvedClipboardPayload : null, N = Y ? {
        items: ie(Array.isArray(Y.items) ? Y.items : []),
        editorMetaById: xe(Y.editorMetaById),
        sourceId: typeof Y.sourceId == "string" ? Y.sourceId : a.id,
        copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 2,
        source: Y.source,
        originalGeometryById: Y.originalGeometryById
      } : await Ke(Ce());
      if (!N)
        return Ie(a, "blocked", {
          blocked: {
            reason: "clipboard-unavailable",
            message: "Clipboard is empty or unavailable."
          }
        });
      const X = (Y == null ? void 0 : Y.mapped) === !0 ? {
        items: ie(N.items)
      } : lo(N, {
        cols: re(g)
      }), se = (Y == null ? void 0 : Y.mapped) === !0 ? {
        items: ie(X.items),
        metaById: xe(N.editorMetaById, {
          layout: X.items
        })
      } : Tt(
        X.items,
        N.editorMetaById,
        new Set(w.map((ce) => ce.i)),
        e.idGenerator || it
      );
      Object.keys(se.metaById).forEach((ce) => {
        $.push({ type: "set", id: ce, next: se.metaById[ce] });
      });
      const ue = mt(
        j,
        se.items,
        String(g.strategy || e.pasteStrategy || "offset"),
        g
      );
      if (G = Ve(ue, g), ue.failed)
        return Ie(a, "blocked", {
          blocked: {
            reason: ((Yo = ue.blocked) == null ? void 0 : Yo.reason) || "bounds",
            itemIds: (_o = ue.blocked) == null ? void 0 : _o.itemIds,
            message: ((Uo = ue.blocked) == null ? void 0 : Uo.message) || "Clipboard items could not fit in the current layout."
          },
          diagnostics: G
        });
      j = ue.layout, he = Re(se.items.map((ce) => ce.i), "api"), O = he.activeId;
    } else es(a.type) && f.forEach((Y) => {
      const N = a.type === "lock" ? { locked: !0 } : a.type === "unlock" ? { locked: !1 } : a.type === "show" ? { visible: !0 } : { visible: !1 }, X = ts(l.value, Y, N);
      X.patch && $.push(X.patch);
    });
    const ye = zt(w, j), F = lt(
      At(v.editorMetaById, $),
      j
    ), oe = qe(
      he,
      j,
      F,
      he.source
    ), ge = O !== v.focusId ? O : oe.activeId, ne = fo(ye, $), be = ne.length > 0 ? "changed" : "noop";
    return E(a, v, ot(v, {
      layout: j,
      editorMetaById: F,
      selection: oe,
      focusId: ge
    }), {
      status: be,
      targetIds: f.length > 0 ? f : a.targetIds,
      layoutPatches: ye,
      metadataPatches: $,
      affectedIds: ne,
      selection: e.selectedIds ? v.selection : oe,
      blocked: b.length > 0 ? { reason: "capability", skippedIds: b, itemIds: b } : void 0,
      diagnostics: G
    });
  }, si = (a, f) => a.kind === "responsive" ? {
    ...a,
    layouts: {
      ...Wt(a.layouts),
      [a.breakpoint]: ie(f)
    }
  } : {
    ...a,
    layout: ie(f)
  }, ot = (a, f) => ({
    ...f.layout ? si(a, f.layout) : a,
    editorMetaById: f.editorMetaById ? St(f.editorMetaById) : St(a.editorMetaById),
    sectionRows: f.sectionRows ? st(f.sectionRows) : st(a.sectionRows),
    selection: f.selection ? We(f.selection) : We(a.selection),
    focusId: f.focusId !== void 0 ? f.focusId : a.focusId
  }), $o = (a) => {
    const f = Yt(a), b = f.candidateLayout || f.placementCandidateLayout || f.afterLayout || f.layout;
    return Array.isArray(b) ? ie(b.filter(
      (v) => !!v && typeof v == "object" && typeof v.i == "string"
    )) : null;
  }, ii = (a, f, b) => {
    const v = Yt(a);
    let w = $o(a), g = St(b.editorMetaById), $ = st(b.sectionRows), G = We(b.selection), j = b.focusId;
    const he = a.type === "delete" || a.type === "section-row-delete" ? "destructive" : Vo(a.type) ? "persistence" : a.source === "external" || a.source === "remote" ? "external" : "normal";
    if (!w && a.type === "delete") {
      const O = new Set(f);
      w = B().filter((V) => !O.has(V.i)), f.forEach((V) => {
        delete g[V];
      }), G = Re(
        G.selectedIds.filter((V) => !O.has(V)),
        a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
      ), j = ps(w, f, g);
    }
    if (!w && a.type === "move") {
      const O = W(v.dx) ? v.dx : null, V = W(v.dy) ? v.dy : null, ee = W(v.x), ye = W(v.y);
      (O !== null || V !== null || ee || ye) && (w = B().map((F) => f.includes(F.i) ? {
        ...F,
        x: ee && f.length === 1 ? Math.max(0, Math.floor(v.x)) : Math.max(0, Math.floor(F.x + (O || 0))),
        y: ye && f.length === 1 ? Math.max(0, Math.floor(v.y)) : Math.max(0, Math.floor(F.y + (V || 0)))
      } : F));
    }
    if (!w && a.type === "resize" && (w = B().map((O) => O.i !== f[0] ? O : {
      ...O,
      x: W(v.x) ? Math.max(0, Math.floor(v.x)) : O.x,
      y: W(v.y) ? Math.max(0, Math.floor(v.y)) : O.y,
      w: W(v.w) ? Ze(v.w, O.w) : O.w,
      h: W(v.h) ? Ze(v.h, O.h) : O.h
    })), !w && a.type === "add") {
      const O = Array.isArray(v.items) ? v.items : v.item ? [v.item] : [], V = new Set(B().map((F) => F.i)), ee = e.idGenerator || it, ye = O.filter((F) => F && typeof F == "object").map((F, oe) => {
        const ge = F, ne = typeof ge.i == "string" && !V.has(ge.i) ? ge.i : ee(typeof ge.i == "string" ? ge.i : `item-${oe + 1}`, V);
        return V.add(ne), {
          ...ge,
          i: ne,
          x: W(ge.x) ? ge.x : 0,
          y: W(ge.y) ? ge.y : 0,
          w: Ze(ge.w, 1),
          h: Ze(ge.h, 1)
        };
      });
      if (ye.length > 0) {
        const F = mt(
          B(),
          ye,
          String(v.strategy || "first-fit"),
          v
        );
        F.failed || (w = F.layout, g = {
          ...g,
          ...xe(v.editorMetaById, { layout: ye })
        }, G = Re(ye.map((oe) => oe.i), "api"), j = G.activeId);
      }
    }
    if (!w && a.type === "paste") {
      const O = v.resolvedClipboardPayload && typeof v.resolvedClipboardPayload == "object" ? v.resolvedClipboardPayload : null;
      if (O != null && O.items && Array.isArray(O.items)) {
        const V = {
          version: 2,
          sourceId: typeof O.sourceId == "string" ? O.sourceId : a.id,
          copiedAt: (/* @__PURE__ */ new Date()).toISOString(),
          items: ie(O.items),
          editorMetaById: xe(O.editorMetaById),
          source: O.source,
          originalGeometryById: O.originalGeometryById
        }, ee = O.mapped === !0 ? ie(V.items) : lo(V, {
          cols: re(v)
        }).items, ye = O.mapped === !0 ? {
          items: ee,
          metaById: xe(O.editorMetaById, {
            layout: ee
          })
        } : Tt(
          ee,
          xe(O.editorMetaById),
          new Set(B().map((oe) => oe.i)),
          e.idGenerator || it
        ), F = mt(
          B(),
          ye.items,
          String(v.strategy || e.pasteStrategy || "offset"),
          v
        );
        F.failed || (w = F.layout, g = { ...g, ...ye.metaById }, G = Re(ye.items.map((oe) => oe.i), "api"), j = G.activeId);
      }
    }
    if (!w && a.type === "duplicate") {
      const O = f.map((ye) => Ae(B(), ye)).filter(Boolean), V = Tt(
        O,
        g,
        new Set(B().map((ye) => ye.i)),
        e.idGenerator || it
      ), ee = mt(
        B(),
        V.items,
        String(v.strategy || e.pasteStrategy || "offset"),
        v
      );
      ee.failed || (w = ee.layout, g = { ...g, ...V.metaById }, G = Re(V.items.map((ye) => ye.i), "api"), j = G.activeId);
    }
    if (!w && a.type === "align") {
      const O = vs(B(), v, {
        targetIds: f,
        selectedIds: h.value.selectedIds,
        activeId: h.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: W(v.cols) ? v.cols : 12,
        maxRows: W(v.maxRows) ? v.maxRows : 1 / 0
      });
      O.status !== "blocked" && (w = O.layout);
    }
    if (!w && (a.type === "distribute" || a.type === "tidy")) {
      const O = a.type === "distribute" ? bs(B(), v, {
        targetIds: f,
        selectedIds: h.value.selectedIds,
        activeId: h.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: W(v.cols) ? v.cols : 12,
        maxRows: W(v.maxRows) ? v.maxRows : 1 / 0
      }) : Is(B(), v, {
        targetIds: f,
        selectedIds: h.value.selectedIds,
        activeId: h.value.activeId,
        metaById: l.value,
        sectionRows: m.value,
        cols: W(v.cols) ? v.cols : 12,
        maxRows: W(v.maxRows) ? v.maxRows : 1 / 0
      });
      O.status !== "blocked" && (w = O.layout);
    }
    if (es(a.type) && f.forEach((O) => {
      const V = a.type === "lock" ? { locked: !0 } : a.type === "unlock" ? { locked: !1 } : a.type === "show" ? { visible: !0 } : { visible: !1 }, ee = ts(g, O, V);
      ee.patch && (g = At(g, [ee.patch]));
    }), a.type === "select" ? (G = ys(B(), h.value, {
      id: typeof v.id == "string" ? v.id : void 0,
      ids: Array.isArray(v.ids) ? v.ids.filter((O) => typeof O == "string") : typeof v.id == "string" ? void 0 : f,
      toggle: v.toggle === !0,
      range: v.range === !0,
      source: a.source === "keyboard" ? "keyboard" : a.source === "pointer" ? "pointer" : "api"
    }), j = G.activeId) : a.type === "clearSelection" && (G = mo("api"), j = null), Qo(a.type)) {
      const O = v, V = De($, B()), ee = f.length > 0 ? f : O.id ? [O.id] : [];
      if (ee.filter((F) => !V.items[F]).length === 0) {
        const F = st({
          items: V.items,
          itemMembership: V.itemMembership
        }), oe = io(V, ee);
        if (a.type === "section-row-collapse" || a.type === "section-row-expand") {
          const ne = a.type === "section-row-collapse";
          ee.forEach((be) => {
            F.items[be] = { ...F.items[be], collapsed: ne };
          }), ne && (G = Re(
            G.selectedIds.filter((be) => !oe.includes(be)),
            "api"
          ), j = G.activeId);
        } else if (a.type === "section-row-reorder")
          ee.forEach((ne) => {
            F.items[ne] = {
              ...F.items[ne],
              order: Bo(V, O)
            };
          });
        else if (a.type === "section-row-move") {
          const ne = W(O.dy) ? Math.floor(O.dy) : 0;
          w = (w || B()).map(
            (be) => oe.includes(be.i) ? { ...be, y: Math.max(0, be.y + ne) } : be
          ), ee.forEach((be) => {
            const ke = F.items[be];
            F.items[be] = {
              ...ke,
              bounds: ke.bounds ? { ...ke.bounds, y: Math.max(0, ke.bounds.y + ne) } : ke.bounds
            };
          });
        } else a.type === "section-row-delete" && (ee.forEach((ne) => {
          delete F.items[ne];
        }), Object.keys(F.itemMembership || {}).forEach((ne) => {
          var Pt, Rt;
          const be = ((Pt = F.itemMembership) == null ? void 0 : Pt[ne]) || {}, ke = {
            sectionId: be.sectionId && ee.includes(be.sectionId) ? void 0 : be.sectionId,
            rowId: be.rowId && ee.includes(be.rowId) ? void 0 : be.rowId
          };
          !ke.sectionId && !ke.rowId ? (Rt = F.itemMembership) == null || delete Rt[ne] : F.itemMembership && (F.itemMembership[ne] = ke);
        }), O.deleteItems === !0 && (w = (w || B()).filter((ne) => !oe.includes(ne.i)), oe.forEach((ne) => {
          delete g[ne];
        }), G = Re(
          G.selectedIds.filter((ne) => !oe.includes(ne)),
          "api"
        ), j = G.activeId));
        const ge = De(F, w || B());
        $ = {
          version: 1,
          items: ge.items,
          itemMembership: ge.itemMembership
        };
      }
    }
    return Ms(b, ot(b, {
      layout: w || void 0,
      editorMetaById: g,
      sectionRows: $,
      selection: G,
      focusId: j
    }), {
      risk: he
    });
  }, It = Dr({
    beforeCommand: e.beforeCommand,
    guardTimeoutMs: e.guardTimeoutMs,
    getSnapshot: ae,
    getStateRevision: () => A,
    check: (a) => Jo(a, {
      mode: c.value,
      modeMissing: u,
      layout: B(),
      editorMetaById: l.value,
      selection: h.value,
      commandPolicy: e.commandPolicy
    }),
    getGuardContext: (a, f, b, v) => {
      const w = Yt(a), g = w.placementSummary && typeof w.placementSummary == "object" ? w.placementSummary : void 0;
      return {
        source: a.source || "api",
        origin: a.origin,
        targetIds: f.allowedIds,
        layout: B(),
        layouts: H(),
        editorMetaById: l.value,
        sectionRows: m.value,
        selection: h.value,
        mode: c.value,
        history: {
          canUndo: !!(U != null && U.canUndo.value),
          canRedo: !!(U != null && U.canRedo.value)
        },
        preview: b,
        placement: g || w.placementSessionId ? {
          sessionId: typeof w.placementSessionId == "string" ? w.placementSessionId : void 0,
          source: typeof w.placementSource == "string" ? w.placementSource : void 0,
          summary: g,
          affectedIds: g == null ? void 0 : g.affectedIds,
          diagnostics: g == null ? void 0 : g.diagnostics
        } : void 0,
        signal: v
      };
    },
    buildPreview: (a, f, b) => ii(a, f.allowedIds, b),
    cleanupInteraction: () => {
      K.value = null, Je("command-cleanup");
    },
    finalize: He,
    now: Ss,
    isStopped: () => x.value,
    onStart: (a) => {
      a.source === "keyboard" && no(a.type) && (K.value = "keyboardEditing"), S({ type: "command-start", command: a });
    },
    commit: async ({ command: a, check: f, before: b, startedAt: v, guardMs: w }) => {
      try {
        if (Vo(a.type)) {
          const $ = a.type === "save" ? await Ue.save() : a.type === "discard" ? Ue.discard() : Ue.reset();
          return $.status === "changed" && (J.value = ae(), T.value = !1), He(a, { ...$, id: a.id }, v, w);
        }
        if (ki(a.type)) {
          const $ = a.type === "undo" ? U == null ? void 0 : U.undo() : U == null ? void 0 : U.redo();
          return $ ? (Me(a.type === "undo" ? $.before : $.after), He(a, Ie(a, "changed", {
            affectedIds: $.affectedIds || $.after.selection.selectedIds,
            selection: h.value,
            undo: $,
            diagnostics: {
              durationMs: 0,
              historyMode: "ignore",
              source: a.source,
              origin: a.origin
            }
          }), v, w)) : He(a, Ie(a, "blocked", {
            blocked: { reason: "missing-item", message: "No editor history entry is available." }
          }), v, w);
        }
        const g = await oi(a, f.allowedIds, f.blockedIds, b);
        return He(a, g, v, w);
      } catch (g) {
        return g instanceof nt ? He(a, Ie(a, "blocked", {
          targetIds: f.targetIds,
          blocked: {
            reason: g.code,
            itemIds: f.targetIds,
            message: g.message
          },
          error: { message: g.message, cause: g }
        }), v, w) : He(
          a,
          Zo(a, "Editor command failed.", g),
          v,
          w
        );
      }
    }
  }), Go = (a) => {
    if (x.value || R > 0) return;
    It.abortPending(a), K.value = null, Je(a), A += 1;
    const f = B(), b = lt(l.value, f);
    Ne(b, l.value) || (l.value = b);
    const v = qe(
      h.value,
      f,
      l.value,
      "external"
    );
    h.value = v, D.value = v.activeId, U == null || U.replacePresent(ae(), { preserveRedoStack: !0 });
  };
  e.layout && P.push(ut(r, () => {
    Go("external-layout");
  }, { deep: !0, flush: "sync" })), e.layouts && P.push(ut(n, () => {
    Go("external-layouts");
  }, { deep: !0, flush: "sync" }));
  const dt = async (a) => It.execute(a), ri = (a) => {
    var g;
    const f = Vt(a.type), b = Ps({
      source: f.defaultSource,
      ...a,
      history: a.history || f.defaultHistory
    }), v = Jo(b, {
      mode: c.value,
      modeMissing: u,
      layout: B(),
      editorMetaById: l.value,
      selection: h.value,
      commandPolicy: e.commandPolicy
    });
    if (v.result) return v.result;
    const w = (g = f.validatePayload) == null ? void 0 : g.call(f, b);
    return w && !w.ok ? qt(b, "invalid-input", {
      targetIds: v.targetIds,
      blocked: {
        reason: "invalid-input",
        itemIds: v.targetIds,
        message: w.message
      }
    }) : Ie(b, "noop", {
      targetIds: v.allowedIds
    });
  }, ni = async (a) => {
    var $, G, j, he, O, V, ee;
    const f = a.commandType || (a.source === "paste" ? "paste" : "add");
    if (u)
      return Le(f, "editor-mode-missing", "Editor mode is not configured.");
    if (c.value === "view")
      return Le(f, "mode-readonly", "Placement requires edit mode.");
    if (x.value)
      return Le(f, "unsupported-scope", "Editor controller is stopped.");
    if (K.value)
      return Le(f, "unsupported-scope", `Cannot start placement while ${K.value}.`);
    if (k.value)
      return Le(f, "command-pending", "A placement session is already active.");
    let b = {
      ...a,
      commandType: f
    };
    const v = Z({
      cols: a.cols,
      maxRows: a.maxRows,
      compactType: a.compactType,
      allowOverlap: a.allowOverlap,
      preventCollision: a.preventCollision
    });
    if (a.source === "paste" || f === "paste") {
      const ye = Ce();
      let F = null, oe = null;
      try {
        F = await ye.read();
      } catch (ke) {
        oe = ke;
      }
      if ((!F || oe) && ye !== yt)
        try {
          F = await yt.read();
        } catch (ke) {
          oe || (oe = ke);
        }
      if (!F && oe) {
        const ke = oe instanceof nt ? oe.code : "clipboard-invalid";
        return Le(
          "paste",
          ke,
          oe instanceof Error ? oe.message : "Clipboard could not be read."
        );
      }
      if (!F || F.items.length === 0)
        return Le(
          "paste",
          "clipboard-unavailable",
          "Clipboard is empty or unavailable."
        );
      const ge = lo(F, {
        cols: ($ = a.cols) != null ? $ : v == null ? void 0 : v.cols
      }), ne = Tt(
        ge.items,
        F.editorMetaById,
        new Set(B().map((ke) => ke.i)),
        e.idGenerator || it
      ), be = {
        items: ne.items,
        editorMetaById: ne.metaById,
        sourceId: F.sourceId,
        source: F.version === 2 ? F.source : void 0,
        originalGeometryById: F.version === 2 ? F.originalGeometryById : void 0,
        responsive: {
          scaled: ge.scaled,
          sourceCols: ge.sourceCols,
          targetCols: ge.targetCols
        },
        mapped: !0
      };
      b = {
        ...b,
        commandType: "paste",
        items: ne.items,
        editorMetaById: ne.metaById,
        resolvedClipboardPayload: be
      };
    } else
      b = Et(b);
    const w = {
      ...b,
      compactType: (G = b.compactType) != null ? G : v == null ? void 0 : v.compactType,
      allowOverlap: (j = b.allowOverlap) != null ? j : v == null ? void 0 : v.allowOverlap,
      preventCollision: (he = b.preventCollision) != null ? he : v == null ? void 0 : v.preventCollision
    }, g = cn(w, {
      baseLayout: B(),
      baseRevision: A,
      defaultStrategy: w.strategy || (f === "paste" ? e.pasteStrategy || "offset" : "first-fit"),
      cols: w.cols,
      maxRows: w.maxRows
    });
    return g.items.length === 0 || g.blocked && g.ghostItems.length === 0 ? Le(
      f,
      ((O = g.blocked) == null ? void 0 : O.reason) || "invalid-input",
      ((V = g.blocked) == null ? void 0 : V.message) || "No items were provided for placement.",
      (ee = g.blocked) == null ? void 0 : ee.itemIds,
      ze(g)
    ) : (k.value = g, S({ type: "placement-start", session: g }), {
      status: g.blocked ? "blocked" : "started",
      session: g,
      blocked: g.blocked ? {
        reason: g.blocked.reason,
        itemIds: g.blocked.itemIds,
        message: g.blocked.message
      } : void 0,
      diagnostics: ze(g)
    });
  }, ai = (a) => {
    const f = k.value;
    if (!f)
      return { status: "noop" };
    const b = Io(f, a);
    return k.value = b, S({ type: "placement-update", session: b }), {
      status: b.blocked ? "blocked" : "updated",
      session: b,
      blocked: b.blocked ? {
        reason: b.blocked.reason,
        itemIds: b.blocked.itemIds,
        message: b.blocked.message
      } : void 0,
      diagnostics: ze(b)
    };
  }, ci = (a = "cancelled") => {
    const f = k.value;
    if (!f) return { status: "noop" };
    const b = ln(f, a);
    return Je(a), b;
  }, di = (a) => {
    var b;
    const f = (b = a.blocked) == null ? void 0 : b.reason;
    return a.status === "blocked" && (f === "bounds" || f === "collision" || f === "maxRows" || f === "section-row-policy" || f === "invalid-input");
  }, li = async (a = {}) => {
    var g, $, G, j, he, O, V, ee, ye;
    const f = k.value;
    if (!f)
      return Ie({
        id: `placement-commit:noop:${Date.now()}`,
        type: "add"
      }, "noop");
    if (!f.candidateLayout || f.blocked) {
      const F = Ie({
        id: `placement-commit:blocked:${f.id}`,
        type: f.commandType
      }, "blocked", {
        targetIds: f.items.map((oe) => oe.i),
        blocked: {
          reason: ((g = f.blocked) == null ? void 0 : g.reason) || "invalid-input",
          itemIds: (($ = f.blocked) == null ? void 0 : $.itemIds) || f.items.map((oe) => oe.i),
          message: ((G = f.blocked) == null ? void 0 : G.message) || "Placement does not have a valid candidate."
        },
        diagnostics: ze(f)
      });
      return z.value = F, F;
    }
    if (A !== f.baseRevision) {
      const F = ze(f) || { durationMs: 0 }, oe = Ie({
        id: `placement-commit:stale:${f.id}`,
        type: f.commandType
      }, "blocked", {
        targetIds: f.items.map((ge) => ge.i),
        blocked: {
          reason: "stale-command",
          itemIds: f.items.map((ge) => ge.i),
          message: "Placement base layout changed before commit."
        },
        diagnostics: {
          ...F,
          durationMs: F.durationMs || 0,
          stale: !0,
          stateRevision: A
        }
      });
      return z.value = oe, Je("stale-command"), oe;
    }
    const b = {
      ...f,
      phase: "committing",
      ghostItems: f.ghostItems.map((F) => ({ ...F, state: "committing" }))
    };
    k.value = b;
    const v = dn(b, a), w = await dt(v);
    if (S({ type: "placement-commit", sessionId: b.id, result: w }), w.status === "changed" || w.status === "noop" || (a == null ? void 0 : a.autoCancelOnBlocked) === !0 || !di(w))
      Je(w.status);
    else {
      const F = Io(f, {});
      k.value = {
        ...F,
        blocked: {
          reason: ((j = w.blocked) == null ? void 0 : j.reason) || ((he = F.blocked) == null ? void 0 : he.reason) || "invalid-input",
          itemIds: ((O = w.blocked) == null ? void 0 : O.itemIds) || ((V = F.blocked) == null ? void 0 : V.itemIds),
          message: ((ee = w.blocked) == null ? void 0 : ee.message) || ((ye = F.blocked) == null ? void 0 : ye.message),
          recoverable: !0
        },
        phase: "blocked"
      };
    }
    return w;
  }, Ao = (a) => Ot(a, "ignore"), To = (a) => {
    var f;
    if (U) {
      if (a.mode === "clear") {
        U.clear(ae());
        return;
      }
      if (a.mode === "replace") {
        U.replacePresent(ae(), {
          preserveRedoStack: a.preserveRedoStack
        });
        return;
      }
      U.replacePresent(ae(), {
        preserveRedoStack: (f = a.preserveRedoStack) != null ? f : !0
      });
    }
  }, ui = (a, f = "external", b = {}) => {
    const v = Ao(b.history);
    It.abortPending(b.origin || f), K.value = null, _(a), A += 1, l.value = lt(l.value, a), tt(qe(h.value, a, l.value, "external")), To(v), S({
      type: "editor-state-change",
      state: Be.value,
      reason: b.origin || f
    });
  }, fi = (a, f, b = "external", v = {}) => {
    const w = Ao(v.history);
    It.abortPending(v.origin || b), K.value = null, le(a, f);
    const g = a[f] || [];
    A += 1, l.value = lt(l.value, g), tt(qe(h.value, g, l.value, "external")), To(w), S({
      type: "editor-state-change",
      state: Be.value,
      reason: v.origin || b
    });
  };
  u && S({
    type: "editor-error",
    code: "editor-mode-missing",
    message: "Grid editor was enabled without mode or defaultMode; falling back to view."
  });
  let Oo = B();
  P.push(ut(c, (a, f) => {
    a !== f && (a === "view" && K.value ? (K.value = null, _(Oo)) : Oo = B(), a === "view" && (M.value = { ...uo }, Je("mode-readonly")), S({ type: "mode-change", from: f, to: a, source: "external" }));
  })), P.push(ut(() => Be.value, (a, f) => {
    a !== f && S({
      type: "editor-state-change",
      state: a,
      previous: f,
      reason: "derived-state"
    });
  })), e.selectedIds && P.push(ut(e.selectedIds, (a) => {
    It.abortPending("external-selection"), A += 1, h.value = qe(
      Re(a, "external"),
      B(),
      l.value,
      "external"
    ), D.value = h.value.activeId, U == null || U.replacePresent(ae(), { preserveRedoStack: !0 });
  }, { flush: "sync" })), P.push(ut(l, (a) => {
    const f = xe(a, { layout: B() });
    Ne(f, a) || (l.value = f);
  }, { deep: !0 })), P.push(ut(m, (a) => {
    const f = De(a, B()), b = {
      version: 1,
      items: f.items,
      itemMembership: f.itemMembership
    };
    Ne(b, a) || (m.value = b);
    const v = h.value.selectedIds.filter((w) => {
      const g = f.itemMembership[w], $ = g != null && g.sectionId ? f.items[g.sectionId] : void 0, G = g != null && g.rowId ? f.items[g.rowId] : void 0;
      return ($ == null ? void 0 : $.collapsed) || (G == null ? void 0 : G.collapsed);
    });
    v.length > 0 && tt(Re(
      h.value.selectedIds.filter((w) => !v.includes(w)),
      "api"
    ));
  }, { deep: !0 }));
  const Do = {
    mode: c,
    state: Be,
    selection: h,
    editorMetaById: l,
    sectionRows: m,
    placementSession: k,
    dirty: Q,
    conflict: C,
    guides: M,
    lastResult: z,
    execute: dt,
    canExecute: ri,
    beginPlacement: ni,
    updatePlacement: ai,
    commitPlacement: li,
    cancelPlacement: ci,
    getToolbarState: () => pn(Do),
    undo: () => dt({ type: "undo", source: "api" }),
    redo: () => dt({ type: "redo", source: "api" }),
    save: () => dt({ type: "save", source: "api" }),
    discard: () => dt({ type: "discard", source: "api" }),
    reset: () => dt({ type: "reset", source: "api" }),
    setExternalLayout: ui,
    setExternalLayouts: fi,
    stop() {
      x.value || (x.value = !0, It.abortPending("editor-stop"), Je("editor-stop"), P.forEach((a) => a()), _e == null || _e.stop());
    }
  };
  return Do;
}, Vn = Qs, xn = (e) => !!(e && typeof e == "object" && "getBoundingClientRect" in e), wn = (e, t) => {
  const o = xn(e.currentTarget) ? e.currentTarget.getBoundingClientRect() : { left: 0, top: 0 }, s = t.transformScale || 1, r = (e.clientX - o.left) / s, n = (e.clientY - o.top) / s, i = t.itemSize || { w: 1, h: 1 }, u = {
    cols: t.cols,
    margin: t.margin,
    maxRows: t.maxRows,
    rowHeight: t.rowHeight,
    containerWidth: t.width || 0,
    containerPadding: t.containerPadding || t.margin
  }, d = Ci(u, n, r, i.w, i.h);
  return {
    x: d.x,
    y: d.y,
    source: "pointer",
    clientX: e.clientX,
    clientY: e.clientY
  };
};
function kn({
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
      const c = t(), y = wn(d, {
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
const Mn = (e) => ({
  x: e.x,
  y: e.y,
  w: e.w,
  h: e.h
}), Sn = () => ({
  activeId: null,
  guides: [],
  displayGuides: [],
  debugGuides: [],
  snappedGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: []
}), ei = (e) => !!(e && typeof e == "object" && "save" in e && "commit" in e && "load" in e), Es = (e) => !!(e && typeof e == "object" && !ei(e)), Cn = (e) => typeof e == "function" ? { ...e() || {} } : { ...e || {} }, En = (e, t, o) => ({
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
function Pn({
  props: e,
  layoutRef: t,
  persistenceController: o,
  engineBridge: s,
  getLayout: r,
  getOldDragItem: n,
  getOldResizeItem: i,
  isDropping: u,
  getInteractionState: d
}) {
  const c = e.editor && typeof e.editor == "object" ? e.editor : null, y = (c == null ? void 0 : c.layoutOperationRunner) || ((I) => {
    const E = `${I.commandId}:layout`;
    return s.isLegacyLayoutEngine() ? En(E, I.layout, I.operation) : Rs({
      id: E,
      phase: I.phase,
      layout: I.layout,
      operation: I.operation,
      options: s.getLayoutEngineOptions()
    });
  }), l = o || e.persistence || (c == null ? void 0 : c.persistence);
  let p = null;
  const m = c && ei(l) ? l : c && Es(l) ? Si({
    ...l,
    kind: "layout",
    target: t,
    watchTarget: !1,
    meta: () => ({
      ...Cn(l.meta),
      editor: Qt(
        (p == null ? void 0 : p.editorMetaById.value) || {},
        p == null ? void 0 : p.sectionRows.value
      )
    }),
    onEvent: (I) => {
      var E;
      if (I.type === "load-success" || I.type === "external-apply") {
        const Z = Zt(I.document);
        Z.ok && Z.envelope && p && (p.editorMetaById.value = Z.envelope.editorMetaById, Z.envelope.sectionRows && (p.sectionRows.value = Z.envelope.sectionRows)), p == null || p.setExternalLayout(I.value, I.type);
      }
      (E = l.onEvent) == null || E.call(l, I);
    }
  }) : null, h = !!(c && m && Es(l));
  p = c ? c.controller || Qs({
    ...c,
    kind: "layout",
    layout: t,
    layoutOperationRunner: y,
    persistence: m || c.persistence
  }) : null;
  let C = null, M = null;
  const k = kn({
    controller: p,
    getGeometry: () => ({
      width: e.width || 0,
      cols: e.cols,
      margin: e.margin,
      maxRows: e.maxRows,
      rowHeight: e.rowHeight,
      containerPadding: e.containerPadding || e.margin,
      transformScale: e.transformScale || 1,
      compactType: Wo(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision
    }),
    stopEvent: (I) => {
      I.preventDefault(), I.stopPropagation();
    }
  }), z = () => !!p, K = () => !!(p && p.mode.value === "view"), T = () => !!(p && p.mode.value === "edit"), te = () => (p == null ? void 0 : p.editorMetaById.value) || {}, D = () => !!(p && (c == null ? void 0 : c.guides) !== !1), x = () => {
    M = null;
  }, P = () => {
    p && (x(), p.guides.value = Sn());
  }, A = (I) => {
    const E = d();
    return (E == null ? void 0 : E.activeResizeId) === I ? "resize" : u() ? "drop" : (E == null ? void 0 : E.activeDragId) === I ? "drag" : "api";
  }, R = (I) => {
    const E = d(), Z = (E == null ? void 0 : E.activeResizeId) === I ? i() : (E == null ? void 0 : E.activeDragId) === I ? n() : null;
    return Z ? { [I]: Mn(Z) } : void 0;
  }, L = (I, E, Z) => {
    var Te;
    const re = d(), me = I === "drag" && (re != null && re.dragBlocked) ? {
      reason: re.dragBlockedReason || "collision",
      itemIds: (Te = re.dragBlockedItemIds) != null && Te.length ? re.dragBlockedItemIds : E ? [E] : void 0,
      message: re.dragBlockedMessage || void 0
    } : I === "resize" && (re != null && re.resizeBlocked) ? { reason: "collision", itemIds: E ? [E] : void 0 } : void 0;
    return {
      ...c != null && c.guides && typeof c.guides == "object" ? c.guides : {},
      interaction: I,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      startGeometry: E ? R(E) : void 0,
      resizeHandle: Z,
      selectionCount: (p == null ? void 0 : p.selection.value.selectedIds.length) || 0,
      blocked: me
    };
  }, S = (I, E, Z, re) => {
    var we, Ce;
    if (!p || !c || c.guides === !1) return null;
    const me = A(I), Te = L(me, I, re), Ke = ko({
      layout: r(),
      activeItem: E,
      candidateItem: Z,
      selectionIds: p.selection.value.selectedIds,
      metaById: te(),
      sectionRows: p.sectionRows.value,
      cols: e.cols,
      maxRows: e.maxRows,
      margin: e.margin,
      rowHeight: e.rowHeight,
      compactType: Wo(e),
      allowOverlap: e.allowOverlap,
      preventCollision: e.preventCollision,
      interaction: me,
      startGeometry: Te.startGeometry,
      options: Te
    });
    return p.guides.value = Ke.guideState, (we = c.onEvent) == null || we.call(c, {
      type: "guide-change",
      guides: p.guides.value.guides,
      activeId: I
    }), (Ce = c.onEvent) == null || Ce.call(c, {
      type: "intelligence-change",
      activeId: I,
      diagnostics: Ke.diagnostics
    }), { intelligence: Ke, options: Te };
  }, B = (I, E, Z, re, me) => {
    var Ce;
    const Te = S(I, E, Z, me);
    if (!Te) return Z;
    const Ke = M == null ? void 0 : M.nextGuideId, we = wr(Te.intelligence, Z, {
      snap: Te.options.snap,
      layout: re || r(),
      cols: e.cols,
      maxRows: e.maxRows,
      allowOverlap: e.allowOverlap,
      metaById: te(),
      previousGuideId: Ke
    });
    return (we.status === "snapped" || Ke !== we.nextGuideId) && ((Ce = c == null ? void 0 : c.onEvent) == null || Ce.call(c, {
      type: "snap-change",
      activeId: I,
      previousGuideId: Ke,
      nextGuideId: we.nextGuideId,
      snapKind: we.snapKind,
      geometry: we.geometry
    })), M = we, we.status !== "snapped" ? Z : {
      ...Z,
      ...we.geometry
    };
  }, _ = (I, E) => E != null && E.locked ? "locked" : (E == null ? void 0 : E.visible) === !1 ? "hidden" : I.static ? "static-item" : "capability", H = (I) => {
    if (!p) return { kind: "single", id: I.id };
    if (!T())
      return {
        kind: "blocked",
        reason: "mode-readonly",
        ids: [I.id],
        activeId: I.id
      };
    const E = te();
    if (!_t(
      I.item,
      E[I.id],
      { isDraggable: !0, isResizable: !0, isBounded: !0 }
    ).draggable)
      return {
        kind: "blocked",
        reason: _(I.item, E[I.id]),
        ids: [I.id],
        activeId: I.id
      };
    const me = p.selection.value.selectedIds.filter(Boolean), Te = typeof MouseEvent != "undefined" && I.event instanceof MouseEvent && (I.event.metaKey || I.event.ctrlKey || I.event.shiftKey);
    if (!(me.length > 1 && me.includes(I.id)))
      return !me.includes(I.id) && !Te && p.execute({
        type: "select",
        targetIds: [I.id],
        payload: { id: I.id },
        source: "pointer",
        history: { skip: !0 }
      }), { kind: "single", id: I.id };
    const we = [], Ce = [];
    let Ve = "capability";
    return me.forEach((ze) => {
      const Le = Ae(I.layout, ze);
      if (!Le) {
        Ce.push(ze), Ve = "missing-item";
        return;
      }
      _t(
        Le,
        E[ze],
        { isDraggable: !0, isResizable: !0, isBounded: !0 }
      ).draggable ? we.push(ze) : (Ce.push(ze), Ve = _(Le, E[ze]));
    }), Ce.length > 0 && (c == null ? void 0 : c.commandPolicy) !== "skip-blocked" ? {
      kind: "blocked",
      reason: Ve,
      ids: Ce,
      activeId: I.id
    } : I.legacyLayoutEngine ? {
      kind: "blocked",
      reason: "unsupported",
      ids: we,
      activeId: I.id
    } : we.length === 0 ? {
      kind: "blocked",
      reason: Ve,
      ids: Ce.length > 0 ? Ce : [I.id],
      activeId: I.id
    } : {
      kind: "group",
      activeId: I.id,
      ids: we
    };
  }, le = (I) => {
    var re;
    if (!p) return;
    const E = {
      id: `pointer-move-blocked:${I.activeId || I.ids[0] || "layout"}:${Date.now()}`,
      type: "move",
      targetIds: I.ids,
      source: "pointer"
    }, Z = Ie(E, "blocked", {
      targetIds: I.ids,
      blocked: {
        reason: I.reason,
        itemIds: I.ids,
        message: I.message || `Pointer move blocked by ${I.reason}.`
      },
      diagnostics: I.operationResult ? {
        durationMs: 0,
        layoutDiagnostics: I.operationResult.diagnostics,
        operationResult: I.operationResult
      } : void 0
    });
    p.lastResult.value = Z, (re = c == null ? void 0 : c.onEvent) == null || re.call(c, { type: "command-blocked", command: E, result: Z });
  }, ae = (I) => {
    t.value = ie(I);
  }, Me = (I) => {
    (I == null ? void 0 : I.status) === "changed" && (m == null || m.commit(t.value, { source: "component" }));
  }, J = async (I) => {
    if (!p) return null;
    ae(I.beforeLayout);
    const E = await p.execute({
      type: "move",
      targetIds: I.ids,
      source: I.source || "pointer",
      payload: {
        activeId: I.activeId,
        candidateLayout: I.afterLayout,
        cols: e.cols,
        maxRows: e.maxRows,
        compactType: e.compactType,
        allowOverlap: e.allowOverlap,
        preventCollision: e.preventCollision
      }
    });
    return Me(E), E;
  }, U = async (I) => {
    if (!p) return null;
    ae(I.beforeLayout);
    const E = await p.execute({
      type: "resize",
      targetIds: [I.id],
      source: "pointer",
      payload: {
        handle: I.handle,
        candidateLayout: I.afterLayout,
        cols: e.cols,
        maxRows: e.maxRows,
        compactType: e.compactType,
        allowOverlap: e.allowOverlap,
        preventCollision: e.preventCollision
      }
    });
    return Me(E), E;
  }, Q = async (I) => {
    if (!p) return null;
    ae(I.beforeLayout);
    const E = await p.execute({
      type: "add",
      targetIds: [I.id],
      source: "drop",
      payload: {
        item: I.item,
        candidateLayout: I.afterLayout,
        cols: e.cols,
        maxRows: e.maxRows,
        compactType: e.compactType,
        allowOverlap: e.allowOverlap,
        preventCollision: e.preventCollision
      }
    });
    return Me(E), E;
  }, Be = (I) => {
    ae(I), P();
  }, _e = (I, E) => {
    !p || !T() || p.execute({
      type: "select",
      targetIds: [I],
      payload: {
        id: I,
        toggle: E.metaKey || E.ctrlKey,
        range: E.shiftKey
      },
      source: "pointer"
    });
  }, Ue = (I) => {
    const E = p == null ? void 0 : p.placementSession.value;
    if (!E || E.collisionPolicy !== "layout" || E.blocked || !E.candidateLayout || E.phase === "starting" || E.ghostItems.some((re) => re.id === I.i)) return null;
    const Z = Ae(E.candidateLayout, I.i);
    return !Z || Z.x === I.x && Z.y === I.y && Z.w === I.w && Z.h === I.h ? null : Z;
  }, tt = (I, E, Z) => {
    const re = te()[I.i], me = p ? _t(I, re, E) : null, Te = !(p && (re == null ? void 0 : re.visible) === !1 && !Z), Ke = K() || !!(p && !(me != null && me.editable)), we = p ? T() && !!(me != null && me.draggable) : typeof I.isDraggable == "boolean" ? I.isDraggable : !I.static && E.isDraggable, Ce = p ? T() && !!(me != null && me.resizable) : typeof I.isResizable == "boolean" ? I.isResizable : !I.static && E.isResizable, Ve = we && E.isBounded && I.isBounded !== !1, ze = (p == null ? void 0 : p.selection.value.selectedIds.includes(I.i)) || !1, Le = (p == null ? void 0 : p.selection.value.activeId) === I.i, Et = Ue(I), Je = p ? rt({
      "editor-selected": ze,
      "editor-active": Le,
      "editor-locked": me == null ? void 0 : me.locked,
      "editor-hidden": (re == null ? void 0 : re.visible) === !1,
      "editor-readonly": Ke,
      "editor-keyboard-editing": p.state.value === "keyboardEditing",
      "editor-drop-target": Z,
      "editor-placement-reflowed": !!Et
    }) : void 0;
    return {
      visible: Te,
      draggable: we,
      resizable: Ce,
      bounded: Ve,
      className: Je,
      previewItem: Et,
      onClick: p ? (so) => _e(I.i, so) : void 0
    };
  }, He = (I) => {
    k.onClick(I) || I.target === I.currentTarget && p && T() && p.execute({ type: "clearSelection", source: "pointer" });
  }, ht = (I) => {
    k.onPointerMove(I);
  }, vt = () => {
    p && (c == null ? void 0 : c.keyboard) !== !1 && (C = Di(
      p,
      typeof (c == null ? void 0 : c.keyboard) == "object" ? c.keyboard : {}
    )), h && (m == null || m.load().then((I) => {
      I.value && I.fallbackApplied && (p == null || p.setExternalLayout(I.value, "persistence-fallback"));
    }));
  }, bt = () => {
    C == null || C(), C = null, k.cancel("runtime-stop"), c != null && c.controller ? h && (m == null || m.stop()) : p == null || p.stop();
  };
  return {
    config: c,
    controller: p,
    isEnabled: z,
    isViewMode: K,
    isEditMode: T,
    guidesEnabled: D,
    getMetaById: te,
    clearGuides: P,
    resetSnap: x,
    snapCandidate: B,
    updateIntelligence: S,
    resolveMoveDrag: H,
    notifyMoveBlocked: le,
    commitMove: J,
    commitResize: U,
    commitDrop: Q,
    rollbackInteraction: Be,
    getItemRenderState: tt,
    isPlacementActive: k.isActive,
    onRootPointerMove: ht,
    onRootClick: He,
    mount: vt,
    stop: bt
  };
}
function Rn({
  width: e,
  margin: t,
  containerPadding: o,
  rowHeight: s,
  renderPrecision: r = "integer",
  cols: n,
  maxRows: i
}) {
  const u = o, d = Ei({
    cols: n,
    containerPadding: u,
    containerWidth: e,
    margin: t
  }), c = (R) => Pi(R, r), y = (R) => c(u[0] + R * (d + t[0])), l = (R) => c(u[1] + R * (s + t[1])), p = (R) => c(u[0] + R * (d + t[0]) - t[0] / 2), m = (R) => c(u[1] + R * (s + t[1]) - t[1] / 2), h = (R) => c(y(R) - t[0]), C = (R) => c(l(R) - t[1]);
  return {
    padding: u,
    colWidth: d,
    gridLineXPx: y,
    gridLineYPx: l,
    guideXPx: (R) => R.kind === "right" ? h(R.position) : R.kind === "center-x" ? p(R.position) : y(R.position),
    guideYPx: (R) => R.kind === "bottom" ? C(R.position) : R.kind === "center-y" ? m(R.position) : l(R.position),
    spanXPx: (R, L) => ({
      start: y(R),
      end: h(L)
    }),
    spanYPx: (R, L) => ({
      start: l(R),
      end: C(L)
    }),
    spacingXPx: (R, L) => ({
      start: h(R),
      end: y(L)
    }),
    spacingYPx: (R, L) => ({
      start: C(R),
      end: l(L)
    }),
    itemLeftPx: (R) => c(u[0] + R * (d + t[0])),
    itemTopPx: (R) => c(u[1] + R * (s + t[1])),
    itemWidthPx: (R) => c(Math.max(0, R * d + Math.max(0, R - 1) * t[0])),
    itemHeightPx: (R) => c(Math.max(0, R * s + Math.max(0, R - 1) * t[1]))
  };
}
function Bn({
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
    guideYPx: u,
    spanXPx: d,
    spanYPx: c,
    spacingXPx: y,
    spacingYPx: l,
    itemLeftPx: p,
    itemTopPx: m,
    itemWidthPx: h,
    itemHeightPx: C
  } = t, M = () => {
    var L;
    if (!o) return [];
    const x = o.displayGuides || o.guides, P = (S) => {
      const B = S.display;
      if ((B == null ? void 0 : B.kind) === "spacing" && S.kind === "spacing-x") {
        const H = y(B.start, B.end);
        return {
          left: `${H.start}px`,
          top: `${u(S)}px`,
          width: `${Math.max(1, H.end - H.start)}px`
        };
      }
      if ((B == null ? void 0 : B.kind) === "spacing" && S.kind === "spacing-y") {
        const H = l(B.start, B.end);
        return {
          left: `${i(S)}px`,
          top: `${H.start}px`,
          height: `${Math.max(1, H.end - H.start)}px`
        };
      }
      if (S.axis === "x") {
        const H = B ? c(B.start, B.end) : null;
        return B ? {
          left: `${i(S)}px`,
          top: `${(H == null ? void 0 : H.start) || 0}px`,
          height: `${Math.max(1, ((H == null ? void 0 : H.end) || 0) - ((H == null ? void 0 : H.start) || 0))}px`
        } : {
          left: `${i(S)}px`,
          top: 0,
          bottom: 0
        };
      }
      const _ = B ? d(B.start, B.end) : null;
      return B ? {
        top: `${u(S)}px`,
        left: `${(_ == null ? void 0 : _.start) || 0}px`,
        width: `${Math.max(1, ((_ == null ? void 0 : _.end) || 0) - ((_ == null ? void 0 : _.start) || 0))}px`
      } : {
        top: `${u(S)}px`,
        left: 0,
        right: 0
      };
    }, A = (S, B = !1) => {
      var J, U;
      const _ = o.snappedGuideIds.includes(S.id) || S.isSnapped === !0, H = S.kind === "spacing-x" || S.kind === "spacing-y", le = typeof S.proximity == "number" ? S.proximity : _ ? 1 : 0.4, ae = _ ? 1 : Math.max(0.18, 0.18 + le * 0.62), Me = {
        ...P(S)
      };
      return !B && !_ && (Me.opacity = String(Math.round(ae * 100) / 100)), Oe("div", {
        key: `${B ? "debug-" : ""}${S.id}`,
        class: rt(B ? "vue-grid-editor-debug-guide" : "vue-grid-editor-guide", `vue-grid-editor-guide-${S.axis}`, {
          "vue-grid-editor-guide-active": _,
          "vue-grid-editor-guide-snapped": _,
          "vue-grid-editor-guide-predict": !_ && !B,
          "vue-grid-editor-spacing-guide": H,
          "vue-grid-editor-alignment-guide": !H,
          "vue-grid-editor-guide-with-label": (J = S.display) == null ? void 0 : J.showLabel
        }),
        style: Me,
        "data-guide-id": S.id,
        "data-guide-kind": S.kind,
        "data-guide-role": H ? "spacing" : "alignment",
        "data-guide-state": _ ? "snapped" : "predict",
        "data-guide-proximity": String(Math.round(le * 100) / 100),
        "data-guide-debug": B ? "true" : void 0,
        "data-guide-source-ids": S.sourceIds.join(",")
      }, (U = S.display) != null && U.showLabel && S.display.label ? [Oe("span", {
        class: "vue-grid-editor-guide-label"
      }, S.display.label)] : void 0);
    }, R = x.map((S) => A(S));
    return o.debug && o.debugMode === "layer" && ((L = o.debugGuides) != null && L.length) ? R.push(Oe("div", {
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
      const A = P.axis === "x", R = A ? y(P.span.start, P.span.end) : l(P.span.start, P.span.end), L = R.start, S = R.end, B = Math.max(1, S - L), _ = A ? u({
        kind: "center-y",
        axis: "y",
        position: P.position
      }) : i({
        kind: "center-x",
        axis: "x",
        position: P.position
      }), H = A ? {
        left: `${L}px`,
        top: `${_}px`,
        width: `${B}px`
      } : {
        top: `${L}px`,
        left: `${_}px`,
        height: `${B}px`
      }, le = `${P.distance} ${P.unit}${P.distance === 1 ? "" : "s"}`;
      return Oe("div", {
        key: P.id,
        class: rt("vue-grid-editor-spacing-chip", `vue-grid-editor-spacing-chip-${P.side}`, `vue-grid-editor-spacing-chip-${P.axis}`, {
          "vue-grid-editor-spacing-chip-equal": P.isEqual
        }),
        style: H,
        "data-chip-id": P.id,
        "data-chip-side": P.side,
        "data-chip-equal": P.isEqual ? "true" : "false",
        "data-chip-neighbor": P.neighborId || "edge"
      }, [Oe("span", {
        class: "vue-grid-editor-spacing-chip-label"
      }, le)]);
    });
  }, z = () => {
    var B, _, H, le;
    if (!o) return null;
    const x = o.measurementHud;
    if (!x) return null;
    const P = p(x.position.x) + h(x.size.w), A = m(x.position.y), R = `${x.size.w}×${x.size.h} · col ${x.position.x}, row ${x.position.y}`, L = [];
    (B = x.delta) != null && B.dw && L.push(`${x.delta.dw > 0 ? "+" : ""}${x.delta.dw} col${Math.abs(x.delta.dw) === 1 ? "" : "s"}`), (_ = x.delta) != null && _.dh && L.push(`${x.delta.dh > 0 ? "+" : ""}${x.delta.dh} row${Math.abs(x.delta.dh) === 1 ? "" : "s"}`), (H = x.delta) != null && H.dx && L.push(`x ${x.delta.dx > 0 ? "+" : ""}${x.delta.dx}`), (le = x.delta) != null && le.dy && L.push(`y ${x.delta.dy > 0 ? "+" : ""}${x.delta.dy}`);
    const S = [Oe("span", {
      class: "vue-grid-editor-measurement-hud-label"
    }, x.label || x.itemId), Oe("span", {
      class: "vue-grid-editor-measurement-hud-dims"
    }, R)];
    return L.length > 0 && S.push(Oe("span", {
      class: "vue-grid-editor-measurement-hud-delta"
    }, `Δ ${L.join(" · ")}`)), x.blocked && S.push(Oe("span", {
      class: "vue-grid-editor-measurement-hud-blocked"
    }, x.blockedMessage || x.blocked)), Oe("div", {
      key: `hud:${x.itemId}`,
      class: rt("vue-grid-editor-measurement-hud", `vue-grid-editor-measurement-hud-${x.interaction}`, {
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
  }, K = () => {
    if (!o) return [];
    const x = o.anchorEdges || [];
    if (x.length === 0) return [];
    const P = [];
    return x.forEach((A) => {
      const R = r.get(A.itemId) || n.find((H) => H.i === A.itemId);
      if (!R) return;
      const L = p(R.x), S = m(R.y), B = h(R.w), _ = C(R.h);
      A.sides.forEach((H) => {
        const le = {
          position: "absolute"
        };
        H === "left" ? Object.assign(le, {
          left: `${L}px`,
          top: `${S}px`,
          height: `${_}px`,
          width: "2px"
        }) : H === "right" ? Object.assign(le, {
          left: `${L + B - 2}px`,
          top: `${S}px`,
          height: `${_}px`,
          width: "2px"
        }) : H === "top" ? Object.assign(le, {
          left: `${L}px`,
          top: `${S}px`,
          width: `${B}px`,
          height: "2px"
        }) : H === "bottom" ? Object.assign(le, {
          left: `${L}px`,
          top: `${S + _ - 2}px`,
          width: `${B}px`,
          height: "2px"
        }) : H === "center-x" ? Object.assign(le, {
          left: `${L + B / 2 - 1}px`,
          top: `${S}px`,
          height: `${_}px`,
          width: "2px"
        }) : H === "center-y" && Object.assign(le, {
          left: `${L}px`,
          top: `${S + _ / 2 - 1}px`,
          width: `${B}px`,
          height: "2px"
        }), P.push(Oe("div", {
          key: `anchor:${A.role}:${A.itemId}:${H}`,
          class: rt("vue-grid-editor-anchor-edge", `vue-grid-editor-anchor-edge-${H}`, `vue-grid-editor-anchor-edge-${A.role}`),
          style: le,
          "data-anchor-item-id": A.itemId,
          "data-anchor-side": H,
          "data-anchor-role": A.role
        }));
      });
    }), P;
  }, T = () => s ? s.ghostItems.map((x) => {
    const P = x.item, A = x.state === "blocked" || s.phase === "blocked";
    return Oe("div", {
      key: `placement-ghost:${s.id}:${x.id}`,
      class: rt("vue-grid-editor-placement-ghost", `vue-grid-editor-placement-ghost-${x.state}`, {
        "vue-grid-editor-placement-ghost-blocked": A,
        "vue-grid-editor-placement-ghost-committing": x.state === "committing"
      }),
      style: {
        left: `${p(P.x)}px`,
        top: `${m(P.y)}px`,
        width: `${h(P.w)}px`,
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
  }) : [], te = () => s ? s.affectedOutlines.map((x) => {
    const P = x.after;
    return Oe("div", {
      key: `placement-affected:${s.id}:${x.id}:${x.kind}`,
      class: rt("vue-grid-editor-placement-affected", `vue-grid-editor-placement-affected-${x.kind}`),
      style: {
        left: `${p(P.x)}px`,
        top: `${m(P.y)}px`,
        width: `${h(P.w)}px`,
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
    const P = x ? p(x.x) + h(x.w) : 0, A = x ? m(x.y) : 0, R = s.blocked, L = R ? R.message || `Placement blocked by ${R.reason}.` : `${s.ghostItems.length} item${s.ghostItems.length === 1 ? "" : "s"}`;
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
    }, L);
  };
  return [...te(), ...T(), D(), ...K(), ...M(), ...k(), z()].filter(Boolean);
}
const $n = (e) => {
  const t = e.props, o = Pn({
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
      return Bn({
        enabled: o.guidesEnabled() || o.isPlacementActive(),
        geometry: Rn(s.geometry),
        guideState: (r = o.controller) == null ? void 0 : r.guides.value,
        placementSession: (n = o.controller) == null ? void 0 : n.placementSession.value,
        itemMap: s.itemMap,
        layout: s.layout
      });
    }
  };
}, Gn = {
  ...pi,
  editor: {
    type: [Boolean, Object],
    default: !1
  },
  persistence: {
    type: [Boolean, Object],
    default: !1
  }
}, Zn = yi({
  name: "EditorGridLayout",
  props: Gn,
  createRuntimeExtension: $n
});
export {
  Vn as $,
  Gs as A,
  Ji as B,
  zs as C,
  _n as D,
  Zn as E,
  Oi as F,
  nt as G,
  Mr as H,
  ps as I,
  yt as J,
  ss as K,
  lo as L,
  qn as M,
  De as N,
  kr as O,
  Gr as P,
  mt as Q,
  Zt as R,
  Vt as S,
  wr as T,
  qe as U,
  Er as V,
  Bs as W,
  Xn as X,
  Ar as Y,
  Io as Z,
  ys as _,
  vs as a,
  bs as b,
  Is as c,
  Di as d,
  Un as e,
  dn as f,
  Ds as g,
  ln as h,
  mo as i,
  pr as j,
  ir as k,
  Kn as l,
  ko as m,
  Tr as n,
  Dr as o,
  Qs as p,
  Br as q,
  $r as r,
  zr as s,
  Qt as t,
  Wn as u,
  cn as v,
  Re as w,
  Ms as x,
  pn as y,
  Yn as z
};
