# Layout Settings Migration & Collision Repair 实现任务

- [x] 1. 扩展 layout engine 类型契约与公共结果模型
  - 在 `lib/layout-engine/types.ts` 中新增 `LayoutMigrationSettings`、`LayoutMigrationPolicy`、`LayoutRepairPolicy`、`LayoutRepairObjective`、`LayoutRepairSolver`、migration/repair summary 与 diagnostic detail 类型。
  - 扩展 `LayoutOperation`，加入 `migrateSettings`、`repairCollisions`、`translateLayout`、`placeItems` 四个批量几何 operation。
  - 扩展 `LayoutOperationResult` 的可选 `migration`、`repair` sidecar，并文档化 `noop`、`changed`、`blocked`、`fallback`、`error` 的提交语义。
  - 保持 `LayoutItem` 不新增 settings、repair policy、solver metadata 或 dashboard-only 字段。
  _需求追溯: R1.AC1, R1.AC4, R5.AC1, R5.AC2, R5.AC6, R8.AC1, R8.AC3_

- [x] 2. 实现 settings classification 与 columns ratio migration 纯函数
  - 新增 `lib/layout-engine/migration.ts`，实现 previous/next settings 解析、几何 settings 与 visual-only settings 分类、非法 `cols` 诊断和 no-op 判断。
  - 实现默认 horizontal + `round` columns ratio migration，只转换 `x/w`，并支持显式 `xy` policy 转换 `x/y/w/h`。
  - 实现 min/max constraints、`cols/maxRows` bounds clamp、`w/h` shrink/expand、strict invalid item error 与显式 sanitize policy。
  - 生成稳定排序、稳定 patches、affectedIds、migration summary 和 debug diagnostics。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R3.AC8, R8.AC2, R8.AC4, R8.AC5_

- [x] 3. 实现 deterministic heuristic collision repair
  - 基于现有 occupancy index 实现 static-first repair：先放置可保留的 static/locked-equivalent anchors，再修复非 static items。
  - 对 static item 自身越界、尺寸非法或 static-static 冲突执行最小必要 clamp、shrink 或 move，并记录 `forced-static-repair`。
  - 使用确定性顺序处理待修复 items：原始 row/col/order、迁移后位置、item id 等 tie-breakers。
  - 对单个 item 先尝试当前位置，再尝试 nearest-fit，随后 first-fit，必要时 shrink 到 min size 后重试。
  - 对无法修复的 item 返回 unresolved diagnostics；在 `preventCollision` 下返回 blocked/error，不提交仍碰撞 layout。
  - 在 `allowOverlap` 且未强制 repair 时允许保持重叠并返回 diagnostics；强制 repair 时仍运行修复策略。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R4.AC7, R4.AC8, R4.AC9, R5.AC3, R8.AC1, R8.AC2, R8.AC4, R8.AC5_

- [x] 4. 接入 main-thread customRepairSolver 与 solver-ready 校验边界
  - 实现 `customRepairSolver` main-thread 调用路径，传入 plain data input、objective、policy 和基础约束信息。
  - 实现 `validateRepairedLayout()`，校验 solver result 的 id 集合、有限整数几何、bounds、constraints、collision policy 和 `maxRows`。
  - 对 solver throw、over-budget、不可用或非法 result 执行 fallback heuristic 或返回可诊断 error/blocked，且不覆盖 committed layout。
  - 保持 worker-capable request serialization-safe；不把 function 类型 solver 发送到 worker，不实现 worker-hosted custom solver。
  _需求追溯: R5.AC4, R5.AC5, R5.AC6, R5.AC7, R8.AC3, R8.AC4, R9.AC2, R9.AC6_

- [x] 5. 实现 placement/import 与整体 translate operation
  - 实现 `placeItems`，支持 target-first、first-fit、append-after-bottom，并在 result 中记录实际 placement source。
  - 对新增或导入 item 的 `w/h`、min/max、`cols/maxRows` 约束执行 clamp、shrink 或 block，并输出 diagnostics。
  - 实现 `translateLayout`，对 `dx/dy` 执行 `round`，负向移动时 clamp 到不产生负 `x/y` 的最大安全偏移。
  - translate 后按 policy 执行 repair 或返回 blocked/unresolved，且只改变几何字段。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R4.AC5, R4.AC6, R8.AC2, R8.AC4, R10.AC3_

- [x] 6. 接入 operation dispatcher、executor 与现有 engine 运行边界
  - 在 `executeLayoutOperationWithIndex()` 中接入 `migrateSettings`、`repairCollisions`、`translateLayout`、`placeItems` dispatch case。
  - 让 `executeLayoutOperation()`、main-thread executor、custom executor 和 worker-capable executor 返回同形状 result。
  - 在 worker/executor sanitize 逻辑中剔除 function solver，并保留 heavy task metadata、budget、fallback diagnostics。
  - 确保 stale、cancelled、timeout 或 worker unavailable result 不覆盖当前 committed layout。
  - 确保 drag/resize preview 路径默认不在每个 pointer tick 触发 full migration 或 solver-style repair。
  _需求追溯: R1.AC1, R1.AC3, R1.AC5, R8.AC3, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R10.AC5_

- [x] 7. 实现 dashboard settings migration wrapper 与 scoped write-back
  - 新增 `lib/dashboard-migration.ts`，实现 `migrateDashboardLayoutSettings()` 及 result/options 类型。
  - 使用 `projectDashboardLayoutDocument()` 或 responsive resolver 投影 default layout/profile，再调用 engine `migrateSettings`。
  - default layout migration 只更新 default widgets 和 gridSettings；profile migration 只更新目标 profile widgets overrides 和 profile gridSettings。
  - missing profile 默认 blocked；显式 `createMissingProfile` 时才创建 profile。
  - 写回时将 `x/y/w/h` 映射回 `col/row/sizeX/sizeY`，保留 `mobileOrder`、`mobileHeight`、visibility、aspect ratio、extensions 与未知 JSON-safe 字段。
  - partial profile 只为几何或明确 capability 变化的 inherited item 创建/更新 minimal override，不全量 materialize effective layout。
  - operation failed 时返回 cloned unchanged document、error 和聚合 diagnostics。
  _需求追溯: R1.AC2, R6.AC6, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R7.AC8, R8.AC6, R10.AC2_

- [x] 8. 更新 public exports、typings、CommonJS 与示例文档
  - 从 `lib/layout-engine/index.ts` 导出 migration/repair/placement/translate 纯函数和新增类型。
  - 从 dashboard public surface 导出 `migrateDashboardLayoutSettings()`、dashboard repair/translate helper 及对应类型。
  - 同步更新 `lib/cjs.ts`、`typings/index.d.ts` 和相关 package public API，保证现有导出不回退。
  - 更新 README 或示例，展示 settings migration、collision repair diagnostics、dashboard wrapper 最小用法。
  - 文档明确 solver-ready 契约已完整定义，但本规格不内置 full constraint solver，也不实现 UI、schema、height/render precision 或 aspect ratio 非目标。
  _需求追溯: R1.AC5, R5.AC3, R5.AC7, R10.AC5, R10.AC6, R10.AC7_

- [x] 9. 编写 layout engine migration/repair 单元测试
  - 新增 `test/run-layout-migration-tests.js` 或扩展现有 layout-engine runner，覆盖 columns 24->12、12->24、非法 columns 和 visual-only no-op。
  - 覆盖 default horizontal + round、显式 `xy` policy、min/max constraints、`w > cols`、negative x/y、non-finite geometry、strict 与 sanitize。
  - 覆盖 static preserved、forced static repair、nearest-fit、first-fit fallback、unresolved item、diagnostics stability。
  - 覆盖 `allowOverlap`、force repair、`preventCollision`、`placeItems` append-after-bottom、`translateLayout` negative clamp。
  - 覆盖 main-thread `customRepairSolver` success、throw、over-budget、invalid result 和 fallback heuristic。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R3.AC8, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R4.AC7, R4.AC8, R4.AC9, R5.AC4, R5.AC5, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R8.AC1, R8.AC2, R8.AC4, R8.AC5, R10.AC1, R10.AC3_

- [x] 10. 编写 dashboard/executor 回归测试并运行验证命令
  - 扩展 dashboard tests，覆盖 default layout migration、profile-scoped migration、missing profile blocking、create-missing profile、partial profile minimal overrides、unknown field preservation、gridSettings write-back 和失败不覆盖原 document。
  - 扩展 executor/worker tests，覆盖 heavy task metadata、serialization-safe request、custom solver function sanitize、stale result discard、timeout/fallback 和 async result shape。
  - 跑通新增 runner、现有 layout-engine tests、dashboard document/profile tests、typings/exports checks 和项目现有轻量回归命令。
  - 验证未启用 migration 能力时，现有 `move`、`resize`、`dropFit`、`compact`、`validate`、`generateResponsiveLayout`、dashboard projection、responsive profile、height runtime、editor、persistence 行为保持兼容。
  _需求追溯: R1.AC5, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R7.AC8, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R10.AC2, R10.AC4, R10.AC5_

- [x] 11. 修复 completion review 发现的长期契约缺口
  - 修复 `repairCollisions` 中 normalize 已产生合法 bounds/static 修复时错误返回原 layout/noop 的提交语义，并把 static bounds/constraints 修复纳入 `forced-static-repair` diagnostics 与 repair summary。
  - 修复 dashboard wrapper 对 partial/visual-only `nextSettings` 的 resolved settings 比较，确保视觉设置可写回但不要求调用方重复传入 `columns`。
  - 修复非 primary `layoutId` 的 scoped projection/write-back，以及 dashboard namespace 的 CommonJS/typings public export 一致性。
  - 增加 engine/dashboard/export 回归测试并跑通 focused tests、TypeScript check 与完整 `npm test`。
  _需求追溯: R2.AC2, R4.AC5, R4.AC9, R7.AC1, R7.AC2, R7.AC3, R8.AC1, R8.AC3, R10.AC2, R10.AC5_
