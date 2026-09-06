import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'API reference',
    description:
        'Full prop reference for <SvgIn />, <SvgInSuspense />, <SvgInProvider />, <SvgInShadow />, preloadSvg(), clearSvgCache(), and hasCachedSvg() - every prop svgin-react accepts, in one table.',
    path: '/docs/api',
});

const PROPS: Array<{ name: string; type: string; note: string }> = [
    { name: 'src', type: 'string', note: 'URL to fetch. Ignored if svg is also given. src or svg is required.' },
    { name: 'svg', type: 'string', note: 'Raw SVG markup, sanitized and rendered directly. Takes precedence over src.' },
    { name: 'width / height', type: 'number | string', note: '' },
    { name: 'fill', type: 'string', note: '' },
    { name: 'className', type: 'string', note: '' },
    { name: 'ariaLabel', type: 'string', note: '' },
    { name: 'title / description', type: 'string', note: 'Injects a <title>/<desc> into the rendered SVG.' },
    { name: 'fallback', type: 'ReactNode', note: 'Rendered on fetch/sanitize failure. Not used by SvgInSuspense.' },
    {
        name: 'loadingFallback',
        type: 'ReactNode',
        note: 'Client component only. Rendered while pending, instead of the default placeholder.',
    },
    { name: 'sanitizeFn', type: '(svg: string) => Promise<string>', note: 'Overrides the default DOMPurify sanitizer.' },
    { name: 'disableSanitization', type: 'boolean', note: 'Skip sanitization entirely. Only for markup you already trust.' },
    { name: 'fetchOptions', type: 'RequestInit', note: 'Passed to fetch for src, for an authenticated endpoint. Ignored when svg is given.' },
    { name: 'onError', type: '(error: Error) => void', note: 'Called on fetch/sanitize failure, alongside fallback.' },
    { name: 'onMount', type: '(svg: SVGSVGElement) => void', note: 'Client component only. Called after the SVG mounts or updates.' },
    {
        name: 'loading',
        type: "'eager' | 'lazy'",
        note: 'Client component only. \'lazy\' defers fetch/sanitize until near the viewport.',
    },
];

export default function ApiPage() {
    return (
        <article className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">API reference</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    <code className="font-mono text-xs">&lt;SvgIn /&gt;</code>, <code className="font-mono text-xs">&lt;SvgInSuspense /&gt;</code>,{' '}
                    <code className="font-mono text-xs">&lt;SvgInProvider&gt;</code>, and <code className="font-mono text-xs">&lt;SvgInShadow /&gt;</code>{' '}
                    share the props table below, with the exceptions noted per export.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">&lt;SvgIn /&gt;</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    From <code className="font-mono text-xs">svgin-react/client</code> or{' '}
                    <code className="font-mono text-xs">svgin-react/server</code>. The server version&apos;s{' '}
                    <code className="font-mono text-xs">onMount</code> and <code className="font-mono text-xs">loading</code>{' '}
                    are no-ops (no DOM to hand back, no loading state to defer).
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">&lt;SvgInSuspense /&gt;</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    From <code className="font-mono text-xs">svgin-react/suspense</code>. Suspends via React 19&apos;s{' '}
                    <code className="font-mono text-xs">use()</code> instead of managing loading/error state itself.
                    Does not accept <code className="font-mono text-xs">fallback</code>, <code className="font-mono text-xs">loadingFallback</code>, or{' '}
                    <code className="font-mono text-xs">loading</code> - pair it with a real{' '}
                    <code className="font-mono text-xs">&lt;Suspense&gt;</code> boundary and an error boundary instead.
                    See the <Link className="underline underline-offset-4 hover:text-foreground" href="/suspense">live demo</Link>.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">&lt;SvgInProvider /&gt;</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    From <code className="font-mono text-xs">svgin-react/client</code>. Sets shared{' '}
                    <code className="font-mono text-xs">className</code>, <code className="font-mono text-xs">fallback</code>,{' '}
                    <code className="font-mono text-xs">loadingFallback</code>, <code className="font-mono text-xs">onError</code>,{' '}
                    <code className="font-mono text-xs">sanitizeFn</code>, <code className="font-mono text-xs">disableSanitization</code>, and{' '}
                    <code className="font-mono text-xs">loading</code> defaults for every <code className="font-mono text-xs">&lt;SvgIn /&gt;</code>{' '}
                    beneath it. A prop passed directly to a given <code className="font-mono text-xs">&lt;SvgIn /&gt;</code> always wins. Not read by{' '}
                    <code className="font-mono text-xs">&lt;SvgInSuspense /&gt;</code>. See the{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/provider">live demo</Link>.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">&lt;SvgInShadow /&gt;</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    From <code className="font-mono text-xs">svgin-react/shadow</code>. Renders into a shadow root
                    attached to a host <code className="font-mono text-xs">&lt;span&gt;</code> (or{' '}
                    <code className="font-mono text-xs">&lt;div&gt;</code>) instead of the light DOM, so page CSS can
                    never reach in and its own <code className="font-mono text-xs">styles</code> can never leak out.
                    Shares most props with <code className="font-mono text-xs">&lt;SvgIn /&gt;</code> (see the shared
                    table below), plus its own <code className="font-mono text-xs">styles</code> (CSS injected inside
                    the shadow root), <code className="font-mono text-xs">mode</code> ({' '}
                    <code className="font-mono text-xs">&apos;open&apos; | &apos;closed&apos;</code>, passed to{' '}
                    <code className="font-mono text-xs">attachShadow</code>), and <code className="font-mono text-xs">as</code>{' '}
                    (<code className="font-mono text-xs">&apos;span&apos; | &apos;div&apos;</code>, the host tag). No{' '}
                    <code className="font-mono text-xs">className</code>, <code className="font-mono text-xs">loadingFallback</code>,
                    or <code className="font-mono text-xs">loading</code> yet, and not read by{' '}
                    <code className="font-mono text-xs">&lt;SvgInProvider&gt;</code>. See the{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/shadow">live demo</Link>.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">preloadSvg(url, options?)</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    From <code className="font-mono text-xs">svgin-react/core</code>. Fetches and caches an SVG ahead of
                    render, so the eventual <code className="font-mono text-xs">&lt;SvgIn src={'{url}'} /&gt;</code> resolves
                    instantly from cache. Accepts <code className="font-mono text-xs">sanitizeFn</code>,{' '}
                    <code className="font-mono text-xs">disableSanitization</code>, and{' '}
                    <code className="font-mono text-xs">fetchOptions</code>.
                </p>
                <CodeBlock className="mt-3" code={`import { preloadSvg } from 'svgin-react/core';\n\npreloadSvg('/icons/alert.svg');`} />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">clearSvgCache(url?)</code> /{' '}
                    <code className="font-mono text-base">hasCachedSvg(url)</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Also from <code className="font-mono text-xs">svgin-react/core</code>.{' '}
                    <code className="font-mono text-xs">clearSvgCache</code> forgets one cached entry, or every entry
                    if <code className="font-mono text-xs">url</code> is omitted.{' '}
                    <code className="font-mono text-xs">hasCachedSvg</code> checks whether a URL is currently cached,
                    without fetching it. Both only see the same shared cache that a plain{' '}
                    <code className="font-mono text-xs">&lt;SvgIn src={'{url}'} /&gt;</code> (no{' '}
                    <code className="font-mono text-xs">sanitizeFn</code>/<code className="font-mono text-xs">disableSanitization</code>/
                    <code className="font-mono text-xs">fetchOptions</code>) and <code className="font-mono text-xs">preloadSvg</code>{' '}
                    read from and write to.
                </p>
                <CodeBlock
                    className="mt-3"
                    code={`import { clearSvgCache, hasCachedSvg } from 'svgin-react/core';\n\nhasCachedSvg('/icons/alert.svg'); // false\nclearSvgCache('/icons/alert.svg'); // or clearSvgCache() for every entry`}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Shared props</h2>
                <div className="mt-3 overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2 font-medium">Prop</th>
                                <th className="px-3 py-2 font-medium">Type</th>
                                <th className="px-3 py-2 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PROPS.map((prop) => (
                                <tr key={prop.name} className="border-t">
                                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{prop.name}</td>
                                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">{prop.type}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{prop.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </article>
    );
}
