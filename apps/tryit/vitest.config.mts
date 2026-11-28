import { defineNextVitestConfig } from 'svgin-vitest-config/next';

export default defineNextVitestConfig({
    test: {
        setupFiles: ['./test/setup.ts'],
        coverage: {
            exclude: [
                'src/app/**/layout.tsx',
                'src/app/**/page.tsx',
                // Thin next/dynamic wrappers; e2e covers the boundary.
                'src/components/*-client-loader.tsx',
                // Type declarations only.
                'src/types/**/*.d.ts',
            ],
        },
    },
});
