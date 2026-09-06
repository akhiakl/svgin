import { LazyClient } from '@/components/lazy-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Lazy loading',
    description:
        '<SvgIn loading="lazy" /> defers the fetch/sanitize until its placeholder scrolls near the viewport, via IntersectionObserver.',
    path: '/lazy',
});

export default function LazyPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Lazy loading</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">&lt;SvgIn loading=&quot;lazy&quot; /&gt;</code> defers the
                fetch/sanitize until its placeholder scrolls near the viewport, via{' '}
                <code className="font-mono text-sm">IntersectionObserver</code>.
            </p>
            <div className="mt-8">
                <LazyClient />
            </div>
        </article>
    );
}
