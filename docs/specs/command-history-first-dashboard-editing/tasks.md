# Command History First Dashboard Editing 实现任务

## 实施原则

- 先补 editor/history 基础能力，再接 shell-managed write-back，最后迁移示例和文档。
- 每个任务完成时同步补单元测试或集成测试；不把验证集中留到最后。
- 默认兼容行为必须先被测试锁住，再启用 opt-in 新路径。
- 不使用会抢焦点的 GUI/browser automation；前端行为验证走现有 CLI/headless 脚本。

## 任务列表

### 1. 建立 Editor Event Subscription 与 History Checkpoint 基础

- [x] 1.1 在 `lib/editor/types.ts` 增加 `GridEditorEventListener`、`GridEditorHistoryCheckpoint`、`GridEditorRollbackCheckpoint` 类型，并扩展 `GridEditorController` 与 `GridEditorHistoryController` 接口。

_需求追溯: R5.AC1, R5.AC2, R10.AC1_

- [x] 1.2 在 `lib/editor/history.ts` 实现 `checkpoint()` / `restore()`，覆盖 past/future stacks、merge 后 entry、redo stack 与 flags 恢复。

_需求追溯: R1.AC2, R2.AC8, R8.AC7_

- [x] 1.3 在 `lib/editor/controller.ts` 将单一 `options.onEvent` 派发改造成多监听器派发，保留初始化 `onEvent` 兼容，并实现 `subscribe()` cleanup 幂等与 listener error diagnostic。

_需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5_

- [x] 1.4 在 controller 中实现 `createRollbackCheckpoint()` / `restoreRollbackCheckpoint()`，恢复 snapshot 与 history checkpoint 时不产生新的 user history entry，并正确处理 external apply acknowledgement。

_需求追溯: R2.AC3, R2.AC8, R4.AC3, R8.AC4, R8.AC7_

- [x] 1.5 增加 editor 单元测试，覆盖多监听器、监听器抛错隔离、checkpoint restore、undo/redo stack 恢复和 failed command 不参与后续 undo/redo。

_需求追溯: R5.AC2, R5.AC3, R8.AC7, R10.AC3_

### 2. 扩展 Dashboard Document Durable Sidecar 写回

- [x] 2.1 在 dashboard/editor envelope 类型中把 `sectionRows` 收敛为 `GridEditorSectionRowState`，并导入/复用 `normalizeGridEditorSectionRows()`。

_需求追溯: R2.AC7, R8.AC6, R10.AC1_

- [x] 2.2 扩展 `WriteDashboardRuntimeOptions` 与 `WriteDashboardResponsiveRuntimeOptions`，支持 `sectionRows` 与现有 `editorMetaById` 一起写入。

_需求追溯: R2.AC1, R2.AC7, R8.AC6, R10.AC7_

- [x] 2.3 更新 `writeDashboardRuntimeToDocument()` 的 grid 写回逻辑：写入 layout/profile editor envelope、提升 version、保留 unknown fields，并在删除 item 时清理 orphan metadata 与 section row membership。

_需求追溯: R2.AC7, R8.AC3, R8.AC6, R10.AC4_

- [x] 2.4 更新 `writeDashboardResponsiveRuntimeToDocument()` 的 grid/list 两条分支，确保 list view 不只更新 widgets，也同步 durable editor envelope。

_需求追溯: R2.AC1, R2.AC7, R8.AC3, R8.AC6_

- [x] 2.5 增加 dashboard core/types 测试，覆盖 profile-scoped sidecar 写回、unknown field preservation、删除 item 清理和 list view sidecar。

_需求追溯: R8.AC3, R8.AC6, R10.AC3, R10.AC4_

### 3. 增加 Shell-managed Write-back Opt-in API 与兼容默认行为

- [x] 3.1 增加统一公共类型 `DashboardDocumentWriteBackOwner = "component" | "shell"`，并在 model options、shell options、component props 中使用同名字段。

_需求追溯: R2.AC6, R2.AC9, R4.AC6, R10.AC1, R10.AC7_

- [x] 3.2 更新 `useDashboardResponsiveProfileModel()`：默认保持 component/model write-back；shell 模式下 `onLayoutChange()` 不调用 document write-back，只维护 runtime shadow 与 projection/diagnostic 事件。

_需求追溯: R2.AC6, R4.AC1, R4.AC2_

- [x] 3.3 更新 `DashboardResponsiveVueGridLayout`：新增便捷 prop 透传 `documentWriteBack`，并在 shell 模式下避免把 legacy store 注入为 immediate controller mirror。

_需求追溯: R2.AC9, R4.AC1, R4.AC6, R6.AC2, R6.AC3_

- [x] 3.4 保持未启用 shell-managed 模式的 legacy/component 行为，并补兼容回归测试。

_需求追溯: R2.AC6, R4.AC2, R6.AC1, R6.AC4_

### 4. 实现 Shell Command Commit Coordinator

- [x] 4.1 在 `useDashboardEditorShell()` 中按 `documentWriteBack: "shell"` 订阅 editor `command-commit`，建立 `processedCommandIds` / action id / revision 去重。

_需求追溯: R1.AC1, R1.AC3, R2.AC1, R4.AC4, R4.AC5, R5.AC5_

- [x] 4.2 抽出统一 shell-managed commit coordinator，负责建立 rollback checkpoint、计算 next layout、写回 document、生成 result、更新 uncontrolled document ref、发出 controlled proposal。

_需求追溯: R2.AC1, R2.AC2, R2.AC4, R2.AC5, R4.AC4, R7.AC5_

- [x] 4.3 将现有 explicit shell action 的 `executeEditorMutation()`、placement finalization 和 history mutation 接入同一 coordinator，避免显式 action 与订阅事件产生双 result。

_需求追溯: R1.AC1, R1.AC3, R4.AC1, R4.AC5, R7.AC1, R7.AC2_

- [x] 4.4 在 write-back 失败时恢复 editor/history checkpoint，返回 blocked/error result，并确保失败 command 不进入后续用户可见 undo/redo。

_需求追溯: R2.AC3, R2.AC8, R8.AC4, R8.AC7_

- [x] 4.5 在 adapter commit 失败时执行 rollback/compensation hook，并恢复 editor state、dashboard document proposal 与 history checkpoint。

_需求追溯: R7.AC1, R7.AC3, R7.AC4, R7.AC6_

- [x] 4.6 在 shell-managed 成功后延迟写入 legacy layout-only mirror；失败、noop 和 preview 不写 legacy store。

_需求追溯: R3.AC5, R6.AC2, R6.AC3_

### 5. 接入 Pointer、Resize、External Drop Synthetic Action Result

- [x] 5.1 定义 `pointer-move`、`pointer-resize`、`external-drop` action type 与 synthetic commit data，并在类型测试中覆盖。

_需求追溯: R3.AC6, R9.AC4, R10.AC1, R10.AC7_

- [x] 5.2 从裸 editor `command-commit` 映射 synthetic action：`move` / group move -> `pointer-move`，`resize` -> `pointer-resize`，placement/drop/add/paste -> `external-drop`。

_需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC6_

- [x] 5.3 确保 pointer/resize/drop 的 blocked、cancelled、timeout、error、stale 与 noop 分支清理 pending shell transaction、placeholder、guides、active interaction 和 auto-scroll。

_需求追溯: R3.AC4, R3.AC5, R7.AC3_

- [x] 5.4 为 pointer/resize/drop 增加 shell integration 测试，断言 result stream 包含 command id、action id/source、affected ids、write-back status 和 diagnostics。

_需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC6, R9.AC4, R9.AC6, R10.AC4_

### 6. 统一 Undo/Redo Shell Write-back 路径

- [x] 6.1 将 shell `undo()` / `redo()` 改为通过 editor history replay 后进入同一 shell write-back coordinator。

_需求追溯: R8.AC1, R8.AC2, R8.AC4_

- [x] 6.2 将 keyboard/menu/toolbar/API 触发的 undo/redo 全部路由到 shell history action pipeline。

_需求追溯: R1.AC1, R8.AC2_

- [x] 6.3 处理 undo/redo 的 add/delete/paste/drop geometry、durable metadata 与 sectionRows 写回；纯 selection/focus 变化不写 dashboard document，但仍返回可观察 result。

_需求追溯: R1.AC2, R8.AC3, R8.AC5, R8.AC6_

- [x] 6.4 增加 undo/redo 集成测试，覆盖 write-back 失败恢复、redo stack 一致、selection-only 不写 document、sidecar 恢复。

_需求追溯: R8.AC1, R8.AC4, R8.AC5, R8.AC6, R8.AC7, R10.AC3, R10.AC4_

### 7. 迁移 Dogfood Workbench 与示例结果面板

- [x] 7.1 找到现有 dashboard runtime lab / shell 示例入口，将主流程切到 `useDashboardEditorShell()` + editor command history + shell-managed document write-back。

_需求追溯: R9.AC1, R1.AC3_

- [x] 7.2 示例覆盖 drag、resize、drop、toolbar add/remove、paste、undo、redo、profile switch 和 layout settings migration，并在同一 result/diagnostic 面板展示。

_需求追溯: R9.AC2, R9.AC4, R9.AC6_

- [x] 7.3 示例保留 legacy history 展示时明确标记为 compatibility / layout-only，不作为推荐 dashboard editor 主路径。

_需求追溯: R1.AC4, R6.AC4, R6.AC5, R9.AC3_

- [x] 7.4 增加 examples/headless 测试，覆盖无重复 `documentChange`、无重复 history push、undo/redo 不分叉和 synthetic pointer/drop result。

_需求追溯: R9.AC5, R9.AC6, R10.AC5_

### 8. 更新 Public Exports、README 与迁移说明

- [x] 8.1 同步 ESM/CJS public exports 与类型测试，确保 editor subscription、rollback checkpoint、documentWriteBack API 和 synthetic action types 可被消费。

_需求追溯: R10.AC1, R10.AC7_

- [x] 8.2 更新 README：说明 shell/editor history、dashboard wrapper `documentChange`、legacy `historyStore` 三者职责边界和推荐迁移路径。

_需求追溯: R1.AC4, R6.AC5, R10.AC2_

- [x] 8.3 文档中标注 compatibility path 的限制：legacy undo/redo 不承诺 shell adapter transaction、selection/focus 或 metadata 恢复。

_需求追溯: R1.AC4, R6.AC4, R6.AC5_

### 9. 总体验证与交付检查

- [x] 9.1 跑 editor、dashboard shell、dashboard responsive、examples 和 type tests，修复由新 API 与行为变更引入的失败。

_需求追溯: R10.AC3, R10.AC4, R10.AC6_

- [x] 9.2 跑仓库标准验证命令：`npm test`、`npm run test:examples`、`npm run check:package`、`npm run build`；如涉及 browser smoke，再跑 `npm run test:browser`。

_需求追溯: R9.AC5, R10.AC5, R10.AC6_

- [x] 9.3 交付说明中列出新主线、兼容路径、未运行验证缺口和迁移注意事项。

_需求追溯: R1.AC4, R6.AC5, R10.AC2, R10.AC6_

## T9 交付检查记录

- 新主线: dashboard editor 应使用 editor command history + `useDashboardEditorShell({ documentWriteBack: "shell" })`，并把 `documentWriteBack="shell"` 同步到 dashboard profile model 与 `DashboardResponsiveVueGridLayout`。
- 兼容路径: `@marsio/vue-grid-layout/history` / `historyStore` 仍保留为 layout-only compatibility，不承诺 shell adapter transaction、selection/focus、`editorMetaById`、`sectionRows` 或 dashboard persistence 恢复。
- 迁移注意事项: 不要同时让 component `documentChange` 和 shell-managed write-back 处理同一个 dashboard editor commit；受控调用方仍需在 `onDocumentChange` 里显式持久化 proposed document。
- 验证缺口: 无。已运行 `npm test`、`npm run test:examples`、`npm run check:package`、`npm run check:bundle`、`npm run build`、`npm run test:package`、`npm run test:browser`。

## Final Coverage Gate

日期: 2026-05-26

### Requirements

- R1: Command History 成为 Dashboard 编辑唯一主线 — covered — evidence: `lib/dashboard-editor-shell/useDashboardEditorShell.ts` 将 shell action、placement、pointer synthetic 和 undo/redo 收敛到 editor command/result pipeline；`example/25-dashboard-editor-shell.js` 主流程使用 shell-managed write-back；README 标注 legacy history 为 compatibility path。
- R2: Shell 承接 Dashboard Document Write-back — covered — evidence: `lib/dashboard-editor-shell/useDashboardEditorShell.ts` 的 shell-managed coordinator 写回 profile-scoped document、发出 result、失败恢复 rollback checkpoint；`lib/dashboard.ts` 与 `lib/dashboard-responsive/resolve.ts` 写回 `editorMetaById`/`sectionRows`；`test/dashboard-editor-shell-core.test.ts` 覆盖 write-back 成功、受控 proposal、失败 rollback。
- R3: Pointer、Resize 和 Drop Commit 接入 Shell 事务 — covered — evidence: `lib/dashboard-editor-shell/useDashboardEditorShell.ts` 将 `move`/`resize`/`add`/`paste` 映射到 `pointer-move`、`pointer-resize`、`external-drop`；`test/dashboard-editor-shell-core.test.ts` 覆盖 synthetic pointer/resize/drop result 以及 blocked/cancelled/timeout/error/stale cleanup。
- R4: 防止双写与状态回声 — covered — evidence: `lib/dashboard-responsive/useDashboardResponsiveProfileModel.ts` 在 `documentWriteBack: "shell"` 下跳过 component document write-back；`lib/DashboardResponsiveVueGridLayout.tsx` 只透传 prop 并禁用 immediate legacy mirror；`scripts/check-doc-imports.mjs` 断言 shell demo 无 `@documentChange`/`historyStore` 主路径。
- R5: Editor Event Subscription 成为可组合观察面 — covered — evidence: `lib/editor/controller.ts` 实现 `subscribe()`、多监听器派发和 listener error diagnostic；`lib/editor/types.ts` 暴露 `GridEditorEventListener`；`test/editor-core.test.ts` 覆盖多监听器、cleanup 幂等、错误隔离。
- R6: Legacy History 仅作为 Layout-only 兼容镜像 — covered — evidence: `lib/dashboard-editor-shell/useDashboardEditorShell.ts` 只在 shell-managed 成功后延迟镜像 layout；`README.md` 和 `example/24-dashboard-runtime-lab.js` 标注 legacy history 为 compatibility / layout-only；`test/dashboard-editor-shell-core.test.ts` 覆盖 legacy mirror 不污染 sidecar。
- R7: Adapter Transaction 与 Business Payload 一致性 — covered — evidence: `lib/dashboard-editor-shell/transactions.ts` 保持 `prepare -> mutate/write-back -> commit -> rollback`；`lib/dashboard-editor-shell/useDashboardEditorShell.ts` 在 placement/widget/reference adapter 失败时恢复 editor/history/document proposal；`test/dashboard-editor-shell-core.test.ts` 覆盖 adapter commit failure rollback 与 diagnostics。
- R8: Undo/Redo 统一穿过 Shell Write-back — covered — evidence: `lib/dashboard-editor-shell/useDashboardEditorShell.ts` 的 `actions.undo()`/`actions.redo()` 通过 editor history replay 后调用同一 write-back coordinator；`test/dashboard-editor-shell-core.test.ts` 覆盖 add/delete/paste/drop、selection-only、sidecar 恢复、write-back failure 与 redo stack 一致性。
- R9: Dogfood Workbench 迁移与真实链路验证 — covered — evidence: `example/25-dashboard-editor-shell.js` 使用 `documentWriteBack: "shell"` 并展示 result/diagnostic stream、synthetic pointer/resize/drop；`example/24-dashboard-runtime-lab.js` 标注 legacy compatibility；`npm run test:examples` 和 `npm run test:browser` 已通过。
- R10: Public API、文档与测试覆盖 — covered — evidence: `test/editor-types.test.ts`、`test/dashboard-types.test.ts`、`scripts/test-package-consumers.mjs` 覆盖 public 类型/ESM/CJS 消费；`README.md` 记录迁移路径和 API 边界；标准验证命令全部通过。

### Design

- 架构概述 — covered — evidence: `GridEditorController` command history、`useDashboardEditorShell({ documentWriteBack: "shell" })`、responsive model/component compatibility path 和 legacy layout-only mirror 均已在代码与 README 中落地。
- 数据流图 — covered — evidence: editor command commit、shell synthetic/explicit action、document write-back、adapter commit、失败 rollback、controlled refresh acknowledgement 分别由 `lib/editor/controller.ts`、`lib/dashboard-editor-shell/useDashboardEditorShell.ts` 和 `lib/dashboard-responsive/useDashboardResponsiveProfileModel.ts` 实现并测试。
- GridEditorController 接口 — covered — evidence: `lib/editor/types.ts` 暴露 `subscribe()`、`createRollbackCheckpoint()`、`restoreRollbackCheckpoint()`；`lib/editor/history.ts` 暴露 `checkpoint()`/`restore()`；`test/editor-core.test.ts` 覆盖行为。
- Dashboard Responsive Profile Model — covered — evidence: `lib/dashboard-responsive/types.ts` 与 `lib/dashboard-responsive/useDashboardResponsiveProfileModel.ts` 增加 `documentWriteBack` opt-in，并在 shell 模式下停止 component-owned document mutation。
- DashboardEditorShell — covered — evidence: `lib/dashboard-editor-shell/types.ts` 暴露 `documentWriteBack` 与 synthetic action types；`lib/dashboard-editor-shell/useDashboardEditorShell.ts` 实现订阅、去重、rollback checkpoint、legacy mirror 延迟写入和 result emission。
- Dashboard Document Write-back — covered — evidence: `lib/dashboard.ts` 与 `lib/dashboard-responsive/resolve.ts` 写回 durable `editorMetaById`/`sectionRows`，并在删除 item 时清理 orphan sidecar；`test/dashboard-core.test.ts` 覆盖 grid/list/profile scoped 写回。
- Legacy History — covered — evidence: shell-managed 模式不再把 `historyStore` 作为 immediate controller mirror，成功后只推送 layout snapshot；README 与示例明确 compatibility path 限制。
- API 接口设计 — covered — evidence: `DashboardDocumentWriteBackOwner`、model/shell/component options、editor listener/checkpoint 类型、synthetic action data 和 write-back sidecar options 均在 public 类型与 package consumer 测试中可用。
- 数据模型与数据库变更 — covered — evidence: 无数据库变更；dashboard editor envelope 保持兼容扩展，写入 `editorMetaById`、`sectionRows` 和 version，selection/focus 未写入 document。
- 安全考量 — covered — evidence: adapter diagnostics 只暴露 stage/id/status/error code 级信息，listener error 被隔离，controlled document 只发 proposal，shell-managed 去重并在 stop/unmount 清理订阅/transaction。
- 测试策略与验证命令 — covered — evidence: `npm test`、`npm run test:examples`、`npm run check:package`、`npm run check:bundle`、`npm run build`、`npm run test:package`、`npm run test:browser` 均已通过。
- 需求追踪 — covered — evidence: tasks 1-9 均保留 `_需求追溯` 映射，且本 coverage gate 对 R1-R10 逐项给出 evidence。

### Tasks

- Task 1: Editor Event Subscription 与 History Checkpoint 基础 — covered — evidence: `lib/editor/types.ts`、`lib/editor/history.ts`、`lib/editor/controller.ts` 和 `test/editor-core.test.ts`/`test/editor-types.test.ts` 已实现并验证。
- Task 2: Dashboard Document Durable Sidecar 写回 — covered — evidence: `lib/dashboard.ts`、`lib/dashboard-responsive/resolve.ts`、`test/dashboard-core.test.ts` 和 `test/dashboard-types.test.ts` 覆盖 sidecar 写回、unknown field preservation 与 orphan cleanup。
- Task 3: Shell-managed Write-back Opt-in API 与兼容默认行为 — covered — evidence: model/shell/component 均支持 `documentWriteBack`，默认 component 行为保留，shell 模式跳过 component-owned write-back。
- Task 4: Shell Command Commit Coordinator — covered — evidence: `useDashboardEditorShell()` 统一处理 explicit/synthetic/history action 的 write-back、rollback、controlled proposal、去重和 legacy mirror。
- Task 5: Pointer、Resize、External Drop Synthetic Action Result — covered — evidence: synthetic action types、mapping、result data 与 cleanup 分支由 shell 实现，`test/dashboard-editor-shell-core.test.ts` 覆盖。
- Task 6: Undo/Redo Shell Write-back 路径 — covered — evidence: shell undo/redo 走 editor history replay 和同一 write-back coordinator，相关集成测试覆盖 sidecar、selection-only 和失败恢复。
- Task 7: Dogfood Workbench 与示例结果面板 — covered — evidence: `example/25-dashboard-editor-shell.js` 已迁移到 shell-managed 主线并展示 result/diagnostic stream，`scripts/check-doc-imports.mjs` 和 examples/headless/browser 验证通过。
- Task 8: Public Exports、README 与迁移说明 — covered — evidence: README、public 类型测试、package consumer 脚本和 build artifact 均已更新并验证。
- Task 9: 总体验证与交付检查 — covered — evidence: T9 交付检查记录已列出主线、兼容路径、迁移注意事项和无验证缺口；标准验证命令全部通过。

### Remaining gaps/risks

- 无。
