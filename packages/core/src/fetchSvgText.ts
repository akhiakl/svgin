/**
 * Fetches `url` and returns the raw response text, after validating the
 * response succeeded and its content-type looks like an SVG (or a type
 * permissive enough to plausibly be one - `text/plain`,
 * `application/octet-stream`, generic `xml`). Shared by
 * fetchAndSanitizeSvgBase (the cached/deduped/cancellable fetch path) and
 * svgin-react's preloadSvg (a one-shot warm-the-cache fetch with none of
 * that bookkeeping) - both need the exact same fetch + validation, just
 * wired into different surrounding logic.
 *
 * Only passes a second argument to `fetch` when `init` is actually given: an
 * explicit `fetch(url, undefined)` changes call arity vs `fetch(url)`, which
 * can break a fetch wrapper/mock that branches on `arguments.length` instead
 * of checking the second argument's value.
 */
export async function fetchSvgText(url: string, init?: RequestInit): Promise<string> {
    const res = init ? await fetch(url, init) : await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch SVG: ${url}`);
    const contentType = res.headers?.get('content-type') ?? '';
    if (contentType !== '' && !contentType.includes('svg') && !contentType.includes('xml') && !contentType.includes('octet-stream') && !contentType.includes('text/plain')) {
        throw new Error(`Unexpected content-type for SVG: ${contentType}`);
    }
    return res.text();
}
