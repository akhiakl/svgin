import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/components/error-boundary';

function Boom(): never {
    throw new Error('boom');
}

describe('ErrorBoundary', () => {
    it('renders children when nothing throws', () => {
        render(
            <ErrorBoundary fallback={() => <p>fallback</p>}>
                <p>ok</p>
            </ErrorBoundary>
        );
        expect(screen.getByText('ok')).toBeInTheDocument();
    });

    it('renders the fallback with the caught error when a child throws', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(
            <ErrorBoundary fallback={(error) => <p>caught: {error.message}</p>}>
                <Boom />
            </ErrorBoundary>
        );
        expect(screen.getByText('caught: boom')).toBeInTheDocument();
        spy.mockRestore();
    });

    it('reset() clears the error and re-renders children', async () => {
        const user = userEvent.setup();
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        let shouldThrow = true;

        function MaybeThrow() {
            if (shouldThrow) throw new Error('boom');
            return <p>recovered</p>;
        }

        render(
            <ErrorBoundary
                fallback={(error, reset) => (
                    <button
                        onClick={() => {
                            shouldThrow = false;
                            reset();
                        }}
                    >
                        retry after {error.message}
                    </button>
                )}
            >
                <MaybeThrow />
            </ErrorBoundary>
        );

        await user.click(screen.getByRole('button'));
        expect(screen.getByText('recovered')).toBeInTheDocument();
        spy.mockRestore();
    });
});
