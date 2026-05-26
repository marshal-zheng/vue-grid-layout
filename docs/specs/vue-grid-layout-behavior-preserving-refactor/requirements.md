# Vue Grid Layout 行为保持型组件边界重构 需求规格

## 简介

当前项目已经具备单布局网格、响应式布局、拖拽、resize、外部 drop、history、persistence、layout engine、专业 editor、smart guides 与浏览器测试覆盖。与此同时，核心组件边界正在变重：`lib/VueGridLayout.tsx` 已达到 2401 行，并同时承担 public contract、layout 同步、history/persistence 协调、layout-engine 调度、drag/resize/drop 交互、auto-scroll、editor selection/snap/guides 与 overlay 渲染等职责；`lib/GridItem.tsx` 和 `lib/ResponsiveVueGridLayout.tsx` 也已经超过 500 行，处于需要边界审查的规模。

本规格目标是做一次行为保持型组件边界重构：在不影响现有功能、公开 API、事件 payload、CSS class、示例和测试的前提下，让根组件重新回到“公开契约 + orchestration”的角色。重构必须遵循 `.codex/skills/vue-component-best-practices` 的组件 review gate：显式 public surface、明确状态所有权、wrapper attrs 有意路由、逻辑进 composable、渲染边界进真实子组件或 render helper，且不把一个大组件简单搬成一个大 composable。

## 范围与非目标

本规格覆盖 `VueGridLayout`、`GridItem`、`ResponsiveVueGridLayout` 的内部结构治理、事件契约显式化、行为锁定测试、拆分后的 ownership 规则和防复胖门禁。实现优先级以 `VueGridLayout` 边界治理为主，`GridItem` 和 `ResponsiveVueGridLayout` 只做与事件、attrs、wrapper 边界、行为兼容直接相关的必要 cleanup。它不新增新 editor 功能，不重写 layout engine 算法，不改变 persistence 文档模型，不改默认样式视觉，不做全文件格式化，不重命名现有公开 prop/event/type，也不引入 breaking change。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/CORE-runtime-foundation/README.md
SPEC_BRIEF: docs/initiatives/CORE-runtime-foundation/briefs/CORE-vue-grid-layout-behavior-preserving-refactor.md

COVERAGE: behavior-refactor

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| behavior-refactor | R1-R10 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: 现有可观察行为必须保持不变
**用户故事:** 作为现有库用户，我希望组件重构后所有已依赖的功能、事件、类型和样式行为保持兼容，以便升级不会破坏现有 dashboard、demo 或业务集成。
**验收标准 (EARS):**
- R1.AC1: WHEN 本重构修改 `VueGridLayout`、`GridItem` 或 `ResponsiveVueGridLayout` 的内部结构时，系统 SHALL 保持现有公开 props、默认值、slots、事件名称、事件触发时机、事件 payload 形状、CSS class、data attribute、导出类型和示例用法兼容。
- R1.AC2: WHEN drag、resize、drop、breakpoint 切换、persistence load/save、history push/replace、layoutEngine preview/commit 或 editor command 发生时，系统 SHALL 保持 `layoutChange`、`update:modelValue`、`update:layouts`、`breakpointChange`、`widthChange` 以及 drag/resize/drop 回调的触发顺序和提交边界不变。
- R1.AC3: WHEN preview frame、placeholder、blocked state、editor guides、spacing chips、measurement HUD 或 anchor edge 渲染时，系统 SHALL 保持现有 DOM class、状态 class、层级语义和可被测试选择器识别的结构兼容。
- R1.AC4: IF 某个内部拆分会导致用户可观察行为变化，系统 SHALL 阻止该拆分进入本规格实现范围，除非另行创建 breaking-change 规格并显式批准。
- R1.AC5: WHEN 本重构完成任一阶段时，系统 SHALL 通过现有相关测试和新增 characterization tests 证明用户可观察行为未变化。

### R2: 先锁定行为再移动代码
**用户故事:** 作为库维护者，我希望在拆分大组件前先用测试记录当前行为，以便重构只改变内部结构而不是悄悄改变运行语义。
**验收标准 (EARS):**
- R2.AC1: WHEN 开始迁移事件、交互或 overlay 逻辑前，系统 SHALL 先补充或确认 characterization tests 覆盖 dragStart/drag/dragStop、resizeStart/resize/resizeStop、dropDragOver/drop、layoutChange、model update、persistence commit、layoutEngine commit-only 与 editor guide DOM。
- R2.AC2: WHEN 新增 characterization tests 时，系统 SHALL 优先断言事件 payload、事件次数、提交时机、placeholder/blocked class、editor guide 数量与关键 CSS class，而不是只断言组件没有抛错。
- R2.AC3: WHEN 现有测试已经覆盖某个行为时，系统 SHALL 在任务中标注对应测试文件和断言，不重复编写低价值测试。
- R2.AC4: IF 现有行为本身不一致或难以界定，系统 SHALL 先用当前实现作为兼容基线记录下来，并 SHALL NOT 在同一个任务中同时修复行为和移动代码。
- R2.AC5: WHEN 任一重构步骤完成时，系统 SHALL 至少运行该步骤相关的最小测试集合；高风险阶段 SHALL 运行完整 `yarn test` 或等价命令。

### R3: 公开事件契约必须显式且兼容
**用户故事:** 作为 Vue 组件集成者，我希望组件声明所有公开事件，同时保持现有 `@drag`、`@resize`、`@drop` 等监听方式和 payload 不变，以便类型、文档和 Vue fallthrough 行为更清晰。
**验收标准 (EARS):**
- R3.AC1: WHEN 整理 `VueGridLayout` 的事件契约时，系统 SHALL 显式声明 `update:modelValue`、`layoutChange`、`dragStart`、`drag`、`dragStop`、`resizeStart`、`resize`、`resizeStop`、`drop`、`dropDragOver` 等当前公开事件，并 SHALL 保持现有 kebab/camel 监听兼容语义。
- R3.AC2: WHEN Vue 由于声明 `emits` 导致事件 listener 不再留在 `$attrs` 时，系统 SHALL 将内部调用从 `$attrs` 回调迁移到等价 `emit()` 路径，并 SHALL 用测试证明 payload 与触发时机未变化。
- R3.AC3: WHEN 整理 `GridItem` 的内部事件通道时，系统 SHALL 区分内部 vendor wrapper 回调和对外公开组件事件；内部事件可保持私有，但不得依赖不明确的 `$attrs` 泄漏改变行为。
- R3.AC4: WHEN 整理 `ResponsiveVueGridLayout` wrapper 时，系统 SHALL 明确 `$attrs` 的目标是内层 `VueGridLayout` 或 wrapper root，并 SHALL 保持现有响应式组件上的事件监听继续可用。
- R3.AC5: IF 某个事件 payload 目前包含 `layout`、`oldItem`、`item`、`placeholder`、原始事件或 DOM node，系统 SHALL 保持这些参数的顺序、是否为 `undefined`、对象字段和当前引用/克隆语义。
- R3.AC6: WHEN 处理非事件 `$attrs` 时，系统 SHALL 采用长期收益最大的有意透传策略：将未被组件 props/emits 消费的 `id`、`data-*`、`aria-*`、非冲突 class/style 和其他安全 DOM attrs 透传到根 grid DOM 或明确的 wrapper root；IF attr 与组件受控 prop、内部事件或现有 class/style 合并规则冲突，系统 SHALL 保持组件受控语义优先并记录该限制。

### R4: 根组件只保留公开契约与 orchestration
**用户故事:** 作为后续维护者，我希望 `VueGridLayout` 根组件不再直接承载所有业务逻辑和渲染细节，以便 review、调试和后续功能扩展都发生在清晰边界中。
**验收标准 (EARS):**
- R4.AC1: WHEN 重构 `VueGridLayout` 时，系统 SHALL 将根组件目标职责限制为 props/emits/slots/attrs 决策、顶层状态 wiring、子模块组合和最终 render orchestration。
- R4.AC2: WHEN 处理 layout/modelValue/children/history/persistence 同步时，系统 SHALL 将相关状态转移、watcher 和提交边界抽到 `useGridLayoutModel` 或等价 composable，并 SHALL 保持现有 `markRaw`、clone、history replace/push 和 persistence commit 语义。
- R4.AC3: WHEN 处理 layout engine executor/scheduler/interactionController 时，系统 SHALL 将 request 构造、preview/commit 调度、legacy mismatch 诊断和 dispose 生命周期抽到 `useGridLayoutEngineBridge` 或等价模块，并 SHALL 保持 legacy fallback 与 worker/main-thread 行为兼容。
- R4.AC4: WHEN 处理 drag/resize/drop 时，系统 SHALL 将交互 start/preview/stop、placeholder、blocked state、drop strategy、auto-fit 和 event emission 协调抽到 interaction 边界，并 SHALL 不重写现有布局算法。
- R4.AC5: WHEN 处理 auto-scroll、rAF 合帧或 DOM point/container 计算时，系统 SHALL 将其抽到独立 DOM-side composable，并 SHALL 不让该模块读写 layout engine 或 persistence 状态。
- R4.AC6: WHEN 拆分完成后，`VueGridLayout.tsx` 根文件 SHOULD 以清晰边界为第一目标并控制在 800 行以内；IF 为达到行数目标需要拆出只转发大型 prop bag 或无独立责任的假边界，系统 SHALL 保留更清晰的责任边界而不是机械压缩行数。

### R5: Editor overlay 与智能辅助渲染必须形成真实边界
**用户故事:** 作为 editor 功能维护者，我希望 guides、spacing chips、measurement HUD 和 anchor edges 的渲染从根组件中独立出来，以便 editor 渲染可以单独 review 和测试，同时不改变现有 CSS 契约。
**验收标准 (EARS):**
- R5.AC1: WHEN 抽取 editor overlay 渲染时，系统 SHALL 保持 `.vue-grid-editor-guide`、`.vue-grid-editor-spacing-chip`、`.vue-grid-editor-measurement-hud`、`.vue-grid-editor-anchor-edge`、debug layer/panel 等现有 class 和 data attribute 兼容。
- R5.AC2: WHEN overlay 模块接收几何换算能力时，系统 SHALL 通过明确 props/context 传入 `cols`、`margin`、`containerPadding`、`rowHeight`、`width`、`layout`、guide state 和 item map，而不是读取根组件内部大状态包。
- R5.AC3: WHEN overlay 渲染被抽到子组件或 render helper 时，系统 SHALL 避免创建只转发大量 props 和事件的薄壳；新边界必须拥有清楚的渲染职责和小型输入面。
- R5.AC4: WHEN editor guides 关闭、view mode、debug layer 或 debug panel 切换时，系统 SHALL 保持现有显示/隐藏逻辑、guide 数量限制和 aria-live 行为。
- R5.AC5: IF overlay 抽取后浏览器测试中的 guide DOM、drop-target、locked/view-mode class 或 screenshot smoke 行为变化，系统 SHALL 回退或修正抽取，直到兼容。

### R6: GridItem 和 Responsive wrapper 的边界必须清晰
**用户故事:** 作为组件维护者，我希望 `GridItem` 和 `ResponsiveVueGridLayout` 的 wrapper 责任明确，以便第三方 draggable/resizable 包装、responsive 状态和内层 grid 事件不会互相泄漏。
**验收标准 (EARS):**
- R6.AC1: WHEN 重构 `GridItem` 时，系统 SHALL 保留其作为 draggable/resizable vendor wrapper 和 grid item positioning wrapper 的角色，并 SHALL 将 drag/resize pixel-to-grid 换算、resize constraints、style 生成和 dropping movement 拆为可测试 helper 或 composable。
- R6.AC2: WHEN 重构 `GridItem` 时，系统 SHALL 保持现有 wrapper class、child class/style 合并顺序、DraggableCore/Resizable 参数、`nodeRef`、`cancel`、`handle` 和 resize handle 行为不变。
- R6.AC3: WHEN 重构 `ResponsiveVueGridLayout` 时，系统 SHALL 保留 responsive breakpoint/layouts 作为 wrapper 自己的第一职责，并 SHALL 明确哪些 props/attrs/events 传给内层 `VueGridLayout`，哪些只由 responsive wrapper 消费。
- R6.AC4: WHEN responsive breakpoint、width、layouts 或 cols 变化时，系统 SHALL 保持现有 layout 生成、`breakpointChange`、`widthChange`、`update:layouts`、`layoutChange` 和 persistence commit 语义。
- R6.AC5: IF wrapper attrs 路由调整会改变用户在 `<ResponsiveVueGridLayout @drop ...>` 或 `<ResponsiveVueGridLayout @dragStop ...>` 上的监听行为，系统 SHALL 通过兼容 shim 或回退保持现有用法可用。
- R6.AC6: WHEN wrapper attrs 路由新增非事件 DOM attrs 透传能力时，系统 SHALL 通过测试覆盖根节点 `id`、`data-*`、`aria-*`、class/style 合并和事件监听同时存在的场景，确保新增透传不吞掉现有组件 props、emits 或内部 drag/drop/resize 处理。

### R7: 类型、文档、示例和构建产物必须保持兼容
**用户故事:** 作为 TypeScript 和打包用户，我希望源码重构后类型声明、README、示例和构建入口仍然匹配现有使用方式，以便升级成本为零。
**验收标准 (EARS):**
- R7.AC1: WHEN 公开 props、events、editor/layoutEngine/persistence 类型或导出路径被触及，系统 SHALL 同步检查 `typings/index.d.ts`、README API 文档、MCP docs 数据源和 CommonJS/UMD 导出，确保对外类型兼容。
- R7.AC2: WHEN 运行构建或测试时，系统 SHALL 保持 `package.json` 中现有 `test`、`test:editor`、`test:layout-engine`、`build`、`lint` 或等价质量命令可运行。
- R7.AC3: WHEN 重构完成后，系统 SHALL 至少运行 `yarn test` 与 `yarn build` 作为最终验收；IF 重构触及 editor、external drop、persistence、layout engine、responsive 或基础 grid 行为，系统 SHALL 对对应关键示例执行 targeted smoke，覆盖基础网格、响应式、外部 drop、persistence、layout engine performance 或 professional dashboard editor 中被影响的场景。
- R7.AC4: WHEN CSS 或 overlay DOM 被触及，系统 SHALL 保持 `css/styles.css` 中已有变量、状态类和选择器兼容，除非另有单独批准。
- R7.AC5: IF 类型声明或 README 中发现已存在但与源码不一致的行为，系统 SHALL 先记录差异并保持源码行为，不得在本重构中顺手改变用户可观察行为。
- R7.AC6: WHEN 抽出的 composable、helper 或类型具备稳定复用价值时，系统 MAY 将其作为公开导出；IF 新增公开导出，系统 SHALL 同步更新 `typings/index.d.ts`、README/API 文档、MCP docs 数据源和 CommonJS/UMD 导出清单，并 SHALL 保证新增导出不改变现有公开 API 行为。

### R8: 拆分必须按 ownership 防止复胖
**用户故事:** 作为项目长期维护者，我希望重构不仅减少当前文件规模，还建立以后新增功能的归属规则，以便核心组件不会再次膨胀成难以 review 的大文件。
**验收标准 (EARS):**
- R8.AC1: WHEN 新增或移动模块时，系统 SHALL 为每个模块写明 ownership：例如 model/persistence 只管状态同步与提交，engine bridge 只管 request/scheduler/executor，interactions 只管 drag/resize/drop 协调，auto-scroll 只管 DOM 滚动，overlay 只管 editor 辅助层渲染。
- R8.AC2: WHEN 后续新增 editor 能力时，系统 SHALL 默认落在 `lib/editor/*` 或 editor overlay 边界，而不是直接向 `VueGridLayout.tsx` 添加大段逻辑。
- R8.AC3: WHEN 后续新增布局计算、collision、fit、compact 或 scheduler 行为时，系统 SHALL 默认落在 `lib/layout-engine/*`、`lib/utils.ts` 或明确 helper 中，而不是组件事件处理器中。
- R8.AC4: WHEN 后续新增 DOM measurement、auto-scroll、pointer event 或 frame scheduling helper 时，系统 SHALL 默认落在 DOM-side composable 或 interaction helper 中，并 SHALL 与 layout/persistence 状态解耦。
- R8.AC5: IF 某个抽取结果需要大型透传 prop bag、镜像父组件大部分事件或必须同时阅读多个文件才能理解一个责任，系统 SHALL 视为边界失败并重新设计。
- R8.AC6: WHEN 本重构结束时，系统 SHALL 在 tasks 或实现说明中列出防复胖 review gate，至少包括根组件新增 watcher、公开 prop、事件、overlay 渲染块或 engine 逻辑时必须说明归属。

### R9: 渐进实施与可回滚交付
**用户故事:** 作为协作开发者，我希望重构按小步阶段交付，每一步都有测试和回滚点，以便出现回归时可以快速定位并恢复。
**验收标准 (EARS):**
- R9.AC1: WHEN 制定任务拆分时，系统 SHALL 按“行为锁定测试、事件契约显式化、model/persistence 拆分、engine bridge 拆分、interaction/auto-scroll 拆分、editor overlay 拆分、GridItem/Responsive cleanup、最终验证”的顺序组织。
- R9.AC2: WHEN 每个阶段开始时，系统 SHALL 明确本阶段允许写入的文件集合和不允许触碰的行为边界，避免无关重构混入。
- R9.AC3: WHEN 每个阶段完成时，系统 SHALL 运行与该阶段对应的最小验证命令，并 SHALL 在必要阶段运行完整测试或浏览器 smoke。
- R9.AC4: WHEN git 工作区已经存在用户或其他生成修改时，系统 SHALL 不回退无关改动，并 SHALL 避免把 `.tmp`、生成测试产物或无关格式化混入本规格改动。
- R9.AC5: IF 某一步测试失败且无法在当前阶段内定位，系统 SHALL 停止继续拆分并保留失败证据，不得继续扩大 diff。
- R9.AC6: WHEN 制定本规格任务时，系统 SHALL 优先治理 `VueGridLayout` 的大组件边界；`GridItem` 与 `ResponsiveVueGridLayout` SHALL 只纳入为保持事件、attrs、wrapper 协作和行为兼容所需的任务，不得把本规格扩展成三组件全面重写。

### R10: Vue 组件最佳实践门禁必须内化为验收标准
**用户故事:** 作为代码 reviewer，我希望本次重构结果能被稳定 review，而不是只依赖一次性人工判断，以便之后维护者能按同一标准扩展组件。
**验收标准 (EARS):**
- R10.AC1: WHEN 评审本重构时，系统 SHALL 使用 `vue-component-best-practices` 的非协商规则检查 props 显式性、emit 显式性、prop 不可变、attrs 有意路由、props/events 优先于隐式通信、composable 复用逻辑和性能后置。
- R10.AC2: WHEN 某个组件或 composable 超过本地 review gate 的规模阈值时，系统 SHALL 说明它是否仍是单一责任；若不是，SHALL 继续拆分真实责任边界。
- R10.AC3: WHEN 新增 watcher 超过必要数量或 watcher 与事件/props/render 分支交织时，系统 SHALL 触发状态模型 review，并优先将 watcher 收敛到专属 composable。
- R10.AC4: WHEN 新增公开 prop 或配置对象时，系统 SHALL 说明它是用户可理解的语义能力，而不是内部实现开关；泛化 `config/options/meta` 包不得作为逃避 contract 设计的手段。
- R10.AC5: WHEN 提交最终实现时，系统 SHALL 提供按模块 ownership、兼容性测试结果和剩余风险整理的 review summary。

## Clarifications

### Session 2026-05-11

- Q: 本次重构的完成标准是否需要设置根组件目标行数？ -> A: 采用边界优先，并将 `VueGridLayout.tsx` 目标控制在 800 行以内；不为行数拆出假边界。
- Q: 本规格是否要求三个组件都完整达到最佳实践目标？ -> A: 三组件同 spec，但优先治理 `VueGridLayout`；`GridItem` 和 `ResponsiveVueGridLayout` 只做与边界、事件、兼容性直接相关的必要 cleanup。
- Q: 本次重构的最终验收门槛是什么？ -> A: 最终必须运行 `yarn test` 和 `yarn build`；触及 editor、drop、persistence、layout engine、responsive 或基础 grid 行为时，对对应关键示例做 targeted smoke。
- Q: 抽出的 composable/helper 是否可以成为公开导出？ -> A: 可以公开导出具备稳定复用价值的 composable、helper 或类型；新增公开导出必须同步更新 typings、README/API 文档、MCP docs 数据源和 CommonJS/UMD 导出清单，并不得改变现有 API 行为。
- Q: `$attrs` / 非事件属性应采用什么策略？ -> A: 采用长期收益最大的有意透传策略：非事件 DOM attrs 透传到根 grid DOM 或明确 wrapper root；组件受控 props/emits、事件 payload 和 class/style 合并语义必须保持优先且有测试保护。
