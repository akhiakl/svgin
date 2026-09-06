import { defineNextVitestConfig } from 'svgin-vitest-config/next';

export default defineNextVitestConfig({
    test: {
        setupFiles: ['./test/setup.ts'],
        coverage: {
            exclude: ['src/app/**/layout.tsx', 'src/app/**/page.tsx'],
        },
    },
});
