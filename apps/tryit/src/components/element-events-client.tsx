'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import '@svgin/element';
import type { SvgInErrorEvent } from '@svgin/element';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ElementEventsClient() {
    const ref = useRef<HTMLElement>(null);
    const [status, setStatus] = useState('Loading...');

    useLayoutEffect(() => {
        const el = ref.current;
        /* v8 ignore next */
        if (!el) return;
        const onError = (e: Event) => {
            const error = (e as SvgInErrorEvent).detail.error;
            setStatus(`svg-in-error fired: ${error.message}`);
        };
        el.addEventListener('svg-in-error', onError);
        return () => el.removeEventListener('svg-in-error', onError);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>svg-in-error event</CardTitle>
                <CardDescription>
                    A failing <code className="font-mono text-xs">src</code> dispatches{' '}
                    <code className="font-mono text-xs">svg-in-error</code> instead of throwing - there is no React
                    error boundary here to catch anything, since a plain custom element has no callback-prop channel
                    for an <code className="font-mono text-xs">onError</code> the way <code className="font-mono text-xs">&lt;SvgIn /&gt;</code> does.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                <svg-in ref={ref} src="/this-does-not-exist.svg" width="56" height="56" />
                <p className="text-xs text-muted-foreground" role="status">{status}</p>
            </CardContent>
        </Card>
    );
}
