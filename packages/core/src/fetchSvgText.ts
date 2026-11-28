/** Fetches and checks status and content-type. */
// No second arg when `init` is absent: some fetch mocks branch on arguments.length.
export async function fetchSvgText(url: string, init?: RequestInit): Promise<string> {
    const res = init ? await fetch(url, init) : await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch SVG: ${url}`);
    const contentType = res.headers?.get('content-type') ?? '';
    if (contentType !== '' && !contentType.includes('svg') && !contentType.includes('xml') && !contentType.includes('octet-stream') && !contentType.includes('text/plain')) {
        throw new Error(`Unexpected content-type for SVG: ${contentType}`);
    }
    return res.text();
}
