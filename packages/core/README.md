# svgin-core

Framework-agnostic fetch/sanitize/cache internals shared by [`svgin-react`](../react) and
[`svgin-element`](../element). Extracted from
[`akhiakl/svgin-react`](https://github.com/akhiakl/svgin-react)'s own `src/utils/`, which was already
cleanly framework-agnostic (no `react` import anywhere except `useLatestRef.ts`, which stayed behind
in `packages/react`).

**Internal package, never published to npm.** It's not an independent public API; it exists so the
other two packages don't duplicate fetch/sanitization/caching logic.

## Structure

Multi-entry, not a single bundled index: several modules deliberately export the same name for
different runtimes (`sanitizeClient.ts` and `sanitizeServer.ts` both export `sanitizeSvg`, for
example), so they can never be combined into one barrel without a collision. Each file builds to its
own output and is imported by its own subpath, `svgin-core/sanitizeServer`,
`svgin-core/fetchAndSanitizeSvgClient`, etc., matching how these modules were already split in the
source repo.

- `fetchAndSanitizeSvgBase.ts` / `-Client.ts` / `-Server.ts`, fetch a URL and sanitize the result,
  with the client/server split isolating `jsdom` (server-only, lazily imported) from the client bundle.
- `sanitizeClient.ts` / `sanitizeServer.ts`, the actual DOMPurify call, client (browser DOMPurify) vs
  server (`jsdom` + DOMPurify) variants.
- `sanitizeSvgStringBase.ts` / `-Client.ts` / `-Server.ts`, same sanitize-only path for raw SVG markup
  handed in directly (no fetch).
- `svgCache.ts`, the module-level cache keyed on URL, for the default (no custom `sanitizeFn`/
  `fetchOptions`) fetch path only, see the comments in `fetchAndSanitizeSvgBase.ts` for why.
- `universalCache.ts`, request memoization shared between client/server render paths.
- `buildSvgMarkup.ts`, `svgUtils.ts`, SVG markup manipulation (attribute extraction, ID
  uniquification for multiple instances of the same SVG on one page).
- `instanceId.ts`, `resolveSvgPromiseClient.ts`, small shared helpers used by more than one
  `packages/react` component.

## Testing

Ported alongside the implementation from the source repo's own test suite, which enforces 100% branch
coverage on this exact code (`vitest run --coverage`; not wired into the default `test` script/CI yet;
see `vitest.config.mts`).
