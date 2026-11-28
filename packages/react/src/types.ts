import type { CSSProperties, HTMLAttributes, ReactNode, SVGProps } from 'react';

export interface SvgInProps
    extends Omit<
        SVGProps<SVGSVGElement>,
        // Redeclared below with their own meaning.
        | 'width'
        | 'height'
        | 'fill'
        | 'className'
        | 'title'
        | 'onError'
        | 'children'
        | 'dangerouslySetInnerHTML'
        | 'ref'
    > {
    /** URL of the SVG to fetch. Ignored if `svg` is also given. Either `src` or `svg` is required. */
    src?: string;
    /** Raw SVG markup to sanitize and render without fetching. Wins over `src`. */
    svg?: string;
    /**
     * Second argument to `fetch` for `src`, e.g. auth headers. Requests with it bypass the shared cache.
     * Pass `headers` as a plain object: a `Headers` instance serializes to `{}` in the request key.
     */
    fetchOptions?: RequestInit;
    width?: number | string;
    height?: number | string;
    fill?: string;
    /** Not used by <SvgInSuspense /> - pair that component with a <Suspense fallback> instead. */
    fallback?: ReactNode;
    /** Client only. Shown while pending instead of the empty placeholder `<svg>`. `null` renders nothing. */
    loadingFallback?: ReactNode;
    className?: string;
    ariaLabel?: string;
    /** Sets the SVG's <title> (accessible name). */
    title?: string;
    /** Sets the SVG's <desc> (accessible description). */
    description?: string;
    sanitizeFn?: (svg: string) => Promise<string>;
    disableSanitization?: boolean;
    /** Called on fetch or sanitize failure. <SvgInSuspense /> still needs an error boundary. */
    onError?: (error: Error) => void;
    /** Client only. Called with the rendered `<svg>` after it mounts or updates. */
    onMount?: (svg: SVGSVGElement) => void;
    /**
     * Client only. `'lazy'` waits until the placeholder nears the viewport. Falls back to eager
     * without IntersectionObserver, with `svg`, or with `loadingFallback`. Default `'eager'`.
     */
    loading?: 'eager' | 'lazy';
}

/**
 * Props for `<SvgInShadow />`. The SVG and `styles` live in a shadow root, isolated from page CSS.
 * Native props go to the host element; `width`/`height`/`fill`/`ariaLabel` go to the inner `<svg>`.
 */
export interface SvgInShadowProps
    extends Omit<
        HTMLAttributes<HTMLElement>,
        'title' | 'children' | 'dangerouslySetInnerHTML' | 'className' | 'style' | 'onError'
    > {
    /** URL of the SVG to fetch. Ignored if `svg` is also given. Either `src` or `svg` is required. */
    src?: string;
    /** Raw SVG markup to sanitize and render without fetching. Wins over `src`. */
    svg?: string;
    /** Same as `SvgInProps.fetchOptions`. */
    fetchOptions?: RequestInit;
    width?: number | string;
    height?: number | string;
    fill?: string;
    /** Rendered in the light DOM on failure. */
    fallback?: ReactNode;
    ariaLabel?: string;
    /** Injects/overrides a <title> element inside the rendered SVG. */
    title?: string;
    /** Injects/overrides a <desc> element inside the rendered SVG. */
    description?: string;
    sanitizeFn?: (svg: string) => Promise<string>;
    disableSanitization?: boolean;
    /** Called when the fetch or sanitization fails, alongside rendering `fallback`. */
    onError?: (error: Error) => void;
    /** Called with the rendered `<svg>` element (inside the shadow root) right after it mounts or updates. */
    onMount?: (svg: SVGSVGElement) => void;
    /** CSS injected inside the shadow root, scoped to this instance. */
    styles?: string;
    /** `attachShadow` mode. Default `'open'`. */
    mode?: 'open' | 'closed';
    /** Tag name for the host element the shadow root attaches to. Default `'span'`. */
    as?: 'span' | 'div';
    /** Applied to the host element. */
    className?: string;
    /** Applied to the host element. */
    style?: CSSProperties;
}
