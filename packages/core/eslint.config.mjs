import { base } from 'svgin-eslint-config/base';

// tsconfigRootDir here, not in svgin-eslint-config itself - see that
// package's own README for why.
export default [
    ...base,
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
