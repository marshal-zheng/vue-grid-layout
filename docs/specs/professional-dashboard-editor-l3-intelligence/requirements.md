# 专业仪表盘编辑器 L3 智能编排需求规格

## 简介

本规格定义 `professional-dashboard-editor-ux` 之上的 L3 智能编排层，目标是把当前 editor 从“有 guides、selection、命令和示例”升级为可长期维护、可对外发布 API、可多人协作推进的企业级 dashboard 编辑器能力。它不替代既有 `docs/specs/professional-dashboard-editor-ux/`，而是补齐其中尚未冻结的高阶能力：align/distribute 对外命令、完整工具栏契约、多选智能等距/对称分布、section/row 结构模型、真实 magnetic snap、可验证的测量反馈、公开类型和长期测试门槛。

调研基准以 dashboard 场景为主、自由画布为辅：Figma 的 smart selection / tidy up / measurement 行为，Power BI / Tableau 的视觉对象对齐与分布命令，Grafana / Datadog 的 dashboard row/section 与面板布局语义，Webflow / Framer 的拖拽吸附反馈，以及 Notion / Coda 式明确 placement placeholder。长期收益最大的方案不是继续在 `guides.ts` 中堆条件，而是建立一个可复用的 `layout intelligence` 层：同一套几何索引、邻居/间距关系、section/row 归属、snap candidate、distribution candidate 同时服务 guides、placeholder、HUD、toolbar commands、keyboard nudge 和测试诊断。

本规格范围包含桌面 dashboard/editor UX、headless-first API、Vue 组件渲染适配、示例工具栏和测试文档。不包含实时协作、图表配置器、服务端权限系统、移动端专门交互、完整 BI 应用壳或设计系统组件库发布。

## 调研结论

- Figma / Sketch / XD 类编辑器的核心价值不是“线更多”，而是让用户在拖拽中持续获得预测式对齐、距离测量、等距反馈和整理命令。
- Power BI / Tableau 类 dashboard 产品证明 align/distribute 必须是稳定外部命令，而不是只存在于视觉 guides；工具栏、快捷键和 API 应共享同一 command result。
- Grafana / Datadog 类 dashboard 说明结构化 row/section 是 dashboard 编辑器的长期边界；它应参与吸附、批量移动、放置、折叠/锁定和 diagnostics。
- 当前项目已经具备 editor controller、command pipeline、guides state、spacing chips、HUD 渲染节点和 layout engine，但真实 snap 没接入 preview/commit，align/distribute 命令不存在，section/row 只是 priority 加权而非模型，公开 typings 仍有脱节风险。
- 长期方案应以“几何语义内核 + 对外命令 + 渲染层消费”分层推进，而不是让 toolbar、guides、drop、keyboard 各自计算一套规则。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/EDITOR-professional-editor/README.md
SPEC_BRIEF: docs/initiatives/EDITOR-professional-editor/briefs/EDITOR-professional-dashboard-editor-l3-intelligence.md

COVERAGE: l3-intelligence

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| l3-intelligence | R1-R11 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: L3 Layout Intelligence 内核
**用户故事:** 作为库维护者，我希望有一个独立、纯函数、可诊断的布局智能内核，以便 guides、snap、align/distribute、section/row、spacing chips、HUD 和 keyboard nudge 共用同一套几何语义，而不是各自实现一份近似逻辑。
**验收标准 (EARS):**
- R1.AC1: WHEN editor 需要计算对齐、间距、邻居、section/row、snap 或 distribute 候选时，系统 SHALL 通过 `layout intelligence` 纯函数或等价模块生成统一结果，并 SHALL NOT 在 toolbar、guides、drop 和 keyboard 路径中重复实现不一致的几何规则。
- R1.AC2: WHEN 输入 layout、active item、selection、meta、cols、maxRows、margin、rowHeight 和 options 相同，系统 SHALL 输出确定性 intelligence state，包含 geometry index、item rects、neighbors、snap candidates、spacing relations、section/row membership、distribution candidates 和 diagnostics。
- R1.AC3: WHEN layout 含 500+ items 时，系统 SHALL 复用或兼容现有 layout engine 的 row/column occupancy index，避免每个 pointer tick 做无界全量昂贵计算；若超预算，系统 SHALL 先降级预测候选，再降级 spacing chips，最后保留 committed preview 流畅性。
- R1.AC4: WHEN intelligence state 被渲染层消费时，系统 SHALL 保持 SSR-safe，不访问 DOM、window、document、clipboard、rAF 或实际像素测量。
- R1.AC5: WHEN intelligence state 参与 command result，系统 SHALL 在 diagnostics 中暴露 candidate count、snap source、distribution mode、section/row source、durationMs、degraded reason 和被过滤原因。
- R1.AC6: WHEN 未来新增编辑能力时，系统 SHOULD 优先扩展 intelligence state 和 command payload，而不是直接新增渲染层私有字段。

### R2: 真实 Magnetic Snap 行为闭环
**用户故事:** 作为 dashboard 编辑用户，我希望靠近可对齐边缘或中心时不仅看到 guide，还能真实吸附到可提交落点，以便松手结果与视觉反馈一致。
**验收标准 (EARS):**
- R2.AC1: WHEN drag preview 命中 snapped guide 且 `snap !== false` 时，系统 SHALL 将 preview placeholder 的 x/y 修正为 snapped candidate，并 SHALL 在 drag stop commit 中提交同一 snapped 坐标。
- R2.AC2: WHEN resize preview 命中 snapped guide 且尺寸/方向约束允许时，系统 SHALL 将 preview placeholder 的 w/h 或 x/y/w/h 修正为 snapped candidate，并 SHALL 在 resize stop commit 中提交同一 snapped geometry。
- R2.AC3: WHEN external drop 命中 snapped guide 或 section/row drop zone 时，系统 SHALL 用 snapped placement 更新 placeholder，并 SHALL 在 drop commit 中使用同一 placement。
- R2.AC4: IF `snap === false`，系统 SHALL 可以显示 predictive guides，但 SHALL NOT 将 `guide.isSnapped` 渲染为 active/snapped 视觉，也 SHALL NOT 修改 preview 或 commit geometry。
- R2.AC5: WHEN snapped candidate 与 collision、bounds、maxRows、locked 或 capability 约束冲突时，系统 SHALL 跳过该 candidate 并尝试下一个 deterministic candidate；若全部失败，系统 SHALL 返回 blocked 或 degraded diagnostics。
- R2.AC6: WHEN snap 发生或离开阈值时，系统 SHALL 发出 guide-change 或 preview-change 事件，包含 previousGuideId、nextGuideId、snapKind 和 resulting geometry。
- R2.AC7: WHEN snap 被接入后，浏览器测试 SHALL 验证视觉 guide 的位置与最终 layout 坐标一致，不允许出现“看起来吸附但松手不落在那里”的状态。

### R3: 对外 Align / Distribute 命令 API
**用户故事:** 作为产品集成者，我希望通过统一 command API 执行 align 与 distribute，以便工具栏、快捷键、上下文菜单和程序化 API 都能复用相同的行为、权限校验、history 和 diagnostics。
**验收标准 (EARS):**
- R3.AC1: WHEN `GridEditorCommandType` 扩展时，系统 SHALL 增加 `align`、`distribute`、`tidy` 或等价命令类型，并 SHALL 在 TypeScript 源码、`typings/index.d.ts`、CJS/UMD 导出和 README 中同步公开。
- R3.AC2: WHEN 执行 `align` command 时，payload SHALL 至少支持 `left`、`center-x`、`right`、`top`、`center-y`、`bottom`，并 SHALL 支持相对 selection bounds、active item、last selected item、section/row boundary 或 explicit guide line 的 align target。
- R3.AC3: WHEN 执行 `distribute` command 时，payload SHALL 至少支持 `horizontal`、`vertical`、`spacing-x`、`spacing-y`，并 SHALL 支持 equal spacing、edge-to-edge spacing 和 center-to-center spacing 的明确语义。
- R3.AC4: WHEN selection 少于命令要求的 item 数量时，系统 SHALL 返回 blocked result；align 至少需要 2 个有效 item，distribute/tidy 至少需要 3 个有效 item，blocked reason SHALL 可被 toolbar disabled state 复用。
- R3.AC5: WHEN selection 中包含 locked、hidden、static、不可移动或 section/row 约束冲突 item 时，系统 SHALL 按 commandPolicy 执行 all-or-nothing 或 skip-blocked，并在 result 中列出 skippedIds 与 blocked reason。
- R3.AC6: WHEN align/distribute 修改 layout 时，系统 SHALL 走统一 command pipeline、beforeCommand guard、layout engine collision/bounds 校验、history snapshot、dirty state 和 persistence commit 边界。
- R3.AC7: WHEN align/distribute 命令完成时，result SHALL 包含 old/new geometry patches、affectedIds、computed target line/spacing、section/row context 和 diagnostics。

### R4: 完整工具栏与命令能力发现契约
**用户故事:** 作为应用开发者，我希望库提供可构建专业工具栏的 headless 状态和示例 UI，以便团队能稳定接入 align、distribute、tidy、section/row、save、undo/redo 等能力，而不用阅读内部实现。
**验收标准 (EARS):**
- R4.AC1: WHEN editor controller 暴露 toolbar state 时，系统 SHALL 提供 `canExecute()` 或等价能力发现结果，覆盖 select、move、resize、delete、duplicate、copy、paste、lock、save、undo、redo、align、distribute、tidy、section/row 命令。
- R4.AC2: WHEN 示例工具栏渲染时，系统 SHALL 包含 view/edit、save/discard/reset、undo/redo、copy/paste/duplicate/delete、lock/unlock、align left/center/right/top/middle/bottom、distribute horizontal/vertical、tidy spacing、section/row 操作和 debug/intelligence diagnostics 开关。
- R4.AC3: WHEN 某命令当前不可执行时，toolbar state SHALL 给出 disabled reason、requiredSelectionCount、blocked item ids 和建议文案键，而不是只给 boolean。
- R4.AC4: WHEN 用户通过 toolbar、keyboard、context-menu 或 API 触发同一命令时，系统 SHALL 产生等价 command result 和事件顺序。
- R4.AC5: WHEN 示例 UI 存在时，系统 SHALL 保持 headless-first；核心包不 SHALL 强制集成者采用示例 toolbar 的样式、文案或组件层级。
- R4.AC6: WHEN README 文档工具栏接入时，系统 SHALL 明确哪些是稳定 API、哪些只是示例 UI，避免用户依赖内部 DOM。

### R5: 多选智能等距、对称与 Tidy Up
**用户故事:** 作为 dashboard 编辑用户，我希望多选 3 个及以上组件时能自动识别等距/不等距状态，并通过 distribute 或 tidy 一键整理，以便大型仪表盘排版高效且一致。
**验收标准 (EARS):**
- R5.AC1: WHEN selection 中有 3 个及以上有效 item 时，系统 SHALL 计算 horizontal 与 vertical distribution candidates，包含当前 spacing、目标 spacing、是否等距、偏差值和会被移动的 item ids。
- R5.AC2: WHEN 用户拖动多选中的 active item 并导致原本等距关系被破坏或达成，系统 SHALL 在 guides / chips / HUD 中暴露 distribution state，但 SHALL NOT 阻断交互。
- R5.AC3: WHEN 执行 `distribute` command 时，系统 SHALL 支持固定 selection bounds 的 distribute，也 SHALL 支持以 active item 或 section/row bounds 为锚点的 distribute。
- R5.AC4: WHEN 执行 `tidy` command 时，系统 SHALL 先按 axis、row/section membership 和 overlap 分组，再在每组内应用等距与最小间距规则，避免把不同语义区域的 item 混排。
- R5.AC5: IF tidy/distribute 计算结果会产生 collision、越界或 maxRows 违规，系统 SHALL 尝试 deterministic fallback；若仍失败，系统 SHALL 返回 blocked result 并保持 committed layout 不变。
- R5.AC6: WHEN equal spacing 达成时，相关 spacing chips SHALL 标记为 equal，并 SHALL 在 measurement HUD 或 diagnostics 中暴露 distribution mode。
- R5.AC7: WHEN selection 包含不同尺寸 item 时，系统 SHALL 明确采用 edge-to-edge 或 center-to-center 策略，不得隐式混用导致不可解释结果。

### R6: Section / Row 结构化模型
**用户故事:** 作为 dashboard 编辑用户，我希望仪表盘能表达行、分区和区域边界，以便组件吸附、批量移动、放置和整理遵循 dashboard 结构，而不是只看单个 item 坐标。
**验收标准 (EARS):**
- R6.AC1: WHEN editor 启用 section/row 模型时，系统 SHALL 支持 sidecar 或 layout-compatible metadata 表达 sectionId、rowId、order、collapsed、locked、label、bounds policy 和 allowed drop zones。
- R6.AC2: WHEN section/row metadata 存在时，snap、drop、align、distribute、tidy 和 keyboard nudge SHALL 优先尊重同 section/row 内的候选；跨 section/row 行为必须由 options 明确允许。
- R6.AC3: WHEN external drop 悬停在 section/row 边界或空区域时，系统 SHALL 显示高对比 placement placeholder，明确松手会进入哪个 section/row 和哪个 grid slot。
- R6.AC4: WHEN section/row locked 或 collapsed 时，系统 SHALL 阻止会修改其内部 item 的命令，并返回 structured blocked reason。
- R6.AC5: WHEN section/row 被移动、折叠、展开或删除时，系统 SHALL 保持子 item layout、selection、history、persistence 和 diagnostics 一致。
- R6.AC6: WHEN 没有 section/row metadata 时，系统 SHALL 按当前 flat grid 行为运行，不要求用户迁移已有 layout。
- R6.AC7: WHEN section/row 模型需要持久化时，系统 SHALL 使用 editor sidecar envelope 与 layout 原子保存/恢复，并 SHALL 避免把业务敏感权限写入 layout item。

### R7: Placement Placeholder 与视觉层级重构
**用户故事:** 作为编辑用户，我希望拖拽、resize、drop 和批量整理时清楚看到松手后的落点，以便不需要猜测 placeholder、selection、guide 和内容之间的关系。
**验收标准 (EARS):**
- R7.AC1: WHEN drag/resize/drop/tidy preview 存在时，系统 SHALL 渲染高对比 ghost-card placeholder，包含明确位置/尺寸语义，并 SHALL 与 selection blue、guide pink、spacing green、blocked red 区分。
- R7.AC2: WHEN placeholder、active item、anchor edge、snapped guide、predict guide、spacing chip、HUD 和 grid lines 同时存在时，系统 SHALL 使用明确层级：placeholder 与 active item 不互相遮断，snapped/anchor feedback 不被 placeholder 完全盖住，grid lines 永远最低。
- R7.AC3: WHEN guide geometry 渲染时，系统 SHALL 修正 margin/gutter 场景下的 edge/center 像素换算；left/right/top/bottom/center-x/center-y 不得共用会导致半 gutter 偏移的公式。
- R7.AC4: WHEN `prefers-reduced-motion: reduce` 生效时，系统 SHALL 保留状态变化但禁用 snap pulse、HUD 跟随和大幅动画。
- R7.AC5: WHEN 用户关闭 guides、chips 或 HUD 时，placeholder 仍 SHALL 独立表达落点，不依赖辅助线才能理解。
- R7.AC6: WHEN 视觉回归测试运行时，系统 SHALL 对 placeholder 层级、guide 像素位置、HUD 不遮挡、spacing chip 可读性和 view mode 无辅助层做浏览器断言或截图检查。

### R8: Measurement HUD 与 Delta 自动接线
**用户故事:** 作为精确排版用户，我希望 HUD 自动显示 x、y、w、h、Δx、Δy、Δw、Δh 和 blocked reason，以便拖拽和 resize 时无需打开属性面板。
**验收标准 (EARS):**
- R8.AC1: WHEN drag preview 更新时，系统 SHALL 根据 interaction start item 与 current placeholder 自动计算 Δx/Δy，并在 measurementHud 中输出。
- R8.AC2: WHEN resize preview 更新时，系统 SHALL 根据 oldResizeItem 与 current placeholder 自动计算 Δw/Δh 以及 north/west resize 产生的 Δx/Δy。
- R8.AC3: WHEN preview 被 collision、bounds、maxRows、section/row locked 或 capability 阻止时，HUD SHALL 输出 blocked reason、message key 和 affected item ids。
- R8.AC4: WHEN keyboard nudge 或 toolbar align/distribute/tidy 执行 preview 时，HUD SHALL 显示命令类型、selection count、目标 spacing/line 和受影响 item 数。
- R8.AC5: WHEN HUD 渲染时，系统 SHALL 支持 item label、compact numeric display、aria-live 接入点和 `showMeasurementHud: false` 完全关闭。
- R8.AC6: WHEN tests 运行时，系统 SHALL 验证 delta 字段不是只由外部 options 手工传入，而是在真实 drag/resize/keyboard/toolbar 路径自动生成。

### R9: 公开类型、版本化迁移与兼容
**用户故事:** 作为库使用者，我希望新增智能编排能力有稳定类型、导出和迁移路径，以便升级不会破坏未启用 editor 的现有使用。
**验收标准 (EARS):**
- R9.AC1: WHEN 新增 command、state、section/row metadata、intelligence diagnostics、toolbar state 或 guide payload，系统 SHALL 同步更新源码类型、`typings/index.d.ts`、CJS/UMD 导出和 README。
- R9.AC2: WHEN 未启用 `editor` 或 `editor=false` 时，系统 SHALL 保持现有 drag、resize、drop、layoutChange、update:modelValue、CSS 和 persistence 行为不变。
- R9.AC3: WHEN 使用旧的 `thresholdPx`、`showSpacingLabels`、`maxVisibleGuides` 或现有 editor commands 时，系统 SHALL 保持兼容或提供明确 deprecation 文档。
- R9.AC4: WHEN section/row metadata 版本变化时，系统 SHALL 提供 version 字段、迁移函数或安全忽略策略；未知版本不得导致 layout 丢失。
- R9.AC5: WHEN docs 描述新增 API 时，系统 SHALL 给出最小 headless 示例和完整 dashboard editor 示例。
- R9.AC6: WHEN TypeScript 用户调用新增 API 时，常见 payload 错误 SHALL 在类型层面暴露，运行时仍 SHALL 返回 structured invalid-input。

### R10: 测试矩阵与审批门槛
**用户故事:** 作为多人维护团队，我希望 L3 能力有清晰测试矩阵和审批门槛，以便后续实现不会退化成视觉上可见但行为不闭环。
**验收标准 (EARS):**
- R10.AC1: WHEN requirements/design/tasks 审批通过后，系统 SHALL 按任务拆分实现，不得在未更新规格的情况下新增破坏外部 API 的能力。
- R10.AC2: WHEN 实现 magnetic snap 时，单元测试 SHALL 覆盖 snapItemToGuides 或新 snap resolver 被 drag、resize、drop preview/commit 调用。
- R10.AC3: WHEN 实现 align/distribute/tidy 时，单元测试 SHALL 覆盖 2-item align、3+ item distribute、mixed locked skip-blocked、collision fallback、section-scoped distribute 和 command result diagnostics。
- R10.AC4: WHEN 实现 section/row 模型时，测试 SHALL 覆盖无 metadata flat grid 兼容、section-scoped drop、locked section blocked、collapsed section selection 清理和 persistence restore。
- R10.AC5: WHEN 实现 visual feedback 时，浏览器测试 SHALL 覆盖 guide 像素位置、placeholder 层级、HUD delta、spacing equal、view mode 清空、reduced-motion 和 debug/user layer 隔离。
- R10.AC6: WHEN 发布前验证时，系统 SHALL 通过 lint、typecheck、build、editor core tests、browser integration tests、professional dashboard example smoke 和 500+ item performance budget。
- R10.AC7: WHEN 任何验收项无法在当前版本完成时，系统 SHALL 在 README 和 tasks 中标注为明确限制，不能通过模糊文案伪装成已完成。

### R11: 长期维护与扩展治理
**用户故事:** 作为项目长期维护者，我希望智能编排能力有清晰模块边界、命名、诊断和升级策略，以便多人迭代时不互相踩踏。
**验收标准 (EARS):**
- R11.AC1: WHEN 设计 L3 模块时，系统 SHALL 明确 `layout-engine`、`editor/controller`、`editor/intelligence`、`editor/guides`、`VueGridLayout` 渲染适配和示例 UI 的边界。
- R11.AC2: WHEN 新增内部 helper 时，系统 SHALL 优先放在纯函数模块或 typed adapter 中，避免在 `VueGridLayout.tsx` 内继续膨胀复杂业务逻辑。
- R11.AC3: WHEN diagnostics 输出时，系统 SHALL 使用稳定 code 和结构化字段，方便示例 UI、测试和用户埋点复用。
- R11.AC4: WHEN API 命名时，系统 SHALL 区分 command payload、guide payload、toolbar state、section metadata 和 diagnostics，避免同名字段在不同层含义不同。
- R11.AC5: WHEN 后续需要协作编辑或属性面板时，系统 SHOULD 能复用 command result、history metadata、section/row model 和 intelligence diagnostics，而不是重写布局语义。
- R11.AC6: WHEN reviewer 检查实现时，系统 SHALL 能从 requirements ID 追溯到 design 决策、tasks、tests 和文档。

## 长久受益最大的方案

本规格推荐的长期方案是四层架构：

1. `editor/intelligence`: 纯函数几何语义层，统一输出邻居、间距、snap、section/row、distribution、diagnostics。
2. `editor/commands`: 对外命令层，把 align/distribute/tidy/section 操作接入现有 command pipeline、history、guard、persistence。
3. `VueGridLayout` adapter: 渲染消费层，只负责把 intelligence state 变成 placeholder、guides、chips、HUD、anchor edges，不拥有业务算法。
4. 示例与文档: 提供完整 toolbar 和 dashboard editor smoke，但保持核心 headless-first。

这个方案的收益是：修复当前 guides “看得见但不闭环”的问题，同时为未来属性面板、协作、审计、模板化 dashboard、AI 自动排版和批量重排保留同一套 API 与诊断基础。

## 调研来源

- [Figma Help: Arrange layers with Smart selection](https://help.figma.com/hc/en-us/articles/360040450233-Arrange-layers-with-Smart-selection)
- [Figma Help: Adjust alignment, dimensions, rotation and position](https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-dimensions-rotation-and-position)
- [Microsoft Learn: Use gridlines and snap-to-grid in Power BI reports](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-gridlines-snap-to-grid)
- [Tableau Help: Refine Your Dashboard](https://help.tableau.com/current/pro/desktop/en-us/dashboards_refine.htm)
- [Grafana Docs: Dashboard groupings](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/create-dashboard/dashboard-groupings/)
- [Grafana Docs: Layout schema](https://grafana.com/docs/grafana-cloud/as-code/observability-as-code/schema-v2/layout-schema/)
- [Datadog Docs: Dashboards](https://docs.datadoghq.com/dashboards/)
