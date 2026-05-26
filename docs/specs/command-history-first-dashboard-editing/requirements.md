# Command History First Dashboard Editing 需求规格

## 简介

当前项目已经具备三层能力：`GridEditorController` / Command Kernel 负责专业编辑器命令和 editor history，`useDashboardEditorShell()` 负责 dashboard 产品壳 action、adapter transaction 与 `DashboardLayoutDocument` write-back，legacy `historyStore` 继续作为 layout-only 兼容层存在。

本规格选择长期收益最大的方案 C：让 dashboard 编辑的 durable mutation 以 editor command history 为唯一主线，dashboard shell 统一观察或承接 pointer、toolbar、menu、keyboard、API、drop 与 undo/redo 的提交结果，再进行 profile-scoped document write-back、shell result、adapter transaction 与 diagnostics。`DashboardResponsiveVueGridLayout` 和 legacy `historyStore` 不再扩展为新的业务 history 语义；它们只保留薄组件和兼容镜像职责。

目标不是新增完整 BI 产品 UI，也不是删除 legacy history，而是消除 dashboard 编辑里 command history、document write-back、runtime projection、shell result 和 legacy layout history 之间的长期割裂。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-command-history-first-dashboard-editing.md

COVERAGE: command-history-first

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| command-history-first | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: Command History 成为 Dashboard 编辑唯一主线
**用户故事:** 作为 dashboard 编辑器维护者，我希望所有 dashboard durable mutation 都以 editor command history 为主线，以便 undo/redo、权限、确认、审计、write-back 和未来协作来源过滤共享同一个提交边界。
**验收标准 (EARS):**
- R1.AC1: WHEN dashboard 编辑行为来自 pointer drag、resize、external drop、toolbar、context menu、keyboard shortcut、API 或 shell action THEN 系统 SHALL 先进入 `GridEditorController` command pipeline 或等价 placement commit，再产生 durable mutation。
- R1.AC2: WHEN command commit 改变 layout、metadata、sectionRows、selection、focus 或 dirty state THEN editor history SHALL 成为 undo/redo 的权威来源。
- R1.AC3: WHEN 新增 dashboard 编辑入口 THEN 开发者 SHALL 接入 command/shell pipeline，而不是新增独立 document mutation 或 legacy history 写入分支。
- R1.AC4: IF 某个兼容入口暂时不能进入 command history THEN 系统 SHALL 标记为 compatibility path，并在 README 或 spec 中说明限制、触发条件和迁移目标。

### R2: Shell 承接 Dashboard Document Write-back
**用户故事:** 作为 dashboard 产品集成方，我希望 `useDashboardEditorShell()` 统一负责 command commit 后的 `DashboardLayoutDocument` 回写，以便 toolbar/menu/keyboard/API/pointer 的结果都能同步 runtime、document 和 shell result。
**验收标准 (EARS):**
- R2.AC1: WHEN editor command commit 产生 dashboard-relevant layout 或 metadata 变化 THEN shell SHALL 计算 profile-scoped next layout，并调用现有 dashboard responsive write-back API 更新目标 `DashboardLayoutDocument`。
- R2.AC2: WHEN shell write-back 成功 THEN 系统 SHALL 发出统一的 shell action/document change result，包含 action id、command id、source、affectedIds、patches、profile context 和 diagnostics。
- R2.AC3: WHEN shell write-back 失败 THEN 系统 SHALL rollback 或重新 external-apply 到提交前 runtime layout，并返回 blocked/error result，不得让 editor layout 与 dashboard document 长期分叉。
- R2.AC4: WHEN shell 处于 controlled document 模式 THEN 系统 SHALL 只发出 proposed document / documentChange 事件，不自动持久化远端状态。
- R2.AC5: WHEN shell 处于 uncontrolled local document 模式 THEN 系统 MAY 更新本地 document ref，但 remote persistence 仍 SHALL 由调用方显式控制。
- R2.AC6: WHEN shell-managed document write-back 未显式启用 THEN 系统 SHALL 默认保持 component/model write-back 行为；WHEN 调用方显式配置 shell-managed 模式（例如 `documentWriteBack: "shell"` 或等价 API）THEN shell SHALL 成为该 dashboard editor 的唯一 document write-back owner。
- R2.AC7: WHEN shell-managed write-back 生成 dashboard document mutation THEN 系统 SHALL 写回 layout geometry、durable `editorMetaById` 和 durable `sectionRows`；系统 SHALL NOT 将 selection 或 focus 作为 dashboard document 持久化字段写回。
- R2.AC8: WHEN editor command 已经提交但 shell write-back 随后失败 THEN 系统 SHALL 自动恢复 editor state 到 command 前状态，并 SHALL 移除、撤销或补偿该失败 command 的用户可见 history entry，避免失败提交参与后续 undo/redo。
- R2.AC9: WHEN 调用方启用 shell-managed 模式 THEN 主配置入口 SHALL 位于 `useDashboardResponsiveProfileModel()` / `useDashboardEditorShell()` options；`DashboardResponsiveVueGridLayout` MAY 提供便捷 prop 透传该配置，但 SHALL 不成为唯一入口。

### R3: Pointer、Resize 和 Drop Commit 接入 Shell 事务
**用户故事:** 作为终端用户，我希望拖拽、resize 和 drop 与菜单/快捷键命令拥有同样的 document write-back、undo/redo 和错误恢复，以便直接操作画布不会绕过产品壳事务。
**验收标准 (EARS):**
- R3.AC1: WHEN pointer drag stop 通过 editor `move` 或 group move command 成功提交 THEN shell SHALL 能观察或接管该 commit，并执行 dashboard document write-back。
- R3.AC2: WHEN resize stop 通过 editor `resize` command 成功提交 THEN shell SHALL 能观察或接管该 commit，并执行 dashboard document write-back。
- R3.AC3: WHEN external drop 通过 editor `add`、`paste`、`move` 或 drop-equivalent command 成功提交 THEN shell SHALL 能观察或接管该 commit，并执行 dashboard document write-back。
- R3.AC4: WHEN pointer/resize/drop command 被 guard block、cancel、timeout、error 或 stale request 拒绝 THEN 系统 SHALL 清理 placeholder、guides、active interaction、auto-scroll 和 pending shell transaction，并恢复到交互开始前 committed layout。
- R3.AC5: WHEN 交互只是 preview frame、未越过 activation distance 或最终 noop THEN 系统 SHALL 不进行 document write-back、不创建 legacy history entry、不调用 adapter commit。
- R3.AC6: WHEN shell-managed 模式观察到 pointer drag、resize 或 external drop commit 且不存在显式 shell action THEN shell SHALL 自动合成 `pointer-move`、`pointer-resize`、`external-drop` 或等价 action result，并关联 editor command id、source、affectedIds、write-back status 和 diagnostics。

### R4: 防止双写与状态回声
**用户故事:** 作为维护者，我希望 shell-managed commit 不会与 `DashboardResponsiveVueGridLayout` 自身的 `documentChange` 或 model watcher 重复写回，以便避免重复 history、重复 diagnostics、redo 栈污染和 runtime 回声循环。
**验收标准 (EARS):**
- R4.AC1: WHEN 显式 shell-managed 模式管理某次 command commit 的 write-back THEN `DashboardResponsiveVueGridLayout` 或 `useDashboardResponsiveProfileModel()` SHALL 不再为同一 commit 额外写回同一个 document mutation。
- R4.AC2: WHEN dashboard wrapper 仍直接使用 `@documentChange` 且未启用 shell-managed 模式 THEN 现有 document write-back 行为 SHALL 保持兼容。
- R4.AC3: WHEN shell write-back 后父组件以受控 document 回传新 runtime THEN editor controller SHALL 将其识别为 internal/external acknowledged update，并默认不创建新的 user undo entry。
- R4.AC4: WHEN command result、documentChange、projectionChange 和 shell result 都发生 THEN 事件顺序 SHALL 稳定且可测试，避免调用方看到过期 runtime。
- R4.AC5: IF 发生重复提交风险 THEN 系统 SHALL 以 command id、action id、revision 或 transaction token 去重。
- R4.AC6: WHEN 通过 component prop 便捷启用 shell-managed 模式 THEN 该 prop SHALL 只透传到 model/shell 配置，不引入独立的 component-only write-back 状态机。

### R5: Editor Event Subscription 成为可组合观察面
**用户故事:** 作为 shell 和高级集成开发者，我希望 editor controller 支持多个观察者订阅 command 事件，以便 shell、审计、toast 和示例 UI 可以同时观察命令结果，而不会互相覆盖单一 `onEvent` 回调。
**验收标准 (EARS):**
- R5.AC1: WHEN 创建 `GridEditorController` THEN 现有 `onEvent` 初始化选项 SHALL 继续可用。
- R5.AC2: WHEN 调用新的 subscribe/on/off 等事件订阅 API THEN 系统 SHALL 返回 cleanup handle，并允许多个监听器接收同一 `GridEditorEvent`。
- R5.AC3: WHEN 任一事件监听器抛错 THEN 系统 SHALL 不改变 command result、history 或 document write-back，并 SHOULD 暴露 listener error diagnostic。
- R5.AC4: WHEN controller.stop 被调用 THEN 系统 SHALL 清理订阅者或让 cleanup handle 幂等失效，避免 shell 卸载后继续处理 commit。
- R5.AC5: WHEN shell 订阅 editor commit 事件 THEN shell SHALL 只把事件当作观察/编排面；阻塞 command 仍 SHALL 通过 guard 或 command policy 完成。

### R6: Legacy History 仅作为 Layout-only 兼容镜像
**用户故事:** 作为已有用户，我希望 `historyStore` 继续工作，但新 dashboard editor 能力不被 legacy layout-only 语义拖住，以便平滑迁移且不污染公共契约。
**验收标准 (EARS):**
- R6.AC1: WHEN 仅使用 legacy `historyStore` 且不启用 editor/shell THEN 现有 layout-only undo/redo 行为 SHALL 保持兼容。
- R6.AC2: WHEN 启用 editor command history 且配置 `legacyHistoryStore` THEN legacy store SHALL 只镜像 layout snapshot，不记录 selection、metadata、sectionRows、toolbar command 或 adapter transaction。
- R6.AC3: WHEN command commit 已经写入 editor history THEN legacy store SHALL 不产生重复的等价 undo entry。
- R6.AC4: WHEN legacy store 执行 undo/redo THEN dashboard wrapper MAY 支持 layout-only document write-back，但文档 SHALL 明确该路径不承诺 shell adapter transaction、selection/focus 或 metadata 恢复。
- R6.AC5: WHEN README 描述 history 能力 THEN 系统 SHALL 推荐新 dashboard editor 使用 shell/editor history，legacy `historyStore` 标记为 compatibility layer。

### R7: Adapter Transaction 与 Business Payload 一致性
**用户故事:** 作为业务 dashboard 集成方，我希望 shell 在 command commit、dashboard write-back 与 widget/reference adapter 之间保持事务语义，以便不会出现 layout 成功但业务 payload 失败的半提交状态。
**验收标准 (EARS):**
- R7.AC1: WHEN shell action 涉及 widget/reference adapter THEN 系统 SHALL 保持 `prepare -> editor command/dashboard write-back -> adapter commit` 顺序。
- R7.AC2: WHEN pointer/drop commit 需要 adapter finalization THEN shell SHALL 能通过 command result、placement summary 或 transaction token 找到 pending adapter transaction。
- R7.AC3: IF adapter prepare 成功但 editor command、dashboard write-back 或 adapter commit 失败 THEN 系统 SHALL 调用 rollback/compensation hook 或返回可恢复 diagnostics。
- R7.AC4: WHEN adapter payload 包含业务敏感字段 THEN diagnostics SHALL 默认只记录 adapter stage、ids、status 和 error code，不记录完整 payload 内容。
- R7.AC5: WHEN command commit 没有业务 adapter 参与 THEN shell SHALL 仍能完成 layout/editor metadata write-back，并在 result 中标明 adapter 未参与。
- R7.AC6: IF adapter commit 在 editor command 和 dashboard write-back 成功后失败 THEN 系统 SHALL 回滚或补偿 editor state、dashboard document proposal 和用户可见 history entry，并 SHALL 调用 adapter rollback/compensation hook。

### R8: Undo/Redo 统一穿过 Shell Write-back
**用户故事:** 作为 dashboard 编辑用户，我希望撤销和重做能恢复 editor state 与 dashboard document，以便历史记录不会只改变内存 layout 而忘记回写 profile。
**验收标准 (EARS):**
- R8.AC1: WHEN shell 调用 undo 或 redo THEN 系统 SHALL 通过 editor history replay 恢复 snapshot，再执行 dashboard/profile write-back。
- R8.AC2: WHEN 用户通过 keyboard/menu/toolbar/API 触发 undo 或 redo THEN 系统 SHALL 使用同一个 shell history action pipeline。
- R8.AC3: WHEN undo/redo 涉及 deleted、added、pasted 或 dropped item THEN dashboard document SHALL 正确添加或移除 profile-scoped widget geometry，并保留 unknown fields。
- R8.AC4: WHEN undo/redo write-back 失败 THEN editor SHALL rollback 到 write-back 前 runtime 或返回 blocked/error result，避免 document 与 editor snapshot 分叉。
- R8.AC5: WHEN undo/redo 只改变 selection/focus 且无 layout/document mutation THEN shell SHALL 不写 dashboard document，但 SHALL 返回可观察 result。
- R8.AC6: WHEN undo/redo 恢复 durable `editorMetaById` 或 `sectionRows` THEN shell-managed write-back SHALL 将这些 durable sidecar 同步到 dashboard document；selection/focus 恢复 SHALL 保留在 editor runtime/history 层。
- R8.AC7: WHEN undo/redo replay 已改变 editor state 但 dashboard write-back 失败 THEN 系统 SHALL 恢复到 replay 前 editor state，并 SHALL 保持 undo/redo stacks 与用户可见历史一致。

### R9: Dogfood Workbench 迁移与真实链路验证
**用户故事:** 作为组件库维护者，我希望现有 dashboard runtime lab 或 shell 示例 dogfood 新主线，以便 API 摩擦、双写问题和历史一致性在真实使用链路里暴露。
**验收标准 (EARS):**
- R9.AC1: WHEN 更新 dogfood 示例 THEN 示例 SHALL 使用 `useDashboardEditorShell()` / editor command history 作为 undo/redo 和 document write-back 主路径，不再手写 legacy layout history 作为主流程。
- R9.AC2: WHEN 示例支持 drag、resize、drop、toolbar add/remove、paste、undo、redo、profile switch 和 layout settings migration THEN 这些操作 SHALL 在同一 result/diagnostic 面板中可观察。
- R9.AC3: WHEN 示例保留 legacy history 展示 THEN 它 SHALL 被标记为 compatibility / layout-only，而不是推荐 dashboard editor 主路径。
- R9.AC4: WHEN 示例发生 shell-managed pointer commit THEN UI SHALL 显示 command id、action id/source、affected ids、write-back status 和 diagnostics。
- R9.AC5: WHEN 示例运行 headless/browser 测试 THEN 测试 SHALL 覆盖不会发生重复 documentChange、重复 history push 或 undo/redo 分叉。
- R9.AC6: WHEN 示例用户直接拖拽、resize 或外部 drop widget THEN result stream SHALL 显示由 shell 自动合成的 pointer/drop action result，而不是静默更新 document。

### R10: Public API、文档与测试覆盖
**用户故事:** 作为维护者和库消费者，我希望新主线有清晰公共 API、迁移文档和自动化测试，以便后续新增能力不会回到多条提交路径。
**验收标准 (EARS):**
- R10.AC1: WHEN 新增 editor subscription、shell-managed commit 或 dashboard write-back control API THEN TypeScript 类型、ESM/CJS public exports 和 README SHALL 同步更新。
- R10.AC2: WHEN 更新 README THEN 文档 SHALL 说明 shell/editor history、dashboard wrapper documentChange、legacy historyStore 三者的职责边界和推荐迁移路径。
- R10.AC3: WHEN 编写单元测试 THEN 测试 SHALL 覆盖 editor event subscription、多监听器错误隔离、shell pointer commit write-back、undo/redo write-back、legacy mirror 不污染 metadata/selection。
- R10.AC4: WHEN 编写 dashboard integration tests THEN 测试 SHALL 覆盖 profile-scoped drag/resize/drop/add/delete/paste write-back、unknown field preservation、write-back failure rollback 和 duplicate prevention。
- R10.AC5: WHEN 编写示例或浏览器测试 THEN 测试 SHALL 使用现有 CLI/headless 命令，不依赖会抢焦点的 GUI browser automation。
- R10.AC6: WHEN 完成本规格实现 THEN 系统 SHALL 至少通过相关 editor、dashboard shell、dashboard responsive、examples、types、build/package 检查，或在交付说明中列出未运行的验证缺口。
- R10.AC7: WHEN 暴露 shell-managed 模式 API THEN public 类型 SHALL 覆盖 model options、shell options 和 component 便捷 prop 的一致命名与互操作，并 SHALL 在类型测试中验证三种入口不会产生冲突。

## Clarifications

### Session 2026-05-22

- Q: 在收益/风险较小的 legacy history 修复与长期收益最大的方案之间选择哪条？ -> A: 选择 C：Command-History-First Dashboard Editing。dashboard durable mutation 统一进入 editor command history，shell 统一 document write-back；legacy `historyStore` 保留 layout-only compatibility layer。
- Q: shell-managed document write-back 应该如何启用？ -> A: 采用显式 opt-in，默认保留 component/model write-back；调用方通过 `documentWriteBack: "shell"` 或等价 API 启用后，shell 才成为唯一 document write-back owner。
- Q: shell 接管 pointer drag/resize/drop 后，没有显式 toolbar/menu action 时，shell result/action identity 应该怎么生成？ -> A: 自动合成 shell action result，从 editor command event 生成 `pointer-move`、`pointer-resize`、`external-drop` 或等价 action，并关联 editor command id/source/diagnostics。
- Q: shell-managed document write-back 应该写回哪些 editor state？ -> A: 写回 layout geometry、durable `editorMetaById` 和 durable `sectionRows`；selection/focus 只保留在 editor runtime/history 层，不作为 dashboard document 持久化字段。
- Q: shell write-back 或 adapter commit 失败时，已经进入 editor history 的 command 怎么处理？ -> A: 自动回滚 editor state，并移除、撤销或补偿该失败 history entry，保证失败提交不参与后续用户可见 undo/redo。
- Q: shell-managed 模式的入口应该放在哪里？ -> A: 以 `useDashboardResponsiveProfileModel()` / `useDashboardEditorShell()` options 为主，`DashboardResponsiveVueGridLayout` 提供便捷 prop 透传；component prop 不引入独立 write-back 状态机。
