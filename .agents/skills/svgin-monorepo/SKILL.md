---
name: svgin-monorepo
description: >
  Conventions for the svgin monorepo — package/app boundaries, build/release
  pipeline, and tooling choices. Use when adding a package or app, changing
  turbo.json/Changesets config, cutting a release, or touching packages/core,
  packages/react, packages/element, or apps/tryit.
---

# svgin monorepo conventions

This is a living document — update it in the same PR as any change to the
pipeline, package boundaries, or tooling decisions it describes.

## Package boundaries

- `packages/core` (npm name `svgin-core`) is **permanently private** — never
  published, never given a Changesets release. It holds the shared
  fetch/sanitize/cache internals that `packages/react` and `packages/element`
  both consume over a `workspace:*` dependency. It is not an independent
  public API.
- `packages/react` (npm name `svgin-react`) and `packages/element` (npm name
  `svgin-element`) are the two public npm packages. `svgin-react` continues
  the existing npm package published from `akhiakl/svgin-react` — its version
  carries over rather than resetting to `0.0.0` when real code lands here.
- Naming is deliberately `svgin-core` / `svgin-react` / `svgin-element`, not a
  bare `svgin` package — the bare name is the project/repo identity, not any
  one package. The `<svg-in>` custom element tag name is unrelated to the npm
  package name.
- Migration fidelity: when `svgin-react`'s real code moves into
  `packages/react`, it must match the current published `akhiakl/svgin-react`
  feature-for-feature at minimum (same export paths: `/client`, `/server`,
  `/core`, `/suspense`, `/shadow`, `/all`; same sanitization guarantees).
  Changes on top of that should be improvements, not regressions.
- `apps/tryit` is a Next.js demo app for trying `svgin-react`/`svgin-element`
  live — **permanently private**, like `packages/core`: never published,
  never a Changesets release component, no npm name.

## Build & task pipeline

- Root `package.json` only delegates to `turbo run <task>`; task logic lives
  in each package's own `package.json` (see the `turborepo` skill).
- All three packages build with the same `tsup` pipeline — no per-package
  bundler divergence.
- `packages/element` builds `<svg-in>` on **vanilla native Custom Elements**
  (`class SvgIn extends HTMLElement`) — not Lit, not Stencil. Zero runtime
  dependency, smallest bundle, same tsup pipeline as the other two packages.
  See the `web-component-design` skill when implementing it for real.
- **Whenever `packages/element` changes its public API or behavior, update
  its documentation (README + any docs-site page) in the same PR/build** —
  don't let `<svg-in>`'s docs drift behind its implementation the way a
  fast-moving new component easily can.

## Release & publishing

- Versioning/publishing uses **Changesets**, not release-please (which
  svgin-react, the single-package sibling repo, uses). Changesets fits a
  monorepo with an internal shared dependency better: it skips
  `"private": true` packages automatically (no exclusion list needed for
  `packages/core`), and it auto-bumps a dependent's version when a
  `workspace:*` dependency it consumes (`svgin-core`) changes.
- `.changeset/config.json`'s `access` stays `"restricted"` until the PR that
  actually publishes `packages/react`/`packages/element` — then flip it to
  `"public"`.
- See the `package-publishing` skill for npm publishing conventions once that
  PR is underway.
- **Every release that changes `svgin-react` or `svgin-element` must update
  `apps/tryit` in the same PR** (bump its dependency on the released package,
  and touch whatever demo surface exercises the change) — the tryit app is
  meant to always demo current behavior, not a stale prior version. Treat a
  release changeset that doesn't touch `apps/tryit` as a signal to check
  whether it should.

## Reference skills installed in this repo

- `turborepo` — task pipeline conventions (package tasks, not root tasks).
- `building-components`, `vercel-composition-patterns` — accessibility,
  composable API design, npm-publish conventions for component work.
- `vercel-react-best-practices` — svgin-react targets RSC/Next.js
  compatibility; its data-fetching/bundle-size rules apply once real code
  lands in `packages/react`.
- `web-component-design` — for implementing `<svg-in>` in `packages/element`.
- `xss-prevention` — svgin's core value proposition is safe SVG sanitization;
  applies directly to `packages/core`'s fetch/sanitize logic.
- `shared-monorepo-pnpm-workspaces` — matches this repo's exact shape (pnpm
  workspaces + shared internal package).
- `package-publishing` — npm publishing conventions for when `svgin-react`/
  `svgin-element` go public.
- `deploy-to-vercel`, `next-dev-loop`, `next-cache-components-adoption`,
  `next-cache-components-optimizer`, `next-partial-prefetching-adoption`,
  `vercel-optimize`, `vercel-react-view-transitions` — all for `apps/tryit`
  once it's more than a stub: deployment, dev-loop verification, caching/
  prefetching adoption, cost/perf optimization, and view-transition demos.
