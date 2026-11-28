'use client';

import dynamic from 'next/dynamic';

export const NativePropsClient = dynamic(
    () => import('@/components/native-props-client').then((m) => m.NativePropsClient),
    { ssr: false }
);
