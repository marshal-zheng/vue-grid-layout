# Foundation Modernization 实现任务

- [x] 1. 建立迁移基线和旧链路清单
  - 记录当前 `package.json`、`script.js`、`webpack.config.js`、`example/index.html`、browser tests、README、MCP scripts 中依赖 Babel/webpack/UMD/typings 的位置。
  - 列出旧路径到新路径的初始映射，包括 `build/cjs/cjs.js`、`build/web/vue-grid-layout.min.js`、worker artifact、`typings/index.d.ts`、`css/styles.css`。
  - 创建迁移说明草稿，明确回滚只能回到稳定分支/tag，不混用新旧产物。
  - 为后续 gate 预留诊断类别：构建、exports、types、optional peer、示例、性能、bundle budget、webpack active dependency。
  _需求追溯: R1.AC2, R1.AC3, R1.AC4, R6.AC4, R10.AC7, R11.AC1, R11.AC2, R11.AC4, R11.AC5_

- [x] 2. 新增 public entry facades 并收敛公共 API 边界
  - 新建 `lib/entries/index.ts`、`core.ts`、`responsive.ts`、`layout-engine.ts`、`editor.ts`、`dashboard.ts`、`dashboard-editor-shell.ts`、`persistence.ts`、`history.ts`、`worker.ts`。
  - 将根入口瘦身为 core/responsive 兼容入口，默认导出 `VueGridLayout` 兼容对象，并保留 `VueGridLayout`、`Responsive`、`ResponsiveVueGridLayout`、`WidthProvider` 等常用命名导出。
  - 将 editor、dashboard、persistence、history、layout-engine、worker 只作为 subpath 公开，避免继续向根入口添加高级能力。
  - 检查现有高级能力导出，决定迁移说明中的替代 subpath，不为高级能力新增根入口 compat shim。
  _需求追溯: R2.AC1, R2.AC2, R2.AC3, R2.AC4, R2.AC5, R2.AC6, R2.AC7, R3.AC1, R3.AC2, R3.AC3, R3.AC4, R3.AC5, R12.AC1, R12.AC2, R12.AC3, R12.AC4, R12.AC5_

- [x] 3. 引入 Vite library build 并替换发布构建脚本
  - 新增 `vite.config.ts`，配置多入口 library build，输出 `dist/*.mjs`、`dist/*.cjs`、worker 和 CSS；发布包不包含 sourcemap。
  - 引入 `vite`、`@vitejs/plugin-vue-jsx` 和必要的 Vite-compatible tooling。
  - 改造 `npm run build`，按顺序清理 `dist`、运行 Vite build、生成 types、复制/产出 CSS、生成 root CJS compat wrapper、检查 exports。
  - 确保 `vue`、`pinia` 和其他 peer/runtime deps 在 ESM、CJS、worker 构建中按边界 externalized。
  - 移除 `build/cjs` 与 `build/web` 作为发布产物来源。
  _需求追溯: R1.AC1, R1.AC2, R1.AC5, R4.AC2, R6.AC1, R6.AC2, R6.AC3, R6.AC5, R10.AC5_

- [x] 4. 建立生成类型声明流程
  - 新增 `tsconfig.build.json` 或 `tsconfig.types.json`，启用 declaration emit，并排除独立 MCP 包。
  - 生成每个 public entry 对应的 `.d.ts`，并让 `exports` 中的 `types` 条件解析到正确文件。
  - 将 `typings/index.d.ts` 降级为兼容 shim 或迁移参考，不再作为唯一类型来源。
  - 新增类型漂移检查，确保实现导出、entry facade、package exports 和生成类型一致。
  - 在临时 TypeScript consumer 中覆盖根入口、subpath、CSS 和 worker 类型解析。
  _需求追溯: R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R2.AC4, R2.AC5, R9.AC4_

- [x] 5. 更新 package metadata 和依赖边界
  - 更新 `main`、`module`、`types`、`style`、`exports`、`files`、`sideEffects`，删除 `unpkg`。
  - 将 `vue` 从 runtime dependencies 移为 peer dependency，并保留 dev dependency。
  - 将 `pinia` 设置为 optional peer dependency，并保留 dev dependency 供 history 测试使用。
  - 检查 root/core/responsive/layout-engine/persistence 不会因缺少 `pinia` 在 install、typecheck 或 runtime import 阶段失败。
  - 为 history 入口缺少 `pinia` 的场景提供明确错误或文档引导。
  _需求追溯: R4.AC1, R4.AC2, R4.AC3, R4.AC4, R4.AC5, R4.AC6, R6.AC3, R10.AC3_

- [x] 6. 实现 CJS 根入口兼容验证
  - 验证 Vite CJS 输出是否满足 `require("@marsio/vue-grid-layout")` 直接返回组件对象。
  - 若 Vite/Rollup 默认 CJS 形态返回 namespace object，则生成 `dist/index.cjs` compat wrapper，并将原始 CJS runtime 输出改名为内部文件。
  - 为根 CJS 断言 `default === VueGridLayout === module.exports`，并断言 responsive/core 常用属性存在。
  - 对关键 subpath 执行 CJS require smoke，允许 subpath 返回标准 namespace object。
  _需求追溯: R3.AC1, R3.AC2, R3.AC3, R3.AC4, R9.AC1, R9.AC3_

- [x] 7. 固化 worker 与 CSS 发布契约
  - 将 `lib/layout-engine/workerRuntime.ts` 接入 Vite worker/public entry 构建，产出可通过 `./worker` export 解析的 worker artifact。
  - 验证 `workerLayoutExecutor({ workerUrl })` 在 Vite consumer 中可以使用 `new URL("@marsio/vue-grid-layout/worker", import.meta.url)` 或文档化替代形式。
  - 将 `css/styles.css` 或等价源样式产出为 `dist/style.css`，并通过 `./style.css` export 暴露。
  - 检查 `sideEffects` 不会导致 CSS 被 bundler 删除。
  - 更新 README worker/CSS 示例，包含必要导入、限制和 optional peer 说明。
  _需求追溯: R6.AC1, R6.AC2, R6.AC3, R6.AC4, R6.AC5, R6.AC6, R8.AC4, R9.AC7_

- [x] 8. 迁移 demo/dev server 到 Vite ESM
  - 将 `example/index.html` 改为 Vite app，移除 `vue-3.2.36.js`、`babel.min.js`、Pinia CDN script 和 `../build/web/vue-grid-layout.min.js`。
  - 新增 `example/main.ts` 与 demo registry，通过 package-style imports 加载根入口和 subpath。
  - 将现有示例按能力标签迁移到 ESM demo modules，至少覆盖 basic、responsive、persistence、editor、dashboard runtime、dashboard shell、placement、migration。
  - 改造 `npm run dev` 为 Vite dev server，改造 `npm run build-docs` 为 Vite docs/static build。
  - 确保 docs build 不复制 UMD artifact，也不依赖 webpack dev server。
  _需求追溯: R1.AC6, R7.AC5, R8.AC7, R9.AC8, R11.AC2_

- [x] 9. 迁移 browser/component smoke 到 Vite
  - 改造 `test/editor-component-browser.test.js` 等 browser tests，测试 HTML 使用 `<script type="module">` 或 Vite-served module。
  - 从 public package-style imports 获取组件、style、worker 和高级能力，不再读取 `window.VueGridLayout`。
  - 使用 Vite dev server、Vite preview 或 Vite middleware 提供测试页面，不启动 webpack server。
  - 在 browser smoke 中断言网络请求不包含 `build/web/vue-grid-layout.min.js`，运行时不依赖 `window.VueGridLayout`。
  - 对无法执行完整浏览器流程的示例记录跳过原因，并至少校验 import/type syntax。
  _需求追溯: R8.AC5, R8.AC7, R9.AC8, R10.AC1, R11.AC4_

- [x] 10. 建立 packed package consumer 矩阵
  - 新增 `test:package`，通过 `npm pack` 或等价 packed artifact 创建临时消费者项目。
  - ESM consumer 覆盖根入口、core、responsive、layout-engine、persistence、worker、style。
  - CJS consumer 覆盖根入口兼容对象和关键 CJS subpath。
  - TypeScript consumer 覆盖根入口、subpath types、CSS、worker 和历史兼容类型。
  - no-Pinia consumer 不安装 `pinia`，确认 root/core/responsive/layout-engine/persistence import 不失败。
  - Pinia history consumer 安装 `pinia`，确认 `./history` runtime 和 types 可用。
  - Vite browser consumer 执行 production build，确认 CSS entry 和 worker entry 可解析。
  _需求追溯: R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R9.AC7, R2.AC4, R2.AC5, R3.AC2, R4.AC4_

- [x] 11. 更新 README、示例可信度和迁移说明
  - 更新 README 的“选择哪个入口”章节，按 Core Grid、Responsive Grid、Layout Engine、Persistence、Headless Editor、Dashboard Runtime、Dashboard Editor Shell、独立 MCP/AI Tooling 分层说明。
  - 修复基础 usage 示例中已知的 `reactive` import 缺失和 responsive 组件注册不一致问题。
  - 为 root API、subpath API、optional peer、worker、CSS 和 browser bundler 用法提供最小示例。
  - 标注 example 能力标签，并让 README 示例引用已通过 smoke/compile/import check 的公开入口。
  - 编写 major-version migration note，列出旧 deep imports、旧构建路径、旧 UMD/CDN 用法、替代 subpath 和兼容策略。
  - 明确非目标能力只作为 roadmap/future spec 提及，不进入本规格验收范围。
  _需求追溯: R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R8.AC1, R8.AC2, R8.AC3, R8.AC4, R8.AC5, R8.AC6, R11.AC1, R11.AC2, R11.AC3, R11.AC4, R11.AC5, R12.AC2, R12.AC3, R12.AC4, R14.AC5_

- [x] 12. 同步 MCP 数据和文档边界
  - 更新 MCP 数据生成或校验逻辑，使 MCP docs/search/types 只引用根入口和 `exports` map 声明的 subpath。
  - 确认 MCP 基础 grid 示例、高级 editor/dashboard 示例与 README 使用一致公开入口。
  - 保持 MCP 包独立发布，不在根包加入 `./mcp` export。
  - 保持 `mcp` 包 build、check:data、test:mcp 流程可用。
  - 新增 README/MCP/example imports consistency check，避免 AI 工具推荐失效导入路径。
  _需求追溯: R13.AC1, R13.AC2, R13.AC3, R13.AC4, R13.AC5, R13.AC6, R8.AC3, R8.AC6, R7.AC4_

- [x] 13. 实现 package、exports、bundle 和 webpack 移除 gate
  - 新增 `check:package`，验证 published files 包含必要 dist、CSS、types、README、license 和 package metadata，且不包含 node_modules、临时输出或 docs raw context。
  - 新增 `check-package-exports`，验证 `exports` map 中每个 JS/types/CSS/worker 路径存在且可解析。
  - 新增 `check:bundle`，检查 root/core/responsive/layout-engine/persistence 不吸入 editor/dashboard/persistence/history/pinia 重能力或 MCP/Node-only 代码。
  - 新增 webpack active dependency 检查，确认 scripts、dependencies/devDependencies、配置文件中没有 webpack、webpack-cli、webpack-dev-server、loader 或 plugin。
  - 将 layout engine benchmark budget 和 bundle budget 接入 release-quality gate，或记录 CI 必跑位置和本地替代命令。
  _需求追溯: R4.AC6, R6.AC5, R10.AC2, R10.AC3, R10.AC5, R10.AC6, R10.AC7, R11.AC4_

- [x] 14. 串联 release-quality、publish 和 release 流程
  - 新增 `release:quality`，串联 build、unit tests、browser/component smoke、package resolution tests、type consumer tests、README/MCP example checks、package artifact checks、performance/bundle budgets。
  - 改造 `publish` 和 `release`，发布前必须通过 `release:quality`。
  - 确保失败输出能区分构建、ESM/CJS exports、类型、optional peer、示例、性能和 bundle budget。
  - 在 CI 中执行 release-quality gate，并记录本地无法运行项的替代命令。
  _需求追溯: R1.AC5, R9.AC1, R9.AC2, R9.AC3, R9.AC4, R9.AC5, R9.AC6, R9.AC7, R9.AC8, R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC5, R10.AC6, R11.AC4_

- [x] 15. 删除 legacy webpack/Babel 发布链路和旧 artifact 承诺
  - 删除 `webpack.config.js`，移除 webpack CLI/analyzer/dev-server scripts 和相关 loader/plugin dependencies。
  - 删除或改造 `script.js` 中调用 Babel CJS、webpack build、webpack dev server、复制 UMD artifact 的逻辑。
  - 移除 `unpkg`、`build`、`typings`、`vue-grid-layout.min.js` 等旧发布文件承诺。
  - 确认 README、example、browser tests、MCP data 不再引用 `build/web/vue-grid-layout.min.js`、`window.VueGridLayout` 或旧 worker artifact。
  - 只在迁移说明中保留旧路径解释，不保留可误用的 legacy active workflow。
  _需求追溯: R1.AC3, R1.AC4, R6.AC4, R8.AC7, R10.AC7, R11.AC2, R11.AC5_

- [x] 16. 执行范围守卫和最终验收
  - 检查本规格实现没有引入 Editor Kit toolbar、outline、inspector、palette、context menu renderer、command palette 或 diagnostics panel UI。
  - 检查没有定义 Widget Registry 完整 schema、widget settings descriptors 或业务 widget catalog。
  - 检查没有改变 nested grids、inter-grid drag、aspect ratio、group resize、custom compactor 或 layout repair preview 等 layout engine 语义。
  - 检查没有新增 AI dashboard generation、layout lint MCP tool、external model migration assistant 或 scenario-aware AI assistant 行为。
  - 确认未来 Editor Kit、Widget Registry、Layout Engine Pro、AI/MCP 扩展只能基于本规格建立的 subpath 和 gate 继续扩展。
  _需求追溯: R14.AC1, R14.AC2, R14.AC3, R14.AC4, R14.AC5, R12.AC1, R12.AC5_
