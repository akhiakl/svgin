import { fetchSvgText } from './fetchSvgText';
import { getCachedSvg, setCachedSvg } from './svgCache';
import { setUniversalCache, stableKey } from './universalCache';

export interface FetchAndSanitizeOptions {
    sanitizeFn?: (svg: string) => Promise<string>;
    disableSanitization?: boolean;
    fetchOptions?: RequestInit;
}

// Short names save bytes (minifiers don't shorten properties). c: controller, n: sharers.
interface PendingEntry {
    c: AbortController;
    n: number;
}

function computeKey(url: string, options?: FetchAndSanitizeOptions): string {
    return stableKey([url, options?.sanitizeFn, options?.disableSanitization, options?.fetchOptions]);
}

export function createFetchAndSanitizeSvg(sanitizeSvg: (svg: string) => string | Promise<string>) {
    // Per factory, so client and server instances in one process never share bookkeeping.
    const pendingByKey = new Map<string, PendingEntry>();

    async function fetchAndSanitizeSvgImpl(
        url: string,
        options?: FetchAndSanitizeOptions & { signal?: AbortSignal }
    ): Promise<string> {
        // Only default-sanitized, option-free results are safe to share across callers.
        const usesSharedCache = !options?.disableSanitization && !options?.sanitizeFn && !options?.fetchOptions;

        if (usesSharedCache) {
            const cached = getCachedSvg(url);
            if (cached !== undefined) return cached;
        }

        // Only the ref-counted signal reaches the shared fetch. A caller's own fetchOptions.signal
        // just releases that caller's share (below), so one caller can't abort a fetch others need.
        const signal = options?.signal;
        const raw = await fetchSvgText(url, options?.fetchOptions ? { ...options.fetchOptions, signal } : { signal });
        let sanitized: string;
        if (options?.disableSanitization) {
            sanitized = raw;
        } else if (options?.sanitizeFn) {
            sanitized = await options.sanitizeFn(raw);
        } else {
            sanitized = await sanitizeSvg(raw);
        }

        if (usesSharedCache) {
            setCachedSvg(url, sanitized);
        }
        return sanitized;
    }
    const dedupedFetch = setUniversalCache(fetchAndSanitizeSvgImpl);

    // Ref-counted: the fetch aborts only after every sharer releases.
    function fetchAndSanitizeSvg(url: string, options?: FetchAndSanitizeOptions): Promise<string> {
        const key = computeKey(url, options);
        let pending = pendingByKey.get(key);
        if (!pending) pendingByKey.set(key, (pending = { c: new AbortController(), n: 0 }));
        pending.n++;

        const callerSignal = options?.fetchOptions?.signal;
        const onCallerAbort = callerSignal ? () => releaseFetchAndSanitizeSvg(url, options) : undefined;
        if (callerSignal && onCallerAbort) {
            if (callerSignal.aborted) onCallerAbort();
            else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
        }

        const promise = dedupedFetch(url, { ...options, signal: pending.c.signal });
        // Cleans up for callers that never release (server, Suspense, preload).
        const settle = () => {
            if (pendingByKey.get(key) === pending) pendingByKey.delete(key);
            if (callerSignal && onCallerAbort) callerSignal.removeEventListener('abort', onCallerAbort);
        };
        promise.then(settle, settle);
        return promise;
    }

    function releaseFetchAndSanitizeSvg(url: string, options?: FetchAndSanitizeOptions): void {
        const key = computeKey(url, options);
        const pending = pendingByKey.get(key);
        if (!pending) return;
        if (--pending.n <= 0) {
            pending.c.abort();
            pendingByKey.delete(key);
        }
    }

    return { fetchAndSanitizeSvg, releaseFetchAndSanitizeSvg };
}
