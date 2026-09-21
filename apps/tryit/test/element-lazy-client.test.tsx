import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementLazyClient } from '@/components/element-lazy-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

// jsdom has no IntersectionObserver, so @svgin/element's own `loading="lazy"`
// deferral is a documented no-op here (falls back to eager) - this
// component's real lazy behavior is exercised by Playwright instead (a real
// browser, see e2e/); this test covers the component's own markup and that
// the icon does resolve.
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
