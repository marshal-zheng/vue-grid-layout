const { VueGridLayout: VGL, Vue: VueInstance } = window;
const { createApp, computed, onBeforeUnmount, onMounted, reactive, ref } = VueInstance;

const { WidthProvider, workerLayoutExecutor } = VGL;
const VueGridLayout = WidthProvider(VGL);

const workerUrl = new URL("../build/web/vue-grid-layout.worker.js", window.location.href).href;

const createOrderedLayout = count => {
  const layout = [];

  for (let i = 0; i < count; i++) {
    layout.push({
      i: String(i),
      x: i % 12,
      y: Math.floor(i / 12),
      w: 1,
      h: 1,
      static: i > 0 && i % 53 === 0
    });
  }

  return layout;
};

const summarizeEvent = event => {
  const diagnostics = event.diagnostics || {};
  const durationMs = typeof diagnostics.durationMs === "number" ? diagnostics.durationMs : null;
  return {
    type: event.type,
    operation: event.operationType || diagnostics.operationType || "-",
    phase: event.phase || diagnostics.phase || "-",
    scheduler: diagnostics.schedulerMode || "-",
    executor: diagnostics.executorKind || "-",
    size: diagnostics.layoutSize || 0,
    affected: diagnostics.affectedCount || 0,
    collisions: diagnostics.collisionCount || 0,
    indexHit: diagnostics.indexHit === true ? "yes" : diagnostics.indexHit === false ? "no" : "-",
    durationMs,
    duration: durationMs == null ? "-" : durationMs.toFixed(2),
    message: event.message || ""
  };
};

const shouldLogEvent = summary =>
  summary.type === "operation" && summary.phase === "commit" ||
  summary.type === "fallback" ||
  summary.type === "timeout" ||
  summary.type === "worker-error" ||
  summary.type === "legacy-mismatch";

const logEngineEvent = (summary, expectedExecutor) => {
  if (!shouldLogEvent(summary)) return;

  const payload = {
    type: summary.type,
    operation: summary.operation,
    phase: summary.phase,
    expectedExecutor: expectedExecutor === "worker" ? "worker" : "main-thread",
    executor: summary.executor,
    commitUsedExpectedExecutor: summary.type === "operation" && summary.phase === "commit"
      ? summary.executor === (expectedExecutor === "worker" ? "worker" : "main-thread")
      : undefined,
    workerUsed: summary.executor === "worker",
    layoutSize: summary.size,
    affected: summary.affected,
    collisions: summary.collisions,
    indexHit: summary.indexHit,
    durationMs: summary.durationMs,
    message: summary.message || undefined
  };

  console.info("[vue-grid-layout layout-engine commit]", payload);
};

const App = {
  setup() {
    const layout = ref(createOrderedLayout(300));
    const executorMode = ref("main");
    const workerExecutor = ref(null);
    const state = reactive({
      mounted: false,
      events: [],
      commitCount: 0,
      lastLayoutSize: layout.value.length,
      lastCommitAt: "(none)"
    });

    const disposeWorker = () => {
      if (workerExecutor.value) workerExecutor.value.dispose && workerExecutor.value.dispose();
      workerExecutor.value = null;
    };

    const ensureWorker = () => {
      if (!workerExecutor.value) {
        workerExecutor.value = workerLayoutExecutor({
          workerUrl,
          timeoutMs: 3000
        });
      }
      return workerExecutor.value;
    };

    const pushEvent = event => {
      const summary = summarizeEvent(event);
      state.events.unshift(summary);
      state.events = state.events.slice(0, 20);
      logEngineEvent(summary, executorMode.value);
      if (summary.type === "operation" && summary.phase === "commit") {
        state.commitCount++;
        state.lastCommitAt = new Date().toLocaleTimeString();
      }
    };

    const layoutEngine = computed(() => ({
      scheduler: {
        mode: "auto",
        maxTaskMs: 6,
        auto: {
          eagerMaxItems: 80,
          rafMaxItems: 350,
          workerMinItems: 500,
          densityThreshold: 1.1
        }
      },
      executor: executorMode.value === "worker" ? ensureWorker() : undefined,
      diagnostics: {
        debug: true,
        budgetMs: 12
      },
      compareLegacy: true,
      onEvent: pushEvent
    }));

    const setSize = count => {
      layout.value = createOrderedLayout(count);
      state.events = [];
      state.commitCount = 0;
      state.lastLayoutSize = count;
      state.lastCommitAt = "(none)";
    };

    const setExecutorMode = mode => {
      if (executorMode.value === mode) return;
      if (executorMode.value === "worker") disposeWorker();
      executorMode.value = mode;
      if (mode === "worker") ensureWorker();
      state.events = [];
    };

    const onLayoutChange = nextLayout => {
      state.lastLayoutSize = nextLayout.length;
    };

    onMounted(() => {
      state.mounted = true;
    });

    onBeforeUnmount(() => {
      disposeWorker();
    });

    return {
      executorMode,
      layout,
      layoutEngine,
      onLayoutChange,
      setExecutorMode,
      setSize,
      state,
      workerUrl
    };
  },
  components: {
    VueGridLayout
  },
  template: `
    <div>
      <h1>Layout Engine Diagnostics / Worker</h1>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin: 10px 0;">
        <button @click="setSize(100)">100 items</button>
        <button @click="setSize(300)">300 items</button>
        <button @click="setSize(800)">800 items</button>
        <button
          :disabled="executorMode === 'main'"
          @click="setExecutorMode('main')"
        >
          Main thread
        </button>
        <button
          :disabled="executorMode === 'worker'"
          @click="setExecutorMode('worker')"
        >
          Worker
        </button>
      </div>

      <div class="layoutJSON">
        <strong>Items:</strong> {{ state.lastLayoutSize }} |
        <strong>Executor:</strong> {{ executorMode === 'worker' ? 'worker' : 'main-thread' }} |
        <strong>Commit operations:</strong> {{ state.commitCount }} |
        <strong>Last commit:</strong> {{ state.lastCommitAt }}
      </div>

      <VueGridLayout
        class="layout"
        v-model="layout"
        :cols="12"
        :rowHeight="32"
        :margin="[8, 8]"
        :containerPadding="[8, 8]"
        :useCSSTransforms="state.mounted"
        :layoutEngine="layoutEngine"
        @layoutChange="onLayoutChange"
      >
        <div v-for="item in layout" :key="item.i" :class="{ static: item.static }">
          <span class="text" style="font-size:12px;">{{ item.i }}</span>
        </div>
      </VueGridLayout>

      <div class="layoutJSON">
        Recent layout engine events:
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead>
            <tr>
              <th align="left">type</th>
              <th align="left">op</th>
              <th align="left">phase</th>
              <th align="left">scheduler</th>
              <th align="left">executor</th>
              <th align="right">size</th>
              <th align="right">affected</th>
              <th align="right">collisions</th>
              <th align="left">index</th>
              <th align="right">ms</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in state.events" :key="index">
              <td>{{ event.type }}</td>
              <td>{{ event.operation }}</td>
              <td>{{ event.phase }}</td>
              <td>{{ event.scheduler }}</td>
              <td>{{ event.executor }}</td>
              <td align="right">{{ event.size }}</td>
              <td align="right">{{ event.affected }}</td>
              <td align="right">{{ event.collisions }}</td>
              <td>{{ event.indexHit }}</td>
              <td align="right">{{ event.duration }}</td>
            </tr>
            <tr v-if="state.events.length === 0">
              <td colspan="10">Drag or resize a tile to emit diagnostics.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
};

createApp(App).mount("#container");
