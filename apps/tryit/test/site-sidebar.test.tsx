import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

import { SiteSidebar } from '@/components/site-sidebar';
import { DOCS_LINKS } from '@/lib/docs-nav';
import { DEMOS } from '@/lib/demos';

describe('SiteSidebar', () => {
    it('renders both the Docs and Try it sections with every link', () => {
        mockUsePathname.mockReturnValue('/docs');
        render(<SiteSidebar />);
        for (const link of DOCS_LINKS) {
            expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
        }
        for (const demo of DEMOS) {
            expect(screen.getByRole('link', { name: demo.title })).toHaveAttribute('href', demo.href);
        }
    });

    it('marks the link matching the current pathname as the current page', () => {
        mockUsePathname.mockReturnValue(DOCS_LINKS[0].href);
        render(<SiteSidebar />);
        expect(screen.getByRole('link', { name: DOCS_LINKS[0].label })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: DOCS_LINKS[1].label })).not.toHaveAttribute('aria-current');
    });

    it('marks no link current when the pathname matches none of them', () => {
        mockUsePathname.mockReturnValue('/some-other-route');
        render(<SiteSidebar />);
        for (const link of screen.getAllByRole('link')) {
            expect(link).not.toHaveAttribute('aria-current');
        }
    });
});
