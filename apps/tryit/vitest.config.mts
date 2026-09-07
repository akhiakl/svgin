import { defineNextVitestConfig } from 'svgin-vitest-config/next';

export default defineNextVitestConfig({
    test: {
        setupFiles: ['./test/setup.ts'],
        coverage: {
            exclude: [
                'src/app/**/layout.tsx',
                'src/app/**/page.tsx',
                // Thin `next/dynamic(..., { ssr: false })` wrappers with no
                // logic of their own beyond wiring (see each file's own
                // comment) - the real component they load is what's tested;
                // exercising the dynamic-import boundary itself is what
                // Playwright's e2e suite (a real browser, real Next.js
                // build) is for. See #16.
                'src/components/*-client-loader.tsx',
            ],
        },
    },
});
