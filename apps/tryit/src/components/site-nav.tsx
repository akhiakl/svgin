'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { DEMOS } from '@/lib/demos';
import { DOCS_LINKS } from '@/lib/docs-nav';

// Two top-level destinations rather than one link per demo/doc page: each
// carries its own page list as children, shown nested one level down in the
// mobile drawer (desktop only ever shows the two top-level links - the
// child pages are reachable there via the home page's card grid and the
// docs sidebar, both driven by the same two lists).
const LINKS = [
    {
        href: '/',
        label: 'Try it',
        match: (pathname: string) => pathname === '/' || DEMOS.some((demo) => demo.href === pathname),
        children: DEMOS.map((demo) => ({ href: demo.href, label: demo.title })),
    },
    {
        href: '/docs',
        label: 'Docs',
        match: (pathname: string) => pathname.startsWith('/docs'),
        children: DOCS_LINKS,
    },
];

function NavLink({ href, label, match, pathname, onClick }: (typeof LINKS)[number] & { pathname: string; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
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
                    svgin-react <span className="text-muted-foreground font-normal">/ try it</span>
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
                        <SheetContent side="left" className="w-64">
                            <SheetHeader>
                                <SheetTitle>svgin-react / try it</SheetTitle>
                            </SheetHeader>
                            <ul className="flex flex-col gap-4 px-4 text-sm">
                                {LINKS.map((link) => (
                                    <li key={link.href}>
                                        <SheetClose render={<NavLink {...link} pathname={pathname} onClick={() => setOpen(false)} />} />
                                        {/* Level 2: the pages under this destination, indented
                                            beneath it instead of a separate unrelated-looking
                                            section further down the drawer. */}
                                        <ul className="mt-2 flex flex-col gap-1.5 border-l pl-3">
                                            {link.children.map((child) => (
                                                <li key={child.href}>
                                                    <SheetClose
                                                        render={
                                                            <Link
                                                                href={child.href}
                                                                onClick={() => setOpen(false)}
                                                                className={cn(
                                                                    'text-muted-foreground transition-colors hover:text-foreground',
                                                                    pathname === child.href && 'text-foreground font-medium'
                                                                )}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        }
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
