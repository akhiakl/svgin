import { describe, expect, it } from 'vitest';
import { placeholder } from './index.js';

describe('svgin-core', () => {
    it('exports a placeholder', () => {
        expect(placeholder).toBeDefined();
    });
});
