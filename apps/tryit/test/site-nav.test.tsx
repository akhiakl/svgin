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
        mockUsePathname.mockReturnValue('/docs/react/installation');
        render(<SiteNav />);
        const desktopNav = screen.getByRole('list');
        expect(within(desktopNav).getByRole('link', { name: 'Docs' })).toHaveClass('text-foreground');
        expect(within(desktopNav).getByRole('link', { name: 'Try it' })).not.toHaveClass('text-foreground');
    });

    it('opens the mobile drawer with the same SiteSidebar (groups open by default), and closes on a child link click', async () => {
        mockUsePathname.mockReturnValue('/');
        const user = userEvent.setup();
        render(<SiteNav />);

        await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
        const drawer = await screen.findByRole('dialog');
        expect(within(drawer).getByText('svgin / try it')).toBeInTheDocument();

        // Same SiteSidebar reused here (not a separate, differently-behaved
        // copy) - groups start open, same as the inline desktop usage.
        // DEMOS[0].title ("Inspector") isn't unique across the React/Element
        // groups, so this goes by href (always unique) instead of name.
        const link = drawer.querySelector<HTMLAnchorElement>(`a[href="${DEMOS[0].href}"]`);
        expect(link).not.toBeNull();

        await user.click(link!);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the mobile drawer when the Docs section\'s Introduction link is clicked', async () => {
        mockUsePathname.mockReturnValue('/docs');
        const user = userEvent.setup();
        render(<SiteNav />);

        await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
        const drawer = await screen.findByRole('dialog');

        await user.click(within(drawer).getByRole('link', { name: 'Introduction' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the mobile drawer when the "svgin / try it" home link is clicked', async () => {
        mockUsePathname.mockReturnValue('/docs');
        const user = userEvent.setup();
        render(<SiteNav />);

        await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
        const drawer = await screen.findByRole('dialog');

        await user.click(within(drawer).getByRole('link', { name: 'svgin / try it' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
