export interface DocLink {
    href: string;
    label: string;
}

export interface DocGroup {
    id: string;
    label: string;
    links: DocLink[];
}

// Single source of truth for the docs page list, mirroring src/lib/demos.ts's
// DEMO_GROUPS shape - consumed by the docs sidebar and the mobile nav drawer
// so they can't drift out of sync with each other. "Introduction" stays
// ungrouped (package-agnostic, covers both), React and Element each get
// their own Installation/API reference pair.
export const DOCS_INTRO: DocLink = { href: '/docs', label: 'Introduction' };

export const DOCS_GROUPS: DocGroup[] = [
    {
        id: 'react',
        label: 'React',
        links: [
            { href: '/docs/react/installation', label: 'Installation' },
            { href: '/docs/react/api', label: 'API reference' },
        ],
    },
    {
        id: 'element',
        label: 'Element',
        links: [
            { href: '/docs/element/installation', label: 'Installation' },
            { href: '/docs/element/api', label: 'API reference' },
        ],
    },
];

// Flat form for consumers that just need "every docs URL", regardless of
// grouping (sitemap, the "every entry is well-formed" test).
export const DOCS_LINKS: DocLink[] = [DOCS_INTRO, ...DOCS_GROUPS.flatMap((group) => group.links)];
