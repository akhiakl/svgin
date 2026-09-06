import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Docs',
    description:
        'How svgin-react fetches an SVG from a URL, or takes raw markup directly, and renders it as a real, styleable React element sanitized with DOMPurify by default.',
    path: '/docs',
});

export default function DocsPage() {
    return (
        <article className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Introduction</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href="https://www.npmjs.com/package/svgin-react"
                        target="_blank"
                        rel="noreferrer"
                    >
                        svgin-react
                    </a>{' '}
                    fetches an SVG from a URL, or takes raw markup directly, and renders it as a real, styleable React
                    element instead of an <code className="font-mono text-sm">&lt;img&gt;</code>. It sanitizes the SVG
                    with DOMPurify by default, so it is safe to use with SVGs from a source you do not fully control,
                    and it works both as a client component and in React Server Components.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Client component</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Renders on the browser. Manages its own loading/error state.
                </p>
                <CodeBlock
                    className="mt-3"
                    code={`import { SvgIn } from 'svgin-react/client';\n\n<SvgIn src="/icons/alert.svg" width={24} height={24} className="text-red-500" />;`}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold tracking-tight">Server component</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Fetches and sanitizes entirely on the server. No client JS ships for it.
                </p>
                <CodeBlock
                    className="mt-3"
                    code={`import { SvgIn } from 'svgin-react/server';\n\nexport default async function Icon() {\n  return <SvgIn src="https://example.com/icon.svg" width={24} height={24} />;\n}`}
                />
            </div>

            <p className="text-sm text-muted-foreground">
                Continue to <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/installation">Installation</Link> or jump straight to the{' '}
                <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/api">API reference</Link>.
            </p>
        </article>
    );
}
