# Editor 多选组移动核心实现任务

- [x] 1. 扩展 layout engine 公开类型与 blocked reason
  - 在 `lib/layout-engine/types.ts` 为 `LayoutOperation` 增加 `groupMove` union member，字段包含 `ids`、`dx`、`dy`、`activeId?`、`userAction?`。
  - 在 layout engine / editor 相关 blocked reason 类型中补充 `unsupported`，用于 legacy/disabled engine 或 headless controller 缺少 engine options 的 multi-item group move 阻断结果。
  - 确保 `LayoutDiagnostics.operationType`、`LayoutDebugSummary.operation`、scheduler、executor、workerRuntime 和 public exports 可以接受 `groupMove`。
  - 更新 `typings/index.d.ts`、`lib/cjs.ts` 或相关类型出口，保持 TypeScript 使用者可编译。
  _需求追溯: R2.AC1, R2.AC4, R2.AC6, R5.AC6, R7.AC1, R7.AC4, R7.AC6_

- [x] 2. 实现 `groupMove` 输入归一化与基础 blocked 校验
  - 在 `lib/layout-engine/core.ts` 增加 `normalizeGroupMove()` 或等价 helper，去重并保序处理 ids，校验 empty ids、missing ids、非有限 `dx/dy`。
  - 将 `dx/dy` 归一化为整数 grid delta，并解析 `activeId` 回退规则。
  - 对 selected moving item 中的 `static: true` 返回 `static-item` blocked result，除非上层已经过滤。
  - 对目标几何进行 `bounds`、`maxRows` 校验，blocked 时保持 committed layout 不变并返回相关 ids。
  - 为 `ids.length === 1` 的 `groupMove` 保证与同 delta 的单 item move 等价。
  _需求追溯: R2.AC2, R2.AC3, R2.AC5, R3.AC2, R3.AC6, R3.AC7, R4.AC2_

- [x] 3. 实现 group-aware 碰撞、static 障碍物与 overlap 策略
  - 在 layout engine 中新增 `executeGroupMove()` 并接入 `executeLayoutOperationWithIndex()` dispatch。
  - 计算 target items 时把 moving ids 视为同一移动集合，组内既有碰撞或 overlap 不作为外部碰撞阻塞。
  - 检查组外 `static: true` item，任何碰撞均返回 `static-item` blocked，即使 `preventCollision=false`。
  - 在 `preventCollision=true && allowOverlap=false` 时，对组外碰撞返回 `collision` blocked 并列出组外 item ids。
  - 在 `allowOverlap=true` 时允许 group 与组外 item overlap，并返回 patches、active placeholder 和 diagnostics。
  _需求追溯: R3.AC1, R3.AC3, R3.AC4, R3.AC7, R3.AC9, R4.AC2_

- [x] 4. 实现 `preventCollision=false` 的组外推动与 compact 结果
  - 设计 group-aware collision resolution，让移动组作为 rigid set 应用，组外非 static item 可被推动或重新压缩。
  - 复用现有 `moveElement()` / `moveElementAwayFromCollision()` / final compaction 规则，必要时新增局部 helper，避免改坏单 item move。
  - 覆盖 `compactType: "vertical" | "horizontal" | null` 下的结果稳定性。
  - 确保 patches 和 `affectedIds` 同时包含组内 moved ids 与被推动/compact 的组外 ids。
  _需求追溯: R3.AC5, R3.AC8, R7.AC2, R8.AC1_

- [x] 5. 接入 scheduler、executor、workerRuntime 与 interaction controller
  - 在 `lib/layout-engine/scheduler.ts` 的 commitOnly preview 中支持 `groupMove`，根据 `activeId` 或首个 id 返回 active placeholder。
  - 在 `lib/grid-layout/useGridLayoutEngineBridge.ts` 明确 `groupMove` preview/commit 的 executor 策略：pointer preview 优先保持主线程/scheduler 路径，commit 可进入 worker/custom executor。
  - 在 `lib/layout-engine/vueAdapter.ts` 中让 group drag 使用 `activeId` 作为 interaction `itemId`，并确保 rebase 时可以重新执行上一条 `groupMove` preview。
  - 调整 `compareWithLegacyLayout()` 或 bridge legacy comparison，multi-id `groupMove` 不产生无意义 legacy mismatch，single-id 可与等价 `move` 比较。
  - 覆盖 workerRuntime 对 sanitized `groupMove` request 的透传。
  _需求追溯: R2.AC4, R2.AC5, R5.AC1, R5.AC3, R5.AC5, R7.AC6, R8.AC1_

- [x] 6. 为 editor controller 提供 engine runner/options
  - 在 `UseGridEditorOptions` 增加内部 layout operation runner 或 engine options provider，使 headless controller 的 keyboard/API group move 能调用 layout engine。
  - 在 `lib/grid-layout/useGridEditorRuntime.ts` 创建内部 controller 时注入 runner，runner 复用 `useGridLayoutEngineBridge` 的当前 options。
  - 对外部传入 `editor.controller` 或 headless `createGridEditorController()`，支持显式传入 runner/options；缺少 runner/options 且需要 multi-item group move 时返回 `unsupported` blocked。
  - 保持单 target absolute `x/y` 的现有单 item move 语义，不强制要求 runner。
  - 将 engine result 的 patches、affected ids、blocked reason、diagnostics 和 undo metadata 合并回 `GridEditorCommandResult`。
  _需求追溯: R2.AC4, R4.AC1, R4.AC5, R5.AC6, R6.AC1, R6.AC2, R6.AC3, R7.AC2, R7.AC3_

- [x] 7. 重构 controller `move` command 的 groupMove 分支
  - 在 `lib/editor/controller.ts` 的 `execute({ type: "move" })` 分支中，保留 single absolute move，multi target 或多选相对 move 生成 `groupMove`。
  - 复用 `checkGridEditorCommand()` 的 capability、`locked`、hidden、missing、static 判断，在调用 engine 前得到 allowed/blocked ids。
  - `commandPolicy="skip-blocked"` 时只把 allowed ids 传给 `groupMove`，并在 result 中返回 `skippedIds` 与 blocked reason。
  - `commandPolicy="all-or-nothing"` 或默认策略下，任一 selected target 不可移动时阻止整个 group move。
  - 保留 section row locked/collapsed 与 `beforeCommand` guard 的 engine 前阻断顺序。
  - 确保 `locked` 不传入 layout engine 作为物理障碍物，`static` 继续作为 layout 层固定语义。
  _需求追溯: R4.AC1, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R6.AC1, R6.AC3, R7.AC2, R7.AC3_

- [x] 8. 扩展 editor runtime 给 pointer interaction 使用的同步 helper
  - 在 `lib/grid-layout/gridInteractionTypes.ts` 扩展 `GridInteractionsEditor`，提供读取 selection、判断 multi-selection drag、请求单选、发出 pointer blocked feedback 的内部 helper。
  - 在 `lib/grid-layout/useGridEditorRuntime.ts` 实现这些 helper，复用 controller selection、`resolveEditorItemCapability()`、mode 和 metadata。
  - dragged item 在当前多选 selection 中时返回 group context；dragged item 不在 selection 中时先请求单选并返回 single context。
  - view mode、不可拖拽、capability blocked、legacy/disabled engine multi group move 均返回 structured blocked，不修改 committed layout。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R4.AC1, R4.AC5, R5.AC6, R7.AC3, R7.AC4_

- [x] 9. 接入 `useGridDragResizeInteractions` pointer group drag context
  - 在 `lib/grid-layout/useGridDragResizeInteractions.ts` 增加 `ActiveMoveContext` transient 状态，区分 single、group 和 blocked。
  - `onDragStart` 使用 editor runtime helper 建立 context，并对 group drag 调用 `engineBridge.start({ type: "drag", itemId: activeId })`。
  - `onDrag` 中 group context 使用 snapped active item 计算 `dx/dy`，向 `engineBridge.preview()` 发 `groupMove`。
  - `onDragStop` 中 group context 使用 active placeholder/final geometry 计算同一 `dx/dy`，向 `engineBridge.commit()` 发 `groupMove`。
  - legacy/disabled engine 下的 multi-item group move 只发 blocked feedback；未启用 editor、单选或 single item move 保持现有行为。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC5, R1.AC6, R5.AC1, R5.AC4, R5.AC6, R7.AC4_

- [x] 10. 统一 preview、placeholder、guides、HUD 与 blocked feedback
  - pointer group drag preview 只更新 transient layout、active placeholder、guides、HUD 和 drag blocked state，不写 history 或 persistence。
  - 第一版继续使用 active item placeholder；在 guide/HUD diagnostics 中暴露 selected count、`dx/dy`、blocked ids 或 skipped ids。
  - blocked preview 保留最近 committed layout 或上一可用 preview，并允许同一次 interaction 后续恢复。
  - 复用 scheduler 的 `stale`、`fallback`、`blocked`、`error` 处理路径。
  - 确保 `VueGridLayout.tsx` 只消费 placeholder/block class，不承载 group move 核心计算。
  _需求追溯: R3.AC7, R5.AC1, R5.AC2, R5.AC3, R5.AC5, R7.AC6_

- [x] 11. 保持 history、undo/redo、persistence 和 responsive 语义一致
  - pointer group drag 只在 drag stop commit 边界创建一条 history entry。
  - keyboard 连续 group move 继续使用 `keyboard-move` merge key 和 merge window。
  - undo/redo 恢复 group move 后同步 layout、selection、active item、dirty state 和 editor events。
  - group move commit 沿用 `onLayoutMaybeChanged()`，preview 不触发 durable persistence。
  - `ResponsiveVueGridLayout` 只影响当前 breakpoint active layout，breakpoint 切换沿用现有 `setExternalLayouts()` 和 selection 清理规则。
  _需求追溯: R5.AC1, R5.AC4, R6.AC4, R6.AC5, R6.AC6, R7.AC5_

- [x] 12. 补齐 layout engine 单元测试
  - 在 `test/layout-engine-core.test.ts` 覆盖 group move 成功、多 id patches、empty ids、duplicate ids、missing id、非有限 `dx/dy`。
  - 覆盖 selected static item、组外 static 障碍物、bounds、maxRows、preventCollision blocked。
  - 覆盖 `preventCollision=false` 推动/compact 组外非 static item，并断言 affected ids 包含组外 ids。
  - 覆盖 `allowOverlap=true`、`compactType` 组合、single-id 等价语义。
  - 覆盖 scheduler commitOnly placeholder、executor、workerRuntime、legacy comparison 对 `groupMove` 的行为。
  _需求追溯: R2.AC2, R2.AC3, R2.AC4, R2.AC5, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC8, R3.AC9, R8.AC1_

- [x] 13. 补齐 editor controller 与 keyboard/API 测试
  - 在 `test/editor-core.test.ts` 覆盖 selection 多选下 keyboard/API move 解析为 `groupMove`。
  - 覆盖 explicit 多 target move、单 target absolute `x/y`、locked filtering、hidden/不可拖拽 filtering。
  - 覆盖缺少 engine runner/options 时 multi group move 返回 `unsupported`，传入 runner/options 后正常提交。
  - 覆盖 `skip-blocked` changed + skipped ids、`all-or-nothing` blocked、section row policy、engine blocked reason 映射为 command result。
  - 覆盖 group move history entry、keyboard merge、undo/redo 后 selection 与 dirty state 同步。
  _需求追溯: R4.AC1, R4.AC3, R4.AC4, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R7.AC2, R7.AC3, R8.AC2_

- [x] 14. 补齐 grid layout interaction 与浏览器交互测试
  - 在 `test/grid-layout-internal-core.test.ts` 或新增内部测试中覆盖 interaction helper 与 `ActiveMoveContext` 解析。
  - 在 `test/editor-component-browser.test.js` 覆盖 `Ctrl/Cmd + 点击` 多选后拖动已选 item 整组移动。
  - 覆盖拖动未选 item 切换单选并只移动该 item。
  - 覆盖 locked selected item 的 skipped/blocked feedback、selected static 或组外 static blocked、view mode blocked、legacy path blocked。
  - 覆盖 responsive 当前 breakpoint group move 不污染其他 breakpoint。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC6, R4.AC5, R4.AC6, R5.AC6, R7.AC3, R7.AC4, R7.AC5, R8.AC3_

- [x] 15. 更新示例、README 与发布质量门
  - 更新 `example/23-professional-dashboard-editor.js`，展示多选组移动、`locked` 与 `static` 区别、`skip-blocked` 反馈。
  - 更新 README 或相关文档，说明 `groupMove` engine-first 语义、commandPolicy、collision/bounds、legacy 限制和 no computer use 验证约束。
  - 运行 TypeScript 类型检查，确认新增 `groupMove` union 不破坏 source types 和 `typings/index.d.ts`。
  - 运行 build，确认 CommonJS/UMD 入口和示例编译通过。
  - 运行 layout engine core tests、editor core tests、grid layout interaction/browser smoke test。
  - 记录任何已知限制：无 group resize、无 group bounding box ghost、legacy path 不支持 multi-item group move。
  - 全程不使用 computer use。
  _需求追溯: R2.AC6, R7.AC1, R7.AC4, R8.AC4, R8.AC5, R8.AC6_

- [x] 16. 补齐 spec review 发现的覆盖缺口
  - `skip-blocked` 后即使只剩一个 allowed id，只要原始 move 请求来自多选或多 target，也继续走 layout engine `groupMove`，避免绕过 collision/bounds/static 规则。
  - pointer group drag preview/commit 保留 layout engine blocked reason、item ids 和 diagnostics，并在 commit blocked 时发出 command pipeline 兼容反馈。
  - browser smoke 使用真实 Ctrl/Cmd-click + pointer drag 覆盖多选拖拽整组移动，以及拖动未选 item 切换单选并只移动该 item。
  _需求追溯: R4.AC3, R5.AC3, R6.AC3, R7.AC3, R7.AC6, R8.AC3_
