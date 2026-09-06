'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DOCS_LINKS } from '@/lib/docs-nav';
import { DEMOS } from '@/lib/demos';

// Rendered on every page except the home page (which already shows the
// full "Try it live" card grid). Always both sections, so a page's
// presence or content never depends on whether it happens to be a docs
// page or a demo page - the old docs-only sidebar carried just the "Docs"
// links and only appeared under /docs, so the cross-navigation a docs
// reader got was simply unavailable while looking at a demo, and vice
// versa.
const SECTIONS = [
    { label: 'Docs', links: DOCS_LINKS },
    { label: 'Try it', links: DEMOS.map((demo) => ({ href: demo.href, label: demo.title })) },
];

export function SiteSidebar() {
    const pathname = usePathname();

    return (
        <nav aria-label="Site navigation" className="lg:sticky lg:top-20 lg:self-start">
            {/* Mobile-first: a wrapped horizontal link list above the content.
                lg:flex-col switches to the vertical sidebar layout below - a
                real column is worth the extra markup only once there is
                room for it. */}
            <div className="flex flex-col gap-6 lg:w-48">
                {SECTIONS.map((section) => (
                    <div key={section.label}>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {section.label}
                        </p>
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm lg:flex-col lg:gap-y-1.5">
                            {section.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={pathname === link.href ? 'page' : undefined}
                                        className={cn(
                                            'text-muted-foreground transition-colors hover:text-foreground',
                                            pathname === link.href && 'text-foreground font-medium'
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
