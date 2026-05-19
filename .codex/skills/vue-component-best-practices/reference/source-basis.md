# Source Basis

Validated on 2026-03-12.

This file defines the evidence boundary for this skill. It exists to answer two questions:

- which statements come from authoritative Vue sources
- which statements are local synthesis for design and review

External URLs are intentionally omitted from the shipped skill. The delivered skill should remain local-first and readable without web navigation.

## Evidence tiers

### Tier 1: authoritative framework sources

Use these as ground truth for framework behavior:

- Vue official guides for `props`, `emits`, `v-model`, slots, fallthrough attributes, composables, and performance
- Vue Style Guide essential rules
- `eslint-plugin-vue` official rules when the rule directly enforces an official Vue constraint

These sources define what Vue supports, forbids, or explicitly recommends.

Note:

- Vue's official Style Guide is still useful for enduring Vue-specific conventions, but it is marked by Vue as outdated and should not override newer guide pages when they differ in emphasis or examples.

### Tier 2: implementation signals

Use these only to calibrate engineering judgment:

- large-team frontend engineering guides
- mature Vue component-system documentation
- pass-through, headless, and wrapper-based component patterns seen in production systems

These sources do not define framework law. They show what durable component APIs tend to look like in real systems.

## Facts adopted directly

The skill treats the following as source-backed facts:

- props should be explicit and child components must not mutate them
- emitted events should be declared explicitly
- `defineModel()` is the recommended path on Vue 3.4+
- slots are for parent-owned rendering
- multi-root and wrapper components must handle fallthrough attributes intentionally
- composables are for reusable logic; components are for reusable logic plus layout
- composables can be extracted for code organization when components grow too large to navigate
- performance work should focus on prop stability, large-list rendering, and unnecessary abstraction cost
- unnecessary component abstractions have real runtime cost and should not be introduced casually

## Translation rules used by this skill

The skill adds these synthesized rules on top of the facts above:

- treat `props`, `emits`, `slots`, `$attrs`, and `defineExpose` as separate public surfaces
- prefer slots before expanding visual prop count
- prefer app-owned wrappers when product code should not depend directly on vendor APIs
- keep the root SFC as contract plus orchestration during large-file refactors
- split large files by responsibility, not by raw line count
- split review guidance into:
  - source-backed rules
  - house heuristics

These are informed by Tier 2 signals. They are strong guidance, not claims about Vue core semantics.

## What this file does not claim

- numeric thresholds such as prop count, watcher count, or line count are not official Vue rules
- AI context-size concerns are local operating constraints, not Vue framework guidance
- lint rules are enforcement tools, not proof that a design is good
- repo-specific conventions from other teams are not inherited automatically
- any single component library API is not treated as the standard to copy

## Reading rule

When a statement in this skill conflicts with Tier 1 framework behavior, Tier 1 wins.

When a statement is a heuristic rather than framework law, it should be treated as a review trigger, not a hard semantic rule.
