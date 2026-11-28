'use client';

import dynamic from 'next/dynamic';

export const ShadowClient = dynamic(() => import('@/components/shadow-client').then((m) => m.ShadowClient), {
    ssr: false,
});
