# CORE 核心运行时与发布边界

INITIATIVE_ID: CORE
STATUS: active

## North Star Contract

### Goal
核心运行时与发布边界的目标是让 `@marsio/vue-grid-layout` 的基础入口保持 lean、可预测、可发布，并把 editor、persistence、dashboard 等高级能力放到显式 subpath 或 wrapper 中。

### Success Criteria
- root/core/responsive 入口不静态携带 editor、dashboard、persistence、history、Pinia 或 widget registry runtime。
- package exports、CJS/ESM、types、CSS、worker 和 bundle budget 有可验证的发布契约。
- 行为保持型重构、交互状态机和高度/渲染运行时不改变基础组件默认行为。
- 旧兼容语言被明确标注为已被 `lean-core-bundle-boundary` 覆盖。

### Boundaries
- In scope: package/build/export 边界、lean core、基础 grid/runtime、组件行为边界、交互状态基础设施、高度渲染基础能力。
- Out of scope: dashboard 业务文档、official editor UI kit、widget registry schema、AI/MCP assistant。

### Principles
- root 默认保持最小闭包；高级能力通过显式入口消费。
- 破坏性边界变更必须由 migration note、package check 和 bundle check 支撑。
- 重构优先保持用户可见行为，再收敛内部职责。

## Spec Coverage Map

| ID | 能力/范围 | 状态 | 关联 spec | 依赖 | 说明 |
|---|---|---|---|---|---|
| foundation-modernization | Vite-first build、exports、类型声明、package tests、docs/MCP gate | done | docs/specs/foundation-modernization | none | tasks 16/16；旧 root compatibility 语言已被 lean-core 覆盖 |
| lean-core-boundary | 2.0 root = lean core、无 compat、高级 wrapper、transitive bundle budget | done | docs/specs/lean-core-bundle-boundary | foundation-modernization | tasks 12/12；当前公共入口/API 边界权威 spec |
| behavior-refactor | `VueGridLayout` 行为保持型组件边界重构 | done | docs/specs/vue-grid-layout-behavior-preserving-refactor | foundation-modernization | tasks 13/13 |
| interaction-state-machine | click/drag/resize/drop/blocked 交互状态基础设施 | done | docs/specs/grid-interaction-state-machine | behavior-refactor | tasks 12/12 |
| height-render-runtime | height modes、render precision、基础组件与 dashboard 高度映射 | done | docs/specs/height-modes-render-precision | lean-core-boundary | tasks 16/16 |
| root-layout-engine-split | 未来是否从 core default path 进一步拆出 layout-engine | idea | none | lean-core-boundary | 只有测量显示 closure savings 明显或消费者需要 pure core 时才推进 |

## Discovery Inbox

| ID | 来源 | 想法/发现 | 状态 | 处理去向 | 说明 |
|---|---|---|---|---|---|
| inbox-root-compat | docs/specs/spec-roadmap-review.md | 旧 root compatibility 说法容易误导后续实现 | triaged | GOV/supersession-notes | 由治理 initiative 统一补说明 |

## Open Questions

| ID | 问题 | 影响 | 状态 | 说明 |
|---|---|---|---|---|
| layout-engine-split-trigger | 什么测量阈值或消费者需求足以触发 layout-engine subpath split | 影响未来 package exports 和 bundle closure | open | 当前不是 lean-core 本轮范围 |

## Decision Log

| ID | 决策 | 日期 | 依据 | 影响 |
|---|---|---|---|---|
| d1 | `lean-core-bundle-boundary` 是 2.0 root/core/responsive API 边界的权威规格 | 2026-05-22 | `docs/specs/spec-roadmap-review.md` 已确认旧兼容说法被覆盖 | 后续 spec 不应恢复 root convenience editor/persistence props |
