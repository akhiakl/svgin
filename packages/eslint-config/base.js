import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base flat ESLint config shared by every package in the svgin monorepo.
 * A package's own eslint.config.mjs imports this and appends anything
 * package-specific (see ./react.js for the React/JSX variant).
 *
 * Type-checked linting (recommendedTypeChecked, strict-boolean-expressions)
 * requires `languageOptions.parserOptions.projectService` and
 * `tsconfigRootDir`, which this shared config deliberately does NOT set
 * itself - same rootDir-per-consumer pattern as svgin-typescript-config's
 * own `rootDir` gotcha: a location baked in here would resolve relative to
 * *this package's own directory*, not the consumer's, and break for every
 * consumer at once. Each consuming package's own eslint.config.mjs supplies
 * it (see this package's README for the exact snippet) - `tseslint.config`
 * merges plain objects like that in fine.
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
            // Catches importing a type-only binding as a value import (e.g.
            // `import { SvgInProps } from './types'` when SvgInProps is only
            // ever used in a type position) - a real bug Copilot's review of
            // PR #17 caught in packages/react/src/preload.ts: it forces an
            // unnecessary runtime import of the module, which can pull in
            // side effects or defeat tree-shaking. Doesn't need type-checked
            // linting (parserOptions.project), just the syntactic form.
            '@typescript-eslint/consistent-type-imports': 'error',
            // Catches a `T | null`/`T | undefined` value used directly in a
            // boolean context (if (!svg), svg && ...) instead of an explicit
            // `=== null`/`!== null` check - exactly the bug class Copilot's
            // review of PR #17 caught twice in one PR (a sanitized-to-
            // empty-string '' result being conflated with "no result yet"
            // null). See the svgin-monorepo skill's "Correctness gotchas
            // caught by review" section and #23.
            '@typescript-eslint/strict-boolean-expressions': [
                'error',
                {
                    // Both are common, intentional, and unambiguous
                    // patterns in this codebase (e.g. `if (options?.signal)`,
                    // truthy checks on a plain `boolean` variable) - only
                    // nullable non-boolean types (string, number, object)
                    // are the actual bug class this rule exists to catch
                    // here.
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
        // Config/script files aren't part of any package's own tsconfig
        // "include", so type-checked rules can't run against them - turn
        // the type-checked preset back off just for these instead of
        // failing with "file not in project".
        ...tseslint.configs.disableTypeChecked,
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
            // React's own `act()` (and `@testing-library/react`'s
            // re-export of it) needs `await act(async () => { ... })`
            // even when the callback body has no `await` of its own -
            // confirmed the hard way: removing the seemingly-redundant
            // `async`/`await` here (following require-await's own advice)
            // broke real test assertions, because act() still needs a
            // microtask tick to flush React's internal work regardless of
            // what its own type signature for a sync callback claims. This
            // is a testing-library idiom, not unnecessary async - not
            // worth relitigating at every call site across the test suite.
            '@typescript-eslint/require-await': 'off',
        },
    },
);
