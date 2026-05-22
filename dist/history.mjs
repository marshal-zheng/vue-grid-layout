import { defineStore as K } from "pinia";
import { markRaw as k } from "vue";
import { deepEqual as E } from "fast-equals";
import { a as g } from "./utils-BCVYGne6.mjs";
const d = 100, v = (t, e) => !t && !e ? !0 : !t || !e ? !1 : E(t, e), c = (t, e) => t ? k(e(t)) : null, y = (t, e) => t ? e(t) : null, M = (t = {}) => {
  const {
    id: e = "gridHistory",
    pinia: s,
    maxSize: u = d,
    clone: i = g,
    equals: a = v
  } = t, o = Math.max(1, Math.floor(u || d));
  return K(e, {
    state: () => ({
      past: [],
      present: null,
      future: [],
      maxSize: o
    }),
    getters: {
      canUndo: (r) => r.past.length > 0,
      canRedo: (r) => r.future.length > 0
    },
    actions: {
      push(r) {
        const n = c(r, i);
        if (!n || a(this.present, n)) return;
        this.present && this.past.push(this.present), this.present = n, this.future = [];
        const h = this.past.length - this.maxSize;
        h > 0 && this.past.splice(0, h);
      },
      replacePresent(r) {
        const n = c(r, i);
        a(this.present, n) || (this.present = n, this.future = []);
      },
      undo() {
        if (!this.past.length) return null;
        const r = this.past[this.past.length - 1];
        return this.present && this.future.unshift(this.present), this.present = r, this.past = this.past.slice(0, -1), y(this.present, i);
      },
      redo() {
        if (!this.future.length) return null;
        const r = this.future[0];
        this.present && this.past.push(this.present), this.present = r, this.future = this.future.slice(1);
        const n = this.past.length - this.maxSize;
        return n > 0 && this.past.splice(0, n), y(this.present, i);
      },
      clear(r) {
        this.past = [], this.future = [], this.present = r ? c(r, i) : null;
      }
    }
  })(s);
}, P = (t) => M(t), m = typeof navigator != "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform), x = (t) => {
  const e = t.target;
  if (!e) return !0;
  const s = e.tagName;
  return !(s === "INPUT" || s === "TEXTAREA" || s === "SELECT" || e.isContentEditable);
}, w = (t, e) => {
  const s = t.key.toLowerCase() === e.key.toLowerCase(), u = e.ctrl === void 0 ? !0 : t.ctrlKey === e.ctrl, i = e.meta === void 0 ? !0 : t.metaKey === e.meta, a = e.shift === void 0 ? !t.shiftKey : t.shiftKey === e.shift, o = e.alt === void 0 ? !t.altKey : t.altKey === e.alt;
  return s && u && i && a && o;
}, q = (t, e = {}) => {
  const {
    target: s = typeof window != "undefined" ? window : null,
    undoKeys: u = m ? { key: "z", meta: !0, ctrl: !1, shift: !1 } : { key: "z", ctrl: !0, meta: !1, shift: !1 },
    redoKeys: i = m ? [{ key: "z", meta: !0, ctrl: !1, shift: !0 }] : [
      { key: "y", ctrl: !0, meta: !1, shift: !1 },
      { key: "z", ctrl: !0, meta: !1, shift: !0 }
    ],
    onUndo: a,
    onRedo: o,
    filter: p = x
  } = e;
  if (!s) return () => {
  };
  const r = typeof s == "string" ? document.querySelector(s) || window : s, n = (h) => {
    const l = h;
    if (p(l)) {
      if (w(l, u)) {
        l.preventDefault();
        const f = t.undo();
        a == null || a(f);
        return;
      }
      for (const f of i)
        if (w(l, f)) {
          l.preventDefault();
          const S = t.redo();
          o == null || o(S);
          return;
        }
    }
  };
  return r.addEventListener("keydown", n), () => {
    r.removeEventListener("keydown", n);
  };
};
export {
  q as bindKeyboardShortcuts,
  M as createGridHistoryStore,
  P as useGridHistoryStore
};
