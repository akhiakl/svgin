'use client';

import '@svgin/element';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RAW_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
  <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export function ElementRawClient() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Raw markup, no fetch</CardTitle>
                <CardDescription>
                    The <code className="font-mono text-xs">svg</code> attribute renders markup you already have
                    (from a CMS field, an API response) directly - sanitized, but skipping the fetch step entirely.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                <svg-in svg={RAW_SVG} width="56" height="56" fill="currentColor" />
                <p className="text-xs text-muted-foreground">Rendered instantly - no network request was made.</p>
            </CardContent>
        </Card>
    );
}
