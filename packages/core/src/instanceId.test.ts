import { describe, expect, it } from 'vitest';
import { nextInstanceId } from './instanceId';

describe('nextInstanceId', () => {
    it('returns a string', () => {
        expect(typeof nextInstanceId()).toBe('string');
    });

    it('returns a different value on each call', () => {
        const a = nextInstanceId();
        const b = nextInstanceId();
        expect(a).not.toBe(b);
    });
});
