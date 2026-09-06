# svgin-eslint-config

Shared ESLint flat configs for the svgin monorepo, following
[Turborepo's config-package convention](https://turborepo.dev): a real workspace package instead of a
root `eslint.config.mjs` referenced implicitly by every package, so Turborepo's task graph tracks it as
a proper dependency.

**Internal package, never published to npm.**

## Usage

```js
// packages/<name>/eslint.config.mjs
import { base } from 'svgin-eslint-config/base';
export default base;
```

```js
// packages/react/eslint.config.mjs (or any package with JSX)
import { reactConfig } from 'svgin-eslint-config/react';
export default reactConfig;
```
