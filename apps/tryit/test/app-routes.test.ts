import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/site';
import { DEMOS } from '@/lib/demos';
import { DOCS_LINKS } from '@/lib/docs-nav';

describe('robots()', () => {
    it('allows every crawler and points at the real sitemap URL', () => {
        expect(robots()).toEqual({
            rules: { userAgent: '*', allow: '/' },
            sitemap: `${SITE_URL}/sitemap.xml`,
        });
    });
});

describe('sitemap()', () => {
    it('includes the home page plus every docs and demo route, each with a fully-qualified URL', () => {
        const entries = sitemap();
        const urls = entries.map((entry) => entry.url);
        expect(urls).toContain(`${SITE_URL}/`);
        for (const doc of DOCS_LINKS) {
            expect(urls).toContain(`${SITE_URL}${doc.href}`);
        }
        for (const demo of DEMOS) {
            expect(urls).toContain(`${SITE_URL}${demo.href}`);
        }
        // Every entry is one of these two lists (or home) - no stray/duplicate
        // route, and every entry actually has a well-formed changeFrequency.
        expect(entries.length).toBe(1 + DOCS_LINKS.length + DEMOS.length);
        for (const entry of entries) {
            expect(entry.changeFrequency).toBe('monthly');
            expect(typeof entry.priority).toBe('number');
        }
    });

    it('gives the home page the highest priority', () => {
        const entries = sitemap();
        const home = entries.find((entry) => entry.url === `${SITE_URL}/`);
        const rest = entries.filter((entry) => entry.url !== `${SITE_URL}/`);
        expect(home?.priority).toBe(1);
        for (const entry of rest) {
            expect(entry.priority).toBeLessThan(1);
        }
    });
});
