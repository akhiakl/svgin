# svgin-eslint-config

Shared ESLint flat configs for the svgin monorepo, following
[Turborepo's config-package convention](https://turborepo.dev): a real workspace package instead of a
root `eslint.config.mjs` referenced implicitly by every package, so Turborepo's task graph tracks it as
a proper dependency.

**Internal package, never published to npm.**

## Usage

Both presets are type-checked (`recommendedTypeChecked`, `strict-boolean-expressions`, see #23), which
needs `languageOptions.parserOptions.projectService` and `tsconfigRootDir` - deliberately **not** set
inside this package itself (same rootDir-per-consumer reasoning as `svgin-typescript-config`'s own
`rootDir` gotcha: a location baked in here would resolve relative to *this* package's directory, not
the consumer's). Every consuming package's own `eslint.config.mjs` adds this one extra object:

```js
// packages/<name>/eslint.config.mjs
import { base } from 'svgin-eslint-config/base';

export default [
    ...base,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
```

```js
// packages/react/eslint.config.mjs (or any package with JSX)
import { reactConfig } from 'svgin-eslint-config/react';

export default [
    ...reactConfig,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
```

`apps/tryit` does not use either preset (its own `eslint-config-next`-based config, see the
`svgin-monorepo` skill) and is not type-checked by this package - decided out of scope for #23:
Playwright e2e/a11y coverage already de-risks it, and adding `parserOptions.projectService` there would
need its own `next typegen`-aware setup this config doesn't provide.
