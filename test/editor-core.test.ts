import assert from 'assert'
import { ref } from 'vue'
import {
  applyGridEditorAlign,
  applyGridEditorDistribute,
  computeGridEditorIntelligence,
  computeGridEditorGuides,
  createGridEditorController,
  createGridEditorPersistenceEnvelope,
  emptyGridEditorSectionRows,
  filterGridEditorDisplayGuides,
  getGridEditorKeyboardCommand,
  internalGridEditorClipboard,
  normalizeGridEditorSectionRows,
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
import type { GridEditorSectionRowState } from '../lib/editor'
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
    commandPolicy: 'skip-blocked'
  })

  await editor.execute({ type: 'select', payload: { ids: ['a', 'b'] } })
  assert.deepEqual(editor.selection.value.selectedIds, ['a', 'b'])

  const moved = await editor.execute({ type: 'move', payload: { dx: 1, dy: 0 } })
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
    clipboard: internalGridEditorClipboard
  })
  await editor.execute({ type: 'select', payload: { ids: ['a'] } })
  const copied = await editor.execute({ type: 'copy' })
  assert.equal(copied.status, 'changed')
  const pasted = await editor.execute({ type: 'paste', payload: { cols: 12, strategy: 'first-fit' } })
  assert.equal(pasted.status, 'changed')
  assert.ok(layout.value.some(item => item.i === 'a-copy'))

  const system = systemClipboardAdapter()
  await assert.rejects(async () => system.read(), /System clipboard|Failed to read/)
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

async function run() {
  await testModeAndGuard()
  await testSelectionCapabilityAndHistory()
  await testMetadataClipboardAndPaste()
  await testKeyboardShortcuts()
  await testPersistenceBridgeAndGuides()
  await testPredictiveGuidesAndChips()
  await testL3IntelligenceSnapCommandsAndSectionRows()
  console.log('editor-core tests passed')
}

void run().catch(error => {
  console.error(error)
  process.exit(1)
})
