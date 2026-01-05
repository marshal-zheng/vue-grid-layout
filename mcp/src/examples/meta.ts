import type { ExampleScenario, ExampleMeta } from './types.js'

export const EXAMPLE_META: Record<ExampleScenario, ExampleMeta> = {
  basic: { demo: '00-base', sourceFile: '00-base.js', title: 'Basic (example/00-base.js)' },
  responsive: { demo: '02-Response', sourceFile: '02-Response.js', title: 'Advanced (Responsive, example/02-Response.js)' },
  'drag-from-outside': {
    demo: '07-drag-from-outside',
    sourceFile: '07-drag-from-outside.js',
    title: 'Special (Drag from Outside, example/07-drag-from-outside.js)',
  },
}
