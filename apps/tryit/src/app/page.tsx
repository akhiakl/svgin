import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';

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
        'Fetch an SVG from a URL and render it as a real, styleable element, sanitized by default - as React components (@svgin/react) or a framework-agnostic custom element (@svgin/element).',
    path: '/',
});

const PACKAGES = [
    {
        href: '/react',
        name: '@svgin/react',
        tagline: 'Client and server React components',
        description: '<SvgIn />, <SvgInSuspense />, <SvgInProvider>, and <SvgInShadow /> - sanitize-by-default SVG loading for React.',
    },
    {
        href: '/element',
        name: '@svgin/element',
        tagline: 'A framework-agnostic custom element',
        description: '<svg-in>, a real vanilla Custom Element - works in any framework, or none, no React required.',
    },
] as const;

export default function Home() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
            <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Try svgin</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    svgin fetches an SVG from a URL (or takes raw markup directly) and renders it as a real,
                    styleable element instead of an <code className="font-mono text-sm">&lt;img&gt;</code>. It
                    sanitizes the SVG by default, so it is safe to use with an SVG you did not create yourself.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    This site is installed as a real dependency from npm, not imported from either library&apos;s
                    source, so every demo below reflects exactly what a real install gives you.
                </p>
            </div>

            <h2 className="mt-14 text-lg font-semibold tracking-tight">Pick a package</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {PACKAGES.map((pkg) => (
                    <Link key={pkg.href} href={pkg.href} className="group">
                        <Card className="h-full transition-colors group-hover:border-foreground/30">
                            <CardHeader>
                                <CardTitle className="font-mono">{pkg.name}</CardTitle>
                                <CardDescription className="text-foreground/80 font-medium">{pkg.tagline}</CardDescription>
                                <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-foreground/80 group-hover:underline underline-offset-4">
                                    Try it →
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
