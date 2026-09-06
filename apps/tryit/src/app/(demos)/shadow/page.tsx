import { ShadowClient } from '@/components/shadow-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Shadow DOM',
    description:
        '<SvgInShadow /> renders the SVG inside a shadow root, fully encapsulating its style in both directions - immune to page-wide CSS, and its own styles prop never leaks back out.',
    path: '/shadow',
});

export default function ShadowPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Shadow DOM</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                <code className="font-mono text-sm">&lt;SvgIn /&gt;</code> renders the sanitized SVG directly into the
                page (the light DOM), so a page-wide CSS rule that happens to match one of its elements reaches
                straight in - and its own inline <code className="font-mono text-sm">&lt;style&gt;</code>, if it has
                one, reaches straight out.{' '}
                <code className="font-mono text-sm">&lt;SvgInShadow /&gt;</code> renders into a{' '}
                <a
                    className="underline underline-offset-4 hover:text-foreground"
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM"
                    target="_blank"
                    rel="noreferrer"
                >
                    shadow root
                </a>{' '}
                instead, closing that door in both directions. Both cards below sit inside the same container, with
                the same leaking page rule applied to it.
            </p>
            <div className="mt-8">
                <ShadowClient />
            </div>
        </article>
    );
}
