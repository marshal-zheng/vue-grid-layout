import type { VueGridLayoutProp } from '../props.generated.js'

export type ComponentName = 'VueGridLayout' | 'ResponsiveVueGridLayout' | 'WidthProvider'

export type PropSource = {
  prop: VueGridLayoutProp
  availableOn: ComponentName
  declaredOn: ComponentName
  forwardedViaAttrs: boolean
}
