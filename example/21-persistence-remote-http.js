import { createApp, onMounted, reactive, ref } from "vue/dist/vue.esm-bundler.js";
import { WidthProvider } from "@marsio/vue-grid-layout";
import { PersistentGridLayout, remoteHttpAdapter } from "@marsio/vue-grid-layout/persistence";

const VueGridLayout = WidthProvider(PersistentGridLayout);

const serverPrefix = "vgl:remote-http:";
const storageKey = "persistence-remote-http-demo";

const cloneLayout = layout => layout.map(item => ({ ...item }));

const createDefaultLayout = () => [
  { i: "a", x: 0, y: 0, w: 2, h: 2 },
  { i: "b", x: 2, y: 0, w: 2, h: 3, minW: 2, maxW: 4 },
  { i: "c", x: 4, y: 0, w: 2, h: 2 },
  { i: "d", x: 6, y: 0, w: 2, h: 2, static: true },
  { i: "e", x: 8, y: 0, w: 2, h: 3 },
  { i: "f", x: 0, y: 3, w: 3, h: 2 }
];

const createAlternateLayout = () => [
  { i: "a", x: 0, y: 0, w: 3, h: 2 },
  { i: "b", x: 3, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
  { i: "c", x: 6, y: 0, w: 2, h: 3 },
  { i: "d", x: 8, y: 0, w: 2, h: 2, static: true },
  { i: "e", x: 0, y: 2, w: 2, h: 2 },
  { i: "f", x: 2, y: 2, w: 4, h: 2 }
];

const serverStorageKey = key => `${serverPrefix}${key}`;

const fakeResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  json: () => Promise.resolve(body)
});

const fakeFetch = (input, init = {}) => {
  const url = new URL(String(input), window.location.href);
  const key = decodeURIComponent(url.pathname.split("/").pop() || "");
  const method = init.method || "GET";
  const storeKey = serverStorageKey(key);

  if (method === "GET") {
    const raw = window.localStorage.getItem(storeKey);
    if (!raw) return Promise.resolve(fakeResponse(404));
    return Promise.resolve(fakeResponse(200, JSON.parse(raw)));
  }

  if (method === "PUT") {
    window.localStorage.setItem(storeKey, String(init.body || ""));
    return Promise.resolve(fakeResponse(204));
  }

  if (method === "DELETE") {
    window.localStorage.removeItem(storeKey);
    return Promise.resolve(fakeResponse(204));
  }

  return Promise.resolve(fakeResponse(405));
};

const App = {
  setup() {
    const layout = ref(cloneLayout(createDefaultLayout()));
    const adapter = remoteHttpAdapter({
      endpoint: key => `/fake-grid-layout-persistence/${encodeURIComponent(key)}`,
      fetch: fakeFetch,
      timeoutMs: 2000
    });
    const state = reactive({
      mounted: false,
      storagePreview: "(empty)",
      lastEvent: "(none)",
      lastSavedAt: "(never)",
      error: ""
    });

    const readStorage = () => {
      const raw = window.localStorage.getItem(serverStorageKey(storageKey));
      if (!raw) {
        state.storagePreview = "(empty)";
        state.lastSavedAt = "(never)";
        return;
      }
      try {
        const doc = JSON.parse(raw);
        state.lastSavedAt = doc.savedAt || "(unknown)";
        state.storagePreview = JSON.stringify({
          kind: doc.kind,
          savedAt: doc.savedAt,
          items: doc.data && doc.data.layout ? doc.data.layout.length : 0
        }, null, 2);
      } catch (_error) {
        state.storagePreview = raw;
        state.lastSavedAt = "(invalid)";
      }
    };

    const persistence = {
      key: storageKey,
      adapter,
      debounceMs: 600,
      onEvent: event => {
        state.lastEvent = event.type;
        if (event.type === "save-success" || event.type === "load-success") {
          state.error = "";
          readStorage();
        }
        if (event.type === "load-error" || event.type === "save-error" || event.type === "error") {
          state.error = event.error ? event.error.message : "Persistence error";
        }
      },
      onError: error => {
        state.error = error.message;
      }
    };

    onMounted(() => {
      state.mounted = true;
      readStorage();
    });

    const useDefaultLayout = () => {
      layout.value = cloneLayout(createDefaultLayout());
    };

    const useAlternateLayout = () => {
      layout.value = cloneLayout(createAlternateLayout());
    };

    const clearSavedLayout = () => {
      window.localStorage.removeItem(serverStorageKey(storageKey));
      state.lastEvent = "manual-clear";
      state.error = "";
      readStorage();
    };

    const corruptSavedLayout = () => {
      window.localStorage.setItem(serverStorageKey(storageKey), "{broken-json");
      state.lastEvent = "manual-corrupt";
      readStorage();
    };

    return {
      layout,
      persistence,
      state,
      useDefaultLayout,
      useAlternateLayout,
      clearSavedLayout,
      corruptSavedLayout
    };
  },
  components: {
    VueGridLayout
  },
  template: `
    <div>
      <h1>Persistence - Remote HTTP</h1>
      <p>
        Test: drag or resize a tile, wait one second, refresh the page.
        This page exercises remoteHttpAdapter through a fake REST endpoint.
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin: 10px 0;">
        <button @click="useDefaultLayout">Use default layout</button>
        <button @click="useAlternateLayout">Use alternate layout</button>
        <button @click="clearSavedLayout">Clear fake server</button>
        <button @click="corruptSavedLayout">Corrupt fake server</button>
      </div>
      <div class="layoutJSON">
        <strong>Last event:</strong> {{ state.lastEvent }} |
        <strong>Last saved:</strong> {{ state.lastSavedAt }}
        <div v-if="state.error" style="color:#b00020; margin-top:6px;">
          Error: {{ state.error }}
        </div>
      </div>
      <div class="layoutJSON">
        Fake remote server document:
        <pre style="white-space:pre-wrap;">{{ state.storagePreview }}</pre>
      </div>
      <VueGridLayout
        class="layout"
        v-model="layout"
        :cols="12"
        :rowHeight="30"
        :useCSSTransforms="state.mounted"
        :persistence="persistence"
      >
        <div v-for="item in layout" :key="item.i" :class="{ static: item.static }">
          <span class="text">{{ item.i }}</span>
        </div>
      </VueGridLayout>
    </div>
  `
};

createApp(App).mount("#container");
