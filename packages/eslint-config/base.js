import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base flat ESLint config shared by every package in the svgin monorepo.
 * A package's own eslint.config.mjs imports this and appends anything
 * package-specific (see ./react.js for the React/JSX variant).
 */
export const base = tseslint.config(
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
);
