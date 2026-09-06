import { defineConfig } from 'tsup';
import { readdirSync } from 'node:fs';

// Multi-entry build, one output file per source module (not a single bundled
// index): several modules deliberately export the same name for different
// runtimes (sanitizeClient.ts vs sanitizeServer.ts both export `sanitizeSvg`,
// for example - see the comment in each), so they can never be combined into
// one barrel without a collision. Consumers (packages/react) import each
// module by its own subpath, matching how these files were split in
// akhiakl/svgin-react's own src/utils/ before this extraction.
const entries = readdirSync('src')
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map((f) => `src/${f}`);

export default defineConfig({
    entry: entries,
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    external: ['dompurify', 'jsdom'],
    outExtension({ format }) {
        return { js: format === 'cjs' ? '.cjs' : '.mjs' };
    },
});
