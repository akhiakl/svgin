import { describe, expect, it } from 'vitest';
import Image, { contentType, size } from '@/app/opengraph-image';

describe('opengraph-image', () => {
    it('declares a 1200x630 PNG, matching every social platform\'s expected OG image size', () => {
        expect(size).toEqual({ width: 1200, height: 630 });
        expect(contentType).toBe('image/png');
    });

    it('renders a real ImageResponse', () => {
        const res = Image();
        expect(res).toBeInstanceOf(Response);
        expect(res.headers.get('content-type')).toBe('image/png');
    });
});
