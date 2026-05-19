---
name: vue-component-best-practices
description: Use when designing, implementing, reviewing, or refactoring reusable Vue 3 components, especially large or overloaded SFCs, where API clarity, maintainability, and long-term extensibility matter.
---

# Vue Component Best Practices

## Overview

This skill turns official Vue guidance plus proven enterprise and component-library patterns into an execution standard for reusable Vue 3 components.

Optimize for:

- explicit public contracts
- clear ownership of state and rendering
- extension without prop explosion
- reuse at the right layer
- component boundaries that stay reviewable and context-efficient
- performance work only after correctness

If the task also involves broader Vue architecture, routing, or reactivity decisions outside component encapsulation, pair this skill with the repo's Vue architecture guidance.

## When to Use

- Building shared UI or business-generic components.
- Wrapping third-party UI library components behind an app-owned API.
- Refactoring prop-heavy, watcher-heavy, or hard-to-review `.vue` components.
- Breaking up large or mixed-responsibility Vue components before they become hard to review or too context-heavy.
- Defining review standards for component APIs and maintainability.

## When Not to Use

- Route-level architecture or global state design as the primary task.
- Throwaway demos where long-term API quality does not matter.
- Purely visual one-off pages with no reuse expectation.

## Loading Strategy

1. Read this file fully before changing a reusable component.
2. Load `reference/component-api-patterns.md` when designing or refactoring `props`, `emits`, `slots`, `$attrs`, wrappers, or `v-model`.
3. Load `reference/large-component-refactors.md` when a component is already large, mixes rendering with business logic or side effects, or needs extraction guidance.
4. When reviewing an existing component, load `reference/review-gates.md` with the reference file that matches the smell.
5. Load `reference/review-gates.md` alone when defining lint rules or turning the skill into a review checklist.
6. Load `reference/source-basis.md` when you need provenance, need to defend a review comment, or need to distinguish framework rules from team defaults.

## World-Class Standard

1. One concern, one owner, one source of truth.
2. Every public surface is intentional: `props`, `emits`, `slots`, `$attrs`, `defineExpose`.
3. Prefer the narrowest extension mechanism that keeps the API stable.
4. Reuse logic with composables, reuse logic plus layout with components, normalize third-party APIs with wrappers.
5. Optimize only after behavior is correct and the hot path is clear.
6. Keep the root component focused on contract and orchestration; extract logic and stable sub-surfaces before the file becomes a god object.

## Workflow

### 1. Draft the contract before coding

Write a contract sketch before implementation:

```md
Props:
- open: boolean - controlled visibility
- users: UserOption[] - render source

Emits:
- update:open(value: boolean)
- confirm(value: string[])

Slots:
- header
- option({ user, selected })
- footer({ confirm, close, count })

Attrs:
- forwarded to the component root only

Exposes:
- none
```

Rules:

- If the contract cannot be explained in roughly 12 to 15 lines, the component is probably doing too much.
- Ban generic config bags like `options`, `config`, or `meta` unless the object is a real domain model.
- Do not ship alias APIs for the same concern (`visible` plus `open`, `value` plus `modelValue`, `title` prop plus `headerText` prop).
- `defineExpose` is last resort for imperative handles like `focus()`, `reset()`, or `scrollToTop()`, not a substitute for normal state coordination.

### 2. Choose the right extension surface

| Need | Use | Avoid |
| --- | --- | --- |
| Semantic behavior or state | explicit prop, or `defineModel()` / `v-model` for a true two-way contract | catch-all config prop |
| Notify parent about an action | typed `emit` | mutating parent-owned state in child |
| Parent controls rendering or layout | slot with explicit slot props | adding one-off visual props forever |
| Pass native `aria-*`, `data-*`, classes, listeners | intentional `$attrs` routing or library pass-through API | blind `v-bind="$attrs"` on every wrapper |
| Imperative action such as focus/reset | minimal `defineExpose` surface | exposing internals or child refs wholesale |
| App-specific styling or third-party normalization | app-owned wrapper component | leaking vendor API directly into app code |

Decision rule:

- If the parent wants to decide what is rendered, use a slot.
- If the parent wants to decide what happens, use a prop or event.
- If the parent only needs DOM passthrough, route `$attrs` intentionally.
- If customization is project-specific and likely to grow, create a wrapper instead of bloating the shared component API.

### 3. Keep ownership explicit

- Props are read-only. Never mutate them.
- Use `emits` for upward communication, and declare every emitted event.
- On Vue 3.4+, prefer `defineModel()` for a genuine two-way contract. On older codebases, use explicit `modelValue` plus `update:modelValue`.
- Multiple `v-model`s are allowed only when they represent separate first-class concerns, not when the component contract is drifting out of control.
- If local editable state is needed, mirror the prop into a clearly named draft state such as `draftSelection`, resync it intentionally, and emit the committed result explicitly.
- Wrapper and multi-root components must decide where `$attrs` land. Use `inheritAttrs: false` when automatic inheritance is not the correct behavior.

### 4. Reuse at the correct layer

- Extract a composable when reusing logic, state transitions, or side effects.
- Extract a child component when reusing visual structure, interaction surface, or contract shape.
- Split orchestration from presentation when one component mixes data fetching, business rules, and rich rendering.
- Move non-trivial business logic, formatters, and selection rules into separate files so they can be tested and reused without the SFC shell.
- Create a reusable component when the pattern is likely to exist elsewhere. Do not extract one-off markup that has no reuse value.
- For large-file refactors, keep the root SFC as contract plus orchestration and extract one real responsibility at a time; use `reference/large-component-refactors.md`.

### 5. Apply maintainability gates

Source-backed hard rules:

- No prop mutation.
- No undocumented `emits`, slots, or exposes.
- No accidental fallthrough surface.
- No duplicate ownership of the same concern across parent and child.

Operating defaults for reviews and refactors:

- Public props should target `<= 8`; hard review at `> 12`.
- Boolean variation props should target `<= 2`; redesign at `> 3`.
- More than 2 watchers requires design review.
- Repeated business logic or derived formatting in 2 places means extraction.
- Template with 3 or more independent sections means boundary review.
- Whole `.vue` files should usually stay `<= 300` lines; review at `> 500`; once past `> 700`, do not keep adding substantial logic without extraction.
- Roughly `> 150` script lines or `> 120` template lines means split review.
- If an extracted child needs a large pass-through prop bag or mirrors most parent events, the split is probably wrong.

These numbers are team defaults, not Vue laws. Use them as review triggers, not as excuses for cargo-cult splitting.

### 6. Run a performance pass after correctness

- Stabilize props for heavy children and large lists.
- Use `computed` for expensive derivation instead of recomputing in templates.
- Virtualize large lists instead of rendering thousands of DOM nodes.
- Avoid unnecessary component abstraction in hot loops.
- Use `v-once` or `v-memo` only with clear evidence or an obvious static subtree.
- Performance work is not allowed to make the public contract less clear unless measurement proves the tradeoff is worth it.

## Core Pattern

### Contract diff

| Concern | Before | After |
| --- | --- | --- |
| visibility | `visible` plus local mirror | `open` plus `update:open` |
| selection | `modelValue` updated during every toggle | `selectedIds` with explicit draft state and explicit commit |
| customization | `options`, `confirmText`, `cancelText` | named slots with slot props |
| passthrough | blind `$attrs` forwarding | intentional attrs target |
| reuse | selection logic buried in SFC | selection logic moved to `useUserSelection()` |

### Before: overloaded component with blurred ownership

```vue
<script setup lang="ts">
type User = { id: string; name: string }

const props = defineProps<{
  visible: boolean
  modelValue: string[]
  users: User[]
  options?: {
    title?: string
    showSearch?: boolean
    showFooter?: boolean
  }
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits(['update:visible', 'update:modelValue', 'confirm'])

const innerVisible = ref(props.visible)
const keyword = ref('')
const localValue = ref(props.modelValue)

watch(() => props.visible, (value) => {
  innerVisible.value = value
})

watch(() => props.modelValue, (value) => {
  localValue.value = value
})

const filteredUsers = computed(() =>
  props.users.filter((user) => user.name.includes(keyword.value))
)

function toggle(id: string) {
  localValue.value = localValue.value.includes(id)
    ? localValue.value.filter((item) => item !== id)
    : [...localValue.value, id]

  emit('update:modelValue', localValue.value)
}
</script>

<template>
  <div v-if="innerVisible" class="user-picker" v-bind="$attrs">
    <header v-if="options?.title || $slots.header">
      <slot name="header">{{ options?.title ?? 'Select users' }}</slot>
    </header>

    <input v-if="options?.showSearch" v-model="keyword" />

    <ul>
      <li v-for="user in filteredUsers" :key="user.id" @click="toggle(user.id)">
        {{ user.name }}
      </li>
    </ul>

    <footer v-if="options?.showFooter">
      <button @click="emit('update:visible', false)">{{ cancelText ?? 'Cancel' }}</button>
      <button @click="emit('confirm', localValue)">{{ confirmText ?? 'Confirm' }}</button>
    </footer>
  </div>
</template>
```

Why it is weak:

- `options` hides the contract and invites API creep.
- State ownership is blurred by mirrored `visible` and `modelValue`.
- `$attrs` is forwarded blindly.
- Footer customization is trapped behind text props instead of a slot contract.
- Logic reuse is still inside the SFC even though selection behavior is reusable.

### After: same feature, cleaner contract

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })

type UserId = string

interface UserOption {
  id: UserId
  name: string
}

const props = withDefaults(defineProps<{
  open: boolean
  selectedIds: UserId[]
  users: UserOption[]
  searchable?: boolean
}>(), {
  searchable: true,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:selectedIds', value: UserId[]): void
  (e: 'confirm', value: UserId[]): void
}>()

const attrs = useAttrs()
const { keyword, filteredUsers, draftIds, reset, toggle } = useUserSelection(
  () => props.users,
  () => props.selectedIds,
)

watch(() => props.selectedIds, reset, { deep: true })

function close() {
  emit('update:open', false)
}

function confirm() {
  emit('update:selectedIds', [...draftIds.value])
  emit('confirm', [...draftIds.value])
  close()
}
</script>

<template>
  <section v-if="open" class="user-picker" v-bind="attrs">
    <header>
      <slot name="header">Select users</slot>
    </header>

    <input v-if="searchable" v-model="keyword" />

    <ul>
      <li
        v-for="user in filteredUsers"
        :key="user.id"
        @click="toggle(user.id)"
      >
        <slot
          name="option"
          :user="user"
          :selected="draftIds.includes(user.id)"
        >
          {{ user.name }}
        </slot>
      </li>
    </ul>

    <footer>
      <slot name="footer" :confirm="confirm" :close="close" :count="draftIds.length">
        <button type="button" @click="close">Cancel</button>
        <button type="button" @click="confirm">
          Confirm {{ draftIds.length }}
        </button>
      </slot>
    </footer>
  </section>
</template>
```

```ts
export function useUserSelection(
  getUsers: () => UserOption[],
  getSelectedIds: () => string[],
) {
  const keyword = ref('')
  const draftIds = ref([...getSelectedIds()])
  const filteredUsers = computed(() =>
    getUsers().filter((user) => user.name.includes(keyword.value))
  )

  const reset = () => {
    draftIds.value = [...getSelectedIds()]
  }

  const toggle = (id: string) => {
    draftIds.value = draftIds.value.includes(id)
      ? draftIds.value.filter((item) => item !== id)
      : [...draftIds.value, id]
  }

  return { keyword, filteredUsers, draftIds, reset, toggle }
}
```

Why it is stronger:

- The public API is explicit: props, emits, slots, attrs destination.
- Visual customization moved to slots instead of extra props.
- Reusable selection logic moved into a composable.
- Draft state is named as draft state, so ownership is clear.
- The contract is corrected before introducing extra component boundaries.

## Quick Reference

- `prop`: semantic inputs and stable behavior switches.
- `emit`: notify the parent about actions or committed state changes.
- `slot`: parent-owned rendering and layout control.
- `$attrs`: passthrough for native attributes and listeners, only to an intentional target.
- `defineExpose`: minimal imperative handles.
- `composable`: reusable logic without visual layout.
- `child component`: reusable layout plus interaction contract.
- `wrapper component`: app-owned facade over vendor or design-system components.

## Common Mistakes

- Shipping a mega component with many booleans and a generic config prop.
  Fix: split responsibilities and choose slot or wrapper patterns before adding more props.
- Mirroring props into local refs without a true draft-editing reason.
  Fix: keep a single owner for the concern, or name the local state `draftX` and define commit rules.
- Using slots too late, after the prop API is already bloated.
  Fix: move parent-owned rendering to named slots with typed slot props.
- Forwarding all `$attrs` blindly.
  Fix: set `inheritAttrs: false` and bind attrs to the specific internal node that should receive them.
- Reusing renderless wrappers for pure logic.
  Fix: use a composable when the shared asset is logic, not layout.
- Leaking third-party component APIs directly into product code.
  Fix: wrap the vendor component and publish an app-owned API surface.
- Replacing a mega component with a mega composable.
  Fix: split by layer again: pure utilities, stateful composables, and child components should each own one kind of concern.
- Splitting files only to satisfy a line target.
  Fix: split on responsibility boundaries, and keep the root component as the place where the public contract is easiest to read.

## References

- `reference/component-api-patterns.md` - source-backed component API patterns and extension-surface choices
- `reference/large-component-refactors.md` - large-file triggers, extraction targets, and AI-safe refactor workflow
- `reference/review-gates.md` - hard rules, lint-enforceable checks, and clearly labeled house heuristics
- `reference/source-basis.md` - source map, provenance, and “what is fact vs inference” notes
