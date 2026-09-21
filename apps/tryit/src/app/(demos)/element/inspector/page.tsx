import { ElementInspectorClient } from '@/components/element-inspector-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Inspector',
    description: 'disable-sanitization compared side by side: a malicious payload stripped by default, or rendered raw when opted out.',
    path: '/element/inspector',
});

export default function ElementInspectorPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Inspector</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                The same markup - carrying a <code className="font-mono text-sm">&lt;script&gt;</code> tag, event
                handler attributes, and <code className="font-mono text-sm">javascript:</code> URLs - rendered twice:
                once sanitized by default, once with{' '}
                <code className="font-mono text-sm">disable-sanitization</code> set. Same payload the React Inspector
                demo uses.
            </p>
            <div className="mt-8">
                <ElementInspectorClient />
            </div>
        </article>
    );
}
