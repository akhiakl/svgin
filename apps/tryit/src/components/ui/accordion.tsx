'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
    return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('border-b last:border-b-0', className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    'flex flex-1 items-center justify-between gap-4 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground [&[data-panel-open]>svg]:rotate-180',
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionPanel({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
    return (
        <AccordionPrimitive.Panel
            data-slot="accordion-panel"
            className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
            {...props}
        >
            <div className={cn('pb-3', className)}>{children}</div>
        </AccordionPrimitive.Panel>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel };
