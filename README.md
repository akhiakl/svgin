# svgin

Securely fetch and inline SVGs from URLs, sanitized by default.

This is a Turborepo-managed pnpm monorepo. It currently holds tooling and workspace scaffolding —
real implementations are ported in later PRs (see each package's README for status).

## Packages

| Path | npm name | Publishes? | What it is |
| --- | --- | --- | --- |
| [`packages/core`](packages/core) | `svgin-core` | Never (private) | Shared fetch/sanitize/cache internals |
| [`packages/react`](packages/react) | `svgin-react` | Yes | React components for inlining SVGs |
| [`packages/element`](packages/element) | `svgin-element` | Yes | Framework-agnostic `<svg-in>` custom element |
| [`apps/tryit`](apps/tryit) | — | Never (private) | Next.js demo app for `svgin-react`/`svgin-element` |

Shared tooling config lives in its own workspace packages rather than a root file, per
[Turborepo's convention](https://turborepo.dev) (a root config isn't tracked by Turborepo's task
graph, so a change to it can't correctly invalidate just the packages that depend on it):
[`packages/eslint-config`](packages/eslint-config), [`packages/typescript-config`](packages/typescript-config),
[`packages/tsup-config`](packages/tsup-config).

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
across all workspace packages/apps in dependency order, with caching.

## Versioning & releases

This repo uses [release-please](https://github.com/googleapis/release-please), matching
`svgin-react`. Versions and changelogs are derived automatically from
[Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint — so there's no
separate manual release step. See the `svgin-monorepo` skill under [`.claude/skills`](.claude/skills)
for the full rationale and its one known limitation.

## License

MIT © Akhil K
