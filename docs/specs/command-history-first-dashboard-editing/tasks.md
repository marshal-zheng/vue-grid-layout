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

- [ ] 8.1 同步 ESM/CJS public exports 与类型测试，确保 editor subscription、rollback checkpoint、documentWriteBack API 和 synthetic action types 可被消费。

_需求追溯: R10.AC1, R10.AC7_

- [ ] 8.2 更新 README：说明 shell/editor history、dashboard wrapper `documentChange`、legacy `historyStore` 三者职责边界和推荐迁移路径。

_需求追溯: R1.AC4, R6.AC5, R10.AC2_

- [ ] 8.3 文档中标注 compatibility path 的限制：legacy undo/redo 不承诺 shell adapter transaction、selection/focus 或 metadata 恢复。

_需求追溯: R1.AC4, R6.AC4, R6.AC5_

### 9. 总体验证与交付检查

- [ ] 9.1 跑 editor、dashboard shell、dashboard responsive、examples 和 type tests，修复由新 API 与行为变更引入的失败。

_需求追溯: R10.AC3, R10.AC4, R10.AC6_

- [ ] 9.2 跑仓库标准验证命令：`npm test`、`npm run test:examples`、`npm run check:package`、`npm run build`；如涉及 browser smoke，再跑 `npm run test:browser`。

_需求追溯: R9.AC5, R10.AC5, R10.AC6_

- [ ] 9.3 交付说明中列出新主线、兼容路径、未运行验证缺口和迁移注意事项。

_需求追溯: R1.AC4, R6.AC5, R10.AC2, R10.AC6_
