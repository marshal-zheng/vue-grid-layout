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
      body { margin: 0; padding: 16px; }
      .test-host { width: 1200px; margin-bottom: 24px; }
      .vue-grid-item { background: #dfe7f3; border: 1px solid #8aa0bd; box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div id="single" class="test-host"></div>
    <div id="responsive" class="test-host"></div>
    <div id="drag" class="test-host"></div>
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

        var cloneLayout = function (layout) {
          return layout.map(function (item) { return Object.assign({}, item); });
        };
        var cloneLayouts = function (layouts) {
          var out = {};
          Object.keys(layouts).forEach(function (key) {
            out[key] = cloneLayout(layouts[key]);
          });
          return out;
        };

        var initial = [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }];
        var restored = [{ i: 'a', x: 4, y: 0, w: 2, h: 2 }];
        var external = [{ i: 'a', x: 7, y: 0, w: 2, h: 2 }];
        var responsiveInitial = { lg: [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }] };
        var responsiveRestored = { lg: [{ i: 'a', x: 3, y: 0, w: 2, h: 2 }] };
        var responsiveExternal = { lg: [{ i: 'a', x: 8, y: 0, w: 2, h: 2 }] };

        var singleAdapter = VGL.memoryPersistenceAdapter({
          single: VGL.serializeLayoutDocument(restored, {
            key: 'single',
            kind: 'layout',
            sourceId: 'seed-single',
            revision: function () { return 'single-seed'; },
            now: function () { return new Date('2026-05-09T00:00:00.000Z'); }
          })
        });
        var responsiveAdapter = VGL.memoryPersistenceAdapter({
          responsive: VGL.serializeLayoutDocument(responsiveRestored, {
            key: 'responsive',
            kind: 'responsive',
            sourceId: 'seed-responsive',
            revision: function () { return 'responsive-seed'; },
            now: function () { return new Date('2026-05-09T00:00:00.000Z'); }
          })
        });

        var singleLayout = ref(cloneLayout(initial));
        var responsiveLayouts = ref(cloneLayouts(responsiveInitial));
        var dragLayout = ref([
          { i: 'a', x: 0, y: 0, w: 2, h: 2 },
          { i: 'b', x: 2, y: 0, w: 2, h: 2 }
        ]);
        var dragSaves = [];
        var results = {
          singleEvents: [],
          responsiveEvents: [],
          dragExecutorCalls: []
        };

        var dragAdapter = {
          load: function () { return null; },
          save: function (_key, document) {
            dragSaves.push(document);
          },
          remove: function () {}
        };

        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            return {
              layout: singleLayout,
              persistence: {
                key: 'single',
                adapter: singleAdapter,
                autoSave: false,
                onEvent: function (event) { results.singleEvents.push(event.type); }
              }
            };
          },
          template: '<SingleGrid v-model="layout" :width="1200" :cols="12" :rowHeight="30" :persistence="persistence"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#single');

        createApp({
          components: { ResponsiveGrid: ResponsiveGrid },
          setup: function () {
            return {
              layouts: responsiveLayouts,
              persistence: {
                key: 'responsive',
                adapter: responsiveAdapter,
                autoSave: false,
                onEvent: function (event) { results.responsiveEvents.push(event.type); }
              }
            };
          },
          template: '<ResponsiveGrid v-model:layouts="layouts" :width="1200" :persistence="persistence"><div v-for="item in layouts.lg" :key="item.i">{{ item.i }}</div></ResponsiveGrid>'
        }).mount('#responsive');

        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            var layoutEngine = {
              scheduler: { mode: 'commitOnly' },
              executor: {
                kind: 'custom',
                available: function () { return true; },
                execute: function (request) {
                  results.dragExecutorCalls.push({
                    phase: request.phase,
                    type: request.operation.type
                  });
                  return Promise.resolve(VGL.layoutEngine.executeLayoutOperation(Object.assign({}, request, {
                    options: Object.assign({}, request.options, { executor: undefined })
                  })));
                }
              }
            };
            return {
              layout: dragLayout,
              persistence: {
                key: 'drag',
                adapter: dragAdapter,
                debounceMs: 30
              },
              layoutEngine: layoutEngine
            };
          },
          template: '<SingleGrid v-model="layout" :width="1200" :cols="12" :rowHeight="30" :persistence="persistence" :layoutEngine="layoutEngine"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#drag');

        window.__persistenceTest = {
          singleLayout: function () { return cloneLayout(singleLayout.value); },
          responsiveLayouts: function () { return cloneLayouts(responsiveLayouts.value); },
          singleEvents: function () { return results.singleEvents.slice(); },
          responsiveEvents: function () { return results.responsiveEvents.slice(); },
          dragSaveCount: function () { return dragSaves.length; },
          dragExecutorCalls: function () { return results.dragExecutorCalls.slice(); },
          saveExternalSingle: function () {
            return singleAdapter.save('single', VGL.serializeLayoutDocument(external, {
              key: 'single',
              kind: 'layout',
              sourceId: 'external-single',
              revision: function () { return 'single-external'; },
              now: function () { return new Date('2026-05-09T00:00:10.000Z'); }
            }));
          },
          saveExternalResponsive: function () {
            return responsiveAdapter.save('responsive', VGL.serializeLayoutDocument(responsiveExternal, {
              key: 'responsive',
              kind: 'responsive',
              sourceId: 'external-responsive',
              revision: function () { return 'responsive-external'; },
              now: function () { return new Date('2026-05-09T00:00:10.000Z'); }
            }));
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
    if (requestUrl.pathname === '/component-test') {
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
    page.setDefaultTimeout(5000);
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message || String(error));
    });
    page.on('console', message => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${port}/component-test`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__persistenceTest);
    assert.deepEqual(pageErrors, []);

    await page.waitForFunction(() => window.__persistenceTest.singleLayout()[0].x === 4);
    assert.deepEqual(await page.evaluate(() => window.__persistenceTest.singleEvents()), ['load-start', 'load-success']);

    await page.evaluate(() => window.__persistenceTest.saveExternalSingle());
    await page.waitForFunction(() => window.__persistenceTest.singleLayout()[0].x === 7);
    assert.ok((await page.evaluate(() => window.__persistenceTest.singleEvents())).includes('external-apply'));

    await page.waitForFunction(() => window.__persistenceTest.responsiveLayouts().lg[0].x === 3);
    assert.deepEqual(await page.evaluate(() => window.__persistenceTest.responsiveEvents()), ['load-start', 'load-success']);

    await page.evaluate(() => window.__persistenceTest.saveExternalResponsive());
    await page.waitForFunction(() => window.__persistenceTest.responsiveLayouts().lg[0].x === 8);
    assert.ok((await page.evaluate(() => window.__persistenceTest.responsiveEvents())).includes('external-apply'));

    const box = await page.$eval('#drag .vue-grid-item', element => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });

    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 20, { steps: 8 });
    await wait(100);
    assert.equal(await page.evaluate(() => window.__persistenceTest.dragSaveCount()), 0);
    await page.mouse.up();
    await page.waitForFunction(() => window.__persistenceTest.dragSaveCount() > 0);
    const dragExecutorCalls = await page.evaluate(() => window.__persistenceTest.dragExecutorCalls());
    assert.ok(dragExecutorCalls.some(call => call.phase === 'commit' && call.type === 'move'));
    assert.equal(dragExecutorCalls.some(call => call.phase === 'preview'), false);
  } finally {
    if (browser.isConnected()) await browser.close();
    await closeServer(server);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
