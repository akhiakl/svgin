import { defineVitestConfig } from 'svgin-vitest-config';

export default defineVitestConfig({
    test: { setupFiles: ['./src/setup.ts'] },
});
