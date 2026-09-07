import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockUseTheme = vi.fn();
vi.mock('next-themes', () => ({
    useTheme: () => mockUseTheme(),
}));

import { ThemeToggle } from '@/components/theme-toggle';

describe('ThemeToggle', () => {
    it('shows a "Switch to dark theme" control (and the moon icon) when resolved to light', async () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: vi.fn() });
        render(<ThemeToggle />);
        expect(await screen.findByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
    });

    it('shows a "Switch to light theme" control (and the sun icon) when resolved to dark', async () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme: vi.fn() });
        render(<ThemeToggle />);
        expect(await screen.findByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
    });

    it('switches to dark when currently resolved to light', async () => {
        const setTheme = vi.fn();
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme });
        const user = userEvent.setup();
        render(<ThemeToggle />);
        await user.click(await screen.findByRole('button', { name: 'Switch to dark theme' }));
        expect(setTheme).toHaveBeenCalledWith('dark');
    });

    it('switches to light when currently resolved to dark', async () => {
        const setTheme = vi.fn();
        mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme });
        const user = userEvent.setup();
        render(<ThemeToggle />);
        await user.click(await screen.findByRole('button', { name: 'Switch to light theme' }));
        expect(setTheme).toHaveBeenCalledWith('light');
    });
});
