# LAYOUT-async-layout-engine-performance-architecture Legacy Spec Brief

SOURCE_INITIATIVE: LAYOUT
INITIATIVE_SOURCE: docs/initiatives/LAYOUT-engine-pro/README.md
SPEC_BRIEF: docs/initiatives/LAYOUT-engine-pro/briefs/LAYOUT-async-layout-engine-performance-architecture.md
TARGET_SPEC: docs/specs/async-layout-engine-performance-architecture

## North Star Snapshot

- Goal: 提供可扩展、确定性、可诊断的布局计算内核，让大 dashboard、复杂 resize、migration、repair、drop 和未来 pro layout 复用同一套纯函数语义。
- Success Criteria: 大布局操作有可诊断执行路径；resize/drop/repair/migration/constraint/capability 决策顺序确定。
- Boundaries: 覆盖 pure layout engine、constraint/capability helper、repair/migration、drop session adapter、layout diagnostics 和未来 pro engine 行为。
- Principles: 计算核心保持 Vue/editor/dashboard 无关；preview blocked 不污染 committed layout、history 或 persistence。

## Included Coverage

- `async-layout-engine`: Legacy migration coverage for `async-layout-engine-performance-architecture` (异步布局引擎与性能架构 需求规格). Current initiative status: `done`. Existing requirements map to R1-R10.

## Excluded Coverage

- none: This legacy brief anchors only one existing spec. Adjacent initiative coverage remains in the initiative board and must use its own focused brief before new spec work.

## Open Questions For This Spec

无。Legacy migration 没有引入新的 blocking question；历史 clarification 仍保留在 `docs/specs/async-layout-engine-performance-architecture/requirements.md`。

## Spec Focus

This is a migration brief for an existing formal spec. It does not change scope, requirements, design, tasks, or implementation. Its purpose is to connect the existing spec to the 布局引擎与约束能力 north star so initiative-lifecycle status reconciliation can attach it without relying on the deprecated roadmap review file.
