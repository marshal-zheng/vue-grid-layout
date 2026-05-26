# Lean Core Bundle Boundary 需求规格

## 简介

当前包已经完成 Vite-first 发布地基，npm tarball 体积也已通过移除 sourcemap 显著下降。新的长期性能瓶颈不再是包文件总量，而是基础用户导入 root 或 `./core` 时实际进入运行时的 transitive closure：`VueGridLayout` 目前会静态拉入 persistence、editor、keyboard、commands 和 layout-engine 相关路径，`ResponsiveVueGridLayout` 也会静态拉入 persistence、layout-engine 和 editor 运行时。现有 `check:bundle` 只检查入口文件文本和少量 forbidden token，无法发现 `core.mjs -> VueGridLayout chunk -> editor/keyboard/persistence chunk` 这类闭包回流。

本规格采用已确认的 2.0 硬 breaking change 路线：`@marsio/vue-grid-layout` 根入口变为 lean root，并与 `@marsio/vue-grid-layout/core` 等价；不提供 `./compat`；旧 all-in-one root 行为直接移除。core/root/responsive 只承诺基础 grid 和响应式基础能力，不再内置 editor、keyboard、commands、persistence、dashboard、history 或 Pinia。高级能力必须通过显式 subpath 接入；其中 `./editor` 和 `./persistence` 必须提供薄 wrapper，覆盖 grid 与 responsive 的高级接入，同时可继续暴露 controller、adapter 或 composable。第一轮不拆 layout-engine 默认语义；dashboard pure runtime 与 Vue/editor integration 的进一步拆分延后到后续规格。

本规格覆盖 2.0 公共入口策略、lean root/core/responsive 边界、advanced props 移除、显式高级能力入口、本地 transitive closure hard check、bundle 预算、类型与文档迁移、消费者验证和示例行为保护。不覆盖 CI 接入策略、dashboard 内部分层重构、CJS 移除、example UI redesign、Editor Kit 新 UI、Widget Registry、AI/MCP 新产品能力或 layout-engine 语义重写。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/CORE-runtime-foundation/README.md
SPEC_BRIEF: docs/initiatives/CORE-runtime-foundation/briefs/CORE-lean-core-bundle-boundary.md

COVERAGE: lean-core-boundary

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| lean-core-boundary | R1-R12 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## Clarifications

### Session 2026-05-22

- Q: root `@marsio/vue-grid-layout` 应该保持兼容还是变 lean？ -> A: 变 lean，按裸 2.0 breaking change 处理。
- Q: 是否新增 `@marsio/vue-grid-layout/compat` 保留旧 all-in-one root？ -> A: 不新增；旧用户必须迁移到明确 subpath 或高级 wrapper/composable。
- Q: advanced props 是否继续挂在 core 组件上？ -> A: 不继续。`VueGridLayout` 和 `ResponsiveVueGridLayout` 的 lean 版本移除 editor、persistence 等 advanced props。
- Q: root 和 `./core` 是否完全等价？ -> A: 等价。root 默认导出 lean `VueGridLayout`，并只暴露 core 允许的基础能力。
- Q: `./responsive` 是否也执行 lean 边界？ -> A: 是。responsive 移除 editor/persistence 等 advanced props，不静态依赖高级能力。
- Q: layout-engine 是否在第一轮从 core 默认路径拆出？ -> A: 不拆。第一轮保持 layout-engine 相关布局语义，重点清理 editor、keyboard、commands、persistence、dashboard、history 和 Pinia 闭包回流。
- Q: dashboard pure runtime 与 dashboard Vue/editor integration 是否本轮拆分？ -> A: 不拆。只要求 dashboard 不污染 root/core/responsive。
- Q: 是否考虑 CI？ -> A: 不考虑 CI 接入。本规格只要求本地 hard check，例如 `npm run check:bundle` 或等价脚本失败即失败。
- Q: 初始 gzip 预算如何设定？ -> A: root/core closure <= 65 KB，responsive <= 80 KB，persistence <= 16 KB，layout-engine <= 30 KB，history <= 8 KB。
- Q: `./persistence` 同时暴露 grid/responsive 薄 wrapper 后，16 KB 预算是否仍适用？ -> A: 不适用。由于本规格要求 `./persistence` 直接暴露 `PersistentGridLayout` 和 `PersistentResponsiveGridLayout`，该 entry 的 closure 会包含 lean grid/responsive 基础运行时；最终本地预算调整为 persistence <= 64 KB gzip，并由 checker 固化。
- Q: 被移除的 `editor` / `persistence` prop 行为应如何提供替代入口？ -> A: `./editor` 和 `./persistence` 必须提供薄 wrapper，覆盖 grid 与 responsive 的高级接入。

## 需求列表

### R1: 2.0 硬 breaking 公共入口策略
**用户故事:** 作为维护者，我希望 2.0 直接移除旧 all-in-one root 兼容层，以便包的默认入口长期表达真实的 lean core 边界。
**验收标准 (EARS):**
- R1.AC1: WHEN 发布 2.0 公共入口契约 THEN `@marsio/vue-grid-layout` SHALL 被定义为 lean root，而不是旧 all-in-one 聚合入口。
- R1.AC2: WHEN 用户从 root 导入默认导出 THEN 系统 SHALL 返回 lean `VueGridLayout` 组件，且该默认导出 SHALL 与 `@marsio/vue-grid-layout/core` 的默认导出语义一致。
- R1.AC3: WHEN 用户依赖旧 root 上的 `Responsive`、editor、persistence、dashboard、history 或其他高级聚合导出 THEN 系统 SHALL 要求迁移到明确 subpath、wrapper 或 composable，不提供 root 兼容 shim。
- R1.AC4: WHEN 设计 package exports THEN 系统 SHALL NOT 新增 `./compat`、`./legacy` 或等价 all-in-one compatibility entry。
- R1.AC5: IF 某个旧 root 能力被移除 THEN 迁移文档 SHALL 将其标记为 2.0 breaking change，并提供新的显式导入路径或说明该能力不再由 root 承诺。

### R2: Root 与 core 等价的 lean 边界
**用户故事:** 作为基础 grid 用户，我希望 root 和 `./core` 都只包含基础网格运行时，以便默认安装和默认导入不会为高级编辑、持久化或 dashboard 能力付费。
**验收标准 (EARS):**
- R2.AC1: WHEN 用户导入 `@marsio/vue-grid-layout` THEN 该入口 SHALL 只导出 core 允许的基础能力，例如 `VueGridLayout`、`WidthProvider`、基础 utils、layout calculation helpers、grid height runtime 和基础类型。
- R2.AC2: WHEN 用户导入 `@marsio/vue-grid-layout/core` THEN 该入口 SHALL 与 root 暴露相同或等价的 lean core 能力，不得额外暴露 advanced runtime。
- R2.AC3: WHEN 构建 root 或 `./core` THEN 其 transitive runtime closure SHALL NOT 静态包含 editor、keyboard、commands、persistence、dashboard、dashboard-editor-shell、history、Pinia、MCP、Node-only module 或 webpack-only module。
- R2.AC4: WHEN root/core 类型声明生成 THEN 类型 SHALL NOT 要求基础用户安装 Pinia 或理解 editor/persistence/dashboard 专用类型。
- R2.AC5: IF root/core 需要保留 layout-engine 支撑现有基础布局语义 THEN 该 layout-engine 依赖 MAY 留在 root/core closure，但 SHALL 受本规格的 bundle budget 和行为保持要求约束。

### R3: Lean responsive 公共边界
**用户故事:** 作为响应式 grid 用户，我希望 `./responsive` 只提供 breakpoint 与响应式布局同步能力，以便响应式基础使用不会自动引入 editor 或 persistence。
**验收标准 (EARS):**
- R3.AC1: WHEN 用户导入 `@marsio/vue-grid-layout/responsive` THEN 系统 SHALL 提供 lean `ResponsiveVueGridLayout`、响应式基础类型、breakpoint/cols/layouts helpers 和响应式基础事件契约。
- R3.AC2: WHEN 构建 `./responsive` THEN 其 transitive runtime closure SHALL NOT 静态包含 editor、keyboard、commands、persistence、dashboard、dashboard-editor-shell、history、Pinia、MCP、Node-only module 或 webpack-only module。
- R3.AC3: WHEN responsive 组件类型声明生成 THEN `editor`、`persistence` 和其他高级集成 props SHALL 从 lean responsive public props 中移除。
- R3.AC4: IF responsive 仍需要 layout-engine 支撑现有布局生成或更新语义 THEN 该依赖 MAY 保留，但 SHALL NOT 通过 layout-engine 路径重新引入 editor、persistence、dashboard、history 或 Pinia。
- R3.AC5: WHEN 用户需要响应式编辑或响应式持久化 THEN 文档 SHALL 指向 `./editor`、`./persistence` 提供的响应式高级薄 wrapper，而不是要求基础 `./responsive` 内置该能力。

### R4: Advanced props 从 lean 组件移除
**用户故事:** 作为维护者，我希望基础组件 props 不再承载高级能力入口，以便 bundle 边界由公共 API 结构保证，而不是依赖内部 lazy loading 或 tree shaking 运气。
**验收标准 (EARS):**
- R4.AC1: WHEN 2.0 lean `VueGridLayout` props 定义完成 THEN `editor`、`persistence` 和 Pinia-powered history 集成 SHALL 不再作为 core 组件的内置 props 暴露。
- R4.AC2: WHEN 2.0 lean `ResponsiveVueGridLayout` props 定义完成 THEN `editor`、`persistence` 和 Pinia-powered history 集成 SHALL 不再作为 responsive 组件的内置 props 暴露。
- R4.AC3: WHEN 移除 advanced props THEN 运行时实现 SHALL 删除对应静态 imports，而不是通过内部 dynamic import 保留旧 prop 行为。
- R4.AC4: IF 某个 advanced prop 在旧版本中影响拖拽、缩放、放置、guides、keyboard、commands、autosave 或 external apply THEN 2.0 迁移文档 SHALL 给出 `./editor` 或 `./persistence` 薄 wrapper 的替代接入方式，只有非组件级高级 API MAY 指向 composable 或 controller。
- R4.AC5: WHEN TypeScript 用户传入被移除的 advanced props THEN 类型系统 SHOULD 报错或无法匹配 lean props，而不是静默接受后运行时无效。

### R5: 显式高级能力入口与薄 wrapper
**用户故事:** 作为高级用户，我希望 editor、persistence、history 和 dashboard 能力通过明确入口按需使用，并希望被移除的组件级 editor/persistence prop 行为有薄 wrapper 替代，以便只在需要这些能力时支付运行时成本。
**验收标准 (EARS):**
- R5.AC1: WHEN 用户需要持久化能力 THEN 系统 SHALL 通过 `@marsio/vue-grid-layout/persistence` 暴露 adapter、serializer、validator、migration、composable，以及覆盖 lean grid 与 lean responsive 的持久化薄 wrapper。
- R5.AC2: WHEN 用户需要编辑能力 THEN 系统 SHALL 通过 `@marsio/vue-grid-layout/editor` 暴露 controller、commands、keyboard、guides、placement，以及覆盖 lean grid 与 lean responsive 的编辑薄 wrapper。
- R5.AC3: WHEN 用户需要 history 能力 THEN 系统 SHALL 通过 `@marsio/vue-grid-layout/history` 或等价 subpath 使用 Pinia-powered APIs，且 Pinia SHALL 只由该能力层要求。
- R5.AC4: WHEN 用户需要 dashboard 或 dashboard-editor-shell 能力 THEN 系统 SHALL 通过对应 dashboard subpath 使用，不得从 root/core/responsive 获得隐式导入。
- R5.AC5: IF advanced wrapper 需要组合 lean grid 与 editor/persistence THEN 该 wrapper SHALL 位于对应高级 subpath 中，并 SHALL NOT 让 root/core/responsive 静态依赖 wrapper 实现。
- R5.AC6: WHEN 文档介绍高级能力 THEN 示例 SHALL 使用显式 subpath import，不得继续展示旧 all-in-one root 聚合写法。
- R5.AC7: WHEN 迁移旧组件级 `editor` 或 `persistence` prop 用法 THEN 系统 SHALL 提供 grid 与 responsive 两类薄 wrapper 的迁移路径，使高级行为通过显式 subpath 保持可用。

### R6: 本地 transitive closure hard check
**用户故事:** 作为维护者，我希望本地 bundle 检查计算真实依赖闭包，以便 future refactor 不能把 advanced runtime 悄悄带回 root/core/responsive。
**验收标准 (EARS):**
- R6.AC1: WHEN 执行本地 bundle boundary check THEN 脚本 SHALL 基于构建产物计算每个受检入口的 transitive runtime closure，而不是只读取入口文件文本。
- R6.AC2: WHEN root、core 或 responsive closure 包含 forbidden module、chunk、token 或 package THEN 本地检查 SHALL 失败并输出入口、命中路径和原因。
- R6.AC3: WHEN 运行本地检查的 analyze 模式 THEN 输出 SHALL 包含 root、core、responsive、persistence、layout-engine 和 history 的 raw、gzip，并 SHOULD 包含 brotli 或等价压缩指标。
- R6.AC4: WHEN 本地检查发现 sourcemap、Node-only、MCP-only 或 webpack-only 代码进入发布闭包 THEN 检查 SHALL 失败。
- R6.AC5: IF 某个构建工具输出 chunk 命名变化 THEN 检查 SHALL 仍通过 import graph、manifest、module metadata 或等价机制判断闭包，而不是依赖固定 chunk 文件名。
- R6.AC6: WHEN 本规格实现完成 THEN `npm run check:bundle` 或等价本地命令 SHALL 作为 hard check 失败即失败；本规格不要求定义或接入 CI。

### R7: Bundle budget 初始目标
**用户故事:** 作为性能关注用户，我希望 lean entries 有明确预算，以便 2.0 的 breaking change 转化为可量化的长期性能收益。
**验收标准 (EARS):**
- R7.AC1: WHEN 本地 bundle boundary check 测量 root closure THEN gzip size SHALL 小于或等于 65 KB，除非设计阶段基于新脚本 baseline 明确调整并记录原因。
- R7.AC2: WHEN 本地 bundle boundary check 测量 core closure THEN gzip size SHALL 小于或等于 65 KB，除非设计阶段基于新脚本 baseline 明确调整并记录原因。
- R7.AC3: WHEN 本地 bundle boundary check 测量 responsive closure THEN gzip size SHALL 小于或等于 80 KB，除非设计阶段基于新脚本 baseline 明确调整并记录原因。
- R7.AC4: WHEN 本地 bundle boundary check 测量 persistence closure THEN gzip size SHALL 小于或等于 64 KB；该预算已从初始 16 KB 调整，因为 `./persistence` 按 R5 直接暴露 grid 与 responsive 薄 wrapper，closure 包含 lean grid/responsive 基础运行时。
- R7.AC5: WHEN 本地 bundle boundary check 测量 layout-engine closure THEN gzip size SHALL 小于或等于 30 KB，除非设计阶段基于新脚本 baseline 明确调整并记录原因。
- R7.AC6: WHEN 本地 bundle boundary check 测量 history closure THEN gzip size SHALL 小于或等于 8 KB，且 history SHALL 是唯一允许静态引入 Pinia 的 public entry。
- R7.AC7: IF 某个预算必须调整 THEN requirements trace、design rationale 和 local check 配置 SHALL 同步更新，避免文档预算与脚本预算漂移。

### R8: Layout-engine 语义保持
**用户故事:** 作为现有 grid 用户，我希望 lean boundary 工作不同时改变布局引擎语义，以便 breaking change 集中在 API 边界而不是拖拽、缩放和碰撞行为。
**验收标准 (EARS):**
- R8.AC1: WHEN 实现 root/core/responsive 瘦身 THEN 系统 SHALL 保持当前基础布局、拖拽、缩放、碰撞、压缩、height runtime 和 worker entry 的既有语义，除非设计阶段明确列出可接受差异。
- R8.AC2: WHEN core 或 responsive 仍调用 layout-engine THEN 这些调用 SHALL 不引入 editor、persistence、dashboard、history 或 Pinia。
- R8.AC3: WHEN 浏览器 smoke 或组件测试覆盖基础拖拽/缩放 THEN 结果 SHALL 与瘦身前基础行为一致。
- R8.AC4: IF 未来需要将 layout-engine 从 core 默认路径拆出 THEN SHALL 创建单独规格或明确子任务，不得作为本规格隐式目标。

### R9: Package exports、类型与消费者解析
**用户故事:** 作为 TypeScript 和 bundler 用户，我希望 2.0 的入口变化在 exports、types、ESM 和 CJS 中一致，以便迁移后导入路径可预测。
**验收标准 (EARS):**
- R9.AC1: WHEN package exports 更新 THEN root、`./core`、`./responsive`、`./layout-engine`、`./editor`、`./persistence`、`./history`、`./dashboard`、`./dashboard-editor-shell`、`./worker`、`./style.css` 和 `./package.json` SHALL 保持明确公开入口，除非设计阶段记录删除原因。
- R9.AC2: WHEN root 和 `./core` exports 生成 THEN ESM、CJS 和 types 条件 SHALL 指向 lean core 产物和 lean core 类型。
- R9.AC3: WHEN `./responsive` exports 生成 THEN ESM、CJS 和 types 条件 SHALL 指向 lean responsive 产物和 lean responsive 类型。
- R9.AC4: WHEN TypeScript consumer 导入 root/core/responsive THEN 类型解析 SHALL 不依赖被移除 advanced props 或高级能力类型。
- R9.AC5: WHEN no-Pinia consumer 导入 root/core/responsive/layout-engine/persistence THEN install、typecheck 和 runtime import SHALL 不因缺少 Pinia 失败。
- R9.AC6: WHEN CJS consumer require root/core/responsive THEN 返回值 SHALL 符合 2.0 lean 入口契约，不得通过 CJS wrapper 重新挂载旧 all-in-one root 能力。

### R10: 文档、迁移说明与 MCP 数据同步
**用户故事:** 作为升级用户和 AI 工具用户，我希望 README、迁移说明和 MCP 数据都反映新的 lean 边界，以便不会继续推荐失效的 root 聚合用法。
**验收标准 (EARS):**
- R10.AC1: WHEN README 更新 THEN 默认 usage SHALL 展示 lean root 或 `./core` 基础用法，不得展示 root 聚合 responsive/editor/persistence/dashboard 的旧写法。
- R10.AC2: WHEN 迁移说明更新 THEN SHALL 明确标注 2.0 breaking changes：root 等价 core、不提供 compat、responsive 不再从 root 导出、advanced props 从 lean 组件移除、高级能力改走 subpath。
- R10.AC3: WHEN 文档介绍 responsive THEN SHALL 使用 `@marsio/vue-grid-layout/responsive`，并说明它是 lean responsive。
- R10.AC4: WHEN 文档介绍 editor、persistence、history、dashboard 或 dashboard-editor-shell THEN SHALL 使用对应 subpath，并说明其运行时成本由显式导入承担。
- R10.AC5: WHEN MCP examples/data 生成 THEN SHALL 同步新的 exports、props 边界和 import 示例，不得继续返回旧 all-in-one root 代码片段。
- R10.AC6: IF 某个旧示例依赖 root 聚合能力 THEN 示例 SHALL 迁移 import，而不是改变示例的视觉或交互目标。

### R11: 示例行为保护与测试覆盖
**用户故事:** 作为维护者，我希望架构边界改造不顺手重设计 examples，以便性能优化不会破坏已有示例导航和演示行为。
**验收标准 (EARS):**
- R11.AC1: WHEN 实现本规格 THEN `/` SHALL 继续渲染 examples list，点击列表项 SHALL 打开所选 demo。
- R11.AC2: WHEN 实现本规格 THEN `/example/index.html` SHALL 继续可用于旧链接和测试。
- R11.AC3: WHEN 更新 examples import THEN SHALL 保持原 demo 的视觉和交互输出，除非迁移说明明确记录必要差异。
- R11.AC4: WHEN package consumer tests 更新 THEN SHALL 覆盖 root lean、core lean、responsive lean、advanced subpath、no-Pinia consumer 和 CJS root/core/responsive 行为。
- R11.AC5: WHEN editor-enabled 或 persistence-enabled 示例迁移 THEN SHALL 通过显式高级入口保持对应高级行为可用。
- R11.AC6: WHEN browser smoke 执行 THEN SHALL 覆盖基础 grid、responsive grid、editor advanced wrapper、persistence advanced wrapper 或等价新入口中的关键路径。

### R12: 范围控制与非目标
**用户故事:** 作为项目负责人，我希望本规格严格聚焦 lean boundary，以便不会把 dashboard 产品化、layout-engine 重写或新编辑器 UI 混入同一轮。
**验收标准 (EARS):**
- R12.AC1: WHEN 实现本规格 THEN 系统 SHALL NOT 新增 `./compat`、旧 root all-in-one shim 或内部 lazy-loading 兼容方案。
- R12.AC2: WHEN 实现本规格 THEN 系统 SHALL NOT 移除 CJS 发布入口，除非另有单独 breaking-change 规格。
- R12.AC3: WHEN 实现本规格 THEN 系统 SHALL NOT 拆分 dashboard pure runtime 与 dashboard Vue/editor integration；只要求 dashboard 不污染 root/core/responsive。
- R12.AC4: WHEN 实现本规格 THEN 系统 SHALL NOT 重设计 example UI、示例导航或 demo 视觉表现。
- R12.AC5: WHEN 实现本规格 THEN 系统 SHALL NOT 新增 Editor Kit toolbar、Widget Registry、AI/MCP dashboard assistant 或新的 dashboard 产品功能。
- R12.AC6: WHEN 实现本规格 THEN 系统 SHALL NOT 改写 layout-engine 默认算法、worker 协议或基础布局语义，除非该改动是保持现有语义所必需并有测试覆盖。
