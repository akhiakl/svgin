import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShadowClient } from '@/components/shadow-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

describe('ShadowClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders both the light-DOM <SvgIn /> and a shadow-hosted <SvgInShadow />', async () => {
        stubSvgFetch();
        const { container } = render(<ShadowClient />);

        await waitFor(() => expect(container.querySelector('svg path')).not.toBeNull());

        const shadowHost = await screen.findByTestId('shadow-demo-host');
        await waitFor(() => expect(shadowHost.shadowRoot?.querySelector('svg')).not.toBeNull());
    });
});
