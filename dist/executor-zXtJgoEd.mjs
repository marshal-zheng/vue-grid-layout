import { a as g, o as I, d as F, b as E } from "./utils-BCVYGne6.mjs";
import { e as x } from "./core-uHtYEsHm.mjs";
const T = (e, i) => ({
  id: e,
  status: "stale",
  layout: i,
  patches: [],
  affectedIds: [],
  collisions: [],
  diagnostics: {
    operationId: e,
    operationType: "validate",
    phase: "preview",
    layoutSize: i.length,
    affectedCount: 0,
    collisionCount: 0,
    indexHit: !1,
    durationMs: 0,
    stale: !0
  }
}), b = (e, i) => {
  var t;
  (t = e.onEvent) == null || t.call(e, i);
};
function H(e, i) {
  let t = g(e), r = null, s = 0, h = null, c = null;
  const n = {
    committed: t,
    preview: r,
    interaction: null,
    externalRevision: s
  }, u = () => (n.committed = t, n.preview = r, n.externalRevision = s, n), y = (o = "cancelled") => (n.interaction && b(i, {
    type: "interaction-cancelled",
    id: n.interaction.id,
    message: o,
    details: {
      itemId: n.interaction.itemId,
      interactionType: n.interaction.type
    }
  }), r = null, h = null, c = null, n.interaction = null, u(), g(t)), l = (o) => {
    if (n.interaction) return;
    const a = o.operation.type === "dropFit" ? o.operation.item.i || "__dropping-elem__" : o.operation.type === "groupMove" ? o.operation.activeId || o.operation.ids[0] || "__layout__" : "id" in o.operation ? o.operation.id : "__layout__";
    n.interaction = {
      id: o.id,
      type: o.operation.type === "resize" ? "resize" : o.operation.type === "dropFit" ? "drop" : "drag",
      itemId: a,
      startRevision: `external-${s}`,
      tickRevision: 0
    };
  }, p = (o, a, k) => ({
    ...o,
    phase: a,
    layout: k,
    options: i
  }), m = (o) => (l(o), n.interaction && n.interaction.tickRevision++, c = o.id, h = o, p(o, "preview", t)), f = (o) => (l(o), c = o.id, h = o, p(o, "commit", t)), d = (o) => {
    var a;
    return !c || o.id !== c ? (b(i, {
      type: "stale-result",
      id: o.id,
      message: "ignored stale async result",
      diagnostics: o.diagnostics
    }), T(o.id, t)) : (((a = o.diagnostics) == null ? void 0 : a.phase) === "commit" ? ((o.status === "changed" || o.status === "fallback") && (t = g(o.layout)), r = null, n.interaction = null, c = null, h = null) : r = o, u(), o);
  };
  return {
    getState: () => u(),
    getCommitted: () => g(t),
    setCommitted: (o, a = "external") => {
      if (t = g(o), s++, n.interaction) {
        const k = I(t, n.interaction.itemId);
        if (!k) {
          y(`${a}:active-item-missing`);
          return;
        }
        r != null && r.placeholder && (r.placeholder = {
          ...F(k),
          x: r.placeholder.x,
          y: r.placeholder.y,
          w: r.placeholder.w,
          h: r.placeholder.h
        });
      }
      u();
    },
    start: (o) => (n.interaction = {
      ...o,
      startRevision: `external-${s}`,
      tickRevision: 0
    }, r = null, c = null, h = null, u()),
    preparePreview: m,
    prepareCommit: f,
    preview: (o) => {
      const a = x(m(o));
      return c !== a.id ? (b(i, { type: "stale-result", id: a.id, message: "ignored stale preview" }), T(a.id, t)) : (r = a, u().preview);
    },
    commit: (o) => d(x(f(o))),
    applyAsyncResult: d,
    rebase: (o) => {
      if (t = g(o), s++, !n.interaction || !h)
        return r = null, u(), null;
      if (!I(t, n.interaction.itemId))
        return y("rebase:active-item-missing"), null;
      const a = x(p(h, "preview", t));
      return a.status === "blocked" || a.status === "error" ? (y(`rebase:${a.status}`), a) : (r = a, u(), a);
    },
    cancel: y,
    dispose: () => {
      y("dispose");
    }
  };
}
const z = {
  eagerMaxItems: 100,
  rafMaxItems: 1e3,
  workerMinItems: 1e3,
  densityThreshold: 0.6
}, M = () => typeof requestAnimationFrame == "function" && typeof cancelAnimationFrame == "function", S = (e) => !!(e && typeof e.then == "function"), _ = (e, i) => {
  var t, r;
  return {
    id: e.id,
    status: "cancelled",
    layout: e.layout,
    patches: [],
    affectedIds: [],
    collisions: [],
    diagnostics: {
      operationId: e.id,
      operationType: e.operation.type,
      phase: e.phase,
      layoutSize: e.layout.length,
      affectedCount: 0,
      collisionCount: 0,
      indexHit: !1,
      schedulerMode: ((t = e.options.scheduler) == null ? void 0 : t.mode) || "auto",
      executorKind: ((r = e.options.executor) == null ? void 0 : r.kind) || "main-thread",
      durationMs: 0,
      debug: void 0
    },
    error: { message: i }
  };
}, L = (e) => {
  var r;
  const i = e.operation.type === "move" || e.operation.type === "resize" ? I(e.layout, e.operation.id) : e.operation.type === "groupMove" ? I(
    e.layout,
    e.operation.activeId || e.operation.ids[0] || ""
  ) : null, t = i ? F(i) : void 0;
  return t && e.operation.type === "move" && (t.x = e.operation.x, t.y = e.operation.y), t && e.operation.type === "groupMove" && (t.x += Math.trunc(e.operation.dx), t.y += Math.trunc(e.operation.dy)), t && e.operation.type === "resize" && (t.w = e.operation.w, t.h = e.operation.h, typeof e.operation.x == "number" && (t.x = e.operation.x), typeof e.operation.y == "number" && (t.y = e.operation.y)), {
    id: e.id,
    status: "noop",
    layout: e.layout,
    patches: [],
    affectedIds: [],
    collisions: [],
    placeholder: t,
    diagnostics: {
      operationId: e.id,
      operationType: e.operation.type,
      phase: e.phase,
      layoutSize: e.layout.length,
      affectedCount: 0,
      collisionCount: 0,
      indexHit: !1,
      schedulerMode: "commitOnly",
      executorKind: ((r = e.options.executor) == null ? void 0 : r.kind) || "main-thread",
      durationMs: 0
    }
  };
}, O = (e) => {
  const i = Math.max(1, E(e.layout)), t = Math.max(1, e.options.cols);
  let r = 0;
  for (let s = 0; s < e.layout.length; s++)
    r += e.layout[s].w * e.layout[s].h;
  return r / (i * t);
};
function D(e = {}) {
  let i = null, t = null, r = null, s = 0;
  const h = (l, p, m, f) => {
    var d, o;
    (o = (d = l.options).onEvent) == null || o.call(d, {
      type: p,
      id: l.id,
      message: m,
      details: f
    });
  }, c = (l = "cancelled") => {
    i != null && M() && cancelAnimationFrame(i), i = null, t && r && h(r, "scheduler", l), t = null, r = null;
  }, n = (l) => {
    var o, a;
    const p = e.mode || ((o = l.options.scheduler) == null ? void 0 : o.mode) || "auto";
    if (p !== "auto") return p;
    if (l.phase === "commit") return "eager";
    const m = {
      ...z,
      ...e.auto,
      ...(a = l.options.scheduler) == null ? void 0 : a.auto
    }, f = l.layout.length, d = O(l);
    return f <= m.eagerMaxItems && s <= (e.maxTaskMs || 8) ? "eager" : l.operation.type === "dropFit" ? "raf" : l.heavy || f >= m.workerMinItems || d >= m.densityThreshold ? "commitOnly" : f <= m.rafMaxItems ? "raf" : "commitOnly";
  }, u = (l, p, m) => {
    const f = l.request, d = (a) => {
      var k;
      if (t && t.id !== l.id) {
        h(f, "stale-result", "dropped stale scheduled result");
        return;
      }
      s = ((k = a.diagnostics) == null ? void 0 : k.durationMs) || s, m(a);
    }, o = (a) => {
      m({
        ..._(f, "scheduler runner failed"),
        status: "error",
        error: {
          message: a instanceof Error ? a.message : String(a),
          cause: a
        }
      });
    };
    try {
      const a = p(f);
      S(a) ? a.then(d).catch(o) : d(a);
    } catch (a) {
      o(a);
    }
  };
  return {
    getMode: n,
    schedule: (l, p, m) => {
      const f = n(l), d = {
        id: l.id,
        request: l,
        cancel: () => {
          (t == null ? void 0 : t.id) === l.id && c("task cancelled");
        }
      };
      return t && t.id !== d.id && h(t.request, "scheduler", "coalesced by newer task", {
        nextId: d.id
      }), t = d, r = l, f === "commitOnly" && l.phase === "preview" ? (m(L(l)), d) : f === "eager" || l.phase === "commit" || (i != null && M() && (cancelAnimationFrame(i), h(l, "scheduler", "coalesced raf task")), !M()) ? (u(d, p, m), d) : (i = requestAnimationFrame(() => {
        i = null, t && u(t, p, m);
      }), d);
    },
    cancel: c,
    recordDuration: (l) => {
      s = l;
    }
  };
}
const C = (e, i) => {
  var t;
  return {
    id: e.id,
    status: "cancelled",
    layout: e.layout,
    patches: [],
    affectedIds: [],
    collisions: [],
    diagnostics: {
      operationId: e.id,
      operationType: e.operation.type,
      phase: e.phase,
      layoutSize: e.layout.length,
      affectedCount: 0,
      collisionCount: 0,
      indexHit: !1,
      schedulerMode: (t = e.options.scheduler) == null ? void 0 : t.mode,
      executorKind: "main-thread",
      durationMs: 0
    },
    error: { message: i }
  };
}, v = (e, i, t) => {
  var s, h;
  (h = (s = e.options).onEvent) == null || h.call(s, {
    type: "fallback",
    id: e.id,
    message: i,
    details: t
  });
  const r = x({
    ...e,
    options: {
      ...e.options,
      executor: void 0
    }
  });
  return {
    ...r,
    status: r.status === "error" ? "error" : "fallback",
    error: r.error || { message: i, cause: t },
    diagnostics: r.diagnostics ? { ...r.diagnostics, executorKind: "main-thread" } : r.diagnostics
  };
}, P = (e) => ({
  cols: e.cols,
  maxRows: e.maxRows,
  compactType: e.compactType,
  allowOverlap: e.allowOverlap,
  preventCollision: e.preventCollision,
  scheduler: e.scheduler,
  compareLegacy: !1,
  legacyFallback: e.legacyFallback,
  diagnostics: e.diagnostics
}), w = (e) => {
  if (!e) return e;
  const i = { ...e };
  return delete i.customRepairSolver, i;
}, A = (e) => {
  switch (e.type) {
    case "migrateSettings":
      return {
        ...e,
        policy: e.policy ? {
          ...e.policy,
          repair: w(e.policy.repair)
        } : e.policy
      };
    case "repairCollisions":
      return {
        ...e,
        policy: w(e.policy)
      };
    case "translateLayout":
      return {
        ...e,
        policy: w(e.policy)
      };
    case "placeItems":
      return {
        ...e,
        policy: w(e.policy),
        items: e.items.map((i) => ({
          ...i,
          repair: w(i.repair)
        }))
      };
    default:
      return e;
  }
}, K = (e) => ({
  ...e,
  operation: A(e.operation),
  options: P(e.options)
});
function R() {
  return {
    kind: "main-thread",
    available: () => !0,
    execute: (e, i) => i != null && i.aborted ? Promise.resolve(C(e, "layout task aborted before execution")) : Promise.resolve(x(e))
  };
}
function j(e) {
  return e && "execute" in e ? e : !e || e.kind === "main-thread" ? R() : e.kind === "custom" ? e.executor : e.kind === "worker" ? U({
    workerUrl: e.workerUrl,
    workerFactory: e.workerFactory,
    timeoutMs: e.timeoutMs
  }) : R();
}
function U(e = {}) {
  let i = null;
  const t = /* @__PURE__ */ new Map(), r = e.timeoutMs || 5e3, s = () => {
    if (i) return i;
    if (e.workerFactory)
      i = e.workerFactory();
    else if (e.workerUrl && typeof Worker != "undefined")
      i = new Worker(e.workerUrl);
    else
      return null;
    return i.onmessage = (c) => {
      const n = c.data;
      if (!n || !n.id) return;
      const u = t.get(n.id);
      u && (t.delete(n.id), u.timeoutId && clearTimeout(u.timeoutId), n.result ? u.resolve({
        ...n.result,
        diagnostics: n.result.diagnostics ? { ...n.result.diagnostics, executorKind: "worker" } : n.result.diagnostics
      }) : u.reject(n.error || new Error("worker returned no result")));
    }, i.onerror = (c) => {
      t.forEach((n) => {
        n.timeoutId && clearTimeout(n.timeoutId), n.reject(c);
      }), t.clear();
    }, i;
  };
  return {
    kind: "worker",
    available: () => !!(e.workerFactory || e.workerUrl && typeof Worker != "undefined"),
    execute: (c, n) => {
      if (n != null && n.aborted)
        return Promise.resolve(C(c, "layout task aborted before worker execution"));
      const u = s();
      return u ? new Promise((y, l) => {
        var f, d, o;
        const p = setTimeout(() => {
          var a, k;
          t.delete(c.id), (k = (a = c.options).onEvent) == null || k.call(a, {
            type: "timeout",
            id: c.id,
            message: `worker task exceeded ${r}ms`
          }), y(v(c, "worker task timed out"));
        }, r), m = () => {
          t.delete(c.id), clearTimeout(p), y(C(c, "layout task aborted"));
        };
        (f = n == null ? void 0 : n.addEventListener) == null || f.call(n, "abort", m, { once: !0 }), t.set(c.id, { resolve: y, reject: l, timeoutId: p });
        try {
          u.postMessage({
            type: "layout-engine-request",
            id: c.id,
            request: K(c)
          });
        } catch (a) {
          t.delete(c.id), clearTimeout(p), (o = (d = c.options).onEvent) == null || o.call(d, {
            type: "worker-error",
            id: c.id,
            message: "worker postMessage failed",
            details: a
          }), y(v(c, "worker postMessage failed", a));
        }
      }).catch((y) => {
        var l, p;
        return (p = (l = c.options).onEvent) == null || p.call(l, {
          type: "worker-error",
          id: c.id,
          message: y instanceof Error ? y.message : String(y),
          details: y
        }), v(c, "worker execution failed", y);
      }) : Promise.resolve(
        v(c, "worker unavailable; falling back to main thread")
      );
    },
    dispose: () => {
      t.forEach((c) => {
        c.timeoutId && clearTimeout(c.timeoutId);
      }), t.clear(), i == null || i.terminate(), i = null;
    }
  };
}
export {
  D as a,
  j as b,
  H as c,
  R as m,
  U as w
};
