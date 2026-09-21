import { ElementRawClient } from '@/components/element-raw-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Raw markup',
    description: 'The svg attribute rendering markup you already have directly, sanitized, with no fetch at all.',
    path: '/element/raw',
});

export default function ElementRawPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Raw markup</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                The <code className="font-mono text-sm">svg</code> attribute takes precedence over{' '}
                <code className="font-mono text-sm">src</code> and skips the fetch step entirely - for markup you
                already have in hand (a CMS field, an API response), still sanitized the same way.
            </p>
            <div className="mt-8 max-w-sm">
                <ElementRawClient />
            </div>
        </article>
    );
}
