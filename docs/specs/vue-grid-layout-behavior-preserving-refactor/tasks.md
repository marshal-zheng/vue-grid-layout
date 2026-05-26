# Vue Grid Layout 行为保持型组件边界重构 实现任务

- [x] 1. 建立重构基线、写入范围和 review gate
  - 记录当前工作区状态，不回退用户已有改动，不引入无关格式化或生成产物。
  - 复核 `lib/VueGridLayout.tsx`、`lib/GridItem.tsx`、`lib/ResponsiveVueGridLayout.tsx` 的现有 props、emits、slots、attrs、CSS class、导出与测试入口，形成实现时使用的兼容清单。
  - 在实现说明或任务执行记录中写明模块 ownership：contract、model/persistence、engine bridge、interactions、auto-scroll/frame、editor overlay、GridItem wrapper、Responsive wrapper。
  - 建立防复胖 review gate：新增 watcher、公开 prop、事件、overlay 渲染块、engine 逻辑时必须说明归属；超过规模阈值的组件或 composable 必须说明单一责任。
  - 允许写入：spec 执行记录、后续测试文件；暂不移动生产逻辑。
  - 最小验证：`git status --short`、相关文件行数/搜索检查。
  _需求追溯: R1.AC1, R1.AC4, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R9.AC2, R9.AC4, R10.AC1, R10.AC2, R10.AC3, R10.AC4_

- [x] 2. 补齐行为锁定 characterization tests
  - 先复用并标注已有覆盖：`test/editor-component-browser.test.js`、`test/persistence-component-browser.test.js`、layout-engine/editor/persistence runner 中已经覆盖的行为。
  - 新增或扩展事件契约测试，覆盖 `dragStart/drag/dragStop`、`resizeStart/resize/resizeStop`、`dropDragOver/drop`、`layoutChange`、`update:modelValue` 的 payload 顺序、触发次数和提交边界。
  - 新增或扩展 DOM/overlay 测试，锁定 placeholder、blocked state、`.vue-grid-editor-guide`、spacing chip、measurement HUD、anchor edge、drop target、view mode 等关键 class 和数量。
  - 新增或扩展 persistence/layoutEngine 测试，确认 preview 不保存、commit 才保存，custom executor/worker/main-thread 路径仍维持 commit-only 语义。
  - 新增 root attrs 兼容测试，覆盖 `id`、`data-*`、`aria-*`、class/style 合并与事件监听共存。
  - 允许写入：`test/*` 中与上述行为直接相关的测试；不修改生产逻辑来适配新期望。
  - 最小验证：运行新增测试及相关 targeted runner；若覆盖 drag/editor/persistence/engine，运行对应 `node test/run-*.js`。
  _需求追溯: R1.AC2, R1.AC3, R1.AC5, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R3.AC5, R5.AC1, R5.AC4, R5.AC5, R7.AC3, R9.AC3, R9.AC5_

- [x] 3. 显式化 `VueGridLayout` 事件契约与 root attrs 路由
  - 新建或更新 `lib/grid-layout/contract.ts`，定义 `gridLayoutEmits`、事件名常量、事件 payload 类型、`createGridLayoutEventBridge()` 和 `splitGridRootAttrs()`。
  - 将 `VueGridLayout` 的 `emits` 从现有最小列表扩展到当前公开事件：`update:modelValue`、`layoutChange`、`dragStart`、`drag`、`dragStop`、`resizeStart`、`resize`、`resizeStop`、`drop`、`dropDragOver`。
  - 将普通通知型事件从 `$attrs` 回调迁移到等价 `emit()` 路径，保持 payload 顺序、`undefined` 位置、引用/clone 语义和触发时机。
  - 为 `dropDragOver` 保留 return-valued callback 入口，覆盖单 handler、数组 handler、返回 `false`、返回尺寸对象、返回空值的兼容规则。
  - 设置 `inheritAttrs: false`，将非事件 DOM attrs 有意合并到 root grid DOM；组件受控 props/emits、class/style 和内部 drag/drop/resize 处理优先。
  - 允许写入：`lib/VueGridLayout.tsx`、`lib/grid-layout/contract.ts`、必要类型与测试；不移动 model、engine、overlay 逻辑。
  - 最小验证：事件契约测试、root attrs 测试、external drop targeted test。
  _需求追溯: R1.AC1, R1.AC2, R3.AC1, R3.AC2, R3.AC5, R3.AC6, R4.AC1, R6.AC6, R10.AC1_

- [x] 4. 抽取 `useGridLayoutModel` 并保持 model/history/persistence 语义
  - 新建 `lib/grid-layout/useGridLayoutModel.ts`，迁移 layout、children、oldLayout、mounted、compactType、modelValue 同步、slot children 同步、history push/replace 与 persistence load/external-apply/commit/stop。
  - 保持现有 `markRaw`、`cloneLayout`、children layout 同步、compact/allowOverlap、history replace/push、persistence event 转发和 committed-only 保存语义。
  - 让根组件只通过窄接口调用 `setLayoutFromPreview()`、`commitLayoutChange()`、`applyPersistedLayout()`、`syncChildrenLayout()` 等模型操作。
  - 不在本任务中执行 layout engine operation、不读取 DOM event/node、不移动 drag/resize/drop orchestration。
  - 允许写入：`lib/VueGridLayout.tsx`、`lib/grid-layout/useGridLayoutModel.ts`、model/persistence 相关测试；不触碰 overlay 渲染与 GridItem。
  - 最小验证：persistence targeted runner、model/layoutChange/update:modelValue 相关测试。
  _需求追溯: R1.AC2, R2.AC4, R4.AC1, R4.AC2, R7.AC5, R9.AC2, R9.AC3, R9.AC5, R10.AC3_

- [x] 5. 抽取 `useGridLayoutEngineBridge` 并保持 legacy/layout-engine 双路径
  - 新建 `lib/grid-layout/useGridLayoutEngineBridge.ts`，迁移 layout engine prop 解析、legacy mode 判断、executor/scheduler 创建、interactionController lifecycle、diagnostics、dispose。
  - 暴露 `preview()` 与 `commit()` 窄接口，保持 preview stale result 不覆盖当前状态、legacy fallback、compareWithLegacyLayout、worker/main-thread executor 行为。
  - 保持 engine bridge 不发 Vue 事件、不提交 persistence/history、不读取 DOM。
  - 允许写入：`lib/VueGridLayout.tsx`、`lib/grid-layout/useGridLayoutEngineBridge.ts`、layout-engine 相关测试；不重写 layout algorithm。
  - 最小验证：`node test/run-layout-engine-tests.js`，以及 persistence browser 中 custom executor commit-only 相关用例。
  _需求追溯: R1.AC2, R4.AC3, R7.AC3, R8.AC3, R9.AC3, R9.AC5_

- [x] 6. 抽取 frame update 与 auto-scroll 的 DOM-side 边界
  - 新建 `lib/grid-layout/useGridFrameUpdate.ts`，迁移 pending layout/placeholder、rAF schedule/cancel/flush 与 large layout preview 合帧逻辑。
  - 新建 `lib/grid-layout/useGridAutoScroll.ts`，迁移 auto-scroll options、client point 提取、scroll container 查找、rAF scrollBy 调度与 cleanup。
  - 保持两个模块不依赖 layout engine、persistence 或根组件大状态包，只接收窄参数和 callback。
  - 允许写入：`lib/VueGridLayout.tsx`、两个新 composable、可纯测的 helper 测试；不改变 drag/resize/drop 结果。
  - 最小验证：相关 helper 测试、drag/resize/drop preview targeted tests。
  _需求追溯: R1.AC2, R4.AC5, R8.AC4, R9.AC2, R9.AC3, R10.AC2_

- [x] 7. 抽取 `useGridInteractions`，按现有语义协调 drag/resize/drop
  - 新建 `lib/grid-layout/useGridInteractions.ts`，迁移 drag/resize/drop start、preview、stop、placeholder、blocked state、drop strategy、auto-fit、auto-scroll、frame update 和事件发射协调。
  - 保持 legacy path 与 layout-engine path 的现有结果，不更改 collision、compact、fit、drop strategy、`LARGE_LAYOUT_THRESHOLD` 或 scheduler 策略。
  - 保持 `layoutChange`、`update:modelValue`、drag/resize/drop 回调与 persistence/history 的提交边界。
  - 如果该模块超过 review gate 或混合过多责任，继续拆为 drag/resize 与 drop 两个真实责任边界，禁止形成新的万能 composable。
  - 允许写入：`lib/VueGridLayout.tsx`、`lib/grid-layout/useGridInteractions.ts`、必要交互 helper 与测试；不修改 layout engine 算法。
  - 最小验证：drag/resize/drop characterization tests、external drop targeted test、layout-engine targeted runner。
  _需求追溯: R1.AC2, R1.AC3, R3.AC2, R3.AC5, R4.AC4, R4.AC6, R8.AC5, R9.AC1, R9.AC3, R9.AC5, R10.AC2_

- [x] 8. 抽取 editor runtime wiring 与 `GridEditorOverlay`
  - 新建 `lib/grid-layout/useGridEditorRuntime.ts`，迁移 editor controller 接入、mode/view/edit 查询、selection、meta、capability、keyboard cleanup、guide/snap event 转发。
  - 新建 `lib/grid-layout/GridEditorOverlay.tsx` 或等价 render helper，迁移 guide、spacing chip、measurement HUD、anchor edge、debug layer/panel JSX。
  - Overlay 输入只保留小型 props/context：geometry、layout、item map、guide state、enabled/debug，不读取根组件内部大状态包。
  - 保持 `.vue-grid-editor-guide`、`.vue-grid-editor-spacing-chip`、`.vue-grid-editor-measurement-hud`、`.vue-grid-editor-anchor-edge`、debug layer/panel、aria-live、数量限制和显示/隐藏逻辑。
  - 允许写入：`lib/VueGridLayout.tsx`、editor runtime/overlay 新模块、editor DOM 测试；不新增 editor 功能。
  - 最小验证：`node test/run-editor-tests.js`，以及 editor component browser tests。
  _需求追溯: R1.AC3, R4.AC1, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R8.AC2, R9.AC3, R9.AC5_

- [x] 9. 收敛 `VueGridLayout.tsx` 根组件为 contract + orchestration
  - 删除根组件中已经迁移的内部实现细节，只保留 props/emits/slots/attrs 决策、模块组合、root class/style、children/placeholder/overlay composition 和 lifecycle orchestration。
  - 检查根文件行数目标：优先保持清晰边界，目标控制在 800 行以内；如果某段保留是为了避免假边界，记录原因。
  - 检查新增模块没有大型 prop bag、事件镜像或多文件交叉理解同一责任的问题。
  - 允许写入：`lib/VueGridLayout.tsx` 和相关新模块的小修；不新增行为。
  - 最小验证：前面所有受影响 targeted tests，根组件 smoke。
  _需求追溯: R4.AC1, R4.AC6, R8.AC5, R8.AC6, R10.AC2, R10.AC3_

- [x] 10. 必要 cleanup `GridItem` vendor wrapper 边界
  - 新建 `lib/grid-item/useGridItemDrag.ts`、`lib/grid-item/useGridItemResize.ts`、`lib/grid-item/gridItemStyle.ts` 或等价 helper，抽取 drag/resize pixel-to-grid 换算、resize constraints、style 生成和 dropping movement。
  - 保持 wrapper class、child class/style 合并顺序、DraggableCore/Resizable 参数、`nodeRef`、`cancel`、`handle`、resize handle、north/west resize 行为。
  - 区分内部 vendor wrapper 回调与对外公开组件事件，不依赖不明确的 `$attrs` 泄漏改变行为。
  - 允许写入：`lib/GridItem.tsx`、`lib/grid-item/*`、GridItem 相关测试；不全面重写 GridItem。
  - 最小验证：drag/resize characterization tests、GridItem wrapper smoke。
  _需求追溯: R3.AC3, R6.AC1, R6.AC2, R9.AC6, R10.AC1_

- [x] 11. 必要 cleanup `ResponsiveVueGridLayout` wrapper 边界
  - 新建 `lib/responsive/useResponsiveGridLayoutModel.ts` 或等价模块，收敛 breakpoint、cols、layouts、responsive persistence、editor controller wiring。
  - 明确 wrapper 自己消费的 props/attrs/events，以及传给内层 `VueGridLayout` 的 props/attrs/events。
  - 保持 `breakpointChange`、`widthChange`、`update:layouts`、`layoutChange`、responsive layout generation、persistence commit 和 `<ResponsiveVueGridLayout @drop ...>` / `@dragStop` 等监听兼容。
  - 新增或确认响应式 root attrs 测试，覆盖 `id`、`data-*`、`aria-*`、class/style 合并与事件监听共存。
  - 允许写入：`lib/ResponsiveVueGridLayout.tsx`、`lib/responsive/*`、响应式相关测试；不全面重写响应式组件。
  - 最小验证：responsive targeted tests、persistence responsive browser case。
  _需求追溯: R3.AC4, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R9.AC6_

- [x] 12. 同步类型、文档、导出和示例兼容性
  - 检查 `typings/index.d.ts`、README API 文档、MCP docs 数据源、`lib/cjs.ts`、UMD/CommonJS 入口与源码公开 surface 是否一致。
  - 默认保持新 composable/helper 为内部模块；只有证明稳定复用价值时才新增公开导出。
  - 如果新增公开导出，同步类型声明、README/API 文档、MCP docs 数据源、CommonJS/UMD 导出清单，并增加不改变现有 API 的验证。
  - 如果发现现有 README/typings 与源码行为不一致，记录差异并保持源码行为，不在本重构中顺手改变用户可观察行为。
  - 允许写入：类型、README/API、MCP docs 数据源、导出入口；不改变运行时行为。
  - 最小验证：类型/构建相关命令、导出入口 smoke。
  _需求追溯: R1.AC1, R7.AC1, R7.AC2, R7.AC5, R7.AC6, R10.AC4_

- [x] 13. 最终验收、targeted smoke 与 review summary
  - 运行完整 `yarn test` 和 `yarn build`。
  - 按触及范围执行 targeted smoke：基础网格、响应式、外部 drop、persistence、layout engine performance、professional dashboard editor；如果仓库没有对应示例目录，记录实际可运行的等价入口。
  - 检查 CSS 兼容性，确保 `css/styles.css` 中现有变量、状态类和选择器未被无批准改变。
  - 输出最终 review summary：模块 ownership、兼容性测试结果、公开 API/类型/文档同步情况、剩余风险和防复胖 gate。
  - 如果任一最终验证失败，停止继续扩大 diff，保留失败证据并回到对应最小阶段修复。
  _需求追溯: R1.AC5, R7.AC2, R7.AC3, R7.AC4, R8.AC6, R9.AC3, R9.AC5, R10.AC5_
