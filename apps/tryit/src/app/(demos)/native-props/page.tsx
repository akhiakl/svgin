import { NativePropsClient } from '@/components/native-props-client-loader';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Native SVG props',
    description:
        '<SvgIn /> accepts any standard SVG/DOM prop (style, onClick, role, tabIndex, data-*, native aria-*) and forwards it straight onto the rendered <svg>, the same as a plain <svg> tag would.',
    path: '/native-props',
});

export default function NativePropsPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Native SVG props</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                Beyond its own curated props (<code className="font-mono text-sm">width</code>,{' '}
                <code className="font-mono text-sm">height</code>, <code className="font-mono text-sm">fill</code>,
                <code className="font-mono text-sm">title</code>, ...),{' '}
                <code className="font-mono text-sm">&lt;SvgIn /&gt;</code> accepts any other standard SVG/DOM prop -{' '}
                <code className="font-mono text-sm">style</code>, event handlers like{' '}
                <code className="font-mono text-sm">onClick</code>, <code className="font-mono text-sm">role</code>,{' '}
                <code className="font-mono text-sm">tabIndex</code>, <code className="font-mono text-sm">data-*</code>,
                native <code className="font-mono text-sm">aria-*</code> - and forwards it straight onto the rendered{' '}
                <code className="font-mono text-sm">&lt;svg&gt;</code>, the same way a plain{' '}
                <code className="font-mono text-sm">&lt;svg&gt;</code> tag would accept them.
            </p>
            <div className="mt-8">
                <NativePropsClient />
            </div>
        </article>
    );
}
