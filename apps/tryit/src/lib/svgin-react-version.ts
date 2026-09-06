import fs from 'node:fs';
import path from 'node:path';

// Fallback only: if the npm registry is unreachable at build/render time,
// fall back to whatever is actually installed rather than showing nothing.
// svgin-react's package.json "exports" map does not expose "./package.json",
// so this reads the installed copy straight off disk instead of importing it.
function readInstalledVersion(): string {
    try {
        const pkgPath = path.join(process.cwd(), 'node_modules', 'svgin-react', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };
        return pkg.version;
    } catch {
        return 'latest';
    }
}

// The version badge on the home page should reflect what is actually
// published on npm right now, not just whatever this deployment happened to
// be built against, so fetch it from the registry instead of the local
// node_modules install. Revalidated hourly since it rarely changes.
const REGISTRY_FETCH_TIMEOUT_MS = 3000;

export async function getSvginReactVersion(): Promise<string> {
    try {
        const res = await fetch('https://registry.npmjs.org/svgin-react/latest', {
            next: { revalidate: 3600 },
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(REGISTRY_FETCH_TIMEOUT_MS),
        });
        if (!res.ok) return readInstalledVersion();
        const data = (await res.json()) as { version?: string };
        return data.version ?? readInstalledVersion();
    } catch {
        // Covers a non-2xx response, a network error, and a timed-out signal
        // (AbortSignal.timeout rejects the fetch instead of hanging forever).
        return readInstalledVersion();
    }
}
