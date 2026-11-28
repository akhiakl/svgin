'use client';

import { useState, type ReactNode } from 'react';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { PACKAGE_MANAGERS, type PackageManagerId } from '@/lib/package-managers';

// Tabs only: the server renders each <CodeBlock> (Bright is server-only) and passes it in.
export function PackageManagerInstallTabs({
    panels,
    className,
}: {
    panels: Record<PackageManagerId, ReactNode>;
    className?: string;
}) {
    const [manager, setManager] = useState<PackageManagerId>('pnpm');

    return (
        <Tabs value={manager} onValueChange={(value) => setManager(value as PackageManagerId)} className={className}>
            <TabsList aria-label="Package manager">
                {PACKAGE_MANAGERS.map((pm) => (
                    <TabsTab key={pm.id} value={pm.id}>
                        {pm.label}
                    </TabsTab>
                ))}
            </TabsList>
            {PACKAGE_MANAGERS.map((pm) => (
                <TabsPanel key={pm.id} value={pm.id}>
                    {panels[pm.id]}
                </TabsPanel>
            ))}
        </Tabs>
    );
}
