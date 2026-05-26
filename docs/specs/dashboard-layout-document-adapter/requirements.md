# Dashboard Layout Document & Adapter 需求规格

## 简介

当前组件库已经拥有稳定的基础几何布局模型、响应式布局集合、版本化布局持久化核心，以及 headless editor metadata。下一阶段需要引入 dashboard 产品层文档模型，用来表达 ThingsBoard 风格 dashboard 中的 `WidgetLayout`、`GridSettings`、breakpoint profile、item 可见性、移动端排序和高度等产品语义，同时保持 `LayoutItem` 继续作为通用几何模型。

本规格只定义第一层基础：独立的 `DashboardLayoutDocument`、dashboard 到 grid runtime 的 adapter、grid runtime 回写 dashboard document 的 adapter、schema/validation/migration 边界，以及与现有 persistence/editor metadata 的关系。第一版实现单 dashboard layout 的读写和运行时投影，但文档根结构需要预留未来多 layout 区域扩展位。第一版交付框架无关核心能力，不实现 Vue composable 状态机或组件 prop 集成。它不实现完整 responsive profile 行为、mobile/list 渲染、高度模式、collision repair、context menu、业务 widget 配置、alias、timewindow 或告警模型。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-dashboard-layout-document-adapter.md

COVERAGE: dashboard-document-adapter

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| dashboard-document-adapter | R1-R8 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 独立 Dashboard 文档模型
**用户故事:** 作为组件库维护者，我希望 dashboard 产品语义有独立文档模型，以便长期支持 dashboard settings、breakpoint profiles、item metadata 和迁移，而不把这些字段塞进基础 `LayoutItem` 或 `LayoutPersistenceDocument.meta`。
**验收标准 (EARS):**
- R1.AC1: WHEN 创建 dashboard 持久化 payload 时，系统 SHALL 输出独立的 `DashboardLayoutDocument`，并包含 `dashboardSchemaVersion`、文档标识、保存批次信息、默认 dashboard layout、可选 breakpoint profiles 和可选扩展元数据。
- R1.AC2: WHEN 表达 dashboard item layout 时，系统 SHALL 使用 dashboard 层结构保存 `col`、`row`、`sizeX`、`sizeY`、`desktopHide`、`mobileHide`、`mobileHeight`、`mobileOrder`、`resizable`、`preserveAspectRatio` 等产品字段。
- R1.AC3: WHEN 表达 dashboard grid settings 时，系统 SHALL 支持保存 `columns`、`minColumns`、`margin`、`outerMargin`、`viewFormat`、`rowHeight`、`autoFillHeight`、`mobileRowHeight`、`mobileAutoFillHeight` 和 layout dimension 相关字段。
- R1.AC4: WHEN 文档包含当前版本未知但 JSON-safe 的 dashboard 扩展字段时，系统 SHALL 在校验、投影和回写过程中保留这些字段。
- R1.AC5: IF payload 包含 DOM 节点、VNode、事件对象、函数、symbol 或循环引用等运行时值，系统 SHALL 拒绝序列化或在显式容错模式下忽略并报告 warning。
- R1.AC6: WHEN 设计 dashboard 文档主路径时，系统 SHALL NOT 依赖 `LayoutPersistenceDocument.meta.dashboard` 作为主要 schema 承载方式。
- R1.AC7: WHEN 定义第一版 `DashboardLayoutDocument` 根结构时，系统 SHALL 以单个 primary/default dashboard layout 作为唯一已实现运行时目标，并 SHALL 为未来多 layout 区域保留向后兼容的扩展位置。

### R2: 核心 LayoutItem 边界保护
**用户故事:** 作为现有 `VueGridLayout` 用户，我希望 dashboard 能力不会改变基础布局项语义，以便已有 grid、responsive、persistence 和 editor 用法继续稳定工作。
**验收标准 (EARS):**
- R2.AC1: WHEN dashboard document 被转换为当前 grid runtime 时，系统 SHALL 只把 `x`、`y`、`w`、`h`、`i`、`min/max`、`static`、`isDraggable`、`isResizable`、`resizeHandles`、`isBounded` 等现有几何和交互字段写入 `LayoutItem`。
- R2.AC2: WHEN dashboard document 包含 `mobileOrder`、`mobileHeight`、`desktopHide`、`mobileHide`、`preserveAspectRatio` 或 dashboard grid settings 时，系统 SHALL NOT 将这些字段直接写入 `LayoutItem`。
- R2.AC3: WHEN 不使用 dashboard adapter 时，现有 `Layout`、`LayoutsMap`、`VueGridLayout`、`ResponsiveVueGridLayout` 和 `useGridLayoutPersistence()` 行为 SHALL 保持兼容。
- R2.AC4: IF dashboard adapter 发现目标 runtime 不支持某个 dashboard 字段，系统 SHALL 保留原字段并通过 diagnostics 标记该字段当前未参与基础 grid 渲染。

### R3: Dashboard 到 Grid Runtime 投影
**用户故事:** 作为 dashboard 集成开发者，我希望能把 dashboard 文档投影为当前组件库可直接消费的运行时结构，以便复用现有 grid、editor、history 和 layout engine 能力。
**验收标准 (EARS):**
- R3.AC1: WHEN 调用 dashboard 投影能力时，系统 SHALL 根据 primary/default dashboard layout 以及调用方显式传入的 profile 或 breakpoint id 生成单个 runtime `layout`、resolved grid settings、`editorMetaById` 和结构化 diagnostics，并 SHALL 保留未来多 layout 投影扩展空间。
- R3.AC2: WHEN dashboard item 具有 `col`、`row`、`sizeX`、`sizeY` 时，系统 SHALL 确定性映射为 `LayoutItem.x`、`LayoutItem.y`、`LayoutItem.w`、`LayoutItem.h`。
- R3.AC3: WHEN dashboard item 具有 `resizable: false` 时，系统 SHALL 在运行时 layout capability 或 `editorMetaById` 中表达不可 resize，而不丢失原 dashboard 字段。
- R3.AC4: WHEN dashboard profile 标记 item 在当前目标视图不可见时，系统 SHALL 在投影结果中通过 `editorMetaById.visible` 或等价 sidecar 状态表达该可见性，不应从 dashboard document 中删除该 item。
- R3.AC5: WHEN 多次对同一合法 document 调用投影能力时，系统 SHALL 产生稳定排序和稳定 id 的结果。
- R3.AC6: IF 某个 item 缺少必要几何字段或字段类型非法，系统 SHALL 默认在 strict 模式下拒绝投影；仅当调用方显式启用 sanitize 模式时，系统 SHALL 执行确定性、可诊断的恢复。
- R3.AC7: WHEN 调用方未传入 profile 或 breakpoint id，或传入 id 在 document 中不存在时，系统 SHALL fallback 到 primary/default layout；第一版 SHALL NOT 根据 viewport width 自动匹配 breakpoint。

### R4: Grid Runtime 到 Dashboard 文档回写
**用户故事:** 作为 dashboard 编辑器开发者，我希望用户在现有 grid/editor 中完成的移动、缩放和能力变更能回写到 dashboard 文档，以便保存后的 dashboard 仍保留产品语义和未知扩展字段。
**验收标准 (EARS):**
- R4.AC1: WHEN runtime layout item 的 `x`、`y`、`w`、`h` 发生 committed 变化时，系统 SHALL 将其回写为对应 dashboard item 的 `col`、`row`、`sizeX`、`sizeY`。
- R4.AC2: WHEN 回写指定 profile 或 breakpoint 时，系统 SHALL 只更新目标 profile 的 item layout 和 settings，不得意外覆盖其他 profiles。
- R4.AC3: WHEN 回写 editor metadata 中的能力状态时，系统 SHALL 只把有明确 dashboard 产品语义映射的字段写回 dashboard item 或 profile，例如 `resizable` 和 visibility；未映射的 editor metadata SHALL 保留在 editor sidecar 中。
- R4.AC4: WHEN 回写完成时，系统 SHALL 保留 document 中的 widget id、未知 dashboard 扩展字段、profile 未解析字段和非布局业务引用。
- R4.AC5: WHEN 回写能力接收 runtime 输入时，系统 SHALL 不原地修改传入 document、layout、layouts 或 `editorMetaById`。
- R4.AC6: IF runtime 中出现 dashboard document 不存在的新 item，系统 SHALL 按配置新增 dashboard item 或返回可诊断的 `unknown-item` 结果，不得静默丢弃。

### R5: Dashboard Persistence 与 Migration 边界
**用户故事:** 作为库维护者，我希望 dashboard document 有自己的版本、校验、迁移和 adapter 边界，以便它能随着 dashboard 产品模型演进，而不破坏现有基础 layout persistence。
**验收标准 (EARS):**
- R5.AC1: WHEN 保存 dashboard document 时，系统 SHALL 使用 dashboard 专属 schema version 和 migration map，不复用 `layoutSchemaVersion` 作为 dashboard schema version。
- R5.AC2: WHEN 读取低版本 dashboard document 时，系统 SHALL 按版本顺序执行 dashboard migrations，并在缺少 migration、migration 抛错或迁移后校验失败时返回明确错误。
- R5.AC3: WHEN 定义 dashboard persistence adapter 时，系统 SHALL 复用现有 adapter-first 思路表达 `load`、`save`、`remove` 和可选 `subscribe` 能力，但 SHALL 以 `DashboardLayoutDocument` 为 I/O 文档类型。
- R5.AC4: WHEN 同一项目同时使用基础 layout persistence 和 dashboard persistence 时，系统 SHALL 明确两者职责：基础 persistence 保存 `Layout` 或 `LayoutsMap`，dashboard persistence 保存 dashboard 产品文档。
- R5.AC5: IF dashboard document 校验失败，系统 SHALL 保留原始 payload 和错误路径，不得用损坏文档覆盖当前可用 runtime 状态。
- R5.AC6: WHEN adapter 接收外部变更或冲突信息时，系统 SHALL 能暴露 local/external dashboard document，以便后续 editor shell 或业务层实现冲突处理。
- R5.AC7: WHEN deserialize、validate、project 或 write-back 处理 dashboard document 时，系统 SHALL 默认使用 strict 校验策略；sanitize SHALL 只在调用方显式配置后启用。
- R5.AC8: WHEN 实现第一版 dashboard persistence 能力时，系统 SHALL 只提供框架无关的 document、纯函数 adapter、校验/迁移函数和 persistence adapter 类型；SHALL NOT 实现 `useDashboardLayoutPersistence()`、组件级 `persistence` prop 或 Vue 状态机集成。

### R6: Editor Metadata 集成边界
**用户故事:** 作为专业 dashboard 编辑器用户，我希望 dashboard adapter 能与现有 headless editor metadata 协作，以便 selection、visibility、locked、resizable、section rows 和保存状态继续使用现有 editor 能力。
**验收标准 (EARS):**
- R6.AC1: WHEN dashboard document 投影到 editor runtime 时，系统 SHALL 输出可供 `GridEditorMetaById` 使用的 metadata，并通过现有 metadata 校验规则或等价规则保证结构合法。
- R6.AC2: WHEN dashboard 文档保存 editor sidecar 数据时，系统 SHALL 使用独立的 editor namespace，且 SHALL NOT 把 dashboard grid settings、dashboard item layout 或未声明映射的 editor runtime state 写入 dashboard item schema。
- R6.AC3: WHEN dashboard adapter 读取已有 `meta.editor` 风格 envelope 或等价 editor envelope 时，系统 SHALL 保留 `editorMetaById` 和 section rows 的可恢复信息。
- R6.AC4: WHEN dashboard item capability 与 editor metadata 同时存在时，系统 SHALL 定义可诊断的优先级规则，避免 `resizable`、`locked`、`visible` 等状态出现静默冲突。
- R6.AC5: IF editor metadata 引用的 item id 不存在于 dashboard document，系统 SHALL 清理或隔离该 orphan metadata，并报告 warning。

### R7: ThingsBoard 风格导入导出边界
**用户故事:** 作为从 ThingsBoard 经验迁移 dashboard 的开发者，我希望组件库能表达 ThingsBoard dashboard layout 的关键产品语义，以便复用成熟产品模型，而不照搬 Angular/Gridster 的实现细节。
**验收标准 (EARS):**
- R7.AC1: WHEN 输入 ThingsBoard 风格 `DashboardLayout`、`GridSettings` 或 `WidgetLayout` 数据时，系统 SHALL 能转换为 `DashboardLayoutDocument` 中的等价字段。
- R7.AC2: WHEN 输出 ThingsBoard 风格 layout 数据时，系统 SHALL 能从 `DashboardLayoutDocument` 生成 `widgets`、`gridSettings` 和 `breakpoints` 兼容结构。
- R7.AC3: WHEN ThingsBoard 数据包含业务 widget 定义、entity alias、timewindow、filter、alarm 或 dashboard toolbar 配置时，系统 SHALL 将其视为业务层数据或扩展字段，不纳入基础 grid adapter 的必需 schema。
- R7.AC4: WHEN ThingsBoard 字段名与本库长期 API 命名不同，系统 SHALL 通过 adapter 映射保持兼容，而不是要求核心 API 直接采用 ThingsBoard 命名。
- R7.AC5: IF ThingsBoard 数据使用本库暂未实现的行为语义，系统 SHALL 保留原字段并在 diagnostics 中标记 unsupported 或 deferred。

### R8: 可观测性、测试与非目标
**用户故事:** 作为维护者和集成者，我希望 dashboard document adapter 的行为可测试、可诊断、范围清晰，以便后续 responsive profile、height mode 和 editor shell specs 可以在稳定契约上继续推进。
**验收标准 (EARS):**
- R8.AC1: WHEN serialize、deserialize、validate、migrate、project 或 write-back 发生时，系统 SHALL 能返回结构化 warnings、errors 和 diagnostics。
- R8.AC2: WHEN 编写单元测试时，系统 SHALL 覆盖合法文档 round-trip、unknown field preservation、strict validation failure、sanitize recovery、profile-scoped write-back、editor metadata mapping 和 immutability。
- R8.AC3: WHEN 编写类型导出测试时，系统 SHALL 确认 dashboard document、grid settings、item layout、profile、adapter option、projection result 和 diagnostics 类型可由库消费者导入。
- R8.AC4: WHEN 更新示例或文档时，系统 SHALL 展示 dashboard document 如何投影到现有 `VueGridLayout` 或 editor controller，而不是要求用户直接改写 `LayoutItem`。
- R8.AC5: WHEN 完成本规格时，系统 SHALL NOT 实现 mobile/list 渲染策略、高度模式计算、pixel precision 策略、collision repair、dashboard context menu、widget palette、Vue composable 状态机、组件 prop 集成或业务 widget 数据源。
- R8.AC6: WHEN 后续 specs 需要 responsive profile、item aspect ratio、height mode 或 editor shell 能力时，系统 SHALL 能引用本规格定义的 document/profile/adapter 边界继续扩展。

## Clarifications

### Session 2026-05-19

- Q: 第一个 spec 的范围选择只做最小类型、文档模型加 adapter 边界，还是合并 responsive profile？ -> A: 选择“文档模型 + adapter + persistence/editor meta 边界”。
- Q: 长期收益最大的 dashboard 存储方案是什么？ -> A: 使用独立 `DashboardLayoutDocument` 作为一等文档模型，复用现有 adapter-first 思路；不把 dashboard 主 schema 寄生在 `LayoutPersistenceDocument.meta.dashboard`。
- Q: 第一版 `DashboardLayoutDocument` 是只表达一个 dashboard layout，还是预留 ThingsBoard 式多 layout 区域或多 state？ -> A: 第一版实现单 dashboard layout，但根结构预留未来多 layout 扩展位。
- Q: 第一版哪些 editor metadata 允许回写到 dashboard document？ -> A: 回写几何变化和明确映射的产品能力字段，例如 `resizable`/visibility；未映射 editor metadata 保留在 editor sidecar。
- Q: 第一版 profile/breakpoint 投影怎么触发？ -> A: 只支持调用方显式传入 profile/breakpoint id，并在缺失或不存在时 fallback 到 default；不做 viewport 自动匹配。
- Q: dashboard document 的校验默认策略是什么？ -> A: 默认 strict；sanitize 必须由调用方显式开启。
- Q: 第一版要不要提供 Vue composable 状态机？ -> A: 不提供；第一版只做框架无关的文档、纯函数 adapter、校验/迁移和 persistence adapter 类型。
