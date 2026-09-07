import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// bright's Code component transitively imports the `server-only` package,
// which throws unconditionally outside a real Next.js server/client build
// boundary (there's no such boundary at vitest's own module-resolution
// time) - mocked here so this test can exercise CodeBlock's own wrapper
// markup/prop-forwarding, not bright's actual syntax-highlighting output
// (that's a third-party concern, and is exercised for real via the
// Playwright e2e suite rendering real pages through Next.js).
vi.mock('bright', () => ({
    Code: ({ code, lang, className }: { code: string; lang: string; className: string }) => (
        <pre data-testid="code" data-lang={lang} className={className}>
            {code}
        </pre>
    ),
}));

import { CodeBlock } from '@/components/code-block';

describe('CodeBlock', () => {
    it('renders the given code and a copy button', async () => {
        const el = await CodeBlock({ code: 'const x = 1;', lang: 'js' });
        render(el);
        expect(screen.getByTestId('code')).toHaveAttribute('data-lang', 'js');
        expect(screen.getByText('const x = 1;')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    });

    it('defaults to tsx and forwards an extra className onto the wrapper', async () => {
        const el = await CodeBlock({ code: 'const y = 2;', className: 'extra-class' });
        const { container } = render(el);
        expect(screen.getByTestId('code')).toHaveAttribute('data-lang', 'tsx');
        expect(container.firstChild).toHaveClass('extra-class');
    });
});
