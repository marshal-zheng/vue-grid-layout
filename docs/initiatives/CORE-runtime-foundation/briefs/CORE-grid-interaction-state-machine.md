# CORE-grid-interaction-state-machine Legacy Spec Brief

SOURCE_INITIATIVE: CORE
INITIATIVE_SOURCE: docs/initiatives/CORE-runtime-foundation/README.md
SPEC_BRIEF: docs/initiatives/CORE-runtime-foundation/briefs/CORE-grid-interaction-state-machine.md
TARGET_SPEC: docs/specs/grid-interaction-state-machine

## North Star Snapshot

- Goal: 让基础入口保持 lean、可预测、可发布，并把 editor、persistence、dashboard 等高级能力放到显式 subpath 或 wrapper 中。
- Success Criteria: root/core/responsive 不静态携带高级 runtime；exports、types、CSS、worker 和 bundle budget 有可验证契约。
- Boundaries: 只覆盖 package/build/export、lean core、基础 grid/runtime、组件行为边界、交互状态基础设施和高度渲染基础能力。
- Principles: root 默认保持最小闭包；高级能力通过显式入口消费；重构优先保持用户可见行为。

## Included Coverage

- `interaction-state-machine`: Legacy migration coverage for `grid-interaction-state-machine` (Grid 交互状态机需求规格). Current initiative status: `done`. Existing requirements map to R1-R9.

## Excluded Coverage

- none: This legacy brief anchors only one existing spec. Adjacent initiative coverage remains in the initiative board and must use its own focused brief before new spec work.

## Open Questions For This Spec

无。Legacy migration 没有引入新的 blocking question；历史 clarification 仍保留在 `docs/specs/grid-interaction-state-machine/requirements.md`。

## Spec Focus

This is a migration brief for an existing formal spec. It does not change scope, requirements, design, tasks, or implementation. Its purpose is to connect the existing spec to the 核心运行时与发布边界 north star so initiative-lifecycle status reconciliation can attach it without relying on the deprecated roadmap review file.
