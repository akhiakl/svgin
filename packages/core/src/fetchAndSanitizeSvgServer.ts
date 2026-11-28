import { sanitizeSvg } from './sanitizeServer';
import { createFetchAndSanitizeSvg } from './fetchAndSanitizeSvgBase';

// No release export: server components have no unmount.
export const { fetchAndSanitizeSvg } = createFetchAndSanitizeSvg(sanitizeSvg);
