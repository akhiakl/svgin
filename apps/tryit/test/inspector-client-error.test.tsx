import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// DOMPurify never throws, so mock it to cover the onError path.
vi.mock('@svgin/react/client', () => ({
    SvgIn: ({ onError }: { onError: (error: Error) => void }) => {
        onError(new Error('boom'));
        return null;
    },
}));

import { InspectorClient } from '@/components/inspector-client';

describe('InspectorClient (error path)', () => {
    it('shows the failure message and clears any previously sanitized markup when onError fires', () => {
        render(<InspectorClient />);
        expect(screen.getByText('Failed to render: boom')).toBeInTheDocument();
        expect(screen.queryByText('Sanitized markup')).not.toBeInTheDocument();
    });
});
