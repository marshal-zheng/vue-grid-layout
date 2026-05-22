'use strict';

const { runBrowserSmoke } = require('./vite-browser-smoke');

runBrowserSmoke().catch(error => {
  console.error(error);
  process.exit(1);
});
