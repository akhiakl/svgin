import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementEventsClient } from '@/components/element-events-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

describe('ElementEventsClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the svg-in-error message for a broken src', async () => {
        stubSvgFetch();
        render(<ElementEventsClient />);
        expect(await screen.findByText(/svg-in-error fired:/)).toBeInTheDocument();
    });
});
