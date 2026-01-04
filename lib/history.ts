import { defineStore, type Pinia, type Store } from 'pinia'
import { markRaw } from 'vue'
import { deepEqual } from 'fast-equals'
import { cloneLayout, type Layout } from './utils'

export type GridHistorySnapshot = Layout

export type GridHistoryState = {
  past: Layout[]
  present: Layout | null
  future: Layout[]
  maxSize: number
}

export type GridHistoryGetters = {
  canUndo(state: GridHistoryState): boolean
  canRedo(state: GridHistoryState): boolean
}

export type GridHistoryActions = {
  push: (layout: Layout) => void
  replacePresent: (layout: Layout | null) => void
  undo: () => Layout | null
  redo: () => Layout | null
  clear: (snapshot?: Layout | null) => void
}

export type GridHistoryStore = Store<string, GridHistoryState, GridHistoryGetters, GridHistoryActions>

export type GridHistoryOptions = {
  id?: string
  pinia?: Pinia
  maxSize?: number
  clone?: (layout: Layout) => Layout
  equals?: (a: Layout | null, b: Layout | null) => boolean
}

export type KeyboardShortcutOptions = {
  /** Target element or selector to listen on. Defaults to window. */
  target?: HTMLElement | Window | string
  /** Custom undo key combination. Defaults to Ctrl+Z (Win) / Cmd+Z (Mac) */
  undoKeys?: {
    key: string
    ctrl?: boolean
    meta?: boolean
    shift?: boolean
    alt?: boolean
  }
  /** Custom redo key combination. Defaults to Ctrl+Y or Ctrl+Shift+Z (Win) / Cmd+Shift+Z (Mac) */
  redoKeys?: {
    key: string
    ctrl?: boolean
    meta?: boolean
    shift?: boolean
    alt?: boolean
  }[]
  /** Callback when undo is triggered */
  onUndo?: (layout: Layout | null) => void
  /** Callback when redo is triggered */
  onRedo?: (layout: Layout | null) => void
  /** Filter function to determine if shortcuts should be active. Return false to skip. */
  filter?: (event: KeyboardEvent) => boolean
}

const DEFAULT_MAX_SIZE = 100

const defaultEquals = (a: Layout | null, b: Layout | null) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return deepEqual(a, b)
}

const toSnapshot = (layout: Layout | null, clone: (layout: Layout) => Layout): Layout | null => {
  if (!layout) return null
  return markRaw(clone(layout))
}

const toOutput = (snapshot: Layout | null, clone: (layout: Layout) => Layout): Layout | null => {
  if (!snapshot) return null
  return clone(snapshot)
}

export const createGridHistoryStore = (options: GridHistoryOptions = {}): GridHistoryStore => {
  const {
    id = 'gridHistory',
    pinia,
    maxSize = DEFAULT_MAX_SIZE,
    clone = cloneLayout,
    equals = defaultEquals
  } = options

  const limit = Math.max(1, Math.floor(maxSize || DEFAULT_MAX_SIZE))
  const useHistoryStore = defineStore<string, GridHistoryState, GridHistoryGetters, GridHistoryActions>(id, {
    state: (): GridHistoryState => ({
      past: [],
      present: null,
      future: [],
      maxSize: limit
    }),
    getters: {
      canUndo: state => state.past.length > 0,
      canRedo: state => state.future.length > 0
    },
    actions: {
      push(layout: Layout) {
        const next = toSnapshot(layout, clone)
        if (!next) return
        if (equals(this.present, next)) return

        if (this.present) this.past.push(this.present)
        this.present = next
        this.future = []

        const overflow = this.past.length - this.maxSize
        if (overflow > 0) this.past.splice(0, overflow)
      },
      replacePresent(layout: Layout | null) {
        const next = toSnapshot(layout, clone)
        if (equals(this.present, next)) return
        this.present = next
        // Any external update that changes present should invalidate redo history.
        this.future = []
      },
      undo(): Layout | null {
        if (!this.past.length) return null
        const prev = this.past[this.past.length - 1]
        if (this.present) this.future.unshift(this.present)
        this.present = prev
        this.past = this.past.slice(0, -1)
        return toOutput(this.present, clone)
      },
      redo(): Layout | null {
        if (!this.future.length) return null
        const next = this.future[0]
        if (this.present) this.past.push(this.present)
        this.present = next
        this.future = this.future.slice(1)
        const overflow = this.past.length - this.maxSize
        if (overflow > 0) this.past.splice(0, overflow)
        return toOutput(this.present, clone)
      },
      clear(snapshot?: Layout | null) {
        this.past = []
        this.future = []
        this.present = snapshot ? toSnapshot(snapshot, clone) : null
      }
    }
  })

  return useHistoryStore(pinia)
}

export const useGridHistoryStore = (options?: GridHistoryOptions) => createGridHistoryStore(options)

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

const defaultFilter = (event: KeyboardEvent): boolean => {
  const target = event.target as HTMLElement | null
  if (!target) return true
  const tagName = target.tagName
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return false
  if (target.isContentEditable) return false
  return true
}

const matchKey = (
  event: KeyboardEvent,
  config: { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }
): boolean => {
  const keyMatch = event.key.toLowerCase() === config.key.toLowerCase()
  const ctrlMatch = config.ctrl === undefined ? true : event.ctrlKey === config.ctrl
  const metaMatch = config.meta === undefined ? true : event.metaKey === config.meta
  const shiftMatch = config.shift === undefined ? !event.shiftKey : event.shiftKey === config.shift
  const altMatch = config.alt === undefined ? !event.altKey : event.altKey === config.alt
  return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch
}

/**
 * Bind keyboard shortcuts for undo/redo operations.
 * 
 * @param store - The history store to bind shortcuts to
 * @param options - Configuration options for keyboard shortcuts
 * @returns A cleanup function to unbind the shortcuts
 * 
 * @example
 * ```ts
 * const store = createGridHistoryStore()
 * const unbind = bindKeyboardShortcuts(store, {
 *   onUndo: (layout) => { gridLayout.value = layout },
 *   onRedo: (layout) => { gridLayout.value = layout }
 * })
 * // Later, to cleanup:
 * unbind()
 * ```
 */
export const bindKeyboardShortcuts = (
  store: GridHistoryStore,
  options: KeyboardShortcutOptions = {}
): (() => void) => {
  const {
    target = typeof window !== 'undefined' ? window : null,
    undoKeys = isMac
      ? { key: 'z', meta: true, ctrl: false, shift: false }
      : { key: 'z', ctrl: true, meta: false, shift: false },
    redoKeys = isMac
      ? [{ key: 'z', meta: true, ctrl: false, shift: true }]
      : [
          { key: 'y', ctrl: true, meta: false, shift: false },
          { key: 'z', ctrl: true, meta: false, shift: true }
        ],
    onUndo,
    onRedo,
    filter = defaultFilter
  } = options

  if (!target) return () => {}

  const resolvedTarget: HTMLElement | Window =
    typeof target === 'string'
      ? (document.querySelector(target) as HTMLElement) || window
      : target

  const handleKeydown = (e: Event) => {
    const event = e as KeyboardEvent
    if (!filter(event)) return

    // Check undo
    if (matchKey(event, undoKeys)) {
      event.preventDefault()
      const layout = store.undo()
      onUndo?.(layout)
      return
    }

    // Check redo (support multiple key combinations)
    for (const redoKey of redoKeys) {
      if (matchKey(event, redoKey)) {
        event.preventDefault()
        const layout = store.redo()
        onRedo?.(layout)
        return
      }
    }
  }

  resolvedTarget.addEventListener('keydown', handleKeydown)

  return () => {
    resolvedTarget.removeEventListener('keydown', handleKeydown)
  }
}
