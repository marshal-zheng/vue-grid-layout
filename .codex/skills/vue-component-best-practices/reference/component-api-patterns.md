# Component API Patterns

This file turns the researched source signals into concrete component API patterns.

Everything here is intended to be executable during design or review. When a point is a source-backed fact, it is labeled as such. When a point is a synthesis or local operating guidance, it is labeled as guidance.

## 1. Public surface model

Source-backed fact:

- Official Vue guidance separates component communication into `props`, `emits`, slots, `v-model`, and fallthrough attributes.
- Mature Vue component systems often publish component APIs in distinct categories such as attributes, events, slots, and exposes.

Guidance:

- Treat `props`, `emits`, `slots`, `$attrs`, and `defineExpose` as five different public surfaces.
- Do not solve every customization request with props. Pick the correct surface.

## 2. Contract-first API design

Source-backed fact:

- Vue recommends explicit prop declaration and explicit emitted event declaration.
- Vue Style Guide prefers detailed prop definitions and explicit parent-child communication.

Guidance:

- Before coding, sketch the public contract in five buckets:
  - props
  - emits
  - slots
  - attrs destination
  - exposes
- If a component contract needs multiple aliases for the same concern, redesign before implementation.
- If a prop cannot be explained as a user-facing capability, it is a candidate for internal logic, a slot, or a wrapper concern instead.

## 3. Slots before prop explosion

Source-backed fact:

- Official Vue slot guidance makes it clear that slots are for parent-owned rendering, while slot props allow the child to expose controlled data to the parent.
- Mature pass-through and headless component systems show that strong component APIs keep the core API small while still allowing targeted customization.
- Mature Vue component-system docs regularly separate slot-based customization from prop-based configuration.

Guidance:

- Use a prop when the parent wants to control behavior.
- Use a slot when the parent wants to control rendering or layout.
- Prefer named slots with explicit slot props over adding many narrowly scoped visual props.

Common smell:

- `title`, `headerText`, `headerIcon`, `headerClass`, `showHeaderDivider`, `headerExtra` all on one component.

Better direction:

- Keep the semantic prop if needed, but move the rendering surface to `#header`.

## 4. Intentional fallthrough and passthrough

Source-backed fact:

- Vue fallthrough attributes are automatic only in certain cases, and multi-root components require explicit binding.
- `inheritAttrs: false` exists specifically so wrapper components can decide where attrs land.
- Large-team frontend guidance warns against blind `v-bind="$attrs"`.
- Mature pass-through systems demonstrate targeted customization rather than uncontrolled attribute leakage.

Guidance:

- Wrapper or base components must state where `$attrs` go.
- Route `$attrs` to one intentional internal node unless there is a strong reason to split them.
- Do not forward all unknown attrs into deep internals without owning that API surface.

## 5. `v-model` discipline

Source-backed fact:

- Official Vue guidance recommends `defineModel()` in Vue 3.4+.
- Vue supports multiple `v-model` bindings.

Guidance:

- Use `v-model` only when the child genuinely participates in a two-way contract.
- Multiple `v-model`s are acceptable only when they represent separate first-class concerns, not because the component is overloaded.
- If the component edits local draft state before commit, name it as draft state and make the commit path explicit.

## 6. Reuse boundary: composable vs component vs wrapper

Source-backed fact:

- Official Vue guidance recommends composables for reusable logic and components when the reusable asset includes visual layout.
- Large-team frontend guidance recommends moving business logic to separate files.
- App-owned wrapper patterns show the value of keeping vendor primitives behind product-owned public APIs.

Guidance:

- Reuse logic only: extract a composable.
- Reuse logic plus layout: extract a child component.
- Normalize third-party APIs, branding, accessibility defaults, or app conventions: create an app-owned wrapper.

Decision shortcut:

- Same rule, different pages -> composable.
- Same markup and interaction -> component.
- Same vendor primitive, different app expectations -> wrapper.

## 7. Expose the minimum imperative API

Source-backed fact:

- Mature component libraries document exposed imperative handles separately from props, events, and slots.

Guidance:

- Use `defineExpose` only for small imperative hooks such as `focus`, `blur`, `reset`, or `scrollToTop`.
- Never expose child refs, internal state bags, or implementation details just to work around a weak declarative contract.

## 8. Pattern summary

- Props: semantic behavior and stable switches.
- Emits: upward notifications and committed state changes.
- Slots: parent-owned rendering.
- Attrs: native passthrough to a deliberate target.
- Exposes: minimal imperative escape hatch.
- Composable: reusable logic.
- Component: reusable UI contract.
- Wrapper: app-owned facade over vendor complexity.
