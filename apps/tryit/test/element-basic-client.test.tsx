import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementBasicClient } from '@/components/element-basic-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

describe('ElementBasicClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders a real <svg-in> that loads a valid SVG and fires svg-in-load', async () => {
        stubSvgFetch();
        const { container } = render(<ElementBasicClient />);
        await waitFor(() => expect(container.querySelector('svg-in svg path')).not.toBeNull());
        expect(screen.getByText(/svg-in-load fired: inlined a real <svg>/)).toBeInTheDocument();
    });
});
