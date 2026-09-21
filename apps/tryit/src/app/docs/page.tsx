import Link from 'next/link';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Docs',
    description:
        'How svgin fetches an SVG from a URL, or takes raw markup directly, and renders it as a real, styleable element sanitized with DOMPurify by default - as React components or a framework-agnostic custom element.',
    path: '/docs',
});

export default function DocsPage() {
    return (
        <article className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Introduction</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    svgin fetches an SVG from a URL, or takes raw markup directly, and renders it as a real,
                    styleable element instead of an <code className="font-mono text-sm">&lt;img&gt;</code>. It
                    sanitizes the SVG with DOMPurify by default, so it is safe to use with SVGs from a source you do
                    not fully control. It ships as two packages, sharing the same fetch/sanitize/cache internals:
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">@svgin/react</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Client and server React components - <code className="font-mono text-xs">&lt;SvgIn /&gt;</code>,{' '}
                    <code className="font-mono text-xs">&lt;SvgInSuspense /&gt;</code>,{' '}
                    <code className="font-mono text-xs">&lt;SvgInProvider&gt;</code>, and{' '}
                    <code className="font-mono text-xs">&lt;SvgInShadow /&gt;</code>.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Continue to{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/react/installation">
                        Installation
                    </Link>{' '}
                    or jump straight to the{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/react/api">
                        API reference
                    </Link>
                    , or see it live at <Link className="underline underline-offset-4 hover:text-foreground" href="/react">/react</Link>.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <code className="font-mono text-base">@svgin/element</code>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    A framework-agnostic <code className="font-mono text-xs">&lt;svg-in&gt;</code> custom element -
                    no React required, works in any framework or none.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Continue to{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/element/installation">
                        Installation
                    </Link>{' '}
                    or jump straight to the{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/element/api">
                        API reference
                    </Link>
                    , or see it live at <Link className="underline underline-offset-4 hover:text-foreground" href="/element">/element</Link>.
                </p>
            </div>
        </article>
    );
}
