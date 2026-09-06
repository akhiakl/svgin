'use client';

import { SvgIn } from 'svgin-react/client';

export function LazyClient() {
    return (
        <div className="space-y-4">
            <div className="flex h-[80vh] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Scroll down. The SVG below only starts fetching once its placeholder nears the viewport.
            </div>

            <div className="flex items-center justify-center rounded-md border bg-muted/30 p-10">
                <SvgIn
                    src="/demo-icon.svg"
                    width={64}
                    height={64}
                    loading="lazy"
                    ariaLabel="Lazily loaded demo icon"
                    onMount={() => console.log('SvgIn (lazy): fetch started, now mounted')}
                />
            </div>
        </div>
    );
}
