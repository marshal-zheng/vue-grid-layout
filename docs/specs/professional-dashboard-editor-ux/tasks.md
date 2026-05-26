# 专业仪表盘编辑器 UX 实现任务

- [x] 1. 建立 `lib/editor` 模块骨架与公开类型
  - 新增 `lib/editor/types.ts`，定义 `GridEditorMode`、`GridEditorDerivedState`、`GridEditorSelectionState`、`GridEditorItemMeta`、`GridEditorMetaById`、`GridEditorCommand`、`GridEditorCommandResult`、`GridEditorEvent`、clipboard、guides、history 和 persistence envelope 类型。
  - 新增 `lib/editor/index.ts` 作为 editor 命名导出入口，保持 headless-first，不引入 toolbar、菜单或业务 UI。
  - 在 `lib/cjs.ts` 和 `typings/index.d.ts` 预留并导出 editor 命名空间和核心类型。
  - 确保类型只依赖 plain layout、Vue refs 类型、layout engine 类型和 persistence 类型，不访问 DOM 或 storage。
  _需求追溯: R1.AC1, R1.AC4, R1.AC5, R11.AC2, R11.AC6, R14.AC6_

- [x] 2. 实现 sidecar editor metadata 与 capability 解析
  - 新增 `lib/editor/metadata.ts`，实现 `normalizeEditorMetaById()`、`validateEditorMetaById()`、`sanitizeEditorMetaById()` 和 metadata patch helper。
  - 将 `locked`、`visible`、`editable`、`draggable`、`resizable`、`deletable`、`duplicatable`、`copyable` 等编辑能力保存在 sidecar `editorMetaById`，不得默认写入 `LayoutItem`。
  - 合并现有 `LayoutItem.static`、`isDraggable`、`isResizable`、`isBounded`、`resizeHandles` 与 sidecar metadata，形成统一 capability 结果。
  - 区分 `visible: false` 的“保留布局但不渲染”和 delete 的“从 layout 删除”，并清理不存在 item 的 orphan metadata。
  - 对外部 metadata、clipboard metadata、persisted `meta.editor` 做 JSON-safe 校验，阻止原型污染字段。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC6, R10.AC2, R11.AC6, R14.AC1_

- [x] 3. 实现 editor controller 状态机与 mode/defaultMode 规则
  - 新增 `lib/editor/controller.ts`，实现 `createGridEditorController()`，管理 mode、derived state、selection、metadata、dirty、conflict、guides、lastResult 和 event emitter。
  - 实现受控 `mode` 与非受控 `defaultMode` 规则；启用 editor 但未传入二者时 fail-safe 到 `view`，发出 `editor-mode-missing` 诊断事件。
  - `view` 模式默认阻止编辑命令、selection UI、resize handle、drop target 和 keyboard editing，只保留只读布局展示语义。
  - 外部受控 mode 或 layout 在交互中变化时，取消无法安全保留的 preview，回滚到最近 committed layout，并发出结构化取消原因。
  - 派生 `viewing`、`editingClean`、`editingDirty`、`dragging`、`resizing`、`keyboardEditing`、`savePending`、`saveFailed`、`conflict` 状态。
  _需求追溯: R1.AC1, R1.AC2, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7, R11.AC1, R11.AC2_

- [x] 4. 实现统一 command pipeline 与 `beforeCommand` guard
  - 新增 `lib/editor/commands.ts`，实现 command id、target 解析、mode 校验、同步 capability 校验、异步 `beforeCommand` guard、结果归一化和事件顺序。
  - 覆盖 `select`、`clearSelection`、`move`、`resize`、`add`、`delete`、`duplicate`、`copy`、`paste`、`lock`、`unlock`、`show`、`hide`、`save`、`discard`、`reset`、`undo`、`redo` 命令类型。
  - `beforeCommand` guard 支持 allow、block、cancel、timeout、error；pending 或失败期间不得部分修改 committed layout 或 metadata。
  - `canExecute()` 只执行同步校验，用于 toolbar disabled 状态；`execute()` 才执行异步 guard 和 mutation。
  - 命令结果包含 status、target ids、layout patches、metadata patches、affected ids、blocked reason、diagnostics、undo metadata 和 error。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC8, R6.AC2, R6.AC6, R11.AC2, R11.AC3, R11.AC4, R14.AC1_

- [x] 5. 实现 selection model、多选与焦点状态
  - 新增 `lib/editor/selection.ts`，实现 `selectedIds`、`activeId`、`anchorId`、`selectionMode`、source 和受控 selection request。
  - 支持点击 item、点击空白、Cmd/Ctrl 点击、Shift 范围选择、API 选择和清空选择。
  - 外部受控 `selectedIds` 时不直接覆盖，由事件请求更新。
  - 删除、隐藏、锁定或外部 layout 移除 item 后清理无效 selection，并把 focus 移动到可预测目标或 grid 容器。
  - 多选支持批量 delete、copy、duplicate、lock、unlock、show、hide 和 group move；group resize 暂不支持时返回 `multi-resize-unsupported`。
  - 支持 all-or-nothing 与 skip-blocked 策略，并在结果中列出被跳过或阻止的 item id。
  _需求追溯: R3.AC5, R4.AC5, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R7.AC3, R11.AC1, R14.AC1_

- [x] 6. 实现 editor history 与 undo/redo 粒度
  - 新增 `lib/editor/history.ts`，实现 `createGridEditorHistory()`，snapshot 覆盖 layout / responsive layouts、breakpoint、`editorMetaById`、selection 和 focus。
  - pointer drag/resize 从 start 到 stop 合并为一条 history entry，不为 preview tick 建历史。
  - 键盘连续 move/resize 使用 `mergeKey` 和 `mergeWindowMs` 合并。
  - delete、duplicate、paste、lock、unlock、show、hide 等离散 command 创建清晰的一条 undo/redo 单元。
  - 保持现有 `historyStore` 作为 layout-only 兼容层，editor 示例 toolbar 使用 editor controller 的 `undo()` / `redo()`。
  - undo/redo 恢复后同步 selection、focus、dirty 和受控事件；无法安全应用时返回 blocked result。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R10.AC2, R14.AC1_

- [x] 7. 实现 persistence bridge 与 `meta.editor` 原子保存/恢复
  - 新增 `lib/editor/persistenceBridge.ts`，用现有 `useGridLayoutPersistence()` 的 `meta` option 注入 `{ editor: { version, editorMetaById, updatedAt } }`。
  - 从 `load-success`、`external-apply`、`conflict`、`save-error`、`save-success`、`discard`、`reset` 事件恢复和同步 editor state。
  - `editorMetaById` 与 layout / responsive layouts 使用同一个 persistence document 原子保存/恢复，不默认拆成独立 key。
  - metadata 恢复、迁移或校验失败时，不静默只恢复 layout；整个 editor save/load 进入 error，并保留内存 layout、metadata、selection 和 dirty 状态。
  - metadata-only 命令不触发 `layoutChange`，但会让 editor dirty 为 true，并在 save command 时随同 layout document 写入。
  - 多标签页 conflict payload 同时暴露 layout 和 metadata 差异以及 resolve actions。
  _需求追溯: R1.AC2, R3.AC6, R6.AC7, R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC5, R10.AC7, R11.AC2, R14.AC1_

- [x] 8. 实现 clipboard controller 与 copy/paste 放置逻辑
  - 新增 `lib/editor/clipboard.ts`，实现默认内部剪贴板和可选 `systemClipboardAdapter()`。
  - clipboard payload 包含 version、sourceId、copiedAt、items 和对应 `editorMetaById`。
  - SSR、Clipboard API 不可用、权限拒绝或读写失败时返回 `clipboard-unavailable` / `clipboard-permission` / error command result，并可安全降级到内部剪贴板。
  - paste 时使用可配置 id generator 重写 item id 和 metadata id，避免与当前 layout、responsive layouts 或 payload 冲突。
  - duplicate / paste 放置复用 layout engine fit/drop 能力，支持 offset、cursor、nearest-fit、first-fit 策略，失败时返回结构化原因。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC7, R6.AC4, R6.AC5, R7.AC1, R11.AC6, R14.AC1_

- [x] 9. 实现 keyboard editing、快捷键与可访问消息
  - 新增 `lib/editor/keyboard.ts`，实现方向键移动、修饰键加速移动、键盘 resize、Delete/Backspace、Cmd/Ctrl+C、Cmd/Ctrl+V、Cmd/Ctrl+D、Cmd/Ctrl+S、Esc。
  - 复用 command pipeline、layout engine、editor history 和 persistence 提交边界。
  - 支持 ignored target：input、textarea、select、contenteditable 和业务方配置的 selector/function。
  - 进入 keyboard editing 时更新 active item、focus ring、selection 反馈和可取消路径。
  - 命令 blocked 或 save failed 时输出可接入 toast、aria-live 或状态栏的结构化消息。
  - 暴露 item label、位置、尺寸、锁定状态、选择状态和可用命令说明的数据接口。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R9.AC1, R9.AC2, R14.AC3_

- [x] 10. 实现 snap lines、alignment guides 与 preview feedback
  - 新增 `lib/editor/guides.ts`，实现边缘、中心和相邻间距 guides 的纯计算。
  - 支持 snap 启停、阈值、deterministic priority、locked/hidden/static 是否参与 guide 计算。
  - 与 layout engine scheduler 协作，500+ item 或超预算时可降级为最近候选或跳过，并发 diagnostics。
  - 将 guide 命中、snap source 和 guide id 写入 command result diagnostics。
  - 统一 preview、placeholder、guides、blocked state 与 committed layout 的分离语义；blocked 恢复为可提交时更新事件和视觉状态。
  - external drop 悬停时显示 insertion placeholder，并根据 drop strategy、collision、fit search 和 guide 命中更新反馈。
  _需求追溯: R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R14.AC4_

- [x] 11. 集成 `VueGridLayout` 的 editor prop 与提交边界
  - 在 `lib/VueGridLayoutPropTypes.ts` 增加 `editor?: false | GridEditorProp` 类型与运行时 prop。
  - 在 `VueGridLayout` 中通过薄适配绑定 `useGridEditor({ kind: 'layout', layout: toRef(state, 'layout'), ... })`，并接入现有 `onLayoutMaybeChanged()` 提交边界。
  - 未传 `editor` 或 `editor=false` 时保持当前 drag/resize/drop、history、persistence、layoutEngine、事件和 CSS 行为不变。
  - `view` 模式下禁用编辑命令、selection UI、resize handle、drop target、keyboard editing；`edit` 模式才启用 editor 状态。
  - layout command 只在 committed result 后触发 `layoutChange`、`update:modelValue`、editor history 和 persistence；metadata-only command 不触发布局事件。
  - 将 editor blocked reason 映射到现有 `dragBlocked` / `resizeBlocked` 视觉状态，并保留 layout engine diagnostics。
  _需求追溯: R1.AC2, R1.AC3, R2.AC2, R3.AC6, R9.AC1, R9.AC2, R9.AC3, R11.AC2, R11.AC3, R12.AC1, R14.AC6_

- [x] 12. 集成 `ResponsiveVueGridLayout` 的 editor prop 与 breakpoint 语义
  - 在响应式组件 props 和类型声明中增加 `editor?: false | GridEditorProp`。
  - 响应式 editor controller 使用 `kind: 'responsive'`、完整 `layouts`、当前 breakpoint 和 responsive persistence bridge。
  - breakpoint 切换后保持 selection、metadata 和 focus 不错配；无效 selection 必须清理。
  - 避免把 responsive-only editor config 错误透传给内层单布局组件；只传 scoped controller 或必要的 view/edit 状态。
  - responsive layout command 提交后继续 emit `update:layouts`、`layoutChange`，并且 metadata-only command 不触发布局事件。
  _需求追溯: R1.AC2, R1.AC3, R5.AC4, R10.AC1, R11.AC1, R11.AC2, R11.AC3, R11.AC5, R14.AC6_

- [x] 13. 增加 editor CSS 状态类、CSS variables 与无障碍视觉状态
  - 更新 `css/styles.css`，新增 `.editor-enabled`、`.editor-mode-view`、`.editor-mode-edit`、`.editor-selected`、`.editor-active`、`.editor-hovered`、`.editor-locked`、`.editor-hidden`、`.editor-readonly`、`.editor-keyboard-editing`、`.editor-drop-target`、guide class 等稳定契约。
  - 新增 `--vgl-editor-selection-outline`、`--vgl-editor-focus-ring`、`--vgl-editor-guide-color`、`--vgl-editor-spacing-guide-color`、`--vgl-editor-locked-opacity`、`--vgl-editor-hidden-opacity`、`--vgl-editor-dirty-color` 等变量。
  - 确保 selected、active、focus、locked、hidden、blocked、readonly 状态不只依赖颜色，并通过结构化事件同时表达。
  - 桌面 resize handle 根据 item capability 隐藏或禁用特定 handle，并保持足够命中区域。
  - 自定义 item 内容时仍提供外层 editing state wrapper 或 data attribute。
  _需求追溯: R1.AC4, R7.AC3, R7.AC6, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6, R14.AC3_

- [x] 14. 补齐导出、类型声明与 README API 文档
  - 在 `lib/cjs.ts`、主入口和 `typings/index.d.ts` 导出 `useGridEditor`、`createGridEditorController`、`createGridEditorHistory`、`internalGridEditorClipboard`、`systemClipboardAdapter`、editor 类型、commands、events、metadata、guides、history 和 clipboard adapter 类型。
  - README 增加 professional editor 章节，说明 headless-first、mode/defaultMode、command model、selection、多选、metadata sidecar、`meta.editor` 原子持久化、clipboard、keyboard、guides、CSS 契约、persistence/history 边界。
  - 文档明确 `visible: false` 不是权限隔离，`meta.editor` 不应保存敏感权限数据，权限应通过业务服务端或 `beforeCommand` guard 处理。
  - 文档化事件顺序：command、layoutChange、update:modelValue/update:layouts、history、persistence、dirty state。
  _需求追溯: R1.AC4, R1.AC5, R10.AC6, R11.AC3, R13.AC4, R13.AC5, R14.AC6_

- [x] 15. 增加完整 `Professional Dashboard Editor` 示例
  - 新增示例文件并在 `example/00-list.js` 注册 `Professional Dashboard Editor`。
  - 示例包含 view/edit toggle、toolbar、dirty/save/discard/reset、undo/redo、selection、多选、keyboard editing、duplicate、delete、lock/unlock、show/hide、copy/paste、snap guides、blocked feedback 和 persistence。
  - 示例展示 save failure、外部冲突或 command blocked 时的可恢复状态，不丢失内存 layout 和 metadata。
  - 示例提供大型 layout 调试开关或 layout engine diagnostics 区域，说明 guides、scheduler、preview 和 commit 边界。
  - 示例 UI 作为可选参考，不作为核心 editor 能力的唯一入口。
  _需求追溯: R1.AC5, R10.AC3, R10.AC4, R10.AC5, R11.AC2, R13.AC1, R13.AC2, R13.AC3, R13.AC5, R14.AC5_

- [x] 16. 增加 editor 核心单元测试
  - 新增或复用 Node 测试入口，覆盖 mode/defaultMode、fail-safe view、command pipeline、`beforeCommand`、selection、多选、capability、metadata、clipboard、history、persistence bridge、guides。
  - 覆盖 metadata 校验失败、clipboard 权限失败、guard timeout、save error、conflict、orphan metadata 清理、id remap 和 guide deterministic priority。
  - 覆盖 metadata-only command 不触发 layoutChange、selection/focus command 不触发 persistence/history、layout command 只在 committed 边界提交。
  - 将 editor 单元测试纳入 `yarn test` 或新增可文档化的测试脚本。
  _需求追溯: R2.AC7, R3.AC2, R3.AC3, R3.AC5, R3.AC7, R3.AC8, R5.AC1, R5.AC5, R6.AC7, R8.AC4, R10.AC7, R14.AC1_

- [x] 17. 增加浏览器集成、可访问性与视觉回归测试
  - 覆盖 `VueGridLayout` 未传 editor 时现有行为不变。
  - 覆盖 view/edit 切换、鼠标选择、多选、drag、resize、keyboard move、keyboard resize、copy/paste、duplicate、delete、lock、save failure、discard、undo/redo、snap guides 和 external drop placeholder。
  - 覆盖 ignored keyboard targets、aria-live 接入点、Esc 取消、删除后 focus 恢复、selected/active/focus ring 可识别。
  - 使用浏览器截图验证 selection outline、locked、hidden、blocked、guide、placeholder 不遮挡内容。
  - 覆盖 `ResponsiveVueGridLayout` breakpoint 切换、selection 清理、metadata 不错配和 responsive editor config 不错误透传。
  _需求追溯: R1.AC3, R7.AC2, R7.AC3, R7.AC5, R7.AC6, R9.AC5, R11.AC5, R12.AC3, R14.AC2, R14.AC3, R14.AC5_

- [x] 18. 增加性能验证、发布回归与兼容性检查
  - 在 500+ item layout 下验证 drag、resize、keyboard move 和 guide 计算，确保满足已有 layout engine 性能预算；超预算时 guide 降级并发 diagnostics。
  - 运行或扩展 benchmark / smoke test，覆盖 guide 计算、keyboard move、metadata-only command 和 persistence bridge save。
  - 发布前运行 `yarn lint`、`npx tsc --noEmit`、`yarn build`、`yarn test`、editor 单元测试、浏览器集成测试和 professional editor 示例 smoke test。
  - 记录已知限制：group resize 暂不支持、system clipboard 权限限制、hidden 不是权限隔离、editor history 与 legacy `historyStore` 的职责边界。
  _需求追溯: R8.AC6, R9.AC2, R9.AC6, R10.AC6, R11.AC6, R14.AC4, R14.AC5, R14.AC6_

- [x] 19. 优化 smart guides 展示策略与视觉验收
  - 在 `GridEditorGuidesOptions` 中补充 `maxVisibleGuides`、`showGrid`、`showSpacingLabels`、`debug` 等展示层配置；`showGrid` 默认仅在 drag、resize 或 external drop 交互期间显示极淡网格，并保持 guide 计算本身 headless、确定性和 SSR-safe。
  - 将 guide 计算结果拆分为 full candidates 与 display guides；非 debug 模式默认 drag/drop 最多渲染 3 条 smart guides、resize 最多渲染 2 条 smart guides、spacing distance label 最多 1 个。
  - 明确 background grid lines、placement placeholder、alignment guides、spacing guides、blocked feedback 的 class/data attribute、颜色变量、非颜色区分和层级关系。
  - 优化 alignment guide：通过线段范围、端点关联或源/目标 item 轻高亮表达“对齐了谁”，避免默认使用贯穿全画布长线或批量文字标签。
  - 优化 spacing guide：只有能表达相关 item 与间距关系时才显示；命中、吸附或最相关 spacing guide 默认显示短距离标签，非命中候选不批量显示标签，避免只用无解释绿色长线。
  - 更新 `Professional Dashboard Editor` 示例，加入普通用户态与 debug guides 开关；debug mode 可查看完整候选，但必须通过独立 debug layer、debug panel 或明确 debug 标识隔离，默认视觉不得出现满屏高饱和辅助线。
  - 增加单元测试覆盖 display filtering、deterministic priority、按交互类型的显示上限、debug/full candidates 隔离、500+ item 降级与 spacing guide 标签语义。
  - 增加浏览器/截图验收，覆盖 view/edit idle 无辅助线、drag/drop 不超过 3 条 guides、resize 不超过 2 条 guides、spacing label 不超过 1 个、placeholder 视觉优先、alignment/spacing guide 可解释、非 debug 模式不遮挡内容。
  - README 文档化 smart guides 与 grid lines 的区别、蓝/绿/blocked 语义、默认上限、debug mode 和反向验收标准。
  _需求追溯: R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC6, R9.AC1, R9.AC3, R9.AC5, R12.AC1, R12.AC2, R12.AC3, R12.AC5, R13.AC1, R13.AC3, R13.AC4, R14.AC2, R14.AC4, R14.AC5, R15.AC1, R15.AC2, R15.AC3, R15.AC4, R15.AC5, R15.AC6, R15.AC7, R15.AC8_

- [x] 20. 升级 guides 算法为预测式 + 锚点裁剪 + section/row mate
  - 收口说明 (2026-05-25): 已由 `professional-dashboard-editor-l3-intelligence` 覆盖/取代，主要对应 L3 tasks 1-5、12、15-17；不再在本 UX spec 中重复实现。
  - 在 `lib/editor/types.ts` 新增 `GridEditorSpacingChip`、`GridEditorMeasurementHud`、`GridEditorGuideAnchorEdge` 类型，并在 `GridEditorGuide` 上新增 `proximity`、`anchorIds`、`isPredictive` 字段；在 `GridEditorGuideState` 上新增 `spacingChips`、`measurementHud`、`anchorEdges`。
  - 在 `GridEditorGuidesOptions` 新增 `predictRadiusX`（默认 2）、`predictRadiusY`（默认 1）、`snapThresholdCells`（默认 0.5）、`showSpacingChips`、`showMeasurementHud`、`highlightAlignmentTargets`、`detectEqualSpacing`、`sectionSnap`、`spacingChipMinDistance`；保留 `thresholdPx` 作为兼容入口。
  - 重写 `lib/editor/guides.ts`：alignment guide 在 predict radius 内 emit 全部候选；为每条 guide 计算 `proximity ∈ [0,1]`、是否 snapped；裁剪 guide 的 cross-axis span 到源/目标 item 的最小包络。
  - 实现 row-mate / column-mate 检测：candidate 与 layout 中其它 item 在同 `y` / `y+h` / `x` / `x+w` 边时 priority +20。
  - display filtering 升级：snapped 永远占 N 条配额，剩余按 priority + proximity + distance 排序，`maxVisibleGuides` 默认上限不变。
  - 500+ item 降级时优先保留 snapped、然后按 proximity 截断 predict 候选；diagnostics 中暴露 `predictCount`、`snappedCount`、`anchorEdgeCount`。
  - 计算保持 SSR-safe、纯函数、确定性（同 input 同 output）。
  _需求追溯: R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R15.AC4, R15.AC6, R16.AC1, R16.AC2, R16.AC3, R16.AC4, R16.AC5, R16.AC7, R16.AC8_

- [x] 21. 实现 spacing chips、measurement HUD 与等距分布检测
  - 收口说明 (2026-05-25): 已由 `professional-dashboard-editor-l3-intelligence` 覆盖/取代，主要对应 L3 tasks 2-3、8、12、15-17；不再在本 UX spec 中重复实现。
  - 在 `lib/editor/guides.ts` 新增 `computeSpacingChips()`：为 active item 的 top/right/bottom/left 各方向找最近邻居（含画布边界），按 `spacingChipMinDistance`（默认 1 cell）过滤，输出 `position`、`span`、`distance`、`unit`、`neighborId`、`isEqual`。
  - 等距检测：左右两侧 distance 相等，或上下两侧 distance 相等，或 active item 与同 axis 上 ≥2 个邻居形成等距阵列时标 `isEqual: true`，容差 0.01 cell。
  - 新增 `computeMeasurementHud()`：根据 candidate item、interaction、blocked reason 输出 itemId / label / position / size / delta / interaction / blocked。
  - 在 `computeGridEditorGuides()` 中根据 `showSpacingChips` / `showMeasurementHud` 选择性输出；HUD payload 即使在 blocked 状态也要输出 reason 文本。
  - 暴露 `anchorEdges`：snapped guide 与最高 proximity 的 predict guide 各取一条，把源 item 与 active item 被对齐的边记录下来。
  - 计算结果在大 layout（500+ item）下不得阻塞 pointer feedback，必要时降级（spacing chips 计算 O(n)，HUD O(1)）。
  _需求追溯: R7.AC5, R7.AC6, R8.AC1, R8.AC6, R9.AC3, R15.AC4, R15.AC5, R16.AC4, R17.AC1, R17.AC2, R17.AC3, R17.AC4, R17.AC5, R17.AC6, R17.AC7, R17.AC8_

- [x] 22. 渲染层、CSS 重制、demo 与测试覆盖
  - 收口说明 (2026-05-25): 已由 `professional-dashboard-editor-l3-intelligence` 覆盖/取代，主要对应 L3 tasks 12-17；不再在本 UX spec 中重复实现。
  - 在 `lib/VueGridLayout.tsx` 新增 spacing chips、measurement HUD、anchor edges 渲染节点；guide DOM 增加 `data-guide-state="predict|snapped"`、`data-proximity` 属性，并按 proximity 设置 inline opacity。
  - 在 `css/styles.css` 重制色板：alignment guide 改为 Figma 风粉红（`--vgl-editor-guide-color`），新增 `--vgl-editor-guide-predict`、`--vgl-editor-guide-snapped`、`--vgl-editor-anchor-edge`、`--vgl-editor-spacing-equal`、`--vgl-editor-placeholder-bg`、`--vgl-editor-hud-bg` 等变量；强化 `.vue-grid-placeholder` 为实色幽灵卡 + 角标位置标签；新增 `.vue-grid-editor-spacing-chip`、`.vue-grid-editor-measurement-hud`、`.vue-grid-editor-anchor-edge` 样式与 80ms snap pulse 关键帧；`prefers-reduced-motion` 下禁用 pulse 与跟随动画。
  - 更新 `example/23-professional-dashboard-editor.js`，暴露 predict guides / chips / HUD / section snap toggle，默认全开；增加状态栏显示当前 active 的 measurement HUD 内容。
  - 扩展 `test/editor-core.test.ts`：覆盖 proximity 计算、predict 半径裁剪、anchor edges 输出、row-mate priority 加权、spacing chip 距离阈值与等距检测、HUD payload 字段、reduced-motion 不影响计算输出、500+ item predict 降级 diagnostics。
  - 更新 `test/editor-component-browser.test.js` 的浏览器 smoke：拖动后 DOM 上至少出现 1 个 `.vue-grid-editor-spacing-chip`、1 个 `.vue-grid-editor-measurement-hud`、guide DOM 上 `data-guide-state` 同时存在 predict 与 snapped；view 模式下三者均不出现。
  - README 增补 predictive guides + spacing chips + HUD 章节，列出 toggle、CSS 变量、视觉反向验收清单。
  _需求追溯: R12.AC1, R12.AC2, R12.AC3, R12.AC4, R13.AC1, R13.AC4, R14.AC2, R14.AC4, R15.AC4, R15.AC6, R16.AC2, R16.AC3, R16.AC4, R16.AC6, R16.AC8, R17.AC1, R17.AC2, R17.AC3, R17.AC4, R17.AC8_
