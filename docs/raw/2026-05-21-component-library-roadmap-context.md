# Component Library Roadmap and Spec Planning Context

Created: 2026-05-21
Project: `/Users/hqz/dev/vue-grid-layout`

## 背景目标

本轮目标不是直接生成正式 spec，也不是马上改实现，而是把当前组件库能力评估、外部顶级产品/项目调研、优化方向和扩展脑暴沉淀成 raw context，后续再按这个记录分别生成对应 spec。

用户确认：

- 当前实现和能力需要认真 review。
- 需要联网调研顶级产品和开源项目。
- 需要评估当前组件库还可以扩展哪些更高级、更好用的能力。
- 基础优化和扩展脑暴都要纳入规划。
- 后续会根据本记录生成 spec。
- 可以不考虑 i18n。
- 项目约束：不要使用 computer use。

## 当前实现基线

当前仓库已经不只是基础 `VueGridLayout` 组件，而是逐步形成了 dashboard/editor SDK 的结构。

### 核心 Grid 层

相关文件：

- `lib/VueGridLayout.tsx`
- `lib/GridItem.tsx`
- `lib/ResponsiveVueGridLayout.tsx`
- `lib/DashboardResponsiveVueGridLayout.tsx`
- `lib/VueGridLayoutPropTypes.ts`
- `lib/calculateUtils.ts`
- `lib/utils.ts`
- `css/styles.css`

已有能力：

- Vue 3 grid layout。
- drag / resize / static item。
- responsive breakpoints 和 per-breakpoint layouts。
- CSS transform positioning。
- compactType、preventCollision、allowOverlap、bounded。
- external drop 和 drop strategy。
- height modes：`auto`、`scroll`、`fit`、`fixed`。
- subpixel render precision。
- auto-measure container height。
- drag activation distance / pointer state machine。
- root attrs forwarding 已有测试覆盖。

### Layout Engine 层

相关文件：

- `lib/layout-engine/core.ts`
- `lib/layout-engine/types.ts`
- `lib/layout-engine/indexing.ts`
- `lib/layout-engine/scheduler.ts`
- `lib/layout-engine/executor.ts`
- `lib/layout-engine/migration.ts`
- `lib/layout-engine/workerRuntime.ts`

已有能力：

- `move`
- `groupMove`
- `resize`
- `dropFit`
- `compact`
- `validate`
- `generateResponsiveLayout`
- `migrateSettings`
- `repairCollisions`
- `translateLayout`
- `placeItems`
- main-thread / worker executor。
- diagnostics、legacy comparison、scheduler。
- performance baseline/budget 文件已存在。

这层是后续做 nested grids、inter-grid drag、aspect ratio、auto grid、constraint engine、layout lint/repair preview 的关键基础。

### Editor Headless 层

相关文件：

- `lib/editor/controller.ts`
- `lib/editor/types.ts`
- `lib/editor/commands.ts`
- `lib/editor/commandKernel.ts`
- `lib/editor/commandRegistry.ts`
- `lib/editor/geometryCommands.ts`
- `lib/editor/guides.ts`
- `lib/editor/intelligence.ts`
- `lib/editor/placement.ts`
- `lib/editor/placementSession.ts`
- `lib/editor/keyboard.ts`
- `lib/editor/clipboard.ts`
- `lib/grid-layout/GridEditorOverlay.tsx`
- `lib/grid-layout/useGridEditorRuntime.ts`

已有能力：

- headless `useGridEditor()` / `createGridEditorController()`。
- mode：`view` / `edit`。
- selection：single / multiple、activeId、anchorId。
- command pipeline：descriptor defaults、validation、beforeCommand guard、stale revision checks、transactions、events。
- commands：select、clearSelection、move、resize、add、delete、duplicate、copy、paste、align、distribute、tidy、lock、unlock、show、hide、save、discard、reset、undo、redo、section row operations。
- editor metadata sidecar：locked、visible、editable、deletable、duplicatable、copyable。
- multi-select group move 已进入 layout engine。
- clipboard v1/v2 和 system clipboard fallback。
- placement session：begin/update/commit/cancel、ghost、HUD、affected outlines。
- keyboard editing：arrows、accelerated arrows、Alt resize、delete、copy/paste/duplicate/save、undo/redo、Esc。
- smart guides：alignment、spacing、section/row bounds、measurement HUD。
- a11y message hook 和 overlay live status 已有雏形。

当前定位是 headless-first，能力很强，但官方产品 UI 仍主要停留在 examples。

### Dashboard / Product Shell 层

相关文件：

- `lib/dashboard.ts`
- `lib/dashboard-migration.ts`
- `lib/dashboard-responsive/*`
- `lib/dashboard-editor-shell/*`
- `lib/DashboardResponsiveVueGridLayout.tsx`
- `example/24-dashboard-runtime-lab.js`
- `example/25-dashboard-editor-shell.js`

已有能力：

- `DashboardLayoutDocument`。
- dashboard schema version。
- project/write dashboard runtime。
- dashboard settings migration / collision repair / translate。
- ThingsBoard import/export adapter。
- dashboard responsive profile model。
- dashboard editor shell。
- widget/reference adapters。
- palette hook。
- confirm/guards。
- context menu descriptor builders。
- copy/cut/paste/duplicate/remove widget。
- copy/paste widget reference。
- interactive placement through shell actions。
- adapter transaction：prepare -> editor/dashboard mutation -> commit，失败时 rollback/compensation。
- controlled-first document ownership。

这说明仓库已经具备从“布局组件”升级为“dashboard builder foundation”的条件。

### Persistence / MCP / Docs 层

相关文件：

- `lib/persistence.ts`
- `mcp/*`
- `README.md`
- `typings/index.d.ts`

已有能力：

- versioned layout persistence document。
- localStorage、sessionStorage、IndexedDB、remote HTTP、memory adapters。
- conflict handling / dirty state。
- MCP server：docs、headings、sections、search、props、types、examples。
- README 已覆盖大量高级能力。

MCP 是当前差异化亮点之一，后续可以扩展为 AI-native dashboard assistant。

## 当前需要优化的 1-5

以下 1-5 不是扩展脑暴之外的事情，而是地基优化。它们应优先进入 Foundation 类 spec。

### 1. 包形态和依赖边界

现状信号：

- `package.json` 只有 `main`、`style`、`unpkg`、`typings`。
- 没有 `exports` map。
- 没有 ESM 入口。
- `vue` 在 `dependencies` 中。
- `pinia` 是全包 peer dependency。
- 构建仍偏 CJS/UMD。

优化方向：

- ESM + CJS 双入口。
- `exports` map。
- subpath exports：`/core`、`/layout-engine`、`/editor`、`/dashboard`、`/persistence`、`/mcp` 或类似分层。
- `vue` 应作为 peer dependency。
- `pinia` 应尽量成为可选 peer，或者只绑定 history/editor 子入口。
- 明确 browser/worker bundle 入口。
- 做 bundle size guard。

目标：

- 让核心 grid 用户不被 editor/dashboard/pinia 重能力拖累。
- 让高级用户能按层引入。
- 让库形态看起来像现代组件库，而不是单 bundle demo。

### 2. API 复杂度和分层叙事

现状信号：

- `VueGridLayout` props 已覆盖基础布局、height modes、drop、history、persistence、layoutEngine、editor 等多层能力。
- API 功能很多，但用户进入点不够清楚。
- README 高级章节很长，读起来像能力清单，而不是分层使用路径。

优化方向：

- 保留兼容 props。
- 文档和类型按层组织：
  - Core Grid
  - Responsive Grid
  - Layout Engine
  - Persistence
  - Headless Editor
  - Dashboard Runtime
  - Dashboard Editor Shell
  - MCP / AI tooling
- 高级能力通过 controller/config/adapter 收口，避免继续在根组件上堆 prop。
- 给每层提供最小可运行示例、推荐接入方式和不要混用的边界。

目标：

- 新用户能先用 core grid。
- 专业 dashboard 用户能直接找到 editor/dashboard shell。
- 后续扩展能力不会进一步污染基础 API。

### 3. README 示例和文档可信度

现状信号：

- README 基础示例使用 `reactive`，但 import 中只有 `ref`。
- responsive 示例中定义了 `ResponsiveGridLayout`，但组件注册写的是 `VGL`。
- README 中已有大量高级能力，但基础示例错误会直接损害信任。

优化方向：

- 修复 README 示例。
- 把所有 README 中的代码块纳入 smoke/compile check。
- MCP examples 与 README examples 对齐。
- 增加“选择哪个入口”的 docs section。
- 为已有 examples 标注能力标签：
  - basic
  - responsive
  - persistence
  - editor
  - dashboard runtime
  - dashboard shell
  - placement
  - migration

目标：

- 文档示例必须可复制运行。
- 用户能理解：这个库不只是 grid，但也不强迫你使用 dashboard shell。

### 4. 默认产品层缺失

现状信号：

- `useGridEditor` 和 `useDashboardEditorShell` 是 headless-first。
- README 明确示例 toolbar/menu/palette 不是 API。
- 这给专业用户很大自由度，但会让很多用户感到“能力强但要自己拼”。

优化方向：

- 做官方 `Editor Kit`，作为可选上层包/子入口。
- 提供默认但可替换的 UI primitives：
  - toolbar
  - outline
  - inspector
  - widget palette
  - context menu
  - command palette
  - empty state
  - selection/bulk edit panel
  - diagnostics panel
- 不把这些 UI 塞回核心 grid。
- 不在本轮考虑 i18n。

目标：

- 把现有 headless 能力变成开箱可用的专业编辑器体验。
- 让组件库从“开发者拼内核”升级成“可快速搭建 dashboard builder”。

### 5. TypeScript / 构建 / CI 现代化

现状信号：

- `tsconfig.json` 中 `noImplicitAny: false`。
- `target: es5`、`module: commonjs`。
- 类型声明主要在 `typings/index.d.ts`。
- test runner 已很多，但示例文档和包入口质量缺少统一 gate。

优化方向：

- 现代 library build pipeline。
- 生成 `.d.ts`，减少手写类型漂移。
- strict type gates 分阶段收紧。
- package exports 类型检查。
- 示例编译测试。
- browser smoke / visual regression for editor shell。
- performance budget 进入 CI。

目标：

- 降低未来扩展时类型漂移和发布破坏风险。
- 让高级 API 更敢于稳定承诺。

## 外部调研信号

本轮调研过的顶级项目/产品方向如下。后续写 spec 时可继续深入具体 API。

### GridStack

URL: https://gridstackjs.com/

值得借鉴：

- dashboard-oriented grid API。
- nested grids。
- drag between grids。
- save/load。
- responsive/mobile。
- framework wrappers。

对本项目启发：

- Layout Engine Pro spec 中应考虑 nested grid 和 inter-grid drag。
- Dashboard shell 不应只做单 grid 操作，要预留跨容器/子网格模型。

### React Grid Layout

URL: https://github.com/react-grid-layout/react-grid-layout

值得借鉴：

- 成熟 responsive grid 语义。
- TS/SSR/modern API 方向。
- custom compactors / position strategies。
- constraints / aspect ratio。

对本项目启发：

- Foundation spec 应强化现代包形态和类型。
- Layout Engine Pro spec 应把 custom strategy、aspect ratio、constraints 纳入。

### Muuri

URL: https://github.com/haltu/muuri

值得借鉴：

- layout + sorting/filtering + drag。
- cross-grid drag。
- worker layout。
- animation/positioning 体验。

对本项目启发：

- 本项目已有 worker/executor 基础，可继续把复杂布局计算放到 engine 层。
- 可评估 item sorting/filtering/animated reflow，但不要优先于 dashboard editor 地基。

### Grafana Dashboards

URL: https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/create-dashboard/

值得借鉴：

- dashboard edit mode。
- panel add/duplicate/copy/edit workflows。
- custom layout / auto grid。
- repeat panels。
- JSON model / inspectable dashboard model。
- 侧边栏/大纲/配置面板等产品体验。

对本项目启发：

- Editor Kit spec 应优先覆盖 outline、toolbar、inspector、palette、context menu。
- Layout Engine Pro spec 可考虑 auto grid、repeat/show-hide rules。

### Puck

URL: https://puckeditor.com/docs

值得借鉴：

- component config。
- fields。
- categories。
- permissions。
- viewports。
- external data。

对本项目启发：

- Editor Kit spec 应加入 Widget Registry。
- Widget Registry 应声明默认尺寸、min/max、编辑字段、权限、分类、图标、数据绑定需求。

### Retool / Appsmith

URLs:

- https://retool.com/
- https://www.appsmith.com/widgets

值得借鉴：

- widget catalog。
- inspector/property panel。
- containers / tabs / forms / frames。
- custom widget。
- data binding。
- productized app/dashboard builder workflow。

对本项目启发：

- 只做 grid 不够高级。
- 需要 official product shell primitives 和 widget schema/adapter。

### GrapesJS

URL: https://grapesjs.com/docs/modules/Blocks

值得借鉴：

- block/component definition。
- block manager。
- component model。
- extensible editor surface。

对本项目启发：

- Widget Registry 和 Palette 可以借鉴 block manager 思路。
- 不要把 widget 业务实现写死进 grid。

## 扩展脑暴

扩展脑暴应和基础优化一起设计，但落地分阶段。

### Editor Kit

优先级最高的扩展。

建议能力：

- 官方 toolbar。
- official outline/tree。
- inspector/property panel。
- widget palette。
- context menu renderer。
- command palette。
- empty dashboard add state。
- selection/bulk edit panel。
- diagnostics panel。
- theming hooks。
- no i18n in current scope。

关键原则：

- 作为可选上层。
- 建立在 `useGridEditor` / `useDashboardEditorShell` 之上。
- 不回灌到 core grid。
- 组件 API 应尽量小，重逻辑仍在 controller/shell。

### Widget Registry

建议能力：

- widget type definition。
- default layout size。
- min/max size。
- aspect ratio / preserve ratio。
- resizable/draggable defaults。
- editable fields。
- capabilities / permissions。
- category/icon/search metadata。
- data binding requirements。
- clone/serialize hooks。
- settings panel descriptors。

价值：

- 把 dashboard shell 的 palette/add/copy/paste/reference 从 demo 变成可复用协议。
- 为 AI 生成 dashboard、MCP docs、migration/import/export 提供结构化入口。

### Constraint Engine

建议能力：

- aspect ratio。
- lock width / lock height。
- group resize。
- bounding-box ghosting。
- nested grids。
- inter-grid drag。
- custom compactor。
- custom position strategy。
- layout lint。
- repair preview。

价值：

- 让 layout engine 从“处理当前编辑命令”升级为“专业 dashboard constraint solver”。
- 支持更复杂的企业 dashboard 编辑场景。

### Adaptive Runtime

建议能力：

- custom layout / auto grid dual mode。
- repeat panels/widgets。
- show/hide rules。
- breakpoint diff。
- viewport preview。
- mobile/list profile。
- profile inheritance and override visualization。

价值：

- 让 dashboard runtime 接近 Grafana/ThingsBoard 这类产品级模型。
- 兼容当前 dashboard-responsive profile 方向。

### AI-native Dashboard

建议能力：

- layout lint MCP tool。
- explain blocked drop/resize/move。
- auto tidy / auto arrange。
- generate dashboard from data schema。
- migrate from GridStack / React Grid Layout / Grafana / ThingsBoard-like models。
- ask docs/examples/types through MCP with richer scenarios。
- widget registry introspection for AI IDEs。

价值：

- 这是本项目可与普通 grid libraries 拉开差距的地方。
- 但最好在 Foundation、Editor Kit、Widget Registry 稳定后推进。

## 推荐 Spec 拆分

建议生成 4 个 spec。

不要拆成太多小 spec，否则规划碎片化；也不要把所有内容塞进一个巨型 spec，否则基础优化和产品扩展会互相拖累。

### Spec 1: Foundation Modernization

覆盖：

- 包入口和发布形态。
- ESM/CJS/UMD/worker entry 策略。
- `exports` map。
- subpath exports。
- peer dependencies / optional peer dependencies。
- generated type declarations。
- README 示例修复。
- docs structure。
- API 分层叙事。
- example smoke tests。
- CI gates。
- performance budget integration。

不覆盖：

- Editor Kit 具体 UI。
- nested grids / inter-grid drag。
- AI/MCP 高级助手。
- i18n。

优先级：P0。

为什么先做：

- 这是信任度和可维护性地基。
- 当前高级能力已经很多，如果不先稳定入口和文档，后续扩展越多越难讲清楚。

### Spec 2: Editor Kit and Widget Registry

覆盖：

- official optional editor UI kit。
- toolbar。
- outline。
- inspector。
- widget palette。
- context menu。
- command palette。
- empty dashboard state。
- selection/bulk edit panel。
- diagnostics panel。
- widget registry schema。
- widget template/default layout protocol。
- widget settings descriptors。
- adapter boundaries。
- theming hooks。

不覆盖：

- i18n。
- AI dashboard generation。
- nested/inter-grid engine behavior，除非只作为 registry 能力预留字段。

优先级：P1。

为什么紧跟 Foundation：

- 这是用户最容易感知到“高级好用”的跃迁。
- 现有 headless 能力已经足够强，缺的是官方产品壳和可复用协议。

### Spec 3: Layout Engine Pro

覆盖：

- nested grids。
- inter-grid drag。
- aspect ratio / preserveAspectRatio。
- group resize。
- bounding-box group ghost。
- custom compactors。
- custom placement strategies。
- auto grid。
- repeat/show-hide rules if they require layout engine semantics。
- layout lint / repair preview。
- stronger constraint diagnostics。

不覆盖：

- package exports 基础现代化。
- official editor UI primitives。
- AI/MCP tools。
- i18n。

优先级：P2。

为什么后做：

- 这类会改核心布局语义和 collision/resize/drag 行为。
- 应在 API 分层和 Editor Kit 边界清楚后再推进，避免破坏已有 dashboard/editor shell。

### Spec 4: AI/MCP Dashboard Assistant

覆盖：

- MCP docs/examples/types 扩展。
- layout lint tool。
- explain blocked layout operation。
- auto tidy/arrange tool。
- generate dashboard from data schema。
- migrate dashboard/layout from external models。
- widget registry introspection。
- scenario-aware example retrieval。

不覆盖：

- 基础 package modernization。
- editor UI implementation。
- layout engine semantic changes，除非作为调用已有 engine 能力的 tool。
- i18n。

优先级：P3。

为什么最后：

- AI/MCP 是差异化大招，但依赖更稳定的 package/API/widget registry/layout diagnostics。
- 太早做会把不稳定接口暴露给 AI 工具，后续维护成本高。

## 分阶段落地建议

设计上可以把 4 个 spec 一起看，确保方向一致；落地上必须分阶段。

推荐节奏：

1. Phase 0: Foundation trust fixes
   - 修 README 示例。
   - 明确 package exports。
   - 梳理 peer deps。
   - 生成 types。
   - 增加 example smoke/compile check。

2. Phase 1: API layering
   - Core / engine / editor / dashboard / persistence / MCP 分层。
   - README 和 MCP docs 对齐。
   - 给每层明确 recommended entry。

3. Phase 2: Editor Kit + Widget Registry
   - 最小官方 UI kit。
   - registry 协议。
   - palette/add/inspector/context menu 形成真实可复用能力。

4. Phase 3: Layout Engine Pro
   - nested / inter-grid / aspect ratio / group resize / custom strategy。
   - engine diagnostics 和 repair preview。

5. Phase 4: AI/MCP Assistant
   - 基于稳定 registry、docs、diagnostics 做 AI-native 能力。

简短结论：

- 基础优化和扩展脑暴应该一起规划。
- 代码落地必须先 Foundation，再 Editor Kit，再 Layout Engine Pro，再 AI/MCP。
- 最推荐先生成 Foundation 和 Editor Kit 两个 spec。

## 重要边界和决策记录

- 不考虑 i18n。
- 不使用 computer use。
- 不建议把 dashboard 语义字段直接塞进基础 `LayoutItem`。
- 不建议继续往 `VueGridLayout` 根组件无限加 props。
- 不建议把官方 UI kit 和核心 grid 打包成强耦合。
- 不建议先做 AI/MCP 高级能力，再回头整理 registry/diagnostics。
- 不建议用一个 spec 覆盖全部内容。
- Foundation spec 可以包含文档示例修复，因为这属于可信度地基。
- Editor Kit spec 可以包含 Widget Registry，因为 palette/inspector/context menu 没有 registry 会很快退化成 demo。
- Layout Engine Pro 必须独立，因为它会动核心行为。
- AI/MCP Assistant 必须依赖稳定的 registry、docs、diagnostics。

## 后续生成 Spec 时的建议顺序

首批建议生成：

1. `foundation-modernization`
2. `editor-kit-widget-registry`

Roadmap 级可随后生成：

3. `layout-engine-pro`
4. `ai-mcp-dashboard-assistant`

每个 spec 都应包含：

- requirements
- design
- tasks
- compatibility section
- migration notes
- test strategy
- docs/examples impact
- public API stability notes

Foundation spec 尤其需要覆盖 package compatibility。

Editor Kit spec 尤其需要覆盖 headless API 和 official UI kit 的边界。

Layout Engine Pro spec 尤其需要覆盖 collision/constraint semantics。

AI/MCP spec 尤其需要覆盖工具输入输出 schema 和避免 hallucinated examples 的策略。
