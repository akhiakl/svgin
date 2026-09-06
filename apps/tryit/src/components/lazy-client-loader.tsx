'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <SvgIn src> resolves a relative URL
// against window.location, which doesn't exist during SSR.
export const LazyClient = dynamic(() => import('@/components/lazy-client').then((m) => m.LazyClient), { ssr: false });
