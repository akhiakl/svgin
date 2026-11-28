import React, { useEffect, useRef } from 'react';
import type { SvgInShadowProps } from './types';
import { buildSvgMarkup } from 'svgin-core/buildSvgMarkup';
import { nextInstanceId } from 'svgin-core/instanceId';
import { useResolvedSvg } from './useResolvedSvg';

/**
 * Renders the sanitized SVG inside a shadow root on a host `<span>`/`<div>`.
 * Native props go to the host. Client only, no lazy loading, and it does not read
 * `<SvgInProvider>` defaults.
 */
// Not React.FC: some @types/react versions add an implicit `children` prop.
export function SvgInShadow({
    src,
    svg: svgProp,
    fetchOptions,
    sanitizeFn,
    disableSanitization,
    width,
    height,
    fill,
    ariaLabel,
    fallback = null,
    title,
    description,
    onError,
    onMount,
    styles,
    mode = 'open',
    as: Tag = 'span',
    className,
    style,
    ...rest
}: SvgInShadowProps): React.ReactNode {
    const hostRef = useRef<HTMLElement | null>(null);
    // A closed root is unreachable via host.shadowRoot, so track it here. Keyed to its host
    // because `as` changes or error recovery mount a new host element.
    const shadowRootRef = useRef<{ host: HTMLElement; root: ShadowRoot } | null>(null);
    const idSuffix = useRef<string | undefined>(undefined);
    if (idSuffix.current === undefined) idSuffix.current = nextInstanceId();

    const onMountRef = useRef(onMount);
    onMountRef.current = onMount;

    // Separate from the DOM-writing effect so presentational changes don't refetch.
    const { svg, error } = useResolvedSvg('<SvgInShadow />', {
        src,
        svg: svgProp,
        sanitizeFn,
        disableSanitization,
        fetchOptions,
        onError,
    });

    useEffect(() => {
        const host = hostRef.current;
        /* v8 ignore next */
        if (!host) return;
        if (shadowRootRef.current && shadowRootRef.current.host !== host) {
            shadowRootRef.current = null;
        }
        if (svg === null || svg === '') {
            if (shadowRootRef.current) shadowRootRef.current.root.innerHTML = '';
            return;
        }
        const markup = buildSvgMarkup(svg, {
            title,
            description,
            idSuffix: idSuffix.current,
            attrs: { width, height, fill, 'aria-label': ariaLabel },
        });
        if (markup === null) return;
        const root = shadowRootRef.current?.root ?? host.attachShadow({ mode });
        if (!shadowRootRef.current) shadowRootRef.current = { host, root };
        // textContent, never innerHTML, for `styles`: `</style><script>` must not break out.
        root.innerHTML = markup;
        if (styles !== undefined && styles !== '') {
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            root.prepend(styleEl);
        }
        const mountedSvg = root.querySelector('svg');
        /* v8 ignore next */
        if (!mountedSvg) return;
        onMountRef.current?.(mountedSvg);
    }, [svg, title, description, width, height, fill, ariaLabel, styles, mode, Tag]);

    if (error) return fallback ?? null;
    // createElement: JSX can't type one shared ref across a dynamic tag.
    return React.createElement(Tag, { ref: hostRef, className, style, ...rest });
}
