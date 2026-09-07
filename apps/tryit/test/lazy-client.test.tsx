import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LazyClient } from '@/components/lazy-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

// jsdom has no IntersectionObserver, so svgin-react's own `loading="lazy"`
// deferral is a documented no-op here (falls back to eager) - this
// component's real lazy behavior is exercised by Playwright instead
// (a real browser, see e2e/); this test covers the component's own markup
// and that the icon does resolve.
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
