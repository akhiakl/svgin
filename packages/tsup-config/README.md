# svgin-tsup-config

Shared [tsup](https://tsup.egoist.dev) build preset for svgin's library packages, following
[Turborepo's config-package convention](https://turborepo.dev).

**Internal package, never published to npm.**

## Usage

```ts
// packages/<name>/tsup.config.ts
export { baseConfig as default } from 'svgin-tsup-config';
```

Override locally in a package's own `tsup.config.ts` if it ever needs different entries or output
formats, this preset is a starting point, not a hard requirement.
