# Layout Settings Migration & Collision Repair 需求规格

## 简介

当前组件库已经具备独立的 layout engine、row/column occupancy index、`dropFit`、`groupMove`、`compact`、`validate`、responsive layout generation、dashboard document adapter、dashboard responsive profile 和 height/render precision specs。ThingsBoard dashboard 的经验说明：当 dashboard grid settings 改变、导入旧布局、profile fallback 或添加 widget 时，只更新 settings 不足以保证布局可用；columns 改变可能导致 item 越界、重叠、尺寸不合法或整体坐标偏移。

本规格定义 `layout-settings-migration-collision-repair`：采用已确认的 **B + C0** 方案。也就是以 layout engine 为几何迁移和碰撞修复的主实现边界，dashboard 层只提供 document/profile wrapper；本规格完整交付 deterministic heuristic repair，并完整定义 solver-ready API、diagnostics、worker/executor 和 objective 扩展契约。本规格不内置完整 constraint solver，不做 UI 设置弹窗，不改变 dashboard persistence schema，不把 dashboard-only settings 写入 `LayoutItem`。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/LAYOUT-engine-pro/README.md
SPEC_BRIEF: docs/initiatives/LAYOUT-engine-pro/briefs/LAYOUT-layout-settings-migration-collision-repair.md

COVERAGE: settings-repair

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| settings-repair | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: Layout Engine 优先的迁移与修复边界
**用户故事:** 作为组件库维护者，我希望 settings migration 和 collision repair 归入通用 layout engine，以便 dashboard、responsive profile、导入旧布局和 editor 命令可以复用同一套确定性几何能力。
**验收标准 (EARS):**
- R1.AC1: WHEN 实现 layout settings migration 和 collision repair 时，系统 SHALL 在 `lib/layout-engine` 层提供通用 operation 或等价纯函数能力，并 SHALL 让 dashboard 层只通过 wrapper 调用该能力。
- R1.AC2: WHEN dashboard document 或 profile 需要迁移布局时，系统 SHALL 先投影为基础 `Layout` 和 resolved settings，再调用 layout engine 完成几何迁移、bounds clamp 和 collision repair。
- R1.AC3: WHEN 基础 `VueGridLayout`、dashboard profile 或 import workflow 需要相同修复能力时，系统 SHALL 能复用同一 engine API，而不是复制 dashboard-only 碰撞算法。
- R1.AC4: WHEN 完成本规格时，系统 SHALL NOT 把 `columns`、`minColumns`、`heightMode`、`mobileOrder`、repair policy 或 solver metadata 写入 `LayoutItem`。
- R1.AC5: WHEN 不启用本能力时，现有 `move`、`resize`、`dropFit`、`compact`、`validate`、`generateResponsiveLayout`、dashboard projection 和 responsive profile 行为 SHALL 保持兼容。

### R2: Grid Settings 变更分类与触发规则
**用户故事:** 作为 dashboard 集成开发者，我希望系统能区分哪些 settings 需要迁移几何布局、哪些只影响渲染，以便 settings 修改不会产生不必要或危险的布局变更。
**验收标准 (EARS):**
- R2.AC1: WHEN 比较 previous settings 与 next settings 时，系统 SHALL 将 `columns`、`minColumns`、可选 `maxRows` 或等价边界字段识别为可能触发几何迁移的 settings。
- R2.AC2: WHEN 只改变 `margin`、`containerPadding`、`rowHeight`、`heightMode`、`mobileHeightMode`、`renderPrecision`、背景字段或其他纯视觉 settings 时，系统 SHALL NOT 自动移动、缩放、收缩或重新排序 committed layout items。
- R2.AC3: WHEN `columns` 从旧值变为新值时，系统 SHALL 计算稳定的 columns ratio，并根据 policy 生成迁移后的候选几何。
- R2.AC4: IF previous settings 缺少合法 `columns`，系统 SHALL 使用明确默认值或返回可诊断错误，不得产生 `NaN`、负数、零宽度或无限坐标。
- R2.AC5: IF next settings 缺少合法 `columns` 或新列数小于 1，系统 SHALL 阻止几何迁移并返回 `invalid-input` 或等价 diagnostic。
- R2.AC6: WHEN settings comparison 结果不需要几何迁移且 layout 本身无碰撞时，系统 SHALL 返回 no-op 结果并保留输入 layout 的几何语义。

### R3: Columns Ratio 迁移与几何规范化
**用户故事:** 作为 dashboard 编辑用户，我希望列数变化后已有 widgets 能尽量保持相对位置和尺寸，以便从 24 列迁移到 12 列、从旧 dashboard 导入或切换 layout profile 时仍能得到可用布局。
**验收标准 (EARS):**
- R3.AC1: WHEN columns ratio migration 执行时，系统 SHALL 支持默认 horizontal migration，将 `x` 和 `w` 按 ratio 转换，并保持 `y` 和 `h` 的 grid row 语义不被 rowHeight 或视觉高度 settings 改写。
- R3.AC2: WHEN 调用方显式启用 ThingsBoard-compatible 或 equivalent `xy` migration policy 时，系统 SHALL 能按 ratio 转换 `x`、`y`、`w` 和 `h`，并在 diagnostics 中标记该策略来源。
- R3.AC3: WHEN 缩放后的 `w` 或 `h` 小于 item 最小约束或 1 时，系统 SHALL clamp 到合法尺寸，并记录 `shrunk`、`expanded` 或 `clamped` diagnostic。
- R3.AC4: WHEN 缩放后的 item 超出新 `cols` 边界时，系统 SHALL 优先 clamp `x`，必要时再 shrink `w`，并 SHALL 尊重 `minW`、`maxW` 和新列数边界。
- R3.AC5: WHEN item 具有 `minW/minH/maxW/maxH/static/isBounded` 等现有约束时，系统 SHALL 在迁移和规范化过程中保留并执行这些约束。
- R3.AC6: IF 某个 item 的原始 `x/y/w/h` 非有限数字、宽高非正或 id 缺失，系统 SHALL 在 strict operation 中返回错误；在显式 sanitize policy 中 SHALL 执行确定性修复或跳过并报告 diagnostics。
- R3.AC7: WHEN 多次对同一 layout、settings 和 policy 执行 migration 时，系统 SHALL 产生稳定排序、稳定 patches 和稳定 diagnostics。
- R3.AC8: WHEN columns ratio migration 生成候选几何时，系统 SHALL 默认使用 `round` 取整策略，再执行 min/max constraints、bounds clamp 和 collision repair。

### R4: Deterministic Heuristic Collision Repair
**用户故事:** 作为 dashboard 用户，我希望 settings 迁移后产生的碰撞可以自动修复，并且每次修复结果可预测，以便编辑器不会因为布局重叠而进入不可用状态。
**验收标准 (EARS):**
- R4.AC1: WHEN migration、import、profile switch 或 explicit repair 产生碰撞时，系统 SHALL 提供 deterministic heuristic repair 策略作为本规格默认修复实现。
- R4.AC2: WHEN 默认 heuristic repair 运行时，系统 SHALL 优先保护 static 或 locked-equivalent items 的位置，并 SHALL 把非 static item 迁移到可放置位置。
- R4.AC9: IF static 或 locked-equivalent item 在 settings migration 后自身越界、尺寸非法或与其他 static item 冲突，系统 SHALL 允许对该 item 执行最小必要 clamp、shrink 或 move，并 SHALL 记录 forced static repair diagnostic。
- R4.AC3: WHEN 修复单个 collided item 时，系统 SHALL 支持 nearest-fit 优先、first-fit fallback 或等价 `nearest-then-first` policy，并 SHALL 在结果中记录实际 fallback。
- R4.AC4: WHEN 多个 items 需要修复时，系统 SHALL 使用稳定排序规则决定修复顺序，例如 static 优先保留、原始 row/col/order、迁移后距离、item id 或等价可文档化 tie-breakers。
- R4.AC5: WHEN 修复可以在合法边界内完成时，系统 SHALL 返回无重叠、无负坐标、宽高合法且不超过 `cols/maxRows` 的 layout。
- R4.AC6: IF 某些 items 无法在当前约束下修复，系统 SHALL 保留可解释的 unresolved diagnostics，并 SHALL NOT 静默丢失 item 或生成非法 layout。
- R4.AC7: IF `allowOverlap` 为 true 且调用方未强制 repair，系统 SHALL 允许保持重叠并返回 diagnostics；IF 调用方强制 repair，系统 SHALL 仍可运行修复策略。
- R4.AC8: IF `preventCollision` 为 true，系统 SHALL 在 committed repair 结果中消除碰撞或返回 blocked/unresolved 结果，不得提交仍然碰撞的 layout。

### R5: Solver-Ready 扩展点
**用户故事:** 作为长期架构维护者，我希望当前 heuristic repair 不会封死 constraint solver 或优化式修复路线，以便本规格在不内置完整求解器的前提下仍提供完整、可测试的 solver-ready 契约。
**验收标准 (EARS):**
- R5.AC1: WHEN 定义 repair API 时，系统 SHALL 提供 solver-ready 的 strategy/policy 边界，例如 `first-fit`、`nearest-fit`、`heuristic`、`custom` 或等价枚举。
- R5.AC2: WHEN 定义 repair policy 时，系统 SHALL 能表达 objective 或 cost metadata，例如 minimize movement、minimize resize、preserve order、preserve static、preserve groups 或等价权重。
- R5.AC3: WHEN 实现本规格时，系统 SHALL NOT 要求内置完整 constraint solver、ILP、CP-SAT 或第三方求解器作为默认依赖。
- R5.AC4: WHEN 调用方提供 main-thread `customRepairSolver` 时，系统 SHALL 执行该 solver，并 SHALL 要求它接收纯数据输入且返回与 heuristic repair 相同形状的 result、patches、diagnostics 和 unresolved information。
- R5.AC5: WHEN custom solver 或 custom strategy 超时、失败、不可用或返回非法 layout 时，系统 SHALL fallback 到 deterministic heuristic repair 或返回可诊断错误，且 SHALL NOT 用非法 solver result 覆盖 committed layout。
- R5.AC6: WHEN repair diagnostics 输出时，系统 SHALL 预留 score、objective summary、candidate count、duration、fallback reason 和 unresolved constraints 等字段，以支持 solver-ready 可解释性。
- R5.AC7: WHEN 本规格定义 solver-ready executor 边界时，系统 SHALL 保持输入和输出 serialization-safe，但 SHALL NOT 要求本规格实现 worker-hosted custom solver。

### R6: Placement、Import 与整体平移能力
**用户故事:** 作为 dashboard 编辑器开发者，我希望添加 widget、导入布局和整体移动 widgets 时能复用同一套 fit 与 bounds 逻辑，以便避免负坐标、碰撞和不可放置状态。
**验收标准 (EARS):**
- R6.AC1: WHEN 添加或导入 item 且调用方提供目标 `x/y` 时，系统 SHALL 先尝试目标位置；IF 发生碰撞或越界，系统 SHALL 根据 policy 使用 nearest-fit 或 first-fit 寻找合法位置。
- R6.AC2: WHEN 添加或导入 item 且未提供目标位置时，系统 SHALL 支持 first-fit 或 append-after-bottom 策略，并在 result 中标记实际 placement source。
- R6.AC3: WHEN item 的 `w/h` 超过新 `cols/maxRows` 或违反 min/max 约束时，系统 SHALL clamp、shrink 或 block，并返回对应 diagnostics。
- R6.AC4: WHEN 执行整体平移 operation 时，系统 SHALL 支持 `dx/dy` 或 equivalent input，并 SHALL 在负向移动时 clamp 到不会产生负 `x/y` 的最大安全偏移。
- R6.AC5: WHEN 整体平移完成后产生碰撞、越界或 `maxRows` 违规时，系统 SHALL 根据 policy 执行 repair 或返回 blocked/unresolved diagnostics。
- R6.AC6: WHEN placement、import 或 translate 操作被用于 dashboard wrapper 时，系统 SHALL 只修改目标 layout/profile 的几何字段，不得删除业务 widget 数据、扩展字段或其他 profiles。

### R7: Dashboard Document 与 Profile Wrapper
**用户故事:** 作为 dashboard profile 用户，我希望 settings migration 可以作用在 default layout 或指定 breakpoint profile 上，以便 profile-scoped 编辑不会污染其他布局。
**验收标准 (EARS):**
- R7.AC1: WHEN 调用 dashboard settings migration wrapper 时，系统 SHALL 接收 `DashboardLayoutDocument`、layout id、可选 profile id、previous settings、next settings 和 repair policy。
- R7.AC2: WHEN wrapper 迁移 default layout 时，系统 SHALL 只更新 primary/default dashboard layout 的 widgets 和 gridSettings，不得覆盖已有 profiles。
- R7.AC3: WHEN wrapper 迁移指定 profile 时，系统 SHALL 只更新该 profile 的 widget overrides 和 profile gridSettings，不得意外修改 default layout 或其他 profiles。
- R7.AC4: WHEN 当前 runtime 是 fallback default 而目标 profile 缺失时，系统 SHALL 默认阻止 profile-scoped migration/write-back；只有显式 create-missing-profile policy 开启时才创建 profile。
- R7.AC5: WHEN wrapper 写回迁移结果时，系统 SHALL 将 `LayoutItem.x/y/w/h` 映射回 dashboard `col/row/sizeX/sizeY`，并 SHALL 保留 `mobileOrder`、`mobileHeight`、visibility、aspect ratio、extensions 和未知 JSON-safe 字段。
- R7.AC6: WHEN wrapper 更新 `gridSettings` 时，系统 SHALL 将 next settings 写入目标 layout/profile settings，并 SHALL NOT 把 runtime-only repair diagnostics 存入 dashboard schema，除非调用方显式放入 extensions。
- R7.AC7: IF wrapper 迁移失败，系统 SHALL 返回原 document 或 cloned unchanged document、error 和 diagnostics，不得用部分失败结果覆盖调用方状态。
- R7.AC8: WHEN wrapper 迁移 partial profile 且 effective item 继承自 default layout 时，系统 SHALL 只为发生几何或明确映射 capability 变化的 item 写入或创建 profile override，不得把 entire effective layout 全量 materialize 成 profile overrides。

### R8: Operation Result、Patches 与 Diagnostics
**用户故事:** 作为集成开发者，我希望迁移和修复结果可观察、可审计、可测试，以便知道哪些 widgets 被缩放、移动、收缩、跳过或无法修复。
**验收标准 (EARS):**
- R8.AC1: WHEN migration 或 repair 完成时，系统 SHALL 返回统一 operation result，至少包含 status、layout、patches、affectedIds、collisions/unresolved、diagnostics 和可选 repair summary。
- R8.AC2: WHEN item 被缩放、clamp、shrink、move、add、remove、repair 或 skip 时，系统 SHALL 在 patches 或 diagnostics 中体现对应 item id、before geometry、after geometry 和原因。
- R8.AC3: WHEN operation result 为 no-op、changed、blocked、fallback 或 error 时，系统 SHALL 使用现有 layout-engine status 语义或向后兼容扩展，且 SHALL 文档化每种状态的提交含义。
- R8.AC4: WHEN diagnostics 输出时，系统 SHALL 至少覆盖 invalid settings、invalid item geometry、bounds clamp、collision detected、repair fallback、static preserved、forced static repair、unresolved item、solver fallback 和 policy unsupported。
- R8.AC5: WHEN debug diagnostics 开启时，系统 SHALL 能输出 input settings summary、migration ratio、repair strategy、duration、candidate count 和 objective summary 或等价调试信息。
- R8.AC6: WHEN operation 被 dashboard wrapper 调用时，系统 SHALL 将 engine diagnostics 与 dashboard diagnostics 聚合，并保留 layoutId、profileId、itemId 和 target settings path。

### R9: Async Executor、预算与交互边界
**用户故事:** 作为大型 dashboard 产品开发者，我希望重型迁移和修复可以走异步执行边界，同时不影响拖拽预览低延迟体验。
**验收标准 (EARS):**
- R9.AC1: WHEN layout settings migration、bulk import、profile migration 或 full repair 被标记为 heavy task 时，系统 SHALL 能通过现有 layout executor 或 worker-capable 边界执行。
- R9.AC2: WHEN repair operation 通过 worker-capable executor 执行时，系统 SHALL 只传递可结构化克隆的 layout、settings、policy、operation metadata 和 diagnostics options。
- R9.AC3: WHEN operation 超过 budget、被取消、返回 stale result 或 worker 不可用时，系统 SHALL 丢弃旧结果或 fallback，并 SHALL 保持当前 committed layout 不被旧任务覆盖。
- R9.AC4: WHEN 用户正在 drag/resize preview 中时，系统 SHOULD NOT 默认在每个 pointer tick 执行 full migration 或 solver-style repair；这些能力默认用于 commit/import/settings-change/profile-change 边界。
- R9.AC5: WHEN async repair 返回结果时，系统 SHALL 与同步 repair 返回相同 shape 的 patches、diagnostics 和 layout result。
- R9.AC6: WHEN solver-style strategy 需要更长运行时间时，系统 SHALL 能通过 budget、timeout、fallback policy 和 diagnostics 表达运行限制，而不阻塞本规格的 heuristic repair。

### R10: 测试、兼容性与非目标
**用户故事:** 作为维护者，我希望本规格的交付有清晰测试面和非目标边界，以便 aspect ratio、editor shell 或完整 solver 能力可以在本规格稳定契约上安全叠加。
**验收标准 (EARS):**
- R10.AC1: WHEN 编写 layout engine 单元测试时，系统 SHALL 覆盖 columns 24->12、12->24、非法 columns、min/max constraints、static item、越界 clamp、碰撞修复、unresolved item 和 no-op visual settings change。
- R10.AC2: WHEN 编写 dashboard wrapper 测试时，系统 SHALL 覆盖 default layout migration、profile-scoped migration、missing profile blocking、unknown field preservation、gridSettings write-back 和失败不覆盖原 document。
- R10.AC3: WHEN 编写 repair 策略测试时，系统 SHALL 覆盖 nearest-fit、first-fit fallback、append-after-bottom、整体平移 clamp、`allowOverlap`、`preventCollision` 和 diagnostics stability。
- R10.AC4: WHEN 编写 async/executor 测试时，系统 SHALL 覆盖 heavy task metadata、stale result discard、timeout/fallback 和 worker serialization-safe input。
- R10.AC5: WHEN 更新 public typings、ESM 或 CommonJS 导出时，系统 SHALL 不破坏现有 `VueGridLayout`、`ResponsiveVueGridLayout`、dashboard document、dashboard responsive、height runtime、editor、persistence 和 layout-engine 导出。
- R10.AC6: WHEN 更新示例或文档时，系统 SHALL 展示 settings migration、collision repair diagnostics 和 dashboard wrapper 的最小用法，并 SHALL 明确本规格完整定义 solver-ready 契约但不内置 full constraint solver。
- R10.AC7: WHEN 完成本规格时，系统 SHALL NOT 实现 UI 设置弹窗、业务 widget 配置、完整 constraint solver、aspect ratio resize、mobile/list 排序重写、height mode 计算、render precision 计算、dashboard context menu 或 persistence schema 改版。

## Clarifications

### Session 2026-05-19

- Q: `layout-settings-migration-collision-repair` 应该选择 dashboard-only helper、engine-first operation，还是完整 solver？ -> A: 选择 B + C0：engine-first operation + dashboard wrapper，并预留 solver-ready 扩展点。
- Q: 当前 spec 是否实现真正 constraint solver？ -> A: 不内置完整 solver；本规格完整交付 deterministic heuristic repair，并完整定义 solver-ready API、diagnostics、objective 和 executor 契约。
- Q: solver-ready 是否会影响其他 specs？ -> A: 会影响 API 设计但不会阻塞；完整 solver 能力可以作为同一契约下的 solver executor 或 `repairStrategy: "solver"` 接入，无需推翻 dashboard document、responsive profile 或 editor shell。
- Q: 默认 repair 策略是什么？ -> A: 使用 deterministic `heuristic`，fallback 可表达为 `nearest-then-first` 或等价策略。
- Q: settings 改变时哪些字段触发几何迁移？ -> A: 默认只有 columns/minColumns/maxRows 等几何边界触发；margin/rowHeight/heightMode/renderPrecision/background 等视觉字段不自动迁移 committed layout。
- Q: static / locked item 在迁移后自己越界或和其他 static 冲突时，默认怎么处理？ -> A: static 优先不动；但自身越界/非法时允许最小 clamp、shrink 或 move，并记录 forced repair diagnostic。
- Q: 这个 spec 是否要分版本完成？ -> A: 不分版本；本规格一次性完整定义 B + C0 的交付范围，包括 heuristic repair、dashboard wrapper 和 solver-ready 契约，但不内置完整 constraint solver。
- Q: 本规格的 solver-ready 契约是否需要实际执行调用方传入的 custom solver？ -> A: 支持 main-thread `customRepairSolver`，失败或非法结果 fallback heuristic；不要求本规格实现 worker-hosted custom solver。
- Q: 迁移指定 profile 时，如果该 profile 只有部分 widget overrides，迁移结果怎么写回？ -> A: 只为发生几何或明确映射 capability 变化的 item 写入或创建 profile override，不全量 materialize effective layout。
- Q: columns ratio migration 默认的取整策略用哪个？ -> A: 使用 `round`，接近 ThingsBoard 行为；之后再做 bounds clamp 和 repair。
