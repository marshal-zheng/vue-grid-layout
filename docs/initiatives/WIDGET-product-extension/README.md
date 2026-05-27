# WIDGET Widget 产品扩展与 AI 助手

INITIATIVE_ID: WIDGET
STATUS: active

## North Star Contract

### Goal
Widget 产品扩展与 AI 助手的目标是在 headless editor、dashboard document 和 layout diagnostics 稳定后，提供可选的 widget registry、Editor Kit UI 和 AI/MCP dashboard assistant 能力，同时不污染 lean core。

### Success Criteria
- widget registry 能描述 widget 类型、template/default layout、settings descriptor、capability bridge 和 dashboard document sidecar。
- Editor Kit UI 作为 optional product layer 消费 headless APIs，不重新塞回 root/core/responsive。
- AI/MCP assistant 只消费稳定 registry、diagnostics 和 layout APIs，不反向发明核心契约。
- package exports、bundle boundary、README 和 dogfood 示例清楚区分 headless API 与可选产品层。

### Boundaries
- In scope: widget registry protocol、optional Editor Kit UI、widget palette/inspector/context menu/outline、AI/MCP dashboard assistant、MCP introspection。
- Out of scope: core grid 默认入口、dashboard 后端服务、完整 BI 产品壳、业务 widget 实现。

### Principles
- Optional by construction：产品扩展不能成为 lean core 的隐性依赖。
- Registry 先于 AI；AI 只能解释和组合稳定 schema。
- UI kit 必须消费公开 headless/dashboard API，不能依赖 demo-only helper。

## Spec Coverage Map

| ID | 能力/范围 | 状态 | 关联 spec | 依赖 | 说明 |
|---|---|---|---|---|---|
| widget-registry-protocol | registry core、layout defaults、settings descriptor、template materialization、dashboard sidecar、shell bridge | done | docs/specs/widget-registry-protocol | DASH/dashboard-shell, EDITOR/l3-intelligence, LAYOUT/item-capabilities-aspect-ratio | tasks 14/14；Round 2 independent review PASS；证据：docs/specs/widget-registry-protocol/tasks.md |
| editor-kit-ui | toolbar、outline、inspector、widget palette、context menu、command palette、empty state、diagnostics panel | open | none | widget-registry-protocol, EDITOR/editor-bulk-productivity | roadmap bucket，尚未生成 focused spec brief |
| ai-mcp-dashboard-assistant | layout lint、explain blocked operations、auto tidy/arrange、schema-to-dashboard、model migration assistant、registry introspection | idea | none | widget-registry-protocol, LAYOUT/layout-engine-pro | 差异化能力，但应等 registry 和 diagnostics 稳定后再做 |
| mcp-docs-introspection | MCP docs/examples/types 与 widget registry introspection 数据 | open | none | widget-registry-protocol | 可作为 AI assistant 前置或 registry 收尾项 |

## Discovery Inbox

| ID | 来源 | 想法/发现 | 状态 | 处理去向 | 说明 |
|---|---|---|---|---|---|
| inbox-editor-kit | docs/raw/2026-05-21-component-library-roadmap-context.md | official Editor Kit UI 与 widget protocol | triaged | editor-kit-ui, widget-registry-protocol | 当前先有 widget registry formal spec |
| inbox-ai-assistant | docs/raw/2026-05-21-component-library-roadmap-context.md | AI/MCP dashboard assistant | triaged | ai-mcp-dashboard-assistant | 等 registry/diagnostics 稳定后再切 spec |

## Open Questions

| ID | 问题 | 影响 | 状态 | 说明 |
|---|---|---|---|---|
| editor-kit-package-boundary | Editor Kit UI 应作为 package subpath、examples-only，还是独立可选包 | 影响 exports、bundle 和测试矩阵 | open | widget registry 实现后再判断 |
| ai-assistant-minimum-schema | AI/MCP assistant 第一版需要哪些 registry/diagnostics schema 才不 hallucinate examples | 影响 AI assistant spec 边界 | open | 依赖 widget registry 与 layout diagnostics |

## Decision Log

| ID | 决策 | 日期 | 依据 | 影响 |
|---|---|---|---|---|
| d1 | Widget/Editor Kit/AI 均保持 optional，不进入 lean core | 2026-05-22 | roadmap review 对 Component Library Roadmap 的边界判断 | 后续 spec 必须检查 bundle boundary |
| d2 | AI/MCP assistant 等 widget registry 和 layout diagnostics 稳定后再做 | 2026-05-22 | roadmap review 认为 AI 不应反向发明核心契约 | `ai-mcp-dashboard-assistant` 保持 idea |
