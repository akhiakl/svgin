# svgin-element

Framework-agnostic `<svg-in>` custom element: securely fetch and inline SVGs from URLs, sanitized by
default.

Built on **vanilla native Custom Elements** (`class SvgIn extends HTMLElement`), no Lit, no Stencil,
for zero runtime dependency and the smallest possible bundle, wrapping [`svgin-core`](../core)'s
fetch/sanitize/cache logic.

> **Status:** placeholder stub. Real `<svg-in>` behavior lands in a later PR (see
> [#18](https://github.com/akhiakl/svgin/issues/18)). **Update this README (and any docs-site page) in
> the same PR/build whenever `<svg-in>`'s public API or behavior changes**, see the `svgin-monorepo`
> skill.

## Bundle size

`size-budget.json` sets a gzip budget for the built `dist/index.cjs` output, checked via
`pnpm run size`. Currently a loose placeholder (1.0 KB) since there's no real implementation yet -
revisit this budget for real once #18 lands and the actual `<svg-in>` behavior has a size worth
tracking.
