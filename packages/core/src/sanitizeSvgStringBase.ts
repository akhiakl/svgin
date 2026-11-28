import { setUniversalCache } from './universalCache';

export interface SanitizeSvgStringOptions {
    sanitizeFn?: (svg: string) => Promise<string>;
    disableSanitization?: boolean;
}

/** The sanitize step for raw `svg` markup, memoized like the fetch path. */
export function createSanitizeSvgString(sanitizeSvg: (svg: string) => string | Promise<string>) {
    async function sanitizeSvgStringImpl(raw: string, options?: SanitizeSvgStringOptions): Promise<string> {
        if (options?.disableSanitization) return raw;
        if (options?.sanitizeFn) return options.sanitizeFn(raw);
        return sanitizeSvg(raw);
    }
    return setUniversalCache(sanitizeSvgStringImpl);
}
