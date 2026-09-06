# svgin-react: try it

Live demos of [`svgin-react`](https://github.com/akhiakl/svgin-react), installed as a real npm dependency (not imported from its source), each one exercising a different real feature of the library. This app lives at `apps/tryit` in the [`svgin`](../../README.md) monorepo; see [AGENTS.md](AGENTS.md) for how it fits alongside `packages/react`/`packages/element`.

## What svgin-react is

[`svgin-react`](https://www.npmjs.com/package/svgin-react) fetches an SVG from a URL, or takes raw SVG markup directly, and renders it as a real, styleable React element instead of an `<img>`. It sanitizes the SVG with DOMPurify by default, so it is safe to use with SVGs from a source you do not fully control (a CMS field, an API response, user-uploaded content). It works both as a client component and in React Server Components.

```tsx
// Client component
import { SvgIn } from 'svgin-react/client';

<SvgIn src="/icons/alert.svg" width={24} height={24} className="text-red-500" />;
```

```tsx
// React Server Component (no client JS shipped for the fetch/sanitize)
import { SvgIn } from 'svgin-react/server';

export default async function Icon() {
    return <SvgIn src="https://example.com/icon.svg" width={24} height={24} />;
}
```

Full API reference (props, `<SvgInSuspense />`, `<SvgInProvider />`, `preloadSvg`, sanitization details) lives in the package's own [README](https://github.com/akhiakl/svgin-react#readme). This repo is a demo, not a copy of those docs.

## What each demo shows

| Route        | What it shows                                                                             |
| ------------ | ------------------------------------------------------------------------------------------ |
| `/inspector` | Paste SVG markup and see exactly what the default DOMPurify sanitizer strips.              |
| `/rsc`       | The async server `<SvgIn />` fetching and sanitizing an SVG entirely on the server.         |
| `/suspense`  | `<SvgInSuspense />`, React 19's `use()`, a real `<Suspense>` boundary and error boundary.   |
| `/provider`  | `<SvgInProvider />` setting shared `className`/`fallback`/`onError` defaults.               |
| `/lazy`      | `<SvgIn loading="lazy" />` deferring fetch/sanitize via `IntersectionObserver`.             |
| `/native-props` | Standard SVG/DOM props (`style`, `onClick`, `role`, `tabIndex`, `data-*`) forwarded onto the rendered `<svg>`. |
| `/shadow`    | `<SvgInShadow />` encapsulating style in a shadow root, immune to page-wide CSS in either direction. |

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

See [AGENTS.md](AGENTS.md) for the fuller contributor guide: layout, conventions, and notes on keeping demos in sync with the upstream package.

## Deploying

Deployed on [Vercel](https://vercel.com), linked directly to this repo's GitHub integration (root
directory `apps/tryit`): every push builds a deployment automatically, no `VERCEL_TOKEN`/CI secrets
involved. Not gated on a release, since this app is not a release-please component (see below).

## Versioning

This app is **not** a release-please component (deliberately absent from the monorepo's root
`release-please-config.json`) and stays `private: true` permanently, like `packages/core`: no version
bumps, no GitHub releases, never published to npm. See the root `svgin-monorepo` skill.
