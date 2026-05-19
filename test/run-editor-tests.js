'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tmp = path.join(root, '.tmp', 'editor-tests');
const bin = path.join(root, 'node_modules', '.bin');
const env = {
  ...process.env,
  NODE_PATH: path.join(root, 'node_modules')
};

const run = (command, args) => {
  execFileSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env
  });
};

fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

run(process.execPath, ['script.js', '--action=build']);
run(path.join(bin, 'babel'), ['--out-dir', path.join(tmp, 'lib'), '--extensions', '.ts,.tsx', './lib']);
run(path.join(bin, 'babel'), ['--out-dir', path.join(tmp, 'test'), '--extensions', '.ts,.tsx', './test']);
run(process.execPath, [path.join(tmp, 'test', 'grid-layout-internal-core.test.js')]);
run(process.execPath, [path.join(tmp, 'test', 'editor-core.test.js')]);
run(process.execPath, [path.join(root, 'test', 'grid-layout-contract-browser.test.js')]);
run(process.execPath, [path.join(root, 'test', 'editor-component-browser.test.js')]);
