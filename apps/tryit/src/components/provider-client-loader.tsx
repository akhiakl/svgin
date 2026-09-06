'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <SvgIn src> resolves a relative URL
// against window.location, which doesn't exist during SSR.
export const ProviderClient = dynamic(() => import('@/components/provider-client').then((m) => m.ProviderClient), {
    ssr: false,
});
