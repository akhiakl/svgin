import { defineConfig } from 'tsup';

/**
 * Shared tsup build preset for svgin's library packages. A factory, not a
 * static object: every package extends the same defaults, overriding only
 * what actually differs for it (typically just `entry` and `external`)
 * instead of duplicating the whole config.
 *
 * Defaults: single entry `src/index.ts`, dual ESM+CJS output with explicit
 * `.mjs`/`.cjs` extensions (not left to tsup's `type:module`-based default,
 * so package.json's exports map can't silently drift from what's actually
 * emitted), generated `.d.ts` files, sourcemaps, minified, clean output dir
 * on every build.
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
