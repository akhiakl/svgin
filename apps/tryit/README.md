# svgin: try it

Live demos of [`@svgin/react`](https://www.npmjs.com/package/@svgin/react) and
[`@svgin/element`](https://www.npmjs.com/package/@svgin/element), both installed as real npm
dependencies (not imported from their workspace source - see [AGENTS.md](AGENTS.md)). This app lives
at `apps/tryit` in the [`svgin`](../../README.md) monorepo.

The site has one landing page per package (`/react`, `/element`), a neutral `/` intro linking to
both, and docs (`/docs/react/*`, `/docs/element/*`) alongside the live demos - see "What each demo
shows" below for the full route list.

## What each package is

[`@svgin/react`](https://www.npmjs.com/package/@svgin/react) fetches an SVG from a URL, or takes raw SVG markup directly, and renders it as a real, styleable React element instead of an `<img>`. It sanitizes the SVG with DOMPurify by default, so it is safe to use with SVGs from a source you do not fully control (a CMS field, an API response, user-uploaded content). It works both as a client component and in React Server Components.

```tsx
// Client component
import { SvgIn } from '@svgin/react/client';

<SvgIn src="/icons/alert.svg" width={24} height={24} className="text-red-500" />;
```

```tsx
// React Server Component (no client JS shipped for the fetch/sanitize)
import { SvgIn } from '@svgin/react/server';

export default async function Icon() {
    return <SvgIn src="https://example.com/icon.svg" width={24} height={24} />;
}
```

[`@svgin/element`](https://www.npmjs.com/package/@svgin/element) is the same sanitize-by-default
loading as a framework-agnostic Custom Element (`<svg-in>`), built on the same shared internals - no
React wrapper, plain HTML attributes and `CustomEvent`s.

```html
<script type="module">
    import '@svgin/element'; // registers <svg-in> as a side effect
</script>

<svg-in src="/icons/logo.svg" width="24" height="24" fill="currentColor"></svg-in>
```

Full API reference for either package lives in its own README
([`@svgin/react`](../../packages/react/README.md), [`@svgin/element`](../../packages/element/README.md))
and is mirrored on this site at `/docs/react/api` and `/docs/element/api`. This repo is a demo, not a
copy of those docs.

## What each demo shows

| Route | What it shows |
| --- | --- |
| `/` | Neutral intro linking to both packages' landing pages. |
| `/react` | `@svgin/react` landing page and demo grid (below). |
| `/inspector` | Paste SVG markup and see exactly what the default DOMPurify sanitizer strips. |
| `/rsc` | The async server `<SvgIn />` fetching and sanitizing an SVG entirely on the server. |
| `/suspense` | `<SvgInSuspense />`, React 19's `use()`, a real `<Suspense>` boundary and error boundary. |
| `/provider` | `<SvgInProvider />` setting shared `className`/`fallback`/`onError` defaults. |
| `/lazy` | `<SvgIn loading="lazy" />` deferring fetch/sanitize via `IntersectionObserver`. |
| `/native-props` | Standard SVG/DOM props (`style`, `onClick`, `role`, `tabIndex`, `data-*`) forwarded onto the rendered `<svg>`. |
| `/shadow` | `<SvgInShadow />` encapsulating style in a shadow root, immune to page-wide CSS in either direction. |
| `/element` | `@svgin/element` landing page and demo grid (below). |
| `/element/basic` | `<svg-in src="...">` fetching and rendering a real SVG, no React wrapper. |
| `/element/raw` | The `svg` attribute rendering markup you already have, sanitized, with no fetch at all. |
| `/element/lazy` | `loading="lazy"` deferring fetch/sanitize until the element scrolls near the viewport. |
| `/element/inspector` | Disable-sanitization compared side by side: a malicious payload stripped by default, or rendered raw when opted out. |
| `/element/events` | A failing `src` dispatching `svg-in-error` instead of throwing - no React error boundary involved. |
| `/docs`, `/docs/react/*`, `/docs/element/*` | Installation and API reference for each package, mirroring their own READMEs. |

## Getting started

From the monorepo root:

```sh
pnpm install
pnpm --filter svgin-tryit dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

Run from this directory, or as `pnpm --filter svgin-tryit <script>` / `pnpm turbo run <task>` from
the monorepo root:

```sh
pnpm run lint            # eslint
pnpm run typecheck       # next typegen && tsc --noEmit
pnpm run test            # vitest
pnpm run test:coverage   # vitest with coverage
pnpm run test:e2e        # playwright (requires: pnpm exec playwright install)
pnpm run test:a11y       # axe-core accessibility scan, every route
pnpm run build           # next build
```

See [AGENTS.md](AGENTS.md) for the fuller contributor guide: layout, conventions, and notes on keeping demos in sync with the upstream packages.

## Deploying

Deployed on [Vercel](https://vercel.com) at [svgin-tryit.vercel.app](https://svgin-tryit.vercel.app),
linked directly to this repo's GitHub integration (root directory `apps/tryit`): every push builds a
deployment automatically, no `VERCEL_TOKEN`/CI secrets involved. Not gated on a release, since this
app is not a release-please component (see below).

## Versioning

This app is **not** a release-please component (deliberately absent from the monorepo's root
`release-please-config.json`) and stays `private: true` permanently, like `packages/core`: no version
bumps, no GitHub releases, never published to npm. See the root `svgin-monorepo` skill.
