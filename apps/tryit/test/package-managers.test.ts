import { describe, expect, it } from 'vitest';
import { PACKAGE_MANAGERS } from '@/lib/package-managers';

describe('PACKAGE_MANAGERS', () => {
    it('is a non-empty list of unique package managers, each with a real install command', () => {
        expect(PACKAGE_MANAGERS.length).toBeGreaterThan(0);
        const ids = PACKAGE_MANAGERS.map((pm) => pm.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const pm of PACKAGE_MANAGERS) {
            expect(pm.command).toContain(pm.id);
        }
    });
});
