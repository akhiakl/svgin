import { vi } from 'vitest';

// Shared fetch stub for the live-demo components (lazy/native-props/provider/
// shadow/suspense-client.tsx), which call the real svgin-react against real
// relative URLs (/demo-icon.svg, /this-does-not-exist.svg) - there's no dev
// server running under vitest, so a real fetch would just fail with a
// connection error for every URL, "successful" and "broken" alike. Maps
// each known URL to real demo-icon markup, a 404, or (for anything else) a
// generic 404, so tests stay fast/deterministic without needing to mock
// svgin-react itself - the real fetch/sanitize/render pipeline still runs.
const DEMO_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" stroke-width="1.5"/></svg>';

export function stubSvgFetch() {
    vi.stubGlobal(
        'fetch',
        vi.fn((input: RequestInfo | URL) => {
            const url = typeof input === 'string' ? input : input.toString();
            if (url.includes('demo-icon.svg')) {
                return Promise.resolve({
                    ok: true,
                    headers: { get: () => 'image/svg+xml' },
                    text: () => Promise.resolve(DEMO_ICON_SVG),
                });
            }
            return Promise.resolve({ ok: false, status: 404, headers: { get: () => null } });
        })
    );
}
