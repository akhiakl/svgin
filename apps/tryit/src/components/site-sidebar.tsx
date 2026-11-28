'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion';
import { DOCS_INTRO, DOCS_GROUPS } from '@/lib/docs-nav';
import { DEMO_GROUPS } from '@/lib/demos';

// Used inline on docs/demo pages and inside the mobile drawer; `onNavigate` lets the drawer close itself.
const SECTIONS = [
    { label: 'Docs', intro: DOCS_INTRO, groups: DOCS_GROUPS.map((group) => ({ id: group.id, label: group.label, links: group.links })) },
    { label: 'Try it', intro: null, groups: DEMO_GROUPS.map((group) => ({ id: group.id, label: group.label, links: group.demos.map((demo) => ({ href: demo.href, label: demo.title })) })) },
] as const;

const GROUP_IDS = SECTIONS.flatMap((section) => section.groups.map((group) => `${section.label}-${group.id}`));

export function SiteSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
    const pathname = usePathname();

    return (
        <nav aria-label="Site navigation" className="lg:sticky lg:top-20 lg:w-48 lg:self-start">
            <div className="flex flex-col gap-6">
                {SECTIONS.map((section) => (
                    <div key={section.label}>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {section.label}
                        </p>

                        {section.intro && (
                            <Link
                                href={section.intro.href}
                                onClick={onNavigate}
                                aria-current={pathname === section.intro.href ? 'page' : undefined}
                                className={cn(
                                    'block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground',
                                    pathname === section.intro.href && 'text-foreground font-medium'
                                )}
                            >
                                {section.intro.label}
                            </Link>
                        )}

                        <Accordion defaultValue={GROUP_IDS} multiple className="mt-1 border-l pl-3">
                            {section.groups.map((group) => (
                                <AccordionItem key={group.id} value={`${section.label}-${group.id}`} className="border-b-0">
                                    <AccordionTrigger className="py-1.5 text-[0.7rem]">{group.label}</AccordionTrigger>
                                    <AccordionPanel className="pb-1">
                                        <ul className="flex flex-col gap-1 pl-2 text-sm">
                                            {group.links.map((link) => (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        onClick={onNavigate}
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
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>
        </nav>
    );
}
