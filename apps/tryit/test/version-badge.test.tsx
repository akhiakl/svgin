import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/svgin-react-version', () => ({
    getSvginReactVersion: vi.fn().mockResolvedValue('1.2.3'),
}));

import { VersionBadge, VersionBadgeFallback } from '@/components/version-badge';

describe('VersionBadge', () => {
    it('renders the resolved version', async () => {
        const el = await VersionBadge();
        render(el);
        expect(screen.getByText('svgin-react 1.2.3')).toBeInTheDocument();
    });
});

describe('VersionBadgeFallback', () => {
    it('renders a visually-hidden placeholder with an accessible loading label', () => {
        render(<VersionBadgeFallback />);
        expect(screen.getByText('Loading svgin-react version')).toBeInTheDocument();
        expect(screen.getByText('svgin-react 0.0.0')).toHaveClass('text-transparent');
    });
});
