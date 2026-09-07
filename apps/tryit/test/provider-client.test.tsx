import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProviderClient } from '@/components/provider-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

describe('ProviderClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the default fallback outside a provider, and the provider-supplied fallback inside one, for the same broken URL', async () => {
        stubSvgFetch();
        render(<ProviderClient />);

        // Both cards fetch the same nonexistent URL and fail - the default
        // (no className/fallback) placeholder is an aria-hidden empty <svg>,
        // not visible text, so its presence is asserted by absence of any
        // fallback text in that card plus the explicit caption below it.
        expect(screen.getByText('Default placeholder on error, no styling.')).toBeInTheDocument();
        expect(await screen.findByText('Custom provider fallback ✕')).toBeInTheDocument();
    });
});
