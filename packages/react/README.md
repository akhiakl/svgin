# svgin-react

Securely fetch and inline SVGs from URLs as React components, sanitized by default, with client and
server support.

> **Status:** real implementation, migrated from [`akhiakl/svgin-react`](https://github.com/akhiakl/svgin-react)
> (see [#12](https://github.com/akhiakl/svgin/issues/12)/[#14](https://github.com/akhiakl/svgin/issues/14)),
> feature-for-feature with that package's public API (same export paths: `/client`, `/server`, `/core`,
> `/suspense`, `/shadow`, `/all`; same sanitization guarantees), built on the shared
> [`svgin-core`](../core) internals. Not published from this monorepo yet - see
> [#19](https://github.com/akhiakl/svgin/issues/19) for first-publish readiness. This package's
> version continues the existing npm package rather than resetting to `0.0.0`.

## Bundle size

Each entry point has its own gzip budget in `size-budget.json`, checked against the built `dist/*.cjs`
output (the worst case for size - ESM is what bundlers tree-shake most aggressively) via
`pnpm run size`. Current budgets, with headroom over what's actually built today:

| Entry point | Budget (gzip) |
| --- | --- |
| `/client` | 2.0 KB |
| `/server` | 1.5 KB |
| `/core` | 1.2 KB |
| `/suspense` | 1.75 KB |
| `/shadow` | 1.5 KB |
| `/all` | 3.5 KB |

Bump a budget only with a comment (in the PR, since `size-budget.json` itself can't hold one) explaining
why the change legitimately needs the extra size - this is meant to catch accidental bloat, not to
block every change.
