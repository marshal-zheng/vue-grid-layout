import{r,aS as d,a5 as a}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as c}from"./VueGridLayout-BFL_boXH.js";import{W as p}from"./WidthProvider-CnIrU8Vb.js";import{R as l}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const m=p(l),u={setup(y,{attrs:v}){const e=d({layout:[],items:[0,1,2,3,4].map(function(t,o,n){return{i:t.toString(),x:t*2,y:0,w:2,h:2,add:t===n.length-1}}),newCounter:0}),s=t=>{const o={position:"absolute",right:"2px",top:0,cursor:"pointer"},n=t.add?"+":t.i;return a("div",{key:n,"data-grid":t},[t.add?a("span",{class:"add text",onClick:i,title:"You can add an item by clicking here, too."},"Add +"):a("span",{class:"text"},n),a("span",{class:"remove",style:o,onClick:()=>this.onRemoveItem(n)},"x")])},i=()=>{console.log("adding","n"+e.newCounter),e.items=e.items.concat({i:"n"+e.newCounter,x:e.items.length*2%(e.cols||12),y:1/0,w:2,h:2}),console.log("items",e.items),e.newCounter=e.newCounter+1};return{state:e,onRemoveItem:t=>{e.items=e.items.filter(o=>o.i!==t)},onBreakpointChange:({breakpoint:t,cols:o})=>{e.breakpoint=t,e.cols=o},onLayoutChange:(t,o)=>{e.layout=t},createElement:s,onAddItem:i}},components:{VGL:c,ResponsiveVueGridLayout:m},template:`
    <div>
      <h1>Vue Grid Layout</h1>
      <div>{{state.items}}</div>
      <ResponsiveVueGridLayout
        @layoutChange="onLayoutChange"
        @breakpointChange="onBreakpointChange"
        :rowHeight="30"
        :containerPadding="[16, 16]"
      >
        <div v-for="(el, i) in state.items" :key="el.add ? '+' : el.i" :data-grid="el">
          <span
            v-if="el.add"
            class="add text"
            @click="onAddItem"
            title="You can add an item by clicking here, too."
          >
            Add +
          </span>
          <span v-else class="text">{{ el.i }}</span>
          <span
            class="remove"
            :style="{
              position: 'absolute',
              right: '2px',
              top: 0,
              cursor: 'pointer'
            }"
            @click="onRemoveItem(el.i)"
          >
            x
          </span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `};r(u).mount("#container");
