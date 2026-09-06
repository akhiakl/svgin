'use client';

import { SvgIn, SvgInProvider } from 'svgin-react/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProviderClient() {
    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Without a provider</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                    <SvgIn src="/this-does-not-exist.svg" width={48} height={48} />
                    <p className="text-xs text-muted-foreground">Default placeholder on error, no styling.</p>
                </CardContent>
            </Card>

            <SvgInProvider
                className="text-primary"
                fallback={<p className="text-xs text-accent-foreground">Custom provider fallback ✕</p>}
                onError={(error) => console.error('Provider onError:', error.message)}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Inside SvgInProvider</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                        <SvgIn src="/this-does-not-exist.svg" width={48} height={48} />
                        <p className="text-xs text-muted-foreground">
                            Same broken URL, but className/fallback/onError all come from the provider.
                        </p>
                    </CardContent>
                </Card>
            </SvgInProvider>
        </div>
    );
}
