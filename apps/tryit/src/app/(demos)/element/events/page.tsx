import { ElementEventsClient } from '@/components/element-events-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Events',
    description: 'A failing src dispatching svg-in-error instead of throwing - no React error boundary involved.',
    path: '/element/events',
});

export default function ElementEventsPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                No <code className="font-mono text-sm">onError</code>/<code className="font-mono text-sm">onMount</code>{' '}
                callback props - a plain custom element has no prop channel for a callback to hang off of. Instead,{' '}
                <code className="font-mono text-sm">&lt;svg-in&gt;</code> dispatches bubbling, composed{' '}
                <code className="font-mono text-sm">CustomEvent</code>s: <code className="font-mono text-sm">svg-in-load</code>{' '}
                (see the Basic demo) and <code className="font-mono text-sm">svg-in-error</code>, below.
            </p>
            <div className="mt-8 max-w-sm">
                <ElementEventsClient />
            </div>
        </article>
    );
}
