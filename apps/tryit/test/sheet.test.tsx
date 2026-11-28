import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// The app only uses side="left"; cover the rest of the mapping here.
describe.each(['top', 'right', 'bottom'] as const)('SheetContent side="%s"', (side) => {
    it(`applies the ${side} positioning classes`, async () => {
        render(
            <Sheet defaultOpen>
                <SheetTrigger render={<button type="button">open</button>} />
                <SheetContent side={side}>content</SheetContent>
            </Sheet>
        );
        expect(await screen.findByText('content')).toBeInTheDocument();
    });
});
