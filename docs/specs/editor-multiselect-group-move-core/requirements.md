# Editor 多选组移动核心需求规格

## 简介

当前 `professional-dashboard-editor` 已经具备 editor controller、selection model、command pipeline、keyboard shortcut、history、guides、persistence 和 layout engine scheduler 等基础能力。`Ctrl/Cmd + 点击` 多选语义已经存在，keyboard/API 的 `move` command 也能对多个 target 做相对位移。

本规格聚焦第一个增量：让多选后的组移动成为 layout engine 的一等操作，并让 pointer drag、keyboard move 和 API command 共享同一套 collision-aware、bounds-aware、history-aware 语义。目标不是新增一整套批量生产力工具，而是修正当前 pointer drag 只移动 active item、editor command 直接批量 patch layout、layout engine 不知道 group move 的语义分叉。

本规格不包含框选/lasso selection、对齐/分布命令、批量尺寸、Inspector mixed values、批量 productivity toolbar、group resize 或完整 group bounding-box ghost。以上能力应建立在本规格之后的生产力工具规格中。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/EDITOR-professional-editor/README.md
SPEC_BRIEF: docs/initiatives/EDITOR-professional-editor/briefs/EDITOR-editor-multiselect-group-move-core.md

COVERAGE: group-move-core

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| group-move-core | R1-R8 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 多选拖拽启动语义
**用户故事:** 作为 dashboard 编辑用户，我希望在已经多选多个组件后拖动其中任意一个已选组件时整组一起移动，以便快速调整一组相关卡片的位置。
**验收标准 (EARS):**
- R1.AC1: WHEN editor 处于 `edit` 模式且用户通过 `Ctrl/Cmd + 点击` 选择多个 item 时，系统 SHALL 保留现有 selection model 的 `selectedIds`、`activeId`、`anchorId` 和 `mode: "multiple"` 语义。
- R1.AC2: WHEN 用户拖动的 active item 已包含在当前 `selectedIds` 中且 `selectedIds.length > 1` 时，系统 SHALL 启动 group move，而不是只移动 active item。
- R1.AC3: WHEN 用户拖动的 item 不在当前 selection 中时，系统 SHALL 先将 selection 切换为该 item 的单选状态，再执行单 item move。
- R1.AC4: WHEN editor 处于 `view` 模式、item 不可拖拽或 editor capability 不允许移动时，系统 SHALL 阻止拖拽并返回结构化 blocked result，不得修改 committed layout。
- R1.AC5: WHEN group move 开始时，系统 SHALL 以 active dragged item 的起始坐标与当前 snapped/target 坐标计算 `dx` 和 `dy`，并 SHALL 保持组内可移动 item 的相对位置。
- R1.AC6: WHEN 用户只选择一个 item 或未启用 editor 时，系统 SHALL 保持现有单 item drag 行为和公开事件兼容。

### R2: Layout Engine 一等 `groupMove` 操作
**用户故事:** 作为库维护者，我希望 group move 进入 layout engine，而不是散落在 Vue drag callback 或 editor controller 的手写 patch 中，以便碰撞、边界、scheduler、diagnostics 和未来 worker 路径可以复用同一套语义。
**验收标准 (EARS):**
- R2.AC1: WHEN layout engine 接收 layout operation 时，系统 SHALL 支持新的 `groupMove` 操作，包含 `ids: string[]`、`dx: number`、`dy: number`、可选 `activeId` 和可选 `userAction`。
- R2.AC2: WHEN `groupMove.ids` 为空、包含重复 id、包含不存在 id 或 `dx/dy` 非有限数值时，系统 SHALL 归一化可恢复输入或返回 `invalid-input` / `missing-item` blocked result，并暴露相关 item ids。
- R2.AC3: WHEN `groupMove.ids` 只有一个有效 id 时，系统 SHALL 产生与相同位移的单 item move 等价的 committed layout、patches 和 diagnostics。
- R2.AC4: WHEN `groupMove` 执行 preview 或 commit 时，系统 SHALL 使用 layout engine 现有 `LayoutOperationRequest`、scheduler、executor、diagnostics 和 patch 结构，不得新建 editor 私有布局计算通道。
- R2.AC5: WHEN `groupMove` 成功改变 layout 时，系统 SHALL 为每个实际移动的 item 返回 `LayoutPatch`，并在 diagnostics 中标记 operation type 为 `groupMove`、affected count、collision count 和 blocked reason。
- R2.AC6: WHEN 现有单 item `move`、`resize`、`dropFit`、`compact`、`validate` 或 responsive layout generation 被调用时，系统 SHALL 保持当前行为兼容。

### R3: Group Move 碰撞、边界与布局约束
**用户故事:** 作为 dashboard 编辑用户，我希望整组移动时碰撞和越界规则与单个 item 一样可靠，以便不会因为多选操作破坏布局约束。
**验收标准 (EARS):**
- R3.AC1: WHEN 执行 group move 时，系统 SHALL 将组内 item 视为同一移动集合，组内既有相对关系不得被当作外部碰撞阻塞。
- R3.AC2: WHEN group move 的目标位置导致任一移动 item 的 `x < 0`、`y < 0`、`x + w > cols` 或超过 `maxRows` 时，系统 SHALL 按整个移动集合返回 `bounds` 或 `maxRows` blocked result。
- R3.AC3: WHEN `preventCollision=true` 且 `allowOverlap=false`，并且 group 目标位置会碰撞组外 item 时，系统 SHALL 返回 `collision` blocked result，并 SHALL 列出相关组外 item ids。
- R3.AC4: WHEN `allowOverlap=true` 时，系统 SHALL 允许 group 与组外 item overlap，并 SHALL 仍然返回可诊断 patches 和 placeholder。
- R3.AC5: WHEN `compactType` 为 `vertical`、`horizontal` 或 `null` 时，系统 SHALL 复用现有 compaction 规则，同时 SHALL 保持被移动组内 item 的相对 offset 可预测。
- R3.AC6: WHEN group move request 中包含 `static: true` 的 selected item 时，layout engine SHALL 返回 `static-item` blocked result，除非 editor 层已经根据 `skip-blocked` 策略将其过滤。
- R3.AC7: WHEN group move 被 blocked 时，系统 SHALL 保持 committed layout 不变，并 SHALL 允许同一次 pointer interaction 后续从 blocked 状态恢复为可提交状态。
- R3.AC8: WHEN `preventCollision=false` 且 `allowOverlap=false`，并且 group 目标位置会碰撞组外非 static item 时，系统 SHALL 允许 layout engine 按现有 move/compact 规则推动或重新压缩组外 item，并 SHALL 在 patches、affected ids 和 diagnostics 中记录被移动的组内与组外 item。
- R3.AC9: WHEN group 目标位置会碰撞组外 `static: true` item 时，系统 SHALL 将该 static item 视为物理障碍物并返回 `static-item` blocked result，即使 `preventCollision=false`。

### R4: Locked、Static 与 Command Policy
**用户故事:** 作为产品集成者，我希望 editor metadata 的 `locked` 权限锁和 layout item 的 `static` 物理固定语义清晰分离，以便业务权限和布局约束不会混在一起。
**验收标准 (EARS):**
- R4.AC1: WHEN item 在 `editorMetaById` 中为 `locked: true` 或 capability 不允许移动时，editor controller SHALL 在调用 layout engine 前将其视为不可直接移动目标。
- R4.AC2: WHEN item 在 layout 中为 `static: true` 时，layout engine SHALL 将其视为物理固定项，并 SHALL 在 group move 中作为不可移动目标或组外障碍物参与布局约束。
- R4.AC3: WHEN `commandPolicy` 为 `skip-blocked` 且 selection 中混有 locked、static、hidden、missing 或不可拖拽 item 时，editor controller SHALL 只把允许移动的 ids 传给 layout engine，并在 command result 中返回 `skippedIds` 和 blocked reason。
- R4.AC4: WHEN `commandPolicy` 为 `all-or-nothing` 或未显式配置时，任一 selected target 不可移动 SHALL 阻止整个 group move，并 SHALL NOT 对部分 item 应用位移。
- R4.AC5: WHEN locked item 未设置 `static: true` 时，系统 SHALL 禁止用户直接拖动该 item，但 SHALL NOT 默认把它当作 layout engine 的物理障碍物。
- R4.AC6: WHEN 业务方需要某个 item 不能被其他 item 挤走时，系统 SHALL 通过 layout item 的 `static: true` 表达，而不是依赖 editor metadata 的 `locked: true`。

### R5: Pointer Preview、Placeholder 与 Guides 集成
**用户故事:** 作为编辑用户，我希望多选拖拽时预览、placeholder、guides 和 blocked feedback 稳定清楚，以便知道整组会移动到哪里以及为什么放不了。
**验收标准 (EARS):**
- R5.AC1: WHEN pointer group drag 进行中时，系统 SHALL 通过 layout engine preview 更新 transient layout、placeholder、guides、HUD 和 blocked state，而不得为每个 drag tick 写入 history 或 durable persistence。
- R5.AC2: WHEN pointer group drag preview 成功时，系统 SHALL 至少以 active item 的 placeholder 反馈当前位置，并 SHOULD 在 HUD 或 command diagnostics 中暴露 selected count 与 `dx/dy`。
- R5.AC3: WHEN pointer group drag preview 被 blocked 时，系统 SHALL 保留最近 committed layout 或上一可用 preview，并 SHALL 将 blocked reason 映射到现有 drag blocked 视觉状态和 editor guide state。
- R5.AC4: WHEN pointer group drag stop 时，系统 SHALL 使用 layout engine commit 提交同一个 group move 语义，并 SHALL 只在 commit 边界触发 `layoutChange`、`update:modelValue`、history 和 persistence。
- R5.AC5: WHEN scheduler 返回 `stale`、`fallback`、`blocked` 或 `error` 结果时，系统 SHALL 使用现有 layout engine result status 处理路径，并 SHALL 保持 pointer interaction 可恢复。
- R5.AC6: WHEN 未启用 layout engine 或启用 legacy 路径且当前操作需要 multi-item group move 时，系统 SHALL 返回结构化 `unsupported` 或 `invalid-input` blocked result；WHEN 当前操作是单 item move 时，系统 SHALL 保持现有单 item 行为。

### R6: Keyboard、API Command 与 History 统一
**用户故事:** 作为专业编辑器用户，我希望鼠标、键盘和 API 移动多选目标时表现一致，并且一次组移动可以一次撤销，以便编辑体验可预测。
**验收标准 (EARS):**
- R6.AC1: WHEN keyboard move 或 API `move` command 的 target ids 多于一个，或未显式传 target ids 但当前 selection 多于一个时，editor controller SHALL 将其解析为 layout engine `groupMove`。
- R6.AC2: WHEN keyboard/API move 只有一个有效 target id 且传入 absolute `x/y` 时，系统 SHALL 保持现有单 item absolute move 语义。
- R6.AC3: WHEN keyboard/API group move 执行时，系统 SHALL 复用与 pointer group drag 相同的 locked/static/collision/bounds/commandPolicy 规则。
- R6.AC4: WHEN 一次 pointer group drag 从 start 到 stop 完成时，系统 SHALL 创建一条 history entry，而不是为 preview tick 创建多条 entry。
- R6.AC5: WHEN 用户连续使用 keyboard move 移动同一 selection 时，系统 SHALL 继续支持已有 `mergeKey` / `mergeWindowMs` 合并策略，并 SHALL 让 undo/redo 恢复整个 selection 的移动。
- R6.AC6: WHEN undo 或 redo 恢复 group move 时，系统 SHALL 同步 layout、selection、active item、dirty state 和 editor events，避免 selection 停留在不存在或未移动的 item 上。

### R7: 公开契约、事件与兼容性
**用户故事:** 作为 Vue Grid Layout 集成开发者，我希望新增 group move 不破坏现有 API，同时可以通过结构化结果观察组移动和受阻原因，以便安全升级。
**验收标准 (EARS):**
- R7.AC1: WHEN 新增 `groupMove` layout operation 类型时，系统 SHALL 更新 TypeScript 源类型、CommonJS/UMD 导出相关类型和 `typings/index.d.ts`，确保库使用者可编译。
- R7.AC2: WHEN editor command result 来自 group move 时，系统 SHALL 在 result 中包含 target ids、affected ids、layout patches、blocked/skipped ids、layout operation diagnostics 和 undo metadata；IF `preventCollision=false` 导致组外 item 被推动或 compact，affected ids SHALL 同时包含这些组外 item。
- R7.AC3: WHEN group move 被 mode、capability、locked、static、collision、bounds、maxRows、missing item、invalid input 或 unsupported legacy path 阻止时，系统 SHALL 发出与现有 command pipeline 兼容的 `command-blocked` 事件。
- R7.AC4: WHEN 未传 `editor`、`editor=false` 或当前 selection 不是多选时，系统 SHALL 保持现有 `VueGridLayout` 和 `ResponsiveVueGridLayout` 行为、事件顺序和 CSS class 兼容。
- R7.AC5: WHEN responsive editor 处于某个 breakpoint 时，group move SHALL 只影响当前 breakpoint 的 active layout，并 SHALL 清理或保留 selection 时遵循现有 responsive editor 语义。
- R7.AC6: WHEN group move 产生 diagnostics 时，系统 SHALL 能被现有 debug/smoke test 读取，不得只通过视觉层表达关键状态。

### R8: 测试、示例与文档质量门槛
**用户故事:** 作为库维护者，我希望 group move 有可重复的单元、组件和浏览器级验证，以便后续批量生产力工具不会建立在脆弱行为上。
**验收标准 (EARS):**
- R8.AC1: WHEN 编写 layout engine 单元测试时，系统 SHALL 覆盖 group move 成功、多 id patches、missing id、static selected item、组外 static 障碍物、bounds、maxRows、preventCollision blocked、preventCollision false 推动/compact 组外 item、allowOverlap allowed、compactType 组合和 single-id 等价语义。
- R8.AC2: WHEN 编写 editor controller 测试时，系统 SHALL 覆盖 selection 多选解析、locked filtering、`skip-blocked`、`all-or-nothing`、keyboard/API group move、history undo/redo 和 command result diagnostics。
- R8.AC3: WHEN 编写 browser interaction 测试时，系统 SHALL 覆盖 `Ctrl/Cmd + 点击` 多选后拖动已选 item 会移动整组，以及拖动未选 item 会切换为单选并只移动该 item。
- R8.AC4: WHEN 更新 `professional-dashboard-editor` 示例时，系统 SHALL 展示多选组移动、skipped/blocked feedback、locked 与 static 的区别，并保持示例 UI 不成为核心能力依赖。
- R8.AC5: WHEN 更新 README 或相关文档时，系统 SHALL 说明 `locked` 与 `static` 的区别、`groupMove` 的 engine-first 语义、commandPolicy 行为、collision/bounds 规则和已知限制。
- R8.AC6: WHEN 发布本能力前，系统 SHALL 通过现有可用的 typecheck、build、核心单元测试和 editor/browser smoke test；验证过程 SHALL 不依赖 computer use。

## Clarifications

### Session 2026-05-10

- Q: 第一个 spec 采用哪种方案？ -> A: 选择 A，采用 Engine-first groupMove，把 group move 做进 layout engine，再让 pointer drag、keyboard move 和 API command 复用。
- Q: 第一个 spec 是否包含框选、对齐、分布、批量尺寸、Inspector 或 productivity toolbar？ -> A: 不包含，这些进入后续 Editor Bulk Productivity Tools spec。
- Q: `locked` 与 `static` 如何区分？ -> A: `locked` 是 editor sidecar metadata 的权限锁，限制直接编辑；`static` 是 layout item 的物理固定/障碍物语义。
- Q: 未启用 layout engine 或 legacy 路径下遇到多选 group move 应如何处理？ -> A: 多选 group move 返回结构化 unsupported/invalid-input blocked；单 item move 保持现有行为。
- Q: `preventCollision=false && allowOverlap=false` 时 group move 与组外 item 相撞应如何处理？ -> A: 允许 group 作为整体移动，并按现有 move/compact 规则推动或重新压缩组外非 static item；result 记录组内与组外 affected ids。
- Q: group move 撞到组外 `static` item 时应如何处理？ -> A: 组外 `static` 永远作为物理障碍物；group move 撞到它返回 `static-item` blocked，即使 `preventCollision=false`。
