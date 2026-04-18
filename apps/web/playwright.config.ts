import { defineConfig, devices } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';

// Load env vars from apps/web/.env.local
dotenvConfig({ path: path.resolve(__dirname, '.env.local') });

const isCI = !!process.env.CI;
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  workers: isCI ? 2 : 4,
  retries: isCI ? 2 : 0,
  forbidOnly: isCI,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  globalSetup: require.resolve('./tests/e2e/globalSetup.ts'),
  globalTeardown: require.resolve('./tests/e2e/globalTeardown.ts'),
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @aerolume/web dev',
      url: baseURL,
      timeout: 120_000,
      reuseExistingServer: !isCI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    // Widget dev server (Vite) — used by widget specs that reference
    // http://localhost:5173/. Widget specs that inject the built IIFE via
    // `page.addScriptTag({ path })` do not require this server, but we still
    // start it so specs can exercise the same endpoint a third-party site
    // would hit. `reuseExistingServer` lets a dev who already has it running
    // avoid a conflict.
    {
      command: 'pnpm --filter @aerolume/widget dev',
      // Vite serves the IIFE bundle but has no index on `/` — probe @vite/client (always 200).
      url: 'http://localhost:5173/@vite/client',
      timeout: 120_000,
      reuseExistingServer: !isCI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
