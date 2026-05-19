import assert from 'assert'
import {
  createGridLayoutEventBridge,
  splitGridRootAttrs
} from '../lib/grid-layout/contract'
import { useGridFrameUpdate } from '../lib/grid-layout/useGridFrameUpdate'
import { useGridAutoScroll } from '../lib/grid-layout/useGridAutoScroll'
import { createGridEditorOverlayGeometry } from '../lib/grid-layout/GridEditorOverlay'
import type { Layout, LayoutItem } from '../lib/utils'

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

testRootAttrsSplit()
testEventBridge()
testFrameUpdate()
testAutoScroll()
testOverlayGeometry()

console.log('grid-layout-internal-core tests passed')
