'use strict';

const { runBrowserSmoke } = require('./vite-browser-smoke');

runBrowserSmoke({ demos: ['dashboard-shell'] }).catch(error => {
  console.error(error);
  process.exit(1);
});
