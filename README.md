# svgin

Securely fetch and inline SVGs from URLs, sanitized by default.

This is the Turborepo-managed pnpm monorepo behind [`@svgin/react`](packages/react) and
[`@svgin/element`](packages/element): fetch an SVG from a URL (or take raw markup you already have),
sanitize it with [DOMPurify](https://github.com/cure53/DOMPurify), and render it as a real, styleable
inline `<svg>` instead of an opaque `<img>`. Both are published to npm under the
[`@svgin`](https://www.npmjs.com/settings/svgin) organization scope. `apps/tryit` is the demo app
(migrated from `akhiakl/svgin-react-tryit`), deployed at
[svgin-tryit.vercel.app](https://svgin-tryit.vercel.app), depending on both real published packages
(no `workspace:*` dependency remains there). See the `svgin-monorepo` skill for the full history and
rationale behind the `@svgin` scope migration.

## Packages

| Path | npm name | Publishes? | What it is |
| --- | --- | --- | --- |
| [`packages/core`](packages/core) | `svgin-core` | Never (private) | Shared fetch/sanitize/cache internals `@svgin/react` and `@svgin/element` are both built on |
| [`packages/react`](packages/react) | `@svgin/react` | Yes, `1.1.1` | React components for inlining SVGs |
| [`packages/element`](packages/element) | `@svgin/element` | Yes, `0.1.1` | Framework-agnostic `<svg-in>` custom element |
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

### npm publish status

Both packages are live and the automated pipeline is fully working end-to-end: a merged, `fix:`/`feat:`
commit to `main` lets `release-please` open a version-bump PR, merging that PR creates a GitHub Release
(and tag), which triggers `release.yml` and publishes to npm via trusted publishing (OIDC) - no manual
step required. `@svgin/react@1.1.1` and `@svgin/element@0.1.1` were published this way. See the
`svgin-monorepo` skill's "Release & publishing" section for the full history, including the two
packaging bugs (`svgin-core` in `dependencies` instead of `devDependencies`; a missing `repository`
field breaking npm's provenance check) that blocked earlier publish attempts before this pipeline was
verified working.

## License

MIT © Akhil K
