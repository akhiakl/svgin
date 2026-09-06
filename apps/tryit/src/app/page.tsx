import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DEMOS } from '@/lib/demos';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';
import { VersionBadge, VersionBadgeFallback } from '@/components/version-badge';

// Structured data for search engines: identifies svgin-react as the actual
// npm package this site demos, separate from the site's own OG/Twitter
// metadata above (which describes this demo site, not the package).
const JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'svgin-react',
    description:
        'Fetch an SVG from a URL and render it as a real, styleable React element. Sanitized by default with DOMPurify, works in the browser and in React Server Components.',
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    codeRepository: 'https://github.com/akhiakl/svgin-react',
    url: SITE_URL,
};

export const metadata = pageMetadata({
    title: 'Try svgin-react',
    description:
        'Fetch an SVG from a URL and render it as a real, styleable React element, sanitized by default. Try it live: the sanitizer Inspector, a server-component fetch, Suspense, SvgInProvider defaults, lazy loading, native SVG prop forwarding, and SvgInShadow.',
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
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Try svgin-react</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://www.npmjs.com/package/svgin-react"
                        target="_blank"
                        rel="noreferrer"
                    >
                        svgin-react
                    </a>{' '}
                    fetches an SVG from a URL (or takes raw markup directly) and renders it as a real, styleable
                    React element instead of an <code className="font-mono text-sm">&lt;img&gt;</code>. It sanitizes
                    the SVG by default, so it is safe to use with an SVG you did not create yourself, and it works
                    both in the browser and in React Server Components.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    This site is installed as a real dependency from npm, not imported from the library&apos;s
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
