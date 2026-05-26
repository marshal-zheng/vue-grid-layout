# Item Capabilities & Aspect Ratio 需求规格

## 简介

本规格定义 item 级能力与等比缩放语义，使 dashboard 文档中已经存在但尚未进入运行时闭环的 `preserveAspectRatio`、`aspectRatio`、`resizable`、`resizeHandles`、`static`、`locked` 等概念成为可验证、可诊断、可复用的能力层。

当前项目已经具备 dashboard 文档模型、responsive profile、headless editor metadata、layout engine resize operation 和 blocked diagnostics，但比例字段仍只被保留在 dashboard document 中，未参与 `LayoutItem`、resize preview、layout-engine commit 或 editor capability 解析。本规格的目标是补齐这个语义缺口，同时保持 lean core 边界：基础 `LayoutItem` 不继续堆 dashboard 产品字段，aspect ratio 与高级 item capability 通过 effective capability / resize constraint sidecar 接入 runtime 和 engine。

外部调研参考：

- React Grid Layout 使用 item 级 `static`、`isDraggable`、`isResizable`、`isBounded`、`resizeHandles` 表达基础 grid 能力。
- GridStack 区分 `locked`、`noMove`、`noResize` 等概念，说明“不能被别人推开”和“用户不能直接编辑”应分层。
- ThingsBoard 的 widget layout/settings 包含 `resizable`、`preserveAspectRatio`、mobile hide/order/height 等 dashboard item 语义，但本项目不照搬其 monkey patch 实现。
- interact.js、Moveable、Semi Resizable 等低层交互库把 aspect ratio 作为 resize constraint，而不是 resize 后的 CSS 修饰。
- CSS `aspect-ratio` 只能辅助盒模型尺寸，不足以保证 grid resize preview/commit、collision、bounds 和 persistence 一致。

## 范围与上下文锚点

- ROADMAP: `docs/specs/spec-roadmap-review.md`
- RAW_CONTEXT: `docs/raw/2026-05-19-thingsboard-dashboard-spec-planning-context.md`
- RAW_CONTEXT: `docs/raw/2026-05-21-component-library-roadmap-context.md`
- RELATED_SPEC: `docs/specs/dashboard-layout-document-adapter/`
- RELATED_SPEC: `docs/specs/responsive-dashboard-profiles/`
- RELATED_SPEC: `docs/specs/editor-multiselect-group-move-core/`
- RELATED_SPEC: `docs/specs/lean-core-bundle-boundary/`


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/LAYOUT-engine-pro/README.md
SPEC_BRIEF: docs/initiatives/LAYOUT-engine-pro/briefs/LAYOUT-item-capabilities-aspect-ratio.md

COVERAGE: item-capabilities-aspect-ratio

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| item-capabilities-aspect-ratio | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |
## Clarifications

### Session 2026-05-22

- Q: 比例约束应该进入哪里？ -> A: 不扩展基础 `LayoutItem`；通过 effective capability / resize constraint sidecar 承载比例约束，并传给 runtime 与 layout engine。
- Q: `aspectRatio` 的数值语义应该是什么？ -> A: 定义为视觉像素宽高比 `widthPx / heightPx`，不是 grid cell 的 `w / h`。
- Q: 启用 `preserveAspectRatio` 后，默认 resize handles 应该怎么处理？ -> A: 默认只允许 corner handles；edge handles 需要显式 opt-in 才能参与等比 resize。
- Q: 多来源 capability 冲突时默认优先级怎么定？ -> A: 采用分层所有权：layout/dashboard/profile 决定物理布局能力，editor metadata 只能收紧直接编辑权限，冲突输出 diagnostic。
- Q: 缺少视觉像素度量时，启用 aspect ratio 的 resize 是否允许提交？ -> A: 默认返回 blocked/degraded 且不提交；只有调用方显式允许 fallback 时才可使用 fallback 策略提交。

## 需求列表

### R1: 统一 item 能力解析模型
**用户故事:** 作为库维护者，我希望 dashboard item、responsive profile、editor metadata、layout item 和 grid defaults 能解析成一个可诊断的 effective capability，以便 drag、resize、editor command、dashboard write-back 和未来 widget registry 使用同一套语义。
**验收标准 (EARS):**
- R1.AC1: WHEN 系统需要判断 item 是否可移动、可缩放、可见、可编辑或可被选择时，系统 SHALL 通过统一 capability resolver 或等价纯函数解析 effective capability，而不是在 dashboard、editor runtime、command 和 grid interaction 中重复推导。
- R1.AC2: WHEN 输入包含 `LayoutItem.static`、`LayoutItem.isDraggable`、`LayoutItem.isResizable`、`LayoutItem.resizeHandles`、dashboard item capability、profile override、editor metadata 和 grid defaults 时，resolver SHALL 输出确定性结果，包含 `draggable`、`resizable`、`visible`、`editable`、`resizeHandles`、`static`、`locked`、`bounded`、来源列表和 diagnostics。
- R1.AC3: IF 多层来源对同一能力给出冲突值，系统 SHALL 使用文档化优先级解析，并 SHALL 输出可测试 diagnostic，不得静默覆盖。
- R1.AC4: WHEN 未启用 dashboard/editor advanced 能力时，lean `VueGridLayout` 和 lean `ResponsiveVueGridLayout` SHALL 保持现有 `LayoutItem` 与 prop defaults 行为，不要求基础用户理解 dashboard capability 类型。
- R1.AC5: WHEN capability resolver 遇到未知字段或未来 widget registry 扩展字段时，系统 SHALL 保留 JSON-safe 数据或安全忽略，并 SHALL 不破坏当前 layout projection。
- R1.AC6: WHEN 表达 aspect ratio 或 dashboard/editor 高级能力时，系统 SHALL NOT 向基础 `LayoutItem` 增加 `preserveAspectRatio`、`aspectRatio` 或其他 dashboard 产品字段；这些能力 SHALL 通过 effective capability / resize constraint sidecar 进入运行时。
- R1.AC7: WHEN layout/dashboard/profile 与 editor metadata 对物理布局能力发生冲突时，系统 SHALL 采用分层所有权：layout/dashboard/profile 决定物理布局能力，editor metadata 只能收紧直接编辑权限，不能放宽物理限制。

### R2: `static`、`locked` 与编辑能力语义分层
**用户故事:** 作为产品集成者，我希望 `static`、`locked`、`resizable: false`、`draggable: false` 的边界清晰，以便业务权限锁和布局物理约束不会混在一起。
**验收标准 (EARS):**
- R2.AC1: WHEN item 在 `LayoutItem` 或 dashboard effective item 中为 `static: true` 时，layout engine SHALL 将其视为物理固定项，阻止直接 move/resize，并在碰撞、group move、repair 和 placement 中默认作为障碍物。
- R2.AC2: WHEN item 在 editor metadata 或 capability 中为 `locked: true` 但不是 `static: true` 时，editor SHALL 阻止用户直接编辑该 item，但 layout engine SHALL NOT 默认把它当作物理障碍物。
- R2.AC3: WHEN item 为 `resizable: false` 或 effective `resizable` 为 false 时，系统 SHALL 禁用 resize handles、阻止 pointer resize 和 resize command，并返回 `capability` 或更具体的 blocked reason。
- R2.AC4: WHEN item 为 `draggable: false` 或 effective `draggable` 为 false 时，系统 SHALL 禁用 pointer drag 和 move command，但 SHALL 不因此自动禁用 resize，除非 resolver 的优先级规则明确要求。
- R2.AC5: IF 业务方需要 locked item 不能被其他 item 推开，系统 SHALL 要求同时设置或映射为 `static: true` 或等价物理固定能力，并在文档中明确 `locked` 不是安全权限边界。
- R2.AC6: WHEN editor metadata 尝试将 dashboard/profile/layout 已禁用的 `draggable`、`resizable` 或 handle policy 放宽时，系统 SHALL 保持物理限制生效，并输出 capability conflict diagnostic。

### R3: item 级 resize handle policy
**用户故事:** 作为 dashboard 编辑用户，我希望每个 item 的可缩放方向与当前能力一致，以便 UI 中显示的 handle、实际可执行的 resize 和 command diagnostics 不互相矛盾。
**验收标准 (EARS):**
- R3.AC1: WHEN item、dashboard profile、editor metadata 或 grid defaults 提供 resize handle policy 时，系统 SHALL 解析出 effective `resizeHandles`，并在 `GridItem` 渲染、pointer interaction、keyboard/API resize 和 diagnostics 中使用同一结果。
- R3.AC2: WHEN effective `resizable` 为 false 时，系统 SHALL 不显示任何 resize handle，即使上层仍传入 `resizeHandles`。
- R3.AC3: IF 多层 policy 同时声明 resize handles，系统 SHALL 采用文档化合并规则，默认不得让更宽松的下层 policy 绕过更严格的 item/profile/editor 限制。
- R3.AC4: WHEN 用户或 API 尝试通过未启用的 handle resize item 时，系统 SHALL 返回 structured blocked result，且 committed layout SHALL 保持不变。
- R3.AC5: WHEN handle policy 来自 dashboard document 或 responsive profile override 时，profile-scoped projection/write-back SHALL 保留未参与当前 runtime 的其他 profile handle policy。
- R3.AC6: WHEN item 启用 `preserveAspectRatio` 且未显式声明 aspect-ratio edge handle opt-in 时，effective `resizeHandles` SHALL 默认只包含 corner handles (`nw`、`ne`、`sw`、`se`) 与上层允许集合的交集。
- R3.AC7: WHEN item 显式 opt-in edge handles for aspect ratio resize 时，系统 SHALL 文档化 edge handle 如何推导另一轴尺寸，并 SHALL 保持 rendered handles、pointer resize 和 API command 行为一致。

### R4: aspect ratio 数据模型与来源
**用户故事:** 作为 dashboard 作者，我希望 item 可以声明是否保持宽高比以及使用哪个比例，以便视频、地图、图片、指标卡和业务可视化在 resize 时不变形。
**验收标准 (EARS):**
- R4.AC1: WHEN dashboard item 声明 `preserveAspectRatio: true` 时，系统 SHALL 在 effective capability 或 resize constraint 中启用比例约束。
- R4.AC2: WHEN dashboard item 声明合法 `aspectRatio` 时，系统 SHALL 使用该值作为目标视觉像素宽高比 `widthPx / heightPx`；WHEN 未声明 `aspectRatio` 但启用 `preserveAspectRatio` 时，系统 SHALL 使用 resize start geometry 推导当前视觉像素比例。
- R4.AC3: WHEN `aspectRatio` 非有限、<= 0、超出文档化范围或与 min/max constraints 无法兼容时，系统 SHALL 返回 validation diagnostic 或 blocked/degraded result，不得提交非法 layout。
- R4.AC4: WHEN grid cell 的视觉宽高比受 `colWidth`、`rowHeight`、margin、container padding 或 render precision 影响时，系统 SHALL 以视觉像素尺寸计算 `widthPx / heightPx` 判断比例是否满足，而不是使用简单 `w / h`。
- R4.AC5: IF 运行环境无法获得视觉像素度量，系统 SHALL 默认返回 blocked/degraded result 且 SHALL NOT 提交 resize；只有调用方显式允许 fallback 时，系统 MAY 使用文档化 fallback 策略提交，并 SHALL 输出 diagnostic。
- R4.AC6: WHEN `preserveAspectRatio` 为 false 或未设置时，resize SHALL 保持现有自由宽高行为。
- R4.AC7: WHEN layout engine 或 worker 只接收 grid geometry 时，调用方 SHALL 在 request sidecar 中提供足够的 active metrics 或已解析 ratio constraint，以便 engine 能按视觉像素比例产生确定性 grid candidate。

### R5: 等比 resize preview 与 commit 闭环
**用户故事:** 作为编辑用户，我希望拖动 resize handle 时预览和松手提交都保持同一比例，以便界面反馈与最终布局一致。
**验收标准 (EARS):**
- R5.AC1: WHEN pointer resize 一个启用比例约束的 item 时，系统 SHALL 在 preview candidate 阶段调整 `x/y/w/h`，并 SHALL 在 resize stop commit 中提交同一个 resolved geometry。
- R5.AC2: WHEN corner handle resize 启用比例约束的 item 时，系统 SHALL 根据主导轴或文档化策略推导另一轴尺寸，并保持 north/west handle 对应的 anchor 边语义。
- R5.AC3: WHEN edge handle resize 启用比例约束的 item 时，默认系统 SHALL 在未显式 opt-in 时阻止该 handle；IF 调用方显式 opt-in edge handle 等比 resize，系统 SHALL 使用文档化策略按主轴推导另一轴，并保持 rendered handles、pointer resize 和 API command 行为一致。
- R5.AC4: WHEN 等比 candidate 经过 min/max、bounds、maxRows、collision、snap 或 section/row policy 校验时，系统 SHALL 保持比例约束与这些约束的确定性顺序，并在失败时返回具体 blocked/degraded reason。
- R5.AC5: WHEN preview 被 blocked 但后续 pointer tick 恢复合法时，系统 SHALL 允许同一次 resize interaction 恢复为可提交状态，不得污染 committed layout、history 或 persistence。
- R5.AC6: WHEN legacy/disabled layout-engine path 暂不支持比例约束时，系统 SHALL 返回 structured unsupported/degraded result 或走同等语义 fallback，不得悄悄提交非等比结果。

### R6: layout engine resize constraint 支持
**用户故事:** 作为维护者，我希望 layout engine 能理解 resize 约束，而不是只由 Vue adapter 临时修正尺寸，以便 pointer、keyboard/API、worker/main-thread、dashboard shell 和测试共享同一语义。
**验收标准 (EARS):**
- R6.AC1: WHEN layout engine 执行 `resize` operation 时，request SHALL 能携带 resize constraint sidecar 或 effective capability 的必要信息，而不要求 engine 读取 editor metadata、dashboard document 或扩展后的 `LayoutItem` 字段。
- R6.AC2: WHEN resize constraint 包含 aspect ratio 时，engine SHALL 在 normalize/validate resize 阶段执行比例约束，并返回 patches、placeholder、affected ids、blocked reason 和 diagnostics。
- R6.AC3: WHEN engine resize 遇到 `static: true`、missing item、invalid input、bounds、maxRows、collision、unsupported constraint 或 impossible ratio 时，系统 SHALL 使用现有 `LayoutOperationResult` 语义或向后兼容扩展返回结果。
- R6.AC4: WHEN main-thread executor 和 worker executor 执行相同 resize request 时，系统 SHALL 产生等价 geometry、status、patches 和 diagnostics。
- R6.AC5: WHEN 未传入 aspect ratio constraint 时，engine SHALL 保持现有 resize behavior 与测试结果，除非设计阶段明确列出并批准兼容差异。

### R7: dashboard document、responsive profile 与 write-back
**用户故事:** 作为 dashboard 集成者，我希望 capability 和 aspect ratio 能在 dashboard document 与 responsive profile 中被保存、投影和回写，以便不同 breakpoint 的 item 行为可以独立配置而不破坏其他 profile。
**验收标准 (EARS):**
- R7.AC1: WHEN dashboard document 投影 runtime layout 时，系统 SHALL 保留 `preserveAspectRatio`、`aspectRatio`、`resizable`、`draggable`、`resizeHandles`、`static`、`bounded` 等 item capability，并将运行时需要的部分投影为 effective capability 或 constraint sidecar。
- R7.AC2: WHEN profile override 只覆盖部分 capability 字段时，系统 SHALL 继承 default item 未覆盖字段，并 SHALL 在 diagnostics 中区分 inherited、overridden、conflict、unsupported/ignored 字段。
- R7.AC3: WHEN committed resize/move 改变 dashboard item 几何或明确 capability 字段时，write-back SHALL 只更新目标 default layout 或 active profile override，不得 materialize 未参与编辑的 profile。
- R7.AC4: WHEN active runtime 来自 missing profile fallback 且 mode 为 edit 时，系统 SHALL 继续遵守现有 missing-profile write blocking 或 explicit create-missing policy，不得因 aspect ratio write-back 隐式创建 profile。
- R7.AC5: WHEN ThingsBoard import/export 遇到 `preserveAspectRatio` 或 `aspectRatio` 时，系统 SHALL 保留字段并映射到本项目的 dashboard item semantics，但 SHALL NOT 依赖 ThingsBoard 字段名作为核心 `LayoutItem` API。
- R7.AC6: IF write-back 或 validation 失败，系统 SHALL 返回 structured error/diagnostic，并 SHALL 不覆盖调用方 document。

### R8: editor command、toolbar state 与 diagnostics
**用户故事:** 作为应用开发者，我希望 editor command 和 toolbar 能知道某个 item 为什么不能 resize 或为什么必须等比 resize，以便 UI 可以解释禁用态和失败原因。
**验收标准 (EARS):**
- R8.AC1: WHEN `canExecute()`、toolbar state 或 command availability 评估 resize/move/copy/delete/duplicate 等操作时，系统 SHALL 使用统一 effective capability，并暴露 disabled reason、blocked ids、required capability 和 message key。
- R8.AC2: WHEN resize command 或 pointer resize 因 `locked`、`static`、`resizable: false`、handle policy、aspect ratio impossible、bounds、collision 或 missing metrics 被阻止时，系统 SHALL 返回结构化 blocked/degraded diagnostics。
- R8.AC3: WHEN aspect ratio 改变 resize candidate 时，command result 或 interaction diagnostics SHALL 暴露 ratio source、target ratio、resolved geometry、handle policy、constraint order 和是否降级。
- R8.AC4: WHEN measurement HUD、guides 或 placement overlay 消费 resize diagnostics 时，系统 SHALL 能显示位置、尺寸、比例和 blocked reason，但 SHALL 不要求核心 grid 依赖示例 UI。
- R8.AC5: WHEN commandPolicy 为 `skip-blocked` 或 `all-or-nothing` 时，系统 SHALL 对 mixed selection 的 capability filtering 使用既有 command policy 语义，并保持 history/persistence 只记录实际 committed 变化。
- R8.AC6: WHEN resize 因缺少视觉像素度量而 blocked/degraded 时，command result、interaction diagnostics 和可访问消息 SHALL 明确说明需要 metrics 或显式 fallback policy，且 committed layout SHALL 保持不变。

### R9: public API、类型与 lean boundary
**用户故事:** 作为库使用者，我希望新增 capability/aspect ratio 能力通过明确类型和入口暴露，同时不破坏 2.0 lean root/core/responsive 的边界。
**验收标准 (EARS):**
- R9.AC1: WHEN 新增 effective capability、aspect ratio constraint、resize diagnostics 或 dashboard projection 类型时，系统 SHALL 同步更新源码类型、生成类型声明、CJS/ESM subpath exports 和 README/MCP 数据。
- R9.AC2: WHEN root/core/responsive lean entry 构建时，系统 SHALL NOT 因本规格把 editor、dashboard、persistence、history、Pinia 或 widget registry runtime 静态带回基础 closure。
- R9.AC3: WHEN advanced dashboard/editor wrapper 需要 capability resolver 时，resolver SHALL 位于合适的 shared 或 advanced subpath，且 SHALL 不让 lean components 反向依赖 dashboard/editor runtime。
- R9.AC4: WHEN 旧用户只使用 `LayoutItem.isResizable`、`LayoutItem.resizeHandles` 或 `static` 时，系统 SHALL 保持现有行为或提供明确 migration note。
- R9.AC5: WHEN TypeScript 用户配置非法 `aspectRatio`、非法 handle 或冲突 capability 时，常见错误 SHOULD 在类型层面可见，运行时仍 SHALL 返回 validation/diagnostic。

### R10: Dogfood Workbench、测试矩阵与非目标
**用户故事:** 作为维护者，我希望通过真实场景 workbench 和测试矩阵验证能力语义，以便 spec 不停留在类型定义或单一路径 demo。
**验收标准 (EARS):**
- R10.AC1: WHEN 实现本规格时，系统 SHALL 提供或更新一个 capability/aspect-ratio dogfood workbench，使用公开 API 覆盖 16:9 视频卡、1:1 图片/Logo 卡、不可 resize KPI、locked 但非 static 卡、static anchor 卡、profile override 卡和 invalid ratio 卡。
- R10.AC2: WHEN 编写单元测试时，系统 SHALL 覆盖 resolver 优先级、conflict diagnostics、handle policy merge、ratio source、invalid ratio、visual ratio metrics、missing metrics default block、explicit fallback opt-in、min/max、bounds、maxRows、collision、static/locked/resizable false、main-thread/worker 等价和 write-back immutability。
- R10.AC3: WHEN 编写 component/browser 或 headless interaction 测试时，系统 SHALL 覆盖 resize preview/commit 同比例、north/west handle anchor、blocked 后恢复、handle DOM/disabled state、toolbar disabled reason 和 measurement/HUD diagnostic。
- R10.AC4: WHEN 更新文档时，系统 SHALL 说明 `locked` vs `static`、`resizable: false`、`resizeHandles`、`preserveAspectRatio`、`aspectRatio`、profile override 和 lean boundary 的推荐用法。
- R10.AC5: WHEN 本规格完成时，系统 SHALL 运行相关单元测试、类型检查、package boundary/bundle checks 和现有 grid/editor/dashboard 回归命令，至少覆盖仓库约定的标准验证集合中与本变更相关的命令。
- R10.AC6: IF 本规格涉及 group resize、nested grids、inter-grid drag、full Editor Kit UI、Widget Registry schema、AI/MCP dashboard assistant 或业务 widget config，系统 SHALL 将其记录为非目标或后续规格，不得在本规格中顺手实现。
