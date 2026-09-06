import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

/**
 * Shared vitest config factory for svgin's Next.js apps (apps/tryit today;
 * any future one reuses this). Separate from the library packages' preset
 * (./base.js) for two real differences, not just app-vs-library style:
 *
 * - Needs the Vite React plugin for JSX transform in tests - the library
 *   packages build through tsup/esbuild instead, which doesn't need it.
 * - Does NOT enforce a coverage threshold. A Next app's actual coverage
 *   strategy here is Playwright e2e/a11y across every route (see
 *   playwright.config.ts and e2e/a11y.spec.ts), not unit tests - unit tests
 *   are reserved for the trickiest pure logic (see apps/tryit/src/lib/
 *   diff.ts's test, for example). Forcing the library packages' 100% unit
 *   bar onto an app whose coverage strategy is deliberately split across two
 *   test runners would be dishonest, not just inconvenient - it would mean
 *   either gaming the number with low-value tests or lowering the bar
 *   everywhere else too. Pass `coverage.thresholds` in overrides if a
 *   specific app genuinely wants one (tracked for apps/tryit itself in
 *   https://github.com/akhiakl/svgin/issues/16).
 *
 * Like ./base.js, deliberately does not import anything from
 * `vitest`/`vitest/config` - see that file's comment for why (a second,
 * differently peer-qualified copy of vitest breaks @testing-library/
 * jest-dom's ambient type augmentation for any consumer).
 *
 * The `@/*` path alias resolves against `process.cwd()`, not this file's own
 * location, precisely so it works correctly for whichever app extends this
 * (each app's own `vitest run` sets cwd to that app's own directory) - the
 * `svgin-typescript-config` `rootDir` mistake, but for a path alias instead
 * of a compiler option.
 */
export function defineNextVitestConfig(overrides = {}) {
    const { test: testOverrides = {}, ...restOverrides } = overrides;
    const { coverage: coverageOverrides = {}, ...restTestOverrides } = testOverrides;
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(process.cwd(), 'src'),
            },
        },
        test: {
            environment: 'jsdom',
            globals: true,
            include: ['test/**/*.test.{ts,tsx}'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'lcov', 'json-summary'],
                include: ['src/**/*.{ts,tsx}'],
                ...coverageOverrides,
            },
            ...restTestOverrides,
        },
        ...restOverrides,
    };
}
