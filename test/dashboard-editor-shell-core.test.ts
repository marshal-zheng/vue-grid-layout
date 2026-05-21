import assert from 'assert'
import { nextTick, ref } from 'vue'
import type { DashboardLayoutDefinition, DashboardLayoutDocument } from '../lib/dashboard'
import {
  serializeDashboardLayoutDocument
} from '../lib/dashboard'
import {
  resolveDashboardResponsiveProfile
} from '../lib/dashboard-responsive'
import {
  createGridEditorController,
  internalGridEditorClipboard
} from '../lib/editor'
import {
  buildDashboardContextMenu,
  buildWidgetContextMenu,
  createDashboardEditorShellDiagnostic,
  getEventGridPosition,
  runDashboardEditorShellTransaction,
  useDashboardEditorShell
} from '../lib/dashboard-editor-shell'
import type {
  DashboardEditorShellActions,
  DashboardEditorShellMenuContext,
  DashboardEditorShellResolvedPosition
} from '../lib/dashboard-editor-shell'
import type { Layout } from '../lib/utils'

const fixedDate = new Date('2026-05-19T00:00:00.000Z')

const baseDefinition = (): DashboardLayoutDefinition => ({
  widgets: {
    a: { col: 0, row: 0, sizeX: 2, sizeY: 2, extensions: { sensor: 'a' } },
    b: { col: 3, row: 0, sizeX: 2, sizeY: 2 },
    hidden: { col: 6, row: 0, sizeX: 2, sizeY: 2, desktopHide: true }
  },
  gridSettings: {
    columns: 12,
    margin: [10, 10],
    containerPadding: [0, 0],
    rowHeight: 50,
    viewFormat: 'grid',
    renderPrecision: 'integer'
  },
  profiles: {
    mobile: {
      widgets: {
        a: { mobileOrder: 0, mobileHeight: 3 },
        b: { mobileOrder: 1, mobileHeight: 2 }
      },
      gridSettings: {
        viewFormat: 'list',
        columns: 4,
        rowHeight: 24
      }
    }
  },
  editor: {
    version: 1,
    editorMetaById: {
      b: { locked: true }
    }
  },
  extensions: {
    unknown: true
  }
})

const createDocument = (): DashboardLayoutDocument =>
  serializeDashboardLayoutDocument(baseDefinition(), {
    key: 'dashboard:shell',
    sourceId: 'shell-test',
    revision: () => 'rev-shell',
    now: () => fixedDate
  })

const createDemoLikeDocument = (): DashboardLayoutDocument =>
  serializeDashboardLayoutDocument({
    widgets: {
      revenue: { col: 0, row: 0, sizeX: 4, sizeY: 3 },
      pipeline: { col: 4, row: 0, sizeX: 4, sizeY: 3 },
      health: { col: 8, row: 0, sizeX: 4, sizeY: 3 },
      incidents: { col: 0, row: 3, sizeX: 5, sizeY: 3 },
      region: { col: 5, row: 3, sizeX: 7, sizeY: 3 }
    },
    gridSettings: {
      columns: 12,
      margin: [10, 10],
      containerPadding: [10, 10],
      rowHeight: 58,
      viewFormat: 'grid',
      renderPrecision: 'subpixel'
    }
  }, {
    key: 'dashboard:shell-demo-like',
    sourceId: 'shell-demo-like-test',
    revision: () => 'rev-shell-demo-like',
    now: () => fixedDate
  })

const resolveRuntime = (
  document: DashboardLayoutDocument,
  options: { breakpoint?: string; targetView?: 'desktop' | 'mobile'; mode?: 'view' | 'edit' } = {}
) => {
  const result = resolveDashboardResponsiveProfile(document, {
    width: options.targetView === 'mobile' ? 360 : 1200,
    breakpoints: { mobile: 0, tablet: 640, desktop: 960 },
    breakpoint: options.breakpoint || (options.targetView === 'mobile' ? 'mobile' : 'desktop'),
    targetView: options.targetView || 'desktop',
    mode: options.mode || 'edit',
    validation: 'sanitize',
    allowUnknownProfileItems: true
  })
  assert.equal(result.ok, true)
  return result.ok ? result.runtime : null as never
}

const createGridElement = () => ({
  scrollLeft: 0,
  scrollTop: 0,
  clientWidth: 1200,
  clientHeight: 360,
  offsetWidth: 1200,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 360 }),
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  querySelector: () => null
}) as unknown as HTMLElement

const layoutGeometry = (layout: Layout): Layout =>
  layout.map(item => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h }))

function testPositionHelper() {
  const document = createDocument()
  const runtime = resolveRuntime(document)
  const gridElement = createGridElement()
  const pointer = getEventGridPosition({
    event: { clientX: 110, clientY: 75 } as MouseEvent,
    runtime,
    gridElement
  })
  assert.equal(pointer.ok, true)
  assert.equal(pointer.ok && pointer.position.x, 1)
  assert.equal(pointer.ok && pointer.position.y, 1)
  assert.equal(pointer.ok && pointer.position.source, 'event')

  const fallback = getEventGridPosition({
    runtime,
    gridElement: null,
    selection: { selectedIds: ['a'], activeId: 'a', anchorId: 'a', mode: 'single', source: 'api' }
  })
  assert.equal(fallback.ok, true)
  assert.equal(fallback.ok && fallback.position.source, 'active-item')

  const mobileRuntime = resolveRuntime(document, { breakpoint: 'mobile', targetView: 'mobile' })
  const list = getEventGridPosition({
    runtime: mobileRuntime,
    gridElement,
    event: { clientX: 20, clientY: 120 } as MouseEvent
  })
  assert.equal(list.ok, true)
  assert.equal(list.ok && list.position.source, 'list')
  assert.equal(typeof (list.ok && list.position.list?.listIndex), 'number')

  const blocked = getEventGridPosition({
    runtime,
    event: { clientX: 20, clientY: 10 } as MouseEvent,
    gridElement: null
  })
  assert.equal(blocked.ok, false)
  assert.equal(!blocked.ok && blocked.reason, 'missing-grid-element')
}

async function testShellStateMenusPasteAndHighlight() {
  const documentRef = ref(createDocument())
  const runtime = ref(resolveRuntime(documentRef.value))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({
    layout: layoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(runtime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const events: string[] = []
  const shell = useDashboardEditorShell({
    document: documentRef,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    onEvent: event => events.push(event.type)
  })
  await nextTick()
  assert.equal(shell.state.value.ready, true)
  assert.equal(shell.state.value.degraded, false)
  assert.equal(shell.state.value.layoutId, 'default')

  const menu = shell.actions.prepareDashboardContextMenu({ clientX: 80, clientY: 80 } as MouseEvent)
  assert.equal(menu.items.some(item => item.id === 'paste'), true)
  assert.equal(shell.state.value.lastMenuPosition?.source, 'event')
  shell.actions.closeMenu('unit-test')
  assert.equal(shell.state.value.menu, null)
  assert.equal(shell.state.value.lastMenuPosition, null)

  const widgetMenu = shell.actions.prepareWidgetContextMenu(null, 'b')
  const remove = widgetMenu.items.find(item => item.id === 'remove')
  assert.equal(remove?.enabled, false)
  assert.equal(remove?.reason, 'locked')

  const copied = await shell.actions.copyWidget('a')
  assert.equal(copied.ok, true)
  const pasted = await shell.actions.pasteAtGridPosition({ x: 5, y: 5, source: 'fallback' })
  assert.equal(pasted.ok, true)
  assert.equal(pasted.commandResult?.type, 'paste')
  assert.ok(pasted.affectedIds.length >= 1)
  assert.equal(Boolean(pasted.proposedDocument?.layouts.default.widgets[pasted.affectedIds[0]]), true)
  assert.equal(documentRef.value.layouts.default.extensions?.unknown, true)

  const highlighted = shell.actions.highlightItem('a', { durationMs: 1 })
  assert.equal(highlighted.ok, true)
  assert.equal(shell.state.value.highlightedId, 'a')
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(shell.state.value.highlightedId, null)
  assert.equal(documentRef.value.layouts.default.widgets.a.extensions?.sensor, 'a')

  const scroll = await shell.actions.scrollToItem('a')
  assert.equal(scroll.ok, false)
  assert.equal(scroll.status, 'blocked')
  assert.ok(events.includes('documentChange'))
  shell.stop()
  assert.equal(shell.state.value.menu, null)
}

async function testWidgetAdapterReferenceAndConfirm() {
  const document = createDocument()
  const runtime = ref(resolveRuntime(document))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({ layout: layoutRef, defaultMode: 'edit' })
  const order: string[] = []
  const shell = useDashboardEditorShell({
    document,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    createMissingProfileOnEdit: true,
    widgetAdapter: {
      prepareAddWidget: () => {
        order.push('prepare')
        return { id: 'prepared-add', kind: 'widget', newIds: ['biz-widget'], metadata: { type: 'chart' } }
      },
      commit: () => {
        order.push('commit')
        return { ok: true, metadata: { committed: true } }
      },
      rollback: () => {
        order.push('rollback')
      }
    },
    referenceAdapter: {
      canCopyReference: () => ({ available: true }),
      copyReference: () => ({ ok: true, metadata: { referenceId: 'ref-a' } }),
      prepareReplaceReferenceWithWidgetCopy: () => ({
        id: 'replace-ref',
        kind: 'reference',
        sourceIds: ['a'],
        newIds: ['a-copy'],
        opaque: { secret: 'payload' },
        diagnostics: [createDashboardEditorShellDiagnostic('reference-prepared', 'info', 'prepared', { details: { payload: { secret: 'hidden' }, status: 'ok' } })]
      }),
      commit: () => ({ ok: true })
    },
    confirm: () => false
  })

  const added = await shell.actions.addWidgetFromTemplate({ w: 2, h: 2 }, { x: 8, y: 1 })
  assert.equal(added.ok, true)
  assert.deepEqual(order, ['prepare', 'commit'])
  assert.ok(added.affectedIds.includes('biz-widget'))

  const cancelled = await shell.actions.removeWidget('a')
  assert.equal(cancelled.ok, false)
  assert.equal(cancelled.status, 'cancelled')
  assert.equal(layoutRef.value.some(item => item.i === 'a'), true)

  const reference = await shell.actions.copyWidgetReference('a')
  assert.equal(reference.ok, true)
  assert.equal(reference.adapter?.metadata?.referenceId, 'ref-a')

  const replaced = await shell.actions.replaceReferenceWithWidgetCopy('a')
  assert.equal(replaced.ok, true)
  assert.equal(replaced.diagnostics.some(item => JSON.stringify(item).includes('secret')), false)
  assert.equal((replaced.adapter?.diagnostics || []).some(item => JSON.stringify(item).includes('secret')), false)
  assert.equal(replaced.affectedIds[0], 'a-copy')

  const unsupportedShell = useDashboardEditorShell({
    runtime,
    editor,
    gridElement: ref(createGridElement())
  })
  const unsupported = await unsupportedShell.actions.copyWidgetReference('a')
  assert.equal(unsupported.ok, false)
  assert.equal(unsupported.status, 'unsupported')
}

async function testDashboardMenuPasteHereUsesWidgetAdapter() {
  const documentRef = ref(createDocument())
  const runtime = ref(resolveRuntime(documentRef.value))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({
    layout: layoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(runtime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const adapterIntents: string[] = []
  const shell = useDashboardEditorShell({
    document: documentRef,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    widgetAdapter: {
      preparePasteWidget: ctx => {
        adapterIntents.push(`prepare:${ctx.placementIntent}:${ctx.position?.source}`)
        return { id: 'menu-paste', kind: 'widget', sourceIds: ctx.itemIds }
      },
      commit: (_prepared, ctx) => {
        adapterIntents.push(`commit:${ctx.placementIntent}:${ctx.position?.source}`)
        return { ok: true }
      }
    }
  })

  await shell.actions.copyWidget('a')
  const menu = shell.actions.prepareDashboardContextMenu({ clientX: 900, clientY: 230 } as MouseEvent)
  const paste = menu.items.find(item => item.id === 'paste')
  assert.equal(paste?.label, 'Paste here')
  assert.equal(paste?.metadata?.placementIntent, 'here')
  assert.equal(paste?.metadata?.strategy, 'cursor')
  const result = await paste?.action?.()
  assert.equal(result?.ok, true)
  assert.equal(result?.actionType, 'paste-widget')
  assert.equal(result?.source, 'context-menu')
  assert.equal(result?.position?.source, 'event')
  assert.equal(result?.placement?.strategy, 'cursor')
  assert.deepEqual(adapterIntents, ['prepare:here:event', 'commit:here:event'])
  assert.equal(layoutRef.value.some(item => item.i === result?.affectedIds[0]), true)
}

async function testTargetlessWidgetPasteUsesPlacementPolicy() {
  const documentRef = ref(createDocument())
  const runtime = ref(resolveRuntime(documentRef.value))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({
    layout: layoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(runtime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const shell = useDashboardEditorShell({
    document: documentRef,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    menu: {
      defaultAddStrategy: 'first-fit'
    }
  })

  await shell.actions.selectItem('a')
  const copied = await shell.actions.copyWidget('a')
  assert.equal(copied.ok, true)

  const pasted = await shell.actions.pasteWidget(null, { source: 'keyboard' })
  assert.equal(pasted.ok, true)
  assert.equal(pasted.placement?.strategy, 'first-fit')
  assert.equal(pasted.position?.source, 'strategy')
  const pastedItem = layoutRef.value.find(item => item.i === pasted.affectedIds[0])
  assert.equal(pastedItem?.x, 8)
  assert.equal(pastedItem?.y, 0)

  const secondDocumentRef = ref(createDocument())
  const secondRuntime = ref(resolveRuntime(secondDocumentRef.value))
  const secondLayoutRef = ref<Layout>(secondRuntime.value.layout.map(item => ({ ...item })))
  const secondEditor = createGridEditorController({
    layout: secondLayoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(secondRuntime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const secondShell = useDashboardEditorShell({
    document: secondDocumentRef,
    runtime: secondRuntime,
    editor: secondEditor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    menu: {
      defaultAddStrategy: 'first-fit'
    }
  })
  await secondShell.actions.copyWidget('a')
  const [firstConcurrentPaste, secondConcurrentPaste] = await Promise.all([
    secondShell.actions.pasteWidget(null, { source: 'keyboard' }),
    secondShell.actions.pasteWidget(null, { source: 'keyboard' })
  ])
  assert.equal(firstConcurrentPaste.ok, true)
  assert.equal(secondConcurrentPaste.ok, true)
  const firstConcurrentItem = secondLayoutRef.value.find(item => item.i === firstConcurrentPaste.affectedIds[0])
  const secondConcurrentItem = secondLayoutRef.value.find(item => item.i === secondConcurrentPaste.affectedIds[0])
  assert.equal(firstConcurrentItem?.x, 8)
  assert.equal(firstConcurrentItem?.y, 0)
  assert.equal(secondConcurrentItem?.x, 10)
  assert.equal(secondConcurrentItem?.y, 0)

  const cutDocumentRef = ref(createDocument())
  const cutRuntime = ref(resolveRuntime(cutDocumentRef.value))
  const cutLayoutRef = ref<Layout>(cutRuntime.value.layout.map(item => ({ ...item })))
  const cutEditor = createGridEditorController({
    layout: cutLayoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(cutRuntime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const cutShell = useDashboardEditorShell({
    document: cutDocumentRef,
    runtime: cutRuntime,
    editor: cutEditor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    menu: {
      defaultAddStrategy: 'first-fit'
    }
  })
  const cut = await cutShell.actions.cutWidget('a', { source: 'keyboard' })
  assert.equal(cut.ok, true)
  assert.equal(cut.actionType, 'cut-widget')
  assert.equal(cutLayoutRef.value.some(item => item.i === 'a'), false)
  const cutPaste = await cutShell.actions.pasteWidget(null, { source: 'keyboard' })
  assert.equal(cutPaste.ok, true)
  assert.equal(cutPaste.actionType, 'place-clipboard')
  assert.equal(cutEditor.placementSession.value?.source, 'paste')
  assert.equal(cutLayoutRef.value.some(item => item.i.includes('a-copy')), false)
  cutEditor.cancelPlacement('cut-widget-placement-test')
}

async function testShellHistoryAndDeleteWriteBack() {
  const documentRef = ref(createDocument())
  const runtime = ref(resolveRuntime(documentRef.value))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({
    layout: layoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(runtime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const shell = useDashboardEditorShell({
    document: documentRef,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    menu: {
      defaultAddStrategy: 'first-fit'
    }
  })

  await shell.actions.copyWidget('a')
  const pasted = await shell.actions.pasteWidget(null, { source: 'keyboard' })
  assert.equal(pasted.ok, true)
  const pastedId = pasted.affectedIds[0]
  assert.equal(Boolean(documentRef.value.layouts.default.widgets[pastedId]), true)
  await nextTick()
  assert.equal(Boolean(shell.state.value.toolbar?.commands.undo?.enabled), true)

  const undoPaste = await shell.actions.undo({ source: 'keyboard' })
  assert.equal(undoPaste.ok, true)
  assert.equal(Boolean(documentRef.value.layouts.default.widgets[pastedId]), false)
  await nextTick()
  assert.equal(Boolean(shell.state.value.toolbar?.commands.redo?.enabled), true)

  const redoPaste = await shell.actions.redo({ source: 'keyboard' })
  assert.equal(redoPaste.ok, true)
  assert.equal(Boolean(documentRef.value.layouts.default.widgets[pastedId]), true)

  const removed = await shell.actions.removeWidget('a', { source: 'keyboard' })
  assert.equal(removed.ok, true)
  assert.equal(Boolean(documentRef.value.layouts.default.widgets.a), false)

  const undoRemove = await shell.actions.undo({ source: 'keyboard' })
  assert.equal(undoRemove.ok, true)
  assert.equal(Boolean(documentRef.value.layouts.default.widgets.a), true)
}

async function testTargetlessPasteFillsRowsForDashboardSizedCards() {
  const runScenario = async (
    sourceId: string,
    expectedPositions: Array<{ x: number; y: number }>
  ) => {
    const documentRef = ref(createDemoLikeDocument())
    const runtime = ref(resolveRuntime(documentRef.value))
    const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
    const editor = createGridEditorController({
      layout: layoutRef,
      defaultMode: 'edit',
      editorMetaById: ref(runtime.value.editorMetaById),
      layoutEngineOptions: {
        cols: 12,
        maxRows: Infinity,
        compactType: 'vertical',
        allowOverlap: false,
        preventCollision: false
      }
    })
    const shell = useDashboardEditorShell({
      document: documentRef,
      runtime,
      editor,
      gridElement: ref(createGridElement()),
      mode: ref('edit'),
      controlled: false,
      createMissingProfileOnEdit: true,
      menu: {
        defaultAddStrategy: 'first-fit'
      }
    })
    await shell.actions.copyWidget(sourceId)
    const results = await Promise.all([
      shell.actions.pasteWidget(null, { source: 'keyboard' }),
      shell.actions.pasteWidget(null, { source: 'keyboard' })
    ])
    assert.equal(results[0].ok, true)
    assert.equal(results[1].ok, true)
    results.forEach((result, index) => {
      const pastedItem = layoutRef.value.find(item => item.i === result.affectedIds[0])
      assert.equal(pastedItem?.x, expectedPositions[index].x)
      assert.equal(pastedItem?.y, expectedPositions[index].y)
    })
  }

  await runScenario('revenue', [{ x: 0, y: 6 }, { x: 4, y: 6 }])
  await runScenario('incidents', [{ x: 0, y: 6 }, { x: 5, y: 6 }])

  const documentRef = ref(createDemoLikeDocument())
  const runtime = ref(resolveRuntime(documentRef.value))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({
    layout: layoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(runtime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: Infinity,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const shell = useDashboardEditorShell({
    document: documentRef,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    menu: {
      defaultAddStrategy: 'first-fit'
    }
  })
  await shell.actions.copyWidget('incidents')
  const explicit = await shell.actions.pasteWidget({ x: 8, y: 3, source: 'event' }, {
    source: 'context-menu',
    placementIntent: 'here'
  })
  assert.equal(explicit.ok, true)
  assert.equal(explicit.placement?.strategy, 'cursor')
  const explicitItem = layoutRef.value.find(item => item.i === explicit.affectedIds[0])
  assert.equal(explicitItem?.x, 7)
  assert.equal(explicitItem?.y, 6)
}

async function testShellPlacementStrategiesAndAtomicity() {
  const documentRef = ref(createDocument())
  const runtime = ref(resolveRuntime(documentRef.value))
  const layoutRef = ref<Layout>(runtime.value.layout.map(item => ({ ...item })))
  const editor = createGridEditorController({
    layout: layoutRef,
    defaultMode: 'edit',
    editorMetaById: ref(runtime.value.editorMetaById),
    layoutEngineOptions: {
      cols: 12,
      maxRows: 12,
      compactType: 'vertical',
      allowOverlap: false,
      preventCollision: false
    }
  })
  const shell = useDashboardEditorShell({
    document: documentRef,
    runtime,
    editor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true,
    menu: {
      defaultAddStrategy: 'first-fit',
      defaultReferencePasteStrategy: 'first-fit'
    },
    palette: {
      open: () => ({ id: 'palette-top', w: 2, h: 2 })
    },
    referenceAdapter: {
      preparePasteReference: () => ({ id: 'ref-prepare', kind: 'reference', newIds: ['ref-first-fit'] }),
      commit: () => ({ ok: true })
    }
  })

  await shell.actions.copyWidget('incidents')
  const placedClipboard = await shell.actions.placeClipboard({ x: 6, y: 1, source: 'event' }, {
    source: 'toolbar',
    placementIntent: 'here'
  })
  assert.equal(placedClipboard.ok, true)
  assert.equal(placedClipboard.actionType, 'place-clipboard')
  assert.equal(editor.placementSession.value?.source, 'paste')
  assert.equal(layoutRef.value.some(item => item.i.includes('incidents-copy')), false)
  editor.updatePlacement({ cursor: { x: 0, y: 6, source: 'api' } })
  const committedPlacement = await shell.actions.commitPlacement({ source: 'keyboard' })
  assert.equal(committedPlacement.ok, true)
  assert.equal(committedPlacement.commandResult?.status, 'changed')
  const placementCopyId = layoutRef.value.find(item => item.i.includes('incidents-copy'))?.i
  assert.ok(placementCopyId)
  assert.equal(Boolean(documentRef.value.layouts.default.widgets[placementCopyId]), true)
  const placementCleanup = await shell.actions.removeWidget(placementCopyId, { source: 'api' })
  assert.equal(placementCleanup.ok, true)

  const interactivePalette = await shell.actions.openWidgetPalette({ x: 7, y: 1, source: 'event' }, {
    source: 'toolbar',
    placementMode: 'interactive'
  })
  assert.equal(interactivePalette.ok, true)
  assert.equal(editor.placementSession.value?.source, 'template')
  assert.equal(layoutRef.value.some(item => item.i === 'palette-top'), false)
  editor.cancelPlacement('test-palette-cancel')

  const firstFit = await shell.actions.addWidgetFromTemplate({ id: 'first-fit-widget', w: 1, h: 1 }, null, {
    source: 'toolbar',
    strategy: 'first-fit'
  })
  assert.equal(firstFit.ok, true)
  assert.equal(firstFit.placement?.strategy, 'first-fit')
  assert.equal(firstFit.position?.source, 'strategy')
  assert.equal(layoutRef.value.find(item => item.i === 'first-fit-widget')?.x, 2)
  assert.equal(Boolean(documentRef.value.layouts.default.widgets['first-fit-widget']), true)

  const shifted = await shell.actions.openWidgetPalette(null, {
    source: 'toolbar',
    strategy: 'insert-top-shift'
  })
  assert.equal(shifted.ok, true)
  assert.equal(shifted.placement?.strategy, 'insert-top-shift')
  assert.equal(layoutRef.value.find(item => item.i === 'palette-top')?.x, 0)
  assert.equal(layoutRef.value.find(item => item.i === 'palette-top')?.y, 0)
  assert.ok((shifted.placement?.shiftedIds || []).includes('a'))

  const reference = await shell.actions.pasteWidgetReference(null, {
    source: 'toolbar',
    strategy: 'first-fit',
    itemSize: { w: 2, h: 2 }
  })
  assert.equal(reference.ok, true)
  assert.equal(reference.placement?.strategy, 'first-fit')
  assert.equal(reference.affectedIds[0], 'ref-first-fit')

  const dropped = await shell.actions.handleExternalDrop(
    { template: { id: 'drop-fit', w: 1, h: 1 } },
    { clientX: 10, clientY: 10 } as DragEvent,
    { strategy: 'first-fit' }
  )
  assert.equal(dropped.ok, true)
  assert.equal(dropped.placement?.strategy, 'first-fit')

  const menu = shell.actions.prepareDashboardContextMenu(null)
  assert.equal(menu.items.find(item => item.id === 'add-widget')?.metadata?.placementIntent, 'auto')
  assert.equal(menu.items.find(item => item.id === 'add-widget')?.metadata?.strategy, 'first-fit')
  assert.equal(menu.items.find(item => item.id === 'paste-reference')?.metadata?.placementIntent, 'auto')
  assert.equal(menu.items.find(item => item.id === 'paste-reference')?.metadata?.strategy, 'first-fit')

  const commitDocumentRef = ref(createDocument())
  const commitRuntime = ref(resolveRuntime(commitDocumentRef.value))
  const commitLayoutRef = ref<Layout>(commitRuntime.value.layout.map(item => ({ ...item })))
  const commitEditor = createGridEditorController({ layout: commitLayoutRef, defaultMode: 'edit' })
  const order: string[] = []
  const commitFailureShell = useDashboardEditorShell({
    document: commitDocumentRef,
    runtime: commitRuntime,
    editor: commitEditor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    createMissingProfileOnEdit: true,
    widgetAdapter: {
      prepareAddWidget: () => {
        order.push('prepare')
        return { id: 'commit-failure', kind: 'widget', newIds: ['commit-fails'] }
      },
      commit: () => {
        order.push('commit')
        return { ok: false, status: 'error', reason: 'adapter-rejected', error: { code: 'commit-failed', message: 'Commit failed' } }
      },
      rollback: () => {
        order.push('rollback')
      }
    }
  })
  const beforeCommitLayout = commitLayoutRef.value.map(item => ({ ...item }))
  const commitFailure = await commitFailureShell.actions.addWidgetFromTemplate({ w: 2, h: 2 }, null, { strategy: 'first-fit' })
  assert.equal(commitFailure.ok, false)
  assert.equal(commitFailure.status, 'error')
  assert.deepEqual(order, ['prepare', 'commit', 'rollback'])
  assert.deepEqual(layoutGeometry(commitLayoutRef.value), layoutGeometry(beforeCommitLayout))
  assert.equal(Boolean(commitDocumentRef.value.layouts.default.widgets['commit-fails']), false)

  const fallbackDocumentRef = ref(createDocument())
  const fallbackRuntime = ref(resolveRuntime(fallbackDocumentRef.value, { breakpoint: 'tablet' }))
  const fallbackLayoutRef = ref<Layout>(fallbackRuntime.value.layout.map(item => ({ ...item })))
  const fallbackEditor = createGridEditorController({ layout: fallbackLayoutRef, defaultMode: 'edit' })
  const fallbackShell = useDashboardEditorShell({
    document: fallbackDocumentRef,
    runtime: fallbackRuntime,
    editor: fallbackEditor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    createMissingProfileOnEdit: false
  })
  const beforeFallbackLayout = fallbackLayoutRef.value.map(item => ({ ...item }))
  const writeBlocked = await fallbackShell.actions.addWidgetFromTemplate({ id: 'tablet-only', w: 1, h: 1 }, null, { strategy: 'first-fit' })
  assert.equal(writeBlocked.ok, false)
  assert.equal(writeBlocked.status, 'blocked')
  assert.deepEqual(layoutGeometry(fallbackLayoutRef.value), layoutGeometry(beforeFallbackLayout))
  assert.equal(Boolean(fallbackDocumentRef.value.layouts.default.widgets['tablet-only']), false)
  assert.ok(writeBlocked.diagnostics.some(item => item.code === 'shell-profile-write-back-blocked'))

  const scopedDocumentRef = ref(createDocument())
  const scopedRuntime = ref(resolveRuntime(scopedDocumentRef.value, { breakpoint: 'tablet' }))
  const scopedLayoutRef = ref<Layout>(scopedRuntime.value.layout.map(item => ({ ...item })))
  const scopedEditor = createGridEditorController({ layout: scopedLayoutRef, defaultMode: 'edit' })
  const scopedShell = useDashboardEditorShell({
    document: scopedDocumentRef,
    runtime: scopedRuntime,
    editor: scopedEditor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    controlled: false,
    createMissingProfileOnEdit: true
  })
  const scoped = await scopedShell.actions.addWidgetFromTemplate({ id: 'tablet-new', w: 1, h: 1 }, null, { strategy: 'first-fit' })
  assert.equal(scoped.ok, true)
  assert.deepEqual(Object.keys(scopedDocumentRef.value.layouts.default.profiles?.tablet.widgets || {}), ['tablet-new'])

  const duplicateDocumentRef = ref(createDocument())
  const duplicateRuntime = ref(resolveRuntime(duplicateDocumentRef.value))
  const duplicateLayoutRef = ref<Layout>(duplicateRuntime.value.layout.map(item => ({ ...item })))
  const duplicateEditor = createGridEditorController({ layout: duplicateLayoutRef, defaultMode: 'edit' })
  const duplicateOrder: string[] = []
  const duplicateShell = useDashboardEditorShell({
    document: duplicateDocumentRef,
    runtime: duplicateRuntime,
    editor: duplicateEditor,
    gridElement: ref(createGridElement()),
    mode: ref('edit'),
    createMissingProfileOnEdit: true,
    widgetAdapter: {
      prepareAddWidget: () => {
        duplicateOrder.push('prepare')
        return { id: 'duplicate-id', kind: 'widget', newIds: ['a'] }
      },
      commit: () => {
        duplicateOrder.push('commit')
        return { ok: true }
      },
      rollback: () => {
        duplicateOrder.push('rollback')
      }
    }
  })
  const duplicateBefore = duplicateLayoutRef.value.map(item => ({ ...item }))
  const duplicate = await duplicateShell.actions.addWidgetFromTemplate({ w: 1, h: 1 }, null, { strategy: 'first-fit' })
  assert.equal(duplicate.ok, false)
  assert.equal(duplicate.status, 'blocked')
  assert.deepEqual(duplicateOrder, ['prepare', 'rollback'])
  assert.deepEqual(layoutGeometry(duplicateLayoutRef.value), layoutGeometry(duplicateBefore))
  assert.equal(duplicate.diagnostics.some(item => item.code === 'shell-adapter-invalid-new-ids'), true)
}

async function testTransactionCoordinator() {
  const events: string[] = []
  const result = await runDashboardEditorShellTransaction({
    actionId: 'tx-1',
    actionType: 'add-widget',
    source: 'api',
    itemIds: ['a'],
    context: {
      actionId: 'tx-1',
      actionType: 'add-widget',
      source: 'api',
      itemIds: ['a'],
      runtime: null,
      document: null,
      diagnostics: []
    },
    profile: {
      layoutId: 'default',
      requestedBreakpoint: 'desktop',
      resolvedProfileId: null,
      targetView: 'desktop',
      viewFormat: 'grid'
    },
    emit: event => events.push(event.type),
    prepare: () => ({ id: 'prepared', kind: 'widget', newIds: ['new-a'] }),
    mutate: () => ({ status: 'blocked', diagnostics: [createDashboardEditorShellDiagnostic('blocked', 'warning', 'blocked')] }),
    rollback: () => ({ ok: true })
  })
  assert.equal(result.ok, false)
  assert.equal(result.status, 'blocked')
  assert.equal(result.adapter?.stage, 'rollback')
  assert.deepEqual(events, ['action-start', 'action-result'])

  let rollbackStage = ''
  const commitThrown = await runDashboardEditorShellTransaction({
    actionId: 'tx-commit-throw',
    actionType: 'add-widget',
    source: 'api',
    itemIds: ['a'],
    context: {
      actionId: 'tx-commit-throw',
      actionType: 'add-widget',
      source: 'api',
      itemIds: ['a'],
      runtime: null,
      document: null,
      diagnostics: []
    },
    profile: {
      layoutId: 'default',
      requestedBreakpoint: 'desktop',
      resolvedProfileId: null,
      targetView: 'desktop',
      viewFormat: 'grid'
    },
    prepare: () => ({ id: 'prepared-commit-throw', kind: 'widget', newIds: ['new-a'] }),
    mutate: () => ({ status: 'success', affectedIds: ['new-a'] }),
    commit: () => {
      throw new Error('commit failed')
    },
    rollback: (_prepared, ctx) => {
      rollbackStage = ctx.stage
      return { ok: true }
    }
  })
  assert.equal(commitThrown.ok, false)
  assert.equal(commitThrown.status, 'error')
  assert.equal(rollbackStage, 'commit')
}

function testStandaloneMenuBuilders() {
  const actions = {
    pasteAtGridPosition: () => Promise.resolve({ ok: true } as never),
    placeClipboard: () => Promise.resolve({ ok: true } as never),
    commitPlacement: () => Promise.resolve({ ok: true } as never),
    pasteWidget: () => Promise.resolve({ ok: true } as never),
    pasteWidgetReference: () => Promise.resolve({ ok: true } as never),
    addWidgetFromTemplate: () => Promise.resolve({ ok: true } as never),
    openWidgetPalette: () => Promise.resolve({ ok: true } as never),
    moveAllWidgets: () => Promise.resolve({ ok: true } as never),
    selectItem: () => Promise.resolve({ ok: true } as never),
    copyWidget: () => Promise.resolve({ ok: true } as never),
    cutWidget: () => Promise.resolve({ ok: true } as never),
    copyWidgetReference: () => Promise.resolve({ ok: true } as never),
    duplicateWidget: () => Promise.resolve({ ok: true } as never),
    removeWidget: () => Promise.resolve({ ok: true } as never),
    replaceReferenceWithWidgetCopy: () => Promise.resolve({ ok: true } as never),
    undo: () => Promise.resolve({ ok: true } as never),
    redo: () => Promise.resolve({ ok: true } as never),
    highlightItem: () => ({ ok: true } as never),
    scrollToItem: () => Promise.resolve({ ok: true } as never)
  } as Partial<DashboardEditorShellActions> as DashboardEditorShellActions
  const context: DashboardEditorShellMenuContext = {
    target: { type: 'dashboard' },
    runtime: null,
    mode: 'view',
    readonly: true,
    editor: null
  }
  const dashboard = buildDashboardContextMenu({
    id: 'menu',
    target: { type: 'dashboard' },
    context,
    actions,
    referenceAvailable: false,
    paletteAvailable: false
  } as never)
  assert.equal(dashboard.items.find(item => item.id === 'paste')?.enabled, false)
  assert.equal(dashboard.items.find(item => item.id === 'paste-reference')?.reason, 'mode-readonly')

  const widget = buildWidgetContextMenu({
    id: 'widget-menu',
    target: { type: 'widget', itemId: 'a' },
    itemId: 'a',
    hiddenItem: true,
    context,
    actions,
    referenceAvailable: false
  } as never)
  assert.equal(widget.items.find(item => item.id === 'select')?.reason, 'hidden')
}

function testPublicRuntimeNamespace() {
  const cjs = require('../lib/cjs')
  assert.equal(typeof cjs.dashboardEditorShell.useDashboardEditorShell, 'function')
  assert.equal(typeof cjs.useDashboardEditorShell, 'function')
  assert.equal(typeof cjs.getEventGridPosition, 'function')
  assert.equal(typeof cjs.runDashboardEditorShellTransaction, 'function')
}

function testShellRuntimeDiagnosticsShape() {
  const shell = useDashboardEditorShell({
    document: null,
    runtime: null,
    editor: null,
    gridElement: null
  })
  const runtimeDiagnostic = shell.state.value.diagnostics.find(item => item.code === 'shell-missing-runtime')
  const editorDiagnostic = shell.state.value.diagnostics.find(item => item.code === 'shell-missing-editor')
  assert.equal(runtimeDiagnostic?.level, 'warning')
  assert.equal(runtimeDiagnostic?.message, 'Dashboard responsive runtime is not available.')
  assert.equal(runtimeDiagnostic?.reason, 'missing-runtime')
  assert.equal(editorDiagnostic?.level, 'warning')
  assert.equal(editorDiagnostic?.message, 'Grid editor controller is not available.')
  assert.equal(editorDiagnostic?.reason, 'missing-editor')
  shell.stop()
}

async function main() {
  internalGridEditorClipboard.clear()
  testPositionHelper()
  await testShellStateMenusPasteAndHighlight()
  await testWidgetAdapterReferenceAndConfirm()
  await testDashboardMenuPasteHereUsesWidgetAdapter()
  await testTargetlessWidgetPasteUsesPlacementPolicy()
  await testShellHistoryAndDeleteWriteBack()
  await testTargetlessPasteFillsRowsForDashboardSizedCards()
  await testShellPlacementStrategiesAndAtomicity()
  await testTransactionCoordinator()
  testStandaloneMenuBuilders()
  testPublicRuntimeNamespace()
  testShellRuntimeDiagnosticsShape()
}

void main().catch(error => {
  throw error
})
