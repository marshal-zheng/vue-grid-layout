# Foundation Modernization Migration Notes

This document records the migration boundary for the Vite-first package
foundation. It is intentionally written as a living checklist while the
implementation tasks move the package away from the legacy Babel/webpack/UMD
workflow.

## Legacy Workflow Inventory

### Package metadata

- `package.json#main` points to `build/cjs/cjs.js`, which is produced by the
  Babel CJS step in `script.js`.
- `package.json#style` points to the source stylesheet `css/styles.css` rather
  than a published `dist` stylesheet.
- `package.json#unpkg` points to `build/web/vue-grid-layout.min.js`, the legacy
  UMD artifact.
- `package.json#typings` points to `typings/index.d.ts`, a handwritten
  all-in-one declaration file.
- `package.json#files` publishes `/build`, `/css`, `/typings`, and
  `/vue-grid-layout.min.js`.
- `package.json#sideEffects` is `false`, which can allow bundlers to drop CSS.
- `package.json#scripts.analyze` calls `webpack --config webpack.config.js`.
- `vue` is listed in `dependencies`; `pinia` is a required peer dependency
  instead of an optional peer scoped to history usage.
- Active dev dependencies include webpack, webpack CLI/dev-server/analyzer,
  webpack loaders/plugins, and Babel CLI/presets/plugins for the library build.

### Build and release scripts

- `script.js#buildCJS` runs Babel over `./lib` into `./build/cjs`.
- `script.js#buildWeb` runs webpack in production mode.
- `script.js#dev` starts `webpack serve`.
- `script.js#generateDocs` copies `example/` to `docs/`, copies
  `build/web/vue-grid-layout.min.js`, and rewrites `example/index.html` to load
  that copied UMD artifact.
- `script.js#publish` runs the legacy build and then `npm publish` without a
  release-quality gate.
- `script.js#release` versions and tags without first requiring the modern
  release-quality gate.

### Webpack configuration

- `webpack.config.js` defines UMD entries for `vue-grid-layout.min` and
  `vue-grid-layout.worker`.
- `webpack.config.js` outputs to `build/web` and exposes the global
  `VueGridLayout` UMD library.
- `webpack.config.js` configures `webpack-dev-server` for `example/index.html`.
- `webpack.config.js` uses `ts-loader`, `babel-loader`, `vue-loader`,
  `eslint-webpack-plugin`, `fork-ts-checker-webpack-plugin`,
  `progress-bar-webpack-plugin`, `lodash-webpack-plugin`,
  `terser-webpack-plugin`, `webpack-bundle-analyzer`, and webpack
  `EnvironmentPlugin`.

### Demo and docs

- `example/index.html` loads `example/vue-3.2.36.js`,
  `https://unpkg.com/pinia@2.1.7/dist/pinia.iife.js`,
  `../build/web/vue-grid-layout.min.js`, and `example/babel.min.js`.
- The demo switcher dynamically injects legacy script files such as
  `example/00-list.js` instead of using Vite-served ESM modules.
- `example/22-layout-engine-performance.js` references
  `../build/web/vue-grid-layout.worker.js`.
- README documents the worker artifact as `build/web/vue-grid-layout.worker.js`.
- README basic usage currently calls `reactive()` without importing it.
- README history usage imports `useGridHistoryStore` from the root entry, which
  conflicts with the new optional history subpath boundary.
- `mcp/README.md` and `mcp/src/data.ts` describe MCP data as sourced from
  `typings/index.d.ts`.
- `mcp/scripts/generate-props.js` reads `typings/index.d.ts` for type snippets.

### Browser and component smoke tests

- `test/editor-component-browser.test.js`,
  `test/dashboard-editor-shell-browser.test.js`,
  `test/dashboard-responsive-component-browser.test.js`,
  `test/grid-layout-contract-browser.test.js`, and
  `test/persistence-component-browser.test.js` load
  `/build/web/vue-grid-layout.min.js`.
- Those tests read components and APIs from `window.VueGridLayout`.
- Browser tests serve files through custom HTTP servers rather than Vite dev,
  preview, or middleware.

### Node test compile chain

- `test/run-layout-engine-tests.js`, `test/run-persistence-tests.js`,
  `test/run-editor-tests.js`, `test/run-dashboard-tests.js`, and
  `test/run-dashboard-editor-shell-tests.js` call `script.js --action=build`
  and then run Babel over `./lib` and `./test` into `.tmp`.

## Initial Path Mapping

| Legacy path or contract | New path or contract |
| --- | --- |
| `build/cjs/cjs.js` | `dist/index.cjs` for root CJS; `dist/*.cjs` for subpaths |
| `build/web/vue-grid-layout.min.js` | No replacement UMD artifact; use ESM/CJS package exports |
| `build/web/vue-grid-layout.worker.js` | `@marsio/vue-grid-layout/worker` via `dist/worker.mjs` and `dist/worker.cjs` |
| `typings/index.d.ts` | Generated declarations under `dist/types/*.d.ts` |
| `css/styles.css` package style field | `dist/style.css` and `@marsio/vue-grid-layout/style.css` export |
| `window.VueGridLayout` | Package-style imports from `@marsio/vue-grid-layout` and subpaths |
| `webpack serve` demo | Vite dev server for `example/index.html` |
| `script.js --action=docs` copy of UMD docs | Vite docs/static build |
| Root advanced exports | Subpaths such as `./editor`, `./dashboard`, `./persistence`, `./history`, `./layout-engine` |

## Diagnostic Categories Reserved For Gates

- `build`: Vite library build, CSS copy, declaration generation, and CJS wrapper
  generation failures.
- `exports`: missing, private, or unresolved package export paths.
- `types`: declaration drift, unresolved subpath types, or TypeScript consumer
  failures.
- `optional-peer`: no-Pinia consumer failures or unclear history peer guidance.
- `examples`: README, MCP, or demo imports that do not match public exports.
- `performance`: layout engine benchmark budget failures or skipped benchmark
  configuration.
- `bundle-budget`: forbidden heavy dependency inclusion or size budget failures.
- `webpack-active-dependency`: active scripts, dependencies, config files, or
  runtime references that still invoke webpack or webpack loaders/plugins.

## Rollback Boundary

Rollback must not mix new Vite artifacts with old Babel/webpack artifacts. If
the migration must be rolled back before release, return to the last stable
release branch or tag, or revert the Vite migration commits on a release branch.
The package must not publish both `dist/` exports and legacy `build/` UMD/CJS
artifacts as simultaneous public contracts.

## Major-Version Notes

- UMD/CDN usage through `build/web/vue-grid-layout.min.js` is removed.
- Undeclared deep imports are private and closed by `package.json.exports`.
- Root entry compatibility is limited to the default `VueGridLayout` component
  and common core/responsive exports.
- Advanced APIs move to explicit subpaths. Existing root-level advanced usage
  should migrate to the relevant subpath.
- `vue` is a peer dependency.
- `pinia` is an optional peer dependency required only by
  `@marsio/vue-grid-layout/history`.

## Root Advanced Export Migration Map

The legacy `lib/cjs.ts` root adapter exposed every feature from the package
root. The Vite-first root entry intentionally stops doing that. Use these
subpaths instead:

| Legacy root member | New public entry |
| --- | --- |
| `layoutEngine`, `createLayoutEngine`, `executeLayoutOperation`, `workerLayoutExecutor`, layout migration helpers | `@marsio/vue-grid-layout/layout-engine` |
| `history`, `createGridHistoryStore`, `useGridHistoryStore`, `bindKeyboardShortcuts` | `@marsio/vue-grid-layout/history` |
| `persistence`, `serializeLayoutDocument`, `deserializeLayoutDocument`, persistence adapters, `useGridLayoutPersistence` | `@marsio/vue-grid-layout/persistence` |
| `dashboard`, dashboard document serializers, ThingsBoard import/export helpers | `@marsio/vue-grid-layout/dashboard` |
| `dashboardMigration`, dashboard layout migration helpers | `@marsio/vue-grid-layout/dashboard` |
| `dashboardResponsive`, responsive dashboard profile helpers, `DashboardResponsiveVueGridLayout` | `@marsio/vue-grid-layout/dashboard` |
| `dashboardEditorShell`, `useDashboardEditorShell`, shell menu and transaction helpers | `@marsio/vue-grid-layout/dashboard-editor-shell` |
| `editor`, `useGridEditor`, editor controller, commands, guides, placement and keyboard helpers | `@marsio/vue-grid-layout/editor` |
| Worker runtime helpers | `@marsio/vue-grid-layout/worker` |
