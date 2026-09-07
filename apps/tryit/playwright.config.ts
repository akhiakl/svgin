import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // json alongside html: CI's pr-report job (see #22) reads this to build
    // the per-browser E2E pass/fail summary in its sticky PR comment. Each
    // matrix job (chromium/firefox/webkit) runs in its own checkout with
    // --project scoping, so this path never collides across browsers - it's
    // uploaded as its own artifact per browser, same as the html report.
    reporter: [['html'], ['json', { outputFile: 'playwright-report/results.json' }]],
    use: {
        baseURL: 'http://localhost:4173',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: process.env.PW_LOCAL_CHROMIUM ? { executablePath: process.env.PW_LOCAL_CHROMIUM } : {},
            },
        },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: {
        command: 'pnpm run build && pnpm exec next start --port 4173',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
    },
});
