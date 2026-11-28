import { fetchSvgText } from 'svgin-core/fetchSvgText';
import { getCachedSvg, setCachedSvg } from 'svgin-core/svgCache';
import type { SvgInProps } from './types';
import { setUniversalCache } from 'svgin-core/universalCache';

async function preloadSvgImpl(
    url: string,
    options?: Pick<SvgInProps, 'disableSanitization' | 'sanitizeFn' | 'fetchOptions'>
): Promise<void> {
    // Only a default-sanitized, option-free result is safe to share across callers.
    const usesSharedCache = !options?.disableSanitization && !options?.sanitizeFn && !options?.fetchOptions;

    // Not a truthiness check: "" (everything sanitized away) is a valid cached result.
    if (usesSharedCache && getCachedSvg(url) !== undefined) return;

    const svgText = await fetchSvgText(url, options?.fetchOptions);

    if (options?.disableSanitization) {
        return;
    }
    if (options?.sanitizeFn) {
        await options.sanitizeFn(svgText);
        return;
    }

    // Picked at call time so a browser bundle never pulls in the jsdom-based server sanitizer.
    const isBrowserLike = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    const { sanitizeSvg } = isBrowserLike
        ? await import('svgin-core/sanitizeClient')
        : await import('svgin-core/sanitizeServer');
    const sanitized = await sanitizeSvg(svgText);
    if (usesSharedCache) setCachedSvg(url, sanitized);
}

export const preloadSvg = setUniversalCache(preloadSvgImpl);
