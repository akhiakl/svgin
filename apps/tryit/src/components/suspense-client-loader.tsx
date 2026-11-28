'use client';

import dynamic from 'next/dynamic';

// Client only: demos use relative URLs, which Node's fetch can't resolve during SSR. ssr:false needs a client module, hence these loader files.
export const SuspenseClient = dynamic(() => import('@/components/suspense-client').then((m) => m.SuspenseClient), {
    ssr: false,
});
