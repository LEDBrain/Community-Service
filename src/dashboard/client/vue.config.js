/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
    publicPath: '/',
    outputDir: path.resolve('../../../dist/dashboard'),
});
