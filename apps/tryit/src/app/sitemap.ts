import type { MetadataRoute } from 'next';
import { DEMOS } from '@/lib/demos';
import { DOCS_LINKS } from '@/lib/docs-nav';
import { SITE_URL } from '@/lib/site';

// Derived from the nav data so it can't drift from the real routes.
const ROUTES: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1 },
    { path: '/react', priority: 0.9 },
    { path: '/element', priority: 0.9 },
    ...DOCS_LINKS.map((doc) => ({ path: doc.href, priority: 0.8 })),
    ...DEMOS.map((demo) => ({ path: demo.href, priority: 0.6 })),
];

export default function sitemap(): MetadataRoute.Sitemap {
    return ROUTES.map(({ path, priority }) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: 'monthly',
        priority,
    }));
}
