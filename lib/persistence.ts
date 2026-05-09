import { ref, shallowRef, watch, type Ref, type WatchStopHandle } from 'vue'
import { deepEqual } from 'fast-equals'
import { cloneLayout, type Layout, type LayoutItem, type ResizeHandleAxis } from './utils'

export const LAYOUT_SCHEMA_VERSION = 1

export type LayoutPersistenceKind = 'layout' | 'responsive'
export type LayoutPersistenceMeta = Record<string, unknown>
export type LayoutsMap = Record<string, Layout>
export type MaybePromise<T> = T | Promise<T>
export type LayoutValidationMode = 'strict' | 'sanitize'
export type LayoutConflictStrategy = 'manual' | 'newer-wins' | 'keep-local'
export type LayoutPersistenceStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'saving'
  | 'error'
  | 'unavailable'
  | 'conflict'

export type LayoutPersistenceDocument =
  | {
      layoutSchemaVersion: number
      kind: 'layout'
      key: string
      revision: string
      sourceId: string
      savedAt: string
      data: { layout: Layout }
      meta?: LayoutPersistenceMeta
    }
  | {
      layoutSchemaVersion: number
      kind: 'responsive'
      key: string
      revision: string
      sourceId: string
      savedAt: string
      data: { layouts: LayoutsMap }
      meta?: LayoutPersistenceMeta
    }

export type SerializeLayoutOptions = {
  key: string
  kind: LayoutPersistenceKind
  sourceId?: string
  meta?: LayoutPersistenceMeta
  now?: () => Date
  revision?: () => string
}

export type LayoutMigration = (
  document: unknown,
  context: { fromVersion: number; toVersion: number }
) => unknown

export type LayoutMigrationMap = Record<number, LayoutMigration>

export type LayoutMigrationEvent = {
  fromVersion: number
  toVersion: number
}

export type LayoutPersistenceErrorCode =
  | 'invalid-json'
  | 'invalid-document'
  | 'kind-mismatch'
  | 'validation'
  | 'migration-missing'
  | 'migration-failed'
  | 'adapter-unavailable'
  | 'adapter-load-failed'
  | 'adapter-save-failed'
  | 'adapter-remove-failed'
  | 'adapter-subscribe-failed'
  | 'adapter-timeout'

export type LayoutPersistenceError = {
  code: LayoutPersistenceErrorCode
  message: string
  key?: string
  kind?: LayoutPersistenceKind
  path?: string
  recoverable?: boolean
  details?: unknown
  cause?: unknown
  originalPayload?: unknown
}

export type LayoutPersistenceWarning = {
  code: string
  message: string
  path?: string
  details?: unknown
}

export type DeserializeLayoutOptions<T = Layout | LayoutsMap> = {
  expectedKind?: LayoutPersistenceKind
  currentVersion?: number
  migrations?: LayoutMigrationMap
  validation?: LayoutValidationMode
  fallback?: T
}

export type LayoutDeserializeResult<T = Layout | LayoutsMap> =
  | {
      ok: true
      document: LayoutPersistenceDocument
      value: T
      migrations: LayoutMigrationEvent[]
      warnings: LayoutPersistenceWarning[]
      fallback?: never
      error?: never
    }
  | {
      ok: false
      error: LayoutPersistenceError
      fallback?: T
      originalPayload: unknown
      migrations: LayoutMigrationEvent[]
      warnings: LayoutPersistenceWarning[]
      document?: never
      value?: never
    }

export type LayoutMigrationResult =
  | {
      ok: true
      document: LayoutPersistenceDocument
      migrations: LayoutMigrationEvent[]
      originalPayload: unknown
      warnings: LayoutPersistenceWarning[]
      error?: never
    }
  | {
      ok: false
      error: LayoutPersistenceError
      originalPayload: unknown
      migrations: LayoutMigrationEvent[]
      warnings: LayoutPersistenceWarning[]
      document?: never
    }

export type LayoutValidationResult<T = Layout | LayoutsMap> =
  | {
      ok: true
      document: LayoutPersistenceDocument
      value: T
      warnings: LayoutPersistenceWarning[]
      error?: never
    }
  | {
      ok: false
      error: LayoutPersistenceError
      warnings: LayoutPersistenceWarning[]
      document?: never
      value?: never
    }

export type LayoutPersistenceExternalChange = {
  key: string
  source: 'storage' | 'adapter'
  raw?: unknown
  oldRaw?: unknown
  document?: unknown
  sourceId?: string
}

export type LayoutPersistenceAdapter = {
  load: (key: string) => MaybePromise<unknown>
  save: (key: string, document: LayoutPersistenceDocument) => MaybePromise<void>
  remove: (key: string) => MaybePromise<void>
  subscribe?: (
    key: string,
    callback: (event: LayoutPersistenceExternalChange) => void
  ) => () => void
}

export type WebStorageAdapterOptions = {
  storage?: Storage
  prefix?: string
  sourceId?: string
}

export type IndexedDBAdapterOptions = {
  indexedDB?: IDBFactory
  dbName?: string
  storeName?: string
  version?: number
  prefix?: string
  timeoutMs?: number
  broadcast?: boolean
  broadcastChannel?: typeof BroadcastChannel
  channelName?: string
  sourceId?: string
}

export type RemoteHttpAdapterOptions = {
  endpoint: string | ((key: string) => string)
  fetch?: typeof fetch
  headers?: HeadersInit | (() => HeadersInit)
  credentials?: RequestCredentials
  timeoutMs?: number
  loadMethod?: string
  saveMethod?: string
  removeMethod?: string
  parse?: (response: Response) => MaybePromise<unknown>
  serialize?: (document: LayoutPersistenceDocument) => BodyInit
}

export type LayoutPersistenceCommitContext = {
  source?: 'watch' | 'component' | 'programmatic' | 'external'
  reason?: string
}

export type LayoutPersistenceLoadResult<T> = {
  ok: boolean
  found: boolean
  value?: T
  document?: LayoutPersistenceDocument
  error?: LayoutPersistenceError
  fallbackApplied?: boolean
  migrations: LayoutMigrationEvent[]
  warnings: LayoutPersistenceWarning[]
}

export type LayoutPersistenceSaveResult = {
  ok: boolean
  document?: LayoutPersistenceDocument
  error?: LayoutPersistenceError
}

export type LayoutPersistenceConflict<T> = {
  key: string
  reason: 'dirty-external-change'
  localValue: T
  externalValue: T
  localDocument: LayoutPersistenceDocument
  externalDocument: LayoutPersistenceDocument
  resolve: (action: 'useLocal' | 'useRemote') => Promise<void>
}

export type LayoutPersistenceEvent<T = Layout | LayoutsMap> =
  | { type: 'load-start'; key: string; kind: LayoutPersistenceKind }
  | {
      type: 'load-success'
      key: string
      kind: LayoutPersistenceKind
      document: LayoutPersistenceDocument
      value: T
      migrations: LayoutMigrationEvent[]
      warnings: LayoutPersistenceWarning[]
    }
  | {
      type: 'load-empty'
      key: string
      kind: LayoutPersistenceKind
    }
  | {
      type: 'load-error'
      key: string
      kind: LayoutPersistenceKind
      error: LayoutPersistenceError
      fallback?: T
    }
  | { type: 'save-start'; key: string; kind: LayoutPersistenceKind }
  | {
      type: 'save-success'
      key: string
      kind: LayoutPersistenceKind
      document: LayoutPersistenceDocument
    }
  | {
      type: 'save-error'
      key: string
      kind: LayoutPersistenceKind
      error: LayoutPersistenceError
    }
  | { type: 'discard'; key: string; kind: LayoutPersistenceKind; value: T }
  | { type: 'reset'; key: string; kind: LayoutPersistenceKind; value: T }
  | { type: 'remove'; key: string; kind: LayoutPersistenceKind }
  | {
      type: 'migration'
      key: string
      kind: LayoutPersistenceKind
      migrations: LayoutMigrationEvent[]
    }
  | {
      type: 'conflict'
      key: string
      kind: LayoutPersistenceKind
      conflict: LayoutPersistenceConflict<T>
    }
  | {
      type: 'external-apply'
      key: string
      kind: LayoutPersistenceKind
      document: LayoutPersistenceDocument
      value: T
      reason: 'clean-external-change' | 'newer-wins' | 'resolve-remote'
    }
  | {
      type: 'error'
      key: string
      kind: LayoutPersistenceKind
      error: LayoutPersistenceError
    }

export type UseGridLayoutPersistenceOptions<T> = {
  key: string
  kind: LayoutPersistenceKind
  target: Ref<T>
  adapter?: LayoutPersistenceAdapter
  autoSave?: boolean
  debounceMs?: number
  validation?: LayoutValidationMode
  migrations?: LayoutMigrationMap
  fallback?: T
  conflictStrategy?: LayoutConflictStrategy
  meta?: LayoutPersistenceMeta | (() => LayoutPersistenceMeta)
  onEvent?: (event: LayoutPersistenceEvent<T>) => void
  onError?: (error: LayoutPersistenceError) => void
  watchTarget?: boolean
  sourceId?: string
  timeoutMs?: number
}

export type GridLayoutPersistenceController<T> = {
  status: Ref<LayoutPersistenceStatus>
  dirty: Ref<boolean>
  error: Ref<LayoutPersistenceError | null>
  lastSavedAt: Ref<string | null>
  conflict: Ref<LayoutPersistenceConflict<T> | null>
  load: () => Promise<LayoutPersistenceLoadResult<T>>
  commit: (nextValue?: T, context?: LayoutPersistenceCommitContext) => void
  save: () => Promise<LayoutPersistenceSaveResult>
  discard: () => void
  reset: (nextValue?: T) => void
  remove: () => Promise<void>
  resolveConflict: (action: 'useLocal' | 'useRemote') => Promise<void>
  stop: () => void
}

export type GridLayoutPersistenceProp =
  | false
  | Omit<UseGridLayoutPersistenceOptions<Layout>, 'target' | 'kind'>

export type ResponsiveGridLayoutPersistenceProp =
  | false
  | Omit<UseGridLayoutPersistenceOptions<LayoutsMap>, 'target' | 'kind'>

type NormalizeLayoutResult =
  | { ok: true; layout: Layout; warnings: LayoutPersistenceWarning[] }
  | { ok: false; error: LayoutPersistenceError; warnings: LayoutPersistenceWarning[] }

type NormalizeLayoutsResult =
  | { ok: true; layouts: LayoutsMap; warnings: LayoutPersistenceWarning[] }
  | { ok: false; error: LayoutPersistenceError; warnings: LayoutPersistenceWarning[] }

const VALID_RESIZE_HANDLES: ResizeHandleAxis[] = ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']

export const createPersistenceError = (
  code: LayoutPersistenceErrorCode,
  message: string,
  extra: Partial<LayoutPersistenceError> = {}
): LayoutPersistenceError => ({
  code,
  message,
  ...extra
})

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isValidDateString = (value: string): boolean => {
  const time = Date.parse(value)
  return Number.isFinite(time)
}

const isResizeHandleAxis = (value: unknown): value is ResizeHandleAxis =>
  typeof value === 'string' && VALID_RESIZE_HANDLES.indexOf(value as ResizeHandleAxis) !== -1

const warning = (
  code: string,
  message: string,
  path?: string,
  details?: unknown
): LayoutPersistenceWarning => ({
  code,
  message,
  path,
  details
})

const cloneJsonSafeValue = (
  value: unknown,
  seen: unknown[] = []
): unknown => {
  if (value == null) return value
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
    return undefined
  }
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) {
    if (seen.indexOf(value) !== -1) return undefined
    const nextSeen = seen.concat(value)
    return value.map(item => {
      const cloned = cloneJsonSafeValue(item, nextSeen)
      return typeof cloned === 'undefined' ? null : cloned
    })
  }
  if (typeof value === 'object') {
    if (seen.indexOf(value) !== -1) return undefined
    const nextSeen = seen.concat(value)
    const out: Record<string, unknown> = {}
    Object.keys(value as Record<string, unknown>).forEach(key => {
      const cloned = cloneJsonSafeValue((value as Record<string, unknown>)[key], nextSeen)
      if (typeof cloned !== 'undefined') out[key] = cloned
    })
    return out
  }
  return undefined
}

const cloneMeta = (meta?: LayoutPersistenceMeta): LayoutPersistenceMeta | undefined => {
  if (!meta) return undefined
  const cloned = cloneJsonSafeValue(meta)
  return isObjectRecord(cloned) ? cloned : undefined
}

const cloneAdapterValue = (value: unknown): unknown => {
  if (value == null) return null
  const json = JSON.stringify(value)
  return typeof json === 'undefined' ? null : JSON.parse(json)
}

export const cloneLayoutsMap = (layouts: LayoutsMap): LayoutsMap => {
  const out: LayoutsMap = {}
  Object.keys(layouts).forEach(key => {
    out[key] = cloneLayout(layouts[key])
  })
  return out
}

const clonePersistenceValue = <T>(kind: LayoutPersistenceKind, value: T): T => {
  if (kind === 'layout') return cloneLayout(value as Layout) as T
  return cloneLayoutsMap(value as LayoutsMap) as T
}

const createSourceId = (): string => {
  const cryptoLike = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (cryptoLike && typeof cryptoLike.randomUUID === 'function') {
    return cryptoLike.randomUUID()
  }
  return `vgl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const createRevision = (): string =>
  `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

const normalizeOptionalNumber = (
  raw: Record<string, unknown>,
  key: keyof Pick<LayoutItem, 'minW' | 'minH' | 'maxW' | 'maxH'>,
  item: LayoutItem,
  mode: LayoutValidationMode,
  path: string,
  warnings: LayoutPersistenceWarning[]
): LayoutPersistenceError | null => {
  const value = raw[key]
  if (typeof value === 'undefined') return null
  if (!isFiniteNumber(value) || value <= 0) {
    if (mode === 'sanitize') {
      warnings.push(warning('item-field-dropped', `Dropped invalid ${String(key)}.`, `${path}.${String(key)}`))
      return null
    }
    return createPersistenceError('validation', `${path}.${String(key)} must be a finite positive number.`, {
      path: `${path}.${String(key)}`
    })
  }
  item[key] = value
  return null
}

const normalizeOptionalBoolean = (
  raw: Record<string, unknown>,
  key: keyof Pick<LayoutItem, 'moved' | 'static' | 'isDraggable' | 'isResizable' | 'isBounded'>,
  item: LayoutItem,
  mode: LayoutValidationMode,
  path: string,
  warnings: LayoutPersistenceWarning[]
): LayoutPersistenceError | null => {
  const value = raw[key]
  if (typeof value === 'undefined') return null
  if (typeof value !== 'boolean') {
    if (mode === 'sanitize') {
      warnings.push(warning('item-field-dropped', `Dropped invalid ${String(key)}.`, `${path}.${String(key)}`))
      return null
    }
    return createPersistenceError('validation', `${path}.${String(key)} must be a boolean.`, {
      path: `${path}.${String(key)}`
    })
  }
  item[key] = value
  return null
}

const normalizeLayout = (
  value: unknown,
  mode: LayoutValidationMode,
  path: string
): NormalizeLayoutResult => {
  const warnings: LayoutPersistenceWarning[] = []
  if (!Array.isArray(value)) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('validation', `${path} must be an array.`, { path })
    }
  }

  const ids: Record<string, true> = {}
  const layout: Layout = []

  for (let index = 0; index < value.length; index++) {
    const itemPath = `${path}[${index}]`
    const raw = value[index]
    if (!isObjectRecord(raw)) {
      if (mode === 'sanitize') {
        warnings.push(warning('item-dropped', 'Dropped non-object layout item.', itemPath))
        continue
      }
      return {
        ok: false,
        warnings,
        error: createPersistenceError('validation', `${itemPath} must be an object.`, { path: itemPath })
      }
    }

    const id = raw.i
    if (typeof id !== 'string' || id.trim() === '') {
      if (mode === 'sanitize') {
        warnings.push(warning('item-dropped', 'Dropped layout item with invalid id.', `${itemPath}.i`))
        continue
      }
      return {
        ok: false,
        warnings,
        error: createPersistenceError('validation', `${itemPath}.i must be a non-empty string.`, {
          path: `${itemPath}.i`
        })
      }
    }
    if (ids[id]) {
      return {
        ok: false,
        warnings,
        error: createPersistenceError('validation', `Layout item id "${id}" is duplicated.`, {
          path: `${itemPath}.i`
        })
      }
    }

    const x = raw.x
    const y = raw.y
    const w = raw.w
    const h = raw.h
    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(w) || !isFiniteNumber(h)) {
      if (mode === 'sanitize') {
        warnings.push(warning('item-dropped', 'Dropped layout item with non-numeric position or size.', itemPath))
        continue
      }
      return {
        ok: false,
        warnings,
        error: createPersistenceError('validation', `${itemPath} position and size fields must be finite numbers.`, {
          path: itemPath
        })
      }
    }

    let nextX = x
    let nextY = y
    let nextW = w
    let nextH = h
    if (nextX < 0 || nextY < 0) {
      if (mode !== 'sanitize') {
        return {
          ok: false,
          warnings,
          error: createPersistenceError('validation', `${itemPath} must not have negative x or y.`, {
            path: itemPath
          })
        }
      }
      warnings.push(warning('item-clamped', 'Clamped negative x/y to zero.', itemPath))
      nextX = Math.max(0, nextX)
      nextY = Math.max(0, nextY)
    }
    if (nextW <= 0 || nextH <= 0) {
      if (mode !== 'sanitize') {
        return {
          ok: false,
          warnings,
          error: createPersistenceError('validation', `${itemPath} must have positive w and h.`, { path: itemPath })
        }
      }
      warnings.push(warning('item-clamped', 'Clamped non-positive w/h to one.', itemPath))
      nextW = Math.max(1, nextW)
      nextH = Math.max(1, nextH)
    }

    const item: LayoutItem = {
      i: id,
      x: nextX,
      y: nextY,
      w: nextW,
      h: nextH
    }

    for (const key of ['minW', 'minH', 'maxW', 'maxH'] as const) {
      const error = normalizeOptionalNumber(raw, key, item, mode, itemPath, warnings)
      if (error) return { ok: false, warnings, error }
    }

    if (typeof item.minW === 'number' && item.w < item.minW) {
      if (mode !== 'sanitize') {
        return {
          ok: false,
          warnings,
          error: createPersistenceError('validation', `${itemPath}.w conflicts with minW.`, {
            path: `${itemPath}.w`
          })
        }
      }
      warnings.push(warning('item-clamped', 'Raised w to satisfy minW.', `${itemPath}.w`))
      item.w = item.minW
    }
    if (typeof item.minH === 'number' && item.h < item.minH) {
      if (mode !== 'sanitize') {
        return {
          ok: false,
          warnings,
          error: createPersistenceError('validation', `${itemPath}.h conflicts with minH.`, {
            path: `${itemPath}.h`
          })
        }
      }
      warnings.push(warning('item-clamped', 'Raised h to satisfy minH.', `${itemPath}.h`))
      item.h = item.minH
    }
    if (typeof item.maxW === 'number' && item.w > item.maxW) {
      if (mode !== 'sanitize') {
        return {
          ok: false,
          warnings,
          error: createPersistenceError('validation', `${itemPath}.w conflicts with maxW.`, {
            path: `${itemPath}.w`
          })
        }
      }
      warnings.push(warning('item-clamped', 'Lowered w to satisfy maxW.', `${itemPath}.w`))
      item.w = item.maxW
    }
    if (typeof item.maxH === 'number' && item.h > item.maxH) {
      if (mode !== 'sanitize') {
        return {
          ok: false,
          warnings,
          error: createPersistenceError('validation', `${itemPath}.h conflicts with maxH.`, {
            path: `${itemPath}.h`
          })
        }
      }
      warnings.push(warning('item-clamped', 'Lowered h to satisfy maxH.', `${itemPath}.h`))
      item.h = item.maxH
    }
    if (
      (typeof item.minW === 'number' && typeof item.maxW === 'number' && item.minW > item.maxW) ||
      (typeof item.minH === 'number' && typeof item.maxH === 'number' && item.minH > item.maxH)
    ) {
      return {
        ok: false,
        warnings,
        error: createPersistenceError('validation', `${itemPath} has conflicting min/max constraints.`, {
          path: itemPath
        })
      }
    }

    for (const key of ['moved', 'static', 'isDraggable', 'isResizable', 'isBounded'] as const) {
      const error = normalizeOptionalBoolean(raw, key, item, mode, itemPath, warnings)
      if (error) return { ok: false, warnings, error }
    }

    if (typeof raw.resizeHandles !== 'undefined') {
      if (!Array.isArray(raw.resizeHandles)) {
        if (mode !== 'sanitize') {
          return {
            ok: false,
            warnings,
            error: createPersistenceError('validation', `${itemPath}.resizeHandles must be an array.`, {
              path: `${itemPath}.resizeHandles`
            })
          }
        }
        warnings.push(warning('item-field-dropped', 'Dropped invalid resizeHandles.', `${itemPath}.resizeHandles`))
      } else {
        const handles = raw.resizeHandles.filter(isResizeHandleAxis)
        if (handles.length !== raw.resizeHandles.length && mode !== 'sanitize') {
          return {
            ok: false,
            warnings,
            error: createPersistenceError('validation', `${itemPath}.resizeHandles contains an invalid handle.`, {
              path: `${itemPath}.resizeHandles`
            })
          }
        }
        if (handles.length > 0) item.resizeHandles = handles
        if (handles.length !== raw.resizeHandles.length) {
          warnings.push(warning('item-field-cleaned', 'Removed invalid resize handle values.', `${itemPath}.resizeHandles`))
        }
      }
    }

    ids[id] = true
    layout.push(item)
  }

  return { ok: true, layout, warnings }
}

const normalizeLayoutsMap = (
  value: unknown,
  mode: LayoutValidationMode,
  path: string
): NormalizeLayoutsResult => {
  const warnings: LayoutPersistenceWarning[] = []
  if (!isObjectRecord(value)) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('validation', `${path} must be an object of breakpoint layouts.`, { path })
    }
  }
  const layouts: LayoutsMap = {}
  Object.keys(value).forEach(key => {
    if (layouts[key]) return
  })

  for (const key of Object.keys(value)) {
    const result = normalizeLayout(value[key], mode, `${path}.${key}`)
    warnings.push(...result.warnings)
    if (!result.ok) {
      if (mode === 'sanitize') {
        warnings.push(warning('breakpoint-dropped', `Dropped invalid breakpoint layout "${key}".`, `${path}.${key}`))
        continue
      }
      return { ok: false, warnings, error: result.error }
    }
    layouts[key] = result.layout
  }
  return { ok: true, layouts, warnings }
}

const parsePayload = (
  payload: unknown
): { ok: true; value: unknown } | { ok: false; error: LayoutPersistenceError } => {
  if (typeof payload !== 'string') return { ok: true, value: payload }
  try {
    return { ok: true, value: JSON.parse(payload) }
  } catch (cause) {
    return {
      ok: false,
      error: createPersistenceError('invalid-json', 'Persistence payload is not valid JSON.', { cause })
    }
  }
}

export function validateLayoutDocument<T = Layout | LayoutsMap>(
  payload: unknown,
  options: {
    expectedKind?: LayoutPersistenceKind
    currentVersion?: number
    validation?: LayoutValidationMode
  } = {}
): LayoutValidationResult<T> {
  const currentVersion = options.currentVersion ?? LAYOUT_SCHEMA_VERSION
  const mode = options.validation ?? 'strict'
  const warnings: LayoutPersistenceWarning[] = []

  if (!isObjectRecord(payload)) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('invalid-document', 'Persistence document must be an object.')
    }
  }

  if (payload.layoutSchemaVersion !== currentVersion) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('invalid-document', `Expected schema version ${currentVersion}.`, {
        path: 'layoutSchemaVersion'
      })
    }
  }

  if (payload.kind !== 'layout' && payload.kind !== 'responsive') {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('invalid-document', 'Document kind must be "layout" or "responsive".', {
        path: 'kind'
      })
    }
  }

  if (options.expectedKind && payload.kind !== options.expectedKind) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('kind-mismatch', `Expected a ${options.expectedKind} persistence document.`, {
        kind: options.expectedKind,
        path: 'kind',
        details: { actualKind: payload.kind }
      })
    }
  }

  for (const key of ['key', 'revision', 'sourceId', 'savedAt'] as const) {
    if (typeof payload[key] !== 'string' || payload[key].trim() === '') {
      return {
        ok: false,
        warnings,
        error: createPersistenceError('invalid-document', `Document ${key} must be a non-empty string.`, {
          path: key
        })
      }
    }
  }

  if (!isValidDateString(payload.savedAt as string)) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('invalid-document', 'Document savedAt must be a valid date string.', {
        path: 'savedAt'
      })
    }
  }

  if (!isObjectRecord(payload.data)) {
    return {
      ok: false,
      warnings,
      error: createPersistenceError('invalid-document', 'Document data must be an object.', { path: 'data' })
    }
  }

  const meta = isObjectRecord(payload.meta) ? cloneMeta(payload.meta as LayoutPersistenceMeta) : undefined
  if (typeof payload.meta !== 'undefined' && !isObjectRecord(payload.meta)) {
    if (mode !== 'sanitize') {
      return {
        ok: false,
        warnings,
        error: createPersistenceError('invalid-document', 'Document meta must be a JSON-safe object.', {
          path: 'meta'
        })
      }
    }
    warnings.push(warning('meta-dropped', 'Dropped invalid meta.', 'meta'))
  }

  if (payload.kind === 'layout') {
    const normalized = normalizeLayout(payload.data.layout, mode, 'data.layout')
    warnings.push(...normalized.warnings)
    if (!normalized.ok) return { ok: false, warnings, error: normalized.error }
    const document: LayoutPersistenceDocument = {
      layoutSchemaVersion: currentVersion,
      kind: 'layout',
      key: payload.key as string,
      revision: payload.revision as string,
      sourceId: payload.sourceId as string,
      savedAt: payload.savedAt as string,
      data: { layout: normalized.layout },
      ...(meta ? { meta } : {})
    }
    return { ok: true, document, value: cloneLayout(normalized.layout) as T, warnings }
  }

  const normalized = normalizeLayoutsMap(payload.data.layouts, mode, 'data.layouts')
  warnings.push(...normalized.warnings)
  if (!normalized.ok) return { ok: false, warnings, error: normalized.error }
  const document: LayoutPersistenceDocument = {
    layoutSchemaVersion: currentVersion,
    kind: 'responsive',
    key: payload.key as string,
    revision: payload.revision as string,
    sourceId: payload.sourceId as string,
    savedAt: payload.savedAt as string,
    data: { layouts: normalized.layouts },
    ...(meta ? { meta } : {})
  }
  return { ok: true, document, value: cloneLayoutsMap(normalized.layouts) as T, warnings }
}

export function serializeLayoutDocument(
  input: Layout | LayoutsMap,
  options: SerializeLayoutOptions
): LayoutPersistenceDocument {
  const now = options.now ?? (() => new Date())
  const revision = options.revision ?? createRevision
  const sourceId = options.sourceId ?? createSourceId()
  const savedAt = now().toISOString()
  const base = {
    layoutSchemaVersion: LAYOUT_SCHEMA_VERSION,
    key: options.key,
    revision: revision(),
    sourceId,
    savedAt,
    ...(options.meta ? { meta: cloneMeta(options.meta) } : {})
  }

  const document: LayoutPersistenceDocument =
    options.kind === 'layout'
      ? {
          ...base,
          kind: 'layout',
          data: { layout: cloneLayout(input as Layout) }
        }
      : {
          ...base,
          kind: 'responsive',
          data: { layouts: cloneLayoutsMap(input as LayoutsMap) }
        }

  const validation = validateLayoutDocument(document, {
    expectedKind: options.kind,
    currentVersion: LAYOUT_SCHEMA_VERSION,
    validation: 'strict'
  })
  if (!validation.ok) throw validation.error
  return validation.document
}

export function migrateLayoutDocument(
  payload: unknown,
  options: {
    currentVersion?: number
    migrations?: LayoutMigrationMap
    expectedKind?: LayoutPersistenceKind
    validation?: LayoutValidationMode
  } = {}
): LayoutMigrationResult {
  const currentVersion = options.currentVersion ?? LAYOUT_SCHEMA_VERSION
  const migrations = options.migrations ?? {}
  const originalPayload = payload
  const events: LayoutMigrationEvent[] = []

  if (!isObjectRecord(payload) || !Number.isInteger(payload.layoutSchemaVersion)) {
    return {
      ok: false,
      originalPayload,
      migrations: events,
      warnings: [],
      error: createPersistenceError('invalid-document', 'Document has no numeric layoutSchemaVersion.', {
        path: 'layoutSchemaVersion',
        originalPayload
      })
    }
  }

  let version = payload.layoutSchemaVersion as number
  if (version > currentVersion) {
    return {
      ok: false,
      originalPayload,
      migrations: events,
      warnings: [],
      error: createPersistenceError('invalid-document', `Schema version ${version} is newer than supported ${currentVersion}.`, {
        path: 'layoutSchemaVersion',
        originalPayload
      })
    }
  }

  let document: unknown = payload
  while (version < currentVersion) {
    const migration = migrations[version]
    if (!migration) {
      return {
        ok: false,
        originalPayload,
        migrations: events,
        warnings: [],
        error: createPersistenceError('migration-missing', `Missing migration from version ${version} to ${version + 1}.`, {
          originalPayload
        })
      }
    }

    try {
      document = migration(document, { fromVersion: version, toVersion: version + 1 })
    } catch (cause) {
      return {
        ok: false,
        originalPayload,
        migrations: events,
        warnings: [],
        error: createPersistenceError('migration-failed', `Migration from version ${version} to ${version + 1} failed.`, {
          cause,
          originalPayload
        })
      }
    }

    if (!isObjectRecord(document) || document.layoutSchemaVersion !== version + 1) {
      return {
        ok: false,
        originalPayload,
        migrations: events,
        warnings: [],
        error: createPersistenceError('migration-failed', `Migration from version ${version} to ${version + 1} returned an invalid document.`, {
          originalPayload
        })
      }
    }

    events.push({ fromVersion: version, toVersion: version + 1 })
    version += 1
  }

  const validation = validateLayoutDocument(document, {
    expectedKind: options.expectedKind,
    currentVersion,
    validation: options.validation ?? 'strict'
  })

  if (!validation.ok) {
    return {
      ok: false,
      originalPayload,
      migrations: events,
      warnings: validation.warnings,
      error:
        events.length > 0
          ? createPersistenceError('migration-failed', 'Migration result failed validation.', {
              cause: validation.error,
              originalPayload
            })
          : validation.error
    }
  }

  return {
    ok: true,
    document: validation.document,
    migrations: events,
    originalPayload,
    warnings: validation.warnings
  }
}

export function deserializeLayoutDocument<T = Layout | LayoutsMap>(
  payload: unknown,
  options: DeserializeLayoutOptions<T> = {}
): LayoutDeserializeResult<T> {
  const parsed = parsePayload(payload)
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      fallback: options.fallback ? clonePersistenceValue(options.expectedKind ?? 'layout', options.fallback) : undefined,
      originalPayload: payload,
      migrations: [],
      warnings: []
    }
  }

  const migrated = migrateLayoutDocument(parsed.value, {
    currentVersion: options.currentVersion,
    migrations: options.migrations,
    expectedKind: options.expectedKind,
    validation: options.validation ?? 'strict'
  })
  if (!migrated.ok) {
    return {
      ok: false,
      error: migrated.error,
      fallback: options.fallback ? clonePersistenceValue(options.expectedKind ?? 'layout', options.fallback) : undefined,
      originalPayload: migrated.originalPayload,
      migrations: migrated.migrations,
      warnings: migrated.warnings
    }
  }

  const validation = validateLayoutDocument<T>(migrated.document, {
    expectedKind: options.expectedKind,
    currentVersion: options.currentVersion,
    validation: options.validation ?? 'strict'
  })
  if (!validation.ok) {
    const error =
      migrated.migrations.length > 0
        ? createPersistenceError('migration-failed', 'Migrated document failed validation.', {
            cause: validation.error,
            originalPayload: migrated.originalPayload
          })
        : validation.error
    return {
      ok: false,
      error,
      fallback: options.fallback ? clonePersistenceValue(options.expectedKind ?? 'layout', options.fallback) : undefined,
      originalPayload: migrated.originalPayload,
      migrations: migrated.migrations,
      warnings: migrated.warnings.concat(validation.warnings)
    }
  }

  return {
    ok: true,
    document: validation.document,
    value: validation.value,
    migrations: migrated.migrations,
    warnings: migrated.warnings.concat(validation.warnings)
  }
}

const toAdapterError = (
  code: LayoutPersistenceErrorCode,
  message: string,
  cause: unknown,
  key?: string,
  kind?: LayoutPersistenceKind
): LayoutPersistenceError => {
  if (isObjectRecord(cause) && typeof cause.code === 'string' && typeof cause.message === 'string') {
    return cause as LayoutPersistenceError
  }
  return createPersistenceError(code, message, { cause, key, kind })
}

const resolveStorage = (storage?: Storage, storageName: 'localStorage' | 'sessionStorage' = 'localStorage'): Storage | null => {
  if (storage) return storage
  if (typeof window === 'undefined' || !window[storageName]) return null
  return window[storageName]
}

const webStorageAdapter = (
  storageName: 'localStorage' | 'sessionStorage',
  options: WebStorageAdapterOptions = {}
): LayoutPersistenceAdapter => {
  const prefix = options.prefix ?? ''
  const storageKey = (key: string) => `${prefix}${key}`

  const getStorage = () => {
    const storage = resolveStorage(options.storage, storageName)
    if (!storage) {
      throw createPersistenceError('adapter-unavailable', `${storageName} is not available in this environment.`)
    }
    return storage
  }

  return {
    load(key) {
      const storage = getStorage()
      try {
        return storage.getItem(storageKey(key))
      } catch (cause) {
        throw toAdapterError('adapter-load-failed', 'Failed to load persistence document.', cause, key)
      }
    },
    save(key, document) {
      const storage = getStorage()
      try {
        storage.setItem(storageKey(key), JSON.stringify(document))
      } catch (cause) {
        throw toAdapterError('adapter-save-failed', 'Failed to save persistence document.', cause, key, document.kind)
      }
    },
    remove(key) {
      const storage = getStorage()
      try {
        storage.removeItem(storageKey(key))
      } catch (cause) {
        throw toAdapterError('adapter-remove-failed', 'Failed to remove persistence document.', cause, key)
      }
    },
    subscribe(key, callback) {
      const storage = getStorage()
      if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
        return () => {}
      }
      const fullKey = storageKey(key)
      const handler = (event: StorageEvent) => {
        if (event.storageArea && event.storageArea !== storage) return
        if (event.key !== fullKey) return
        const parsed = event.newValue == null ? null : parsePayload(event.newValue)
        const document = parsed && parsed.ok ? parsed.value : event.newValue
        const sourceId = isObjectRecord(document) && typeof document.sourceId === 'string'
          ? document.sourceId
          : undefined
        if (options.sourceId && sourceId === options.sourceId) return
        callback({
          key,
          source: 'storage',
          raw: event.newValue,
          oldRaw: event.oldValue,
          document,
          sourceId
        })
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    }
  }
}

export function localStorageAdapter(options: WebStorageAdapterOptions = {}): LayoutPersistenceAdapter {
  return webStorageAdapter('localStorage', options)
}

export function sessionStorageAdapter(options: WebStorageAdapterOptions = {}): LayoutPersistenceAdapter {
  return webStorageAdapter('sessionStorage', options)
}

const adapterTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number | undefined,
  key: string | undefined,
  operation: AdapterOperation
): Promise<T> => {
  if (!timeoutMs || !Number.isFinite(timeoutMs) || timeoutMs <= 0) return await promise

  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    const timeout = new Promise<T>((_resolve, reject) => {
      timer = setTimeout(() => {
        reject(createPersistenceError('adapter-timeout', `Adapter ${operation} timed out after ${timeoutMs}ms.`, {
          key,
          details: { operation, timeoutMs }
        }))
      }, timeoutMs)
    })
    return await Promise.race([promise, timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const idbRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || createPersistenceError('adapter-unavailable', 'IndexedDB request failed.'))
  })

export function indexedDBAdapter(options: IndexedDBAdapterOptions = {}): LayoutPersistenceAdapter {
  const dbName = options.dbName ?? 'vue-grid-layout-persistence'
  const storeName = options.storeName ?? 'layouts'
  const version = options.version ?? 1
  const prefix = options.prefix ?? ''
  const timeoutMs = options.timeoutMs ?? 10000
  const channelName = options.channelName ?? `${dbName}:${storeName}`
  const storageKey = (key: string) => `${prefix}${key}`

  const getIndexedDB = () => {
    const factory = options.indexedDB ?? (typeof indexedDB !== 'undefined' ? indexedDB : null)
    if (!factory) {
      throw createPersistenceError('adapter-unavailable', 'IndexedDB is not available in this environment.')
    }
    return factory
  }

  const openDatabase = async (key?: string) => {
    const factory = getIndexedDB()
    const promise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(dbName, version)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || createPersistenceError('adapter-unavailable', 'Failed to open IndexedDB database.'))
      request.onblocked = () => reject(createPersistenceError('adapter-unavailable', 'IndexedDB upgrade is blocked by another connection.'))
    })
    return await adapterTimeout(promise, timeoutMs, key, 'load')
  }

  const withStore = async <T>(
    key: string,
    mode: IDBTransactionMode,
    operation: AdapterOperation,
    run: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> => {
    let database: IDBDatabase | null = null
    try {
      database = await openDatabase(key)
      const store = database.transaction(storeName, mode).objectStore(storeName)
      return await adapterTimeout(run(store), timeoutMs, key, operation)
    } finally {
      database?.close()
    }
  }

  const createChannel = () => {
    if (options.broadcast === false) return null
    const Channel = options.broadcastChannel ?? (typeof BroadcastChannel !== 'undefined' ? BroadcastChannel : null)
    return Channel ? new Channel(channelName) : null
  }

  const broadcast = (key: string, document: unknown) => {
    const channel = createChannel()
    if (!channel) return
    try {
      const sourceId = isObjectRecord(document) && typeof document.sourceId === 'string'
        ? document.sourceId
        : undefined
      channel.postMessage({ key, document, sourceId })
    } finally {
      channel.close()
    }
  }

  return {
    load(key) {
      return withStore(key, 'readonly', 'load', store => idbRequest(store.get(storageKey(key))))
    },
    async save(key, document) {
      try {
        await withStore(key, 'readwrite', 'save', store => idbRequest(store.put(cloneAdapterValue(document), storageKey(key))))
        broadcast(key, document)
      } catch (cause) {
        throw toAdapterError('adapter-save-failed', 'Failed to save IndexedDB persistence document.', cause, key, document.kind)
      }
    },
    async remove(key) {
      try {
        await withStore(key, 'readwrite', 'remove', store => idbRequest(store.delete(storageKey(key))))
        broadcast(key, null)
      } catch (cause) {
        throw toAdapterError('adapter-remove-failed', 'Failed to remove IndexedDB persistence document.', cause, key)
      }
    },
    subscribe(key, callback) {
      const channel = createChannel()
      if (!channel) return () => {}
      channel.onmessage = event => {
        const payload = event.data as { key?: string; document?: unknown; sourceId?: string }
        if (!payload || payload.key !== key) return
        if (options.sourceId && payload.sourceId === options.sourceId) return
        callback({
          key,
          source: 'adapter',
          document: payload.document ?? null,
          raw: payload.document,
          sourceId: payload.sourceId
        })
      }
      return () => channel.close()
    }
  }
}

export function remoteHttpAdapter(options: RemoteHttpAdapterOptions): LayoutPersistenceAdapter {
  const loadMethod = options.loadMethod ?? 'GET'
  const saveMethod = options.saveMethod ?? 'PUT'
  const removeMethod = options.removeMethod ?? 'DELETE'
  const timeoutMs = options.timeoutMs ?? 10000

  const resolveFetch = () => {
    const fetcher = options.fetch ?? (typeof fetch !== 'undefined' ? fetch : null)
    if (!fetcher) {
      throw createPersistenceError('adapter-unavailable', 'fetch is not available in this environment.')
    }
    return fetcher
  }

  const endpoint = (key: string) =>
    typeof options.endpoint === 'function' ? options.endpoint(key) : options.endpoint.replace(/\{key\}/g, encodeURIComponent(key))

  const headers = () => {
    const resolved = typeof options.headers === 'function' ? options.headers() : options.headers
    return resolved ?? { 'content-type': 'application/json' }
  }

  const request = async (key: string, init: RequestInit, operation: AdapterOperation): Promise<Response> => {
    const fetcher = resolveFetch()
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let timer: ReturnType<typeof setTimeout> | null = null
    try {
      if (controller && timeoutMs > 0) {
        timer = setTimeout(() => controller.abort(), timeoutMs)
      }
      const response = await fetcher(endpoint(key), {
        credentials: options.credentials,
        ...init,
        signal: controller?.signal
      })
      if (!response.ok && !(operation === 'load' && response.status === 404)) {
        throw createPersistenceError(
          operation === 'load'
            ? 'adapter-load-failed'
            : operation === 'save'
              ? 'adapter-save-failed'
              : 'adapter-remove-failed',
          `Remote persistence ${operation} failed with HTTP ${response.status}.`,
          { key, details: { status: response.status, statusText: response.statusText } }
        )
      }
      return response
    } catch (cause) {
      const isAbort = isObjectRecord(cause) && cause.name === 'AbortError'
      throw toAdapterError(
        isAbort ? 'adapter-timeout' : operation === 'load' ? 'adapter-load-failed' : operation === 'save' ? 'adapter-save-failed' : 'adapter-remove-failed',
        `Failed to ${operation} remote persistence document.`,
        cause,
        key
      )
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  return {
    async load(key) {
      const response = await request(key, { method: loadMethod, headers: headers() }, 'load')
      if (response.status === 404 || response.status === 204) return null
      if (options.parse) return await options.parse(response)
      return await response.json()
    },
    async save(key, document) {
      const body = options.serialize ? options.serialize(document) : JSON.stringify(document)
      await request(key, { method: saveMethod, headers: headers(), body }, 'save')
    },
    async remove(key) {
      await request(key, { method: removeMethod, headers: headers() }, 'remove')
    }
  }
}

export function memoryPersistenceAdapter(seed: Record<string, unknown> = {}): LayoutPersistenceAdapter {
  const store: Record<string, unknown> = { ...seed }
  const listeners: Record<string, Array<(event: LayoutPersistenceExternalChange) => void>> = {}

  const notify = (key: string, document: unknown) => {
    const callbacks = listeners[key] || []
    const sourceId = isObjectRecord(document) && typeof document.sourceId === 'string'
      ? document.sourceId
      : undefined
    callbacks.slice().forEach(callback => callback({
      key,
      source: 'adapter',
      document,
      raw: document,
      sourceId
    }))
  }

  return {
    load(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? cloneAdapterValue(store[key]) : null
    },
    save(key, document) {
      store[key] = cloneAdapterValue(document)
      notify(key, store[key])
    },
    remove(key) {
      delete store[key]
      notify(key, null)
    },
    subscribe(key, callback) {
      if (!listeners[key]) listeners[key] = []
      listeners[key].push(callback)
      return () => {
        listeners[key] = (listeners[key] || []).filter(item => item !== callback)
      }
    }
  }
}

const isNewerDocument = (
  incoming: LayoutPersistenceDocument,
  lastSavedAt: string | null
): boolean => {
  if (!lastSavedAt) return true
  return Date.parse(incoming.savedAt) > Date.parse(lastSavedAt)
}

type AdapterOperation = 'load' | 'save' | 'remove'

export function useGridLayoutPersistence<T extends Layout | LayoutsMap>(
  options: UseGridLayoutPersistenceOptions<T>
): GridLayoutPersistenceController<T> {
  const adapter = options.adapter ?? localStorageAdapter({ sourceId: options.sourceId })
  const autoSave = options.autoSave ?? true
  const debounceMs = options.debounceMs ?? 300
  const validation = options.validation ?? 'strict'
  const conflictStrategy = options.conflictStrategy ?? 'manual'
  const sourceId = options.sourceId ?? createSourceId()
  const timeoutMs = options.timeoutMs ?? 10000
  const status = ref<LayoutPersistenceStatus>('idle')
  const dirty = ref(false)
  const error = ref<LayoutPersistenceError | null>(null)
  const lastSavedAt = ref<string | null>(null)
  const conflict = shallowRef<LayoutPersistenceConflict<T> | null>(null)
  let lastSavedSnapshot = clonePersistenceValue(options.kind, options.target.value)
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let applyingSnapshot = false
  let stopped = false
  let unsubscribe: (() => void) | null = null
  let watchStop: WatchStopHandle | null = null

  const resolveMeta = (): LayoutPersistenceMeta | undefined => {
    if (!options.meta) return undefined
    return typeof options.meta === 'function' ? options.meta() : options.meta
  }

  const emitEvent = (event: LayoutPersistenceEvent<T>) => {
    options.onEvent?.(event)
  }

  const setError = (nextError: LayoutPersistenceError) => {
    error.value = nextError
    options.onError?.(nextError)
    emitEvent({ type: 'error', key: options.key, kind: options.kind, error: nextError })
  }

  const clearSaveTimer = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = null
  }

  const assignTarget = (value: T) => {
    applyingSnapshot = true
    options.target.value = clonePersistenceValue(options.kind, value)
    applyingSnapshot = false
  }

  const serializeCurrent = (): LayoutPersistenceDocument =>
    serializeLayoutDocument(options.target.value, {
      key: options.key,
      kind: options.kind,
      sourceId,
      meta: resolveMeta()
    })

  const runAdapterOperation = async <R>(
    operation: AdapterOperation,
    fn: () => MaybePromise<R>,
    failureCode: LayoutPersistenceErrorCode,
    failureMessage: string
  ): Promise<R> => {
    let timer: ReturnType<typeof setTimeout> | null = null
    try {
      const pending = Promise.resolve(fn())
      const shouldTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0
      if (!shouldTimeout) return await pending

      const timeout = new Promise<R>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(createPersistenceError('adapter-timeout', `${failureMessage} Timed out after ${timeoutMs}ms.`, {
            key: options.key,
            kind: options.kind,
            details: { operation, timeoutMs }
          }))
        }, timeoutMs)
      })

      return await Promise.race([pending, timeout])
    } catch (cause) {
      throw toAdapterError(failureCode, failureMessage, cause, options.key, options.kind)
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  const markDirtyFromTarget = () => {
    dirty.value = !deepEqual(options.target.value, lastSavedSnapshot)
  }

  const scheduleSave = () => {
    if (!autoSave || !dirty.value || stopped) return
    clearSaveTimer()
    saveTimer = setTimeout(() => {
      saveTimer = null
      void controller.save()
    }, debounceMs)
  }

  const applyRemoteDocument = (
    document: LayoutPersistenceDocument,
    value: T,
    reason?: 'clean-external-change' | 'newer-wins' | 'resolve-remote'
  ) => {
    clearSaveTimer()
    assignTarget(value)
    lastSavedSnapshot = clonePersistenceValue(options.kind, value)
    lastSavedAt.value = document.savedAt
    dirty.value = false
    error.value = null
    conflict.value = null
    status.value = 'ready'
    if (reason) {
      emitEvent({
        type: 'external-apply',
        key: options.key,
        kind: options.kind,
        document,
        value: clonePersistenceValue(options.kind, value),
        reason
      })
    }
  }

  const handleExternalChange = (event: LayoutPersistenceExternalChange) => {
    if (stopped || event.document == null) return
    const incoming = deserializeLayoutDocument<T>(event.document ?? event.raw, {
      expectedKind: options.kind,
      currentVersion: LAYOUT_SCHEMA_VERSION,
      migrations: options.migrations,
      validation,
      fallback: options.fallback
    })
    if (!incoming.ok) {
      setError(incoming.error)
      return
    }
    if (incoming.document.sourceId === sourceId) return
    if (!isNewerDocument(incoming.document, lastSavedAt.value)) return

    if (!dirty.value) {
      applyRemoteDocument(incoming.document, incoming.value, 'clean-external-change')
      return
    }

    if (conflictStrategy === 'newer-wins') {
      applyRemoteDocument(incoming.document, incoming.value, 'newer-wins')
      return
    }

    if (conflictStrategy === 'keep-local') {
      scheduleSave()
      return
    }

    const localDocument = serializeCurrent()
    const nextConflict: LayoutPersistenceConflict<T> = {
      key: options.key,
      reason: 'dirty-external-change',
      localValue: clonePersistenceValue(options.kind, options.target.value),
      externalValue: clonePersistenceValue(options.kind, incoming.value),
      localDocument,
      externalDocument: incoming.document,
      resolve: action => controller.resolveConflict(action)
    }
    conflict.value = nextConflict
    status.value = 'conflict'
    emitEvent({ type: 'conflict', key: options.key, kind: options.kind, conflict: nextConflict })
  }

  const controller: GridLayoutPersistenceController<T> = {
    status,
    dirty,
    error,
    lastSavedAt,
    conflict,
    async load() {
      clearSaveTimer()
      status.value = 'loading'
      error.value = null
      emitEvent({ type: 'load-start', key: options.key, kind: options.kind })
      let payload: unknown = null
      try {
        payload = await runAdapterOperation(
          'load',
          () => adapter.load(options.key),
          'adapter-load-failed',
          'Failed to load persistence document.'
        )
      } catch (cause) {
        const nextError = toAdapterError('adapter-load-failed', 'Failed to load persistence document.', cause, options.key, options.kind)
        status.value = nextError.code === 'adapter-unavailable' ? 'unavailable' : 'error'
        setError(nextError)
        emitEvent({ type: 'load-error', key: options.key, kind: options.kind, error: nextError })
        return { ok: false, found: false, error: nextError, migrations: [], warnings: [] }
      }

      if (payload == null) {
        lastSavedSnapshot = clonePersistenceValue(options.kind, options.target.value)
        dirty.value = false
        status.value = 'ready'
        emitEvent({ type: 'load-empty', key: options.key, kind: options.kind })
        return { ok: true, found: false, value: clonePersistenceValue(options.kind, options.target.value), migrations: [], warnings: [] }
      }

      const result = deserializeLayoutDocument<T>(payload, {
        expectedKind: options.kind,
        currentVersion: LAYOUT_SCHEMA_VERSION,
        migrations: options.migrations,
        validation,
        fallback: options.fallback
      })

      if (!result.ok) {
        if (result.fallback) {
          assignTarget(result.fallback)
          lastSavedSnapshot = clonePersistenceValue(options.kind, result.fallback)
          dirty.value = false
        }
        status.value = 'error'
        setError(result.error)
        emitEvent({
          type: 'load-error',
          key: options.key,
          kind: options.kind,
          error: result.error,
          fallback: result.fallback
        })
        return {
          ok: false,
          found: true,
          value: result.fallback,
          error: result.error,
          fallbackApplied: Boolean(result.fallback),
          migrations: result.migrations,
          warnings: result.warnings
        }
      }

      applyRemoteDocument(result.document, result.value)
      if (result.migrations.length > 0) {
        emitEvent({ type: 'migration', key: options.key, kind: options.kind, migrations: result.migrations })
      }
      emitEvent({
        type: 'load-success',
        key: options.key,
        kind: options.kind,
        document: result.document,
        value: result.value,
        migrations: result.migrations,
        warnings: result.warnings
      })
      return {
        ok: true,
        found: true,
        value: result.value,
        document: result.document,
        migrations: result.migrations,
        warnings: result.warnings
      }
    },
    commit(nextValue?: T) {
      if (typeof nextValue !== 'undefined') {
        assignTarget(nextValue)
      }
      conflict.value = null
      if (status.value === 'conflict') status.value = 'ready'
      markDirtyFromTarget()
      scheduleSave()
    },
    async save() {
      clearSaveTimer()
      status.value = 'saving'
      error.value = null
      emitEvent({ type: 'save-start', key: options.key, kind: options.kind })
      let document: LayoutPersistenceDocument
      try {
        document = serializeCurrent()
        await runAdapterOperation(
          'save',
          () => adapter.save(options.key, document),
          'adapter-save-failed',
          'Failed to save persistence document.'
        )
      } catch (cause) {
        const nextError = toAdapterError('adapter-save-failed', 'Failed to save persistence document.', cause, options.key, options.kind)
        status.value = nextError.code === 'adapter-unavailable' ? 'unavailable' : 'error'
        dirty.value = true
        setError(nextError)
        emitEvent({ type: 'save-error', key: options.key, kind: options.kind, error: nextError })
        return { ok: false, error: nextError }
      }
      lastSavedSnapshot = clonePersistenceValue(options.kind, options.target.value)
      lastSavedAt.value = document.savedAt
      dirty.value = false
      error.value = null
      status.value = 'ready'
      emitEvent({ type: 'save-success', key: options.key, kind: options.kind, document })
      return { ok: true, document }
    },
    discard() {
      clearSaveTimer()
      assignTarget(lastSavedSnapshot)
      dirty.value = false
      conflict.value = null
      error.value = null
      status.value = 'ready'
      emitEvent({ type: 'discard', key: options.key, kind: options.kind, value: clonePersistenceValue(options.kind, options.target.value) })
    },
    reset(nextValue?: T) {
      clearSaveTimer()
      const value = typeof nextValue === 'undefined' ? options.target.value : nextValue
      assignTarget(value)
      lastSavedSnapshot = clonePersistenceValue(options.kind, options.target.value)
      dirty.value = false
      conflict.value = null
      error.value = null
      status.value = 'ready'
      emitEvent({ type: 'reset', key: options.key, kind: options.kind, value: clonePersistenceValue(options.kind, options.target.value) })
    },
    async remove() {
      clearSaveTimer()
      try {
        await runAdapterOperation(
          'remove',
          () => adapter.remove(options.key),
          'adapter-remove-failed',
          'Failed to remove persistence document.'
        )
      } catch (cause) {
        const nextError = toAdapterError('adapter-remove-failed', 'Failed to remove persistence document.', cause, options.key, options.kind)
        status.value = nextError.code === 'adapter-unavailable' ? 'unavailable' : 'error'
        setError(nextError)
        throw nextError
      }
      lastSavedSnapshot = clonePersistenceValue(options.kind, options.target.value)
      dirty.value = false
      conflict.value = null
      error.value = null
      status.value = 'ready'
      emitEvent({ type: 'remove', key: options.key, kind: options.kind })
    },
    async resolveConflict(action) {
      const currentConflict = conflict.value
      if (!currentConflict) return
      if (action === 'useRemote') {
        applyRemoteDocument(currentConflict.externalDocument, currentConflict.externalValue, 'resolve-remote')
        return
      }
      conflict.value = null
      status.value = 'ready'
      dirty.value = true
      await controller.save()
    },
    stop() {
      stopped = true
      clearSaveTimer()
      if (unsubscribe) unsubscribe()
      if (watchStop) watchStop()
      unsubscribe = null
      watchStop = null
    }
  }

  if (options.watchTarget ?? true) {
    watchStop = watch(
      options.target,
      () => {
        if (applyingSnapshot || stopped) return
        controller.commit(undefined, { source: 'watch' })
      },
      { deep: true, flush: 'sync' }
    )
  }

  if (adapter.subscribe) {
    try {
      unsubscribe = adapter.subscribe(options.key, event => {
        handleExternalChange(event)
      })
    } catch (cause) {
      const nextError = toAdapterError('adapter-subscribe-failed', 'Failed to subscribe to persistence changes.', cause, options.key, options.kind)
      setError(nextError)
    }
  }

  return controller
}
