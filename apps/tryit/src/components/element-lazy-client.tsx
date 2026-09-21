'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import '@svgin/element';
import type { SvgInLoadEvent } from '@svgin/element';

export function ElementLazyClient() {
    const ref = useRef<HTMLElement>(null);
    const [status, setStatus] = useState('Not loaded yet - scroll down.');

    useLayoutEffect(() => {
        const el = ref.current;
        /* v8 ignore next */
        if (!el) return;
        const onLoad = (e: Event) => {
            const svg = (e as SvgInLoadEvent).detail.svg;
            setStatus(`svg-in-load fired: fetch started once the element scrolled near the viewport (${svg.tagName.toLowerCase()} rendered).`);
        };
        el.addEventListener('svg-in-load', onLoad);
        return () => el.removeEventListener('svg-in-load', onLoad);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex h-[80vh] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Scroll down. The &lt;svg-in&gt; below only starts fetching once its placeholder nears the viewport.
            </div>

            <div className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-10">
                <svg-in ref={ref} src="/demo-icon.svg" width="64" height="64" loading="lazy" aria-label="Lazily loaded demo icon" />
                <p className="text-xs text-muted-foreground" role="status">{status}</p>
            </div>
        </div>
    );
}
