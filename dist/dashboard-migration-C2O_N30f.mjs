import { r as ci } from "./resolve-C3SqJijI.mjs";
import { F as Ce } from "./commands-Q0wgqPfi.mjs";
import { j as ui, m as fi, r as gi, t as mi } from "./migration-CPonYzEY.mjs";
const oe = 1, ne = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), hi = ["s", "w", "e", "n", "sw", "nw", "se", "ne"], pi = [
  "desktopHide",
  "mobileHide",
  "mobileHeight",
  "mobileOrder"
], yi = [
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
], bi = [
  "widgets",
  "gridSettings",
  "breakpoints"
], wi = [
  "widgetLayouts",
  "widgets",
  "gridSettings"
], ee = (e, i) => Object.prototype.hasOwnProperty.call(e, i), I = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const i = Object.getPrototypeOf(e);
  return i === Object.prototype || i === null;
}, vi = (e) => I(e), ie = (e) => typeof e == "number" && Number.isFinite(e), Ii = (e) => Number.isInteger(e) && e > 0, Z = (e) => typeof e == "string" && e.trim() !== "", ki = (e) => {
  const i = Date.parse(e);
  return Number.isFinite(i);
}, $i = (e) => typeof e == "string" && hi.indexOf(e) !== -1, Si = (e) => e === "auto" || e === "scroll" || e === "fit" || e === "fixed", Di = (e) => e === "integer" || e === "subpixel", h = (e, i, t, r = {}) => ({
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
  const o = [], n = (l) => (o.push(h("non-json-extension", "error", l, { path: t })), i === "sanitize" ? (o[o.length - 1].level = "warning", { ok: !0, value: void 0, diagnostics: o }) : { ok: !1, diagnostics: o });
  if (e == null || typeof e == "string" || typeof e == "boolean")
    return { ok: !0, value: e, diagnostics: o };
  if (typeof e == "number")
    return Number.isFinite(e) ? { ok: !0, value: e, diagnostics: o } : n("Dashboard JSON fields must not contain non-finite numbers.");
  if (typeof e == "bigint" || typeof e == "function" || typeof e == "symbol")
    return n("Dashboard JSON fields must not contain runtime values.");
  if (Array.isArray(e)) {
    if (r.indexOf(e) !== -1) return n("Dashboard JSON fields must not contain circular references.");
    const l = [], d = r.concat(e);
    for (let f = 0; f < e.length; f++) {
      const g = L(e[f], i, `${t}[${f}]`, d);
      if (o.push(...g.diagnostics), !g.ok) return { ok: !1, diagnostics: o };
      l.push(typeof g.value == "undefined" ? null : g.value);
    }
    return { ok: !0, value: l, diagnostics: o };
  }
  if (!I(e))
    return n("Dashboard JSON fields must contain plain JSON objects only.");
  if (r.indexOf(e) !== -1) return n("Dashboard JSON fields must not contain circular references.");
  const s = {}, a = r.concat(e);
  for (const l of Object.keys(e)) {
    if (ne.has(l)) {
      const f = h("unsafe-key", i === "sanitize" ? "warning" : "error", "Dashboard JSON fields contain a reserved key.", {
        path: `${t}.${l}`
      });
      if (o.push(f), i !== "sanitize") return { ok: !1, diagnostics: o };
      continue;
    }
    const d = L(e[l], i, t ? `${t}.${l}` : l, a);
    if (o.push(...d.diagnostics), !d.ok) return { ok: !1, diagnostics: o };
    typeof d.value != "undefined" && (s[l] = d.value);
  }
  return { ok: !0, value: s, diagnostics: o };
}, Hi = (e, i, t) => {
  const r = L(e, i, t);
  if (!r.ok) return r;
  if (!vi(r.value)) {
    const o = h("non-json-extension", i === "sanitize" ? "warning" : "error", "Dashboard field must be a JSON-safe object.", { path: t });
    return i === "sanitize" ? { ok: !0, value: {}, diagnostics: r.diagnostics.concat(o) } : { ok: !1, diagnostics: r.diagnostics.concat(o) };
  }
  return { ok: !0, value: r.value, diagnostics: r.diagnostics };
}, $t = (e, i = {}) => {
  var r;
  const t = L(e, (r = i.validation) != null ? r : "strict", "value");
  if (!t.ok) throw ke("Dashboard JSON value could not be cloned.", t.diagnostics);
  return t.value;
}, se = (e, i = "strict") => {
  const t = L(e, i, "document");
  if (!t.ok) throw ke("Dashboard document could not be cloned.", t.diagnostics);
  return t.value;
}, zi = () => {
  const e = typeof globalThis != "undefined" ? globalThis.crypto : void 0;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `dashboard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}, Mi = () => `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, Pi = (e) => {
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
}, q = (e, i, t, r, o, n = {}) => {
  const s = e[t];
  return typeof s == "undefined" ? n.required ? h("invalid-item-geometry", "error", `${r}.${t} is required.`, { path: `${r}.${t}` }) : null : ie(s) ? typeof n.min == "number" && s < n.min ? o === "sanitize" && typeof n.clampMin == "number" ? (i[t] = Math.max(n.clampMin, s), h("invalid-item-geometry", "warning", `Clamped ${r}.${t}.`, { path: `${r}.${t}` })) : h("invalid-item-geometry", "error", `${r}.${t} is outside the supported range.`, { path: `${r}.${t}` }) : (i[t] = s, null) : h("invalid-item-geometry", "error", `${r}.${t} must be a finite number.`, { path: `${r}.${t}` });
}, he = (e, i, t, r, o) => {
  const n = e[t];
  return typeof n == "undefined" ? null : !ie(n) || n <= 0 ? o === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${r}.${t}` })) : h("validation", "error", `${r}.${t} must be a finite positive number.`, { path: `${r}.${t}` }) : (i[t] = n, null);
}, Ye = (e, i, t, r, o) => typeof e[t] == "undefined" ? null : typeof e[t] != "boolean" ? o === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${r}.${t}` })) : h("validation", "error", `${r}.${t} must be a boolean.`, { path: `${r}.${t}` }) : (i[t] = e[t], null), pe = (e, i, t, r, o) => typeof e[t] == "undefined" ? null : typeof e[t] != "string" ? o === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${r}.${t}` })) : h("validation", "error", `${r}.${t} must be a string.`, { path: `${r}.${t}` }) : (i[t] = e[t], null), J = (e, i, t, r, o) => {
  if (typeof e[t] == "undefined") return [];
  const n = Hi(e[t], o, `${r}.${t}`);
  return n.ok && (i[t] = n.value), n.diagnostics;
}, x = (e, i) => {
  i && e.push(i);
}, N = (e) => e.find((i) => i.level === "error"), Ei = (e, i, t, r) => {
  if (typeof e.resizeHandles == "undefined") return null;
  if (!Array.isArray(e.resizeHandles))
    return r === "sanitize" ? (delete i.resizeHandles, h("item-field-dropped", "warning", "Dropped invalid resizeHandles.", { path: `${t}.resizeHandles` })) : h("validation", "error", `${t}.resizeHandles must be an array.`, { path: `${t}.resizeHandles` });
  const o = e.resizeHandles.filter($i);
  return o.length !== e.resizeHandles.length && r !== "sanitize" ? h("validation", "error", `${t}.resizeHandles contains an invalid handle.`, { path: `${t}.resizeHandles` }) : (o.length > 0 && (i.resizeHandles = o), o.length !== e.resizeHandles.length ? h("item-field-cleaned", "warning", "Removed invalid resize handle values.", { path: `${t}.resizeHandles` }) : null);
}, ye = (e, i, t, r) => {
  const o = L(e, t, i);
  if (!o.ok) return { ok: !1, diagnostics: o.diagnostics };
  if (!I(o.value))
    return {
      ok: !1,
      diagnostics: o.diagnostics.concat(h("validation", "error", `${i} must be an object.`, { path: i }))
    };
  const n = o.value, s = { ...n }, a = o.diagnostics.slice();
  x(a, q(n, s, "col", i, t, { required: r, min: 0, clampMin: 0 })), x(a, q(n, s, "row", i, t, { required: r, min: 0, clampMin: 0 })), x(a, q(n, s, "sizeX", i, t, { required: r, min: 1, clampMin: 1 })), x(a, q(n, s, "sizeY", i, t, { required: r, min: 1, clampMin: 1 }));
  for (const d of ["minSizeX", "minSizeY", "maxSizeX", "maxSizeY", "mobileHeight", "aspectRatio"])
    x(a, he(n, s, d, i, t));
  typeof n.mobileOrder != "undefined" && x(a, q(n, s, "mobileOrder", i, t));
  for (const d of ["static", "draggable", "resizable", "bounded", "desktopHide", "mobileHide", "preserveAspectRatio"])
    x(a, Ye(n, s, d, i, t));
  return x(a, Ei(n, s, i, t)), a.push(...J(n, s, "extensions", i, t)), N(a) ? { ok: !1, diagnostics: a } : { ok: !0, item: s, diagnostics: a };
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
  const o = r.value, n = { ...o }, s = r.diagnostics.slice();
  for (const a of ["columns", "minColumns", "rowHeight", "mobileRowHeight", "minRowHeight"])
    x(s, he(o, n, a, i, t));
  for (const a of ["outerMargin", "autoFillHeight", "mobileAutoFillHeight", "mobileDisplayLayoutFirst"])
    x(s, Ye(o, n, a, i, t));
  for (const a of ["backgroundColor", "backgroundSizeMode", "backgroundImageUrl"])
    x(s, pe(o, n, a, i, t));
  if (typeof o.margin != "undefined")
    if (ie(o.margin))
      n.margin = o.margin;
    else {
      const a = ze(o.margin, `${i}.margin`, t);
      if (s.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: s };
      a.value ? n.margin = a.value : delete n.margin;
    }
  if (typeof o.containerPadding != "undefined") {
    const a = ze(o.containerPadding, `${i}.containerPadding`, t);
    if (s.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: s };
    a.value ? n.containerPadding = a.value : delete n.containerPadding;
  }
  typeof o.viewFormat != "undefined" && o.viewFormat !== "grid" && o.viewFormat !== "list" && (t === "sanitize" ? (s.push(h("item-field-dropped", "warning", "Dropped invalid viewFormat.", { path: `${i}.viewFormat` })), delete n.viewFormat) : s.push(h("validation", "error", `${i}.viewFormat must be "grid" or "list".`, { path: `${i}.viewFormat` })));
  for (const a of ["heightMode", "mobileHeightMode"])
    typeof o[a] != "undefined" && !Si(o[a]) && (t === "sanitize" ? (s.push(h("item-field-dropped", "warning", `Dropped invalid ${a}.`, { path: `${i}.${a}` })), delete n[a]) : s.push(h("validation", "error", `${i}.${a} must be "auto", "scroll", "fit", or "fixed".`, { path: `${i}.${a}` })));
  if (typeof o.renderPrecision != "undefined" && !Di(o.renderPrecision) && (t === "sanitize" ? (s.push(h("item-field-dropped", "warning", "Dropped invalid renderPrecision.", { path: `${i}.renderPrecision` })), delete n.renderPrecision) : s.push(h("validation", "error", `${i}.renderPrecision must be "integer" or "subpixel".`, { path: `${i}.renderPrecision` }))), typeof o.layoutDimension != "undefined")
    if (!I(o.layoutDimension))
      t === "sanitize" ? (s.push(h("item-field-dropped", "warning", "Dropped invalid layoutDimension.", { path: `${i}.layoutDimension` })), delete n.layoutDimension) : s.push(h("validation", "error", `${i}.layoutDimension must be an object.`, { path: `${i}.layoutDimension` }));
    else {
      const a = { ...o.layoutDimension };
      typeof a.type != "undefined" && a.type !== "percentage" && a.type !== "fixed" && (t === "sanitize" ? (s.push(h("item-field-dropped", "warning", "Dropped invalid layoutDimension.type.", { path: `${i}.layoutDimension.type` })), delete a.type) : s.push(h("validation", "error", `${i}.layoutDimension.type is invalid.`, { path: `${i}.layoutDimension.type` })));
      for (const l of ["fixedWidth", "leftWidthPercentage"])
        x(s, he(a, a, l, `${i}.layoutDimension`, t));
      x(s, pe(a, a, "fixedLayout", `${i}.layoutDimension`, t)), n.layoutDimension = a;
    }
  return s.push(...J(o, n, "extensions", i, t)), N(s) ? { ok: !1, diagnostics: s } : { ok: !0, settings: n, diagnostics: s };
}, Xe = (e) => e.map((i) => ({ i, x: 0, y: 0, w: 1, h: 1 })), Me = (e, i, t, r) => {
  if (typeof e == "undefined") return { ok: !0, editor: void 0, diagnostics: [] };
  const o = L(e, t, i);
  if (!o.ok) return { ok: !1, diagnostics: o.diagnostics };
  if (!I(o.value)) {
    const l = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be an object.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: o.diagnostics.concat(l) } : { ok: !1, diagnostics: o.diagnostics.concat(l) };
  }
  const n = o.value, s = { ...n }, a = o.diagnostics.slice();
  if (Ii(n.version) || (t === "sanitize" ? (a.push(h("item-field-cleaned", "warning", "Defaulted invalid editor version.", { path: `${i}.version` })), s.version = 1) : a.push(h("validation", "error", `${i}.version must be a positive integer.`, { path: `${i}.version` }))), typeof n.updatedAt != "undefined" && x(a, pe(n, s, "updatedAt", i, t)), typeof n.editorMetaById != "undefined") {
    const l = Ce(n.editorMetaById, {
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
    s.editorMetaById = l.value;
  }
  return a.push(...J(n, s, "extensions", i, t)), N(a) ? { ok: !1, diagnostics: a } : { ok: !0, editor: s, diagnostics: a };
}, Oi = (e, i, t) => {
  const r = L(e, t, i);
  if (!r.ok) return { ok: !1, diagnostics: r.diagnostics };
  if (!I(r.value))
    return {
      ok: !1,
      diagnostics: r.diagnostics.concat(h("validation", "error", `${i} must be an object.`, { path: i }))
    };
  const o = r.value, n = { ...o }, s = r.diagnostics.slice();
  if (!I(o.widgets))
    return {
      ok: !1,
      diagnostics: s.concat(h("validation", "error", `${i}.widgets must be an object map.`, { path: `${i}.widgets` }))
    };
  const a = {};
  for (const f of Object.keys(o.widgets)) {
    if (!Z(f) || ne.has(f)) {
      s.push(h("validation", "error", "Widget ids must be safe non-empty strings.", { path: `${i}.widgets.${f}`, itemId: f }));
      continue;
    }
    const g = ye(o.widgets[f], `${i}.widgets.${f}`, t, !0);
    s.push(...g.diagnostics.map((m) => {
      var u;
      return { ...m, itemId: (u = m.itemId) != null ? u : f };
    })), g.ok && (a[f] = g.item);
  }
  n.widgets = a;
  const l = be(o.gridSettings, `${i}.gridSettings`, t);
  if (s.push(...l.diagnostics), !l.ok) return { ok: !1, diagnostics: s };
  if (l.settings ? n.gridSettings = l.settings : delete n.gridSettings, typeof o.profiles != "undefined")
    if (!I(o.profiles))
      t === "sanitize" ? (s.push(h("item-field-dropped", "warning", "Dropped invalid profiles.", { path: `${i}.profiles` })), delete n.profiles) : s.push(h("validation", "error", `${i}.profiles must be an object map.`, { path: `${i}.profiles` }));
    else {
      const f = {};
      for (const g of Object.keys(o.profiles)) {
        const m = `${i}.profiles.${g}`;
        if (!Z(g) || ne.has(g)) {
          s.push(h("validation", "error", "Profile ids must be safe non-empty strings.", { path: m, profileId: g }));
          continue;
        }
        if (!I(o.profiles[g])) {
          s.push(h("validation", t === "sanitize" ? "warning" : "error", `${m} must be an object.`, { path: m, profileId: g }));
          continue;
        }
        const u = o.profiles[g], c = { ...u };
        if (typeof u.widgets != "undefined")
          if (!I(u.widgets))
            s.push(h("validation", t === "sanitize" ? "warning" : "error", `${m}.widgets must be an object map.`, { path: `${m}.widgets`, profileId: g })), t === "sanitize" && delete c.widgets;
          else {
            const k = {};
            for (const D of Object.keys(u.widgets)) {
              const j = ye(u.widgets[D], `${m}.widgets.${D}`, t, !1);
              s.push(...j.diagnostics.map((y) => {
                var S;
                return { ...y, itemId: (S = y.itemId) != null ? S : D, profileId: g };
              })), j.ok && (k[D] = j.item, ee(a, D) || s.push(h("unknown-item", "warning", `Profile "${g}" references an unknown widget "${D}".`, {
                path: `${m}.widgets.${D}`,
                itemId: D,
                profileId: g
              })));
            }
            c.widgets = k;
          }
        const p = be(u.gridSettings, `${m}.gridSettings`, t);
        if (s.push(...p.diagnostics.map((k) => ({ ...k, profileId: g }))), !p.ok) return { ok: !1, diagnostics: s };
        p.settings ? c.gridSettings = p.settings : delete c.gridSettings;
        const v = Me(u.editor, `${m}.editor`, t, Object.keys(a));
        if (s.push(...v.diagnostics.map((k) => ({ ...k, profileId: g }))), !v.ok) return { ok: !1, diagnostics: s };
        v.editor ? c.editor = v.editor : delete c.editor, s.push(...J(u, c, "extensions", m, t)), f[g] = c;
      }
      n.profiles = f;
    }
  const d = Me(o.editor, `${i}.editor`, t, Object.keys(a));
  return s.push(...d.diagnostics), d.ok ? (d.editor ? n.editor = d.editor : delete n.editor, s.push(...J(o, n, "extensions", i, t)), N(s) ? { ok: !1, diagnostics: s } : { ok: !0, layout: n, diagnostics: s }) : { ok: !1, diagnostics: s };
};
function F(e, i = {}) {
  var m, u;
  const t = (m = i.currentVersion) != null ? m : oe, r = (u = i.validation) != null ? u : "strict", o = L(e, r, "document"), n = o.diagnostics.slice();
  if (!o.ok)
    return {
      ok: !1,
      originalPayload: e,
      warnings: n.filter((c) => c.level === "warning"),
      diagnostics: n,
      error: {
        ...ke("Dashboard document must contain JSON-safe values only.", n),
        originalPayload: e
      }
    };
  if (!I(o.value)) {
    const c = h("invalid-document", "error", "Dashboard document must be an object.", { path: "document" });
    return {
      ok: !1,
      originalPayload: e,
      warnings: n.filter((p) => p.level === "warning"),
      diagnostics: n.concat(c),
      error: M("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  const s = o.value, a = { ...s };
  if (s.dashboardSchemaVersion !== t) {
    const c = h("invalid-document", "error", `Expected dashboard schema version ${t}.`, { path: "dashboardSchemaVersion" });
    return n.push(c), {
      ok: !1,
      originalPayload: e,
      warnings: n.filter((p) => p.level === "warning"),
      diagnostics: n,
      error: M("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  if (s.kind !== "dashboard-layout") {
    const c = h("invalid-document", "error", 'Dashboard document kind must be "dashboard-layout".', { path: "kind" });
    n.push(c);
  }
  for (const c of ["key", "revision", "sourceId", "savedAt", "primaryLayoutId"])
    Z(s[c]) || n.push(h("invalid-document", "error", `Dashboard document ${c} must be a non-empty string.`, { path: c }));
  if (Z(s.savedAt) && !ki(s.savedAt) && n.push(h("invalid-document", "error", "Dashboard document savedAt must be a valid date string.", { path: "savedAt" })), I(s.layouts) || n.push(h("invalid-document", "error", "Dashboard document layouts must be an object map.", { path: "layouts" })), N(n)) {
    const c = N(n);
    return {
      ok: !1,
      originalPayload: e,
      warnings: n.filter((p) => p.level === "warning"),
      diagnostics: n,
      error: M(c.code === "invalid-document" ? "invalid-document" : "validation", c.message, {
        path: c.path,
        originalPayload: e
      })
    };
  }
  const l = s.layouts, d = s.primaryLayoutId;
  if (!ee(l, d)) {
    const c = h("invalid-document", "error", "Dashboard primaryLayoutId must point to an existing layout.", { path: "primaryLayoutId", layoutId: d });
    return n.push(c), {
      ok: !1,
      originalPayload: e,
      warnings: n.filter((p) => p.level === "warning"),
      diagnostics: n,
      error: M("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  const f = {};
  for (const c of Object.keys(l)) {
    if (!Z(c) || ne.has(c)) {
      n.push(h("invalid-document", "error", "Layout ids must be safe non-empty strings.", { path: `layouts.${c}`, layoutId: c }));
      continue;
    }
    const p = Oi(l[c], `layouts.${c}`, r);
    n.push(...p.diagnostics.map((v) => {
      var k;
      return { ...v, layoutId: (k = v.layoutId) != null ? k : c };
    })), p.ok && (f[c] = p.layout);
  }
  if (typeof s.meta != "undefined" ? n.push(...J(s, a, "meta", "document", r)) : delete a.meta, N(n)) {
    const c = N(n);
    return {
      ok: !1,
      originalPayload: e,
      warnings: n.filter((p) => p.level === "warning"),
      diagnostics: n,
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
      key: s.key,
      revision: s.revision,
      sourceId: s.sourceId,
      savedAt: s.savedAt,
      primaryLayoutId: d,
      layouts: f,
      ...a.meta ? { meta: a.meta } : {}
    },
    warnings: n.filter((c) => c.level === "warning"),
    diagnostics: n
  };
}
function Ge(e, i) {
  var m, u, c, p;
  const t = (m = i.now) != null ? m : () => /* @__PURE__ */ new Date(), r = (u = i.revision) != null ? u : Mi, o = t().toISOString(), n = (c = i.sourceId) != null ? c : I(e) && typeof e.sourceId == "string" ? e.sourceId : zi(), s = I(e) && e.kind === "dashboard-layout" && I(e.layouts), a = s && typeof e.primaryLayoutId == "string" ? e.primaryLayoutId : "default", l = s ? e.layouts : { [a]: e }, d = (p = i.meta) != null ? p : s ? e.meta : void 0, f = {
    ...s ? e : {},
    dashboardSchemaVersion: oe,
    kind: "dashboard-layout",
    key: i.key,
    revision: r(),
    sourceId: n,
    savedAt: o,
    primaryLayoutId: a,
    layouts: l,
    ...d ? { meta: d } : {}
  }, g = F(f, {
    currentVersion: oe,
    validation: "strict"
  });
  if (!g.ok) throw g.error;
  return g.document;
}
function Ri(e, i = {}) {
  var f, g, m;
  const t = (f = i.currentVersion) != null ? f : oe, r = (g = i.migrations) != null ? g : {}, o = e, n = [], s = [];
  if (!I(e) || !Number.isInteger(e.dashboardSchemaVersion))
    return { ok: !1, error: M("invalid-document", "Document has no numeric dashboardSchemaVersion.", {
      path: "dashboardSchemaVersion",
      originalPayload: o
    }), originalPayload: o, migrations: n, warnings: [], diagnostics: s };
  let a = e.dashboardSchemaVersion;
  if (a > t)
    return { ok: !1, error: M("invalid-document", `Dashboard schema version ${a} is newer than supported ${t}.`, {
      path: "dashboardSchemaVersion",
      originalPayload: o
    }), originalPayload: o, migrations: n, warnings: [], diagnostics: s };
  let l = e;
  for (; a < t; ) {
    const u = r[a];
    if (!u) {
      const c = h("migration-missing", "error", `Missing dashboard migration from version ${a} to ${a + 1}.`);
      return s.push(c), {
        ok: !1,
        originalPayload: o,
        migrations: n,
        warnings: s.filter((p) => p.level === "warning"),
        diagnostics: s,
        error: M("migration-missing", c.message, { originalPayload: o })
      };
    }
    try {
      l = u(l, { fromVersion: a, toVersion: a + 1 });
    } catch (c) {
      const p = h("migration-failed", "error", `Dashboard migration from version ${a} to ${a + 1} failed.`, { details: c });
      return s.push(p), {
        ok: !1,
        originalPayload: o,
        migrations: n,
        warnings: s.filter((v) => v.level === "warning"),
        diagnostics: s,
        error: M("migration-failed", p.message, { cause: c, originalPayload: o })
      };
    }
    if (!I(l) || l.dashboardSchemaVersion !== a + 1) {
      const c = h("migration-failed", "error", `Dashboard migration from version ${a} to ${a + 1} returned an invalid document.`);
      return s.push(c), {
        ok: !1,
        originalPayload: o,
        migrations: n,
        warnings: s.filter((p) => p.level === "warning"),
        diagnostics: s,
        error: M("migration-failed", c.message, { originalPayload: o })
      };
    }
    n.push({ fromVersion: a, toVersion: a + 1 }), a += 1;
  }
  const d = F(l, {
    currentVersion: t,
    validation: (m = i.validation) != null ? m : "strict"
  });
  return s.push(...d.diagnostics), d.ok ? {
    ok: !0,
    document: d.document,
    migrations: n,
    originalPayload: o,
    warnings: s.filter((u) => u.level === "warning"),
    diagnostics: s
  } : {
    ok: !1,
    originalPayload: o,
    migrations: n,
    warnings: s.filter((u) => u.level === "warning"),
    diagnostics: s,
    error: n.length > 0 ? M("migration-failed", "Dashboard migration result failed validation.", {
      cause: d.error,
      originalPayload: o
    }) : d.error
  };
}
function St(e, i = {}) {
  var o;
  const t = Pi(e);
  if (!t.ok)
    return {
      ok: !1,
      error: t.error,
      fallback: i.fallback ? se(i.fallback, "strict") : void 0,
      originalPayload: e,
      migrations: [],
      warnings: [],
      diagnostics: []
    };
  const r = Ri(t.value, {
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
    fallback: i.fallback ? se(i.fallback, "strict") : void 0,
    originalPayload: r.originalPayload,
    migrations: r.migrations,
    warnings: r.warnings,
    diagnostics: r.diagnostics
  };
}
const ji = (e) => {
  var i, t, r, o, n, s, a, l;
  return {
    ...e || {},
    columns: (i = e == null ? void 0 : e.columns) != null ? i : 12,
    minColumns: (t = e == null ? void 0 : e.minColumns) != null ? t : 1,
    margin: (r = e == null ? void 0 : e.margin) != null ? r : 10,
    outerMargin: (o = e == null ? void 0 : e.outerMargin) != null ? o : !0,
    viewFormat: (n = e == null ? void 0 : e.viewFormat) != null ? n : "grid",
    rowHeight: (s = e == null ? void 0 : e.rowHeight) != null ? s : 150,
    autoFillHeight: (a = e == null ? void 0 : e.autoFillHeight) != null ? a : !1,
    heightMode: e == null ? void 0 : e.heightMode,
    mobileHeightMode: e == null ? void 0 : e.mobileHeightMode,
    minRowHeight: e == null ? void 0 : e.minRowHeight,
    renderPrecision: (l = e == null ? void 0 : e.renderPrecision) != null ? l : "integer"
  };
}, xi = (e, i) => {
  const t = {
    i: e,
    x: i.col,
    y: i.row,
    w: i.sizeX,
    h: i.sizeY
  };
  return E(t, "minW", i.minSizeX), E(t, "minH", i.minSizeY), E(t, "maxW", i.maxSizeX), E(t, "maxH", i.maxSizeY), E(t, "static", i.static), E(t, "isDraggable", i.draggable), E(t, "isResizable", i.resizable), E(t, "isBounded", i.bounded), i.resizeHandles && (t.resizeHandles = i.resizeHandles.slice()), t;
}, Bi = (e, i) => ({
  ...e,
  ...i || {}
}), Pe = (e) => {
  if (!e) return;
  const i = {};
  return E(i, "static", e.static), E(i, "draggable", e.draggable), E(i, "resizable", e.resizable), E(i, "bounded", e.bounded), e.resizeHandles && (i.resizeHandles = e.resizeHandles.slice()), E(i, "preserveAspectRatio", e.preserveAspectRatio), E(i, "aspectRatio", e.aspectRatio), Object.keys(i).length > 0 ? i : void 0;
}, Fi = (e, i) => h(
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
), Ai = (e, i) => e.y !== i.y ? e.y - i.y : e.x !== i.x ? e.x - i.x : e.i < i.i ? -1 : e.i > i.i ? 1 : 0, Ue = (e, i, t) => {
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
  var D, j, y, S, H, P, O;
  const t = F(e, { validation: (D = i.validation) != null ? D : "strict" }), r = t.diagnostics.slice();
  if (!t.ok)
    return { ok: !1, error: t.error, originalPayload: t.originalPayload, diagnostics: r };
  const o = t.document;
  let n = !1, s = (j = i.layoutId) != null ? j : o.primaryLayoutId;
  if (s !== o.primaryLayoutId && !i.allowNonPrimary && (r.push(h("deferred-layout-slot", "info", "Only the primary dashboard layout is projected in this version.", {
    layoutId: s
  })), s = o.primaryLayoutId, n = !0), !o.layouts[s]) {
    const w = M("invalid-document", `Dashboard layout "${s}" was not found.`, {
      path: `layouts.${s}`
    });
    return r.push(h("invalid-document", "error", w.message, { layoutId: s, path: w.path })), { ok: !1, error: w, originalPayload: e, diagnostics: r };
  }
  Object.keys(o.layouts).forEach((w) => {
    w !== s && w !== o.primaryLayoutId && r.push(h("deferred-layout-slot", "info", "Non-primary dashboard layout slot is preserved but not projected.", { layoutId: w }));
  });
  const a = o.layouts[s], l = i.profileId && ((y = a.profiles) != null && y[i.profileId]) ? i.profileId : null;
  i.profileId && !l && (r.push(h("profile-fallback", "warning", `Dashboard profile "${i.profileId}" was not found; projected primary layout.`, {
    layoutId: s,
    profileId: i.profileId
  })), n = !0);
  const d = l ? (S = a.profiles) == null ? void 0 : S[l] : void 0;
  d != null && d.widgets && Object.keys(d.widgets).forEach((w) => {
    ee(a.widgets, w) || r.push(h("unknown-item", "warning", `Profile "${l}" contains unknown widget "${w}".`, {
      layoutId: s,
      profileId: l || void 0,
      itemId: w,
      path: `layouts.${s}.profiles.${l}.widgets.${w}`
    }));
  });
  const f = (H = i.targetView) != null ? H : "desktop", g = [], m = {}, u = {}, c = {
    ...((P = a.editor) == null ? void 0 : P.editorMetaById) || {}
  };
  (O = d == null ? void 0 : d.editor) != null && O.editorMetaById && Object.keys(d.editor.editorMetaById).forEach((w) => {
    var b, B;
    c[w] = {
      ...c[w] || {},
      ...(B = (b = d.editor) == null ? void 0 : b.editorMetaById) == null ? void 0 : B[w]
    };
  }), Object.keys(a.widgets).forEach((w) => {
    var De, He;
    const b = a.widgets[w], B = (De = d == null ? void 0 : d.widgets) == null ? void 0 : De[w], R = Bi(a.widgets[w], (He = d == null ? void 0 : d.widgets) == null ? void 0 : He[w]), T = xi(w, R);
    g.push(T);
    const A = { ...c[w] || {} };
    (f === "mobile" ? R.mobileHide === !0 : R.desktopHide === !0) ? (A.visible === !0 && r.push(h("editor-capability-conflict", "warning", "Dashboard visibility overrides editor metadata.", {
      layoutId: s,
      profileId: l || void 0,
      itemId: w
    })), A.visible = !1) : typeof A.visible == "undefined" && (A.visible = !0), R.resizable === !1 && (A.resizable === !0 && r.push(h("editor-capability-conflict", "warning", "Dashboard resizable=false overrides editor metadata.", {
      layoutId: s,
      profileId: l || void 0,
      itemId: w
    })), A.resizable = !1), c[w] = A;
    const Y = ui({
      item: T,
      dashboard: Pe(b),
      profile: Pe(B),
      editor: A,
      preserveUnknownFields: !0
    });
    m[w] = Y, Y.aspectRatio && (u[w] = Y.aspectRatio), Y.diagnostics.forEach((V) => {
      r.push(Fi(V, {
        layoutId: s,
        profileId: l,
        itemId: w
      }));
    }), pi.forEach((V) => {
      typeof R[V] != "undefined" && r.push(h("unsupported-field", "info", `${V} is preserved in the dashboard document but not written to LayoutItem.`, {
        layoutId: s,
        profileId: l || void 0,
        itemId: w,
        path: `layouts.${s}.widgets.${w}.${V}`
      }));
    }), yi.forEach((V) => {
      typeof R[V] != "undefined" && r.push(h("item-capability.sidecar-projected", "info", `${V} was projected through capability sidecar and not written to LayoutItem.`, {
        layoutId: s,
        profileId: l || void 0,
        itemId: w,
        path: `layouts.${s}.widgets.${w}.${V}`
      }));
    });
  }), g.sort(Ai);
  const p = Ue(c, g, r), v = ji({
    ...a.gridSettings || {},
    ...(d == null ? void 0 : d.gridSettings) || {}
  });
  return (a.gridSettings || d != null && d.gridSettings) && r.push(h("unsupported-field", "info", "Dashboard grid settings are returned as sidecar runtime settings and are not written to LayoutItem.", {
    layoutId: s,
    profileId: l || void 0,
    path: d != null && d.gridSettings ? `layouts.${s}.profiles.${l}.gridSettings` : `layouts.${s}.gridSettings`
  })), { ok: !0, projection: {
    layout: g,
    gridSettings: v,
    editorMetaById: p,
    capabilitiesById: m,
    resizeConstraintsById: Object.keys(u).length > 0 ? u : void 0,
    layoutId: s,
    profileId: l,
    fallbackApplied: n,
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
}, Li = (e) => {
  if (!e) return null;
  const i = new Set(e.filter(Boolean));
  return (t) => i.has(t);
}, Re = (e, i) => {
  if (!e || !i) return e;
  const t = new Set(i.filter(Boolean)), r = {};
  return Object.keys(e).forEach((o) => {
    t.has(o) && (r[o] = e[o]);
  }), Object.keys(r).length > 0 ? r : void 0;
}, Vi = (e) => (e.editor = e.editor || { version: 1 }, e.editor);
function Ke(e, i, t = {}) {
  var c, p, v, k, D, j;
  const r = F(e, { validation: (c = t.validation) != null ? c : "strict" }), o = r.diagnostics.slice(), n = r.ok ? r.document : se(e, "sanitize");
  if (!r.ok)
    return {
      ok: !1,
      error: r.error,
      document: n,
      originalPayload: r.originalPayload,
      diagnostics: o
    };
  const s = se(n, "strict"), a = (p = t.layoutId) != null ? p : s.primaryLayoutId, l = s.layouts[a];
  if (!l) {
    const y = h("invalid-document", "error", `Dashboard layout "${a}" was not found.`, { layoutId: a });
    return o.push(y), {
      ok: !1,
      error: M("invalid-document", y.message, { path: `layouts.${a}` }),
      document: s,
      diagnostics: o
    };
  }
  let d;
  if (t.profileId) {
    if (l.profiles = l.profiles || {}, !l.profiles[t.profileId]) {
      if (!t.createMissingProfile) {
        const y = h("profile-fallback", "error", `Dashboard profile "${t.profileId}" was not found.`, {
          layoutId: a,
          profileId: t.profileId
        });
        return o.push(y), {
          ok: !1,
          error: M("validation", y.message, { path: `layouts.${a}.profiles.${t.profileId}` }),
          document: s,
          diagnostics: o
        };
      }
      l.profiles[t.profileId] = { widgets: {} };
    }
    l.profiles[t.profileId].widgets = l.profiles[t.profileId].widgets || {}, d = l.profiles[t.profileId].widgets;
  } else
    d = l.widgets;
  const f = Li(t.writeItemIds), g = new Set(i.layout.map((y) => y.i));
  t.removeMissingItems && ((v = t.writeItemIds) != null && v.length) && t.writeItemIds.filter(Boolean).forEach((y) => {
    var S;
    g.has(y) || (delete l.widgets[y], delete d[y], Object.values(l.profiles || {}).forEach((H) => {
      var P;
      H.widgets && delete H.widgets[y], (P = H.editor) != null && P.editorMetaById && delete H.editor.editorMetaById[y];
    }), (S = l.editor) != null && S.editorMetaById && delete l.editor.editorMetaById[y]);
  });
  for (const y of i.layout) {
    const S = y.i;
    if (f && !f(S)) continue;
    const H = ee(l.widgets, S);
    if (!H && !t.createMissingItems) {
      const O = h("unknown-item", "error", `Runtime layout contains unknown dashboard widget "${S}".`, {
        layoutId: a,
        profileId: t.profileId,
        itemId: S
      });
      return o.push(O), {
        ok: !1,
        error: M("unknown-item", O.message, { details: { itemId: S } }),
        document: s,
        diagnostics: o
      };
    }
    H || (l.widgets[S] = Ee(y));
    const P = d[S] || {};
    d[S] = {
      ...P,
      ...Ee(y)
    };
  }
  if (i.gridSettings)
    if (t.profileId) {
      const y = (k = l.profiles) == null ? void 0 : k[t.profileId];
      y && (y.gridSettings = {
        ...y.gridSettings || {},
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
    const y = t.profileId ? (D = l.profiles) == null ? void 0 : D[t.profileId] : l, S = Vi(y);
    S.editorMetaById = Oe(S.editorMetaById, m), Object.keys(m).forEach((H) => {
      if (!ee(l.widgets, H)) {
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
  const u = F(s, { validation: (j = t.validation) != null ? j : "strict" });
  return o.push(...u.diagnostics), u.ok ? {
    ok: !0,
    document: u.document,
    diagnostics: o
  } : {
    ok: !1,
    error: u.error,
    document: s,
    originalPayload: e,
    diagnostics: o
  };
}
const qe = (e, i) => {
  const t = {};
  return i.forEach((r) => {
    typeof e[r] != "undefined" && (t[r] = e[r]);
  }), t;
}, G = (e, i) => {
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
  const r = qe(e, me), o = G(e, me), n = ae(
    o,
    i,
    t,
    "ThingsBoard grid settings contain deferred business fields."
  );
  n && (r.extensions = {
    ...r.extensions || {},
    thingsBoard: n
  });
  const s = be(r, t, "sanitize");
  return i.push(...s.diagnostics), s.ok ? s.settings : void 0;
}, xe = (e, i, t, r) => {
  if (!I(e))
    return i.push(h("invalid-item-geometry", "error", "ThingsBoard widget must be an object.", { path: t })), null;
  const o = I(e.layout) ? e.layout : e, n = qe(o, re), s = I(e.layout) ? G(o, re) : {}, a = I(e.layout) ? {
    ...G(e, ["layout"]),
    ...Object.keys(s).length > 0 ? { layout: s } : {}
  } : G(e, re), l = ae(
    a,
    i,
    t,
    "ThingsBoard widget business fields were preserved in extensions."
  );
  l && (n.extensions = {
    ...n.extensions || {},
    thingsBoard: l
  });
  const d = ye(n, t, "sanitize", r);
  return i.push(...d.diagnostics), d.ok ? d.item : null;
};
function Dt(e, i = {}) {
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
    const g = xe(o[f], t, `widgets.${f}`, !0);
    g && (r[f] = g);
  });
  const n = {
    widgets: r,
    ...e.gridSettings ? { gridSettings: je(e.gridSettings, t, "gridSettings") } : {}
  }, s = G(e, bi), a = ae(
    s,
    t,
    "document",
    "ThingsBoard dashboard business fields were preserved in extensions."
  );
  a && (n.extensions = {
    ...n.extensions || {},
    thingsBoard: a
  });
  const l = I(e.breakpoints) ? e.breakpoints : {};
  Object.keys(l).forEach((f) => {
    if (!I(l[f])) return;
    const g = l[f], m = I(g.widgetLayouts) ? g.widgetLayouts : I(g.widgets) ? g.widgets : {}, u = {};
    Object.keys(m).forEach((p) => {
      const v = xe(m[p], t, `breakpoints.${f}.widgetLayouts.${p}`, !1);
      v && (u[p] = v);
    });
    const c = ae(
      G(g, wi),
      t,
      `breakpoints.${f}`,
      "ThingsBoard breakpoint business fields were preserved in extensions."
    );
    n.profiles = n.profiles || {}, n.profiles[f] = {
      widgets: u,
      ...g.gridSettings ? { gridSettings: je(g.gridSettings, t, `breakpoints.${f}.gridSettings`) } : {},
      ...c ? { extensions: { thingsBoard: c } } : {}
    };
  });
  try {
    return { ok: !0, document: Ge(n, {
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
const Be = (e) => {
  var t;
  if (!e) return;
  const i = {};
  return I((t = e.extensions) == null ? void 0 : t.thingsBoard) && Object.keys(e.extensions.thingsBoard).forEach((r) => {
    var o;
    i[r] = ((o = e.extensions) == null ? void 0 : o.thingsBoard)[r];
  }), me.forEach((r) => {
    typeof e[r] != "undefined" && (i[r] = e[r]);
  }), i;
}, Fe = (e) => {
  var t;
  const i = {};
  return I((t = e.extensions) == null ? void 0 : t.thingsBoard) && Object.keys(e.extensions.thingsBoard).forEach((r) => {
    var o;
    i[r] = ((o = e.extensions) == null ? void 0 : o.thingsBoard)[r];
  }), re.forEach((r) => {
    typeof e[r] != "undefined" && (i[r] = e[r]);
  }), i;
};
function Ht(e, i = {}) {
  var d, f;
  const t = F(e), r = t.diagnostics.slice();
  if (!t.ok) return { ok: !1, error: t.error, diagnostics: r };
  const o = t.document, n = (d = i.layoutId) != null ? d : o.primaryLayoutId, s = o.layouts[n];
  if (!s) {
    const g = h("invalid-document", "error", `Dashboard layout "${n}" was not found.`, { layoutId: n });
    return r.push(g), {
      ok: !1,
      diagnostics: r,
      error: M("invalid-document", g.message, { path: `layouts.${n}` })
    };
  }
  const a = {};
  Object.keys(s.widgets).forEach((g) => {
    a[g] = Fe(s.widgets[g]);
  });
  const l = {};
  return Object.keys(s.profiles || {}).forEach((g) => {
    var c;
    const m = s.profiles[g], u = {};
    Object.keys(m.widgets || {}).forEach((p) => {
      u[p] = Fe(m.widgets[p]);
    }), l[g] = {
      ...I((c = m.extensions) == null ? void 0 : c.thingsBoard) ? m.extensions.thingsBoard : {},
      widgetLayouts: u,
      ...m.gridSettings ? { gridSettings: Be(m.gridSettings) } : {}
    };
  }), {
    ok: !0,
    value: {
      ...I((f = s.extensions) == null ? void 0 : f.thingsBoard) ? s.extensions.thingsBoard : {},
      widgets: a,
      ...s.gridSettings ? { gridSettings: Be(s.gridSettings) } : {},
      ...Object.keys(l).length > 0 ? { breakpoints: l } : {}
    },
    diagnostics: r
  };
}
const fe = "default", Ae = 12, de = 10, we = [0, 0], Le = 150, Ze = "grid-height-runtime", Ti = [
  "preserveAspectRatio",
  "aspectRatio"
], Ni = [
  "mobileDisplayLayoutFirst",
  "layoutDimension",
  "backgroundColor",
  "backgroundSizeMode",
  "backgroundImageUrl"
], C = (e, i) => Object.prototype.hasOwnProperty.call(e, i), z = (e) => typeof e == "number" && Number.isFinite(e), _ = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const i = Object.getPrototypeOf(e);
  return i === Object.prototype || i === null;
}, W = (e, i) => z(e) && e > 0 ? Math.floor(e) : i, te = (e) => Array.isArray(e) && e.length === 2 && z(e[0]) && z(e[1]), ve = (e) => {
  const i = JSON.stringify(e);
  return typeof i == "undefined" ? e : JSON.parse(i);
}, Ie = (e) => e.map((i) => ({ ...i })), _i = (e) => {
  if (!e) return null;
  const i = new Set(e.filter(Boolean));
  return (t) => i.has(t);
}, le = (e) => e === "auto" || e === "scroll" || e === "fit" || e === "fixed", Wi = (e) => e === "integer" || e === "subpixel", Ci = (e, i = [de, de]) => te(e) ? [e[0], e[1]] : z(e) ? [e, e] : [i[0], i[1]], U = (e, i, t = {}) => ({
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
function zt(e) {
  return _(e.details) && e.details.source === Ze;
}
function Yi(e, i) {
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
      ..._(e.details) ? e.details : { value: e.details },
      source: Ze,
      prop: e.prop
    }
  };
}
const Xi = (e, i) => Object.prototype.hasOwnProperty.call(e, i), Gi = (e, i, t, r) => {
  const o = Xi(t, "rowHeight") ? t.rowHeight : i.rowHeight;
  return ci({
    layout: e,
    heightMode: t.heightMode,
    rowHeight: o,
    minRowHeight: t.minRowHeight,
    margin: Ci(i.margin),
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
}), Ui = (e, i) => {
  const t = e.breakpoints || {}, r = Qe(t);
  if (e.breakpoint)
    return C(t, e.breakpoint) || i.push($(
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
  for (let n = 1; n < r.length; n++) {
    const s = r[n];
    e.width > t[s] && (o = s);
  }
  return o;
}, Ji = (e) => e === "desktop" || e === "mobile", Ki = (e, i, t) => {
  if (i.targetView)
    return { targetView: i.targetView, source: "explicit" };
  const r = i.targetViewRule;
  if (r != null && r.resolve)
    try {
      const n = r.resolve({
        width: i.width,
        requestedBreakpoint: e,
        breakpoints: i.breakpoints || {}
      });
      if (Ji(n))
        return { targetView: n, source: "resolver" };
    } catch (n) {
      t.push($(
        "projection-validation-failed",
        "warning",
        "Target view resolver failed; fallback target view rules were used.",
        { details: { cause: n } }
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
}, qi = (e, i, t, r) => z(e) || te(e) ? e : (i.push($(
  "settings-default",
  "info",
  "Dashboard grid setting margin was missing; default value was used.",
  { layoutId: t, profileId: r || void 0, path: "gridSettings.margin", details: { value: de } }
)), de), Zi = (e, i, t, r) => te(e) ? [e[0], e[1]] : (i.push($(
  "settings-default",
  "info",
  "Dashboard grid setting containerPadding was missing; default value was used.",
  { layoutId: t, profileId: r || void 0, path: "gridSettings.containerPadding", details: { value: we } }
)), we.slice()), Qi = (e, i, t, r, o) => {
  var s, a, l;
  const n = {
    ...e || {},
    ...i || {}
  };
  return typeof n.columns == "undefined" && t.push($(
    "settings-default",
    "info",
    "Dashboard grid setting columns was missing; default value was used.",
    { layoutId: r, profileId: o || void 0, path: "gridSettings.columns", details: { value: Ae } }
  )), typeof n.rowHeight == "undefined" && t.push($(
    "settings-default",
    "info",
    "Dashboard grid setting rowHeight was missing; default value was used.",
    { layoutId: r, profileId: o || void 0, path: "gridSettings.rowHeight", details: { value: Le } }
  )), {
    ...n,
    columns: W(n.columns, Ae),
    minColumns: W(n.minColumns, 1),
    margin: qi(n.margin, t, r, o),
    outerMargin: (s = n.outerMargin) != null ? s : !0,
    containerPadding: Zi(n.containerPadding, t, r, o),
    viewFormat: n.viewFormat === "list" ? "list" : "grid",
    rowHeight: W(n.rowHeight, Le),
    autoFillHeight: (a = n.autoFillHeight) != null ? a : !1,
    heightMode: le(n.heightMode) ? n.heightMode : void 0,
    mobileHeightMode: le(n.mobileHeightMode) ? n.mobileHeightMode : void 0,
    minRowHeight: z(n.minRowHeight) && n.minRowHeight > 0 ? n.minRowHeight : void 0,
    mobileRowHeight: z(n.mobileRowHeight) && n.mobileRowHeight > 0 ? Math.floor(n.mobileRowHeight) : void 0,
    mobileAutoFillHeight: (l = n.mobileAutoFillHeight) != null ? l : !1,
    renderPrecision: Wi(n.renderPrecision) ? n.renderPrecision : "integer"
  };
}, X = (e = {}, i) => Object.prototype.hasOwnProperty.call(e, i);
function et(e, i) {
  var c, p, v;
  const t = i.diagnostics, r = i.profileId ? `layouts.${i.layoutId}.profiles.${i.profileId}.gridSettings` : `layouts.${i.layoutId}.gridSettings`, o = i.targetView === "mobile", n = e.mobileAutoFillHeight === !0, s = e.autoFillHeight === !0, a = o && le(e.mobileHeightMode), l = le(e.heightMode);
  l && s && e.heightMode !== "fit" && t.push($(
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
  )), a && n && e.mobileHeightMode !== "fit" && t.push($(
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
  const f = a ? e.mobileHeightMode : l ? e.heightMode : (o && !a && n || !l && s ? "fit" : void 0) || "auto", g = o && z(e.mobileRowHeight) && e.mobileRowHeight > 0 ? e.mobileRowHeight : e.rowHeight, m = {
    heightMode: f,
    rowHeight: g,
    minRowHeight: e.minRowHeight,
    renderPrecision: e.renderPrecision || "integer"
  }, u = i.explicit;
  return X(u, "heightMode") && (m.heightMode = (c = u == null ? void 0 : u.heightMode) != null ? c : null), X(u, "rowHeight") && (m.rowHeight = u == null ? void 0 : u.rowHeight), X(u, "minRowHeight") && (m.minRowHeight = u == null ? void 0 : u.minRowHeight), X(u, "containerHeight") && (m.containerHeight = (p = u == null ? void 0 : u.containerHeight) != null ? p : null), X(u, "autoMeasureContainerHeight") && (m.autoMeasureContainerHeight = u == null ? void 0 : u.autoMeasureContainerHeight), X(u, "renderPrecision") && (m.renderPrecision = (v = u == null ? void 0 : u.renderPrecision) != null ? v : null), m;
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
}, ce = (e, i) => e.y !== i.y ? e.y - i.y : e.x !== i.x ? e.x - i.x : e.i < i.i ? -1 : e.i > i.i ? 1 : 0, ii = (e, i) => e.item.row !== i.item.row ? e.item.row - i.item.row : e.item.col !== i.item.col ? e.item.col - i.item.col : e.id < i.id ? -1 : e.id > i.id ? 1 : 0, Ve = (e) => z(e) && e >= 0, it = (e, i, t) => {
  if (e === "mobile") {
    const r = i.item.mobileOrder, o = t.item.mobileOrder, n = Ve(r), s = Ve(o);
    if (n && s && r !== o) return r - o;
    if (n !== s) return n ? -1 : 1;
  }
  return ii(i, t);
}, tt = (e, i) => ({
  ...e,
  ...i || {}
}), rt = (e) => ({
  col: W(e.col, 0),
  row: W(e.row, 0),
  sizeX: W(e.sizeX, 1),
  sizeY: W(e.sizeY, 1),
  ...e
}), ti = (e, i) => i === "mobile" ? e.mobileHide === !0 : e.desktopHide === !0, ot = (e, i, t, r, o) => {
  e && (Ni.forEach((n) => {
    t && typeof t[n] != "undefined" && o.push($(
      "unsupported-profile-field",
      "info",
      `Profile grid setting ${n} is preserved but not directly mapped to the base grid runtime in this version.`,
      { layoutId: i, profileId: e, path: `layouts.${i}.profiles.${e}.gridSettings.${n}` }
    ));
  }), r.forEach((n) => {
    Ti.forEach((s) => {
      typeof n.item[s] != "undefined" && o.push($(
        "item-capability.sidecar-projected",
        "info",
        `Profile item field ${s} was projected through capability sidecar and not written to LayoutItem.`,
        {
          layoutId: i,
          profileId: e,
          itemId: n.id,
          path: `layouts.${i}.profiles.${e}.widgets.${n.id}.${s}`
        }
      ));
    });
  }));
}, nt = (e, i, t, r, o) => {
  var a;
  const n = i ? (a = e.profiles) == null ? void 0 : a[i] : void 0, s = {};
  return Object.keys(e.widgets).sort().forEach((l) => {
    var d;
    s[l] = tt(e.widgets[l], (d = n == null ? void 0 : n.widgets) == null ? void 0 : d[l]);
  }), n != null && n.widgets && Object.keys(n.widgets).sort().forEach((l) => {
    C(e.widgets, l) || (r.push($(
      "unknown-profile-item",
      "warning",
      `Dashboard profile "${i}" contains unknown widget "${l}".`,
      {
        layoutId: o,
        profileId: i || void 0,
        itemId: l,
        path: `layouts.${o}.profiles.${i}.widgets.${l}`
      }
    )), t.allowUnknownProfileItems && (s[l] = rt(n.widgets[l])));
  }), Object.keys(s).map((l) => ({ id: l, item: s[l] })).sort(ii);
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
}, st = (e, i, t, r) => {
  const o = [], n = e.map((d) => d.id), s = [], a = $e(r, void 0);
  e.forEach((d) => {
    const f = ti(d.item, i);
    f && o.push(d.id);
    const g = { ...a[d.id] || {} };
    f ? g.visible = !1 : typeof g.visible == "undefined" && (g.visible = !0), a[d.id] = g, !(t === "view" && f) && s.push(ei(d.id, d.item));
  }), s.sort(ce);
  const l = t === "view" ? n.filter((d) => o.indexOf(d) === -1) : n.slice();
  return {
    layout: s,
    allItemIds: n,
    activeItemIds: l,
    renderItemIds: l.slice(),
    hiddenItemIds: o,
    editorMetaById: a
  };
}, at = (e, i, t, r, o) => i === "mobile" && z(e.item.mobileHeight) && e.item.mobileHeight > 0 ? (t.push($(
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
)), 1), dt = (e, i, t, r, o, n, s, a) => {
  const l = e.slice().sort((p, v) => it(i, p, v)), d = [], f = l.map((p) => p.id), g = [], m = $e(o, void 0);
  let u = 0;
  l.forEach((p) => {
    const v = ti(p.item, i);
    v && d.push(p.id);
    const k = { ...m[p.id] || {} };
    v ? k.visible = !1 : typeof k.visible == "undefined" && (k.visible = !0), m[p.id] = k;
    const D = at(p, i, n, s, a);
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
}, lt = (e) => _(e) && typeof e.primaryLayoutId == "string" ? e.primaryLayoutId : null, ri = (e, i) => `layouts.${e}.profiles.${i}`, ct = (e, i, t) => {
  var o;
  const r = ri(i, t);
  return e.profileId === t || e.path === r || !!((o = e.path) != null && o.startsWith(`${r}.`));
}, ut = (e, i, t) => {
  try {
    const r = ve(e);
    if (!_(r) || !_(r.layouts)) return null;
    const o = r.layouts[i];
    return !_(o) || !_(o.profiles) || !C(o.profiles, t) ? null : (delete o.profiles[t], Object.keys(o.profiles).length === 0 && delete o.profiles, r);
  } catch (r) {
    return null;
  }
}, ft = (e, i, t, r) => {
  var f, g;
  const o = F(e, { validation: (f = t.validation) != null ? f : "strict" });
  if (o.ok)
    return r.push(...o.diagnostics), {
      ok: !0,
      document: o.document,
      invalidProfileFallback: !1,
      profileFallbackReported: !1
    };
  const n = lt(e), s = t.layoutId && t.layoutId === n ? t.layoutId : n, d = !!(s && i !== fe) && o.diagnostics.some((m) => ct(m, s, i)) ? ut(e, s, i) : null;
  if (d) {
    const m = F(d, { validation: (g = t.validation) != null ? g : "strict" });
    if (m.ok)
      return r.push($(
        "profile-fallback",
        "warning",
        `Dashboard profile "${i}" is invalid; resolved primary layout.`,
        {
          layoutId: s,
          profileId: i,
          path: ri(s, i),
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
function Mt(e, i) {
  var P, O, w, b, B, R, T, A, ge;
  const t = [], r = Ui(i, t), o = i.mode || "view", n = Ki(r, i, t), s = ft(
    e,
    r,
    i,
    t
  );
  if (!s.ok)
    return { ok: !1, error: s.error, diagnostics: t };
  const a = s.document;
  let l = s.invalidProfileFallback, d = i.layoutId || a.primaryLayoutId;
  d !== a.primaryLayoutId && (l = !0, d = a.primaryLayoutId);
  const f = a.layouts[d], g = (P = f.profiles) == null ? void 0 : P[r], m = g ? r : null;
  g || (l = !0, s.profileFallbackReported || t.push($(
    "profile-fallback",
    "warning",
    `Dashboard profile "${r}" was not found; resolved primary layout.`,
    { layoutId: d, profileId: r, path: `layouts.${d}.profiles.${r}` }
  )));
  const u = Je(a, {
    layoutId: d,
    profileId: m || void 0,
    targetView: n.targetView,
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
  const c = nt(f, m, i, t, d), p = Qi(
    f.gridSettings,
    m ? (b = (w = f.profiles) == null ? void 0 : w[m]) == null ? void 0 : b.gridSettings : void 0,
    t,
    d,
    m
  );
  ot(
    m,
    d,
    m ? (R = (B = f.profiles) == null ? void 0 : B[m]) == null ? void 0 : R.gridSettings : void 0,
    c,
    t
  );
  const v = $e(
    u.projection.editorMetaById,
    m ? (ge = (A = (T = f.profiles) == null ? void 0 : T[m]) == null ? void 0 : A.editor) == null ? void 0 : ge.editorMetaById : void 0
  ), k = p.viewFormat, D = k === "list" ? dt(
    c,
    n.targetView,
    o,
    p.columns,
    v,
    t,
    d,
    m
  ) : st(c, n.targetView, o, v), j = et(p, {
    targetView: n.targetView,
    diagnostics: t,
    layoutId: d,
    profileId: m
  }), y = Gi(
    D.layout,
    p,
    j,
    {
      layoutId: d,
      resolvedProfileId: m,
      targetView: n.targetView
    }
  ), S = y.diagnostics.map(
    (Y) => Yi(Y, {
      layoutId: d,
      resolvedProfileId: m,
      targetView: n.targetView
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
      targetView: n.targetView,
      targetViewSource: n.source,
      mode: o,
      viewFormat: k,
      heightOptions: j,
      heightRuntime: y,
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
const gt = (e) => Ie(e).sort(ce), mt = (e, i, t, r, o, n) => {
  for (let s = 0; s < e.length; s++) {
    const a = e[s];
    if (!z(a.x) || !z(a.y) || !z(a.w) || !z(a.h) || a.w <= 0 || a.h <= 0)
      return U("validation", `Runtime layout item "${a.i}" has invalid geometry.`, {
        path: `layout.${s}`,
        details: { item: a }
      });
    if (!C(i.widgets, a.i) && !t.createMissingItems)
      return r.push($(
        "unknown-profile-item",
        "error",
        `Runtime layout contains unknown dashboard widget "${a.i}".`,
        { layoutId: o, profileId: n || void 0, itemId: a.i }
      )), U("unknown-item", `Runtime layout contains unknown dashboard widget "${a.i}".`, {
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
function Pt(e, i, t, r = {}) {
  var H, P, O, w;
  const o = [], n = r.mode || i.mode, s = r.targetView || i.targetView, a = r.viewFormat || i.viewFormat, l = r.requestedBreakpoint || i.requestedBreakpoint;
  let d = typeof r.resolvedProfileId != "undefined" ? r.resolvedProfileId : i.resolvedProfileId;
  const f = F(e, { validation: (H = r.validation) != null ? H : "strict" });
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
    if (n === "view")
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
      const b = $(
        "missing-profile-write-blocked",
        "error",
        `Dashboard profile "${l}" is missing; profile-scoped write-back was blocked.`,
        { layoutId: i.layoutId, profileId: l }
      );
      return o.push(b), {
        ok: !1,
        error: U("validation", b.message, { path: `layouts.${i.layoutId}.profiles.${l}` }),
        document: f.document,
        diagnostics: o
      };
    }
    d = l;
  }
  if (a === "grid") {
    const b = Ke(e, {
      layout: t,
      editorMetaById: r.editorMetaById || i.editorMetaById
    }, {
      layoutId: r.layoutId || i.layoutId,
      profileId: d || void 0,
      targetView: s,
      createMissingItems: r.createMissingItems,
      removeMissingItems: r.removeMissingItems,
      createMissingProfile: !!r.createMissingProfileOnEdit,
      writeItemIds: r.writeItemIds,
      validation: (P = r.validation) != null ? P : "strict"
    });
    return {
      ...b,
      diagnostics: o.concat(b.diagnostics)
    };
  }
  const m = ve(f.document), u = r.layoutId || i.layoutId || m.primaryLayoutId, c = m.layouts[u];
  if (!c) {
    const b = $(
      "projection-validation-failed",
      "error",
      `Dashboard layout "${u}" was not found.`,
      { layoutId: u }
    );
    return o.push(b), {
      ok: !1,
      error: U("invalid-document", b.message, { path: `layouts.${u}` }),
      document: m,
      diagnostics: o
    };
  }
  const p = _i(r.writeItemIds), v = new Set(t.map((b) => b.i)), k = gt(t), D = p ? k.filter((b) => p(b.i)) : k, j = mt(D, c, r, o, u, d);
  if (j)
    return {
      ok: !1,
      error: j,
      document: m,
      diagnostics: o
    };
  let y;
  if (d) {
    if (c.profiles = c.profiles || {}, !c.profiles[d]) {
      if (!r.createMissingProfileOnEdit) {
        const b = $(
          "missing-profile-write-blocked",
          "error",
          `Dashboard profile "${d}" is missing; profile-scoped write-back was blocked.`,
          { layoutId: u, profileId: d }
        );
        return o.push(b), {
          ok: !1,
          error: U("validation", b.message, { path: `layouts.${u}.profiles.${d}` }),
          document: m,
          diagnostics: o
        };
      }
      c.profiles[d] = { widgets: {} };
    }
    c.profiles[d].widgets = c.profiles[d].widgets || {}, y = c.profiles[d].widgets;
  } else
    y = c.widgets;
  r.removeMissingItems && ((O = r.writeItemIds) != null && O.length) && r.writeItemIds.filter(Boolean).forEach((b) => {
    var B;
    v.has(b) || (delete c.widgets[b], delete y[b], Object.values(c.profiles || {}).forEach((R) => {
      var T;
      R.widgets && delete R.widgets[b], (T = R.editor) != null && T.editorMetaById && delete R.editor.editorMetaById[b];
    }), (B = c.editor) != null && B.editorMetaById && delete c.editor.editorMetaById[b]);
  }), k.forEach((b, B) => {
    if (p && !p(b.i)) return;
    C(c.widgets, b.i) || (c.widgets[b.i] = oi(b));
    const R = y[b.i] || {};
    s === "mobile" ? y[b.i] = {
      ...R,
      mobileOrder: B,
      mobileHeight: b.h
    } : y[b.i] = {
      ...R,
      row: B,
      sizeY: b.h
    };
  });
  const S = F(m, { validation: (w = r.validation) != null ? w : "strict" });
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
const Te = (e, i) => e == null || Array.isArray(e) ? e : typeof e == "object" && C(e, i) ? e[i] || void 0 : e, ht = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return typeof e.minW != "undefined" && (i.minSizeX = e.minW), typeof e.minH != "undefined" && (i.minSizeY = e.minH), typeof e.maxW != "undefined" && (i.maxSizeX = e.maxW), typeof e.maxH != "undefined" && (i.maxSizeY = e.maxH), typeof e.static != "undefined" && (i.static = e.static), typeof e.isDraggable != "undefined" && (i.draggable = e.isDraggable), typeof e.isResizable != "undefined" && (i.resizable = e.isResizable), typeof e.isBounded != "undefined" && (i.bounded = e.isBounded), e.resizeHandles && (i.resizeHandles = e.resizeHandles.slice()), i;
}, pt = (e) => oi(e), Ne = (e, i, t) => {
  var a;
  const r = {}, o = (a = i.cols) == null ? void 0 : a[e];
  z(o) && o > 0 ? r.columns = o : i.cols && t.push($(
    "legacy-responsive-deferred",
    "warning",
    `Responsive cols for breakpoint "${e}" are missing; dashboard default columns will apply.`,
    { profileId: e, path: `cols.${e}` }
  ));
  const n = Te(i.margin, e);
  (z(n) || te(n)) && (r.margin = n);
  const s = Te(i.containerPadding, e);
  return te(s) && (r.containerPadding = [s[0], s[1]]), r;
};
function Et(e) {
  const i = [], t = Qe(e.breakpoints), r = Object.keys(e.layouts || {}).sort(), o = e.defaultBreakpoint || (t.length > 0 ? t[t.length - 1] : r[0] || fe), n = e.layouts[o] || [];
  e.layouts[o] || i.push($(
    "legacy-responsive-deferred",
    "warning",
    `Default responsive layout "${o}" was not present; an empty dashboard layout was created.`,
    { profileId: o, path: `layouts.${o}` }
  ));
  const s = {};
  Ie(n).sort(ce).forEach((d) => {
    s[d.i] = ht(d);
  });
  const a = {
    widgets: s,
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
      C(s, g.i) || i.push($(
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
      )), f[g.i] = pt(g);
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
      error: U("validation", "Responsive layouts could not be converted to a dashboard document.", { cause: d })
    };
  }
}
const ue = (e) => JSON.parse(JSON.stringify(e)), Q = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
}), K = (e, i, t, r = {}) => ({
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
}), yt = (e, i = 12) => {
  const t = e == null ? void 0 : e.columns;
  return typeof t == "number" && Number.isFinite(t) && t > 0 ? Math.floor(t) : i;
}, ni = (e, i = {}) => ({
  cols: yt(e),
  maxRows: typeof e.maxRows == "number" ? e.maxRows : 1 / 0,
  compactType: null,
  allowOverlap: !1,
  preventCollision: !0,
  diagnostics: { debug: !0 },
  ...i
}), We = (e, i) => ({
  ...e,
  ...i || {}
}), bt = (e) => {
  const i = /* @__PURE__ */ new Set();
  return e.affectedIds.forEach((t) => i.add(t)), e.patches.forEach((t) => {
    t.type === "add" ? i.add(t.item.i) : t.type === "compact" ? t.affectedIds.forEach((r) => i.add(r)) : i.add(t.id);
  }), i;
}, wt = (e, i, t) => K(
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
), si = (e, i, t) => {
  var o;
  const r = [];
  return (((o = e.diagnostics) == null ? void 0 : o.details) || []).forEach((n) => {
    r.push(wt(n, i, t));
  }), e.status === "blocked" && e.blocked && r.push(K("layout-operation-blocked", "error", `Layout operation was blocked: ${e.blocked.reason}.`, {
    layoutId: i,
    profileId: t || void 0,
    details: e.blocked
  })), e.status === "error" && e.error && r.push(K("layout-operation-error", "error", e.error.message, {
    layoutId: i,
    profileId: t || void 0,
    details: e.error.cause
  })), r;
}, Se = (e, i, t) => {
  var r, o;
  return t ? !!((o = (r = e.layouts[i]) == null ? void 0 : r.profiles) != null && o[t]) : !0;
}, ai = (e, i, t) => {
  const r = bt(i), o = t.profileId ? i.layout.filter((n) => r.has(n.i)) : i.layout;
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
function Ot(e, i) {
  var p, v;
  const t = F(e, { validation: (p = i.validation) != null ? p : "strict" }), r = t.ok ? ue(t.document) : ue(e), o = t.diagnostics.slice();
  if (!t.ok)
    return {
      ok: !1,
      document: r,
      error: t.error,
      diagnostics: o
    };
  const n = t.document, s = i.layoutId || n.primaryLayoutId;
  if (!n.layouts[s]) {
    const k = K("invalid-document", "error", `Dashboard layout "${s}" was not found.`, { layoutId: s });
    return {
      ok: !1,
      document: r,
      error: Q("invalid-document", k.message, { path: `layouts.${s}` }),
      diagnostics: o.concat(k)
    };
  }
  const l = i.profileId || null;
  if (l && !Se(n, s, l) && !i.createMissingProfile) {
    const k = K("profile-fallback", "error", `Dashboard profile "${l}" was not found; profile migration was blocked.`, {
      layoutId: s,
      profileId: l
    });
    return {
      ok: !1,
      document: r,
      error: Q("validation", k.message, { path: `layouts.${s}.profiles.${l}` }),
      diagnostics: o.concat(k)
    };
  }
  const d = di(n, {
    layoutId: s,
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
    engineOptions: ni(d.projection.gridSettings),
    id: `dashboard-migrate-${s}${l ? `-${l}` : ""}`,
    phase: "commit",
    debug: !0
  });
  if (o.push(...si(u, s, l)), u.status === "blocked" || u.status === "error")
    return {
      ok: !1,
      document: r,
      operation: u,
      error: Q((u.status === "error", "validation"), ((v = u.error) == null ? void 0 : v.message) || "Dashboard layout settings migration failed."),
      diagnostics: o
    };
  const c = ai(n, u, {
    layoutId: s,
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
  const r = F(e, { validation: (m = i.validation) != null ? m : "strict" }), o = r.ok ? ue(r.document) : ue(e), n = r.diagnostics.slice();
  if (!r.ok)
    return { ok: !1, document: o, error: r.error, diagnostics: n };
  const s = r.document, a = i.layoutId || s.primaryLayoutId, l = i.profileId || null;
  if (l && !Se(s, a, l) && !i.createMissingProfile) {
    const c = K("profile-fallback", "error", `Dashboard profile "${l}" was not found; geometry operation was blocked.`, {
      layoutId: a,
      profileId: l
    });
    return {
      ok: !1,
      document: o,
      error: Q("validation", c.message, { path: `layouts.${a}.profiles.${l}` }),
      diagnostics: n.concat(c)
    };
  }
  const d = di(s, {
    layoutId: a,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  if (n.push(...d.diagnostics), !d.ok)
    return { ok: !1, document: o, error: d.error, diagnostics: n };
  const f = t(
    d.projection.layout,
    ni(d.projection.gridSettings)
  );
  if (n.push(...si(f, a, l)), f.status === "blocked" || f.status === "error")
    return {
      ok: !1,
      document: o,
      operation: f,
      error: Q("validation", ((u = f.error) == null ? void 0 : u.message) || "Dashboard geometry operation failed."),
      diagnostics: n
    };
  const g = ai(s, f, {
    layoutId: a,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  return n.push(...g.diagnostics), g.ok ? { ok: !0, document: g.document, operation: f, diagnostics: n } : { ok: !1, document: o, operation: f, error: g.error, diagnostics: n };
};
function Rt(e, i = {}) {
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
function jt(e, i) {
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
  Et as b,
  $t as c,
  Yi as d,
  $ as e,
  St as f,
  Ht as g,
  zt as h,
  Dt as i,
  Ot as j,
  et as k,
  Mt as l,
  Ri as m,
  Ke as n,
  Je as p,
  Rt as r,
  Ge as s,
  jt as t,
  F as v,
  Pt as w
};
