import fs from 'node:fs';
import path from 'node:path';

// Fallback when the registry is unreachable. The package's exports map hides package.json, so read it from disk.
function readInstalledVersion(): string {
    try {
        const pkgPath = path.join(process.cwd(), 'node_modules', '@svgin', 'react', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };
        return pkg.version;
    } catch {
        return 'latest';
    }
}

// Shows the published version, not the installed one. Revalidated hourly.
const REGISTRY_FETCH_TIMEOUT_MS = 3000;

export async function getSvginReactVersion(): Promise<string> {
    try {
        const res = await fetch('https://registry.npmjs.org/@svgin/react/latest', {
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
