# svgin

Securely fetch and inline SVGs from URLs, sanitized by default.

This is the Turborepo-managed pnpm monorepo behind [`@svgin/react`](packages/react) and
[`@svgin/element`](packages/element): fetch an SVG from a URL (or take raw markup you already have),
sanitize it with [DOMPurify](https://github.com/cure53/DOMPurify), and render it as a real, styleable
inline `<svg>` instead of an opaque `<img>`. Both are published to npm under the
[`@svgin`](https://www.npmjs.com/settings/svgin) organization scope. The React package continues the
previously-separate [`akhiakl/svgin-react`](https://github.com/akhiakl/svgin-react) repo, which is also
still live on npm as unscoped `svgin-react@1.0.1` (real history) - `@svgin/react` is a deliberate new
identity, not a seamless continuation: npm treats a scoped and unscoped name as entirely unrelated
packages, so `@svgin/react` started as a fresh registry entry (its version number, `1.0.1`, was kept the
same on purpose; its download/dependent history was not carried over). See the `svgin-monorepo` skill
for the full rationale. `apps/tryit` is real too: the migrated `akhiakl/svgin-react-tryit` demo app,
deployed at [svgin-tryit.vercel.app](https://svgin-tryit.vercel.app) - it currently demos the live
unscoped `svgin-react@1.0.1` npm dependency, and a `workspace:*`-linked build of `@svgin/element`'s own
source (not yet the published npm package); both are cut over to their real published `@svgin/*`
versions as separate, explicit follow-up steps, not bundled into the scope migration itself.

## Packages

| Path | npm name | Publishes? | What it is |
| --- | --- | --- | --- |
| [`packages/core`](packages/core) | `svgin-core` | Never (private) | Shared fetch/sanitize/cache internals `@svgin/react` and `@svgin/element` are both built on |
| [`packages/react`](packages/react) | `@svgin/react` | Yes, `1.0.1` | React components for inlining SVGs |
| [`packages/element`](packages/element) | `@svgin/element` | Yes, `0.0.1` | Framework-agnostic `<svg-in>` custom element |
| [`apps/tryit`](apps/tryit) | n/a | Never (private) | Live demo app (Next.js) for both packages, deployed on Vercel - see below for which dependency each currently resolves to |

Shared tooling config lives in its own workspace packages rather than a root file, per
[Turborepo's convention](https://turborepo.dev) (a root config isn't tracked by Turborepo's task
graph, so a change to it can't correctly invalidate just the packages that depend on it):
[`packages/eslint-config`](packages/eslint-config), [`packages/typescript-config`](packages/typescript-config),
[`packages/tsup-config`](packages/tsup-config), [`packages/vitest-config`](packages/vitest-config).

## Development

```bash
corepack enable
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Each script delegates to [Turborepo](https://turborepo.dev) (`turbo run <task>`), which runs the task
across all workspace packages/apps in dependency order, with caching. `pnpm test:coverage` runs each
package's test suite with coverage enforced (100% across statements/branches/functions/lines in every
package that has it enforced today - see the `svgin-monorepo` skill for the one deliberate exception).

## Security

SVGs are sanitized with DOMPurify by default in both `@svgin/react` and `@svgin/element`. Use your own
`sanitizeFn`, or set `disableSanitization`, only for SVGs you fully trust - see each package's own
README for its exact API.

## Versioning & releases

This repo uses [release-please](https://github.com/googleapis/release-please), matching
`svgin-react`'s own previous setup. Versions and changelogs are derived automatically from
[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint, so there's no
separate manual release step. See the `svgin-monorepo` skill under [`.agents/skills`](.agents/skills)
for the full rationale, current release-readiness status, and its one known limitation.

### npm publish status

Both packages are live: `@svgin/react@1.0.1` and `@svgin/element@0.0.1` (bumped from an initial `0.0.0`
that had to be unpublished and unpublishing blocks reusing that exact version for 24 hours - see the
`svgin-monorepo` skill's "Release & publishing" section for what happened there and the
`svgin-core`-in-`dependencies` packaging bug that caused it). Each was published manually
(`pnpm publish --access public`) as a one-time bootstrap, since npm requires a package to already exist
before a trusted publisher can be configured against it - `packages/react/package.json` and
`packages/element/package.json` both have `"private": false` now.

What's still needed before `release-please`'s automated pipeline can take over future releases:

1. **Configure npm trusted publishing (OIDC) on npmjs.com** for both `@svgin/react` and
   `@svgin/element` (under the `@svgin` npm [organization](https://www.npmjs.com/settings/svgin)) -
   this needs actual npmjs.com dashboard access, so it has to be done by whoever administers the npm
   org, not from this repo:
   - On npmjs.com, open each package's Settings, then "Trusted Publisher".
   - Add a GitHub Actions trusted publisher with:
     - Organization/user: `akhiakl`
     - Repository: `svgin`
     - Workflow filename: `release.yml` (exactly, matching `.github/workflows/release.yml`)
     - Environment name: `npm-publish` (matching `release.yml`'s `environment: npm-publish`)
   - No `NPM_TOKEN` secret is needed anywhere in this repo once this is set up; `release.yml`'s publish
     step already relies on npm's OIDC auto-detection (see that file's own comments).
2. **Confirm the `RELEASE_PLEASE_TOKEN` secret is actually set and working** - a prior run of
   `release-please.yml` failed with `release-please failed: Input required and not supplied: token`
   because this secret was missing from the repo's Actions secrets. Verify it's set (a PAT - classic
   with `repo` scope, or a fine-grained token with contents/pull-requests/issues write access) and that
   the next `release-please.yml` run actually opens a version-bump PR, rather than assuming this is
   fixed.
3. **Decide on protection rules for the `npm-publish` GitHub Environment**, if a manual approval gate
   before every automated npm publish is wanted (Settings -> Environments -> `npm-publish`) - a judgment
   call, not a hard requirement; it currently has none configured.
4. **Cut `apps/tryit` over from the unscoped `svgin-react` dependency to `@svgin/react`**, as a separate,
   explicit step (not bundled into the scope migration itself, since the demo app must keep resolving a
   real, working npm package throughout). Once that lands, `apps/tryit`'s own `AGENTS.md` no longer needs
   its `svgin-element`/`@svgin/element` `workspace:*` exception note either, if `@svgin/element` has also
   been swapped to a real published dependency by then.

## License

MIT © Akhil K
