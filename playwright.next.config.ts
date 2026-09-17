import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/next',
  timeout: 60000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4175',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'npm run build && npm run build --prefix examples/next && npm run start --prefix examples/next',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
