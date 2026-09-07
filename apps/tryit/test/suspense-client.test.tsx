import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SuspenseClient } from '@/components/suspense-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

// React's use()/Suspense retry-after-resolve doesn't reliably trigger a
// fresh render pass under RTL + jsdom on its own here (verified with a
// minimal use()+Suspense repro outside svgin-react entirely - not specific
// to this component): awaiting the underlying promise resolves it, but the
// suspended fiber isn't re-rendered until something asks React to render
// again. rerender() with the same element does that cheaply, since use()
// on an already-settled promise returns synchronously instead of
// re-suspending.
async function flushSuspense(rerender: (el: ReactElement) => void) {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
    });
    rerender(<SuspenseClient />);
}

describe('SuspenseClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('loads the valid SVG by default', async () => {
        stubSvgFetch();
        const { container, rerender } = render(<SuspenseClient />);
        await flushSuspense(rerender);
        expect(container.querySelector('svg path')).not.toBeNull();
    });

    it('shows the error boundary with a real message when the broken URL is loaded, and Reset recovers it', async () => {
        stubSvgFetch();
        const user = userEvent.setup();
        const { container, rerender } = render(<SuspenseClient />);

        await user.click(screen.getByRole('button', { name: 'Load broken URL' }));
        await flushSuspense(rerender);
        expect(screen.getByText(/Caught by error boundary:/)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Reset' }));
        await user.click(screen.getByRole('button', { name: 'Load valid SVG' }));
        await flushSuspense(rerender);
        expect(container.querySelector('svg path')).not.toBeNull();
        expect(screen.queryByText(/Caught by error boundary:/)).not.toBeInTheDocument();
    });

    it('shows the error boundary synchronously when rendered with neither src nor svg', async () => {
        stubSvgFetch();
        const user = userEvent.setup();
        render(<SuspenseClient />);

        await user.click(screen.getByRole('button', { name: 'Render with neither src nor svg' }));
        expect(await screen.findByText(/Caught by error boundary:/)).toBeInTheDocument();
    });
});
