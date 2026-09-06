import { defineConfig } from 'tsup';

/**
 * Shared tsup build preset for svgin's library packages (packages/core,
 * packages/react, packages/element): single entry point, dual ESM+CJS
 * output, generated .d.ts files, clean output dir on every build.
 */
export const baseConfig = defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
});
