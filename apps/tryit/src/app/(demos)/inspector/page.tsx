import { InspectorClient } from '@/components/inspector-client';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Inspector',
    description:
        "Paste SVG markup and see what svgin-react's <SvgIn svg={...} /> actually renders, using its real onMount callback to read the sanitized DOM.",
    path: '/inspector',
});

export default function InspectorPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Inspector</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                Paste SVG markup and see what <code className="font-mono text-sm">&lt;SvgIn svg=&#123;...&#125; /&gt;</code>{' '}
                actually renders, using its real <code className="font-mono text-sm">onMount</code> callback to read the
                sanitized DOM. Nothing here reaches into the library&apos;s internals.
            </p>
            <div className="mt-8">
                <InspectorClient />
            </div>
        </article>
    );
}
