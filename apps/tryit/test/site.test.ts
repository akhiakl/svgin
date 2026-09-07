import { describe, expect, it } from 'vitest';
import { SITE_NAME, SITE_URL } from '@/lib/site';

describe('site identity constants', () => {
    it('SITE_URL is an absolute https URL with no trailing slash', () => {
        expect(SITE_URL).toMatch(/^https:\/\/\S+[^/]$/);
    });

    it('SITE_NAME is a non-empty string', () => {
        expect(SITE_NAME.length).toBeGreaterThan(0);
    });
});
