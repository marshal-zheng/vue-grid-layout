import{r as v,aU as s,aS as I,q as f,aD as C,az as x}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as y}from"./VueGridLayout-BFL_boXH.js";import{W as b}from"./WidthProvider-CnIrU8Vb.js";import{E as k}from"./createGridLayoutComponent-De6d2Lgh.js";const d="data:text/javascript;base64,aW1wb3J0IHsgZSBhcyB0IH0gZnJvbSAiLi9jb3JlLURBQXBZTlZQLm1qcyI7CmZ1bmN0aW9uIHMoZSkgewogIHRyeSB7CiAgICByZXR1cm4gewogICAgICBpZDogZS5pZCwKICAgICAgcmVzdWx0OiB0KGUucmVxdWVzdCkKICAgIH07CiAgfSBjYXRjaCAocikgewogICAgcmV0dXJuIHsKICAgICAgaWQ6IGUuaWQsCiAgICAgIGVycm9yOiB7CiAgICAgICAgbWVzc2FnZTogciBpbnN0YW5jZW9mIEVycm9yID8gci5tZXNzYWdlIDogU3RyaW5nKHIpLAogICAgICAgIGNhdXNlOiByCiAgICAgIH0KICAgIH07CiAgfQp9CnR5cGVvZiBzZWxmICE9ICJ1bmRlZmluZWQiICYmIHNlbGYuYWRkRXZlbnRMaXN0ZW5lciAmJiBzZWxmLnBvc3RNZXNzYWdlICYmIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsIChlKSA9PiB7CiAgdmFyIHI7CiAgIWUuZGF0YSB8fCBlLmRhdGEudHlwZSAhPT0gImxheW91dC1lbmdpbmUtcmVxdWVzdCIgfHwgKHIgPSBzZWxmLnBvc3RNZXNzYWdlKSA9PSBudWxsIHx8IHIuY2FsbChzZWxmLCBzKGUuZGF0YSkpOwp9KTsKZXhwb3J0IHsKICBzIGFzIHJ1bkxheW91dFdvcmtlclJlcXVlc3QKfTsK",A=b(y),c=t=>{const e=[];for(let o=0;o<t;o++)e.push({i:String(o),x:o%12,y:Math.floor(o/12),w:1,h:1,static:o>0&&o%53===0});return e},W=t=>{const e=t.diagnostics||{},o=typeof e.durationMs=="number"?e.durationMs:null;return{type:t.type,operation:t.operationType||e.operationType||"-",phase:t.phase||e.phase||"-",scheduler:e.schedulerMode||"-",executor:e.executorKind||"-",size:e.layoutSize||0,affected:e.affectedCount||0,collisions:e.collisionCount||0,indexHit:e.indexHit===!0?"yes":e.indexHit===!1?"no":"-",durationMs:o,duration:o==null?"-":o.toFixed(2),message:t.message||""}},w=t=>t.type==="operation"&&t.phase==="commit"||t.type==="fallback"||t.type==="timeout"||t.type==="worker-error"||t.type==="legacy-mismatch",z=(t,e)=>{if(!w(t))return;const o={type:t.type,operation:t.operation,phase:t.phase,expectedExecutor:e==="worker"?"worker":"main-thread",executor:t.executor,commitUsedExpectedExecutor:t.type==="operation"&&t.phase==="commit"?t.executor===(e==="worker"?"worker":"main-thread"):void 0,workerUsed:t.executor==="worker",layoutSize:t.size,affected:t.affected,collisions:t.collisions,indexHit:t.indexHit,durationMs:t.durationMs,message:t.message||void 0};console.info("[vue-grid-layout layout-engine commit]",o)},S={setup(){const t=s(c(300)),e=s("main"),o=s(null),i=I({mounted:!1,events:[],commitCount:0,lastLayoutSize:t.value.length,lastCommitAt:"(none)"}),r=()=>{o.value&&o.value.dispose&&o.value.dispose(),o.value=null},l=()=>(o.value||(o.value=k({workerUrl:d,timeoutMs:3e3})),o.value),u=n=>{const a=W(n);i.events.unshift(a),i.events=i.events.slice(0,20),z(a,e.value),a.type==="operation"&&a.phase==="commit"&&(i.commitCount++,i.lastCommitAt=new Date().toLocaleTimeString())},g=f(()=>({scheduler:{mode:"auto",maxTaskMs:6,auto:{eagerMaxItems:80,rafMaxItems:350,workerMinItems:500,densityThreshold:1.1}},executor:e.value==="worker"?l():void 0,diagnostics:{debug:!0,budgetMs:12},compareLegacy:!0,onEvent:u})),p=n=>{t.value=c(n),i.events=[],i.commitCount=0,i.lastLayoutSize=n,i.lastCommitAt="(none)"},h=n=>{e.value!==n&&(e.value==="worker"&&r(),e.value=n,n==="worker"&&l(),i.events=[])},m=n=>{i.lastLayoutSize=n.length};return C(()=>{i.mounted=!0}),x(()=>{r()}),{executorMode:e,layout:t,layoutEngine:g,onLayoutChange:m,setExecutorMode:h,setSize:p,state:i,workerUrl:d}},components:{VueGridLayout:A},template:`
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
  `};v(S).mount("#container");
