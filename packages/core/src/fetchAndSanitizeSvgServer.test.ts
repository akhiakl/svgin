import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSvgCache } from './svgCache';
import { fetchAndSanitizeSvg } from './fetchAndSanitizeSvgServer';

// See fetchAndSanitizeSvgClient.test.ts's comment: this only proves this
// module's own one-line wiring to the real server (jsdom + DOMPurify)
// sanitizer, not createFetchAndSanitizeSvg's own logic (covered elsewhere).
describe('fetchAndSanitizeSvgServer (real server sanitizer, not mocked)', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        clearSvgCache();
    });

    it('fetches and sanitizes with the real server sanitizer', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('<svg><script>alert(1)</script><circle r="1"/></svg>'),
            })
        );
        const result = await fetchAndSanitizeSvg('https://example.com/core-server.svg');
        expect(result).not.toContain('<script');
        expect(result).toContain('<circle');
    });
});
