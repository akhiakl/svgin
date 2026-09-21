import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DemoGrid } from '@/components/demo-grid';

const DEMOS = [
    { href: '/one', title: 'One', badge: 'Client', description: 'First demo.' },
    { href: '/two', title: 'Two', badge: 'RSC', description: 'Second demo.' },
];

describe('DemoGrid', () => {
    it('renders a card per demo, each linking to its own route', () => {
        render(<DemoGrid demos={DEMOS} />);
        for (const demo of DEMOS) {
            const link = document.querySelector<HTMLAnchorElement>(`a[href="${demo.href}"]`);
            expect(link).not.toBeNull();
            expect(link).toHaveTextContent(demo.title);
            expect(link).toHaveTextContent(demo.description);
        }
    });

    it('gives an RSC-badged demo the primary badge variant, others secondary', () => {
        render(<DemoGrid demos={DEMOS} />);
        expect(screen.getByText('Client').className).toContain('secondary');
        expect(screen.getByText('RSC').className).not.toContain('secondary');
    });
});
