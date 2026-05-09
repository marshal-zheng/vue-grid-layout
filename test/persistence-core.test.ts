import assert from 'assert'
import { ref } from 'vue'
import { cloneLayout, type Layout } from '../lib/utils'
import {
  LAYOUT_SCHEMA_VERSION,
  deserializeLayoutDocument,
  indexedDBAdapter,
  localStorageAdapter,
  memoryPersistenceAdapter,
  migrateLayoutDocument,
  remoteHttpAdapter,
  serializeLayoutDocument,
  sessionStorageAdapter,
  useGridLayoutPersistence
} from '../lib/persistence'

const layoutA: Layout = [
  { i: 'a', x: 0, y: 0, w: 2, h: 2, minW: 1, maxW: 4, static: true, isResizable: false },
  { i: 'b', x: 2, y: 0, w: 2, h: 2, isDraggable: true, resizeHandles: ['se', 'e'] }
]

const layoutB: Layout = [
  { i: 'a', x: 1, y: 0, w: 3, h: 2 },
  { i: 'b', x: 4, y: 0, w: 2, h: 2 }
]

const layoutC: Layout = [
  { i: 'a', x: 5, y: 0, w: 1, h: 1 }
]

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class FakeStorage implements Storage {
  private data: Record<string, string> = {}

  get length() {
    return Object.keys(this.data).length
  }

  clear() {
    this.data = {}
  }

  getItem(key: string) {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null
  }

  key(index: number) {
    return Object.keys(this.data)[index] || null
  }

  removeItem(key: string) {
    delete this.data[key]
  }

  setItem(key: string, value: string) {
    this.data[key] = value
  }
}

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

type MutableIDBRequest<T> = IDBRequest<T> & {
  result: T
  error: DOMException | null
  onsuccess: ((event: Event) => void) | null
  onerror: ((event: Event) => void) | null
}

type MutableIDBOpenRequest = IDBOpenDBRequest & {
  result: IDBDatabase
  error: DOMException | null
  onsuccess: ((event: Event) => void) | null
  onerror: ((event: Event) => void) | null
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null
  onblocked: ((event: Event) => void) | null
}

const createIDBRequest = <T>() => ({
  result: undefined as T,
  error: null,
  onsuccess: null,
  onerror: null
}) as MutableIDBRequest<T>

class FakeIDBObjectStore {
  constructor(private readonly store: Map<string, unknown>) {}

  get(key: IDBValidKey): IDBRequest<unknown> {
    const request = createIDBRequest<unknown>()
    setTimeout(() => {
      request.result = this.store.has(String(key)) ? cloneJson(this.store.get(String(key))) : undefined
      request.onsuccess?.({} as Event)
    }, 0)
    return request
  }

  put(value: unknown, key?: IDBValidKey): IDBRequest<IDBValidKey> {
    const request = createIDBRequest<IDBValidKey>()
    setTimeout(() => {
      const resolvedKey = String(key)
      this.store.set(resolvedKey, cloneJson(value))
      request.result = resolvedKey
      request.onsuccess?.({} as Event)
    }, 0)
    return request
  }

  delete(key: IDBValidKey): IDBRequest<undefined> {
    const request = createIDBRequest<undefined>()
    setTimeout(() => {
      this.store.delete(String(key))
      request.result = undefined
      request.onsuccess?.({} as Event)
    }, 0)
    return request
  }
}

class FakeIDBDatabase {
  private readonly stores = new Map<string, Map<string, unknown>>()

  objectStoreNames = {
    contains: (name: string) => this.stores.has(name)
  } as DOMStringList

  createObjectStore(name: string): IDBObjectStore {
    if (!this.stores.has(name)) this.stores.set(name, new Map())
    return new FakeIDBObjectStore(this.stores.get(name) as Map<string, unknown>) as unknown as IDBObjectStore
  }

  transaction(name: string): IDBTransaction {
    if (!this.stores.has(name)) this.stores.set(name, new Map())
    const store = new FakeIDBObjectStore(this.stores.get(name) as Map<string, unknown>)
    return {
      objectStore: () => store as unknown as IDBObjectStore
    } as unknown as IDBTransaction
  }

  close() {}
}

class FakeIDBFactory {
  private database: FakeIDBDatabase | null = null

  open(): IDBOpenDBRequest {
    const request = {
      result: undefined as unknown as IDBDatabase,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null
    } as MutableIDBOpenRequest
    setTimeout(() => {
      const isNew = !this.database
      if (!this.database) this.database = new FakeIDBDatabase()
      request.result = this.database as unknown as IDBDatabase
      if (isNew) request.onupgradeneeded?.({} as IDBVersionChangeEvent)
      request.onsuccess?.({} as Event)
    }, 0)
    return request
  }
}

const fakeResponse = (status: number, body?: unknown): Response => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  json: () => Promise.resolve(body),
  text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body))
}) as Response

function testSerializationAndDeserialization() {
  const savedAt = new Date('2026-05-09T00:00:00.000Z')
  const doc = serializeLayoutDocument(layoutA, {
    key: 'layout-key',
    kind: 'layout',
    sourceId: 'source-1',
    revision: () => 'rev-1',
    now: () => savedAt,
    meta: { owner: 'dashboard', nested: { ok: true }, fn: () => false }
  })

  assert.equal(doc.layoutSchemaVersion, LAYOUT_SCHEMA_VERSION)
  assert.equal(doc.kind, 'layout')
  assert.equal(doc.savedAt, savedAt.toISOString())
  assert.equal(doc.meta?.owner, 'dashboard')
  assert.equal(typeof doc.meta?.fn, 'undefined')
  assert.equal(doc.kind, 'layout')
  if (doc.kind === 'layout') {
    assert.deepEqual(doc.data.layout[1].resizeHandles, ['se', 'e'])
  }

  const restored = deserializeLayoutDocument<Layout>(JSON.stringify(doc), { expectedKind: 'layout' })
  assert.equal(restored.ok, true)
  assert.deepEqual(restored.ok && restored.value, cloneLayout(layoutA))

  const responsiveDoc = serializeLayoutDocument(
    { lg: layoutA, sm: [] },
    { key: 'responsive-key', kind: 'responsive', sourceId: 'source-1' }
  )
  const responsiveRestored = deserializeLayoutDocument<Record<string, Layout>>(responsiveDoc, {
    expectedKind: 'responsive'
  })
  assert.equal(responsiveRestored.ok, true)
  assert.deepEqual(responsiveRestored.ok && responsiveRestored.value.lg, cloneLayout(layoutA))

  assert.equal(deserializeLayoutDocument('{nope').ok, false)
  assert.equal(deserializeLayoutDocument({}).ok, false)
  assert.equal(deserializeLayoutDocument({ ...doc, data: { layout: [{ ...layoutA[0], x: 'bad' }] } }).ok, false)
  assert.equal(deserializeLayoutDocument({ ...doc, data: { layout: [{ ...layoutA[0] }, { ...layoutA[0] }] } }).ok, false)
  assert.equal(deserializeLayoutDocument({ ...doc, data: { layout: [{ ...layoutA[0], x: -1 }] } }).ok, false)
  assert.equal(deserializeLayoutDocument({ ...doc, data: { layout: [{ ...layoutA[0], w: 0 }] } }).ok, false)
  assert.equal(deserializeLayoutDocument({ ...doc, data: { layout: [{ ...layoutA[0], resizeHandles: ['bad'] }] } }).ok, false)

  const sanitized = deserializeLayoutDocument<Layout>(
    { ...doc, data: { layout: [{ ...layoutA[0], x: -1, w: 0, resizeHandles: ['se', 'bad'] }] } },
    { expectedKind: 'layout', validation: 'sanitize' }
  )
  assert.equal(sanitized.ok, true)
  assert.equal(sanitized.ok && sanitized.value[0].x, 0)
  assert.equal(sanitized.ok && sanitized.value[0].w, 1)
  assert.deepEqual(sanitized.ok && sanitized.value[0].resizeHandles, ['se'])
  assert.ok(sanitized.warnings.length > 0)

  const fallback = deserializeLayoutDocument<Layout>('{broken', {
    expectedKind: 'layout',
    fallback: layoutB
  })
  assert.equal(fallback.ok, false)
  assert.deepEqual(!fallback.ok && fallback.fallback, cloneLayout(layoutB))
}

function testMigrations() {
  const v0 = {
    layoutSchemaVersion: 0,
    kind: 'layout',
    key: 'migrate',
    revision: 'r0',
    sourceId: 's0',
    savedAt: '2026-05-09T00:00:00.000Z',
    data: { layout: layoutA }
  }
  const migrations = {
    0: (document: unknown) => ({
      ...(document as Record<string, unknown>),
      layoutSchemaVersion: 1,
      revision: 'r1'
    })
  }
  const migrated = deserializeLayoutDocument<Layout>(v0, {
    expectedKind: 'layout',
    migrations
  })
  assert.equal(migrated.ok, true)
  assert.equal(migrated.ok && migrated.document.revision, 'r1')
  assert.deepEqual(migrated.migrations, [{ fromVersion: 0, toVersion: 1 }])

  assert.equal(migrateLayoutDocument(v0).ok, false)
  assert.equal(migrateLayoutDocument(v0, { migrations: { 0: () => { throw new Error('boom') } } }).ok, false)
  assert.equal(migrateLayoutDocument(v0, { migrations: { 0: () => ({ layoutSchemaVersion: 0 }) } }).ok, false)
  const invalidCurrentDocument = migrateLayoutDocument(v0, {
    migrations: { 0: () => ({ layoutSchemaVersion: 1 }) }
  })
  assert.equal(invalidCurrentDocument.ok, false)
  assert.equal(!invalidCurrentDocument.ok && invalidCurrentDocument.error.code, 'migration-failed')
}

async function testAdapters() {
  const doc = serializeLayoutDocument(layoutA, { key: 'adapter', kind: 'layout', sourceId: 'source-1' })
  const memory = memoryPersistenceAdapter()
  let memoryEvent = false
  const unsubscribeMemory = memory.subscribe?.('adapter', event => {
    memoryEvent = Boolean(event.document)
  })
  await memory.save('adapter', doc)
  assert.ok(memoryEvent)
  assert.deepEqual(await memory.load('adapter'), doc)
  await memory.remove('adapter')
  assert.equal(await memory.load('adapter'), null)
  unsubscribeMemory?.()

  const storage = new FakeStorage()
  const listeners: Array<(event: StorageEvent) => void> = []
  ;(globalThis as unknown as { window: unknown }).window = {
    localStorage: storage,
    addEventListener: (type: string, listener: (event: StorageEvent) => void) => {
      if (type === 'storage') listeners.push(listener)
    },
    removeEventListener: (type: string, listener: (event: StorageEvent) => void) => {
      if (type !== 'storage') return
      const index = listeners.indexOf(listener)
      if (index >= 0) listeners.splice(index, 1)
    }
  }

  const local = localStorageAdapter({ prefix: 'vgl:', sourceId: 'source-1' })
  await local.save('adapter', doc)
  assert.equal(storage.getItem('vgl:adapter') != null, true)
  assert.equal(typeof await local.load('adapter'), 'string')
  let localEvent = false
  const unsubscribeLocal = local.subscribe?.('adapter', () => {
    localEvent = true
  })
  const externalDoc = serializeLayoutDocument(layoutB, { key: 'adapter', kind: 'layout', sourceId: 'source-2' })
  listeners.forEach(listener => listener(({
    key: 'vgl:adapter',
    newValue: JSON.stringify(externalDoc),
    oldValue: null,
    storageArea: storage
  } as unknown) as StorageEvent))
  assert.ok(localEvent)
  localEvent = false
  listeners.forEach(listener => listener(({
    key: 'vgl:adapter',
    newValue: JSON.stringify(doc),
    oldValue: null,
    storageArea: storage
  } as unknown) as StorageEvent))
  assert.equal(localEvent, false)
  unsubscribeLocal?.()
  await local.remove('adapter')
  assert.equal(storage.getItem('vgl:adapter'), null)
  delete (globalThis as unknown as { window?: unknown }).window

  const sessionStorage = new FakeStorage()
  const session = sessionStorageAdapter({ storage: sessionStorage, prefix: 'session:' })
  await session.save('adapter', doc)
  assert.equal(typeof await session.load('adapter'), 'string')
  await session.remove('adapter')
  assert.equal(await session.load('adapter'), null)

  const idb = indexedDBAdapter({
    indexedDB: new FakeIDBFactory() as unknown as IDBFactory,
    dbName: 'test-grid-layout',
    storeName: 'layouts',
    prefix: 'idb:',
    broadcast: false
  })
  await idb.save('adapter', doc)
  assert.deepEqual(await idb.load('adapter'), doc)
  await idb.remove('adapter')
  assert.equal(await idb.load('adapter'), undefined)

  const remoteStore: Record<string, unknown> = {}
  const remoteFetch: typeof fetch = (input, init) => {
    const key = String(input).split('/').pop() as string
    const method = init?.method || 'GET'
    if (method === 'GET') {
      return Promise.resolve(Object.prototype.hasOwnProperty.call(remoteStore, key)
        ? fakeResponse(200, remoteStore[key])
        : fakeResponse(404))
    }
    if (method === 'PUT') {
      remoteStore[key] = JSON.parse(String(init?.body))
      return Promise.resolve(fakeResponse(204))
    }
    if (method === 'DELETE') {
      delete remoteStore[key]
      return Promise.resolve(fakeResponse(204))
    }
    return Promise.resolve(fakeResponse(405))
  }
  const remote = remoteHttpAdapter({
    endpoint: key => `/api/layouts/${key}`,
    fetch: remoteFetch
  })
  assert.equal(await remote.load('adapter'), null)
  await remote.save('adapter', doc)
  assert.deepEqual(await remote.load('adapter'), doc)
  await remote.remove('adapter')
  assert.equal(await remote.load('adapter'), null)
}

async function testControllerState() {
  const adapter = memoryPersistenceAdapter()
  const target = ref<Layout>(layoutA)
  const controller = useGridLayoutPersistence({
    key: 'controller',
    kind: 'layout',
    target,
    adapter,
    autoSave: false
  })

  controller.commit(layoutB)
  assert.equal(controller.dirty.value, true)
  const saved = await controller.save()
  assert.equal(saved.ok, true)
  assert.equal(controller.dirty.value, false)
  assert.ok(controller.lastSavedAt.value)

  controller.commit(layoutC)
  assert.equal(controller.dirty.value, true)
  controller.discard()
  assert.deepEqual(target.value, cloneLayout(layoutB))
  assert.equal(controller.dirty.value, false)

  controller.reset(layoutC)
  assert.deepEqual(target.value, cloneLayout(layoutC))
  assert.equal(controller.dirty.value, false)

  await controller.remove()
  assert.equal(await adapter.load('controller'), null)
  controller.stop()

  const autoTarget = ref<Layout>(layoutA)
  const autoController = useGridLayoutPersistence({
    key: 'autosave',
    kind: 'layout',
    target: autoTarget,
    adapter,
    debounceMs: 10
  })
  autoController.commit(layoutB)
  assert.equal(autoController.dirty.value, true)
  await wait(25)
  assert.equal(autoController.dirty.value, false)
  assert.ok(await adapter.load('autosave'))
  autoController.stop()

  const failing = useGridLayoutPersistence({
    key: 'failing',
    kind: 'layout',
    target: ref<Layout>(layoutA),
    adapter: {
      load: () => null,
      save: () => { throw new Error('save failed') },
      remove: () => undefined
    },
    autoSave: false
  })
  failing.commit(layoutB)
  const failResult = await failing.save()
  assert.equal(failResult.ok, false)
  assert.equal(failing.dirty.value, true)
  assert.ok(failing.error.value)
  failing.stop()

  const hanging = useGridLayoutPersistence({
    key: 'timeout',
    kind: 'layout',
    target: ref<Layout>(layoutA),
    adapter: {
      load: () => new Promise(() => undefined),
      save: () => new Promise(() => undefined),
      remove: () => new Promise(() => undefined)
    },
    timeoutMs: 10,
    autoSave: false
  })
  const timeoutLoad = await hanging.load()
  assert.equal(timeoutLoad.ok, false)
  assert.equal(timeoutLoad.error?.code, 'adapter-timeout')
  hanging.commit(layoutB)
  const timeoutSave = await hanging.save()
  assert.equal(timeoutSave.ok, false)
  assert.equal(timeoutSave.error?.code, 'adapter-timeout')
  await assert.rejects(() => hanging.remove(), (error: unknown) => {
    return Boolean(error && typeof error === 'object' && (error as { code?: string }).code === 'adapter-timeout')
  })
  hanging.stop()
}

async function testControllerConflicts() {
  const adapter = memoryPersistenceAdapter()
  const first = useGridLayoutPersistence({
    key: 'shared',
    kind: 'layout',
    target: ref<Layout>(layoutA),
    adapter,
    autoSave: false,
    sourceId: 'tab-1'
  })
  const secondTarget = ref<Layout>([])
  const second = useGridLayoutPersistence({
    key: 'shared',
    kind: 'layout',
    target: secondTarget,
    adapter,
    autoSave: false,
    sourceId: 'tab-2'
  })
  await first.save()
  await second.load()
  assert.deepEqual(secondTarget.value, cloneLayout(layoutA))

  first.commit(layoutB)
  await wait(2)
  await first.save()
  assert.deepEqual(secondTarget.value, cloneLayout(layoutB))

  second.commit(layoutC)
  first.commit(layoutA)
  await wait(2)
  await first.save()
  assert.ok(second.conflict.value)
  await second.resolveConflict('useRemote')
  assert.deepEqual(secondTarget.value, cloneLayout(layoutA))

  const newerWinsTarget = ref<Layout>(layoutA)
  const newerWins = useGridLayoutPersistence({
    key: 'newer',
    kind: 'layout',
    target: newerWinsTarget,
    adapter,
    autoSave: false,
    sourceId: 'tab-3',
    conflictStrategy: 'newer-wins'
  })
  const newerWriter = useGridLayoutPersistence({
    key: 'newer',
    kind: 'layout',
    target: ref<Layout>(layoutB),
    adapter,
    autoSave: false,
    sourceId: 'tab-4'
  })
  await newerWins.save()
  newerWins.commit(layoutC)
  newerWriter.commit(layoutB)
  await wait(2)
  await newerWriter.save()
  assert.deepEqual(newerWinsTarget.value, cloneLayout(layoutB))
  assert.equal(newerWins.dirty.value, false)

  const keepLocalTarget = ref<Layout>(layoutA)
  const keepLocal = useGridLayoutPersistence({
    key: 'keep',
    kind: 'layout',
    target: keepLocalTarget,
    adapter,
    autoSave: false,
    sourceId: 'tab-5',
    conflictStrategy: 'keep-local'
  })
  const keepWriter = useGridLayoutPersistence({
    key: 'keep',
    kind: 'layout',
    target: ref<Layout>(layoutB),
    adapter,
    autoSave: false,
    sourceId: 'tab-6'
  })
  await keepLocal.save()
  keepLocal.commit(layoutC)
  keepWriter.commit(layoutB)
  await wait(2)
  await keepWriter.save()
  assert.deepEqual(keepLocalTarget.value, cloneLayout(layoutC))
  assert.equal(keepLocal.dirty.value, true)
  assert.equal(keepLocal.conflict.value, null)

  first.stop()
  second.stop()
  newerWins.stop()
  newerWriter.stop()
  keepLocal.stop()
  keepWriter.stop()
}

async function main() {
  testSerializationAndDeserialization()
  testMigrations()
  await testAdapters()
  await testControllerState()
  await testControllerConflicts()
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
