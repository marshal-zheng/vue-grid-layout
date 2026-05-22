'use strict';

const { runBrowserSmoke } = require('./vite-browser-smoke');

runBrowserSmoke({ demos: ['basic', 'responsive', 'worker'] }).catch(error => {
  console.error(error);
  process.exit(1);
});
