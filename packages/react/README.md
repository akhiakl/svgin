# @svgin/react

Securely fetch and inline SVGs from URLs as React components, sanitized by default, with client and
server support. Built on the shared [`svgin-core`](../core) internals, published to npm as
[`@svgin/react`](https://npmjs.com/package/@svgin/react).

```tsx
import { SvgIn } from '@svgin/react';

<SvgIn src="/icons/alert.svg" width={24} fill="#f00" />
```

## Why @svgin/react

An `<img src="icon.svg">` can't be styled with CSS - no color changes, no path animation, no targeting
inner elements. Inlining the SVG markup fixes that, but inlining raw markup from a URL you don't fully
control is a real security risk (an SVG can carry `<script>` tags, `onload` handlers, and other ways to
run JavaScript). `@svgin/react` fetches the SVG, sanitizes it with
[DOMPurify](https://github.com/cure53/DOMPurify), and inlines it as a normal React element.

For a static icon set that ships with your app, [SVGR](https://www.npmjs.com/package/@svgr/core) is
the better fit - it works at build time with zero runtime cost. Reach for `@svgin/react` when the SVG's
content isn't known until runtime: fetched from a URL, returned by an API, or stored in a database.

## Quick start

```tsx
import { SvgIn } from '@svgin/react';

export default function AlertIcon() {
    return <SvgIn src="/icons/alert.svg" width={24} fill="#f00" />;
}
```

This one import works in both a client component and a server component. In a Next.js App Router
file, add `'use client'` at the top if you specifically want the client version. To force one or the
other:

```tsx
import { SvgIn as SvgInClient } from '@svgin/react/client'; // client component
import { SvgIn as SvgInServer } from '@svgin/react/server'; // server component
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
import { SvgInProvider } from '@svgin/react/client';

<SvgInProvider fallback={<IconPlaceholder />} onError={reportToTelemetry}>
    <SvgIn src="/icons/alert.svg" />
    <SvgIn src="/icons/info.svg" /> {/* same fallback/onError, unless overridden */}
</SvgInProvider>
```

</details>

<details>
<summary><strong>Suspense</strong>: <code>&lt;SvgInSuspense /&gt;</code> suspends via React 19's <code>use()</code> instead of managing its own loading/error state</summary>

```tsx
import { SvgInSuspense } from '@svgin/react/suspense';

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
import { SvgInShadow } from '@svgin/react/shadow';

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
import { clearSvgCache, hasCachedSvg, preloadSvg } from '@svgin/react/core';

await preloadSvg('/icons/alert.svg'); // fetches and caches ahead of render
hasCachedSvg('/icons/alert.svg');     // true, no fetch
clearSvgCache('/icons/alert.svg');    // forget one entry (or clearSvgCache() for all)
```

A later `<SvgIn src={url} />` for the same URL resolves from the cache instead of fetching again -
only for the default sanitizer with no `fetchOptions`; a custom `sanitizeFn`, `disableSanitization`, or
`fetchOptions` all opt that call out of the shared cache (their result can differ per call, so it isn't
safe to share).

</details>

## Choosing an entry point

| Entry point | Use for |
| --- | --- |
| `@svgin/react` | Auto-resolves to the server or client component depending on where it's imported. |
| `@svgin/react/client` | `<SvgIn />` and `<SvgInProvider>`, forced client. |
| `@svgin/react/server` | `<SvgIn />`, forced server. |
| `@svgin/react/core` | `preloadSvg`, `clearSvgCache`, `hasCachedSvg` - no React component. |
| `@svgin/react/suspense` | `<SvgInSuspense />`. |
| `@svgin/react/shadow` | `<SvgInShadow />`. |
| `@svgin/react/all` | Every client + core export behind one import. |

`<SvgInSuspense />` and `<SvgInShadow />` each get their own entry point so they cost nothing to
consumers who don't use them.

## Not using React?

[`@svgin/element`](../element) is the same sanitize-by-default SVG loading as a framework-agnostic
native Custom Element (`<svg-in src="..." />`) - works in any HTML page, no React required, built on
the same [`svgin-core`](../core) internals as this package. Published to npm as
[`@svgin/element`](https://npmjs.com/package/@svgin/element).

## Security

SVGs are sanitized with DOMPurify by default. Use your own `sanitizeFn`, or set
`disableSanitization`, only for SVGs you fully trust.

## Bundle size

Each entry point stays small on purpose: `/client` and `/server` are each a few KB gzipped, and
`<SvgInSuspense />`/`<SvgInShadow />` cost nothing unless you actually import them (see "Choosing an
entry point" above).

## Contributing

This package lives inside the [`svgin`](https://github.com/akhiakl/svgin) monorepo - see that repo for
the build/test/release setup.
