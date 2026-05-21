import {
  dashboardEditorShell,
  getEventGridPosition,
  useDashboardEditorShell,
  type DashboardEditorShellActionResult,
  type DashboardEditorShellDocumentChangeEvent,
  type DashboardEditorShellKeyboardOptions,
  type DashboardEditorShellMenuDescriptor,
  type DashboardEditorShellOptions,
  type DashboardEditorShellPlacementStrategy,
  type DashboardEditorShellReferenceAdapter,
  type DashboardEditorShellWidgetAdapter
} from '@marsio/vue-grid-layout'
import type { GridEditorPlacementSummary, LayoutItem } from '@marsio/vue-grid-layout'

const widgetAdapter: DashboardEditorShellWidgetAdapter = {
  prepareAddWidget: ctx => ({
    id: ctx.actionId,
    kind: 'widget',
    newIds: ['typed-widget']
  }),
  commit: () => ({ ok: true })
}

const referenceAdapter: DashboardEditorShellReferenceAdapter = {
  canPasteReference: () => ({ available: true }),
  preparePasteReference: () => ({
    id: 'typed-reference',
    kind: 'reference',
    newIds: ['typed-reference-widget']
  })
}

const descriptor: DashboardEditorShellMenuDescriptor = {
  id: 'typed-action',
  labelKey: 'typed.action',
  enabled: true,
  action: () => ({
    ok: true,
    status: 'success',
    actionId: 'typed',
    actionType: 'highlight',
    source: 'api',
    itemIds: [],
    affectedIds: [],
    diagnostics: []
  })
}

const keyboardOptions: DashboardEditorShellKeyboardOptions = {
  placementOptions: () => ({ collisionPolicy: 'layout', compactType: 'vertical' }),
  shortcuts: [
    {
      key: 'Enter',
      ctrl: true,
      action: 'place-clipboard',
      placementOptions: { strategy: 'cursor', placementIntent: 'here', placementMode: 'interactive' }
    }
  ]
}

const options: DashboardEditorShellOptions = {
  document: null,
  runtime: null,
  editor: null,
  gridElement: null,
  widgetAdapter,
  referenceAdapter,
  keyboard: keyboardOptions,
  menu: {
    customDashboardItems: [descriptor],
    defaultAddStrategy: 'first-fit',
    defaultReferencePasteStrategy: 'insert-top-shift'
  },
  onDocumentChange: (event: DashboardEditorShellDocumentChangeEvent) => {
    const persist: false = event.persist
    void persist
  }
}

const shell = useDashboardEditorShell(options)
const addStrategy: DashboardEditorShellPlacementStrategy = 'insert-top-shift'
const result: Promise<DashboardEditorShellActionResult> = shell.actions.addWidgetFromTemplate({ w: 2, h: 2 } as Partial<LayoutItem>, null, { strategy: addStrategy })
const paletteResult = shell.actions.openWidgetPalette(null, { strategy: 'first-fit', autoAddReturnedTemplate: false })
const placeResult = shell.actions.placeClipboard(null, { placementMode: 'interactive' })
const commitPlacementResult = shell.actions.commitPlacement({ source: 'keyboard', autoCancelOnBlocked: true })
const cutResult = shell.actions.cutWidget('typed-widget', { source: 'keyboard', skipConfirm: true })
const dropResult = shell.actions.handleExternalDrop({ template: { w: 1, h: 1 } }, {} as DragEvent, { strategy: 'first-fit' })
const placementSummary: GridEditorPlacementSummary | undefined = undefined
const position = getEventGridPosition({ runtime: null, gridElement: null, fallback: { x: 0, y: 0 } })

void result
void paletteResult
void placeResult
void commitPlacementResult
void cutResult
void dropResult
void placementSummary
void position
void dashboardEditorShell.useDashboardEditorShell
