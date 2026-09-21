'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <svg-in src>/<svg-in svg> touches DOM APIs
// (and, for the src path, resolves a relative URL against window.location)
// that don't exist during SSR.
export const ElementInspectorClient = dynamic(
    () => import('@/components/element-inspector-client').then((m) => m.ElementInspectorClient),
    { ssr: false }
);
