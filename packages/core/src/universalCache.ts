/* eslint-disable @typescript-eslint/no-explicit-any */
// Uses react/cache when available (RSC), otherwise an in-memory memoizer.
type CacheWrapper<T extends (...args: any[]) => any> = (fn: T) => T;
let cacheImpl: CacheWrapper<any> | undefined;

// Per-function ids, so distinct sanitizeFns never share a key.
let fnIdCounter = 0;
const fnIds = new WeakMap<object, number>();

// Unlike JSON.stringify, keeps functions and undefined (which it drops) and NaN/±Infinity/-0
// (which it turns into "null"/"0"). Otherwise a custom-sanitizer call could hit a default-mode entry.
export function stableKey(value: unknown): string {
    if (typeof value === 'function') {
        let id = fnIds.get(value);
        if (id === undefined) {
            id = fnIdCounter++;
            fnIds.set(value, id);
        }
        return `fn#${id}`;
    }
    if (value === undefined) return 'undefined';
    if (typeof value === 'bigint') return `bigint:${value.toString()}`;
    if (typeof value === 'number') {
        if (Number.isNaN(value)) return 'NaN';
        if (value === Infinity) return 'Infinity';
        if (value === -Infinity) return '-Infinity';
        if (Object.is(value, -0)) return '-0';
        return JSON.stringify(value);
    }
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableKey).join(',')}]`;
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableKey((value as Record<string, unknown>)[k])}`).join(',')}}`;
}

export function setUniversalCache<T extends (...args: any[]) => any>(fn: T): T {
    if (cacheImpl === undefined) {
        try {
            // Sync, catchable require of an optional module; throws in pure ESM too.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const reactCache = require('react/cache') as { cache: CacheWrapper<any> };
            cacheImpl = reactCache.cache;
        } catch {
            cacheImpl = (<F extends (...args: any[]) => any>(fn: F) => {
                const inMemoryCache = new Map<string, ReturnType<F>>();
                return ((...args: Parameters<F>): ReturnType<F> => {
                    const key = stableKey(args);
                    if (!inMemoryCache.has(key)) {
                        const result = fn(...args) as ReturnType<F>;
                        let cached: ReturnType<F>;
                        if (Boolean(result) && typeof (result as PromiseLike<unknown>).then === 'function') {
                            // Evict rejections so the next call retries. A derived promise, not
                            // .catch() on `result`, so an ignored rejection still surfaces as unhandled.
                            cached = (result as Promise<unknown>).then(
                                (value) => value,
                                (err) => {
                                    inMemoryCache.delete(key);
                                    throw err;
                                }
                            ) as ReturnType<F>;
                        } else {
                            cached = result;
                        }
                        inMemoryCache.set(key, cached);
                    }
                    return inMemoryCache.get(key)!;
                }) as F;
            }) as CacheWrapper<any>;
        }
    }
    return cacheImpl(fn) as T;
}
