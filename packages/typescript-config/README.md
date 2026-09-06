# svgin-typescript-config

Shared `tsconfig.json` presets for the svgin monorepo, following
[Turborepo's config-package convention](https://turborepo.dev): a real workspace package instead of a
root `tsconfig.base.json` referenced by relative path, so Turborepo's task graph tracks it as a proper
dependency (a change here correctly invalidates only the packages that depend on it, via
`workspace:*`, rather than a plain file outside the graph).

**Internal package — never published to npm.**

## Usage

```json
// packages/<name>/tsconfig.json
{
  "extends": "svgin-typescript-config/base.json",
  "include": ["src"]
}
```

- `react.json` extends `base.json` and adds `jsx`/`types` for library packages with JSX
  (`packages/react`).
- `nextjs.json` is a separate preset (not extending `base.json`) for Next.js apps (`apps/tryit`) —
  Next.js needs `noEmit`, `jsx: "preserve"`, and its own TS plugin, which don't fit a library's
  declaration-emitting build config.
