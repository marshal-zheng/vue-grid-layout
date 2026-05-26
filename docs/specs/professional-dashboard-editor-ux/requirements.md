# 专业仪表盘编辑器 UX 需求规格

## 简介

当前项目已经具备核心网格布局、响应式布局、拖拽、resize、外部 drop、会话内 undo/redo、版本化持久化、异步布局引擎、preview/committed layout 分离和性能诊断能力。下一步目标不是继续拆分出多个零散 spec，而是在这些底座之上形成一份完整的专业桌面仪表盘编辑器 UX 规格：让 `VueGridLayout` 从“可拖拽网格组件”升级为可支撑成熟 dashboard/editor 产品的 headless-first 编辑能力。

本规格参考同类成熟项目和产品的能力边界：React Grid Layout 的布局 API 与响应式语义、GridStack 的 dashboard save/load 与批量编辑能力、dnd-kit 的可访问拖拽思想、interact.js 的 snap/restrict/modifier 交互模型，以及 Grafana、Metabase 等仪表盘产品中的查看/编辑模式、保存流、卡片操作和可检查的布局状态。

本规格是一份完整 spec，内部按任务组交付，但不再拆成多个后续 UX spec。它必须复用现有持久化核心和布局引擎，不重写 persistence，不重写 layout engine，不改变现有默认组件行为。移动端专门交互、实时协作、完整 BI 应用壳、复杂权限系统、图表配置器和后端服务实现不属于本规格范围。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/EDITOR-professional-editor/README.md
SPEC_BRIEF: docs/initiatives/EDITOR-professional-editor/briefs/EDITOR-professional-dashboard-editor-ux.md

COVERAGE: professional-editor-ux

RECONCILIATION_NOTE: 2026-05-25 - tasks 20-22 are closed as covered/superseded by `professional-dashboard-editor-l3-intelligence`; this historical UX spec is now done and should not be used as a future implementation queue.

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| professional-editor-ux | R1-R17 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: Headless-first 编辑器控制器
**用户故事:** 作为组件集成者，我希望编辑器能力以 headless controller / composable 为核心暴露，以便我可以使用库提供的编辑语义，同时保留自己产品的 toolbar、菜单、toast 和视觉壳。
**验收标准 (EARS):**
- R1.AC1: WHEN 使用专业编辑器能力时，系统 SHALL 提供独立的 `useGridEditor()` 或等价 editor controller，而不是把 toolbar、右键菜单、按钮文案或业务 UI 强绑定到核心组件内部。
- R1.AC2: WHEN editor controller 绑定到 `VueGridLayout` 或 `ResponsiveVueGridLayout` 时，系统 SHALL 通过现有 layout、layout engine、persistence 和 history 边界协作，并 SHALL NOT 复制一套新的布局计算或持久化状态机。
- R1.AC3: WHEN 不启用 editor controller 或不传入 editor prop 时，`VueGridLayout` 和 `ResponsiveVueGridLayout` SHALL 保持当前拖拽、resize、drop、事件和样式行为不变。
- R1.AC4: WHEN 业务方需要自定义 UI 时，系统 SHALL 暴露状态、命令、事件、CSS state class 和 CSS variables，使业务方可以构建自己的工具栏、快捷菜单、状态栏和错误提示。
- R1.AC5: WHEN 库提供示例 UI 时，系统 SHALL 将其作为示例或可选辅助层，而不是核心编辑能力的唯一使用方式。

### R2: 显式编辑模式与状态机
**用户故事:** 作为 dashboard 编辑用户，我希望查看、编辑、拖拽、保存、失败和冲突状态清晰可预期，以便不会在查看仪表盘时误操作，也不会在保存失败时误以为修改已经落盘。
**验收标准 (EARS):**
- R2.AC1: WHEN editor 初始化时，系统 SHALL 支持 `view` 与 `edit` 两种顶层模式，并支持受控 `mode` 和非受控 `defaultMode` 两种使用方式；启用 editor 时业务方 SHALL 显式传入 `mode` 或 `defaultMode` 表达意图。
- R2.AC2: WHEN 当前模式为 `view` 时，系统 SHALL 默认禁用编辑命令、选择框、resize handle、drop target 和 keyboard editing；仅保留现有只读布局展示语义。
- R2.AC3: WHEN 当前模式为 `edit` 时，系统 SHALL 进入可编辑状态，并能根据 dirty、interaction、save 和 conflict 信息派生出 `editingClean`、`editingDirty`、`dragging`、`resizing`、`keyboardEditing`、`savePending`、`saveFailed`、`conflict` 等明确状态。
- R2.AC4: WHEN 状态发生转换时，系统 SHALL 通过结构化事件暴露前后状态、触发原因和相关 command id。
- R2.AC5: IF 用户尝试在 `view` 模式执行编辑命令，系统 SHALL 返回 blocked result，原因 SHALL 为 `mode-readonly` 或等价结构化原因，并 SHALL NOT 修改 committed layout。
- R2.AC6: WHEN 外部受控 `mode` 与内部交互状态冲突时，系统 SHALL 以外部受控值为准；如无法安全保留当前 preview，系统 SHALL 取消交互、回滚到最近 committed layout 并暴露取消原因。
- R2.AC7: IF editor 已启用但未传入 `mode` 或 `defaultMode`，系统 SHALL fail-safe 到 `view` 模式，并 SHALL 在开发/诊断事件中暴露 `editor-mode-missing` 或等价配置提示。

### R3: 统一命令模型
**用户故事:** 作为库维护者和产品集成者，我希望所有编辑行为都抽象为可观察、可阻止、可回放的 command，以便 toolbar、快捷键、右键菜单、undo/redo、审计和未来协作可以复用同一套语义。
**验收标准 (EARS):**
- R3.AC1: WHEN 用户执行编辑行为时，系统 SHALL 使用统一命令模型表达 `select`、`clearSelection`、`move`、`resize`、`add`、`delete`、`duplicate`、`copy`、`paste`、`lock`、`unlock`、`show`、`hide`、`save`、`discard`、`reset` 等命令。
- R3.AC2: WHEN command 执行完成时，系统 SHALL 返回包含 command id、type、status、target ids、patches、affected ids、blocked reason、diagnostics 和 undo metadata 的结构化结果。
- R3.AC3: IF command 被模式、能力、锁定、碰撞、越界、maxRows、缺失 item、保存失败或外部冲突阻止，系统 SHALL 返回 blocked 或 error result，并 SHALL NOT 静默修改 committed layout。
- R3.AC4: WHEN 同一命令由 toolbar、快捷键、右键菜单或 API 调用触发时，系统 SHALL 产生等价的 command result 和事件顺序。
- R3.AC5: WHEN command 只改变 selection、focus 或 transient UI state 时，系统 SHALL 不触发 durable persistence save，也 SHALL 不写入 layout history snapshot。
- R3.AC6: WHEN command 改变 committed layout 或 item editing metadata 时，系统 SHALL 只在提交边界通知 `layoutChange`、`update:modelValue` / `update:layouts`、history 和 persistence。
- R3.AC7: WHEN 执行 `copy` 或 `paste` 命令时，系统 SHALL 默认使用 editor 内部剪贴板，并 SHALL 支持可选 Clipboard API adapter；IF 系统剪贴板不可用、权限被拒绝或 SSR 环境中调用，系统 SHALL 安全降级到内部剪贴板或返回结构化错误。
- R3.AC8: WHEN command 需要业务权限或策略校验时，系统 SHALL 先执行内置同步 capability 校验，并 SHALL 支持可选异步 `beforeCommand` guard；异步 guard SHALL 能返回 allow、block、cancel、timeout 或 error 结果，且不得让 committed layout 在校验未完成时发生部分 mutation。

### R4: Undo/Redo 粒度与历史协作
**用户故事:** 作为编辑用户，我希望撤销和重做符合专业编辑器直觉，以便一次拖拽、一次粘贴或一次删除能作为一个完整操作回退，而不是被拆成大量细碎步骤。
**验收标准 (EARS):**
- R4.AC1: WHEN 一次 pointer drag 或 resize 从 start 到 stop 完成时，系统 SHALL 将其合并为一条 history 操作，而不是为每个 preview tick 创建历史快照。
- R4.AC2: WHEN 用户连续使用键盘移动或 resize 同一 selection 时，系统 SHALL 支持按时间窗口或 explicit commit 将连续变化合并为一条可撤销操作。
- R4.AC3: WHEN 执行 `delete`、`duplicate`、`paste`、`lock`、`unlock`、`show`、`hide` 等离散命令时，系统 SHALL 为每个 committed command 创建清晰的一条 undo/redo 单元。
- R4.AC4: WHEN 使用现有 `historyStore` 时，editor SHALL 继续把它视为会话内 undo/redo，而 persistence SHALL 继续只负责 durable save/load。
- R4.AC5: WHEN undo 或 redo 恢复 layout 后，系统 SHALL 同步 selection、focus、dirty state 和外部受控事件，避免视觉选择停留在不存在的 item 上。
- R4.AC6: IF 某次 undo/redo 因外部受控 layout、缺失 item 或冲突状态无法安全应用，系统 SHALL 返回 blocked result，并暴露可诊断原因。

### R5: 选择模型与多选语义
**用户故事:** 作为 dashboard 编辑用户，我希望可以清楚选择一个或多个组件，并对选择目标执行移动、删除、复制、锁定等操作，以便处理真实仪表盘中的批量编辑场景。
**验收标准 (EARS):**
- R5.AC1: WHEN editor 处于 edit 模式时，系统 SHALL 提供 selection model，至少包含 `selectedIds`、`activeId`、`anchorId`、`selectionMode` 和 selection source。
- R5.AC2: WHEN 用户点击 item、点击空白区域、使用 Cmd/Ctrl 点击、Shift 范围选择或调用 API 时，系统 SHALL 按配置更新 selection，并通过 `onSelectionChange` 或等价事件暴露变化。
- R5.AC3: WHEN selection 被外部受控时，系统 SHALL 以外部 `selectedIds` 为准，并 SHALL 在内部命令尝试改变 selection 时只发出请求事件，不直接覆盖受控值。
- R5.AC4: WHEN selected item 被删除、隐藏、锁定或从外部 layout 移除时，系统 SHALL 清理无效 selection，并把 focus 移动到可预测目标或 grid 容器。
- R5.AC5: WHEN 多个 item 被选中时，系统 SHALL 支持对可编辑目标执行批量 `delete`、`copy`、`duplicate`、`lock`、`unlock`、`show`、`hide` 和 group move；若 group resize 因约束复杂度暂不支持，系统 SHALL 明确返回 `multi-resize-unsupported` 或等价 blocked reason。
- R5.AC6: WHEN 多选目标中混有 locked、static、不可拖拽或不可删除 item 时，系统 SHALL 按命令配置执行 all-or-nothing 或 skip-blocked 策略，并在 result 中列出被跳过或阻止的 item id。

### R6: Item 能力与编辑元数据
**用户故事:** 作为产品开发者，我希望每个 grid item 能通过独立 sidecar metadata 表达锁定、可见、可编辑、可拖拽、可 resize、可复制和可删除等能力，以便实现真实业务中的权限、模板和固定组件场景，同时保持 `LayoutItem` 的布局几何语义纯净。
**验收标准 (EARS):**
- R6.AC1: WHEN editor 读取布局项时，系统 SHALL 兼容现有 `static`、`isDraggable`、`isResizable`、`isBounded`、`resizeHandles` 等字段，并 SHALL 使用 sidecar `editorMetaById` 或等价结构表达 `locked`、`visible`、`editable`、`deletable`、`duplicatable`、`copyable` 等编辑器元数据，而不是默认写入 `LayoutItem`。
- R6.AC2: IF item 为 locked 或不可编辑，系统 SHALL 禁止 move、resize、delete、paste-over、lock-sensitive metadata mutation 等会改变该 item 的命令，并返回结构化 blocked reason。
- R6.AC3: WHEN sidecar metadata 将 item 标记为 hidden 或 `visible: false` 时，系统 SHALL 明确区分“布局仍保留但不渲染”和“从 layout 删除”两种语义，并 SHALL 在序列化、selection 清理和 history 中保持可预测行为。
- R6.AC4: WHEN 执行 duplicate 或 paste 时，系统 SHALL 使用可配置 id 生成器生成稳定唯一 id，并 SHALL 避免与当前 layout、responsive layouts 或 clipboard payload 中的 id 冲突。
- R6.AC5: WHEN duplicate 或 paste 需要放置新 item 时，系统 SHALL 复用 layout engine 的 fit/drop 能力，按配置选择 offset、cursor、nearest-fit 或 first-fit 策略，并返回失败原因而不是静默覆盖现有 item。
- R6.AC6: WHEN item 能力来自业务方权限函数或异步策略时，系统 SHALL 通过可选 `beforeCommand` guard 执行前置校验，并 SHALL 在校验 pending、cancel、timeout 或失败时保持 committed layout 不变。
- R6.AC7: WHEN editor metadata 需要持久化时，系统 SHALL 将 sidecar `editorMetaById` 作为同一 persistence document 的 editor envelope 或 `meta.editor` 内容与 layout 原子保存/恢复，而不是默认使用单独 persistence key。

### R7: 键盘编辑与可访问性
**用户故事:** 作为桌面专业工具用户，我希望可以通过键盘完成选择、移动、resize、删除、复制、粘贴、保存和取消，以便编辑体验高效且可访问。
**验收标准 (EARS):**
- R7.AC1: WHEN grid 或 item 获得焦点时，系统 SHALL 提供可配置键盘快捷键，覆盖方向键移动、修饰键加速移动、键盘 resize、Delete/Backspace 删除、Cmd/Ctrl+C 复制、Cmd/Ctrl+V 粘贴、Cmd/Ctrl+D 复制、Cmd/Ctrl+S 保存、Esc 取消或清理 selection。
- R7.AC2: WHEN 焦点位于 input、textarea、select、contenteditable 或业务方配置的 ignored target 中时，系统 SHALL 不拦截文本编辑相关快捷键。
- R7.AC3: WHEN 用户通过键盘进入 keyboard editing 状态时，系统 SHALL 提供清楚的 focus ring、active item、selection 反馈和可取消路径。
- R7.AC4: WHEN 键盘命令改变 layout 时，系统 SHALL 复用统一 command model、layout engine、history 和 persistence 提交边界。
- R7.AC5: WHEN 命令被阻止或保存失败时，系统 SHALL 提供可由业务方接入 toast、aria-live 或状态栏的结构化消息，而不是只改变视觉样式。
- R7.AC6: WHEN screen reader 或无鼠标用户操作 grid 时，系统 SHOULD 暴露 item label、位置、尺寸、锁定状态、选择状态和可用命令说明。

### R8: Snap lines 与 alignment guides
**用户故事:** 作为 dashboard 编辑用户，我希望拖拽、resize 和放置时看到对齐参考线、边缘/中心吸附和间距提示，以便布局看起来专业且容易精确排版。
**验收标准 (EARS):**
- R8.AC1: WHEN 用户拖拽、resize 或 drop item 时，系统 SHALL 能根据当前 layout 计算 candidate guides，至少支持左/右/上/下边缘对齐、水平/垂直中心对齐和相邻间距提示。
- R8.AC2: WHEN snap 配置启用时，系统 SHALL 在阈值范围内将 preview 位置或尺寸吸附到 guide，并 SHALL 在 command result 中标记使用的 guide id 和 snap source。
- R8.AC3: WHEN snap 配置关闭或命令来自精确 API 调用时，系统 SHALL 仍可显示 guides 或完全跳过 guides，具体行为 SHALL 由配置控制。
- R8.AC4: WHEN 多个 guide 同时命中时，系统 SHALL 使用确定性优先级选择 snap 目标，避免相同输入产生抖动或随机结果。
- R8.AC5: WHEN layout 包含 locked、hidden、static 或不可见 item 时，系统 SHALL 按配置决定这些 item 是否参与 guide 计算，并 SHALL 保持默认行为可预测。
- R8.AC6: WHEN 在 500+ items 的 dashboard 中拖拽或 resize 时，guide 计算 SHALL 与 layout engine scheduler 协作，避免阻塞 pointer feedback；若降级或跳过 guide，系统 SHALL 暴露 diagnostics。

### R9: Preview、placeholder 与 blocked feedback
**用户故事:** 作为编辑用户，我希望拖拽、resize、drop 和键盘操作的预览清楚、稳定、可恢复，以便我知道当前操作会发生什么以及为什么某个操作被拒绝。
**验收标准 (EARS):**
- R9.AC1: WHEN drag、resize、keyboard move、keyboard resize 或 external drop 进行中时，系统 SHALL 将 preview、placeholder、guides、blocked state 与 committed layout 分离。
- R9.AC2: WHEN preview 更新时，系统 SHALL 避免触发 durable persistence save，并 SHALL 避免创建 history snapshot。
- R9.AC3: IF preview 因 collision、bounds、maxRows、locked item、readonly mode、capability、invalid input 或 scheduler stale 被阻止，系统 SHALL 暴露 blocked reason、相关 item ids、可恢复建议和 diagnostics。
- R9.AC4: WHEN 操作从 blocked 状态恢复为可提交状态时，系统 SHALL 更新视觉状态和事件，而不要求用户重新开始同一次交互。
- R9.AC5: WHEN external drop 悬停在 grid 上时，系统 SHALL 显示专业 insertion placeholder，并根据 drop strategy、collision、fit search 和 guide 命中情况更新放置反馈。
- R9.AC6: WHEN 交互取消、组件卸载或外部受控 layout 改变导致 preview 失效时，系统 SHALL 丢弃 preview 并恢复最近 committed layout。

### R10: 保存、dirty、冲突与失败恢复 UX
**用户故事:** 作为编辑用户，我希望保存、放弃、重置、自动保存失败和多标签页冲突都有清楚状态和可恢复路径，以便刷新或关闭页面时不会丢失布局修改。
**验收标准 (EARS):**
- R10.AC1: WHEN editor 绑定 persistence controller 时，系统 SHALL 将 dirty、lastSavedAt、save pending、save success、save failed、discard、reset、conflict 等状态映射到 editor state，并 SHALL 不复制 persistence 的 durable I/O 逻辑。
- R10.AC2: WHEN committed layout 或 sidecar `editorMetaById` 相对最后保存快照发生变化时，系统 SHALL 将 editor dirty 状态置为 true，并暴露 dirty reason 或 changed command ids。
- R10.AC3: WHEN 用户执行 save、discard 或 reset command 时，系统 SHALL 复用 persistence controller 的 save/discard/reset 能力，并通过 command result 与 editor event 暴露结果。
- R10.AC4: IF save 或 autosave 失败，系统 SHALL 保留当前内存布局、selection、dirty 状态和可重试 command，不得回滚到未知状态。
- R10.AC5: IF dirty 状态下收到外部更新冲突，系统 SHALL 进入 conflict 状态，并暴露 local value、external value、冲突原因和 resolve actions。
- R10.AC6: WHEN dirty 状态下用户尝试离开 edit 模式、刷新页面或切换受控 dashboard key 时，系统 SHOULD 提供可配置 guard hook，让业务方决定保存、放弃、继续编辑或阻止离开。
- R10.AC7: IF layout 保存成功但 editor metadata 保存、迁移或校验失败会导致非原子状态，系统 SHALL 将整个 editor save 视为失败，并保留当前内存 layout、metadata 和 dirty 状态供用户重试。

### R11: 受控/非受控 API 与事件契约
**用户故事:** 作为 Vue 集成开发者，我希望 editor 的模式、选择、命令、保存、错误和视觉反馈都有稳定事件契约，以便在大型产品中接入状态管理、埋点、toast、权限和审计。
**验收标准 (EARS):**
- R11.AC1: WHEN 业务方传入受控 `mode`、`selectedIds`、`activeId`、`editorState` 或等价 prop 时，系统 SHALL 不直接覆盖受控值，而是通过 `onModeChange`、`onSelectionChange`、`onEditorStateChange` 或等价事件请求更新。
- R11.AC2: WHEN editor 内部状态变化时，系统 SHALL 暴露结构化事件，至少覆盖 mode change、selection change、command start、command commit、command blocked、command error、guide change、save state change、conflict、focus change 和 editor error。
- R11.AC3: WHEN 同一用户操作触发多个事件时，系统 SHALL 文档化事件顺序，尤其是 command、layoutChange、update:modelValue / update:layouts、history、persistence 和 dirty state 的先后关系。
- R11.AC4: WHEN 业务方通过 `beforeCommand` guard 取消、阻止或超时 command 时，系统 SHALL 尊重拦截结果，并 SHALL 返回 blocked、cancelled、timeout 或 error result，不继续执行后续 layout mutation。
- R11.AC5: WHEN editor 与 `ResponsiveVueGridLayout` 协作时，系统 SHALL 支持 breakpoint 维度的 selection、command target 和 persistence 提交语义，并 SHALL 避免把 responsive-only editor config 错误透传给内层单布局组件。
- R11.AC6: WHEN 在 SSR 或非浏览器环境渲染时，系统 SHALL 不访问 window、document、clipboard、selection API、rAF 或 DOM measurement，除非已经处于客户端安全路径。

### R12: 视觉状态、主题与 CSS 契约
**用户故事:** 作为产品设计和前端集成者，我希望编辑器提供稳定、可主题化、可覆盖的视觉状态契约，以便实现专业 dashboard 编辑界面而不用依赖脆弱的深层 DOM 选择器。
**验收标准 (EARS):**
- R12.AC1: WHEN editor 渲染 grid item、placeholder、guides 或 drop target 时，系统 SHALL 添加稳定 CSS class 或 data attribute 表达 selected、active、hovered、locked、hidden、blocked、dragging、resizing、keyboard-editing、dirty、drop-target、guide-active 等状态。
- R12.AC2: WHEN 业务方需要主题化编辑视觉时，系统 SHALL 提供 CSS variables 覆盖 selection outline、focus ring、guide line、blocked state、placeholder、resize handle 和 dirty indicator 的颜色、尺寸与层级。
- R12.AC3: WHEN item 被选中或获得焦点时，系统 SHALL 提供不遮挡内容的专业视觉反馈，并 SHALL 避免 selection outline、resize handle、guide 和内容文本相互重叠到不可用。
- R12.AC4: WHEN resize handles 在桌面环境显示时，系统 SHALL 提供足够的命中区域和可识别状态，并 SHALL 支持按 item 能力隐藏或禁用特定 handle。
- R12.AC5: WHEN locked、hidden、blocked 或 readonly 状态出现时，系统 SHALL 通过 CSS state 和结构化事件同时表达，避免只靠颜色传达关键状态。
- R12.AC6: WHEN 业务方完全自定义 item 内容时，系统 SHALL 仍能提供外层 editing state wrapper 或等价机制，保持 selection、focus、drag、resize 和 guide 视觉可组合。

### R13: 完整专业编辑器示例与文档
**用户故事:** 作为库使用者，我希望看到一个完整 dashboard editor 示例，而不是分散的 demo 片段，以便快速理解持久化、布局引擎、历史、选择、快捷键和保存流如何组合。
**验收标准 (EARS):**
- R13.AC1: WHEN 示例更新完成时，系统 SHALL 提供一个 `Professional Dashboard Editor` 示例，包含 view/edit toggle、toolbar、dirty/save/discard/reset、undo/redo、selection、多选、keyboard editing、duplicate、delete、lock/unlock、show/hide、copy/paste、snap guides、blocked feedback 和 persistence。
- R13.AC2: WHEN 示例展示保存失败、外部冲突或命令被阻止时，系统 SHALL 显示可恢复状态，并 SHALL 不丢失内存中的 layout 修改。
- R13.AC3: WHEN 示例运行在大型 layout 场景时，系统 SHALL 展示 layout engine diagnostics 或至少提供调试开关，说明 guides、scheduler、preview 和 commit 的边界。
- R13.AC4: WHEN README 或文档更新时，系统 SHALL 说明 editor controller、组件 props、事件契约、CSS 状态类、快捷键、persistence/history 边界和迁移建议。
- R13.AC5: WHEN 文档描述本能力时，系统 SHALL 明确它是 headless-first 编辑器能力，不是完整 BI 应用壳，也不要求用户采用库示例的 UI。

### R14: 测试、性能与发布质量门槛
**用户故事:** 作为库维护者，我希望专业编辑 UX 有可重复的浏览器级验证和性能门槛，以便复杂交互不会在后续迭代中悄悄退化。
**验收标准 (EARS):**
- R14.AC1: WHEN 编写单元测试时，系统 SHALL 覆盖 editor controller 的状态机、command model、selection、多选、capability、history 粒度、dirty state 和 blocked result。
- R14.AC2: WHEN 编写浏览器集成测试时，系统 SHALL 覆盖 view/edit 切换、鼠标选择、多选、拖拽、resize、键盘移动、键盘 resize、copy/paste、duplicate、delete、lock、save failure、discard、undo/redo、snap guides 和 external drop placeholder。
- R14.AC3: WHEN 运行可访问性相关测试时，系统 SHALL 覆盖 focus 管理、ignored keyboard targets、aria-live 消息接入点、键盘取消路径和删除后焦点恢复。
- R14.AC4: WHEN 在 500+ item layout 中执行 drag、resize、keyboard move 和 guide 计算时，系统 SHALL 满足已有 layout engine 性能预算，或在无法满足时按配置降级 guides 并暴露 diagnostics。
- R14.AC5: WHEN 发布该能力时，系统 SHALL 通过 lint、typecheck、build、核心单元测试、浏览器集成测试和 editor 示例 smoke test。
- R14.AC6: WHEN 新增公开类型或 props 时，系统 SHALL 更新 `typings/index.d.ts`、CommonJS/UMD 导出和 README API 文档，并 SHALL 保持未启用 editor 时的兼容行为。

### R15: Smart Guides 产品级展示契约
**用户故事:** 作为 dashboard 编辑用户，我希望辅助线只揭示当前最有价值的落位机会，而不是暴露所有计算候选，以便我能快速理解“会落在哪里、对齐了什么、为什么放不了”，且画布不会呈现调试态。
**验收标准 (EARS):**
- R15.AC1: WHEN editor 处于 `view` 模式或 `edit` 模式空闲状态时，系统 SHALL 默认不显示 smart guides；可选背景 grid lines 默认只在 drag、resize 或 external drop 交互期间以极淡层级显示，并 SHALL 可关闭，且 SHALL NOT 与 smart guides 使用同等视觉层级。
- R15.AC2: WHEN 用户拖拽、resize 或 external drop 时，系统 SHALL 将视觉反馈区分为 background grid lines、placement placeholder、alignment guides、spacing guides 和 blocked feedback 五类，并提供稳定 class/data attribute 或事件语义。
- R15.AC3: WHEN 多个 candidate guides 同时命中时，系统 SHALL 只渲染当前最相关的有限集合；默认 drag/drop 最多显示 3 条 smart guides，resize 最多显示 2 条 smart guides，spacing distance label 最多显示 1 个；完整候选集合只能通过 diagnostics/debug mode 暴露。
- R15.AC4: WHEN 渲染 alignment guide 时，系统 SHALL 使用一致语义表达边缘/中心对齐，并 SHALL 通过线段范围、端点关联或源/目标 item 轻量高亮等非文字方式，让用户能判断当前 item 正在与哪个 item 或哪条边/中心对齐；系统 SHALL NOT 默认依赖贯穿全画布的长线或批量文字标签表达 alignment。
- R15.AC5: WHEN 渲染 spacing guide 时，系统 SHALL 使用区别于 alignment guide 的视觉样式；当 spacing guide 是当前命中、吸附或最相关展示集合的一部分时，系统 SHALL 默认显示短距离标签（例如 `2 cols` 或 `1 row`），并 SHALL NOT 批量给非命中候选显示标签，也 SHALL NOT 只用一条无解释的绿色长线表达 spacing。
- R15.AC6: WHEN placement placeholder、active item、snapped guide、candidate guide 和 optional grid 同时存在时，系统 SHALL 保持明确视觉层级：placeholder 优先于 active item，active item 优先于 snapped guide，snapped guide 优先于 candidate guide，candidate guide 优先于 optional grid。
- R15.AC7: IF guide 线会高饱和贯穿画布、遮挡内容、与 placeholder/selection 竞争主视觉、或展示与当前 item 无直接关系的候选线，系统 SHALL 将其视为视觉回归；IF 处于显式 debug mode 并需要查看完整候选集合，系统 SHALL 使用独立 debug layer、debug panel 或明确 debug 标识隔离呈现，并 SHALL NOT 让全候选线伪装成正式用户态视觉。
- R15.AC8: WHEN 500+ item 或 guide 计算超预算时，系统 SHALL 优先保持 pointer feedback 流畅，并通过最近邻候选、数量上限或跳过 smart guides 降级；系统 SHALL NOT 通过满屏线条展示超预算候选。

### R16: 预测式 Smart Guides 与对齐锚点
**用户故事:** 作为 dashboard 编辑用户，我希望拖拽、resize 或 drop 还没贴到目标边缘时，就能看到附近最有价值的对齐机会，并清楚知道当前 item 到底在跟哪个 item 的哪条边对齐，让排版像 Figma / Power BI 那样具有"预测性"和"被指引"的体感，而不是反复试错。
**验收标准 (EARS):**
- R16.AC1: WHEN 用户开始 drag、resize 或 external drop 时，系统 SHALL 在可配置 `predictRadiusX`（默认 2 列）/`predictRadiusY`（默认 1 行）半径内计算并展示候选 alignment guides，guide 不需要等到几乎完全对齐才出现。
- R16.AC2: WHEN guide 处于预测态（未达到 `snapThresholdCells`，默认 0.5 cell）时，系统 SHALL 使用低强度视觉（dashed 线、低不透明度），并通过 `proximity ∈ [0, 1]` 表达接近程度，guide 越接近 snap 越显眼，渲染 SHALL 按 proximity 做透明度梯度。
- R16.AC3: WHEN 候选距离进入 `snapThresholdCells` 时，系统 SHALL 立即将 guide 升级为 snapped 态：dashed → solid、加端点 tick、并播放 ≤120ms 的微吸附反馈动画；离开阈值时 SHALL 立即降级为预测态，无视觉残影。
- R16.AC4: WHEN 渲染对齐线时，系统 SHALL 通过 `anchorEdges` 让源 item 和目标 item 被对齐的那条边各显示 1px 高亮锚点（默认 `--vgl-editor-anchor-edge`），让用户在不读文字的情况下看出"对齐了谁的哪条边"；guide 线段 SHALL 默认裁剪到源 item 与当前 item 之间的最小包络范围，不贯穿全画布。
- R16.AC5: WHEN layout 中存在与当前 item 在同一逻辑行/列（同 y、y+h、x、x+w 边）的 item 时，系统 SHALL 将其作为高优先级 row-mate / column-mate 候选，在 predict radius 内自动出现并给予更高 priority；section/row 吸附 SHALL 可通过 `sectionSnap: false` 关闭。
- R16.AC6: WHEN `prefers-reduced-motion: reduce` 生效时，系统 SHALL 禁用 snap pulse 动画与 chip / HUD 跟随动画，仅保留状态与颜色变化。
- R16.AC7: WHEN 500+ item 或 guide 计算超预算时，predictive guides SHALL 复用现有降级路径优先保留 snap 候选；在降级模式下 predict radius 内候选 SHALL 至多保留默认上限内最相关的几条，宁可只展示 snapped 不展示 predict。
- R16.AC8: WHEN editor 处于 view 模式或 edit idle 时，predictive guides、anchor edges、snap pulse SHALL 不出现；它们仅在 drag / resize / drop / keyboard editing 期间存在。

### R17: Spacing Chips、Measurement HUD 与等距分布反馈
**用户故事:** 作为 dashboard 编辑用户，我希望拖拽或 resize 时能实时看到当前 item 与四邻居的间距数值、当前坐标尺寸，以及"如果松手会破坏/达成等距分布"的提示，让我可以像在 Figma / Sketch 中一样精确排版而无需打开属性面板。
**验收标准 (EARS):**
- R17.AC1: WHEN 用户拖拽、resize 或键盘移动 active item 时，系统 SHALL 在 active item 的上、右、下、左四个方向各计算与最近邻居（含画布边界）的间距，并以 `spacingChips` 的形式暴露到 guide state；UI SHALL 在每个方向有间距 ≥ 1 cell 时渲染一个带 bracket-cap 端点的 chip，chip 显示数值与单位（`col` / `row`）。
- R17.AC2: WHEN 同一对维度（左右或上下）的相邻间距数值相等，或当 active item 与 ≥2 个邻居形成等距阵列时，系统 SHALL 将相关 chip 标记为 `isEqual: true`，并采用区别于普通间距的视觉色（默认 `--vgl-editor-spacing-equal`），让用户感受到"等距达成"。
- R17.AC3: WHEN 用户进行 drag、resize、drop 或 keyboard 编辑时，系统 SHALL 暴露 `measurementHud` payload，包含 itemId、label、position(cells)、size(cells)、interaction、可选 delta(Δw/Δh/Δx/Δy) 与 blocked reason；UI SHALL 渲染一个跟随 active item 的浮层（默认右上方 8px 偏移），并在 resize 时显示 Δ 值。
- R17.AC4: WHEN `prefers-reduced-motion: reduce` 生效或 HUD 处于 keyboard 编辑场景时，HUD SHALL 改为锚定在 active item 的固定角，不做跟随动画。
- R17.AC5: WHEN 业务方传入 `showSpacingChips: false` 或 `showMeasurementHud: false` 时，系统 SHALL 完整跳过对应计算与渲染；二者计算 SHALL 是 SSR-safe、纯函数。
- R17.AC6: WHEN active item 处于 blocked 状态（碰撞、越界、locked、capability 等）时，HUD SHALL 暴露 blocked reason 文本，且 SHALL 通过 aria-live 接入点（复用 `keyboard.ariaMessage`）让屏幕阅读器获得当前位置 / 尺寸 / 受阻原因。
- R17.AC7: WHEN active item 与其上下或左右邻居被破坏等距分布（如等距 → 不等距）时，系统 SHALL 在 chip 上将"曾经等距"提示降级为普通间距，但 SHALL NOT 弹窗或阻断交互，避免编辑过程中的视觉惊扰。
- R17.AC8: WHEN spacing chip 与 alignment / spacing guide、placeholder、selection outline 同时出现时，视觉层级 SHALL 满足：placeholder > snapped guide > anchor edge > predict guide > spacing chip > grid lines；chip 与 HUD SHALL NOT 遮挡 placeholder 也 SHALL NOT 与 selection outline 视觉冲突。

## Clarifications

### Session 2026-05-09

- Q: 这个 UX 能力是否继续拆成多个 spec？ -> A: 不拆；生成一份完整的 `professional-dashboard-editor-ux` spec，内部可以按任务组交付。
- Q: 是否继续使用“第一版”说法收缩范围？ -> A: 不使用；requirements 覆盖完整专业桌面编辑器 UX，但后续 tasks 可以按依赖顺序实现。
- Q: 是否需要 headless-first？ -> A: 需要；核心是 controller/composable、命令、状态、事件和 CSS 契约，示例 UI 不能成为唯一使用方式。
- Q: multi-select 是否纳入？ -> A: 纳入；selection model 必须支持多选语义，批量命令应覆盖常见编辑操作，复杂 group resize 可以用明确 blocked reason 表达。
- Q: 移动端是否纳入？ -> A: 不纳入；当前范围聚焦桌面 dashboard/editor UX。
- Q: editor metadata 应该由谁持久化？ -> A: 选择 B，使用 sidecar `editorMetaById`；`LayoutItem` 保持布局几何与约束语义，editor/persistence 集成负责保存锁定、可见性、可删除等编辑器元数据。
- Q: copy/paste 应该使用哪种剪贴板模型？ -> A: 选择 B，默认使用 editor 内部剪贴板，并支持可选系统 Clipboard API adapter；系统剪贴板不可用、权限失败或 SSR 时必须安全降级或返回结构化错误。
- Q: 启用 editor 后默认进入什么模式？ -> A: 选择长久收益最大的 C 方案：业务方必须显式传入受控 `mode` 或非受控 `defaultMode`；若漏配，系统 fail-safe 到 `view` 并通过开发/诊断事件提示配置缺失。
- Q: `editorMetaById` 应该怎么和 layout 一起持久化？ -> A: 选择 A，layout 与 sidecar `editorMetaById` 使用同一个 persistence document 原子保存/恢复，metadata 放在 editor envelope 或 `meta.editor`，不默认拆成独立 key。
- Q: 能力校验中的异步权限/策略，应该阻塞命令还是只作为业务方预检查？ -> A: 选择 B，同步 capability 走内置 command pipeline，异步权限用可选 `beforeCommand` guard，支持 pending、cancel、timeout、error，校验完成前不得部分修改 committed layout。

### Session 2026-05-10

- Q: spacing guide 是否必须默认显示“间距数值标签”？ -> A: 选择 B，spacing guide 在有效命中、吸附或最相关展示集合中默认显示短距离标签；非命中候选不批量显示标签。
- Q: edit 模式空闲时，背景 grid lines 默认应该怎么显示？ -> A: 选择 B，edit 模式空闲不显示，drag、resize 或 external drop 交互期间才显示极淡 grid lines。
- Q: alignment guide 的可解释性要做到什么程度？ -> A: 选择 B，通过线段范围、端点关联或源/目标 item 轻高亮表达当前 item 与源 item 的关系，不默认使用贯穿全画布长线或批量文字标签。
- Q: smart guides 的默认数量上限是否固定为 3？ -> A: 选择 B，默认按交互类型限制：drag/drop 最多 3 条，resize 最多 2 条，spacing distance label 最多 1 个。
- Q: debug mode 下是否允许“满屏候选线”？ -> A: 选择 B，debug mode 可以查看完整候选，但必须通过独立 debug layer、debug panel 或明确 debug 标识隔离，不能伪装成正式用户态视觉。
- Q: smart guides 是否需要从“被动反馈”升级为“预测式 + 锚点 + chip + HUD”的企业级 UX？ -> A: 是；在 R15 基础上新增 R16 预测式 guides + 对齐锚点，新增 R17 spacing chips + measurement HUD + 等距分布反馈，对标 Figma / Sketch / Power BI / Webflow，目标是让用户感知到"对齐了谁、距离多少、当前坐标尺寸、是否破坏等距"。
