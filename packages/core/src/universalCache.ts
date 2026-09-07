/* eslint-disable @typescript-eslint/no-explicit-any */
// Universal cache: uses react/cache if available, else falls back to in-memory cache
type CacheWrapper<T extends (...args: any[]) => any> = (fn: T) => T;
let cacheImpl: CacheWrapper<any> | undefined;

// Assigns a stable id to each distinct function reference seen, so two calls
// with the *same* function (e.g. a memoized sanitizeFn) can still share a
// cache entry, while two calls with *different* functions never collide.
let fnIdCounter = 0;
const fnIds = new WeakMap<object, number>();

// Same idea as fnIds, but for symbols: WeakMap can't key on primitives (a
// symbol is a primitive, not an object), so distinct symbols get their own
// id via a regular Map instead. Symbols aren't used anywhere in this
// library's own call signatures today, but stableKey is a general-purpose
// serializer, so it should not silently mis-key on one just because nothing
// currently passes one in.
// Note: this Map holds a strong reference to every symbol it has seen and
// therefore grows without bound when many distinct symbols are passed as
// arguments. In practice no library code paths pass symbols, so the set
// stays empty; the handling exists purely for correctness of stableKey as a
// general serializer.
let symbolIdCounter = 0;
const symbolIds = new Map<symbol, number>();

/**
 * Serializes call arguments into a cache key that, unlike plain
 * `JSON.stringify`, does not silently drop function-valued or `undefined`
 * properties. `JSON.stringify` turns both `{ sanitizeFn: someFn }` and `{}`
 * into the same `"{}"` string (object properties whose value is a function
 * or `undefined` are omitted), which would let a call using a custom
 * sanitizer collide with, and return the cached result of, an unrelated
 * default-mode call for the same URL. See fetchAndSanitizeSvgBase.ts.
 */
export function stableKey(value: unknown): string {
    if (typeof value === 'function') {
        let id = fnIds.get(value);
        if (id === undefined) {
            id = fnIdCounter++;
            fnIds.set(value, id);
        }
        return `fn#${id}`;
    }
    if (typeof value === 'symbol') {
        // JSON.stringify(someSymbol) returns undefined, not a string - handling
        // this case explicitly (instead of falling through to the JSON.stringify
        // branch below) keeps stableKey's return type an actual string and
        // keeps distinct symbols from silently colliding on the same key.
        let id = symbolIds.get(value);
        if (id === undefined) {
            id = symbolIdCounter++;
            symbolIds.set(value, id);
        }
        return `sym#${id}`;
    }
    if (value === undefined) return 'undefined';
    if (typeof value === 'bigint') return `bigint:${value.toString()}`;
    if (typeof value === 'number') {
        // JSON.stringify(NaN) and JSON.stringify(Infinity/-Infinity) all
        // serialize to "null", which would collide with an actual `null`
        // argument, and JSON.stringify(-0) serializes to the same "0" as a
        // positive zero even though Object.is(-0, 0) is false. Tag all of
        // these explicitly instead of falling through to JSON.stringify.
        if (Number.isNaN(value)) return 'NaN';
        if (value === Infinity) return 'Infinity';
        if (value === -Infinity) return '-Infinity';
        // JSON.stringify(-0) returns "0", which collides with JSON.stringify(0).
        // Tag -0 explicitly so it has a distinct key from 0.
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
            // react/cache is optional (only present in a React Server Components
            // runtime) and has no bundled types; `require` may also be undefined in
            // pure-ESM environments, which throws here too and is handled below.
            // require(...) itself is typed `any` (Node's own NodeRequire
            // signature), so asserting straight to a concrete shape here -
            // rather than reading `.cache` off the `any` result directly -
            // is what the rest of this function actually uses, not an
            // unchecked `any` value.
            // Deliberate require(), not import: this needs to attempt a
            // synchronous, catchable load of an optional module - ESM's
            // static `import` can't fail gracefully like this, and dynamic
            // `import()` is asynchronous, which this synchronous function
            // can't use.
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
                            // If fn returns a promise that rejects (e.g. a failed fetch),
                            // evict it so the next call with the same arguments retries
                            // instead of replaying the same rejection forever.
                            //
                            // A rejection handler is attached here via .then(), not
                            // .catch() on `result` itself: attaching directly to `result`
                            // would mark *that* promise as handled, which would silently
                            // suppress an unhandledrejection warning/crash for a caller
                            // who never awaits or handles the promise this call returns.
                            // Deriving a *new* promise instead, caching and returning that
                            // one, keeps `result` itself untouched, so an ignored rejection
                            // still surfaces as unhandled the normal way, while the derived
                            // promise (cached below) still rethrows after evicting.
                            cached = (result as Promise<unknown>).then(
                                (value) => value,
                                (err) => {
                                    // `cached` is only ever reassigned for this exact key by a
                                    // later call made *after* this entry is deleted (which only
                                    // happens right here, when the promise this handler is
                                    // attached to itself settles) - so by construction
                                    // inMemoryCache.get(key) is always still `cached` at this
                                    // point; the check is a defensive guard against that
                                    // invariant ever changing, not a reachable branch today.
                                    /* v8 ignore next */
                                    if (inMemoryCache.get(key) === cached) {
                                        inMemoryCache.delete(key);
                                    }
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
    // cacheImpl is always assigned above to something truthy (either
    // react/cache's real `cache`, or the in-memory fallback closure) - this
    // is a defensive guard, not a reachable branch (TypeScript's own control
    // flow analysis already proves the condition below is always false,
    // which is exactly why strict-boolean-expressions flags it too).
    /* v8 ignore start */
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!cacheImpl) throw new Error('Universal cache implementation missing');
    /* v8 ignore stop */
    // cacheImpl(fn) is typed any (CacheWrapper<any>'s own return type) -
    // asserting it back to T here is what the caller actually asked for
    // (setUniversalCache<T>(fn: T): T), not an unchecked any escaping.
    return cacheImpl(fn) as T;
}
