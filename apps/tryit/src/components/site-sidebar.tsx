'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion';
import { DOCS_INTRO, DOCS_GROUPS } from '@/lib/docs-nav';
import { DEMO_GROUPS } from '@/lib/demos';

// The one nav-with-hierarchy implementation, reused in two places: inline
// on every docs/demo page (via docs/layout.tsx and (demos)/layout.tsx) and
// inside the mobile drawer (SiteNav's Sheet) - rather than a second,
// separately-behaved copy living in SiteNav itself. Same data, same
// default-open groups, same everything, in both places; `onNavigate` is
// the one behavioral difference the drawer needs (closing itself on link
// click), left a no-op everywhere else.
//
// Two sections, each with an ungrouped top-level link (Docs: Introduction)
// plus a React/Element sub-group - two published packages with two
// separate page sets, not one flat pile of links (a flat list here used to
// make it genuinely unclear which package a given link belonged to,
// especially once React and Element demos share titles like "Lazy
// loading" or "Inspector"). Both sub-groups open by default (see
// GROUP_IDS below) so nothing is hidden that was visible before - the
// accordion adds the *option* to collapse, not a requirement to.
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
