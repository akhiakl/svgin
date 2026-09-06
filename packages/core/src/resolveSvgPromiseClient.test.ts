import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSvgCache } from './svgCache';
import { resolveSvgPromiseClient } from './resolveSvgPromiseClient';

describe('resolveSvgPromiseClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        clearSvgCache();
    });

    it('resolves via sanitizeSvgString when svg is given, ignoring src', async () => {
        const result = await resolveSvgPromiseClient(
            '<Test />',
            'https://example.com/ignored.svg',
            '<svg><circle/></svg>',
            undefined,
            undefined,
            undefined
        );
        expect(result).toContain('<circle');
    });

    it('resolves via fetchAndSanitizeSvg when only src is given', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('<svg><rect/></svg>'),
            })
        );
        const result = await resolveSvgPromiseClient(
            '<Test />',
            'https://example.com/resolve.svg',
            undefined,
            undefined,
            undefined,
            undefined
        );
        expect(result).toContain('<rect');
    });

    it('rejects naming the component when neither src nor svg is given', async () => {
        await expect(
            resolveSvgPromiseClient('<Test />', undefined, undefined, undefined, undefined, undefined)
        ).rejects.toThrow('<Test /> requires either `src` or `svg`.');
    });
});
