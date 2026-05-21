import assert from 'assert'
import {
  createInteractionController,
  createInteractionScheduler,
  createLayoutExecutor,
  createLayoutEngine,
  executeLayoutOperation,
  mainThreadLayoutExecutor,
  migrateLayoutSettings,
  placeLayoutItems,
  repairLayoutCollisions,
  rowColumnOccupancyStrategy,
  translateLayout,
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

  const noCompactCascade = executeLayoutOperation({
    id: 'move-null-compact-cascade',
    phase: 'commit',
    layout: [
      { i: 'revenue', x: 0, y: 0, w: 6, h: 3 },
      { i: 'pipeline', x: 6, y: 0, w: 6, h: 3 },
      { i: 'utilization', x: 12, y: 0, w: 6, h: 3 },
      { i: 'service', x: 18, y: 0, w: 6, h: 3, static: true },
      { i: 'incidents', x: 0, y: 3, w: 10, h: 4 },
      { i: 'region', x: 10, y: 3, w: 14, h: 4 }
    ],
    operation: { type: 'move', id: 'pipeline', x: 9, y: 0, userAction: true },
    options: { ...options, compactType: null, preventCollision: false }
  })
  assert.equal(noCompactCascade.status, 'changed')
  assert.equal(getLayoutItem(noCompactCascade.layout, 'pipeline')?.x, 9)
  assert.equal(getLayoutItem(noCompactCascade.layout, 'utilization')?.y, 3)
  assert.equal(getLayoutItem(noCompactCascade.layout, 'region')?.y, 6)
  for (const item of noCompactCascade.layout) {
    assert.equal(getAllCollisions(noCompactCascade.layout, item).length, 0, `${item.i} should not collide`)
  }

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

function testMigrationAndRepairOperations() {
  const wide: Layout = [
    { i: 'a', x: 0, y: 0, w: 6, h: 2 },
    { i: 'b', x: 12, y: 3, w: 6, h: 4, minW: 2 }
  ]
  const migrated = migrateLayoutSettings(wide, {
    previousSettings: { cols: 24 },
    nextSettings: { cols: 12 },
    engineOptions: { ...options, cols: 24, compactType: null },
    id: 'migrate-24-12',
    debug: true
  })
  assert.equal(migrated.status, 'changed')
  assert.equal(migrated.migration?.ratio, 0.5)
  assert.equal(getLayoutItem(migrated.layout, 'b')?.x, 6)
  assert.equal(getLayoutItem(migrated.layout, 'b')?.w, 3)
  assert.equal(getLayoutItem(migrated.layout, 'b')?.y, 3)
  assert.equal(getLayoutItem(migrated.layout, 'b')?.h, 4)
  assert.ok(migrated.diagnostics?.details?.some(detail => detail.code === 'settings-ratio'))

  const expanded = executeLayoutOperation({
    id: 'migrate-12-24',
    phase: 'commit',
    layout: migrated.layout,
    operation: { type: 'migrateSettings', previousSettings: { columns: 12 }, nextSettings: { columns: 24 } },
    options: { ...options, cols: 12, compactType: null }
  })
  assert.equal(expanded.status, 'changed')
  assert.equal(getLayoutItem(expanded.layout, 'b')?.x, 12)
  assert.equal(getLayoutItem(expanded.layout, 'b')?.w, 6)

  const xy = executeLayoutOperation({
    id: 'migrate-xy',
    phase: 'commit',
    layout: [{ i: 'a', x: 2, y: 4, w: 2, h: 4 }],
    operation: {
      type: 'migrateSettings',
      previousSettings: { cols: 12 },
      nextSettings: { cols: 6 },
      policy: { axis: 'xy' }
    },
    options: { ...options, cols: 12, compactType: null }
  })
  assert.equal(xy.status, 'changed')
  assert.deepEqual(
    getLayoutItem(xy.layout, 'a') && {
      x: getLayoutItem(xy.layout, 'a')!.x,
      y: getLayoutItem(xy.layout, 'a')!.y,
      w: getLayoutItem(xy.layout, 'a')!.w,
      h: getLayoutItem(xy.layout, 'a')!.h
    },
    { x: 1, y: 2, w: 1, h: 2 }
  )

  const visualOnly = executeLayoutOperation({
    id: 'migrate-visual-only',
    phase: 'commit',
    layout: wide,
    operation: {
      type: 'migrateSettings',
      previousSettings: { columns: 24, margin: [8, 8], rowHeight: 30 },
      nextSettings: { columns: 24, margin: [12, 12], rowHeight: 48 }
    },
    options: { ...options, cols: 24 }
  })
  assert.equal(visualOnly.status, 'noop')
  assert.equal(visualOnly.layout, wide)
  assert.equal(visualOnly.migration?.visualOnlyChange, true)

  const invalidSettings = executeLayoutOperation({
    id: 'migrate-invalid-settings',
    phase: 'commit',
    layout: wide,
    operation: { type: 'migrateSettings', previousSettings: { columns: 24 }, nextSettings: { columns: 0 } },
    options: { ...options, cols: 24 }
  })
  assert.equal(invalidSettings.status, 'error')
  assert.ok(invalidSettings.diagnostics?.details?.some(detail => detail.code === 'settings-invalid'))

  const clamped = executeLayoutOperation({
    id: 'migrate-clamp',
    phase: 'commit',
    layout: [{ i: 'edge', x: 22, y: 0, w: 4, h: 1, minW: 2 }],
    operation: { type: 'migrateSettings', previousSettings: { columns: 24 }, nextSettings: { columns: 12 } },
    options: { ...options, cols: 24, compactType: null }
  })
  assert.equal(clamped.status, 'changed')
  assert.equal(getLayoutItem(clamped.layout, 'edge')?.x, 10)
  assert.equal(getLayoutItem(clamped.layout, 'edge')?.w, 2)
  assert.ok(clamped.diagnostics?.details?.some(detail => detail.code === 'item-clamped'))

  const invalidItem = executeLayoutOperation({
    id: 'migrate-invalid-item',
    phase: 'commit',
    layout: [{ i: 'bad', x: Number.NaN, y: 0, w: 1, h: 1 }],
    operation: { type: 'migrateSettings', previousSettings: { columns: 12 }, nextSettings: { columns: 6 } },
    options: { ...options, cols: 12 }
  })
  assert.equal(invalidItem.status, 'error')
  assert.ok(invalidItem.diagnostics?.details?.some(detail => detail.code === 'item-invalid'))

  const sanitized = executeLayoutOperation({
    id: 'migrate-sanitize',
    phase: 'commit',
    layout: [{ i: 'bad', x: Number.NaN, y: -2, w: 0, h: 1 }],
    operation: {
      type: 'migrateSettings',
      previousSettings: { columns: 12 },
      nextSettings: { columns: 6 },
      policy: { sanitizeInvalidItems: true }
    },
    options: { ...options, cols: 12, compactType: null }
  })
  assert.equal(sanitized.status, 'changed')
  assert.equal(getLayoutItem(sanitized.layout, 'bad')?.x, 0)
  assert.equal(getLayoutItem(sanitized.layout, 'bad')?.w, 1)
  assert.ok(sanitized.diagnostics?.details?.some(detail => detail.code === 'item-sanitized'))

  const collisionLayout: Layout = [
    { i: 's', x: 0, y: 0, w: 2, h: 2, static: true },
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 }
  ]
  const repaired = repairLayoutCollisions(collisionLayout, {
    engineOptions: { ...options, cols: 6, compactType: null },
    id: 'repair-static'
  })
  assert.equal(repaired.status, 'changed')
  assert.equal(getLayoutItem(repaired.layout, 's')?.x, 0)
  assert.equal(getAllCollisions(repaired.layout, getLayoutItem(repaired.layout, 's')!).length, 0)
  assert.ok(repaired.diagnostics?.details?.some(detail => detail.code === 'static-preserved'))

  const forcedStatic = repairLayoutCollisions([
    { i: 's1', x: 0, y: 0, w: 2, h: 1, static: true },
    { i: 's2', x: 0, y: 0, w: 2, h: 1, static: true }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null },
    id: 'repair-forced-static'
  })
  assert.equal(forcedStatic.status, 'changed')
  assert.equal(getAllCollisions(forcedStatic.layout, getLayoutItem(forcedStatic.layout, 's1')!).length, 0)
  assert.ok(forcedStatic.diagnostics?.details?.some(detail => detail.code === 'forced-static-repair'))

  const staticOutOfBounds = repairLayoutCollisions([
    { i: 's', x: 5, y: 0, w: 2, h: 1, static: true }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null, preventCollision: true },
    id: 'repair-static-out-of-bounds'
  })
  assert.equal(staticOutOfBounds.status, 'changed')
  assert.equal(getLayoutItem(staticOutOfBounds.layout, 's')?.x, 2)
  assert.equal(staticOutOfBounds.repair?.forcedStaticRepairCount, 1)
  assert.ok(staticOutOfBounds.diagnostics?.details?.some(detail => detail.code === 'forced-static-repair'))

  const unresolved = repairLayoutCollisions([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 0, y: 0, w: 1, h: 1 }
  ], {
    engineOptions: { ...options, cols: 1, maxRows: 1, compactType: null, preventCollision: true },
    id: 'repair-unresolved'
  })
  assert.equal(unresolved.status, 'blocked')
  assert.ok(unresolved.diagnostics?.details?.some(detail => detail.code === 'unresolved-item'))

  const overlapPreserved = executeLayoutOperation({
    id: 'migrate-overlap-preserved',
    phase: 'commit',
    layout: [
      { i: 'a', x: 0, y: 0, w: 2, h: 1 },
      { i: 'b', x: 0, y: 0, w: 2, h: 1 }
    ],
    operation: { type: 'migrateSettings', previousSettings: { columns: 4 }, nextSettings: { columns: 4 } },
    options: { ...options, cols: 4, allowOverlap: true, preventCollision: false }
  })
  assert.equal(overlapPreserved.status, 'noop')
  assert.equal(overlapPreserved.collisions.length, 2)
}

function testPlacementTranslateAndCustomSolver() {
  const placed = placeLayoutItems([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 }
  ], {
    items: [
      { item: { i: 'b', w: 2, h: 1 }, strategy: 'append-after-bottom' },
      { item: { i: 'c', w: 1, h: 1 }, target: { x: 0, y: 0 }, strategy: 'target-first' }
    ],
    engineOptions: { ...options, cols: 4, compactType: null },
    id: 'place-items'
  })
  assert.equal(placed.status, 'changed')
  assert.equal(getLayoutItem(placed.layout, 'b')?.y, 2)
  assert.notDeepEqual(
    { x: getLayoutItem(placed.layout, 'c')?.x, y: getLayoutItem(placed.layout, 'c')?.y },
    { x: 0, y: 0 }
  )
  assert.ok(placed.diagnostics?.details?.some(detail => detail.code === 'placement-source'))

  const translated = translateLayout([
    { i: 'a', x: 2, y: 3, w: 1, h: 1 },
    { i: 'b', x: 4, y: 4, w: 1, h: 1 }
  ], {
    dx: -5,
    dy: -10,
    engineOptions: { ...options, cols: 6, compactType: null },
    id: 'translate-clamp'
  })
  assert.equal(translated.status, 'changed')
  assert.equal(getLayoutItem(translated.layout, 'a')?.x, 0)
  assert.equal(getLayoutItem(translated.layout, 'a')?.y, 0)

  const custom = repairLayoutCollisions([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 0, y: 0, w: 1, h: 1 }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null },
    policy: {
      strategy: 'custom',
      customRepairSolver: input => ({
        layout: input.layout.map((item, index) => ({ ...item, x: index, y: 0 }))
      })
    },
    id: 'custom-success'
  })
  assert.equal(custom.status, 'changed')
  assert.equal(custom.repair?.strategy, 'custom')
  assert.equal(getAllCollisions(custom.layout, getLayoutItem(custom.layout, 'a')!).length, 0)

  const customThrow = repairLayoutCollisions([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 0, y: 0, w: 1, h: 1 }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null },
    policy: {
      strategy: 'custom',
      customRepairSolver: () => {
        throw new Error('solver boom')
      }
    },
    id: 'custom-throw'
  })
  assert.equal(customThrow.status, 'fallback')
  assert.ok(customThrow.diagnostics?.details?.some(detail => detail.code === 'custom-solver-fallback'))

  const customInvalid = repairLayoutCollisions([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 0, y: 0, w: 1, h: 1 }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null },
    policy: {
      strategy: 'custom',
      fallback: 'none',
      customRepairSolver: input => ({ layout: input.layout.slice(0, 1) })
    },
    id: 'custom-invalid'
  })
  assert.equal(customInvalid.status, 'blocked')
  assert.ok(customInvalid.diagnostics?.details?.some(detail => detail.code === 'custom-solver-fallback'))

  const customBudget = repairLayoutCollisions([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 0, y: 0, w: 1, h: 1 }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null },
    policy: {
      strategy: 'custom',
      customSolverBudgetMs: -1,
      customRepairSolver: input => ({
        layout: input.layout.map((item, index) => ({ ...item, x: index, y: 0 }))
      })
    },
    id: 'custom-budget'
  })
  assert.equal(customBudget.status, 'fallback')
  assert.ok(customBudget.diagnostics?.details?.some(detail => detail.reason === 'over-budget'))

  const unsupportedPolicy = repairLayoutCollisions([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 0, y: 0, w: 1, h: 1 }
  ], {
    engineOptions: { ...options, cols: 4, compactType: null },
    policy: { strategy: 'solver' as never },
    id: 'unsupported-policy'
  })
  assert.equal(unsupportedPolicy.status, 'changed')
  assert.ok(unsupportedPolicy.diagnostics?.details?.some(detail => detail.code === 'policy-unsupported'))
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

  const heavyScheduler = createInteractionScheduler({ mode: 'auto', auto: { eagerMaxItems: 0, rafMaxItems: 0, workerMinItems: 1 } })
  let heavyScheduled: LayoutOperationResult | null = null
  heavyScheduler.schedule(
    {
      id: 'heavy-preview',
      phase: 'preview',
      heavy: true,
      layout: baseLayout,
      operation: { type: 'repairCollisions' },
      options: { ...options, scheduler: { mode: 'auto', auto: { eagerMaxItems: 0, rafMaxItems: 0, workerMinItems: 1 } } }
    },
    request => executeLayoutOperation(request),
    result => {
      heavyScheduled = result
    }
  )
  assert.equal((heavyScheduled as LayoutOperationResult | null)?.status, 'noop')
  assert.equal((heavyScheduled as LayoutOperationResult | null)?.diagnostics?.schedulerMode, 'commitOnly')

  const staleEvents: string[] = []
  const staleScheduler = createInteractionScheduler({ mode: 'eager' })
  let releaseFirst = () => {}
  const staleResults: string[] = []
  staleScheduler.schedule(
    {
      id: 'stale-first',
      phase: 'preview',
      layout: baseLayout,
      operation: { type: 'validate' },
      options: { ...options, onEvent: event => staleEvents.push(event.type) }
    },
    request => new Promise<LayoutOperationResult>(resolve => {
      releaseFirst = () => resolve(executeLayoutOperation(request))
    }),
    result => staleResults.push(result.id)
  )
  staleScheduler.schedule(
    {
      id: 'stale-second',
      phase: 'preview',
      layout: baseLayout,
      operation: { type: 'validate' },
      options: { ...options, onEvent: event => staleEvents.push(event.type) }
    },
    request => executeLayoutOperation(request),
    result => staleResults.push(result.id)
  )
  releaseFirst()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.deepEqual(staleResults, ['stale-second'])
  assert.ok(staleEvents.includes('stale-result'))

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

  class TimeoutWorker {
    onmessage: ((event: { data: unknown }) => void) | null = null
    onerror: ((event: unknown) => void) | null = null
    postMessage() {}
    terminate() {}
  }
  const timeoutWorker = workerLayoutExecutor({ workerFactory: () => new TimeoutWorker(), timeoutMs: 1 })
  const timeoutResult = await timeoutWorker.execute({
    id: 'worker-timeout',
    phase: 'commit',
    layout: baseLayout,
    operation: { type: 'compact' },
    options
  })
  assert.equal(timeoutResult.status, 'fallback')
  assert.equal(timeoutResult.error?.message, 'worker task timed out')
  timeoutWorker.dispose?.()

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

  let postedRequest: unknown = null
  class InspectWorker {
    onmessage: ((event: { data: unknown }) => void) | null = null
    onerror: ((event: unknown) => void) | null = null
    postMessage(message: unknown) {
      postedRequest = message
      setTimeout(() => {
        this.onmessage?.({ data: runLayoutWorkerRequest(message as never) })
      }, 0)
    }
    terminate() {}
  }
  const sanitizeWorker = workerLayoutExecutor({ workerFactory: () => new InspectWorker(), timeoutMs: 1000 })
  const sanitizedResult = await sanitizeWorker.execute({
    id: 'worker-sanitize-custom-solver',
    phase: 'commit',
    layout: [
      { i: 'a', x: 0, y: 0, w: 1, h: 1 },
      { i: 'b', x: 0, y: 0, w: 1, h: 1 }
    ],
    operation: {
      type: 'repairCollisions',
      policy: {
        strategy: 'custom',
        customRepairSolver: input => ({ layout: input.layout })
      }
    },
    options
  })
  assert.ok(['changed', 'fallback', 'blocked', 'noop'].includes(sanitizedResult.status))
  const message = postedRequest as {
    request?: {
      operation?: {
        policy?: Record<string, unknown>
      }
    }
  }
  assert.equal(typeof message.request?.operation?.policy?.customRepairSolver, 'undefined')
  sanitizeWorker.dispose?.()
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
  testMigrationAndRepairOperations()
  testPlacementTranslateAndCustomSolver()
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
