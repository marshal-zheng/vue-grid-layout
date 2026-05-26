# EDITOR 专业编辑器体验与生产力

INITIATIVE_ID: EDITOR
STATUS: active

## North Star Contract

### Goal
专业编辑器体验与生产力的目标是让 Vue Grid Layout 从可拖拽网格升级为 headless-first、可组合、可诊断、适合成熟 dashboard/editor 产品的编辑能力。

### Success Criteria
- command kernel、selection、group move、placement session、history、guard、keyboard 和 accessibility 行为稳定。
- smart guides、predictive guides、spacing chips、measurement HUD、toolbar state、section/row model 等 L3 智能能力可通过 headless API 和示例观察。
- 剩余 UX 任务与 L3 coverage 不重复，不把过时大 UX spec 当成未来实现队列。
- 后续生产力能力能以 focused spec 扩展，例如 lasso、batch sizing、mixed-value inspector 和 productivity panel。

### Boundaries
- In scope: headless editor controller、command/history/guard、selection/group move、placement session、guides/HUD、bulk productivity、editing diagnostics。
- Out of scope: dashboard document durable schema、widget registry schema、official UI kit 的完整组件库、AI/MCP assistant。

### Principles
- Headless API 优先，UI 示例只能消费公开 API。
- 交互 preview、guard pending 和 blocked 状态不得污染 committed layout/history/persistence。
- 大 UX spec 被后续更窄 spec 覆盖时，必须显式 reconcile，避免重复实现。

## Spec Coverage Map

| ID | 能力/范围 | 状态 | 关联 spec | 依赖 | 说明 |
|---|---|---|---|---|---|
| professional-editor-ux | 基础专业桌面编辑器 UX、metadata、selection、keyboard、guides、persistence bridge | done | docs/specs/professional-dashboard-editor-ux | CORE/interaction-state-machine, DASH/versioned-persistence | tasks 22/22；20-22 已由 L3 intelligence 覆盖/取代 |
| editor-command-kernel | command normalize、guard、transaction、history policy、event/result | done | docs/specs/editor-command-kernel | professional-editor-ux | tasks 12/12 |
| group-move-core | multi-select group move、collision/static/overlap、engine runner 与测试 | done | docs/specs/editor-multiselect-group-move-core | editor-command-kernel, LAYOUT/async-layout-engine | tasks 16/16 |
| editor-placement-session | interactive paste/add/palette placement、ghost、keyboard、shell bridge | in-spec | docs/specs/editor-placement-session | editor-command-kernel, group-move-core | tasks 20/22；剩 external drop 迁移与 nudge 手感非阻塞 follow-up |
| l3-intelligence | predictive guides、snap、align/distribute/tidy、toolbar state、section/row、HUD/chips | done | docs/specs/professional-dashboard-editor-l3-intelligence | professional-editor-ux, group-move-core | tasks 18/18 |
| ux-l3-reconcile | 将 `professional-dashboard-editor-ux` 剩余 20-22 标为 L3 覆盖/取代，或缩小成真实缺口 | done | none | l3-intelligence | 2026-05-25 已收口：20-22 由 L3 覆盖，无需新 spec |
| editor-bulk-productivity | lasso/box selection、batch sizing、mixed-value inspector、完整 productivity panel | open | none | l3-intelligence, group-move-core | 来自 2026-05-10 raw Spec 2 的剩余 productivity gap |
| nudge-enhancement | 方向键/Shift+方向键微调手感继续细化 | open | none | editor-placement-session | placement session 非阻塞后续项；可并入 productivity spec |

## Discovery Inbox

| ID | 来源 | 想法/发现 | 状态 | 处理去向 | 说明 |
|---|---|---|---|---|---|
| inbox-bulk-productivity | docs/raw/2026-05-10-editor-multiselect-group-productivity-context.md | lasso、batch sizing、mixed-value inspector、productivity panel | triaged | editor-bulk-productivity | 不直接复活整个 raw Spec 2，后续切更窄 spec |
| inbox-external-drop | docs/specs/editor-placement-session/tasks.md | external drop 完整迁移到 placement session 或 shared placement interaction kernel | triaged | LAYOUT/external-drop-session | 已有 formal spec 跟踪 |

## Open Questions

| ID | 问题 | 影响 | 状态 | 说明 |
|---|---|---|---|---|
| ux-task-20-22-status | `professional-dashboard-editor-ux` tasks 20-22 应标为 L3 覆盖，还是保留为 demo/render/CSS 尾项 | 影响该 spec 是否能关闭 | resolved | 2026-05-25 判定为 L3 覆盖/取代，UX spec 可关闭 |
| bulk-productivity-first-slice | productivity gap 第一片优先 lasso、batch sizing 还是 inspector mixed values | 影响下一份 spec brief | open | UX/L3 已收口；后续需要单独选择 productivity 第一片 |

## Decision Log

| ID | 决策 | 日期 | 依据 | 影响 |
|---|---|---|---|---|
| d1 | 不再继续扩一个巨型 editor UX spec | 2026-05-22 | roadmap review 认为 command、group move、placement、L3 拆分正确 | 后续能力通过 focused specs 推进 |
| d2 | L3 intelligence 已覆盖 UX 剩余 guide/HUD 核心范围 | 2026-05-22 | roadmap review 对 tasks 20-22 的重叠判断 | `ux-l3-reconcile` 成为下一步收束项 |
| d3 | `professional-dashboard-editor-ux` tasks 20-22 由 L3 覆盖/取代 | 2026-05-25 | `professional-dashboard-editor-l3-intelligence` tasks 18/18 已完成，并覆盖 predictive guides、spacing chips、HUD、渲染层、CSS、demo 与测试 | `professional-editor-ux` 和 `ux-l3-reconcile` 标记为 done；后续不再从旧 UX spec 派生实现 |
