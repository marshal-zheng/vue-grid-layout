# Grid 交互状态机需求规格

## 简介

当前 grid item 的 pointer 交互由 `useGridItemDrag`、`useGridItemResize`、`useGridDragResizeInteractions`、`useGridDropInteractions`、editor runtime 和 layout engine bridge 共同完成。现有实现可以支撑拖拽、缩放、多选组移动、drop preview、guides、blocked feedback、history 和 persistence，但 click-like drag、零位移 drag tick、resize/drop 与 drag 的清理路径仍分散在多个模块中。

本规格采用完整交互状态机方案，将 click、drag、resize、external drop、blocked interaction、preview、commit、cancel 和 cleanup 表达为可观察、可测试的有限状态流。目标是从源头区分点击与拖动，避免紫色 guide、placeholder、history、layout engine preview、persistence 或 blocked feedback 被错误触发，并为后续 editor 高级能力提供稳定边界。

本规格不包含新增框选、批量 resize、多选 bounding box 可视化、toolbar 功能、样式重设计或业务 dashboard adapter 行为。相关能力可以复用本状态机，但不在本轮交互基础设施改造中实现。

## 调研基准与现状对比

- `tldraw` 将选择、绘制、平移、resize 等工具组织为层级状态机，输入事件由当前 active tool 和 active child state 处理；同时提供 mouse/touch/UI 不同 drag distance threshold。
- `dnd-kit` 的 Mouse/Pointer sensor 提供 distance 与 delay activation constraint，明确要求达到激活条件后才发出 drag start。
- `React-Grid-Layout v2` 将 `onDragStart` 从 mousedown 改为移动超过阈值后触发，并将 drag、resize、grid、compactor 拆成组合式配置；这是与本项目最接近的 dashboard grid 参考。
- `interact.js` 提供 `manualStart`、`hold`、`allowFrom`、`ignoreFrom`、`maxPerElement` 等 action-level 配置，说明成熟交互库倾向在 action 启动层解决激活、互斥和 handle/cancel 问题。
- `Excalidraw` 在开源常量中保留 `DRAGGING_THRESHOLD = 10px`，并在文本创建场景使用更高阈值避免快速点击被误判为拖动，说明画布类产品会显式防抖 click 与 drag。
- 本项目当前 `useGridItemDrag` 在底层 draggable start 时立即调用 `onDragStart`，`useGridDragResizeInteractions` 再用 `activeDragHasMoved` 防止零网格位移更新 guides；这能修复紫线误显，但仍属于中层兜底，不是源头语义分离。
- 设计结论：长期方案应以 input activation threshold + explicit interaction state machine 为主，保留现有位移 guard 作为防御层；视觉层不得承担区分 click 与 drag 的职责。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/CORE-runtime-foundation/README.md
SPEC_BRIEF: docs/initiatives/CORE-runtime-foundation/briefs/CORE-grid-interaction-state-machine.md

COVERAGE: interaction-state-machine

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| interaction-state-machine | R1-R9 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 统一交互状态模型
**用户故事:** 作为库维护者，我希望 pointer 交互由明确的有限状态机驱动，以便 click、drag、resize、drop 和 blocked 状态不会依赖分散的布尔变量与隐式副作用。
**验收标准 (EARS):**
- R1.AC1: WHEN grid item 收到 pointer 或 draggable start 信号时，系统 SHALL 进入明确的 `pending` 或等价未激活状态，而不是立即提交为 active drag interaction。
- R1.AC2: WHEN pointer interaction 超过激活条件时，系统 SHALL 转换为 `active-drag`、`active-resize` 或 `active-drop` 中的一个互斥状态。
- R1.AC3: WHEN interaction 完成、取消、blocked 后恢复或组件卸载时，系统 SHALL 回到 `idle` 状态并清理 placeholder、active ids、blocked feedback、auto-scroll、guides 和 transient layout 引用。
- R1.AC4: WHEN 当前状态不是允许 preview 的 active 状态时，系统 SHALL NOT 调用 layout engine preview、editor intelligence update、guide render 或 transient layout write。
- R1.AC5: WHEN 任意状态转换发生时，系统 SHALL 能通过内部测试或 debug hook 验证 from-state、to-state、interaction kind、active id 和 reason。
- R1.AC6: WHEN legacy layout engine 路径被使用时，系统 SHALL 仍遵循同一状态模型的入口、激活、完成和清理语义。
- R1.AC7: WHEN 实现交互状态机时，系统 SHALL 将状态转换、非法转换判断、stale result 防护、重复 preview 抑制和 cleanup 决策放在独立纯 TypeScript core 模块中；Vue composables SHALL 只负责 DOM/draggable 事件适配、响应式状态同步和副作用执行。

### R2: Click 与 Drag 的源头分离
**用户故事:** 作为编辑用户，我希望点击 item 只触发选择或菜单行为，不触发拖拽 guide、placeholder 或布局提交，以便普通点击不会出现紫色线或产生隐藏副作用。
**验收标准 (EARS):**
- R2.AC1: WHEN pointer movement 未达到拖拽激活阈值时，系统 SHALL 将本次交互视为 click-like interaction，并 SHALL NOT 向 grid layout 层发出 semantic `dragStart`、`drag` 或 `dragStop`。
- R2.AC2: WHEN click-like interaction 结束时，系统 SHALL 保留现有 click、selection、context menu 和 command availability 行为。
- R2.AC3: WHEN click-like interaction 结束时，系统 SHALL NOT 调用 layout engine preview/commit、`updateIntelligence`、history replace/push、persistence write-back 或 auto-scroll tick。
- R2.AC4: WHEN draggable 底层库因为轻微抖动发出零位移 drag 事件时，系统 SHALL 通过状态机和现有位移 guard 双层保护，确保 guides 不显示。
- R2.AC5: WHEN 用户移动距离达到阈值后，系统 SHALL 按一次真实 drag interaction 补发 semantic `dragStart`，并从起始位置计算后续 drag delta。
- R2.AC6: WHEN 业务方未配置阈值时，系统 SHALL 使用保守默认阈值，并 SHALL 保持现有公开 API 默认行为兼容。

### R3: Drag、Group Drag 与 Layout Engine 边界
**用户故事:** 作为专业 dashboard 编辑用户，我希望单 item drag 和多选 group drag 在激活后共享同一套 preview、commit、blocked 和 cleanup 流程，以便交互体验一致且可预测。
**验收标准 (EARS):**
- R3.AC1: WHEN drag 激活后，系统 SHALL 基于 editor runtime 的 move intent 进入 `single`、`group` 或 `blocked` interaction context。
- R3.AC2: WHEN drag 处于 active 状态且 target grid 坐标改变时，系统 SHALL 调用 layout engine preview，并 SHALL 使用 preview result 更新 transient layout、placeholder、blocked feedback 和 guides。
- R3.AC3: WHEN drag 处于 active 状态但 grid 坐标未改变时，系统 SHALL NOT 重复调用 preview 或 intelligence update。
- R3.AC4: WHEN group drag 被激活时，系统 SHALL 继续复用既有 `groupMove` operation，保持 selected ids、active id、dx/dy、collision、bounds、maxRows 和 diagnostics 语义。
- R3.AC5: WHEN drag stop 发生且 interaction 从未激活或从未移动时，系统 SHALL 清理状态但不提交 layout engine commit。
- R3.AC6: WHEN drag stop 发生且 interaction 已激活并产生移动时，系统 SHALL 只在 commit 边界触发 layout change、history push、persistence 和公开 drag stop 事件。

### R4: Resize 状态机收敛
**用户故事:** 作为编辑用户，我希望 resize 与 drag 一样拥有明确的激活、preview、commit 和 cleanup 边界，以便 resize guides、blocked feedback 和 history 不会与 drag 状态互相污染。
**验收标准 (EARS):**
- R4.AC1: WHEN resize handle 的 start 信号到达时，系统 SHALL 立即进入 `active-resize` 状态，并 SHALL 记录 item 起始几何与 resize handle。
- R4.AC2: WHEN resize preview 产生有效几何变化时，系统 SHALL 调用 layout engine preview 或 legacy resize path，并更新 placeholder、blocked state 和 resize guides。
- R4.AC3: WHEN resize tick 未产生尺寸或坐标变化时，系统 SHALL NOT 更新 guides、history 或 transient layout。
- R4.AC4: WHEN resize stop 发生且没有有效 resize 变化时，系统 SHALL 只清理状态，不提交 layout engine commit。
- R4.AC5: WHEN resize commit blocked、fallback、stale 或 error 时，系统 SHALL 按统一状态机结果处理，保持 committed layout 可恢复且 cleanup 一致。
- R4.AC6: WHEN drag 与 resize 信号重叠或乱序到达时，系统 SHALL 保证同一时间最多存在一个 active pointer interaction。

### R5: External Drop 与 Dropping Item 状态统一
**用户故事:** 作为集成开发者，我希望 external drop preview 与 item drag/resize 使用一致的状态和清理规则，以便 drop guide、placeholder 和 droppingPosition 不会留下残留状态。
**验收标准 (EARS):**
- R5.AC1: WHEN external drag enter 或 dragover 创建 dropping item 且 pointer 进入 grid 时，系统 SHALL 立即进入 `active-drop` 或等价 drop 状态，并记录 dropping item id、source event 和 preview geometry。
- R5.AC2: WHEN drop preview 坐标改变时，系统 SHALL 使用 existing drop strategy 和 layout engine preview 更新 placeholder、guides 和 transient dropping layout。
- R5.AC3: WHEN external dragover 坐标未改变时，系统 SHALL NOT 重复触发 guide update 或 layout preview。
- R5.AC4: WHEN external drag leave、drop cancel 或 drop commit 完成时，系统 SHALL 清理 droppingPosition、activeDrag、guides、blocked feedback 和 auto-scroll。
- R5.AC5: WHEN drop 被 `dropDragOver` handler 拒绝或 layout engine blocked 时，系统 SHALL 进入 structured blocked/drop feedback 状态，而不是留下半激活 placeholder。
- R5.AC6: WHEN normal item drag 与 external drop 交错发生时，系统 SHALL 根据状态机拒绝非法转换并恢复到可预测状态。

### R6: 事件、History 与 Persistence 的提交边界
**用户故事:** 作为库使用者，我希望公开事件、history 和 persistence 只在语义明确的边界触发，以便应用不会因为 click-like drag 或 stale preview 收到错误变更。
**验收标准 (EARS):**
- R6.AC1: WHEN drag interaction 未达到激活阈值时，系统 SHALL NOT 发出公开 `onDragStart`、`onDrag` 或 `onDragStop` 语义事件；需要 mousedown 级即时反馈的集成方 SHALL 使用 pointer/mousedown 类入口，而不是依赖 drag lifecycle。
- R6.AC2: WHEN active interaction preview tick 发生时，系统 SHALL NOT 写入 durable persistence，也 SHALL NOT 创建 history entry。
- R6.AC3: WHEN active interaction commit 成功时，系统 SHALL 触发一次 layout change、一次 history push 或 merge、一次 persistence write-back，以及对应公开 stop/drop 事件。
- R6.AC4: WHEN commit 返回 blocked、stale、fallback 或 error 时，系统 SHALL 根据结果状态决定是否保留上一 committed layout、恢复 preview 或发出 blocked command event。
- R6.AC5: WHEN interaction 被取消、组件销毁或 props/layout 外部更新打断时，系统 SHALL 清理 transient 状态，并 SHALL NOT 写入过期 layout。
- R6.AC6: WHEN responsive dashboard 或 editor shell 使用当前 breakpoint layout 时，系统 SHALL 只提交 active profile/breakpoint 的 durable layout，且不得因为 transient preview 写回继承 profile。

### R7: 可观测性、诊断与非法转换保护
**用户故事:** 作为维护者，我希望状态机能暴露结构化诊断并阻止非法转换，以便未来修复交互问题时可以从日志和测试定位根因。
**验收标准 (EARS):**
- R7.AC1: WHEN 状态机拒绝非法转换时，系统 SHALL 返回或记录结构化 reason，例如 `not-armed`、`already-active`、`stale-event`、`missing-item`、`unsupported` 或 `cancelled`。
- R7.AC2: WHEN layout engine result 包含 diagnostics 时，系统 SHALL 将 interaction id、operation id、phase、active id 和 status 关联起来，避免视觉层成为唯一诊断来源。
- R7.AC3: WHEN pointer events、draggable callbacks 或 async scheduler result 乱序到达时，系统 SHALL 使用 interaction id/request id 忽略 stale result。
- R7.AC4: WHEN blocked feedback 被设置时，系统 SHALL 指明 blocked reason、item ids、interaction kind 和是否可恢复。
- R7.AC5: WHEN debug/test hook 开启时，系统 SHALL 能检查当前 state snapshot，但 SHALL NOT 将内部状态机对象暴露为稳定公开 API。
- R7.AC6: WHEN diagnostics 包含 adapter、event 或 payload 信息时，系统 SHALL 继续遵守现有 stable diagnostics 脱敏规则，不泄露业务 payload。

### R8: 配置、兼容性与迁移策略
**用户故事:** 作为现有项目集成者，我希望升级到状态机实现后无需修改业务代码，同时可以按需调整拖拽激活阈值，以便兼容旧行为并获得更稳的交互边界。
**验收标准 (EARS):**
- R8.AC1: WHEN 用户未显式配置 interaction options 时，系统 SHALL 使用默认拖拽激活阈值：mouse/pen 为 4px，touch/coarse pointer 为 8px，并 SHALL 使用默认状态机行为和现有 layout engine options。
- R8.AC2: WHEN 提供 `dragActivationDistance` 或等价配置时，系统 SHALL 在 item drag 激活前使用该阈值区分 click-like 与 drag interaction。
- R8.AC3: WHEN 阈值被设置为 `0` 时，系统 SHALL 尽可能保持旧版立即 dragStart 兼容行为，但仍保持 cleanup 和 stale result 防护。
- R8.AC4: WHEN existing `onDragStart`、`onDrag`、`onDragStop`、`onResizeStart`、`onResize`、`onResizeStop`、`onDrop` listeners 存在时，系统 SHALL 保持参数结构兼容。
- R8.AC5: WHEN 未启用 editor 或 layout engine 时，系统 SHALL 保持基础 VueGridLayout 拖拽/缩放可用，并只应用与 click/drag 分离和 cleanup 相关的安全改进。
- R8.AC6: WHEN TypeScript 用户升级时，系统 SHALL 更新源类型和 `typings/index.d.ts`，确保新增配置和内部 result 类型不会破坏现有编译。
- R8.AC7: WHEN pointer type 可区分 mouse、pen、touch 或 coarse pointer 时，系统 SHALL 支持分开配置激活阈值；默认 mouse/pen threshold SHALL 为 4px，默认 touch/coarse threshold SHALL 为 8px。

### R9: 测试、示例与质量门槛
**用户故事:** 作为库维护者，我希望状态机改造有单元、组件和浏览器级回归验证，以便长期维护时不会重新出现点击显示 purple guide、重复 commit 或 stale preview 写回。
**验收标准 (EARS):**
- R9.AC1: WHEN 编写 item drag 单元测试时，系统 SHALL 覆盖未过阈值 click-like interaction、刚过阈值激活、激活后 delta 计算、bounded drag、dropping item 和 stop cleanup。
- R9.AC2: WHEN 编写 grid interaction 单元测试时，系统 SHALL 覆盖 single drag、group drag、blocked drag、zero-grid-delta drag、legacy drag、resize no-op、resize changed 和 illegal transition。
- R9.AC3: WHEN 编写 drop 测试时，系统 SHALL 覆盖 external dragover preview、坐标不变 no-op、drop rejected、drop commit 和 drag leave cleanup。
- R9.AC4: WHEN 编写 editor/browser smoke test 时，系统 SHALL 覆盖普通点击不会显示 guide、真实拖动会显示 guide、多选拖动仍可移动组、resize guide 正常、drop preview 正常。
- R9.AC5: WHEN 更新示例或文档时，系统 SHALL 说明 click 与 drag 的激活阈值、状态机边界、已知兼容策略和调试方式。
- R9.AC6: WHEN 发布前验证时，系统 SHALL 通过现有可用的核心单元测试、editor/browser smoke test、build/type checks；验证过程 SHALL 不依赖 computer use。

## Clarifications

### Session 2026-05-20

- Q: 公开 `onDragStart/onDragStop` 语义是否允许跟随真实拖拽激活阈值调整？ -> A: 选择 A；`onDragStart` 只在超过阈值后触发，click-like interaction 不发 `dragStart`、`drag` 或 `dragStop`。
- Q: 默认拖拽激活阈值应该定多少？ -> A: 选择 A；mouse/pen 默认 4px，touch/coarse pointer 默认 8px。
- Q: 这个状态机要不要覆盖 `resize` 的激活阈值？ -> A: 选择 B；resize handle start 立即激活，但 no-op resize 不 preview、不 commit。
- Q: external drop 是否也需要激活阈值？ -> A: 选择 B；external drop 进入 grid 即 active，坐标不变时 no-op。
- Q: 状态机要不要作为一个独立的纯 TypeScript core 模块实现？ -> A: 选择 A；实现独立纯 TS `interaction-state-machine` core，Vue composables 只做适配和副作用执行。
