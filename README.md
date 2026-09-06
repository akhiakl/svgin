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

This repo uses [Changesets](https://github.com/changesets/changesets), not release-please (the tool
`svgin-react`'s standalone predecessor repo uses) — see the `svgin-monorepo` skill under
[`.claude/skills`](.claude/skills) for why. Run `pnpm changeset` to record a change intended for a
release.

## License

MIT © Akhil K
