# External Drop Session Refactor 需求规格

## 简介

当前外部拖入流程的 preview、render、commit 分散在多个状态和分支中：`droppingDOMNode` 承担 drop 中状态标记，`activeDrag` 承担 ghost 几何，`dropDragOver` 返回值只在部分路径生效，commit 又可能重新读取原始 `droppingItem` 或重新执行 `auto` 定位。这个结构导致外部拖入在松手前后出现真实临时元素、位置跳变、尺寸变化、compact 后 placeholder 与最终 item 不一致等问题。

本规格目标是将外部拖入重构为明确的 External Drop Session 单一事实源，使外部拖入从进入网格、预览、取消到提交全过程的状态、几何、事件和渲染行为保持一致，并为后续 editor/dashboard/drop 策略扩展提供长期稳定基础。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/LAYOUT-engine-pro/README.md
SPEC_BRIEF: docs/initiatives/LAYOUT-engine-pro/briefs/LAYOUT-external-drop-session-refactor.md

COVERAGE: external-drop-session

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| external-drop-session | R1-R8 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## Clarifications

### Session 2026-05-24

- Q: 这次“一劳永逸”是否必须同时覆盖 legacy layout engine 和新 layout engine？ -> A: A，全覆盖；新 engine 和 legacy engine 都纳入 External Drop Session，不保留长期双路径风险。
- Q: 外部拖入 preview 时，是否要展示完整的“未提交预览布局”？ -> A: A，session 持有 display-only previewLayout，渲染层临时展示已有 item reflow 与 ghost，但不得对外提交。
- Q: 当外部拖入 preview 计算失败，比如 no-fit / collision / maxRows，应该怎么展示？ -> A: B，显示 blocked ghost / blocked state 并记录原因，但松手不提交。
- Q: `activeDrag` 在外部 drop 中要不要彻底退出主状态职责？ -> A: A，外部 drop 不再使用 `activeDrag` 作为主 ghost 状态，`activeDrag` 只服务内部 drag/resize。
- Q: 这次重构是否要把当前已做的局部修复吸收到 session 架构里，最终不保留临时补丁形态？ -> A: A，当前局部修复全部吸收到 session 架构，最终移除临时分支。

## 需求列表

### R1: 建立 External Drop Session 单一事实源
**用户故事:** 作为维护者，我希望外部拖入的状态由一个明确的 session 模型统一管理，以便 preview、render、commit 不再从不同来源拼装状态。
**验收标准 (EARS):**
- R1.AC1: WHEN 外部拖入进入 grid 时，系统 SHALL 创建一个 External Drop Session，记录 drop id、source item、base layout、当前策略、当前状态和交互 request id。
- R1.AC2: WHEN `dropDragOver` 返回尺寸或其他 item 覆盖值时，系统 SHALL 将解析后的结果写入 session 的 resolved item，而不是只保存在局部变量中。
- R1.AC3: WHEN layout engine preview 返回 placeholder 或 drop result 时，系统 SHALL 将最终可见 ghost 几何写入 session，作为后续 render 和 commit 的唯一几何来源。
- R1.AC4: IF 外部拖入被拒绝、离开 grid、取消或组件卸载，系统 SHALL 通过 session cleanup 清理 preview layout、ghost、guides、auto scroll 和 interaction machine 状态。
- R1.AC5: WHEN preview 计算得到已有 item 的 reflow、compact 或避让结果时，系统 SHALL 将结果保存为 session 的 display-only `previewLayout`，用于渲染未提交预览布局。
- R1.AC6: WHEN preview 计算失败且存在可表达的候选位置，系统 SHALL 将 session 标记为 blocked，并记录 blocked reason、blocked message 和 blocked ghost geometry。

### R2: 保证 ghost 与 commit 结果一致
**用户故事:** 作为使用者，我希望松手后新元素的位置和尺寸与拖入时看到的 ghost 完全一致，以便预览可信。
**验收标准 (EARS):**
- R2.AC1: WHEN 用户在有效 ghost 上松手，系统 SHALL 使用当前 session resolved item 的 `x/y/w/h` 构造 commit 操作。
- R2.AC2: WHEN `dropStrategy` 为 `auto` 且已有有效 preview target，系统 SHALL commit 到 session target，而不是重新执行 first-fit 定位。
- R2.AC3: WHEN `dropDragOver` 改变 `w/h`，系统 SHALL 保证 ghost、commit operation item、`drop` 事件返回 item 的 `w/h` 完全一致。
- R2.AC4: WHEN layout engine compact 或 fallback 改变最终位置，系统 SHALL 以 engine final placeholder 更新 session ghost，并保证 `drop` 事件 item 与该 final placeholder 一致。
- R2.AC5: IF 当前 session 状态为 blocked，WHEN 用户松手，系统 SHALL 不提交 drop、不自动 fallback 到其他位置，并清理或保留失败反馈直到交互结束。

### R3: 隔离计算用临时 item 与用户可见渲染
**用户故事:** 作为使用者，我希望拖入过程中只看到 ghost placeholder，不看到尚未提交的真实 grid item，以便界面语义清晰。
**验收标准 (EARS):**
- R3.AC1: WHEN 外部拖入处于 previewing 或 ready 状态，系统 SHALL 只渲染真实 children 和 session ghost。
- R3.AC2: IF layout engine 需要 synthetic drop item 参与碰撞或 compact 计算，系统 SHALL 将其限制在 session/engine 计算层，不得作为普通 child GridItem 渲染。
- R3.AC3: WHEN `layoutChange` 或 `update:modelValue` 触发时，系统 SHALL 不向外暴露尚未提交的 synthetic drop item。
- R3.AC4: WHEN 用户松手提交成功后，系统 SHALL 只通过 `drop` 事件和父级数据更新引入真实 item。
- R3.AC5: WHEN session 存在 display-only `previewLayout`，系统 SHALL 使用该 layout 临时渲染已有 item 的预览位置，但 SHALL NOT 将该 previewLayout 写入父级 model 或作为正式 layoutChange 发出。
- R3.AC6: WHEN session 状态为 blocked，系统 SHALL 渲染 blocked ghost 或等价 blocked visual state，使用户能区分可提交 preview 与不可提交 preview。

### R4: 统一新旧 layout engine 与策略行为
**用户故事:** 作为维护者，我希望 cursor、auto、legacy engine、新 layout engine 的外部拖入语义一致，以便减少策略分支中的隐藏差异。
**验收标准 (EARS):**
- R4.AC1: WHEN 使用新 layout engine preview 时，系统 SHALL 从 session 构造 preview operation，并将 result 写回 session。
- R4.AC2: WHEN 使用新 layout engine commit 时，系统 SHALL 从当前 session 构造 commit operation，不得重新从原始 props 推导位置或尺寸。
- R4.AC3: WHEN 使用 legacy path preview 时，系统 SHALL 将 legacy 计算得到的 resolved item 写入同一个 session 模型，不得保留独立的长期 preview 状态路径。
- R4.AC4: WHEN 使用 legacy path commit 时，系统 SHALL 以 session resolved item 为提交基准，并保持 `drop` 事件语义与新 engine 一致。
- R4.AC5: IF 某个 legacy 分支无法一次性迁移到 session，系统 SHALL 将该分支标记为明确的短期迁移任务，并在最终验收前消除或封装到 session 适配层。

### R5: 明确状态命名与职责边界
**用户故事:** 作为维护者，我希望 drop 状态命名能表达真实职责，以便后续修改不再误用 `activeDrag` 或 `droppingDOMNode`。
**验收标准 (EARS):**
- R5.AC1: WHEN 重构完成，系统 SHALL 使用明确的 drop session 状态判断是否正在外部拖入，而不是依赖 `droppingDOMNode`。
- R5.AC2: WHEN 渲染 ghost，系统 SHALL 使用 session ghost 或一个统一 selector，不直接读取多个互相竞争的状态字段。
- R5.AC3: WHEN 外部 drop preview 更新 ghost 时，系统 SHALL NOT 将该 ghost 写入 `activeDrag` 作为主状态；`activeDrag` SHALL 只服务内部 drag/resize 交互。
- R5.AC4: WHEN 渲染外部 drop ghost，系统 SHALL 通过 drop session ghost selector 获取几何，不依赖 `activeDrag`。
- R5.AC5: IF 兼容旧字段不可一次移除，系统 SHALL 将兼容字段的写入限制在适配层，并在任务中明确移除或降级路径。
- R5.AC6: WHEN 重构完成，系统 SHALL 将当前关于 ghost 位置同步、尺寸同步、synthetic item 不渲染、dropFit final placeholder 对齐的局部修复吸收到 session 架构，不得以分散临时分支作为最终实现形态。

### R6: 保持公共 API 兼容
**用户故事:** 作为现有用户，我希望升级后外部 drop 的公共 API 不破坏已有接入，以便无需重写业务代码。
**验收标准 (EARS):**
- R6.AC1: WHEN 用户继续使用 `isDroppable`、`dropStrategy`、`droppingItem`、`dropDragOver` 和 `drop`，系统 SHALL 保持这些 props/events 的公开签名兼容。
- R6.AC2: WHEN `dropDragOver` 返回 `false`，系统 SHALL 拒绝当前 preview 并清理 session，行为与当前 API 语义一致。
- R6.AC3: WHEN `dropDragOver` 返回部分尺寸覆盖值，系统 SHALL 与当前 API 兼容地合并到 dropping item，再写入 session。
- R6.AC4: IF editor runtime 或 dashboard runtime 禁止外部 drop，系统 SHALL 不创建可提交 session，并保持只读/视图模式约束。

### R7: 建立回归测试矩阵
**用户故事:** 作为维护者，我希望关键 drop 行为都有自动化测试，以便后续优化不会再次破坏 preview/commit 一致性。
**验收标准 (EARS):**
- R7.AC1: WHEN 运行核心测试，系统 SHALL 覆盖 auto 模式 ghost 与 commit 位置一致。
- R7.AC2: WHEN 运行核心测试，系统 SHALL 覆盖 `dropDragOver` 改变尺寸后 ghost 与 commit 尺寸一致。
- R7.AC3: WHEN 运行核心测试，系统 SHALL 覆盖 cursor 模式、新 layout engine、legacy path、display-only previewLayout、blocked ghost、drop rejected、drag leave cleanup。
- R7.AC4: WHEN 运行布局引擎测试，系统 SHALL 覆盖 dropFit placeholder 与 final layout item 在 compact/fallback 后一致。
- R7.AC5: WHEN 运行仓库标准验证，系统 SHALL 至少通过 `npm test`、`npm run build`、`npm run test:examples` 和 `npm run check:bundle`；如 `npm run check:package` 因仓库既有 ignored legacy artifact 失败，结果 SHALL 明确记录原因。
- R7.AC6: WHEN 代码审查或任务验收执行时，系统 SHALL 验证 preview/commit 一致性由 session 模型保证，而不是依赖散落在旧路径上的独立补丁。

### R8: 提供真实用例验证入口
**用户故事:** 作为维护者，我希望有接近真实业务的 dogfood 示例验证外部拖入，以便发现 API 和状态模型是否顺手。
**验收标准 (EARS):**
- R8.AC1: WHEN 示例或测试工作台执行外部拖入，系统 SHALL 覆盖 `dropDragOver` 动态调整尺寸、auto 策略、cursor 策略和取消路径。
- R8.AC2: WHEN 示例展示外部拖入，系统 SHALL 避免浏览器原生 drag image 与 grid ghost 混淆。
- R8.AC3: WHEN dogfood 验证发现 session API 难以表达某个状态，系统 SHALL 回写设计或任务，而不是在示例里绕过 session。
