import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/live',
  timeout: 120000,
  workers: 1,
  retries: 0,
  outputDir: '.artifacts/live-browser',
  reporter: [['list'], ['json', { outputFile: '.artifacts/live-browser-report.json' }]],
  use: {
    baseURL: process.env.ORFIN_LIVE_BROWSER_URL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
