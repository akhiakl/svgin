import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// CodeBlock depends on bright, which transitively imports the `server-only`
// package - see test/code-block.test.tsx's own comment for why that throws
// under vitest. Mocked the same way here so PackageManagerInstall's own
// per-package-manager wiring (one CodeBlock per manager, handed to the tabs)
// is what's under test, not bright's rendering.
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
