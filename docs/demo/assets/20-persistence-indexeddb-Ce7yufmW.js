import{r as d,aU as l,aS as c,aD as y}from"./vue.esm-bundler-DbJ0TIm9.js";import{W as p}from"./WidthProvider-CnIrU8Vb.js";import{P as v}from"./PersistentGridLayout-aLfrpQ2-.js";import{i as m}from"./persistence-CMJrtt_j.js";import"./createGridLayoutComponent-De6d2Lgh.js";import"./VueGridLayout-BFL_boXH.js";const w=p(v),f="vgl:",s="persistence-indexeddb-demo",i=r=>r.map(a=>({...a})),n=()=>[{i:"a",x:0,y:0,w:2,h:2},{i:"b",x:2,y:0,w:2,h:3,minW:2,maxW:4},{i:"c",x:4,y:0,w:2,h:2},{i:"d",x:6,y:0,w:2,h:2,static:!0},{i:"e",x:8,y:0,w:2,h:3},{i:"f",x:0,y:3,w:3,h:2}],x=()=>[{i:"a",x:0,y:0,w:3,h:2},{i:"b",x:3,y:0,w:3,h:2,minW:2,maxW:4},{i:"c",x:6,y:0,w:2,h:3},{i:"d",x:8,y:0,w:2,h:2,static:!0},{i:"e",x:0,y:2,w:2,h:2},{i:"f",x:2,y:2,w:4,h:2}],g={setup(){const r=l(i(n())),a=m({dbName:"vue-grid-layout-examples",storeName:"layouts",prefix:f}),t=c({mounted:!1,storagePreview:"(empty)",lastEvent:"(none)",lastSavedAt:"(never)",error:""}),o=async()=>{try{const e=await a.load(s);if(!e){t.storagePreview="(empty)",t.lastSavedAt="(never)";return}if(typeof e=="string"){t.storagePreview=e,t.lastSavedAt="(invalid)";return}t.lastSavedAt=e.savedAt||"(unknown)",t.storagePreview=JSON.stringify({kind:e.kind,savedAt:e.savedAt,items:e.data&&e.data.layout?e.data.layout.length:0},null,2)}catch(e){t.error=e.message}},u={key:s,adapter:a,debounceMs:600,onEvent:e=>{t.lastEvent=e.type,(e.type==="save-success"||e.type==="load-success")&&(t.error="",o()),(e.type==="load-error"||e.type==="save-error"||e.type==="error")&&(t.error=e.error?e.error.message:"Persistence error")},onError:e=>{t.error=e.message}};return y(()=>{t.mounted=!0,o()}),{layout:r,persistence:u,state:t,useDefaultLayout:()=>{r.value=i(n())},useAlternateLayout:()=>{r.value=i(x())},clearSavedLayout:async()=>{await a.remove(s),t.lastEvent="manual-clear",t.error="",await o()},corruptSavedLayout:async()=>{await a.save(s,"{broken-json"),t.lastEvent="manual-corrupt",await o()}}},components:{VueGridLayout:w},template:`
    <div>
      <h1>Persistence - IndexedDB</h1>
      <p>
        Test: drag or resize a tile, wait one second, refresh the page.
        The layout should restore from IndexedDB.
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin: 10px 0;">
        <button @click="useDefaultLayout">Use default layout</button>
        <button @click="useAlternateLayout">Use alternate layout</button>
        <button @click="clearSavedLayout">Clear saved layout</button>
        <button @click="corruptSavedLayout">Corrupt saved layout</button>
      </div>
      <div class="layoutJSON">
        <strong>Last event:</strong> {{ state.lastEvent }} |
        <strong>Last saved:</strong> {{ state.lastSavedAt }}
        <div v-if="state.error" style="color:#b00020; margin-top:6px;">
          Error: {{ state.error }}
        </div>
      </div>
      <div class="layoutJSON">
        Saved IndexedDB document:
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
  `};d(g).mount("#container");
