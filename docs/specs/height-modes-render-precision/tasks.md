# Height Modes & Render Precision 实现任务

- [x] 1. 新增 `grid-height` 基础 runtime 模块
  - 新建 `lib/grid-height/types.ts`、`lib/grid-height/resolve.ts`、`lib/grid-height/index.ts`。
  - 定义 `GridHeightMode`、`GridRenderPrecision`、height source、rowHeight source、diagnostic code、resolver options/result 和 `GridHeightRuntime` 类型。
  - 实现 `resolveGridHeightRuntime()`，支持 `auto`、`fixed`、`scroll`、`fit`、`autoSize` 兼容映射、container height 优先级、empty fit、`minRowHeight` fallback 和非法输入 fallback。
  - 保证 resolver 不依赖 Vue、DOM 或 dashboard document，输入相同输出稳定，diagnostics JSON-safe 且顺序稳定。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R3.AC8, R3.AC9, R3.AC10, R9.AC1, R9.AC3, R9.AC4, R9.AC5_

- [x] 2. 改造像素计算与 render precision 策略
  - 在 `lib/calculateUtils.ts` 增加 `applyRenderPrecision()`，并让 `PositionParams` 支持 `renderPrecision`。
  - 改造 `calcGridItemWHPx()` 和 `calcGridItemPosition()`，使 `left/top/width/height` 按 `integer` 或 `subpixel` 输出。
  - 保持 `calcXY()`、`calcWH()`、drag/resize commit、collision、compact、layout engine 和 persistence 的整数 grid units 语义不变。
  - 更新 `lib/grid-item/gridItemStyle.ts`，确保 transform 和 top/left 两条样式路径只格式化 position，不额外破坏 precision。
  _需求追溯: R1.AC4, R1.AC6, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R10.AC6_

- [x] 3. 扩展基础 `VueGridLayout` props、emits 与类型契约
  - 在 `lib/VueGridLayoutPropTypes.ts` 增加 `heightMode`、`containerHeight`、`autoMeasureContainerHeight`、`minRowHeight`、`renderPrecision` props 和 validator。
  - 在 `lib/grid-layout/contract.ts` 增加 `heightRuntimeChange` emit 与事件 handler key 支持。
  - 确认不向 `LayoutItem`、layout persistence document 或 layout engine operation schema 增加 height/precision 字段。
  - 更新 public prop 类型，保持未传新 props 时现有 API 与默认行为兼容。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC5, R1.AC7, R10.AC1, R10.AC2_

- [x] 4. 实现可选父容器高度测量 composable
  - 新增 `lib/grid-height/useContainerHeightMeasurement.ts`，仅在 `autoMeasureContainerHeight: true` 时启用。
  - 默认测量 grid 根节点父容器的 content box，高度来源不使用 grid 根节点自身，避免 `fit` 自引用。
  - 处理 parent 缺失、隐藏、0 高度、非法高度、ResizeObserver 不可用等场景，输出 diagnostics 并允许 fallback 渲染。
  - 在 target 改变、禁用测量和组件卸载时清理 ResizeObserver、定时器和订阅。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R4.AC7_

- [x] 5. 将 height runtime 接入 `VueGridLayout`
  - 在 `lib/VueGridLayout.tsx` 内创建 root ref，兼容外部 `innerRef`，并消费 `useContainerHeightMeasurement()`。
  - 用 `resolveGridHeightRuntime()` 替代当前内联 `containerHeight()`，将 root `height` 和 `overflow` 由 height runtime 输出。
  - 将 resolved `rowHeight`、`renderPrecision`、container height context 传给普通 item、placeholder、dropping item、drop interactions 和 editor runtime。
  - 对 height runtime signature 做去重，在 mounted 后和后续变化时发出 `heightRuntimeChange`，但不触发 `layoutChange`、`update:modelValue` 或 persistence commit。
  _需求追溯: R1.AC2, R1.AC3, R1.AC7, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC6, R3.AC7, R3.AC8, R3.AC9, R4.AC4, R6.AC5, R8.AC2_

- [x] 6. 统一 item、placeholder、drop preview 与 editor overlay 几何输入
  - 更新 `lib/GridItem.tsx`、`lib/grid-item/useGridItemDrag.ts`、`lib/grid-item/useGridItemResize.ts`，使位置、bounded 约束和 resize constraints 使用 resolved rowHeight/precision。
  - 更新 `lib/grid-layout/useGridDropInteractions.ts`，使 cursor drop 和 auto drop preview 使用 resolved rowHeight。
  - 更新 `lib/grid-layout/GridEditorOverlay.tsx`，让 grid lines、guides、spans、item rect helpers 使用 resolved rowHeight 和 precision。
  - 更新 `lib/grid-layout/useGridEditorRuntime.ts` 和相关 guide/intelligence 调用路径，避免继续读取原始 `props.rowHeight` 作为像素几何来源。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R5.AC4, R5.AC5, R11.AC5_

- [x] 7. 扩展 dashboard grid settings schema 与校验/导入导出
  - 在 `lib/dashboard.ts` 的 `DashboardGridSettings` 增加 `heightMode`、`mobileHeightMode`、`minRowHeight`、`renderPrecision`。
  - 更新 dashboard grid settings validation、sanitize、unknown-field preservation、ThingsBoard import/export 字段处理和 `ResolvedDashboardGridSettings`。
  - 对显式 mode 与 `autoFillHeight/mobileAutoFillHeight` 冲突生成可定位 diagnostics。
  - 确保新增 settings 字段不写入 `LayoutItem`，也不影响业务 widget、editor runtime state 或 persistence schema 边界。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC8, R9.AC2, R9.AC5, R12.AC5_

- [x] 8. 在 dashboard responsive resolver 中生成 height options 和 runtime state
  - 更新 `lib/dashboard-responsive/types.ts`，为 `DashboardResponsiveRuntime` 增加 `heightOptions` 和可选 `heightRuntime`。
  - 在 `lib/dashboard-responsive/resolve.ts` 增加 `resolveDashboardHeightOptions()`，合并 default/profile settings、targetView、mobileHeightMode、mobileRowHeight、auto-fill 兼容别名和 renderPrecision。
  - 保持显式组件 props 的最终优先权由组件层处理，resolver 只输出 profile-derived 默认值和 diagnostics。
  - 将 height/precision diagnostics 合并进 responsive diagnostics，复用现有稳定事件模型。
  _需求追溯: R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R8.AC1, R8.AC2, R8.AC3, R8.AC5, R8.AC6, R9.AC1, R9.AC2, R9.AC4_

- [x] 9. 接入 dashboard responsive composable 与薄组件
  - 更新 `useDashboardResponsiveProfileModel()`，增加 `onHeightRuntimeChange()`，保存最新 height runtime 并发出 `projectionChange` / `diagnosticsChange`。
  - 更新 `DashboardResponsiveVueGridLayout` props，使基础 height props 可显式传入并优先于 profile settings。
  - 将 runtime `heightOptions` 与显式 props 合并后传入内层 `VueGridLayout`，并监听内层 `heightRuntimeChange`。
  - 确保 height runtime fallback 不删除 active item、不覆盖 dashboard document、不触发 profile write-back。
  _需求追溯: R7.AC7, R8.AC1, R8.AC2, R8.AC4, R8.AC5, R8.AC6, R4.AC1, R10.AC4_

- [x] 10. 更新公共导出、CJS/ESM 和类型声明
  - 在 ESM 入口、`lib/cjs.ts`、`typings/index.d.ts` 中导出 `grid-height` 模块、resolver、diagnostic constants、height/precision 类型和 dashboard height helper。
  - 同步 `VueGridLayout`、`DashboardResponsiveVueGridLayout`、dashboard settings、responsive runtime 和 event payload 类型。
  - 增加或更新类型导出测试，确认消费者可导入新增类型和函数。
  - 检查新增导出不破坏现有 VueGridLayout、ResponsiveVueGridLayout、DashboardResponsiveVueGridLayout、persistence、editor 和 layout-engine 导出。
  _需求追溯: R10.AC1, R10.AC2, R11.AC7, R1.AC7_

- [x] 11. 增加基础 height resolver 与 precision 单元测试
  - 新增 `test/grid-height-runtime.test.ts`，覆盖 `auto`、`fixed`、`scroll`、`fit`、空 layout、缺失 container height、invalid input、`minRowHeight` fallback、decimal rowHeight 和 deterministic diagnostics。
  - 扩展 `test/grid-layout-internal-core.test.ts`，覆盖 `calcGridItemPosition()` integer/subpixel 输出差异。
  - 验证 `calcXY()`、`calcWH()`、committed `LayoutItem.x/y/w/h` 仍为整数 grid units。
  - 覆盖 diagnostics JSON-safe、稳定排序和 invalid renderPrecision fallback。
  _需求追溯: R11.AC1, R11.AC2, R2.AC2, R2.AC5, R3.AC5, R3.AC8, R3.AC9, R5.AC1, R5.AC2, R5.AC3, R5.AC7, R9.AC1, R9.AC4, R9.AC5_

- [x] 12. 增加基础组件与浏览器行为测试
  - 新增或扩展 browser tests，覆盖未传新 props 时默认高度和整数像素不变。
  - 覆盖 `fixed` / `scroll` 的固定高度与 overflow 行为、`fit` 的 `containerHeight` rowHeight recomputation、缺高度 fallback。
  - 覆盖 `autoMeasureContainerHeight` 默认关闭、显式开启测量父容器、父容器 resize 更新、observer cleanup。
  - 覆盖 `heightRuntimeChange` payload 稳定且不触发 layout persistence 保存。
  _需求追溯: R11.AC3, R1.AC7, R3.AC2, R3.AC3, R3.AC4, R3.AC6, R3.AC7, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6_

- [x] 13. 增加 editor/overlay/drop 视觉一致性测试
  - 扩展 internal 或 browser 测试，验证 `createGridEditorOverlayGeometry()` 使用 resolved rowHeight/precision 后 item rect、grid lines、guide spans 对齐。
  - 覆盖 subpixel 下 item 与 drag placeholder 的 left/top/width/height 偏差在阈值内。
  - 覆盖 dropping preview 与 commit 后 item 对齐。
  - 覆盖 desktop/mobile viewport 下 fixed/scroll/fit 不导致明显错位或 incoherent overlap。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC6, R11.AC5_

- [x] 14. 增加 dashboard responsive 高度映射测试
  - 扩展 `test/dashboard-core.test.ts`，覆盖 settings/profile 合并、`heightMode/mobileHeightMode/renderPrecision`、auto-fill 兼容别名、冲突 diagnostics 和 `LayoutItem` 字段边界。
  - 扩展 `test/dashboard-responsive-component-browser.test.js`，覆盖显式组件 props 优先、height runtime diagnostics 合并进 `diagnosticsChange`、runtime 暴露 `heightOptions/heightRuntime`。
  - 扩展 `test/dashboard-types.test.ts`，验证新增 dashboard settings、runtime state、helper types 和 component props 可导入。
  - 覆盖 list/grid active runtime layout 行数用于 `fit` 计算。
  _需求追溯: R11.AC4, R11.AC7, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R7.AC8, R8.AC1, R8.AC3, R8.AC5_

- [x] 15. 更新 README、示例和迁移说明
  - 在 README 或相关 docs 中新增基础 `VueGridLayout` 示例，展示 `heightMode`、`containerHeight`、`autoMeasureContainerHeight`、`minRowHeight` 和 `renderPrecision`。
  - 更新 dashboard 示例，展示 `DashboardGridSettings.heightMode/mobileHeightMode/renderPrecision` 如何经 profile 投影到基础 grid runtime。
  - 文档化 `autoSize` 到 `heightMode` 的兼容映射，以及 `autoFillHeight/mobileAutoFillHeight` 到 `heightMode/mobileHeightMode` 的兼容别名规则。
  - 明确 `subpixel` 只影响最终 CSS，不改变 committed layout、collision、compact、history 或 persistence 的整数 grid units。
  _需求追溯: R10.AC3, R10.AC4, R10.AC5, R10.AC6, R1.AC3, R5.AC3_

- [x] 16. 最终回归、发布面检查与边界审计
  - 运行新增 height runtime、precision、dashboard responsive、component/browser、type tests。
  - 运行现有 grid、responsive、dashboard document、dashboard responsive、editor、persistence、layout-engine 回归测试和 build/type generation 命令。
  - 检查 public API、diagnostics code、CJS/ESM/typings、README 示例和任务追踪。
  - 审计实现没有扩入 aspect ratio、collision repair、layout settings migration、dashboard editor shell、业务 widget UI 或整块 dashboard 自动缩放。
  _需求追溯: R11.AC6, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6, R1.AC5, R1.AC7, R10.AC2_
