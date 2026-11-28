import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('svgin-core/fetchAndSanitizeSvgClient', () => ({
    fetchAndSanitizeSvg: vi.fn(),
}));
vi.mock('svgin-core/sanitizeSvgStringClient', () => ({
    sanitizeSvgString: vi.fn(),
}));

import { SvgInSuspense, clearSuspensePromiseCache } from './SvgIn.suspense.client';
import { fetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from 'svgin-core/sanitizeSvgStringClient';

const mockFetch = vi.mocked(fetchAndSanitizeSvg);
const mockSanitizeString = vi.mocked(sanitizeSvgString);

class ErrorBoundary extends React.Component<
    { children: React.ReactNode; onError?: (error: Error) => void },
    { error: Error | null }
> {
    state: { error: Error | null } = { error: null };
    static getDerivedStateFromError(error: Error) {
        return { error };
    }
    componentDidCatch(error: Error) {
        this.props.onError?.(error);
    }
    render() {
        if (this.state.error) return <span>caught: {this.state.error.message}</span>;
        return this.props.children;
    }
}

describe('SvgInSuspense (client component)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Promises are pinned per key at module scope.
        clearSuspensePromiseCache();
    });

    afterEach(() => {
        vi.clearAllMocks();
        clearSuspensePromiseCache();
    });

    it('shows the Suspense fallback while pending, then the resolved svg', async () => {
        let resolve!: (v: string) => void;
        mockFetch.mockReturnValue(new Promise((r) => { resolve = r; }));

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense src="/a.svg" />
                </React.Suspense>
            ));
        });
        expect(container.textContent).toBe('loading...');

        await act(async () => {
            resolve('<svg><circle/></svg>');
        });
        expect(container.querySelector('circle')).not.toBeNull();
    });

    it('is caught by the nearest error boundary on a rejected fetch', async () => {
        let reject!: (e: Error) => void;
        mockFetch.mockReturnValue(new Promise((_r, rj) => { reject = rj; }));

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <ErrorBoundary>
                    <React.Suspense fallback={<span>loading...</span>}>
                        <SvgInSuspense src="/missing.svg" />
                    </React.Suspense>
                </ErrorBoundary>
            ));
        });

        await act(async () => {
            reject(new Error('boom'));
        });
        expect(container.textContent).toBe('caught: boom');
    });

    it('does not re-fetch on every render of a persistently failing src (regression: infinite retry loop)', async () => {
        // A new rejected promise per call simulates the shared cache evicting rejections.
        let callCount = 0;
        mockFetch.mockImplementation(() => Promise.reject(new Error(`boom ${callCount++}`)));

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <ErrorBoundary>
                    <React.Suspense fallback={<span>loading...</span>}>
                        <SvgInSuspense src="/permanently-broken.svg" />
                    </React.Suspense>
                </ErrorBoundary>
            ));
        });

        expect(container.textContent).toBe('caught: boom 0');
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('still calls onError as a side notification alongside the error boundary catching it', async () => {
        let reject!: (e: Error) => void;
        mockFetch.mockReturnValue(new Promise((_r, rj) => { reject = rj; }));
        const onError = vi.fn();

        await act(async () => {
            render(
                <ErrorBoundary>
                    <React.Suspense fallback={<span>loading...</span>}>
                        <SvgInSuspense src="/missing.svg" onError={onError} />
                    </React.Suspense>
                </ErrorBoundary>
            );
        });

        await act(async () => {
            reject(new Error('boom'));
        });
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));
    });

    it('calls onError only once, even if the component re-renders while the same promise is still pending', async () => {
        let reject!: (e: Error) => void;
        mockFetch.mockReturnValue(new Promise((_r, rj) => { reject = rj; }));
        const onError = vi.fn();

        let rerender!: (ui: React.ReactElement) => void;
        await act(async () => {
            ({ rerender } = render(
                <ErrorBoundary>
                    <React.Suspense fallback={<span>loading...</span>}>
                        <SvgInSuspense src="/missing.svg" onError={onError} title="first" />
                    </React.Suspense>
                </ErrorBoundary>
            ));
        });
        // Same src (same cached promise identity) - just a re-render while
        // still pending.
        await act(async () => {
            rerender(
                <ErrorBoundary>
                    <React.Suspense fallback={<span>loading...</span>}>
                        <SvgInSuspense src="/missing.svg" onError={onError} title="second" />
                    </React.Suspense>
                </ErrorBoundary>
            );
        });

        await act(async () => {
            reject(new Error('boom'));
        });
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it('calls onMount with the rendered svg element once resolved', async () => {
        mockFetch.mockResolvedValue('<svg><path/></svg>');
        const onMount = vi.fn();

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense src="/a.svg" onMount={onMount} />
                </React.Suspense>
            ));
        });

        await waitFor(() => expect(onMount).toHaveBeenCalledWith(container.querySelector('svg')));
    });

    it('does not call onMount when the resolved value renders no element (e.g. an empty-string result)', async () => {
        mockFetch.mockResolvedValue('');
        const onMount = vi.fn();

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense src="/empty.svg" onMount={onMount} />
                </React.Suspense>
            ));
        });

        await waitFor(() => expect(container.textContent).not.toBe('loading...'));
        expect(onMount).not.toHaveBeenCalled();
    });

    it('sanitizes and renders a raw svg prop without calling fetchAndSanitizeSvg', async () => {
        mockSanitizeString.mockResolvedValue('<svg><circle/></svg>');

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense svg="<svg><circle/></svg>" />
                </React.Suspense>
            ));
        });

        expect(container.querySelector('circle')).not.toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockSanitizeString).toHaveBeenCalledWith('<svg><circle/></svg>', expect.anything());
    });

    it('reuses one cache entry for the same svg regardless of an accompanying (ignored) src', async () => {
        mockSanitizeString.mockResolvedValue('<svg><circle/></svg>');

        await act(async () => {
            render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense svg="<svg><circle/></svg>" src="/a.svg" />
                </React.Suspense>
            );
        });
        await act(async () => {
            render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense svg="<svg><circle/></svg>" src="/b.svg" />
                </React.Suspense>
            );
        });

        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockSanitizeString).toHaveBeenCalledTimes(1);
    });

    it('passes fetchOptions through and keys the pinned promise on it', async () => {
        mockFetch
            .mockResolvedValueOnce('<svg><circle/></svg>')
            .mockResolvedValueOnce('<svg><rect/></svg>');
        const fetchOptions = { headers: { Authorization: 'Bearer token' } };

        await act(async () => {
            render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense src="/a.svg" fetchOptions={fetchOptions} />
                </React.Suspense>
            );
        });
        expect(mockFetch).toHaveBeenCalledWith('/a.svg', expect.objectContaining({ fetchOptions }));

        // Same src, no fetchOptions this time - a distinct cache key, so a
        // second real fetch happens rather than reusing the first promise.
        await act(async () => {
            render(
                <React.Suspense fallback={<span>loading...</span>}>
                    <SvgInSuspense src="/a.svg" />
                </React.Suspense>
            );
        });
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('is caught by the nearest error boundary when neither src nor svg is given', async () => {
        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <ErrorBoundary>
                    <React.Suspense fallback={<span>loading...</span>}>
                        <SvgInSuspense />
                    </React.Suspense>
                </ErrorBoundary>
            ));
        });
        expect(container.textContent).toContain('caught:');
        expect(container.textContent).toContain('src');
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('renders title/description and uniquifies ids the same way as the non-suspense mode', async () => {
        mockFetch.mockResolvedValue('<svg><linearGradient id="g"/><rect fill="url(#g)"/></svg>');

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(
                <React.Suspense fallback={null}>
                    <SvgInSuspense src="/a.svg" title="Alert" description="Warns the user" />
                </React.Suspense>
            ));
        });

        expect(container.querySelector('linearGradient')).not.toBeNull();
        expect(container.querySelector('title')?.textContent).toBe('Alert');
        expect(container.querySelector('desc')?.textContent).toBe('Warns the user');
        const svg = container.querySelector('svg');
        const rect = container.querySelector('rect');
        const gradientId = container.querySelector('linearGradient')!.id;
        expect(rect?.getAttribute('fill')).toBe(`url(#${gradientId})`);
        expect(svg).toHaveAttribute('aria-labelledby', container.querySelector('title')!.id);
    });
});
