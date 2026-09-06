import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { SiteNav } from '@/components/site-nav';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const DESCRIPTION =
    'Live demos of svgin-react: the sanitizer Inspector, a server-component fetch, Suspense, SvgInProvider defaults, lazy loading, native SVG/DOM prop forwarding, and SvgInShadow.';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_NAME,
        template: '%s | svgin-react',
    },
    description: DESCRIPTION,
    // Per-page metadata (see lib/metadata.ts) overrides title/description
    // and url below; siteName/type/images stay the sitewide defaults every
    // route inherits, and the opengraph-image.tsx file convention supplies
    // the shared branded image without needing to list it explicitly here.
    openGraph: {
        siteName: SITE_NAME,
        type: 'website',
        title: SITE_NAME,
        description: DESCRIPTION,
        url: '/',
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: DESCRIPTION,
    },
    robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="en" className="h-full antialiased" suppressHydrationWarning>
            <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <SiteNav />
                    <main className="flex-1">{children}</main>
                    <footer className="border-t px-6 py-6 text-sm text-muted-foreground">
                        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-2">
                            <span>Demos for the svgin-react npm package.</span>
                            <a
                                className="underline underline-offset-4 hover:text-foreground"
                                href="https://github.com/akhiakl/svgin-react"
                                target="_blank"
                                rel="noreferrer"
                            >
                                akhiakl/svgin-react
                            </a>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
