import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mocked for the same server-only reason as code-block.test.tsx.
vi.mock('@/components/code-block', () => ({
    CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

import { PackageManagerInstall } from '@/components/package-manager-install';
import { PACKAGE_MANAGERS } from '@/lib/package-managers';

describe('PackageManagerInstall', () => {
    it('renders the default (pnpm) install command for the given package list', () => {
        render(<PackageManagerInstall packages="svgin-react" />);
        const pnpm = PACKAGE_MANAGERS.find((pm) => pm.id === 'pnpm')!;
        expect(screen.getByText(`${pnpm.command} svgin-react`)).toBeInTheDocument();
    });
});
