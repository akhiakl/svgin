import type { DOMPurify } from 'dompurify';
import { lazySingleton } from './lazySingleton';

// Loaded on first use (jsdom is heavy) and reused; one JSDOM window is safe to share.
const getPurify = lazySingleton((): Promise<DOMPurify> =>
    Promise.all([import('jsdom'), import('dompurify')]).then(([{ JSDOM }, { default: createDOMPurify }]) => {
        const window = new JSDOM('').window;
        return createDOMPurify(window);
    })
);

export async function sanitizeSvg(svg: string): Promise<string> {
    const purify = await getPurify();
    return purify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
}
