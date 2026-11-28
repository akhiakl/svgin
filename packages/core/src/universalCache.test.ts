import { describe, expect, it, vi } from 'vitest';
import { setUniversalCache } from './universalCache';

// No react/cache in Node, so these exercise the in-memory fallback.
describe('setUniversalCache (fallback in-memory cache)', () => {
    it('memoizes calls with identical primitive arguments', () => {
        const impl = vi.fn((n: number) => n * 2);
        const cached = setUniversalCache(impl);

        expect(cached(2)).toBe(4);
        expect(cached(2)).toBe(4);
        expect(impl).toHaveBeenCalledTimes(1);
    });

    it('does not memoize calls with different primitive arguments', () => {
        const impl = vi.fn((n: number) => n * 2);
        const cached = setUniversalCache(impl);

        expect(cached(2)).toBe(4);
        expect(cached(3)).toBe(6);
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('does not collide a function-valued option with an equivalent-looking plain object', () => {
        const impl = vi.fn((_url: string, options: { sanitizeFn?: () => void }) =>
            options.sanitizeFn ? 'custom' : 'default'
        );
        const cached = setUniversalCache(impl);
        const sanitizeFn = () => {};

        // JSON.stringify(['url', { sanitizeFn }]) === JSON.stringify(['url', {}])
        // because JSON.stringify drops function-valued properties. Both calls
        // below must be treated as distinct.
        expect(cached('url', { sanitizeFn })).toBe('custom');
        expect(cached('url', {})).toBe('default');
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('treats two different function references as different cache entries', () => {
        const impl = vi.fn((_url: string, options: { sanitizeFn: () => string }) =>
            options.sanitizeFn()
        );
        const cached = setUniversalCache(impl);
        const fnA = () => 'a';
        const fnB = () => 'b';

        expect(cached('url', { sanitizeFn: fnA })).toBe('a');
        expect(cached('url', { sanitizeFn: fnB })).toBe('b');
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('reuses the cache entry when the same function reference is passed again', () => {
        const impl = vi.fn((_url: string, options: { sanitizeFn: () => string }) =>
            options.sanitizeFn()
        );
        const cached = setUniversalCache(impl);
        const sanitizeFn = () => 'result';

        expect(cached('url', { sanitizeFn })).toBe('result');
        expect(cached('url', { sanitizeFn })).toBe('result');
        expect(impl).toHaveBeenCalledTimes(1);
    });

    it('does not collide NaN, Infinity, or -Infinity with null or each other', () => {
        // JSON.stringify(NaN), JSON.stringify(Infinity), JSON.stringify(-Infinity),
        // and JSON.stringify(null) all produce the same string, "null".
        const impl = vi.fn((n: unknown) => String(n));
        const cached = setUniversalCache(impl);

        expect(cached(NaN)).toBe('NaN');
        expect(cached(Infinity)).toBe('Infinity');
        expect(cached(-Infinity)).toBe('-Infinity');
        expect(cached(null)).toBe('null');
        expect(impl).toHaveBeenCalledTimes(4);
    });

    it('handles a bigint argument instead of throwing', () => {
        // JSON.stringify(1n) throws "Do not know how to serialize a BigInt".
        const impl = vi.fn((n: bigint) => n.toString());
        const cached = setUniversalCache(impl);

        expect(() => cached(1n)).not.toThrow();
        expect(cached(1n)).toBe('1');
        expect(cached(2n)).toBe('2');
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('does not collide -0 with 0', () => {
        // JSON.stringify(-0) === JSON.stringify(0) === "0", even though
        // Object.is(-0, 0) is false and code can observe the difference
        // (e.g. 1 / -0 === -Infinity).
        const impl = vi.fn((n: number) => 1 / n);
        const cached = setUniversalCache(impl);

        expect(cached(-0)).toBe(-Infinity);
        expect(cached(0)).toBe(Infinity);
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('evicts a rejected promise so the next call retries instead of replaying the rejection', async () => {
        let attempt = 0;
        const impl = vi.fn((url: string): Promise<string> => {
            attempt += 1;
            if (attempt === 1) return Promise.reject(new Error(`network error: ${url}`));
            return Promise.resolve('ok');
        });
        const cached = setUniversalCache(impl);

        await expect(cached('url')).rejects.toThrow('network error');
        await expect(cached('url')).resolves.toBe('ok');
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('does not wrap a synchronous return value in a Promise', () => {
        // Regression test for a review finding: the eviction logic must only
        // wrap an actual thenable, not allocate a Promise for every call
        // regardless of what fn returns.
        const impl = vi.fn((n: number) => n * 2);
        const cached = setUniversalCache(impl);

        const result = cached(2);
        expect(result).toBe(4);
        expect(result).not.toHaveProperty('then');
    });

    it('does not expose the raw promise returned by fn, so an ignored rejection can still surface as unhandled', async () => {
        // fn's own promise gets a handler internally; the caller must get a different one.
        let rawPromise: Promise<string> | undefined;
        const impl = vi.fn((): Promise<string> => {
            rawPromise = Promise.reject(new Error('boom'));
            return rawPromise;
        });
        const cached = setUniversalCache(impl);

        const returned = cached();
        expect(returned).not.toBe(rawPromise);
        await expect(returned).rejects.toThrow('boom');
    });

    it('keeps memoizing a resolved promise across repeated calls', async () => {
        const impl = vi.fn(async (n: number) => n * 2);
        const cached = setUniversalCache(impl);

        await expect(cached(2)).resolves.toBe(4);
        await expect(cached(2)).resolves.toBe(4);
        expect(impl).toHaveBeenCalledTimes(1);
    });

    it('removes a rejected promise from the cache so the next call retries', async () => {
        let callCount = 0;
        const impl = vi.fn(async () => {
            callCount++;
            if (callCount === 1) throw new Error('first call fails');
            return 'success on retry';
        });
        const cached = setUniversalCache(impl);

        // First call rejects; the rejection should be removed from the cache.
        await expect(cached()).rejects.toThrow('first call fails');
        // Flush the microtask that deletes the cache entry.
        await new Promise(r => setTimeout(r, 0));
        // Second call must retry the underlying function, not return the cached rejection.
        const result = await cached();
        expect(result).toBe('success on retry');
        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('shares a single underlying call between two concurrent (unawaited) calls with the same key', async () => {
        let resolve!: (v: string) => void;
        const impl = vi.fn((key: string) => { void key; return new Promise<string>(r => { resolve = r; }); });
        const cached = setUniversalCache(impl);

        const first = cached('same-key');
        const second = cached('same-key');
        expect(impl).toHaveBeenCalledTimes(1);

        resolve('shared result');
        await expect(first).resolves.toBe('shared result');
        await expect(second).resolves.toBe('shared result');
    });

    it('does not collide -0 with 0 in the cache key', () => {
        const impl = vi.fn((n: number) => (1 / n === Infinity ? 'positive-zero' : 'negative-zero'));
        const cached = setUniversalCache(impl);

        expect(cached(0)).toBe('positive-zero');
        expect(cached(-0)).toBe('negative-zero');
        expect(impl).toHaveBeenCalledTimes(2);
    });
});
