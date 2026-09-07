import { reactConfig } from 'svgin-eslint-config/react';

// tsconfigRootDir here, not in svgin-eslint-config itself - see that
// package's own README for why. Scoped to src/**, not the whole package:
// tsconfig.json's own "include" is just ["src"], so a broader **/*.ts
// pattern here would re-enable projectService for files reactConfig's own
// base already exempted from type-checking (eslint.config.mjs,
// tsup.config.ts, vitest.config.mts - none of them are under src/ or
// covered by the tsconfig) - a later config always wins over an earlier
// one for the same file, so an unscoped override here would undo that
// exemption and break parsing for those files.
export default [
    ...reactConfig,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
