'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <svg-in src>/<svg-in svg> touches DOM APIs
// (and, for the src path, resolves a relative URL against window.location)
// that don't exist during SSR.
export const ElementLazyClient = dynamic(
    () => import('@/components/element-lazy-client').then((m) => m.ElementLazyClient),
    { ssr: false }
);
