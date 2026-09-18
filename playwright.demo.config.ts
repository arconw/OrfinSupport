import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/demo',
  timeout: 30000,
  outputDir: '.artifacts/static-demo-browser',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4194',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build:demo && vite preview --host 127.0.0.1 --port 4194 --strictPort',
    url: 'http://127.0.0.1:4194',
    env: { VITE_ORFIN_DEMO_LIVE: 'false' },
    reuseExistingServer: false,
    timeout: 60000,
  },
});
