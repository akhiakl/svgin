import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// SheetContent's `side` prop only ever gets 'left' in this app today
// (site-nav.tsx's mobile drawer) - the other three are exercised directly
// here so the primitive's own side-to-class mapping is a real, covered
// correctness concern of this shared component, not dead code.
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
