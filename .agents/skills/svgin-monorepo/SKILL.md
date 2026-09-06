---
name: svgin-monorepo
description: >
  Conventions for the svgin monorepo: package/app boundaries, build/release
  pipeline, and tooling choices. Use when adding a package or app, changing
  turbo.json/release-please config, cutting a release, or touching
  packages/core, packages/react, packages/element, or apps/tryit.
---

# svgin monorepo conventions

This is a living document. Update it in the same PR as any change to the pipeline, package
boundaries, or tooling decisions it describes.

## Package boundaries

- `packages/core` (npm name `svgin-core`) is **permanently private**: never published, never a
  release-please component (deliberately absent from `release-please-config.json`'s `packages` map).
  It holds the shared fetch/sanitize/cache internals that `packages/react` and `packages/element` both
  consume over a `workspace:*` dependency. It is not an independent public API.
- `packages/react` (npm name `svgin-react`) and `packages/element` (npm name `svgin-element`) are the
  two public npm packages. `svgin-react` continues the existing npm package published from
  `akhiakl/svgin-react`; its version carries over rather than resetting to `0.0.0` when real code lands
  here.
- Naming is deliberately `svgin-core` / `svgin-react` / `svgin-element`, not a bare `svgin` package.
  The bare name is the project/repo identity, not any one package. The `<svg-in>` custom element tag
  name is unrelated to the npm package name.
- Migration fidelity: when `svgin-react`'s real code moves into `packages/react`, it must match the
  current published `akhiakl/svgin-react` feature-for-feature at minimum (same export paths: `/client`,
  `/server`, `/core`, `/suspense`, `/shadow`, `/all`; same sanitization guarantees). Changes on top of
  that should be improvements, not regressions.
- `apps/tryit` (npm name `svgin-tryit`) is the real, migrated `akhiakl/svgin-react-tryit` demo app: one
  route per `svgin-react` feature (Inspector, RSC fetch, Suspense, Provider, lazy loading, native
  props, Shadow DOM), with its own Vitest unit tests and Playwright e2e/a11y suite. It installs
  `svgin-react` **as a real npm dependency, not `workspace:*`** (see `AGENTS.md` in that app):
  the whole point of the demo is to show what's actually published, not the in-progress workspace
  version. It's **permanently private**, like `packages/core`: `package.json` has a name
  (`svgin-tryit`) for local workspace/tooling purposes, but it's never published to npm and never a
  release-please component. `svgin-element` demos aren't added yet; that's for when `<svg-in>` has a
  real implementation.

## Build & task pipeline

- Root `package.json` only delegates to `turbo run <task>`; task logic lives in each package's own
  `package.json` (see the `turborepo` skill).
- All three library packages build with the same `tsup` pipeline. No per-package bundler divergence.
- **Shared tooling config lives in its own workspace packages, not root files** (`svgin-eslint-config`,
  `svgin-typescript-config`, `svgin-tsup-config`, all under `packages/`). This follows the `turborepo`
  skill's own guidance: a root `eslint.config.mjs`/`tsconfig.base.json` isn't tracked by Turborepo's
  task graph (only real `workspace:*` dependencies are), so a change to it can't correctly invalidate
  just the packages that depend on it, and it also means every package's cache gets busted by any tweak
  to a file that most of them don't actually use differently. Every package imports/extends from these
  instead of a relative-path root file. Add a new shared config the same way if one becomes needed
  (e.g. a `vitest` preset, once packages need divergent test setups; plain defaults are enough for now,
  so no `svgin-vitest-config` package exists yet). **`apps/tryit` is the one exception**: it uses its
  own `eslint-config-next`-based config and `svgin-typescript-config/nextjs.json`, not
  `svgin-eslint-config`, since a Next.js app needs framework-specific lint rules
  (`react-hooks`/`core-web-vitals`/`next/link`) that the library preset doesn't provide.
- **Dependency policy: keep everything on latest, with pinned exceptions where something else lacks
  support.** Every package in this repo tracks the newest published version of its dependencies by
  default; pin only when a real incompatibility forces it, and drop the pin once that's fixed
  upstream. Two exceptions exist today:
  - `typescript`, pinned to exactly `5.9.3` (not the current `7.0.x`) everywhere: TypeScript 7's new
    API isn't yet supported by `tsup`'s DTS bundler (`rollup-plugin-dts` throws) or by
    `typescript-eslint`. Enforced two ways: every package that declares `typescript` pins it to the
    exact version (no `^`), **and** `pnpm-workspace.yaml`'s `overrides` forces `typescript: 5.9.3`
    repo-wide, so peer-dependency-driven installs (from `tsup`, `commitlint`, `typescript-eslint`)
    can't sneak in a second copy at a different version.
  - `apps/tryit`'s `eslint`, pinned to `^9.9.1` (not the monorepo's usual `^10.x`): `eslint-plugin-react`
    7.37.5 (pulled in transitively by `eslint-config-next`) throws
    (`contextOrFilename.getFilename is not a function`) under ESLint 10's flat-config context when
    linting non-component files like `e2e/*.spec.ts`. Only `apps/tryit` is affected; the library
    packages' own `svgin-eslint-config` stays on ESLint 10 since it doesn't hit this code path.
  Re-run `pnpm up --latest -r` periodically and try bumping each pinned dependency back to latest.
- `packages/element` builds `<svg-in>` on **vanilla native Custom Elements**
  (`class SvgIn extends HTMLElement`), not Lit, not Stencil. Zero runtime dependency, smallest bundle,
  same tsup pipeline as the other two packages. See the `web-component-design` skill when implementing
  it for real.
- **Whenever `packages/element` changes its public API or behavior, update its documentation (README
  and any docs-site page) in the same PR/build.** Don't let `<svg-in>`'s docs drift behind its
  implementation the way a fast-moving new component easily can.

## Release & publishing

- Versioning/publishing uses **release-please** (manifest mode), matching `svgin-react`, the
  single-package sibling repo. This was a deliberate choice over Changesets: this repo already
  enforces Conventional Commits via commitlint, and release-please derives the version bump and
  changelog entirely from commit messages, with no separate manual step. Changesets requires someone
  to run `pnpm changeset` and pick a bump type on every PR that should ship; skipping that silently
  means "no release," not "wrong version." Given "no manual version bumping" as the hard requirement,
  that makes release-please the better fit here, even though Changesets is the more commonly
  recommended default for monorepos in general.
- `release-please-config.json`'s `packages` map lists only `packages/react` and `packages/element`.
  `packages/core` and `apps/tryit` are deliberately absent, so they're never versioned or released. No
  `"private"` flag check needed; simply not being in the map is the exclusion.
- **Known limitation, by design, not yet worked around:** release-please determines which package(s) a
  commit affects by which package directory the commit's changed files touch. A commit that touches
  only `packages/core/**` won't by itself trigger a release for `packages/react` or `packages/element`,
  even though both depend on it. Until this is automated, a PR that changes shared `svgin-core` logic
  in a way that should ship should also touch something under `packages/react/**` or
  `packages/element/**` (even a trivial version-bump-triggering change, or scope the commit
  accordingly) so release-please picks it up.
- See the `package-publishing` skill for npm publishing conventions once `packages/react`/
  `packages/element` actually start publishing.
- **Every release that changes `svgin-react` or `svgin-element` must update `apps/tryit` in the same
  PR** (bump its dependency on the released package, and touch whatever demo surface exercises the
  change). The tryit app is meant to always demo current behavior, not a stale prior version. Treat a
  release that doesn't touch `apps/tryit` as a signal to check whether it should.

## Reference skills installed in this repo

- `turborepo`: task pipeline conventions (package tasks, not root tasks).
- `building-components`, `vercel-composition-patterns`: accessibility, composable API design,
  npm-publish conventions for component work.
- `vercel-react-best-practices`: svgin-react targets RSC/Next.js compatibility; its
  data-fetching/bundle-size rules apply once real code lands in `packages/react`.
- `web-component-design`: for implementing `<svg-in>` in `packages/element`.
- `xss-prevention`: svgin's core value proposition is safe SVG sanitization; applies directly to
  `packages/core`'s fetch/sanitize logic.
- `shared-monorepo-pnpm-workspaces`: matches this repo's exact shape (pnpm workspaces plus shared
  internal package).
- `package-publishing`: npm publishing conventions for when `svgin-react`/`svgin-element` go public.
- `deploy-to-vercel`, `next-dev-loop`, `next-cache-components-adoption`,
  `next-cache-components-optimizer`, `next-partial-prefetching-adoption`, `vercel-optimize`,
  `vercel-react-view-transitions`: for `apps/tryit`'s real Next.js app (deployment, dev-loop
  verification, caching/prefetching adoption, cost/perf optimization, and view-transition demos).
