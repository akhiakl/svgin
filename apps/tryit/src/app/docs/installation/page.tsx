import Link from 'next/link';
import { PackageManagerInstall } from '@/components/package-manager-install';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Installation',
    description:
        'Install svgin-react with pnpm, npm, yarn, or bun, plus the optional dompurify/jsdom peer dependencies the default sanitizer needs.',
    path: '/docs/installation',
});

const ENTRY_POINTS: Array<{ path: string; exports: string; notes: string }> = [
    { path: 'svgin-react', exports: 'SvgIn', notes: 'Resolves to the server or client component depending on where it is imported.' },
    { path: 'svgin-react/client', exports: 'SvgIn, SvgInProvider', notes: 'Forced client.' },
    { path: 'svgin-react/server', exports: 'SvgIn', notes: 'Forced server.' },
    { path: 'svgin-react/core', exports: 'preloadSvg, clearSvgCache, hasCachedSvg', notes: 'No React component, works in either environment.' },
    { path: 'svgin-react/suspense', exports: 'SvgInSuspense', notes: 'Own entry point so it costs nothing unless you use it.' },
    { path: 'svgin-react/shadow', exports: 'SvgInShadow', notes: 'Own entry point so it costs nothing unless you use it.' },
    { path: 'svgin-react/all', exports: 'Every client + core export', notes: 'One import, larger bundle - for when you would rather not choose.' },
];

export default function InstallationPage() {
    return (
        <article className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Installation</h1>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Install the package</h2>
                <PackageManagerInstall className="mt-3" packages="svgin-react" />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Sanitization dependencies</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    <code className="font-mono text-xs">dompurify</code> and <code className="font-mono text-xs">jsdom</code>{' '}
                    are peer dependencies, not bundled. Install <code className="font-mono text-xs">dompurify</code> for
                    the client sanitizer, and both for the server one (jsdom builds the DOM DOMPurify sanitizes
                    against, since there is no browser DOM on the server).
                </p>
                <PackageManagerInstall className="mt-3" packages="dompurify jsdom" />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Import paths</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Pick the entry point that matches where a component actually runs and what it needs, rather than
                    importing from <code className="font-mono text-xs">svgin-react</code> everywhere. Full reasoning
                    in the <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/api">API reference</Link>.
                </p>
                <div className="mt-3 overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2 font-medium">Entry point</th>
                                <th className="px-3 py-2 font-medium">Exports</th>
                                <th className="px-3 py-2 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ENTRY_POINTS.map((entry) => (
                                <tr key={entry.path} className="border-t align-top">
                                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{entry.path}</td>
                                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{entry.exports}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{entry.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </article>
    );
}
