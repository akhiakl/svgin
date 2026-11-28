import { fetchAndSanitizeSvg } from './fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from './sanitizeSvgStringClient';

export interface ResolveSvgPromiseOptions {
    sanitizeFn: ((svg: string) => Promise<string>) | undefined;
    disableSanitization: boolean | undefined;
    fetchOptions: RequestInit | undefined;
}

/** `svg` wins over `src`. `componentName` only appears in the error message. */
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
