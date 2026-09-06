# svgin-vitest-config

Shared vitest config factory for the svgin monorepo, following
[Turborepo's config-package convention](https://turborepo.dev): a real workspace package instead of a
per-package `vitest.config.mts` duplicating the same jsdom/coverage setup.

**Internal package, never published to npm.**

## Usage

```ts
// packages/<name>/vitest.config.mts
import { defineVitestConfig } from 'svgin-vitest-config';
export default defineVitestConfig();
```

```ts
// packages/react/vitest.config.mts: with a setup file
import { defineVitestConfig } from 'svgin-vitest-config';
export default defineVitestConfig({
    test: { setupFiles: ['./src/setup.ts'] },
});
```

`defineVitestConfig` is a factory: every package gets jsdom + 100% coverage thresholds by default,
overriding only what actually differs for it (typically just `setupFiles`).

## Next.js apps

```ts
// apps/<name>/vitest.config.mts
import { defineNextVitestConfig } from 'svgin-vitest-config/next';
export default defineNextVitestConfig();
```

A separate preset (`./next.js`), not an override of the base one: a Next app needs the Vite React
plugin for JSX in tests (the library packages build through tsup/esbuild instead), and deliberately
does **not** enforce a coverage threshold: a Next app's real coverage strategy here is Playwright
e2e/a11y across every route, not unit tests alone (see `apps/tryit/AGENTS.md` and
[#16](https://github.com/akhiakl/svgin/issues/16), which tracks bringing that app to a real 100% bar
across both). Pass `coverage.thresholds` in overrides once a specific app is ready to enforce one.
