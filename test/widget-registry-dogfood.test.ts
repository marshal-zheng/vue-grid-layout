import assert from 'node:assert/strict'
import {
  createWidgetRegistry,
  materializeWidgetTemplate,
  validateDashboardWidgetInstances,
  writeWidgetInstanceMetadata,
  type WidgetTypeDefinition
} from '../lib/widget-registry'
import { serializeDashboardLayoutDocument, type DashboardJsonObject } from '../lib/dashboard'

const typeDefinition = (
  type: string,
  title: string,
  layout: { w: number; h: number },
  settings: DashboardJsonObject = {}
): WidgetTypeDefinition => ({
  type,
  version: '1.0.0',
  title,
  category: type.includes('chart') ? 'charts' : 'content',
  tags: [type],
  layoutDefaults: layout,
  rendererHint: { rendererKey: 'dogfood', componentKey: type },
  settings: {
    fields: [
      { id: 'title', type: 'string', defaultValue: title, required: true },
      { id: 'settings', type: 'object', defaultValue: settings }
    ]
  }
})

async function main() {
  const definitions: WidgetTypeDefinition[] = [
    typeDefinition('kpi', 'KPI', { w: 3, h: 2 }, { format: 'compact' }),
    typeDefinition('line-chart', 'Line chart', { w: 6, h: 3 }, { legend: true }),
    typeDefinition('table', 'Table', { w: 6, h: 4 }, { pageSize: 10 }),
    typeDefinition('markdown', 'Markdown', { w: 4, h: 3 }, { markdown: '# Notes' }),
    typeDefinition('image-video', 'Image / video', { w: 4, h: 3 }, { fit: 'cover' }),
    typeDefinition('map-iframe', 'Map / iframe', { w: 5, h: 4 }, { url: 'about:blank' })
  ]
  const registry = createWidgetRegistry([
    ...definitions,
    { ...typeDefinition('invalid-widget', 'Invalid widget', { w: 2, h: 2 }), version: 'invalid' }
  ], { policy: 'tolerant' })

  const templates = definitions.map(definition => materializeWidgetTemplate(registry, {
    type: definition.type,
    id: definition.type
  }))
  assert.equal(templates.every(result => result.ok), true)

  const document = serializeDashboardLayoutDocument({
    widgets: Object.fromEntries(templates.map((result, index) => {
      assert.equal(result.ok, true)
      if (!result.ok) throw new Error('unexpected template failure')
      return [result.template.id, {
        col: (index % 2) * 6,
        row: Math.floor(index / 2) * 4,
        sizeX: result.template.w || 2,
        sizeY: result.template.h || 2
      }]
    }))
  }, {
    key: 'widget-registry-dogfood',
    sourceId: 'widget-registry-dogfood',
    revision: () => 'rev-dogfood',
    now: () => new Date('2026-05-27T00:00:00.000Z')
  })

  templates.forEach(result => {
    assert.equal(result.ok, true)
    if (!result.ok) return
    const id = String(result.template.id)
    const written = writeWidgetInstanceMetadata(document.layouts.default.widgets[id], result.instance, { policy: 'tolerant' })
    document.layouts.default.widgets[id] = written.item
  })

  const validation = validateDashboardWidgetInstances(document, registry, { policy: 'tolerant' })
  assert.equal(validation.ok, true)
  assert.equal(validation.diagnostics.some(item => item.code === 'widget-registry.unknown-type'), false)
  assert.equal(registry.diagnostics().some(item => item.code === 'widget-registry.invalid-version'), true)
  assert.equal(registry.list({ searchText: 'chart' }).map(item => item.type).includes('line-chart'), true)
  console.log('widget-registry-dogfood tests passed')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
