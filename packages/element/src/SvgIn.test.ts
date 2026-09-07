import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('svgin-core/fetchAndSanitizeSvgClient', () => ({
    fetchAndSanitizeSvg: vi.fn(),
    releaseFetchAndSanitizeSvg: vi.fn(),
}));
vi.mock('svgin-core/sanitizeSvgStringClient', () => ({
    sanitizeSvgString: vi.fn(),
}));

import { SvgIn } from './SvgIn';
import { fetchAndSanitizeSvg, releaseFetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from 'svgin-core/sanitizeSvgStringClient';

const mockFetch = vi.mocked(fetchAndSanitizeSvg);
const mockRelease = vi.mocked(releaseFetchAndSanitizeSvg);
const mockSanitizeString = vi.mocked(sanitizeSvgString);

if (!customElements.get('svg-in-test')) {
    customElements.define('svg-in-test', SvgIn);
}

function mount(attrs: Record<string, string> = {}): SvgIn {
    const el = document.createElement('svg-in-test') as SvgIn;
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    document.body.appendChild(el);
    return el;
}

async function flush(): Promise<void> {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
}

describe('SvgIn (custom element)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('renders an aria-hidden loading placeholder while the fetch is in flight', () => {
        mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
        const el = mount({ src: '/test.svg', width: '24', height: '24', fill: 'red', class: 'icon' });
        const placeholder = el.querySelector('svg');
        expect(placeholder).not.toBeNull();
        expect(placeholder).toHaveAttribute('aria-hidden', 'true');
        expect(placeholder).toHaveAttribute('focusable', 'false');
        expect(placeholder).toHaveAttribute('tabindex', '-1');
        expect(placeholder).toHaveAttribute('width', '24');
        expect(placeholder).toHaveAttribute('height', '24');
        expect(placeholder).toHaveAttribute('fill', 'red');
        expect(placeholder).toHaveAttribute('class', 'icon');
    });

    it('renders the placeholder with no presentational attrs when none are given', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));
        const el = mount({ src: '/test.svg' });
        const placeholder = el.querySelector('svg');
        expect(placeholder?.getAttribute('width')).toBeNull();
        expect(placeholder?.getAttribute('class')).toBeNull();
    });

    it('renders the SVG inline after a successful fetch and dispatches svg-in-load', async () => {
        mockFetch.mockResolvedValue('<svg viewBox="0 0 24 24"><circle r="12"/></svg>');
        const el = mount({ src: '/test.svg' });
        const onLoad = vi.fn();
        el.addEventListener('svg-in-load', onLoad);
        await flush();
        const svg = el.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        expect(el.querySelector('circle')).not.toBeNull();
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onLoad.mock.calls[0][0].detail.svg).toBe(svg);
    });

    it('treats an empty sanitized result as a real resolved value, not still-loading', async () => {
        // Regression guard for the null-vs-empty-string sentinel gotcha:
        // '' is a legitimate resolved value and must not be mistaken for the
        // `null` "still loading" sentinel.
        mockFetch.mockResolvedValue('');
        const el = mount({ src: '/empty.svg' });
        await flush();
        expect(el.querySelector('svg')).toBeNull();
    });

    it('clears content and dispatches svg-in-error when the fetch rejects', async () => {
        mockFetch.mockRejectedValue(new Error('network error'));
        const el = mount({ src: '/missing.svg' });
        const onError = vi.fn();
        el.addEventListener('svg-in-error', onError);
        await flush();
        expect(el.querySelector('svg')).toBeNull();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0].detail.error).toBeInstanceOf(Error);
        expect(onError.mock.calls[0][0].detail.error.message).toBe('network error');
    });

    it('wraps a non-Error rejection into an Error', async () => {
        mockFetch.mockRejectedValue('boom');
        const el = mount({ src: '/missing.svg' });
        const onError = vi.fn();
        el.addEventListener('svg-in-error', onError);
        await flush();
        const detail = onError.mock.calls[0][0].detail;
        expect(detail.error).toBeInstanceOf(Error);
        expect(detail.error.message).toBe('boom');
    });

    it('dispatches svg-in-error and renders nothing when neither src nor svg is given', async () => {
        const el = mount();
        const onError = vi.fn();
        el.addEventListener('svg-in-error', onError);
        await flush();
        expect(el.querySelector('svg')).toBeNull();
        expect(onError.mock.calls[0][0].detail.error.message).toBe('<svg-in> requires a `src` or `svg` attribute.');
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('renders nothing when the resolved markup is not a well-formed <svg> string', async () => {
        mockFetch.mockResolvedValue('not an svg at all');
        const el = mount({ src: '/bad.svg' });
        await flush();
        expect(el.querySelector('svg')).toBeNull();
        expect(el.innerHTML).toBe('');
    });

    it('uses the svg attribute (raw markup) directly, skipping the fetch, and takes precedence over src', async () => {
        mockSanitizeString.mockResolvedValue('<svg><rect/></svg>');
        const el = mount({ src: '/ignored.svg', svg: '<svg><rect/></svg>' });
        await flush();
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockSanitizeString).toHaveBeenCalledWith('<svg><rect/></svg>', {
            sanitizeFn: undefined,
            disableSanitization: false,
        });
        expect(el.querySelector('rect')).not.toBeNull();
    });

    it('passes disable-sanitization through as a boolean', async () => {
        mockFetch.mockResolvedValue('<svg><path/></svg>');
        mount({ src: '/a.svg', 'disable-sanitization': '' });
        await flush();
        expect(mockFetch).toHaveBeenCalledWith(
            '/a.svg',
            expect.objectContaining({ disableSanitization: true })
        );
    });

    it('injects svg-title/svg-description and wires aria-labelledby/aria-describedby', async () => {
        mockFetch.mockResolvedValue('<svg><path/></svg>');
        const el = mount({ src: '/a.svg', 'svg-title': 'My icon', 'svg-description': 'A longer description' });
        await flush();
        const svg = el.querySelector('svg');
        expect(svg?.querySelector('title')?.textContent).toBe('My icon');
        expect(svg?.querySelector('desc')?.textContent).toBe('A longer description');
        expect(svg?.getAttribute('aria-labelledby')).toMatch(/^svgin-title-/);
        expect(svg?.getAttribute('aria-describedby')).toMatch(/^svgin-desc-/);
    });

    it('lets an explicit aria-label win over the auto-wired aria-labelledby', async () => {
        mockFetch.mockResolvedValue('<svg><path/></svg>');
        const el = mount({ src: '/a.svg', 'svg-title': 'My icon', 'aria-label': 'Custom label' });
        await flush();
        const svg = el.querySelector('svg');
        expect(svg?.getAttribute('aria-label')).toBe('Custom label');
        expect(svg?.hasAttribute('aria-labelledby')).toBe(false);
    });

    describe('attribute reactivity', () => {
        it('refetches when src changes, releasing the previous fetch', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);

            el.setAttribute('src', '/b.svg');
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenLastCalledWith('/b.svg', expect.objectContaining({}));
            expect(mockRelease).toHaveBeenCalledWith(
                '/a.svg',
                expect.objectContaining({ disableSanitization: false })
            );
        });

        it('refetches when disable-sanitization is toggled', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);

            el.setAttribute('disable-sanitization', '');
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenLastCalledWith('/a.svg', expect.objectContaining({ disableSanitization: true }));
        });

        it('re-renders presentational attribute changes without refetching', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);

            el.setAttribute('width', '32');
            el.setAttribute('fill', 'blue');
            el.setAttribute('class', 'big');
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            const svg = el.querySelector('svg');
            expect(svg).toHaveAttribute('width', '32');
            expect(svg).toHaveAttribute('fill', 'blue');
            expect(svg).toHaveAttribute('class', 'big');
        });

        it('re-renders the still-pending placeholder when a presentational attribute changes', async () => {
            mockFetch.mockReturnValue(new Promise(() => {}));
            const el = mount({ src: '/a.svg' });
            el.setAttribute('width', '40');
            expect(el.querySelector('svg')).toHaveAttribute('width', '40');
        });

        it('ignores a no-op attribute set (same value)', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            el.setAttribute('src', '/a.svg');
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('sanitizeFn / fetchOptions properties', () => {
        it('passes sanitizeFn and fetchOptions through to the fetch call', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            const sanitizeFn = vi.fn().mockResolvedValue('<svg/>');
            const fetchOptions = { headers: { Authorization: 'Bearer x' } };
            el.sanitizeFn = sanitizeFn;
            el.fetchOptions = fetchOptions;
            await flush();
            expect(mockFetch).toHaveBeenLastCalledWith('/a.svg', { sanitizeFn, disableSanitization: false, fetchOptions });
            expect(el.sanitizeFn).toBe(sanitizeFn);
            expect(el.fetchOptions).toBe(fetchOptions);
        });

        it('is a no-op when set to the same reference', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            const sameFn = undefined;
            el.sanitizeFn = sameFn;
            el.fetchOptions = undefined;
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('does not restart while disconnected', () => {
            mockFetch.mockReturnValue(new Promise(() => {}));
            const el = document.createElement('svg-in-test') as SvgIn;
            el.setAttribute('src', '/a.svg');
            el.sanitizeFn = vi.fn();
            el.fetchOptions = { headers: { a: 'b' } };
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('disconnectedCallback / cleanup', () => {
        it('releases the in-flight fetch on disconnect', async () => {
            mockFetch.mockReturnValue(new Promise(() => {}));
            const el = mount({ src: '/a.svg' });
            await flush();
            el.remove();
            expect(mockRelease).toHaveBeenCalledWith('/a.svg', expect.objectContaining({ disableSanitization: false }));
        });

        it('never starts (or releases) a fetch for an attempt disconnected before it could begin', async () => {
            // Regression guard: disconnecting during the microtask gap
            // #beginLoad always yields before doing anything else (see its
            // own comment) must bail out before ever calling
            // fetchAndSanitizeSvg - otherwise it would acquire a share of an
            // in-flight fetch nothing would ever release.
            mockFetch.mockReturnValue(new Promise(() => {}));
            const el = mount({ src: '/a.svg' });
            el.remove();
            await flush();
            expect(mockFetch).not.toHaveBeenCalled();
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('does not update state from a fetch that resolves after disconnect', async () => {
            let resolveFetch: (value: string) => void = () => {};
            mockFetch.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));
            const el = mount({ src: '/a.svg' });
            const onLoad = vi.fn();
            el.addEventListener('svg-in-load', onLoad);
            await flush();
            el.remove();
            resolveFetch('<svg><path/></svg>');
            await flush();
            expect(onLoad).not.toHaveBeenCalled();
        });

        it('does not dispatch svg-in-error for a fetch that rejects after disconnect', async () => {
            let rejectFetch: (err: Error) => void = () => {};
            mockFetch.mockReturnValue(new Promise((_resolve, reject) => { rejectFetch = reject; }));
            const el = mount({ src: '/a.svg' });
            const onError = vi.fn();
            el.addEventListener('svg-in-error', onError);
            await flush();
            el.remove();
            rejectFetch(new Error('too late'));
            await flush();
            expect(onError).not.toHaveBeenCalled();
        });

        it('restarts the load cycle from scratch when reconnected', async () => {
            mockFetch.mockResolvedValue('<svg><path/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            el.remove();
            document.body.appendChild(el);
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('loading="lazy"', () => {
        const observed: Array<{ callback: IntersectionObserverCallback; el: Element }> = [];
        let disconnectSpy: ReturnType<typeof vi.fn<() => void>>;
        let originalIO: typeof IntersectionObserver | undefined;

        beforeEach(() => {
            observed.length = 0;
            disconnectSpy = vi.fn();
            originalIO = globalThis.IntersectionObserver;
            class MockIntersectionObserver {
                callback: IntersectionObserverCallback;
                constructor(callback: IntersectionObserverCallback) {
                    this.callback = callback;
                }
                observe(el: Element) {
                    observed.push({ callback: this.callback, el });
                }
                disconnect() {
                    disconnectSpy();
                }
                unobserve() {}
            }
            // @ts-expect-error - minimal mock, not the full IntersectionObserver interface
            globalThis.IntersectionObserver = MockIntersectionObserver;
        });

        afterEach(() => {
            globalThis.IntersectionObserver = originalIO as typeof IntersectionObserver;
        });

        it('does not fetch until the element intersects the viewport', async () => {
            mockFetch.mockResolvedValue('<svg><circle/></svg>');
            mount({ src: '/a.svg', loading: 'lazy' });
            await flush();
            expect(mockFetch).not.toHaveBeenCalled();
            expect(observed).toHaveLength(1);
        });

        it('fetches once reported as intersecting', async () => {
            mockFetch.mockResolvedValue('<svg><circle/></svg>');
            const el = mount({ src: '/a.svg', loading: 'lazy' });
            await flush();
            observed[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
            await flush();
            expect(el.querySelector('circle')).not.toBeNull();
            expect(disconnectSpy).toHaveBeenCalled();
        });

        it('keeps deferring when the observer reports no intersecting entry', async () => {
            mockFetch.mockResolvedValue('<svg><circle/></svg>');
            mount({ src: '/a.svg', loading: 'lazy' });
            await flush();
            observed[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
            await flush();
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('loads eagerly (ignores lazy) when a raw svg attribute is given', async () => {
            mockSanitizeString.mockResolvedValue('<svg><circle/></svg>');
            mount({ svg: '<svg><circle/></svg>', loading: 'lazy' });
            await flush();
            expect(mockSanitizeString).toHaveBeenCalled();
            expect(observed).toHaveLength(0);
        });

        it('starts loading immediately when loading switches to eager while still deferring', async () => {
            mockFetch.mockResolvedValue('<svg><circle/></svg>');
            const el = mount({ src: '/a.svg', loading: 'lazy' });
            await flush();
            expect(mockFetch).not.toHaveBeenCalled();

            el.setAttribute('loading', 'eager');
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(disconnectSpy).toHaveBeenCalled();
        });

        it('has no effect changing loading after the fetch has already started', async () => {
            mockFetch.mockResolvedValue('<svg><circle/></svg>');
            const el = mount({ src: '/a.svg' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            el.setAttribute('loading', 'lazy');
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('falls back to eager loading when IntersectionObserver is unavailable', async () => {
            // @ts-expect-error - simulating an environment without IntersectionObserver
            delete globalThis.IntersectionObserver;
            mockFetch.mockResolvedValue('<svg><circle/></svg>');
            mount({ src: '/a.svg', loading: 'lazy' });
            await flush();
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });
});
