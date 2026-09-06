'use client';

import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Sheet(props: React.ComponentProps<typeof Dialog.Root>) {
    return <Dialog.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof Dialog.Trigger>) {
    return <Dialog.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof Dialog.Close>) {
    return <Dialog.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({
    className,
    children,
    side = 'right',
    ...props
}: React.ComponentProps<typeof Dialog.Popup> & { side?: 'top' | 'right' | 'bottom' | 'left' }) {
    return (
        <Dialog.Portal>
            <Dialog.Backdrop
                data-slot="sheet-backdrop"
                className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
            />
            <Dialog.Popup
                data-slot="sheet-content"
                className={cn(
                    'bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition-transform duration-300 ease-in-out',
                    side === 'right' &&
                        'inset-y-0 right-0 h-full w-3/4 border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full sm:max-w-sm',
                    side === 'left' &&
                        'inset-y-0 left-0 h-full w-3/4 border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full sm:max-w-sm',
                    side === 'top' &&
                        'inset-x-0 top-0 h-auto border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full',
                    side === 'bottom' &&
                        'inset-x-0 bottom-0 h-auto border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full',
                    className
                )}
                {...props}
            >
                {children}
                <Dialog.Close className="ring-offset-background focus:ring-ring data-[popup-open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                </Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof Dialog.Title>) {
    return (
        <Dialog.Title data-slot="sheet-title" className={cn('text-foreground font-semibold', className)} {...props} />
    );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
