# Lean Core Bundle Boundary Context

Date: 2026-05-22

Purpose: raw planning context for a future spec. This is not the formal
requirements/design/tasks package. Use it to generate a new spec in a fresh
conversation.

## Background

The Foundation Modernization work moved the package build, demo/dev server,
docs build, browser smoke, package exports, types, CSS, and worker entry to a
Vite-first pipeline.

Recent user feedback:

- The example page must keep the old behavior: service root lists all examples,
  clicking a list item opens the selected demo.
- Architecture work must not freely redesign example UI or change example
  behavior.
- The package should pursue the largest long-term performance benefit, not just
  short-term tarball size reductions.

Current example behavior after correction:

- `/` renders the examples list.
- `/example/index.html` remains available for old links and tests.
- `example/main.ts` acts as a Vite/ESM loader for the original `example/*.js`
  demos, preserving the old demo behavior while avoiding UMD/CDN globals.

## Current Build State

Webpack active workflow status:

- `webpack.config.js` removed.
- legacy `script.js` build/release workflow removed.
- `package.json` scripts/dependencies/devDependencies/peerDependencies do not
  include webpack, webpack loaders, webpack plugins, or webpack dev server.
- `package-lock.json` and `yarn.lock` do not contain webpack/loader/plugin
  entries.
- webpack references that remain are migration notes, README breaking-change
  explanations, and check-script forbidden token lists.

Build status already verified:

- `npm run build` passes.
- `npm run check:package` passes.
- `npm run check:bundle` passes.
- `npm run test:package` passes.
- `npm test` passes.
- `npm run test:browser` passes.
- `npm run build-docs` passes with Vite warnings only.

Important nuance:

- Published package build/dev/docs/browser/package-consumer flows are
  Vite/Vite-compatible.
- Some Node unit test runners still use Babel to transpile TypeScript test code.
  That Babel usage is not part of the npm publishing build and is not webpack.

## Sourcemap Optimization Already Done

Sourcemaps were removed from published artifacts:

- `vite.config.ts`: Vite build `sourcemap` disabled.
- `tsconfig.types.json`: `declarationMap` disabled.
- `scripts/build-package.mjs`: no longer writes public entry `.d.ts.map` files.
- `scripts/check-package.mjs`: `npm pack` fails if any `.map` file appears in
  the packed artifact.

Measured effect:

Before sourcemap removal:

- `dist`: 5.9M on disk.
- `npm pack` tarball: about 1.24 MB.
- unpacked package: about 5.46 MB.
- sourcemaps: about 3.58 MB.

After sourcemap removal:

- `dist`: 1.8M on disk.
- `dist` raw total: about 1.37 MB.
- `npm pack` tarball: about 0.35 MB / 363 KB.
- unpacked package: about 1.44 MB.
- sourcemap count: 0.

Current packed artifact composition:

- `.mjs`: about 648.62 KB.
- `.js`: about 388.33 KB.
- `types`: about 261.20 KB.
- `.cjs`: about 88.61 KB.
- README `.md`: about 62.26 KB.
- CSS: about 18.26 KB.

## Runtime Closure Measurements

The package tarball is now relatively small. The largest long-term performance
issue is runtime entry closure size, especially for basic users.

Measured transitive runtime closure sizes:

- `index.mjs`: raw about 461 KB, gzip about 118 KB, brotli about 101 KB.
- `core.mjs`: raw about 450 KB, gzip about 115 KB, brotli about 98 KB.
- `responsive.mjs`: raw about 456 KB, gzip about 116 KB, brotli about 99 KB.
- `layout-engine.mjs`: raw about 88 KB, gzip about 25 KB.
- `persistence.mjs`: raw about 48 KB, gzip about 13 KB.
- `history.mjs`: raw about 19 KB, gzip about 6 KB.
- `editor.mjs`: raw about 302 KB, gzip about 77 KB.
- `dashboard.mjs`: raw about 536 KB, gzip about 134 KB.
- `dashboard-editor-shell.mjs`: raw about 244 KB, gzip about 59 KB.

Largest runtime files:

- `keyboard-*.mjs`: raw about 173 KB, gzip about 42 KB.
- `VueGridLayout-*.mjs`: raw about 123 KB, gzip about 30 KB.
- `dashboard-editor-shell.mjs`: raw about 86 KB, gzip about 19 KB.
- `dashboard-migration-*.mjs`: raw about 77 KB, gzip about 17 KB.

Key finding:

- The `core` and root entries are small files themselves, but their transitive
  closure is large because `VueGridLayout` statically imports optional advanced
  capability modules.

## Current Static Dependency Problem

Basic `VueGridLayout` currently statically pulls in optional capabilities:

- `persistence`
- `layout-engine`
- `editor`
- `keyboard`
- `commands`

Important files involved:

- `lib/VueGridLayout.tsx`
- `lib/grid-layout/useGridLayoutModel.ts`
- `lib/grid-layout/useGridEditorRuntime.ts`
- `lib/grid-layout/useGridLayoutEngineBridge.ts`
- `lib/responsive/useResponsiveGridLayoutModel.ts`

Observed imports:

- `useGridLayoutModel.ts` imports `useGridLayoutPersistence` from
  `../persistence`.
- `useGridEditorRuntime.ts` imports runtime functions from `../editor` and
  `../layout-engine`.
- `useGridLayoutEngineBridge.ts` imports runtime functions from
  `../layout-engine`.
- `useResponsiveGridLayoutModel.ts` imports persistence, layout-engine, and
  editor runtime functions.

The current `check:bundle` gate is insufficient:

- It checks direct entry file content and some forbidden strings.
- It does not compute transitive dependency closure.
- Therefore it can miss cases like `core.mjs -> VueGridLayout chunk ->
  keyboard/editor/persistence chunks`.

## Recommended Long-Term Direction

Recommended strategy: hard boundary layering, not ad hoc internal lazy loading.

The largest long-term benefit comes from making lean core a real boundary:

1. `@marsio/vue-grid-layout/core` should contain only foundational grid runtime:
   `VueGridLayout`, drag/resize/layout basics, required utils, and required
   height/runtime behavior.
2. `core` should not transitively include editor, keyboard commands,
   persistence, dashboard, history, or Pinia.
3. Advanced capabilities should be paid for only when their public subpath or
   wrapper is explicitly imported.
4. Root entry behavior needs an explicit policy decision:
   - Either root becomes lean and old all-in-one behavior moves to a compat
     entry.
   - Or root remains compatibility-oriented while `./core` becomes the lean
     recommended performance entry.
5. Add a transitive bundle budget gate before changing implementation so future
   regressions are caught.

Preferred long-term API shape to explore in the spec:

- `@marsio/vue-grid-layout/core`: lean core grid.
- `@marsio/vue-grid-layout/responsive`: responsive grid with no editor or
  persistence unless explicitly enabled through a separate integration surface.
- `@marsio/vue-grid-layout/editor`: editor controller/runtime/wrapper.
- `@marsio/vue-grid-layout/persistence`: persistence adapters/composables.
- `@marsio/vue-grid-layout/dashboard`: dashboard data/runtime APIs.
- `@marsio/vue-grid-layout/dashboard-editor-shell`: advanced shell APIs.
- Optional `@marsio/vue-grid-layout/compat`: old all-in-one compatibility entry
  if root is made lean.

## Why Not Just Lazy-Load Everything Internally

Internal lazy-loading is tempting because it can preserve public props, but it
has weaker long-term architecture:

- First-use timing for editor/persistence becomes asynchronous and more complex.
- SSR, CJS, browser, and test environments become harder to reason about.
- Prop behavior may temporarily differ while optional modules load.
- Types and runtime behavior can drift.
- Bundle savings depend on downstream bundler behavior and dynamic import
  semantics.

Internal lazy-load can be a short-term tactic, but the preferred long-term
solution is explicit public layering and wrappers/subpaths.

## Risk Assessment

Lowest-risk optimization:

- Add transitive closure bundle budget gate.
- Keep public API unchanged at first.
- Use the gate to make the current problem visible and measurable.

Medium-risk optimization:

- Split persistence out of core static runtime.
- Persistence is already optional by prop/API, so it is a good first extraction
  candidate.

Higher-risk optimization:

- Split editor/keyboard/commands out of core static runtime.
- Editor touches drag/resize blocking, guides, keyboard shortcuts, placement,
  command results, and persistence envelopes.
- Needs browser/component smoke coverage for editor and placement.

Highest-risk optimization:

- Split or alter layout-engine default usage.
- Layout engine can affect drag, resize, collision, worker behavior, large
  layout performance, and layout semantics.
- Do not move this in the first iteration unless the spec explicitly defines
  behavior preservation and fallback semantics.

Dashboard-specific optimization:

- `dashboard.mjs` currently pulls editor/keyboard-related chunks because the
  dashboard component supports editor mode.
- Long-term, consider splitting pure dashboard data/runtime from dashboard Vue
  component/editor integration.
- This is less important for basic users but important for advanced dashboard
  consumers.

## Suggested Spec Scope

Create a new spec package:

```text
docs/specs/lean-core-bundle-boundary/
  requirements.md
  design.md
  tasks.md
```

Recommended goals:

1. Add transitive dependency closure measurement and budget gate.
2. Define lean core public boundary.
3. Decide root entry policy: lean root vs compatibility root plus lean `./core`.
4. Remove persistence from core/responsive static closure, preserving current
   persistence behavior through explicit integration.
5. Remove editor/keyboard/commands from core/responsive static closure,
   preserving editor behavior through explicit integration.
6. Keep layout-engine semantics unchanged in the first iteration unless a
   separate subtask proves it can be safely split.
7. Update README, MCP examples/data, demo entry docs, migration notes, and
   package consumer tests.
8. Preserve example visual/behavioral output unless the spec explicitly changes
   examples.

Recommended non-goals:

- Do not redesign the example UI.
- Do not remove CJS in this spec unless a separate breaking-change decision is
  made.
- Do not remove layout-engine from the default component path in the first
  iteration.
- Do not implement new Editor Kit UI, Widget Registry, AI/MCP tools, or new
  dashboard product features.

## Proposed Bundle Budget Targets

Initial budgets should be realistic but force improvement:

- `core` transitive closure: target gzip <= 65 KB.
- `responsive` transitive closure: target gzip <= 80 KB.
- `persistence` transitive closure: target gzip <= 16 KB.
- `layout-engine` transitive closure: target gzip <= 30 KB.
- `history` transitive closure: target gzip <= 8 KB, and must be the only
  public entry that statically imports `pinia`.
- `core` and `responsive` must not transitively include tokens/files related to
  editor, keyboard, commands, persistence, dashboard, dashboard-editor-shell,
  history, Pinia, MCP, Node-only modules, or webpack.

The exact budgets should be finalized after the first gate script lands and
records current baseline.

## Verification Expectations

Future implementation should run at minimum:

- `npm run build`
- `npm run check:package`
- `npm run check:bundle`
- New transitive bundle budget gate
- `npm run test:package`
- `npm run test:browser`
- Relevant unit test runners
- README/MCP/example import consistency check

Additional tests needed:

- Consumer importing `@marsio/vue-grid-layout/core` should not pull editor,
  persistence, dashboard, history, or pinia.
- Consumer importing root should behave according to the chosen root policy.
- Editor-enabled component behavior must still work.
- Persistence-enabled component behavior must still work.
- Responsive grid behavior must still work.
- No-Pinia consumer must still import root/core/responsive/layout-engine/
  persistence successfully.

## Open Decisions For The New Spec

1. Should root `@marsio/vue-grid-layout` become lean, or should root remain
   compatibility-oriented while only `./core` is lean?
2. If root becomes lean, should an explicit `./compat` entry preserve old
   all-in-one behavior for a major-version migration?
3. Should persistence/editor support remain as props on core components via
   optional wrappers, or should advanced wrappers/components own those props?
4. What exact gzip/brotli budgets should be enforced in CI?
5. Should dashboard split pure data/runtime from dashboard Vue component/editor
   integration in this same spec or a later spec?

