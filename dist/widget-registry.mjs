const ee = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), p = (e) => {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || t === null;
}, Re = (e, t) => Object.prototype.hasOwnProperty.call(e, t), te = (e) => ee.has(e), je = (e) => p(e), l = (e, t, s, i = {}) => ({
  code: e,
  level: t,
  message: s,
  ...i
}), I = (e, t, s = "error") => l("widget-registry.unsafe-extension-key", s, t, { path: e }), se = (e) => e === null || typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e), R = (e, t) => {
  if (se(e)) return { ok: !0, value: e, diagnostics: [] };
  if (typeof e == "number")
    return {
      ok: !1,
      diagnostics: [I(t.path, "Non-finite numbers are not JSON-safe.")]
    };
  if (Array.isArray(e)) {
    if (t.seen.has(e))
      return {
        ok: !1,
        diagnostics: [I(t.path, "Circular arrays are not JSON-safe.")]
      };
    t.seen.add(e);
    const a = [], n = [];
    let o = !0;
    return e.forEach((d, c) => {
      const u = R(d, {
        ...t,
        path: `${t.path}[${c}]`
      });
      n.push(...u.diagnostics), u.ok && u.value !== void 0 ? a.push(u.value) : o = !1;
    }), t.seen.delete(e), !o && t.policy === "strict" ? { ok: !1, diagnostics: n } : { ok: o || t.policy === "tolerant", value: a, diagnostics: n };
  }
  if (!p(e))
    return {
      ok: !1,
      diagnostics: [I(t.path, "Only plain JSON objects are allowed.")]
    };
  if (t.seen.has(e))
    return {
      ok: !1,
      diagnostics: [I(t.path, "Circular objects are not JSON-safe.")]
    };
  t.seen.add(e);
  const s = {}, i = [];
  let r = !0;
  return Object.keys(e).forEach((a) => {
    const n = t.path ? `${t.path}.${a}` : a;
    if (te(a)) {
      i.push(I(
        n,
        `Reserved key "${a}" is not allowed.`,
        t.policy === "strict" ? "error" : "warning"
      )), r = !1;
      return;
    }
    const o = R(e[a], {
      ...t,
      path: n
    });
    i.push(...o.diagnostics), o.ok && o.value !== void 0 ? s[a] = o.value : r = !1;
  }), t.seen.delete(e), !r && t.policy === "strict" ? { ok: !1, diagnostics: i } : { ok: r || t.policy === "tolerant", value: s, diagnostics: i };
}, k = (e, t = {}) => R(e, {
  policy: t.policy || "strict",
  path: t.path || "$",
  seen: /* @__PURE__ */ new WeakSet()
}), w = (e, t = {}) => {
  const s = k(e, t);
  return !s.ok || !s.value || Array.isArray(s.value) || typeof s.value != "object" ? {
    ok: !1,
    value: {},
    diagnostics: s.diagnostics.length > 0 ? s.diagnostics : [I(t.path || "$", "Expected a JSON-safe object.")]
  } : { ok: !0, value: s.value, diagnostics: s.diagnostics };
}, j = (...e) => {
  const t = {};
  return e.forEach((s) => {
    s && Object.keys(s).forEach((i) => {
      t[i] = s[i];
    });
  }), t;
}, ze = (e) => typeof e == "string" && e.trim().length > 0 ? e.trim() : void 0, W = (e) => e.slice().sort(
  (t, s) => `${t.code}:${t.path || ""}:${t.type || ""}:${t.itemId || ""}:${t.fieldId || ""}`.localeCompare(`${s.code}:${s.path || ""}:${s.type || ""}:${s.itemId || ""}:${s.fieldId || ""}`)
), x = (e) => e.some((t) => t.level === "error"), ie = ["s", "w", "e", "n", "sw", "nw", "se", "ne"], re = new Set(ie), z = { w: 2, h: 2 }, _ = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, S = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, ae = (e) => typeof e == "boolean" ? e : void 0, ne = (e, t, s, i) => {
  if (e !== void 0) {
    if (_(e)) return Math.floor(e);
    s.push(l("widget-registry.invalid-layout", "error", `${t} must be a positive finite number.`, {
      type: i.type,
      path: `${i.path}.${t}`
    }));
  }
}, oe = (e, t, s) => {
  if (e !== void 0) {
    if (_(e) && e >= 0.01 && e <= 100) return e;
    t.push(l("widget-registry.invalid-layout", "error", "aspectRatio must be between 0.01 and 100.", {
      type: s.type,
      path: `${s.path}.aspectRatio`
    }));
  }
}, de = (e, t, s) => {
  if (e === void 0) return;
  if (!Array.isArray(e)) {
    t.push(l("widget-registry.invalid-layout", "error", "resizeHandles must be an array.", {
      type: s.type,
      path: `${s.path}.resizeHandles`
    }));
    return;
  }
  const i = [];
  return e.forEach((r, a) => {
    if (typeof r == "string" && re.has(r)) {
      const n = r;
      i.includes(n) || i.push(n);
      return;
    }
    t.push(l("widget-registry.invalid-layout", "error", "Invalid resize handle.", {
      type: s.type,
      path: `${s.path}.resizeHandles[${a}]`
    }));
  }), i;
}, T = () => ({
  ...z
}), $ = (e, t = {}) => {
  const s = t.policy || "strict", i = t.path || "layoutDefaults", r = [], a = t.includeFallback ? T() : {};
  if (e == null)
    return t.includeFallback && r.push(l("widget-registry.invalid-layout", "info", "Widget layout defaults omitted; fallback size is used.", {
      type: t.type,
      path: i
    })), { ok: !0, layout: a, diagnostics: r };
  if (!p(e))
    return r.push(l("widget-registry.invalid-layout", "error", "Widget layout defaults must be a plain object.", {
      type: t.type,
      path: i
    })), { ok: !1, layout: a, diagnostics: r };
  ["w", "h", "minW", "minH", "maxW", "maxH"].forEach((y) => {
    const f = ne(e[y], y, r, { type: t.type, path: i });
    f !== void 0 && (a[y] = f);
  }), ["static", "draggable", "resizable", "bounded", "preserveAspectRatio"].forEach((y) => {
    const f = ae(e[y]);
    f !== void 0 && (a[y] = f);
  });
  const d = de(e.resizeHandles, r, { type: t.type, path: i });
  d && (a.resizeHandles = d);
  const c = oe(e.aspectRatio, r, { type: t.type, path: i });
  if (c !== void 0 && (a.aspectRatio = c), e.extensions !== void 0) {
    const y = w(e.extensions, { policy: s, path: `${i}.extensions` });
    r.push(...y.diagnostics), y.ok && (a.extensions = y.value);
  }
  return S(a.maxW) && S(a.minW) && a.maxW < a.minW && r.push(l("widget-registry.capability-conflict", "error", "maxW must be greater than or equal to minW.", {
    type: t.type,
    path: i
  })), S(a.maxH) && S(a.minH) && a.maxH < a.minH && r.push(l("widget-registry.capability-conflict", "error", "maxH must be greater than or equal to minH.", {
    type: t.type,
    path: i
  })), a.preserveAspectRatio && a.aspectRatio === void 0 && r.push(l("widget-registry.capability-conflict", "warning", "preserveAspectRatio is set without an explicit aspectRatio; runtime may derive one from geometry.", {
    type: t.type,
    path: i
  })), { ok: s === "tolerant" || !x(r), layout: a, diagnostics: r };
}, ce = (...e) => {
  const t = {};
  return e.forEach((s) => {
    s && (Object.assign(t, s), s.extensions && (t.extensions = {
      ...t.extensions || {},
      ...s.extensions
    }));
  }), t;
}, le = (e, t = {}) => ({
  i: t.id,
  x: typeof t.x == "number" && Number.isFinite(t.x) ? Math.floor(t.x) : 0,
  y: typeof t.y == "number" && Number.isFinite(t.y) ? Math.floor(t.y) : 0,
  w: e.w || z.w,
  h: e.h || z.h,
  minW: e.minW,
  minH: e.minH,
  maxW: e.maxW,
  maxH: e.maxH,
  static: e.static,
  isDraggable: e.draggable,
  isResizable: e.resizable,
  isBounded: e.bounded,
  resizeHandles: e.resizeHandles
}), De = (e) => ({
  static: e.static,
  draggable: e.draggable,
  resizable: e.resizable,
  bounded: e.bounded,
  resizeHandles: e.resizeHandles,
  preserveAspectRatio: e.preserveAspectRatio,
  aspectRatio: e.aspectRatio
}), ge = /^[a-zA-Z][a-zA-Z0-9._:-]*$/, q = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/, ue = /* @__PURE__ */ new Set([
  "stable",
  "experimental",
  "deprecated",
  "hidden"
]), ye = (e, t) => {
  const s = k(e, { policy: t.policy, path: `widgets.${e.type || "unknown"}` });
  return !s.ok || !s.value || Array.isArray(s.value) || typeof s.value != "object" ? {
    ok: !1,
    definition: { type: "", version: "", title: "" },
    diagnostics: s.diagnostics
  } : {
    ok: !0,
    definition: s.value,
    diagnostics: s.diagnostics
  };
}, pe = (e, t = {}) => {
  var f, g, m;
  const s = t.policy || "strict", i = [];
  if (!p(e))
    return {
      ok: !1,
      diagnostics: [l("widget-registry.invalid-type", "error", "Widget type definition must be a plain object.")]
    };
  const r = typeof e.type == "string" ? e.type.trim() : "", a = !!(r && ((f = t.existingTypes) != null && f.has(r)) && !t.allowOverride);
  (!r || !ge.test(r)) && i.push(l("widget-registry.invalid-type", "error", "Widget type must be non-empty and use a stable identifier format.", {
    type: r || void 0,
    path: "type"
  })), r && ((g = t.existingTypes) != null && g.has(r)) && !t.allowOverride ? i.push(l("widget-registry.duplicate-type", "error", `Widget type "${r}" is already registered.`, {
    type: r,
    path: "type"
  })) : r && ((m = t.existingTypes) != null && m.has(r)) && t.allowOverride && i.push(l("widget-registry.duplicate-type", "warning", `Widget type "${r}" overrides an existing definition.`, {
    type: r,
    path: "type"
  }));
  const n = typeof e.version == "string" ? e.version.trim() : "";
  q.test(n) || i.push(l("widget-registry.invalid-version", "error", "Widget type version must be a SemVer string.", {
    type: r || void 0,
    path: "version"
  })), (typeof e.title != "string" || e.title.trim().length === 0) && i.push(l("widget-registry.invalid-type", "error", "Widget type title is required.", {
    type: r || void 0,
    path: "title"
  }));
  const o = typeof e.status == "string" ? e.status : "stable";
  if (ue.has(o) || i.push(l("widget-registry.invalid-type", "error", "Widget status is invalid.", {
    type: r || void 0,
    path: "status"
  })), e.rendererHint !== void 0) {
    const h = p(e.rendererHint) ? e.rendererHint : null;
    (!h || h.rendererKey !== void 0 && typeof h.rendererKey != "string" || h.componentKey !== void 0 && typeof h.componentKey != "string" || h.slot !== void 0 && typeof h.slot != "string") && i.push(l("widget-registry.renderer-hint-invalid", "error", "Renderer hint may only contain JSON-safe string metadata.", {
      type: r || void 0,
      path: "rendererHint"
    }));
  }
  const d = $(e.layoutDefaults, {
    type: r || void 0,
    path: "layoutDefaults",
    policy: s
  });
  if (i.push(...d.diagnostics), e.settings !== void 0) {
    (!p(e.settings) || !Array.isArray(e.settings.fields)) && i.push(l("widget-registry.invalid-settings", "error", "Widget settings descriptor must contain a fields array.", {
      type: r || void 0,
      path: "settings"
    }));
    const h = p(e.settings) ? e.settings.version : void 0;
    h !== void 0 && (typeof h != "string" || !q.test(h)) && i.push(l("widget-registry.invalid-version", "error", "Widget settings descriptor version must be a SemVer string.", {
      type: r || void 0,
      path: "settings.version"
    }));
  }
  e.dataRequirements !== void 0 && i.push(...w(e.dataRequirements, { policy: s, path: "dataRequirements" }).diagnostics), e.extensions !== void 0 && i.push(...w(e.extensions, { policy: s, path: "extensions" }).diagnostics);
  const c = ye(e, { policy: s });
  return i.push(...c.diagnostics), !a && (s === "tolerant" || !x(i)) ? { ok: !0, definition: {
    ...c.definition,
    type: r,
    version: n,
    title: String(e.title || r),
    status: o
  }, diagnostics: W(i) } : { ok: !1, diagnostics: W(i) };
}, F = (e) => e.status === "deprecated" ? [l("widget-registry.deprecated-type", "warning", `Widget type "${e.type}" is deprecated.`, {
  type: e.type,
  details: e.replacement ? { replacement: e.replacement } : void 0
})] : e.status === "experimental" ? [l("widget-registry.deprecated-type", "info", `Widget type "${e.type}" is experimental.`, {
  type: e.type
})] : e.status === "hidden" ? [l("widget-registry.hidden-type", "info", `Widget type "${e.type}" is hidden from default listings.`, {
  type: e.type
})] : [], fe = (e, t, s) => {
  var a, n, o, d;
  const i = e.status || "stable";
  if (i === "hidden" && !((a = t.includeHidden) != null ? a : s.includeHiddenByDefault) || i === "deprecated" && !((n = t.includeDeprecated) != null ? n : s.includeDeprecatedByDefault) || t.category && e.category !== t.category || t.status && !(Array.isArray(t.status) ? t.status : [t.status]).includes(i))
    return !1;
  if ((o = t.tags) != null && o.length) {
    const c = new Set(e.tags || []);
    if (!t.tags.every((u) => c.has(u))) return !1;
  }
  const r = (d = t.searchText) == null ? void 0 : d.trim().toLowerCase();
  return !(r && ![
    e.type,
    e.title,
    e.description,
    e.category,
    ...e.tags || []
  ].filter(Boolean).join(" ").toLowerCase().includes(r));
}, Me = (e = [], t = {}) => {
  const s = t.policy || "strict", i = /* @__PURE__ */ new Map(), r = [], a = {
    includeHiddenByDefault: t.includeHiddenByDefault === !0,
    includeDeprecatedByDefault: t.includeDeprecatedByDefault !== !1
  }, n = {
    register(o) {
      const d = pe(o, {
        policy: s,
        existingTypes: new Set(i.keys()),
        allowOverride: t.allowOverride
      });
      return r.push(...d.diagnostics), !d.ok || !d.definition ? { ok: !1, diagnostics: d.diagnostics } : (i.set(d.definition.type, d.definition), {
        ok: !0,
        definition: d.definition,
        diagnostics: W([...d.diagnostics, ...F(d.definition)])
      });
    },
    registerMany(o) {
      const d = [];
      return o.forEach((c) => {
        const u = n.register(c);
        d.push(...u.diagnostics);
      }), W(d);
    },
    resolve(o) {
      const d = typeof o == "string" ? o.trim() : "", c = i.get(d);
      return c ? {
        ok: !0,
        definition: c,
        diagnostics: W(F(c))
      } : { ok: !1, diagnostics: [l("widget-registry.unknown-type", "error", `Widget type "${d || "unknown"}" is not registered.`, {
        type: d || void 0
      })] };
    },
    list(o = {}) {
      return Array.from(i.values()).filter((d) => fe(d, o, a)).sort(
        (d, c) => `${d.category || ""}:${d.title || ""}:${d.type}`.localeCompare(`${c.category || ""}:${c.title || ""}:${c.type}`)
      );
    },
    diagnostics() {
      return W(r);
    }
  };
  return n.registerMany(e), n;
}, C = (e, t) => JSON.stringify(e) === JSON.stringify(t), P = (e, t) => {
  const s = t.split(".").filter(Boolean);
  let i = e;
  for (const r of s) {
    if (!i || typeof i != "object" || Array.isArray(i)) return;
    i = i[r];
  }
  return i;
}, O = (e, t) => {
  if (e.op === "exists") return P(t, e.path) !== void 0;
  if (e.op === "equals") {
    const s = P(t, e.path);
    return s !== void 0 && C(s, e.value);
  }
  return e.op === "not" ? !O(e.predicate, t) : e.op === "all" ? e.predicates.every((s) => O(s, t)) : e.op === "any" ? e.predicates.some((s) => O(s, t)) : !1;
}, he = (e) => e === "string" || e === "number" || e === "boolean" || e === "enum" || e === "color" || e === "text" || e === "json" || e === "object" || e === "array" || e === "ref", me = (e, t, s) => {
  var d, c, u, y;
  const i = [], r = `${s.path}.${e.id}`;
  if (t === void 0)
    return e.required && i.push(l("widget-registry.invalid-settings", "error", "Required widget setting is missing.", {
      type: s.type,
      fieldId: e.id,
      path: r
    })), { ok: !e.required, diagnostics: i };
  const a = k(t, { policy: s.policy, path: r });
  if (i.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: i };
  const n = a.value, o = (f) => (i.push(l("widget-registry.invalid-settings", "error", f, {
    type: s.type,
    fieldId: e.id,
    path: r
  })), { ok: !1, diagnostics: i });
  if ((e.type === "string" || e.type === "text") && typeof n != "string")
    return o("Widget setting must be a string.");
  if (e.type === "color" && typeof n != "string")
    return o("Widget color setting must be a string.");
  if (e.type === "number") {
    if (typeof n != "number" || !Number.isFinite(n)) return o("Widget setting must be a finite number.");
    if (typeof ((d = e.validation) == null ? void 0 : d.min) == "number" && n < e.validation.min) return o("Widget setting is below min.");
    if (typeof ((c = e.validation) == null ? void 0 : c.max) == "number" && n > e.validation.max) return o("Widget setting is above max.");
  }
  if (e.type === "boolean" && typeof n != "boolean")
    return o("Widget setting must be a boolean.");
  if (e.type === "enum" && !(e.options || []).map((g) => g.value).some((g) => C(g, n)))
    return o("Widget enum setting must match a declared option.");
  if (e.type === "object" && (!n || typeof n != "object" || Array.isArray(n)))
    return o("Widget object setting must be a JSON object.");
  if (e.type === "array" && !Array.isArray(n))
    return o("Widget array setting must be a JSON array.");
  if (typeof n == "string") {
    if (typeof ((u = e.validation) == null ? void 0 : u.maxLength) == "number" && n.length > e.validation.maxLength)
      return o("Widget string setting exceeds maxLength.");
    if ((y = e.validation) != null && y.pattern)
      try {
        if (!new RegExp(e.validation.pattern).test(n)) return o("Widget string setting does not match pattern.");
      } catch (f) {
        return o("Widget setting pattern is invalid.");
      }
  }
  return { ok: !0, value: n, diagnostics: i };
}, Z = (e, t) => {
  if (!e) return [];
  const s = [];
  if (!Array.isArray(e.fields))
    return s.push(l("widget-registry.invalid-settings", "error", "Settings descriptor fields must be an array.", {
      type: t.type,
      path: t.path
    })), s;
  const i = /* @__PURE__ */ new Set();
  return e.fields.forEach((r, a) => {
    const n = `${t.path}.fields[${a}]`;
    !r || typeof r.id != "string" || r.id.trim().length === 0 ? s.push(l("widget-registry.invalid-settings", "error", "Settings field id is required.", {
      type: t.type,
      path: n
    })) : i.has(r.id) ? s.push(l("widget-registry.invalid-settings", "error", `Duplicate settings field "${r.id}".`, {
      type: t.type,
      fieldId: r.id,
      path: n
    })) : i.add(r.id), he(r.type) || s.push(l("widget-registry.invalid-settings", "error", "Unsupported settings field type.", {
      type: t.type,
      fieldId: r.id,
      path: `${n}.type`
    }));
  }), s;
};
function we(e, t, s = {}) {
  var o;
  const i = s.policy || "strict", r = Z(e, { type: s.type, path: "settings" }), a = {};
  (o = e == null ? void 0 : e.fields) == null || o.forEach((d) => {
    if (d.defaultValue === void 0) return;
    const c = k(d.defaultValue, { policy: i, path: `settings.defaults.${d.id}` });
    r.push(...c.diagnostics), c.ok && c.value !== void 0 && (a[d.id] = c.value);
  });
  const n = t ? w(t, { policy: i, path: "settings.overrides" }) : { ok: !0, value: {}, diagnostics: [] };
  return r.push(...n.diagnostics), {
    settings: j(a, n.ok ? n.value : {}),
    diagnostics: r
  };
}
function K(e, t, s = {}) {
  var y, f;
  const i = s.policy || "strict", r = s.path || "settings", a = Z(e, { type: s.type, path: r }), n = t == null ? {} : t, o = w(n, { policy: i, path: r });
  a.push(...o.diagnostics);
  const d = o.ok ? o.value : {}, c = /* @__PURE__ */ new Map();
  (y = e == null ? void 0 : e.fields) == null || y.forEach((g) => {
    typeof g.id == "string" && c.set(g.id, g);
  }), c.forEach((g) => {
    const m = me(g, d[g.id], { policy: i, type: s.type, path: r });
    a.push(...m.diagnostics), m.ok && m.value !== void 0 && (d[g.id] = m.value), g.status === "deprecated" && a.push(l("widget-registry.deprecated-type", "warning", `Widget setting "${g.id}" is deprecated.`, {
      type: s.type,
      fieldId: g.id,
      path: `${r}.${g.id}`,
      details: g.replacement ? { replacement: g.replacement } : void 0
    }));
  }), Object.keys(d).forEach((g) => {
    c.has(g) || i === "strict" && a.push(l("widget-registry.invalid-settings", "error", "Unknown widget setting is not allowed by strict policy.", {
      type: s.type,
      fieldId: g,
      path: `${r}.${g}`
    }));
  }), i === "tolerant" && ((f = e == null ? void 0 : e.fields) == null || f.forEach((g) => {
    for (const m of [g.visibleWhen, g.enabledWhen])
      if (m)
        try {
          O(m, d);
        } catch (h) {
          a.push(l("widget-registry.invalid-settings", "warning", "Settings predicate could not be evaluated.", {
            type: s.type,
            fieldId: g.id,
            path: `${r}.${g.id}`
          }));
        }
  }));
  const u = i === "tolerant" || o.ok && !x(a);
  return !e && t !== void 0 && !p(t) ? {
    ok: !1,
    value: {},
    diagnostics: [l("widget-registry.invalid-settings", "error", "Widget settings must be a JSON object.", {
      type: s.type,
      path: r
    })]
  } : { ok: u, value: d, diagnostics: a };
}
const ve = (e) => e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "widget", be = (e, t) => {
  const s = new Set(t || []);
  let i = e, r = 2;
  for (; s.has(i); )
    i = `${e}-${r}`, r += 1;
  return i;
}, ke = (e, t) => {
  var s;
  if ((s = e.templates) != null && s.length)
    return t ? e.templates.find((i) => i.id === t) : e.templates[0];
}, A = (e, t) => {
  if (e === void 0) return {};
  const s = w(e, { policy: t.policy, path: t.path });
  return t.diagnostics.push(...s.diagnostics), s.ok ? s.value : {};
}, L = (e, t) => {
  if (e === void 0) return;
  const s = k(e, { policy: t.policy, path: t.path });
  return t.diagnostics.push(...s.diagnostics), s.ok ? s.value : void 0;
};
function Ie(e, t, s = {}) {
  const i = s.policy || "strict", r = [], a = e.resolve(t.type);
  if (r.push(...a.diagnostics), !a.ok) return { ok: !1, diagnostics: r };
  const n = a.definition, o = ke(n, t.templateId);
  t.templateId && !o && r.push(l("widget-registry.invalid-template", "error", `Widget template "${t.templateId}" is not defined.`, {
    type: t.type,
    path: "templateId"
  }));
  const d = $(n.layoutDefaults, {
    type: n.type,
    path: "layoutDefaults",
    policy: i,
    includeFallback: !0
  }), c = $(o == null ? void 0 : o.layout, {
    type: n.type,
    path: "template.layout",
    policy: i
  }), u = $(t.layout, {
    type: n.type,
    path: "input.layout",
    policy: i
  });
  r.push(...d.diagnostics, ...c.diagnostics, ...u.diagnostics);
  const y = ce(
    T(),
    d.layout,
    c.layout,
    u.layout
  ), f = we(n.settings, o == null ? void 0 : o.settings, {
    policy: i,
    type: n.type
  });
  r.push(...f.diagnostics);
  const g = j(f.settings, t.settings), m = K(n.settings, g, {
    policy: i,
    type: n.type
  });
  r.push(...m.diagnostics);
  const h = j(
    A(o == null ? void 0 : o.bindings, { policy: i, path: "template.bindings", diagnostics: r }),
    A(t.bindings, { policy: i, path: "input.bindings", diagnostics: r })
  ), E = t.payload !== void 0 ? L(t.payload, { policy: i, path: "input.payload", diagnostics: r }) : L(o == null ? void 0 : o.payload, { policy: i, path: "template.payload", diagnostics: r }), G = A(t.metadata, { policy: i, path: "input.metadata", diagnostics: r }), M = be(t.id || ve(`${n.type}-${(o == null ? void 0 : o.id) || "widget"}`), t.existingIds), N = t.label || (o == null ? void 0 : o.title) || n.title || n.type, V = (o == null ? void 0 : o.id) || t.templateId, v = {
    widgetType: n.type,
    widgetVersion: n.version,
    settings: m.value,
    bindings: h,
    migration: n.replacement ? {
      status: n.status === "deprecated" ? "deprecated" : "current",
      replacement: n.replacement
    } : {
      status: n.status === "deprecated" ? "deprecated" : "current"
    }
  };
  V && (v.templateId = V), E !== void 0 && (v.payload = E), n.rendererHint && (v.rendererHint = n.rendererHint), o != null && o.extensions && (v.extensions = o.extensions);
  const Q = {
    widgetType: v.widgetType,
    widgetVersion: v.widgetVersion || null,
    templateId: v.templateId || null,
    title: N,
    category: n.category || null,
    status: n.status || "stable",
    instance: v
  }, X = {
    ...le(y, { id: M }),
    id: M,
    label: N,
    metadata: {
      ...G,
      widget: Q
    },
    payload: E
  };
  return x(r) && i === "strict" ? { ok: !1, diagnostics: r } : {
    ok: !0,
    template: X,
    instance: v,
    diagnostics: r
  };
}
const b = (e) => `${e}.extensions.widget`, U = (e) => {
  var t;
  return (t = e == null ? void 0 : e.extensions) == null ? void 0 : t.widget;
};
function We(e) {
  const t = U(e);
  if (!p(t) || typeof t.widgetType != "string") return null;
  const s = w(t, { policy: "tolerant", path: "extensions.widget" });
  return s.ok ? s.value : null;
}
const $e = (e, t) => {
  if (!e || typeof e.widgetType != "string" || e.widgetType.trim().length === 0)
    return {
      ok: !1,
      metadata: null,
      diagnostics: [l("widget-registry.invalid-template", "error", "Widget instance metadata requires widgetType.", {
        path: t.path
      })]
    };
  const s = w(e, { policy: t.policy, path: t.path });
  return {
    ok: s.ok,
    metadata: s.ok ? s.value : null,
    diagnostics: s.diagnostics
  };
};
function xe(e, t, s = {}) {
  const i = s.policy || "strict", r = {
    ...e,
    extensions: {
      ...e.extensions || {}
    }
  };
  if (t === null)
    return delete r.extensions.widget, Object.keys(r.extensions || {}).length === 0 && delete r.extensions, { item: r, diagnostics: [] };
  const a = $e(t, { policy: i, path: "extensions.widget" });
  return !a.ok && i === "strict" ? { item: e, diagnostics: a.diagnostics } : (a.metadata && (r.extensions.widget = a.metadata), { item: r, diagnostics: a.diagnostics });
}
const J = (e, t, s, i) => {
  const r = [], a = U(t);
  if (a === void 0)
    return i.requireTypedItems && r.push(l("widget-registry.untyped-layout-item", "warning", "Dashboard item has no widget sidecar.", {
      itemId: e,
      profileId: i.profileId || void 0,
      path: b(i.path)
    })), r;
  const n = w(a, { policy: i.policy, path: b(i.path) });
  if (r.push(...n.diagnostics), !n.ok && i.policy === "strict") return r;
  const o = n.value;
  if (!o.widgetType)
    return r.push(l("widget-registry.invalid-template", "error", "Widget sidecar requires widgetType.", {
      itemId: e,
      profileId: i.profileId || void 0,
      path: b(i.path)
    })), r;
  if (!s)
    return r.push(l("widget-registry.unknown-type", "warning", "Widget registry unavailable; sidecar is preserved.", {
      type: o.widgetType,
      itemId: e,
      profileId: i.profileId || void 0,
      path: b(i.path)
    })), r;
  const d = s.resolve(o.widgetType);
  if (r.push(...d.diagnostics.map((c) => ({ ...c, itemId: e, profileId: i.profileId || void 0, path: c.path || b(i.path) }))), !d.ok) return r;
  if (o.widgetVersion && o.widgetVersion !== d.definition.version && r.push(l("widget-registry.deprecated-type", "warning", "Widget instance version differs from registered type version.", {
    type: o.widgetType,
    itemId: e,
    profileId: i.profileId || void 0,
    path: `${b(i.path)}.widgetVersion`,
    details: { registeredVersion: d.definition.version }
  })), o.settings !== void 0) {
    const c = K(d.definition.settings, o.settings, {
      policy: i.policy,
      type: o.widgetType,
      path: `${b(i.path)}.settings`
    });
    r.push(...c.diagnostics.map((u) => ({ ...u, itemId: e, profileId: i.profileId || void 0 })));
  }
  for (const c of ["bindings", "payload", "rendererHint", "extensions"]) {
    if (o[c] === void 0) continue;
    const u = k(o[c], { policy: i.policy, path: `${b(i.path)}.${c}` });
    r.push(...u.diagnostics.map((y) => ({ ...y, itemId: e, profileId: i.profileId || void 0 })));
  }
  return r;
};
function Ne(e, t, s = {}) {
  const i = s.policy || "strict", r = [];
  return (s.layoutId ? [s.layoutId] : Object.keys(e.layouts || {})).forEach((n) => {
    const o = e.layouts[n];
    o && (Object.keys(o.widgets || {}).forEach((d) => {
      r.push(...J(d, o.widgets[d], t, {
        policy: i,
        path: `layouts.${n}.widgets.${d}`,
        requireTypedItems: s.requireTypedItems
      }));
    }), Object.keys(o.profiles || {}).forEach((d) => {
      var u;
      if (s.profileId && s.profileId !== d) return;
      const c = (u = o.profiles) == null ? void 0 : u[d];
      Object.keys((c == null ? void 0 : c.widgets) || {}).forEach((y) => {
        r.push(...J(y, ((c == null ? void 0 : c.widgets) || {})[y], t, {
          policy: i,
          path: `layouts.${n}.profiles.${d}.widgets.${y}`,
          profileId: d,
          requireTypedItems: !1
        }));
      });
    }));
  }), {
    ok: i === "tolerant" || !x(r),
    diagnostics: r
  };
}
const D = (e) => e.map((t) => ({
  code: t.code,
  level: t.level,
  message: t.message,
  itemId: t.itemId,
  path: t.path,
  details: {
    type: t.type || null,
    fieldId: t.fieldId || null,
    profileId: t.profileId || null,
    details: t.details || null
  }
})), Ee = (e) => {
  var i;
  const t = (i = e == null ? void 0 : e.metadata) == null ? void 0 : i.widget;
  if (p(t) && p(t.instance))
    return t.instance;
  const s = e == null ? void 0 : e.payload;
  return p(s) && p(s.widget) ? s.widget : null;
}, Se = (e) => {
  const t = [];
  return Object.values((e == null ? void 0 : e.layouts) || {}).forEach((s) => {
    Object.keys(s.widgets || {}).forEach((i) => t.push({ id: i, item: s.widgets[i] })), Object.values(s.profiles || {}).forEach((i) => {
      Object.keys(i.widgets || {}).forEach((r) => t.push({ id: r, item: (i.widgets || {})[r] }));
    });
  }), t;
}, Oe = (e, t, s, i) => {
  const r = [];
  if (!e) return r;
  const a = new Set(t);
  return Object.values(e.layouts || {}).forEach((n) => {
    Object.keys(n.widgets || {}).forEach((o) => {
      if (!a.has(o)) return;
      const d = xe(n.widgets[o], s, { policy: i });
      r.push(...d.diagnostics.map((c) => ({ ...c, itemId: o }))), n.widgets[o] = d.item;
    });
  }), r;
}, Te = (e, t) => {
  const s = e.resolve(t);
  if (!s.ok) return null;
  const i = $(s.definition.layoutDefaults, {
    type: t,
    policy: "tolerant",
    includeFallback: !0
  });
  return {
    type: t,
    title: s.definition.title,
    description: s.definition.description,
    category: s.definition.category,
    tags: s.definition.tags,
    icon: s.definition.icon,
    status: s.definition.status,
    defaultSize: {
      w: i.layout.w || T().w,
      h: i.layout.h || T().h
    },
    diagnostics: [...s.diagnostics, ...i.diagnostics]
  };
};
function Ve(e, t = {}) {
  const s = t.policy || "tolerant";
  return {
    open: () => {
      const i = e.list(t.filter), r = i.map((n) => Te(e, n.type)).filter((n) => !!n), a = r.flatMap((n) => n.diagnostics);
      if (t.autoMaterializeFirst && i[0]) {
        const n = Ie(e, { type: i[0].type }, { policy: s });
        return n.ok ? [n.template] : {
          ok: !1,
          status: "blocked",
          reason: "validation",
          diagnostics: D(n.diagnostics)
        };
      }
      return {
        ok: !0,
        status: "success",
        metadata: { items: r },
        diagnostics: D(a)
      };
    }
  };
}
const B = (e, t) => {
  var i, r;
  if (!t)
    return {
      ok: !1,
      status: "blocked",
      reason: "validation",
      diagnostics: [{
        code: "widget-registry.invalid-template",
        level: "error",
        message: "Widget template does not include registry metadata.",
        actionId: e.actionId,
        actionType: e.actionType,
        source: e.source,
        reason: "validation"
      }]
    };
  const s = ((i = e.template) == null ? void 0 : i.id) || ((r = e.template) == null ? void 0 : r.i);
  return {
    id: `${e.actionId}:widget-registry`,
    kind: "widget",
    sourceIds: e.itemIds,
    newIds: s ? [String(s)] : void 0,
    metadata: { widget: t },
    opaque: { widget: t },
    diagnostics: []
  };
}, Ae = (e) => {
  var t, s;
  return p((t = e.metadata) == null ? void 0 : t.widget) ? (s = e.metadata) == null ? void 0 : s.widget : p(e.opaque) && p(e.opaque.widget) ? e.opaque.widget : null;
}, Y = (e, t, s) => {
  const i = {
    widgetType: e.widgetType,
    widgetVersion: e.widgetVersion,
    templateId: e.templateId,
    rendererHint: e.rendererHint,
    migration: e.migration,
    extensions: e.extensions
  };
  s !== "metadata-only" && (i.settings = e.settings), s === "settings-bindings-payload" && (i.bindings = e.bindings, i.payload = e.payload);
  const r = w(i, { policy: t, path: "prepared.metadata.widget" });
  return r.ok ? r.value : null;
}, He = (e, t, s) => {
  if (!p(e)) return null;
  const i = p(e.metadata) && p(e.metadata.widget) ? e.metadata.widget : p(e.widget) ? e.widget : null;
  return i ? Y(i, t, s) : null;
}, H = (e, t, s, i) => {
  for (const r of t) {
    const a = Se(e).find((o) => o.id === r), n = We(a == null ? void 0 : a.item);
    if (n) return Y(n, s, i);
  }
  return null;
};
function qe(e, t = {}) {
  const s = t.policy || "tolerant", i = t.clonePolicy || "settings-bindings-payload", r = (a) => {
    const n = He(a.payload, s, i) || H(a.document, a.itemIds, s, i);
    return B(a, n);
  };
  return {
    canCopyWidget: (a) => ({
      available: !!H(a.document, a.itemIds, s, i)
    }),
    copyWidget: (a) => {
      const n = H(a.document, a.itemIds, s, i);
      return n ? {
        ok: !0,
        status: "success",
        sourceIds: a.itemIds,
        metadata: { widget: n }
      } : {
        ok: !1,
        status: "blocked",
        reason: "missing-item",
        diagnostics: [{
          code: "widget-registry.unknown-type",
          level: "warning",
          message: "No widget registry metadata found for copied item.",
          actionId: a.actionId,
          actionType: a.actionType,
          source: a.source,
          reason: "missing-item"
        }]
      };
    },
    preparePasteWidget: r,
    prepareDuplicateWidget: r,
    prepareRemoveWidget: (a) => ({
      id: `${a.actionId}:widget-registry-remove`,
      kind: "widget",
      sourceIds: a.itemIds,
      metadata: { removedWidgetIds: a.itemIds }
    }),
    prepareAddWidget: (a) => B(a, Ee(a.template)),
    commit: (a, n) => {
      var u;
      const o = Ae(a);
      if (!o) return { ok: !0, status: "success" };
      const d = ((u = n.commandResult) == null ? void 0 : u.affectedIds) || a.newIds || [], c = Oe(n.proposedDocument, d, o, s);
      return {
        ok: !0,
        status: "success",
        newIds: d,
        sourceIds: a.sourceIds,
        idMap: a.idMap,
        metadata: {
          widget: o,
          sourceIds: a.sourceIds || [],
          newIds: d
        },
        diagnostics: D(c)
      };
    },
    rollback: (a) => ({
      ok: !0,
      status: "success",
      sourceIds: a.sourceIds,
      newIds: a.newIds,
      idMap: a.idMap
    })
  };
}
const Fe = l, Pe = k;
export {
  ze as asString,
  w as cloneJsonObject,
  k as cloneJsonValue,
  Pe as cloneWidgetRegistryJsonValue,
  Me as createWidgetRegistry,
  Ve as createWidgetRegistryPaletteAdapter,
  qe as createWidgetRegistryWidgetAdapter,
  we as createWidgetSettingsDefaults,
  l as diagnostic,
  x as diagnosticsHaveErrors,
  O as evaluateWidgetSettingsPredicate,
  Re as hasOwn,
  je as isJsonObject,
  p as isPlainRecord,
  te as isReservedKey,
  Ie as materializeWidgetTemplate,
  j as mergeJsonObjects,
  ce as mergeWidgetLayoutDefaults,
  $ as normalizeWidgetLayoutDefaults,
  We as readWidgetInstanceMetadata,
  W as stableDiagnostics,
  Ne as validateDashboardWidgetInstances,
  K as validateWidgetSettings,
  pe as validateWidgetTypeDefinition,
  T as widgetFallbackLayoutDefaults,
  De as widgetLayoutDefaultsToPhysicalCapability,
  le as widgetLayoutDefaultsToTemplateItem,
  Fe as widgetRegistryDiagnostic,
  xe as writeWidgetInstanceMetadata
};
