import { defineTsupConfig } from 'svgin-tsup-config';

// Multi-entry, matching akhiakl/svgin-react's own tsup config: one output
// file per public entry point (client/server/core/suspense/shadow/all), not
// a single bundled index - each is its own tree-shaking boundary (see the
// comment in client.ts for why <SvgInSuspense />/<SvgInShadow /> live in
// their own entries rather than being re-exported from client.ts).
//
// svgin-core is NOT external: it's an internal-only workspace package with
// no build step of its own (see its package.json - exports raw source
// directly), so its code is bundled straight into this package's own
// output, exactly like the original monolithic akhiakl/svgin-react (where
// this was all one package to begin with). dompurify/jsdom - svgin-core's
// own dependencies, reached transitively through the bundled source - stay
// external, matching that original package's peerDependencies.
export default defineTsupConfig({
    entry: {
        client: 'src/client.ts',
        server: 'src/server.ts',
        core: 'src/core.ts',
        suspense: 'src/suspense.ts',
        shadow: 'src/shadow.ts',
        all: 'src/all.ts',
    },
    external: ['react', 'dompurify', 'jsdom'],
});
