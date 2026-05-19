import assert from 'assert'
import {
  createInteractionController,
  createInteractionScheduler,
  createLayoutExecutor,
  createLayoutEngine,
  executeLayoutOperation,
  mainThreadLayoutExecutor,
  rowColumnOccupancyStrategy,
  workerLayoutExecutor
} from '../lib/layout-engine'
import type { LayoutOperationResult } from '../lib/layout-engine'
import { runLayoutWorkerRequest } from '../lib/layout-engine/workerRuntime'
import {
  cloneLayout,
  compact,
  findFirstFit,
  findNearestFit,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  type Layout
} from '../lib/utils'
import { basicProps } from '../lib/VueGridLayoutPropTypes'
import ResponsiveVueGridLayout from '../lib/ResponsiveVueGridLayout'

const baseLayout: Layout = [
  { i: 'a', x: 0, y: 0, w: 2, h: 2 },
  { i: 'b', x: 2, y: 0, w: 2, h: 2 },
  { i: 'c', x: 0, y: 2, w: 2, h: 2, static: true }
]

const options = {
  cols: 12,
  maxRows: Infinity,
  compactType: 'vertical' as const,
  allowOverlap: false,
  preventCollision: false,
  diagnostics: { debug: true }
}

function seededLayout(count: number, cols: number): Layout {
  const layout: Layout = []
  for (let i = 0; i < count; i++) {
    layout.push({
      i: String(i),
      x: i % cols,
      y: Math.floor(i / cols) * 2,
      w: 1,
      h: 1,
      static: i % 17 === 0
    })
  }
  return layout
}

function assertSamePositions(actual: Layout, expected: Layout) {
  assert.equal(actual.length, expected.length)
  for (const expectedItem of expected) {
    const actualItem = getLayoutItem(actual, expectedItem.i)
    assert.ok(actualItem, `missing ${expectedItem.i}`)
    assert.equal(actualItem?.x, expectedItem.x, `${expectedItem.i}.x`)
    assert.equal(actualItem?.y, expectedItem.y, `${expectedItem.i}.y`)
    assert.equal(actualItem?.w, expectedItem.w, `${expectedItem.i}.w`)
    assert.equal(actualItem?.h, expectedItem.h, `${expectedItem.i}.h`)
  }
}

function testIndex() {
  const index = rowColumnOccupancyStrategy().build(baseLayout, options)
  assert.equal(index.queryFirstCollision({ i: 'x', x: 1, y: 0, w: 2, h: 1 })?.i, 'a')
  assert.deepEqual(index.queryAllCollisions({ i: 'x', x: 1, y: 0, w: 4, h: 1 }).map(item => item.i), ['a', 'b'])
  assert.equal(index.canPlace({ i: 'x', x: 4, y: 0, w: 2, h: 1 }), true)
  assert.deepEqual(index.findFirstFit({ w: 1, h: 1 }), { x: 4, y: 0 })
  assert.deepEqual(index.findNearestFit({ w: 1, h: 1 }, { x: 2, y: 2 }), { x: 2, y: 2 })
  index.insert({ i: 'd', x: 4, y: 0, w: 1, h: 1 })
  assert.equal(index.canPlace({ i: 'x', x: 4, y: 0, w: 1, h: 1 }), false)
  index.update({ i: 'd', x: 4, y: 0, w: 1, h: 1 }, { i: 'd', x: 5, y: 0, w: 1, h: 1 })
  assert.equal(index.canPlace({ i: 'x', x: 4, y: 0, w: 1, h: 1 }), true)
  index.remove('d')
  assert.equal(index.queryFirstCollision({ i: 'x', x: 5, y: 0, w: 1, h: 1 }), undefined)
}

function testMoveCompactParity() {
  const layout = cloneLayout(baseLayout)
  const result = executeLayoutOperation({
    id: 'move-a',
    phase: 'commit',
    layout,
    operation: { type: 'move', id: 'a', x: 2, y: 1, userAction: true },
    options
  })

  const legacy = cloneLayout(baseLayout)
  const legacyItem = getLayoutItem(legacy, 'a')
  assert.ok(legacyItem)
  const moved = moveElement(legacy, legacyItem!, 'vertical', 12, false, 2, 1, true, false)
  assertSamePositions(result.layout, compact(moved, 'vertical', 12, false))
  assert.equal(result.status, 'changed')
  assert.ok(result.patches.length > 0)
  assert.equal(result.diagnostics?.indexHit, true)
}

function testStatefulEngineIndexLifecycle() {
  const baseStrategy = rowColumnOccupancyStrategy()
  let builds = 0
  let updates = 0
  const strategy = {
    name: 'counting-row-column',
    build(layout: Layout, indexOptions) {
      builds++
      const index = baseStrategy.build(layout, indexOptions)
      return {
        name: index.name,
        queryFirstCollision: item => index.queryFirstCollision(item),
        queryAllCollisions: item => index.queryAllCollisions(item),
        canPlace: item => index.canPlace(item),
        findFirstFit: item => index.findFirstFit(item),
        findNearestFit: (item, target) => index.findNearestFit(item, target),
        update(before, after) {
          updates++
          index.update(before, after)
        },
        insert(item) {
          index.insert(item)
        },
        remove(id) {
          index.remove(id)
        },
        rebuild(layout) {
          index.rebuild(layout)
        },
        getLayout: () => index.getLayout()
      }
    }
  }
  const engine = createLayoutEngine({ ...options, indexStrategy: strategy }, baseLayout)
  const result = engine.execute({
    id: 'stateful-move',
    phase: 'commit',
    operation: { type: 'move', id: 'a', x: 4, y: 0, userAction: true }
  })
  assert.equal(result.status, 'changed')
  assert.equal(builds, 1)
  assert.ok(updates > 0)
}

function testNoopAndBlocked() {
  const engine = createLayoutEngine(options, baseLayout)
  assert.equal(engine.getRevision(), 'layout-rev-0')
  const engineResult = engine.execute({
    id: 'engine-noop',
    phase: 'preview',
    operation: { type: 'validate' }
  })
  assert.equal(engineResult.status, 'noop')

  const noop = executeLayoutOperation({
    id: 'noop',
    phase: 'preview',
    layout: baseLayout,
    operation: { type: 'move', id: 'a', x: 0, y: 0, userAction: true },
    options
  })
  assert.equal(noop.status, 'noop')
  assert.equal(noop.layout, baseLayout)

  const blocked = executeLayoutOperation({
    id: 'blocked',
    phase: 'preview',
    layout: baseLayout,
    operation: { type: 'move', id: 'a', x: 2, y: 0, userAction: true },
    options: { ...options, preventCollision: true }
  })
  assert.equal(blocked.status, 'blocked')
  assert.equal(blocked.blocked?.reason, 'collision')
  assert.deepEqual(blocked.blocked?.itemIds, ['b'])
}

function testGroupMoveValidationAndParity() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 3, y: 0, w: 2, h: 1 },
    { i: 's', x: 0, y: 2, w: 2, h: 1, static: true }
  ]

  const moved = executeLayoutOperation({
    id: 'group-basic',
    phase: 'commit',
    layout,
    operation: { type: 'groupMove', ids: ['a', 'a', 'b'], activeId: 'b', dx: 1.8, dy: 1.2 },
    options: { ...options, compactType: null }
  })
  assert.equal(moved.status, 'changed')
  assert.equal(moved.diagnostics?.operationType, 'groupMove')
  assert.deepEqual(moved.patches.filter(patch => patch.type === 'move').map(patch => patch.id).sort(), ['a', 'b'])
  assert.deepEqual(moved.placeholder && { i: moved.placeholder.i, x: moved.placeholder.x, y: moved.placeholder.y }, { i: 'b', x: 4, y: 1 })

  const empty = executeLayoutOperation({
    id: 'group-empty',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: [], dx: 1, dy: 0 },
    options
  })
  assert.equal(empty.status, 'blocked')
  assert.equal(empty.blocked?.reason, 'invalid-input')

  const missing = executeLayoutOperation({
    id: 'group-missing',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a', 'missing'], dx: 1, dy: 0 },
    options
  })
  assert.equal(missing.status, 'blocked')
  assert.equal(missing.blocked?.reason, 'missing-item')
  assert.deepEqual(missing.blocked?.itemIds, ['missing'])

  const invalidDelta = executeLayoutOperation({
    id: 'group-invalid-delta',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a'], dx: Number.NaN, dy: 0 },
    options
  })
  assert.equal(invalidDelta.status, 'blocked')
  assert.equal(invalidDelta.blocked?.reason, 'invalid-input')

  const selectedStatic = executeLayoutOperation({
    id: 'group-selected-static',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a', 's'], dx: 1, dy: 0 },
    options
  })
  assert.equal(selectedStatic.status, 'blocked')
  assert.equal(selectedStatic.blocked?.reason, 'static-item')
  assert.deepEqual(selectedStatic.blocked?.itemIds, ['s'])

  const bounds = executeLayoutOperation({
    id: 'group-bounds',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a'], dx: -1, dy: 0 },
    options
  })
  assert.equal(bounds.status, 'blocked')
  assert.equal(bounds.blocked?.reason, 'bounds')

  const maxRows = executeLayoutOperation({
    id: 'group-maxRows',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a'], dx: 0, dy: 2 },
    options: { ...options, maxRows: 2 }
  })
  assert.equal(maxRows.status, 'blocked')
  assert.equal(maxRows.blocked?.reason, 'maxRows')

  const singleGroup = executeLayoutOperation({
    id: 'single-group',
    phase: 'commit',
    layout,
    operation: { type: 'groupMove', ids: ['a'], dx: 2, dy: 1, userAction: true },
    options
  })
  const singleMove = executeLayoutOperation({
    id: 'single-move',
    phase: 'commit',
    layout,
    operation: { type: 'move', id: 'a', x: 2, y: 1, userAction: true },
    options
  })
  assertSamePositions(singleGroup.layout, singleMove.layout)
  assert.deepEqual(singleGroup.patches, singleMove.patches)
}

function testGroupMoveCollisionsAndCompaction() {
  const layout: Layout = [
    { i: 'a', x: 0, y: 0, w: 2, h: 1 },
    { i: 'b', x: 2, y: 0, w: 2, h: 1 },
    { i: 'c', x: 4, y: 0, w: 2, h: 1 }
  ]

  const blocked = executeLayoutOperation({
    id: 'group-prevent-collision',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a', 'b'], activeId: 'a', dx: 1, dy: 0 },
    options: { ...options, preventCollision: true }
  })
  assert.equal(blocked.status, 'blocked')
  assert.equal(blocked.blocked?.reason, 'collision')
  assert.deepEqual(blocked.blocked?.itemIds, ['c'])

  const overlap = executeLayoutOperation({
    id: 'group-overlap',
    phase: 'preview',
    layout,
    operation: { type: 'groupMove', ids: ['a', 'b'], activeId: 'b', dx: 1, dy: 0 },
    options: { ...options, allowOverlap: true, preventCollision: false }
  })
  assert.equal(overlap.status, 'changed')
  assert.equal(getLayoutItem(overlap.layout, 'b')?.x, 3)
  assert.equal(getLayoutItem(overlap.layout, 'c')?.x, 4)
  assert.ok(overlap.affectedIds.includes('c'))

  const pushed = executeLayoutOperation({
    id: 'group-push',
    phase: 'commit',
    layout,
    operation: { type: 'groupMove', ids: ['a', 'b'], activeId: 'b', dx: 1, dy: 0 },
    options: { ...options, preventCollision: false, compactType: 'vertical' }
  })
  assert.equal(pushed.status, 'changed')
  assert.equal(getLayoutItem(pushed.layout, 'a')?.x, 1)
  assert.equal(getLayoutItem(pushed.layout, 'b')?.x, 3)
  assert.equal(getLayoutItem(pushed.layout, 'c')?.y, 1)
  assert.ok(pushed.affectedIds.includes('a'))
  assert.ok(pushed.affectedIds.includes('b'))
  assert.ok(pushed.affectedIds.includes('c'))
  assert.equal(getAllCollisions(pushed.layout, getLayoutItem(pushed.layout, 'c')!).length, 0)

  const horizontal = executeLayoutOperation({
    id: 'group-horizontal',
    phase: 'commit',
    layout: [
      { i: 'a', x: 0, y: 0, w: 1, h: 1 },
      { i: 'b', x: 1, y: 0, w: 1, h: 1 },
      { i: 'c', x: 2, y: 0, w: 1, h: 1 }
    ],
    operation: { type: 'groupMove', ids: ['a', 'b'], dx: 1, dy: 0 },
    options: { ...options, cols: 6, compactType: 'horizontal' }
  })
  assert.equal(horizontal.status, 'changed')
  assert.equal(getLayoutItem(horizontal.layout, 'c')?.x, 3)

  const noCompactType = executeLayoutOperation({
    id: 'group-null-compact',
    phase: 'commit',
    layout,
    operation: { type: 'groupMove', ids: ['a', 'b'], dx: 1, dy: 0 },
    options: { ...options, compactType: null }
  })
  assert.equal(noCompactType.status, 'changed')
  assert.equal(getAllCollisions(noCompactType.layout, getLayoutItem(noCompactType.layout, 'c')!).length, 0)

  const staticObstacle = executeLayoutOperation({
    id: 'group-static-obstacle',
    phase: 'preview',
    layout: [
      { i: 'a', x: 0, y: 0, w: 2, h: 1 },
      { i: 's', x: 2, y: 0, w: 2, h: 1, static: true }
    ],
    operation: { type: 'groupMove', ids: ['a'], dx: 2, dy: 0 },
    options: { ...options, preventCollision: false }
  })
  assert.equal(staticObstacle.status, 'blocked')
  assert.equal(staticObstacle.blocked?.reason, 'static-item')
  assert.deepEqual(staticObstacle.blocked?.itemIds, ['s'])
}

function testResizeDropResponsive() {
  const resized = executeLayoutOperation({
    id: 'resize-nw',
    phase: 'preview',
    layout: baseLayout,
    operation: { type: 'resize', id: 'b', w: 3, h: 3, handle: 'nw' },
    options
  })
  assert.equal(resized.status, 'changed')
  const resizedItem = getLayoutItem(resized.layout, 'b')
  assert.ok(resizedItem)
  assert.equal(resizedItem?.w, 3)
  assert.equal(resizedItem?.h, 2)
  assert.equal(resizedItem?.x, 1)
  assert.equal(resizedItem?.y, 0)

  const drop = executeLayoutOperation({
    id: 'drop',
    phase: 'preview',
    layout: baseLayout,
    operation: { type: 'dropFit', item: { i: 'drop', w: 1, h: 1 }, strategy: 'auto' },
    options
  })
  assert.equal(drop.status, 'changed')
  assert.ok(drop.drop?.position)
  assert.ok(getLayoutItem(drop.layout, 'drop'))

  const responsive = executeLayoutOperation({
    id: 'responsive',
    phase: 'commit',
    layout: baseLayout,
    operation: {
      type: 'generateResponsiveLayout',
      breakpoint: 'sm',
      sourceBreakpoint: 'lg',
      cols: 6,
      layouts: { lg: baseLayout },
      breakpoints: { sm: 0, lg: 1200 }
    },
    options: { ...options, cols: 6 }
  })
  assert.ok(['changed', 'noop'].includes(responsive.status))
  assert.ok(responsive.layout.every(item => item.x + item.w <= 6))
}

async function testSchedulerAndExecutors() {
  assert.equal(createLayoutExecutor({ kind: 'main-thread' }).kind, 'main-thread')
  const scheduler = createInteractionScheduler({ mode: 'commitOnly' })
  let scheduled: LayoutOperationResult | null = null
  scheduler.schedule(
    {
      id: 'preview',
      phase: 'preview',
      layout: baseLayout,
      operation: { type: 'move', id: 'a', x: 1, y: 1 },
      options
    },
    request => executeLayoutOperation(request),
    result => {
      scheduled = result
    }
  )
  const scheduledResult = scheduled as LayoutOperationResult | null
  assert.equal(scheduledResult?.status, 'noop')
  assert.equal(scheduledResult?.diagnostics?.schedulerMode, 'commitOnly')

  scheduled = null
  scheduler.schedule(
    {
      id: 'group-preview',
      phase: 'preview',
      layout: baseLayout,
      operation: { type: 'groupMove', ids: ['a', 'b'], activeId: 'b', dx: 1, dy: 2 },
      options
    },
    request => executeLayoutOperation(request),
    result => {
      scheduled = result
    }
  )
  const groupScheduledResult = scheduled as LayoutOperationResult | null
  assert.equal(groupScheduledResult?.status, 'noop')
  assert.deepEqual(
    groupScheduledResult?.placeholder && {
      i: groupScheduledResult.placeholder.i,
      x: groupScheduledResult.placeholder.x,
      y: groupScheduledResult.placeholder.y
    },
    { i: 'b', x: 3, y: 2 }
  )

  const main = await mainThreadLayoutExecutor().execute({
    id: 'main',
    phase: 'commit',
    layout: baseLayout,
    operation: { type: 'compact' },
    options
  })
  assert.ok(['changed', 'noop'].includes(main.status))

  const unavailable = await workerLayoutExecutor().execute({
    id: 'worker-fallback',
    phase: 'commit',
    layout: baseLayout,
    operation: { type: 'compact' },
    options
  })
  assert.equal(unavailable.status, 'fallback')

  class FakeWorker {
    onmessage: ((event: { data: unknown }) => void) | null = null
    onerror: ((event: unknown) => void) | null = null
    postMessage(message: unknown) {
      setTimeout(() => {
        this.onmessage?.({ data: runLayoutWorkerRequest(message as never) })
      }, 0)
    }
    terminate() {}
  }

  const worker = workerLayoutExecutor({ workerFactory: () => new FakeWorker(), timeoutMs: 1000 })
  const workerResult = await worker.execute({
    id: 'worker',
    phase: 'commit',
    layout: [
      { i: 'a', x: 0, y: 0, w: 1, h: 1 },
      { i: 'b', x: 1, y: 0, w: 1, h: 1 }
    ],
    operation: { type: 'groupMove', ids: ['a', 'b'], dx: 1, dy: 1 },
    options
  })
  assert.equal(workerResult.status, 'changed')
  assert.equal(workerResult.diagnostics?.operationType, 'groupMove')
  worker.dispose?.()
}

function testInteractionController() {
  const events: string[] = []
  const controller = createInteractionController(baseLayout, {
    ...options,
    onEvent: event => events.push(event.type)
  })
  controller.start({ id: 'drag', type: 'drag', itemId: 'a' })
  const preview = controller.preview({
    id: 'drag-preview',
    operation: { type: 'move', id: 'a', x: 1, y: 1 }
  })
  assert.ok(['changed', 'noop', 'blocked'].includes(preview.status))
  const rebase = controller.rebase(baseLayout.filter(item => item.i !== 'a'))
  assert.equal(rebase, null)
  assert.ok(events.includes('interaction-cancelled'))
}

function testPublicComponentSurface() {
  assert.ok(basicProps.layoutEngine)
  assert.ok(ResponsiveVueGridLayout)
  assert.deepEqual(findFirstFit(baseLayout, { w: 1, h: 1 }, 12), { x: 4, y: 0 })
  assert.deepEqual(findNearestFit(baseLayout, { w: 1, h: 1 }, 12, 2, 2), { x: 2, y: 2 })
}

function testLargeSmokeCases() {
  for (const size of [100, 500, 1000, 2000]) {
    const layout = seededLayout(size, 12)
    const result = executeLayoutOperation({
      id: `smoke-${size}`,
      phase: 'preview',
      layout,
      operation: { type: 'move', id: '1', x: 2, y: 3 },
      options
    })
    assert.ok(['changed', 'noop', 'blocked'].includes(result.status))
    assert.equal(result.diagnostics?.layoutSize, size)
  }
}

function testGroupMoveLegacyComparison() {
  const events: string[] = []
  const engine = createLayoutEngine({
    ...options,
    compareLegacy: true,
    onEvent: event => events.push(event.type)
  }, [
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 1, y: 0, w: 1, h: 1 }
  ])
  const result = engine.execute({
    id: 'group-legacy-compare',
    phase: 'commit',
    operation: { type: 'groupMove', ids: ['a', 'b'], dx: 1, dy: 0 }
  })
  assert.equal(result.status, 'changed')
  assert.equal(events.includes('legacy-mismatch'), false)
}

async function main() {
  testIndex()
  testMoveCompactParity()
  testStatefulEngineIndexLifecycle()
  testNoopAndBlocked()
  testGroupMoveValidationAndParity()
  testGroupMoveCollisionsAndCompaction()
  testResizeDropResponsive()
  testInteractionController()
  testPublicComponentSurface()
  testLargeSmokeCases()
  testGroupMoveLegacyComparison()
  await testSchedulerAndExecutors()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
