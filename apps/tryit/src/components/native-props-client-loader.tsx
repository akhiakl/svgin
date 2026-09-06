'use client';

import dynamic from 'next/dynamic';

// See suspense-client-loader.tsx: <SvgIn src> resolves a relative URL
// against window.location, which doesn't exist during SSR.
export const NativePropsClient = dynamic(
    () => import('@/components/native-props-client').then((m) => m.NativePropsClient),
    { ssr: false }
);
