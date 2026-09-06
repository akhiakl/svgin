# svgin-typescript-config

Shared `tsconfig.json` presets for the svgin monorepo, following
[Turborepo's config-package convention](https://turborepo.dev): a real workspace package instead of a
root `tsconfig.base.json` referenced by relative path, so Turborepo's task graph tracks it as a proper
dependency (a change here correctly invalidates only the packages that depend on it, via
`workspace:*`, rather than a plain file outside the graph).

**Internal package, never published to npm.**

## Usage

```json
// packages/<name>/tsconfig.json
{
  "extends": "svgin-typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**Always set `rootDir` in the *consuming* package's own tsconfig.json, never in a shared preset.**
Relative path options in a base config (`rootDir`, `outDir`, etc.) resolve relative to *that base
file's own location* when inherited via `extends`, not the extending package's: putting `rootDir`
in `base.json` itself resolves to a nonexistent `packages/typescript-config/src` for every consumer
and breaks `tsc` with `TS6059` for all of them. `outDir` in `base.json` is harmless the same way
`rootDir` is dangerous only because nothing actually reads it (`tsup` ignores tsconfig's `outDir`
entirely, and `tsc --noEmit` never emits) but `rootDir` is checked during program construction
regardless of `noEmit`, so its wrong resolved path breaks typecheck itself, not just a build nobody
runs through raw `tsc`.

- `react.json` extends `base.json` and adds `jsx`/`types` for library packages with JSX
  (`packages/react`).
- `nextjs.json` is a separate preset (not extending `base.json`) for Next.js apps (`apps/tryit`).
  Next.js needs `noEmit`, `jsx: "preserve"`, and its own TS plugin, which don't fit a library's
  declaration-emitting build config.
