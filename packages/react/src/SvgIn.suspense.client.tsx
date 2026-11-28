import type React from 'react';
import { use, useEffect, useRef } from 'react';
import type { SvgInProps } from './types';
import { fetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from 'svgin-core/sanitizeSvgStringClient';
import { SvgInComponent } from './SvgInComponent';
import { nextInstanceId } from 'svgin-core/instanceId';
import { stableKey } from 'svgin-core/universalCache';
import { useLatestRef } from './useLatestRef';

// Module scope, not per instance: React remounts fresh instances while recovering from a rejected use().
const notifiedErrors = new WeakMap<Promise<unknown>, WeakSet<(error: Error) => void>>();

function notifyOnErrorOnce(promise: Promise<string>, onError: (error: Error) => void): void {
    let seen = notifiedErrors.get(promise);
    if (!seen) {
        seen = new WeakSet();
        notifiedErrors.set(promise, seen);
    }
    if (seen.has(onError)) return;
    seen.add(onError);
    promise.catch(onError);
}

// use() needs one stable promise per request, even across React's error-recovery renders.
// The shared cache evicts rejections, which made an always-failing URL refetch forever, so
// promises are pinned here for the page's lifetime. Retrying means changing an input.
const suspensePromises = new Map<string, Promise<string>>();

/** Test-only. */
export function clearSuspensePromiseCache(): void {
    suspensePromises.clear();
}

function resolvePromise(
    src: string | undefined,
    svgProp: string | undefined,
    sanitizeFn: ((svg: string) => Promise<string>) | undefined,
    disableSanitization: boolean | undefined,
    fetchOptions: RequestInit | undefined
): Promise<string> {
    if (svgProp === undefined && src === undefined) {
        // Sync throw, not Promise.reject: a fresh rejected promise per render would loop use().
        throw new Error('<SvgInSuspense /> requires either `src` or `svg`.');
    }

    // `src` is ignored when `svg` is given, so it stays out of the key.
    const key =
        svgProp !== undefined
            ? stableKey([svgProp, sanitizeFn, disableSanitization])
            : stableKey([src, sanitizeFn, disableSanitization, fetchOptions]);
    let promise = suspensePromises.get(key);
    if (promise === undefined) {
        promise =
            svgProp !== undefined
                ? sanitizeSvgString(svgProp, { sanitizeFn, disableSanitization })
                : fetchAndSanitizeSvg(src as string, { sanitizeFn, disableSanitization, fetchOptions });
        suspensePromises.set(key, promise);
    }
    return promise;
}

/**
 * Suspends via React 19's use(). Pair it with <Suspense> for loading and an error
 * boundary for failures. Does not read <SvgInProvider> defaults.
 */
export const SvgInSuspense: React.FC<Omit<SvgInProps, 'fallback' | 'loadingFallback' | 'loading' | 'suspense'>> = (
    props
) => {
    const {
        src,
        svg: svgProp,
        sanitizeFn,
        disableSanitization,
        fetchOptions,
        title,
        description,
        onError,
        onMount,
        ...rest
    } = props;
    const idSuffix = useRef<string | undefined>(undefined);
    if (idSuffix.current === undefined) idSuffix.current = nextInstanceId();
    const svgRef = useRef<SVGSVGElement>(null);
    const onMountRef = useLatestRef(onMount);

    const promise = resolvePromise(src, svgProp, sanitizeFn, disableSanitization, fetchOptions);
    if (onError) notifyOnErrorOnce(promise, onError);
    const resolved = use(promise);

    useEffect(() => {
        if (svgRef.current) onMountRef.current?.(svgRef.current);
    }, [resolved]);

    return (
        <SvgInComponent
            svg={resolved}
            title={title}
            description={description}
            idSuffix={idSuffix.current}
            ref={svgRef}
            {...rest}
        />
    );
};
