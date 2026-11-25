import { defineConfig, devices } from '@playwright/test'

/**
 * slot-pet-qa — Playwright config for the Slot pet project SUT.
 *
 * The SUT (client :5173 + server :3001) is started separately:
 *   - locally: `npm run dev` in the slot_pet_project repo
 *   - in CI:   see .github/workflows/qa-gate.yml
 *
 * Endpoints are configurable via env so the suite is not hard-bound to one host:
 *   SLOT_CLIENT_URL  (default http://localhost:5173)
 *   SLOT_API_URL     (default http://localhost:3001)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The balance-boundary tests seed server/data/users.json, so run serially.
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'reports/results.json' }]]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.SLOT_CLIENT_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'api',
      testMatch: /tests[\\/]api[\\/].*\.spec\.ts/,
    },
    {
      name: 'e2e-chromium',
      testMatch: [/tests[\\/]e2e[\\/].*\.spec\.ts/, /tests[\\/]regression[\\/].*\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})