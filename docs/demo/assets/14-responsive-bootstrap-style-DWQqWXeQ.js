import{r,aS as p,aD as u}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as d}from"./VueGridLayout-BFL_boXH.js";import{W as y}from"./WidthProvider-CnIrU8Vb.js";import{R as m}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const v=y(m),g=20,h={setup(x,{attrs:C}){const o=p({currentBreakpoint:"lg",compactType:"vertical",resizeHandles:["se"],mounted:!1,layout:[],layouts:(()=>{const t=[...Array(g)];console.log("times",t);const e={lg:12,md:12,sm:12,xs:12,xxs:12},a={lg:3,md:4,sm:6,xs:12,xxs:12};return Object.keys(a).reduce((n,s)=>{const i=a[s],l=e[s];return n[s]=[...t.map((V,c)=>({x:c*i%l,y:0,w:i,h:4,i:String(c)}))],n},{})})(),cols:{lg:12,md:12,sm:12,xs:12,xxs:12}});return u(()=>{o.mounted=!0}),{state:o,compactTypeChange:()=>{const{compactType:t}=o,e=t==="horizontal"?"vertical":t==="vertical"?null:"horizontal";o.compactType=e},onBreakpointChange:({breakpoint:t})=>{o.currentBreakpoint=t},onLayoutChange:(t,e)=>{o.layout=t}}},components:{VGL:d,ResponsiveVueGridLayout:v},template:`
    <div>
      <h1>Vue Grid Layout</h1>
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
  `};r(h).mount("#container");
