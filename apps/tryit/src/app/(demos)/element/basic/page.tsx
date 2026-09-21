import { ElementBasicClient } from '@/components/element-basic-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Basic',
    description: '<svg-in src="..."> fetching and rendering a real SVG, no React wrapper, plus the svg-in-load event.',
    path: '/element/basic',
});

export default function ElementBasicPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Basic</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">&lt;svg-in src=&quot;...&quot;&gt;</code> fetches and sanitizes an
                SVG the same way <code className="font-mono text-sm">&lt;SvgIn src=&quot;...&quot;&gt;</code> does,
                with no React (or any framework) involved - just a real Custom Element and a{' '}
                <code className="font-mono text-sm">svg-in-load</code> event.
            </p>
            <div className="mt-8 max-w-sm">
                <ElementBasicClient />
            </div>
        </article>
    );
}
