import { ElementClient } from '@/components/element-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Web Component',
    description:
        '<svg-in>, a framework-agnostic native Custom Element from svgin-element, built on the same fetch/sanitize/cache internals as svgin-react, usable without React at all.',
    path: '/element',
});

export default function ElementPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Web Component</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">&lt;svg-in&gt;</code> is a real, vanilla{' '}
                <a
                    className="underline underline-offset-4 hover:text-foreground"
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components"
                    target="_blank"
                    rel="noreferrer"
                >
                    Custom Element
                </a>{' '}
                (no Lit, no Stencil - see <code className="font-mono text-sm">svgin-element</code>) built on the same{' '}
                <code className="font-mono text-sm">svgin-core</code> fetch/sanitize/cache internals as{' '}
                <code className="font-mono text-sm">&lt;SvgIn /&gt;</code>. It works in any framework, or none - both
                cards below are just plain HTML attributes and a{' '}
                <code className="font-mono text-sm">CustomEvent</code> listener, not a React wrapper component.
            </p>
            <div className="mt-8">
                <ElementClient />
            </div>
        </article>
    );
}
