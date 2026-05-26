# Dashboard Editor Shell Widget Placement Policies 实现任务

- [x] 1. 扩展 placement strategy 公共类型与 action options
  - 在 `lib/dashboard-editor-shell/types.ts` 新增 `DashboardEditorShellPlacementStrategy`、`DashboardEditorShellPlacementOptions`、`DashboardEditorShellAddWidgetOptions`，并让 paste、palette、add、reference paste、drop action 统一接收策略。
  - 将 `GridEditorPasteStrategy` 扩展为包含 `insert-top-shift`，并保持 `cursor`、`nearest-fit`、`first-fit`、`offset` 的现有语义。
  - 同步 `typings/index.d.ts` 中的 shell action signatures、strategy union、palette/add/drop options 和 result sidecar 类型。
  - 保持未传 strategy 时的现有默认行为，避免旧调用方突然变成顶部插入或整体下移。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R7.AC1, R7.AC3, R7.AC5, R7.AC6_

- [x] 2. 提取并实现 editor placement helper
  - 从 `lib/editor/controller.ts` 提取 `placeNewItems()` 到可测试的 `lib/editor/placement.ts` 或等价模块，并让 controller 继续通过同一 helper 处理 add/paste/duplicate placement。
  - 实现 `first-fit`：基于完整 active layout 从 `{ x: 0, y: 0 }` 开始按行扫描，首行未满向右，首行满后换行；hidden/static/locked 和未渲染但仍属于 active layout 的 items 默认占位。
  - 实现 `insert-top-shift`：把新增 item 或新增 group 放到左上角，将全部现有 items 按新增 group 高度整体下移，static/locked 只参与本次 layout-level reflow，不改变直接编辑权限。
  - 为 `insert-top-shift` 增加 bounds、collision、maxRows、非法尺寸和多 item group 校验；任何失败都返回 blocked/failed，不提交部分 layout。
  - 让 placement helper 产出 strategy、placementSource、insertedIds、shiftedIds、delta、diagnostics 和 patches 所需信息。
  _需求追溯: R1.AC4, R1.AC5, R1.AC6, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7, R2.AC8, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R3.AC8, R7.AC1, R7.AC2, R7.AC4_

- [x] 3. 将 shell 新增入口统一接入 placement strategy
  - 在 `useDashboardEditorShell.ts` 增加 strategy normalization 与 placement position helper，让 `first-fit` 和 `insert-top-shift` 不依赖示例传入底部 insertion position。
  - 更新 `pasteWidget`、`pasteWidgetReference`、`openWidgetPalette`、`addWidgetFromTemplate`、`handleExternalDrop`，统一透传 strategy、cols、maxRows、itemSize、list 和 position metadata。
  - `openWidgetPalette` 自动添加 palette 返回模板时，将 palette options 的 strategy 透传到 `addWidgetFromTemplate`。
  - drop preview 不执行 `insert-top-shift` 全量下移；只有 final drop/add commit 才运行策略。
  - 在 `DashboardEditorShellActionResult.data` 中填充 placement summary，并把 blocked reason 与 diagnostics 稳定输出。
  _需求追溯: R1.AC1, R1.AC4, R1.AC5, R1.AC6, R1.AC7, R6.AC1, R7.AC1, R7.AC2, R7.AC4_

- [x] 4. 强化 adapter transaction 与 profile write-back 原子性
  - 审查 `runDashboardEditorShellTransaction()` 与 `writeBackLayout()`，确保 adapter prepare、editor placement、dashboard write-back、adapter commit、rollback 的阶段状态清晰。
  - 对 placement blocked、maxRows blocked、missing profile、write-back failure、guard blocked、adapter prepare failure、adapter commit failure 增加 all-or-nothing 行为与 rollback/compensation 测试支撑。
  - 避免 adapter commit 失败时对外报告成功；必要时将 internal document update/documentChange 发射调整到最终成功之后，防止部分 document mutation 泄漏。
  - 确保 controlled document 只返回 proposed document/update event，不自动持久化；非 controlled 内部 document 也只在完整成功后更新。
  - 保持 diagnostics 只记录 adapter stage、ids、error code，不记录 opaque/payload/businessPayload。
  _需求追溯: R1.AC6, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R7.AC4_

- [x] 5. 更新 menu descriptor、keyboard 和默认策略配置
  - 在 `DashboardEditorShellMenuOptions` 增加 add/reference paste 的默认 strategy 配置，并把 strategy 写入 menu descriptor metadata。
  - 更新 dashboard context menu 中 add widget、open palette、paste reference 的 action callback，使其通过同一个 shell action pipeline 传递 strategy。
  - 保持 menu descriptor 的 enabled/disabled/reason 语义，策略不可用或 readonly 时返回可解释 reason。
  - 更新 keyboard/open palette 入口，确保快捷键触发 add/paste/reference 时与 toolbar/context menu 返回同形状 result。
  _需求追溯: R1.AC4, R1.AC5, R6.AC1, R6.AC2, R7.AC4_

- [x] 6. 重做企业级示例的策略展示和噪音清理
  - 在 `example/25-dashboard-editor-shell.js` 中把 Add widget 改为显式使用公共 `strategy`，默认展示 `first-fit`，并提供 `first-fit` / `insert-top-shift` 策略切换。
  - 移除 Add widget 对底部 `insertionPosition` 的依赖，让示例不再自行决定最终落点。
  - 增加或保留 Move all up/down 两个入口，统一调用 `moveAllWidgets(0, -1)` 与 `moveAllWidgets(0, 1)`。
  - 清理与本例核心能力无关的信息，保留策略选择、当前布局变化、last result、adapter/write-back 阶段和 blocked diagnostics。
  - 视觉风格按企业级组件库处理，但不把示例样式、文案或 Fluent-like UI 变成公共 API。
  _需求追溯: R1.AC7, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7, R8.AC5, R8.AC6_

- [x] 7. 编写 editor placement 单元测试
  - 扩展 `test/editor-core.test.ts` 或新增 focused placement test，覆盖 `first-fit` 空首行、首行未满向右、首行满后换行、不同 item 尺寸、hidden/static/locked 占位、maxRows blocked。
  - 覆盖 `insert-top-shift` 空 layout、顶部占用、全部 widgets 下移、static/locked 随 reflow 下移、多 item group、局部空洞、maxRows blocked、collision unresolved。
  - 断言 blocked 时 layout 不变，成功时 affectedIds、patches、shiftedIds、delta 和 diagnostics 稳定。
  - 保留现有 cursor、nearest-fit、offset、editor paste first-fit 行为回归，确保兼容性不被破坏。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7, R2.AC8, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R3.AC8, R7.AC1, R7.AC2, R7.AC4, R8.AC1, R8.AC2_

- [x] 8. 编写 shell、transaction 与 responsive write-back 测试
  - 扩展 `test/dashboard-editor-shell-core.test.ts`，覆盖 `addWidgetFromTemplate`、`openWidgetPalette`、`pasteWidgetReference`、`handleExternalDrop` 对 strategy 的透传与 result shape。
  - 覆盖 adapter prepare failure、placement failure rollback、write-back failure rollback、commit failure、commit success、id mapping 和敏感 payload diagnostics 过滤。
  - 扩展 dashboard responsive tests，覆盖 default layout、profile override、missing profile create/block、list/mobile write-back、unknown field preservation 和 profile-scoped `insert-top-shift`。
  - 确认 maxRows 或 write-back blocked 时不会创建孤立业务 payload，也不会污染 default layout 或其他 profiles。
  _需求追溯: R1.AC1, R1.AC5, R1.AC6, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R7.AC3, R7.AC4, R8.AC3, R8.AC4_

- [x] 9. 更新类型、导出、文档和示例浏览器测试
  - 更新 `test/dashboard-editor-shell-types.test.ts`，覆盖 `DashboardEditorShellPlacementStrategy`、add/palette/reference/drop options、placement result sidecar 和 public imports。
  - 更新 CJS/ESM/type export smoke，确认新增类型和现有 shell namespace 不破坏旧导出。
  - 扩展 `test/dashboard-editor-shell-browser.test.js`，验证 Add widget policy selector、toolbar/context menu 行为、Move all up/down、last result panel 和实际布局落点。
  - 更新 README 或相关 docs，解释 `first-fit`、`insert-top-shift`、static/locked/hidden 处理、maxRows 失败语义、事务边界，以及为什么能力在 shell/component 层而不是示例层。
  _需求追溯: R1.AC2, R1.AC3, R1.AC7, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R8.AC5, R8.AC6_

- [x] 10. 运行回归验证并整理实现结果
  - 运行 editor、dashboard-editor-shell、dashboard responsive、types、browser smoke 和 build 相关命令。
  - 若仓库脚本与设计中的建议命令不一致，按 `package.json` 实际脚本调整，并记录无法运行的缺口。
  - 对照 requirements/design 检查 action defaults、失败原子性、profile write-back、示例噪音清理和兼容性。
  - 在实现总结中列出通过的测试、未覆盖风险和任何需要后续 spec 的非目标。
  _需求追溯: R1.AC2, R1.AC5, R1.AC6, R4.AC2, R4.AC4, R5.AC6, R7.AC1, R7.AC4, R8.AC7_
