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

        // The default placeholder is an empty aria-hidden <svg>, so assert via the caption.
        expect(screen.getByText('Default placeholder on error, no styling.')).toBeInTheDocument();
        expect(await screen.findByText('Custom provider fallback ✕')).toBeInTheDocument();
    });
});
