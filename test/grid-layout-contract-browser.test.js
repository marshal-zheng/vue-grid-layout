'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/css/styles.css">
    <style>
      body { margin: 0; padding: 16px; font-family: sans-serif; }
      .test-host { width: 720px; margin-bottom: 32px; }
      .vue-grid-item { background: #f5f7fb; border: 1px solid #8aa0bd; box-sizing: border-box; }
      .vue-grid-item > div { height: 100%; display: grid; place-items: center; user-select: none; }
    </style>
  </head>
  <body>
    <div id="contract" class="test-host"></div>
    <div id="height" class="test-host"></div>
    <div id="height-fixed" class="test-host"></div>
    <div id="height-scroll" class="test-host"></div>
    <div id="blocked" class="test-host"></div>
    <div id="drop" class="test-host"></div>
    <div id="responsive-contract" class="test-host"></div>
    <script src="/example/vue-3.2.36.js"></script>
    <script src="/build/web/vue-grid-layout.min.js"></script>
    <script>
      (function () {
        var Vue = window.Vue;
        var VGL = window.VueGridLayout;
        var SingleGrid = VGL.VueGridLayout || VGL.default || VGL;
        var ResponsiveGrid = VGL.ResponsiveVueGridLayout || VGL.Responsive;
        var createApp = Vue.createApp;
        var ref = Vue.ref;
        var nextTick = Vue.nextTick;

        function cloneLayout(layout) {
          return layout.map(function (item) { return Object.assign({}, item); });
        }
        function cloneLayouts(layouts) {
          var out = {};
          Object.keys(layouts).forEach(function (key) {
            out[key] = cloneLayout(layouts[key]);
          });
          return out;
        }
        function normalizeItem(item) {
          if (!item) return null;
          return {
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            placeholder: item.placeholder === true,
            static: item.static === true
          };
        }
        function normalizeInteraction(type, args) {
          return {
            type: type,
            layoutLength: args[0] ? args[0].length : null,
            oldItem: normalizeItem(args[1]),
            item: normalizeItem(args[2]),
            placeholder: normalizeItem(args[3]),
            eventType: args[4] && args[4].type,
            nodeClass: args[5] && args[5].className
          };
        }

        var contractLayout = ref([
          { i: 'a', x: 0, y: 0, w: 2, h: 2 },
          { i: 'b', x: 3, y: 0, w: 2, h: 2 }
        ]);
        var contractEvents = [];
        var contractRootStyle = { borderTop: '7px solid rgb(12, 34, 56)' };

        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            function recordInteraction(type) {
              return function () {
                contractEvents.push(normalizeInteraction(type, Array.prototype.slice.call(arguments)));
              };
            }
            return {
              layout: contractLayout,
              rootStyle: contractRootStyle,
              onModelUpdate: function (layout) {
                contractEvents.push({ type: 'update:modelValue', layout: cloneLayout(layout) });
              },
              onLayoutChange: function (layout) {
                contractEvents.push({ type: 'layoutChange', layout: cloneLayout(layout) });
              },
              onDragStart: recordInteraction('dragStart'),
              onDrag: recordInteraction('drag'),
              onDragStop: recordInteraction('dragStop'),
              onResizeStart: recordInteraction('resizeStart'),
              onResize: recordInteraction('resize'),
              onResizeStop: recordInteraction('resizeStop')
            };
          },
          template: '<SingleGrid id="contract-grid" data-probe="single" aria-label="Contract grid" class="contract-class" :style="rootStyle" v-model="layout" :width="720" :cols="6" :rowHeight="30" :layoutEngine="false" @update:modelValue="onModelUpdate" @layoutChange="onLayoutChange" @dragStart="onDragStart" @drag="onDrag" @dragStop="onDragStop" @resizeStart="onResizeStart" @resize="onResize" @resizeStop="onResizeStop"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#contract');

        var heightLayout = ref([
          { i: 'height-a', x: 0, y: 0, w: 2, h: 2 }
        ]);
        var heightHostHeight = ref(240);
        var showHeightGrid = ref(true);
        var heightEvents = [];
        var heightSaveCount = 0;
        var heightPersistence = {
          key: 'height-runtime-browser-test',
          debounceMs: 20,
          adapter: {
            load: function () { return null; },
            save: function () { heightSaveCount += 1; },
            remove: function () {},
            subscribe: function () { return function () {}; }
          }
        };
        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            return {
              layout: heightLayout,
              hostHeight: heightHostHeight,
              showHeightGrid: showHeightGrid,
              heightPersistence: heightPersistence,
              onHeightRuntimeChange: function (runtime) {
                heightEvents.push(JSON.parse(JSON.stringify(runtime)));
              }
            };
          },
          template: '<div id="height-parent" :style="{ height: hostHeight + \\'px\\', boxSizing: \\'border-box\\', paddingTop: \\'10px\\', paddingBottom: \\'10px\\', borderTop: \\'5px solid transparent\\', borderBottom: \\'5px solid transparent\\' }"><SingleGrid v-if="showHeightGrid" id="height-grid" v-model="layout" :width="720" :cols="6" :row-height="20" :margin="[5, 5]" :container-padding="[10, 10]" height-mode="fit" :auto-measure-container-height="true" render-precision="subpixel" :layout-engine="false" :persistence="heightPersistence" @heightRuntimeChange="onHeightRuntimeChange"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid></div>'
        }).mount('#height');

        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            return {
              layout: ref([
                { i: 'fixed-a', x: 0, y: 0, w: 2, h: 2 },
                { i: 'fixed-b', x: 0, y: 3, w: 2, h: 2 }
              ])
            };
          },
          template: '<SingleGrid id="fixed-grid" v-model="layout" :width="720" :cols="6" :row-height="30" height-mode="fixed" :container-height="180" :layout-engine="false"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#height-fixed');

        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            return {
              layout: ref([
                { i: 'scroll-a', x: 0, y: 0, w: 2, h: 2 },
                { i: 'scroll-b', x: 0, y: 3, w: 2, h: 2 }
              ])
            };
          },
          template: '<SingleGrid id="scroll-grid" v-model="layout" :width="720" :cols="6" :row-height="30" height-mode="scroll" :container-height="180" :layout-engine="false"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#height-scroll');

        var blockedLayout = ref([
          { i: 'block-a', x: 0, y: 0, w: 2, h: 2 },
          { i: 'block-b', x: 2, y: 0, w: 2, h: 2 }
        ]);
        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () { return { layout: blockedLayout }; },
          template: '<SingleGrid v-model="layout" :width="720" :cols="6" :rowHeight="30" :layoutEngine="false" :preventCollision="true"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#blocked');

        var dropLayout = ref([
          { i: 'drop-base', x: 0, y: 0, w: 2, h: 2 }
        ]);
        var dropMode = ref('reject');
        var dropEvents = [];
        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            return {
              layout: dropLayout,
              dropMode: dropMode,
              onDropDragOver: function (event) {
                dropEvents.push({ type: 'dropDragOver', eventType: event.type, mode: dropMode.value });
                if (dropMode.value === 'reject') return false;
                if (dropMode.value === 'sized') return { w: 2, h: 3 };
                return undefined;
              },
              onDrop: function (layout, event, item) {
                dropEvents.push({
                  type: 'drop',
                  eventType: event.type,
                  layout: cloneLayout(layout),
                  item: normalizeItem(item)
                });
              }
            };
          },
          template: '<SingleGrid v-model="layout" :width="720" :cols="6" :rowHeight="30" :layoutEngine="false" :isDroppable="true" :droppingItem="{ i: \\'drop-a\\', w: 1, h: 1 }" @dropDragOver="onDropDragOver" @drop="onDrop"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#drop');

        var responsiveLayouts = ref({
          lg: [
            { i: 'r-a', x: 0, y: 0, w: 2, h: 2 },
            { i: 'r-b', x: 3, y: 0, w: 2, h: 2 }
          ]
        });
        var responsiveEvents = [];
        createApp({
          components: { ResponsiveGrid: ResponsiveGrid },
          setup: function () {
            return {
              layouts: responsiveLayouts,
              onResponsiveDragStop: function () {
                responsiveEvents.push(normalizeInteraction('dragStop', Array.prototype.slice.call(arguments)));
              }
            };
          },
          template: '<ResponsiveGrid id="responsive-contract-grid" data-responsive-probe="yes" aria-label="Responsive contract grid" class="responsive-contract-class" v-model:layouts="layouts" :width="720" :layoutEngine="false" @dragStop="onResponsiveDragStop"><div v-for="item in layouts.lg" :key="item.i">{{ item.i }}</div></ResponsiveGrid>'
        }).mount('#responsive-contract');

        window.__gridContractTest = {
          contractLayout: function () { return cloneLayout(contractLayout.value); },
          contractEvents: function () { return contractEvents.slice(); },
          contractEventTypes: function () { return contractEvents.map(function (event) { return event.type; }); },
          clearContractEvents: function () { contractEvents.length = 0; },
          contractRoot: function () {
            var el = document.querySelector('#contract .vue-grid-layout');
            return {
              id: el.getAttribute('id'),
              dataProbe: el.getAttribute('data-probe'),
              ariaLabel: el.getAttribute('aria-label'),
              className: el.className,
              hasContractClass: el.classList.contains('contract-class'),
              borderTopWidth: getComputedStyle(el).borderTopWidth
            };
          },
          heightProbe: function () {
            var root = document.querySelector('#height .vue-grid-layout');
            var item = document.querySelector('#height .vue-grid-item');
            if (!root || !item) return { mounted: false, events: heightEvents.slice(), saveCount: heightSaveCount };
            var rootRect = root.getBoundingClientRect();
            var itemRect = item.getBoundingClientRect();
            var latest = heightEvents[heightEvents.length - 1] || null;
            return {
              mounted: true,
              rootHeight: rootRect.height,
              rootStyleHeight: getComputedStyle(root).height,
              itemHeight: itemRect.height,
              itemTop: itemRect.top - rootRect.top,
              latest: latest,
              events: heightEvents.slice(),
              saveCount: heightSaveCount
            };
          },
          heightAlignmentProbe: function () {
            var root = document.querySelector('#height .vue-grid-layout');
            var item = Array.prototype.slice.call(document.querySelectorAll('#height .vue-grid-item')).find(function (entry) {
              return !entry.classList.contains('vue-grid-placeholder');
            });
            var placeholder = document.querySelector('#height .vue-grid-placeholder');
            if (!root || !item || !placeholder) return null;
            var rootRect = root.getBoundingClientRect();
            var itemRect = item.getBoundingClientRect();
            var placeholderRect = placeholder.getBoundingClientRect();
            function relative(rect) {
              return {
                left: rect.left - rootRect.left,
                top: rect.top - rootRect.top,
                width: rect.width,
                height: rect.height
              };
            }
            return {
              item: relative(itemRect),
              placeholder: relative(placeholderRect)
            };
          },
          fixedScrollProbe: function () {
            var fixed = document.querySelector('#height-fixed .vue-grid-layout');
            var scroll = document.querySelector('#height-scroll .vue-grid-layout');
            return {
              fixedHeight: fixed && getComputedStyle(fixed).height,
              fixedOverflow: fixed && getComputedStyle(fixed).overflow,
              scrollHeight: scroll && getComputedStyle(scroll).height,
              scrollOverflow: scroll && getComputedStyle(scroll).overflow
            };
          },
          resizeHeightParent: function (height) {
            heightHostHeight.value = height;
            return nextTick();
          },
          unmountHeightGrid: function () {
            showHeightGrid.value = false;
            return nextTick();
          },
          blockedProbe: function () {
            var item = document.querySelector('#blocked .vue-grid-item');
            var placeholder = document.querySelector('#blocked .vue-grid-placeholder');
            return {
              itemBlocked: item ? item.classList.contains('drag-blocked') : false,
              placeholderBlocked: placeholder ? placeholder.classList.contains('placeholder-blocked') : false
            };
          },
          setDropMode: function (mode) { dropMode.value = mode; },
          dropEvents: function () { return dropEvents.slice(); },
          dropProbe: function () {
            var placeholder = document.querySelector('#drop .vue-grid-placeholder');
            var dropTarget = document.querySelector('#drop .editor-drop-target, #drop .dropping');
            return {
              placeholder: placeholder ? {
                blocked: placeholder.classList.contains('placeholder-blocked'),
                text: placeholder.textContent
              } : null,
              hasDropTarget: !!dropTarget
            };
          },
          responsiveEvents: function () { return responsiveEvents.slice(); },
          responsiveRoot: function () {
            var el = document.querySelector('#responsive-contract .vue-grid-layout');
            return {
              id: el.getAttribute('id'),
              dataProbe: el.getAttribute('data-responsive-probe'),
              ariaLabel: el.getAttribute('aria-label'),
              className: el.className,
              hasResponsiveClass: el.classList.contains('responsive-contract-class')
            };
          }
        };
      })();
    </script>
  </body>
</html>`;

const contentType = filePath => {
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.html')) return 'text/html';
  return 'application/octet-stream';
};

const createServer = () => new Promise(resolve => {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    if (requestUrl.pathname === '/grid-contract-test') {
      response.writeHead(200, { 'content-type': 'text/html' });
      response.end(html);
      return;
    }
    if (requestUrl.pathname === '/favicon.ico') {
      response.writeHead(204);
      response.end();
      return;
    }
    const filePath = path.resolve(root, requestUrl.pathname.slice(1));
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });
  server.listen(0, '127.0.0.1', () => resolve(server));
});

const closeServer = server => new Promise(resolve => server.close(resolve));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function dragBy(page, selector, dx, dy, options = {}) {
  const box = await page.$eval(selector, element => {
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  });
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.mouse.move(box.x + dx, box.y + dy, { steps: options.steps || 8 });
  if (options.hold) return box;
  await page.mouse.up();
  return box;
}

async function resizeBy(page, handleSelector, dx, dy) {
  const box = await page.$eval(handleSelector, element => {
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  });
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.mouse.move(box.x + dx, box.y + dy, { steps: 8 });
  await page.mouse.up();
}

async function dispatchGridDragEvent(page, selector, type, offset) {
  await page.$eval(selector, (grid, eventType, pointOffset) => {
    const rect = grid.getBoundingClientRect();
    grid.dispatchEvent(new DragEvent(eventType, {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + pointOffset.x,
      clientY: rect.top + pointOffset.y
    }));
  }, type, offset);
}

async function main() {
  const server = await createServer();
  const port = server.address().port;
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    headless: 'new',
    ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(7000);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message || String(error)));
    page.on('console', message => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });

    await page.goto(`http://127.0.0.1:${port}/grid-contract-test`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__gridContractTest);
    assert.deepEqual(pageErrors, []);

    const root = await page.evaluate(() => window.__gridContractTest.contractRoot());
    assert.equal(root.hasContractClass, true);
    assert.equal(root.borderTopWidth, '7px');
    assert.equal(root.id, 'contract-grid');
    assert.equal(root.dataProbe, 'single');
    assert.equal(root.ariaLabel, 'Contract grid');

    await page.waitForFunction(() => {
      var probe = window.__gridContractTest.heightProbe();
      return probe.latest && probe.latest.effectiveHeightMode === 'fit' && probe.rootHeight === 210;
    });
    let heightProbe = await page.evaluate(() => window.__gridContractTest.heightProbe());
    assert.equal(heightProbe.latest.containerHeight, 210);
    assert.equal(heightProbe.latest.rowHeight, 92.5);
    assert.equal(heightProbe.latest.renderPrecision, 'subpixel');
    assert.equal(heightProbe.itemHeight, 190);
    assert.equal(heightProbe.itemTop, 10);
    const fixedScrollProbe = await page.evaluate(() => window.__gridContractTest.fixedScrollProbe());
    assert.equal(fixedScrollProbe.fixedHeight, '180px');
    assert.equal(fixedScrollProbe.fixedOverflow, 'hidden');
    assert.equal(fixedScrollProbe.scrollHeight, '180px');
    assert.equal(fixedScrollProbe.scrollOverflow, 'auto');

    await page.evaluate(() => window.__gridContractTest.resizeHeightParent(300));
    await page.waitForFunction(() => {
      var probe = window.__gridContractTest.heightProbe();
      return probe.latest && probe.latest.containerHeight === 270;
    });
    await page.waitForFunction(() => {
      var probe = window.__gridContractTest.heightProbe();
      return Math.abs(probe.rootHeight - probe.latest.containerHeight) < 1;
    });
    heightProbe = await page.evaluate(() => window.__gridContractTest.heightProbe());
    assert.ok(Math.abs(heightProbe.rootHeight - 270) <= 1);
    assert.ok(Math.abs(heightProbe.itemHeight - 250) <= 1);
    await wait(80);
    assert.equal((await page.evaluate(() => window.__gridContractTest.heightProbe())).saveCount, 0);

    await dragBy(page, '#height .vue-grid-item', 117.5, 127.5, { hold: true, steps: 10 });
    await page.waitForFunction(() => window.__gridContractTest.heightAlignmentProbe() !== null);
    const heightAlignment = await page.evaluate(() => window.__gridContractTest.heightAlignmentProbe());
    assert.notEqual(heightAlignment.item.left, Math.round(heightAlignment.item.left));
    assert.notEqual(heightAlignment.item.top, Math.round(heightAlignment.item.top));
    assert.ok(Math.abs(heightAlignment.item.width - heightAlignment.placeholder.width) <= 1, JSON.stringify(heightAlignment));
    assert.ok(Math.abs(heightAlignment.item.height - heightAlignment.placeholder.height) <= 1, JSON.stringify(heightAlignment));
    await page.mouse.up();

    const eventCountBeforeUnmount = await page.evaluate(() => window.__gridContractTest.heightProbe().events.length);
    await page.evaluate(() => window.__gridContractTest.unmountHeightGrid());
    await page.waitForFunction(() => window.__gridContractTest.heightProbe().mounted === false);
    await page.evaluate(() => window.__gridContractTest.resizeHeightParent(330));
    await wait(80);
    assert.equal(
      await page.evaluate(() => window.__gridContractTest.heightProbe().events.length),
      eventCountBeforeUnmount
    );

    await page.evaluate(() => window.__gridContractTest.clearContractEvents());
    await dragBy(page, '#contract .vue-grid-item', 130, 10, { hold: true });
    await page.waitForFunction(() => window.__gridContractTest.contractEventTypes().includes('drag'));
    assert.equal(
      await page.evaluate(() => window.__gridContractTest.contractEventTypes().includes('layoutChange')),
      false
    );
    await page.mouse.up();
    await page.waitForFunction(() => window.__gridContractTest.contractEventTypes().includes('dragStop'));
    await page.waitForFunction(() => window.__gridContractTest.contractEventTypes().includes('layoutChange'));

    let events = await page.evaluate(() => window.__gridContractTest.contractEvents());
    const dragStart = events.find(event => event.type === 'dragStart');
    const drag = events.find(event => event.type === 'drag');
    const dragStop = events.find(event => event.type === 'dragStop');
    assert.equal(dragStart.oldItem.i, 'a');
    assert.equal(dragStart.item.i, 'a');
    assert.equal(dragStart.placeholder, null);
    assert.ok(['mousemove', 'pointermove'].includes(drag.eventType));
    assert.equal(drag.placeholder.placeholder, true);
    assert.equal(drag.nodeClass.indexOf('vue-grid-item') >= 0, true);
    assert.equal(dragStop.placeholder, null);
    assert.ok(events.findIndex(event => event.type === 'dragStop') < events.findIndex(event => event.type === 'layoutChange'));
    assert.ok(events.findIndex(event => event.type === 'layoutChange') < events.findIndex(event => event.type === 'update:modelValue'));

    await page.evaluate(() => window.__gridContractTest.clearContractEvents());
    await resizeBy(page, '#contract .vue-grid-item .vue-resizable-handle-se', 90, 55);
    await page.waitForFunction(() => window.__gridContractTest.contractEventTypes().includes('resizeStop'));
    events = await page.evaluate(() => window.__gridContractTest.contractEvents());
    const resizeStart = events.find(event => event.type === 'resizeStart');
    const resize = events.find(event => event.type === 'resize');
    const resizeStop = events.find(event => event.type === 'resizeStop');
    assert.equal(resizeStart.oldItem.i, 'a');
    assert.equal(resizeStart.item.i, 'a');
    assert.equal(resizeStart.placeholder, null);
    assert.ok(['mousemove', 'pointermove'].includes(resize.eventType));
    assert.equal(resize.placeholder.static, true);
    assert.equal(resizeStop.placeholder, null);

    await dragBy(page, '#blocked .vue-grid-item', 240, 0, { hold: true, steps: 12 });
    await page.waitForFunction(() => {
      const probe = window.__gridContractTest.blockedProbe();
      return probe.itemBlocked || probe.placeholderBlocked;
    });
    const blockedProbe = await page.evaluate(() => window.__gridContractTest.blockedProbe());
    assert.equal(blockedProbe.itemBlocked || blockedProbe.placeholderBlocked, true);
    await page.mouse.up();

    await dispatchGridDragEvent(page, '#drop .vue-grid-layout', 'dragenter', { x: 40, y: 40 });
    await dispatchGridDragEvent(page, '#drop .vue-grid-layout', 'dragover', { x: 40, y: 40 });
    await wait(50);
    assert.equal((await page.evaluate(() => window.__gridContractTest.dropProbe())).placeholder, null);

    await page.evaluate(() => window.__gridContractTest.setDropMode('sized'));
    await dispatchGridDragEvent(page, '#drop .vue-grid-layout', 'dragenter', { x: 80, y: 40 });
    await dispatchGridDragEvent(page, '#drop .vue-grid-layout', 'dragover', { x: 80, y: 40 });
    await page.waitForSelector('#drop .vue-grid-placeholder');
    await dispatchGridDragEvent(page, '#drop .vue-grid-layout', 'drop', { x: 80, y: 40 });
    await page.waitForFunction(() => window.__gridContractTest.dropEvents().some(event => event.type === 'drop'));
    const dropEvents = await page.evaluate(() => window.__gridContractTest.dropEvents());
    assert.deepEqual(dropEvents.map(event => event.type), ['dropDragOver', 'dropDragOver', 'drop']);
    assert.deepEqual(dropEvents[2].item, {
      i: 'drop-a',
      x: 0,
      y: 2,
      w: 2,
      h: 3,
      placeholder: false,
      static: false
    });

    const responsiveRoot = await page.evaluate(() => window.__gridContractTest.responsiveRoot());
    assert.equal(responsiveRoot.id, 'responsive-contract-grid');
    assert.equal(responsiveRoot.dataProbe, 'yes');
    assert.equal(responsiveRoot.ariaLabel, 'Responsive contract grid');
    assert.equal(responsiveRoot.hasResponsiveClass, true);
    await dragBy(page, '#responsive-contract .vue-grid-item', 130, 10);
    await page.waitForFunction(() => window.__gridContractTest.responsiveEvents().length > 0);
    const responsiveEvents = await page.evaluate(() => window.__gridContractTest.responsiveEvents());
    assert.equal(responsiveEvents[0].type, 'dragStop');
    assert.equal(responsiveEvents[0].oldItem.i, 'r-a');
    assert.equal(responsiveEvents[0].placeholder, null);
  } finally {
    if (browser.isConnected()) await browser.close();
    await closeServer(server);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
