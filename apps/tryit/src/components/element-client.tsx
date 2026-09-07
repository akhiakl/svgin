'use client';

import { useLayoutEffect, useRef, useState } from 'react';
// Side-effect import: registers the <svg-in> custom element (see
// svgin-element/src/index.ts's customElements.define call). Nothing is
// destructured from it - the event/type imports below are types only, so
// they don't pull in a second copy of the registration side effect.
import 'svgin-element';
import type { SvgInErrorEvent, SvgInLoadEvent } from 'svgin-element';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function StatusLine({ status }: { status: string }) {
    return <p className="text-xs text-muted-foreground" role="status">{status}</p>;
}

export function ElementClient() {
    const okRef = useRef<HTMLElement>(null);
    const brokenRef = useRef<HTMLElement>(null);
    const [okStatus, setOkStatus] = useState('Loading...');
    const [brokenStatus, setBrokenStatus] = useState('Loading...');

    // useLayoutEffect, not useEffect: <svg-in> only yields a single
    // microtask (see SvgIn.ts's #beginLoad) before it may resolve
    // synchronously-relative-to-React (e.g. a cached src, or the `svg`
    // attribute path with no fetch at all) - plain useEffect is scheduled
    // after paint, which can run *after* that microtask has already
    // settled and dispatched, missing the event entirely and leaving the
    // status stuck on "Loading...". useLayoutEffect runs synchronously
    // right after the DOM commit (connectedCallback has already fired by
    // then, but #beginLoad's own microtask hasn't had a chance to resolve
    // yet), so the listener is reliably attached in time.
    useLayoutEffect(() => {
        const el = okRef.current;
        // Defensive only: this effect runs after the ref'd <svg-in> has
        // committed, so el is never actually null in practice.
        /* v8 ignore next */
        if (!el) return;
        const onLoad = (e: Event) => {
            const svg = (e as SvgInLoadEvent).detail.svg;
            setOkStatus(`svg-in-load fired: inlined a real <svg> (${svg.tagName.toLowerCase()}) with no React wrapper.`);
        };
        el.addEventListener('svg-in-load', onLoad);
        return () => el.removeEventListener('svg-in-load', onLoad);
    }, []);

    useLayoutEffect(() => {
        const el = brokenRef.current;
        // Defensive only: same reasoning as the effect above.
        /* v8 ignore next */
        if (!el) return;
        const onError = (e: Event) => {
            const error = (e as SvgInErrorEvent).detail.error;
            setBrokenStatus(`svg-in-error fired: ${error.message}`);
        };
        el.addEventListener('svg-in-error', onError);
        return () => el.removeEventListener('svg-in-error', onError);
    }, []);

    return (
        <div className="grid items-start gap-6 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Plain HTML, no React wrapper</CardTitle>
                    <CardDescription>
                        <code className="font-mono text-xs">&lt;svg-in src=&quot;...&quot;&gt;&lt;/svg-in&gt;</code> -
                        a real custom element, usable from any framework or none at all.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                    <svg-in ref={okRef} src="/demo-icon.svg" width="56" height="56" svg-title="Demo icon" />
                    <StatusLine status={okStatus} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>svg-in-error event</CardTitle>
                    <CardDescription>
                        A failing <code className="font-mono text-xs">src</code> dispatches{' '}
                        <code className="font-mono text-xs">svg-in-error</code> instead of throwing - there is no
                        React error boundary here to catch anything.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                    <svg-in ref={brokenRef} src="/this-does-not-exist.svg" width="56" height="56" />
                    <StatusLine status={brokenStatus} />
                </CardContent>
            </Card>
        </div>
    );
}
