import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import { base } from './base.js';

/**
 * Base config plus React/JSX rules, for packages that ship React components
 * (packages/react, apps/tryit).
 */
export const reactConfig = tseslint.config(
    ...base,
    {
        ...react.configs.flat.recommended,
        settings: {
            react: {
                version: '19.1.0',
            },
        },
    },
    react.configs.flat['jsx-runtime'],
);
