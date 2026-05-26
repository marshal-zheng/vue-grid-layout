import type {
  DashboardBreakpointProfile,
  DashboardDiagnostic,
  DashboardDocumentWriteBackOwner,
  DashboardGridRuntimeProjection,
  DashboardGridSettings,
  DashboardResponsiveMode,
  DashboardResponsiveProfileEvent,
  DashboardResponsiveProfileResult,
  DashboardResponsiveRuntime,
  DashboardResponsiveWriteResult,
  DashboardHeightOptionOverrides,
  DashboardTargetView,
  DashboardImportResult,
  DashboardItemLayout,
  DashboardLayoutDocument,
  DashboardPersistenceAdapter,
  DashboardProjectionResult,
  DashboardWriteResult,
  ProjectDashboardLayoutOptions,
  ResolvedDashboardGridSettings,
  ResolveDashboardResponsiveProfileOptions,
  ThingsBoardDashboardLayoutLike,
  WriteDashboardResponsiveRuntimeOptions,
  WriteDashboardRuntimeOptions
} from '@marsio/vue-grid-layout/dashboard'
import type { DashboardEditorShellOptions } from '@marsio/vue-grid-layout/dashboard-editor-shell'
import type {
  GridHeightRuntime,
  GridRenderPrecision,
  GridHeightMode,
  ResolveGridHeightRuntimeOptions
} from '@marsio/vue-grid-layout/core'
import type { GridEditorSectionRowState } from '@marsio/vue-grid-layout/editor'
import {
  DashboardResponsiveVueGridLayout,
  DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE,
  DASHBOARD_SCHEMA_VERSION,
  createDashboardDocumentFromResponsiveLayouts,
  createDashboardHeightDiagnostic,
  isDashboardHeightDiagnostic,
  projectDashboardLayoutDocument,
  resolveDashboardHeightOptions,
  resolveDashboardResponsiveProfile,
  serializeDashboardLayoutDocument,
  useDashboardResponsiveProfileModel,
  writeDashboardResponsiveRuntimeToDocument,
  writeDashboardRuntimeToDocument
} from '@marsio/vue-grid-layout/dashboard'
import {
  GRID_HEIGHT_DIAGNOSTIC_CODES,
  resolveGridHeightRuntime
} from '@marsio/vue-grid-layout/core'

const item: DashboardItemLayout = {
  col: 0,
  row: 0,
  sizeX: 1,
  sizeY: 1,
  mobileOrder: 1
}

const settings: DashboardGridSettings = {
  columns: 12,
  margin: [8, 8],
  viewFormat: 'grid',
  heightMode: 'fit',
  mobileHeightMode: 'scroll',
  minRowHeight: 24,
  renderPrecision: 'subpixel'
}

const profile: DashboardBreakpointProfile = {
  widgets: {
    a: { mobileHeight: 6 }
  },
  gridSettings: settings
}

const doc: DashboardLayoutDocument = serializeDashboardLayoutDocument({
  widgets: { a: item },
  profiles: { mobile: profile }
}, {
  key: 'type-smoke'
})

const projectionOptions: ProjectDashboardLayoutOptions = {
  profileId: 'mobile',
  targetView: 'mobile'
}

const projection: DashboardProjectionResult = projectDashboardLayoutDocument(doc, projectionOptions)
const writeOptions: WriteDashboardRuntimeOptions = {
  targetView: 'desktop',
  sectionRows: {
    version: 1,
    items: {},
    itemMembership: {}
  } satisfies GridEditorSectionRowState
}
const write: DashboardWriteResult = writeDashboardRuntimeToDocument(doc, {
  layout: [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]
}, writeOptions)

const adapter: DashboardPersistenceAdapter = {
  load: () => doc,
  save: (_key, _document) => undefined,
  remove: () => undefined
}

const thingsBoard: ThingsBoardDashboardLayoutLike = {
  widgets: {
    a: item
  },
  gridSettings: settings
}

const diagnostic: DashboardDiagnostic = {
  code: 'type-smoke',
  level: 'info',
  message: 'ok',
  targetView: 'desktop'
}

const resolved: ResolvedDashboardGridSettings = {
  ...settings,
  columns: 12,
  minColumns: 1,
  margin: 8,
  outerMargin: true,
  viewFormat: 'grid',
  rowHeight: 150,
  autoFillHeight: false,
  heightMode: 'fit',
  minRowHeight: 24,
  renderPrecision: 'subpixel'
}
const heightMode: GridHeightMode = 'fit'
const precision: GridRenderPrecision = 'subpixel'
const heightOptions: DashboardHeightOptionOverrides = {
  heightMode,
  rowHeight: 150,
  minRowHeight: 24,
  renderPrecision: precision
}
const heightRuntimeOptions: ResolveGridHeightRuntimeOptions = {
  layout: [{ i: 'a', x: 0, y: 0, w: 1, h: 2 }],
  heightMode,
  containerHeight: 300,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: [0, 0],
  renderPrecision: precision
}
const heightRuntime: GridHeightRuntime = resolveGridHeightRuntime(heightRuntimeOptions)
const resolvedHeightOptions: DashboardHeightOptionOverrides = resolveDashboardHeightOptions(resolved, {
  targetView: 'desktop',
  explicit: heightOptions,
  diagnostics: [],
  layoutId: 'default',
  profileId: null
})

const runtimeProjection: DashboardGridRuntimeProjection | null =
  projection.ok ? projection.projection : null
const imported: DashboardImportResult | null = null
const responsiveOptions: ResolveDashboardResponsiveProfileOptions = {
  width: 320,
  breakpoints: { mobile: 0 },
  targetView: 'mobile'
}
const responsiveResult: DashboardResponsiveProfileResult =
  resolveDashboardResponsiveProfile(doc, responsiveOptions)
const responsiveRuntime: DashboardResponsiveRuntime | null =
  responsiveResult.ok ? responsiveResult.runtime : null
const responsiveWriteOptions: WriteDashboardResponsiveRuntimeOptions = {
  createMissingProfileOnEdit: true,
  sectionRows: {
    version: 1,
    items: {},
    itemMembership: {}
  }
}
const responsiveWrite: DashboardResponsiveWriteResult | null =
  responsiveRuntime
    ? writeDashboardResponsiveRuntimeToDocument(doc, responsiveRuntime, responsiveRuntime.layout, responsiveWriteOptions)
    : null
const migratedResponsive = createDashboardDocumentFromResponsiveLayouts({
  key: 'responsive-type-smoke',
  layouts: { lg: [{ i: 'a', x: 0, y: 0, w: 1, h: 1 }] },
  breakpoints: { lg: 1200 },
  cols: { lg: 12 }
})
const targetView: DashboardTargetView = 'desktop'
const responsiveMode: DashboardResponsiveMode = 'view'
const writeBackOwner: DashboardDocumentWriteBackOwner = 'shell'
const responsiveComponentProps = {
  document: doc,
  width: 320,
  breakpoints: { mobile: 0 },
  documentWriteBack: writeBackOwner,
  rowHeight: 0
}
const shellOptions: DashboardEditorShellOptions = {
  document: doc,
  documentWriteBack: writeBackOwner
}
const responsiveEvent: DashboardResponsiveProfileEvent = {
  type: 'projectionChange',
  runtime: responsiveRuntime as DashboardResponsiveRuntime
}
const responsiveModelFactory: typeof useDashboardResponsiveProfileModel = useDashboardResponsiveProfileModel

void DASHBOARD_SCHEMA_VERSION
void GRID_HEIGHT_DIAGNOSTIC_CODES
void DashboardResponsiveVueGridLayout
void DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE
void createDashboardHeightDiagnostic
void isDashboardHeightDiagnostic
void adapter
void thingsBoard
void diagnostic
void resolved
void heightRuntime
void resolvedHeightOptions
void runtimeProjection
void imported
void write
void responsiveResult
void responsiveWrite
void migratedResponsive
void targetView
void responsiveMode
void responsiveComponentProps
void shellOptions
void responsiveEvent
void responsiveModelFactory
