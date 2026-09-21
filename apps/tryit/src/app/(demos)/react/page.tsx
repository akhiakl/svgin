import { Suspense } from 'react';
import Link from 'next/link';
import { DemoGrid } from '@/components/demo-grid';
import { DEMO_GROUPS } from '@/lib/demos';
import { pageMetadata } from '@/lib/metadata';
import { VersionBadge, VersionBadgeFallback } from '@/components/version-badge';

export const metadata = pageMetadata({
    title: '@svgin/react',
    description:
        'Fetch an SVG from a URL and render it as a real, styleable React element, sanitized by default. Try it live: the sanitizer Inspector, a server-component fetch, Suspense, SvgInProvider defaults, lazy loading, native SVG prop forwarding, and SvgInShadow.',
    path: '/react',
});

const REACT_DEMOS = DEMO_GROUPS.find((group) => group.id === 'react')!.demos;

export default function ReactPage() {
    return (
        <div>
            <div className="max-w-2xl">
                <Suspense fallback={<VersionBadgeFallback />}>
                    <VersionBadge />
                </Suspense>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">@svgin/react</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://www.npmjs.com/package/@svgin/react"
                        target="_blank"
                        rel="noreferrer"
                    >
                        @svgin/react
                    </a>{' '}
                    fetches an SVG from a URL (or takes raw markup directly) and renders it as a real, styleable
                    React element instead of an <code className="font-mono text-sm">&lt;img&gt;</code>. It sanitizes
                    the SVG by default, so it is safe to use with an SVG you did not create yourself, and it works
                    both in the browser and in React Server Components.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    Not using React?{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/element">
                        @svgin/element
                    </Link>{' '}
                    is the same sanitize-by-default loading as a framework-agnostic custom element.
                </p>
            </div>

            <h2 className="mt-14 text-lg font-semibold tracking-tight">Try it live</h2>
            <DemoGrid demos={REACT_DEMOS} />
        </div>
    );
}
