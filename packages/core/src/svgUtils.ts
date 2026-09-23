/**
 * Minimal HTML-escaping for text inserted into `<title>`/`<desc>` via
 * dangerouslySetInnerHTML (SvgInComponent), or into a shadow root's
 * innerHTML as either text content or a quoted attribute value
 * (buildSvgMarkup, for SvgInShadow) - hence escaping `"`/`'` too, not just
 * the text-content-only `&`/`<`/`>`: an unescaped `"` in an attribute value
 * built via string concatenation (`key="${value}"`) would otherwise let the
 * value break out of the attribute and inject further markup. title/
 * description/attrs come from the consumer's own code (not the untrusted
 * fetched SVG), so this is about not breaking the surrounding markup, not
 * sanitization.
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Extracts the inner markup of a sanitized `<svg>...</svg>` string, so it can
 * be rendered via `dangerouslySetInnerHTML` inside a React-controlled `<svg>`
 * element (which owns width/height/fill/className/aria-label as normal,
 * escaped React props - see SvgInComponent).
 *
 * Uses indexOf/lastIndexOf instead of a regex to avoid catastrophic
 * backtracking on large or malformed SVG strings (an unbounded `[\s\S]*`
 * quantifier is O(n²) when the closing tag is absent).
 */
export function extractSvgInner(svg: string): string | null {
    if (!svg.startsWith('<svg')) return null;
    const openEnd = svg.indexOf('>');
    if (openEnd === -1) return null;
    const closeStart = svg.lastIndexOf('</svg>');
    if (closeStart === -1 || closeStart <= openEnd) return null;
    return svg.slice(openEnd + 1, closeStart);
}

/**
 * Extracts the attribute string from the opening `<svg ...>` tag of an SVG
 * string so that `SvgInComponent` can forward attributes like `viewBox`,
 * `xmlns`, and `preserveAspectRatio` that the source SVG author intended.
 *
 * Returns an empty string when the string does not start with `<svg` or the
 * opening tag has no attributes.
 */
export function extractSvgAttrs(svg: string): string {
    if (!svg.startsWith('<svg')) return '';
    const openEnd = svg.indexOf('>');
    if (openEnd === -1) return '';
    // Content between "<svg" (4 chars) and the closing ">" of the opening tag.
    return svg.slice(4, openEnd).trim();
}

/**
 * Rewrites every `id="..."` in the SVG, and every internal reference to
 * those ids (`url(#id)`, `href="#id"`, `xlink:href="#id"`), by appending a
 * suffix - so that multiple instances of the same icon rendered on one page
 * don't silently share (and fight over) the same `<linearGradient>`,
 * `<clipPath>`, `<mask>`, or `<filter>` definition via a collided id.
 *
 * Only touches references that match an id actually defined in this SVG; an
 * `href` pointing to an external file/URL fragment is left untouched. Uses
 * bounded character classes (no `[\s\S]*`-style quantifiers) for the same
 * reason extractSvgInner does - avoiding catastrophic backtracking on large
 * or malformed input.
 */
export function uniquifyIds(svg: string, suffix: string): string {
    const ids = new Set<string>();
    const idRe = /\bid="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = idRe.exec(svg)) !== null) {
        ids.add(m[1]);
    }
    if (ids.size === 0) return svg;

    return svg
        // Every id="..." this matches was already found by the scan above
        // (same pattern), so it is always in `ids` - no membership check needed.
        .replace(/\bid="([^"]+)"/g, (_full, id: string) => `id="${id}-${suffix}"`)
        .replace(/url\(#([^)"']+)\)/g, (full, id: string) => (ids.has(id) ? `url(#${id}-${suffix})` : full))
        .replace(/((?:xlink:)?href)="#([^"]+)"/g, (full, attr: string, id: string) =>
            ids.has(id) ? `${attr}="#${id}-${suffix}"` : full
        );
}

// An optional string field being absent (undefined) or present-but-empty
// ('') are both "nothing to render" here - a plain truthy check already
// treats them the same way, but strict-boolean-expressions requires that to
// be spelled out explicitly rather than relying on '' and undefined both
// being falsy. Shared by buildSvgMarkup and SvgInComponent (each used to
// keep its own copy of this one-liner) - see injectTitleDesc below for the
// same consolidation applied to the larger title/desc id-computation logic.
export function hasContent(s: string | undefined): s is string {
    return s !== undefined && s !== '';
}

/**
 * Parses an SVG opening tag's attribute string into name -> value pairs.
 * Shared by buildSvgMarkup (feeds a plain HTML string for SvgInShadow's
 * innerHTML) and SvgInComponent (feeds React props for a JSX-rendered
 * element) - same small regex, two different consumers of its output.
 */
export function parseSvgAttrs(attrString: string): Record<string, string> {
    const result: Record<string, string> = {};
    // Match name="value", name='value', or bare name (boolean attrs)
    const re = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrString)) !== null) {
        result[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
    }
    return result;
}

export interface InjectTitleDescOptions {
    title?: string;
    description?: string;
    idSuffix?: string;
}

export interface InjectTitleDescResult {
    /** `inner` with `<title>`/`<desc>` prepended, when given. */
    inner: string;
    titleId: string | undefined;
    descId: string | undefined;
}

/**
 * Prepends escaped `<title>`/`<desc>` elements (with ids derived from
 * `idSuffix`) to `inner` when `title`/`description` are given, and returns
 * those ids so the caller can wire `aria-labelledby`/`aria-describedby` to
 * them. Shared by buildSvgMarkup (string output, for SvgInShadow) and
 * SvgInComponent (JSX output) - both need the exact same id computation and
 * precedence, but render the result through entirely different mechanisms
 * (one can't reuse the other's JSX/dangerouslySetInnerHTML path), so only
 * this non-JSX-specific piece is shared, not the surrounding rendering.
 */
export function injectTitleDesc(inner: string, options: InjectTitleDescOptions): InjectTitleDescResult {
    const { title, description, idSuffix } = options;
    const titleId = hasContent(title) ? `svgin-title-${idSuffix ?? ''}` : undefined;
    const descId = hasContent(description) ? `svgin-desc-${idSuffix ?? ''}` : undefined;
    let result = inner;
    if (hasContent(description)) result = `<desc id="${descId}">${escapeHtml(description)}</desc>${result}`;
    if (hasContent(title)) result = `<title id="${titleId}">${escapeHtml(title)}</title>${result}`;
    return { inner: result, titleId, descId };
}
