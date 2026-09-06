import { ProviderClient } from '@/components/provider-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Provider defaults',
    description:
        '<SvgInProvider /> sets shared className, fallback, and onError defaults for every <SvgIn /> beneath it, without repeating them on each icon.',
    path: '/provider',
});

export default function ProviderPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Provider defaults</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">&lt;SvgInProvider /&gt;</code> sets shared{' '}
                <code className="font-mono text-sm">className</code>, <code className="font-mono text-sm">fallback</code>,
                and <code className="font-mono text-sm">onError</code> defaults for every{' '}
                <code className="font-mono text-sm">&lt;SvgIn /&gt;</code> beneath it. A prop passed directly still
                wins. Both cards below point at the same broken URL.
            </p>
            <div className="mt-8">
                <ProviderClient />
            </div>
        </article>
    );
}
