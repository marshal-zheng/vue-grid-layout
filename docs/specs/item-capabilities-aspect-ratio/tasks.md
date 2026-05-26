# Item Capabilities & Aspect Ratio 实现任务

## 任务列表

### T1: 建立 shared item capability 纯函数层

- [x] T1.1 新增 `lib/item-capabilities.ts`，定义 `ResolvedGridItemCapability`、`GridItemCapabilityDiagnostic`、`GridItemAspectRatioConstraint`、`GridItemResizeMetrics`、`LayoutResizeConstraint` 相关 core-safe 类型，并确保该模块不导入 dashboard/editor/Vue/Pinia/persistence。
  _需求追溯: R1.AC1, R1.AC2, R1.AC4, R1.AC6, R9.AC2, R9.AC3_

- [x] T1.2 实现 capability resolver，合并 `LayoutItem`、dashboard item/profile sidecar、editor metadata 与 grid defaults，输出 deterministic effective capability、字段来源和 diagnostics。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC7, R7.AC2, R8.AC1_

- [x] T1.3 实现 `static`、`locked`、`draggable`、`resizable`、`editable` 的分层所有权规则：layout/dashboard/profile 决定物理能力，editor metadata 只能收紧直接编辑权限。
  _需求追溯: R1.AC7, R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6_

- [x] T1.4 实现 resize handle policy 合并 helper，包括 `resizable=false` 清空 handles、严格来源不得被放宽、aspect ratio 默认 corner-only、edge handle 显式 opt-in。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC6, R3.AC7_

- [x] T1.5 实现安全输入处理与 future field 策略，清理危险 key，未知字段安全忽略或保留为 JSON-safe metadata，不破坏 projection。
  _需求追溯: R1.AC5, R9.AC5_

### T2: 实现 aspect ratio constraint 与视觉度量 helper

- [x] T2.1 实现 aspect ratio 解析 helper：支持显式 `aspectRatio`、`preserveAspectRatio=true` 时从 resize start geometry 推导比例，并统一定义为 `widthPx / heightPx`。
  _需求追溯: R4.AC1, R4.AC2, R4.AC4, R4.AC7_

- [x] T2.2 基于 `colWidth`、`rowHeight`、margin、container padding、render precision 计算视觉像素尺寸，避免使用简单 `w / h` 判断比例。
  _需求追溯: R4.AC4, R5.AC1, R6.AC1_

- [x] T2.3 实现 ratio validation 与 fallback policy：非法、非有限、<= 0、超范围、缺少 metrics、与 min/max 不兼容时返回 structured diagnostic，默认不提交；显式 fallback 时记录降级。
  _需求追溯: R4.AC3, R4.AC5, R8.AC2, R8.AC3, R8.AC6_

- [x] T2.4 实现 ratio-preserving grid candidate helper，覆盖 corner handle、north/west anchor、edge handle opt-in、主导轴推导、min/max clamp 后不可满足比例的 blocked/degraded 结果。
  _需求追溯: R5.AC2, R5.AC3, R5.AC4, R6.AC2_

### T3: 扩展 layout engine resize operation

- [x] T3.1 在 `lib/layout-engine/types.ts` 中扩展 resize operation 的 optional `constraint`，新增 `handle-disabled`、`aspect-ratio`、`metrics-missing` blocked reason，并保持 `LayoutOperationResult` 向后兼容。
  _需求追溯: R3.AC4, R6.AC1, R6.AC3, R9.AC1_

- [x] T3.2 在 `lib/layout-engine/core.ts` 的 `normalizeResize()` / `executeResize()` 中执行 handle policy、aspect ratio、metrics、min/max、bounds、maxRows、collision 的确定性顺序。
  _需求追溯: R5.AC1, R5.AC4, R6.AC2, R6.AC3, R6.AC5_

- [x] T3.3 保证 blocked preview 不污染 committed layout/history/persistence，并允许同一次 pointer resize 后续 tick 恢复为可提交状态。
  _需求追溯: R5.AC5, R8.AC5_

- [x] T3.4 确认 worker/main-thread 共用同一纯函数路径，request sidecar 可 structured clone，legacy/disabled engine path 对 unsupported constraint 返回 structured degraded/unsupported 或等价 fallback。
  _需求追溯: R5.AC6, R6.AC4, R6.AC5_

### T4: 接入 grid runtime extension 与 resize interaction

- [x] T4.1 扩展 `GridItemRenderState`，让 runtime extension 可返回 effective `resizeHandles` 与 capability diagnostics；`createGridLayoutComponent.tsx` 使用 `itemState.resizeHandles` 优先于 `LayoutItem.resizeHandles` 和组件 prop。
  _需求追溯: R3.AC1, R3.AC2, R9.AC4_

- [x] T4.2 扩展 `GridInteractionsEditor` 的 resize intent hook，让 pointer preview 与 commit 携带同一 constrained candidate、metrics、constraint 和 diagnostics。
  _需求追溯: R4.AC7, R5.AC1, R8.AC2, R8.AC3_

- [x] T4.3 在 `useGridDragResizeInteractions.ts` 中接入 resize intent，确保 disabled handle 被阻止，blocked 后恢复、snap 后比例校验、resize stop commit 与 preview geometry 一致。
  _需求追溯: R3.AC4, R5.AC1, R5.AC5, R8.AC4_

- [x] T4.4 保持 noop/core extension 默认行为不启用 aspect ratio，不要求 lean `VueGridLayout` / `ResponsiveVueGridLayout` 用户理解 dashboard/editor sidecar。
  _需求追溯: R1.AC4, R4.AC6, R9.AC2, R9.AC4_

### T5: 改造 editor capability、command 与 diagnostics

- [x] T5.1 将 `lib/editor/metadata.ts` 的 `resolveEditorItemCapability()` 收敛到 shared resolver 或兼容包装，保留现有 API，同时暴露 conflict 与 physical/editor ownership diagnostics。
  _需求追溯: R1.AC1, R1.AC3, R2.AC6, R8.AC1_

- [x] T5.2 更新 editor command、selection、toolbar state 的 capability 判断，使 `locked`、`static`、`resizable=false`、disabled handle、missing metrics、aspect-ratio impossible 都返回 structured disabled/blocked reason。
  _需求追溯: R2.AC2, R2.AC3, R2.AC4, R8.AC1, R8.AC2, R8.AC6_

- [x] T5.3 在 command result 与 interaction diagnostics 中暴露 ratio source、target ratio、resolved geometry、handle policy、constraint order、fallback policy 和 blocked ids。
  _需求追溯: R8.AC2, R8.AC3, R8.AC4, R8.AC5_

### T6: 改造 dashboard document 与 responsive profile projection

- [x] T6.1 在 dashboard projection 中生成 `capabilitiesById` 与 `resizeConstraintsById` sidecar，保留 `preserveAspectRatio`、`aspectRatio`、`resizable`、`draggable`、`resizeHandles`、`static`、`bounded` 等字段语义。
  _需求追溯: R1.AC6, R4.AC1, R7.AC1, R7.AC2_

- [x] T6.2 将 `preserveAspectRatio` / `aspectRatio` 从 runtime unsupported 语义迁移到 sidecar projected diagnostic，保持 `toRuntimeLayoutItem()` 只输出基础 `LayoutItem` 支持字段。
  _需求追溯: R1.AC6, R7.AC1, R9.AC4_

- [x] T6.3 更新 responsive profile 合并与 projection，支持 default/profile capability 继承、覆盖、冲突 diagnostics，并保留未参与当前 runtime 的其他 profile policy。
  _需求追溯: R3.AC5, R7.AC2, R7.AC3_

- [x] T6.4 更新 write-back 路径，普通 resize 只写几何；capability patch 只写目标 default layout 或 active profile override，不 materialize 其他 profiles，并保留 missing-profile write blocking / explicit create policy。
  _需求追溯: R7.AC3, R7.AC4, R7.AC6_

- [x] T6.5 检查 ThingsBoard import/export 与 dashboard migration 路径，保留并映射 `preserveAspectRatio` / `aspectRatio`，但不把 ThingsBoard 字段名作为核心 `LayoutItem` API。
  _需求追溯: R7.AC5, R9.AC4_

### T7: 更新 public API、exports、文档与 MCP/package 元数据

- [x] T7.1 决定并实现 capability helper 的导出位置，更新源码 barrel、类型声明、CJS/ESM subpath exports、package consumer tests 与 MCP 数据。
  _需求追溯: R9.AC1, R9.AC3_

- [x] T7.2 验证 root/core/responsive bundle boundary，确保新增 helper 不把 editor、dashboard、persistence、history、Pinia 或 widget registry runtime 静态带回基础 closure。
  _需求追溯: R1.AC4, R9.AC2, R9.AC3_

- [x] T7.3 更新 README/docs，说明 `locked` vs `static`、`resizable=false`、`resizeHandles`、`preserveAspectRatio`、`aspectRatio`、profile override、fallback policy 与 lean boundary 推荐用法。
  _需求追溯: R2.AC5, R10.AC4_

- [x] T7.4 记录非目标与后续规格边界，避免把 group resize、nested grids、inter-grid drag、full Editor Kit UI、Widget Registry schema、AI/MCP dashboard assistant 混入本规格。
  _需求追溯: R10.AC6_

### T8: 增加 dogfood workbench 与示例覆盖

- [x] T8.1 新增或更新 capability/aspect-ratio dogfood workbench，使用公开 API 覆盖 16:9 视频卡、1:1 图片/Logo 卡、不可 resize KPI、locked 非 static 卡、static anchor 卡、profile override 卡和 invalid ratio 卡。
  _需求追溯: R10.AC1_

- [x] T8.2 将 workbench 连接到 diagnostics/HUD/toolbar state，使禁用态、blocked reason、ratio source、fallback policy 可观察，但不让 core grid 依赖示例 UI。
  _需求追溯: R8.AC4, R10.AC1_

### T9: 编写单元测试与 interaction 测试

- [x] T9.1 为 `lib/item-capabilities.ts` 覆盖 resolver 优先级、分层所有权、conflict diagnostics、safe key、unknown field、handle merge、corner-only default、edge opt-in。
  _需求追溯: R1.AC2, R1.AC3, R1.AC5, R2.AC6, R3.AC1, R3.AC3, R3.AC6, R3.AC7, R10.AC2_

- [x] T9.2 为 aspect ratio helper 覆盖 explicit ratio、start-geometry ratio、invalid ratio、visual metrics、missing metrics default block、explicit fallback opt-in、north/west anchor、min/max、impossible ratio。
  _需求追溯: R4.AC2, R4.AC3, R4.AC4, R4.AC5, R5.AC2, R5.AC4, R10.AC2_

- [x] T9.3 为 layout engine resize 覆盖 handle-disabled、metrics-missing、aspect-ratio blocked、bounds、maxRows、collision、preventCollision/allowOverlap、placeholder/patches/diagnostics、no-constraint backward compatibility。
  _需求追溯: R3.AC4, R5.AC4, R6.AC2, R6.AC3, R6.AC5, R10.AC2_

- [x] T9.4 为 worker/main-thread executor 覆盖同一 resize request 的 status、layout、patches、diagnostics 等价。
  _需求追溯: R6.AC4, R10.AC2_

- [x] T9.5 为 dashboard projection/write-back 覆盖 sidecar projection、profile inheritance/override/conflict diagnostics、profile-scoped handle policy、missing profile block、write-back immutability、不 materialize unrelated profiles。
  _需求追溯: R3.AC5, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC6, R10.AC2_

- [x] T9.6 为 component/headless interaction 覆盖 handles DOM state、preview/commit 同比例、blocked 后恢复、north/west anchor、toolbar disabled reason、`skip-blocked` / `all-or-nothing` policy。
  _需求追溯: R5.AC1, R5.AC2, R5.AC5, R8.AC1, R8.AC2, R8.AC5, R10.AC3_

### T10: 回归验证与发布检查

- [x] T10.1 运行相关单元测试和 `npm test`，确认 legacy `LayoutItem.isResizable`、`LayoutItem.resizeHandles`、`static` 与无 constraint resize 行为保持兼容。
  _需求追溯: R6.AC5, R9.AC4, R10.AC5_

- [x] T10.2 若改动 interaction/headless browser 测试覆盖，运行 `npm run test:browser`；若改动 examples/workbench，运行 `npm run test:examples`。
  _需求追溯: R10.AC1, R10.AC3, R10.AC5_

- [x] T10.3 若改动 exports/types/package boundary，运行 `npm run check:package` 与 `npm run check:bundle`，确认 lean boundary 与发布元数据正确。
  _需求追溯: R9.AC1, R9.AC2, R10.AC5_

- [x] T10.4 汇总 migration note、已知降级路径、非目标和后续 spec 建议，确保 release/handoff 可直接消费。
  _需求追溯: R5.AC6, R7.AC5, R10.AC4, R10.AC6_

## 完成记录

- 2026-05-26 closeout：本 spec 的实现已落在当前 `main`，核心证据包括 `lib/item-capabilities.ts`、`lib/layout-engine/types.ts` / `core.ts`、`lib/grid-layout/*` resize intent/runtime extension、`lib/editor/*` capability/diagnostics、`lib/dashboard.ts` / `lib/dashboard-responsive/*` sidecar projection、`example/24-dashboard-runtime-lab.js` dogfood、`README.md` / `mcp/src/data.ts` 文档入口，以及 `test/layout-engine-core.test.ts`、`test/grid-layout-internal-core.test.ts`、`test/editor-core.test.ts`、`test/dashboard-core.test.ts` 覆盖。
- 历史执行记录：`codex/item-capabilities-aspect-ratio` worktree 在 2026-05-22 记录 coverage gate passed，验证命令包括 `npm test`、`npm run test:browser`、`npm run test:examples`、`npm run check:package`、`npm run check:bundle`。
- 当前 closeout 验证：重新运行 initiative 结构检查、alignment gate、targeted `vite-browser-smoke`、`npm test`、`npm run test:browser`、`npm run test:examples`、`npm run build`、`npm run check:package`、`npm run check:bundle`。`check:package` 首次发现本地忽略目录 `build/`，已非破坏性移动到 `/Users/hqz/dev/vue-grid-layout-worktrees/source-build-backup-20260526T005200Z` 后重跑通过。
