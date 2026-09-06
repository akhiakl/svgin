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
        rules: {
            // Catches importing a type-only binding as a value import (e.g.
            // `import { SvgInProps } from './types'` when SvgInProps is only
            // ever used in a type position) - a real bug Copilot's review of
            // PR #17 caught in packages/react/src/preload.ts: it forces an
            // unnecessary runtime import of the module, which can pull in
            // side effects or defeat tree-shaking. Doesn't need type-checked
            // linting (parserOptions.project), just the syntactic form.
            '@typescript-eslint/consistent-type-imports': 'error',
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
