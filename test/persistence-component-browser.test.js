'use strict';

const { runBrowserSmoke } = require('./vite-browser-smoke');

runBrowserSmoke({ demos: ['persistence'] }).catch(error => {
  console.error(error);
  process.exit(1);
});
