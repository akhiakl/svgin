import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Separate from inspector-client.test.tsx on purpose: that file deliberately
// exercises the real svgin-react/client + DOMPurify pipeline (see its own
// comment). DOMPurify itself never actually throws for malformed markup, so
// there is no real-world input that reaches InspectorClient's own onError
// handler through genuine sanitization - it's defensive code for a
// synchronous-render failure. Mocked here so that handler's own behavior
// (clearing sanitizedHtml, rendering the "Failed to render" message) is
// still covered by a real test, not left untested because the real
// dependency can't trigger it.
vi.mock('svgin-react/client', () => ({
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
