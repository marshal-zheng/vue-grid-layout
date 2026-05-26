# Widget Registry Protocol 需求规格

## 简介

本规格定义 dashboard widget registry 的 API-first 协议，使 widget 类型定义、模板生成、默认布局、能力约束、settings descriptor、实例元数据、diagnostics 与 dashboard editor shell 的添加/复制/粘贴链路拥有统一、可测试、可扩展的契约。

当前项目已经具备 dashboard document、responsive profile、dashboard editor shell、palette/add widget template、widget/reference adapter、placement session 和即将实现的 item capability/aspect ratio sidecar，但 widget 类型本身仍是应用层临时约定。本规格只冻结 registry 协议和 headless 集成，不实现完整 Editor Kit UI、真实业务 widget renderer、远程插件市场或 AI/MCP dashboard assistant。

外部调研参考：

- WordPress block metadata 通过 `block.json` 声明 block 名称、属性、supports、编辑器脚本和样式，说明 registry 应区分元数据、属性 schema 与 editor/runtime assets。
- Grafana `plugin.json` 使用稳定 id、type、info、dependencies、lifecycle state、keywords 与 schema validation，说明 widget type 需要稳定身份、搜索元数据、状态和兼容性信息。
- ThingsBoard widget API 提供 settings schema，说明 dashboard widget 协议应把 settings descriptor 作为核心，而不是让 inspector UI 猜测 payload。
- GrapesJS Block Manager 区分可添加的 block 与已经实例化的 canvas component，说明 palette/template 与 dashboard widget instance 应分层。
- Backstage frontend extension 架构强调 attachment/input/output/feature flag/permission 等扩展边界；本规格只吸收结构化扩展点思想，不实现完整插件运行时。

## 来源与范围锚点

- ROADMAP: `docs/specs/spec-roadmap-review.md`
- RAW_CONTEXT: `docs/raw/2026-05-21-component-library-roadmap-context.md`
- RELATED_SPEC: `docs/specs/item-capabilities-aspect-ratio/`
- RELATED_SPEC: `docs/specs/dashboard-editor-shell-integration/`
- RELATED_SPEC: `docs/specs/dashboard-editor-shell-placement-policies/`
- RELATED_SPEC: `docs/specs/dashboard-layout-document-adapter/`
- RELATED_SPEC: `docs/specs/responsive-dashboard-profiles/`
- RELATED_SPEC: `docs/specs/lean-core-bundle-boundary/`


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/WIDGET-product-extension/README.md
SPEC_BRIEF: docs/initiatives/WIDGET-product-extension/briefs/WIDGET-widget-registry-protocol.md

COVERAGE: widget-registry-protocol

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| widget-registry-protocol | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |
## Clarifications

### Session 2026-05-22

- Q: 下一个 spec 应该偏协议/API 还是偏可见 UI kit？ -> A: 选择 API-first registry protocol；dogfood workbench 作为验收，不做完整 UI kit。
- Q: registry 是否要包含 widget renderer？ -> A: 不包含真实 renderer；仅允许可选 render adapter/type metadata 作为上层消费线索。
- Q: registry 是否要执行第三方代码或提供远程插件市场？ -> A: 不执行第三方代码，不加载远程插件包，不做权限沙箱；只定义本地/应用提供的 JSON-safe type definition 与 headless helper。
- Q: capability/aspect ratio 与 registry 的关系是什么？ -> A: registry 声明 widget type 默认 layout/capability，实际解析继续复用 `item-capabilities-aspect-ratio` 的 effective capability/constraint sidecar。
- Q: settings descriptor 是否允许任意 JS condition？ -> A: 不允许；使用 JSON-safe declarative predicate，避免 inspector、MCP 和 persistence 依赖不可序列化函数。
- Q: widget instance metadata 的主存储位置放哪里？ -> A: 放在每个 dashboard item 的 `extensions.widget` 中；layout-level sidecar 不作为本规格主写路径。
- Q: widget registry 的公开入口放哪里？ -> A: 新增独立 `./widget-registry` subpath；dashboard/editor shell 通过 adapter 或显式导入消费，不把 registry 混进 lean root/core/responsive。
- Q: settings descriptor 的字段类型范围先做到哪一级？ -> A: 采用常用结构类型：基础类型加 `color`、`text`、`json`、`object`、`array`、`ref` 等有限类型；不承诺完整 JSON Schema 子集。
- Q: registry 对 widget type `version` 的语义做到哪一级？ -> A: `version` 使用 SemVer 字符串并参与兼容、废弃、replacement 与 migration diagnostics；registry 不执行自动业务迁移。
- Q: registry 的渲染相关信息允许到什么程度？ -> A: 只允许 JSON-safe renderer hint，例如 `rendererKey`、`componentKey`、`slot` 等字符串 metadata；registry 不保存组件对象、函数或 renderer resolver。

## 需求列表

### R1: Widget Type Registry 核心协议
**用户故事:** 作为库维护者，我希望 widget 类型能通过稳定 registry 协议注册、查询和验证，以便 dashboard shell、palette、inspector、migration 和 AI/MCP 后续能力共享同一份 widget 语义。
**验收标准 (EARS):**
- R1.AC1: WHEN 应用注册 widget type 时，系统 SHALL 接受 `type`、`version`、`title`、`description`、`category`、`tags`、`icon`、`status`、`layoutDefaults`、`settings`、`dataRequirements`、`rendererHint`、`extensions` 等 JSON-safe 定义。
- R1.AC2: WHEN widget type `type` 缺失、为空、格式非法或重复注册且未显式允许覆盖时，registry SHALL 返回 structured diagnostic，不得静默覆盖已有定义。
- R1.AC3: WHEN 查询 widget type 时，registry SHALL 提供按 `type` 精确查询、按 category/tag/status/searchText 过滤、稳定排序和 include/exclude deprecated/hidden 的列表能力。
- R1.AC4: WHEN widget type definition 包含未知字段时，registry SHALL 保留 JSON-safe extension metadata 或安全忽略，并 SHALL 不破坏已知字段解析。
- R1.AC5: WHEN registry 被创建为空或某 type 不存在时，查询 SHALL 返回明确的 `unknown-widget-type` diagnostic，而不是抛出未捕获异常。
- R1.AC6: WHEN widget type 标记为 `experimental`、`deprecated` 或 `hidden` 时，registry SHALL 在 list/resolve/template materialization 结果中暴露 lifecycle diagnostics，使 palette/UI 可以决定展示策略。
- R1.AC7: WHEN widget type 声明 `version` 时，系统 SHALL 将其视为 SemVer 字符串；非法 version SHALL 产生 validation diagnostic，合法 version SHALL 可用于 compatibility、deprecated、replacement 和 migration diagnostics。
- R1.AC8: WHEN widget type 声明渲染相关信息时，系统 SHALL 只接受 JSON-safe renderer hint，例如 `rendererKey`、`componentKey`、`slot` 或 extensions 中的字符串 metadata；registry SHALL NOT 保存组件对象、函数、Vue ref、DOM node 或 renderer resolver。

### R2: Widget Template 与实例物化协议
**用户故事:** 作为 dashboard 集成者，我希望 registry 能从 widget type 生成可放置的 widget template，并把 template 物化成 dashboard item 与 widget instance sidecar，以便 palette/add/drop/copy/paste 不再依赖手写临时 payload。
**验收标准 (EARS):**
- R2.AC1: WHEN 调用方请求创建 widget template 时，系统 SHALL 使用 widget type 的 layout defaults、settings defaults、bindings defaults、label 和 metadata 生成 `DashboardEditorShellWidgetTemplate` 兼容对象。
- R2.AC2: WHEN template 被添加到 dashboard 时，系统 SHALL 生成 runtime layout item 几何、editor metadata，并将 widget instance metadata 写入目标 dashboard item 的 `extensions.widget`；widget type 字段 SHALL NOT 写入基础 `LayoutItem`。
- R2.AC3: WHEN materialize template 时需要 id，系统 SHALL 支持调用方提供 id、使用 shell `idGenerator`、或基于 type 生成稳定可读 id，并 SHALL 避免与现有 item id 冲突。
- R2.AC4: WHEN template 覆盖 type default 的 layout/settings/capability 字段时，系统 SHALL 按文档化优先级合并，并输出 override/conflict diagnostics。
- R2.AC5: WHEN template 指向 unknown/deprecated/invalid widget type 时，系统 SHALL 根据 severity 返回 blocked、warning 或 degraded result，且不得写坏调用方 document。
- R2.AC6: WHEN 已有 dashboard item 缺少 widget instance metadata 时，registry validation SHALL 能将其识别为 `untyped-layout-item`，并允许调用方选择只警告或要求迁移。

### R3: Layout Defaults 与 Item Capability 集成
**用户故事:** 作为 widget 作者，我希望每类 widget 能声明默认尺寸、min/max、resize handles、draggable/resizable/static 和 aspect ratio 等布局能力，以便添加 widget 时默认行为符合业务语义。
**验收标准 (EARS):**
- R3.AC1: WHEN widget type 声明 `layoutDefaults` 时，系统 SHALL 支持 `w/h`、`minW/minH/maxW/maxH`、`static`、`draggable`、`resizable`、`bounded`、`resizeHandles`、`preserveAspectRatio`、`aspectRatio` 和 extensions。
- R3.AC2: WHEN `item-capabilities-aspect-ratio` 提供 effective capability/resize constraint sidecar 时，registry SHALL 复用该能力模型或可桥接类型，不得再定义一套冲突的 capability 语义。
- R3.AC3: WHEN type default、template override、dashboard profile override 和 editor metadata 同时存在时，系统 SHALL 输出 deterministic merge result，并 SHALL 明确来源优先级和 conflict diagnostics。
- R3.AC4: WHEN layout defaults 包含非法尺寸、非法 handle、非法 aspect ratio 或与 min/max 不兼容的配置时，registry SHALL 返回 validation diagnostic，并 SHALL 不生成非法 runtime layout item。
- R3.AC5: WHEN widget type 没有声明 layout defaults 时，系统 SHALL 使用文档化 fallback size，并输出 info diagnostic，避免 palette/add 行为依赖隐藏常量。

### R4: Settings Descriptor 与实例 Settings 校验
**用户故事:** 作为应用开发者，我希望 widget settings 通过结构化 descriptor 描述，以便 inspector、默认值生成、validation、migration 和 AI/MCP introspection 能共享同一份配置模型。
**验收标准 (EARS):**
- R4.AC1: WHEN widget type 声明 settings descriptor 时，系统 SHALL 支持 field id、label/labelKey、description、type、defaultValue、required、group、order、options、validation、visibility predicate 和 extensions；field type SHALL 覆盖 `string`、`number`、`boolean`、`enum`、`color`、`text`、`json`、`object`、`array`、`ref` 等有限常用类型。
- R4.AC2: WHEN 生成 template 或实例时，系统 SHALL 根据 settings descriptor 生成默认 settings，并 SHALL 保留调用方显式传入的合法 settings。
- R4.AC3: WHEN settings value 类型错误、必填缺失、超出 enum/range/pattern 或违反 JSON-safe 约束时，系统 SHALL 返回 field-level diagnostics，包含 widget type、field id、path 和 severity。
- R4.AC4: WHEN settings descriptor 需要条件展示或启用时，系统 SHALL 使用 JSON-safe declarative predicate；系统 SHALL NOT 在 descriptor 中要求函数、DOM、Vue ref 或不可序列化对象。
- R4.AC5: WHEN descriptor 版本升级或字段废弃时，系统 SHALL 能标记 field lifecycle state，并 SHALL 允许 migration helper 根据 descriptor 输出 warning/deprecated/replacement diagnostics。
- R4.AC6: WHEN settings 包含 descriptor 未声明字段时，系统 SHALL 根据 policy 保留 JSON-safe unknown settings、清理危险 key 或报告 diagnostic，不得原地修改输入对象。
- R4.AC7: WHEN settings descriptor 使用 `object`、`array` 或 `json` 类型时，系统 SHALL 只承诺 JSON-safe、默认值、required、轻量 validation 和 field-level diagnostics；系统 SHALL NOT 承诺完整 JSON Schema、`oneOf`、`anyOf`、复杂递归 schema 或外部 validator runtime。

### R5: Dashboard Document 与 Widget Instance Sidecar
**用户故事:** 作为 dashboard 文档维护者，我希望 widget registry 信息保存在每个 dashboard item 的 `extensions.widget` 中，以便 layout geometry、editor metadata 和 widget 业务配置不会互相污染。
**验收标准 (EARS):**
- R5.AC1: WHEN dashboard item 被 registry materialize 时，系统 SHALL 在 `DashboardItemLayout.extensions.widget` 中保存 `widgetType`、`widgetVersion`、`templateId`、`settings`、`bindings`、`payload` 和 migration metadata；layout-level sidecar SHALL NOT 作为本规格主写路径。
- R5.AC2: WHEN project dashboard runtime layout 时，系统 SHALL 继续只把基础 geometry/capability 映射为 `LayoutItem` 字段，widget type/settings/payload SHALL NOT 进入基础 `LayoutItem`。
- R5.AC3: WHEN write-back 普通 move/resize 结果时，系统 SHALL 只更新几何和已有 capability 字段，不得意外重写 widget settings、bindings、payload 或未知 extensions。
- R5.AC4: WHEN profile override 只修改 layout/capability 而不修改 widget settings 时，write-back SHALL 只 materialize 目标 profile override，不得复制整份 widget instance 到未参与编辑的 profiles。
- R5.AC5: WHEN document 中存在 unknown widget type 或 registry 缺失时，projection/validation SHALL 保留原始 `extensions.widget` 内容，并输出 recoverable diagnostic。
- R5.AC6: WHEN import/export ThingsBoard-like、Grafana-like 或 legacy custom metadata 时，registry SHALL 提供 adapter-friendly metadata slots，但 SHALL NOT 把第三方字段名作为核心 `LayoutItem` API。

### R6: Dashboard Editor Shell 集成
**用户故事:** 作为 dashboard editor shell 使用者，我希望 registry 能接入现有 palette/add/copy/paste/reference adapter 链路，以便 shell 操作可以消费 widget type 与 template 协议，而不要求 UI kit 已经存在。
**验收标准 (EARS):**
- R6.AC1: WHEN shell 调用 `openWidgetPalette()` 时，registry SHALL 能提供 palette-friendly item list，包括 type、title、category、tags、icon、description、status、default size 和 diagnostics。
- R6.AC2: WHEN shell 调用 `addWidgetFromTemplate()` 时，registry-generated template SHALL 能走现有 placement、command、write-back 和 adapter transaction 路径。
- R6.AC3: WHEN widget adapter 提供 `prepareAddWidget`、`preparePasteWidget`、`prepareDuplicateWidget` 或 `prepareRemoveWidget` 时，registry SHALL 能把 widget type/instance metadata 放入 adapter context 或 prepared mutation metadata。
- R6.AC4: WHEN copy/paste/duplicate widget 时，registry SHALL 支持按 policy 克隆 settings、bindings、payload 和 references，并 SHALL 输出 idMap/sourceIds/newIds diagnostics。
- R6.AC5: WHEN shell 缺少 registry 或 palette adapter 时，现有手写 template 路径 SHALL 保持兼容，并输出 adapter/registry unavailable diagnostic。
- R6.AC6: WHEN placement 被 collision、bounds、maxRows、profile write blocking 或 capability 约束阻止时，registry 集成 SHALL 透传现有 shell/layout diagnostics，不得吞掉底层 blocked reason。

### R7: Diagnostics、Validation 与迁移入口
**用户故事:** 作为维护者，我希望 registry 对 type、template、instance、settings 和 document 状态提供统一 diagnostics，以便测试、debug panel、migration 和未来 AI/MCP 工具都能解释问题。
**验收标准 (EARS):**
- R7.AC1: WHEN registry validation 运行时，系统 SHALL 输出 machine-readable diagnostics，至少包含 code、level、message、type、itemId、fieldId、path、profileId、details。
- R7.AC2: WHEN 发现 unknown widget type、duplicate type、invalid template、invalid settings、deprecated field、capability conflict、missing data requirement 或 unsafe extension key 时，系统 SHALL 使用稳定 diagnostic code。
- R7.AC3: WHEN validation policy 为 strict 时，error diagnostics SHALL 阻止 template materialization 或 document write-back；WHEN policy 为 tolerant 时，系统 SHALL 尽量保留原始 JSON-safe 数据并输出 warning。
- R7.AC4: WHEN registry 支持 migration helper 时，系统 SHALL 能基于 widget type version 与 descriptor version 输出 proposed patch、replacement hint 或 migration diagnostic，但本规格 SHALL NOT 自动执行业务数据迁移。
- R7.AC5: WHEN diagnostics 暴露给 UI/MCP 时，系统 SHALL 避免泄露业务私密 payload；默认只输出字段路径、类型、几何摘要、reason 和必要 id。

### R8: Public API、Exports 与 Lean Boundary
**用户故事:** 作为库使用者，我希望 widget registry 通过独立 `./widget-registry` subpath 暴露，同时不污染 lean root/core/responsive 包边界，以便基础 grid 用户不承担 dashboard/editor/widget 协议成本。
**验收标准 (EARS):**
- R8.AC1: WHEN 新增 widget registry 类型、helper、diagnostics 或 adapters 时，系统 SHALL 通过 `./widget-registry` subpath 暴露，并同步更新源码导出、类型声明、package exports、CJS/ESM entry 和 package consumer tests。
- R8.AC2: WHEN root/core/responsive 构建时，系统 SHALL NOT 因 widget registry 把 dashboard editor shell、Vue UI components、persistence、Pinia、renderer 或业务 widget runtime 静态带入基础 closure。
- R8.AC3: WHEN dashboard/editor shell 需要 registry 时，系统 SHALL 通过 `./widget-registry` 显式 subpath 或 dashboard/editor-facing adapter 引用，不得让 lean `VueGridLayout` 反向依赖 registry。
- R8.AC4: WHEN 应用只使用现有 `DashboardEditorShellWidgetTemplate`、`palette.open` 或 `widgetAdapter` 时，系统 SHALL 保持兼容，或提供明确 migration note。
- R8.AC5: WHEN 文档化 registry import path 时，系统 SHALL 推荐 `@marsio/vue-grid-layout/widget-registry`，并说明 `./dashboard`、`./editor`、`./dashboard-editor-shell` 与 `./widget-registry` 的责任边界，避免 barrel 循环依赖。

### R9: Dogfood Workbench 与测试矩阵
**用户故事:** 作为维护团队，我希望通过真实但轻量的 widget registry dogfood 验证协议，以便 spec 不停留在类型定义，且后续 UI kit 能直接消费公开 API。
**验收标准 (EARS):**
- R9.AC1: WHEN 实现本规格时，系统 SHALL 提供或更新 headless dogfood workbench，使用公开 API 注册 KPI、line chart、table、markdown、image/video、map/iframe 和 invalid widget type。
- R9.AC2: WHEN dogfood 添加 widget 时，系统 SHALL 覆盖 palette list、template creation、placement、default settings、layout defaults、capability defaults、document sidecar 和 diagnostics 可观察性。
- R9.AC3: WHEN 编写单元测试时，系统 SHALL 覆盖 registry register/resolve/list、duplicate type、unknown type、lifecycle state、settings defaults、validation、dangerous key cleaning、template materialization 和 immutable document write-back。
- R9.AC4: WHEN 编写 shell/headless interaction 测试时，系统 SHALL 覆盖 registry template 接入 `addWidgetFromTemplate()`、adapter prepared mutation metadata、copy/paste/duplicate idMap、profile write-back 保持 widget sidecar。
- R9.AC5: WHEN 更新 docs 时，系统 SHALL 说明 registry API-first 边界、与 item capability 的关系、settings descriptor 写法、diagnostic policy、legacy template 兼容和后续 Editor Kit 消费方式。
- R9.AC6: WHEN 本规格涉及 exports/types/package boundary 时，系统 SHALL 运行 package 和 bundle 检查，确认 lean boundary 未回流。

### R10: 非目标与后续扩展边界
**用户故事:** 作为项目规划者，我希望 widget registry 协议清楚区分当前范围和未来扩展，以便不会把 UI kit、业务 renderer、插件市场或 AI 助手混进本规格。
**验收标准 (EARS):**
- R10.AC1: WHEN 本规格完成时，系统 SHALL NOT 实现完整 toolbar、outline、inspector、context menu renderer、command palette、empty dashboard UI 或 diagnostics panel；这些属于后续 `editor-kit-ui-components`。
- R10.AC2: WHEN 本规格完成时，系统 SHALL NOT 实现真实业务 widget renderer、图表库绑定、数据查询运行时、远程插件加载、第三方代码执行、renderer resolver 或 sandbox 权限隔离。
- R10.AC3: WHEN 本规格完成时，系统 SHALL NOT 实现 AI/MCP dashboard assistant、自动生成 dashboard、layout lint MCP tool 或 widget registry introspection MCP；但 SHALL 保持 registry definition JSON-safe，便于未来读取。
- R10.AC4: WHEN 本规格完成时，系统 SHALL NOT 实现 nested grids、inter-grid drag、group resize、custom compactor 或 layout engine pro 行为；这些只可作为 widget capability hints 或后续 spec 依赖。
- R10.AC5: WHEN 后续 Editor Kit 或 AI/MCP spec 消费 registry 时，系统 SHALL 能引用本规格的 type/template/settings/diagnostic 协议，而不是重新定义 widget schema。
