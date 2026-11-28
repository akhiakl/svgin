'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const noopSubscribe = () => () => {};

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    // resolvedTheme is undefined until mount; render a fixed icon until then to avoid a hydration mismatch.
    const mounted = useSyncExternalStore(
        noopSubscribe,
        () => true,
        /* v8 ignore next */
        () => false
    );

    return (
        <Button
            variant="outline"
            size="icon"
            aria-label={mounted && resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
            {mounted && resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
    );
}
