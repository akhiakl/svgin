'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyCodeButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const resetTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Clear any pending "reset to Copy" timeout on unmount, so a click right
    // before navigating away can't call setState on an unmounted component.
    useEffect(() => () => clearTimeout(resetTimeout.current), []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
        } catch {
            // Clipboard access can fail (permissions, insecure context) -
            // nothing useful to do beyond not showing a false "Copied".
            return;
        }
        setCopied(true);
        clearTimeout(resetTimeout.current);
        resetTimeout.current = setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
    );
}
