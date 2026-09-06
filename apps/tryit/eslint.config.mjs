import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// This app uses eslint-config-next (framework-specific rules: react-hooks,
// core-web-vitals, next/link, etc.) instead of the shared svgin-eslint-config
// preset used by the library packages, since svgin-eslint-config has no
// Next.js-specific rules and this app needs them.
const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Test/build tool output, not source.
        'coverage/**',
        'playwright-report/**',
        'test-results/**',
    ]),
]);

export default eslintConfig;
