# svgin

Securely fetch and inline SVGs from URLs, sanitized by default.

This is the Turborepo-managed pnpm monorepo behind [`@svgin/react`](packages/react) and
[`@svgin/element`](packages/element): fetch an SVG from a URL (or take raw markup you already have),
sanitize it with [DOMPurify](https://github.com/cure53/DOMPurify), and render it as a real, styleable
inline `<svg>` instead of an opaque `<img>`. The React package continues the previously-separate
[`akhiakl/svgin-react`](https://github.com/akhiakl/svgin-react) repo, currently published on npm as
unscoped `svgin-react` (real history, at `1.0.1`); it's being migrated to the `@svgin` npm scope as a
fresh `@svgin/react` package (npm renames don't carry version history, so this is a deliberate identity
change, not a seamless continuation - see the `svgin-monorepo` skill for the full rationale).
`@svgin/element` (a framework-agnostic `<svg-in>` custom element) is also implemented and demoed live,
but neither scoped package has had its first publish yet - see
[#19](https://github.com/akhiakl/svgin/issues/19) for first-publish readiness. `apps/tryit` is real
too: the migrated `akhiakl/svgin-react-tryit` demo app, deployed at
[svgin-tryit.vercel.app](https://svgin-tryit.vercel.app), still demoing the live unscoped
`svgin-react@1.0.1` dependency until `@svgin/react` ships.

## Packages

| Path | npm name | Publishes? | What it is |
| --- | --- | --- | --- |
| [`packages/core`](packages/core) | `svgin-core` | Never (private) | Shared fetch/sanitize/cache internals `@svgin/react` and `@svgin/element` are both built on |
| [`packages/react`](packages/react) | `@svgin/react` | Not yet from here ([#19](https://github.com/akhiakl/svgin/issues/19)) | React components for inlining SVGs |
| [`packages/element`](packages/element) | `@svgin/element` | Not yet ([#19](https://github.com/akhiakl/svgin/issues/19)) | Framework-agnostic `<svg-in>` custom element |
| [`apps/tryit`](apps/tryit) | n/a | Never (private) | Live demo app (Next.js) for both packages, deployed on Vercel |

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

### First npm publish checklist

The publish pipeline itself is built and repo-scoped work for it is done (see
[#19](https://github.com/akhiakl/svgin/issues/19)): `.github/workflows/release.yml` publishes to npm
via trusted publishing (OIDC) when a GitHub Release is published, `.github/workflows/release-please.yml`
opens the version-bump PRs, `release-please-config.json`/`.release-please-manifest.json` track both
`packages/react` and `packages/element` in manifest mode, the `npm-publish` GitHub Environment that
`release.yml` deploys against exists, and a `npm pack --dry-run` against both packages' built `dist/`
confirms their tarballs contain exactly `package.json`, `README.md`, and everything under `dist/` (per
each package's `"files": ["dist"]`) - no surprises, nothing missing.

What's still needed before the very first real publish, and who does it:

1. **Configure npm trusted publishing (OIDC) on npmjs.com** - this needs actual npmjs.com dashboard
   access, so it has to be done by whoever administers the npm org/account, not from this repo. For
   **both** the `@svgin/react` and `@svgin/element` package names (under the `@svgin` npm
   [organization](https://www.npmjs.com/settings/svgin)):
   - On npmjs.com, open (or first create as an empty/placeholder package, since trusted publishing is
     configured on an existing npm package) the package's Settings, then "Trusted Publisher".
   - Add a GitHub Actions trusted publisher with:
     - Organization/user: `akhiakl`
     - Repository: `svgin`
     - Workflow filename: `release.yml` (exactly, matching `.github/workflows/release.yml`)
     - Environment name: `npm-publish` (matching `release.yml`'s `environment: npm-publish`)
   - No `NPM_TOKEN` secret is needed anywhere in this repo once this is set up; `release.yml`'s publish
     step already relies on npm's OIDC auto-detection (see that file's own comments).
2. **Fix the `RELEASE_PLEASE_TOKEN` secret** - discovered while preparing this checklist, not
   previously tracked in #19: every run of `release-please.yml` to date has failed outright with
   `release-please failed: Input required and not supplied: token`, because the
   `RELEASE_PLEASE_TOKEN` secret it passes to `googleapis/release-please-action@v5` is not set in this
   repo's Actions secrets. Until this is fixed, release-please can never open a version-bump PR for
   either package, independent of the `private` flag. Add a repo secret named `RELEASE_PLEASE_TOKEN`
   (a PAT - classic with `repo` scope, or a fine-grained token with contents/pull-requests/issues write
   access - is the usual choice, so PRs it opens can trigger other workflows the way a PR from the
   default `GITHUB_TOKEN` cannot).
3. **Decide on protection rules for the `npm-publish` GitHub Environment.** It exists (created via the
   GitHub API as prep for this checklist) but currently has no protection rules configured - a safe
   default that lets `release.yml` deploy against it immediately once everything else is ready.
   Consider adding required reviewers (Settings -> Environments -> `npm-publish`) if a manual
   approval gate before every npm publish is wanted; this is a judgment call, not a hard requirement.
4. **Flip `"private": true` to `false`** in `packages/react/package.json` and `packages/element/package.json`,
   independently, whenever each package's code is actually ready to ship. This is a deliberate,
   separate step - not bundled into any prep work - since it's what actually arms the real release
   pipeline. `@svgin/react` can flip once its parity/migration work (#12/#14/#15) is done; `@svgin/element`
   once its `<svg-in>` implementation is considered release-ready.

First published version for each scoped package, once unprivated:

- **`@svgin/react`** is a brand-new npm package as far as the registry is concerned: a scoped name and
  its unscoped predecessor share no version history, so publishing it is not a "continuation" of the
  existing `svgin-react@1.0.1` package, even though `packages/react/package.json` is still numerically
  pinned at `1.0.1` (carried over locally from the previously-separate `akhiakl/svgin-react` repo). This
  is a deliberate identity change - see the `svgin-monorepo` skill's updated migration-fidelity note.
  Decide, before that first publish, whether `@svgin/react` should keep numbering from `1.0.1` or reset
  to a fresh `0.x`/`1.0.0`; either way, `release-please`'s manifest (`.release-please-manifest.json`)
  should be kept in sync with whatever `packages/react/package.json` actually says.
- **`@svgin/element`**'s manifest tracks its own version independently of `@svgin/react`'s; check
  `.release-please-manifest.json`/`packages/element/package.json` for the current value rather than
  assuming a specific number here - it moves as `release-please` proposes bumps from Conventional
  Commits.

`apps/tryit`'s `svgin-react` dependency (`^1.0.1`) deliberately stays on the old unscoped package for
now - it's a real, currently-published npm dependency, decoupled from `packages/react`'s own identity
in this monorepo. Swap it to a published `@svgin/react` version only as a separate, explicit step once
that first scoped publish actually ships; do not change it as part of the rename itself.

## License

MIT © Akhil K
