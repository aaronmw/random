import { defineConfig, devices } from '@playwright/test'
import { TEST_TIMEOUT } from './tests/helpers'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: TEST_TIMEOUT,
  },
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    actionTimeout: TEST_TIMEOUT,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
})
