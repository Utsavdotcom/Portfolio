const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:8766',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node scripts/serve.cjs',
    url: 'http://127.0.0.1:8766',
    reuseExistingServer: !process.env.CI,
  },
});
