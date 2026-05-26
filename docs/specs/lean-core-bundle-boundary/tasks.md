# Lean Core Bundle Boundary 实现任务

- [x] 1. 建立 transitive closure bundle 检查基础
  - 扩展 `scripts/check-bundle-boundary.mjs`，为 public entry 递归收集 dist `.mjs` static import/export closure。
  - 为 root、core、responsive、persistence、layout-engine、history 输出 raw、gzip、brotli 和 closure file list。
  - 增加 forbidden closure 命中报告，输出 entry、文件、token/reason。
  - 保留 `--analyze` 作为报告模式，默认模式支持 hard fail。
  - 先记录当前 baseline，后续任务完成后再收紧最终预算。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC5, R6.AC6, R7.AC7_

- [x] 2. 收紧 root/core public entry 与 CJS wrapper
  - 将 `lib/entries/index.ts` 改为 lean root，导出内容与 `lib/entries/core.ts` 等价或同源。
  - 从 root 移除 `Responsive`、`ResponsiveVueGridLayout` 和旧 all-in-one compat object 语义。
  - 更新 `scripts/build-package.mjs` 的 `index.cjs` wrapper，只 allowlist core-safe 成员，不再全量挂载 runtime namespace。
  - 确认 `package.json` 不新增 `./compat`、`./legacy` 或等价兼容入口。
  - 更新 root/core 类型生成，使 `dist/types/index.d.ts` 与 `dist/types/core.d.ts` 指向 lean core 类型。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R2.AC1, R2.AC2, R2.AC4, R9.AC1, R9.AC2, R9.AC6, R12.AC1, R12.AC2_

- [x] 3. 抽取 core-safe grid shell 与 runtime extension contract
  - 新增 `lib/grid-layout/runtimeExtension.ts`，定义 editor-agnostic 的 runtime extension 类型和默认 item render state。
  - 新增 `lib/grid-layout/noopRuntimeExtension.ts`，为 lean grid 提供 noop extension。
  - 新增或改造 `lib/grid-layout/createGridLayoutComponent.tsx`，把当前 `VueGridLayout` 的渲染、交互和 lifecycle 编排抽为 core-safe shell/factory。
  - 将 editor overlay、selection class、keyboard/placement/root pointer hook 迁移到 extension hook，不让 core shell import `../editor` 或 `GridEditorOverlay`。
  - 确认 shell 仍保留基础 drag、resize、drop、height runtime、auto scroll 和 layout-engine bridge。
  _需求追溯: R2.AC3, R2.AC5, R4.AC3, R5.AC5, R8.AC1, R8.AC2, R12.AC6_

- [x] 4. 将 lean `VueGridLayout` 和 grid model 从高级能力中剥离
  - 从 `lib/VueGridLayoutPropTypes.ts` 的 lean props 移除 `editor`、`persistence`、`historyStore` 和相关 type imports。
  - 从 `lib/grid-layout/useGridLayoutModel.ts` 移除 `GridHistoryStore`、`useGridLayoutPersistence`、`GridLayoutPersistenceProp`、`LayoutPersistenceEvent` imports 与运行时逻辑。
  - 将 `onLayoutMaybeChanged` 收敛为只处理 committed layout emits，不再 push history 或 commit persistence。
  - 更新 `lib/VueGridLayout.tsx` 为 lean public component，使用 core-safe shell + noop extension。
  - 保持 `layoutEngine` prop、layout-engine bridge 和基础布局交互语义不变。
  _需求追溯: R2.AC3, R2.AC4, R4.AC1, R4.AC3, R4.AC5, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R9.AC4_

- [x] 5. 将 `ResponsiveVueGridLayout` 和 responsive model 变为 lean responsive
  - 从 `lib/ResponsiveVueGridLayout.tsx` public props 移除 `editor`、`persistence` 和相关 type imports。
  - 从 `lib/responsive/useResponsiveGridLayoutModel.ts` 移除 persistence controller、editor controller、`getInnerEditorProp()` 和相关 static imports。
  - 保留 breakpoint resolution、layouts map 同步、`update:layouts`、`layoutChange`、`breakpointChange`、`widthChange`。
  - 保留 responsive layout-engine 生成路径，确保不会通过 layout-engine 重新引入 editor/persistence/dashboard/history/Pinia。
  - 更新 `lib/entries/responsive.ts` 的导出和类型为 lean responsive。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC4, R4.AC2, R4.AC3, R4.AC5, R8.AC1, R8.AC2, R9.AC3, R9.AC4_

- [x] 6. 在 `./editor` 实现高级编辑薄 wrapper
  - 将现有 `useGridEditorRuntime` 和 `GridEditorOverlay` 迁移为 `./editor` closure 内的 runtime extension 实现。
  - 新增 `EditorGridLayout`，组合 lean grid shell、editor runtime extension、`GridEditorProp` 和可选 persistence controller/config。
  - 新增 `EditorResponsiveGridLayout`，组合 lean responsive 状态、responsive editor controller、inner editor runtime extension。
  - 从 `lib/entries/editor.ts` 导出两个 wrapper，同时保留 controller、commands、keyboard、guides、placement 等现有 API。
  - 增加 browser/component smoke，覆盖 selection class、keyboard、guides、placement、commit/rollback 和旧 `editor` prop 迁移路径。
  _需求追溯: R4.AC4, R5.AC2, R5.AC5, R5.AC6, R5.AC7, R11.AC5, R11.AC6_

- [x] 7. 在 `./persistence` 实现高级持久化薄 wrapper
  - 新增 `PersistentGridLayout`，用 `useGridLayoutPersistence<Layout>` 管理 load、external apply、dirty、commit/save，并通过标准 `update:modelValue`/`layoutChange` 同步父级。
  - 新增 `PersistentResponsiveGridLayout`，用 `useGridLayoutPersistence<LayoutsMap>` 管理全 breakpoint layouts map。
  - 从 `lib/entries/persistence.ts` 导出两个 wrapper，同时保留 adapter、serializer、validator、migration 和 composable。
  - 保持 persistence wrapper 不 import editor，editor + persistence 组合由 `./editor` wrapper 或用户显式 composable/controller 处理。
  - 增加 browser/component smoke，覆盖 load restore、committed change autosave、external apply、failure fallback 和 responsive layouts 保存。
  _需求追溯: R3.AC5, R4.AC4, R5.AC1, R5.AC5, R5.AC6, R5.AC7, R11.AC5, R11.AC6_

- [x] 8. 更新 public exports、types 和 consumer matrix
  - 更新 `package.json`、`vite.config.ts`、`scripts/build-package.mjs` 的 public entries 与 type wrappers，保持 root/core/responsive/editor/persistence/history/dashboard/dashboard-editor-shell/layout-engine/worker/style/package.json 入口清晰。
  - 更新 `scripts/check-package-exports.mjs` 和 `scripts/check-public-types.mjs` 期望，确保 root/core/responsive 类型不引用 removed advanced props。
  - 更新 `scripts/test-package-consumers.mjs`：ESM/CJS root 只断言 lean core；responsive 只从 `./responsive` 导入；advanced wrapper 只从 `./editor`/`./persistence` 导入。
  - 增加 no-Pinia consumer 覆盖 root/core/responsive/layout-engine/persistence，Pinia history consumer 只覆盖 `./history`。
  - 增加 TypeScript negative coverage，确保 lean grid/responsive 不接受 `editor`、`persistence`、`historyStore`。
  _需求追溯: R1.AC5, R2.AC1, R2.AC4, R3.AC1, R3.AC3, R5.AC3, R5.AC4, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R11.AC4, R12.AC2, R12.AC3_

- [x] 9. 收紧最终 bundle budgets 与 forbidden closure gate
  - 将任务 1 的 closure checker 切到最终 hard budgets：root/core <= 65 KB gzip，responsive <= 80 KB，persistence <= 64 KB，layout-engine <= 30 KB，history <= 8 KB。
  - 配置 root/core/responsive forbidden closure，禁止 editor、keyboard、commands、persistence、dashboard、dashboard-editor-shell、history、Pinia、MCP、Node-only、webpack-only。
  - 配置 persistence/layout-engine/history 的 forbidden policy，确保 history 是唯一允许静态引入 Pinia 的 public entry。
  - 确认 sourcemap、Node-only、MCP-only、webpack-only token 进入发布闭包时 hard fail。
  - 更新 analyze 输出和失败消息，使 regressions 能定位到具体 entry 与文件链路。
  _需求追溯: R2.AC3, R3.AC2, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R8.AC2_

- [x] 10. 更新 README、迁移说明、MCP 数据和示例 imports
  - 更新 README 的入口选择表，说明 root 等价 core、responsive 必须从 `./responsive` 导入、不提供 `./compat`。
  - 更新 2.0 migration notes，列出 root all-in-one 移除、advanced props 移除、wrapper 替代路径和 CJS 行为变化。
  - 将 editor/persistence 文档示例改为 `EditorGridLayout`、`EditorResponsiveGridLayout`、`PersistentGridLayout`、`PersistentResponsiveGridLayout` 或显式 composable/controller。
  - 更新 `mcp/README.md`、`mcp/src/data.ts`、generated props/types 和 fallback examples，禁止旧 root 聚合写法。
  - 迁移 examples 的 package imports，但保持 `/` examples list、`/example/index.html` 和 demo 视觉/交互输出不变。
  _需求追溯: R1.AC5, R3.AC5, R4.AC4, R5.AC6, R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC5, R10.AC6, R11.AC1, R11.AC2, R11.AC3, R12.AC4, R12.AC5_

- [x] 11. 扩展行为回归测试和 advanced wrapper smoke
  - 更新基础 grid browser/component tests，验证 lean `VueGridLayout` 的 drag、resize、drop、height runtime、layout-engine 行为未变。
  - 更新 responsive browser/component tests，验证 breakpoint 切换、layouts 写回和 layout-engine responsive generation 未变。
  - 新增或迁移 editor wrapper smoke，覆盖 editor selection、guides、keyboard、placement、commit rollback。
  - 新增或迁移 persistence wrapper smoke，覆盖 grid 与 responsive 的 load/save/external apply。
  - 确保 dashboard 与 dashboard-editor-shell tests 仍从各自 subpath 工作，但本任务不拆 dashboard pure runtime。
  _需求追溯: R5.AC4, R8.AC1, R8.AC3, R8.AC4, R11.AC4, R11.AC5, R11.AC6, R12.AC3, R12.AC6_

- [x] 12. 运行完整本地验收并修复回归
  - 运行 `npm run build`。
  - 运行 `npm run check:package`。
  - 运行 `npm run check:bundle` 和 analyze 模式，确认 forbidden closure 与 budgets 达标。
  - 运行 `npm run test:package`。
  - 运行 `npm test`。
  - 运行 `npm run test:browser`。
  - 运行 `npm run test:examples` 和 `npm run build-docs`。
  - 对任何失败按 root/core/responsive boundary、advanced wrapper、consumer resolution、example behavior 四类归因并修复。
  _需求追溯: R1.AC1, R1.AC2, R2.AC3, R3.AC2, R6.AC6, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R8.AC3, R9.AC5, R10.AC5, R11.AC1, R11.AC2, R11.AC3, R11.AC4, R11.AC5, R11.AC6, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5, R12.AC6_
