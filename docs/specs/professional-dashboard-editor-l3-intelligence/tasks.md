# 专业仪表盘编辑器 L3 智能编排实现任务

- [x] 1. 冻结 L3 公共类型、内部类型与模块边界
  - 在 `lib/editor/types.ts` 或新增 `lib/editor/intelligenceTypes.ts` 中定义 `GridEditorIntelligenceInput`、`GridEditorIntelligenceState`、snap candidate、spacing relation、distribution candidate、section/row state、toolbar state、diagnostics 和 blocked reason 类型。
  - 明确稳定公开类型与内部 helper 类型的导出边界，避免 toolbar、guides、Vue adapter 直接依赖临时结构。
  - 扩展 diagnostics code 命名规范，覆盖 candidate count、snap source、distribution mode、section/row source、duration、degraded reason 和被过滤原因。
  - 在设计注释中标明 `editor/intelligence`、`editor/commands`、`editor/controller`、`layout-engine`、`VueGridLayout` 和示例 UI 的职责边界。
  _需求追溯: R1.AC1, R1.AC2, R1.AC4, R1.AC5, R1.AC6, R9.AC1, R9.AC6, R11.AC1, R11.AC3, R11.AC4_

- [x] 2. 实现 `editor/intelligence` 纯函数几何内核
  - 新增 `lib/editor/intelligence.ts`，实现 `computeGridEditorIntelligence()`，输入 layout、active item、selection、meta、cols、maxRows、margin、rowHeight、sectionRows 和 options，输出稳定排序的 intelligence state。
  - 计算 item rects、几何索引、邻居关系、基础 spacing relations、section/row membership、候选过滤原因和 diagnostics。
  - 复用或兼容现有 layout engine row/column occupancy index，500+ items 时按预算降级：先减少预测候选，再减少 spacing chips，最后保留 committed preview 的流畅性。
  - 保证模块 SSR-safe，不访问 DOM、window、document、clipboard、rAF 或组件实例。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC5, R10.AC6, R11.AC2_

- [x] 3. 将 guides、spacing chips 与 measurement HUD 派生迁移到 intelligence
  - 保留 `computeGridEditorGuides()` 作为兼容入口，但内部改为消费 intelligence state，而不是在 `guides.ts` 中维护第二套几何规则。
  - 输出 predictive guides、snapped guides、anchor edges、spacing chips、equal spacing state、measurement HUD 和 debug/full candidates 的统一 guide state。
  - 自动根据 interaction start geometry 计算 `Δx`、`Δy`、`Δw`、`Δh`，并在 blocked preview 时输出 blocked reason、message key 和 affected ids。
  - 保持旧 `thresholdPx`、`showSpacingLabels`、`maxVisibleGuides` 等配置兼容，并记录 deprecation 或映射关系。
  _需求追溯: R1.AC1, R2.AC4, R7.AC5, R8.AC1, R8.AC2, R8.AC3, R8.AC5, R8.AC6, R9.AC3, R11.AC2_

- [x] 4. 实现 snap candidate resolver 与候选校验
  - 新增 `resolveGridEditorSnap()` 或等价纯函数，根据 intelligence state、interaction、candidate geometry 和 snap options 选择 deterministic snapped geometry。
  - 支持 edge、center、spacing、section-row candidate，并按 priority、proximity、distance、scope 和 blocked reason 稳定排序。
  - 对 collision、bounds、maxRows、locked、capability、section/row policy 冲突执行 deterministic skip/fallback；全部失败时返回 blocked 或 degraded diagnostics。
  - `snap === false` 时仍可输出 predictive guides，但 resolver 不得修改 preview/commit geometry，也不得标记 active snapped 视觉。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R5.AC2, R10.AC2, R11.AC3_

- [x] 5. 将 magnetic snap 接入 drag、resize 与 external drop 闭环
  - 将 `VueGridLayout` 中的 `updateEditorGuides()` 演进为 `updateEditorIntelligence()`，在交互 tick 中先构造 intelligence input，再把 snapped geometry 送入 layout engine preview。
  - drag preview 命中 snap 时修正 placeholder x/y，drag stop 使用同一 snapped 坐标提交。
  - resize preview 命中 snap 时根据 handle 和约束修正 x/y/w/h，resize stop 使用同一 geometry 提交。
  - external drop 悬停时根据 snap 或 section/row drop zone 更新 placeholder，drop commit 使用同一 placement。
  - 发出 guide-change、preview-change 或 snap-change 事件，包含 previousGuideId、nextGuideId、snapKind 和 resulting geometry。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC6, R2.AC7, R7.AC1, R7.AC5, R8.AC1, R8.AC2, R9.AC2_

- [x] 6. 扩展 align/distribute/tidy 命令类型、payload 与校验
  - 扩展 `GridEditorCommandType`，增加 `align`、`distribute`、`tidy` 或等价命令，并同步源码类型、runtime command check、CJS/UMD 导出和 `typings/index.d.ts`。
  - 在 `commands.ts` 中扩展 normalize、`isLayoutCommand()`、capability key、selection count 校验、invalid-input 校验、commandPolicy 和 result diagnostics。
  - align 至少校验 2 个有效 item；distribute/tidy 至少校验 3 个有效 item；blocked reason 可被 toolbar state 复用。
  - 保证 toolbar、keyboard、context-menu 和 API 触发同一命令时走同一 command pipeline、beforeCommand guard、history、dirty 和 persistence 边界。
  _需求追溯: R3.AC1, R3.AC4, R3.AC5, R3.AC6, R4.AC1, R4.AC3, R4.AC4, R9.AC1, R9.AC6_

- [x] 7. 实现 align command executor
  - 在 `controller.ts` 或 `editor/commands` executor 中实现 align 几何 patch 计算，支持 left、center-x、right、top、center-y、bottom。
  - 支持相对 selection bounds、active item、last selected item、section/row boundary 和 explicit guide line 的 align target。
  - 修改前通过 layout engine 或现有 mutation 边界校验 collision、bounds、maxRows、locked 和 capability。
  - command result 输出 old/new geometry patches、affectedIds、computed target line、section/row context 和 intelligence diagnostics。
  _需求追溯: R3.AC2, R3.AC5, R3.AC6, R3.AC7, R6.AC2, R10.AC3, R11.AC5_

- [x] 8. 实现 distribute、equal spacing 与 tidy executor
  - 在 intelligence 中计算 horizontal、vertical、spacing-x、spacing-y distribution candidates，包含当前 spacing、目标 spacing、偏差、是否等距和会移动的 item ids。
  - 实现 distribute command，支持 equal spacing、edge-to-edge、center-to-center、selection bounds、active item anchor 和 section/row bounds。
  - 实现 tidy command，先按 axis、row/section membership 和 overlap 分组，再在组内应用等距与最小间距规则。
  - 对 collision、越界或 maxRows 违规执行 deterministic fallback；仍失败时返回 blocked 且不修改 committed layout。
  _需求追溯: R3.AC3, R3.AC5, R3.AC6, R3.AC7, R5.AC1, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R10.AC3_

- [x] 9. 建立完整 headless toolbar state 与示例工具栏
  - 新增 `deriveGridEditorToolbarState()`、`getToolbarState()` 或等价 helper，输出每个 command 的 enabled、disabled reason、requiredSelectionCount、blocked ids、message key 和 intelligence summary。
  - 示例 toolbar 覆盖 view/edit、save/discard/reset、undo/redo、copy/paste/duplicate/delete、lock/unlock、align、distribute、tidy、section/row 操作和 diagnostics 开关。
  - 确认 toolbar、keyboard、context-menu 和 API 触发同一命令时 result 与事件顺序一致。
  - 保持核心 headless-first，示例 UI 不成为核心包强依赖，README 明确稳定 API 与示例 UI 边界。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R8.AC4, R9.AC5_

- [x] 10. 建立 section/row metadata、归一化、迁移与持久化 envelope
  - 新增 `sectionRows.ts` 或等价模块，实现 `GridEditorSectionRowState`、`normalizeGridEditorSectionRows()`、unknown version 安全忽略、orphan membership 清理和 diagnostics warning。
  - 使用 editor sidecar envelope 与 layout 原子保存/恢复 sectionRows，不把业务敏感权限写入 layout item。
  - 实现 locked、collapsed、order、bounds policy、dropPolicy、crossScopePolicy 和 allowed drop zones 的基础校验。
  - 无 metadata 时保持当前 flat grid 行为，不要求用户迁移已有 layout。
  _需求追溯: R6.AC1, R6.AC4, R6.AC6, R6.AC7, R9.AC2, R9.AC4, R11.AC4_

- [x] 11. 将 section/row 语义接入 snap、drop、commands 与 keyboard nudge
  - intelligence candidate 优先选择同 section/row 内的 guide、spacing、distribution 和 drop zone；跨 section/row 行为必须由 options 明确允许。
  - external drop 在 section/row 边界或空区域显示明确 section/row 与 grid slot 的 placement placeholder。
  - align/distribute/tidy/keyboard nudge 遇到 locked 或 collapsed section/row 时返回 structured blocked reason，并清理不再有效的 selection。
  - section/row move、collapse、expand、delete 或 reorder 时保持子 item layout、selection、history、persistence 和 diagnostics 一致。
  _需求追溯: R6.AC2, R6.AC3, R6.AC4, R6.AC5, R5.AC4, R8.AC3, R10.AC4, R11.AC5_

- [x] 12. 重构 Vue 渲染适配与 guide 像素几何
  - 在 `VueGridLayout.tsx` 中把复杂业务算法收敛到 adapter 调用，组件只负责采集交互输入、调用 preview/commit、渲染 guide state 和转发事件。
  - 拆分 edge、center、grid line、item edge 的像素换算函数，修正 margin/gutter 场景下 left/right/top/bottom/center-x/center-y 共用半 gutter 公式导致的偏移。
  - 建立 placeholder、active item、anchor edge、snapped guide、predict guide、spacing chip、HUD 和 grid lines 的稳定渲染层级。
  - 用户关闭 guides、chips 或 HUD 时，placeholder 仍独立表达落点；view mode 或 editor=false 时清空辅助层。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC5, R9.AC2, R11.AC1, R11.AC2_

- [x] 13. 重制 CSS 视觉层级、状态反馈与 reduced motion
  - 更新 `css/styles.css`，区分 selection blue、guide pink、spacing green、placeholder gray ghost、blocked red 和 debug layer 视觉语义。
  - 将 placeholder 强化为高对比 ghost-card，并为 snapped guide dashed-to-solid、anchor edge 1px 强调、spacing equal green、HUD compact chip 和 blocked state 增加稳定 class/data attribute。
  - 实现 snap 80ms pulse 或等价微反馈；`prefers-reduced-motion: reduce` 下保留状态变化但禁用 pulse、HUD 跟随和大幅动画。
  - 确保 placeholder、outline、guide、chip、HUD 和 grid lines 不互相遮断，并支持截图或 DOM 断言。
  _需求追溯: R2.AC6, R7.AC1, R7.AC2, R7.AC4, R7.AC6, R8.AC5, R10.AC5_

- [x] 14. 补齐公开导出、类型声明、README 与迁移文档
  - 在 `lib/editor/index.ts`、`lib/cjs.ts`、`typings/index.d.ts` 和 README 中同步导出 intelligence、align/distribute/tidy payload、section/row metadata、toolbar state、diagnostics 和 guide payload。
  - README 增加最小 headless 示例和完整 dashboard editor 示例，说明 API、toolbar、section/row、snap、HUD、visual layer、deprecation 和 known limits。
  - 文档明确 `snap: false`、旧 guides options、无 editor、unknown sectionRows version 和 invalid command payload 的兼容行为。
  - 发布说明列出未完成或受限能力，不用模糊文案伪装成已完成。
  _需求追溯: R3.AC1, R4.AC6, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R10.AC7_

- [x] 15. 扩展 intelligence、snap、command 与 section/row 单元测试
  - 新增或扩展 `test/editor-core.test.ts` / `test/editor-intelligence.test.ts`，覆盖 intelligence 确定性、candidate 排序、diagnostics、500+ item 降级、SSR-safe 和 debug/full candidates 隔离。
  - 覆盖 drag/resize/drop snap resolver 被 preview/commit 调用，`snap: false` 不改 geometry，冲突 candidate 被 deterministic skip。
  - 覆盖 align 2 item、distribute/tidy 3+ item、mixed locked all-or-nothing、skip-blocked、collision fallback、section-scoped distribute 和 command result diagnostics。
  - 覆盖无 metadata flat grid 兼容、section-scoped drop、locked section blocked、collapsed section selection 清理、unknown version warning 和 persistence restore。
  _需求追溯: R1.AC2, R1.AC3, R2.AC2, R2.AC5, R10.AC1, R10.AC2, R10.AC3, R10.AC4, R11.AC6_

- [x] 16. 扩展浏览器集成、视觉回归与示例 smoke
  - 扩展 `test/editor-component-browser.test.js`，验证 drag、resize、external drop 的 placeholder geometry 与最终 committed layout 坐标一致。
  - 覆盖 guide 像素位置、placeholder 层级、HUD delta、spacing equal、toolbar disabled reason、view mode 清空、debug/user layer 隔离和 reduced-motion。
  - 对 Professional Dashboard Editor 示例增加 align/distribute/tidy、section/row、toolbar、diagnostics 和 500+ item smoke。
  - 使用 DOM 断言或截图检查确保 text/chip/HUD 不遮挡关键内容，placeholder 在关闭 guides/chips/HUD 时仍可理解。
  _需求追溯: R2.AC7, R7.AC6, R8.AC6, R9.AC2, R10.AC5, R10.AC6_

- [x] 17. 建立性能预算、发布门槛与长期追溯矩阵
  - 将 500+ item intelligence、snap resolver、command executor 和 browser smoke 纳入发布前验证，记录 duration、candidate count、degraded reason 和 fallback 统计。
  - 发布前运行 lint、typecheck、build、editor core tests、browser integration tests、professional dashboard example smoke 和性能预算命令。
  - 在 tasks、README 或 release checklist 中维护 requirements -> design -> tasks -> tests 的追溯矩阵，review 时必须能从 R id 找到实现和验证。
  - 若某验收项延后，明确标为限制或后续任务，并保留 blocked/degraded diagnostics，不改变外部 API 承诺。
  _需求追溯: R1.AC3, R1.AC5, R10.AC1, R10.AC6, R10.AC7, R11.AC3, R11.AC6_

- [x] 18. 建立多人维护治理与后续扩展入口
  - 为新增模块补充 reviewer checklist，要求新能力优先扩展 intelligence state、command payload 和 diagnostics，而不是在 `VueGridLayout.tsx` 内追加私有逻辑。
  - 约定 diagnostics code、command payload、guide payload、toolbar state、section metadata 的命名和版本策略，避免跨层同名不同义。
  - 为未来属性面板、协作编辑、AI 自动排版、模板化 dashboard 预留复用 command result、history metadata、section/row model 和 intelligence diagnostics 的入口。
  - 多人并行实现时按模块边界拆分 PR：intelligence、commands、Vue adapter、visual CSS、docs/tests，避免同一任务跨层无界修改。
  _需求追溯: R1.AC6, R10.AC1, R11.AC1, R11.AC2, R11.AC3, R11.AC4, R11.AC5, R11.AC6_
