import { afterEach, describe, expect, it, vi } from 'vitest';

// readInstalledVersion() reads node_modules/svgin-react/package.json off disk
// via node:fs - mocked so every branch (found vs missing/corrupt) is under
// this test's control rather than depending on what's actually installed.
vi.mock('node:fs', () => ({
    default: { readFileSync: vi.fn() },
}));

import fs from 'node:fs';
import { getSvginReactVersion } from '@/lib/svgin-react-version';

const mockReadFileSync = vi.mocked(fs.readFileSync);

describe('getSvginReactVersion', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('returns the registry version on a successful fetch', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ version: '2.0.0' }) })
        );
        await expect(getSvginReactVersion()).resolves.toBe('2.0.0');
    });

    it('falls back to the installed version when the registry response has no version field', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
        mockReadFileSync.mockReturnValue(JSON.stringify({ version: '1.2.3' }));
        await expect(getSvginReactVersion()).resolves.toBe('1.2.3');
    });

    it('falls back to the installed version when the registry responds not-ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
        mockReadFileSync.mockReturnValue(JSON.stringify({ version: '1.2.3' }));
        await expect(getSvginReactVersion()).resolves.toBe('1.2.3');
    });

    it('falls back to the installed version when the fetch rejects (network error or timeout)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
        mockReadFileSync.mockReturnValue(JSON.stringify({ version: '1.2.3' }));
        await expect(getSvginReactVersion()).resolves.toBe('1.2.3');
    });

    it('falls back to "latest" when the fetch fails and the local package.json cannot be read either', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
        mockReadFileSync.mockImplementation(() => {
            throw new Error('ENOENT');
        });
        await expect(getSvginReactVersion()).resolves.toBe('latest');
    });
});
