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
    /** Lazy-loading gate. Defaults to `true`. */
    enabled?: boolean;
}

export interface UseResolvedSvgResult {
    svg: string | null;
    error: Error | null;
}

/** Fetch/sanitize/cleanup effect shared by `<SvgIn />` and `<SvgInShadow />`. */
export function useResolvedSvg(componentName: string, options: UseResolvedSvgOptions): UseResolvedSvgResult {
    const { src, svg: svgProp, sanitizeFn, disableSanitization, fetchOptions, onError, enabled = true } = options;
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Read from refs so fresh inline closures don't refetch. Limitation: swapping one
    // sanitizeFn for another, or editing fetchOptions contents, does not refetch either.
    const onErrorRef = useLatestRef(onError);
    const sanitizeFnRef = useLatestRef(sanitizeFn);
    const fetchOptionsRef = useLatestRef(fetchOptions);
    const hasSanitizeFn = sanitizeFn !== undefined;
    // fetchOptions only matters on the `src` path.
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
                if (!mounted) return;
                const err = e instanceof Error ? e : new Error(String(e));
                setError(err);
                onErrorRef.current?.(err);
            });
        return () => {
            mounted = false;
            // `svg` wins over `src`, so no fetch share was taken; releasing would abort another instance's fetch.
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
