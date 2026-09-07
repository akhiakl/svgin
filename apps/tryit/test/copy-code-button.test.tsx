import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyCodeButton } from '@/components/copy-code-button';

// userEvent.setup() installs its own navigator.clipboard stub (jsdom itself
// has none) - spy on *that* object's writeText rather than replacing
// navigator/navigator.clipboard wholesale, which userEvent.setup() would
// silently clobber if called afterwards anyway.
function setupWithClipboardSpy() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    return { user, writeText };
}

describe('CopyCodeButton', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('copies the code to the clipboard and shows "Copied" until the timeout resets it', async () => {
        const { user, writeText } = setupWithClipboardSpy();
        writeText.mockResolvedValue(undefined);

        render(<CopyCodeButton code="const x = 1;" />);
        await user.click(screen.getByRole('button', { name: 'Copy code' }));

        expect(writeText).toHaveBeenCalledWith('const x = 1;');
        expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();

        await act(async () => {
            vi.advanceTimersByTime(1500);
        });
        expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    });

    it('leaves the label as "Copy code" when the clipboard write rejects', async () => {
        const { user, writeText } = setupWithClipboardSpy();
        writeText.mockRejectedValue(new Error('denied'));

        render(<CopyCodeButton code="const x = 1;" />);
        await user.click(screen.getByRole('button', { name: 'Copy code' }));

        expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    });

    it('clears the pending reset timeout on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
        const { unmount } = render(<CopyCodeButton code="const x = 1;" />);
        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});
