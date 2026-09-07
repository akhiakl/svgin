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
example), so they can never be combined into one barrel without a collision. There's no build step at
all - `package.json`'s `exports` map points each subpath (`svgin-core/sanitizeServer`,
`svgin-core/fetchAndSanitizeSvgClient`, etc.) directly at its own raw `.ts` file, bundled straight into
`packages/react`/`packages/element`'s own `tsup` output instead (see those packages' own
`tsup.config.ts` for why - a real `dist/` here once broke `vi.mock` on these subpaths).

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
- `instanceId.ts`, used by both `packages/react` and `packages/element` for per-instance SVG id
  uniquification; `resolveSvgPromiseClient.ts`, `packages/react`-only (the `(src|svg)` precedence
  resolver `<SvgIn />`'s fetch effect uses).

## Testing

Ported alongside the implementation from the source repo's own test suite, which enforces 100%
coverage on this exact code across all four metrics (statements/branches/functions/lines). Run
`pnpm run test:coverage` (`vitest run --coverage`) locally; CI enforces this for real via its own
"Coverage thresholds" job (`turbo run test:coverage`, separate from the plain `test` job - see the
root `svgin-monorepo` skill for why).
