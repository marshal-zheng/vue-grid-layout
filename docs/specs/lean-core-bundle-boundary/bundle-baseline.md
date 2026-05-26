# Lean Core Bundle Boundary Baseline

Captured from `npm run check:bundle -- --analyze` on 2026-05-22 before lean boundary tasks are applied.

| Entry | Files | Raw | Gzip | Brotli | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| `index.mjs` | 12 | 472108 | 115993 | 93838 | Closure currently pulls responsive, commands, keyboard, persistence and layout-engine chunks. |
| `core.mjs` | 11 | 460808 | 112871 | 91612 | Closure currently pulls commands, keyboard, persistence and layout-engine chunks. |
| `responsive.mjs` | 11 | 466561 | 114084 | 92438 | Closure currently pulls commands, keyboard, persistence, core grid and layout-engine chunks. |
| `persistence.mjs` | 3 | 49328 | 13061 | 11409 | Closure is persistence chunk plus shared utils. |
| `layout-engine.mjs` | 5 | 89732 | 23767 | 20117 | Closure is layout-engine entry plus core/executor/migration/shared utils chunks. |
| `history.mjs` | 2 | 19099 | 6075 | 5296 | Closure is history entry plus shared utils. |

The initial checker also reports broad forbidden-token hits for `dashboard` in `WidthProvider-B6N7DOuL.mjs`; later budget tightening should refine forbidden policy while preserving concrete entry/file/token reporting.
