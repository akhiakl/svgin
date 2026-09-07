import { describe, expect, it } from 'vitest';
import { DEMOS } from '@/lib/demos';

describe('DEMOS', () => {
    it('is a non-empty list of unique, absolute-path demo routes', () => {
        expect(DEMOS.length).toBeGreaterThan(0);
        const hrefs = DEMOS.map((demo) => demo.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
        for (const demo of DEMOS) {
            expect(demo.href.startsWith('/')).toBe(true);
            expect(demo.title.length).toBeGreaterThan(0);
            expect(demo.description.length).toBeGreaterThan(0);
        }
    });
});
