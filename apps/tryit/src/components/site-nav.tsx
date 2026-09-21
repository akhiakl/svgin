'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { SiteSidebar } from '@/components/site-sidebar';
import { DEMO_GROUPS } from '@/lib/demos';

// Two top-level destinations for the desktop-only horizontal nav (hidden
// below sm - see the drawer below for mobile). "Try it" and "Docs" are the
// only entries here on purpose: everything under them is reachable via the
// react/element landing pages' card grids and the docs sidebar itself,
// both driven by the same DEMO_GROUPS/DOCS_GROUPS data SiteSidebar renders.
const LINKS = [
    {
        href: '/',
        label: 'Try it',
        match: (pathname: string) => pathname === '/' || DEMO_GROUPS.some((group) => group.demos.some((demo) => demo.href === pathname)),
    },
    { href: '/docs', label: 'Docs', match: (pathname: string) => pathname.startsWith('/docs') },
];

function NavLink({ href, label, match, pathname }: (typeof LINKS)[number] & { pathname: string }) {
    return (
        <Link
            href={href}
            className={cn(
                'text-muted-foreground transition-colors hover:text-foreground',
                match(pathname) && 'text-foreground font-medium'
            )}
        >
            {label}
        </Link>
    );
}

export function SiteNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="border-b">
            <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <Link href="/" className="font-semibold tracking-tight">
                    svgin <span className="text-muted-foreground font-normal">/ try it</span>
                </Link>

                <ul className="hidden items-center gap-x-4 text-sm sm:flex">
                    {LINKS.map((link) => (
                        <li key={link.href}>
                            <NavLink {...link} pathname={pathname} />
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger
                            render={
                                <Button variant="outline" size="icon" className="sm:hidden" aria-label="Open navigation menu">
                                    <Menu className="size-5" />
                                </Button>
                            }
                        />
                        {/* Same SiteSidebar used inline on every docs/demo page, reused
                            here rather than a second, separately-behaved nav tree - same
                            data, same default-open groups. onNavigate closes the drawer
                            on link click, the one behavior this context needs that the
                            inline usage elsewhere doesn't. */}
                        <SheetContent side="left" className="w-64 overflow-y-auto">
                            <SheetHeader>
                                {/* Plain onClick, not SheetClose: SheetClose's
                                    nativeButton semantics are for a real button
                                    (see its own comment) - this is a navigational
                                    link, same as every other link in SiteSidebar
                                    below, so it stays consistent with those. */}
                                <Link href="/" onClick={() => setOpen(false)}>
                                    <SheetTitle>svgin / try it</SheetTitle>
                                </Link>
                            </SheetHeader>
                            <div className="px-4">
                                <SiteSidebar onNavigate={() => setOpen(false)} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
