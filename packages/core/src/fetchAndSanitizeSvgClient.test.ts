import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSvgCache } from './svgCache';
import { fetchAndSanitizeSvg } from './fetchAndSanitizeSvgClient';

// createFetchAndSanitizeSvg's own behavior is exercised directly (and
// thoroughly, including every branch) in fetchAndSanitizeSvgBase.test.ts
// against a fake sanitizer. This test exists only to prove this module's own
// one-line wiring - applying createFetchAndSanitizeSvg to the real client
// DOMPurify sanitizer (./sanitizeClient) - actually works end to end.
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
