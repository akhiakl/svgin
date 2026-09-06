# svgin-tsup-config

Shared [tsup](https://tsup.egoist.dev) build preset for svgin's library packages, following
[Turborepo's config-package convention](https://turborepo.dev).

**Internal package, never published to npm.**

## Usage

```ts
// packages/<name>/tsup.config.ts: single entry (the default)
import { defineTsupConfig } from 'svgin-tsup-config';
export default defineTsupConfig();
```

```ts
// packages/<name>/tsup.config.ts: multi-entry, custom external deps
import { defineTsupConfig } from 'svgin-tsup-config';
export default defineTsupConfig({
    entry: { client: 'src/client.ts', server: 'src/server.ts' },
    external: ['react'],
});
```

`defineTsupConfig` is a factory, not a static object, precisely so every package extends the same
shared defaults (dual ESM+CJS, explicit `.mjs`/`.cjs` extensions, `dts`, sourcemaps, minify, clean)
and overrides only what actually differs for it, instead of duplicating the whole config per package.
