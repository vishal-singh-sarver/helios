#!/usr/bin/env node
const { spawn } = require('child_process');
const { resolve, delimiter } = require('path');

process.env.HELIOS_SKIP_BACKEND = '1';

const localBin = resolve(__dirname, '../node_modules/.bin');
const command = process.platform === 'win32'
  ? resolve(localBin, 'electron-vite.cmd')
  : 'electron-vite';

const env = {
  ...process.env,
  PATH: `${localBin}${delimiter}${process.env.PATH || ''}`,
};

const child = spawn(command, ['dev', '--', '--no-sandbox'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error('Failed to launch electron-vite:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
