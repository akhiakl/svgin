'use client';

import dynamic from 'next/dynamic';

// SvgInSuspense's fetch runs during SSR too via use(), and a relative URL
// (correct in the browser, resolved against location) can't be parsed by
// Node's fetch during that server render - rather than build every demo's
// URL as absolute, this stays client-only, matching the "load it and watch
// it suspend" nature of the demo. next/dynamic's ssr:false option only
// works from a Client Component, hence this tiny wrapper file.
export const SuspenseClient = dynamic(() => import('@/components/suspense-client').then((m) => m.SuspenseClient), {
    ssr: false,
});
