# Foundation Modernization 覆盖评估

评估日期：2026-05-22

总体证据：

- `npm run release:quality` — covered — 输出 `release quality gate verified`，串联 build、unit/browser/package/docs/import/package/bundle/perf/MCP。
- `test ! -e build && test ! -e typings && test ! -e webpack.config.js && test ! -e script.js` — covered — 输出 `legacy artifacts absent`。
- `rg "webpack|webpack-cli|webpack-dev-server|babel-loader|ts-loader|vue-loader|lodash-webpack-plugin|terser-webpack-plugin" package.json scripts test lib example README.md mcp` — covered — 仅命中 `scripts/check-package.mjs` 的禁用列表。

## Requirements

- R1.AC1 — covered — `vite.config.ts` 多入口 library build；`scripts/build-package.mjs` 生成 Vite dist、CSS、CJS wrapper 和 `tsconfig.types.json` declarations；`npm run release:quality` 通过。
- R1.AC2 — covered — `package.json#build` 指向 `node scripts/build-package.mjs`；`dist/index.mjs`、`dist/index.cjs`、`dist/types/index.d.ts`、`dist/style.css` 已由 build 产出并被 `check:package` 验证。
- R1.AC3 — covered — `webpack.config.js` 删除；`package.json` 无 webpack active deps/scripts；`scripts/check-package.mjs` 检查 webpack/loader/plugin 禁用项。
- R1.AC4 — covered — `script.js` 删除；无 legacy Babel CJS/webpack active workflow；旧链路只在 `docs/specs/foundation-modernization/migration.md` 和 README migration note 中说明。
- R1.AC5 — covered — `scripts/publish.mjs`、`scripts/release.mjs` 先运行 `release:quality`；`package.json#files` 收敛到 dist/README/LICENSE/package metadata。
- R1.AC6 — covered — `package.json#dev` 使用 Vite；`build-docs` 使用 `vite.docs.config.ts`；`test/vite-browser-smoke.js` 创建 Vite server 并断言无 UMD 请求。
- R2.AC1 — covered — `package.json#exports` 声明根入口、subpaths、`./style.css` 和 `./package.json`。
- R2.AC2 — covered — `lib/entries/index.ts` 根兼容对象只挂 core/responsive 常用能力；README “Which Entry Should I Use?” 推荐高级能力 subpaths。
- R2.AC3 — covered — `package.json#exports` 包含 `./core`、`./responsive`、`./layout-engine`、`./editor`、`./dashboard`、`./dashboard-editor-shell`、`./persistence`、`./history`、`./worker`、`./style.css`、`./package.json`。
- R2.AC4 — covered — `scripts/check-package-exports.mjs` 验证每个 JS subpath import 目标存在；`test:package` ESM consumer import 根入口和关键 subpaths。
- R2.AC5 — covered — `scripts/check-package-exports.mjs` 验证 require 目标存在；`test:package` CJS consumer require 根入口和关键 subpaths。
- R2.AC6 — covered — `scripts/check-doc-imports.mjs` 扫 README/MCP/example imports 只允许 public exports；README migration note 标明 deep imports 私有。
- R2.AC7 — covered — `docs/specs/foundation-modernization/migration.md` 和 README migration note 列出旧路径到新 subpath 的迁移映射。
- R3.AC1 — covered — `lib/entries/index.ts` 默认导出 `rootCompat`，基于 `VueGridLayout`；`test:package` ESM consumer 断言 `VGL === VueGridLayout`。
- R3.AC2 — covered — `scripts/build-package.mjs` 生成 `dist/index.cjs` compat wrapper；`test:package` CJS consumer 断言 `VGL.default === VGL`、`VGL.VueGridLayout === VGL`。
- R3.AC3 — covered — `lib/entries/index.ts` 保留 `VueGridLayout`、`Responsive`、`ResponsiveVueGridLayout`、`WidthProvider`、utils/gridHeight 常用导出。
- R3.AC4 — covered — `scripts/check-bundle-boundary.mjs` 验证 root/core/responsive/layout-engine/persistence 不吸入 history/pinia/MCP/Node-only 重能力；`npm run check:bundle` 通过。
- R3.AC5 — covered — editor/dashboard/persistence/history/layout-engine/worker 通过 `lib/entries/*` subpath 暴露；README migration note 给出替代入口，无新增根入口高级 compat shim。
- R4.AC1 — covered — `package.json` 将 `vue` 声明为 peerDependency 和 devDependency，未放在 dependencies。
- R4.AC2 — covered — `vite.config.ts` externalizes `vue`；`scripts/check-bundle-boundary.mjs` 和 package matrix 验证产物边界。
- R4.AC3 — covered — `package.json` 将 `pinia` 设为 peerDependency、devDependency，并在 `peerDependenciesMeta.pinia.optional` 标为 optional；README 标注 history optional peer。
- R4.AC4 — covered — `scripts/test-package-consumers.mjs` no-Pinia consumer import root/core/responsive/layout-engine/persistence 成功。
- R4.AC5 — covered — README history/optional peer 文档说明使用 `./history` 需安装 Pinia；Pinia consumer 安装 `pinia` 后验证 history runtime/types。
- R4.AC6 — covered — `scripts/check-bundle-boundary.mjs` 失败条件覆盖 pinia/editor/dashboard/history/MCP 边界；`release:quality` 运行该 gate。
- R5.AC1 — covered — `tsconfig.types.json` declaration emit；`dist/types/*.d.ts` 由 `npm run build` 产出。
- R5.AC2 — covered — `package.json#exports[*].types` 指向 `dist/types/*.d.ts`；`scripts/check-public-types.mjs` 验证 public types；TS consumer typecheck 通过。
- R5.AC3 — covered — `package.json#types` 为 `./dist/types/index.d.ts`。
- R5.AC4 — covered — `typings/index.d.ts` 删除；README/migration note 说明 generated declarations under `dist/types` 替代旧 typings。
- R5.AC5 — covered — 无手写全量 typings；MCP 仅在 `mcp/scripts/generate-props.js` 为 docs 工具补充少量 props 合约文本，不作为根包类型入口。
- R5.AC6 — covered — `scripts/check-public-types.mjs`、`scripts/check-package-exports.mjs`、TS consumer 覆盖 root/subpath/CSS/worker/history types。
- R6.AC1 — covered — `lib/entries/worker.ts` 和 `package.json#exports["./worker"]` 暴露 worker entry；`dist/worker.mjs`、`dist/worker.cjs` 存在。
- R6.AC2 — covered — `dist/style.css` 由 build 产出；`package.json#exports["./style.css"]` 和 `style` 字段指向该文件。
- R6.AC3 — covered — `package.json#sideEffects` 保留 CSS；`scripts/check-package.mjs` 验证 CSS sideEffects。
- R6.AC4 — covered — `package.json` 删除 `unpkg`；根目录无 `build/`；README/migration note 标明 UMD/CDN removal。
- R6.AC5 — covered — Vite browser consumer build、browser smoke 和 `check:bundle` 均通过，未引入 Node/MCP/webpack-only 代码。
- R6.AC6 — covered — README worker 示例使用 `new URL("@marsio/vue-grid-layout/worker", import.meta.url)`，并说明 bundler/optional peer 边界。
- R7.AC1 — covered — README 增加 “Which Entry Should I Use?” 分层入口章节。
- R7.AC2 — covered — README 标明根入口是 core/responsive 兼容入口，高级能力走 subpath。
- R7.AC3 — covered — README 对 Headless Editor、Dashboard Runtime、Dashboard Editor Shell 描述 controller/adapter/shell 边界。
- R7.AC4 — covered — README 和 MCP data 说明 subpath 用途；`scripts/check-doc-imports.mjs` 验证公开入口。
- R7.AC5 — covered — `example/main.ts` demo registry 标注 basic、responsive、persistence、editor、dashboard runtime、dashboard shell、placement、migration、worker 标签；README 同步列出。
- R7.AC6 — covered — README 在 history、worker、dashboard/editor 入口说明 optional peer 和浏览器 bundler 用法。
- R8.AC1 — covered — README 基础示例修复 `reactive` import；responsive 示例使用一致组件注册/导入。
- R8.AC2 — covered — `scripts/check-doc-imports.mjs` 对 README/MCP/example imports 做 smoke；`release:quality` 运行 `test:examples`。
- R8.AC3 — covered — `mcp/src/data.ts` 示例和 README 使用 root/subpath public imports；MCP build/data/smoke 通过。
- R8.AC4 — covered — README 示例包含 CSS import、worker URL、history Pinia optional peer、dashboard/editor subpath import。
- R8.AC5 — covered — browser DOM 流程通过 `test/vite-browser-smoke.js` headless/Vite smoke；import/type syntax 由 `test:examples`、TS consumer 覆盖。
- R8.AC6 — covered — `scripts/check-doc-imports.mjs` 验证 README/MCP/example imports 存在于 `package.json#exports`。
- R8.AC7 — covered — `example/index.html` 使用 `<script type="module" src="/example/main.ts">`；browser smoke 断言无 `window.VueGridLayout` 和无 `build/web/vue-grid-layout.min.js` 请求。
- R9.AC1 — covered — `scripts/test-package-consumers.mjs` 使用 `npm pack --json` 创建 packed artifact。
- R9.AC2 — covered — ESM consumer import root/core/responsive/layout-engine/persistence/worker/style 并断言最小 runtime。
- R9.AC3 — covered — CJS consumer require root/core/responsive/layout-engine/persistence/worker 并断言 root compat。
- R9.AC4 — covered — TS consumer typechecks root、subpaths、CSS、worker URL、history types。
- R9.AC5 — covered — no-Pinia consumer 不安装 pinia，import root/core/responsive/layout-engine/persistence 成功。
- R9.AC6 — covered — Pinia history consumer 安装 `pinia`，创建 history store 并验证 undo state。
- R9.AC7 — covered — Vite browser consumer production build 解析 CSS entry 和 worker entry。
- R9.AC8 — covered — `test:vite-browser-smoke.js` 启动 Vite server 并访问 demo pages，确认无 webpack/UMD 全局路径。
- R10.AC1 — covered — `scripts/release-quality.mjs` 串联 build、unit、browser smoke、package matrix、docs、examples、package artifact、bundle、perf、MCP。
- R10.AC2 — covered — `release:quality` 运行 `npm run bench:layout-engine`，输出 pass/record-only benchmark scenarios。
- R10.AC3 — covered — `release:quality` 运行 `check:bundle`；该脚本检查 dependency inclusion 边界。
- R10.AC4 — covered — `scripts/publish.mjs`、`scripts/release.mjs` 在 publish/release 前运行 `release:quality`。
- R10.AC5 — covered — `scripts/check-package.mjs` 验证 npm pack files 包含 dist/CSS/types/README/LICENSE/package metadata 且排除 node_modules/.tmp/build/typings/docs raw context。
- R10.AC6 — covered — 所有 gate 本地已运行；`release-quality` 脚本本身记录本地替代命令集合。
- R10.AC7 — covered — `scripts/check-package.mjs` 验证 active scripts/deps/devDeps 和 legacy files 无 webpack/loader/plugin。
- R11.AC1 — covered — `docs/specs/foundation-modernization/migration.md` 和 README migration note 记录旧路径、新路径、脚本变化、行为差异。
- R11.AC2 — covered — migration note 覆盖 `build/cjs/cjs.js`、`build/web/vue-grid-layout.min.js`、worker artifact、docs/dev/smoke 影响和 UMD/CDN removal。
- R11.AC3 — covered — README major-version migration note 给出 deep import 和高级能力 subpath 替代；根入口只保 core/responsive 兼容。
- R11.AC4 — covered — `scripts/release-quality.mjs` 使用阶段标签输出 build/unit/browser/package/docs/import/package/bundle/perf/MCP；各检查脚本输出对应诊断。
- R11.AC5 — covered — migration note 标明回滚到稳定分支/tag，不混用新旧产物；无 legacy active workflow。
- R12.AC1 — covered — 新能力通过 `lib/entries/*` subpaths、controller/config/adapter 暴露；未给根组件新增高级 props。
- R12.AC2 — covered — README 推荐 editor/dashboard/persistence/history/layout-engine 使用 subpath，根入口未继续添加高级能力。
- R12.AC3 — covered — `scripts/check-doc-imports.mjs` 防止文档推荐未公开 deep imports；`package.json#exports` 封闭公共边界。
- R12.AC4 — covered — README migration note 标记 major breaking changes，并给 deep import/subpath 迁移示例。
- R12.AC5 — covered — README 非目标说明未来能力基于分层入口/gates 扩展；本次未实现未来能力。
- R13.AC1 — covered — `mcp/scripts/generate-props.js` 读取 `dist/types`/源码类型并生成 MCP props/types；`release:quality` MCP build 通过。
- R13.AC2 — covered — MCP 基础示例使用 `@marsio/vue-grid-layout` public import；`test:examples` 验证。
- R13.AC3 — covered — MCP advanced docs 使用 editor/dashboard subpaths 或明确 root compat；`scripts/check-doc-imports.mjs` 验证。
- R13.AC4 — covered — MCP docs/search/types 引用 root 和 exports 声明 subpaths；无根包 `./mcp` export。
- R13.AC5 — covered — `package.json#exports` 无 `./mcp`；`check:bundle` 防止 MCP-only/Node-only 代码进入 browser bundle。
- R13.AC6 — covered — `release:quality` 运行 `yarn build`、`yarn check:data`、`yarn test:mcp` in `mcp/`，均通过。
- R14.AC1 — covered — diff scope guard 未新增 Editor Kit toolbar/outline/inspector/palette/context menu/command palette/diagnostics panel UI；README 仅说明 no bundled toolbar/inspector/palette。
- R14.AC2 — covered — scope guard 未新增 Widget Registry schema/settings/business catalog；无相关实现文件变更。
- R14.AC3 — covered — layout engine changes limited to packaging/perf import paths; `npm run bench:layout-engine` 和 layout-engine tests 通过，未改变 nested/inter-grid/aspect/group/custom compactor/repair preview 语义。
- R14.AC4 — covered — scope guard 未新增 AI dashboard generation、layout lint MCP tool、external model migration assistant、scenario-aware AI assistant 行为。
- R14.AC5 — covered — README 只以非目标/未来扩展边界提及这些能力，不纳入验收范围。

## Design

- Architecture overview — covered — `vite.config.ts`、`scripts/build-package.mjs`、`package.json#exports`、`lib/entries/*` 实现 Vite-first pipeline 和分层 public API。
- Data flow diagram — covered — `lib/entries/* -> Vite -> dist/* -> package exports -> packed consumers -> release-quality` 全链路由 `npm run release:quality` 验证。
- Public entry facade: root — covered — `lib/entries/index.ts` root compat object；ESM/CJS consumers 验证。
- Public entry facade: core — covered — `lib/entries/core.ts` and `package.json#exports["./core"]`。
- Public entry facade: responsive — covered — `lib/entries/responsive.ts` and `package.json#exports["./responsive"]`。
- Public entry facade: layout-engine — covered — `lib/entries/layout-engine.ts` and `package.json#exports["./layout-engine"]`。
- Public entry facade: editor — covered — `lib/entries/editor.ts` and README Headless Editor subpath。
- Public entry facade: dashboard — covered — `lib/entries/dashboard.ts` and README Dashboard Runtime subpath。
- Public entry facade: dashboard-editor-shell — covered — `lib/entries/dashboard-editor-shell.ts` and README Dashboard Editor Shell subpath。
- Public entry facade: persistence — covered — `lib/entries/persistence.ts` and README Persistence subpath。
- Public entry facade: history — covered — `lib/entries/history.ts` as only Pinia public entry; no-Pinia and Pinia consumers verify boundary.
- Public entry facade: worker — covered — `lib/entries/worker.ts` and Vite consumer `new URL("@marsio/vue-grid-layout/worker", import.meta.url)` build.
- Vite Build Config library mode — covered — `vite.config.ts` multi-entry library build produces `.mjs`/`.cjs` and CSS.
- Vite demo/default mode — covered — `example/index.html` + `example/main.ts`; `npm run build-docs` and browser smoke use Vite.
- No package `"type": "module"` migration side effect — covered — package remains CommonJS-compatible for scripts while published artifacts use `.mjs`/`.cjs`.
- Vite deps — covered — `package.json` includes `vite` and `@vitejs/plugin-vue-jsx`; webpack deps removed.
- Type declaration builder — covered — `tsconfig.types.json`, `scripts/check-public-types.mjs`, generated `dist/types`.
- Package metadata — covered — `package.json` fields `main/module/types/style/exports/files/sideEffects/peerDependencies/peerDependenciesMeta` match design and pass `check:package`.
- CJS root compatibility adapter — covered — `scripts/build-package.mjs` writes `dist/index.cjs` wrapper; CJS consumer asserts root shape.
- Demo/docs/browser smoke — covered — `example/main.ts`, `vite.docs.config.ts`, `test/vite-browser-smoke.js`; no UMD global path.
- Release gate scripts — covered — `package.json` exposes `build`, `dev`, `build-docs`, `test:package`, `test:examples`, `check:package`, `check:bundle`, `release:quality`, `publish`, `release`.
- Public Import API — covered — README examples and package consumers import root/core/responsive/layout-engine/editor/dashboard/dashboard-editor-shell/persistence/history/style.
- CJS API — covered — CJS consumer verifies `require("@marsio/vue-grid-layout")` shape and subpath require.
- Worker API — covered — README and TS/Vite consumers use `workerLayoutExecutor` with package worker URL.
- MCP boundary — covered — root exports omit `./mcp`; `mcp/` build/check/test remains independent.
- Data model/config metadata — covered — `lib/entries/*`, `package.json#exports`, `scripts/check-package-exports.mjs`, `scripts/check-bundle-boundary.mjs`, `scripts/check-doc-imports.mjs`, migration note all exist.
- Old path handling — covered — `build/`, `typings/`, `script.js`, `webpack.config.js` absent; old paths only documented in migration notes.
- Security: no browser MCP/Node-only code — covered — `check:bundle` and Vite browser consumer pass.
- Security: no remote CDN example path — covered — example Vite ESM app removes CDN scripts; `check-doc-imports` bans unpkg/legacy tokens outside migration/check diagnostics.
- Security: static worker URL — covered — README uses `new URL(...)`, no user-input worker URL construction.
- Security: exports map closes deep imports — covered — `package.json#exports` and doc import checker enforce public boundary.
- Security: CSS sideEffects preserved — covered — `package.json#sideEffects` and `check:package`.
- Security: package file list guarded — covered — `check:package` dry-run verifies pack contents.
- Security: no webpack EnvironmentPlugin — covered — webpack config/deps removed; no webpack active dependency.
- Test strategy: build/unit — covered — `release:quality` build and `npm test` pass.
- Test strategy: package matrix — covered — `test:package` verifies ESM/CJS/TS/no-Pinia/Pinia/Vite browser consumers.
- Test strategy: browser/demo — covered — `test:browser` starts Vite server and checks all demo tags.
- Test strategy: docs/MCP — covered — `test:examples`, `yarn build`, `yarn check:data`, `yarn test:mcp` pass.
- Test strategy: artifact/bundle — covered — `check:package`, `check:bundle`, `bench:layout-engine` pass.
- Rollback — covered — migration note documents stable branch/tag rollback and no mixed artifacts.

## Tasks

- Task 1 — covered — `docs/specs/foundation-modernization/migration.md` records baseline, legacy paths, rollback and gate categories.
- Task 2 — covered — `lib/entries/*` added; root compat and subpath split verified by build/package matrix.
- Task 3 — covered — Vite build scripts/config added; webpack/Babel publish chain removed; `npm run build` passed inside `release:quality`.
- Task 4 — covered — `tsconfig.types.json`, public type checks and TS consumer cover declarations.
- Task 5 — covered — package metadata, peer/optional peer boundaries and no-Pinia/Pinia consumers verified.
- Task 6 — covered — root CJS wrapper and consumer assertions verify compat object.
- Task 7 — covered — worker/CSS exports, sideEffects, README and Vite consumer verified.
- Task 8 — covered — Vite ESM demo registry and docs build verified.
- Task 9 — covered — browser smoke migrated to Vite/headless package imports and legacy network/global assertions.
- Task 10 — covered — packed package consumer matrix covers ESM/CJS/TS/no-Pinia/Pinia/Vite browser.
- Task 11 — covered — README entry guide, examples, migration note and doc import checks updated.
- Task 12 — covered — MCP generator/data/docs aligned with public exports; MCP build/check/test passed.
- Task 13 — covered — package exports/artifact/bundle/webpack gates added and run in `release:quality`.
- Task 14 — covered — `release:quality`, `publish`, `release` scripts added; full gate passed.
- Task 15 — covered — `webpack.config.js`, `script.js`, `build/`, `typings/`, UMD/CDN commitments removed from active workflow.
- Task 16 — covered — scope guard grep found no implemented future UI/schema/layout/AI behaviors; final gate evidence recorded here.

Remaining gaps/risks: 无。
