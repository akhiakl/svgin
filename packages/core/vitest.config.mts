import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            // Matches akhiakl/svgin-react's own bar for this same code: 100%,
            // treated as a real gap to close (or an explicit
            // `/* v8 ignore next */` with a reason), not a threshold to raise
            // later. Not wired into the default `test` script/turbo
            // pipeline yet (`vitest run --coverage` to check locally) -
            // matches this repo's existing "deferred" stance on coverage
            // reporting in CI (see ci.yml's comment).
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100,
            },
        },
    },
});
