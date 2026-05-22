import { r as ci } from "./resolve-C3SqJijI.mjs";
import { F as Ce } from "./commands-Q0wgqPfi.mjs";
import { j as ui, m as fi, r as gi, t as mi } from "./migration-CPonYzEY.mjs";
const oe = 1, se = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), hi = ["s", "w", "e", "n", "sw", "nw", "se", "ne"], pi = [
  "desktopHide",
  "mobileHide",
  "mobileHeight",
  "mobileOrder"
], yi = [
  "preserveAspectRatio",
  "aspectRatio"
], bi = [
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "preserveAspectRatio",
  "aspectRatio"
], re = [
  "col",
  "row",
  "sizeX",
  "sizeY",
  "minSizeX",
  "minSizeY",
  "maxSizeX",
  "maxSizeY",
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "desktopHide",
  "mobileHide",
  "mobileHeight",
  "mobileOrder",
  "preserveAspectRatio",
  "aspectRatio"
], me = [
  "columns",
  "minColumns",
  "margin",
  "outerMargin",
  "containerPadding",
  "viewFormat",
  "rowHeight",
  "autoFillHeight",
  "heightMode",
  "mobileHeightMode",
  "minRowHeight",
  "renderPrecision",
  "mobileRowHeight",
  "mobileAutoFillHeight",
  "mobileDisplayLayoutFirst",
  "layoutDimension",
  "backgroundColor",
  "backgroundSizeMode",
  "backgroundImageUrl"
], wi = [
  "widgets",
  "gridSettings",
  "breakpoints"
], vi = [
  "widgetLayouts",
  "widgets",
  "gridSettings"
], Y = (e, i) => Object.prototype.hasOwnProperty.call(e, i), I = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const i = Object.getPrototypeOf(e);
  return i === Object.prototype || i === null;
}, Ii = (e) => I(e), ie = (e) => typeof e == "number" && Number.isFinite(e), ki = (e) => Number.isInteger(e) && e > 0, Q = (e) => typeof e == "string" && e.trim() !== "", $i = (e) => {
  const i = Date.parse(e);
  return Number.isFinite(i);
}, Si = (e) => typeof e == "string" && hi.indexOf(e) !== -1, Di = (e) => e === "auto" || e === "scroll" || e === "fit" || e === "fixed", Hi = (e) => e === "integer" || e === "subpixel", h = (e, i, t, r = {}) => ({
  code: e,
  level: i,
  message: t,
  ...r
}), M = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
}), ke = (e, i) => {
  const t = i.find((r) => r.level === "error");
  return M("validation", e, {
    path: t == null ? void 0 : t.path,
    details: i
  });
}, L = (e, i, t, r = []) => {
  const o = [], s = (l) => (o.push(h("non-json-extension", "error", l, { path: t })), i === "sanitize" ? (o[o.length - 1].level = "warning", { ok: !0, value: void 0, diagnostics: o }) : { ok: !1, diagnostics: o });
  if (e == null || typeof e == "string" || typeof e == "boolean")
    return { ok: !0, value: e, diagnostics: o };
  if (typeof e == "number")
    return Number.isFinite(e) ? { ok: !0, value: e, diagnostics: o } : s("Dashboard JSON fields must not contain non-finite numbers.");
  if (typeof e == "bigint" || typeof e == "function" || typeof e == "symbol")
    return s("Dashboard JSON fields must not contain runtime values.");
  if (Array.isArray(e)) {
    if (r.indexOf(e) !== -1) return s("Dashboard JSON fields must not contain circular references.");
    const l = [], d = r.concat(e);
    for (let f = 0; f < e.length; f++) {
      const g = L(e[f], i, `${t}[${f}]`, d);
      if (o.push(...g.diagnostics), !g.ok) return { ok: !1, diagnostics: o };
      l.push(typeof g.value == "undefined" ? null : g.value);
    }
    return { ok: !0, value: l, diagnostics: o };
  }
  if (!I(e))
    return s("Dashboard JSON fields must contain plain JSON objects only.");
  if (r.indexOf(e) !== -1) return s("Dashboard JSON fields must not contain circular references.");
  const n = {}, a = r.concat(e);
  for (const l of Object.keys(e)) {
    if (se.has(l)) {
      const f = h("unsafe-key", i === "sanitize" ? "warning" : "error", "Dashboard JSON fields contain a reserved key.", {
        path: `${t}.${l}`
      });
      if (o.push(f), i !== "sanitize") return { ok: !1, diagnostics: o };
      continue;
    }
    const d = L(e[l], i, t ? `${t}.${l}` : l, a);
    if (o.push(...d.diagnostics), !d.ok) return { ok: !1, diagnostics: o };
    typeof d.value != "undefined" && (n[l] = d.value);
  }
  return { ok: !0, value: n, diagnostics: o };
}, zi = (e, i, t) => {
  const r = L(e, i, t);
  if (!r.ok) return r;
  if (!Ii(r.value)) {
    const o = h("non-json-extension", i === "sanitize" ? "warning" : "error", "Dashboard field must be a JSON-safe object.", { path: t });
    return i === "sanitize" ? { ok: !0, value: {}, diagnostics: r.diagnostics.concat(o) } : { ok: !1, diagnostics: r.diagnostics.concat(o) };
  }
  return { ok: !0, value: r.value, diagnostics: r.diagnostics };
}, Dt = (e, i = {}) => {
  var r;
  const t = L(e, (r = i.validation) != null ? r : "strict", "value");
  if (!t.ok) throw ke("Dashboard JSON value could not be cloned.", t.diagnostics);
  return t.value;
}, ne = (e, i = "strict") => {
  const t = L(e, i, "document");
  if (!t.ok) throw ke("Dashboard document could not be cloned.", t.diagnostics);
  return t.value;
}, Mi = () => {
  const e = typeof globalThis != "undefined" ? globalThis.crypto : void 0;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `dashboard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}, Pi = () => `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, Ei = (e) => {
  if (typeof e != "string") return { ok: !0, value: e };
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch (i) {
    return {
      ok: !1,
      error: M("invalid-json", "Dashboard persistence payload is not valid JSON.", { cause: i })
    };
  }
}, E = (e, i, t) => {
  typeof t != "undefined" && (e[i] = t);
}, Z = (e, i, t, r, o, s = {}) => {
  const n = e[t];
  return typeof n == "undefined" ? s.required ? h("invalid-item-geometry", "error", `${r}.${t} is required.`, { path: `${r}.${t}` }) : null : ie(n) ? typeof s.min == "number" && n < s.min ? o === "sanitize" && typeof s.clampMin == "number" ? (i[t] = Math.max(s.clampMin, n), h("invalid-item-geometry", "warning", `Clamped ${r}.${t}.`, { path: `${r}.${t}` })) : h("invalid-item-geometry", "error", `${r}.${t} is outside the supported range.`, { path: `${r}.${t}` }) : (i[t] = n, null) : h("invalid-item-geometry", "error", `${r}.${t} must be a finite number.`, { path: `${r}.${t}` });
}, he = (e, i, t, r, o) => {
  const s = e[t];
  return typeof s == "undefined" ? null : !ie(s) || s <= 0 ? o === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${r}.${t}` })) : h("validation", "error", `${r}.${t} must be a finite positive number.`, { path: `${r}.${t}` }) : (i[t] = s, null);
}, Ye = (e, i, t, r, o) => typeof e[t] == "undefined" ? null : typeof e[t] != "boolean" ? o === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${r}.${t}` })) : h("validation", "error", `${r}.${t} must be a boolean.`, { path: `${r}.${t}` }) : (i[t] = e[t], null), pe = (e, i, t, r, o) => typeof e[t] == "undefined" ? null : typeof e[t] != "string" ? o === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${r}.${t}` })) : h("validation", "error", `${r}.${t} must be a string.`, { path: `${r}.${t}` }) : (i[t] = e[t], null), K = (e, i, t, r, o) => {
  if (typeof e[t] == "undefined") return [];
  const s = zi(e[t], o, `${r}.${t}`);
  return s.ok && (i[t] = s.value), s.diagnostics;
}, F = (e, i) => {
  i && e.push(i);
}, N = (e) => e.find((i) => i.level === "error"), Oi = (e, i, t, r) => {
  if (typeof e.resizeHandles == "undefined") return null;
  if (!Array.isArray(e.resizeHandles))
    return r === "sanitize" ? (delete i.resizeHandles, h("item-field-dropped", "warning", "Dropped invalid resizeHandles.", { path: `${t}.resizeHandles` })) : h("validation", "error", `${t}.resizeHandles must be an array.`, { path: `${t}.resizeHandles` });
  const o = e.resizeHandles.filter(Si);
  return o.length !== e.resizeHandles.length && r !== "sanitize" ? h("validation", "error", `${t}.resizeHandles contains an invalid handle.`, { path: `${t}.resizeHandles` }) : (o.length > 0 && (i.resizeHandles = o), o.length !== e.resizeHandles.length ? h("item-field-cleaned", "warning", "Removed invalid resize handle values.", { path: `${t}.resizeHandles` }) : null);
}, ye = (e, i, t, r) => {
  const o = L(e, t, i);
  if (!o.ok) return { ok: !1, diagnostics: o.diagnostics };
  if (!I(o.value))
    return {
      ok: !1,
      diagnostics: o.diagnostics.concat(h("validation", "error", `${i} must be an object.`, { path: i }))
    };
  const s = o.value, n = { ...s }, a = o.diagnostics.slice();
  F(a, Z(s, n, "col", i, t, { required: r, min: 0, clampMin: 0 })), F(a, Z(s, n, "row", i, t, { required: r, min: 0, clampMin: 0 })), F(a, Z(s, n, "sizeX", i, t, { required: r, min: 1, clampMin: 1 })), F(a, Z(s, n, "sizeY", i, t, { required: r, min: 1, clampMin: 1 }));
  for (const d of ["minSizeX", "minSizeY", "maxSizeX", "maxSizeY", "mobileHeight", "aspectRatio"])
    F(a, he(s, n, d, i, t));
  typeof s.mobileOrder != "undefined" && F(a, Z(s, n, "mobileOrder", i, t));
  for (const d of ["static", "draggable", "resizable", "bounded", "desktopHide", "mobileHide", "preserveAspectRatio"])
    F(a, Ye(s, n, d, i, t));
  return F(a, Oi(s, n, i, t)), a.push(...K(s, n, "extensions", i, t)), N(a) ? { ok: !1, diagnostics: a } : { ok: !0, item: n, diagnostics: a };
}, ze = (e, i, t) => {
  if (!Array.isArray(e) || e.length !== 2 || !ie(e[0]) || !ie(e[1])) {
    const r = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be a two-number tuple.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: [r] } : { ok: !1, diagnostics: [r] };
  }
  return { ok: !0, value: [e[0], e[1]], diagnostics: [] };
}, be = (e, i, t) => {
  if (typeof e == "undefined") return { ok: !0, settings: void 0, diagnostics: [] };
  const r = L(e, t, i);
  if (!r.ok) return { ok: !1, diagnostics: r.diagnostics };
  if (!I(r.value)) {
    const a = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be an object.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: r.diagnostics.concat(a) } : { ok: !1, diagnostics: r.diagnostics.concat(a) };
  }
  const o = r.value, s = { ...o }, n = r.diagnostics.slice();
  for (const a of ["columns", "minColumns", "rowHeight", "mobileRowHeight", "minRowHeight"])
    F(n, he(o, s, a, i, t));
  for (const a of ["outerMargin", "autoFillHeight", "mobileAutoFillHeight", "mobileDisplayLayoutFirst"])
    F(n, Ye(o, s, a, i, t));
  for (const a of ["backgroundColor", "backgroundSizeMode", "backgroundImageUrl"])
    F(n, pe(o, s, a, i, t));
  if (typeof o.margin != "undefined")
    if (ie(o.margin))
      s.margin = o.margin;
    else {
      const a = ze(o.margin, `${i}.margin`, t);
      if (n.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: n };
      a.value ? s.margin = a.value : delete s.margin;
    }
  if (typeof o.containerPadding != "undefined") {
    const a = ze(o.containerPadding, `${i}.containerPadding`, t);
    if (n.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: n };
    a.value ? s.containerPadding = a.value : delete s.containerPadding;
  }
  typeof o.viewFormat != "undefined" && o.viewFormat !== "grid" && o.viewFormat !== "list" && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid viewFormat.", { path: `${i}.viewFormat` })), delete s.viewFormat) : n.push(h("validation", "error", `${i}.viewFormat must be "grid" or "list".`, { path: `${i}.viewFormat` })));
  for (const a of ["heightMode", "mobileHeightMode"])
    typeof o[a] != "undefined" && !Di(o[a]) && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", `Dropped invalid ${a}.`, { path: `${i}.${a}` })), delete s[a]) : n.push(h("validation", "error", `${i}.${a} must be "auto", "scroll", "fit", or "fixed".`, { path: `${i}.${a}` })));
  if (typeof o.renderPrecision != "undefined" && !Hi(o.renderPrecision) && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid renderPrecision.", { path: `${i}.renderPrecision` })), delete s.renderPrecision) : n.push(h("validation", "error", `${i}.renderPrecision must be "integer" or "subpixel".`, { path: `${i}.renderPrecision` }))), typeof o.layoutDimension != "undefined")
    if (!I(o.layoutDimension))
      t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid layoutDimension.", { path: `${i}.layoutDimension` })), delete s.layoutDimension) : n.push(h("validation", "error", `${i}.layoutDimension must be an object.`, { path: `${i}.layoutDimension` }));
    else {
      const a = { ...o.layoutDimension };
      typeof a.type != "undefined" && a.type !== "percentage" && a.type !== "fixed" && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid layoutDimension.type.", { path: `${i}.layoutDimension.type` })), delete a.type) : n.push(h("validation", "error", `${i}.layoutDimension.type is invalid.`, { path: `${i}.layoutDimension.type` })));
      for (const l of ["fixedWidth", "leftWidthPercentage"])
        F(n, he(a, a, l, `${i}.layoutDimension`, t));
      F(n, pe(a, a, "fixedLayout", `${i}.layoutDimension`, t)), s.layoutDimension = a;
    }
  return n.push(...K(o, s, "extensions", i, t)), N(n) ? { ok: !1, diagnostics: n } : { ok: !0, settings: s, diagnostics: n };
}, Xe = (e) => e.map((i) => ({ i, x: 0, y: 0, w: 1, h: 1 })), Me = (e, i, t, r) => {
  if (typeof e == "undefined") return { ok: !0, editor: void 0, diagnostics: [] };
  const o = L(e, t, i);
  if (!o.ok) return { ok: !1, diagnostics: o.diagnostics };
  if (!I(o.value)) {
    const l = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be an object.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: o.diagnostics.concat(l) } : { ok: !1, diagnostics: o.diagnostics.concat(l) };
  }
  const s = o.value, n = { ...s }, a = o.diagnostics.slice();
  if (ki(s.version) || (t === "sanitize" ? (a.push(h("item-field-cleaned", "warning", "Defaulted invalid editor version.", { path: `${i}.version` })), n.version = 1) : a.push(h("validation", "error", `${i}.version must be a positive integer.`, { path: `${i}.version` }))), typeof s.updatedAt != "undefined" && F(a, pe(s, n, "updatedAt", i, t)), typeof s.editorMetaById != "undefined") {
    const l = Ce(s.editorMetaById, {
      layout: Xe(r),
      removeOrphans: !0
    });
    if (l.warnings.forEach((d) => {
      a.push(h(
        d.code === "orphan-meta" ? "orphan-editor-meta" : d.code,
        "warning",
        d.message,
        { path: `${i}.${d.path}` }
      ));
    }), l.errors.forEach((d) => {
      a.push(h(
        d.code,
        t === "sanitize" ? "warning" : "error",
        d.message,
        { path: `${i}.${d.path}` }
      ));
    }), !l.ok && t !== "sanitize") return { ok: !1, diagnostics: a };
    n.editorMetaById = l.value;
  }
  return a.push(...K(s, n, "extensions", i, t)), N(a) ? { ok: !1, diagnostics: a } : { ok: !0, editor: n, diagnostics: a };
}, Ri = (e, i, t) => {
  const r = L(e, t, i);
  if (!r.ok) return { ok: !1, diagnostics: r.diagnostics };
  if (!I(r.value))
    return {
      ok: !1,
      diagnostics: r.diagnostics.concat(h("validation", "error", `${i} must be an object.`, { path: i }))
    };
  const o = r.value, s = { ...o }, n = r.diagnostics.slice();
  if (!I(o.widgets))
    return {
      ok: !1,
      diagnostics: n.concat(h("validation", "error", `${i}.widgets must be an object map.`, { path: `${i}.widgets` }))
    };
  const a = {};
  for (const f of Object.keys(o.widgets)) {
    if (!Q(f) || se.has(f)) {
      n.push(h("validation", "error", "Widget ids must be safe non-empty strings.", { path: `${i}.widgets.${f}`, itemId: f }));
      continue;
    }
    const g = ye(o.widgets[f], `${i}.widgets.${f}`, t, !0);
    n.push(...g.diagnostics.map((m) => {
      var u;
      return { ...m, itemId: (u = m.itemId) != null ? u : f };
    })), g.ok && (a[f] = g.item);
  }
  s.widgets = a;
  const l = be(o.gridSettings, `${i}.gridSettings`, t);
  if (n.push(...l.diagnostics), !l.ok) return { ok: !1, diagnostics: n };
  if (l.settings ? s.gridSettings = l.settings : delete s.gridSettings, typeof o.profiles != "undefined")
    if (!I(o.profiles))
      t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid profiles.", { path: `${i}.profiles` })), delete s.profiles) : n.push(h("validation", "error", `${i}.profiles must be an object map.`, { path: `${i}.profiles` }));
    else {
      const f = {};
      for (const g of Object.keys(o.profiles)) {
        const m = `${i}.profiles.${g}`;
        if (!Q(g) || se.has(g)) {
          n.push(h("validation", "error", "Profile ids must be safe non-empty strings.", { path: m, profileId: g }));
          continue;
        }
        if (!I(o.profiles[g])) {
          n.push(h("validation", t === "sanitize" ? "warning" : "error", `${m} must be an object.`, { path: m, profileId: g }));
          continue;
        }
        const u = o.profiles[g], c = { ...u };
        if (typeof u.widgets != "undefined")
          if (!I(u.widgets))
            n.push(h("validation", t === "sanitize" ? "warning" : "error", `${m}.widgets must be an object map.`, { path: `${m}.widgets`, profileId: g })), t === "sanitize" && delete c.widgets;
          else {
            const k = {};
            for (const D of Object.keys(u.widgets)) {
              const j = ye(u.widgets[D], `${m}.widgets.${D}`, t, !1);
              n.push(...j.diagnostics.map((b) => {
                var S;
                return { ...b, itemId: (S = b.itemId) != null ? S : D, profileId: g };
              })), j.ok && (k[D] = j.item, Y(a, D) || n.push(h("unknown-item", "warning", `Profile "${g}" references an unknown widget "${D}".`, {
                path: `${m}.widgets.${D}`,
                itemId: D,
                profileId: g
              })));
            }
            c.widgets = k;
          }
        const p = be(u.gridSettings, `${m}.gridSettings`, t);
        if (n.push(...p.diagnostics.map((k) => ({ ...k, profileId: g }))), !p.ok) return { ok: !1, diagnostics: n };
        p.settings ? c.gridSettings = p.settings : delete c.gridSettings;
        const v = Me(u.editor, `${m}.editor`, t, Object.keys(a));
        if (n.push(...v.diagnostics.map((k) => ({ ...k, profileId: g }))), !v.ok) return { ok: !1, diagnostics: n };
        v.editor ? c.editor = v.editor : delete c.editor, n.push(...K(u, c, "extensions", m, t)), f[g] = c;
      }
      s.profiles = f;
    }
  const d = Me(o.editor, `${i}.editor`, t, Object.keys(a));
  return n.push(...d.diagnostics), d.ok ? (d.editor ? s.editor = d.editor : delete s.editor, n.push(...K(o, s, "extensions", i, t)), N(n) ? { ok: !1, diagnostics: n } : { ok: !0, layout: s, diagnostics: n }) : { ok: !1, diagnostics: n };
};
function x(e, i = {}) {
  var m, u;
  const t = (m = i.currentVersion) != null ? m : oe, r = (u = i.validation) != null ? u : "strict", o = L(e, r, "document"), s = o.diagnostics.slice();
  if (!o.ok)
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((c) => c.level === "warning"),
      diagnostics: s,
      error: {
        ...ke("Dashboard document must contain JSON-safe values only.", s),
        originalPayload: e
      }
    };
  if (!I(o.value)) {
    const c = h("invalid-document", "error", "Dashboard document must be an object.", { path: "document" });
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s.concat(c),
      error: M("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  const n = o.value, a = { ...n };
  if (n.dashboardSchemaVersion !== t) {
    const c = h("invalid-document", "error", `Expected dashboard schema version ${t}.`, { path: "dashboardSchemaVersion" });
    return s.push(c), {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: M("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  if (n.kind !== "dashboard-layout") {
    const c = h("invalid-document", "error", 'Dashboard document kind must be "dashboard-layout".', { path: "kind" });
    s.push(c);
  }
  for (const c of ["key", "revision", "sourceId", "savedAt", "primaryLayoutId"])
    Q(n[c]) || s.push(h("invalid-document", "error", `Dashboard document ${c} must be a non-empty string.`, { path: c }));
  if (Q(n.savedAt) && !$i(n.savedAt) && s.push(h("invalid-document", "error", "Dashboard document savedAt must be a valid date string.", { path: "savedAt" })), I(n.layouts) || s.push(h("invalid-document", "error", "Dashboard document layouts must be an object map.", { path: "layouts" })), N(s)) {
    const c = N(s);
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: M(c.code === "invalid-document" ? "invalid-document" : "validation", c.message, {
        path: c.path,
        originalPayload: e
      })
    };
  }
  const l = n.layouts, d = n.primaryLayoutId;
  if (!Y(l, d)) {
    const c = h("invalid-document", "error", "Dashboard primaryLayoutId must point to an existing layout.", { path: "primaryLayoutId", layoutId: d });
    return s.push(c), {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: M("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  const f = {};
  for (const c of Object.keys(l)) {
    if (!Q(c) || se.has(c)) {
      s.push(h("invalid-document", "error", "Layout ids must be safe non-empty strings.", { path: `layouts.${c}`, layoutId: c }));
      continue;
    }
    const p = Ri(l[c], `layouts.${c}`, r);
    s.push(...p.diagnostics.map((v) => {
      var k;
      return { ...v, layoutId: (k = v.layoutId) != null ? k : c };
    })), p.ok && (f[c] = p.layout);
  }
  if (typeof n.meta != "undefined" ? s.push(...K(n, a, "meta", "document", r)) : delete a.meta, N(s)) {
    const c = N(s);
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: M(c.code === "invalid-document" ? "invalid-document" : "validation", c.message, {
        path: c.path,
        details: c.details,
        originalPayload: e
      })
    };
  }
  return {
    ok: !0,
    document: {
      ...a,
      dashboardSchemaVersion: t,
      kind: "dashboard-layout",
      key: n.key,
      revision: n.revision,
      sourceId: n.sourceId,
      savedAt: n.savedAt,
      primaryLayoutId: d,
      layouts: f,
      ...a.meta ? { meta: a.meta } : {}
    },
    warnings: s.filter((c) => c.level === "warning"),
    diagnostics: s
  };
}
function Ge(e, i) {
  var m, u, c, p;
  const t = (m = i.now) != null ? m : () => /* @__PURE__ */ new Date(), r = (u = i.revision) != null ? u : Pi, o = t().toISOString(), s = (c = i.sourceId) != null ? c : I(e) && typeof e.sourceId == "string" ? e.sourceId : Mi(), n = I(e) && e.kind === "dashboard-layout" && I(e.layouts), a = n && typeof e.primaryLayoutId == "string" ? e.primaryLayoutId : "default", l = n ? e.layouts : { [a]: e }, d = (p = i.meta) != null ? p : n ? e.meta : void 0, f = {
    ...n ? e : {},
    dashboardSchemaVersion: oe,
    kind: "dashboard-layout",
    key: i.key,
    revision: r(),
    sourceId: s,
    savedAt: o,
    primaryLayoutId: a,
    layouts: l,
    ...d ? { meta: d } : {}
  }, g = x(f, {
    currentVersion: oe,
    validation: "strict"
  });
  if (!g.ok) throw g.error;
  return g.document;
}
function ji(e, i = {}) {
  var f, g, m;
  const t = (f = i.currentVersion) != null ? f : oe, r = (g = i.migrations) != null ? g : {}, o = e, s = [], n = [];
  if (!I(e) || !Number.isInteger(e.dashboardSchemaVersion))
    return { ok: !1, error: M("invalid-document", "Document has no numeric dashboardSchemaVersion.", {
      path: "dashboardSchemaVersion",
      originalPayload: o
    }), originalPayload: o, migrations: s, warnings: [], diagnostics: n };
  let a = e.dashboardSchemaVersion;
  if (a > t)
    return { ok: !1, error: M("invalid-document", `Dashboard schema version ${a} is newer than supported ${t}.`, {
      path: "dashboardSchemaVersion",
      originalPayload: o
    }), originalPayload: o, migrations: s, warnings: [], diagnostics: n };
  let l = e;
  for (; a < t; ) {
    const u = r[a];
    if (!u) {
      const c = h("migration-missing", "error", `Missing dashboard migration from version ${a} to ${a + 1}.`);
      return n.push(c), {
        ok: !1,
        originalPayload: o,
        migrations: s,
        warnings: n.filter((p) => p.level === "warning"),
        diagnostics: n,
        error: M("migration-missing", c.message, { originalPayload: o })
      };
    }
    try {
      l = u(l, { fromVersion: a, toVersion: a + 1 });
    } catch (c) {
      const p = h("migration-failed", "error", `Dashboard migration from version ${a} to ${a + 1} failed.`, { details: c });
      return n.push(p), {
        ok: !1,
        originalPayload: o,
        migrations: s,
        warnings: n.filter((v) => v.level === "warning"),
        diagnostics: n,
        error: M("migration-failed", p.message, { cause: c, originalPayload: o })
      };
    }
    if (!I(l) || l.dashboardSchemaVersion !== a + 1) {
      const c = h("migration-failed", "error", `Dashboard migration from version ${a} to ${a + 1} returned an invalid document.`);
      return n.push(c), {
        ok: !1,
        originalPayload: o,
        migrations: s,
        warnings: n.filter((p) => p.level === "warning"),
        diagnostics: n,
        error: M("migration-failed", c.message, { originalPayload: o })
      };
    }
    s.push({ fromVersion: a, toVersion: a + 1 }), a += 1;
  }
  const d = x(l, {
    currentVersion: t,
    validation: (m = i.validation) != null ? m : "strict"
  });
  return n.push(...d.diagnostics), d.ok ? {
    ok: !0,
    document: d.document,
    migrations: s,
    originalPayload: o,
    warnings: n.filter((u) => u.level === "warning"),
    diagnostics: n
  } : {
    ok: !1,
    originalPayload: o,
    migrations: s,
    warnings: n.filter((u) => u.level === "warning"),
    diagnostics: n,
    error: s.length > 0 ? M("migration-failed", "Dashboard migration result failed validation.", {
      cause: d.error,
      originalPayload: o
    }) : d.error
  };
}
function Ht(e, i = {}) {
  var o;
  const t = Ei(e);
  if (!t.ok)
    return {
      ok: !1,
      error: t.error,
      fallback: i.fallback ? ne(i.fallback, "strict") : void 0,
      originalPayload: e,
      migrations: [],
      warnings: [],
      diagnostics: []
    };
  const r = ji(t.value, {
    currentVersion: i.currentVersion,
    migrations: i.migrations,
    validation: (o = i.validation) != null ? o : "strict"
  });
  return r.ok ? {
    ok: !0,
    document: r.document,
    migrations: r.migrations,
    warnings: r.warnings,
    diagnostics: r.diagnostics
  } : {
    ok: !1,
    error: r.error,
    fallback: i.fallback ? ne(i.fallback, "strict") : void 0,
    originalPayload: r.originalPayload,
    migrations: r.migrations,
    warnings: r.warnings,
    diagnostics: r.diagnostics
  };
}
const Bi = (e) => {
  var i, t, r, o, s, n, a, l;
  return {
    ...e || {},
    columns: (i = e == null ? void 0 : e.columns) != null ? i : 12,
    minColumns: (t = e == null ? void 0 : e.minColumns) != null ? t : 1,
    margin: (r = e == null ? void 0 : e.margin) != null ? r : 10,
    outerMargin: (o = e == null ? void 0 : e.outerMargin) != null ? o : !0,
    viewFormat: (s = e == null ? void 0 : e.viewFormat) != null ? s : "grid",
    rowHeight: (n = e == null ? void 0 : e.rowHeight) != null ? n : 150,
    autoFillHeight: (a = e == null ? void 0 : e.autoFillHeight) != null ? a : !1,
    heightMode: e == null ? void 0 : e.heightMode,
    mobileHeightMode: e == null ? void 0 : e.mobileHeightMode,
    minRowHeight: e == null ? void 0 : e.minRowHeight,
    renderPrecision: (l = e == null ? void 0 : e.renderPrecision) != null ? l : "integer"
  };
}, Fi = (e, i) => {
  const t = {
    i: e,
    x: i.col,
    y: i.row,
    w: i.sizeX,
    h: i.sizeY
  };
  return E(t, "minW", i.minSizeX), E(t, "minH", i.minSizeY), E(t, "maxW", i.maxSizeX), E(t, "maxH", i.maxSizeY), E(t, "static", i.static), E(t, "isDraggable", i.draggable), E(t, "isResizable", i.resizable), E(t, "isBounded", i.bounded), i.resizeHandles && (t.resizeHandles = i.resizeHandles.slice()), t;
}, xi = (e, i) => ({
  ...e,
  ...i || {}
}), Pe = (e) => {
  if (!e) return;
  const i = {};
  return E(i, "static", e.static), E(i, "draggable", e.draggable), E(i, "resizable", e.resizable), E(i, "bounded", e.bounded), e.resizeHandles && (i.resizeHandles = e.resizeHandles.slice()), E(i, "preserveAspectRatio", e.preserveAspectRatio), E(i, "aspectRatio", e.aspectRatio), Object.keys(i).length > 0 ? i : void 0;
}, Ai = (e, i) => h(
  e.code,
  e.level,
  e.message,
  {
    layoutId: i.layoutId,
    profileId: i.profileId || void 0,
    itemId: i.itemId,
    path: e.field ? `layouts.${i.layoutId}.widgets.${i.itemId}.${e.field}` : void 0,
    details: e.details
  }
), Li = (e, i, t) => {
  t.profileId && bi.forEach((r) => {
    const o = !!(t.profileItem && Y(t.profileItem, r) && typeof t.profileItem[r] != "undefined"), s = Y(t.baseItem, r) && typeof t.baseItem[r] != "undefined";
    if (!o && !s) return;
    const n = o ? "item-capability.profile-overridden" : "item-capability.profile-inherited", a = i.sourceLists[r] || [];
    e.push(h(
      n,
      "info",
      o ? `Profile capability field ${r} overrides the default item.` : `Profile capability field ${r} is inherited from the default item.`,
      {
        layoutId: t.layoutId,
        profileId: t.profileId || void 0,
        itemId: t.itemId,
        path: o ? `layouts.${t.layoutId}.profiles.${t.profileId}.widgets.${t.itemId}.${r}` : `layouts.${t.layoutId}.widgets.${t.itemId}.${r}`,
        details: {
          field: r,
          mode: o ? "overridden" : "inherited",
          effectiveSource: i.sources[r],
          sourceLists: a
        }
      }
    ));
  });
}, Vi = (e, i) => e.y !== i.y ? e.y - i.y : e.x !== i.x ? e.x - i.x : e.i < i.i ? -1 : e.i > i.i ? 1 : 0, Ue = (e, i, t) => {
  const r = Ce(e, { layout: i, removeOrphans: !0 });
  return r.warnings.forEach((o) => {
    t.push(h(
      o.code === "orphan-meta" ? "orphan-editor-meta" : o.code,
      "warning",
      o.message,
      { path: o.path }
    ));
  }), r.errors.forEach((o) => {
    t.push(h(o.code, "warning", o.message, { path: o.path }));
  }), r.value;
};
function Je(e, i = {}) {
  var D, j, b, S, H, P, O;
  const t = x(e, { validation: (D = i.validation) != null ? D : "strict" }), r = t.diagnostics.slice();
  if (!t.ok)
    return { ok: !1, error: t.error, originalPayload: t.originalPayload, diagnostics: r };
  const o = t.document;
  let s = !1, n = (j = i.layoutId) != null ? j : o.primaryLayoutId;
  if (n !== o.primaryLayoutId && !i.allowNonPrimary && (r.push(h("deferred-layout-slot", "info", "Only the primary dashboard layout is projected in this version.", {
    layoutId: n
  })), n = o.primaryLayoutId, s = !0), !o.layouts[n]) {
    const w = M("invalid-document", `Dashboard layout "${n}" was not found.`, {
      path: `layouts.${n}`
    });
    return r.push(h("invalid-document", "error", w.message, { layoutId: n, path: w.path })), { ok: !1, error: w, originalPayload: e, diagnostics: r };
  }
  Object.keys(o.layouts).forEach((w) => {
    w !== n && w !== o.primaryLayoutId && r.push(h("deferred-layout-slot", "info", "Non-primary dashboard layout slot is preserved but not projected.", { layoutId: w }));
  });
  const a = o.layouts[n], l = i.profileId && ((b = a.profiles) != null && b[i.profileId]) ? i.profileId : null;
  i.profileId && !l && (r.push(h("profile-fallback", "warning", `Dashboard profile "${i.profileId}" was not found; projected primary layout.`, {
    layoutId: n,
    profileId: i.profileId
  })), s = !0);
  const d = l ? (S = a.profiles) == null ? void 0 : S[l] : void 0;
  d != null && d.widgets && Object.keys(d.widgets).forEach((w) => {
    Y(a.widgets, w) || r.push(h("unknown-item", "warning", `Profile "${l}" contains unknown widget "${w}".`, {
      layoutId: n,
      profileId: l || void 0,
      itemId: w,
      path: `layouts.${n}.profiles.${l}.widgets.${w}`
    }));
  });
  const f = (H = i.targetView) != null ? H : "desktop", g = [], m = {}, u = {}, c = {
    ...((P = a.editor) == null ? void 0 : P.editorMetaById) || {}
  };
  (O = d == null ? void 0 : d.editor) != null && O.editorMetaById && Object.keys(d.editor.editorMetaById).forEach((w) => {
    var y, B;
    c[w] = {
      ...c[w] || {},
      ...(B = (y = d.editor) == null ? void 0 : y.editorMetaById) == null ? void 0 : B[w]
    };
  }), Object.keys(a.widgets).forEach((w) => {
    var De, He;
    const y = a.widgets[w], B = (De = d == null ? void 0 : d.widgets) == null ? void 0 : De[w], R = xi(a.widgets[w], (He = d == null ? void 0 : d.widgets) == null ? void 0 : He[w]), T = Fi(w, R);
    g.push(T);
    const A = { ...c[w] || {} };
    (f === "mobile" ? R.mobileHide === !0 : R.desktopHide === !0) ? (A.visible === !0 && r.push(h("editor-capability-conflict", "warning", "Dashboard visibility overrides editor metadata.", {
      layoutId: n,
      profileId: l || void 0,
      itemId: w
    })), A.visible = !1) : typeof A.visible == "undefined" && (A.visible = !0), R.resizable === !1 && (A.resizable === !0 && r.push(h("editor-capability-conflict", "warning", "Dashboard resizable=false overrides editor metadata.", {
      layoutId: n,
      profileId: l || void 0,
      itemId: w
    })), A.resizable = !1), c[w] = A;
    const _ = ui({
      item: T,
      dashboard: Pe(y),
      profile: Pe(B),
      editor: A,
      preserveUnknownFields: !0
    });
    m[w] = _, _.aspectRatio && (u[w] = _.aspectRatio), _.diagnostics.forEach((V) => {
      r.push(Ai(V, {
        layoutId: n,
        profileId: l,
        itemId: w
      }));
    }), Li(r, _, {
      layoutId: n,
      profileId: l,
      itemId: w,
      baseItem: y,
      profileItem: B
    }), pi.forEach((V) => {
      typeof R[V] != "undefined" && r.push(h("unsupported-field", "info", `${V} is preserved in the dashboard document but not written to LayoutItem.`, {
        layoutId: n,
        profileId: l || void 0,
        itemId: w,
        path: `layouts.${n}.widgets.${w}.${V}`
      }));
    }), yi.forEach((V) => {
      typeof R[V] != "undefined" && r.push(h("item-capability.sidecar-projected", "info", `${V} was projected through capability sidecar and not written to LayoutItem.`, {
        layoutId: n,
        profileId: l || void 0,
        itemId: w,
        path: `layouts.${n}.widgets.${w}.${V}`
      }));
    });
  }), g.sort(Vi);
  const p = Ue(c, g, r), v = Bi({
    ...a.gridSettings || {},
    ...(d == null ? void 0 : d.gridSettings) || {}
  });
  return (a.gridSettings || d != null && d.gridSettings) && r.push(h("unsupported-field", "info", "Dashboard grid settings are returned as sidecar runtime settings and are not written to LayoutItem.", {
    layoutId: n,
    profileId: l || void 0,
    path: d != null && d.gridSettings ? `layouts.${n}.profiles.${l}.gridSettings` : `layouts.${n}.gridSettings`
  })), { ok: !0, projection: {
    layout: g,
    gridSettings: v,
    editorMetaById: p,
    capabilitiesById: m,
    resizeConstraintsById: Object.keys(u).length > 0 ? u : void 0,
    layoutId: n,
    profileId: l,
    fallbackApplied: s,
    diagnostics: r
  }, diagnostics: r };
}
const Ee = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return E(i, "minSizeX", e.minW), E(i, "minSizeY", e.minH), E(i, "maxSizeX", e.maxW), E(i, "maxSizeY", e.maxH), i;
}, Oe = (e, i) => {
  if (!e && !i) return;
  const t = {};
  return Object.keys(e || {}).forEach((r) => {
    t[r] = { ...e[r] };
  }), Object.keys(i || {}).forEach((r) => {
    t[r] = {
      ...t[r] || {},
      ...i[r]
    };
  }), t;
}, Ti = (e) => {
  if (!e) return null;
  const i = new Set(e.filter(Boolean));
  return (t) => i.has(t);
}, Re = (e, i) => {
  if (!e || !i) return e;
  const t = new Set(i.filter(Boolean)), r = {};
  return Object.keys(e).forEach((o) => {
    t.has(o) && (r[o] = e[o]);
  }), Object.keys(r).length > 0 ? r : void 0;
}, Ni = (e) => (e.editor = e.editor || { version: 1 }, e.editor);
function Ke(e, i, t = {}) {
  var c, p, v, k, D, j;
  const r = x(e, { validation: (c = t.validation) != null ? c : "strict" }), o = r.diagnostics.slice(), s = r.ok ? r.document : ne(e, "sanitize");
  if (!r.ok)
    return {
      ok: !1,
      error: r.error,
      document: s,
      originalPayload: r.originalPayload,
      diagnostics: o
    };
  const n = ne(s, "strict"), a = (p = t.layoutId) != null ? p : n.primaryLayoutId, l = n.layouts[a];
  if (!l) {
    const b = h("invalid-document", "error", `Dashboard layout "${a}" was not found.`, { layoutId: a });
    return o.push(b), {
      ok: !1,
      error: M("invalid-document", b.message, { path: `layouts.${a}` }),
      document: n,
      diagnostics: o
    };
  }
  let d;
  if (t.profileId) {
    if (l.profiles = l.profiles || {}, !l.profiles[t.profileId]) {
      if (!t.createMissingProfile) {
        const b = h("profile-fallback", "error", `Dashboard profile "${t.profileId}" was not found.`, {
          layoutId: a,
          profileId: t.profileId
        });
        return o.push(b), {
          ok: !1,
          error: M("validation", b.message, { path: `layouts.${a}.profiles.${t.profileId}` }),
          document: n,
          diagnostics: o
        };
      }
      l.profiles[t.profileId] = { widgets: {} };
    }
    l.profiles[t.profileId].widgets = l.profiles[t.profileId].widgets || {}, d = l.profiles[t.profileId].widgets;
  } else
    d = l.widgets;
  const f = Ti(t.writeItemIds), g = new Set(i.layout.map((b) => b.i));
  t.removeMissingItems && ((v = t.writeItemIds) != null && v.length) && t.writeItemIds.filter(Boolean).forEach((b) => {
    var S;
    g.has(b) || (delete l.widgets[b], delete d[b], Object.values(l.profiles || {}).forEach((H) => {
      var P;
      H.widgets && delete H.widgets[b], (P = H.editor) != null && P.editorMetaById && delete H.editor.editorMetaById[b];
    }), (S = l.editor) != null && S.editorMetaById && delete l.editor.editorMetaById[b]);
  });
  for (const b of i.layout) {
    const S = b.i;
    if (f && !f(S)) continue;
    const H = Y(l.widgets, S);
    if (!H && !t.createMissingItems) {
      const O = h("unknown-item", "error", `Runtime layout contains unknown dashboard widget "${S}".`, {
        layoutId: a,
        profileId: t.profileId,
        itemId: S
      });
      return o.push(O), {
        ok: !1,
        error: M("unknown-item", O.message, { details: { itemId: S } }),
        document: n,
        diagnostics: o
      };
    }
    H || (l.widgets[S] = Ee(b));
    const P = d[S] || {};
    d[S] = {
      ...P,
      ...Ee(b)
    };
  }
  if (i.gridSettings)
    if (t.profileId) {
      const b = (k = l.profiles) == null ? void 0 : k[t.profileId];
      b && (b.gridSettings = {
        ...b.gridSettings || {},
        ...i.gridSettings
      });
    } else
      l.gridSettings = {
        ...l.gridSettings || {},
        ...i.gridSettings
      };
  const m = Oe(
    Re(t.editorMetaById, t.writeItemIds),
    Re(i.editorMetaById, t.writeItemIds)
  );
  if (m) {
    const b = t.profileId ? (D = l.profiles) == null ? void 0 : D[t.profileId] : l, S = Ni(b);
    S.editorMetaById = Oe(S.editorMetaById, m), Object.keys(m).forEach((H) => {
      if (!Y(l.widgets, H)) {
        o.push(h("orphan-editor-meta", "warning", `Editor metadata references unknown widget "${H}".`, {
          layoutId: a,
          itemId: H
        }));
        return;
      }
      const P = m[H], O = t.profileId ? d[H] || {} : l.widgets[H];
      typeof P.resizable == "boolean" && (O.resizable = P.resizable, d[H] = O), t.targetView && typeof P.visible == "boolean" && (t.targetView === "mobile" ? O.mobileHide = P.visible === !1 : O.desktopHide = P.visible === !1, d[H] = O);
    }), S.editorMetaById = Ue(
      S.editorMetaById || {},
      Xe(Object.keys(l.widgets)),
      o
    );
  }
  const u = x(n, { validation: (j = t.validation) != null ? j : "strict" });
  return o.push(...u.diagnostics), u.ok ? {
    ok: !0,
    document: u.document,
    diagnostics: o
  } : {
    ok: !1,
    error: u.error,
    document: n,
    originalPayload: e,
    diagnostics: o
  };
}
const qe = (e, i) => {
  const t = {};
  return i.forEach((r) => {
    typeof e[r] != "undefined" && (t[r] = e[r]);
  }), t;
}, U = (e, i) => {
  const t = {};
  return Object.keys(e).forEach((r) => {
    i.indexOf(r) === -1 && (t[r] = e[r]);
  }), t;
}, ae = (e, i, t, r) => {
  if (Object.keys(e).length === 0) return;
  const o = L(e, "sanitize", `${t}.extensions.thingsBoard`);
  if (i.push(...o.diagnostics), i.push(h("unsupported-field", "warning", r, { path: t })), !(!o.ok || !I(o.value) || Object.keys(o.value).length === 0))
    return o.value;
}, je = (e, i, t) => {
  if (!I(e)) return;
  const r = qe(e, me), o = U(e, me), s = ae(
    o,
    i,
    t,
    "ThingsBoard grid settings contain deferred business fields."
  );
  s && (r.extensions = {
    ...r.extensions || {},
    thingsBoard: s
  });
  const n = be(r, t, "sanitize");
  return i.push(...n.diagnostics), n.ok ? n.settings : void 0;
}, Be = (e, i, t, r) => {
  if (!I(e))
    return i.push(h("invalid-item-geometry", "error", "ThingsBoard widget must be an object.", { path: t })), null;
  const o = I(e.layout) ? e.layout : e, s = qe(o, re), n = I(e.layout) ? U(o, re) : {}, a = I(e.layout) ? {
    ...U(e, ["layout"]),
    ...Object.keys(n).length > 0 ? { layout: n } : {}
  } : U(e, re), l = ae(
    a,
    i,
    t,
    "ThingsBoard widget business fields were preserved in extensions."
  );
  l && (s.extensions = {
    ...s.extensions || {},
    thingsBoard: l
  });
  const d = ye(s, t, "sanitize", r);
  return i.push(...d.diagnostics), d.ok ? d.item : null;
};
function zt(e, i = {}) {
  var d;
  const t = [];
  if (!I(e))
    return {
      ok: !1,
      originalPayload: e,
      diagnostics: t,
      error: M("invalid-document", "ThingsBoard dashboard layout must be an object.")
    };
  const r = {}, o = I(e.widgets) ? e.widgets : {};
  Object.keys(o).forEach((f) => {
    const g = Be(o[f], t, `widgets.${f}`, !0);
    g && (r[f] = g);
  });
  const s = {
    widgets: r,
    ...e.gridSettings ? { gridSettings: je(e.gridSettings, t, "gridSettings") } : {}
  }, n = U(e, wi), a = ae(
    n,
    t,
    "document",
    "ThingsBoard dashboard business fields were preserved in extensions."
  );
  a && (s.extensions = {
    ...s.extensions || {},
    thingsBoard: a
  });
  const l = I(e.breakpoints) ? e.breakpoints : {};
  Object.keys(l).forEach((f) => {
    if (!I(l[f])) return;
    const g = l[f], m = I(g.widgetLayouts) ? g.widgetLayouts : I(g.widgets) ? g.widgets : {}, u = {};
    Object.keys(m).forEach((p) => {
      const v = Be(m[p], t, `breakpoints.${f}.widgetLayouts.${p}`, !1);
      v && (u[p] = v);
    });
    const c = ae(
      U(g, vi),
      t,
      `breakpoints.${f}`,
      "ThingsBoard breakpoint business fields were preserved in extensions."
    );
    s.profiles = s.profiles || {}, s.profiles[f] = {
      widgets: u,
      ...g.gridSettings ? { gridSettings: je(g.gridSettings, t, `breakpoints.${f}.gridSettings`) } : {},
      ...c ? { extensions: { thingsBoard: c } } : {}
    };
  });
  try {
    return { ok: !0, document: Ge(s, {
      key: (d = i.key) != null ? d : "thingsboard-dashboard",
      sourceId: i.sourceId,
      meta: i.meta,
      now: i.now,
      revision: i.revision
    }), diagnostics: t };
  } catch (f) {
    return {
      ok: !1,
      originalPayload: e,
      diagnostics: t,
      error: M("validation", "Imported ThingsBoard dashboard layout failed validation.", { cause: f })
    };
  }
}
const Fe = (e) => {
  var t;
  if (!e) return;
  const i = {};
  return I((t = e.extensions) == null ? void 0 : t.thingsBoard) && Object.keys(e.extensions.thingsBoard).forEach((r) => {
    var o;
    i[r] = ((o = e.extensions) == null ? void 0 : o.thingsBoard)[r];
  }), me.forEach((r) => {
    typeof e[r] != "undefined" && (i[r] = e[r]);
  }), i;
}, xe = (e) => {
  var t;
  const i = {};
  return I((t = e.extensions) == null ? void 0 : t.thingsBoard) && Object.keys(e.extensions.thingsBoard).forEach((r) => {
    var o;
    i[r] = ((o = e.extensions) == null ? void 0 : o.thingsBoard)[r];
  }), re.forEach((r) => {
    typeof e[r] != "undefined" && (i[r] = e[r]);
  }), i;
};
function Mt(e, i = {}) {
  var d, f;
  const t = x(e), r = t.diagnostics.slice();
  if (!t.ok) return { ok: !1, error: t.error, diagnostics: r };
  const o = t.document, s = (d = i.layoutId) != null ? d : o.primaryLayoutId, n = o.layouts[s];
  if (!n) {
    const g = h("invalid-document", "error", `Dashboard layout "${s}" was not found.`, { layoutId: s });
    return r.push(g), {
      ok: !1,
      diagnostics: r,
      error: M("invalid-document", g.message, { path: `layouts.${s}` })
    };
  }
  const a = {};
  Object.keys(n.widgets).forEach((g) => {
    a[g] = xe(n.widgets[g]);
  });
  const l = {};
  return Object.keys(n.profiles || {}).forEach((g) => {
    var c;
    const m = n.profiles[g], u = {};
    Object.keys(m.widgets || {}).forEach((p) => {
      u[p] = xe(m.widgets[p]);
    }), l[g] = {
      ...I((c = m.extensions) == null ? void 0 : c.thingsBoard) ? m.extensions.thingsBoard : {},
      widgetLayouts: u,
      ...m.gridSettings ? { gridSettings: Fe(m.gridSettings) } : {}
    };
  }), {
    ok: !0,
    value: {
      ...I((f = n.extensions) == null ? void 0 : f.thingsBoard) ? n.extensions.thingsBoard : {},
      widgets: a,
      ...n.gridSettings ? { gridSettings: Fe(n.gridSettings) } : {},
      ...Object.keys(l).length > 0 ? { breakpoints: l } : {}
    },
    diagnostics: r
  };
}
const fe = "default", Ae = 12, de = 10, we = [0, 0], Le = 150, Ze = "grid-height-runtime", _i = [
  "preserveAspectRatio",
  "aspectRatio"
], Wi = [
  "mobileDisplayLayoutFirst",
  "layoutDimension",
  "backgroundColor",
  "backgroundSizeMode",
  "backgroundImageUrl"
], X = (e, i) => Object.prototype.hasOwnProperty.call(e, i), z = (e) => typeof e == "number" && Number.isFinite(e), W = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const i = Object.getPrototypeOf(e);
  return i === Object.prototype || i === null;
}, C = (e, i) => z(e) && e > 0 ? Math.floor(e) : i, te = (e) => Array.isArray(e) && e.length === 2 && z(e[0]) && z(e[1]), ve = (e) => {
  const i = JSON.stringify(e);
  return typeof i == "undefined" ? e : JSON.parse(i);
}, Ie = (e) => e.map((i) => ({ ...i })), Ci = (e) => {
  if (!e) return null;
  const i = new Set(e.filter(Boolean));
  return (t) => i.has(t);
}, le = (e) => e === "auto" || e === "scroll" || e === "fit" || e === "fixed", Yi = (e) => e === "integer" || e === "subpixel", Xi = (e, i = [de, de]) => te(e) ? [e[0], e[1]] : z(e) ? [e, e] : [i[0], i[1]], J = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
});
function $(e, i, t, r = {}) {
  return {
    code: e,
    level: i,
    message: t,
    ...r
  };
}
function Pt(e) {
  return W(e.details) && e.details.source === Ze;
}
function Gi(e, i) {
  return {
    code: e.code,
    level: e.level,
    message: e.message,
    path: e.path,
    itemId: e.itemId,
    profileId: e.profileId || i.resolvedProfileId || void 0,
    layoutId: e.layoutId || i.layoutId,
    targetView: e.targetView || i.targetView,
    details: {
      ...W(e.details) ? e.details : { value: e.details },
      source: Ze,
      prop: e.prop
    }
  };
}
const Ui = (e, i) => Object.prototype.hasOwnProperty.call(e, i), Ji = (e, i, t, r) => {
  const o = Ui(t, "rowHeight") ? t.rowHeight : i.rowHeight;
  return ci({
    layout: e,
    heightMode: t.heightMode,
    rowHeight: o,
    minRowHeight: t.minRowHeight,
    margin: Xi(i.margin),
    containerPadding: i.containerPadding || we,
    containerHeight: t.containerHeight,
    autoMeasureContainerHeight: t.autoMeasureContainerHeight,
    renderPrecision: t.renderPrecision,
    context: {
      source: "dashboard-responsive",
      layoutId: r.layoutId,
      profileId: r.resolvedProfileId,
      targetView: r.targetView
    }
  });
}, Qe = (e) => Object.keys(e || {}).filter((i) => z(e[i])).sort((i, t) => {
  const r = e[i] - e[t];
  return r !== 0 ? r : i.localeCompare(t);
}), Ki = (e, i) => {
  const t = e.breakpoints || {}, r = Qe(t);
  if (e.breakpoint)
    return X(t, e.breakpoint) || i.push($(
      "invalid-breakpoint",
      "warning",
      `Breakpoint "${e.breakpoint}" is not present in the breakpoint map.`,
      { details: { breakpoint: e.breakpoint } }
    )), e.breakpoint;
  if (r.length === 0)
    return i.push($(
      "invalid-breakpoint",
      "warning",
      "No breakpoints were provided; default dashboard layout will be used.",
      { details: { width: e.width } }
    )), fe;
  if (!z(e.width))
    return i.push($(
      "invalid-breakpoint",
      "warning",
      "Width is not a finite number; the smallest breakpoint was selected.",
      { details: { width: e.width, breakpoint: r[0] } }
    )), r[0];
  let o = r[0];
  for (let s = 1; s < r.length; s++) {
    const n = r[s];
    e.width > t[n] && (o = n);
  }
  return o;
}, qi = (e) => e === "desktop" || e === "mobile", Zi = (e, i, t) => {
  if (i.targetView)
    return { targetView: i.targetView, source: "explicit" };
  const r = i.targetViewRule;
  if (r != null && r.resolve)
    try {
      const s = r.resolve({
        width: i.width,
        requestedBreakpoint: e,
        breakpoints: i.breakpoints || {}
      });
      if (qi(s))
        return { targetView: s, source: "resolver" };
    } catch (s) {
      t.push($(
        "projection-validation-failed",
        "warning",
        "Target view resolver failed; fallback target view rules were used.",
        { details: { cause: s } }
      ));
    }
  if (Array.isArray(r == null ? void 0 : r.mobileBreakpointIds) && r.mobileBreakpointIds.indexOf(e) !== -1)
    return { targetView: "mobile", source: "breakpoint-id" };
  if (z(r == null ? void 0 : r.mobileMaxWidth) && z(i.width) && i.width <= r.mobileMaxWidth)
    return { targetView: "mobile", source: "width" };
  const o = e === "xs" || e === "xxs" ? "mobile" : "desktop";
  return t.push($(
    "target-view-default",
    "info",
    "Target view was inferred by the built-in default rule.",
    { details: { requestedBreakpoint: e, targetView: o } }
  )), { targetView: o, source: "default" };
}, Qi = (e, i, t, r) => z(e) || te(e) ? e : (i.push($(
  "settings-default",
  "info",
  "Dashboard grid setting margin was missing; default value was used.",
  { layoutId: t, profileId: r || void 0, path: "gridSettings.margin", details: { value: de } }
)), de), et = (e, i, t, r) => te(e) ? [e[0], e[1]] : (i.push($(
  "settings-default",
  "info",
  "Dashboard grid setting containerPadding was missing; default value was used.",
  { layoutId: t, profileId: r || void 0, path: "gridSettings.containerPadding", details: { value: we } }
)), we.slice()), it = (e, i, t, r, o) => {
  var n, a, l;
  const s = {
    ...e || {},
    ...i || {}
  };
  return typeof s.columns == "undefined" && t.push($(
    "settings-default",
    "info",
    "Dashboard grid setting columns was missing; default value was used.",
    { layoutId: r, profileId: o || void 0, path: "gridSettings.columns", details: { value: Ae } }
  )), typeof s.rowHeight == "undefined" && t.push($(
    "settings-default",
    "info",
    "Dashboard grid setting rowHeight was missing; default value was used.",
    { layoutId: r, profileId: o || void 0, path: "gridSettings.rowHeight", details: { value: Le } }
  )), {
    ...s,
    columns: C(s.columns, Ae),
    minColumns: C(s.minColumns, 1),
    margin: Qi(s.margin, t, r, o),
    outerMargin: (n = s.outerMargin) != null ? n : !0,
    containerPadding: et(s.containerPadding, t, r, o),
    viewFormat: s.viewFormat === "list" ? "list" : "grid",
    rowHeight: C(s.rowHeight, Le),
    autoFillHeight: (a = s.autoFillHeight) != null ? a : !1,
    heightMode: le(s.heightMode) ? s.heightMode : void 0,
    mobileHeightMode: le(s.mobileHeightMode) ? s.mobileHeightMode : void 0,
    minRowHeight: z(s.minRowHeight) && s.minRowHeight > 0 ? s.minRowHeight : void 0,
    mobileRowHeight: z(s.mobileRowHeight) && s.mobileRowHeight > 0 ? Math.floor(s.mobileRowHeight) : void 0,
    mobileAutoFillHeight: (l = s.mobileAutoFillHeight) != null ? l : !1,
    renderPrecision: Yi(s.renderPrecision) ? s.renderPrecision : "integer"
  };
}, G = (e = {}, i) => Object.prototype.hasOwnProperty.call(e, i);
function tt(e, i) {
  var c, p, v;
  const t = i.diagnostics, r = i.profileId ? `layouts.${i.layoutId}.profiles.${i.profileId}.gridSettings` : `layouts.${i.layoutId}.gridSettings`, o = i.targetView === "mobile", s = e.mobileAutoFillHeight === !0, n = e.autoFillHeight === !0, a = o && le(e.mobileHeightMode), l = le(e.heightMode);
  l && n && e.heightMode !== "fit" && t.push($(
    "mode-alias-conflict",
    "warning",
    "Explicit dashboard heightMode overrides autoFillHeight.",
    {
      layoutId: i.layoutId,
      profileId: i.profileId || void 0,
      targetView: i.targetView,
      path: `${r}.heightMode`,
      details: { heightMode: e.heightMode, autoFillHeight: e.autoFillHeight }
    }
  )), a && s && e.mobileHeightMode !== "fit" && t.push($(
    "mode-alias-conflict",
    "warning",
    "Explicit dashboard mobileHeightMode overrides mobileAutoFillHeight.",
    {
      layoutId: i.layoutId,
      profileId: i.profileId || void 0,
      targetView: i.targetView,
      path: `${r}.mobileHeightMode`,
      details: { mobileHeightMode: e.mobileHeightMode, mobileAutoFillHeight: e.mobileAutoFillHeight }
    }
  ));
  const f = a ? e.mobileHeightMode : l ? e.heightMode : (o && !a && s || !l && n ? "fit" : void 0) || "auto", g = o && z(e.mobileRowHeight) && e.mobileRowHeight > 0 ? e.mobileRowHeight : e.rowHeight, m = {
    heightMode: f,
    rowHeight: g,
    minRowHeight: e.minRowHeight,
    renderPrecision: e.renderPrecision || "integer"
  }, u = i.explicit;
  return G(u, "heightMode") && (m.heightMode = (c = u == null ? void 0 : u.heightMode) != null ? c : null), G(u, "rowHeight") && (m.rowHeight = u == null ? void 0 : u.rowHeight), G(u, "minRowHeight") && (m.minRowHeight = u == null ? void 0 : u.minRowHeight), G(u, "containerHeight") && (m.containerHeight = (p = u == null ? void 0 : u.containerHeight) != null ? p : null), G(u, "autoMeasureContainerHeight") && (m.autoMeasureContainerHeight = u == null ? void 0 : u.autoMeasureContainerHeight), G(u, "renderPrecision") && (m.renderPrecision = (v = u == null ? void 0 : u.renderPrecision) != null ? v : null), m;
}
const ei = (e, i) => {
  const t = {
    i: e,
    x: i.col,
    y: i.row,
    w: i.sizeX,
    h: i.sizeY
  };
  return typeof i.minSizeX != "undefined" && (t.minW = i.minSizeX), typeof i.minSizeY != "undefined" && (t.minH = i.minSizeY), typeof i.maxSizeX != "undefined" && (t.maxW = i.maxSizeX), typeof i.maxSizeY != "undefined" && (t.maxH = i.maxSizeY), typeof i.static != "undefined" && (t.static = i.static), typeof i.draggable != "undefined" && (t.isDraggable = i.draggable), typeof i.resizable != "undefined" && (t.isResizable = i.resizable), typeof i.bounded != "undefined" && (t.isBounded = i.bounded), i.resizeHandles && (t.resizeHandles = i.resizeHandles.slice()), t;
}, ce = (e, i) => e.y !== i.y ? e.y - i.y : e.x !== i.x ? e.x - i.x : e.i < i.i ? -1 : e.i > i.i ? 1 : 0, ii = (e, i) => e.item.row !== i.item.row ? e.item.row - i.item.row : e.item.col !== i.item.col ? e.item.col - i.item.col : e.id < i.id ? -1 : e.id > i.id ? 1 : 0, Ve = (e) => z(e) && e >= 0, rt = (e, i, t) => {
  if (e === "mobile") {
    const r = i.item.mobileOrder, o = t.item.mobileOrder, s = Ve(r), n = Ve(o);
    if (s && n && r !== o) return r - o;
    if (s !== n) return s ? -1 : 1;
  }
  return ii(i, t);
}, ot = (e, i) => ({
  ...e,
  ...i || {}
}), st = (e) => ({
  col: C(e.col, 0),
  row: C(e.row, 0),
  sizeX: C(e.sizeX, 1),
  sizeY: C(e.sizeY, 1),
  ...e
}), ti = (e, i) => i === "mobile" ? e.mobileHide === !0 : e.desktopHide === !0, nt = (e, i, t, r, o) => {
  e && (Wi.forEach((s) => {
    t && typeof t[s] != "undefined" && o.push($(
      "unsupported-profile-field",
      "info",
      `Profile grid setting ${s} is preserved but not directly mapped to the base grid runtime in this version.`,
      { layoutId: i, profileId: e, path: `layouts.${i}.profiles.${e}.gridSettings.${s}` }
    ));
  }), r.forEach((s) => {
    _i.forEach((n) => {
      typeof s.item[n] != "undefined" && o.push($(
        "item-capability.sidecar-projected",
        "info",
        `Profile item field ${n} was projected through capability sidecar and not written to LayoutItem.`,
        {
          layoutId: i,
          profileId: e,
          itemId: s.id,
          path: `layouts.${i}.profiles.${e}.widgets.${s.id}.${n}`
        }
      ));
    });
  }));
}, at = (e, i, t, r, o) => {
  var a;
  const s = i ? (a = e.profiles) == null ? void 0 : a[i] : void 0, n = {};
  return Object.keys(e.widgets).sort().forEach((l) => {
    var d;
    n[l] = ot(e.widgets[l], (d = s == null ? void 0 : s.widgets) == null ? void 0 : d[l]);
  }), s != null && s.widgets && Object.keys(s.widgets).sort().forEach((l) => {
    X(e.widgets, l) || (r.push($(
      "unknown-profile-item",
      "warning",
      `Dashboard profile "${i}" contains unknown widget "${l}".`,
      {
        layoutId: o,
        profileId: i || void 0,
        itemId: l,
        path: `layouts.${o}.profiles.${i}.widgets.${l}`
      }
    )), t.allowUnknownProfileItems && (n[l] = st(s.widgets[l])));
  }), Object.keys(n).map((l) => ({ id: l, item: n[l] })).sort(ii);
}, $e = (e, i) => {
  const t = {};
  return Object.keys(e || {}).forEach((r) => {
    t[r] = { ...e[r] };
  }), Object.keys(i || {}).forEach((r) => {
    t[r] = {
      ...t[r] || {},
      ...i[r]
    };
  }), t;
}, dt = (e, i, t, r) => {
  const o = [], s = e.map((d) => d.id), n = [], a = $e(r, void 0);
  e.forEach((d) => {
    const f = ti(d.item, i);
    f && o.push(d.id);
    const g = { ...a[d.id] || {} };
    f ? g.visible = !1 : typeof g.visible == "undefined" && (g.visible = !0), a[d.id] = g, !(t === "view" && f) && n.push(ei(d.id, d.item));
  }), n.sort(ce);
  const l = t === "view" ? s.filter((d) => o.indexOf(d) === -1) : s.slice();
  return {
    layout: n,
    allItemIds: s,
    activeItemIds: l,
    renderItemIds: l.slice(),
    hiddenItemIds: o,
    editorMetaById: a
  };
}, lt = (e, i, t, r, o) => i === "mobile" && z(e.item.mobileHeight) && e.item.mobileHeight > 0 ? (t.push($(
  "list-height-source",
  "info",
  "Mobile list item height was derived from mobileHeight.",
  { layoutId: r, profileId: o || void 0, itemId: e.id, details: { source: "mobileHeight" } }
)), Math.floor(e.item.mobileHeight)) : z(e.item.sizeY) && e.item.sizeY > 0 ? (t.push($(
  "list-height-source",
  "info",
  "List item height was derived from sizeY.",
  { layoutId: r, profileId: o || void 0, itemId: e.id, details: { source: "sizeY" } }
)), Math.floor(e.item.sizeY)) : (t.push($(
  "list-height-default",
  "warning",
  "List item height was invalid; default height 1 was used.",
  { layoutId: r, profileId: o || void 0, itemId: e.id, details: { source: "default" } }
)), 1), ct = (e, i, t, r, o, s, n, a) => {
  const l = e.slice().sort((p, v) => rt(i, p, v)), d = [], f = l.map((p) => p.id), g = [], m = $e(o, void 0);
  let u = 0;
  l.forEach((p) => {
    const v = ti(p.item, i);
    v && d.push(p.id);
    const k = { ...m[p.id] || {} };
    v ? k.visible = !1 : typeof k.visible == "undefined" && (k.visible = !0), m[p.id] = k;
    const D = lt(p, i, s, n, a);
    t === "view" && v || (g.push({
      ...ei(p.id, p.item),
      x: 0,
      y: u,
      w: r,
      h: D
    }), u += D);
  });
  const c = t === "view" ? f.filter((p) => d.indexOf(p) === -1) : f.slice();
  return {
    layout: g,
    allItemIds: f,
    activeItemIds: c,
    renderItemIds: c.slice(),
    hiddenItemIds: d,
    editorMetaById: m
  };
}, ut = (e) => W(e) && typeof e.primaryLayoutId == "string" ? e.primaryLayoutId : null, ri = (e, i) => `layouts.${e}.profiles.${i}`, ft = (e, i, t) => {
  var o;
  const r = ri(i, t);
  return e.profileId === t || e.path === r || !!((o = e.path) != null && o.startsWith(`${r}.`));
}, gt = (e, i, t) => {
  try {
    const r = ve(e);
    if (!W(r) || !W(r.layouts)) return null;
    const o = r.layouts[i];
    return !W(o) || !W(o.profiles) || !X(o.profiles, t) ? null : (delete o.profiles[t], Object.keys(o.profiles).length === 0 && delete o.profiles, r);
  } catch (r) {
    return null;
  }
}, mt = (e, i, t, r) => {
  var f, g;
  const o = x(e, { validation: (f = t.validation) != null ? f : "strict" });
  if (o.ok)
    return r.push(...o.diagnostics), {
      ok: !0,
      document: o.document,
      invalidProfileFallback: !1,
      profileFallbackReported: !1
    };
  const s = ut(e), n = t.layoutId && t.layoutId === s ? t.layoutId : s, d = !!(n && i !== fe) && o.diagnostics.some((m) => ft(m, n, i)) ? gt(e, n, i) : null;
  if (d) {
    const m = x(d, { validation: (g = t.validation) != null ? g : "strict" });
    if (m.ok)
      return r.push($(
        "profile-fallback",
        "warning",
        `Dashboard profile "${i}" is invalid; resolved primary layout.`,
        {
          layoutId: n,
          profileId: i,
          path: ri(n, i),
          details: {
            reason: o.error.message,
            diagnostics: o.diagnostics
          }
        }
      )), r.push(...m.diagnostics), {
        ok: !0,
        document: m.document,
        invalidProfileFallback: !0,
        profileFallbackReported: !0
      };
  }
  return r.push(...o.diagnostics), r.push($(
    "projection-validation-failed",
    "error",
    o.error.message,
    { path: o.error.path, details: o.error.details }
  )), { ok: !1, error: o.error };
};
function Et(e, i) {
  var P, O, w, y, B, R, T, A, ge;
  const t = [], r = Ki(i, t), o = i.mode || "view", s = Zi(r, i, t), n = mt(
    e,
    r,
    i,
    t
  );
  if (!n.ok)
    return { ok: !1, error: n.error, diagnostics: t };
  const a = n.document;
  let l = n.invalidProfileFallback, d = i.layoutId || a.primaryLayoutId;
  d !== a.primaryLayoutId && (l = !0, d = a.primaryLayoutId);
  const f = a.layouts[d], g = (P = f.profiles) == null ? void 0 : P[r], m = g ? r : null;
  g || (l = !0, n.profileFallbackReported || t.push($(
    "profile-fallback",
    "warning",
    `Dashboard profile "${r}" was not found; resolved primary layout.`,
    { layoutId: d, profileId: r, path: `layouts.${d}.profiles.${r}` }
  )));
  const u = Je(a, {
    layoutId: d,
    profileId: m || void 0,
    targetView: s.targetView,
    validation: (O = i.validation) != null ? O : "strict"
  });
  if (!u.ok)
    return t.push(...u.diagnostics), t.push($(
      "projection-validation-failed",
      "error",
      u.error.message,
      { path: u.error.path, details: u.error.details }
    )), { ok: !1, error: u.error, diagnostics: t };
  t.push(...u.diagnostics);
  const c = at(f, m, i, t, d), p = it(
    f.gridSettings,
    m ? (y = (w = f.profiles) == null ? void 0 : w[m]) == null ? void 0 : y.gridSettings : void 0,
    t,
    d,
    m
  );
  nt(
    m,
    d,
    m ? (R = (B = f.profiles) == null ? void 0 : B[m]) == null ? void 0 : R.gridSettings : void 0,
    c,
    t
  );
  const v = $e(
    u.projection.editorMetaById,
    m ? (ge = (A = (T = f.profiles) == null ? void 0 : T[m]) == null ? void 0 : A.editor) == null ? void 0 : ge.editorMetaById : void 0
  ), k = p.viewFormat, D = k === "list" ? ct(
    c,
    s.targetView,
    o,
    p.columns,
    v,
    t,
    d,
    m
  ) : dt(c, s.targetView, o, v), j = tt(p, {
    targetView: s.targetView,
    diagnostics: t,
    layoutId: d,
    profileId: m
  }), b = Ji(
    D.layout,
    p,
    j,
    {
      layoutId: d,
      resolvedProfileId: m,
      targetView: s.targetView
    }
  ), S = b.diagnostics.map(
    (_) => Gi(_, {
      layoutId: d,
      resolvedProfileId: m,
      targetView: s.targetView
    })
  );
  return t.push(...S), {
    ok: !0,
    runtime: {
      layout: D.layout,
      gridSettings: p,
      editorMetaById: D.editorMetaById,
      capabilitiesById: u.projection.capabilitiesById,
      resizeConstraintsById: u.projection.resizeConstraintsById,
      layoutId: d,
      requestedBreakpoint: r,
      resolvedProfileId: m,
      targetView: s.targetView,
      targetViewSource: s.source,
      mode: o,
      viewFormat: k,
      heightOptions: j,
      heightRuntime: b,
      fallbackApplied: l || u.projection.fallbackApplied,
      allItemIds: D.allItemIds,
      activeItemIds: D.activeItemIds,
      renderItemIds: D.renderItemIds,
      hiddenItemIds: D.hiddenItemIds,
      diagnostics: t
    },
    diagnostics: t
  };
}
const ht = (e) => Ie(e).sort(ce), pt = (e, i, t, r, o, s) => {
  for (let n = 0; n < e.length; n++) {
    const a = e[n];
    if (!z(a.x) || !z(a.y) || !z(a.w) || !z(a.h) || a.w <= 0 || a.h <= 0)
      return J("validation", `Runtime layout item "${a.i}" has invalid geometry.`, {
        path: `layout.${n}`,
        details: { item: a }
      });
    if (!X(i.widgets, a.i) && !t.createMissingItems)
      return r.push($(
        "unknown-profile-item",
        "error",
        `Runtime layout contains unknown dashboard widget "${a.i}".`,
        { layoutId: o, profileId: s || void 0, itemId: a.i }
      )), J("unknown-item", `Runtime layout contains unknown dashboard widget "${a.i}".`, {
        details: { itemId: a.i }
      });
  }
  return null;
}, oi = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return typeof e.minW != "undefined" && (i.minSizeX = e.minW), typeof e.minH != "undefined" && (i.minSizeY = e.minH), typeof e.maxW != "undefined" && (i.maxSizeX = e.maxW), typeof e.maxH != "undefined" && (i.maxSizeY = e.maxH), i;
};
function Ot(e, i, t, r = {}) {
  var H, P, O, w;
  const o = [], s = r.mode || i.mode, n = r.targetView || i.targetView, a = r.viewFormat || i.viewFormat, l = r.requestedBreakpoint || i.requestedBreakpoint;
  let d = typeof r.resolvedProfileId != "undefined" ? r.resolvedProfileId : i.resolvedProfileId;
  const f = x(e, { validation: (H = r.validation) != null ? H : "strict" });
  o.push(...f.diagnostics);
  const g = f.ok ? f.document : ve(e);
  if (!f.ok)
    return o.push($(
      "projection-validation-failed",
      "error",
      f.error.message,
      { path: f.error.path, details: f.error.details }
    )), {
      ok: !1,
      error: f.error,
      document: g,
      originalPayload: f.originalPayload,
      diagnostics: o
    };
  if (i.fallbackApplied && !d && l !== fe) {
    if (s === "view")
      return o.push($(
        "write-back-noop",
        "info",
        "Fallback view runtime is read-only; no dashboard profile was created.",
        { layoutId: i.layoutId, profileId: l }
      )), {
        ok: !0,
        document: f.document,
        diagnostics: o
      };
    if (!r.createMissingProfileOnEdit) {
      const y = $(
        "missing-profile-write-blocked",
        "error",
        `Dashboard profile "${l}" is missing; profile-scoped write-back was blocked.`,
        { layoutId: i.layoutId, profileId: l }
      );
      return o.push(y), {
        ok: !1,
        error: J("validation", y.message, { path: `layouts.${i.layoutId}.profiles.${l}` }),
        document: f.document,
        diagnostics: o
      };
    }
    d = l;
  }
  if (a === "grid") {
    const y = Ke(e, {
      layout: t,
      editorMetaById: r.editorMetaById || i.editorMetaById
    }, {
      layoutId: r.layoutId || i.layoutId,
      profileId: d || void 0,
      targetView: n,
      createMissingItems: r.createMissingItems,
      removeMissingItems: r.removeMissingItems,
      createMissingProfile: !!r.createMissingProfileOnEdit,
      writeItemIds: r.writeItemIds,
      validation: (P = r.validation) != null ? P : "strict"
    });
    return {
      ...y,
      diagnostics: o.concat(y.diagnostics)
    };
  }
  const m = ve(f.document), u = r.layoutId || i.layoutId || m.primaryLayoutId, c = m.layouts[u];
  if (!c) {
    const y = $(
      "projection-validation-failed",
      "error",
      `Dashboard layout "${u}" was not found.`,
      { layoutId: u }
    );
    return o.push(y), {
      ok: !1,
      error: J("invalid-document", y.message, { path: `layouts.${u}` }),
      document: m,
      diagnostics: o
    };
  }
  const p = Ci(r.writeItemIds), v = new Set(t.map((y) => y.i)), k = ht(t), D = p ? k.filter((y) => p(y.i)) : k, j = pt(D, c, r, o, u, d);
  if (j)
    return {
      ok: !1,
      error: j,
      document: m,
      diagnostics: o
    };
  let b;
  if (d) {
    if (c.profiles = c.profiles || {}, !c.profiles[d]) {
      if (!r.createMissingProfileOnEdit) {
        const y = $(
          "missing-profile-write-blocked",
          "error",
          `Dashboard profile "${d}" is missing; profile-scoped write-back was blocked.`,
          { layoutId: u, profileId: d }
        );
        return o.push(y), {
          ok: !1,
          error: J("validation", y.message, { path: `layouts.${u}.profiles.${d}` }),
          document: m,
          diagnostics: o
        };
      }
      c.profiles[d] = { widgets: {} };
    }
    c.profiles[d].widgets = c.profiles[d].widgets || {}, b = c.profiles[d].widgets;
  } else
    b = c.widgets;
  r.removeMissingItems && ((O = r.writeItemIds) != null && O.length) && r.writeItemIds.filter(Boolean).forEach((y) => {
    var B;
    v.has(y) || (delete c.widgets[y], delete b[y], Object.values(c.profiles || {}).forEach((R) => {
      var T;
      R.widgets && delete R.widgets[y], (T = R.editor) != null && T.editorMetaById && delete R.editor.editorMetaById[y];
    }), (B = c.editor) != null && B.editorMetaById && delete c.editor.editorMetaById[y]);
  }), k.forEach((y, B) => {
    if (p && !p(y.i)) return;
    X(c.widgets, y.i) || (c.widgets[y.i] = oi(y));
    const R = b[y.i] || {};
    n === "mobile" ? b[y.i] = {
      ...R,
      mobileOrder: B,
      mobileHeight: y.h
    } : b[y.i] = {
      ...R,
      row: B,
      sizeY: y.h
    };
  });
  const S = x(m, { validation: (w = r.validation) != null ? w : "strict" });
  return o.push(...S.diagnostics), S.ok ? {
    ok: !0,
    document: S.document,
    diagnostics: o
  } : {
    ok: !1,
    error: S.error,
    document: m,
    originalPayload: e,
    diagnostics: o
  };
}
const Te = (e, i) => e == null || Array.isArray(e) ? e : typeof e == "object" && X(e, i) ? e[i] || void 0 : e, yt = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return typeof e.minW != "undefined" && (i.minSizeX = e.minW), typeof e.minH != "undefined" && (i.minSizeY = e.minH), typeof e.maxW != "undefined" && (i.maxSizeX = e.maxW), typeof e.maxH != "undefined" && (i.maxSizeY = e.maxH), typeof e.static != "undefined" && (i.static = e.static), typeof e.isDraggable != "undefined" && (i.draggable = e.isDraggable), typeof e.isResizable != "undefined" && (i.resizable = e.isResizable), typeof e.isBounded != "undefined" && (i.bounded = e.isBounded), e.resizeHandles && (i.resizeHandles = e.resizeHandles.slice()), i;
}, bt = (e) => oi(e), Ne = (e, i, t) => {
  var a;
  const r = {}, o = (a = i.cols) == null ? void 0 : a[e];
  z(o) && o > 0 ? r.columns = o : i.cols && t.push($(
    "legacy-responsive-deferred",
    "warning",
    `Responsive cols for breakpoint "${e}" are missing; dashboard default columns will apply.`,
    { profileId: e, path: `cols.${e}` }
  ));
  const s = Te(i.margin, e);
  (z(s) || te(s)) && (r.margin = s);
  const n = Te(i.containerPadding, e);
  return te(n) && (r.containerPadding = [n[0], n[1]]), r;
};
function Rt(e) {
  const i = [], t = Qe(e.breakpoints), r = Object.keys(e.layouts || {}).sort(), o = e.defaultBreakpoint || (t.length > 0 ? t[t.length - 1] : r[0] || fe), s = e.layouts[o] || [];
  e.layouts[o] || i.push($(
    "legacy-responsive-deferred",
    "warning",
    `Default responsive layout "${o}" was not present; an empty dashboard layout was created.`,
    { profileId: o, path: `layouts.${o}` }
  ));
  const n = {};
  Ie(s).sort(ce).forEach((d) => {
    n[d.i] = yt(d);
  });
  const a = {
    widgets: n,
    gridSettings: Ne(o, e, i),
    profiles: {}
  }, l = [];
  Object.keys(e.layouts || {}).sort((d, f) => {
    const g = z(e.breakpoints[d]) ? e.breakpoints[d] : Number.MAX_SAFE_INTEGER, m = z(e.breakpoints[f]) ? e.breakpoints[f] : Number.MAX_SAFE_INTEGER, u = g - m;
    return u !== 0 ? u : d.localeCompare(f);
  }).forEach((d) => {
    if (d === o) return;
    const f = {};
    Ie(e.layouts[d] || []).sort(ce).forEach((g) => {
      X(n, g.i) || i.push($(
        "legacy-responsive-deferred",
        "warning",
        `Responsive layout "${d}" contains widget "${g.i}" that is absent from the default dashboard layout.`,
        {
          profileId: d,
          itemId: g.i,
          path: `layouts.${d}.${g.i}`,
          details: {
            reason: "profile-only-widget",
            defaultBreakpoint: o
          }
        }
      )), f[g.i] = bt(g);
    }), a.profiles[d] = {
      widgets: f,
      gridSettings: Ne(d, e, i)
    }, l.push(d);
  }), a.profiles && Object.keys(a.profiles).length === 0 && delete a.profiles;
  try {
    return {
      ok: !0,
      document: Ge(a, {
        key: e.key,
        sourceId: e.sourceId
      }),
      defaultBreakpoint: o,
      profileIds: l,
      diagnostics: i
    };
  } catch (d) {
    return {
      ok: !1,
      diagnostics: i,
      error: J("validation", "Responsive layouts could not be converted to a dashboard document.", { cause: d })
    };
  }
}
const ue = (e) => JSON.parse(JSON.stringify(e)), ee = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
}), q = (e, i, t, r = {}) => ({
  code: e,
  level: i,
  message: t,
  ...r
}), _e = (e) => ({
  ...e,
  cols: e.columns,
  columns: e.columns,
  minColumns: e.minColumns,
  maxRows: typeof e.maxRows == "number" ? e.maxRows : void 0
}), wt = (e, i = 12) => {
  const t = e == null ? void 0 : e.columns;
  return typeof t == "number" && Number.isFinite(t) && t > 0 ? Math.floor(t) : i;
}, si = (e, i = {}) => ({
  cols: wt(e),
  maxRows: typeof e.maxRows == "number" ? e.maxRows : 1 / 0,
  compactType: null,
  allowOverlap: !1,
  preventCollision: !0,
  diagnostics: { debug: !0 },
  ...i
}), We = (e, i) => ({
  ...e,
  ...i || {}
}), vt = (e) => {
  const i = /* @__PURE__ */ new Set();
  return e.affectedIds.forEach((t) => i.add(t)), e.patches.forEach((t) => {
    t.type === "add" ? i.add(t.item.i) : t.type === "compact" ? t.affectedIds.forEach((r) => i.add(r)) : i.add(t.id);
  }), i;
}, It = (e, i, t) => q(
  e.code,
  e.level,
  e.message,
  {
    layoutId: i,
    profileId: t || void 0,
    itemId: e.itemId,
    path: e.itemId ? `layouts.${i}.${t ? `profiles.${t}.` : ""}widgets.${e.itemId}` : t ? `layouts.${i}.profiles.${t}.gridSettings` : `layouts.${i}.gridSettings`,
    details: {
      reason: e.reason,
      before: e.before,
      after: e.after,
      details: e.details
    }
  }
), ni = (e, i, t) => {
  var o;
  const r = [];
  return (((o = e.diagnostics) == null ? void 0 : o.details) || []).forEach((s) => {
    r.push(It(s, i, t));
  }), e.status === "blocked" && e.blocked && r.push(q("layout-operation-blocked", "error", `Layout operation was blocked: ${e.blocked.reason}.`, {
    layoutId: i,
    profileId: t || void 0,
    details: e.blocked
  })), e.status === "error" && e.error && r.push(q("layout-operation-error", "error", e.error.message, {
    layoutId: i,
    profileId: t || void 0,
    details: e.error.cause
  })), r;
}, Se = (e, i, t) => {
  var r, o;
  return t ? !!((o = (r = e.layouts[i]) == null ? void 0 : r.profiles) != null && o[t]) : !0;
}, ai = (e, i, t) => {
  const r = vt(i), o = t.profileId ? i.layout.filter((s) => r.has(s.i)) : i.layout;
  return Ke(e, {
    layout: o,
    gridSettings: t.nextSettings
  }, {
    layoutId: t.layoutId,
    profileId: t.profileId || void 0,
    createMissingProfile: t.createMissingProfile,
    validation: t.validation
  });
}, di = (e, i) => Je(e, {
  layoutId: i.layoutId,
  profileId: Se(e, i.layoutId, i.profileId) && i.profileId || void 0,
  allowNonPrimary: !0,
  validation: i.validation
});
function jt(e, i) {
  var p, v;
  const t = x(e, { validation: (p = i.validation) != null ? p : "strict" }), r = t.ok ? ue(t.document) : ue(e), o = t.diagnostics.slice();
  if (!t.ok)
    return {
      ok: !1,
      document: r,
      error: t.error,
      diagnostics: o
    };
  const s = t.document, n = i.layoutId || s.primaryLayoutId;
  if (!s.layouts[n]) {
    const k = q("invalid-document", "error", `Dashboard layout "${n}" was not found.`, { layoutId: n });
    return {
      ok: !1,
      document: r,
      error: ee("invalid-document", k.message, { path: `layouts.${n}` }),
      diagnostics: o.concat(k)
    };
  }
  const l = i.profileId || null;
  if (l && !Se(s, n, l) && !i.createMissingProfile) {
    const k = q("profile-fallback", "error", `Dashboard profile "${l}" was not found; profile migration was blocked.`, {
      layoutId: n,
      profileId: l
    });
    return {
      ok: !1,
      document: r,
      error: ee("validation", k.message, { path: `layouts.${n}.profiles.${l}` }),
      diagnostics: o.concat(k)
    };
  }
  const d = di(s, {
    layoutId: n,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  if (o.push(...d.diagnostics), !d.ok)
    return {
      ok: !1,
      document: r,
      error: d.error,
      diagnostics: o
    };
  const f = We(
    d.projection.gridSettings,
    i.previousSettings
  ), g = We(
    d.projection.gridSettings,
    i.nextSettings
  ), m = {
    ...i.nextSettings
  }, u = fi(d.projection.layout, {
    previousSettings: _e(f),
    nextSettings: _e(g),
    policy: i.policy,
    engineOptions: si(d.projection.gridSettings),
    id: `dashboard-migrate-${n}${l ? `-${l}` : ""}`,
    phase: "commit",
    debug: !0
  });
  if (o.push(...ni(u, n, l)), u.status === "blocked" || u.status === "error")
    return {
      ok: !1,
      document: r,
      operation: u,
      error: ee((u.status === "error", "validation"), ((v = u.error) == null ? void 0 : v.message) || "Dashboard layout settings migration failed."),
      diagnostics: o
    };
  const c = ai(s, u, {
    layoutId: n,
    profileId: l,
    nextSettings: m,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  return o.push(...c.diagnostics), c.ok ? {
    ok: !0,
    document: c.document,
    operation: u,
    diagnostics: o
  } : {
    ok: !1,
    document: r,
    operation: u,
    error: c.error,
    diagnostics: o
  };
}
const li = (e, i, t) => {
  var m, u;
  const r = x(e, { validation: (m = i.validation) != null ? m : "strict" }), o = r.ok ? ue(r.document) : ue(e), s = r.diagnostics.slice();
  if (!r.ok)
    return { ok: !1, document: o, error: r.error, diagnostics: s };
  const n = r.document, a = i.layoutId || n.primaryLayoutId, l = i.profileId || null;
  if (l && !Se(n, a, l) && !i.createMissingProfile) {
    const c = q("profile-fallback", "error", `Dashboard profile "${l}" was not found; geometry operation was blocked.`, {
      layoutId: a,
      profileId: l
    });
    return {
      ok: !1,
      document: o,
      error: ee("validation", c.message, { path: `layouts.${a}.profiles.${l}` }),
      diagnostics: s.concat(c)
    };
  }
  const d = di(n, {
    layoutId: a,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  if (s.push(...d.diagnostics), !d.ok)
    return { ok: !1, document: o, error: d.error, diagnostics: s };
  const f = t(
    d.projection.layout,
    si(d.projection.gridSettings)
  );
  if (s.push(...ni(f, a, l)), f.status === "blocked" || f.status === "error")
    return {
      ok: !1,
      document: o,
      operation: f,
      error: ee("validation", ((u = f.error) == null ? void 0 : u.message) || "Dashboard geometry operation failed."),
      diagnostics: s
    };
  const g = ai(n, f, {
    layoutId: a,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  return s.push(...g.diagnostics), g.ok ? { ok: !0, document: g.document, operation: f, diagnostics: s } : { ok: !1, document: o, operation: f, error: g.error, diagnostics: s };
};
function Bt(e, i = {}) {
  return li(
    e,
    i,
    (t, r) => gi(t, {
      policy: i.policy,
      engineOptions: r,
      id: "dashboard-repair",
      phase: "commit",
      debug: !0
    })
  );
}
function Ft(e, i) {
  return li(
    e,
    i,
    (t, r) => mi(t, {
      dx: i.dx,
      dy: i.dy,
      clampNegative: i.clampNegative,
      policy: i.policy,
      engineOptions: r,
      id: "dashboard-translate",
      phase: "commit",
      debug: !0
    })
  );
}
export {
  Ze as D,
  oe as a,
  Rt as b,
  Dt as c,
  Gi as d,
  $ as e,
  Ht as f,
  Mt as g,
  Pt as h,
  zt as i,
  jt as j,
  tt as k,
  Et as l,
  ji as m,
  Ke as n,
  Je as p,
  Bt as r,
  Ge as s,
  Ft as t,
  x as v,
  Ot as w
};
