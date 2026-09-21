import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

import { SiteSidebar } from '@/components/site-sidebar';
import { DOCS_LINKS } from '@/lib/docs-nav';
import { DEMOS } from '@/lib/demos';

// DOCS_LINKS/DEMOS link labels aren't unique across groups (React and
// Element both have an "Installation"/"API reference"/"Lazy loading"/
// "Inspector"), so lookups here go by href (always unique) via a plain CSS
// attribute selector rather than getByRole's name matching, which would
// throw on an ambiguous label.
function linkByHref(href: string) {
    return document.querySelector(`a[href="${href}"]`) as HTMLAnchorElement;
}

describe('SiteSidebar', () => {
    it('renders both the Docs and Try it sections with every link', () => {
        mockUsePathname.mockReturnValue('/docs');
        render(<SiteSidebar />);
        for (const link of DOCS_LINKS) {
            expect(linkByHref(link.href)).not.toBeNull();
        }
        for (const demo of DEMOS) {
            expect(linkByHref(demo.href)).not.toBeNull();
        }
    });

    it('marks the link matching the current pathname as the current page', () => {
        mockUsePathname.mockReturnValue(DOCS_LINKS[0].href);
        render(<SiteSidebar />);
        expect(linkByHref(DOCS_LINKS[0].href)).toHaveAttribute('aria-current', 'page');
        expect(linkByHref(DOCS_LINKS[1].href)).not.toHaveAttribute('aria-current');
    });

    it('marks the matching link current in the Try it section too, for a demo route', () => {
        mockUsePathname.mockReturnValue(DEMOS[0].href);
        render(<SiteSidebar />);
        expect(linkByHref(DEMOS[0].href)).toHaveAttribute('aria-current', 'page');
        expect(linkByHref(DEMOS[1].href)).not.toHaveAttribute('aria-current');
    });

    it('marks no link current when the pathname matches none of them', () => {
        mockUsePathname.mockReturnValue('/some-other-route');
        render(<SiteSidebar />);
        for (const link of screen.getAllByRole('link')) {
            expect(link).not.toHaveAttribute('aria-current');
        }
    });

    it('groups React and Element links under their own labeled subsections, in both Docs and Try it', () => {
        mockUsePathname.mockReturnValue('/docs');
        render(<SiteSidebar />);
        // Two "React" and two "Element" group headings - one pair per section.
        expect(screen.getAllByText('React')).toHaveLength(2);
        expect(screen.getAllByText('Element')).toHaveLength(2);
    });
});
