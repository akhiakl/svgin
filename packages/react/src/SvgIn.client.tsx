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
    // Explicit props win over provider defaults. Non-DOM props are kept out of `rest`.
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
    // One suffix per mount, so ids don't change on re-render.
    const idSuffix = useRef<string | undefined>(undefined);
    if (idSuffix.current === undefined) idSuffix.current = nextInstanceId();
    const svgRef = useRef<SVGSVGElement>(null);

    const onMountRef = useLatestRef(onMount);

    // Lazy needs the default placeholder to observe; a custom loadingFallback has no single node.
    const canDefer =
        loading === 'lazy' &&
        loadingFallback === undefined &&
        svgProp === undefined &&
        typeof IntersectionObserver !== 'undefined';
    const [shouldLoad, setShouldLoad] = useState(!canDefer);
    useEffect(() => {
        if (!canDefer) {
            setShouldLoad(true);
            return;
        }
        if (shouldLoad) return;
        const el = svgRef.current;
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

    const { svg, error } = useResolvedSvg('<SvgIn />', {
        src,
        svg: svgProp,
        sanitizeFn,
        disableSanitization,
        fetchOptions,
        onError,
        enabled: shouldLoad,
    });

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
