# LAYOUT 布局引擎与约束能力

INITIATIVE_ID: LAYOUT
STATUS: active

## North Star Contract

### Goal
布局引擎与约束能力的目标是提供可扩展、确定性、可诊断的布局计算内核，让大 dashboard、复杂 resize、settings migration、collision repair、external drop 和未来的 pro layout 能力都能复用同一套纯函数语义。

### Success Criteria
- 大布局操作有 main-thread / worker-capable 执行路径，并能报告计算、调度和端到端诊断。
- resize、drop、repair、migration、constraint 和 capability 决策顺序确定，blocked/degraded 原因结构化。
- item capability、aspect ratio、resize handle policy 与 dashboard/editor sidecar 的优先级清晰。
- Layout Engine Pro 能在基础能力稳定后继续扩展 nested grids、inter-grid drag、group resize、custom compactors、auto grid 和 lint/repair preview。

### Boundaries
- In scope: pure layout engine、constraint/capability helper、repair/migration、drop session adapter、layout diagnostics、未来 pro engine 行为。
- Out of scope: official editor UI kit、dashboard 业务 widget schema、AI assistant 产品体验。

### Principles
- 计算核心保持 Vue/editor/dashboard 无关，sidecar 必须可 structured clone。
- preview blocked 不污染 committed layout、history 或 persistence。
- 先稳定 capability/aspect ratio，再冻结 Layout Engine Pro 的更大范围。

## Spec Coverage Map

| ID | 能力/范围 | 状态 | 关联 spec | 依赖 | 说明 |
|---|---|---|---|---|---|
| async-layout-engine | pure layout engine、scheduler、worker-capable heavy operations | done | docs/specs/async-layout-engine-performance-architecture | CORE/interaction-state-machine | tasks 14/14 |
| settings-repair | settings migration、deterministic collision repair、solver-ready boundary | done | docs/specs/layout-settings-migration-collision-repair | async-layout-engine | tasks 11/11 |
| item-capabilities-aspect-ratio | capability resolver、aspect ratio、resize handle policy、dashboard/editor priority | done | docs/specs/item-capabilities-aspect-ratio | async-layout-engine, settings-repair, CORE/height-render-runtime | tasks 41/41；完成 shared resolver、sidecar projection、layout-engine constraint、editor/runtime 接入、dogfood 与回归验证 |
| external-drop-session | external drop session 内部模型、adapter、preview cleanup 与回归矩阵 | in-spec | docs/specs/external-drop-session-refactor | async-layout-engine, EDITOR/editor-placement-session | tasks 0/10；也关联 placement session follow-up |
| layout-engine-pro | nested grids、inter-grid drag、group resize、bounding-box ghost、custom compactors、auto grid、lint/repair preview | open | none | item-capabilities-aspect-ratio | roadmap bucket，尚未生成 focused spec brief |

## Discovery Inbox

| ID | 来源 | 想法/发现 | 状态 | 处理去向 | 说明 |
|---|---|---|---|---|---|
| inbox-engine-pro-scope | docs/raw/2026-05-21-component-library-roadmap-context.md | nested grids、inter-grid drag、group resize、custom compactors、auto grid 等 pro 能力 | triaged | layout-engine-pro | item capability/aspect ratio 已稳定；切 spec 前需先回答 `pro-first-slice` |

## Open Questions

| ID | 问题 | 影响 | 状态 | 说明 |
|---|---|---|---|---|
| external-drop-owner | external drop session 最终作为 layout kernel 能力还是 editor placement 能力交付 | 影响 spec 依赖和测试入口 | open | 当前通过 LAYOUT coverage 跟踪，同时在 EDITOR placement follow-up 中引用 |
| pro-first-slice | Layout Engine Pro 第一片应先做 nested/inter-grid，还是 group resize/custom compactor | 影响下一份 focused spec brief | open | item capabilities 已完成；现在阻塞 Layout Engine Pro brief |

## Decision Log

| ID | 决策 | 日期 | 依据 | 影响 |
|---|---|---|---|---|
| d1 | 先完成 `item-capabilities-aspect-ratio`，再切 Layout Engine Pro | 2026-05-22 | roadmap review 认为 aspect ratio/capability 是 pro engine 依赖 | Layout Engine Pro 保持 open，不直接扩范围 |
| d2 | `item-capabilities-aspect-ratio` 已完成，后续可基于 sidecar capability 推进 widget registry 或 Layout Engine Pro | 2026-05-26 | `docs/specs/item-capabilities-aspect-ratio/tasks.md` 已完成 41/41，相关实现覆盖 `lib/item-capabilities.ts`、layout-engine resize constraint、dashboard/editor runtime sidecar 与测试 | `layout-engine-pro` 不再被 item capability 前置依赖阻塞，但仍需回答 `pro-first-slice` |
