# Foundation Modernization 需求规格

## 简介

当前仓库已经从单一 `VueGridLayout` 组件扩展为包含 core grid、responsive grid、layout engine、headless editor、dashboard runtime、dashboard editor shell、persistence 和 MCP 的多层 SDK。现有 npm 发布契约仍停留在单入口形态：`package.json` 只有 `main`、`style`、`unpkg`、`typings`，没有 `exports` map 或 ESM 入口；构建由 Babel 产出 CJS、webpack 产出 UMD/worker；类型声明集中在手写 `typings/index.d.ts`；`vue` 仍在 dependencies 中，`pinia` 作为全包 peer dependency 暴露给所有用户。

本规格采用已确认的 B 路线：一次性迁移构建系统。新构建系统 SHALL 指定为 Vite，并成为 npm 发布产物、demo/dev server 和示例 smoke 的统一来源，统一产出 ESM、CJS、类型声明、worker entry 和 CSS entry；不再保留 legacy UMD/CDN 发布承诺；webpack SHALL 被彻底移除，不再作为 library build、demo/dev server、docs build、browser smoke 或 bundle analysis 的实现依赖。目标是建立现代、可测试、可分层导入的组件库发布地基，同时将根入口瘦身为 core/responsive 兼容入口，重能力通过 subpath 使用。

本规格覆盖包入口、构建产物、依赖边界、类型生成、文档可信度、示例 smoke、CI/release gates、兼容性和迁移说明。不覆盖 Editor Kit UI、Widget Registry 完整协议、nested/inter-grid layout engine 语义、AI/MCP dashboard assistant 或 i18n。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/CORE-runtime-foundation/README.md
SPEC_BRIEF: docs/initiatives/CORE-runtime-foundation/briefs/CORE-foundation-modernization.md

COVERAGE: foundation-modernization

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| foundation-modernization | R1-R14 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## Clarifications

### Session 2026-05-21

- Q: Foundation Modernization 选择哪条路线？ -> A: 选择 B：一次性迁移构建系统，新构建系统成为 npm 发布产物唯一来源。
- Q: webpack 的定位是什么？ -> A: 原决策允许 webpack 保留给 demo/dev server 或被替换，但不得继续定义 npm library contract；该决策已被 2026-05-22 的 Vite 统一构建和彻底移除 webpack 决策取代。
- Q: 是否保持旧根入口兼容？ -> A: 保持。`import VGL from "@marsio/vue-grid-layout"` 和等价 CJS 根入口用法仍需工作。
- Q: 是否把后续 Editor Kit、Widget Registry、Layout Engine Pro 或 AI/MCP 高级能力放入本规格？ -> A: 不放入。本规格只做发布、构建、类型、依赖、文档和质量门禁地基。
- Q: 是否保留 legacy UMD/CDN artifact？ -> A: 不保留。移除 UMD/CDN 发布承诺，`unpkg`/`build/web/vue-grid-layout.min.js` 不再作为本规格验收目标。

### Session 2026-05-22

- Q: 发布兼容策略是否允许 breaking change？ -> A: 允许 breaking change，按 major release 迁移；不为 minor 兼容保留 legacy UMD/CDN 或未公开 deep import shim。
- Q: 根入口保留多大范围？ -> A: 根入口瘦身为 core/responsive 常用兼容入口；editor、dashboard、persistence、history 等高级能力主要通过 subpath 导入。
- Q: MCP 是否进入根包 `exports`？ -> A: 不进入。MCP 继续作为独立包发布，根包不提供 `./mcp` export；根包只保证 README、MCP 数据和公开 exports 同步。
- Q: CJS 是否仍保留？ -> A: 保留 ESM + CJS 双入口；移除 legacy 只指 UMD/CDN 和未公开 deep imports，不移除 CJS npm 消费契约。
- Q: 新构建系统是否指定为 Vite，webpack 是否保留？ -> A: 指定为 Vite。当前规格内彻底移除 webpack，Vite SHALL 同时接管 library build、demo/dev server、docs build、browser smoke 和 bundle analysis；仓库不再保留 webpack 配置、脚本或依赖。

## 需求列表

### R1: Vite 构建系统作为发布产物唯一来源
**用户故事:** 作为组件库维护者，我希望用一次性 Vite 构建系统迁移替代旧 Babel/webpack 发布链路，以便 ESM、CJS、types、worker、CSS、demo/dev server 和示例 smoke 由同一套可验证规则生成。
**验收标准 (EARS):**
- R1.AC1: WHEN 执行正式 library build THEN 系统 SHALL 使用 Vite library build 生成 npm 发布产物，且 ESM、CJS、worker entry 和 CSS entry 均来自该构建流程；`.d.ts` SHALL 由 TypeScript declaration emit、Vite-compatible dts 工具或等价可验证流程生成。
- R1.AC2: WHEN `npm run build` 成功完成 THEN 系统 SHALL 产出可发布的完整 package artifact，并 SHALL NOT 依赖 Babel CJS 输出作为 npm library contract。
- R1.AC3: WHEN 构建系统迁移完成 THEN 仓库 SHALL 移除 webpack 配置、webpack dev server、webpack loader/plugin 依赖、webpack CLI 脚本和基于 webpack 的 bundle analysis，不得在任何发布、开发、文档或 smoke 流程中调用 webpack。
- R1.AC4: IF 旧构建脚本仍被保留用于对比或回滚说明 THEN 系统 SHALL 在脚本命名和文档中标明其用途，且这些脚本 SHALL NOT 调用 Babel CJS 或 webpack 产物生成流程。
- R1.AC5: WHEN 构建系统迁移完成 THEN release/publish 流程 SHALL 只发布新构建产物和必要静态资源。
- R1.AC6: WHEN 执行 `npm run dev`、`npm run build-docs`、browser/component smoke 或 bundle analysis THEN 系统 SHALL 使用 Vite 或 Vite-compatible tooling，不得依赖 webpack dev server、UMD global artifact 或 `build/web/vue-grid-layout.min.js`。

### R2: 现代 package exports 公开入口
**用户故事:** 作为库消费者，我希望通过明确的 `exports` map 导入不同能力层，以便只引入需要的 core、engine、editor、dashboard 或 persistence 能力。
**验收标准 (EARS):**
- R2.AC1: WHEN package 被安装后 THEN `package.json` SHALL 声明 `exports` map，并以其作为公共 API 边界。
- R2.AC2: WHEN 用户导入根入口 `"@marsio/vue-grid-layout"` THEN 系统 SHALL 提供兼容的默认组件导出、core grid 导出和 responsive 常用导出；editor、dashboard、persistence、history 等高级能力 SHALL 主要通过对应 subpath 使用。
- R2.AC3: WHEN 用户导入分层入口 THEN 系统 SHALL 至少支持 `./core`、`./responsive`、`./layout-engine`、`./editor`、`./dashboard`、`./dashboard-editor-shell`、`./persistence`、`./history`、`./worker`、`./style.css` 和 `./package.json`，或在设计阶段记录等价命名决策。
- R2.AC4: WHEN 用户使用 ESM import THEN 每个 JS subpath export SHALL 解析到对应 ESM 产物。
- R2.AC5: WHEN 用户使用 CommonJS require THEN 根入口和每个 JS subpath export SHALL 解析到对应 CJS 产物。
- R2.AC6: IF 某个内部文件未声明在 `exports` map 中 THEN 用户 SHALL NOT 被鼓励依赖该 deep import，文档 SHALL 将其视为私有实现。
- R2.AC7: WHEN `exports` map 引入封闭边界 THEN 迁移说明 SHALL 列出原先可能被用户 deep import 的路径、替代入口和兼容策略。

### R3: 根入口向后兼容
**用户故事:** 作为已有用户，我希望升级后现有根入口用法继续运行，以便现代化不会破坏基础 grid 使用场景。
**验收标准 (EARS):**
- R3.AC1: WHEN 用户使用 `import VGL from "@marsio/vue-grid-layout"` THEN 系统 SHALL 返回与当前默认导出兼容的 `VueGridLayout` 组件。
- R3.AC2: WHEN 用户使用 `const VGL = require("@marsio/vue-grid-layout")` THEN 系统 SHALL 返回与当前 CJS 根入口兼容的组件对象。
- R3.AC3: WHEN 用户从根入口读取 core/responsive 常用命名导出 THEN 系统 SHALL 保持这些导出可用，除非迁移说明明确标记为 deprecated 并提供替代入口。
- R3.AC4: WHEN 用户只使用基础 `VueGridLayout` 或 `ResponsiveVueGridLayout` THEN 构建结果 SHALL NOT 强制加载 editor、dashboard、persistence、history、pinia 或 MCP-only 代码路径。
- R3.AC5: IF 某个当前根入口高级导出被移动到 subpath THEN 系统 SHALL 在 major-version migration note 中提供替代入口；根入口不需要为 editor、dashboard、persistence、history 等高级能力保留 compat shim。

### R4: 依赖边界与 optional peer 策略
**用户故事:** 作为应用开发者，我希望 core grid 不把 Vue 运行时或 Pinia history 能力打包进库内部，以便依赖树、版本兼容和 bundle size 可控。
**验收标准 (EARS):**
- R4.AC1: WHEN package dependency metadata 更新后 THEN `vue` SHALL 从 runtime dependencies 迁移为 peer dependency，并保留为 dev dependency 以支持本仓库开发和测试。
- R4.AC2: WHEN 构建 ESM、CJS 或 worker 产物 THEN `vue` SHALL 被 externalized，不得被打进 npm library bundle。
- R4.AC3: WHEN `pinia` 仅用于 history 能力 THEN `pinia` SHALL 被标记为 optional peer dependency，且文档 SHALL 说明只有使用 history 相关入口或 API 时才需要安装。
- R4.AC4: WHEN 用户只导入根入口、core、responsive、layout-engine 或 persistence 中不依赖 Pinia 的入口 THEN 系统 SHALL NOT 因缺少 `pinia` 在 install、typecheck 或 runtime import 阶段失败。
- R4.AC5: WHEN 用户导入 `./history` 或调用 Pinia-powered history API 且宿主未安装 `pinia` THEN 系统 SHALL 以明确错误、文档说明或 peer warning 引导安装，而不是在无关入口失败。
- R4.AC6: IF 新构建系统发现某个公共入口隐式依赖 editor/dashboard/pinia 重能力 THEN release gate SHALL 失败或输出需要处理的依赖边界诊断。

### R5: 分层类型声明生成
**用户故事:** 作为 TypeScript 用户，我希望根入口和每个 subpath 都有准确的生成类型，以便不再依赖单个手写 ambient module 承载全部 API。
**验收标准 (EARS):**
- R5.AC1: WHEN 执行 library build THEN 系统 SHALL 生成与 ESM/CJS 入口对应的 `.d.ts` 类型声明。
- R5.AC2: WHEN 用户导入任一公开 subpath THEN TypeScript SHALL 能通过 `exports` 中的 `types` 条件或等价配置解析到正确类型。
- R5.AC3: WHEN 根 `package.json` 发布时 THEN 系统 SHALL 提供 `types` 字段，使 npm 和 TypeScript 用户能识别包包含类型。
- R5.AC4: WHEN 迁移手写 `typings/index.d.ts` THEN 系统 SHALL 保持现有公共类型名称兼容，并记录由 generated declarations 替代手写声明的迁移路径。
- R5.AC5: IF 仍需手写补充声明 THEN 该声明 SHALL 被限制为兼容 shim 或无法自动生成的公共契约，不得继续作为全部类型的唯一来源。
- R5.AC6: WHEN 新增或移动公共 API THEN 类型生成和类型测试 SHALL 覆盖该 API，避免实现导出与声明导出漂移。

### R6: Worker、CSS 和浏览器 bundler 消费契约
**用户故事:** 作为高级集成方，我希望 worker、样式和浏览器 bundler 用法有明确入口，以便 layout engine worker、CSS 和 demo 产物不会混在根 JS 契约里。
**验收标准 (EARS):**
- R6.AC1: WHEN 用户需要 layout engine worker THEN 系统 SHALL 提供明确的 `./worker` 或等价 worker entry，并在 package exports 中声明其解析路径。
- R6.AC2: WHEN 用户需要样式 THEN 系统 SHALL 提供 `./style.css` export，并保证 published files 包含对应 CSS。
- R6.AC3: WHEN package 声明 `sideEffects` THEN CSS side effect 规则 SHALL 不导致样式文件被 bundler 误删。
- R6.AC4: WHEN 构建迁移完成 THEN package SHALL 移除 legacy UMD/CDN 发布承诺，且 `package.json` SHALL NOT 通过 `unpkg` 或等价字段指向 `build/web/vue-grid-layout.min.js`。
- R6.AC5: WHEN 用户在 browser bundler 中导入根入口或 subpath THEN 构建 SHALL 不包含 Node-only、MCP-only、webpack-only 或 dev server-only 代码。
- R6.AC6: IF worker entry 需要特殊 bundler 用法 THEN README SHALL 提供最小可运行说明和限制。

### R7: API 分层叙事与文档入口
**用户故事:** 作为新用户或专业 dashboard 用户，我希望文档按能力层组织，以便先学 core grid，也能直接找到 editor/dashboard shell 的推荐接入方式。
**验收标准 (EARS):**
- R7.AC1: WHEN README 更新后 THEN 文档 SHALL 提供“选择哪个入口”章节，按 Core Grid、Responsive Grid、Layout Engine、Persistence、Headless Editor、Dashboard Runtime、Dashboard Editor Shell、独立 MCP/AI Tooling 分层说明。
- R7.AC2: WHEN 文档介绍 root API THEN 文档 SHALL 明确根入口是 core/responsive 兼容和常用入口，而 subpath 是 editor、dashboard、persistence、history、layout-engine 等高级分层入口。
- R7.AC3: WHEN 文档介绍 editor/dashboard 能力 THEN 文档 SHALL 说明这些能力建立在 headless controller、adapter 和 shell 之上，不属于基础 grid 必选路径。
- R7.AC4: WHEN 新增 subpath export THEN README、MCP docs 或 API reference SHALL 说明其用途、最小示例和不应混用的边界。
- R7.AC5: WHEN 文档列出现有 examples THEN examples SHALL 被标注能力标签，例如 basic、responsive、persistence、editor、dashboard runtime、dashboard shell、placement、migration。
- R7.AC6: IF 某层能力依赖 optional peer 或浏览器 API THEN 文档 SHALL 在对应入口说明中标注。

### R8: README 与 MCP 示例可信度
**用户故事:** 作为库评估者，我希望 README 和 MCP 返回的示例可以复制运行，以便基础示例不会损害对高级能力的信任。
**验收标准 (EARS):**
- R8.AC1: WHEN 更新 README THEN 基础 usage 示例 SHALL 修复已知 `reactive` import 缺失和 responsive 示例组件注册不一致问题。
- R8.AC2: WHEN README 中存在 `vue`、`ts`、`js` 或 `bash` 代码块 THEN 系统 SHOULD 将可执行或可编译代码块纳入 smoke/compile check，或明确标记为不可执行片段。
- R8.AC3: WHEN MCP examples 与 README examples 表达同一场景 THEN 两者 SHALL 使用一致的公开入口、组件名称和推荐写法。
- R8.AC4: WHEN 示例使用 optional peer、worker、CSS 或 dashboard/editor subpath THEN 示例 SHALL 包含必要安装或导入说明。
- R8.AC5: IF smoke check 因示例需要浏览器、DOM 或外部服务无法执行 THEN 测试 SHALL 记录跳过原因，并至少校验 import/type syntax。
- R8.AC6: WHEN 文档构建或 MCP data generation 执行 THEN 系统 SHALL 验证示例引用的公开入口存在于 package exports 中。
- R8.AC7: WHEN 示例或 browser smoke 迁移完成 THEN 示例 SHALL 使用 Vite dev/build 可解析的 ESM/package imports 或明确的 local package entry，不再依赖 `window.VueGridLayout`、webpack UMD artifact 或 `build/web/vue-grid-layout.min.js`。

### R9: 真实消费者兼容矩阵
**用户故事:** 作为维护者，我希望 CI 验证真实消费者安装和导入方式，以便发布前发现 module resolution、types 和 optional peer 问题。
**验收标准 (EARS):**
- R9.AC1: WHEN package build 完成 THEN 系统 SHALL 在临时消费者项目中验证 `npm pack` 或等价 packed artifact。
- R9.AC2: WHEN 验证 ESM consumer THEN 测试 SHALL import 根入口和关键 subpath，并执行最小运行断言。
- R9.AC3: WHEN 验证 CJS consumer THEN 测试 SHALL require 根入口和关键 CJS subpath，并执行最小运行断言。
- R9.AC4: WHEN 验证 TypeScript consumer THEN 测试 SHALL typecheck 根入口、subpath types、CSS/worker 声明和历史兼容类型。
- R9.AC5: WHEN 验证 no-Pinia consumer THEN 测试 SHALL 安装不含 `pinia` 的临时项目，并确认 core/responsive/layout-engine/persistence import 不失败。
- R9.AC6: WHEN 验证 Pinia history consumer THEN 测试 SHALL 在安装 `pinia` 的临时项目中确认 history 入口和类型可用。
- R9.AC7: WHEN 验证 browser bundler consumer THEN 测试 SHOULD 覆盖至少一种现代 bundler 场景，并确认 CSS entry 和 worker entry 可解析。
- R9.AC8: WHEN 验证本仓库 demo/dev server THEN 测试 SHALL 启动 Vite dev server 或 Vite preview 等价流程，并确认示例页面不依赖 webpack dev server 或 UMD 全局构建。

### R10: CI、release gate 与性能/bundle 预算
**用户故事:** 作为发布负责人，我希望构建现代化后的质量门禁覆盖发布包、类型、文档、示例、性能和 bundle 边界，以便未来扩展不会破坏地基。
**验收标准 (EARS):**
- R10.AC1: WHEN CI 执行 release-quality gate THEN 系统 SHALL 运行 build、unit tests、browser/component smoke、package resolution tests、type consumer tests、README/MCP example checks 和 package artifact checks。
- R10.AC2: WHEN layout engine performance budget 存在 THEN release-quality gate SHALL 运行或集成现有 layout engine benchmark budget，或在 CI 中以可配置方式执行。
- R10.AC3: WHEN bundle size budget 被定义 THEN release-quality gate SHALL 检查根入口和关键 subpath 的产物大小或 dependency inclusion，避免根入口或 core 入口吸入 editor/dashboard/persistence/history/pinia 重能力。
- R10.AC4: WHEN `npm publish` 或 release script 执行 THEN 系统 SHALL 先通过 release-quality gate；失败时不得发布。
- R10.AC5: WHEN package files 列表生成 THEN gate SHALL 验证 published files 包含必要 dist、CSS、types、README、license 和 package metadata，且不包含源码外的 node_modules、临时测试输出或 docs raw context。
- R10.AC6: IF 某个 gate 因环境限制无法在本地运行 THEN 文档 SHALL 标明 CI 必跑位置和本地替代命令。
- R10.AC7: WHEN release-quality gate 执行 THEN 系统 SHALL 验证 `package.json` scripts、dependencies/devDependencies 和仓库配置中不存在 webpack、webpack-cli、webpack-dev-server、webpack loader 或 webpack plugin 的 active dependency。

### R11: 构建迁移兼容性与回滚策略
**用户故事:** 作为维护者，我希望一次性迁移也有清晰兼容和回滚边界，以便遇到发布风险时可以定位问题而不是回退整条路线。
**验收标准 (EARS):**
- R11.AC1: WHEN 新构建系统接管发布 THEN 系统 SHALL 保留一份迁移说明，列出旧产物路径、新产物路径、入口映射、脚本变化和已知行为差异。
- R11.AC2: WHEN 旧 Babel/webpack 发布产物被移除 THEN 迁移说明 SHALL 标明对 `build/cjs/cjs.js`、`build/web/vue-grid-layout.min.js`、worker artifact、docs build、dev server 和示例 smoke 的影响，并 SHALL 明确 UMD/CDN artifact 不再作为发布承诺。
- R11.AC3: WHEN 发现某个现有导入路径无法兼容 THEN 系统 SHALL 提供 major-version migration note；只有 core/responsive 根入口兼容导出 MAY 提供 deprecation 或 compat shim。
- R11.AC4: WHEN CI gate 失败 THEN 输出 SHALL 能区分构建失败、ESM/CJS exports 解析失败、类型失败、optional peer 失败、示例失败、性能失败和 bundle budget 失败。
- R11.AC5: IF 需要临时回滚发布流程 THEN 维护者 SHALL 能通过明确脚本或分支策略恢复最近一次稳定发布产物，而不是混用新旧产物。

### R12: 公共 API 边界与私有实现保护
**用户故事:** 作为长期维护者，我希望公共 API 边界明确，以便未来 Editor Kit、Widget Registry、Layout Engine Pro 和 AI/MCP 能力扩展时不会继续污染根组件或根入口。
**验收标准 (EARS):**
- R12.AC1: WHEN 新增能力层入口 THEN 系统 SHALL 优先通过 subpath、controller、config 或 adapter 暴露，而不是继续向 `VueGridLayout` 根组件无限添加 props。
- R12.AC2: WHEN 根入口过去导出的高级能力被迁移 THEN 系统 SHALL 在文档中推荐高级用户使用对应 subpath，并 SHALL NOT 将新高级能力继续添加到根入口。
- R12.AC3: WHEN 内部模块未进入 public exports THEN 文档和测试 SHALL 不把它们当作可承诺 API。
- R12.AC4: WHEN package exports 封闭 deep imports THEN release notes SHALL 将其标记为 major-version breaking change，提醒用户不要依赖未公开路径，并提供迁移示例。
- R12.AC5: IF 未来 spec 需要 Editor Kit、Widget Registry、Layout Engine Pro 或 AI/MCP 能力 THEN 这些 spec SHALL 基于本规格建立的分层入口和质量门禁继续扩展。

### R13: MCP 与文档生成边界
**用户故事:** 作为 AI IDE 和 MCP 用户，我希望 MCP 文档、示例和类型信息与新 package 入口保持一致，以便 AI 工具不会推荐已失效导入路径。
**验收标准 (EARS):**
- R13.AC1: WHEN package exports 更新 THEN MCP 生成数据 SHALL 能读取或同步新的公开入口、类型和示例分类。
- R13.AC2: WHEN MCP 返回基础 grid 示例 THEN 示例 SHALL 使用通过 README smoke 和 package exports gate 验证的导入方式。
- R13.AC3: WHEN MCP 返回高级 editor/dashboard 示例 THEN 示例 SHALL 指向对应 subpath 或明确说明根入口兼容导出。
- R13.AC4: WHEN MCP docs/search/types 工具引用 public API THEN 引用 SHALL 只包含根入口或 `exports` map 声明的 subpath。
- R13.AC5: WHEN MCP 包独立发布 THEN 根包 SHALL NOT 提供 `./mcp` export，且根包 browser bundler 消费路径 SHALL NOT 引入 MCP-only 或 Node-only 代码。
- R13.AC6: WHEN 根包构建迁移完成 THEN 系统 SHALL 保持 `mcp` package 的 build/test/publish 流程可用，并 SHALL 记录根包与 MCP 包之间的数据同步边界。

### R14: 非目标与范围控制
**用户故事:** 作为项目负责人，我希望 Foundation spec 严格限制范围，以便先稳定发布地基，再进入产品 UI、复杂布局和 AI 助手扩展。
**验收标准 (EARS):**
- R14.AC1: WHEN 实现本规格 THEN 系统 SHALL NOT 实现 Editor Kit toolbar、outline、inspector、palette、context menu renderer、command palette 或 diagnostics panel UI。
- R14.AC2: WHEN 实现本规格 THEN 系统 SHALL NOT 定义 Widget Registry 完整 schema、widget settings descriptors 或业务 widget catalog。
- R14.AC3: WHEN 实现本规格 THEN 系统 SHALL NOT 改变 nested grids、inter-grid drag、aspect ratio、group resize、custom compactor 或 layout repair preview 等 layout engine 语义。
- R14.AC4: WHEN 实现本规格 THEN 系统 SHALL NOT 新增 AI dashboard generation、layout lint MCP tool、external model migration assistant 或 scenario-aware AI assistant 行为。
- R14.AC5: WHEN 文档更新触及上述未来能力 THEN 文档 SHALL 只以 roadmap 或 future spec 方式引用，不把它们写成本规格验收范围。
