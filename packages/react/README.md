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

```tsx
import { SvgIn } from 'svgin-react';

<SvgIn src="/icons/alert.svg" width={24} fill="#f00" />
```

## Why svgin-react

An `<img src="icon.svg">` can't be styled with CSS - no color changes, no path animation, no targeting
inner elements. Inlining the SVG markup fixes that, but inlining raw markup from a URL you don't fully
control is a real security risk (an SVG can carry `<script>` tags, `onload` handlers, and other ways to
run JavaScript). `svgin-react` fetches the SVG, sanitizes it with
[DOMPurify](https://github.com/cure53/DOMPurify), and inlines it as a normal React element.

For a static icon set that ships with your app, [SVGR](https://www.npmjs.com/package/@svgr/core) is
the better fit - it works at build time with zero runtime cost. Reach for `svgin-react` when the SVG's
content isn't known until runtime: fetched from a URL, returned by an API, or stored in a database.

## Quick start

```tsx
import { SvgIn } from 'svgin-react';

export default function AlertIcon() {
    return <SvgIn src="/icons/alert.svg" width={24} fill="#f00" />;
}
```

This one import works in both a client component and a server component. In a Next.js App Router
file, add `'use client'` at the top if you specifically want the client version. To force one or the
other:

```tsx
import { SvgIn as SvgInClient } from 'svgin-react/client'; // client component
import { SvgIn as SvgInServer } from 'svgin-react/server'; // server component
```

The default sanitizer needs [`dompurify`](https://github.com/cure53/DOMPurify) as a peer dependency,
and on the server it also needs [`jsdom`](https://github.com/jsdom/jsdom) - both are optional, loaded
lazily only when the default sanitizer actually runs. If you always pass your own `sanitizeFn`, or
always use `disableSanitization`, you don't need either.

<details>
<summary><strong>More examples</strong>: raw markup, authenticated fetch, accessibility, custom sanitizer, callbacks, lazy loading</summary>

Raw markup you already have (from a CMS or API response), no fetch needed:

```tsx
const { icon } = await cms.getContent(); // icon is a raw SVG string
<SvgIn svg={icon} width={24} />
```

Fetching from an authenticated endpoint:

```tsx
<SvgIn src="/api/user-uploaded-icon" fetchOptions={{ headers: { Authorization: `Bearer ${token}` } }} />
```

Accessible name and description:

```tsx
<SvgIn src="/icons/alert.svg" title="Alert" description="Indicates a warning that needs attention" />
```

Custom sanitizer, or skip sanitization for SVGs you trust completely:

```tsx
<SvgIn src="/icons/alert.svg" sanitizeFn={async (svg) => svg} />
<SvgIn src="/icons/alert.svg" disableSanitization />
```

Error and mount callbacks:

```tsx
<SvgIn
    src="/icons/alert.svg"
    onError={(error) => reportToTelemetry(error)}
    onMount={(svg) => svg.classList.add('ready')}
/>
```

Deferring the fetch until the icon scrolls near the viewport, for icon-heavy lists:

```tsx
<SvgIn src="/icons/alert.svg" loading="lazy" />
```

Sharing defaults (`className`, `fallback`, `onError`, `loading`, etc.) across many icons:

```tsx
import { SvgInProvider } from 'svgin-react/client';

<SvgInProvider fallback={<IconPlaceholder />} onError={reportToTelemetry}>
    <SvgIn src="/icons/alert.svg" />
    <SvgIn src="/icons/info.svg" /> {/* same fallback/onError, unless overridden */}
</SvgInProvider>
```

</details>

<details>
<summary><strong>Suspense</strong>: <code>&lt;SvgInSuspense /&gt;</code> suspends via React 19's <code>use()</code> instead of managing its own loading/error state</summary>

```tsx
import { SvgInSuspense } from 'svgin-react/suspense';

<Suspense fallback={<IconSkeleton />}>
    <SvgInSuspense src="/icons/alert.svg" />
</Suspense>
```

Pair it with a `<Suspense>` boundary and an error boundary instead of `fallback`/`loadingFallback`. It
doesn't automatically retry a failed `src` - a persistently-failing fetch stays failed rather than
retrying forever, but recovering needs remounting the boundary (e.g. an error boundary's own reset), not
something this entry point does on its own.

</details>

<details>
<summary><strong>Shadow DOM</strong>: <code>&lt;SvgInShadow /&gt;</code> encapsulates the SVG's style in a shadow root, in both directions</summary>

```tsx
import { SvgInShadow } from 'svgin-react/shadow';

<SvgInShadow src="/icons/alert.svg" styles="path { fill: red; }" />
```

Page CSS can't reach in to affect the SVG, and the `styles` prop's CSS can never leak out onto the
page. Use it when a source SVG's inline `<style>` block needs to stay scoped to that one instance -
`<SvgIn />` renders into the light DOM, so an SVG's own inline `<style>` is only scoped as far as CSS
attribute/class selectors make it, same as any other inline markup on the page.

</details>

<details>
<summary><strong>Preloading and cache utilities</strong>: warm the cache ahead of render, invalidate it on demand</summary>

```ts
import { clearSvgCache, hasCachedSvg, preloadSvg } from 'svgin-react/core';

await preloadSvg('/icons/alert.svg'); // fetches and caches ahead of render
hasCachedSvg('/icons/alert.svg');     // true, no fetch
clearSvgCache('/icons/alert.svg');    // forget one entry (or clearSvgCache() for all)
```

A later `<SvgIn src={url} />` for the same URL resolves from the cache instead of fetching again -
only for the default sanitizer with no `fetchOptions`; a custom `sanitizeFn`, `disableSanitization`, or
`fetchOptions` all opt that call out of the shared cache (see `packages/core`'s own
`fetchAndSanitizeSvgBase.ts` for why).

</details>

## Choosing an entry point

| Entry point | Use for |
| --- | --- |
| `svgin-react` | Auto-resolves to the server or client component depending on where it's imported. |
| `svgin-react/client` | `<SvgIn />` and `<SvgInProvider>`, forced client. |
| `svgin-react/server` | `<SvgIn />`, forced server. |
| `svgin-react/core` | `preloadSvg`, `clearSvgCache`, `hasCachedSvg` - no React component. |
| `svgin-react/suspense` | `<SvgInSuspense />`. |
| `svgin-react/shadow` | `<SvgInShadow />`. |
| `svgin-react/all` | Every client + core export behind one import. |

`<SvgInSuspense />` and `<SvgInShadow />` each get their own entry point so they cost nothing to
consumers who don't use them - see each entry point's own bundle-size budget below.

## Not using React?

[`svgin-element`](../element) is the same sanitize-by-default SVG loading as a framework-agnostic
native Custom Element (`<svg-in src="..." />`) - works in any HTML page, no React required, built on
the same [`svgin-core`](../core) internals as this package. Not published to npm yet - see
[#18](https://github.com/akhiakl/svgin/issues/18)/[#19](https://github.com/akhiakl/svgin/issues/19).

## Security

SVGs are sanitized with DOMPurify by default. Use your own `sanitizeFn`, or set
`disableSanitization`, only for SVGs you fully trust.

## Bundle size

Each entry point has its own gzip budget in `size-budget.json`, checked against the built `dist/*.cjs`
output (the worst case for size - ESM is what bundlers tree-shake most aggressively) via
`pnpm run size`. Current budgets, with headroom over what's actually built today:

| Entry point | Budget (gzip) |
| --- | --- |
| `/client` | 3.5 KB |
| `/server` | 3.0 KB |
| `/core` | 1.75 KB |
| `/suspense` | 3.0 KB |
| `/shadow` | 3.25 KB |
| `/all` | 5.0 KB |

Bump a budget only with a comment (in the PR, since `size-budget.json` itself can't hold one) explaining
why the change legitimately needs the extra size - this is meant to catch accidental bloat, not to
block every change. These specific numbers jumped once (see [#15](https://github.com/akhiakl/svgin/issues/15)'s
parity check): the original budgets in #20 were measured against a build that silently never bundled
`svgin-core` at all (tsup/esbuild auto-externalizes anything listed in this package's own
`dependencies`, `svgin-core` included, unless told `noExternal` - see `tsup.config.ts`'s own comment).
That build would have been broken for every real consumer (`svgin-core` is never published to npm) -
these are the real, honest numbers for a build that actually works.

## Development

This package lives inside the [`svgin`](../..) Turborepo monorepo - see the root README and the
`svgin-monorepo` skill for the shared build/test/release setup. Fuller usage documentation
(props reference, caching/identity semantics, Suspense retry behavior) currently lives in the
published [`akhiakl/svgin-react`](https://github.com/akhiakl/svgin-react) repo's own `docs/`; that
content is expected to move here once this package takes over publishing (see #19).
