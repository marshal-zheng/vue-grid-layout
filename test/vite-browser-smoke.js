'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
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

async function runBrowserSmoke(options = {}) {
  const demos = options.demos || defaultDemos;
  const server = await createViteServer();
  const baseUrl = server.resolvedUrls.local[0];
  let browser;
  let userDataDir;

  try {
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
    }

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
