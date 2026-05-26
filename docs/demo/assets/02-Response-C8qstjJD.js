import{r as i,aS as c,aD as l}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as p}from"./VueGridLayout-BFL_boXH.js";import{W as u}from"./WidthProvider-CnIrU8Vb.js";import{R as y}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const d=u(y),m=20,h={setup(v,{attrs:g}){const a=e=>Array.from({length:m},(n,s)=>{const r=Math.ceil(Math.random()*4)+1;return{x:Math.round(Math.random()*5)*2,y:Math.floor(s/6)*r,w:2,h:r,i:(s+1).toString(),static:Math.random()<.05,resizeHandles:e}}),t=c({currentBreakpoint:"lg",compactType:"vertical",resizeHandles:["se"],mounted:!1,layout:[],layouts:{lg:a(["se"])}});l(()=>{t.mounted=!0});const o=["s","w","e","n","sw","nw","se","ne"];return{state:t,compactTypeChange:()=>{const{compactType:e}=t,n=e==="horizontal"?"vertical":e==="vertical"?null:"horizontal";t.compactType=n},resizeTypeChange:()=>{const e=t.resizeHandles===o?["se"]:o;t.resizeHandles=e,t.layouts={lg:a(e)}},newLayout:()=>{t.layouts={lg:a(t.resizeHandles)}},onBreakpointChange:({breakpoint:e})=>{t.currentBreakpoint=e},onLayoutChange:(e,n)=>{t.layout=e},availableHandles:o,onDrop:e=>{alert(`Element parameters: ${JSON.stringify(e)}`)}}},components:{VGL:p,ResponsiveVueGridLayout:d},template:`
    <div>
      <h1>Vue Grid Layout</h1>
      <div>
        Current Breakpoint: {{state.currentBreakpoint}} (
      </div>
      <div>
        Compaction type:
        {{state.compactType && state.compactType.charAt(0).toUpperCase() + state.compactType.slice(1).toLowerCase() || "No Compaction"}}
      </div>
      <button @click="newLayout">Generate New Layout</button>
      <button @click="compactTypeChange">
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
        :containerPadding="[16, 16]"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="i+1" :class="{ static: l.static }">
          <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
            Static - {{ i }}
          </span>
          <span v-else class="text">{{ i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `};i(h).mount("#container");
