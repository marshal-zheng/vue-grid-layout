import assert from 'assert'
import { nextTick, ref } from 'vue'
import type { Layout } from '../lib/utils'
import type { GridEditorMetaById, GridEditorSectionRowState } from '../lib/editor'
import {
  DASHBOARD_SCHEMA_VERSION,
  deserializeDashboardLayoutDocument,
  exportThingsBoardDashboardLayout,
  importThingsBoardDashboardLayout,
  migrateDashboardLayoutDocument,
  projectDashboardLayoutDocument,
  serializeDashboardLayoutDocument,
  validateDashboardLayoutDocument,
  writeDashboardRuntimeToDocument,
  type DashboardLayoutDefinition,
  type DashboardLayoutDocument
} from '../lib/dashboard'
import {
  createDashboardDocumentFromResponsiveLayouts,
  resolveDashboardResponsiveProfile,
  useDashboardResponsiveProfileModel,
  writeDashboardResponsiveRuntimeToDocument
} from '../lib/dashboard-responsive'
import {
  migrateDashboardLayoutSettings,
  repairDashboardLayoutCollisions,
  translateDashboardLayout
} from '../lib/dashboard-migration'

const fixedDate = new Date('2026-05-19T00:00:00.000Z')

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const baseDefinition = (): DashboardLayoutDefinition => ({
  widgets: {
    pressure: {
      col: 1,
      row: 0,
      sizeX: 3,
      sizeY: 2,
      desktopHide: true,
      extensions: { sensor: 'pressure' }
    },
    temperature: {
      col: 0,
      row: 1,
      sizeX: 4,
      sizeY: 3,
      minSizeX: 2,
      maxSizeY: 6,
      resizable: false,
      mobileHeight: 8,
      mobileOrder: 1,
      preserveAspectRatio: true,
      extensions: { sensor: 'temperature' }
    }
  },
  gridSettings: {
    columns: 24,
    minColumns: 6,
    margin: [8, 10],
    outerMargin: true,
    viewFormat: 'grid',
    rowHeight: 80,
    autoFillHeight: false,
    heightMode: 'auto',
    minRowHeight: 24,
    renderPrecision: 'integer',
    layoutDimension: {
      type: 'percentage',
      leftWidthPercentage: 65
    },
    extensions: { backgroundToken: 'main' }
  },
  profiles: {
    mobile: {
      widgets: {
        temperature: {
          col: 0,
          row: 0,
          sizeX: 2,
          sizeY: 5,
          mobileHide: true,
          mobileOrder: 0
        },
        deferred: {
          mobileOrder: 9
        }
      },
      gridSettings: {
        viewFormat: 'list',
        mobileRowHeight: 64,
        mobileHeightMode: 'scroll',
        mobileAutoFillHeight: true,
        renderPrecision: 'subpixel'
      }
    },
    tablet: {
      widgets: {
        pressure: {
          col: 4,
          row: 0
        }
      }
    }
  },
  editor: {
    version: 1,
    editorMetaById: {
      temperature: { label: 'Temperature', data: { unit: 'C' } },
      pressure: { visible: true },
      orphan: { locked: true }
    },
    sectionRows: {
      version: 1,
      items: {
        operations: {
          id: 'operations',
          kind: 'section',
          order: 1,
          itemIds: ['temperature', 'pressure', 'orphan']
        },
        rowA: {
          id: 'rowA',
          kind: 'row',
          order: 2,
          itemIds: ['temperature']
        }
      },
      itemMembership: {
        temperature: { sectionId: 'operations', rowId: 'rowA' },
        pressure: { sectionId: 'operations' },
        orphan: { sectionId: 'operations' }
      }
    },
    extensions: {
      editorEnvelopeSafeField: 'preserved'
    }
  },
  extensions: {
    owner: 'dashboard-core-test'
  },
  unknownDocumentSafeField: {
    preserved: true
  }
})

const createDocument = (): DashboardLayoutDocument =>
  serializeDashboardLayoutDocument(baseDefinition(), {
    key: 'dashboard:test',
    sourceId: 'source-1',
    revision: () => 'rev-1',
    now: () => fixedDate,
    meta: { owner: 'tests' }
  })

function testSerializeDeserializeValidateAndSanitize() {
  const doc = createDocument()
  assert.equal(doc.dashboardSchemaVersion, DASHBOARD_SCHEMA_VERSION)
  assert.equal(doc.kind, 'dashboard-layout')
  assert.equal(doc.primaryLayoutId, 'default')
  assert.equal(doc.savedAt, fixedDate.toISOString())
  assert.equal(doc.layouts.default.extensions?.owner, 'dashboard-core-test')
  assert.equal(doc.layouts.default.widgets.temperature.extensions?.sensor, 'temperature')
  assert.equal(doc.layouts.default.editor?.editorMetaById?.orphan, undefined)
  assert.equal(doc.layouts.default.editor?.sectionRows?.version, 1)
  assert.equal(doc.layouts.default.editor?.sectionRows?.itemMembership?.orphan, undefined)
  assert.deepEqual(doc.layouts.default.editor?.sectionRows?.items.operations.itemIds, ['temperature', 'pressure'])
  assert.equal(doc.layouts.default.editor?.extensions?.editorEnvelopeSafeField, 'preserved')

  const restored = deserializeDashboardLayoutDocument(JSON.stringify(doc))
  assert.equal(restored.ok, true)
  assert.deepEqual(restored.ok && restored.document, doc)

  assert.throws(() => serializeDashboardLayoutDocument({
    widgets: {
      bad: { col: 0, row: 0, sizeX: 1, sizeY: 1, extensions: { fn: (() => true) as unknown as never } }
    }
  }, {
    key: 'dashboard:bad'
  }))

  const invalidStrict = deserializeDashboardLayoutDocument({
    ...doc,
    layouts: {
      default: {
        ...doc.layouts.default,
        widgets: {
          ...doc.layouts.default.widgets,
          temperature: {
            ...doc.layouts.default.widgets.temperature,
            col: -1
          }
        }
      }
    }
  })
  assert.equal(invalidStrict.ok, false)
  assert.equal(!invalidStrict.ok && invalidStrict.error.path, 'layouts.default.widgets.temperature.col')
  const invalidPayload = (!invalidStrict.ok ? invalidStrict.originalPayload : doc) as DashboardLayoutDocument
  assert.equal(invalidPayload.layouts.default.widgets.temperature.col, -1)
  assert.equal(!invalidStrict.ok && (invalidStrict.error.originalPayload as DashboardLayoutDocument).layouts.default.widgets.temperature.col, -1)
  const invalidProjection = projectDashboardLayoutDocument(invalidPayload)
  assert.equal(invalidProjection.ok, false)
  assert.equal(!invalidProjection.ok && (invalidProjection.originalPayload as DashboardLayoutDocument).layouts.default.widgets.temperature.col, -1)

  const sanitized = deserializeDashboardLayoutDocument({
    ...doc,
    layouts: {
      default: {
        ...doc.layouts.default,
        widgets: {
          temperature: {
            ...doc.layouts.default.widgets.temperature,
            col: -3,
            sizeX: 0,
            resizeHandles: ['se', 'bad']
          }
        },
        editor: {
          version: 1,
          editorMetaById: {
            temperature: { resizable: false },
            orphan: { locked: true }
          }
        }
      }
    }
  }, {
    validation: 'sanitize'
  })
  assert.equal(sanitized.ok, true)
  assert.equal(sanitized.ok && sanitized.document.layouts.default.widgets.temperature.col, 0)
  assert.equal(sanitized.ok && sanitized.document.layouts.default.widgets.temperature.sizeX, 1)
  assert.deepEqual(sanitized.ok && sanitized.document.layouts.default.widgets.temperature.resizeHandles, ['se'])
  assert.equal(sanitized.ok && sanitized.document.layouts.default.editor?.editorMetaById?.orphan, undefined)
  assert.ok(sanitized.warnings.some(warning => warning.code === 'invalid-item-geometry'))
}

function testMigrations() {
  const v0 = {
    ...createDocument(),
    dashboardSchemaVersion: 0,
    revision: 'rev-0'
  }
  const migrated = deserializeDashboardLayoutDocument(v0, {
    migrations: {
      0: document => ({
        ...(document as Record<string, unknown>),
        dashboardSchemaVersion: 1,
        revision: 'rev-migrated'
      })
    }
  })
  assert.equal(migrated.ok, true)
  assert.equal(migrated.ok && migrated.document.revision, 'rev-migrated')
  assert.deepEqual(migrated.migrations, [{ fromVersion: 0, toVersion: 1 }])

  assert.equal(migrateDashboardLayoutDocument(v0).ok, false)
  assert.equal(migrateDashboardLayoutDocument(v0, { migrations: { 0: () => { throw new Error('boom') } } }).ok, false)
  assert.equal(migrateDashboardLayoutDocument(v0, { migrations: { 0: () => ({ dashboardSchemaVersion: 0 }) } }).ok, false)
  const failedValidation = migrateDashboardLayoutDocument(v0, {
    migrations: {
      0: document => ({
        ...(document as Record<string, unknown>),
        dashboardSchemaVersion: 1,
        layouts: {}
      })
    }
  })
  assert.equal(failedValidation.ok, false)
  assert.equal(!failedValidation.ok && failedValidation.error.code, 'migration-failed')
}

function testProjection() {
  const doc = createDocument()
  const projection = projectDashboardLayoutDocument(doc)
  assert.equal(projection.ok, true)
  assert.equal(projection.ok && projection.projection.layoutId, 'default')
  assert.equal(projection.ok && projection.projection.profileId, null)
  assert.deepEqual(projection.ok && projection.projection.layout.map(item => item.i), ['pressure', 'temperature'])
  const temperature = projection.ok && projection.projection.layout.find(item => item.i === 'temperature')
  assert.equal(temperature && temperature.x, 0)
  assert.equal(temperature && temperature.y, 1)
  assert.equal(temperature && temperature.w, 4)
  assert.equal(temperature && temperature.h, 3)
  assert.equal(temperature && temperature.isResizable, false)
  assert.equal((temperature as Record<string, unknown>)?.mobileOrder, undefined)
  assert.equal(projection.ok && projection.projection.editorMetaById.temperature.resizable, false)
  assert.equal(projection.ok && projection.projection.editorMetaById.pressure.visible, false)
  assert.equal(projection.ok && projection.projection.gridSettings.columns, 24)
  assert.equal(projection.ok && projection.projection.gridSettings.heightMode, 'auto')
  assert.equal(projection.ok && projection.projection.gridSettings.minRowHeight, 24)
  assert.equal(projection.ok && projection.projection.gridSettings.renderPrecision, 'integer')
  assert.equal(projection.ok && projection.projection.capabilitiesById?.temperature.resizable, false)
  assert.equal(projection.ok && projection.projection.capabilitiesById?.temperature.aspectRatio?.enabled, true)
  assert.equal(projection.ok && projection.projection.resizeConstraintsById?.temperature.enabled, true)
  assert.ok(projection.ok && projection.projection.diagnostics.some(item => item.code === 'unsupported-field'))
  assert.ok(projection.ok && projection.projection.diagnostics.some(item => item.code === 'item-capability.sidecar-projected'))

  const mobile = projectDashboardLayoutDocument(doc, { profileId: 'mobile', targetView: 'mobile' })
  assert.equal(mobile.ok, true)
  assert.equal(mobile.ok && mobile.projection.profileId, 'mobile')
  const mobileTemperature = mobile.ok && mobile.projection.layout.find(item => item.i === 'temperature')
  assert.equal(mobileTemperature && mobileTemperature.y, 0)
  assert.equal(mobileTemperature && mobileTemperature.h, 5)
  assert.equal(mobile.ok && mobile.projection.editorMetaById.temperature.visible, false)
  assert.equal(mobile.ok && mobile.projection.gridSettings.viewFormat, 'list')
  assert.equal(mobile.ok && mobile.projection.gridSettings.mobileHeightMode, 'scroll')
  assert.equal(mobile.ok && mobile.projection.gridSettings.renderPrecision, 'subpixel')
  assert.equal(mobile.ok && mobile.projection.capabilitiesById?.temperature.static, false)
  assert.equal(mobile.ok && mobile.projection.resizeConstraintsById?.temperature.enabled, true)
  assert.ok(mobile.ok && mobile.projection.diagnostics.some(item => item.code === 'unknown-item' && item.itemId === 'deferred'))
  assert.ok(mobile.ok && mobile.projection.diagnostics.some(item =>
    item.code === 'item-capability.profile-inherited' &&
    item.itemId === 'temperature' &&
    item.path === 'layouts.default.widgets.temperature.resizable' &&
    (item.details as { field?: string, mode?: string }).field === 'resizable' &&
    (item.details as { field?: string, mode?: string }).mode === 'inherited'
  ))

  const sourceDiagnosticDoc = createDocument()
  sourceDiagnosticDoc.layouts.default.profiles!.mobile.widgets!.pressure = {
    resizable: false,
    resizeHandles: ['se']
  }
  const sourceDiagnosticProjection = projectDashboardLayoutDocument(sourceDiagnosticDoc, { profileId: 'mobile', targetView: 'mobile' })
  assert.equal(sourceDiagnosticProjection.ok, true)
  assert.ok(sourceDiagnosticProjection.ok && sourceDiagnosticProjection.projection.diagnostics.some(item =>
    item.code === 'item-capability.profile-overridden' &&
    item.itemId === 'pressure' &&
    item.path === 'layouts.default.profiles.mobile.widgets.pressure.resizable' &&
    (item.details as { field?: string, mode?: string }).field === 'resizable' &&
    (item.details as { field?: string, mode?: string }).mode === 'overridden'
  ))

  const fallback = projectDashboardLayoutDocument(doc, { profileId: 'missing' })
  assert.equal(fallback.ok, true)
  assert.equal(fallback.ok && fallback.projection.fallbackApplied, true)
  assert.ok(fallback.ok && fallback.projection.diagnostics.some(item => item.code === 'profile-fallback'))

  const again = projectDashboardLayoutDocument(doc)
  assert.deepEqual(projection.ok && projection.projection.layout, again.ok && again.projection.layout)
}

function testWriteBack() {
  const doc = createDocument()
  const original = cloneJson(doc)
  const runtimeLayout: Layout = [
    { i: 'temperature', x: 6, y: 7, w: 8, h: 9, minW: 3, maxH: 10, isResizable: true },
    { i: 'pressure', x: 1, y: 2, w: 3, h: 4, static: true, isResizable: false, resizeHandles: ['se'] }
  ]
  const runtimeMeta: GridEditorMetaById = {
    temperature: { label: 'Temperature Updated', resizable: true, visible: false, data: { unit: 'F' } },
    pressure: { locked: true }
  }
  const runtimeSectionRows: GridEditorSectionRowState = {
    version: 1,
    items: {
      main: {
        id: 'main',
        kind: 'section',
        order: 1,
        itemIds: ['temperature', 'pressure', 'ghost']
      },
      metrics: {
        id: 'metrics',
        kind: 'row',
        order: 2,
        itemIds: ['temperature']
      }
    },
    itemMembership: {
      temperature: { sectionId: 'main', rowId: 'metrics' },
      pressure: { sectionId: 'main' },
      ghost: { sectionId: 'main' }
    }
  }
  const written = writeDashboardRuntimeToDocument(doc, {
    layout: runtimeLayout,
    editorMetaById: runtimeMeta,
    sectionRows: runtimeSectionRows,
    gridSettings: { columns: 30 }
  }, {
    targetView: 'mobile'
  })
  assert.equal(written.ok, true)
  assert.deepEqual(doc, original)
  assert.equal(written.ok && written.document.layouts.default.widgets.temperature.col, 6)
  assert.equal(written.ok && written.document.layouts.default.widgets.temperature.sizeY, 9)
  assert.equal(written.ok && written.document.layouts.default.widgets.temperature.minSizeX, 3)
  assert.equal(written.ok && written.document.layouts.default.widgets.temperature.maxSizeY, 10)
  assert.equal(written.ok && written.document.layouts.default.widgets.temperature.resizable, true)
  assert.equal(written.ok && written.document.layouts.default.widgets.pressure.static, undefined)
  assert.equal(written.ok && written.document.layouts.default.widgets.pressure.resizable, undefined)
  assert.equal(written.ok && written.document.layouts.default.widgets.pressure.resizeHandles, undefined)
  assert.equal(written.ok && written.document.layouts.default.widgets.temperature.mobileHide, true)
  assert.equal(written.ok && written.document.layouts.default.gridSettings?.columns, 30)
  assert.equal(written.ok && written.document.layouts.default.editor?.editorMetaById?.pressure.locked, true)
  assert.equal(written.ok && written.document.layouts.default.editor?.editorMetaById?.temperature.data?.unit, 'F')
  assert.equal(written.ok && written.document.layouts.default.editor?.version, 2)
  assert.equal(written.ok && written.document.layouts.default.editor?.extensions?.editorEnvelopeSafeField, 'preserved')
  assert.deepEqual(written.ok && written.document.layouts.default.editor?.sectionRows?.items.main.itemIds, ['temperature', 'pressure'])
  assert.deepEqual(written.ok && written.document.layouts.default.editor?.sectionRows?.itemMembership?.temperature, {
    sectionId: 'main',
    rowId: 'metrics'
  })
  assert.equal(written.ok && written.document.layouts.default.editor?.sectionRows?.itemMembership?.ghost, undefined)
  assert.ok(written.ok && written.diagnostics.some(item => item.code === 'grid-editor.sectionRows.orphan-membership'))

  const profileWrite = writeDashboardRuntimeToDocument(doc, {
    layout: [{ i: 'temperature', x: 9, y: 1, w: 2, h: 2 }],
    editorMetaById: {
      temperature: { label: 'Mobile Temperature', visible: false }
    },
    sectionRows: {
      version: 1,
      items: {
        mobileMain: {
          id: 'mobileMain',
          kind: 'section',
          order: 1,
          itemIds: ['temperature']
        }
      },
      itemMembership: {
        temperature: { sectionId: 'mobileMain' }
      }
    }
  }, {
    profileId: 'mobile',
    targetView: 'mobile'
  })
  assert.equal(profileWrite.ok, true)
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.widgets.temperature.col, 0)
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.profiles?.mobile.widgets?.temperature.col, 9)
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.profiles?.mobile.widgets?.temperature.mobileHide, true)
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.profiles?.mobile.editor?.editorMetaById?.temperature.label, 'Mobile Temperature')
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.profiles?.mobile.editor?.version, 2)
  assert.deepEqual(profileWrite.ok && profileWrite.document.layouts.default.profiles?.mobile.editor?.sectionRows?.itemMembership?.temperature, {
    sectionId: 'mobileMain'
  })
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.editor?.editorMetaById?.temperature.label, 'Temperature')
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.editor?.sectionRows?.items.operations.itemIds?.includes('pressure'), true)
  assert.equal(profileWrite.ok && profileWrite.document.layouts.default.profiles?.tablet.widgets?.pressure.col, 4)

  const unknown = writeDashboardRuntimeToDocument(doc, {
    layout: [{ i: 'new-widget', x: 0, y: 0, w: 1, h: 1 }]
  })
  assert.equal(unknown.ok, false)
  assert.equal(!unknown.ok && unknown.error.code, 'unknown-item')

  const created = writeDashboardRuntimeToDocument(doc, {
    layout: [{ i: 'new-widget', x: 0, y: 0, w: 1, h: 1, isResizable: false }]
  }, {
    createMissingItems: true
  })
  assert.equal(created.ok, true)
  assert.equal(created.ok && created.document.layouts.default.widgets['new-widget'].sizeX, 1)
  assert.equal(created.ok && created.document.layouts.default.widgets['new-widget'].resizable, undefined)

  const missingProfile = writeDashboardRuntimeToDocument(doc, {
    layout: [{ i: 'temperature', x: 0, y: 0, w: 1, h: 1 }]
  }, {
    profileId: 'watch'
  })
  assert.equal(missingProfile.ok, false)

  const createdProfile = writeDashboardRuntimeToDocument(doc, {
    layout: [{ i: 'temperature', x: 0, y: 0, w: 1, h: 1 }]
  }, {
    profileId: 'watch',
    createMissingProfile: true
  })
  assert.equal(createdProfile.ok, true)
  assert.equal(createdProfile.ok && createdProfile.document.layouts.default.profiles?.watch.widgets?.temperature.sizeY, 1)

  const removed = writeDashboardRuntimeToDocument(doc, {
    layout: [{ i: 'temperature', x: 0, y: 0, w: 1, h: 1 }]
  }, {
    writeItemIds: ['pressure'],
    removeMissingItems: true
  })
  assert.equal(removed.ok, true)
  assert.equal(removed.ok && removed.document.layouts.default.widgets.pressure, undefined)
  assert.equal(removed.ok && removed.document.layouts.default.editor?.editorMetaById?.pressure, undefined)
  assert.equal(removed.ok && removed.document.layouts.default.editor?.sectionRows?.itemMembership?.pressure, undefined)
  assert.equal(removed.ok && removed.document.layouts.default.editor?.sectionRows?.items.operations.itemIds?.includes('pressure'), false)
}

function testDashboardLayoutSettingsMigration() {
  const doc = createDocument()
  const original = cloneJson(doc)
  const migrated = migrateDashboardLayoutSettings(doc, {
    nextSettings: {
      ...doc.layouts.default.gridSettings,
      columns: 12
    }
  })
  assert.equal(migrated.ok, true)
  assert.deepEqual(doc, original)
  assert.equal(migrated.ok && migrated.document.layouts.default.gridSettings?.columns, 12)
  assert.equal(migrated.ok && migrated.document.layouts.default.widgets.temperature.sizeX, 2)
  assert.equal(migrated.ok && migrated.document.layouts.default.widgets.temperature.mobileOrder, 1)
  assert.equal(migrated.ok && migrated.document.layouts.default.widgets.temperature.extensions?.sensor, 'temperature')
  assert.equal(migrated.ok && migrated.document.layouts.default.profiles?.tablet.widgets?.pressure.col, 4)
  assert.ok(migrated.ok && migrated.operation.diagnostics?.details?.some(detail => detail.code === 'settings-ratio'))
  assert.ok(migrated.diagnostics.some(item => item.code === 'settings-ratio'))

  const visualOnly = migrateDashboardLayoutSettings(doc, {
    nextSettings: { rowHeight: 96 }
  })
  assert.equal(visualOnly.ok, true)
  assert.equal(visualOnly.ok && visualOnly.operation.status, 'noop')
  assert.equal(visualOnly.ok && visualOnly.document.layouts.default.gridSettings?.rowHeight, 96)
  assert.equal(visualOnly.ok && visualOnly.document.layouts.default.gridSettings?.columns, 24)
  assert.equal(visualOnly.ok && visualOnly.document.layouts.default.widgets.temperature.sizeX, 4)

  const profileMigrated = migrateDashboardLayoutSettings(doc, {
    profileId: 'mobile',
    nextSettings: {
      columns: 12,
      viewFormat: 'list',
      mobileRowHeight: 64
    }
  })
  assert.equal(profileMigrated.ok, true)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.gridSettings?.columns, 24)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.widgets.temperature.sizeX, 4)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.profiles?.mobile.gridSettings?.columns, 12)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.profiles?.mobile.widgets?.temperature.sizeX, 2)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.profiles?.mobile.widgets?.temperature.mobileOrder, 0)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.profiles?.mobile.widgets?.pressure.sizeX, 2)
  assert.equal(profileMigrated.ok && profileMigrated.document.layouts.default.profiles?.tablet.widgets?.pressure.col, 4)

  const missingProfile = migrateDashboardLayoutSettings(doc, {
    profileId: 'watch',
    nextSettings: { columns: 6 }
  })
  assert.equal(missingProfile.ok, false)
  assert.deepEqual(missingProfile.document, doc)
  assert.ok(missingProfile.diagnostics.some(item => item.code === 'profile-fallback' && item.level === 'error'))

  const createdProfile = migrateDashboardLayoutSettings(doc, {
    profileId: 'watch',
    createMissingProfile: true,
    nextSettings: { columns: 6 }
  })
  assert.equal(createdProfile.ok, true)
  assert.equal(createdProfile.ok && createdProfile.document.layouts.default.profiles?.watch.gridSettings?.columns, 6)
  assert.ok(createdProfile.ok && Object.keys(createdProfile.document.layouts.default.profiles?.watch.widgets || {}).length > 0)
  assert.equal(createdProfile.ok && createdProfile.document.layouts.default.widgets.temperature.sizeX, 4)

  const multiLayout = cloneJson(doc)
  multiLayout.layouts.secondary = {
    widgets: {
      secondary: {
        col: 6,
        row: 0,
        sizeX: 6,
        sizeY: 1,
        extensions: { sensor: 'secondary' }
      }
    },
    gridSettings: { columns: 12 }
  }
  const secondaryMigrated = migrateDashboardLayoutSettings(multiLayout, {
    layoutId: 'secondary',
    nextSettings: { columns: 6 }
  })
  assert.equal(secondaryMigrated.ok, true)
  assert.equal(secondaryMigrated.ok && secondaryMigrated.document.layouts.secondary.gridSettings?.columns, 6)
  assert.equal(secondaryMigrated.ok && secondaryMigrated.document.layouts.secondary.widgets.secondary.col, 3)
  assert.equal(secondaryMigrated.ok && secondaryMigrated.document.layouts.secondary.widgets.secondary.sizeX, 3)
  assert.equal(secondaryMigrated.ok && secondaryMigrated.document.layouts.default.widgets.temperature.sizeX, 4)

  const failed = migrateDashboardLayoutSettings(doc, {
    nextSettings: { columns: 0 }
  })
  assert.equal(failed.ok, false)
  assert.deepEqual(failed.document, doc)
  assert.ok(failed.operation?.status === 'error')
}

function testDashboardRepairAndTranslateWrappers() {
  const doc = serializeDashboardLayoutDocument({
    widgets: {
      a: { col: 0, row: 0, sizeX: 2, sizeY: 1 },
      b: { col: 0, row: 0, sizeX: 2, sizeY: 1 }
    },
    gridSettings: { columns: 4 }
  }, {
    key: 'dashboard-repair-wrapper',
    now: () => fixedDate,
    revision: () => 'repair-wrapper'
  })
  const repaired = repairDashboardLayoutCollisions(doc)
  assert.equal(repaired.ok, true)
  assert.notEqual(repaired.ok && repaired.document.layouts.default.widgets.b.row, 0)
  assert.equal(repaired.ok && repaired.document.layouts.default.gridSettings?.columns, 4)

  const translated = translateDashboardLayout(repaired.ok ? repaired.document : doc, {
    dx: -10,
    dy: -10
  })
  assert.equal(translated.ok, true)
  assert.equal(translated.ok && translated.document.layouts.default.widgets.a.col, 0)
  assert.equal(translated.ok && translated.document.layouts.default.widgets.a.row, 0)
}

function testThingsBoardImportExport() {
  const imported = importThingsBoardDashboardLayout({
    widgets: {
      a: {
        col: 0,
        row: 0,
        sizeX: 2,
        sizeY: 3,
        desktopHide: true,
        mobileOrder: 1,
        resizable: false,
        config: { title: 'A' },
        entityAlias: 'building'
      }
    },
    gridSettings: {
      columns: 12,
      margin: 6,
      outerMargin: false,
      viewFormat: 'grid',
      rowHeight: 70,
      heightMode: 'fixed',
      minRowHeight: 20,
      renderPrecision: 'subpixel',
      toolbar: { hidden: true }
    },
    breakpoints: {
      sm: {
        widgetLayouts: {
          a: {
            col: 0,
            row: 1,
            sizeX: 1,
            sizeY: 2,
            mobileHeight: 6
          }
        },
        gridSettings: {
          viewFormat: 'list',
          mobileRowHeight: 50,
          mobileHeightMode: 'scroll'
        },
        state: 'compact'
      }
    },
    entityAliases: {
      building: { id: 'building-1' }
    },
    timewindow: {
      realtime: true
    },
    toolbar: {
      hidden: true
    }
  }, {
    key: 'tb',
    sourceId: 'source-tb',
    revision: () => 'rev-tb',
    now: () => fixedDate
  })

  assert.equal(imported.ok, true)
  assert.equal(imported.ok && imported.document.layouts.default.widgets.a.desktopHide, true)
  const widgetBusiness = imported.ok
    ? imported.document.layouts.default.widgets.a.extensions?.thingsBoard as Record<string, Record<string, unknown>>
    : {}
  const gridBusiness = imported.ok
    ? imported.document.layouts.default.gridSettings?.extensions?.thingsBoard as Record<string, Record<string, unknown>>
    : {}
  const layoutBusiness = imported.ok
    ? imported.document.layouts.default.extensions?.thingsBoard as Record<string, Record<string, unknown>>
    : {}
  assert.equal(widgetBusiness.config.title, 'A')
  assert.equal(gridBusiness.toolbar.hidden, true)
  assert.equal(((layoutBusiness.entityAliases as Record<string, Record<string, unknown>>).building).id, 'building-1')
  assert.equal(layoutBusiness.timewindow.realtime, true)
  assert.equal(layoutBusiness.toolbar.hidden, true)
  assert.equal(imported.ok && imported.document.layouts.default.profiles?.sm.widgets?.a.mobileHeight, 6)
  assert.equal(imported.ok && imported.document.layouts.default.gridSettings?.heightMode, 'fixed')
  assert.equal(imported.ok && imported.document.layouts.default.gridSettings?.renderPrecision, 'subpixel')
  assert.equal(imported.ok && imported.document.layouts.default.profiles?.sm.gridSettings?.mobileHeightMode, 'scroll')
  assert.equal(imported.ok && (imported.document.layouts.default.profiles?.sm.extensions?.thingsBoard as Record<string, unknown>).state, 'compact')
  assert.ok(imported.diagnostics.some(item => item.code === 'unsupported-field'))

  const exported = imported.ok && exportThingsBoardDashboardLayout(imported.document)
  assert.equal(exported && exported.ok, true)
  assert.equal(exported && exported.ok && (exported.value.widgets?.a as Record<string, unknown>).col, 0)
  assert.equal(exported && exported.ok && ((exported.value.widgets?.a as Record<string, unknown>).config as Record<string, unknown>).title, 'A')
  assert.equal(exported && exported.ok && ((exported.value.entityAliases as Record<string, Record<string, unknown>>).building.id), 'building-1')
  assert.equal(exported && exported.ok && ((exported.value.timewindow as Record<string, unknown>).realtime), true)
  assert.equal(exported && exported.ok && ((exported.value.breakpoints?.sm as Record<string, unknown>).state), 'compact')
  assert.equal(exported && exported.ok && ((exported.value.breakpoints?.sm as Record<string, unknown>).widgetLayouts as Record<string, Record<string, unknown>>).a.mobileHeight, 6)
  assert.equal(exported && exported.ok && (exported.value.gridSettings as Record<string, unknown>).heightMode, 'fixed')
  assert.equal(exported && exported.ok && ((exported.value.breakpoints?.sm as Record<string, unknown>).gridSettings as Record<string, unknown>).mobileHeightMode, 'scroll')
}

function testResponsiveProfileResolverAndVisibility() {
  const doc = createDocument()
  const breakpoints = { mobile: 0, desktop: 960 }
  const desktop = resolveDashboardResponsiveProfile(doc, {
    width: 1200,
    breakpoints,
    targetView: 'desktop'
  })
  assert.equal(desktop.ok, true)
  assert.equal(desktop.ok && desktop.runtime.requestedBreakpoint, 'desktop')
  assert.equal(desktop.ok && desktop.runtime.resolvedProfileId, null)
  assert.equal(desktop.ok && desktop.runtime.fallbackApplied, true)
  assert.deepEqual(desktop.ok && desktop.runtime.renderItemIds, ['temperature'])
  assert.deepEqual(desktop.ok && desktop.runtime.hiddenItemIds, ['pressure'])
  assert.equal(desktop.ok && desktop.runtime.layout.some(item => item.i === 'pressure'), false)

  const inferredDesktop = resolveDashboardResponsiveProfile(doc, {
    width: 1200,
    breakpoints
  })
  assert.equal(inferredDesktop.ok, true)
  assert.equal(inferredDesktop.ok && inferredDesktop.runtime.requestedBreakpoint, 'desktop')
  assert.equal(inferredDesktop.ok && inferredDesktop.runtime.targetView, 'desktop')
  assert.equal(inferredDesktop.ok && inferredDesktop.runtime.targetViewSource, 'default')

  const widthRuleDesktop = resolveDashboardResponsiveProfile(doc, {
    width: 1200,
    breakpoints,
    targetViewRule: { mobileMaxWidth: 480 }
  })
  assert.equal(widthRuleDesktop.ok, true)
  assert.equal(widthRuleDesktop.ok && widthRuleDesktop.runtime.targetView, 'desktop')

  const mobile = resolveDashboardResponsiveProfile(doc, {
    width: 390,
    breakpoints,
    targetViewRule: { mobileBreakpointIds: ['mobile'] }
  })
  assert.equal(mobile.ok, true)
  assert.equal(mobile.ok && mobile.runtime.requestedBreakpoint, 'mobile')
  assert.equal(mobile.ok && mobile.runtime.resolvedProfileId, 'mobile')
  assert.equal(mobile.ok && mobile.runtime.targetView, 'mobile')
  assert.equal(mobile.ok && mobile.runtime.targetViewSource, 'breakpoint-id')
  assert.equal(mobile.ok && mobile.runtime.viewFormat, 'list')
  assert.equal(mobile.ok && mobile.runtime.heightOptions.heightMode, 'scroll')
  assert.equal(mobile.ok && mobile.runtime.heightOptions.rowHeight, 64)
  assert.equal(mobile.ok && mobile.runtime.heightOptions.minRowHeight, 24)
  assert.equal(mobile.ok && mobile.runtime.heightOptions.renderPrecision, 'subpixel')
  assert.equal(mobile.ok && mobile.runtime.heightRuntime?.requestedHeightMode, 'scroll')
  assert.equal(mobile.ok && mobile.runtime.heightRuntime?.effectiveHeightMode, 'auto')
  assert.equal(mobile.ok && mobile.runtime.heightRuntime?.rowHeight, 64)
  assert.equal(mobile.ok && mobile.runtime.heightRuntime?.renderPrecision, 'subpixel')
  assert.ok(mobile.ok && mobile.runtime.diagnostics.some(item =>
    item.code === 'scroll-container-height-fallback' &&
    item.targetView === 'mobile' &&
    (item.details as { source?: string }).source === 'grid-height-runtime'
  ))
  assert.deepEqual(mobile.ok && mobile.runtime.renderItemIds, ['pressure'])
  assert.deepEqual(mobile.ok && mobile.runtime.hiddenItemIds, ['temperature'])
  assert.equal(mobile.ok && mobile.runtime.capabilitiesById?.temperature.aspectRatio?.enabled, true)
  assert.equal(mobile.ok && mobile.runtime.resizeConstraintsById?.temperature.enabled, true)
  const pressure = mobile.ok && mobile.runtime.layout.find(item => item.i === 'pressure')
  assert.equal(pressure && pressure.x, 0)
  assert.equal(pressure && pressure.w, 24)
  assert.equal(pressure && pressure.h, 2)
  assert.equal((pressure as Record<string, unknown>)?.mobileOrder, undefined)
  assert.ok(mobile.ok && mobile.runtime.diagnostics.some(item => item.code === 'unknown-profile-item' && item.itemId === 'deferred'))
  assert.ok(mobile.ok && mobile.runtime.diagnostics.some(item => item.code === 'list-height-source'))
  assert.ok(mobile.ok && mobile.runtime.diagnostics.some(item => item.code === 'mode-alias-conflict'))

  const autoFillAliasDoc = serializeDashboardLayoutDocument({
    widgets: {
      a: { col: 0, row: 0, sizeX: 1, sizeY: 2 }
    },
    gridSettings: {
      autoFillHeight: true,
      rowHeight: 50
    }
  }, {
    key: 'auto-fill-alias',
    now: () => fixedDate,
    revision: () => 'auto-fill-alias'
  })
  const autoFillAlias = resolveDashboardResponsiveProfile(autoFillAliasDoc, {
    width: 1200,
    breakpoints: { default: 0 },
    breakpoint: 'default'
  })
  assert.equal(autoFillAlias.ok, true)
  assert.equal(autoFillAlias.ok && autoFillAlias.runtime.heightOptions.heightMode, 'fit')
  assert.equal(autoFillAlias.ok && autoFillAlias.runtime.heightRuntime?.requestedHeightMode, 'fit')
  assert.equal(autoFillAlias.ok && autoFillAlias.runtime.heightRuntime?.effectiveHeightMode, 'auto')
  assert.ok(autoFillAlias.ok && autoFillAlias.runtime.diagnostics.some(item =>
    item.code === 'missing-container-height' &&
    (item.details as { source?: string }).source === 'grid-height-runtime'
  ))

  const edit = resolveDashboardResponsiveProfile(doc, {
    width: 390,
    breakpoints,
    targetView: 'mobile',
    mode: 'edit'
  })
  assert.equal(edit.ok, true)
  assert.deepEqual(edit.ok && edit.runtime.renderItemIds, ['temperature', 'pressure'])
  assert.equal(edit.ok && edit.runtime.editorMetaById.temperature.visible, false)
  assert.equal(edit.ok && edit.runtime.layout.some(item => item.i === 'temperature'), true)

  const unknownAllowed = resolveDashboardResponsiveProfile(doc, {
    width: 390,
    breakpoints,
    breakpoint: 'mobile',
    targetView: 'mobile',
    mode: 'edit',
    allowUnknownProfileItems: true
  })
  assert.equal(unknownAllowed.ok, true)
  assert.equal(unknownAllowed.ok && unknownAllowed.runtime.allItemIds.includes('deferred'), true)

  const invalid = resolveDashboardResponsiveProfile({
    ...doc,
    layouts: {}
  }, {
    width: Number.NaN,
    breakpoints: {}
  })
  assert.equal(invalid.ok, false)
  assert.ok(!invalid.ok && invalid.diagnostics.some(item => item.code === 'projection-validation-failed'))

  const invalidProfileDoc = cloneJson(doc)
  invalidProfileDoc.layouts.default.profiles!.mobile.widgets!.temperature.col = -1
  const invalidProfileFallback = resolveDashboardResponsiveProfile(invalidProfileDoc, {
    width: 390,
    breakpoints,
    breakpoint: 'mobile',
    targetView: 'mobile'
  })
  assert.equal(invalidProfileFallback.ok, true)
  assert.equal(invalidProfileFallback.ok && invalidProfileFallback.runtime.resolvedProfileId, null)
  assert.equal(invalidProfileFallback.ok && invalidProfileFallback.runtime.fallbackApplied, true)
  assert.ok(invalidProfileFallback.ok && invalidProfileFallback.runtime.diagnostics.some(item =>
    item.code === 'profile-fallback' &&
    item.profileId === 'mobile' &&
    item.message.includes('invalid')
  ))
}

function testResponsiveProfileWriteBack() {
  const doc = createDocument()
  const runtime = resolveDashboardResponsiveProfile(doc, {
    width: 390,
    breakpoints: { mobile: 0, desktop: 960 },
    breakpoint: 'mobile',
    targetView: 'mobile',
    mode: 'edit'
  })
  assert.equal(runtime.ok, true)
  const original = cloneJson(doc)
  const written = runtime.ok && writeDashboardResponsiveRuntimeToDocument(doc, runtime.runtime, [
    { i: 'temperature', x: 0, y: 0, w: 24, h: 7 },
    { i: 'pressure', x: 0, y: 7, w: 24, h: 2 }
  ], {
    editorMetaById: {
      temperature: { label: 'Mobile Runtime Temperature', visible: false }
    },
    sectionRows: {
      version: 1,
      items: {
        mobileList: {
          id: 'mobileList',
          kind: 'row',
          order: 1,
          itemIds: ['temperature', 'pressure']
        }
      },
      itemMembership: {
        temperature: { rowId: 'mobileList' },
        pressure: { rowId: 'mobileList' }
      }
    }
  })
  assert.equal(written && written.ok, true)
  assert.deepEqual(doc, original)
  assert.equal(written && written.ok && written.document.layouts.default.widgets.temperature.row, 1)
  assert.equal(written && written.ok && written.document.layouts.default.widgets.temperature.sizeY, 3)
  assert.equal(written && written.ok && written.document.layouts.default.profiles?.mobile.widgets?.temperature.mobileOrder, 0)
  assert.equal(written && written.ok && written.document.layouts.default.profiles?.mobile.widgets?.temperature.mobileHeight, 7)
  assert.equal(written && written.ok && written.document.layouts.default.profiles?.mobile.widgets?.temperature.mobileHide, true)
  assert.equal(written && written.ok && written.document.layouts.default.profiles?.mobile.editor?.editorMetaById?.temperature.label, 'Mobile Runtime Temperature')
  assert.deepEqual(written && written.ok && written.document.layouts.default.profiles?.mobile.editor?.sectionRows?.itemMembership?.pressure, {
    rowId: 'mobileList'
  })
  assert.equal(written && written.ok && written.document.layouts.default.profiles?.mobile.widgets?.pressure.mobileOrder, 1)

  const desktopListDoc = serializeDashboardLayoutDocument({
    widgets: {
      a: { col: 0, row: 3, sizeX: 2, sizeY: 2 },
      b: { col: 0, row: 1, sizeX: 2, sizeY: 3 }
    },
    gridSettings: {
      viewFormat: 'list',
      columns: 6
    }
  }, {
    key: 'desktop-list',
    now: () => fixedDate,
    revision: () => 'desktop-list'
  })
  const desktopList = resolveDashboardResponsiveProfile(desktopListDoc, {
    width: 1200,
    breakpoints: { default: 0 },
    breakpoint: 'default',
    targetView: 'desktop',
    mode: 'edit'
  })
  assert.equal(desktopList.ok, true)
  const desktopWritten = desktopList.ok && writeDashboardResponsiveRuntimeToDocument(desktopListDoc, desktopList.runtime, [
    { i: 'a', x: 0, y: 0, w: 6, h: 5 },
    { i: 'b', x: 0, y: 5, w: 6, h: 4 }
  ], {
    editorMetaById: {
      a: { label: 'A', resizable: false }
    },
    sectionRows: {
      version: 1,
      items: {
        desktopList: {
          id: 'desktopList',
          kind: 'row',
          order: 1,
          itemIds: ['a', 'b']
        }
      },
      itemMembership: {
        a: { rowId: 'desktopList' },
        b: { rowId: 'desktopList' }
      }
    }
  })
  assert.equal(desktopWritten && desktopWritten.ok, true)
  assert.equal(desktopWritten && desktopWritten.ok && desktopWritten.document.layouts.default.widgets.a.row, 0)
  assert.equal(desktopWritten && desktopWritten.ok && desktopWritten.document.layouts.default.widgets.a.sizeY, 5)
  assert.equal(desktopWritten && desktopWritten.ok && desktopWritten.document.layouts.default.widgets.a.resizable, false)
  assert.equal(desktopWritten && desktopWritten.ok && desktopWritten.document.layouts.default.editor?.editorMetaById?.a.label, 'A')
  assert.deepEqual(desktopWritten && desktopWritten.ok && desktopWritten.document.layouts.default.editor?.sectionRows?.itemMembership?.b, {
    rowId: 'desktopList'
  })
  assert.equal(desktopWritten && desktopWritten.ok && desktopWritten.document.layouts.default.widgets.a.mobileHeight, undefined)

  const missing = resolveDashboardResponsiveProfile(doc, {
    width: 700,
    breakpoints: { watch: 0 },
    breakpoint: 'watch',
    mode: 'edit'
  })
  assert.equal(missing.ok, true)
  const blocked = missing.ok && writeDashboardResponsiveRuntimeToDocument(doc, missing.runtime, [
    { i: 'temperature', x: 0, y: 0, w: 1, h: 1 }
  ])
  assert.equal(blocked && blocked.ok, false)
  assert.ok(blocked && !blocked.ok && blocked.diagnostics.some(item => item.code === 'missing-profile-write-blocked'))
  const created = missing.ok && writeDashboardResponsiveRuntimeToDocument(doc, missing.runtime, [
    { i: 'temperature', x: 0, y: 0, w: 1, h: 1 }
  ], {
    createMissingProfileOnEdit: true
  })
  assert.equal(created && created.ok, true)
  assert.equal(created && created.ok && created.document.layouts.default.profiles?.watch.widgets?.temperature.sizeY, 1)

  const tablet = resolveDashboardResponsiveProfile(doc, {
    width: 800,
    breakpoints: { tablet: 0 },
    breakpoint: 'tablet',
    mode: 'edit'
  })
  assert.equal(tablet.ok, true)
  const profileScoped = tablet.ok && writeDashboardResponsiveRuntimeToDocument(doc, tablet.runtime, [
    { i: 'temperature', x: 0, y: 1, w: 4, h: 3 },
    { i: 'pressure', x: 5, y: 0, w: 3, h: 2 }
  ], {
    writeItemIds: ['pressure'],
    sectionRows: {
      version: 1,
      items: {
        tabletRow: {
          id: 'tabletRow',
          kind: 'row',
          order: 1,
          itemIds: ['pressure']
        }
      },
      itemMembership: {
        pressure: { rowId: 'tabletRow' }
      }
    }
  })
  assert.equal(profileScoped && profileScoped.ok, true)
  assert.equal(profileScoped && profileScoped.ok && profileScoped.document.layouts.default.profiles?.tablet.widgets?.pressure.col, 5)
  assert.equal(profileScoped && profileScoped.ok && profileScoped.document.layouts.default.profiles?.tablet.widgets?.temperature, undefined)
  assert.deepEqual(profileScoped && profileScoped.ok && profileScoped.document.layouts.default.profiles?.tablet.editor?.sectionRows?.itemMembership?.pressure, {
    rowId: 'tabletRow'
  })
}

function testResponsiveMigrationHelper() {
  const layouts = {
    lg: [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 4, y: 0, w: 4, h: 3 }
    ],
    sm: [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 },
      { i: 'b', x: 0, y: 2, w: 2, h: 3 }
    ]
  }
  const original = cloneJson(layouts)
  const migrated = createDashboardDocumentFromResponsiveLayouts({
    key: 'responsive-migration',
    layouts,
    breakpoints: { lg: 1200, sm: 768 },
    cols: { lg: 12, sm: 4 },
    margin: { lg: [10, 10], sm: [6, 6] },
    containerPadding: [0, 0]
  })
  assert.equal(migrated.ok, true)
  assert.deepEqual(layouts, original)
  assert.equal(migrated.ok && migrated.defaultBreakpoint, 'lg')
  assert.deepEqual(migrated.ok && migrated.profileIds, ['sm'])
  assert.equal(migrated.ok && migrated.document.layouts.default.widgets.a.sizeX, 4)
  assert.equal(migrated.ok && migrated.document.layouts.default.gridSettings?.columns, 12)
  assert.equal(migrated.ok && migrated.document.layouts.default.profiles?.sm.widgets?.b.row, 2)
  assert.equal(migrated.ok && migrated.document.layouts.default.profiles?.sm.gridSettings?.columns, 4)

  const profileOnly = createDashboardDocumentFromResponsiveLayouts({
    key: 'responsive-profile-only',
    layouts: {
      lg: [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }],
      sm: [
        { i: 'a', x: 0, y: 0, w: 2, h: 2 },
        { i: 'profile-only', x: 0, y: 2, w: 2, h: 2 }
      ]
    },
    breakpoints: { lg: 1200, sm: 768 },
    cols: { lg: 12, sm: 4 }
  })
  assert.equal(profileOnly.ok, true)
  assert.ok(profileOnly.diagnostics.some(item =>
    item.code === 'legacy-responsive-deferred' &&
    item.itemId === 'profile-only' &&
    item.details &&
    (item.details as { reason?: string }).reason === 'profile-only-widget'
  ))
}

async function testResponsiveComposableModel() {
  const documentRef = ref(createDocument())
  const widthRef = ref(1200)
  const breakpointRef = ref<string | null>(null)
  const modeRef = ref<'view' | 'edit'>('view')
  const events: string[] = []
  const eventPayloads: unknown[] = []
  const model = useDashboardResponsiveProfileModel({
    document: documentRef,
    width: widthRef,
    breakpoints: { mobile: 0, desktop: 960 },
    breakpoint: breakpointRef,
    targetViewRule: { mobileBreakpointIds: ['mobile'] },
    mode: modeRef,
    editor: {
      defaultMode: 'edit'
    },
    createMissingProfileOnEdit: true,
    onEvent: event => {
      events.push(event.type)
      eventPayloads.push(event)
    }
  })
  assert.equal(model.state.value.requestedBreakpoint, 'desktop')
  assert.equal(model.state.value.renderItemIds.includes('pressure'), false)
  modeRef.value = 'edit'
  widthRef.value = 390
  await nextTick()
  assert.equal(model.state.value.requestedBreakpoint, 'mobile')
  assert.equal(model.state.value.resolvedProfileId, 'mobile')
  assert.ok(events.indexOf('breakpointChange') < events.indexOf('profileChange'))
  assert.ok(events.indexOf('profileChange') < events.indexOf('projectionChange'))
  assert.equal(model.editorController?.editorMetaById.value.temperature.visible, false)

  events.length = 0
  model.onLayoutChange([
    { i: 'pressure', x: 0, y: 0, w: 24, h: 4 },
    { i: 'temperature', x: 0, y: 4, w: 24, h: 6 }
  ])
  assert.ok(events.includes('documentChange'))
  const documentChange = eventPayloads.reverse().find((event): event is { type: 'documentChange'; document: DashboardLayoutDocument } =>
    Boolean(event && typeof event === 'object' && (event as { type?: string }).type === 'documentChange')
  )
  assert.equal(documentChange?.document.layouts.default.profiles?.mobile.widgets?.temperature.mobileHeight, 6)

  const shellEvents: string[] = []
  const shellModel = useDashboardResponsiveProfileModel({
    document: ref(createDocument()),
    width: ref(1200),
    breakpoints: { desktop: 960, mobile: 0 },
    mode: ref<'edit'>('edit'),
    documentWriteBack: 'shell',
    onEvent: event => {
      shellEvents.push(event.type)
    }
  })
  shellEvents.length = 0
  shellModel.onLayoutChange([
    { i: 'pressure', x: 2, y: 0, w: 3, h: 2 },
    { i: 'temperature', x: 0, y: 2, w: 4, h: 3 }
  ])
  assert.equal(shellModel.state.value.layout.find(item => item.i === 'pressure')?.x, 2)
  assert.ok(shellEvents.includes('projectionChange'))
  assert.equal(shellEvents.includes('documentChange'), false)
  shellModel.stop()

  events.length = 0
  model.onHeightRuntimeChange({
    requestedHeightMode: 'fit',
    effectiveHeightMode: 'scroll',
    renderPrecision: 'subpixel',
    rowHeight: 64,
    rowHeightSource: 'mobile-row-height',
    containerHeight: 240,
    containerHeightSource: 'container-height',
    contentHeight: 300,
    bottomRows: 4,
    overflow: 'auto',
    containerStyle: { height: '240px', overflow: 'auto' },
    fallbackApplied: true,
    diagnostics: [{
      code: 'fit-min-row-height-fallback',
      level: 'warning',
      message: 'fit fallback',
      prop: 'minRowHeight'
    }]
  })
  assert.equal(model.state.value.heightRuntime?.effectiveHeightMode, 'scroll')
  assert.ok(model.state.value.diagnostics.some(item =>
    item.code === 'fit-min-row-height-fallback' &&
    (item.details as { source?: string }).source === 'grid-height-runtime'
  ))
  assert.ok(events.includes('projectionChange'))
  assert.ok(events.includes('diagnosticsChange'))

  const beforeStop = model.state.value.requestedBreakpoint
  model.stop()
  widthRef.value = 1200
  await nextTick()
  assert.equal(model.state.value.requestedBreakpoint, beforeStop)
}

function testResponsiveWriteBackHandlesMissingDocument() {
  const resolved = resolveDashboardResponsiveProfile(createDocument(), {
    width: 1200,
    breakpoints: { desktop: 960, mobile: 0 },
    mode: 'edit'
  })
  assert.equal(resolved.ok, true)
  if (!resolved.ok) return

  const result = writeDashboardResponsiveRuntimeToDocument(
    undefined as unknown as DashboardLayoutDocument,
    resolved.runtime,
    resolved.runtime.layout
  )
  if (result.ok) assert.fail('missing document write-back should not succeed')
  assert.equal(result.error.code, 'invalid-document')
  assert.ok(result.diagnostics.some(item => item.code === 'projection-validation-failed'))
}

function testPublicRuntimeNamespace() {
  const dashboardEntry = require('../lib/entries/dashboard')
  const layoutEngineEntry = require('../lib/entries/layout-engine')
  const coreEntry = require('../lib/entries/core')
  assert.equal(dashboardEntry.DASHBOARD_SCHEMA_VERSION, DASHBOARD_SCHEMA_VERSION)
  assert.equal(typeof dashboardEntry.projectDashboardLayoutDocument, 'function')
  assert.equal(typeof dashboardEntry.migrateDashboardLayoutSettings, 'function')
  assert.equal(typeof dashboardEntry.resolveDashboardResponsiveProfile, 'function')
  assert.equal(typeof layoutEngineEntry.migrateLayoutSettings, 'function')
  assert.equal(typeof coreEntry.resolveGridHeightRuntime, 'function')
  assert.equal(typeof dashboardEntry.resolveDashboardHeightOptions, 'function')
  assert.equal(coreEntry.GRID_HEIGHT_DIAGNOSTIC_CODES.missingContainerHeight, 'missing-container-height')
  assert.equal(typeof dashboardEntry.DashboardResponsiveVueGridLayout, 'object')
}

async function main() {
  testSerializeDeserializeValidateAndSanitize()
  testMigrations()
  testProjection()
  testWriteBack()
  testDashboardLayoutSettingsMigration()
  testDashboardRepairAndTranslateWrappers()
  testThingsBoardImportExport()
  testResponsiveProfileResolverAndVisibility()
  testResponsiveProfileWriteBack()
  testResponsiveWriteBackHandlesMissingDocument()
  testResponsiveMigrationHelper()
  await testResponsiveComposableModel()
  testPublicRuntimeNamespace()
}

void main().catch(error => {
  throw error
})
