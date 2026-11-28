import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSvgCache } from './svgCache';
import { fetchAndSanitizeSvg } from './fetchAndSanitizeSvgClient';

// Wiring check with the real DOMPurify; behavior is covered in fetchAndSanitizeSvgBase.test.ts.
describe('fetchAndSanitizeSvgClient (real client sanitizer, not mocked)', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        clearSvgCache();
    });

    it('fetches and sanitizes with the real client sanitizer', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('<svg><script>alert(1)</script><path/></svg>'),
            })
        );
        const result = await fetchAndSanitizeSvg('https://example.com/core-client.svg');
        expect(result).not.toContain('<script>');
        expect(result).toContain('<path');
    });
});
