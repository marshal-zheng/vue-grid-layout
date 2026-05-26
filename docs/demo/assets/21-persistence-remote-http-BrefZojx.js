import{r as y,aU as v,aS as w,aD as g}from"./vue.esm-bundler-DbJ0TIm9.js";import{W as f}from"./WidthProvider-CnIrU8Vb.js";import{P as h}from"./PersistentGridLayout-aLfrpQ2-.js";import{r as S}from"./persistence-CMJrtt_j.js";import"./createGridLayoutComponent-De6d2Lgh.js";import"./VueGridLayout-BFL_boXH.js";const x=f(h),L="vgl:remote-http:",l="persistence-remote-http-demo",p=r=>r.map(o=>({...o})),m=()=>[{i:"a",x:0,y:0,w:2,h:2},{i:"b",x:2,y:0,w:2,h:3,minW:2,maxW:4},{i:"c",x:4,y:0,w:2,h:2},{i:"d",x:6,y:0,w:2,h:2,static:!0},{i:"e",x:8,y:0,w:2,h:3},{i:"f",x:0,y:3,w:3,h:2}],k=()=>[{i:"a",x:0,y:0,w:3,h:2},{i:"b",x:3,y:0,w:3,h:2,minW:2,maxW:4},{i:"c",x:6,y:0,w:2,h:3},{i:"d",x:8,y:0,w:2,h:2,static:!0},{i:"e",x:0,y:2,w:2,h:2},{i:"f",x:2,y:2,w:4,h:2}],u=r=>`${L}${r}`,i=(r,o)=>({ok:r>=200&&r<300,status:r,statusText:String(r),json:()=>Promise.resolve(o)}),P=(r,o={})=>{const e=new URL(String(r),window.location.href),s=decodeURIComponent(e.pathname.split("/").pop()||""),n=o.method||"GET",c=u(s);if(n==="GET"){const d=window.localStorage.getItem(c);return d?Promise.resolve(i(200,JSON.parse(d))):Promise.resolve(i(404))}return n==="PUT"?(window.localStorage.setItem(c,String(o.body||"")),Promise.resolve(i(204))):n==="DELETE"?(window.localStorage.removeItem(c),Promise.resolve(i(204))):Promise.resolve(i(405))},A={setup(){const r=v(p(m())),o=S({endpoint:t=>`/fake-grid-layout-persistence/${encodeURIComponent(t)}`,fetch:P,timeoutMs:2e3}),e=w({mounted:!1,storagePreview:"(empty)",lastEvent:"(none)",lastSavedAt:"(never)",error:""}),s=()=>{const t=window.localStorage.getItem(u(l));if(!t){e.storagePreview="(empty)",e.lastSavedAt="(never)";return}try{const a=JSON.parse(t);e.lastSavedAt=a.savedAt||"(unknown)",e.storagePreview=JSON.stringify({kind:a.kind,savedAt:a.savedAt,items:a.data&&a.data.layout?a.data.layout.length:0},null,2)}catch(a){e.storagePreview=t,e.lastSavedAt="(invalid)"}},n={key:l,adapter:o,debounceMs:600,onEvent:t=>{e.lastEvent=t.type,(t.type==="save-success"||t.type==="load-success")&&(e.error="",s()),(t.type==="load-error"||t.type==="save-error"||t.type==="error")&&(e.error=t.error?t.error.message:"Persistence error")},onError:t=>{e.error=t.message}};return g(()=>{e.mounted=!0,s()}),{layout:r,persistence:n,state:e,useDefaultLayout:()=>{r.value=p(m())},useAlternateLayout:()=>{r.value=p(k())},clearSavedLayout:()=>{window.localStorage.removeItem(u(l)),e.lastEvent="manual-clear",e.error="",s()},corruptSavedLayout:()=>{window.localStorage.setItem(u(l),"{broken-json"),e.lastEvent="manual-corrupt",s()}}},components:{VueGridLayout:x},template:`
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
  `};y(A).mount("#container");
