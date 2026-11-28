'use client';

import dynamic from 'next/dynamic';

export const ElementEventsClient = dynamic(
    () => import('@/components/element-events-client').then((m) => m.ElementEventsClient),
    { ssr: false }
);
