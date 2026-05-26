# External Drop Session Refactor 实现任务

## 任务列表

- [ ] 1. 建立 External Drop Session 内部模型
  - 新增 `lib/grid-layout/externalDropSession.ts`，定义 `ExternalDropSession`、status、blocked reason、preview/commit result 等内部类型。
  - 实现 `createExternalDropSession`、`resolveExternalDropCandidate`、`buildDropFitOperationFromSession`、`applyExternalDropPreviewResult`、`blockExternalDropSession`、`commitExternalDropSession`、`clearExternalDropSession` 的基础纯函数。
  - 确保 `sourceItem`、`resolvedItem`、`ghostItem`、`baseLayout`、`previewLayout`、`target`、`strategy` 的职责清晰，且 `baseLayout` 不包含 synthetic drop item。
  - 为 session helper 增加单元测试，覆盖创建、尺寸覆盖、operation 构造、blocked、cleanup selector。
  - _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC5, R1.AC6, R5.AC1, R5.AC2_

- [ ] 2. 将 session 接入 GridLayoutState 与 layout model
  - 在 `GridLayoutState` 中新增 `externalDropSession: ExternalDropSession | null`，初始化为空。
  - 增加 `isExternalDropping`、`getExternalDropGhost`、`getExternalDropRenderLayout`、`isExternalDropBlocked` selector，并让它们成为外部 drop 状态的唯一读取入口。
  - 调整 layout change suppression：外部 drop preview 使用 session 状态抑制正式 `layoutChange` / `update:modelValue`，不依赖 `droppingDOMNode`。
  - 保证 display-only `previewLayout` 只参与渲染，不写入父级 model，也不污染 `lastObservedModelValue`。
  - _需求追溯: R1.AC4, R1.AC5, R3.AC3, R3.AC5, R5.AC1, R5.AC2, R5.AC5_

- [ ] 3. 重构渲染层为 session selector 驱动
  - 修改 `createGridLayoutComponent.tsx`，将 runtime `isDropping` 改为读取 `isExternalDropping(state)`。
  - 使用 `getExternalDropRenderLayout(state, committedRenderLayout)` 给已有 children 提供 display-only reflow。
  - 将 `placeholder()` 改为 `renderGhost()`：外部 drop 读取 `externalDropSession.ghostItem`，内部 drag/resize 继续读取 `activeDrag`。
  - 阻止 synthetic drop item 作为普通 child `GridItem` 渲染；未松手前只允许 ghost placeholder 可见。
  - 为 blocked session 增加 `placeholder-blocked` 或等价 class，确保不可提交状态可区分。
  - _需求追溯: R3.AC1, R3.AC2, R3.AC5, R3.AC6, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R6.AC4_

- [ ] 4. 实现新 layout engine 的 external drop adapter
  - 用 session 构造 `dropFit` preview operation，调用 `engineBridge.reset`、`engineBridge.start`、`engineBridge.preview`。
  - 将 `changed`、`fallback`、`blocked`、`stale` 等 result 归一化写回 session，不在 adapter 内直接写 `state.layout` 或 `activeDrag`。
  - preview 成功时以 `result.placeholder` 更新 `ghostItem`；compact/fallback 后以 final placeholder 为准。
  - commit 时只使用 session 构造的 commit operation；`auto` 已有有效 target 时不得重新 first-fit。
  - _需求追溯: R1.AC3, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R4.AC1, R4.AC2_

- [ ] 5. 实现 legacy external drop adapter
  - 将现有 `findNearestFit`、`findFirstFit`、collision fallback、`editor.snapCandidate` 逻辑封装为 legacy preview/commit adapter。
  - legacy preview 返回与新 engine adapter 相同形状的 session preview result，写入 `previewLayout`、`ghostItem`、`target`、`blocked`。
  - legacy commit 以 session 的 `resolvedItem` / `ghostItem` 为提交基准，不重新读取原始 `droppingItem` 尺寸，不重新定位到另一个位置。
  - 消除或封装无法立即移除的旧分支，并在代码中限制为短期 adapter 边界。
  - _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R4.AC3, R4.AC4, R4.AC5, R5.AC5_

- [ ] 6. 重写 `useGridDropInteractions` 为事件编排层
  - `onDragEnter` 创建/进入 session，并同步 interaction machine 的 drop interaction。
  - `onDragOver` 调用 `dropDragOver`，合并尺寸覆盖，解析 candidate，调度对应 adapter preview；返回 `false` 时通过 session rejected/cleanup 处理。
  - `onDrop` 只读取当前 session；session 非 ready 或 blocked 时不提交，ready 时执行 session commit。
  - 集中 cleanup：drag leave、drop rejected、commit rejected、component unmount 都清理 preview layout、ghost、guides、auto scroll、interaction machine。
  - 移除外部 drop 主路径中对 `state.activeDrag`、`state.droppingDOMNode`、局部 `item || state.activeDrag` 的依赖。
  - _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R2.AC1, R2.AC2, R2.AC5, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R5.AC3, R5.AC6, R6.AC2, R6.AC3_

- [ ] 7. 保持公共 API 与 editor/runtime 兼容
  - 保持 `isDroppable`、`dropStrategy`、`droppingItem`、`dropDragOver`、`drop` 的公开签名和事件参数不变。
  - `dropDragOver=false` 继续表达拒绝 preview；尺寸覆盖继续只合并到 `w/h`。
  - commit 成功后继续调用 `editor.commitDrop`，失败时调用 `editor.rollbackInteraction` 并恢复 base layout。
  - editor view mode 或 runtime 禁止外部 drop 时，不创建可提交 session。
  - `drop` 事件返回 item 必须与 session final ghost/placeholder 的 `x/y/w/h` 一致，真实 item 仍由父级数据更新引入。
  - _需求追溯: R3.AC4, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R2.AC3, R2.AC4_

- [ ] 8. 建立 session 回归测试矩阵
  - 扩展 `test/grid-layout-internal-core.test.ts`，覆盖 auto 模式 ghost 与 commit 位置一致。
  - 覆盖 `dropDragOver` 改变尺寸后，session ghost、commit operation item、`emitDrop` item 尺寸一致。
  - 覆盖 cursor 模式、新 layout engine、legacy adapter、display-only `previewLayout`、blocked ghost、drop rejected、drag leave cleanup。
  - 增加断言：外部 drop preview 不再把主 ghost 写入 `state.activeDrag`，而是写入 `state.externalDropSession.ghostItem`。
  - 保留并扩展 `test/layout-engine-core.test.ts` 中 `dropFit` final placeholder 与 final layout item 一致的覆盖。
  - _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R3.AC3, R3.AC5, R3.AC6, R5.AC3, R5.AC4_

- [ ] 9. 更新 examples 与 dogfood 验证入口
  - 保持 `example/07-drag-from-outside.js` 和 `example/17-drop-strategy.js` 中透明 drag image 行为，避免原生 drag image 与 grid ghost 混淆。
  - 确认示例覆盖动态 `dropDragOver` 尺寸、auto 策略、cursor 策略、取消/drag leave 路径。
  - 如果示例发现 session API 表达困难，先回写设计或任务，再调整实现，不在示例里绕过 session。
  - _需求追溯: R8.AC1, R8.AC2, R8.AC3, R6.AC1, R7.AC3_

- [ ] 10. 执行标准验证并收口临时补丁
  - 运行 `npm test`、`npm run build`、`npm run test:examples`、`npm run check:bundle`。
  - 视需要运行 CLI/headless 的 `npm run test:browser`；不使用会抢焦点的 GUI/browser automation。
  - 运行或记录 `npm run check:package` 结果；如果因仓库已有 ignored `build/` artifact 失败，明确记录原因，不擅自删除 ignored artifact。
  - 审查外部 drop 相关代码，确认 ghost 位置同步、尺寸同步、synthetic item 不渲染、dropFit final placeholder 对齐都由 session 架构保证，而不是散落临时分支。
  - _需求追溯: R7.AC5, R7.AC6, R5.AC6_
