import type { ExampleScenario } from './types.js'

// 场景示例数据（fallback：当找不到仓库 example/ 目录时使用）
// 与 example/00-base.js、02-Response.js、07-drag-from-outside.js 完全对齐
// 样式包含：css/styles.css（核心样式）+ example/index.html 内联样式（demo 可视化）
export const FALLBACK_SCENARIO_EXAMPLES: Record<ExampleScenario, string> = {
  basic: `## 基础用法（来自 example/00-base.js）

运行方式：打开 example/index.html?demo=00-base

> 必须设置 \`:width\` 或使用 \`WidthProvider\`，否则网格项会纵向堆叠！

### 方式一：v-model 传入布局（固定宽度）

\`\`\`vue
<template>
  <div>
    <div class="layoutJSON">
      Displayed as <code>[x, y, w, h]</code>:
      <div class="columns">
        <div v-for="l in layout" :key="l.i" class="layoutItem">
          <b>{{ l.i }}</b>{{ ":" + l.x + "," + l.y + "," + l.w + "," + l.h }}
        </div>
      </div>
    </div>
    <VueGridLayout
      class="layout"
      v-model="layout"
      :cols="12"
      :row-height="30"
      :width="1200"
      :resize-handles="availableHandles"
    >
      <div key="a">a</div>
      <div key="b">b</div>
      <div key="c">c</div>
    </VueGridLayout>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import VueGridLayout from '@marsio/vue-grid-layout'

const availableHandles = ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']

const layout = reactive([
  { i: 'a', x: 0, y: 0, w: 1, h: 2, static: false },
  { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
  { i: 'c', x: 4, y: 0, w: 1, h: 2 },
])
</script>

<style>
/* ===== 核心样式（来自 css/styles.css）===== */
.vue-grid-layout {
  position: relative;
  transition: height var(--vgl-container-transition-duration, 200ms) var(--vgl-container-transition-easing, ease);
}
.vue-grid-item {
  transition-property: left, top, width, height;
  transition-duration: var(--vgl-item-transition-duration, 200ms);
  transition-timing-function: var(--vgl-item-transition-easing, ease);
}
.vue-grid-item img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
.vue-grid-item.cssTransforms {
  transition-property: transform, width, height;
}
.vue-grid-item.resizing {
  transition: none;
  z-index: 1;
  will-change: width, height;
  touch-action: none;
}
.vue-grid-item.vue-draggable-dragging {
  transition: none;
  z-index: 3;
  will-change: transform;
  touch-action: none;
}
.vue-grid-item.dropping {
  visibility: hidden;
}
.vue-grid-item.vue-grid-placeholder {
  background: var(--vgl-placeholder-bg, rgba(59, 130, 246, 0.15));
  border: 2px dashed var(--vgl-placeholder-border, rgba(59, 130, 246, 0.65));
  box-sizing: border-box;
  opacity: 1;
  transition-duration: var(--vgl-placeholder-transition-duration, 100ms);
  transition-timing-function: var(--vgl-placeholder-transition-easing, ease);
  will-change: transform, width, height;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}
.vue-grid-item.vue-grid-placeholder.placeholder-resizing {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .vue-grid-layout,
  .vue-grid-item,
  .vue-grid-item.vue-grid-placeholder {
    transition: none !important;
  }
}
.vue-grid-item > .vue-resizable-handle {
  position: absolute;
  width: var(--vgl-resize-handle-size, 24px);
  height: var(--vgl-resize-handle-size, 24px);
  touch-action: none;
}
.vue-grid-item > .vue-resizable-handle::after {
  content: "";
  position: absolute;
  right: var(--vgl-resize-handle-indicator-inset, 4px);
  bottom: var(--vgl-resize-handle-indicator-inset, 4px);
  width: var(--vgl-resize-handle-indicator-size, 6px);
  height: var(--vgl-resize-handle-indicator-size, 6px);
  border-right: 2px solid var(--vgl-resize-handle-indicator-color, rgba(0, 0, 0, 0.4));
  border-bottom: 2px solid var(--vgl-resize-handle-indicator-color, rgba(0, 0, 0, 0.4));
}
.vue-grid-item.vue-draggable:not(.has-drag-handle) {
  cursor: grab;
}
.vue-grid-item.vue-draggable.vue-draggable-dragging:not(.has-drag-handle) {
  cursor: grabbing;
}
.vue-grid-item.vue-draggable.vue-draggable-dragging {
  user-select: none;
}
.vue-grid-item.resizing {
  user-select: none;
}
.vue-grid-item.drag-blocked,
.vue-grid-item.resize-blocked {
  outline: 2px solid var(--vgl-blocked-outline, rgba(239, 68, 68, 0.9));
  outline-offset: -2px;
}
.vue-grid-item.drag-blocked.vue-draggable:not(.has-drag-handle) {
  cursor: not-allowed;
}
.vue-grid-item.resize-blocked > .vue-resizable-handle {
  cursor: not-allowed;
}
.vue-resizable-hide > .vue-resizable-handle {
  display: none;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-sw {
  bottom: 0; left: 0; cursor: sw-resize; transform: rotate(90deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-se {
  bottom: 0; right: 0; cursor: se-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-nw {
  top: 0; left: 0; cursor: nw-resize; transform: rotate(180deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-ne {
  top: 0; right: 0; cursor: ne-resize; transform: rotate(270deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-w,
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-e {
  top: 50%; margin-top: -10px; cursor: ew-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-w {
  left: 0; transform: rotate(135deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-e {
  right: 0; transform: rotate(315deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-n,
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-s {
  left: 50%; margin-left: -10px; cursor: ns-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-n {
  top: 0; transform: rotate(225deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-s {
  bottom: 0; transform: rotate(45deg);
}

/* ===== Demo 可视化样式（来自 example/index.html）===== */
body { padding: 20px; }
#content { width: 100%; }
.vue-grid-layout { background: #eee; margin-top: 10px; }
.layoutJSON { background: #ddd; border: 1px solid black; margin-top: 10px; padding: 10px; }
.columns { -moz-columns: 120px; -webkit-columns: 120px; columns: 120px; }
.vue-grid-item { box-sizing: border-box; }
.vue-grid-item:not(.vue-grid-placeholder) { background: #ccc; border: 1px solid black; }
.vue-grid-item.resizing { opacity: 0.9; }
.vue-grid-item.static { background: #cce; }
.vue-grid-item .text {
  font-size: 24px; text-align: center;
  position: absolute; top: 0; bottom: 0; left: 0; right: 0;
  margin: auto; height: 24px;
}
.vue-grid-item .minMax { font-size: 12px; }
.vue-grid-item .add { cursor: pointer; }
.vue-grid-dragHandleExample {
  cursor: move; cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;
}
</style>
\`\`\`

### 方式二：data-grid 属性定义布局

\`\`\`vue
<template>
  <div>
    <div class="layoutJSON">
      Displayed as <code>[x, y, w, h]</code>:
      <div class="columns">
        <div v-for="l in layout2" :key="l.i" class="layoutItem">
          <b>{{ l.i }}</b>{{ ":" + l.x + "," + l.y + "," + l.w + "," + l.h }}
        </div>
      </div>
    </div>
    <VueGridLayout
      class="layout"
      v-model="layout2"
      :cols="12"
      :row-height="30"
      :width="1200"
    >
      <div key="a" :data-grid="{ x: 0, y: 0, w: 1, h: 2, static: true }">a</div>
      <div key="b" :data-grid="{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }">b</div>
      <div key="c" :data-grid="{ x: 4, y: 0, w: 1, h: 2 }">c</div>
    </VueGridLayout>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import VueGridLayout from '@marsio/vue-grid-layout'

const layout2 = reactive([])
</script>
\`\`\``,

  responsive: `## 响应式布局（来自 example/02-Response.js）

运行方式：打开 example/index.html?demo=02-Response

\`\`\`vue
<template>
  <div>
    <h1>Vue Grid Layout</h1>
    <div>Current Breakpoint: {{ state.currentBreakpoint }} (</div>
    <div>
      Compaction type:
      {{ state.compactType ? state.compactType.charAt(0).toUpperCase() + state.compactType.slice(1).toLowerCase() : 'No Compaction' }}
    </div>
    <button @click="newLayout">Generate New Layout</button>
    <button @click="compactTypeChange">Change Compaction Type</button>
    <button @click="resizeTypeChange">
      Resize {{ state.resizeHandles === availableHandles ? 'One Corner' : 'All Corners' }}
    </button>
    <div class="layoutJSON">
      Displayed as <code>[x, y, w, h]</code>:
      <div class="columns">
        <div v-for="l in state.layout" :key="l.i" class="layoutItem">
          <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
          {{ ':' + l.x + ',' + l.y + ',' + l.w + ',' + l.h }}
        </div>
      </div>
    </div>
    <ResponsiveVueGridLayout
      class="layout"
      :row-height="30"
      :cols="state.cols"
      :layouts="state.layouts"
      :measure-before-mount="false"
      :use-css-transforms="state.mounted"
      :compact-type="state.compactType"
      :prevent-collision="!state.compactType"
      :container-padding="[16, 16]"
      @breakpoint-change="onBreakpointChange"
      @layout-change="onLayoutChange"
      @drop="onDrop"
    >
      <div v-for="(l, i) in state.layouts.lg" :key="i + 1" :class="{ static: l.static }">
        <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
          Static - {{ i }}
        </span>
        <span v-else class="text">{{ i }}</span>
      </div>
    </ResponsiveVueGridLayout>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { WidthProvider, Responsive } from '@marsio/vue-grid-layout'

const ResponsiveVueGridLayout = WidthProvider(Responsive)

const availableHandles = ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']

const generateLayout = (resizeHandles) => {
  return Array.from({ length: 20 }, (_, i) => {
    const y = Math.ceil(Math.random() * 4) + 1
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: (i + 1).toString(),
      static: Math.random() < 0.05,
      resizeHandles,
    }
  })
}

const state = reactive({
  currentBreakpoint: 'lg',
  compactType: 'vertical',
  resizeHandles: ['se'],
  mounted: false,
  layout: [],
  layouts: { lg: generateLayout(['se']) },
})

onMounted(() => { state.mounted = true })

const compactTypeChange = () => {
  const oldCompactType = state.compactType
  const compactType =
    oldCompactType === 'horizontal' ? 'vertical' :
    oldCompactType === 'vertical' ? null : 'horizontal'
  state.compactType = compactType
}

const newLayout = () => {
  state.layouts = { lg: generateLayout(state.resizeHandles) }
}

const resizeTypeChange = () => {
  const resizeHandles = state.resizeHandles === availableHandles ? ['se'] : availableHandles
  state.resizeHandles = resizeHandles
  state.layouts = { lg: generateLayout(resizeHandles) }
}

const onBreakpointChange = ({ breakpoint }) => {
  state.currentBreakpoint = breakpoint
}

const onLayoutChange = (layout, layouts) => {
  state.layout = layout
}

const onDrop = (elemParams) => {
  alert(\`Element parameters: \${JSON.stringify(elemParams)}\`)
}
</script>

<style>
/* ===== 核心样式（来自 css/styles.css）===== */
.vue-grid-layout {
  position: relative;
  transition: height var(--vgl-container-transition-duration, 200ms) var(--vgl-container-transition-easing, ease);
}
.vue-grid-item {
  transition-property: left, top, width, height;
  transition-duration: var(--vgl-item-transition-duration, 200ms);
  transition-timing-function: var(--vgl-item-transition-easing, ease);
}
.vue-grid-item img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
.vue-grid-item.cssTransforms {
  transition-property: transform, width, height;
}
.vue-grid-item.resizing {
  transition: none;
  z-index: 1;
  will-change: width, height;
  touch-action: none;
}
.vue-grid-item.vue-draggable-dragging {
  transition: none;
  z-index: 3;
  will-change: transform;
  touch-action: none;
}
.vue-grid-item.dropping {
  visibility: hidden;
}
.vue-grid-item.vue-grid-placeholder {
  background: var(--vgl-placeholder-bg, rgba(59, 130, 246, 0.15));
  border: 2px dashed var(--vgl-placeholder-border, rgba(59, 130, 246, 0.65));
  box-sizing: border-box;
  opacity: 1;
  transition-duration: var(--vgl-placeholder-transition-duration, 100ms);
  transition-timing-function: var(--vgl-placeholder-transition-easing, ease);
  will-change: transform, width, height;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}
.vue-grid-item.vue-grid-placeholder.placeholder-resizing {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .vue-grid-layout,
  .vue-grid-item,
  .vue-grid-item.vue-grid-placeholder {
    transition: none !important;
  }
}
.vue-grid-item > .vue-resizable-handle {
  position: absolute;
  width: var(--vgl-resize-handle-size, 24px);
  height: var(--vgl-resize-handle-size, 24px);
  touch-action: none;
}
.vue-grid-item > .vue-resizable-handle::after {
  content: "";
  position: absolute;
  right: var(--vgl-resize-handle-indicator-inset, 4px);
  bottom: var(--vgl-resize-handle-indicator-inset, 4px);
  width: var(--vgl-resize-handle-indicator-size, 6px);
  height: var(--vgl-resize-handle-indicator-size, 6px);
  border-right: 2px solid var(--vgl-resize-handle-indicator-color, rgba(0, 0, 0, 0.4));
  border-bottom: 2px solid var(--vgl-resize-handle-indicator-color, rgba(0, 0, 0, 0.4));
}
.vue-grid-item.vue-draggable:not(.has-drag-handle) {
  cursor: grab;
}
.vue-grid-item.vue-draggable.vue-draggable-dragging:not(.has-drag-handle) {
  cursor: grabbing;
}
.vue-grid-item.vue-draggable.vue-draggable-dragging {
  user-select: none;
}
.vue-grid-item.resizing {
  user-select: none;
}
.vue-grid-item.drag-blocked,
.vue-grid-item.resize-blocked {
  outline: 2px solid var(--vgl-blocked-outline, rgba(239, 68, 68, 0.9));
  outline-offset: -2px;
}
.vue-grid-item.drag-blocked.vue-draggable:not(.has-drag-handle) {
  cursor: not-allowed;
}
.vue-grid-item.resize-blocked > .vue-resizable-handle {
  cursor: not-allowed;
}
.vue-resizable-hide > .vue-resizable-handle {
  display: none;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-sw {
  bottom: 0; left: 0; cursor: sw-resize; transform: rotate(90deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-se {
  bottom: 0; right: 0; cursor: se-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-nw {
  top: 0; left: 0; cursor: nw-resize; transform: rotate(180deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-ne {
  top: 0; right: 0; cursor: ne-resize; transform: rotate(270deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-w,
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-e {
  top: 50%; margin-top: -10px; cursor: ew-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-w {
  left: 0; transform: rotate(135deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-e {
  right: 0; transform: rotate(315deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-n,
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-s {
  left: 50%; margin-left: -10px; cursor: ns-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-n {
  top: 0; transform: rotate(225deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-s {
  bottom: 0; transform: rotate(45deg);
}

/* ===== Demo 可视化样式（来自 example/index.html）===== */
body { padding: 20px; }
#content { width: 100%; }
.vue-grid-layout { background: #eee; margin-top: 10px; }
.layoutJSON { background: #ddd; border: 1px solid black; margin-top: 10px; padding: 10px; }
.columns { -moz-columns: 120px; -webkit-columns: 120px; columns: 120px; }
.vue-grid-item { box-sizing: border-box; }
.vue-grid-item:not(.vue-grid-placeholder) { background: #ccc; border: 1px solid black; }
.vue-grid-item.resizing { opacity: 0.9; }
.vue-grid-item.static { background: #cce; }
.vue-grid-item .text {
  font-size: 24px; text-align: center;
  position: absolute; top: 0; bottom: 0; left: 0; right: 0;
  margin: auto; height: 24px;
}
.vue-grid-item .minMax { font-size: 12px; }
.vue-grid-item .add { cursor: pointer; }
.vue-grid-dragHandleExample {
  cursor: move; cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;
}
</style>
\`\`\``,

  'drag-from-outside': `## 从外部拖入元素（来自 example/07-drag-from-outside.js）

运行方式：打开 example/index.html?demo=07-drag-from-outside

\`\`\`vue
<template>
  <div>
    <h1>Vue Grid Layout</h1>
    <div class="layoutJSON">
      Displayed as <code>[x, y, w, h]</code>:
      <div class="columns">
        <div v-for="l in state.layout" :key="l.i" class="layoutItem">
          <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
          {{ ': [' + l.x + ',' + l.y + ',' + l.w + ',' + l.h + ']' }}
        </div>
      </div>
    </div>
    <div
      class="droppable-element"
      :draggable="true"
      unselectable="on"
      @dragstart="(e) => e.dataTransfer.setData('text/plain', '')"
    >
      Droppable Element (Drag me!)
    </div>
    <ResponsiveVueGridLayout
      class="layout"
      :row-height="30"
      :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
      :layouts="state.layouts"
      :measure-before-mount="false"
      :use-css-transforms="state.mounted"
      :container-padding="[16, 16]"
      :is-droppable="true"
      drop-strategy="auto"
      @breakpoint-change="onBreakpointChange"
      @layout-change="onLayoutChange"
      @drop-drag-over="onDropDragOver"
      @drop="onDrop"
    >
      <div v-for="l in state.layouts.lg" :key="l.i" :class="{ static: l.static }">
        <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
          Static - {{ l.i }}
        </span>
        <span v-else class="text">{{ l.i }}</span>
      </div>
    </ResponsiveVueGridLayout>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { WidthProvider, Responsive } from '@marsio/vue-grid-layout'

const ResponsiveVueGridLayout = WidthProvider(Responsive)

const generateLayout = () => {
  return Array.from({ length: 3 }, (_, i) => {
    const y = Math.ceil(Math.random() * 4) + 1
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: (i + 1).toString(),
      static: Math.random() < 0.05,
    }
  })
}

const state = reactive({
  currentBreakpoint: 'lg',
  compactType: 'vertical',
  mounted: false,
  layout: [],
  layouts: { lg: generateLayout() },
})

onMounted(() => { state.mounted = true })

const onBreakpointChange = ({ breakpoint }) => {
  state.currentBreakpoint = breakpoint
}

const onLayoutChange = (layout, layouts) => {
  state.layout = layout
}

const onDrop = (layout, _event, layoutItem) => {
  const newItems = layout.concat({
    ...layoutItem,
    i: (state.layouts.lg.length + 1).toString(),
  })
  state.layouts = { lg: newItems }
}

const onDropDragOver = (e) => {
  return { w: 2, h: 2 }
}
</script>

<style>
/* ===== 核心样式（来自 css/styles.css）===== */
.vue-grid-layout {
  position: relative;
  transition: height var(--vgl-container-transition-duration, 200ms) var(--vgl-container-transition-easing, ease);
}
.vue-grid-item {
  transition-property: left, top, width, height;
  transition-duration: var(--vgl-item-transition-duration, 200ms);
  transition-timing-function: var(--vgl-item-transition-easing, ease);
}
.vue-grid-item img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
.vue-grid-item.cssTransforms {
  transition-property: transform, width, height;
}
.vue-grid-item.resizing {
  transition: none;
  z-index: 1;
  will-change: width, height;
  touch-action: none;
}
.vue-grid-item.vue-draggable-dragging {
  transition: none;
  z-index: 3;
  will-change: transform;
  touch-action: none;
}
.vue-grid-item.dropping {
  visibility: hidden;
}
.vue-grid-item.vue-grid-placeholder {
  background: var(--vgl-placeholder-bg, rgba(59, 130, 246, 0.15));
  border: 2px dashed var(--vgl-placeholder-border, rgba(59, 130, 246, 0.65));
  box-sizing: border-box;
  opacity: 1;
  transition-duration: var(--vgl-placeholder-transition-duration, 100ms);
  transition-timing-function: var(--vgl-placeholder-transition-easing, ease);
  will-change: transform, width, height;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}
.vue-grid-item.vue-grid-placeholder.placeholder-resizing {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .vue-grid-layout,
  .vue-grid-item,
  .vue-grid-item.vue-grid-placeholder {
    transition: none !important;
  }
}
.vue-grid-item > .vue-resizable-handle {
  position: absolute;
  width: var(--vgl-resize-handle-size, 24px);
  height: var(--vgl-resize-handle-size, 24px);
  touch-action: none;
}
.vue-grid-item > .vue-resizable-handle::after {
  content: "";
  position: absolute;
  right: var(--vgl-resize-handle-indicator-inset, 4px);
  bottom: var(--vgl-resize-handle-indicator-inset, 4px);
  width: var(--vgl-resize-handle-indicator-size, 6px);
  height: var(--vgl-resize-handle-indicator-size, 6px);
  border-right: 2px solid var(--vgl-resize-handle-indicator-color, rgba(0, 0, 0, 0.4));
  border-bottom: 2px solid var(--vgl-resize-handle-indicator-color, rgba(0, 0, 0, 0.4));
}
.vue-grid-item.vue-draggable:not(.has-drag-handle) {
  cursor: grab;
}
.vue-grid-item.vue-draggable.vue-draggable-dragging:not(.has-drag-handle) {
  cursor: grabbing;
}
.vue-grid-item.vue-draggable.vue-draggable-dragging {
  user-select: none;
}
.vue-grid-item.resizing {
  user-select: none;
}
.vue-grid-item.drag-blocked,
.vue-grid-item.resize-blocked {
  outline: 2px solid var(--vgl-blocked-outline, rgba(239, 68, 68, 0.9));
  outline-offset: -2px;
}
.vue-grid-item.drag-blocked.vue-draggable:not(.has-drag-handle) {
  cursor: not-allowed;
}
.vue-grid-item.resize-blocked > .vue-resizable-handle {
  cursor: not-allowed;
}
.vue-resizable-hide > .vue-resizable-handle {
  display: none;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-sw {
  bottom: 0; left: 0; cursor: sw-resize; transform: rotate(90deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-se {
  bottom: 0; right: 0; cursor: se-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-nw {
  top: 0; left: 0; cursor: nw-resize; transform: rotate(180deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-ne {
  top: 0; right: 0; cursor: ne-resize; transform: rotate(270deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-w,
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-e {
  top: 50%; margin-top: -10px; cursor: ew-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-w {
  left: 0; transform: rotate(135deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-e {
  right: 0; transform: rotate(315deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-n,
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-s {
  left: 50%; margin-left: -10px; cursor: ns-resize;
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-n {
  top: 0; transform: rotate(225deg);
}
.vue-grid-item > .vue-resizable-handle.vue-resizable-handle-s {
  bottom: 0; transform: rotate(45deg);
}

/* ===== Demo 可视化样式（来自 example/index.html）===== */
body { padding: 20px; }
#content { width: 100%; }
.vue-grid-layout { background: #eee; margin-top: 10px; }
.layoutJSON { background: #ddd; border: 1px solid black; margin-top: 10px; padding: 10px; }
.columns { -moz-columns: 120px; -webkit-columns: 120px; columns: 120px; }
.vue-grid-item { box-sizing: border-box; }
.vue-grid-item:not(.vue-grid-placeholder) { background: #ccc; border: 1px solid black; }
.vue-grid-item.resizing { opacity: 0.9; }
.vue-grid-item.static { background: #cce; }
.vue-grid-item .text {
  font-size: 24px; text-align: center;
  position: absolute; top: 0; bottom: 0; left: 0; right: 0;
  margin: auto; height: 24px;
}
.vue-grid-item .minMax { font-size: 12px; }
.vue-grid-item .add { cursor: pointer; }
.vue-grid-dragHandleExample {
  cursor: move; cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;
}
/* 外部可拖拽元素样式 */
.droppable-element {
  width: 150px; text-align: center;
  background: #fdd; border: 1px solid black;
  margin: 10px 0; padding: 10px;
}
</style>
\`\`\``,
}
