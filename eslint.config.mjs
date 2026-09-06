import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/coverage/**',
            '**/.turbo/**',
            '**/.next/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        files: ['**/*.mjs', '**/*.config.*'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['packages/react/**', 'apps/tryit/**'],
        ...react.configs.flat.recommended,
        settings: {
            react: {
                version: '19.1.0',
            },
        },
    },
    {
        files: ['packages/react/**', 'apps/tryit/**'],
        ...react.configs.flat['jsx-runtime'],
    },
);
