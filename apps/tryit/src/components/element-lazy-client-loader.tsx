'use client';

import dynamic from 'next/dynamic';

export const ElementLazyClient = dynamic(
    () => import('@/components/element-lazy-client').then((m) => m.ElementLazyClient),
    { ssr: false }
);
