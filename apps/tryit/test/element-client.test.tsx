import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementClient } from '@/components/element-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

describe('ElementClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders a real <svg-in> that loads a valid SVG and fires svg-in-load', async () => {
        stubSvgFetch();
        const { container } = render(<ElementClient />);
        await waitFor(() => expect(container.querySelector('svg-in svg path')).not.toBeNull());
        expect(screen.getByText(/svg-in-load fired: inlined a real <svg>/)).toBeInTheDocument();
    });

    it('shows the svg-in-error message for a broken src', async () => {
        stubSvgFetch();
        render(<ElementClient />);
        expect(await screen.findByText(/svg-in-error fired:/)).toBeInTheDocument();
    });
});
