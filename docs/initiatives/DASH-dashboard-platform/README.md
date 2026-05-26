# DASH Dashboard 平台与文档生命周期

INITIATIVE_ID: DASH
STATUS: active

## North Star Contract

### Goal
Dashboard 平台与文档生命周期的目标是让 dashboard 能以版本化文档为核心，在 responsive profiles、settings migration、editor shell、adapter transaction 和 persistence 之间保持一致、可回写、可恢复的状态语义。

### Success Criteria
- dashboard document、runtime projection、write-back、migration 和 adapter 边界稳定。
- responsive profiles、height/settings/collision repair 能组合成可靠 dashboard runtime。
- editor shell 的 command、placement、undo/redo、adapter finalization 和 document write-back 不产生双提交或历史分叉。
- pure data/runtime 与 Vue/editor integration 的拆分只在有 bundle 或消费者证据时推进。

### Boundaries
- In scope: dashboard document/model、persistence bridge、responsive profile、shell integration、placement policy、document write-back ownership、pure runtime split 判断。
- Out of scope: widget registry schema、official editor UI kit、AI/MCP assistant、业务后端服务。

### Principles
- Dashboard document 是 durable truth；runtime layout 是投影和交互态。
- Shell-managed 写回必须可 rollback，失败 command 不进入用户可见 history。
- compatibility path 可以保留，但不能伪装成推荐主路径。

## Spec Coverage Map

| ID | 能力/范围 | 状态 | 关联 spec | 依赖 | 说明 |
|---|---|---|---|---|---|
| versioned-persistence | layout document、migration、adapter、persistence controller | done | docs/specs/versioned-layout-persistence-core | CORE/foundation-modernization | tasks 11/11；组件级 convenience prop 说法已被 lean-core wrapper 策略覆盖 |
| dashboard-document-adapter | dashboard product document、projection、write-back、ThingsBoard import/export | done | docs/specs/dashboard-layout-document-adapter | versioned-persistence | tasks 9/9 |
| responsive-profiles | profile resolver、dashboard responsive composable、thin component | done | docs/specs/responsive-dashboard-profiles | dashboard-document-adapter | tasks 15/15；兼容语言需按 lean-core 2.0 重读 |
| dashboard-shell | headless dashboard editor shell、menu/keyboard/highlight/result stream | done | docs/specs/dashboard-editor-shell-integration | responsive-profiles, EDITOR/professional-editor-ux | tasks 17/17 |
| placement-policies | shell widget placement policies、adapter transaction 与 responsive write-back | done | docs/specs/dashboard-editor-shell-placement-policies | dashboard-shell, EDITOR/editor-placement-session | tasks 10/10 |
| command-history-first | shell/editor history、documentWriteBack owner、rollback checkpoint、synthetic pointer/drop results | done | docs/specs/command-history-first-dashboard-editing | dashboard-shell, placement-policies, EDITOR/editor-command-kernel | tasks 38/38；final coverage gate 已记录在 `docs/specs/command-history-first-dashboard-editing/tasks.md`，验证通过 `npm test`、`npm run test:examples`、`npm run check:package`、`npm run check:bundle`、`npm run build`、`npm run test:package`、`npm run test:browser` |
| dashboard-pure-runtime-split | pure document/runtime/migration API 与 Vue/editor/dashboard shell integration 拆分 | open | none | CORE/lean-core-boundary, command-history-first | 只有 bundle closure 或消费者证据足够时再切 spec |

## Discovery Inbox

| ID | 来源 | 想法/发现 | 状态 | 处理去向 | 说明 |
|---|---|---|---|---|---|
| inbox-pure-runtime | docs/raw/2026-05-22-lean-core-bundle-boundary-context.md | dashboard pure runtime vs Vue/editor integration split | triaged | dashboard-pure-runtime-split | 不属于 lean-core 本轮 |

## Open Questions

| ID | 问题 | 影响 | 状态 | 说明 |
|---|---|---|---|---|
| pure-runtime-threshold | `dashboard.mjs` 多大或哪些消费者需求足以触发 pure runtime split | 影响 package exports 和 dashboard 子入口 | open | 需要 `check:bundle` 或真实消费者需求作为证据 |
| history-owner-default | command-history-first 完成后，shell-managed write-back 是否应成为 dashboard editor 默认推荐路径 | 影响 README、示例和 compatibility path 表述 | resolved | 已定：dashboard editor 默认推荐 shell/editor history + `documentWriteBack: "shell"`；legacy `historyStore` 保留为 layout-only compatibility path，README 与示例已同步 |

## Decision Log

| ID | 决策 | 日期 | 依据 | 影响 |
|---|---|---|---|---|
| d1 | dashboard split 不放进 lean-core 本轮 | 2026-05-22 | roadmap review 认为 lean-core 只要求 dashboard 不污染 root/core/responsive | pure runtime split 保持 open |
| d2 | dashboard editor 默认推荐 shell/editor history + shell-managed document write-back | 2026-05-26 | command-history-first final coverage gate 覆盖 R1-R10，示例/README/API/tests 均完成 | legacy history 保持 compatibility / layout-only；后续 dashboard editor spec 应接入 shell command pipeline |
