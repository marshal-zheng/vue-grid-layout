# DASH-command-history-first-dashboard-editing Legacy Spec Brief

SOURCE_INITIATIVE: DASH
INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-command-history-first-dashboard-editing.md
TARGET_SPEC: docs/specs/command-history-first-dashboard-editing

## North Star Snapshot

- Goal: 让 dashboard 以版本化文档为核心，在 profiles、migration、editor shell、adapter transaction 和 persistence 之间保持一致、可回写、可恢复的状态语义。
- Success Criteria: dashboard document、projection、write-back、migration、adapter 和 shell-managed 写回语义稳定。
- Boundaries: 覆盖 dashboard document/model、responsive profile、shell integration、placement policy、document write-back ownership 和 pure runtime split 判断。
- Principles: Dashboard document 是 durable truth；runtime layout 是投影和交互态；shell-managed 写回必须可 rollback。

## Included Coverage

- `command-history-first`: Legacy migration coverage for `command-history-first-dashboard-editing` (Command History First Dashboard Editing 需求规格). Current initiative status: `in-spec`. Existing requirements map to R1-R10.

## Excluded Coverage

- none: This legacy brief anchors only one existing spec. Adjacent initiative coverage remains in the initiative board and must use its own focused brief before new spec work.

## Open Questions For This Spec

无。Legacy migration 没有引入新的 blocking question；历史 clarification 仍保留在 `docs/specs/command-history-first-dashboard-editing/requirements.md`。

## Spec Focus

This is a migration brief for an existing formal spec. It does not change scope, requirements, design, tasks, or implementation. Its purpose is to connect the existing spec to the Dashboard 平台与文档生命周期 north star so initiative-lifecycle status reconciliation can attach it without relying on the deprecated roadmap review file.
