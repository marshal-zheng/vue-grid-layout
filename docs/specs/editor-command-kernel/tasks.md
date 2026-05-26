# Editor Command Kernel 实现任务

- [x] 1. 扩展命令、history、guard 和结果类型契约
  - 在 `lib/editor/types.ts` 增加 `GridEditorHistoryMode`、`GridEditorHistoryPolicy`、external apply options、扩展 `GridEditorCommandSource`、`origin`、beforeCommand context、diagnostics 和 blocked reason。
  - 保留 `command.history.skip` 兼容解析，并同步 `typings/index.d.ts`、editor exports 和 CJS 导出边界。
  - 明确 `select`、`clearSelection`、focus 类命令默认 `history: "ignore"`，为未来 opt-in `record-preserveRedoStack` 留类型入口。
  _需求追溯: R2.AC1, R2.AC3, R3.AC5, R4.AC1, R7.AC4, R7.AC5, R7.AC7, R8.AC1, R8.AC4, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6_

- [x] 2. 建立内建 command registry 与 descriptor 默认值
  - 新增 `lib/editor/commandRegistry.ts`，集中声明内建 command 的 type、labelKey、source、影响范围、risk、默认 history、互斥 scope、target 解析和 payload 校验。
  - 将 `toolbar.ts` 的可用性和 messageKey 派生改为使用 descriptor，同时保留现有 toolbar 排序和 `canExecute()` 同步检查。
  - 将新增命令入口的约束写成内部 helper，确保后续能力通过 descriptor 接入，而不是新增分散提交分支。
  _需求追溯: R1.AC4, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5_

- [x] 3. 引入 transaction preview 与原子提交模型
  - 新增 `lib/editor/transactions.ts`，定义 transaction、preview、summary、layout/metadata/section row patch 汇总和 state revision。
  - 把现有 layout、metadata、section row、selection 变更整理为 transaction builder 或 adapter，让 handler 返回 after snapshot/patches，而不是直接写响应式状态。
  - 保证 preview 不携带 DOM Event、VNode、DOM node 等不可序列化对象，并在 state revision 变化时能判定 stale。
  _需求追溯: R4.AC2, R4.AC3, R4.AC4, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R12.AC2_

- [x] 4. 扩展 editor history 策略、mark、bail 与 squash
  - 在 `lib/editor/history.ts` 支持 `push`、`replacePresent` 的 `preserveRedoStack` options，并实现 `record`、`ignore`、`record-preserveRedoStack`、`replace`、`clear` 解析。
  - 增加 interaction mark、bailToMark、squashToMark 或等价 helper，用于连续拖拽/resize/drop 成功后一条 history、取消后回到 committed snapshot。
  - 保持 legacy `lib/history.ts` 和 `historyStore` 公共契约不变，避免 editor history 与 legacy layout-only history 双写污染。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R8.AC2, R8.AC5, R11.AC1, R11.AC3, R11.AC4_

- [x] 5. 实现 Command Kernel 编排层
  - 新增 `lib/editor/commandKernel.ts`，负责 normalize、descriptor 默认值、同步校验、transaction preview、pending guard scope lock、guard timeout、AbortSignal、stale 检查和 finalize。
  - 默认在同一 scope 有 pending guard 时拒绝互斥 command，返回稳定 `blocked` 结果，并防止重复弹框、嵌套死锁和卸载后提交。
  - 隔离 `onEvent` 抛错，保持事件为观察面；阻塞逻辑只通过 guard 完成。
  _需求追溯: R1.AC1, R1.AC2, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R4.AC1, R4.AC3, R4.AC4, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC5, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6_

- [x] 6. 将 `GridEditorController` 接入 Kernel
  - 改造 `controller.execute()` 委托 Command Kernel，并把 `executeMutation` 内的变更逻辑逐步拆成 transaction builder/commit adapter。
  - 保持 `canExecute()` 同步、无 guard、副作用可控；undo/redo/save/discard/reset 继续返回现有 result 语义。
  - 改造 `setExternalLayout()`、`setExternalLayouts()`，默认 source/origin 为 external/programmatic、`history: "ignore"` 且保留 redo；显式 replace/load/reset 才清 redo。
  _需求追溯: R1.AC2, R5.AC2, R5.AC4, R7.AC4, R7.AC5, R7.AC7, R8.AC1, R8.AC2, R8.AC4, R8.AC5, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6_

- [x] 7. 命令化 pointer drag、resize 和 drop 提交
  - 在 `gridInteractionTypes.ts` 和 `useGridEditorRuntime.ts` 增加交互提交 adapter，让 drag stop 构造 `move` command，resize stop 构造 `resize` command，drop commit 构造 `add` 或必要的 drop command。
  - 改造 `useGridDragResizeInteractions.ts` 和 `useGridDropInteractions.ts`，把 durable `onLayoutMaybeChanged(..., "push")`、`emitDragStop`、`emitResizeStop`、`emitDrop` 移到 Kernel allow 后。
  - guard block/cancel/timeout/stale 时恢复 committed layout，并清理 placeholder、guides、active interaction、auto-scroll 和 suppress 状态。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R7.AC1, R7.AC2, R7.AC3, R8.AC1, R12.AC7_

- [x] 8. 收敛 persistence、external/remote 与 legacy 兼容边界
  - 将 persistence load、remote subscribe、父组件 v-model 和 runtime repair 统一标记为 external/programmatic 来源，默认不进入用户 undo 栈且保留 redo。
  - 组件卸载、editor.stop、external layout 替换或 persistence reset 时取消 pending guard，并避免过期 command 提交。
  - README 中标注 legacy `historyStore` 是 layout-only compatibility layer，新 guard、metadata、selection、sectionRows 和 transaction 能力只在 editor command kernel 中承诺。
  _需求追溯: R1.AC3, R8.AC2, R8.AC3, R8.AC5, R10.AC2, R11.AC1, R11.AC2, R11.AC3, R11.AC4_

- [x] 9. 补齐 editor core 单元测试
  - 在 `test/editor-core.test.ts` 增加 registry、history policy、controller execute/canExecute、selection/focus ignore、external apply preserve redo、undo/redo guard 的测试。
  - 新增或扩展 command kernel 单元测试，覆盖 guard allow/block/cancel/timeout/error、pending guard reject、state revision stale、onEvent 抛错隔离和稳定 result status。
  - 覆盖 transaction preview 字段、history entry source/origin/affectedIds、mergeKey 与 mark/squash 优先级。
  _需求追溯: R2.AC1, R2.AC2, R2.AC4, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R8.AC4, R9.AC2, R9.AC3, R10.AC1, R10.AC2, R10.AC4, R10.AC5, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6, R12.AC7_

- [x] 10. 补齐交互、浏览器、类型和回归测试
  - 在 `test/grid-layout-internal-core.test.ts` 覆盖 drag/resize/drop allow 后提交、block/cancel 后 rollback 和 cleanup。
  - 在 `test/editor-component-browser.test.js` 或新增 browser case 中模拟异步确认 Promise，验证 preview、确认后 commit、取消后视觉回滚。
  - 保留 `test/grid-layout-contract-browser.test.js` 的 legacy drop 合约，新增启用 editor 的 command path 断言；同步 `test/dashboard-editor-shell-types.test.ts` 或类型测试。
  _需求追溯: R5.AC4, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R9.AC4, R11.AC1, R11.AC3, R12.AC7_

- [x] 11. 更新文档、示例与迁移说明
  - 更新 README 专业编辑器章节，说明 Command Kernel 顺序、beforeCommand preview、history policy、事件只是观察面、legacy history 限制和迁移建议。
  - 增加业务确认弹框示例，覆盖 undo/delete/reset/drop 等高风险命令，并说明核心库不内建 modal UI。
  - 在文档中标出暂未命令化或保留兼容路径的入口、source/origin 语义和 external/programmatic redo 保留策略。
  _需求追溯: R1.AC3, R3.AC6, R8.AC1, R8.AC2, R8.AC5, R9.AC1, R9.AC4, R11.AC2_

- [x] 12. 收口 spec review 发现的长期收益缺口
  - 让 pending guard 的 `AbortSignal` 真正参与等待竞争，`editor.stop`、external apply 和受控 ref 外部变化能及时取消过期 command。
  - 让 controller 监听受控 `layout`、`layouts`、`selectedIds` 的外部写入，统一 bump state revision、保留 redo、清理 interaction 并避免内部提交被误判为 external。
  - 将 controller 的 layout、metadata、section row、selection 命令收敛到 `GridEditorTransaction` after snapshot 后再统一 apply/history，避免 handler 分散写响应式状态。
  - 扩展 guard preview，覆盖 metadata、section row、selection、add、duplicate、align/distribute/tidy 等命令的 after snapshot/patch 汇总，并同步 descriptor typings 与 `canExecute()` 校验。
  - 补充 editor core 测试，覆盖 guard cancel/timeout/error/abort、direct external ref abort、descriptor validation 和 preview patch 覆盖。
  _需求追溯: R2.AC2, R2.AC4, R3.AC3, R3.AC4, R3.AC5, R4.AC2, R4.AC3, R4.AC4, R8.AC2, R8.AC5, R10.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6, R12.AC7_
