# svgin-element

Framework-agnostic `<svg-in>` custom element: securely fetch and inline SVGs from URLs, sanitized by
default.

Built on **vanilla native Custom Elements** (`class SvgIn extends HTMLElement`), no Lit, no Stencil,
for zero *framework* dependency and the smallest possible bundle, wrapping [`svgin-core`](../core)'s
fetch/sanitize/cache logic - the same internals [`svgin-react`](../react)'s `<SvgIn />` is built on.
The default sanitizer still needs [DOMPurify](https://github.com/cure53/DOMPurify) (an optional peer
dependency, same as `svgin-react`), unless you pass your own `sanitizeFn` or `disableSanitization`.

> **Status:** real implementation (see [#18](https://github.com/akhiakl/svgin/issues/18)), demoed live
> in `apps/tryit` at [`/element`](https://svgin-tryit.vercel.app/element) (see
> [#21](https://github.com/akhiakl/svgin/issues/21)). Not published to npm from this monorepo yet -
> see [#19](https://github.com/akhiakl/svgin/issues/19). **Update this README (and any docs-site page)
> in the same PR/build whenever `<svg-in>`'s public API or behavior changes**, see the
> `svgin-monorepo` skill.

## Using React?

[`svgin-react`](../react)'s `<SvgIn />` is the same sanitize-by-default SVG loading as a React
component, with client and server variants, `<SvgInProvider>` shared defaults, Suspense support, and
more - built on the same [`svgin-core`](../core) internals as this package. Already published to npm
as [`svgin-react`](https://npmjs.com/package/svgin-react) (continuing that existing package).

## Usage

```html
<script type="module">
    import 'svgin-element'; // registers <svg-in> as a side effect
</script>

<svg-in src="/icons/logo.svg" width="24" height="24" fill="currentColor"></svg-in>
```

## Rendering model: light DOM, not shadow DOM

`<svg-in>` inlines the sanitized `<svg>` as a **direct child of the element itself** (light DOM), not
inside a shadow root. This is a deliberate choice, not an oversight - it mirrors `<SvgIn />`'s own
default in `svgin-react` (`<SvgInShadow />` is the separate, shadow-DOM opt-in component over there).
Rendering into light DOM means ordinary page CSS can style the icon directly (`svg-in svg { fill: ... }`,
or via the `class`/`fill`/`width`/`height` attributes forwarded straight onto the rendered `<svg>` - see
below). A shadow-DOM rendering mode (e.g. a `shadow` attribute) is left for a follow-up once there's a
real consumer need for it - this first implementation only ships the light-DOM behavior.

## Attributes

Every DOM attribute is a string; see below for how each is read/coerced.

| Attribute | Meaning |
| --- | --- |
| `src` | URL to fetch. Ignored if `svg` is also present. |
| `svg` | Raw SVG markup already in hand - sanitized and rendered directly, skipping the fetch step. Takes precedence over `src`. |
| `width` / `height` / `fill` | Forwarded verbatim (as strings - no numeric coercion) to the rendered `<svg>`, both for the loading placeholder and the resolved result. |
| `class` | The native attribute already applies to the `<svg-in>` host regardless; it's additionally forwarded onto the rendered inner `<svg>` (mirrors `<SvgIn className={...} />` applying `className` to the rendered `<svg>`, not a wrapper). |
| `aria-label` | Forwarded to the rendered `<svg>`. An explicit `aria-label` disables the auto-wired `aria-labelledby` this element otherwise sets when `svg-title` is present. |
| `svg-title` / `svg-description` | Injects a `<title>`/`<desc>` into the rendered SVG (accessible name/description). Deliberately **not** named `title`/`description`: a plain `title` attribute is a global HTML attribute every browser already gives special meaning (a hover tooltip) to on any element - reusing that name would silently conflict with native behavior instead of cleanly mapping to `SvgInProps.title`. |
| `disable-sanitization` | Boolean attribute (presence, not value - same convention as `disabled`/`hidden`). Skips DOMPurify entirely. Only use this for markup you already trust. |
| `loading` | `'eager'` (default) or `'lazy'`. `'lazy'` defers the fetch/sanitize until the element scrolls near the viewport, via `IntersectionObserver` (`rootMargin: '200px'`, same as `<SvgIn loading="lazy" />`). Falls back to eager loading when `IntersectionObserver` isn't available, or when `svg` is set (there's nothing to fetch). |

`attributeChangedCallback` reacts to `src`/`svg`/`disable-sanitization` changes by restarting the whole
fetch/sanitize cycle. Changing a purely presentational attribute (`width`/`height`/`fill`/`class`/
`aria-label`/`svg-title`/`svg-description`) re-renders the already-resolved (or still-pending) result
without touching the network again.

## `sanitizeFn` / `fetchOptions`: JS properties, not attributes

```js
document.querySelector('svg-in').sanitizeFn = async (svg) => svg; // custom sanitizer
document.querySelector('svg-in').fetchOptions = { headers: { Authorization: 'Bearer ...' } };
```

A function or an arbitrary request-init object has no meaningful string attribute representation, so
these are plain JS properties instead of attributes. Setting either while the element is connected
restarts the fetch/sanitize cycle, same as changing `src`.

## Events instead of callback props

There is no `onError`/`onMount` callback property the way `<SvgIn onError={...} onMount={...} />` has
one - a plain custom element has no prop channel for a callback to hang off of. Instead, `<svg-in>`
dispatches two bubbling, composed `CustomEvent`s:

- `svg-in-load` - `detail: { svg: SVGSVGElement }` - once the sanitized SVG is inlined.
- `svg-in-error` - `detail: { error: Error }` - when the fetch or sanitization fails. Nothing is
  rendered in this case (any previous content, including the loading placeholder, is cleared); there is
  no `fallback` attribute equivalent (an arbitrary fallback has no attribute-string representation) -
  listen for this event and react instead (set different attributes, swap the element, etc.).

```js
const el = document.querySelector('svg-in');
el.addEventListener('svg-in-load', (e) => console.log('loaded', e.detail.svg));
el.addEventListener('svg-in-error', (e) => console.error('failed', e.detail.error));
```

## Lifecycle

- `connectedCallback` starts (or restarts) the load cycle. Disconnecting and reconnecting an element
  (e.g. moving it in the DOM) restarts the load cycle from scratch - the same semantics a React
  unmount+remount would have (the shared `svgCache` is what keeps that fast rather than a genuine
  network refetch).
- `disconnectedCallback` releases any in-flight fetch via `releaseFetchAndSanitizeSvg` (the same
  reference-counted cache-release pattern `<SvgIn />`'s effect cleanup uses) and tears down any active
  `IntersectionObserver`.
- Double-registration (`customElements.define('svg-in', ...)`) is guarded against, so loading this
  module more than once (two bundles, an HMR reload) is safe.

## Bundle size

`size-budget.json` sets a gzip budget for the built `dist/index.cjs` output, checked via
`pnpm run size`, with headroom over what's actually built today:

| Entry point | Budget (gzip) |
| --- | --- |
| `index.cjs` (default export) | 4.25 KB |

Bump this only with a comment (in the PR, since `size-budget.json` itself can't hold one) explaining why
the change legitimately needs the extra size.
