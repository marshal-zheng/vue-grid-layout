import assert from 'assert'
import { ref } from 'vue'
import {
  createGridEditorController,
  createGridEditorSelection
} from '../lib/editor'
import {
  createGridLayoutEventBridge,
  splitGridRootAttrs
} from '../lib/grid-layout/contract'
import { useGridFrameUpdate } from '../lib/grid-layout/useGridFrameUpdate'
import { useGridAutoScroll } from '../lib/grid-layout/useGridAutoScroll'
import { useGridDragResizeInteractions } from '../lib/grid-layout/useGridDragResizeInteractions'
import { useGridEditorRuntime } from '../lib/grid-layout/useGridEditorRuntime'
import { createGridEditorOverlayGeometry } from '../lib/grid-layout/GridEditorOverlay'
import type { Layout, LayoutItem } from '../lib/utils'
import type { LayoutOperation } from '../lib/layout-engine'

function testRootAttrsSplit() {
  const split = splitGridRootAttrs({
    id: 'grid-root',
    class: ['outer'],
    style: { color: 'red' },
    'data-probe': 'yes',
    'aria-label': 'Grid',
    onDrag: () => undefined,
    onClick: () => undefined
  })

  assert.deepEqual(split.attrs, {
    id: 'grid-root',
    'data-probe': 'yes',
    'aria-label': 'Grid'
  })
  assert.deepEqual(split.class, ['outer'])
  assert.deepEqual(split.style, { color: 'red' })
}

function testEventBridge() {
  const emitted: unknown[][] = []
  const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 1, h: 1 }]
  const oldItem: LayoutItem = { i: 'a', x: 0, y: 0, w: 1, h: 1 }
  const item: LayoutItem = { i: 'a', x: 1, y: 0, w: 1, h: 1 }
  const event = { type: 'mousemove' } as Event
  const node = { nodeType: 1 } as HTMLElement

  const bridge = createGridLayoutEventBridge(
    (name, ...args) => emitted.push([name, ...args]),
    {
      vnode: {
        props: {
          onDropDragOver: [
            () => ({ w: 2, h: 2 }),
            () => false
          ],
          'onDrop-drag-over': () => ({ w: 4, h: 4 })
        }
      }
    } as never
  )

  bridge.emitDrag(layout, oldItem, item, undefined, event, node)
  assert.deepEqual(emitted[0], ['drag', layout, oldItem, item, undefined, event, node])
  assert.equal(bridge.callDropDragOver({ type: 'dragover' } as DragEvent), false)
}

function testFrameUpdate() {
  let layout: Layout = [{ i: 'a', x: 0, y: 0, w: 1, h: 1, moved: true }]
  const active: LayoutItem[] = []
  const nextLayout: Layout = [{ i: 'a', x: 2, y: 0, w: 3, h: 1 }]
  const frame = useGridFrameUpdate({
    getLayout: () => layout,
    setLayout: next => {
      layout = next
    },
    setActiveDrag: item => active.push(item)
  })

  frame.schedule({
    cols: 12,
    compactType: null,
    layout: nextLayout,
    placeholder: { i: 'a', x: 2, y: 0, w: 1, h: 1 },
    shouldCompact: false
  })

  assert.equal(layout, nextLayout)
  assert.deepEqual(active[0], { i: 'a', x: 2, y: 0, w: 3, h: 1 })
  const movedLayout: Layout = [{ i: 'b', x: 0, y: 0, w: 1, h: 1, moved: true }]
  frame.resetMovedFlags(movedLayout)
  assert.equal(movedLayout[0].moved, false)
}

function testAutoScroll() {
  const win = {
    getComputedStyle: () => ({ overflowY: 'auto', overflowX: 'auto' }),
    innerHeight: 100,
    innerWidth: 100,
    scrollBy: () => undefined
  }

  class FakeElement {
    scrollTop = 10
    scrollLeft = 10
    clientHeight = 100
    scrollHeight = 300
    clientWidth = 100
    scrollWidth = 300
    parentElement: FakeElement | null = null
    ownerDocument = { defaultView: win }

    closest() {
      return this
    }

    getBoundingClientRect() {
      return { top: 0, bottom: 100, left: 0, right: 100 }
    }

    scrollBy({ left = 0, top = 0 }: { left?: number; top?: number }) {
      this.scrollLeft += left
      this.scrollTop += top
    }
  }

  const previousHTMLElement = (globalThis as { HTMLElement?: unknown }).HTMLElement
  ;(globalThis as { HTMLElement?: unknown }).HTMLElement = FakeElement
  try {
    const root = new FakeElement()
    const autoScroll = useGridAutoScroll({
      getConfig: () => ({ margin: 20, speed: 10 }),
      rootClassName: 'vue-grid-layout'
    })

    autoScroll.init(root as never)
    autoScroll.maybeScroll({ clientX: 95, clientY: 95 } as never, root as never)
    assert.equal(root.scrollTop, 18)
    assert.equal(root.scrollLeft, 18)
    autoScroll.reset()
  } finally {
    ;(globalThis as { HTMLElement?: unknown }).HTMLElement = previousHTMLElement
  }
}

function testOverlayGeometry() {
  const geometry = createGridEditorOverlayGeometry({
    width: 120,
    margin: [5, 5],
    containerPadding: [10, 10],
    rowHeight: 20,
    cols: 3,
    maxRows: Infinity
  })

  assert.equal(geometry.colWidth, 30)
  assert.equal(geometry.gridLineXPx(2), 80)
  assert.equal(geometry.itemWidthPx(2), 65)
  assert.equal(geometry.guideXPx({
    id: 'right-a',
    axis: 'x',
    kind: 'right',
    position: 2,
    sourceIds: ['a'],
    targetId: 'b',
    distance: 0,
    priority: 1
  }), 75)
}

function testGroupDragInteractionOperations() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 },
    { i: 'c', x: 4, y: 0, w: 2, h: 1 }
  ]
  const state = {
    layout,
    oldLayout: null,
    activeDrag: null,
    oldDragItem: null,
    oldResizeItem: null,
    activeResize: null,
    resizing: false
  } as never
  const operations: LayoutOperation[] = []
  const engineBridge = {
    getLayoutEngineProp: () => ({}),
    isLegacyLayoutEngine: () => false,
    reset: () => undefined,
    start: () => undefined,
    getCommitted: () => layout,
    preview: (_id, operation, apply) => {
      operations.push(operation)
      apply({
        id: 'preview',
        status: 'changed',
        layout: [
          { i: 'a', x: 1, y: 0, w: 2, h: 1 },
          { i: 'b', x: 3, y: 0, w: 2, h: 1 },
          { i: 'c', x: 4, y: 1, w: 2, h: 1 }
        ],
        patches: [],
        affectedIds: ['a', 'b', 'c'],
        collisions: [],
        placeholder: { i: 'a', x: 1, y: 0, w: 2, h: 1 }
      })
      return null
    },
    commit: (_id, operation, apply) => {
      operations.push(operation)
      apply({
        id: 'commit',
        status: 'changed',
        layout: [
          { i: 'a', x: 1, y: 0, w: 2, h: 1 },
          { i: 'b', x: 3, y: 0, w: 2, h: 1 },
          { i: 'c', x: 4, y: 1, w: 2, h: 1 }
        ],
        patches: [],
        affectedIds: ['a', 'b', 'c'],
        collisions: []
      })
      return null
    }
  }
  const emitted: string[] = []
  const interactions = useGridDragResizeInteractions({
    props: {
      autoScroll: false,
      allowOverlap: false,
      cols: 12,
      compactType: 'vertical',
      containerPadding: null,
      dropStrategy: 'cursor',
      droppingItem: { i: 'drop', w: 1, h: 1 },
      margin: [10, 10],
      maxRows: Infinity,
      preventCollision: false,
      rowHeight: 30,
      transformScale: 1,
      verticalCompact: true,
      width: 900
    },
    state,
    eventBridge: {
      emitDragStart: () => emitted.push('drag-start'),
      emitDrag: () => emitted.push('drag'),
      emitDragStop: () => emitted.push('drag-stop'),
      emitResizeStart: () => undefined,
      emitResize: () => undefined,
      emitResizeStop: () => undefined,
      emitDrop: () => undefined,
      callDropDragOver: () => undefined
    },
    engineBridge: engineBridge as never,
    frameUpdate: {
      cancel: () => undefined,
      schedule: () => undefined,
      resetMovedFlags: () => undefined
    } as never,
    autoScroll: {
      init: () => undefined,
      maybeScroll: () => undefined,
      reset: () => undefined
    } as never,
    editor: {
      clearGuides: () => undefined,
      resetSnap: () => undefined,
      snapCandidate: (_activeId, _activeItem, candidate) => candidate,
      updateIntelligence: () => undefined,
      resolveMoveDrag: input => input.id === 'a'
        ? { kind: 'group', activeId: 'a', ids: ['a', 'b'] }
        : { kind: 'single', id: input.id },
      notifyMoveBlocked: () => undefined
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: next => {
      ;(state as { layout: Layout }).layout = next
    }
  } as never)

  const dragEvent = { e: {} as MouseEvent, node: {} as HTMLElement, newPosition: null } as never
  interactions.onDragStart('a', 0, 0, dragEvent)
  interactions.onDrag('a', 1, 0, dragEvent)
  interactions.onDragStop('a', 1, 0, dragEvent)
  assert.equal(operations[0].type, 'groupMove')
  assert.deepEqual((operations[0] as Extract<LayoutOperation, { type: 'groupMove' }>).ids, ['a', 'b'])
  assert.equal((operations[0] as Extract<LayoutOperation, { type: 'groupMove' }>).dx, 1)
  assert.equal(operations[1].type, 'groupMove')
  assert.ok(emitted.includes('drag'))
}

function testGroupDragBlockedFeedback() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 },
    { i: 'c', x: 4, y: 0, w: 2, h: 1 }
  ]
  const state = {
    layout,
    oldLayout: null,
    activeDrag: null,
    oldDragItem: null,
    oldResizeItem: null,
    activeResize: null,
    resizing: false
  } as never
  const blockedResult = {
    id: 'blocked',
    status: 'blocked',
    layout,
    patches: [],
    affectedIds: ['c'],
    collisions: [{ i: 'c', x: 4, y: 0, w: 2, h: 1 }],
    blocked: { reason: 'collision', itemIds: ['c'] },
    placeholder: { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    diagnostics: {
      operationId: 'blocked',
      operationType: 'groupMove',
      phase: 'preview',
      layoutSize: 3,
      affectedCount: 1,
      collisionCount: 1,
      indexHit: true,
      durationMs: 0
    }
  }
  const notified: Array<{ reason: string; ids: string[]; operationType?: string }> = []
  const engineBridge = {
    getLayoutEngineProp: () => ({}),
    isLegacyLayoutEngine: () => false,
    reset: () => undefined,
    start: () => undefined,
    getCommitted: () => layout,
    preview: (_id, _operation, apply) => {
      apply(blockedResult)
      return null
    },
    commit: (_id, _operation, apply) => {
      apply({
        ...blockedResult,
        id: 'blocked-commit',
        diagnostics: { ...blockedResult.diagnostics, operationId: 'blocked-commit', phase: 'commit' }
      })
      return null
    }
  }
  const interactions = useGridDragResizeInteractions({
    props: {
      autoScroll: false,
      allowOverlap: false,
      cols: 12,
      compactType: 'vertical',
      containerPadding: null,
      dropStrategy: 'cursor',
      droppingItem: { i: 'drop', w: 1, h: 1 },
      margin: [10, 10],
      maxRows: Infinity,
      preventCollision: true,
      rowHeight: 30,
      transformScale: 1,
      verticalCompact: true,
      width: 900
    },
    state,
    eventBridge: {
      emitDragStart: () => undefined,
      emitDrag: () => undefined,
      emitDragStop: () => undefined,
      emitResizeStart: () => undefined,
      emitResize: () => undefined,
      emitResizeStop: () => undefined,
      emitDrop: () => undefined,
      callDropDragOver: () => undefined
    },
    engineBridge: engineBridge as never,
    frameUpdate: {
      cancel: () => undefined,
      schedule: () => undefined,
      resetMovedFlags: () => undefined
    } as never,
    autoScroll: {
      init: () => undefined,
      maybeScroll: () => undefined,
      reset: () => undefined
    } as never,
    editor: {
      clearGuides: () => undefined,
      resetSnap: () => undefined,
      snapCandidate: (_activeId, _activeItem, candidate) => candidate,
      updateIntelligence: () => undefined,
      resolveMoveDrag: () => ({ kind: 'group', activeId: 'a', ids: ['a', 'b'] }),
      notifyMoveBlocked: input => notified.push({
        reason: input.reason,
        ids: input.ids,
        operationType: input.operationResult?.diagnostics?.operationType
      })
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: () => undefined
  } as never)

  const dragEvent = { e: {} as MouseEvent, node: {} as HTMLElement, newPosition: null } as never
  interactions.onDragStart('a', 0, 0, dragEvent)
  interactions.onDrag('a', 1, 0, dragEvent)
  assert.equal(interactions.dragBlocked.value, true)
  assert.equal(interactions.dragBlockedReason.value, 'collision')
  assert.deepEqual(interactions.dragBlockedItemIds.value, ['c'])
  interactions.onDragStop('a', 1, 0, dragEvent)
  assert.equal(notified.length, 1)
  assert.deepEqual(notified[0], { reason: 'collision', ids: ['c'], operationType: 'groupMove' })
}

function testRuntimeSkipBlockedSingleAllowedGroupIntent() {
  const layout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 1, y: 0, w: 1, h: 1 }
  ])
  const controller = createGridEditorController({
    layout,
    defaultMode: 'edit',
    commandPolicy: 'skip-blocked',
    editorMetaById: ref({ b: { locked: true } })
  })
  controller.selection.value = createGridEditorSelection(['a', 'b'], 'api')

  const runtime = useGridEditorRuntime({
    props: {
      allowOverlap: false,
      cols: 12,
      compactType: 'vertical',
      editor: {
        controller,
        commandPolicy: 'skip-blocked'
      },
      margin: [10, 10],
      maxRows: Infinity,
      preventCollision: false,
      rowHeight: 30,
      verticalCompact: true
    },
    layoutRef: layout,
    persistenceController: null,
    engineBridge: {
      getLayoutEngineOptions: () => ({
        cols: 12,
        maxRows: Infinity,
        compactType: 'vertical',
        allowOverlap: false,
        preventCollision: false
      }),
      isLegacyLayoutEngine: () => false
    },
    getLayout: () => layout.value,
    getOldDragItem: () => null,
    getOldResizeItem: () => null,
    isDropping: () => false,
    getInteractionState: () => null
  } as never)

  const groupIntent = runtime.resolveMoveDrag({
    id: 'a',
    item: layout.value[0],
    layout: layout.value,
    legacyLayoutEngine: false
  })
  assert.equal(groupIntent.kind, 'group')
  if (groupIntent.kind === 'group') {
    assert.deepEqual(groupIntent.ids, ['a'])
  }

  const legacyIntent = runtime.resolveMoveDrag({
    id: 'a',
    item: layout.value[0],
    layout: layout.value,
    legacyLayoutEngine: true
  })
  assert.equal(legacyIntent.kind, 'blocked')
  if (legacyIntent.kind === 'blocked') {
    assert.equal(legacyIntent.reason, 'unsupported')
    assert.deepEqual(legacyIntent.ids, ['a'])
  }
}

testRootAttrsSplit()
testEventBridge()
testFrameUpdate()
testAutoScroll()
testOverlayGeometry()
testGroupDragInteractionOperations()
testGroupDragBlockedFeedback()
testRuntimeSkipBlockedSingleAllowedGroupIntent()

console.log('grid-layout-internal-core tests passed')
