import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ElementRawClient } from '@/components/element-raw-client';

describe('ElementRawClient', () => {
    it('renders the raw svg markup directly, with no fetch', async () => {
        const { container } = render(<ElementRawClient />);
        await waitFor(() => expect(container.querySelector('svg-in svg path')).not.toBeNull());
        expect(container).toHaveTextContent('Rendered instantly');
    });
});
