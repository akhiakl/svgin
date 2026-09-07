import { describe, expect, it, vi } from 'vitest';

describe('svgin-element entry point', () => {
    it('registers <svg-in> as a custom element backed by the SvgIn class', async () => {
        const { SvgIn } = await import('./index.js');
        expect(customElements.get('svg-in')).toBe(SvgIn);
    });

    it('does not attempt to re-define <svg-in> when it is already registered', async () => {
        const { SvgIn } = await import('./index.js');
        expect(customElements.get('svg-in')).toBe(SvgIn);

        // customElements is a real global that persists across module
        // re-evaluation - vi.resetModules() clears vitest's own module
        // registry cache (not the DOM's customElements registry), so the
        // next dynamic import genuinely re-runs index.ts's top-level
        // `customElements.define` guard against a name it already owns,
        // exercising the "already registered" branch for real rather than
        // trusting `customElements.define` itself not to throw.
        vi.resetModules();
        const reimported = await import('./index.js');
        expect(reimported.SvgIn).toBeDefined();
        expect(customElements.get('svg-in')).toBe(SvgIn);
    });
});
