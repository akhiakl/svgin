'use client';

import { SvgIn } from 'svgin-react/client';
import { SvgInShadow } from 'svgin-react/shadow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ShadowClient() {
    return (
        <div className="space-y-6">
            {/* Scoped by class name only, the same way a real app's CSS often
                is - which is exactly how this kind of leak actually happens:
                a rule meant for one icon matches "svg path" anywhere inside
                the container, including the plain <SvgIn /> below that was
                never meant to be touched by it. */}
            <style>{`.shadow-leak-demo svg path { stroke: #ec4899; }`}</style>

            <div className="shadow-leak-demo grid items-start gap-6 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>&lt;SvgIn /&gt; (light DOM)</CardTitle>
                        <CardDescription>
                            A page rule targeting <code className="font-mono text-xs">svg path</code> reaches straight
                            in - nothing scopes it out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                        <SvgIn src="/demo-icon.svg" width={56} height={56} />
                        <p className="text-xs text-muted-foreground">Recolored by the outer page&apos;s own CSS.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>&lt;SvgInShadow /&gt;</CardTitle>
                        <CardDescription>Same container, same leaking rule - the shadow boundary stops it.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                        <SvgInShadow
                            src="/demo-icon.svg"
                            width={56}
                            height={56}
                            styles="svg { color: #6366f1; }"
                            data-testid="shadow-demo-host"
                        />
                        <p className="text-xs text-muted-foreground">
                            Untouched by the outer rule - colored by its own <code className="font-mono">styles</code>{' '}
                            prop instead, which never leaks back out either.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
