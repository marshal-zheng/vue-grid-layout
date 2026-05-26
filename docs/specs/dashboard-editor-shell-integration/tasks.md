# Dashboard Editor Shell Integration 实现任务

- [x] 1. 搭建 dashboard editor shell 模块和基础类型骨架
  - 新增 `lib/dashboard-editor-shell/`，包含 `types.ts`、`position.ts`、`transactions.ts`、`menus.ts`、`useDashboardEditorShell.ts` 和 `index.ts`。
  - 在 `types.ts` 中定义 options/state/actions/result/event/diagnostic、menu descriptor、position、availability、adapter context、transaction stage 和 cleanup 类型。
  - 建立稳定 action id、status、source、blocked reason、diagnostic code 与 JSON-safe metadata 约定，避免每个 action 各自发明 result shape。
  - 确认 shell 模块不修改 `VueGridLayout`、`ResponsiveVueGridLayout`、`DashboardResponsiveVueGridLayout`、dashboard schema 或 editor controller 的既有 public contract。
  - _需求追溯: R1.AC1, R1.AC2, R1.AC5, R1.AC6, R1.AC7, R12.AC1, R12.AC3, R12.AC4, R12.AC5, R12.AC6, R13.AC1, R13.AC4, R13.AC6_

- [x] 2. 实现 `useDashboardEditorShell()` 的 runtime/editor 绑定和生命周期
  - 接收 document/ref、`DashboardResponsiveProfileModel` 或 `DashboardResponsiveRuntime`、`GridEditorController`、grid/root DOM ref、mode、profile context、adapter 配置和事件回调。
  - 从 responsive runtime 同步暴露 layoutId、requestedBreakpoint、resolvedProfileId、targetView、viewFormat、gridSettings、heightRuntime、active/render/hidden item ids 和 diagnostics。
  - 从 editor controller 同步 selection、mode、dirty、conflict、last command result 和 toolbar availability，不复制第二套 selection 或 dirty state。
  - 实现 degraded state：缺 editor/runtime/grid element 时仍可创建 shell，不可执行 action 返回 structured blocked/error result。
  - 实现 controlled-first document ownership：受控输入只发 proposed document/update event，非受控内部 ref 才可在 action 成功后更新。
  - 实现 `stop()` 与组件卸载 cleanup，清理 watcher、DOM listener、keyboard binding、highlight/scroll timer、adapter subscription 和 transient menu state。
  - _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7, R1.AC2, R1.AC5, R12.AC8, R13.AC4_

- [x] 3. 实现 pointer/event/fallback 到 grid/list position helper
  - 在 `position.ts` 中实现 `getEventGridPosition()`、`resolveShellPosition()` 和 list insertion helper。
  - 对 pointer/mouse/contextmenu/touch event 使用事件坐标，结合 DOM rect、scroll offset、width、cols、margin、containerPadding、rowHeight、height runtime 和 `calcXY()` 计算整数 grid position。
  - 对 keyboard 或无坐标来源按 active item、selection bounds、last menu position、last pointer position、viewport center、caller fallback 的顺序解析。
  - 对负数、超列、非法数字、缺 DOM、缺 runtime 做 clamp 或 blocked result，禁止向 editor command 传入非法坐标。
  - 支持 `viewFormat: "list"` 的 insertion context，返回 listIndex/beforeId/afterId，不把 mobile/list-only 排序字段写入 `LayoutItem`。
  - _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R4.AC1, R4.AC7, R9.AC4, R11.AC3_

- [x] 4. 实现 action lifecycle、diagnostics 和 transaction coordinator
  - 在 `transactions.ts` 中实现 prepare -> editor/dashboard mutation -> commit -> rollback/compensation 的统一 coordinator。
  - 为所有 action 生成 start/success/blocked/cancelled/error/cleanup event，并关联 action type、source、item ids、profile context、position source、editor command result、adapter result 和 diagnostics。
  - 统一 blocked/error reason 与 recoverable hint，覆盖 readonly、capability、locked、hidden、missing item、clipboard、adapter、validation、profile write-back、collision、bounds、confirm cancel 和 guard block。
  - 保证 diagnostics JSON-safe、稳定顺序、默认不记录 adapter opaque payload，只记录 status、ids、error code 和 source/path metadata。
  - 保证 shell action 产生 proposed/new document 后不自动持久化，只发 result、documentChange/update request 或 proposed document event。
  - _需求追溯: R7.AC6, R8.AC6, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6, R12.AC7, R12.AC8, R2.AC7_

- [x] 5. 实现 paste-at-pointer 与 profile-scoped write-back pipeline
  - 实现 `pasteAtEvent()` 和 `pasteAtGridPosition()`，通过 editor `paste` command 传入 `strategy: "cursor"`、cols、x/y/list insertion context 和 source metadata。
  - 复用 editor placement、layout engine fit/nearest-fit/first-fit fallback 和 command diagnostics，不复制 placement 算法。
  - 对 dashboard responsive profile 调用 existing model/write-back 边界，确保只写目标 profile 或 default layout，不污染其他 profiles。
  - 支持 context menu、keyboard、toolbar、API、palette/drop 共用同一个 paste action 和同形状 result/event payload。
  - 处理 clipboard 空、权限失败、payload 非法、adapter 拒绝、multi-item relative placement 和 list/mobile write-back。
  - _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R4.AC7, R1.AC3, R1.AC4, R12.AC2, R12.AC4_

- [x] 6. 实现 selection、highlight 和 scroll-to-item actions
  - 实现 `selectItem()`，通过 editor select command/controller API 更新 selection 并返回 command result。
  - 实现 `highlightItem()` 和 `resetHighlight()`，只更新 transient shell state，不写 document、`LayoutItem`、`editorMetaById`、history 或 persistence。
  - 实现 `scrollToItem()`，客户端安全路径中查找 item DOM node，结合 container、targetView、height runtime 和 caller options 滚动。
  - 对 hidden/unrendered、missing item、DOM 未挂载、grid element 缺失返回 structured blocked/degraded result，必要时发 reveal/request event。
  - 为 selection/highlight/scroll 成功、失败和阻止状态发出结构化 shell event。
  - _需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R2.AC4, R2.AC5, R2.AC6, R12.AC1, R12.AC4, R12.AC5_

- [x] 7. 实现 dashboard/widget context menu descriptor builder
  - 实现 `prepareDashboardContextMenu()`，覆盖 paste、paste reference、add widget、open palette、move all widgets、dashboard settings hook 和 caller custom items。
  - 实现 `prepareWidgetContextMenu()`，覆盖 select、edit hook、copy widget、copy reference、duplicate、remove、replace reference with widget copy、scroll/highlight 和 caller custom items。
  - descriptor 只输出 plain data 和 action callbacks，包括 id、label/labelKey、icon、shortcut、enabled、checked、danger、hidden、reason、target、metadata、children。
  - 使用 mode、readonly、editor `canExecute()`、locked/static/hidden、clipboard、reference adapter availability 和 policy guard 决定 disabled/hidden/reason。
  - menu action 必须调用同一 shell action pipeline，并存储/清理 last menu position 作为 paste fallback。
  - _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7, R1.AC1, R1.AC6, R11.AC7_

- [x] 8. 实现 widget copy/paste/duplicate/remove adapter orchestration
  - 实现 `copyWidget()` 和 multi-selection copy，复用 editor copy command，并调用 optional widget adapter 复制业务 payload。
  - 实现 `pasteWidget()`，复用 paste-at-pointer placement，并在 adapter 存在时 prepare 业务 widget payload/id。
  - 实现 `duplicateWidget()`，复用 editor duplicate command，并通过 adapter/idGenerator/id mapping 生成稳定唯一业务 id。
  - 实现 `removeWidget()`，先执行 confirm hook，再执行 editor delete/remove pipeline 和 widget adapter removal transaction。
  - 对无 adapter 场景保持普通 layout/editor metadata 操作可用，并在 diagnostics 标记 business payload 未处理。
  - 对 confirm cancel/block/timeout/error、adapter failure、id 冲突和 partial failure 保持 all-or-nothing result。
  - _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R7.AC8, R4.AC4, R12.AC3, R12.AC4, R12.AC7_

- [x] 9. 实现 reference adapter、paste reference 和 replace reference actions
  - 定义并实现 reference adapter availability/copy/paste/replace/commit/rollback contract。
  - 实现 `copyWidgetReference()`，通过 adapter 创建 opaque reference payload，不要求 `LayoutItem` 或 dashboard item schema 内置 reference 字段。
  - 实现 `pasteWidgetReference()`，使用 pointer/list helper 计算目标位置，通过 adapter 创建 reference widget/document mutation，再走 dashboard/profile write-back。
  - 实现 `replaceReferenceWithWidgetCopy()`，保持几何位置、selection、highlight 和 profile context 可预测。
  - 对缺 adapter、不可用 action、非法 payload、重复 id、unknown item、validation error、rejected promise 返回 structured unsupported/blocked/error result。
  - 成功 result 暴露 source item id、new item id、layout/profile context、adapter payload metadata 和 affected ids，但不记录敏感 payload 内容。
  - _需求追溯: R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R8.AC7, R8.AC8, R6.AC4, R12.AC3, R12.AC6, R12.AC7_

- [x] 10. 实现 empty dashboard add、widget palette 和 external drop integration
  - 根据 active/render item ids 与 edit mode 暴露 empty dashboard add affordance state、reason、target layout/profile context 和 recommended descriptors。
  - 实现 `openWidgetPalette()`，只触发 caller-provided palette hook/event，不内置 catalog、搜索、分类、配置器或 palette UI。
  - 实现 `addWidgetFromTemplate()`，对 palette 返回的 template/payload 使用 widget adapter、id generator、position helper 和 editor/layout placement 添加新 item。
  - 实现 `handleExternalDrop()`，接收 drop payload、计算 candidate position、支持 preview/final add，并与现有 `drop` / `dropDragOver` / editor placeholder 边界兼容。
  - 对 collision、bounds、maxRows、missing profile write-back、invalid template、adapter unavailable 和 permission guard 返回 blocked/error，避免孤立业务 payload。
  - add/drop 成功后选中新 item，可选高亮/滚动，并发出 new item id、profile context、placement source 和 diagnostics。
  - _需求追溯: R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R9.AC7, R3.AC1, R3.AC5, R4.AC2, R7.AC6, R12.AC4_

- [x] 11. 实现 move-all-widgets 和 bulk shell operations
  - 实现 `moveAllWidgets(dx, dy)`，复用 `translateDashboardLayout()`、layout engine `translateLayout` 或 existing dashboard migration capability。
  - 按已有 translate clamp 策略处理负坐标，并在 diagnostics 中记录 requested/applied delta。
  - 对 collision、bounds、maxRows 按 repair policy 修复或返回 blocked/unresolved result。
  - 保证 default layout 与 profile overrides 的作用域隔离，不污染其他 profiles。
  - 成功 result 返回 affected ids、patches、repair/migration diagnostics、document change event，并保持 selection/highlight/scroll target 的相对语义。
  - 对 bulk delete/copy/hide/show/lock/unlock 复用 editor command availability 和 `beforeCommand` guard，支持 all-or-nothing 与 skip-blocked result。
  - _需求追溯: R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC5, R10.AC6, R10.AC7, R1.AC4, R12.AC2, R12.AC4_

- [x] 12. 实现 keyboard、focus 与 shortcut integration
  - 实现 configurable shortcut map，支持 copy widget、copy reference、paste at last pointer/focus position、paste reference、delete/remove、open context menu、open palette 和 move-all trigger。
  - 默认忽略 input、textarea、select、contenteditable 和 caller-configured ignored target，避免拦截文本编辑。
  - keyboard paste 无 pointer 时使用 active item、selection bounds、last menu position、last pointer position 或 viewport center fallback，并记录 position source。
  - keyboard action 必须走 shell action -> editor command/history/persistence 边界，不直接修改 document。
  - 对 blocked/cancelled/error 调用 optional aria/toast/message hook，并返回 structured result。
  - 支持 `bindKeyboard()` cleanup，避免与现有 editor keyboard binding 重复执行同一 command；descriptor shortcut 与实际 binding 从同一配置派生或校验。
  - _需求追溯: R11.AC1, R11.AC2, R11.AC3, R11.AC4, R11.AC5, R11.AC6, R11.AC7, R3.AC3, R4.AC4, R12.AC1_

- [x] 13. 更新 public exports、CJS 和 TypeScript typings
  - 从 `lib/dashboard-editor-shell/index.ts` 导出 `useDashboardEditorShell()`、position helper、menu descriptor、options/state/actions/result/event/diagnostic、widget adapter 和 reference adapter 类型。
  - 更新 `lib/cjs.ts`，暴露 `dashboardEditorShell` namespace 和常用顶层 helper，不破坏现有 dashboard/editor exports。
  - 更新 `typings/index.d.ts`，确保 DOM/event/adapter callback 类型可 nullable/SSR-safe，并与 editor command result、dashboard write result、layout operation result 可组合。
  - 增加类型 smoke test，覆盖 ESM/CJS-like 导入、namespace、helper、adapter、menu/action result 和 `DashboardEditorShellDocumentChangeEvent`。
  - 保持命名与本库长期 API 风格一致，通过 adapter/helper 映射 ThingsBoard-style 概念，不强制 Angular/Gridster 命名。
  - _需求追溯: R13.AC1, R13.AC2, R13.AC3, R13.AC4, R13.AC5, R13.AC6, R1.AC5, R14.AC7_

- [x] 14. 更新示例和 README/docs
  - 扩展或新增 professional dashboard editor 示例，演示 context menu descriptor、paste at pointer、select/highlight/scroll、empty add、palette hook、copy/paste widget、copy/paste reference mock、replace reference mock、remove confirm hook 和 move all widgets。
  - 示例中的菜单、弹窗、palette、图标、文案和样式只作为示例 UI，不进入 shell public API。
  - 更新 README 或 docs，说明 shell 与 `VueGridLayout`、`DashboardResponsiveVueGridLayout`、editor controller、dashboard document、responsive profile、migration/repair、widget adapter 和 reference adapter 的关系。
  - 在文档中明确 controlled-first、no autosave、opaque adapter payload、transient highlight、SSR degraded result 和 transaction 顺序。
  - _需求追溯: R14.AC1, R14.AC2, R14.AC3, R1.AC1, R1.AC6, R5.AC2, R7.AC6, R8.AC8, R12.AC8_

- [x] 15. 编写 shell 单元测试
  - 新增 dashboard editor shell core test，覆盖 position helper、menu descriptor availability、paste-at-pointer payload、selection/highlight transient state、scroll degraded result、widget adapter transaction、reference adapter unsupported/error 和 diagnostics stability。
  - 覆盖 transaction 顺序、prepare block、editor blocked、write-back error、commit error、rollback/compensation、no autosave 和 controlled-first documentChange。
  - 覆盖 SSR/degraded state、missing editor/runtime/grid element、JSON-safe diagnostics、opaque payload 不泄漏、confirm cancel 和 id mapping。
  - 将单测挂入合适 runner，或新增 `test/run-dashboard-editor-shell-tests.js` 并在 package script 中衔接。
  - _需求追溯: R14.AC4, R2.AC5, R2.AC6, R2.AC7, R3.AC1, R3.AC4, R4.AC1, R5.AC2, R6.AC4, R7.AC5, R7.AC6, R8.AC5, R8.AC6, R12.AC5, R12.AC6, R12.AC8_

- [x] 16. 编写浏览器、dashboard integration 和导出回归测试
  - 新增或扩展浏览器测试，覆盖 contextmenu event 到 menu descriptor、paste at pointer 实际落位、empty dashboard add、scroll/highlight DOM state、keyboard paste fallback、menu cleanup 和 view/edit mode gating。
  - 新增 dashboard integration 测试，覆盖 profile-scoped paste/add/remove/move-all write-back、missing profile blocking、list/mobile position mapping、unknown field preservation 和失败不覆盖原 document。
  - 覆盖 external drop、palette add、reference paste/replace mock、move-all repair diagnostics、hidden/unrendered item blocked result。
  - 覆盖 CJS/ESM/types exports 与 existing dashboard/editor exports 兼容。
  - 运行相关 editor、dashboard、dashboard responsive、layout migration、browser smoke、typing/export 和 build/test command；无法运行的验证缺口记录到任务结果或实现说明中。
  - _需求追溯: R14.AC5, R14.AC6, R14.AC7, R14.AC8, R4.AC3, R4.AC7, R5.AC4, R5.AC5, R6.AC7, R8.AC3, R8.AC4, R9.AC4, R9.AC6, R10.AC4, R10.AC5, R11.AC3_

- [x] 17. 修复 dashboard responsive write-back 缺失 document 时的 JSON clone 回归
  - 修复 `writeDashboardResponsiveRuntimeToDocument()` 在 invalid/undefined document 分支中对原始 payload 做 `JSON.parse(JSON.stringify(value))` 时抛出 `"undefined" is not valid JSON` 的问题。
  - 保持缺失 document 场景返回 structured `ok: false`、`invalid-document` error 和 `projection-validation-failed` diagnostic，而不是在 `onLayoutChange` promise 链上抛出未捕获异常。
  - 增加 dashboard responsive write-back 回归单测，覆盖 missing document 不抛错并返回可诊断失败结果。
  - 重新运行 dashboard、dashboard editor shell 和完整 `npm test` 验证。
  - _需求追溯: R2.AC6, R12.AC4, R12.AC5, R14.AC8_
