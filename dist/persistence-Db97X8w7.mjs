import { ref as C, shallowRef as ve, watch as ye } from "vue";
import { deepEqual as ge } from "fast-equals";
import { a as W } from "./utils-BCVYGne6.mjs";
const F = 1, ke = ["s", "w", "e", "n", "sw", "nw", "se", "ne"], m = (e, r, o = {}) => ({
  code: e,
  message: r,
  ...o
}), H = (e) => e !== null && typeof e == "object" && !Array.isArray(e), j = (e) => typeof e == "number" && Number.isFinite(e), he = (e) => {
  const r = Date.parse(e);
  return Number.isFinite(r);
}, we = (e) => typeof e == "string" && ke.indexOf(e) !== -1, A = (e, r, o, a) => ({
  code: e,
  message: r,
  path: o,
  details: a
}), R = (e, r = []) => {
  if (e == null || typeof e == "string" || typeof e == "boolean") return e;
  if (typeof e == "number") return Number.isFinite(e) ? e : void 0;
  if (!(typeof e == "bigint" || typeof e == "function" || typeof e == "symbol")) {
    if (e instanceof Date) return e.toISOString();
    if (Array.isArray(e)) {
      if (r.indexOf(e) !== -1) return;
      const o = r.concat(e);
      return e.map((a) => {
        const t = R(a, o);
        return typeof t == "undefined" ? null : t;
      });
    }
    if (typeof e == "object") {
      if (r.indexOf(e) !== -1) return;
      const o = r.concat(e), a = {};
      return Object.keys(e).forEach((t) => {
        const l = R(e[t], o);
        typeof l != "undefined" && (a[t] = l);
      }), a;
    }
  }
}, ie = (e) => {
  if (!e) return;
  const r = R(e);
  return H(r) ? r : void 0;
}, J = (e) => {
  if (e == null) return null;
  const r = JSON.stringify(e);
  return typeof r == "undefined" ? null : JSON.parse(r);
}, U = (e) => {
  const r = {};
  return Object.keys(e).forEach((o) => {
    r[o] = W(e[o]);
  }), r;
}, D = (e, r) => e === "layout" ? W(r) : U(r), oe = () => {
  const e = typeof globalThis != "undefined" ? globalThis.crypto : void 0;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `vgl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}, be = () => `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, pe = (e, r, o, a, t, l) => {
  const i = e[r];
  return typeof i == "undefined" ? null : !j(i) || i <= 0 ? a === "sanitize" ? (l.push(A("item-field-dropped", `Dropped invalid ${String(r)}.`, `${t}.${String(r)}`)), null) : m("validation", `${t}.${String(r)} must be a finite positive number.`, {
    path: `${t}.${String(r)}`
  }) : (o[r] = i, null);
}, xe = (e, r, o, a, t, l) => {
  const i = e[r];
  return typeof i == "undefined" ? null : typeof i != "boolean" ? a === "sanitize" ? (l.push(A("item-field-dropped", `Dropped invalid ${String(r)}.`, `${t}.${String(r)}`)), null) : m("validation", `${t}.${String(r)} must be a boolean.`, {
    path: `${t}.${String(r)}`
  }) : (o[r] = i, null);
}, se = (e, r, o) => {
  const a = [];
  if (!Array.isArray(e))
    return {
      ok: !1,
      warnings: a,
      error: m("validation", `${o} must be an array.`, { path: o })
    };
  const t = {}, l = [];
  for (let i = 0; i < e.length; i++) {
    const n = `${o}[${i}]`, s = e[i];
    if (!H(s)) {
      if (r === "sanitize") {
        a.push(A("item-dropped", "Dropped non-object layout item.", n));
        continue;
      }
      return {
        ok: !1,
        warnings: a,
        error: m("validation", `${n} must be an object.`, { path: n })
      };
    }
    const v = s.i;
    if (typeof v != "string" || v.trim() === "") {
      if (r === "sanitize") {
        a.push(A("item-dropped", "Dropped layout item with invalid id.", `${n}.i`));
        continue;
      }
      return {
        ok: !1,
        warnings: a,
        error: m("validation", `${n}.i must be a non-empty string.`, {
          path: `${n}.i`
        })
      };
    }
    if (t[v])
      return {
        ok: !1,
        warnings: a,
        error: m("validation", `Layout item id "${v}" is duplicated.`, {
          path: `${n}.i`
        })
      };
    const g = s.x, h = s.y, b = s.w, y = s.h;
    if (!j(g) || !j(h) || !j(b) || !j(y)) {
      if (r === "sanitize") {
        a.push(A("item-dropped", "Dropped layout item with non-numeric position or size.", n));
        continue;
      }
      return {
        ok: !1,
        warnings: a,
        error: m("validation", `${n} position and size fields must be finite numbers.`, {
          path: n
        })
      };
    }
    let w = g, x = h, V = b, S = y;
    if (w < 0 || x < 0) {
      if (r !== "sanitize")
        return {
          ok: !1,
          warnings: a,
          error: m("validation", `${n} must not have negative x or y.`, {
            path: n
          })
        };
      a.push(A("item-clamped", "Clamped negative x/y to zero.", n)), w = Math.max(0, w), x = Math.max(0, x);
    }
    if (V <= 0 || S <= 0) {
      if (r !== "sanitize")
        return {
          ok: !1,
          warnings: a,
          error: m("validation", `${n} must have positive w and h.`, { path: n })
        };
      a.push(A("item-clamped", "Clamped non-positive w/h to one.", n)), V = Math.max(1, V), S = Math.max(1, S);
    }
    const f = {
      i: v,
      x: w,
      y: x,
      w: V,
      h: S
    };
    for (const c of ["minW", "minH", "maxW", "maxH"]) {
      const d = pe(s, c, f, r, n, a);
      if (d) return { ok: !1, warnings: a, error: d };
    }
    if (typeof f.minW == "number" && f.w < f.minW) {
      if (r !== "sanitize")
        return {
          ok: !1,
          warnings: a,
          error: m("validation", `${n}.w conflicts with minW.`, {
            path: `${n}.w`
          })
        };
      a.push(A("item-clamped", "Raised w to satisfy minW.", `${n}.w`)), f.w = f.minW;
    }
    if (typeof f.minH == "number" && f.h < f.minH) {
      if (r !== "sanitize")
        return {
          ok: !1,
          warnings: a,
          error: m("validation", `${n}.h conflicts with minH.`, {
            path: `${n}.h`
          })
        };
      a.push(A("item-clamped", "Raised h to satisfy minH.", `${n}.h`)), f.h = f.minH;
    }
    if (typeof f.maxW == "number" && f.w > f.maxW) {
      if (r !== "sanitize")
        return {
          ok: !1,
          warnings: a,
          error: m("validation", `${n}.w conflicts with maxW.`, {
            path: `${n}.w`
          })
        };
      a.push(A("item-clamped", "Lowered w to satisfy maxW.", `${n}.w`)), f.w = f.maxW;
    }
    if (typeof f.maxH == "number" && f.h > f.maxH) {
      if (r !== "sanitize")
        return {
          ok: !1,
          warnings: a,
          error: m("validation", `${n}.h conflicts with maxH.`, {
            path: `${n}.h`
          })
        };
      a.push(A("item-clamped", "Lowered h to satisfy maxH.", `${n}.h`)), f.h = f.maxH;
    }
    if (typeof f.minW == "number" && typeof f.maxW == "number" && f.minW > f.maxW || typeof f.minH == "number" && typeof f.maxH == "number" && f.minH > f.maxH)
      return {
        ok: !1,
        warnings: a,
        error: m("validation", `${n} has conflicting min/max constraints.`, {
          path: n
        })
      };
    for (const c of ["moved", "static", "isDraggable", "isResizable", "isBounded"]) {
      const d = xe(s, c, f, r, n, a);
      if (d) return { ok: !1, warnings: a, error: d };
    }
    if (typeof s.resizeHandles != "undefined")
      if (Array.isArray(s.resizeHandles)) {
        const c = s.resizeHandles.filter(we);
        if (c.length !== s.resizeHandles.length && r !== "sanitize")
          return {
            ok: !1,
            warnings: a,
            error: m("validation", `${n}.resizeHandles contains an invalid handle.`, {
              path: `${n}.resizeHandles`
            })
          };
        c.length > 0 && (f.resizeHandles = c), c.length !== s.resizeHandles.length && a.push(A("item-field-cleaned", "Removed invalid resize handle values.", `${n}.resizeHandles`));
      } else {
        if (r !== "sanitize")
          return {
            ok: !1,
            warnings: a,
            error: m("validation", `${n}.resizeHandles must be an array.`, {
              path: `${n}.resizeHandles`
            })
          };
        a.push(A("item-field-dropped", "Dropped invalid resizeHandles.", `${n}.resizeHandles`));
      }
    t[v] = !0, l.push(f);
  }
  return { ok: !0, layout: l, warnings: a };
}, $e = (e, r, o) => {
  const a = [];
  if (!H(e))
    return {
      ok: !1,
      warnings: a,
      error: m("validation", `${o} must be an object of breakpoint layouts.`, { path: o })
    };
  const t = {};
  Object.keys(e).forEach((l) => {
    t[l];
  });
  for (const l of Object.keys(e)) {
    const i = se(e[l], r, `${o}.${l}`);
    if (a.push(...i.warnings), !i.ok) {
      if (r === "sanitize") {
        a.push(A("breakpoint-dropped", `Dropped invalid breakpoint layout "${l}".`, `${o}.${l}`));
        continue;
      }
      return { ok: !1, warnings: a, error: i.error };
    }
    t[l] = i.layout;
  }
  return { ok: !0, layouts: t, warnings: a };
}, le = (e) => {
  if (typeof e != "string") return { ok: !0, value: e };
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch (r) {
    return {
      ok: !1,
      error: m("invalid-json", "Persistence payload is not valid JSON.", { cause: r })
    };
  }
};
function _(e, r = {}) {
  var s, v;
  const o = (s = r.currentVersion) != null ? s : F, a = (v = r.validation) != null ? v : "strict", t = [];
  if (!H(e))
    return {
      ok: !1,
      warnings: t,
      error: m("invalid-document", "Persistence document must be an object.")
    };
  if (e.layoutSchemaVersion !== o)
    return {
      ok: !1,
      warnings: t,
      error: m("invalid-document", `Expected schema version ${o}.`, {
        path: "layoutSchemaVersion"
      })
    };
  if (e.kind !== "layout" && e.kind !== "responsive")
    return {
      ok: !1,
      warnings: t,
      error: m("invalid-document", 'Document kind must be "layout" or "responsive".', {
        path: "kind"
      })
    };
  if (r.expectedKind && e.kind !== r.expectedKind)
    return {
      ok: !1,
      warnings: t,
      error: m("kind-mismatch", `Expected a ${r.expectedKind} persistence document.`, {
        kind: r.expectedKind,
        path: "kind",
        details: { actualKind: e.kind }
      })
    };
  for (const g of ["key", "revision", "sourceId", "savedAt"])
    if (typeof e[g] != "string" || e[g].trim() === "")
      return {
        ok: !1,
        warnings: t,
        error: m("invalid-document", `Document ${g} must be a non-empty string.`, {
          path: g
        })
      };
  if (!he(e.savedAt))
    return {
      ok: !1,
      warnings: t,
      error: m("invalid-document", "Document savedAt must be a valid date string.", {
        path: "savedAt"
      })
    };
  if (!H(e.data))
    return {
      ok: !1,
      warnings: t,
      error: m("invalid-document", "Document data must be an object.", { path: "data" })
    };
  const l = H(e.meta) ? ie(e.meta) : void 0;
  if (typeof e.meta != "undefined" && !H(e.meta)) {
    if (a !== "sanitize")
      return {
        ok: !1,
        warnings: t,
        error: m("invalid-document", "Document meta must be a JSON-safe object.", {
          path: "meta"
        })
      };
    t.push(A("meta-dropped", "Dropped invalid meta.", "meta"));
  }
  if (e.kind === "layout") {
    const g = se(e.data.layout, a, "data.layout");
    return t.push(...g.warnings), g.ok ? { ok: !0, document: {
      layoutSchemaVersion: o,
      kind: "layout",
      key: e.key,
      revision: e.revision,
      sourceId: e.sourceId,
      savedAt: e.savedAt,
      data: { layout: g.layout },
      ...l ? { meta: l } : {}
    }, value: W(g.layout), warnings: t } : { ok: !1, warnings: t, error: g.error };
  }
  const i = $e(e.data.layouts, a, "data.layouts");
  return t.push(...i.warnings), i.ok ? { ok: !0, document: {
    layoutSchemaVersion: o,
    kind: "responsive",
    key: e.key,
    revision: e.revision,
    sourceId: e.sourceId,
    savedAt: e.savedAt,
    data: { layouts: i.layouts },
    ...l ? { meta: l } : {}
  }, value: U(i.layouts), warnings: t } : { ok: !1, warnings: t, error: i.error };
}
function Se(e, r) {
  var v, g, h;
  const o = (v = r.now) != null ? v : () => /* @__PURE__ */ new Date(), a = (g = r.revision) != null ? g : be, t = (h = r.sourceId) != null ? h : oe(), l = o().toISOString(), i = {
    layoutSchemaVersion: F,
    key: r.key,
    revision: a(),
    sourceId: t,
    savedAt: l,
    ...r.meta ? { meta: ie(r.meta) } : {}
  }, n = r.kind === "layout" ? {
    ...i,
    kind: "layout",
    data: { layout: W(e) }
  } : {
    ...i,
    kind: "responsive",
    data: { layouts: U(e) }
  }, s = _(n, {
    expectedKind: r.kind,
    currentVersion: F,
    validation: "strict"
  });
  if (!s.ok) throw s.error;
  return s.document;
}
function De(e, r = {}) {
  var v, g, h;
  const o = (v = r.currentVersion) != null ? v : F, a = (g = r.migrations) != null ? g : {}, t = e, l = [];
  if (!H(e) || !Number.isInteger(e.layoutSchemaVersion))
    return {
      ok: !1,
      originalPayload: t,
      migrations: l,
      warnings: [],
      error: m("invalid-document", "Document has no numeric layoutSchemaVersion.", {
        path: "layoutSchemaVersion",
        originalPayload: t
      })
    };
  let i = e.layoutSchemaVersion;
  if (i > o)
    return {
      ok: !1,
      originalPayload: t,
      migrations: l,
      warnings: [],
      error: m("invalid-document", `Schema version ${i} is newer than supported ${o}.`, {
        path: "layoutSchemaVersion",
        originalPayload: t
      })
    };
  let n = e;
  for (; i < o; ) {
    const b = a[i];
    if (!b)
      return {
        ok: !1,
        originalPayload: t,
        migrations: l,
        warnings: [],
        error: m("migration-missing", `Missing migration from version ${i} to ${i + 1}.`, {
          originalPayload: t
        })
      };
    try {
      n = b(n, { fromVersion: i, toVersion: i + 1 });
    } catch (y) {
      return {
        ok: !1,
        originalPayload: t,
        migrations: l,
        warnings: [],
        error: m("migration-failed", `Migration from version ${i} to ${i + 1} failed.`, {
          cause: y,
          originalPayload: t
        })
      };
    }
    if (!H(n) || n.layoutSchemaVersion !== i + 1)
      return {
        ok: !1,
        originalPayload: t,
        migrations: l,
        warnings: [],
        error: m("migration-failed", `Migration from version ${i} to ${i + 1} returned an invalid document.`, {
          originalPayload: t
        })
      };
    l.push({ fromVersion: i, toVersion: i + 1 }), i += 1;
  }
  const s = _(n, {
    expectedKind: r.expectedKind,
    currentVersion: o,
    validation: (h = r.validation) != null ? h : "strict"
  });
  return s.ok ? {
    ok: !0,
    document: s.document,
    migrations: l,
    originalPayload: t,
    warnings: s.warnings
  } : {
    ok: !1,
    originalPayload: t,
    migrations: l,
    warnings: s.warnings,
    error: l.length > 0 ? m("migration-failed", "Migration result failed validation.", {
      cause: s.error,
      originalPayload: t
    }) : s.error
  };
}
function ae(e, r = {}) {
  var l, i, n, s, v;
  const o = le(e);
  if (!o.ok)
    return {
      ok: !1,
      error: o.error,
      fallback: r.fallback ? D((l = r.expectedKind) != null ? l : "layout", r.fallback) : void 0,
      originalPayload: e,
      migrations: [],
      warnings: []
    };
  const a = De(o.value, {
    currentVersion: r.currentVersion,
    migrations: r.migrations,
    expectedKind: r.expectedKind,
    validation: (i = r.validation) != null ? i : "strict"
  });
  if (!a.ok)
    return {
      ok: !1,
      error: a.error,
      fallback: r.fallback ? D((n = r.expectedKind) != null ? n : "layout", r.fallback) : void 0,
      originalPayload: a.originalPayload,
      migrations: a.migrations,
      warnings: a.warnings
    };
  const t = _(a.document, {
    expectedKind: r.expectedKind,
    currentVersion: r.currentVersion,
    validation: (s = r.validation) != null ? s : "strict"
  });
  return t.ok ? {
    ok: !0,
    document: t.document,
    value: t.value,
    migrations: a.migrations,
    warnings: a.warnings.concat(t.warnings)
  } : {
    ok: !1,
    error: a.migrations.length > 0 ? m("migration-failed", "Migrated document failed validation.", {
      cause: t.error,
      originalPayload: a.originalPayload
    }) : t.error,
    fallback: r.fallback ? D((v = r.expectedKind) != null ? v : "layout", r.fallback) : void 0,
    originalPayload: a.originalPayload,
    migrations: a.migrations,
    warnings: a.warnings.concat(t.warnings)
  };
}
const T = (e, r, o, a, t) => H(o) && typeof o.code == "string" && typeof o.message == "string" ? o : m(e, r, { cause: o, key: a, kind: t }), Ie = (e, r = "localStorage") => e || (typeof window == "undefined" || !window[r] ? null : window[r]), ue = (e, r = {}) => {
  var l;
  const o = (l = r.prefix) != null ? l : "", a = (i) => `${o}${i}`, t = () => {
    const i = Ie(r.storage, e);
    if (!i)
      throw m("adapter-unavailable", `${e} is not available in this environment.`);
    return i;
  };
  return {
    load(i) {
      const n = t();
      try {
        return n.getItem(a(i));
      } catch (s) {
        throw T("adapter-load-failed", "Failed to load persistence document.", s, i);
      }
    },
    save(i, n) {
      const s = t();
      try {
        s.setItem(a(i), JSON.stringify(n));
      } catch (v) {
        throw T("adapter-save-failed", "Failed to save persistence document.", v, i, n.kind);
      }
    },
    remove(i) {
      const n = t();
      try {
        n.removeItem(a(i));
      } catch (s) {
        throw T("adapter-remove-failed", "Failed to remove persistence document.", s, i);
      }
    },
    subscribe(i, n) {
      const s = t();
      if (typeof window == "undefined" || typeof window.addEventListener != "function")
        return () => {
        };
      const v = a(i), g = (h) => {
        if (h.storageArea && h.storageArea !== s || h.key !== v) return;
        const b = h.newValue == null ? null : le(h.newValue), y = b && b.ok ? b.value : h.newValue, w = H(y) && typeof y.sourceId == "string" ? y.sourceId : void 0;
        r.sourceId && w === r.sourceId || n({
          key: i,
          source: "storage",
          raw: h.newValue,
          oldRaw: h.oldValue,
          document: y,
          sourceId: w
        });
      };
      return window.addEventListener("storage", g), () => window.removeEventListener("storage", g);
    }
  };
};
function ze(e = {}) {
  return ue("localStorage", e);
}
function Me(e = {}) {
  return ue("sessionStorage", e);
}
const ne = async (e, r, o, a) => {
  if (!r || !Number.isFinite(r) || r <= 0) return await e;
  let t = null;
  try {
    const l = new Promise((i, n) => {
      t = setTimeout(() => {
        n(m("adapter-timeout", `Adapter ${a} timed out after ${r}ms.`, {
          key: o,
          details: { operation: a, timeoutMs: r }
        }));
      }, r);
    });
    return await Promise.race([e, l]);
  } finally {
    t && clearTimeout(t);
  }
}, B = (e) => new Promise((r, o) => {
  e.onsuccess = () => r(e.result), e.onerror = () => o(e.error || m("adapter-unavailable", "IndexedDB request failed."));
});
function Oe(e = {}) {
  var y, w, x, V, S, f;
  const r = (y = e.dbName) != null ? y : "vue-grid-layout-persistence", o = (w = e.storeName) != null ? w : "layouts", a = (x = e.version) != null ? x : 1, t = (V = e.prefix) != null ? V : "", l = (S = e.timeoutMs) != null ? S : 1e4, i = (f = e.channelName) != null ? f : `${r}:${o}`, n = (c) => `${t}${c}`, s = () => {
    var d;
    const c = (d = e.indexedDB) != null ? d : typeof indexedDB != "undefined" ? indexedDB : null;
    if (!c)
      throw m("adapter-unavailable", "IndexedDB is not available in this environment.");
    return c;
  }, v = async (c) => {
    const d = s(), p = new Promise((I, $) => {
      const z = d.open(r, a);
      z.onupgradeneeded = () => {
        const M = z.result;
        M.objectStoreNames.contains(o) || M.createObjectStore(o);
      }, z.onsuccess = () => I(z.result), z.onerror = () => $(z.error || m("adapter-unavailable", "Failed to open IndexedDB database.")), z.onblocked = () => $(m("adapter-unavailable", "IndexedDB upgrade is blocked by another connection."));
    });
    return await ne(p, l, c, "load");
  }, g = async (c, d, p, I) => {
    let $ = null;
    try {
      $ = await v(c);
      const z = $.transaction(o, d).objectStore(o);
      return await ne(I(z), l, c, p);
    } finally {
      $ == null || $.close();
    }
  }, h = () => {
    var d;
    if (e.broadcast === !1) return null;
    const c = (d = e.broadcastChannel) != null ? d : typeof BroadcastChannel != "undefined" ? BroadcastChannel : null;
    return c ? new c(i) : null;
  }, b = (c, d) => {
    const p = h();
    if (p)
      try {
        const I = H(d) && typeof d.sourceId == "string" ? d.sourceId : void 0;
        p.postMessage({ key: c, document: d, sourceId: I });
      } finally {
        p.close();
      }
  };
  return {
    load(c) {
      return g(c, "readonly", "load", (d) => B(d.get(n(c))));
    },
    async save(c, d) {
      try {
        await g(c, "readwrite", "save", (p) => B(p.put(J(d), n(c)))), b(c, d);
      } catch (p) {
        throw T("adapter-save-failed", "Failed to save IndexedDB persistence document.", p, c, d.kind);
      }
    },
    async remove(c) {
      try {
        await g(c, "readwrite", "remove", (d) => B(d.delete(n(c)))), b(c, null);
      } catch (d) {
        throw T("adapter-remove-failed", "Failed to remove IndexedDB persistence document.", d, c);
      }
    },
    subscribe(c, d) {
      const p = h();
      return p ? (p.onmessage = (I) => {
        var z;
        const $ = I.data;
        !$ || $.key !== c || e.sourceId && $.sourceId === e.sourceId || d({
          key: c,
          source: "adapter",
          document: (z = $.document) != null ? z : null,
          raw: $.document,
          sourceId: $.sourceId
        });
      }, () => p.close()) : () => {
      };
    }
  };
}
function Ne(e) {
  var v, g, h, b;
  const r = (v = e.loadMethod) != null ? v : "GET", o = (g = e.saveMethod) != null ? g : "PUT", a = (h = e.removeMethod) != null ? h : "DELETE", t = (b = e.timeoutMs) != null ? b : 1e4, l = () => {
    var w;
    const y = (w = e.fetch) != null ? w : typeof fetch != "undefined" ? fetch : null;
    if (!y)
      throw m("adapter-unavailable", "fetch is not available in this environment.");
    return y;
  }, i = (y) => typeof e.endpoint == "function" ? e.endpoint(y) : e.endpoint.replace(/\{key\}/g, encodeURIComponent(y)), n = () => {
    const y = typeof e.headers == "function" ? e.headers() : e.headers;
    return y != null ? y : { "content-type": "application/json" };
  }, s = async (y, w, x) => {
    const V = l(), S = typeof AbortController != "undefined" ? new AbortController() : null;
    let f = null;
    try {
      S && t > 0 && (f = setTimeout(() => S.abort(), t));
      const c = await V(i(y), {
        credentials: e.credentials,
        ...w,
        signal: S == null ? void 0 : S.signal
      });
      if (!c.ok && !(x === "load" && c.status === 404))
        throw m(
          x === "load" ? "adapter-load-failed" : x === "save" ? "adapter-save-failed" : "adapter-remove-failed",
          `Remote persistence ${x} failed with HTTP ${c.status}.`,
          { key: y, details: { status: c.status, statusText: c.statusText } }
        );
      return c;
    } catch (c) {
      const d = H(c) && c.name === "AbortError";
      throw T(
        d ? "adapter-timeout" : x === "load" ? "adapter-load-failed" : x === "save" ? "adapter-save-failed" : "adapter-remove-failed",
        `Failed to ${x} remote persistence document.`,
        c,
        y
      );
    } finally {
      f && clearTimeout(f);
    }
  };
  return {
    async load(y) {
      const w = await s(y, { method: r, headers: n() }, "load");
      return w.status === 404 || w.status === 204 ? null : e.parse ? await e.parse(w) : await w.json();
    },
    async save(y, w) {
      const x = e.serialize ? e.serialize(w) : JSON.stringify(w);
      await s(y, { method: o, headers: n(), body: x }, "save");
    },
    async remove(y) {
      await s(y, { method: a, headers: n() }, "remove");
    }
  };
}
function Fe(e = {}) {
  const r = { ...e }, o = {}, a = (t, l) => {
    const i = o[t] || [], n = H(l) && typeof l.sourceId == "string" ? l.sourceId : void 0;
    i.slice().forEach((s) => s({
      key: t,
      source: "adapter",
      document: l,
      raw: l,
      sourceId: n
    }));
  };
  return {
    load(t) {
      return Object.prototype.hasOwnProperty.call(r, t) ? J(r[t]) : null;
    },
    save(t, l) {
      r[t] = J(l), a(t, r[t]);
    },
    remove(t) {
      delete r[t], a(t, null);
    },
    subscribe(t, l) {
      return o[t] || (o[t] = []), o[t].push(l), () => {
        o[t] = (o[t] || []).filter((i) => i !== l);
      };
    }
  };
}
const Ae = (e, r) => r ? Date.parse(e.savedAt) > Date.parse(r) : !0;
function Le(e) {
  var G, Y, X, Z, Q, ee, re, te;
  const r = (G = e.adapter) != null ? G : ze({ sourceId: e.sourceId }), o = (Y = e.autoSave) != null ? Y : !0, a = (X = e.debounceMs) != null ? X : 300, t = (Z = e.validation) != null ? Z : "strict", l = (Q = e.conflictStrategy) != null ? Q : "manual", i = (ee = e.sourceId) != null ? ee : oe(), n = (re = e.timeoutMs) != null ? re : 1e4, s = C("idle"), v = C(!1), g = C(null), h = C(null), b = ve(null);
  let y = D(e.kind, e.target.value), w = null, x = !1, V = !1, S = null, f = null;
  const c = () => {
    if (e.meta)
      return typeof e.meta == "function" ? e.meta() : e.meta;
  }, d = (k) => {
    var u;
    (u = e.onEvent) == null || u.call(e, k);
  }, p = (k) => {
    var u;
    g.value = k, (u = e.onError) == null || u.call(e, k), d({ type: "error", key: e.key, kind: e.kind, error: k });
  }, I = () => {
    w && clearTimeout(w), w = null;
  }, $ = (k) => {
    x = !0, e.target.value = D(e.kind, k), x = !1;
  }, z = () => Se(e.target.value, {
    key: e.key,
    kind: e.kind,
    sourceId: i,
    meta: c()
  }), M = async (k, u, E, P) => {
    let O = null;
    try {
      const N = Promise.resolve(u());
      if (!(Number.isFinite(n) && n > 0)) return await N;
      const fe = new Promise((He, me) => {
        O = setTimeout(() => {
          me(m("adapter-timeout", `${P} Timed out after ${n}ms.`, {
            key: e.key,
            kind: e.kind,
            details: { operation: k, timeoutMs: n }
          }));
        }, n);
      });
      return await Promise.race([N, fe]);
    } catch (N) {
      throw T(E, P, N, e.key, e.kind);
    } finally {
      O && clearTimeout(O);
    }
  }, ce = () => {
    v.value = !ge(e.target.value, y);
  }, q = () => {
    !o || !v.value || V || (I(), w = setTimeout(() => {
      w = null, L.save();
    }, a));
  }, K = (k, u, E) => {
    I(), $(u), y = D(e.kind, u), h.value = k.savedAt, v.value = !1, g.value = null, b.value = null, s.value = "ready", E && d({
      type: "external-apply",
      key: e.key,
      kind: e.kind,
      document: k,
      value: D(e.kind, u),
      reason: E
    });
  }, de = (k) => {
    var O;
    if (V || k.document == null) return;
    const u = ae((O = k.document) != null ? O : k.raw, {
      expectedKind: e.kind,
      currentVersion: F,
      migrations: e.migrations,
      validation: t,
      fallback: e.fallback
    });
    if (!u.ok) {
      p(u.error);
      return;
    }
    if (u.document.sourceId === i || !Ae(u.document, h.value)) return;
    if (!v.value) {
      K(u.document, u.value, "clean-external-change");
      return;
    }
    if (l === "newer-wins") {
      K(u.document, u.value, "newer-wins");
      return;
    }
    if (l === "keep-local") {
      q();
      return;
    }
    const E = z(), P = {
      key: e.key,
      reason: "dirty-external-change",
      localValue: D(e.kind, e.target.value),
      externalValue: D(e.kind, u.value),
      localDocument: E,
      externalDocument: u.document,
      resolve: (N) => L.resolveConflict(N)
    };
    b.value = P, s.value = "conflict", d({ type: "conflict", key: e.key, kind: e.kind, conflict: P });
  }, L = {
    status: s,
    dirty: v,
    error: g,
    lastSavedAt: h,
    conflict: b,
    async load() {
      I(), s.value = "loading", g.value = null, d({ type: "load-start", key: e.key, kind: e.kind });
      let k = null;
      try {
        k = await M(
          "load",
          () => r.load(e.key),
          "adapter-load-failed",
          "Failed to load persistence document."
        );
      } catch (E) {
        const P = T("adapter-load-failed", "Failed to load persistence document.", E, e.key, e.kind);
        return s.value = P.code === "adapter-unavailable" ? "unavailable" : "error", p(P), d({ type: "load-error", key: e.key, kind: e.kind, error: P }), { ok: !1, found: !1, error: P, migrations: [], warnings: [] };
      }
      if (k == null)
        return y = D(e.kind, e.target.value), v.value = !1, s.value = "ready", d({ type: "load-empty", key: e.key, kind: e.kind }), { ok: !0, found: !1, value: D(e.kind, e.target.value), migrations: [], warnings: [] };
      const u = ae(k, {
        expectedKind: e.kind,
        currentVersion: F,
        migrations: e.migrations,
        validation: t,
        fallback: e.fallback
      });
      return u.ok ? (K(u.document, u.value), u.migrations.length > 0 && d({ type: "migration", key: e.key, kind: e.kind, migrations: u.migrations }), d({
        type: "load-success",
        key: e.key,
        kind: e.kind,
        document: u.document,
        value: u.value,
        migrations: u.migrations,
        warnings: u.warnings
      }), {
        ok: !0,
        found: !0,
        value: u.value,
        document: u.document,
        migrations: u.migrations,
        warnings: u.warnings
      }) : (u.fallback && ($(u.fallback), y = D(e.kind, u.fallback), v.value = !1), s.value = "error", p(u.error), d({
        type: "load-error",
        key: e.key,
        kind: e.kind,
        error: u.error,
        fallback: u.fallback
      }), {
        ok: !1,
        found: !0,
        value: u.fallback,
        error: u.error,
        fallbackApplied: !!u.fallback,
        migrations: u.migrations,
        warnings: u.warnings
      });
    },
    commit(k) {
      typeof k != "undefined" && $(k), b.value = null, s.value === "conflict" && (s.value = "ready"), ce(), q();
    },
    async save() {
      I(), s.value = "saving", g.value = null, d({ type: "save-start", key: e.key, kind: e.kind });
      let k;
      try {
        k = z(), await M(
          "save",
          () => r.save(e.key, k),
          "adapter-save-failed",
          "Failed to save persistence document."
        );
      } catch (u) {
        const E = T("adapter-save-failed", "Failed to save persistence document.", u, e.key, e.kind);
        return s.value = E.code === "adapter-unavailable" ? "unavailable" : "error", v.value = !0, p(E), d({ type: "save-error", key: e.key, kind: e.kind, error: E }), { ok: !1, error: E };
      }
      return y = D(e.kind, e.target.value), h.value = k.savedAt, v.value = !1, g.value = null, s.value = "ready", d({ type: "save-success", key: e.key, kind: e.kind, document: k }), { ok: !0, document: k };
    },
    discard() {
      I(), $(y), v.value = !1, b.value = null, g.value = null, s.value = "ready", d({ type: "discard", key: e.key, kind: e.kind, value: D(e.kind, e.target.value) });
    },
    reset(k) {
      I();
      const u = typeof k == "undefined" ? e.target.value : k;
      $(u), y = D(e.kind, e.target.value), v.value = !1, b.value = null, g.value = null, s.value = "ready", d({ type: "reset", key: e.key, kind: e.kind, value: D(e.kind, e.target.value) });
    },
    async remove() {
      I();
      try {
        await M(
          "remove",
          () => r.remove(e.key),
          "adapter-remove-failed",
          "Failed to remove persistence document."
        );
      } catch (k) {
        const u = T("adapter-remove-failed", "Failed to remove persistence document.", k, e.key, e.kind);
        throw s.value = u.code === "adapter-unavailable" ? "unavailable" : "error", p(u), u;
      }
      y = D(e.kind, e.target.value), v.value = !1, b.value = null, g.value = null, s.value = "ready", d({ type: "remove", key: e.key, kind: e.kind });
    },
    async resolveConflict(k) {
      const u = b.value;
      if (u) {
        if (k === "useRemote") {
          K(u.externalDocument, u.externalValue, "resolve-remote");
          return;
        }
        b.value = null, s.value = "ready", v.value = !0, await L.save();
      }
    },
    stop() {
      V = !0, I(), S && S(), f && f(), S = null, f = null;
    }
  };
  if (((te = e.watchTarget) == null || te) && (f = ye(
    e.target,
    () => {
      x || V || L.commit(void 0, { source: "watch" });
    },
    { deep: !0, flush: "sync" }
  )), r.subscribe)
    try {
      S = r.subscribe(e.key, (k) => {
        de(k);
      });
    } catch (k) {
      const u = T("adapter-subscribe-failed", "Failed to subscribe to persistence changes.", k, e.key, e.kind);
      p(u);
    }
  return L;
}
export {
  F as L,
  m as a,
  De as b,
  U as c,
  ae as d,
  Me as e,
  Oe as i,
  ze as l,
  Fe as m,
  Ne as r,
  Se as s,
  Le as u,
  _ as v
};
