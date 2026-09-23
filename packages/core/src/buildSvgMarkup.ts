import { escapeHtml, extractSvgAttrs, extractSvgInner, hasContent, injectTitleDesc, parseSvgAttrs, uniquifyIds } from './svgUtils';

export interface BuildSvgMarkupOptions {
    title?: string;
    description?: string;
    idSuffix?: string;
    /** Extra attribute overrides on the outer `<svg>` - same precedence rule as SvgInComponent: these win over a same-named attribute on the source SVG. `undefined`/`''` values are dropped rather than rendered as empty attributes. */
    attrs?: Record<string, string | number | undefined>;
}

/**
 * Builds the full outer `<svg>...</svg>` HTML string for contexts that need
 * a plain string rather than a React-rendered element - specifically,
 * assigning to a shadow root's `innerHTML` (SvgInShadow), which isn't part
 * of React's own tree and so can't be built via JSX/dangerouslySetInnerHTML
 * the way SvgInComponent renders the non-shadow components. Mirrors
 * SvgInComponent's title/desc injection, id uniquification, and
 * aria-labelledby/aria-describedby wiring so both paths behave identically.
 *
 * Returns `null` for anything that isn't a well-formed `<svg>...</svg>`
 * string (mirrors extractSvgInner).
 */
export function buildSvgMarkup(svg: string, options: BuildSvgMarkupOptions = {}): string | null {
    let inner = extractSvgInner(svg);
    if (inner === null) return null;
    const { title, description, idSuffix, attrs = {} } = options;
    if (hasContent(idSuffix)) inner = uniquifyIds(inner, idSuffix);

    const { inner: withTitleDesc, titleId, descId } = injectTitleDesc(inner, { title, description, idSuffix });
    inner = withTitleDesc;

    const merged = parseSvgAttrs(extractSvgAttrs(svg));
    for (const [key, value] of Object.entries(attrs)) {
        // An unset override leaves a same-named source attribute (if any)
        // as-is, rather than deleting it - matching SvgInComponent's own
        // `{...(fill ? { fill } : {})}`-style conditional spreads.
        if (value !== undefined && value !== '') merged[key] = String(value);
    }
    // Only an *explicit* aria-label (passed in `attrs`) disables the
    // auto-wired aria-labelledby, same precedence as SvgInComponent - not a
    // same-named attribute the source SVG happened to already have, which
    // `merged['aria-label']` would also include (a real bug found in
    // review: SvgInComponent still wires aria-labelledby to the injected
    // title even when the source's own aria-label is present, so this must
    // match).
    const ariaLabelGiven = attrs['aria-label'] !== undefined && attrs['aria-label'] !== '';
    if (!ariaLabelGiven && titleId !== undefined) merged['aria-labelledby'] = titleId;
    if (descId !== undefined) merged['aria-describedby'] = descId;

    const attrString = Object.entries(merged)
        .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
        .join('');
    return `<svg${attrString}>${inner}</svg>`;
}
