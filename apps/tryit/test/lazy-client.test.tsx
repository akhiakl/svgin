import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LazyClient } from '@/components/lazy-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

// jsdom has no IntersectionObserver, so lazy falls back to eager; real lazy loading is covered by e2e.
describe('LazyClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the scroll-hint copy and eventually the fetched icon', async () => {
        stubSvgFetch();
        const { container } = render(<LazyClient />);
        expect(container).toHaveTextContent('Scroll down.');
        await waitFor(() => expect(container.querySelector('svg path')).not.toBeNull());
    });
});
