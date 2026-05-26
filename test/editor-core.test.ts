import assert from 'assert'
import { ref } from 'vue'
import {
  applyGridEditorAlign,
  applyGridEditorDistribute,
  computeGridEditorIntelligence,
  computeGridEditorGuides,
  createGridEditorController,
  createGridEditorHistory,
  createGridEditorHistoryEntry,
  createGridEditorClipboardPayload,
  createGridEditorSelection,
  createGridEditorPlacementSession,
  createGridEditorPersistenceEnvelope,
  createGridEditorTransactionPreview,
  emptyGridEditorSectionRows,
  filterGridEditorDisplayGuides,
  getGridEditorCommandDescriptor,
  getGridEditorCommandDescriptors,
  getGridEditorKeyboardCommand,
  internalGridEditorClipboard,
  normalizeGridEditorSectionRows,
  normalizeGridEditorClipboardItemsForTarget,
  parseGridEditorClipboardPayload,
  placeGridEditorNewItems,
  updateGridEditorPlacementSession,
  readGridEditorPersistenceEnvelope,
  sanitizeEditorMetaById,
  resolveGridEditorSnap,
  systemClipboardAdapter,
  validateEditorMetaById
} from '../lib/editor'
import {
  memoryPersistenceAdapter,
  useGridLayoutPersistence
} from '../lib/persistence'
import type { GridEditorHistorySnapshot, GridEditorSectionRowState } from '../lib/editor'
import type { Layout } from '../lib/utils'

const baseLayout = (): Layout => [
  { i: 'a', x: 0, y: 0, w: 2, h: 2 },
  { i: 'b', x: 2, y: 0, w: 2, h: 2 },
  { i: 'c', x: 4, y: 0, w: 2, h: 2, static: true }
]

const keyboardEvent = (
  input: Partial<KeyboardEvent> & { key: string }
): KeyboardEvent => ({
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  target: null,
  ...input
}) as KeyboardEvent

const historySnapshot = (
  x: number,
  selectedIds: string[] = []
): GridEditorHistorySnapshot => ({
  kind: 'layout',
  layout: [{ i: 'a', x, y: 0, w: 2, h: 2 }],
  editorMetaById: {
    a: {
      label: `Widget ${x}`,
      resizeHandles: ['se'],
      data: { x }
    }
  },
  sectionRows: {
    version: 1,
    items: {
      row: {
        id: 'row',
        kind: 'row',
        order: 1,
        itemIds: ['a']
      }
    },
    itemMembership: {
      a: { rowId: 'row' }
    }
  },
  selection: createGridEditorSelection(selectedIds),
  focusId: selectedIds[0] || null
})

async function testModeAndGuard() {
  const layout = ref(baseLayout())
  const missing = createGridEditorController({ layout })
  const missingResult = await missing.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(missing.mode.value, 'view')
  assert.equal(missingResult.status, 'blocked')
  assert.equal(missingResult.blocked?.reason, 'editor-mode-missing')

  const view = createGridEditorController({ layout, defaultMode: 'view' })
  const readonly = await view.execute({ type: 'delete', targetIds: ['a'] })
  assert.equal(readonly.status, 'blocked')
  assert.equal(readonly.blocked?.reason, 'mode-readonly')

  const guardedLayout = ref(baseLayout())
  const editor = createGridEditorController({
    layout: guardedLayout,
    defaultMode: 'edit',
    beforeCommand: async () => ({ status: 'block', reason: 'before-command-blocked' })
  })
  const blocked = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 3 } })
  assert.equal(blocked.status, 'blocked')
  assert.equal(guardedLayout.value[0].x, 0)
}

async function testSelectionCapabilityAndHistory() {
  const layout = ref(baseLayout())
  const editorMetaById = ref({ b: { locked: true } })
  const editor = createGridEditorController({
    layout,
    editorMetaById,
    defaultMode: 'edit',
    commandPolicy: 'skip-blocked',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })

  await editor.execute({ type: 'select', payload: { ids: ['b'] } })
  assert.deepEqual(editor.selection.value.selectedIds, ['b'])

  await editor.execute({ type: 'select', payload: { ids: ['a', 'b'] } })
  assert.deepEqual(editor.selection.value.selectedIds, ['a'])

  await editor.execute({ type: 'select', payload: { ids: ['a', 'c'] } })
  assert.deepEqual(editor.selection.value.selectedIds, ['a'])

  const moved = await editor.execute({ type: 'move', targetIds: ['a', 'b'], payload: { dx: 1, dy: 0 } })
  assert.equal(moved.status, 'changed')
  assert.deepEqual(moved.blocked?.skippedIds, ['b'])
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)
  assert.equal(layout.value.find(item => item.i === 'b')?.x, 2)

  const resize = await editor.execute({ type: 'resize', targetIds: ['a', 'b'], payload: { w: 3, h: 3 } })
  assert.equal(resize.status, 'blocked')
  assert.equal(resize.blocked?.reason, 'multi-resize-unsupported')

  const locked = await editor.execute({ type: 'lock', targetIds: ['a'] })
  assert.equal(locked.status, 'changed')
  assert.equal(editor.editorMetaById.value.a.locked, true)

  const undone = await editor.undo()
  assert.equal(undone.status, 'changed')
  assert.equal(editor.editorMetaById.value.a?.locked, undefined)
}

async function testCommandResizeAspectRatioConstraints() {
  const layout = ref<Layout>([
    { i: 'video', x: 0, y: 0, w: 2, h: 2 }
  ])
  const previews: unknown[] = []
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: null,
      allowOverlap: false,
      preventCollision: false
    },
    resizeConstraints: {
      video: {
        enabled: true,
        ratio: 2,
        ratioKind: 'visual-px',
        source: 'explicit',
        fallbackPolicy: 'block',
        edgeHandles: [],
        metrics: { colWidth: 100, rowHeight: 100, margin: [0, 0] as [number, number] }
      }
    },
    beforeCommand: context => {
      if (context.command.type === 'resize') previews.push(context.preview)
      return { status: 'allow' }
    }
  })

  const resized = await editor.execute({
    type: 'resize',
    targetIds: ['video'],
    payload: { w: 4, h: 4, handle: 'se' }
  })
  assert.equal(resized.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'video')?.w, 4)
  assert.equal(layout.value.find(item => item.i === 'video')?.h, 2)
  assert.equal(resized.diagnostics?.operationResult?.diagnostics?.operationType, 'resize')
  assert.ok(resized.layoutPatches.some(patch => patch.type === 'resize' && patch.to.h === 2))
  const preview = previews[0] as { layoutPatches?: Array<{ type: string; to?: { h?: number } }> } | undefined
  assert.ok(preview?.layoutPatches?.some(patch => patch.type === 'resize' && patch.to?.h === 2))

  const missingMetricsLayout = ref<Layout>([
    { i: 'video', x: 0, y: 0, w: 2, h: 2 }
  ])
  const missingMetricsEditor = createGridEditorController({
    layout: missingMetricsLayout,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: null,
      allowOverlap: false,
      preventCollision: false
    },
    resizeConstraints: {
      video: {
        enabled: true,
        ratio: 2,
        ratioKind: 'visual-px',
        source: 'explicit',
        fallbackPolicy: 'block',
        edgeHandles: []
      }
    }
  })
  const blocked = await missingMetricsEditor.execute({
    type: 'resize',
    targetIds: ['video'],
    payload: { w: 4, h: 4, handle: 'se' }
  })
  assert.equal(blocked.status, 'blocked')
  assert.equal(blocked.blocked?.reason, 'metrics-missing')
  assert.equal(missingMetricsLayout.value.find(item => item.i === 'video')?.h, 2)
}

async function testGroupMoveCommands() {
  const unsupportedLayout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 }
  ])
  const unsupported = createGridEditorController({
    layout: unsupportedLayout,
    defaultMode: 'edit'
  })
  await unsupported.execute({ type: 'select', payload: { ids: ['a', 'b'] } })
  const unsupportedMove = await unsupported.execute({ type: 'move', source: 'keyboard', payload: { dx: 1, dy: 0 } })
  assert.equal(unsupportedMove.status, 'blocked')
  assert.equal(unsupportedMove.blocked?.reason, 'unsupported')
  assert.equal(unsupportedLayout.value.find(item => item.i === 'a')?.x, 0)

  const layout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 },
    { i: 'c', x: 4, y: 0, w: 2, h: 1 }
  ])
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false,
      diagnostics: { debug: true }
    }
  })
  await editor.execute({ type: 'select', payload: { ids: ['a', 'b'] } })
  const moved = await editor.execute({
    type: 'move',
    source: 'keyboard',
    payload: { dx: 1, dy: 1 },
    history: { mergeKey: 'keyboard-move', mergeWindowMs: 650 }
  })
  assert.equal(moved.status, 'changed')
  assert.equal(moved.diagnostics?.operationResult?.diagnostics?.operationType, 'groupMove')
  assert.deepEqual(moved.layoutPatches.filter(patch => patch.type === 'move').map(patch => patch.id).sort(), ['a', 'b'])
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)
  assert.equal(layout.value.find(item => item.i === 'b')?.x, 3)
  assert.deepEqual(editor.selection.value.selectedIds, ['a', 'b'])
  const undone = await editor.undo()
  assert.equal(undone.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 0)
  assert.deepEqual(editor.selection.value.selectedIds, ['a', 'b'])
  const redone = await editor.redo()
  assert.equal(redone.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)

  const explicit = await editor.execute({
    type: 'move',
    targetIds: ['a', 'b'],
    payload: { dx: 2, dy: 1 }
  })
  assert.equal(explicit.status, 'changed')
  assert.equal(explicit.diagnostics?.operationResult?.diagnostics?.operationType, 'groupMove')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 3)
  assert.equal(layout.value.find(item => item.i === 'b')?.x, 5)

  const absoluteSingleLayout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 }
  ])
  const absoluteSingle = createGridEditorController({
    layout: absoluteSingleLayout,
    defaultMode: 'edit'
  })
  const single = await absoluteSingle.execute({ type: 'move', targetIds: ['a'], payload: { x: 5, y: 4 } })
  assert.equal(single.status, 'changed')
  assert.equal(single.diagnostics?.operationResult, undefined)
  assert.equal(absoluteSingleLayout.value.find(item => item.i === 'a')?.x, 5)
  assert.equal(absoluteSingleLayout.value.find(item => item.i === 'a')?.y, 4)

  const skipLayout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 1, y: 0, w: 1, h: 1 },
    { i: 'c', x: 2, y: 0, w: 1, h: 1 }
  ])
  const skip = createGridEditorController({
    layout: skipLayout,
    defaultMode: 'edit',
    commandPolicy: 'skip-blocked',
    editorMetaById: ref({ b: { locked: true } }),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  await skip.execute({ type: 'select', payload: { ids: ['a', 'b', 'c'] } })
  assert.deepEqual(skip.selection.value.selectedIds, ['a', 'c'])
  const skipMove = await skip.execute({ type: 'move', targetIds: ['a', 'b', 'c'], payload: { dx: 1, dy: 0 } })
  assert.equal(skipMove.status, 'changed')
  assert.deepEqual(skipMove.blocked?.skippedIds, ['b'])
  assert.equal(skipMove.diagnostics?.operationResult?.diagnostics?.operationType, 'groupMove')
  assert.equal(skipLayout.value.find(item => item.i === 'a')?.x, 1)
  assert.equal(skipLayout.value.find(item => item.i === 'c')?.x, 3)
  assert.equal(skipLayout.value.find(item => item.i === 'b')?.x, 1)

  const skipSingleAllowedLayout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 1, y: 0, w: 1, h: 1 },
    { i: 'c', x: 2, y: 0, w: 1, h: 1 }
  ])
  const skipSingleAllowed = createGridEditorController({
    layout: skipSingleAllowedLayout,
    defaultMode: 'edit',
    commandPolicy: 'skip-blocked',
    editorMetaById: ref({ b: { locked: true } }),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: true
    }
  })
  await skipSingleAllowed.execute({ type: 'select', payload: { ids: ['a', 'b'] } })
  assert.deepEqual(skipSingleAllowed.selection.value.selectedIds, ['a'])
  const skipSingleBlocked = await skipSingleAllowed.execute({
    type: 'move',
    targetIds: ['a', 'b'],
    payload: { dx: 2, dy: 0 }
  })
  assert.equal(skipSingleBlocked.status, 'blocked')
  assert.equal(skipSingleBlocked.blocked?.reason, 'collision')
  assert.deepEqual(skipSingleBlocked.blocked?.skippedIds, ['b'])
  assert.equal(skipSingleBlocked.diagnostics?.operationResult?.diagnostics?.operationType, 'groupMove')
  assert.equal(skipSingleAllowedLayout.value.find(item => item.i === 'a')?.x, 0)

  const blockedLayout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 },
    { i: 'c', x: 4, y: 0, w: 2, h: 1 }
  ])
  const events: string[] = []
  const blocked = createGridEditorController({
    layout: blockedLayout,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: true
    },
    onEvent: event => events.push(event.type)
  })
  await blocked.execute({ type: 'select', payload: { ids: ['a', 'b'] } })
  const blockedMove = await blocked.execute({ type: 'move', payload: { dx: 1, dy: 0 } })
  assert.equal(blockedMove.status, 'blocked')
  assert.equal(blockedMove.blocked?.reason, 'collision')
  assert.ok(events.includes('command-blocked'))
  assert.equal(blockedLayout.value.find(item => item.i === 'a')?.x, 0)

  const responsiveLayouts = ref({
    lg: [
      { i: 'r-a', x: 0, y: 0, w: 2, h: 1 },
      { i: 'r-b', x: 2, y: 0, w: 2, h: 1 }
    ],
    sm: [
      { i: 'r-a', x: 0, y: 0, w: 1, h: 1 },
      { i: 'r-b', x: 1, y: 0, w: 1, h: 1 }
    ]
  })
  const responsive = createGridEditorController({
    kind: 'responsive',
    layouts: responsiveLayouts,
    breakpoint: ref('lg'),
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const responsiveResult = await responsive.execute({
    type: 'move',
    targetIds: ['r-a', 'r-b'],
    payload: { dx: 1, dy: 0 }
  })
  assert.equal(responsiveResult.status, 'changed')
  assert.equal(responsiveLayouts.value.lg.find(item => item.i === 'r-a')?.x, 1)
  assert.equal(responsiveLayouts.value.lg.find(item => item.i === 'r-b')?.x, 3)
  assert.equal(responsiveLayouts.value.sm.find(item => item.i === 'r-a')?.x, 0)
  assert.equal(responsiveLayouts.value.sm.find(item => item.i === 'r-b')?.x, 1)
}

async function testMetadataClipboardAndPaste() {
  const unsafe = validateEditorMetaById(JSON.parse('{"__proto__":{"locked":true}}'))
  assert.equal(unsafe.ok, false)

  const orphan = validateEditorMetaById({
    a: { locked: true, data: { ok: true } },
    orphan: { visible: false }
  }, { layout: baseLayout() })
  assert.equal(orphan.ok, true)
  assert.equal(orphan.value.a.locked, true)
  assert.equal(orphan.value.orphan, undefined)
  assert.ok(orphan.warnings.some(warning => warning.code === 'orphan-meta'))

  const sanitized = sanitizeEditorMetaById({ a: { visible: false, label: 'A' } })
  assert.equal(sanitized.a.visible, false)

  const layout = ref(baseLayout())
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    clipboard: internalGridEditorClipboard,
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  await editor.execute({ type: 'select', payload: { ids: ['a'] } })
  const copied = await editor.execute({ type: 'copy' })
  assert.equal(copied.status, 'changed')
  const copiedPayload = await internalGridEditorClipboard.read()
  assert.equal(copiedPayload?.version, 2)
  assert.equal(copiedPayload?.version === 2 ? copiedPayload.source?.cols : undefined, 12)
  const pasted = await editor.execute({ type: 'paste', payload: { cols: 12, strategy: 'first-fit' } })
  assert.equal(pasted.status, 'changed')
  assert.ok(layout.value.some(item => item.i === 'a-copy'))

  const legacyPayload = parseGridEditorClipboardPayload({
    version: 1,
    sourceId: 'legacy',
    copiedAt: '2026-05-20T00:00:00.000Z',
    items: [{ i: 'legacy', x: 0, y: 0, w: 2, h: 1 }],
    editorMetaById: {}
  })
  assert.equal(legacyPayload?.version, 1)

  const responsivePayload = createGridEditorClipboardPayload({
    sourceId: 'responsive-copy',
    items: [
      { i: 'wide', x: 6, y: 0, w: 6, h: 2 },
      { i: 'side', x: 12, y: 0, w: 4, h: 1 }
    ],
    editorMetaById: {},
    source: { cols: 24, breakpoint: 'desktop' }
  })
  const normalizedResponsive = normalizeGridEditorClipboardItemsForTarget(responsivePayload, { cols: 12 })
  assert.equal(responsivePayload.version, 2)
  assert.equal(normalizedResponsive.scaled, true)
  assert.equal(normalizedResponsive.items.find(item => item.i === 'wide')?.x, 0)
  assert.equal(normalizedResponsive.items.find(item => item.i === 'wide')?.w, 3)
  assert.equal(normalizedResponsive.items.find(item => item.i === 'side')?.x, 3)
  assert.equal(normalizedResponsive.items.find(item => item.i === 'side')?.w, 2)

  const responsivePasteLayout = ref<Layout>([])
  const responsiveEditor = createGridEditorController({
    layout: responsivePasteLayout,
    defaultMode: 'edit',
    clipboard: internalGridEditorClipboard
  })
  await internalGridEditorClipboard.write(responsivePayload)
  const responsivePaste = await responsiveEditor.execute({
    type: 'paste',
    payload: { cols: 12, strategy: 'first-fit' }
  })
  assert.equal(responsivePaste.status, 'changed')
  assert.equal(responsivePasteLayout.value.find(item => item.i === 'wide-copy')?.w, 3)

  const system = systemClipboardAdapter()
  await assert.rejects(async () => system.read(), /System clipboard|Failed to read/)
}

async function testPlacementPolicies() {
  const emptyFirst = placeGridEditorNewItems([], [
    { i: 'new', x: 6, y: 6, w: 2, h: 2 }
  ], 'first-fit', { cols: 6, maxRows: 6 })
  assert.equal(emptyFirst.failed, false)
  assert.equal(emptyFirst.layout.find(item => item.i === 'new')?.x, 0)
  assert.equal(emptyFirst.layout.find(item => item.i === 'new')?.y, 0)
  assert.equal(emptyFirst.summary.strategy, 'first-fit')

  const firstRowGap = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 4, y: 0, w: 2, h: 1 }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 1 }], 'first-fit', { cols: 6, maxRows: 4 })
  assert.equal(firstRowGap.layout.find(item => item.i === 'new')?.x, 2)
  assert.equal(firstRowGap.layout.find(item => item.i === 'new')?.y, 0)

  const nextRow = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 },
    { i: 'c', x: 4, y: 0, w: 2, h: 1 }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 1 }], 'first-fit', { cols: 6, maxRows: 4 })
  assert.equal(nextRow.layout.find(item => item.i === 'new')?.x, 0)
  assert.equal(nextRow.layout.find(item => item.i === 'new')?.y, 1)

  const occupiedByNonRendered = placeGridEditorNewItems([
    { i: 'hidden', x: 0, y: 0, w: 2, h: 1 },
    { i: 'static', x: 2, y: 0, w: 2, h: 1, static: true },
    { i: 'locked', x: 4, y: 0, w: 2, h: 1, isDraggable: false }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 1 }], 'first-fit', { cols: 6, maxRows: 4 })
  assert.equal(occupiedByNonRendered.layout.find(item => item.i === 'new')?.x, 0)
  assert.equal(occupiedByNonRendered.layout.find(item => item.i === 'new')?.y, 1)

  const explicitCursor = placeGridEditorNewItems([
    { i: 'revenue', x: 0, y: 0, w: 4, h: 3 },
    { i: 'pipeline', x: 4, y: 0, w: 4, h: 3 },
    { i: 'health', x: 8, y: 0, w: 4, h: 3 },
    { i: 'incidents', x: 0, y: 3, w: 5, h: 3 },
    { i: 'region', x: 5, y: 3, w: 7, h: 3 }
  ], [{ i: 'incident-copy', x: 0, y: 0, w: 5, h: 3 }], 'cursor', {
    cols: 12,
    maxRows: Infinity,
    cursor: { x: 8, y: 3 },
    placementIntent: 'here',
    placementAnchor: 'top-left'
  })
  assert.equal(explicitCursor.failed, false)
  assert.equal(explicitCursor.layout.find(item => item.i === 'incident-copy')?.x, 7)
  assert.equal(explicitCursor.layout.find(item => item.i === 'incident-copy')?.y, 6)
  assert.equal(explicitCursor.summary.diagnostics.some(item => item.code === 'grid-editor.placement.cursor-anchor'), true)

  const layoutPush = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 2 }], 'cursor', {
    cols: 4,
    maxRows: 8,
    cursor: { x: 0, y: 0 },
    placementIntent: 'here',
    placementAnchor: 'top-left',
    collisionPolicy: 'layout',
    compactType: 'vertical',
    allowOverlap: false,
    preventCollision: false
  })
  assert.equal(layoutPush.failed, false)
  assert.equal(layoutPush.layout.find(item => item.i === 'new')?.x, 0)
  assert.equal(layoutPush.layout.find(item => item.i === 'new')?.y, 0)
  assert.equal(layoutPush.layout.find(item => item.i === 'a')?.y, 2)
  assert.deepEqual(layoutPush.summary.shiftedIds, ['a'])
  assert.equal(layoutPush.summary.collisionPolicy, 'layout')

  const layoutPushGroup = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 }
  ], [
    { i: 'g1', x: 8, y: 5, w: 2, h: 1 },
    { i: 'g2', x: 10, y: 5, w: 2, h: 1 }
  ], 'cursor', {
    cols: 4,
    maxRows: 8,
    cursor: { x: 0, y: 0 },
    placementIntent: 'here',
    placementAnchor: 'top-left',
    collisionPolicy: 'layout',
    compactType: 'vertical',
    allowOverlap: false,
    preventCollision: false
  })
  assert.equal(layoutPushGroup.failed, false)
  assert.equal(layoutPushGroup.layout.find(item => item.i === 'g1')?.x, 0)
  assert.equal(layoutPushGroup.layout.find(item => item.i === 'g2')?.x, 2)
  assert.equal(layoutPushGroup.layout.find(item => item.i === 'a')?.y, 1)
  assert.equal(layoutPushGroup.layout.find(item => item.i === 'b')?.y, 1)
  assert.deepEqual(layoutPushGroup.summary.shiftedIds, ['a', 'b'])

  const layoutPushGroupCollision = placeGridEditorNewItems([], [
    { i: 'g1', x: 0, y: 0, w: 2, h: 1 },
    { i: 'g2', x: 1, y: 0, w: 2, h: 1 }
  ], 'cursor', {
    cols: 4,
    maxRows: 8,
    cursor: { x: 0, y: 0 },
    placementIntent: 'here',
    placementAnchor: 'top-left',
    collisionPolicy: 'layout',
    compactType: 'vertical',
    allowOverlap: false,
    preventCollision: false
  })
  assert.equal(layoutPushGroupCollision.failed, true)
  assert.equal(layoutPushGroupCollision.blocked?.reason, 'collision')

  const layoutPrevented = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 2 }], 'cursor', {
    cols: 4,
    maxRows: 8,
    cursor: { x: 0, y: 0 },
    placementIntent: 'here',
    placementAnchor: 'top-left',
    collisionPolicy: 'layout',
    compactType: 'vertical',
    allowOverlap: false,
    preventCollision: true
  })
  assert.equal(layoutPrevented.failed, true)
  assert.equal(layoutPrevented.blocked?.reason, 'collision')
  assert.equal(layoutPrevented.layout.find(item => item.i === 'new')?.x, 0)

  const layoutOverlap = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 2 }], 'cursor', {
    cols: 4,
    maxRows: 8,
    cursor: { x: 0, y: 0 },
    placementIntent: 'here',
    placementAnchor: 'top-left',
    collisionPolicy: 'layout',
    compactType: 'vertical',
    allowOverlap: true,
    preventCollision: false
  })
  assert.equal(layoutOverlap.failed, false)
  assert.equal(layoutOverlap.layout.find(item => item.i === 'new')?.y, 0)
  assert.equal(layoutOverlap.layout.find(item => item.i === 'a')?.y, 0)
  assert.deepEqual(layoutOverlap.summary.shiftedIds, [])

  const largerItem = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 1, h: 2 },
    { i: 'b', x: 3, y: 0, w: 1, h: 2 }
  ], [{ i: 'wide', x: 0, y: 0, w: 2, h: 2 }], 'first-fit', { cols: 4, maxRows: 4 })
  assert.equal(largerItem.layout.find(item => item.i === 'wide')?.x, 1)
  assert.equal(largerItem.layout.find(item => item.i === 'wide')?.y, 0)

  const firstFitBlocked = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 1, y: 0, w: 1, h: 1 }
  ], [{ i: 'new', x: 0, y: 0, w: 1, h: 1 }], 'first-fit', { cols: 2, maxRows: 1 })
  assert.equal(firstFitBlocked.failed, true)
  assert.equal(firstFitBlocked.layout.length, 2)
  assert.equal(firstFitBlocked.blocked?.reason, 'maxRows')

  const topEmpty = placeGridEditorNewItems([], [
    { i: 'new', x: 4, y: 8, w: 2, h: 2 }
  ], 'insert-top-shift', { cols: 6, maxRows: 8 })
  assert.equal(topEmpty.failed, false)
  assert.equal(topEmpty.layout.find(item => item.i === 'new')?.x, 0)
  assert.equal(topEmpty.layout.find(item => item.i === 'new')?.y, 0)
  assert.deepEqual(topEmpty.summary.shiftedIds, [])

  const shifted = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 3, y: 3, w: 2, h: 1, static: true }
  ], [{ i: 'new', x: 8, y: 8, w: 3, h: 3 }], 'insert-top-shift', { cols: 6, maxRows: 10 })
  assert.equal(shifted.failed, false)
  assert.equal(shifted.layout.find(item => item.i === 'new')?.x, 0)
  assert.equal(shifted.layout.find(item => item.i === 'a')?.y, 3)
  assert.equal(shifted.layout.find(item => item.i === 'b')?.y, 6)
  assert.deepEqual(shifted.summary.shiftedIds.sort(), ['a', 'b'])
  assert.deepEqual(shifted.summary.delta, { dx: 0, dy: 3 })

  const group = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 }
  ], [
    { i: 'g1', x: 4, y: 5, w: 2, h: 1 },
    { i: 'g2', x: 6, y: 5, w: 2, h: 2 }
  ], 'insert-top-shift', { cols: 6, maxRows: 8 })
  assert.equal(group.failed, false)
  assert.equal(group.layout.find(item => item.i === 'g1')?.x, 0)
  assert.equal(group.layout.find(item => item.i === 'g2')?.x, 2)
  assert.equal(group.layout.find(item => item.i === 'a')?.y, 2)

  const shiftBlocked = placeGridEditorNewItems([
    { i: 'a', x: 0, y: 2, w: 2, h: 2 }
  ], [{ i: 'new', x: 0, y: 0, w: 2, h: 2 }], 'insert-top-shift', { cols: 6, maxRows: 3 })
  assert.equal(shiftBlocked.failed, true)
  assert.equal(shiftBlocked.blocked?.reason, 'maxRows')
  assert.equal(shiftBlocked.layout.find(item => item.i === 'a')?.y, 2)

  const groupCollision = placeGridEditorNewItems([], [
    { i: 'g1', x: 0, y: 0, w: 2, h: 2 },
    { i: 'g2', x: 1, y: 0, w: 2, h: 2 }
  ], 'insert-top-shift', { cols: 6, maxRows: 6 })
  assert.equal(groupCollision.failed, true)
  assert.equal(groupCollision.blocked?.reason, 'collision')

  const layout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'locked', x: 3, y: 0, w: 2, h: 2, static: true }
  ])
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 6,
      maxRows: 8,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const add = await editor.execute({
    type: 'add',
    payload: {
      item: { i: 'top', w: 2, h: 2 },
      strategy: 'insert-top-shift',
      cols: 6,
      maxRows: 8
    }
  })
  assert.equal(add.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'top')?.y, 0)
  assert.equal(layout.value.find(item => item.i === 'locked')?.y, 2)
  assert.ok(add.affectedIds.includes('top'))
  assert.ok(add.affectedIds.includes('locked'))
  assert.ok(add.layoutPatches.some(patch => patch.type === 'move' && patch.id === 'locked'))
  assert.deepEqual(add.diagnostics?.computed?.placement?.shiftedIds.sort(), ['a', 'locked'])

  const beforeBlocked = layout.value.map(item => ({ ...item }))
  const blocked = await editor.execute({
    type: 'add',
    payload: {
      item: { i: 'too-tall', w: 2, h: 7 },
      strategy: 'insert-top-shift',
      cols: 6,
      maxRows: 8
    }
  })
  assert.equal(blocked.status, 'blocked')
  assert.deepEqual(layout.value, beforeBlocked)
}

async function testKeyboardShortcuts() {
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'z', ctrlKey: true }), { platform: 'standard' })?.type,
    'undo'
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'z', ctrlKey: true, shiftKey: true }), { platform: 'standard' })?.type,
    'redo'
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'y', ctrlKey: true }), { platform: 'standard' })?.type,
    'redo'
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'z', metaKey: true }), { platform: 'mac' })?.type,
    'undo'
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'z', metaKey: true, shiftKey: true }), { platform: 'mac' })?.type,
    'redo'
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'y', metaKey: true }), { platform: 'mac' }),
    null
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'ArrowRight', ctrlKey: true }), { platform: 'standard' }),
    null
  )
  assert.equal(
    getGridEditorKeyboardCommand(keyboardEvent({ key: 'Backspace', target: { tagName: 'INPUT' } as never }), { platform: 'standard' }),
    null
  )

  const layout = ref(baseLayout())
  const editor = createGridEditorController({ layout, defaultMode: 'edit' })
  await editor.execute({ type: 'select', payload: { ids: ['b'] } })

  const deleteCommand = getGridEditorKeyboardCommand(
    keyboardEvent({ key: 'Delete' }),
    { platform: 'standard' }
  )
  assert.equal(deleteCommand?.type, 'delete')
  await editor.execute(deleteCommand!)
  assert.equal(layout.value.some(item => item.i === 'b'), false)

  const undoCommand = getGridEditorKeyboardCommand(
    keyboardEvent({ key: 'z', ctrlKey: true }),
    { platform: 'standard' }
  )
  assert.equal(undoCommand?.type, 'undo')
  const undone = await editor.execute(undoCommand!)
  assert.equal(undone.status, 'changed')
  assert.equal(layout.value.some(item => item.i === 'b'), true)

  const redoCommand = getGridEditorKeyboardCommand(
    keyboardEvent({ key: 'y', ctrlKey: true }),
    { platform: 'standard' }
  )
  assert.equal(redoCommand?.type, 'redo')
  const redone = await editor.execute(redoCommand!)
  assert.equal(redone.status, 'changed')
  assert.equal(layout.value.some(item => item.i === 'b'), false)
}

async function testPersistenceBridgeAndGuides() {
  const layout = ref(baseLayout())
  const editorMetaById = ref({ a: { locked: true } })
  const adapter = memoryPersistenceAdapter()
  const persistence = useGridLayoutPersistence({
    key: 'editor-core',
    kind: 'layout',
    target: layout,
    adapter,
    autoSave: false,
    meta: () => ({ editor: createGridEditorPersistenceEnvelope(editorMetaById.value) })
  })
  const saved = await persistence.save()
  assert.equal(saved.ok, true)
  const envelope = readGridEditorPersistenceEnvelope(saved.document)
  assert.equal(envelope.ok, true)
  assert.equal(envelope.envelope?.editorMetaById.a.locked, true)

  const invalidEnvelope = readGridEditorPersistenceEnvelope({
    ...saved.document!,
    meta: { editor: { version: 1, editorMetaById: { a: { locked: 'yes' } } } }
  })
  assert.equal(invalidEnvelope.ok, false)

  const guides = computeGridEditorGuides(
    baseLayout(),
    { i: 'x', x: 0, y: 2, w: 2, h: 2 },
    { i: 'x', x: 2, y: 0, w: 2, h: 2 },
    {},
    { thresholdPx: 0, snap: true }
  )
  assert.ok(guides.guides.length > 0)
  assert.equal(guides.snappedGuideIds.length, 1)
  const sorted = guides.guides.slice().sort((a, b) => a.distance - b.distance || a.priority - b.priority || a.id.localeCompare(b.id))
  assert.equal(guides.guides[0].id, sorted[0].id)

  const displayDrag = computeGridEditorGuides(
    [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 },
      { i: 'b', x: 2, y: 0, w: 2, h: 2 },
      { i: 'c', x: 4, y: 0, w: 2, h: 2 },
      { i: 'd', x: 2, y: 2, w: 2, h: 2 }
    ],
    { i: 'x', x: 0, y: 0, w: 2, h: 2 },
    { i: 'x', x: 2, y: 0, w: 2, h: 2 },
    {},
    { thresholdPx: 10, snap: true, interaction: 'drag' }
  )
  assert.ok(displayDrag.guides.length >= (displayDrag.displayGuides?.length || 0))
  assert.ok((displayDrag.displayGuides?.length || 0) <= 3)
  assert.equal(filterGridEditorDisplayGuides(displayDrag.guides, { interaction: 'resize' }, displayDrag.snappedGuideIds).length, 2)

  const spacingGuides = computeGridEditorGuides(
    [{ i: 'left', x: 0, y: 0, w: 2, h: 5 }],
    { i: 'x', x: 3, y: 1, w: 2, h: 1 },
    { i: 'x', x: 3, y: 1, w: 2, h: 1 },
    {},
    { thresholdPx: 0, snap: true, interaction: 'drop' }
  )
  assert.equal(spacingGuides.displayGuides?.length, 1)
  assert.equal(spacingGuides.displayGuides?.[0].display?.label, '1 col')
  assert.equal(spacingGuides.spacingLabelGuideIds?.length, 1)

  const debugGuides = computeGridEditorGuides(
    baseLayout(),
    { i: 'x', x: 0, y: 2, w: 2, h: 2 },
    { i: 'x', x: 2, y: 0, w: 2, h: 2 },
    {},
    { thresholdPx: 10, debug: 'layer', interaction: 'drag' }
  )
  assert.equal(debugGuides.debug, true)
  assert.equal(debugGuides.debugGuides?.length, debugGuides.guides.length)
  assert.ok((debugGuides.displayGuides?.length || 0) <= 3)

  const largeGuides = computeGridEditorGuides(
    Array.from({ length: 520 }, (_item, index) => ({
      i: `large-${index}`,
      x: index % 12,
      y: Math.floor(index / 12),
      w: 1,
      h: 1
    })),
    { i: 'x', x: 0, y: 0, w: 1, h: 1 },
    { i: 'x', x: 1, y: 0, w: 1, h: 1 },
    {},
    { thresholdPx: 1, maxItems: 500, interaction: 'drag' }
  )
  assert.equal(largeGuides.diagnostics?.degraded, true)
  assert.equal(largeGuides.diagnostics?.reason, 'max-items')
  assert.ok((largeGuides.displayGuides?.length || 0) <= 3)
}

async function testPredictiveGuidesAndChips() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 3, h: 3 },
    { i: 'b', x: 7, y: 0, w: 3, h: 3 },
    { i: 'c', x: 0, y: 6, w: 3, h: 3 }
  ]
  const candidate = { i: 'x', x: 4, y: 0, w: 2, h: 3 }

  const predictive = computeGridEditorGuides(layout, candidate, candidate, {}, {
    predictRadiusX: 2,
    predictRadiusY: 1,
    snapThresholdCells: 0.5,
    snap: true,
    interaction: 'drag',
    itemLabels: { x: 'Pipeline' }
  })
  assert.ok(predictive.guides.some(guide => guide.proximity !== undefined && guide.proximity > 0))
  assert.ok(predictive.guides.some(guide => guide.isPredictive === true))
  assert.ok(predictive.diagnostics?.predictCount && predictive.diagnostics.predictCount > 0)
  const sourceMate = predictive.guides.find(guide => guide.sourceIds.includes('a') && guide.targetEdge === 'top')
  assert.ok(sourceMate)
  assert.ok(sourceMate?.isSnapped)
  assert.ok((predictive.anchorEdges?.length || 0) > 0)
  const activeAnchor = predictive.anchorEdges?.find(edge => edge.role === 'active')
  assert.ok(activeAnchor)
  assert.ok(activeAnchor?.sides && activeAnchor.sides.length > 0)

  const chips = predictive.spacingChips || []
  assert.ok(chips.length >= 2)
  const leftChip = chips.find(chip => chip.side === 'left')
  const rightChip = chips.find(chip => chip.side === 'right')
  assert.ok(leftChip && rightChip)
  assert.equal(leftChip?.unit, 'col')
  assert.equal(rightChip?.unit, 'col')
  assert.equal(leftChip?.isEqual, true)
  assert.equal(rightChip?.isEqual, true)

  const hud = predictive.measurementHud
  assert.ok(hud)
  assert.equal(hud?.itemId, 'x')
  assert.equal(hud?.label, 'Pipeline')
  assert.equal(hud?.size.w, 2)
  assert.equal(hud?.size.h, 3)
  assert.equal(hud?.position.x, 4)
  assert.equal(hud?.interaction, 'drag')

  const noChips = computeGridEditorGuides(layout, candidate, candidate, {}, {
    showSpacingChips: false,
    showMeasurementHud: false
  })
  assert.equal(noChips.spacingChips?.length, 0)
  assert.equal(noChips.measurementHud, null)

  const blockedHud = computeGridEditorGuides(layout, candidate, candidate, {}, {
    blocked: { reason: 'collision', message: 'Collides with B' },
    delta: { dw: 1 },
    interaction: 'resize'
  })
  assert.equal(blockedHud.measurementHud?.blocked, 'collision')
  assert.equal(blockedHud.measurementHud?.blockedMessage, 'Collides with B')
  assert.equal(blockedHud.measurementHud?.delta?.dw, 1)

  const sectionMatesOff = computeGridEditorGuides(layout, candidate, candidate, {}, {
    sectionSnap: false
  })
  const sectionMatesOn = computeGridEditorGuides(layout, candidate, candidate, {}, {
    sectionSnap: true
  })
  const targetGuideOff = sectionMatesOff.guides.find(guide => guide.id === sourceMate?.id)
  const targetGuideOn = sectionMatesOn.guides.find(guide => guide.id === sourceMate?.id)
  assert.ok(targetGuideOff && targetGuideOn)
  assert.ok((targetGuideOn?.priority || 0) < (targetGuideOff?.priority || 0))

  const noChipsBelowMin = computeGridEditorGuides(
    [{ i: 'left', x: 0, y: 0, w: 2, h: 2 }],
    { i: 'x', x: 2, y: 0, w: 2, h: 2 },
    { i: 'x', x: 2, y: 0, w: 2, h: 2 },
    {},
    { spacingChipMinDistance: 1 }
  )
  assert.equal(noChipsBelowMin.spacingChips?.find(chip => chip.side === 'left'), undefined)
}

async function testL3IntelligenceSnapCommandsAndSectionRows() {
  const layout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 4, y: 2, w: 2, h: 1 },
    { i: 'c', x: 8, y: 4, w: 2, h: 1 }
  ])
	  const sectionRows = ref<GridEditorSectionRowState>({
	    version: 1 as const,
	    items: {
	      row1: { id: 'row1', kind: 'row' as const, order: 1, bounds: { x: 0, y: 0, w: 12, h: 6 }, itemIds: ['a', 'b', 'c'] }
	    },
    itemMembership: {
      a: { rowId: 'row1' },
      b: { rowId: 'row1' },
      c: { rowId: 'row1' }
    }
  })
  const editor = createGridEditorController({
    layout,
    sectionRows,
    defaultMode: 'edit',
    commandPolicy: 'skip-blocked'
  })

  await editor.execute({ type: 'select', payload: { ids: ['a', 'b', 'c'] } })
  const intelligence = computeGridEditorIntelligence({
    layout: layout.value,
    activeItem: layout.value[0],
    candidateItem: { ...layout.value[0], x: 4 },
    selectionIds: editor.selection.value.selectedIds,
    sectionRows: editor.sectionRows.value,
    cols: 12,
    interaction: 'drag',
    options: { thresholdPx: 2, snap: true, cols: 12 }
  })
  assert.equal(intelligence.diagnostics.itemCount, 3)
  assert.ok(intelligence.diagnostics.codes.includes('grid-editor.intelligence.computed'))
  assert.ok(intelligence.distributionCandidates.length > 0)

  const largeIntelligence = computeGridEditorIntelligence({
    layout: Array.from({ length: 520 }, (_item, index) => ({
      i: `large-${index}`,
      x: index % 12,
      y: Math.floor(index / 12),
      w: 1,
      h: 1
    })),
    activeItem: { i: 'large-0', x: 0, y: 0, w: 1, h: 1 },
    candidateItem: { i: 'large-0', x: 1, y: 0, w: 1, h: 1 },
    selectionIds: ['large-0'],
    cols: 12,
    interaction: 'drag',
    options: { maxItems: 500, maxDurationMs: 100 }
  })
  assert.equal(largeIntelligence.diagnostics.degraded, true)
  assert.equal(largeIntelligence.diagnostics.reason, 'max-items')
  assert.ok(largeIntelligence.diagnostics.durationMs < 1000)

	  const snap = resolveGridEditorSnap(
	    intelligence,
	    { ...layout.value[0], x: 4 },
	    { layout: layout.value, cols: 12, snap: true, allowOverlap: true }
	  )
	  assert.equal(snap.status, 'snapped')
	  assert.ok(snap.snapKind === 'edge' || snap.snapKind === 'center' || snap.snapKind === 'section-row')

	  const spacingLayout: Layout = [
	    { i: 'left', x: 0, y: 0, w: 1, h: 1 },
	    { i: 'middle', x: 3, y: 0, w: 1, h: 1 },
	    { i: 'active', x: 8, y: 0, w: 1, h: 1 }
	  ]
		  const spacingIntelligence = computeGridEditorIntelligence({
		    layout: spacingLayout,
		    activeItem: spacingLayout[2],
		    candidateItem: { ...spacingLayout[2], x: 5.95, y: 0.2 },
		    selectionIds: ['active'],
		    cols: 12,
		    interaction: 'drag',
		    options: { snapThresholdCells: 0.1, snap: true }
		  })
		  const spacingSnap = resolveGridEditorSnap(
		    spacingIntelligence,
		    { ...spacingLayout[2], x: 5.95, y: 0.2 },
		    { layout: spacingLayout, cols: 12, snap: true, allowOverlap: true }
		  )
	  assert.equal(spacingSnap.status, 'snapped')
	  assert.equal(spacingSnap.snapKind, 'spacing')
	  assert.equal(spacingSnap.geometry.x, 6)

	  const sectionIntelligence = computeGridEditorIntelligence({
	    layout: layout.value,
	    activeItem: { i: 'drop', x: 0.2, y: 1.2, w: 2, h: 1 },
	    candidateItem: { i: 'drop', x: 0.2, y: 1.2, w: 2, h: 1 },
	    sectionRows: editor.sectionRows.value,
	    cols: 12,
	    interaction: 'drop',
	    options: { snapThresholdCells: 0.5, snap: true }
	  })
	  const sectionSnap = resolveGridEditorSnap(
	    sectionIntelligence,
	    { i: 'drop', x: 0.2, y: 1.2, w: 2, h: 1 },
	    { layout: layout.value, cols: 12, snap: true, allowOverlap: true }
	  )
	  assert.equal(sectionSnap.status, 'snapped')
	  assert.equal(sectionSnap.snapKind, 'section-row')
	  assert.equal(sectionSnap.geometry.x, 0)

	  const disabledSnap = resolveGridEditorSnap(
	    sectionIntelligence,
	    { i: 'drop', x: 0.2, y: 1.2, w: 2, h: 1 },
	    { layout: layout.value, cols: 12, snap: false, allowOverlap: true }
	  )
	  assert.equal(disabledSnap.status, 'disabled')
	  assert.equal(disabledSnap.geometry.x, 0.2)

  const align = await editor.execute({
    type: 'align',
    source: 'toolbar',
    payload: { mode: 'left', cols: 12 }
  })
  assert.equal(align.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'b')?.x, 0)
  assert.equal(align.diagnostics?.computed?.targetLine?.mode, 'left')

  const headlessAlign = applyGridEditorAlign(layout.value, {
    mode: 'right',
    target: { type: 'explicit-line', axis: 'x', position: 10 }
  }, {
    targetIds: ['a', 'b'],
    sectionRows: editor.sectionRows.value,
    cols: 12
  })
  assert.equal(headlessAlign.status, 'changed')
  assert.equal(headlessAlign.layout.find(item => item.i === 'a')?.x, 8)
  assert.equal(headlessAlign.diagnostics.computed?.targetLine?.position, 10)

  layout.value = [
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 4, y: 0, w: 1, h: 1 },
    { i: 'c', x: 8, y: 0, w: 1, h: 1 }
  ]
  editor.setExternalLayout(layout.value, 'reset-for-distribute')
  await editor.execute({ type: 'select', payload: { ids: ['a', 'b', 'c'] } })
  const headlessActiveDistribute = applyGridEditorDistribute([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 5, y: 0, w: 1, h: 1 },
    { i: 'c', x: 9, y: 0, w: 1, h: 1 }
  ], {
    mode: 'horizontal',
    strategy: 'edge-to-edge',
    bounds: 'active-item'
  }, {
    targetIds: ['a', 'b', 'c'],
    activeId: 'b',
    cols: 12
  })
  assert.equal(headlessActiveDistribute.status, 'changed')
  assert.equal(headlessActiveDistribute.layout.find(item => item.i === 'b')?.x, 5)
  assert.equal(headlessActiveDistribute.diagnostics.computed?.targetSpacing?.mode, 'horizontal')
	  const distribute = await editor.execute({
	    type: 'distribute',
	    source: 'toolbar',
	    payload: { mode: 'horizontal', strategy: 'edge-to-edge', bounds: 'section-row', sectionRowId: 'row1', cols: 12 }
	  })
	  assert.ok(distribute.status === 'changed' || distribute.status === 'noop')
	  assert.equal(distribute.diagnostics?.computed?.targetSpacing?.mode, 'horizontal')
	  assert.equal(distribute.diagnostics?.computed?.sectionRowContext?.rowId, 'row1')

	  const collapse = await editor.execute({
	    type: 'section-row-collapse',
	    source: 'toolbar',
	    payload: { id: 'row1' }
	  })
	  assert.equal(collapse.status, 'changed')
	  assert.equal(editor.sectionRows.value.items.row1.collapsed, true)
	  assert.deepEqual(editor.selection.value.selectedIds, [])
	  const undoCollapse = await editor.undo()
	  assert.equal(undoCollapse.status, 'changed')
	  assert.equal(editor.sectionRows.value.items.row1.collapsed, false)
	  assert.deepEqual(editor.selection.value.selectedIds, ['a', 'b', 'c'])

	  const moveRow = await editor.execute({
	    type: 'section-row-move',
	    source: 'toolbar',
	    payload: { id: 'row1', dy: 1, cols: 12 }
	  })
	  assert.equal(moveRow.status, 'changed')
	  assert.equal(layout.value.find(item => item.i === 'a')?.y, 1)
	  await editor.undo()

  const toolbar = editor.getToolbarState()
  assert.equal(toolbar.commands.align?.enabled, true)
  assert.equal(toolbar.selectionSummary.count, 3)

  sectionRows.value = {
    version: 1,
    items: {
      row1: { id: 'row1', kind: 'row', order: 1, locked: true, itemIds: ['a', 'b', 'c'] }
    },
    itemMembership: sectionRows.value.itemMembership
  }
  const lockedMove = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(lockedMove.status, 'blocked')
  assert.equal(lockedMove.blocked?.reason, 'section-row-locked')

  const normalized = normalizeGridEditorSectionRows({
    version: 99 as never,
    items: {}
  }, layout.value)
  assert.ok(normalized.warnings.some(warning => warning.code === 'grid-editor.sectionRows.unknown-version'))
  assert.deepEqual(emptyGridEditorSectionRows().items, {})

  const envelope = createGridEditorPersistenceEnvelope({}, sectionRows.value)
  assert.equal(envelope.version, 2)
  const restored = readGridEditorPersistenceEnvelope({
    layoutSchemaVersion: 1,
    kind: 'layout',
    key: 'section',
    revision: '1',
    sourceId: 'test',
    savedAt: new Date().toISOString(),
    data: { layout: layout.value },
    meta: { editor: envelope }
  })
  assert.equal(restored.ok, true)
  assert.equal(restored.envelope?.sectionRows?.items.row1.locked, true)
}

async function testCommandKernelContracts() {
  const moveDescriptor = getGridEditorCommandDescriptor('move')
  assert.equal(moveDescriptor?.defaultHistory.mode, 'record')
  assert.equal(moveDescriptor?.mutualExclusionScope, 'layout')
  assert.ok(getGridEditorCommandDescriptors().some(descriptor => descriptor.type === 'delete'))

  const layout = ref(baseLayout())
  let releaseGuard: (value?: unknown) => void = () => undefined
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    beforeCommand: context => {
      if (context.command.type !== 'move') return { status: 'allow' }
      assert.equal(context.source, 'api')
      assert.equal(context.history.canUndo, false)
      assert.ok(context.preview)
      assert.ok(context.preview?.layoutPatches.some(patch => patch.type === 'move'))
      return new Promise(resolve => {
        releaseGuard = () => resolve({ status: 'allow' })
      })
    }
  })

  const pending = editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  const blocked = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(blocked.status, 'blocked')
  assert.equal(blocked.blocked?.reason, 'command-pending')
  releaseGuard()
  const moved = await pending
  assert.equal(moved.status, 'changed')
  assert.equal(moved.diagnostics?.historyMode, 'record')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)

  const select = await editor.execute({ type: 'select', payload: { ids: ['a'] } })
  assert.equal(select.status, 'changed')
  assert.equal(select.diagnostics?.historyMode, 'ignore')
  const undo = await editor.undo()
  assert.equal(undo.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 0)
  assert.deepEqual(editor.selection.value.selectedIds, [])

  const invalid = editor.canExecute({ type: 'move', targetIds: ['a'] })
  assert.equal(invalid.status, 'blocked')
  assert.equal(invalid.blocked?.reason, 'invalid-input')
}

function testHistoryCheckpointRestore() {
  const mergedHistory = createGridEditorHistory({ mergeWindowMs: 1000 })
  mergedHistory.push(createGridEditorHistoryEntry({
    id: 'merge-1',
    commandId: 'merge-command-1',
    commandType: 'move',
    before: historySnapshot(0),
    after: historySnapshot(1, ['a']),
    createdAt: '2026-01-01T00:00:00.000Z',
    mergeKey: 'move:a',
    affectedIds: ['a']
  }))
  mergedHistory.push(createGridEditorHistoryEntry({
    id: 'merge-2',
    commandId: 'merge-command-2',
    commandType: 'move',
    before: historySnapshot(1, ['a']),
    after: historySnapshot(2, ['a']),
    createdAt: '2026-01-01T00:00:00.300Z',
    mergeKey: 'move:a',
    affectedIds: ['a']
  }))
  const mergedCheckpoint = mergedHistory.checkpoint()
  mergedHistory.push(createGridEditorHistoryEntry({
    id: 'merge-extra',
    commandId: 'merge-command-extra',
    commandType: 'move',
    before: historySnapshot(2, ['a']),
    after: historySnapshot(9, ['a']),
    createdAt: '2026-01-01T00:00:01.500Z',
    affectedIds: ['a']
  }))
  mergedHistory.restore(mergedCheckpoint)
  const mergedUndo = mergedHistory.undo()
  assert.ok(mergedUndo)
  assert.equal(mergedUndo.before.kind, 'layout')
  assert.equal(mergedUndo.after.kind, 'layout')
  assert.equal(mergedUndo.before.kind === 'layout' ? mergedUndo.before.layout[0].x : -1, 0)
  assert.equal(mergedUndo.after.kind === 'layout' ? mergedUndo.after.layout[0].x : -1, 2)
  assert.deepEqual(
    mergedUndo?.after.editorMetaById.a.resizeHandles,
    ['se']
  )
  assert.deepEqual(
    mergedUndo?.after.sectionRows.items.row.itemIds,
    ['a']
  )

  const redoHistory = createGridEditorHistory()
  redoHistory.push(createGridEditorHistoryEntry({
    id: 'redo-1',
    commandId: 'redo-command-1',
    commandType: 'move',
    before: historySnapshot(0),
    after: historySnapshot(1),
    createdAt: '2026-01-01T00:00:00.000Z',
    affectedIds: ['a']
  }))
  redoHistory.push(createGridEditorHistoryEntry({
    id: 'redo-2',
    commandId: 'redo-command-2',
    commandType: 'move',
    before: historySnapshot(1),
    after: historySnapshot(2),
    createdAt: '2026-01-01T00:00:01.000Z',
    affectedIds: ['a']
  }))
  assert.equal(redoHistory.undo()?.id, 'redo-2')
  const redoCheckpoint = redoHistory.checkpoint()
  redoHistory.push(createGridEditorHistoryEntry({
    id: 'redo-extra',
    commandId: 'redo-command-extra',
    commandType: 'move',
    before: historySnapshot(1),
    after: historySnapshot(5),
    createdAt: '2026-01-01T00:00:02.000Z',
    affectedIds: ['a']
  }))
  assert.equal(redoHistory.canRedo.value, false)
  redoHistory.restore(redoCheckpoint)
  assert.equal(redoHistory.canUndo.value, true)
  assert.equal(redoHistory.canRedo.value, true)
  assert.equal(redoHistory.redo()?.id, 'redo-2')
  assert.equal(redoHistory.canRedo.value, false)
}

async function testEditorEventSubscriptionAndRollbackCheckpoint() {
  const layout = ref(baseLayout())
  const initialEvents: string[] = []
  const subscribedEvents: string[] = []
  const diagnosticCodes: string[] = []
  let eventThrows = true
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    onEvent: event => {
      initialEvents.push(event.type)
      if (eventThrows && event.type === 'command-commit') {
        throw new Error('primary listener failed')
      }
    }
  })
  const unsubscribe = editor.subscribe(event => {
    subscribedEvents.push(event.type)
  })
  const unsubscribeDiagnostics = editor.subscribe(event => {
    if (event.type === 'editor-error') {
      diagnosticCodes.push(event.code)
    }
  })

  const firstMove = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(firstMove.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)
  assert.ok(initialEvents.includes('command-commit'))
  assert.ok(subscribedEvents.includes('command-commit'))
  assert.ok(subscribedEvents.includes('editor-error'))
  assert.deepEqual(diagnosticCodes, ['editor-event-listener-error'])

  eventThrows = false
  const subscribedCommitCount = subscribedEvents.filter(type => type === 'command-commit').length
  unsubscribe()
  unsubscribe()
  const secondMove = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(secondMove.status, 'changed')
  assert.equal(
    subscribedEvents.filter(type => type === 'command-commit').length,
    subscribedCommitCount
  )
  unsubscribeDiagnostics()

  const checkpoint = editor.createRollbackCheckpoint('before-shell-write-back')
  const failedMove = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 5 } })
  assert.equal(failedMove.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 7)
  editor.restoreRollbackCheckpoint(checkpoint, 'shell-write-back-failed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 2)

  const undo = await editor.undo()
  assert.equal(undo.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)
  const redo = await editor.redo()
  assert.equal(redo.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 2)
  const redoAgain = await editor.redo()
  assert.equal(redoAgain.status, 'blocked')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 2)

  const stoppedLayout = ref(baseLayout())
  const stoppedEditor = createGridEditorController({
    layout: stoppedLayout,
    defaultMode: 'edit'
  })
  let stopListenerCount = 0
  stoppedEditor.subscribe(() => {
    stopListenerCount += 1
  })
  stoppedEditor.stop()
  const countAfterStop = stopListenerCount
  stoppedEditor.setExternalLayout(baseLayout(), 'after-stop')
  assert.equal(stopListenerCount, countAfterStop)
}

async function testGuardStaleEventIsolationAndExternalRedo() {
  const layout = ref(baseLayout())
  let eventThrows = true
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    onEvent: event => {
      if (eventThrows && event.type === 'command-commit') {
        throw new Error('listener failed')
      }
    }
  })
  const moved = await editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(moved.status, 'changed')
  eventThrows = false
  const undone = await editor.undo()
  assert.equal(undone.status, 'changed')
  editor.setExternalLayout([
    { i: 'a', x: 5, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 }
  ], 'remote-sync', { origin: 'remote-sync' })
  const redone = await editor.redo()
  assert.equal(redone.status, 'changed')
  assert.equal(layout.value.find(item => item.i === 'a')?.x, 1)

  const staleLayout = ref(baseLayout())
  let releaseGuard: (value?: unknown) => void = () => undefined
  const staleEditor = createGridEditorController({
    layout: staleLayout,
    defaultMode: 'edit',
    beforeCommand: context => {
      if (context.command.type !== 'move') return { status: 'allow' }
      return new Promise(resolve => {
        releaseGuard = () => resolve({ status: 'allow' })
      })
    }
  })
  const pending = staleEditor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  await staleEditor.execute({ type: 'select', payload: { ids: ['a'] } })
  releaseGuard()
  const stale = await pending
  assert.equal(stale.status, 'blocked')
  assert.equal(stale.blocked?.reason, 'stale-command')
  assert.equal(stale.diagnostics?.stale, true)
}

async function testGuardResultVariantsAndAbort() {
  const cancelledLayout = ref(baseLayout())
  const cancelledEditor = createGridEditorController({
    layout: cancelledLayout,
    defaultMode: 'edit',
    beforeCommand: () => ({ status: 'cancel', message: 'user cancelled' })
  })
  const cancelled = await cancelledEditor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(cancelled.status, 'cancelled')
  assert.equal(cancelled.blocked?.reason, 'before-command-cancelled')
  assert.equal(cancelledLayout.value[0].x, 0)

  const timeoutLayout = ref(baseLayout())
  const timeoutEditor = createGridEditorController({
    layout: timeoutLayout,
    defaultMode: 'edit',
    guardTimeoutMs: 1,
    beforeCommand: () => new Promise(() => undefined)
  })
  const timeout = await timeoutEditor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(timeout.status, 'timeout')
  assert.equal(timeout.blocked?.reason, 'before-command-timeout')
  assert.equal(timeout.diagnostics?.guardMs !== undefined, true)

  const errorLayout = ref(baseLayout())
  const errorEditor = createGridEditorController({
    layout: errorLayout,
    defaultMode: 'edit',
    beforeCommand: () => ({ status: 'error', message: 'guard failed' })
  })
  const failed = await errorEditor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  assert.equal(failed.status, 'error')
  assert.equal(failed.error?.message, 'guard failed')

  const abortLayout = ref(baseLayout())
  const abortEditor = createGridEditorController({
    layout: abortLayout,
    defaultMode: 'edit',
    beforeCommand: () => new Promise(() => undefined)
  })
  const pendingAbort = abortEditor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  abortEditor.setExternalLayout([
    { i: 'a', x: 4, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 4, y: 0, w: 2, h: 2, static: true }
  ], 'external-replace')
  const aborted = await pendingAbort
  assert.equal(aborted.status, 'cancelled')
  assert.equal(aborted.blocked?.reason, 'guard-aborted')

  const externalRefLayout = ref(baseLayout())
  const externalRefEditor = createGridEditorController({
    layout: externalRefLayout,
    defaultMode: 'edit',
    beforeCommand: () => new Promise(() => undefined)
  })
  const pendingExternalRef = externalRefEditor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1 } })
  externalRefLayout.value = [
    { i: 'a', x: 7, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 4, y: 0, w: 2, h: 2, static: true }
  ]
  const externalAborted = await pendingExternalRef
  assert.equal(externalAborted.status, 'cancelled')
  assert.equal(externalAborted.blocked?.reason, 'guard-aborted')
}

async function testCommandPreviewCoverage() {
  const layout = ref(baseLayout())
  const sectionRows = ref<GridEditorSectionRowState>({
    version: 1,
    items: {
      row1: { id: 'row1', kind: 'row', order: 1, itemIds: ['a', 'b'] }
    },
    itemMembership: {
      a: { rowId: 'row1' },
      b: { rowId: 'row1' }
    }
  })
  const previews: Array<{ type: string; affectedIds: string[]; metadata: number; sectionRows: number; layout: number }> = []
  const editor = createGridEditorController({
    layout,
    sectionRows,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    },
    beforeCommand: context => {
      previews.push({
        type: context.command.type,
        affectedIds: context.preview?.affectedIds || [],
        metadata: context.preview?.metadataPatches.length || 0,
        sectionRows: context.preview?.sectionRowPatches?.length || 0,
        layout: context.preview?.layoutPatches.length || 0
      })
      return { status: 'allow' }
    }
  })

  await editor.execute({ type: 'lock', targetIds: ['a'] })
  await editor.execute({ type: 'section-row-collapse', payload: { id: 'row1' } })
  await editor.execute({ type: 'add', payload: { item: { i: 'd', x: 6, y: 0, w: 1, h: 1 }, strategy: 'first-fit' } })

  const lockPreview = previews.find(preview => preview.type === 'lock')
  assert.equal(lockPreview?.metadata, 1)
  assert.ok(lockPreview?.affectedIds.includes('a'))

  const sectionPreview = previews.find(preview => preview.type === 'section-row-collapse')
  assert.equal(sectionPreview?.sectionRows, 1)
  assert.ok(sectionPreview?.affectedIds.includes('row1'))

  const addPreview = previews.find(preview => preview.type === 'add')
  assert.ok((addPreview?.layout || 0) > 0)
  assert.ok(addPreview?.affectedIds.includes('d'))
}

function testTransactionPreviewHelper() {
  const history = createGridEditorHistory()
  const before = {
    kind: 'layout' as const,
    layout: baseLayout(),
    editorMetaById: {},
    sectionRows: emptyGridEditorSectionRows(),
    selection: {
      selectedIds: [],
      activeId: null,
      anchorId: null,
      mode: 'single' as const,
      source: 'api' as const
    },
    focusId: null
  }
  const after = {
    ...before,
    layout: [{ ...before.layout[0], x: 1 }, before.layout[1]]
  }
  const preview = createGridEditorTransactionPreview(before, after)
  assert.equal(preview.layoutPatches.length, 2)
  assert.ok(preview.affectedIds.includes('a'))
  const mark = history.mark(before, 1)
  history.squashToMark(mark, {
    id: 'entry',
    commandId: 'command',
    commandType: 'move',
    before,
    after,
    createdAt: new Date().toISOString()
  })
  assert.equal(history.canUndo.value, true)
}

function testPlacementSessionCore() {
  const base: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 }
  ]
  const session = createGridEditorPlacementSession({
    source: 'template',
    commandType: 'add',
    items: [{ i: 'new', x: 0, y: 0, w: 2, h: 1 }],
    strategy: 'insert-top-shift',
    cols: 6
  }, {
    baseLayout: base,
    baseRevision: 1,
    now: () => 10
  })
  assert.equal(session.phase, 'preview')
  assert.equal(session.ghostItems.length, 1)
  assert.deepEqual(session.affectedOutlines.map(outline => outline.id).sort(), ['a', 'b'])
  assert.equal(session.affectedOutlines[0].kind, 'shift')
  assert.equal(base[0].y, 0)

  const first = updateGridEditorPlacementSession(session, { cursor: { x: 1, y: 1, source: 'api' } }, { now: () => 11 })
  const second = updateGridEditorPlacementSession(session, { cursor: { x: 1, y: 1, source: 'api' } }, { now: () => 12 })
  assert.deepEqual(first.candidateLayout, second.candidateLayout)
  assert.deepEqual(first.diagnostics.map(item => item.code), second.diagnostics.map(item => item.code))

  const cursorBlocked = createGridEditorPlacementSession({
    source: 'paste',
    commandType: 'paste',
    items: [{ i: 'cursor-new', x: 0, y: 0, w: 2, h: 2 }],
    strategy: 'cursor',
    placementIntent: 'here',
    placementAnchor: 'top-left',
    cursor: { x: 1, y: 1, source: 'api' },
    cols: 6
  }, {
    baseLayout: base,
    baseRevision: 2,
    now: () => 20
  })
  assert.equal(cursorBlocked.phase, 'blocked')
  assert.equal(cursorBlocked.ghostItems[0].item.x, 1)
  assert.equal(cursorBlocked.ghostItems[0].item.y, 1)
  assert.equal(cursorBlocked.ghostItems[0].state, 'blocked')
  assert.equal(base[0].y, 0)
}

async function testControllerPlacementSessionLifecycle() {
  const layout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 }
  ])
  let readCount = 0
  const guardPlacements: unknown[] = []
  const editor = createGridEditorController({
    layout,
    defaultMode: 'edit',
    clipboard: {
      read: () => {
        readCount += 1
        return {
          version: 1,
          sourceId: 'test-copy',
          copiedAt: '2026-05-20T00:00:00.000Z',
          items: [{ i: 'widget', x: 0, y: 0, w: 2, h: 1 }],
          editorMetaById: { widget: { label: 'Widget' } }
        }
      },
      write: () => {}
    },
    beforeCommand: context => {
      guardPlacements.push(context.placement)
      return { status: 'allow' }
    }
  })

  const started = await editor.beginPlacement({
    source: 'paste',
    commandType: 'paste',
    strategy: 'cursor',
    placementIntent: 'here',
    placementAnchor: 'top-left',
    cursor: { x: 3, y: 1, source: 'api' },
    cols: 8
  })
  assert.equal(started.status, 'started')
  assert.equal(readCount, 1)
  assert.equal(layout.value.length, 1)
  assert.equal(editor.placementSession.value?.ghostItems.length, 1)

  const updated = editor.updatePlacement({ cursor: { x: 4, y: 2, source: 'api' } })
  assert.equal(updated.status, 'updated')
  assert.equal(layout.value.length, 1)
  assert.equal(editor.placementSession.value?.ghostItems[0].item.x, 4)

  const committed = await editor.commitPlacement({ source: 'api' })
  assert.equal(committed.status, 'changed')
  assert.equal(readCount, 1)
  assert.equal(editor.placementSession.value, null)
  assert.equal(layout.value.length, 2)
  assert.equal(layout.value.find(item => item.i === 'widget-copy')?.x, 4)
  assert.equal(editor.editorMetaById.value['widget-copy']?.label, 'Widget')
  assert.ok(guardPlacements[0])
  assert.equal(editor.selection.value.selectedIds[0], 'widget-copy')

  const undone = await editor.undo()
  assert.equal(undone.status, 'changed')
  assert.equal(layout.value.length, 1)

  const addStarted = await editor.beginPlacement({
    source: 'palette',
    commandType: 'add',
    items: [{ i: 'palette', w: 1, h: 1 }],
    strategy: 'first-fit',
    cols: 8
  })
  assert.equal(addStarted.status, 'started')
  const cancelled = editor.cancelPlacement('test-cancel')
  assert.equal(cancelled.status, 'cancelled')
  assert.equal(editor.placementSession.value, null)
  const undoAfterCancel = await editor.undo()
  assert.equal(undoAfterCancel.status, 'blocked')

  const responsivePlacementLayout = ref<Layout>([])
  const responsivePlacementEditor = createGridEditorController({
    layout: responsivePlacementLayout,
    defaultMode: 'edit',
    clipboard: internalGridEditorClipboard
  })
  await internalGridEditorClipboard.write(createGridEditorClipboardPayload({
    sourceId: 'responsive-placement-copy',
    items: [{ i: 'wide-placement', x: 6, y: 0, w: 6, h: 2 }],
    editorMetaById: { 'wide-placement': { label: 'Wide placement' } },
    source: { cols: 24 }
  }))
  const responsiveStarted = await responsivePlacementEditor.beginPlacement({
    source: 'paste',
    commandType: 'paste',
    strategy: 'cursor',
    placementIntent: 'here',
    placementAnchor: 'top-left',
    cursor: { x: 2, y: 1, source: 'api' },
    cols: 12
  })
  assert.equal(responsiveStarted.status, 'started')
  assert.equal(responsivePlacementEditor.placementSession.value?.ghostItems[0].item.x, 2)
  assert.equal(responsivePlacementEditor.placementSession.value?.ghostItems[0].item.w, 3)
  assert.equal(responsivePlacementEditor.placementSession.value?.resolvedClipboardPayload?.responsive?.scaled, true)
  const responsiveCommitted = await responsivePlacementEditor.commitPlacement({ source: 'api' })
  assert.equal(responsiveCommitted.status, 'changed')
  assert.equal(responsivePlacementLayout.value.find(item => item.i === 'wide-placement-copy')?.x, 2)
  assert.equal(responsivePlacementLayout.value.find(item => item.i === 'wide-placement-copy')?.w, 3)

  const pushLayout = ref<Layout>([
    { i: 'existing', x: 0, y: 0, w: 2, h: 1 }
  ])
  const pushEditor = createGridEditorController({
    layout: pushLayout,
    defaultMode: 'edit',
    layoutEngineOptions: {
      cols: 4,
      maxRows: 8,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const pushStarted = await pushEditor.beginPlacement({
    source: 'palette',
    commandType: 'add',
    items: [{ i: 'push-new', w: 2, h: 1 }],
    strategy: 'cursor',
    collisionPolicy: 'layout',
    placementIntent: 'here',
    placementAnchor: 'top-left',
    cursor: { x: 0, y: 0, source: 'api' },
    cols: 4
  })
  assert.equal(pushStarted.status, 'started')
  assert.equal(pushEditor.placementSession.value?.ghostItems[0].item.y, 0)
  assert.equal(pushEditor.placementSession.value?.affectedOutlines.find(item => item.id === 'existing')?.after.y, 1)
  const pushCommitted = await pushEditor.commitPlacement({ source: 'api' })
  assert.equal(pushCommitted.status, 'changed')
  assert.equal(pushLayout.value.find(item => item.i === 'push-new')?.y, 0)
  assert.equal(pushLayout.value.find(item => item.i === 'existing')?.y, 1)
}

async function run() {
  await testModeAndGuard()
  await testSelectionCapabilityAndHistory()
  await testCommandResizeAspectRatioConstraints()
  await testGroupMoveCommands()
  await testMetadataClipboardAndPaste()
  await testPlacementPolicies()
  await testKeyboardShortcuts()
  await testPersistenceBridgeAndGuides()
  await testPredictiveGuidesAndChips()
  await testL3IntelligenceSnapCommandsAndSectionRows()
  await testCommandKernelContracts()
  testHistoryCheckpointRestore()
  await testEditorEventSubscriptionAndRollbackCheckpoint()
  await testGuardStaleEventIsolationAndExternalRedo()
  await testGuardResultVariantsAndAbort()
  await testCommandPreviewCoverage()
  testTransactionPreviewHelper()
  testPlacementSessionCore()
  await testControllerPlacementSessionLifecycle()
  console.log('editor-core tests passed')
}

void run().catch(error => {
  console.error(error)
  process.exit(1)
})
