# 版本化布局持久化核心 需求规格

## 简介

当前网格组件已经支持 `v-model` 布局同步、`layoutChange` 回调和基于 Pinia 的 undo/redo history，但刷新页面后布局仍会丢失，消费者必须自行拼装保存逻辑。第一阶段目标是建立一个不依赖 Pinia 的持久化核心：用版本化、可迁移、可校验的数据模型承载单布局与响应式布局，并通过 adapter 抽象支持本地与远端存储。该能力要优先解决刷新恢复、自动保存、手动保存/放弃、损坏数据回退和多标签页冲突策略，为后续性能回放与专业编辑 UX 提供稳定基础。第一版交付形态以组合式 API 为核心，同时为 `VueGridLayout` 和 `ResponsiveVueGridLayout` 提供薄封装的 `persistence` prop 作为便捷入口。

本规格不包含空间索引、拖拽调度器、snap lines、多选、协同编辑或完整 dashboard 应用壳。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-versioned-layout-persistence-core.md

COVERAGE: versioned-persistence

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| versioned-persistence | R1-R8 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 版本化布局文档模型
**用户故事:** 作为组件使用者，我希望布局保存为稳定、可检查的文档格式，以便刷新、迁移、远端保存和未来工具链都能基于同一份数据工作。
**验收标准 (EARS):**
- R1.AC1: WHEN 调用布局序列化能力时，系统 SHALL 输出包含 schema version、保存时间、布局数据和最小元数据的持久化文档。
- R1.AC2: WHEN 序列化普通 `Layout` 时，系统 SHALL 保留每个 `LayoutItem` 的位置、尺寸、约束、静态状态和可交互配置字段。
- R1.AC3: WHEN 序列化响应式布局集合时，系统 SHALL 保留每个 breakpoint 对应的布局，并能区分单布局文档与响应式布局文档。
- R1.AC4: WHEN 文档中出现当前版本未知但允许透传的元数据时，系统 SHALL 在不破坏核心布局字段的前提下保留该元数据。

### R2: 反序列化、校验与安全回退
**用户故事:** 作为组件使用者，我希望读取持久化数据时默认严格校验并安全失败，以便损坏数据不会覆盖当前可用布局；只有显式开启容错清理时才允许修复可恢复字段。
**验收标准 (EARS):**
- R2.AC1: WHEN 反序列化合法文档时，系统 SHALL 返回可直接用于 `modelValue` 或响应式 `layouts` 的布局数据。
- R2.AC2: IF 持久化 payload 不是合法 JSON、缺少必要字段或布局项字段类型错误，系统 SHALL 返回明确错误状态，并 SHALL NOT 用损坏数据覆盖当前布局。
- R2.AC3: IF 持久化布局包含越界、重复 id 或非法尺寸，系统 SHALL 默认严格拒绝该文档；仅当消费者显式配置容错清理时，系统 MAY 清理可恢复字段并报告处理结果。
- R2.AC4: WHEN 消费者提供 fallback layout 时，系统 SHALL 在读取失败时恢复 fallback，并暴露失败原因。

### R3: Schema 迁移
**用户故事:** 作为库维护者，我希望持久化格式可版本化迁移，以便未来升级字段、响应式模型或 patch 模型时不破坏已有用户数据。
**验收标准 (EARS):**
- R3.AC1: WHEN 读取低于当前 schema version 的文档时，系统 SHALL 按版本顺序执行已注册 migration。
- R3.AC2: IF 缺少某个必需 migration，系统 SHALL 停止恢复并返回可诊断的 migration error。
- R3.AC3: WHEN migration 成功完成时，系统 SHALL 输出当前 schema version 的文档和迁移事件信息。
- R3.AC4: IF migration 过程中抛出异常或返回非法文档，系统 SHALL 保留原始 payload，不得写回失败结果。

### R4: Adapter-first 存储接口
**用户故事:** 作为组件使用者，我希望持久化不被硬编码到 `localStorage`，以便可以选择本地、IndexedDB、后端 API 或自定义业务存储。
**验收标准 (EARS):**
- R4.AC1: WHEN 定义 persistence adapter 时，系统 SHALL 使用统一接口表达 load、save、remove 和可选 subscribe 能力。
- R4.AC2: WHEN 使用内置 `localStorageAdapter` 时，系统 SHALL 能按 key 保存、读取和删除布局文档。
- R4.AC3: WHEN 使用自定义 adapter 时，系统 SHALL 不要求安装 Pinia，也 SHALL 不要求消费者使用特定状态管理库。
- R4.AC4: IF adapter 操作失败或超时，系统 SHALL 暴露错误状态，并 SHALL NOT 将内存中的最新布局回滚到未知状态。
- R4.AC5: WHEN adapter 不支持浏览器环境或当前运行在 SSR 中时，系统 SHALL 可安全降级为未初始化状态，并给出可处理的错误或警告。

### R5: Vue 持久化状态管理
**用户故事:** 作为 Vue 开发者，我希望通过核心组合式 API 获得 dirty、save、discard 和 autosave 状态，以便快速构建专业 dashboard 编辑体验，并让组件级 `persistence` prop 复用同一套状态语义。
**验收标准 (EARS):**
- R5.AC1: WHEN 使用持久化组合式 API 绑定布局 ref 时，系统 SHALL 暴露 `status`、`dirty`、`lastSavedAt`、`error`、`save()`、`discard()`、`reset()` 和 `load()`。
- R5.AC2: WHEN 布局相对最后保存快照发生变化时，系统 SHALL 将 `dirty` 置为 true。
- R5.AC3: WHEN 手动保存成功时，系统 SHALL 写入 adapter、更新最后保存快照、清除 dirty，并记录保存时间。
- R5.AC4: WHEN 执行 discard 时，系统 SHALL 将布局恢复到最后保存快照，并清除 dirty。
- R5.AC5: WHEN 开启 autosave 时，系统 SHALL 按配置 debounce 保存 committed layout 变化，且 SHALL 避免在拖拽/resize 中间态产生过量写入。
- R5.AC6: IF autosave 失败，系统 SHALL 保留当前内存布局和 dirty 状态，并暴露可重试错误。
- R5.AC7: WHEN persistence 配置未显式设置 `autoSave` 时，系统 SHALL 默认启用提交后自动保存，且 SHALL 只保存已经提交的布局变化。

### R6: Grid 组件集成与兼容性
**用户故事:** 作为现有用户，我希望新持久化能力能通过薄封装的 `persistence` prop 接入 `VueGridLayout` 和 `ResponsiveVueGridLayout`，同时不破坏已有 `v-model`、`layoutChange` 与 `historyStore` 用法。
**验收标准 (EARS):**
- R6.AC1: WHEN 不传入 persistence 配置时，组件 SHALL 保持现有行为和事件语义不变。
- R6.AC2: WHEN 传入 persistence 配置并完成初始 load 时，组件 SHALL 用恢复出的布局初始化 `modelValue` 或响应式 `layouts`。
- R6.AC3: WHEN 组件触发 `layoutChange` 或 `update:modelValue` 时，持久化层 SHALL 能接收 committed layout，而不是未完成的临时 preview 状态。
- R6.AC4: WHEN 同时使用 `historyStore` 与 persistence 时，系统 SHALL 明确二者职责：history 管理会话内 undo/redo，persistence 管理 durable save/load。
- R6.AC5: IF 初始恢复失败，组件 SHALL 保持调用方传入的布局，并通过错误回调或状态暴露失败原因。
- R6.AC6: WHEN 使用组件级 `persistence` prop 时，系统 SHALL 将其视为组合式 API 的便捷封装，并 SHALL NOT 在组件内部实现一套独立的持久化状态机。
- R6.AC7: WHEN 组件级 `persistence` prop 初始恢复成功时，组件 SHALL 通过标准 `update:modelValue` 或 `update:layouts` 事件同步父级受控状态。

### R7: 多标签页与冲突策略
**用户故事:** 作为 dashboard 编辑用户，我希望多个标签页同时编辑时有明确策略，以便旧标签页不会静默覆盖较新的布局；当本地已有 dirty 修改时，默认必须进入 manual 冲突处理。
**验收标准 (EARS):**
- R7.AC1: WHEN adapter 支持外部变更订阅时，系统 SHALL 能接收同 key 文档的远端或跨标签页更新通知。
- R7.AC2: IF 当前页面没有 dirty 修改且收到更新，系统 SHALL 按配置自动应用较新的持久化文档。
- R7.AC3: IF 当前页面存在 dirty 修改且收到更新，系统 SHALL 默认执行 `manual` 策略，并 SHALL 支持调用方显式配置 `newer-wins` 或 `keep-local`。
- R7.AC4: WHEN 发生冲突时，系统 SHALL 暴露本地文档、外部文档、冲突原因和可执行的 resolve 方法。
- R7.AC5: WHEN adapter 不支持 subscribe 时，系统 SHALL 文档化该限制，并保持单标签页保存/恢复能力可用。

### R8: 可观测性、示例与测试门槛
**用户故事:** 作为库维护者和集成开发者，我希望持久化行为可测试、可调试、可学习，以便发布后能可靠定位保存失败和迁移问题。
**验收标准 (EARS):**
- R8.AC1: WHEN load、save、discard、migration、conflict 或 error 发生时，系统 SHALL 通过回调或事件暴露结构化信息。
- R8.AC2: WHEN 编写单元测试时，系统 SHALL 能使用内存 adapter 覆盖序列化、反序列化、migration、dirty state、autosave debounce 和保存失败场景。
- R8.AC3: WHEN 编写集成示例时，系统 SHALL 至少提供 localStorage 刷新恢复示例、autosave dirty-state 示例和自定义 remote adapter 示例。
- R8.AC4: WHEN 更新文档时，系统 SHALL 说明从当前 `historyStore` 用法迁移到持久化模型的推荐方式。
- R8.AC5: WHEN 发布该能力时，系统 SHALL 在类型声明中导出核心文档类型、adapter 类型、组合式 API 类型和错误类型。

## Clarifications

### Session 2026-05-09

- Q: 第一版持久化入口应选择只做 composable、composable + 薄 prop，还是只做组件 prop？ -> A: composable + 薄 prop；核心逻辑在 `useGridLayoutPersistence()`，`VueGridLayout`/`ResponsiveVueGridLayout` 提供便捷 `persistence` prop。
- Q: dirty 状态下收到外部更新时，默认冲突策略应选择 `newer-wins`、`keep-local` 还是 `manual`？ -> A: `manual`；默认进入冲突状态，由调用方或用户显式 resolve。
- Q: 传入 `persistence` 后默认保存行为应选择手动保存、提交后自动保存，还是完全自动保存？ -> A: 提交后自动保存；`autoSave` 默认 true，只保存 committed layout，并按 debounce 写入。
- Q: 反序列化遇到非法布局时，默认校验策略应选择严格拒绝、容错清理还是宽松接受？ -> A: 严格拒绝；读取失败并保留当前布局或 fallback，容错清理必须显式配置。
- Q: 组件级 `persistence` prop 初始恢复成功后，应如何同步父级状态？ -> A: 通过标准 `update:modelValue` 或 `update:layouts` 事件同步父级受控状态。
