import { defineConfig } from '@playwright/test';

/**
 * Headless layout verification. The web server is the regular Vite dev server;
 * widget APIs are mocked per test so no module backends are required.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:5173',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
    screenshot: 'off',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'phone-390x844', use: { viewport: { width: 390, height: 844 } } },
    { name: 'phone-320x568', use: { viewport: { width: 320, height: 568 } } },
    { name: 'phone-landscape-844x390', use: { viewport: { width: 844, height: 390 } } },
    { name: 'tablet-768x1024', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'tablet-1024x768', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'desktop-1440x900', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tv-1920x1080', use: { viewport: { width: 1920, height: 1080 } } },
    { name: 'tv-3840x2160', use: { viewport: { width: 3840, height: 2160 } } },
  ],
});
