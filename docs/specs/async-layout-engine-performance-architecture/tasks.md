# 异步布局引擎与性能架构 实现任务

- [x] 1. 建立 layout-engine 模块骨架与公开类型
  - 新增 `lib/layout-engine/types.ts`，定义 `GridLayoutEngineOptions`、`GridLayoutEngineProp`、`LayoutOperation`、`LayoutOperationRequest`、`LayoutOperationResult`、`LayoutPatch`、`LayoutDiagnostics`、`LayoutEngineEvent`、`InteractionSchedulerOptions`、`LayoutExecutor` 等类型。
  - 新增 `lib/layout-engine/index.ts` 作为命名导出入口，避免组件实现和引擎实现互相耦合。
  - 在 `lib/VueGridLayoutPropTypes.ts` 增加 `layoutEngine?: false | GridLayoutEngineProp` 的运行时 prop 与类型声明。
  - 在 `lib/cjs.ts` 和 `typings/index.d.ts` 导出布局引擎、调度器、执行器、patch、diagnostics 和 benchmark 相关类型。
  - 保持引擎类型只引用 plain `Layout`、`LayoutItem`、`CompactType`、`ResizeHandleAxis`，不得依赖 Vue、DOM、Pinia、storage 或组件实例。
  _需求追溯: R1.AC1, R1.AC2, R1.AC5, R1.AC6, R8.AC1, R9.AC5, R10.AC4_

- [x] 2. 实现默认 row/column occupancy index 与可插拔 indexing strategy
  - 新增 `lib/layout-engine/indexing.ts`，定义 `LayoutIndexStrategy`、`LayoutIndex`、`LayoutIndexOptions`，并实现 `rowColumnOccupancyStrategy()`。
  - 支持 build、queryFirstCollision、queryAllCollisions、canPlace、findFirstFit、findNearestFit、insert、remove、update。
  - 查询结果按 legacy layout order 或显式排序规则返回，避免 row bucket 顺序造成非确定性布局。
  - 对非法坐标、非法尺寸、无限 `maxRows`、空布局和索引不可用场景提供线性扫描 fallback。
  - 第一版只内置 row/column occupancy strategy；其他索引策略只保留扩展边界，不实现 R-tree 或额外空间树。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7_

- [x] 3. 实现纯布局引擎核心状态与通用操作结果
  - 新增 `lib/layout-engine/core.ts`，实现 `createLayoutEngine()`、engine state 初始化、revision 管理、index 生命周期和 diagnostics 采集。
  - 实现统一 `LayoutOperationResult` 输出，包括 `changed`、`noop`、`blocked`、`cancelled`、`stale`、`fallback`、`error` 状态。
  - 实现 no-op 快路径：位置/尺寸未变化时返回 no-op，并避免全量 clone。
  - 实现 patch 生成、affectedIds 收集、collision 列表、blocked reason 和 operation diagnostics。
  - 保证相同输入、相同操作和相同选项产生确定性结果。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC6, R3.AC1, R9.AC1_

- [x] 4. 迁移 move 与 compact 到新引擎并保持 legacy parity
  - 在纯引擎中实现 `move` 和 `compact` 操作，兼容 `compactType: 'vertical' | 'horizontal' | null`。
  - 复用 occupancy index 加速碰撞查询和受影响区域计算，避免每次移动都扫描完整 layout。
  - 保持 static item、`preventCollision`、`allowOverlap`、`maxRows`、`moved` 标记和碰撞级联语义。
  - 建立 legacy comparison helper，用现有 `moveElement()`、`compact()`、`compactInPlace()` 作为第一阶段 oracle。
  - 对有意差异记录测试说明和 diagnostics，不允许静默改变公开语义。
  _需求追溯: R2.AC2, R2.AC4, R2.AC5, R3.AC1, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R10.AC2, R10.AC3_

- [x] 5. 迁移 resize、drop fit 与 responsive layout heavy operations
  - 实现 `resize` 操作，覆盖 east、south、west、north 和组合 resize handle，并正确处理 north/west 导致的 `x` 或 `y` 变化。
  - 实现 `dropFit` 操作，支持 `cursor` 与 `auto` 放置策略，返回候选位置、失败原因和 fallback 策略。
  - 将 `findFirstFit()`、`findNearestFit()` 等价能力改为复用 occupancy model，避免每个候选位置扫描完整 layout。
  - 实现 `generateResponsiveLayout` / responsive compact 的 heavy operation 入口，供响应式组件和 worker 执行器复用。
  - 保留现有公开工具函数兼容出口，并逐步委托新引擎或 legacy helper。
  _需求追溯: R2.AC3, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R8.AC3, R10.AC4_

- [x] 6. 实现 preview / committed layout 分离与 interaction controller
  - 新增 `lib/layout-engine/vueAdapter.ts` 或同等模块，实现 `InteractionController`，集中管理 committed、preview、interaction 和 external revision。
  - 将 drag/resize 中的 placeholder、blocked state 和 preview patch 与 committed layout 分离。
  - dragStop、resizeStop、drop commit 只提交稳定 committed layout，并返回给组件事件、history 和 persistence。
  - 实现交互取消和组件卸载清理，丢弃 preview 并恢复最近 committed layout。
  - 实现外部受控 `modelValue` / `layouts` 变化时的默认 rebase；active item 删除、约束冲突或无法安全 rebase 时取消交互、应用外部状态并发出结构化事件。
  - 忽略 stale preview 和旧异步任务结果，避免覆盖当前 pointer 位置或 committed layout。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R8.AC4, R8.AC5, R9.AC2_

- [x] 7. 实现 interaction scheduler 与 auto 策略
  - 新增 `lib/layout-engine/scheduler.ts`，实现 `eager`、`raf`、`commitOnly`、`auto` 模式。
  - `eager` 每个有效 tick 同步计算 preview，保持小布局交互语义。
  - `raf` 合并同一帧内的多次输入，并每帧最多提交一次 preview 更新。
  - `commitOnly` 在交互中只更新轻量 placeholder，stop/drop commit 时完整求解。
  - `auto` 根据 item 数量、布局密度、上次计算耗时、worker 可用性和配置选择策略，替代 `LARGE_LAYOUT_THRESHOLD` 硬编码阈值。
  - 新交互输入到达时取消或淘汰旧任务，并为降级、跳帧、stale task 暴露结构化 scheduler event。
  _需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R8.AC6, R9.AC2_

- [x] 8. 实现主线程执行器与内置可选 Web Worker 执行器
  - 新增 `lib/layout-engine/executor.ts`，实现 `mainThreadLayoutExecutor()`、`workerLayoutExecutor()` 和 custom executor 接口。
  - 新增 `lib/layout-engine/workerRuntime.ts`，只运行纯引擎和可序列化消息协议，不引用 Vue、DOM、Pinia、storage 或组件实例。
  - worker request 只传递 layout、operation、options、task id、deadline、debug 标志等可结构化克隆数据。
  - 支持 abort、timeout、stale task id、worker 初始化失败、运行时错误和环境不支持 worker 的安全回退。
  - 修改 `webpack.config.js` / `script.js`，在 UMD 构建中生成可选 worker artifact，并允许 `workerUrl` 或 `workerFactory` 显式接入。
  - pointermove preview 默认保留主线程低延迟路径；大型 compact、drop fit、批量导入、responsive breakpoint 生成和提交校验可作为 heavy task 自动进入 worker。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7, R8.AC7, R10.AC6_

- [x] 9. 集成 `VueGridLayout` 默认新引擎路径与 legacy fallback
  - 在 `VueGridLayout` 中用 Vue adapter 调用新引擎，替换组件事件处理器中直接执行碰撞、fit、move 和 compact 的主路径。
  - 默认启用新引擎；支持 `layoutEngine={false}` 或 `{ mode: 'legacy' }` 回退 legacy path。
  - 支持 `{ compareLegacy: true }` 在 debug / test 模式下双跑新旧路径并报告差异，不改变用户可见结果。
  - 保持现有 props、`layoutChange`、`update:modelValue`、drag/resize/drop 回调、blocked visual state 和 auto-scroll 行为兼容。
  - history 和 persistence 只在 committed interaction 边界更新；preview 中间态不得触发 durable save。
  - SSR 或非浏览器环境下不得访问 worker、window、document 或 rAF 能力，除非已进入客户端安全路径。
  _需求追溯: R4.AC3, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R8.AC7, R10.AC1, R10.AC2, R10.AC6_

- [x] 10. 集成 `ResponsiveVueGridLayout` 与 responsive heavy operations
  - 在响应式组件中保留 breakpoint、width、cols 和完整 `layouts` 管理职责。
  - breakpoint 变化时通过引擎执行 responsive layout generation / compact，并在大型任务中标记为 heavy task。
  - 保持 `update:layouts`、`layoutChange`、`breakpointChange`、`widthChange` 事件语义。
  - responsive persistence 仍只接收完整 committed `layouts`，且不得把 responsive persistence 配置透传给内层 `VueGridLayout`。
  - 支持外部 `layouts` 变化期间的 preview rebase / cancel 语义，与单布局组件保持一致。
  _需求追溯: R4.AC3, R4.AC5, R6.AC5, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC7, R10.AC6_

- [x] 11. 增加 diagnostics、debug 事件与文档说明
  - 通过 `onEvent` 暴露 operation id、operation type、phase、layout size、affected count、collision count、index hit、scheduler mode、executor kind、duration 等结构化信息。
  - 覆盖 blocked、fallback、worker error、stale result、timeout、budget warning、interaction cancelled、legacy mismatch 等事件。
  - debug 模式提供可复现摘要：layout size、cols、compactType、操作输入和结果摘要，默认不输出完整业务 layout。
  - 更新 README / 示例，说明推荐 scheduler 配置、何时启用 Web Worker-capable 执行器、如何读取性能诊断，以及 preview、commit、persistence、history 的边界。
  _需求追溯: R5.AC7, R6.AC3, R6.AC4, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC6_

- [x] 12. 建立 layout-engine benchmark matrix 与性能预算门禁
  - 新增 `perf/layout-engine-bench.js`，支持 `SIZES=100,500,1000,2000`、`SCENARIOS`、`SEED`、`BUDGET_FILE`。
  - 覆盖 dense、sparse、static mixed、`preventCollision`、`allowOverlap`、drag across rows、north/west resize、external drop fit、compact commit。
  - 输出 mean、p95、max、operation count、item count、scheduler mode、executor kind、worker compute time、queue time、end-to-end time。
  - 新增 `perf/baselines/layout-engine.json` 与 `perf/budgets/layout-engine.json`，第一版采用相对回归预算 + 关键绝对上限。
  - 支持预算超限时本地或 CI 返回失败状态；预算未作为硬门禁的场景仍输出可比较基线。
  - 保留或迁移现有 `perf/bench.js`，避免两个 benchmark 对同一能力给出矛盾口径。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R10.AC5_

- [x] 13. 增加核心单元测试、legacy parity 测试与组件集成测试
  - 新增 `test/run-layout-engine-tests.js` 或接入现有测试入口，覆盖纯引擎、index、move、resize、drop fit、compact、rebase、scheduler、executor。
  - 建立 fixed seed case，覆盖 100、500、1000、2000 items 的 smoke 子集，以及 dense/sparse/static/preventCollision/allowOverlap/north-west resize/drop fit。
  - 对 `moveElement()`、`compact()`、`findFirstFit()`、`findNearestFit()` 建立 legacy parity 双跑测试。
  - 覆盖 `VueGridLayout` 默认新引擎、legacy fallback、compareLegacy、preview 不保存、commit 后保存、blocked visual state 和外部受控状态 rebase。
  - 覆盖 `ResponsiveVueGridLayout` breakpoint generation、`update:layouts`、responsive persistence committed-only 和 worker fallback。
  - 覆盖 SSR / 非浏览器环境下不访问 worker、window、document、rAF。
  _需求追溯: R1.AC3, R2.AC5, R2.AC6, R3.AC2, R3.AC4, R3.AC5, R4.AC5, R4.AC6, R5.AC1, R6.AC3, R6.AC4, R8.AC1, R8.AC4, R8.AC7, R10.AC2, R10.AC3, R10.AC5_

- [x] 14. 完成发布前导出、构建与回归验证
  - 确认 CommonJS、UMD、worker artifact、类型声明和 README 示例均能引用新 API。
  - 确认 `layoutEngine` 默认启用新路径，且 legacy fallback 可通过配置禁用新引擎。
  - 运行 `yarn lint`、`npx tsc --noEmit`、`yarn build`、`yarn test`、layout-engine 测试、组件集成测试和 benchmark smoke test。
  - 记录 bundle size、worker artifact size、benchmark 基线和已知 legacy 差异。
  - 确保任一新性能功能不可用时可以功能降级，而不是让基础 drag/resize/drop 不可用。
  _需求追溯: R8.AC1, R9.AC4, R9.AC5, R10.AC1, R10.AC3, R10.AC4, R10.AC5, R10.AC6_
