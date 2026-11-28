import type React from 'react';
import type { SvgInProps } from './types';
import { extractSvgAttrs, extractSvgInner, hasContent, injectTitleDesc, parseSvgAttrs, uniquifyIds } from 'svgin-core/svgUtils';

/** Renders already-sanitized markup. Source `<svg>` attributes apply first, explicit props win. */
export const SvgInComponent: React.FC<
    // `svg` here is sanitized output, not SvgInProps' raw input. The rest are wrapper-only props.
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
        ref?: React.Ref<SVGSVGElement>;
    }
> = ({ svg, width, height, fill, fallback = null, className, ariaLabel, title, description, idSuffix, ref, ...rest }) => {
    if (svg === null) return fallback;
    let inner = extractSvgInner(svg);
    if (inner !== null) {
        if (hasContent(idSuffix)) inner = uniquifyIds(inner, idSuffix);
        // Explicit aria-labelledby: not every screen reader treats a bare <title> as the name.
        const { inner: withTitleDesc, titleId, descId } = injectTitleDesc(inner, { title, description, idSuffix });
        inner = withTitleDesc;
        const sourceAttrs = parseSvgAttrs(extractSvgAttrs(svg));
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
