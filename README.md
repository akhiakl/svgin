# svgin

Securely fetch and inline SVGs from URLs, sanitized by default.

This is the Turborepo-managed pnpm monorepo behind [`svgin-react`](packages/react) and
[`svgin-element`](packages/element): fetch an SVG from a URL (or take raw markup you already have),
sanitize it with [DOMPurify](https://github.com/cure53/DOMPurify), and render it as a real, styleable
inline `<svg>` instead of an opaque `<img>`. `svgin-react` is a real, working implementation migrated
from the previously-separate [`akhiakl/svgin-react`](https://github.com/akhiakl/svgin-react) repo;
`svgin-element` (a framework-agnostic `<svg-in>` custom element) is also implemented and demoed live,
but neither is published from this monorepo yet - see [#19](https://github.com/akhiakl/svgin/issues/19)
for first-publish readiness. `apps/tryit` is real too: the migrated `akhiakl/svgin-react-tryit` demo
app, deployed at [svgin-tryit.vercel.app](https://svgin-tryit.vercel.app).

## Packages

| Path | npm name | Publishes? | What it is |
| --- | --- | --- | --- |
| [`packages/core`](packages/core) | `svgin-core` | Never (private) | Shared fetch/sanitize/cache internals `svgin-react` and `svgin-element` are both built on |
| [`packages/react`](packages/react) | `svgin-react` | Not yet from here ([#19](https://github.com/akhiakl/svgin/issues/19)) | React components for inlining SVGs |
| [`packages/element`](packages/element) | `svgin-element` | Not yet ([#19](https://github.com/akhiakl/svgin/issues/19)) | Framework-agnostic `<svg-in>` custom element |
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

SVGs are sanitized with DOMPurify by default in both `svgin-react` and `svgin-element`. Use your own
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
   **both** the `svgin-react` and `svgin-element` package names:
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
   pipeline. `svgin-react` can flip once its parity/migration work (#12/#14/#15) is done; `svgin-element`
   once its `<svg-in>` implementation is considered release-ready.

First published version for each package, once unprivated:

- **`svgin-react`** continues at whatever `packages/react/package.json` is currently pinned to
  (`1.0.1` as of this writing) - the version already carried over from the previously-separate
  `akhiakl/svgin-react` npm package, per the `svgin-monorepo` skill's migration-fidelity note. No
  manual edit needed; release-please's manifest already reflects this (`.release-please-manifest.json`
  has `"packages/react": "1.0.1"`), so its next PR bumps from there based on new commits only.
- **`svgin-element`**'s manifest currently pins `0.0.0`. No manual manifest bump is needed for this:
  release-please's manifest releaser treats an unreleased component's manifest version as the base for
  its own semver bump computed from Conventional Commits since the last release, the same way it does
  for any already-released component - it does not require a hand-picked "initial version" as a
  separate step. Given the `feat` commits already merged for `packages/element`'s real implementation
  (and no breaking-change commits), release-please's default versioning strategy should propose `0.1.0`
  as the first release on its own, matching what #19 suggested. Double-check the actual proposed
  version in that first release-please PR once `RELEASE_PLEASE_TOKEN` is fixed and it can actually run,
  rather than assuming this holds without checking.

`apps/tryit`'s `svgin-react` dependency (`^1.0.1`) already matches the version that will be `svgin-react`'s
first real npm publish, so no change is needed there for the version itself - just confirm after the
first real publish that `pnpm install` in `apps/tryit` still resolves it correctly against the now-public
package (rather than a workspace-local build), per the `svgin-monorepo` skill's release rule.

## License

MIT © Akhil K
