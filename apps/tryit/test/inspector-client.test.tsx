import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InspectorClient } from '@/components/inspector-client';

// Real @svgin/react/client and DOMPurify, no mocks.
describe('InspectorClient', () => {
    it('renders the clean example and reports nothing removed', async () => {
        render(<InspectorClient />);
        await waitFor(() => expect(screen.getByText('Nothing removed')).toBeInTheDocument());
    });

    it('strips the malicious example\'s script/onclick/onload and reports what was removed', async () => {
        const user = userEvent.setup();
        render(<InspectorClient />);

        await user.click(screen.getByRole('button', { name: 'Malicious' }));

        await waitFor(() => expect(screen.getByText('<script>')).toBeInTheDocument());
        expect(screen.getByText('onclick')).toBeInTheDocument();
        expect(screen.getByText('onload')).toBeInTheDocument();

        const output = document.querySelector('svg');
        expect(output).not.toBeNull();
        expect(output?.outerHTML).not.toContain('onclick');
        expect(output?.outerHTML).not.toContain('script');
    });

    it('re-sanitizes edited markup when Sanitize is clicked', async () => {
        const user = userEvent.setup();
        render(<InspectorClient />);
        await waitFor(() => expect(screen.getByText('Nothing removed')).toBeInTheDocument());

        const textarea = screen.getByLabelText('Raw SVG input');
        await user.clear(textarea);
        await user.type(textarea, '<svg><rect onclick="evil()" width="1" height="1" /></svg>');
        await user.click(screen.getByRole('button', { name: 'Sanitize' }));

        await waitFor(() => expect(screen.getByText('onclick')).toBeInTheDocument());
    });
});
