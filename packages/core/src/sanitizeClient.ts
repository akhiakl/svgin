import type { DOMPurify } from 'dompurify';
import { lazySingleton } from './lazySingleton';

// DOMPurify is loaded lazily and cached, so it only ends up in a consumer's
// bundle (and only runs the one-time init cost) if SVG sanitization is
// actually used - callers that always pass `disableSanitization` or their own
// `sanitizeFn` never pay for it.
const getPurify = lazySingleton((): Promise<DOMPurify> => import('dompurify').then((mod) => mod.default));

export async function sanitizeSvg(svg: string): Promise<string> {
    const DOMPurify = await getPurify();
    return DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
}
