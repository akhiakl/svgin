---
name: svgin-monorepo
description: >
  Conventions for the svgin monorepo: package/app boundaries, build/release
  pipeline, and tooling choices. Use when adding a package or app, changing
  turbo.json/release-please config, cutting a release, or touching
  packages/core, packages/react, packages/element, or apps/tryit.
---

# svgin monorepo conventions

Update this file in the same PR as any change to the pipeline, package boundaries, or tooling it
describes.

## Package boundaries

- `packages/core` (`svgin-core`) is permanently private and never released. It holds the shared
  fetch/sanitize/cache internals. `packages/react` and `packages/element` list it in
  `devDependencies` (`workspace:*`) and bundle its source via tsup `noExternal`, because it is never
  published.
- `packages/react` (`@svgin/react`) and `packages/element` (`@svgin/element`) are the two public npm
  packages under the `@svgin` scope. Check each `package.json` for the current version.
- `@svgin/react` keeps its export paths stable: `/client`, `/server`, `/core`, `/suspense`, `/shadow`,
  `/all`.
- `packages/element` is a vanilla Custom Element (`class SvgIn extends HTMLElement`), no Lit or
  Stencil. Update its README in the same PR as any public API or behavior change.
- `apps/tryit` (`svgin-tryit`) is the private demo site, one route per feature. It installs
  `@svgin/react` and `@svgin/element` from npm, never `workspace:*`, so it shows what is published.
  See its `AGENTS.md`.

## Build and tasks

- The root `package.json` only delegates to `turbo run <task>`. Task logic lives in each package.
- Shared tooling config lives in workspace packages (`svgin-eslint-config`,
  `svgin-typescript-config`, `svgin-tsup-config`, `svgin-vitest-config`), not root files, so
  Turborepo tracks it. Each exports a factory (`defineTsupConfig(overrides)` and so on).
  `apps/tryit` uses `eslint-config-next` and `svgin-vitest-config/next` instead of the library presets.
- `packages/core` has no build: its `exports` map points at raw `.ts` source. A tsup build split
  shared code into chunks, so `vi.mock('svgin-core/...')` no longer hit the code actually called.
- Coverage is held at 100% on every metric in core, react, element and tryit. Thresholds only apply
  when coverage runs (`test:coverage`, run by CI on Node 22 and by `release.yml`). Files with no logic
  (the tryit `*-client-loader.tsx` wrappers, `.d.ts` files) are excluded explicitly.
- Bundle budgets: `packages/react` and `packages/element` have a `size` script
  (`scripts/check-bundle-size.mjs`) and a `size-budget.json` of gzip KB per `dist/*.cjs` entry.
  The script is in `turbo.json` `globalDependencies`, because Turborepo ignores `inputs` outside a
  package. Explain any budget bump in the PR.
- `ci.yml`'s `pr-report` job posts one sticky comment (`<!-- svgin-pr-report -->`) with tests,
  coverage and size, head vs a rebuilt base, plus E2E/a11y results. Every data source is best-effort.
- CI caches `.turbo` through `actions/cache`, keyed on the PR head SHA (not the ephemeral merge
  commit). No Vercel Remote Cache.

## Dependency pins

Track latest by default. Pin only for a real incompatibility, and drop the pin once it is fixed.

- `typescript` is exactly `5.9.3` everywhere, also forced by `pnpm-workspace.yaml` `overrides`.
  TypeScript 7 breaks tsup's DTS bundler and typescript-eslint.
- `vitest` is pinned through `overrides` too. Two physical copies break jest-dom's type augmentation
  (`Property 'toHaveAttribute' does not exist`). Never make `vitest` a dependency of a config
  package, and keep `@types/node` aligned across packages.
- `apps/tryit` stays on ESLint 9: `eslint-plugin-react` 7.37.5 crashes under ESLint 10 on
  non-component files.

## Gotchas

- `null` means "no result yet"; `''` is a valid sanitized result. Compare with `=== null`, never
  truthiness. Lint enforces this with `strict-boolean-expressions`.
- Code in an environment-agnostic entry (`@svgin/react/core`) picks the client or server sanitizer
  at call time, never by a hard-coded import.
- `consistent-type-imports` is an error: a value import of a type pulls the module in at runtime.
- In flat config, a later object wins. A package's `projectService: true` overlay must be scoped to
  `src/**`, or it re-enables type-checking for config files.
- `next N` in a v8/eslint directive counts physical lines. With several directive lines stacked, use
  `/* v8 ignore start */` and `stop`.
- `await act(async () => {})` is needed even without an inner await, so `require-await` is off in
  tests.
- Under RTL + jsdom, a settled `use()` promise isn't re-rendered on its own. Call `rerender()` with
  the same element (see `apps/tryit/test/suspense-client.test.tsx`).
- `rootDir` goes in each consumer's `tsconfig.json`, never in `svgin-typescript-config/base.json`:
  relative options resolve against the base file.

## Release and publishing

- release-please in manifest mode. Only `packages/react` and `packages/element` are in
  `release-please-config.json`; versions and changelogs come from Conventional Commits.
- Known limitation: a commit touching only `packages/core/**` releases nothing. If the change should
  ship, also touch `packages/react/**` or `packages/element/**`.
- `release.yml` publishes on a GitHub Release with `npm publish --provenance` over OIDC trusted
  publishing (no token). The quality gate is filtered to the released package. Each published
  `package.json` needs a `repository` field, or provenance verification fails.
- "Re-run failed jobs" replays the old workflow file. Use the `workflow_dispatch` `tag` input, or cut
  a fresh release, to retry with the current workflow.
- After publishing, `release.yml` opens a PR bumping `apps/tryit` to the exact new version. Never
  auto-merged: a human decides whether the release needs new demo content. A `0.x` caret range only
  matches its own minor, so tryit ranges need explicit bumps.
- Verify a package change that affects packaging by packing it and installing the tarball into a
  scratch project. Workspace links hide packaging bugs.

## Reference skills

Third-party skills are listed in `skills-lock.json` and restored locally with `npx skills`. Useful
here: `turborepo`, `shared-monorepo-pnpm-workspaces`, `package-publishing`, `web-component-design`,
`xss-prevention`, `vercel-react-best-practices`, `building-components`.
