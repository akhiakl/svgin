import { escapeHtml, extractSvgAttrs, extractSvgInner, uniquifyIds } from './svgUtils';

/**
 * Parses the source `<svg>` opening tag into name -> value pairs. Kept
 * separate from SvgInComponent's own copy of this same parser: that one
 * produces React props for a React-rendered element, while this one feeds a
 * plain HTML string destined for direct assignment to a shadow root's
 * `innerHTML` (SvgInShadow) - different consumers, same small regex, not
 * worth coupling the two together over.
 */
function parseSvgAttrs(attrString: string): Record<string, string> {
    const result: Record<string, string> = {};
    const re = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrString)) !== null) {
        result[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
    }
    return result;
}

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
// An optional string field being absent (undefined) or present-but-empty
// ('') are both "nothing to render" here - a plain truthy check already
// treats them the same way, but strict-boolean-expressions requires that to
// be spelled out explicitly rather than relying on '' and undefined both
// being falsy.
function hasContent(s: string | undefined): s is string {
    return s !== undefined && s !== '';
}

export function buildSvgMarkup(svg: string, options: BuildSvgMarkupOptions = {}): string | null {
    let inner = extractSvgInner(svg);
    if (inner === null) return null;
    const { title, description, idSuffix, attrs = {} } = options;
    if (hasContent(idSuffix)) inner = uniquifyIds(inner, idSuffix);

    const titleId = hasContent(title) ? `svgin-title-${idSuffix ?? ''}` : undefined;
    const descId = hasContent(description) ? `svgin-desc-${idSuffix ?? ''}` : undefined;
    if (hasContent(description)) inner = `<desc id="${descId}">${escapeHtml(description)}</desc>${inner}`;
    if (hasContent(title)) inner = `<title id="${titleId}">${escapeHtml(title)}</title>${inner}`;

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
