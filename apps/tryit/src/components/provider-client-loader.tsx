'use client';

import dynamic from 'next/dynamic';

export const ProviderClient = dynamic(() => import('@/components/provider-client').then((m) => m.ProviderClient), {
    ssr: false,
});
