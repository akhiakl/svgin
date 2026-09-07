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

## License

MIT © Akhil K
