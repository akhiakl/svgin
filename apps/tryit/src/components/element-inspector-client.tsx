'use client';

import '@svgin/element';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Same payload as the React Inspector demo's "Malicious" example
// (src/lib/examples.ts), so both packages' Inspector demos show the exact
// same attack surface being handled.
const MALICIOUS_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" onload="alert('xss')">
  <script>alert('xss via script tag')</script>
  <rect width="100" height="100" fill="red" onclick="alert('xss via onclick')" />
  <image href="javascript:alert('xss via image href')" />
  <a xlink:href="javascript:alert('xss via xlink')"><text x="10" y="50">click me</text></a>
</svg>`;

export function ElementInspectorClient() {
    return (
        <div className="grid items-start gap-6 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sanitized (default)</CardTitle>
                    <CardDescription>
                        The same markup, DOMPurify-sanitized by default - the{' '}
                        <code className="font-mono text-xs">&lt;script&gt;</code>, event handler attributes, and{' '}
                        <code className="font-mono text-xs">javascript:</code> URLs are all stripped.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                    <svg-in svg={MALICIOUS_SVG} width="56" height="56" />
                    <p className="text-xs text-muted-foreground">Safe to render - nothing here can execute.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>disable-sanitization</CardTitle>
                    <CardDescription>
                        The same markup with <code className="font-mono text-xs">disable-sanitization</code> set -
                        only use this for markup you already trust completely.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-6">
                    <svg-in svg={MALICIOUS_SVG} width="56" height="56" disable-sanitization={true} />
                    <p className="text-xs text-muted-foreground">Rendered as-is - the event handlers are intact (they will not fire from a static demo, but nothing removed them).</p>
                </CardContent>
            </Card>
        </div>
    );
}
