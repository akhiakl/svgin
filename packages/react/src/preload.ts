import { getCachedSvg, setCachedSvg } from 'svgin-core/svgCache';
import type { SvgInProps } from './types';
import { setUniversalCache } from 'svgin-core/universalCache';

async function preloadSvgImpl(
    url: string,
    options?: Pick<SvgInProps, 'disableSanitization' | 'sanitizeFn' | 'fetchOptions'>
): Promise<void> {
    // See fetchAndSanitizeSvgBase.ts: only the default-sanitizer result, fetched
    // with no special request options, is safe to share via the module-level
    // cache. Preloading with `disableSanitization`, a custom `sanitizeFn`, or
    // `fetchOptions` must not poison the cache entry that a later default
    // `<SvgIn src={url} />` call would read.
    const usesSharedCache = !options?.disableSanitization && !options?.sanitizeFn && !options?.fetchOptions;

    // getCachedSvg returns string | undefined - an explicit undefined check
    // (rather than truthiness) so a cached, sanitized-down-to-empty-string
    // result ("") still counts as already preloaded.
    if (usesSharedCache && getCachedSvg(url) !== undefined) return;

    // Only pass a second argument to fetch when fetchOptions is actually
    // given: an explicit `fetch(url, undefined)` changes call arity vs
    // `fetch(url)`, which can break a fetch wrapper/mock that branches on
    // arguments.length instead of checking the second argument's value.
    const res = options?.fetchOptions ? await fetch(url, options.fetchOptions) : await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch SVG: ${url}`);
    const contentType = res.headers?.get('content-type') ?? '';
    if (contentType && !contentType.includes('svg') && !contentType.includes('xml') && !contentType.includes('octet-stream') && !contentType.includes('text/plain')) {
        throw new Error(`Unexpected content-type for SVG: ${contentType}`);
    }
    const svgText = await res.text();

    if (options?.disableSanitization) {
        // Non-default modes are intentionally not cached (see comment above), so
        // there's nothing safe to store here beyond warming the browser/HTTP cache
        // for the `fetch` call itself.
        return;
    }
    if (options?.sanitizeFn) {
        // Custom sanitizer result is caller-specific, not stored in shared cache.
        await options.sanitizeFn(svgText);
        return;
    }

    // Default sanitizer: `preloadSvg` is exported from the environment-
    // agnostic 'svgin-react/core' entry point and documented as working in
    // either environment, so it can't hard-code the server (jsdom-based)
    // sanitizer - that would drag jsdom into a browser bundle (or just fail,
    // since jsdom depends on Node builtins) whenever preloadSvg runs
    // client-side. Picked at call time, not module scope, so a jsdom-based
    // test environment (which does define `window`) is still detected
    // correctly as "browser-like" and gets the lighter client sanitizer.
    const isBrowserLike = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    const { sanitizeSvg } = isBrowserLike
        ? await import('svgin-core/sanitizeClient')
        : await import('svgin-core/sanitizeServer');
    const sanitized = await sanitizeSvg(svgText);
    // Guarded by usesSharedCache itself, not by which branch above returned
    // early: disableSanitization/sanitizeFn both return before reaching
    // here, but fetchOptions has no early-return branch of its own, so
    // reaching this line no longer implies usesSharedCache on its own.
    if (usesSharedCache) setCachedSvg(url, sanitized);
}

export const preloadSvg = setUniversalCache(preloadSvgImpl);
