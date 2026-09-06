'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <SvgIn src>/<SvgInShadow src> resolve a
// relative URL against window.location, which doesn't exist during SSR.
export const ShadowClient = dynamic(() => import('@/components/shadow-client').then((m) => m.ShadowClient), {
    ssr: false,
});
