# Vue Grid Layout Performance, UX, and Persistence Context

Created: 2026-05-09
Project: `/Users/hqz/dev/vue-grid-layout`

## User Goal

The current priority is to optimize the component library around three areas:

- Performance, especially layout algorithm performance under large dashboards.
- Desktop user experience for drag, resize, drop, edit, save, undo, and feedback flows.
- Persistence, especially solving the current problem where refreshing the page loses all layout data.

Mobile is explicitly out of scope for the current round.

The desired bar is "world-class", meaning the design should be closer to mature dashboard/editor products and leading layout libraries, not just a localStorage patch or demo-level interaction.

## Current Implementation Snapshot

Main files reviewed:

- `lib/VueGridLayout.tsx`: top-level grid component, drag/resize/drop orchestration, layout syncing, rAF frame updates, auto-scroll, history syncing.
- `lib/GridItem.tsx`: item-level drag/resize wrapper, pixel/grid coordinate conversion, CSS transform style generation.
- `lib/utils.ts`: layout engine functions such as collision detection, compaction, move cascade, fit search, child/layout synchronization.
- `lib/calculateUtils.ts`: pixel/grid coordinate calculations.
- `lib/ResponsiveVueGridLayout.tsx`: breakpoint layout generation and responsive state.
- `lib/WidthProvider.tsx`: ResizeObserver width measurement.
- `lib/history.ts`: Pinia-powered undo/redo store.
- `css/styles.css`: item positioning, placeholder, resize handle, dragging/resizing visual states.
- `perf/bench.js`: current micro-benchmark for compact and move.

Relevant existing strengths:

- Uses CSS transform positioning by default, which is the right baseline for drag performance.
- Has rAF-based frame scheduling for large layout drag/resize updates.
- Adds `compactInPlace()` for hot paths to avoid excess allocation.
- Adds a row-based collision index for compaction.
- Has `dropStrategy: "cursor" | "auto"` and `findNearestFit()` / `findFirstFit()` helpers.
- Has auto-scroll near container edges.
- Has Pinia-based history with undo/redo and max history size.
- Uses `markRaw()` in some hot state paths to reduce Vue reactivity overhead.

Verification performed during review:

- `yarn build`: passed. Warning only: `babel-plugin-lodash` uses deprecated Babel `isModuleDeclaration`.
- `yarn lint`: passed.
- `npx tsc --noEmit`: passed.
- `node perf/bench.js`: `n=50 compact=0.19ms move(200)=0.94ms`, `n=200 compact=1.06ms move(200)=0.86ms`, `n=500 compact=1.23ms move(200)=3.19ms`.
- `SIZES=50,200,500,1000 STEPS=500 node perf/bench.js`: `n=1000 compact=3.44ms move(500)=10.99ms`.
- Bundle snapshot after build: `build/web/vue-grid-layout.min.js` about 116 KiB.

## Key Current Risks

High-frequency drag/resize paths still rely heavily on linear scans:

- `onDrag()` calls `moveElement()` and collision checks per interaction tick.
- `getAllCollisions()` and `getFirstCollision()` scan arrays.
- `findNearestFit()` builds candidate positions around each block and checks collisions.
- `findFirstFit()` scans grid positions and checks collisions.

The current performance work improves compaction, but the next big leap should come from a shared spatial index / occupancy model that can accelerate collision, fit, and affected-region updates.

The large layout behavior uses a hard threshold:

- `LARGE_LAYOUT_THRESHOLD = 200`
- Small layouts update synchronously.
- Large layouts use rAF and in-place compaction.

This is pragmatic but should become a configurable scheduler strategy, for example:

- `eager`: update every drag tick.
- `raf`: coalesce to one update per frame.
- `commitOnly`: preview during drag, commit final layout on stop.

Watcher optimization is unfinished:

- `childrenSignature` exists, but the watcher still deep-watches a returned object and still compares `modelValue` with `deepEqual`.
- Some comments in `VueGridLayout.tsx` read like temporary reasoning notes and should be cleaned during implementation.

Persistence is currently history, not full persistence:

- `history.ts` stores full layout snapshots in a Pinia store.
- It does not solve refresh persistence by itself unless the app wires it to durable storage.
- Pinia is currently a peer dependency for the whole package, which may be too heavy if history/persistence becomes optional.

UX is functional but not yet professional editor-grade:

- Resize handle hit area is 24px in CSS; desktop is acceptable, but still tight for precision work.
- No first-class edit/view mode distinction.
- No built-in save/discard dirty state.
- No keyboard move/resize flow.
- Collision feedback exists as visual blocked state, but not as a structured reason or recoverable user message.
- No snap lines, alignment guides, multi-select, copy/paste, lock/visibility, or selection model yet.

## Top Reference Products and Libraries

Use these as reference points for later specs.

- React Grid Layout: https://github.com/react-grid-layout/react-grid-layout
  - Reference for mature API shape, responsive layouts, draggable/resizable grid semantics, transform-based positioning, callbacks, and ecosystem expectations.

- GridStack: https://github.com/gridstack/gridstack.js and https://gridstackjs.com/doc/html/classes/GridStack.html
  - Reference for productized grid behavior: save/load, batch updates, wrappers, responsive/mobile support, nested grids, and dashboard-oriented API design.

- Muuri: https://docs.muuri.dev/grid-options.html
  - Reference for animated grid layout, drag sorting, layout options, and smoother item motion.

- dnd-kit: https://dndkit.com/
  - Reference for sensor/modifier architecture, accessible drag-and-drop concepts, and separation between drag infrastructure and UI rendering.

- interact.js: https://interactjs.io/docs/
  - Reference for low-level drag/resize primitives, modifiers, snapping, restrict behavior, inertia, and auto-scroll-style interaction infrastructure.

- Grafana dashboard model: https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/
  - Reference for dashboard persistence, JSON model thinking, versionable dashboard state, and inspectable data model.

- Metabase dashboards: https://www.metabase.com/docs/latest/dashboards/introduction
  - Reference for user-facing dashboard editing, cards, filters, sharing, and saved dashboard workflows.

## Recommended Spec Split

Do not put everything into one large spec. The recommended split is three main specs plus one shared quality section.

### Spec 1: Persistence and Data Model

Recommended to write first because refresh data loss is the most direct product gap.

Core goals:

- Refreshing the page must not lose layout data.
- Persistence should be adapter-based, not hardcoded to localStorage.
- The persisted format should be versioned and migratable.
- Undo/redo, autosave, local persistence, remote persistence, and future collaboration should share the same data model.

World-class direction:

- `layoutSchemaVersion`
- `serializeLayout()`
- `deserializeLayout()`
- `migrateLayout()`
- `localStorageAdapter`
- `indexedDBAdapter`
- `remoteAdapter` interface
- custom adapter support
- dirty state
- autosave with debounce
- save/discard flow
- corrupted data fallback
- multi-tab conflict handling

Possible API sketch:

```ts
persistence: {
  key: "dashboard:main",
  adapter: localStorageAdapter(),
  version: 2,
  autoSave: true,
  debounceMs: 300,
  migrate: {
    1: oldValue => migrateV1ToV2(oldValue)
  },
  onError: error => reportPersistenceError(error)
}
```

Patch/event model sketch:

```ts
type LayoutPatch =
  | { type: "move"; id: string; from: { x: number; y: number }; to: { x: number; y: number } }
  | { type: "resize"; id: string; from: { w: number; h: number }; to: { w: number; h: number } }
  | { type: "add"; item: LayoutItem }
  | { type: "remove"; id: string }
  | { type: "restore"; layout: Layout };
```

Important design choice:

- Do not tie persistence to Pinia.
- Pinia history can remain as an optional integration or separate entry.
- Base persistence should work with plain Vue refs and custom stores.

### Spec 2: Performance and Layout Engine

Core goals:

- Large dashboards should remain smooth during drag, resize, and external drop.
- Layout algorithms should be testable as pure functions.
- Performance should be measurable and guarded by benchmarks.

World-class direction:

- Extract a pure layout engine from Vue components.
- Introduce a spatial index / occupancy map shared by collision detection, fit search, compaction, and affected-region calculation.
- Prefer incremental updates over full-layout recomputation on each move.
- Split preview state from committed layout state.
- Replace hardcoded threshold with scheduler strategy.
- Make heavy behavior opt-in or configurable.

Possible architecture:

```ts
createLayoutEngine({
  cols,
  maxRows,
  compactType,
  collisionStrategy,
  compactionStrategy
})
```

Possible scheduler API:

```ts
interactionScheduler: {
  mode: "raf",
  commitOnStop: true,
  maxPreviewItems: 1000
}
```

Important benchmark cases:

- 100 items, 500 items, 1000 items, 2000 items.
- Dense layouts.
- Sparse layouts.
- Static items mixed with movable items.
- `preventCollision`.
- `allowOverlap`.
- Drag across many rows.
- Resize from east/south and north/west handles.
- External drop auto-fit.

Important quality targets to define in spec:

- Per-frame layout calculation budget.
- Drag latency budget.
- Stop/commit budget.
- Max dropped frames during scripted traces.
- Memory allocation budget during drag.

### Spec 3: Desktop Editing UX

Core goals:

- The grid should feel like a professional dashboard editor, not a raw demo widget.
- Desktop is the focus; mobile is out of scope for this round.
- UX should be built on top of the persistence and performance model, not bolted on separately.

World-class direction:

- Explicit view mode and edit mode.
- Dirty state with save/discard/reset.
- Professional placeholder and insertion feedback.
- Collision blocked state with reason.
- Snap lines / alignment guides.
- Optional keyboard move and resize.
- Selection model, possibly single-select first, multi-select later.
- Copy/paste, duplicate, lock, and delete can be considered, but should not block the first version.
- Undo/redo should be visible through callbacks and examples.

Possible UX states:

- viewing
- editingClean
- editingDirty
- draggingPreview
- resizingPreview
- savePending
- saveFailed
- restoring

Possible events:

```ts
onInteractionStart
onPreviewLayoutChange
onInteractionCommit
onInteractionCancel
onDirtyChange
onSaveStart
onSaveSuccess
onSaveError
onCollisionBlocked
```

Important examples:

- Professional dashboard editor with edit/view toggle.
- Autosave and dirty-state dashboard.
- Large layout performance dashboard.
- Backend persistence adapter dashboard.
- External widget toolbox with drop preview.

## Cross-Cutting Quality Baseline

This should be included either as a shared section in all specs or as a small fourth quality spec.

The purpose is to make "world-class" verifiable.

### Performance Quality Gates

- Add benchmark commands to CI or at least documented release checks.
- Track compact, move, fit, drop, and commit timings.
- Add scripted interaction traces.
- Use deterministic generated layouts for regression comparisons.

### Persistence Reliability Gates

- Refresh restores layout.
- Autosave debounce works.
- Save failure does not destroy local state.
- Corrupted persisted payload falls back safely.
- Schema migration is tested.
- Multiple tabs are handled with a clear policy.

Multi-tab policy options:

- newer-wins
- dirty warning
- merge with patch log
- manual conflict callback

### Determinism and Replay

The same initial layout and same sequence of operations should produce the same final layout.

Possible trace format:

```ts
[
  { type: "dragStart", id: "chart-1" },
  { type: "dragMove", id: "chart-1", x: 4, y: 2 },
  { type: "dragStop", id: "chart-1" },
  { type: "persist" }
]
```

This enables:

- Performance replay.
- Bug reproduction.
- Snapshot tests.
- Compatibility tests across engine changes.

### Observability

Add hooks so consumers can understand what happened.

Useful hooks:

```ts
onPerformanceMeasure
onLayoutPatch
onPersistenceError
onMigration
onSchedulerFrame
onCollisionBlocked
```

Useful debug output:

- Number of affected items.
- Collision checks per frame.
- Compact duration.
- Persistence duration.
- Last save time.
- Dirty state.

### Compatibility and Migration

- New behavior should be opt-in where possible.
- Existing props and callbacks should keep working.
- New history/persistence APIs should avoid forcing Pinia on all users.
- Document migration from current `historyStore` to the new persistence model.

## Suggested Implementation Order

1. Persistence and data model.
   - Fastest product value because it solves refresh data loss.
   - Also establishes schema, patches, and save/restore semantics for later UX.

2. Performance and layout engine.
   - Extract engine, add spatial index, define scheduler, and make benchmark gates.
   - This creates the foundation for advanced UX without lag.

3. Desktop editing UX.
   - Build edit/view, dirty state, preview, feedback, and examples on the stable engine and persistence model.

## Non-Goals for Current Round

- Mobile/touch-specific UX.
- Full collaborative editing.
- Complete dashboard app shell.
- Replacing all drag infrastructure immediately.
- Rewriting everything from scratch before isolating measurable bottlenecks.

## Notes for Future Spec Generation

When generating specs, keep them narrowly scoped and measurable.

Each spec should include:

- User-facing problem.
- Current limitation.
- Proposed API.
- Internal architecture.
- Backward compatibility.
- Failure modes.
- Tests.
- Benchmarks or UX acceptance criteria.
- Examples/docs that must ship.

The highest-leverage phrase for this project is:

> Separate layout calculation, interaction preview, committed state, and persistence.

If those four layers stay clean, the project can evolve from a Vue grid component into a professional dashboard layout engine.
