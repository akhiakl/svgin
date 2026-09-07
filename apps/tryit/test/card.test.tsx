import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardDescription, CardFooter } from '@/components/ui/card';

// Card/CardHeader/CardTitle/CardContent are already exercised (as real
// dependencies, not directly) by inspector-client.test.tsx. CardDescription
// and CardFooter aren't used anywhere in this app today, so nothing else
// covers them.
describe('CardDescription', () => {
    it('renders its children with the description slot', () => {
        render(<CardDescription>A description.</CardDescription>);
        expect(screen.getByText('A description.')).toHaveAttribute('data-slot', 'card-description');
    });
});

describe('CardFooter', () => {
    it('renders its children with the footer slot', () => {
        render(<CardFooter>Footer content</CardFooter>);
        expect(screen.getByText('Footer content')).toHaveAttribute('data-slot', 'card-footer');
    });
});
