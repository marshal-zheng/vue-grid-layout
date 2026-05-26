# Editor Multi-Select, Group Move, and Productivity Context

Created: 2026-05-10
Project: `/Users/hqz/dev/vue-grid-layout`

## 背景目标

当前讨论围绕 `professional-dashboard-editor` 示例和 editor 能力升级展开。用户希望支持类似专业 dashboard/editor 的多选与批量编辑体验，尤其是：

- `Ctrl/Cmd + 点击` 可以选择多个 item。
- 选择多个 item 后，可以一起拖动。
- 多选拖动不要用局部补丁实现，而要采用长期收益最大的方案。
- 用户倾向采用推荐方案：`Group Move` 进入 `layout-engine`。
- 后续会由用户根据本 raw context 拆成两个 spec。

项目级约束：

- 不要使用 computer use。
- 需要尊重现有 editor command pipeline、layout engine、history、guides、persistence 方向。
- 不要把所有能力塞进一个巨型 spec，避免范围失焦。

## 已确认现状

### Forecast 不能拖动的原因

`professional-dashboard-editor` 里的 `forecast` layout item 本身不是 `static`：

- `example/23-professional-dashboard-editor.js`: `forecast` 的 layout 配置是普通 `{ i, x, y, w, h }`。

它不能拖，是因为 editor sidecar metadata 中设置了：

```js
forecast: { locked: true, label: "Forecast", copyable: true }
```

`locked: true` 是 editor 层权限概念，不是 layout engine 的 `static`。

含义：

- 该 item 自己不能直接编辑：不能直接拖动、缩放、删除、duplicate 等，取决于 capability。
- 但它仍然是 layout 里的普通 item，不是位置固定的物理障碍。
- 当前碰撞/compact 逻辑主要认 `item.static`，不认 editor metadata 的 `locked`。
- 因此其他 item 仍可能把 locked item 挤走。

如果需要“不能被别人挤走”的语义，应使用 layout 层：

```js
{ i: "forecast", x: 9, y: 0, w: 3, h: 3, static: true }
```

未来 spec 里需要明确区分：

- `locked`: editor 权限锁，限制直接编辑。
- `static`: layout 物理固定/障碍物。

### 多选点击已经具备基础

`Ctrl/Cmd + 点击` 多选语义已经存在于 `VueGridLayout.tsx` 的 pointer selection 路径：

```ts
payload: {
  id,
  toggle: event.metaKey || event.ctrlKey,
  range: event.shiftKey
}
```

Selection model 中也已有：

- `selectedIds`
- `activeId`
- `anchorId`
- `mode: "single" | "multiple"`
- toggle selection
- range selection

这说明第一期不需要从零实现多选模型，重点是让 pointer drag 识别 selected set 并把 group move 交给 layout engine。

### 当前拖拽只移动单个 item

当前 pointer drag 路径中，`onDrag(i, x, y, ...)` 根据当前拖动 item id 调用 layout engine move：

```ts
{ type: "move", id: i, x, y, userAction: true }
```

它没有把 `editor.selection.value.selectedIds` 纳入拖拽操作。因此即使 UI 已经多选，鼠标拖动时仍然只移动当前 item。

### Editor command 已经支持多目标 keyboard/API move

`editor/controller.ts` 的 `move` command 对多个 allowed ids 已经可以按 `dx/dy` 批量移动：

```ts
if (!allowedIds.includes(item.i)) return item;
return { ...item, x: item.x + dx, y: item.y + dy };
```

但这条路径目前更像 command 层直接批量改 layout，不等同于 layout engine 的 collision-aware group move。后续 spec 应把 keyboard/API move 与 pointer group drag 汇聚到同一个 group move 能力，避免不同入口语义分叉。

### 键盘快捷键近期已优化

已将 editor keyboard 整理成统一 shortcut registry/matcher：

- `Cmd/Ctrl+Z` -> `undo`
- `Cmd/Ctrl+Shift+Z` -> `redo`
- standard platform 支持 `Ctrl+Y` -> `redo`
- 避免 `Ctrl/Cmd + Arrow` 被误判为普通移动
- `GridEditorKeyboardOptions` 增加 `platform?: "auto" | "mac" | "standard"`

相关测试已补：

- 核心测试验证快捷键解析和删除后 undo/redo。
- 浏览器 smoke 验证真实键盘事件删除后快捷键撤销/重做。

这对 group move 很重要：多选移动也应走同一个 history/undo 体系，一次 undo 恢复整个 group move。

## 推荐 Spec 拆分

用户询问一个 spec 是否足够。结论：

- 一个 spec 不适合覆盖全部能力，会过大。
- 三个 spec 最干净，但用户希望两个 spec。
- 两个 spec 可行，并且更现实。

推荐拆成：

### Spec 1: Editor Multi-Select Group Operations

这是核心地基，建议先做。

范围建议：

- 固化 `Ctrl/Cmd + 点击` 多选语义。
- 已选中 item 被拖动时，整组一起移动。
- 拖未选中的 item 时，默认切换成单选并只拖它，符合大多数编辑器直觉。
- `Group Move` 进入 `layout-engine`，成为一等操作，而不是在 Vue drag callback 中硬改其他 item。
- Pointer drag、keyboard move、API command 尽量共享同一套 group move 语义。
- 支持 undo/redo：一次 group move 是一个 history entry。
- 明确 locked/static/collision/bounds 规则。
- 基础 guides / HUD / blocked 状态支持。
- 测试覆盖 layout engine、editor controller、browser interaction。

建议不要把框选/对齐/分布放入 Spec 1，避免第一期实现过大。

### Spec 2: Editor Bulk Productivity Tools

这是建立在 Spec 1 多选地基上的生产力能力。

范围建议：

- 框选 / lasso selection。
- 对齐：左、右、上、下、水平居中、垂直居中。
- 分布：水平等间距、垂直等间距。
- 批量尺寸：等宽、等高、统一宽高。
- 批量操作：lock/unlock、hide/show、delete、duplicate、copy/paste。
- Inspector：selected count、mixed value、批量编辑 `x/y/w/h`。
- UI 层明确展示 `locked` vs `static` 的不同语义。
- 完善 toolbar/menu/keyboard affordances。

## Group Move 推荐设计方向

最推荐方案：把 Group Move 做进 layout engine。

核心原因：

- 长期收益最大。
- 让鼠标拖拽、键盘移动、API command、history、guides、worker/scheduler 逐步复用同一套语义。
- 避免“这个功能一种写法、那个功能另一种写法”的分叉。

建议 layout operation 方向：

```ts
type LayoutOperation =
  | { type: "move"; id: string; x: number; y: number; userAction?: boolean }
  | { type: "groupMove"; ids: string[]; dx: number; dy: number; activeId?: string; userAction?: boolean };
```

或者扩展 move：

```ts
{ type: "move"; ids: string[]; dx: number; dy: number; activeId?: string }
```

但更推荐单独 `groupMove`，因为：

- 单 item absolute move 和 group relative move 语义不同。
- `groupMove` 更容易表达整体 bounds/collision/blocked 诊断。
- 更容易在 tests 和 diagnostics 中区分。

## Group Move 行为建议

### 启动规则

- 如果 active dragged item 已在当前 selection 中，并且 selection 数量大于 1，则启动 group move。
- 如果 active dragged item 不在 selection 中，则先选中该 item，再执行 single move。
- 如果处于 view mode，不允许拖动。

### 移动规则

- group move 应保持组内 item 的相对位置。
- pointer drag 可以通过 active item 的起始位置与当前目标位置计算 `dx/dy`。
- keyboard move 可以直接使用已有 `dx/dy`。
- group move 的 preview 和 commit 应尽量走 layout engine scheduler，而不是 editor 层直接 patch。

### locked/static 规则

需要 spec 决策，推荐默认：

- `locked` item：不能作为直接可移动项参与 group move。
- `static` item：不能移动，并且在碰撞中作为障碍物。
- 如果 commandPolicy 是 `skip-blocked`，跳过不可移动 selected ids，移动其余项，并返回 blocked/skipped ids。
- 如果 commandPolicy 是 `all-or-nothing`，任何 selected item 不可移动则整个 group move blocked。

需要注意：

- 当前 `locked` 不是 layout engine 概念，layout engine 不应直接依赖 editor metadata。
- Editor/controller 应先根据 capability 过滤 allowed ids，再把 allowed ids 发给 layout engine。
- `static` 是 layout item 属性，layout engine 可以直接判断。

### 碰撞与边界规则

推荐优先实现保守版本：

- group 内部 item 互相重叠关系保持不变，不把组内碰撞当作阻塞。
- group 与组外 item 的碰撞由 layout engine 处理。
- preventCollision=true 时，如果 group 目标位置会撞组外 item，返回 blocked。
- allowOverlap=true 时允许与组外 item overlap。
- compact=false / vertical / horizontal 场景都需要测试。
- bounds 应按整个 group bounding box 判断，不能只看 active item。

### Placeholder / guides / HUD

第一期可以先做基础：

- active item 仍显示当前 placeholder。
- guides 以 active item 为主。
- HUD 增加 selected count 或 group delta 是加分项，但不应阻塞第一期。

后续更好体验：

- group bounding box overlay。
- selected items ghost preview。
- group blocked reason 显示哪些 ids 被跳过或阻塞。

## 不推荐的实现方式

不推荐只在 `VueGridLayout.tsx` 的 drag callback 中手动修改其他 selected items。

原因：

- layout engine 不知道这是组移动。
- collision、bounds、worker、scheduler、diagnostics、guides 会继续分叉。
- undo/redo 和 command pipeline 容易出现不一致。

不推荐只在 editor controller 中临时批量改 layout。

原因：

- 这会让 keyboard/API 看起来支持多选移动，但 pointer drag、layout engine preview、collision diagnostics 仍然不是同一套。

## 相关代码入口

后续写 spec/design 时建议重点阅读：

- `lib/VueGridLayout.tsx`
  - pointer selection: `executeEditorSelect`
  - pointer drag: `onDrag`, `onDragStart`, `onDragStop`
  - layout engine preview/commit: `runEnginePreview`, `runEngineCommit`
  - editor mode / selected classes / locked classes

- `lib/editor/selection.ts`
  - selection state
  - toggle/range selection
  - sanitize selection after layout changes

- `lib/editor/controller.ts`
  - command pipeline
  - `checkGridEditorCommand`
  - layout commands
  - metadata commands
  - history commit
  - undo/redo

- `lib/editor/commands.ts`
  - command capability mapping
  - blocked reason
  - commandPolicy `all-or-nothing` vs `skip-blocked`

- `lib/editor/metadata.ts`
  - `resolveEditorItemCapability`
  - locked/editable/draggable/resizable/copyable/deletable semantics

- `lib/layout-engine/core.ts`
  - layout operation executor
  - move/resize/dropFit operation handling
  - diagnostics and blocked result

- `lib/utils.ts`
  - `moveElement`
  - collision detection
  - compaction
  - static handling

- `test/editor-core.test.ts`
  - editor command/history/keyboard/persistence/guides tests

- `test/editor-component-browser.test.js`
  - real browser selection, keyboard, drag/drop smoke coverage

- `test/layout-engine-core.test.ts`
  - layout engine pure function behavior

## Testing Strategy Notes

Spec 1 should include tests for:

- `Ctrl/Cmd + 点击` keeps multi-selection.
- Dragging selected active item moves all movable selected items together.
- Dragging unselected item switches to single-item drag.
- Group move preserves relative positions.
- Group move creates one undo entry.
- Undo restores all moved items.
- Redo reapplies all moved items.
- Locked selected item is skipped or blocks according to commandPolicy.
- Static item blocks movement or is skipped according to commandPolicy/design.
- preventCollision blocks group move against external item.
- allowOverlap allows group overlap.
- Bounds are evaluated across entire group, not active item only.
- Browser smoke covers real pointer drag if feasible.

Spec 2 should include tests for:

- Lasso selects items intersecting/contained by selection rectangle, according to chosen rule.
- Align/distribute commands work only on selected movable items.
- Batch lock/unlock/hide/show/delete/duplicate use command pipeline and history.
- Inspector shows mixed values for multi-selection.
- Batch edits produce one undo entry.

## Open Decisions For Specs

Spec authors should decide:

- Should group move with some locked selected items skip blocked ids by default, or block all by default?
- Should static selected items be skipped or make group move blocked?
- Should group collision with outside items push outside items, or should group move be blocked when `preventCollision=false` but compact enabled?
- Should group move produce one active placeholder or group bounding-box overlay in first release?
- Should lasso selection select items by intersection or full containment?
- Should shift-click range use layout order or visual sorted order?
- Should group move be public API immediately, or internal first with exported types?

Recommended defaults:

- Respect existing `commandPolicy`.
- `skip-blocked` demos can move movable selected items and report skipped ids.
- `all-or-nothing` blocks entire group when any selected item cannot move.
- Use intersection for lasso selection because it feels more forgiving in dashboards.
- Keep group move public enough for API users once tests are solid.

