import type { MetadataRoute } from 'next';
import { DEMOS } from '@/lib/demos';
import { DOCS_LINKS } from '@/lib/docs-nav';
import { SITE_URL } from '@/lib/site';

// Derived from the same lists the nav/sidebar use, rather than a separately
// hand-maintained array - this previously fell out of sync with the actual
// routes (missing /native-props and /shadow) the same way the docs sidebar
// and mobile drawer once did.
const ROUTES: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1 },
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
