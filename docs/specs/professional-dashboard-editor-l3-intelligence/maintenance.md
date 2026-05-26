# L3 维护治理

## Reviewer checklist

- 新能力优先扩展 `GridEditorIntelligenceState`、command payload、command result diagnostics 和 tests；避免直接在 `VueGridLayout.tsx` 增加私有布局算法。
- `VueGridLayout.tsx` 只做交互输入采集、preview/commit adapter、guide state 渲染和事件转发。
- command 修改必须经过 `checkGridEditorCommand()`、`beforeCommand`、history、dirty 和 persistence 边界。
- section/row metadata 只能表达客户端编辑结构，不得承载业务权限。
- 新 diagnostics code 必须稳定、可测试、可用于示例 UI 和埋点。

## Naming and versioning

- command payload: `GridEditor<Command>Payload`
- guide payload/state: `GridEditorGuide*`
- toolbar state: `GridEditorToolbar*`
- section metadata: `GridEditorSectionRow*`
- intelligence diagnostics: `grid-editor.<area>.<status>[.<reason>]`
- sidecar persistence: `meta.editor.version`, currently v1 metadata-only and v2 with `sectionRows`

## Extension entry points

- 属性面板应读取 `GridEditorCommandResult.diagnostics.computed` 和 `GridEditorToolbarState`。
- 协作编辑应复用 command result、history metadata 和 persistence envelope，而不是绕过 controller mutation。
- AI 自动排版和模板化 dashboard 应先生成 intelligence/command payload，再由 controller 执行。
- 多人 PR 拆分建议：intelligence, commands, Vue adapter, visual CSS, docs/tests。
