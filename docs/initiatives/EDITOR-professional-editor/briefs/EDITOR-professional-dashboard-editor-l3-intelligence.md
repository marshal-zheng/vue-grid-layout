# EDITOR-professional-dashboard-editor-l3-intelligence Legacy Spec Brief

SOURCE_INITIATIVE: EDITOR
INITIATIVE_SOURCE: docs/initiatives/EDITOR-professional-editor/README.md
SPEC_BRIEF: docs/initiatives/EDITOR-professional-editor/briefs/EDITOR-professional-dashboard-editor-l3-intelligence.md
TARGET_SPEC: docs/specs/professional-dashboard-editor-l3-intelligence

## North Star Snapshot

- Goal: 让 Vue Grid Layout 从可拖拽网格升级为 headless-first、可组合、可诊断、适合成熟 dashboard/editor 产品的编辑能力。
- Success Criteria: command、selection、group move、placement、history、guard、keyboard、guides/HUD 和 L3 智能能力稳定且可观察。
- Boundaries: 覆盖 headless editor controller、command/history/guard、selection/group move、placement session、guides/HUD、bulk productivity 和 editing diagnostics。
- Principles: Headless API 优先；UI 示例只能消费公开 API；preview、guard pending 和 blocked 状态不得污染 durable truth。

## Included Coverage

- `l3-intelligence`: Legacy migration coverage for `professional-dashboard-editor-l3-intelligence` (专业仪表盘编辑器 L3 智能编排需求规格). Current initiative status: `done`. Existing requirements map to R1-R11.

## Excluded Coverage

- none: This legacy brief anchors only one existing spec. Adjacent initiative coverage remains in the initiative board and must use its own focused brief before new spec work.

## Open Questions For This Spec

无。Legacy migration 没有引入新的 blocking question；历史 clarification 仍保留在 `docs/specs/professional-dashboard-editor-l3-intelligence/requirements.md`。

## Spec Focus

This is a migration brief for an existing formal spec. It does not change scope, requirements, design, tasks, or implementation. Its purpose is to connect the existing spec to the 专业编辑器体验与生产力 north star so initiative-lifecycle status reconciliation can attach it without relying on the deprecated roadmap review file.
