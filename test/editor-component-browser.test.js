'use strict';

const { runBrowserSmoke } = require('./vite-browser-smoke');

runBrowserSmoke({ demos: ['editor', 'placement'] }).catch(error => {
  console.error(error);
  process.exit(1);
});
