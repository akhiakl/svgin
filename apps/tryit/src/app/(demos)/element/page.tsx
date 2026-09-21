import Link from 'next/link';
import { DemoGrid } from '@/components/demo-grid';
import { DEMO_GROUPS } from '@/lib/demos';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '@svgin/element',
    description:
        '<svg-in>, a framework-agnostic native Custom Element from @svgin/element, built on the same fetch/sanitize/cache internals as @svgin/react, usable without React at all.',
    path: '/element',
});

const ELEMENT_DEMOS = DEMO_GROUPS.find((group) => group.id === 'element')!.demos;

export default function ElementPage() {
    return (
        <div>
            <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">@svgin/element</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    <code className="font-mono text-sm">&lt;svg-in&gt;</code> is a real, vanilla{' '}
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Custom Element
                    </a>{' '}
                    (no Lit, no Stencil) built on the same fetch/sanitize/cache internals as{' '}
                    <code className="font-mono text-sm">&lt;SvgIn /&gt;</code>. It works in any framework, or none -
                    every demo below is just plain HTML attributes and a{' '}
                    <code className="font-mono text-sm">CustomEvent</code> listener, not a React wrapper component.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    Using React?{' '}
                    <Link className="underline underline-offset-4 hover:text-foreground" href="/react">
                        @svgin/react
                    </Link>{' '}
                    gives you the same sanitize-by-default loading as real React components.
                </p>
            </div>

            <h2 className="mt-14 text-lg font-semibold tracking-tight">Try it live</h2>
            <DemoGrid demos={ELEMENT_DEMOS} />
        </div>
    );
}
