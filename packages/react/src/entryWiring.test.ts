import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSvgCache } from 'svgin-core/svgCache';

// These one-line wrapper modules are mocked everywhere else; this proves their wiring unmocked.
describe('entry point wiring (real sanitizers, not mocked)', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.doUnmock('svgin-core/fetchAndSanitizeSvgClient');
        vi.doUnmock('svgin-core/fetchAndSanitizeSvgServer');
        vi.doUnmock('svgin-core/sanitizeSvgStringServer');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        clearSvgCache();
    });

    it('fetchAndSanitizeSvgClient wires the real client sanitizer', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('<svg><script>alert(1)</script><path/></svg>'),
            })
        );
        const { fetchAndSanitizeSvg } = await import('svgin-core/fetchAndSanitizeSvgClient');

        const result = await fetchAndSanitizeSvg('https://example.com/wiring-client.svg');
        expect(result).not.toContain('<script>');
        expect(result).toContain('<path');
    });

    it('fetchAndSanitizeSvgServer wires the real server sanitizer', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('<svg><script>alert(1)</script><circle r="1"/></svg>'),
            })
        );
        const { fetchAndSanitizeSvg } = await import('svgin-core/fetchAndSanitizeSvgServer');

        const result = await fetchAndSanitizeSvg('https://example.com/wiring-server.svg');
        expect(result).not.toContain('<script');
        expect(result).toContain('<circle');
    });

    it('sanitizeSvgStringServer wires the real server sanitizer', async () => {
        const { sanitizeSvgString } = await import('svgin-core/sanitizeSvgStringServer');

        const result = await sanitizeSvgString('<svg><script>alert(1)</script><rect/></svg>');
        expect(result).not.toContain('<script');
        expect(result).toContain('<rect');
    });
});
