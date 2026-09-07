import { describe, expect, it } from 'vitest';
import { DOCS_LINKS } from '@/lib/docs-nav';

describe('DOCS_LINKS', () => {
    it('is a non-empty list of unique, absolute-path docs routes', () => {
        expect(DOCS_LINKS.length).toBeGreaterThan(0);
        const hrefs = DOCS_LINKS.map((link) => link.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
        for (const link of DOCS_LINKS) {
            expect(link.href.startsWith('/')).toBe(true);
            expect(link.label.length).toBeGreaterThan(0);
        }
    });
});
