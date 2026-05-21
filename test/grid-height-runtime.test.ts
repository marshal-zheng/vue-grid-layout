import assert from 'assert'
import {
  GRID_HEIGHT_DIAGNOSTIC_CODES,
  resolveGridHeightRuntime
} from '../lib/grid-height'
import {
  calcGridItemPosition,
  calcWH,
  calcXY
} from '../lib/calculateUtils'
import type { Layout } from '../lib/utils'

const layout: Layout = [
  { i: 'a', x: 0, y: 0, w: 2, h: 2 },
  { i: 'b', x: 0, y: 3, w: 2, h: 1 }
]

function testAutoHeightRuntime() {
  const runtime = resolveGridHeightRuntime({
    layout,
    rowHeight: 20,
    margin: [5, 5],
    containerPadding: [10, 10]
  })
  assert.equal(runtime.requestedHeightMode, 'auto')
  assert.equal(runtime.effectiveHeightMode, 'auto')
  assert.equal(runtime.renderPrecision, 'integer')
  assert.equal(runtime.bottomRows, 4)
  assert.equal(runtime.contentHeight, 115)
  assert.equal(runtime.containerStyle.height, '115px')
  assert.deepEqual(runtime.diagnostics, [])
}

function testLegacyAutoSizeFalseCompatibility() {
  const runtime = resolveGridHeightRuntime({
    layout,
    autoSize: false,
    rowHeight: 20,
    margin: [5, 5],
    containerPadding: [10, 10]
  })
  assert.equal(runtime.requestedHeightMode, 'scroll')
  assert.equal(runtime.effectiveHeightMode, 'auto')
  assert.equal(runtime.containerStyle.height, null)
  assert.equal(runtime.diagnostics.some(item => item.code === 'scroll-container-height-fallback'), true)
}

function testFixedScrollAndContainerPriority() {
  const fixed = resolveGridHeightRuntime({
    layout,
    heightMode: 'fixed',
    rowHeight: 30,
    margin: [10, 10],
    containerPadding: [0, 0],
    containerHeight: 240,
    measuredContainerHeight: 360,
    autoMeasureContainerHeight: true
  })
  assert.equal(fixed.containerHeight, 240)
  assert.equal(fixed.containerHeightSource, 'container-height')
  assert.equal(fixed.containerStyle.height, '240px')
  assert.equal(fixed.containerStyle.overflow, 'hidden')

  const scroll = resolveGridHeightRuntime({
    layout,
    heightMode: 'scroll',
    rowHeight: 30,
    margin: [10, 10],
    containerPadding: [0, 0],
    measuredContainerHeight: 360,
    autoMeasureContainerHeight: true
  })
  assert.equal(scroll.containerHeight, 360)
  assert.equal(scroll.containerHeightSource, 'measured-parent')
  assert.equal(scroll.containerStyle.overflow, 'auto')
}

function testFitDecimalAndFallbacks() {
  const fit = resolveGridHeightRuntime({
    layout: [{ i: 'a', x: 0, y: 0, w: 1, h: 2 }],
    heightMode: 'fit',
    containerHeight: 101,
    rowHeight: 20,
    margin: [5, 5],
    containerPadding: [10, 10],
    renderPrecision: 'subpixel'
  })
  assert.equal(fit.effectiveHeightMode, 'fit')
  assert.equal(fit.rowHeight, 38)
  assert.equal(fit.rowHeightSource, 'fit')
  assert.equal(fit.renderPrecision, 'subpixel')

  const minFallback = resolveGridHeightRuntime({
    layout: [{ i: 'a', x: 0, y: 0, w: 1, h: 10 }],
    heightMode: 'fit',
    containerHeight: 120,
    rowHeight: 30,
    minRowHeight: 20,
    margin: [10, 10],
    containerPadding: [10, 10]
  })
  assert.equal(minFallback.effectiveHeightMode, 'scroll')
  assert.equal(minFallback.containerStyle.overflow, 'auto')
  assert.equal(minFallback.diagnostics.some(item => item.code === 'fit-min-row-height-fallback'), true)

  const missing = resolveGridHeightRuntime({
    layout,
    heightMode: 'fit',
    rowHeight: 30,
    margin: [10, 10],
    containerPadding: [0, 0]
  })
  assert.equal(missing.effectiveHeightMode, 'auto')
  assert.equal(missing.diagnostics.some(item => item.code === 'missing-container-height'), true)
}

function testEmptyFitAndInvalidInputs() {
  const emptyFit = resolveGridHeightRuntime({
    layout: [],
    heightMode: 'fit',
    containerHeight: 400,
    rowHeight: 24,
    margin: [10, 10],
    containerPadding: [8, 8]
  })
  assert.equal(emptyFit.effectiveHeightMode, 'fit')
  assert.equal(emptyFit.containerStyle.height, '400px')
  assert.equal(emptyFit.rowHeightSource, 'empty-fit-fallback')
  assert.equal(emptyFit.diagnostics.some(item => item.code === 'empty-fit-layout'), true)

  const invalid = resolveGridHeightRuntime({
    layout,
    heightMode: 'giant' as never,
    rowHeight: Number.NaN,
    minRowHeight: -1,
    containerHeight: -100,
    measuredContainerHeight: 0,
    autoMeasureContainerHeight: true,
    renderPrecision: 'retina' as never,
    margin: [10, 10],
    containerPadding: [0, 0],
    context: { layoutId: 'layout-a', profileId: 'profile-a', targetView: 'mobile' }
  })
  const codes = invalid.diagnostics.map(item => item.code)
  assert.deepEqual(codes, codes.slice().sort())
  assert.equal(codes.includes(GRID_HEIGHT_DIAGNOSTIC_CODES.invalidHeightMode), true)
  assert.equal(codes.includes(GRID_HEIGHT_DIAGNOSTIC_CODES.invalidRenderPrecision), true)
  assert.equal(codes.includes(GRID_HEIGHT_DIAGNOSTIC_CODES.invalidRowHeight), true)
  assert.equal(codes.includes(GRID_HEIGHT_DIAGNOSTIC_CODES.invalidMinRowHeight), true)
  assert.equal(codes.includes(GRID_HEIGHT_DIAGNOSTIC_CODES.invalidContainerHeight), true)
  assert.equal(JSON.stringify(invalid.diagnostics).includes('[object'), false)
}

function testRenderPrecisionDoesNotChangeCommittedUnits() {
  const integerPosition = calcGridItemPosition({
    cols: 3,
    containerPadding: [10, 10],
    containerWidth: 101,
    margin: [5, 5],
    maxRows: Infinity,
    rowHeight: 20.25,
    renderPrecision: 'integer'
  }, 1, 1, 1, 2)
  const subpixelPosition = calcGridItemPosition({
    cols: 3,
    containerPadding: [10, 10],
    containerWidth: 101,
    margin: [5, 5],
    maxRows: Infinity,
    rowHeight: 20.25,
    renderPrecision: 'subpixel'
  }, 1, 1, 1, 2)
  assert.equal(integerPosition.left, Math.round(subpixelPosition.left))
  assert.notEqual(subpixelPosition.left, Math.round(subpixelPosition.left))
  assert.equal(integerPosition.height, Math.round(subpixelPosition.height))

  const xy = calcXY({
    cols: 3,
    containerPadding: [10, 10],
    containerWidth: 101,
    margin: [5, 5],
    maxRows: Infinity,
    rowHeight: 20.25,
    renderPrecision: 'subpixel'
  }, subpixelPosition.top + 0.4, subpixelPosition.left + 0.4, 1, 2)
  const wh = calcWH({
    cols: 3,
    containerPadding: [10, 10],
    containerWidth: 101,
    margin: [5, 5],
    maxRows: Infinity,
    rowHeight: 20.25,
    renderPrecision: 'subpixel'
  }, subpixelPosition.width + 0.4, subpixelPosition.height + 0.4, 0, 0, 'se')
  assert.equal(Number.isInteger(xy.x), true)
  assert.equal(Number.isInteger(xy.y), true)
  assert.equal(Number.isInteger(wh.w), true)
  assert.equal(Number.isInteger(wh.h), true)
}

testAutoHeightRuntime()
testLegacyAutoSizeFalseCompatibility()
testFixedScrollAndContainerPriority()
testFitDecimalAndFallbacks()
testEmptyFitAndInvalidInputs()
testRenderPrecisionDoesNotChangeCommittedUnits()

console.log('grid-height-runtime tests passed')
