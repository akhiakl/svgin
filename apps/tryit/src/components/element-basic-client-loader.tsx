'use client';

import dynamic from 'next/dynamic';

export const ElementBasicClient = dynamic(
    () => import('@/components/element-basic-client').then((m) => m.ElementBasicClient),
    { ssr: false }
);
