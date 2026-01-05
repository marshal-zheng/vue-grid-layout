import type { VueGridLayoutProp } from '../props.generated.js'
import { VUE_GRID_LAYOUT_PROPS, RESPONSIVE_VUE_GRID_LAYOUT_PROPS, WIDTH_PROVIDER_PROPS } from '../props.generated.js'
import {
  VUE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  RESPONSIVE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  WIDTH_PROVIDER_PROP_DESCRIPTIONS,
} from '../propDescriptions.js'
import { toKebabCase, kebabToCamel, normalizeQuery } from '../utils/index.js'
import type { ComponentName, PropSource } from './types.js'

export const PROPS_BY_COMPONENT = {
  VueGridLayout: VUE_GRID_LAYOUT_PROPS,
  ResponsiveVueGridLayout: RESPONSIVE_VUE_GRID_LAYOUT_PROPS,
  WidthProvider: WIDTH_PROVIDER_PROPS,
} as const satisfies Record<ComponentName, VueGridLayoutProp[]>

export const PROP_DESCRIPTIONS_BY_COMPONENT: Record<ComponentName, Record<string, string>> = {
  VueGridLayout: VUE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  ResponsiveVueGridLayout: RESPONSIVE_GRID_LAYOUT_PROP_DESCRIPTIONS,
  WidthProvider: WIDTH_PROVIDER_PROP_DESCRIPTIONS,
}

export function enrichPropSource(source: PropSource): Record<string, unknown> {
  const { prop, availableOn, declaredOn, forwardedViaAttrs } = source
  const description = PROP_DESCRIPTIONS_BY_COMPONENT[declaredOn]?.[prop.name] ?? ''
  const payload: Record<string, unknown> = {
    ...prop,
    component: availableOn,
    kebabName: toKebabCase(prop.name),
    description,
  }
  if (forwardedViaAttrs) {
    payload.declaredOn = declaredOn
    payload.forwardedViaAttrs = true
  }
  return payload
}

export function getPropSourcesForComponent(component: ComponentName): PropSource[] {
  const declared = PROPS_BY_COMPONENT[component].map((prop) => ({
    prop,
    availableOn: component,
    declaredOn: component,
    forwardedViaAttrs: false,
  }))

  if (component !== 'ResponsiveVueGridLayout') return declared

  const declaredNames = new Set(PROPS_BY_COMPONENT.ResponsiveVueGridLayout.map((p) => p.name))
  const forwarded = PROPS_BY_COMPONENT.VueGridLayout
    .filter((p) => !declaredNames.has(p.name))
    .map((prop) => ({
      prop,
      availableOn: 'ResponsiveVueGridLayout' as const,
      declaredOn: 'VueGridLayout' as const,
      forwardedViaAttrs: true,
    }))

  return [...declared, ...forwarded]
}

export function collectPropSources(component?: ComponentName): PropSource[] {
  if (component) return getPropSourcesForComponent(component)
  return [
    ...getPropSourcesForComponent('VueGridLayout'),
    ...getPropSourcesForComponent('ResponsiveVueGridLayout'),
    ...getPropSourcesForComponent('WidthProvider'),
  ]
}

export function findPropsByName(
  nameQuery: string,
  component?: ComponentName
): { normalized: string; matches: PropSource[] } {
  const raw = normalizeQuery(nameQuery)
  const normalized = raw.includes('-') ? kebabToCamel(raw) : raw
  const all = collectPropSources(component)

  const exact = all.filter((s) => s.prop.name === normalized)
  if (exact.length > 0) return { normalized, matches: exact }

  const q = normalized.toLowerCase()
  const qKebab = toKebabCase(normalized)

  const fuzzy = all.filter((s) => {
    const name = s.prop.name
    if (name.toLowerCase().includes(q)) return true
    if (toKebabCase(name).includes(qKebab)) return true
    const desc = (PROP_DESCRIPTIONS_BY_COMPONENT[s.declaredOn]?.[name] ?? '').toLowerCase()
    return desc.includes(q) || desc.includes(qKebab)
  })

  return { normalized, matches: fuzzy.slice(0, 20) }
}
