#!/usr/bin/env node

const { runCLI } = require('@zero-scripts/core');
const { WebpackPresetSpa } = require('@zero-scripts/preset.webpack-spa');

process.on('unhandledRejection', err => {
  throw err;
});

runCLI(WebpackPresetSpa);
