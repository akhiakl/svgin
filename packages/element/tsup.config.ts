import { defineTsupConfig } from 'svgin-tsup-config';

// noExternal is required to actually bundle svgin-core's source into this
// package's own output, the same way packages/react/tsup.config.ts does
// (see that file's own comment for the full explanation) - without it,
// tsup/esbuild auto-externalizes svgin-core since it's listed in this
// package's own `dependencies`, leaving a runtime `require("svgin-core/...")`
// that would break for any real consumer (svgin-core is never published to
// npm). Set here ahead of the real <svg-in> implementation (#18) landing,
// so that work doesn't have to rediscover this the same way #15's parity
// check did for packages/react.
//
// `external: ['dompurify', 'jsdom']` matches packages/react/tsup.config.ts:
// these are svgin-core's own dependencies, reached transitively through the
// now-bundled source, not this package's. Without listing them explicitly,
// esbuild's "auto-externalize what's in *this* package's own package.json
// dependencies" heuristic doesn't apply to them (they're only ever
// svgin-core's dependencies, never this package's own) and it bundles them
// inline instead - ballooning dist/index.cjs by DOMPurify's own ~28 KB
// (discovered while measuring this package's real bundle size for #18: a
// naive noExternal-only build came out to ~14 KB gzip, over 7x this
// package's actual budget, entirely from an inlined copy of DOMPurify).
// `<svg-in>` only ever reaches sanitizeClient.ts (never sanitizeServer.ts,
// so jsdom is unreachable from this package's own import graph in practice -
// listed anyway for parity/safety, same as svgin-react).
export default defineTsupConfig({
    noExternal: ['svgin-core'],
    external: ['dompurify', 'jsdom'],
});
