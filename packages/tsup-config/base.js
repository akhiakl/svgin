import { defineConfig } from 'tsup';

/**
 * Shared tsup build preset for svgin's library packages (packages/core,
 * packages/react, packages/element): single entry point, dual ESM+CJS
 * output, generated .d.ts files, clean output dir on every build.
 *
 * Output extensions are explicit (.mjs / .cjs) rather than left to tsup's
 * type:module-based default (.js for ESM) — that default is correct today,
 * but making it explicit means package.json's exports map can't silently
 * drift from what's actually emitted if that default ever changes.
 */
export const baseConfig = defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    outExtension({ format }) {
        return { js: format === 'cjs' ? '.cjs' : '.mjs' };
    },
});
