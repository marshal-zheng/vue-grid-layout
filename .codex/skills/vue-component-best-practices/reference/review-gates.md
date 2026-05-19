# Review Gates

This file separates non-negotiable rules from optional team heuristics.

Use it during review, refactoring, or when turning the skill into lint rules and code review checklists.

For API-shape judgments such as "should this be a slot?" or "should this become a wrapper?", read this file together with `component-api-patterns.md`.

For file-size, splitting, or extraction judgments, read this file together with `large-component-refactors.md`.

## 1. Non-negotiable rules

These are directly supported by official Vue guidance or well-established ecosystem tooling.

- Props must be explicit.
  Basis: Vue official props guidance and Vue Style Guide.
- Props must not be mutated by child components.
  Basis: Vue official props guidance, Vue Style Guide, and `eslint-plugin-vue` rule `vue/no-mutating-props`.
- Emitted events should be declared explicitly.
  Basis: Vue official component events guidance.
- Prefer props and events over implicit parent-child communication.
  Basis: Vue Style Guide.
- Wrapper and multi-root components must handle fallthrough attributes intentionally.
  Basis: Vue official fallthrough attributes guidance.
- Logic reuse belongs in composables; logic plus layout reuse belongs in components.
  Basis: Vue official composables guidance.
- Performance changes are a later pass, not the starting point.
  Basis: Vue official performance guidance.

## 2. Lint-enforceable checks

These are practical checks because they can be automated or partially automated.

- `vue/no-mutating-props`
  Use to block illegal child-side prop mutation.
- `vue/no-setup-props-reactivity-loss`
  Use to catch setup patterns that accidentally lose prop reactivity.
- `vue/max-lines-per-block`
  Use to keep `template`, `script`, and `style` blocks reviewable.
- `max-lines`
  Use only when the team wants a hard full-file cap across SFCs, composables, and utilities.
- `vue/max-props`
  Use when the team wants a hard cap on public prop count.

Guidance:

- Treat these rules as enforcement tools, not as substitutes for design judgment.
- If a rule fires repeatedly on a component family, the component API likely needs redesign rather than repeated suppression.

## 3. Review questions for API quality

- Can the component contract be explained quickly without reading implementation?
- Is each prop a user-facing capability rather than an implementation toggle?
- Does each emit describe a domain action or committed state change?
- Should any current prop really be a slot?
- Is `$attrs` routed intentionally, or just sprayed into internals?
- Is `defineExpose` minimal and justified?

## 4. Review questions for boundaries and reuse

- Does the component mix orchestration, business logic, and rich presentation?
- Is reusable logic still trapped inside the SFC instead of a composable?
- Is a third-party component API leaking directly into app code?
- Is the same template structure appearing often enough to justify a child component?
- Is the same rule or data transformation appearing often enough to justify a composable or utility?
- Would the proposed split create a real boundary, or just move lines into a thin wrapper?
- Can the root component still be read as the contract and orchestration layer after the refactor?

## 5. Review questions for performance

- Are heavy child props stable?
- Is expensive derivation happening in templates instead of `computed`?
- Is a large list being rendered without virtualization?
- Is a hot list path over-abstracted into too many tiny components?

## 6. House heuristics, not framework law

These are local operating defaults. They are useful review triggers, but they are not official Vue requirements.

- Public props should target `<= 8`; review carefully at `> 12`.
- Boolean variant props should target `<= 2`; redesign at `> 3`.
- Whole `.vue` files should usually stay `<= 300` lines; review at `> 500`; once past `> 700`, do not keep adding substantial logic without extraction.
- More than 2 watchers should trigger a state-model review.
- Three or more independent template sections should trigger a boundary review.
- Repeated business logic or derived formatting in 2 places should trigger extraction.
- Roughly `> 150` script lines or `> 120` template lines should trigger a split review.
- If an extracted child needs a large pass-through prop bag or mirrors most parent events, the split is probably wrong.

Use these numbers to start a design conversation, not to force mechanical decomposition.
