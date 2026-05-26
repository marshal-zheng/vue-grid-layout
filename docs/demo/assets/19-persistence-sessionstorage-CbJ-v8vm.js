import{r as d,aU as y,aS as p,aD as v}from"./vue.esm-bundler-DbJ0TIm9.js";import{W as m}from"./WidthProvider-CnIrU8Vb.js";import{P as w}from"./PersistentGridLayout-aLfrpQ2-.js";import{s as g}from"./persistence-CMJrtt_j.js";import"./createGridLayoutComponent-De6d2Lgh.js";import"./VueGridLayout-BFL_boXH.js";const f=m(w),o="vgl:",i="persistence-sessionstorage-demo",u=r=>r.map(n=>({...n})),c=()=>[{i:"a",x:0,y:0,w:2,h:2},{i:"b",x:2,y:0,w:2,h:3,minW:2,maxW:4},{i:"c",x:4,y:0,w:2,h:2},{i:"d",x:6,y:0,w:2,h:2,static:!0},{i:"e",x:8,y:0,w:2,h:3},{i:"f",x:0,y:3,w:3,h:2}],S=()=>[{i:"a",x:0,y:0,w:3,h:2},{i:"b",x:3,y:0,w:3,h:2,minW:2,maxW:4},{i:"c",x:6,y:0,w:2,h:3},{i:"d",x:8,y:0,w:2,h:2,static:!0},{i:"e",x:0,y:2,w:2,h:2},{i:"f",x:2,y:2,w:4,h:2}],h={setup(){const r=y(u(c())),n=g({prefix:o}),t=p({mounted:!1,storagePreview:"(empty)",lastEvent:"(none)",lastSavedAt:"(never)",error:""}),s=()=>{const e=window.sessionStorage.getItem(`${o}${i}`);if(!e){t.storagePreview="(empty)",t.lastSavedAt="(never)";return}try{const a=JSON.parse(e);t.lastSavedAt=a.savedAt||"(unknown)",t.storagePreview=JSON.stringify({kind:a.kind,savedAt:a.savedAt,items:a.data&&a.data.layout?a.data.layout.length:0},null,2)}catch(a){t.storagePreview=e}},l={key:i,adapter:n,debounceMs:600,onEvent:e=>{t.lastEvent=e.type,(e.type==="save-success"||e.type==="load-success")&&(t.error="",s()),(e.type==="load-error"||e.type==="save-error"||e.type==="error")&&(t.error=e.error?e.error.message:"Persistence error")},onError:e=>{t.error=e.message}};return v(()=>{t.mounted=!0,s()}),{layout:r,persistence:l,state:t,useDefaultLayout:()=>{r.value=u(c())},useAlternateLayout:()=>{r.value=u(S())},clearSavedLayout:()=>{window.sessionStorage.removeItem(`${o}${i}`),t.lastEvent="manual-clear",t.error="",s()},corruptSavedLayout:()=>{window.sessionStorage.setItem(`${o}${i}`,"{broken-json"),t.lastEvent="manual-corrupt",s()}}},components:{VueGridLayout:f},template:`
    <div>
      <h1>Persistence - sessionStorage</h1>
      <p>
        Test: drag or resize a tile, wait one second, refresh this tab.
        The layout should restore for this browser tab session.
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
        Saved sessionStorage document:
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
  `};d(h).mount("#container");
