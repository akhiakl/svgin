import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { PackageManagerInstallTabs } from '@/components/package-manager-install-tabs';
import { PACKAGE_MANAGERS, type PackageManagerId } from '@/lib/package-managers';

describe('PackageManagerInstallTabs', () => {
    // Same cast the real production code (package-manager-install.tsx) uses
    // for the same Object.fromEntries call - fromEntries only ever infers a
    // generic string-keyed record, not the exact PackageManagerId union.
    const panels = Object.fromEntries(
        PACKAGE_MANAGERS.map((pm) => [pm.id, <span key={pm.id}>{pm.id} panel</span>])
    ) as Record<PackageManagerId, ReactNode>;

    it('defaults to the pnpm tab/panel', () => {
        render(<PackageManagerInstallTabs panels={panels} />);
        expect(screen.getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('pnpm panel')).toBeVisible();
    });

    it('switches panel when a different tab is clicked', async () => {
        const user = userEvent.setup();
        render(<PackageManagerInstallTabs panels={panels} />);
        await user.click(screen.getByRole('tab', { name: 'yarn' }));
        expect(screen.getByRole('tab', { name: 'yarn' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('yarn panel')).toBeVisible();
    });
});
