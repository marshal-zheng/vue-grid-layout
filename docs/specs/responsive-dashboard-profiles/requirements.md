# Responsive Dashboard Profiles 需求规格

## 简介

当前组件库已经拥有通用的 `ResponsiveVueGridLayout`，可以根据 `width`、`breakpoints`、`cols` 和 `layouts` 自动切换或生成响应式布局；同时，第一个 dashboard spec 已经引入 `DashboardLayoutDocument`、`DashboardBreakpointProfile`、dashboard grid settings、item visibility/mobile order/mobile height 等产品语义，但它故意不实现 viewport 自动匹配、Vue composable 状态机、组件 prop 集成或 mobile/list 渲染策略。

本规格定义第二层能力：在不改变现有 `ResponsiveVueGridLayout` 语义的前提下，新增 dashboard responsive profile 层。该层采用长期收益最大的 B 方案：提供 headless resolver、Vue composable 状态模型，以及一个可选的 `DashboardResponsiveVueGridLayout` 薄组件。它负责根据 viewport/breakpoint 解析 dashboard profile、执行 default fallback、合并 profile settings、投影 grid/list runtime、处理 profile-scoped write-back，并暴露结构化 diagnostics 和事件。它不实现完整高度模式、像素精度策略、aspect ratio resize、collision repair、context menu、widget palette 或业务 widget UI。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-responsive-dashboard-profiles.md

COVERAGE: responsive-profiles

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| responsive-profiles | R1-R9 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: Dashboard Responsive Profile 层边界
**用户故事:** 作为组件库维护者，我希望 dashboard responsive profile 是独立产品层，以便在长期支持 dashboard breakpoint/mobile/list 语义时不污染通用 responsive grid API。
**验收标准 (EARS):**
- R1.AC1: WHEN 实现 responsive dashboard profile 能力时，系统 SHALL 新增独立的 headless resolver、Vue composable 和可选薄组件，而不是把 dashboard document/profile 语义直接塞进现有 `ResponsiveVueGridLayout`。
- R1.AC2: WHEN 用户继续使用现有 `ResponsiveVueGridLayout`、`layouts`、`cols`、`margin`、`containerPadding`、`persistence` 或 `editor` API 时，系统 SHALL 保持当前自动 responsive layout generation 和事件语义兼容。
- R1.AC3: WHEN dashboard responsive profile 层读取 dashboard 数据时，系统 SHALL 以 `DashboardLayoutDocument`、`DashboardLayoutDefinition.profiles`、`DashboardGridSettings` 和 `DashboardItemLayout` 为输入契约，不创建第二套 dashboard schema。
- R1.AC4: WHEN dashboard profile 字段无法由当前 runtime 表达时，系统 SHALL 保留原字段并通过 diagnostics 标记为 deferred 或 unsupported，不得静默丢弃。
- R1.AC5: WHEN 完成本规格第一版时，系统 SHALL NOT 实现完整 height mode fit/fixed 计算、pixel precision 策略、aspect ratio resize、layout-engine collision repair、dashboard context menu、widget palette、copy/paste shell 或业务 widget 数据源。

### R2: Breakpoint 与 Profile 解析
**用户故事:** 作为 dashboard 集成开发者，我希望系统能从 viewport width 或显式 breakpoint 解析 dashboard profile，以便复用 ThingsBoard 式“命中 profile 用 profile，缺失则 fallback default”的体验。
**验收标准 (EARS):**
- R2.AC1: WHEN 调用 `resolveDashboardResponsiveProfile()` 时，系统 SHALL 根据 `width`、`breakpoints` 和可选显式 `breakpoint` 计算 `requestedBreakpoint`。
- R2.AC2: WHEN `requestedBreakpoint` 在当前 dashboard layout 的 `profiles` 中存在时，系统 SHALL 将该 profile 作为 `resolvedProfileId`，并标记 `fallbackApplied: false`。
- R2.AC3: WHEN `requestedBreakpoint` 不存在、缺少 profile 或 profile 不合法时，系统 SHALL fallback 到 primary/default dashboard layout，返回 `resolvedProfileId: null` 或等价 default 标识，并输出 `profile-fallback` diagnostic。
- R2.AC4: WHEN breakpoint 改变但 resolved profile 仍然等于当前 profile 时，系统 SHALL 能区分 `breakpointChange` 与 `profileChange`，避免无意义的 profile reload 或 write-back。
- R2.AC5: WHEN 调用方传入未知 breakpoint、空 breakpoints map 或无法计算 breakpoint 的 width 时，系统 SHALL 返回可诊断错误或 fallback 结果，而不是抛出未捕获异常。
- R2.AC6: WHEN profile 解析产生结果时，系统 SHALL 输出 `requestedBreakpoint`、`resolvedProfileId`、`targetView`、`fallbackApplied`、resolved grid settings 和 diagnostics，供 composable 与组件复用。
- R2.AC7: WHEN 调用方显式传入 `targetView` 时，系统 SHALL 优先使用该值；WHEN 未显式传入 `targetView` 时，系统 SHALL 根据可配置 mobile breakpoint/width 规则推导 `desktop` 或 `mobile`，并在 diagnostics 或 result metadata 中标记 target view 来源。

### R3: Profile Settings 合并与 Runtime 投影
**用户故事:** 作为 dashboard 渲染开发者，我希望 profile 的 grid settings 能覆盖 default settings 并投影为 grid runtime，以便不同 breakpoint 拥有独立 columns、spacing、rowHeight 和 view format。
**验收标准 (EARS):**
- R3.AC1: WHEN 解析 profile runtime 时，系统 SHALL 先读取 primary/default layout 的 widgets 和 grid settings，再用命中的 profile widgets override 和 profile grid settings 做确定性合并。
- R3.AC2: WHEN profile grid settings 包含 `columns`、`minColumns`、`margin`、`outerMargin`、`containerPadding`、`rowHeight`、`mobileRowHeight` 或 `viewFormat` 时，系统 SHALL 输出 resolved settings，并将可映射字段传递给 grid runtime。
- R3.AC3: WHEN resolved settings 缺少 `columns`、`margin`、`containerPadding` 或 `rowHeight` 时，系统 SHALL 使用明确默认值并输出 diagnostics 中的 default source 信息。
- R3.AC4: WHEN 投影 grid runtime layout 时，系统 SHALL 复用或扩展第一个 spec 的 `projectDashboardLayoutDocument()` 契约，并保持 `LayoutItem` 只承载 `x/y/w/h/i/min/max/static/isDraggable/isResizable/resizeHandles/isBounded` 等现有字段。
- R3.AC5: WHEN profile override 只包含部分 item 字段时，系统 SHALL 保留 default item 的未覆盖几何、能力和扩展字段。
- R3.AC6: WHEN 多次对同一 document、breakpoint、target view 调用解析能力时，系统 SHALL 输出稳定排序、稳定 layout item id 和稳定 diagnostics 顺序。
- R3.AC7: IF profile override 引用 default widgets 中不存在的 item id，系统 SHALL 保留该 override 并报告 `unknown-profile-item` warning；只有显式配置允许时才把它投影成 runtime item。

### R4: Mobile/List 运行时语义
**用户故事:** 作为 dashboard 用户，我希望移动端可以表达隐藏、排序、高度和 list/grid 双模式，以便 dashboard 不只是简单缩列。
**验收标准 (EARS):**
- R4.AC1: WHEN `targetView` 为 `mobile`、runtime mode 为 view 且 item 设置 `mobileHide: true` 时，系统 SHALL 从 active view runtime item ids 和默认渲染集合中排除该 item，并且不得从 dashboard document 删除该 item。
- R4.AC2: WHEN `targetView` 为 `desktop`、runtime mode 为 view 且 item 设置 `desktopHide: true` 时，系统 SHALL 从 active view runtime item ids 和默认渲染集合中排除该 item，并且不得从 dashboard document 删除该 item。
- R4.AC3: WHEN runtime mode 为 edit 且 item 被 `mobileHide` 或 `desktopHide` 隐藏时，系统 SHALL 保留该 item 在 editor runtime 中可被发现、选择和恢复，并通过 `editorMetaById.visible: false` 或等价 metadata 标记其当前视图不可见，且 SHALL NOT 因 visibility 过滤永久移除 layout 或 profile 数据。
- R4.AC4: WHEN resolved `viewFormat` 为 `grid` 时，系统 SHALL 使用 dashboard item 的 `col/row/sizeX/sizeY` 与 profile override 生成 grid runtime layout。
- R4.AC5: WHEN resolved `viewFormat` 为 `list` 时，系统 SHALL 对任意 `targetView` 生成派生 list runtime layout；desktop 和 mobile 都应使用单列或全宽 active item 布局，而 mobile 额外应用 `mobileHide`、`mobileOrder` 和 `mobileHeight` 语义。
- R4.AC6: WHEN `targetView` 为 `mobile` 且 list item 存在 `mobileHeight` 时，系统 SHALL 将其用于派生 runtime item height；缺失时 SHALL 使用 `sizeY` 或确定性默认高度，并输出高度来源 diagnostics。
- R4.AC7: WHEN 生成 mobile/list runtime layout 时，系统 SHALL NOT 把 `mobileOrder`、`mobileHeight`、`mobileHide` 或 `desktopHide` 作为新字段写入 `LayoutItem`；这些语义只能通过派生几何、visible ids、editor metadata 或 dashboard sidecar 表达。
- R4.AC8: WHEN 生成 list runtime 排序时，系统 SHALL 在 `targetView: 'mobile'` 下优先按 `mobileOrder` 排序，缺失或非法时 fallback 到 `row`、`col`、item id；在 `targetView: 'desktop'` 下 SHALL 按 `row`、`col`、item id 排序。

### R5: Vue Composable 状态模型
**用户故事:** 作为 Vue 集成开发者，我希望有一个 headless composable 管理 dashboard document、width、breakpoint、profile 和 projection，以便在自定义 UI 中复用同一套响应式 profile 逻辑。
**验收标准 (EARS):**
- R5.AC1: WHEN 调用 `useDashboardResponsiveProfileModel()` 时，系统 SHALL 接收 `document`、`width`、`breakpoints`、可选显式 `breakpoint`、可选显式 `targetView`、可配置 target view 推导规则、`mode`、validation 选项和 write-back 选项。
- R5.AC2: WHEN `document`、`width`、`breakpoints`、`breakpoint`、`targetView` 或 `mode` 变化时，系统 SHALL 重新解析 profile 并更新 reactive state，包括 `layout`、`gridSettings`、`editorMetaById`、`requestedBreakpoint`、`resolvedProfileId`、`fallbackApplied` 和 diagnostics。
- R5.AC3: WHEN profile 或 breakpoint 变化时，系统 SHALL 以稳定顺序发出 `breakpointChange`、`profileChange`、`projectionChange` 或等价事件，并文档化事件 payload。
- R5.AC4: WHEN projection 校验失败时，系统 SHALL 保留上一次可用 runtime state，并暴露错误 diagnostics，不得用损坏 projection 覆盖当前可用状态。
- R5.AC5: WHEN composable 创建内部 editor controller 时，系统 SHALL 与现有 editor metadata、selection 和 layout operation runner 协作，并避免把 dashboard-only state 传入基础 `VueGridLayout`。
- R5.AC6: WHEN composable 停止或组件卸载时，系统 SHALL 清理内部 watcher、editor controller、layout executor 或订阅资源，避免泄漏。

### R6: DashboardResponsiveVueGridLayout 薄组件
**用户故事:** 作为应用开发者，我希望有一个可选 dashboard responsive 组件入口，以便少写 glue code，同时仍能复用基础 `VueGridLayout` 的拖拽、resize、editor 和 layout engine 能力。
**验收标准 (EARS):**
- R6.AC1: WHEN 使用 `DashboardResponsiveVueGridLayout` 时，组件 SHALL 接收 dashboard document、width、breakpoints、可选 breakpoint、target view、mode、layoutEngine、editor 和基础 grid passthrough props。
- R6.AC2: WHEN 组件渲染时，系统 SHALL 通过 `useDashboardResponsiveProfileModel()` 生成 active runtime，并将 `modelValue`、`cols`、`margin`、`containerPadding`、`rowHeight`、`layoutEngine` 和 scoped editor prop 传给内层 `VueGridLayout`。
- R6.AC3: WHEN 组件收到 slot children 时，系统 SHALL 根据 active item ids 或 child keys 建立确定性映射；缺少对应 widget 的 child 或缺少 child 的 widget SHALL 产生 diagnostics，而不是导致 runtime 崩溃。
- R6.AC4: WHEN 内层 `VueGridLayout` 触发 committed layout change 时，组件 SHALL 通过 dashboard write-back 生成新的 cloned document，并发出 `update:document`、`documentChange` 或等价事件。
- R6.AC5: WHEN 用户在组件上监听基础 drag、resize、drop 或 editor 事件时，系统 SHALL 保持事件可向外转发，并在 payload 中保留 dashboard profile 上下文或提供可查询 state。
- R6.AC6: WHEN 不使用 `DashboardResponsiveVueGridLayout` 时，系统 SHALL 允许消费者只使用 headless resolver/composable 自行渲染，不强制绑定该组件。
- R6.AC7: WHEN 实现薄组件时，系统 SHALL NOT 内置业务 widget card、菜单、弹窗、palette、toolbar、material-style shell 或 ThingsBoard 业务对象。

### R7: Profile-Scoped Write-Back
**用户故事:** 作为 dashboard 编辑器开发者，我希望在某个 profile 中编辑布局时只回写目标 profile，以便不会意外污染 default 或其他 breakpoint 的布局。
**验收标准 (EARS):**
- R7.AC1: WHEN committed grid edit 发生在命中的 profile 上时，系统 SHALL 只把几何和明确映射的 capability 变更回写到该 profile override 或其 editor sidecar。
- R7.AC2: WHEN committed grid edit 发生在 default layout 上时，系统 SHALL 只更新 primary/default dashboard layout，不得覆盖已有 profiles。
- R7.AC3: WHEN 当前 runtime 是由缺失 profile fallback 到 default 得来且 mode 为 view 时，系统 SHALL NOT 自动创建 profile 或写回 document。
- R7.AC4: WHEN 当前 runtime 是由缺失 profile fallback 到 default 得来且 mode 为 edit 时，系统 SHALL 默认阻止 profile-scoped write-back 并输出 `missing-profile-write-blocked` diagnostic；只有显式 `createMissingProfileOnEdit` 或等价选项开启时才创建目标 profile。
- R7.AC5: WHEN 在 mobile list runtime 中提交排序或高度变化时，系统 SHALL 将排序映射到 `mobileOrder`，将高度映射到 `mobileHeight`，并 SHALL NOT 默认覆盖 desktop `row` 或 `sizeY`。
- R7.AC6: WHEN 在 desktop list runtime 中提交排序或高度变化时，系统 SHALL 将排序映射到目标 layout/profile item 的 `row`，将高度映射到目标 layout/profile item 的 `sizeY`，并 SHALL NOT 写入 mobile-only 字段。
- R7.AC7: WHEN write-back 完成时，系统 SHALL 保留 document 的 revision/source/meta、unknown JSON-safe fields、业务扩展字段、非活动 profiles 和未参与投影的 widgets。
- R7.AC8: IF write-back 遇到 unknown item、非法几何、非法 profile 或 schema validation 失败，系统 SHALL 返回 structured error/diagnostic，并不得用失败结果覆盖调用方 document。

### R8: 兼容迁移与公共导出
**用户故事:** 作为现有 responsive grid 用户，我希望可以逐步迁移到 dashboard profiles，以便不用一次性重写全部 `layouts` 使用方式。
**验收标准 (EARS):**
- R8.AC1: WHEN 提供 dashboard responsive profile 公共 API 时，系统 SHALL 导出 resolver、composable、薄组件、相关 option/result/diagnostic 类型和必要的 helper 类型。
- R8.AC2: WHEN 用户拥有现有 `LayoutsMap`、`cols`、`margin` 或 `containerPadding` 配置时，系统 SHOULD 提供文档化迁移 helper 或示例，将其转换为 `DashboardLayoutDocument` 的 default layout 和 profiles。
- R8.AC3: WHEN 迁移 helper 处理现有 `layouts` 时，系统 SHALL 不修改输入对象，并 SHALL 明确 `lg/md/sm/xs/xxs` 等 breakpoint key 如何映射到 dashboard profiles。
- R8.AC4: WHEN 迁移 helper 无法表达某个 legacy responsive 行为时，系统 SHALL 在 diagnostics 中标记 deferred，而不是悄悄生成不等价 dashboard document。
- R8.AC5: WHEN 更新 public typings、CommonJS 或 ESM 导出时，系统 SHALL 不破坏现有 `VueGridLayout`、`ResponsiveVueGridLayout`、persistence、editor 和 layout-engine 导出。

### R9: 可观测性、测试与文档
**用户故事:** 作为维护者和集成者，我希望 responsive dashboard profile 的行为可测试、可诊断、范围清晰，以便后续 height mode、aspect ratio、collision repair 和 editor shell specs 可以安全叠加。
**验收标准 (EARS):**
- R9.AC1: WHEN resolver、composable、组件 projection 或 write-back 运行时，系统 SHALL 返回或发出结构化 diagnostics，至少覆盖 `profile-fallback`、`unknown-profile-item`、`unsupported-profile-field`、`missing-profile-write-blocked`、`projection-validation-failed` 和 `slot-widget-mismatch`。
- R9.AC2: WHEN 编写单元测试时，系统 SHALL 覆盖 breakpoint/profile 命中、profile fallback、settings 合并、mobile/list sorting、mobileHeight projection、visibility、profile-scoped write-back 和 missing profile write blocking。
- R9.AC3: WHEN 编写组件或浏览器测试时，系统 SHALL 覆盖 `DashboardResponsiveVueGridLayout` 渲染、width/breakpoint 切换、事件顺序、slot/widget mismatch diagnostics、基础 grid 事件转发和现有 `ResponsiveVueGridLayout` 不受影响。
- R9.AC4: WHEN 编写类型导出测试时，系统 SHALL 确认 resolver/composable/component props、result、event payload、diagnostics 和 migration helper 类型可被库消费者导入。
- R9.AC5: WHEN 更新示例或文档时，系统 SHALL 展示 headless resolver/composable 用法和薄组件用法，并明确本规格不包含高度 fit/fixed、pixel precision、aspect ratio、collision repair 或 dashboard editor shell。
- R9.AC6: WHEN 后续 specs 需要 height modes、render precision、item aspect ratio、layout settings migration 或 dashboard editor shell 时，系统 SHALL 能引用本规格的 profile resolution、settings projection、mobile/list runtime 和 write-back 边界继续扩展。

## Clarifications

### Session 2026-05-19

- Q: 第二个 spec 长期受益最大的方案是什么？ -> A: 选择 B：headless resolver/composable + 可选 `DashboardResponsiveVueGridLayout` 薄组件。
- Q: 第二个 spec 第一版要不要包含 `DashboardResponsiveVueGridLayout` 组件实现？ -> A: 可以包含，但必须保持薄组件边界，不把 editor shell 或业务 widget UI 带进去。
- Q: 缺失 profile 时是否自动创建 profile？ -> A: 默认不创建；view fallback 到 default，edit/write-back 默认阻止并发 diagnostic，只有显式开启 `createMissingProfileOnEdit` 才创建。
- Q: hidden item 在 view/edit runtime 中如何处理？ -> A: view 模式从 active runtime 和默认渲染集合排除，edit 模式保留并标记不可见。
- Q: `targetView` 应该怎么确定？ -> A: 显式 `targetView` 优先；未传时按可配置 mobile breakpoint/width 规则推导。
- Q: `viewFormat: 'list'` 是否只属于 mobile？ -> A: `list` 对任意 `targetView` 都可生效，mobile 额外使用 `mobileHide`、`mobileOrder` 和 `mobileHeight`。
- Q: list 模式下提交排序/高度变化时 desktop 应该写回哪里？ -> A: mobile list 写回 `mobileOrder`/`mobileHeight`；desktop list 写回目标 layout/profile 的 `row`/`sizeY`。
- Q: list 模式的排序规则应该如何统一？ -> A: mobile 按 `mobileOrder` 优先，缺失时 fallback 到 `row`/`col`/id；desktop 按 `row`/`col`/id。
