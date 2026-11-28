import { Code } from 'bright';
import { CopyCodeButton } from '@/components/copy-code-button';
import { cn } from '@/lib/utils';

// Bright renders on the server only. The min-light/min-dark themes color tokens and leave the rest transparent for our own styles.
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
