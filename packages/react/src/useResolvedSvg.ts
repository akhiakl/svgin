import { useEffect, useState } from 'react';
import { releaseFetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgClient';
import { resolveSvgPromiseClient } from 'svgin-core/resolveSvgPromiseClient';
import { useLatestRef } from './useLatestRef';

export interface UseResolvedSvgOptions {
    src: string | undefined;
    svg: string | undefined;
    sanitizeFn: ((svg: string) => Promise<string>) | undefined;
    disableSanitization: boolean | undefined;
    fetchOptions: RequestInit | undefined;
    onError: ((error: Error) => void) | undefined;
    /**
     * Gates whether the fetch/sanitize effect below runs at all. `<SvgIn />`
     * passes its own `shouldLoad` (lazy-loading gate) here; `<SvgInShadow />`
     * has no lazy loading, so it leaves this at the default `true`.
     */
    enabled?: boolean;
}

export interface UseResolvedSvgResult {
    svg: string | null;
    error: Error | null;
}

/**
 * Shared fetch/sanitize/cleanup effect behind both `<SvgIn />` and
 * `<SvgInShadow />` - resolves `svg`/`src` to sanitized markup via
 * resolveSvgPromiseClient, wraps a non-Error rejection the same way both
 * components already had to, and releases this instance's share of an
 * in-flight `src` fetch on cleanup (never for `svg`, which never acquired
 * one - `svg` takes precedence over `src`, see resolveSvgPromiseClient).
 *
 * Deliberately NOT shared with `<SvgInSuspense />`: that component suspends
 * via `use()` against a promise pinned by its own module-scope cache (see
 * its own comment for why), a fundamentally different model from this
 * hook's setState-on-resolve effect - there is no common implementation to
 * factor out between the two.
 */
export function useResolvedSvg(componentName: string, options: UseResolvedSvgOptions): UseResolvedSvgResult {
    const { src, svg: svgProp, sanitizeFn, disableSanitization, fetchOptions, onError, enabled = true } = options;
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Read from refs rather than depended on directly: consumers commonly
    // pass fresh inline closures/objects, and depending on their identity
    // would re-run this effect (re-fetching/re-sanitizing) unnecessarily.
    const onErrorRef = useLatestRef(onError);
    const sanitizeFnRef = useLatestRef(sanitizeFn);
    const fetchOptionsRef = useLatestRef(fetchOptions);
    const hasSanitizeFn = sanitizeFn !== undefined;
    // fetchOptions only affects anything on the `src` (fetch) path - when
    // `svg` is given instead, resolveSvgPromiseClient never reaches
    // fetchOptions at all, so its presence toggling must not trigger a
    // re-sanitize there.
    const hasFetchOptions = svgProp === undefined && fetchOptions !== undefined;

    useEffect(() => {
        if (!enabled) return;
        let mounted = true;
        setSvg(null);
        setError(null);
        const currentSanitizeFn = sanitizeFnRef.current;
        const currentFetchOptions = fetchOptionsRef.current;
        resolveSvgPromiseClient(componentName, src, svgProp, {
            sanitizeFn: currentSanitizeFn,
            disableSanitization,
            fetchOptions: currentFetchOptions,
        })
            .then((sanitized) => {
                if (mounted) setSvg(sanitized);
            })
            .catch((e: unknown) => {
                // A rejection value isn't guaranteed to be a real Error
                // (anything can be thrown/rejected with) - wrapped here so
                // `error` state and onError's own contract (Error | null,
                // (error: Error) => void) actually hold.
                if (!mounted) return;
                const err = e instanceof Error ? e : new Error(String(e));
                setError(err);
                onErrorRef.current?.(err);
            });
        return () => {
            mounted = false;
            // Release this caller's share of the in-flight fetch - but only
            // when resolveSvgPromiseClient actually acquired one. `svg`
            // takes precedence over `src`, so when both are given this
            // instance never called fetchAndSanitizeSvg for `src` at all;
            // releasing it anyway would decrement (and potentially abort)
            // an unrelated in-flight fetch some other mounted instance is
            // still relying on.
            if (svgProp === undefined && src !== undefined) {
                releaseFetchAndSanitizeSvg(src, {
                    sanitizeFn: currentSanitizeFn,
                    disableSanitization,
                    fetchOptions: currentFetchOptions,
                });
            }
        };
    }, [enabled, src, svgProp, disableSanitization, hasSanitizeFn, hasFetchOptions]);

    return { svg, error };
}
