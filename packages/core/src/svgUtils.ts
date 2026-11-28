// Escapes quotes too: callers build attribute values by string concatenation.
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// indexOf, not a regex: `[\s\S]*` backtracks O(n^2) when the closing tag is missing.
export function extractSvgInner(svg: string): string | null {
    if (!svg.startsWith('<svg')) return null;
    const openEnd = svg.indexOf('>');
    if (openEnd === -1) return null;
    const closeStart = svg.lastIndexOf('</svg>');
    if (closeStart === -1 || closeStart <= openEnd) return null;
    return svg.slice(openEnd + 1, closeStart);
}

export function extractSvgAttrs(svg: string): string {
    if (!svg.startsWith('<svg')) return '';
    const openEnd = svg.indexOf('>');
    if (openEnd === -1) return '';
    return svg.slice(4, openEnd).trim();
}

// Suffixes ids and their internal references so repeated icons don't share gradients or clip paths.
export function uniquifyIds(svg: string, suffix: string): string {
    const ids = new Set<string>();
    const idRe = /\bid="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = idRe.exec(svg)) !== null) {
        ids.add(m[1]);
    }
    if (ids.size === 0) return svg;

    return svg
        .replace(/\bid="([^"]+)"/g, (_full, id: string) => `id="${id}-${suffix}"`)
        .replace(/url\(#([^)"']+)\)/g, (full, id: string) => (ids.has(id) ? `url(#${id}-${suffix})` : full))
        .replace(/((?:xlink:)?href)="#([^"]+)"/g, (full, attr: string, id: string) =>
            ids.has(id) ? `${attr}="#${id}-${suffix}"` : full
        );
}

export function hasContent(s: string | undefined): s is string {
    return s !== undefined && s !== '';
}

export function parseSvgAttrs(attrString: string): Record<string, string> {
    const result: Record<string, string> = {};
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

/** Prepends `<title>`/`<desc>` and returns their ids for aria wiring. */
export function injectTitleDesc(inner: string, options: InjectTitleDescOptions): InjectTitleDescResult {
    const { title, description, idSuffix } = options;
    const titleId = hasContent(title) ? `svgin-title-${idSuffix ?? ''}` : undefined;
    const descId = hasContent(description) ? `svgin-desc-${idSuffix ?? ''}` : undefined;
    let result = inner;
    if (hasContent(description)) result = `<desc id="${descId}">${escapeHtml(description)}</desc>${result}`;
    if (hasContent(title)) result = `<title id="${titleId}">${escapeHtml(title)}</title>${result}`;
    return { inner: result, titleId, descId };
}
