import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchSvgText } from './fetchSvgText';

describe('fetchSvgText', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('calls fetch with a single argument when no init is given', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            headers: { get: () => 'image/svg+xml' },
            text: () => Promise.resolve('<svg/>'),
        });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchSvgText('https://example.com/icon.svg');

        expect(fetchMock).toHaveBeenCalledWith('https://example.com/icon.svg');
        expect(fetchMock.mock.calls[0]).toHaveLength(1);
        expect(result).toBe('<svg/>');
    });

    it('passes init through when given', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            headers: { get: () => '' },
            text: () => Promise.resolve('<svg/>'),
        });
        vi.stubGlobal('fetch', fetchMock);
        const controller = new AbortController();

        await fetchSvgText('https://example.com/icon.svg', { signal: controller.signal });

        expect(fetchMock).toHaveBeenCalledWith('https://example.com/icon.svg', { signal: controller.signal });
    });

    it('rejects when the response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: false, headers: { get: () => '' }, text: () => Promise.resolve('') })
        );
        await expect(fetchSvgText('https://example.com/missing.svg')).rejects.toThrow(
            'Failed to fetch SVG: https://example.com/missing.svg'
        );
    });

    it('rejects on an unexpected content-type', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: true, headers: { get: () => 'application/json' }, text: () => Promise.resolve('{}') })
        );
        await expect(fetchSvgText('https://example.com/not-svg')).rejects.toThrow(
            'Unexpected content-type for SVG: application/json'
        );
    });

    it.each(['image/svg+xml', 'application/xml', 'application/octet-stream', 'text/plain', ''])(
        'accepts content-type %s',
        async (contentType) => {
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue({ ok: true, headers: { get: () => contentType }, text: () => Promise.resolve('<svg/>') })
            );
            await expect(fetchSvgText('https://example.com/icon.svg')).resolves.toBe('<svg/>');
        }
    );

    it('treats a missing headers object as an empty content-type', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<svg/>') }));
        await expect(fetchSvgText('https://example.com/icon.svg')).resolves.toBe('<svg/>');
    });
});
