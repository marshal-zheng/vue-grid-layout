# Height Modes & Render Precision 需求规格

## 简介

当前组件库的基础 grid 高度模型主要由 `autoSize` 和 `rowHeight` 组成，容器高度只按内容行数自动撑开或交给外部 CSS 处理；像素渲染路径则在 `calcGridItemWHPx()`、`calcGridItemPosition()` 中对 `width`、`height`、`top` 和 `left` 做整数取整。前两个 dashboard specs 已经引入 `DashboardLayoutDocument`、responsive profile、mobile/list runtime 和 dashboard grid settings，但它们明确把完整 height modes、pixel precision 策略和 dashboard 高度字段映射留给后续能力。

本规格定义第三个独立完整 spec：在基础 `VueGridLayout` 层引入通用高度模式和渲染精度契约，并让 dashboard profile 只负责把 `DashboardGridSettings` 投影到这些基础能力。它一次性覆盖 `auto`、`scroll`、`fit`、`fixed` 四种高度模式、可选父容器高度测量、`renderPrecision: 'integer' | 'subpixel'`、placeholder/drop preview/overlay/guides 对齐、dashboard profile 映射、diagnostics、公共导出和测试。它不分版本交付，不把 dashboard 字段塞进 `LayoutItem`，也不实现 aspect ratio、collision repair、layout settings migration、dashboard editor shell、业务 widget UI 或自动缩放整块 dashboard。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/CORE-runtime-foundation/README.md
SPEC_BRIEF: docs/initiatives/CORE-runtime-foundation/briefs/CORE-height-modes-render-precision.md

COVERAGE: height-render-runtime

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| height-render-runtime | R1-R12 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 基础高度与精度 API 边界
**用户故事:** 作为现有 `VueGridLayout` 用户，我希望新增高度模式和渲染精度能力时保持旧 API 兼容，以便可以渐进采用 dashboard 级高度体验而不破坏已有布局。
**验收标准 (EARS):**
- R1.AC1: WHEN 基础 grid 接收 props 时，系统 SHALL 支持 `heightMode?: 'auto' | 'scroll' | 'fit' | 'fixed'`、`containerHeight?: number`、`autoMeasureContainerHeight?: boolean`、`minRowHeight?: number` 和 `renderPrecision?: 'integer' | 'subpixel'`。
- R1.AC2: WHEN `heightMode` 被显式传入时，系统 SHALL 以 `heightMode` 作为长期主入口，并 SHALL NOT 让旧 `autoSize` 覆盖显式 `heightMode`。
- R1.AC3: WHEN `heightMode` 未传入时，系统 SHALL 保持旧行为兼容：`autoSize: true` 映射为 `heightMode: 'auto'`，`autoSize: false` 映射为不会自动撑高内容的固定外部容器语义。
- R1.AC4: WHEN 用户未显式传入 `renderPrecision` 时，系统 SHALL 默认使用 `renderPrecision: 'integer'`，并保持当前整数像素渲染兼容性。
- R1.AC5: WHEN 新增高度和精度能力时，系统 SHALL NOT 给 `LayoutItem` 增加 `heightMode`、`containerHeight`、`renderPrecision`、`mobileHeightMode` 或任何 dashboard-only 字段。
- R1.AC6: WHEN drag、resize、collision、compact、history 或 persistence 处理 layout 时，系统 SHALL 继续把 `LayoutItem.x/y/w/h` 作为整数 grid units 处理，不因 `renderPrecision: 'subpixel'` 引入小数 grid 坐标提交。
- R1.AC7: WHEN 不使用新 props 时，现有 `VueGridLayout`、`ResponsiveVueGridLayout`、persistence、editor、layout-engine 和示例 SHALL 保持行为与公共 API 兼容。

### R2: Headless Height Runtime Resolver
**用户故事:** 作为组件库维护者，我希望高度模式解析是可测试的 headless runtime 能力，以便基础组件、dashboard resolver、薄组件和自定义 UI 可以复用同一套规则。
**验收标准 (EARS):**
- R2.AC1: WHEN 实现高度模式能力时，系统 SHALL 提供框架无关的 `resolveGridHeightRuntime()` 或等价 headless resolver，而不是把完整规则隐藏在 `VueGridLayout.tsx` 渲染函数中。
- R2.AC2: WHEN resolver 接收相同的 layout、height options、spacing、container size 和 measurement 输入时，系统 SHALL 返回确定性结果，包括 requested height mode、effective height mode、resolved rowHeight、resolved container height、content height、overflow style、height source、rowHeight source、render precision 和 diagnostics。
- R2.AC3: WHEN resolver 计算总行数时，系统 SHALL 基于调用方传入的当前 active runtime layout 计算，不直接读取 dashboard document/default widgets 或隐藏 item。
- R2.AC4: WHEN active runtime layout 来自 list 模式时，系统 SHALL 使用 list projection 之后的累计 `y/h` 计算总行数，使实际渲染集合与高度计算一致。
- R2.AC5: WHEN resolver 输入包含非法 height mode、非法 container height、非法 `rowHeight` 或非法 `minRowHeight` 时，系统 SHALL 使用可诊断 fallback，而不是抛出未捕获异常。
- R2.AC6: WHEN resolver 返回 diagnostics 时，系统 SHALL 使用稳定 code、level、message 和上下文字段，供单元测试、Vue component 和 dashboard responsive runtime 复用。

### R3: Height Mode 语义
**用户故事:** 作为 dashboard 渲染开发者，我希望四种高度模式有清晰、可测试且互不重叠的语义，以便不同页面、编辑器和大屏场景可以选择合适的容器行为。
**验收标准 (EARS):**
- R3.AC1: WHEN `heightMode: 'auto'` 生效时，系统 SHALL 使用 resolved rowHeight 和 active runtime layout 的 bottom row 计算内容高度，并让容器高度随内容自然撑开。
- R3.AC2: WHEN `heightMode: 'fixed'` 生效且存在可用 container height 时，系统 SHALL 使用显式或解析后的 rowHeight，不反推 rowHeight，并 SHALL 设置固定容器高度与 `overflow: hidden`。
- R3.AC3: WHEN `heightMode: 'scroll'` 生效且存在可用 container height 时，系统 SHALL 使用显式或解析后的 rowHeight，不反推 rowHeight，并 SHALL 设置固定容器高度与 `overflow: auto`。
- R3.AC4: WHEN `heightMode: 'fit'` 生效且存在可用 container height 及非空 active runtime layout 时，系统 SHALL 根据可用高度、垂直 padding、垂直 margin 和 active bottom row 反推 resolved rowHeight。
- R3.AC5: WHEN `fit` 反推 rowHeight 时，系统 SHALL 允许 resolved rowHeight 为小数；最终 CSS 是否保留小数 SHALL 由 `renderPrecision` 决定。
- R3.AC6: IF `fit` 缺少可用 container height，系统 SHALL fallback 到 `auto` 并输出 diagnostic，不得阻止渲染或假装 fit 已生效。
- R3.AC7: IF `fixed` 或 `scroll` 缺少可用 container height，系统 SHALL fallback 到 `auto` 并输出 diagnostic，避免生成语义不完整的 fixed/scroll 容器。
- R3.AC8: IF `fit` 反推出的 rowHeight 低于 `minRowHeight`，系统 SHALL fallback 到 `scroll` 并输出 diagnostic，避免把 dashboard 内容压缩到不可用。
- R3.AC9: WHEN `fit` 模式下 active runtime layout 为空时，系统 SHALL 让容器仍占用可用 container height，并使用 fallback/default rowHeight，同时输出 `empty-fit-layout` 或等价 diagnostic。
- R3.AC10: WHEN `auto` 模式下 active runtime layout 为空时，系统 SHALL 保持与当前空 layout autoSize 行为兼容，容器高度由 padding 或现有空态规则决定。

### R4: Container Height 来源与自动测量
**用户故事:** 作为 Vue 集成开发者，我希望高度模式既能接受外部受控高度，也能在需要时自动测量，以便在 dashboard shell 和普通页面中都能稳定工作。
**验收标准 (EARS):**
- R4.AC1: WHEN 同时存在 `containerHeight` 和自动测量值时，系统 SHALL 始终优先使用显式 `containerHeight`。
- R4.AC2: WHEN 未传入 `containerHeight` 且 `autoMeasureContainerHeight: true` 时，系统 SHALL 使用 ResizeObserver 或等价机制测量 grid 根节点父容器的 content box 高度。
- R4.AC3: WHEN 未传入 `containerHeight` 且 `autoMeasureContainerHeight` 未显式开启时，系统 SHALL NOT 自动挂载高度测量 observer。
- R4.AC4: WHEN 父容器高度变化且自动测量已开启时，系统 SHALL 重新解析 height runtime，并更新 item、placeholder、drop preview 和 overlay/guides 使用的 resolved rowHeight。
- R4.AC5: IF 父容器不存在、隐藏、测量值为 0、测量值非法或运行在无法测量的环境中，系统 SHALL 通过 diagnostics 标记测量不可用，并按当前 height mode fallback 规则继续渲染。
- R4.AC6: WHEN 组件卸载或 measurement target 改变时，系统 SHALL 清理 ResizeObserver、定时器和订阅资源，避免泄漏。
- R4.AC7: WHEN 实现自动测量时，系统 SHALL 避免用 grid 根节点自身高度作为默认测量目标，防止 `fit` 的容器高度与自身计算结果形成反馈循环。

### R5: Render Precision 策略
**用户故事:** 作为追求高质量 dashboard 观感的用户，我希望可以选择 subpixel 渲染来减少视觉抖动和累计误差，同时保持布局数据模型稳定。
**验收标准 (EARS):**
- R5.AC1: WHEN `renderPrecision: 'integer'` 生效时，系统 SHALL 对最终渲染的 `left`、`top`、`width` 和 `height` 保持当前整数像素输出语义。
- R5.AC2: WHEN `renderPrecision: 'subpixel'` 生效时，系统 SHALL 允许最终 CSS 渲染的 `left`、`top`、`width` 和 `height` 保留小数像素。
- R5.AC3: WHEN `renderPrecision: 'subpixel'` 生效时，系统 SHALL NOT 改变 `calcXY()`、`calcWH()`、drag/resize commit、collision、compact、layout engine operation 或 persistence 中的整数 grid unit 语义。
- R5.AC4: WHEN `useCSSTransforms` 为 true 或 false 时，系统 SHALL 在 transform positioning 和 top/left positioning 两条路径上都遵守同一 `renderPrecision` 策略。
- R5.AC5: WHEN `fit` 生成小数 rowHeight 但 `renderPrecision: 'integer'` 生效时，系统 SHALL 允许内部 resolved rowHeight 保持小数，同时只在最终 CSS 输出阶段取整。
- R5.AC6: WHEN 未显式配置 `renderPrecision: 'subpixel'` 时，系统 SHALL NOT 因 `fit`、CSS transform、dashboard profile 或浏览器环境自动启用 subpixel。
- R5.AC7: IF `renderPrecision` 输入非法，系统 SHALL fallback 到 `integer` 并输出 diagnostic。

### R6: Grid Item、Placeholder 与 Overlay 一致性
**用户故事:** 作为专业 dashboard 编辑器用户，我希望真实 item、交互预览和编辑辅助层完全对齐，以便高度模式和 subpixel 精度不会造成编辑体验割裂。
**验收标准 (EARS):**
- R6.AC1: WHEN 基础 grid 渲染 item 时，系统 SHALL 使用同一 resolved rowHeight 和 render precision 计算 item 的 position style。
- R6.AC2: WHEN drag placeholder 渲染时，系统 SHALL 使用与对应 active item 相同的 resolved rowHeight、container height context 和 render precision。
- R6.AC3: WHEN external drop preview 或 dropping item 渲染时，系统 SHALL 使用同一 resolved rowHeight 和 render precision，确保 preview 与 commit 后 item 对齐。
- R6.AC4: WHEN editor overlay、grid guides、snap guides、selection boxes 或 intelligence geometry 需要像素坐标时，系统 SHALL 使用同一 resolved rowHeight 和 render precision，而不是继续读取原始 `props.rowHeight`。
- R6.AC5: WHEN `heightMode`、container height、measured height、target view、view format 或 profile 改变时，系统 SHALL 同步更新 item、placeholder、drop preview、overlay/guides 的几何输入。
- R6.AC6: WHEN `renderPrecision: 'subpixel'` 生效时，系统 SHALL 通过浏览器或组件测试验证 item 与 placeholder/overlay 的可见偏差在可接受阈值内。

### R7: Dashboard Grid Settings 映射
**用户故事:** 作为 dashboard profile 使用者，我希望高度模式和渲染精度可以被 dashboard document 持久化并按 profile 覆盖，以便不同断点和 mobile/desktop 视图拥有独立展示策略。
**验收标准 (EARS):**
- R7.AC1: WHEN 扩展 dashboard schema 时，系统 SHALL 在 `DashboardGridSettings` 支持 `heightMode?: 'auto' | 'scroll' | 'fit' | 'fixed'`、`mobileHeightMode?: 'auto' | 'scroll' | 'fit' | 'fixed'`、`minRowHeight?: number` 和 `renderPrecision?: 'integer' | 'subpixel'`。
- R7.AC2: WHEN dashboard profile settings 合并时，系统 SHALL 允许 profile 覆盖 default layout 的 `heightMode`、`mobileHeightMode`、`minRowHeight`、`rowHeight`、`mobileRowHeight`、`autoFillHeight`、`mobileAutoFillHeight` 和 `renderPrecision`。
- R7.AC3: WHEN `targetView: 'mobile'` 且 `mobileHeightMode` 存在时，系统 SHALL 优先使用 `mobileHeightMode` 作为 resolved dashboard height mode。
- R7.AC4: WHEN `heightMode` 或 `mobileHeightMode` 缺失且 `autoFillHeight` 或 `mobileAutoFillHeight` 为 true 时，系统 SHALL 将旧字段作为兼容别名映射为 `heightMode: 'fit'`。
- R7.AC5: WHEN 显式 mode 字段与旧 `autoFillHeight` 或 `mobileAutoFillHeight` 语义冲突时，系统 SHALL 以显式 mode 字段优先，并输出 diagnostic。
- R7.AC6: WHEN `targetView: 'mobile'` 且 `mobileRowHeight` 有效时，系统 SHALL 在非 fit 或 fallback 后需要固定 rowHeight 的路径中优先使用 `mobileRowHeight`。
- R7.AC7: WHEN `DashboardResponsiveVueGridLayout` 同时接收显式组件 props 和 dashboard profile settings 时，系统 SHALL 以显式组件 props 优先，profile settings 只作为默认来源。
- R7.AC8: WHEN dashboard settings 投影到 runtime 时，系统 SHALL NOT 把 `heightMode`、`mobileHeightMode`、`minRowHeight`、`renderPrecision`、`autoFillHeight` 或 `mobileAutoFillHeight` 写入 `LayoutItem`。

### R8: Dashboard Responsive Runtime 集成
**用户故事:** 作为 dashboard 编辑器集成者，我希望 responsive runtime 暴露 resolved height/precision 状态和 diagnostics，以便外层 UI 能解释当前高度模式、fallback 和视觉精度来源。
**验收标准 (EARS):**
- R8.AC1: WHEN `resolveDashboardResponsiveProfile()` 或等价 responsive resolver 生成 runtime 时，系统 SHALL 在 runtime 中暴露 resolved height/precision state，至少包含 requested/effective height mode、resolved rowHeight、container height、height source、rowHeight source、render precision 和 diagnostics。
- R8.AC2: WHEN breakpoint、profile、target view、view format、active item ids、container height 或 measured height 变化时，系统 SHALL 重新解析 height runtime，并把结果应用到内层 `VueGridLayout`。
- R8.AC3: WHEN responsive runtime 从缺失 profile fallback 到 default 时，系统 SHALL 对高度模式和 render precision 使用 fallback 后的 resolved settings，并保留 profile fallback diagnostics。
- R8.AC4: WHEN `DashboardResponsiveVueGridLayout` 把 runtime 传给内层 `VueGridLayout` 时，系统 SHALL 传入 resolved `heightMode`、`containerHeight`、`rowHeight`、`minRowHeight`、`renderPrecision` 和 measurement 相关 props。
- R8.AC5: WHEN runtime diagnostics 变化时，系统 SHALL 复用 dashboard responsive 现有 diagnostics/projection event 模型暴露信息，不新增一组与高度模式强绑定的专用事件面。
- R8.AC6: WHEN height runtime 解析失败或 fallback 时，系统 SHALL 保留上一层 responsive projection 的可用 layout，不得因高度解析问题删除 active item 或覆盖 dashboard document。

### R9: Diagnostics 与可观测性
**用户故事:** 作为维护者和集成者，我希望高度与精度行为可诊断，以便定位容器高度、profile 字段、fallback 和 subpixel 渲染问题。
**验收标准 (EARS):**
- R9.AC1: WHEN height runtime fallback 发生时，系统 SHALL 返回结构化 diagnostics，至少覆盖缺失 container height、measurement unavailable、fit min row height fallback、fixed/scroll fallback、empty fit layout、invalid height option、invalid render precision、mode alias conflict 和 unsupported dashboard field。
- R9.AC2: WHEN diagnostics 指向 dashboard profile 或 item 时，系统 SHALL 包含 layoutId、profileId、targetView、path 或 itemId 等可定位上下文。
- R9.AC3: WHEN diagnostics 指向基础 grid props 时，系统 SHALL 包含 prop name、received value、fallback value 和 fallback reason。
- R9.AC4: WHEN 多次对相同输入解析 height runtime 时，系统 SHALL 输出稳定排序和稳定内容的 diagnostics，方便快照测试。
- R9.AC5: WHEN diagnostics 被组件事件或 runtime state 暴露时，系统 SHALL 不包含 DOM 节点、Vue VNode、事件对象、函数或循环引用。

### R10: 公共导出、类型声明与迁移文档
**用户故事:** 作为库消费者，我希望新高度与精度能力有完整类型和迁移说明，以便在 TypeScript、ESM、CJS 和文档示例中可靠使用。
**验收标准 (EARS):**
- R10.AC1: WHEN 提供公共 API 时，系统 SHALL 导出 height mode、render precision、height resolver options/result、diagnostic code、dashboard mapping helper 和相关 runtime state 类型。
- R10.AC2: WHEN 更新 ESM、CommonJS 和 `typings/index.d.ts` 导出时，系统 SHALL 不破坏现有 `VueGridLayout`、`ResponsiveVueGridLayout`、`DashboardResponsiveVueGridLayout`、dashboard document、persistence、editor 和 layout-engine 导出。
- R10.AC3: WHEN 更新 README 或示例时，系统 SHALL 展示基础 `VueGridLayout` 使用 `heightMode`、`containerHeight`、`autoMeasureContainerHeight` 和 `renderPrecision` 的用法。
- R10.AC4: WHEN 更新 dashboard 示例或文档时，系统 SHALL 展示 `DashboardGridSettings.heightMode/mobileHeightMode/renderPrecision` 如何通过 profile 投影到基础 grid runtime。
- R10.AC5: WHEN 说明旧 API 迁移时，系统 SHALL 文档化 `autoSize` 到 `heightMode` 的兼容映射，以及 `autoFillHeight/mobileAutoFillHeight` 到 `heightMode/mobileHeightMode` 的兼容别名规则。
- R10.AC6: WHEN 文档描述 `subpixel` 时，系统 SHALL 明确它只影响最终 CSS 像素输出，不改变 committed layout、collision、compact、history 或 persistence 的整数 grid units。

### R11: 测试与回归验证
**用户故事:** 作为维护者，我希望高度模式和渲染精度有覆盖核心算法、Vue 组件、dashboard 集成和浏览器视觉的测试，以便避免微妙的布局回归。
**验收标准 (EARS):**
- R11.AC1: WHEN 编写单元测试时，系统 SHALL 覆盖 `auto`、`fixed`、`scroll`、`fit`、空 layout、缺失 container height、invalid input、`minRowHeight` fallback、decimal rowHeight 和 deterministic diagnostics。
- R11.AC2: WHEN 编写 precision 测试时，系统 SHALL 覆盖 `integer` 与 `subpixel` 对 `left/top/width/height` 的输出差异，并验证 committed `LayoutItem.x/y/w/h` 仍为整数。
- R11.AC3: WHEN 编写基础组件测试时，系统 SHALL 覆盖 `heightMode` 与 `autoSize` 兼容、显式 `containerHeight` 优先、自动测量父容器、observer cleanup、fixed overflow hidden、scroll overflow auto 和 fit rowHeight recomputation。
- R11.AC4: WHEN 编写 dashboard responsive 测试时，系统 SHALL 覆盖 profile 覆盖、mobileHeightMode、mobileRowHeight、autoFillHeight 兼容别名、显式组件 props 优先、list/grid active runtime layout 行数和 diagnostics。
- R11.AC5: WHEN 编写 editor/browser 测试时，系统 SHALL 覆盖 item、placeholder、drop preview、overlay/guides 在 resolved rowHeight 和 renderPrecision 下对齐，且在 desktop/mobile viewport 下不出现明显错位。
- R11.AC6: WHEN 运行回归测试时，系统 SHALL 覆盖现有 grid、responsive、dashboard document、dashboard responsive、editor、persistence 和 layout-engine 测试，确认默认 `integer` 和未传新 props 时行为不变。
- R11.AC7: WHEN 编写类型导出测试时，系统 SHALL 确认新增 height/precision props、resolver types、dashboard settings fields 和 runtime state 可由库消费者导入。

### R12: 非目标与边界保护
**用户故事:** 作为项目维护者，我希望第三个 spec 的边界清晰，以便完成高度与精度能力时不顺手扩张到其它 dashboard 产品层需求。
**验收标准 (EARS):**
- R12.AC1: WHEN 完成本规格时，系统 SHALL NOT 实现 item `preserveAspectRatio`、aspectRatio resize、resize handle policy 或 capability 优先级重构。
- R12.AC2: WHEN 完成本规格时，系统 SHALL NOT 实现 columns ratio migration、collision repair、first-fit placement、move all widgets 或 layout settings migration。
- R12.AC3: WHEN 完成本规格时，系统 SHALL NOT 实现 dashboard context menu、copy/paste reference、widget palette、empty dashboard add affordance、toolbar 或业务 widget shell。
- R12.AC4: WHEN 完成本规格时，系统 SHALL NOT 引入自动缩放整个 dashboard 的方案来替代 `fit` 的 rowHeight 推导。
- R12.AC5: WHEN 完成本规格时，系统 SHALL NOT 让 height mode 或 render precision 改变 dashboard document 中非布局业务字段、editor runtime state、history save semantics 或 persistence schema 职责边界。
- R12.AC6: WHEN 后续 specs 需要 aspect ratio、collision repair 或 dashboard editor shell 时，系统 SHALL 能引用本规格的 resolved height/precision runtime，而不是重新定义高度模式或像素精度策略。

## Clarifications

### Session 2026-05-19

- Q: 第三个 spec 是否分 V1/V2 交付？ -> A: 不分版本；第三个 spec 是独立完整 spec，一次性覆盖 height modes 与 render precision。
- Q: 第三个 spec 的主线是什么？ -> A: 采用核心 grid 高度模式 + 渲染精度，dashboard profile 只做映射。
- Q: `fit` 模式的可用高度从哪里来？ -> A: 同时支持受控 `containerHeight` 和自动测量，`containerHeight` 优先。
- Q: `heightMode` 与旧 `autoSize` 如何兼容？ -> A: 新增 `heightMode`；显式 mode 优先，未传时按 `autoSize` 兼容映射。
- Q: `fixed` 和 `scroll` 如何区分？ -> A: 两者都使用固定 rowHeight；`fixed` 固定高度并隐藏溢出，`scroll` 固定/受控高度并允许滚动。
- Q: `fit` 按哪些 item 计算总行数？ -> A: 按当前实际渲染的 active runtime layout 计算，包括 profile/list/visibility 解析后的结果。
- Q: `fit` 计算出的 rowHeight 是否允许小数？ -> A: 允许小数；最终 CSS 是否保留小数由 `renderPrecision` 决定。
- Q: `renderPrecision` 影响哪些值？ -> A: 影响最终 CSS 的 `left/top/width/height`，但 committed grid units 仍保持整数。
- Q: dashboard 组件显式高度 props 与 profile settings 谁优先？ -> A: 显式组件 props 优先，profile settings 作为默认来源。
- Q: `fit` 缺少可用高度时如何降级？ -> A: fallback 到 `auto` 并输出 diagnostic。
- Q: editor overlay/guides/placeholder 是否纳入硬性验收？ -> A: 纳入；item、placeholder、drop preview、overlay/guides 必须共享 resolved rowHeight 和 precision。
- Q: `fit` 内容超过可用高度时如何处理？ -> A: 引入 `minRowHeight`；低于阈值时 fallback 到 `scroll` 并诊断。
- Q: 自动测量高度默认测量哪个元素？ -> A: 默认测量 grid 根节点父容器的 content box。
- Q: `heightMode` 是否进入 dashboard document schema？ -> A: 进入 `DashboardGridSettings`/profile settings，不进入 `LayoutItem`。
- Q: 新 `heightMode/mobileHeightMode` 与旧 `autoFillHeight/mobileAutoFillHeight` 如何处理？ -> A: 显式 mode 优先；旧字段只在 mode 缺失时作为兼容别名映射。
- Q: `renderPrecision` 是否进入 dashboard settings？ -> A: 进入 `DashboardGridSettings.renderPrecision`，可被 profile 覆盖，默认仍为 `integer`。
- Q: `renderPrecision: 'subpixel'` 默认在哪里启用？ -> A: 永远不自动启用，必须由组件 prop 或 dashboard profile 显式配置。
- Q: 是否提供 headless resolver？ -> A: 提供；组件和 dashboard resolver 复用它。
- Q: `fixed`/`scroll` 缺少 `containerHeight` 时如何处理？ -> A: fallback 到 `auto` 并输出 diagnostic。
- Q: `fit` 空 dashboard 时容器高度如何处理？ -> A: 仍占用可用容器高度，rowHeight 使用 fallback/default，并输出 `empty-fit-layout` diagnostic。
- Q: 自动测量高度是否默认开启？ -> A: 默认关闭；只有显式 `autoMeasureContainerHeight: true` 才测量父容器 content box。
- Q: height runtime 是否进入 dashboard responsive events/diagnostics？ -> A: runtime 暴露 resolved height/precision state 和 diagnostics，复用 dashboard responsive diagnostics/event 模型。
