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
      .test-host { width: 760px; margin-bottom: 24px; }
      .vue-grid-item { background: #eef4fb; border: 1px solid #7894b6; box-sizing: border-box; }
      .vue-grid-item > div { height: 100%; display: grid; place-items: center; user-select: none; }
    </style>
  </head>
  <body>
    <div id="dashboard-responsive" class="test-host"></div>
    <script src="/example/vue-3.2.36.js"></script>
    <script src="/build/web/vue-grid-layout.min.js"></script>
    <script>
      (function () {
        var Vue = window.Vue;
        var VGL = window.VueGridLayout;
        var DashboardGrid = VGL.DashboardResponsiveVueGridLayout;
        var createApp = Vue.createApp;
        var ref = Vue.ref;
        var nextTick = Vue.nextTick;
        var documentRef = ref(VGL.serializeDashboardLayoutDocument({
          widgets: {
            a: { col: 0, row: 0, sizeX: 3, sizeY: 2, mobileOrder: 1 },
            b: { col: 3, row: 0, sizeX: 3, sizeY: 2 }
          },
          gridSettings: { columns: 12, rowHeight: 28, heightMode: 'fit', renderPrecision: 'subpixel', minRowHeight: 10 },
          profiles: {
            mobile: {
              widgets: {
                a: { mobileOrder: 0, mobileHeight: 3 },
                b: { mobileHide: true }
              },
              gridSettings: { viewFormat: 'list', columns: 4, rowHeight: 24, mobileRowHeight: 18, mobileHeightMode: 'scroll', renderPrecision: 'subpixel' }
            }
          }
        }, {
          key: 'dashboard-responsive-browser',
          revision: function () { return 'browser-rev'; },
          now: function () { return new Date('2026-05-19T00:00:00.000Z'); }
        }));
        var width = ref(1200);
        var mode = ref('view');
        var events = [];
        var documents = [];
        var breakpoints = { mobile: 0, desktop: 960 };

        function record(type) {
          return function () {
            events.push({ type: type, args: Array.prototype.slice.call(arguments) });
          };
        }

        createApp({
          components: { DashboardGrid: DashboardGrid },
          setup: function () {
            return {
              documentRef: documentRef,
              width: width,
              mode: mode,
              breakpoints: breakpoints,
              targetViewRule: { mobileBreakpointIds: ['mobile'] },
              onUpdateDocument: function (document) {
                var depth = 0;
                while (document && document.value && depth < 5) {
                  document = document.value;
                  depth += 1;
                }
                documentRef.value = document;
                documents.push(document);
              },
              onDocumentChange: record('documentChange'),
              onBreakpointChange: record('breakpointChange'),
              onProfileChange: record('profileChange'),
              onProjectionChange: record('projectionChange'),
              onDiagnosticsChange: record('diagnosticsChange'),
              onDragStop: record('dragStop')
            };
          },
          template: '<DashboardGrid class="dashboard-responsive-grid" :document="documentRef.value || documentRef" :width="width" :breakpoints="breakpoints" :targetViewRule="targetViewRule" :mode="mode" :layoutEngine="false" height-mode="fixed" :container-height="360" :row-height="0" render-precision="integer" @documentChange="onDocumentChange" @breakpointChange="onBreakpointChange" @profileChange="onProfileChange" @projectionChange="onProjectionChange" @diagnosticsChange="onDiagnosticsChange" @dragStop="onDragStop" @update:document="onUpdateDocument"><div key="a">A</div><div key="b">B</div><div key="ghost">Ghost</div></DashboardGrid>'
        }).mount('#dashboard-responsive');

        window.__dashboardResponsiveTest = {
          itemTexts: function () {
            return Array.prototype.slice.call(document.querySelectorAll('#dashboard-responsive .vue-grid-item')).map(function (item) {
              return item.textContent.trim();
            });
          },
          events: function () { return events.map(function (event) { return event.type; }); },
          diagnostics: function () {
            var event = events.filter(function (entry) { return entry.type === 'diagnosticsChange'; }).slice(-1)[0];
            var payload = event ? event.args[0] : null;
            return payload && payload.diagnostics ? payload.diagnostics : (payload || []);
          },
          allDiagnostics: function () {
            return events.filter(function (entry) { return entry.type === 'diagnosticsChange'; }).reduce(function (items, entry) {
              var payload = entry.args[0];
              var diagnostics = payload && payload.diagnostics ? payload.diagnostics : (payload || []);
              return items.concat(diagnostics);
            }, []);
          },
          diagnosticsPayload: function () {
            var event = events.filter(function (entry) { return entry.type === 'diagnosticsChange'; }).slice(-1)[0];
            return event ? event.args[0] : null;
          },
          latestProjection: function () {
            var event = events.filter(function (entry) { return entry.type === 'projectionChange'; }).slice(-1)[0];
            var payload = event ? event.args[0] : null;
            return payload && payload.runtime ? payload.runtime : null;
          },
          rootProbe: function () {
            var el = document.querySelector('#dashboard-responsive .vue-grid-layout');
            return {
              height: el && getComputedStyle(el).height,
              overflow: el && getComputedStyle(el).overflow,
              itemHeight: document.querySelector('#dashboard-responsive .vue-grid-item') && document.querySelector('#dashboard-responsive .vue-grid-item').getBoundingClientRect().height
            };
          },
          documentUpdates: function () { return documents.length; },
          latestDocument: function () {
            if (documents.length > 0) return documents[documents.length - 1];
            var value = documentRef.value;
            var depth = 0;
            while (value && value.value && depth < 5) {
              value = value.value;
              depth += 1;
            }
            return value;
          },
          setMobile: function () {
            width.value = 390;
            return nextTick();
          },
          setEdit: function () {
            mode.value = 'edit';
            return nextTick();
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
    if (requestUrl.pathname === '/dashboard-responsive-test') {
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

async function dragBy(page, selector, dx, dy) {
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
  await page.mouse.move(box.x + dx, box.y + dy, { steps: 8 });
  await page.mouse.up();
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

    await page.goto(`http://127.0.0.1:${port}/dashboard-responsive-test`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__dashboardResponsiveTest);
    assert.deepEqual(pageErrors, []);

    assert.deepEqual(await page.evaluate(() => window.__dashboardResponsiveTest.itemTexts()), ['A', 'B']);
    let diagnostics = await page.evaluate(() => window.__dashboardResponsiveTest.diagnostics());
    const diagnosticsPayload = await page.evaluate(() => window.__dashboardResponsiveTest.diagnosticsPayload());
    assert.equal(diagnosticsPayload.type, 'diagnosticsChange');
    assert.equal(
      (await page.evaluate(() => window.__dashboardResponsiveTest.allDiagnostics()))
        .some(item => item.code === 'slot-widget-mismatch' && item.itemId === 'ghost'),
      true
    );
    await page.waitForFunction(() => window.__dashboardResponsiveTest.rootProbe().height === '360px');
    await page.waitForFunction(() =>
      window.__dashboardResponsiveTest.allDiagnostics().some(function (item) {
        return item.code === 'invalid-row-height';
      })
    );
    await page.waitForFunction(() => {
      var runtime = window.__dashboardResponsiveTest.latestProjection();
      return runtime &&
        runtime.heightRuntime &&
        runtime.heightRuntime.requestedHeightMode === 'fixed';
    });
    const desktopRuntime = await page.evaluate(() => window.__dashboardResponsiveTest.latestProjection());
    assert.equal(desktopRuntime.heightOptions.heightMode, 'fit');
    assert.equal(desktopRuntime.heightRuntime.requestedHeightMode, 'fixed');
    assert.equal(desktopRuntime.heightRuntime.effectiveHeightMode, 'fixed');
    assert.equal(desktopRuntime.heightRuntime.rowHeight, 150);
    assert.equal(desktopRuntime.heightRuntime.renderPrecision, 'integer');
    diagnostics = await page.evaluate(() => window.__dashboardResponsiveTest.allDiagnostics());
    assert.equal(diagnostics.some(item =>
      item.code === 'invalid-row-height' &&
      item.details &&
      item.details.source === 'grid-height-runtime' &&
      item.details.prop === 'rowHeight'
    ), true);
    let rootProbe = await page.evaluate(() => window.__dashboardResponsiveTest.rootProbe());
    assert.equal(rootProbe.height, '360px');
    assert.equal(rootProbe.overflow, 'hidden');

    await page.evaluate(() => window.__dashboardResponsiveTest.setMobile());
    await page.waitForFunction(() => window.__dashboardResponsiveTest.itemTexts().join(',') === 'A');
    await page.waitForFunction(() => {
      var runtime = window.__dashboardResponsiveTest.latestProjection();
      return runtime && runtime.heightOptions && runtime.heightOptions.heightMode === 'scroll';
    });
    const mobileRuntime = await page.evaluate(() => window.__dashboardResponsiveTest.latestProjection());
    assert.equal(mobileRuntime.heightOptions.rowHeight, 18);
    rootProbe = await page.evaluate(() => window.__dashboardResponsiveTest.rootProbe());
    assert.equal(rootProbe.height, '360px');
    const eventTypes = await page.evaluate(() => window.__dashboardResponsiveTest.events());
    assert.ok(eventTypes.indexOf('breakpointChange') < eventTypes.indexOf('profileChange'));
    assert.ok(eventTypes.includes('projectionChange'));

    await page.evaluate(() => window.__dashboardResponsiveTest.setEdit());
    await page.waitForFunction(() => window.__dashboardResponsiveTest.itemTexts().join(',') === 'A,B');
    await dragBy(page, '#dashboard-responsive .vue-grid-item', 120, 0);
    await page.waitForFunction(() => window.__dashboardResponsiveTest.events().includes('dragStop'));
    await page.waitForFunction(() => window.__dashboardResponsiveTest.documentUpdates() > 0);
    const latest = await page.evaluate(() => window.__dashboardResponsiveTest.latestDocument());
    const latestDocument = latest && latest.value ? latest.value : latest;
    assert.equal(Boolean(latestDocument.layouts.default.profiles.mobile.widgets.a.mobileHeight), true);
    assert.deepEqual(pageErrors, []);
  } finally {
    await browser.close();
    await closeServer(server);
  }
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
