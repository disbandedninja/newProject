#!/usr/bin/env node
const { spawn } = require('node:child_process');

let electronPath;

try {
  electronPath = require('electron');
} catch (error) {
  console.error(
    'Electron runtime is unavailable. This environment may block downloading optional packages; run in an environment with npm registry access and execute `npm install` again.'
  );
  process.exit(1);
}

const child = spawn(electronPath, ['.'], { stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
