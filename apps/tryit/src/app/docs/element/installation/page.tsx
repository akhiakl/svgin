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
        </article>
    );
}
