# Responsive Dashboard Profiles 实现任务

- [x] 1. 新增 dashboard responsive profile 模块骨架与公共类型
  - 新建 `lib/dashboard-responsive/types.ts`、`lib/dashboard-responsive/resolve.ts`、`lib/dashboard-responsive/index.ts`，定义 `DashboardTargetView`、`DashboardResponsiveMode`、`DashboardTargetViewRule`、resolver options/result、runtime、event 和 migration result 类型。
  - 复用 `DashboardLayoutDocument`、`DashboardBreakpointProfile`、`DashboardGridSettings`、`DashboardItemLayout`、`DashboardDiagnostic`、`Layout`、`GridEditorMetaById` 等现有类型，不创建第二套 dashboard schema。
  - 定义 dashboard responsive diagnostics code 常量或 helper，覆盖 `profile-fallback`、`unknown-profile-item`、`unsupported-profile-field`、`missing-profile-write-blocked`、`projection-validation-failed` 和 `slot-widget-mismatch`。
  - 确保新增模块不修改 `ResponsiveVueGridLayout`、`LayoutItem` 或现有 responsive persistence/editor API。
  _需求追溯: R1.AC1, R1.AC2, R1.AC3, R1.AC4, R1.AC5, R8.AC1, R8.AC5, R9.AC1_

- [x] 2. 实现 breakpoint、targetView 与 profile 解析核心
  - 实现 `resolveDashboardResponsiveProfile()` 的 breakpoint 计算：显式 `breakpoint` 优先，否则基于 `width` 和 `breakpoints` 推导 `requestedBreakpoint`。
  - 实现 profile 命中与 fallback：命中 `layout.profiles[requestedBreakpoint]` 时返回 `resolvedProfileId`，缺失或非法时 fallback 到 primary/default layout 并输出 `profile-fallback` diagnostic。
  - 实现 `targetView` 解析：显式值优先，其次 `targetViewRule.resolve()`、`mobileBreakpointIds`、`mobileMaxWidth`，最后使用内置保守规则，并记录 `targetViewSource`。
  - 处理未知 breakpoint、空 breakpoints、非法 width、非法 profile 等错误/容错路径，保证返回可诊断结果而非未捕获异常。
  - 输出 `requestedBreakpoint`、`resolvedProfileId`、`targetView`、`fallbackApplied`、resolved settings 初始值和稳定 diagnostics。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7, R5.AC2, R9.AC1, R9.AC2_

- [x] 3. 实现 profile settings 与 widgets 合并
  - 实现 default layout widgets/settings 与 profile widgets/settings 的确定性字段级 override 合并。
  - 映射 `columns`、`minColumns`、`margin`、`outerMargin`、`containerPadding`、`rowHeight`、`mobileRowHeight`、`viewFormat` 到 resolved settings，并为缺失 `columns`、`margin`、`containerPadding`、`rowHeight` 提供明确默认值和 default source diagnostics。
  - 对部分 item override 保留 default item 未覆盖的几何、能力和扩展字段。
  - 对 profile override 中引用 default widgets 不存在的 item id 输出 `unknown-profile-item` warning；仅在 `allowUnknownProfileItems` 开启时投影为 runtime item。
  - 保持同一 document/breakpoint/targetView 多次解析的排序、id 和 diagnostics 顺序稳定。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC5, R3.AC6, R3.AC7, R1.AC4, R9.AC1, R9.AC2_

- [x] 4. 实现 grid runtime projection 与 visibility 语义
  - 在 `viewFormat: 'grid'` 路径复用或扩展 `projectDashboardLayoutDocument()`，生成 `layout`、`gridSettings`、`editorMetaById` 和 diagnostics。
  - 确保 runtime `LayoutItem` 只包含基础几何和已有交互字段，不写入 `mobileOrder`、`mobileHeight`、`mobileHide`、`desktopHide` 或其他 dashboard-only 字段。
  - view 模式下根据 `mobileHide`/`desktopHide` 从 `activeItemIds`、`renderItemIds` 和默认渲染 layout 中排除 hidden item，且不删除 document 数据。
  - edit 模式下保留 hidden item，并通过 `editorMetaById.visible: false` 或等价 metadata 标记当前视图不可见。
  - 输出 `allItemIds`、`activeItemIds`、`renderItemIds`、`hiddenItemIds`，供 composable、组件和测试使用。
  _需求追溯: R3.AC4, R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC7, R1.AC3, R1.AC5, R9.AC2_

- [x] 5. 实现 list runtime projection
  - 在 `viewFormat: 'list'` 路径为 desktop/mobile 都生成单列或全宽派生 runtime layout。
  - 实现 list 排序：mobile 使用 `mobileOrder -> row/col/id`，desktop 使用 `row/col/id`。
  - 实现 list 高度：mobile 优先使用有效 `mobileHeight`，否则使用 `sizeY` 或确定性默认高度；desktop 使用 `sizeY` 或确定性默认高度，并输出高度来源 diagnostics。
  - 在 list runtime 中应用 view/edit visibility 规则：view 过滤 hidden item，edit 保留并标记 invisible。
  - 确保 list projection 不新增 `LayoutItem` 字段，且稳定生成 `x=0`、`w=columns`、累计 `y` 和派生 `h`。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC5, R4.AC6, R4.AC7, R4.AC8, R3.AC6, R9.AC2_

- [x] 6. 实现 dashboard responsive write-back
  - 新增 `writeDashboardResponsiveRuntimeToDocument()`，接收 document、runtime、committed layout 和 write-back options。
  - default grid 路径只更新 primary/default layout；profile grid 路径只更新目标 profile override；不得覆盖其他 profiles。
  - fallback view 路径返回 noop diagnostic，不创建 profile、不写回 document；fallback edit 路径默认返回 `missing-profile-write-blocked`，仅在 `createMissingProfileOnEdit` 开启时创建目标 profile。
  - mobile list 排序/高度变化写回 `mobileOrder`/`mobileHeight`，且不覆盖 desktop `row`/`sizeY`。
  - desktop list 排序/高度变化写回目标 layout/profile item 的 `row`/`sizeY`，且不写 mobile-only 字段。
  - 保留 revision/source/meta、unknown JSON-safe fields、extensions、非活动 profiles 和未参与投影 widgets；遇到 unknown item、非法几何、非法 profile 或 validation failure 时返回 structured error/diagnostic，不覆盖调用方 document。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R7.AC8, R6.AC4, R9.AC1, R9.AC2_

- [x] 7. 实现 legacy responsive layouts 迁移 helper
  - 新增 `createDashboardDocumentFromResponsiveLayouts()`，将现有 `LayoutsMap`、`breakpoints`、`cols`、`margin`、`containerPadding` 转成 `DashboardLayoutDocument` default layout 和 profiles。
  - 默认选取最大 breakpoint width 对应 layout 作为 default layout，其他 breakpoint 转成 `profiles[breakpoint].widgets`。
  - 将 cols/margin/containerPadding 映射为 default/profile `DashboardGridSettings`，并文档化 `lg/md/sm/xs/xxs` 等 breakpoint key 的映射规则。
  - 保证 helper 不修改输入对象；无法表达的 legacy responsive 行为输出 deferred diagnostics。
  _需求追溯: R8.AC2, R8.AC3, R8.AC4, R1.AC3, R9.AC4, R9.AC5_

- [x] 8. 实现 Vue composable 状态模型
  - 新增 `lib/dashboard-responsive/useDashboardResponsiveProfileModel.ts`，实现 `useDashboardResponsiveProfileModel()`。
  - 支持 `document`、`width`、`breakpoints`、显式 `breakpoint`、显式/推导 `targetView`、`mode`、validation、write-back 和 unknown item 选项的 reactive 输入。
  - 输入变化时重新解析 profile，更新 `layout`、`gridSettings`、`editorMetaById`、`requestedBreakpoint`、`resolvedProfileId`、`fallbackApplied`、diagnostics 等 state。
  - 按稳定顺序发出 `breakpointChange`、`profileChange`、`projectionChange`、`diagnosticsChange`、`projectionError` 和 `documentChange` 事件。
  - projection 失败时保留上一份可用 runtime，不用损坏 projection 覆盖 active state。
  - 组件卸载或 `stop()` 时释放 watcher、内部 editor controller、layout executor 或订阅资源。
  _需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC6, R2.AC4, R9.AC1, R9.AC2_

- [x] 9. 集成 editor controller 与 scoped layout commit
  - 在 composable 中创建或接入 scoped editor controller，使其绑定当前 active `layout` 和 `editorMetaById`。
  - projection 改变时同步 editor 外部 layout，清理无效 selection，并避免把 dashboard-only state 传入基础 `VueGridLayout`。
  - layout commit 时通过 `writeDashboardResponsiveRuntimeToDocument()` 生成 cloned document，并触发 `update:document`/`documentChange` 语义。
  - 确保内置 editor controller 使用 dashboard profile 层管理的单 active layout，不复用 legacy `LayoutsMap` 的 responsive editor 语义。
  - 保持 layout engine 作为内层 grid/editor operation runner 依赖，不在本规格重写 collision repair。
  _需求追溯: R5.AC5, R6.AC4, R7.AC1, R7.AC2, R7.AC7, R1.AC5, R9.AC1, R9.AC3_

- [x] 10. 新增 `DashboardResponsiveVueGridLayout` 薄组件
  - 新建 `lib/DashboardResponsiveVueGridLayout.tsx`，接收 dashboard document、width、breakpoints、可选 breakpoint、target view、mode、layoutEngine、editor 和基础 grid passthrough props。
  - 使用 `useDashboardResponsiveProfileModel()` 生成 active runtime，并将 `modelValue`、`cols`、`margin`、`containerPadding`、`rowHeight`、`layoutEngine` 和 scoped editor prop 传给内层 `VueGridLayout`。
  - 实现 slot child 与 active item ids/child keys 的确定性映射；缺少 widget child 或未知 child 时产生 `slot-widget-mismatch` diagnostics，不让 runtime 崩溃。
  - 转发基础 drag、resize、drop 和 editor 事件，并提供 dashboard profile context 或可查询 state。
  - 不内置 widget card、菜单、弹窗、palette、toolbar、material-style shell 或 ThingsBoard 业务对象。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R6.AC7, R1.AC1, R1.AC5, R9.AC3_

- [x] 11. 接入公共导出、类型声明和兼容边界
  - 在 ESM 入口、`lib/cjs.ts`、`typings/index.d.ts` 中导出 `DashboardResponsiveVueGridLayout`、resolver、write-back、migration helper、composable 和相关类型。
  - 确认新增导出不破坏现有 `VueGridLayout`、`ResponsiveVueGridLayout`、persistence、editor 和 layout-engine 导出。
  - 增加类型导出测试，确认 resolver/composable/component props、result、event payload、diagnostics 和 migration helper 类型可被消费者导入。
  _需求追溯: R8.AC1, R8.AC5, R9.AC4, R1.AC2, R6.AC6_

- [x] 12. 增加 resolver、write-back 和 migration 单元测试
  - 新增或扩展 dashboard responsive core 测试，覆盖 breakpoint/profile 命中、profile fallback、targetView 显式优先和推导、空/未知 breakpoint 错误路径。
  - 覆盖 settings 合并、默认值 diagnostics、partial widget override、unknown profile item、稳定排序和 dashboard-only 字段不进入 `LayoutItem`。
  - 覆盖 grid visibility、desktop/mobile list sorting、mobileHeight projection、list full-width geometry、profile-scoped write-back、fallback write blocking 和 `createMissingProfileOnEdit`。
  - 覆盖 legacy migration helper 的 default/profile 转换、breakpoint key 映射、输入 immutability 和 deferred diagnostics。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC5, R2.AC7, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R4.AC1, R4.AC2, R4.AC5, R4.AC6, R4.AC8, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R8.AC2, R8.AC3, R8.AC4, R9.AC2_

- [x] 13. 增加 composable 与组件测试
  - 覆盖 `useDashboardResponsiveProfileModel()` 的 reactive document/width/breakpoint/targetView/mode 变化、事件顺序、projection error 保留上一份 runtime 和 stop cleanup。
  - 覆盖 editor controller 集成：projection 改变时同步 layout，hidden edit item 可被发现，layout commit 触发 dashboard document write-back。
  - 增加 `DashboardResponsiveVueGridLayout` 浏览器或组件测试，覆盖渲染、width/breakpoint 切换、slot/widget mismatch diagnostics、基础 grid 事件转发和 `update:document`。
  - 增加回归断言，确认现有 `ResponsiveVueGridLayout` 行为、事件和公共 API 不受 dashboard responsive profile 新层影响。
  _需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R9.AC3_

- [x] 14. 更新文档、README 和示例
  - 在 README 或相关 docs 中新增 headless resolver/composable 示例，展示 document + width + breakpoints 到 runtime layout 的用法。
  - 新增 `DashboardResponsiveVueGridLayout v-model:document` 薄组件示例，说明 slot key 与 widget id 的映射规则。
  - 新增 legacy responsive migration 示例，说明 `LayoutsMap`、`cols`、`margin`、`containerPadding` 如何转成 dashboard default layout 和 profiles。
  - 明确本规格不包含 height modes、render precision、aspect ratio、collision repair、dashboard context menu、widget palette 或业务 widget shell，并说明后续 specs 如何复用 profile resolution、settings projection、mobile/list runtime 和 write-back 边界。
  _需求追溯: R9.AC5, R9.AC6, R8.AC2, R8.AC3, R1.AC5_

- [x] 15. 运行最终验证与发布面检查
  - 运行 dashboard responsive 相关单元测试、组件/浏览器测试、类型测试和现有 responsive/grid/editor 回归测试。
  - 运行项目现有 test/build 命令，确认新增模块、CJS/ESM/typings 导出和 README 示例不破坏现有消费者。
  - 检查 diagnostics 覆盖、public API 命名、任务需求追溯和非目标边界，避免实现时扩入 height/precision/aspect/collision/editor shell 范围。
  _需求追溯: R1.AC2, R1.AC5, R8.AC5, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6_
