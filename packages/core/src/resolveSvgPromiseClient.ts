import { fetchAndSanitizeSvg } from './fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from './sanitizeSvgStringClient';

export interface ResolveSvgPromiseOptions {
    sanitizeFn: ((svg: string) => Promise<string>) | undefined;
    disableSanitization: boolean | undefined;
    fetchOptions: RequestInit | undefined;
}

/**
 * Resolves to the sanitized SVG markup for either the `svg` (raw markup, no
 * fetch) or `src` (fetch) path - the same precedence rule (`svg` wins over
 * `src`) shared by every client component. Rejects when neither is given.
 * `componentName` is only used in that rejection's message (e.g.
 * `'<SvgIn />'`), so each caller's error still names itself.
 *
 * `sanitizeFn`/`disableSanitization`/`fetchOptions` are a single options
 * object rather than three positional params, so a call site's argument
 * order can't silently drift out of sync with this signature.
 */
export function resolveSvgPromiseClient(
    componentName: string,
    src: string | undefined,
    svgProp: string | undefined,
    options: ResolveSvgPromiseOptions
): Promise<string> {
    const { sanitizeFn, disableSanitization, fetchOptions } = options;
    if (svgProp !== undefined) return sanitizeSvgString(svgProp, { sanitizeFn, disableSanitization });
    if (src !== undefined) return fetchAndSanitizeSvg(src, { sanitizeFn, disableSanitization, fetchOptions });
    return Promise.reject(new Error(`${componentName} requires either \`src\` or \`svg\`.`));
}
