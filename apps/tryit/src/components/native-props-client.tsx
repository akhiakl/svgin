'use client';

import { useState } from 'react';
import { SvgIn } from 'svgin-react/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['currentColor', '#fbae00', '#ec4899', '#22c55e'] as const;

export function NativePropsClient() {
    const [colorIndex, setColorIndex] = useState(0);
    const [clicks, setClicks] = useState(0);

    return (
        <div className="grid items-start gap-6 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>style + onClick</CardTitle>
                    <CardDescription>Neither is a curated prop - both land on the rendered &lt;svg&gt; unchanged.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 rounded-md border bg-muted/30 p-6">
                    <SvgIn
                        src="/demo-icon.svg"
                        width={56}
                        height={56}
                        style={{ color: COLORS[colorIndex], cursor: 'pointer' }}
                        onClick={() => setClicks((c) => c + 1)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setClicks((c) => c + 1);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Click, or press Enter/Space, to count"
                    />
                    <p className="text-sm text-muted-foreground">Clicked {clicks} time{clicks === 1 ? '' : 's'}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setColorIndex((i) => (i + 1) % COLORS.length)}
                    >
                        Cycle style.color
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>data-* and aria-*</CardTitle>
                    <CardDescription>Inspect this element - the attributes below are on the real &lt;svg&gt;, not a wrapper.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 rounded-md border bg-muted/30 p-6">
                    <SvgIn
                        src="/demo-icon.svg"
                        width={56}
                        height={56}
                        data-testid="native-props-demo-icon"
                        data-demo="svgin-react"
                        aria-label="Icon carrying custom data attributes"
                    />
                    <code className="text-xs text-muted-foreground">
                        data-testid=&quot;native-props-demo-icon&quot; data-demo=&quot;svgin-react&quot;
                    </code>
                </CardContent>
            </Card>
        </div>
    );
}
