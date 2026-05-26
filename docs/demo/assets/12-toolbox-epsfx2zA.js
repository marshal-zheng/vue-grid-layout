import{r as i,aS as r,aD as l,M as c}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as p}from"./VueGridLayout-BFL_boXH.js";import{W as u}from"./WidthProvider-CnIrU8Vb.js";import{R as m}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const d=u(m),y=15,h=c({props:{item:{type:Object,required:!0}},emits:["takeItem"],methods:{handleClick(){this.$emit("takeItem",this.item)}},template:`
    <div class="toolbox__items__item" @click="handleClick">
      {{ item.i }}
    </div>
  `}),v={setup(k,{attrs:g}){const a=o=>(console.log(123),Array.from({length:y},(e,n)=>{const s=Math.ceil(Math.random()*4)+1;return{x:Math.round(Math.random()*5)*2,y:Math.floor(n/6)*s,w:2,h:s,i:(n+1).toString(),static:Math.random()<.05,resizeHandles:o}})),t=r({currentBreakpoint:"lg",compactType:"vertical",mounted:!1,toolbox:{lg:[]},layouts:{lg:a(["se"])}});return l(()=>{t.mounted=!0}),{state:t,compactTypeChange:()=>{const{compactType:o}=t,e=o==="horizontal"?"vertical":o==="vertical"?null:"horizontal";t.compactType=e},newLayout:()=>{t.layouts={lg:a(t.resizeHandles)}},onBreakpointChange:({breakpoint:o})=>{t.currentBreakpoint=o},onLayoutChange:(o,e)=>{t.layout=o},onPutItem:o=>{t.toolbox={[t.currentBreakpoint]:[...t.toolbox[t.currentBreakpoint]||[],o]},t.layouts={[t.currentBreakpoint]:t.layouts[t.currentBreakpoint].filter(({i:e})=>e!==o.i)}},onTakeItem:o=>{t.toolbox={[t.currentBreakpoint]:t.toolbox[t.currentBreakpoint].filter(({i:e})=>e!==o.i)},t.layouts={[t.currentBreakpoint]:[...t.layouts[t.currentBreakpoint],o]}}}},components:{VGL:p,ResponsiveVueGridLayout:d,ToolBoxItem:h},template:`
    <div>
      <h1>Vue Grid Layout</h1>
      <div class="toolbox">
        <span class="toolbox__title">Toolbox</span>
        <div class="toolbox__items">
        {{state.toolbox.lg}}
          <ToolBoxItem
            v-for="item in state.toolbox.lg"
            :key="item.i"
            :item="item"
            @takeItem="onTakeItem"
          />
        </div>
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="state.cols"
        :layouts="state.layouts"
        @breakpointChange={onBreakpointChange}
        @layoutChange="onLayoutChange"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :compactType="state.compactType"
        :preventCollision="!state.compactType"
        :containerPadding="[16, 16]"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="l.i" :class="{ static: l.static }">
          <div class="hide-button" @click="onPutItem(l)">
            &times;
          </div>
          <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
            Static - {{ l.i }}
          </span>
          <span v-else class="text">{{ l.i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `};i(v).mount("#container");
