'use client';

import { useLayoutEffect, useRef, useState } from 'react';
// Side-effect import: registers the <svg-in> custom element (see
// @svgin/element/src/index.ts's customElements.define call).
import '@svgin/element';
import type { SvgInLoadEvent } from '@svgin/element';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ElementBasicClient() {
    const ref = useRef<HTMLElement>(null);
    const [status, setStatus] = useState('Loading...');

    // useLayoutEffect, not useEffect: <svg-in> only yields a single
    // microtask (see SvgIn.ts's #beginLoad) before it may resolve
    // synchronously-relative-to-React - plain useEffect is scheduled after
    // paint, which can run *after* that microtask has already settled and
    // dispatched, missing the event entirely and leaving status stuck on
    // "Loading...". useLayoutEffect runs synchronously right after the DOM
    // commit, reliably attaching the listener in time.
    useLayoutEffect(() => {
        const el = ref.current;
        /* v8 ignore next */
        if (!el) return;
        const onLoad = (e: Event) => {
            const svg = (e as SvgInLoadEvent).detail.svg;
            setStatus(`svg-in-load fired: inlined a real <svg> (${svg.tagName.toLowerCase()}) with no React wrapper.`);
        };
        el.addEventListener('svg-in-load', onLoad);
        return () => el.removeEventListener('svg-in-load', onLoad);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Plain HTML, no React wrapper</CardTitle>
                <CardDescription>
                    <code className="font-mono text-xs">&lt;svg-in src=&quot;...&quot;&gt;&lt;/svg-in&gt;</code> - a
                    real custom element, usable from any framework or none at all.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                <svg-in ref={ref} src="/demo-icon.svg" width="56" height="56" svg-title="Demo icon" />
                <p className="text-xs text-muted-foreground" role="status">{status}</p>
            </CardContent>
        </Card>
    );
}
