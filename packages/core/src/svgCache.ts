const svgCache = new Map<string, string>();

export const getCachedSvg = (url: string): string | undefined => svgCache.get(url);

export const setCachedSvg = (url: string, svg: string): void => {
    svgCache.set(url, svg);
};

export const hasCachedSvg = (url: string): boolean => svgCache.has(url);

/**
 * Clears one URL, or everything when called with no argument. Only affects the shared cache
 * used by default-mode `<SvgIn src>` and `preloadSvg`.
 */
export const clearSvgCache = (url?: string): void => {
    if (url === undefined) {
        svgCache.clear();
        return;
    }
    svgCache.delete(url);
};
