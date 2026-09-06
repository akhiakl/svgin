'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const noopSubscribe = () => () => {};

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    // resolvedTheme is undefined until next-themes reads the stored/system
    // preference on mount - rendering a fixed icon until then avoids a
    // hydration mismatch between server and client markup. useSyncExternalStore
    // with a snapshot that differs between server and client gives us that
    // "has this mounted on the client yet" flag without setState-in-an-effect.
    const mounted = useSyncExternalStore(
        noopSubscribe,
        () => true,
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
