/**
 * Vitest preset for the library packages: jsdom, globals, v8 coverage held at 100%.
 * Imports nothing from vitest: depending on it gave pnpm a second copy that broke
 * jest-dom's type augmentation.
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
