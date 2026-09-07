import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

/**
 * Shared vitest config factory for svgin's Next.js apps (apps/tryit today;
 * any future one reuses this). Separate from the library packages' preset
 * (./base.js) for two real differences, not just app-vs-library style:
 *
 * - Needs the Vite React plugin for JSX transform in tests - the library
 *   packages build through tsup/esbuild instead, which doesn't need it.
 * - Defaults to the same 100% coverage thresholds as ./base.js (see
 *   https://github.com/akhiakl/svgin/issues/16: apps/tryit reached a real,
 *   non-gamed 100% - unit tests for the logic actually worth unit testing,
 *   real integration-style tests against the real svgin-react for the demo
 *   components, and a documented, narrow coverage.exclude only for the
 *   handful of files with no logic of their own to test at all, e.g. the
 *   `*-client-loader.tsx` `next/dynamic` wrappers - not a blanket opt-out).
 *   A Next app's *other* real coverage layer is Playwright e2e/a11y across
 *   every route (see playwright.config.ts and e2e/a11y.spec.ts), which this
 *   threshold does not replace - the two are complementary, not either/or.
 *   A future app extending this preset that genuinely can't meet 100% yet
 *   should override `coverage.thresholds` explicitly (and say why in the
 *   PR), the same as any other override here - not have the shared default
 *   quietly lowered for everyone.
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
                thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
                ...coverageOverrides,
            },
            ...restTestOverrides,
        },
        ...restOverrides,
    };
}
