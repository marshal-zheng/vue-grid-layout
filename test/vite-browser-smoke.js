'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');

const defaultDemos = [
  'basic',
  'responsive',
  'persistence',
  'editor',
  'dashboard-runtime',
  'dashboard-shell',
  'placement',
  'migration',
  'worker'
];

async function createViteServer() {
  const { createServer } = await import('vite');
  const server = await createServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: {
      host: '127.0.0.1',
      port: 0,
      strictPort: false
    },
    logLevel: 'error'
  });
  await server.listen();
  return server;
}

async function launchHeadlessBrowser() {
  const systemChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const executableCandidates = process.env.PUPPETEER_EXECUTABLE_PATH
    ? [process.env.PUPPETEER_EXECUTABLE_PATH]
    : [undefined, fs.existsSync(systemChromePath) ? systemChromePath : undefined];
  let lastError;

  for (const executablePath of executableCandidates) {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-grid-layout-browser-smoke-'));
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        ...(executablePath ? { executablePath } : {}),
        userDataDir,
        args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      });
      return { browser, userDataDir };
    } catch (error) {
      lastError = error;
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  }

  throw lastError;
}

async function getDynamicDemoItems(page) {
  return page.$$eval(
    '.vue-grid-item:not(.vue-grid-placeholder)',
    nodes => nodes.map(node => (node.textContent || '').trim())
  );
}

async function microMoveClick(page, selector) {
  const target = await page.$(selector);
  assert.ok(target, `${selector} should exist`);
  const box = await target.boundingBox();
  assert.ok(box, `${selector} should be visible`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 1, y + 1);
  await page.mouse.up();
}

async function clickElementCenter(page, element, label) {
  await element.evaluate(node => {
    node.scrollIntoView({ block: 'center', inline: 'center' });
    return new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  });
  const box = await element.boundingBox();
  assert.ok(box, `${label} should be visible`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function flushAnimationFrames(page) {
  await page.evaluate(() => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function getDashboardShellWidgetGeometry(page) {
  return page.$$eval('.shell-widget', widgets => {
    const entries = [];
    for (const widget of widgets) {
      const title = widget.querySelector('.widget-title')?.textContent?.trim();
      const geometry = widget.querySelector('.widget-footer span:first-child')?.textContent?.trim();
      if (title && geometry) entries.push([title, geometry]);
    }
    return Object.fromEntries(entries);
  });
}

async function clickDashboardShellButton(page, label) {
  const clicked = await page.evaluate(text => {
    const button = Array.from(document.querySelectorAll('button'))
      .find(node => (node.textContent || '').trim() === text);
    if (!button) return false;
    button.click();
    return true;
  }, label);
  assert.equal(clicked, true, `dashboard shell button ${label} should exist`);
  await flushAnimationFrames(page);
}

async function clickDashboardShellWidget(page, title) {
  const clicked = await page.evaluate(text => {
    const widget = Array.from(document.querySelectorAll('.shell-widget'))
      .find(node => node.querySelector('.widget-title')?.textContent?.trim() === text);
    if (!widget) return false;
    widget.click();
    return true;
  }, title);
  assert.equal(clicked, true, `dashboard shell widget ${title} should exist`);
  await flushAnimationFrames(page);
}

async function getDashboardShellResult(page) {
  return page.$eval('.result-box', node => ({
    title: node.querySelector('strong')?.textContent?.trim() || '',
    rows: Array.from(node.querySelectorAll('span')).map(row => row.textContent?.trim() || '')
  }));
}

async function assertDashboardShellDropWidget(page) {
  await clickDashboardShellButton(page, 'Desktop');
  await clickDashboardShellButton(page, 'Drop widget');
  await page.waitForFunction(() =>
    document.querySelector('.result-box')?.textContent?.includes('External Drop') &&
    document.querySelector('.result-box')?.textContent?.includes('Status: success; source: drop')
  );
  const desktopGeometry = await getDashboardShellWidgetGeometry(page);
  assert.equal(desktopGeometry['Dropped widget'], '0,6 / 3x2');
  assert.equal(Object.keys(desktopGeometry).length, 6);
  let result = await getDashboardShellResult(page);
  assert.equal(result.title, 'External Drop');
  assert.ok(result.rows.includes('Status: success; source: drop'));
  assert.ok(result.rows.includes('Write-back: written; synthetic'));

  await clickDashboardShellButton(page, 'Reset');
  await clickDashboardShellButton(page, 'Mobile');
  await clickDashboardShellButton(page, 'Drop widget');
  await page.waitForFunction(() =>
    document.querySelector('.result-box')?.textContent?.includes('External Drop') &&
    document.querySelector('.result-box')?.textContent?.includes('Status: success; source: drop')
  );
  const mobileGeometry = await getDashboardShellWidgetGeometry(page);
  assert.equal(mobileGeometry['Dropped widget'], '0,15 / 4x2');
  assert.equal(Object.keys(mobileGeometry).length, 6);
  result = await getDashboardShellResult(page);
  assert.equal(result.title, 'External Drop');
  assert.ok(result.rows.includes('Status: success; source: drop'));
  assert.ok(result.rows.includes('Write-back: written; synthetic'));

  await clickDashboardShellButton(page, 'Reset');
  await clickDashboardShellButton(page, 'Desktop');
}

async function assertDashboardShellDogfoodDrag(page) {
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
  await page.waitForSelector('.dashboard-shell-demo .shell-widget .widget-title');
  await flushAnimationFrames(page);
  await clickDashboardShellWidget(page, 'Revenue summary');

  for (let i = 0; i < 4; i += 1) {
    await clickDashboardShellButton(page, 'Drag +1');
  }
  await page.waitForFunction(() => {
    const widgets = Array.from(document.querySelectorAll('.shell-widget'));
    const revenue = widgets.find(widget =>
      widget.querySelector('.widget-title')?.textContent?.trim() === 'Revenue summary'
    );
    return revenue?.querySelector('.widget-footer span:first-child')?.textContent?.trim() === '4,0 / 4x3';
  });

  const beforeBlocked = await getDashboardShellWidgetGeometry(page);
  assert.deepEqual(beforeBlocked, {
    'Revenue summary': '4,0 / 4x3',
    'Health monitor': '8,0 / 4x3',
    'Pipeline table': '4,3 / 4x3',
    'Incident queue': '0,6 / 5x3',
    'Region map': '5,6 / 7x3'
  });

  await clickDashboardShellButton(page, 'Drag +1');
  await page.waitForFunction(() => {
    const result = document.querySelector('.result-box');
    return Boolean(result && (result.textContent || '').includes('Status: blocked; source: pointer'));
  });

  const afterBlocked = await getDashboardShellWidgetGeometry(page);
  assert.deepEqual(afterBlocked, beforeBlocked, 'static dashboard shell obstacle should block Drag +1 without layout drift');
  const result = await getDashboardShellResult(page);
  assert.equal(result.title, 'Pointer Move');
  assert.ok(result.rows.includes('Status: blocked; source: pointer'));
  assert.ok(result.rows.includes('Write-back: none; synthetic'));
  assert.ok(
    await page.$$eval('.diagnostic-row', rows =>
      rows.some(row => (row.textContent || '').includes('shell-command-static-item'))
    ),
    'blocked Drag +1 should expose a static-item diagnostic'
  );
}

async function assertDynamicAddRemoveDemo(page, baseUrl) {
  const url = `${baseUrl}index.html?demo=06-dynamic-add-remove`;

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.vue-grid-item .remove');
  const initialItems = await getDynamicDemoItems(page);
  assert.equal(initialItems.length, 5, 'dynamic demo should start with 5 items');

  await page.click('.vue-grid-item .remove');
  await page.waitForFunction(() =>
    document.querySelectorAll('.vue-grid-item:not(.vue-grid-placeholder)').length === 4
  );

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.vue-grid-item .remove');
  await microMoveClick(page, '.vue-grid-item .remove');
  await page.waitForFunction(() =>
    document.querySelectorAll('.vue-grid-item:not(.vue-grid-placeholder)').length === 4
  );

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.vue-grid-item .add');
  await page.click('.vue-grid-item .add');
  await page.waitForFunction(() => {
    const items = Array.from(document.querySelectorAll('.vue-grid-item:not(.vue-grid-placeholder)'));
    return items.length === 6 && items.some(item => (item.textContent || '').includes('n0'));
  });

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.vue-grid-item .add');
  await microMoveClick(page, '.vue-grid-item .add');
  await page.waitForFunction(() => {
    const items = Array.from(document.querySelectorAll('.vue-grid-item:not(.vue-grid-placeholder)'));
    return items.length === 6 && items.some(item => (item.textContent || '').includes('n0'));
  });
}

async function assertToolboxLayoutModel() {
  const {
    createToolboxLayoutModel,
    getToolboxLayoutView,
    reduceToolboxLayoutModel
  } = await import(pathToFileURL(path.join(root, 'example', 'toolbox-layout-model.mjs')).href);
  const initialLayout = [
    { i: '1', x: 0, y: 0, w: 2, h: 2 },
    { i: '3', x: 2, y: 0, w: 2, h: 2 },
    { i: '4', x: 4, y: 0, w: 2, h: 2, static: true },
    { i: '7', x: 6, y: 0, w: 2, h: 2 }
  ];
  const byId = (layout, id) => layout.find(item => item.i === id);
  let model = createToolboxLayoutModel({ lg: initialLayout });

  model = reduceToolboxLayoutModel(model, {
    type: 'putItem',
    breakpoint: 'lg',
    item: initialLayout[2]
  });
  assert.equal(getToolboxLayoutView(model, 'lg').toolbox.length, 0, 'static items should stay out of the toolbox');

  model = reduceToolboxLayoutModel(model, {
    type: 'putItem',
    breakpoint: 'lg',
    item: initialLayout[1]
  });
  assert.equal(getToolboxLayoutView(model, 'lg').toolbox.length, 1, 'non-static items should enter the toolbox');
  assert.equal(Boolean(byId(getToolboxLayoutView(model, 'lg').layout, '3')), false, 'toolbox items should be hidden');

  model = reduceToolboxLayoutModel(model, {
    type: 'syncLayouts',
    layouts: {
      lg: [
        { i: '1', x: 0, y: 4, w: 2, h: 2 },
        { i: '4', x: 4, y: 0, w: 2, h: 2, static: true },
        { i: '7', x: 6, y: 0, w: 2, h: 2 }
      ]
    }
  });

  model = reduceToolboxLayoutModel(model, {
    type: 'takeItem',
    breakpoint: 'lg',
    item: initialLayout[1]
  });
  const restoredView = getToolboxLayoutView(model, 'lg');
  assert.deepEqual(
    byId(restoredView.layout, '3'),
    initialLayout[1],
    'toolbox items should restore their saved geometry'
  );
  assert.equal(byId(restoredView.layout, '1').y, 4, 'visible layout changes should still sync while another item is hidden');
}

async function getGridItemRects(page) {
  return page.$$eval('.vue-grid-item:not(.vue-grid-placeholder)', nodes => {
    const entries = [];
    for (const node of nodes) {
      const text = node.querySelector('.text')?.textContent || '';
      const id = (text.match(/\d+/) || [])[0];
      if (!id) continue;
      const rect = node.getBoundingClientRect();
      entries.push([
        id,
        {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        }
      ]);
    }
    return Object.fromEntries(entries);
  });
}

async function clickGridItemHideButton(page, id) {
  const items = await page.$$('.vue-grid-item:not(.vue-grid-placeholder)');
  for (const item of items) {
    const text = await item.$eval('.text', node => node.textContent || '').catch(() => '');
    if ((text.match(/\d+/) || [])[0] !== id) continue;
    const button = await item.$('.hide-button');
    assert.ok(button, `grid item ${id} should have a hide button`);
    await clickElementCenter(page, button, `grid item ${id} hide button`);
    return;
  }
  assert.fail(`grid item ${id} should exist`);
}

async function clickToolboxItem(page, id) {
  const buttons = await page.$$('.toolbox__items__item');
  for (const button of buttons) {
    const text = await button.evaluate(node => node.textContent || '');
    if ((text.match(/\d+/) || [])[0] !== id) continue;
    await clickElementCenter(page, button, `toolbox item ${id}`);
    return;
  }
  assert.fail(`toolbox item ${id} should exist`);
}

function assertRestoredRect(actual, expected, message) {
  assert.ok(actual, message);
  assert.equal(actual.width, expected.width, `${message} width`);
  assert.equal(actual.height, expected.height, `${message} height`);
}

async function assertToolboxDemo(page, baseUrl) {
  const url = `${baseUrl}index.html?demo=12-toolbox`;

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.vue-grid-item .hide-button');
  assert.equal(
    await page.$$eval('.vue-grid-item:not(.vue-grid-placeholder)', nodes => nodes.length),
    15,
    'toolbox demo should start with 15 grid items'
  );
  assert.equal(
    await page.$$eval('.vue-grid-item.static .hide-button', nodes => nodes.length),
    0,
    'static toolbox demo items should not render hide buttons'
  );
  assert.ok(
    await page.$$eval('.vue-grid-item.static .text', nodes =>
      nodes.some(node => (node.textContent || '').includes('Static - 4'))
    ),
    'toolbox demo should include deterministic static items'
  );

  const hiddenRects = {};
  for (const [id, expectedToolboxItems] of [['3', 1], ['7', 2]]) {
    hiddenRects[id] = (await getGridItemRects(page))[id];
    await clickGridItemHideButton(page, id);
    await page.waitForFunction(expected => {
      const gridItems = document.querySelectorAll('.vue-grid-item:not(.vue-grid-placeholder)').length;
      const toolboxItems = document.querySelectorAll('.toolbox__items__item').length;
      return gridItems === 15 - expected && toolboxItems === expected;
    }, {}, expectedToolboxItems);
  }

  for (const [id, expectedToolboxItems] of [['3', 1], ['7', 0]]) {
    await clickToolboxItem(page, id);
    await page.waitForFunction(expected => {
      const gridItems = document.querySelectorAll('.vue-grid-item:not(.vue-grid-placeholder)').length;
      const toolboxItems = document.querySelectorAll('.toolbox__items__item').length;
      return gridItems === 15 - expected && toolboxItems === expected;
    }, {}, expectedToolboxItems);
  }

  const restoredRects = await getGridItemRects(page);
  assertRestoredRect(restoredRects['3'], hiddenRects['3'], 'toolbox item 3 should return to the grid');
  assertRestoredRect(restoredRects['7'], hiddenRects['7'], 'toolbox item 7 should return to the grid');
}

async function runBrowserSmoke(options = {}) {
  const demos = options.demos || defaultDemos;
  const server = await createViteServer();
  const baseUrl = server.resolvedUrls.local[0];
  let browser;
  let userDataDir;

  try {
    await assertToolboxLayoutModel();
    ({ browser, userDataDir } = await launchHeadlessBrowser());
    const page = await browser.newPage();
    const requests = [];
    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#container a[href*="?demo=01-VueGridLayout"]');
    const rootText = await page.$eval('#container', node => node.textContent || '');
    assert.ok(rootText.includes('Vue Grid Layout Examples'), 'root path should render the examples list');
    await page.click('#container a[href*="?demo=01-VueGridLayout"]');
    await page.waitForFunction(() => {
      const container = document.querySelector('#container');
      return Boolean(container && container.textContent && container.textContent.includes('Displayed as'));
    });

    for (const demo of demos) {
      await page.goto(`${baseUrl}example/index.html?demo=${demo}`, { waitUntil: 'networkidle0' });
      await page.waitForFunction(() => {
        const container = document.querySelector('#container');
        return Boolean(container && container.textContent && container.textContent.trim().length > 0);
      });
      const panelText = await page.$eval('#container', node => node.textContent || '');
      assert.ok(panelText.trim().length > 0, `demo ${demo} rendered an empty panel`);
      const hasGlobal = await page.evaluate(() => Object.prototype.hasOwnProperty.call(window, 'VueGridLayout'));
      assert.equal(hasGlobal, false, `demo ${demo} should not rely on window.VueGridLayout`);
      if (demo === 'dashboard-shell' || demo === '25-dashboard-editor-shell') {
        await assertDashboardShellDropWidget(page);
        await assertDashboardShellDogfoodDrag(page);
      }
    }

    await assertDynamicAddRemoveDemo(page, baseUrl);
    await assertToolboxDemo(page, baseUrl);

    assert.equal(
      requests.some(url => url.includes('build/web/vue-grid-layout.min.js')),
      false,
      'browser smoke must not request the legacy UMD artifact'
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    if (userDataDir) {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
    await server.close();
  }
}

module.exports = { runBrowserSmoke, defaultDemos };
