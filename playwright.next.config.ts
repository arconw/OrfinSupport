import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/next',
  timeout: 60000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4177',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'npm run build && npm run build --prefix examples/next && cd examples/next && npx next start -p 4177',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
