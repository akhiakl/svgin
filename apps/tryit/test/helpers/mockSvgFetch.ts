import { vi } from 'vitest';

// No dev server under vitest: map demo URLs to markup or 404 so the real @svgin/react pipeline still runs.
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
