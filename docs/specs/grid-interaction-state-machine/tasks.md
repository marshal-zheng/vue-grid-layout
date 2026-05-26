# Grid 交互状态机实现任务

- [x] 1. 建立纯 TypeScript interaction state machine core
  - 新增 `lib/interaction-state-machine/`，包含 `types.ts`、`thresholds.ts`、`reducer.ts`、`index.ts`。
  - 定义 `GridInteractionState`、`GridInteractionEvent`、`GridInteractionEffect`、`GridInteractionDiagnostics`、`GridDragActivationDistance`、pointer kind、geometry/cell/size 等内部类型。
  - 实现默认阈值解析：mouse/pen 为 4px，touch/coarse 为 8px，数字配置和 pointer-kind map 配置都可归一化；`0` 保留立即激活兼容语义。
  - 确保 core 不依赖 Vue、DOM、raw Event、VNode、layout engine 或 editor controller，只返回 state + effect intents。
  _需求追溯: R1.AC1, R1.AC2, R1.AC5, R1.AC7, R2.AC6, R7.AC5, R8.AC1, R8.AC2, R8.AC3, R8.AC7_

- [x] 2. 实现 core reducer 的 drag / resize / drop 状态转换
  - 实现 `idle -> pending-drag -> active-drag -> committing -> idle`，未过阈值 stop 作为 click-like cleanup，不产生 drag lifecycle effect。
  - 实现 active drag 坐标未变化 no-op、坐标变化产生 preview effect、stop before moved cleanup、stop after moved commit effect。
  - 实现 resize handle start 立即进入 `active-resize`，geometry 未变化 no-op，变化后 preview，stop 后按 resized 标记决定 cleanup 或 commit。
  - 实现 external drop 进入 grid 即 `active-drop`，grid/size/strategy 未变化 no-op，drop rejected / leave / commit 统一 cleanup 或 commit。
  - 实现 illegal transition、cancel、stale async result 的结构化 `REJECT_TRANSITION` / `IGNORE_STALE` effect。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC5, R2.AC1, R2.AC3, R2.AC4, R2.AC5, R3.AC3, R3.AC5, R4.AC1, R4.AC3, R4.AC4, R4.AC6, R5.AC1, R5.AC3, R5.AC4, R5.AC6, R7.AC1, R7.AC3_

- [x] 3. 为 core 编写独立单元测试
  - 新增 `test/interaction-state-machine-core.test.ts` 和对应 runner 接入，覆盖 pending drag 未过阈值、超过阈值激活、touch/coarse 阈值、`dragActivationDistance=0`。
  - 覆盖 active drag no-op、drag moved commit、resize immediate active、resize no-op、resize changed commit、drop enter active、drop no-op、drop leave cleanup。
  - 覆盖 illegal transition、cancel、stale result、diagnostics snapshot 不含 raw event / DOM / business payload。
  - 确保这些测试不需要 Vue runtime、browser 或 layout engine。
  _需求追溯: R1.AC5, R1.AC7, R2.AC1, R2.AC3, R2.AC4, R2.AC5, R4.AC1, R4.AC3, R4.AC4, R5.AC1, R5.AC3, R5.AC4, R7.AC1, R7.AC3, R7.AC5, R7.AC6, R9.AC1_

- [x] 4. 扩展 public 配置、内部 props 与类型导出
  - 在 `lib/VueGridLayoutPropTypes.ts` 增加 `dragActivationDistance` prop 和默认值。
  - 在 `lib/grid-layout/gridInteractionTypes.ts` 的 `GridInteractionsProps` 中加入归一化后的 activation 配置。
  - 更新 `typings/index.d.ts`，导出 `GridDragActivationDistance` 并加入 `VueGridLayout` / responsive / dashboard 透传类型。
  - 保持未配置时默认行为稳定，阈值为 `0` 时提供近似旧版立即 dragStart 兼容路径。
  _需求追溯: R2.AC6, R6.AC1, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R8.AC7_

- [x] 5. 新增 Vue interaction machine adapter 与 effect runner
  - 新增 `lib/grid-layout/useGridInteractionMachine.ts`，封装 reducer state、interaction/request id、effect runner 和 Vue refs 同步。
  - effect runner 负责执行 public event bridge、layout engine preview/commit、editor runtime、autoScroll、frameUpdate、transient layout、blocked feedback、cleanup。
  - 所有 async preview/commit result 必须通过 interaction id / request id 校验，stale result 不得写 layout、guide 或 blocked state。
  - 将 `activeDragId`、`activeResizeId`、`dragBlocked`、`resizeBlocked`、blocked reason/items/message 继续暴露为现有 composable 兼容形态。
  _需求追溯: R1.AC3, R1.AC4, R1.AC5, R1.AC7, R3.AC2, R3.AC6, R4.AC2, R4.AC5, R5.AC2, R5.AC4, R5.AC5, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R7.AC2, R7.AC3, R7.AC4_

- [x] 6. 重构 item drag 入口为 pending drag 激活语义
  - 修改 `lib/grid-item/useGridItemDrag.ts`，vendor `onDragStart` 只 arm pending drag 并记录 origin pixel/grid，不再立即调用 attrs `onDragStart`。
  - vendor move 累积 pixel delta 和 grid 坐标，超过阈值后补发 semantic `onDragStart`，并继续发 `onDrag`。
  - vendor stop 若从未激活，只 cleanup `state.dragging` 并保留 click/selection/context menu 行为，不调用 attrs `onDragStop`。
  - 保留 bounded drag 约束、transform scale 后的 grid 计算，以及 `droppingPosition` proxy 的 external drop 语义例外。
  _需求追溯: R1.AC1, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R6.AC1, R8.AC3, R8.AC4, R8.AC5, R9.AC1_

- [x] 7. 将 single / group / legacy drag 接入状态机 effect
  - 重构 `useGridDragResizeInteractions.ts` 的 drag start/move/stop，让 move intent、placeholder、history replace、engine start 只在 activation effect 后执行。
  - 保持 `editor.resolveMoveDrag()` 的 single/group/blocked 语义，group drag 继续使用既有 `groupMove` operation 和 dx/dy 计算。
  - active drag grid 坐标不变时不 preview、不 `updateIntelligence`；stop before moved 不 commit。
  - legacy layout engine 路径也走同一 activation/no-op/cleanup 语义，保留单 item legacy 行为，不为 group move 新增 legacy 算法。
  _需求追溯: R1.AC4, R1.AC6, R2.AC3, R2.AC4, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R6.AC1, R6.AC2, R6.AC3, R7.AC2, R7.AC3, R9.AC2_

- [x] 8. 将 resize 接入状态机 no-op / commit 边界
  - 保留 resize handle start 立即 semantic active，并在 effect runner 中初始化 old resize item、old layout、active resize id、engine interaction。
  - resize tick 若 `x/y/w/h` 未变化，不调用 engine preview、不更新 guide、不写 transient layout。
  - resize stop 若从未产生有效 resize，只 cleanup；产生变化时才 commit 并进入 `onLayoutMaybeChanged()`。
  - 统一 blocked、fallback、stale、error result 的 cleanup、blocked feedback 和 committed layout 恢复行为。
  _需求追溯: R1.AC2, R1.AC3, R1.AC4, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R6.AC2, R6.AC3, R6.AC4, R7.AC3, R9.AC2_

- [x] 9. 将 external drop 接入 active-drop 状态机
  - 重构 `useGridDropInteractions.ts`，在 external drag enter/dragover 进入 grid 时进入 active drop。
  - 对 cursor/auto drop 统一比较 grid、size、strategy；未变化时不重复 engine preview、不重复 `updateIntelligence`。
  - `callDropDragOver(e) === false`、drag leave、drop cancel、drop commit 后走统一 cleanup，清理 `droppingPosition`、`activeDrag`、guides、blocked feedback 和 autoScroll。
  - drop commit 继续复用 `dropFit` operation，accepted drop event 参数保持兼容，rejected/blocked 不留下半激活 placeholder。
  _需求追溯: R1.AC2, R1.AC3, R1.AC4, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R6.AC2, R6.AC3, R6.AC4, R7.AC3, R9.AC3_

- [x] 10. 收紧 durable commit、history、persistence 与外部更新边界
  - 审查 `useGridLayoutModel.ts`、`useGridLayoutEngineBridge.ts`、interaction cleanup 路径，确保 preview tick 不触发 durable persistence 或 history entry。
  - click-like drag、no-op drag、no-op resize、no-op drop 不调用 `onLayoutMaybeChanged()`，也不触发 `layoutChange` / `update:modelValue`。
  - commit changed/fallback 且 layout 实际变化时，只通过现有 `onLayoutMaybeChanged()` 触发 history、model update 和 persistence。
  - 外部 layout props 更新、组件卸载、scheduler stale result、editor shell responsive profile 写回都必须走 cleanup 或 stale ignore，不能写入过期/transient layout。
  _需求追溯: R1.AC3, R2.AC3, R3.AC6, R4.AC4, R4.AC5, R5.AC4, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R7.AC2, R7.AC3_

- [x] 11. 扩展内部交互与浏览器回归测试
  - 扩展 `test/grid-layout-internal-core.test.ts`，覆盖 `useGridItemDrag` 未过阈值不发 drag lifecycle、过阈值事件顺序、bounded drag、single/group/blocked/legacy drag。
  - 覆盖 resize no-op 不 preview/commit、不 update guide；resize changed 正常 preview/commit。
  - 覆盖 drop preview、drop 坐标不变 no-op、drop rejected、drop commit、drag leave cleanup。
  - 扩展 editor/browser smoke，覆盖普通点击不显示 purple guide、不写 history，真实拖动显示 guide，多选拖动仍移动整组，resize/drop 仍正常。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R3.AC1, R3.AC2, R3.AC4, R3.AC5, R4.AC2, R4.AC3, R4.AC4, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R6.AC1, R6.AC2, R9.AC1, R9.AC2, R9.AC3, R9.AC4_

- [x] 12. 更新文档、示例说明与发布验证
  - 更新 README 或相关 docs，说明 drag activation threshold、public drag lifecycle 新语义、`dragActivationDistance` 配置、resize/drop no-op 行为和迁移建议。
  - 如示例中展示拖拽/智能线行为，补充 click 不显示 guide、真实 drag 才显示 guide 的验证说明；不把示例 UI 变成公共 API。
  - 更新 type/export smoke，确保新增类型、props 和现有 namespace 编译通过。
  - 运行 `yarn test:layout-engine`、`yarn test:editor`、`yarn test`，如修改 browser smoke 则运行对应 browser test runner，并记录现有 warning 与无法运行项。
  _需求追溯: R1.AC5, R2.AC6, R6.AC1, R7.AC5, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC6, R9.AC4, R9.AC5, R9.AC6_
