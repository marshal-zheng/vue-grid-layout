import assert from 'assert'
import {
  createGridInteractionInitialState,
  reduceGridInteraction,
  resolveDragActivationDistance,
  type GridInteractionEffect,
  type GridInteractionState
} from '../lib/interaction-state-machine'

function reduce(
  state: GridInteractionState,
  event: Parameters<typeof reduceGridInteraction>[1],
  options?: Parameters<typeof reduceGridInteraction>[2]
) {
  return reduceGridInteraction(state, event, options)
}

function effectTypes(effects: GridInteractionEffect[]) {
  return effects.map(effect => effect.type)
}

function testThresholdResolution() {
  assert.equal(resolveDragActivationDistance(undefined, 'mouse'), 4)
  assert.equal(resolveDragActivationDistance(undefined, 'pen'), 4)
  assert.equal(resolveDragActivationDistance(undefined, 'touch'), 8)
  assert.equal(resolveDragActivationDistance(undefined, 'coarse'), 8)
  assert.equal(resolveDragActivationDistance(undefined, 'unknown'), 4)
  assert.equal(resolveDragActivationDistance(0, 'mouse'), 0)
  assert.equal(resolveDragActivationDistance({ default: 5, touch: 10 }, 'touch'), 10)
  assert.equal(resolveDragActivationDistance({ default: 5, touch: 10 }, 'mouse'), 5)
}

function testPendingDragBelowThresholdStaysClickLike() {
  let state = createGridInteractionInitialState()
  let result = reduce(state, {
    type: 'ARM_DRAG',
    interactionId: 'drag-1',
    itemId: 'a',
    pointerKind: 'mouse',
    originPx: { x: 0, y: 0 },
    originGrid: { x: 0, y: 0 }
  })
  state = result.state
  assert.equal(state.status, 'pending-drag')
  assert.deepEqual(result.effects, [])

  result = reduce(state, {
    type: 'MOVE_DRAG',
    interactionId: 'drag-1',
    currentPx: { x: 3, y: 0 },
    grid: { x: 1, y: 0 }
  })
  state = result.state
  assert.equal(state.status, 'pending-drag')
  assert.deepEqual(result.effects, [])

  result = reduce(state, {
    type: 'STOP_DRAG',
    interactionId: 'drag-1',
    grid: { x: 1, y: 0 }
  })
  assert.equal(result.state.status, 'idle')
  assert.deepEqual(effectTypes(result.effects), ['CLEAR_TRANSIENT'])
  assert.equal(result.effects[0].type === 'CLEAR_TRANSIENT' && result.effects[0].reason, 'click-like')
}

function testDragActivationAndCommit() {
  let state = createGridInteractionInitialState()
  state = reduce(state, {
    type: 'ARM_DRAG',
    interactionId: 'drag-2',
    itemId: 'a',
    pointerKind: 'mouse',
    originPx: { x: 0, y: 0 },
    originGrid: { x: 0, y: 0 }
  }).state

  let result = reduce(state, {
    type: 'MOVE_DRAG',
    interactionId: 'drag-2',
    currentPx: { x: 4, y: 0 },
    grid: { x: 1, y: 0 },
    context: { kind: 'group', activeId: 'a', ids: ['a', 'b'] }
  })
  state = result.state
  assert.equal(state.status, 'active-drag')
  assert.deepEqual(effectTypes(result.effects), ['EMIT_DRAG_START', 'EMIT_DRAG', 'PREVIEW_DRAG'])
  assert.equal(result.effects[2].type === 'PREVIEW_DRAG' && result.effects[2].requestId, 'drag-2:drag-preview:1')

  result = reduce(state, {
    type: 'MOVE_DRAG',
    interactionId: 'drag-2',
    currentPx: { x: 8, y: 0 },
    grid: { x: 1, y: 0 }
  })
  state = result.state
  assert.equal(state.status, 'active-drag')
  assert.deepEqual(result.effects, [])

  result = reduce(state, {
    type: 'MOVE_DRAG',
    interactionId: 'drag-2',
    currentPx: { x: 12, y: 0 },
    grid: { x: 2, y: 0 }
  })
  state = result.state
  assert.deepEqual(effectTypes(result.effects), ['EMIT_DRAG', 'PREVIEW_DRAG'])

  result = reduce(state, {
    type: 'STOP_DRAG',
    interactionId: 'drag-2',
    grid: { x: 2, y: 0 }
  })
  state = result.state
  assert.equal(state.status, 'committing')
  assert.deepEqual(effectTypes(result.effects), ['COMMIT_DRAG'])

  result = reduce(state, {
    type: 'APPLY_RESULT',
    interactionId: 'drag-2',
    requestId: result.effects[0].type === 'COMMIT_DRAG' ? result.effects[0].requestId : '',
    status: 'changed'
  })
  assert.equal(result.state.status, 'idle')
  assert.deepEqual(effectTypes(result.effects), ['EMIT_DRAG_STOP', 'CLEAR_TRANSIENT'])
}

function testTouchThresholdAndZeroCompat() {
  let state = createGridInteractionInitialState()
  state = reduce(state, {
    type: 'ARM_DRAG',
    interactionId: 'touch-drag',
    itemId: 'a',
    pointerKind: 'touch',
    originPx: { x: 0, y: 0 },
    originGrid: { x: 0, y: 0 }
  }).state

  let result = reduce(state, {
    type: 'MOVE_DRAG',
    interactionId: 'touch-drag',
    currentPx: { x: 7, y: 0 },
    grid: { x: 1, y: 0 }
  })
  assert.equal(result.state.status, 'pending-drag')
  assert.deepEqual(result.effects, [])

  result = reduce(createGridInteractionInitialState(), {
    type: 'ARM_DRAG',
    interactionId: 'zero-drag',
    itemId: 'a',
    pointerKind: 'mouse',
    originPx: { x: 0, y: 0 },
    originGrid: { x: 0, y: 0 }
  }, { dragActivationDistance: 0 })
  assert.equal(result.state.status, 'active-drag')
  assert.deepEqual(effectTypes(result.effects), ['EMIT_DRAG_START'])
}

function testResizeLifecycle() {
  let state = createGridInteractionInitialState()
  let result = reduce(state, {
    type: 'START_RESIZE',
    interactionId: 'resize-1',
    itemId: 'a',
    handle: 'se',
    geometry: { x: 0, y: 0, w: 2, h: 2 }
  })
  state = result.state
  assert.equal(state.status, 'active-resize')
  assert.deepEqual(effectTypes(result.effects), ['EMIT_RESIZE_START'])

  result = reduce(state, {
    type: 'MOVE_RESIZE',
    interactionId: 'resize-1',
    geometry: { x: 0, y: 0, w: 2, h: 2 }
  })
  state = result.state
  assert.deepEqual(result.effects, [])

  result = reduce(state, {
    type: 'STOP_RESIZE',
    interactionId: 'resize-1',
    geometry: { x: 0, y: 0, w: 2, h: 2 }
  })
  assert.equal(result.state.status, 'idle')
  assert.deepEqual(effectTypes(result.effects), ['EMIT_RESIZE_STOP', 'CLEAR_TRANSIENT'])

  state = reduce(createGridInteractionInitialState(), {
    type: 'START_RESIZE',
    interactionId: 'resize-2',
    itemId: 'a',
    handle: 'e',
    geometry: { x: 0, y: 0, w: 2, h: 2 }
  }).state
  result = reduce(state, {
    type: 'MOVE_RESIZE',
    interactionId: 'resize-2',
    geometry: { x: 0, y: 0, w: 3, h: 2 }
  })
  state = result.state
  assert.deepEqual(effectTypes(result.effects), ['EMIT_RESIZE', 'PREVIEW_RESIZE'])
  result = reduce(state, {
    type: 'STOP_RESIZE',
    interactionId: 'resize-2',
    geometry: { x: 0, y: 0, w: 3, h: 2 }
  })
  state = result.state
  assert.equal(result.state.status, 'committing')
  assert.deepEqual(effectTypes(result.effects), ['COMMIT_RESIZE'])
  result = reduce(state, {
    type: 'APPLY_RESULT',
    interactionId: 'resize-2',
    requestId: result.effects[0].type === 'COMMIT_RESIZE' ? result.effects[0].requestId : '',
    status: 'changed'
  })
  assert.equal(result.state.status, 'idle')
  assert.deepEqual(effectTypes(result.effects), ['EMIT_RESIZE_STOP', 'CLEAR_TRANSIENT'])
}

function testDropLifecycle() {
  let state = createGridInteractionInitialState()
  let result = reduce(state, {
    type: 'ENTER_DROP',
    interactionId: 'drop-1',
    itemId: 'drop',
    grid: { x: 1, y: 1 },
    size: { w: 2, h: 2 },
    strategy: 'cursor'
  })
  state = result.state
  assert.equal(state.status, 'active-drop')
  assert.deepEqual(effectTypes(result.effects), ['PREVIEW_DROP'])

  result = reduce(state, {
    type: 'MOVE_DROP',
    interactionId: 'drop-1',
    grid: { x: 1, y: 1 },
    size: { w: 2, h: 2 },
    strategy: 'cursor'
  })
  state = result.state
  assert.deepEqual(result.effects, [])

  result = reduce(state, {
    type: 'MOVE_DROP',
    interactionId: 'drop-1',
    grid: { x: 2, y: 1 },
    size: { w: 2, h: 2 },
    strategy: 'cursor'
  })
  state = result.state
  assert.deepEqual(effectTypes(result.effects), ['PREVIEW_DROP'])

  result = reduce(state, { type: 'COMMIT_DROP', interactionId: 'drop-1' })
  assert.equal(result.state.status, 'committing')
  assert.deepEqual(effectTypes(result.effects), ['COMMIT_DROP'])

  result = reduce(createGridInteractionInitialState(), {
    type: 'ENTER_DROP',
    interactionId: 'drop-2',
    itemId: 'drop'
  })
  state = result.state
  result = reduce(state, { type: 'LEAVE_DROP', interactionId: 'drop-2' })
  assert.equal(result.state.status, 'idle')
  assert.deepEqual(effectTypes(result.effects), ['CLEAR_TRANSIENT'])
}

function testIllegalCancelStaleAndDiagnosticsSanitization() {
  const idle = createGridInteractionInitialState()
  let result = reduce(idle, {
    type: 'MOVE_DRAG',
    interactionId: 'missing',
    currentPx: { x: 1, y: 1 },
    grid: { x: 1, y: 1 }
  })
  assert.deepEqual(effectTypes(result.effects), ['REJECT_TRANSITION'])
  assert.equal(result.diagnostics[0].reason, 'not-armed')

  let state = reduce(idle, {
    type: 'ARM_DRAG',
    interactionId: 'drag-3',
    itemId: 'a',
    pointerKind: 'mouse',
    originPx: { x: 0, y: 0 },
    originGrid: { x: 0, y: 0 }
  }).state
  result = reduce(state, {
    type: 'MOVE_DRAG',
    interactionId: 'stale-drag',
    currentPx: { x: 10, y: 0 },
    grid: { x: 1, y: 0 }
  })
  assert.deepEqual(effectTypes(result.effects), ['IGNORE_STALE'])
  assert.equal(result.diagnostics[0].reason, 'stale-event')

  result = reduce(state, { type: 'CANCEL', reason: 'external-layout-change' })
  assert.equal(result.state.status, 'idle')
  assert.deepEqual(effectTypes(result.effects), ['CLEAR_TRANSIENT'])

  const snapshot = JSON.stringify(result.diagnostics)
  assert.equal(snapshot.includes('nodeType'), false)
  assert.equal(snapshot.includes('clientX'), false)
  assert.equal(snapshot.includes('payload'), false)
}

testThresholdResolution()
testPendingDragBelowThresholdStaysClickLike()
testDragActivationAndCommit()
testTouchThresholdAndZeroCompat()
testResizeLifecycle()
testDropLifecycle()
testIllegalCancelStaleAndDiagnosticsSanitization()

console.log('interaction-state-machine-core tests passed')
