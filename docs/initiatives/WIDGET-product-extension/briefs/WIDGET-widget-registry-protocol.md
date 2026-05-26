# WIDGET-widget-registry-protocol Legacy Spec Brief

SOURCE_INITIATIVE: WIDGET
INITIATIVE_SOURCE: docs/initiatives/WIDGET-product-extension/README.md
SPEC_BRIEF: docs/initiatives/WIDGET-product-extension/briefs/WIDGET-widget-registry-protocol.md
TARGET_SPEC: docs/specs/widget-registry-protocol

## North Star Snapshot

- Goal: 在 headless editor、dashboard document 和 layout diagnostics 稳定后，提供可选 widget registry、Editor Kit UI 和 AI/MCP dashboard assistant 能力，同时不污染 lean core。
- Success Criteria: widget registry 描述类型、template/default layout、settings descriptor、capability bridge 和 dashboard sidecar；产品扩展保持 optional。
- Boundaries: 覆盖 widget registry protocol、optional Editor Kit UI、widget palette/inspector/context menu/outline、AI/MCP dashboard assistant 和 MCP introspection。
- Principles: Optional by construction；Registry 先于 AI；UI kit 必须消费公开 headless/dashboard API。

## Included Coverage

- `widget-registry-protocol`: Legacy migration coverage for `widget-registry-protocol` (Widget Registry Protocol 需求规格). Current initiative status: `in-spec`. Existing requirements map to R1-R10.

## Excluded Coverage

- none: This legacy brief anchors only one existing spec. Adjacent initiative coverage remains in the initiative board and must use its own focused brief before new spec work.

## Open Questions For This Spec

无。Legacy migration 没有引入新的 blocking question；历史 clarification 仍保留在 `docs/specs/widget-registry-protocol/requirements.md`。

## Spec Focus

This is a migration brief for an existing formal spec. It does not change scope, requirements, design, tasks, or implementation. Its purpose is to connect the existing spec to the Widget 产品扩展与 AI 助手 north star so initiative-lifecycle status reconciliation can attach it without relying on the deprecated roadmap review file.
