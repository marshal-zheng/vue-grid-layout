import{r as s,aS as i,aD as l}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as u}from"./VueGridLayout-BFL_boXH.js";import{W as p}from"./WidthProvider-CnIrU8Vb.js";import{R as d}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const c=p(d),y=3,m={setup(g,{attrs:v}){const n=()=>Array.from({length:y},(e,a)=>{const o=Math.ceil(Math.random()*4)+1;return{x:Math.round(Math.random()*5)*2,y:Math.floor(a/6)*o,w:2,h:o,i:(a+1).toString(),static:Math.random()<.05}}),t=i({currentBreakpoint:"lg",compactType:"vertical",mounted:!1,layout:[],layouts:{lg:n()}});return l(()=>{t.mounted=!0}),{state:t,newLayout:()=>{t.layouts={lg:n(t.resizeHandles)}},onBreakpointChange:({breakpoint:e})=>{t.currentBreakpoint=e},onLayoutChange:(e,a)=>{t.layout=e},onDrop:(e,a,o)=>{const r=e.concat({...o,i:(t.layouts.lg.length+1).toString()});t.layouts={lg:r}},onDropDragOver:e=>({w:2,h:2})}},components:{VGL:u,ResponsiveVueGridLayout:c},template:`
    <div>
      <h1>Vue Grid Layout</h1>
      <div className="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div className="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ': ['  + l.x + ',' + l.y + ',' + l.w + ',' + l.h + ']' }}
          </div>
        </div>
      </div>
      <div
        class="droppable-element"
        :draggable="true"
        unselectable="on"
        onDragStart="(e) => e.dataTransfer.setData('text/plain', '')"
      >
        Droppable Element (Drag me!)
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
        :layouts="state.layouts"
        @breakpointChange={onBreakpointChange}
        @layoutChange="onLayoutChange"
        @dropDragOver="onDropDragOver"
        @drop="onDrop"
        @dragStop="onDragStop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :containerPadding="[16, 16]"
        :isDroppable="true"
        dropStrategy="auto"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="l.i" :class="{ static: l.static }">
          <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
            Static - {{ l.i }}
          </span>
          <span v-else class="text">{{ l.i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `};s(m).mount("#container");
