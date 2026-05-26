# 异步布局引擎与性能架构 需求规格

## 简介

当前网格组件已经具备基础拖拽、resize、drop、压缩、自动滚动、rAF 合帧和持久化能力，但大型 dashboard 的关键热路径仍散落在 Vue 组件事件流和 `lib/utils.ts` 中。`VueGridLayout` 使用 `LARGE_LAYOUT_THRESHOLD = 200` 在小布局同步更新和大布局 rAF 更新之间切换；`moveElement()`、`getAllCollisions()`、`findFirstFit()`、`findNearestFit()` 等核心函数仍依赖面向数组的扫描与递归式碰撞级联；现有 `perf/bench.js` 只覆盖随机布局下的 compact 和 move micro-benchmark，尚不能代表真实 dashboard 编辑场景。

本规格的目标是建立长期收益最大的性能架构：抽离可独立测试的布局引擎，引入共享空间索引与 occupancy model，将拖拽/resize/drop 的 preview 状态和 committed layout 分离，并提供可取消、可调度、Web Worker-capable 的前端异步执行边界。该方向借鉴成熟同类项目和产品中的独立 layout engine、批处理、可自定义布局、异步计算和可观测性能预算，但第一版不要求所有 pointermove 都跨线程执行；主线程仍应保留低延迟 preview，内置可选 Web Worker 执行器优先服务大型 compact、fit search、批量导入、响应式布局生成和提交校验等重任务。

本规格不包含完整桌面编辑 UX、snap lines、多选、复制粘贴、协同编辑、移动端交互重构或持久化文档模型重写。它必须与第一版持久化核心兼容，并为后续专业编辑 UX 提供稳定地基。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/LAYOUT-engine-pro/README.md
SPEC_BRIEF: docs/initiatives/LAYOUT-engine-pro/briefs/LAYOUT-async-layout-engine-performance-architecture.md

COVERAGE: async-layout-engine

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| async-layout-engine | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 纯布局引擎边界
**用户故事:** 作为库维护者，我希望布局计算从 Vue 组件、DOM 事件和持久化状态中抽离出来，以便核心算法可以独立测试、复用、调度和迁移到 worker。
**验收标准 (EARS):**
- R1.AC1: WHEN 创建布局引擎实例时，系统 SHALL 通过显式输入接收 `cols`、`maxRows`、`compactType`、`allowOverlap`、`preventCollision`、布局项约束和调度相关选项。
- R1.AC2: WHEN 调用布局引擎的核心操作时，系统 SHALL 不依赖 Vue reactivity、DOM 节点、Pinia、浏览器 storage 或组件实例状态。
- R1.AC3: WHEN 输入相同 layout、操作和选项时，系统 SHALL 产生确定性的布局结果、patch 结果和诊断元数据。
- R1.AC4: WHEN 操作未造成位置或尺寸变化时，系统 SHALL 返回可诊断的 no-op 结果，并 SHALL 避免不必要的全布局 clone。
- R1.AC5: WHEN 兼容现有 `LayoutItem` 字段时，系统 SHALL 保留位置、尺寸、约束、静态状态、拖拽/resize 配置和 `resizeHandles` 等公开语义。
- R1.AC6: WHEN 引擎内部需要可变数据结构提升性能时，系统 SHALL 将可变实现封装在引擎边界内，并 SHALL NOT 泄漏可变内部索引给组件调用方。

### R2: 共享空间索引与 occupancy model
**用户故事:** 作为 dashboard 编辑用户，我希望大型布局中的碰撞、查找空位和压缩计算保持快速，以便 500 到 2000 个组件的仪表盘仍能流畅编辑。
**验收标准 (EARS):**
- R2.AC1: WHEN layout 被加载到布局引擎时，系统 SHALL 默认构建 row/column occupancy index，并 SHALL 将 indexing strategy 保持为可插拔边界，用于碰撞检测、fit search、压缩和受影响区域计算。
- R2.AC2: WHEN 执行 `getFirstCollision` 或 `getAllCollisions` 等等价操作时，系统 SHALL 优先查询空间索引，并 SHALL 在索引不可用或输入非法时安全降级到线性扫描。
- R2.AC3: WHEN 执行 `findFirstFit` 或 `findNearestFit` 等等价操作时，系统 SHALL 复用 occupancy model 避免对每个候选位置重复扫描完整 layout。
- R2.AC4: WHEN item 被添加、删除、移动或 resize 时，系统 SHALL 支持增量更新索引，而不是每次交互 tick 都重建完整索引。
- R2.AC5: WHEN layout 包含 static items、约束尺寸、`maxRows`、`preventCollision` 或 `allowOverlap` 时，系统 SHALL 保持现有公开碰撞语义一致。
- R2.AC6: WHEN 空间索引返回候选碰撞项时，系统 SHALL 保持结果顺序和冲突处理可预测，避免因为索引桶顺序导致相同输入产生不同布局。
- R2.AC7: WHEN 第一版实现 indexing strategy 时，系统 SHALL 只要求内置 row/column occupancy strategy；其他策略 SHALL 作为未来扩展点，不得阻塞第一版交付。

### R3: 增量 move、resize、drop 与压缩操作
**用户故事:** 作为组件使用者，我希望拖拽、resize 和外部 drop 只重算真正受影响的布局区域，以便大型 dashboard 不因单个组件交互触发全量级联计算。
**验收标准 (EARS):**
- R3.AC1: WHEN 移动单个 item 时，系统 SHALL 返回新位置、受影响 items、碰撞列表、是否被阻止和布局 patch，而不是只返回完整 layout。
- R3.AC2: WHEN resize 单个 item 时，系统 SHALL 支持 east、south、west、north 及组合 resize handle 的现有语义，并 SHALL 正确处理由 north/west handle 导致的 `x` 或 `y` 变化。
- R3.AC3: WHEN 执行外部 drop fit 时，系统 SHALL 支持 cursor-first 和 auto-first 的放置策略，并 SHALL 能返回候选位置、失败原因和 fallback 策略。
- R3.AC4: WHEN `compactType` 为 `vertical`、`horizontal` 或 `null` 时，系统 SHALL 保持对应压缩和碰撞级联语义，并 SHALL 明确记录受影响区域。
- R3.AC5: IF `preventCollision` 为 true 且目标位置发生碰撞，系统 SHALL 返回 blocked 结果、阻塞原因和阻塞 items，并 SHALL NOT 静默移动 committed layout。
- R3.AC6: IF `allowOverlap` 为 true，系统 SHALL 跳过不必要的碰撞解算和压缩，但仍 SHALL 返回可用于 placeholder、事件回调和持久化提交的结果元数据。
- R3.AC7: WHEN 单次交互只影响局部 items 时，系统 SHALL 避免对未受影响 items 重新排序、重新 clone 或重新标记 `moved`。

### R4: Preview 状态与 committed layout 分离
**用户故事:** 作为 dashboard 编辑用户，我希望拖拽和 resize 中的视觉预览即时反馈，而保存、undo/redo 和业务回调只接收稳定提交结果，以便交互既顺滑又不会污染持久化状态。
**验收标准 (EARS):**
- R4.AC1: WHEN drag 或 resize 正在进行时，系统 SHALL 将 preview state、placeholder state 和 committed layout state 分开表示。
- R4.AC2: WHEN 交互 tick 产生新 preview 时，系统 SHALL 能更新 placeholder、blocked 状态和预览 patch，而不要求立即提交完整 layout。
- R4.AC3: WHEN dragStop、resizeStop 或 drop commit 发生时，系统 SHALL 生成 committed layout，并 SHALL 只在 commit 后通知 persistence、history 和 committed layout change 回调。
- R4.AC4: WHEN 交互被取消或组件卸载时，系统 SHALL 能丢弃 preview state，并 SHALL 恢复到最近的 committed layout。
- R4.AC5: WHEN 外部受控 `modelValue` 或 `layouts` 在交互期间变化时，系统 SHALL 默认尝试将当前 preview rebase 到最新 committed layout；IF active item 被删除、约束冲突或无法安全 rebase，系统 SHALL 取消当前交互、应用最新外部状态并暴露结构化事件。
- R4.AC6: WHEN preview 计算滞后或异步任务返回旧结果时，系统 SHALL 忽略 stale preview，不得覆盖更新的 committed layout 或当前 pointer 位置。

### R5: 可配置交互调度器
**用户故事:** 作为库集成者，我希望能根据 dashboard 规模和产品手感选择调度策略，以便小布局保持即时、大布局保持稳定帧率、超大布局避免主线程阻塞。
**验收标准 (EARS):**
- R5.AC1: WHEN 配置交互调度时，系统 SHALL 支持至少 `eager`、`raf`、`commitOnly` 和 `auto` 调度模式。
- R5.AC2: WHEN 使用 `eager` 模式时，系统 SHALL 在每个有效交互 tick 尝试同步计算 preview，并 SHALL 保持现有小布局交互语义。
- R5.AC3: WHEN 使用 `raf` 模式时，系统 SHALL 将同一帧内的多次交互输入合并为最新输入，并 SHALL 每帧最多提交一次 preview 更新。
- R5.AC4: WHEN 使用 `commitOnly` 模式时，系统 SHALL 在交互过程中提供轻量 placeholder 反馈，并 SHALL 在 stop/commit 时执行完整布局解算。
- R5.AC5: WHEN 使用 `auto` 模式时，系统 SHALL 根据 item 数量、布局密度、上次计算耗时和调度配置选择合适策略，并 SHALL 替代硬编码的大布局阈值。
- R5.AC6: WHEN 新交互输入到达时，系统 SHALL 能取消或淘汰尚未完成的旧计算任务，避免任务积压造成延迟反馈。
- R5.AC7: WHEN 调度器降级、跳帧或丢弃 stale 任务时，系统 SHALL 暴露结构化诊断事件，供开发者调试性能问题。

### R6: Web Worker-capable 异步布局执行器
**用户故事:** 作为需要超大 dashboard 的产品开发者，我希望布局引擎可以把重计算迁移到浏览器 Web Worker 或自定义前端异步执行器，以便主线程保留输入响应和视觉反馈。
**验收标准 (EARS):**
- R6.AC1: WHEN 调用布局引擎操作时，系统 SHALL 提供 sync-compatible 和 async-compatible 的 API 形态，使同一操作可以在主线程或 Web Worker-capable 执行器中执行。
- R6.AC2: WHEN 使用 Web Worker-capable 执行器时，系统 SHALL 只传递可序列化的 layout、操作、选项和任务元数据，并 SHALL NOT 传递 DOM 节点、Vue refs 或函数闭包。
- R6.AC3: WHEN 异步任务被取消、超时或返回 stale task id 时，系统 SHALL 丢弃该结果，并 SHALL 保持当前 preview 或 committed layout 不被旧结果覆盖。
- R6.AC4: WHEN worker 初始化失败、运行时抛错或当前环境不支持 worker 时，系统 SHALL 安全回退到主线程调度策略，并 SHALL 暴露可诊断错误。
- R6.AC5: WHEN 大型 compact、drop fit、批量导入、响应式 breakpoint 生成或提交校验被标记为 heavy task 时，系统 SHALL 能把这些任务提交到内置可选 Web Worker 执行器。
- R6.AC6: WHEN pointermove 频繁触发时，系统 SHOULD 避免强制每个 tick 都跨线程 roundtrip，并 SHOULD 保留主线程低延迟 preview 或最后可用结果。
- R6.AC7: WHEN 异步执行器返回结果时，系统 SHALL 将结果转换为与同步引擎一致的 patch、diagnostics 和 committed layout 结构。

### R7: 性能预算、benchmark matrix 与回归门禁
**用户故事:** 作为库维护者，我希望大型布局性能可以被持续测量和门禁保护，以便后续功能不会悄悄让拖拽、resize 或 drop 变慢。
**验收标准 (EARS):**
- R7.AC1: WHEN 运行性能 benchmark 时，系统 SHALL 覆盖至少 100、500、1000 和 2000 items 的布局规模。
- R7.AC2: WHEN 运行 benchmark matrix 时，系统 SHALL 覆盖 dense layout、sparse layout、static item 混合、`preventCollision`、`allowOverlap`、drag across rows、north/west resize、external drop fit 和 compact commit 场景。
- R7.AC3: WHEN benchmark 完成时，系统 SHALL 输出每类场景的平均耗时、p95 耗时、最大耗时、操作次数和布局规模。
- R7.AC4: WHEN 性能预算被配置时，系统 SHALL 支持相对回归预算与关键绝对上限，并 SHALL 能在 CI 或本地校验中对超出预算的场景返回失败状态。
- R7.AC5: WHEN 第一版性能门禁运行时，系统 SHALL 至少对关键交互场景设置绝对上限，并 SHALL 对其余 benchmark 场景记录可比较的相对基线。
- R7.AC6: WHEN benchmark 输入使用随机布局时，系统 SHALL 支持固定 seed，以便同一次回归分析可重复。
- R7.AC7: WHEN 引擎采用 Web Worker-capable 执行器时，benchmark SHALL 分别报告计算耗时、调度等待耗时和端到端耗时。

### R8: Vue 组件集成与兼容性
**用户故事:** 作为现有用户，我希望性能架构升级后原有组件 API、事件和布局语义保持兼容，以便升级不会破坏现有 dashboard。
**验收标准 (EARS):**
- R8.AC1: WHEN 新布局引擎作为默认路径启用时，`VueGridLayout` 和 `ResponsiveVueGridLayout` SHALL 保持现有公开 props、事件和默认布局语义兼容。
- R8.AC2: WHEN 启用新的 layout engine 时，组件 SHALL 通过薄集成层调用引擎操作，而不是在组件事件处理器中重新实现碰撞、fit 或压缩逻辑。
- R8.AC3: WHEN drag、resize、drop 和 responsive breakpoint 变化发生时，组件 SHALL 将 committed layout 结果继续通过现有 `layoutChange`、`update:modelValue` 或 `update:layouts` 事件暴露。
- R8.AC4: WHEN 第一版 persistence prop 同时启用时，组件 SHALL 只把 committed layout 提交给持久化层，并 SHALL NOT 保存 preview 中间态。
- R8.AC5: WHEN `historyStore` 同时启用时，组件 SHALL 继续只在 committed interaction 边界创建 undo/redo 快照。
- R8.AC6: WHEN 引擎返回 blocked、diagnostics 或 scheduler event 时，组件 SHALL 能把这些状态映射到现有 blocked visual state 和可选开发者回调。
- R8.AC7: WHEN SSR 或非浏览器环境渲染组件时，系统 SHALL 不访问 worker、window、document 或 rAF 相关能力，除非已经进入客户端安全路径。

### R9: 可观测性、调试与文档
**用户故事:** 作为集成开发者，我希望能理解每次布局计算为什么慢、为什么被阻止、为什么被调度器延后，以便在真实产品中定位复杂 dashboard 的性能问题。
**验收标准 (EARS):**
- R9.AC1: WHEN 布局引擎完成 move、resize、drop、compact 或 fit 操作时，系统 SHALL 可选输出 operation id、耗时、受影响 item 数、碰撞数、调度模式和是否命中索引。
- R9.AC2: WHEN 发生 blocked、fallback、worker error、stale result、timeout 或 budget warning 时，系统 SHALL 暴露结构化事件，而不是只写入 console。
- R9.AC3: WHEN 开发者启用 debug 模式时，系统 SHALL 能提供足够信息复现实例，包括 layout size、cols、compactType、操作输入和结果摘要。
- R9.AC4: WHEN 更新 README 或示例时，系统 SHALL 说明推荐 scheduler 配置、何时启用 Web Worker-capable 执行器、以及如何读取性能诊断。
- R9.AC5: WHEN 发布类型声明时，系统 SHALL 导出布局引擎、调度器、操作结果、patch、diagnostics、worker executor 和 benchmark 相关类型。
- R9.AC6: WHEN 文档描述性能能力时，系统 SHALL 明确 preview、commit、persistence 和 history 的边界，避免使用者误以为每次 pointermove 都会 durable save。

### R10: 渐进迁移与发布安全
**用户故事:** 作为库维护者，我希望以可回滚、可对比的方式引入新引擎，以便长期架构升级不会一次性扩大风险。
**验收标准 (EARS):**
- R10.AC1: WHEN 新引擎首次集成时，系统 SHALL 将新 layout engine 作为默认路径，并 SHALL 支持通过配置禁用或回退到 legacy layout path。
- R10.AC2: WHEN legacy path 与新引擎 path 对同一输入运行时，系统 SHOULD 能在测试或 debug 模式下比较输出差异。
- R10.AC3: WHEN 新引擎输出与 legacy 行为存在有意差异时，系统 SHALL 在文档和测试中记录差异原因。
- R10.AC4: WHEN 引擎内部模块被拆分时，系统 SHALL 保持现有公开入口和类型导出稳定，除非明确进入 breaking change 发布流程。
- R10.AC5: WHEN 性能架构完成第一阶段发布时，系统 SHALL 至少通过 lint、typecheck、build、核心单元测试、组件集成测试和 benchmark smoke test。
- R10.AC6: WHEN 任一新性能功能无法在当前环境运行时，系统 SHALL 以功能降级方式失败，而不是让基础 drag/resize/drop 不可用。

## Clarifications

### Session 2026-05-09

- Q: 第二个 spec 应选择保守优化、引擎核心，还是激进异步引擎？ -> A: 选择 C：异步可扩展布局引擎，追求长期收益最大。
- Q: 是否所有拖拽 tick 都必须走 worker？ -> A: 不必须；主线程保留低延迟 preview，Web Worker-capable 前端执行器优先处理大型 compact、fit search、批量导入、响应式布局生成和提交校验。
- Q: 第二个 spec 是否包含桌面编辑 UX 的 snap lines、多选、复制粘贴和工具栏？ -> A: 不包含；这些属于后续桌面编辑 UX spec，本规格只提供性能和引擎地基。
- Q: 第二个 spec 是否重写第一版 persistence？ -> A: 不重写；本规格必须与第一版持久化核心兼容，并确保 persistence 只接收 committed layout。
- Q: 移动端是否纳入本轮？ -> A: 不纳入；当前阶段聚焦桌面大型 dashboard 编辑性能。
- Q: 新布局引擎第一版发布时，默认启用策略应是什么？ -> A: 选择 C：新引擎默认用于全部布局；同时保留 legacy fallback 和双跑对比，确保长期收益最大且可回滚。
- Q: 性能预算第一版应该怎么设，才能既“一次做好”又能稳定执行？ -> A: 选择 B：相对预算 + 关键绝对上限；相对预算用于长期防回归，关键绝对上限用于守住用户体验底线。
- Q: 第一版要不要内置可选的 Web Worker 执行器？ -> A: 选择 B：内置可选 Web Worker 执行器，heavy tasks 自动使用；pointermove preview 仍走主线程低延迟路径。
- Q: 如果外部受控 `modelValue` / `layouts` 在用户拖拽或 resize 过程中变化，默认策略应该是什么？ -> A: 选择 C：默认尝试 rebase 到最新 committed layout；无法安全 rebase 时取消交互、应用最新外部状态并发出结构化事件。
- Q: 第一版布局索引要以哪种模型作为主实现？ -> A: 选择 B：默认使用 row/column occupancy index，并保留可插拔 indexing strategy；第一版只内置 occupancy strategy，其他策略作为未来扩展点。
