import type React from 'react';
import type { SvgInProps } from './types';
import { extractSvgAttrs, extractSvgInner, hasContent, injectTitleDesc, parseSvgAttrs, uniquifyIds } from 'svgin-core/svgUtils';

/**
 * Pure SVG rendering component. Pass sanitized SVG string as `svg` prop.
 * Used by both client and server wrappers.
 *
 * Attributes from the source `<svg>` tag (e.g. `viewBox`, `xmlns`,
 * `preserveAspectRatio`) are forwarded to the rendered element. Explicit
 * props passed by the consumer always take precedence - this includes any
 * other standard SVG/DOM prop (`style`, `onClick`, `stroke`, `role`,
 * `tabIndex`, `data-*`, native `aria-*`, etc.), which SvgInProps accepts via
 * `SVGProps<SVGSVGElement>` and this component spreads onto the rendered
 * element after the source attributes.
 */
export const SvgInComponent: React.FC<
    // 'svg' is also omitted: SvgInProps.svg is the caller-supplied *raw*
    // markup (input to sanitization), while this component's own `svg` prop
    // below is the already-sanitized markup ready to render - same name,
    // different meaning at different pipeline stages. The other omissions
    // are props this component never reads and never forwards to the DOM:
    // they're either handled entirely by the client/server/suspense
    // wrappers before this component ever sees them (fetchOptions,
    // disableSanitization, onError, onMount, loadingFallback, loading), or -
    // for onError specifically - would otherwise conflict with the native
    // SVG `onError` DOM event handler now pulled in via SVGProps, which has
    // an incompatible signature.
    Omit<
        SvgInProps,
        | 'src'
        | 'sanitizeFn'
        | 'svg'
        | 'fetchOptions'
        | 'disableSanitization'
        | 'onError'
        | 'onMount'
        | 'loadingFallback'
        | 'loading'
    > & {
        svg: string | null;
        idSuffix?: string;
        // React 19 passes `ref` through to function components as a normal
        // prop (no forwardRef needed) - forwarded to the rendered <svg> so
        // SvgIn.client.tsx can hand it to the onMount callback.
        ref?: React.Ref<SVGSVGElement>;
    }
> = ({ svg, width, height, fill, fallback = null, className, ariaLabel, title, description, idSuffix, ref, ...rest }) => {
    if (svg === null) return fallback;
    let inner = extractSvgInner(svg);
    if (inner !== null) {
        if (hasContent(idSuffix)) inner = uniquifyIds(inner, idSuffix);
        // Ids for the <title>/<desc> elements this injects, so the root <svg>
        // can point aria-labelledby/aria-describedby at them - the more
        // broadly-compatible way to wire an accessible name/description than
        // relying on assistive tech to treat a bare <title>/<desc> as implicit
        // labelling, which not every screen reader does consistently.
        const { inner: withTitleDesc, titleId, descId } = injectTitleDesc(inner, { title, description, idSuffix });
        inner = withTitleDesc;
        const sourceAttrs = parseSvgAttrs(extractSvgAttrs(svg));
        // Explicit ariaLabel always wins over the auto-wired title id, same
        // precedence as every other explicit prop in this component.
        return (
            <svg
                ref={ref}
                {...sourceAttrs}
                {...rest}
                {...(width !== undefined ? { width } : {})}
                {...(height !== undefined ? { height } : {})}
                {...(hasContent(fill) ? { fill } : {})}
                {...(hasContent(className) ? { className } : {})}
                {...(hasContent(ariaLabel) ? { 'aria-label': ariaLabel } : titleId !== undefined ? { 'aria-labelledby': titleId } : {})}
                {...(descId !== undefined ? { 'aria-describedby': descId } : {})}
                dangerouslySetInnerHTML={{ __html: inner }}
            />
        );
    }
    return null;
}
