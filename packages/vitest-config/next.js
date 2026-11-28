import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

/**
 * Vitest preset for the Next.js apps: adds the React plugin and the `@/` alias, same 100% bar.
 * The alias resolves from process.cwd() so it points at whichever app runs it.
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
