'use client';

import { Suspense, useState, type ComponentProps } from 'react';
import { SvgInSuspense } from '@svgin/react/suspense';
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
const BROKEN_URL = { src: '/this-does-not-exist.svg' } satisfies Partial<SvgInSuspenseProps>;
// Neither `src` nor `svg`: a synchronous throw, caught by the error boundary.
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
