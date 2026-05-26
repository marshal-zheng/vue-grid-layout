# Dashboard Layout Document & Adapter 实现任务

- [x] 1. 新增 dashboard 核心模块与文档类型
  - 新建 `lib/dashboard.ts`，定义 `DASHBOARD_SCHEMA_VERSION`、`DashboardLayoutDocument`、`DashboardLayoutDefinition`、`DashboardItemLayout`、`DashboardGridSettings`、`DashboardBreakpointProfile`、`DashboardEditorEnvelope`、`DashboardDiagnostic` 等核心类型。
  - 将第一版 runtime 目标限定为 `primaryLayoutId` 指向的单个 primary/default layout，同时保留 `layouts` map 作为未来多 layout 区域扩展位。
  - 定义 JSON-safe extension/meta 类型和文档 clone 工具，确保未知字段可以被保留但不参与执行。
  - 明确 dashboard schema 使用 `dashboardSchemaVersion`，不复用 `layoutSchemaVersion`，也不把主 schema 放进 `LayoutPersistenceDocument.meta.dashboard`。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC5, R1.AC6, R1.AC7, R5.AC1, R5.AC8_

- [x] 2. 实现 dashboard 序列化、反序列化、校验和迁移
  - 实现 `serializeDashboardLayoutDocument()`、`deserializeDashboardLayoutDocument()`、`validateDashboardLayoutDocument()`、`migrateDashboardLayoutDocument()`。
  - 默认使用 strict 校验；只有调用方显式传入 `validation: 'sanitize'` 时才启用确定性恢复。
  - 在 strict 失败时返回原始 payload、错误路径和 diagnostics，不生成 runtime projection，也不覆盖调用方已有状态。
  - 实现 migration map 顺序执行、缺失 migration、migration 抛错和迁移后校验失败的错误路径。
  - 实现 sanitize 的有限恢复：负坐标 clamp、非正尺寸 clamp、非法 resize handle 丢弃、orphan editor metadata 隔离或清理、非 JSON-safe extension warning。
  _需求追溯: R1.AC4, R1.AC5, R3.AC6, R5.AC2, R5.AC5, R5.AC7, R8.AC1_

- [x] 3. 实现 dashboard document 到 grid runtime 的投影
  - 实现 `projectDashboardLayoutDocument()`，输出单个 runtime `layout`、resolved grid settings、`editorMetaById`、fallback 信息和 diagnostics。
  - 将 `col/row/sizeX/sizeY` 确定性映射为 `LayoutItem.x/y/w/h`，只把当前基础 grid 支持的几何和交互字段写入 `LayoutItem`。
  - 保留 `mobileOrder`、`mobileHeight`、`desktopHide`、`mobileHide`、`preserveAspectRatio`、`aspectRatio` 和 grid settings 等 dashboard 字段，不写入 `LayoutItem`。
  - 支持调用方显式传入 `profileId` 或 `breakpoint` id；缺失或不存在时 fallback 到 primary/default layout，不做 viewport width 自动匹配。
  - 通过 `editorMetaById.visible` 或等价 sidecar 表达 desktop/mobile visibility，通过 `isResizable` 和 `editorMetaById.resizable` 表达 `resizable: false`。
  - 按 `row`、`col`、id 稳定排序，保证同一合法 document 多次投影结果稳定。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R6.AC1, R6.AC4, R6.AC5_

- [x] 4. 实现 grid runtime 到 dashboard document 的回写
  - 实现 `writeDashboardRuntimeToDocument()`，从 committed runtime `layout` 和可选 `editorMetaById` 回写 dashboard document。
  - 将 `LayoutItem.x/y/w/h` 回写为 `col/row/sizeX/sizeY`，并将 min/max 与明确映射的 capability 字段写回对应 dashboard item 或 profile。
  - 对 `profileId` 回写执行 profile-scoped 更新，避免覆盖其他 profiles 或 primary/default layout。
  - 只把有明确 dashboard 产品语义映射的 editor metadata 写回 dashboard item/profile；未映射 metadata 保留在 editor sidecar。
  - 保留 widget id、unknown fields、extensions、profile 未解析字段和非布局业务引用。
  - 对 unknown runtime item 支持 `createMissingItems` 显式新增，否则返回 `unknown-item` diagnostic；函数不得原地修改输入。
  _需求追溯: R1.AC4, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R6.AC2, R6.AC3, R6.AC4, R6.AC5_

- [x] 5. 定义 dashboard persistence adapter 类型和事件结果
  - 定义 `DashboardPersistenceAdapter`、`DashboardPersistenceExternalChange`、dashboard load/save/remove result 和 conflict diagnostic 类型。
  - 复用现有 adapter-first 语义表达 `load`、`save`、`remove` 和可选 `subscribe`，但 I/O document 类型必须是 `DashboardLayoutDocument`。
  - 明确第一版不实现 `useDashboardLayoutPersistence()`、组件级 `persistence` prop 或 Vue 状态机。
  - 为 subscribe/external change 事件保留 local/external dashboard document 信息，供后续 editor shell 或业务层做冲突处理。
  _需求追溯: R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC8, R8.AC1_

- [x] 6. 实现 ThingsBoard 风格导入导出 adapter
  - 实现 `importThingsBoardDashboardLayout()`，将 ThingsBoard 风格 `widgets`、`gridSettings`、`breakpoints` 转为 `DashboardLayoutDocument`。
  - 实现 `exportThingsBoardDashboardLayout()`，从 `DashboardLayoutDocument` 输出兼容的 `widgets`、`gridSettings`、`breakpoints` 结构。
  - 映射 `WidgetLayout` 的 `col/row/sizeX/sizeY/desktopHide/mobileHide/mobileHeight/mobileOrder/resizable/preserveAspectRatio` 字段。
  - 映射 `GridSettings` 的 columns、margin、outerMargin、viewFormat、rowHeight、autoFillHeight、mobileRowHeight、mobileAutoFillHeight 和 layout dimension 字段。
  - 将 ThingsBoard 业务 widget config、alias、timewindow、filter、alarm、toolbar 等非基础布局字段放入 extensions 或标记为 deferred/unsupported diagnostic。
  _需求追溯: R1.AC2, R1.AC3, R2.AC4, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5_

- [x] 7. 接入公共导出和类型声明
  - 在 `lib/cjs.ts` 导出 dashboard namespace、schema 常量和核心函数。
  - 在 `typings/index.d.ts` 增加 dashboard document、settings、item layout、profile、adapter、projection/write result 和 diagnostics 类型声明。
  - 确保 dashboard 核心可以被消费者独立导入，不要求导入 Vue 组件或 Vue composable。
  - 确认不使用 dashboard module 时，现有基础 layout persistence、editor persistence bridge 和组件 prop 类型不发生破坏性变更。
  _需求追溯: R2.AC3, R5.AC8, R8.AC3, R8.AC6_

- [x] 8. 增加 dashboard 核心测试与运行入口
  - 新增 `test/dashboard-core.test.ts`，覆盖合法文档 round-trip、unknown field preservation、strict validation failure、sanitize recovery 和 migration 失败路径。
  - 覆盖 projection 的 default/profile fallback、desktop/mobile visibility、`resizable: false`、稳定排序和 unsupported field diagnostics。
  - 覆盖 write-back 的几何回写、profile-scoped 回写、immutability、unknown item create/error、editor sidecar preservation。
  - 覆盖 ThingsBoard import/export 字段映射和业务字段 extensions/deferred diagnostics。
  - 新增 `test/run-dashboard-tests.js`，并把 dashboard 测试接入合适的 npm test 脚本。
  _需求追溯: R1.AC4, R1.AC5, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R5.AC2, R5.AC5, R5.AC7, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R8.AC1, R8.AC2, R8.AC3_

- [x] 9. 更新文档和示例片段，说明边界与后续扩展
  - 在合适的文档位置补充 dashboard document adapter 用法示例，展示如何投影到现有 `VueGridLayout` 或 editor controller。
  - 明确第一版不是 Vue 状态机、不接组件 prop、不实现 mobile/list 渲染、高度模式、pixel precision、collision repair、context menu、widget palette 或业务数据源。
  - 记录后续 specs 如何基于 document/profile/adapter 边界继续扩展 responsive profile、aspect ratio、height mode 和 editor shell。
  _需求追溯: R8.AC4, R8.AC5, R8.AC6_
