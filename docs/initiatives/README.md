# Initiative 索引

本目录是后续规划的入口。`docs/initiatives` 记录大需求北极星、spec coverage、发现项、开放问题和决策；`docs/specs` 仍然是具体实现规格与任务状态的执行真相。

## 当前推荐下一步

当用户询问“结合北极星下一步做什么”时，默认先给出一个全局推荐，而不是并列展开所有 initiative。

当前下一步：推进 WIDGET `widget-registry-protocol`。理由是该 spec 已经进入执行态但 tasks 仍为 0/13，且前置的 item capability sidecar 与 DASH shell-managed dashboard editing 均已完成；相比之下，LAYOUT `external-drop-session` 与 `layout-engine-pro` 仍分别有 ownership / first-slice 开放问题。

最近完成的规划收口：LAYOUT 的 `item-capabilities-aspect-ratio` 已完成 tasks 41/41，并已解除 `widget-registry-protocol` 与 `layout-engine-pro` 的 capability/aspect-ratio 前置依赖。EDITOR 的 `ux-l3-reconcile` 已把 `professional-dashboard-editor-ux` 剩余 tasks 20-22 判定为被 `professional-dashboard-editor-l3-intelligence` 覆盖/取代，无需新 spec。

顺序约束：
- `widget-registry-protocol` 的 layout defaults / capability bridge 可以基于已完成的 item capability sidecar 推进。
- 切 `layout-engine-pro` focused spec 前，先回答 `pro-first-slice`：nested/inter-grid 优先，还是 group resize/custom compactor 优先。
- `external-drop-session-refactor` 与 `editor-placement-session` 仍有 ownership 边界问题；推进时需要先对齐 LAYOUT/EDITOR 交界。
- 当前只选一个全局下一步时，优先推进 WIDGET 的 `widget-registry-protocol`；如果用户想先回到 layout 方向，则先澄清 `external-drop-owner` 或 `pro-first-slice`。

## Active Initiatives

| Initiative | 名称 | 状态 | North Star | 当前判断 | 下一步 |
|---|---|---|---|---|---|
| GOV | 规格生命周期治理 | active | docs/initiatives/GOV-spec-lifecycle | roadmap review 已迁移为 initiative 台账；历史 formal specs 已有 legacy brief 和 requirements anchor | 补齐 supersession notes，并在后续新 spec 启用 focused brief gate |
| CORE | 核心运行时与发布边界 | active | docs/initiatives/CORE-runtime-foundation | core/package/bundle 基础已完成；只剩 future split 判断项 | 需要时按 bundle 证据评估 layout-engine split |
| LAYOUT | 布局引擎与约束能力 | active | docs/initiatives/LAYOUT-engine-pro | engine/repair/item capabilities 已完成；external drop session 和 Layout Engine Pro 仍未完成 | 先对齐 `external-drop-owner`，或回答 `pro-first-slice` 后切 Layout Engine Pro brief |
| DASH | Dashboard 平台与文档生命周期 | active | docs/initiatives/DASH-dashboard-platform | document/profile/shell/command-history-first 主线已完成；pure runtime split 仍需 bundle 或消费者证据 | 需要时按 `check:bundle` 或真实消费者需求评估 pure runtime split |
| EDITOR | 专业编辑器体验与生产力 | active | docs/initiatives/EDITOR-professional-editor | command/group/UX/L3 已完成；placement 还有非阻塞 follow-up；bulk productivity 仍待切片 | 后续需要时选择 productivity 第一片 |
| WIDGET | Widget 产品扩展与 AI 助手 | active | docs/initiatives/WIDGET-product-extension | widget registry 已成 spec 但未实现；item capability 前置依赖已完成；Editor Kit UI 和 AI/MCP 仍是后续范围 | 可推进 `widget-registry-protocol` |

## Archived Initiatives

| Initiative | 名称 | 状态 | North Star | 归档说明 |
|---|---|---|---|---|
| none | 暂无 | done | none | 当前没有独立归档 initiative |
