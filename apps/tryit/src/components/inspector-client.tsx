'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { SvgIn } from 'svgin-react/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { diffSanitization } from '@/lib/diff';
import { EXAMPLES } from '@/lib/examples';

export function InspectorClient() {
    const [raw, setRaw] = useState(EXAMPLES[0].svg);
    const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [renderKey, setRenderKey] = useState(0);
    const outputId = useId();

    const handleMount = useCallback((el: SVGSVGElement) => {
        setSanitizedHtml(el.outerHTML);
        setRenderError(null);
    }, []);

    const handleError = useCallback((error: Error) => {
        setRenderError(error.message);
        setSanitizedHtml(null);
    }, []);

    const diff = useMemo(
        () => (sanitizedHtml !== null ? diffSanitization(raw, sanitizedHtml) : null),
        [raw, sanitizedHtml]
    );

    // A fresh svg prop value already re-triggers <SvgIn />'s sanitize effect,
    // but bumping the key forces a clean remount so onMount fires again even
    // when raw is unchanged (e.g. clicking the same example twice).
    const rerun = useCallback(() => setRenderKey((k) => k + 1), []);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Paste SVG markup</CardTitle>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((example) => (
                            <Button
                                key={example.id}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setRaw(example.svg);
                                    rerun();
                                }}
                            >
                                {example.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        rows={14}
                        className="font-mono text-xs"
                        aria-label="Raw SVG input"
                    />
                    <Button className="mt-3" onClick={rerun}>
                        Sanitize
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>What svgin-react rendered</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center rounded-md border bg-muted/30 p-6" id={outputId}>
                        {renderError ? (
                            <p className="text-sm text-destructive">Failed to render: {renderError}</p>
                        ) : (
                            <SvgIn
                                key={renderKey}
                                svg={raw}
                                width={96}
                                height={96}
                                onMount={handleMount}
                                onError={handleError}
                                fallback={<p className="text-sm text-muted-foreground">Nothing rendered.</p>}
                            />
                        )}
                    </div>

                    {diff && (
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">What the default sanitizer removed:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {diff.removedTags.length === 0 && diff.removedAttrs.length === 0 ? (
                                    <Badge variant="secondary">Nothing removed</Badge>
                                ) : (
                                    <>
                                        {diff.removedTags.map((tag) => (
                                            <Badge key={`tag-${tag}`} variant="destructive">
                                                {`<${tag}>`}
                                            </Badge>
                                        ))}
                                        {diff.removedAttrs.map((attr) => (
                                            <Badge key={`attr-${attr}`} variant="destructive">
                                                {attr}
                                            </Badge>
                                        ))}
                                    </>
                                )}
                            </div>
                            <p className="text-muted-foreground">{diff.bytesRemoved} characters removed.</p>
                        </div>
                    )}

                    {sanitizedHtml && (
                        <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Sanitized markup</summary>
                            <pre className="mt-2 overflow-x-auto rounded-md border bg-muted/30 p-3 font-mono">
                                {sanitizedHtml}
                            </pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
