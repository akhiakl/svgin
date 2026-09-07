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
export default defineTsupConfig({
    noExternal: ['svgin-core'],
});
