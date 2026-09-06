import { SuspenseClient } from '@/components/suspense-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Suspense',
    description:
        '<SvgInSuspense /> suspends via React 19\'s use() instead of managing its own loading state, paired with a real <Suspense> boundary and an error boundary.',
    path: '/suspense',
});

export default function SuspensePage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Suspense</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">&lt;SvgInSuspense /&gt;</code> suspends via React 19&apos;s{' '}
                <code className="font-mono text-sm">use()</code> instead of managing its own loading state. A real{' '}
                <code className="font-mono text-sm">&lt;Suspense&gt;</code> boundary shows the pending fallback, and a
                real error boundary catches whatever it throws: a failed fetch, or the synchronous validation error
                when neither <code className="font-mono text-sm">src</code> nor{' '}
                <code className="font-mono text-sm">svg</code> is given.
            </p>
            <div className="mt-8">
                <SuspenseClient />
            </div>
        </article>
    );
}
