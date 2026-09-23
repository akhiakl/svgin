import type React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import type { SvgInProps } from './types';
import { SvgInComponent } from './SvgInComponent';
import { nextInstanceId } from 'svgin-core/instanceId';
import { SvgInContext } from './SvgInContext';
import { useLatestRef } from './useLatestRef';
import { useResolvedSvg } from './useResolvedSvg';

export const SvgIn: React.FC<SvgInProps> = (props) => {
    const defaults = useContext(SvgInContext);
    // Explicit props always win over an <SvgInProvider>'s defaults.
    // title/description/onError/onMount/loadingFallback/loading/fallback are
    // all pulled out of `rest` too: none of them are valid attributes to
    // spread onto the raw placeholder <svg> below or meaningful passed twice
    // to SvgInComponent.
    const {
        src,
        svg: svgProp,
        sanitizeFn = defaults.sanitizeFn,
        disableSanitization = defaults.disableSanitization,
        fetchOptions = defaults.fetchOptions,
        title,
        description,
        onError = defaults.onError,
        onMount,
        loadingFallback = defaults.loadingFallback,
        loading = defaults.loading ?? 'eager',
        fallback = defaults.fallback,
        className = defaults.className,
        ...rest
    } = props;
    // Stable for the lifetime of this mounted component, so ids inside the
    // rendered SVG don't change (and force a needless DOM update) on every
    // re-render - only a fresh mount gets a new suffix, same as a real DOM
    // element would.
    const idSuffix = useRef<string | undefined>(undefined);
    if (idSuffix.current === undefined) idSuffix.current = nextInstanceId();
    const svgRef = useRef<SVGSVGElement>(null);

    const onMountRef = useLatestRef(onMount);

    // Limitation, inherited from useResolvedSvg (sanitizeFn/fetchOptions are
    // both read from a ref there, not depended on by identity): replacing
    // sanitizeFn with a *different* function, or changing the *contents* of
    // an already-present fetchOptions, does not trigger a re-fetch (see the
    // README's "sanitizeFn identity note"). If the sanitizer's behavior
    // needs to change at runtime, change the src prop or remount the
    // component to force a refresh - there is no dedicated prop for this.

    // Lazy loading: don't start the fetch until the placeholder scrolls near
    // the viewport. Only applies when the *default* placeholder actually
    // renders: a custom `loadingFallback` is an arbitrary ReactNode with no
    // guaranteed single DOM node to attach `svgRef`/observe, so deferring in
    // that case would mean never observing anything and the fetch never
    // starting - ignore `loading="lazy"` there instead (falls back to eager,
    // never a silent deadlock). Also ignored when `svg` is given directly
    // (there is nothing to fetch) or IntersectionObserver isn't available.
    // Checked live (not cached at module scope) so a polyfill installed
    // after this module first loads is still picked up.
    const canDefer =
        loading === 'lazy' &&
        loadingFallback === undefined &&
        svgProp === undefined &&
        typeof IntersectionObserver !== 'undefined';
    const [shouldLoad, setShouldLoad] = useState(!canDefer);
    useEffect(() => {
        if (!canDefer) {
            // Covers both "never deferring" and deferral turning off after
            // mount (e.g. `loading` switching from 'lazy' to 'eager', or
            // `loadingFallback` being set) - a no-op once already true.
            setShouldLoad(true);
            return;
        }
        if (shouldLoad) return;
        const el = svgRef.current;
        // Defensive only: this effect runs after the ref'd placeholder <svg>
        // has committed (canDefer implies loadingFallback is undefined, so
        // that placeholder is always what's rendered here), so el is never
        // actually null in practice.
        /* v8 ignore next */
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [canDefer, shouldLoad]);

    // Fetch/sanitize + cleanup - see useResolvedSvg's own comment. `svg`
    // takes precedence over `src` (see resolveSvgPromiseClient/SvgInProps),
    // so when both are given this instance never acquires a share of an
    // in-flight `src` fetch at all - releasing it on unmount anyway would
    // decrement (and potentially abort) an unrelated in-flight fetch some
    // other mounted <SvgIn /> instance is still relying on. The underlying
    // fetch is only actually aborted once every other mounted <SvgIn />
    // instance sharing the same in-flight request (same
    // src/sanitizeFn/disableSanitization/fetchOptions) has also unmounted or
    // moved on to different props - see releaseFetchAndSanitizeSvg.
    const { svg, error } = useResolvedSvg('<SvgIn />', {
        src,
        svg: svgProp,
        sanitizeFn,
        disableSanitization,
        fetchOptions,
        onError,
        enabled: shouldLoad,
    });

    // Fires after the rendered <svg> DOM node is available (or updated) -
    // this is the closest client-side equivalent to react-svg's
    // beforeInjection: a hook for imperative DOM work the declarative props
    // above don't cover.
    useEffect(() => {
        if (svg !== null && svgRef.current) onMountRef.current?.(svgRef.current);
    }, [svg]);

    if (error) return fallback ?? null;
    if (svg === null) {
        if (loadingFallback !== undefined) return loadingFallback;
        return (
            <svg
                ref={svgRef}
                {...rest}
                width={rest.width}
                height={rest.height}
                fill={rest.fill}
                className={className}
                aria-hidden="true"
                focusable="false"
                tabIndex={-1}
            />
        );
    }
    return (
        <SvgInComponent
            svg={svg}
            title={title}
            description={description}
            idSuffix={idSuffix.current}
            ref={svgRef}
            className={className}
            {...rest}
        />
    );
};
