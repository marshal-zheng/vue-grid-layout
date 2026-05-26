import{r as s,aS as i,aD as p}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as u}from"./VueGridLayout-BFL_boXH.js";import{W as l}from"./WidthProvider-CnIrU8Vb.js";import{R as d}from"./ResponsiveVueGridLayout-D3mRbUD5.js";import"./createGridLayoutComponent-De6d2Lgh.js";const g=l(d),y={setup(c,{attrs:v}){const e=()=>[{x:0,y:0,w:2,h:2,i:"1"},{x:2,y:0,w:2,h:3,i:"2"},{x:4,y:0,w:2,h:2,i:"3"},{x:0,y:2,w:2,h:2,i:"4"},{x:6,y:0,w:2,h:4,i:"5"}],t=i({currentBreakpoint:"lg",mounted:!1,layout:[],layouts:{lg:e()},dropStrategy:"auto",dropCount:5});return p(()=>{t.mounted=!0}),{state:t,resetLayout:()=>{t.layouts={lg:e()},t.dropCount=5},onBreakpointChange:({breakpoint:o})=>{t.currentBreakpoint=o},onLayoutChange:(o,r)=>{t.layout=o},onDrop:(o,r,a)=>{t.dropCount++;const n=o.concat({...a,i:t.dropCount.toString()});t.layouts={lg:n}},onDropDragOver:o=>({w:2,h:2}),toggleDropStrategy:()=>{t.dropStrategy=t.dropStrategy==="auto"?"cursor":"auto"}}},components:{VGL:u,ResponsiveVueGridLayout:g},template:`
    <div>
      <h1>Drop Strategy Demo</h1>
      <p>
        <strong>dropStrategy</strong> 属性控制外部元素拖入时的落点行为：
      </p>
      <ul>
        <li><code>cursor</code>（默认）：落点跟随鼠标光标位置</li>
        <li><code>auto</code>：自动吸附到离光标最近的已有块旁边</li>
      </ul>
      <div style="margin: 10px 0;">
        <button @click="toggleDropStrategy" style="margin-right: 10px;">
          切换策略: {{ state.dropStrategy }}
        </button>
        <button @click="resetLayout">
          重置布局
        </button>
      </div>
      <div style="margin: 10px 0; padding: 10px; background: #e8f4e8; border-radius: 4px;">
        当前策略：<strong>{{ state.dropStrategy === 'auto' ? '自动吸附 (auto)' : '跟随光标 (cursor)' }}</strong>
        <span v-if="state.dropStrategy === 'auto'" style="color: #666;">
          — 拖入的元素会吸附到离光标最近的已有块旁边
        </span>
        <span v-else style="color: #666;">
          — 拖入的元素会放到鼠标位置
        </span>
      </div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ': [' + l.x + ',' + l.y + ',' + l.w + ',' + l.h + ']' }}
          </div>
        </div>
      </div>
      <div
        class="droppable-element"
        :draggable="true"
        unselectable="on"
        onDragStart="(e) => e.dataTransfer.setData('text/plain', '')"
      >
        拖拽我到下方网格！
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
        :layouts="state.layouts"
        @breakpointChange="onBreakpointChange"
        @layoutChange="onLayoutChange"
        @dropDragOver="onDropDragOver"
        @drop="onDrop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :containerPadding="[16, 16]"
        :isDroppable="true"
        :dropStrategy="state.dropStrategy"
      >
        <div v-for="l in state.layouts.lg" :key="l.i">
          <span class="text">{{ l.i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `};s(y).mount("#container");
