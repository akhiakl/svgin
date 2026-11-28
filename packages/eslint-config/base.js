import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Shared flat config. Consumers set parserOptions.projectService and tsconfigRootDir
 * themselves, since a path set here would resolve against this package (see README).
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
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            // Keeps '' (a valid sanitized result) from being confused with null (no result).
            '@typescript-eslint/strict-boolean-expressions': [
                'error',
                {
                    allowNullableBoolean: true,
                    allowNumber: false,
                    allowString: false,
                },
            ],
        },
    },
    {
        files: ['**/*.mjs', '**/*.config.*'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        // Not in any tsconfig, so type-checked rules can't run.
        ...tseslint.configs.disableTypeChecked,
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
            // `await act(async () => {})` is needed even without an inner await.
            '@typescript-eslint/require-await': 'off',
        },
    },
);
