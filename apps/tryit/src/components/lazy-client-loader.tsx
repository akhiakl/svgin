'use client';

import dynamic from 'next/dynamic';

export const LazyClient = dynamic(() => import('@/components/lazy-client').then((m) => m.LazyClient), { ssr: false });
