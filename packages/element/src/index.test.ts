import { describe, expect, it, vi } from 'vitest';

describe('@svgin/element entry point', () => {
    it('registers <svg-in> as a custom element backed by the SvgIn class', async () => {
        const { SvgIn } = await import('./index.js');
        expect(customElements.get('svg-in')).toBe(SvgIn);
    });

    it('does not attempt to re-define <svg-in> when it is already registered', async () => {
        const { SvgIn } = await import('./index.js');
        expect(customElements.get('svg-in')).toBe(SvgIn);

        // resetModules re-runs index.ts against the still-registered global customElements entry.
        vi.resetModules();
        const reimported = await import('./index.js');
        expect(reimported.SvgIn).toBeDefined();
        expect(customElements.get('svg-in')).toBe(SvgIn);
    });
});
