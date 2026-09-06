# svgin-tryit

Next.js demo app for trying [`svgin-react`](../../packages/react) and
[`svgin-element`](../../packages/element) live.

**Internal app, never published to npm, never a Changesets release component.**

> **Convention:** every release that changes `svgin-react` or `svgin-element` should update this app in
> the same PR (bump the dependency, touch the demo surface that exercises the change), see the
> `svgin-monorepo` skill.

## Development

```bash
pnpm --filter svgin-tryit dev
```
