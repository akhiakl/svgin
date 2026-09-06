'use client';

import { Suspense, useState, type ComponentProps } from 'react';
import { SvgInSuspense } from 'svgin-react/suspense';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary';

type SvgInSuspenseProps = ComponentProps<typeof SvgInSuspense>;

function Spinner() {
    return (
        <p className="text-sm text-muted-foreground" role="status">
            Loading...
        </p>
    );
}

const VALID = { src: '/demo-icon.svg' } satisfies Partial<SvgInSuspenseProps>;
// A real 404: fixed in svgin-react 0.9.1. Before that fix, a persistently
// failing fetch caused SvgInSuspense to retry forever without ever reaching
// the error boundary; the fix pins one promise per (src, svg, sanitizeFn,
// disableSanitization) key so a failed request stays failed instead of
// looping. See https://github.com/akhiakl/svgin-react/pull/47.
const BROKEN_URL = { src: '/this-does-not-exist.svg' } satisfies Partial<SvgInSuspenseProps>;
// <SvgInSuspense /> requires either `src` or `svg` and throws synchronously
// (not via a rejected fetch) when neither is given - use() requires a stable
// promise, so a fresh Promise.reject(...) on every render isn't an option;
// the synchronous throw is caught by the nearest error boundary the same
// way as any other render-time exception.
const NEITHER = {} as unknown as Partial<SvgInSuspenseProps>;

export function SuspenseClient() {
    const [props, setProps] = useState<Partial<SvgInSuspenseProps>>(VALID);
    const [key, setKey] = useState(0);

    const load = (next: Partial<SvgInSuspenseProps>) => {
        setProps(next);
        setKey((k) => k + 1);
    };

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Suspense-driven fetch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => load(VALID)}>
                        Load valid SVG
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => load(BROKEN_URL)}>
                        Load broken URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => load(NEITHER)}>
                        Render with neither src nor svg
                    </Button>
                </div>

                <div className="flex min-h-[7rem] items-center justify-center rounded-md border bg-muted/30 p-6">
                    <ErrorBoundary
                        key={key}
                        fallback={(error, reset) => (
                            <div className="text-center text-sm">
                                <p className="text-destructive">Caught by error boundary: {error.message}</p>
                                <Button size="sm" variant="outline" className="mt-2" onClick={reset}>
                                    Reset
                                </Button>
                            </div>
                        )}
                    >
                        <Suspense fallback={<Spinner />}>
                            <SvgInSuspense
                                {...(props as SvgInSuspenseProps)}
                                width={64}
                                height={64}
                                onError={(error) => console.error('SvgInSuspense onError:', error.message)}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </CardContent>
        </Card>
    );
}
