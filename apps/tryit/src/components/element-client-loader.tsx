'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <svg-in src> resolves a relative URL
// against window.location, which doesn't exist during SSR.
export const ElementClient = dynamic(() => import('@/components/element-client').then((m) => m.ElementClient), {
    ssr: false,
});
