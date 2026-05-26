# Editor Command Kernel 需求规格

## 简介

当前专业编辑器已经具备 `editor.execute()`、`beforeCommand`、命令事件和编辑器 history，但仍存在入口不完全统一的问题：键盘、工具栏、菜单和 API 命令会进入 command 管线，普通拖拽、resize、drop 等交互提交仍可能直接写 layout/history。为了长期支撑业务确认弹框、权限、审计、可预览影响范围、稳定 undo/redo 粒度、未来协作来源过滤，本规格要求将所有编辑意图收敛到统一的 Command Kernel。

目标是建立一条稳定主干：用户意图先归一化为 command，再经过同步能力检查、异步 guard、transaction preview/commit、history 记录和事件通知。UI 弹框、权限和审计由业务通过 headless API 接入，核心库不内建具体弹框 UI。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/EDITOR-professional-editor/README.md
SPEC_BRIEF: docs/initiatives/EDITOR-professional-editor/briefs/EDITOR-editor-command-kernel.md

COVERAGE: editor-command-kernel

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| editor-command-kernel | R1-R12 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## Clarifications

### Session 2026-05-20

- Q: selection/focus 这类非布局编辑状态是否进入 undo/redo history？ -> A: selection/focus 走 Command Kernel，但默认 `history: ignore`；未来可按 command opt-in `record-preserveRedoStack`。
- Q: pointer drag/resize 被 guard 拦住后，用户松手时的视觉状态怎么处理？ -> A: guard block/cancel 后立即回滚到交互开始前的 committed layout，并清理 placeholder/guides/active interaction。
- Q: Command Kernel 是否应该在本轮要求提供公开命令注册扩展 API？ -> A: 本轮只做内建 command registry 和 descriptor，预留未来扩展点，不承诺完整公开 `registerCommand()`。
- Q: 异步 guard 期间又触发新的互斥命令，默认策略是什么？ -> A: pending guard 期间默认拒绝新的互斥命令，不排队；未来可按 command opt-in queue。
- Q: 外部 v-model / persistence / remote 更新默认是否清空 redo 栈？ -> A: 外部/programmatic 更新默认 `history: ignore` 且保留 redo 栈；只有显式 replace/load new document/reset history 才清空。

## 需求列表

### R1: 统一命令入口
**用户故事:** 作为仪表盘编辑器集成方，我希望所有会改变编辑状态的入口都先变成统一 command，以便快捷键、工具栏、右键菜单、API、拖拽和外部 drop 遵循同一套权限、确认、审计和 history 规则。
**验收标准 (EARS):**
- R1.AC1: WHEN 用户通过 keyboard、toolbar、context-menu、api、pointer、drop 或 persistence 触发编辑行为 THEN 系统 SHALL 归一化为 `GridEditorCommand` 或等价扩展类型后再进入提交管线。
- R1.AC2: WHEN command 会改变 layout、metadata、sectionRows、selection、focus、dirty/conflict 或 persistence 状态 THEN 系统 SHALL 通过 Command Kernel 执行，而不是在入口处直接提交最终状态。
- R1.AC3: IF 某个入口暂时无法命令化 THEN 系统 SHALL 以明确兼容路径标记该入口，并在文档中说明其限制和迁移目标。
- R1.AC4: WHEN 新增用户可触发的编辑能力 THEN 开发者 SHALL 通过注册或声明 command 的方式接入，而不是新增独立的快捷键/按钮/事件提交分支。

### R2: 命令注册表与描述元数据
**用户故事:** 作为组件库维护者，我希望 command 有统一描述和能力声明，以便工具栏、菜单、快捷键、禁用态、文案和审计不重复实现。
**验收标准 (EARS):**
- R2.AC1: WHEN command 被系统支持 THEN 系统 SHALL 提供稳定的 command type、label/labelKey、source、target 解析、影响范围、默认 history 策略和可选快捷键描述。
- R2.AC2: WHEN toolbar 或 context menu 需要渲染操作项 THEN 系统 SHALL 能从 command 描述或 toolbar state 派生命令可用性、禁用原因和快捷键提示。
- R2.AC3: WHEN command 不改变业务数据 THEN 系统 SHALL 能将其声明为不影响数据或不进入 history 的命令。
- R2.AC4: IF command 需要 payload schema 或能力约束 THEN 系统 SHALL 在执行前进行同步校验并返回稳定的 blocked/noop/error 结果。
- R2.AC5: WHEN 本轮实现 command registry THEN 系统 SHALL 覆盖内建 command descriptor；公开第三方 `registerCommand()` 扩展 API SHALL 仅作为未来兼容方向预留，不作为本轮验收要求。

### R3: 统一异步 Guard 与业务确认
**用户故事:** 作为业务开发者，我希望通过一个顶层 async guard 拦截所有高风险命令，以便在撤销、删除、重置、跨域移动等操作前弹框确认或执行权限校验。
**验收标准 (EARS):**
- R3.AC1: WHEN command 通过同步能力检查后且尚未提交状态前 THEN 系统 SHALL 调用 `beforeCommand` 或等价 guard。
- R3.AC2: WHEN guard 返回 allow THEN 系统 SHALL 继续执行 transaction commit。
- R3.AC3: WHEN guard 返回 block THEN 系统 SHALL 不提交任何状态变更，并返回 `blocked` 结果及可诊断原因。
- R3.AC4: WHEN guard 返回 cancel THEN 系统 SHALL 不提交任何状态变更，并返回 `cancelled` 结果以区分用户取消和规则阻塞。
- R3.AC5: WHEN guard 超时、抛错或被取消 THEN 系统 SHALL 返回 `timeout` 或 `error` 结果，且不得提交过期 command。
- R3.AC6: IF 业务需要弹框 THEN 核心库 SHALL 只等待 guard Promise 的结果，不内建具体 modal、toast、i18n 或 UI 依赖。

### R4: Guard 上下文与预览信息
**用户故事:** 作为产品开发者，我希望确认弹框能看到命令将影响什么，以便向用户展示准确、可审计的确认内容。
**验收标准 (EARS):**
- R4.AC1: WHEN guard 被调用 THEN 上下文 SHALL 至少包含 command、source、targetIds、当前 layout/layouts、editorMetaById、sectionRows、selection、mode 和 history 可用性。
- R4.AC2: WHEN command 可产生预览 THEN guard 上下文 SHOULD 包含 transaction preview，描述 layout patches、metadata patches、affectedIds、beforeSummary、afterSummary 和风险标记。
- R4.AC3: WHEN preview 展示给业务确认 THEN 最终 commit SHALL 基于同一份归一化 command 输入和同步校验结果，避免确认内容与实际提交不一致。
- R4.AC4: IF preview 在 guard 等待期间因外部状态变化失效 THEN 系统 SHALL 取消或重新校验 command，而不是提交过期 preview。

### R5: Transaction Kernel 与状态提交边界
**用户故事:** 作为维护者，我希望 command handler 产出 transaction 或 patch，再由内核统一 apply，以便 preview、rollback、history 和测试都有单一提交边界。
**验收标准 (EARS):**
- R5.AC1: WHEN command handler 计算结果 THEN handler SHOULD 返回 transaction/result/patch 描述，而不是绕过内核直接修改响应式状态。
- R5.AC2: WHEN transaction 被提交 THEN 系统 SHALL 以原子方式更新 layout、layouts、metadata、sectionRows、selection、focus、dirty/conflict 和 persistence 相关状态。
- R5.AC3: WHEN transaction 提交失败 THEN 系统 SHALL 保持提交前状态，或执行可验证 rollback。
- R5.AC4: WHEN transaction 状态变更完成 THEN 系统 SHALL 再发出 command-commit、layoutChange、update:modelValue/update:layouts 和 dirty/persistence 事件，且顺序稳定。

### R6: Pointer、Resize 和 Drop 命令化
**用户故事:** 作为终端用户，我希望拖拽、resize、外部 drop 与键盘移动一样拥有一致的确认、撤销和审计行为，以便交互体验可预期。
**验收标准 (EARS):**
- R6.AC1: WHEN pointer drag stop 产生有效 layout 变化 THEN 系统 SHALL 构造 `move` 或 group move command 并经过 Command Kernel guard 后提交。
- R6.AC2: WHEN resize stop 产生有效 layout 变化 THEN 系统 SHALL 构造 `resize` command 并经过 Command Kernel guard 后提交。
- R6.AC3: WHEN external drop commit 产生新增或移动 layout 变化 THEN 系统 SHALL 构造 `add`、`paste`、`move` 或专用 drop command 并经过 Command Kernel guard 后提交。
- R6.AC4: WHEN pointer/resize/drop 被 guard cancel 或 block THEN 系统 SHALL 清理 placeholder、guides、active interaction 和 auto-scroll 状态，并恢复到交互开始前的 committed layout。
- R6.AC5: IF 交互只是 preview frame 或未越过 activation distance THEN 系统 SHALL 不创建 command、不写 history、不触发持久化提交。
- R6.AC6: WHEN pointer/resize/drop 的 guard 未返回 allow THEN 系统 SHALL 不保留拖拽后的未提交视觉位置，除非未来显式引入独立 draft 模式。

### R7: History Mark、Bail、Squash 与记录策略
**用户故事:** 作为编辑器用户，我希望一次连续交互可以被一次撤销，并且取消交互不会污染 redo 栈，以便 undo/redo 粒度符合专业画布产品预期。
**验收标准 (EARS):**
- R7.AC1: WHEN 连续交互开始 THEN 系统 SHOULD 创建 history stopping point 或等价 transaction mark。
- R7.AC2: WHEN 连续交互成功提交 THEN 系统 SHALL 将交互期间的变化 squash 成一个可撤销 history entry。
- R7.AC3: WHEN 连续交互被 Esc、guard cancel、能力阻塞或 stale request 取消 THEN 系统 SHALL bail 到交互开始 mark，并且不向 redo 栈加入该取消过程。
- R7.AC4: WHEN command 指定 `history: "ignore"` THEN 系统 SHALL 不记录 undo/redo entry，且不得清空 redo 栈。
- R7.AC5: WHEN command 指定 `history: "record-preserveRedoStack"` THEN 系统 SHALL 记录必要状态但保留已有 redo 栈。
- R7.AC6: WHEN command 指定 mergeKey 或 mergeWindowMs THEN 系统 MAY 合并相邻 entry，但明确 mark/squash 边界 SHALL 优先于纯时间合并。
- R7.AC7: WHEN selection 或 focus command 通过 Command Kernel 执行 THEN 系统 SHALL 默认使用 `history: "ignore"`，且 MAY 允许显式 opt-in `record-preserveRedoStack`。

### R8: Source、Origin 与外部更新隔离
**用户故事:** 作为协作和持久化功能维护者，我希望每次变更都有来源和 origin，以便区分本地用户、系统修复、远程同步和持久化加载。
**验收标准 (EARS):**
- R8.AC1: WHEN command 或 transaction 被创建 THEN 系统 SHALL 标记 source，至少覆盖 keyboard、toolbar、context-menu、pointer、api、persistence、drop 和 external/remote 等来源。
- R8.AC2: WHEN 父组件 v-model、persistence load、remote sync、repair 或 runtime measurement 触发布局更新 THEN 系统 SHALL 默认作为 external/programmatic 更新处理，不进入用户 undo 栈。
- R8.AC3: IF 未来接入协作层 THEN 系统 SHALL 能按 origin/trackedOrigins 过滤本地 undo 与远程同步变更。
- R8.AC4: WHEN 产生 history entry 或审计事件 THEN 系统 SHALL 保留 command source/origin、targetIds、affectedIds 和 createdAt。
- R8.AC5: WHEN external/programmatic 更新默认以 `history: "ignore"` 应用 THEN 系统 SHALL 保留 redo 栈；只有显式 replace/load new document/reset history 策略 SHALL 清空 redo 栈。

### R9: Guard 与 Event 分工
**用户故事:** 作为业务集成方，我希望阻塞逻辑和观察逻辑职责清晰，以便权限、确认、埋点和 toast 不互相干扰。
**验收标准 (EARS):**
- R9.AC1: WHEN 业务需要阻塞或确认 command THEN 业务 SHALL 使用 guard，而不是依赖 onEvent 回调修改命令流。
- R9.AC2: WHEN command 状态变化 THEN 系统 SHALL 发出 command-start、command-commit、command-blocked、command-error 或等价事件用于观察。
- R9.AC3: WHEN onEvent 监听器抛错 THEN 系统 SHALL 不改变已完成的 command 提交结果，并 SHOULD 以可诊断方式暴露监听器错误。
- R9.AC4: IF 文档描述事件 API THEN 文档 SHALL 明确事件是观察面，不是拦截面。

### R10: 并发、取消与重入策略
**用户故事:** 作为复杂业务开发者，我希望异步确认期间的并发行为可控，以便避免过期弹框提交、重复快捷键和嵌套命令造成状态交叉。
**验收标准 (EARS):**
- R10.AC1: WHEN guard 正在等待且同一作用域收到新的互斥 command THEN 系统 SHALL 按配置排队、拒绝或取消旧 command，并返回稳定结果。
- R10.AC2: WHEN 组件卸载、editor.stop、layout 外部替换或 command sequence 过期 THEN 系统 SHALL 取消待处理 guard，且不得提交其结果。
- R10.AC3: IF guard 内部触发另一个 command THEN 系统 SHALL 明确支持 reentrant、queued 或 blocked 策略，并避免死锁。
- R10.AC4: WHEN 用户重复触发同一个高风险 command THEN 系统 SHALL 防止重复弹框导致重复提交。
- R10.AC5: WHEN 未配置特殊策略且存在 pending guard THEN 系统 SHALL 默认拒绝同一作用域的新互斥 command 且不排队；未来 MAY 允许 command 显式 opt-in queue。

### R11: Legacy History 兼容边界
**用户故事:** 作为已有用户，我希望现有 `historyStore` 继续可用，同时清楚知道新能力应使用 editor history，以便平滑迁移。
**验收标准 (EARS):**
- R11.AC1: WHEN 用户仅使用 legacy `historyStore` THEN 现有 layout-only undo/redo 行为 SHALL 保持兼容。
- R11.AC2: WHEN 文档描述 legacy `historyStore` THEN 文档 SHALL 标注其为 layout-only compatibility layer，不承诺 guard、metadata、selection、sectionRows 或 pointer transaction 新能力。
- R11.AC3: WHEN editor history 与 legacyHistoryStore 同时存在 THEN 系统 SHALL 避免重复记录或互相污染 undo/redo 栈。
- R11.AC4: IF 新增 history 能力 THEN 系统 SHALL 优先在 editor command kernel 中实现，而不是扩展 legacy `historyStore` 公共契约。

### R12: 稳定结果语义与测试覆盖
**用户故事:** 作为维护者，我希望命令结果语义稳定且有测试覆盖，以便后续 toolbar、toast、审计和业务自动化可以安全依赖。
**验收标准 (EARS):**
- R12.AC1: WHEN command 合法并产生状态变化 THEN 系统 SHALL 返回 `changed`。
- R12.AC2: WHEN command 合法但没有状态变化 THEN 系统 SHALL 返回 `noop`。
- R12.AC3: WHEN command 被规则、能力、权限或 guard 阻止 THEN 系统 SHALL 返回 `blocked`。
- R12.AC4: WHEN command 被用户或 guard 主动取消 THEN 系统 SHALL 返回 `cancelled`。
- R12.AC5: WHEN command 因异常失败 THEN 系统 SHALL 返回 `error` 并保留错误诊断。
- R12.AC6: WHEN command 因 guard 超时失败 THEN 系统 SHALL 返回 `timeout` 并保留 guardMs 诊断。
- R12.AC7: WHEN 实现 Command Kernel 变更 THEN 测试 SHALL 覆盖 keyboard、toolbar/API、pointer drag、resize、drop、undo/redo、guard allow/block/cancel/timeout、external update ignore 和 legacy compatibility。
