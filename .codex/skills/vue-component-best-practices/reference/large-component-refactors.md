# Large Component Refactors

Use this file when a Vue component is large enough that review quality, maintenance speed, or AI context quality starts to degrade.

The goal is not the smallest possible files. The goal is clear boundaries, stable contracts, and low coordination cost.

## 1. Core rule

- Split by responsibility, not by arbitrary line count.
- A large component may remain intact only if it still represents one concern, has a small public contract, and stays at one level of abstraction.
- The root SFC should keep the public contract and orchestration.
- Extract logic, stable visual regions, and pure helpers out of the root SFC before it becomes a god object.
- Do not replace one mega component with one mega composable.

## 2. Review triggers

These are house heuristics, not official Vue limits:

- Whole `.vue` file `<= 300` lines is usually healthy.
- Whole `.vue` file `> 500` lines should trigger a split review before adding substantial new logic.
- Whole `.vue` file `> 700` lines should allow only localized fixes unless extraction is part of the change.
- `script` block `> 150` lines or `template` block `> 120` lines should trigger a boundary review.
- Three or more independent visual regions should trigger a component-boundary review.
- More than 2 watchers should trigger a state-model review.
- Repeated business logic, data shaping, or formatting in 2 places should trigger extraction.
- A change that touches `props`, watchers, slots, and multiple render branches together is a sign that the component is overloaded.
- If an extracted child needs more than a small prop surface and mostly mirrors the parent's state or events, the boundary is probably wrong.

Use these numbers to start a design conversation. Do not use them to force mechanical fragmentation.

## 3. Choose the extraction target

| Symptom | Extract to | Keep in root | Notes |
| --- | --- | --- | --- |
| Pure derivation, filtering, sorting, selection math, or formatting | utility or composable | final wiring to template | Prefer a utility if Vue instance state is not needed. |
| Watchers, subscriptions, async lifecycle, DOM listeners, or side effects | composable | top-level coordination and commit path | Follow Vue composable cleanup rules. |
| Repeated or visually self-contained region with its own props, slots, or emits | child component | parent contract and region composition | Extract only if the child has a real surface, not just moved markup. |
| Vendor normalization, app defaults, accessibility defaults, or theming facades | wrapper component | app-owned semantic API | Prevent vendor API leakage into product code. |
| Shared types, column definitions, static maps, or registries | `.ts` module | references to those structures | Do not keep large static structures inside the SFC shell. |
| Hot list item abstraction with no real contract | often keep inline or flatten props | stable props for real children | Avoid abstraction layers that only add component-instance cost. |

## 4. What should stay in the root component

- Public `props`
- Public `emits`
- Public slot surface
- `$attrs` routing decision
- Minimal `defineExpose` surface
- Top-level layout composition
- Coordination between extracted regions
- Cross-boundary state that truly spans multiple concerns

If the root component can no longer be read as the contract and orchestration layer, keep splitting.

## 5. AI-safe refactor workflow

1. Inventory responsibilities before moving code.
   Capture:
   - public contract
   - template regions
   - local state
   - derived state
   - watchers and side effects
   - vendor integration points
2. Freeze the public API unless the API itself is the problem.
   Avoid renaming props, emits, or slots during a structural split unless the contract is being intentionally redesigned.
3. Extract pure logic first.
   Start with formatters, selectors, list transforms, state transitions, and command helpers.
4. Extract one stable visual seam next.
   A child component should own a real surface such as named slots, a small prop contract, or a narrow emit contract.
5. Re-check the dependency shape after each extraction.
   If the new child only receives a large pass-through prop bag, undo the split and choose a different boundary.
6. Keep names semantic and responsibility-based.
   Prefer `useDateRangeDraft`, `UserPickerList`, or `normalizeColumns` over `helper`, `part1`, or `section-a`.
7. Stop when the root reads cleanly as contract plus orchestration.
   Keep going only if another concern is still clearly independent.

## 6. Boundary patterns that usually work

### Pattern A: root plus composable

Use when the component owns the UI contract, but filtering, selection, validation, or side effects are making the `script` block heavy.

- Root keeps props, emits, slots, and top-level actions.
- Composable owns derived state, watchers, and side-effect lifecycle.
- Utilities own pure transforms used by both root and composable.

### Pattern B: root plus child component

Use when one visual region has its own stable interaction surface.

- Root keeps orchestration across regions.
- Child owns one bounded visual contract.
- Slots stay where rendering ownership belongs.

Good examples:

- action toolbar with its own emits
- result list with item slot props
- footer action area with a narrow semantic API

Bad examples:

- `HeaderSection`, `BodySection`, `FooterSection` that only forward parent state and events
- child components that immediately `v-bind="$props"` and re-emit nearly everything

### Pattern C: root plus wrapper

Use when the component is mostly normalizing a third-party primitive.

- Wrapper owns app naming, accessibility defaults, theming hooks, and vendor translation.
- Product code consumes the wrapper's semantic API, not the vendor surface directly.

## 7. Anti-patterns

- Splitting one component into several files that can only be understood together.
- Creating thin visual fragments whose only job is moving lines out of the parent.
- Moving all state and effects into `useThing()` while the parent becomes a thin shell.
- Hiding a weak boundary behind `options`, `config`, `meta`, or other generic bags.
- Using `provide` / `inject` to avoid explicit props and emits inside normal parent-child boundaries.
- Refactoring a large file by changing naming, behavior, and structure in one step.

## 8. Enforcement ideas

- Use `vue/max-lines-per-block` to keep `template`, `script`, and `style` blocks reviewable.
- Use a generic `max-lines` rule only if your team really wants a hard full-file cap.
- Use `vue/max-props` carefully. Prop count is a smell signal, not the whole design review.
- Exempt generated files, schema maps, large static registries, and similarly centralized files from generic size caps.

## 9. Reading rule

- Numeric thresholds in this file are review triggers, not framework law.
- If a large file remains whole, be able to explain why it is still one cohesive abstraction.
- Prefer fewer, clearer boundaries over many shallow files.
