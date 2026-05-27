import { r as hi } from "./resolve-C3SqJijI.mjs";
import { H as Ue, y as Se } from "./commands-BQlR3l-u.mjs";
import { j as pi, m as yi, r as bi, t as wi } from "./migration-CPonYzEY.mjs";
const re = 1, se = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), vi = ["s", "w", "e", "n", "sw", "nw", "se", "ne"], Ii = [
  "desktopHide",
  "mobileHide",
  "mobileHeight",
  "mobileOrder"
], ki = [
  "preserveAspectRatio",
  "aspectRatio"
], $i = [
  "static",
  "draggable",
  "resizable",
  "bounded",
  "resizeHandles",
  "preserveAspectRatio",
  "aspectRatio"
], oe = [
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
], he = [
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
], Si = [
  "widgets",
  "gridSettings",
  "breakpoints"
], Di = [
  "widgetLayouts",
  "widgets",
  "gridSettings"
], Y = (e, i) => Object.prototype.hasOwnProperty.call(e, i), v = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const i = Object.getPrototypeOf(e);
  return i === Object.prototype || i === null;
}, Hi = (e) => v(e), ie = (e) => typeof e == "number" && Number.isFinite(e), zi = (e) => Number.isInteger(e) && e > 0, Q = (e) => typeof e == "string" && e.trim() !== "", Mi = (e) => {
  const i = Date.parse(e);
  return Number.isFinite(i);
}, Ri = (e) => typeof e == "string" && vi.indexOf(e) !== -1, Oi = (e) => e === "auto" || e === "scroll" || e === "fit" || e === "fixed", Ei = (e) => e === "integer" || e === "subpixel", h = (e, i, t, o = {}) => ({
  code: e,
  level: i,
  message: t,
  ...o
}), R = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
}), De = (e, i) => {
  const t = i.find((o) => o.level === "error");
  return R("validation", e, {
    path: t == null ? void 0 : t.path,
    details: i
  });
}, L = (e, i, t, o = []) => {
  const r = [], s = (l) => (r.push(h("non-json-extension", "error", l, { path: t })), i === "sanitize" ? (r[r.length - 1].level = "warning", { ok: !0, value: void 0, diagnostics: r }) : { ok: !1, diagnostics: r });
  if (e == null || typeof e == "string" || typeof e == "boolean")
    return { ok: !0, value: e, diagnostics: r };
  if (typeof e == "number")
    return Number.isFinite(e) ? { ok: !0, value: e, diagnostics: r } : s("Dashboard JSON fields must not contain non-finite numbers.");
  if (typeof e == "bigint" || typeof e == "function" || typeof e == "symbol")
    return s("Dashboard JSON fields must not contain runtime values.");
  if (Array.isArray(e)) {
    if (o.indexOf(e) !== -1) return s("Dashboard JSON fields must not contain circular references.");
    const l = [], d = o.concat(e);
    for (let f = 0; f < e.length; f++) {
      const g = L(e[f], i, `${t}[${f}]`, d);
      if (r.push(...g.diagnostics), !g.ok) return { ok: !1, diagnostics: r };
      l.push(typeof g.value == "undefined" ? null : g.value);
    }
    return { ok: !0, value: l, diagnostics: r };
  }
  if (!v(e))
    return s("Dashboard JSON fields must contain plain JSON objects only.");
  if (o.indexOf(e) !== -1) return s("Dashboard JSON fields must not contain circular references.");
  const n = {}, a = o.concat(e);
  for (const l of Object.keys(e)) {
    if (se.has(l)) {
      const f = h("unsafe-key", i === "sanitize" ? "warning" : "error", "Dashboard JSON fields contain a reserved key.", {
        path: `${t}.${l}`
      });
      if (r.push(f), i !== "sanitize") return { ok: !1, diagnostics: r };
      continue;
    }
    const d = L(e[l], i, t ? `${t}.${l}` : l, a);
    if (r.push(...d.diagnostics), !d.ok) return { ok: !1, diagnostics: r };
    typeof d.value != "undefined" && (n[l] = d.value);
  }
  return { ok: !0, value: n, diagnostics: r };
}, Pi = (e, i, t) => {
  const o = L(e, i, t);
  if (!o.ok) return o;
  if (!Hi(o.value)) {
    const r = h("non-json-extension", i === "sanitize" ? "warning" : "error", "Dashboard field must be a JSON-safe object.", { path: t });
    return i === "sanitize" ? { ok: !0, value: {}, diagnostics: o.diagnostics.concat(r) } : { ok: !1, diagnostics: o.diagnostics.concat(r) };
  }
  return { ok: !0, value: o.value, diagnostics: o.diagnostics };
}, xt = (e, i = {}) => {
  var o;
  const t = L(e, (o = i.validation) != null ? o : "strict", "value");
  if (!t.ok) throw De("Dashboard JSON value could not be cloned.", t.diagnostics);
  return t.value;
}, ne = (e, i = "strict") => {
  const t = L(e, i, "document");
  if (!t.ok) throw De("Dashboard document could not be cloned.", t.diagnostics);
  return t.value;
}, ji = () => {
  const e = typeof globalThis != "undefined" ? globalThis.crypto : void 0;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `dashboard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}, Bi = () => `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, Fi = (e) => {
  if (typeof e != "string") return { ok: !0, value: e };
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch (i) {
    return {
      ok: !1,
      error: R("invalid-json", "Dashboard persistence payload is not valid JSON.", { cause: i })
    };
  }
}, E = (e, i, t) => {
  typeof t != "undefined" && (e[i] = t);
}, q = (e, i, t, o, r, s = {}) => {
  const n = e[t];
  return typeof n == "undefined" ? s.required ? h("invalid-item-geometry", "error", `${o}.${t} is required.`, { path: `${o}.${t}` }) : null : ie(n) ? typeof s.min == "number" && n < s.min ? r === "sanitize" && typeof s.clampMin == "number" ? (i[t] = Math.max(s.clampMin, n), h("invalid-item-geometry", "warning", `Clamped ${o}.${t}.`, { path: `${o}.${t}` })) : h("invalid-item-geometry", "error", `${o}.${t} is outside the supported range.`, { path: `${o}.${t}` }) : (i[t] = n, null) : h("invalid-item-geometry", "error", `${o}.${t} must be a finite number.`, { path: `${o}.${t}` });
}, pe = (e, i, t, o, r) => {
  const s = e[t];
  return typeof s == "undefined" ? null : !ie(s) || s <= 0 ? r === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${o}.${t}` })) : h("validation", "error", `${o}.${t} must be a finite positive number.`, { path: `${o}.${t}` }) : (i[t] = s, null);
}, Ze = (e, i, t, o, r) => typeof e[t] == "undefined" ? null : typeof e[t] != "boolean" ? r === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${o}.${t}` })) : h("validation", "error", `${o}.${t} must be a boolean.`, { path: `${o}.${t}` }) : (i[t] = e[t], null), ye = (e, i, t, o, r) => typeof e[t] == "undefined" ? null : typeof e[t] != "string" ? r === "sanitize" ? (delete i[t], h("item-field-dropped", "warning", `Dropped invalid ${t}.`, { path: `${o}.${t}` })) : h("validation", "error", `${o}.${t} must be a string.`, { path: `${o}.${t}` }) : (i[t] = e[t], null), Z = (e, i, t, o, r) => {
  if (typeof e[t] == "undefined") return [];
  const s = Pi(e[t], r, `${o}.${t}`);
  return s.ok && (i[t] = s.value), s.diagnostics;
}, F = (e, i) => {
  i && e.push(i);
}, T = (e) => e.find((i) => i.level === "error"), xi = (e, i, t, o) => {
  if (typeof e.resizeHandles == "undefined") return null;
  if (!Array.isArray(e.resizeHandles))
    return o === "sanitize" ? (delete i.resizeHandles, h("item-field-dropped", "warning", "Dropped invalid resizeHandles.", { path: `${t}.resizeHandles` })) : h("validation", "error", `${t}.resizeHandles must be an array.`, { path: `${t}.resizeHandles` });
  const r = e.resizeHandles.filter(Ri);
  return r.length !== e.resizeHandles.length && o !== "sanitize" ? h("validation", "error", `${t}.resizeHandles contains an invalid handle.`, { path: `${t}.resizeHandles` }) : (r.length > 0 && (i.resizeHandles = r), r.length !== e.resizeHandles.length ? h("item-field-cleaned", "warning", "Removed invalid resize handle values.", { path: `${t}.resizeHandles` }) : null);
}, be = (e, i, t, o) => {
  const r = L(e, t, i);
  if (!r.ok) return { ok: !1, diagnostics: r.diagnostics };
  if (!v(r.value))
    return {
      ok: !1,
      diagnostics: r.diagnostics.concat(h("validation", "error", `${i} must be an object.`, { path: i }))
    };
  const s = r.value, n = { ...s }, a = r.diagnostics.slice();
  F(a, q(s, n, "col", i, t, { required: o, min: 0, clampMin: 0 })), F(a, q(s, n, "row", i, t, { required: o, min: 0, clampMin: 0 })), F(a, q(s, n, "sizeX", i, t, { required: o, min: 1, clampMin: 1 })), F(a, q(s, n, "sizeY", i, t, { required: o, min: 1, clampMin: 1 }));
  for (const d of ["minSizeX", "minSizeY", "maxSizeX", "maxSizeY", "mobileHeight", "aspectRatio"])
    F(a, pe(s, n, d, i, t));
  typeof s.mobileOrder != "undefined" && F(a, q(s, n, "mobileOrder", i, t));
  for (const d of ["static", "draggable", "resizable", "bounded", "desktopHide", "mobileHide", "preserveAspectRatio"])
    F(a, Ze(s, n, d, i, t));
  return F(a, xi(s, n, i, t)), a.push(...Z(s, n, "extensions", i, t)), T(a) ? { ok: !1, diagnostics: a } : { ok: !0, item: n, diagnostics: a };
}, Re = (e, i, t) => {
  if (!Array.isArray(e) || e.length !== 2 || !ie(e[0]) || !ie(e[1])) {
    const o = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be a two-number tuple.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: [o] } : { ok: !1, diagnostics: [o] };
  }
  return { ok: !0, value: [e[0], e[1]], diagnostics: [] };
}, we = (e, i, t) => {
  if (typeof e == "undefined") return { ok: !0, settings: void 0, diagnostics: [] };
  const o = L(e, t, i);
  if (!o.ok) return { ok: !1, diagnostics: o.diagnostics };
  if (!v(o.value)) {
    const a = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be an object.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: o.diagnostics.concat(a) } : { ok: !1, diagnostics: o.diagnostics.concat(a) };
  }
  const r = o.value, s = { ...r }, n = o.diagnostics.slice();
  for (const a of ["columns", "minColumns", "rowHeight", "mobileRowHeight", "minRowHeight"])
    F(n, pe(r, s, a, i, t));
  for (const a of ["outerMargin", "autoFillHeight", "mobileAutoFillHeight", "mobileDisplayLayoutFirst"])
    F(n, Ze(r, s, a, i, t));
  for (const a of ["backgroundColor", "backgroundSizeMode", "backgroundImageUrl"])
    F(n, ye(r, s, a, i, t));
  if (typeof r.margin != "undefined")
    if (ie(r.margin))
      s.margin = r.margin;
    else {
      const a = Re(r.margin, `${i}.margin`, t);
      if (n.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: n };
      a.value ? s.margin = a.value : delete s.margin;
    }
  if (typeof r.containerPadding != "undefined") {
    const a = Re(r.containerPadding, `${i}.containerPadding`, t);
    if (n.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: n };
    a.value ? s.containerPadding = a.value : delete s.containerPadding;
  }
  typeof r.viewFormat != "undefined" && r.viewFormat !== "grid" && r.viewFormat !== "list" && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid viewFormat.", { path: `${i}.viewFormat` })), delete s.viewFormat) : n.push(h("validation", "error", `${i}.viewFormat must be "grid" or "list".`, { path: `${i}.viewFormat` })));
  for (const a of ["heightMode", "mobileHeightMode"])
    typeof r[a] != "undefined" && !Oi(r[a]) && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", `Dropped invalid ${a}.`, { path: `${i}.${a}` })), delete s[a]) : n.push(h("validation", "error", `${i}.${a} must be "auto", "scroll", "fit", or "fixed".`, { path: `${i}.${a}` })));
  if (typeof r.renderPrecision != "undefined" && !Ei(r.renderPrecision) && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid renderPrecision.", { path: `${i}.renderPrecision` })), delete s.renderPrecision) : n.push(h("validation", "error", `${i}.renderPrecision must be "integer" or "subpixel".`, { path: `${i}.renderPrecision` }))), typeof r.layoutDimension != "undefined")
    if (!v(r.layoutDimension))
      t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid layoutDimension.", { path: `${i}.layoutDimension` })), delete s.layoutDimension) : n.push(h("validation", "error", `${i}.layoutDimension must be an object.`, { path: `${i}.layoutDimension` }));
    else {
      const a = { ...r.layoutDimension };
      typeof a.type != "undefined" && a.type !== "percentage" && a.type !== "fixed" && (t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid layoutDimension.type.", { path: `${i}.layoutDimension.type` })), delete a.type) : n.push(h("validation", "error", `${i}.layoutDimension.type is invalid.`, { path: `${i}.layoutDimension.type` })));
      for (const l of ["fixedWidth", "leftWidthPercentage"])
        F(n, pe(a, a, l, `${i}.layoutDimension`, t));
      F(n, ye(a, a, "fixedLayout", `${i}.layoutDimension`, t)), s.layoutDimension = a;
    }
  return n.push(...Z(r, s, "extensions", i, t)), T(n) ? { ok: !1, diagnostics: n } : { ok: !0, settings: s, diagnostics: n };
}, ve = (e) => e.map((i) => ({ i, x: 0, y: 0, w: 1, h: 1 })), Ke = (e) => {
  const i = new Set(Object.keys(e.itemMembership));
  return JSON.parse(JSON.stringify({
    version: 1,
    items: Object.keys(e.items).reduce((t, o) => {
      const r = e.items[o];
      return t[o] = {
        ...r,
        itemIds: r.itemIds ? r.itemIds.filter((s) => i.has(s)) : void 0,
        allowedDropZones: r.allowedDropZones ? r.allowedDropZones.slice() : void 0,
        bounds: r.bounds ? { ...r.bounds } : void 0
      }, t;
    }, {}),
    itemMembership: e.itemMembership
  }));
}, Oe = (e, i, t, o) => {
  if (typeof e == "undefined") return { ok: !0, editor: void 0, diagnostics: [] };
  const r = L(e, t, i);
  if (!r.ok) return { ok: !1, diagnostics: r.diagnostics };
  if (!v(r.value)) {
    const l = h("validation", t === "sanitize" ? "warning" : "error", `${i} must be an object.`, { path: i });
    return t === "sanitize" ? { ok: !0, diagnostics: r.diagnostics.concat(l) } : { ok: !1, diagnostics: r.diagnostics.concat(l) };
  }
  const s = r.value, n = { ...s }, a = r.diagnostics.slice();
  if (zi(s.version) || (t === "sanitize" ? (a.push(h("item-field-cleaned", "warning", "Defaulted invalid editor version.", { path: `${i}.version` })), n.version = 1) : a.push(h("validation", "error", `${i}.version must be a positive integer.`, { path: `${i}.version` }))), typeof s.updatedAt != "undefined" && F(a, ye(s, n, "updatedAt", i, t)), typeof s.editorMetaById != "undefined") {
    const l = Ue(s.editorMetaById, {
      layout: ve(o),
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
  if (typeof s.sectionRows != "undefined") {
    const l = Se(
      s.sectionRows,
      ve(o)
    );
    l.warnings.forEach((d) => {
      a.push(h(
        d.code,
        "warning",
        d.message,
        {
          path: `${i}.sectionRows`,
          details: d
        }
      ));
    }), n.sectionRows = Ke(l), n.version = Math.max(Number(n.version) || 1, 2);
  }
  return a.push(...Z(s, n, "extensions", i, t)), T(a) ? { ok: !1, diagnostics: a } : { ok: !0, editor: n, diagnostics: a };
}, Ai = (e, i, t) => {
  const o = L(e, t, i);
  if (!o.ok) return { ok: !1, diagnostics: o.diagnostics };
  if (!v(o.value))
    return {
      ok: !1,
      diagnostics: o.diagnostics.concat(h("validation", "error", `${i} must be an object.`, { path: i }))
    };
  const r = o.value, s = { ...r }, n = o.diagnostics.slice();
  if (!v(r.widgets))
    return {
      ok: !1,
      diagnostics: n.concat(h("validation", "error", `${i}.widgets must be an object map.`, { path: `${i}.widgets` }))
    };
  const a = {};
  for (const f of Object.keys(r.widgets)) {
    if (!Q(f) || se.has(f)) {
      n.push(h("validation", "error", "Widget ids must be safe non-empty strings.", { path: `${i}.widgets.${f}`, itemId: f }));
      continue;
    }
    const g = be(r.widgets[f], `${i}.widgets.${f}`, t, !0);
    n.push(...g.diagnostics.map((m) => {
      var u;
      return { ...m, itemId: (u = m.itemId) != null ? u : f };
    })), g.ok && (a[f] = g.item);
  }
  s.widgets = a;
  const l = we(r.gridSettings, `${i}.gridSettings`, t);
  if (n.push(...l.diagnostics), !l.ok) return { ok: !1, diagnostics: n };
  if (l.settings ? s.gridSettings = l.settings : delete s.gridSettings, typeof r.profiles != "undefined")
    if (!v(r.profiles))
      t === "sanitize" ? (n.push(h("item-field-dropped", "warning", "Dropped invalid profiles.", { path: `${i}.profiles` })), delete s.profiles) : n.push(h("validation", "error", `${i}.profiles must be an object map.`, { path: `${i}.profiles` }));
    else {
      const f = {};
      for (const g of Object.keys(r.profiles)) {
        const m = `${i}.profiles.${g}`;
        if (!Q(g) || se.has(g)) {
          n.push(h("validation", "error", "Profile ids must be safe non-empty strings.", { path: m, profileId: g }));
          continue;
        }
        if (!v(r.profiles[g])) {
          n.push(h("validation", t === "sanitize" ? "warning" : "error", `${m} must be an object.`, { path: m, profileId: g }));
          continue;
        }
        const u = r.profiles[g], c = { ...u };
        if (typeof u.widgets != "undefined")
          if (!v(u.widgets))
            n.push(h("validation", t === "sanitize" ? "warning" : "error", `${m}.widgets must be an object map.`, { path: `${m}.widgets`, profileId: g })), t === "sanitize" && delete c.widgets;
          else {
            const k = {};
            for (const D of Object.keys(u.widgets)) {
              const j = be(u.widgets[D], `${m}.widgets.${D}`, t, !1);
              n.push(...j.diagnostics.map((O) => {
                var B;
                return { ...O, itemId: (B = O.itemId) != null ? B : D, profileId: g };
              })), j.ok && (k[D] = j.item, Y(a, D) || n.push(h("unknown-item", "warning", `Profile "${g}" references an unknown widget "${D}".`, {
                path: `${m}.widgets.${D}`,
                itemId: D,
                profileId: g
              })));
            }
            c.widgets = k;
          }
        const p = we(u.gridSettings, `${m}.gridSettings`, t);
        if (n.push(...p.diagnostics.map((k) => ({ ...k, profileId: g }))), !p.ok) return { ok: !1, diagnostics: n };
        p.settings ? c.gridSettings = p.settings : delete c.gridSettings;
        const w = Oe(u.editor, `${m}.editor`, t, Object.keys(a));
        if (n.push(...w.diagnostics.map((k) => ({ ...k, profileId: g }))), !w.ok) return { ok: !1, diagnostics: n };
        w.editor ? c.editor = w.editor : delete c.editor, n.push(...Z(u, c, "extensions", m, t)), f[g] = c;
      }
      s.profiles = f;
    }
  const d = Oe(r.editor, `${i}.editor`, t, Object.keys(a));
  return n.push(...d.diagnostics), d.ok ? (d.editor ? s.editor = d.editor : delete s.editor, n.push(...Z(r, s, "extensions", i, t)), T(n) ? { ok: !1, diagnostics: n } : { ok: !0, layout: s, diagnostics: n }) : { ok: !1, diagnostics: n };
};
function x(e, i = {}) {
  var m, u;
  const t = (m = i.currentVersion) != null ? m : re, o = (u = i.validation) != null ? u : "strict", r = L(e, o, "document"), s = r.diagnostics.slice();
  if (!r.ok)
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((c) => c.level === "warning"),
      diagnostics: s,
      error: {
        ...De("Dashboard document must contain JSON-safe values only.", s),
        originalPayload: e
      }
    };
  if (!v(r.value)) {
    const c = h("invalid-document", "error", "Dashboard document must be an object.", { path: "document" });
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s.concat(c),
      error: R("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  const n = r.value, a = { ...n };
  if (n.dashboardSchemaVersion !== t) {
    const c = h("invalid-document", "error", `Expected dashboard schema version ${t}.`, { path: "dashboardSchemaVersion" });
    return s.push(c), {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: R("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  if (n.kind !== "dashboard-layout") {
    const c = h("invalid-document", "error", 'Dashboard document kind must be "dashboard-layout".', { path: "kind" });
    s.push(c);
  }
  for (const c of ["key", "revision", "sourceId", "savedAt", "primaryLayoutId"])
    Q(n[c]) || s.push(h("invalid-document", "error", `Dashboard document ${c} must be a non-empty string.`, { path: c }));
  if (Q(n.savedAt) && !Mi(n.savedAt) && s.push(h("invalid-document", "error", "Dashboard document savedAt must be a valid date string.", { path: "savedAt" })), v(n.layouts) || s.push(h("invalid-document", "error", "Dashboard document layouts must be an object map.", { path: "layouts" })), T(s)) {
    const c = T(s);
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: R(c.code === "invalid-document" ? "invalid-document" : "validation", c.message, {
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
      error: R("invalid-document", c.message, { path: c.path, originalPayload: e })
    };
  }
  const f = {};
  for (const c of Object.keys(l)) {
    if (!Q(c) || se.has(c)) {
      s.push(h("invalid-document", "error", "Layout ids must be safe non-empty strings.", { path: `layouts.${c}`, layoutId: c }));
      continue;
    }
    const p = Ai(l[c], `layouts.${c}`, o);
    s.push(...p.diagnostics.map((w) => {
      var k;
      return { ...w, layoutId: (k = w.layoutId) != null ? k : c };
    })), p.ok && (f[c] = p.layout);
  }
  if (typeof n.meta != "undefined" ? s.push(...Z(n, a, "meta", "document", o)) : delete a.meta, T(s)) {
    const c = T(s);
    return {
      ok: !1,
      originalPayload: e,
      warnings: s.filter((p) => p.level === "warning"),
      diagnostics: s,
      error: R(c.code === "invalid-document" ? "invalid-document" : "validation", c.message, {
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
function qe(e, i) {
  var m, u, c, p;
  const t = (m = i.now) != null ? m : () => /* @__PURE__ */ new Date(), o = (u = i.revision) != null ? u : Bi, r = t().toISOString(), s = (c = i.sourceId) != null ? c : v(e) && typeof e.sourceId == "string" ? e.sourceId : ji(), n = v(e) && e.kind === "dashboard-layout" && v(e.layouts), a = n && typeof e.primaryLayoutId == "string" ? e.primaryLayoutId : "default", l = n ? e.layouts : { [a]: e }, d = (p = i.meta) != null ? p : n ? e.meta : void 0, f = {
    ...n ? e : {},
    dashboardSchemaVersion: re,
    kind: "dashboard-layout",
    key: i.key,
    revision: o(),
    sourceId: s,
    savedAt: r,
    primaryLayoutId: a,
    layouts: l,
    ...d ? { meta: d } : {}
  }, g = x(f, {
    currentVersion: re,
    validation: "strict"
  });
  if (!g.ok) throw g.error;
  return g.document;
}
function Li(e, i = {}) {
  var f, g, m;
  const t = (f = i.currentVersion) != null ? f : re, o = (g = i.migrations) != null ? g : {}, r = e, s = [], n = [];
  if (!v(e) || !Number.isInteger(e.dashboardSchemaVersion))
    return { ok: !1, error: R("invalid-document", "Document has no numeric dashboardSchemaVersion.", {
      path: "dashboardSchemaVersion",
      originalPayload: r
    }), originalPayload: r, migrations: s, warnings: [], diagnostics: n };
  let a = e.dashboardSchemaVersion;
  if (a > t)
    return { ok: !1, error: R("invalid-document", `Dashboard schema version ${a} is newer than supported ${t}.`, {
      path: "dashboardSchemaVersion",
      originalPayload: r
    }), originalPayload: r, migrations: s, warnings: [], diagnostics: n };
  let l = e;
  for (; a < t; ) {
    const u = o[a];
    if (!u) {
      const c = h("migration-missing", "error", `Missing dashboard migration from version ${a} to ${a + 1}.`);
      return n.push(c), {
        ok: !1,
        originalPayload: r,
        migrations: s,
        warnings: n.filter((p) => p.level === "warning"),
        diagnostics: n,
        error: R("migration-missing", c.message, { originalPayload: r })
      };
    }
    try {
      l = u(l, { fromVersion: a, toVersion: a + 1 });
    } catch (c) {
      const p = h("migration-failed", "error", `Dashboard migration from version ${a} to ${a + 1} failed.`, { details: c });
      return n.push(p), {
        ok: !1,
        originalPayload: r,
        migrations: s,
        warnings: n.filter((w) => w.level === "warning"),
        diagnostics: n,
        error: R("migration-failed", p.message, { cause: c, originalPayload: r })
      };
    }
    if (!v(l) || l.dashboardSchemaVersion !== a + 1) {
      const c = h("migration-failed", "error", `Dashboard migration from version ${a} to ${a + 1} returned an invalid document.`);
      return n.push(c), {
        ok: !1,
        originalPayload: r,
        migrations: s,
        warnings: n.filter((p) => p.level === "warning"),
        diagnostics: n,
        error: R("migration-failed", c.message, { originalPayload: r })
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
    originalPayload: r,
    warnings: n.filter((u) => u.level === "warning"),
    diagnostics: n
  } : {
    ok: !1,
    originalPayload: r,
    migrations: s,
    warnings: n.filter((u) => u.level === "warning"),
    diagnostics: n,
    error: s.length > 0 ? R("migration-failed", "Dashboard migration result failed validation.", {
      cause: d.error,
      originalPayload: r
    }) : d.error
  };
}
function At(e, i = {}) {
  var r;
  const t = Fi(e);
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
  const o = Li(t.value, {
    currentVersion: i.currentVersion,
    migrations: i.migrations,
    validation: (r = i.validation) != null ? r : "strict"
  });
  return o.ok ? {
    ok: !0,
    document: o.document,
    migrations: o.migrations,
    warnings: o.warnings,
    diagnostics: o.diagnostics
  } : {
    ok: !1,
    error: o.error,
    fallback: i.fallback ? ne(i.fallback, "strict") : void 0,
    originalPayload: o.originalPayload,
    migrations: o.migrations,
    warnings: o.warnings,
    diagnostics: o.diagnostics
  };
}
const Vi = (e) => {
  var i, t, o, r, s, n, a, l;
  return {
    ...e || {},
    columns: (i = e == null ? void 0 : e.columns) != null ? i : 12,
    minColumns: (t = e == null ? void 0 : e.minColumns) != null ? t : 1,
    margin: (o = e == null ? void 0 : e.margin) != null ? o : 10,
    outerMargin: (r = e == null ? void 0 : e.outerMargin) != null ? r : !0,
    viewFormat: (s = e == null ? void 0 : e.viewFormat) != null ? s : "grid",
    rowHeight: (n = e == null ? void 0 : e.rowHeight) != null ? n : 150,
    autoFillHeight: (a = e == null ? void 0 : e.autoFillHeight) != null ? a : !1,
    heightMode: e == null ? void 0 : e.heightMode,
    mobileHeightMode: e == null ? void 0 : e.mobileHeightMode,
    minRowHeight: e == null ? void 0 : e.minRowHeight,
    renderPrecision: (l = e == null ? void 0 : e.renderPrecision) != null ? l : "integer"
  };
}, Ni = (e, i) => {
  const t = {
    i: e,
    x: i.col,
    y: i.row,
    w: i.sizeX,
    h: i.sizeY
  };
  return E(t, "minW", i.minSizeX), E(t, "minH", i.minSizeY), E(t, "maxW", i.maxSizeX), E(t, "maxH", i.maxSizeY), E(t, "static", i.static), E(t, "isDraggable", i.draggable), E(t, "isResizable", i.resizable), E(t, "isBounded", i.bounded), i.resizeHandles && (t.resizeHandles = i.resizeHandles.slice()), t;
}, Ti = (e, i) => ({
  ...e,
  ...i || {}
}), Ee = (e) => {
  if (!e) return;
  const i = {};
  return E(i, "static", e.static), E(i, "draggable", e.draggable), E(i, "resizable", e.resizable), E(i, "bounded", e.bounded), e.resizeHandles && (i.resizeHandles = e.resizeHandles.slice()), E(i, "preserveAspectRatio", e.preserveAspectRatio), E(i, "aspectRatio", e.aspectRatio), Object.keys(i).length > 0 ? i : void 0;
}, _i = (e, i) => h(
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
), Wi = (e, i, t) => {
  t.profileId && $i.forEach((o) => {
    const r = !!(t.profileItem && Y(t.profileItem, o) && typeof t.profileItem[o] != "undefined"), s = Y(t.baseItem, o) && typeof t.baseItem[o] != "undefined";
    if (!r && !s) return;
    const n = r ? "item-capability.profile-overridden" : "item-capability.profile-inherited", a = i.sourceLists[o] || [];
    e.push(h(
      n,
      "info",
      r ? `Profile capability field ${o} overrides the default item.` : `Profile capability field ${o} is inherited from the default item.`,
      {
        layoutId: t.layoutId,
        profileId: t.profileId || void 0,
        itemId: t.itemId,
        path: r ? `layouts.${t.layoutId}.profiles.${t.profileId}.widgets.${t.itemId}.${o}` : `layouts.${t.layoutId}.widgets.${t.itemId}.${o}`,
        details: {
          field: o,
          mode: r ? "overridden" : "inherited",
          effectiveSource: i.sources[o],
          sourceLists: a
        }
      }
    ));
  });
}, Ci = (e, i) => e.y !== i.y ? e.y - i.y : e.x !== i.x ? e.x - i.x : e.i < i.i ? -1 : e.i > i.i ? 1 : 0, Qe = (e, i, t) => {
  const o = Ue(e, { layout: i, removeOrphans: !0 });
  return o.warnings.forEach((r) => {
    t.push(h(
      r.code === "orphan-meta" ? "orphan-editor-meta" : r.code,
      "warning",
      r.message,
      { path: r.path }
    ));
  }), o.errors.forEach((r) => {
    t.push(h(r.code, "warning", r.message, { path: r.path }));
  }), o.value;
};
function ei(e, i = {}) {
  var D, j, O, B, I, S, z;
  const t = x(e, { validation: (D = i.validation) != null ? D : "strict" }), o = t.diagnostics.slice();
  if (!t.ok)
    return { ok: !1, error: t.error, originalPayload: t.originalPayload, diagnostics: o };
  const r = t.document;
  let s = !1, n = (j = i.layoutId) != null ? j : r.primaryLayoutId;
  if (n !== r.primaryLayoutId && !i.allowNonPrimary && (o.push(h("deferred-layout-slot", "info", "Only the primary dashboard layout is projected in this version.", {
    layoutId: n
  })), n = r.primaryLayoutId, s = !0), !r.layouts[n]) {
    const y = R("invalid-document", `Dashboard layout "${n}" was not found.`, {
      path: `layouts.${n}`
    });
    return o.push(h("invalid-document", "error", y.message, { layoutId: n, path: y.path })), { ok: !1, error: y, originalPayload: e, diagnostics: o };
  }
  Object.keys(r.layouts).forEach((y) => {
    y !== n && y !== r.primaryLayoutId && o.push(h("deferred-layout-slot", "info", "Non-primary dashboard layout slot is preserved but not projected.", { layoutId: y }));
  });
  const a = r.layouts[n], l = i.profileId && ((O = a.profiles) != null && O[i.profileId]) ? i.profileId : null;
  i.profileId && !l && (o.push(h("profile-fallback", "warning", `Dashboard profile "${i.profileId}" was not found; projected primary layout.`, {
    layoutId: n,
    profileId: i.profileId
  })), s = !0);
  const d = l ? (B = a.profiles) == null ? void 0 : B[l] : void 0;
  d != null && d.widgets && Object.keys(d.widgets).forEach((y) => {
    Y(a.widgets, y) || o.push(h("unknown-item", "warning", `Profile "${l}" contains unknown widget "${y}".`, {
      layoutId: n,
      profileId: l || void 0,
      itemId: y,
      path: `layouts.${n}.profiles.${l}.widgets.${y}`
    }));
  });
  const f = (I = i.targetView) != null ? I : "desktop", g = [], m = {}, u = {}, c = {
    ...((S = a.editor) == null ? void 0 : S.editorMetaById) || {}
  };
  (z = d == null ? void 0 : d.editor) != null && z.editorMetaById && Object.keys(d.editor.editorMetaById).forEach((y) => {
    var M, b;
    c[y] = {
      ...c[y] || {},
      ...(b = (M = d.editor) == null ? void 0 : M.editorMetaById) == null ? void 0 : b[y]
    };
  }), Object.keys(a.widgets).forEach((y) => {
    var ze, Me;
    const M = a.widgets[y], b = (ze = d == null ? void 0 : d.widgets) == null ? void 0 : ze[y], P = Ti(a.widgets[y], (Me = d == null ? void 0 : d.widgets) == null ? void 0 : Me[y]), N = Ni(y, P);
    g.push(N);
    const A = { ...c[y] || {} };
    (f === "mobile" ? P.mobileHide === !0 : P.desktopHide === !0) ? (A.visible === !0 && o.push(h("editor-capability-conflict", "warning", "Dashboard visibility overrides editor metadata.", {
      layoutId: n,
      profileId: l || void 0,
      itemId: y
    })), A.visible = !1) : typeof A.visible == "undefined" && (A.visible = !0), P.resizable === !1 && (A.resizable === !0 && o.push(h("editor-capability-conflict", "warning", "Dashboard resizable=false overrides editor metadata.", {
      layoutId: n,
      profileId: l || void 0,
      itemId: y
    })), A.resizable = !1), c[y] = A;
    const _ = pi({
      item: N,
      dashboard: Ee(M),
      profile: Ee(b),
      editor: A,
      preserveUnknownFields: !0
    });
    m[y] = _, _.aspectRatio && (u[y] = _.aspectRatio), _.diagnostics.forEach((V) => {
      o.push(_i(V, {
        layoutId: n,
        profileId: l,
        itemId: y
      }));
    }), Wi(o, _, {
      layoutId: n,
      profileId: l,
      itemId: y,
      baseItem: M,
      profileItem: b
    }), Ii.forEach((V) => {
      typeof P[V] != "undefined" && o.push(h("unsupported-field", "info", `${V} is preserved in the dashboard document but not written to LayoutItem.`, {
        layoutId: n,
        profileId: l || void 0,
        itemId: y,
        path: `layouts.${n}.widgets.${y}.${V}`
      }));
    }), ki.forEach((V) => {
      typeof P[V] != "undefined" && o.push(h("item-capability.sidecar-projected", "info", `${V} was projected through capability sidecar and not written to LayoutItem.`, {
        layoutId: n,
        profileId: l || void 0,
        itemId: y,
        path: `layouts.${n}.widgets.${y}.${V}`
      }));
    });
  }), g.sort(Ci);
  const p = Qe(c, g, o), w = Vi({
    ...a.gridSettings || {},
    ...(d == null ? void 0 : d.gridSettings) || {}
  });
  return (a.gridSettings || d != null && d.gridSettings) && o.push(h("unsupported-field", "info", "Dashboard grid settings are returned as sidecar runtime settings and are not written to LayoutItem.", {
    layoutId: n,
    profileId: l || void 0,
    path: d != null && d.gridSettings ? `layouts.${n}.profiles.${l}.gridSettings` : `layouts.${n}.gridSettings`
  })), { ok: !0, projection: {
    layout: g,
    gridSettings: w,
    editorMetaById: p,
    capabilitiesById: m,
    resizeConstraintsById: Object.keys(u).length > 0 ? u : void 0,
    layoutId: n,
    profileId: l,
    fallbackApplied: s,
    diagnostics: o
  }, diagnostics: o };
}
const Pe = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return E(i, "minSizeX", e.minW), E(i, "minSizeY", e.minH), E(i, "maxSizeX", e.maxW), E(i, "maxSizeY", e.maxH), i;
}, je = (e, i) => {
  if (!e && !i) return;
  const t = {};
  return Object.keys(e || {}).forEach((o) => {
    t[o] = { ...e[o] };
  }), Object.keys(i || {}).forEach((o) => {
    t[o] = {
      ...t[o] || {},
      ...i[o]
    };
  }), t;
}, Yi = (e) => {
  if (!e) return null;
  const i = new Set(e.filter(Boolean));
  return (t) => i.has(t);
}, Be = (e, i) => {
  if (!e || !i) return e;
  const t = new Set(i.filter(Boolean)), o = {};
  return Object.keys(e).forEach((r) => {
    t.has(r) && (o[r] = e[r]);
  }), Object.keys(o).length > 0 ? o : void 0;
}, Ji = (e, i, t, o) => {
  if (!e) return;
  const r = Se(e, i);
  return r.warnings.forEach((s) => {
    var n;
    t.push(h(
      s.code,
      "warning",
      s.message,
      {
        path: o.path,
        layoutId: o.layoutId,
        profileId: o.profileId,
        itemId: (n = s.itemIds) == null ? void 0 : n[0],
        details: s
      }
    ));
  }), Ke(r);
}, Xi = (e, i) => {
  if (!e) return e;
  const t = {
    version: 1,
    items: Object.keys(e.items || {}).reduce((r, s) => {
      const n = e.items[s];
      return r[s] = {
        ...n,
        bounds: n.bounds ? { ...n.bounds } : void 0,
        itemIds: n.itemIds ? n.itemIds.filter((a) => a !== i) : void 0,
        allowedDropZones: n.allowedDropZones ? n.allowedDropZones.slice() : void 0
      }, r;
    }, {}),
    itemMembership: { ...e.itemMembership || {} }
  }, o = t.itemMembership || {};
  return delete o[i], t.itemMembership = o, JSON.parse(JSON.stringify(t));
}, Fe = (e, i) => {
  e != null && e.editor && (e.editor.editorMetaById && delete e.editor.editorMetaById[i], e.editor.sectionRows = Xi(e.editor.sectionRows, i));
}, xe = (e) => (e.editor = e.editor || { version: 1 }, e.editor);
function ii(e, i, t = {}) {
  var p, w, k, D, j, O, B;
  const o = x(e, { validation: (p = t.validation) != null ? p : "strict" }), r = o.diagnostics.slice(), s = o.ok ? o.document : ne(e, "sanitize");
  if (!o.ok)
    return {
      ok: !1,
      error: o.error,
      document: s,
      originalPayload: o.originalPayload,
      diagnostics: r
    };
  const n = ne(s, "strict"), a = (w = t.layoutId) != null ? w : n.primaryLayoutId, l = n.layouts[a];
  if (!l) {
    const I = h("invalid-document", "error", `Dashboard layout "${a}" was not found.`, { layoutId: a });
    return r.push(I), {
      ok: !1,
      error: R("invalid-document", I.message, { path: `layouts.${a}` }),
      document: n,
      diagnostics: r
    };
  }
  let d;
  if (t.profileId) {
    if (l.profiles = l.profiles || {}, !l.profiles[t.profileId]) {
      if (!t.createMissingProfile) {
        const I = h("profile-fallback", "error", `Dashboard profile "${t.profileId}" was not found.`, {
          layoutId: a,
          profileId: t.profileId
        });
        return r.push(I), {
          ok: !1,
          error: R("validation", I.message, { path: `layouts.${a}.profiles.${t.profileId}` }),
          document: n,
          diagnostics: r
        };
      }
      l.profiles[t.profileId] = { widgets: {} };
    }
    l.profiles[t.profileId].widgets = l.profiles[t.profileId].widgets || {}, d = l.profiles[t.profileId].widgets;
  } else
    d = l.widgets;
  const f = Yi(t.writeItemIds), g = new Set(i.layout.map((I) => I.i));
  t.removeMissingItems && ((k = t.writeItemIds) != null && k.length) && t.writeItemIds.filter(Boolean).forEach((I) => {
    g.has(I) || (delete l.widgets[I], delete d[I], Object.values(l.profiles || {}).forEach((S) => {
      S.widgets && delete S.widgets[I], Fe(S, I);
    }), Fe(l, I));
  });
  for (const I of i.layout) {
    const S = I.i;
    if (f && !f(S)) continue;
    const z = Y(l.widgets, S);
    if (!z && !t.createMissingItems) {
      const M = h("unknown-item", "error", `Runtime layout contains unknown dashboard widget "${S}".`, {
        layoutId: a,
        profileId: t.profileId,
        itemId: S
      });
      return r.push(M), {
        ok: !1,
        error: R("unknown-item", M.message, { details: { itemId: S } }),
        document: n,
        diagnostics: r
      };
    }
    z || (l.widgets[S] = Pe(I));
    const y = d[S] || {};
    d[S] = {
      ...y,
      ...Pe(I)
    };
  }
  if (i.gridSettings)
    if (t.profileId) {
      const I = (D = l.profiles) == null ? void 0 : D[t.profileId];
      I && (I.gridSettings = {
        ...I.gridSettings || {},
        ...i.gridSettings
      });
    } else
      l.gridSettings = {
        ...l.gridSettings || {},
        ...i.gridSettings
      };
  const m = je(
    Be(t.editorMetaById, t.writeItemIds),
    Be(i.editorMetaById, t.writeItemIds)
  );
  if (m) {
    const I = t.profileId ? (j = l.profiles) == null ? void 0 : j[t.profileId] : l, S = xe(I);
    S.editorMetaById = je(S.editorMetaById, m), Object.keys(m).forEach((z) => {
      if (!Y(l.widgets, z)) {
        r.push(h("orphan-editor-meta", "warning", `Editor metadata references unknown widget "${z}".`, {
          layoutId: a,
          itemId: z
        }));
        return;
      }
      const y = m[z], M = t.profileId ? d[z] || {} : l.widgets[z];
      typeof y.resizable == "boolean" && (M.resizable = y.resizable, d[z] = M), t.targetView && typeof y.visible == "boolean" && (t.targetView === "mobile" ? M.mobileHide = y.visible === !1 : M.desktopHide = y.visible === !1, d[z] = M);
    }), S.editorMetaById = Qe(
      S.editorMetaById || {},
      ve(Object.keys(l.widgets)),
      r
    );
  }
  const u = t.sectionRows || i.sectionRows;
  if (u) {
    const I = t.profileId ? (O = l.profiles) == null ? void 0 : O[t.profileId] : l, S = xe(I), z = t.profileId ? `layouts.${a}.profiles.${t.profileId}.editor.sectionRows` : `layouts.${a}.editor.sectionRows`, y = Ji(
      u,
      i.layout,
      r,
      { path: z, layoutId: a, profileId: t.profileId }
    );
    y && (S.sectionRows = y, S.version = Math.max(Number(S.version) || 1, 2));
  }
  const c = x(n, { validation: (B = t.validation) != null ? B : "strict" });
  return r.push(...c.diagnostics), c.ok ? {
    ok: !0,
    document: c.document,
    diagnostics: r
  } : {
    ok: !1,
    error: c.error,
    document: n,
    originalPayload: e,
    diagnostics: r
  };
}
const ti = (e, i) => {
  const t = {};
  return i.forEach((o) => {
    typeof e[o] != "undefined" && (t[o] = e[o]);
  }), t;
}, G = (e, i) => {
  const t = {};
  return Object.keys(e).forEach((o) => {
    i.indexOf(o) === -1 && (t[o] = e[o]);
  }), t;
}, ae = (e, i, t, o) => {
  if (Object.keys(e).length === 0) return;
  const r = L(e, "sanitize", `${t}.extensions.thingsBoard`);
  if (i.push(...r.diagnostics), i.push(h("unsupported-field", "warning", o, { path: t })), !(!r.ok || !v(r.value) || Object.keys(r.value).length === 0))
    return r.value;
}, Ae = (e, i, t) => {
  if (!v(e)) return;
  const o = ti(e, he), r = G(e, he), s = ae(
    r,
    i,
    t,
    "ThingsBoard grid settings contain deferred business fields."
  );
  s && (o.extensions = {
    ...o.extensions || {},
    thingsBoard: s
  });
  const n = we(o, t, "sanitize");
  return i.push(...n.diagnostics), n.ok ? n.settings : void 0;
}, Le = (e, i, t, o) => {
  if (!v(e))
    return i.push(h("invalid-item-geometry", "error", "ThingsBoard widget must be an object.", { path: t })), null;
  const r = v(e.layout) ? e.layout : e, s = ti(r, oe), n = v(e.layout) ? G(r, oe) : {}, a = v(e.layout) ? {
    ...G(e, ["layout"]),
    ...Object.keys(n).length > 0 ? { layout: n } : {}
  } : G(e, oe), l = ae(
    a,
    i,
    t,
    "ThingsBoard widget business fields were preserved in extensions."
  );
  l && (s.extensions = {
    ...s.extensions || {},
    thingsBoard: l
  });
  const d = be(s, t, "sanitize", o);
  return i.push(...d.diagnostics), d.ok ? d.item : null;
};
function Lt(e, i = {}) {
  var d;
  const t = [];
  if (!v(e))
    return {
      ok: !1,
      originalPayload: e,
      diagnostics: t,
      error: R("invalid-document", "ThingsBoard dashboard layout must be an object.")
    };
  const o = {}, r = v(e.widgets) ? e.widgets : {};
  Object.keys(r).forEach((f) => {
    const g = Le(r[f], t, `widgets.${f}`, !0);
    g && (o[f] = g);
  });
  const s = {
    widgets: o,
    ...e.gridSettings ? { gridSettings: Ae(e.gridSettings, t, "gridSettings") } : {}
  }, n = G(e, Si), a = ae(
    n,
    t,
    "document",
    "ThingsBoard dashboard business fields were preserved in extensions."
  );
  a && (s.extensions = {
    ...s.extensions || {},
    thingsBoard: a
  });
  const l = v(e.breakpoints) ? e.breakpoints : {};
  Object.keys(l).forEach((f) => {
    if (!v(l[f])) return;
    const g = l[f], m = v(g.widgetLayouts) ? g.widgetLayouts : v(g.widgets) ? g.widgets : {}, u = {};
    Object.keys(m).forEach((p) => {
      const w = Le(m[p], t, `breakpoints.${f}.widgetLayouts.${p}`, !1);
      w && (u[p] = w);
    });
    const c = ae(
      G(g, Di),
      t,
      `breakpoints.${f}`,
      "ThingsBoard breakpoint business fields were preserved in extensions."
    );
    s.profiles = s.profiles || {}, s.profiles[f] = {
      widgets: u,
      ...g.gridSettings ? { gridSettings: Ae(g.gridSettings, t, `breakpoints.${f}.gridSettings`) } : {},
      ...c ? { extensions: { thingsBoard: c } } : {}
    };
  });
  try {
    return { ok: !0, document: qe(s, {
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
      error: R("validation", "Imported ThingsBoard dashboard layout failed validation.", { cause: f })
    };
  }
}
const Ve = (e) => {
  var t;
  if (!e) return;
  const i = {};
  return v((t = e.extensions) == null ? void 0 : t.thingsBoard) && Object.keys(e.extensions.thingsBoard).forEach((o) => {
    var r;
    i[o] = ((r = e.extensions) == null ? void 0 : r.thingsBoard)[o];
  }), he.forEach((o) => {
    typeof e[o] != "undefined" && (i[o] = e[o]);
  }), i;
}, Ne = (e) => {
  var t;
  const i = {};
  return v((t = e.extensions) == null ? void 0 : t.thingsBoard) && Object.keys(e.extensions.thingsBoard).forEach((o) => {
    var r;
    i[o] = ((r = e.extensions) == null ? void 0 : r.thingsBoard)[o];
  }), oe.forEach((o) => {
    typeof e[o] != "undefined" && (i[o] = e[o]);
  }), i;
};
function Vt(e, i = {}) {
  var d, f;
  const t = x(e), o = t.diagnostics.slice();
  if (!t.ok) return { ok: !1, error: t.error, diagnostics: o };
  const r = t.document, s = (d = i.layoutId) != null ? d : r.primaryLayoutId, n = r.layouts[s];
  if (!n) {
    const g = h("invalid-document", "error", `Dashboard layout "${s}" was not found.`, { layoutId: s });
    return o.push(g), {
      ok: !1,
      diagnostics: o,
      error: R("invalid-document", g.message, { path: `layouts.${s}` })
    };
  }
  const a = {};
  Object.keys(n.widgets).forEach((g) => {
    a[g] = Ne(n.widgets[g]);
  });
  const l = {};
  return Object.keys(n.profiles || {}).forEach((g) => {
    var c;
    const m = n.profiles[g], u = {};
    Object.keys(m.widgets || {}).forEach((p) => {
      u[p] = Ne(m.widgets[p]);
    }), l[g] = {
      ...v((c = m.extensions) == null ? void 0 : c.thingsBoard) ? m.extensions.thingsBoard : {},
      widgetLayouts: u,
      ...m.gridSettings ? { gridSettings: Ve(m.gridSettings) } : {}
    };
  }), {
    ok: !0,
    value: {
      ...v((f = n.extensions) == null ? void 0 : f.thingsBoard) ? n.extensions.thingsBoard : {},
      widgets: a,
      ...n.gridSettings ? { gridSettings: Ve(n.gridSettings) } : {},
      ...Object.keys(l).length > 0 ? { breakpoints: l } : {}
    },
    diagnostics: o
  };
}
const fe = "default", Te = 12, de = 10, Ie = [0, 0], _e = 150, oi = "grid-height-runtime", Gi = [
  "preserveAspectRatio",
  "aspectRatio"
], Ui = [
  "mobileDisplayLayoutFirst",
  "layoutDimension",
  "backgroundColor",
  "backgroundSizeMode",
  "backgroundImageUrl"
], J = (e, i) => Object.prototype.hasOwnProperty.call(e, i), H = (e) => typeof e == "number" && Number.isFinite(e), W = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const i = Object.getPrototypeOf(e);
  return i === Object.prototype || i === null;
}, C = (e, i) => H(e) && e > 0 ? Math.floor(e) : i, te = (e) => Array.isArray(e) && e.length === 2 && H(e[0]) && H(e[1]), ke = (e) => {
  const i = JSON.stringify(e);
  return typeof i == "undefined" ? e : JSON.parse(i);
}, $e = (e) => e.map((i) => ({ ...i })), Zi = (e) => {
  if (!e) return null;
  const i = new Set(e.filter(Boolean));
  return (t) => i.has(t);
}, le = (e) => e === "auto" || e === "scroll" || e === "fit" || e === "fixed", Ki = (e) => e === "integer" || e === "subpixel", qi = (e, i = [de, de]) => te(e) ? [e[0], e[1]] : H(e) ? [e, e] : [i[0], i[1]], U = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
});
function $(e, i, t, o = {}) {
  return {
    code: e,
    level: i,
    message: t,
    ...o
  };
}
const Qi = (e, i) => {
  if (!e || !i) return e;
  const t = new Set(i.filter(Boolean)), o = {};
  return Object.keys(e).forEach((r) => {
    t.has(r) && (o[r] = e[r]);
  }), Object.keys(o).length > 0 ? o : void 0;
}, et = (e) => (e.editor = e.editor || { version: 1 }, e.editor), it = (e, i) => {
  if (!e) return e;
  const t = {
    version: 1,
    items: Object.keys(e.items || {}).reduce((r, s) => {
      const n = e.items[s];
      return r[s] = {
        ...n,
        bounds: n.bounds ? { ...n.bounds } : void 0,
        itemIds: n.itemIds ? n.itemIds.filter((a) => a !== i) : void 0,
        allowedDropZones: n.allowedDropZones ? n.allowedDropZones.slice() : void 0
      }, r;
    }, {}),
    itemMembership: { ...e.itemMembership || {} }
  }, o = t.itemMembership || {};
  return delete o[i], t.itemMembership = o, JSON.parse(JSON.stringify(t));
}, tt = (e) => {
  const i = new Set(Object.keys(e.itemMembership));
  return JSON.parse(JSON.stringify({
    version: 1,
    items: Object.keys(e.items).reduce((t, o) => {
      const r = e.items[o];
      return t[o] = {
        ...r,
        itemIds: r.itemIds ? r.itemIds.filter((s) => i.has(s)) : void 0,
        allowedDropZones: r.allowedDropZones ? r.allowedDropZones.slice() : void 0,
        bounds: r.bounds ? { ...r.bounds } : void 0
      }, t;
    }, {}),
    itemMembership: e.itemMembership
  }));
}, We = (e, i) => {
  e != null && e.editor && (e.editor.editorMetaById && delete e.editor.editorMetaById[i], e.editor.sectionRows = it(e.editor.sectionRows, i));
};
function Nt(e) {
  return W(e.details) && e.details.source === oi;
}
function ot(e, i) {
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
      source: oi,
      prop: e.prop
    }
  };
}
const rt = (e, i) => Object.prototype.hasOwnProperty.call(e, i), st = (e, i, t, o) => {
  const r = rt(t, "rowHeight") ? t.rowHeight : i.rowHeight;
  return hi({
    layout: e,
    heightMode: t.heightMode,
    rowHeight: r,
    minRowHeight: t.minRowHeight,
    margin: qi(i.margin),
    containerPadding: i.containerPadding || Ie,
    containerHeight: t.containerHeight,
    autoMeasureContainerHeight: t.autoMeasureContainerHeight,
    renderPrecision: t.renderPrecision,
    context: {
      source: "dashboard-responsive",
      layoutId: o.layoutId,
      profileId: o.resolvedProfileId,
      targetView: o.targetView
    }
  });
}, ri = (e) => Object.keys(e || {}).filter((i) => H(e[i])).sort((i, t) => {
  const o = e[i] - e[t];
  return o !== 0 ? o : i.localeCompare(t);
}), nt = (e, i) => {
  const t = e.breakpoints || {}, o = ri(t);
  if (e.breakpoint)
    return J(t, e.breakpoint) || i.push($(
      "invalid-breakpoint",
      "warning",
      `Breakpoint "${e.breakpoint}" is not present in the breakpoint map.`,
      { details: { breakpoint: e.breakpoint } }
    )), e.breakpoint;
  if (o.length === 0)
    return i.push($(
      "invalid-breakpoint",
      "warning",
      "No breakpoints were provided; default dashboard layout will be used.",
      { details: { width: e.width } }
    )), fe;
  if (!H(e.width))
    return i.push($(
      "invalid-breakpoint",
      "warning",
      "Width is not a finite number; the smallest breakpoint was selected.",
      { details: { width: e.width, breakpoint: o[0] } }
    )), o[0];
  let r = o[0];
  for (let s = 1; s < o.length; s++) {
    const n = o[s];
    e.width > t[n] && (r = n);
  }
  return r;
}, at = (e) => e === "desktop" || e === "mobile", dt = (e, i, t) => {
  if (i.targetView)
    return { targetView: i.targetView, source: "explicit" };
  const o = i.targetViewRule;
  if (o != null && o.resolve)
    try {
      const s = o.resolve({
        width: i.width,
        requestedBreakpoint: e,
        breakpoints: i.breakpoints || {}
      });
      if (at(s))
        return { targetView: s, source: "resolver" };
    } catch (s) {
      t.push($(
        "projection-validation-failed",
        "warning",
        "Target view resolver failed; fallback target view rules were used.",
        { details: { cause: s } }
      ));
    }
  if (Array.isArray(o == null ? void 0 : o.mobileBreakpointIds) && o.mobileBreakpointIds.indexOf(e) !== -1)
    return { targetView: "mobile", source: "breakpoint-id" };
  if (H(o == null ? void 0 : o.mobileMaxWidth) && H(i.width) && i.width <= o.mobileMaxWidth)
    return { targetView: "mobile", source: "width" };
  const r = e === "xs" || e === "xxs" ? "mobile" : "desktop";
  return t.push($(
    "target-view-default",
    "info",
    "Target view was inferred by the built-in default rule.",
    { details: { requestedBreakpoint: e, targetView: r } }
  )), { targetView: r, source: "default" };
}, lt = (e, i, t, o) => H(e) || te(e) ? e : (i.push($(
  "settings-default",
  "info",
  "Dashboard grid setting margin was missing; default value was used.",
  { layoutId: t, profileId: o || void 0, path: "gridSettings.margin", details: { value: de } }
)), de), ct = (e, i, t, o) => te(e) ? [e[0], e[1]] : (i.push($(
  "settings-default",
  "info",
  "Dashboard grid setting containerPadding was missing; default value was used.",
  { layoutId: t, profileId: o || void 0, path: "gridSettings.containerPadding", details: { value: Ie } }
)), Ie.slice()), ut = (e, i, t, o, r) => {
  var n, a, l;
  const s = {
    ...e || {},
    ...i || {}
  };
  return typeof s.columns == "undefined" && t.push($(
    "settings-default",
    "info",
    "Dashboard grid setting columns was missing; default value was used.",
    { layoutId: o, profileId: r || void 0, path: "gridSettings.columns", details: { value: Te } }
  )), typeof s.rowHeight == "undefined" && t.push($(
    "settings-default",
    "info",
    "Dashboard grid setting rowHeight was missing; default value was used.",
    { layoutId: o, profileId: r || void 0, path: "gridSettings.rowHeight", details: { value: _e } }
  )), {
    ...s,
    columns: C(s.columns, Te),
    minColumns: C(s.minColumns, 1),
    margin: lt(s.margin, t, o, r),
    outerMargin: (n = s.outerMargin) != null ? n : !0,
    containerPadding: ct(s.containerPadding, t, o, r),
    viewFormat: s.viewFormat === "list" ? "list" : "grid",
    rowHeight: C(s.rowHeight, _e),
    autoFillHeight: (a = s.autoFillHeight) != null ? a : !1,
    heightMode: le(s.heightMode) ? s.heightMode : void 0,
    mobileHeightMode: le(s.mobileHeightMode) ? s.mobileHeightMode : void 0,
    minRowHeight: H(s.minRowHeight) && s.minRowHeight > 0 ? s.minRowHeight : void 0,
    mobileRowHeight: H(s.mobileRowHeight) && s.mobileRowHeight > 0 ? Math.floor(s.mobileRowHeight) : void 0,
    mobileAutoFillHeight: (l = s.mobileAutoFillHeight) != null ? l : !1,
    renderPrecision: Ki(s.renderPrecision) ? s.renderPrecision : "integer"
  };
}, X = (e = {}, i) => Object.prototype.hasOwnProperty.call(e, i);
function ft(e, i) {
  var c, p, w;
  const t = i.diagnostics, o = i.profileId ? `layouts.${i.layoutId}.profiles.${i.profileId}.gridSettings` : `layouts.${i.layoutId}.gridSettings`, r = i.targetView === "mobile", s = e.mobileAutoFillHeight === !0, n = e.autoFillHeight === !0, a = r && le(e.mobileHeightMode), l = le(e.heightMode);
  l && n && e.heightMode !== "fit" && t.push($(
    "mode-alias-conflict",
    "warning",
    "Explicit dashboard heightMode overrides autoFillHeight.",
    {
      layoutId: i.layoutId,
      profileId: i.profileId || void 0,
      targetView: i.targetView,
      path: `${o}.heightMode`,
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
      path: `${o}.mobileHeightMode`,
      details: { mobileHeightMode: e.mobileHeightMode, mobileAutoFillHeight: e.mobileAutoFillHeight }
    }
  ));
  const f = a ? e.mobileHeightMode : l ? e.heightMode : (r && !a && s || !l && n ? "fit" : void 0) || "auto", g = r && H(e.mobileRowHeight) && e.mobileRowHeight > 0 ? e.mobileRowHeight : e.rowHeight, m = {
    heightMode: f,
    rowHeight: g,
    minRowHeight: e.minRowHeight,
    renderPrecision: e.renderPrecision || "integer"
  }, u = i.explicit;
  return X(u, "heightMode") && (m.heightMode = (c = u == null ? void 0 : u.heightMode) != null ? c : null), X(u, "rowHeight") && (m.rowHeight = u == null ? void 0 : u.rowHeight), X(u, "minRowHeight") && (m.minRowHeight = u == null ? void 0 : u.minRowHeight), X(u, "containerHeight") && (m.containerHeight = (p = u == null ? void 0 : u.containerHeight) != null ? p : null), X(u, "autoMeasureContainerHeight") && (m.autoMeasureContainerHeight = u == null ? void 0 : u.autoMeasureContainerHeight), X(u, "renderPrecision") && (m.renderPrecision = (w = u == null ? void 0 : u.renderPrecision) != null ? w : null), m;
}
const si = (e, i) => {
  const t = {
    i: e,
    x: i.col,
    y: i.row,
    w: i.sizeX,
    h: i.sizeY
  };
  return typeof i.minSizeX != "undefined" && (t.minW = i.minSizeX), typeof i.minSizeY != "undefined" && (t.minH = i.minSizeY), typeof i.maxSizeX != "undefined" && (t.maxW = i.maxSizeX), typeof i.maxSizeY != "undefined" && (t.maxH = i.maxSizeY), typeof i.static != "undefined" && (t.static = i.static), typeof i.draggable != "undefined" && (t.isDraggable = i.draggable), typeof i.resizable != "undefined" && (t.isResizable = i.resizable), typeof i.bounded != "undefined" && (t.isBounded = i.bounded), i.resizeHandles && (t.resizeHandles = i.resizeHandles.slice()), t;
}, ce = (e, i) => e.y !== i.y ? e.y - i.y : e.x !== i.x ? e.x - i.x : e.i < i.i ? -1 : e.i > i.i ? 1 : 0, ni = (e, i) => e.item.row !== i.item.row ? e.item.row - i.item.row : e.item.col !== i.item.col ? e.item.col - i.item.col : e.id < i.id ? -1 : e.id > i.id ? 1 : 0, Ce = (e) => H(e) && e >= 0, gt = (e, i, t) => {
  if (e === "mobile") {
    const o = i.item.mobileOrder, r = t.item.mobileOrder, s = Ce(o), n = Ce(r);
    if (s && n && o !== r) return o - r;
    if (s !== n) return s ? -1 : 1;
  }
  return ni(i, t);
}, mt = (e, i) => ({
  ...e,
  ...i || {}
}), ht = (e) => ({
  col: C(e.col, 0),
  row: C(e.row, 0),
  sizeX: C(e.sizeX, 1),
  sizeY: C(e.sizeY, 1),
  ...e
}), ai = (e, i) => i === "mobile" ? e.mobileHide === !0 : e.desktopHide === !0, pt = (e, i, t, o, r) => {
  e && (Ui.forEach((s) => {
    t && typeof t[s] != "undefined" && r.push($(
      "unsupported-profile-field",
      "info",
      `Profile grid setting ${s} is preserved but not directly mapped to the base grid runtime in this version.`,
      { layoutId: i, profileId: e, path: `layouts.${i}.profiles.${e}.gridSettings.${s}` }
    ));
  }), o.forEach((s) => {
    Gi.forEach((n) => {
      typeof s.item[n] != "undefined" && r.push($(
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
}, yt = (e, i, t, o, r) => {
  var a;
  const s = i ? (a = e.profiles) == null ? void 0 : a[i] : void 0, n = {};
  return Object.keys(e.widgets).sort().forEach((l) => {
    var d;
    n[l] = mt(e.widgets[l], (d = s == null ? void 0 : s.widgets) == null ? void 0 : d[l]);
  }), s != null && s.widgets && Object.keys(s.widgets).sort().forEach((l) => {
    J(e.widgets, l) || (o.push($(
      "unknown-profile-item",
      "warning",
      `Dashboard profile "${i}" contains unknown widget "${l}".`,
      {
        layoutId: r,
        profileId: i || void 0,
        itemId: l,
        path: `layouts.${r}.profiles.${i}.widgets.${l}`
      }
    )), t.allowUnknownProfileItems && (n[l] = ht(s.widgets[l])));
  }), Object.keys(n).map((l) => ({ id: l, item: n[l] })).sort(ni);
}, ge = (e, i) => {
  const t = {};
  return Object.keys(e || {}).forEach((o) => {
    t[o] = { ...e[o] };
  }), Object.keys(i || {}).forEach((o) => {
    t[o] = {
      ...t[o] || {},
      ...i[o]
    };
  }), t;
}, bt = (e) => {
  if (!e.owner) return;
  const i = Qi(e.editorMetaById, e.writeItemIds);
  if (!(!!i || !!e.sectionRows)) return;
  const o = et(e.owner);
  if (i && (o.editorMetaById = ge(o.editorMetaById || {}, i), Object.keys(i).forEach((r) => {
    const s = i[r], n = e.targetWidgets[r] || {};
    typeof s.resizable == "boolean" && (n.resizable = s.resizable), typeof s.visible == "boolean" && (e.targetView === "mobile" ? n.mobileHide = s.visible === !1 : n.desktopHide = s.visible === !1), e.targetWidgets[r] = n;
  })), e.sectionRows) {
    const r = Se(e.sectionRows, e.layout);
    r.warnings.forEach((s) => {
      var n;
      e.diagnostics.push($(
        s.code,
        "warning",
        s.message,
        {
          layoutId: e.layoutId,
          profileId: e.profileId || void 0,
          itemId: (n = s.itemIds) == null ? void 0 : n[0],
          path: e.profileId ? `layouts.${e.layoutId}.profiles.${e.profileId}.editor.sectionRows` : `layouts.${e.layoutId}.editor.sectionRows`,
          details: s
        }
      ));
    }), o.sectionRows = tt(r), o.version = Math.max(Number(o.version) || 1, 2);
  }
}, wt = (e, i, t, o) => {
  const r = [], s = e.map((d) => d.id), n = [], a = ge(o, void 0);
  e.forEach((d) => {
    const f = ai(d.item, i);
    f && r.push(d.id);
    const g = { ...a[d.id] || {} };
    f ? g.visible = !1 : typeof g.visible == "undefined" && (g.visible = !0), a[d.id] = g, !(t === "view" && f) && n.push(si(d.id, d.item));
  }), n.sort(ce);
  const l = t === "view" ? s.filter((d) => r.indexOf(d) === -1) : s.slice();
  return {
    layout: n,
    allItemIds: s,
    activeItemIds: l,
    renderItemIds: l.slice(),
    hiddenItemIds: r,
    editorMetaById: a
  };
}, vt = (e, i, t, o, r) => i === "mobile" && H(e.item.mobileHeight) && e.item.mobileHeight > 0 ? (t.push($(
  "list-height-source",
  "info",
  "Mobile list item height was derived from mobileHeight.",
  { layoutId: o, profileId: r || void 0, itemId: e.id, details: { source: "mobileHeight" } }
)), Math.floor(e.item.mobileHeight)) : H(e.item.sizeY) && e.item.sizeY > 0 ? (t.push($(
  "list-height-source",
  "info",
  "List item height was derived from sizeY.",
  { layoutId: o, profileId: r || void 0, itemId: e.id, details: { source: "sizeY" } }
)), Math.floor(e.item.sizeY)) : (t.push($(
  "list-height-default",
  "warning",
  "List item height was invalid; default height 1 was used.",
  { layoutId: o, profileId: r || void 0, itemId: e.id, details: { source: "default" } }
)), 1), It = (e, i, t, o, r, s, n, a) => {
  const l = e.slice().sort((p, w) => gt(i, p, w)), d = [], f = l.map((p) => p.id), g = [], m = ge(r, void 0);
  let u = 0;
  l.forEach((p) => {
    const w = ai(p.item, i);
    w && d.push(p.id);
    const k = { ...m[p.id] || {} };
    w ? k.visible = !1 : typeof k.visible == "undefined" && (k.visible = !0), m[p.id] = k;
    const D = vt(p, i, s, n, a);
    t === "view" && w || (g.push({
      ...si(p.id, p.item),
      x: 0,
      y: u,
      w: o,
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
}, kt = (e) => W(e) && typeof e.primaryLayoutId == "string" ? e.primaryLayoutId : null, di = (e, i) => `layouts.${e}.profiles.${i}`, $t = (e, i, t) => {
  var r;
  const o = di(i, t);
  return e.profileId === t || e.path === o || !!((r = e.path) != null && r.startsWith(`${o}.`));
}, St = (e, i, t) => {
  try {
    const o = ke(e);
    if (!W(o) || !W(o.layouts)) return null;
    const r = o.layouts[i];
    return !W(r) || !W(r.profiles) || !J(r.profiles, t) ? null : (delete r.profiles[t], Object.keys(r.profiles).length === 0 && delete r.profiles, o);
  } catch (o) {
    return null;
  }
}, Dt = (e, i, t, o) => {
  var f, g;
  const r = x(e, { validation: (f = t.validation) != null ? f : "strict" });
  if (r.ok)
    return o.push(...r.diagnostics), {
      ok: !0,
      document: r.document,
      invalidProfileFallback: !1,
      profileFallbackReported: !1
    };
  const s = kt(e), n = t.layoutId && t.layoutId === s ? t.layoutId : s, d = !!(n && i !== fe) && r.diagnostics.some((m) => $t(m, n, i)) ? St(e, n, i) : null;
  if (d) {
    const m = x(d, { validation: (g = t.validation) != null ? g : "strict" });
    if (m.ok)
      return o.push($(
        "profile-fallback",
        "warning",
        `Dashboard profile "${i}" is invalid; resolved primary layout.`,
        {
          layoutId: n,
          profileId: i,
          path: di(n, i),
          details: {
            reason: r.error.message,
            diagnostics: r.diagnostics
          }
        }
      )), o.push(...m.diagnostics), {
        ok: !0,
        document: m.document,
        invalidProfileFallback: !0,
        profileFallbackReported: !0
      };
  }
  return o.push(...r.diagnostics), o.push($(
    "projection-validation-failed",
    "error",
    r.error.message,
    { path: r.error.path, details: r.error.details }
  )), { ok: !1, error: r.error };
};
function Tt(e, i) {
  var S, z, y, M, b, P, N, A, me;
  const t = [], o = nt(i, t), r = i.mode || "view", s = dt(o, i, t), n = Dt(
    e,
    o,
    i,
    t
  );
  if (!n.ok)
    return { ok: !1, error: n.error, diagnostics: t };
  const a = n.document;
  let l = n.invalidProfileFallback, d = i.layoutId || a.primaryLayoutId;
  d !== a.primaryLayoutId && (l = !0, d = a.primaryLayoutId);
  const f = a.layouts[d], g = (S = f.profiles) == null ? void 0 : S[o], m = g ? o : null;
  g || (l = !0, n.profileFallbackReported || t.push($(
    "profile-fallback",
    "warning",
    `Dashboard profile "${o}" was not found; resolved primary layout.`,
    { layoutId: d, profileId: o, path: `layouts.${d}.profiles.${o}` }
  )));
  const u = ei(a, {
    layoutId: d,
    profileId: m || void 0,
    targetView: s.targetView,
    validation: (z = i.validation) != null ? z : "strict"
  });
  if (!u.ok)
    return t.push(...u.diagnostics), t.push($(
      "projection-validation-failed",
      "error",
      u.error.message,
      { path: u.error.path, details: u.error.details }
    )), { ok: !1, error: u.error, diagnostics: t };
  t.push(...u.diagnostics);
  const c = yt(f, m, i, t, d), p = ut(
    f.gridSettings,
    m ? (M = (y = f.profiles) == null ? void 0 : y[m]) == null ? void 0 : M.gridSettings : void 0,
    t,
    d,
    m
  );
  pt(
    m,
    d,
    m ? (P = (b = f.profiles) == null ? void 0 : b[m]) == null ? void 0 : P.gridSettings : void 0,
    c,
    t
  );
  const w = ge(
    u.projection.editorMetaById,
    m ? (me = (A = (N = f.profiles) == null ? void 0 : N[m]) == null ? void 0 : A.editor) == null ? void 0 : me.editorMetaById : void 0
  ), k = p.viewFormat, D = k === "list" ? It(
    c,
    s.targetView,
    r,
    p.columns,
    w,
    t,
    d,
    m
  ) : wt(c, s.targetView, r, w), j = ft(p, {
    targetView: s.targetView,
    diagnostics: t,
    layoutId: d,
    profileId: m
  }), O = st(
    D.layout,
    p,
    j,
    {
      layoutId: d,
      resolvedProfileId: m,
      targetView: s.targetView
    }
  ), B = O.diagnostics.map(
    (_) => ot(_, {
      layoutId: d,
      resolvedProfileId: m,
      targetView: s.targetView
    })
  );
  return t.push(...B), {
    ok: !0,
    runtime: {
      layout: D.layout,
      gridSettings: p,
      editorMetaById: D.editorMetaById,
      capabilitiesById: u.projection.capabilitiesById,
      resizeConstraintsById: u.projection.resizeConstraintsById,
      layoutId: d,
      requestedBreakpoint: o,
      resolvedProfileId: m,
      targetView: s.targetView,
      targetViewSource: s.source,
      mode: r,
      viewFormat: k,
      heightOptions: j,
      heightRuntime: O,
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
const Ht = (e) => $e(e).sort(ce), zt = (e, i, t, o, r, s) => {
  for (let n = 0; n < e.length; n++) {
    const a = e[n];
    if (!H(a.x) || !H(a.y) || !H(a.w) || !H(a.h) || a.w <= 0 || a.h <= 0)
      return U("validation", `Runtime layout item "${a.i}" has invalid geometry.`, {
        path: `layout.${n}`,
        details: { item: a }
      });
    if (!J(i.widgets, a.i) && !t.createMissingItems)
      return o.push($(
        "unknown-profile-item",
        "error",
        `Runtime layout contains unknown dashboard widget "${a.i}".`,
        { layoutId: r, profileId: s || void 0, itemId: a.i }
      )), U("unknown-item", `Runtime layout contains unknown dashboard widget "${a.i}".`, {
        details: { itemId: a.i }
      });
  }
  return null;
}, li = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return typeof e.minW != "undefined" && (i.minSizeX = e.minW), typeof e.minH != "undefined" && (i.minSizeY = e.minH), typeof e.maxW != "undefined" && (i.maxSizeX = e.maxW), typeof e.maxH != "undefined" && (i.maxSizeY = e.maxH), i;
};
function _t(e, i, t, o = {}) {
  var I, S, z, y, M;
  const r = [], s = o.mode || i.mode, n = o.targetView || i.targetView, a = o.viewFormat || i.viewFormat, l = o.requestedBreakpoint || i.requestedBreakpoint;
  let d = typeof o.resolvedProfileId != "undefined" ? o.resolvedProfileId : i.resolvedProfileId;
  const f = x(e, { validation: (I = o.validation) != null ? I : "strict" });
  r.push(...f.diagnostics);
  const g = f.ok ? f.document : ke(e);
  if (!f.ok)
    return r.push($(
      "projection-validation-failed",
      "error",
      f.error.message,
      { path: f.error.path, details: f.error.details }
    )), {
      ok: !1,
      error: f.error,
      document: g,
      originalPayload: f.originalPayload,
      diagnostics: r
    };
  if (i.fallbackApplied && !d && l !== fe) {
    if (s === "view")
      return r.push($(
        "write-back-noop",
        "info",
        "Fallback view runtime is read-only; no dashboard profile was created.",
        { layoutId: i.layoutId, profileId: l }
      )), {
        ok: !0,
        document: f.document,
        diagnostics: r
      };
    if (!o.createMissingProfileOnEdit) {
      const b = $(
        "missing-profile-write-blocked",
        "error",
        `Dashboard profile "${l}" is missing; profile-scoped write-back was blocked.`,
        { layoutId: i.layoutId, profileId: l }
      );
      return r.push(b), {
        ok: !1,
        error: U("validation", b.message, { path: `layouts.${i.layoutId}.profiles.${l}` }),
        document: f.document,
        diagnostics: r
      };
    }
    d = l;
  }
  if (a === "grid") {
    const b = ii(e, {
      layout: t,
      editorMetaById: o.editorMetaById || i.editorMetaById,
      sectionRows: o.sectionRows
    }, {
      layoutId: o.layoutId || i.layoutId,
      profileId: d || void 0,
      targetView: n,
      createMissingItems: o.createMissingItems,
      removeMissingItems: o.removeMissingItems,
      createMissingProfile: !!o.createMissingProfileOnEdit,
      writeItemIds: o.writeItemIds,
      validation: (S = o.validation) != null ? S : "strict"
    });
    return {
      ...b,
      diagnostics: r.concat(b.diagnostics)
    };
  }
  const m = ke(f.document), u = o.layoutId || i.layoutId || m.primaryLayoutId, c = m.layouts[u];
  if (!c) {
    const b = $(
      "projection-validation-failed",
      "error",
      `Dashboard layout "${u}" was not found.`,
      { layoutId: u }
    );
    return r.push(b), {
      ok: !1,
      error: U("invalid-document", b.message, { path: `layouts.${u}` }),
      document: m,
      diagnostics: r
    };
  }
  const p = Zi(o.writeItemIds), w = new Set(t.map((b) => b.i)), k = Ht(t), D = p ? k.filter((b) => p(b.i)) : k, j = zt(D, c, o, r, u, d);
  if (j)
    return {
      ok: !1,
      error: j,
      document: m,
      diagnostics: r
    };
  let O;
  if (d) {
    if (c.profiles = c.profiles || {}, !c.profiles[d]) {
      if (!o.createMissingProfileOnEdit) {
        const b = $(
          "missing-profile-write-blocked",
          "error",
          `Dashboard profile "${d}" is missing; profile-scoped write-back was blocked.`,
          { layoutId: u, profileId: d }
        );
        return r.push(b), {
          ok: !1,
          error: U("validation", b.message, { path: `layouts.${u}.profiles.${d}` }),
          document: m,
          diagnostics: r
        };
      }
      c.profiles[d] = { widgets: {} };
    }
    c.profiles[d].widgets = c.profiles[d].widgets || {}, O = c.profiles[d].widgets;
  } else
    O = c.widgets;
  o.removeMissingItems && ((z = o.writeItemIds) != null && z.length) && o.writeItemIds.filter(Boolean).forEach((b) => {
    w.has(b) || (delete c.widgets[b], delete O[b], Object.values(c.profiles || {}).forEach((P) => {
      P.widgets && delete P.widgets[b], We(P, b);
    }), We(c, b));
  }), k.forEach((b, P) => {
    if (p && !p(b.i)) return;
    J(c.widgets, b.i) || (c.widgets[b.i] = li(b));
    const N = O[b.i] || {};
    n === "mobile" ? O[b.i] = {
      ...N,
      mobileOrder: P,
      mobileHeight: b.h
    } : O[b.i] = {
      ...N,
      row: P,
      sizeY: b.h
    };
  }), bt({
    owner: d ? (y = c.profiles) == null ? void 0 : y[d] : c,
    layout: t,
    layoutId: u,
    profileId: d,
    targetView: n,
    targetWidgets: O,
    editorMetaById: o.editorMetaById || i.editorMetaById,
    sectionRows: o.sectionRows,
    writeItemIds: o.writeItemIds,
    diagnostics: r
  });
  const B = x(m, { validation: (M = o.validation) != null ? M : "strict" });
  return r.push(...B.diagnostics), B.ok ? {
    ok: !0,
    document: B.document,
    diagnostics: r
  } : {
    ok: !1,
    error: B.error,
    document: m,
    originalPayload: e,
    diagnostics: r
  };
}
const Ye = (e, i) => e == null || Array.isArray(e) ? e : typeof e == "object" && J(e, i) ? e[i] || void 0 : e, Mt = (e) => {
  const i = {
    col: e.x,
    row: e.y,
    sizeX: e.w,
    sizeY: e.h
  };
  return typeof e.minW != "undefined" && (i.minSizeX = e.minW), typeof e.minH != "undefined" && (i.minSizeY = e.minH), typeof e.maxW != "undefined" && (i.maxSizeX = e.maxW), typeof e.maxH != "undefined" && (i.maxSizeY = e.maxH), typeof e.static != "undefined" && (i.static = e.static), typeof e.isDraggable != "undefined" && (i.draggable = e.isDraggable), typeof e.isResizable != "undefined" && (i.resizable = e.isResizable), typeof e.isBounded != "undefined" && (i.bounded = e.isBounded), e.resizeHandles && (i.resizeHandles = e.resizeHandles.slice()), i;
}, Rt = (e) => li(e), Je = (e, i, t) => {
  var a;
  const o = {}, r = (a = i.cols) == null ? void 0 : a[e];
  H(r) && r > 0 ? o.columns = r : i.cols && t.push($(
    "legacy-responsive-deferred",
    "warning",
    `Responsive cols for breakpoint "${e}" are missing; dashboard default columns will apply.`,
    { profileId: e, path: `cols.${e}` }
  ));
  const s = Ye(i.margin, e);
  (H(s) || te(s)) && (o.margin = s);
  const n = Ye(i.containerPadding, e);
  return te(n) && (o.containerPadding = [n[0], n[1]]), o;
};
function Wt(e) {
  const i = [], t = ri(e.breakpoints), o = Object.keys(e.layouts || {}).sort(), r = e.defaultBreakpoint || (t.length > 0 ? t[t.length - 1] : o[0] || fe), s = e.layouts[r] || [];
  e.layouts[r] || i.push($(
    "legacy-responsive-deferred",
    "warning",
    `Default responsive layout "${r}" was not present; an empty dashboard layout was created.`,
    { profileId: r, path: `layouts.${r}` }
  ));
  const n = {};
  $e(s).sort(ce).forEach((d) => {
    n[d.i] = Mt(d);
  });
  const a = {
    widgets: n,
    gridSettings: Je(r, e, i),
    profiles: {}
  }, l = [];
  Object.keys(e.layouts || {}).sort((d, f) => {
    const g = H(e.breakpoints[d]) ? e.breakpoints[d] : Number.MAX_SAFE_INTEGER, m = H(e.breakpoints[f]) ? e.breakpoints[f] : Number.MAX_SAFE_INTEGER, u = g - m;
    return u !== 0 ? u : d.localeCompare(f);
  }).forEach((d) => {
    if (d === r) return;
    const f = {};
    $e(e.layouts[d] || []).sort(ce).forEach((g) => {
      J(n, g.i) || i.push($(
        "legacy-responsive-deferred",
        "warning",
        `Responsive layout "${d}" contains widget "${g.i}" that is absent from the default dashboard layout.`,
        {
          profileId: d,
          itemId: g.i,
          path: `layouts.${d}.${g.i}`,
          details: {
            reason: "profile-only-widget",
            defaultBreakpoint: r
          }
        }
      )), f[g.i] = Rt(g);
    }), a.profiles[d] = {
      widgets: f,
      gridSettings: Je(d, e, i)
    }, l.push(d);
  }), a.profiles && Object.keys(a.profiles).length === 0 && delete a.profiles;
  try {
    return {
      ok: !0,
      document: qe(a, {
        key: e.key,
        sourceId: e.sourceId
      }),
      defaultBreakpoint: r,
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
const ue = (e) => JSON.parse(JSON.stringify(e)), ee = (e, i, t = {}) => ({
  code: e,
  message: i,
  ...t
}), K = (e, i, t, o = {}) => ({
  code: e,
  level: i,
  message: t,
  ...o
}), Xe = (e) => ({
  ...e,
  cols: e.columns,
  columns: e.columns,
  minColumns: e.minColumns,
  maxRows: typeof e.maxRows == "number" ? e.maxRows : void 0
}), Ot = (e, i = 12) => {
  const t = e == null ? void 0 : e.columns;
  return typeof t == "number" && Number.isFinite(t) && t > 0 ? Math.floor(t) : i;
}, ci = (e, i = {}) => ({
  cols: Ot(e),
  maxRows: typeof e.maxRows == "number" ? e.maxRows : 1 / 0,
  compactType: null,
  allowOverlap: !1,
  preventCollision: !0,
  diagnostics: { debug: !0 },
  ...i
}), Ge = (e, i) => ({
  ...e,
  ...i || {}
}), Et = (e) => {
  const i = /* @__PURE__ */ new Set();
  return e.affectedIds.forEach((t) => i.add(t)), e.patches.forEach((t) => {
    t.type === "add" ? i.add(t.item.i) : t.type === "compact" ? t.affectedIds.forEach((o) => i.add(o)) : i.add(t.id);
  }), i;
}, Pt = (e, i, t) => K(
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
), ui = (e, i, t) => {
  var r;
  const o = [];
  return (((r = e.diagnostics) == null ? void 0 : r.details) || []).forEach((s) => {
    o.push(Pt(s, i, t));
  }), e.status === "blocked" && e.blocked && o.push(K("layout-operation-blocked", "error", `Layout operation was blocked: ${e.blocked.reason}.`, {
    layoutId: i,
    profileId: t || void 0,
    details: e.blocked
  })), e.status === "error" && e.error && o.push(K("layout-operation-error", "error", e.error.message, {
    layoutId: i,
    profileId: t || void 0,
    details: e.error.cause
  })), o;
}, He = (e, i, t) => {
  var o, r;
  return t ? !!((r = (o = e.layouts[i]) == null ? void 0 : o.profiles) != null && r[t]) : !0;
}, fi = (e, i, t) => {
  const o = Et(i), r = t.profileId ? i.layout.filter((s) => o.has(s.i)) : i.layout;
  return ii(e, {
    layout: r,
    gridSettings: t.nextSettings
  }, {
    layoutId: t.layoutId,
    profileId: t.profileId || void 0,
    createMissingProfile: t.createMissingProfile,
    validation: t.validation
  });
}, gi = (e, i) => ei(e, {
  layoutId: i.layoutId,
  profileId: He(e, i.layoutId, i.profileId) && i.profileId || void 0,
  allowNonPrimary: !0,
  validation: i.validation
});
function Ct(e, i) {
  var p, w;
  const t = x(e, { validation: (p = i.validation) != null ? p : "strict" }), o = t.ok ? ue(t.document) : ue(e), r = t.diagnostics.slice();
  if (!t.ok)
    return {
      ok: !1,
      document: o,
      error: t.error,
      diagnostics: r
    };
  const s = t.document, n = i.layoutId || s.primaryLayoutId;
  if (!s.layouts[n]) {
    const k = K("invalid-document", "error", `Dashboard layout "${n}" was not found.`, { layoutId: n });
    return {
      ok: !1,
      document: o,
      error: ee("invalid-document", k.message, { path: `layouts.${n}` }),
      diagnostics: r.concat(k)
    };
  }
  const l = i.profileId || null;
  if (l && !He(s, n, l) && !i.createMissingProfile) {
    const k = K("profile-fallback", "error", `Dashboard profile "${l}" was not found; profile migration was blocked.`, {
      layoutId: n,
      profileId: l
    });
    return {
      ok: !1,
      document: o,
      error: ee("validation", k.message, { path: `layouts.${n}.profiles.${l}` }),
      diagnostics: r.concat(k)
    };
  }
  const d = gi(s, {
    layoutId: n,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  if (r.push(...d.diagnostics), !d.ok)
    return {
      ok: !1,
      document: o,
      error: d.error,
      diagnostics: r
    };
  const f = Ge(
    d.projection.gridSettings,
    i.previousSettings
  ), g = Ge(
    d.projection.gridSettings,
    i.nextSettings
  ), m = {
    ...i.nextSettings
  }, u = yi(d.projection.layout, {
    previousSettings: Xe(f),
    nextSettings: Xe(g),
    policy: i.policy,
    engineOptions: ci(d.projection.gridSettings),
    id: `dashboard-migrate-${n}${l ? `-${l}` : ""}`,
    phase: "commit",
    debug: !0
  });
  if (r.push(...ui(u, n, l)), u.status === "blocked" || u.status === "error")
    return {
      ok: !1,
      document: o,
      operation: u,
      error: ee((u.status === "error", "validation"), ((w = u.error) == null ? void 0 : w.message) || "Dashboard layout settings migration failed."),
      diagnostics: r
    };
  const c = fi(s, u, {
    layoutId: n,
    profileId: l,
    nextSettings: m,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  return r.push(...c.diagnostics), c.ok ? {
    ok: !0,
    document: c.document,
    operation: u,
    diagnostics: r
  } : {
    ok: !1,
    document: o,
    operation: u,
    error: c.error,
    diagnostics: r
  };
}
const mi = (e, i, t) => {
  var m, u;
  const o = x(e, { validation: (m = i.validation) != null ? m : "strict" }), r = o.ok ? ue(o.document) : ue(e), s = o.diagnostics.slice();
  if (!o.ok)
    return { ok: !1, document: r, error: o.error, diagnostics: s };
  const n = o.document, a = i.layoutId || n.primaryLayoutId, l = i.profileId || null;
  if (l && !He(n, a, l) && !i.createMissingProfile) {
    const c = K("profile-fallback", "error", `Dashboard profile "${l}" was not found; geometry operation was blocked.`, {
      layoutId: a,
      profileId: l
    });
    return {
      ok: !1,
      document: r,
      error: ee("validation", c.message, { path: `layouts.${a}.profiles.${l}` }),
      diagnostics: s.concat(c)
    };
  }
  const d = gi(n, {
    layoutId: a,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  if (s.push(...d.diagnostics), !d.ok)
    return { ok: !1, document: r, error: d.error, diagnostics: s };
  const f = t(
    d.projection.layout,
    ci(d.projection.gridSettings)
  );
  if (s.push(...ui(f, a, l)), f.status === "blocked" || f.status === "error")
    return {
      ok: !1,
      document: r,
      operation: f,
      error: ee("validation", ((u = f.error) == null ? void 0 : u.message) || "Dashboard geometry operation failed."),
      diagnostics: s
    };
  const g = fi(n, f, {
    layoutId: a,
    profileId: l,
    createMissingProfile: i.createMissingProfile,
    validation: i.validation
  });
  return s.push(...g.diagnostics), g.ok ? { ok: !0, document: g.document, operation: f, diagnostics: s } : { ok: !1, document: r, operation: f, error: g.error, diagnostics: s };
};
function Yt(e, i = {}) {
  return mi(
    e,
    i,
    (t, o) => bi(t, {
      policy: i.policy,
      engineOptions: o,
      id: "dashboard-repair",
      phase: "commit",
      debug: !0
    })
  );
}
function Jt(e, i) {
  return mi(
    e,
    i,
    (t, o) => wi(t, {
      dx: i.dx,
      dy: i.dy,
      clampNegative: i.clampNegative,
      policy: i.policy,
      engineOptions: o,
      id: "dashboard-translate",
      phase: "commit",
      debug: !0
    })
  );
}
export {
  oi as D,
  re as a,
  Wt as b,
  xt as c,
  ot as d,
  $ as e,
  At as f,
  Vt as g,
  Nt as h,
  Lt as i,
  Ct as j,
  ft as k,
  Tt as l,
  Li as m,
  ii as n,
  ei as p,
  Yt as r,
  qe as s,
  Jt as t,
  x as v,
  _t as w
};
