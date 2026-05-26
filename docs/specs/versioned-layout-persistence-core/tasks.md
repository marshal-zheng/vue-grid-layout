# 版本化布局持久化核心 实现任务

- [x] 1. 建立持久化核心模块与公开类型骨架
  - 新增 `lib/persistence.ts`，定义 `LAYOUT_SCHEMA_VERSION`、`LayoutPersistenceKind`、`LayoutPersistenceDocument`、result、status、event、error、conflict、adapter、controller 等类型。
  - 定义单布局文档与响应式布局文档的 discriminated union，包含 `layoutSchemaVersion`、`kind`、`key`、`revision`、`sourceId`、`savedAt`、`data`、`meta`。
  - 明确模块不依赖 Pinia，仅复用现有 `Layout`、`LayoutItem`、`ResizeHandleAxis` 类型。
  - 为后续导出预留命名 API，避免默认导出和组件导出混在一起。
  _需求追溯: R1.AC1, R1.AC3, R1.AC4, R4.AC3, R8.AC5_

- [x] 2. 实现布局文档序列化、校验与反序列化基础
  - 实现 `serializeLayoutDocument()`，支持 `kind: 'layout'` 与 `kind: 'responsive'`，并保留 `LayoutItem` 位置、尺寸、约束、静态状态和交互配置字段。
  - 实现 strict 默认校验，覆盖非法 JSON、缺少必要字段、字段类型错误、重复 id、越界、非法尺寸和非法 `resizeHandles`。
  - 实现显式 `sanitize` 模式，仅清理确定性可恢复字段，并返回 warning；默认不得静默清理。
  - 实现 `deserializeLayoutDocument()` 的成功、失败、fallback 返回结构，失败时不得覆盖当前内存布局。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R2.AC1, R2.AC2, R2.AC3, R2.AC4_

- [x] 3. 实现 schema migration 管线
  - 实现 `migrateLayoutDocument()` 与 `LayoutMigrationMap`，按版本顺序执行 migration。
  - 覆盖低版本文档恢复、缺失 migration、migration 抛错、migration 输出非法文档等路径。
  - migration 成功后返回当前 schema version 文档和迁移事件信息。
  - migration 失败时保留原始 payload，不写回 adapter。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC4_

- [x] 4. 实现 adapter 接口、localStorage adapter 与 memory adapter
  - 定义 `LayoutPersistenceAdapter` 的 `load`、`save`、`remove` 和可选 `subscribe` 接口。
  - 实现 `localStorageAdapter()`，支持 key/prefix、JSON 保存读取删除、SSR/storage 不可用错误和 adapter 操作错误。
  - 使用 `storage` 事件实现跨标签页订阅，并用 `sourceId` 过滤本标签页自身写入。
  - 实现 `memoryPersistenceAdapter()`，用于单元测试和示例。
  - 保持自定义 adapter 能独立工作，不要求 Pinia 或特定状态库。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R7.AC1, R7.AC5, R8.AC2_

- [x] 5. 实现 `useGridLayoutPersistence()` 状态控制器
  - 实现 `status`、`dirty`、`lastSavedAt`、`error`、`conflict`、`load()`、`commit()`、`save()`、`discard()`、`reset()`、`remove()`、`resolveConflict()`、`stop()`。
  - 默认 `autoSave: true`、`debounceMs: 300`、`validation: 'strict'`、`conflictStrategy: 'manual'`。
  - `commit()` 只处理 committed layout；组件集成模式通过 `watchTarget: false` 避免 preview 中间态写入。
  - autosave 失败时保留当前内存布局和 dirty 状态，并暴露可重试错误。
  - 实现外部更新处理：clean 状态自动应用较新文档，dirty 状态默认进入 manual conflict，并支持显式 `newer-wins` / `keep-local`。
  - 通过 `onEvent` / `onError` 暴露 load、save、discard、migration、conflict、error 等结构化事件。
  _需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R7.AC2, R7.AC3, R7.AC4, R8.AC1_

- [x] 6. 集成 `VueGridLayout` 的薄 `persistence` prop
  - 在 `lib/VueGridLayoutPropTypes.ts` 增加单布局 `persistence` prop 类型与运行时 prop 定义。
  - 在 `VueGridLayout` 初始化后绑定 `useGridLayoutPersistence({ kind: 'layout', watchTarget: false })`。
  - 初始 load 成功后更新 `state.layout`，并通过 `update:modelValue` 与 `layoutChange` 保持父级受控状态一致。
  - 在 `onLayoutMaybeChanged()` 的 committed layout 分支调用 `commit()`，避免 `state.activeDrag` 或 resize preview 中间态触发保存。
  - 保持不传 `persistence` 时的现有行为和事件语义不变。
  - 明确 `historyStore` 继续只管理会话内 undo/redo，persistence 管 durable save/load。
  - 初始恢复失败时保留调用方传入布局，并通过 controller 状态、事件或错误回调暴露原因。
  _需求追溯: R5.AC5, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7_

- [x] 7. 集成 `ResponsiveVueGridLayout` 的响应式 `persistence` prop
  - 在响应式组件 props 和类型中增加 `ResponsiveGridLayoutPersistenceProp`。
  - 使用 `kind: 'responsive'` 持久化完整 `Record<string, Layout>`，而不是只保存当前 breakpoint。
  - 初始 load 成功后替换 `state.layouts`，重新计算当前 breakpoint 的 `state.layout`，并 emit `update:layouts` 与 `layoutChange`。
  - 在 `onLayoutChange()` 和 breakpoint 变化提交 `newLayouts` 后调用 responsive persistence `commit()`。
  - render 时剥离 `persistence`，不得把 responsive persistence 配置透传给内层 `VueGridLayout`。
  - 保持未传 `persistence` 时响应式组件现有行为不变。
  _需求追溯: R1.AC3, R5.AC5, R6.AC1, R6.AC2, R6.AC3, R6.AC5, R6.AC6, R6.AC7_

- [x] 8. 补齐 CommonJS、类型声明与 README API 文档
  - 在 `lib/cjs.ts` 导出 `persistence` 命名空间和核心函数：`serializeLayoutDocument`、`deserializeLayoutDocument`、`localStorageAdapter`、`memoryPersistenceAdapter`、`useGridLayoutPersistence`。
  - 在 `typings/index.d.ts` 导出核心文档类型、adapter 类型、组合式 API 类型、错误类型和组件 `persistence` prop 类型。
  - 更新 README：新增 localStorage 刷新恢复示例、autosave dirty-state 示例、自定义 remote adapter 示例。
  - 更新 README：说明 `historyStore` 与 persistence 的职责区别和迁移建议。
  - 在文档中提示 localStorage 不适合敏感数据，SSR/storage 不可用时会进入可诊断错误状态。
  _需求追溯: R4.AC3, R4.AC5, R6.AC4, R8.AC3, R8.AC4, R8.AC5_

- [x] 9. 增加持久化核心单元测试
  - 建立或复用项目可接受的测试入口；如果暂不新增测试框架，至少提供可运行的 Node 脚本覆盖核心纯函数。
  - 覆盖单布局/响应式布局序列化、strict 反序列化、sanitize 反序列化、fallback、migration 成功/失败、meta 透传。
  - 覆盖 `memoryPersistenceAdapter()`、`localStorageAdapter()` 的 load/save/remove/subscribe 行为。
  - 覆盖 controller 的 dirty、manual save、discard、reset、debounced autosave、save failure、remove。
  - 覆盖多标签页冲突策略：clean 自动应用、dirty 默认 manual conflict、显式 `newer-wins` 和 `keep-local`。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R4.AC1, R4.AC2, R4.AC4, R4.AC5, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R8.AC1, R8.AC2_

- [x] 10. 增加组件集成验证与发布前回归
  - 覆盖 `VueGridLayout` 未传 `persistence` 时现有事件和 `historyStore` 行为不变。
  - 覆盖 `VueGridLayout` 初始恢复成功后 emit `update:modelValue`，恢复失败时保留调用方布局。
  - 覆盖 drag/resize preview 不写入，drag/resize stop 后 committed layout 触发 debounced save。
  - 覆盖 `ResponsiveVueGridLayout` 初始恢复后 emit `update:layouts`，并持久化完整 breakpoint layouts。
  - 覆盖 responsive persistence prop 不透传到内层 `VueGridLayout`。
  - 运行 `yarn lint`、`npx tsc --noEmit`、`yarn build`，并记录结果。
  _需求追溯: R5.AC5, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7, R8.AC2_

- [x] 11. 修复覆盖评审发现的长期缺口
  - 为 adapter load/save/remove 增加可配置 `timeoutMs`，默认超时后暴露 `adapter-timeout`，且不回滚内存布局。
  - 强化 `migrateLayoutDocument()`，确保迁移管线直接 API 返回的当前版本文档也经过最终结构校验。
  - 增加 `external-apply` 事件，并让 `VueGridLayout` / `ResponsiveVueGridLayout` 在外部更新自动应用时同步父级受控状态。
  - 用真实浏览器集成测试替代脆弱字符串静态测试，覆盖初始恢复、外部更新同步以及 drag preview 不写入。
  - 增加 `yarn test` 入口，把核心测试、组件浏览器测试和发布构建串入同一回归命令。
  _需求追溯: R3.AC4, R4.AC4, R6.AC7, R7.AC2, R8.AC2_
