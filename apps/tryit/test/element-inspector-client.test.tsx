import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ElementInspectorClient } from '@/components/element-inspector-client';

describe('ElementInspectorClient', () => {
    it('sanitizes the default card but leaves the disable-sanitization card intact', async () => {
        const { container } = render(<ElementInspectorClient />);
        await waitFor(() => expect(container.querySelectorAll('svg-in svg').length).toBe(2));

        const [sanitized, raw] = Array.from(container.querySelectorAll('svg-in'));
        expect(sanitized.querySelector('svg script')).toBeNull();
        expect(sanitized.querySelector('svg')).not.toHaveAttribute('onload');

        expect(raw.querySelector('svg script')).not.toBeNull();
        expect(raw.querySelector('svg')).toHaveAttribute('onload');
    });
});
