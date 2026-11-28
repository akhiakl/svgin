'use client';

import dynamic from 'next/dynamic';

export const ElementRawClient = dynamic(
    () => import('@/components/element-raw-client').then((m) => m.ElementRawClient),
    { ssr: false }
);
