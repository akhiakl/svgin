import { describe, expect, it } from 'vitest';
import { placeholder } from './index.js';

describe('svgin-element', () => {
    it('exports a placeholder', () => {
        expect(placeholder).toBeDefined();
    });
});
