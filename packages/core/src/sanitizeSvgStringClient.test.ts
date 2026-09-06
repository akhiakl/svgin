import { describe, expect, it } from 'vitest';
import { sanitizeSvgString } from './sanitizeSvgStringClient';

// createSanitizeSvgString's own logic is exercised directly (every branch)
// in sanitizeSvgStringBase.test.ts against a fake sanitizer. This only
// proves this module's own one-line wiring to the real client sanitizer.
describe('sanitizeSvgStringClient (real client sanitizer, not mocked)', () => {
    it('sanitizes raw markup with the real client sanitizer', async () => {
        const result = await sanitizeSvgString('<svg><script>alert(1)</script><rect/></svg>');
        expect(result).not.toContain('<script');
        expect(result).toContain('<rect');
    });
});
