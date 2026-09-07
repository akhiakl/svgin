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
plugin for JSX in tests (the library packages build through tsup/esbuild instead). Defaults to the
same 100% coverage thresholds as the base preset (see
[#16](https://github.com/akhiakl/svgin/issues/16): `apps/tryit` reached a real 100% - unit tests for
logic worth unit testing, real integration-style tests against the real `svgin-react` for its demo
components, and a narrow, documented `coverage.exclude` only for files with no logic of their own,
like the `*-client-loader.tsx` `next/dynamic` wrappers). This is on top of, not instead of, a Next
app's other real coverage layer: Playwright e2e/a11y across every route (see `apps/tryit/AGENTS.md`).
A future app that genuinely can't meet 100% yet should override `coverage.thresholds` explicitly and
say why, not have the shared default quietly lowered for everyone.
