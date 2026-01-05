/**
 * vue-grid-layout MCP 文档
 *
 * ⚠️ 本文件与 README.md 保持同步，确保 AI IDE 能精准使用组件库
 *
 * Props 数据来源：
 * - lib/VueGridLayoutPropTypes.ts (VueGridLayout)
 * - lib/ResponsiveVueGridLayout.tsx (Responsive)
 * - lib/WidthProvider.tsx (WidthProvider)
 * - typings/index.d.ts (类型定义)
 */

import type { VueGridLayoutProp } from './props.generated.js'
import {
  VUE_GRID_LAYOUT_PROPS,
  RESPONSIVE_VUE_GRID_LAYOUT_PROPS,
  WIDTH_PROVIDER_PROPS,
} from './props.generated.js'
import {
  VUE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  RESPONSIVE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  WIDTH_PROVIDER_PROP_DESCRIPTIONS,
} from './propDescriptions.js'
import { VUE_GRID_LAYOUT_TYPE_DEFS } from './types.generated.js'

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim()
}

function formatCodeCell(text: string | null | undefined): string {
  if (!text) return '-'
  return `\`${escapeTableCell(text)}\``
}

function formatDefault(prop: Pick<VueGridLayoutProp, 'default' | 'defaultIsFactory'>): string {
  if (!prop.default) return '-'

  let output = prop.default
  if (prop.defaultIsFactory) {
    const arrow = output.match(/=>\s*(.+)$/)
    if (arrow) output = arrow[1].trim()

    if (output.startsWith('(') && output.endsWith(')')) {
      const inner = output.slice(1, -1).trim()
      if (inner.startsWith('{') || inner.startsWith('[') || inner === 'null') output = inner
    }
  }

  return formatCodeCell(output)
}

function formatType(prop: Pick<VueGridLayoutProp, 'tsType' | 'vueRuntimeTypes'>): string {
  if (prop.tsType) return formatCodeCell(prop.tsType)
  if (prop.vueRuntimeTypes.length > 0) return formatCodeCell(prop.vueRuntimeTypes.join(' | '))
  return formatCodeCell('unknown')
}

function sortByPreferredOrder<T extends { name: string }>(items: T[], preferredOrder: string[]): T[] {
  const index = new Map<string, number>()
  preferredOrder.forEach((name, i) => index.set(name, i))

  return [...items].sort((a, b) => {
    const ai = index.has(a.name) ? index.get(a.name)! : Number.POSITIVE_INFINITY
    const bi = index.has(b.name) ? index.get(b.name)! : Number.POSITIVE_INFINITY
    if (ai !== bi) return ai - bi
    return a.name.localeCompare(b.name)
  })
}

function buildPropsTable(
  props: VueGridLayoutProp[],
  descriptionMap: Record<string, string>,
  preferredOrder: string[]
): string {
  const rows = sortByPreferredOrder(props, preferredOrder).map((p) => {
    const desc = descriptionMap[p.name] ?? ''
    return `| \`${p.name}\` | ${formatType(p)} | ${formatDefault(p)} | ${escapeTableCell(desc)} |`
  })

  return ['| Prop | 类型 | 默认值 | 说明 |', '|------|------|--------|------|', ...rows].join('\n')
}

const PREFERRED_VGL_ORDER = [
  'class',
  'style',
  'width',
  'autoSize',
  'autoScroll',
  'cols',
  'margin',
  'containerPadding',
  'rowHeight',
  'maxRows',
  'compactType',
  'verticalCompact',
  'preventCollision',
  'allowOverlap',
  'isBounded',
  'isDraggable',
  'isResizable',
  'isDroppable',
  'dropStrategy',
  'draggableHandle',
  'draggableCancel',
  'useCSSTransforms',
  'transformScale',
  'modelValue',
  'droppingItem',
  'resizeHandles',
  'resizeHandle',
  'historyStore',
  'innerRef',
]

const PREFERRED_RESPONSIVE_ORDER = [
  'breakpoint',
  'breakpoints',
  'cols',
  'layouts',
  'width',
  'margin',
  'containerPadding',
  'allowOverlap',
  'verticalCompact',
  'compactType',
]

const PREFERRED_WIDTH_PROVIDER_ORDER = ['measureBeforeMount', 'class', 'style']

const vueGridLayoutPropsTable = buildPropsTable(
  VUE_GRID_LAYOUT_PROPS,
  VUE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  PREFERRED_VGL_ORDER
)

const responsivePropsTable = buildPropsTable(
  RESPONSIVE_VUE_GRID_LAYOUT_PROPS,
  RESPONSIVE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  PREFERRED_RESPONSIVE_ORDER
)

const widthProviderPropsTable = buildPropsTable(
  WIDTH_PROVIDER_PROPS,
  WIDTH_PROVIDER_PROP_DESCRIPTIONS,
  PREFERRED_WIDTH_PROVIDER_ORDER
)

const vuePropsCount = VUE_GRID_LAYOUT_PROPS.length
const responsivePropsCount = RESPONSIVE_VUE_GRID_LAYOUT_PROPS.length
const widthProviderPropsCount = WIDTH_PROVIDER_PROPS.length

function formatTypeDef(name: keyof typeof VUE_GRID_LAYOUT_TYPE_DEFS): string {
  return VUE_GRID_LAYOUT_TYPE_DEFS[name].trim()
}

const TYPE_LAYOUT_ITEM = formatTypeDef('LayoutItem')
const TYPE_LAYOUT = formatTypeDef('Layout')
const TYPE_OTHER_TYPES = [
  formatTypeDef('CompactType'),
  formatTypeDef('ResizeHandleAxis'),
  formatTypeDef('VueRef'),
  formatTypeDef('ResizeHandle'),
  formatTypeDef('AutoScrollOptions'),
  formatTypeDef('ItemCallback'),
].join('\n\n')

export const DOCS = `# @marsio/vue-grid-layout

Vue 3 的可拖拽、可缩放网格布局组件，支持响应式断点、自动宽度测量以及历史撤销/重做。

**仅支持 Vue 3，不依赖 jQuery。**

---

## 安装

\`\`\`bash
npm install @marsio/vue-grid-layout
# 或
pnpm add @marsio/vue-grid-layout
\`\`\`

可覆盖的 CSS 变量：
- \`--vgl-placeholder-bg\`, \`--vgl-placeholder-border\`
- \`--vgl-resize-handle-size\`, \`--vgl-resize-handle-indicator-inset\`, \`--vgl-resize-handle-indicator-size\`, \`--vgl-resize-handle-indicator-color\`
- \`--vgl-blocked-outline\`

---

## 导出清单

\`\`\`ts
import {
  // 组件
  VueGridLayout,              // 核心网格布局组件（默认导出）
  Responsive,                 // 响应式布局组件（别名 ResponsiveVueGridLayout）
  WidthProvider,              // 宽度自动测量 HOC

  // 历史管理
  useGridHistoryStore,        // Pinia 历史 store hook
  createGridHistoryStore,     // 创建历史 store
  bindKeyboardShortcuts,      // 绑定键盘快捷键
  history,                    // 历史工具集合

  // 工具函数
  findFirstFit,               // 查找第一个可用位置
  findNearestFit,             // 查找最近可用位置
  utils,                      // 工具函数集合
  calculateUtils,             // 计算工具集合
} from '@marsio/vue-grid-layout'

// 默认导出
import VueGridLayout from '@marsio/vue-grid-layout'
\`\`\`

---

## 组件概览

| 组件 | 作用 |
|------|------|
| \`VueGridLayout\` | 核心网格容器，管理布局、拖拽、缩放、碰撞与自动滚动 |
| \`Responsive\` (别名 \`ResponsiveVueGridLayout\`) | 根据断点自动切换布局与列数 |
| \`WidthProvider\` | HOC，监听容器尺寸并将 \`width\` 注入给包裹的布局组件 |

---

## 类型定义

### LayoutItem（网格项）

\`\`\`ts
${TYPE_LAYOUT_ITEM}
\`\`\`

### Layout（布局数组）

\`\`\`ts
${TYPE_LAYOUT}
\`\`\`

### 其他类型

\`\`\`ts
${TYPE_OTHER_TYPES}
\`\`\`

---

## VueGridLayout

核心网格布局组件。

### Props（${vuePropsCount} 个）

${vueGridLayoutPropsTable}

### 事件

| 事件 | 签名 | 说明 |
|------|------|------|
| \`layoutChange\` | \`(layout: Layout) => void\` | 布局变更时触发 |
| \`update:modelValue\` | \`(layout: Layout) => void\` | v-model 双向绑定 |
| \`dragStart\` | \`ItemCallback\` | 拖拽开始 |
| \`drag\` | \`ItemCallback\` | 拖拽中 |
| \`dragStop\` | \`ItemCallback\` | 拖拽结束 |
| \`resizeStart\` | \`ItemCallback\` | 缩放开始 |
| \`resize\` | \`ItemCallback\` | 缩放中 |
| \`resizeStop\` | \`ItemCallback\` | 缩放结束 |
| \`drop\` | \`(layout: Layout, e: Event, item?: LayoutItem) => void\` | 外部元素放入 |
| \`dropDragOver\` | \`(e: DragEvent) => { w?: number; h?: number } \\| false\` | 外部元素拖入时动态设置尺寸 |

---

## ResponsiveVueGridLayout (Responsive)

响应式网格布局，根据断点自动切换布局。

### Props（${responsivePropsCount} 个，继承 VueGridLayout 大部分 props）

${responsivePropsTable}

说明：组件会将未声明的 attrs 透传给内部 \`VueGridLayout\`（例如 \`rowHeight\` / \`isDraggable\` / \`isResizable\` 等）。布局数据由 \`layouts\` + \`layoutChange\` 管理，\`modelValue\` / \`cols\` / \`margin\` / \`containerPadding\` 等会由内部计算并覆盖。

### 事件

| 事件 | 签名 | 说明 |
|------|------|------|
| \`layoutChange\` | \`(layout: Layout, layouts: Record<string, Layout>) => void\` | 布局变更 |
| \`breakpointChange\` | \`(breakpoint: string, cols: number) => void\` | 断点变化 |
| \`widthChange\` | \`(width: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void\` | 宽度变化 |

### 默认值

- 断点：\`{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }\`
- 列数：\`{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }\`

---

## WidthProvider

宽度自动测量高阶组件。

### Props（${widthProviderPropsCount} 个）

${widthProviderPropsTable}

说明：\`WidthProvider(Composed)\` 返回的组件会透传 \`attrs\` 给被包裹组件，并自动注入 \`width\`。

### 使用方式

\`\`\`ts
import { WidthProvider, Responsive } from '@marsio/vue-grid-layout'

// 包裹响应式组件
const ResponsiveGridLayout = WidthProvider(Responsive)

// 或包裹基础组件
const AutoWidthLayout = WidthProvider(VueGridLayout)
\`\`\`

---

## Grid Item（子项配置）

子项通过 \`data-grid\` 属性绑定布局信息，也可以通过 \`v-model\` / \`modelValue\` 数组统一管理。

**两种定义方式：**

1. **v-model 数组方式（推荐）**：布局统一管理
2. **data-grid 属性方式**：每个子项单独配置

### data-grid 属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| \`i\` | \`string\` | 是 | 唯一标识符 |
| \`x\` | \`number\` | 是 | 网格 X 坐标 |
| \`y\` | \`number\` | 是 | 网格 Y 坐标 |
| \`w\` | \`number\` | 是 | 宽度（网格单位） |
| \`h\` | \`number\` | 是 | 高度（网格单位） |
| \`minW\` | \`number\` | 否 | 最小宽度（默认 0） |
| \`maxW\` | \`number\` | 否 | 最大宽度（默认 Infinity） |
| \`minH\` | \`number\` | 否 | 最小高度（默认 0） |
| \`maxH\` | \`number\` | 否 | 最大高度（默认 Infinity） |
| \`static\` | \`boolean\` | 否 | 静态元素（不可拖拽/缩放） |
| \`isDraggable\` | \`boolean\` | 否 | 覆盖父级拖拽设置 |
| \`isResizable\` | \`boolean\` | 否 | 覆盖父级缩放设置 |
| \`isBounded\` | \`boolean\` | 否 | 限制在容器内 |
| \`resizeHandles\` | \`ResizeHandleAxis[]\` | 否 | 缩放手柄方向 |

**优先级**：\`data-grid\` > \`v-model\` 数组中同 \`i\` 的项 > 全局设置

---

## 典型示例（与仓库 example/ 100% 对齐）

为避免把大量 demo 代码塞进 MCP 文档占用上下文，示例统一通过工具 \`get_vue_grid_layout_example\` 获取（返回 \`example/index.html\` + 对应 demo.js，且入口已引用 \`css/styles.css\`）。

可用场景：
- \`basic\`：\`example/00-base.js\`
- \`responsive\`：\`example/02-Response.js\`
- \`drag-from-outside\`：\`example/07-drag-from-outside.js\`

运行方式（仓库内）：打开 \`example/index.html?demo=<demo-name>\`。

---

## 高度计算公式

实际像素高度 = \`(rowHeight × h) + (marginY × (h - 1))\`

例如：\`rowHeight=30\`, \`margin=[10,10]\`, \`h=4\` → \`(30 × 4) + (10 × 3) = 150px\`

**如果不想处理间距计算，设置 \`margin=[0,0]\`。**

---

## 常见问题 FAQ

### Q: 为什么元素不能拖拽？

1. 检查是否设置了 \`isDraggable={false}\`
2. 检查元素是否有 \`static: true\`
3. 检查 \`draggableHandle\` 选择器是否正确（需要加 \`.\`）
4. 确认已引入 CSS 样式

### Q: 为什么宽度为 0？

使用 \`WidthProvider\` 包裹组件，或手动传入 \`width\` prop。

### Q: 如何让元素固定不动？

设置 \`static: true\`：
\`\`\`ts
{ i: 'fixed', x: 0, y: 0, w: 2, h: 2, static: true }
\`\`\`

### Q: 如何禁用碰撞检测？

设置 \`allowOverlap={true}\` 允许元素重叠。

### Q: 如何禁用垂直压缩？

设置 \`compactType={null}\` 或 \`verticalCompact={false}\`。

### Q: 响应式布局如何工作？

1. 使用 \`Responsive\` 组件
2. 配置 \`breakpoints\`（断点 → 像素映射）
3. 配置 \`cols\`（断点 → 列数映射）
4. 配置 \`layouts\`（断点 → Layout 数组映射）

---

## 最佳实践

1. **使用 WidthProvider**：避免手动计算宽度
2. **key 要唯一**：确保每个子项的 \`key\` 与 \`i\` 一致
3. **响应式场景**：尽量提供所有断点的 layouts，尤其是最大断点
4. **大数据量**：超过 200 项时考虑性能优化（虚拟滚动等）

---

## 工具函数

\`\`\`ts
import { findFirstFit, findNearestFit } from '@marsio/vue-grid-layout'

// 查找第一个可用位置
const pos = findFirstFit(layout, { w: 2, h: 2 }, cols, maxRows)
// => { x: number, y: number } | null

// 查找最近可用位置
const nearestPos = findNearestFit(layout, { w: 2, h: 2 }, cols, targetX, targetY, maxRows)
// => { x: number, y: number } | null
\`\`\`
`
