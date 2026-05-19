const { VueGridLayout: VGL, Vue: VueInstance } = window;
const { createApp, computed, onMounted, reactive, ref } = VueInstance;

const { WidthProvider } = VGL;
const VueGridLayout = WidthProvider(VGL);

const cloneLayout = layout => layout.map(item => ({ ...item }));

const defaultLayout = () => [
  { i: "revenue", x: 0, y: 0, w: 3, h: 3 },
  { i: "pipeline", x: 3, y: 0, w: 3, h: 3 },
  { i: "retention", x: 6, y: 0, w: 3, h: 3 },
  { i: "forecast", x: 9, y: 0, w: 3, h: 3 },
  { i: "region", x: 0, y: 3, w: 4, h: 3 },
  { i: "accounts", x: 4, y: 3, w: 4, h: 3 },
  { i: "health", x: 8, y: 3, w: 4, h: 3, static: true }
];

const labels = {
  revenue: "Revenue",
  pipeline: "Pipeline",
  retention: "Retention",
  forecast: "Forecast",
  region: "Region Mix",
  accounts: "Accounts",
  health: "Customer Health"
};

const createLargeLayout = () => Array.from({ length: 520 }, (_item, index) => ({
  i: `m-${index + 1}`,
  x: (index % 12),
  y: Math.floor(index / 12),
  w: 1,
  h: 1
}));

const App = {
  setup() {
    const layout = ref(cloneLayout(defaultLayout()));
    const mode = ref("edit");
    const editorMetaById = ref({
      forecast: { locked: true, label: "Forecast", copyable: true },
      health: { label: "Customer Health" }
    });
    const sectionRows = ref({
      version: 1,
      items: {
        executive: {
          id: "executive",
          kind: "row",
          label: "Executive KPIs",
          order: 1,
          bounds: { x: 0, y: 0, w: 12, h: 3 },
          itemIds: ["revenue", "pipeline", "retention", "forecast"],
          dropPolicy: "inside",
          crossScopePolicy: "block",
          allowedDropZones: ["inside", "between"]
        },
        customer: {
          id: "customer",
          kind: "row",
          label: "Customer Detail",
          order: 2,
          bounds: { x: 0, y: 3, w: 12, h: 3 },
          itemIds: ["region", "accounts", "health"],
          dropPolicy: "inside",
          crossScopePolicy: "block",
          allowedDropZones: ["inside", "between"]
        }
      },
      itemMembership: {
        revenue: { rowId: "executive" },
        pipeline: { rowId: "executive" },
        retention: { rowId: "executive" },
        forecast: { rowId: "executive" },
        region: { rowId: "customer" },
        accounts: { rowId: "customer" },
        health: { rowId: "customer" }
      }
    });
    const failNextSave = ref(false);
    const state = reactive({
      mounted: false,
      lastEvent: "(none)",
      lastResult: "(none)",
      ariaMessage: "",
      conflict: "",
      largeLayout: false,
      debugGuides: false,
      predictiveGuides: true,
      spacingChips: true,
      measurementHud: true,
      sectionSnap: true
    });

    const memory = VGL.memoryPersistenceAdapter();
    const adapter = {
      load: key => memory.load(key),
      save: (key, document) => {
        if (failNextSave.value) {
          failNextSave.value = false;
          throw new Error("Simulated save failure");
        }
        return memory.save(key, document);
      },
      remove: key => memory.remove(key),
      subscribe: (key, callback) => memory.subscribe ? memory.subscribe(key, callback) : () => {}
    };

    const persistence = VGL.useGridLayoutPersistence({
      key: "professional-editor-demo",
      kind: "layout",
      target: layout,
      adapter,
      autoSave: false,
      meta: () => ({
        editor: VGL.editor.createGridEditorPersistenceEnvelope(editorMetaById.value, sectionRows.value)
      }),
      onEvent: event => {
        state.lastEvent = event.type;
      }
    });

    const editor = VGL.createGridEditorController({
      layout,
      mode,
      editorMetaById,
      sectionRows,
      persistence,
      layoutEngineOptions: {
        cols: 12,
        maxRows: Infinity,
        compactType: "vertical",
        allowOverlap: false,
        preventCollision: false,
        diagnostics: { debug: true }
      },
      clipboard: VGL.internalGridEditorClipboard,
      guides: {
        enabled: true,
        snap: true,
        maxItems: 500,
        maxVisibleGuides: { drag: 3, drop: 3, resize: 2 },
        showGrid: "interaction",
        showSpacingLabels: true,
        predictRadiusX: 2,
        predictRadiusY: 1,
        snapThresholdCells: 0.5,
        showSpacingChips: true,
        showMeasurementHud: true,
        highlightAlignmentTargets: true,
        detectEqualSpacing: true,
        sectionSnap: true,
        itemLabels: labels
      },
      keyboard: {
        ariaMessage: message => {
          state.ariaMessage = `${message.level}: ${message.message}`;
        }
      },
      commandPolicy: "skip-blocked",
      beforeCommand: async ({ command, targetIds }) => {
        if (command.type === "delete" && targetIds.includes("forecast")) {
          return {
            status: "block",
            reason: "before-command-blocked",
            message: "Forecast is protected by a demo policy."
          };
        }
        return { status: "allow" };
      },
      onEvent: event => {
        state.lastEvent = event.type;
        if (event.type === "command-blocked" || event.type === "command-error" || event.type === "command-commit") {
          state.lastResult = `${event.result.type}: ${event.result.status}`;
          if (event.result.blocked?.message) state.ariaMessage = event.result.blocked.message;
        }
        if (event.type === "conflict") {
          state.conflict = event.conflict.reason;
        }
      }
    });

    const guideOptions = computed(() => ({
      enabled: true,
      snap: true,
      maxItems: 500,
      maxVisibleGuides: { drag: 3, drop: 3, resize: 2 },
      showGrid: "interaction",
      showSpacingLabels: true,
      predictRadiusX: state.predictiveGuides ? 2 : 0.5,
      predictRadiusY: state.predictiveGuides ? 1 : 0.5,
      snapThresholdCells: 0.5,
      showSpacingChips: state.spacingChips,
      showMeasurementHud: state.measurementHud,
      highlightAlignmentTargets: true,
      detectEqualSpacing: true,
      sectionSnap: state.sectionSnap,
      itemLabels: labels,
      debug: state.debugGuides ? "layer" : false
    }));

    const editorProp = computed(() => ({
      controller: editor,
      commandPolicy: "skip-blocked",
      keyboard: {
        ariaMessage: message => {
          state.ariaMessage = `${message.level}: ${message.message}`;
        }
      },
      guides: guideOptions.value
    }));

    onMounted(() => {
      state.mounted = true;
      void persistence.load();
    });

    const run = command => {
      void editor.execute(command);
    };

    const save = () => {
      void editor.save();
    };

    const failSave = () => {
      failNextSave.value = true;
      save();
    };

    const discard = () => {
      persistence.discard();
      editor.setExternalLayout(layout.value, "discard");
      state.lastResult = "discard: changed";
    };

    const reset = () => {
      layout.value = cloneLayout(defaultLayout());
      editorMetaById.value = {
        forecast: { locked: true, label: "Forecast", copyable: true },
        health: { label: "Customer Health" }
      };
      persistence.reset(layout.value);
      editor.setExternalLayout(layout.value, "reset");
      state.largeLayout = false;
      state.lastResult = "reset: changed";
    };

    const simulateConflict = () => {
      state.conflict = "dirty-external-change";
      state.lastEvent = "conflict";
      state.ariaMessage = "External change detected; local layout is still in memory.";
    };

    const toggleLargeLayout = () => {
      state.largeLayout = !state.largeLayout;
      layout.value = state.largeLayout ? createLargeLayout() : cloneLayout(defaultLayout());
      editor.setExternalLayout(layout.value, "large-layout-toggle");
    };

    const toggleDebugGuides = () => {
      state.debugGuides = !state.debugGuides;
    };

    const togglePredictive = () => {
      state.predictiveGuides = !state.predictiveGuides;
    };
    const toggleChips = () => {
      state.spacingChips = !state.spacingChips;
    };
    const toggleHud = () => {
      state.measurementHud = !state.measurementHud;
    };
    const toggleSectionSnap = () => {
      state.sectionSnap = !state.sectionSnap;
    };

    const selectedSummary = computed(() => editor.selection.value.selectedIds.join(", ") || "(none)");
    const toolbarState = computed(() => editor.getToolbarState());
    const primarySectionRowId = computed(() => toolbarState.value.selectionSummary.sectionRowIds[0] || "executive");
    const commandDisabled = type => !toolbarState.value.commands[type]?.enabled;
    const disabledReason = type => toolbarState.value.commands[type]?.messageKey || "";
    const guideSummary = computed(() => {
      const diagnostics = editor.guides.value.diagnostics;
      if (!diagnostics) return "guides idle";
      const displayCount = editor.guides.value.displayGuides?.length || 0;
      return `${displayCount}/${editor.guides.value.guides.length} shown, ${diagnostics.itemCount} items${diagnostics.degraded ? ", degraded" : ""}, predict ${diagnostics.predictCount || 0}, snapped ${diagnostics.snappedCount || 0}, chips ${diagnostics.spacingChipCount || 0}, anchors ${diagnostics.anchorEdgeCount || 0}`;
    });
    const hudSummary = computed(() => {
      const hud = editor.guides.value.measurementHud;
      if (!hud) return "(idle)";
      const delta = hud.delta && (hud.delta.dw || hud.delta.dh || hud.delta.dx || hud.delta.dy)
        ? ` Δ ${hud.delta.dw ? `${hud.delta.dw}c ` : ''}${hud.delta.dh ? `${hud.delta.dh}r ` : ''}${hud.delta.dx ? `x${hud.delta.dx} ` : ''}${hud.delta.dy ? `y${hud.delta.dy}` : ''}`
        : '';
      return `${hud.label || hud.itemId} ${hud.size.w}×${hud.size.h} @ ${hud.position.x},${hud.position.y}${delta}${hud.blocked ? ` (blocked: ${hud.blocked})` : ''}`;
    });

    return {
      layout,
      labels,
      mode,
      editor,
      editorProp,
      sectionRows,
      guideOptions,
      state,
      persistence,
      selectedSummary,
      toolbarState,
      primarySectionRowId,
      commandDisabled,
      disabledReason,
      guideSummary,
      hudSummary,
      run,
      save,
      failSave,
      discard,
      reset,
      simulateConflict,
      toggleLargeLayout,
      toggleDebugGuides,
      togglePredictive,
      toggleChips,
      toggleHud,
      toggleSectionSnap
    };
  },
  components: {
    VueGridLayout
  },
  template: `
    <div>
      <h1>Professional Dashboard Editor</h1>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin:10px 0;">
        <button @click="mode = mode === 'edit' ? 'view' : 'edit'">{{ mode === 'edit' ? 'View' : 'Edit' }}</button>
        <button @click="run({ type: 'duplicate', source: 'toolbar' })">Duplicate</button>
        <button @click="run({ type: 'delete', source: 'toolbar' })">Delete</button>
        <button @click="run({ type: 'lock', source: 'toolbar' })">Lock</button>
        <button @click="run({ type: 'unlock', source: 'toolbar' })">Unlock</button>
        <button @click="run({ type: 'hide', source: 'toolbar' })">Hide</button>
        <button @click="run({ type: 'show', targetIds: Object.keys(editor.editorMetaById.value), source: 'toolbar' })">Show all</button>
        <button @click="run({ type: 'copy', source: 'toolbar' })">Copy</button>
        <button @click="run({ type: 'paste', source: 'toolbar', payload: { strategy: 'nearest-fit', cols: 12 } })">Paste</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'left', cols: 12 } })">Align L</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'center-x', cols: 12 } })">Align CX</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'right', cols: 12 } })">Align R</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'top', cols: 12 } })">Align T</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'center-y', cols: 12 } })">Align CY</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'bottom', cols: 12 } })">Align B</button>
        <button :disabled="commandDisabled('distribute')" :title="disabledReason('distribute')" @click="run({ type: 'distribute', source: 'toolbar', payload: { mode: 'horizontal', strategy: 'edge-to-edge', cols: 12 } })">Distribute H</button>
        <button :disabled="commandDisabled('distribute')" :title="disabledReason('distribute')" @click="run({ type: 'distribute', source: 'toolbar', payload: { mode: 'vertical', strategy: 'edge-to-edge', cols: 12 } })">Distribute V</button>
        <button :disabled="commandDisabled('tidy')" :title="disabledReason('tidy')" @click="run({ type: 'tidy', source: 'toolbar', payload: { axis: 'both', minSpacing: 1, cols: 12 } })">Tidy</button>
        <button :disabled="commandDisabled('section-row-collapse')" :title="disabledReason('section-row-collapse')" @click="run({ type: 'section-row-collapse', source: 'toolbar', payload: { id: primarySectionRowId } })">Collapse row</button>
        <button :disabled="commandDisabled('section-row-expand')" :title="disabledReason('section-row-expand')" @click="run({ type: 'section-row-expand', source: 'toolbar', payload: { id: primarySectionRowId } })">Expand row</button>
        <button :disabled="commandDisabled('section-row-move')" :title="disabledReason('section-row-move')" @click="run({ type: 'section-row-move', source: 'toolbar', payload: { id: primarySectionRowId, dy: 1, cols: 12 } })">Move row</button>
        <button :disabled="commandDisabled('section-row-reorder')" :title="disabledReason('section-row-reorder')" @click="run({ type: 'section-row-reorder', source: 'toolbar', payload: { id: primarySectionRowId, order: 0 } })">Reorder row</button>
        <button :disabled="commandDisabled('section-row-delete')" :title="disabledReason('section-row-delete')" @click="run({ type: 'section-row-delete', source: 'toolbar', payload: { id: primarySectionRowId } })">Clear row metadata</button>
        <button @click="editor.undo()">Undo</button>
        <button @click="editor.redo()">Redo</button>
        <button @click="save">Save</button>
        <button @click="failSave">Fail save</button>
        <button @click="discard">Discard</button>
        <button @click="reset">Reset</button>
        <button @click="simulateConflict">Simulate conflict</button>
        <button @click="toggleLargeLayout">{{ state.largeLayout ? 'Small layout' : '500+ layout' }}</button>
        <button @click="toggleDebugGuides">{{ state.debugGuides ? 'User guides' : 'Debug guides' }}</button>
        <button @click="togglePredictive">{{ state.predictiveGuides ? 'Predict ON' : 'Predict OFF' }}</button>
        <button @click="toggleChips">{{ state.spacingChips ? 'Chips ON' : 'Chips OFF' }}</button>
        <button @click="toggleHud">{{ state.measurementHud ? 'HUD ON' : 'HUD OFF' }}</button>
        <button @click="toggleSectionSnap">{{ state.sectionSnap ? 'Section snap ON' : 'Section snap OFF' }}</button>
      </div>
      <div class="layoutJSON">
        <strong>Mode:</strong> {{ mode }} |
        <strong>State:</strong> {{ editor.state.value }} |
        <strong>Dirty:</strong> {{ editor.dirty.value }} |
        <strong>Persistence:</strong> {{ persistence.status.value }} |
        <strong>Selected:</strong> {{ selectedSummary }}
        <div><strong>Toolbar:</strong> {{ toolbarState.selectionSummary.count }} selected, align {{ toolbarState.commands.align?.enabled ? 'enabled' : toolbarState.commands.align?.reason }}, distribute {{ toolbarState.commands.distribute?.enabled ? 'enabled' : toolbarState.commands.distribute?.reason }}</div>
        <div><strong>Guides:</strong> {{ guideSummary }}</div>
        <div><strong>HUD:</strong> {{ hudSummary }}</div>
        <div><strong>Group move:</strong> Ctrl/Cmd-click cards, then drag a selected card or use arrow keys. Forecast is editor-locked; Customer Health is layout static.</div>
        <div><strong>Last event:</strong> {{ state.lastEvent }} | <strong>Last result:</strong> {{ state.lastResult }}</div>
        <div v-if="state.ariaMessage" style="color:#8a4b00;">{{ state.ariaMessage }}</div>
        <div v-if="state.conflict" style="color:#b00020;">Conflict: {{ state.conflict }}</div>
      </div>
      <VueGridLayout
        class="layout"
        v-model="layout"
        :cols="12"
        :rowHeight="42"
        :useCSSTransforms="state.mounted"
        :editor="editorProp"
        :layoutEngine="{ scheduler: { mode: 'auto', auto: { workerMinItems: 500 } }, diagnostics: true }"
      >
        <div v-for="item in layout" :key="item.i" :class="{ static: item.static }">
          <span class="text">{{ labels[item.i] || item.i }}</span>
          <small style="display:block;font-size:11px;color:#666;">{{ item.x }},{{ item.y }} / {{ item.w }}x{{ item.h }}</small>
        </div>
      </VueGridLayout>
    </div>
  `
};

createApp(App).mount("#container");
