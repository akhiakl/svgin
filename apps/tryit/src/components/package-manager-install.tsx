import type { ReactNode } from 'react';
import { CodeBlock } from '@/components/code-block';
import { PackageManagerInstallTabs } from '@/components/package-manager-install-tabs';
import { PACKAGE_MANAGERS, type PackageManagerId } from '@/lib/package-managers';

export function PackageManagerInstall({ packages, className }: { packages: string; className?: string }) {
    const panels = Object.fromEntries(
        PACKAGE_MANAGERS.map((pm) => [pm.id, <CodeBlock key={pm.id} lang="bash" code={`${pm.command} ${packages}`} />]),
    ) as Record<PackageManagerId, ReactNode>;

    return <PackageManagerInstallTabs panels={panels} className={className} />;
}
