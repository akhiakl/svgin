/**
 * Shared vitest config factory for the svgin monorepo. A factory, not a
 * static object, for the same reason as svgin-tsup-config: every package
 * extends the same defaults and overrides only what actually differs for it
 * (typically `setupFiles`) instead of duplicating the whole config.
 *
 * Deliberately does NOT import anything from `vitest`/`vitest/config`
 * (`defineConfig` is only an identity function for type inference, not
 * needed at runtime) - declaring `vitest` as this package's own dependency
 * previously caused pnpm to resolve a second, differently peer-qualified
 * physical copy of it, which broke `@testing-library/jest-dom`'s ambient
 * type augmentation (`toHaveAttribute`/`toHaveClass`/etc. on `expect(...)`)
 * for any package that also depended on this one. Plain object merging
 * avoids the whole class of problem.
 *
 * Defaults: jsdom environment (every package here either touches the DOM
 * directly or tests code that does, transitively, through svgin-core),
 * globals on, coverage via v8 pinned to 100% across every metric - matching
 * akhiakl/svgin-react's own bar for this exact code (see the migrated test
 * suites in packages/core and packages/react). A gap here is a real gap to
 * close (or an explicit v8-ignore comment with a reason), not a threshold to
 * lower. Not wired into the default `test` script/turbo pipeline yet
 * (`vitest run --coverage` to check locally).
 */
export function defineVitestConfig(overrides = {}) {
    const { test: testOverrides = {}, ...restOverrides } = overrides;
    const { coverage: coverageOverrides = {}, ...restTestOverrides } = testOverrides;
    return {
        test: {
            environment: 'jsdom',
            globals: true,
            include: ['src/**/*.test.{ts,tsx}'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'lcov', 'json-summary'],
                include: ['src/**/*.{ts,tsx}'],
                thresholds: {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100,
                },
                ...coverageOverrides,
            },
            ...restTestOverrides,
        },
        ...restOverrides,
    };
}
