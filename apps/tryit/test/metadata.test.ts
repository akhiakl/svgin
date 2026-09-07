import { describe, expect, it } from 'vitest';
import { pageMetadata } from '@/lib/metadata';
import { SITE_NAME } from '@/lib/site';

describe('pageMetadata', () => {
    it('uses an absolute title (opting out of the layout template) and the bare title for og/twitter on the home page', () => {
        const meta = pageMetadata({ title: 'Home', description: 'desc', path: '/' });
        expect(meta.title).toEqual({ absolute: 'Home' });
        expect(meta.openGraph?.title).toBe('Home');
        expect(meta.twitter?.title).toBe('Home');
    });

    it('suffixes the site name onto the title for any non-home page', () => {
        const meta = pageMetadata({ title: 'Docs', description: 'desc', path: '/docs' });
        expect(meta.title).toBe('Docs');
        expect(meta.openGraph?.title).toBe(`Docs | ${SITE_NAME}`);
        expect(meta.twitter?.title).toBe(`Docs | ${SITE_NAME}`);
    });

    it('carries the description and canonical path through unchanged', () => {
        const meta = pageMetadata({ title: 'Docs', description: 'A real description.', path: '/docs/api' });
        expect(meta.description).toBe('A real description.');
        expect(meta.alternates?.canonical).toBe('/docs/api');
        expect(meta.openGraph?.url).toBe('/docs/api');
        // `type`/`card` aren't on every variant of Next's OpenGraph/Twitter
        // union types, so a direct property access doesn't typecheck even
        // though pageMetadata always returns these two literal shapes -
        // toMatchObject checks the real value without narrowing the type.
        expect(meta.openGraph).toMatchObject({ type: 'website' });
        expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
    });
});
