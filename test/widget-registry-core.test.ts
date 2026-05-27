import assert from 'node:assert/strict'
import {
  createWidgetRegistry,
  createWidgetRegistryPaletteAdapter,
  createWidgetRegistryWidgetAdapter,
  createWidgetSettingsDefaults,
  materializeWidgetTemplate,
  readWidgetInstanceMetadata,
  validateDashboardWidgetInstances,
  validateWidgetSettings,
  writeWidgetInstanceMetadata,
  type WidgetTypeDefinition
} from '../lib/widget-registry'
import {
  serializeDashboardLayoutDocument,
  type DashboardLayoutDocument
} from '../lib/dashboard'

const fixedDate = new Date('2026-05-27T00:00:00.000Z')

const kpiDefinition = (): WidgetTypeDefinition => ({
  type: 'kpi',
  version: '1.0.0',
  title: 'KPI',
  description: 'Metric card',
  category: 'metrics',
  tags: ['metric', 'summary'],
  layoutDefaults: {
    w: 3,
    h: 2,
    minW: 2,
    minH: 1,
    preserveAspectRatio: true,
    aspectRatio: 1.5,
    resizeHandles: ['se', 'e']
  },
  rendererHint: { rendererKey: 'builtin', componentKey: 'kpi-card' },
  settings: {
    version: '1.0.0',
    fields: [
      { id: 'title', type: 'string', defaultValue: 'Revenue', required: true },
      { id: 'format', type: 'enum', defaultValue: 'compact', options: [{ value: 'compact' }, { value: 'full' }] },
      { id: 'threshold', type: 'number', defaultValue: 10, validation: { min: 0, max: 100 } },
      { id: 'visible', type: 'boolean', defaultValue: true },
      { id: 'query', type: 'ref', defaultValue: { ref: 'metric.revenue' } }
    ]
  },
  templates: [{
    id: 'default',
    title: 'Revenue KPI',
    settings: { title: 'Revenue' },
    bindings: { value: { ref: 'metric.revenue' } },
    payload: { source: 'dogfood' }
  }]
})

const createDocument = (): DashboardLayoutDocument =>
  serializeDashboardLayoutDocument({
    widgets: {
      revenue: { col: 0, row: 0, sizeX: 3, sizeY: 2 },
      table: { col: 3, row: 0, sizeX: 4, sizeY: 3 }
    },
    profiles: {
      mobile: {
        widgets: {
          revenue: { col: 0, row: 0, sizeX: 4, sizeY: 2 }
        }
      }
    }
  }, {
    key: 'widget-registry-doc',
    sourceId: 'widget-registry-test',
    revision: () => 'rev-widget-registry',
    now: () => fixedDate
  })

async function testRegistryCore() {
  const registry = createWidgetRegistry([
    kpiDefinition(),
    { ...kpiDefinition(), type: 'hidden-card', title: 'Hidden', status: 'hidden' },
    { ...kpiDefinition(), type: 'old-kpi', title: 'Old KPI', status: 'deprecated', replacement: 'kpi' }
  ])

  assert.equal(registry.resolve('kpi').ok, true)
  assert.equal(registry.resolve('missing').ok, false)
  assert.equal(registry.resolve('old-kpi').diagnostics[0].code, 'widget-registry.deprecated-type')
  assert.equal(registry.resolve('hidden-card').diagnostics[0].code, 'widget-registry.hidden-type')
  assert.deepEqual(registry.list().map(item => item.type), ['kpi', 'old-kpi'])
  assert.deepEqual(registry.list({ includeHidden: true, searchText: 'hidden' }).map(item => item.type), ['hidden-card'])

  const duplicate = registry.register(kpiDefinition())
  assert.equal(duplicate.ok, false)
  assert.equal(duplicate.diagnostics.some(item => item.code === 'widget-registry.duplicate-type'), true)
  const resolvedAfterDuplicate = registry.resolve('kpi')
  assert.equal(resolvedAfterDuplicate.ok, true)
  if (resolvedAfterDuplicate.ok) assert.equal(resolvedAfterDuplicate.definition.title, 'KPI')

  const tolerantRegistry = createWidgetRegistry([kpiDefinition()], { policy: 'tolerant' })
  const tolerantDuplicate = tolerantRegistry.register({ ...kpiDefinition(), title: 'Should Not Override' })
  assert.equal(tolerantDuplicate.ok, false)
  const tolerantResolved = tolerantRegistry.resolve('kpi')
  assert.equal(tolerantResolved.ok, true)
  if (tolerantResolved.ok) assert.equal(tolerantResolved.definition.title, 'KPI')

  const invalid = createWidgetRegistry([{ ...kpiDefinition(), type: 'bad type', version: 'latest' }])
  assert.equal(invalid.diagnostics().some(item => item.code === 'widget-registry.invalid-type'), true)
  assert.equal(invalid.diagnostics().some(item => item.code === 'widget-registry.invalid-version'), true)
}

async function testSettings() {
  const descriptor = kpiDefinition().settings
  const defaults = createWidgetSettingsDefaults(descriptor, { title: 'Profit' })
  assert.equal(defaults.settings.title, 'Profit')
  assert.equal(defaults.settings.format, 'compact')
  assert.equal(defaults.settings.threshold, 10)

  const valid = validateWidgetSettings(descriptor, {
    title: 'Revenue',
    format: 'full',
    threshold: 20,
    visible: false,
    query: { ref: 'metric.revenue' }
  })
  assert.equal(valid.ok, true)

  const invalid = validateWidgetSettings(descriptor, { title: 'Revenue', format: 'tiny', threshold: 200 })
  assert.equal(invalid.ok, false)
  assert.equal(invalid.diagnostics.some(item => item.fieldId === 'format'), true)
  assert.equal(invalid.diagnostics.some(item => item.fieldId === 'threshold'), true)

  const tolerant = validateWidgetSettings(descriptor, {
    title: 'Revenue',
    format: 'compact',
    constructor: { unsafe: true }
  }, { policy: 'tolerant' })
  assert.equal(tolerant.ok, true)
  assert.equal(Object.prototype.hasOwnProperty.call(tolerant.value, 'constructor'), false)

  const descriptorless = validateWidgetSettings(undefined, {
    title: 'Revenue',
    constructor: { unsafe: true }
  }, { policy: 'tolerant' })
  assert.equal(descriptorless.ok, true)
  assert.equal(descriptorless.value.title, 'Revenue')
  assert.equal(Object.prototype.hasOwnProperty.call(descriptorless.value, 'constructor'), false)
}

async function testTemplateAndDocument() {
  const registry = createWidgetRegistry([kpiDefinition()])
  const materialized = materializeWidgetTemplate(registry, {
    type: 'kpi',
    id: 'revenue',
    existingIds: ['revenue'],
    settings: { title: 'Revenue FY26' }
  })
  assert.equal(materialized.ok, true)
  if (!materialized.ok) return
  assert.equal(materialized.template.id, 'revenue-2')
  assert.equal(materialized.template.w, 3)
  assert.equal(materialized.template.metadata?.widget && typeof materialized.template.metadata.widget, 'object')
  assert.equal(materialized.instance.widgetType, 'kpi')
  assert.equal(materialized.instance.settings?.title, 'Revenue FY26')

  const document = createDocument()
  const written = writeWidgetInstanceMetadata(document.layouts.default.widgets.revenue, materialized.instance)
  assert.equal(written.diagnostics.length, 0)
  document.layouts.default.widgets.revenue = written.item
  assert.equal(readWidgetInstanceMetadata(document.layouts.default.widgets.revenue)?.widgetType, 'kpi')

  const validation = validateDashboardWidgetInstances(document, registry, { requireTypedItems: true })
  assert.equal(validation.ok, true)
  assert.equal(validation.diagnostics.some(item => item.code === 'widget-registry.untyped-layout-item' && item.itemId === 'table'), true)
  assert.equal(
    validation.diagnostics.some(item => item.profileId === 'mobile' && item.code === 'widget-registry.untyped-layout-item'),
    false,
    'profile overrides should not be treated as copied widget instances'
  )

  const removed = writeWidgetInstanceMetadata(document.layouts.default.widgets.revenue, null)
  assert.equal(readWidgetInstanceMetadata(removed.item), null)
}

async function testShellAdapters() {
  const registry = createWidgetRegistry([kpiDefinition()])
  const palette = createWidgetRegistryPaletteAdapter(registry)
  const opened = await palette.open?.({
    actionId: 'palette',
    actionType: 'open-palette',
    source: 'api',
    itemIds: [],
    runtime: null,
    document: null,
    diagnostics: []
  })
  assert.ok(opened && typeof opened === 'object' && 'ok' in opened && opened.ok)
  assert.equal((opened as { metadata?: { items?: Array<{ type: string }> } }).metadata?.items?.[0].type, 'kpi')

  const autoPalette = createWidgetRegistryPaletteAdapter(registry, { autoMaterializeFirst: true })
  const templates = await autoPalette.open?.({
    actionId: 'palette-auto',
    actionType: 'open-palette',
    source: 'api',
    itemIds: [],
    runtime: null,
    document: null,
    diagnostics: []
  })
  assert.equal(Array.isArray(templates), true)

  const materialized = materializeWidgetTemplate(registry, { type: 'kpi', id: 'revenue' })
  assert.equal(materialized.ok, true)
  if (!materialized.ok) return

  const document = createDocument()
  const adapter = createWidgetRegistryWidgetAdapter(registry)
  const prepared = await adapter.prepareAddWidget?.({
    actionId: 'add',
    actionType: 'add-widget',
    source: 'api',
    itemIds: [],
    runtime: null,
    document,
    template: materialized.template,
    diagnostics: []
  })
  assert.ok(prepared && typeof prepared === 'object' && 'kind' in prepared && prepared.kind === 'widget')
  if (!prepared || !('kind' in prepared)) return

  const commit = await adapter.commit?.(prepared, {
    actionId: 'add',
    actionType: 'add-widget',
    source: 'api',
    itemIds: [],
    runtime: null,
    document,
    template: materialized.template,
    diagnostics: [],
    commandResult: {
      id: 'command',
      type: 'add',
      status: 'changed',
      targetIds: [],
      layoutPatches: [],
      metadataPatches: [],
      affectedIds: ['revenue'],
      diagnostics: { durationMs: 0 }
    },
    proposedDocument: document
  })
  assert.equal(commit?.ok, true)
  assert.equal(readWidgetInstanceMetadata(document.layouts.default.widgets.revenue)?.widgetType, 'kpi')
  const mobileRevenue = document.layouts.default.profiles?.mobile.widgets?.revenue
  assert.ok(mobileRevenue)
  assert.equal(readWidgetInstanceMetadata(mobileRevenue), null)

  const copyResult = await adapter.copyWidget?.({
    actionId: 'copy',
    actionType: 'copy-widget',
    source: 'api',
    itemIds: ['revenue'],
    runtime: null,
    document,
    diagnostics: []
  })
  assert.equal(copyResult?.ok, true)

  const pastePrepared = await adapter.preparePasteWidget?.({
    actionId: 'paste',
    actionType: 'paste-widget',
    source: 'api',
    itemIds: [],
    runtime: null,
    document,
    diagnostics: [],
    payload: copyResult
  })
  assert.ok(pastePrepared && typeof pastePrepared === 'object' && 'kind' in pastePrepared && pastePrepared.kind === 'widget')
  if (!pastePrepared || !('kind' in pastePrepared)) return

  document.layouts.default.widgets['revenue-copy'] = { col: 3, row: 2, sizeX: 3, sizeY: 2 }
  const pasteCommit = await adapter.commit?.(pastePrepared, {
    actionId: 'paste',
    actionType: 'paste-widget',
    source: 'api',
    itemIds: [],
    runtime: null,
    document,
    diagnostics: [],
    commandResult: {
      id: 'paste-command',
      type: 'paste',
      status: 'changed',
      targetIds: [],
      layoutPatches: [],
      metadataPatches: [],
      affectedIds: ['revenue-copy'],
      diagnostics: { durationMs: 0 }
    },
    proposedDocument: document
  })
  assert.equal(pasteCommit?.ok, true)
  assert.equal(readWidgetInstanceMetadata(document.layouts.default.widgets['revenue-copy'])?.widgetType, 'kpi')
}

async function main() {
  await testRegistryCore()
  await testSettings()
  await testTemplateAndDocument()
  await testShellAdapters()
  console.log('widget-registry-core tests passed')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
