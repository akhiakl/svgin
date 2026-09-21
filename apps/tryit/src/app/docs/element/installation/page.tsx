import Link from 'next/link';
import { PackageManagerInstall } from '@/components/package-manager-install';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '@svgin/element: Installation',
    description: 'Install @svgin/element with pnpm, npm, yarn, or bun, plus the optional dompurify peer dependency the default sanitizer needs.',
    path: '/docs/element/installation',
});

export default function ElementInstallationPage() {
    return (
        <article className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">@svgin/element: Installation</h1>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Install the package</h2>
                <PackageManagerInstall className="mt-3" packages="@svgin/element" />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Sanitization dependency</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    <code className="font-mono text-xs">dompurify</code> is an optional peer dependency, not bundled -
                    install it to use the default sanitizer, or skip it entirely if you always pass your own{' '}
                    <code className="font-mono text-xs">sanitizeFn</code> or set{' '}
                    <code className="font-mono text-xs">disable-sanitization</code>.
                </p>
                <PackageManagerInstall className="mt-3" packages="dompurify" />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Register the element</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    One import, one entry point - unlike <code className="font-mono text-xs">@svgin/react</code>,{' '}
                    <code className="font-mono text-xs">@svgin/element</code> has no client/server split (a custom
                    element only ever runs in the browser), so there is nothing to choose between. Importing it
                    registers <code className="font-mono text-xs">&lt;svg-in&gt;</code> globally as a side effect.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs">
                    <code>{`import '@svgin/element'; // registers <svg-in> as a side effect

<svg-in src="/icons/logo.svg" width="24" height="24" fill="currentColor"></svg-in>`}</code>
                </pre>
                <p className="mt-2 text-sm text-muted-foreground">
                    Full attribute/property/event reference in the{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/element/api">API reference</Link>.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Using from a CDN, no build tool</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    <code className="font-mono text-xs">dompurify</code> is loaded lazily via a bare{' '}
                    <code className="font-mono text-xs">import(&apos;dompurify&apos;)</code>, which only resolves
                    in a plain browser <code className="font-mono text-xs">{'<script type="module">'}</code> (no
                    bundler) with an{' '}
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap"
                        target="_blank"
                        rel="noreferrer"
                    >
                        import map
                    </a>{' '}
                    telling the browser where to fetch it from. Any npm package is automatically mirrored on{' '}
                    <a className="underline underline-offset-4 hover:text-foreground" href="https://unpkg.com" target="_blank" rel="noreferrer">
                        unpkg
                    </a>{' '}
                    and{' '}
                    <a className="underline underline-offset-4 hover:text-foreground" href="https://www.jsdelivr.com" target="_blank" rel="noreferrer">
                        jsDelivr
                    </a>
                    , so no separate CDN publish step is needed.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs">
                    <code>{`<script type="importmap">
{
  "imports": {
    "dompurify": "https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.mjs"
  }
}
</script>
<script type="module" src="https://unpkg.com/@svgin/element"></script>

<svg-in src="/icons/logo.svg" width="24" height="24" fill="currentColor"></svg-in>`}</code>
                </pre>
                <p className="mt-2 text-sm text-muted-foreground">
                    Pin exact versions for anything beyond a quick demo. If you pass your own{' '}
                    <code className="font-mono text-xs">sanitizeFn</code> or use{' '}
                    <code className="font-mono text-xs">disable-sanitization</code>, DOMPurify is never imported
                    at all and the import map can be skipped entirely.
                </p>
            </div>
        </article>
    );
}
