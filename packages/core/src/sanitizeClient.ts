import type { DOMPurify } from 'dompurify';
import { lazySingleton } from './lazySingleton';

// Lazy, so callers that never use the default sanitizer never load DOMPurify.
const getPurify = lazySingleton((): Promise<DOMPurify> => import('dompurify').then((mod) => mod.default));

export async function sanitizeSvg(svg: string): Promise<string> {
    const DOMPurify = await getPurify();
    return DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
}
