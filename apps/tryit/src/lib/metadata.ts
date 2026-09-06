import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

/**
 * Builds a page's metadata so title/description actually reach Open Graph
 * and Twitter card previews, not just the <title> tag. Next.js does not
 * auto-propagate a page's plain `title`/`description` into `openGraph`/
 * `twitter` inherited from a parent layout - those nested objects only pick
 * up a change when a segment sets them explicitly - so every route calls
 * this instead of writing `{ title }` by hand.
 */
export function pageMetadata({
    title,
    description,
    path,
}: {
    title: string;
    description: string;
    path: string;
}): Metadata {
    const isHome = path === '/';
    const ogTitle = isHome ? title : `${title} | ${SITE_NAME}`;

    return {
        // The layout's title template ("%s | svgin-react") would otherwise
        // apply to the home page too, producing a redundant
        // "Try svgin-react | svgin-react" - `absolute` opts out of it.
        title: isHome ? { absolute: title } : title,
        description,
        alternates: { canonical: path },
        openGraph: {
            title: ogTitle,
            description,
            url: path,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: ogTitle,
            description,
        },
    };
}
