/**
 * Returns a function that lazily creates a value via `loader` on its first
 * call, caching the resulting promise so every later call reuses the same
 * in-flight/resolved promise instead of re-running `loader`. Shared by
 * sanitizeClient and sanitizeServer's DOMPurify (and, for the server, jsdom)
 * lazy-init - both need "create once, on first real use, and reuse
 * thereafter", with nothing else about the two in common.
 */
export function lazySingleton<T>(loader: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | undefined;
    return () => {
        if (!promise) promise = loader();
        return promise;
    };
}
