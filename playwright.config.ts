import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/qa',
  timeout: 30 * 1000,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: false
  },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputDir: 'playwright-report' }]
  ],
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } }
  ]
});
