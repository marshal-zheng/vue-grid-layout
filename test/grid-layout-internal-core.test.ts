import assert from 'assert'
import { computed, ref } from 'vue'
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
import { useGridDropInteractions } from '../lib/grid-layout/useGridDropInteractions'
import { useGridEditorRuntime } from '../lib/grid-layout/useGridEditorRuntime'
import {
  applyExternalDropPreviewResult,
  blockExternalDropSession,
  buildDropFitOperationFromSession,
  clearExternalDropSession,
  commitExternalDropSession,
  createExternalDropSession,
  getExternalDropGhost,
  getExternalDropRenderLayout,
  isExternalDropBlocked,
  isExternalDropping,
  resolveExternalDropCandidate
} from '../lib/grid-layout/externalDropSession'
import { useGridItemDrag } from '../lib/grid-item/useGridItemDrag'
import { createGridEditorOverlayGeometry } from '../lib/grid-layout/GridEditorOverlay'
import { calcGridItemPosition } from '../lib/calculateUtils'
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

function testExternalDropSessionHelpers() {
  const baseLayout: Layout = [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]
  const session = createExternalDropSession({
    interactionId: 'drop-interaction:drop',
    sourceItem: { i: 'drop', w: 1, h: 1 },
    baseLayout: [...baseLayout, { i: 'drop', x: 9, y: 9, w: 1, h: 1 }],
    strategy: 'auto'
  })

  assert.equal(session.id, 'drop')
  assert.deepEqual(
    session.baseLayout.map(item => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h })),
    baseLayout
  )
  assert.equal(session.ghostItem, null)

  const resolved = resolveExternalDropCandidate(session, {
    overrides: { w: 3, h: 2 },
    target: { x: 4, y: 1 },
    snapCandidate: (_activeId, _activeItem, candidate) => ({ ...candidate, x: candidate.x + 1 })
  })
  assert.deepEqual(
    { x: resolved.resolvedItem.x, y: resolved.resolvedItem.y, w: resolved.resolvedItem.w, h: resolved.resolvedItem.h },
    { x: 5, y: 1, w: 3, h: 2 }
  )

  const previewOperation = buildDropFitOperationFromSession(resolved, 'preview')
  assert.deepEqual(previewOperation, {
    type: 'dropFit',
    item: { i: 'drop', w: 3, h: 2 },
    strategy: 'cursor',
    target: { x: 4, y: 1 }
  })

  const previewed = applyExternalDropPreviewResult(resolved, {
    id: 'preview',
    status: 'changed',
    layout: [...baseLayout, { i: 'drop', x: 2, y: 3, w: 3, h: 2 }],
    placeholder: { i: 'drop', x: 2, y: 3, w: 3, h: 2 },
    drop: { position: { x: 2, y: 3 }, strategy: 'cursor' }
  })
  assert.equal(previewed.status, 'ready')
  const previewGhost = getExternalDropGhost({ externalDropSession: previewed })
  assert.deepEqual(
    previewGhost && { i: previewGhost.i, x: previewGhost.x, y: previewGhost.y, w: previewGhost.w, h: previewGhost.h },
    { i: 'drop', x: 2, y: 3, w: 3, h: 2 }
  )
  assert.deepEqual(
    getExternalDropRenderLayout({ externalDropSession: previewed }, baseLayout)
      .map(item => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h })),
    baseLayout
  )

  const commitOperation = buildDropFitOperationFromSession(previewed, 'commit')
  assert.deepEqual(commitOperation, {
    type: 'dropFit',
    item: { i: 'drop', w: 3, h: 2 },
    strategy: 'cursor',
    target: { x: 2, y: 3 }
  })

  const committed = commitExternalDropSession(previewed, {
    id: 'commit',
    status: 'changed',
    layout: [...baseLayout, { i: 'drop', x: 2, y: 3, w: 3, h: 2, isDraggable: false }],
    placeholder: { i: 'drop', x: 2, y: 3, w: 3, h: 2, isDraggable: false },
    drop: { position: { x: 2, y: 3 }, strategy: 'cursor' }
  })
  assert.deepEqual(
    committed.eventLayout.map(item => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h })),
    baseLayout
  )
  assert.deepEqual(
    committed.committedItem && {
      i: committed.committedItem.i,
      x: committed.committedItem.x,
      y: committed.committedItem.y,
      w: committed.committedItem.w,
      h: committed.committedItem.h,
      isDraggable: committed.committedItem.isDraggable
    },
    { i: 'drop', x: 2, y: 3, w: 3, h: 2, isDraggable: undefined }
  )

  const blocked = blockExternalDropSession(previewed, 'no-fit', {
    geometry: { i: 'drop', x: 8, y: 8, w: 3, h: 2 }
  })
  assert.equal(isExternalDropping({ externalDropSession: blocked }), true)
  assert.equal(isExternalDropBlocked({ externalDropSession: blocked }), true)
  assert.deepEqual(blocked.ghostItem && { x: blocked.ghostItem.x, y: blocked.ghostItem.y }, { x: 8, y: 8 })
  assert.equal(clearExternalDropSession(), null)
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

function testOverlayGeometryRenderPrecision() {
  const geometry = createGridEditorOverlayGeometry({
    width: 101,
    margin: [5, 5],
    containerPadding: [10, 10],
    rowHeight: 20.25,
    renderPrecision: 'subpixel',
    cols: 3,
    maxRows: Infinity
  })
  const position = calcGridItemPosition({
    margin: [5, 5],
    containerPadding: [10, 10],
    rowHeight: 20.25,
    renderPrecision: 'subpixel',
    cols: 3,
    maxRows: Infinity,
    containerWidth: 101
  }, 1, 1, 1, 2)
  assert.equal(geometry.itemLeftPx(1), position.left)
  assert.equal(geometry.itemTopPx(1), position.top)
  assert.equal(geometry.itemHeightPx(2), position.height)
}

function testUseGridItemDragActivationThreshold() {
  const events: string[] = []
  const state = { dragging: null, resizing: null }
  const drag = useGridItemDrag({
    attrs: {
      onDragStart: (_i, x, y) => events.push(`start:${x}:${y}`),
      onDrag: (_i, x, y) => events.push(`drag:${x}:${y}`),
      onDragStop: (_i, x, y) => events.push(`stop:${x}:${y}`)
    },
    elementRef: ref(null),
    positionParams: computed(() => ({
      cols: 12,
      containerPadding: [0, 0],
      containerWidth: 120,
      margin: [0, 0],
      maxRows: Infinity,
      rowHeight: 10,
      renderPrecision: 'integer' as const
    })),
    props: {
      containerWidth: 120,
      dragActivationDistance: 4,
      droppingPosition: null,
      h: 1,
      i: 'a',
      isBounded: false,
      margin: [0, 0],
      rowHeight: 10,
      w: 1,
      x: 0,
      y: 0
    },
    state
  })
  const node = {} as HTMLElement
  drag.onDragStart({ type: 'mousedown' } as Event, { node, deltaX: 0, deltaY: 0 })
  drag.onDrag({ type: 'mousemove' } as Event, { node, deltaX: 3, deltaY: 0 })
  drag.onDragStop({ type: 'mouseup' } as Event, { node, deltaX: 0, deltaY: 0 })
  assert.deepEqual(events, [])
  assert.equal(state.dragging, null)

  drag.onDragStart({ type: 'mousedown' } as Event, { node, deltaX: 0, deltaY: 0 })
  drag.onDrag({ type: 'mousemove' } as Event, { node, deltaX: 4, deltaY: 0 })
  drag.onDrag({ type: 'mousemove' } as Event, { node, deltaX: 10, deltaY: 0 })
  drag.onDragStop({ type: 'mouseup' } as Event, { node, deltaX: 0, deltaY: 0 })
  assert.deepEqual(events, [
    'start:0:0',
    'drag:1:0',
    'stop:1:0'
  ])
}

function testUseGridItemDragBoundedAndDroppingProxy() {
  const events: string[] = []
  const state = { dragging: null, resizing: null }
  const props = {
    containerWidth: 100,
    dragActivationDistance: 4,
    droppingPosition: null as null | { left: number; top: number; e: Event },
    h: 1,
    i: 'a',
    isBounded: true,
    margin: [0, 0],
    rowHeight: 10,
    w: 1,
    x: 0,
    y: 0
  }
  const node = {
    offsetParent: { clientHeight: 30 }
  } as HTMLElement
  const elementRef = ref<HTMLElement | null>(node)
  const drag = useGridItemDrag({
    attrs: {
      onDragStart: (_i, x, y) => events.push(`start:${x}:${y}`),
      onDrag: (_i, x, y) => events.push(`drag:${x}:${y}`),
      onDragStop: (_i, x, y) => events.push(`stop:${x}:${y}`)
    },
    elementRef,
    positionParams: computed(() => ({
      cols: 10,
      containerPadding: [0, 0],
      containerWidth: 100,
      margin: [0, 0],
      maxRows: Infinity,
      rowHeight: 10,
      renderPrecision: 'integer' as const
    })),
    props,
    state
  })

  drag.onDragStart({ type: 'mousedown' } as Event, { node, deltaX: 0, deltaY: 0 })
  drag.onDrag({ type: 'mousemove' } as Event, { node, deltaX: 200, deltaY: 50 })
  drag.onDragStop({ type: 'mouseup' } as Event, { node, deltaX: 0, deltaY: 0 })
  assert.deepEqual(events, ['start:0:0', 'drag:9:2', 'stop:9:2'])

  events.length = 0
  props.isBounded = false
  props.droppingPosition = { left: 0, top: 0, e: { type: 'dragover' } as Event }
  drag.moveDroppingItem()
  props.droppingPosition = { left: 20, top: 0, e: { type: 'dragover' } as Event }
  drag.moveDroppingItem({ left: 0, top: 0 })
  drag.onDragStop({ type: 'drop' } as Event, { node, deltaX: 0, deltaY: 0 })
  assert.deepEqual(events, ['start:0:0', 'drag:2:0', 'stop:2:0'])
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
  const requestIds: string[] = []
  const engineBridge = {
    getLayoutEngineProp: () => ({}),
    isLegacyLayoutEngine: () => false,
    reset: () => undefined,
    start: () => undefined,
    getCommitted: () => layout,
    preview: (id, operation, apply) => {
      requestIds.push(id)
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
    commit: (id, operation, apply) => {
      requestIds.push(id)
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
  assert.equal(requestIds[0], 'drag-interaction:a:drag-preview:1')
  assert.equal(requestIds[1], 'drag-interaction:a:drag-commit:2')
  assert.ok(emitted.includes('drag'))
}

function testDragPlaceholderFollowsPointerTarget() {
  const layout: Layout = [
    { i: 'region', x: 5, y: 3, w: 7, h: 3 },
    { i: 'health', x: 8, y: 0, w: 4, h: 3, static: true }
  ]
  const state = {
    layout,
    oldLayout: null,
    activeDrag: null as LayoutItem | null,
    oldDragItem: null,
    oldResizeItem: null,
    activeResize: null,
    resizing: false
  }
  let emittedPlaceholder: LayoutItem | undefined
  let intelligencePlaceholder: LayoutItem | undefined
  const operations: LayoutOperation[] = []
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
      verticalCompact: false,
      width: 900
    },
    state,
    eventBridge: {
      emitDragStart: () => undefined,
      emitDrag: (_layout, _oldItem, _newItem, placeholder) => {
        emittedPlaceholder = placeholder
      },
      emitDragStop: () => undefined,
      emitResizeStart: () => undefined,
      emitResize: () => undefined,
      emitResizeStop: () => undefined,
      emitDrop: () => undefined,
      callDropDragOver: () => undefined
    },
    engineBridge: {
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
            { i: 'region', x: 5, y: 8, w: 7, h: 3 },
            { i: 'health', x: 8, y: 0, w: 4, h: 3, static: true }
          ],
          patches: [],
          affectedIds: ['region'],
          collisions: [],
          placeholder: { i: 'region', x: 5, y: 8, w: 7, h: 3 }
        })
        return null
      },
      commit: () => null
    } as never,
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
      updateIntelligence: (_id, _item, placeholder) => {
        intelligencePlaceholder = placeholder
      },
      resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
      notifyMoveBlocked: () => undefined
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: () => undefined
  } as never)

  const dragEvent = { e: {} as MouseEvent, node: {} as HTMLElement, newPosition: null } as never
  interactions.onDragStart('region', 5, 3, dragEvent)
  interactions.onDrag('region', 5, 1, dragEvent)

  assert.equal(operations[0].type, 'move')
  assert.equal((operations[0] as Extract<LayoutOperation, { type: 'move' }>).y, 1)
  assert.deepEqual(
    state.activeDrag && { i: state.activeDrag.i, x: state.activeDrag.x, y: state.activeDrag.y, w: state.activeDrag.w, h: state.activeDrag.h },
    { i: 'region', x: 5, y: 1, w: 7, h: 3 }
  )
  assert.deepEqual(
    emittedPlaceholder && { i: emittedPlaceholder.i, x: emittedPlaceholder.x, y: emittedPlaceholder.y },
    { i: 'region', x: 5, y: 1 }
  )
  assert.deepEqual(
    intelligencePlaceholder && { i: intelligencePlaceholder.i, x: intelligencePlaceholder.x, y: intelligencePlaceholder.y },
    { i: 'region', x: 5, y: 1 }
  )
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

function testClickLikeDragDoesNotShowGuides() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 3, y: 0, w: 2, h: 1 }
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
  let guideUpdates = 0
  let guideClears = 0
  const emitted: string[] = []
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
        status: 'noop',
        layout,
        patches: [],
        affectedIds: [],
        collisions: [],
        placeholder: { i: 'a', x: 0, y: 0, w: 2, h: 1 }
      })
      return null
    },
    commit: (_id, operation, apply) => {
      operations.push(operation)
      apply({
        id: 'commit',
        status: 'noop',
        layout,
        patches: [],
        affectedIds: [],
        collisions: []
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
      clearGuides: () => {
        guideClears += 1
      },
      resetSnap: () => undefined,
      snapCandidate: (_activeId, _activeItem, candidate) => candidate,
      updateIntelligence: () => {
        guideUpdates += 1
      },
      resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
      notifyMoveBlocked: () => undefined
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: () => undefined
  } as never)

  const dragEvent = { e: {} as MouseEvent, node: {} as HTMLElement, newPosition: null } as never
  interactions.onDragStart('a', 0, 0, dragEvent)
  interactions.onDrag('a', 0, 0, dragEvent)
  interactions.onDragStop('a', 0, 0, dragEvent)

  assert.deepEqual(operations, [])
  assert.equal(guideUpdates, 0)
  assert.ok(guideClears >= 1)
  assert.deepEqual(emitted, ['drag-start', 'drag-stop'])
}

function testResizeNoopDoesNotPreviewOrCommit() {
  const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]
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
  const emitted: string[] = []
  let guideUpdates = 0
  let layoutChanges = 0
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
      emitDragStart: () => undefined,
      emitDrag: () => undefined,
      emitDragStop: () => undefined,
      emitResizeStart: () => emitted.push('resize-start'),
      emitResize: () => emitted.push('resize'),
      emitResizeStop: () => emitted.push('resize-stop'),
      emitDrop: () => undefined,
      callDropDragOver: () => undefined
    },
    engineBridge: {
      getLayoutEngineProp: () => ({}),
      isLegacyLayoutEngine: () => false,
      reset: () => undefined,
      start: () => undefined,
      getCommitted: () => layout,
      preview: (_id, operation) => {
        operations.push(operation)
        return null
      },
      commit: (_id, operation) => {
        operations.push(operation)
        return null
      }
    } as never,
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
      updateIntelligence: () => {
        guideUpdates += 1
      },
      resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
      notifyMoveBlocked: () => undefined
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: () => {
      layoutChanges += 1
    }
  } as never)

  const resizeEvent = {
    e: {} as MouseEvent,
    node: {} as HTMLElement,
    size: { width: 20, height: 20 },
    handle: 'se'
  } as never
  interactions.onResizeStart('a', 2, 2, resizeEvent)
  interactions.onResize('a', 2, 2, resizeEvent)
  interactions.onResizeStop('a', 2, 2, resizeEvent)

  assert.deepEqual(operations, [])
  assert.deepEqual(emitted, ['resize-start', 'resize-stop'])
  assert.equal(guideUpdates, 0)
  assert.equal(layoutChanges, 0)
}

function testResizeIntentCarriesConstraintThroughPreviewAndCommit() {
  const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]
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
  const constraint = {
    aspectRatio: {
      enabled: true,
      ratio: 2,
      ratioKind: 'visual-px' as const,
      source: 'explicit' as const,
      fallbackPolicy: 'block' as const,
      edgeHandles: [],
      metrics: { colWidth: 100, rowHeight: 100, margin: [0, 0] as [number, number] }
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
      margin: [0, 0],
      maxRows: Infinity,
      preventCollision: false,
      rowHeight: 100,
      transformScale: 1,
      verticalCompact: true,
      width: 1200
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
    engineBridge: {
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
          layout: [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }],
          patches: [],
          affectedIds: ['a'],
          collisions: [],
          placeholder: { i: 'a', x: 0, y: 0, w: 4, h: 2 }
        })
        return null
      },
      commit: (_id, operation, apply) => {
        operations.push(operation)
        apply({
          id: 'commit',
          status: 'changed',
          layout: [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }],
          patches: [],
          affectedIds: ['a'],
          collisions: []
        })
        return null
      }
    } as never,
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
      resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
      resolveResizeIntent: input => ({
        kind: 'allowed',
        candidate: { ...input.rawCandidate, h: 2 },
        constraint
      }),
      notifyMoveBlocked: () => undefined,
      commitResize: async () => ({ status: 'changed' })
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: next => {
      ;(state as { layout: Layout }).layout = next
    }
  } as never)

  const resizeEvent = {
    e: {} as MouseEvent,
    node: {} as HTMLElement,
    size: { width: 40, height: 40 },
    handle: 'se'
  } as never
  interactions.onResizeStart('a', 2, 2, resizeEvent)
  interactions.onResize('a', 4, 4, resizeEvent)
  interactions.onResizeStop('a', 4, 4, resizeEvent)

  assert.equal(operations.length, 2)
  assert.equal((operations[0] as Extract<LayoutOperation, { type: 'resize' }>).h, 2)
  assert.equal((operations[1] as Extract<LayoutOperation, { type: 'resize' }>).h, 2)
  assert.equal(Boolean((operations[0] as Extract<LayoutOperation, { type: 'resize' }>).constraint?.aspectRatio), true)
}

function testRuntimeSidecarResizeWithoutEditorController() {
  const layout = ref<Layout>([
    { i: 'logo', x: 0, y: 0, w: 2, h: 2 }
  ])
  const aspectRatio = {
    enabled: true,
    ratio: 1,
    ratioKind: 'visual-px' as const,
    source: 'explicit' as const,
    fallbackPolicy: 'block' as const,
    edgeHandles: [],
    metrics: { colWidth: 100, rowHeight: 100, margin: [0, 0] as [number, number] }
  }
  const capability = {
    id: 'logo',
    visible: true,
    editable: true,
    draggable: true,
    resizable: true,
    bounded: true,
    static: false,
    locked: false,
    resizeHandles: ['se', 'sw', 'ne', 'nw'],
    aspectRatio,
    resizeConstraint: {
      handlePolicy: {
        allowedHandles: ['se', 'sw', 'ne', 'nw'],
        blockedReason: 'handle-disabled'
      },
      aspectRatio
    },
    sources: {},
    sourceLists: {},
    diagnostics: []
  }
  const runtime = useGridEditorRuntime({
    props: {
      allowOverlap: false,
      cols: 12,
      compactType: 'vertical',
      editor: false,
      itemCapabilities: { logo: capability },
      resizeConstraints: { logo: aspectRatio },
      margin: [0, 0],
      maxRows: Infinity,
      preventCollision: false,
      rowHeight: 100,
      transformScale: 1,
      verticalCompact: true,
      width: 1200
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
    getOldResizeItem: () => layout.value[0],
    isDropping: () => false,
    getInteractionState: () => null
  } as never)

  assert.equal(runtime.controller, null)
  const itemState = runtime.getItemRenderState(layout.value[0], {
    isDraggable: true,
    isResizable: true,
    isBounded: true
  })
  assert.equal(itemState.resizable, true)
  assert.deepEqual(itemState.resizeHandles, ['se', 'sw', 'ne', 'nw'])

  const intent = runtime.resolveResizeIntent({
    id: 'logo',
    item: layout.value[0],
    layout: layout.value,
    handle: 'se',
    rawCandidate: { ...layout.value[0], w: 4, h: 1 },
    metrics: { colWidth: 100, rowHeight: 100, margin: [0, 0] },
    phase: 'preview'
  })
  assert.equal(intent.kind, 'allowed')
  if (intent.kind === 'allowed') {
    assert.equal(intent.candidate.w, 4)
    assert.equal(intent.candidate.h, 4)
    assert.equal(Boolean(intent.constraint?.aspectRatio), true)
  }
}

function testRuntimeLegacyHistorySync() {
  const layout = ref<Layout>([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 }
  ])
  const calls: Array<{ mode: string; layout: Layout | null }> = []
  const historyStore = {
    replacePresent: (next: Layout | null) => {
      calls.push({ mode: 'replace', layout: next })
    },
    push: (next: Layout) => {
      calls.push({ mode: 'push', layout: next })
    }
  }
  const runtime = useGridEditorRuntime({
    props: {
      allowOverlap: false,
      cols: 12,
      compactType: 'vertical',
      editor: {
        legacyHistoryStore: historyStore
      },
      margin: [0, 0],
      maxRows: Infinity,
      preventCollision: false,
      rowHeight: 100,
      transformScale: 1,
      verticalCompact: true,
      width: 1200
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

  runtime.syncHistory(layout.value, 'replace')
  runtime.syncHistory([{ ...layout.value[0], x: 1 }], 'push')

  assert.equal(calls.length, 2)
  assert.equal(calls[0].mode, 'replace')
  assert.equal(calls[1].mode, 'push')
  assert.equal(calls[1].layout?.[0].x, 1)
}

function testDropNoopDoesNotRepeatPreview() {
  const previousElement = (globalThis as { Element?: unknown }).Element
  class FakeElement {
    classList = { contains: () => true }
    getBoundingClientRect() {
      return { left: 0, top: 0 }
    }
  }
  ;(globalThis as { Element?: unknown }).Element = FakeElement
  try {
    const state = {
      layout: [] as Layout,
      oldLayout: null,
      activeDrag: null,
      oldDragItem: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      droppingPosition: undefined,
      externalDropSession: null as any,
      suppressLayoutChange: false,
      resizing: false
    }
    let previews = 0
    let guideUpdates = 0
    const interactions = useGridDropInteractions({
      props: {
        autoScroll: false,
        allowOverlap: false,
        cols: 12,
        compactType: 'vertical',
        containerPadding: [0, 0],
        dropStrategy: 'auto',
        droppingItem: { i: 'drop', w: 1, h: 1 },
        margin: [0, 0],
        maxRows: Infinity,
        preventCollision: false,
        rowHeight: 10,
        transformScale: 1,
        verticalCompact: true,
        width: 120
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
      engineBridge: {
        getLayoutEngineProp: () => ({}),
        isLegacyLayoutEngine: () => false,
        reset: () => undefined,
        start: () => undefined,
        getCommitted: () => [],
        preview: (_id, _operation, apply) => {
          previews += 1
          apply({
            id: 'drop-preview',
            status: 'changed',
            layout: [{ i: 'drop', x: 1, y: 1, w: 1, h: 1 }],
            patches: [],
            affectedIds: ['drop'],
            collisions: [],
            placeholder: { i: 'drop', x: 1, y: 1, w: 1, h: 1 },
            drop: { position: { x: 1, y: 1 }, strategy: 'cursor' }
          })
          return null
        },
        commit: () => null
      } as never,
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
        updateIntelligence: () => {
          guideUpdates += 1
        },
        resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
        notifyMoveBlocked: () => undefined
      },
      nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
      isFirefox: false,
      layoutClassName: 'vue-grid-layout'
    } as never)

    const currentTarget = new FakeElement()
    const event = {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget,
      clientX: 10,
      clientY: 10
    } as never

    interactions.onDragEnter(event)
    interactions.onDragOver(event)
    interactions.onDragOver(event)

    assert.equal(previews, 1)
    assert.equal(guideUpdates, 1)
    assert.equal(state.activeDrag, null)
    assert.deepEqual(
      state.externalDropSession?.ghostItem && {
        i: state.externalDropSession.ghostItem.i,
        x: state.externalDropSession.ghostItem.x,
        y: state.externalDropSession.ghostItem.y
      },
      { i: 'drop', x: 1, y: 1 }
    )
    assert.equal(state.layout.length, 0)
  } finally {
    ;(globalThis as { Element?: unknown }).Element = previousElement
  }
}

function testExternalDropCursorTargetCentersGhostUnderPointer() {
  const previousElement = (globalThis as { Element?: unknown }).Element
  class FakeElement {
    classList = { contains: () => true }
    getBoundingClientRect() {
      return { left: 0, top: 0 }
    }
  }
  ;(globalThis as { Element?: unknown }).Element = FakeElement
  try {
    const state = {
      layout: [] as Layout,
      oldLayout: null,
      activeDrag: null,
      oldDragItem: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      droppingPosition: undefined,
      externalDropSession: null as any,
      suppressLayoutChange: false,
      resizing: false
    }
    let previewOperation: Extract<LayoutOperation, { type: 'dropFit' }> | null = null
    const interactions = useGridDropInteractions({
      props: {
        autoScroll: false,
        allowOverlap: false,
        cols: 12,
        compactType: 'vertical',
        containerPadding: [0, 0],
        dropStrategy: 'cursor',
        droppingItem: { i: 'drop', w: 2, h: 2 },
        margin: [0, 0],
        maxRows: Infinity,
        preventCollision: false,
        rowHeight: 10,
        transformScale: 1,
        verticalCompact: true,
        width: 120
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
      engineBridge: {
        getLayoutEngineProp: () => ({}),
        isLegacyLayoutEngine: () => false,
        reset: () => undefined,
        start: () => undefined,
        getCommitted: () => [],
        preview: (_id, operation, apply) => {
          previewOperation = operation as Extract<LayoutOperation, { type: 'dropFit' }>
          const target = previewOperation.target || { x: 0, y: 0 }
          const item = {
            i: 'drop',
            x: target.x,
            y: target.y,
            w: previewOperation.item.w,
            h: previewOperation.item.h
          }
          apply({
            id: 'drop-preview',
            status: 'changed',
            layout: [item],
            patches: [],
            affectedIds: ['drop'],
            collisions: [],
            placeholder: item,
            drop: { position: target, strategy: previewOperation.strategy }
          })
          return null
        },
        commit: () => null
      } as never,
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
        resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
        notifyMoveBlocked: () => undefined
      },
      nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
      isFirefox: false,
      layoutClassName: 'vue-grid-layout'
    } as never)

    const event = {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: new FakeElement(),
      clientX: 30,
      clientY: 30
    } as never

    interactions.onDragEnter(event)
    interactions.onDragOver(event)

    assert.deepEqual(
      (previewOperation as { target?: { x: number; y: number } } | null)?.target,
      { x: 2, y: 2 }
    )
    assert.deepEqual(
      state.externalDropSession?.ghostItem && {
        x: state.externalDropSession.ghostItem.x,
        y: state.externalDropSession.ghostItem.y
      },
      { x: 2, y: 2 }
    )
  } finally {
    ;(globalThis as { Element?: unknown }).Element = previousElement
  }
}

async function testAutoDropCommitUsesSessionPreviewTarget() {
  const previousElement = (globalThis as { Element?: unknown }).Element
  class FakeElement {
    classList = { contains: () => true }
    getBoundingClientRect() {
      return { left: 0, top: 0 }
    }
  }
  ;(globalThis as { Element?: unknown }).Element = FakeElement
  try {
    const baseLayout: Layout = [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 },
      { i: 'b', x: 6, y: 0, w: 2, h: 2 }
    ]
    const state = {
      layout: baseLayout,
      oldLayout: null,
      activeDrag: null as LayoutItem | null,
      oldDragItem: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      droppingPosition: undefined,
      externalDropSession: null as any,
      suppressLayoutChange: false,
      resizing: false
    }
    let commitOperation: LayoutOperation | null = null
    let emittedItem: LayoutItem | undefined
    const interactions = useGridDropInteractions({
      props: {
        autoScroll: false,
        allowOverlap: false,
        cols: 12,
        compactType: 'vertical',
        containerPadding: [0, 0],
        dropStrategy: 'auto',
        droppingItem: { i: 'drop', w: 2, h: 2 },
        margin: [0, 0],
        maxRows: Infinity,
        preventCollision: false,
        rowHeight: 10,
        transformScale: 1,
        verticalCompact: true,
        width: 120
      },
      state,
      eventBridge: {
        emitDragStart: () => undefined,
        emitDrag: () => undefined,
        emitDragStop: () => undefined,
        emitResizeStart: () => undefined,
        emitResize: () => undefined,
        emitResizeStop: () => undefined,
        emitDrop: (_layout, _event, item) => {
          emittedItem = item
        },
        callDropDragOver: () => ({ w: 4, h: 2 })
      },
      engineBridge: {
        getLayoutEngineProp: () => ({}),
        isLegacyLayoutEngine: () => false,
        reset: () => undefined,
        start: () => undefined,
        getCommitted: () => baseLayout,
        preview: (_id, operation, apply) => {
          const target = operation.target || { x: 0, y: 0 }
          const item = {
            i: 'drop',
            x: target.x,
            y: target.y,
            w: operation.item.w,
            h: operation.item.h
          }
          apply({
            id: 'drop-preview',
            status: 'changed',
            layout: [...baseLayout, item],
            patches: [],
            affectedIds: ['drop'],
            collisions: [],
            placeholder: item,
            drop: { position: target, strategy: 'cursor' }
          })
          return null
        },
        commit: (_id, operation, apply) => {
          commitOperation = operation
          const fallbackPosition = { x: 8, y: 0 }
          const target = operation.strategy === 'cursor' && operation.target
            ? operation.target
            : fallbackPosition
          const item = {
            i: 'drop',
            x: target.x,
            y: target.y,
            w: operation.item.w,
            h: operation.item.h
          }
          apply({
            id: 'drop-commit',
            status: 'changed',
            layout: [...baseLayout, item],
            patches: [],
            affectedIds: ['drop'],
            collisions: [],
            placeholder: item,
            drop: { position: target, strategy: operation.strategy }
          })
          return null
        }
      } as never,
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
        resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
        notifyMoveBlocked: () => undefined
      },
      nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
      isFirefox: false,
      layoutClassName: 'vue-grid-layout'
    } as never)

    const event = {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: new FakeElement(),
      clientX: 40,
      clientY: 30
    } as never

    interactions.onDragEnter(event)
    interactions.onDragOver(event)
    const ghost = state.externalDropSession?.ghostItem
    interactions.onDrop(event)
    await Promise.resolve()

    const dropOperation = commitOperation as Extract<LayoutOperation, { type: 'dropFit' }> | null
    assert.equal(state.activeDrag, null)
    assert.equal(dropOperation?.strategy, 'cursor')
    assert.deepEqual(dropOperation?.target, ghost && { x: ghost.x, y: ghost.y })
    assert.equal(dropOperation?.item.w, ghost?.w)
    assert.equal(dropOperation?.item.h, ghost?.h)
    assert.equal(emittedItem?.x, ghost?.x)
    assert.equal(emittedItem?.y, ghost?.y)
    assert.equal(emittedItem?.w, ghost?.w)
    assert.equal(emittedItem?.h, ghost?.h)
  } finally {
    ;(globalThis as { Element?: unknown }).Element = previousElement
  }
}

async function testDropCommitsVisibleGhostWhilePreviewPending() {
  const previousElement = (globalThis as { Element?: unknown }).Element
  class FakeElement {
    classList = { contains: () => true }
    getBoundingClientRect() {
      return { left: 0, top: 0 }
    }
  }
  ;(globalThis as { Element?: unknown }).Element = FakeElement
  try {
    const baseLayout: Layout = [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 }
    ]
    const state = {
      layout: baseLayout,
      oldLayout: null,
      activeDrag: null as LayoutItem | null,
      oldDragItem: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      droppingPosition: undefined,
      externalDropSession: null as any,
      suppressLayoutChange: false,
      resizing: false
    }
    let previewCalls = 0
    let commitOperation: LayoutOperation | null = null
    let emittedItem: LayoutItem | undefined
    const interactions = useGridDropInteractions({
      props: {
        autoScroll: false,
        allowOverlap: false,
        cols: 12,
        compactType: 'vertical',
        containerPadding: [0, 0],
        dropStrategy: 'auto',
        droppingItem: { i: 'drop', w: 2, h: 2 },
        margin: [0, 0],
        maxRows: Infinity,
        preventCollision: false,
        rowHeight: 10,
        transformScale: 1,
        verticalCompact: true,
        width: 120
      },
      state,
      eventBridge: {
        emitDragStart: () => undefined,
        emitDrag: () => undefined,
        emitDragStop: () => undefined,
        emitResizeStart: () => undefined,
        emitResize: () => undefined,
        emitResizeStop: () => undefined,
        emitDrop: (_layout, _event, item) => {
          emittedItem = item
        },
        callDropDragOver: () => ({ w: 2, h: 2 })
      },
      engineBridge: {
        getLayoutEngineProp: () => ({}),
        isLegacyLayoutEngine: () => false,
        reset: () => undefined,
        start: () => undefined,
        getCommitted: () => baseLayout,
        preview: (_id, operation, apply) => {
          previewCalls += 1
          const target = operation.target || { x: 0, y: 0 }
          const item = {
            i: 'drop',
            x: target.x,
            y: target.y,
            w: operation.item.w,
            h: operation.item.h
          }
          if (previewCalls === 1) {
            apply({
              id: 'drop-preview-ready',
              status: 'changed',
              layout: [...baseLayout, item],
              patches: [],
              affectedIds: ['drop'],
              collisions: [],
              placeholder: item,
              drop: { position: target, strategy: 'cursor' }
            })
          }
          return null
        },
        commit: (_id, operation, apply) => {
          commitOperation = operation
          const target = operation.target || { x: 0, y: 0 }
          const item = {
            i: 'drop',
            x: target.x,
            y: target.y,
            w: operation.item.w,
            h: operation.item.h
          }
          apply({
            id: 'drop-commit',
            status: 'changed',
            layout: [...baseLayout, item],
            patches: [],
            affectedIds: ['drop'],
            collisions: [],
            placeholder: item,
            drop: { position: target, strategy: operation.strategy }
          })
          return null
        }
      } as never,
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
        resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
        notifyMoveBlocked: () => undefined
      },
      nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
      isFirefox: false,
      layoutClassName: 'vue-grid-layout'
    } as never)

    const makeEvent = (clientX: number) => ({
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: new FakeElement(),
      clientX,
      clientY: 30
    }) as never
    const firstEvent = makeEvent(40)
    const secondEvent = makeEvent(60)

    interactions.onDragEnter(firstEvent)
    interactions.onDragOver(firstEvent)
    const visibleGhost = state.externalDropSession?.ghostItem
    interactions.onDragOver(secondEvent)
    assert.equal(state.externalDropSession?.status, 'previewing')
    assert.equal(state.externalDropSession?.ghostItem?.x, visibleGhost?.x)
    interactions.onDrop(secondEvent)
    await Promise.resolve()

    const dropOperation = commitOperation as Extract<LayoutOperation, { type: 'dropFit' }> | null
    assert.equal(previewCalls, 2)
    assert.equal(dropOperation?.strategy, 'cursor')
    assert.deepEqual(dropOperation?.target, visibleGhost && { x: visibleGhost.x, y: visibleGhost.y })
    assert.equal(emittedItem?.x, visibleGhost?.x)
    assert.equal(emittedItem?.y, visibleGhost?.y)
    assert.equal(emittedItem?.w, visibleGhost?.w)
    assert.equal(emittedItem?.h, visibleGhost?.h)
  } finally {
    ;(globalThis as { Element?: unknown }).Element = previousElement
  }
}

async function testLegacyDropSessionPreviewBlockedAndCleanup() {
  const previousElement = (globalThis as { Element?: unknown }).Element
  class FakeElement {
    classList = { contains: () => true }
    getBoundingClientRect() {
      return { left: 0, top: 0 }
    }
  }
  ;(globalThis as { Element?: unknown }).Element = FakeElement
  try {
    const state = {
      layout: [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }],
      oldLayout: null,
      activeDrag: null as LayoutItem | null,
      oldDragItem: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      droppingPosition: undefined,
      externalDropSession: null as any,
      suppressLayoutChange: false,
      resizing: false
    }
    let emittedItem: LayoutItem | undefined
    const interactions = useGridDropInteractions({
      props: {
        autoScroll: false,
        allowOverlap: false,
        cols: 12,
        compactType: null,
        containerPadding: [0, 0],
        dropStrategy: 'cursor',
        droppingItem: { i: 'drop', w: 2, h: 2 },
        margin: [0, 0],
        maxRows: Infinity,
        preventCollision: false,
        rowHeight: 10,
        transformScale: 1,
        verticalCompact: false,
        width: 120
      },
      state,
      eventBridge: {
        emitDragStart: () => undefined,
        emitDrag: () => undefined,
        emitDragStop: () => undefined,
        emitResizeStart: () => undefined,
        emitResize: () => undefined,
        emitResizeStop: () => undefined,
        emitDrop: (_layout, _event, item) => {
          emittedItem = item
        },
        callDropDragOver: () => undefined
      },
      engineBridge: {
        getLayoutEngineProp: () => null,
        isLegacyLayoutEngine: () => true,
        reset: () => undefined,
        start: () => undefined,
        getCommitted: () => state.layout,
        preview: () => null,
        commit: () => null
      } as never,
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
        resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
        notifyMoveBlocked: () => undefined
      },
      nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
      isFirefox: false,
      layoutClassName: 'vue-grid-layout'
    } as never)

    const event = {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: new FakeElement(),
      clientX: 0,
      clientY: 0
    } as never

    interactions.onDragEnter(event)
    interactions.onDragOver(event)
    assert.equal(state.activeDrag, null)
    assert.deepEqual(
      state.externalDropSession?.ghostItem && {
        x: state.externalDropSession.ghostItem.x,
        y: state.externalDropSession.ghostItem.y
      },
      { x: 0, y: 2 }
    )
    interactions.onDrop(event)
    await Promise.resolve()
    assert.equal(emittedItem?.x, 0)
    assert.equal(emittedItem?.y, 2)
    assert.equal(state.externalDropSession, null)

    const blockedState = {
      ...state,
      layout: [{ i: 'a', x: 0, y: 0, w: 12, h: 1 }],
      externalDropSession: null as any
    }
    const blockedInteractions = useGridDropInteractions({
      props: {
        autoScroll: false,
        allowOverlap: false,
        cols: 12,
        compactType: null,
        containerPadding: [0, 0],
        dropStrategy: 'auto',
        droppingItem: { i: 'drop', w: 12, h: 2 },
        margin: [0, 0],
        maxRows: 2,
        preventCollision: false,
        rowHeight: 10,
        transformScale: 1,
        verticalCompact: false,
        width: 120
      },
      state: blockedState,
      eventBridge: {
        emitDragStart: () => undefined,
        emitDrag: () => undefined,
        emitDragStop: () => undefined,
        emitResizeStart: () => undefined,
        emitResize: () => undefined,
        emitResizeStop: () => undefined,
        emitDrop: () => {
          throw new Error('blocked drop should not emit')
        },
        callDropDragOver: () => undefined
      },
      engineBridge: {
        getLayoutEngineProp: () => null,
        isLegacyLayoutEngine: () => true,
        reset: () => undefined,
        start: () => undefined,
        getCommitted: () => blockedState.layout,
        preview: () => null,
        commit: () => null
      } as never,
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
        resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
        notifyMoveBlocked: () => undefined
      },
      nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
      isFirefox: false,
      layoutClassName: 'vue-grid-layout'
    } as never)
    blockedInteractions.onDragEnter(event)
    blockedInteractions.onDragOver(event)
    assert.equal(blockedState.externalDropSession?.status, 'blocked')
    assert.equal(blockedState.externalDropSession?.blocked?.reason, 'maxRows')
    blockedInteractions.onDrop(event)
    assert.equal(blockedState.externalDropSession, null)

    blockedInteractions.onDragEnter(event)
    blockedInteractions.onDragOver(event)
    blockedInteractions.onDragLeave(event)
    assert.equal(blockedState.externalDropSession, null)
  } finally {
    ;(globalThis as { Element?: unknown }).Element = previousElement
  }
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

async function testPointerCommandGuardRollback() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 3, y: 0, w: 2, h: 1 }
  ]
  const state = {
    layout,
    oldLayout: null,
    activeDrag: null,
    oldDragItem: null,
    oldResizeItem: null,
    activeResize: null,
    resizing: false,
    suppressLayoutChange: false
  } as never
  let layoutChanges = 0
  let rolledBack = false
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
      emitDragStart: () => undefined,
      emitDrag: () => undefined,
      emitDragStop: () => undefined,
      emitResizeStart: () => undefined,
      emitResize: () => undefined,
      emitResizeStop: () => undefined,
      emitDrop: () => undefined,
      callDropDragOver: () => undefined
    },
    engineBridge: {
      getLayoutEngineProp: () => ({}),
      isLegacyLayoutEngine: () => false,
      reset: () => undefined,
      start: () => undefined,
      getCommitted: () => layout,
      preview: (_id, _operation, apply) => {
        apply({
          id: 'preview',
          status: 'changed',
          layout: [
            { i: 'a', x: 1, y: 0, w: 2, h: 1 },
            { i: 'b', x: 3, y: 0, w: 2, h: 1 }
          ],
          patches: [],
          affectedIds: ['a'],
          collisions: [],
          placeholder: { i: 'a', x: 1, y: 0, w: 2, h: 1 }
        })
        return null
      },
      commit: (_id, _operation, apply) => {
        apply({
          id: 'commit',
          status: 'changed',
          layout: [
            { i: 'a', x: 1, y: 0, w: 2, h: 1 },
            { i: 'b', x: 3, y: 0, w: 2, h: 1 }
          ],
          patches: [],
          affectedIds: ['a'],
          collisions: []
        })
        return null
      }
    } as never,
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
      resolveMoveDrag: input => ({ kind: 'single', id: input.id }),
      notifyMoveBlocked: () => undefined,
      commitMove: async () => ({
        id: 'guard',
        type: 'move',
        status: 'cancelled',
        targetIds: ['a'],
        layoutPatches: [],
        metadataPatches: [],
        affectedIds: [],
        blocked: { reason: 'before-command-cancelled' },
        diagnostics: { durationMs: 0 }
      }),
      rollbackInteraction: rollbackLayout => {
        rolledBack = true
        ;(state as { layout: Layout }).layout = rollbackLayout
      }
    },
    nextInteractionRequestId: (kind, id) => `${kind}:${id}`,
    syncHistory: () => undefined,
    onLayoutMaybeChanged: () => {
      layoutChanges += 1
    }
  } as never)

  const dragEvent = { e: {} as MouseEvent, node: {} as HTMLElement, newPosition: null } as never
  interactions.onDragStart('a', 0, 0, dragEvent)
  interactions.onDrag('a', 1, 0, dragEvent)
  interactions.onDragStop('a', 1, 0, dragEvent)
  await Promise.resolve()
  assert.equal(rolledBack, true)
  assert.equal((state as { layout: Layout }).layout[0].x, 0)
  assert.equal(layoutChanges, 0)
}

testRootAttrsSplit()
testEventBridge()
testExternalDropSessionHelpers()
testFrameUpdate()
testAutoScroll()
testOverlayGeometry()
testOverlayGeometryRenderPrecision()
testUseGridItemDragActivationThreshold()
testUseGridItemDragBoundedAndDroppingProxy()
testGroupDragInteractionOperations()
testDragPlaceholderFollowsPointerTarget()
testGroupDragBlockedFeedback()
testClickLikeDragDoesNotShowGuides()
testResizeNoopDoesNotPreviewOrCommit()
testResizeIntentCarriesConstraintThroughPreviewAndCommit()
testRuntimeSidecarResizeWithoutEditorController()
testRuntimeLegacyHistorySync()
testDropNoopDoesNotRepeatPreview()
testExternalDropCursorTargetCentersGhostUnderPointer()
testRuntimeSkipBlockedSingleAllowedGroupIntent()
void testLegacyDropSessionPreviewBlockedAndCleanup()
  .then(() => testAutoDropCommitUsesSessionPreviewTarget())
  .then(() => testDropCommitsVisibleGhostWhilePreviewPending())
  .then(() => testPointerCommandGuardRollback())
  .then(() => {
  console.log('grid-layout-internal-core tests passed')
}).catch(error => {
  console.error(error)
  process.exit(1)
})
