import { describe, expect, it } from 'vitest';
import { sanitizeSvgString } from './sanitizeSvgStringServer';

// See sanitizeSvgStringClient.test.ts's comment: only proves this module's
// own one-line wiring to the real server sanitizer.
describe('sanitizeSvgStringServer (real server sanitizer, not mocked)', () => {
    it('sanitizes raw markup with the real server sanitizer', async () => {
        const result = await sanitizeSvgString('<svg><script>alert(1)</script><rect/></svg>');
        expect(result).not.toContain('<script');
        expect(result).toContain('<rect');
    });
});
