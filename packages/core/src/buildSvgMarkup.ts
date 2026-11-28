import { escapeHtml, extractSvgAttrs, extractSvgInner, hasContent, injectTitleDesc, parseSvgAttrs, uniquifyIds } from './svgUtils';

export interface BuildSvgMarkupOptions {
    title?: string;
    description?: string;
    idSuffix?: string;
    /** Overrides for source attributes. `undefined` and `''` are skipped. */
    attrs?: Record<string, string | number | undefined>;
}

/** String version of SvgInComponent's output, for shadow root innerHTML. `null` if not an `<svg>`. */
export function buildSvgMarkup(svg: string, options: BuildSvgMarkupOptions = {}): string | null {
    let inner = extractSvgInner(svg);
    if (inner === null) return null;
    const { title, description, idSuffix, attrs = {} } = options;
    if (hasContent(idSuffix)) inner = uniquifyIds(inner, idSuffix);

    const { inner: withTitleDesc, titleId, descId } = injectTitleDesc(inner, { title, description, idSuffix });
    inner = withTitleDesc;

    const merged = parseSvgAttrs(extractSvgAttrs(svg));
    for (const [key, value] of Object.entries(attrs)) {
        if (value !== undefined && value !== '') merged[key] = String(value);
    }
    // Only an explicit aria-label suppresses aria-labelledby, not one from the source SVG.
    const ariaLabelGiven = attrs['aria-label'] !== undefined && attrs['aria-label'] !== '';
    if (!ariaLabelGiven && titleId !== undefined) merged['aria-labelledby'] = titleId;
    if (descId !== undefined) merged['aria-describedby'] = descId;

    const attrString = Object.entries(merged)
        .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
        .join('');
    return `<svg${attrString}>${inner}</svg>`;
}
