import { ElementLazyClient } from '@/components/element-lazy-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Lazy loading',
    description: 'loading="lazy" deferring fetch/sanitize until the element scrolls near the viewport, via IntersectionObserver.',
    path: '/element/lazy',
});

export default function ElementLazyPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Lazy loading</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">loading=&quot;lazy&quot;</code> defers the fetch/sanitize cycle
                until the element scrolls near the viewport, via <code className="font-mono text-sm">IntersectionObserver</code>{' '}
                (<code className="font-mono text-sm">rootMargin: &apos;200px&apos;</code>) - the same behavior as{' '}
                <code className="font-mono text-sm">&lt;SvgIn loading=&quot;lazy&quot; /&gt;</code>.
            </p>
            <div className="mt-8">
                <ElementLazyClient />
            </div>
        </article>
    );
}
