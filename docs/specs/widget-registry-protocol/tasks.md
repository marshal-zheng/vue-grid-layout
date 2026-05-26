# Widget Registry Protocol 实现任务

- [ ] 1. 搭建 `lib/widget-registry/` 基础结构与公共类型
  - 新建 `types.ts`、`index.ts`，定义 `WidgetTypeDefinition`、`WidgetRegistry`、`WidgetRegistryDiagnostic`、`WidgetSettingsDescriptor`、`WidgetLayoutDefaults`、`WidgetRendererHint`、`WidgetInstanceMetadata` 等公开类型。
  - 建立稳定 diagnostic code union，覆盖 duplicate、unknown、invalid type/version/template/settings、unsafe key、capability conflict、missing data、untyped item、renderer hint invalid。
  - 抽出 registry 内部 JSON-safe clone/validation helper，拒绝函数、DOM、Vue ref、循环引用、非 finite number 和 reserved keys。
  - 明确 renderer hint 只允许 `rendererKey`、`componentKey`、`slot` 等 JSON-safe 字符串 metadata。
  - 保持该目录不导入 Vue UI、Pinia、persistence、history 或业务 renderer；dashboard/editor-shell 类型使用 type-only import。
  _需求追溯: R1.AC1, R1.AC4, R1.AC7, R1.AC8, R7.AC1, R7.AC2, R7.AC5, R10.AC2, R10.AC3_

- [ ] 2. 实现 registry core 的注册、查询、过滤与 lifecycle diagnostics
  - 实现 `createWidgetRegistry()`、`register()`、`registerMany()`、`resolve()`、`list()`、`diagnostics()`。
  - 校验 type 非空、格式、重复注册与 allowOverride 行为，重复或非法输入必须返回 structured diagnostic。
  - 实现 category/tag/status/searchText 过滤、include/exclude hidden/deprecated、稳定排序和空 registry/unknown type 结果。
  - 使用 SemVer 字符串校验 `version`，将 invalid、deprecated、replacement、migration hint 暴露为 diagnostics，不执行自动业务迁移。
  _需求追溯: R1.AC2, R1.AC3, R1.AC5, R1.AC6, R1.AC7, R7.AC2, R7.AC3, R7.AC4_

- [ ] 3. 实现 layout defaults 与 item capability bridge
  - 定义并校验 `WidgetLayoutDefaults` 的尺寸、min/max、static、draggable、resizable、bounded、resizeHandles、preserveAspectRatio、aspectRatio 和 extensions。
  - 复用或桥接 `item-capabilities-aspect-ratio` 的 capability/constraint 语义，避免 registry 内重复定义冲突模型。
  - 实现 type default、template override、profile/dashboard/editor metadata 的可诊断合并优先级。
  - 对非法尺寸、非法 handle、非法 aspect ratio、min/max 冲突输出 diagnostics，并阻止 strict policy 生成非法 runtime item。
  - 为缺省 layout defaults 提供文档化 fallback size 和 info diagnostic。
  _需求追溯: R2.AC4, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R7.AC2, R7.AC3_

- [ ] 4. 实现 settings descriptor 默认值、校验与 declarative predicate
  - 在 `settings.ts` 实现 `createWidgetSettingsDefaults()` 与 `validateWidgetSettings()`。
  - 支持 `string`、`number`、`boolean`、`enum`、`color`、`text`、`json`、`object`、`array`、`ref` 等有限字段类型。
  - 支持 defaultValue、required、group/order/options、range/pattern/maxLength、field lifecycle、replacement 和 extensions。
  - 实现 JSON-safe declarative `visibleWhen` / `enabledWhen` predicate，不接受函数、DOM、Vue ref 或不可序列化对象。
  - 对 unknown settings 按 strict/tolerant policy 保留、清理或诊断；不得原地修改输入对象。
  - 明确 `object`、`array`、`json` 只做轻量 JSON-safe/default/required 校验，不实现完整 JSON Schema、`oneOf`、`anyOf` 或外部 validator。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R4.AC7, R7.AC3, R7.AC4_

- [ ] 5. 实现 widget template materialization
  - 在 `template.ts` 实现 `materializeWidgetTemplate()`，从 registry type、template definition、调用方 input 生成 `DashboardEditorShellWidgetTemplate` 和 `WidgetInstanceMetadata`。
  - 实现 layout/settings/bindings/payload 的合并优先级、override/conflict diagnostics、fallback size 和 strict/tolerant 结果。
  - 支持调用方 id、existingIds 冲突规避、可读 id fallback，并保留 shell `idGenerator` 后续覆盖空间。
  - 对 unknown、deprecated、invalid type/template/settings/layout 输出 blocked、warning 或 degraded result，不写坏调用方 document。
  - 将 widget 摘要放入 template metadata/payload，供 shell adapter 的 prepare/commit 阶段消费。
  _需求追溯: R2.AC1, R2.AC3, R2.AC4, R2.AC5, R3.AC5, R6.AC2, R7.AC1, R7.AC2, R7.AC3_

- [ ] 6. 实现 dashboard document `extensions.widget` sidecar helpers
  - 在 `document.ts` 实现 `readWidgetInstanceMetadata()`、`writeWidgetInstanceMetadata()`、`validateDashboardWidgetInstances()`。
  - 将 `widgetType`、`widgetVersion`、`templateId`、`settings`、`bindings`、`payload`、migration metadata、renderer hint 写入 `DashboardItemLayout.extensions.widget`。
  - 删除或更新 widget sidecar 时保留其他 extensions key，strict/tolerant policy 处理 unsafe key 和非 JSON-safe value。
  - validation 保留 unknown registry/unknown type 的原始 sidecar，支持 `untyped-layout-item` 和 requireTypedItems policy。
  - 确保普通 projection/write-back 只更新 geometry/capability，不把 widget type/settings/payload 写入基础 `LayoutItem`，也不把完整 instance 自动复制到未参与编辑的 profile。
  - 为 ThingsBoard/Grafana/legacy metadata 保留 adapter-friendly slots，不提升为核心 `LayoutItem` API。
  _需求追溯: R2.AC2, R2.AC6, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R7.AC1, R7.AC3, R7.AC4_

- [ ] 7. 实现 dashboard editor shell adapter 桥接
  - 在 `shellAdapter.ts` 实现 `createWidgetRegistryPaletteAdapter()`，为 `openWidgetPalette()` 提供 palette-friendly item list 和可选 auto materialize template。
  - 实现 `createWidgetRegistryWidgetAdapter()`，在 `prepareAddWidget`、`preparePasteWidget`、`prepareDuplicateWidget`、`prepareRemoveWidget` 与 commit/rollback 中传递 widget metadata。
  - 在 add/template commit 后定位新增 item，将 instance metadata 写入 `extensions.widget`，并保留现有手写 template 路径兼容。
  - 实现 copy/paste/duplicate clone policy，复制 settings、bindings、payload 和 references，并输出 idMap/sourceIds/newIds diagnostics。
  - 透传 shell/editor/layout 的 collision、bounds、maxRows、profile write blocking、capability diagnostics，不吞掉底层 blocked reason。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R2.AC2, R2.AC5, R5.AC3, R5.AC4_

- [ ] 8. 同步 public entry、package exports、类型与 bundle boundary
  - 新增 `lib/entries/widget-registry.ts`，从 `lib/widget-registry` 暴露公共 API。
  - 更新 `package.json.exports`，新增 `./widget-registry` 的 ESM/CJS/types 条件。
  - 更新 `scripts/build-package.mjs` public entries，生成 `dist/widget-registry.mjs`、`dist/widget-registry.cjs`、`dist/types/widget-registry.d.ts`。
  - 更新 `scripts/test-package-consumers.mjs`，覆盖 ESM、CJS、TypeScript consumer 从 `@marsio/vue-grid-layout/widget-registry` 导入。
  - 检查 root/core/responsive 不静态依赖 registry、dashboard editor shell、Vue UI、Pinia、persistence、renderer 或业务 widget runtime。
  _需求追溯: R8.AC1, R8.AC2, R8.AC3, R8.AC5, R9.AC6_

- [ ] 9. 编写 widget registry 单元测试矩阵
  - 新增 registry core 测试，覆盖 register/resolve/list/search、duplicate type、unknown type、hidden/deprecated lifecycle、stable sorting。
  - 新增 settings 测试，覆盖默认值、字段类型、required、enum/range/pattern、object/array/json 轻量校验、declarative predicate、dangerous key 清理。
  - 新增 template 测试，覆盖合并优先级、fallback size、id conflict、invalid layout/settings/type、renderer hint invalid、strict/tolerant policy。
  - 新增 document 测试，覆盖 `extensions.widget` 读写、删除 sidecar 保留其他 extensions、unknown registry 保留、untyped item、profile override 不复制完整 instance。
  - 将新增测试接入合适 runner 或新增 widget-registry runner，并保持现有测试脚本可发现。
  _需求追溯: R1.AC2, R1.AC3, R1.AC5, R1.AC6, R2.AC4, R2.AC5, R3.AC4, R4.AC3, R4.AC6, R5.AC1, R5.AC5, R7.AC2, R9.AC3_

- [ ] 10. 编写 shell/headless 集成测试
  - 覆盖 registry-generated template 接入 `addWidgetFromTemplate()`，并验证 placement、command、write-back、adapter transaction 路径。
  - 覆盖 palette adapter 通过 `openWidgetPalette()` 返回 template 或 palette list。
  - 覆盖 widget adapter 的 prepare/commit/rollback、prepared mutation metadata、commit 写入 `extensions.widget`、rollback 不污染 document。
  - 覆盖 copy/paste/duplicate 的 clone policy、idMap/sourceIds/newIds diagnostics 和 profile write-back 保持 widget sidecar。
  - 覆盖 shell 缺少 registry/palette adapter 时 legacy handwritten template 仍可用。
  - 覆盖 collision、bounds、maxRows、profile write blocking 与 capability blocked reason 透传。
  _需求追溯: R2.AC1, R2.AC2, R2.AC5, R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R9.AC4_

- [ ] 11. 建立 headless dogfood fixture/workbench
  - 使用公开 API 注册 KPI、line chart、table、markdown、image/video、map/iframe 和 invalid widget type。
  - 覆盖 palette list、template creation、placement、default settings、layout defaults、capability defaults、document sidecar 和 diagnostics 可观察性。
  - 使用 JSON fixtures/headless shell action 验证协议，不引入真实图表库、业务 renderer、远程插件或 UI kit。
  - 将 dogfood 数据作为后续 Editor Kit UI 和 AI/MCP spec 可消费的稳定样例。
  _需求追溯: R9.AC1, R9.AC2, R10.AC1, R10.AC2, R10.AC3, R10.AC5_

- [ ] 12. 更新文档、README 示例与迁移说明
  - 文档化 `@marsio/vue-grid-layout/widget-registry` import path，以及 `./dashboard`、`./dashboard-editor-shell`、`./editor`、`./core`、`./responsive` 的责任边界。
  - 说明 API-first registry 边界、与 item capability 的关系、settings descriptor 写法、diagnostic policy、legacy template 兼容和后续 Editor Kit 消费方式。
  - 说明非目标：不实现完整 toolbar/outline/inspector/context menu UI，不实现业务 renderer、图表库绑定、数据查询 runtime、远程插件、renderer resolver、AI/MCP assistant、nested grids 或 layout engine pro 行为。
  - 为已有手写 `DashboardEditorShellWidgetTemplate`、`palette.open`、`widgetAdapter` 用户提供兼容与迁移 notes。
  _需求追溯: R8.AC4, R8.AC5, R9.AC5, R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC5_

- [ ] 13. 运行完整验证与边界检查
  - 运行新增 widget-registry 单元/集成测试和现有 dashboard editor shell 相关测试。
  - 运行 `npm run build`、`npm test`、`npm run check:package`、`npm run check:bundle`。
  - 按仓库约束优先使用 CLI/headless 验证，不打开浏览器或抢焦点 GUI。
  - 记录任何无法运行的命令、失败诊断或剩余风险，并确认 package/bundle boundary 未回流。
  _需求追溯: R8.AC1, R8.AC2, R9.AC3, R9.AC4, R9.AC6_
