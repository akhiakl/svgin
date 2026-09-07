import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

import { SiteNav } from '@/components/site-nav';
import { DEMOS } from '@/lib/demos';

describe('SiteNav', () => {
    it('highlights "Try it" for the home page and for any demo route', () => {
        mockUsePathname.mockReturnValue(DEMOS[0].href);
        render(<SiteNav />);
        const desktopNav = screen.getByRole('list');
        expect(within(desktopNav).getByRole('link', { name: 'Try it' })).toHaveClass('text-foreground');
        expect(within(desktopNav).getByRole('link', { name: 'Docs' })).not.toHaveClass('text-foreground');
    });

    it('highlights "Docs" for any /docs route', () => {
        mockUsePathname.mockReturnValue('/docs/installation');
        render(<SiteNav />);
        const desktopNav = screen.getByRole('list');
        expect(within(desktopNav).getByRole('link', { name: 'Docs' })).toHaveClass('text-foreground');
        expect(within(desktopNav).getByRole('link', { name: 'Try it' })).not.toHaveClass('text-foreground');
    });

    it('opens the mobile drawer, listing every top-level and child link, and closes it on a child link click', async () => {
        mockUsePathname.mockReturnValue('/');
        const user = userEvent.setup();
        render(<SiteNav />);

        await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
        const drawer = await screen.findByRole('dialog');
        expect(within(drawer).getByText('svgin-react / try it')).toBeInTheDocument();
        expect(within(drawer).getByRole('link', { name: DEMOS[0].title })).toHaveAttribute('href', DEMOS[0].href);

        await user.click(within(drawer).getByRole('link', { name: DEMOS[0].title }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('also closes the mobile drawer when a top-level link (not a child link) is clicked', async () => {
        mockUsePathname.mockReturnValue('/docs');
        const user = userEvent.setup();
        render(<SiteNav />);

        await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
        const drawer = await screen.findByRole('dialog');

        await user.click(within(drawer).getByRole('link', { name: 'Try it' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
