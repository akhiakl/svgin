// Single source of truth for the docs page list, mirroring src/lib/demos.ts -
// consumed by both the docs sidebar and the mobile nav drawer so they can't
// drift out of sync with each other.
export const DOCS_LINKS = [
    { href: '/docs', label: 'Introduction' },
    { href: '/docs/installation', label: 'Installation' },
    { href: '/docs/api', label: 'API reference' },
] as const;
