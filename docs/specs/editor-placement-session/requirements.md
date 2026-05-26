# Editor Placement Session 需求规格

## 简介

当前专业编辑器已经具备 copy/paste、add、dashboard shell `Paste here`、external drop preview、layout-engine `dropFit`、smart guides、command kernel、history、guard 和 adapter transaction 等能力。现有实现的核心缺口不是“缺少某一个 Ctrl+V 行为”，而是所有“把新内容放入 grid”的入口还没有统一的交互事务边界：普通粘贴会立即提交，右键 `Paste here` 走 shell placement，外部 drop 有单独 preview/commit 逻辑，未来 palette、模板、AI 生成 widget 和精确放置模式容易各写一套 ghost、坐标、取消和 rollback 逻辑。

本规格定义 `editor-placement-session`：一个 headless-first 的放置事务能力，用 `beginPlacement -> updatePlacement -> commitPlacement/cancelPlacement` 表达“准备放置、预览、确认、取消”的完整过程。该能力应复用现有 placement 策略、layout-engine preview、smart guides、command kernel、history、clipboard fallback、dashboard adapter transaction 和 overlay 渲染能力，为 `Paste here`、`Place from clipboard`、widget palette、external drop、template add 和未来 AI insert 提供统一基础。

本规格明确不要求把默认 `Ctrl+V` 改成强制两阶段点击。默认 `Ctrl+V` 应保持即时粘贴，以保留专业画布产品的肌肉记忆；高级放置通过显式入口启用，例如 context menu `Paste here`、toolbar/palette `Place from clipboard`、可配置快捷键或业务 API。第一版不包含完整企业 widget 配置器、协作多人光标、移动端长按手势、跨断点同步预览或 AI 推荐算法，但设计必须为这些后续能力保留稳定边界。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/EDITOR-professional-editor/README.md
SPEC_BRIEF: docs/initiatives/EDITOR-professional-editor/briefs/EDITOR-editor-placement-session.md

COVERAGE: editor-placement-session

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| editor-placement-session | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 放置事务公共边界
**用户故事:** 作为组件库维护者，我希望新增内容的放置过程有统一的 headless 事务边界，以便 paste、add、drop、palette 和未来 AI insert 不再各自实现 preview、commit、cancel 和 rollback。
**验收标准 (EARS):**
- R1.AC1: WHEN 调用方发起高级放置时，系统 SHALL 提供 `beginPlacement` 或等价 API，创建包含 source、items、editorMetaById、strategy、placementIntent、anchor、size、origin 和 diagnostics 的 placement session。
- R1.AC2: WHEN placement session 已创建且鼠标、键盘或 API 更新目标位置时，系统 SHALL 通过 `updatePlacement` 或等价 API 更新预览状态，而不是立即提交 durable layout、history 或 persistence。
- R1.AC3: WHEN 用户确认落点时，系统 SHALL 通过 `commitPlacement` 或等价 API 将 session 转换为现有 editor command，并 SHALL 只在 commit 成功后写入 layout、history、selection、focus、dirty state 和 persistence。
- R1.AC4: WHEN 用户按 Esc、切换只读模式、外部 layout 替换、controller stop 或业务 guard cancel 时，系统 SHALL 通过 `cancelPlacement` 或等价路径清理 ghost、guides、pending clipboard payload、auto-scroll 和 transient state，且不得创建 history entry。
- R1.AC5: WHEN 同一时间已有 active drag、resize、drop 或 placement session 时，系统 SHALL 通过状态机或互斥 scope 阻止新的冲突 placement session，并返回 structured blocked result。
- R1.AC6: WHEN public controller 暴露 placement 能力时，系统 SHALL 保持 headless-first；核心库 SHALL 不内建具体 toolbar、toast、modal 或业务 widget UI。
- R1.AC7: WHEN placement session 状态变化时，系统 SHALL 通过可观察 state 或事件暴露 phase、source、candidate geometry、blocked reason、affected ids 和 diagnostics，供 UI 渲染 ghost、HUD、禁用态和提示。
- R1.AC8: WHEN placement session API 命名进入 public types 时，系统 SHALL 同步源类型、`typings/index.d.ts`、ESM/CJS 导出和 README 文档，不得产生类型或导出缺口。
- R1.AC9: WHEN 第一版公开 placement session 能力时，系统 SHALL 以 `GridEditorController` 为主要 public/headless API surface，暴露 `placementSession` 状态和 `beginPlacement`、`updatePlacement`、`commitPlacement`、`cancelPlacement` 或等价方法；`VueGridLayout` runtime 和 dashboard shell SHALL 只负责 DOM/grid 坐标、overlay 渲染、菜单入口和业务 adapter 适配。

### R2: 默认粘贴与显式高级放置入口
**用户故事:** 作为编辑用户，我希望普通 `Ctrl/Cmd+V` 保持快速粘贴，同时在需要精确落点时可以显式进入放置模式，以便速度和控制感可以同时存在。
**验收标准 (EARS):**
- R2.AC1: WHEN 用户按默认 `Ctrl/Cmd+V` 且 editor keyboard 未配置 interactive paste override 时，系统 SHALL 保持当前即时 `paste` command 行为，不得强制进入等待点击的放置模式。
- R2.AC2: WHEN 用户通过 context menu `Paste here`、toolbar `Place from clipboard`、palette、API 或可选快捷键触发高级粘贴时，系统 SHALL 进入 placement session，并 SHALL 在用户确认前只显示 ghost/preview。
- R2.AC3: WHEN 调用方配置 `keyboard.pasteMode` 或等价选项为 interactive 时，系统 MAY 将 `Ctrl/Cmd+V` 绑定到 placement session，但该行为 SHALL 是显式 opt-in，默认 SHALL 为 immediate。
- R2.AC4: WHEN text input、textarea、select、contenteditable 或 configured ignored target 拥有焦点时，系统 SHALL 继续忽略 editor paste shortcut，不得拦截原生文本粘贴。
- R2.AC5: WHEN 高级粘贴读取系统剪贴板失败、权限被拒、内容非法或为空时，系统 SHALL fallback 到 internal clipboard；若仍失败，系统 SHALL 返回 `clipboard-unavailable`、`clipboard-permission` 或 `clipboard-invalid`，并 SHALL NOT 创建半激活 ghost。
- R2.AC6: WHEN `Paste here` 有明确 pointer/grid position 时，系统 SHALL 使用 `strategy: "cursor"`、`placementIntent: "here"` 和 top-left anchor 语义作为默认精确落点策略。
- R2.AC7: WHEN targetless paste、toolbar paste 或 keyboard paste 没有显式位置时，系统 SHALL 继续使用默认 paste strategy 或调用方配置策略，不得假造鼠标落点导致不可预测行为。
- R2.AC8: WHEN 高级放置入口被 disabled 时，系统 SHALL 暴露 disabled reason，例如 readonly、empty clipboard、command pending、unsupported layout engine、adapter unavailable 或 missing grid position。

### R3: Ghost 预览与 Overlay 渲染
**用户故事:** 作为专业 dashboard 编辑用户，我希望进入放置模式后能看到将要落下的 ghost、吸附线和风险提示，以便在提交前判断位置是否正确。
**验收标准 (EARS):**
- R3.AC1: WHEN placement session 有合法 candidate layout 时，系统 SHALL 使用 overlay-only preview 渲染新 items 的 ghost，而不是把 ghost item 混入用户提供的 slot children、真实 layout items 或业务 widget 组件树。
- R3.AC2: WHEN clipboard 或 add payload 包含多个 items 时，系统 SHALL 以 group ghost 表达相对布局，并 SHALL 保持各 item 的相对 x/y/w/h 关系。
- R3.AC3: WHEN candidate 发生 bounds、collision、maxRows、section row policy 或 adapter 阶段风险时，系统 SHALL 在 ghost、HUD 或 diagnostics 中表达 blocked/recoverable 状态，且 SHALL NOT 静默提交非法布局。
- R3.AC4: WHEN guides 开启时，placement preview SHALL 复用现有 smart guides、snap、spacing chip 和 measurement HUD 能力，并 SHALL 将 interaction 标识为 placement/drop 等价场景。
- R3.AC5: WHEN guides 关闭时，placement session SHALL 仍能显示最小 ghost 和 blocked state，且 SHALL 不依赖 guide DOM 才能完成 commit/cancel。
- R3.AC6: WHEN 用户移动鼠标、滚动画布、触发 auto-scroll 或通过键盘微调候选位置时，系统 SHALL 稳定更新 overlay ghost 和预测轮廓，避免真实 layout 抖动、重复创建业务 DOM 或触发业务 widget 生命周期。
- R3.AC7: WHEN placement session 被取消、commit blocked 或 commit 成功后，系统 SHALL 清除所有 ghost、guide、HUD、transient layout 和 pending session DOM。
- R3.AC8: WHEN overlay 渲染 ghost 时，系统 SHALL 提供稳定 class/data attribute 或等价测试钩子，用于浏览器测试验证 ghost 数量、位置、blocked 状态和 z-index 层级。
- R3.AC9: WHEN placement strategy 会影响现有 items 的未来位置或占用关系时，系统 SHOULD 通过轻量 overlay outline、shift indicator、affected highlight 或预测位置轮廓表达将被影响的 items；系统 SHALL NOT 在 preview tick 中真实重排或重新渲染现有业务 widgets。

### R4: 位置计算、预览和提交复用
**用户故事:** 作为库维护者，我希望高级放置复用现有 placement、layout-engine 和 command pipeline，以便新增交互体验不会引入第二套布局算法。
**验收标准 (EARS):**
- R4.AC1: WHEN placement session 计算候选位置时，系统 SHALL 复用 `placeGridEditorNewItems`、layout-engine `dropFit`、现有 `cursor`/`nearest-fit`/`first-fit`/`insert-top-shift`/`offset` 策略或等价核心算法。
- R4.AC2: WHEN candidate 位置来自 pointer event 时，系统 SHALL 使用当前 grid geometry、transformScale、containerPadding、margin、rowHeight、cols 和 maxRows 转换为 grid 坐标。
- R4.AC3: WHEN layout-engine 支持 preview 时，系统 SHALL 使用 request id 或 interaction id 忽略 stale preview result，避免过期 ghost 写回界面。
- R4.AC4: WHEN legacy layout-engine 路径被使用时，系统 SHALL 保持可用降级；若某高级 placement 能力不支持 legacy path，系统 SHALL 返回 `unsupported` diagnostics，而不是提交不一致布局。
- R4.AC5: WHEN commit placement 成功时，系统 SHALL 复用现有 `add` 或 `paste` command semantics，包括 id mapping、metadata patches、selection/focus 更新、history 记录、beforeCommand guard 和 command events。
- R4.AC6: WHEN commit placement 被 guard block/cancel/timeout/error 阻止时，系统 SHALL rollback 到 session 开始前的 committed layout，并 SHALL 清理 ghost 与 transient state。
- R4.AC7: WHEN session preview 与最终 commit 使用同一输入时，系统 SHALL 保证 preview 显示的 candidate geometry 与 commit payload 的 placement intent、strategy、anchor 和 item group 一致。
- R4.AC8: WHEN 同一 layout、items、strategy、cursor、cols、maxRows 和 constraints 重复计算时，系统 SHALL 产生确定性 candidate 和 diagnostics。

### R5: External Drop、Palette 和 Shell 入口统一
**用户故事:** 作为集成开发者，我希望 external drop、widget palette、template add 和 shell 菜单都走同一套放置体验，以便用户感受到统一的专业编辑器行为。
**验收标准 (EARS):**
- R5.AC1: WHEN external drag enter/dragover 进入 grid 时，第一版 SHOULD 通过共享 placement core 或等价 adapter 复用 preview、snap、ghost、blocked feedback、auto-scroll、diagnostics 和 rollback 规则；系统 MAY 暂时保留 `useGridDropInteractions` 的现有主流程以降低回归风险。
- R5.AC2: WHEN external drop commit 成功时，系统 SHALL 继续触发既有 drop event 和 editor command 结果，但 SHALL 不绕过 placement transaction 的 rollback 和 diagnostics 规则。
- R5.AC3: WHEN dashboard shell context menu 构造 `Paste here`、`Add widget here` 或 `Paste reference here` 时，系统 SHALL 能把菜单 position 转换为 placement session target，并保留 metadata 中的 strategy 与 placementIntent。
- R5.AC4: WHEN widget palette 或 template add 进入 placement session 时，系统 SHALL 支持先显示待添加 widget 的 ghost，再由用户点击落点确认。
- R5.AC5: WHEN business adapter 需要 prepare/commit/rollback 时，placement session SHALL 与现有 adapter transaction 顺序兼容，不得因为 preview 阶段创建孤立业务 payload。
- R5.AC6: WHEN targetless palette/add 使用 `first-fit` 或 `insert-top-shift` 等非 pointer 策略时，系统 SHALL 允许不进入 pointer ghost 模式并直接通过 command pipeline 提交。
- R5.AC7: WHEN shell、editor core 和 grid interaction 同时支持 placement 能力时，系统 SHALL 避免重复维护三套策略命名、diagnostics shape 或 blocked reason。
- R5.AC8: WHEN 示例或产品 UI 展示高级放置时，系统 SHALL 通过公共 API 消费能力，不得依赖 demo-only helper 直接改 layout。
- R5.AC9: WHEN placement session 主线在 paste/add/palette/shell 场景稳定并通过回归验证后，系统 SHALL 将现有 `useGridDropInteractions` 的 preview/commit/cancel/cleanup 主流程完整迁移到 placement session 或共享 placement interaction 内核，并 SHALL 在 tasks 或后续迁移计划中保留可追踪任务，避免长期分叉。

### R6: 键盘、鼠标与可访问操作
**用户故事:** 作为高级编辑用户，我希望进入放置模式后可以用鼠标和键盘完成确认、取消和微调，以便交互既直观又可访问。
**验收标准 (EARS):**
- R6.AC1: WHEN placement session active 且用户移动鼠标经过 grid 时，系统 SHALL 更新 candidate grid position 和 ghost preview。
- R6.AC2: WHEN placement session active 且用户点击 grid 中合法或可修复落点时，系统 SHALL 尝试 commit placement；若落点 blocked，系统 SHALL 保持 session active 并显示原因，除非调用方配置为失败后自动取消。
- R6.AC3: WHEN placement session active 且用户按 Esc 时，系统 SHALL cancel placement 并恢复到 session 开始前状态。
- R6.AC4: WHEN placement session active 且用户按 Enter 时，系统 SHALL 尝试提交当前 candidate；若当前没有 candidate，系统 SHALL 返回 recoverable blocked result。
- R6.AC5: WHEN placement session active 且用户按方向键时，系统 SHOULD 支持按 grid step 微调 candidate；WHEN 用户按 Shift+方向键时，系统 SHOULD 使用 fast step。该能力 SHALL 作为可追踪增强项保留，但 SHALL NOT 阻塞第一版 MVP，除非后续设计阶段显式升级为 must-have。
- R6.AC6: WHEN placement session active 时，系统 SHALL 不让普通 selection clear、delete、drag start 或 resize start 与 placement commit/cancel 竞争；这些输入 SHALL 被忽略、取消 session 或返回明确 blocked reason。
- R6.AC7: WHEN screen reader 或业务 UI 需要状态反馈时，系统 SHALL 通过 aria message hook、event 或状态字段提供进入放置、候选位置、blocked reason、提交成功和取消信息。
- R6.AC8: WHEN placement session active 且 grid 失焦、窗口 blur 或目标元素不可用时，系统 SHALL 按可配置策略取消或暂停 session，并 SHALL 不提交过期 candidate。
- R6.AC9: WHEN 第一版 MVP 验收 placement session 输入交互时，系统 SHALL 至少覆盖鼠标移动更新 ghost、点击提交、Esc 取消和 Enter 提交；方向键微调 MAY 在主线稳定后补齐，并 SHALL 在 tasks 或后续计划中保留可追踪项。

### R7: 原子性、History 与持久化边界
**用户故事:** 作为企业产品集成者，我希望高级放置像普通 command 一样有可靠的原子性、撤销粒度和持久化语义，以便不会出现 ghost 成功但数据失败的脏状态。
**验收标准 (EARS):**
- R7.AC1: WHEN placement session 处于 preview 阶段时，系统 SHALL NOT 创建 undo/redo entry、写 durable persistence、触发 final layout change、真实改写 layout model、重排现有业务 widgets 或调用 adapter commit。
- R7.AC2: WHEN placement commit 成功时，系统 SHALL 创建一个 command transaction 和一个可撤销 history entry，且一次 session 无论经历多少 preview tick 都只对应一次提交。
- R7.AC3: WHEN placement commit 失败、blocked、cancelled、timeout 或 stale 时，系统 SHALL 保持 layout、metadata、sectionRows、selection、focus、dashboard document 和 adapter payload 不变。
- R7.AC4: WHEN placement commit 触发 beforeCommand guard 时，guard context SHALL 包含 preview patches、affected ids、source、placement summary、clipboard/source ids 和 risk 信息。
- R7.AC5: WHEN guard 等待期间外部 layout、selection、mode、clipboard 或 session target 改变时，系统 SHALL 取消或重新校验 command，不得提交 stale placement。
- R7.AC6: WHEN commit 成功后 selection/focus 更新时，系统 SHALL 选中新插入或粘贴的 items，并 SHALL 保持 controlled `selectedIds` 模式下的 requested selection event 语义。
- R7.AC7: WHEN persistence 或 dashboard write-back 失败时，系统 SHALL 返回 error/blocked result，rollback prepared adapter work，并 SHALL 不报告 placement 成功。
- R7.AC8: WHEN legacy `historyStore` 存在时，系统 SHALL 继续遵守现有 layout-only compatibility 边界；placement session 的完整 metadata/selection/adapter 语义 SHALL 归属 editor command history。

### R8: 兼容性、配置与渐进发布
**用户故事:** 作为现有库用户，我希望高级放置能力可以逐步开启，不破坏已有 paste、drop、dashboard shell 和示例行为。
**验收标准 (EARS):**
- R8.AC1: WHEN 调用方不使用 placement session API 且不改变配置时，系统 SHALL 保持现有 `paste`、`duplicate`、`add`、external drop、dashboard shell `Paste here` 和 keyboard 行为兼容。
- R8.AC2: WHEN 新增配置默认值被应用时，系统 SHALL 默认 `Ctrl/Cmd+V` 为 immediate paste，默认高级放置入口为显式菜单/工具栏/API。
- R8.AC3: WHEN 调用方配置禁用高级 placement 时，系统 SHALL 隐藏或禁用相关入口，但 SHALL 不影响普通 paste/add/drop。
- R8.AC4: WHEN public result 或 diagnostics shape 扩展 placement session 字段时，系统 SHALL 保持 JSON-safe、稳定顺序、向后兼容，并 SHALL 不删除既有字段。
- R8.AC5: WHEN README、examples 或 tests 引入 placement session 时，系统 SHALL 解释它与 `pasteStrategy`、`placementIntent`、external drop 和 shell placement policies 的关系。
- R8.AC6: WHEN responsive dashboard profile 或 list/mobile runtime 使用 placement session 时，系统 SHALL 沿用当前 profile/list write-back 语义，不得全量 materialize inherited layout 或污染其他 profile。
- R8.AC7: WHEN 第一期实现交付时，系统 SHALL 允许只支持 desktop/grid pointer placement；mobile 长按、跨断点同步预览、AI 推荐位置 SHALL 作为后续扩展，不阻塞本期验收。
- R8.AC8: WHEN 新增样式或 DOM class 时，系统 SHALL 保持现有主题可覆盖，不把示例视觉设计变成公共 API 的唯一表现。

### R9: 测试、文档与质量门槛
**用户故事:** 作为维护者，我希望 placement session 有核心、组件、浏览器和文档级覆盖，以便后续重构不会破坏高级放置体验或默认粘贴兼容性。
**验收标准 (EARS):**
- R9.AC1: WHEN 编写 editor core 测试时，系统 SHALL 覆盖 begin/update/commit/cancel、clipboard fallback、id mapping、multi-item group、guard allow/block/cancel、history single entry 和 stale session。
- R9.AC2: WHEN 编写 placement engine 测试时，系统 SHALL 覆盖 cursor top-left anchor、nearest/first-fit fallback、bounds、collision、maxRows、section row blocked 和 deterministic diagnostics。
- R9.AC3: WHEN 编写 grid interaction 测试时，系统 SHALL 覆盖 mouse move preview、click commit、Esc cancel、Enter commit、external drop reuse 和 active interaction mutual exclusion；IF 方向键微调在第一版实现，测试 SHALL 覆盖 arrow key nudge 与 Shift fast step，否则 SHALL 在后续任务中保留追踪。
- R9.AC4: WHEN 编写 overlay/browser 测试时，系统 SHALL 验证 ghost 不进入 slot children、preview 不真实重排现有业务 widgets、affected outlines/shift indicators 可见、ghost z-index、guide/HUD 显示、blocked state、cleanup 后 DOM 清空和普通 `Ctrl/Cmd+V` 即时粘贴不被破坏。
- R9.AC5: WHEN 编写 dashboard shell 测试时，系统 SHALL 覆盖 `Paste here`、`Add widget here`、palette placement、adapter prepare/commit/rollback、profile write-back 和 placement diagnostics。
- R9.AC6: WHEN 更新 README 或 docs 时，系统 SHALL 说明默认 paste、显式高级放置、配置项、失败语义、clipboard 权限、accessibility、known limits 和渐进采用建议。
- R9.AC7: WHEN 发布前验证时，系统 SHALL 运行相关 editor、grid interaction、dashboard shell、layout-engine、types、browser smoke 和 build/test 命令，或明确记录无法运行的验证缺口。
- R9.AC8: WHEN 完成实现评审时，系统 SHALL 检查 `controller.ts`、`useGridDropInteractions.ts` 和 overlay 复杂度是否因 placement session 下降或保持可控，不得把新交互全部堆入现有超大文件。

### R10: ThingsBoard 借鉴的响应式剪贴板与快捷键增强
**用户故事:** 作为 dashboard 编辑集成者，我希望复制/粘贴和高级放置能携带源布局上下文并兼容成熟 dashboard 产品的快捷键习惯，以便跨断点、跨列数和 reference 工作流更稳定。
**验收标准 (EARS):**
- R10.AC1: WHEN 用户复制 widget 或 item group 时，系统 SHALL 在 clipboard payload 中保存 source columns、source breakpoint/layout/viewFormat 或等价 source grid context，并 SHALL 保留各 item 的原始 geometry。
- R10.AC2: WHEN 用户从旧版 v1 clipboard payload 粘贴时，系统 SHALL 继续按现有行为读取和粘贴，不得破坏已有 internal/system clipboard 兼容性。
- R10.AC3: WHEN clipboard payload 的 source columns 与目标 columns 不一致且调用方未禁用缩放时，系统 SHALL 按目标 columns 对 item group 的 x、w 和相对横向 offset 做确定性缩放，并 SHALL clamp 到目标 grid bounds。
- R10.AC4: WHEN placement session 从 clipboard 开始时，系统 SHALL 在 begin 阶段完成与即时 paste 一致的 responsive geometry normalization，确保 ghost preview 与最终 commit 使用同一组 normalized items。
- R10.AC5: WHEN `collisionPolicy: "layout"` 放置多个 items 时，系统 SHALL 把 clipboard/add items 作为 group 计算候选布局，保持组内相对位置，并 SHALL 覆盖推挤/阻挡/重叠三类语义。
- R10.AC6: WHEN shell keyboard 绑定启用时，系统 SHALL 支持 ThingsBoard-inspired aliases：`Ctrl/Cmd+R` copy reference、`Ctrl/Cmd+I` paste reference、`Ctrl/Cmd+X` cut，同时保留现有 `Ctrl/Cmd+C/V`、Delete/Backspace remove 与 `Ctrl/Cmd+Enter` 快捷键。
- R10.AC9: WHEN 用户通过 `Ctrl/Cmd+X` cut 后紧接 `Ctrl/Cmd+V`，系统 SHALL 进入 interactive placement session，而不是即时粘贴回刚释放的原始位置。
- R10.AC7: WHEN 文档和类型更新时，系统 SHALL 说明 clipboard v1/v2 兼容、source grid context、responsive paste 缩放和快捷键 alias 行为。
- R10.AC8: WHEN 发布前验证时，系统 SHALL 增加 editor core、dashboard shell browser/type 和 README 覆盖，证明响应式剪贴板、group layout push 和快捷键 alias 没有破坏默认 paste/placement 行为。

## Clarifications

### Session 2026-05-20

- Q: 是否实现方案 3，即按 `Ctrl+V` 后进入放置模式、显示 ghost、移动鼠标再点击落点？ -> A: 不直接把默认 `Ctrl+V` 改成强制放置模式；将其产品化为显式高级放置能力。
- Q: 长久收益最大的方向是什么？ -> A: 抽象 `Placement Session` 放置事务层，覆盖 paste、add、drop、palette、template 和未来 AI insert，而不是只写 Ctrl+V 特例。
- Q: 默认 `Ctrl+V` 怎么处理？ -> A: 保持即时粘贴；高级放置通过 `Paste here`、`Place from clipboard`、可选快捷键或配置 opt-in 进入。
- Q: ghost 应该怎么渲染？ -> A: ghost 由 overlay 层渲染，不混入用户 slot children 或业务 widget 组件树。
- Q: external drop 是否纳入同一套能力？ -> A: 是；长期收益来自 paste/add/drop/shell/palette 统一 preview、commit、rollback 和 diagnostics。
- Q: 第一版范围如何控制？ -> A: 支持单/多 item ghost、鼠标移动、点击提交、Esc 取消、Enter 提交、基础键盘微调、guides/碰撞提示；移动端长按、跨断点同步预览和 AI 推荐位置后置。
- Q: placement preview 阶段，已有 items 是否要真实视觉重排？ -> A: 采用 A+：overlay-only predictive reflow。preview 不真实移动现有业务 widgets、不改真实 layout；新 items 用 overlay ghost 表达，会影响现有 layout 的策略用轻量 overlay outline、shift indicator 或预测位置轮廓表达 affected items。
- Q: external drop 在第一版里要收敛到什么程度？ -> A: 采用 B：第一版建立共享 placement core 和 overlay/diagnostics/rollback 规则，external drop 先通过 adapter 复用关键能力；同时记录主线稳定后必须完整迁移现有 `useGridDropInteractions`，避免后续遗忘。
- Q: 第一版的公开 API 放在哪一层？ -> A: 采用 A：以 `GridEditorController` 为主公开 `placementSession`、`beginPlacement`、`updatePlacement`、`commitPlacement`、`cancelPlacement` 等 headless 能力，grid runtime 和 dashboard shell 只做 DOM 坐标、overlay、菜单和业务 adapter 适配。
- Q: 第一版是否要承诺键盘微调？ -> A: 采用 B：第一版必须支持鼠标移动、点击提交、Esc 取消和 Enter 提交；方向键/Shift+方向键微调作为 SHOULD 和可追踪增强项，不阻塞 MVP，主线稳定后补齐。
