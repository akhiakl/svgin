import { defineConfig } from 'tsup';

/**
 * tsup preset for the library packages. Explicit .mjs/.cjs extensions keep the exports map
 * in sync with what is emitted.
 */
export function defineTsupConfig(overrides = {}) {
    return defineConfig({
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        clean: true,
        minify: true,
        outExtension({ format }) {
            return { js: format === 'cjs' ? '.cjs' : '.mjs' };
        },
        ...overrides,
    });
}
