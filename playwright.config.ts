import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    headless: true,
  },
  projects: [
    // ── Sauce Demo — desktop browsers ──────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/wikimedia-mobile.spec.ts',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/wikimedia-mobile.spec.ts',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/wikimedia-mobile.spec.ts',
    },

    // ── Wikimedia Commons — mobile device emulation ────────────────────────
    {
      name: 'wikimedia-iphone',
      use: {
        ...devices['iPhone 14'],
        baseURL: 'https://commons.wikimedia.org',
        screenshot: 'on',
      },
      testMatch: '**/wikimedia-mobile.spec.ts',
    },
    {
      name: 'wikimedia-pixel',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'https://commons.wikimedia.org',
        screenshot: 'on',
      },
      testMatch: '**/wikimedia-mobile.spec.ts',
    },
  ],
  outputDir: 'test-results',
});
