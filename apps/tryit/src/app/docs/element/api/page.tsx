import Link from 'next/link';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '@svgin/element: API reference',
    description: 'Full attribute, property, and event reference for <svg-in> - every attribute it accepts, in one table.',
    path: '/docs/element/api',
});

const ATTRIBUTES: Array<{ name: string; note: string }> = [
    { name: 'src', note: 'URL to fetch. Ignored if svg is also present.' },
    { name: 'svg', note: 'Raw SVG markup already in hand - sanitized and rendered directly, skipping the fetch step. Takes precedence over src.' },
    { name: 'width / height / fill', note: 'Forwarded verbatim (as strings) to the rendered <svg>, both for the loading placeholder and the resolved result.' },
    { name: 'class', note: 'Applies to the <svg-in> host as usual, and is additionally forwarded onto the rendered inner <svg>.' },
    { name: 'aria-label', note: 'Forwarded to the rendered <svg>. Disables the auto-wired aria-labelledby otherwise set when svg-title is present.' },
    { name: 'svg-title / svg-description', note: 'Injects a <title>/<desc> into the rendered SVG (accessible name/description).' },
    { name: 'disable-sanitization', note: 'Boolean attribute (presence, not value). Skips DOMPurify entirely - only for markup you already trust.' },
    { name: 'loading', note: "'eager' (default) or 'lazy'. 'lazy' defers fetch/sanitize until the element scrolls near the viewport, via IntersectionObserver." },
];

export default function ElementApiPage() {
    return (
        <article className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">@svgin/element: API reference</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Every DOM attribute on <code className="font-mono text-xs">&lt;svg-in&gt;</code> is a string; see
                    below for how each is read/coerced. Changing <code className="font-mono text-xs">src</code>/
                    <code className="font-mono text-xs">svg</code>/<code className="font-mono text-xs">disable-sanitization</code>{' '}
                    restarts the fetch/sanitize cycle; changing a purely presentational attribute just re-renders the
                    already-resolved result.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Attributes</h2>
                <div className="mt-3 overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2 font-medium">Attribute</th>
                                <th className="px-3 py-2 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ATTRIBUTES.map((attr) => (
                                <tr key={attr.name} className="border-t align-top">
                                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{attr.name}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{attr.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">sanitizeFn</code> / <code className="font-mono text-base">fetchOptions</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    JS properties, not attributes - a function or an arbitrary request-init object has no meaningful
                    string attribute representation. Setting either while the element is connected restarts the
                    fetch/sanitize cycle, same as changing <code className="font-mono text-xs">src</code>.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs">
                    <code>{`document.querySelector('svg-in').sanitizeFn = async (svg) => svg;
document.querySelector('svg-in').fetchOptions = { headers: { Authorization: 'Bearer ...' } };`}</code>
                </pre>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Events</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    No <code className="font-mono text-xs">onError</code>/<code className="font-mono text-xs">onMount</code>{' '}
                    callback props - a plain custom element has no prop channel. Instead, <code className="font-mono text-xs">&lt;svg-in&gt;</code>{' '}
                    dispatches two bubbling, composed <code className="font-mono text-xs">CustomEvent</code>s:{' '}
                    <code className="font-mono text-xs">svg-in-load</code> (<code className="font-mono text-xs">detail: {'{ svg: SVGSVGElement }'}</code>) and{' '}
                    <code className="font-mono text-xs">svg-in-error</code> (<code className="font-mono text-xs">detail: {'{ error: Error }'}</code>).
                    See it live at <Link className="underline underline-offset-4 hover:text-foreground" href="/element">/element</Link>.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs">
                    <code>{`const el = document.querySelector('svg-in');
el.addEventListener('svg-in-load', (e) => console.log('loaded', e.detail.svg));
el.addEventListener('svg-in-error', (e) => console.error('failed', e.detail.error));`}</code>
                </pre>
            </div>
        </article>
    );
}
