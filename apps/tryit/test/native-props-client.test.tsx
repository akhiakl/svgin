import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NativePropsClient } from '@/components/native-props-client';
import { stubSvgFetch } from './helpers/mockSvgFetch';

describe('NativePropsClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('forwards style/onClick/data-*/aria-* straight onto the rendered <svg>, and counts clicks', async () => {
        stubSvgFetch();
        const user = userEvent.setup();
        render(<NativePropsClient />);

        const clickable = await screen.findByRole('button', { name: 'Click, or press Enter/Space, to count' });
        expect(screen.getByText('Clicked 0 times')).toBeInTheDocument();

        await user.click(clickable);
        expect(screen.getByText('Clicked 1 time')).toBeInTheDocument();

        await user.click(clickable);
        expect(screen.getByText('Clicked 2 times')).toBeInTheDocument();

        const dataIcon = await screen.findByTestId('native-props-demo-icon');
        expect(dataIcon).toHaveAttribute('data-demo', 'svgin-react');
        expect(dataIcon).toHaveAttribute('aria-label', 'Icon carrying custom data attributes');
    });

    it('counts a click triggered by Enter or Space on the focused icon', async () => {
        stubSvgFetch();
        const user = userEvent.setup();
        render(<NativePropsClient />);

        const clickable = await screen.findByRole('button', { name: 'Click, or press Enter/Space, to count' });
        clickable.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByText('Clicked 1 time')).toBeInTheDocument();

        await user.keyboard(' ');
        expect(screen.getByText('Clicked 2 times')).toBeInTheDocument();
    });

    it('ignores other keys and cycles style.color when the button is clicked', async () => {
        stubSvgFetch();
        const user = userEvent.setup();
        render(<NativePropsClient />);

        const clickable = await screen.findByRole('button', { name: 'Click, or press Enter/Space, to count' });
        clickable.focus();
        await user.keyboard('a');
        expect(screen.getByText('Clicked 0 times')).toBeInTheDocument();

        const initialColor = clickable.style.color;
        await user.click(screen.getByRole('button', { name: 'Cycle style.color' }));
        await waitFor(() => expect(clickable.style.color).not.toBe(initialColor));
    });
});
