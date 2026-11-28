'use client';

import dynamic from 'next/dynamic';

export const ElementInspectorClient = dynamic(
    () => import('@/components/element-inspector-client').then((m) => m.ElementInspectorClient),
    { ssr: false }
);
