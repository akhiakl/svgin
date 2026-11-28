import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementLazyClient } from '@/components/element-lazy-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

// jsdom has no IntersectionObserver, so lazy falls back to eager; real lazy loading is covered by e2e.
describe('ElementLazyClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the scroll-hint copy and eventually the fetched icon, firing svg-in-load', async () => {
        stubSvgFetch();
        const { container, getByText } = render(<ElementLazyClient />);
        expect(container).toHaveTextContent('Scroll down.');
        await waitFor(() => expect(container.querySelector('svg-in svg path')).not.toBeNull());
        expect(getByText(/svg-in-load fired/)).toBeInTheDocument();
    });
});
