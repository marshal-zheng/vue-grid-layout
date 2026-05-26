import{r,aS as l,aD as c}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as p}from"./VueGridLayout-BFL_boXH.js";import{W as u}from"./WidthProvider-CnIrU8Vb.js";import{R as y}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const m=u(y),d=20,h={setup(g,{attrs:v}){const a=e=>Array.from({length:d},(n,s)=>{const i=Math.ceil(Math.random()*4)+1;return{x:Math.round(Math.random()*5)*2,y:Math.floor(s/6)*i,w:2,h:i,i:(s+1).toString(),static:Math.random()<.05,resizeHandles:e}}),t=l({currentBreakpoint:"lg",compactType:"vertical",resizeHandles:["se"],mounted:!1,layout:[],layouts:{lg:a(["se"])}});c(()=>{t.mounted=!0});const o=["s","w","e","n","sw","nw","se","ne"];return{state:t,compactTypeChange:()=>{const{compactType:e}=t,n=e==="horizontal"?"vertical":e==="vertical"?null:"horizontal";t.compactType=n},resizeTypeChange:()=>{const e=t.resizeHandles===o?["se"]:o;t.resizeHandles=e,t.layouts={lg:a(e)}},newLayout:()=>{t.layouts={lg:a(t.resizeHandles)}},onBreakpointChange:({breakpoint:e})=>{t.currentBreakpoint=e},onLayoutChange:(e,n)=>{t.layout=e},availableHandles:o,onDrop:e=>{alert(`Element parameters: ${JSON.stringify(e)}`)}}},components:{VGL:p,ResponsiveVueGridLayout:m},template:`
    <div>
      <h1>Vue Grid Layout</h1>
      <a href="https://github.com/marshal-zheng/vue-grid-layout/blob/main/example/example.js">View Code</a>
      <div>
        Current Breakpoint: {{state.currentBreakpoint}}
      </div>
      <div>
        Compaction type:
        {{state.compactType && state.compactType.charAt(0).toUpperCase() + state.compactType.slice(1).toLowerCase() || "No Compaction"}}
      </div>
      <button @click="newLayout" style="margin-right: 6px;">Generate New Layout</button>
      <button @click="compactTypeChange" style="margin-right: 6px;">
        Change Compaction Type
      </button>
      <button @click="resizeTypeChange">
        Resize {{state.resizeHandles === availableHandles ? "One Corner" : "All Corners"}}
      </button>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ":"+l.x+","+l.y+","+l.w+","+l.h }}
          </div>
        </div>
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="state.cols"
        :layouts="state.layouts"
        @breakpointChange={onBreakpointChange}
        @layoutChange="onLayoutChange"
        @drop="onDrop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :compactType="state.compactType"
        :preventCollision="!state.compactType"
        :containerPadding="[0, 0]"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="i+1" :class="{ static: l.static }">
          <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
            Static - {{ i }}
          </span>
          <span v-else class="text">{{ i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `};r(h).mount("#container");
