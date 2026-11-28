export interface DocLink {
    href: string;
    label: string;
}

export interface DocGroup {
    id: string;
    label: string;
    links: DocLink[];
}

// Single source for the docs pages (sidebar and drawer).
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

export const DOCS_LINKS: DocLink[] = [DOCS_INTRO, ...DOCS_GROUPS.flatMap((group) => group.links)];
