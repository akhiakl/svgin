import { Code } from 'bright';
import { CopyCodeButton } from '@/components/copy-code-button';
import { cn } from '@/lib/utils';

// Bright renders on the server (it depends on the "server-only" package),
// so highlighting costs nothing on the client and does not affect either
// theme's runtime performance - only the two static <pre> blocks it emits
// (one per mode) are toggled by the plain CSS rule in globals.css.
//
// "min-light"/"min-dark" only color syntax tokens and otherwise stay
// transparent, which is what lets the background/border/radius/font
// overrides below (and in globals.css) actually read as part of this
// site's own design system rather than a bolted-on docs-site theme.
Code.theme = {
    light: 'min-light',
    dark: 'min-dark',
    lightSelector: ':root:not(.dark)',
};
Code.lineNumbers = false;

export async function CodeBlock({
    code,
    lang = 'tsx',
    className,
}: {
    code: string;
    lang?: 'tsx' | 'ts' | 'jsx' | 'js' | 'bash' | 'json';
    className?: string;
}) {
    return (
        <div className={cn('relative', className)}>
            <Code lang={lang} code={code} className="rounded-lg! border font-mono text-xs leading-relaxed sm:text-sm" />
            <CopyCodeButton code={code} />
        </div>
    );
}
