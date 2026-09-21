import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DEMOS } from '@/lib/demos';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';
import { VersionBadge, VersionBadgeFallback } from '@/components/version-badge';

// Structured data for search engines: identifies svgin as the actual project
// this site demos (two published packages, not one), separate from the
// site's own OG/Twitter metadata above (which describes this demo site, not
// the packages themselves).
const JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'svgin',
    description:
        'Fetch an SVG from a URL and render it as a real, styleable element, sanitized by default with DOMPurify. Published as @svgin/react (React components, client and server) and @svgin/element (a framework-agnostic <svg-in> custom element).',
    programmingLanguage: 'TypeScript',
    codeRepository: 'https://github.com/akhiakl/svgin',
    url: SITE_URL,
};

export const metadata = pageMetadata({
    title: 'Try svgin',
    description:
        'Fetch an SVG from a URL and render it as a real, styleable element, sanitized by default - as React components (@svgin/react) or a framework-agnostic custom element (@svgin/element). Try it live: the sanitizer Inspector, a server-component fetch, Suspense, SvgInProvider defaults, lazy loading, native SVG prop forwarding, SvgInShadow, and the <svg-in> web component.',
    path: '/',
});

export default function Home() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
            <div className="max-w-2xl">
                <Suspense fallback={<VersionBadgeFallback />}>
                    <VersionBadge />
                </Suspense>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Try svgin</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    svgin fetches an SVG from a URL (or takes raw markup directly) and renders it as a real,
                    styleable element instead of an <code className="font-mono text-sm">&lt;img&gt;</code>. It
                    sanitizes the SVG by default, so it is safe to use with an SVG you did not create yourself.
                    Published as{' '}
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://www.npmjs.com/package/@svgin/react"
                        target="_blank"
                        rel="noreferrer"
                    >
                        @svgin/react
                    </a>{' '}
                    (client and server React components) and{' '}
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://www.npmjs.com/package/@svgin/element"
                        target="_blank"
                        rel="noreferrer"
                    >
                        @svgin/element
                    </a>{' '}
                    (a framework-agnostic <code className="font-mono text-sm">&lt;svg-in&gt;</code> custom element,
                    no React required).
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    This site is installed as a real dependency from npm, not imported from either library&apos;s
                    source, so every demo below reflects exactly what a real install gives you.
                </p>
            </div>

            <h2 className="mt-14 text-lg font-semibold tracking-tight">Try it live</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DEMOS.map((demo) => (
                    <Link key={demo.href} href={demo.href} className="group">
                        <Card className="h-full transition-colors group-hover:border-foreground/30">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle>{demo.title}</CardTitle>
                                    {/* RSC gets the primary accent rather than another neutral badge -
                                        it is the one demo that ships zero client JS, worth distinguishing
                                        at a glance rather than blending in with every "Client" badge. */}
                                    <Badge variant={demo.badge === 'RSC' ? 'default' : 'secondary'}>{demo.badge}</Badge>
                                </div>
                                <CardDescription>{demo.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-foreground/80 group-hover:underline underline-offset-4">
                                    Open demo →
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
